'use strict';
// SteamLite Online server - runs on your PC, listens on 127.0.0.1 only (a tunnel such as playit.gg or Tailscale Funnel
// carries the public traffic to it). No dependencies: Node.js is all it needs.
//
//   Poll votes        GET /polls  POST /vote
//   Leaderboard       GET /lb     POST /lb/submit  POST /lb/remove
//   Theme gallery     GET /themes GET /themes/:id  POST /themes (needs approval)  POST /themes/:id/like
//   Live status       GET /status (announcements, special gifts)
//   Admin (this PC only, never through the tunnel)   GET /admin   - review themes, edit the status and polls
//
// Everything a player sends is checked and clamped here: the app is never trusted.

const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = __dirname, DATA = path.join(ROOT, 'data');
fs.mkdirSync(DATA, { recursive: true });

// ---------- config ----------
const CFG_FILE = path.join(ROOT, 'config.json');
function readJson(f, d) { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return d; } }
let cfg = readJson(CFG_FILE, null);
if (!cfg || !cfg.adminToken) {
    cfg = Object.assign({ port: 8787, host: '127.0.0.1' }, cfg || {}, { adminToken: crypto.randomBytes(24).toString('hex') });
    fs.writeFileSync(CFG_FILE, JSON.stringify(cfg, null, 2));
}
const PORT = Number(process.env.SL_SERVER_PORT) || cfg.port || 8787, HOST = cfg.host || '127.0.0.1';

// ---------- tiny JSON stores (atomic, debounced writes) ----------
class Store {
    constructor(name, def) { this.file = path.join(DATA, name + '.json'); this.data = readJson(this.file, null) || def; this.t = 0; }
    save() { clearTimeout(this.t); this.t = setTimeout(() => this.flush(), 400); }
    flush() { clearTimeout(this.t); try { const tmp = this.file + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(this.data)); fs.renameSync(tmp, this.file); } catch (e) { log('save failed ' + this.file + ': ' + e.message); } }
}
const DEF_POLLS = { polls: [{ id: 'next', title: 'What should we add next?', items: [
    { id: 'game-rooms', title: 'Game rooms', desc: 'Little shared lobbies where friends can see who is playing what.' },
    { id: 'mobile-companion', title: 'Phone companion', desc: 'Check your library, drops and quests from your phone.' },
    { id: 'custom-themes-online', title: 'Share themes online', desc: 'Publish your own themes to the gallery with one click.' },
    { id: 'more-events', title: 'More events', desc: 'Extra short events with their own quests and rewards.' },
    { id: 'mod-manager', title: 'Mod helper', desc: 'Open the mod folder and manage mods for supported games.' },
    { id: 'stats-year', title: 'Live year stats', desc: 'A year-in-review that updates all year round.' }] }] };
const polls = new Store('polls', DEF_POLLS), votes = new Store('votes', {}), lb = new Store('leaderboard', {}), themes = new Store('themes', {}), status = new Store('status', { motd: '', announcements: [], gifts: [] });

