// SteamLite 9.1.0 - SteamLite Online: the global leaderboard, the community theme gallery and live announcements.
// They talk to the SteamLite server (see the server folder). With no server, they say so and nothing else changes.
(function () {
    'use strict';
    if (!window.SLF || !window.electronAPI) return;
    const SLF = window.SLF, $ = (id) => document.getElementById(id), E = SLF.E, feat = SLF.feat, api = window.electronAPI;
    const css = document.createElement('style');
    css.textContent = `
    .on-note { padding: 22px 18px; text-align: center; color: var(--text-secondary); font-size: 13.5px; line-height: 1.5; }
    .lbg-row { display: flex; align-items: center; gap: 12px; padding: 9px 14px; border-radius: 14px; background: var(--bg-glass); border: 1px solid var(--border-glass); margin-bottom: 6px; }
    .lbg-row.me { border-color: var(--accent-color); background: color-mix(in srgb, var(--accent-color) 14%, var(--bg-glass)); } .lbg-row.top1 { border-color: rgba(251, 191, 36, 0.6); } .lbg-row.top2 { border-color: rgba(203, 213, 225, 0.5); } .lbg-row.top3 { border-color: rgba(217, 119, 6, 0.55); }
    .lbg-rank { width: 34px; text-align: center; font-weight: 800; font-size: 15px; color: var(--text-secondary); } .lbg-row.top1 .lbg-rank { color: #fbbf24; } .lbg-name { flex: 1; min-width: 0; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .lbg-val { font-weight: 800; font-variant-numeric: tabular-nums; } .lbg-ok { color: var(--accent-color); font-size: 12px; margin-left: 2px; } .lbg-sub { font-size: 11.5px; color: var(--text-tertiary); width: 70px; text-align: right; }
    .lbg-opt { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 12px 14px; border-radius: 16px; background: var(--bg-glass); border: 1px solid var(--border-glass); margin-bottom: 14px; }
    .cg-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
    .cg-card { display: flex; flex-direction: column; gap: 8px; padding: 14px; border-radius: 18px; background: var(--bg-glass); border: 1px solid var(--border-glass); transition: transform 0.25s var(--ease-spring), border-color 0.2s; } .cg-card:hover { transform: translateY(-3px); border-color: var(--border-glass-hover); }
    .cg-sw { display: flex; gap: 4px; } .cg-sw i { flex: 1; height: 26px; border-radius: 9px; } .cg-card b { font-size: 14px; } .cg-card small { color: var(--text-secondary); font-size: 12px; } .cg-row { display: flex; gap: 8px; align-items: center; margin-top: auto; }
    .cg-like { display: inline-flex; align-items: center; gap: 5px; padding: 6px 12px; border-radius: 999px; border: 1px solid var(--border-glass); background: transparent; color: var(--text-secondary); cursor: pointer; font-family: inherit; font-size: 12.5px; font-weight: 700; } .cg-like.on { color: #f472b6; border-color: #f472b6; }
    `;
    document.head.appendChild(css);
    const NOT = '<div class="on-note"><b style="color:var(--text-primary)">SteamLite Online is not available right now.</b><br>The server might be off or not set up yet. Everything else in the app works as normal.</div>';
    const info = async () => { try { return (await feat('srvInfo')) || {}; } catch (e) { return {}; } };
    const fmt = (n) => Number(n).toLocaleString('en-US');

    // ================= leaderboard =================
    async function myStats() {
        let mt = null; try { mt = await api.getMetaAchievements({ librarySize: installedGames.length + uninstalledGames.length }); } catch (e) { }
        const all = SLF.allGames().filter(g => !g.isShared);
        return { level: mt && mt.level ? mt.level.level : 1, hours: Math.round(all.reduce((s, g) => s + getPlaytimeSeconds(g), 0) / 3600), streak: mt && mt.streak ? mt.streak.best : 0, achievements: mt ? mt.achievements.filter(a => a.unlockedAt).length : 0, games: all.length };
    }
    async function submitMe() { if (!getUiPref('lbOptIn', false)) return null; const name = await feat('srvLbName'); if (!name) return null; return feat('srvLbSubmit', Object.assign({ name }, await myStats())); }
    setTimeout(submitMe, 20000); setInterval(submitMe, 3600000);
    const METRICS = [['level', 'Level'], ['hours', 'Hours'], ['streak', 'Streak'], ['achievements', 'Achievements']];
    async function openLb(metric) {
        metric = metric || 'level';
        const m = SLF.modal('lbg-modal', 'Global leaderboard', { cls: 'narrow', sub: 'The top SteamLite players. You only show up if you choose to.' });
        m.body.innerHTML = '<div class="fx-empty">Loading...</div>'; m.open();
        const inf = await info(); if (!inf.configured || !inf.online) { m.body.innerHTML = NOT; return; }
        const [r, myName] = await Promise.all([feat('srvLb', { metric }), feat('srvLbName')]);
        if (!r || !r.ok) { m.body.innerHTML = NOT; return; }
        const on = getUiPref('lbOptIn', false);
        const val = (x) => metric === 'hours' ? fmt(x.hours) + ' h' : metric === 'streak' ? x.streak + ' days' : metric === 'achievements' ? x.achievements : 'Lv ' + x.level;
        m.body.innerHTML = '<div class="lbg-opt"><label class="switch-toggle"><input type="checkbox" id="lbg-on"' + (on ? ' checked' : '') + '><span class="switch-slider"></span></label><span style="flex:1;min-width:140px"><b>Show me on the leaderboard</b><br><span class="fx-meta">Shares your name, level, hours, streak and achievement count. Nothing else.</span></span><input class="fx-input" id="lbg-name" maxlength="24" placeholder="Display name" value="' + E(myName || '') + '" style="width:150px"><button class="fx-btn" id="lbg-save">Save</button></div>' +
            '<div class="fx-row">' + METRICS.map(x => '<button class="fx-chip' + (x[0] === metric ? ' active' : '') + '" data-m="' + x[0] + '">' + x[1] + '</button>').join('') + '<span class="fx-meta" style="margin-left:auto">' + fmt(r.total) + ' players' + (r.myRank ? ' · you are #' + r.myRank : '') + '</span></div>' +
            (r.rows.length ? r.rows.map(x => '<div class="lbg-row' + (x.me ? ' me' : '') + (x.rank <= 3 ? ' top' + x.rank : '') + '"><span class="lbg-rank">' + x.rank + '</span><span class="lbg-name">' + E(x.name) + (x.verified ? ' <span class="lbg-ok" title="Signed in with Steam">&#10003;</span>' : '') + '</span><span class="lbg-sub">Lv ' + x.level + '</span><span class="lbg-val">' + val(x) + '</span></div>').join('') : '<div class="fx-empty">Nobody has joined yet. Be the first!</div>') +
            (on ? '<div class="fx-row"><button class="fx-btn danger" id="lbg-remove">Remove me from the leaderboard</button></div>' : '');
        m.body.onclick = async (e) => {
            const c = e.target.closest('[data-m]'); if (c) { openLb(c.dataset.m); return; }
            if (e.target.id === 'lbg-save') {
                const name = $('lbg-name').value.trim(); if (name.replace(/[^\p{L}\p{N}]/gu, '').length < 2) { showToast('Pick a name with at least 2 letters or numbers.'); return; }
                await setUiPref({ lbOptIn: $('lbg-on').checked }); if ($('lbg-on').checked) { const res = await feat('srvLbSubmit', Object.assign({ name }, await myStats())); showToast(res && res.ok ? 'You are on the leaderboard.' : ((res && res.error) || 'Could not post.')); } else { await feat('srvLbRemove'); showToast('You are off the leaderboard.'); }
                openLb(metric);
            } else if (e.target.id === 'lbg-remove') { await setUiPref({ lbOptIn: false }); await feat('srvLbRemove'); showToast('Removed from the leaderboard.'); openLb(metric); }
        };
    }

    // ================= community themes =================
    const SAFE_CSS = (c) => !/@import|@font-face|url\s*\(|expression|javascript:|behavior|binding|<|>|\\|image-set/i.test(String(c || ''));
    const SAFE_VAR = (k, v) => /^--[a-z0-9-]{1,40}$/.test(k) && /^[#a-zA-Z0-9(),.%\s\/-]+$/.test(String(v)) && !/url|expression|javascript/i.test(String(v));
    async function openGallery(sort) {
        if (window.SLThemes) { SLThemes.open('community'); return; } // the Themes window has the community gallery now
        sort = sort || 'liked';
        const m = SLF.modal('cg-modal', 'Community themes', { cls: 'wide', sub: 'Themes made by other SteamLite players. Every theme is reviewed before it shows up here.' });
        m.body.innerHTML = '<div class="fx-empty">Loading...</div>'; m.open();
        const inf = await info(); if (!inf.configured || !inf.online) { m.body.innerHTML = NOT; return; }
        const r = await feat('srvThemes', { sort }); if (!r || !r.ok) { m.body.innerHTML = NOT; return; }
        const mine = (r.mine || []).map(t => '<span class="fx-chip" title="Waiting for review or not accepted">' + E(t.name) + ': ' + (t.status === 'pending' ? 'waiting for review' : 'not accepted') + '</span>').join(' ');
        m.body.innerHTML = '<div class="fx-row"><button class="fx-chip' + (sort === 'liked' ? ' active' : '') + '" data-s="liked">Most liked</button><button class="fx-chip' + (sort === 'new' ? ' active' : '') + '" data-s="new">Newest</button><button class="fx-btn primary" id="cg-share" style="margin-left:auto">Share one of my themes</button></div>' + (mine ? '<div class="fx-row">' + mine + '</div>' : '') +
            (r.themes.length ? '<div class="cg-grid">' + r.themes.map(t => '<div class="cg-card"><div class="cg-sw">' + (t.colors || []).map(c => '<i style="background:' + E(c) + '"></i>').join('') + '</div><b>' + E(t.name) + '</b><small>by ' + E(t.author) + (t.desc ? ' · ' + E(t.desc) : '') + '</small><div class="cg-row"><button class="fx-btn primary" data-a="' + E(t.id) + '">Apply</button><button class="cg-like' + (t.liked ? ' on' : '') + '" data-l="' + E(t.id) + '">♥ ' + t.likes + '</button></div></div>').join('') + '</div>' : '<div class="fx-empty">No community themes yet. Share the first one!</div>');
        m.body.onclick = async (e) => {
            const s = e.target.closest('[data-s]'), a = e.target.closest('[data-a]'), l = e.target.closest('[data-l]');
            if (s) { openGallery(s.dataset.s); return; }
            if (l) { const res = await feat('srvThemeLike', { id: l.dataset.l }); if (res && res.ok) { l.classList.toggle('on', res.liked); l.textContent = '♥ ' + res.likes; playSound('favorite'); } return; }
            if (a) {
                a.disabled = true; const t = await feat('srvTheme', { id: a.dataset.a }); a.disabled = false;
                if (!t || !t.ok || !t.vars) { showToast('Could not load that theme.'); return; }
                const vars = {}; Object.entries(t.vars).forEach(([k, v]) => { if (SAFE_VAR(k, v)) vars[k] = v; });
                if (!Object.keys(vars).length || !SAFE_CSS(t.css)) { showToast('That theme did not pass the safety check.'); return; }
                applyThemeObject({ vars, css: t.css || '' }); playSound('success'); showToast('Applied "' + t.name + '". Change it back any time in Settings > Appearance > Browse Themes.'); return;
            }
            if (e.target.id === 'cg-share') shareTheme();
        };
    }
    async function shareTheme() {
        const mine = (activeConfig.customThemes || []).filter(t => t && t.vars);
        const m = SLF.modal('cgs-modal', 'Share a theme', { cls: 'narrow', sub: 'Pick a theme you made with the Theme Maker. It is checked and reviewed before anyone can see it.' });
        m.body.innerHTML = mine.length ? mine.map((t, i) => '<div class="fx-card"><div class="fx-grow"><div class="fx-name">' + E(t.name || t.id) + '</div></div><button class="fx-btn primary" data-idx="' + i + '">Share</button></div>').join('') + '<div class="fx-note">Only colours and a little CSS are shared (no images, no scripts). Your name is not shared unless you type one.</div>' : '<div class="fx-empty">You have not made a theme yet. Make one in Settings > Appearance > Browse Themes > Create Theme.</div>';
        m.open();
        m.body.onclick = async (e) => {
            const b = e.target.closest('[data-idx]'); if (!b) return; const t = mine[+b.dataset.idx];
            const author = await showPrompt('Your name on the theme', 'Shown next to the theme (optional).', (await feat('srvLbName')) || ''); if (author === null) return;
            const res = await feat('srvThemeShare', { name: t.name || 'My theme', desc: '', author: author || 'Anonymous', vars: t.vars, css: t.css || '' });
            showToast(res && res.ok ? 'Sent for review. It appears here once it is approved.' : ((res && res.error) || 'Could not share it.')); if (res && res.ok) m.close();
        };
    }

    // ================= announcements + gifts =================
    setTimeout(async () => {
        try {
            const r = await feat('srvStatus'); if (!r || !r.ok) return;
            const seen = getUiPref('annSeen', {});
            for (const a of (r.announcements || [])) { if (seen[a.id]) continue; seen[a.id] = Date.now(); await setUiPref({ annSeen: seen }); showToast((a.title || 'Announcement') + (a.text ? ': ' + a.text : ''), a.url && /^https:\/\//.test(a.url) ? () => api.openExternal(a.url) : null, { sound: 'chime', duration: 9000 }); }
            const gs = getUiPref('giftSeen', {});
            for (const g of (r.gifts || [])) { if (gs[g.id]) continue; gs[g.id] = 1; await setUiPref({ giftSeen: gs }); showToast('A special gift is waiting in Drops: ' + g.title, () => window.SLDrops && SLDrops.open(), { sound: 'achievement' }); }
        } catch (e) { }
    }, 9000);

    SLF.safe('online', () => {
        SLF.addTile('Social', '🏆', 'Global leaderboard', 'The top SteamLite players by level, hours, streak or achievements. You only show up if you choose to.', () => openLb());
        SLF.addTile('Social', '🎨', 'Community themes', 'Browse, like and apply themes other players made, or share your own.', () => openGallery());
    });
    SLF.openLeaderboardOnline = openLb; SLF.openGallery = openGallery;
})();
