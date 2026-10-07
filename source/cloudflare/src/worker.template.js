// SteamLite Online - Cloudflare Worker version. Same API as the server on your PC, but it runs on Cloudflare's network, so it is
// always on and has a permanent address. Data lives in a D1 (SQLite) database. Nothing needs to be installed or kept running.
//
//   Poll votes        GET /polls  POST /vote
//   Leaderboard       GET /lb     POST /lb/submit  POST /lb/remove
//   Theme gallery     GET /themes GET /themes/:id  POST /themes (needs approval)  POST /themes/:id/like
//   Live status       GET /status (announcements, special gifts)
//   Admin             GET /admin (page)  then Bearer-token calls under /admin/...   (the token is the ADMIN_TOKEN secret)
//
// Everything a player sends is checked and clamped here: the app is never trusted.

const DEF_POLLS = { polls: [{ id: 'next', title: 'What should we add next?', items: [
    { id: 'game-rooms', title: 'Game rooms', desc: 'Little shared lobbies where friends can see who is playing what.' },
    { id: 'mobile-companion', title: 'Phone companion', desc: 'Check your library, drops and quests from your phone.' },
    { id: 'custom-themes-online', title: 'Share themes online', desc: 'Publish your own themes to the gallery with one click.' },
    { id: 'more-events', title: 'More events', desc: 'Extra short events with their own quests and rewards.' },
    { id: 'mod-manager', title: 'Mod helper', desc: 'Open the mod folder and manage mods for supported games.' },
    { id: 'stats-year', title: 'Live year stats', desc: 'A year-in-review that updates all year round.' }] }] };
const DEF_STATUS = { motd: '', announcements: [], gifts: [] };

const ADMIN_HTML = __ADMIN_HTML__;

// ---------- helpers ----------
const uidOk = (u) => typeof u === 'string' && /^[a-f0-9]{32}$/.test(u);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, Math.floor(Number(v) || 0)));
const cleanName = (s) => String(s == null ? '' : s).replace(/[^\p{L}\p{N} _.\-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 24);
const cleanText = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f<>]/g, '').trim().slice(0, n);
const HEX = (n) => { const a = new Uint8Array(n); crypto.getRandomValues(a); return [...a].map(b => b.toString(16).padStart(2, '0')).join(''); };
const J = (code, obj, extra) => new Response(JSON.stringify(obj), { status: code, headers: Object.assign({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }, extra || {}) });
const ip = (req) => req.headers.get('cf-connecting-ip') || 'unknown';
async function body(req, max) {
    const txt = await req.text(); if (txt.length > max) throw Object.assign(new Error('too big'), { code: 413 });
    if (!txt) return {}; try { return JSON.parse(txt); } catch (e) { throw Object.assign(new Error('bad json'), { code: 400 }); }
}
function same(a, b) { // constant-time string compare
    const x = new TextEncoder().encode(String(a)), y = new TextEncoder().encode(String(b)); let d = x.length ^ y.length;
    for (let i = 0; i < Math.max(x.length, y.length); i++) d |= (x[i] || 0) ^ (y[i] || 0); return d === 0;
}

// rate limits are counted in the database (a Worker has no memory between requests)
async function limited(env, key, max, ms) {
    const now = Date.now(), bucket = Math.floor(now / ms), k = key + ':' + bucket;
    const r = await env.DB.prepare('INSERT INTO rate(k, n, exp) VALUES(?, 1, ?) ON CONFLICT(k) DO UPDATE SET n = n + 1 RETURNING n').bind(k, (bucket + 2) * ms).first();
    if (Math.random() < 0.02) await env.DB.prepare('DELETE FROM rate WHERE exp < ?').bind(now).run();
    return r.n > max;
}
async function kvGet(env, key, def) { const r = await env.DB.prepare('SELECT v FROM kv WHERE k = ?').bind(key).first(); if (!r) return def; try { return JSON.parse(r.v); } catch (e) { return def; } }
async function kvSet(env, key, val) { await env.DB.prepare('INSERT INTO kv(k, v) VALUES(?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v').bind(key, JSON.stringify(val)).run(); }