// ---------- helpers ----------
const LOG = path.join(DATA, 'server.log');
function log(m) { try { if (fs.existsSync(LOG) && fs.statSync(LOG).size > 1000000) fs.renameSync(LOG, LOG + '.old'); fs.appendFileSync(LOG, new Date().toISOString() + ' ' + m + '\n'); } catch (e) { } }
const hits = new Map();
function limited(key, max, ms) { const now = Date.now(), h = hits.get(key); if (!h || now > h.r) { hits.set(key, { n: 1, r: now + ms }); return false; } return ++h.n > max; }
setInterval(() => { const now = Date.now(); for (const [k, v] of hits) if (now > v.r) hits.delete(k); }, 60000).unref();
const LOOP = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);
function clientIp(req) { const ra = req.socket.remoteAddress || ''; if (LOOP.has(ra)) { const f = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.headers['true-client-ip']; if (f) return String(f).split(',')[0].trim(); } return ra; }
// admin pages are reachable from this PC only: no forwarding headers and a local Host name
function isLocalAdmin(req) {
    if (!LOOP.has(req.socket.remoteAddress || '')) return false;
    for (const h of ['x-forwarded-for', 'x-real-ip', 'forwarded', 'cf-connecting-ip', 'true-client-ip', 'x-forwarded-host']) if (req.headers[h]) return false;
    return /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(req.headers.host || '');
}
const uidOk = (u) => typeof u === 'string' && /^[a-f0-9]{32}$/.test(u);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, Math.floor(Number(v) || 0)));
const cleanName = (s) => String(s == null ? '' : s).replace(/[^\p{L}\p{N} _.\-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 24);
const cleanText = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f<>]/g, '').trim().slice(0, n);
function send(res, code, obj, extra) {
    const body = typeof obj === 'string' ? obj : JSON.stringify(obj);
    res.writeHead(code, Object.assign({ 'Content-Type': typeof obj === 'string' ? 'text/html; charset=utf-8' : 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }, extra || {}));
    res.end(body);
}
function readBody(req, max) {
    return new Promise((resolve, reject) => {
        let n = 0; const chunks = [];
        req.on('data', (c) => { n += c.length; if (n > max) { reject(Object.assign(new Error('too big'), { code: 413 })); req.destroy(); } else chunks.push(c); });
        req.on('end', () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch (e) { reject(Object.assign(new Error('bad json'), { code: 400 })); } });
        req.on('error', reject);
    });
}

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
const themeView = (t, uid, full) => { const o = { id: t.id, name: t.name, desc: t.desc, author: t.author, likes: (t.likes || []).length, liked: uid ? (t.likes || []).includes(uid) : false, at: t.at, colors: ['--accent-color', '--bg-dark', '--accent-color-2'].map(k => t.vars[k]).filter(Boolean) }; if (full) { o.vars = t.vars; o.css = t.css; } return o; };

