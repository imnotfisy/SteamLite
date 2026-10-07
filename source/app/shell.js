// SteamLite 9.0.1 - the header: window buttons live in the top bar (Glass), and the less-used buttons
// (inventory, achievements, wishlist, notifications, tools) sit in one folder, like a phone home screen.
// The original buttons stay in the page (hidden) so every handler that belongs to them keeps working: the folder just clicks them.
(function () {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const bar = document.querySelector('.top-bar-actions');
    if (!bar) return;

    // ---- 1. minimise / close are part of the top bar (the old title strip is gone) ----
    const wc = document.querySelector('.window-controls');
    if (wc && wc.parentNode !== bar) bar.appendChild(wc);

    // ---- 2. the folder ----
    const ITEMS = [
        { id: 'inventory-btn', label: 'Inventory', tint: '#fbbf24' },
        { id: 'achievements-toggle', label: 'Achievements', tint: '#f59e0b' },
        { id: 'wishlist-btn', label: 'Wishlist & sales', tint: '#34d399' },
        { id: 'notif-btn', label: 'Notifications', tint: '#60a5fa' },
        { id: 'hub-btn', label: 'Tools & extras', tint: '#a78bfa' }
    ];
    document.body.classList.add('af-on');

    const btn = document.createElement('button');
    btn.id = 'apps-folder-btn'; btn.className = 'top-bar-icon-btn'; btn.title = 'More: inventory, achievements, wishlist, notifications and tools'; btn.setAttribute('aria-haspopup', 'true'); btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2.5" y="2.5" width="19" height="19" rx="6"/>' +
        '<rect x="6.5" y="6.5" width="4" height="4" rx="1.3" fill="currentColor" stroke="none"/><rect x="13.5" y="6.5" width="4" height="4" rx="1.3" fill="currentColor" stroke="none"/>' +
        '<rect x="6.5" y="13.5" width="4" height="4" rx="1.3" fill="currentColor" stroke="none"/><rect x="13.5" y="13.5" width="4" height="4" rx="1.3" fill="currentColor" stroke="none"/></svg><span class="af-dot" id="af-dot"></span>';
    const friends = $('friends-toggle');
    bar.insertBefore(btn, friends || null);

    const pop = document.createElement('div');
    pop.id = 'apps-folder'; pop.className = 'apps-folder'; pop.setAttribute('role', 'menu');
    document.body.appendChild(pop);

    let open = false;
    const unread = () => { const d = $('nb-dot'); return d && d.classList.contains('on') ? (d.textContent || '1') : ''; };
    const syncBadge = () => {
        const u = unread(), dot = $('af-dot');
        if (dot) dot.classList.toggle('on', !!u);
        const t = pop.querySelector('[data-id="notif-btn"] .af-badge'); if (t) { t.textContent = u; t.classList.toggle('on', !!u); }
    };
    const nb = $('nb-dot'); if (nb) new MutationObserver(syncBadge).observe(nb, { attributes: true, childList: true, characterData: true, subtree: true });

    const build = () => {
        const tiles = ITEMS.map(it => {
            const src = $(it.id); if (!src) return '';
            const svg = src.querySelector('svg'); const ico = svg ? svg.outerHTML : '';
            return '<button class="af-tile" role="menuitem" data-id="' + it.id + '" style="--tint:' + it.tint + '"><span class="af-ico">' + ico + '<span class="af-badge"></span></span><span class="af-label">' + it.label + '</span></button>';
        }).join('');
        pop.innerHTML = '<div class="af-title">Quick access</div><div class="af-grid">' + tiles + '</div>';
        syncBadge();
    };
    const place = () => {
        const r = btn.getBoundingClientRect(), w = pop.offsetWidth || 340;
        pop.style.top = Math.round(r.bottom + 12) + 'px';
        pop.style.left = Math.round(Math.min(Math.max(10, r.right - w + 8), window.innerWidth - w - 10)) + 'px';
        pop.style.setProperty('--ox', Math.round(r.left + r.width / 2 - parseFloat(pop.style.left)) + 'px');
    };
    const show = () => {
        build(); open = true; btn.setAttribute('aria-expanded', 'true'); btn.classList.add('open');
        pop.style.visibility = 'hidden'; pop.classList.add('measure'); place(); pop.classList.remove('measure'); pop.style.visibility = '';
        requestAnimationFrame(() => pop.classList.add('on'));
        const first = pop.querySelector('.af-tile'); if (first) setTimeout(() => first.focus({ preventScroll: true }), 60);
    };
    const hide = (refocus) => {
        if (!open) return; open = false; pop.classList.remove('on'); btn.classList.remove('open'); btn.setAttribute('aria-expanded', 'false');
        if (refocus) btn.focus({ preventScroll: true });
    };
    btn.addEventListener('click', (e) => { e.stopPropagation(); try { if (window.playSound) playSound('whoosh'); } catch (er) { } open ? hide() : show(); });
    pop.addEventListener('click', (e) => {
        const t = e.target.closest('.af-tile'); if (!t) return;
        const src = $(t.dataset.id); hide();
        if (src) setTimeout(() => src.click(), 140);
    });
    document.addEventListener('click', (e) => { if (open && !e.target.closest('#apps-folder') && !e.target.closest('#apps-folder-btn')) hide(); });
    document.addEventListener('keydown', (e) => {
        if (!open) return;
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); hide(true); return; }
        if (!/^Arrow/.test(e.key)) return;
        const tiles = [...pop.querySelectorAll('.af-tile')]; if (!tiles.length) return;
        let i = tiles.indexOf(document.activeElement); if (i < 0) i = 0;
        const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -3, ArrowDown: 3 }[e.key];
        i = Math.min(tiles.length - 1, Math.max(0, i + step)); tiles[i].focus(); e.preventDefault();
    }, true);
    window.addEventListener('resize', () => { if (open) place(); });

    // ---- 3. the first window after launch no longer flashes white: the blur is compiled once, invisibly, while the app loads ----
    setTimeout(() => {
        try {
            const w = document.createElement('div');
            w.className = 'modal-backdrop'; w.setAttribute('aria-hidden', 'true');
            w.style.cssText = 'opacity:0.02;visibility:visible;pointer-events:none;transition:none;z-index:1;background:rgba(10,7,18,.46);backdrop-filter:blur(22px) saturate(150%);-webkit-backdrop-filter:blur(22px) saturate(150%)';
            w.innerHTML = '<div style="width:260px;height:160px;border-radius:28px;background:rgba(255,255,255,.04);backdrop-filter:blur(44px) saturate(190%);-webkit-backdrop-filter:blur(44px) saturate(190%);transform:scale(.94);opacity:.5"></div>';
            document.body.appendChild(w);
            requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(() => w.remove(), 450)));
        } catch (e) { }
    }, 1200);

    window.SLShell = { openFolder: show, closeFolder: hide };
})();
