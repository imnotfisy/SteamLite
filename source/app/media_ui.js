// SteamLite 9.0 - the "now playing" pill (a floating pill you can drag anywhere), its pop-up player, and its settings.
(function () {
    'use strict';
    const api = window.electronAPI;
    if (!api || !api.mediaGet) return;
    const $ = (id) => document.getElementById(id);
    const E = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const I = {
        prev: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h2v14H6zM20 5v14L9.5 12z"/></svg>',
        next: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 5h2v14h-2zM4 5v14l10.5-7z"/></svg>',
        play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>',
        pause: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4.5h4v15H6zM14 4.5h4v15h-4z"/></svg>'
    };
    let data = null, tickBase = 0, tickAt = 0, popOpen = false;

    // ---- the pill ----
    const pill = document.createElement('div');
    pill.id = 'media-pill'; pill.className = 'media-pill hidden';
    pill.innerHTML = '<button class="mp-main" id="mp-main" title="Now playing"><span class="mp-art" id="mp-art"></span><span class="mp-txt"><b id="mp-title"></b><span id="mp-artist"></span></span></button>' +
        '<button class="mp-btn" data-a="prev" title="Previous">' + I.prev + '</button><button class="mp-btn mp-play" data-a="toggle" title="Play / pause" id="mp-toggle">' + I.play + '</button><button class="mp-btn" data-a="next" title="Next">' + I.next + '</button>';
    document.body.appendChild(pill);

    // ---- drag it anywhere; it remembers where you left it ----
    let pos = null; // { x, y } in px (top-left)
    try { pos = JSON.parse(localStorage.getItem('sl_pill_pos') || 'null'); } catch (e) { }
    const clampPos = (x, y) => {
        const w = pill.offsetWidth || 220, h = pill.offsetHeight || 48;
        return { x: Math.min(Math.max(8, x), Math.max(8, window.innerWidth - w - 8)), y: Math.min(Math.max(8, y), Math.max(8, window.innerHeight - h - 8)) };
    };
    const place = () => {
        if (pill.classList.contains('hidden')) return;
        let p = pos ? clampPos(pos.x, pos.y) : clampPos(112, window.innerHeight - (pill.offsetHeight || 48) - 22) /* bottom left of the page, clear of the + button */;
        pill.style.left = p.x + 'px'; pill.style.top = p.y + 'px';
    };
    let drag = null, moved = false;
    pill.addEventListener('pointerdown', (e) => {
        if (e.button !== 0 || e.target.closest('.mp-btn')) return;
        const r = pill.getBoundingClientRect();
        drag = { dx: e.clientX - r.left, dy: e.clientY - r.top, sx: e.clientX, sy: e.clientY, id: e.pointerId }; moved = false;
        try { pill.setPointerCapture(e.pointerId); } catch (er) { }
    });
    pill.addEventListener('pointermove', (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        if (!moved && Math.abs(e.clientX - drag.sx) + Math.abs(e.clientY - drag.sy) < 5) return;
        if (!moved) { moved = true; pill.classList.add('dragging'); closePop(); }
        const p = clampPos(e.clientX - drag.dx, e.clientY - drag.dy); pos = p; pill.style.left = p.x + 'px'; pill.style.top = p.y + 'px';
    });
    const endDrag = (e) => {
        if (!drag || (e && e.pointerId !== drag.id)) return;
        drag = null; pill.classList.remove('dragging');
        if (moved) { try { localStorage.setItem('sl_pill_pos', JSON.stringify(pos)); } catch (er) { } setTimeout(() => { moved = false; }, 0); }
    };
    pill.addEventListener('pointerup', endDrag); pill.addEventListener('pointercancel', endDrag);
    pill.addEventListener('dblclick', (e) => { if (e.target.closest('.mp-btn')) return; pos = null; try { localStorage.removeItem('sl_pill_pos'); } catch (er) { } pill.classList.add('glide'); place(); setTimeout(() => pill.classList.remove('glide'), 450); });
    window.addEventListener('resize', place);

    // ---- the pop-up player ----
    const pop = document.createElement('div');
    pop.id = 'media-pop'; pop.className = 'media-pop';
    pop.innerHTML = '<div class="mpop-art" id="mpop-art"></div><div class="mpop-title" id="mpop-title"></div><div class="mpop-artist" id="mpop-artist"></div><div class="mpop-album" id="mpop-album"></div>' +
        '<div class="mpop-bar" id="mpop-bar"><i id="mpop-fill"></i></div><div class="mpop-times"><span id="mpop-pos">0:00</span><span id="mpop-dur">0:00</span></div>' +
        '<div class="mpop-ctl"><button class="mp-btn big" data-a="prev" title="Previous">' + I.prev + '</button><button class="mp-btn big play" data-a="toggle" id="mpop-toggle" title="Play / pause">' + I.play + '</button><button class="mp-btn big" data-a="next" title="Next">' + I.next + '</button></div>' +
        '<div class="mpop-src" id="mpop-src"></div>';
    document.body.appendChild(pop);

    const fmt = (s) => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
    const appName = (id) => /spotify/i.test(id) ? 'Spotify' : String(id || '').replace(/\.exe$/i, '').replace(/^.*!/, '') || 'Media player';
    const artHtml = (d) => d && d.art ? '<img src="' + E(d.art) + '" alt="">' : '<span class="mp-note">' + (window.SLI ? SLI.html('music') : '') + '</span>';
    const posNow = () => !data ? 0 : Math.min(data.dur || 1e9, tickBase + (data.status === 'Playing' ? (Date.now() - tickAt) / 1000 : 0));

    function paint() {
        const on = !!(data && data.title);
        pill.classList.toggle('hidden', !on);
        if (on) requestAnimationFrame(place);
        document.body.classList.toggle('has-media', on);
        if (!on) { closePop(); return; }
        $('mp-art').innerHTML = artHtml(data);
        $('mp-title').textContent = data.title; $('mp-artist').textContent = data.artist || appName(data.app);
        const playing = data.status === 'Playing';
        $('mp-toggle').innerHTML = playing ? I.pause : I.play; $('mpop-toggle').innerHTML = playing ? I.pause : I.play;
        pill.classList.toggle('playing', playing);
        $('mpop-art').innerHTML = artHtml(data);
        $('mpop-title').textContent = data.title; $('mpop-artist').textContent = data.artist || ''; $('mpop-album').textContent = data.album || '';
        $('mpop-dur').textContent = fmt(data.dur); $('mpop-src').textContent = 'From ' + appName(data.app);
        pill.querySelector('[data-a="prev"]').disabled = !data.canPrev; pill.querySelector('[data-a="next"]').disabled = !data.canNext;
        pop.querySelector('[data-a="prev"]').disabled = !data.canPrev; pop.querySelector('[data-a="next"]').disabled = !data.canNext;
        $('mpop-bar').classList.toggle('noseek', !data.canSeek);
        tickProgress();
    }
    function tickProgress() {
        if (!data) return;
        const p = posNow(), d = data.dur || 0;
        $('mpop-pos').textContent = fmt(p); $('mpop-fill').style.width = (d > 0 ? Math.min(100, p / d * 100) : 0) + '%';
    }
    setInterval(() => { if (popOpen && data) tickProgress(); }, 500);

    function openPop() {
        if (!data) return;
        const r = pill.getBoundingClientRect(), ph = pop.offsetHeight || 420, pw = pop.offsetWidth || 292;
        const below = r.bottom + 10 + ph <= window.innerHeight - 8 || r.top - 10 - ph < 8; // open downwards unless there is no room
        pop.style.top = Math.min(Math.max(8, below ? r.bottom + 10 : r.top - 10 - ph), Math.max(8, window.innerHeight - ph - 8)) + 'px'; pop.style.bottom = 'auto'; pop.style.right = 'auto';
        pop.style.left = Math.min(Math.max(8, r.left + r.width / 2 - pw / 2), window.innerWidth - pw - 8) + 'px';
        pop.classList.toggle('up', !below);
        pop.classList.add('on'); popOpen = true; tickProgress();
    }
    function closePop() { pop.classList.remove('on'); popOpen = false; }
    $('mp-main').addEventListener('click', (e) => { e.stopPropagation(); if (moved) return; popOpen ? closePop() : openPop(); });
    document.addEventListener('click', (e) => { if (popOpen && !e.target.closest('#media-pop') && !e.target.closest('#media-pill')) closePop(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && popOpen) closePop(); });
    window.addEventListener('resize', () => { if (popOpen) openPop(); });

    const control = (a, seek) => { try { api.mediaControl({ action: a, seek }); } catch (e) { } };
    const clickCtl = (e) => {
        const b = e.target.closest('[data-a]'); if (!b || b.disabled) return; e.stopPropagation();
        const a = b.dataset.a; control(a);
        // feel instant: flip the icon now, the next poll confirms it
        if (a === 'toggle' && data) { data.status = data.status === 'Playing' ? 'Paused' : 'Playing'; tickBase = posNow(); tickAt = Date.now(); paint(); }
    };
    pill.addEventListener('click', clickCtl); pop.addEventListener('click', clickCtl);
    $('mpop-bar').addEventListener('click', (e) => {
        if (!data || !data.canSeek || !data.dur) return;
        const r = $('mpop-bar').getBoundingClientRect(); const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
        control('seek', f * data.dur); tickBase = f * data.dur; tickAt = Date.now(); tickProgress();
    });

    const onData = (d) => {
        if (d && d.art === undefined && data && data.track === d.track) d.art = data.art; // the picture only comes with the first message of a track
        data = d && d.title ? d : null;
        if (data) { tickBase = data.pos || 0; tickAt = Date.now(); }
        paint();
    };
    api.onMedia(onData);
    api.mediaGet().then(r => { if (r && r.latest) onData(r.latest); }).catch(() => { });

    // ---- settings (Advanced / Behaviour): apply instantly ----
    const master = $('discord-rpc-input');
    const anchor = $('dc-group') || (master && master.closest('.switch-row'));
    if (anchor) {
        const hint = 'display:block;margin-top:2px;color:var(--text-tertiary);font-size:11px;font-weight:400;text-transform:none;letter-spacing:0;';
        const box = document.createElement('div');
        box.className = 'form-group'; box.id = 'md-group'; box.style.marginTop = '4px';
        box.innerHTML = '<label class="form-label">Now playing (Spotify)</label>' +
            '<div class="switch-row" data-instant="1"><span class="form-label">Show what is playing<span style="' + hint + '">A small player in the top bar with the song, the album art and play / pause / next / previous. Click it for the full player.</span></span><label class="switch-toggle"><input type="checkbox" id="md-on" data-instant="1"><span class="switch-slider"></span></label></div>' +
            '<div class="switch-row" data-instant="1"><span class="form-label">Source<span style="' + hint + '">Spotify only, or any app that shows media controls (a browser, YouTube Music, ...)</span></span><select id="md-src" class="form-input" data-instant="1" style="width:auto;min-width:150px"><option value="spotify">Spotify only</option><option value="any">Any media player</option></select></div>' +
            '<div id="md-status" style="margin-top:8px;font-size:12px;color:var(--text-secondary)"></div>';
        anchor.insertAdjacentElement('afterend', box);
        const status = () => { const s = $('md-status'); if (!s) return; s.textContent = !$('md-on').checked ? '' : (data ? 'Now playing: ' + data.title + (data.artist ? ' - ' + data.artist : '') : 'Nothing playing right now. Open Spotify and press play.'); };
        const load = async () => { try { const r = await api.mediaGet(); $('md-on').checked = !!r.opts.enabled; $('md-src').value = r.opts.source; status(); } catch (e) { } };
        box.addEventListener('change', async () => { try { await api.mediaSetOpts({ enabled: $('md-on').checked, source: $('md-src').value }); } catch (e) { } setTimeout(status, 1500); });
        const adv = $('advanced-toggle'); if (adv) adv.addEventListener('click', () => setTimeout(load, 250));
        load();
    }
    window.SLMedia = { open: openPop, feed: onData };
})();
