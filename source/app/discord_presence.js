// SteamLite 9.0 beta - Discord Rich Presence.
// One small module that owns the connection and decides what the presence says.
//  - Reconnects by itself, with a growing delay (the old code retried every 5 s forever and re-used a dead client).
//  - Starts as soon as Discord is opened later, and clears the card when the setting is turned off.
//  - Playing a game: the game's art, the real session start (so the timer is right), achievement progress, your streak and
//    two buttons (View on Steam / Get SteamLite). Browsing: what you are looking at plus library numbers.
//  - Privacy options: every part can be switched off, and game names can be hidden.
const OPTS_DEFAULT = { game: true, browsing: true, streak: true, buttons: true, hideNames: false, events: true };
const REPO_URL = 'https://github.com/imnotfisy/SteamLite';

module.exports = function createPresence(ctx) {
    const { DiscordRPC, store, clientId, appVersion } = ctx;
    const log = ctx.log || (() => { });
    let client = null, ready = false, connecting = false, timer = null, retry = 0, destroyed = false;
    let lastBrowse = null;    // the last "browsing" text, shown again when a game ends
    let current = null;       // what we want to show: { kind: 'browse'|'game', ... }
    let refreshTimer = null;
    const startedAt = Date.now();

    const enabled = () => !!store.get('discordRpcEnabled');
    const opts = () => Object.assign({}, OPTS_DEFAULT, store.get('discordOpts') || {});
    const setOpts = (p) => {
        const next = Object.assign(opts(), {});
        Object.keys(OPTS_DEFAULT).forEach(k => { if (typeof p[k] === 'boolean') next[k] = p[k]; });
        store.set('discordOpts', next);
        push();
        return next;
    };

    const streakNow = () => { const s = store.get('streak'); return (s && typeof s.current === 'number') ? s.current : 0; };
    const clip = (s, n) => { s = String(s == null ? '' : s); return s.length > n ? s.slice(0, n - 1) + '…' : s; };

    // ---- the card ----
    function build() {
        if (!current) return null;
        const o = opts();
        const streak = o.streak ? streakNow() : 0;
        const streakText = streak >= 2 ? '🔥 ' + streak + '-day streak' : '';
        const buttons = [];
        if (current.kind === 'game') {
            if (!o.game) return null;
            const hide = o.hideNames;
            const a = { details: hide ? 'Playing a game' : clip('Playing ' + current.name, 128), startTimestamp: current.startedAt || startedAt, instance: false };
            const bits = [];
            if (!hide && current.ach && current.ach.total > 0) bits.push(current.ach.achieved + '/' + current.ach.total + ' achievements');
            if (streakText) bits.push(streakText);
            a.state = clip(bits.join('  ·  ') || 'In game', 128);
            if (!hide && current.steam && current.id) a.largeImageKey = 'https://cdn.akamai.steamstatic.com/steam/apps/' + current.id + '/header.jpg';
            else a.largeImageKey = clientId;
            a.largeImageText = hide ? 'SteamLite ' + appVersion : clip(current.name + '  |  SteamLite ' + appVersion, 128);
            if (o.buttons) {
                if (!hide && current.steam && current.id) buttons.push({ label: 'View on Steam', url: 'https://store.steampowered.com/app/' + current.id });
                buttons.push({ label: 'Get SteamLite', url: REPO_URL });
                a.buttons = buttons.slice(0, 2);
            }
            return a;
        }
        // browsing
        if (!o.browsing) return null;
        const a = { details: clip(current.details || 'Browsing the library', 128), startTimestamp: startedAt, largeImageKey: clientId, largeImageText: 'SteamLite ' + appVersion, instance: false };
        const bits = [];
        if (current.state) bits.push(current.state);
        if (streakText) bits.push(streakText);
        if (o.events && typeof ctx.extra === 'function') { let ex = ''; try { ex = ctx.extra(); } catch (e) { } if (ex) bits.push(ex); } // the event that is on, with your progress
        if (bits.length) a.state = clip(bits.join('  ·  '), 128);
        if (o.buttons) a.buttons = [{ label: 'Get SteamLite', url: REPO_URL }];
        return a;
    }

    function push() {
        if (!client || !ready) return;
        if (!enabled()) { client.clearActivity().catch(() => { }); return; }
        const a = build();
        if (!a) { client.clearActivity().catch(() => { }); return; }
        client.setActivity(a).catch(e => log('Discord activity failed: ' + (e && e.message)));
    }

    // ---- connection ----
    function scheduleRetry() {
        if (destroyed || !enabled()) return;
        clearTimeout(timer);
        retry = Math.min(retry + 1, 6);
        timer = setTimeout(connect, [5, 10, 20, 40, 60, 60][retry - 1] * 1000);
    }

    function connect() {
        if (destroyed || connecting || ready || !enabled() || !DiscordRPC) return;
        connecting = true;
        try { if (client) client.destroy().catch(() => { }); } catch (e) { }
        client = new DiscordRPC.Client({ transport: 'ipc' });
        client.on('ready', () => { ready = true; connecting = false; retry = 0; log('Discord presence connected'); push(); });
        client.on('disconnected', () => { ready = false; connecting = false; scheduleRetry(); });
        client.login({ clientId }).catch((e) => { ready = false; connecting = false; log('Discord not available: ' + (e && e.message)); scheduleRetry(); });
    }

    function disconnect() {
        clearTimeout(timer); retry = 0;
        const c = client; client = null; ready = false; connecting = false;
        if (c) { try { c.clearActivity().catch(() => { }).then(() => c.destroy().catch(() => { })); } catch (e) { } }
    }

    // ---- what the app tells us ----
    const api = {
        start() { try { DiscordRPC && DiscordRPC.register(clientId); } catch (e) { } if (enabled()) connect(); },
        // the master switch changed in settings
        enabledChanged() { if (enabled()) { retry = 0; connect(); push(); } else disconnect(); },
        browsing(info) { if (info) lastBrowse = info; if (!current || current.kind !== 'game') { current = { kind: 'browse', details: info && info.details, state: info && info.state }; push(); } },
        game(g) {
            const cache = store.get('achievementCache') || {};
            const ach = cache[g.id] || null;
            current = { kind: 'game', id: String(g.id), name: g.name || 'a game', steam: /^\d+$/.test(String(g.id)), startedAt: g.startedAt || Date.now(), ach: ach && typeof ach.total === 'number' ? { achieved: ach.achieved || 0, total: ach.total } : null };
            push();
            clearInterval(refreshTimer);
            refreshTimer = setInterval(() => { // achievement count and streak can change while you play
                if (!current || current.kind !== 'game') return;
                const c = (store.get('achievementCache') || {})[current.id];
                if (c && typeof c.total === 'number') current.ach = { achieved: c.achieved || 0, total: c.total };
                push();
            }, 2 * 60 * 1000);
        },
        gameStopped() {
            clearInterval(refreshTimer); refreshTimer = null;
            current = lastBrowse ? { kind: 'browse', details: lastBrowse.details, state: lastBrowse.state } : null;
            if (client && ready) { if (current) push(); else client.clearActivity().catch(() => { }); }
        },
        getOpts: () => opts(),
        setOpts,
        status: () => ({ enabled: enabled(), connected: ready, opts: opts() }),
        preview: () => build(),
        destroy() { destroyed = true; clearInterval(refreshTimer); disconnect(); }
    };
    return api;
};
