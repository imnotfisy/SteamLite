'use strict';
// SteamLite's link to Island (a separate app: a small pill at the top of the screen). When Island is running, SteamLite sends it the game you are
// playing (with a Stop button), how long a session was, and update progress. Nothing is needed from Island to run SteamLite: if it is not there, this does nothing.
const http = require('http'), fs = require('fs'), path = require('path');
const store = require('./store');

module.exports = function makeIslandLink({ play, openMain, showUpdateInApp }) {
  let update = null, callbackUrl = '', port = 0, lastOk = 0;
  const enabled = () => store.get('pref.island', true);
  const art = (id) => (/^\d+$/.test(String(id)) ? 'https://cdn.cloudflare.steamstatic.com/steam/apps/' + id + '/header.jpg' : '');

  // where Island listens (it writes its port next to its settings; 47600 is the usual one)
  const islandPort = () => { try { const p = Number(fs.readFileSync(path.join(process.env.APPDATA || '', 'Island', 'port.txt'), 'utf8')); if (p >= 47600 && p <= 47605) return p; } catch (e) { } return 47600; };
  async function post(p, body) {
    if (!enabled() && p !== '/v1/activity/end') return false;
    try {
      const r = await fetch('http://127.0.0.1:' + islandPort() + p, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Island-App': 'SteamLite' }, body: JSON.stringify(body), signal: AbortSignal.timeout(1500) });
      if (r.ok) { lastOk = Date.now(); return true; }
    } catch (e) { }
    return false;                                                  // Island is not running: that is fine
  }
  const end = (id) => post('/v1/activity/end', { id });

  function gameActivity() {
    const r = play.running(); if (!r) return null;
    return { id: 'steamlite.game', app: 'SteamLite', title: r.name, subtitle: r.starting ? 'Starting...' : 'Playing', icon: art(r.id), startedAt: r.starting ? null : r.since, accent: '#46e0a0', priority: 3, callback: callbackUrl,
      actions: [{ id: 'stop', label: r.starting ? 'Cancel' : 'Stop', style: 'danger' }, { id: 'open', label: 'Open SteamLite' }] };
  }
  function updateActivity() {
    if (!update) return null;
    const t = update.state === 'downloading' ? 'Updating ' + update.pct + '%' : update.state === 'ready' ? 'Restart to update' : 'Update available';
    return { id: 'steamlite.update', app: 'SteamLite', title: t, subtitle: 'SteamLite ' + update.version, progress: update.state === 'downloading' ? update.pct : update.state === 'ready' ? 100 : null, accent: '#3fd6ee', priority: update.state === 'downloading' ? 6 : 2, callback: callbackUrl,
      actions: [{ id: 'openUpdate', label: update.state === 'ready' ? 'Open the installer' : 'See what is new', style: 'primary' }] };
  }
  // sends the current state (used when something changes, when the setting is switched on, and now and then in case Island started later)
  async function sync() {
    if (!enabled()) { end('steamlite.game'); end('steamlite.update'); return; }
    const g = gameActivity(), u = updateActivity();
    if (g) post('/v1/activity', g); else end('steamlite.game');
    if (u) post('/v1/activity', u); else end('steamlite.update');
  }
  setInterval(() => { if (enabled() && (play.running() || update)) sync(); }, 15000).unref();

  // Island calls back here when you press a button on its pill (only programs on this PC, and only with the header Island sends)
  const server = http.createServer((req, res) => {
    if (req.method !== 'POST' || req.headers['x-island'] !== '1' || req.headers.origin) { res.writeHead(403); return res.end(); }
    let b = ''; req.on('data', (c) => { b += c; if (b.length > 4096) req.destroy(); });
    req.on('end', () => {
      let d = {}; try { d = JSON.parse(b); } catch (e) { }
      if (d.action === 'stop') { const r = play.running(); if (r) play.stop(r.id); }
      else if (d.action === 'open' || d.action === 'click') openMain();
      else if (d.action === 'openUpdate') { openMain(); showUpdateInApp(); }
      res.writeHead(200); res.end('ok');
    });
  });
  server.listen(0, '127.0.0.1', () => { port = server.address().port; callbackUrl = 'http://127.0.0.1:' + port + '/island'; });
  server.unref();

  return {
    refresh: sync,
    onGame(d) {
      if (d.status === 'stopped') {
        end('steamlite.game');
        if (d.seconds >= 60 && enabled()) {
          const s = d.seconds, t = s >= 3600 ? Math.floor(s / 3600) + ' h ' + Math.round((s % 3600) / 60) + ' min' : Math.round(s / 60) + ' min';
          post('/v1/activity', { id: 'steamlite.ended', app: 'SteamLite', title: 'Session ended', subtitle: (d.name || 'Your game') + ' - ' + t, icon: art(d.id), expand: true, ttl: 6000, accent: '#46e0a0', priority: 5 });
        }
      } else sync();
    },
    setUpdate(u) { update = u; sync(); }
  };
};
