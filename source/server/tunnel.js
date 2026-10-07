'use strict';
// Keeps a free Cloudflare quick tunnel open to the SteamLite server and tells the app where it is.
// Quick tunnels get a new https://<random>.trycloudflare.com address every time they start, so when the address
// changes this script writes it to online.json in the SteamLite GitHub repository (with the GitHub login already on
// this PC, through the "gh" tool). The app reads that file, so players find the new address on their own.

const { spawn, execFile } = require('child_process'), fs = require('fs'), path = require('path');
const ROOT = __dirname, DATA = path.join(ROOT, 'data');
fs.mkdirSync(DATA, { recursive: true });
const LOG = path.join(DATA, 'tunnel.log');
const log = (m) => { try { if (fs.existsSync(LOG) && fs.statSync(LOG).size > 500000) fs.renameSync(LOG, LOG + '.old'); fs.appendFileSync(LOG, new Date().toISOString() + ' ' + m + '\n'); } catch (e) { } };
const CFG = (() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'config.json'), 'utf8')); } catch (e) { return {}; } })();
const PORT = CFG.port || 8787, REPO = CFG.repo || 'imnotfisy/SteamLite', FILE = 'online.json';
const CLOUDFLARED = path.join(ROOT, 'cloudflared.exe');
const GH = ['C:\\Program Files\\GitHub CLI\\gh.exe', 'gh'].find(p => p === 'gh' || fs.existsSync(p));
const URL_RX = /https:\/\/[a-z0-9-]+\.trycloudflare\.com/i;

function gh(args, input) {
    return new Promise((resolve, reject) => {
        const p = execFile(GH, args, { timeout: 30000, maxBuffer: 1 << 20, windowsHide: true }, (err, out, errOut) => err ? reject(new Error((errOut || err.message).toString().slice(0, 300))) : resolve(out.toString()));
        if (input) { p.stdin.write(input); p.stdin.end(); }
    });
}
let published = '', lastTry = 0;
async function publish(url) {
    if (url === published) return;
    try {
        let sha = '', cur = '';
        try { const meta = JSON.parse(await gh(['api', 'repos/' + REPO + '/contents/' + FILE])); sha = meta.sha; cur = JSON.parse(Buffer.from(meta.content, 'base64').toString('utf8')).url || ''; } catch (e) { }
        if (cur === url) { published = url; log('online.json already has ' + url); return; }
        const body = JSON.stringify({ message: 'SteamLite Online: new server address', content: Buffer.from(JSON.stringify({ url }, null, 2) + '\n').toString('base64'), sha: sha || undefined, branch: 'main' });
        const tmp = path.join(DATA, 'put.json'); fs.writeFileSync(tmp, body);
        await gh(['api', '-X', 'PUT', 'repos/' + REPO + '/contents/' + FILE, '--input', tmp]);
        published = url; log('published ' + url + ' to ' + FILE);
    } catch (e) { log('could not publish the address: ' + e.message); setTimeout(() => publish(url), 60000); }
}

let child = null, delay = 3000;
function start() {
    if (!fs.existsSync(CLOUDFLARED)) { log('cloudflared.exe is missing'); setTimeout(start, 60000); return; }
    log('starting the tunnel');
    child = spawn(CLOUDFLARED, ['tunnel', '--url', 'http://127.0.0.1:' + PORT, '--no-autoupdate', '--metrics', '127.0.0.1:0'], { windowsHide: true });
    let seen = false;
    const onData = (d) => { const t = d.toString(); const m = URL_RX.exec(t); if (m && !seen) { seen = true; delay = 3000; log('tunnel address: ' + m[0]); fs.writeFileSync(path.join(DATA, 'tunnel-url.txt'), m[0]); publish(m[0]); } };
    child.stdout.on('data', onData); child.stderr.on('data', onData);
    child.on('exit', (code) => { log('tunnel stopped (' + code + ')'); child = null; setTimeout(start, delay); delay = Math.min(delay * 2, 120000); });
}
process.on('SIGTERM', () => { try { child && child.kill(); } catch (e) { } process.exit(0); });
process.on('exit', () => { try { child && child.kill(); } catch (e) { } });
process.on('uncaughtException', (e) => log('uncaught: ' + (e && e.stack || e)));
// only one copy at a time: a second one exits at once
require('net').createServer().on('error', () => { log('already running'); process.exit(0); }).listen(47871, '127.0.0.1', () => start());
