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
        { id: 'account', icon: '👤', title: 'Account', desc: 'Your SteamLite account, your Steam library and your data.', items: ['family-ids-input'], custom: true },
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
        a.addEventListener('click', () => { const t = $('sp-sec-' + s.id); if (t) { const m = $('sp-main'); m.scrollTo({ top: m.scrollTop + t.getBoundingClientRect().top - m.getBoundingClientRect().top - 24, behavior: 'smooth' }); } /* scroll only the settings column: scrollIntoView also moved the whole window and pushed the header off-screen */ });
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

    // ---- the Account section: a profile card, the Steam library connection, cloud backup and your data ----
    const acss = document.createElement('style');
    acss.textContent = `
    .acx-hero { position: relative; display: flex; align-items: center; gap: 20px; padding: 22px; border-radius: 22px; overflow: hidden; background: linear-gradient(135deg, color-mix(in srgb, var(--accent-color) 26%, var(--bg-glass)), var(--bg-glass) 70%); border: 1px solid var(--border-glass); flex-wrap: wrap; }
    .acx-hero::after { content: ''; position: absolute; right: -60px; top: -80px; width: 220px; height: 220px; border-radius: 50%; background: radial-gradient(circle, color-mix(in srgb, var(--accent-color) 35%, transparent), transparent 70%); pointer-events: none; }
    .acx-av { position: relative; width: 84px; height: 84px; flex: none; border-radius: 50%; padding: 3px; background: conic-gradient(from 200deg, var(--accent-color), #38bdf8, var(--accent-color)); box-shadow: 0 10px 30px color-mix(in srgb, var(--accent-color) 40%, transparent); } .acx-av img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; background: var(--bg-dark); display: block; border: 3px solid var(--bg-dark); box-sizing: border-box; } .acx-av .acx-ini { position: absolute; inset: 3px; border-radius: 50%; display: grid; place-items: center; font-size: 30px; font-weight: 800; color: #fff; background: var(--accent-color); border: 3px solid var(--bg-dark); }
    .acx-id { flex: 1; min-width: 200px; position: relative; z-index: 1; } .acx-name { font-size: 24px; font-weight: 800; letter-spacing: -.01em; display: flex; align-items: center; gap: 2px; flex-wrap: wrap; } .acx-sub { margin-top: 3px; font-size: 12.5px; color: var(--text-secondary); } .acx-chips { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
    .acx-chip { display: inline-flex; align-items: center; gap: 7px; padding: 5px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; background: rgba(0, 0, 0, .25); border: 1px solid var(--border-glass); } .acx-chip.o { color: #fde68a; border-color: rgba(251, 191, 36, .6); background: rgba(251, 191, 36, .12); } .acx-chip.v { color: #93c5fd; border-color: rgba(59, 130, 246, .5); background: rgba(59, 130, 246, .12); } .acx-chip button { background: none; border: 0; padding: 0; color: var(--accent-color); font: inherit; font-weight: 800; cursor: pointer; }
    .acx-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(270px, 1fr)); gap: 14px; margin-top: 14px; } .acx-card { display: flex; flex-direction: column; gap: 8px; padding: 18px; border-radius: 20px; background: var(--bg-glass); border: 1px solid var(--border-glass); } .acx-card h4 { margin: 0; font-size: 14.5px; font-weight: 800; display: flex; align-items: center; gap: 8px; } .acx-card p { margin: 0; font-size: 12.5px; color: var(--text-secondary); line-height: 1.5; }
    .acx-pill { margin-left: auto; font-size: 10.5px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; padding: 3px 10px; border-radius: 999px; background: rgba(34, 197, 94, .16); color: #86efac; border: 1px solid rgba(34, 197, 94, .45); } .acx-pill.bad { background: rgba(245, 158, 11, .14); color: #fcd34d; border-color: rgba(245, 158, 11, .45); }
    .acx-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: auto; padding-top: 6px; } .acx-in { flex: 1; min-width: 0; padding: 9px 12px; border-radius: 12px; border: 1px solid var(--border-glass); background: rgba(0, 0, 0, .25); color: var(--text-primary); font: 12.5px ui-monospace, Consolas, monospace; outline: none; } .acx-in:focus { border-color: var(--accent-color); }
    .acx-link { background: none; border: 0; padding: 0; color: var(--text-secondary); font: inherit; font-size: 12px; text-decoration: underline; cursor: pointer; text-align: left; } .acx-link:hover { color: var(--text-primary); } .acx-danger { color: #f87171 !important; }
    `;
    document.head.appendChild(acss);
    const aesc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const when = (t) => t ? new Date(t).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'never';
    let acctSeq = 0;
    const fillAccount = async () => {
        const body = secBody.account; if (!body) return; const mine = ++acctSeq;
        let host = body.querySelector('.acx-host'); if (!host) { host = document.createElement('div'); host.className = 'sp-item acx-host'; host.dataset.search = 'account steam sign out verified backup library api key friend code delete data privacy'; body.insertBefore(host, body.firstChild); }
        host.innerHTML = '<div class="sp-lr-txt" style="padding:6px 2px"><span>Loading your account...</span></div>';
        let st = null; try { st = await window.electronAPI.feat('acctStatus'); } catch (e) { }
        if (mine !== acctSeq) return;
        if (!st || !st.signedIn) { host.innerHTML = '<div class="acx-card"><h4>Not signed in</h4><p>Restart SteamLite to sign in with Steam.</p></div>'; return; }
        const av = st.avatar || (($('user-avatar') || {}).src || ''), tick = st.verified && window.SLVerified ? window.SLVerified(20, st.owner) : '';
        host.innerHTML =
            '<div class="acx-hero"><div class="acx-av"><span class="acx-ini">' + aesc((st.name || '?').trim().charAt(0).toUpperCase()) + '</span>' + (av ? '<img src="' + aesc(av) + '" alt="" onerror="this.remove()">' : '') + '</div>' +
            '<div class="acx-id"><div class="acx-name">' + aesc(st.name || 'Steam player') + tick + '</div><div class="acx-sub">Signed in with Steam' + (st.idTail ? ' &middot; account ending ' + aesc(st.idTail) : '') + (st.created ? ' &middot; member since ' + new Date(st.created).toLocaleDateString([], { month: 'long', year: 'numeric' }) : '') + (st.offline ? ' &middot; offline right now' : '') + '</div>' +
            '<div class="acx-chips">' + (st.owner ? '<span class="acx-chip o" title="Everything in SteamLite is unlocked for you, including future updates">' + (window.SLVerified ? window.SLVerified(14, true) : '') + ' Owner of SteamLite &middot; everything unlocked</span>' : st.verified ? '<span class="acx-chip v">' + (window.SLVerified ? window.SLVerified(14) : '') + ' Verified by SteamLite</span>' : '') + (st.code ? '<span class="acx-chip" title="Friends can add you with this code">Friend code <b>' + aesc(st.code) + '</b><button data-a="copy" data-v="' + aesc(st.code) + '">Copy</button></span>' : '') + '</div></div>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;position:relative;z-index:1">' + (window.SLPeople ? '<button class="sp-btn" data-a="myprofile" data-instant="1">View my profile</button>' : '') + '<button class="sp-btn" data-a="signout" data-instant="1">Sign out</button></div></div>' +
            '<div class="acx-grid">' +
            '<div class="acx-card"><h4>Steam library <span class="acx-pill' + (st.hasKey ? '' : ' bad') + '">' + (st.hasKey ? 'Connected' : 'Not connected') + '</span></h4><p>Your games, profile, friends and achievements come from this Steam account. Your Steam Web API key is saved, encrypted, to your SteamLite account, so every PC you sign in on connects by itself.</p><div class="acx-row" id="acx-keyrow"><button class="acx-link" data-a="rekey">Replace the key</button></div></div>' +
            '<div class="acx-card"><h4>Cloud backup</h4><p>Your settings, XP, achievements, drops, coins and themes are saved to your account about once a day.<br>Last saved: <b>' + aesc(when(st.backupAt || st.localBackupAt)) + '</b></p><div class="acx-row"><button class="sp-btn primary" data-a="backup">Back up now</button><button class="sp-btn" data-a="restore">Restore</button>' + (st.prevAt ? '<button class="sp-btn" data-a="restoreprev">Restore the one before</button>' : '') + '</div></div>' +
            '<div class="acx-card"><h4>Your data</h4><p>SteamLite keeps your Steam name and picture, your backup, your leaderboard entry, your chats and the themes you share. Deleting your account removes all of it from the server. Nothing on this PC is touched.</p><div class="acx-row"><button class="sp-btn acx-danger" data-a="delete">Delete my account</button></div></div>' +
            '</div>';
        host.onclick = async (e) => {
            const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a, toast = (m) => { try { showToast(m); } catch (er) { } };
            if (a === 'myprofile') { const o = await window.electronAPI.feat('soc', { op: 'overview' }); if (o && o.ok && window.SLPeople) SLPeople.openProfile(o.me.uid); else toast('Could not open your profile.'); }
            else if (a === 'copy') { try { await navigator.clipboard.writeText(b.dataset.v); toast('Friend code copied.'); } catch (er) { toast('Your code: ' + b.dataset.v); } }
            else if (a === 'signout') { if (!await showConfirm('Sign out?', 'You will need to sign in with Steam again to use SteamLite. Your backup stays in your account.')) return; await window.electronAPI.feat('acctLogout'); location.reload(); }
            else if (a === 'backup') { b.disabled = true; const r = await window.electronAPI.feat('acctBackup'); toast(r && r.ok ? 'Backed up to your account.' : ((r && r.error) || 'Could not back up.')); fillAccount(); }
            else if (a === 'restore' || a === 'restoreprev') { if (!await showConfirm('Restore from the cloud?', 'Your settings and progress are replaced with the saved copy' + (a === 'restoreprev' ? ' from before the latest one' : '') + '. A restore point of the current state is saved first, and SteamLite restarts.')) return; const r = await window.electronAPI.feat('acctRestore', { prev: a === 'restoreprev' }); if (r && r.ok) { toast('Restored. Restarting...'); setTimeout(() => window.electronAPI.feat('acctRestart'), 900); } else toast((r && r.error) || 'Could not restore.'); }
            else if (a === 'delete') { if (!await showConfirm('Delete your SteamLite account?', 'This removes your backup, your stored key, your leaderboard entry, your chats, friends and the themes you shared from the server. Your own progress on this PC is not touched. You can make a new account any time by signing in again.')) return; const r = await window.electronAPI.feat('acctDelete'); if (r && r.ok) { toast('Your account and its data were deleted.'); setTimeout(() => location.reload(), 1200); } else toast((r && r.error) || 'Could not delete.'); }
            else if (a === 'rekey') { const row = host.querySelector('#acx-keyrow'); row.innerHTML = '<input class="acx-in" id="acx-key" maxlength="40" spellcheck="false" placeholder="Paste the new 32-character key"><button class="sp-btn primary" data-a="rekeysave">Save</button><button class="sp-btn" data-a="rekeycancel">Cancel</button>'; const i = row.querySelector('input'); i.focus(); i.onkeydown = (ev) => { if (ev.key === 'Enter') row.querySelector('[data-a=rekeysave]').click(); }; }
            else if (a === 'rekeycancel') fillAccount();
            else if (a === 'rekeysave') { const v = (host.querySelector('#acx-key') || {}).value || ''; b.disabled = true; const r = await window.electronAPI.feat('acctKeySave', { key: v.trim() }); if (r && r.ok) { toast('Key saved. Reloading your library...'); setTimeout(() => location.reload(), 900); } else { b.disabled = false; toast((r && r.error) || 'Could not save the key.'); } }
        };
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
        fillTools(); fillAccount();
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
