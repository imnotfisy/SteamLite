// SteamLite 9.1.0 - profile extras: pinned achievements, a profile banner from one of your game screenshots,
// a shareable stats card and the weekly recap.
(function () {
    'use strict';
    if (!window.SLF || !window.electronAPI) return;
    const SLF = window.SLF, $ = (id) => document.getElementById(id), E = SLF.E, feat = SLF.feat;
    const api = window.electronAPI;
    const css = document.createElement('style');
    css.textContent = `
    .pe-pins { display: flex; flex-wrap: wrap; gap: 6px; max-height: 120px; overflow-y: auto; margin-bottom: 8px; }
    .pe-pin { padding: 5px 11px; border-radius: 999px; border: 1px solid var(--border-glass); background: var(--bg-glass); color: var(--text-secondary); font-size: 12px; cursor: pointer; font-family: inherit; }
    .pe-pin.on { background: var(--accent-color); border-color: var(--accent-color); color: #fff; font-weight: 700; } .pe-pin:hover { border-color: var(--accent-color); }
    .pf-pins { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0 2px; }
    .pf-pin { display: inline-flex; align-items: center; gap: 7px; padding: 6px 13px 6px 9px; border-radius: 999px; background: color-mix(in srgb, var(--accent-color) 16%, transparent); border: 1px solid color-mix(in srgb, var(--accent-color) 38%, transparent); font-size: 12.5px; font-weight: 700; }
    .bs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; } .bs-grid img { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 10px; cursor: pointer; border: 2px solid transparent; transition: transform 0.2s var(--ease-spring), border-color 0.2s; } .bs-grid img:hover { transform: scale(1.04); border-color: var(--accent-color); }
    .rc-stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; margin: 8px 0 14px; } .rc-stats div { padding: 12px 14px; border-radius: 16px; background: var(--bg-glass); border: 1px solid var(--border-glass); } .rc-stats b { display: block; font-size: 22px; } .rc-stats span { font-size: 12px; color: var(--text-secondary); } .rc-stats em { font-style: normal; font-size: 11px; color: var(--text-tertiary); }
    `;
    document.head.appendChild(css);
    const steamId = () => (activeConfig && activeConfig.steamId) || '';
    let metaCache = null, metaAt = 0;
    const meta = async () => { if (!metaCache || Date.now() - metaAt > 30000) { try { metaCache = await api.getMetaAchievements({ librarySize: installedGames.length + uninstalledGames.length }); metaAt = Date.now(); } catch (e) { } } return metaCache; };
    const myPins = () => (getUiPref('profilePins', {})[steamId()] || []).slice(0, 3);

    // ---- 1. pinned achievements: pick up to 3 in Edit Profile, shown under your name ----
    const editModal = $('profile-edit-modal');
    if (editModal) {
        const label = [...editModal.querySelectorAll('.pe-label')].find(l => /Showcase/.test(l.textContent));
        if (label) {
            const sec = document.createElement('div'); sec.innerHTML = '<span class="pe-label">Pinned achievements <span class="pe-count" id="pe-pin-count">(0 / 3)</span></span><div class="pe-pins" id="pe-pins"></div>';
            label.parentNode.insertBefore(sec, label);
            const paintPins = async () => {
                const m = await meta(); const un = ((m && m.achievements) || []).filter(a => a.unlockedAt);
                const cur = myPins(); $('pe-pin-count').textContent = '(' + cur.length + ' / 3)';
                $('pe-pins').innerHTML = un.length ? un.map(a => '<button type="button" class="pe-pin' + (cur.includes(a.id) ? ' on' : '') + '" data-id="' + E(a.id) + '" title="' + E(a.desc) + '">' + a.icon + ' ' + E(a.name) + '</button>').join('') : '<span class="pe-count">Unlock achievements to pin them here.</span>';
            };
            $('pe-pins').addEventListener('click', async (e) => {
                const b = e.target.closest('.pe-pin'); if (!b) return;
                let cur = myPins(); if (cur.includes(b.dataset.id)) cur = cur.filter(x => x !== b.dataset.id); else if (cur.length < 3) cur.push(b.dataset.id); else { showToast('You can pin up to 3 achievements.'); return; }
                await setUiPref({ profilePins: { ...getUiPref('profilePins', {}), [steamId()]: cur } }); paintPins();
            });
            new MutationObserver(() => { if (editModal.classList.contains('active')) paintPins(); }).observe(editModal, { attributes: true, attributeFilter: ['class'] });
        }
    }
    const vc = $('view-container');
    if (vc) new MutationObserver(async () => {
        const info = vc.querySelector('.profile-view .profile-info-modern'); if (!info || info.parentNode.querySelector('.pf-pins') || !$('banner-edit-btn')) return; // only on your own profile
        const pins = myPins(); if (!pins.length) return;
        const m = await meta(); const by = {}; ((m && m.achievements) || []).forEach(a => { by[a.id] = a; });
        const chips = pins.map(id => by[id]).filter(a => a && a.unlockedAt).map(a => '<span class="pf-pin" title="' + E(a.desc) + '">' + a.icon + ' ' + E(a.name) + '</span>');
        if (!chips.length || info.parentNode.querySelector('.pf-pins')) return;
        info.insertAdjacentHTML('afterend', '<div class="pf-pins">' + chips.join('') + '</div>');
    }).observe(vc, { childList: true });

    // ---- 2. a profile banner from one of your screenshots ----
    const bmRow = $('bm-image-row');
    if (bmRow) {
        const b = document.createElement('button'); b.className = 'action-btn btn-secondary'; b.id = 'bm-shot'; b.textContent = 'Use a game screenshot...'; bmRow.appendChild(b);
        b.addEventListener('click', () => {
            const m = SLF.modal('bshot-modal', 'Banner from a screenshot', { cls: 'narrow', sub: 'Pick a game, then one of the screenshots you took in it.' });
            const games = SLF.allGames().filter(g => !g.isShared && /^\d+$/.test(SLF.gid(g))).sort((a, c) => getPlaytimeSeconds(c) - getPlaytimeSeconds(a)).slice(0, 150);
            m.body.innerHTML = '<select class="fx-select" id="bs-game" style="width:100%">' + games.map(g => '<option value="' + E(SLF.gid(g)) + '">' + E(g.name) + '</option>').join('') + '</select><div class="fx-section">Screenshots</div><div id="bs-list"></div>';
            m.open();
            const load = async () => {
                const list = $('bs-list'); list.innerHTML = '<div class="fx-empty">Loading...</div>';
                let shots = []; try { shots = (await api.getScreenshots({ steamId: steamId(), gameId: $('bs-game').value })) || []; } catch (e) { }
                list.innerHTML = shots.length ? '<div class="bs-grid">' + shots.slice(0, 40).map(u => '<img loading="lazy" src="' + E(u) + '" data-u="' + E(u) + '">').join('') + '</div>' : '<div class="fx-empty">No screenshots for this game. Take some in Steam (F12).</div>';
            };
            $('bs-game').onchange = load; load();
            m.body.onclick = async (e) => {
                const im = e.target.closest('img[data-u]'); if (!im) return;
                const r = await feat('bannerFromShot', { url: im.dataset.u });
                if (!r || !r.ok) { showToast((r && r.error) || 'Could not use that screenshot.'); return; }
                bannerDraft.mode = 'image'; bannerDraft.image = r.path; bannerDraft.x = 50; bannerDraft.y = 50; bannerDraft.zoom = 100; refreshBannerPreview(); m.close(); playSound('click');
            };
        });
    }

    // ---- drawing helpers for the two cards ----
    const font = (s, w) => (w || '700') + ' ' + s + 'px "Segoe UI", system-ui, sans-serif';
    const loadImg = (src) => new Promise(res => { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
    const palette = () => { const cs = getComputedStyle(document.documentElement); return { accent: (cs.getPropertyValue('--accent-color') || '#8b5cf6').trim() || '#8b5cf6', bg: (cs.getPropertyValue('--bg-dark') || '#0b0b10').trim() || '#0b0b10' }; };
    function backdrop(c, W, H, pal) { const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, pal.bg); g.addColorStop(1, '#000'); c.fillStyle = g; c.fillRect(0, 0, W, H); const gl = c.createRadialGradient(W * 0.85, 40, 10, W * 0.85, 40, W * 0.6); gl.addColorStop(0, pal.accent + '66'); gl.addColorStop(1, 'transparent'); c.fillStyle = gl; c.fillRect(0, 0, W, H); }
    const save = (cv, name) => async () => { try { const r = await api.saveImageFile({ dataUrl: cv.toDataURL('image/png'), defaultName: name }); if (r && r.ok) showToast('Image saved.'); } catch (e) { showToast('Could not save the image.'); } };
    const pname = () => (($('user-name') && $('user-name').dataset.name) || 'Player').trim();

    // ---- 3. the stats card ----
    async function openStatsCard() {
        const m = SLF.modal('stcard-modal', 'Stats card', { cls: 'narrow', sub: 'A picture of your top games and numbers to share.' });
        m.body.innerHTML = '<div class="yr-canvas-wrap"><canvas id="st-canvas" width="900" height="500"></canvas></div><div class="fx-row"><button class="fx-btn primary" id="st-save">Save image</button></div>'; m.open();
        const mt = await meta(), cv = $('st-canvas'), c = cv.getContext('2d'), pal = palette(), all = SLF.allGames().filter(g => !g.isShared);
        backdrop(c, 900, 500, pal);
        c.fillStyle = '#fff'; c.font = font(38, '800'); c.fillText(pname().slice(0, 24), 40, 70);
        c.fillStyle = pal.accent; c.font = font(20, '700'); c.fillText('Lv ' + (mt && mt.level ? mt.level.level : 1) + '  ·  ' + all.length + ' games  ·  ' + SLF.hours(all.reduce((s, g) => s + getPlaytimeSeconds(g), 0)) + ' h played', 40, 104);
        const top = all.slice().sort((a, b) => getPlaytimeSeconds(b) - getPlaytimeSeconds(a)).slice(0, 5), max = Math.max(1, ...top.map(g => getPlaytimeSeconds(g)));
        const covers = await Promise.all(top.map(g => loadImg(SLF.cover(SLF.gid(g)))));
        c.fillStyle = '#ffffff88'; c.font = font(14, '700'); c.fillText('TOP GAMES', 40, 150);
        top.forEach((g, i) => {
            const y = 164 + i * 62, sec = getPlaytimeSeconds(g);
            c.save(); c.beginPath(); c.roundRect(40, y, 110, 50, 10); c.clip(); if (covers[i]) c.drawImage(covers[i], 40, y, 110, 50); else { c.fillStyle = '#ffffff1a'; c.fillRect(40, y, 110, 50); } c.restore();
            c.fillStyle = '#fff'; c.font = font(18, '700'); c.fillText(String(g.name).slice(0, 38), 166, y + 20);
            c.fillStyle = '#ffffff22'; c.beginPath(); c.roundRect(166, y + 30, 560, 12, 6); c.fill();
            c.fillStyle = pal.accent; c.beginPath(); c.roundRect(166, y + 30, Math.max(12, 560 * sec / max), 12, 6); c.fill();
            c.fillStyle = '#ffffffcc'; c.font = font(16, '600'); c.textAlign = 'right'; c.fillText(SLF.hours(sec) + ' h', 860, y + 42); c.textAlign = 'left';
        });
        c.fillStyle = '#ffffff55'; c.font = font(13, '500'); c.textAlign = 'right'; c.fillText('SteamLite ' + (activeConfig.appVersion || SLF.version), 860, 482); c.textAlign = 'left';
        $('st-save').onclick = save(cv, 'SteamLite-stats.png');
    }

    // ---- 4. the weekly recap ----
    async function recapData() {
        const hist = await SLF.sessions(), now = Date.now(), W = 7 * 86400000;
        const cur = hist.filter(h => h.start >= now - W), prev = hist.filter(h => h.start >= now - 2 * W && h.start < now - W);
        const sum = (a) => a.reduce((s, h) => s + (h.seconds || 0), 0);
        const by = {}; cur.forEach(h => { by[h.gameId] = by[h.gameId] || { id: h.gameId, name: h.name, sec: 0 }; by[h.gameId].sec += h.seconds || 0; });
        const top = Object.values(by).sort((a, b) => b.sec - a.sec);
        const days = new Set(cur.map(h => new Date(h.start).toDateString())).size;
        const mt = await meta(); const ach = ((mt && mt.achievements) || []).filter(a => a.unlockedAt && a.unlockedAt >= now - W).length;
        return { hours: sum(cur) / 3600, prevHours: sum(prev) / 3600, games: top.length, top, days, sessions: cur.length, longest: Math.max(0, ...cur.map(h => h.seconds || 0)) / 3600, ach, streak: mt && mt.streak ? mt.streak.current : 0 };
    }
    async function openRecap() {
        const m = SLF.modal('recap-modal', 'Your week', { cls: 'narrow', sub: 'The last 7 days in SteamLite.' });
        m.body.innerHTML = '<div class="fx-empty">Loading...</div>'; m.open();
        const d = await recapData(), diff = d.prevHours > 0 ? Math.round((d.hours - d.prevHours) / d.prevHours * 100) : null;
        m.body.innerHTML = '<div class="rc-stats"><div><b>' + d.hours.toFixed(1) + ' h</b><span>played</span>' + (diff !== null ? '<br><em>' + (diff >= 0 ? '+' : '') + diff + '% vs last week</em>' : '') + '</div><div><b>' + d.games + '</b><span>games played</span></div><div><b>' + d.days + ' / 7</b><span>days played</span></div><div><b>' + d.ach + '</b><span>achievements</span></div><div><b>' + d.sessions + '</b><span>sessions</span></div><div><b>' + d.longest.toFixed(1) + ' h</b><span>longest session</span></div></div>' +
            (d.top[0] ? '<div class="fx-meta" style="margin-bottom:10px">Most played: <b>' + E(d.top[0].name) + '</b> (' + (d.top[0].sec / 3600).toFixed(1) + ' h)</div>' : '<div class="fx-empty">No play sessions this week yet.</div>') +
            '<div class="yr-canvas-wrap"><canvas id="rc-canvas" width="900" height="470"></canvas></div><div class="fx-row"><button class="fx-btn primary" id="rc-save">Save image</button></div>';
        const cv = $('rc-canvas'), c = cv.getContext('2d'), pal = palette(); backdrop(c, 900, 470, pal);
        c.fillStyle = '#ffffff88'; c.font = font(15, '700'); c.fillText('MY WEEK IN STEAMLITE', 40, 52);
        c.fillStyle = '#fff'; c.font = font(84, '800'); c.fillText(d.hours.toFixed(1) + ' h', 40, 150);
        c.fillStyle = pal.accent; c.font = font(24, '700'); c.fillText('played this week' + (diff !== null ? '  ·  ' + (diff >= 0 ? '+' : '') + diff + '% vs last week' : ''), 44, 186);
        [[d.games, 'games'], [d.days + '/7', 'days played'], [d.ach, 'achievements'], [d.streak, 'day streak']].forEach((t, i) => { const x = 40 + i * 205, y = 220; c.fillStyle = '#ffffff12'; c.beginPath(); c.roundRect(x, y, 190, 90, 16); c.fill(); c.fillStyle = '#fff'; c.font = font(34, '800'); c.fillText(String(t[0]), x + 16, y + 48); c.fillStyle = '#ffffff99'; c.font = font(16, '500'); c.fillText(t[1], x + 16, y + 76); });
        if (d.top[0]) { const im = await loadImg(SLF.cover(d.top[0].id)); c.fillStyle = '#ffffff88'; c.font = font(14, '700'); c.fillText('MOST PLAYED', 40, 352); c.save(); c.beginPath(); c.roundRect(40, 364, 180, 84, 12); c.clip(); if (im) c.drawImage(im, 40, 364, 180, 84); else { c.fillStyle = '#ffffff1a'; c.fillRect(40, 364, 180, 84); } c.restore(); c.fillStyle = '#fff'; c.font = font(24, '800'); c.fillText(String(d.top[0].name).slice(0, 34), 238, 400); c.fillStyle = '#ffffffaa'; c.font = font(18, '500'); c.fillText((d.top[0].sec / 3600).toFixed(1) + ' hours this week', 238, 430); }
        c.fillStyle = '#ffffff55'; c.font = font(13, '500'); c.textAlign = 'right'; c.fillText(pname() + '  ·  SteamLite ' + (activeConfig.appVersion || SLF.version), 860, 452); c.textAlign = 'left';
        $('rc-save').onclick = save(cv, 'SteamLite-weekly-recap.png');
    }
    // on Mondays (once a week) the recap offers itself
    setTimeout(() => {
        try {
            const d = new Date(); if (d.getDay() !== 1) return; const key = d.getFullYear() + '-' + Math.floor((d - new Date(d.getFullYear(), 0, 1)) / 604800000);
            if (getUiPref('recapSeen', '') === key) return; setUiPref({ recapSeen: key });
            showToast('Your weekly recap is ready.', () => openRecap());
        } catch (e) { }
    }, 9000);

    SLF.safe('profile-extras', () => {
        SLF.addTile('Social', '📊', 'Stats card', 'A shareable picture of your top games and numbers.', openStatsCard);
        SLF.addTile('Stats', '📅', 'Weekly recap', 'Your last 7 days: hours, games, achievements and your most played game, as a picture to share.', openRecap);
    });
    SLF.openRecap = openRecap; SLF.openStatsCard = openStatsCard;
})();
