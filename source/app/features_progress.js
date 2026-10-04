/* SteamLite 8.6.5 - renderer features, part 3: seasons, bingo, prestige, cosmetics, profile card, importing other launchers, library health. */
(function () {
    'use strict';
    const SLF = window.SLF; if (!SLF) return;
    const { $, E, feat, onFeat, safe } = SLF;
    const gid = SLF.gid;
    const meta = async () => { try { return await window.electronAPI.getMetaAchievements({ librarySize: SLF.allGames().length }); } catch (e) { return null; } };

    // ---------- notifications from the new XP sources ----------
    safe('progress-toasts', () => {
        onFeat('seasonReward', (d) => showToast('🏁 Season reward: ' + d.rewards.join(', '), () => SLF.openSeason && SLF.openSeason(), { sound: 'achievement' }));
        onFeat('bingoXp', (d) => showToast('🎯 ' + d.text + ' · +' + d.xp + ' XP', () => SLF.openBingo && SLF.openBingo(), { sound: 'achievement' }));
    });

    // ---------- sound packs unlocked by level (Crystal at 30, Deep at 60, or any prestige) ----------
    safe('sound-packs', () => {
        const derive = (base, k, label) => {
            const out = { label, reverb: base.reverb || 0, events: {} };
            Object.keys(base.events).forEach(ev => { out.events[ev] = base.events[ev].map(v => Array.isArray(v) ? v.map((x, i) => i === 0 ? (Array.isArray(x) ? x.map(f => f * k) : x * k) : x) : v); });
            return out;
        };
        SOUND_PACKS.crystal = derive(SOUND_PACKS.glass, 1.5, 'Crystal');
        SOUND_PACKS.deep = derive(SOUND_PACKS.classic, 0.7, 'Deep');
        const sel = $('adv-sound-pack'); if (!sel) return;
        const need = { crystal: 30, deep: 60 };
        Object.keys(need).forEach(k => { const o = document.createElement('option'); o.value = k; o.textContent = SOUND_PACKS[k].label + ' (level ' + need[k] + ')'; sel.appendChild(o); });
        const refresh = async () => {
            const m = await meta(); if (!m || !m.level) return;
            const lv = (m.prestige && m.prestige.count > 0) ? 100 : m.level.level;
            [...sel.options].forEach(o => { if (need[o.value]) { const ok = lv >= need[o.value]; o.disabled = !ok; o.textContent = SOUND_PACKS[o.value].label + (ok ? '' : ' (reach level ' + need[o.value] + ')'); } });
            sel.value = getUiPref('soundPack', 'glass');
        };
        setTimeout(refresh, 3000);
        $('advanced-toggle').addEventListener('click', () => setTimeout(refresh, 400));
    });

    // ---------- season ----------
    safe('season', () => {
        const ico = { title1: '🏷️', title2: '🏷️', restore: '🛡️', frame: '🖼️', tray: '🔔', theme: '🎨' };
        async function openSeason() {
            const m = SLF.modal('season-modal', 'Season', { cls: 'wide' });
            m.body.innerHTML = '<div class="fx-empty">Loading...</div>'; m.open();
            const [s, c, mt] = await Promise.all([feat('season'), feat('cosmetics'), meta()]);
            if (!s || !s.name) { m.body.innerHTML = '<div class="fx-empty">The season could not be loaded.</div>'; return; }
            const byTier = {}; s.rewards.forEach(r => { byTier[r.tier] = r; });
            const lv = mt && mt.level ? ((mt.prestige && mt.prestige.count > 0) ? 100 : mt.level.level) : 1;
            let tiers = '';
            for (let t = 1; t <= s.tiers; t++) {
                const r = byTier[t], done = s.tier >= t;
                tiers += '<div class="fx-tile" style="cursor:default;' + (done ? 'border-color:var(--accent-color)' : 'opacity:.7') + '"><b>Tier ' + t + (done ? ' ✓' : '') + '</b>' + (r ? '<span>' + ico[r.kind] + ' ' + E(r.label) + '</span>' : '<span>&nbsp;</span>') + '</div>';
            }
            const trays = [{ id: '', name: 'Default' }].concat((c.trays || []).map(t => ({ id: t, name: t[0].toUpperCase() + t.slice(1) })));
            m.body.innerHTML = '<div class="fx-card"><span style="font-size:34px">🏁</span><div class="fx-grow"><div class="fx-name" style="font-size:18px">Season: ' + E(s.name) + '</div><div class="fx-meta">Tier ' + s.tier + ' of ' + s.tiers + ' · ' + s.xp + ' season XP · ' + s.daysLeft + ' day' + (s.daysLeft === 1 ? '' : 's') + ' left</div><div class="fx-bar"><i style="width:' + Math.round((s.tier >= s.tiers ? 1 : s.into / s.tierXp) * 100) + '%"></i></div><div class="fx-meta">' + (s.tier >= s.tiers ? 'Track complete!' : (s.tierXp - s.into) + ' XP to tier ' + (s.tier + 1)) + '</div></div></div>'
                + '<div class="fx-note">Every achievement, challenge and bingo reward you earn this season counts. Rewards are yours for good, even after the season ends.</div>'
                + '<div class="fx-section">Reward track</div><div class="fx-grid">' + tiers + '</div>'
                + '<div class="fx-section">Your cosmetics</div>'
                + '<div class="fx-meta" style="margin-bottom:6px">Titles: ' + ((c.titles || []).length ? c.titles.map(E).join(', ') : 'none yet') + ' · Frames: ' + ((c.frames || []).length ? c.frames.map(E).join(', ') : 'none yet') + '</div>'
                + '<div class="fx-row"><span class="fx-meta">Tray / window icon</span>' + trays.map(t => '<button class="fx-chip' + ((c.equipped && c.equipped.tray || '') === t.id ? ' active' : '') + '" data-tray="' + E(t.id) + '">' + E(t.name) + '</button>').join('') + '</div>'
                + '<div class="fx-meta">Sound packs: ' + [['Crystal', 30], ['Deep', 60]].map(([n, l]) => n + (lv >= l ? ' ✓ unlocked' : ' (level ' + l + ')')).join(' · ') + ' - pick them in Advanced Settings.</div>'
                + '<div class="fx-note">More icons come from seasons (tier 16) and from prestige (gold).</div>';
            m.body.onclick = async (e) => { const b = e.target.closest('[data-tray]'); if (!b) return; playSound('click'); const r = await feat('equip', { tray: b.dataset.tray }); if (r && r.ok === false) showToast(r.error); else showToast('Icon changed.', null, { noHistory: true }); openSeason(); };
        }
        SLF.openSeason = openSeason;
        SLF.addTile('Progress', '🏁', 'Season', 'A three-month reward track: titles, frames, a theme, an icon and a streak restore.', openSeason);
    });

    // ---------- weekly bingo ----------
    safe('bingo', () => {
        async function openBingo() {
            const m = SLF.modal('bingo-modal', 'Weekly bingo', { cls: 'narrow' });
            m.body.innerHTML = '<div class="fx-empty">Loading...</div>'; m.open();
            const [b, x] = await Promise.all([feat('bingo'), feat('challengeExtras')]);
            if (!b || !b.cells) { m.body.innerHTML = '<div class="fx-empty">Could not load the card.</div>'; return; }
            const left = Math.max(0, Math.ceil((b.endsAt - Date.now()) / 86400000));
            const doneLines = b.lines.filter(l => l.done).length;
            m.body.innerHTML = '<div class="fx-sub" style="display:block">Play to fill in squares. A line of three is worth +' + b.lineXp + ' XP, the whole card +' + b.fullBase + ' XP (boosts apply). New card every Monday - ' + left + ' day' + (left === 1 ? '' : 's') + ' left.</div>'
                + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">' + b.cells.map(c => '<div class="fx-tile" style="cursor:default;min-height:92px;' + (c.done ? 'border-color:var(--success,#4ade80);background:color-mix(in srgb,var(--success,#4ade80) 14%,var(--bg-glass))' : '') + '"><b style="font-size:12.5px">' + (c.done ? '✅ ' : '') + E(c.text) + '</b><div class="fx-bar"><i style="width:' + Math.round(c.current / c.max * 100) + '%"></i></div><span>' + (c.unit === 'min' ? (c.current >= 120 ? SLF.hours(c.current * 60) + ' / ' + c.max / 60 + ' h' : c.current + ' / ' + c.max + ' min') : c.current + ' / ' + c.max) + '</span></div>').join('') + '</div>'
                + '<div class="fx-kv"><div><b>' + doneLines + ' / 8</b><span>lines done</span></div><div><b>' + (b.full ? '✅' : '—') + '</b><span>full card</span></div></div>'
                + '<div class="fx-section">Challenge bonuses</div>'
                + '<div class="fx-meta">Clear all 3 daily challenges: +' + x.dailyBonus + ' XP · all 3 weekly: +' + x.weeklyBonus + ' XP · 7 days in a row of clearing every daily: +' + x.streakBonus + ' XP</div>'
                + '<div class="fx-kv"><div><b>' + (x.streak || 0) + '</b><span>days in a row you cleared every daily</span></div></div>';
        }
        SLF.openBingo = openBingo;
        SLF.addTile('Progress', '🎯', 'Weekly bingo', 'A 3x3 card of small play goals. Lines and the full card give bonus XP.', openBingo);
    });

    // ---------- prestige and the season / bingo shortcuts inside the Inventory ----------
    safe('prestige', () => {
        const origInv = window.openInventory;
        window.openInventory = async function () {
            await origInv.apply(this, arguments);
            try {
                const body = $('inventory-body'), m = await meta(); if (!body || !m || !m.level) return;
                const pc = (m.prestige && m.prestige.count) || 0, card = document.createElement('div');
                card.className = 'inv-boost'; card.style.cssText = 'margin:0 0 14px;flex-wrap:wrap';
                const s = await feat('season');
                card.innerHTML = '<span class="inv-boost-icon">🏁</span><div style="flex:1"><b>Season: ' + E(s && s.name || '') + ' · tier ' + (s ? s.tier : 0) + '/20</b><div class="inv-boost-sub">' + (pc ? 'Prestige ★' + pc + '. ' : '') + 'Open the season track, weekly bingo or play calendar from the Tools hub.</div></div><button class="fx-btn" id="inv-season">Season</button><button class="fx-btn" id="inv-bingo">Bingo</button>'
                    + (m.level.maxed ? '<button class="fx-btn primary" id="inv-prestige">★ Prestige</button>' : '');
                body.insertBefore(card, body.children[1] || null);
                $('inv-season').onclick = () => { $('inventory-modal').classList.remove('active'); SLF.openSeason(); };
                $('inv-bingo').onclick = () => { $('inventory-modal').classList.remove('active'); SLF.openBingo(); };
                if ($('inv-prestige')) $('inv-prestige').onclick = async () => {
                    if (!(await showConfirm('Prestige?', 'Your level goes back to 1 and you earn a prestige star (★) and a gold icon. You KEEP every achievement, theme, title, frame and sound pack, and your streak. You will level up again from 0 XP.'))) return;
                    const r = await feat('prestige');
                    if (r && r.ok) { showToast('★ Prestige ' + r.count + '! Your level starts over.'); playSound('achievement'); window.openInventory(); } else showToast((r && r.error) || 'Could not prestige.');
                };
            } catch (e) { console.error('[prestige]', e); }
        };
        // a star next to the SteamLite level on your profile
        const origExtras = window.renderOwnProfileExtras;
        if (typeof origExtras === 'function') window.renderOwnProfileExtras = async function () {
            const r = await origExtras.apply(this, arguments);
            try { const m = await meta(), el = $('profile-sl-level'); if (el && m && m.prestige && m.prestige.count > 0 && !el.dataset.star) { el.dataset.star = '1'; el.insertAdjacentHTML('afterbegin', '<span style="color:#fbbf24">★' + m.prestige.count + '</span> '); } } catch (e) { }
            return r;
        };
    });

    // ---------- profile card ----------
    safe('profile-card', () => {
        const FRAME_COL = { none: ['#ffffff55'], glow: ['#8b5cf6'], ring: ['#8b5cf6', '#a78bfa'], pulse: ['#8b5cf6'], rainbow: ['#f43f5e', '#f59e0b', '#22c55e', '#3b82f6'], flame: ['#ff7a18', '#ffb347'], aurora: ['#34d399', '#a78bfa'], gold: ['#f5c542', '#b8860b'], galaxy: ['#6366f1', '#ec4899', '#22d3ee'], legend: ['#f5c542', '#ff3cac'], frost: ['#7dd3fc', '#c4b5fd'], bloom: ['#fda4af', '#fcd34d'], blaze: ['#fb923c', '#f43f5e'], harvest: ['#d97706', '#84cc16'] };
        async function openCard() {
            const m = SLF.modal('pcard-modal', 'Profile card', { cls: 'narrow' });
            m.body.innerHTML = '<div class="yr-canvas-wrap"><canvas id="pc-canvas" width="900" height="560"></canvas></div><div class="fx-row"><button class="fx-btn primary" id="pc-save">Save image</button></div>';
            m.open();
            const mt = await meta(), custom = getOwnCustom(), cv = $('pc-canvas'), c = cv.getContext('2d');
            const cs = getComputedStyle(document.documentElement), accent = (cs.getPropertyValue('--accent-color') || '#8b5cf6').trim() || '#8b5cf6', bg = (cs.getPropertyValue('--bg-dark') || '#0b0b10').trim() || '#0b0b10';
            const font = (s, w) => (w || '700') + ' ' + s + 'px "Segoe UI", system-ui, sans-serif';
            const g = c.createLinearGradient(0, 0, 900, 560); g.addColorStop(0, bg); g.addColorStop(1, '#000'); c.fillStyle = g; c.fillRect(0, 0, 900, 560);
            const glow = c.createRadialGradient(780, 60, 10, 780, 60, 500); glow.addColorStop(0, accent + '66'); glow.addColorStop(1, 'transparent'); c.fillStyle = glow; c.fillRect(0, 0, 900, 560);
            const name = ($('user-name').dataset.name || 'Player').trim();
            const ring = FRAME_COL[custom.frame] || FRAME_COL.none, rg = c.createLinearGradient(50, 50, 210, 210); ring.forEach((col, i) => rg.addColorStop(ring.length === 1 ? 0 : i / (ring.length - 1), col)); if (ring.length === 1) rg.addColorStop(1, ring[0]);
            const avatar = await new Promise(res => { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => res(im); im.onerror = () => res(null); im.src = $('user-avatar').src; });
            c.strokeStyle = rg; c.lineWidth = 8; c.beginPath(); c.arc(130, 130, 84, 0, Math.PI * 2); c.stroke();
            c.save(); c.beginPath(); c.arc(130, 130, 76, 0, Math.PI * 2); c.clip();
            if (avatar) c.drawImage(avatar, 54, 54, 152, 152); else { c.fillStyle = accent; c.fillRect(54, 54, 152, 152); c.fillStyle = '#fff'; c.font = font(70, '800'); c.textAlign = 'center'; c.fillText(name[0] || '?', 130, 156); c.textAlign = 'left'; }
            c.restore();
            c.fillStyle = '#fff'; c.font = font(46, '800'); c.fillText(name.slice(0, 22), 250, 118);
            const pc = (mt && mt.prestige && mt.prestige.count) || 0;
            c.fillStyle = accent; c.font = font(26, '700'); c.fillText((custom.title || 'SteamLite player') + (pc ? '   ★' + pc : ''), 250, 160);
            if (custom.tagline) { c.fillStyle = '#ffffffaa'; c.font = font(22, '500'); c.fillText(custom.tagline.slice(0, 50), 250, 196); }
            const all = SLF.allGames(), totalSec = all.reduce((s, x) => s + getPlaytimeSeconds(x), 0), unl = mt ? mt.achievements.filter(a => a.unlockedAt).length : 0;
            const tiles = [['Lv ' + (mt && mt.level ? mt.level.level : 1), 'SteamLite level'], [String(all.filter(x => !x.isShared).length), 'games'], [SLF.hours(totalSec) + ' h', 'played'], [unl + '', 'achievements'], [(mt && mt.streak ? mt.streak.best : 0) + '', 'best streak (days)']];
            tiles.forEach((t, i) => { const x = 50 + i * 168, y = 260; c.fillStyle = '#ffffff12'; c.beginPath(); c.roundRect(x, y, 156, 96, 14); c.fill(); c.fillStyle = '#fff'; c.font = font(32, '800'); c.fillText(t[0], x + 14, y + 46); c.fillStyle = '#ffffff99'; c.font = font(16, '500'); c.fillText(t[1], x + 14, y + 76); });
            const top = all.slice().sort((a, b) => getPlaytimeSeconds(b) - getPlaytimeSeconds(a)).slice(0, 3);
            c.fillStyle = '#ffffff88'; c.font = font(15, '700'); c.fillText('MOST PLAYED', 50, 398);
            const covers = await Promise.all(top.map(t => new Promise(res => { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => res(im); im.onerror = () => res(null); im.src = SLF.cover(gid(t)); })));
            top.forEach((t, i) => { const x = 50 + i * 280; c.save(); c.beginPath(); c.roundRect(x, 410, 264, 80, 12); c.clip(); if (covers[i]) c.drawImage(covers[i], x, 410, 264, 80); else { c.fillStyle = '#ffffff1a'; c.fillRect(x, 410, 264, 80); } c.fillStyle = 'rgba(0,0,0,.55)'; c.fillRect(x, 458, 264, 32); c.fillStyle = '#fff'; c.font = font(15, '700'); c.fillText(String(t.name).slice(0, 24) + ' · ' + SLF.hours(getPlaytimeSeconds(t)) + ' h', x + 10, 479); c.restore(); });
            c.fillStyle = '#ffffff55'; c.font = font(14, '500'); c.textAlign = 'right'; c.fillText('SteamLite ' + (activeConfig.appVersion || SLF.version), 850, 535); c.textAlign = 'left';
            $('pc-save').onclick = async () => { try { const r = await window.electronAPI.saveImageFile({ dataUrl: cv.toDataURL('image/png'), defaultName: 'SteamLite-profile-card.png' }); if (r && r.ok) showToast('Image saved.'); } catch (e) { showToast('Could not save the image.'); } };
        }
        SLF.openCard = openCard;
        SLF.addTile('Social', '🪪', 'Profile card', 'A picture of your profile - level, title, frame, streak and most played games - to save.', openCard);
    });

    // ---------- Epic Games / GOG import ----------
    safe('import-launchers', () => {
        SLF.addTile('Library', '📥', 'Import Epic & GOG games', 'Finds games installed through the Epic Games Launcher and GOG Galaxy and adds them to your library.', async () => {
            showToast('Looking for Epic and GOG games...', null, { noHistory: true });
            const found = await feat('scanLaunchers');
            if (!found || !found.length) { showToast('No new Epic or GOG games found.'); return; }
            openImportModal('Import from Epic / GOG', 'Tick the games to add. They launch directly from SteamLite.', found.map(f => ({ name: f.name, exe: f.exe, args: f.args || '' })), true);
        });
    });

    // ---------- library health check ----------
    safe('library-health', () => {
        async function openHealth() {
            const m = SLF.modal('health-modal', 'Library health check', { cls: 'wide', sub: 'Looks for broken installs and leftover cache files from games you no longer have installed.' });
            m.body.innerHTML = '<div class="fx-empty">Checking your Steam libraries...</div>'; m.open();
            const r = await feat('healthCheck');
            if (!r || !r.ok) { m.body.innerHTML = '<div class="fx-empty">' + E((r && r.error) || 'The check failed.') + '</div>'; return; }
            const name = (id) => { const g = SLF.gameById(id); return g ? g.name : 'App ' + id; };
            m.body.innerHTML = '<div class="fx-kv"><div><b>' + r.installed + '</b><span>installed games checked</span></div><div><b>' + r.problems.length + '</b><span>problems</span></div><div><b>' + formatBytes(r.leftoverBytes) + '</b><span>leftover cache</span></div></div>'
                + '<div class="fx-section">Problems</div>' + (r.problems.length ? r.problems.map(p => '<div class="fx-card"><span style="font-size:18px">⚠️</span><div class="fx-grow"><div class="fx-name">' + E(p.name) + '</div><div class="fx-meta">' + E(p.text) + '</div></div><button class="fx-btn" data-verify="' + E(p.appid) + '">Verify in Steam</button></div>').join('') : '<div class="fx-empty">✅ Every installed game looks healthy.</div>')
                + '<div class="fx-section">Leftover shader cache (games that are not installed)</div>'
                + (r.leftovers.length ? '<div class="fx-row"><button class="fx-btn" id="hc-all">Select all</button><button class="fx-btn danger" id="hc-clean">Delete selected</button><span class="fx-meta" id="hc-sel"></span></div>' + r.leftovers.slice(0, 80).map(l => '<label class="fx-card" style="cursor:pointer"><input type="checkbox" data-id="' + E(l.appid) + '" data-size="' + l.size + '"><div class="fx-grow"><div class="fx-name">' + E(name(l.appid)) + '</div></div><span class="fx-meta">' + formatBytes(l.size) + '</span></label>').join('') + '<div class="fx-note">Only Steam\'s shader cache folders are touched. Steam rebuilds them the next time you install and run the game.</div>' : '<div class="fx-empty">No leftover cache found.</div>');
            const upd = () => { const sel = [...m.body.querySelectorAll('input[data-id]:checked')]; if ($('hc-sel')) $('hc-sel').textContent = sel.length + ' selected · ' + formatBytes(sel.reduce((s, c) => s + Number(c.dataset.size), 0)); };
            m.body.onchange = upd;
            m.body.onclick = async (e) => {
                const v = e.target.closest('[data-verify]'); if (v) { window.electronAPI.verifyGame(v.dataset.verify); showToast('Steam is verifying the game files.'); return; }
                if (e.target.id === 'hc-all') { m.body.querySelectorAll('input[data-id]').forEach(c => { c.checked = true; }); upd(); }
                if (e.target.id === 'hc-clean') {
                    const ids = [...m.body.querySelectorAll('input[data-id]:checked')].map(c => c.dataset.id); if (!ids.length) { showToast('Tick something first.'); return; }
                    if (!(await showConfirm('Delete the cache for ' + ids.length + ' game' + (ids.length === 1 ? '' : 's') + '?', 'This cannot be undone, but it is only temporary shader cache that Steam recreates when needed.'))) return;
                    const res = await feat('healthClean', { appids: ids }); showToast(res && res.ok ? 'Freed ' + formatBytes(res.freed) + '.' : 'Could not clean up.'); openHealth();
                }
            };
        }
        SLF.openHealth = openHealth;
        SLF.addTile('Library', '🩺', 'Library health check', 'Finds broken or half-installed games and cleans up leftover shader cache.', openHealth);
    });
})();
