// Everything the window shows lives here; the core (through sl.call) is the source of truth for data.
import { themeOpen } from './util.js';
export const S = $state({
  ready: false, version: '', signedIn: false, migrate: false, addAccount: false, steamId: '', settings: {},
  view: 'home', gameId: null, back: null,
  games: [], favorites: [], hidden: [], collections: {}, offline: false, libLoading: false, libError: '', whatsNew: null, focusSearch: false,
  running: null,            // { id, name, since, starting }
  update: null, updateHidden: false,             // { version, notes }
  updateState: '',          // '', 'downloading', 'ready'
  updatePct: 0,
  toasts: [], confirmClose: false,
  progress: {},             // games Steam is downloading or updating: { id: { a: 'downloading', p: 0.4 } }
  sel: [], visible: [],     // games picked in the library with Ctrl or Shift, and the order they are shown in
  ui: {}                    // what was remembered from last time: the page, the library sort and filter
});

const call = (...a) => window.sl.call(...a);
export const api = call;

let tid = 0;
// a message in the corner. With an action ({ label, fn }) it stays a little longer and shows a button, like Undo.
export function toast(text, kind = '', action = null) {
  const id = ++tid; S.toasts.push({ id, text, kind, action });
  setTimeout(() => { S.toasts = S.toasts.filter((t) => t.id !== id); }, action ? 7000 : 4200);
}
export const dismissToast = (id) => { S.toasts = S.toasts.filter((t) => t.id !== id); };
export function remember(patch) { S.ui = { ...S.ui, ...patch }; window.sl.call('ui:set', patch).catch(() => { }); }

export function go(view, gameId = null) { S.back = S.view === 'game' ? S.back : { view: S.view }; S.view = view; S.gameId = gameId; }
export function openGame(id) { S.back = { view: S.view === 'game' ? (S.back && S.back.view) || 'library' : S.view }; S.view = 'game'; S.gameId = String(id); }
export function goBack() { const b = (S.back && S.back.view) || 'library'; S.view = b; S.gameId = null; }

const apply = (d) => { S.games = d.games; S.favorites = d.favorites.map(String); S.hidden = d.hidden.map(String); S.collections = d.collections || {}; S.offline = d.offline; };
// The saved copy of the library is shown at once; Steam's answer then replaces it a moment later.
export async function loadLibrary() {
  S.libError = ''; S.libLoading = !S.games.length;
  if (!S.games.length) { try { const c = await call('library:cached'); if (!c.none && c.games.length) { apply(c); S.libLoading = false; } } catch (e) { } }
  try { apply(await call('library:get')); } catch (e) { S.libError = 'SteamLite could not load your library from Steam. Check your internet connection, then try again.'; }
  S.libLoading = false;
}

// What Steam is downloading, installing or updating. Checked every few seconds while something is in progress, rarely otherwise, and hardly at all during a game.
let progT = 0;
export function pollProgress() {
  clearTimeout(progT);
  const run = async () => {
    let busy = Object.keys(S.progress).length > 0;
    if (!document.hidden && S.signedIn && !S.migrate) {
      try {
        const p = await call('library:progress'), was = Object.keys(S.progress);
        S.progress = p; busy = Object.keys(p).length > 0;
        if (was.some((id) => !p[id])) loadLibrary();                 // something finished: refresh what is installed
      } catch (e) { }
    }
    progT = setTimeout(run, S.running && S.settings.gameLite !== false ? 45000 : busy ? 4000 : 20000);
  };
  progT = setTimeout(run, 1500);
}
export const game = (id) => S.games.find((g) => g.id === String(id));

export async function toggleFavorite(id) { S.favorites = (await call('library:favorite', id)).map(String); }
export async function toggleHidden(id, quiet = false) {
  const was = S.hidden.includes(String(id)); S.hidden = (await call('library:hide', id)).map(String);
  if (!quiet) toast(was ? 'Game unhidden.' : 'Game hidden.', '', { label: 'Undo', fn: () => toggleHidden(id, true) });
}
// several games at once (Ctrl or Shift in the library): set favourite or hidden for each that is not already that way
export async function bulk(kind, ids) {
  const key = kind === 'hide' ? 'hidden' : 'favorites', now = new Set(S[key]), todo = ids.filter((id) => !now.has(String(id)));
  for (const id of todo) { const l = (await call(kind === 'hide' ? 'library:hide' : 'library:favorite', id)).map(String); S[key] = l; }
  S.sel = [];
  toast((kind === 'hide' ? 'Hid ' : 'Added to favorites: ') + todo.length + (todo.length === 1 ? ' game.' : ' games.'), '', { label: 'Undo', fn: async () => { for (const id of todo) S[key] = (await call(kind === 'hide' ? 'library:hide' : 'library:favorite', id)).map(String); } });
}
export function pick(id, e) {
  id = String(id); const i = S.sel.indexOf(id);
  if (e && e.shiftKey && S.sel.length && S.visible.length) {
    const last = S.sel[S.sel.length - 1], a = S.visible.indexOf(last), b = S.visible.indexOf(id);
    if (a >= 0 && b >= 0) { const [lo, hi] = a < b ? [a, b] : [b, a]; S.sel = [...new Set([...S.sel, ...S.visible.slice(lo, hi + 1)])]; return; }
  }
  S.sel = i >= 0 ? S.sel.filter((x) => x !== id) : [...S.sel, id];
}
export async function saveCollections() { await call('library:collections', $state.snapshot(S.collections)); }

