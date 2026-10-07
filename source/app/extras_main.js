'use strict';
// SteamLite 9.1.0 - main-process side of the "extras" features (shop, trophy room, events calendar, restore points,
// pre-launch checks, idle detection, playtime milestones, Discord webhook, friend leaderboard, offline data, polls).
// Like features_main.js everything is reached through the generic "feat:" IPC bridge.

module.exports = function initExtras(ctx) {
    const { app, ipcMain, store, fs, path, fetchApi } = ctx;
    const hooks = {};
    const send = (ch, data) => { const w = ctx.getMainWindow(); if (w && !w.isDestroyed()) w.webContents.send('feat:' + ch, data); };
    const handle = (name, fn) => ipcMain.handle('feat:' + name, async (e, payload) => {
        try { return await fn(payload || {}, e); } catch (err) { console.error('[extras ' + name + ']', err.message); return { ok: false, error: err.message }; }
    });
    const day = (ts) => ctx.streakDayKey(ts);
    const num = (v, d) => (Number.isFinite(Number(v)) ? Number(v) : d);

    // ---------- small settings the main process itself needs ----------
    const XS_DEFAULT = { ignoreIdle: false, idleMinutes: 10, preflight: true, milestones: true };
    const xsGet = () => Object.assign({}, XS_DEFAULT, store.get('extraSettings') || {});
    handle('xsGet', () => xsGet());
    handle('xsSet', (p) => {
        const cur = xsGet();
        ['ignoreIdle', 'preflight', 'milestones'].forEach(k => { if (typeof p[k] === 'boolean') cur[k] = p[k]; });
        if (p.idleMinutes != null) cur.idleMinutes = Math.min(60, Math.max(3, Math.round(num(p.idleMinutes, 10))));
        store.set('extraSettings', cur); return cur;
    });

    // ---------- the shop: coins from drops buy avatar frames and profile titles ----------
    const SHOP_FRAMES = [['neon', 'Neon', 900], ['emerald', 'Emerald', 900], ['sunset', 'Sunset', 1200], ['mono', 'Mono', 600], ['candy', 'Candy', 1200], ['void', 'Void', 1500]];
    const SHOP_TITLES = [['Night Owl', 400], ['Couch Champion', 600], ['Bargain Hunter', 500], ['Pixel Pilgrim', 700], ['Loot Goblin', 800], ['Gremlin', 400], ['Main Character', 1000]];
    const LIMITED = { // only while the event is on; yours for good once bought
        halloween: { frame: ['pumpkin', 'Pumpkin', 1000], title: ['Trick or Treater', 700] },
        christmas: { frame: ['holly', 'Holly', 1000], title: ['Winter Wanderer', 700] },
        spring: { frame: ['blossom', 'Blossom', 1000], title: ['Petal Walker', 700] },
        summer: { frame: ['sunseeker', 'Sunseeker', 1000], title: ['Beach Gamer', 700] },
        steamlite: { frame: ['roots', 'Roots', 1000], title: ['Rooted', 700] }
    };
    const cosm = () => { const c = store.get('cosmetics') || {}; return Object.assign({ titles: [], frames: [] }, c); };
    const coins = () => Number(store.get('coins')) || 0;
    function pickDaily(n) {
        const items = [...SHOP_FRAMES.map(f => ({ id: 'frame:' + f[0], type: 'frame', key: f[0], name: f[1], price: f[2] })), ...SHOP_TITLES.map(t => ({ id: 'title:' + t[0], type: 'title', key: t[0], name: t[0], price: t[1] }))];
        const rng = ctx.mulberry32(ctx.seedFrom('shop' + day(Date.now())));
        for (let i = items.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [items[i], items[j]] = [items[j], items[i]]; }
        return items.slice(0, n);
    }
    function shopItems() {
        const c = cosm(), items = pickDaily(4);
        Object.keys(LIMITED).forEach(evId => {
            const st = ctx.eventState(evId); if (!st.active) return;
            const L = LIMITED[evId];
            items.push({ id: 'frame:' + L.frame[0], type: 'frame', key: L.frame[0], name: L.frame[1], price: L.frame[2], limited: st.name, endsAt: st.end });
            items.push({ id: 'title:' + L.title[0], type: 'title', key: L.title[0], name: L.title[0], price: L.title[1], limited: st.name, endsAt: st.end });
        });
        items.forEach(i => { i.owned = i.type === 'frame' ? c.frames.includes(i.key) : c.titles.includes(i.key); });
        return items;
    }
    const nextMidnight = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime(); };
    handle('shopGet', () => ({ coins: coins(), items: shopItems(), refreshesAt: nextMidnight() }));
    handle('shopBuy', (p) => {
        const item = shopItems().find(i => i.id === String(p.id));
        if (!item) return { ok: false, error: 'That item is not in the shop right now.' };
        if (item.owned) return { ok: false, error: 'You already own this.' };
        if (coins() < item.price) return { ok: false, error: 'Not enough coins.' };
        store.set('coins', coins() - item.price);
        const c = cosm();
        if (item.type === 'frame') c.frames = [...new Set([...c.frames, item.key])]; else c.titles = [...new Set([...c.titles, item.key])];
        store.set('cosmetics', Object.assign(store.get('cosmetics') || {}, { titles: c.titles, frames: c.frames }));
        return { ok: true, coins: coins(), item };
    });

    // ---------- the trophy room: every frame, title and theme, owned or not, with how to get it ----------
    handle('trophyGet', () => {
        const c = cosm(), un = store.get('metaAchievements') || {}, lv = ctx.effectiveLevel(un);
        const frames = [
            ...[['glow', 'Glow'], ['ring', 'Ring'], ['pulse', 'Pulse'], ['rainbow', 'Rainbow']].map(f => ({ id: f[0], name: f[1], how: 'Free for everyone', owned: true })),
            ...ctx.LEVEL_FRAMES.map(f => ({ id: f[1], name: f[2], how: 'Reach SteamLite level ' + f[0], owned: lv >= f[0] })),
            ...[['frost', 'Frost'], ['bloom', 'Bloom'], ['blaze', 'Blaze'], ['harvest', 'Harvest']].map(f => ({ id: f[0], name: f[1], how: 'Season reward (track tier 8)', owned: c.frames.includes(f[0]) })),
            { id: 'steamlite', name: 'SteamLite', how: 'SteamLite Day: complete 5 quests', owned: c.frames.includes('steamlite'), limited: true },
            ...SHOP_FRAMES.map(f => ({ id: f[0], name: f[1], how: 'Shop: ' + f[2] + ' coins (rotates daily)', owned: c.frames.includes(f[0]) })),
            ...Object.keys(LIMITED).map(e => ({ id: LIMITED[e].frame[0], name: LIMITED[e].frame[1], how: 'Shop during ' + ctx.EVENTS[e].name + ': ' + LIMITED[e].frame[2] + ' coins', owned: c.frames.includes(LIMITED[e].frame[0]), limited: true }))
        ];
        const titles = [
            ...ctx.LEVEL_TITLES.map(t => ({ name: t[2], how: 'Reach SteamLite level ' + t[0], owned: lv >= t[0] })),
            { name: 'SteamLite', how: 'SteamLite Day: complete 5 quests', owned: c.titles.includes('SteamLite'), limited: true },
            ...SHOP_TITLES.map(t => ({ name: t[0], how: 'Shop: ' + t[1] + ' coins (rotates daily)', owned: c.titles.includes(t[0]) })),
            ...Object.keys(LIMITED).map(e => ({ name: LIMITED[e].title[0], how: 'Shop during ' + ctx.EVENTS[e].name + ': ' + LIMITED[e].title[1] + ' coins', owned: c.titles.includes(LIMITED[e].title[0]), limited: true }))
        ];
        const granted = store.get('themeUnlocks') || {};
        const themes = ctx.readBundledThemes().filter(t => t.requires).map(t => {
            const req = String(t.requires), def = ctx.ACHIEVEMENT_DEFS.find(d => d.id === req);
            const how = req.startsWith('event:') ? 'Event reward: ' + ((ctx.EVENTS[req.slice(6)] || {}).name || 'an event') : req.startsWith('season:') ? 'Season reward: finish the ' + req.slice(7) + ' track' : def ? 'Achievement: ' + def.name : 'Locked';
            return { id: t.id, name: t.name, colors: t.colors || [], how, owned: !!granted[t.id] || !!un[req] };
        });
        const all = [...frames, ...titles, ...themes];
        return { frames, titles, themes, owned: all.filter(x => x.owned).length, total: all.length };
    });

    // ---------- the events calendar ----------
    function nextWindow(id, nowMs) {
        const ev = ctx.EVENTS[id], st = ctx.eventState(id, nowMs);
        if (st.active) return { start: st.start, end: st.end };
        const y = new Date(nowMs).getFullYear();
        let start = new Date(y, ev.start[0] - 1, ev.start[1]);
        if (nowMs >= start.getTime()) start = new Date(y + 1, ev.start[0] - 1, ev.start[1]);
        const end = new Date(start.getFullYear(), ev.end[0] - 1, ev.end[1] + 1);
        return { start: start.getTime(), end: end.getTime() };
    }
    handle('eventsCalendar', () => {
        const now = Date.now(), un = store.get('metaAchievements') || {};
        const list = Object.keys(ctx.EVENTS).map(id => {
            const ev = ctx.EVENTS[id], st = ctx.eventState(id, now), w = nextWindow(id, now);
            const ids = ctx.ACHIEVEMENT_DEFS.filter(d => d.event === id).map(d => d.id);
            const qs = ctx.eventQuestState(id);
            return { id, name: ev.name, icon: ev.icon, blurb: ev.blurb, active: st.active, start: w.start, end: w.end, daysUntil: st.active ? 0 : Math.ceil((w.start - now) / 86400000), daysLeft: st.daysLeft,
                themeName: ev.themeName, quest: !!ev.quest, achievements: ids.length, earned: ids.filter(i => un[i]).length, quests: qs ? qs.doneCount + '/' + qs.need : null,
                rewards: ev.quest ? ['Profile title: ' + ctx.QUEST_EVENTS[id].rewards.title, 'Avatar frame: ' + ctx.QUEST_EVENTS[id].rewards.title, 'Theme: ' + ev.themeName] : [ev.themeName + ' theme', ids.length + ' achievements', 'A streak restore'], limitedShop: !!LIMITED[id] };
        });
        return list.sort((a, b) => (b.active ? 1 : 0) - (a.active ? 1 : 0) || a.start - b.start);
    });

    // ---------- restore points: a copy of your settings and progress, kept in the app data folder ----------
    const rpDir = () => path.join(app.getPath('userData'), 'restore-points');
    function makeRestorePoint(reason) {
        const data = {}; for (const k of ctx.BACKUP_KEYS) data[k] = store.get(k);
        fs.mkdirSync(rpDir(), { recursive: true });
        const name = 'rp-' + Date.now() + '-' + String(reason).replace(/[^\w-]/g, '').slice(0, 20) + '.json';
        fs.writeFileSync(path.join(rpDir(), name), JSON.stringify({ app: 'SteamLite', version: ctx.APP_VERSION, reason, exportedAt: Date.now(), data }));
        const files = fs.readdirSync(rpDir()).filter(f => /^rp-\d+-/.test(f)).sort();
        while (files.length > 8) { try { fs.unlinkSync(path.join(rpDir(), files.shift())); } catch (e) { } }
        return name;
    }
    hooks.restorePoint = makeRestorePoint;
    handle('rpList', () => {
        try { return fs.readdirSync(rpDir()).filter(f => /^rp-\d+-/.test(f)).sort().reverse().map(f => { let m = {}; try { m = JSON.parse(fs.readFileSync(path.join(rpDir(), f), 'utf8')); } catch (e) { } return { file: f, at: m.exportedAt || Number(f.split('-')[1]), version: m.version || '', reason: m.reason || '' }; }); } catch (e) { return []; }
    });
    handle('rpMake', () => ({ ok: true, file: makeRestorePoint('manual') }));
    handle('rpRestore', (p) => {
        const f = String(p.file || ''); if (!/^rp-\d+-[\w-]*\.json$/.test(f)) return { ok: false, error: 'Bad file.' };
        makeRestorePoint('before-restore');
        const m = JSON.parse(fs.readFileSync(path.join(rpDir(), f), 'utf8'));
        if (!m || m.app !== 'SteamLite' || !m.data) return { ok: false, error: 'Not a restore point.' };
        let n = 0; for (const k of ctx.BACKUP_KEYS) if (m.data[k] !== undefined && m.data[k] !== null) { store.set(k, m.data[k]); n++; }
        return { ok: true, restored: n };
    });
    handle('rpDelete', (p) => { const f = String(p.file || ''); if (!/^rp-\d+-[\w-]*\.json$/.test(f)) return false; try { fs.unlinkSync(path.join(rpDir(), f)); } catch (e) { } return true; });
    // once a day at the first start, and before the app opens the Updater
    setTimeout(() => { try { const last = store.get('lastRestorePoint') || 0; if (Date.now() - last > 86400000) { makeRestorePoint('daily'); store.set('lastRestorePoint', Date.now()); } } catch (e) { } }, 20000);

    // ---------- pre-launch checks ----------
    async function preflightFor(idIn) {
        const warn = [];
        if (!xsGet().preflight) return { ok: true, warn };
        const id = String(idIn || ''); if (!/^\d+$/.test(id)) return { ok: true, warn };
        const games = await ctx.getLocalGames(); const g = games.find(x => String(x.id) === id);
        if (!g) return { ok: true, warn };
        const flags = Number(g.stateFlags != null ? g.stateFlags : g.StateFlags);
        if (Number.isFinite(flags) && flags !== 4 && (flags & 2 || flags & 1024 || flags & 256 || flags & 512)) warn.push('Steam has an update waiting or downloading for ' + g.name + '. It may not start until the update finishes.');
        try {
            const st = fs.statfsSync(g.commonPath || path.join(ctx.getSteamBasePath(), 'steamapps', 'common'));
            const freeGb = (st.bavail * st.bsize) / 1073741824;
            if (freeGb < 5) warn.push('Only ' + freeGb.toFixed(1) + ' GB is free on the drive this game is on. Some games need space for saves and shaders.');
        } catch (e) { }
        return { ok: true, warn, name: g.name };
    }
    handle('preflight', (p) => preflightFor(p.gameId));
    // the app tells you right when a launch starts (the game still starts: this is only a heads-up)
    hooks.preflightNotice = (gameId) => { preflightFor(gameId).then(r => { if (r.warn && r.warn.length) send('preflightWarn', { name: r.name, warn: r.warn }); }).catch(() => { }); };
    handle('openPath', (p) => { const f = String(p.path || ''); if (!path.isAbsolute(f) || !fs.existsSync(f)) return { ok: false, error: 'That folder or file was not found.' }; require('electron').shell.openPath(f); return { ok: true }; });

    // ---------- idle detection: time spent away from the PC is not counted as playing ----------
    const { powerMonitor } = require('electron');
    hooks.noteIdle = (tracking, pollMs) => {
        const x = xsGet(); if (!x.ignoreIdle) return;
        try { if (powerMonitor.getSystemIdleTime() >= x.idleMinutes * 60) tracking.idleSec = (tracking.idleSec || 0) + pollMs / 1000; } catch (e) { }
    };
    hooks.adjustSeconds = (tracking, sec) => Math.max(0, sec - Math.floor(tracking.idleSec || 0));

    // ---------- playtime milestones ----------
    const MS = [10, 50, 100, 250, 500, 1000];
    hooks.onPlaytime = (gameId, name, beforeSec, afterSec) => {
        if (!xsGet().milestones) return;
        const done = store.get('milestones') || {}, got = done[gameId] || [];
        for (const h of MS) if (beforeSec < h * 3600 && afterSec >= h * 3600 && !got.includes(h)) { got.push(h); send('milestone', { gameId, name, hours: h }); }
        done[gameId] = got; store.set('milestones', done);
    };

    // ---------- Discord webhook: post unlocked achievements to a server ----------
    const HOOK_RX = /^https:\/\/(?:canary\.|ptb\.)?(?:discord|discordapp)\.com\/api\/webhooks\/\d+\/[\w-]+$/;
    const whGet = () => Object.assign({ url: '', on: false, rareOnly: true }, store.get('achWebhook') || {});
    handle('webhookGet', () => { const w = whGet(); return { on: w.on, rareOnly: w.rareOnly, hasUrl: !!w.url }; });
    handle('webhookSet', (p) => {
        const w = whGet();
        if (p.url != null) { const u = String(p.url).trim(); if (u && !HOOK_RX.test(u)) return { ok: false, error: 'That does not look like a Discord webhook address.' }; w.url = u; }
        if (typeof p.on === 'boolean') w.on = p.on; if (typeof p.rareOnly === 'boolean') w.rareOnly = p.rareOnly;
        store.set('achWebhook', w); return { ok: true, on: w.on, rareOnly: w.rareOnly, hasUrl: !!w.url };
    });
    function postHook(body) {
        const w = whGet(); if (!w.url || !HOOK_RX.test(w.url)) return Promise.resolve(false);
        return new Promise((resolve) => {
            try {
                const https = require('https'), u = new URL(w.url), data = JSON.stringify(body);
                const req = https.request({ method: 'POST', hostname: u.hostname, path: u.pathname, headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }, timeout: 8000 }, (res) => { res.resume(); resolve(res.statusCode >= 200 && res.statusCode < 300); });
                req.on('error', () => resolve(false)); req.on('timeout', () => req.destroy()); req.write(data); req.end();
            } catch (e) { resolve(false); }
        });
    }
    handle('webhookTest', async () => ({ ok: await postHook({ username: 'SteamLite', embeds: [{ title: 'SteamLite is connected', description: 'Your unlocked achievements will be posted here.', color: 0x8b5cf6 }] }) }));
    hooks.onAchievement = (def, xp) => {
        const w = whGet(); if (!w.on || !w.url) return;
        const rare = !!(def.rewardTheme || def.rewardRestores || def.capstone);
        if (w.rareOnly && !rare) return;
        postHook({ username: 'SteamLite', embeds: [{ title: 'Achievement unlocked: ' + def.name, description: def.desc + (xp ? '\n+' + Number(xp).toLocaleString('en-US') + ' XP' : ''), color: 0x8b5cf6, footer: { text: 'SteamLite ' + ctx.APP_VERSION } }] });
    };

    // ---------- friend leaderboard: hours played in the last 2 weeks ----------
    handle('friendWeek', async (p) => {
        const key = store.get('apiKey'); if (!key) return { ok: false, error: 'Add your Steam Web API key in Settings first.' };
        const ids = (Array.isArray(p.ids) ? p.ids : []).map(String).filter(x => /^\d{17}$/.test(x)).slice(0, 40);
        const out = {};
        for (let i = 0; i < ids.length; i += 5) {
            await Promise.all(ids.slice(i, i + 5).map(async (id) => {
                try {
                    const d = await fetchApi('https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=' + key + '&steamid=' + id, {}, 8000);
                    const games = (d.response && d.response.games) || [];
                    out[id] = { minutes: games.reduce((s, g) => s + (g.playtime_2weeks || 0), 0), top: games.sort((a, b) => (b.playtime_2weeks || 0) - (a.playtime_2weeks || 0))[0] ? games[0].name : '' };
                } catch (e) { out[id] = null; }
            }));
        }
        return { ok: true, players: out };
    });

    // ---------- profile banner from one of your game screenshots (copied into the app data folder so it stays) ----------
    handle('bannerFromShot', (p) => {
        const m = /^steamlite:\/\/shot\/(\d+)\/(\d+)\/([^/?#]+)$/.exec(String(p.url || '')); if (!m) return { ok: false, error: 'Not a screenshot.' };
        const file = decodeURIComponent(m[3]); if (/[\/]/.test(file) || !/\.(jpg|jpeg|png)$/i.test(file)) return { ok: false, error: 'Bad file.' };
        const src = path.join(ctx.getSteamBasePath(), 'userdata', m[1], '760', 'remote', m[2], 'screenshots', file);
        if (!fs.existsSync(src)) return { ok: false, error: 'The screenshot is gone.' };
        const dir = path.join(app.getPath('userData'), 'banners'); fs.mkdirSync(dir, { recursive: true });
        const dest = path.join(dir, 'shot-' + m[2] + '-' + Date.now() + path.extname(file).toLowerCase());
        fs.copyFileSync(src, dest);
        return { ok: true, path: dest };
    });

    // ---------- the "what should we add next?" poll list ----------
    handle('polls', async () => {
        try { return { ok: true, data: await fetchApi('https://raw.githubusercontent.com/imnotfisy/SteamLite/main/polls.json?t=' + Date.now(), {}, 6000) }; }
        catch (e) { return { ok: false, error: 'Could not load the list right now.' }; }
    });

    // ---------- SteamLite Online (the server address, requests and accounts live in account_main.js) ----------
    const { srv, onlineBase, onlineId } = ctx.account;
    let statusMem = { at: 0, data: null };
    async function srvStatus(force) {
        if (!force && Date.now() - statusMem.at < 300000) return statusMem.data;
        const r = await srv('GET', '/status'); statusMem = { at: Date.now(), data: r.ok ? r : null }; return statusMem.data;
    }
    const uidQ = () => '?uid=' + onlineId();
    handle('srvInfo', async () => { const base = await onlineBase(); if (!base) return { configured: false }; const r = await srv('GET', '/health'); return { configured: true, online: !!r.ok }; });
    handle('srvStatus', async (p) => { const d = await srvStatus(!!p.force); if (!d) return { ok: false }; const claimed = store.get('giftsClaimed') || {}; return { ok: true, motd: d.motd, announcements: d.announcements || [], gifts: (d.gifts || []).filter(g => !claimed[g.id]) }; });
    handle('srvOverride', (p) => { // advanced: point the app at another server address (for testing on this PC, for example)
        const u = String(p.url || '').trim().replace(/\/+$/, '');
        if (u && !URL_OK.test(u)) return { ok: false, error: 'Use an https:// address (or http://localhost:8787 to test on this PC).' };
        store.set('onlineServerOverride', u); ctx.account.resetBase(); statusMem = { at: 0, data: null }; return { ok: true, url: u };
    });
    handle('srvOverrideGet', () => store.get('onlineServerOverride') || '');
    handle('srvPolls', () => srv('GET', '/polls' + uidQ()));
    handle('srvVote', (p) => srv('POST', '/vote', { uid: onlineId(), pollId: String(p.pollId || ''), optionId: String(p.optionId || '') }));
    handle('srvLb', (p) => srv('GET', '/lb' + uidQ() + '&metric=' + encodeURIComponent(String(p.metric || 'level')) + '&limit=50'));
    handle('srvLbSubmit', (p) => { store.set('lbName', String(p.name || '').slice(0, 24)); return srv('POST', '/lb/submit', { uid: onlineId(), name: p.name, level: p.level, hours: p.hours, streak: p.streak, achievements: p.achievements, games: p.games }); });
    handle('srvLbRemove', () => srv('POST', '/lb/remove', { uid: onlineId() }));
    handle('srvLbName', () => store.get('lbName') || '');
    handle('srvThemes', (p) => srv('GET', '/themes' + uidQ() + '&sort=' + (p.sort === 'new' ? 'new' : 'liked')));
    handle('srvTheme', (p) => srv('GET', '/themes/' + String(p.id || '').replace(/[^a-f0-9]/g, '') + uidQ()));
    handle('srvThemeLike', (p) => srv('POST', '/themes/' + String(p.id || '').replace(/[^a-f0-9]/g, '') + '/like', { uid: onlineId() }));
    handle('srvThemeShare', (p) => srv('POST', '/themes', { uid: onlineId(), name: p.name, desc: p.desc, author: p.author, vars: p.vars, css: p.css }));
    // ---------- messages, groups and friend streaks: the window asks for these by name and the server does the checking ----------
    const SOC = { blocks: ['GET', '/social/blocks'], find: ['POST', '/social/find'], friend: ['POST', '/social/friend'], respond: ['POST', '/social/respond'], unfriend: ['POST', '/social/unfriend'], block: ['POST', '/social/block'],
        dm: ['POST', '/social/dm'], send: ['POST', '/social/send'], del: ['POST', '/social/delete'], group: ['POST', '/social/group'], groupAdd: ['POST', '/social/group/add'], groupRemove: ['POST', '/social/group/remove'], groupRename: ['POST', '/social/group/rename'], report: ['POST', '/social/report'] };
    handle('soc', async (p) => {
        const op = String(p.op || '');
        if (op === 'overview') return srv('GET', '/social/overview');
        if (op === 'conv') return srv('GET', '/social/conv?id=' + String(p.id || '').replace(/[^a-z0-9]/g, '').slice(0, 40) + '&after=' + (Math.floor(Number(p.after)) || 0));
        const e = SOC[op]; if (!e) return { ok: false, error: 'Unknown request.' };
        const body = Object.assign({}, p); delete body.op; return srv(e[0], e[1], e[0] === 'GET' ? undefined : body, 10000);
    });

    // special gifts from the server: a one-off amount of XP (never more than 100,000), once per gift, only while it is on
    handle('giftClaim', async (p) => {
        if (ctx.NO_PROGRESS) return { ok: false, error: 'Not available in this build.' };
        const d = await srvStatus(true), id = String(p.id || ''); const g = d && (d.gifts || []).find(x => x.id === id);
        const claimed = store.get('giftsClaimed') || {};
        if (!g || g.until < Date.now()) return { ok: false, error: 'That gift is no longer available.' };
        if (claimed[id]) return { ok: false, error: 'You already opened this gift.' };
        const xp = Math.min(100000, Math.max(1, Math.floor(Number(g.xp) || 0)));
        claimed[id] = Date.now(); store.set('giftsClaimed', claimed);
        store.set('dropXp', (Number(store.get('dropXp')) || 0) + xp);
        return { ok: true, xp, title: g.title };
    });
    hooks.announcements = async () => {
        const d = await srvStatus(false); if (!d) return [];
        const out = (d.announcements || []).map(a => ({ title: String(a.title || '').slice(0, 120), date: a.date ? String(a.date).slice(0, 40) : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), content: String(a.text || a.content || '').slice(0, 600) })).filter(a => a.title);
        if (d.motd) out.unshift({ title: 'From the SteamLite team', date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), content: String(d.motd).slice(0, 300) });
        return out;
    };

    // ---------- offline data: tells the window once when saved data was used ----------
    let offlineTold = false;
    hooks.offlineServed = () => { if (!offlineTold) { offlineTold = true; setTimeout(() => { offlineTold = false; }, 600000); send('offlineData', { at: Date.now() }); } };

    return { hooks };
};
