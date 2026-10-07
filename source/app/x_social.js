// SteamLite 9.1.0 - "More settings" (notification rules, snooze, idle detection, pre-launch checks, Discord achievement posts,
// accessibility, language, restore points) and the friend leaderboard.
(function () {
    'use strict';
    if (!window.SLF || !window.electronAPI) return;
    const SLF = window.SLF, $ = (id) => document.getElementById(id), E = SLF.E, feat = SLF.feat, api = window.electronAPI;
    const css = document.createElement('style');
    css.textContent = `
    .ms-sw { display: flex; justify-content: space-between; align-items: center; gap: 14px; padding: 10px 0; border-bottom: 1px solid var(--border-glass); } .ms-sw b { font-size: 13.5px; display: block; } .ms-sw span.d { display: block; font-size: 11.5px; color: var(--text-secondary); margin-top: 2px; }
    .ms-url { display: flex; gap: 8px; margin: 8px 0; } .ms-url .fx-input { flex: 1; }
    .rp-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 12px; background: var(--bg-glass); border: 1px solid var(--border-glass); margin-bottom: 6px; font-size: 13px; } .rp-item .fx-grow { flex: 1; }
    .lb-row { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 14px; background: var(--bg-glass); border: 1px solid var(--border-glass); margin-bottom: 8px; } .lb-row.me { border-color: var(--accent-color); } .lb-row.win { background: linear-gradient(135deg, rgba(251, 191, 36, 0.16), var(--bg-glass)); border-color: rgba(251, 191, 36, 0.5); }
    .lb-row img { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; } .lb-pos { width: 24px; text-align: center; font-weight: 800; color: var(--text-secondary); } .lb-main { flex: 1; min-width: 0; } .lb-bar { height: 6px; border-radius: 4px; background: rgba(255, 255, 255, 0.1); margin-top: 6px; overflow: hidden; } .lb-bar i { display: block; height: 100%; background: linear-gradient(90deg, var(--accent-color), var(--accent-color-2, var(--accent-color))); }
    body.a11y-contrast { --text-primary: #ffffff; --text-secondary: #e8ecf4; --text-tertiary: #cbd5e1; --border-glass: rgba(255, 255, 255, 0.55); --border-glass-hover: #ffffff; }
    body.a11y-contrast .game-card, body.a11y-contrast .modal-wrap, body.a11y-contrast .fx-wrap { border-color: rgba(255, 255, 255, 0.6) !important; }
    body.a11y-focus *:focus-visible { outline: 3px solid #ffffff !important; outline-offset: 2px; box-shadow: 0 0 0 6px var(--accent-color) !important; }
    body.a11y-large button, body.a11y-large .nav-btn, body.a11y-large select, body.a11y-large input:not([type=range]):not([type=checkbox]) { min-height: 42px; } body.a11y-large { letter-spacing: 0.2px; }
    `;
    document.head.appendChild(css);

    // ---- notification rules: mute kinds of pop-ups, or snooze them all for a while ----
    const KINDS = [['sales', 'Sales and wishlist', 'Price drops, free games and sale alerts'], ['friends', 'Friends', 'Friend activity and game alerts'], ['rewards', 'Rewards and progress', 'Achievements, challenges, quests, drops and level-ups'], ['updates', 'Updates', 'New version available'], ['messages', 'Messages and friend requests', 'New messages, friend requests and streak reminders']];
    const kindOf = (msg, opts) => {
        const t = String(msg);
        if (/^(new message from|you have \d+ unread|new friend request|you have \d+ friend request|your \d+-day streak)/i.test(t)) return 'messages';
        if (opts && opts.notification) return 'friends';
        if (/on sale|price you wanted|free to keep|wishlist|\bsale\b/i.test(t)) return 'sales';
        if (/achievement|challenge|quest|drop opened|lucky wheel|level|reward|bingo|season|milestone|hours in|prestige/i.test(t)) return 'rewards';
        if (/update/i.test(t) && /available|new version/i.test(t)) return 'updates';
        return null;
    };
    const muted = () => getUiPref('notifMuted', {});
    const snoozed = () => (getUiPref('notifSnoozeUntil', 0) || 0) > Date.now();
    const prevToast = window.showToast;
    window.showToast = function (message, onClick, opts) {
        try {
            const k = kindOf(message, opts), hide = (opts && opts.force) ? false : (snoozed() || (k && muted()[k]));
            if (hide) { try { SLF.recordNotif && SLF.recordNotif(String(message), k === 'friends' ? 'friend' : 'info'); } catch (e) { } return; }
        } catch (e) { }
        return prevToast.apply(this, arguments);
    };
    const prevAch = window.queueAchPopup;
    if (typeof prevAch === 'function') window.queueAchPopup = function () { if (snoozed() || muted().rewards) return; return prevAch.apply(this, arguments); };

    // ---- the friend leaderboard (hours played in the last 2 weeks) ----
    async function openLeaderboard() {
        const m = SLF.modal('lb-modal', 'Friend challenge', { cls: 'narrow', sub: 'Who played the most in the last 2 weeks? Only friends with a public profile show up.' });
        m.body.innerHTML = '<div class="fx-empty">Asking your friends\' profiles...</div>'; m.open();
        const friends = (typeof friendsCache !== 'undefined' ? friendsCache : []).filter(f => f && f.steamid);
        const r = await feat('friendWeek', { ids: friends.map(f => f.steamid) });
        if (!r || !r.ok) { m.body.innerHTML = '<div class="fx-empty">' + E((r && r.error) || 'Could not load.') + '</div>'; return; }
        const hist = await SLF.sessions(), mine = hist.filter(h => h.start >= Date.now() - 14 * 86400000).reduce((s, h) => s + (h.seconds || 0), 0) / 60;
        const rows = [{ me: true, name: 'You', avatar: ($('user-avatar') || {}).src || '', min: Math.round(mine), top: '' }];
        friends.forEach(f => { const p = r.players[f.steamid]; if (p && p.minutes > 0) rows.push({ name: friendDisplayName(f), avatar: f.avatarfull || f.avatar || '', min: p.minutes, top: p.top }); });
        rows.sort((a, b) => b.min - a.min); const max = Math.max(1, rows[0].min);
        m.body.innerHTML = rows.length < 2 ? '<div class="fx-empty">None of your friends have played recently, or their profiles are private.</div>' : rows.slice(0, 15).map((x, i) => '<div class="lb-row' + (x.me ? ' me' : '') + (i === 0 ? ' win' : '') + '"><span class="lb-pos">' + (i + 1) + '</span><img src="' + E(x.avatar) + '" onerror="this.style.visibility=\'hidden\'"><div class="lb-main"><div class="fx-name">' + E(x.name) + (i === 0 ? ' 🏆' : '') + '</div><div class="fx-meta">' + (x.min / 60).toFixed(1) + ' h' + (x.top ? ' · mostly ' + E(x.top) : '') + '</div><div class="lb-bar"><i style="width:' + Math.round(x.min / max * 100) + '%"></i></div></div></div>').join('');
    }

    // ---- accessibility ----
    const A11Y = () => getUiPref('a11y', { contrast: false, focus: false, large: false });
    const applyA11y = () => { const a = A11Y(); document.body.classList.toggle('a11y-contrast', !!a.contrast); document.body.classList.toggle('a11y-focus', !!a.focus); document.body.classList.toggle('a11y-large', !!a.large); };
    setTimeout(applyA11y, 800);
    // every icon-only button gets a spoken name from its tooltip, and the game cards can be used with the keyboard
    const label = (root) => { (root.querySelectorAll ? root.querySelectorAll('button[title]:not([aria-label])') : []).forEach(b => b.setAttribute('aria-label', b.title)); (root.querySelectorAll ? root.querySelectorAll('.game-card:not([tabindex])') : []).forEach(c => { c.tabIndex = 0; c.setAttribute('role', 'button'); }); };
    setTimeout(() => label(document.body), 1500);
    let lt = 0; new MutationObserver((ms) => { if (lt) return; lt = setTimeout(() => { lt = 0; label(document.body); }, 400); }).observe(document.body, { childList: true, subtree: true });
    document.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target && e.target.classList && e.target.classList.contains('game-card')) { e.preventDefault(); e.target.click(); } });

    // ---- the window ----
    async function openMore() {
        const m = SLF.modal('more-modal', 'More settings', { cls: 'wide', sub: 'Notifications, playing, Discord, accessibility, language and restore points. Switches apply at once.' });
        const xs = (await feat('xsGet')) || {}, wh = (await feat('webhookGet')) || {}, a = A11Y(), mu = muted(), sn = (getUiPref('notifSnoozeUntil', 0) || 0);
        const sw = (id, on) => '<label class="switch-toggle"><input type="checkbox" id="' + id + '"' + (on ? ' checked' : '') + '><span class="switch-slider"></span></label>';
        const row = (b, d, ctl) => '<div class="ms-sw"><div><b>' + b + '</b><span class="d">' + d + '</span></div>' + ctl + '</div>';
        m.body.innerHTML =
            '<div class="fx-section">SteamLite account</div><div id="ms-acct" class="ms-acct"><div class="fx-meta">Checking...</div></div>' +
            '<div class="fx-section">Notifications</div>' + KINDS.map(k => row(k[1], k[2], sw('ms-mute-' + k[0], !mu[k[0]]))).join('') +
            row('Snooze all pop-ups', snoozed() ? 'Quiet until ' + new Date(sn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pause every pop-up for a while (they still go to the history)', '<select class="fx-select" id="ms-snooze"><option value="0">Off</option><option value="1">1 hour</option><option value="8">8 hours</option><option value="24">24 hours</option></select>') +
            '<div class="fx-section">Playing</div>' +
            row('Pre-launch check', 'A heads-up when a game has a Steam update waiting, or the drive is almost full', sw('ms-pre', xs.preflight)) +
            row('Ignore time away from the PC', 'When the PC is idle for ' + (xs.idleMinutes || 10) + ' minutes the time is not added to a game\'s hours', sw('ms-idle', xs.ignoreIdle)) +
            row('Hour milestones', 'A little celebration at 10, 50, 100, 250, 500 and 1000 hours in a game', sw('ms-mile', xs.milestones)) +
            row('Note after a long session', 'Offers to write a journal note after 20+ minutes of play', sw('ms-note', getUiPref('sessionNotes', true) !== false)) +
            row('Seasonal effects on your profile', 'Snow, embers and petals while an event is on', sw('ms-pfx', getUiPref('profileFx', true) !== false)) +
            '<div class="fx-section">Discord</div>' + row('Post achievements to a Discord server', 'Paste a webhook address (Server settings > Integrations > Webhooks)', sw('ms-wh-on', wh.on)) +
            '<div class="ms-url"><input class="fx-input" id="ms-wh-url" type="password" placeholder="' + (wh.hasUrl ? 'A webhook is saved. Paste a new one to replace it.' : 'https://discord.com/api/webhooks/...') + '"><button class="fx-btn" id="ms-wh-save">Save</button><button class="fx-btn" id="ms-wh-test">Test</button></div>' +
            row('Only the big ones', 'Post only achievements that give a theme, a streak restore or finish an event', sw('ms-wh-rare', wh.rareOnly !== false)) +
            '<div class="fx-section">SteamLite Online</div><div class="fx-note" style="margin:0 0 6px" id="ms-on-status">Checking...</div><div class="ms-url"><input class="fx-input" id="ms-on-url" placeholder="Server address (advanced, leave empty for the default)"><button class="fx-btn" id="ms-on-save">Save</button></div>' +
            '<div class="fx-section">Accessibility</div>' +
            row('High contrast', 'Brighter text and stronger borders', sw('ms-hc', a.contrast)) + row('Strong keyboard focus', 'A thick outline around whatever the keyboard is on', sw('ms-fo', a.focus)) + row('Larger click targets', 'Taller buttons and fields', sw('ms-lg', a.large)) +
            row('Text size', 'Use the UI scale in Appearance (80% to 200%)', '<button class="fx-btn" id="ms-scale">Open Appearance</button>') +
            '<div class="fx-section">Language</div>' + row('Language', 'The main screens and menus are translated', '<select class="fx-select" id="ms-lang">' + SLF.langOptions() + '</select>') +
            '<div class="fx-section">Restore points</div><div class="fx-note" style="margin:0 0 8px">A copy of your settings and progress is saved automatically once a day and right before the Updater opens. Restore one if an update ever goes wrong.</div><div class="fx-row"><button class="fx-btn" id="ms-rp-make">Create a restore point now</button></div><div id="ms-rp-list"></div>';
        m.open();
        $('ms-snooze').value = '0'; $('ms-lang').value = getUiPref('lang', 'en');
        const rp = async () => { const l = (await feat('rpList')) || []; $('ms-rp-list').innerHTML = l.length ? l.map(x => '<div class="rp-item"><div class="fx-grow"><b>' + new Date(x.at).toLocaleString() + '</b><div class="fx-meta">' + E(x.reason || 'saved') + (x.version ? ' · SteamLite ' + E(x.version) : '') + '</div></div><button class="fx-btn" data-r="' + E(x.file) + '">Restore</button><button class="fx-btn danger" data-x="' + E(x.file) + '">✕</button></div>').join('') : '<div class="fx-meta">No restore points yet.</div>'; };
        rp();
        let loginTimer = null; const stopLogin = () => { if (loginTimer) { clearInterval(loginTimer); loginTimer = null; } feat('acctLoginCancel'); };
        const ago = (t) => t ? new Date(t).toLocaleString() : 'never';
        const acct = async (waiting) => {
            const el = $('ms-acct'); if (!el) { stopLogin(); return; }
            if (waiting) { el.innerHTML = '<div class="fx-note" style="margin:0 0 8px">Finish signing in on the Steam page that just opened in your browser. This window updates by itself.</div><div class="fx-row"><button class="fx-btn" id="ms-ac-cancel">Cancel</button></div>'; return; }
            const s = (await feat('acctStatus')) || {}, inf = (await feat('srvInfo')) || {};
            if (!s.signedIn) {
                el.innerHTML = '<div class="fx-note" style="margin:0 0 8px">' + (s.expired ? 'Your sign-in ran out, please sign in again. ' : '') + 'Sign in with Steam to back up your progress to the cloud, keep the same leaderboard name on every PC and carry your votes and shared themes with you. Steam\'s own page confirms who you are: SteamLite never sees your Steam password.</div><div class="fx-row"><button class="fx-btn primary" id="ms-ac-login"' + (inf.online ? '' : ' disabled') + '>Sign in with Steam</button>' + (inf.online ? '' : '<span class="fx-meta">SteamLite Online is not reachable right now.</span>') + '</div>';
                return;
            }
            el.innerHTML = '<div class="ms-sw"><div><b>Signed in as ' + E(s.name || 'Steam player') + '</b><span class="d">Steam account ending ' + E(s.idTail || '') + (s.offline ? ' · offline right now' : '') + '</span></div><button class="fx-btn" id="ms-ac-logout">Sign out</button></div>' +
                '<div class="fx-note" style="margin:6px 0">Cloud backup: last saved ' + ago(s.backupAt || s.localBackupAt) + '. It also saves by itself about once a day. Your backup holds settings, XP, achievements, drops, coins and events, not your games.</div>' +
                '<div class="fx-row"><button class="fx-btn primary" id="ms-ac-backup">Back up now</button><button class="fx-btn" id="ms-ac-restore">Restore from cloud</button>' + (s.prevAt ? '<button class="fx-btn" id="ms-ac-prev">Restore the one before</button>' : '') + '<button class="fx-btn danger" id="ms-ac-delete">Delete my account</button></div>';
        };
        acct();
        const startLogin = async () => {
            const r = await feat('acctLogin'); if (!r || !r.ok) { showToast((r && r.error) || 'Could not open the sign-in page.'); return; }
            acct(true); if (loginTimer) clearInterval(loginTimer);
            loginTimer = setInterval(async () => {
                if (!$('ms-acct')) { stopLogin(); return; }
                const c = await feat('acctLoginCheck'); if (c && c.expired) { stopLogin(); acct(); return; }
                if (c && c.done) { clearInterval(loginTimer); loginTimer = null; showToast('Signed in as ' + c.name + '.'); acct(); }
            }, 2500);
        };
        feat('srvInfo').then(i => { const el = $('ms-on-status'); if (el) el.textContent = !i || !i.configured ? 'No server address is set yet, so the leaderboard, community themes and live votes are off.' : (i.online ? 'Connected: the leaderboard, community themes, live votes and announcements work.' : 'The server did not answer. It may be off for a moment.'); });
        feat('srvOverrideGet').then(v => { const el = $('ms-on-url'); if (el && v) el.value = v; });
        m.body.onchange = async (e) => {
            const id = e.target.id;
            if (id.startsWith('ms-mute-')) { const k = id.slice(8); await setUiPref({ notifMuted: { ...muted(), [k]: !e.target.checked } }); }
            else if (id === 'ms-snooze') { const h = Number(e.target.value); await setUiPref({ notifSnoozeUntil: h ? Date.now() + h * 3600000 : 0 }); if (h) showToast('Pop-ups are paused for ' + h + (h === 1 ? ' hour.' : ' hours.'), null, { force: true }); }
            else if (id === 'ms-pre') await feat('xsSet', { preflight: e.target.checked }); else if (id === 'ms-idle') await feat('xsSet', { ignoreIdle: e.target.checked }); else if (id === 'ms-mile') await feat('xsSet', { milestones: e.target.checked });
            else if (id === 'ms-note') await setUiPref({ sessionNotes: e.target.checked }); else if (id === 'ms-pfx') await setUiPref({ profileFx: e.target.checked });
            else if (id === 'ms-wh-on') { const r = await feat('webhookSet', { on: e.target.checked }); if (!r.hasUrl && e.target.checked) showToast('Paste a webhook address first.'); } else if (id === 'ms-wh-rare') await feat('webhookSet', { rareOnly: e.target.checked });
            else if (id === 'ms-hc' || id === 'ms-fo' || id === 'ms-lg') { await setUiPref({ a11y: { contrast: $('ms-hc').checked, focus: $('ms-fo').checked, large: $('ms-lg').checked } }); applyA11y(); }
            else if (id === 'ms-lang') { await setUiPref({ lang: e.target.value }); SLF.applyLang && SLF.applyLang(); }
        };
        m.body.onclick = async (e) => {
            const id = e.target.id, r = e.target.closest('[data-r]'), x = e.target.closest('[data-x]');
            if (id === 'ms-ac-login') await startLogin();
            else if (id === 'ms-ac-cancel') { stopLogin(); acct(); }
            else if (id === 'ms-ac-logout') { await feat('acctLogout'); showToast('Signed out. Your cloud backup stays in your account.'); setTimeout(() => location.reload(), 900); }
            else if (id === 'ms-ac-backup') { e.target.disabled = true; const r = await feat('acctBackup'); showToast(r && r.ok ? 'Backed up to your account.' : ((r && r.error) || 'Could not back up.')); acct(); }
            else if (id === 'ms-ac-restore' || id === 'ms-ac-prev') {
                if (await showConfirm('Restore from the cloud?', 'Your settings and progress are replaced with the saved copy' + (id === 'ms-ac-prev' ? ' from before the latest one' : '') + '. A restore point of the current state is saved first, and SteamLite restarts.')) { const r = await feat('acctRestore', { prev: id === 'ms-ac-prev' }); if (r && r.ok) { showToast('Restored. Restarting...'); setTimeout(() => feat('restartApp'), 900); } else showToast((r && r.error) || 'Could not restore.'); }
            }
            else if (id === 'ms-ac-delete') {
                if (await showConfirm('Delete your SteamLite account?', 'This removes your cloud backup, your leaderboard entry, your votes and the themes you shared from the server. Your own progress on this PC is not touched.')) { const r = await feat('acctDelete'); showToast(r && r.ok ? 'Your account and its data were deleted.' : ((r && r.error) || 'Could not delete.')); if (r && r.ok) setTimeout(() => location.reload(), 1200); else acct(); }
            }
            else if (id === 'ms-on-save') { const res = await feat('srvOverride', { url: $('ms-on-url').value }); showToast(res && res.ok ? 'Server address saved.' : ((res && res.error) || 'Could not save.')); openMore(); }
            else if (id === 'ms-wh-save') { const v = $('ms-wh-url').value.trim(); if (!v) return; const res = await feat('webhookSet', { url: v }); showToast(res.ok ? 'Webhook saved.' : res.error); $('ms-wh-url').value = ''; }
            else if (id === 'ms-wh-test') { const res = await feat('webhookTest'); showToast(res && res.ok ? 'Test message sent. Check your server.' : 'Could not post. Is the webhook saved?'); }
            else if (id === 'ms-scale') { m.close(); if (typeof openAppearance === 'function') openAppearance(); }
            else if (id === 'ms-rp-make') { await feat('rpMake'); showToast('Restore point saved.'); rp(); }
            else if (r) { if (await showConfirm('Restore this point?', 'Your settings and progress go back to how they were then. A restore point of the current state is saved first, and SteamLite restarts.')) { const res = await feat('rpRestore', { file: r.dataset.r }); if (res && res.ok) { showToast('Restored. Restarting...'); setTimeout(() => feat('restartApp'), 900); } else showToast((res && res.error) || 'Could not restore.'); } }
            else if (x) { await feat('rpDelete', { file: x.dataset.x }); rp(); }
        };
    }

    SLF.safe('more-settings', () => {
        SLF.addTile('Settings', '🎛️', 'More settings', 'Notification rules and snooze, idle detection, pre-launch checks, Discord achievement posts, accessibility, language and restore points.', openMore);
        SLF.addTile('Social', '🏆', 'Friend challenge', 'See who played the most in the last 2 weeks.', openLeaderboard);
    });
    SLF.openMore = openMore; SLF.openLeaderboard = openLeaderboard;
})();
