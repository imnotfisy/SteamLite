'use strict';
// Finding, downloading and installing a new SteamLite. Versions are year.month (26.11), with a patch number when needed (26.11.1).
const https = require('https'), http = require('http'), fs = require('fs'), os = require('os'), path = require('path'), { spawn } = require('child_process');
const steam = require('./steam');

const REPO = 'imnotfisy/SteamLite';
// numeric, part by part: 26.11 equals 26.11.0, and 26.11.1 is newer than both
function compare(a, b) {
  const nums = (v) => String(v).replace(/[.-]?beta.*$/i, '').split('.').map((n) => parseInt(n, 10) || 0);
  const x = nums(a), y = nums(b), ba0 = /beta/i.test(a), bb0 = /beta/i.test(b);
  // The betas 26.11.1 to 26.11.5 came before the stable 26.11, so the stable release is newer than all of them. A beta numbered 26.11.6 or higher came after it.
  if (ba0 !== bb0 && x[0] === y[0] && (x[1] || 0) === (y[1] || 0)) {
    const betaPatch = ba0 ? (x[2] || 0) : (y[2] || 0), finalPatch = ba0 ? (y[2] || 0) : (x[2] || 0), betaIsNewer = betaPatch > 5 && betaPatch > finalPatch;
    return ba0 ? (betaIsNewer ? 1 : -1) : (betaIsNewer ? -1 : 1);
  }
  for (let i = 0; i < Math.max(x.length, y.length, 3); i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0) ? 1 : -1; }
  const ba = /beta/i.test(a), bb = /beta/i.test(b);
  return ba === bb ? 0 : ba ? -1 : 1;     // the final release is newer than its beta
}

let info = null, installer = null;
// one manifest from the repository (the raw file, then the GitHub API as a fallback)
async function manifest(file) {
  for (const u of [`https://raw.githubusercontent.com/${REPO}/refs/heads/main/${file}`, `https://api.github.com/repos/${REPO}/contents/${file}?ref=main`]) {
    try { return await steam.getJson(u, { cache: false, headers: u.includes('api.github') ? { Accept: 'application/vnd.github.raw+json' } : {} }); } catch (e) { }
  }
  return null;
}
// A beta build looks at both lists: the beta one (version-beta.json) and the final one (version.json), and takes the newer of the two,
// so a beta is offered the next beta and also the final release. A normal build only looks at version.json.
async function check(version, channel) {
  if (process.env.SL_MOCK === '1' && process.env.SL_UPDATE_TEST) { const d = JSON.parse(fs.readFileSync(process.env.SL_UPDATE_TEST, 'utf8')); info = { version: d.version, url: '', notes: d.notes || '' }; return { ok: true, available: true, version: info.version, notes: info.notes }; }   // (test mode only)
  const beta = channel ? channel === 'beta' : /beta/i.test(version);
  const lists = await Promise.all((beta ? ['version-beta.json', 'version.json'] : ['version.json']).map((f) => manifest(process.platform === 'win32' ? f : f.replace('version', 'version-linux'))));
  if (lists.every((d) => !d)) return { ok: false, error: 'Could not reach the update server.' };
  let best = null;
  for (const d of lists) if (d && d.version && compare(String(d.version), version) > 0 && (!best || compare(String(d.version), String(best.version)) > 0)) best = d;
  if (best) { info = { version: String(best.version), url: String(best.downloadUrl || ''), notes: best.notes || best.changelog || '' }; return { ok: true, available: true, version: info.version, notes: info.notes }; }
  info = null; return { ok: true, available: false };
}

function download(url, dest, onProgress, depth = 0) {
  return new Promise((resolve, reject) => {
    if (depth > 5) return reject(new Error('Too many redirects'));
    (url.startsWith('http://') ? http : https).get(url, { headers: { 'User-Agent': 'SteamLite' }, timeout: 120000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) { res.resume(); return resolve(download(new URL(res.headers.location, url).href, dest, onProgress, depth + 1)); }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error('HTTP ' + res.statusCode)); }
      const total = parseInt(res.headers['content-length'] || '0', 10); let got = 0, last = -1;
      const out = fs.createWriteStream(dest);
      res.on('data', (c) => { got += c.length; if (total) { const p = Math.floor(got / total * 100); if (p !== last) { last = p; onProgress(p); } } });
      res.on('error', reject); out.on('error', reject); out.on('finish', () => resolve(got)); res.pipe(out);
    }).on('error', reject).on('timeout', function () { this.destroy(new Error('Download timed out')); });
  });
}

async function install(onProgress) {
  if (!info) return { ok: false, error: 'There is no update to install.' };
  if (process.platform !== 'win32') return { ok: false, error: 'On Linux, download the new version from https://github.com/imnotfisy/SteamLite/releases and replace the AppImage.' };
  if (process.env.SL_MOCK === '1' && process.env.SL_UPDATE_TEST_EXE) { installer = process.env.SL_UPDATE_TEST_EXE; for (let p = 0; p <= 100; p += 25) { onProgress(p); await new Promise((r) => setTimeout(r, 150)); } return { ok: true }; }   // (test mode only)
  const url = /^https:\/\/github\.com\/.+\.exe$/i.test(info.url) ? info.url : `https://github.com/${REPO}/releases/download/v${info.version}/SteamLite.Setup.${info.version}.exe`;   // the manifest says where the installer is
  const dest = path.join(os.tmpdir(), `SteamLite.Setup.${info.version}.exe`);
  try {
    const size = await download(url, dest, onProgress);
    const head = Buffer.alloc(2); try { const fd = fs.openSync(dest, 'r'); fs.readSync(fd, head, 0, 2, 0); fs.closeSync(fd); } catch (e) { }
    if (size < 20 * 1048576 || head.toString() !== 'MZ') { try { fs.unlinkSync(dest); } catch (e) { } return { ok: false, error: 'The downloaded file looks wrong. Try again.' }; }
    installer = dest; return { ok: true };
  } catch (e) { return { ok: false, error: 'Download failed: ' + e.message }; }
}

// the installer asks for permission (UAC), so it has to be started through the Windows shell, after this app has quit
function runInstaller() {
  if (!installer || !fs.existsSync(installer)) return false;
  // SteamLite quits, then the new Setup window opens by itself, updates where SteamLite is now and opens it again (--update: no questions asked)
  const line = `"ping -n 3 127.0.0.1 >nul & start "" "${installer}" --update"`;
  try { spawn('cmd.exe', ['/d', '/s', '/c', line], { detached: true, stdio: 'ignore', windowsHide: true, windowsVerbatimArguments: true }).unref(); return true; } catch (e) { return false; }
}

const pending = () => (info ? String(info.version).replace(/[.-]?beta.*$/i, '').replace(/\.0$/, '') + (/beta/i.test(String(info.version)) ? '.beta' : '') : '');
module.exports = { compare, check, install, runInstaller, pending };
