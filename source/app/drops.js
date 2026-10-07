// SteamLite 9.1.0 - Drops: free XP, one every hour, one every 5 hours and one every day (5,000 - 10,000 XP each), with a
// daily streak bonus, rarities (Common / Rare / Epic), coins for the shop and a free spin of the lucky wheel every day.
// The drops live behind the gift icon in the header folder. A red badge shows how many are ready to claim.
(function () {
    'use strict';
    const api = window.electronAPI;
    if (!api || !api.getDrops) return;
    const bar = document.querySelector('.top-bar-actions');
    if (!bar) return;
    const $ = (id) => document.getElementById(id);
    const SV = (p) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
    const GIFT = SV('<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>');
    const COIN = SV('<circle cx="12" cy="12" r="9"/><path d="M14.5 9.2c-.6-.8-1.5-1.2-2.5-1.2-1.4 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2c-1 0-1.9-.4-2.5-1.2M12 6.5V8M12 16v1.5"/>');
    const ICON = { hourly: SV('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'), five: SV('<path d="M5 22h14M5 2h14M17 22v-4.2a2 2 0 0 0-.6-1.4L12 12l-4.4 4.4A2 2 0 0 0 7 17.8V22M7 2v4.2a2 2 0 0 0 .6 1.4L12 12l4.4-4.4A2 2 0 0 0 17 6.2V2"/>'),
        daily: SV('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/>') };
    const TINT = { hourly: '#60a5fa', five: '#a78bfa', daily: '#fbbf24' };
    const RARITY = { common: { name: 'Common', color: '#94a3b8' }, rare: { name: 'Rare', color: '#38bdf8' }, epic: { name: 'Epic', color: '#f472b6' } };
    const SOUND = { hourly: 'success', five: 'streak', daily: 'achievement' }; // every drop type has its own sound
    const fmt = (n) => Number(n).toLocaleString('en-US');
    const snd = (t) => { try { playSound(t); } catch (e) { } };

    // the header button (hidden: the folder clicks it)
    const btn = document.createElement('button');
    btn.id = 'drops-btn'; btn.className = 'top-bar-icon-btn'; btn.title = 'Drops: free XP'; btn.innerHTML = GIFT;
    bar.appendChild(btn);

    // the window
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop'; modal.id = 'drops-modal';
    modal.innerHTML = '<div class="drops-wrap"><div class="dr-head"><div><h2>Drops</h2><p id="dr-sub">Free XP. Open the gift whenever it is ready.</p></div><button class="ctx-item fx-x" id="drops-close" aria-label="Close">✕</button></div>' +
        '<div class="dr-top" id="dr-top"></div><div class="dr-list" id="dr-list"></div><div class="dr-wheelbox" id="dr-wheelbox"></div><div class="dr-foot" id="dr-foot"></div></div>';
    document.body.appendChild(modal);

    let state = null, gifts = [], tickT = 0, nextT = 0, busy = false, spinning = false;
    const readyCount = () => state ? Object.values(state.drops).filter(d => d.ready).length + (state.wheel && state.wheel.ready ? 1 : 0) + gifts.length : 0;
    const publish = () => {
        const n = readyCount(); btn.dataset.count = n ? String(n) : '';
        document.dispatchEvent(new CustomEvent('sl-drops', { detail: { ready: n, coins: state ? state.coins : 0 } }));
    };
    const left = (ms) => {
        const s = Math.max(0, Math.ceil(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
        return h ? h + 'h ' + String(m).padStart(2, '0') + 'm' : m ? m + 'm ' + String(x).padStart(2, '0') + 's' : x + 's';
    };

    async function refresh() {
        try { state = await api.getDrops(); } catch (e) { return; }
        try { const g = api.feat ? await api.feat('srvStatus') : null; gifts = g && g.ok ? (g.gifts || []) : []; } catch (e) { gifts = []; }
        publish(); schedule(); if (modal.classList.contains('active') && !busy && !spinning) paint();
    }
    // wake up exactly when the next drop becomes ready, so the badge appears without polling
    function schedule() {
        clearTimeout(nextT);
        const t = Object.values(state.drops).filter(d => !d.ready && d.nextAt).map(d => d.nextAt - Date.now());
        if (state.wheel && !state.wheel.ready && state.wheel.nextAt) t.push(state.wheel.nextAt - Date.now());
        if (t.length) nextT = setTimeout(refresh, Math.min(Math.max(1000, Math.min(...t) + 400), 2000000000));
    }

    function card(d) {
        const tint = TINT[d.id] || '#a78bfa', mult = state.streak ? state.streak.mult : 1;
        const range = fmt(Math.round(state.min * mult)) + ' - ' + fmt(Math.round(state.max * mult)) + ' XP';
        const body = d.ready
            ? '<button class="dr-claim" data-id="' + d.id + '">Claim</button>'
            : '<div class="dr-wait"><b data-at="' + d.nextAt + '">' + left(d.nextAt - Date.now()) + '</b><span>until the next one</span></div>';
        return '<div class="dr-card' + (d.ready ? ' ready' : '') + '" data-id="' + d.id + '" style="--tint:' + tint + '"><div class="dr-ico">' + (d.ready ? GIFT : ICON[d.id] || GIFT) + '</div>' +
            '<div class="dr-info"><b>' + d.label + '</b><span>' + (d.ready ? 'Ready: ' + range : 'Comes ' + d.every + ': ' + range) + '</span></div>' + body + '</div>';
    }
    function wheelHtml() {
        const w = state.wheel, n = w.segments.length, step = 360 / n;
        const cols = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#facc15'];
        const grad = w.segments.map((s, i) => cols[i % cols.length] + ' ' + (i * step) + 'deg ' + ((i + 1) * step) + 'deg').join(',');
        const labels = w.segments.map((s, i) => '<span style="transform:rotate(' + (i * step + step / 2) + 'deg) translateY(-62px)">' + s.replace(' XP', '').replace(' coins', 'c').replace('Streak restore', 'Restore') + '</span>').join('');
        return '<div class="dr-wheel-wrap"><div class="dr-wheel-ptr"></div><div class="dr-wheel" id="dr-wheel" style="background:conic-gradient(' + grad + ')">' + labels + '<i></i></div></div>' +
            '<div class="dr-wheel-side"><b>Lucky wheel</b><span>One free spin every day. Win XP, coins or even a streak restore.</span>' +
            (w.ready ? '<button class="dr-claim" id="dr-spin">Spin</button>' : '<div class="dr-wait left"><b data-at="' + w.nextAt + '">' + left(w.nextAt - Date.now()) + '</b><span>until your next spin</span></div>') + '<div class="dr-spin-out" id="dr-spin-out"></div></div>';
    }
    function paint() {
        if (!state) return;
        const s = state.streak || { days: 0, mult: 1 };
        $('dr-top').innerHTML = '<div class="dr-chip streak' + (s.days ? ' on' : '') + '" title="Claim the daily drop every day to keep it going: +10% XP per day, up to +70%"><span class="sli-ic">' + SV('<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>') + '</span><b>' + (s.days ? s.days + '-day streak' : 'No streak yet') + '</b><span>' + (s.days ? '+' + Math.round((s.mult - 1) * 100) + '% XP' : 'claim the daily drop') + '</span></div>' +
            '<div class="dr-chip coins" title="Spend coins in the shop"><span class="sli-ic">' + COIN + '</span><b>' + fmt(state.coins) + '</b><span>coins</span></div>';
        $('dr-list').innerHTML = gifts.map(g => '<div class="dr-card ready" style="--tint:#f472b6" data-gift="' + g.id + '"><div class="dr-ico">' + GIFT + '</div><div class="dr-info"><b>' + String(g.title || 'Special gift').replace(/[<>&]/g, '') + '</b><span>Special gift: +' + fmt(g.xp) + ' XP, only for a short time</span></div><button class="dr-claim" data-gift="' + g.id + '">Open</button></div>').join('') + ['hourly', 'five', 'daily'].map(id => card(state.drops[id])).join('');
        if (!spinning) $('dr-wheelbox').innerHTML = wheelHtml();
        $('dr-foot').innerHTML = 'Earned from drops so far: <b>' + fmt(state.totalXp) + ' XP</b> · Level ' + state.level.level + (state.level.maxed ? ' (max)' : '');
        const n = readyCount(); $('dr-sub').textContent = n ? n + (n === 1 ? ' thing is' : ' things are') + ' ready to claim.' : 'Nothing to claim right now. Come back soon.';
    }
    function tick() {
        if (!modal.classList.contains('active')) { clearInterval(tickT); tickT = 0; return; }
        let flip = false;
        modal.querySelectorAll('[data-at]').forEach(el => { const ms = Number(el.dataset.at) - Date.now(); if (ms <= 0) flip = true; else el.textContent = left(ms); });
        if (flip) refresh();
    }
    async function open() {
        modal.classList.add('active'); snd('open');
        if (!state) $('dr-list').innerHTML = '<div class="dr-empty">Loading...</div>';
        await refresh(); clearInterval(tickT); tickT = setInterval(tick, 1000);
    }
    const close = () => { modal.classList.remove('active'); clearInterval(tickT); tickT = 0; };

    async function claim(id, cardEl) {
        if (busy) return; busy = true;
        let r; try { r = await api.claimDrop(id); } catch (e) { r = null; }
        if (!r || !r.ok) { busy = false; try { showToast((r && r.error) || 'Could not claim that drop.'); } catch (e) { } await refresh(); return; }
        state = r.state; publish(); schedule();
        const rar = RARITY[r.rarity] || RARITY.common;
        snd(SOUND[id] || 'achievement'); if (r.rarity === 'epic') setTimeout(() => snd('achievement'), 260);
        // the reveal: the gift pops open, the amount counts up and the rarity shows
        if (cardEl) {
            cardEl.classList.add('opened', 'r-' + r.rarity); cardEl.style.setProperty('--rar', rar.color);
            cardEl.innerHTML = '<div class="dr-ico pop">' + GIFT + '</div><div class="dr-info"><b>' + state.drops[id].label + ' <em class="dr-rar" style="color:' + rar.color + ';border-color:' + rar.color + '">' + rar.name + '</em></b><span>' + (r.mult > 1.001 ? '+' + Math.round((r.mult - 1) * 100) + '% streak bonus · ' : '') + '+' + fmt(r.coins) + ' coins</span></div><div class="dr-won"><b id="dr-won-n" style="color:' + rar.color + '">+0</b><span>XP</span></div>';
            const t0 = performance.now(), dur = 900, el = $('dr-won-n');
            const step = (t) => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = '+' + fmt(Math.round(r.xp * e)); if (k < 1) requestAnimationFrame(step); };
            requestAnimationFrame(step);
        }
        try { showToast('Drop opened: +' + fmt(r.xp) + ' XP and ' + fmt(r.coins) + ' coins'); } catch (e) { }
        if (r.leveledUp) setTimeout(() => { try { showToast('Level up! You are now level ' + state.level.level + '.', null, { sound: 'chime' }); } catch (e) { } }, 700);
        setTimeout(() => { busy = false; if (modal.classList.contains('active')) paint(); }, 2300);
    }

    async function spin() {
        if (spinning) return; spinning = true;
        let r; try { r = await api.spinWheel(); } catch (e) { r = null; }
        if (!r || !r.ok) { spinning = false; try { showToast((r && r.error) || 'Could not spin.'); } catch (e) { } await refresh(); return; }
        const wheel = $('dr-wheel'), n = state.wheel.segments.length, step = 360 / n;
        const target = 360 * 6 - (r.index * step + step / 2);
        const sp = $('dr-spin'); if (sp) sp.disabled = true;
        snd('launch');
        wheel.style.transition = 'transform 4.2s cubic-bezier(0.12, 0.7, 0.1, 1)'; void wheel.offsetWidth; wheel.style.transform = 'rotate(' + target + 'deg)';
        setTimeout(() => {
            state = r.state; publish(); schedule(); snd('achievement');
            const out = $('dr-spin-out'); if (out) out.innerHTML = '<b>' + r.label + '!</b>';
            try { showToast('Lucky wheel: ' + r.label); } catch (e) { }
            if (r.leveledUp) setTimeout(() => { try { showToast('Level up! You are now level ' + state.level.level + '.', null, { sound: 'chime' }); } catch (e) { } }, 600);
            setTimeout(() => { spinning = false; if (modal.classList.contains('active')) paint(); }, 2200);
        }, 4400);
    }

    async function openGift(id) {
        if (busy) return; busy = true;
        let r; try { r = await api.feat('giftClaim', { id }); } catch (e) { r = null; }
        busy = false;
        if (!r || !r.ok) { try { showToast((r && r.error) || 'Could not open the gift.'); } catch (e) { } await refresh(); return; }
        snd('achievement'); try { showToast('Special gift opened: +' + fmt(r.xp) + ' XP'); } catch (e) { }
        await refresh();
    }
    btn.addEventListener('click', open);
    $('drops-close').addEventListener('click', () => { snd('close'); close(); });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) { close(); return; }
        const b = e.target.closest('.dr-claim'); if (!b) return;
        if (b.dataset.gift) { openGift(b.dataset.gift); return; }
        if (b.id === 'dr-spin') spin(); else claim(b.dataset.id, b.closest('.dr-card'));
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('active')) close(); });
    window.addEventListener('focus', () => { if (state) refresh(); });
    setTimeout(refresh, 2500);
    window.SLDrops = { open, refresh, ready: readyCount, state: () => state, claimAll: async () => { for (const id of ['hourly', 'five', 'daily']) { if (state && state.drops[id].ready) { const r = await api.claimDrop(id); if (r && r.ok) state = r.state; } } publish(); return state; } };
})();
