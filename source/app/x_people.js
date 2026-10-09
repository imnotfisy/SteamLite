// SteamLite 9.2.4 - the people side of SteamLite Online: who is online and what they play, profiles, shared game lists with Buy buttons,
// the game picker used for sharing, and friend challenges. Full edition only (it builds on Messages).
(function () {
    'use strict';
    if (!window.SLF || !window.electronAPI) return;
    const SLF = window.SLF, api = window.electronAPI, E = SLF.E, feat = SLF.feat, $ = (id) => document.getElementById(id);
    const soc = (op, p) => feat('soc', Object.assign({ op }, p || {}));
    const toast = (m) => { try { showToast(m, null, { force: true }); } catch (e) { } };
    const err = (r, d) => (r && r.error && r.error !== 'offline' ? r.error : (r && r.error === 'offline' ? 'Could not reach SteamLite Online.' : d || 'Something went wrong.'));
    const vt = (u, n) => (u && u.verified && window.SLVerified ? window.SLVerified(n || 15, u.owner) : '');
    const initial = (n) => (String(n || '?').trim()[0] || '?').toUpperCase();
    const av = (u, size, cls) => '<span class="xp-av ' + (cls || '') + '" style="width:' + size + 'px;height:' + size + 'px;font-size:' + Math.round(size * 0.4) + 'px">' + E(initial(u.name)) + (u.avatar ? '<img src="' + E(u.avatar) + '" alt="" onerror="this.remove()">' : '') + '</span>';
    const fmt = (n) => Number(n || 0).toLocaleString('en-US');
    const storeUrl = (id) => 'https://store.steampowered.com/app/' + String(id).replace(/[^0-9]/g, '') + '/';
    const cover = (id) => 'steamlite://cache/' + String(id).replace(/[^0-9]/g, '');
    const gid = (g) => String(g.appid || g.id || '');
    const lib = () => (SLF.allGames ? SLF.allGames() : []).filter(g => !g.isNonSteam && /^\d+$/.test(gid(g)));
    const owned = (appid) => lib().find(g => gid(g) === String(appid));
    const hoursOf = (g) => { try { return Math.round(getPlaytimeSeconds(g) / 3600); } catch (e) { return 0; } };
    const open = (u) => { try { api.openExternal(u); } catch (e) { } };

    const css = document.createElement('style');
    css.textContent = `
    .xp-ov { position: fixed; inset: 0; z-index: 9400; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(0, 0, 0, .5); backdrop-filter: blur(6px); animation: xpFade .2s ease both; } @keyframes xpFade { from { opacity: 0; } to { opacity: 1; } }
    .xp-card { position: relative; width: min(var(--w, 560px), 96vw); max-height: min(var(--h, 720px), 92vh); display: flex; flex-direction: column; border-radius: 26px; background: var(--bg-dark, #111); border: 1px solid var(--border-glass); box-shadow: 0 40px 100px rgba(0, 0, 0, .6); color: var(--text-primary); overflow: hidden; animation: xpUp .3s cubic-bezier(.2, 1.15, .3, 1) both; } @keyframes xpUp { from { opacity: 0; transform: translateY(14px) scale(.97); } to { opacity: 1; transform: none; } }
    .xp-head { display: flex; align-items: center; gap: 12px; padding: 18px 20px 10px; } .xp-head h3 { margin: 0; flex: 1; font-size: 18px; font-weight: 800; } .xp-x { width: 34px; height: 34px; border-radius: 11px; border: 1px solid var(--border-glass); background: var(--bg-glass); color: var(--text-secondary); cursor: pointer; font-size: 14px; } .xp-x:hover { color: #fff; border-color: var(--accent-color); }
    .xp-body { flex: 1; overflow-y: auto; padding: 4px 20px 20px; min-height: 0; } .xp-foot { display: flex; gap: 8px; align-items: center; padding: 12px 20px; border-top: 1px solid var(--border-glass); } .xp-foot .grow { flex: 1; font-size: 12px; color: var(--text-secondary); }
    .xp-btn { padding: 9px 16px; border-radius: 12px; border: 1px solid var(--border-glass); background: var(--bg-glass); color: var(--text-primary); font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; transition: transform .15s, border-color .15s; } .xp-btn:hover:not(:disabled) { border-color: var(--accent-color); transform: translateY(-1px); } .xp-btn.pri { background: var(--accent-color); border-color: var(--accent-color); color: #fff; } .xp-btn.buy { background: linear-gradient(135deg, #22c55e, #16a34a); border-color: #16a34a; color: #fff; } .xp-btn.bad { color: #f87171; } .xp-btn.sm { padding: 6px 12px; font-size: 12px; border-radius: 10px; } .xp-btn:disabled { opacity: .5; cursor: default; }
    .xp-in { width: 100%; box-sizing: border-box; padding: 10px 14px; border-radius: 13px; border: 1px solid var(--border-glass); background: var(--bg-glass); color: var(--text-primary); font: inherit; font-size: 13.5px; outline: none; } .xp-in:focus { border-color: var(--accent-color); } .xp-lab { display: block; font-size: 11px; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; color: var(--text-tertiary); margin: 14px 0 6px; }
    .xp-av { position: relative; display: inline-grid; place-items: center; flex: none; border-radius: 50%; font-weight: 800; color: #fff; background: linear-gradient(135deg, var(--accent-color), #0ea5e9); overflow: hidden; } .xp-av img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .xp-game { display: flex; align-items: center; gap: 12px; padding: 8px 10px; border-radius: 14px; border: 1px solid transparent; cursor: pointer; } .xp-game:hover { background: var(--bg-glass); } .xp-game.on { background: color-mix(in srgb, var(--accent-color) 16%, transparent); border-color: var(--accent-color); } .xp-game img { width: 92px; height: 43px; border-radius: 8px; object-fit: cover; background: var(--bg-glass); flex: none; } .xp-game .n { flex: 1; min-width: 0; font-weight: 700; font-size: 13.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .xp-game .s { font-size: 11.5px; color: var(--text-secondary); font-weight: 600; } .xp-game input { accent-color: var(--accent-color); width: 17px; height: 17px; }
    .xp-pf-top { position: relative; padding: 28px 22px 16px; background: linear-gradient(135deg, color-mix(in srgb, var(--accent-color) 38%, var(--bg-dark)), var(--bg-dark) 80%); display: flex; gap: 16px; align-items: center; flex-wrap: wrap; } .xp-pf-name { font-size: 22px; font-weight: 800; display: flex; align-items: center; gap: 2px; flex-wrap: wrap; } .xp-pf-sub { font-size: 12.5px; color: var(--text-secondary); margin-top: 3px; } .xp-dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; background: #22c55e; margin-right: 6px; box-shadow: 0 0 8px #22c55e; vertical-align: 0; } .xp-dot.off { background: #64748b; box-shadow: none; }
    .xp-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(92px, 1fr)); gap: 8px; margin-top: 4px; } .xp-stat { padding: 11px 12px; border-radius: 14px; background: var(--bg-glass); border: 1px solid var(--border-glass); text-align: center; } .xp-stat b { display: block; font-size: 19px; font-weight: 800; } .xp-stat span { font-size: 10.5px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: var(--text-tertiary); }
    .xp-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 11px; border-radius: 999px; font-size: 11.5px; font-weight: 800; background: rgba(0, 0, 0, .25); border: 1px solid var(--border-glass); } .xp-chip.v { color: #93c5fd; border-color: rgba(59, 130, 246, .5); } .xp-chip.o { color: #fde68a; border-color: rgba(251, 191, 36, .6); background: rgba(251, 191, 36, .12); } .xp-chip.g { color: #fbbf24; border-color: rgba(251, 191, 36, .5); }
    .xp-tgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; } .xp-th { padding: 10px; border-radius: 14px; background: var(--bg-glass); border: 1px solid var(--border-glass); display: flex; flex-direction: column; gap: 6px; } .xp-th .sw { display: flex; gap: 3px; } .xp-th .sw i { flex: 1; height: 16px; border-radius: 6px; } .xp-th b { font-size: 12.5px; }
    .xp-chrow { padding: 14px 16px; border-radius: 18px; background: var(--bg-glass); border: 1px solid var(--border-glass); margin-bottom: 10px; } .xp-chrow h4 { margin: 0 0 2px; font-size: 15px; } .xp-chrow .m { font-size: 12px; color: var(--text-secondary); margin-bottom: 8px; }
    .xp-bar { display: flex; align-items: center; gap: 10px; margin: 6px 0; } .xp-bar .r { width: 18px; font-weight: 800; font-size: 12px; color: var(--text-tertiary); text-align: center; } .xp-bar .nm { width: 110px; font-size: 12.5px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .xp-bar .tr { flex: 1; height: 10px; border-radius: 6px; background: rgba(255, 255, 255, .08); overflow: hidden; } .xp-bar .tr i { display: block; height: 100%; border-radius: 6px; background: linear-gradient(90deg, var(--accent-color), #38bdf8); transition: width .6s cubic-bezier(.2, 1, .3, 1); } .xp-bar .sc { width: 50px; text-align: right; font-weight: 800; font-size: 12.5px; font-variant-numeric: tabular-nums; } .xp-bar.me .nm { color: var(--accent-color); }
    .xp-empty { text-align: center; padding: 34px 16px; color: var(--text-secondary); font-size: 13.5px; line-height: 1.55; } .xp-empty b { display: block; color: var(--text-primary); font-size: 16px; margin-bottom: 4px; }
    .xp-pick { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 8px; margin-top: 6px; } .xp-pick .xp-btn { text-align: left; }
    body.reduce-animations .xp-ov, body.reduce-animations .xp-card { animation: none; }
    `;
    document.head.appendChild(css);

    // ---------- a small window helper ----------
    function box(title, o) {
        o = o || {}; const ov = document.createElement('div'); ov.className = 'xp-ov';
        ov.innerHTML = '<div class="xp-card" style="--w:' + (o.w || 560) + 'px;--h:' + (o.h || 720) + 'px"><div class="xp-head">' + (o.noHead ? '' : '<h3>' + E(title) + '</h3><button class="xp-x" data-close title="Close">&#10005;</button>') + '</div><div class="xp-body"></div>' + (o.foot ? '<div class="xp-foot"></div>' : '') + '</div>';
        document.body.appendChild(ov); const card = ov.querySelector('.xp-card'), b = ov.querySelector('.xp-body'), f = ov.querySelector('.xp-foot');
        if (o.noHead) { ov.querySelector('.xp-head').remove(); card.insertAdjacentHTML('afterbegin', '<button class="xp-x" data-close title="Close" style="position:absolute;top:12px;right:12px;z-index:3">&#10005;</button>'); }
        const close = () => { ov.remove(); document.removeEventListener('keydown', esc, true); if (o.onClose) o.onClose(); };
        const esc = (e) => { if (e.key === 'Escape' && document.body.contains(ov) && ov === [...document.querySelectorAll('.xp-ov')].pop()) { e.stopPropagation(); close(); } };
        document.addEventListener('keydown', esc, true);
        ov.addEventListener('mousedown', (e) => { if (e.target === ov) close(); }); ov.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) close(); });
        return { ov, card, body: b, foot: f, close };
    }

    // ---------- presence and stats (only while signed in; the player can turn these off) ----------
    let playing = null;
    const prefOn = (k, d) => { try { return getUiPref(k, d) !== false; } catch (e) { return d; } };
    const ping = () => { if (!prefOn('showPresence', true)) return; const g = playing && prefOn('showPlaying', true) ? { appid: playing.appid, name: playing.name } : null; soc('presence', { game: g }); };
    try { api.onGameStatusChange((d) => { if (!d) return; if (d.status === 'running') playing = /^\d+$/.test(String(d.appId)) ? { appid: Number(d.appId), name: d.name || '' } : null; else if (playing && String(playing.appid) === String(d.appId)) playing = null; ping(); }); } catch (e) { }
    setTimeout(ping, 12000); setInterval(() => { if (!document.hidden || playing) ping(); }, 70000);
    async function myStats() {
        let mt = null; try { mt = await api.getMetaAchievements({ librarySize: lib().length }); } catch (e) { }
        const all = (SLF.allGames ? SLF.allGames() : []).filter(g => !g.isShared);
        return { level: mt && mt.level ? mt.level.level : 1, hours: Math.round(all.reduce((s, g) => s + (function () { try { return getPlaytimeSeconds(g); } catch (e) { return 0; } })(), 0) / 3600), streak: mt && mt.streak ? mt.streak.best : 0, achievements: mt && mt.achievements ? mt.achievements.filter(a => a.unlockedAt).length : 0, games: all.length };
    }
    const sendStats = async () => { if (!prefOn('shareStats', true)) return; try { await soc('stats', await myStats()); } catch (e) { } };
    setTimeout(sendStats, 35000); setInterval(sendStats, 25 * 60000);

    // ---------- the game picker (one game, or several for a list) ----------
    function pickGames(o) {
        o = o || {}; const multi = !!o.multi; const sel = new Map(); (o.preselect || []).forEach(x => sel.set(String(x.appid), x));
        return new Promise((resolve) => {
            let done = false; const fin = (v) => { if (done) return; done = true; w.close(); resolve(v); };
            const w = box(o.title || (multi ? 'Add games to the list' : 'Share a game'), { w: 600, h: 720, foot: true, onClose: () => { if (!done) { done = true; resolve(null); } } });
            w.body.innerHTML = '<input class="xp-in" id="xp-gq" placeholder="Search your library" autocomplete="off"><div id="xp-glist" style="margin-top:10px"></div>';
            w.foot.innerHTML = '<span class="grow" id="xp-gcount"></span>' + (multi ? '<button class="xp-btn" data-close>Cancel</button><button class="xp-btn pri" id="xp-gok">Done</button>' : '');
            const games = lib().slice().sort((a, b) => hoursOf(b) - hoursOf(a) || String(a.name).localeCompare(String(b.name)));
            const paint = () => { const q = ($('xp-gq').value || '').trim().toLowerCase(), list = games.filter(g => !q || String(g.name).toLowerCase().includes(q)).slice(0, 250); $('xp-glist').innerHTML = list.length ? list.map(g => { const id = gid(g); return '<div class="xp-game' + (sel.has(id) ? ' on' : '') + '" data-id="' + E(id) + '"><img loading="lazy" src="' + cover(id) + '" onerror="this.style.visibility=\'hidden\'" alt=""><div class="n">' + E(g.name) + '<div class="s">' + hoursOf(g) + ' h played</div></div>' + (multi ? '<input type="checkbox" ' + (sel.has(id) ? 'checked' : '') + ' tabindex="-1">' : '') + '</div>'; }).join('') : '<div class="xp-empty">No games found.</div>'; $('xp-gcount').textContent = multi ? sel.size + ' selected' : (games.length + ' games'); };
            paint(); setTimeout(() => $('xp-gq').focus(), 40); $('xp-gq').oninput = paint;
            w.body.onclick = (e) => { const r = e.target.closest('[data-id]'); if (!r) return; const id = r.dataset.id, g = games.find(x => gid(x) === id); if (!g) return; if (!multi) { fin({ appid: Number(id), name: g.name, hours: hoursOf(g) }); return; } if (sel.has(id)) sel.delete(id); else if (sel.size >= 60) { toast('A list can hold up to 60 games.'); return; } else sel.set(id, { appid: Number(id), name: g.name }); paint(); };
            if (multi) $('xp-gok').onclick = () => fin([...sel.values()]);
        });
    }

    // ---------- shared game lists ----------
    async function makeList() {
        return new Promise((resolve) => {
            let done = false; const items = new Map(); const fin = (v) => { if (done) return; done = true; w.close(); resolve(v); };
            const w = box('New game list', { w: 560, foot: true, onClose: () => { if (!done) { done = true; resolve(null); } } });
            const cols = (typeof collections !== 'undefined' && collections) ? Object.keys(collections).filter(k => Array.isArray(collections[k]) && collections[k].length) : [];
            w.body.innerHTML = '<label class="xp-lab" style="margin-top:2px">Name</label><input class="xp-in" id="xp-ln" maxlength="40" placeholder="e.g. Best horror games">' +
                '<label class="xp-lab">Add games</label><div class="xp-pick"><button class="xp-btn" data-f="pick">Pick from my library...</button><button class="xp-btn" data-f="fav">Add my favourites</button><button class="xp-btn" data-f="wish">Add my wishlist</button>' + cols.map(c => '<button class="xp-btn" data-f="col" data-c="' + E(c) + '">Collection: ' + E(c) + '</button>').join('') + '</div>' +
                '<div id="xp-lsel" style="margin-top:12px"></div>';
            w.foot.innerHTML = '<span class="grow" id="xp-lc">No games yet</span><button class="xp-btn" data-close>Cancel</button><button class="xp-btn pri" id="xp-lmk">Create list</button>';
            const paint = () => { $('xp-lc').textContent = items.size ? items.size + ' game' + (items.size === 1 ? '' : 's') : 'No games yet'; $('xp-lsel').innerHTML = [...items.values()].slice(0, 60).map(g => '<div class="xp-game"><img loading="lazy" src="' + cover(g.appid) + '" onerror="this.style.visibility=\'hidden\'" alt=""><div class="n">' + E(g.name) + '</div><button class="xp-btn sm" data-rm="' + g.appid + '">Remove</button></div>').join(''); };
            const add = (arr) => { let c = 0; arr.forEach(g => { if (g && g.appid && items.size < 60 && !items.has(String(g.appid))) { items.set(String(g.appid), { appid: Number(g.appid), name: g.name || ('App ' + g.appid) }); c++; } }); if (c === 0 && arr.length) toast('Nothing new to add.'); paint(); };
            const byId = (ids) => ids.map(id => { const g = owned(id); return g ? { appid: gid(g), name: g.name } : { appid: id, name: 'App ' + id }; });
            w.body.onclick = async (e) => {
                const rm = e.target.closest('[data-rm]'); if (rm) { items.delete(rm.dataset.rm); paint(); return; }
                const b = e.target.closest('[data-f]'); if (!b) return; const f = b.dataset.f;
                if (f === 'pick') { const r = await pickGames({ multi: true, preselect: [...items.values()] }); if (r) { items.clear(); r.forEach(x => items.set(String(x.appid), x)); paint(); } }
                else if (f === 'fav') { const ids = (typeof favorites !== 'undefined' ? favorites : []).map(String).filter(x => /^\d+$/.test(x)); if (!ids.length) toast('You have no favourites yet.'); else add(byId(ids)); }
                else if (f === 'col') add(byId((collections[b.dataset.c] || []).map(String).filter(x => /^\d+$/.test(x))));
                else if (f === 'wish') { b.disabled = true; const r = await api.getWishlist(false).catch(() => null); b.disabled = false; if (r && r.ok && r.items && r.items.length) add(r.items.map(i => ({ appid: i.appid, name: i.name }))); else toast('Your wishlist is empty or private.'); }
            };
            $('xp-lmk').onclick = async () => {
                const name = $('xp-ln').value.trim(); if (name.length < 2) return toast('Give the list a name.'); if (!items.size) return toast('Add at least one game.');
                $('xp-lmk').disabled = true; const r = await soc('listCreate', { title: name, items: [...items.values()] }); $('xp-lmk').disabled = false;
                if (!r || !r.ok) return toast(err(r)); toast('List created.'); fin({ id: r.id, title: name });
            };
            paint(); setTimeout(() => $('xp-ln').focus(), 40);
        });
    }
    async function chooseList() {
        return new Promise(async (resolve) => {
            let done = false; const fin = (v) => { if (done) return; done = true; w.close(); resolve(v); };
            const w = box('Share a list', { w: 480, onClose: () => { if (!done) { done = true; resolve(null); } } });
            w.body.innerHTML = '<div class="xp-empty">Loading your lists...</div>';
            const r = await soc('listsMine'); if (done) return;
            const lists = r && r.ok ? r.lists : [];
            w.body.innerHTML = '<div class="xp-pick" style="grid-template-columns:1fr"><button class="xp-btn pri" data-new>+ Make a new list</button></div>' + (lists.length ? '<label class="xp-lab">Your lists</label>' + lists.map(l => '<div class="xp-game" data-l="' + E(l.id) + '" data-t="' + E(l.title) + '"><div class="n">' + E(l.title) + '<div class="s">' + l.count + ' game' + (l.count === 1 ? '' : 's') + '</div></div><button class="xp-btn sm">Share</button></div>').join('') : (r && r.ok ? '' : '<div class="xp-empty">' + E(err(r)) + '</div>'));
            w.body.onclick = async (e) => { if (e.target.closest('[data-new]')) { const n = await makeList(); if (n) fin(n); return; } const l = e.target.closest('[data-l]'); if (l) fin({ id: l.dataset.l, title: l.dataset.t }); };
        });
    }
    async function openList(id) {
        const w = box('Game list', { w: 600, h: 760 }); w.body.innerHTML = '<div class="xp-empty">Loading...</div>';
        const r = await soc('listGet', { id }); if (!document.body.contains(w.ov)) return;
        if (!r || !r.ok) { w.body.innerHTML = '<div class="xp-empty"><b>Could not open this list</b>' + E(err(r)) + '</div>'; return; }
        w.ov.querySelector('h3').textContent = r.title;
        const rows = r.items.map(g => { const mine = owned(g.appid), h = mine ? hoursOf(mine) : 0; return '<div class="xp-game" style="cursor:default"><img loading="lazy" src="' + cover(g.appid) + '" onerror="this.style.visibility=\'hidden\'" alt=""><div class="n">' + E(g.name) + '<div class="s">' + (mine ? 'In your library' + (h ? ' &middot; ' + h + ' h played' : '') : 'Not in your library') + '</div></div>' + (mine ? '<span class="xp-chip g">Owned</span>' : '<button class="xp-btn buy sm" data-buy="' + E(g.appid) + '">Buy on Steam</button>') + '</div>'; }).join('');
        w.body.innerHTML = '<div class="xp-pf-sub" style="margin:2px 2px 10px">By <b>' + E(r.owner.name) + '</b>' + vt(r.owner, 13) + ' &middot; ' + r.items.length + ' game' + (r.items.length === 1 ? '' : 's') + ' &middot; you own ' + r.items.filter(g => owned(g.appid)).length + '</div>' + rows + (r.mine ? '<div style="margin-top:12px"><button class="xp-btn bad sm" data-del>Delete this list</button></div>' : '');
        w.body.onclick = async (e) => { const b = e.target.closest('[data-buy]'); if (b) { open(storeUrl(b.dataset.buy)); return; } if (e.target.closest('[data-del]') && await showConfirm('Delete this list?', 'It stops working for people it was shared with.')) { const d = await soc('listDelete', { id }); if (d && d.ok) { toast('List deleted.'); w.close(); } else toast(err(d)); } };
    }

    // ---------- profiles ----------
    const ago = (t) => { const s = Math.max(0, Math.round((Date.now() - t) / 1000)); return s < 90 ? 'a moment ago' : s < 5400 ? Math.round(s / 60) + ' min ago' : s < 129600 ? Math.round(s / 3600) + ' h ago' : Math.round(s / 86400) + ' days ago'; };
    async function openProfile(uid) {
        const w = box('Profile', { w: 560, h: 780, noHead: true }); w.body.innerHTML = '<div class="xp-empty">Loading...</div>';
        const r = await soc('profile', { uid }); if (!document.body.contains(w.ov)) return;
        if (!r || !r.ok) { w.body.innerHTML = '<div class="xp-empty"><b>Could not open this profile</b>' + E(err(r)) + '</div>'; return; }
        const st = r.stats, line = r.playing ? '<span class="xp-dot"></span>Playing <b>' + E(r.playing.name) + '</b>' : r.online ? '<span class="xp-dot"></span>Online' : '<span class="xp-dot off"></span>' + (r.lastSeen ? 'Last seen ' + ago(r.lastSeen) : 'Offline');
        const rel = r.relation, act = rel === 'self' ? '<button class="xp-btn" data-a="bio">Edit my bio</button>' : rel === 'friends' ? '<button class="xp-btn pri" data-a="msg">Message</button>' : rel === 'pending_in' ? '<button class="xp-btn pri" data-a="accept">Accept request</button>' : rel === 'pending_out' ? '<button class="xp-btn" disabled>Request sent</button>' : '<button class="xp-btn pri" data-a="add">Add friend</button>';
        w.card.style.setProperty('--h', '780px'); w.card.querySelector('.xp-body').style.padding = '0';
        w.body.innerHTML = '<div class="xp-pf-top">' + av(r, 84) + '<div style="flex:1;min-width:180px"><div class="xp-pf-name">' + E(r.name) + vt(r, 20) + '</div><div class="xp-pf-sub">' + line + '</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">' + (r.owner ? '<span class="xp-chip o">' + (window.SLVerified ? window.SLVerified(13, true) : '') + ' Owner of SteamLite</span>' : r.verified ? '<span class="xp-chip v">' + (window.SLVerified ? window.SLVerified(13) : '') + ' Verified by SteamLite</span>' : '') + (r.creator ? '<span class="xp-chip g">Top theme creator</span>' : '') + '<span class="xp-chip">Member since ' + E(new Date(r.created).toLocaleDateString([], { month: 'short', year: 'numeric' })) + '</span></div></div></div>' +
            '<div style="padding:14px 20px 20px"><div id="xp-bio" class="xp-pf-sub" style="font-size:13.5px;color:var(--text-primary);margin-bottom:12px;white-space:pre-wrap">' + (r.bio ? E(r.bio) : '<span style="color:var(--text-tertiary)">' + (rel === 'self' ? 'You have not written a bio yet.' : 'No bio yet.') + '</span>') + '</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:6px">' + act + '</div>' +
            (st ? '<label class="xp-lab">Stats</label><div class="xp-stats"><div class="xp-stat"><b>' + fmt(st.level) + '</b><span>Level</span></div><div class="xp-stat"><b>' + fmt(st.hours) + '</b><span>Hours</span></div><div class="xp-stat"><b>' + fmt(st.streak) + '</b><span>Best streak</span></div><div class="xp-stat"><b>' + fmt(st.achievements) + '</b><span>Achievements</span></div><div class="xp-stat"><b>' + fmt(st.games) + '</b><span>Games</span></div></div>' : '<div class="xp-pf-sub" style="margin-top:8px">Stats are shown to friends.</div>') +
            (r.lists.length ? '<label class="xp-lab">Game lists</label>' + r.lists.map(l => '<div class="xp-game" data-list="' + E(l.id) + '"><div class="n">' + E(l.title) + '<div class="s">' + l.count + ' game' + (l.count === 1 ? '' : 's') + '</div></div><button class="xp-btn sm">Open</button></div>').join('') : '') +
            (r.themes.length ? '<label class="xp-lab">Themes by ' + E(r.name) + '</label><div class="xp-tgrid">' + r.themes.map(t => { const v = t.vars || {}; return '<div class="xp-th"><div class="sw"><i style="background:' + E(v['--bg-dark'] || '#111') + '"></i><i style="background:' + E(v['--accent-color'] || '#8b5cf6') + '"></i><i style="background:' + E(v['--success'] || '#6ee7a0') + '"></i></div><b>' + E(t.name) + '</b><button class="xp-btn sm" data-theme="' + E(t.id) + '">Get theme</button></div>'; }).join('') + '</div>' : '') + '</div>';
        try { // the person's own look: banner, title, tagline, accent and showcase
            const c = r.custom || {}, top = w.body.querySelector('.xp-pf-top');
            if (c.accent) w.card.style.setProperty('--accent-color', c.accent);
            if (top && c.banner) {
                const b = c.banner, ban = document.createElement('div'); ban.style.cssText = 'height:120px;position:relative;overflow:hidden;background:#1b1233';
                const bg = b.mode === 'image' && b.id ? 'background:url(https://steamlite-online.bayxturtle.workers.dev/media/' + E(b.id) + ') ' + (b.x || 50) + '% ' + (b.y || 50) + '%/cover;transform:scale(' + ((b.zoom || 100) / 100) + ');transform-origin:' + (b.x || 50) + '% ' + (b.y || 50) + '%;filter:blur(' + (b.blur || 0) + 'px)' : b.mode === 'gradient' ? 'background:linear-gradient(' + (b.angle || 135) + 'deg,' + (b.c1 || '#7c5cff') + ',' + (b.c2 || '#1b1233') + ')' : 'background:' + (b.c1 || '#7c5cff');
                ban.innerHTML = '<div style="position:absolute;inset:0;' + bg + '"></div>' + (b.dim ? '<div style="position:absolute;inset:0;background:#000;opacity:' + (b.dim / 100) + '"></div>' : ''); w.body.insertBefore(ban, w.body.firstChild);
            }
            const nm = w.body.querySelector('.xp-pf-name'); if (nm && c.title) { const t = document.createElement('div'); t.className = 'xp-pf-sub'; t.style.cssText = 'font-weight:600;color:var(--accent-color)'; t.textContent = c.title; nm.insertAdjacentElement('afterend', t); }
            if (top && (c.tagline || (c.showcase && c.showcase.length))) {
                const x = document.createElement('div'); x.style.cssText = 'padding:0 20px'; x.innerHTML = (c.tagline ? '<div style="font-style:italic;color:var(--accent-color);margin:6px 0 10px">' + E(c.tagline) + '</div>' : '') + (c.showcase && c.showcase.length ? '<div style="display:flex;gap:8px;margin:6px 0 10px">' + c.showcase.map(id => '<img src="' + cover(id) + '" alt="" style="height:64px;border-radius:8px" onerror="this.style.visibility=\'hidden\'">').join('') + '</div>' : ''); top.insertAdjacentElement('afterend', x);
            }
        } catch (er) { }
        w.body.onclick = async (e) => {
            const a = e.target.closest('[data-a]'), l = e.target.closest('[data-list]'), t = e.target.closest('[data-theme]');
            if (l) { openList(l.dataset.list); return; }
            if (t) { const th = r.themes.find(x => x.id === t.dataset.theme); if (th && window.SLThemes && SLThemes.getRemote) { t.disabled = true; await SLThemes.getRemote({ id: th.id, name: th.name, author: r.name, desc: '', colors: [], vars: th.vars }); t.disabled = false; } return; }
            if (!a) return; const k = a.dataset.a;
            if (k === 'msg') { const d = await soc('dm', { uid }); if (d && d.ok) { w.close(); if (SLF.openChat) SLF.openChat(d.id); } else toast(err(d)); }
            else if (k === 'add') { const d = await soc('friend', { uid }); toast(d && d.ok ? (d.status === 'accepted' ? 'You are friends now.' : 'Friend request sent.') : err(d)); w.close(); }
            else if (k === 'accept') { const d = await soc('respond', { uid, accept: true }); toast(d && d.ok ? 'You are friends now.' : err(d)); w.close(); }
            else if (k === 'bio') { const box2 = $('xp-bio'); box2.innerHTML = '<textarea class="xp-in" id="xp-bio-in" maxlength="160" rows="3" placeholder="Say something about yourself (160 letters)">' + E(r.bio) + '</textarea><div style="display:flex;gap:8px;margin-top:8px"><button class="xp-btn pri sm" data-a="biosave">Save</button><button class="xp-btn sm" data-a="biocancel">Cancel</button></div>'; $('xp-bio-in').focus(); }
            else if (k === 'biocancel') { w.close(); openProfile(uid); }
            else if (k === 'biosave') { const d = await soc('bio', { bio: $('xp-bio-in').value }); toast(d && d.ok ? 'Bio saved.' : err(d)); w.close(); if (d && d.ok) openProfile(uid); }
        };
    }

    // ---------- friend challenges ----------
    const METRICS = { hours: ['Hours played', 'h'], achievements: ['Achievements unlocked', ''], streak: ['Longest play streak', ' days'], level: ['Level reached', ''] };
    const left = (t) => { const s = Math.max(0, Math.round((t - Date.now()) / 1000)); return s > 172800 ? Math.floor(s / 86400) + ' days left' : s > 3600 ? Math.floor(s / 3600) + ' h left' : s > 0 ? Math.max(1, Math.floor(s / 60)) + ' min left' : 'Finished'; };
    async function openChallenges() {
        const w = box('Friend challenges', { w: 620, h: 760 }); const body = w.body;
        const load = async () => {
            body.innerHTML = '<div class="xp-empty">Loading...</div>'; const r = await soc('challenges'); if (!document.body.contains(w.ov)) return;
            if (!r || !r.ok) { body.innerHTML = '<div class="xp-empty"><b>Could not load challenges</b>' + E(err(r)) + '</div>'; return; }
            const list = r.challenges;
            body.innerHTML = '<div style="margin:4px 0 12px"><button class="xp-btn pri" data-new>+ Start a challenge</button></div>' + (list.length ? list.map(c => { const max = Math.max(1, ...c.standings.map(x => x.score)), mm = METRICS[c.metric] || [c.metric, '']; return '<div class="xp-chrow"><h4>' + E(c.name) + '</h4><div class="m">' + E(mm[0]) + ' &middot; ' + E(left(c.endsAt)) + (c.ended && c.winner ? ' &middot; won by <b>' + E(c.winner.join(' and ')) + '</b>' : '') + '</div>' + c.standings.map((s, i) => '<div class="xp-bar' + (s.me ? ' me' : '') + '"><span class="r">' + (i + 1) + '</span><span class="nm">' + E(s.name) + vt(s, 12) + '</span><span class="tr"><i style="width:' + Math.round(s.score / max * 100) + '%"></i></span><span class="sc">' + (s.noData ? '-' : fmt(s.score) + E(mm[1])) + '</span></div>').join('') + '<div style="display:flex;gap:8px;margin-top:10px"><button class="xp-btn sm" data-chat="' + E(c.conv) + '">Open the chat</button>' + (c.owner && !c.ended ? '<button class="xp-btn sm bad" data-end="' + E(c.id) + '">End it now</button>' : '') + '</div></div>'; }).join('') : '<div class="xp-empty"><b>No challenges yet</b>Start one with your friends: whoever plays the most, unlocks the most or keeps the longest streak over a few days wins. Scores count from the moment it starts.</div>');
        };
        body.onclick = async (e) => {
            if (e.target.closest('[data-new]')) return newForm();
            const c = e.target.closest('[data-chat]'); if (c) { w.close(); if (SLF.openChat) SLF.openChat(c.dataset.chat); return; }
            const en = e.target.closest('[data-end]'); if (en && await showConfirm('End this challenge now?', 'The scores right now decide the winner.')) { const d = await soc('challengeEnd', { id: en.dataset.end }); toast(d && d.ok ? 'Challenge ended.' : err(d)); load(); }
        };
        async function newForm() {
            body.innerHTML = '<div class="xp-empty">Loading your friends...</div>'; const ov = await soc('overview'); if (!ov || !ov.ok) { body.innerHTML = '<div class="xp-empty">' + E(err(ov)) + '</div>'; return; }
            const fr = ov.friends; if (!fr.length) { body.innerHTML = '<div class="xp-empty"><b>You need friends first</b>Add friends in Messages, then challenge them.</div><div style="text-align:center"><button class="xp-btn" data-back>Back</button></div>'; body.onclick = (e) => { if (e.target.closest('[data-back]')) { body.onclick = null; openChallenges.rebind(); } }; return; }
            body.innerHTML = '<label class="xp-lab" style="margin-top:0">Name</label><input class="xp-in" id="xp-cn" maxlength="32" placeholder="e.g. Weekend grind"><label class="xp-lab">Compete in</label><select class="xp-in" id="xp-cm">' + Object.keys(METRICS).map(k => '<option value="' + k + '">' + METRICS[k][0] + '</option>').join('') + '</select><label class="xp-lab">For how long</label><select class="xp-in" id="xp-cd"><option value="3">3 days</option><option value="7" selected>7 days</option><option value="14">14 days</option><option value="30">30 days</option></select><label class="xp-lab">Who is in (friends)</label>' + fr.map(f => '<label class="xp-game"><span style="display:inline-flex">' + av(f, 32) + '</span><div class="n">' + E(f.name) + vt(f, 13) + '</div><input type="checkbox" data-f="' + E(f.uid) + '"></label>').join('') + '<div style="display:flex;gap:8px;margin-top:14px"><button class="xp-btn" data-back>Back</button><button class="xp-btn pri" id="xp-cgo">Start the challenge</button></div>';
            body.onclick = async (e) => {
                if (e.target.closest('[data-back]')) { body.onclick = null; rebind(); return; }
                if (e.target.id === 'xp-cgo') { const ids = [...body.querySelectorAll('[data-f]:checked')].map(x => x.dataset.f); if (!ids.length) return toast('Pick at least one friend.'); e.target.disabled = true; const d = await soc('challengeStart', { name: $('xp-cn').value, metric: $('xp-cm').value, days: Number($('xp-cd').value), members: ids }); if (d && d.ok) { toast('Challenge started. The chat is ready.'); sendStats(); rebind(); } else { e.target.disabled = false; toast(err(d)); } }
            };
        }
        function rebind() { body.onclick = async (e) => { if (e.target.closest('[data-new]')) return newForm(); const c = e.target.closest('[data-chat]'); if (c) { w.close(); if (SLF.openChat) SLF.openChat(c.dataset.chat); return; } const en = e.target.closest('[data-end]'); if (en && await showConfirm('End this challenge now?', 'The scores right now decide the winner.')) { const d = await soc('challengeEnd', { id: en.dataset.end }); toast(d && d.ok ? 'Challenge ended.' : err(d)); load(); } }; load(); }
        openChallenges.rebind = rebind; load();
    }

    window.SLPeople = { pickGame: () => pickGames({ multi: false }), pickGames, makeList, chooseList, openList, openProfile, openChallenges, owned, storeUrl, sendStats, ping, box };
})();
