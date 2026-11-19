'use strict';
// Starting a game and counting the time it runs. One game at a time.
//  - a Steam game: Steam itself says which game is running (its own record), so a game that starts through a launcher, or is started from
//    Steam without SteamLite, is still followed. A game started outside SteamLite is picked up on its own.
//  - a game added by hand: followed by its program, and by anything else that is running from the game's folder (launchers start the real game
//    from another .exe), and the game only counts as closed after it has been gone for a short while.
const fs = require('fs'), path = require('path');
const store = require('./store'), lib = require('./library'), plat = require('./platform');

let current = null, emit = () => { }, gamesAt = 0, gamesMem = [];
const setEmit = (fn) => { emit = fn; };
const parseArgs = (s) => (String(s || '').match(/(?:[^\s"]+|"[^"]*")+/g) || []).map((a) => a.replace(/^"(.*)"$/, '$1'));
const lc = (s) => String(s || '').toLowerCase();

// Games with an anti-cheat start through a small launcher that quits again, so a game only counts as closed after it has been gone for a while.
const hasAntiCheat = (dir) => { try { return fs.readdirSync(dir).some((f) => /easyanticheat|start_protected_game|^be(client|service)|battleye/i.test(f)); } catch (e) { return false; } };
function exeNames(dir, depth = 0, out = new Set()) {
  try {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.isFile() && plat.isGameProgram(e.name, path.join(dir, e.name))) out.add(e.name);
      else if (e.isDirectory() && depth < 3 && !/^(_commonredist|redist|redistributables|easyanticheat.*)$/i.test(e.name)) exeNames(path.join(dir, e.name), depth + 1, out);
    }
  } catch (e) { }
  return out;
}

// every running program with its full path (null when the list could not be read, which never counts as "the game closed")
const listProcs = () => plat.listProcs();
// a folder that belongs to one game (not Windows, not a whole "Program Files", not a user's home folder), so everything running from it is that game
function gameFolder(exe) {
  const dir = path.dirname(exe), d = lc(dir), parts = d.split(path.sep).filter(Boolean);
  const bad = plat.badFolders();
  if (parts.length < 3 || bad.some((b) => d === b || d === b + path.sep) || plat.badPrefixes().some((b) => d.startsWith(b + path.sep))) return '';
  return d;
}
const matcher = (exe, dirKey) => { const e = lc(exe), base = lc(path.basename(exe)); return (p) => { const x = lc(p); return x === e || x.endsWith(path.sep + base) || (dirKey && x.startsWith(dirKey + path.sep)); }; };

const cachedGames = async () => { if (Date.now() - gamesAt > 90000) { try { gamesMem = (await lib.get()).games; gamesAt = Date.now(); } catch (e) { } } return gamesMem; };

function begin(id, name, g, exe, extra = {}) {
  const dir = g && g.installdir ? path.join(g.commonPath, g.installdir) : '';
  const t = current = Object.assign({ id, name, exe, dir, byRegistry: !exe && /^\d+$/.test(id), started: 0, launchedAt: Date.now(), lastAlive: Date.now(), grace: hasAntiCheat(dir) ? 90000 : 12000, stopAt: 0, pids: [], external: false, match: exe ? matcher(exe, gameFolder(exe)) : null }, extra);
  emit('game:state', { id, status: t.external ? 'running' : 'starting', since: t.external ? Date.now() : undefined, steam: !!t.steamStarting });
  if (t.external) { t.started = Date.now(); }
  t.timer = setInterval(() => tick(t), 2500);
  return t;
}
async function tick(t) {
  if (current !== t) return;
  let alive = false, readOk = true;
  if (t.byRegistry) alive = (await lib.runningAppId()) === t.id;
  else { const ps = await listProcs(); if (ps === null) readOk = false; else { const hits = ps.filter((p) => t.match(p.path) || (p.cmd && t.exe && lc(p.cmd).includes(lc(path.basename(t.exe))))); t.pids = hits.map((p) => p.pid); alive = hits.length > 0; } }
  if (current !== t) return;
  if (alive) t.lastAlive = Date.now();
  if (alive && !t.started) { t.started = Date.now(); emit('game:state', { id: t.id, status: 'running', since: t.started }); }
  else if (!alive && t.started) { if ((t.stopAt && Date.now() - t.stopAt > 15000) || (readOk && Date.now() - t.lastAlive >= t.grace)) finish(t); }
  else if (!alive && !t.started && Date.now() - t.launchedAt > 5 * 60 * 1000) finish(t);       // it never started
}

async function launch({ id, name }) {
  id = String(id);
  if (current) return { ok: false, error: 'Another game is already running.' };
  const games = (await lib.get()).games, g = games.find((x) => x.id === id);
  if (!g) return { ok: false, error: 'That game is not in your library.' };
  const cfg = store.get('gameConfigs', {})[id] || {}, exe = cfg.exePath && fs.existsSync(cfg.exePath) ? cfg.exePath : (g.exePath && fs.existsSync(g.exePath) ? g.exePath : '');
  const args = parseArgs(cfg.args);
  if (g.nonSteam && !exe) return { ok: false, error: 'The game file was not found. Pick it again in the game settings.' };
  let steamDown = false;
  try {
    if (!exe) steamDown = !(await lib.steamRunning());
    if (exe) plat.runProgram(exe, args, !!cfg.admin);
    else await plat.startSteam(['-applaunch', id, ...args]);       // -silent: Steam starts in the background, -applaunch hands the game over with its launch options
  } catch (e) { return { ok: false, error: 'Could not start the game: ' + e.message }; }
  begin(id, name || g.name, g, exe, steamDown ? { steamStarting: true } : {});
  return { ok: true, steamStarting: steamDown };
}

function finish(t) {
  clearInterval(t.timer); if (current === t) current = null;
  // the session ends when the game was last seen running, not when it was noticed to be gone (that includes the grace period)
  const seconds = t.started ? Math.max(0, Math.floor((t.lastAlive - t.started) / 1000)) : 0;
  if (seconds >= 5) {
    const tel = store.get('telemetry', {}), e = tel[t.id] || { playtime: 0, launches: 0, lastPlayed: 0 };
    e.playtime += seconds; e.launches += 1; e.lastPlayed = Date.now(); tel[t.id] = e; store.set('telemetry', tel);
    const h = store.get('sessionHistory', []); h.push({ gameId: t.id, name: t.name, start: t.started, seconds }); if (h.length > 5000) h.splice(0, h.length - 5000); store.set('sessionHistory', h);
    emit('game:state', { id: t.id, name: t.name, status: 'stopped', seconds, telemetry: e });
  } else emit('game:state', { id: t.id, name: t.name, status: 'stopped', seconds: 0 });
}

function stop(id) {
  const t = current; if (!t || t.id !== String(id)) return false;
  t.stopAt = Date.now();
  if (t.pids.length) t.pids.forEach((p) => plat.killPid(p));
  else if (t.started && t.dir) for (const n of exeNames(t.dir)) plat.killName(n);
  else finish(t);
  return true;
}
const running = () => (current ? { id: current.id, name: current.name, since: current.started, starting: !current.started } : null);

// a Steam game that was started some other way (from Steam itself, a desktop shortcut) is noticed and its time counted too
async function watchOutside() {
  if (current) return;
  const id = await lib.runningAppId(); if (!id || id === '0') return;
  const g = (await cachedGames()).find((x) => x.id === id && x.installed && !x.nonSteam); if (!g || current) return;
  begin(id, g.name, g, '', { external: true });
}
setInterval(() => { watchOutside().catch(() => { }); }, 6000).unref();

module.exports = { launch, stop, running, setEmit };
