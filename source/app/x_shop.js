// SteamLite 9.1.0 - the Shop (spend drop coins on avatar frames and profile titles), the Trophy room (every frame, title and
// theme with how to get it) and the extra avatar frames. Full edition only: it uses the Tools & extras framework.
(function () {
    'use strict';
    if (!window.SLF || !window.electronAPI) return;
    const SLF = window.SLF, $ = (id) => document.getElementById(id), E = SLF.E, feat = SLF.feat;
    const bar = document.querySelector('.top-bar-actions');
    const fmt = (n) => Number(n).toLocaleString('en-US');
    const SV = (p) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
    const ICO = {
        bag: SV('<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>'),
        trophy: SV('<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z"/>'),
        lock: SV('<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>')
    };
    const COIN = SV('<circle cx="12" cy="12" r="9"/><path d="M14.5 9.2c-.6-.8-1.5-1.2-2.5-1.2-1.4 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2c-1 0-1.9-.4-2.5-1.2M12 6.5V8M12 16v1.5"/>');

    // ---- the extra avatar frames (a glowing double ring that breathes in two colours) ----
    const FRAMES = { neon: ['#22d3ee', '#f472b6'], emerald: ['#34d399', '#065f46'], sunset: ['#fb923c', '#ec4899'], mono: ['#ffffff', '#6b7280'], candy: ['#f9a8d4', '#6ee7b7'], void: ['#7c3aed', '#0f0a1f'],
        pumpkin: ['#fb923c', '#1f1300'], holly: ['#ef4444', '#16a34a'], blossom: ['#fbcfe8', '#f472b6'], sunseeker: ['#fde047', '#14b8a6'], roots: ['#a78bfa', '#4c1d95'] };
    const css = document.createElement('style');
    css.textContent = '@keyframes avatarVar { 0%, 100% { box-shadow: 0 0 0 3px var(--f1), 0 0 0 6px var(--f2), 0 0 20px var(--f1); } 50% { box-shadow: 0 0 0 3px var(--f2), 0 0 0 6px var(--f1), 0 0 32px var(--f2); } }' +
        Object.keys(FRAMES).map(k => '.profile-avatar-modern.frame-' + k + ', .sh-av.frame-' + k + ' { --f1: ' + FRAMES[k][0] + '; --f2: ' + FRAMES[k][1] + '; animation: profileAvatarIn var(--dur-slow) var(--ease-spring), avatarVar 4.5s ease-in-out var(--dur-slow) infinite; }').join('\n') + `
    .sh-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 2px 0 14px; flex-wrap: wrap; }
    .sh-coins { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 999px; background: rgba(251, 191, 36, 0.12); border: 1px solid rgba(251, 191, 36, 0.4); font-weight: 800; color: #fbbf24; } .sh-coins svg { width: 18px; height: 18px; }
    .sh-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 12px; }
    .sh-item { position: relative; display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 18px 14px 14px; border-radius: 20px; background: var(--bg-glass); border: 1px solid var(--border-glass); text-align: center; transition: transform 0.25s var(--ease-spring), border-color 0.2s; }
    .sh-item:hover { transform: translateY(-3px); border-color: var(--border-glass-hover); } .sh-item.owned { opacity: 0.78; }
    .sh-item.limited { border-color: rgba(251, 146, 60, 0.5); background: linear-gradient(160deg, rgba(251, 146, 60, 0.12), var(--bg-glass)); }
    .sh-av { width: 64px; height: 64px; border-radius: 50%; overflow: hidden; margin: 8px 0 6px; flex: none; } .sh-av img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .sh-title { display: inline-block; padding: 10px 16px; border-radius: 12px; background: linear-gradient(135deg, color-mix(in srgb, var(--accent-color) 30%, transparent), rgba(255,255,255,0.04)); border: 1px solid color-mix(in srgb, var(--accent-color) 40%, transparent); font-weight: 800; font-size: 14px; margin: 14px 0 12px; }
    .sh-name { font-weight: 700; font-size: 14px; } .sh-kind { font-size: 11px; letter-spacing: 0.8px; text-transform: uppercase; color: var(--text-tertiary); }
    .sh-lim { position: static; align-self: center; margin-bottom: 2px; font-size: 9.5px; font-weight: 800; letter-spacing: 0.7px; text-transform: uppercase; padding: 2px 8px; border-radius: 999px; background: rgba(251, 146, 60, 0.9); color: #1f1300; }
    .sh-buy { width: 100%; padding: 9px 12px; border-radius: 12px; border: 0; font-family: inherit; font-weight: 800; font-size: 13px; cursor: pointer; color: #fff; background: linear-gradient(135deg, var(--accent-color), var(--accent-color-2, var(--accent-color))); display: inline-flex; gap: 6px; align-items: center; justify-content: center; }
    .sh-buy svg { width: 15px; height: 15px; } .sh-buy:disabled { opacity: 0.45; cursor: default; background: rgba(255, 255, 255, 0.1); }
    .tr-sum { display: flex; align-items: center; gap: 14px; margin: 2px 0 6px; } .tr-sum .fx-bar { flex: 1; margin: 0; }
    .tr-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
    .tr-item { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 14px 10px 12px; border-radius: 18px; background: var(--bg-glass); border: 1px solid var(--border-glass); text-align: center; }
    .tr-item.locked { opacity: 0.5; } .tr-item.locked .sh-av { filter: grayscale(1); animation: none !important; box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.12); }
    .tr-item small { font-size: 11px; color: var(--text-secondary); line-height: 1.35; } .tr-item b { font-size: 13px; } .tr-item .lim { color: #fb923c; font-size: 9.5px; font-weight: 800; letter-spacing: 0.6px; text-transform: uppercase; }
    .tr-titles { display: flex; flex-wrap: wrap; gap: 8px; } .tr-t { padding: 7px 13px; border-radius: 999px; background: var(--bg-glass); border: 1px solid var(--border-glass); font-size: 12.5px; font-weight: 700; } .tr-t.locked { opacity: 0.45; font-weight: 500; }
    .tr-themes { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; } .tr-th { padding: 12px; border-radius: 16px; background: var(--bg-glass); border: 1px solid var(--border-glass); } .tr-th.locked { opacity: 0.5; }
    .tr-sw { display: flex; gap: 4px; margin-bottom: 8px; } .tr-sw i { flex: 1; height: 14px; border-radius: 6px; }
    `;
    document.head.appendChild(css);

    // header buttons the folder uses
    const mk = (id, title, svg) => { const b = document.createElement('button'); b.id = id; b.className = 'top-bar-icon-btn'; b.title = title; b.innerHTML = svg; bar.appendChild(b); return b; };
    const shopBtn = mk('shop-btn', 'Shop', ICO.bag), trophyBtn = mk('trophy-btn', 'Trophy room', ICO.trophy);

    const avatar = () => { const a = $('user-avatar'); return a && a.src ? a.src : ''; };
    const untilTxt = (ts) => { const s = Math.max(0, Math.round((ts - Date.now()) / 1000)), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return h + 'h ' + String(m).padStart(2, '0') + 'm'; };
    const dateTxt = (ts) => new Date(ts - 1).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    // ---- the Shop ----
    async function openShop() {
        const m = SLF.modal('shop-modal', 'Shop', { cls: 'wide', sub: 'Spend the coins you earn from drops. The daily picks change at midnight; event items are only here while the event is on.' });
        m.body.innerHTML = '<div class="fx-empty">Loading...</div>'; m.open();
        const paint = async () => {
            const r = await feat('shopGet'); if (!r || !r.items) { m.body.innerHTML = '<div class="fx-empty">The shop is closed right now.</div>'; return; }
            const card = (it) => {
                const prev = it.type === 'frame' ? '<div class="sh-av profile-avatar-modern frame-' + E(it.key) + '"><img src="' + E(avatar()) + '" alt=""></div>' : '<div class="sh-title">' + E(it.name) + '</div>';
                const can = r.coins >= it.price;
                return '<div class="sh-item' + (it.owned ? ' owned' : '') + (it.limited ? ' limited' : '') + '">' + (it.limited ? '<span class="sh-lim">' + E(it.limited) + ' · until ' + dateTxt(it.endsAt) + '</span>' : '') + prev +
                    '<div><div class="sh-name">' + (it.type === 'frame' ? E(it.name) + ' frame' : 'Title') + '</div><div class="sh-kind">' + (it.type === 'frame' ? 'Avatar frame' : 'Profile title') + '</div></div>' +
                    '<button class="sh-buy" data-id="' + E(it.id) + '"' + (it.owned || !can ? ' disabled' : '') + '>' + (it.owned ? 'Owned' : COIN + fmt(it.price)) + '</button></div>';
            };
            const daily = r.items.filter(i => !i.limited), lim = r.items.filter(i => i.limited);
            m.body.innerHTML = '<div class="sh-top"><span class="sh-coins">' + COIN + fmt(r.coins) + ' coins</span><span class="fx-meta">Daily picks refresh in ' + untilTxt(r.refreshesAt) + '</span></div>' +
                (lim.length ? '<div class="fx-section">Limited time</div><div class="sh-grid">' + lim.map(card).join('') + '</div>' : '') +
                '<div class="fx-section">Today\'s picks</div><div class="sh-grid">' + daily.map(card).join('') + '</div>' +
                '<div class="fx-note">Coins come from drops (1 coin per 100 XP) and the lucky wheel.</div>';
        };
        await paint();
        m.body.onclick = async (e) => {
            const b = e.target.closest('.sh-buy'); if (!b || b.disabled) return; b.disabled = true;
            const r = await feat('shopBuy', { id: b.dataset.id });
            if (r && r.ok) { try { playSound('achievement'); showToast('Bought ' + r.item.name + (r.item.type === 'frame' ? ' frame' : ' title') + '. Pick it in Edit Profile.'); } catch (er) { } document.dispatchEvent(new CustomEvent('sl-drops')); }
            else { try { showToast((r && r.error) || 'Could not buy that.'); } catch (er) { } }
            paint();
        };
    }

    // ---- the Trophy room ----
    async function openTrophy() {
        const m = SLF.modal('trophy-modal', 'Trophy room', { cls: 'wide', sub: 'Everything you can collect: avatar frames, profile titles and reward themes. Grey ones are still locked, with a hint on how to get them.' });
        m.body.innerHTML = '<div class="fx-empty">Loading...</div>'; m.open();
        const r = await feat('trophyGet'); if (!r || !r.frames) { m.body.innerHTML = '<div class="fx-empty">Could not load the trophy room.</div>'; return; }
        const fr = (f) => '<div class="tr-item' + (f.owned ? '' : ' locked') + '"><div class="sh-av profile-avatar-modern frame-' + E(f.id) + '"><img src="' + E(avatar()) + '" alt=""></div><b>' + E(f.name) + '</b>' + (f.limited ? '<span class="lim">Limited time</span>' : '') + '<small>' + (f.owned ? 'Yours' : E(f.how)) + '</small></div>';
        m.body.innerHTML = '<div class="tr-sum"><b>' + r.owned + ' / ' + r.total + ' collected</b><div class="fx-bar"><i style="width:' + Math.round(r.owned / r.total * 100) + '%"></i></div></div>' +
            '<div class="fx-section">Avatar frames</div><div class="tr-grid">' + r.frames.map(fr).join('') + '</div>' +
            '<div class="fx-section">Profile titles</div><div class="tr-titles">' + r.titles.map(t => '<span class="tr-t' + (t.owned ? '' : ' locked') + '" title="' + E(t.owned ? 'Yours' : t.how) + '">' + E(t.name) + '</span>').join('') + '</div>' +
            '<div class="fx-section">Reward themes</div><div class="tr-themes">' + r.themes.map(t => '<div class="tr-th' + (t.owned ? '' : ' locked') + '"><div class="tr-sw">' + (t.colors || []).map(c => '<i style="background:' + E(c) + '"></i>').join('') + '</div><b style="font-size:13px">' + E(t.name) + '</b><div class="fx-meta">' + (t.owned ? 'Yours' : E(t.how)) + '</div></div>').join('') + '</div>';
    }

    shopBtn.addEventListener('click', () => { playSound('whoosh'); openShop(); });
    trophyBtn.addEventListener('click', () => { playSound('whoosh'); openTrophy(); });
    SLF.safe('shop', () => {
        SLF.addTile('Progress', '🏷️', 'Shop', 'Spend your drop coins on avatar frames and profile titles, including limited-time event items.', openShop);
        SLF.addTile('Progress', '🏆', 'Trophy room', 'Every frame, title and reward theme, what you own and how to get the rest.', openTrophy);
    });
    SLF.openShop = openShop; SLF.openTrophy = openTrophy;
})();
