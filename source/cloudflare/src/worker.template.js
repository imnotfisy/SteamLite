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
// the daily play streak (started by launching a game on the PC): messaging anyone from the phone counts as a play day too.
// days are the phone's own local dates (YYYY-MM-DD); the PC folds them into its own streak and then posts the real numbers back here
const dayStr = (t) => { const d = new Date(t); return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0'); };
const dayPrev = (s) => dayStr(Date.parse(s + 'T12:00:00Z') - 86400000);
async function playStreakBump(env, uid, day) {
    if (typeof day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day) || Math.abs(Date.parse(day + 'T12:00:00Z') - Date.now()) > 2 * 86400000) return null;
    let r = await env.DB.prepare('SELECT cur, best, last_day, phone_days FROM daystreak WHERE uid = ?').bind(uid).first();
    if (!r) r = { cur: 0, best: 0, last_day: '', phone_days: '[]' };
    let days = []; try { days = JSON.parse(r.phone_days) || []; } catch (e) { }
    if (r.last_day === day || days.includes(day)) return { current: r.cur, best: r.best, up: false, done: true };
    if (r.last_day && day < r.last_day) return { current: r.cur, best: r.best, up: false, done: true };
    const cur = r.last_day === dayPrev(day) && r.cur >= 1 ? r.cur + 1 : 1, best = Math.max(r.best, cur);
    days = days.concat(day).sort().slice(-8);
    await env.DB.prepare('INSERT INTO daystreak(uid, cur, best, last_day, phone_days, at) VALUES(?, ?, ?, ?, ?, ?) ON CONFLICT(uid) DO UPDATE SET cur = excluded.cur, best = excluded.best, last_day = excluded.last_day, phone_days = excluded.phone_days, at = excluded.at').bind(uid, cur, best, day, JSON.stringify(days), Date.now()).run();
    return { current: cur, best, up: true, done: true, from: r.last_day === dayPrev(day) ? r.cur : 0 };
}
// messages scheduled for later are sent by whoever's request or the hourly job gets here first
let SCHED_AT = 0;
async function runSched(env) {
    if (Date.now() - SCHED_AT < 15000) return; SCHED_AT = Date.now();
    const due = (await env.DB.prepare('SELECT id, uid, conv, text FROM sched WHERE send_at <= ? ORDER BY send_at LIMIT 15').bind(Date.now()).all()).results;
    for (const s of due) {
        try {
            await env.DB.prepare('DELETE FROM sched WHERE id = ?').bind(s.id).run();
            const mems = (await env.DB.prepare('SELECT uid, muted, muted_until FROM members WHERE conv = ?').bind(s.conv).all()).results, mine = mems.find((x) => x.uid === s.uid), cv = await env.DB.prepare('SELECT kind, name FROM convs WHERE id = ?').bind(s.conv).first();
            if (!mine || !cv) continue;
            if (cv.kind === 'dm') { const o = mems.find((x) => x.uid !== s.uid); if (!o) continue; const [a, b] = s.uid < o.uid ? [s.uid, o.uid] : [o.uid, s.uid]; if (!(await env.DB.prepare("SELECT 1 x FROM friends WHERE a = ? AND b = ? AND status = 'accepted'").bind(a, b).first())) continue; if (await env.DB.prepare('SELECT 1 x FROM blocks WHERE (uid = ?1 AND target = ?2) OR (uid = ?2 AND target = ?1)').bind(s.uid, o.uid).first()) continue; }
            const now = Date.now(), r = await env.DB.prepare("INSERT INTO msgs(conv, uid, text, at, kind, data, reply_to) VALUES(?, ?, ?, ?, 'text', '', 0) RETURNING id").bind(s.conv, s.uid, s.text, now).first();
            await env.DB.batch([env.DB.prepare('UPDATE convs SET last_at = ? WHERE id = ?').bind(now, s.conv), env.DB.prepare('UPDATE members SET last_read = ? WHERE conv = ? AND uid = ?').bind(r.id, s.conv, s.uid)]);
            const me = await env.DB.prepare('SELECT name FROM accounts WHERE uid = ?').bind(s.uid).first();
            const to = mems.filter((x) => x.uid !== s.uid && !x.muted && !(x.muted_until > now)).map((x) => x.uid);
            await pushTo(env, to, { t: 'msg', conv: s.conv, title: cv.kind === 'dm' ? (me ? me.name : 'SteamLite') : (cv.name || 'Group chat'), body: (cv.kind === 'dm' ? '' : (me ? me.name : '') + ': ') + s.text.slice(0, 160), sender: me ? me.name : '', kind: 'text' });
        } catch (e) { console.error('sched', e && e.message); }
    }
}
const escH = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
async function wishPage(env, code) {
    const r = await env.DB.prepare('SELECT name, items FROM wishshare WHERE code = ?').bind(code).first(); if (!r) return new Response('This wishlist link is no longer shared.', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    let it = []; try { it = JSON.parse(r.items); } catch (e) { }
    const html = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + escH(r.name) + "'s wishlist</title><style>body{margin:0;background:#0f0f14;color:#eee;font:16px system-ui,sans-serif}main{max-width:720px;margin:0 auto;padding:20px}h1{font-size:22px}a{display:flex;gap:12px;align-items:center;padding:8px;border-radius:12px;background:#1a1a24;margin:8px 0;color:inherit;text-decoration:none}img{width:120px;border-radius:8px}small{color:#9a9ab0}</style></head><body><main><h1>" + escH(r.name) + "'s wishlist</h1><small>Shared from SteamLite</small>" + it.map((g) => '<a href="https://store.steampowered.com/app/' + (g.appid | 0) + '/"><img loading="lazy" src="https://cdn.cloudflare.steamstatic.com/steam/apps/' + (g.appid | 0) + '/header.jpg" alt=""><span>' + escH(g.name) + '</span></a>').join('') + '</main></body></html>';
    return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' } });
}
async function freeGamesRun(env) { // a game that just became free to keep: tell everyone who has the alert on (each phone filters by its own setting)
    try {
        const r = await fetch('https://store.steampowered.com/api/featuredcategories?cc=us', { signal: AbortSignal.timeout(8000) }); if (!r.ok) return;
        const j = await r.json(), items = ((j.specials && j.specials.items) || []).filter((x) => x.discount_percent === 100 && x.id && x.name);
        for (const g of items.slice(0, 5)) {
            if (await env.DB.prepare('SELECT 1 x FROM freegames WHERE appid = ?').bind(g.id).first()) continue;
            await env.DB.prepare('INSERT INTO freegames(appid, name, at) VALUES(?, ?, ?)').bind(g.id, String(g.name).slice(0, 80), Date.now()).run();
            const uids = (await env.DB.prepare('SELECT DISTINCT uid FROM devices LIMIT 100').all()).results.map((x) => x.uid);
            for (let i = 0; i < uids.length; i += 25) await pushTo(env, uids.slice(i, i + 25), { t: 'free', title: 'Free to keep', body: g.name + ' is free on Steam right now', appid: String(g.id) });
        }
        await env.DB.prepare('DELETE FROM freegames WHERE at < ?').bind(Date.now() - 90 * 86400000).run();
    } catch (e) { }
}
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
const themeView = (t, full) => { const vars = typeof t.vars === 'string' ? JSON.parse(t.vars) : t.vars; const o = { id: t.id, name: t.name, desc: t.desc, author: t.author, authorUid: t.auid || '', creator: (t.cdl || 0) >= 25, likes: t.likes || 0, liked: !!t.liked, downloads: t.downloads || 0, verified: !!t.av, owner: t.av === 2, at: t.at, colors: ['--accent-color', '--bg-dark', '--accent-color-2'].map(k => vars[k]).filter(Boolean), vars, hasCss: t.hasCss !== undefined ? !!t.hasCss : !!(t.css && String(t.css).trim()) }; if (full) { o.css = t.css; } return o; };

// ---------- API keys: stored encrypted so a database leak alone does not expose them ----------
const b64 = (u8) => btoa(String.fromCharCode(...u8)), unb64 = (t) => Uint8Array.from(atob(t), (c) => c.charCodeAt(0));
async function aesKey(env) { const raw = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('steamlite-keys:' + String(env.KEY_SECRET || ''))); return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']); }
async function sealKey(env, plain) { const iv = crypto.getRandomValues(new Uint8Array(12)), ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await aesKey(env), new TextEncoder().encode(plain)); return { enc: b64(new Uint8Array(ct)), iv: b64(iv) }; }
async function openKey(env, enc, iv) { const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(iv) }, await aesKey(env), unb64(enc)); return new TextDecoder().decode(pt); }

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
async function steamProfile(id) { // the public profile page, no key needed
    try { const r = await fetch('https://steamcommunity.com/profiles/' + id + '/?xml=1'); const t = await r.text(); const m = /<steamID><!\[CDATA\[(.*?)\]\]><\/steamID>/s.exec(t), a = /<avatarFull><!\[CDATA\[(.*?)\]\]><\/avatarFull>/s.exec(t); return { name: m ? m[1] : '', avatar: a && /^https:\/\/[\w.-]+\.(steamstatic\.com|akamaihd\.net)\/[\w\/.-]{1,200}$/.test(a[1]) ? a[1] : '' }; } catch (e) { return { name: '', avatar: '' }; }
}
const page = (title, html) => new Response('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + title + '</title><body style="font-family:system-ui,sans-serif;background:#0b0b12;color:#eee;display:grid;place-items:center;min-height:100vh;margin:0"><div style="max-width:420px;padding:32px;text-align:center"><h2>' + title + '</h2><p style="color:#aab">' + html + '</p></div>', { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'", 'X-Content-Type-Options': 'nosniff' } });

const appId = (v) => { const n = Math.floor(Number(v)); return Number.isFinite(n) && n >= 1 && n <= 4294967295 ? n : 0; };
const REACT_OK = new Set(["👍","❤️","😂","😮","😢","🔥","🎉","👏","😍","🤔","👀","💯","🙏","😎","🤣","😭","😡","🥳","💀","✅","❌","🎮","👑","⭐","🙌","💪","🤝","😅","🥹","😴","🤯","💔"]);
async function auditLog(env, action, target, detail) { try { await env.DB.prepare('INSERT INTO audit(at, action, target, detail) VALUES(?, ?, ?, ?)').bind(Date.now(), String(action).slice(0, 30), String(target || '').slice(0, 64), String(detail || '').slice(0, 200)).run(); if (Math.random() < 0.02) await env.DB.prepare('DELETE FROM audit WHERE at < ?').bind(Date.now() - 90 * 86400000).run(); } catch (e) { } }

// ---------- routes ----------
// ---------- push notifications through Firebase Cloud Messaging (the phone app) ----------
let CTX = null, fcmTok = { v: '', exp: 0 };
const b64u = (buf) => { const u = new Uint8Array(buf); let s = ''; for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
async function fcmAccess(env) {
    if (fcmTok.v && fcmTok.exp > Date.now() + 60000) return fcmTok.v;
    const sa = JSON.parse(env.FCM_SA), now = Math.floor(Date.now() / 1000), enc = new TextEncoder();
    const head = b64u(enc.encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))), claim = b64u(enc.encode(JSON.stringify({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/firebase.messaging', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })));
    const der = Uint8Array.from(atob(sa.private_key.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '')), (c) => c.charCodeAt(0));
    const key = await crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
    const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, enc.encode(head + '.' + claim));
    const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=' + encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer') + '&assertion=' + head + '.' + claim + '.' + b64u(sig) });
    const j = await r.json().catch(() => ({})); if (!j.access_token) throw new Error('push sign-in failed ' + r.status);
    fcmTok = { v: j.access_token, exp: Date.now() + (j.expires_in || 3600) * 1000 }; return fcmTok.v;
}
async function fcmSendOne(env, token, data) {
    const sa = JSON.parse(env.FCM_SA), at = await fcmAccess(env), d = {}; for (const k of Object.keys(data)) d[/^(from|message_type|notification|google|gcm)/i.test(k) ? 'x_' + k : k] = String(data[k]).slice(0, 300);   // Firebase refuses the whole message if a key uses one of its reserved names
    const r = await fetch('https://fcm.googleapis.com/v1/projects/' + sa.project_id + '/messages:send', { method: 'POST', headers: { Authorization: 'Bearer ' + at, 'Content-Type': 'application/json' }, body: JSON.stringify({ message: { token, data: d, android: { priority: 'HIGH', ttl: '3600s' } } }) });
    return { status: r.status, body: (await r.text()).slice(0, 300) };
}
async function pushTo(env, uids, data) {
    if (!env.FCM_SA || !uids.length) return;
    try {
        const list = [...new Set(uids)].slice(0, 25), rows = (await env.DB.prepare('SELECT token FROM devices WHERE uid IN (' + list.map(() => '?').join(',') + ') LIMIT 60').bind(...list).all()).results;
        for (const r of rows) { const res = await fcmSendOne(env, r.token, data).catch(() => null); if (res && (res.status === 404 || (res.status === 400 && /registration token is not a valid/i.test(res.body)))) await env.DB.prepare('DELETE FROM devices WHERE token = ?').bind(r.token).run(); }
    } catch (e) { }
}
const push = (env, uids, data) => { const p = pushTo(env, uids, data); if (CTX && CTX.waitUntil) CTX.waitUntil(p); return p; };

// ---------- sale alerts for wishlist games (players opt in from the phone app) ----------
async function dealsRun(env, refresh) {
    let checked = 0, found = 0, pushed = 0;
    if (refresh) {
        const ids = (await env.DB.prepare('SELECT DISTINCT appid FROM wish LIMIT 300').all()).results.map((r) => r.appid);
        for (let i = 0; i < ids.length; i += 50) {
            const chunk = ids.slice(i, i + 50);
            try {
                const r = await fetch('https://store.steampowered.com/api/appdetails?appids=' + chunk.join(',') + '&filters=price_overview&cc=us', { signal: AbortSignal.timeout(8000) }); if (!r.ok) continue;
                const j = await r.json(), st = [];
                for (const id of chunk) { const e = j[id], po = e && e.success && e.data && e.data.price_overview, pct = po ? (po.discount_percent | 0) : 0; st.push(env.DB.prepare('INSERT INTO deals(appid, pct, price, at) VALUES(?, ?, ?, ?) ON CONFLICT(appid) DO UPDATE SET pct = excluded.pct, price = excluded.price, at = excluded.at').bind(id, pct, po ? String(po.final_formatted || '') : '', Date.now())); if (pct >= 20) found++; checked++; }
                await env.DB.batch(st);
            } catch (e) { }
        }
        await env.DB.prepare('UPDATE wish SET notified = 0 WHERE notified > 0 AND appid IN (SELECT appid FROM deals WHERE pct < 10)').run(); // once a sale is over, the next one tells you again
    }
    const rows = (await env.DB.prepare('SELECT w.uid, w.appid, w.name, d.pct, d.price FROM wish w JOIN deals d ON d.appid = w.appid WHERE d.pct >= 20 AND w.notified < d.pct ORDER BY w.uid LIMIT 60').all()).results, by = {};
    rows.forEach((r) => { (by[r.uid] = by[r.uid] || []).push(r); });
    for (const uid of Object.keys(by).slice(0, 8)) { // a few people per run, the rest next hour
        const list = by[uid].sort((a, b) => b.pct - a.pct), top = list[0];
        await pushTo(env, [uid], { t: 'deal', title: 'On sale', body: list.length === 1 ? top.name + ' is ' + top.pct + '% off (' + top.price + ')' : top.name + ' is ' + top.pct + '% off, and ' + (list.length - 1) + ' more on your wishlist', appid: top.appid });
        await env.DB.batch(list.map((r) => env.DB.prepare('UPDATE wish SET notified = ? WHERE uid = ? AND appid = ?').bind(r.pct, uid, r.appid))); pushed++;
    }
    return { checked, found, pushed };
}