export async function play(g) {
  const r = await call('game:launch', { id: g.id, name: g.name });
  if (!r.ok) toast(r.error || 'Could not start the game.', 'bad');
  else { S.running = { id: g.id, name: g.name, starting: true, since: 0, steam: !!r.steamStarting }; if (r.steamStarting) toast('Steam is not running, so SteamLite is starting it first. The game opens when Steam is ready.'); }
}
export async function stop(g) { await call('game:stop', g.id); }

// the settings that change how the whole app looks are put on the page as attributes the style sheet reads
export function applySettings() {
  const r = document.documentElement.dataset, s = S.settings || {};
  r.lite = s.lightGfx ? '1' : ''; r.motion = s.reduceMotion ? 'reduced' : ''; r.bg = s.animBg === false ? 'still' : ''; r.accent = s.artColour === false ? 'fixed' : ''; r.theme = ['purple', 'gta6'].includes(s.theme) && themeOpen(s.theme) ? s.theme : '';
  if (s.artColour === false) document.documentElement.style.removeProperty('--glow');      // the theme's own colour
}
export async function init() {
  const b = await call('app:boot');
  S.version = b.version; S.whatsNew = b.justUpdated || null; S.signedIn = b.signedIn; S.migrate = !!b.needsSteamLogin; S.steamId = b.steamId; S.settings = b.settings; S.running = b.running; S.ui = b.ui || {}; S.ready = true; applySettings();
  if (b.signedIn && !b.needsSteamLogin) { const sp = b.settings.startPage, last = S.ui.page; if (sp === 'library') S.view = 'library'; else if (sp === 'last' && ['library', 'news', 'settings'].includes(last)) S.view = last; }
  window.sl.on('game:state', (d) => {
    if (d.status === 'running') S.running = { id: d.id, name: (game(d.id) || {}).name || '', since: d.since, starting: false };
    else if (d.status === 'starting') S.running = { ...(S.running || {}), id: d.id, name: (game(d.id) || {}).name || '', since: 0, starting: true, steam: !!d.steam };
    else if (d.status === 'stopped') {
      S.running = null;
      const g = game(d.id); if (g && d.telemetry) { g.seconds = d.telemetry.playtime; g.launches = d.telemetry.launches; g.lastPlayed = d.telemetry.lastPlayed; }
    }
  });
  // SteamLite can be paused while a game runs in front of it; when it wakes up, this brings it up to date
  window.sl.on('game:sync', (r) => { const was = S.running; S.running = r ? { id: r.id, name: r.name, since: r.since, starting: !!r.starting } : null; if (was && !r) loadLibrary(); });
  window.sl.on('app:showUpdate', () => { S.updateHidden = false; });
  window.sl.on('update:available', (u) => { S.update = u; S.updateHidden = false; });
  window.sl.on('update:progress', (p) => { S.updatePct = p.percent; });
  window.sl.on('update:ready', () => { S.updateState = 'ready'; });
  pollProgress();
  if (S.signedIn) { loadLibrary(); refreshAccounts(); }
}

// ---- accounts (the picture in the title bar opens a menu with these) ----
export const A = $state({ profiles: [], activeId: null });
export async function refreshAccounts() { try { const r = await call('account:list'); A.profiles = r.profiles; A.activeId = r.activeId; } catch (e) { } }
export async function switchAccount(id) {
  if (!(await call('account:switch', id))) return false;
  S.steamId = id; S.games = []; S.favorites = []; S.hidden = []; S.collections = {}; S.view = 'home'; S.gameId = null;
  await refreshAccounts(); loadLibrary(); toast('Switched account.'); return true;
}
export async function signOutAll() { await call('account:signOut'); S.signedIn = false; S.migrate = false; S.games = []; A.profiles = []; A.activeId = null; }
