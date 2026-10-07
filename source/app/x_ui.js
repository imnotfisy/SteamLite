// SteamLite 9.1.0 - dashboard widgets (continue playing, this week, daily goal, clock, theme of the week), theme by season,
// and "search everywhere" in the command palette (games, achievements, settings, tools, themes, tags).
(function () {
    'use strict';
    if (!window.SLF || !window.electronAPI) return;
    const SLF = window.SLF, $ = (id) => document.getElementById(id), E = SLF.E, feat = SLF.feat, api = window.electronAPI;
    const css = document.createElement('style');
    css.textContent = `
    .xw-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 14px; margin: 0 0 20px; }
    .xw { position: relative; display: flex; flex-direction: column; gap: 6px; padding: 16px 18px; border-radius: 22px; min-height: 138px; overflow: hidden; background: var(--g-fill, var(--bg-glass)); background-image: var(--glass-sheen, none); border: 1px solid var(--g-line, var(--border-glass)); box-shadow: var(--glass-edge, none); }
    .xw h4 { margin: 0; font-size: 11px; font-weight: 800; letter-spacing: 1.1px; text-transform: uppercase; color: var(--text-tertiary); }
    .xw-clock b { font-size: 40px; font-weight: 800; letter-spacing: -1px; line-height: 1.1; font-variant-numeric: tabular-nums; } .xw-clock span { font-size: 13px; color: var(--text-secondary); }
    .xw-cont { padding: 0; } .xw-cont .bg { position: absolute; inset: 0; background-size: cover; background-position: center; opacity: 0.55; transition: transform 0.6s var(--ease-out); } .xw-cont:hover .bg { transform: scale(1.06); }
    .xw-cont .shade { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.1) 70%); } .xw-cont .in { position: relative; margin-top: auto; padding: 16px 18px; display: flex; flex-direction: column; gap: 4px; } .xw-cont .in h4 { color: rgba(255,255,255,0.7); } .xw-cont b { font-size: 17px; } .xw-cont small { color: rgba(255,255,255,0.75); }
    .xw-cont .xw-play { align-self: flex-start; margin-top: 6px; padding: 7px 16px; border: 0; border-radius: 999px; background: var(--accent-color); color: #fff; font-weight: 800; font-size: 12.5px; cursor: pointer; font-family: inherit; }
    .xw-bars { display: flex; align-items: flex-end; gap: 6px; height: 64px; margin-top: auto; } .xw-bars div { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; justify-content: flex-end; height: 100%; } .xw-bars i { display: block; width: 100%; border-radius: 6px 6px 3px 3px; background: linear-gradient(to top, var(--accent-color), var(--accent-color-2, var(--accent-color))); min-height: 3px; } .xw-bars em { font-style: normal; font-size: 9.5px; color: var(--text-tertiary); }
    .xw-week .tot { font-size: 22px; font-weight: 800; } .xw-week .tot small { font-size: 12px; color: var(--text-secondary); font-weight: 500; }
    .xw-goal { cursor: pointer; flex-direction: row; align-items: center; gap: 16px; } .xw-goal svg { flex: none; width: 84px; height: 84px; transform: rotate(-90deg); } .xw-goal .ring-bg { stroke: rgba(255,255,255,0.12); } .xw-goal .ring { stroke: var(--accent-color); stroke-linecap: round; transition: stroke-dashoffset 0.8s var(--ease-out); } .xw-goal .ring.done { stroke: #4ade80; }
    .xw-goal b { font-size: 19px; display: block; white-space: nowrap; } .xw-goal span { font-size: 12.5px; color: var(--text-secondary); }
    .xw-theme .sw { display: flex; gap: 4px; margin: 4px 0; } .xw-theme .sw i { flex: 1; height: 22px; border-radius: 8px; } .xw-theme b { font-size: 15px; } .xw-theme .row { display: flex; gap: 8px; margin-top: auto; } .xw-theme button { flex: 1; padding: 7px 8px; border-radius: 10px; border: 1px solid var(--border-glass); background: rgba(255,255,255,0.06); color: var(--text-primary); font-weight: 700; font-size: 12px; cursor: pointer; font-family: inherit; } .xw-theme button.p { background: var(--accent-color); border-color: transparent; color: #fff; }
    `;
    document.head.appendChild(css);

    const W = () => Object.assign({ cont: true, week: true, goal: true, clock: true, theme: true }, getUiPref('xWidgets', {}));
    const dayMs = 86400000;
    const todayStart = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); };
    const agoTxt = (ms) => { const d = Math.floor((Date.now() - ms) / dayMs); return d <= 0 ? 'today' : d === 1 ? 'yesterday' : d + ' days ago'; };
    let clockT = 0;
    async function buildRow(head) {
        const w = W(), hist = await SLF.sessions(), parts = [];
        // continue playing
        if (w.cont) {
            const inst = installedGames.filter(g => !g.isShared); let best = null, bt = 0;
            inst.forEach(g => { const t = (telemetryCache[String(g.appid)] || {}).lastPlayed || 0; if (t > bt) { bt = t; best = g; } });
            if (best) parts.push('<div class="xw xw-cont" data-w="cont"><div class="bg" style="background-image:url(\'' + E(SLF.cover(SLF.gid(best))) + '\')"></div><div class="shade"></div><div class="in"><h4>Continue playing</h4><b>' + E(best.name) + '</b><small>Played ' + agoTxt(bt) + ' · ' + SLF.hours(getPlaytimeSeconds(best) ) + ' h total</small><button class="xw-play" data-id="' + E(SLF.gid(best)) + '">Play</button></div></div>');
        }
        // this week
        if (w.week) {
            const bars = [], now = new Date(); let tot = 0, max = 0;
            for (let i = 6; i >= 0; i--) { const s = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i).getTime(), e = s + dayMs; const sec = hist.filter(h => h.start >= s && h.start < e).reduce((a, h) => a + (h.seconds || 0), 0); bars.push({ s, sec }); tot += sec; max = Math.max(max, sec); }
            parts.push('<div class="xw xw-week" data-w="week"><h4>This week</h4><div class="tot">' + (tot / 3600).toFixed(1) + ' <small>hours</small></div><div class="xw-bars">' + bars.map(b => '<div title="' + new Date(b.s).toLocaleDateString(undefined, { weekday: 'long' }) + ': ' + (b.sec / 3600).toFixed(1) + ' h"><i style="height:' + (max ? Math.max(4, Math.round(b.sec / max * 100)) : 4) + '%"></i><em>' + new Date(b.s).toLocaleDateString(undefined, { weekday: 'narrow' }) + '</em></div>').join('') + '</div></div>');
        }
        // daily goal
        if (w.goal) {
            const goal = getUiPref('dailyGoalMin', 60), t0 = todayStart(), min = Math.round(hist.filter(h => h.start >= t0).reduce((a, h) => a + (h.seconds || 0), 0) / 60), pct = Math.min(1, min / goal), C = 2 * Math.PI * 34;
            parts.push('<div class="xw xw-goal" data-w="goal" title="Click to change your daily goal"><svg viewBox="0 0 84 84"><circle class="ring-bg" cx="42" cy="42" r="34" fill="none" stroke-width="9"/><circle class="ring' + (pct >= 1 ? ' done' : '') + '" cx="42" cy="42" r="34" fill="none" stroke-width="9" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (C * (1 - pct)).toFixed(1) + '"/></svg><div><h4>Daily goal</h4><b>' + min + ' / ' + goal + ' min</b><span>' + (pct >= 1 ? 'Goal reached. Nice!' : (goal - min) + ' min to go') + '</span></div></div>');
        }
        // clock
        if (w.clock) parts.push('<div class="xw xw-clock" data-w="clock"><h4>Today</h4><b id="xw-time"></b><span id="xw-date"></span></div>');
        // theme of the week
        if (w.theme) {
            let themes = []; try { const r = await api.getThemeShop(); themes = ((r && r.themes) || []).filter(t => !t.requires && t.file); } catch (e) { }
            if (themes.length) { const wk = Math.floor(Date.now() / (7 * dayMs)), t = themes[wk % themes.length];
                parts.push('<div class="xw xw-theme" data-w="theme"><h4>Theme of the week</h4><b>' + E(t.name) + '</b><div class="sw">' + (t.colors || []).slice(0, 4).map(c => '<i style="background:' + E(c) + '"></i>').join('') + '</div><div class="row"><button data-prev="' + E(t.file) + '" data-id="' + E(t.id) + '" data-n="' + E(t.name) + '">Preview</button><button class="p" data-apply="' + E(t.file) + '">Apply</button></div></div>'); }
        }
        if (!parts.length || !head.isConnected) return;
        const row = document.createElement('div'); row.className = 'xw-row'; row.id = 'xw-row'; row.innerHTML = parts.join(''); head.insertAdjacentElement('afterend', row);
        const tick = () => { const t = $('xw-time'); if (!t) { clearInterval(clockT); return; } const d = new Date(); t.textContent = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); $('xw-date').textContent = d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }); };
        clearInterval(clockT); tick(); if ($('xw-time')) clockT = setInterval(tick, 20000);
        row.addEventListener('click', async (e) => {
            const pl = e.target.closest('.xw-play'), pv = e.target.closest('[data-prev]'), ap = e.target.closest('[data-apply]'), gl = e.target.closest('.xw-goal');
            if (pl) { const g = SLF.gameById(pl.dataset.id); if (g) { playSound('click'); SLF.launch(g); } }
            else if (pv) startThemePreview(pv.dataset.prev, pv.dataset.id, pv.dataset.n);
            else if (ap) { const th = await api.downloadTheme(ap.dataset.apply); if (th && typeof th === 'object' && !th.locked) { applyThemeObject(th); showToast('Theme applied.'); } }
            else if (gl) { const v = await showPrompt('Daily goal', 'How many minutes do you want to play each day?', String(getUiPref('dailyGoalMin', 60))); if (v === null) return; const n = parseInt(v, 10); if (!(n >= 5 && n <= 1440)) { showToast('Pick between 5 and 1440 minutes.'); return; } await setUiPref({ dailyGoalMin: n }); row.remove(); buildRow(head); }
        });
    }
    const vc = $('view-container');
    if (vc) new MutationObserver(() => { const head = vc.querySelector('.home-view .home-header'); if (head && !vc.querySelector('#xw-row') && !head.dataset.xw) { head.dataset.xw = '1'; buildRow(head).catch(() => { }); } }).observe(vc, { childList: true });

    async function openWidgets() {
        const m = SLF.modal('xw-modal', 'Dashboard widgets', { cls: 'narrow', sub: 'Small cards above your dashboard. Switch the ones you do not want off.' }), w = W();
        const L = [['cont', 'Continue playing', 'Your last played game with a Play button'], ['week', 'This week', 'Hours per day for the last 7 days'], ['goal', 'Daily goal', 'A ring that fills as you play today'], ['clock', 'Clock and date', 'The time and today\'s date'], ['theme', 'Theme of the week', 'A theme to try, new every week']];
        m.body.innerHTML = L.map(x => '<div class="ms-sw" style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border-glass)"><div><b style="font-size:13.5px;display:block">' + x[1] + '</b><span style="font-size:11.5px;color:var(--text-secondary)">' + x[2] + '</span></div><label class="switch-toggle"><input type="checkbox" data-k="' + x[0] + '"' + (w[x[0]] ? ' checked' : '') + '><span class="switch-slider"></span></label></div>').join('');
        m.body.onchange = async (e) => { const k = e.target.dataset.k; if (!k) return; await setUiPref({ xWidgets: { ...getUiPref('xWidgets', {}), [k]: e.target.checked } }); showToast('Applies the next time you open Home.', null, { noHistory: true }); };
        m.open();
    }

    // ---- theme by season ----
    const seasonOf = (d) => { const mo = d.getMonth() + 1; return mo === 12 || mo <= 2 ? 'winter' : mo <= 5 ? 'spring' : mo <= 8 ? 'summer' : 'autumn'; };
    async function runSeason() {
        const s = getUiPref('themeSeason', null); if (!s || !s.on) return;
        const sch = getUiPref('themeSchedule', null); if (sch && sch.on) return; // the day / night schedule wins
        const season = seasonOf(new Date()), file = s[season]; if (!file) return;
        const tag = season + ':' + file; if (getUiPref('themeSeasonLast', '') === tag) return;
        const theme = await feat('themeFile', { file }); if (!theme || theme.locked || typeof theme !== 'object') return;
        await setUiPref({ themeSeasonLast: tag }); applyThemeObject(theme);
    }
    setTimeout(runSeason, 6000); setInterval(runSeason, 3600000);
    async function openSeasonThemes() {
        const m = SLF.modal('season-theme-modal', 'Theme by season', { cls: 'narrow', sub: 'SteamLite switches to a theme you pick for each season. (The day / night schedule in Extras settings takes priority when it is on.)' });
        let themes = []; try { themes = ((await api.getThemeShop()).themes || []).filter(t => !t.requires && t.file); } catch (e) { }
        const s = getUiPref('themeSeason', { on: false });
        const sel = (k) => '<select class="fx-select" data-s="' + k + '" style="width:100%"><option value="">(keep current)</option>' + themes.map(t => '<option value="' + E(t.file) + '"' + (s[k] === t.file ? ' selected' : '') + '>' + E(t.name) + '</option>').join('') + '</select>';
        m.body.innerHTML = '<div class="ms-sw" style="display:flex;justify-content:space-between;align-items:center;padding:6px 0 12px"><b>Switch themes by season</b><label class="switch-toggle"><input type="checkbox" id="st-on"' + (s.on ? ' checked' : '') + '><span class="switch-slider"></span></label></div>' +
            [['winter', 'Winter (Dec - Feb)'], ['spring', 'Spring (Mar - May)'], ['summer', 'Summer (Jun - Aug)'], ['autumn', 'Autumn (Sep - Nov)']].map(x => '<div class="fx-section">' + x[1] + '</div>' + sel(x[0])).join('');
        m.body.onchange = async (e) => { const cur = getUiPref('themeSeason', { on: false }); if (e.target.id === 'st-on') cur.on = e.target.checked; else if (e.target.dataset.s) cur[e.target.dataset.s] = e.target.value; await setUiPref({ themeSeason: cur, themeSeasonLast: '' }); runSeason(); };
        m.open();
    }

    // ---- search everywhere: the command palette also finds achievements, settings, tools, themes and tags ----
    const addCmdOnce = (name, icon, action) => { if (!SLF.cmds.some(c => c.name === name)) SLF.addCmd(name, icon, action); };
    async function indexSearch() {
        try {
            const SEC = [['account', 'Account'], ['appearance', 'Appearance'], ['sound', 'Sound & notifications'], ['behaviour', 'Behaviour'], ['performance', 'Performance'], ['updates', 'Updates'], ['data', 'Backup & data'], ['tools', 'Tools & extras']];
            SEC.forEach(([id, n]) => addCmdOnce('Settings: ' + n, '⚙️', () => { const b = document.querySelector('.nav-btn[data-view="settings"]'); if (b) b.click(); setTimeout(() => { const l = document.querySelector('.sp-link[data-s="' + id + '"]'); if (l) l.click(); }, 700); }));
            const m = await api.getMetaAchievements({ librarySize: installedGames.length + uninstalledGames.length });
            ((m && m.achievements) || []).forEach(a => addCmdOnce('Achievement: ' + a.name, a.icon, () => { openAchievementsModal().then(() => { const i = $('meta-ach-search'); if (i) { i.value = a.name; i.dispatchEvent(new Event('input')); } }); }));
            const th = await api.getThemeShop(); ((th && th.themes) || []).filter(t => !t.requires && t.file).forEach(t => addCmdOnce('Theme: ' + t.name, '🎨', async () => { const o = await api.downloadTheme(t.file); if (o && typeof o === 'object' && !o.locked) { applyThemeObject(o); showToast('Theme applied: ' + t.name); } }));
        } catch (e) { }
    }
    setTimeout(indexSearch, 5000);
    // tags and smart collections are searchable too (added after they load)
    setTimeout(() => { try { const tags = [...new Set(Object.values(getUiPref('gameTags', {})).flat())]; tags.forEach(t => addCmdOnce('Tag: ' + t, '🏷️', () => { SLX.activeTags().splice(0); SLX.activeTags().push(t); document.querySelector('.nav-btn[data-view="library"]').click(); })); (getUiPref('smartRules', [])).forEach(r => addCmdOnce('Collection: ' + r.name, '✨', () => { toggleCollectionFilter('smart:rule:' + r.id); })); } catch (e) { } }, 6000);

    SLF.safe('ui-extras', () => {
        SLF.addTile('Settings', '🧩', 'Dashboard widgets', 'Switch the cards above your dashboard on or off: continue playing, this week, daily goal, clock, theme of the week.', openWidgets);
        SLF.addTile('Settings', '🎨', 'Theme by season', 'Pick a theme for winter, spring, summer and autumn and SteamLite switches by itself.', openSeasonThemes);
    });
})();
