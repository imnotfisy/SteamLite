// SteamLite 9.2.1 - Messages: friends who also use SteamLite, private chats, group chats and friend streaks.
// Everything goes through the SteamLite server (accounts are required, so every player has one). Full edition only.
(function () {
    'use strict';
    if (!window.SLF || !window.electronAPI) return;
    const SLF = window.SLF, $ = (id) => document.getElementById(id), E = SLF.E, feat = SLF.feat, api = window.electronAPI;
    const bar = document.querySelector('.top-bar-actions');
    const SV = (p, w) => '<svg viewBox="0 0 24 24" width="' + (w || 16) + '" height="' + (w || 16) + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
    const ICO = {
        chat: SV('<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 20l1.2-4.6A8.4 8.4 0 1 1 21 11.5z"/>'),
        flame: SV('<path d="M12 2c1 3.5 4.5 5.5 4.5 10a4.5 4.5 0 0 1-9 0c0-1.8.7-3 1.6-4C10 9.5 10.5 10 11 10c0-3-.5-5.5 1-8z"/>', 14),
        send: SV('<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/>', 17),
        users: SV('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>', 15),
        x: SV('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>', 13),
        back: SV('<path d="m15 18-6-6 6-6"/>', 16),
        check: SV('<path d="M20 6 9 17l-5-5"/>', 14)
    };
    const css = document.createElement('style');
    css.textContent = `
    #chat-modal .fx-wrap { width: min(980px, 96vw); max-width: 980px; } #chat-modal .fx-body { padding: 0; overflow: hidden; display: flex; height: min(640px, 76vh); }
    .cx-left { width: 300px; flex: 0 0 300px; border-right: 1px solid var(--border-glass); display: flex; flex-direction: column; min-height: 0; } .cx-right { flex: 1; min-width: 0; display: flex; flex-direction: column; min-height: 0; }
    .cx-tabs { display: flex; gap: 6px; padding: 12px 12px 8px; } .cx-tabs button { flex: 1; padding: 8px 10px; border-radius: 12px; border: 1px solid var(--border-glass); background: transparent; color: var(--text-secondary); font: inherit; font-weight: 700; font-size: 12.5px; cursor: pointer; position: relative; } .cx-tabs button.on { background: var(--accent-color); border-color: var(--accent-color); color: #fff; }
    .cx-dot { display: inline-flex; min-width: 17px; height: 17px; padding: 0 5px; margin-left: 6px; border-radius: 9px; background: #ef4444; color: #fff; font-size: 10.5px; font-weight: 800; align-items: center; justify-content: center; vertical-align: 1px; }
    .cx-list { flex: 1; overflow-y: auto; padding: 4px 10px 12px; } .cx-sec { font-size: 10.5px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: var(--text-tertiary); margin: 12px 4px 6px; }
    .cx-row { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 14px; cursor: pointer; border: 1px solid transparent; transition: background .15s; } .cx-row:hover { background: var(--bg-glass); } .cx-row.on { background: var(--bg-glass); border-color: var(--accent-color); }
    .cx-av { position: relative; width: 38px; height: 38px; flex: 0 0 38px; border-radius: 50%; display: grid; place-items: center; font-weight: 800; font-size: 15px; color: #fff; background: linear-gradient(135deg, var(--accent-color), #0ea5e9); overflow: hidden; } .cx-av img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; } .cx-av.grp { background: linear-gradient(135deg, #14b8a6, var(--accent-color)); }
    .cx-main { flex: 1; min-width: 0; } .cx-name { font-weight: 700; font-size: 13.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .cx-sub { font-size: 11.5px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; } .cx-sub.unread { color: var(--text-primary); font-weight: 700; }
    .cx-streak { display: inline-flex; align-items: center; gap: 3px; padding: 2px 8px; border-radius: 999px; font-size: 11.5px; font-weight: 800; color: #fb923c; background: rgba(251, 146, 60, .14); border: 1px solid rgba(251, 146, 60, .4); } .cx-streak.risk { color: #fbbf24; animation: chPulse 1.6s ease-in-out infinite; } .cx-streak.done { color: #f97316; background: rgba(249, 115, 22, .2); } @keyframes chPulse { 50% { opacity: .55; } }
    .cx-btns { display: flex; gap: 6px; flex-wrap: wrap; padding: 6px 4px; } .cx-mini { padding: 6px 12px; border-radius: 10px; border: 1px solid var(--border-glass); background: var(--bg-glass); color: var(--text-primary); font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; } .cx-mini:hover { border-color: var(--accent-color); } .cx-mini.pri { background: var(--accent-color); border-color: var(--accent-color); color: #fff; } .cx-mini.bad { color: #f87171; } .cx-mini:disabled { opacity: .5; cursor: default; }
    .cx-add { display: flex; gap: 6px; padding: 4px; } .cx-add input, .cx-compose textarea { flex: 1; min-width: 0; padding: 9px 12px; border-radius: 12px; border: 1px solid var(--border-glass); background: var(--bg-glass); color: var(--text-primary); font: inherit; font-size: 13px; outline: none; } .cx-add input:focus, .cx-compose textarea:focus { border-color: var(--accent-color); }
    .cx-note { padding: 6px 6px; font-size: 11.5px; color: var(--text-secondary); line-height: 1.45; }
    .cx-head { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-bottom: 1px solid var(--border-glass); } .cx-head .cx-main { flex: 1; } .cx-back { display: none; }
    .cx-msgs { flex: 1; overflow-y: auto; padding: 14px 16px; display: flex; flex-direction: column; gap: 4px; min-height: 0; }
    .cx-day { align-self: center; font-size: 10.5px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: var(--text-tertiary); margin: 10px 0 4px; }
    .cx-msg { max-width: 76%; align-self: flex-start; position: relative; } .cx-msg.mine { align-self: flex-end; } .cx-who { font-size: 11px; font-weight: 700; color: var(--text-secondary); margin: 6px 4px 2px; }
    .cx-bub { padding: 8px 13px; border-radius: 16px 16px 16px 5px; background: var(--bg-glass); border: 1px solid var(--border-glass); font-size: 13.5px; line-height: 1.45; white-space: pre-wrap; word-break: break-word; } .cx-msg.mine .cx-bub { background: var(--accent-color); border-color: var(--accent-color); color: #fff; border-radius: 16px 16px 5px 16px; }
    .cx-time { font-size: 10px; color: var(--text-tertiary); margin: 2px 6px 0; } .cx-msg.mine .cx-time { text-align: right; }
    .cx-act { position: absolute; top: -4px; right: 100%; display: none; gap: 4px; padding-right: 4px; } .cx-msg.mine .cx-act { right: auto; left: auto; } .cx-msg:hover .cx-act { display: flex; } .cx-msg:not(.mine) .cx-act { right: auto; left: 100%; padding: 0 0 0 4px; }
    .cx-act button { width: 24px; height: 24px; border-radius: 8px; border: 1px solid var(--border-glass); background: var(--bg-dark, #111); color: var(--text-secondary); cursor: pointer; display: grid; place-items: center; font-size: 10px; } .cx-act button:hover { color: #fff; border-color: var(--accent-color); }
    .cx-compose { display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid var(--border-glass); align-items: flex-end; } .cx-compose textarea { resize: none; height: 40px; max-height: 110px; } .cx-send { width: 42px; height: 40px; border-radius: 12px; border: 0; background: var(--accent-color); color: #fff; cursor: pointer; display: grid; place-items: center; } .cx-send:disabled { opacity: .5; }
    .cx-empty { margin: auto; text-align: center; color: var(--text-secondary); font-size: 13.5px; line-height: 1.55; padding: 24px; } .cx-empty b { color: var(--text-primary); display: block; font-size: 15px; margin-bottom: 4px; }
    .cx-banner { display: flex; align-items: center; gap: 10px; padding: 8px 16px; font-size: 12px; color: var(--text-secondary); border-bottom: 1px solid var(--border-glass); background: color-mix(in srgb, #fb923c 8%, transparent); }
    .cx-panel { padding: 12px 16px; border-bottom: 1px solid var(--border-glass); max-height: 46%; overflow-y: auto; flex: 0 0 auto; }
    .cx-pick { display: flex; align-items: center; gap: 10px; padding: 6px 8px; border-radius: 10px; cursor: pointer; } .cx-pick:hover { background: var(--bg-glass); } .cx-pick input { accent-color: var(--accent-color); }
    @media (max-width: 760px) { #chat-modal .fx-body { flex-direction: column; } .cx-left { width: auto; flex: 1; border-right: 0; } .cx-right { display: none; } #chat-modal.in-conv .cx-left { display: none; } #chat-modal.in-conv .cx-right { display: flex; } .cx-back { display: grid; } }
    `;
    document.head.appendChild(css);

    const soc = (op, p) => feat('soc', Object.assign({ op }, p || {}));
    const S = { ov: null, tab: 'chats', conv: null, info: null, msgs: [], lastId: 0, polls: 0, members: false, grp: null, sf: null, busy: false, convTimer: null, ovTimer: null };
    const open = () => !!($('chat-modal') && $('chat-modal').classList.contains('active'));
    const initial = (n) => (String(n || '?').trim()[0] || '?').toUpperCase();
    const av = (u, cls) => '<span class="cx-av' + (cls ? ' ' + cls : '') + '">' + E(initial(u.name)) + (u.avatar ? '<img src="' + E(u.avatar) + '" alt="" onerror="this.remove()">' : '') + '</span>';
    const grpAv = (n) => '<span class="cx-av grp">' + ICO.users + '</span>';
    const streakChip = (f) => !f || (!f.streak && !f.atRisk) ? '' : '<span class="cx-streak' + (f.doneToday ? ' done' : f.atRisk ? ' risk' : '') + '" title="' + (f.doneToday ? 'Streak kept today' : f.atRisk ? 'Message each other today to keep it' : 'Streak') + '">' + ICO.flame + f.streak + '</span>';
    const clock = (t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dayLabel = (t) => { const d = new Date(t), n = new Date(), y = new Date(Date.now() - 86400000); return d.toDateString() === n.toDateString() ? 'Today' : d.toDateString() === y.toDateString() ? 'Yesterday' : d.toLocaleDateString([], { month: 'short', day: 'numeric', year: d.getFullYear() === n.getFullYear() ? undefined : 'numeric' }); };
    const err = (r, d) => (r && r.error && r.error !== 'offline' ? r.error : (r && r.error === 'offline' ? 'Could not reach SteamLite Online.' : d || 'Something went wrong.'));
    const toast = (m) => showToast(m, null, { force: true });
    const notify = (m) => showToast(m, () => openChat()); // background alerts: they obey the mute and snooze settings

    // ---------- header button + folder badge + background check ----------
    const btn = document.createElement('button'); btn.id = 'chat-btn'; btn.className = 'top-bar-icon-btn'; btn.title = 'Messages'; btn.innerHTML = ICO.chat; bar.appendChild(btn);
    let lastUnread = null, lastReq = null;
    const setBadge = (n) => { btn.dataset.count = n ? String(n > 99 ? '99+' : n) : ''; document.dispatchEvent(new Event('sl-chat')); };
    const riskNudge = () => {
        if (!S.ov || new Date().getHours() < 17) return; let seen = {}; try { seen = JSON.parse(localStorage.getItem('sl_chat_nudge') || '{}'); } catch (e) { }
        const k = new Date().toDateString(); (S.ov.friends || []).forEach(f => { if (f.atRisk && !f.mineToday && seen[f.uid] !== k) { seen[f.uid] = k; notify('Your ' + f.streak + '-day streak with ' + f.name + ' ends tonight. Send a message to keep it.'); } });
        try { localStorage.setItem('sl_chat_nudge', JSON.stringify(seen)); } catch (e) { }
    };
    async function loadOv(quiet) {
        const r = await soc('overview'); if (!r || !r.ok) { if (!quiet) S.ov = S.ov || null; return false; }
        S.ov = r; setBadge(r.unread);
        const req = (r.incoming || []).length;
        if (!open()) {
            if (lastUnread !== null && r.unread > lastUnread) { const c = r.convs.find(x => x.unread && x.last && !x.last.mine); notify('New message from ' + (c ? (c.kind === 'group' ? c.name + ': ' + (c.last.from || '') : c.name) : 'a friend') + (c && c.last ? ': ' + c.last.text.slice(0, 60) : '')); }
            else if (lastUnread === null && r.unread > 0) notify('You have ' + r.unread + ' unread message' + (r.unread === 1 ? '' : 's') + '.');
            if (lastReq !== null && req > lastReq) notify('New friend request from ' + r.incoming[0].name + '.'); else if (lastReq === null && req > 0) notify('You have ' + req + ' friend request' + (req === 1 ? '' : 's') + '.');
            riskNudge();
        }
        lastUnread = r.unread; lastReq = req; return true;
    }
    setTimeout(() => loadOv(true), 15000); setInterval(() => { if (!document.hidden && !open()) loadOv(true); }, 90000);

    // ---------- the window ----------
    let modal = null;
    function openChat(toConv) {
        modal = SLF.modal('chat-modal', 'Messages', { cls: 'wide' });
        modal.body.innerHTML = '<div class="cx-left" id="cx-left"></div><div class="cx-right" id="cx-right"></div>'; modal.el._onClose = stop;
        modal.open(); S.busy = false;
        modal.el.onclick = null;
        wire(); renderLeft(); renderRight();
        loadOv().then(() => { renderLeft(); if (toConv) pick(toConv); else if (S.conv) pick(S.conv, true); else renderRight(); });
        clearInterval(S.ovTimer); S.ovTimer = setInterval(async () => { if (!open()) return stop(); if (document.hidden) return; if (await loadOv(true)) renderLeft(true); }, 12000);
    }
    function stop() { clearInterval(S.ovTimer); clearInterval(S.convTimer); S.ovTimer = S.convTimer = null; }
    btn.addEventListener('click', () => openChat());
    SLF.openChat = openChat;

    function wire() {
        const left = $('cx-left'), right = $('cx-right');
        left.onclick = onLeft; right.onclick = onRight;
        right.onkeydown = (e) => { if (e.target.id === 'cx-text' && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendNow(); } };
        right.oninput = (e) => { if (e.target.id === 'cx-text') { e.target.style.height = '40px'; e.target.style.height = Math.min(110, e.target.scrollHeight) + 'px'; } };
    }

    // ----- left column -----
    function renderLeft(keepScroll) {
        const left = $('cx-left'); if (!left) return; const ov = S.ov, y = left.querySelector('.cx-list') ? left.querySelector('.cx-list').scrollTop : 0;
        const nReq = ov ? (ov.incoming || []).length : 0, nUn = ov ? ov.unread : 0;
        let list = '';
        if (!ov) list = '<div class="cx-note">Loading... If this stays empty, SteamLite Online may be unreachable. Messages need a connection.</div>';
        else if (S.tab === 'chats') {
            list = '<div class="cx-btns"><button class="cx-mini pri" data-a="newgroup">New group chat</button></div>' + (ov.convs.length ? ov.convs.map(c => '<div class="cx-row' + (S.conv === c.id ? ' on' : '') + '" data-c="' + E(c.id) + '">' + (c.kind === 'group' ? grpAv(c.name) : av({ name: c.name, avatar: c.avatar })) + '<div class="cx-main"><div class="cx-name">' + E(c.name) + (c.kind === 'group' ? ' <span class="cx-sub" style="display:inline">(' + c.members + ')</span>' : '') + '</div><div class="cx-sub' + (c.unread ? ' unread' : '') + '">' + (c.last ? (c.last.mine ? 'You: ' : (c.kind === 'group' && c.last.from ? E(c.last.from) + ': ' : '')) + E(c.last.text) : 'No messages yet') + '</div></div>' + (c.unread ? '<span class="cx-dot">' + c.unread + '</span>' : '') + '</div>').join('') : '<div class="cx-note">No chats yet. Add a friend in the Friends tab, then press Message.</div>');
        } else {
            const myCode = ov.me.code;
            list = '<div class="cx-sec">Add a friend</div><div class="cx-add"><input id="cx-code" placeholder="Friend code (SL-XXXXXXXXXX)" maxlength="40"><button class="cx-mini pri" data-a="addcode">Add</button></div>' +
                '<div class="cx-note">Your code: <b>' + E(myCode) + '</b> <button class="cx-mini" data-a="copycode" style="padding:3px 9px">Copy</button></div>' +
                '<div class="cx-btns"><button class="cx-mini" data-a="steamfriends">Find my Steam friends on SteamLite</button></div>' +
                (S.sf ? '<div class="cx-sec">On SteamLite</div>' + (S.sf.length ? S.sf.map(u => '<div class="cx-row">' + av(u) + '<div class="cx-main"><div class="cx-name">' + E(u.name) + '</div></div>' + (relationOf(u.uid) ? '<span class="cx-sub">' + relationOf(u.uid) + '</span>' : '<button class="cx-mini pri" data-a="add" data-u="' + E(u.uid) + '">Add</button>') + '</div>').join('') : '<div class="cx-note">None of your Steam friends were found on SteamLite yet. Share your code with them.</div>') : '') +
                (nReq ? '<div class="cx-sec">Requests</div>' + ov.incoming.map(u => '<div class="cx-row">' + av(u) + '<div class="cx-main"><div class="cx-name">' + E(u.name) + '</div></div><button class="cx-mini pri" data-a="accept" data-u="' + E(u.uid) + '">Accept</button><button class="cx-mini" data-a="decline" data-u="' + E(u.uid) + '">No</button></div>').join('') : '') +
                (ov.outgoing.length ? '<div class="cx-sec">Waiting for an answer</div>' + ov.outgoing.map(u => '<div class="cx-row">' + av(u) + '<div class="cx-main"><div class="cx-name">' + E(u.name) + '</div></div><span class="cx-sub">Pending</span></div>').join('') : '') +
                '<div class="cx-sec">Friends (' + ov.friends.length + ')</div>' + (ov.friends.length ? ov.friends.map(f => '<div class="cx-row" data-f="' + E(f.uid) + '">' + av(f) + '<div class="cx-main"><div class="cx-name">' + E(f.name) + '</div><div class="cx-sub">' + (f.doneToday ? 'Streak kept today' : f.atRisk ? 'Streak at risk today' : f.best ? 'Best streak ' + f.best : 'Say hi') + '</div></div>' + streakChip(f) + '</div>').join('') : '<div class="cx-note">No friends yet. Add someone with their code, or find your Steam friends.</div>');
        }
        left.innerHTML = '<div class="cx-tabs"><button data-t="chats" class="' + (S.tab === 'chats' ? 'on' : '') + '">Chats' + (nUn ? '<span class="cx-dot">' + nUn + '</span>' : '') + '</button><button data-t="friends" class="' + (S.tab === 'friends' ? 'on' : '') + '">Friends' + (nReq ? '<span class="cx-dot">' + nReq + '</span>' : '') + '</button></div><div class="cx-list">' + list + '</div>';
        if (keepScroll) left.querySelector('.cx-list').scrollTop = y;
    }
    const relationOf = (uid) => { const o = S.ov; if (!o) return ''; return o.friends.some(f => f.uid === uid) ? 'Friends' : o.outgoing.some(f => f.uid === uid) ? 'Pending' : o.incoming.some(f => f.uid === uid) ? 'Wants to be friends' : ''; };
    async function friendAction(fn, ok) { if (S.busy) return; S.busy = true; try { const r = await fn(); if (r && r.ok) { if (ok) toast(ok); } else toast(err(r)); } finally { S.busy = false; } await loadOv(true); renderLeft(true); }

    async function onLeft(e) {
        const t = e.target.closest('[data-t]'), c = e.target.closest('[data-c]'), a = e.target.closest('[data-a]'), f = e.target.closest('[data-f]');
        if (t) { S.tab = t.dataset.t; renderLeft(); return; }
        if (a && a.dataset.a !== 'newgroup' && !a.dataset.u && !['addcode', 'copycode', 'steamfriends'].includes(a.dataset.a)) return;
        if (a) {
            const k = a.dataset.a, u = a.dataset.u;
            if (k === 'newgroup') { S.conv = null; S.grp = { name: '', sel: {} }; renderLeft(true); renderRight(); document.getElementById('chat-modal').classList.add('in-conv'); }
            else if (k === 'copycode') { try { await navigator.clipboard.writeText(S.ov.me.code); toast('Code copied.'); } catch (er) { toast('Copy it by hand: ' + S.ov.me.code); } }
            else if (k === 'addcode') { const v = ($('cx-code') || {}).value || ''; if (v.trim().length < 6) return toast('Type a friend code first.'); const r = await soc('find', { code: v }); if (!r || !r.ok) return toast(err(r)); if (!r.found.length) return toast('No player found with that code.'); await friendAction(() => soc('friend', { uid: r.found[0].uid }), 'Request sent to ' + r.found[0].name + '.'); }
            else if (k === 'steamfriends') {
                const ids = (typeof friendsCache !== 'undefined' ? friendsCache : []).map(x => x && x.steamid).filter(Boolean);
                if (!ids.length) return toast('Your Steam friends have not loaded yet. Try again in a moment.');
                a.disabled = true; const r = await soc('find', { steamids: ids }); a.disabled = false; if (!r || !r.ok) return toast(err(r)); S.sf = r.found; renderLeft(true);
            }
            else if (k === 'add') { const u2 = S.sf && S.sf.find(x => x.uid === u); await friendAction(() => soc('friend', { uid: u }), u2 ? 'Request sent to ' + u2.name + '.' : 'Request sent.'); }
            else if (k === 'accept') await friendAction(() => soc('respond', { uid: u, accept: true }), 'You are friends now.');
            else if (k === 'decline') await friendAction(() => soc('respond', { uid: u, accept: false }), null);
            return;
        }
        if (c) { S.grp = null; pick(c.dataset.c); return; }
        if (f) { const r = await soc('dm', { uid: f.dataset.f }); if (!r || !r.ok) return toast(err(r)); S.tab = 'chats'; await loadOv(true); pick(r.id); }
    }

    // ----- conversation -----
    async function pick(id, refresh) {
        S.conv = id; S.grp = null; S.members = false; S.lastId = 0; S.msgs = []; S.polls = 0; S.info = refresh && S.info && S.info.id === id ? S.info : null;
        const ch = $('chat-modal'); if (ch) ch.classList.add('in-conv'); renderLeft(true); renderRight();
        await pull(true); clearInterval(S.convTimer);
        S.convTimer = setInterval(() => { if (!open()) return stop(); if (!document.hidden) pull(++S.polls % 5 === 0); }, 3500);
    }
    async function pull(full) {
        if (!S.conv) return; const id = S.conv, r = await soc('conv', { id, after: full ? 0 : S.lastId });
        if (S.conv !== id) return; if (!r || !r.ok) { if (!S.info) { const rt = $('cx-right'); if (rt) rt.innerHTML = '<div class="cx-empty"><b>Could not open this chat</b>' + E(err(r)) + '</div>'; } return; }
        const was = S.msgs.length, lastBefore = S.lastId; S.info = r;
        if (full) S.msgs = r.messages; else if (r.messages.length) S.msgs = S.msgs.concat(r.messages.filter(m => !S.msgs.some(x => x.id === m.id)));
        S.lastId = S.msgs.length ? S.msgs[S.msgs.length - 1].id : 0;
        if (!$('cx-msgs') || full === true && !was && !S.msgs.length) { renderRight(); return; }
        if (full || S.lastId !== lastBefore || !$('cx-head')) renderRight(true);
        if (r.messages.length) loadOv(true).then(() => renderLeft(true));
    }
    function renderRight(keepInput) {
        const right = $('cx-right'); if (!right) return;
        if (S.grp) { renderGroupForm(right); return; }
        right.onclick = onRight;
        if (!S.conv || !S.info) { right.innerHTML = S.conv ? '<div class="cx-empty">Opening...</div>' : '<div class="cx-empty"><div style="width:54px;height:54px;margin:0 auto 12px;color:var(--accent-color)">' + SV('<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 20l1.2-4.6A8.4 8.4 0 1 1 21 11.5z"/>', 54) + '</div><b>Messages</b>Chat with friends who use SteamLite, make group chats and keep a daily streak going. Pick a chat on the left, or add a friend.</div>'; return; }
        const i = S.info, isG = i.kind === 'group', old = $('cx-text'), draft = keepInput && old ? old.value : '', keepFocus = old && document.activeElement === old;
        const peer = !isG ? i.members.find(m => m.uid === i.peerUid) || i.members.find(m => !i.messages.some(x => x.mine && x.uid === m.uid)) : null;
        const title = isG ? i.name : (peer ? peer.name : 'Chat'); const st = i.streak;
        let body = '', lastDay = '', lastMine = 0; S.msgs.forEach(m => { if (m.mine) lastMine = m.id; });
        S.msgs.forEach((m, k) => {
            const d = dayLabel(m.at); if (d !== lastDay) { body += '<div class="cx-day">' + E(d) + '</div>'; lastDay = d; }
            const prev = S.msgs[k - 1], showWho = isG && !m.mine && (!prev || prev.uid !== m.uid || dayLabel(prev.at) !== d);
            body += (showWho ? '<div class="cx-who">' + E(m.name) + '</div>' : '') + '<div class="cx-msg' + (m.mine ? ' mine' : '') + '"><div class="cx-act">' + (m.mine || i.owner ? '<button data-d="' + m.id + '" title="Delete">' + ICO.x + '</button>' : '') + (!m.mine ? '<button data-r="' + m.id + '" data-u="' + E(m.uid) + '" title="Report" style="font-weight:800">!</button>' : '') + '</div><div class="cx-bub">' + E(m.text) + '</div><div class="cx-time">' + clock(m.at) + (!isG && m.mine && m.id === lastMine && i.peerRead >= m.id ? ' · Seen' : '') + '</div></div>';
        });
        const banner = !isG && st ? (st.doneToday ? '<div class="cx-banner">' + ICO.flame + ' <b>' + st.streak + '-day streak</b> kept for today. See you tomorrow!</div>' : st.atRisk || st.streak ? '<div class="cx-banner">' + ICO.flame + ' <b>' + st.streak + '-day streak.</b> ' + (st.mineToday ? 'You sent yours. Waiting for ' + E(title) + '.' : 'Both of you message today to keep it going.') + '</div>' : (st.theirsToday || st.mineToday ? '<div class="cx-banner">' + ICO.flame + ' A streak starts when you both send a message on the same day.</div>' : '')) : '';
        const panel = isG && S.members ? '<div class="cx-panel"><div class="cx-sec" style="margin-top:0">Members (' + i.members.length + ')</div>' + i.members.map(m => '<div class="cx-row" style="cursor:default">' + av(m) + '<div class="cx-main"><div class="cx-name">' + E(m.name) + (m.role === 'owner' ? ' <span class="cx-sub" style="display:inline">owner</span>' : '') + '</div></div>' + (i.owner && m.role !== 'owner' ? '<button class="cx-mini bad" data-k="' + E(m.uid) + '">Remove</button>' : '') + '</div>').join('') + '<div class="cx-btns">' + (i.owner ? '<button class="cx-mini" data-a="addmember">Add a friend</button><button class="cx-mini" data-a="rename">Rename</button>' : '') + '<button class="cx-mini bad" data-a="leave">Leave group</button></div></div>' : '';
        const canSend = isG || i.canSend;
        right.innerHTML = '<div class="cx-head" id="cx-head"><button class="cx-mini cx-back" data-a="back" style="padding:6px 9px">' + ICO.back + '</button>' + (isG ? grpAv(title) : av(peer || { name: title })) + '<div class="cx-main"><div class="cx-name">' + E(title) + '</div><div class="cx-sub">' + (isG ? i.members.length + ' members' : 'Private chat') + '</div></div>' + (!isG ? streakChip(st) : '') +
            (isG ? '<button class="cx-mini" data-a="members">' + ICO.users + ' Members</button>' : '<button class="cx-mini" data-a="unfriend" title="Remove from friends">Unfriend</button><button class="cx-mini bad" data-a="block">Block</button>') + '</div>' + banner + panel +
            '<div class="cx-msgs" id="cx-msgs">' + (body || '<div class="cx-empty"><b>No messages yet</b>' + (canSend ? 'Say hello!' : '') + '</div>') + '</div>' +
            (canSend ? '<div class="cx-compose"><textarea id="cx-text" placeholder="Write a message..." maxlength="1000" rows="1"></textarea><button class="cx-send" data-a="send" title="Send">' + ICO.send + '</button></div>' : '<div class="cx-compose"><div class="cx-note" style="flex:1">You can not message this player any more. They may have removed you.</div></div>');
        const ms = $('cx-msgs'); if (ms) ms.scrollTop = ms.scrollHeight; const ta = $('cx-text'); if (ta) { ta.value = draft; if (draft) ta.style.height = Math.min(110, ta.scrollHeight) + 'px'; if (keepFocus || !keepInput) ta.focus(); }
    }
    async function sendNow() {
        const ta = $('cx-text'); if (!ta || S.busy) return; const text = ta.value.trim(); if (!text || !S.conv) return;
        S.busy = true; ta.disabled = true; const r = await soc('send', { conv: S.conv, text }); S.busy = false; ta.disabled = false;
        if (!r || !r.ok) { toast(err(r)); ta.focus(); return; }
        ta.value = ''; ta.style.height = '40px';
        const was = S.info && S.info.streak ? S.info.streak.streak : 0; await pull(true);
        if (r.streak && r.streak.streak > was && r.streak.doneToday) { toast('Streak: ' + r.streak.streak + ' day' + (r.streak.streak === 1 ? '' : 's') + '! Keep it going tomorrow.'); }
        loadOv(true).then(() => renderLeft(true)); const t2 = $('cx-text'); if (t2) t2.focus();
    }
    async function onRight(e) {
        const a = e.target.closest('[data-a]'), d = e.target.closest('[data-d]'), rp = e.target.closest('[data-r]'), k = e.target.closest('[data-k]'), pk = e.target.closest('[data-g]');
        if (d) { if (!await showConfirm('Delete this message?', 'It is removed for everyone in the chat.')) return; const r = await soc('del', { id: Number(d.dataset.d) }); if (!r || !r.ok) return toast(err(r)); await pull(true); return; }
        if (rp) { const why = await promptText('Report this message', 'What is wrong with it? A moderator will take a look.'); if (!why) return; const r = await soc('report', { uid: rp.dataset.u, conv: S.conv, msgId: Number(rp.dataset.r), reason: why }); toast(r && r.ok ? 'Thanks, your report was sent.' : err(r)); return; }
        if (k) { if (!await showConfirm('Remove from the group?', '')) return; const r = await soc('groupRemove', { conv: S.conv, uid: k.dataset.k }); if (!r || !r.ok) return toast(err(r)); await pull(true); return; }
        if (pk) return;
        if (!a) return; const op = a.dataset.a, i = S.info;
        if (op === 'send') sendNow();
        else if (op === 'back') { const ch = $('chat-modal'); if (ch) ch.classList.remove('in-conv'); S.conv = null; S.grp = null; clearInterval(S.convTimer); renderLeft(true); renderRight(); }
        else if (op === 'members') { S.members = !S.members; renderRight(true); }
        else if (op === 'leave') { if (!await showConfirm('Leave this group?', 'You will not see its messages any more.')) return; const r = await soc('groupRemove', { conv: S.conv, uid: S.ov.me.uid }); if (!r || !r.ok) return toast(err(r)); S.conv = null; S.info = null; clearInterval(S.convTimer); await loadOv(true); renderLeft(); renderRight(); }
        else if (op === 'rename') { const nm = await promptText('Rename the group', 'New name', i.name); if (!nm) return; const r = await soc('groupRename', { conv: S.conv, name: nm }); if (!r || !r.ok) return toast(err(r)); await pull(true); loadOv(true).then(() => renderLeft(true)); }
        else if (op === 'addmember') {
            const inG = new Set(i.members.map(m => m.uid)), cand = S.ov.friends.filter(f => !inG.has(f.uid)); if (!cand.length) return toast('All your friends are already in this group.');
            const pickd = await promptChoice('Add a friend to the group', cand.map(f => ({ id: f.uid, name: f.name }))); if (!pickd) return;
            const r = await soc('groupAdd', { conv: S.conv, uid: pickd }); toast(r && r.ok ? 'Added.' : err(r)); await pull(true);
        }
        else if (op === 'unfriend') { if (!await showConfirm('Remove this friend?', 'You can not message each other and the streak ends.')) return; const r = await soc('unfriend', { uid: i.peerUid }); if (!r || !r.ok) return toast(err(r)); await loadOv(true); await pull(true); renderLeft(true); }
        else if (op === 'block') { if (!await showConfirm('Block this player?', 'They are removed from your friends and can not message you or add you again. You can unblock them later.')) return; const r = await soc('block', { uid: i.peerUid }); if (!r || !r.ok) return toast(err(r)); S.conv = null; S.info = null; clearInterval(S.convTimer); await loadOv(true); renderLeft(); renderRight(); toast('Blocked.'); }
    }

    // ----- new group form -----
    function renderGroupForm(right) {
        const g = S.grp, fr = (S.ov && S.ov.friends) || [], n = Object.keys(g.sel).filter(k => g.sel[k]).length;
        right.innerHTML = '<div class="cx-head"><button class="cx-mini cx-back" data-a="back" style="padding:6px 9px">' + ICO.back + '</button>' + grpAv('') + '<div class="cx-main"><div class="cx-name">New group chat</div><div class="cx-sub">Up to 20 people. Only your friends can be added.</div></div></div>' +
            '<div class="cx-panel" style="max-height:none;flex:1"><div class="cx-add" style="padding:0 0 10px"><input id="gf-name" maxlength="32" placeholder="Group name" value="' + E(g.name) + '"></div>' +
            (fr.length ? fr.map(f => '<label class="cx-pick"><input type="checkbox" data-g="' + E(f.uid) + '"' + (g.sel[f.uid] ? ' checked' : '') + '>' + av(f) + '<span class="cx-name">' + E(f.name) + '</span></label>').join('') : '<div class="cx-note">Add some friends first, then make a group.</div>') + '</div>' +
            '<div class="cx-compose"><div class="cx-note" style="flex:1">' + n + ' selected</div><button class="cx-mini pri" id="gf-make"' + (fr.length ? '' : ' disabled') + '>Create group</button></div>';
        right.onclick = async (e) => {
            if (e.target.closest('[data-a="back"]')) { S.grp = null; const ch = $('chat-modal'); if (ch) ch.classList.remove('in-conv'); renderRight(); right.onclick = onRight; return; }
            const cb = e.target.closest('[data-g]'); if (cb && cb.tagName === 'INPUT') { g.sel[cb.dataset.g] = cb.checked; g.name = $('gf-name').value; renderGroupForm(right); return; }
            if (e.target.id === 'gf-make') {
                const name = $('gf-name').value.trim(), ids = Object.keys(g.sel).filter(k => g.sel[k]); if (name.length < 2) return toast('Give the group a name.'); if (!ids.length) return toast('Pick at least one friend.');
                e.target.disabled = true; const r = await soc('group', { name, members: ids }); if (!r || !r.ok) { e.target.disabled = false; return toast(err(r)); }
                right.onclick = onRight; S.grp = null; await loadOv(true); S.tab = 'chats'; pick(r.id);
            }
        };
    }

    // ----- small dialogs (the app has confirm; text and choice prompts are built here) -----
    function dialog(title, inner, onReady) {
        return new Promise((resolve) => {
            const ov = document.createElement('div'); ov.className = 'modal-backdrop active'; ov.style.zIndex = '9500';
            ov.innerHTML = '<div class="fx-wrap narrow" style="max-width:380px"><div class="fx-head"><h3>' + E(title) + '</h3></div><div class="fx-body" style="padding:14px 18px 18px">' + inner + '</div></div>';
            document.body.appendChild(ov); const done = (v) => { ov.remove(); resolve(v); };
            ov.addEventListener('click', (e) => { if (e.target === ov) done(null); }); onReady(ov, done);
        });
    }
    const promptText = (title, hint, val) => dialog(title, '<div class="cx-note" style="padding:0 0 8px">' + E(hint) + '</div><input class="fx-input" id="pt-in" maxlength="300" style="width:100%" value="' + E(val || '') + '"><div class="cx-btns" style="padding:12px 0 0;justify-content:flex-end"><button class="cx-mini" id="pt-no">Cancel</button><button class="cx-mini pri" id="pt-ok">OK</button></div>', (ov, done) => {
        const inp = ov.querySelector('#pt-in'); setTimeout(() => inp.focus(), 50); const ok = () => done(inp.value.trim() || null);
        ov.querySelector('#pt-ok').onclick = ok; ov.querySelector('#pt-no').onclick = () => done(null); inp.onkeydown = (e) => { if (e.key === 'Enter') ok(); if (e.key === 'Escape') done(null); };
    });
    const promptChoice = (title, items) => dialog(title, '<div style="max-height:260px;overflow-y:auto">' + items.map(x => '<div class="cx-row" data-v="' + E(x.id) + '"><div class="cx-main"><div class="cx-name">' + E(x.name) + '</div></div></div>').join('') + '</div><div class="cx-btns" style="padding:12px 0 0;justify-content:flex-end"><button class="cx-mini" id="pc-no">Cancel</button></div>', (ov, done) => {
        ov.onclick = (e) => { const r = e.target.closest('[data-v]'); if (r) done(r.dataset.v); else if (e.target.id === 'pc-no' || e.target === ov) done(null); };
    });

    SLF.safe && SLF.safe('chat', () => SLF.addTile('Social', '💬', 'Messages', 'Chat with friends who use SteamLite, make group chats and keep friend streaks going.', () => openChat()));
})();
