'use strict';
// SteamLite 9.2.0 - the SteamLite account (Sign in with Steam) and the connection to SteamLite Online. Used by both editions.
// Signing in is required to use the app: the sign-in screen is account_gate.js, and "acctGate" below says whether to show it.

module.exports = function initAccount(ctx) {
    const { app, ipcMain, store, fetchApi } = ctx;
    const crypto = require('crypto');
    const handle = (name, fn) => ipcMain.handle('feat:' + name, async (e, payload) => {
        try { return await fn(payload || {}, e); } catch (err) { console.error('[account ' + name + ']', err.message); return { ok: false, error: err.message }; }
    });

    // ---------- SteamLite Online: the server (polls, leaderboard, theme gallery, live status) ----------
    // The address comes from online.json in the SteamLite repository, so it can change without an update. Everything here fails
    // quietly: with no server, the app simply behaves as before.
    const URL_OK = /^(https:\/\/[\w.-]+(:\d+)?|http:\/\/(127\.0\.0\.1|localhost)(:\d+)?)$/i;
    const DEFAULT_BASE = 'https://steamlite-online.bayxturtle.workers.dev'; // used when the address list on GitHub cannot be reached
    let baseCache = { url: '', at: 0 };
    const resetBase = () => { baseCache = { url: '', at: 0 }; };
    async function onlineBase() {
        const forced = process.env.SL_ONLINE_URL || store.get('onlineServerOverride');
        if (forced && URL_OK.test(String(forced).replace(/\/+$/, ''))) return String(forced).replace(/\/+$/, '');
        if (baseCache.url && Date.now() - baseCache.at < 600000) return baseCache.url;
        try {
            const d = await fetchApi('https://raw.githubusercontent.com/imnotfisy/SteamLite/main/online.json?t=' + Date.now(), {}, 6000);
            const u = d && String(d.url || '').replace(/\/+$/, '');
            baseCache = { url: u && URL_OK.test(u) ? u : '', at: Date.now() };
        } catch (e) { baseCache = { url: baseCache.url, at: Date.now() - 540000 }; }
        return baseCache.url;
    }
    function onlineId() { let id = store.get('onlineId'); if (!/^[a-f0-9]{32}$/.test(id || '')) { id = crypto.randomBytes(16).toString('hex'); store.set('onlineId', id); } return id; }
    // the sign-in token lives in the app data, encrypted with the Windows account when possible
    const acctTok = () => { const v = store.get('acctTok'); if (!v) return ''; try { return v.enc ? require('electron').safeStorage.decryptString(Buffer.from(v.enc, 'base64')) : String(v.plain || ''); } catch (e) { return ''; } };
    const acctTokSet = (t) => {
        if (!t) { store.delete('acctTok'); return; }
        try { const ss = require('electron').safeStorage; if (ss.isEncryptionAvailable()) { store.set('acctTok', { enc: ss.encryptString(t).toString('base64') }); return; } } catch (e) { }
        store.set('acctTok', { plain: t });
    };
    async function srv(method, p, body, timeout) {
        const base = await onlineBase(); if (!base) return { ok: false, error: 'not-configured' };
        const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), timeout || 7000), tok = acctTok();
        try {
            const r = await fetch(base + p, { method, signal: ctl.signal, headers: Object.assign({ 'Content-Type': 'application/json', 'X-SL-Client': 'SteamLite/' + ctx.APP_VERSION }, tok ? { Authorization: 'Bearer ' + tok } : {}), body: body ? JSON.stringify(body) : undefined });
            let j = null; try { j = await r.json(); } catch (e) { }
            if (!r.ok) return { ok: false, error: (j && j.error) || ('HTTP ' + r.status), code: r.status };
            return Object.assign({ ok: true }, j || {});
        } catch (e) { return { ok: false, error: 'offline' }; } finally { clearTimeout(t); }
    }

    // ---------- accounts: Sign in with Steam. Steam's own page confirms who you are; SteamLite never sees a password ----------
    let loginTry = null; // { n, at }
    const acctInfo = () => store.get('acctInfo') || null;
    handle('acctStatus', async () => {
        if (!acctTok()) return { signedIn: false };
        const r = await srv('GET', '/me');
        if (r.ok) { store.set('acctInfo', { name: r.name, steamid: r.steamid, avatar: r.avatar || '', verified: !!r.verified, owner: !!r.owner, created: r.created || 0, code: r.code || '' }); return { signedIn: true, name: r.name, avatar: r.avatar || '', verified: !!r.verified, owner: !!r.owner, created: r.created || 0, code: r.code || '', hasKey: !!r.hasKey, idTail: String(r.steamid).slice(-4), backupAt: r.backupAt || 0, prevAt: r.prevAt || 0, localBackupAt: store.get('cloudBackupAt') || 0 }; }
        if (r.code === 401) { acctTokSet(''); store.delete('acctInfo'); return { signedIn: false, expired: true }; }
        const i = acctInfo(); return { signedIn: true, offline: true, name: i ? i.name : '', avatar: i ? (i.avatar || '') : '', verified: !!(i && i.verified), owner: !!(i && i.owner), created: i ? (i.created || 0) : 0, code: i ? (i.code || '') : '', hasKey: !!store.get('apiKey'), idTail: i ? String(i.steamid).slice(-4) : '', backupAt: 0, localBackupAt: store.get('cloudBackupAt') || 0 };
    });
    handle('acctLogin', async () => {
        const base = await onlineBase(); if (!base) return { ok: false, error: 'SteamLite Online is not available right now.' };
        loginTry = { n: crypto.randomBytes(16).toString('hex'), at: Date.now() };
        await require('electron').shell.openExternal(base + '/auth/start?n=' + loginTry.n); return { ok: true };
    });
    handle('acctLoginCheck', async () => {
        if (!loginTry || Date.now() - loginTry.at > 600000) { loginTry = null; return { done: false, expired: true }; }
        const r = await srv('GET', '/auth/poll?n=' + loginTry.n, null, 6000); if (!r.ok || !r.done) return { done: false };
        loginTry = null; acctTokSet(r.token); store.set('acctInfo', { name: r.name, steamid: r.steamid });
        if (!store.get('steamId')) store.set('steamId', String(r.steamid)); // the Steam profile of the account is the one SteamLite opens with
        if (!store.get('lbName')) store.set('lbName', String(r.name).slice(0, 24));
        return { done: true, name: r.name };
    });
    handle('acctLoginCancel', () => { loginTry = null; return true; });
    handle('acctLogout', async () => { try { await srv('POST', '/logout'); } catch (e) { } acctTokSet(''); store.delete('acctInfo'); return { ok: true }; });
    handle('acctDelete', async () => { const r = await srv('DELETE', '/account'); if (r.ok) { acctTokSet(''); store.delete('acctInfo'); store.set('lbOptIn', false); store.set('apiKey', ''); store.set('steamId', ''); } return r.ok ? { ok: true } : { ok: false, error: r.error === 'offline' ? 'Could not reach the server. Try again in a moment.' : r.error }; });
    async function cloudBackup() {
        if (!acctTok()) return { ok: false, error: 'Sign in first.' };
        const data = {}; for (const k of ctx.BACKUP_KEYS) { const v = store.get(k); if (v !== undefined) data[k] = v; }
        const r = await srv('PUT', '/backup', { version: ctx.APP_VERSION, data }, 20000);
        if (r.ok) store.set('cloudBackupAt', Date.now());
        return r.ok ? { ok: true, at: r.at } : { ok: false, error: r.error === 'offline' ? 'Could not reach the server.' : r.error };
    }
    handle('acctBackup', cloudBackup);
    handle('acctRestore', async (p) => {
        if (!acctTok()) return { ok: false, error: 'Sign in first.' };
        const r = await srv('GET', '/backup' + (p && p.prev ? '?v=prev' : ''), null, 20000);
        if (!r.ok) return { ok: false, error: r.code === 404 ? 'There is no backup in your account yet.' : (r.error === 'offline' ? 'Could not reach the server.' : r.error) };
        const d = r.backup && r.backup.data; if (!d || typeof d !== 'object') return { ok: false, error: 'That backup could not be read.' };
        try { ctx.restorePoint && ctx.restorePoint('before-cloud-restore'); } catch (e) { }
        let n = 0; for (const k of ctx.BACKUP_KEYS) if (d[k] !== undefined && d[k] !== null) { store.set(k, d[k]); n++; }
        return { ok: true, restored: n, at: r.at };
    });
    // a quiet backup about once a day while signed in
    const autoBackup = () => { try { if (acctTok() && Date.now() - (store.get('cloudBackupAt') || 0) > 22 * 3600000) cloudBackup(); } catch (e) { } };
    setTimeout(autoBackup, 60000); setInterval(autoBackup, 3 * 3600000);


    // ---------- messages, groups, friends, profiles, lists and challenges: the windows ask by name and the server does the checking ----------
    const idq = (v) => String(v || '').replace(/[^a-z0-9]/g, '').slice(0, 40);
    const SOC = { typing: ['POST', '/social/typing'], blocks: ['GET', '/social/blocks'], find: ['POST', '/social/find'], friend: ['POST', '/social/friend'], respond: ['POST', '/social/respond'], unfriend: ['POST', '/social/unfriend'], block: ['POST', '/social/block'],
        dm: ['POST', '/social/dm'], send: ['POST', '/social/send'], del: ['POST', '/social/delete'], group: ['POST', '/social/group'], groupAdd: ['POST', '/social/group/add'], groupRemove: ['POST', '/social/group/remove'], groupRename: ['POST', '/social/group/rename'], report: ['POST', '/social/report'],
        react: ['POST', '/social/react'], edit: ['POST', '/social/edit'], pin: ['POST', '/social/pin'], mute: ['POST', '/social/mute'], presence: ['POST', '/social/presence'], stats: ['POST', '/social/stats'], bio: ['POST', '/social/bio'], listCreate: ['POST', '/social/lists'], challengeStart: ['POST', '/social/challenge'] };
    handle('soc', async (p) => {
        const op = String(p.op || '');
        if (op === 'overview') return srv('GET', '/social/overview');
        if (op === 'conv') return srv('GET', '/social/conv?id=' + idq(p.id) + '&after=' + (Math.floor(Number(p.after)) || 0) + '&before=' + (Math.floor(Number(p.before)) || 0));
        if (op === 'search') return srv('GET', '/social/search?conv=' + idq(p.conv) + '&q=' + encodeURIComponent(String(p.q || '').slice(0, 40)));
        if (op === 'profile') return srv('GET', '/social/profile?uid=' + idq(p.uid));
        if (op === 'listGet') return srv('GET', '/social/lists/' + idq(p.id));
        if (op === 'listsMine') return srv('GET', '/social/lists');
        if (op === 'listDelete') return srv('DELETE', '/social/lists/' + idq(p.id));
        if (op === 'challenges') return srv('GET', '/social/challenges');
        if (op === 'challengeEnd') return srv('DELETE', '/social/challenge/' + idq(p.id));
        if (op === 'unfurl') return srv('GET', '/social/unfurl?u=' + encodeURIComponent(String(p.u || '').slice(0, 400)));
        if (op === 'media') { const mime = String(p.mime || ''), data = String(p.data || ''); if (data.length > 1400000) return { ok: false, error: 'That file is too big (1 MB max).' }; return srv('POST', '/media', { mime, data }, 40000); }
        if (op === 'clientError') return srv('POST', '/client-error', { app: 'desktop', v: ctx.APP_VERSION, msg: String(p.msg || '').slice(0, 180) });
        const e = SOC[op]; if (!e) return { ok: false, error: 'Unknown request.' };
        const body = Object.assign({}, p); delete body.op; return srv(e[0], e[1], body, 10000);
    });

    // ---------- your profile look (banner, frame, title, showcase, accent, tagline) is published, so friends see it in both apps ----------
    const { nativeImage } = require('electron'); let lastProfileSig = '', bannerCache = { key: '', id: '' }, profileBusy = false;
    async function bannerPayload(b) {
        if (!b || b.mode === 'default') return null;
        const o = { mode: b.mode, blur: b.blur || 0, dim: b.dim || 0, x: b.x === undefined ? 50 : b.x, y: b.y === undefined ? 50 : b.y, zoom: b.zoom || 100, c1: b.c1, c2: b.c2, angle: b.angle === undefined ? 135 : b.angle };
        if (b.mode !== 'image') return o;
        const fs = require('fs'); let st; try { st = fs.statSync(b.image); } catch (e) { return null; }
        const key = b.image + '|' + st.mtimeMs; if (bannerCache.key === key && bannerCache.id) { o.id = bannerCache.id; return o; }
        let img = nativeImage.createFromPath(b.image); if (img.isEmpty()) return null; const sz = img.getSize(); if (sz.width > 1280) img = img.resize({ width: 1280 });
        let q = 82, buf = img.toJPEG(q); while (buf.length > 900000 && q > 30) { q -= 15; buf = img.toJPEG(q); } if (buf.length > 950000) return null;
        const r = await srv('POST', '/media', { mime: 'image/jpeg', data: buf.toString('base64') }, 40000); if (!r || !r.ok) return null;
        bannerCache = { key, id: r.id }; o.id = r.id; return o;
    }
    // what is on this PC right now, as one comparable string (the picture counts by file and time, not by upload)
    function localLook(sid) {
        const c = (store.get('profileCustom') || {})[sid] || {}, bn = (store.get('profileBanners') || {})[sid] || {}; let m = 0; try { if (bn.mode === 'image' && bn.image) m = require('fs').statSync(bn.image).mtimeMs; } catch (e) { }
        return JSON.stringify([c.tagline || '', c.accent || '', c.frame || 'none', c.title || '', (c.showcase || []).map(String), !!c.hideBadges, bn.mode || 'default', bn.blur || 0, bn.dim || 0, bn.x, bn.y, bn.zoom, bn.c1 || '', bn.c2 || '', bn.angle, bn.image || '', m]);
    }
    // the look changed on the phone: take it over on this PC
    async function applyServerLook(sid, p) {
        const fs = require('fs'), path = require('path'), cu = p.custom || {};
        const pc = store.get('profileCustom') || {}; pc[sid] = Object.assign({}, pc[sid], { tagline: String(cu.tagline || ''), accent: /^#[0-9a-f]{6}$/i.test(cu.accent || '') ? cu.accent : '', frame: cu.frame ? String(cu.frame) : 'none', title: String(cu.title || ''), showcase: (Array.isArray(cu.showcase) ? cu.showcase : []).map(String).slice(0, 5), hideBadges: !!cu.hideBadges });
        const pb = store.get('profileBanners') || {}, bn = cu.banner, cur = pb[sid] || {};
        if (!bn || bn.mode === 'default') pb[sid] = Object.assign({}, cur, { mode: 'default' });
        else {
            const nb = { mode: bn.mode, blur: bn.blur || 0, dim: bn.dim || 0, x: bn.x === undefined ? 50 : bn.x, y: bn.y === undefined ? 50 : bn.y, zoom: bn.zoom || 100, c1: bn.c1, c2: bn.c2, angle: bn.angle === undefined ? 135 : bn.angle };
            if (bn.mode === 'image') {
                if (!bn.id || !/^[a-f0-9]{24}$/.test(bn.id)) return false;
                const b = await onlineBase(); if (!b) return false; const dir = path.join(require('electron').app.getPath('userData'), 'banners'); fs.mkdirSync(dir, { recursive: true });
                const file = path.join(dir, 'phone-' + bn.id + '.jpg');
                if (!fs.existsSync(file)) { const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 30000); try { const r = await fetch(b + '/media/' + bn.id, { signal: ctl.signal }); if (!r.ok) return false; fs.writeFileSync(file, Buffer.from(await r.arrayBuffer())); } finally { clearTimeout(t); } }
                nb.image = file; bannerCache = { key: file + '|' + fs.statSync(file).mtimeMs, id: bn.id };   // the server already has this picture: no need to upload it again
            }
            pb[sid] = Object.assign({}, cur, nb);
        }
        store.set('profileCustom', pc); store.set('profileBanners', pb); return true;
    }
    async function syncProfile() {
        if (profileBusy || !acctTok()) return; const sid = acctSteamId(); if (!sid) return; profileBusy = true;
        try {
            let pulled = false, syncAt = Number(store.get('profileSyncAt')) || 0; const lastLocal = String(store.get('profileLocalSig') || ''), uid = crypto.createHash('sha256').update('steamlite-account:' + sid).digest('hex').slice(0, 32);
            // 1) did the look change somewhere else (the phone) since we last agreed, while nothing changed here?
            if (syncAt > 0 && localLook(sid) === lastLocal) {
                const sp = await srv('GET', '/social/profile?uid=' + uid, null, 15000);
                if (sp && sp.uid && sp.custom && sp.custom.at > syncAt) { if (await applyServerLook(sid, sp)) { store.set('profileSyncAt', sp.custom.at); store.set('profileLocalSig', localLook(sid)); pulled = true; syncAt = sp.custom.at; } }
            }
            const c = (store.get('profileCustom') || {})[sid] || {}, bn = (store.get('profileBanners') || {})[sid] || null, pre = (store.get('prestige') || {}).count || 0;
            const banner = await bannerPayload(bn);
            const body = { tagline: String(c.tagline || ''), accent: /^#[0-9a-f]{6}$/i.test(c.accent || '') ? c.accent : '', frame: c.frame && c.frame !== 'none' ? String(c.frame) : '', title: String(c.title || ''), hideBadges: !!c.hideBadges, showcase: (Array.isArray(c.showcase) ? c.showcase : []).map(Number).filter(Boolean).slice(0, 5), banner: banner, prestige: pre };
            const sig = JSON.stringify(body); if (pulled) { lastProfileSig = sig; return; } if (sig === lastProfileSig) return;
            const r = await srv('POST', '/social/customize', body, 20000); if (r && r.ok) { lastProfileSig = sig; if (r.at) { store.set('profileSyncAt', r.at); store.set('profileLocalSig', localLook(sid)); } }
        } catch (e) { } finally { profileBusy = false; }
    }
    setInterval(syncProfile, 90000); setTimeout(syncProfile, 25000);

    // ---------- the play streak: messaging anyone on the phone counts as a play day, and the phone shows the real number ----------
    let lastStreakSig = '', streakBusy = false;
    async function syncStreak() {
        if (streakBusy || !acctTok() || !ctx.getStreakState) return; streakBusy = true;
        try {
            const r = await srv('GET', '/me/streak', null, 15000);
            if (r && r.ok && Array.isArray(r.phoneDays)) { // fold in the days you messaged from the phone, oldest first
                let last = null; for (const d of r.phoneDays.filter((x) => /^\d{4}-\d{2}-\d{2}$/.test(x)).sort()) { const e = ctx.updateStreakOnPlay(d); if (e) last = e; }
                if (last) ctx.tellStreak(last);
            }
            const s = ctx.getStreakState(), rec = s.recovery || {}, body = { current: s.current || 0, best: s.best || 0, lastPlayDay: s.lastPlayDay || '', restores: store.get('streakRestores') || 0, recoveryUntil: rec.activeUntil || '', previous: rec.previousStreak || 0 }, sig = JSON.stringify(body);
            if (sig !== lastStreakSig) { const w = await srv('POST', '/me/streak', body, 15000); if (w && w.ok) lastStreakSig = sig; }
        } catch (e) { } finally { streakBusy = false; }
    }
    setInterval(syncStreak, 45000); setTimeout(syncStreak, 20000);

    // ---------- "Launch on my PC": the phone app asks, and this starts the game (only if the player turned it on in Privacy) ----------
    const { shell, Notification } = require('electron'); let phoneBusy = false;
    async function checkPhone() {
        if (phoneBusy || !acctTok()) return; const ui = store.get('uiPrefs') || {}; if (ui.remoteLaunch !== true && ui.remoteControl !== true) return;
        phoneBusy = true;
        try {
            const run = ctx.getRunning ? ctx.getRunning() : null;   // the phone shows what is running here
            const r = await srv('POST', '/pc/pending', { running: run ? { appid: Number(run.appid) || 0, name: String(run.name || ''), since: run.since || 0 } : null });
            if (r && r.ok && Array.isArray(r.cmds)) for (const c of r.cmds.slice(0, 3)) {
                const ctl = /^ctl:(lock|sleep|close)$/.exec(String(c.name || ''));
                if (ctl) { // lock / sleep / close the running game: only when you allowed remote control here
                    if (ui.remoteControl !== true) continue; const act = ctl[1];
                    if (process.env.SL_TEST_NO_LAUNCH) { store.set('testCtl', act); continue; }
                    try { const cp = require('child_process'); if (act === 'lock') cp.exec('rundll32.exe user32.dll,LockWorkStation'); else if (act === 'sleep') cp.exec('rundll32.exe powrprof.dll,SetSuspendState 0,1,0'); else if (ctx.stopGame) ctx.stopGame(); } catch (e) { }
                    try { new Notification({ title: 'SteamLite', body: act === 'lock' ? 'Locking this PC from your phone' : act === 'sleep' ? 'Putting this PC to sleep from your phone' : 'Closing the game from your phone' }).show(); } catch (e) { }
                    continue;
                }
                if (ui.remoteLaunch !== true) continue;
                const id = String(c.appid || '').replace(/[^0-9]/g, ''); if (!/^\d{1,10}$/.test(id)) continue;
                if (process.env.SL_TEST_NO_LAUNCH) { store.set('testLaunch', id); continue; }   // used by the automatic tests only
                shell.openExternal('steam://rungameid/' + id);
                try { new Notification({ title: 'SteamLite', body: 'Starting ' + String(c.name || 'a game').slice(0, 60) + ' from your phone' }).show(); } catch (e) { }
            }
        } catch (e) { } finally { phoneBusy = false; }
    }
    setInterval(checkPhone, 25000); setTimeout(checkPhone, 15000);

    // ---------- "what should we play?": the games you and the people in a chat all own ----------
    handle('socNight', async (p) => {
        const key = String(store.get('apiKey') || ''), sid = acctSteamId(); if (!key || !sid) return { ok: false, error: 'Add your Steam Web API key in Settings first.' };
        const crypto = require('crypto'), uids = (Array.isArray(p.uids) ? p.uids : []).map(idq).filter(Boolean).slice(0, 12), names = p.names && typeof p.names === 'object' ? p.names : {};
        if (!uids.length) return { ok: false, error: 'Nobody to compare with.' };
        const owned = async (id) => { try { const d = await ctx.fetchApi('https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=' + key + '&steamid=' + id + '&include_appinfo=1&include_played_free_games=1&format=json', {}, 15000); return (d.response && d.response.games) || null; } catch (e) { return null; } };
        let friends = []; try { const d = await ctx.fetchApi('https://api.steampowered.com/ISteamUser/GetFriendList/v1/?key=' + key + '&steamid=' + sid + '&relationship=friend', {}, 12000); friends = (d.friendslist && d.friendslist.friends) || []; } catch (e) { }
        const idOf = {}; friends.forEach((f) => { idOf[crypto.createHash('sha256').update('steamlite-account:' + f.steamid).digest('hex').slice(0, 32)] = f.steamid; });
        const mine = await owned(sid); if (!mine) return { ok: false, error: 'Steam did not return your games. Your profile "Game details" must be public.' };
        const map = {}; mine.forEach((g) => { map[g.appid] = { appid: g.appid, name: g.name, n: 1, who: ['You'], hrs: g.playtime_forever || 0 }; });
        const skipped = []; let total = 1;
        for (const u of uids) {
            const nm = String(names[u] || 'A friend').slice(0, 32); const id = idOf[u]; if (!id) { skipped.push(nm); continue; }
            const g = await owned(id); if (!g || !g.length) { skipped.push(nm); continue; } total++;
            g.forEach((x) => { const e = map[x.appid] || (map[x.appid] = { appid: x.appid, name: x.name, n: 0, who: [], hrs: 0 }); if (!e.who.includes(nm)) { e.n++; e.who.push(nm); } e.hrs += x.playtime_forever || 0; });
        }
        const games = Object.values(map).filter((e) => e.n >= 2 && e.name).sort((a, b) => b.n - a.n || b.hrs - a.hrs).slice(0, 30).map((e) => ({ appid: e.appid, name: e.name, n: e.n, hours: Math.round(e.hrs / 60) }));
        return { ok: true, total, everyone: games.filter((e) => e.n === total).length, games, skipped };
    });

    // ---------- the community theme gallery (both editions): browse, download, publish, delete, report ----------
    const hexId = (v) => String(v || '').replace(/[^a-f0-9]/g, '').slice(0, 16);
    const uidQ = () => '?uid=' + onlineId();
    handle('srvThemes', (p) => srv('GET', '/themes' + uidQ() + '&sort=' + (['new', 'downloads'].includes(p.sort) ? p.sort : 'liked') + (p.q ? '&q=' + encodeURIComponent(String(p.q).slice(0, 30)) : '') + (p.featured ? '&featured=1' : ''), null, 9000));
    handle('srvTheme', (p) => srv('GET', '/themes/' + hexId(p.id) + uidQ() + (p.dl ? '&dl=1' : ''), null, 9000));
    handle('srvThemeLike', (p) => srv('POST', '/themes/' + hexId(p.id) + '/like', { uid: onlineId() }));
    handle('srvThemeShare', (p) => srv('POST', '/themes', { uid: onlineId(), name: p.name, desc: p.desc, author: p.author, vars: p.vars, css: p.css }, 12000));
    handle('srvThemeDelete', (p) => srv('DELETE', '/themes/' + hexId(p.id)));
    handle('srvThemeReport', (p) => srv('POST', '/themes/' + hexId(p.id) + '/report', { reason: String(p.reason || '').slice(0, 300) }));

    // ---------- the Steam library connection: the Steam ID is the account's, the Web API key is entered once and kept on the server ----------
    const acctSteamId = () => { const i = store.get('acctInfo'); return i && i.steamid ? String(i.steamid) : ''; };
    // 'have': this PC is ready. 'fetched': this PC just got the saved key and needs a reload. 'need': nobody has entered a key yet.
    async function ensureKey() {
        let sid = acctSteamId();
        if (!sid && acctTok()) { const me = await srv('GET', '/me'); if (me.ok) { store.set('acctInfo', { name: me.name, steamid: me.steamid, avatar: me.avatar || '', verified: !!me.verified, owner: !!me.owner, created: me.created || 0, code: me.code || '' }); sid = String(me.steamid); } }
        if (!sid) return { state: 'need', offline: true };
        const local = String(store.get('apiKey') || '');
        if (local && String(store.get('steamId') || '') === sid) { srv('GET', '/me').then((r) => { if (r.ok && !r.hasKey) srv('PUT', '/me/key', { key: local }); }).catch(() => { }); return { state: 'have' }; }
        if (local && ctx.addProfile) { const r = await ctx.addProfile(sid, local); if (r.ok) { srv('PUT', '/me/key', { key: local }).catch(() => { }); return { state: 'fetched' }; } }
        const k = await srv('GET', '/me/key');
        if (k.ok && k.key && ctx.addProfile) { const r = await ctx.addProfile(sid, k.key); if (r.ok) return { state: 'fetched' }; }
        return { state: 'need', offline: !k.ok && k.error === 'offline' };
    }
    // the SteamLite account uses the same picture as the Steam account: read it from Steam and tell the server
    async function syncAvatar() {
        try {
            const key = String(store.get('apiKey') || ''), sid = acctSteamId(); if (!key || !sid || !acctTok()) return;
            const d = await fetchApi('https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=' + key + '&steamids=' + sid, {}, 7000);
            const u = d && d.response && d.response.players && d.response.players[0];
            if (u && u.avatarfull) { const r = await srv('POST', '/me/avatar', { avatar: u.avatarfull }); if (r.ok) { const i = store.get('acctInfo') || {}; store.set('acctInfo', Object.assign({}, i, { avatar: u.avatarfull })); } }
        } catch (e) { }
    }
    setTimeout(syncAvatar, 25000); setInterval(syncAvatar, 6 * 3600000);
    handle('acctKeyEnsure', () => ensureKey());
    handle('acctKeySave', async (p) => {
        const key = String(p.key || '').trim(); if (!/^[A-Fa-f0-9]{32}$/.test(key)) return { ok: false, error: 'That does not look like a Steam Web API key. It is 32 letters and numbers.' };
        let sid = acctSteamId(); if (!sid) { await ensureKey(); sid = acctSteamId(); } if (!sid) return { ok: false, error: 'Sign in first.' };
        const r = await srv('PUT', '/me/key', { key }, 15000); if (!r.ok) return { ok: false, error: r.error === 'offline' ? 'Could not reach SteamLite Online. Check your connection.' : r.error };
        if (!ctx.addProfile) return { ok: true }; const a = await ctx.addProfile(sid, key.toUpperCase()); if (a.ok) setTimeout(syncAvatar, 1500); return a.ok ? { ok: true } : { ok: false, error: a.error };
    });

    // ---------- the sign-in requirement ----------
    // A saved sign-in keeps working when the server cannot be reached, so being offline never locks anyone out. Only someone who has
    // never signed in on this PC has to reach the server once. SL_NO_GATE=1 skips it (automatic tests only).
    handle('acctGate', async () => {
        if (process.env.SL_NO_GATE === '1') return { required: false };
        if (acctTok()) {
            const r = await srv('GET', '/me');
            if (r.ok) { store.set('acctInfo', { name: r.name, steamid: r.steamid, avatar: r.avatar || '', verified: !!r.verified, owner: !!r.owner, created: r.created || 0, code: r.code || '' }); const k = await ensureKey(); return { required: false, reload: k.state === 'fetched', needKey: k.state === 'need', offline: !!k.offline }; }
            if (r.code === 401) { acctTokSet(''); store.delete('acctInfo'); return { required: true, expired: true, reachable: true }; }
            return { required: false, offline: true, needKey: !store.get('apiKey') };
        }
        const h = await srv('GET', '/health');
        return { required: true, reachable: !!h.ok };
    });
    handle('acctRestart', () => { try { app.relaunch(); } catch (e) { } if (ctx.quitApp) ctx.quitApp(); else app.quit(); return true; });

    // true for an account the admin made an owner: SteamLite then unlocks everything for it, kept on the account so it follows you to any PC
    // keep the cached account info (name, picture, verified or owner) fresh, so a change the admin makes reaches the app within minutes
    async function refreshInfo() { try { if (!acctTok()) return; const r = await srv('GET', '/me'); if (r.ok) store.set('acctInfo', { name: r.name, steamid: r.steamid, avatar: r.avatar || '', verified: !!r.verified, owner: !!r.owner, created: r.created || 0, code: r.code || '' }); else if (r.code === 401) { acctTokSet(''); store.delete('acctInfo'); } } catch (e) { } }
    setTimeout(refreshInfo, 2500); setInterval(refreshInfo, 600000);
    const isOwner = () => { const i = store.get('acctInfo'); return !!(i && i.owner); };
    return { srv, onlineBase, onlineId, resetBase, acctTok, cloudBackup, ensureKey, isOwner, syncStreak: () => setTimeout(syncStreak, 1500) };
};