// ---------- the admin page ----------
const ADMIN_HTML = `<!doctype html><meta charset=utf-8><title>SteamLite server admin</title><meta name=viewport content="width=device-width,initial-scale=1">
<style>body{font:14px system-ui;background:#0e0b1a;color:#eee;max-width:900px;margin:24px auto;padding:0 16px}h1{font-size:20px}section{background:#1a1530;border:1px solid #3a2f66;border-radius:14px;padding:16px;margin:16px 0}button{background:#7c3aed;color:#fff;border:0;border-radius:8px;padding:6px 14px;cursor:pointer;font:inherit;margin-right:6px}button.x{background:#7f1d1d}textarea{width:100%;height:220px;background:#0e0b1a;color:#eee;border:1px solid #3a2f66;border-radius:8px;font:12px monospace;padding:8px;box-sizing:border-box}input{background:#0e0b1a;color:#eee;border:1px solid #3a2f66;border-radius:8px;padding:6px}.sw{display:inline-block;width:18px;height:18px;border-radius:5px;margin-right:3px}.th{border-top:1px solid #3a2f66;padding:10px 0}pre{white-space:pre-wrap;font-size:11px;color:#aaa;max-height:120px;overflow:auto}</style>
<h1>SteamLite server admin</h1><section>Admin token <input id=tk type=password size=40> <button onclick="go()">Load</button> <span id=msg></span></section>
<section><b>Themes waiting for review</b><div id=pend>Enter the token above.</div></section>
<section><b>Post an announcement</b> <small>(a pop-up for every player, and the top of their dashboard news)</small><br>
<input id=at placeholder="Title" size=26> <input id=ax placeholder="Message" size=44> show for <input id=ad type=number value=3 style="width:56px"> days <button onclick="addAnn()">Post</button></section>
<section><b>Send a special gift</b> <small>(XP in the Drops window, once per player, max 100000)</small><br>
<input id=gt placeholder="Name, e.g. Weekend gift" size=26> <input id=gx type=number value=20000 style="width:90px"> XP, available for <input id=gh type=number value=24 style="width:56px"> hours <button onclick="addGift()">Send</button></section>
<section><b>Message from the team</b> <small>(one line at the top of the news, leave empty for none)</small><br><input id=mo size=60> <button onclick="saveMo()">Save</button></section>
<section><b>Live right now</b><div id=live>Enter the token above.</div></section>
<section><b>Polls</b><br><textarea id=po></textarea><br><button onclick="savePo()">Save polls</button></section>
<section><b>Stats</b><pre id=stats></pre></section>
<script>
const H=()=>({'Content-Type':'application/json','Authorization':'Bearer '+tk.value});const $=id=>document.getElementById(id);
async function api(m,p,b){const r=await fetch(p,{method:m,headers:H(),body:b?JSON.stringify(b):undefined});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||r.status);return j}
let cur={motd:'',announcements:[],gifts:[]};
async function go(){try{sessionStorage.t=tk.value;const d=await api('GET','/admin/data');$('msg').textContent='ok';cur=d.status;$('mo').value=cur.motd||'';paintLive();$('po').value=JSON.stringify(d.polls,null,2);$('stats').textContent=JSON.stringify(d.stats,null,2);
$('pend').innerHTML=d.pending.length?d.pending.map(t=>'<div class=th><b>'+esc(t.name)+'</b> by '+esc(t.author)+' - '+esc(t.desc)+'<br>'+Object.values(t.vars).filter(v=>/^#|rgb/.test(v)).slice(0,10).map(v=>'<span class=sw style="background:'+esc(v)+'"></span>').join('')+'<pre>'+esc(t.css||'(no extra css)')+'</pre><button onclick="act(\\''+t.id+'\\',\\'approve\\')">Approve</button><button class=x onclick="act(\\''+t.id+'\\',\\'reject\\')">Reject</button></div>').join(''):'Nothing waiting.'}catch(e){$('msg').textContent=e.message}}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function act(id,a){await api('POST','/admin/theme/'+id+'/'+a);go()}
const now=()=>Date.now();
function paintLive(){const a=(cur.announcements||[]).filter(x=>!x.until||x.until>now()),g=(cur.gifts||[]).filter(x=>x.until>now());const btn=(k,id)=>'<button class=x data-k='+k+' data-id="'+esc(id)+'" onclick="rm(this.dataset.k,this.dataset.id)">Remove</button>';$('live').innerHTML=(a.length||g.length)?a.map(x=>'<div class=th>Announcement: <b>'+esc(x.title)+'</b> - '+esc(x.text||'')+' <small>(until '+new Date(x.until).toLocaleString()+')</small> '+btn('announcements',x.id)+'</div>').join('')+g.map(x=>'<div class=th>Gift: <b>'+esc(x.title)+'</b> +'+x.xp+' XP <small>(until '+new Date(x.until).toLocaleString()+')</small> '+btn('gifts',x.id)+'</div>').join(''):'Nothing is live. Announcements and gifts you post show up here.'}
async function saveCur(){await api('PUT','/admin/status',cur);const d=await api('GET','/admin/data');cur=d.status;paintLive();$('msg').textContent='saved'}
async function addAnn(){try{const t=$('at').value.trim();if(!t){$('msg').textContent='Write a title first';return}cur.announcements=(cur.announcements||[]).filter(x=>!x.until||x.until>now());cur.announcements.push({id:'a'+now(),title:t,text:$('ax').value.trim(),until:now()+Math.max(1,+$('ad').value||3)*864e5,date:new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})});await saveCur();$('at').value='';$('ax').value=''}catch(e){$('msg').textContent=e.message}}
async function addGift(){try{const t=$('gt').value.trim(),xp=Math.min(100000,Math.max(1,+$('gx').value||0));if(!t){$('msg').textContent='Name the gift first';return}cur.gifts=(cur.gifts||[]).filter(x=>x.until>now());cur.gifts.push({id:'g'+now(),title:t,xp,until:now()+Math.max(1,+$('gh').value||24)*36e5});await saveCur();$('gt').value=''}catch(e){$('msg').textContent=e.message}}
async function saveMo(){try{cur.motd=$('mo').value.trim();await saveCur()}catch(e){$('msg').textContent=e.message}}
async function rm(k,id){try{cur[k]=(cur[k]||[]).filter(x=>x.id!==id);await saveCur()}catch(e){$('msg').textContent=e.message}}
async function savePo(){try{await api('PUT','/admin/polls',JSON.parse($('po').value));$('msg').textContent='polls saved'}catch(e){$('msg').textContent=e.message}}
if(sessionStorage.t){tk.value=sessionStorage.t;go()}
</script>`;

