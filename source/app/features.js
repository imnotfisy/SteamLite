/* SteamLite 8.6.5 - renderer side of the new features, part 1: the framework, the Tools hub and the "everyday" features.
   Loaded after the main page script, so everything in there (installedGames, showToast, playSound ...) is already defined.
   Each feature is installed inside safe(), so a bug in one can never stop the rest of the app from working. */
(function () {
    'use strict';
    const SLF = window.SLF = { cmds: [], tiles: [], installed: [], version: '9.2.1', tourVersion: '9.1.0', langNames: { en: 'English', bg: 'Български' } };
    SLF.langOptions = () => Object.keys(SLF.langNames).map(k => '<option value="' + k + '">' + SLF.langNames[k] + '</option>').join('');
    const $ = (id) => document.getElementById(id);
    const feat = (name, payload) => window.electronAPI.feat(name, payload);
    const onFeat = (name, cb) => window.electronAPI.onFeat(name, cb);
    const safe = SLF.safe = (name, fn) => { try { fn(); SLF.installed.push(name); } catch (e) { console.error('[feature ' + name + ']', e); } };
    SLF.feat = feat; SLF.onFeat = onFeat; SLF.$ = $;
    const E = (s) => esc(String(s == null ? '' : s));
    SLF.E = E;
    SLF.hours = (sec) => (sec / 3600).toFixed(sec >= 36000 ? 0 : 1);
    SLF.ago = (ms) => feedAgo(ms / 1000);

    // ---------- styles used by every feature window ----------
    const css = document.createElement('style');
    css.textContent = `
    .fx-wrap { width: 680px; max-width: 94%; max-height: 84vh; overflow-y: auto; background: var(--bg-glass-light); border: 1px solid var(--border-glass); border-radius: 18px; padding: 24px 26px; backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px); }
    .fx-wrap.wide { width: 860px; }
    .fx-wrap.narrow { width: 520px; }
    .fx-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 4px; }
    .fx-head h3 { margin: 0; font-size: 20px; color: var(--text-primary); }
    .fx-sub { color: var(--text-secondary); font-size: 13px; margin: 2px 0 14px; }
    .fx-x { padding: 4px 10px !important; }
    .fx-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin: 10px 0; }
    .fx-chip { padding: 6px 14px; border-radius: 999px; border: 1px solid var(--border-glass); background: var(--bg-glass); color: var(--text-secondary); font-size: 13px; cursor: pointer; font-weight: 600; transition: all 0.15s; }
    .fx-chip:hover { border-color: var(--accent-color); color: var(--text-primary); }
    .fx-chip.active { background: var(--accent-color); border-color: var(--accent-color); color: #fff; }
    .fx-btn { padding: 8px 16px; border-radius: 10px; border: 1px solid var(--border-glass); background: var(--bg-glass); color: var(--text-primary); font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.15s; }
    .fx-btn:hover { border-color: var(--accent-color); }
    .fx-btn.primary { background: var(--accent-color); border-color: var(--accent-color); color: #fff; }
    .fx-btn.danger { border-color: rgba(248, 113, 113, 0.5); color: #fca5a5; }
    .fx-btn[disabled] { opacity: 0.5; cursor: not-allowed; }
    .fx-input, .fx-select, .fx-text { background: var(--bg-glass); border: 1px solid var(--border-glass); border-radius: 10px; color: var(--text-primary); padding: 8px 12px; font-size: 13px; font-family: inherit; }
    .fx-text { width: 100%; min-height: 64px; resize: vertical; box-sizing: border-box; }
    .fx-card { display: flex; gap: 12px; align-items: center; padding: 10px 12px; border-radius: 12px; background: var(--bg-glass); border: 1px solid var(--border-glass); margin-bottom: 8px; }
    .fx-card img.cover { width: 112px; height: 52px; object-fit: cover; border-radius: 8px; flex: none; background: #000; }
    .fx-card .fx-grow { flex: 1; min-width: 0; }
    .fx-name { font-weight: 700; color: var(--text-primary); font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .fx-meta { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }
    .fx-bar { height: 6px; border-radius: 4px; background: rgba(255, 255, 255, 0.1); overflow: hidden; margin-top: 6px; }
    .fx-bar > i { display: block; height: 100%; border-radius: 4px; background: linear-gradient(90deg, var(--accent-color), var(--accent-color-2, var(--accent-color))); }
    .fx-section { font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-tertiary); margin: 16px 0 8px; }
    .fx-empty { color: var(--text-tertiary); font-size: 13px; padding: 18px 4px; text-align: center; }
    .fx-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 10px; }
    .fx-tile { text-align: left; padding: 12px 14px; border-radius: 12px; background: var(--bg-glass); border: 1px solid var(--border-glass); cursor: pointer; transition: all 0.15s; color: var(--text-primary); }
    .fx-tile:hover { border-color: var(--accent-color); transform: translateY(-1px); }
    .fx-tile b { display: block; font-size: 14px; }
    .fx-tile span { display: block; font-size: 11.5px; color: var(--text-secondary); margin-top: 3px; line-height: 1.35; }
    .fx-tile .ti { font-size: 20px; display: block; margin-bottom: 4px; }
    .fx-kv { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; margin: 10px 0 4px; }
    .fx-kv div { padding: 10px 12px; border-radius: 10px; background: var(--bg-glass); border: 1px solid var(--border-glass); }
    .fx-kv b { display: block; font-size: 19px; color: var(--text-primary); }
    .fx-kv span { font-size: 11.5px; color: var(--text-secondary); }
    .fx-note { font-size: 12px; color: var(--text-tertiary); margin-top: 8px; }
    .fx-setting { display: flex; justify-content: space-between; align-items: center; gap: 14px; padding: 10px 0; border-bottom: 1px solid var(--border-glass); }
    .fx-setting > div:first-child { min-width: 0; }
    .fx-setting b { font-size: 13.5px; color: var(--text-primary); display: block; }
    .fx-setting span.d { font-size: 11.5px; color: var(--text-tertiary); display: block; margin-top: 2px; }
    .fx-pre { white-space: pre-wrap; font-family: Consolas, monospace; font-size: 12px; background: rgba(0, 0, 0, 0.35); border-radius: 10px; padding: 12px; max-height: 46vh; overflow: auto; color: var(--text-secondary); }
    #notif-btn .nb-dot, #hub-btn .nb-dot { position: absolute; top: 3px; right: 3px; min-width: 15px; height: 15px; border-radius: 8px; background: #ef4444; color: #fff; font-size: 10px; font-weight: 800; display: none; align-items: center; justify-content: center; padding: 0 3px; }
    #notif-btn .nb-dot.on { display: flex; }
    .fx-hbar { display: flex; flex-direction: column; gap: 3px; }
    .fx-hbar-row { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-secondary); }
    .fx-hbar-row b { width: 130px; flex: none; color: var(--text-primary); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .fx-hbar-row .fx-bar { flex: 1; margin: 0; }
    .kb-pad-hint { position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,.7); color: #fff; padding: 6px 14px; border-radius: 999px; font-size: 12px; z-index: 99999; display: none; }
    .profile-avatar-modern.frame-frost { animation: profileAvatarIn var(--dur-slow) var(--ease-spring), avatarFrost 4s ease-in-out var(--dur-slow) infinite; }
    .profile-avatar-modern.frame-bloom { animation: profileAvatarIn var(--dur-slow) var(--ease-spring), avatarBloom 4s ease-in-out var(--dur-slow) infinite; }
    .profile-avatar-modern.frame-blaze { animation: profileAvatarIn var(--dur-slow) var(--ease-spring), avatarBlaze 1.8s ease-in-out var(--dur-slow) infinite; }
    .profile-avatar-modern.frame-harvest { animation: profileAvatarIn var(--dur-slow) var(--ease-spring), avatarHarvest 4s ease-in-out var(--dur-slow) infinite; }
    @keyframes avatarFrost { 0%, 100% { box-shadow: 0 0 0 3px #7dd3fc, 0 0 22px rgba(125, 211, 252, 0.6); } 50% { box-shadow: 0 0 0 3px #c4b5fd, 0 0 30px rgba(196, 181, 253, 0.7); } }
    @keyframes avatarBloom { 0%, 100% { box-shadow: 0 0 0 3px #fda4af, 0 0 22px rgba(253, 164, 175, 0.6); } 50% { box-shadow: 0 0 0 3px #fcd34d, 0 0 28px rgba(252, 211, 77, 0.6); } }
    @keyframes avatarBlaze { 0%, 100% { box-shadow: 0 0 0 3px #fb923c, 0 0 20px rgba(251, 146, 60, 0.7); } 50% { box-shadow: 0 0 0 3px #f43f5e, 0 0 34px rgba(244, 63, 94, 0.8); } }
    @keyframes avatarHarvest { 0%, 100% { box-shadow: 0 0 0 3px #d97706, 0 0 22px rgba(217, 119, 6, 0.6); } 50% { box-shadow: 0 0 0 3px #84cc16, 0 0 26px rgba(132, 204, 22, 0.6); } }
    `;
    document.head.appendChild(css);

    // ---------- modal factory ----------
    SLF.modal = function (id, title, opts) {
        opts = opts || {};
        let el = $(id);
        if (!el) {
            el = document.createElement('div'); el.id = id; el.className = 'modal-backdrop';
            el.innerHTML = '<div class="fx-wrap ' + (opts.cls || '') + '"><div class="fx-head"><h3></h3><button class="ctx-item fx-x" data-close>✕</button></div><div class="fx-sub" style="display:none"></div><div class="fx-body"></div></div>';
            document.body.appendChild(el);
            el.addEventListener('click', (e) => { if (e.target === el || e.target.closest('[data-close]')) { if (e.target !== el) playSound('close'); el.classList.remove('active'); if (el._onClose) el._onClose(); } });
        }
        el.querySelector('h3').textContent = title;
        const sub = el.querySelector('.fx-sub'); sub.style.display = opts.sub ? '' : 'none'; sub.textContent = opts.sub || '';
        const api = { el, body: el.querySelector('.fx-body'), open() { playSound('whoosh'); void el.offsetWidth; el.classList.add('active'); return api; }, close() { el.classList.remove('active'); }, isOpen: () => el.classList.contains('active') };
        return api;
    };
    SLF.addCmd = (name, icon, action) => SLF.cmds.push({ name, icon, action });
    SLF.actions = {};
    SLF.beta = !!(window.electronAPI && window.electronAPI.betaBuild);
    const BETA_HIDDEN = /^(Season|Weekly bingo|Inventory)$/;
    SLF.addTile = (group, icon, name, desc, action, cmd) => { if (SLF.beta && BETA_HIDDEN.test(name)) return; SLF.actions[name] = action; SLF.tiles.push({ group, icon, name, desc, action }); if (cmd !== false) SLF.addCmd(name, icon, action); };
    const allGames = () => [...installedGames, ...uninstalledGames];
    SLF.allGames = allGames;
    SLF.gameById = (id) => allGames().find(g => String(g.appid ?? g.id) === String(id));
    SLF.gid = (g) => String(g.appid ?? g.id);
    SLF.cover = (id) => getGameImage(String(id));
    SLF.launch = async (game) => {
        const appId = SLF.gid(game), localData = localGamesCache.find(g => String(g.id) === appId);
        await window.electronAPI.launchGame({ gameId: appId, installdir: localData ? localData.installdir : String(game.name).toLowerCase().replace(/[^a-z0-9]/g, ''), commonPath: localData ? localData.commonPath : '', name: game.name });
    };
    SLF.sessions = async () => { try { return (await window.electronAPI.getSessionHistory()) || []; } catch (e) { return []; } };
    SLF.csvCell = (v) => { v = String(v == null ? '' : v); return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };

    // ---------- notification history (the bell) ----------
    let unread = 0;
    safe('notification-history', () => {
        const bar = document.querySelector('.top-bar-actions');
        const bell = document.createElement('button'); bell.id = 'notif-btn'; bell.className = 'top-bar-icon-btn'; bell.title = 'Notification history'; bell.style.position = 'relative';
        bell.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg><span class="nb-dot" id="nb-dot"></span>';
        const hubAnchor = $('wishlist-btn') || $('inventory-btn');
        bar.insertBefore(bell, hubAnchor);
        const hub = document.createElement('button'); hub.id = 'hub-btn'; hub.className = 'top-bar-icon-btn'; hub.title = 'Tools and extras'; hub.style.position = 'relative';
        hub.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>';
        bar.insertBefore(hub, bell);
        bell.addEventListener('click', () => { playSound('whoosh'); openNotifHistory(); });
        hub.addEventListener('click', () => { playSound('whoosh'); openHub(); });
        const paint = () => { const d = $('nb-dot'); d.textContent = unread > 9 ? '9+' : String(unread); d.classList.toggle('on', unread > 0); };
        SLF.recordNotif = (text, kind) => {
            if (!text) return; const now = Date.now();
            if (SLF._lastNotif && SLF._lastNotif.t === text && now - SLF._lastNotif.at < 1500) return; // the same message twice in a row
            SLF._lastNotif = { t: text, at: now };
            feat('notifAdd', { text, kind: kind || 'info' }); unread++; paint();
        };
        // every toast and every achievement pop-up is also written to the history (even those muted by Quiet Hours / game mode)
        const origToast = window.showToast;
        window.showToast = function (message, onClick, opts) { try { if (!(opts && opts.noHistory)) SLF.recordNotif(String(message), opts && opts.notification ? 'friend' : 'info'); } catch (e) { } return origToast.apply(this, arguments); };
        const origAch = window.queueAchPopup;
        if (typeof origAch === 'function') window.queueAchPopup = function (info) { try { SLF.recordNotif('Achievement unlocked: ' + info.name + (info.xp ? ' (+' + info.xp + ' XP)' : ''), 'achievement'); } catch (e) { } return origAch.apply(this, arguments); };
        async function openNotifHistory() {
            const m = SLF.modal('notif-modal', 'Notification history', { sub: 'The last 50 pop-ups, including ones you missed.' });
            m.body.innerHTML = '<div class="fx-row"><button class="fx-btn" id="nh-clear">Clear history</button></div><div id="nh-list"><div class="fx-empty">Loading...</div></div>';
            m.open(); unread = 0; paint();
            const list = (await feat('notifGet')) || [];
            $('nh-list').innerHTML = list.length ? list.map(n => '<div class="fx-card"><span style="font-size:18px">' + ({ achievement: '🏆', friend: '👥', info: '🔔' }[n.kind] || '🔔') + '</span><div class="fx-grow"><div class="fx-name" style="white-space:normal">' + E(n.text) + '</div></div><span class="fx-meta">' + SLF.ago(n.at) + '</span></div>').join('') : '<div class="fx-empty">Nothing here yet.</div>';
            $('nh-clear').onclick = async () => { await feat('notifClear'); openNotifHistory(); };
        }
        SLF.openNotifHistory = openNotifHistory;
        SLF.addCmd('Notification History', '🔔', openNotifHistory);
    });

    // ---------- game mode: no pop-ups or sounds while a game is running ----------
    safe('game-mode', () => {
        SLF.gameRunning = false;
        window.electronAPI.onGameStatusChange((d) => { if (d && d.status === 'running') SLF.gameRunning = true; else if (d && d.status === 'stopped') SLF.gameRunning = false; });
        const origQuiet = window.isQuietHours;
        window.isQuietHours = function () { return (getUiPref('gameMode', false) && SLF.gameRunning) || origQuiet(); };
    });

    // ---------- command palette 2.0: recent commands first, fuzzy search, Enter / arrow keys ----------
    SLF.paletteCommands = () => {
        const out = SLF.cmds.slice();
        if (SLF.currentGame) {
            const g = SLF.currentGame;
            [['playing', 'Playing'], ['backlog', 'Backlog'], ['completed', 'Completed'], ['dropped', 'Dropped']].forEach(([k, label]) => out.push({ name: 'Set status: ' + label + ' (' + g.name + ')', icon: '🏷️', action: async () => { gameMetaCache = (await window.electronAPI.setGameMeta({ appId: SLF.gid(g), status: k })) || gameMetaCache; showToast(g.name + ' is now marked ' + label + '.'); } }));
            out.push({ name: 'Add to Up Next (' + g.name + ')', icon: '⏭️', action: () => SLF.upNextAdd && SLF.upNextAdd(SLF.gid(g)) });
        }
        return out;
    };
    SLF.paletteUsed = (name) => { const r = getUiPref('paletteRecent', {}); r[name] = (r[name] || 0) + 1; const keys = Object.keys(r); if (keys.length > 60) keys.sort((a, b) => r[a] - r[b]).slice(0, keys.length - 60).forEach(k => delete r[k]); setUiPref({ paletteRecent: r }); };
    SLF.paletteRecents = (cmds) => { const r = getUiPref('paletteRecent', {}); return cmds.map((c, i) => ({ c, i })).sort((a, b) => ((r[b.c.name] || 0) - (r[a.c.name] || 0)) || (a.i - b.i)).map(x => x.c); };
    const fuzzy = (name, term) => {
        const n = name.toLowerCase();
        if (n.includes(term)) return 100 - n.indexOf(term) - (n.length - term.length) * 0.1;
        let i = 0, last = -2, score = 0;
        for (const ch of term) { const at = n.indexOf(ch, i); if (at < 0) return 0; score += (at === last + 1 ? 3 : 1); last = at; i = at + 1; }
        return term.length >= 3 ? score : 0;
    };
    SLF.paletteSearch = (cmds, term) => { const r = getUiPref('paletteRecent', {}); return cmds.map(c => ({ c, s: fuzzy(c.name, term) + Math.min(5, r[c.name] || 0) * 0.5 })).filter(x => x.s > 0).sort((a, b) => b.s - a.s).map(x => x.c); };
    SLF.paletteKeys = (input) => {
        if (input._slKeys) return; input._slKeys = true;
        let idx = -1;
        const items = () => [...document.querySelectorAll('#command-palette-results .cp-item')];
        const mark = () => items().forEach((it, i) => { it.style.background = i === idx ? 'rgba(255,255,255,0.1)' : ''; if (i === idx) it.scrollIntoView({ block: 'nearest' }); });
        input.addEventListener('input', () => { idx = items().length ? 0 : -1; mark(); });
        input.addEventListener('keydown', (e) => {
            const its = items(); if (!its.length) return;
            if (e.key === 'ArrowDown') { e.preventDefault(); idx = Math.min(its.length - 1, idx + 1); mark(); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); idx = Math.max(0, idx - 1); mark(); }
            else if (e.key === 'Enter') { e.preventDefault(); (its[Math.max(0, idx)]).click(); }
        });
        new MutationObserver(() => { idx = -1; }).observe($('command-palette-results'), { childList: true });
    };

    // ---------- the Tools hub ----------
    function openHub() {
        const m = SLF.modal('hub-modal', 'Tools & extras', { cls: 'wide hub', sub: 'Every tool is also in the command palette.' });
        const tiles = SLF.tiles.map((t, i) => Object.assign({ i }, t));
        const groups = [...new Set(tiles.map(t => t.group))];
        let cat = 'All', q = '';
        const recent = (getUiPref('hubRecent', []) || []).filter(n => tiles.some(t => t.name === n)).slice(0, 5);
        m.body.innerHTML = '<div class="hub-top"><input class="fx-input hub-search" id="hub-search" placeholder="Search tools..." autocomplete="off" spellcheck="false"><div class="hub-chips" id="hub-chips"></div></div><div class="hub-grid" id="hub-grid"></div><div class="fx-empty" id="hub-empty" style="display:none">Nothing matches that search.</div>';
        const chipNames = ['All'].concat(recent.length ? ['Recent'] : [], groups);
        const visible = () => tiles.filter(t => (cat === 'All' || (cat === 'Recent' ? recent.includes(t.name) : t.group === cat))
            && (!q || (t.name + ' ' + t.desc + ' ' + t.group).toLowerCase().includes(q)));
        const paintChips = () => { $('hub-chips').innerHTML = chipNames.map(n => '<button class="hub-chip' + (n === cat ? ' active' : '') + '" data-c="' + E(n) + '">' + E(n) + '</button>').join(''); };
        const paintGrid = () => {
            const list = visible();
            if (cat === 'Recent') list.sort((a, b) => recent.indexOf(a.name) - recent.indexOf(b.name));
            $('hub-grid').innerHTML = list.map((t, n) => '<button class="hub-tile" style="--d:' + Math.min(n, 14) * 28 + 'ms" data-t="' + t.i + '"><span class="hub-ico">' + t.icon + '</span><span class="hub-txt"><b>' + E(t.name) + '</b><span>' + E(t.desc) + '</span></span><span class="hub-go">&#8250;</span></button>').join('');
            $('hub-empty').style.display = list.length ? 'none' : '';
            return list;
        };
        const run = (t) => {
            playSound('click'); m.close();
            try { setUiPref({ hubRecent: [t.name].concat((getUiPref('hubRecent', []) || []).filter(n => n !== t.name)).slice(0, 8) }); } catch (e) { }
            setTimeout(() => safeRun(t.name, t.action), 120);
        };
        paintChips(); paintGrid();
        $('hub-chips').onclick = (e) => { const b = e.target.closest('.hub-chip'); if (!b) return; playSound('click'); cat = b.dataset.c; paintChips(); paintGrid(); };
        $('hub-search').oninput = (e) => { q = e.target.value.trim().toLowerCase(); paintGrid(); };
        $('hub-search').onkeydown = (e) => { if (e.key === 'Enter') { const l = visible(); if (l.length) run(l[0]); } };
        m.body.onclick = (e) => { const b = e.target.closest('.hub-tile'); if (!b) return; run(SLF.tiles[Number(b.dataset.t)]); };
        m.open();
        setTimeout(() => { try { $('hub-search').focus(); } catch (e) { } }, 220);
    }
    SLF.openHub = openHub;
    const safeRun = (name, fn) => { try { const r = fn(); if (r && r.catch) r.catch(e => { console.error('[' + name + ']', e); showToast('Something went wrong in "' + name + '".', null, { noHistory: true }); }); } catch (e) { console.error('[' + name + ']', e); showToast('Something went wrong in "' + name + '".', null, { noHistory: true }); } };
    SLF.run = safeRun;
    SLF.addCmd('Tools & extras (hub)', '🧰', openHub);

    // ---------- diagnostics ----------
    safe('diagnostics', () => {
        SLF.addTile('Support', '🩺', 'Diagnostics', 'Your version, settings summary and recent errors - paste it when asking for help. No keys or IDs.', async () => {
            const m = SLF.modal('diag-modal', 'Diagnostics', { sub: 'Copy this when you report a problem. Your API key, SteamID and passwords are never included.' });
            m.body.innerHTML = '<pre class="fx-pre" id="diag-text">Collecting...</pre><div class="fx-row"><button class="fx-btn primary" id="diag-copy">Copy</button><button class="fx-btn" id="diag-save">Save as file</button></div>';
            m.open();
            const text = await feat('diagnostics'); $('diag-text').textContent = text;
            $('diag-copy').onclick = async () => { try { await navigator.clipboard.writeText(text); showToast('Copied.', null, { noHistory: true }); } catch (e) { showToast('Could not copy - select the text and press Ctrl+C.'); } };
            $('diag-save').onclick = async () => { const r = await feat('saveText', { content: text, ext: 'txt', defaultName: 'SteamLite-diagnostics.txt' }); if (r && r.ok) showToast('Saved.'); };
        });
    });

    // ---------- shutdown timer ----------
    safe('shutdown-timer', () => {
        onFeat('shutdownWarn', (d) => { showToast('⏻ Shutting down in ' + d.seconds + ' seconds. Open the shutdown timer to cancel.', async () => { await feat('shutdownCancel'); showToast('Shutdown cancelled.'); }, { sound: 'notify' }); });
        SLF.addTile('Playing', '⏻', 'Shutdown timer', 'Turn the PC off when your game closes, or after a set time. You get a warning and can cancel.', async () => {
            const m = SLF.modal('sd-modal', 'Shutdown timer', { cls: 'narrow', sub: 'The PC will shut down 60 seconds after the trigger, with a warning you can cancel.' });
            const render = async () => {
                const st = await feat('shutdownGet');
                m.body.innerHTML = (st.plan ? '<div class="fx-card"><div class="fx-grow"><div class="fx-name">⏻ Active: ' + (st.plan.mode === 'game' ? 'when your game closes' : 'at ' + new Date(st.plan.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) + '</div></div><button class="fx-btn danger" id="sd-cancel">Cancel</button></div>' : (st.countdown ? '<div class="fx-card"><div class="fx-grow"><div class="fx-name">Shutting down now...</div></div><button class="fx-btn danger" id="sd-cancel">Cancel shutdown</button></div>' : ''))
                    + '<div class="fx-section">When a game closes</div><div class="fx-row"><button class="fx-btn primary" id="sd-game">Shut down after my current / next game closes</button></div>'
                    + '<div class="fx-section">After a set time</div><div class="fx-row"><input type="number" id="sd-min" class="fx-input" min="1" max="720" value="60" style="width:90px"> minutes <button class="fx-btn primary" id="sd-timer">Start timer</button></div>'
                    + '<div class="fx-note">Save your work first. Nothing is shut down without the 60-second warning.</div>';
                if ($('sd-cancel')) $('sd-cancel').onclick = async () => { await feat('shutdownCancel'); showToast('Shutdown cancelled.'); render(); };
                $('sd-game').onclick = async () => { if (!(await showConfirm('Shut down when the game closes?', 'Your PC will turn off 60 seconds after your game closes (you can cancel during the warning).'))) return; const r = await feat('shutdownSet', { mode: 'game' }); showToast(r.ok ? 'Okay - the PC will shut down after your game closes.' : r.error); render(); };
                $('sd-timer').onclick = async () => { const mins = Number($('sd-min').value); if (!(await showConfirm('Start the shutdown timer?', 'Your PC will turn off ' + mins + ' minutes from now (after a 60 second warning).'))) return; const r = await feat('shutdownSet', { mode: 'timer', minutes: mins }); showToast(r.ok ? 'Timer started.' : r.error); render(); };
            };
            m.open(); render();
        });
    });

    // ---------- backups ----------
    safe('backups', () => {
        onFeat('backupDone', (d) => showToast('Automatic backup saved: ' + d.name));
        SLF.addTile('Safety', '💾', 'Automatic backups', 'SteamLite saves a backup of your settings and progress on a schedule, into a folder you choose.', async () => {
            const m = SLF.modal('ab-modal', 'Automatic backups', { cls: 'narrow', sub: 'Backups include your progress, streak restores, themes and settings - never your login. Restore one with Settings > Advanced > Import settings.' });
            const render = async () => {
                const c = await feat('backupGet');
                m.body.innerHTML = '<div class="fx-setting"><div><b>Back up automatically</b><span class="d">' + (c.last ? 'Last backup: ' + new Date(c.last).toLocaleString() : 'No backup yet') + '</span></div><label class="switch-toggle"><input type="checkbox" id="ab-on"' + (c.on ? ' checked' : '') + '><span class="switch-slider"></span></label></div>'
                    + '<div class="fx-setting"><div><b>Folder</b><span class="d">' + E(c.dir || 'Not chosen yet') + '</span></div><button class="fx-btn" id="ab-dir">Choose...</button></div>'
                    + '<div class="fx-setting"><div><b>How often</b></div><select class="fx-select" id="ab-every">' + [1, 3, 7, 14, 30].map(n => '<option value="' + n + '"' + (c.everyDays === n ? ' selected' : '') + '>Every ' + (n === 1 ? 'day' : n + ' days') + '</option>').join('') + '</select></div>'
                    + '<div class="fx-setting"><div><b>Keep the newest</b><span class="d">' + c.count + ' backup' + (c.count === 1 ? '' : 's') + ' in the folder now</span></div><select class="fx-select" id="ab-keep">' + [3, 5, 8, 15, 30].map(n => '<option value="' + n + '"' + (c.keep === n ? ' selected' : '') + '>' + n + ' files</option>').join('') + '</select></div>'
                    + '<div class="fx-row"><button class="fx-btn primary" id="ab-now">Back up now</button></div>';
                $('ab-on').onchange = async (e) => { if (e.target.checked && !c.dir) { e.target.checked = false; showToast('Choose a folder first.'); return; } await feat('backupSet', { on: e.target.checked }); };
                $('ab-every').onchange = async (e) => { await feat('backupSet', { everyDays: Number(e.target.value) }); };
                $('ab-keep').onchange = async (e) => { await feat('backupSet', { keep: Number(e.target.value) }); };
                $('ab-dir').onclick = async () => { const r = await feat('backupChooseDir'); if (r && r.ok) render(); };
                $('ab-now').onclick = async () => { const r = await feat('backupRun'); showToast(r && r.ok ? 'Backup saved: ' + r.name : (r.error || 'Could not back up.')); render(); };
            };
            m.open(); render();
        });
    });

    // ---------- feature settings (game mode, widget, controller, theme scheduler, accent, language ...) ----------
    safe('feature-settings', () => {
        SLF.addTile('Settings', '🎛️', 'Extras settings', 'Game mode, session widget, controller, day/night themes, per-game accent, language and more.', async () => {
            const m = SLF.modal('fs-modal', 'Extras settings', { cls: 'wide' });
            const fs = (await feat('settingsGet')) || {};
            const owned = await ownedThemes();
            const sch = getUiPref('themeSchedule', { on: false, mode: 'time', day: '', night: '', from: '19:00', to: '07:00' });
            const opts = (sel) => '<option value="">(keep current)</option>' + owned.map(t => '<option value="' + E(t.file) + '"' + (sel === t.file ? ' selected' : '') + '>' + E(t.name) + '</option>').join('');
            const sw = (id, on) => '<label class="switch-toggle"><input type="checkbox" id="' + id + '"' + (on ? ' checked' : '') + '><span class="switch-slider"></span></label>';
            m.body.innerHTML = ''
                + '<div class="fx-section">Performance</div>'
                + '<div class="fx-setting"><div><b>Memory saver</b><span class="d">Uses much less memory by drawing on the CPU instead of the GPU and running without separate graphics and audio processes, but animations and video backgrounds can be less smooth. Needs a restart.</span></div>' + sw('fs-mem', fs.lowMemory === true) + '</div>'
                + '<div class="fx-section">While playing</div>'
                + '<div class="fx-setting"><div><b>Game mode</b><span class="d">Mutes pop-ups and notification sounds while a game is running</span></div>' + sw('fs-gm', getUiPref('gameMode', false)) + '</div>'
                + '<div class="fx-setting"><div><b>Session widget</b><span class="d">A small always-on-top timer and clock while you play (windowed / borderless games)</span></div><div style="display:flex;gap:8px;align-items:center"><select class="fx-select" id="fs-wc"><option value="tr">Top right</option><option value="tl">Top left</option><option value="br">Bottom right</option><option value="bl">Bottom left</option></select>' + sw('fs-w', fs.sessionWidget) + '</div></div>'
                + '<div class="fx-setting"><div><b>Friend game alerts</b><span class="d">"Alex is playing a game you own" notifications</span></div>' + sw('fs-fga', getUiPref('friendGameAlerts', true)) + '</div>'
                + '<div class="fx-section">Look and feel</div>'
                + '<div class="fx-setting"><div><b>Per-game accent</b><span class="d">The app takes its colour from the cover of the game you open</span></div>' + sw('fs-acc', getUiPref('perGameAccent', false)) + '</div>'
                + '<div class="fx-setting"><div><b>Day / night themes</b><span class="d">Switch theme automatically (only themes you own)</span></div>' + sw('fs-sch', sch.on) + '</div>'
                + '<div class="fx-setting" style="flex-wrap:wrap"><div><span class="d">Day theme</span><select class="fx-select" id="fs-day">' + opts(sch.day) + '</select></div><div><span class="d">Night theme</span><select class="fx-select" id="fs-night">' + opts(sch.night) + '</select></div><div><span class="d">Mode</span><select class="fx-select" id="fs-mode"><option value="time">By time</option><option value="windows">Follow Windows</option></select></div><div><span class="d">Night from / to</span><input type="time" class="fx-input" id="fs-from" value="' + E(sch.from) + '"> <input type="time" class="fx-input" id="fs-to" value="' + E(sch.to) + '"></div></div>'
                + '<div class="fx-setting"><div><b>Language</b><span class="d">The main screens and menus are translated (the rest stays in English)</span></div><select class="fx-select" id="fs-lang">' + SLF.langOptions() + '</select></div>'
                + '<div class="fx-section">Input</div>'
                + '<div class="fx-setting"><div><b>Controller navigation</b><span class="d">D-pad / stick to move, A = open, B = back, LB/RB = switch page, Y = tools</span></div>' + sw('fs-pad', getUiPref('controller', true)) + '</div>';
            $('fs-wc').value = fs.sessionWidgetCorner || 'tr'; $('fs-mode').value = sch.mode; $('fs-lang').value = getUiPref('lang', 'en');
            $('fs-mem').onchange = async (e) => {
                await feat('settingsSet', { lowMemory: e.target.checked });
                if (await showConfirm('Restart SteamLite?', 'Restart now to apply the memory setting.')) feat('restartApp'); else showToast('The memory setting applies the next time SteamLite starts.');
            };
            $('fs-gm').onchange = (e) => setUiPref({ gameMode: e.target.checked });
            $('fs-fga').onchange = (e) => setUiPref({ friendGameAlerts: e.target.checked });
            $('fs-acc').onchange = (e) => setUiPref({ perGameAccent: e.target.checked });
            $('fs-pad').onchange = (e) => setUiPref({ controller: e.target.checked });
            $('fs-w').onchange = (e) => feat('settingsSet', { sessionWidget: e.target.checked });
            $('fs-wc').onchange = (e) => feat('settingsSet', { sessionWidgetCorner: e.target.value });
            const saveSch = async () => { const v = { on: $('fs-sch').checked, mode: $('fs-mode').value, day: $('fs-day').value, night: $('fs-night').value, from: $('fs-from').value || '19:00', to: $('fs-to').value || '07:00' }; await setUiPref({ themeSchedule: v, themeScheduleLast: '' }); SLF.runScheduler && SLF.runScheduler(); };
            ['fs-sch', 'fs-day', 'fs-night', 'fs-mode', 'fs-from', 'fs-to'].forEach(id => { $(id).onchange = saveSch; });
            $('fs-lang').onchange = async (e) => { await setUiPref({ lang: e.target.value }); SLF.applyLang && SLF.applyLang(); showToast('✓ ' + (SLF.langNames[e.target.value] || 'Language changed.')); };
            m.open();
        });
    });
    async function ownedThemes() {
        try {
            const [shop, meta] = await Promise.all([window.electronAPI.getThemeShop(), window.electronAPI.getMetaAchievements({ librarySize: allGames().length })]);
            const granted = new Set((meta && meta.unlockedThemes) || []), unlockedAch = {};
            ((meta && meta.achievements) || []).forEach(a => { if (a.unlockedAt) unlockedAch[a.id] = true; });
            return ((shop && shop.themes) || []).filter(t => (!t.source || t.source === 'official') && t.file && (!t.requires || unlockedAch[t.requires] || granted.has(t.id)));
        } catch (e) { return []; }
    }
    SLF.ownedThemes = ownedThemes;

    // ---------- day / night theme scheduler ----------
    safe('theme-scheduler', () => {
        const mins = (t) => { const m = /^(\d{1,2}):(\d{2})$/.exec(t || ''); return m ? Number(m[1]) * 60 + Number(m[2]) : null; };
        function isNight(s) {
            if (s.mode === 'windows') return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
            const from = mins(s.from), to = mins(s.to), d = new Date(), now = d.getHours() * 60 + d.getMinutes();
            if (from === null || to === null || from === to) return false;
            return from < to ? (now >= from && now < to) : (now >= from || now < to);
        }
        SLF.runScheduler = async function () {
            const s = getUiPref('themeSchedule', null);
            if (!s || !s.on) return;
            const night = isNight(s), want = night ? s.night : s.day, tag = (night ? 'n:' : 'd:') + want;
            if (!want || getUiPref('themeScheduleLast', '') === tag) return;
            const theme = await feat('themeFile', { file: want });
            if (!theme || theme.locked || typeof theme !== 'object') return;
            await setUiPref({ themeScheduleLast: tag });
            applyThemeObject(theme);
        };
        setTimeout(SLF.runScheduler, 4000);
        setInterval(SLF.runScheduler, 60 * 1000);
    });

    // ---------- per-game accent colour ----------
    safe('per-game-accent', () => {
        let saved = null;
        const restore = () => { if (saved !== null) { document.documentElement.style.setProperty('--accent-color', saved); saved = null; } };
        function dominant(img) {
            const c = document.createElement('canvas'); c.width = c.height = 24; const x = c.getContext('2d'); x.drawImage(img, 0, 0, 24, 24);
            const d = x.getImageData(0, 0, 24, 24).data; let best = null, bestS = -1;
            for (let i = 0; i < d.length; i += 4) { const r = d[i], g = d[i + 1], b = d[i + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 510, s = mx === mn ? 0 : (mx - mn) / (255 - Math.abs(mx + mn - 255)); const score = s * (1 - Math.abs(l - 0.55) * 1.2); if (score > bestS && mx > 70) { bestS = score; best = [r, g, b]; } }
            return best;
        }
        SLF.applyGameAccent = (game) => {
            if (!getUiPref('perGameAccent', false)) return;
            const img = new Image(); img.crossOrigin = 'anonymous';
            img.onload = () => { try { const c = dominant(img); if (!c) return; if (saved === null) saved = document.documentElement.style.getPropertyValue('--accent-color') || (getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim()); document.documentElement.style.setProperty('--accent-color', 'rgb(' + c.join(',') + ')'); } catch (e) { } };
            img.src = SLF.cover(SLF.gid(game));
        };
        const gm = $('game-modal');
        new MutationObserver(() => { if (!gm.classList.contains('active')) restore(); }).observe(gm, { attributes: true, attributeFilter: ['class'] });
    });

    // ---------- hook the game window (current game, per-game accent, injected sections) ----------
    safe('game-window-hooks', () => {
        const orig = window.openGameModal;
        window.openGameModal = function (game, isInstalled) {
            const r = orig.apply(this, arguments);
            SLF.currentGame = game;
            setTimeout(() => { safe('game-extras', () => { SLF.applyGameAccent && SLF.applyGameAccent(game); (SLF.gameExtras || []).forEach(fn => { try { fn(game, isInstalled); } catch (e) { console.error('[game extra]', e); } }); }); }, 120);
            return r;
        };
        SLF.gameExtras = [];
    });

    // ---------- friend game alerts ("X is playing something you own") ----------
    safe('friend-game-alerts', () => {
        const seen = {}; let first = true;
        const origLoad = window.loadFriends;
        window.loadFriends = async function () {
            const r = await origLoad.apply(this, arguments);
            try {
                (friendsCache || []).forEach(f => {
                    const cur = f.gameextrainfo ? String(f.gameid || f.gameextrainfo) : '', prev = seen[f.steamid];
                    seen[f.steamid] = cur;
                    if (first || !cur || cur === prev || !getUiPref('friendGameAlerts', true)) return;
                    const mine = allGames().find(g => String(g.appid) === String(f.gameid) || (!f.gameid && String(g.name).toLowerCase() === String(f.gameextrainfo).toLowerCase()));
                    const prefs = getFriendPrefs(f.steamid); if (!mine || prefs.muted || prefs.hidden) return;
                    showToast(friendDisplayName(f) + ' is playing ' + mine.name + ' - you own it!', () => SLF.openCoop && SLF.openCoop(f.steamid), { icon: f.avatarmedium, notification: true });
                });
            } catch (e) { }
            first = false;
            return r;
        };
    });

    // ---------- controller navigation ----------
    safe('controller', () => {
        let prev = {}, nextAt = {}, hint = document.createElement('div');
        hint.className = 'kb-pad-hint'; hint.textContent = '🎮 Controller connected'; document.body.appendChild(hint);
        window.addEventListener('gamepadconnected', () => { if (!getUiPref('controller', true)) return; hint.style.display = 'block'; setTimeout(() => { hint.style.display = 'none'; }, 2500); });
        const key = (k) => { const t = document.activeElement && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) ? document.activeElement : document; (t === document ? document : t).dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true })); };
        const navs = () => [...document.querySelectorAll('.nav-btn[data-view]')].filter(b => b.dataset.view !== 'settings');
        function poll() {
            if (getUiPref('controller', true) && !window.SLCouchOpen) {
                const pads = (navigator.getGamepads && navigator.getGamepads()) || [], p = [...pads].find(x => x && x.connected);
                if (p) {
                    const now = performance.now(), b = p.buttons.map(x => x.pressed), ax = p.axes;
                    const dirs = { ArrowUp: b[12] || ax[1] < -0.55, ArrowDown: b[13] || ax[1] > 0.55, ArrowLeft: b[14] || ax[0] < -0.55, ArrowRight: b[15] || ax[0] > 0.55 };
                    Object.keys(dirs).forEach(k => { if (dirs[k]) { if (!nextAt[k] || now >= nextAt[k]) { key(k); nextAt[k] = now + (nextAt[k] ? 120 : 320); } } else nextAt[k] = 0; });
                    const edge = (i, fn) => { if (b[i] && !prev[i]) fn(); };
                    edge(0, () => key('Enter')); edge(1, () => key('Escape'));
                    edge(3, () => SLF.openHub && SLF.openHub());
                    edge(4, () => { const n = navs(), i = n.findIndex(x => x.classList.contains('active')); if (n.length) n[(i - 1 + n.length) % n.length].click(); });
                    edge(5, () => { const n = navs(), i = n.findIndex(x => x.classList.contains('active')); if (n.length) n[(i + 1) % n.length].click(); });
                    prev = b;
                }
            }
            requestAnimationFrame(poll);
        }
        requestAnimationFrame(poll);
    });

    // ---------- big libraries: add cards in chunks as you scroll ----------
    safe('smooth-grid', () => {
        SLF.fill = function (grid, games, flag) {
            const mk = (g) => createGameCard(g, typeof flag === 'function' ? flag(g) : flag);
            const CHUNK = 60;
            if (games.length <= CHUNK + 20 || (typeof selectMode !== 'undefined' && selectMode)) { games.forEach(g => grid.appendChild(mk(g))); return; }
            let i = 0;
            const sentinel = document.createElement('div'); sentinel.className = 'fx-sentinel'; sentinel.style.cssText = 'grid-column: 1 / -1; height: 1px;';
            const next = () => {
                const end = Math.min(games.length, i + CHUNK), frag = document.createDocumentFragment(), added = [];
                for (; i < end; i++) { const c = mk(games[i]); frag.appendChild(c); added.push(c); }
                grid.insertBefore(frag, sentinel);
                if (typeof achObserver !== 'undefined' && achObserver) added.forEach(c => achObserver.observe(c));
                if (i >= games.length) { io.disconnect(); sentinel.remove(); }
            };
            const io = new IntersectionObserver((es) => { if (es.some(e => e.isIntersecting)) next(); }, { rootMargin: '900px' });
            grid.appendChild(sentinel); next(); io.observe(sentinel);
            // each time more cards are added the sentinel moves down; re-arm the observer so it fires again
            const mo = new MutationObserver(() => { if (sentinel.isConnected) { io.unobserve(sentinel); io.observe(sentinel); } else mo.disconnect(); });
            mo.observe(grid, { childList: true });
        };
    });

    // ---------- beta channel warning ----------
    safe('beta-warning', () => {
        const sel = $('update-channel-input'); if (!sel) return;
        let was = sel.value;
        sel.addEventListener('focus', () => { was = sel.value; });
        sel.addEventListener('change', async () => {
            if (sel.value !== 'beta') { was = sel.value; return; }
            const ok = await showConfirm('Switch to the beta channel?', 'Beta versions get new features first, but they can be unstable and may have bugs that lose settings. You can switch back to stable at any time (the SteamLite Updater can also install an older version). Continue?');
            if (!ok) sel.value = was || 'stable'; else was = 'beta';
        });
    });

    // ---------- welcome tour after an update ----------
    safe('update-tour', () => {
        SLF.tourSteps = () => [
            { icon: '\uD83C\uDF81', title: 'Drops, streaks and a lucky wheel', text: 'Free XP every hour, every 5 hours and every day. Claim the daily drop on consecutive days for up to +70% XP, earn coins from every drop and spin the lucky wheel once a day.', act: () => { if (window.SLDrops) SLDrops.open(); }, label: 'Open Drops' },
            { icon: '\uD83C\uDFF7\uFE0F', title: 'Shop and Trophy room', text: 'Spend your coins on avatar frames and profile titles (daily picks plus limited-time event items), and see every frame, title and theme you can collect in the Trophy room.', act: () => { if (SLF.openShop) SLF.openShop(); }, label: 'Open the Shop' },
            { icon: '\uD83E\uDDE9', title: 'Widgets, recap and search', text: 'Cards on your dashboard (continue playing, this week, daily goal, clock, theme of the week), a weekly recap you can save as a picture, and a command palette (Ctrl+K) that now finds achievements, settings and themes too.', act: () => { if (SLF.actions['Dashboard widgets']) SLF.actions['Dashboard widgets'](); }, label: 'Dashboard widgets' },
            { icon: '\u2728', title: 'Smart collections, tags and links', text: 'Build collections from rules like "unplayed and under 5 hours", tag your games (right-click a game) and keep links or save folders on every game page.', act: () => { if (SLF.actions['Smart collections']) SLF.actions['Smart collections'](); }, label: 'Smart collections' },
            { icon: '\uD83C\uDF9B\uFE0F', title: 'More settings', text: 'Mute kinds of notifications or snooze them, ignore time spent away from the PC, post achievements to Discord, accessibility options, more languages and restore points.', act: () => { if (SLF.openMore) SLF.openMore(); }, label: 'Open More settings' }
        ];
        SLF.openTour = () => {
            const steps = SLF.tourSteps(); let i = 0;
            const m = SLF.modal('tour-modal', 'What\'s new in ' + SLF.tourVersion, { cls: 'narrow' });
            // every step is a slide on one track; Next / Back slide the track sideways
            m.body.innerHTML = '<div class="tour-view"><div class="tour-track" id="tour-track">' + steps.map((s, n) =>
                '<div class="tour-slide' + (n === 0 ? ' on' : '') + '"><div class="tour-ico">' + s.icon + '</div><h3>' + E(s.title) + '</h3><p>' + E(s.text) + '</p></div>').join('') + '</div></div>'
                + '<div class="tour-dots" id="tour-dots">' + steps.map((s, n) => '<button class="tour-dot' + (n === 0 ? ' on' : '') + '" data-n="' + n + '" aria-label="Step ' + (n + 1) + '"></button>').join('') + '</div>'
                + '<div class="fx-row" style="justify-content:space-between"><span class="fx-meta" id="tour-count"></span><span id="tour-btns"></span></div>';
            const track = $('tour-track'), slides = [...track.children], dots = [...$('tour-dots').children];
            const go = (n) => {
                i = Math.max(0, Math.min(steps.length - 1, n));
                track.style.transform = 'translateX(' + (-100 * i) + '%)';
                slides.forEach((el, k) => el.classList.toggle('on', k === i));
                dots.forEach((el, k) => el.classList.toggle('on', k === i));
                paint();
            };
            const paint = () => {
                const s = steps[i];
                $('tour-count').textContent = (i + 1) + ' / ' + steps.length;
                $('tour-btns').innerHTML = (i > 0 ? '<button class="fx-btn" id="tour-back">Back</button> ' : '') + (s.label ? '<button class="fx-btn" id="tour-try">' + E(s.label) + '</button> ' : '') + '<button class="fx-btn primary" id="tour-next">' + (i === steps.length - 1 ? 'Done' : 'Next') + '</button>';
                if ($('tour-back')) $('tour-back').onclick = () => go(i - 1);
                if ($('tour-try')) $('tour-try').onclick = () => { m.close(); s.act(); };
                $('tour-next').onclick = () => { if (i === steps.length - 1) m.close(); else go(i + 1); };
            };
            dots.forEach(d => d.onclick = () => go(+d.dataset.n));
            paint(); m.open();
        };
        SLF.addCmd('What\'s new tour', '🎉', SLF.openTour);
        setTimeout(async () => {
            if (!activeConfig || !activeConfig.steamId) return;
            if (getUiPref('tourSeen', '') === SLF.tourVersion) return;
            await setUiPref({ tourSeen: SLF.tourVersion });
            if (!document.querySelector('.modal-backdrop.active')) SLF.openTour();
        }, 6000);
    });

    // ---------- Bulgarian (and a place to add more languages) ----------
    safe('language', () => {
        const BG = {
            'Home': 'Начало', 'Library': 'Библиотека', 'Favorites': 'Любими', 'Settings': 'Настройки', 'Dashboard': 'Табло', 'Collections': 'Колекции', 'COLLECTIONS': 'КОЛЕКЦИИ',
            'Profile': 'Профил', 'Friend Profile': 'Профил на приятел', 'Online': 'На линия', 'Offline': 'Извън линия', 'Away': 'Отсъства', 'Installed': 'Инсталирана', 'Not Installed': 'Неинсталирана',
            'Play': 'Играй', 'Install': 'Инсталирай', 'Uninstall': 'Деинсталирай', 'Cancel': 'Отказ', 'Save': 'Запази', 'Close': 'Затвори', 'Refresh': 'Опресни', 'Apply': 'Приложи', 'Locked': 'Заключено',
            'Search library...': 'Търсене в библиотеката...', 'Play Next': 'Играй следваща', 'Friends List': 'Списък с приятели', 'Search friends...': 'Търсене на приятели...',
            'Show hidden': 'Покажи скритите', 'Activity': 'Активност', 'Right-click a friend for more': 'Десен бутон върху приятел за повече',
            'Application Settings': 'Настройки на приложението', 'Modify your preferences below': 'Променете предпочитанията си по-долу', 'Advanced Settings': 'Разширени настройки',
            'Save Configuration': 'Запази конфигурацията', 'Check for Updates': 'Провери за обновления', 'Filters': 'Филтри', 'Sort By': 'Сортиране по', 'Hide Shared': 'Скрий споделените',
            'Show Hidden': 'Покажи скритите', 'Compact List': 'Компактен списък', 'My status': 'Моят статус', 'Playing': 'Играя', 'Backlog': 'За по-късно', 'Completed': 'Завършена', 'Dropped': 'Изоставена',
            'Inventory': 'Инвентар', 'Achievements': 'Постижения', 'SteamLite Achievements': 'Постижения в SteamLite', 'Wishlist': 'Желания', 'Daily challenges': 'Дневни предизвикателства',
            'Weekly challenges': 'Седмични предизвикателства', 'Items': 'Предмети', 'Level rewards': 'Награди за ниво', 'Rewards earned': 'Спечелени награди', 'Streak Restores': 'Възстановявания на серия',
            'Play Streak': 'Серия от дни', 'Year in Review': 'Годината в преглед', 'Friend Activity': 'Активност на приятели', 'Notification history': 'История на известията',
            'Tools & extras': 'Инструменти и допълнения', 'Extras settings': 'Допълнителни настройки', 'Diagnostics': 'Диагностика', 'Automatic backups': 'Автоматични архиви',
            'What should I play?': 'Какво да играя?', 'Up Next': 'Следващи', 'Play calendar': 'Календар на игрите', 'Library stats': 'Статистика на библиотеката', 'Co-op finder': 'Търсач на игри заедно',
            'Game journal': 'Дневник на игрите', 'Weekly bingo': 'Седмично бинго', 'Season': 'Сезон', 'Free games & sales': 'Безплатни игри и намаления', 'Library health': 'Здраве на библиотеката',
            'Shutdown timer': 'Таймер за изключване', 'Closest to 100%': 'Най-близо до 100%', 'Home Title': 'Начало', 'Select multiple games': 'Избор на няколко игри',
            'Launch Options': 'Опции за стартиране', 'Game Notes': 'Бележки за играта', 'Session History': 'История на сесиите', 'Screenshots': 'Екранни снимки', 'Details': 'Подробности', 'News': 'Новини',
            'Hide Game': 'Скрий играта', 'Unhide Game': 'Покажи играта', 'Add to Favorites': 'Добави в любими', 'Remove from Favorites': 'Махни от любими', 'Change Cover': 'Смени корицата',
            'Edit Profile': 'Редакция на профила', 'Badges': 'Значки', 'Showcase': 'Витрина', 'Owned Games': 'Притежавани игри', 'Level': 'Ниво', 'Games': 'Игри', 'Playtime': 'Време за игра',
            'Loading...': 'Зареждане...', 'No friends to show.': 'Няма приятели за показване.', 'Update Now': 'Обнови сега', 'Later': 'По-късно', "What's new": 'Какво е ново',
            'Skip this version': 'Пропусни тази версия', 'Back': 'Назад', 'Next': 'Напред', 'Done': 'Готово', 'Yes': 'Да', 'No': 'Не', 'OK': 'Добре', 'Delete': 'Изтрий', 'Add': 'Добави', 'Remove': 'Махни',
            'Appearance (card style, font, UI scale)': 'Външен вид (стил на картите, шрифт, мащаб)', 'Keyboard Shortcuts': 'Клавишни комбинации', 'Global Hotkeys': 'Глобални клавиши', 'Quit SteamLite': 'Изход от SteamLite',
            'Go to Home': 'Към началото', 'Go to Library': 'Към библиотеката', 'Go to Favorites': 'Към любимите', 'Open Settings': 'Отвори настройките', 'Toggle Friends Panel': 'Покажи/скрий приятелите',
            'Play Random Game': 'Играй случайна игра', 'Free Up Space (disk cleanup)': 'Освобождаване на място', 'Import Games from Start Menu': 'Импорт на игри от менюто Старт'
        };
        const DICTS = { bg: BG }; SLF.DICTS = DICTS;
        const skip = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'CANVAS', 'PRE', 'CODE']);
        const origText = new WeakMap();
        function translateNode(n, dict) {
            if (n.nodeType === 3) {
                const raw = n.nodeValue, t = raw.trim(); if (!t) return;
                const rec = origText.get(n);
                const en = rec && rec.tr === t ? rec.en : t;   // the English text this node had before it was translated
                const out = dict && dict[en] ? dict[en] : en;
                if (out !== t) n.nodeValue = raw.replace(t, out);
                if (dict && dict[en]) origText.set(n, { en, tr: out }); else origText.delete(n);
                return;
            }
            if (n.nodeType !== 1 || skip.has(n.tagName) || n.id === 'review-canvas') return;
            if (n.placeholder && dict && dict[n.placeholder]) n.placeholder = dict[n.placeholder];
            if (n.title && dict && dict[n.title]) n.title = dict[n.title];
            n.childNodes.forEach(c => translateNode(c, dict));
        }
        let busy = false;
        SLF.applyLang = function () {
            const lang = getUiPref('lang', 'en'), dict = DICTS[lang] || null;
            busy = true; translateNode(document.body, dict); busy = false;
            document.documentElement.lang = lang;
        };
        const mo = new MutationObserver((muts) => { if (busy) return; const dict = DICTS[getUiPref('lang', 'en')]; if (!dict) return; busy = true; muts.forEach(m => m.addedNodes.forEach(n => translateNode(n, dict))); busy = false; });
        mo.observe(document.body, { childList: true, subtree: true });
        setTimeout(SLF.applyLang, 1500);
    });

    // ---------- theme share codes ----------
    safe('theme-share', () => {
        const PREFIX = 'SLTHEME1.';
        const b64e = (s) => btoa(unescape(encodeURIComponent(s))), b64d = (s) => decodeURIComponent(escape(atob(s)));
        const okVal = (v) => typeof v === 'string' && v.length <= 120 && !/[;{}<>]|url\(|expression|@import/i.test(v);
        const cleanCss = (c) => typeof c === 'string' && c.length <= 9000 && !/@import|url\(\s*['"]?\s*(https?:|\/\/|data:text|javascript:)|<\/?style|expression\(|javascript:/i.test(c);
        function currentTheme() {
            const vars = {}, st = document.documentElement.style;
            (typeof SUE_COLOR_VARS !== 'undefined' ? SUE_COLOR_VARS : []).forEach(k => { const v = st.getPropertyValue(k); if (v) vars[k] = v.trim(); });
            return { v: 1, vars, css: ($('custom-theme-style') && $('custom-theme-style').textContent) || '' };
        }
        SLF.addTile('Themes', '🎨', 'Theme share codes', 'Copy your current look as a short code, or paste a code someone sent you to try their theme.', () => {
            const m = SLF.modal('share-modal', 'Theme share codes', { sub: 'A code holds the colours and style of a theme - paste it anywhere to share it.' });
            m.body.innerHTML = '<div class="fx-section">Share your current look</div><textarea class="fx-text" id="sh-out" readonly></textarea><div class="fx-row"><button class="fx-btn primary" id="sh-copy">Copy code</button></div>'
                + '<div class="fx-section">Use a code</div><textarea class="fx-text" id="sh-in" placeholder="Paste a code that starts with SLTHEME1."></textarea><div class="fx-row"><input class="fx-input" id="sh-name" placeholder="Name for this theme" style="flex:1"><button class="fx-btn primary" id="sh-import">Add and apply</button></div><div class="fx-note">Codes can only change colours and styling. Anything that could load web content is refused.</div>';
            $('sh-out').value = PREFIX + b64e(JSON.stringify(currentTheme()));
            $('sh-copy').onclick = async () => { try { await navigator.clipboard.writeText($('sh-out').value); showToast('Code copied.', null, { noHistory: true }); } catch (e) { $('sh-out').select(); showToast('Press Ctrl+C to copy.'); } };
            $('sh-import').onclick = async () => {
                try {
                    const code = $('sh-in').value.trim(); if (!code.startsWith(PREFIX)) throw new Error('That is not a SteamLite theme code.');
                    const t = JSON.parse(b64d(code.slice(PREFIX.length)));
                    if (!t || typeof t.vars !== 'object' || Array.isArray(t.vars)) throw new Error('The code is damaged.');
                    const vars = {}; Object.keys(t.vars).slice(0, 40).forEach(k => { if (/^--[\w-]{1,40}$/.test(k) && okVal(t.vars[k])) vars[k] = t.vars[k]; });
                    if (!Object.keys(vars).length) throw new Error('The code has no usable colours.');
                    const css = cleanCss(t.css || '') ? (t.css || '') : null; if (css === null) throw new Error('The code contains styling that is not allowed.');
                    const name = ($('sh-name').value.trim() || 'Shared theme').slice(0, 40);
                    const custom = { id: 'code-' + Date.now(), name, author: 'Share code', authorAvatar: '', description: 'Imported from a share code.', colors: [vars['--accent-color'] || '#8b5cf6', vars['--bg-dark'] || '#0b0b10', vars['--text-primary'] || '#ffffff'], vars, css, local: true };
                    activeConfig.customThemes = [...(activeConfig.customThemes || []), custom];
                    await window.electronAPI.saveConfig({ customThemes: activeConfig.customThemes });
                    applyThemeObject({ vars, css }); m.close(); showToast('Theme "' + name + '" added and applied.');
                } catch (e) { showToast(e.message || 'That code could not be used.'); }
            };
            m.open();
        });
    });
})();
