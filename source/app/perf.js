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

    window.SLPerf = { safe };
})();
