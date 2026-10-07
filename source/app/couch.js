// SteamLite 9.0 beta - Couch mode: a fullscreen, controller-first launcher.
// Big covers in rows, a hero panel for the game you are on, and everything works from a gamepad (or the keyboard):
//   D-pad / left stick: move   A / Enter: open the game page (Play, Favorite, Status, Rating, tabs)   B / Esc: back / leave   X / F: favourite
//   Y / M: play / pause music   LB / RB: previous / next track   Start: leave
(function () {
    'use strict';
    const api = window.electronAPI;
    if (!api || !api.windowFullscreen) return;
    const $ = (id) => document.getElementById(id);
    const E = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const pref = (k, d) => { try { const v = localStorage.getItem('sl_couch_' + k); return v === null ? d : v === '1'; } catch (e) { return d; } };
    const setPref = (k, v) => { try { localStorage.setItem('sl_couch_' + k, v ? '1' : '0'); } catch (e) { } };
    // which controller button does what (Settings > Behaviour > Couch mode). Numbers are the standard gamepad buttons.
    const BTN_NAMES = ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 'Back', 'Start', 'L3', 'R3'];
    const MAP_DEFAULT = { a: 0, b: 1, x: 2, y: 3, lb: 4, rb: 5, drops: 8, start: 9 };
    const getMap = () => { let m = {}; try { m = JSON.parse(localStorage.getItem('sl_couch_map') || '{}') || {}; } catch (e) { } const out = Object.assign({}, MAP_DEFAULT); Object.keys(out).forEach(k => { if (Number.isInteger(m[k]) && m[k] >= 0 && m[k] < 12) out[k] = m[k]; }); return out; };
    const bn = (name) => BTN_NAMES[getMap()[name]] || '?';

    let mode = 'rows', page = null;
    let root = null, isOpen = false, rows = [], pos = { r: 0, c: 0 }, memCol = [], wasFullscreen = false, raf = 0, prevBtn = {}, nextAt = {}, heroTimer = 0, cursorTimer = 0, lastMove = 0, media = null;

    // ---------- data ----------
    const gid = (g) => String(g.appid ?? g.id);
    const visible = (g) => !g.isShared && !hiddenGames.includes(gameKey(g));
    const hours = (g) => getPlaytimeSeconds(g) / 3600;
    const byName = (a, b) => String(a.name).localeCompare(String(b.name));
    const isInstalled = (g) => installedGames.some(x => gid(x) === gid(g));
    function buildRows() {
        const inst = installedGames.filter(visible), un = uninstalledGames.filter(visible);
        const out = [];
        const recent = inst.filter(g => lastPlayedMs(g) > 0).sort((a, b) => lastPlayedMs(b) - lastPlayedMs(a)).slice(0, 14);
        if (recent.length) out.push({ title: 'Continue playing', games: recent });
        const favs = inst.filter(g => favorites.includes(gid(g))).sort(byName);
        if (favs.length) out.push({ title: 'Favorites', games: favs });
        const most = inst.filter(g => hours(g) >= 1).sort((a, b) => getPlaytimeSeconds(b) - getPlaytimeSeconds(a)).slice(0, 14);
        if (most.length) out.push({ title: 'Most played', games: most });
        out.push({ title: 'All installed', games: inst.slice().sort(byName) });
        if (un.length) out.push({ title: 'Not installed', games: un.slice().sort(byName).slice(0, 250), install: true });
        return out.filter(r => r.games.length);
    }

    // ---------- DOM ----------
    function build() {
        root = document.createElement('div');
        root.id = 'couch'; root.className = 'couch';
        root.innerHTML = '<div class="cc-bg" id="cc-bg"></div><div class="cc-shade"></div>' +
            '<header class="cc-top"><div class="cc-user"><img id="cc-avatar" alt=""><span id="cc-name"></span></div><div class="cc-media" id="cc-media"></div><button class="cc-dropchip" id="cc-dropchip" style="display:none"></button><div class="cc-clock" id="cc-clock"></div></header>' +
            '<section class="cc-hero" id="cc-hero"><div class="cc-hero-txt"><div class="cc-chip" id="cc-chip"></div><h1 id="cc-title"></h1><div class="cc-meta" id="cc-meta"></div><div class="cc-ach" id="cc-ach"></div></div><div class="cc-hero-art" id="cc-art"></div></section>' +
            '<div class="cc-rows" id="cc-rows"><div class="cc-rows-in" id="cc-rows-in"></div></div>' +
            '<div class="cc-drops" id="cc-drops"></div><div class="cc-running" id="cc-running"></div><footer class="cc-hints" id="cc-hints"></footer><div class="cc-empty" id="cc-empty">Nothing here yet. Install a game in Steam and it shows up.</div>';
        document.body.appendChild(root);
        root.addEventListener('mousemove', () => { lastMove = Date.now(); root.classList.remove('nocursor'); });
        $('cc-dropchip').addEventListener('click', () => { if (dropsOpen) closeDrops(); else openDrops(); });
        $('cc-rows-in').addEventListener('click', (e) => { const t = e.target.closest('.cc-tile'); if (!t) return; focusAt(+t.dataset.r, +t.dataset.c, true); act('a'); });
        $('cc-rows-in').addEventListener('mouseover', (e) => { const t = e.target.closest('.cc-tile'); if (t && Date.now() - lastMove < 1500) focusAt(+t.dataset.r, +t.dataset.c, false); });
    }

    function paintRows() {
        const box = $('cc-rows-in'); box.innerHTML = '';
        rows.forEach((row, r) => {
            const sec = document.createElement('div'); sec.className = 'cc-row';
            sec.innerHTML = '<h3>' + E(row.title) + ' <small>' + row.games.length + '</small></h3><div class="cc-strip"></div>';
            const strip = sec.querySelector('.cc-strip');
            row.games.forEach((g, c) => {
                const id = gid(g), t = document.createElement('button');
                t.className = 'cc-tile' + (row.install ? ' notinst' : '') + (favorites.includes(id) ? ' fav' : '') + (String(currentRunningAppId) === id ? ' running' : '');
                t.dataset.r = r; t.dataset.c = c; t.title = g.name;
                t.innerHTML = '<img loading="lazy" decoding="async" alt="" src="' + E(getGameImage(id)) + '"><span class="cc-tn">' + E(g.name) + '</span><i class="cc-dot fav-dot">★</i><i class="cc-dot run-dot">▶</i>';
                const img = t.querySelector('img'); img.onerror = () => { img.style.display = 'none'; t.classList.add('noimg'); };
                strip.appendChild(t);
            });
            box.appendChild(sec);
        });
    }

    const tileAt = (r, c) => { const s = $('cc-rows-in').children[r]; return s ? s.querySelector('.cc-strip').children[c] : null; };
    function focusAt(r, c, scroll) {
        if (!rows.length) return;
        r = Math.max(0, Math.min(rows.length - 1, r)); c = Math.max(0, Math.min(rows[r].games.length - 1, c));
        const old = tileAt(pos.r, pos.c); if (old) old.classList.remove('focus');
        pos = { r, c }; memCol[r] = c;
        const t = tileAt(r, c); if (!t) return;
        t.classList.add('focus');
        const strip = t.parentElement;
        strip.scrollTo({ left: Math.max(0, t.offsetLeft - (strip.clientWidth - t.offsetWidth) / 2), behavior: 'smooth' });
        const wrap = $('cc-rows'), sec = strip.parentElement, inner = $('cc-rows-in');
        inner.style.transform = 'translateY(' + (-Math.max(0, sec.offsetTop - 4)) + 'px)';
        $('cc-rows-in').querySelectorAll('.cc-row').forEach((x, i) => x.classList.toggle('current', i === r));
        clearTimeout(heroTimer); heroTimer = setTimeout(paintHero, 70);
        paintHints();
        void wrap; void scroll;
    }
    const cur = () => (rows[pos.r] && rows[pos.r].games[pos.c]) || null;

    function paintHero() {
        const g = cur(); if (!g) return;
        const id = gid(g), run = String(currentRunningAppId) === id, inst = isInstalled(g);
        const img = getGameImage(id);
        $('cc-bg').style.backgroundImage = 'url("' + img + '")';
        $('cc-art').innerHTML = '<img alt="" src="' + E(img) + '">';
        $('cc-title').textContent = g.name;
        const h = hours(g), lp = lastPlayedMs(g);
        const ago = lp ? (() => { const d = Math.floor((Date.now() - lp) / 86400000); return d <= 0 ? 'today' : d === 1 ? 'yesterday' : d + ' days ago'; })() : 'never';
        $('cc-meta').innerHTML = '<span>' + (h >= 1 ? Math.round(h * 10) / 10 + ' hours played' : h > 0 ? Math.round(h * 60) + ' minutes played' : 'Not played yet') + '</span><span>Last played ' + ago + '</span>';
        const ac = achievementCache[id];
        $('cc-ach').innerHTML = ac && ac.total > 0 ? '<div class="cc-achbar"><i style="width:' + Math.round(ac.achieved / ac.total * 100) + '%"></i></div><span>' + ac.achieved + ' / ' + ac.total + ' achievements</span>' : '';
        const chip = $('cc-chip'); chip.className = 'cc-chip ' + (run ? 'run' : inst ? 'ok' : 'no');
        chip.textContent = run ? 'Running now' : inst ? (favorites.includes(id) ? '★ Favorite' : 'Installed') : 'Not installed';
    }

    function paintHints() {
        if (page) {
            const hint2 = (btn, txt, cls) => '<span class="cc-hint ' + (cls || '') + '"><kbd>' + btn + '</kbd>' + txt + '</span>';
            const m2 = media && media.title;
            $('cc-hints').innerHTML = hint2(bn('a'), page.zone === 'panel' ? 'Scroll with \u2191 \u2193' : 'Select', 'main') + hint2(bn('b'), 'Back') + hint2(bn('lb') + ' / ' + bn('rb'), 'Tab') + hint2('\u2192', 'Read') + hint2(bn('x'), favorites.includes(page.id) ? 'Unfavorite' : 'Favorite') + (m2 ? hint2(bn('y'), media.status === 'Playing' ? 'Pause music' : 'Play music') : '') + hint2('Start', 'Exit');
            return;
        }
        const g = cur(), run = g && String(currentRunningAppId) === gid(g), inst = g && isInstalled(g);
        const hint = (btn, txt, cls) => '<span class="cc-hint ' + (cls || '') + '"><kbd>' + btn + '</kbd>' + txt + '</span>';
        const m = media && media.title;
        $('cc-hints').innerHTML = hint(bn('a'), 'Open', 'main') + hint(bn('b'), 'Back') + hint(bn('x'), g && favorites.includes(gid(g)) ? 'Unfavorite' : 'Favorite') + (m ? hint(bn('y'), media.status === 'Playing' ? 'Pause music' : 'Play music') + hint(bn('lb') + ' / ' + bn('rb'), 'Track') : '') + hint('Start', 'Exit') + hint(bn('drops'), 'Drops');
    }

    function paintRunning() {
        const b = $('cc-running');
        if (currentRunningAppId) { b.textContent = '▶  Playing ' + (currentRunningGameName || 'a game'); b.classList.add('on'); } else b.classList.remove('on');
        root.querySelectorAll('.cc-tile.running').forEach(t => t.classList.remove('running'));
        if (currentRunningAppId) rows.forEach((row, r) => row.games.forEach((g, c) => { if (gid(g) === String(currentRunningAppId)) { const t = tileAt(r, c); if (t) t.classList.add('running'); } }));
        paintHero(); paintHints();
        if (page) {
            const runNow = String(currentRunningAppId) === page.id;
            if (page.busy === 'Loading...' && runNow) { page.busy = ''; clearTimeout(page.busyTimer); }
            if (page.busy === 'Stopping...' && !runNow) { page.busy = ''; clearTimeout(page.busyTimer); }
            renderPageButtons(); updatePageChip();
        }
    }

    function paintTop() {
        const un = $('user-name'), av = $('user-avatar');
        const name = un ? [...un.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim() : '';
        $('cc-name').textContent = name || 'SteamLite'; if (av && av.src) $('cc-avatar').src = av.src;
        const tick = () => { const d = new Date(); $('cc-clock').textContent = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };
        tick(); clearInterval(paintTop._t); paintTop._t = setInterval(tick, 15000);
        const m = $('cc-media');
        m.innerHTML = media && media.title ? '<span class="cc-eq' + (media.status === 'Playing' ? ' on' : '') + '"><i></i><i></i><i></i></span><b>' + E(media.title) + '</b><span>' + E(media.artist || '') + '</span>' : '';
    }

    // ---------- actions ----------
    function toast(msg) { try { showToast(msg, null, { noHistory: true }); } catch (e) { } }
    // The same flow as the Play button in the game window: the button shows "Loading..." / "Stopping..." until the main process
    // confirms the game's process is really running (or gone), "another game is already launching" is reported, and a failed
    // launch shows "Error" for a moment. The main process does the exe / process tracking for both.
    function setBusy(label) {
        if (!page) return;
        page.busy = label || ''; clearTimeout(page.busyTimer);
        if (label && label !== 'Error') page.busyTimer = setTimeout(() => { if (page) { page.busy = ''; renderPageButtons(); } }, 30000); // safety: never stay stuck
        renderPageButtons();
    }
    async function launchFlow(g) {
        const appId = gid(g), local = localGamesCache.find(x => String(x.id) === appId);
        setBusy('Loading...');
        try {
            const launched = await api.launchGame({ gameId: appId, installdir: local ? local.installdir : String(g.name).toLowerCase().replace(/[^a-z0-9]/g, ''), commonPath: local ? local.commonPath : '', name: g.name });
            if (launched === false) { setBusy(''); toast('Another game is already launching.'); }
        } catch (e) {
            setBusy('Error'); setTimeout(() => { if (page && page.busy === 'Error') setBusy(''); }, 2000);
        }
    }
    async function stopFlow(g) {
        setBusy('Stopping...');
        try { await api.stopGame({ gameId: gid(g) }); } catch (e) { setBusy(''); }
    }
    // ---------- drops and event quests, from the controller ----------
    let dropsOpen = false;
    async function paintDropsPanel() {
        const D = window.SLDrops, box = $('cc-drops'); if (!D || !box) return;
        await D.refresh(); const st = D.state(); if (!st) return;
        const lft = (ms) => { const sx = Math.max(0, Math.ceil(ms / 1000)), h = Math.floor(sx / 3600), mi = Math.floor((sx % 3600) / 60); return h ? h + 'h ' + mi + 'm' : mi + 'm'; };
        let quests = ''; try { const ev = ((await api.getEvents()) || []).filter(e => e.active && e.quest); quests = ev.map(e => '<div class="cc-dq"><b>' + E(e.name) + '</b><span>' + e.unlocked + ' / ' + e.total + ' quests' + (e.claimed ? ' \u00B7 rewards earned' : '') + '</span></div>').join(''); } catch (e) { }
        const names = { hourly: 'Hourly drop', five: '5-hour drop', daily: 'Daily drop' }, n = Object.values(st.drops).filter(d => d.ready).length;
        box.innerHTML = '<div class="cc-dcard"><h2>Drops</h2>' + ['hourly', 'five', 'daily'].map(id => '<div class="cc-dr' + (st.drops[id].ready ? ' ready' : '') + '"><span>' + names[id] + '</span><b>' + (st.drops[id].ready ? 'Ready' : lft(st.drops[id].nextAt - Date.now())) + '</b></div>').join('') +
            '<div class="cc-dm">' + (st.streak && st.streak.days ? st.streak.days + '-day streak (+' + Math.round((st.streak.mult - 1) * 100) + '%) \u00B7 ' : '') + st.coins.toLocaleString() + ' coins' + (st.wheel && st.wheel.ready ? ' \u00B7 lucky wheel ready on the desktop' : '') + '</div>' + quests +
            '<div class="cc-dh"><span class="cc-hint main"><kbd>' + bn('a') + '</kbd>' + (n ? 'Claim ' + n + ' ready' : 'Nothing ready') + '</span><span class="cc-hint"><kbd>' + bn('b') + '</kbd>Close</span></div></div>';
    }
    async function openDrops() { if (!window.SLDrops) return; dropsOpen = true; $('cc-drops').classList.add('on'); try { playSound('open'); } catch (e) { } paintDropsPanel(); }
    function closeDrops() { dropsOpen = false; const b = $('cc-drops'); if (b) b.classList.remove('on'); try { playSound('close'); } catch (e) { } }
    async function dropsAct(name) {
        if (name === 'b' || name === 'drops' || name === 'start') { closeDrops(); return; }
        if (name === 'a' && window.SLDrops) { const before = window.SLDrops.ready(); if (!before) return; const st = await window.SLDrops.claimAll(); try { playSound('achievement'); showToast('Drops claimed. Level ' + st.level.level + ' \u00B7 ' + st.coins.toLocaleString() + ' coins'); } catch (e) { } paintDropsPanel(); }
    }
    const dropChip = () => { const ch = $('cc-dropchip'), D = window.SLDrops; if (!ch) return; const n = D ? D.ready() : 0; ch.style.display = n ? '' : 'none'; ch.textContent = 'Drops \u00B7 ' + n + ' ready'; };
    document.addEventListener('sl-drops', dropChip);
    async function act(name) {
        if (!isOpen) return;
        if (dropsOpen) return dropsAct(name);
        if (name === 'drops') { openDrops(); return; }
        if (mode === 'page') return pageAct(name);
        const g = cur();
        const moveR = (d) => { let r = Math.max(0, Math.min(rows.length - 1, pos.r + d)); if (r === pos.r) return; const c = Math.min(memCol[r] != null ? memCol[r] : pos.c, rows[r].games.length - 1); focusAt(r, c); try { playSound('click'); } catch (e) { } };
        switch (name) {
            case 'left': if (pos.c > 0) { focusAt(pos.r, pos.c - 1); try { playSound('click'); } catch (e) { } } break;
            case 'right': if (rows[pos.r] && pos.c < rows[pos.r].games.length - 1) { focusAt(pos.r, pos.c + 1); try { playSound('click'); } catch (e) { } } break;
            case 'up': moveR(-1); break;
            case 'down': moveR(1); break;
            case 'a': if (g) openPage(g); break;
            case 'b': case 'start': close(); break;
            case 'x': {
                if (!g) break;
                try { favorites = await api.toggleFavorite(gid(g)); } catch (e) { break; }
                try { playSound('favorite'); } catch (e) { }
                const keep = { gid: gid(g), r: pos.r }; rows = buildRows(); paintRows();
                let r = rows.findIndex(x => x.title === (rows[keep.r] || {}).title); if (r < 0) r = Math.min(keep.r, rows.length - 1);
                const c = Math.max(0, rows[r].games.findIndex(x => gid(x) === keep.gid)); focusAt(r, c);
                break;
            }
            case 'y': if (media && api.mediaControl) api.mediaControl({ action: 'toggle' }); break;
            case 'lb': if (media && api.mediaControl) api.mediaControl({ action: 'prev' }); break;
            case 'rb': if (media && api.mediaControl) api.mediaControl({ action: 'next' }); break;
        }
    }

    // ---------- the game page ----------
    const TABS = [['overview', 'Overview'], ['achievements', 'Achievements'], ['screenshots', 'Screenshots'], ['news', 'News']];
    const STATUS = [['', 'No status'], ['playing', 'Playing'], ['backlog', 'Backlog'], ['completed', 'Completed'], ['dropped', 'Dropped']];
    const plain = (t) => { try { return new DOMParser().parseFromString(String(t || ''), 'text/html').body.textContent || ''; } catch (e) { return ''; } };
    const metaOf = (id) => (typeof gameMetaCache !== 'undefined' && gameMetaCache[id]) || { status: '', rating: 0 };
    const timeAgo = (ms) => { if (!ms) return 'Never'; const d = Math.floor((Date.now() - ms) / 86400000); return d <= 0 ? 'Today' : d === 1 ? 'Yesterday' : d + ' days ago'; };
    const hoursText = (g) => { const h = hours(g); return h >= 1 ? (Math.round(h * 10) / 10) + ' hours' : h > 0 ? Math.round(h * 60) + ' minutes' : 'Not played yet'; };

    function pageButtons() {
        const g = page.g, id = page.id, run = String(currentRunningAppId) === id, inst = isInstalled(g), m = metaOf(id);
        const st = STATUS.find(x => x[0] === (m.status || '')) || STATUS[0];
        const list = [];
        if (page.busy) list.push({ key: 'busy', label: page.busy, sub: page.busy === 'Loading...' ? 'Starting the game' : page.busy === 'Stopping...' ? 'Closing the game' : '', primary: true, cls: page.busy === 'Error' ? 'stop' : 'busy' });
        else list.push({ key: 'play', label: run ? '\u25A0  Stop' : inst ? '\u25B6  Play' : '\u2B07  Install', sub: run ? 'Running now' : inst ? '' : 'Opens the install window in Steam', primary: true, cls: run ? 'stop' : '' });
        list.push({ key: 'fav', label: favorites.includes(id) ? '\u2605  Favorited' : '\u2606  Add to favorites', sub: '' });
        list.push({ key: 'status', label: 'Status: ' + st[1], sub: 'Press A to change' });
        list.push({ key: 'rating', label: 'Rating: ' + (m.rating ? '\u2605'.repeat(m.rating) + '\u2606'.repeat(5 - m.rating) : 'not rated'), sub: 'Press A to change' });
        list.push({ key: 'back', label: '\u2190  Back', sub: '' });
        return list;
    }
    function renderPageButtons() {
        if (!page) return;
        const list = pageButtons(); page.btns = list;
        if (page.btn >= list.length) page.btn = list.length - 1;
        $('cc-pg-btns').innerHTML = list.map((b, i) => '<button class="cc-pg-btn' + (b.primary ? ' primary' : '') + (b.cls ? ' ' + b.cls : '') + (page.zone === 'btn' && i === page.btn ? ' focus' : '') + '" data-i="' + i + '"><span>' + E(b.label) + '</span>' + (b.sub ? '<small>' + E(b.sub) + '</small>' : '') + '</button>').join('');
    }
    function updatePageChip() {
        if (!page) return;
        const g = page.g, id = page.id, run = String(currentRunningAppId) === id, inst = isInstalled(g);
        const chip = $('cc-pg-chip'); chip.className = 'cc-chip ' + (run ? 'run' : inst ? 'ok' : 'no');
        chip.textContent = run ? 'Running now' : inst ? 'Installed' : 'Not installed';
    }
    function renderTabs() {
        $('cc-tabs').innerHTML = TABS.map(t => '<button class="cc-tab' + (page.tab === t[0] ? ' on' : '') + '" data-t="' + t[0] + '">' + t[1] + (page.counts[t[0]] != null ? ' <small>' + page.counts[t[0]] + '</small>' : '') + '</button>').join('');
    }
    function setZone(z) {
        page.zone = z;
        $('cc-page').classList.toggle('panel-focus', z === 'panel');
        renderPageButtons(); paintHints();
    }

    function openPage(g) {
        if (!g) return;
        const id = gid(g);
        mode = 'page';
        page = { g, id, tab: 'overview', zone: 'btn', btn: 0, btns: [], data: {}, counts: {}, token: Date.now() };
        let el = $('cc-page'); if (el) el.remove();
        el = document.createElement('div'); el.id = 'cc-page'; el.className = 'cc-page';
        const img = getGameImage(id);
        el.innerHTML = '<div class="cc-pg-bg" style="background-image:url(\'' + E(img) + '\')"></div><div class="cc-pg-shade"></div>' +
            '<div class="cc-pg-left"><div class="cc-pg-art"><img alt="" src="' + E(img) + '"></div><div class="cc-chip" id="cc-pg-chip"></div><h1>' + E(g.name) + '</h1><div class="cc-pg-sub" id="cc-pg-sub"></div><div class="cc-pg-btns" id="cc-pg-btns"></div></div>' +
            '<div class="cc-pg-right"><div class="cc-tabs" id="cc-tabs"></div><div class="cc-panel" id="cc-panel"><div class="cc-load">Loading...</div></div></div>';
        root.appendChild(el); root.classList.add('page-open');
        el.addEventListener('click', (e) => {
            const b = e.target.closest('.cc-pg-btn'); if (b) { page.btn = +b.dataset.i; setZone('btn'); pageAct('a'); return; }
            const t = e.target.closest('.cc-tab'); if (t) { switchTab(t.dataset.t); }
        });
        void el.offsetWidth; el.classList.add('shown');
        updatePageChip(); renderPageButtons(); renderTabs(); paintHints();
        const lp = lastPlayedMs(g);
        $('cc-pg-sub').textContent = hoursText(g) + '  \u00B7  last played ' + timeAgo(lp).toLowerCase();
        loadTab('overview');
        loadCounts();
        try { playSound('whoosh'); } catch (e) { }
    }
    function closePage(instant) {
        if (!page) return;
        const el = $('cc-page'); page = null; mode = 'rows'; root.classList.remove('page-open');
        if (el) { if (instant) el.remove(); else { el.classList.remove('shown'); setTimeout(() => el.remove(), 300); } }
        paintHero(); paintHints();
    }

    function switchTab(t) {
        if (!page || page.tab === t) return;
        page.tab = t; page.zone = page.zone; renderTabs();
        const pn = $('cc-panel'); pn.scrollTop = 0;
        loadTab(t);
        try { playSound('click'); } catch (e) { }
    }
    const tabShift = (d) => { const i = TABS.findIndex(t => t[0] === page.tab); switchTab(TABS[(i + d + TABS.length) % TABS.length][0]); };

    async function loadCounts() {
        // numbers on the tabs, loaded quietly
        const tok = page.token, id = page.id;
        if (/^\d+$/.test(id) && activeConfig && activeConfig.apiKey) {
            try { const a = await api.getAchievements({ apiKey: activeConfig.apiKey, steamId: activeConfig.steamId, appId: id }); if (page && page.token === tok) { page.data.ach = a || []; page.counts.achievements = (a || []).filter(x => x.achieved).length + '/' + (a || []).length; renderTabs(); if (page.tab === 'achievements') loadTab('achievements'); } } catch (e) { if (page && page.token === tok) page.data.ach = []; }
        }
    }

    async function loadTab(t) {
        const tok = page.token, id = page.id, g = page.g, pn = $('cc-panel');
        const still = () => page && page.token === tok && page.tab === t;
        pn.className = 'cc-panel tab-' + t;
        if (t === 'overview') {
            const ac = achievementCache[id];
            const m = metaOf(id), stLabel = (STATUS.find(x => x[0] === (m.status || '')) || STATUS[0])[1];
            const card = (k, v) => '<div class="cc-fact"><span>' + E(k) + '</span><b>' + E(v) + '</b></div>';
            const base = card('Time played', hoursText(g)) + card('Last played', timeAgo(lastPlayedMs(g))) + card('Achievements', ac && ac.total > 0 ? ac.achieved + ' / ' + ac.total + ' (' + Math.round(ac.achieved / ac.total * 100) + '%)' : 'Not available') + card('Status', stLabel) + card('My rating', m.rating ? '\u2605'.repeat(m.rating) : 'Not rated');
            pn.innerHTML = '<div class="cc-desc" id="cc-desc"></div><div class="cc-facts" id="cc-facts">' + base + '</div>';
            if (!/^\d+$/.test(id)) { $('cc-desc').textContent = 'A game you added yourself.'; return; }
            $('cc-desc').textContent = 'Loading...';
            let info = page.data.store; if (info === undefined) { try { info = await api.couchStoreInfo(id); } catch (e) { info = null; } page.data.store = info; }
            if (!still()) return;
            $('cc-desc').textContent = info && info.desc ? plain(info.desc) : '';
            if (info) {
                $('cc-facts').innerHTML = base + (info.released ? card('Released', info.released) : '') + (info.devs && info.devs.length ? card('Developer', info.devs.join(', ')) : '') + (info.genres && info.genres.length ? card('Genres', info.genres.join(', ')) : '') + (info.score ? card('Metacritic', String(info.score)) : '');
            }
        } else if (t === 'achievements') {
            if (!/^\d+$/.test(id)) { pn.innerHTML = '<div class="cc-load">Achievements are only available for Steam games.</div>'; return; }
            if (!(activeConfig && activeConfig.apiKey)) { pn.innerHTML = '<div class="cc-load">Add your Steam API key in Settings to see achievements.</div>'; return; }
            if (page.data.ach === undefined) { pn.innerHTML = '<div class="cc-load">Loading achievements...</div>'; await loadCounts(); }
            if (!still()) return;
            const list = page.data.ach || [];
            if (!list.length) { pn.innerHTML = '<div class="cc-load">This game has no achievements, or they are private.</div>'; return; }
            const done = list.filter(a => a.achieved).length;
            const sorted = list.slice().sort((a, b) => (b.achieved ? 1 : 0) - (a.achieved ? 1 : 0));
            pn.innerHTML = '<div class="cc-achsum"><b>' + done + ' of ' + list.length + '</b> unlocked<div class="cc-achbar wide"><i style="width:' + Math.round(done / list.length * 100) + '%"></i></div></div><div class="cc-achlist">' +
                sorted.map(a => '<div class="cc-achrow' + (a.achieved ? ' got' : '') + '"><img loading="lazy" alt="" src="' + E(a.icon || '') + '"><div><b>' + E(a.name) + '</b><span>' + E(a.description || (a.achieved ? '' : 'Hidden')) + '</span></div></div>').join('') + '</div>';
        } else if (t === 'screenshots') {
            if (page.data.shots === undefined) {
                pn.innerHTML = '<div class="cc-load">Loading...</div>';
                try { page.data.shots = (await api.getScreenshots({ steamId: activeConfig.steamId, gameId: id })) || []; } catch (e) { page.data.shots = []; }
                page.counts.screenshots = page.data.shots.length; if (page) renderTabs();
            }
            if (!still()) return;
            const sh = page.data.shots;
            pn.innerHTML = sh.length ? '<div class="cc-shots">' + sh.slice(0, 60).map(u => '<img loading="lazy" alt="" src="' + E(u) + '">').join('') + '</div>' : '<div class="cc-load">No screenshots yet. Press F12 in a game to take one.</div>';
        } else if (t === 'news') {
            if (!/^\d+$/.test(id)) { pn.innerHTML = '<div class="cc-load">News is only available for Steam games.</div>'; return; }
            if (page.data.news === undefined) {
                pn.innerHTML = '<div class="cc-load">Loading news...</div>';
                try { page.data.news = (await api.getNews(id)) || []; } catch (e) { page.data.news = []; }
                page.counts.news = page.data.news.length; if (page) renderTabs();
            }
            if (!still()) return;
            const items = page.data.news;
            const clean = (x) => plain(String(x || '').replace(/\[\/?[a-z0-9*=_ "':\/.\-?&;%#]+\]/gi, ' ').replace(/\{STEAM_CLAN_IMAGE\}\S*/g, '')).replace(/\s+/g, ' ').trim();
            pn.innerHTML = items.length ? items.map(n => '<article class="cc-news"><h3>' + E(n.title) + '</h3><small>' + E(new Date((n.date || 0) * 1000).toLocaleDateString()) + '</small><p>' + E(clean(n.contents).slice(0, 380)) + (clean(n.contents).length > 380 ? '...' : '') + '</p></article>').join('') : '<div class="cc-load">No recent news.</div>';
        }
    }

    async function pageAct(name) {
        if (!page) return;
        const id = page.id, g = page.g;
        const scroll = (d) => { const pn = $('cc-panel'); pn.scrollBy({ top: d * Math.max(160, pn.clientHeight * 0.45), behavior: 'smooth' }); };
        switch (name) {
            case 'up': if (page.zone === 'panel') scroll(-1); else if (page.btn > 0) { page.btn--; renderPageButtons(); try { playSound('click'); } catch (e) { } } break;
            case 'down': if (page.zone === 'panel') scroll(1); else if (page.btn < page.btns.length - 1) { page.btn++; renderPageButtons(); try { playSound('click'); } catch (e) { } } break;
            case 'right': if (page.zone === 'btn') setZone('panel'); break;
            case 'left': if (page.zone === 'panel') setZone('btn'); break;
            case 'lb': tabShift(-1); break;
            case 'rb': tabShift(1); break;
            case 'b': if (page.zone === 'panel') setZone('btn'); else closePage(); break;
            case 'start': close(); break;
            case 'x': await togglePageFav(); break;
            case 'y': if (media && api.mediaControl) api.mediaControl({ action: 'toggle' }); break;
            case 'a': {
                if (page.zone === 'panel') break;
                const b = page.btns[page.btn]; if (!b) break;
                if (b.key === 'busy') break;
                if (b.key === 'play') {
                    if (String(currentRunningAppId) === id) { try { playSound('click'); } catch (e) { } stopFlow(g); }
                    else if (!isInstalled(g)) { try { api.installGame(id); toast('Install started in Steam: ' + g.name); } catch (e) { } }
                    else if (currentRunningAppId) toast('Close ' + (currentRunningGameName || 'the running game') + ' first.');
                    else { try { playSound('click'); } catch (e) { } launchFlow(g); }
                } else if (b.key === 'fav') await togglePageFav();
                else if (b.key === 'status') {
                    const cur = (metaOf(id).status || ''), i = STATUS.findIndex(x => x[0] === cur), nx = STATUS[(i + 1) % STATUS.length][0];
                    try { const all = await api.setGameMeta({ appId: id, status: nx }); if (all) gameMetaCache = all; } catch (e) { }
                    renderPageButtons(); if (page && page.tab === 'overview') loadTab('overview'); try { playSound('click'); } catch (e) { }
                } else if (b.key === 'rating') {
                    const nx = ((metaOf(id).rating || 0) + 1) % 6;
                    try { const all = await api.setGameMeta({ appId: id, rating: nx }); if (all) gameMetaCache = all; } catch (e) { }
                    renderPageButtons(); if (page && page.tab === 'overview') loadTab('overview'); try { playSound('click'); } catch (e) { }
                } else if (b.key === 'back') closePage();
                break;
            }
        }
    }
    async function togglePageFav() {
        if (!page) return;
        try { favorites = await api.toggleFavorite(page.id); } catch (e) { return; }
        try { playSound('favorite'); } catch (e) { }
        renderPageButtons(); paintHints();
        const keep = { gid: page.id, title: (rows[pos.r] || {}).title }; rows = buildRows(); paintRows();
        let r = rows.findIndex(x => x.title === keep.title); if (r < 0) r = 0;
        const c = Math.max(0, rows[r].games.findIndex(x => gid(x) === keep.gid)); pos = { r, c }; focusAt(r, c);
    }

    // ---------- input ----------
    const KEYS = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', Enter: 'a', ' ': 'a', Escape: 'b', Backspace: 'b', f: 'x', F: 'x', m: 'y', M: 'y', '[': 'lb', ']': 'rb', d: 'drops', D: 'drops' };
    function onKey(e) {
        if (!isOpen) return;
        const n = KEYS[e.key]; if (!n) return;
        e.preventDefault(); e.stopPropagation(); act(n);
    }
    function poll() {
        if (!isOpen) return;
        const pads = (navigator.getGamepads && navigator.getGamepads()) || [], p = [...pads].find(x => x && x.connected);
        if (p) {
            const now = performance.now(), b = p.buttons.map(x => !!x.pressed), ax = p.axes;
            const dirs = { up: b[12] || ax[1] < -0.55, down: b[13] || ax[1] > 0.55, left: b[14] || ax[0] < -0.55, right: b[15] || ax[0] > 0.55 };
            Object.keys(dirs).forEach(k => { if (dirs[k]) { if (!nextAt[k] || now >= nextAt[k]) { act(k); nextAt[k] = now + (nextAt[k] ? 125 : 340); } } else nextAt[k] = 0; });
            const edge = (i, n) => { if (b[i] && !prevBtn[i]) act(n); };
            const M = getMap(); Object.keys(M).forEach(n => edge(M[n], n));
            prevBtn = b;
        }
        if (!root.classList.contains('nocursor') && Date.now() - lastMove > 2500) root.classList.add('nocursor');
        raf = requestAnimationFrame(poll);
    }

    // ---------- open / close ----------
    // Opening: the app steps back (scales down and blurs) while the couch screen zooms in and its parts rise one after another;
    // the window goes fullscreen underneath the fade. Leaving runs the same thing backwards.
    let leaveTimer = 0, enterTimer = 0;
    async function open() {
        if (isOpen) return;
        clearTimeout(leaveTimer);
        if (!root) build();
        rows = buildRows(); memCol = [];
        isOpen = true; window.SLCouchOpen = true;
        $('cc-empty').style.display = rows.length ? 'none' : '';
        paintRows(); paintTop(); dropChip();
        document.body.classList.remove('couch-leaving');
        document.body.classList.add('couch-entering');
        root.classList.remove('shown'); root.classList.add('on', 'entering'); void root.offsetWidth; root.classList.add('shown');
        pos = { r: 0, c: 0 };
        // start on the game that is running, otherwise the first one
        if (currentRunningAppId) rows.some((row, r) => row.games.some((g, c) => { if (gid(g) === String(currentRunningAppId)) { pos = { r, c }; return true; } return false; }));
        focusAt(pos.r, pos.c); paintRunning();
        // buttons already held when it opened must not count
        const pads = (navigator.getGamepads && navigator.getGamepads()) || [], p = [...pads].find(x => x && x.connected);
        prevBtn = p ? p.buttons.map(x => !!x.pressed) : {}; nextAt = {};
        lastMove = Date.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(poll);
        try { playSound('whoosh'); } catch (e) { }
        // fullscreen while the screen fades in; the layout is measured again once the window has its new size
        try { const r = await api.windowFullscreen(true); wasFullscreen = !!(r && r.was); } catch (e) { }
        clearTimeout(enterTimer);
        enterTimer = setTimeout(() => {
            if (!isOpen) return;
            document.body.classList.add('couch-open'); document.body.classList.remove('couch-entering'); root.classList.remove('entering');
            focusAt(pos.r, pos.c);
        }, 900);
    }
    function close() {
        if (!isOpen) return;
        closePage(true); dropsOpen = false; const dp = $('cc-drops'); if (dp) dp.classList.remove('on');
        isOpen = false; window.SLCouchOpen = false; cancelAnimationFrame(raf); clearTimeout(enterTimer);
        // the app comes back from behind the fading couch screen
        document.body.classList.remove('couch-open', 'couch-entering'); document.body.classList.add('couch-leaving');
        root.classList.remove('shown', 'entering');
        if (!wasFullscreen) { try { api.windowFullscreen(false); } catch (e) { } }
        try { playSound('close'); } catch (e) { }
        clearTimeout(leaveTimer);
        leaveTimer = setTimeout(() => { if (!isOpen) { root.classList.remove('on'); document.body.classList.remove('couch-leaving'); } }, 650);
    }
    window.addEventListener('resize', () => { if (isOpen) { clearTimeout(open._rt); open._rt = setTimeout(() => focusAt(pos.r, pos.c), 120); } });

    document.addEventListener('keydown', onKey, true);
    if (api.onGameStatusChange) api.onGameStatusChange(() => { if (isOpen) setTimeout(paintRunning, 150); });
    if (api.onMedia) api.onMedia((d) => { media = d && d.title ? d : null; if (isOpen) { paintTop(); paintHints(); } });
    if (api.mediaGet) api.mediaGet().then(r => { if (r && r.latest && r.latest.title) media = r.latest; }).catch(() => { });

    // ---------- entry points ----------
    const bar = document.querySelector('.top-bar-actions');
    if (bar) {
        const btn = document.createElement('button');
        btn.id = 'couch-btn'; btn.className = 'top-bar-icon-btn'; btn.title = 'Couch mode (Ctrl+Shift+G)';
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 10v5M4.5 12.5h5"/><circle cx="15.5" cy="11.5" r="0.8" fill="currentColor"/><circle cx="18" cy="14" r="0.8" fill="currentColor"/></svg>';
        btn.addEventListener('click', open);
        const first = bar.querySelector('.top-bar-icon-btn');
        bar.insertBefore(btn, first || null);
    }
    document.addEventListener('keydown', (e) => { if (e.ctrlKey && e.shiftKey && (e.key === 'G' || e.key === 'g') && !isOpen) { e.preventDefault(); open(); } });
    setTimeout(() => { if (window.SLF && SLF.addCmd) SLF.addCmd('Couch mode (fullscreen, controller)', '🎮', open); }, 1500);
    // optional: start in couch mode, or open when a controller connects
    let autoDone = false;
    window.addEventListener('gamepadconnected', () => { if (!autoDone && !isOpen && pref('pad', false) && installedGames.length) { autoDone = true; open(); } });
    if (pref('start', false)) { let tries = 0; const t = setInterval(() => { if (installedGames.length || ++tries > 40) { clearInterval(t); if (installedGames.length && !isOpen) { autoDone = true; open(); } } }, 500); }

    // ---------- settings (Behaviour): apply instantly ----------
    const anchor = $('md-group') || $('dc-group') || ($('discord-rpc-input') && $('discord-rpc-input').closest('.switch-row'));
    if (anchor) {
        const hint = 'display:block;margin-top:2px;color:var(--text-tertiary);font-size:11px;font-weight:400;text-transform:none;letter-spacing:0;';
        const box = document.createElement('div'); box.className = 'form-group'; box.id = 'cm-group'; box.style.marginTop = '4px';
        box.innerHTML = '<label class="form-label">Couch mode</label>' +
            '<div class="switch-row" data-instant="1"><span class="form-label">Start SteamLite in couch mode<span style="' + hint + '">Open straight into the fullscreen launcher</span></span><label class="switch-toggle"><input type="checkbox" id="cm-start" data-instant="1"><span class="switch-slider"></span></label></div>' +
            '<div class="switch-row" data-instant="1"><span class="form-label">Open couch mode when a controller connects<span style="' + hint + '">Plug in or switch on a gamepad and the launcher opens</span></span><label class="switch-toggle"><input type="checkbox" id="cm-pad" data-instant="1"><span class="switch-slider"></span></label></div>' +
            '<div class="switch-row" data-instant="1"><span class="form-label">Open couch mode now<span style="' + hint + '">Ctrl+Shift+G, or the controller button in the top bar. B or Start leaves.</span></span><button class="context-btn" id="cm-open" data-instant="1" style="min-width:90px">Open</button></div>';
        const lbl = { a: 'Open / select', b: 'Back', x: 'Favorite', y: 'Play / pause music', lb: 'Previous (track or tab)', rb: 'Next (track or tab)', drops: 'Drops panel', start: 'Exit couch mode' };
        box.insertAdjacentHTML('beforeend', '<div class="switch-row" data-instant="1" style="flex-direction:column;align-items:stretch;gap:6px"><span class="form-label">Controller buttons<span style="' + hint + '">Choose which button does what. The hints in couch mode follow your choice.</span></span>' +
            Object.keys(lbl).map(k => '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><span style="font-size:12.5px">' + lbl[k] + '</span><select class="form-input cm-map" data-k="' + k + '" data-instant="1" style="width:auto;min-width:84px">' + BTN_NAMES.map((n, i) => '<option value="' + i + '">' + n + '</option>').join('') + '</select></div>').join('') +
            '<button class="context-btn" id="cm-map-reset" data-instant="1" style="align-self:flex-start;margin-top:4px">Reset buttons</button></div>');
        anchor.insertAdjacentElement('afterend', box);
        const loadMap = () => { const m = getMap(); box.querySelectorAll('.cm-map').forEach(sel => { sel.value = String(m[sel.dataset.k]); }); };
        box.addEventListener('change', (e) => { const sel = e.target.closest('.cm-map'); if (!sel) return; const m = getMap(); m[sel.dataset.k] = Number(sel.value); try { localStorage.setItem('sl_couch_map', JSON.stringify(m)); } catch (er) { } });
        box.querySelector('#cm-map-reset').addEventListener('click', () => { try { localStorage.removeItem('sl_couch_map'); } catch (e) { } loadMap(); });
        const load = () => { loadMap(); $('cm-start').checked = pref('start', false); $('cm-pad').checked = pref('pad', false); };
        $('cm-start').addEventListener('change', (e) => setPref('start', e.target.checked));
        $('cm-pad').addEventListener('change', (e) => setPref('pad', e.target.checked));
        $('cm-open').addEventListener('click', () => open());
        const adv = $('advanced-toggle'); if (adv) adv.addEventListener('click', () => setTimeout(load, 250)); load();
    }
    window.SLCouch = { open, close, _busy: (l) => setBusy(l) };
})();