// ---------- routes ----------
async function route(req, res, url) {
    const p = url.pathname, m = req.method, ip = clientIp(req), q = url.searchParams;
    if (p === '/' || p === '/health') return send(res, 200, { ok: true, name: 'SteamLite Online', time: Date.now() });

    // ----- admin (this PC only) -----
    if (p === '/admin' || p.startsWith('/admin/')) {
        if (!isLocalAdmin(req)) return send(res, 404, { error: 'Not found' });
        if (p === '/admin' && m === 'GET') return send(res, 200, ADMIN_HTML, { 'Content-Security-Policy': "default-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'" });
        const tok = (req.headers.authorization || '').replace(/^Bearer /, '');
        const a = Buffer.from(tok), b = Buffer.from(cfg.adminToken);
        if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) { if (limited('adm' + ip, 8, 600000)) return send(res, 429, { error: 'Too many tries' }); return send(res, 401, { error: 'Wrong token' }); }
        if (p === '/admin/data') return send(res, 200, { pending: Object.values(themes.data).filter(t => t.status === 'pending').map(t => themeView(t, null, true)), status: status.data, polls: polls.data,
            stats: { themes: Object.values(themes.data).length, approved: Object.values(themes.data).filter(t => t.status === 'approved').length, leaderboard: Object.keys(lb.data).length, voters: Object.values(votes.data).reduce((s, v) => s + Object.keys(v).length, 0) } });
        let mm;
        if ((mm = /^\/admin\/theme\/([a-f0-9]{16})\/(approve|reject)$/.exec(p)) && m === 'POST') { const t = themes.data[mm[1]]; if (!t) return send(res, 404, { error: 'No such theme' }); t.status = mm[2] === 'approve' ? 'approved' : 'rejected'; themes.save(); return send(res, 200, { ok: true }); }
        if (p === '/admin/status' && m === 'PUT') { const b2 = await readBody(req, 60000); if (!b2 || typeof b2 !== 'object') return send(res, 400, { error: 'Bad status' }); status.data = { motd: cleanText(b2.motd, 200), announcements: (Array.isArray(b2.announcements) ? b2.announcements : []).slice(0, 10), gifts: (Array.isArray(b2.gifts) ? b2.gifts : []).slice(0, 10) }; status.flush(); return send(res, 200, { ok: true }); }
        if (p === '/admin/polls' && m === 'PUT') { const b2 = await readBody(req, 60000); if (!b2 || !Array.isArray(b2.polls)) return send(res, 400, { error: 'Bad polls' }); polls.data = b2; polls.flush(); return send(res, 200, { ok: true }); }
        return send(res, 404, { error: 'Not found' });
    }

    if (limited('g' + ip, 240, 60000)) return send(res, 429, { error: 'Slow down' });
    const uid = q.get('uid') || '';

    // ----- live status -----
    if (p === '/status' && m === 'GET') {
        const now = Date.now(), s = status.data;
        return send(res, 200, { motd: s.motd || '', announcements: (s.announcements || []).filter(a => a && a.id && (!a.until || a.until > now)).slice(0, 5).map(a => ({ id: String(a.id).slice(0, 40), title: cleanText(a.title, 120), text: cleanText(a.text, 400), date: cleanText(a.date, 40), url: /^https:\/\/[^\s<>"']{1,300}$/.test(String(a.url || '')) ? String(a.url) : '' })), gifts: (s.gifts || []).filter(g => g && g.id && g.until > now && g.xp > 0).slice(0, 5).map(g => ({ id: String(g.id).slice(0, 40), title: cleanText(g.title, 60), xp: clamp(g.xp, 1, 100000), until: g.until })) });
    }

    // ----- polls -----
    if (p === '/polls' && m === 'GET') {
        return send(res, 200, { polls: polls.data.polls.map(po => { const v = votes.data[po.id] || {}, counts = {}; Object.values(v).forEach(o => { counts[o] = (counts[o] || 0) + 1; }); return { id: po.id, title: po.title, total: Object.keys(v).length, mine: uidOk(uid) ? v[uid] || null : null, items: po.items.map(i => ({ id: i.id, title: i.title, desc: i.desc, votes: counts[i.id] || 0 })) }; }) });
    }
    if (p === '/vote' && m === 'POST') {
        if (limited('v' + ip, 30, 3600000)) return send(res, 429, { error: 'Too many votes from here' });
        const b = await readBody(req, 2000); const po = polls.data.polls.find(x => x.id === b.pollId);
        if (!uidOk(b.uid) || !po || !po.items.some(i => i.id === b.optionId)) return send(res, 400, { error: 'Bad vote' });
        (votes.data[po.id] = votes.data[po.id] || {})[b.uid] = b.optionId; votes.save(); return send(res, 200, { ok: true });
    }

    // ----- leaderboard -----
    if (p === '/lb' && m === 'GET') {
        const metric = ['level', 'hours', 'streak', 'achievements'].includes(q.get('metric')) ? q.get('metric') : 'level', lim = clamp(q.get('limit') || 50, 1, 100);
        const rows = Object.entries(lb.data).map(([u, e]) => Object.assign({ me: u === uid }, e)).sort((a, b) => (b[metric] - a[metric]) || (b.level - a.level) || (b.hours - a.hours));
        const mine = rows.findIndex(r => r.me);
        return send(res, 200, { metric, total: rows.length, myRank: mine >= 0 ? mine + 1 : null, rows: rows.slice(0, lim).map((r, i) => ({ rank: i + 1, name: r.name, level: r.level, hours: r.hours, streak: r.streak, achievements: r.achievements, games: r.games, me: r.me })) });
    }
    if (p === '/lb/submit' && m === 'POST') {
        const b = await readBody(req, 2000); if (!uidOk(b.uid)) return send(res, 400, { error: 'Bad id' });
        if (limited('l' + b.uid, 6, 3600000)) return send(res, 429, { error: 'Updated too often' });
        const name = cleanName(b.name); if (name.length < 2) return send(res, 400, { error: 'Pick a name with 2+ letters or numbers.' });
        lb.data[b.uid] = { name, level: clamp(b.level, 1, 100), hours: clamp(b.hours, 0, 200000), streak: clamp(b.streak, 0, 5000), achievements: clamp(b.achievements, 0, 500), games: clamp(b.games, 0, 20000), at: Date.now() };
        const keys = Object.keys(lb.data); if (keys.length > 5000) { keys.sort((a, c) => lb.data[a].at - lb.data[c].at).slice(0, keys.length - 5000).forEach(k => delete lb.data[k]); }
        lb.save(); return send(res, 200, { ok: true });
    }
    if (p === '/lb/remove' && m === 'POST') { const b = await readBody(req, 500); if (uidOk(b.uid) && lb.data[b.uid]) { delete lb.data[b.uid]; lb.save(); } return send(res, 200, { ok: true }); }

    // ----- theme gallery -----
    if (p === '/themes' && m === 'GET') {
        const sort = q.get('sort') === 'new' ? 'new' : 'liked';
        const list = Object.values(themes.data).filter(t => t.status === 'approved').sort((a, b) => sort === 'new' ? b.at - a.at : ((b.likes || []).length - (a.likes || []).length) || (b.at - a.at)).slice(0, 60);
        const mineP = uidOk(uid) ? Object.values(themes.data).filter(t => t.uid === uid && t.status !== 'approved').map(t => ({ id: t.id, name: t.name, status: t.status })) : [];
        return send(res, 200, { themes: list.map(t => themeView(t, uid)), mine: mineP });
    }
    let mt;
    if ((mt = /^\/themes\/([a-f0-9]{16})$/.exec(p)) && m === 'GET') { const t = themes.data[mt[1]]; if (!t || t.status !== 'approved') return send(res, 404, { error: 'Not found' }); return send(res, 200, themeView(t, uid, true)); }
    if ((mt = /^\/themes\/([a-f0-9]{16})\/like$/.exec(p)) && m === 'POST') {
        const b = await readBody(req, 500), t = themes.data[mt[1]]; if (!uidOk(b.uid) || !t || t.status !== 'approved') return send(res, 400, { error: 'Bad request' });
        if (limited('k' + b.uid, 60, 3600000)) return send(res, 429, { error: 'Slow down' });
        t.likes = t.likes || []; const i = t.likes.indexOf(b.uid); if (i >= 0) t.likes.splice(i, 1); else t.likes.push(b.uid); themes.save(); return send(res, 200, { ok: true, likes: t.likes.length, liked: i < 0 });
    }
    if (p === '/themes' && m === 'POST') {
        const b = await readBody(req, 40000); if (!uidOk(b.uid)) return send(res, 400, { error: 'Bad id' });
        if (limited('t' + b.uid, 3, 86400000) || limited('ti' + ip, 6, 86400000)) return send(res, 429, { error: 'You can share 3 themes a day.' });
        if (Object.values(themes.data).filter(t => t.uid === b.uid && t.status === 'pending').length >= 2) return send(res, 400, { error: 'You already have 2 themes waiting for review.' });
        const r = checkTheme(b); if (r.error) return send(res, 400, { error: r.error });
        const id = crypto.randomBytes(8).toString('hex'); themes.data[id] = Object.assign({ id, uid: b.uid, status: 'pending', at: Date.now(), likes: [] }, r.theme); themes.save(); log('theme submitted ' + id + ' ' + r.theme.name);
        return send(res, 200, { ok: true, id, status: 'pending' });
    }
    return send(res, 404, { error: 'Not found' });
}

const server = http.createServer(async (req, res) => {
    try { await route(req, res, new URL(req.url, 'http://x')); }
    catch (e) { const code = e.code === 413 || e.code === 400 ? e.code : 500; if (code === 500) log('error ' + req.method + ' ' + req.url + ': ' + (e && e.stack || e)); try { send(res, code, { error: code === 413 ? 'Too big' : code === 400 ? 'Bad request' : 'Server error' }); } catch (x) { } }
});
server.headersTimeout = 10000; server.requestTimeout = 15000; server.keepAliveTimeout = 5000; server.maxHeadersCount = 40;
server.on('error', (e) => { log('server error: ' + e.message); console.error(e.message); process.exit(1); });
server.listen(PORT, HOST, () => { log('SteamLite Online listening on ' + HOST + ':' + PORT); console.log('SteamLite Online listening on http://' + HOST + ':' + PORT); });
const bye = () => { [polls, votes, lb, themes, status].forEach(s => s.flush()); process.exit(0); };
process.on('SIGINT', bye); process.on('SIGTERM', bye);
process.on('uncaughtException', (e) => { log('uncaught: ' + (e && e.stack || e)); });
