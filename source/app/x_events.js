// SteamLite 9.1.0 - the Events calendar, seasonal effects on your profile and the "what should we add next?" list.
(function () {
    'use strict';
    if (!window.SLF || !window.electronAPI) return;
    const SLF = window.SLF, $ = (id) => document.getElementById(id), E = SLF.E, feat = SLF.feat;
    const bar = document.querySelector('.top-bar-actions');
    const SV = (p) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
    const d0 = (ts) => new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    const css = document.createElement('style');
    css.textContent = `
    .ec-list { display: flex; flex-direction: column; gap: 12px; }
    .ec-card { display: flex; gap: 16px; padding: 16px 18px; border-radius: 22px; background: var(--bg-glass); border: 1px solid var(--border-glass); }
    .ec-card.live { border-color: color-mix(in srgb, var(--accent-color) 60%, transparent); background: linear-gradient(135deg, color-mix(in srgb, var(--accent-color) 18%, transparent), var(--bg-glass)); }
    .ec-ico { flex: none; width: 52px; height: 52px; border-radius: 18px; display: grid; place-items: center; font-size: 26px; background: color-mix(in srgb, var(--accent-color) 16%, transparent); color: var(--accent-color); } .ec-ico .sli { width: 1.1em; height: 1.1em; }
    .ec-main { flex: 1; min-width: 0; } .ec-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; } .ec-head b { font-size: 16px; }
    .ec-chip { font-size: 10.5px; font-weight: 800; letter-spacing: 0.7px; text-transform: uppercase; padding: 2px 9px; border-radius: 999px; background: rgba(255, 255, 255, 0.08); color: var(--text-secondary); } .ec-chip.live { background: rgba(74, 222, 128, 0.18); color: #4ade80; }
    .ec-dates { font-size: 12.5px; color: var(--text-secondary); margin: 4px 0 6px; } .ec-blurb { font-size: 13px; color: var(--text-secondary); line-height: 1.5; }
    .ec-rew { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; } .ec-rew span { font-size: 11.5px; padding: 3px 10px; border-radius: 999px; border: 1px solid var(--border-glass); color: var(--text-secondary); }
    .pfx { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 1; border-radius: inherit; }
    .pfx i { position: absolute; top: -10px; width: var(--s, 6px); height: var(--s, 6px); border-radius: 50%; background: var(--c, #fff); opacity: 0; animation: pfxFall var(--d, 9s) linear var(--w, 0s) infinite; }
    .pfx.rise i { top: auto; bottom: -10px; animation-name: pfxRise; }
    @keyframes pfxFall { 0% { transform: translate(0, 0); opacity: 0; } 10% { opacity: 0.9; } 100% { transform: translate(var(--x, 30px), 280px); opacity: 0; } }
    @keyframes pfxRise { 0% { transform: translate(0, 0) scale(1); opacity: 0; } 15% { opacity: 0.9; } 100% { transform: translate(var(--x, 20px), -280px) scale(0.4); opacity: 0; } }
    body.reduce-animations .pfx, body.potato-mode .pfx { display: none; }
    .poll-card { display: flex; gap: 14px; align-items: center; padding: 12px 14px; border-radius: 16px; background: var(--bg-glass); border: 1px solid var(--border-glass); margin-bottom: 8px; } .poll-card.voted { border-color: var(--accent-color); }
    `;
    document.head.appendChild(css);

    // ---- the Events calendar ----
    const btn = document.createElement('button'); btn.id = 'events-btn'; btn.className = 'top-bar-icon-btn'; btn.title = 'Events calendar';
    btn.innerHTML = SV('<path d="M8 2v4M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>'); bar.appendChild(btn);
    async function openEvents() {
        const m = SLF.modal('events-modal', 'Events calendar', { cls: 'wide', sub: 'Every event, when it runs and what you can win. Events come back on the same dates every year.' });
        m.body.innerHTML = '<div class="fx-empty">Loading...</div>'; m.open();
        const list = await feat('eventsCalendar'); if (!Array.isArray(list)) { m.body.innerHTML = '<div class="fx-empty">Could not load the events.</div>'; return; }
        m.body.innerHTML = '<div class="ec-list">' + list.map(e => {
            const status = e.active ? '<span class="ec-chip live">Live · ' + e.daysLeft + ' day' + (e.daysLeft === 1 ? '' : 's') + ' left</span>' : '<span class="ec-chip">In ' + e.daysUntil + ' day' + (e.daysUntil === 1 ? '' : 's') + '</span>';
            const prog = e.active ? '<div class="fx-meta" style="margin-top:8px">Your progress: <b>' + (e.quest ? e.quests + ' quests' : e.earned + ' / ' + e.achievements + ' achievements') + '</b></div>' : '';
            return '<div class="ec-card' + (e.active ? ' live' : '') + '"><div class="ec-ico">' + e.icon + '</div><div class="ec-main"><div class="ec-head"><b>' + E(e.name) + '</b>' + status + '</div><div class="ec-dates">' + d0(e.start) + ' – ' + d0(e.end - 1) + ' · every year</div><div class="ec-blurb">' + E(e.blurb) + '</div>' +
                '<div class="ec-rew">' + e.rewards.map(r => '<span>' + E(r) + '</span>').join('') + (e.limitedShop ? '<span>Limited shop items</span>' : '') + '</div>' + prog + '</div></div>';
        }).join('') + '</div>';
    }
    btn.addEventListener('click', () => { playSound('whoosh'); openEvents(); });

    // ---- seasonal effects on your profile (only while an event is on; off with Reduce animations / Potato Mode) ----
    const FX = { halloween: { c: ['#fb923c', '#a855f7', '#f97316'], rise: true, n: 16, s: 5 }, christmas: { c: ['#ffffff', '#e0f2fe'], n: 22, s: 5 }, spring: { c: ['#fbcfe8', '#f9a8d4', '#fde68a'], n: 16, s: 7 }, summer: { c: ['#fde047', '#fbbf24', '#2dd4bf'], rise: true, n: 14, s: 5 }, steamlite: { c: ['#c084fc', '#8b5cf6', '#e9d5ff'], rise: true, n: 18, s: 5 } };
    let liveEv = null, liveAt = 0;
    async function liveEvent() {
        if (Date.now() - liveAt < 600000) return liveEv;
        try { const ev = (await window.electronAPI.getEvents() || []).filter(e => e.active).sort((a, b) => a.end - b.end); liveEv = ev[0] ? ev[0].id : null; } catch (e) { liveEv = null; } liveAt = Date.now(); return liveEv;
    }
    const vc = $('view-container');
    if (vc) new MutationObserver(async () => {
        const ban = vc.querySelector('.profile-view .profile-banner'); if (!ban || ban.querySelector('.pfx')) return;
        if (getUiPref('profileFx', true) === false) return;
        const id = await liveEvent(); const f = id && FX[id]; if (!f || !vc.contains(ban) || ban.querySelector('.pfx')) return;
        const wrap = document.createElement('div'); wrap.className = 'pfx' + (f.rise ? ' rise' : '');
        let h = ''; for (let i = 0; i < f.n; i++) h += '<i style="left:' + Math.round(Math.random() * 100) + '%;--s:' + (f.s + Math.round(Math.random() * 4)) + 'px;--c:' + f.c[i % f.c.length] + ';--d:' + (6 + Math.random() * 7).toFixed(1) + 's;--w:-' + (Math.random() * 10).toFixed(1) + 's;--x:' + Math.round(-40 + Math.random() * 80) + 'px"></i>';
        wrap.innerHTML = h; if (getComputedStyle(ban).position === 'static') ban.style.position = 'relative'; ban.appendChild(wrap);
    }).observe(vc, { childList: true });

    // ---- "what should we add next?" ----
    async function openPolls() {
        const m = SLF.modal('polls-modal', 'What should we add next?', { sub: 'Pick the idea you want most. Votes are counted on GitHub, so a page opens where you can add yours with one click.' });
        m.body.innerHTML = '<div class="fx-empty">Loading...</div>'; m.open();
        // the SteamLite server counts the votes live; without it the list opens a GitHub vote page instead
        const sp = await feat('srvPolls').catch(() => null);
        if (sp && sp.ok && sp.polls && sp.polls[0]) {
            const po = sp.polls[0], top = Math.max(1, ...po.items.map(i => i.votes));
            m.el.querySelector('.fx-sub').textContent = 'Vote for the idea you want most. You can change your vote any time. ' + po.total + ' vote' + (po.total === 1 ? '' : 's') + ' so far.';
            m.body.innerHTML = po.items.slice().sort((a, b) => b.votes - a.votes).map(it => '<div class="poll-card' + (po.mine === it.id ? ' voted' : '') + '"><div class="fx-grow" style="flex:1"><div class="fx-name" style="white-space:normal">' + E(it.title) + '</div><div class="fx-meta">' + E(it.desc || '') + '</div><div class="fx-bar"><i style="width:' + Math.round(it.votes / top * 100) + '%"></i></div></div><div style="text-align:center;min-width:54px"><b>' + it.votes + '</b><div class="fx-meta">votes</div></div><button class="fx-btn' + (po.mine === it.id ? '' : ' primary') + '" data-id="' + E(it.id) + '">' + (po.mine === it.id ? 'Your vote' : 'Vote') + '</button></div>').join('');
            m.body.onclick = async (e) => { const b = e.target.closest('button[data-id]'); if (!b || b.textContent === 'Your vote') return; const v = await feat('srvVote', { pollId: po.id, optionId: b.dataset.id }); if (v && v.ok) { playSound('success'); openPolls(); } else showToast((v && v.error) || 'Could not vote.'); };
            return;
        }
        const r = await feat('polls'); if (!r || !r.ok || !r.data || !Array.isArray(r.data.items)) { m.body.innerHTML = '<div class="fx-empty">' + E((r && r.error) || 'Nothing to vote on right now.') + '</div>'; return; }
        const voted = getUiPref('pollVotes', {});
        m.body.innerHTML = (r.data.title ? '<div class="fx-section">' + E(r.data.title) + '</div>' : '') + r.data.items.map(it => '<div class="poll-card' + (voted[it.id] ? ' voted' : '') + '"><div class="fx-grow" style="flex:1"><div class="fx-name" style="white-space:normal">' + E(it.title) + '</div><div class="fx-meta">' + E(it.desc || '') + '</div></div><button class="fx-btn' + (voted[it.id] ? '' : ' primary') + '" data-id="' + E(it.id) + '" data-t="' + E(it.title) + '">' + (voted[it.id] ? 'Voted' : 'Vote') + '</button></div>').join('');
        m.body.onclick = async (e) => {
            const b = e.target.closest('button[data-id]'); if (!b) return;
            await setUiPref({ pollVotes: { ...getUiPref('pollVotes', {}), [b.dataset.id]: Date.now() } });
            window.electronAPI.openExternal('https://github.com/imnotfisy/SteamLite/issues/new?labels=vote&title=' + encodeURIComponent('Vote: ' + b.dataset.t) + '&body=' + encodeURIComponent('I vote for: ' + b.dataset.t + '\n\n(Just submit this issue, or add a thumbs up to an existing vote.)'));
            openPolls();
        };
    }

    SLF.safe('events', () => {
        SLF.addTile('Progress', '🗓️', 'Events calendar', 'Every event with its dates, rewards and your progress.', openEvents);
        SLF.addTile('Social', '🎯', 'What should we add next?', 'Vote for the next features.', openPolls);
    });
    SLF.openEvents = openEvents; SLF.openPolls = openPolls;
})();
