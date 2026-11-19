'use strict';
// The core: answers the window's questions. Every channel is "area:action"; the window reaches them with sl.call('area:action', ...).
const fs = require('fs'), path = require('path');
const bridge = require('./shim/bridge');
const store = require('./store'), steam = require('./steam'), account = require('./account'), lib = require('./library'), play = require('./play'), update = require('./update');

// "channel": "beta" in core/package.json marks a pre-release build: it is shown as 26.11.beta and counts as older than the final 26.11
const BETA = (() => { try { return require('./package.json').channel === 'beta'; } catch (e) { return false; } })();
// the shell passes its 3-part version (Windows and Cargo need that); a 4-part hotfix number like 26.11.4.1 lives in core/package.json
const VERSION = (() => { const s = process.env.SL_VERSION || '0.0.0'; try { const p = require('./package.json').version; if (p && p.startsWith(s) && /^\d+(\.\d+){2,3}$/.test(p)) return p + (BETA ? '-beta' : ''); } catch (e) { } return s + (BETA ? '-beta' : ''); })();
const display = (v) => String(v).replace(/[.-]?beta.*$/i, '').replace(/\.0$/, '') + (/beta/i.test(String(v)) ? '.beta' : '');   // 26.11.0 is shown as 26.11
const handlers = new Map();
const on = (ch, fn) => handlers.set(ch, fn);
const emit = (ch, ...a) => bridge.emit(ch, a);
const native = (op, ...a) => bridge.native(op, ...a);
const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);

// the small everyday settings (the window reads them with app:boot and changes them with settings:set)
const PREFS = { island: true, startPage: 'home', splash: true, confirmClose: true, reduceMotion: false, artColour: false, animBg: true, gameLite: true, whatsNew: true, theme: 'default', defaultSort: 'recent', notifyStop: false, showAllApps: false, closeToTray: false, startMinimised: false, pauseInGame: false };
const prefs = () => Object.fromEntries(Object.entries(PREFS).map(([k, d]) => [k, store.get('pref.' + k, d)]));
const fmtTime = (sec) => (sec >= 3600 ? Math.floor(sec / 3600) + ' h ' + Math.round((sec % 3600) / 60) + ' min' : Math.max(1, Math.round(sec / 60)) + ' min');
const island = require('./island')({
  play,
  openMain: () => native('restore', 'main').catch(() => { }),
  showUpdateInApp: () => emit('app:showUpdate')
});
play.setEmit((ch, d) => {
  emit(ch, d);
  if (ch === 'game:state') island.onGame(d);
  if (ch === 'game:state' && d.status === 'stopped') tray.sync().catch(() => { });
  if (ch === 'game:state') setTimeout(() => pauser.apply(), 50);
  if (ch === 'game:state' && d.status === 'stopped' && d.seconds >= 60 && store.get('pref.notifyStop', false)) native('notify', { title: 'Session ended', body: (d.name || 'Your game') + ' - played for ' + fmtTime(d.seconds) }).catch(() => { });
});

