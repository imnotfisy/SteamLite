// SteamLite 9.1.0 - library extras: smart collections with your own rules, game tags (and a tag filter), links and folders
// on every game, a bigger wishlist price chart, and the little notices around playing (pre-launch check, hour milestones,
// a note after a long session, saved data when offline).
(function () {
    'use strict';
    if (!window.SLF || !window.electronAPI) return;
    const SLF = window.SLF, $ = (id) => document.getElementById(id), E = SLF.E, feat = SLF.feat, api = window.electronAPI;
    const SLX = window.SLX = window.SLX || {};
    const css = document.createElement('style');
    css.textContent = `
    .sr-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 8px 0; } .sr-row label { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--text-secondary); } .sr-row .fx-input, .sr-row .fx-select { width: 100%; box-sizing: border-box; }
    .sr-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 14px; background: var(--bg-glass); border: 1px solid var(--border-glass); margin-bottom: 8px; } .sr-item .fx-grow { flex: 1; min-width: 0; }
    .tg-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 6px 4px 12px; border-radius: 999px; background: color-mix(in srgb, var(--accent-color) 18%, transparent); border: 1px solid color-mix(in srgb, var(--accent-color) 40%, transparent); font-size: 12.5px; font-weight: 600; margin: 0 6px 6px 0; }
    .tg-chip button { border: 0; background: transparent; color: inherit; cursor: pointer; padding: 0 6px; font-size: 14px; }
    .tg-filter { display: flex; flex-wrap: wrap; gap: 6px; } .tg-filter .fx-chip { padding: 3px 11px; font-size: 12px; }
    .gl-item { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 12px; background: var(--bg-glass); border: 1px solid var(--border-glass); margin-top: 6px; font-size: 13px; } .gl-item .fx-grow { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .wl-chart { width: 100%; height: 220px; display: block; }
    `;
    document.head.appendChild(css);
    const gid = (g) => SLF.gid(g);

    // ================= smart collections =================
    // rules: installed (any/yes/no), hours min/max, played within N days, not played for N days, favourite, status, tag, name contains
    const getRules = () => getUiPref('smartRules', []);
    const lastPlayed = (g) => (typeof lastPlayedMs === 'function' ? lastPlayedMs(g) : 0);
    function matches(g, r) {
        const id = gid(g), hrs = getPlaytimeSeconds(g) / 3600, lp = lastPlayed(g), day = 86400000, installed = installedGames.some(x => gid(x) === id);
        if (r.installed === 'yes' && !installed) return false; if (r.installed === 'no' && installed) return false;
        if (r.minHours !== '' && r.minHours != null && hrs < Number(r.minHours)) return false; if (r.maxHours !== '' && r.maxHours != null && hrs > Number(r.maxHours)) return false;
        if (r.withinDays && !(lp >= Date.now() - Number(r.withinDays) * day)) return false;
        if (r.idleDays && lp && lp > Date.now() - Number(r.idleDays) * day) return false; // not played for N days (never played counts)
        if (r.favorite === 'yes' && !favorites.includes(id)) return false;
        if (r.status && ((gameMetaCache[id] || {}).status !== r.status)) return false;
        if (r.tag && !(tagsOf(id).includes(r.tag))) return false;
        if (r.name && !String(g.name).toLowerCase().includes(String(r.name).toLowerCase())) return false;
        return true;
    }
    function syncSmart() {
        for (let i = SMART_COLLECTIONS.length - 1; i >= 0; i--) if (String(SMART_COLLECTIONS[i].id).startsWith('smart:rule:')) SMART_COLLECTIONS.splice(i, 1);
        getRules().forEach(r => SMART_COLLECTIONS.push({ id: 'smart:rule:' + r.id, name: r.name, icon: '\u2728' }));
        try { renderCollections(); } catch (e) { }
    }
    const origSmart = window.smartGameIds;
    window.smartGameIds = function (id) {
        if (String(id).startsWith('smart:rule:')) {
            const r = getRules().find(x => 'smart:rule:' + x.id === id); if (!r) return [];
            return [...installedGames, ...uninstalledGames].filter(g => !g.isShared && !hiddenGames.includes(gameKey(g)) && matches(g, r.rules || {})).map(gameKey);
        }
        return origSmart.apply(this, arguments);
    };
    async function openSmart(editId) {
        const m = SLF.modal('smart-modal', 'Smart collections', { cls: 'wide', sub: 'Collections that fill themselves from rules and update as you play. They appear in the sidebar.' });
        const list = getRules(), cur = editId ? list.find(x => x.id === editId) : null, tags = allTags();
        const f = Object.assign({ name: '', installed: '', minHours: '', maxHours: '', withinDays: '', idleDays: '', favorite: '', status: '', tag: '', name2: '' }, cur ? Object.assign({}, cur.rules, { name: cur.name, name2: (cur.rules || {}).name }) : {});
        m.body.innerHTML = '<div class="fx-section">Your smart collections</div>' + (list.length ? list.map(r => '<div class="sr-item"><div class="fx-grow"><div class="fx-name">' + E(r.name) + '</div><div class="fx-meta">' + smartGameIdsCount(r) + ' games</div></div><button class="fx-btn" data-e="' + E(r.id) + '">Edit</button><button class="fx-btn danger" data-d="' + E(r.id) + '">Delete</button></div>').join('') : '<div class="fx-empty">None yet. Make one below.</div>') +
            '<div class="fx-section">' + (cur ? 'Edit "' + E(cur.name) + '"' : 'New smart collection') + '</div>' +
            '<div class="sr-row"><label>Name<input class="fx-input" id="sr-name" value="' + E(f.name) + '" placeholder="Short and sweet"></label><label>Game name contains<input class="fx-input" id="sr-name2" value="' + E(f.name2 || '') + '"></label></div>' +
            '<div class="sr-row"><label>Installed<select class="fx-select" id="sr-inst"><option value="">Any</option><option value="yes">Installed</option><option value="no">Not installed</option></select></label><label>Favorite<select class="fx-select" id="sr-fav"><option value="">Any</option><option value="yes">Favorites only</option></select></label></div>' +
            '<div class="sr-row"><label>At least (hours played)<input class="fx-input" id="sr-min" type="number" min="0" value="' + E(f.minHours) + '"></label><label>At most (hours played)<input class="fx-input" id="sr-max" type="number" min="0" value="' + E(f.maxHours) + '"></label></div>' +
            '<div class="sr-row"><label>Played in the last N days<input class="fx-input" id="sr-within" type="number" min="0" value="' + E(f.withinDays) + '"></label><label>Not played for N days<input class="fx-input" id="sr-idle" type="number" min="0" value="' + E(f.idleDays) + '"></label></div>' +
            '<div class="sr-row"><label>My status<select class="fx-select" id="sr-status"><option value="">Any</option><option value="playing">Playing</option><option value="backlog">Backlog</option><option value="completed">Completed</option><option value="dropped">Dropped</option></select></label><label>Tag<select class="fx-select" id="sr-tag"><option value="">Any</option>' + tags.map(t => '<option>' + E(t) + '</option>').join('') + '</select></label></div>' +
            '<div class="fx-row"><button class="fx-btn primary" id="sr-save">' + (cur ? 'Save changes' : 'Create') + '</button>' + (cur ? '<button class="fx-btn" id="sr-new">New instead</button>' : '') + '</div>';
        $('sr-inst').value = f.installed || ''; $('sr-fav').value = f.favorite || ''; $('sr-status').value = f.status || ''; $('sr-tag').value = f.tag || '';
        m.open();
        m.body.onclick = async (e) => {
            const ed = e.target.closest('[data-e]'), de = e.target.closest('[data-d]');
            if (ed) { openSmart(ed.dataset.e); return; }
            if (de) { await setUiPref({ smartRules: getRules().filter(x => x.id !== de.dataset.d) }); syncSmart(); openSmart(); return; }
            if (e.target.id === 'sr-new') { openSmart(); return; }
            if (e.target.id === 'sr-save') {
                const name = $('sr-name').value.trim(); if (!name) { showToast('Give it a name first.'); return; }
                const rules = { installed: $('sr-inst').value, favorite: $('sr-fav').value, minHours: $('sr-min').value, maxHours: $('sr-max').value, withinDays: $('sr-within').value, idleDays: $('sr-idle').value, status: $('sr-status').value, tag: $('sr-tag').value, name: $('sr-name2').value.trim() };
                const all = getRules(); if (cur) { const r = all.find(x => x.id === cur.id); r.name = name; r.rules = rules; } else all.push({ id: 'r' + Date.now().toString(36), name, rules });
                await setUiPref({ smartRules: all }); syncSmart(); playSound('success'); showToast('Smart collection saved.'); openSmart();
            }
        };
    }
    function smartGameIdsCount(r) { return [...installedGames, ...uninstalledGames].filter(g => !g.isShared && matches(g, r.rules || {})).length; }

    // ================= tags =================
    const tagMap = () => getUiPref('gameTags', {});
    const tagsOf = (id) => tagMap()[id] || [];
    const allTags = () => [...new Set(Object.values(tagMap()).flat())].sort((a, b) => a.localeCompare(b));
    let activeTags = [];
    SLX.activeTags = () => activeTags;
    SLX.hasTags = (g, tags) => { const have = tagsOf(gid(g)); return tags.every(t => have.includes(t)); };
    function paintTagFilter() {
        const dd = $('filters-dropdown'); if (!dd) return;
        let box = $('tag-filter-box');
        if (!box) { box = document.createElement('div'); box.id = 'tag-filter-box'; const sep = dd.querySelectorAll('.filters-dropdown-sep')[1]; dd.insertBefore(box, sep || null); }
        const tags = allTags();
        box.innerHTML = tags.length ? '<div class="filters-dropdown-sep"></div><div class="filters-dropdown-title">Tags</div><div class="tg-filter">' + tags.map(t => '<button type="button" class="fx-chip' + (activeTags.includes(t) ? ' active' : '') + '" data-t="' + E(t) + '">' + E(t) + '</button>').join('') + '</div>' : '';
    }
    document.addEventListener('click', (e) => {
        const b = e.target.closest('#tag-filter-box [data-t]'); if (!b) return;
        const t = b.dataset.t; activeTags = activeTags.includes(t) ? activeTags.filter(x => x !== t) : [...activeTags, t]; paintTagFilter(); try { renderLibrary(); } catch (er) { }
    });
    const ftb = $('filters-toggle-btn'); if (ftb) ftb.addEventListener('click', () => setTimeout(paintTagFilter, 30));
    function openTags(game) {
        const id = gid(game), m = SLF.modal('tags-modal', 'Tags', { cls: 'narrow', sub: String(game.name) });
        const paint = () => { const cur = tagsOf(id), sug = allTags().filter(t => !cur.includes(t));
            m.body.innerHTML = '<div id="tg-cur">' + (cur.length ? cur.map(t => '<span class="tg-chip">' + E(t) + '<button data-r="' + E(t) + '" aria-label="Remove">\u2715</button></span>').join('') : '<span class="fx-meta">No tags yet.</span>') + '</div>' +
                '<div class="fx-row"><input class="fx-input" id="tg-in" maxlength="24" placeholder="co-op, chill, backlog..." style="flex:1"><button class="fx-btn primary" id="tg-add">Add</button></div>' +
                (sug.length ? '<div class="fx-section">Your other tags</div><div>' + sug.map(t => '<button class="fx-chip" data-a="' + E(t) + '">' + E(t) + '</button>').join(' ') + '</div>' : ''); };
        const add = async (t) => { t = String(t || '').trim().slice(0, 24); if (!t) return; const all = tagMap(), cur = all[id] || []; if (!cur.includes(t)) { all[id] = [...cur, t]; await setUiPref({ gameTags: all }); } paint(); paintTagFilter(); };
        m.body.onclick = async (e) => {
            const r = e.target.closest('[data-r]'), a = e.target.closest('[data-a]');
            if (r) { const all = tagMap(); all[id] = (all[id] || []).filter(x => x !== r.dataset.r); if (!all[id].length) delete all[id]; await setUiPref({ gameTags: all }); paint(); paintTagFilter(); try { renderLibrary(); } catch (er) { } }
            else if (a) add(a.dataset.a); else if (e.target.id === 'tg-add') { add($('tg-in').value); $('tg-in').value = ''; }
        };
        m.body.onkeydown = (e) => { if (e.key === 'Enter' && e.target.id === 'tg-in') { add(e.target.value); e.target.value = ''; } };
        paint(); m.open(); setTimeout(() => { const i = $('tg-in'); if (i) i.focus(); }, 80);
    }
    const origCtx = window.showContextMenu;
    window.showContextMenu = function (x, y, game, isInstalled) {
        const r = origCtx.apply(this, arguments);
        try {
            const menu = $('context-menu'); menu.insertAdjacentHTML('beforeend', '<div class="ctx-separator"></div><div class="ctx-item" data-slx="tags">Tags' + (tagsOf(gid(game)).length ? ' (' + tagsOf(gid(game)).length + ')' : '') + '...</div>');
            menu.querySelector('[data-slx="tags"]').addEventListener('click', () => { hideContextMenu(); openTags(game); });
            const rect = menu.getBoundingClientRect(); if (rect.bottom > window.innerHeight) menu.style.top = Math.max(8, window.innerHeight - rect.height - 8) + 'px';
        } catch (e) { }
        return r;
    };

    // ================= links and folders on every game =================
    const linksOf = (id) => (getUiPref('gameLinks', {})[id] || []);
    const gm = $('game-modal-content');
    function injectLinks() {
        const box = gm && gm.querySelector('#slf-extras'); if (!box || box.querySelector('#slx-links')) return;
        const title = gm.querySelector('.modal-title, h1, .game-modal-title'); const idHost = gm.querySelector('#tab-details');
        const idm = /(\d+)/.exec((idHost && idHost.dataset.slf) || ''); const id = idHost && idHost.dataset.slf; if (!id) return;
        const sec = document.createElement('div'); sec.id = 'slx-links';
        const paint = () => { const l = linksOf(id); sec.querySelector('#slx-list').innerHTML = l.map((x, i) => '<div class="gl-item"><div class="fx-grow" title="' + E(x.url) + '"><b>' + E(x.title || x.url) + '</b></div><button class="fx-btn" data-o="' + i + '">Open</button><button class="fx-btn danger" data-x="' + i + '">\u2715</button></div>').join('') || '<div class="fx-meta">Add a guide, a mod page or a save-game folder.</div>'; };
        sec.innerHTML = '<div class="section-title" style="font-size:14px;margin-top:18px">Links & folders</div><div id="slx-list"></div><div class="fx-row"><input class="fx-input" id="slx-title" placeholder="Name (optional)" style="width:140px"><input class="fx-input" id="slx-url" placeholder="https://... or C:\\\\path\\\\to\\\\folder" style="flex:1;min-width:160px"><button class="fx-btn" id="slx-add">Add</button></div>';
        const jr = box.querySelector('#slf-journal'); box.insertBefore(sec, jr ? jr.previousElementSibling || jr : null);
        paint();
        sec.onclick = async (e) => {
            const o = e.target.closest('[data-o]'), x = e.target.closest('[data-x]'), l = linksOf(id).slice();
            if (o) { const it = l[+o.dataset.o]; if (/^https?:\/\//i.test(it.url)) api.openExternal(it.url); else { const r = await feat('openPath', { path: it.url }); if (r && !r.ok) showToast(r.error); } }
            else if (x) { l.splice(+x.dataset.x, 1); await setUiPref({ gameLinks: { ...getUiPref('gameLinks', {}), [id]: l } }); paint(); }
            else if (e.target.id === 'slx-add') { const url = $('slx-url').value.trim(); if (!url) return; if (!/^(https?:\/\/|[A-Za-z]:\\|\\\\)/.test(url)) { showToast('Use a web address (https://...) or a full folder path.'); return; } l.push({ title: $('slx-title').value.trim(), url }); await setUiPref({ gameLinks: { ...getUiPref('gameLinks', {}), [id]: l } }); $('slx-url').value = ''; $('slx-title').value = ''; paint(); }
        };
    }
    if (gm) new MutationObserver(() => injectLinks()).observe(gm, { childList: true, subtree: true });

    // ================= a bigger wishlist price chart =================
    const wb = $('wishlist-body');
    if (wb) wb.addEventListener('click', async (e) => {
        const sv = e.target.closest('.wl-extra svg'); if (!sv) return; e.stopPropagation();
        const item = sv.closest('.wl-item'); const id = item && item.dataset.appid; if (!id) return;
        const meta = await feat('wishlistMeta'), hist = ((meta && meta.history) || {})[id] || []; if (hist.length < 2) return;
        const name = (item.querySelector('.wl-name') || {}).textContent || 'Price history', m = SLF.modal('wlchart-modal', name, { sub: 'Prices SteamLite has seen for this game.' });
        const vs = hist.map(h => h.c), mn = Math.min(...vs), mx = Math.max(...vs), W = 620, H = 220, pad = 34, span = Math.max(1, mx - mn);
        const t0 = hist[0].t, t1 = hist[hist.length - 1].t, X = (t) => pad + (t1 === t0 ? 0 : (t - t0) / (t1 - t0)) * (W - pad * 2), Y = (v) => H - pad - ((v - mn) / span) * (H - pad * 2);
        const fmt = (c) => (c / 100).toFixed(2);
        const pts = hist.map(h => X(h.t) + ',' + Y(h.c)).join(' ');
        m.body.innerHTML = '<svg class="wl-chart" viewBox="0 0 ' + W + ' ' + H + '"><line x1="' + pad + '" y1="' + Y(mn) + '" x2="' + (W - pad) + '" y2="' + Y(mn) + '" stroke="rgba(255,255,255,.15)"/><line x1="' + pad + '" y1="' + Y(mx) + '" x2="' + (W - pad) + '" y2="' + Y(mx) + '" stroke="rgba(255,255,255,.15)"/>' +
            '<polyline fill="none" stroke="var(--accent-color)" stroke-width="2.5" stroke-linejoin="round" points="' + pts + '"/>' + hist.map(h => '<circle cx="' + X(h.t) + '" cy="' + Y(h.c) + '" r="3.5" fill="var(--accent-color)"><title>' + new Date(h.t).toLocaleDateString() + ': ' + fmt(h.c) + '</title></circle>').join('') +
            '<text x="6" y="' + (Y(mx) + 4) + '" fill="#aaa" font-size="11">' + fmt(mx) + '</text><text x="6" y="' + (Y(mn) + 4) + '" fill="#aaa" font-size="11">' + fmt(mn) + '</text></svg>' +
            '<div class="fx-kv"><div><b>' + fmt(mn) + '</b><span>lowest seen</span></div><div><b>' + fmt(mx) + '</b><span>highest seen</span></div><div><b>' + fmt(vs[vs.length - 1]) + '</b><span>latest</span></div><div><b>' + hist.length + '</b><span>price changes</span></div></div>';
        m.open();
    }, true);

    // ================= notices around playing =================
    api.onFeat && api.onFeat('preflightWarn', (d) => showToast('Heads up before ' + (d.name || 'the game') + ' starts: ' + d.warn.join(' '), null, { duration: 9000 }));
    api.onFeat && api.onFeat('milestone', (d) => { showToast(d.hours + ' hours in ' + d.name + '!', () => { }, { sound: 'achievement' }); });
    api.onFeat && api.onFeat('offlineData', () => showToast('You are offline: showing the data SteamLite saved last time.'));
    const runStart = {}; // note prompt after a long session
    if (api.onGameStatusChange) api.onGameStatusChange((d) => {
        if (!d || !d.appId) return;
        if (d.status === 'running') { runStart[d.appId] = Date.now(); return; }
        if (d.status !== 'stopped' || !runStart[d.appId] || getUiPref('sessionNotes', true) === false) return;
        const mins = Math.round((Date.now() - runStart[d.appId]) / 60000); delete runStart[d.appId];
        if (mins < 20) return;
        const g = SLF.gameById(d.appId), name = g ? g.name : 'that game';
        setTimeout(() => showToast('Played ' + name + ' for ' + (mins >= 60 ? Math.floor(mins / 60) + 'h ' + (mins % 60) + 'm' : mins + ' min') + '. Click to add a note.', async () => {
            const t = await showPrompt('Note for ' + name, 'What happened this session? (a goal, a boss, a tip)', '');
            if (t && t.trim()) { const r = await feat('journalAdd', { appId: String(d.appId), text: t.trim() }); if (r) showToast('Note saved to the game journal.'); }
        }, { duration: 12000 }), 1500);
    });

    SLF.safe('library-extras', () => {
        SLF.addTile('Library', '\u2728', 'Smart collections', 'Collections that fill themselves from rules like "unplayed and under 5 hours".', () => openSmart());
        syncSmart();
    });
    SLX.openSmart = openSmart; SLX.openTags = openTags;
})();