// ---------- theme checks (a theme is CSS, so it is moderated AND filtered) ----------
function checkTheme(p) {
    const name = cleanText(p.name, 32), desc = cleanText(p.desc, 120), author = cleanName(p.author) || 'Anonymous';
    if (name.length < 3) return { error: 'Give the theme a name (3+ letters).' };
    const vars = {}; const entries = Object.entries(p.vars && typeof p.vars === 'object' ? p.vars : {});
    if (!entries.length || entries.length > 40) return { error: 'A theme needs between 1 and 40 colour variables.' };
    for (const [k, v] of entries) {
        if (!/^--[a-z0-9-]{1,40}$/.test(k)) return { error: 'Bad variable name.' };
        const val = String(v).trim(); if (val.length > 120 || !/^[#a-zA-Z0-9(),.%\s\/-]+$/.test(val) || /url|expression|javascript/i.test(val)) return { error: 'A colour value is not allowed.' };
        vars[k] = val;
    }
    const css = String(p.css || '');
    if (css.length > 8000) return { error: 'The extra CSS is too long (8000 characters).' };
    if (/@import|@font-face|url\s*\(|expression|javascript:|behavior|binding|<|>|\\|image-set|\bsrc\s*:|content\s*:\s*attr/i.test(css)) return { error: 'The extra CSS uses something that is not allowed (no images, imports or scripts).' };
    return { theme: { name, desc, author, vars, css } };
}
const themeView = (t, full) => { const vars = typeof t.vars === 'string' ? JSON.parse(t.vars) : t.vars; const o = { id: t.id, name: t.name, desc: t.desc, author: t.author, likes: t.likes || 0, liked: !!t.liked, at: t.at, colors: ['--accent-color', '--bg-dark', '--accent-color-2'].map(k => vars[k]).filter(Boolean) }; if (full) { o.vars = vars; o.css = t.css; } return o; };

// ---------- accounts ----------
const STEAM_OPENID = 'https://steamcommunity.com/openid/login', SESSION_MS = 180 * 86400000;
async function sha(s) { const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, '0')).join(''); }
const uidFor = async (steamid) => (await sha('steamlite-account:' + steamid)).slice(0, 32); // the public id on the leaderboard; never reveals the Steam ID
async function authed(req, env) {
    const t = (req.headers.get('authorization') || '').replace(/^Bearer /, ''); if (!/^[a-f0-9]{64}$/.test(t)) return null;
    const h = await sha(t), r = await env.DB.prepare('SELECT a.steamid, a.name, a.uid, s.created FROM sessions s JOIN accounts a ON a.steamid = s.steamid WHERE s.h = ?').bind(h).first();
    return r && r.created > Date.now() - SESSION_MS ? { steamid: r.steamid, name: r.name, uid: r.uid, h } : null;
}
async function verifySteam(url, n) {
    const q = url.searchParams, ret = url.origin + '/auth/return?n=' + n;
    if (q.get('openid.mode') !== 'id_res' || q.get('openid.return_to') !== ret || q.get('openid.op_endpoint') !== STEAM_OPENID) return null;
    const signed = String(q.get('openid.signed') || '').split(','); if (!['claimed_id', 'return_to', 'op_endpoint', 'response_nonce'].every(k => signed.includes(k))) return null;
    const m = /^https:\/\/steamcommunity\.com\/openid\/id\/(\d{17})$/.exec(q.get('openid.claimed_id') || ''); if (!m) return null;
    const check = new URLSearchParams(); for (const [k, v] of q) if (k.startsWith('openid.')) check.set(k, v); check.set('openid.mode', 'check_authentication');
    try { const r = await fetch(STEAM_OPENID, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: check.toString() }); return /(^|\n)is_valid:true/.test(await r.text()) ? m[1] : null; } catch (e) { return null; }
}
async function steamName(id) { // the public profile page, no key needed
    try { const r = await fetch('https://steamcommunity.com/profiles/' + id + '/?xml=1'); const t = await r.text(); const m = /<steamID><!\[CDATA\[(.*?)\]\]><\/steamID>/s.exec(t); return m ? m[1] : ''; } catch (e) { return ''; }
}
const page = (title, html) => new Response('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + title + '</title><body style="font-family:system-ui,sans-serif;background:#0b0b12;color:#eee;display:grid;place-items:center;min-height:100vh;margin:0"><div style="max-width:420px;padding:32px;text-align:center"><h2>' + title + '</h2><p style="color:#aab">' + html + '</p></div>', { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'", 'X-Content-Type-Options': 'nosniff' } });

// ---------- routes ----------
async function route(req, env) {
    const url = new URL(req.url), p = url.pathname, m = req.method, q = url.searchParams, addr = ip(req);
    if (p === '/' || p === '/health') return J(200, { ok: true, name: 'SteamLite Online', time: Date.now() });

    // ----- admin -----
    if (p === '/admin' && m === 'GET') return new Response(ADMIN_HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Security-Policy': "default-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'", 'X-Robots-Tag': 'noindex' } });
    if (p.startsWith('/admin/')) {
        if (!env.ADMIN_TOKEN) return J(503, { error: 'No admin token is set' });
        if (await limited(env, 'admbad' + addr, 12, 600000) && !same((req.headers.get('authorization') || '').replace(/^Bearer /, ''), env.ADMIN_TOKEN)) return J(429, { error: 'Too many tries' });
        if (!same((req.headers.get('authorization') || '').replace(/^Bearer /, ''), env.ADMIN_TOKEN)) return J(401, { error: 'Wrong token' });
        if (p === '/admin/data') {
            const pend = (await env.DB.prepare("SELECT id, name, blurb AS desc, author, at, vars, css FROM themes WHERE status = 'pending' ORDER BY at").all()).results;
            const c = async (sql) => (await env.DB.prepare(sql).first()).c;
            return J(200, { pending: pend.map(t => themeView(t, true)), status: await kvGet(env, 'status', DEF_STATUS), polls: await kvGet(env, 'polls', DEF_POLLS),
                stats: { themes: await c('SELECT COUNT(*) c FROM themes'), approved: await c("SELECT COUNT(*) c FROM themes WHERE status = 'approved'"), leaderboard: await c('SELECT COUNT(*) c FROM lb'), voters: await c('SELECT COUNT(*) c FROM votes') } });
        }
        let mm;
        if ((mm = /^\/admin\/theme\/([a-f0-9]{16})\/(approve|reject)$/.exec(p)) && m === 'POST') {
            const r = await env.DB.prepare('UPDATE themes SET status = ? WHERE id = ?').bind(mm[2] === 'approve' ? 'approved' : 'rejected', mm[1]).run();
            return r.meta.changes ? J(200, { ok: true }) : J(404, { error: 'No such theme' });
        }
        if (p === '/admin/status' && m === 'PUT') { const b = await body(req, 60000); if (!b || typeof b !== 'object') return J(400, { error: 'Bad status' }); await kvSet(env, 'status', { motd: cleanText(b.motd, 200), announcements: (Array.isArray(b.announcements) ? b.announcements : []).slice(0, 10), gifts: (Array.isArray(b.gifts) ? b.gifts : []).slice(0, 10) }); return J(200, { ok: true }); }
        if (p === '/admin/polls' && m === 'PUT') { const b = await body(req, 60000); if (!b || !Array.isArray(b.polls)) return J(400, { error: 'Bad polls' }); await kvSet(env, 'polls', b); return J(200, { ok: true }); }
        return J(404, { error: 'Not found' });
    }

    if (await limited(env, 'g' + addr, 300, 60000)) return J(429, { error: 'Slow down' });
    const acct = await authed(req, env);
    const uid = acct ? acct.uid : (q.get('uid') || '');

    // ----- accounts: "Sign in with Steam" (OpenID). No passwords are ever handled: Steam says who the player is. -----
    if (p === '/auth/start' && m === 'GET') {
        const n = q.get('n') || ''; if (!/^[a-f0-9]{32}$/.test(n)) return J(400, { error: 'Bad request' });
        if (await limited(env, 'as' + addr, 30, 600000)) return J(429, { error: 'Too many tries' });
        const ret = url.origin + '/auth/return?n=' + n;
        const sp = new URLSearchParams({ 'openid.ns': 'http://specs.openid.net/auth/2.0', 'openid.mode': 'checkid_setup', 'openid.return_to': ret, 'openid.realm': url.origin,
            'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select', 'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select' });
        return Response.redirect(STEAM_OPENID + '?' + sp.toString(), 302);
    }
    if (p === '/auth/return' && m === 'GET') {
        const n = q.get('n') || ''; if (!/^[a-f0-9]{32}$/.test(n)) return page('Sign-in failed', 'This link is not valid. Go back to SteamLite and try again.');
        if (await limited(env, 'ar' + addr, 30, 600000)) return page('Sign-in failed', 'Too many tries. Wait a few minutes and try again.');
        const steamid = await verifySteam(url, n);
        if (!steamid) return page('Sign-in failed', 'Steam could not confirm who you are. Close this tab, go back to SteamLite and try again.');
        const name = cleanName(await steamName(steamid)) || 'Player ' + steamid.slice(-4), now = Date.now(), au = await uidFor(steamid);
        await env.DB.prepare('INSERT INTO accounts(steamid, uid, name, created, last) VALUES(?, ?, ?, ?, ?) ON CONFLICT(steamid) DO UPDATE SET name = excluded.name, last = excluded.last').bind(steamid, au, name, now, now).run();
        const token = HEX(32);
        await env.DB.prepare('INSERT INTO sessions(h, steamid, created) VALUES(?, ?, ?)').bind(await sha(token), steamid, now).run();
        await env.DB.prepare('INSERT OR REPLACE INTO auth_pending(n, token, steamid, name, exp) VALUES(?, ?, ?, ?, ?)').bind(n, token, steamid, name, now + 600000).run();
        await env.DB.prepare('DELETE FROM auth_pending WHERE exp < ?').bind(now).run();
        if (Math.random() < 0.05) await env.DB.prepare('DELETE FROM sessions WHERE created < ?').bind(now - SESSION_MS).run();
        return page('You are signed in', 'Signed in as <b>' + name.replace(/[&<>"']/g, '') + '</b>. You can close this tab and go back to SteamLite.');
    }
    if (p === '/auth/poll' && m === 'GET') {
        const n = q.get('n') || ''; if (!/^[a-f0-9]{32}$/.test(n)) return J(400, { error: 'Bad request' });
        if (await limited(env, 'ap' + addr, 200, 600000)) return J(429, { error: 'Slow down' });
        const r = await env.DB.prepare('DELETE FROM auth_pending WHERE n = ? AND exp > ? RETURNING token, steamid, name').bind(n, Date.now()).first();
        return r ? J(200, { done: true, token: r.token, steamid: r.steamid, name: r.name }) : J(200, { done: false });
    }
    if (p === '/me' && m === 'GET') {
        if (!acct) return J(401, { error: 'Not signed in' });
        const b = await env.DB.prepare('SELECT at, prev_at FROM backups WHERE steamid = ?').bind(acct.steamid).first();
        return J(200, { steamid: acct.steamid, name: acct.name, backupAt: b ? b.at : 0, prevAt: b ? b.prev_at : 0 });
    }
    if (p === '/logout' && m === 'POST') { if (acct) await env.DB.prepare('DELETE FROM sessions WHERE h = ?').bind(acct.h).run(); return J(200, { ok: true }); }
    if (p === '/account' && m === 'DELETE') {
        if (!acct) return J(401, { error: 'Not signed in' });
        const id = acct.steamid, u = acct.uid;
        await env.DB.batch([env.DB.prepare('DELETE FROM sessions WHERE steamid = ?').bind(id), env.DB.prepare('DELETE FROM backups WHERE steamid = ?').bind(id), env.DB.prepare('DELETE FROM lb WHERE uid = ?').bind(u),
            env.DB.prepare('DELETE FROM theme_likes WHERE uid = ?').bind(u), env.DB.prepare('DELETE FROM votes WHERE uid = ?').bind(u), env.DB.prepare('DELETE FROM themes WHERE uid = ?').bind(u), env.DB.prepare('DELETE FROM accounts WHERE steamid = ?').bind(id)]);
        return J(200, { ok: true });
    }
    if (p === '/backup') {
        if (!acct) return J(401, { error: 'Sign in first' });
        if (m === 'PUT') {
            if (await limited(env, 'bk' + acct.steamid, 20, 3600000)) return J(429, { error: 'Backed up too often. Try again later.' });
            const b = await body(req, 400000);
            if (!b || typeof b !== 'object' || Array.isArray(b) || !b.data || typeof b.data !== 'object' || Object.keys(b.data).length > 80) return J(400, { error: 'Bad backup' });
            const txt = JSON.stringify({ v: 1, app: String(b.version || '').slice(0, 20), data: b.data }); if (txt.length > 380000) return J(413, { error: 'Backup too big' });
            await env.DB.prepare('INSERT INTO backups(steamid, data, prev, at, prev_at) VALUES(?, ?, NULL, ?, 0) ON CONFLICT(steamid) DO UPDATE SET prev = backups.data, prev_at = backups.at, data = excluded.data, at = excluded.at').bind(acct.steamid, txt, Date.now()).run();
            return J(200, { ok: true, at: Date.now() });
        }
        if (m === 'GET') {
            const r = await env.DB.prepare('SELECT data, prev, at, prev_at FROM backups WHERE steamid = ?').bind(acct.steamid).first(), old = q.get('v') === 'prev';
            const txt = r && (old ? r.prev : r.data); if (!txt) return J(404, { error: 'No backup yet' });
            return J(200, { at: old ? r.prev_at : r.at, backup: JSON.parse(txt) });
        }
    }

    // ----- live status -----
    if (p === '/status' && m === 'GET') {
        const now = Date.now(), s = await kvGet(env, 'status', DEF_STATUS);
        return J(200, { motd: s.motd || '', announcements: (s.announcements || []).filter(a => a && a.id && (!a.until || a.until > now)).slice(0, 5).map(a => ({ id: String(a.id).slice(0, 40), title: cleanText(a.title, 120), text: cleanText(a.text, 400), date: cleanText(a.date, 40), url: /^https:\/\/[^\s<>"']{1,300}$/.test(String(a.url || '')) ? String(a.url) : '' })),
            gifts: (s.gifts || []).filter(g => g && g.id && g.until > now && g.xp > 0).slice(0, 5).map(g => ({ id: String(g.id).slice(0, 40), title: cleanText(g.title, 60), xp: clamp(g.xp, 1, 100000), until: g.until })) });
    }

    // ----- polls -----
    if (p === '/polls' && m === 'GET') {
        const cfg = await kvGet(env, 'polls', DEF_POLLS), out = [];
        for (const po of cfg.polls) {
            const rows = (await env.DB.prepare('SELECT option_id o, COUNT(*) c FROM votes WHERE poll_id = ? GROUP BY option_id').bind(po.id).all()).results, counts = {}; let total = 0;
            rows.forEach(r => { counts[r.o] = r.c; total += r.c; });
            const mine = uidOk(uid) ? (await env.DB.prepare('SELECT option_id o FROM votes WHERE poll_id = ? AND uid = ?').bind(po.id, uid).first()) : null;
            out.push({ id: po.id, title: po.title, total, mine: mine ? mine.o : null, items: po.items.map(i => ({ id: i.id, title: i.title, desc: i.desc, votes: counts[i.id] || 0 })) });
        }
        return J(200, { polls: out });
    }
    if (p === '/vote' && m === 'POST') {
        if (await limited(env, 'v' + addr, 30, 3600000)) return J(429, { error: 'Too many votes from here' });
        const b = await body(req, 2000); if (acct) b.uid = acct.uid; const cfg = await kvGet(env, 'polls', DEF_POLLS), po = cfg.polls.find(x => x.id === b.pollId);
        if (!uidOk(b.uid) || !po || !po.items.some(i => i.id === b.optionId)) return J(400, { error: 'Bad vote' });
        await env.DB.prepare('INSERT INTO votes(poll_id, uid, option_id) VALUES(?, ?, ?) ON CONFLICT(poll_id, uid) DO UPDATE SET option_id = excluded.option_id').bind(po.id, b.uid, b.optionId).run();
        return J(200, { ok: true });
    }

    // ----- leaderboard -----
    if (p === '/lb' && m === 'GET') {
        const metric = ['level', 'hours', 'streak', 'achievements'].includes(q.get('metric')) ? q.get('metric') : 'level', lim = clamp(q.get('limit') || 50, 1, 100);
        const rows = (await env.DB.prepare('SELECT uid, name, level, hours, streak, achievements, games, EXISTS(SELECT 1 FROM accounts a WHERE a.uid = lb.uid) verified FROM lb ORDER BY ' + metric + ' DESC, level DESC, hours DESC LIMIT ?').bind(lim).all()).results;
        const total = (await env.DB.prepare('SELECT COUNT(*) c FROM lb').first()).c; let myRank = null;
        if (uidOk(uid)) { const me = await env.DB.prepare('SELECT level, hours, streak, achievements FROM lb WHERE uid = ?').bind(uid).first(); if (me) myRank = 1 + (await env.DB.prepare('SELECT COUNT(*) c FROM lb WHERE ' + metric + ' > ?1 OR (' + metric + ' = ?1 AND (level > ?2 OR (level = ?2 AND hours > ?3)))').bind(me[metric], me.level, me.hours).first()).c; }
        return J(200, { metric, total, myRank, rows: rows.map((r, i) => ({ rank: i + 1, name: r.name, level: r.level, hours: r.hours, streak: r.streak, achievements: r.achievements, games: r.games, verified: !!r.verified, me: r.uid === uid })) });
    }
    if (p === '/lb/submit' && m === 'POST') {
        const b = await body(req, 2000); const oldUid = b.uid; if (acct) b.uid = acct.uid; if (!uidOk(b.uid)) return J(400, { error: 'Bad id' });
        if (await limited(env, 'l' + b.uid, 6, 3600000)) return J(429, { error: 'Updated too often' });
        const name = cleanName(b.name); if (name.length < 2) return J(400, { error: 'Pick a name with 2+ letters or numbers.' });
        if (await env.DB.prepare('SELECT 1 x FROM lb WHERE lower(name) = lower(?1) AND uid != ?2 AND uid IN (SELECT uid FROM accounts) UNION SELECT 1 FROM accounts WHERE lower(name) = lower(?1) AND uid != ?2').bind(name, b.uid).first()) return J(400, { error: 'That name belongs to a signed-in player. Pick another, or sign in with Steam.' });
        if (acct && uidOk(oldUid) && oldUid !== acct.uid) await env.DB.prepare('DELETE FROM lb WHERE uid = ?').bind(oldUid).run();
        await env.DB.prepare('INSERT INTO lb(uid, name, level, hours, streak, achievements, games, at) VALUES(?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(uid) DO UPDATE SET name = excluded.name, level = excluded.level, hours = excluded.hours, streak = excluded.streak, achievements = excluded.achievements, games = excluded.games, at = excluded.at')
            .bind(b.uid, name, clamp(b.level, 1, 100), clamp(b.hours, 0, 200000), clamp(b.streak, 0, 5000), clamp(b.achievements, 0, 500), clamp(b.games, 0, 20000), Date.now()).run();
        if (Math.random() < 0.02) await env.DB.prepare('DELETE FROM lb WHERE uid IN (SELECT uid FROM lb ORDER BY at ASC LIMIT MAX(0, (SELECT COUNT(*) FROM lb) - 5000))').run();
        return J(200, { ok: true });
    }
    if (p === '/lb/remove' && m === 'POST') { const b = await body(req, 500); if (uidOk(b.uid)) await env.DB.prepare('DELETE FROM lb WHERE uid = ?').bind(b.uid).run(); if (acct) await env.DB.prepare('DELETE FROM lb WHERE uid = ?').bind(acct.uid).run(); return J(200, { ok: true }); }

    // ----- theme gallery -----
    if (p === '/themes' && m === 'GET') {
        const order = q.get('sort') === 'new' ? 't.at DESC' : 'likes DESC, t.at DESC', u = uidOk(uid) ? uid : '';
        const list = (await env.DB.prepare("SELECT t.id, t.name, t.blurb AS desc, t.author, t.at, t.vars, (SELECT COUNT(*) FROM theme_likes l WHERE l.theme_id = t.id) likes, EXISTS(SELECT 1 FROM theme_likes l WHERE l.theme_id = t.id AND l.uid = ?) liked FROM themes t WHERE t.status = 'approved' ORDER BY " + order + ' LIMIT 60').bind(u).all()).results;
        const mine = u ? (await env.DB.prepare("SELECT id, name, status FROM themes WHERE uid = ? AND status != 'approved'").bind(u).all()).results : [];
        return J(200, { themes: list.map(t => themeView(t)), mine });
    }
    let mt;
    if ((mt = /^\/themes\/([a-f0-9]{16})$/.exec(p)) && m === 'GET') {
        const u = uidOk(uid) ? uid : '';
        const t = await env.DB.prepare("SELECT t.id, t.name, t.blurb AS desc, t.author, t.at, t.vars, t.css, (SELECT COUNT(*) FROM theme_likes l WHERE l.theme_id = t.id) likes, EXISTS(SELECT 1 FROM theme_likes l WHERE l.theme_id = t.id AND l.uid = ?) liked FROM themes t WHERE t.id = ? AND t.status = 'approved'").bind(u, mt[1]).first();
        return t ? J(200, themeView(t, true)) : J(404, { error: 'Not found' });
    }
    if ((mt = /^\/themes\/([a-f0-9]{16})\/like$/.exec(p)) && m === 'POST') {
        const b = await body(req, 500); if (acct) b.uid = acct.uid; if (!uidOk(b.uid)) return J(400, { error: 'Bad request' });
        if (await limited(env, 'k' + b.uid, 60, 3600000)) return J(429, { error: 'Slow down' });
        const t = await env.DB.prepare("SELECT id FROM themes WHERE id = ? AND status = 'approved'").bind(mt[1]).first(); if (!t) return J(400, { error: 'Bad request' });
        const had = await env.DB.prepare('DELETE FROM theme_likes WHERE theme_id = ? AND uid = ? RETURNING 1 x').bind(mt[1], b.uid).first();
        if (!had) await env.DB.prepare('INSERT INTO theme_likes(theme_id, uid) VALUES(?, ?)').bind(mt[1], b.uid).run();
        const likes = (await env.DB.prepare('SELECT COUNT(*) c FROM theme_likes WHERE theme_id = ?').bind(mt[1]).first()).c;
        return J(200, { ok: true, likes, liked: !had });
    }
    if (p === '/themes' && m === 'POST') {
        const b = await body(req, 40000); if (acct) { b.uid = acct.uid; b.author = b.author || acct.name; } if (!uidOk(b.uid)) return J(400, { error: 'Bad id' });
        if (await limited(env, 't' + b.uid, 3, 86400000) || await limited(env, 'ti' + addr, 6, 86400000)) return J(429, { error: 'You can share 3 themes a day.' });
        if ((await env.DB.prepare("SELECT COUNT(*) c FROM themes WHERE uid = ? AND status = 'pending'").bind(b.uid).first()).c >= 2) return J(400, { error: 'You already have 2 themes waiting for review.' });
        const r = checkTheme(b); if (r.error) return J(400, { error: r.error });
        const id = HEX(8);
        await env.DB.prepare("INSERT INTO themes(id, uid, status, at, name, blurb, author, vars, css) VALUES(?, ?, 'pending', ?, ?, ?, ?, ?, ?)").bind(id, b.uid, Date.now(), r.theme.name, r.theme.desc, r.theme.author, JSON.stringify(r.theme.vars), r.theme.css).run();
        return J(200, { ok: true, id, status: 'pending' });
    }
    return J(404, { error: 'Not found' });
}

export default {
    async fetch(req, env) {
        try { return await route(req, env); }
        catch (e) { const code = e && (e.code === 413 || e.code === 400) ? e.code : 500; return J(code, { error: code === 413 ? 'Too big' : code === 400 ? 'Bad request' : 'Server error' }); }
    }
};
