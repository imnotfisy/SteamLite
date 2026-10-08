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
        if (r.ok) { store.set('acctInfo', { name: r.name, steamid: r.steamid }); return { signedIn: true, name: r.name, idTail: String(r.steamid).slice(-4), backupAt: r.backupAt || 0, prevAt: r.prevAt || 0, localBackupAt: store.get('cloudBackupAt') || 0 }; }
        if (r.code === 401) { acctTokSet(''); store.delete('acctInfo'); return { signedIn: false, expired: true }; }
        const i = acctInfo(); return { signedIn: true, offline: true, name: i ? i.name : '', idTail: i ? String(i.steamid).slice(-4) : '', backupAt: 0, localBackupAt: store.get('cloudBackupAt') || 0 };
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
    handle('acctDelete', async () => { const r = await srv('DELETE', '/account'); if (r.ok) { acctTokSet(''); store.delete('acctInfo'); store.set('lbOptIn', false); } return r.ok ? { ok: true } : { ok: false, error: r.error === 'offline' ? 'Could not reach the server. Try again in a moment.' : r.error }; });
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


    // ---------- the community theme gallery (both editions): browse, download, publish, delete, report ----------
    const hexId = (v) => String(v || '').replace(/[^a-f0-9]/g, '').slice(0, 16);
    const uidQ = () => '?uid=' + onlineId();
    handle('srvThemes', (p) => srv('GET', '/themes' + uidQ() + '&sort=' + (['new', 'downloads'].includes(p.sort) ? p.sort : 'liked') + (p.q ? '&q=' + encodeURIComponent(String(p.q).slice(0, 30)) : ''), null, 9000));
    handle('srvTheme', (p) => srv('GET', '/themes/' + hexId(p.id) + uidQ() + (p.dl ? '&dl=1' : ''), null, 9000));
    handle('srvThemeLike', (p) => srv('POST', '/themes/' + hexId(p.id) + '/like', { uid: onlineId() }));
    handle('srvThemeShare', (p) => srv('POST', '/themes', { uid: onlineId(), name: p.name, desc: p.desc, author: p.author, vars: p.vars, css: p.css }, 12000));
    handle('srvThemeDelete', (p) => srv('DELETE', '/themes/' + hexId(p.id)));
    handle('srvThemeReport', (p) => srv('POST', '/themes/' + hexId(p.id) + '/report', { reason: String(p.reason || '').slice(0, 300) }));

    // ---------- the sign-in requirement ----------
    // A saved sign-in keeps working when the server cannot be reached, so being offline never locks anyone out. Only someone who has
    // never signed in on this PC has to reach the server once. SL_NO_GATE=1 skips it (automatic tests only).
    handle('acctGate', async () => {
        if (process.env.SL_NO_GATE === '1') return { required: false };
        if (acctTok()) {
            const r = await srv('GET', '/me');
            if (r.ok) { store.set('acctInfo', { name: r.name, steamid: r.steamid }); return { required: false }; }
            if (r.code === 401) { acctTokSet(''); store.delete('acctInfo'); return { required: true, expired: true, reachable: true }; }
            return { required: false, offline: true };
        }
        const h = await srv('GET', '/health');
        return { required: true, reachable: !!h.ok };
    });
    handle('acctRestart', () => { try { app.relaunch(); } catch (e) { } if (ctx.quitApp) ctx.quitApp(); else app.quit(); return true; });

    return { srv, onlineBase, onlineId, resetBase, acctTok, cloudBackup };
};
