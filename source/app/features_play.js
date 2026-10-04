/* SteamLite 8.6.5 - renderer features, part 2: choosing what to play, stats, wishlist extras, journal, co-op, free games. */
(function () {
    'use strict';
    const SLF = window.SLF; if (!SLF) return;
    const { $, E, feat, onFeat, safe } = SLF;
    const allGames = () => SLF.allGames();
    const gid = SLF.gid;
    const playable = () => installedGames.filter(g => !hiddenGames.includes(gid(g)));
    const hoursOf = (g) => getPlaytimeSeconds(g) / 3600;
    const gameRow = (g, right) => '<div class="fx-card" data-g="' + E(gid(g)) + '"><img class="cover" src="' + SLF.cover(gid(g)) + '" onerror="this.style.visibility=\'hidden\'"><div class="fx-grow"><div class="fx-name">' + E(g.name) + '</div>' + (right || '') + '</div></div>';

    // ---------- Up Next queue ----------
    const getQ = () => { const q = getUiPref('upNext', []); return q.filter(id => SLF.gameById(id)); };
    const setQ = (q) => setUiPref({ upNext: q.slice(0, 40) });
    SLF.upNextGet = getQ;
    SLF.upNextAdd = async (id) => { const q = getQ(); if (q.includes(String(id))) { showToast('Already in your Up Next queue.', null, { noHistory: true }); return; } q.push(String(id)); await setQ(q); const g = SLF.gameById(id); showToast((g ? g.name : 'Game') + ' added to Up Next.', null, { noHistory: true }); };
    SLF.upNextRemove = async (id) => { await setQ(getQ().filter(x => x !== String(id))); };
    safe('up-next', () => {
        async function openUpNext() {
            const m = SLF.modal('upnext-modal', 'Up Next', { sub: 'Games you plan to play, in order. Drag to reorder. "What should I play?" favours this list.' });
            const render = () => {
                const q = getQ().filter(id => (gameMetaCache[id] || {}).status !== 'completed');
                m.body.innerHTML = '<div class="fx-row"><input class="fx-input" id="un-search" placeholder="Add a game..." style="flex:1"></div><div id="un-results"></div><div class="fx-section">Queue (' + q.length + ')</div><div id="un-list">'
                    + (q.length ? q.map((id, i) => { const g = SLF.gameById(id); return '<div class="fx-card" draggable="true" data-id="' + E(id) + '" style="cursor:grab"><span class="fx-meta" style="width:18px">' + (i + 1) + '</span><img class="cover" src="' + SLF.cover(id) + '" onerror="this.style.visibility=\'hidden\'"><div class="fx-grow"><div class="fx-name">' + E(g.name) + '</div><div class="fx-meta">' + SLF.hours(getPlaytimeSeconds(g) ) + ' h played' + ((gameMetaCache[id] || {}).status ? ' · ' + E(gameMetaCache[id].status) : '') + '</div></div>' + (installedGames.includes(g) ? '<button class="fx-btn primary" data-play="' + E(id) + '">Play</button>' : '') + '<button class="fx-btn" data-rm="' + E(id) + '">✕</button></div>'; }).join('') : '<div class="fx-empty">Nothing queued. Search above, or use "Add to Up Next" on any game.</div>') + '</div>';
                const list = $('un-list');
                let dragId = null;
                list.addEventListener('dragstart', (e) => { const c = e.target.closest('.fx-card'); if (c) { dragId = c.dataset.id; e.dataTransfer.effectAllowed = 'move'; } });
                list.addEventListener('dragover', (e) => { if (dragId) e.preventDefault(); });
                list.addEventListener('drop', async (e) => { e.preventDefault(); const c = e.target.closest('.fx-card'); if (!c || !dragId || c.dataset.id === dragId) return; const q = getQ().filter(x => x !== dragId); q.splice(q.indexOf(c.dataset.id), 0, dragId); await setQ(q); dragId = null; render(); });
                list.onclick = async (e) => {
                    const p = e.target.closest('[data-play]'), r = e.target.closest('[data-rm]');
                    if (r) { await SLF.upNextRemove(r.dataset.rm); render(); }
                    else if (p) { const g = SLF.gameById(p.dataset.play); await SLF.upNextRemove(p.dataset.play); m.close(); await SLF.launch(g); showToast('Launching ' + g.name + '...'); }
                };
                $('un-search').oninput = (e) => {
                    const t = e.target.value.trim().toLowerCase(), inQ = new Set(getQ());
                    const res = t ? allGames().filter(g => String(g.name).toLowerCase().includes(t) && !inQ.has(gid(g))).slice(0, 6) : [];
                    $('un-results').innerHTML = res.map(g => '<div class="fx-card"><img class="cover" src="' + SLF.cover(gid(g)) + '" onerror="this.style.visibility=\'hidden\'"><div class="fx-grow"><div class="fx-name">' + E(g.name) + '</div></div><button class="fx-btn" data-add="' + E(gid(g)) + '">Add</button></div>').join('');
                    $('un-results').onclick = async (ev) => { const b = ev.target.closest('[data-add]'); if (!b) return; await SLF.upNextAdd(b.dataset.add); render(); };
                };
            };
            render(); m.open();
        }
        SLF.openUpNext = openUpNext;
        SLF.addTile('Play smarter', '⏭️', 'Up Next', 'A queue of the games you plan to play, in the order you want.', openUpNext);
        // right-click menu: "Add to Up Next"
        const origCtx = window.showContextMenu;
        window.showContextMenu = function (x, y, game, isInstalled) {
            const r = origCtx.apply(this, arguments);
            try {
                const menu = $('context-menu'), id = gid(game), inQ = getQ().includes(id);
                menu.insertAdjacentHTML('beforeend', '<div class="ctx-separator"></div><div class="ctx-item" data-slf="upnext">' + (inQ ? '⏭️ Remove from Up Next' : '⏭️ Add to Up Next') + '</div>');
                menu.querySelector('[data-slf="upnext"]').addEventListener('click', async () => { hideContextMenu(); if (inQ) { await SLF.upNextRemove(id); showToast('Removed from Up Next.', null, { noHistory: true }); } else await SLF.upNextAdd(id); });
                const rect = menu.getBoundingClientRect(); if (rect.bottom > window.innerHeight) menu.style.top = Math.max(8, window.innerHeight - rect.height - 8) + 'px';
            } catch (e) { }
            return r;
        };
    });

    // ---------- What should I play? ----------
    safe('picker', () => {
        const st = { time: 'any', mood: 'surprise' };
        async function score() {
            const hist = await SLF.sessions(), avgSess = {}, cnt = {};
            hist.forEach(h => { const k = String(h.gameId); avgSess[k] = (avgSess[k] || 0) + (h.seconds || 0); cnt[k] = (cnt[k] || 0) + 1; });
            const q = getQ(), now = Date.now(), out = [];
            playable().forEach(g => {
                const id = gid(g), meta = gameMetaCache[id] || {}, tel = telemetryCache[id] || {}, ach = achievementCache[id], hrs = hoursOf(g);
                const sessMin = cnt[id] ? avgSess[id] / cnt[id] / 60 : 45, last = tel.lastPlayed || 0, daysAgo = last ? (now - last) / 86400000 : 0; // 0 = unknown (never tracked by SteamLite)
                if (meta.status === 'completed' || meta.status === 'dropped') return;
                let s = Math.random() * 1.2, why = [];
                const qi = q.indexOf(id); if (qi >= 0) { s += 3 - Math.min(2, qi * 0.3); why.push('In your Up Next queue'); }
                if (meta.status === 'playing') { s += 1.8; why.push('You marked it Playing'); }
                if (meta.status === 'backlog') { s += 1.2; why.push('In your backlog'); }
                if (st.mood === 'finish') { if (meta.status === 'playing' || (hrs > 0.5 && last && daysAgo < 45)) { s += 2.5; if (hrs > 0.5) why.push(SLF.hours(hrs * 3600) + ' h in, pick up where you left off'); } else s -= 2; }
                else if (st.mood === 'new') { if (hrs < 0.1) { s += 3; why.push('You have never played it'); } else s -= 3; }
                else if (st.mood === 'quick') { if (ach && ach.total > 0 && ach.achieved < ach.total && ach.achieved / ach.total >= 0.7) { s += 3.2; why.push('Only ' + (ach.total - ach.achieved) + ' achievement' + (ach.total - ach.achieved === 1 ? '' : 's') + ' left'); } else s -= 2.5; }
                else if (st.mood === 'backlog') { if (meta.status === 'backlog' || hrs < 1) { s += 2.2; if (hrs < 1) why.push('Barely played'); } else s -= 2; }
                if (st.time !== 'any') {
                    const want = Number(st.time), fit = 1 - Math.min(1, Math.abs(sessMin - want) / want);
                    s += fit * 1.6; if (fit > 0.6) why.push('Your sessions run about ' + Math.round(sessMin) + ' min - fits ' + (want >= 60 ? want / 60 + ' h' : want + ' min'));
                    if (want <= 30 && sessMin > 90) s -= 1.5;
                }
                if (daysAgo > 120 && hrs > 2) { s += 0.8; why.push('You have not played it in ' + Math.round(daysAgo / 30) + ' months'); }
                if (!why.length) why.push(hrs > 0 ? SLF.hours(hrs * 3600) + ' h played' : 'Unplayed');
                out.push({ g, s, why: why.slice(0, 3) });
            });
            return out.sort((a, b) => b.s - a.s).slice(0, 3);
        }
        async function openPicker() {
            const m = SLF.modal('pick-modal', 'What should I play?', { sub: 'Pick how long you have and what you feel like.' });
            const chip = (grp, val, label) => '<button class="fx-chip' + (st[grp] === val ? ' active' : '') + '" data-g="' + grp + '" data-v="' + val + '">' + label + '</button>';
            const draw = async () => {
                const res = await score();
                m.body.innerHTML = '<div class="fx-section">Time</div><div class="fx-row">' + chip('time', '30', '30 min') + chip('time', '60', '1 hour') + chip('time', '120', '2+ hours') + chip('time', 'any', 'Any') + '</div>'
                    + '<div class="fx-section">Mood</div><div class="fx-row">' + chip('mood', 'surprise', '🎲 Surprise me') + chip('mood', 'finish', '▶️ Keep going') + chip('mood', 'new', '✨ Something new') + chip('mood', 'quick', '🏁 Quick win') + chip('mood', 'backlog', '📚 Backlog') + '</div>'
                    + '<div class="fx-section">Try these</div>' + (res.length ? res.map(r => '<div class="fx-card"><img class="cover" src="' + SLF.cover(gid(r.g)) + '" onerror="this.style.visibility=\'hidden\'"><div class="fx-grow"><div class="fx-name">' + E(r.g.name) + '</div><div class="fx-meta">' + r.why.map(E).join(' · ') + '</div></div><button class="fx-btn primary" data-play="' + E(gid(r.g)) + '">Play</button><button class="fx-btn" data-add="' + E(gid(r.g)) + '" title="Add to Up Next">⏭️</button></div>').join('') : '<div class="fx-empty">No installed game fits that. Try a different mood.</div>')
                    + '<div class="fx-row"><button class="fx-btn" id="pk-again">🎲 Roll again</button></div>';
                $('pk-again').onclick = () => { playSound('click'); draw(); };
            };
            m.body.onclick = async (e) => {
                const c = e.target.closest('.fx-chip'), p = e.target.closest('[data-play]'), a = e.target.closest('[data-add]');
                if (c) { playSound('click'); st[c.dataset.g] = c.dataset.v; draw(); }
                else if (p) { const g = SLF.gameById(p.dataset.play); await SLF.upNextRemove(p.dataset.play); m.close(); await SLF.launch(g); showToast('Launching ' + g.name + '...'); }
                else if (a) { await SLF.upNextAdd(a.dataset.add); }
            };
            m.open(); draw();
        }
        SLF.openPicker = openPicker;
        SLF.addTile('Play smarter', '🎲', 'What should I play?', 'Tells you what to play from how long you have and what you feel like.', openPicker);
    });

    // ---------- Closest to 100% ----------
    safe('closest-100', () => {
        async function openClosest() {
            const m = SLF.modal('c100-modal', 'Closest to 100%', { sub: 'Games where you only have a few Steam achievements left.' });
            const draw = () => {
                const rows = allGames().filter(g => !g.isNonSteam && achievementCache[gid(g)] && achievementCache[gid(g)].total > 0 && achievementCache[gid(g)].achieved < achievementCache[gid(g)].total)
                    .map(g => { const a = achievementCache[gid(g)]; return { g, left: a.total - a.achieved, pct: a.achieved / a.total, a }; })
                    .sort((x, y) => (x.left - y.left) || (y.pct - x.pct)).slice(0, 40);
                const known = Object.keys(achievementCache).length;
                m.body.innerHTML = '<div class="fx-row"><button class="fx-btn primary" id="c1-scan">Scan my whole library</button><span class="fx-meta" id="c1-prog">' + known + ' games checked so far</span></div>'
                    + (rows.length ? rows.map(r => '<div class="fx-card" data-open="' + E(gid(r.g)) + '" style="cursor:pointer"><img class="cover" src="' + SLF.cover(gid(r.g)) + '" onerror="this.style.visibility=\'hidden\'"><div class="fx-grow"><div class="fx-name">' + E(r.g.name) + '</div><div class="fx-meta">' + r.a.achieved + ' / ' + r.a.total + ' · <b style="color:var(--accent-color)">' + r.left + ' left</b></div><div class="fx-bar"><i style="width:' + Math.round(r.pct * 100) + '%"></i></div></div></div>').join('') : '<div class="fx-empty">No data yet. Press "Scan my whole library" to check every game (it takes a minute).</div>');
                m.body.querySelectorAll('[data-open]').forEach(c => c.onclick = () => { m.close(); openGame(c.dataset.open, installedGames.some(g => gid(g) === c.dataset.open)); });
                $('c1-scan').onclick = async (e) => {
                    const b = e.target; b.disabled = true;
                    const todo = allGames().filter(g => !g.isNonSteam && /^\d+$/.test(gid(g)) && !achievementCache[gid(g)]);
                    let n = 0;
                    for (const g of todo) {
                        if (!m.isOpen()) break;
                        try { const p = await window.electronAPI.getAchievementProgress({ apiKey: activeConfig.apiKey, steamId: activeConfig.steamId, appId: gid(g) }); if (p && p.total > 0) { achievementCache[gid(g)] = { ...p, timestamp: Date.now() }; if (window.electronAPI.cacheAchievement) window.electronAPI.cacheAchievement({ appId: gid(g), total: p.total, achieved: p.achieved }); } } catch (er) { }
                        n++; if ($('c1-prog')) $('c1-prog').textContent = 'Checking... ' + n + ' / ' + todo.length;
                        await new Promise(r => setTimeout(r, 120));
                    }
                    if (m.isOpen()) draw();
                };
            };
            draw(); m.open();
        }
        SLF.openClosest = openClosest;
        SLF.addTile('Play smarter', '🏁', 'Closest to 100%', 'Games where only a few achievements are left, closest first.', openClosest);
    });

    // ---------- play calendar ----------
    safe('calendar', () => {
        async function openCalendar() {
            const m = SLF.modal('cal-modal', 'Play calendar', { cls: 'wide', sub: 'Every day you played in the last year.' });
            m.body.innerHTML = '<div class="fx-empty">Loading...</div>'; m.open();
            const hist = await SLF.sessions(), per = {};
            hist.forEach(h => { const d = new Date(h.start), k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); per[k] = (per[k] || 0) + (h.seconds || 0); });
            const today = new Date(); today.setHours(12, 0, 0, 0);
            const start = new Date(today); start.setDate(start.getDate() - (52 * 7 + ((today.getDay() + 6) % 7)));
            const cells = []; for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) { const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); cells.push({ k, date: new Date(d), sec: per[k] || 0 }); }
            const max = Math.max(1, ...cells.map(c => c.sec)), lvl = (s) => s <= 0 ? 0 : s < max * 0.2 ? 1 : s < max * 0.45 ? 2 : s < max * 0.75 ? 3 : 4;
            const col = ['rgba(255,255,255,0.06)', 'color-mix(in srgb,var(--accent-color) 28%,transparent)', 'color-mix(in srgb,var(--accent-color) 50%,transparent)', 'color-mix(in srgb,var(--accent-color) 75%,transparent)', 'var(--accent-color)'];
            const weeks = Math.ceil(cells.length / 7), size = 13, gap = 3;
            let svg = '<svg width="' + (weeks * (size + gap) + 26) + '" height="' + (7 * (size + gap) + 20) + '" style="max-width:100%">';
            ['Mon', 'Wed', 'Fri'].forEach((d, i) => { svg += '<text x="0" y="' + (20 + (i * 2) * (size + gap) + 10) + '" fill="currentColor" opacity=".5" font-size="9">' + d + '</text>'; });
            let lastMonth = -1, lastLabelW = -1;
            cells.forEach((c, i) => {
                const w = Math.floor((i + ((start.getDay() + 6) % 7)) / 7), dow = (c.date.getDay() + 6) % 7;
                if (c.date.getMonth() !== lastMonth && dow < 3 && (lastLabelW < 0 || w - lastLabelW >= 3)) { lastMonth = c.date.getMonth(); lastLabelW = w; svg +='<text x="' + (26 + w * (size + gap)) + '" y="10" fill="currentColor" opacity=".6" font-size="10">' + c.date.toLocaleDateString(undefined, { month: 'short' }) + '</text>'; }
                svg += '<rect x="' + (26 + w * (size + gap)) + '" y="' + (16 + dow * (size + gap)) + '" width="' + size + '" height="' + size + '" rx="3" fill="' + col[lvl(c.sec)] + '"><title>' + c.date.toLocaleDateString() + ': ' + (c.sec ? SLF.hours(c.sec) + ' h' : 'no play') + '</title></rect>';
            });
            svg += '</svg>';
            const active = cells.filter(c => c.sec > 0), total = cells.reduce((s, c) => s + c.sec, 0);
            let gap2 = 0, run = 0; cells.forEach(c => { if (c.sec > 0) run = 0; else { run++; gap2 = Math.max(gap2, run); } });
            let bestStreak = 0, cur = 0; cells.forEach(c => { if (c.sec > 0) { cur++; bestStreak = Math.max(bestStreak, cur); } else cur = 0; });
            const wk = {}; cells.forEach(c => { const mon = new Date(c.date); mon.setDate(mon.getDate() - ((mon.getDay() + 6) % 7)); const k = mon.toDateString(); wk[k] = (wk[k] || 0) + c.sec; });
            const bestWeek = Math.max(0, ...Object.values(wk));
            const dayTot = [0, 0, 0, 0, 0, 0, 0]; cells.forEach(c => { dayTot[(c.date.getDay() + 6) % 7] += c.sec; });
            const names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], bd = dayTot.indexOf(Math.max(...dayTot));
            m.body.innerHTML = '<div style="overflow-x:auto;color:var(--text-primary)">' + svg + '</div><div class="fx-row" style="font-size:11px;color:var(--text-tertiary)">Less ' + col.map(c => '<span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:' + c + '"></span>').join('') + ' More</div>'
                + '<div class="fx-kv"><div><b>' + active.length + '</b><span>days played</span></div><div><b>' + SLF.hours(total) + ' h</b><span>played in the last year</span></div><div><b>' + bestStreak + '</b><span>longest run of days</span></div><div><b>' + gap2 + '</b><span>longest break (days)</span></div><div><b>' + SLF.hours(bestWeek) + ' h</b><span>best week</span></div><div><b>' + (total ? names[bd] : '-') + '</b><span>busiest weekday</span></div></div>'
                + '<div class="fx-note">Built from the sessions SteamLite has tracked (it keeps the latest 5,000).</div>';
        }
        SLF.openCalendar = openCalendar;
        SLF.addTile('Stats', '🗓️', 'Play calendar', 'A heatmap of every day you played, with your best week and longest break.', openCalendar);
    });

    // ---------- library stats, value, genres, duplicates, export ----------
    safe('library-stats', () => {
        let prices = null;
        const price = (g) => prices && prices[gid(g)] ? prices[gid(g)] : null;
        const money = (c) => '$' + (c / 100).toFixed(2);
        async function openStats() {
            const m = SLF.modal('stats-modal', 'Library stats', { cls: 'wide', sub: 'Playtime, value and genres across your whole library.' });
            const draw = async () => {
                const spy = (await feat('spyCache')) || {};
                const games = allGames().filter(g => !g.isShared);
                const totalSec = games.reduce((s, g) => s + getPlaytimeSeconds(g), 0), played = games.filter(g => getPlaytimeSeconds(g) > 0).length;
                let valueHtml = '<div class="fx-row"><button class="fx-btn primary" id="st-val">Calculate library value</button><span class="fx-meta">Uses current Steam store prices (US).</span></div>';
                if (prices) {
                    const paid = games.filter(g => price(g) && price(g).orig > 0);
                    const worth = paid.reduce((s, g) => s + price(g).orig, 0), unplayed = paid.filter(g => hoursOf(g) < 0.1).reduce((s, g) => s + price(g).orig, 0);
                    const cph = paid.filter(g => hoursOf(g) >= 1).map(g => ({ g, c: price(g).orig / 100 / hoursOf(g) })).sort((a, b) => a.c - b.c);
                    valueHtml = '<div class="fx-kv"><div><b>' + money(worth) + '</b><span>library worth (full price)</span></div><div><b>' + money(unplayed) + '</b><span>still unplayed</span></div><div><b>' + (totalSec ? '$' + (worth / 100 / (totalSec / 3600)).toFixed(2) : '-') + '</b><span>average cost per hour</span></div><div><b>' + paid.length + '</b><span>paid games priced</span></div></div>'
                        + '<div class="fx-section">Best value (lowest cost per hour)</div>' + cph.slice(0, 5).map(x => gameRow(x.g, '<div class="fx-meta">$' + x.c.toFixed(2) + ' per hour · ' + SLF.hours(getPlaytimeSeconds(x.g)) + ' h</div>')).join('')
                        + '<div class="fx-section">Worst value (most per hour)</div>' + cph.slice(-5).reverse().map(x => gameRow(x.g, '<div class="fx-meta">$' + x.c.toFixed(2) + ' per hour · ' + SLF.hours(getPlaytimeSeconds(x.g)) + ' h</div>')).join('');
                }
                const gen = {}; games.forEach(g => { const sp = spy[gid(g)]; if (!sp || !sp.genre) return; sp.genre.split(',').map(s => s.trim()).filter(Boolean).forEach(n => { gen[n] = gen[n] || { n: 0, sec: 0 }; gen[n].n++; gen[n].sec += getPlaytimeSeconds(g); }); });
                const gl = Object.entries(gen).sort((a, b) => b[1].sec - a[1].sec).slice(0, 10), gmax = Math.max(1, ...gl.map(x => x[1].sec));
                const have = Object.keys(spy).length;
                const names = {}; allGames().forEach(g => { const k = String(g.name).toLowerCase().replace(/[^a-z0-9]/g, ''); (names[k] = names[k] || []).push(g); });
                const dups = Object.values(names).filter(a => a.length > 1);
                m.body.innerHTML = '<div class="fx-kv"><div><b>' + games.length + '</b><span>games</span></div><div><b>' + installedGames.length + '</b><span>installed</span></div><div><b>' + played + '</b><span>played (' + Math.round(played / Math.max(1, games.length) * 100) + '%)</span></div><div><b>' + SLF.hours(totalSec) + ' h</b><span>total playtime</span></div></div>'
                    + '<div class="fx-section">Value</div>' + valueHtml
                    + '<div class="fx-section">Genres by playtime</div>' + (gl.length ? '<div class="fx-hbar">' + gl.map(([n, v]) => '<div class="fx-hbar-row"><b>' + E(n) + '</b><div class="fx-bar"><i style="width:' + Math.round(v.sec / gmax * 100) + '%"></i></div><span>' + SLF.hours(v.sec) + ' h · ' + v.n + '</span></div>').join('') + '</div>' : '<div class="fx-empty">No genre data yet.</div>')
                    + '<div class="fx-row"><button class="fx-btn" id="st-scan">Scan genres and typical play times</button><span class="fx-meta" id="st-prog">' + have + ' games known (data from SteamSpy)</span></div>'
                    + '<div class="fx-section">Duplicates (' + dups.length + ')</div>' + (dups.length ? dups.slice(0, 12).map(a => '<div class="fx-card"><div class="fx-grow"><div class="fx-name">' + E(a[0].name) + '</div><div class="fx-meta">' + a.map(g => (g.isShared ? 'family-shared' : g.isNonSteam ? 'non-Steam' : 'Steam') + (installedGames.includes(g) ? ' (installed)' : '')).join(' + ') + '</div></div>' + a.filter(g => !hiddenGames.includes(gid(g))).slice(1).map(g => '<button class="fx-btn" data-hide="' + E(gid(g)) + '">Hide ' + (g.isShared ? 'shared copy' : 'duplicate') + '</button>').join('') + '</div>').join('') : '<div class="fx-empty">No duplicate games found.</div>')
                    + '<div class="fx-section">Export</div><div class="fx-row"><button class="fx-btn" id="ex-csv">Export library as CSV</button><button class="fx-btn" id="ex-json">Export as JSON</button></div>';
                if ($('st-val')) $('st-val').onclick = async (e) => { e.target.disabled = true; e.target.textContent = 'Fetching prices...'; const r = await feat('prices', { appids: games.filter(g => /^\d+$/.test(gid(g))).map(gid) }); if (r && r.ok) { prices = r.prices; draw(); } else showToast((r && r.error) || 'Could not get prices.'); };
                $('st-scan').onclick = async (e) => { e.target.disabled = true; const ids = games.filter(g => /^\d+$/.test(gid(g)) && !spy[gid(g)]).map(gid); if (!ids.length) { showToast('Everything is already scanned.'); e.target.disabled = false; return; } await feat('spyBulk', { appids: ids }); showToast('Scanning ' + ids.length + ' games in the background - about ' + Math.ceil(ids.length * 1.1 / 60) + ' min. You can close this window.'); };
                m.body.onclick = async (e) => { const h = e.target.closest('[data-hide]'); if (!h) return; hiddenGames = await window.electronAPI.toggleHidden(h.dataset.hide); showToast('Hidden.'); draw(); };
                $('ex-csv').onclick = () => exportLibrary('csv'); $('ex-json').onclick = () => exportLibrary('json');
            };
            async function exportLibrary(kind) {
                const spy = (await feat('spyCache')) || {};
                const rows = allGames().map(g => { const id = gid(g), t = telemetryCache[id] || {}, a = achievementCache[id], mt = gameMetaCache[id] || {}, p = price(g); return { appid: id, name: g.name, installed: installedGames.includes(g) ? 'yes' : 'no', source: g.isNonSteam ? 'non-Steam' : g.isShared ? 'family-shared' : 'Steam', hours: +(getPlaytimeSeconds(g) / 3600).toFixed(2), launches: t.launches || 0, last_played: t.lastPlayed ? new Date(t.lastPlayed).toISOString().slice(0, 10) : '', status: mt.status || '', rating: mt.rating || '', achievements: a ? a.achieved + '/' + a.total : '', genres: (spy[id] || {}).genre || '', price_usd: p ? (p.orig / 100).toFixed(2) : '' }; });
                let content, ext;
                if (kind === 'csv') { const cols = Object.keys(rows[0] || { appid: '' }); content = [cols.join(',')].concat(rows.map(r => cols.map(c => SLF.csvCell(r[c])).join(','))).join('\r\n'); ext = 'csv'; }
                else { content = JSON.stringify({ exportedAt: new Date().toISOString(), games: rows }, null, 2); ext = 'json'; }
                const r = await feat('saveText', { content, ext, defaultName: 'SteamLite-library.' + ext });
                if (r && r.ok) showToast('Saved ' + rows.length + ' games.');
            }
            onFeat('spyProgress', (d) => { const el = $('st-prog'); if (el) el.textContent = d.finished ? 'Scan finished (' + d.total + ' games)' : 'Scanning... ' + d.done + ' / ' + d.total; if (d.finished && m.isOpen()) draw(); });
            await draw(); m.open();
        }
        SLF.openStats = openStats;
        SLF.addTile('Stats', '📊', 'Library stats', 'Library value, cost per hour, genres, duplicates, and CSV / JSON export.', openStats);
    });

    // ---------- estimated play time, journal, save backups, launch profile (injected into the game window) ----------
    safe('game-extras', () => {
        SLF.gameExtras.push(async (game) => {
            const id = gid(game), host = $('tab-details'); if (!host || host.dataset.slf === id) return; host.dataset.slf = id;
            const anchor = $('sessions-container') || host.lastChild;
            const box = document.createElement('div'); box.id = 'slf-extras'; box.style.marginTop = '20px';
            box.innerHTML = '<div class="fx-row" id="slf-top"><button class="fx-btn" id="slf-upnext"></button></div><div id="slf-spy"></div>'
                + '<div class="section-title" style="font-size:14px;margin-top:18px">Journal</div><div id="slf-journal"></div><div class="fx-row"><textarea class="fx-text" id="slf-jtext" placeholder="Write a note about this game (a goal, a boss you beat, a tip)..." style="min-height:48px"></textarea><button class="fx-btn primary" id="slf-jadd">Add</button></div>';
            host.insertBefore(box, anchor);
            const upBtn = $('slf-upnext'), paintUp = () => { upBtn.textContent = getQ().includes(id) ? '⏭️ In Up Next - remove' : '⏭️ Add to Up Next'; };
            paintUp(); upBtn.onclick = async () => { if (getQ().includes(id)) await SLF.upNextRemove(id); else await SLF.upNextAdd(id); paintUp(); };
            // typical play time from SteamSpy
            if (/^\d+$/.test(id) && !game.isNonSteam) {
                feat('spy', { appid: id }).then(sp => {
                    if (!sp || !sp.avg || !$('slf-spy')) return;
                    const mine = getPlaytimeSeconds(game) / 3600, avg = sp.avg / 60, pct = Math.min(100, Math.round(mine / avg * 100));
                    $('slf-spy').innerHTML = '<div class="fx-card" style="margin-top:6px"><div class="fx-grow"><div class="fx-name">⏱️ Players typically spend about ' + SLF.hours(sp.avg * 60) + ' h here' + (sp.med ? ' (middle player: ' + SLF.hours(sp.med * 60) + ' h)' : '') + '</div><div class="fx-meta">You: ' + SLF.hours(mine * 3600) + ' h · ' + pct + '% of the average' + (sp.tags && sp.tags.length ? ' · ' + sp.tags.slice(0, 4).map(E).join(', ') : '') + '</div><div class="fx-bar"><i style="width:' + pct + '%"></i></div></div></div>';
                }).catch(() => { });
            }
            // journal
            const jList = $('slf-journal');
            const paintJ = (list) => { jList.innerHTML = list && list.length ? list.slice().reverse().map(e => '<div class="fx-card"><div class="fx-grow"><div class="fx-name" style="white-space:normal;font-weight:500">' + E(e.text) + '</div><div class="fx-meta">' + new Date(e.at).toLocaleString() + '</div></div><button class="fx-btn" data-del="' + e.at + '">✕</button></div>').join('') : '<div class="fx-meta">No notes yet.</div>'; };
            paintJ(await feat('journalGet', { appId: id }));
            jList.onclick = async (e) => { const d = e.target.closest('[data-del]'); if (d) paintJ(await feat('journalDel', { appId: id, at: Number(d.dataset.del) })); };
            $('slf-jadd').onclick = async () => { const t = $('slf-jtext').value.trim(); if (!t) return; const r = await feat('journalAdd', { appId: id, text: t }); if (r) { $('slf-jtext').value = ''; paintJ(r); } };
            // launch profile + save backups go inside the Properties panel
            const props = $('props-container'); if (!props) return;
            const lp = await feat('launchProfileGet', { appId: id }), sb = await feat('saveInfo', { appId: id });
            const sec = document.createElement('div');
            sec.innerHTML = '<div class="section-title" style="font-size:14px;margin-top:16px">Launch profile</div>'
                + '<div class="fx-row"><label class="fx-meta">Priority</label><select class="fx-select" id="lp-pr"><option value="">Normal</option><option value="abovenormal">Above normal</option><option value="high">High</option></select><label class="fx-meta"><input type="checkbox" id="lp-pw"> High-performance power plan while playing</label></div>'
                + '<input class="fx-input" id="lp-close" style="width:100%;box-sizing:border-box" placeholder="Programs to close before launch, e.g. chrome.exe, discord.exe">'
                + '<div class="fx-row"><button class="fx-btn" id="lp-save">Save launch profile</button><span class="fx-note">Closing a program ends it without saving - only list ones you do not mind closing.</span></div>'
                + '<div class="section-title" style="font-size:14px;margin-top:16px">Save backups</div><div class="fx-meta" id="sb-path"></div>'
                + '<div class="fx-row"><button class="fx-btn" id="sb-choose">Choose save folder</button><button class="fx-btn" id="sb-now">Back up now</button><label class="fx-meta"><input type="checkbox" id="sb-auto"> Back up when the game closes</label></div><div id="sb-list"></div>';
            props.appendChild(sec);
            $('lp-pr').value = lp.priority || ''; $('lp-pw').checked = lp.powerPlan === 'high'; $('lp-close').value = lp.closeApps || '';
            $('lp-save').onclick = async () => { await feat('launchProfileSet', { appId: id, priority: $('lp-pr').value, closeApps: $('lp-close').value, powerPlan: $('lp-pw').checked ? 'high' : '' }); showToast('Launch profile saved.'); };
            const paintSb = (info) => {
                $('sb-path').textContent = info.path ? 'Save folder: ' + info.path : 'No save folder chosen yet (look in Documents, AppData\\Local or the game folder).';
                $('sb-auto').checked = !!info.auto;
                $('sb-list').innerHTML = info.backups.length ? info.backups.slice(0, 6).map(b => '<div class="fx-card"><div class="fx-grow"><div class="fx-name">' + E(b.name.replace('T', ' ').replace(/-(\d\d)-(\d\d)(?=[_]|$)/, ':$1:$2')) + '</div></div><button class="fx-btn" data-restore="' + E(b.name) + '">Restore</button></div>').join('') : '<div class="fx-meta">No backups yet.</div>';
            };
            paintSb(sb);
            $('sb-choose').onclick = async () => { const r = await feat('saveChoose', { appId: id }); if (r && r.ok) paintSb(await feat('saveInfo', { appId: id })); };
            $('sb-auto').onchange = (e) => feat('saveAuto', { appId: id, auto: e.target.checked });
            $('sb-now').onclick = async () => { const r = await feat('saveRun', { appId: id }); showToast(r && r.ok ? 'Save backed up.' : (r.error || 'Could not back up.')); paintSb(await feat('saveInfo', { appId: id })); };
            $('sb-list').onclick = async (e) => { const b = e.target.closest('[data-restore]'); if (!b) return; if (!(await showConfirm('Restore this backup?', 'The save files will be replaced. A safety copy of what is there now is made first.'))) return; const r = await feat('saveRestore', { appId: id, name: b.dataset.restore }); showToast(r && r.ok ? 'Save restored.' : (r.error || 'Could not restore.')); paintSb(await feat('saveInfo', { appId: id })); };
        });
    });

    // ---------- global journal / timeline ----------
    safe('journal', () => {
        async function openJournal() {
            const m = SLF.modal('journal-modal', 'Game journal', { cls: 'wide', sub: 'Your notes and play sessions on one timeline.' });
            m.body.innerHTML = '<div class="fx-empty">Loading...</div>'; m.open();
            const [j, hist] = await Promise.all([feat('journalGet', {}), SLF.sessions()]);
            const items = [];
            Object.keys(j || {}).forEach(id => (j[id] || []).forEach(e => items.push({ t: e.at, kind: 'note', id, text: e.text })));
            hist.slice(-400).forEach(h => items.push({ t: h.start, kind: 'session', id: String(h.gameId), name: h.name, sec: h.seconds }));
            items.sort((a, b) => b.t - a.t);
            const draw = (filter) => {
                const shown = items.filter(i => { const g = SLF.gameById(i.id), n = g ? g.name : (i.name || ''); return !filter || n.toLowerCase().includes(filter); }).slice(0, 250);
                let lastDay = '', html = '';
                shown.forEach(i => {
                    const day = new Date(i.t).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
                    if (day !== lastDay) { html += '<div class="fx-section">' + E(day) + '</div>'; lastDay = day; }
                    const g = SLF.gameById(i.id), name = g ? g.name : (i.name || 'Game');
                    html += i.kind === 'note' ? '<div class="fx-card"><span style="font-size:18px">📝</span><div class="fx-grow"><div class="fx-name" style="white-space:normal;font-weight:500">' + E(i.text) + '</div><div class="fx-meta">' + E(name) + ' · ' + new Date(i.t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + '</div></div></div>'
                        : '<div class="fx-card"><span style="font-size:18px">🎮</span><div class="fx-grow"><div class="fx-name" style="font-weight:500">' + E(name) + '</div><div class="fx-meta">Played ' + Math.max(1, Math.round(i.sec / 60)) + ' min · ' + new Date(i.t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + '</div></div></div>';
                });
                $('jr-list').innerHTML = html || '<div class="fx-empty">Nothing to show.</div>';
            };
            m.body.innerHTML = '<div class="fx-row"><input class="fx-input" id="jr-filter" placeholder="Filter by game..." style="flex:1"></div><div id="jr-list"></div>';
            $('jr-filter').oninput = (e) => draw(e.target.value.trim().toLowerCase()); draw('');
        }
        SLF.openJournal = openJournal;
        SLF.addTile('Stats', '📓', 'Game journal', 'Your notes and play sessions on a timeline. Add notes inside any game.', openJournal);
    });

    // ---------- co-op finder ----------
    safe('coop', () => {
        async function openCoop(preId) {
            const m = SLF.modal('coop-modal', 'Co-op finder', { cls: 'wide', sub: 'Pick a friend to see which games you both own.' });
            const fr = (friendsCache || []).slice().sort((a, b) => ((b.personastate > 0 ? 1 : 0) - (a.personastate > 0 ? 1 : 0)) || friendDisplayName(a).localeCompare(friendDisplayName(b)));
            m.body.innerHTML = '<div class="fx-row"><select class="fx-select" id="co-pick" style="flex:1"><option value="">Choose a friend...</option>' + fr.map(f => '<option value="' + E(f.steamid) + '">' + E(friendDisplayName(f)) + (f.gameextrainfo ? ' - playing ' + E(f.gameextrainfo) : f.personastate > 0 ? ' - online' : '') + '</option>').join('') + '</select></div><div id="co-res"></div>';
            const run = async (id) => {
                if (!id) { $('co-res').innerHTML = ''; return; }
                $('co-res').innerHTML = '<div class="fx-empty">Loading their games...</div>';
                const r = await feat('friendGames', { steamId: id });
                if (!r || !r.ok) { $('co-res').innerHTML = '<div class="fx-empty">' + E((r && r.error) || 'Could not load their games.') + '</div>'; return; }
                const mine = new Map(allGames().map(g => [gid(g), g])), common = r.games.filter(g => mine.has(g.appid)).map(g => ({ g: mine.get(g.appid), theirs: g.minutes })).sort((a, b) => (hoursOf(b.g) * 60 + b.theirs) - (hoursOf(a.g) * 60 + a.theirs));
                const f = (friendsCache || []).find(x => x.steamid === id);
                $('co-res').innerHTML = '<div class="fx-row"><b style="color:var(--text-primary)">' + common.length + ' game' + (common.length === 1 ? '' : 's') + ' in common</b><button class="fx-btn" id="co-msg">💬 Message ' + E(f ? friendDisplayName(f) : 'them') + ' on Steam</button></div>'
                    + (common.length ? common.slice(0, 60).map(c => gameRow(c.g, '<div class="fx-meta">You: ' + SLF.hours(getPlaytimeSeconds(c.g)) + ' h · They: ' + SLF.hours(c.theirs * 60) + ' h' + (installedGames.includes(c.g) ? ' · installed' : ' · not installed') + '</div>')).join('') : '<div class="fx-empty">No games in common (or their list is private).</div>');
                $('co-msg').onclick = () => window.electronAPI.openExternal('steam://friends/message/' + id);
            };
            $('co-pick').onchange = (e) => run(e.target.value);
            m.open();
            if (preId) { $('co-pick').value = preId; run(preId); }
        }
        SLF.openCoop = openCoop;
        SLF.addTile('Social', '🤝', 'Co-op finder', 'See which games you and a friend both own, most played first.', () => openCoop());
    });

    // ---------- wishlist: target prices and price history ----------
    safe('wishlist-extras', () => {
        onFeat('wishlistTarget', (items) => showToast('🎯 Price you wanted: ' + items.map(i => i.name + ' is ' + i.price).slice(0, 2).join(', '), () => window.openWishlist && window.openWishlist(), { sound: 'chime', notification: true }));
        const orig = window.openWishlist;
        window.openWishlist = async function () {
            await orig.apply(this, arguments);
            try {
                const [meta, wl] = await Promise.all([feat('wishlistMeta'), window.electronAPI.getWishlist(false)]);
                if (!wl || !wl.ok) return;
                const byId = {}; wl.items.forEach(i => { byId[i.appid] = i; });
                document.querySelectorAll('#wishlist-body .wl-item').forEach(el => {
                    const it = byId[el.dataset.appid]; if (!it || el.querySelector('.wl-extra')) return;
                    el.style.flexWrap = 'wrap';
                    const hist = (meta.history || {})[it.appid] || [], target = (meta.targets || {})[it.appid];
                    const prefix = (/^\D*/.exec(it.price || '') || [''])[0].trim();
                    const fmt = (c) => (prefix || '$') + (c / 100).toFixed(2);
                    let spark = '';
                    if (hist.length >= 2) { const vs = hist.map(h => h.c), mn = Math.min(...vs), mx = Math.max(...vs), w = 110, h = 22; spark = '<svg width="' + w + '" height="' + h + '" style="vertical-align:middle"><polyline fill="none" stroke="var(--accent-color)" stroke-width="1.6" points="' + vs.map((v, i) => (i / (vs.length - 1) * w).toFixed(1) + ',' + (mx === mn ? h / 2 : (h - 3 - (v - mn) / (mx - mn) * (h - 6))).toFixed(1)).join(' ') + '"/></svg>'; }
                    const low = hist.length ? Math.min(...hist.map(h => h.c)) : 0;
                    const ex = document.createElement('div'); ex.className = 'wl-extra'; ex.style.cssText = 'flex-basis:100%;display:flex;gap:12px;align-items:center;flex-wrap:wrap;font-size:12px;color:var(--text-secondary);padding-left:132px';
                    ex.innerHTML = (low ? '<span>Lowest seen: <b>' + fmt(low) + '</b></span>' : '') + spark
                        + (it.comingSoon ? '' : '<span>Alert me below <input class="fx-input" type="number" step="0.01" min="0" style="width:78px;padding:4px 8px" value="' + (target ? (target / 100).toFixed(2) : '') + '" placeholder="0.00"> <button class="fx-btn" style="padding:4px 10px">' + (target ? 'Update' : 'Set') + '</button>' + (target ? ' <button class="fx-btn" style="padding:4px 10px" data-clear>Clear</button>' : '') + '</span>');
                    el.appendChild(ex);
                    ex.addEventListener('click', (e) => e.stopPropagation());
                    const inp = ex.querySelector('input'), btn = ex.querySelector('button:not([data-clear])'), clr = ex.querySelector('[data-clear]');
                    if (btn) btn.onclick = async () => { const v = Math.round(parseFloat(inp.value) * 100); if (!(v > 0)) { showToast('Type a price first.'); return; } await feat('wishlistTarget', { appid: it.appid, cents: v }); showToast('I will tell you when ' + it.name + ' drops to ' + fmt(v) + ' or less.'); window.openWishlist(); };
                    if (clr) clr.onclick = async () => { await feat('wishlistTarget', { appid: it.appid, cents: 0 }); window.openWishlist(); };
                });
            } catch (e) { console.error('[wishlist extras]', e); }
        };
    });

    // ---------- free games and sale calendar ----------
    safe('free-games', () => {
        const SALES = [[2, 9, 2, 16, 'Lunar New Year Sale'], [3, 16, 3, 23, 'Spring Sale'], [6, 25, 7, 9, 'Summer Sale'], [10, 23, 10, 30, 'Scream Fest'], [11, 25, 12, 2, 'Autumn Sale'], [12, 18, 1, 5, 'Winter Sale']];
        function nextWindow(s, now) {
            for (const y of [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1]) {
                const a = new Date(y, s[0] - 1, s[1]), b = new Date(y + (s[2] < s[0] ? 1 : 0), s[2] - 1, s[3] + 1);
                if (now < b) return { a, b, live: now >= a };
            }
        }
        async function openFree() {
            const m = SLF.modal('free-modal', 'Free games & sales', { sub: 'What is free on Steam right now, and when the next big sale usually is.' });
            const now = new Date();
            const cal = SALES.map(s => ({ s, w: nextWindow(s, now) })).sort((a, b) => a.w.a - b.w.a);
            m.body.innerHTML = '<div class="fx-section">Sale calendar (usual dates - Steam announces the exact ones)</div>' + cal.map(({ s, w }) => '<div class="fx-card"><span style="font-size:18px">🏷️</span><div class="fx-grow"><div class="fx-name">' + E(s[4]) + '</div><div class="fx-meta">' + w.a.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' - ' + new Date(w.b - 86400000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + '</div></div><span class="fx-meta" style="font-weight:700;color:' + (w.live ? 'var(--success)' : 'var(--text-secondary)') + '">' + (w.live ? 'probably on now' : 'in ' + Math.ceil((w.a - now) / 86400000) + ' days') + '</span></div>').join('')
                + '<div class="fx-section">Free right now</div><div id="fr-free"><div class="fx-empty">Loading...</div></div><div class="fx-section">Big discounts (75% or more)</div><div id="fr-big"></div>'
                + '<div class="fx-row"><button class="fx-btn" id="fr-refresh">Refresh</button></div>';
            m.open();
            const load = async (force) => {
                const r = await feat('freeGames', { force });
                if (!r || !r.ok) { $('fr-free').innerHTML = '<div class="fx-empty">' + E((r && r.error) || 'Could not reach the Steam store.') + '</div>'; return; }
                $('fr-free').innerHTML = r.items.free.length ? r.items.free.map(i => '<div class="fx-card" data-app="' + E(i.appid) + '" style="cursor:pointer"><img class="cover" src="steamlite://cache/' + E(i.appid) + '" onerror="this.style.visibility=\'hidden\'"><div class="fx-grow"><div class="fx-name">' + E(i.name) + '</div><div class="fx-meta">' + (i.until ? 'Free until ' + new Date(i.until).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Free') + '</div></div></div>').join('') : '<div class="fx-empty">No free promotions found right now.</div>';
                $('fr-big').innerHTML = r.items.big.length ? r.items.big.map(i => '<div class="fx-card" data-app="' + E(i.appid) + '" style="cursor:pointer"><img class="cover" src="steamlite://cache/' + E(i.appid) + '" onerror="this.style.visibility=\'hidden\'"><div class="fx-grow"><div class="fx-name">' + E(i.name) + '</div><div class="fx-meta">-' + i.discount + '% · $' + E(i.price) + '</div></div></div>').join('') : '<div class="fx-empty">Nothing at 75% or more.</div>';
                m.body.querySelectorAll('[data-app]').forEach(c => c.onclick = () => window.electronAPI.openExternal('https://store.steampowered.com/app/' + c.dataset.app + '/'));
            };
            $('fr-refresh').onclick = () => load(true);
            load(false);
        }
        SLF.openFree = openFree;
        SLF.addTile('Money', '🎁', 'Free games & sales', 'Free-to-keep promotions, 75%+ discounts and a calendar of the big Steam sales.', openFree);
    });

    // wishlist tile (existing feature) also shows in the hub
    safe('hub-links', () => {
        SLF.addTile('Money', '🏷️', 'Wishlist and Sales', 'Your wishlist with prices, price history and target-price alerts.', () => window.openWishlist(), false);
        SLF.addTile('Stats', '🎞️', 'Year in Review', 'A picture of your year in games to save.', () => window.openYearReview(), false);
        SLF.addTile('Stats', '🎒', 'Inventory', 'Level, streak restores, challenges and rewards.', () => window.openInventory(), false);
        SLF.addTile('Social', '👥', 'Friend activity', 'Who started playing what and who came online.', () => window.openFriendActivity(), false);
    });
})();