// ---- start ----
// After an update the window shows what changed. The version that last ran is remembered; it is only reported once, and only for an update (not a downgrade).
function whatChanged() {
  const now = VERSION + (BETA ? '-beta' : ''), prev = store.get('lastVersion', '');
  store.set('lastVersion', now);
  if (!prev || prev === now || !prefs().whatsNew || update.compare(now, prev) <= 0) return null;
  return { from: display(prev), to: display(now), tag: 'v' + now };
}
// what to paste into a bug report: nothing personal (no Steam ID, name, folder or game list)
async function diagnosticsText() {
  const os = require('os'), prof = await steam.listProfiles();
  return [
    'SteamLite ' + display(VERSION) + (BETA ? ' (beta build)' : ''),
    'Update channel: ' + channel(),
    (process.platform === 'win32' ? 'Windows: ' : 'System: ') + (os.version ? os.version() : process.platform) + ' ' + os.release() + ' (' + os.arch() + ')',
    'Signed in: ' + (steam.signedIn() ? 'yes' : 'no') + ', accounts: ' + (((prof || {}).profiles || []).length),
    'Running a game: ' + (play.running() ? 'yes' : 'no'),
    'Theme: ' + prefs().theme + ', reduce motion: ' + (prefs().reduceMotion ? 'on' : 'off'),
    'Time: ' + new Date().toISOString()
  ].join('\n');
}
on('app:diagnostics', () => diagnosticsText());
// copied by the system's own clipboard tool (clip on Windows, wl-copy or xclip on Linux), so the window never asks for clipboard permission
const copyText = (text) => require('./platform').copyText(text);
on('app:copyDiagnostics', async () => copyText(await diagnosticsText()));
on('app:boot', async () => ({
  justUpdated: whatChanged(),
  version: display(VERSION), signedIn: steam.signedIn(), needsSteamLogin: steam.signedIn() && !store.get('steamLoginMigrated'), steamId: steam.current().steamId,
  settings: { ...prefs(), channel: channel(), releaseAvailable: true, autoUpdate: store.get('autoUpdate', true), startWithWindows: !!store.get('startWithWindows', false), lowMemory: !!store.get('lowMemory', false) },
  running: play.running(),
  ui: store.get('ui', {})
}));
// what the window should remember between runs: the last page, the library's sort and filter
on('ui:set', (p) => { const cur = store.get('ui', {}), n = {}; for (const [k, v] of Object.entries(p || {})) if (/^[a-z]{1,12}$/i.test(k) && (typeof v === 'string' && v.length < 60)) n[k] = v; store.set('ui', Object.assign(cur, n)); return true; });
// the window's close button: hides to the tray when that is switched on (play time keeps counting), otherwise quits
on('app:quit', () => { if (store.get('pref.closeToTray', false)) { tray.sync().catch(() => { }); return native('hide', 'main'); } return native('exit'); });
on('app:openUrl', (u) => (/^https:\/\//i.test(String(u)) ? native('openExternal', String(u)) : null));
on('settings:set', (p) => {
  const s = p || {};
  if ('autoUpdate' in s) store.set('autoUpdate', !!s.autoUpdate);
  if ('lowMemory' in s) store.set('lowMemory', !!s.lowMemory);
  if (s.channel === 'beta' || s.channel === 'release') { store.set('updateChannel', s.channel); update.reset && update.reset(); }
  if ('startWithWindows' in s) { store.set('startWithWindows', !!s.startWithWindows); native('autostart', !!s.startWithWindows).catch(() => { }); }
  for (const k of Object.keys(PREFS)) {                                 // the everyday settings: only known names, and only the right kind of value
    if (!(k in s)) continue; const v = s[k];
    if (typeof PREFS[k] === 'boolean') store.set('pref.' + k, !!v);
    else if (k === 'startPage' && ['home', 'library', 'last'].includes(v)) store.set('pref.' + k, v);
    else if (k === 'theme' && ['default', 'purple', 'gta6'].includes(v)) store.set('pref.' + k, v);
    else if (k === 'defaultSort' && ['name', 'played', 'recent', 'installed', 'size'].includes(v)) store.set('pref.' + k, v);
  }
  tray.sync();
  pauser.apply();
  island.refresh();
  return true;
});
on('app:openDataFolder', () => native('openPath', store.userData));
on('app:clearCache', () => { const d = require('path').join(store.userData, 'apicache'); let n = 0; try { for (const f of fs.readdirSync(d)) { fs.unlinkSync(require('path').join(d, f)); n++; } } catch (e) { } return { ok: true, files: n }; });

// ---- accounts ----
on('account:list', () => steam.listProfiles());
// Sign in with Steam (through the SteamLite server). Everyone does this once, even if they were already signed in with a Steam ID and API key.
on('account:steamLogin', (p) => account.loginStart((u) => native('openExternal', u), p && p.keep));
on('account:steamLoginCheck', () => account.loginCheck());
on('account:steamLoginCancel', () => account.loginCancel());
on('account:steamLoginReopen', async () => { const u = await account.reopenUrl(); if (u) await native('openExternal', u); return !!u; });
on('account:saveKey', (p) => account.saveKey(p && p.key));
if (process.env.SL_MOCK === '1') on('account:signIn', ({ steamId, apiKey }) => steam.signIn(steamId, apiKey));   // (test mode only: signing in by typing an ID and key is gone)
on('account:switch', (id) => steam.switchTo(String(id)));
on('account:remove', (id) => steam.removeProfile(String(id)));
on('account:signOut', () => steam.signOut());
on('account:profile', async () => {
  const info = await steam.profileInfo(); if (!info) return null;
  const hist = store.get('sessionHistory', []), tel = store.get('telemetry', {});
  const week = Date.now() - 7 * 864e5, total = Object.values(tel).reduce((a, t) => a + (t.playtime || 0), 0);
  return Object.assign(info, { stats: { totalSeconds: total, weekSeconds: hist.filter((h) => h.start > week).reduce((a, h) => a + h.seconds, 0), sessions: hist.length }, recent: hist.slice(-12).reverse() });
});

// ---- library ----
on('library:get', () => lib.get());
on('library:cached', () => lib.get({ cached: true }));      // the saved copy, at once
on('library:progress', () => lib.progress());               // games Steam is downloading, installing or updating
on('library:favorite', (id) => lib.toggle('favorites', id));
on('library:hide', (id) => lib.toggle('hiddenGames', id));
on('library:collections', (c) => { store.set('collections', c && typeof c === 'object' ? c : {}); return true; });
on('library:storage', () => lib.storage());

// ---- one game ----
on('game:launch', (p) => play.launch(p || {}));
on('game:stop', (id) => play.stop(id));
on('game:steamAction', (p) => { const a = { install: 'install', uninstall: 'uninstall', verify: 'validate' }[p && p.action]; return a && /^\d+$/.test(String(p.id)) ? native('openExternal', `steam://${a}/${p.id}`) : false; });
on('game:openFolder', async (id) => { const g = (await lib.get()).games.find((x) => x.id === String(id)); if (g && g.installdir) { native('openPath', path.join(g.commonPath, g.installdir)); return true; } return false; });
on('game:config', (id) => store.get('gameConfigs', {})[String(id)] || { args: '', exePath: '', admin: false });
on('game:saveConfig', ({ id, args, exePath, admin }) => { const c = store.get('gameConfigs', {}); c[String(id)] = Object.assign(c[String(id)] || {}, { args: String(args || ''), exePath: String(exePath || ''), admin: !!admin }); store.set('gameConfigs', c); return true; });
on('game:achievements', (id) => steam.achievements(String(id)));
on('game:news', (id) => steam.news(String(id), 6, 4000));
on('game:notes', (id) => store.get('gameNotes', {})[String(id)] || '');
on('game:saveNotes', ({ id, text }) => { const n = store.get('gameNotes', {}); n[String(id)] = String(text || '').slice(0, 20000); store.set('gameNotes', n); return true; });
on('game:screenshots', async (id) => {
  try {
    const dir = path.join(await lib.steamPath(), 'userdata', String(BigInt(steam.current().steamId) - 76561197960265728n), '760', 'remote', String(id), 'screenshots');
    return fs.readdirSync(dir).filter((f) => /\.(jpe?g|png)$/i.test(f)).map((f) => ({ f, t: fs.statSync(path.join(dir, f)).mtimeMs })).sort((a, b) => b.t - a.t).slice(0, 24).map((x) => path.join(dir, x.f));
  } catch (e) { return []; }
});

// ---- games added by hand ----
on('nonsteam:add', (p) => lib.addNonSteam(p || {}));
on('nonsteam:remove', (id) => lib.removeNonSteam(String(id)));
on('dialog:exe', async () => { const r = await native('dialogOpen', { title: 'Choose the game file', properties: ['openFile'], filters: [{ name: 'Programs', extensions: ['exe'] }] }); return (r && r[0]) || null; });

// ---- news ----
const feedCache = { at: 0, items: [] };
on('news:feed', async () => {
  if (Date.now() - feedCache.at < 20 * 60 * 1000) return feedCache.items;
  const g = (await lib.get()).games.filter((x) => !x.nonSteam && /^\d+$/.test(x.id));
  const pick = g.sort((a, b) => (b.seconds + b.steamMinutes * 60) - (a.seconds + a.steamMinutes * 60)).slice(0, 12);
  const items = (await Promise.all(pick.map((x) => steam.news(x.id, 2, 500).then((n) => n.map((i) => Object.assign(i, { game: x.name })))))).flat().sort((a, b) => b.date - a.date).slice(0, 40);
  feedCache.at = Date.now(); feedCache.items = items; return items;
});
// News as Markdown: news/index.json lists the posts (newest first), and each post is news/<id>.md. Older versions read news.json instead (still published).
const NEWS_BASE = 'https://raw.githubusercontent.com/imnotfisy/SteamLite/main/';
async function newsText(rel) {
  if (process.env.SL_MOCK === '1' && process.env.SL_NEWS_DIR) return fs.readFileSync(path.join(process.env.SL_NEWS_DIR, rel), 'utf8');
  const r = await fetch(NEWS_BASE + rel + '?t=' + Math.floor(Date.now() / 60000), { signal: AbortSignal.timeout(8000), headers: { 'User-Agent': 'SteamLite' } });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.text();
}
on('news:list', async () => {
  try {
    const d = JSON.parse(await newsText('news/index.json'));
    return { posts: (Array.isArray(d.posts) ? d.posts : []).filter((p) => p && /^[\w.-]+$/.test(String(p.id || '')) && p.title && p.date).slice(0, 200) };
  } catch (e) { return { posts: [], failed: true }; }
});
const postCache = new Map();
on('news:post', async (file) => {
  file = String(file || ''); if (!/^[\w.-]+\.md$/.test(file)) return null;
  if (postCache.has(file)) return postCache.get(file);
  try { const text = await newsText('news/' + file); postCache.set(file, text); return text; } catch (e) { return null; }
});

// the roadmap lives in roadmap.json on GitHub, so it can change without a release
on('news:roadmap', async () => {
  try {
    const d = (process.env.SL_MOCK === '1' && process.env.SL_ROADMAP_FILE) ? JSON.parse(fs.readFileSync(process.env.SL_ROADMAP_FILE, 'utf8')) : await steam.getJson('https://raw.githubusercontent.com/imnotfisy/SteamLite/main/roadmap.json', { timeout: 8000, cache: false });
    return { updated: String(d.updated || ''), items: Array.isArray(d.items) ? d.items.slice(0, 30) : [] };
  } catch (e) { return { updated: '', items: [] }; }
});
on('news:steamlite', async () => {
  try { const d = (process.env.SL_MOCK === '1' && process.env.SL_NEWS_FILE) ? JSON.parse(fs.readFileSync(process.env.SL_NEWS_FILE, 'utf8')) : await steam.getJson('https://raw.githubusercontent.com/imnotfisy/SteamLite/main/news.json', { timeout: 8000, cache: false }); return { news: Array.isArray(d.news) ? d.news.slice(0, 20) : [], changelog: d.changelog || null }; }
  catch (e) { return { news: [], changelog: null }; }
});

// Game pictures for games whose art is stored under a code in the address (most new releases): Steam's store tells us the exact files.
// The window tries the usual addresses first and only asks for this when they all fail. Answers are kept for a week.
const artMem = new Map();
on('art:resolve', async (id) => {
  id = String(id || ''); if (!/^\d{1,10}$/.test(id)) return null;
  const kept = store.get('artmap', {}), hit = artMem.get(id) || kept[id];
  if (hit && Date.now() - hit.at < 7 * 864e5) return hit.v;
  try {
    const input = encodeURIComponent(JSON.stringify({ ids: [{ appid: Number(id) }], context: { language: 'english', country_code: 'US' }, data_request: { include_assets: true } }));
    const d = await steam.getJson('https://api.steampowered.com/IStoreBrowseService/GetItems/v1?input_json=' + input, { timeout: 8000, cache: false });
    const a = d && d.response && d.response.store_items && d.response.store_items[0] && d.response.store_items[0].assets; if (!a || !a.asset_url_format) return null;
    const hosts = ['https://shared.fastly.steamstatic.com/store_item_assets/', 'https://shared.akamai.steamstatic.com/store_item_assets/', 'https://cdn.cloudflare.steamstatic.com/store_item_assets/'];
    const url = (file) => (file ? hosts.map((h) => h + a.asset_url_format.replace('${FILENAME}', file)) : []);
    const v = { capsule: [...url(a.library_capsule), ...url(a.library_capsule_2x), ...url(a.main_capsule), ...url(a.header)], hero: [...url(a.library_hero), ...url(a.library_hero_2x), ...url(a.page_background), ...url(a.header)], header: [...url(a.header), ...url(a.header_2x), ...url(a.main_capsule)] };
    const rec = { at: Date.now(), v }; artMem.set(id, rec); kept[id] = rec; store.set('artmap', kept); return v;
  } catch (e) { return null; }
});

// the full notes of one release, from GitHub (a news post or the "What's new" card can point to one with "release": "v26.11.1")
const releaseCache = new Map();
on('news:release', async (tag) => {
  tag = String(tag || ''); if (!/^v[0-9A-Za-z.-]{1,30}$/.test(tag)) return null;
  if (releaseCache.has(tag)) return releaseCache.get(tag);
  try {
    const d = await steam.getJson('https://api.github.com/repos/imnotfisy/SteamLite/releases/tags/' + tag, { timeout: 8000, cache: false, headers: { 'User-Agent': 'SteamLite' } });
    const r = { name: d.name || tag, body: d.body || '', date: d.published_at || '', url: d.html_url || '', pre: !!d.prerelease }; releaseCache.set(tag, r); return r;
  } catch (e) { return null; }
});

// ---- updates ----
let notified = null;
// the update channel: Beta (new features first) or Stable. A beta build starts on Beta and can switch to Stable, which offers the final 26.11 release.
const channel = () => { const c = store.get('updateChannel'); return c === 'beta' || c === 'release' ? c : (BETA ? 'beta' : 'release'); };
async function checkUpdate(quiet) {
  const r = await update.check(VERSION, channel());
  if (r.available && notified !== r.version) { notified = r.version; emit('update:available', { version: display(r.version), notes: r.notes }); }
  if (r.available) island.setUpdate({ state: 'available', version: display(r.version), pct: 0 }); else if (r.ok) island.setUpdate(null);
  return Object.assign(r, r.version ? { version: display(r.version) } : {});
}
on('update:check', () => checkUpdate(false));
on('update:install', async () => {
  const v = (update.pending && update.pending()) || '';
  island.setUpdate({ state: 'downloading', version: v, pct: 0 });
  const r = await update.install((percent) => { emit('update:progress', { percent }); island.setUpdate({ state: 'downloading', version: v, pct: percent }); });
  if (r.ok) { emit('update:ready', {}); island.setUpdate({ state: 'ready', version: v, pct: 100 }); } else island.setUpdate({ state: 'available', version: v, pct: 0 });
  return r;
});
on('update:restart', async () => {
  if (!update.runInstaller()) return false;
  setTimeout(() => native('exit'), 300); return true;
});

// ---- wiring ----
bridge.setHandlers(async (ch, args) => {
  const fn = handlers.get(ch);
  if (!fn) throw new Error('Unknown request: ' + ch);
  return fn(...args);
}, () => { });
// ---- the tray icon: close to tray, start minimised, and a menu with your recent games ----
const tray = (() => {
  let made = false;
  const wanted = () => !!(store.get('pref.closeToTray', false) || store.get('pref.startMinimised', false));
  async function items() {
    let recent = [];
    try { recent = (await lib.get({ cached: true })).games.filter((g) => g.installed && g.lastPlayed).sort((a, b) => b.lastPlayed - a.lastPlayed).slice(0, 5); } catch (e) { }
    const m = [{ id: 'open', label: 'Open SteamLite' }];
    if (recent.length) { m.push({ type: 'separator' }); for (const g of recent) m.push({ id: 'play:' + g.id, label: 'Play ' + g.name }); }
    m.push({ type: 'separator' }, { id: 'quit', label: 'Quit SteamLite' });
    return m;
  }
  async function sync() {
    if (wanted() && !made) { made = true; try { await native('trayCreate', { path: path.join(__dirname, 'icon.ico') }); await native('trayTooltip', 'SteamLite'); } catch (e) { made = false; return; } }
    else if (!wanted() && made) { made = false; native('trayDestroy').catch(() => { }); return; }
    if (made) native('trayMenu', await items()).catch(() => { });
  }
  return { sync, wanted };
})();
bridge.onEvent('tray-click', () => native('restore', 'main').catch(() => { }));
bridge.onEvent('tray-menu', (d) => {
  const id = String((d && d.id) || '');
  if (id === 'open') native('restore', 'main').catch(() => { });
  else if (id === 'quit') native('exit');
  else if (id.startsWith('play:')) play.launch({ id: id.slice(5) }).then((r) => { if (r && !r.ok) native('notify', { title: 'SteamLite', body: r.error }).catch(() => { }); }).catch(() => { });
});
// the window's position is remembered (it cannot be resized), and put back if that spot is still on a screen
let posT = null;
// "Pause SteamLite while you play": while a game is running and SteamLite is in the background (behind the game, minimised or in the tray), the page is paused
// completely, so it draws nothing and uses almost no CPU, GPU or memory. It wakes the moment you open it, and the window is told what happened meanwhile.
const pauser = (() => {
  let paused = false, focused = true, minimized = false, visible = true;
  const apply = () => {
    const r = play.running(), want = !!(store.get('pref.pauseInGame', false) && r && !r.starting && (!focused || minimized || !visible));
    if (want === paused) return; paused = want;
    native('webviewSuspend', want).catch(() => { });
    if (!want) setTimeout(() => emit('game:sync', play.running()), 250);
  };
  const note = (s) => { if (!s) return; if ('focused' in s) focused = !!s.focused; if ('minimized' in s) minimized = !!s.minimized; if ('visible' in s) visible = !!s.visible; apply(); };
  return { apply, note };
})();
bridge.onEvent('window-state', (d) => {
  if (d && d.label === 'main') pauser.note(d.state);
  const p = d && d.state && d.state.pos; if (!d || d.label !== 'main' || !p || !isFinite(p.x) || !isFinite(p.y) || p.x < -10000) return;
  clearTimeout(posT); posT = setTimeout(() => store.set('windowPos', { x: Math.round(p.x), y: Math.round(p.y) }), 800);
});
// closing hides SteamLite to the tray when that is switched on (play time keeps counting); otherwise it quits
bridge.onEvent('close-requested', () => { if (tray.wanted() && store.get('pref.closeToTray', false)) native('hide', 'main').catch(() => { }); else { play.running(); native('exit'); } });
bridge.onEvent('ui-ready', async () => {
  tray.sync().catch(() => { });
  const pos = store.get('windowPos'); if (pos) await native('setPosition', pos).catch(() => { });
  // started by Windows a moment after sign-in, with "Start minimised" on: stay in the tray instead of opening the window
  const atLogin = require('os').uptime() < 300;
  if (!(store.get('pref.startMinimised', false) && store.get('startWithWindows', false) && atLogin)) native('show', 'main').catch(() => { });
  if (store.get('autoUpdate', true)) setTimeout(() => checkUpdate(true).catch(() => { }), 3000);
});
setInterval(() => { if (store.get('autoUpdate', true)) checkUpdate(true).catch(() => { }); }, 4 * 3600 * 1000).unref();
