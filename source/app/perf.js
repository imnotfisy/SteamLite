// SteamLite 8.6.6 - performance layer (renderer). Classic script that shares the page's scope.
// Everything here is optional polish: each part is wrapped so a failure can never break the app.
(function () {
    'use strict';
    function safe(name, fn) { try { fn(); } catch (e) { try { console.warn('[perf] ' + name + ' failed', e); } catch (_) { } } }

    // 1. Stylesheet tweaks ---------------------------------------------------------------
    safe('css', () => {
        const st = document.createElement('style');
        st.id = 'perf-style';
        st.textContent = [
            // The loading shimmer used to run forever on every card, even after the cover had loaded. A background-position
            // animation is repainted on the CPU every frame, so a big library kept a CPU core busy while the app sat idle.
            '.card-banner.img-ok, .card-banner.banner-fallback { animation: none !important; background: rgba(255, 255, 255, 0.04); }',
            // Skip layout and paint for cards that are scrolled out of view (Potato Mode already had this).
            'body:not(.potato-mode) .game-card { content-visibility: auto; contain-intrinsic-size: auto 270px; }',
            'body.compact-list:not(.potato-mode) .game-card { contain-intrinsic-size: auto 60px; }',
            // The drifting background glow sits under every blurred panel, so each frame made the GPU blur all of them again
            // (about one full CPU core while the app was open). It now moves in a few small steps per second instead.
            'body::before { animation-timing-function: steps(60, end) !important; }',
            '#app-container::after { animation-timing-function: steps(32, end) !important; }',
            // The pulsing "in game" dots sit inside blurred panels (the sidebar, the friends list), so every frame of them made the GPU blur those panels again.
            '.status-orb.ingame { animation-timing-function: steps(8, end) !important; }',
            // The slow ambient background motion stops while the window is not in front.
            'body.win-idle::before, body.win-idle #app-container::after, body.win-idle .status-orb.ingame { animation-play-state: paused !important; }'
        ].join('\n');
        document.head.appendChild(st);
    });

    // 2. Stop the shimmer as soon as a cover has loaded (or failed). 'load' and 'error' do not bubble, so listen while capturing.
    safe('shimmer', () => {
        const done = (e) => {
            const t = e.target;
            if (t && t.tagName === 'IMG' && t.parentElement && t.parentElement.classList && t.parentElement.classList.contains('card-banner')) {
                t.parentElement.classList.add('img-ok');
            }
        };
        document.addEventListener('load', done, true);
        document.addEventListener('error', done, true);
    });

    // 3. Window not in front: pause the ambient glow and the looping background video.
    safe('idle', () => {
        let pausedVideo = false;
        const set = (idle) => {
            if (!document.body) return;
            document.body.classList.toggle('win-idle', idle);
            const v = document.getElementById('custom-bg-video');
            if (!v) return;
            if (idle && !v.paused) { v.pause(); pausedVideo = true; }
            else if (!idle && pausedVideo) { pausedVideo = false; v.play().catch(() => { }); }
        };
        window.addEventListener('blur', () => set(true));
        window.addEventListener('focus', () => set(false));
        document.addEventListener('visibilitychange', () => { if (!document.hidden && document.hasFocus()) set(false); });
        if (!document.hasFocus()) set(true);
    });

    // 4. Edition (Full / Lite) and Memory saver, in Settings > Advanced. This lives here, not in the extras layer,
    // so the Lite edition has it too and can switch back to Full.
    safe('edition-ui', () => {
        const api = window.electronAPI;
        const potato = document.getElementById('adv-potato');
        if (!api || !api.getEdition || !potato) return;
        const row = potato.closest('.switch-row');
        if (!row) return;
        const hint = 'display:block;margin-top:2px;color:var(--text-tertiary);font-size:11px;font-weight:400;text-transform:none;letter-spacing:0;';
        row.insertAdjacentHTML('beforebegin',
            '<div class="switch-row" id="edition-row"><span class="form-label">Edition<span style="' + hint + '">Full has every tool. Lite is just the basics for browsing and launching games, and uses much less memory.</span></span>' +
            '<select id="adv-edition" class="form-input" style="width:auto;min-width:120px"><option value="full">Full</option><option value="lite">Lite</option></select></div>' +
            '<div class="switch-row" id="memsaver-row"><span class="form-label">Memory saver<span style="' + hint + '">Uses much less memory by drawing with the CPU instead of the GPU, but animations and video backgrounds can be less smooth.</span></span>' +
            '<label class="switch-toggle"><input type="checkbox" id="adv-memsaver"><span class="switch-slider"></span></label></div>');
        const ed = document.getElementById('adv-edition'), ms = document.getElementById('adv-memsaver');
        ed.value = api.edition === 'lite' ? 'lite' : 'full';
        api.getEdition().then(r => { if (r) { ed.value = r.edition; ms.checked = !!r.lowMemory; } }).catch(() => { });
        const ask = async (title, msg) => (typeof showConfirm === 'function') ? showConfirm(title, msg) : true;
        ed.addEventListener('change', async () => {
            const want = ed.value;
            if (await ask('Switch to the ' + (want === 'lite' ? 'Lite' : 'Full') + ' edition?', 'SteamLite will restart. Your games, settings and progress are kept.')) api.setEdition(want);
            else ed.value = want === 'lite' ? 'full' : 'lite';
        });
        ms.addEventListener('change', async () => {
            await api.setMemorySaver(ms.checked);
            if (await ask('Restart SteamLite?', 'Restart now to apply the memory setting.')) api.relaunch();
        });
    });

    // 5. Interface: Glass (9.0) or Classic. Applies instantly and is remembered.
    safe('ui-switch', () => {
        const potato = document.getElementById('adv-potato');
        const row = potato && potato.closest('.switch-row');
        if (!row) return;
        const hint = 'display:block;margin-top:2px;color:var(--text-tertiary);font-size:11px;font-weight:400;text-transform:none;letter-spacing:0;';
        row.insertAdjacentHTML('beforebegin',
            '<div class="switch-row" id="ui-row"><span class="form-label">Interface<span style="' + hint + '">Glass is the new 9.0 look. Classic is the previous layout.</span></span>' +
            '<select id="adv-ui" class="form-input" style="width:auto;min-width:120px"><option value="glass">Glass (new)</option><option value="classic">Classic</option></select></div>');
        const sel = document.getElementById('adv-ui');
        sel.value = document.body.classList.contains('ui9') ? 'glass' : 'classic';
        sel.addEventListener('change', () => {
            const glass = sel.value === 'glass';
            document.body.classList.toggle('ui9', glass);
            try { localStorage.setItem('sl_ui', glass ? 'glass' : 'classic'); } catch (e) { }
        });
    });

    // 6. The collapsed rail shows icons only, so give them hover labels.
    safe('rail-titles', () => { document.querySelectorAll('.nav-btn').forEach(b => { if (!b.title) b.title = b.textContent.trim(); }); });

    // 7. Home: a greeting strip with a few numbers, instead of a bare "Dashboard" title (Glass interface only).
    safe('home-hero', () => {
        const vc = document.getElementById('view-container');
        if (!vc) return;
        const build = () => {
            if (!document.body.classList.contains('ui9')) return;
            const head = vc.querySelector('.home-view .home-header');
            if (!head || head.querySelector('.home-hero')) return;
            let games = 0, installed = 0, hours = 0;
            try {
                const all = [...installedGames, ...uninstalledGames].filter(g => !g.isShared);
                games = all.length; installed = installedGames.filter(g => !g.isShared).length;
                hours = Math.floor(all.reduce((a, g) => a + getPlaytimeSeconds(g), 0) / 3600);
            } catch (e) { return; }
            const hr = new Date().getHours();
            const hello = hr < 5 ? 'Good night' : hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
            const un = document.getElementById('user-name');
            const rawName = un ? [...un.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim() : '';
            const name = /not configured/i.test(rawName) ? '' : rawName;
            const chip = (n, l) => '<div class="hero-chip"><b>' + n + '</b><span>' + l + '</span></div>';
            const el = document.createElement('div');
            el.className = 'home-hero';
            const left = document.createElement('div');
            const t = document.createElement('div'); t.className = 'hero-hello'; t.textContent = hello + (name ? ', ' + name : '');
            let streak = 0; try { streak = (typeof metaStreak !== 'undefined' && metaStreak && metaStreak.current >= 1) ? metaStreak.current : 0; } catch (e) { }
            if (streak) { const sk = document.createElement('span'); sk.className = 'hero-streak'; sk.title = streak + '-day play streak'; sk.textContent = '🔥 ' + streak; t.appendChild(sk); }
            const sub = document.createElement('div'); sub.className = 'hero-sub'; sub.textContent = 'Here is your library at a glance.';
            left.appendChild(t); left.appendChild(sub);
            const chips = document.createElement('div'); chips.className = 'hero-chips';
            chips.innerHTML = chip(games, 'games') + chip(installed, 'installed') + chip(hours.toLocaleString(), 'hours played');
            el.appendChild(left); el.appendChild(chips);
            head.insertBefore(el, head.firstChild);
        };
        new MutationObserver(build).observe(vc, { childList: true });
        build();
    });

    // 8. Range sliders: show the filled part (the plain browser slider has a white track on glass).
    safe('range-fill', () => {
        const paint = (r) => { const min = +r.min || 0, max = r.max === '' ? 100 : +r.max; const p = max > min ? ((+r.value - min) / (max - min)) * 100 : 0; r.style.setProperty('--p', Math.max(0, Math.min(100, p)) + '%'); };
        document.addEventListener('input', (e) => { if (e.target && e.target.type === 'range') paint(e.target); }, true);
        // values are also set from code when a dialog opens, which fires no event: refresh while a dialog is showing
        setInterval(() => { if (document.hidden) return; const open = document.body.classList.contains('settings-open'); if (!open && !document.querySelector('.modal-backdrop.active')) return; document.querySelectorAll('.modal-backdrop.active input[type=range], #settings-page input[type=range]').forEach(paint); }, 400);
    });

    // 9. Scrollbars fade out after 5 seconds without scrolling or pointing at something scrollable.
    safe('scrollbar-fade', () => {
        const root = document.documentElement;
        let timer = 0, lastMove = 0;
        const wake = () => { if (root.hasAttribute('data-sb-idle')) root.removeAttribute('data-sb-idle'); clearTimeout(timer); timer = setTimeout(() => root.setAttribute('data-sb-idle', ''), 5000); };
        const scrollable = (el) => { for (let n = 0; el && n < 14 && el !== document.body; el = el.parentElement, n++) { if (el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2) { const o = getComputedStyle(el); if (/(auto|scroll)/.test(o.overflowY + o.overflowX)) return true; } } return false; };
        document.addEventListener('scroll', wake, true);
        document.addEventListener('wheel', wake, { capture: true, passive: true });
        document.addEventListener('keydown', (e) => { if (/^(PageUp|PageDown|Home|End|ArrowUp|ArrowDown)$/.test(e.key)) wake(); }, true);
        document.addEventListener('mousemove', (e) => { const now = Date.now(); if (now - lastMove < 120) return; lastMove = now; if (scrollable(e.target)) wake(); }, { capture: true, passive: true });
        wake();
    });

    // 10. Notifications: give each toast a type (badge colour) and tell the countdown line how long to run.
    safe('toast-style', () => {
        const box = document.getElementById('toast-container');
        if (!box) return;
        const kind = (t) => /fail|error|could not|couldn't|can't|cannot|unable|invalid|not found|denied|refused|wrong/i.test(t) ? 'err'
            : /warn|low |limit|offline|missing|expired|careful|quiet/i.test(t) ? 'warn'
            : /success|saved|applied|added|done|unlock|copied|restored|ready|started|complete|created|updated|imported|exported|enabled|removed|deleted|backup|latest version/i.test(t) ? 'ok' : 'info';
        new MutationObserver((list) => {
            list.forEach(m => m.addedNodes.forEach(n => {
                if (!n.classList || !n.classList.contains('toast') || n.dataset.styled) return;
                n.dataset.styled = '1';
                n.classList.add('toast-' + kind(n.textContent || ''));
                let sec = 4; try { sec = (activeConfig && activeConfig.notifDuration) || 4; if (n.classList.contains('has-action')) sec = Math.max(sec, 8); } catch (e) { }
                n.style.setProperty('--toast-dur', sec + 's');
            }));
        }).observe(box, { childList: true });
    });

    // 11. Beta builds hide the XP / level / achievement screens (the main process does not hand any out).
    safe('beta-build', () => { if (window.electronAPI && window.electronAPI.betaBuild) document.body.classList.add('beta-build'); });

    // 12. Animated collapsing of library sections. While it runs, the cards stop playing their entrance animation and their
    // off-screen skipping (both made the section jump when it was reopened); the section grows to its real measured height.
    const collapse = (grid, title) => {
        if (grid._busy) return;
        grid._busy = true;
        grid.classList.add('sl-anim', 'sl-seen');
        const done = () => { grid._busy = false; grid.classList.remove('sl-anim'); grid.style.height = ''; grid.style.overflow = ''; grid.style.opacity = ''; };
        if (grid.classList.contains('hidden')) {
            grid.classList.remove('hidden'); title.classList.remove('collapsed');
            grid.style.overflow = 'hidden';
            const h = grid.scrollHeight;
            const a = grid.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 360, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
            a.onfinish = a.oncancel = done;
        } else {
            title.classList.add('collapsed');
            const h = grid.getBoundingClientRect().height;
            grid.style.overflow = 'hidden';
            const a = grid.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 280, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' });
            a.onfinish = a.oncancel = () => { grid.classList.add('hidden'); done(); };
        }
    };

    // 13. The Favorites page button only exists while you have favourites (and pops in / out).
    safe('favorites-nav', () => {
        const btn = document.querySelector('.nav-btn[data-view="favorites"]');
        if (!btn) return;
        let shown = null;
        const sync = () => {
            let want = false; try { want = Array.isArray(favorites) && favorites.length > 0 && [...installedGames, ...uninstalledGames].some(g => favorites.includes(String(g.appid))); } catch (e) { return; }
            if (want === shown) return;
            const first = shown === null; shown = want;
            btn.classList.remove('fav-in', 'fav-out');
            if (first) { btn.classList.toggle('fav-hidden', !want); return; }
            if (want) { btn.classList.remove('fav-hidden'); void btn.offsetWidth; btn.classList.add('fav-in'); setTimeout(() => btn.classList.remove('fav-in'), 700); }
            else {
                if (btn.classList.contains('active')) { const home = document.querySelector('.nav-btn[data-view="home"]'); if (home) home.click(); }
                btn.classList.add('fav-out'); setTimeout(() => { if (shown === false) btn.classList.add('fav-hidden'); btn.classList.remove('fav-out'); }, 380);
            }
        };
        ['refreshFavoriteAfterToggle', 'renderLibrary', 'renderFavorites', 'renderHome'].forEach(n => {
            const orig = window[n]; if (typeof orig !== 'function') return;
            window[n] = function () { const r = orig.apply(this, arguments); try { setTimeout(sync, 60); } catch (e) { } return r; };
        });
        setInterval(sync, 1500); setTimeout(sync, 800);
    });

    // 14. Refresh buttons: the icon turns, and the page content slides back in once a library refresh has finished.
    safe('refresh-motion', () => {
        const vc = document.getElementById('view-container');
        const pulse = () => { if (vc && vc.animate) vc.animate([{ opacity: 0.35, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }); };
        document.addEventListener('click', (e) => {
            const b = e.target.closest && e.target.closest('button'); if (!b || !b.animate) return;
            if (!/refresh|reload|↻|⟳/i.test((b.id || '') + ' ' + (b.title || '') + ' ' + (b.textContent || ''))) return;
            const svg = b.querySelector('svg');
            if (svg && svg.animate) svg.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: 700, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' });
            else b.animate([{ transform: 'scale(1)' }, { transform: 'scale(0.94)' }, { transform: 'scale(1)' }], { duration: 300, easing: 'ease-out' });
        }, true);
        const rb = document.getElementById('refresh-library-btn');
        if (rb) { let was = false; new MutationObserver(() => { const on = rb.classList.contains('spinning'); if (was && !on) pulse(); was = on; }).observe(rb, { attributes: true, attributeFilter: ['class'] }); }
    });

    // 15. Discord presence options (apply immediately, they do not wait for Save).
    safe('discord-options', () => {
        const api = window.electronAPI;
        const master = document.getElementById('discord-rpc-input');
        const row = master && master.closest('.switch-row');
        if (!api || !api.discordGetOpts || !row) return;
        const hint = 'display:block;margin-top:2px;color:var(--text-tertiary);font-size:11px;font-weight:400;text-transform:none;letter-spacing:0;';
        const opt = (id, title, desc) => '<div class="switch-row" data-instant="1"><span class="form-label">' + title + '<span style="' + hint + '">' + desc + '</span></span><label class="switch-toggle"><input type="checkbox" id="' + id + '" data-instant="1"><span class="switch-slider"></span></label></div>';
        const box = document.createElement('div');
        box.className = 'form-group'; box.id = 'dc-group'; box.style.marginTop = '4px';
        box.innerHTML = '<label class="form-label">Discord presence</label>' +
            opt('dc-game', 'Show the game I am playing', 'The game, its art, a running timer and your achievement progress') +
            opt('dc-browse', 'Show what I am browsing', 'Which page you are on and your library numbers while you are not in a game') +
            opt('dc-streak', 'Show my streak', 'Adds your play streak to the card') +
            opt('dc-buttons', 'Show buttons', '"View on Steam" and "Get SteamLite" under the card') +
            opt('dc-hide', 'Hide game names', 'Shows "Playing a game" without the name, art or Steam button') +
            '<div id="dc-status" style="margin-top:8px;font-size:12px;color:var(--text-secondary)"></div>';
        row.insertAdjacentElement('afterend', box);
        const keys = { 'dc-game': 'game', 'dc-browse': 'browsing', 'dc-streak': 'streak', 'dc-buttons': 'buttons', 'dc-hide': 'hideNames' };
        const load = async () => {
            let r = null; try { r = await api.discordGetOpts(); } catch (e) { }
            if (!r) { box.style.display = 'none'; return; }
            Object.keys(keys).forEach(id => { const el = document.getElementById(id); if (el) el.checked = !!r.opts[keys[id]]; });
            const st = document.getElementById('dc-status');
            if (st) st.textContent = r.status.enabled ? (r.status.connected ? 'Connected to Discord.' : 'Waiting for Discord. Open the Discord app and it connects by itself.') : 'Presence is switched off (the switch above).';
        };
        box.addEventListener('change', async (e) => {
            const k = keys[e.target.id]; if (!k) return;
            try { await api.discordSetOpts({ [k]: e.target.checked }); } catch (err) { }
        });
        const adv = document.getElementById('advanced-toggle');
        if (adv) adv.addEventListener('click', () => setTimeout(load, 250));
        load();
    });

    // 16. Tell Discord which page you are on.
    safe('discord-browse', () => {
        const api = window.electronAPI; if (!api || !api.updateDiscordRpc) return;
        let t = 0;
        const send = (details) => {
            clearTimeout(t);
            t = setTimeout(() => {
                try {
                    const all = [...installedGames, ...uninstalledGames].filter(g => !g.isShared);
                    const hours = Math.floor(all.reduce((a, g) => a + getPlaytimeSeconds(g), 0) / 3600);
                    api.updateDiscordRpc({ details, state: all.length + ' games \u00B7 ' + hours.toLocaleString() + 'h played' });
                } catch (e) { }
            }, 500);
        };
        const names = { home: 'On the dashboard', library: 'Browsing the library', favorites: 'Looking at favourites', settings: 'Changing settings' };
        document.querySelectorAll('.nav-btn').forEach(b => b.addEventListener('click', () => { const d = names[b.getAttribute('data-view')]; if (d) send(d); }));
        const foot = document.getElementById('sidebar-footer'); if (foot) foot.addEventListener('click', () => send('Viewing a profile'));
    });

    safe('debug-tag', () => { if (window.electronAPI && window.electronAPI.dbg) document.body.classList.add('debug-build'); });

    window.SLPerf = { safe, collapse };
})();
