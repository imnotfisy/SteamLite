'use strict';
// The library: the games the account owns, the ones installed on this PC, and the ones added by hand ("Non-Steam").
const fs = require('fs'), path = require('path');
const store = require('./store'), steam = require('./steam');

const plat = require('./platform');
// where Steam is, and what it is doing (the same questions on Windows and Linux)
const { steamPath, steamExe, runningAppId, steamRunning } = plat;

// every Steam library folder on this PC (the main one plus any added on other drives)
async function libraryFolders() {
  const main = path.join(await steamPath(), 'steamapps'), all = [main];
  try { for (const m of fs.readFileSync(path.join(main, 'libraryfolders.vdf'), 'utf8').matchAll(/"path"\s+"([^"]+)"/g)) all.push(path.join(m[1].replace(/\\\\/g, '\\'), 'steamapps')); } catch (e) { }
  return [...new Set(all)].filter((p) => fs.existsSync(p));
}
async function installed() {
  const out = {};
  for (const dir of await libraryFolders()) {
    let files = []; try { files = fs.readdirSync(dir); } catch (e) { }
    for (const f of files) {
      if (!/^appmanifest_\d+\.acf$/.test(f)) continue;
      try {
        const t = fs.readFileSync(path.join(dir, f), 'utf8'), v = (k) => { const m = new RegExp('"' + k + '"\\s+"([^"]*)"').exec(t); return m ? m[1] : ''; };
        if (!v('appid') || !v('installdir') || !steam.isGame({ appid: v('appid'), name: v('name') })) continue;
        const flags = Number(v('StateFlags')) || 0, n = (k) => Number(v(k)) || 0;
        // what Steam is doing with this game right now, from its own record: downloading, installing, verifying, paused or waiting
        let activity = '', pct = 0;
        if (flags & 131072) activity = 'verifying';
        else if (flags & (1048576 | 524288)) { activity = 'downloading'; pct = n('BytesToDownload') ? n('BytesDownloaded') / n('BytesToDownload') : 0; }
        else if (flags & (2097152 | 4194304)) { activity = 'installing'; pct = n('BytesToStage') ? n('BytesStaged') / n('BytesToStage') : 0; }
        else if (flags & 512) { activity = 'paused'; pct = n('BytesToDownload') ? n('BytesDownloaded') / n('BytesToDownload') : 0; }
        else if ((flags & (256 | 1024)) || (!(flags & 4) && (flags & 2))) { activity = flags & 4 ? 'updating' : 'waiting'; pct = n('BytesToDownload') ? n('BytesDownloaded') / n('BytesToDownload') : 0; }
        out[v('appid')] = { name: v('name'), installdir: v('installdir'), commonPath: path.join(dir, 'common'), size: Number(v('SizeOnDisk')) || 0, updating: (flags & 4) === 0, activity, pct: Math.max(0, Math.min(1, pct)) };
      } catch (e) { }
    }
  }
  return out;
}

// everything the library page needs in one answer
async function get(opt = {}) {
  // { cached: true } answers at once from the saved copy (no waiting for Steam), so the library shows up as soon as the window does
  const [owned, local] = await Promise.all([opt.cached ? Promise.resolve(steam.ownedGames({ cached: true })).catch(() => null) : steam.ownedGames().catch(() => null), process.env.SL_MOCK === '1' ? {} : installed()]);   // (test mode: only the made-up games)
  const tel = store.get('telemetry', {}), byId = new Map();
  for (const g of owned || []) byId.set(String(g.appid), { id: String(g.appid), name: g.name, steamMinutes: g.playtime_forever || 0, lastPlayed: (g.rtime_last_played || 0) * 1000, owned: true });
  for (const [id, l] of Object.entries(local)) { const g = byId.get(id) || { id, name: l.name, steamMinutes: 0, lastPlayed: 0, owned: false }; Object.assign(g, { installed: true, installdir: l.installdir, commonPath: l.commonPath, size: l.size, activity: l.activity, pct: l.pct }); byId.set(id, g); }
  if (process.env.SL_MOCK === '1') for (const id of ['730', '1245620', '292030', '413150', '367520', '1086940']) { const g = byId.get(id); if (g) Object.assign(g, { installed: true, installdir: 'x', commonPath: 'x', size: 30e9 }); }
  const games = [...byId.values()];
  for (const n of store.get('nonSteamGames', [])) games.push({ id: String(n.appid), name: n.name, nonSteam: true, installed: true, cover: n.cover || '', exePath: n.exePath, steamMinutes: 0, lastPlayed: 0 });
  for (const g of games) { const t = tel[g.id]; g.seconds = t ? t.playtime || 0 : 0; g.launches = t ? t.launches || 0 : 0; if (t && t.lastPlayed) g.lastPlayed = Math.max(g.lastPlayed, t.lastPlayed); }
  games.sort((a, b) => a.name.localeCompare(b.name));
  return { games, cached: !!opt.cached, none: !!opt.cached && owned === null && !games.length, offline: !opt.cached && owned === null, favorites: store.get('favorites', []), hidden: store.get('hiddenGames', []), collections: store.get('collections', {}) };
}

const toggle = (key, id) => { id = String(id); let l = store.get(key, []).map(String); l = l.includes(id) ? l.filter((x) => x !== id) : [...l, id]; store.set(key, l); return l; };

async function storage() {
  const out = [], seen = new Set();
  for (const dir of await libraryFolders()) {
    try { const st = fs.statfsSync(dir), root = path.parse(dir).root.toLowerCase(); if (seen.has(root)) continue; seen.add(root); out.push({ drive: path.parse(dir).root, total: Number(st.blocks) * Number(st.bsize), free: Number(st.bavail) * Number(st.bsize) }); } catch (e) { }
  }
  return out;
}

// games added by hand
function addNonSteam({ name, exe, cover, args }) {
  name = String(name || '').trim(); exe = String(exe || '');
  if (!name || !plat.isProgramFile(exe)) return { ok: false, error: plat.WIN ? 'Pick a game name and its .exe file.' : 'Pick a game name and its program file.' };
  const list = store.get('nonSteamGames', []), appid = 'ns_' + Date.now();
  list.push({ appid, name, cover: cover || '', isNonSteam: true, exePath: exe }); store.set('nonSteamGames', list);
  const cfg = store.get('gameConfigs', {}); cfg[appid] = { args: String(args || ''), exePath: exe }; store.set('gameConfigs', cfg);
  return { ok: true, id: appid };
}
function removeNonSteam(id) { store.set('nonSteamGames', store.get('nonSteamGames', []).filter((n) => n.appid !== id)); return true; }

// games Steam is downloading, installing or updating right now: { id: { a: 'downloading', p: 0.42 } }
async function progress() { const out = {}; for (const [id, l] of Object.entries(await installed())) if (l.activity) out[id] = { a: l.activity, p: l.pct }; return out; }

module.exports = { progress, steamRunning, steamPath, steamExe, runningAppId, installed, get, toggle, storage, addNonSteam, removeNonSteam };
