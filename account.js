// Sign in with Steam on the website. It uses the same SteamLite Online server as the app:
//   1. the site opens  <server>/auth/start?n=<one-time code>  in a new tab, which goes to Steam's own sign-in page
//   2. the site asks   <server>/auth/poll?n=<code>  until the server says it is done, and gets a token, the Steam ID and the name
//   3. with the token it can ask  <server>/me  and  <server>/social/profile  for the account and its profile
// The website never sees a Steam password. The token is kept in this browser only; "Sign out" removes it.
// The sign-in button only appears when the server can be reached from a web page (it has to allow it: see CORS). If not, nothing shows.
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const DEFAULT_BASE = 'https://steamlite-online.bayxturtle.workers.dev';
  const local = ['localhost', '127.0.0.1'].includes(location.hostname);
  const override = local ? new URLSearchParams(location.search).get('online') : '';          // (for testing against a local server only)
  const ls = { get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }, del(k) { try { localStorage.removeItem(k); } catch (e) { } } };
  const hex = (n) => [...crypto.getRandomValues(new Uint8Array(n))].map((b) => b.toString(16).padStart(2, '0')).join('');
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  let base = '', usable = null, attempt = null, pollT = 0, listeners = [];
  const emit = () => listeners.forEach((f) => { try { f(api.state()); } catch (e) { } });

  async function getBase() {
    if (base) return base;
    if (override && /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(override)) return (base = override);
    let u = DEFAULT_BASE;
    try { const d = await (await fetch('https://raw.githubusercontent.com/imnotfisy/SteamLite/main/online.json?t=' + Math.floor(Date.now() / 600000))).json(); const x = String((d && d.url) || '').replace(/\/+$/, ''); if (/^https:\/\/[\w.-]+(:\d+)?$/.test(x)) u = x; } catch (e) { }
    return (base = u);
  }
  async function call(method, path, body, token) {
    const r = await fetch((await getBase()) + path, { method, headers: Object.assign(body ? { 'Content-Type': 'application/json' } : {}, token ? { Authorization: 'Bearer ' + token } : {}), body: body ? JSON.stringify(body) : undefined, cache: 'no-store' });
    let j = null; try { j = await r.json(); } catch (e) { }
    if (!r.ok) { const e = new Error((j && j.error) || 'HTTP ' + r.status); e.code = r.status; throw e; }
    return j || {};
  }
  // can a web page read the server's answers? (If the server does not allow it, the browser refuses, and sign-in stays hidden.)
  async function probe() {
    if (usable !== null) return usable;
    try { const j = await call('GET', '/auth/poll?n=' + hex(16)); usable = j && j.done === false; } catch (e) { usable = false; }
    return usable;
  }

  const saved = () => ls.get('sl_acct');
  const api = {
    on(fn) { listeners.push(fn); },
    available: probe,
    state() { const a = saved(); return { signedIn: !!(a && a.token), waiting: !!attempt, name: a && a.name, steamid: a && a.steamid, avatar: (a && a.avatar) || '' }; },
    async start() {
      if (attempt) return;
      attempt = { n: hex(16), at: Date.now() }; emit();
      const w = window.open((await getBase()) + '/auth/start?n=' + attempt.n, '_blank', 'noopener');
      if (!w) { /* a blocked pop-up: the link below the button still works */ }
      const tick = async () => {
        if (!attempt) return;
        if (Date.now() - attempt.at > 10 * 60 * 1000) { api.cancel(); return; }
        try {
          const r = await call('GET', '/auth/poll?n=' + attempt.n);
          if (r.done && r.token) { attempt = null; const a = { token: String(r.token), steamid: String(r.steamid || ''), name: String(r.name || '') }; ls.set('sl_acct', a); emit(); api.refresh(); return; }
        } catch (e) { /* keep waiting */ }
        pollT = setTimeout(tick, 2000);
      };
      pollT = setTimeout(tick, 2500);
    },
    cancel() { clearTimeout(pollT); attempt = null; emit(); },
    async refresh() {                                   // the account's own details (name, picture, friend code), when the server allows it
      const a = saved(); if (!a || !a.token) return null;
      try { const me = await call('GET', '/me', null, a.token); ls.set('sl_acct', Object.assign(a, { name: me.name || a.name, steamid: String(me.steamid || a.steamid), avatar: me.avatar || '', code: me.code || '' })); emit(); return me; }
      catch (e) { if (e.code === 401) { ls.del('sl_acct'); emit(); } return null; }
    },
    async profile() {                                   // what other SteamLite players see
      const a = saved(); if (!a || !a.token || !a.steamid) return null;
      const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('steamlite-account:' + a.steamid));
      const uid = [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
      try { return await call('GET', '/social/profile?uid=' + uid, null, a.token); } catch (e) { return null; }
    },
    async signOut() { const a = saved(); ls.del('sl_acct'); emit(); if (a && a.token) { try { await call('POST', '/logout', null, a.token); } catch (e) { } } },
    base: getBase, esc
  };
  window.slAccount = api;

  // ---- the button in the top bar ----
  const nav = $('#nav'); if (!nav) return;
  const box = document.createElement('div'); box.className = 'acct'; box.hidden = true;
  const dl = $('.btn.go.sm', nav) || $('#navDl'); nav.insertBefore(box, dl);
  function render() {
    const s = api.state();
    if (s.signedIn) {
      const ini = esc((s.name || '?').trim()[0] || '?').toUpperCase();
      box.innerHTML = '<button class="who" aria-haspopup="menu" aria-expanded="false" title="' + esc(s.name) + '"><span class="av">' + (s.avatar ? '<img src="' + esc(s.avatar) + '" alt="">' : ini) + '</span><span class="nm">' + esc(s.name) + '</span></button><div class="menu" role="menu" hidden><a role="menuitem" href="account.html">My profile</a><button role="menuitem" data-out>Sign out</button></div>';
      const b = $('.who', box), m = $('.menu', box);
      b.onclick = (e) => { e.stopPropagation(); m.hidden = !m.hidden; b.setAttribute('aria-expanded', String(!m.hidden)); };
      $('[data-out]', box).onclick = async () => { await api.signOut(); if (/account\.html$/.test(location.pathname)) location.href = 'index.html'; };
    } else if (s.waiting) {
      box.innerHTML = '<span class="wait">Finish signing in on Steam...</span><button class="lnk" data-cancel>Cancel</button>';
      $('[data-cancel]', box).onclick = () => api.cancel();
    } else {
      box.innerHTML = '<button class="btn sm" data-in>Sign in with Steam</button>';
      $('[data-in]', box).onclick = () => api.start();
    }
  }
  document.addEventListener('click', () => { const m = $('.menu', box); if (m) { m.hidden = true; const b = $('.who', box); if (b) b.setAttribute('aria-expanded', 'false'); } });
  api.on(render); render();
  // shown when signed in already, or when the server can be reached from a web page
  (async () => { if (saved() || await probe()) { box.hidden = false; if (saved()) api.refresh(); } })();
})();
