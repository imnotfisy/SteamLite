// SteamLite 9.1.0 - theme by season (the dashboard widgets were removed in 9.2.3),
// and "search everywhere" in the command palette (games, achievements, settings, tools, themes, tags).
(function () {
    'use strict';
    if (!window.SLF || !window.electronAPI) return;
    const SLF = window.SLF, $ = (id) => document.getElementById(id), E = SLF.E, feat = SLF.feat, api = window.electronAPI;
    const css = document.createElement('style');
    css.textContent = `
    `;
    document.head.appendChild(css);

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
        SLF.addTile('Settings', '🎨', 'Theme by season', 'Pick a theme for winter, spring, summer and autumn and SteamLite switches by itself.', openSeasonThemes);
    });
})();
