'use strict';
// SteamLite 8.6.5 - main-process side of the new features. Everything here is reached through the generic
// "feat:" IPC bridge (window.electronAPI.feat(name, payload)), so the preload only needs one entry point.
// Each feature is isolated: a failure inside one handler is caught and reported, it can never take the app down.

module.exports = function initFeatures(ctx) {
    const { app, ipcMain, BrowserWindow, dialog, nativeImage, store, fs, path, os, spawn, exec, fetchApi } = ctx;
    const { screen } = require('electron');

    const send = (ch, data) => { const w = ctx.getMainWindow(); if (w && !w.isDestroyed()) w.webContents.send('feat:' + ch, data); };
    const day = (ts) => ctx.streakDayKey(ts);
    const DAY = 86400000;
    const hooks = {};

    // ---------- error ring buffer (for the diagnostics page) ----------
    const errors = [];
    const pushErr = (m) => { errors.push({ at: Date.now(), m: String(m).slice(0, 300) }); if (errors.length > 40) errors.shift(); };
    const origErr = console.error;
    console.error = (...a) => { try { pushErr(a.map(x => (x && x.message) ? x.message : String(x)).join(' ')); } catch (e) { } origErr.apply(console, a); };
    process.on('unhandledRejection', (r) => pushErr('unhandledRejection: ' + ((r && r.message) || r)));
    process.on('uncaughtExceptionMonitor', (e) => pushErr('uncaught: ' + ((e && e.stack) || e)));

    const handle = (name, fn) => ipcMain.handle('feat:' + name, async (e, payload) => {
        try { return await fn(payload || {}, e); } catch (err) { pushErr(name + ': ' + err.message); return { ok: false, error: err.message }; }
    });
    const okId = (v) => /^[A-Za-z0-9_-]{1,40}$/.test(String(v));
    const numId = (v) => /^\d{1,12}$/.test(String(v));
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    // ---------- generic settings that the main process itself needs ----------
    const FS_DEFAULT = { sessionWidget: false, sessionWidgetCorner: 'tr', lowMemory: false };
    const getFs = () => Object.assign({}, FS_DEFAULT, store.get('featSettings') || {});
    handle('restartApp', () => { try { app.relaunch(); } catch (e) { } if (ctx.quitApp) ctx.quitApp(); else app.quit(); return true; });
    handle('settingsGet', () => Object.assign(getFs(), { lowMemoryActive: !!ctx.lowMemoryActive && ctx.lowMemoryActive() }));
    handle('settingsSet', (p) => {
        const cur = getFs(), next = Object.assign({}, cur);
        if (typeof p.sessionWidget === 'boolean') next.sessionWidget = p.sessionWidget;
        if (['tl', 'tr', 'bl', 'br'].includes(p.sessionWidgetCorner)) next.sessionWidgetCorner = p.sessionWidgetCorner;
        if (typeof p.lowMemory === 'boolean') next.lowMemory = p.lowMemory;
        store.set('featSettings', next);
        if (!next.sessionWidget) hideWidget();
        return next;
    });

    // ---------- notification history ----------
    handle('notifAdd', (p) => {
        const log = store.get('notifHistory') || [];
        log.push({ at: Date.now(), text: String(p.text || '').slice(0, 200), kind: String(p.kind || 'info').slice(0, 20) });
        if (log.length > 50) log.splice(0, log.length - 50);
        store.set('notifHistory', log);
        return true;
    });
    handle('notifGet', () => (store.get('notifHistory') || []).slice().reverse());
    handle('notifClear', () => { store.set('notifHistory', []); return true; });

    // ---------- backups: manual-style file written automatically ----------
    const AB_DEFAULT = { on: false, dir: '', everyDays: 7, keep: 8, last: 0 };
    const abGet = () => Object.assign({}, AB_DEFAULT, store.get('autoBackup') || {});
    function buildBackup() {
        const data = {};
        for (const k of ctx.BACKUP_KEYS) data[k] = store.get(k);
        return { app: 'SteamLite', version: ctx.APP_VERSION, exportedAt: Date.now(), data };
    }
    function runBackup() {
        const cfg = abGet();
        if (!cfg.dir) throw new Error('Choose a backup folder first.');
        fs.mkdirSync(cfg.dir, { recursive: true });
        const d = new Date(), p2 = (n) => String(n).padStart(2, '0');
        const name = 'SteamLite-autobackup-' + d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()) + '-' + p2(d.getHours()) + p2(d.getMinutes()) + '.json';
        fs.writeFileSync(path.join(cfg.dir, name), JSON.stringify(buildBackup(), null, 2));
        const files = fs.readdirSync(cfg.dir).filter(f => /^SteamLite-autobackup-.*\.json$/.test(f)).sort().reverse();
        files.slice(Math.max(1, cfg.keep)).forEach(f => { try { fs.unlinkSync(path.join(cfg.dir, f)); } catch (e) { } });
        store.set('autoBackup', Object.assign({}, cfg, { last: Date.now() }));
        return { ok: true, name, dir: cfg.dir };
    }
    handle('backupGet', () => { const c = abGet(); let count = 0; try { if (c.dir) count = fs.readdirSync(c.dir).filter(f => /^SteamLite-autobackup-.*\.json$/.test(f)).length; } catch (e) { } return Object.assign({}, c, { count }); });
    handle('backupSet', (p) => {
        const c = abGet();
        if (typeof p.on === 'boolean') c.on = p.on;
        if ([1, 3, 7, 14, 30].includes(Number(p.everyDays))) c.everyDays = Number(p.everyDays);
        if ([3, 5, 8, 15, 30].includes(Number(p.keep))) c.keep = Number(p.keep);
        store.set('autoBackup', c);
        return c;
    });
    handle('backupChooseDir', async () => {
        const r = await dialog.showOpenDialog(ctx.getMainWindow(), { title: 'Choose a folder for automatic backups', properties: ['openDirectory', 'createDirectory'] });
        if (r.canceled || !r.filePaths[0]) return { ok: false, canceled: true };
        const c = abGet(); c.dir = r.filePaths[0]; store.set('autoBackup', c);
        return { ok: true, dir: c.dir };
    });
    handle('backupRun', () => runBackup());
    const backupDue = () => { const c = abGet(); if (!c.on || !c.dir) return; if (Date.now() - c.last >= c.everyDays * DAY) { try { const r = runBackup(); send('backupDone', r); } catch (e) { pushErr('auto backup: ' + e.message); } } };
    setTimeout(backupDue, 2 * 60 * 1000);
    setInterval(backupDue, 30 * 60 * 1000);

    // ---------- diagnostics ----------
    handle('diagnostics', () => {
        const lines = [];
        lines.push('SteamLite ' + ctx.APP_VERSION + '  (Electron ' + process.versions.electron + ', Chromium ' + process.versions.chrome + ', Node ' + process.versions.node + ')');
        lines.push('Windows ' + os.release() + ' ' + os.arch() + ' · ' + Math.round(os.totalmem() / 1073741824) + ' GB RAM (' + Math.round(os.freemem() / 1073741824) + ' GB free) · ' + os.cpus().length + ' cores · up ' + Math.round(os.uptime() / 3600) + ' h');
        lines.push('Install: ' + path.dirname(process.execPath));
        const flags = ['potatoMode', 'closeToTray', 'autoUpdateCheck', 'startMinimized', 'launchToLibrary', 'reduceAnimations', 'discordRpcEnabled', 'notifSounds'].map(k => k + '=' + store.get(k));
        lines.push('Settings: ' + flags.join(', ') + ', channel=' + (store.get('updateChannel') || 'stable'));
        lines.push('Steam account set: ' + (store.get('steamId') ? 'yes' : 'no') + ' · API key set: ' + (store.get('apiKey') ? 'yes' : 'no') + ' (values are never included)');
        lines.push('Data: ' + Object.keys(store.get('telemetry') || {}).length + ' games with playtime, ' + (store.get('sessionHistory') || []).length + ' sessions, ' + Object.keys(store.get('metaAchievements') || {}).length + ' achievements, ' + (store.get('nonSteamGames') || []).length + ' non-Steam games, ' + (store.get('customThemes') || []).length + ' custom themes');
        try { const f = path.join(os.tmpdir(), 'SteamLiteUpdater', 'updater.log'); if (fs.existsSync(f)) lines.push('', 'Updater log (last lines):', ...fs.readFileSync(f, 'utf8').trim().split(/\r?\n/).slice(-8)); } catch (e) { }
        lines.push('', 'Recent errors (' + errors.length + '):');
        errors.slice(-15).forEach(e => lines.push('  ' + new Date(e.at).toLocaleTimeString() + '  ' + e.m.replace(/\s+/g, ' ')));
        if (!errors.length) lines.push('  none');
        return lines.join('\n');
    });

    // ---------- saving text files (CSV / JSON exports) ----------
    handle('saveText', async (p) => {
        const ext = ['csv', 'json', 'txt'].includes(p.ext) ? p.ext : 'txt';
        const r = await dialog.showSaveDialog(ctx.getMainWindow(), { title: 'Save file', defaultPath: String(p.defaultName || ('SteamLite-export.' + ext)).replace(/[^\w.\- ]/g, '_'), filters: [{ name: ext.toUpperCase(), extensions: [ext] }] });
        if (r.canceled || !r.filePath) return { ok: false, canceled: true };
        fs.writeFileSync(r.filePath, (ext === 'csv' ? '\uFEFF' : '') + String(p.content || ''), 'utf8');
        return { ok: true, path: r.filePath };
    });

    // ---------- prices (library value) and SteamSpy data (average playtime, genres) ----------
    const browseItems = async (ids) => {
        const input = { ids: ids.map(appid => ({ appid })), context: { language: 'english', country_code: store.get('storeCountry') || 'US' }, data_request: { include_basic_info: true } };
        const d = await fetchApi('https://api.steampowered.com/IStoreBrowseService/GetItems/v1?input_json=' + encodeURIComponent(JSON.stringify(input)), {}, 20000);
        return (d && d.response && d.response.store_items) || [];
    };
    handle('prices', async (p) => {
        const ids = [...new Set((p.appids || []).map(String).filter(numId))].slice(0, 1500);
        const cache = store.get('priceCache') || {};
        const now = Date.now(), out = {};
        const need = [];
        ids.forEach(id => { if (cache[id] && now - cache[id].at < DAY) out[id] = cache[id]; else need.push(Number(id)); });
        for (let i = 0; i < need.length; i += 40) {
            const chunk = need.slice(i, i + 40);
            let items = [];
            try { items = await browseItems(chunk); } catch (e) { pushErr('prices: ' + e.message); }
            const seen = new Set();
            items.forEach(it => {
                const o = it.best_purchase_option || null;
                const rec = { cents: o ? Number(o.final_price_in_cents || 0) : 0, orig: o ? Number(o.original_price_in_cents || o.final_price_in_cents || 0) : 0, free: !!it.is_free, at: now };
                cache[String(it.appid)] = rec; out[String(it.appid)] = rec; seen.add(String(it.appid));
            });
            chunk.forEach(id => { if (!seen.has(String(id))) { const rec = { cents: 0, orig: 0, free: false, at: now }; cache[String(id)] = rec; out[String(id)] = rec; } });
            await sleep(250);
        }
        store.set('priceCache', cache);
        return { ok: true, prices: out };
    });

    let lastSpyAt = 0, spyStop = false;
    async function spyFetch(appid) {
        const cache = store.get('spyCache') || {};
        const hit = cache[appid];
        if (hit && Date.now() - hit.at < 30 * DAY) return hit;
        const wait = lastSpyAt + 1100 - Date.now(); if (wait > 0) await sleep(wait);
        lastSpyAt = Date.now();
        let rec = { avg: 0, med: 0, genre: '', tags: [], owners: '', at: Date.now() };
        try {
            const d = await fetchApi('https://steamspy.com/api.php?request=appdetails&appid=' + appid, { 'User-Agent': 'SteamLite' }, 15000);
            if (d && typeof d === 'object') {
                rec = { avg: Number(d.average_forever) || 0, med: Number(d.median_forever) || 0, genre: String(d.genre || ''), tags: d.tags && typeof d.tags === 'object' ? Object.keys(d.tags).slice(0, 6) : [], owners: String(d.owners || ''), at: Date.now() };
            }
        } catch (e) { pushErr('steamspy: ' + e.message); return rec; }
        const c2 = store.get('spyCache') || {}; c2[appid] = rec; store.set('spyCache', c2);
        return rec;
    }
    handle('spy', async (p) => { if (!numId(p.appid)) return null; return await spyFetch(String(p.appid)); });
    handle('spyCache', () => store.get('spyCache') || {});
    handle('spyBulk', (p) => {
        const ids = [...new Set((p.appids || []).map(String).filter(numId))].slice(0, 800);
        spyStop = false;
        (async () => {
            let done = 0;
            for (const id of ids) { if (spyStop) break; await spyFetch(id); done++; if (done % 3 === 0 || done === ids.length) send('spyProgress', { done, total: ids.length }); }
            send('spyProgress', { done: ids.length, total: ids.length, finished: true });
        })();
        return { ok: true, total: ids.length };
    });
    handle('spyStop', () => { spyStop = true; return true; });

    // ---------- friends' games (co-op finder) ----------
    const fgCache = {};
    handle('friendGames', async (p) => {
        if (!/^\d{15,20}$/.test(String(p.steamId))) return { ok: false, error: 'Bad SteamID.' };
        const hit = fgCache[p.steamId];
        if (hit && Date.now() - hit.at < 10 * 60 * 1000) return { ok: true, games: hit.games };
        const key = store.get('apiKey');
        if (!key) return { ok: false, error: 'No API key set.' };
        const d = await fetchApi('https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=' + key + '&steamid=' + p.steamId + '&include_appinfo=1&include_played_free_games=1', {}, 15000);
        const games = ((d && d.response && d.response.games) || []).map(g => ({ appid: String(g.appid), name: g.name, minutes: g.playtime_forever || 0 }));
        if (!games.length) return { ok: false, error: 'That friend\'s game list is private.' };
        fgCache[p.steamId] = { at: Date.now(), games };
        return { ok: true, games };
    });

    // ---------- free games / big discounts ----------
    let freeMem = { at: 0, items: [] };
    handle('freeGames', async (p) => {
        if (!p.force && Date.now() - freeMem.at < 30 * 60 * 1000 && freeMem.items.length) return { ok: true, items: freeMem.items };
        const d = await fetchApi('https://store.steampowered.com/api/featuredcategories?cc=us&l=english', {}, 15000);
        const pool = [].concat((d.specials && d.specials.items) || [], (d.top_sellers && d.top_sellers.items) || [], (d.new_releases && d.new_releases.items) || []);
        const seen = new Set(), items = [];
        pool.forEach(i => {
            if (!i || seen.has(i.id)) return; seen.add(i.id);
            // a real "free to keep" / free weekend promotion: a normally paid game discounted by 100% (not a free-to-play game)
            if (i.discount_percent === 100 && i.original_price > 0) items.push({ appid: String(i.id), name: i.name, until: i.discount_expiration ? i.discount_expiration * 1000 : 0 });
        });
        const big = (d.specials && d.specials.items || []).filter(i => i && i.discount_percent >= 75 && i.final_price > 0).slice(0, 8).map(i => ({ appid: String(i.id), name: i.name, discount: i.discount_percent, price: (i.final_price / 100).toFixed(2) }));
        freeMem = { at: Date.now(), items: { free: items, big } };
        return { ok: true, items: freeMem.items };
    });

    // ---------- wishlist extras: target prices and price history ----------
    hooks.afterWishlist = (items) => {
        const hist = store.get('wishlistHistory') || {}, now = Date.now();
        items.forEach(it => {
            if (!(it.cents > 0)) return;
            const arr = hist[it.appid] || [], last = arr[arr.length - 1];
            if (!last || last.c !== it.cents) { arr.push({ t: now, c: it.cents }); if (arr.length > 60) arr.shift(); hist[it.appid] = arr; }
        });
        store.set('wishlistHistory', hist);
        const targets = store.get('wishlistTargets') || {}, alerted = store.get('wishlistTargetAlerted') || {};
        const hit = [];
        items.forEach(it => {
            const t = Number(targets[it.appid]);
            if (t > 0 && it.cents > 0 && it.cents <= t && alerted[it.appid] !== it.cents) { hit.push({ name: it.name, price: it.price, appid: it.appid }); alerted[it.appid] = it.cents; }
            if (t > 0 && it.cents > t) delete alerted[it.appid];
        });
        store.set('wishlistTargetAlerted', alerted);
        if (hit.length && store.get('wishlistAlerts') !== false) send('wishlistTarget', hit.slice(0, 5));
    };
    handle('wishlistMeta', () => ({ targets: store.get('wishlistTargets') || {}, history: store.get('wishlistHistory') || {} }));
    handle('wishlistTarget', (p) => {
        if (!numId(p.appid)) return false;
        const t = store.get('wishlistTargets') || {}, c = Math.round(Number(p.cents) || 0);
        if (c > 0) t[p.appid] = c; else delete t[p.appid];
        store.set('wishlistTargets', t);
        const a = store.get('wishlistTargetAlerted') || {}; delete a[p.appid]; store.set('wishlistTargetAlerted', a);
        return t;
    });

    // ---------- shutdown timer ----------
    let plan = null, planTimer = null, countdown = false;
    function startCountdown() {
        countdown = true; plan = null;
        exec('shutdown /s /t 60 /c "SteamLite: shutting down as you planned. Open SteamLite or run shutdown /a to cancel."', { windowsHide: true });
        send('shutdownWarn', { seconds: 60 });
    }
    handle('shutdownSet', (p) => {
        if (planTimer) { clearTimeout(planTimer); planTimer = null; }
        if (p.mode === 'game') plan = { mode: 'game', at: 0 };
        else if (p.mode === 'timer') {
            const m = Math.round(Number(p.minutes));
            if (!(m >= 1 && m <= 720)) throw new Error('Pick between 1 minute and 12 hours.');
            plan = { mode: 'timer', at: Date.now() + m * 60000 };
            planTimer = setTimeout(() => { if (plan && plan.mode === 'timer') startCountdown(); }, m * 60000);
        } else throw new Error('Unknown mode.');
        return { ok: true, plan };
    });
    handle('shutdownCancel', () => {
        if (planTimer) { clearTimeout(planTimer); planTimer = null; }
        plan = null;
        if (countdown) { countdown = false; exec('shutdown /a', { windowsHide: true }); }
        return { ok: true };
    });
    handle('shutdownGet', () => ({ plan, countdown }));

    // ---------- session widget (always-on-top timer for windowed / borderless games) ----------
    let widgetWin = null;
    function hideWidget() { if (widgetWin && !widgetWin.isDestroyed()) widgetWin.close(); widgetWin = null; }
    function showWidget(tracking) {
        const s = getFs();
        if (!s.sessionWidget) return;
        hideWidget();
        const wa = screen.getPrimaryDisplay().workArea, W = 250, H = 104, M = 14;
        const x = s.sessionWidgetCorner.endsWith('l') ? wa.x + M : wa.x + wa.width - W - M;
        const y = s.sessionWidgetCorner.startsWith('t') ? wa.y + M : wa.y + wa.height - H - M;
        widgetWin = new BrowserWindow({ width: W, height: H, x, y, frame: false, transparent: true, resizable: false, alwaysOnTop: true, skipTaskbar: true, focusable: false, show: false, hasShadow: false, webPreferences: { contextIsolation: true, nodeIntegration: false } });
        widgetWin.setAlwaysOnTop(true, 'screen-saver');
        widgetWin.setIgnoreMouseEvents(true);
        widgetWin.loadFile(path.join(__dirname, 'widget.html'), { query: { start: String(tracking.sessionStart || Date.now()), name: String(tracking.name || 'Game').slice(0, 40), brk: String(Number(store.get('breakReminderMin')) || 0) } });
        widgetWin.once('ready-to-show', () => { if (widgetWin && !widgetWin.isDestroyed()) widgetWin.showInactive(); });
        widgetWin.on('closed', () => { widgetWin = null; });
    }

    // ---------- per-game launch profile (priority, apps to close, power plan) ----------
    let prevPlan = null;
    const CLOSE_OK = /^[\w .\-()]{1,60}\.exe$/i;
    hooks.beforeLaunch = (config) => {
        if (!config) return;
        String(config.closeApps || '').split(/[,;\n]/).map(s => s.trim()).filter(Boolean).slice(0, 12).forEach(n => { if (CLOSE_OK.test(n)) exec('taskkill /IM "' + n + '" /F', { windowsHide: true }, () => { }); });
        if (config.powerPlan === 'high') {
            exec('powercfg /getactivescheme', { windowsHide: true }, (e, out) => {
                const m = /GUID:\s*([0-9a-f-]{36})/i.exec(out || '');
                prevPlan = m ? m[1] : null;
                exec('powercfg /setactive SCHEME_MIN', { windowsHide: true }, () => { });
            });
        }
    };
    hooks.onSessionStart = (tracking, config) => {
        showWidget(tracking);
        const pr = config && config.priority;
        if (pr === 'high' || pr === 'abovenormal') {
            const apply = () => {
                const pids = (tracking.pids || []).filter(p => /^\d+$/.test(String(p)));
                if (!pids.length) return;
                exec('powershell -NoProfile -Command "Get-Process -Id ' + pids.join(',') + ' -ErrorAction SilentlyContinue | ForEach-Object { $_.PriorityClass = \'' + (pr === 'high' ? 'High' : 'AboveNormal') + '\' }"', { windowsHide: true }, () => { });
            };
            apply(); setTimeout(apply, 15000);
        }
    };
    hooks.onGameStopped = (tracking) => {
        hideWidget();
        if (prevPlan && /^[0-9a-f-]{36}$/i.test(prevPlan)) { exec('powercfg /setactive ' + prevPlan, { windowsHide: true }, () => { }); prevPlan = null; }
        try { const sb = (store.get('saveBackups') || {})[tracking.gameId]; if (sb && sb.auto && sb.path) doSaveBackup(String(tracking.gameId), 'auto'); } catch (e) { pushErr('auto save backup: ' + e.message); }
        if (plan && plan.mode === 'game') startCountdown();
    };
    handle('launchProfileGet', (p) => { const c = (store.get('gameConfigs') || {})[p.appId] || {}; return { priority: c.priority || '', closeApps: c.closeApps || '', powerPlan: c.powerPlan || '' }; });
    handle('launchProfileSet', (p) => {
        if (!okId(p.appId)) return false;
        const all = store.get('gameConfigs') || {}, c = all[p.appId] || {};
        c.priority = ['', 'abovenormal', 'high'].includes(p.priority) ? p.priority : '';
        c.closeApps = String(p.closeApps || '').slice(0, 300);
        c.powerPlan = p.powerPlan === 'high' ? 'high' : '';
        all[p.appId] = c; store.set('gameConfigs', all);
        return true;
    });

    // ---------- game save backups ----------
    const saveRoot = () => path.join(app.getPath('userData'), 'save_backups');
    function dirSize(p, cap) { let total = 0; const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (total > cap) return; const f = path.join(d, e.name); if (e.isDirectory()) walk(f); else { try { total += fs.statSync(f).size; } catch (x) { } } } }; try { walk(p); } catch (e) { } return total; }
    function doSaveBackup(appId, label) {
        const sb = (store.get('saveBackups') || {})[appId];
        if (!sb || !sb.path || !fs.existsSync(sb.path)) throw new Error('The save folder was not found.');
        if (dirSize(sb.path, 600 * 1048576) > 500 * 1048576) throw new Error('That folder is over 500 MB - pick the game\'s actual save folder.');
        const d = new Date(), p2 = (n) => String(n).padStart(2, '0');
        const name = d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()) + 'T' + p2(d.getHours()) + '-' + p2(d.getMinutes()) + '-' + p2(d.getSeconds()) + (label ? '_' + label : '');
        const dest = path.join(saveRoot(), appId, name);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.cpSync(sb.path, dest, { recursive: true });
        const all = fs.readdirSync(path.join(saveRoot(), appId)).sort().reverse();
        all.slice(8).forEach(n => { try { fs.rmSync(path.join(saveRoot(), appId, n), { recursive: true, force: true }); } catch (e) { } });
        return name;
    }
    handle('saveInfo', (p) => {
        if (!okId(p.appId)) return { path: '', auto: false, backups: [] };
        const sb = (store.get('saveBackups') || {})[p.appId] || {};
        let backups = [];
        try { backups = fs.readdirSync(path.join(saveRoot(), p.appId)).sort().reverse().map(n => ({ name: n })); } catch (e) { }
        return { path: sb.path || '', auto: !!sb.auto, backups };
    });
    handle('saveChoose', async (p) => {
        if (!okId(p.appId)) return { ok: false };
        const r = await dialog.showOpenDialog(ctx.getMainWindow(), { title: 'Choose the folder this game keeps its save files in', properties: ['openDirectory'] });
        if (r.canceled || !r.filePaths[0]) return { ok: false, canceled: true };
        const all = store.get('saveBackups') || {}; all[p.appId] = Object.assign({}, all[p.appId] || {}, { path: r.filePaths[0] }); store.set('saveBackups', all);
        return { ok: true, path: r.filePaths[0] };
    });
    handle('saveAuto', (p) => { if (!okId(p.appId)) return false; const all = store.get('saveBackups') || {}; all[p.appId] = Object.assign({}, all[p.appId] || {}, { auto: !!p.auto }); store.set('saveBackups', all); return true; });
    handle('saveRun', (p) => { if (!okId(p.appId)) throw new Error('Bad game.'); return { ok: true, name: doSaveBackup(p.appId, 'manual') }; });
    handle('saveRestore', (p) => {
        if (!okId(p.appId) || !/^[\w.\-]+$/.test(String(p.name))) throw new Error('Bad backup.');
        const sb = (store.get('saveBackups') || {})[p.appId];
        const src = path.join(saveRoot(), p.appId, p.name);
        if (!sb || !sb.path || !fs.existsSync(src)) throw new Error('That backup was not found.');
        doSaveBackup(p.appId, 'before-restore'); // a safety copy of what is there now
        fs.cpSync(src, sb.path, { recursive: true, force: true });
        return { ok: true };
    });

    // ---------- themes: read an owned theme without counting it as "applied" (for the day / night scheduler) ----------
    handle('themeFile', (p) => {
        const file = String(p.file || '');
        if (!/^[\w.-]+\.json$/i.test(file) || file.includes('..') || file === 'themes.json') return null;
        const idx = JSON.parse(fs.readFileSync(path.join(__dirname, 'themes', 'themes.json'), 'utf8'));
        const entry = (idx.themes || []).find(t => t.file === file);
        if (!entry) return null;
        if (entry.requires) {
            const owned = (store.get('metaAchievements') || {})[entry.requires] || (store.get('themeUnlocks') || {})[entry.id];
            if (!owned) return { locked: true };
        }
        return JSON.parse(fs.readFileSync(path.join(__dirname, 'themes', file), 'utf8'));
    });

    // ---------- Epic Games / GOG installs ----------
    handle('scanLaunchers', () => {
        const known = new Set((store.get('nonSteamGames') || []).map(g => String(g.exePath || '').toLowerCase()));
        const found = [];
        try {
            const dir = path.join(process.env.ProgramData || 'C:\\ProgramData', 'Epic', 'EpicGamesLauncher', 'Data', 'Manifests');
            if (fs.existsSync(dir)) fs.readdirSync(dir).filter(f => f.endsWith('.item')).forEach(f => {
                try {
                    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
                    if (!j.DisplayName || !j.InstallLocation || !j.LaunchExecutable) return;
                    if (j.bIsApplication === false) return;
                    const exe = path.join(j.InstallLocation, j.LaunchExecutable);
                    if (fs.existsSync(exe)) found.push({ name: j.DisplayName, exe, args: '', source: 'Epic' });
                } catch (e) { }
            });
        } catch (e) { pushErr('epic scan: ' + e.message); }
        try {
            const { execSync } = require('child_process');
            const out = execSync('reg query "HKLM\\SOFTWARE\\WOW6432Node\\GOG.com\\Games" /s', { windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'] }).toString();
            out.split(/\r?\n(?=HKEY_)/).forEach(block => {
                const g = (k) => { const m = new RegExp('^\\s*' + k + '\\s+REG_SZ\\s+(.+)$', 'mi').exec(block); return m ? m[1].trim() : ''; };
                const name = g('gameName'), exe = g('exe') || g('launchCommand');
                if (name && exe && fs.existsSync(exe)) found.push({ name, exe, args: '', source: 'GOG' });
            });
        } catch (e) { /* GOG Galaxy is not installed */ }
        return found.filter(f => !known.has(f.exe.toLowerCase()));
    });

    // ---------- library health check ----------
    function steamappsDirs() {
        const base = path.join(ctx.getSteamBasePath(), 'steamapps'), dirs = [base];
        try {
            const v = path.join(base, 'libraryfolders.vdf');
            if (fs.existsSync(v)) [...fs.readFileSync(v, 'utf8').matchAll(/"path"\s+"([^"]+)"/g)].forEach(m => dirs.push(path.join(m[1].replace(/\\\\/g, '\\'), 'steamapps')));
        } catch (e) { }
        return [...new Set(dirs)].filter(d => fs.existsSync(d));
    }
    handle('healthCheck', async () => {
        const games = await ctx.getLocalGames();
        const problems = [];
        games.forEach(g => {
            const dir = path.join(g.commonPath, g.installdir);
            if (!fs.existsSync(dir)) problems.push({ appid: g.id, name: g.name, kind: 'missing', text: 'The game folder is missing - Steam thinks it is installed.' });
            else if (g.stateFlags && g.stateFlags !== 4) problems.push({ appid: g.id, name: g.name, kind: 'incomplete', text: g.stateFlags & 2 ? 'Waiting for an update' : 'Not fully installed or updating (state ' + g.stateFlags + ')' });
            else if (g.sizeOnDisk === 0) problems.push({ appid: g.id, name: g.name, kind: 'empty', text: 'Steam reports 0 bytes on disk.' });
        });
        const installedIds = new Set(games.map(g => String(g.id)));
        const leftovers = [];
        let leftoverBytes = 0;
        steamappsDirs().forEach(sa => {
            const sc = path.join(sa, 'shadercache');
            try {
                fs.readdirSync(sc, { withFileTypes: true }).filter(e => e.isDirectory() && /^\d+$/.test(e.name) && !installedIds.has(e.name)).forEach(e => {
                    const size = dirSize(path.join(sc, e.name), 2e9);
                    if (size > 0) { leftovers.push({ appid: e.name, size, dir: path.join(sc, e.name) }); leftoverBytes += size; }
                });
            } catch (e) { }
        });
        return { ok: true, installed: games.length, problems, leftovers: leftovers.sort((a, b) => b.size - a.size).slice(0, 200), leftoverBytes };
    });
    handle('healthClean', (p) => {
        const wanted = new Set((p.appids || []).map(String).filter(numId));
        let freed = 0, removed = 0;
        steamappsDirs().forEach(sa => {
            const sc = path.join(sa, 'shadercache');
            wanted.forEach(id => {
                const d = path.join(sc, id);
                if (path.dirname(d) !== sc || !fs.existsSync(d)) return; // only ever a numbered folder directly inside shadercache
                freed += dirSize(d, 2e9);
                try { fs.rmSync(d, { recursive: true, force: true }); removed++; } catch (e) { }
            });
        });
        return { ok: true, freed, removed };
    });

    // ---------- seasons, bingo, challenge extras, prestige, cosmetics ----------
    const SEASONS = [
        { q: 0, id: 'frost', name: 'Frost', theme: 'season-frost', frame: 'frost', tray: 'frost' },
        { q: 1, id: 'bloom', name: 'Bloom', theme: 'season-bloom', frame: 'bloom', tray: 'bloom' },
        { q: 2, id: 'blaze', name: 'Blaze', theme: 'season-blaze', frame: 'blaze', tray: 'blaze' },
        { q: 3, id: 'harvest', name: 'Harvest', theme: 'season-harvest', frame: 'harvest', tray: 'harvest' }
    ];
    const SEASON_TIERS = 20, SEASON_TIER_XP = 200;
    const SEASON_REWARDS = { 3: 'title1', 5: 'restore', 8: 'frame', 12: 'title2', 16: 'tray', 20: 'theme' };
    function nowMs() { return process.env.SL_FAKE_NOW ? (Number(process.env.SL_FAKE_NOW) || Date.now()) : Date.now(); }
    function seasonFor(ts) {
        const d = new Date(ts), q = Math.floor(d.getMonth() / 3), y = d.getFullYear(), s = SEASONS[q];
        return Object.assign({}, s, { key: y + '-q' + (q + 1), year: y, start: new Date(y, q * 3, 1).getTime(), end: new Date(y, q * 3 + 3, 1).getTime() });
    }
    const dateFromKey = (k) => { const m = /(\d{4})-(\d{2})-(\d{2})/.exec(k); return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime() : 0; };
    function seasonXp(s) {
        let xp = 0;
        const un = store.get('metaAchievements') || {}, log = store.get('achievementXp') || {};
        ctx.ACHIEVEMENT_DEFS.forEach(d => { const t = un[d.id]; if (t && t >= s.start && t < s.end) xp += log[d.id] || 0; });
        const cx = store.get('challengeXp') || {};
        Object.keys(cx).forEach(k => { const t = dateFromKey(k); if (t >= s.start && t < s.end) xp += Number(cx[k]) || 0; });
        return xp;
    }
    const cosm = () => Object.assign({ titles: [], frames: [], trays: [], equipped: { tray: '' } }, store.get('cosmetics') || {});
    function rewardLabel(s, kind) {
        return { title1: 'Title: ' + s.name + ' Rookie', restore: '1 streak restore', frame: s.name + ' avatar frame', title2: 'Title: ' + s.name + ' Veteran', tray: s.name + ' tray icon', theme: s.name + ' theme' }[kind];
    }
    function seasonSync() {
        const out = [];
        [seasonFor(nowMs() - 7 * DAY), seasonFor(nowMs())].filter((s, i, a) => a.findIndex(x => x.key === s.key) === i).forEach(s => {
            const tier = Math.min(SEASON_TIERS, Math.floor(seasonXp(s) / SEASON_TIER_XP));
            const claimedAll = store.get('seasonClaimed') || {}, claimed = claimedAll[s.key] || [];
            let changed = false;
            Object.keys(SEASON_REWARDS).map(Number).sort((a, b) => a - b).forEach(t => {
                if (tier < t || claimed.includes(t)) return;
                const kind = SEASON_REWARDS[t], c = cosm();
                if (kind === 'title1') c.titles.push(s.name + ' Rookie');
                else if (kind === 'title2') c.titles.push(s.name + ' Veteran');
                else if (kind === 'frame') c.frames.push(s.frame);
                else if (kind === 'tray') c.trays.push(s.tray);
                else if (kind === 'theme') ctx.grantTheme(s.theme);
                else if (kind === 'restore') ctx.addRestores(1);
                c.titles = [...new Set(c.titles)]; c.frames = [...new Set(c.frames)]; c.trays = [...new Set(c.trays)];
                store.set('cosmetics', c);
                claimed.push(t); changed = true; out.push(rewardLabel(s, kind));
            });
            if (changed) { claimedAll[s.key] = claimed; store.set('seasonClaimed', claimedAll); }
        });
        if (out.length) { send('seasonReward', { rewards: out }); }
        return out;
    }
    handle('season', () => {
        seasonSync();
        const s = seasonFor(nowMs()), xp = seasonXp(s), tier = Math.min(SEASON_TIERS, Math.floor(xp / SEASON_TIER_XP));
        const claimed = (store.get('seasonClaimed') || {})[s.key] || [];
        return {
            key: s.key, name: s.name, theme: s.theme, start: s.start, end: s.end, xp, tier, tiers: SEASON_TIERS, tierXp: SEASON_TIER_XP,
            into: tier >= SEASON_TIERS ? SEASON_TIER_XP : xp - tier * SEASON_TIER_XP,
            daysLeft: Math.max(0, Math.ceil((s.end - nowMs()) / DAY)),
            rewards: Object.keys(SEASON_REWARDS).map(Number).sort((a, b) => a - b).map(t => ({ tier: t, label: rewardLabel(s, SEASON_REWARDS[t]), kind: SEASON_REWARDS[t], claimed: claimed.includes(t) }))
        };
    });

    // --- cosmetics (titles / frames / tray icons from seasons and prestige) ---
    const TINTS = { gold: 45, frost: 195, bloom: 320, blaze: 12, harvest: 32 };
    function tinted(deg) {
        const img = nativeImage.createFromPath(path.join(__dirname, 'icon.ico')).resize({ width: 32, height: 32 });
        if (!deg) return img;
        const buf = img.toBitmap(), { width, height } = img.getSize();
        for (let i = 0; i < buf.length; i += 4) {
            const b = buf[i] / 255, g = buf[i + 1] / 255, r = buf[i + 2] / 255, a = buf[i + 3];
            if (!a) continue;
            const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, dl = mx - mn;
            let s = dl === 0 ? 0 : dl / (1 - Math.abs(2 * l - 1));
            s = Math.min(1, Math.max(s, 0.55)); // keep the tint visible even on a pale icon
            const h = deg / 360, q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
            const f = (t) => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
            buf[i + 2] = Math.round(f(h + 1 / 3) * 255); buf[i + 1] = Math.round(f(h) * 255); buf[i] = Math.round(f(h - 1 / 3) * 255);
        }
        return nativeImage.createFromBitmap(buf, { width, height });
    }
    hooks.applyIcons = () => {
        try {
            const eq = cosm().equipped.tray, deg = TINTS[eq] || 0;
            if (!deg || !ctx.getTray()) return;
            const img = tinted(deg);
            ctx.getTray().setImage(img);
            const w = ctx.getMainWindow(); if (w && !w.isDestroyed()) w.setIcon(img);
        } catch (e) { pushErr('icons: ' + e.message); }
    };
    handle('cosmetics', () => {
        const c = cosm(), pr = store.get('prestige') || { count: 0 };
        const trays = [...new Set([...c.trays, ...(pr.count > 0 ? ['gold'] : [])])];
        return { titles: c.titles, frames: c.frames, trays, equipped: c.equipped, prestige: pr.count || 0 };
    });
    handle('equip', (p) => {
        const c = cosm(), pr = store.get('prestige') || { count: 0 };
        const trays = [...c.trays, ...(pr.count > 0 ? ['gold'] : [])];
        const t = String(p.tray || '');
        if (t && !trays.includes(t)) throw new Error('You have not unlocked that icon yet.');
        c.equipped.tray = t; store.set('cosmetics', c);
        if (!t && ctx.getTray()) { try { const img = tinted(0); ctx.getTray().setImage(img); const w = ctx.getMainWindow(); if (w && !w.isDestroyed()) w.setIcon(img); } catch (e) { } } else hooks.applyIcons();
        return { ok: true };
    });

    // --- prestige ---
    handle('prestige', () => {
        const un = store.get('metaAchievements') || {};
        if (!ctx.levelInfo(ctx.totalXp(un)).maxed) throw new Error('Reach level 100 first.');
        const pr = store.get('prestige') || { count: 0, baseXp: 0 };
        pr.baseXp = ctx.rawXp(un); pr.count = (pr.count || 0) + 1;
        store.set('prestige', pr);
        const c = cosm(); c.titles = [...new Set([...c.titles, 'Prestige ' + pr.count])]; store.set('cosmetics', c);
        return { ok: true, count: pr.count };
    });

    // --- weekly bingo ---
    function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
    const seed = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
    function activity(start, end, history) {
        const games = new Set(), days = new Set(), perDay = {}, wk = new Set();
        let sec = 0, longest = 0, sessions = 0, early = false, late = false, short = false;
        history.forEach(h => {
            if (!(h.start >= start && h.start < end)) return;
            const d = new Date(h.start), hr = d.getHours(), k = day(h.start);
            games.add(String(h.gameId)); days.add(k); perDay[k] = (perDay[k] || 0) + 1; sessions++;
            sec += h.seconds || 0; longest = Math.max(longest, h.seconds || 0);
            if (hr < 10) early = true; if (hr >= 22) late = true; if ((h.seconds || 0) > 0 && h.seconds < 1800) short = true;
            if (d.getDay() === 0 || d.getDay() === 6) wk.add(d.getDay());
        });
        // a "new" game: played this week, but not in the 30 days before
        let fresh = false;
        games.forEach(g => { const before = history.some(h => String(h.gameId) === g && h.start < start && h.start >= start - 30 * DAY); if (!before) fresh = true; });
        return { games: games.size, days: days.size, sec, longest, sessions, early, late, short, weekendDays: wk.size, maxPerDay: Math.max(0, ...Object.values(perDay)), fresh };
    }
    const BINGO_POOL = [
        { id: 'g3', text: 'Play 3 different games', max: 3, f: a => a.games },
        { id: 'd3', text: 'Play on 3 different days', max: 3, f: a => a.days },
        { id: 'h5', text: 'Play for 5 hours', max: 300, unit: 'min', f: a => Math.floor(a.sec / 60) },
        { id: 'l90', text: 'One session of 90 minutes', max: 1, f: a => a.longest >= 5400 ? 1 : 0 },
        { id: 'early', text: 'Start a session before 10 AM', max: 1, f: a => a.early ? 1 : 0 },
        { id: 'late', text: 'Start a session after 10 PM', max: 1, f: a => a.late ? 1 : 0 },
        { id: 's5', text: 'Play 5 sessions', max: 5, f: a => a.sessions },
        { id: 'wkend', text: 'Play on Saturday and Sunday', max: 2, f: a => a.weekendDays },
        { id: 'fresh', text: 'Play a game you skipped for 30 days', max: 1, f: a => a.fresh ? 1 : 0 },
        { id: 'two', text: 'Play 2 sessions in one day', max: 2, f: a => a.maxPerDay },
        { id: 'd5', text: 'Play on 5 different days', max: 5, f: a => a.days },
        { id: 'short', text: 'Play a quick session under 30 minutes', max: 1, f: a => a.short ? 1 : 0 },
        { id: 'h10', text: 'Play for 10 hours', max: 600, unit: 'min', f: a => Math.floor(a.sec / 60) },
        { id: 's8', text: 'Play 8 sessions', max: 8, f: a => a.sessions },
        { id: 'g5', text: 'Play 5 different games', max: 5, f: a => a.games }
    ];
    const BINGO_LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    const LINE_XP = 30, FULL_XP = 150;
    function weekWin(ts) { const d = new Date(ts), dow = (d.getDay() + 6) % 7, start = new Date(d.getFullYear(), d.getMonth(), d.getDate() - dow).getTime(); return { key: day(start), start, end: new Date(d.getFullYear(), d.getMonth(), d.getDate() - dow + 7).getTime() }; }
    function bingoState(ts) {
        const w = weekWin(ts), history = store.get('sessionHistory') || [], a = activity(w.start, w.end, history);
        const rng = mulberry(seed('bingo' + w.key)), pool = BINGO_POOL.slice();
        for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
        // the two "same stat" tasks (e.g. 5 vs 10 hours) must not both be on the card
        const picked = [], used = new Set();
        pool.forEach(c => { const fam = c.id.replace(/\d+/g, ''); if (picked.length < 9 && !used.has(fam)) { picked.push(c); used.add(fam); } });
        const cells = picked.map(c => { const cur = Math.min(c.max, c.f(a)); return { id: c.id, text: c.text, unit: c.unit || '', max: c.max, current: cur, done: cur >= c.max }; });
        const lines = BINGO_LINES.map((l, i) => ({ i, cells: l, done: l.every(ix => cells[ix] && cells[ix].done) }));
        return { week: w.key, endsAt: w.end, cells, lines, full: cells.length === 9 && cells.every(c => c.done) };
    }
    function bingoSync() {
        const b = bingoState(nowMs()), done = store.get('challengesDone') || {}, xpLog = store.get('challengeXp') || {};
        const gains = [];
        const award = (key, base, label) => {
            if (done[key]) return;
            const r = ctx.applyBoost(base); done[key] = Date.now(); xpLog[key] = r.xp; gains.push({ text: label, xp: r.xp });
        };
        b.lines.forEach(l => { if (l.done) award('bingo:' + b.week + ':line' + l.i, LINE_XP, 'Bingo line'); });
        if (b.full) award('bingo:' + b.week + ':full', FULL_XP, 'Bingo card complete');
        if (gains.length) { store.set('challengesDone', done); store.set('challengeXp', xpLog); gains.forEach(g => send('bingoXp', g)); }
        return b;
    }
    handle('bingo', () => {
        const b = bingoSync(), done = store.get('challengesDone') || {}, xp = store.get('challengeXp') || {};
        b.lines.forEach(l => { l.xp = xp['bingo:' + b.week + ':line' + l.i] || 0; });
        b.fullXp = xp['bingo:' + b.week + ':full'] || 0; b.lineXp = LINE_XP; b.fullBase = FULL_XP;
        return b;
    });

    // --- extra challenge rewards: clearing all dailies / all weeklies ---
    function challengeExtrasSync() {
        const t = nowMs(), done = store.get('challengesDone') || {}, xpLog = store.get('challengeXp') || {};
        const gains = [];
        const award = (key, base, label) => { if (done[key]) return; const r = ctx.applyBoost(base); done[key] = Date.now(); xpLog[key] = r.xp; gains.push({ text: label, xp: r.xp }); };
        const today = ctx.getChallenges(t);
        if (today.daily.list.every(c => c.done)) award('dailyall:' + today.daily.key, 20, 'All daily challenges done');
        if (today.weekly.list.every(c => c.done)) award('weeklyall:' + today.weekly.key, 60, 'All weekly challenges done');
        // consecutive days with all 3 dailies done (looking back up to 60 days, today counts only once finished)
        let streak = 0;
        for (let i = 0; i < 60; i++) {
            const ch = ctx.getChallenges(t - i * DAY).daily;
            const all = ch.list.every(c => c.done);
            if (all) streak++; else if (i > 0) break; else if (i === 0) continue;
        }
        if (streak >= 7) award('dailystreak:' + day(t - (streak % 7) * DAY) + ':' + Math.floor(streak / 7), 100, '7 days of clearing every daily challenge');
        if (gains.length) { store.set('challengesDone', done); store.set('challengeXp', xpLog); gains.forEach(g => send('bingoXp', g)); }
        return { streak };
    }
    handle('challengeExtras', () => {
        const r = challengeExtrasSync();
        return { streak: r.streak, dailyBonus: 20, weeklyBonus: 60, streakBonus: 100 };
    });

    hooks.afterXp = () => { try { seasonSync(); bingoSync(); challengeExtrasSync(); } catch (e) { pushErr('afterXp: ' + e.message); } };
    setTimeout(() => hooks.afterXp(), 20 * 1000);
    setInterval(() => hooks.afterXp(), 10 * 60 * 1000);

    // ---------- tray: quick account switch ----------
    hooks.trayItems = () => {
        try {
            const p = ctx.getProfiles();
            if (!p || !p.list || p.list.length < 2) return [];
            const items = [{ label: 'Switch account', enabled: false }];
            p.list.forEach(prof => items.push({
                label: (prof.name || prof.steamId), type: 'radio', checked: prof.steamId === p.activeId,
                click: () => {
                    if (prof.steamId === p.activeId) return;
                    const cur = ctx.getProfiles(), tgt = cur.list.find(x => x.steamId === prof.steamId);
                    if (!tgt) return;
                    const prev = cur.activeId; cur.activeId = tgt.steamId;
                    store.set('profiles', cur); store.set('apiKey', tgt.apiKey); store.set('steamId', tgt.steamId);
                    ctx.swapPerUserData(tgt.steamId, prev);
                    const w = ctx.getMainWindow(); if (w && !w.isDestroyed()) { w.reload(); w.show(); }
                }
            }));
            items.push({ type: 'separator' });
            return items;
        } catch (e) { return []; }
    };

    // ---------- game journal ----------
    handle('journalGet', (p) => { const j = store.get('journal') || {}; return p.appId ? (j[p.appId] || []) : j; });
    handle('journalAdd', (p) => {
        if (!okId(p.appId)) return false;
        const text = String(p.text || '').trim().slice(0, 600);
        if (!text) return false;
        const j = store.get('journal') || {}, list = j[p.appId] || [];
        list.push({ at: Date.now(), text });
        if (list.length > 200) list.shift();
        j[p.appId] = list; store.set('journal', j);
        return list;
    });
    handle('journalDel', (p) => {
        if (!okId(p.appId)) return false;
        const j = store.get('journal') || {};
        j[p.appId] = (j[p.appId] || []).filter(e => e.at !== Number(p.at));
        if (!j[p.appId].length) delete j[p.appId];
        store.set('journal', j);
        return j[p.appId] || [];
    });

    // testing only (needs SL_DEBUG): pretend a game session started / stopped so the widget and the stop hooks can be checked
    if (process.env.SL_DEBUG) {
        handle('debugMem', () => { const m = process.memoryUsage(); const mb = (n) => Math.round(n / 1048576); return { rss: mb(m.rss), heapUsed: mb(m.heapUsed), heapTotal: mb(m.heapTotal), external: mb(m.external), arrayBuffers: mb(m.arrayBuffers), modules: Object.keys(require.cache).length }; });
        handle('debugSession', () => { hooks.onSessionStart({ sessionStart: Date.now() - 95 * 1000, name: 'Test Game', pids: [] }, {}); return true; });
        handle('debugStop', () => { hooks.onGameStopped({ gameId: 'debug', name: 'Test Game' }); return true; });
    }

    return { hooks };
};