const profileView = (pr) => { let sc = []; try { sc = JSON.parse((pr && pr.showcase) || '[]'); } catch (e) { } let bn = null; try { bn = pr && pr.banner ? JSON.parse(pr.banner) : null; } catch (e) { } return { status: pr && pr.status_until > Date.now() ? pr.status || '' : '', tagline: (pr && pr.tagline) || '', accent: (pr && pr.accent) || '', frame: (pr && pr.frame) || '', title: (pr && pr.title) || '', showcase: sc, banner: bn, hideBadges: !!(pr && pr.hide_badges), prestige: (pr && pr.prestige) || 0 }; };

async function route(req, env) {
    const url = new URL(req.url), p = url.pathname, m = req.method, q = url.searchParams, addr = ip(req);
    if (p === '/' || p === '/health') return J(200, { ok: true, name: 'SteamLite Online', time: Date.now() });
    { const wm = /^\/wl\/([a-z0-9]{10,20})$/.exec(p); if (wm && m === 'GET') return wishPage(env, wm[1]); }

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
            const r = await env.DB.prepare('UPDATE themes SET status = ? WHERE id = ?').bind(mm[2] === 'approve' ? 'approved' : 'rejected', mm[1]).run(); if (r.meta.changes) await auditLog(env, 'theme-' + mm[2], mm[1], '');
            return r.meta.changes ? J(200, { ok: true }) : J(404, { error: 'No such theme' });
        }
        if (p === '/admin/status' && m === 'PUT') { const b = await body(req, 60000); if (!b || typeof b !== 'object') return J(400, { error: 'Bad status' }); await kvSet(env, 'status', { motd: cleanText(b.motd, 200), announcements: (Array.isArray(b.announcements) ? b.announcements : []).slice(0, 10), gifts: (Array.isArray(b.gifts) ? b.gifts : []).slice(0, 10) }); return J(200, { ok: true }); }
        if (p === '/admin/polls' && m === 'PUT') { const b = await body(req, 60000); if (!b || !Array.isArray(b.polls)) return J(400, { error: 'Bad polls' }); await kvSet(env, 'polls', b); return J(200, { ok: true }); }
        if (p === '/admin/users' && m === 'GET') {
            const qs = cleanText(q.get('q') || '', 40).toLowerCase().replace(/[%_]/g, ''), like = '%' + qs + '%', code = qs.replace(/^sl-/, '');
            const base = "SELECT a.uid, a.name, a.avatar, a.steamid, a.created, a.last, a.verified, EXISTS(SELECT 1 FROM bans b WHERE b.uid = a.uid AND b.until > ?1) banned, EXISTS(SELECT 1 FROM apikeys k WHERE k.steamid = a.steamid) haskey, COALESCE((SELECT s.flags FROM stats s WHERE s.uid = a.uid), 0) flags FROM accounts a";
            const rows = (qs ? (await env.DB.prepare(base + " WHERE lower(a.name) LIKE ?2 OR a.steamid = ?3 OR (length(?4) >= 6 AND a.uid LIKE ?5) ORDER BY a.verified DESC, a.last DESC LIMIT 40").bind(Date.now(), like, qs, code, code + '%').all()) : (await env.DB.prepare(base + ' ORDER BY a.verified DESC, a.last DESC LIMIT 40').bind(Date.now()).all())).results;
            return J(200, { users: rows.map(r => ({ uid: r.uid, name: r.name, avatar: r.avatar, steamid: r.steamid, created: r.created, last: r.last, tier: r.verified === 2 ? 'owner' : r.verified ? 'verified' : 'none', verified: !!r.verified, owner: r.verified === 2, banned: !!r.banned, hasKey: !!r.haskey, flags: r.flags || 0, code: 'SL-' + r.uid.slice(0, 10).toUpperCase() })), total: (await env.DB.prepare('SELECT COUNT(*) c FROM accounts').first()).c });
        }
        if (p === '/admin/messages' && m === 'GET') {
            const qs = cleanText(q.get('q') || '', 40).toLowerCase().replace(/[%_]/g, ''); if (qs.length < 2) return J(200, { messages: [] });
            const rows = (await env.DB.prepare("SELECT x.id, x.conv, x.text, x.at, x.uid, a.name FROM msgs x LEFT JOIN accounts a ON a.uid = x.uid WHERE lower(x.text) LIKE ? ORDER BY x.id DESC LIMIT 50").bind('%' + qs + '%').all()).results;
            return J(200, { messages: rows.map(r => ({ id: r.id, conv: r.conv, uid: r.uid, name: r.name || '(deleted)', text: String(r.text).slice(0, 300), at: r.at })) });
        }
        if (p === '/admin/audit' && m === 'GET') return J(200, { entries: (await env.DB.prepare('SELECT at, action, target, detail FROM audit ORDER BY at DESC LIMIT 60').all()).results });
        if (p === '/admin/verify' && m === 'POST') {
            const b = await body(req, 500); if (!uidOk(b.uid)) return J(400, { error: 'Bad uid' });
            const tier = b.tier === 'owner' ? 2 : b.tier === 'none' || b.on === false ? 0 : 1; // "verified" is the default for older callers
            const r = await env.DB.prepare('UPDATE accounts SET verified = ? WHERE uid = ?').bind(tier, b.uid).run();
            if (r.meta.changes) await auditLog(env, tier === 2 ? 'make-owner' : tier === 1 ? 'verify' : 'unverify', b.uid, '');
            return r.meta.changes ? J(200, { ok: true, tier: tier === 2 ? 'owner' : tier === 1 ? 'verified' : 'none' }) : J(404, { error: 'No such player' });
        }
        if (p === '/admin/themes' && m === 'GET') { const rows = (await env.DB.prepare("SELECT t.id, t.name, t.author, t.at, t.downloads, (SELECT COUNT(*) FROM theme_likes l WHERE l.theme_id = t.id) likes FROM themes t WHERE t.status = 'approved' ORDER BY t.at DESC LIMIT 60").all()).results; return J(200, { themes: rows }); }
        if (p === '/admin/reports' && m === 'GET') {
            const rows = (await env.DB.prepare("SELECT r.id, r.at, r.reason, r.snap, r.conv, r.target, t.name tname, rp.name rname, EXISTS(SELECT 1 FROM bans b WHERE b.uid = r.target AND b.until > ?) banned FROM reports r LEFT JOIN accounts t ON t.uid = r.target LEFT JOIN accounts rp ON rp.uid = r.reporter WHERE r.status = 'open' ORDER BY r.at DESC LIMIT 50").bind(Date.now()).all()).results;
            return J(200, { reports: rows.map(r => ({ id: r.id, at: r.at, reason: r.reason, text: r.snap, conv: r.conv, target: r.target, targetName: r.tname || '(deleted)', reporterName: r.rname || '(deleted)', banned: !!r.banned })) });
        }
        if ((mm = /^\/admin\/report\/([a-f0-9]{12})\/resolve$/.exec(p)) && m === 'POST') { await env.DB.prepare("UPDATE reports SET status = 'done' WHERE id = ?").bind(mm[1]).run(); return J(200, { ok: true }); }
        if (p === '/admin/ban' && m === 'POST') { const b = await body(req, 1000); if (!uidOk(b.uid)) return J(400, { error: 'Bad uid' }); const hours = clamp(b.hours || 24, 1, 24 * 3650); await env.DB.prepare('INSERT INTO bans(uid, until, reason) VALUES(?, ?, ?) ON CONFLICT(uid) DO UPDATE SET until = excluded.until, reason = excluded.reason').bind(b.uid, Date.now() + hours * 3600000, cleanText(b.reason, 200)).run(); await auditLog(env, 'mute', b.uid, hours + 'h ' + cleanText(b.reason, 100)); return J(200, { ok: true }); }
        if (p === '/admin/deals-run' && m === 'POST') { try { const b = await body(req, 300); return J(200, { ok: true, result: await dealsRun(env, b.refresh !== false) }); } catch (e) { return J(200, { ok: false, error: String(e.message) }); } }
        if (p === '/admin/push-test' && m === 'POST') { const b = await body(req, 2000); if (!env.FCM_SA) return J(200, { ok: false, error: 'FCM_SA secret is not set' }); try { const r = await fcmSendOne(env, String(b.token || 'x'.repeat(100)), Object.assign({ t: 'test', title: 'SteamLite', body: 'Test notification' }, b.data && typeof b.data === 'object' ? b.data : {})); return J(200, { ok: true, status: r.status, body: r.body }); } catch (e) { return J(200, { ok: false, error: String(e.message) }); } }
        if (p === '/admin/unban' && m === 'POST') { const b = await body(req, 500); if (!uidOk(b.uid)) return J(400, { error: 'Bad uid' }); await env.DB.prepare('DELETE FROM bans WHERE uid = ?').bind(b.uid).run(); await auditLog(env, 'unmute', b.uid, ''); return J(200, { ok: true }); }
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
        const prof = await steamProfile(steamid), name = cleanName(prof.name) || 'Player ' + steamid.slice(-4), now = Date.now(), au = await uidFor(steamid);
        await env.DB.prepare('INSERT INTO accounts(steamid, uid, name, avatar, created, last) VALUES(?, ?, ?, ?, ?, ?) ON CONFLICT(steamid) DO UPDATE SET name = excluded.name, avatar = excluded.avatar, last = excluded.last').bind(steamid, au, name, prof.avatar, now, now).run();
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
        const a = await env.DB.prepare('SELECT avatar, verified, created FROM accounts WHERE steamid = ?').bind(acct.steamid).first();
        const k = await env.DB.prepare('SELECT 1 x FROM apikeys WHERE steamid = ?').bind(acct.steamid).first();
        return J(200, { steamid: acct.steamid, name: acct.name, avatar: a ? a.avatar : '', verified: !!(a && a.verified), owner: !!(a && a.verified === 2), created: a ? a.created : 0, code: 'SL-' + acct.uid.slice(0, 10).toUpperCase(), hasKey: !!k, backupAt: b ? b.at : 0, prevAt: b ? b.prev_at : 0 });
    }
    if (p === '/me/avatar' && m === 'POST') { // the app sends the Steam profile picture, so the SteamLite account uses the same one
        if (!acct) return J(401, { error: 'Sign in first' });
        if (await limited(env, 'av' + acct.steamid, 10, 3600000)) return J(200, { ok: true });
        const b = await body(req, 600), a = String(b.avatar || '');
        if (!/^https:\/\/[\w.-]+\.(steamstatic\.com|akamaihd\.net)\/[\w\/.-]{1,200}$/.test(a)) return J(400, { error: 'That picture address is not allowed.' });
        await env.DB.prepare('UPDATE accounts SET avatar = ? WHERE steamid = ?').bind(a, acct.steamid).run(); return J(200, { ok: true });
    }
    if (p === '/me/key') {
        if (!acct) return J(401, { error: 'Sign in first' });
        if (m === 'GET') {
            const r = await env.DB.prepare('SELECT enc, iv FROM apikeys WHERE steamid = ?').bind(acct.steamid).first(); if (!r) return J(404, { error: 'No key saved' });
            try { return J(200, { key: await openKey(env, r.enc, r.iv) }); } catch (e) { await env.DB.prepare('DELETE FROM apikeys WHERE steamid = ?').bind(acct.steamid).run(); return J(404, { error: 'No key saved' }); }
        }
        if (m === 'PUT') {
            if (!env.KEY_SECRET) return J(503, { error: 'Key storage is not set up on the server yet.' });
            if (await limited(env, 'ky' + acct.steamid, 12, 3600000)) return J(429, { error: 'Too many tries. Wait a little and try again.' });
            const b = await body(req, 400), key = String(b.key || '').trim();
            if (!/^[A-Fa-f0-9]{32}$/.test(key)) return J(400, { error: 'That does not look like a Steam Web API key. It is 32 letters and numbers.' });
            if (env.DEV_SKIP_KEY_CHECK !== '1') {
                let ok = false; try { const r = await fetch('https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=' + key + '&steamids=' + acct.steamid); if (r.ok) { const j = await r.json(); ok = !!(j && j.response && j.response.players && j.response.players.length); } } catch (e) { return J(502, { error: 'Could not reach Steam to check the key. Try again in a moment.' }); }
                if (!ok) return J(400, { error: 'Steam did not accept that key. Check you copied all of it.' });
            }
            const sealed = await sealKey(env, key.toUpperCase());
            await env.DB.prepare('INSERT INTO apikeys(steamid, enc, iv, at) VALUES(?, ?, ?, ?) ON CONFLICT(steamid) DO UPDATE SET enc = excluded.enc, iv = excluded.iv, at = excluded.at').bind(acct.steamid, sealed.enc, sealed.iv, Date.now()).run();
            return J(200, { ok: true });
        }
        if (m === 'DELETE') { await env.DB.prepare('DELETE FROM apikeys WHERE steamid = ?').bind(acct.steamid).run(); return J(200, { ok: true }); }
    }
    if (p === '/logout' && m === 'POST') { if (acct) await env.DB.prepare('DELETE FROM sessions WHERE h = ?').bind(acct.h).run(); return J(200, { ok: true }); }
    if (p === '/account' && m === 'DELETE') {
        if (!acct) return J(401, { error: 'Not signed in' });
        const id = acct.steamid, u = acct.uid;
        await env.DB.batch([env.DB.prepare('DELETE FROM sessions WHERE steamid = ?').bind(id), env.DB.prepare('DELETE FROM backups WHERE steamid = ?').bind(id), env.DB.prepare('DELETE FROM lb WHERE uid = ?').bind(u),
            env.DB.prepare('DELETE FROM theme_likes WHERE uid = ?').bind(u), env.DB.prepare('DELETE FROM votes WHERE uid = ?').bind(u), env.DB.prepare('DELETE FROM themes WHERE uid = ?').bind(u),
            env.DB.prepare('DELETE FROM friends WHERE a = ?1 OR b = ?1').bind(u), env.DB.prepare('DELETE FROM streaks WHERE a = ?1 OR b = ?1').bind(u), env.DB.prepare('DELETE FROM daystreak WHERE uid = ?').bind(u), env.DB.prepare('DELETE FROM sched WHERE uid = ?').bind(u), env.DB.prepare('DELETE FROM wishshare WHERE uid = ?').bind(u), env.DB.prepare('DELETE FROM blocks WHERE uid = ?1 OR target = ?1').bind(u), env.DB.prepare('DELETE FROM msgs WHERE uid = ?').bind(u), env.DB.prepare('DELETE FROM members WHERE uid = ?').bind(u), env.DB.prepare('DELETE FROM apikeys WHERE steamid = ?').bind(id), env.DB.prepare('DELETE FROM reactions WHERE uid = ?').bind(u), env.DB.prepare('DELETE FROM media WHERE uid = ?').bind(u), env.DB.prepare('DELETE FROM devices WHERE uid = ?').bind(u), env.DB.prepare('DELETE FROM wish WHERE uid = ?').bind(u), env.DB.prepare('DELETE FROM profiles WHERE uid = ?').bind(u), env.DB.prepare('DELETE FROM activity WHERE uid = ?').bind(u), env.DB.prepare('DELETE FROM gvotes WHERE uid = ?').bind(u), env.DB.prepare('DELETE FROM pcs WHERE uid = ?').bind(u), env.DB.prepare('DELETE FROM cmds WHERE uid = ?').bind(u), env.DB.prepare('DELETE FROM presence WHERE uid = ?').bind(u), env.DB.prepare('DELETE FROM stats WHERE uid = ?').bind(u), env.DB.prepare('DELETE FROM lists WHERE uid = ?').bind(u), env.DB.prepare('DELETE FROM challenge_members WHERE uid = ?').bind(u), env.DB.prepare('DELETE FROM accounts WHERE steamid = ?').bind(id)]);
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

    if (p === '/push/register' && m === 'POST') {
        if (!acct) return J(401, { error: 'Sign in first' });
        if (await limited(env, 'pu' + acct.uid, 30, 3600000)) return J(200, { ok: true });
        const b = await body(req, 600), t = String(b.token || ''); if (!/^[\w:.\-]{80,400}$/.test(t)) return J(400, { error: 'Bad token' });
        await env.DB.prepare('INSERT INTO devices(token, uid, at) VALUES(?, ?, ?) ON CONFLICT(token) DO UPDATE SET uid = excluded.uid, at = excluded.at').bind(t, acct.uid, Date.now()).run();
        await env.DB.prepare('DELETE FROM devices WHERE uid = ? AND token NOT IN (SELECT token FROM devices WHERE uid = ? ORDER BY at DESC LIMIT 5)').bind(acct.uid, acct.uid).run();
        return J(200, { ok: true, enabled: !!env.FCM_SA });
    }
    if (p === '/push/test' && m === 'POST') { // "send me a test notification": says what Firebase answered for each of your phones
        if (!acct) return J(401, { error: 'Sign in first' });
        if (await limited(env, 'ptt' + acct.uid, 8, 3600000)) return J(429, { error: 'You tried a lot of times. Wait a little.' });
        if (!env.FCM_SA) return J(200, { ok: false, error: 'Push is not set up on the server yet.' });
        const rows = (await env.DB.prepare('SELECT token FROM devices WHERE uid = ? ORDER BY at DESC LIMIT 5').bind(acct.uid).all()).results, results = [];
        for (const r of rows) { try { const x = await fcmSendOne(env, r.token, { t: 'test', title: 'SteamLite', body: 'It works! This is a test notification.' }); results.push({ status: x.status, gone: x.status === 404 }); if (x.status === 404) await env.DB.prepare('DELETE FROM devices WHERE token = ?').bind(r.token).run(); } catch (e) { results.push({ status: 0, error: String(e.message).slice(0, 80) }); } }
        return J(200, { ok: true, devices: rows.length, results });
    }
    if (p === '/push/unregister' && m === 'POST') { if (!acct) return J(401, { error: 'Sign in first' }); const b = await body(req, 600); await env.DB.prepare('DELETE FROM devices WHERE token = ? AND uid = ?').bind(String(b.token || ''), acct.uid).run(); return J(200, { ok: true }); }
    if (p === '/me/streak') { // GET: your play streak and the phone days the PC has not folded in yet. POST (PC): the real numbers
        if (!acct) return J(401, { error: 'Sign in first' });
        if (m === 'POST') {
            const b = await body(req, 400), cur = clamp(b.current, 0, 9999), best = clamp(b.best, 0, 9999), last = /^\d{4}-\d{2}-\d{2}$/.test(String(b.lastPlayDay || '')) ? String(b.lastPlayDay) : '';
            const prev = await env.DB.prepare('SELECT phone_days FROM daystreak WHERE uid = ?').bind(acct.uid).first(); let days = []; try { days = JSON.parse(prev && prev.phone_days || '[]'); } catch (e) { }
            days = days.filter((d) => d > last);   // days the PC has already counted are done
            await env.DB.prepare('INSERT INTO daystreak(uid, cur, best, last_day, phone_days, at) VALUES(?, ?, ?, ?, ?, ?) ON CONFLICT(uid) DO UPDATE SET cur = excluded.cur, best = excluded.best, last_day = excluded.last_day, phone_days = excluded.phone_days, at = excluded.at').bind(acct.uid, cur, best, last, JSON.stringify(days), Date.now()).run();
            return J(200, { ok: true });
        }
        const r = await env.DB.prepare('SELECT cur, best, last_day, phone_days FROM daystreak WHERE uid = ?').bind(acct.uid).first(); let days = []; try { days = JSON.parse(r && r.phone_days || '[]'); } catch (e) { }
        return J(200, { ok: true, current: r ? r.cur : 0, best: r ? r.best : 0, lastPlayDay: r ? r.last_day : '', phoneDays: days });
    }
    if (p === '/me/deals' && m === 'GET') { // your wishlist games that are on sale right now
        if (!acct) return J(401, { error: 'Sign in first' });
        const rows = (await env.DB.prepare('SELECT w.appid, w.name, d.pct, d.price FROM wish w JOIN deals d ON d.appid = w.appid WHERE w.uid = ? AND d.pct >= 10 ORDER BY d.pct DESC LIMIT 20').bind(acct.uid).all()).results;
        return J(200, { ok: true, deals: rows });
    }
    if (p === '/me/wishshare') { // a public page with your wishlist (you can switch it off again)
        if (!acct) return J(401, { error: 'Sign in first' });
        if (m === 'DELETE') { await env.DB.prepare('DELETE FROM wishshare WHERE uid = ?').bind(acct.uid).run(); return J(200, { ok: true }); }
        if (m === 'POST') {
            const b = await body(req, 20000), items = [], seen = new Set();
            for (const it of (Array.isArray(b.items) ? b.items : [])) { const id = appId(it && it.appid); if (!id || seen.has(id)) continue; seen.add(id); items.push({ appid: id, name: cleanText(it.name, 80) || ('App ' + id) }); if (items.length >= 150) break; }
            if (!items.length) return J(400, { error: 'Your wishlist is empty.' });
            const old = await env.DB.prepare('SELECT code FROM wishshare WHERE uid = ?').bind(acct.uid).first(), code = old ? old.code : HEX(7);
            await env.DB.prepare('INSERT INTO wishshare(uid, code, name, items, at) VALUES(?, ?, ?, ?, ?) ON CONFLICT(uid) DO UPDATE SET items = excluded.items, name = excluded.name, at = excluded.at').bind(acct.uid, code, acct.name, JSON.stringify(items), Date.now()).run();
            return J(200, { ok: true, url: new URL(req.url).origin + '/wl/' + code });
        }
    }
    if (p === '/me/wishlist') { // the phone app sends your wishlist so the server can tell you when something goes on sale
        if (!acct) return J(401, { error: 'Sign in first' });
        if (m === 'DELETE') { await env.DB.prepare('DELETE FROM wish WHERE uid = ?').bind(acct.uid).run(); return J(200, { ok: true }); }
        if (m === 'POST') {
            if (await limited(env, 'wl' + acct.uid, 24, 3600000)) return J(200, { ok: true });
            const b = await body(req, 20000), items = []; const seen = new Set();
            for (const it of (Array.isArray(b.items) ? b.items : [])) { const id = appId(it && it.appid); if (!id || seen.has(id)) continue; seen.add(id); items.push({ id, name: cleanText(it.name, 80) || ('App ' + id) }); if (items.length >= 150) break; }
            const old = new Map((await env.DB.prepare('SELECT appid, notified FROM wish WHERE uid = ?').bind(acct.uid).all()).results.map((r) => [r.appid, r.notified]));
            await env.DB.batch([env.DB.prepare('DELETE FROM wish WHERE uid = ?').bind(acct.uid)].concat(items.map((x) => env.DB.prepare('INSERT INTO wish(uid, appid, name, notified) VALUES(?, ?, ?, ?)').bind(acct.uid, x.id, x.name, old.get(x.id) || 0))));
            return J(200, { ok: true, n: items.length });
        }
    }
    // ----- "Launch on my PC": the phone asks, the PC app (when the player allows it) starts the game -----
    if (p === '/pc/pending' && (m === 'GET' || m === 'POST')) { // the PC app checks in here; this also tells the phone the PC is online
        if (!acct) return J(401, { error: 'Sign in first' });
        if (await limited(env, 'pcp' + acct.uid, 400, 3600000)) return J(200, { ok: true, cmds: [] });
        const now = Date.now(); await env.DB.prepare('INSERT INTO pcs(uid, at) VALUES(?, ?) ON CONFLICT(uid) DO UPDATE SET at = excluded.at').bind(acct.uid, now).run();
        const rows = (await env.DB.prepare('UPDATE cmds SET taken = 1 WHERE uid = ? AND taken = 0 AND at > ? RETURNING id, appid, name').bind(acct.uid, now - 120000).all()).results;
        if (Math.random() < 0.05) await env.DB.prepare('DELETE FROM cmds WHERE at < ?').bind(now - 3600000).run();
        return J(200, { ok: true, cmds: rows });
    }
    if (p === '/pc/status' && m === 'GET') { if (!acct) return J(401, { error: 'Sign in first' }); const r = await env.DB.prepare('SELECT at FROM pcs WHERE uid = ?').bind(acct.uid).first(); return J(200, { ok: true, online: !!(r && r.at > Date.now() - 90000) }); }
    if (p === '/pc/launch' && m === 'POST') {
        if (!acct) return J(401, { error: 'Sign in first' });
        if (await limited(env, 'pcl' + acct.uid, 20, 3600000)) return J(429, { error: 'You asked a lot of times. Try again in a while.' });
        const b = await body(req, 600), id = appId(b.appid); if (!id) return J(400, { error: 'Pick a game.' });
        const r = await env.DB.prepare('SELECT at FROM pcs WHERE uid = ?').bind(acct.uid).first(); if (!r || r.at < Date.now() - 90000) return J(409, { error: 'Your PC is not online. Open SteamLite on it and turn on "Let my phone launch games".' });
        await env.DB.prepare('INSERT INTO cmds(id, uid, appid, name, at, taken) VALUES(?, ?, ?, ?, ?, 0)').bind(HEX(8), acct.uid, id, cleanText(b.name, 80), Date.now()).run();
        return J(200, { ok: true });
    }
    // ----- error reports from the apps (shown in the admin Activity log) -----
    if (p === '/client-error' && m === 'POST') {
        if (await limited(env, 'ce' + addr, 12, 3600000)) return J(200, { ok: true });
        const b = await body(req, 3000); await auditLog(env, 'app-error', acct ? acct.uid : addr, cleanText((b.app || 'app') + ' ' + (b.v || '') + ': ' + (b.msg || ''), 190)); return J(200, { ok: true });
    }

    // ----- photos and voice messages: small files kept for 30 days, served by an unguessable address -----
    const MEDIA_MIME = { 'image/jpeg': 'img', 'image/png': 'img', 'image/gif': 'img', 'image/webp': 'img', 'audio/mp4': 'aud', 'audio/aac': 'aud', 'audio/mpeg': 'aud', 'audio/webm': 'aud', 'audio/ogg': 'aud' };
    let mm;
    if ((mm = /^\/media\/([a-f0-9]{24})$/.exec(p)) && m === 'GET') {
        const r = await env.DB.prepare('SELECT mime, data FROM media WHERE id = ?').bind(mm[1]).first(); if (!r) return J(404, { error: 'Not found' });
        const bin = atob(r.data), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
        return new Response(u8, { headers: { 'Content-Type': r.mime, 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; sandbox", 'Accept-Ranges': 'none' } });
    }
    if (p === '/media' && m === 'POST') {
        if (!acct) return J(401, { error: 'Sign in first' });
        if (await env.DB.prepare('SELECT 1 x FROM bans WHERE uid = ? AND until > ?').bind(acct.uid, Date.now()).first()) return J(403, { error: 'Your messaging is turned off.' });
        if (await limited(env, 'md' + acct.uid, 40, 3600000)) return J(429, { error: 'You sent a lot of files. Try again in a while.' });
        const b = await body(req, 1500000), mime = String(b.mime || ''), data = String(b.data || '');
        if (!MEDIA_MIME[mime] || !/^[A-Za-z0-9+/]+=*$/.test(data) || data.length < 100) return J(400, { error: 'That file type is not allowed.' });
        const size = Math.floor(data.length * 3 / 4); if (size > 1000000) return J(413, { error: 'That file is too big (1 MB max).' });
        let head = ''; try { head = atob(data.slice(0, 24)); } catch (e) { return J(400, { error: 'Bad file.' }); }
        const okMagic = MEDIA_MIME[mime] === 'img' ? (head.startsWith('\xff\xd8') || head.startsWith('\x89PNG') || head.startsWith('GIF8') || (head.startsWith('RIFF') && head.slice(8, 12) === 'WEBP')) : (head.slice(4, 8) === 'ftyp' || head.startsWith('ID3') || head.startsWith('\xff\xf1') || head.startsWith('\xff\xf9') || head.startsWith('\xff\xfb') || head.startsWith('\x1aE\xdf\xa3') || head.startsWith('OggS'));
        if (!okMagic) return J(400, { error: 'That does not look like a real file.' });
        const day = (await env.DB.prepare('SELECT COUNT(*) c FROM media WHERE uid = ? AND at > ?').bind(acct.uid, Date.now() - 86400000).first()).c; if (day >= 80) return J(429, { error: 'Daily file limit reached.' });
        const id = HEX(12); await env.DB.prepare('INSERT INTO media(id, uid, mime, data, at) VALUES(?, ?, ?, ?, ?)').bind(id, acct.uid, mime, data, Date.now()).run();
        return J(200, { ok: true, id });
    }

    // ----- friends, messages, group chats and friend streaks (signed-in players only) -----
    if (p.startsWith('/social/')) {
        if (!acct) return J(401, { error: 'Sign in first' });
        const me = acct.uid, today = Math.floor(Date.now() / 86400000), isGet = m === 'GET';
        const banned = async () => !!(await env.DB.prepare('SELECT 1 x FROM bans WHERE uid = ? AND until > ?').bind(me, Date.now()).first());
        if (!isGet && await banned()) return J(403, { error: 'Your messaging is turned off.' });
        if (await limited(env, 'so' + me, isGet ? 600 : 120, 60000)) return J(429, { error: 'Slow down' });
        const pair = (x, y) => x < y ? [x, y] : [y, x];
        const first = (sql, ...a) => env.DB.prepare(sql).bind(...a).first(), all = async (sql, ...a) => (await env.DB.prepare(sql).bind(...a).all()).results;
        const friendsWith = async (x, y) => { const [a, b] = pair(x, y); return !!(await first("SELECT 1 x FROM friends WHERE a = ? AND b = ? AND status = 'accepted'", a, b)); };
        const blockedEither = async (x, y) => !!(await first('SELECT 1 x FROM blocks WHERE (uid = ?1 AND target = ?2) OR (uid = ?2 AND target = ?1)', x, y));
        const acctOf = (u) => first('SELECT uid, name, avatar, verified FROM accounts WHERE uid = ?', u);
        const view = (a) => a ? { uid: a.uid, name: a.name, avatar: a.avatar || '', verified: !!a.verified, owner: a.verified === 2 } : { uid: '', name: 'Deleted player', avatar: '', verified: false, owner: false };
        const streakView = (s) => { if (!s) return { streak: 0, best: 0, atRisk: false, doneToday: false, mineToday: false, theirsToday: false }; const mine = s.a === me ? s.a_day : s.b_day, theirs = s.a === me ? s.b_day : s.a_day, cur = s.last_day >= today - 1 ? s.streak : 0; return { streak: cur, best: s.best, doneToday: s.last_day === today, mineToday: mine === today, theirsToday: theirs === today, atRisk: cur > 0 && s.last_day === today - 1 }; };
        const inConv = (c) => first('SELECT m.role, m.last_read, m.muted, m.muted_until, c.kind, c.name, c.owner FROM members m JOIN convs c ON c.id = m.conv WHERE m.conv = ? AND m.uid = ?', c, me);
        const presenceOf = async (uids) => { const out = {}; if (!uids.length) return out; const now = Date.now(); for (let i = 0; i < uids.length; i += 50) { const ch = uids.slice(i, i + 50); (await all('SELECT uid, game_id, game_name, at FROM presence WHERE uid IN (' + ch.map(() => '?').join(',') + ')', ...ch)).forEach(r => { const on = r.at > now - 150000; out[r.uid] = { online: on, playing: on && r.game_id ? { appid: r.game_id, name: r.game_name } : null, lastSeen: r.at }; }); } return out; };
        const clean = (t) => String(t == null ? '' : t).replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '').replace(/\r\n?/g, '\n').trim();
        const cid = (v) => /^[dg][a-f0-9]{16,40}$/.test(String(v || '')) ? String(v) : '';
        const code = (u) => 'SL-' + u.slice(0, 10).toUpperCase();

        if (p === '/social/overview' && isGet) {
            const fr = await all("SELECT f.a, f.b, f.status, f.req_by, ac.uid fuid, ac.name, ac.avatar, ac.verified, ac.created since, (SELECT CASE WHEN p.status_until > ?2 THEN p.status ELSE '' END FROM profiles p WHERE p.uid = ac.uid) fst FROM friends f JOIN accounts ac ON ac.uid = CASE WHEN f.a = ?1 THEN f.b ELSE f.a END WHERE f.a = ?1 OR f.b = ?1 LIMIT 300", me, Date.now());
            { const sp = runSched(env).catch(() => { }); if (CTX && CTX.waitUntil) CTX.waitUntil(sp); }
            const st = await all('SELECT * FROM streaks WHERE a = ?1 OR b = ?1', me), stMap = {}; st.forEach(s => { stMap[s.a === me ? s.b : s.a] = s; });
            const pres = await presenceOf(fr.filter(f => f.status === 'accepted').map(f => f.fuid));
            const friends = fr.filter(f => f.status === 'accepted').map(f => Object.assign(view({ uid: f.fuid, name: f.name, avatar: f.avatar, verified: f.verified }), { since: f.since || 0, status: f.fst || '' }, streakView(stMap[f.fuid]), pres[f.fuid] || { online: false, playing: null })).sort((x, y) => y.streak - x.streak || x.name.localeCompare(y.name));
            const incoming = fr.filter(f => f.status === 'pending' && f.req_by !== me).map(f => view({ uid: f.fuid, name: f.name, avatar: f.avatar, verified: f.verified })), outgoing = fr.filter(f => f.status === 'pending' && f.req_by === me).map(f => view({ uid: f.fuid, name: f.name, avatar: f.avatar, verified: f.verified }));
            const cv = await all('SELECT c.id, c.kind, c.name, c.avatar gav, c.last_at, CASE WHEN mm.muted = 1 OR mm.muted_until > ?2 THEN 1 ELSE 0 END AS muted, (SELECT COUNT(*) FROM msgs x WHERE x.conv = c.id AND x.id > mm.last_read AND x.uid != ?1) unread, (SELECT text FROM msgs x WHERE x.conv = c.id ORDER BY x.id DESC LIMIT 1) ltext, (SELECT uid FROM msgs x WHERE x.conv = c.id ORDER BY x.id DESC LIMIT 1) luid, (SELECT COUNT(*) FROM members z WHERE z.conv = c.id) n FROM members mm JOIN convs c ON c.id = mm.conv WHERE mm.uid = ?1 ORDER BY c.last_at DESC LIMIT 60', me, Date.now());
            const peers = await all("SELECT m1.conv, ac.uid, ac.name, ac.avatar, ac.verified FROM members m1 JOIN convs c ON c.id = m1.conv AND c.kind = 'dm' JOIN members m2 ON m2.conv = m1.conv AND m2.uid != m1.uid JOIN accounts ac ON ac.uid = m2.uid WHERE m1.uid = ?", me), peerOf = {}; peers.forEach(x => { peerOf[x.conv] = x; });
            const names = {}; fr.forEach(f => { names[f.fuid] = f.name; }); names[me] = acct.name;
            const convs = cv.map(c => { const pr = peerOf[c.id]; return { id: c.id, kind: c.kind, name: c.kind === 'dm' ? (pr ? pr.name : 'Deleted player') : c.name, avatar: pr ? (pr.avatar || '') : (c.gav ? url.origin + '/media/' + c.gav : ''), verified: pr ? !!pr.verified : false, owner: pr ? pr.verified === 2 : false, peer: pr ? pr.uid : '', members: c.n, unread: c.unread, muted: !!c.muted, at: c.last_at, last: c.ltext ? { text: String(c.ltext).slice(0, 120), mine: c.luid === me, from: names[c.luid] || '' } : null }; });
            return J(200, { me: { uid: me, name: acct.name, code: code(me) }, friends, incoming, outgoing, convs, unread: convs.reduce((s, c) => s + c.unread, 0) });
        }
        if (p === '/social/find' && m === 'POST') {
            if (await limited(env, 'sf' + me, 30, 3600000)) return J(429, { error: 'Searched too often. Try again later.' });
            const b = await body(req, 20000), out = [];
            if (typeof b.code === 'string') {
                const c = b.code.trim().toLowerCase().replace(/^sl-/, '');
                if (/^[a-f0-9]{8,32}$/.test(c)) { const r = await all('SELECT uid, name, avatar, verified FROM accounts WHERE uid LIKE ? LIMIT 2', c + '%'); if (r.length === 1 && r[0].uid !== me) out.push(view(r[0])); }
                return J(200, { found: out });
            }
            const ids = (Array.isArray(b.steamids) ? b.steamids : []).map(String).filter(x => /^\d{17}$/.test(x)).slice(0, 300);
            const uids = []; for (const s of ids) uids.push(await uidFor(s));
            for (let i = 0; i < uids.length; i += 50) { const ch = uids.slice(i, i + 50); (await all('SELECT uid, name, avatar, verified FROM accounts WHERE uid IN (' + ch.map(() => '?').join(',') + ')', ...ch)).forEach(r => { if (r.uid !== me) out.push(view(r)); }); }
            return J(200, { found: out });
        }
        if (p === '/social/friend' && m === 'POST') {
            const b = await body(req, 500), t = b.uid; if (!uidOk(t) || t === me) return J(400, { error: 'Bad request' });
            if (await limited(env, 'sr' + me, 40, 86400000)) return J(429, { error: 'You sent a lot of requests today. Try again tomorrow.' });
            if (!(await acctOf(t))) return J(404, { error: 'That player was not found.' });
            if (await blockedEither(me, t)) return J(403, { error: 'You cannot add this player.' });
            const [a, c] = pair(me, t), row = await first('SELECT status, req_by FROM friends WHERE a = ? AND b = ?', a, c);
            if (row && row.status === 'accepted') return J(200, { ok: true, status: 'accepted' });
            if (row && row.req_by !== me) { await env.DB.prepare("UPDATE friends SET status = 'accepted', at = ? WHERE a = ? AND b = ?").bind(Date.now(), a, c).run(); return J(200, { ok: true, status: 'accepted' }); }
            if (row) return J(200, { ok: true, status: 'pending' });
            if ((await first("SELECT COUNT(*) c FROM friends WHERE req_by = ? AND status = 'pending'", me)).c >= 50) return J(400, { error: 'You have 50 requests waiting. Wait for answers first.' });
            if ((await first("SELECT COUNT(*) c FROM friends WHERE (a = ?1 OR b = ?1) AND status = 'accepted'", me)).c >= 200) return J(400, { error: 'Your friends list is full (200).' });
            await env.DB.prepare("INSERT INTO friends(a, b, status, req_by, at) VALUES(?, ?, 'pending', ?, ?)").bind(a, c, me, Date.now()).run();
            push(env, [t], { t: 'friend', title: 'Friend request', body: acct.name + ' wants to be your friend' });
            return J(200, { ok: true, status: 'pending' });
        }
        if (p === '/social/respond' && m === 'POST') {
            const b = await body(req, 500); if (!uidOk(b.uid)) return J(400, { error: 'Bad request' }); const [a, c] = pair(me, b.uid);
            const row = await first("SELECT req_by FROM friends WHERE a = ? AND b = ? AND status = 'pending'", a, c); if (!row || row.req_by === me) return J(404, { error: 'No such request' });
            if (b.accept) await env.DB.prepare("UPDATE friends SET status = 'accepted', at = ? WHERE a = ? AND b = ?").bind(Date.now(), a, c).run(); else await env.DB.prepare('DELETE FROM friends WHERE a = ? AND b = ?').bind(a, c).run();
            if (b.accept) push(env, [b.uid], { t: 'friend', title: 'Friend request accepted', body: acct.name + ' is now your friend' });
            return J(200, { ok: true });
        }
        if (p === '/social/unfriend' && m === 'POST') {
            const b = await body(req, 500); if (!uidOk(b.uid)) return J(400, { error: 'Bad request' }); const [a, c] = pair(me, b.uid);
            await env.DB.batch([env.DB.prepare('DELETE FROM friends WHERE a = ? AND b = ?').bind(a, c), env.DB.prepare('DELETE FROM streaks WHERE a = ? AND b = ?').bind(a, c)]); return J(200, { ok: true });
        }
        if (p === '/social/block' && m === 'POST') {
            const b = await body(req, 500); if (!uidOk(b.uid) || b.uid === me) return J(400, { error: 'Bad request' }); const [a, c] = pair(me, b.uid);
            if (b.on === false) await env.DB.prepare('DELETE FROM blocks WHERE uid = ? AND target = ?').bind(me, b.uid).run();
            else await env.DB.batch([env.DB.prepare('INSERT OR IGNORE INTO blocks(uid, target) VALUES(?, ?)').bind(me, b.uid), env.DB.prepare('DELETE FROM friends WHERE a = ? AND b = ?').bind(a, c), env.DB.prepare('DELETE FROM streaks WHERE a = ? AND b = ?').bind(a, c)]);
            return J(200, { ok: true });
        }
        if (p === '/social/blocks' && isGet) return J(200, { blocked: (await all('SELECT ac.uid, ac.name, ac.avatar, ac.verified FROM blocks b JOIN accounts ac ON ac.uid = b.target WHERE b.uid = ?', me)).map(view) });
        if (p === '/social/dm' && m === 'POST') {
            const b = await body(req, 500); if (!uidOk(b.uid) || b.uid === me) return J(400, { error: 'Bad request' });
            if (!(await friendsWith(me, b.uid)) || await blockedEither(me, b.uid)) return J(403, { error: 'You can only message friends.' });
            const [a, c] = pair(me, b.uid), id = 'd' + (await sha(a + c)).slice(0, 31), now = Date.now();
            await env.DB.batch([env.DB.prepare("INSERT OR IGNORE INTO convs(id, kind, name, owner, created, last_at) VALUES(?, 'dm', '', '', ?, ?)").bind(id, now, now), env.DB.prepare("INSERT OR IGNORE INTO members(conv, uid, role, joined, last_read) VALUES(?, ?, 'member', ?, 0)").bind(id, me, now), env.DB.prepare("INSERT OR IGNORE INTO members(conv, uid, role, joined, last_read) VALUES(?, ?, 'member', ?, 0)").bind(id, b.uid, now)]);
            return J(200, { ok: true, id });
        }
        if (p === '/social/conv' && isGet) {
            const id = cid(q.get('id')); if (!id) return J(400, { error: 'Bad request' });
            const mem = await inConv(id); if (!mem) return J(404, { error: 'Not found' });
            const after = clamp(q.get('after') || 0, 0, 1e12), before = clamp(q.get('before') || 0, 0, 1e12);
            const COLS = 'x.id, x.uid, x.text, x.at, x.kind, x.data, x.reply_to, x.edited, x.pinned, a.name, a.verified av';
            const rows = before ? (await all('SELECT ' + COLS + ' FROM msgs x LEFT JOIN accounts a ON a.uid = x.uid WHERE x.conv = ? AND x.id < ? ORDER BY x.id DESC LIMIT 40', id, before)).reverse() : after ? await all('SELECT ' + COLS + ' FROM msgs x LEFT JOIN accounts a ON a.uid = x.uid WHERE x.conv = ? AND x.id > ? ORDER BY x.id ASC LIMIT 80', id, after) : (await all('SELECT ' + COLS + ' FROM msgs x LEFT JOIN accounts a ON a.uid = x.uid WHERE x.conv = ? ORDER BY x.id DESC LIMIT 60', id)).reverse();
            const maxId = rows.length && !before ? rows[rows.length - 1].id : 0;
            if (maxId) await env.DB.prepare('UPDATE members SET last_read = MAX(last_read, ?) WHERE conv = ? AND uid = ?').bind(maxId, id, me).run();
            const mems = await all('SELECT ac.uid, ac.name, ac.avatar, ac.verified, mm.role, mm.last_read FROM members mm LEFT JOIN accounts ac ON ac.uid = mm.uid WHERE mm.conv = ? ORDER BY mm.joined LIMIT 25', id);
            const typing = (await all('SELECT ac.uid, ac.name FROM typing t JOIN accounts ac ON ac.uid = t.uid WHERE t.conv = ? AND t.uid != ? AND t.until > ?', id, me, Date.now())).map(x => ({ uid: x.uid, name: x.name }));
            // reactions and the messages that replies point at
            const ids = rows.map(r => r.id), reacts = {}, quoted = {};
            if (ids.length) {
                (await all('SELECT msg_id, emoji, COUNT(*) n, SUM(uid = ?) me FROM reactions WHERE msg_id IN (' + ids.map(() => '?').join(',') + ') GROUP BY msg_id, emoji ORDER BY MIN(rowid)', me, ...ids)).forEach(r => { (reacts[r.msg_id] = reacts[r.msg_id] || []).push({ e: r.emoji, n: r.n, me: !!r.me }); });
                const rt = [...new Set(rows.map(r => r.reply_to).filter(Boolean))];
                if (rt.length) (await all('SELECT x.id, x.text, x.kind, a.name FROM msgs x LEFT JOIN accounts a ON a.uid = x.uid WHERE x.conv = ? AND x.id IN (' + rt.map(() => '?').join(',') + ')', id, ...rt)).forEach(r => { quoted[r.id] = { id: r.id, name: r.name || 'Deleted player', text: String(r.text).slice(0, 140), kind: r.kind }; });
            }
            const pins = after || before ? undefined : (await all('SELECT x.id, x.text, x.kind, a.name FROM msgs x LEFT JOIN accounts a ON a.uid = x.uid WHERE x.conv = ? AND x.pinned = 1 ORDER BY x.id DESC LIMIT 5', id)).map(r => ({ id: r.id, name: r.name || 'Deleted player', text: String(r.text).slice(0, 140), kind: r.kind }));
            const pres = await presenceOf(mems.map(x => x.uid).filter(Boolean));
            const polls = {}; { const pids = rows.filter(r => r.kind === 'poll').map(r => r.id); if (pids.length) { (await all('SELECT msg, opt, COUNT(*) n, SUM(uid = ?) me FROM gvotes WHERE msg IN (' + pids.map(() => '?').join(',') + ') GROUP BY msg, opt', me, ...pids)).forEach(r => { const p0 = polls[r.msg] = polls[r.msg] || { counts: {}, mine: null, total: 0 }; p0.counts[r.opt] = r.n; p0.total += r.n; if (r.me) p0.mine = r.opt; }); pids.forEach(id => { polls[id] = polls[id] || { counts: {}, mine: null, total: 0 }; }); } }
            const gav = mem.kind === 'group' ? await first('SELECT avatar a FROM convs WHERE id = ?', id) : null;
            const out = { id, kind: mem.kind, name: mem.name, avatar: gav && gav.a ? url.origin + '/media/' + gav.a : '', hasMore: before ? rows.length >= 40 : (!after && rows.length >= 60), typing, muted: !!mem.muted || mem.muted_until > Date.now(), myRead: mem.last_read || 0, owner: mem.owner === me, members: mems.map(x => Object.assign(view(x), { role: x.role }, pres[x.uid] || { online: false, playing: null })), pins,
                messages: rows.map(x => { let d = null; if (x.data) { try { d = JSON.parse(x.data); } catch (e) { d = null; } } return { id: x.id, uid: x.uid, name: x.name || 'Deleted player', verified: !!x.av, owner: x.av === 2, text: x.text, kind: x.kind || 'text', data: d, replyTo: x.reply_to ? (quoted[x.reply_to] || { id: x.reply_to, name: '', text: 'Message deleted', kind: 'text' }) : null, edited: !!x.edited, pinned: !!x.pinned, reactions: reacts[x.id] || [], poll: polls[x.id], at: x.at, mine: x.uid === me }; }) };
            if (mem.kind === 'dm') { const other = mems.find(x => x.uid !== me); const hidR = other && other.uid ? await first('SELECT hide_read h FROM profiles WHERE uid = ?', other.uid) : null; out.peerRead = other && !(hidR && hidR.h) ? other.last_read : 0; if (other && other.uid) { const pa = await first('SELECT last FROM accounts WHERE uid = ?', other.uid); out.peerLast = pa ? pa.last || 0 : 0; } if (other && other.uid) { const [a, c] = pair(me, other.uid); out.streak = streakView(await first('SELECT * FROM streaks WHERE a = ? AND b = ?', a, c)); out.peerUid = other.uid; out.canSend = await friendsWith(me, other.uid) && !(await blockedEither(me, other.uid)); } else out.canSend = false; }
            return J(200, out);
        }
        // ----- reactions, edit, pin, mute, search -----
        if (p === '/social/react' && m === 'POST') {
            const b = await body(req, 400), msg = await first('SELECT conv FROM msgs WHERE id = ?', clamp(b.msg, 1, 1e12)); if (!msg || !(await inConv(msg.conv))) return J(404, { error: 'Not found' });
            const e = String(b.emoji || ''); if (!REACT_OK.has(e)) return J(400, { error: 'That reaction is not available.' }); const mid = clamp(b.msg, 1, 1e12);
            if (b.on === false) await env.DB.prepare('DELETE FROM reactions WHERE msg_id = ? AND uid = ? AND emoji = ?').bind(mid, me, e).run();
            else { if ((await first('SELECT COUNT(*) c FROM reactions WHERE msg_id = ? AND uid = ?', mid, me)).c >= 4) return J(400, { error: 'You can add up to 4 reactions to a message.' }); await env.DB.prepare('INSERT OR IGNORE INTO reactions(msg_id, uid, emoji) VALUES(?, ?, ?)').bind(mid, me, e).run(); const au = await first('SELECT uid, conv FROM msgs WHERE id = ?', mid); if (au && au.uid !== me) push(env, [au.uid], { t: 'react', conv: au.conv, title: acct.name, body: 'reacted ' + e + ' to your message' }); }
            return J(200, { ok: true });
        }
        if (p === '/social/edit' && m === 'POST') {
            const b = await body(req, 3000), mid = clamp(b.id, 1, 1e12), msg = await first('SELECT uid, conv, kind, at FROM msgs WHERE id = ?', mid), text = clean(b.text).slice(0, 1000);
            if (!msg || msg.uid !== me || !(await inConv(msg.conv))) return J(404, { error: 'Not found' }); if (msg.kind !== 'text') return J(400, { error: 'Only text messages can be edited.' });
            if (Date.now() - msg.at > 900000) return J(400, { error: 'You can edit a message for 15 minutes after sending it.' }); if (!text) return J(400, { error: 'The message can not be empty.' });
            await env.DB.prepare('UPDATE msgs SET text = ?, edited = 1 WHERE id = ?').bind(text, mid).run(); return J(200, { ok: true });
        }
        if (p === '/social/pin' && m === 'POST') {
            const b = await body(req, 300), mid = clamp(b.id, 1, 1e12), msg = await first('SELECT conv FROM msgs WHERE id = ?', mid), mem = msg ? await inConv(msg.conv) : null; if (!mem) return J(404, { error: 'Not found' });
            if (mem.kind === 'group' && mem.owner !== me) return J(403, { error: 'Only the group owner can pin messages.' });
            if (b.on !== false && (await first('SELECT COUNT(*) c FROM msgs WHERE conv = ? AND pinned = 1', msg.conv)).c >= 5) return J(400, { error: 'You can pin up to 5 messages. Unpin one first.' });
            await env.DB.prepare('UPDATE msgs SET pinned = ? WHERE id = ?').bind(b.on === false ? 0 : 1, mid).run(); return J(200, { ok: true });
        }
        if (p === '/social/mute' && m === 'POST') { const b = await body(req, 300), id = cid(b.conv); if (!id || !(await inConv(id))) return J(404, { error: 'Not found' }); const hrs = clamp(b.hours, 0, 720); await env.DB.prepare('UPDATE members SET muted = ?, muted_until = ? WHERE conv = ? AND uid = ?').bind(b.on === false || hrs > 0 ? 0 : 1, b.on === false ? 0 : hrs > 0 ? Date.now() + hrs * 3600000 : 0, id, me).run(); return J(200, { ok: true }); }
        if (p === '/social/search' && isGet) {
            const id = cid(q.get('conv')), qs = cleanText(q.get('q') || '', 40).toLowerCase().replace(/[%_]/g, ''); if (!id || qs.length < 2 || !(await inConv(id))) return J(200, { results: [] });
            const rows = await all("SELECT x.id, x.uid, x.text, x.at, a.name FROM msgs x LEFT JOIN accounts a ON a.uid = x.uid WHERE x.conv = ? AND x.kind IN ('text', 'game', 'list') AND lower(x.text) LIKE ? ORDER BY x.id DESC LIMIT 30", id, '%' + qs + '%');
            return J(200, { results: rows.map(r => ({ id: r.id, name: r.name || 'Deleted player', text: String(r.text).slice(0, 160), at: r.at, mine: r.uid === me })) });
        }

        // ----- presence: online and what you are playing -----
        if (p === '/social/presence' && m === 'POST') {
            if (await limited(env, 'pr' + me, 40, 600000)) return J(200, { ok: true });
            const b = await body(req, 500), g = b.game && typeof b.game === 'object' ? b.game : null, appid = g ? clamp(g.appid, 0, 4294967295) : 0, gname = g ? cleanText(g.name, 80) : '';
            { const prevP = await first('SELECT game_id g FROM presence WHERE uid = ?', me); if (appid && (!prevP || prevP.g !== appid)) { const recent = await first("SELECT 1 x FROM activity WHERE uid = ? AND kind = 'play' AND appid = ? AND at > ?", me, appid, Date.now() - 6 * 3600000); if (!recent) await env.DB.prepare("INSERT INTO activity(uid, kind, text, appid, at) VALUES(?, 'play', ?, ?, ?)").bind(me, 'started playing ' + (gname || 'a game'), appid, Date.now()).run(); } }
            await env.DB.prepare('INSERT INTO presence(uid, game_id, game_name, at) VALUES(?, ?, ?, ?) ON CONFLICT(uid) DO UPDATE SET game_id = excluded.game_id, game_name = excluded.game_name, at = excluded.at').bind(me, appid, appid ? gname : '', Date.now()).run();
            return J(200, { ok: true });
        }

        // ----- stats (for profiles and challenges) and the bio -----
        if (p === '/social/stats' && m === 'POST') {
            if (await limited(env, 'st' + me, 30, 3600000)) return J(200, { ok: true });
            const b = await body(req, 600), n = { level: clamp(b.level, 1, 100), hours: clamp(b.hours, 0, 200000), streak: clamp(b.streak, 0, 5000), achievements: clamp(b.achievements, 0, 500), games: clamp(b.games, 0, 20000) }, now = Date.now();
            const prev = await first('SELECT * FROM stats WHERE uid = ?', me); let flags = prev ? prev.flags : 0;
            if (prev) { const hrs = (now - prev.at) / 3600000; if (n.hours - prev.hours > Math.max(3, hrs * 1.2 + 2) || n.level - prev.level > 6) { flags += 1; await env.DB.prepare('UPDATE stats SET flags = ? WHERE uid = ?').bind(flags, me).run(); return J(200, { ok: true, held: true }); } }
            await env.DB.prepare('INSERT INTO stats(uid, level, hours, streak, achievements, games, at, flags) VALUES(?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(uid) DO UPDATE SET level = excluded.level, hours = excluded.hours, streak = excluded.streak, achievements = excluded.achievements, games = excluded.games, at = excluded.at').bind(me, n.level, n.hours, n.streak, n.achievements, n.games, now, flags).run();
            if (prev && n.level > prev.level) await env.DB.prepare("INSERT INTO activity(uid, kind, text, appid, at) VALUES(?, 'level', ?, 0, ?)").bind(me, 'reached level ' + n.level, now).run();
            if (b.prestige !== undefined) await env.DB.prepare('INSERT INTO profiles(uid, prestige, at) VALUES(?, ?, ?) ON CONFLICT(uid) DO UPDATE SET prestige = excluded.prestige').bind(me, clamp(b.prestige, 0, 100), now).run();
            for (const cm of await all("SELECT cm.cid, c.metric FROM challenge_members cm JOIN challenges c ON c.id = cm.cid WHERE cm.uid = ? AND cm.baseline IS NULL AND c.endsat > ?", me, now)) await env.DB.prepare('UPDATE challenge_members SET baseline = ? WHERE cid = ? AND uid = ?').bind(n[cm.metric] || 0, cm.cid, me).run();
            return J(200, { ok: true });
        }
        if (p === '/social/bio' && m === 'POST') { const b = await body(req, 800); await env.DB.prepare('UPDATE accounts SET bio = ? WHERE uid = ?').bind(cleanText(b.bio, 160), me).run(); return J(200, { ok: true }); }
        if (p === '/social/profile' && isGet) {
            const u = q.get('uid') || ''; if (!uidOk(u)) return J(400, { error: 'Bad request' });
            const a = await first('SELECT uid, name, avatar, verified, created, bio FROM accounts WHERE uid = ?', u); if (!a || (u !== me && await blockedEither(me, u))) return J(404, { error: 'That player was not found.' });
            const fr = u === me ? true : await friendsWith(me, u); let rel = u === me ? 'self' : fr ? 'friends' : 'none';
            if (rel === 'none') { const [x, y] = pair(me, u), row = await first('SELECT status, req_by FROM friends WHERE a = ? AND b = ?', x, y); if (row && row.status === 'pending') rel = row.req_by === me ? 'pending_out' : 'pending_in'; }
            let st = await first('SELECT level, hours, streak, achievements, games FROM stats WHERE uid = ?', u); if (!st && !fr) st = null; if (!fr) { const l = await first('SELECT level, hours, streak, achievements, games FROM lb WHERE uid = ?', u); st = l || null; }
            const pres = (await presenceOf([u]))[u] || { online: false, playing: null }, themes = (await all("SELECT t.id, t.name, t.vars, (SELECT COUNT(*) FROM theme_likes l WHERE l.theme_id = t.id) likes, t.downloads FROM themes t WHERE t.uid = ? AND t.status = 'approved' ORDER BY t.at DESC LIMIT 6", u)).map(t => ({ id: t.id, name: t.name, vars: JSON.parse(t.vars), likes: t.likes, downloads: t.downloads }));
            const lists = (await all('SELECT id, title, items FROM lists WHERE uid = ? ORDER BY at DESC LIMIT 6', u)).map(l => { let n = 0; try { n = JSON.parse(l.items).length; } catch (e) { } return { id: l.id, title: l.title, count: n }; });
            const dls = (await first("SELECT COALESCE(SUM(downloads), 0) d FROM themes WHERE uid = ? AND status = 'approved'", u)).d;
            const cust = profileView(await first('SELECT * FROM profiles WHERE uid = ?', u));
            return J(200, { uid: a.uid, name: a.name, avatar: a.avatar || '', verified: !!a.verified, owner: a.verified === 2, created: a.created, bio: a.bio || '', relation: rel, stats: st, online: pres.online, playing: pres.playing, lastSeen: pres.lastSeen || 0, themes, lists, creator: dls >= 25, code: code(a.uid), custom: cust, prestige: cust.prestige });
        }

        // ----- shared game lists -----
        if (p === '/social/lists' && m === 'POST') {
            if (await limited(env, 'ls' + me, 20, 86400000)) return J(429, { error: 'You made a lot of lists today.' });
            const b = await body(req, 16000), title = cleanText(b.title, 40), src = Array.isArray(b.items) ? b.items : [];
            const items = []; const seen = new Set(); for (const it of src) { const appid = appId(it && it.appid); if (!appid || seen.has(appid)) continue; seen.add(appid); items.push({ appid, name: cleanText(it.name, 80) || ('App ' + appid) }); if (items.length >= 60) break; }
            if (title.length < 2) return J(400, { error: 'Give the list a name (2+ letters).' }); if (!items.length) return J(400, { error: 'Add at least one game.' });
            if ((await first('SELECT COUNT(*) c FROM lists WHERE uid = ?', me)).c >= 30) return J(400, { error: 'You can keep 30 lists. Delete one first.' });
            const id = HEX(6); await env.DB.prepare('INSERT INTO lists(id, uid, title, items, at) VALUES(?, ?, ?, ?, ?)').bind(id, me, title, JSON.stringify(items), Date.now()).run(); return J(200, { ok: true, id });
        }
        let ml;
        if ((ml = /^\/social\/lists\/([a-f0-9]{12})$/.exec(p))) {
            if (isGet) { const l = await first('SELECT l.id, l.uid, l.title, l.items, l.at, a.name, a.verified FROM lists l LEFT JOIN accounts a ON a.uid = l.uid WHERE l.id = ?', ml[1]); if (!l) return J(404, { error: 'That list was not found.' }); let items = []; try { items = JSON.parse(l.items); } catch (e) { } return J(200, { id: l.id, title: l.title, owner: { uid: l.uid, name: l.name || 'Deleted player', verified: !!l.verified, owner: l.verified === 2 }, mine: l.uid === me, items, at: l.at }); }
            if (m === 'DELETE') { const r = await env.DB.prepare('DELETE FROM lists WHERE id = ? AND uid = ?').bind(ml[1], me).run(); return r.meta.changes ? J(200, { ok: true }) : J(404, { error: 'That is not your list.' }); }
        }
        if (p === '/social/lists' && isGet) { const rows = await all('SELECT id, title, items, at FROM lists WHERE uid = ? ORDER BY at DESC LIMIT 30', me); return J(200, { lists: rows.map(l => { let n = 0; try { n = JSON.parse(l.items).length; } catch (e) { } return { id: l.id, title: l.title, count: n, at: l.at }; }) }); }

        // ----- friend challenges -----
        if (p === '/social/challenge' && m === 'POST') {
            if (await limited(env, 'ch' + me, 6, 86400000)) return J(429, { error: 'You started a lot of challenges today.' });
            const b = await body(req, 2000), name = cleanText(b.name, 32), metric = ['hours', 'achievements', 'streak', 'level'].includes(b.metric) ? b.metric : '', days = clamp(b.days, 3, 30), ids = [...new Set(Array.isArray(b.members) ? b.members.filter(uidOk) : [])].filter(x => x !== me).slice(0, 19);
            if (name.length < 2) return J(400, { error: 'Give the challenge a name.' }); if (!metric) return J(400, { error: 'Pick what to compete in.' }); if (!ids.length) return J(400, { error: 'Pick at least one friend.' });
            for (const u of ids) if (!(await friendsWith(me, u)) || await blockedEither(me, u)) return J(403, { error: 'You can only challenge friends.' });
            const cidn = HEX(6), conv = 'g' + HEX(8), now = Date.now(), end = now + days * 86400000, all2 = [me].concat(ids);
            await env.DB.batch([env.DB.prepare("INSERT INTO convs(id, kind, name, owner, created, last_at) VALUES(?, 'group', ?, ?, ?, ?)").bind(conv, 'Challenge: ' + name, me, now, now), env.DB.prepare('INSERT INTO challenges(id, owner, name, metric, startsat, endsat, conv, announced) VALUES(?, ?, ?, ?, ?, ?, ?, 0)').bind(cidn, me, name, metric, now, end, conv)]
                .concat(all2.map((u, i) => env.DB.prepare('INSERT INTO members(conv, uid, role, joined, last_read) VALUES(?, ?, ?, ?, 0)').bind(conv, u, i === 0 ? 'owner' : 'member', now)))
                .concat(all2.map((u) => env.DB.prepare('INSERT INTO challenge_members(cid, uid, baseline) VALUES(?, ?, (SELECT ' + metric + ' FROM stats WHERE uid = ?))').bind(cidn, u, u))));
            await env.DB.prepare("INSERT INTO msgs(conv, uid, text, at, kind) VALUES(?, ?, ?, ?, 'system')").bind(conv, me, 'Challenge started: most ' + metric + ' in ' + days + ' days. Good luck!', now).run();
            return J(200, { ok: true, id: cidn, conv });
        }
        if (p === '/social/challenges' && isGet) {
            const now = Date.now(), rows = await all("SELECT c.id, c.owner, c.name, c.metric, c.startsat, c.endsat, c.conv, c.announced FROM challenges c JOIN challenge_members cm ON cm.cid = c.id WHERE cm.uid = ? AND c.endsat > ? ORDER BY c.endsat ASC LIMIT 20", me, now - 7 * 86400000), out = [];
            for (const c of rows) {
                const mem = await all('SELECT cm.uid, cm.baseline, a.name, a.avatar, a.verified, s.level, s.hours, s.streak, s.achievements FROM challenge_members cm LEFT JOIN accounts a ON a.uid = cm.uid LEFT JOIN stats s ON s.uid = cm.uid WHERE cm.cid = ?', c.id);
                const st = mem.map(x => ({ uid: x.uid, name: x.name || 'Deleted player', avatar: x.avatar || '', verified: !!x.verified, owner: x.verified === 2, noData: x.baseline === null || x[c.metric] === null, score: x.baseline === null || x[c.metric] === null ? 0 : Math.max(0, (x[c.metric] || 0) - x.baseline), me: x.uid === me })).sort((a, b) => b.score - a.score);
                const ended = c.endsat <= now; let winner = null; if (ended && st.length && st[0].score > 0) winner = st.filter(x => x.score === st[0].score).map(x => x.name);
                if (ended && !c.announced) { await env.DB.prepare('UPDATE challenges SET announced = 1 WHERE id = ?').bind(c.id).run(); await env.DB.prepare("INSERT INTO msgs(conv, uid, text, at, kind) VALUES(?, ?, ?, ?, 'system')").bind(c.conv, c.owner, winner ? 'The challenge is over! ' + winner.join(' and ') + ' won with ' + st[0].score + ' ' + c.metric + '.' : 'The challenge is over. Nobody scored this time.', now).run(); await env.DB.prepare('UPDATE convs SET last_at = ? WHERE id = ?').bind(now, c.conv).run(); }
                out.push({ id: c.id, name: c.name, metric: c.metric, startsAt: c.startsat, endsAt: c.endsat, ended, conv: c.conv, owner: c.owner === me, winner, standings: st });
            }
            return J(200, { challenges: out });
        }
        let mc;
        if ((mc = /^\/social\/challenge\/([a-f0-9]{12})$/.exec(p)) && m === 'DELETE') { const r = await env.DB.prepare('UPDATE challenges SET endsat = ? WHERE id = ? AND owner = ? AND endsat > ?').bind(Date.now(), mc[1], me, Date.now()).run(); return r.meta.changes ? J(200, { ok: true }) : J(404, { error: 'Only the person who started it can end a challenge.' }); }

        if (p === '/social/gif' && isGet) {
            if (!env.TENOR_KEY) return J(200, { ok: false, disabled: true });
            const qs = cleanText(q.get('q') || '', 40); if (await limited(env, 'gf' + me, 60, 600000)) return J(429, { error: 'Slow down' });
            try {
                const r = await fetch('https://tenor.googleapis.com/v2/' + (qs ? 'search?q=' + encodeURIComponent(qs) + '&' : 'featured?') + 'key=' + encodeURIComponent(env.TENOR_KEY) + '&client_key=steamlite&limit=24&media_filter=tinygif', { signal: AbortSignal.timeout(5000) });
                const j = await r.json(); return J(200, { ok: true, gifs: (j.results || []).map((x) => { const f = x.media_formats && x.media_formats.tinygif; return f && /^https:\/\/media[0-9]?\.tenor\.com\//.test(f.url) ? { url: f.url, w: (f.dims || [])[0] || 0, h: (f.dims || [])[1] || 0 } : null; }).filter(Boolean) });
            } catch (e) { return J(200, { ok: false }); }
        }
        if (p === '/social/customize' && m === 'POST') { // your public profile: tagline, accent, frame, title, banner, showcase (both apps send these)
            if (await limited(env, 'cz' + me, 60, 3600000)) return J(429, { error: 'You changed your profile a lot. Try again later.' });
            const b = await body(req, 6000), sets = {}, hexOk = (v) => /^#[0-9a-f]{6}$/i.test(String(v || ''));
            if (b.tagline !== undefined) sets.tagline = cleanText(b.tagline, 60);
            if (b.accent !== undefined) { if (b.accent && !hexOk(b.accent)) return J(400, { error: 'That colour is not valid.' }); sets.accent = b.accent ? String(b.accent).toLowerCase() : ''; }
            if (b.frame !== undefined) { const fr = String(b.frame || ''); if (fr && !/^[a-z]{2,20}$/.test(fr)) return J(400, { error: 'That frame is not valid.' }); sets.frame = fr === 'none' ? '' : fr; }
            if (b.title !== undefined) sets.title = cleanText(b.title, 40);
            if (b.hideBadges !== undefined) sets.hide_badges = b.hideBadges ? 1 : 0;
            if (b.prestige !== undefined) sets.prestige = clamp(b.prestige, 0, 100);
            if (b.showcase !== undefined) { const ids = []; for (const x of (Array.isArray(b.showcase) ? b.showcase : [])) { const id = appId(x && typeof x === 'object' ? x.appid : x); if (id && !ids.includes(id)) ids.push(id); if (ids.length >= 5) break; } sets.showcase = JSON.stringify(ids); }
            if (b.banner !== undefined) {
                if (!b.banner) sets.banner = ''; else {
                    const bn = b.banner, mode = ['default', 'image', 'gradient', 'solid'].includes(bn.mode) ? bn.mode : 'default';
                    const o = { mode, blur: clamp(bn.blur, 0, 20), dim: clamp(bn.dim, 0, 80), x: clamp(bn.x === undefined ? 50 : bn.x, 0, 100), y: clamp(bn.y === undefined ? 50 : bn.y, 0, 100), zoom: clamp(bn.zoom === undefined ? 100 : bn.zoom, 100, 300), angle: clamp(bn.angle === undefined ? 135 : bn.angle, 0, 360), c1: hexOk(bn.c1) ? bn.c1 : '#7c5cff', c2: hexOk(bn.c2) ? bn.c2 : '#1b1233' };
                    if (mode === 'image') { const mid = String(bn.id || ''); if (!/^[a-f0-9]{24}$/.test(mid) || !(await first('SELECT 1 x FROM media WHERE id = ? AND uid = ?', mid, me))) return J(400, { error: 'Upload the banner picture first.' }); o.id = mid; }
                    sets.banner = JSON.stringify(o);
                }
            }
            const keys = Object.keys(sets); if (!keys.length) return J(200, { ok: true });
            await env.DB.prepare('INSERT INTO profiles(uid, at) VALUES(?, ?) ON CONFLICT(uid) DO NOTHING').bind(me, Date.now()).run();
            await env.DB.prepare('UPDATE profiles SET ' + keys.map(k => k + ' = ?').join(', ') + ', at = ? WHERE uid = ?').bind(...keys.map(k => sets[k]), Date.now(), me).run();
            return J(200, { ok: true });
        }
        if (p === '/social/prefs') { // privacy switches: read receipts and typing indicator
            if (isGet) { const r = await first('SELECT hide_read, hide_typing FROM profiles WHERE uid = ?', me); return J(200, { ok: true, readReceipts: !(r && r.hide_read), typing: !(r && r.hide_typing) }); }
            if (m === 'POST') { const b = await body(req, 300); await env.DB.prepare('INSERT INTO profiles(uid, at) VALUES(?, ?) ON CONFLICT(uid) DO NOTHING').bind(me, Date.now()).run(); if (b.readReceipts !== undefined) await env.DB.prepare('UPDATE profiles SET hide_read = ? WHERE uid = ?').bind(b.readReceipts ? 0 : 1, me).run(); if (b.typing !== undefined) await env.DB.prepare('UPDATE profiles SET hide_typing = ? WHERE uid = ?').bind(b.typing ? 0 : 1, me).run(); return J(200, { ok: true }); }
        }
        if (p === '/social/gallery' && isGet) {
            const id = cid(q.get('conv')); if (!id || !(await inConv(id))) return J(200, { items: [] });
            const rows = await all("SELECT x.id, x.at, x.kind, x.data, a.name FROM msgs x LEFT JOIN accounts a ON a.uid = x.uid WHERE x.conv = ? AND x.kind IN ('image', 'gif') ORDER BY x.id DESC LIMIT 80", id);
            return J(200, { items: rows.map(r => { let d = null; try { d = JSON.parse(r.data); } catch (e) { } return { id: r.id, at: r.at, kind: r.kind, data: d, name: r.name || 'Deleted player' }; }) });
        }
        if (p === '/social/searchall' && isGet) { // search every chat you are in (the last 30 days)
            const qs = cleanText(q.get('q') || '', 40).toLowerCase().replace(/[%_]/g, ''); if (qs.length < 2) return J(200, { results: [] });
            if (await limited(env, 'sa' + me, 60, 600000)) return J(429, { error: 'Slow down' });
            const rows = await all("SELECT x.id, x.conv, x.text, x.at, a.name, c.kind ck, c.name cname FROM msgs x JOIN members mm ON mm.conv = x.conv AND mm.uid = ? JOIN convs c ON c.id = x.conv LEFT JOIN accounts a ON a.uid = x.uid WHERE x.kind IN ('text', 'game', 'list') AND lower(x.text) LIKE ? ORDER BY x.id DESC LIMIT 25", me, '%' + qs + '%');
            const dmIds = [...new Set(rows.filter(r => r.ck === 'dm').map(r => r.conv))], peer = {};
            for (const cv of dmIds) { const o = await first("SELECT ac.name FROM members m2 JOIN accounts ac ON ac.uid = m2.uid WHERE m2.conv = ? AND m2.uid != ?", cv, me); peer[cv] = o ? o.name : 'Deleted player'; }
            return J(200, { results: rows.map(r => ({ id: r.id, conv: r.conv, convName: r.ck === 'dm' ? peer[r.conv] : r.cname, name: r.name || 'Deleted player', text: String(r.text).slice(0, 160), at: r.at })) });
        }
        if (p === '/social/feed' && isGet) { // what your friends have been up to
            const rows = await all("SELECT a.id, a.uid, a.kind, a.text, a.appid, a.at, ac.name, ac.avatar, ac.verified FROM activity a JOIN accounts ac ON ac.uid = a.uid WHERE a.at > ?2 AND a.uid IN (SELECT CASE WHEN f.a = ?1 THEN f.b ELSE f.a END FROM friends f WHERE (f.a = ?1 OR f.b = ?1) AND f.status = 'accepted') ORDER BY a.at DESC LIMIT 40", me, Date.now() - 14 * 86400000);
            return J(200, { items: rows.map(r => ({ id: r.id, uid: r.uid, kind: r.kind, text: r.text, appid: r.appid, at: r.at, name: r.name, avatar: r.avatar || '', verified: !!r.verified, owner: r.verified === 2 })) });
        }
        if (p === '/social/gpoll' && m === 'POST') { // a poll in a chat: "what are we playing tonight?"
            const b = await body(req, 2500), id = cid(b.conv), mem = id ? await inConv(id) : null; if (!mem) return J(404, { error: 'Not found' });
            if (await limited(env, 'gp' + me, 10, 86400000)) return J(429, { error: 'You made a lot of polls today.' });
            const qq = cleanText(b.q, 100), opts = (Array.isArray(b.options) ? b.options : []).map(o => cleanText(o, 40)).filter(Boolean).slice(0, 6);
            if (qq.length < 2 || opts.length < 2) return J(400, { error: 'A poll needs a question and at least two options.' });
            const now = Date.now(), r = await env.DB.prepare("INSERT INTO msgs(conv, uid, text, at, kind, data) VALUES(?, ?, ?, ?, 'poll', ?) RETURNING id").bind(id, me, 'Poll: ' + qq, now, JSON.stringify({ q: qq, options: opts })).first();
            await env.DB.batch([env.DB.prepare('UPDATE convs SET last_at = ? WHERE id = ?').bind(now, id), env.DB.prepare('UPDATE members SET last_read = ? WHERE conv = ? AND uid = ?').bind(r.id, id, me)]);
            const to = (await all('SELECT uid FROM members WHERE conv = ? AND uid != ? AND muted = 0 AND muted_until < ?', id, me, now)).map(x => x.uid); push(env, to, { t: 'msg', conv: id, title: mem.kind === 'dm' ? acct.name : (mem.name || 'Group chat'), body: acct.name + ' started a poll: ' + qq, sender: acct.name, kind: 'poll' });
            return J(200, { ok: true, id: r.id });
        }
        if (p === '/social/gvote' && m === 'POST') {
            const b = await body(req, 300), mid = clamp(b.msg, 1, 1e12), msg = await first("SELECT conv, data FROM msgs WHERE id = ? AND kind = 'poll'", mid); if (!msg || !(await inConv(msg.conv))) return J(404, { error: 'Not found' });
            let d = {}; try { d = JSON.parse(msg.data); } catch (e) { } const opt = clamp(b.opt, 0, 5); if (!d.options || opt >= d.options.length) return J(400, { error: 'Pick one of the options.' });
            await env.DB.prepare('INSERT INTO gvotes(msg, uid, opt) VALUES(?, ?, ?) ON CONFLICT(msg, uid) DO UPDATE SET opt = excluded.opt').bind(mid, me, opt).run();
            return J(200, { ok: true });
        }
        if (p === '/social/unfurl' && isGet) {
            let u; try { u = new URL(q.get('u') || ''); } catch (e) { return J(400, { error: 'Bad link' }); }
            if (u.protocol !== 'https:' || u.port || /^(localhost|\d+\.\d+\.\d+\.\d+|\[.*\])$/i.test(u.hostname) || !u.hostname.includes('.')) return J(400, { error: 'Bad link' });
            if (await limited(env, 'uf' + me, 40, 600000)) return J(429, { error: 'Slow down' });
            try {
                const r = await fetch(u.href, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SteamLiteBot/1.0)', Accept: 'text/html' }, redirect: 'follow', signal: AbortSignal.timeout(4000) });
                if (!r.ok || !/text\/html/i.test(r.headers.get('content-type') || '')) return J(200, { ok: false });
                const html = (await r.text()).slice(0, 200000), meta = (n) => { const a = new RegExp('<meta[^>]+(?:property|name)=["\']' + n + '["\'][^>]*content=["\']([^"\']*)["\']', 'i').exec(html) || new RegExp('<meta[^>]+content=["\']([^"\']*)["\'][^>]*(?:property|name)=["\']' + n + '["\']', 'i').exec(html); return a ? a[1] : ''; };
                const dec = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
                const t = meta('og:title') || ((/<title[^>]*>([^<]*)<\/title>/i.exec(html) || [])[1] || ''), img = meta('og:image');
                return J(200, { ok: !!t, title: cleanText(dec(t), 120), desc: cleanText(dec(meta('og:description') || meta('description')), 200), image: /^https:\/\//.test(img) ? img.slice(0, 400) : '', host: u.hostname });
            } catch (e) { return J(200, { ok: false }); }
        }
        if (p === '/social/typing' && m === 'POST') {
            const b = await body(req, 300), id = cid(b.conv); if (!id || !(await inConv(id))) return J(404, { error: 'Not found' });
            const hidT = await first('SELECT hide_typing h FROM profiles WHERE uid = ?', me); if (hidT && hidT.h) return J(200, { ok: true });
            await env.DB.prepare('INSERT INTO typing(conv, uid, until) VALUES(?, ?, ?) ON CONFLICT(conv, uid) DO UPDATE SET until = excluded.until').bind(id, me, Date.now() + 6000).run();
            if (Math.random() < 0.02) await env.DB.prepare('DELETE FROM typing WHERE until < ?').bind(Date.now() - 60000).run();
            return J(200, { ok: true });
        }
        if (p === '/social/send' && m === 'POST') {
            const b = await body(req, 6000), id = cid(b.conv), kind = ['text', 'game', 'list', 'image', 'voice', 'gif'].includes(b.kind) ? b.kind : 'text';
            let text = clean(b.text).slice(0, 1000), data = '';
            if (kind === 'game') { const d = b.data || {}, appid = appId(d.appid); if (!appid) return J(400, { error: 'Pick a game to share.' }); const name = cleanText(d.name, 80) || ('App ' + appid); data = JSON.stringify({ appid, name, hours: clamp(d.hours, 0, 200000) }); text = 'Shared a game: ' + name; }
            else if (kind === 'list') { const lid = String((b.data || {}).id || ''); if (!/^[a-f0-9]{12}$/.test(lid)) return J(400, { error: 'Pick a list to share.' }); const l = await first('SELECT id, title FROM lists WHERE id = ?', lid); if (!l) return J(404, { error: 'That list was not found.' }); data = JSON.stringify({ id: l.id, title: l.title }); text = 'Shared a list: ' + l.title; }
            else if (kind === 'gif') { const d = b.data || {}, u = String(d.url || ''); if (!/^https:\/\/media[0-9]?\.tenor\.com\/[\w\-./]{3,200}$/.test(u)) return J(400, { error: 'That GIF is not allowed.' }); data = JSON.stringify({ url: u, w: clamp(d.w, 0, 2000), h: clamp(d.h, 0, 2000) }); text = 'GIF'; }
            else if (kind === 'image' || kind === 'voice') {
                const d = b.data || {}, mid = String(d.id || ''); if (!/^[a-f0-9]{24}$/.test(mid)) return J(400, { error: 'Send a file first.' });
                let f = await first('SELECT mime FROM media WHERE id = ? AND uid = ?', mid, me); if (!f) f = await first("SELECT md.mime FROM media md WHERE md.id = ?1 AND EXISTS (SELECT 1 FROM msgs x JOIN members mm ON mm.conv = x.conv AND mm.uid = ?2 WHERE x.data LIKE '%' || ?1 || '%')", mid, me); if (!f) return J(404, { error: 'That file was not found.' });
                if ((kind === 'image') !== (MEDIA_MIME[f.mime] === 'img')) return J(400, { error: 'Wrong file type.' });
                data = JSON.stringify({ id: mid, mime: f.mime, w: clamp(d.w, 0, 4000), h: clamp(d.h, 0, 4000), ms: kind === 'voice' ? clamp(d.ms, 0, 300000) : 0 });
                text = kind === 'voice' ? '🎤 Voice message' : (text.slice(0, 200) || '📷 Photo');
            }
            if (!id || !text) return J(400, { error: 'Write something first.' });
            if (await limited(env, 'sm' + me, 40, 60000)) { if (await limited(env, 'spam' + me, 3, 600000)) { await env.DB.prepare('INSERT INTO bans(uid, until, reason) VALUES(?, ?, ?) ON CONFLICT(uid) DO UPDATE SET until = excluded.until, reason = excluded.reason').bind(me, Date.now() + 900000, 'Sending messages too fast').run(); await auditLog(env, 'auto-mute', me, 'spam: 15 minutes'); return J(429, { error: 'You were muted for 15 minutes for sending messages too fast.' }); } return J(429, { error: 'You are sending messages too fast.' }); }
            const mem = await inConv(id); if (!mem) return J(404, { error: 'Not found' });
            let reply = 0; if (b.reply) { reply = clamp(b.reply, 1, 1e12); if (!(await first('SELECT 1 x FROM msgs WHERE id = ? AND conv = ?', reply, id))) reply = 0; }
            let peer = '';
            if (mem.kind === 'dm') { const o = await first('SELECT uid FROM members WHERE conv = ? AND uid != ?', id, me); peer = o ? o.uid : ''; if (!peer || !(await friendsWith(me, peer)) || await blockedEither(me, peer)) return J(403, { error: 'You can only message friends.' }); }
            const now = Date.now(), r = await env.DB.prepare('INSERT INTO msgs(conv, uid, text, at, kind, data, reply_to) VALUES(?, ?, ?, ?, ?, ?, ?) RETURNING id').bind(id, me, text, now, kind, data, reply).first();
            await env.DB.prepare('DELETE FROM typing WHERE conv = ? AND uid = ?').bind(id, me).run();
            await env.DB.batch([env.DB.prepare('UPDATE convs SET last_at = ? WHERE id = ?').bind(now, id), env.DB.prepare('UPDATE members SET last_read = ? WHERE conv = ? AND uid = ?').bind(r.id, id, me)]);
            let sv = null;
            if (peer) {
                const [a, c] = pair(me, peer), col = me === a ? 'a_day' : 'b_day';
                await env.DB.prepare('INSERT OR IGNORE INTO streaks(a, b, streak, best, last_day, a_day, b_day) VALUES(?, ?, 0, 0, 0, 0, 0)').bind(a, c).run();
                await env.DB.prepare('UPDATE streaks SET ' + col + ' = ? WHERE a = ? AND b = ?').bind(today, a, c).run();
                let s = await first('SELECT * FROM streaks WHERE a = ? AND b = ?', a, c);
                if (s.a_day === today && s.b_day === today && s.last_day !== today) { const n = s.last_day === today - 1 ? s.streak + 1 : 1; await env.DB.prepare('UPDATE streaks SET streak = ?, best = MAX(best, ?), last_day = ? WHERE a = ? AND b = ?').bind(n, n, today, a, c).run(); s = await first('SELECT * FROM streaks WHERE a = ? AND b = ?', a, c); if ([3, 7, 14, 30, 50, 100, 200, 365].includes(n)) await env.DB.batch([me, peer].map((u) => env.DB.prepare("INSERT INTO activity(uid, kind, text, appid, at) VALUES(?, 'streak', ?, 0, ?)").bind(u, 'reached a ' + n + '-day friend streak', Date.now()))); }
                sv = streakView(s);
            }
            if (Math.random() < 0.01) { await env.DB.prepare('DELETE FROM msgs WHERE at < ?').bind(now - 30 * 86400000).run(); await env.DB.prepare('DELETE FROM reactions WHERE msg_id NOT IN (SELECT id FROM msgs)').run(); await env.DB.prepare('DELETE FROM media WHERE at < ? AND id NOT IN (SELECT avatar FROM convs WHERE avatar != \'\') AND instr((SELECT COALESCE(group_concat(banner), \'\') FROM profiles), id) = 0').bind(now - 30 * 86400000).run(); await env.DB.prepare('DELETE FROM activity WHERE at < ?').bind(now - 30 * 86400000).run(); await env.DB.prepare('DELETE FROM convs WHERE id NOT IN (SELECT DISTINCT conv FROM msgs) AND last_at < ? AND id NOT IN (SELECT conv FROM challenges)').bind(now - 30 * 86400000).run(); await env.DB.prepare('DELETE FROM members WHERE conv NOT IN (SELECT id FROM convs)').run(); }
            { // tell the other people in the chat (not muted ones) with a push
                const to = (await all('SELECT uid FROM members WHERE conv = ? AND uid != ? AND muted = 0 AND muted_until < ?', id, me, Date.now())).map((x) => x.uid);
                const what = kind === 'image' ? 'Sent a photo' : kind === 'voice' ? 'Sent a voice message' : kind === 'gif' ? 'Sent a GIF' : kind === 'game' ? 'Shared a game' : kind === 'list' ? 'Shared a game list' : text;
                push(env, to, { t: 'msg', conv: id, title: mem.kind === 'dm' ? acct.name : (mem.name || 'Group chat'), body: (mem.kind === 'dm' ? '' : acct.name + ': ') + what.slice(0, 160), sender: acct.name, kind });   // not "from": Firebase reserves that name and refuses the whole message
            }
            let pcs = null; try { pcs = await playStreakBump(env, me, b.day); } catch (e) { }
            return J(200, { ok: true, id: r.id, at: now, streak: sv, play: pcs });
        }
        if (p === '/social/delete' && m === 'POST') {
            const b = await body(req, 500), id = clamp(b.id, 1, 1e12), msg = await first('SELECT uid, conv FROM msgs WHERE id = ?', id); if (!msg) return J(404, { error: 'Not found' });
            const mem = await inConv(msg.conv); if (!mem || (msg.uid !== me && mem.owner !== me)) return J(403, { error: 'You cannot delete that.' });
            await env.DB.prepare('DELETE FROM msgs WHERE id = ?').bind(id).run(); return J(200, { ok: true });
        }
        if (p === '/social/group' && m === 'POST') {
            const b = await body(req, 3000), name = cleanText(b.name, 32), ids = [...new Set(Array.isArray(b.members) ? b.members.filter(uidOk) : [])].filter(x => x !== me).slice(0, 19);
            if (name.length < 2) return J(400, { error: 'Give the group a name (2+ letters).' }); if (!ids.length) return J(400, { error: 'Pick at least one friend.' });
            if (await limited(env, 'sg' + me, 6, 86400000)) return J(429, { error: 'You made a lot of groups today.' });
            for (const u of ids) if (!(await friendsWith(me, u)) || await blockedEither(me, u)) return J(403, { error: 'You can only add friends to a group.' });
            const id = 'g' + HEX(8), now = Date.now();
            await env.DB.batch([env.DB.prepare("INSERT INTO convs(id, kind, name, owner, created, last_at) VALUES(?, 'group', ?, ?, ?, ?)").bind(id, name, me, now, now), env.DB.prepare("INSERT INTO members(conv, uid, role, joined, last_read) VALUES(?, ?, 'owner', ?, 0)").bind(id, me, now)].concat(ids.map(u => env.DB.prepare("INSERT INTO members(conv, uid, role, joined, last_read) VALUES(?, ?, 'member', ?, 0)").bind(id, u, now))));
            return J(200, { ok: true, id });
        }
        let gm;
        if (p === '/social/status' && m === 'POST') { // a short line on your profile ("busy till 8pm") that clears itself
            const b = await body(req, 300), t = cleanText(b.text, 60), hrs = clamp(b.hours, 0, 168);
            await env.DB.prepare('INSERT INTO profiles(uid, at) VALUES(?, ?) ON CONFLICT(uid) DO NOTHING').bind(me, Date.now()).run();
            await env.DB.prepare('UPDATE profiles SET status = ?, status_until = ? WHERE uid = ?').bind(t && hrs ? t : '', t && hrs ? Date.now() + hrs * 3600000 : 0, me).run();
            return J(200, { ok: true });
        }
        if (p === '/social/schedule' && m === 'POST') { // send a message later
            const b = await body(req, 3000), id = cid(b.conv), text = cleanText(b.text, 2000), at = Number(b.at);
            if (!id || !text) return J(400, { error: 'Write something first.' }); if (!(at > Date.now() + 30000) || at > Date.now() + 30 * 86400000) return J(400, { error: 'Pick a time between a minute and 30 days from now.' });
            const mem = await inConv(id); if (!mem) return J(404, { error: 'Not found' });
            if ((await first('SELECT COUNT(*) c FROM sched WHERE uid = ?', me)).c >= 20) return J(400, { error: 'You already have 20 scheduled messages.' });
            const r = await env.DB.prepare('INSERT INTO sched(uid, conv, text, send_at, created) VALUES(?, ?, ?, ?, ?) RETURNING id').bind(me, id, text, Math.floor(at), Date.now()).first();
            return J(200, { ok: true, id: r.id });
        }
        if (p === '/social/scheduled' && isGet) { const id = cid(q.get('conv')); const rows = await all(id ? 'SELECT id, conv, text, send_at FROM sched WHERE uid = ? AND conv = ? ORDER BY send_at' : 'SELECT id, conv, text, send_at FROM sched WHERE uid = ?1 ORDER BY send_at', me, ...(id ? [id] : [])); return J(200, { ok: true, items: rows.map((x) => ({ id: x.id, conv: x.conv, text: x.text, at: x.send_at })) }); }
        if (p === '/social/unschedule' && m === 'POST') { const b = await body(req, 100); await env.DB.prepare('DELETE FROM sched WHERE id = ? AND uid = ?').bind(clamp(b.id, 1, 1e12), me).run(); return J(200, { ok: true }); }
        if (p === '/social/readall' && m === 'POST') { await env.DB.prepare('UPDATE members SET last_read = COALESCE((SELECT MAX(id) FROM msgs WHERE msgs.conv = members.conv), last_read) WHERE uid = ?').bind(me).run(); return J(200, { ok: true }); }
        if ((gm = /^\/social\/group\/(add|remove|rename|avatar)$/.exec(p)) && m === 'POST') {
            const b = await body(req, 1000), id = cid(b.conv), mem = id ? await inConv(id) : null; if (!mem || mem.kind !== 'group') return J(404, { error: 'Not found' });
            if (gm[1] === 'avatar') { if (mem.owner !== me) return J(403, { error: 'Only the group owner can do that.' }); const mid = String(b.media || ''); if (mid && (!/^[a-f0-9]{24}$/.test(mid) || !(await first('SELECT 1 x FROM media WHERE id = ? AND uid = ?', mid, me)))) return J(400, { error: 'Upload the picture first.' }); await env.DB.prepare('UPDATE convs SET avatar = ? WHERE id = ?').bind(mid, id).run(); return J(200, { ok: true }); }
            if (gm[1] === 'rename') { if (mem.owner !== me) return J(403, { error: 'Only the group owner can do that.' }); const nm = cleanText(b.name, 32); if (nm.length < 2) return J(400, { error: 'Pick a longer name.' }); await env.DB.prepare('UPDATE convs SET name = ? WHERE id = ?').bind(nm, id).run(); return J(200, { ok: true }); }
            if (!uidOk(b.uid)) return J(400, { error: 'Bad request' });
            if (gm[1] === 'add') {
                if (mem.owner !== me) return J(403, { error: 'Only the group owner can add people.' });
                if (!(await friendsWith(me, b.uid)) || await blockedEither(me, b.uid)) return J(403, { error: 'You can only add friends.' });
                if ((await first('SELECT COUNT(*) c FROM members WHERE conv = ?', id)).c >= 20) return J(400, { error: 'A group holds up to 20 people.' });
                await env.DB.prepare("INSERT OR IGNORE INTO members(conv, uid, role, joined, last_read) VALUES(?, ?, 'member', ?, (SELECT COALESCE(MAX(id), 0) FROM msgs WHERE conv = ?))").bind(id, b.uid, Date.now(), id).run(); return J(200, { ok: true });
            }
            if (b.uid !== me && mem.owner !== me) return J(403, { error: 'Only the group owner can remove people.' });
            await env.DB.prepare('DELETE FROM members WHERE conv = ? AND uid = ?').bind(id, b.uid).run();
            if (b.uid === me && mem.owner === me) { const next = await first('SELECT uid FROM members WHERE conv = ? ORDER BY joined LIMIT 1', id); if (next) await env.DB.batch([env.DB.prepare('UPDATE convs SET owner = ? WHERE id = ?').bind(next.uid, id), env.DB.prepare("UPDATE members SET role = 'owner' WHERE conv = ? AND uid = ?").bind(id, next.uid)]); else await env.DB.batch([env.DB.prepare('DELETE FROM msgs WHERE conv = ?').bind(id), env.DB.prepare('DELETE FROM convs WHERE id = ?').bind(id)]); }
            return J(200, { ok: true });
        }
        if (p === '/social/report' && m === 'POST') {
            const b = await body(req, 2000); if (await limited(env, 'sx' + me, 10, 86400000)) return J(429, { error: 'You sent a lot of reports today.' });
            const reason = cleanText(b.reason, 300); if (!uidOk(b.uid) || reason.length < 3) return J(400, { error: 'Tell us briefly what happened.' });
            let snap = '', conv = cid(b.conv); if (conv && b.msgId && await inConv(conv)) { const mg = await first('SELECT text FROM msgs WHERE id = ? AND conv = ? AND uid = ?', clamp(b.msgId, 1, 1e12), conv, b.uid); if (mg) snap = mg.text.slice(0, 500); }
            await env.DB.prepare('INSERT INTO reports(id, reporter, target, conv, snap, reason, at, status) VALUES(?, ?, ?, ?, ?, ?, ?, ?)').bind(HEX(6), me, b.uid, conv, snap, reason, Date.now(), 'open').run(); return J(200, { ok: true });
        }
        return J(404, { error: 'Not found' });
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
        const rows = (await env.DB.prepare('SELECT uid, name, level, hours, streak, achievements, games, COALESCE((SELECT a.verified FROM accounts a WHERE a.uid = lb.uid), 0) verified FROM lb ORDER BY ' + metric + ' DESC, level DESC, hours DESC LIMIT ?').bind(lim).all()).results;
        const total = (await env.DB.prepare('SELECT COUNT(*) c FROM lb').first()).c; let myRank = null;
        if (uidOk(uid)) { const me = await env.DB.prepare('SELECT level, hours, streak, achievements FROM lb WHERE uid = ?').bind(uid).first(); if (me) myRank = 1 + (await env.DB.prepare('SELECT COUNT(*) c FROM lb WHERE ' + metric + ' > ?1 OR (' + metric + ' = ?1 AND (level > ?2 OR (level = ?2 AND hours > ?3)))').bind(me[metric], me.level, me.hours).first()).c; }
        return J(200, { metric, total, myRank, rows: rows.map((r, i) => ({ rank: i + 1, name: r.name, level: r.level, hours: r.hours, streak: r.streak, achievements: r.achievements, games: r.games, verified: !!r.verified, owner: r.verified === 2, uid: r.uid, me: r.uid === uid })) });
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
        const sort = q.get('sort'), order = sort === 'new' ? 't.at DESC' : sort === 'downloads' ? 't.downloads DESC, t.at DESC' : 'likes DESC, t.at DESC', u = uidOk(uid) ? uid : '';
        const qs = cleanText(q.get('q') || '', 30).toLowerCase().replace(/[%_]/g, ''), like = '%' + qs + '%';
        const SEL = "SELECT t.id, t.name, t.blurb AS desc, t.author, t.at, t.vars, t.downloads, t.uid auid, (length(t.css) > 0) hasCss, (SELECT a.verified FROM accounts a WHERE a.uid = t.uid) av, (SELECT COALESCE(SUM(t2.downloads), 0) FROM themes t2 WHERE t2.uid = t.uid AND t2.status = 'approved') cdl, (SELECT COUNT(*) FROM theme_likes l WHERE l.theme_id = t.id) likes, EXISTS(SELECT 1 FROM theme_likes l WHERE l.theme_id = t.id AND l.uid = ?1) liked FROM themes t WHERE t.status = 'approved'";
        const list = (await env.DB.prepare(SEL + " AND (?2 = '' OR lower(t.name) LIKE ?3 OR lower(t.author) LIKE ?3) ORDER BY " + order + ' LIMIT 60').bind(u, qs, like).all()).results;
        const featured = q.get('featured') === '1' ? (await env.DB.prepare(SEL + " AND t.at > ?2 ORDER BY (SELECT COUNT(*) FROM theme_likes l WHERE l.theme_id = t.id) * 3 + t.downloads DESC, t.at DESC LIMIT 6").bind(u, Date.now() - 45 * 86400000).all()).results.map(t => themeView(t)) : undefined;
        const mine = u ? (await env.DB.prepare("SELECT t.id, t.name, t.status, t.downloads, (SELECT COUNT(*) FROM theme_likes l WHERE l.theme_id = t.id) likes FROM themes t WHERE t.uid = ? ORDER BY t.at DESC LIMIT 50").bind(u).all()).results : [];
        return J(200, { themes: list.map(t => themeView(t)), featured, mine });
    }
    let mt;
    if ((mt = /^\/themes\/([a-f0-9]{16})$/.exec(p)) && m === 'GET') {
        const u = uidOk(uid) ? uid : '';
        if (q.get('dl') === '1' && !(await limited(env, 'dl' + addr, 120, 3600000))) await env.DB.prepare("UPDATE themes SET downloads = downloads + 1 WHERE id = ? AND status = 'approved'").bind(mt[1]).run();
        const t = await env.DB.prepare("SELECT t.id, t.name, t.blurb AS desc, t.author, t.at, t.vars, t.css, t.downloads, (SELECT a.verified FROM accounts a WHERE a.uid = t.uid) av, (SELECT COUNT(*) FROM theme_likes l WHERE l.theme_id = t.id) likes, EXISTS(SELECT 1 FROM theme_likes l WHERE l.theme_id = t.id AND l.uid = ?) liked FROM themes t WHERE t.id = ? AND t.status = 'approved'").bind(u, mt[1]).first();
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
    if ((mt = /^\/themes\/([a-f0-9]{16})$/.exec(p)) && m === 'DELETE') {
        if (!acct) return J(401, { error: 'Sign in first' });
        const r = await env.DB.prepare('DELETE FROM themes WHERE id = ? AND uid = ?').bind(mt[1], acct.uid).run();
        if (r.meta.changes) await env.DB.prepare('DELETE FROM theme_likes WHERE theme_id = ?').bind(mt[1]).run();
        return r.meta.changes ? J(200, { ok: true }) : J(404, { error: 'That is not your theme.' });
    }
    if ((mt = /^\/themes\/([a-f0-9]{16})\/report$/.exec(p)) && m === 'POST') {
        if (!acct) return J(401, { error: 'Sign in first' });
        if (await limited(env, 'tr' + acct.uid, 10, 86400000)) return J(429, { error: 'You sent a lot of reports today.' });
        const b = await body(req, 1000), reason = cleanText(b.reason, 300), t = await env.DB.prepare('SELECT uid, name, css FROM themes WHERE id = ?').bind(mt[1]).first();
        if (!t) return J(404, { error: 'Not found' }); if (reason.length < 3) return J(400, { error: 'Tell us briefly what is wrong.' });
        await env.DB.prepare('INSERT INTO reports(id, reporter, target, conv, snap, reason, at, status) VALUES(?, ?, ?, ?, ?, ?, ?, ?)').bind(HEX(6), acct.uid, t.uid, 'theme:' + mt[1], (t.name + ': ' + String(t.css || '').slice(0, 300)).slice(0, 500), reason, Date.now(), 'open').run();
        return J(200, { ok: true });
    }
    if (p === '/themes' && m === 'POST') {
        const b = await body(req, 40000); if (acct) { b.uid = acct.uid; b.author = b.author || acct.name; } if (!uidOk(b.uid)) return J(400, { error: 'Bad id' });
        if (await limited(env, 't' + b.uid, 3, 86400000) || await limited(env, 'ti' + addr, 6, 86400000)) return J(429, { error: 'You can share 3 themes a day.' });
        if (!acct && (await env.DB.prepare("SELECT COUNT(*) c FROM themes WHERE uid = ? AND status = 'pending'").bind(b.uid).first()).c >= 2) return J(400, { error: 'You already have 2 themes waiting for review.' });
        const r = checkTheme(b); if (r.error) return J(400, { error: r.error });
        if (acct && await env.DB.prepare('SELECT 1 x FROM bans WHERE uid = ? AND until > ?').bind(b.uid, Date.now()).first()) return J(403, { error: 'Your sharing is turned off.' });
        const id = HEX(8), status = acct ? 'approved' : 'pending';
        await env.DB.prepare('INSERT INTO themes(id, uid, status, at, name, blurb, author, vars, css) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(id, b.uid, status, Date.now(), r.theme.name, r.theme.desc, r.theme.author, JSON.stringify(r.theme.vars), r.theme.css).run();
        if (acct) await env.DB.prepare("INSERT INTO activity(uid, kind, text, appid, at) VALUES(?, 'theme', ?, 0, ?)").bind(acct.uid, 'published the theme ' + r.theme.name, Date.now()).run();
        return J(200, { ok: true, id, status });
    }
    return J(404, { error: 'Not found' });
}

export default {
    async scheduled(event, env, ctx) { // every hour: sale alerts. At 17:00 UTC: remind people whose friend streak is about to end, and tidy up old push tokens
        CTX = ctx; const today = Math.floor(Date.now() / 86400000), hr = new Date(event.scheduledTime || Date.now()).getUTCHours();
        try { await dealsRun(env, [4, 10, 16, 22].includes(hr)); } catch (e) { }
        try { await runSched(env); } catch (e) { }
        if ([4, 10, 16, 22].includes(hr)) await freeGamesRun(env);
        if (hr !== 17) return;
        try {
            const rows = (await env.DB.prepare('SELECT a, b, streak, a_day, b_day FROM streaks WHERE streak > 0 AND last_day = ? LIMIT 40').bind(today - 1).all()).results;
            for (const s of rows) {
                for (const [me, other, mine] of [[s.a, s.b, s.a_day], [s.b, s.a, s.b_day]]) {
                    if (mine === today) continue; const o = await env.DB.prepare('SELECT name FROM accounts WHERE uid = ?').bind(other).first(); if (!o) continue;
                    await pushTo(env, [me], { t: 'streak', title: 'Your streak is about to end', body: 'Message ' + o.name + ' today to keep your ' + s.streak + '-day streak.', peer: other });
                }
            }
            await env.DB.prepare('DELETE FROM devices WHERE at < ?').bind(Date.now() - 60 * 86400000).run();
        } catch (e) { }
    },
    async fetch(req, env, ctx) {
        CTX = ctx;
        try { return await route(req, env); }
        catch (e) { const code = e && (e.code === 413 || e.code === 400) ? e.code : 500; return J(code, { error: code === 413 ? 'Too big' : code === 400 ? 'Bad request' : 'Server error' }); }
    }
};

