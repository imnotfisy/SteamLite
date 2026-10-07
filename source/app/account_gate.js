// SteamLite 9.2.0 - the sign-in screen. Everyone signs in with Steam once; after that SteamLite opens straight away.
// Loaded by both editions. initApp() calls SLGate.run() and stops there when the screen is shown.
(function () {
    'use strict';
    const api = window.electronAPI; if (!api || !api.feat) return;
    const css = document.createElement('style');
    css.textContent = `
    #sl-gate { position: fixed; inset: 0; z-index: 9000; -webkit-app-region: drag; display: flex; align-items: center; justify-content: center; padding: 24px; overflow: auto; background: radial-gradient(1200px 700px at 20% 10%, color-mix(in srgb, var(--accent-color, #8b5cf6) 28%, transparent), transparent 60%), radial-gradient(900px 600px at 90% 90%, color-mix(in srgb, var(--accent-color, #8b5cf6) 18%, transparent), transparent 60%), var(--bg-dark, #0b0b12); font-family: inherit; color: var(--text-primary, #fff); animation: slgIn 0.5s cubic-bezier(.2,.8,.2,1); }
    @keyframes slgIn { from { opacity: 0; transform: scale(1.02); } to { opacity: 1; transform: none; } }
    #sl-gate .slg-card, #sl-gate .slg-wc { -webkit-app-region: no-drag; } #sl-gate .slg-wc { position: absolute; top: 14px; right: 14px; display: flex; gap: 8px; } #sl-gate .slg-wc button { width: 36px; height: 36px; border-radius: 12px; border: 1px solid var(--border-glass, rgba(255,255,255,.14)); background: var(--bg-glass, rgba(255,255,255,.06)); color: var(--text-secondary, #aab); cursor: pointer; display: grid; place-items: center; } #sl-gate .slg-wc button:hover { color: #fff; border-color: var(--accent-color, #8b5cf6); }
    #sl-gate .slg-card { width: min(460px, 100%); padding: 38px 34px 30px; border-radius: 26px; text-align: center; background: var(--bg-glass, rgba(255,255,255,.06)); border: 1px solid var(--border-glass, rgba(255,255,255,.14)); box-shadow: 0 30px 80px rgba(0,0,0,.45); backdrop-filter: blur(24px); }
    #sl-gate .slg-logo { width: 64px; height: 64px; margin: 0 auto 16px; border-radius: 20px; display: grid; place-items: center; background: linear-gradient(135deg, var(--accent-color, #8b5cf6), color-mix(in srgb, var(--accent-color, #8b5cf6) 40%, #000)); box-shadow: 0 10px 30px color-mix(in srgb, var(--accent-color, #8b5cf6) 45%, transparent); }
    #sl-gate .slg-logo svg { width: 34px; height: 34px; fill: #fff; }
    #sl-gate h1 { margin: 0 0 8px; font-size: 24px; font-weight: 800; letter-spacing: -0.01em; }
    #sl-gate p { margin: 0 0 18px; color: var(--text-secondary, #aab); font-size: 14px; line-height: 1.55; }
    #sl-gate ul { list-style: none; margin: 0 0 22px; padding: 0; text-align: left; display: grid; gap: 8px; }
    #sl-gate li { display: flex; gap: 10px; align-items: flex-start; font-size: 13.5px; color: var(--text-secondary, #aab); } #sl-gate li b { color: var(--text-primary, #fff); }
    #sl-gate li::before { content: ''; flex: 0 0 8px; height: 8px; margin-top: 6px; border-radius: 50%; background: var(--accent-color, #8b5cf6); }
    #sl-gate .slg-btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 14px 18px; border-radius: 16px; border: 0; cursor: pointer; font-family: inherit; font-size: 15px; font-weight: 800; color: #fff; background: linear-gradient(135deg, var(--accent-color, #8b5cf6), color-mix(in srgb, var(--accent-color, #8b5cf6) 60%, #000)); box-shadow: 0 10px 28px color-mix(in srgb, var(--accent-color, #8b5cf6) 40%, transparent); transition: transform .2s, filter .2s; }
    #sl-gate .slg-btn:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.1); } #sl-gate .slg-btn:disabled { opacity: .5; cursor: default; }
    #sl-gate .slg-btn.ghost { background: transparent; border: 1px solid var(--border-glass, rgba(255,255,255,.2)); box-shadow: none; margin-top: 10px; font-weight: 700; color: var(--text-secondary, #aab); }
    #sl-gate .slg-note { margin-top: 14px; font-size: 12px; color: var(--text-tertiary, #889); line-height: 1.5; }
    #sl-gate .slg-spin { width: 18px; height: 18px; border-radius: 50%; border: 2.5px solid rgba(255,255,255,.35); border-top-color: #fff; animation: slgSpin .8s linear infinite; } @keyframes slgSpin { to { transform: rotate(360deg); } }
    #sl-gate .slg-ok { width: 64px; height: 64px; margin: 0 auto 14px; border-radius: 50%; display: grid; place-items: center; background: color-mix(in srgb, #22c55e 22%, transparent); border: 2px solid #22c55e; color: #22c55e; font-size: 32px; font-weight: 800; animation: slgPop .5s cubic-bezier(.3,1.6,.5,1); } @keyframes slgPop { from { transform: scale(.4); opacity: 0; } to { transform: none; opacity: 1; } }
    `;
    document.head.appendChild(css);
    const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const LOGO = '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-9.96 9.04l5.35 2.21a2.83 2.83 0 0 1 1.6-.49h.15l2.38-3.45v-.05a3.78 3.78 0 1 1 3.78 3.78h-.09l-3.4 2.43v.12a2.84 2.84 0 0 1-5.62.6l-3.83-1.58A10 10 0 1 0 12 2zM7.54 17.3l-1.23-.51a2.13 2.13 0 0 0 4.07-.47 2.13 2.13 0 0 0-2.84-2.02l1.27.52a1.57 1.57 0 1 1-1.27 2.48zm8.4-5.9a2.52 2.52 0 1 1 2.52-2.52 2.52 2.52 0 0 1-2.52 2.52zm0-.94a1.58 1.58 0 1 0-1.58-1.58 1.58 1.58 0 0 0 1.58 1.58z"/></svg>';
    let el = null, timer = null;
    const mount = (html) => { if (!el) { el = document.createElement('div'); el.id = 'sl-gate'; document.body.appendChild(el); } el.innerHTML = '<div class="slg-wc"><button id="slg-min" title="Minimise"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14"/></svg></button><button id="slg-x" title="Close"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button></div><div class="slg-card">' + html + '</div>'; document.getElementById('slg-min').onclick = () => api.windowMinimize(); document.getElementById('slg-x').onclick = () => api.windowClose(); };
    const hideLoader = () => { const l = document.getElementById('loading-screen'); if (l) { l.classList.remove('active'); l.style.display = 'none'; } };

    function screenSignIn(g) {
        mount('<div class="slg-logo">' + LOGO + '</div><h1>Sign in with Steam</h1>' +
            '<p>' + (g.expired ? 'Your sign-in ran out, so please sign in again. ' : 'Welcome to SteamLite. ') + 'You sign in once, and SteamLite then opens straight away.</p>' +
            '<ul><li><span><b>Your games and profile</b> come from the Steam account you sign in with.</span></li><li><span><b>Cloud backup</b> of your progress, restored on any PC.</span></li><li><span><b>Online features</b>: the leaderboard, shared themes and live votes.</span></li></ul>' +
            (g.reachable === false ? '<p style="color:#fca5a5">SteamLite could not reach its server. Check your internet connection and try again.</p><button class="slg-btn" id="slg-retry">Try again</button>' : '<button class="slg-btn" id="slg-go">Sign in with Steam</button>') +
            '<div class="slg-note">Steam\'s own page confirms who you are. SteamLite never sees your Steam password.</div>');
        const go = document.getElementById('slg-go'), retry = document.getElementById('slg-retry');
        if (retry) retry.onclick = async () => { retry.disabled = true; retry.innerHTML = '<span class="slg-spin"></span>'; const n = await api.feat('acctGate'); if (!n.required) return location.reload(); screenSignIn(n); };
        if (go) go.onclick = async () => {
            go.disabled = true; const r = await api.feat('acctLogin');
            if (!r || !r.ok) { screenSignIn({ reachable: false }); return; }
            screenWaiting();
        };
    }
    function screenWaiting() {
        mount('<div class="slg-logo">' + LOGO + '</div><h1>Finish on Steam</h1><p>A Steam page opened in your browser. Sign in there and confirm, then come back here. This screen updates by itself.</p>' +
            '<button class="slg-btn" disabled><span class="slg-spin"></span> Waiting for Steam...</button><button class="slg-btn ghost" id="slg-again">Open the page again</button><button class="slg-btn ghost" id="slg-cancel">Back</button>');
        document.getElementById('slg-again').onclick = async () => { await api.feat('acctLogin'); };
        document.getElementById('slg-cancel').onclick = async () => { clearInterval(timer); timer = null; await api.feat('acctLoginCancel'); screenSignIn({ reachable: true }); };
        clearInterval(timer);
        timer = setInterval(async () => {
            const c = await api.feat('acctLoginCheck'); if (!c) return;
            if (c.expired) { clearInterval(timer); timer = null; screenSignIn({ reachable: true }); return; }
            if (c.done) { clearInterval(timer); timer = null; screenDone(c.name); }
        }, 2500);
    }
    function screenDone(name) {
        mount('<div class="slg-ok">&#10003;</div><h1>Signed in as ' + esc(name) + '</h1><p>One quick restart and SteamLite loads your games, profile and everything else.</p><button class="slg-btn" id="slg-restart">Restart SteamLite</button>');
        document.getElementById('slg-restart').onclick = (e) => { e.target.disabled = true; e.target.innerHTML = '<span class="slg-spin"></span> Restarting...'; api.feat('acctRestart'); };
    }

    // true when the sign-in screen is up (initApp must stop); false when the app may carry on
    async function run() {
        let g; try { g = await api.feat('acctGate'); } catch (e) { return false; }
        if (!g || !g.required) return false;
        hideLoader(); screenSignIn(g); return true;
    }
    window.SLGate = { run, screenDone, screenWaiting };
})();
