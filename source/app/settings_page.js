// SteamLite 9.0 - the full-page Settings.
// It does not re-implement any setting. While the page is open it MOVES the existing controls out of the Settings and
// Advanced dialogs into page sections (leaving a placeholder behind), and moves them back when you leave, so every id,
// every value loader and every save handler keeps working and the dialogs stay intact for first-run setup.
(function () {
    'use strict';
    if (!window.electronAPI) return;
    const $ = (id) => document.getElementById(id);
    const main = $('main-content'), vc = $('view-container');
    if (!main || !vc) return;

    const SECTIONS = [
        { id: 'account', icon: '👤', title: 'Account', desc: 'Who is logged in and which accounts SteamLite can see.', items: ['settings-account-card', 'family-ids-input'] },
        { id: 'appearance', icon: '🎨', title: 'Appearance', desc: 'Themes, layout style and the background.', items: ['download-themes-btn', 'adv-appearance-btn', 'ui-row', 'wide-grid-input', 'adv-reduce-anim', 'bg-path-input', 'bg-blur-input', 'bg-opacity-input', 'bg-speed-group'] },
        { id: 'sound', icon: '🔔', title: 'Sound & notifications', desc: 'Volume, sound packs, pop-ups and quiet hours.', items: ['sound-vol-input', 'adv-notif-sounds', 'adv-sound-pack', 'adv-notif-duration', 'adv-notif-stack', 'adv-quiet-on', 'adv-quiet-times', 'adv-wishlist-alerts'] },
        { id: 'behaviour', icon: '⚙️', title: 'Behaviour', desc: 'Startup, the tray, Discord, reminders and shortcuts.', items: ['adv-launch-library', 'adv-start-windows', 'adv-start-min', 'adv-close-tray', 'adv-hide-offline', 'discord-rpc-input', 'dc-group', 'md-group', 'cm-group', 'max-common-friends-input', 'adv-break-min', 'adv-limit-hours', 'adv-hotkeys-btn'] },
        { id: 'performance', icon: '⚡', title: 'Performance', desc: 'Edition, memory use and effects.', items: ['edition-row', 'memsaver-row', 'adv-potato'] },
        { id: 'updates', icon: '⬆️', title: 'Updates', desc: 'The update channel and automatic checks.', items: ['update-channel-input', 'adv-auto-update', 'update-btn'] },
        { id: 'data', icon: '💾', title: 'Backup & data', desc: 'Export and import your settings.', items: ['adv-export-btn'] },
        { id: 'tools', icon: '🧰', title: 'Tools & extras', desc: 'More tools and settings that live in the tools hub.', items: [], custom: true }
    ];

    const wrapperOf = (el) => {
        if (!el) return null;
        if (el.id === 'activate-dev-license-btn') return el.closest('.dev-tools') || el;
        return el.closest('.switch-row') || el.closest('.form-group') || el;
    };

    const page = document.createElement('div');
    page.id = 'settings-page';
    page.innerHTML =
        '<aside class="sp-nav"><div class="sp-search-wrap"><input id="sp-search" class="sp-search" type="text" placeholder="Search settings..." autocomplete="off" spellcheck="false"></div><nav id="sp-links"></nav></aside>' +
        '<div class="sp-main" id="sp-main"><div class="sp-head"><h1>Settings</h1><p>Everything in one place. Changes are applied when you press Save.</p></div><div id="sp-sections"></div><div class="sp-empty" id="sp-empty" style="display:none">No settings match that search.</div></div>' +
        '<div class="sp-savebar" id="sp-savebar"><span>You have unsaved changes</span><div><button class="sp-btn" id="sp-discard">Discard</button><button class="sp-btn primary" id="sp-save">Save changes</button></div></div>';
    vc.insertAdjacentElement('afterend', page);

    const secBody = {}, parked = []; // parked: { el, marker }
    const links = $('sp-links'), secs = $('sp-sections');
    SECTIONS.forEach(s => {
        const a = document.createElement('button'); a.className = 'sp-link'; a.dataset.s = s.id; a.innerHTML = '<span class="sp-ico">' + s.icon + '</span><span>' + s.title + '</span>';
        a.addEventListener('click', () => { const t = $('sp-sec-' + s.id); if (t) { const m = $('sp-main'); m.scrollTo({ top: m.scrollTop + t.getBoundingClientRect().top - m.getBoundingClientRect().top - 2, behavior: 'smooth' }); } /* scroll only the settings column: scrollIntoView also moved the whole window and pushed the header off-screen */ });
        links.appendChild(a);
        const sec = document.createElement('section'); sec.className = 'sp-card'; sec.id = 'sp-sec-' + s.id; sec.dataset.s = s.id;
        sec.innerHTML = '<div class="sp-card-head"><span class="sp-ico big">' + s.icon + '</span><div><h2>' + s.title + '</h2><p>' + s.desc + '</p></div></div><div class="sp-card-body"></div>';
        secs.appendChild(sec); secBody[s.id] = sec.querySelector('.sp-card-body');
    });

    // the tools hub shortcuts (Full edition only)
    const fillTools = () => {
        const body = secBody.tools; body.innerHTML = '';
        if (!window.SLF) { body.closest('.sp-card').style.display = 'none'; return; }
        body.closest('.sp-card').style.display = '';
        [['🧰', 'Tools & extras', 'Every tool in one searchable window', () => SLF.openHub && SLF.openHub()],
         ['🎛️', 'More settings', 'Notification rules, idle detection, Discord posts, accessibility, language, restore points', () => SLF.actions['More settings'] && SLF.actions['More settings']()],
         ['🎛️', 'Extras settings', 'Game mode, session widget, controller, day / night themes, language', () => SLF.actions['Extras settings'] && SLF.actions['Extras settings']()],
         ['🩺', 'Diagnostics', 'A page to copy when you report a problem', () => SLF.actions['Diagnostics'] && SLF.actions['Diagnostics']()],
         ['💾', 'Automatic backups', 'Scheduled backups of your settings to a folder', () => SLF.actions['Automatic backups'] && SLF.actions['Automatic backups']()]
        ].forEach(t => {
            const it = document.createElement('div'); it.className = 'sp-item sp-link-row'; it.dataset.search = (t[1] + ' ' + t[2]).toLowerCase();
            it.innerHTML = '<span class="sp-ico">' + t[0] + '</span><div class="sp-lr-txt"><b>' + t[1] + '</b><span>' + t[2] + '</span></div><button class="sp-btn">Open</button>';
            it.querySelector('button').addEventListener('click', () => { try { t[3](); } catch (e) { } });
            body.appendChild(it);
        });
    };

    // ---- moving the controls in and out ----
    const adopt = () => {
        SECTIONS.forEach(s => s.items.forEach(id => {
            const src = $(id); const el = wrapperOf(src);
            if (!el || el.closest('#settings-page')) return;
            const marker = document.createElement('span'); marker.className = 'sp-marker'; marker.style.display = 'none';
            el.parentNode.insertBefore(marker, el);
            const item = document.createElement('div'); item.className = 'sp-item';
            item.appendChild(el);
            secBody[s.id].appendChild(item);
            parked.push({ el, marker, item });
        }));
        fillTools();
        $('sp-main').querySelectorAll('.sp-item').forEach(it => { if (!it.dataset.search) it.dataset.search = (it.textContent || '').toLowerCase(); });
        SECTIONS.forEach(s => { const c = $('sp-sec-' + s.id); if (!secBody[s.id].children.length && !s.custom) c.style.display = 'none'; else if (!s.custom) c.style.display = ''; });
    };
    const release = () => {
        while (parked.length) { const p = parked.pop(); try { p.marker.parentNode.insertBefore(p.el, p.marker); p.marker.remove(); p.item.remove(); } catch (e) { } }
    };

    // ---- open / close ----
    let isOpen = false, stripUntil = 0, dirty = false;
    const setDirty = (v) => { dirty = v; $('sp-savebar').classList.toggle('on', v); };
    const open = () => {
        if (isOpen) { setDirty(false); return; }
        isOpen = true; setDirty(false);
        $('sp-search').value = '';
        adopt(); filter('');
        document.body.classList.add('settings-open');
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-view') === 'settings'));
        const t = $('view-title'); if (t) t.innerText = 'Settings';
        ['library-controls', 'search-input', 'random-game-btn', 'refresh-library-btn'].forEach(id => { const e = $(id); if (e) e.classList.add('hidden'); });
        const add = $('add-nonsteam-btn'); if (add) add.style.display = 'none';
        $('sp-main').scrollTop = 0; setTimeout(spy, 30);
    };
    const close = () => {
        if (!isOpen) return; isOpen = false;
        document.body.classList.remove('settings-open');
        release(); setDirty(false);
        const sb = document.querySelector('.nav-btn[data-view="settings"]'); if (sb) sb.classList.remove('active');
    };

    // the Settings and Advanced dialogs must not pop up while the page is loading their values
    const strip = (m) => new MutationObserver(() => { if (Date.now() < stripUntil && m.classList.contains('active')) m.classList.remove('active'); }).observe(m, { attributes: true, attributeFilter: ['class'] });
    ['settings-modal', 'advanced-modal'].forEach(id => { const m = $(id); if (m) strip(m); });

    const navBtn = document.querySelector('.nav-btn[data-view="settings"]');
    if (navBtn) navBtn.addEventListener('click', () => {
        if (document.body.classList.contains('sue-editing')) return;
        // the original handler (registered earlier) has already started loading the Settings values; load the Advanced ones too
        stripUntil = Date.now() + 2500;
        const sm = $('settings-modal'); if (sm) sm.classList.remove('active');
        const adv = $('advanced-toggle'); if (adv) adv.click();
        $('friends-panel') && $('friends-panel').classList.remove('active');
        open();
    });
    // any other page replaces the view container: step aside
    new MutationObserver(() => { if (isOpen) close(); }).observe(vc, { childList: true });
    document.querySelectorAll('.nav-btn').forEach(b => { if (b !== navBtn) b.addEventListener('click', () => close(), true); });

    // ---- search ----
    function filter(q) {
        q = q.trim().toLowerCase(); let any = false;
        SECTIONS.forEach(s => {
            const card = $('sp-sec-' + s.id); let n = 0;
            card.querySelectorAll('.sp-item').forEach(it => { const hit = !q || (it.dataset.search || '').includes(q) || s.title.toLowerCase().includes(q); it.style.display = hit ? '' : 'none'; if (hit) n++; });
            const hasItems = card.querySelectorAll('.sp-item').length > 0;
            card.style.display = (hasItems && n > 0) ? '' : 'none'; if (hasItems && n > 0) any = true;
        });
        $('sp-empty').style.display = any ? 'none' : '';
    }
    $('sp-search').addEventListener('input', (e) => filter(e.target.value));

    // ---- scroll spy ----
    function spy() {
        const mainEl = $('sp-main'); let cur = SECTIONS[0].id;
        const top = mainEl.getBoundingClientRect().top;
        SECTIONS.forEach(s => { const c = $('sp-sec-' + s.id); if (c.style.display !== 'none' && c.getBoundingClientRect().top - top <= 90) cur = s.id; });
        links.querySelectorAll('.sp-link').forEach(a => a.classList.toggle('active', a.dataset.s === cur));
    }
    $('sp-main').addEventListener('scroll', spy, { passive: true }); setTimeout(spy, 50);

    // ---- unsaved changes ----
    const touched = (e) => { if (!isOpen || (e.target && (e.target.id === 'sp-search' || e.target.dataset && e.target.dataset.instant))) return; if (e.target.closest && e.target.closest('#settings-page')) setDirty(true); };
    page.addEventListener('input', touched); page.addEventListener('change', touched);
    $('sp-save').addEventListener('click', async () => {
        const sv = $('adv-save-btn'); if (sv) sv.click();
        try { const v = parseFloat($('sound-vol-input').value); if (!isNaN(v)) { await window.electronAPI.saveConfig({ soundVolume: v }); if (window.activeConfig) activeConfig.soundVolume = v; } } catch (e) { }
        setDirty(false);
    });
    $('sp-discard').addEventListener('click', () => {
        const sm = $('settings-modal'); if (navBtn) { stripUntil = Date.now() + 2500; navBtn.click(); }
        setDirty(false); if (sm) sm.classList.remove('active');
    });
    window.SLSettingsPage = { open, close };
})();
