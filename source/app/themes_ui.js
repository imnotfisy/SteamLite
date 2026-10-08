// SteamLite 9.2.2 - the Themes window (Official, Community, My library) and the new Theme Maker, which can publish a theme to
// SteamLite Online so other players can find it, preview it and download it. Both editions. It replaces the old Theme Shop window:
// everything that used to call openThemeShop() now opens this one.
(function () {
    'use strict';
    const api = window.electronAPI; if (!api) return;
    const $ = (id) => document.getElementById(id);
    const E = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const feat = (n, p) => (api.feat ? api.feat(n, p) : Promise.resolve({ ok: false, error: 'offline' }));
    const SV = (p, w) => '<svg viewBox="0 0 24 24" width="' + (w || 15) + '" height="' + (w || 15) + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
    const ICO = { heart: SV('<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>', 14), down: SV('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>', 14), lock: SV('<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>', 13), check: SV('<path d="M20 6 9 17l-5-5"/>', 13), plus: SV('<path d="M12 5v14M5 12h14"/>', 15), x: SV('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>', 14), flag: SV('<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>', 13), shuffle: SV('<path d="M16 3h5v5"/><path d="M4 20 21 3"/><path d="M21 16v5h-5"/><path d="m15 15 6 6"/><path d="m4 4 5 5"/>', 15), globe: SV('<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z"/>', 15) };
    const DEF = { '--bg-dark': '#0b0b10', '--bg-glass': 'rgba(15,15,20,0.88)', '--bg-glass-light': 'rgba(28,28,36,0.92)', '--border-glass': 'rgba(255,255,255,0.08)', '--border-glass-hover': 'rgba(255,255,255,0.2)', '--text-primary': '#eef0f6', '--text-secondary': '#9598a8', '--accent-color': '#8b5cf6', '--success': '#6ee7a0', '--warning': '#f5d76e', '--danger': '#ff6b6b' };
    const SAFE_VAR = (k, v) => /^--[a-z0-9-]{1,40}$/.test(k) && /^[#a-zA-Z0-9(),.%\s\/-]+$/.test(String(v)) && String(v).length <= 120 && !/url|expression|javascript/i.test(String(v));
    const BAD_CSS = /@import|@font-face|url\s*\(|expression|javascript:|behavior|binding|<|>|\\|image-set|\bsrc\s*:|content\s*:\s*attr/i;
    const safeCss = (c) => (typeof c === 'string' && c.length <= 8000 && !BAD_CSS.test(c)) ? c : '';
    const toast = (m) => { try { showToast(m); } catch (e) { } };
    const snd = (n) => { try { playSound(n); } catch (e) { } };
    const cfg = () => (typeof activeConfig !== 'undefined' ? activeConfig : {});
    const initial = (n) => (String(n || '?').trim()[0] || '?').toUpperCase();
    const fmt = (n) => Number(n || 0).toLocaleString('en-US');

    const css = document.createElement('style');
    css.textContent = `
    #thx-modal .thx-wrap, #thxm-modal .thx-wrap { position: relative; display: flex; flex-direction: column; background: color-mix(in srgb, var(--bg-dark) 94%, transparent); border: 1px solid var(--border-glass); border-radius: 28px; box-shadow: 0 40px 120px rgba(0, 0, 0, .55); backdrop-filter: blur(28px); color: var(--text-primary); overflow: hidden; transform: translateY(14px) scale(.985); opacity: 0; transition: transform .35s cubic-bezier(.2, 1.1, .3, 1), opacity .25s; }
    #thx-modal.active .thx-wrap, #thxm-modal.active .thx-wrap { transform: none; opacity: 1; }
    #thx-modal .thx-wrap { width: min(1120px, 96vw); height: min(800px, 92vh); } #thxm-modal .thx-wrap { width: min(1060px, 96vw); height: min(780px, 92vh); }
    .thx-head { display: flex; align-items: center; gap: 14px; padding: 18px 22px 12px; flex-wrap: wrap; } .thx-head h3 { margin: 0; font-size: 21px; font-weight: 800; letter-spacing: -.01em; } .thx-sub { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }
    .thx-tabs { display: inline-flex; gap: 4px; padding: 4px; border-radius: 16px; background: var(--bg-glass); border: 1px solid var(--border-glass); margin-left: 8px; } .thx-tabs button { padding: 8px 16px; border: 0; border-radius: 12px; background: transparent; color: var(--text-secondary); font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; transition: background .2s, color .2s; } .thx-tabs button.on { background: var(--accent-color); color: #fff; box-shadow: 0 6px 18px color-mix(in srgb, var(--accent-color) 40%, transparent); }
    .thx-tools { margin-left: auto; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; } .thx-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 9px 16px; border-radius: 13px; border: 1px solid var(--border-glass); background: var(--bg-glass); color: var(--text-primary); font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; transition: transform .18s, border-color .2s, filter .2s; } .thx-btn:hover:not(:disabled) { border-color: var(--accent-color); transform: translateY(-1px); } .thx-btn:disabled { opacity: .5; cursor: default; } .thx-btn.pri { background: var(--accent-color); border-color: var(--accent-color); color: #fff; } .thx-btn.pri:hover:not(:disabled) { filter: brightness(1.1); } .thx-btn.bad { color: #f87171; } .thx-btn.sm { padding: 6px 12px; font-size: 12px; border-radius: 11px; }
    .thx-acc { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-secondary); } .thx-acc input[type=color] { width: 36px; height: 30px; padding: 2px; border-radius: 9px; border: 1px solid var(--border-glass); background: var(--bg-glass); cursor: pointer; }
    .thx-x { width: 36px; height: 36px; padding: 0; border-radius: 12px; } .thx-bar { display: flex; align-items: center; gap: 10px; padding: 4px 22px 12px; flex-wrap: wrap; } .thx-bar input[type=search], .thx-in { padding: 9px 14px; border-radius: 13px; border: 1px solid var(--border-glass); background: var(--bg-glass); color: var(--text-primary); font: inherit; font-size: 13px; outline: none; min-width: 0; } .thx-bar input[type=search] { flex: 1; max-width: 340px; } .thx-in:focus, .thx-bar input:focus { border-color: var(--accent-color); }
    .thx-chip { padding: 7px 14px; border-radius: 999px; border: 1px solid var(--border-glass); background: transparent; color: var(--text-secondary); font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; } .thx-chip.on { background: color-mix(in srgb, var(--accent-color) 22%, transparent); border-color: var(--accent-color); color: var(--text-primary); }
    .thx-body { flex: 1; overflow-y: auto; padding: 4px 22px 22px; min-height: 0; } .thx-sec { font-size: 11px; font-weight: 800; letter-spacing: .09em; text-transform: uppercase; color: var(--text-tertiary); margin: 18px 2px 10px; } .thx-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; }
    .thx-card { position: relative; display: flex; flex-direction: column; border-radius: 20px; background: var(--bg-glass); border: 1px solid var(--border-glass); overflow: hidden; animation: thxIn .45s cubic-bezier(.2, 1, .3, 1) both; animation-delay: calc(min(var(--i, 0), 12) * 35ms); transition: transform .25s cubic-bezier(.2, 1.2, .3, 1), border-color .2s, box-shadow .25s; } .thx-card:hover { transform: translateY(-4px); border-color: var(--border-glass-hover); box-shadow: 0 18px 40px rgba(0, 0, 0, .35); } .thx-card.on { border-color: var(--accent-color); box-shadow: 0 0 0 1px var(--accent-color), 0 14px 34px color-mix(in srgb, var(--accent-color) 22%, transparent); } .thx-card.locked .thx-mock { filter: grayscale(.7) brightness(.8); }
    @keyframes thxIn { from { opacity: 0; transform: translateY(14px) scale(.97); } to { opacity: 1; transform: none; } }
    .thx-mock { position: relative; display: flex; height: 132px; margin: 10px 10px 0; border-radius: 14px; overflow: hidden; background: var(--bg-dark); border: 1px solid var(--border-glass); transition: transform .35s; } .thx-card:hover .thx-mock { transform: scale(1.02); }
    .thx-mock.big { height: 250px; margin: 0; border-radius: 18px; } .thx-mock .mk-side { width: 12%; background: var(--bg-glass); border-right: 1px solid var(--border-glass); display: flex; flex-direction: column; align-items: center; gap: 7%; padding-top: 9%; } .thx-mock .mk-side i { width: 38%; aspect-ratio: 1; border-radius: 30%; background: var(--text-secondary); opacity: .45; } .thx-mock .mk-side i.on { background: var(--accent-color); opacity: 1; }
    .thx-mock .mk-main { flex: 1; padding: 6% 5%; display: flex; flex-direction: column; gap: 7%; min-width: 0; } .thx-mock .mk-top { display: flex; align-items: center; gap: 6%; } .thx-mock .mk-top b { width: 34%; height: 7px; border-radius: 6px; background: var(--text-primary); opacity: .9; } .thx-mock .mk-top span { margin-left: auto; width: 14%; height: 7px; border-radius: 6px; background: var(--text-secondary); opacity: .55; }
    .thx-mock .mk-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5%; flex: 1; } .thx-mock .mk-c { display: flex; flex-direction: column; border-radius: 9px; background: var(--bg-glass-light); border: 1px solid var(--border-glass); overflow: hidden; } .thx-mock .mk-c div { flex: 1; background: linear-gradient(135deg, var(--accent-color), color-mix(in srgb, var(--accent-color) 30%, var(--bg-dark))); opacity: .85; } .thx-mock .mk-c:nth-child(2) div { background: linear-gradient(135deg, var(--success), color-mix(in srgb, var(--success) 25%, var(--bg-dark))); } .thx-mock .mk-c:nth-child(3) div { background: linear-gradient(135deg, var(--warning), color-mix(in srgb, var(--warning) 25%, var(--bg-dark))); } .thx-mock .mk-c u { height: 6px; margin: 7px 8px; border-radius: 4px; background: var(--text-secondary); opacity: .6; text-decoration: none; }
    .thx-mock .mk-row { display: flex; align-items: center; gap: 6%; } .thx-mock .mk-btn { padding: 4px 11px; border-radius: 8px; background: var(--accent-color); color: #fff; font-size: 9px; font-weight: 800; } .thx-mock .mk-row em { flex: 1; height: 6px; border-radius: 4px; background: var(--border-glass-hover); } .thx-mock .mk-row s { width: 9px; height: 9px; border-radius: 50%; background: var(--danger); } .thx-mock.big .mk-btn { font-size: 12px; padding: 7px 16px; border-radius: 11px; } .thx-mock.big .mk-top b, .thx-mock.big .mk-top span, .thx-mock.big .mk-c u { height: 9px; }
    .thx-info { padding: 12px 14px 4px; display: flex; flex-direction: column; gap: 4px; flex: 1; } .thx-name { font-weight: 800; font-size: 14.5px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; } .thx-by { display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--text-secondary); } .thx-av { width: 20px; height: 20px; border-radius: 50%; display: grid; place-items: center; font-size: 10px; font-weight: 800; color: #fff; background: linear-gradient(135deg, var(--accent-color), #0ea5e9); position: relative; overflow: hidden; flex: none; } .thx-av img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .thx-desc { font-size: 12px; color: var(--text-secondary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2.8em; } .thx-hint { font-size: 11.5px; color: var(--warning); display: flex; align-items: center; gap: 6px; line-height: 1.35; }
    .thx-badge { font-size: 10px; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; padding: 2px 8px; border-radius: 999px; background: color-mix(in srgb, var(--accent-color) 22%, transparent); color: var(--text-primary); border: 1px solid color-mix(in srgb, var(--accent-color) 55%, transparent); } .thx-badge.ok { background: rgba(34, 197, 94, .18); border-color: rgba(34, 197, 94, .55); } .thx-badge.warn { background: rgba(245, 158, 11, .16); border-color: rgba(245, 158, 11, .5); }
    .thx-stats { display: flex; gap: 12px; font-size: 11.5px; color: var(--text-secondary); align-items: center; } .thx-stats span { display: inline-flex; align-items: center; gap: 4px; } .thx-act { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 14px 14px; } .thx-act .thx-btn { flex: 0 0 auto; }
    .thx-like.on { color: #f472b6; border-color: #f472b6; } .thx-like.on svg { fill: #f472b6; }
    .thx-empty { text-align: center; padding: 60px 20px; color: var(--text-secondary); font-size: 14px; line-height: 1.6; } .thx-empty b { display: block; color: var(--text-primary); font-size: 17px; margin-bottom: 6px; }
    .thx-skel { height: 270px; border-radius: 20px; background: linear-gradient(100deg, var(--bg-glass) 30%, color-mix(in srgb, var(--bg-glass-light) 90%, #fff 6%) 50%, var(--bg-glass) 70%); background-size: 220% 100%; border: 1px solid var(--border-glass); animation: thxSkel 1.2s linear infinite; } @keyframes thxSkel { to { background-position: -220% 0; } }
    .thxm-cols { flex: 1; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr); gap: 0; min-height: 0; } .thxm-form { overflow-y: auto; padding: 4px 22px 18px; } .thxm-prev { padding: 4px 22px 18px 6px; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; }
    .thxm-lab { display: block; font-size: 11px; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; color: var(--text-tertiary); margin: 14px 0 6px; } .thxm-form .thx-in { width: 100%; box-sizing: border-box; } .thxm-colors { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; } .thxm-c { display: flex; align-items: center; gap: 9px; padding: 7px 10px; border-radius: 13px; background: var(--bg-glass); border: 1px solid var(--border-glass); } .thxm-c input[type=color] { width: 30px; height: 30px; border: 0; padding: 0; border-radius: 9px; background: none; cursor: pointer; flex: none; } .thxm-c label { flex: 1; font-size: 12.5px; font-weight: 700; } .thxm-c code { font-size: 11px; color: var(--text-secondary); }
    .thxm-pre { display: flex; gap: 7px; flex-wrap: wrap; } .thxm-sw { display: inline-flex; align-items: center; gap: 7px; padding: 6px 12px 6px 7px; border-radius: 999px; border: 1px solid var(--border-glass); background: var(--bg-glass); color: var(--text-primary); font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; } .thxm-sw:hover { border-color: var(--accent-color); } .thxm-sw i { width: 18px; height: 18px; border-radius: 50%; border: 1px solid rgba(255, 255, 255, .25); }
    .thxm-form textarea { height: 96px; font-family: ui-monospace, Consolas, monospace; font-size: 12px; resize: vertical; } .thxm-msg { font-size: 12px; line-height: 1.45; padding: 9px 12px; border-radius: 12px; background: var(--bg-glass); border: 1px solid var(--border-glass); color: var(--text-secondary); } .thxm-msg.err { color: #fca5a5; border-color: #ef4444; background: rgba(239, 68, 68, .1); } .thxm-msg.good { color: #86efac; border-color: #22c55e; background: rgba(34, 197, 94, .1); } .thxm-msg.warn { color: #fcd34d; border-color: #f59e0b; background: rgba(245, 158, 11, .1); }
    .thxm-foot { display: flex; align-items: center; gap: 10px; padding: 14px 22px; border-top: 1px solid var(--border-glass); flex-wrap: wrap; } .thxm-foot .grow { flex: 1; } .thxm-live { display: inline-flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--text-secondary); }
    .thx-dlg { position: fixed; inset: 0; z-index: 9600; display: flex; align-items: center; justify-content: center; background: rgba(0, 0, 0, .5); backdrop-filter: blur(6px); } .thx-dlg > div { width: min(400px, 92vw); padding: 22px; border-radius: 22px; background: var(--bg-dark); border: 1px solid var(--border-glass); box-shadow: 0 30px 80px rgba(0, 0, 0, .6); } .thx-dlg h4 { margin: 0 0 6px; font-size: 16px; } .thx-dlg p { margin: 0 0 12px; font-size: 12.5px; color: var(--text-secondary); line-height: 1.45; }
    @media (max-width: 900px) { .thxm-cols { grid-template-columns: 1fr; overflow-y: auto; } .thxm-form, .thxm-prev { overflow: visible; padding: 4px 18px; } .thx-head { padding: 14px 16px 8px; } .thx-body { padding: 4px 16px 16px; } }
    body.reduce-animations .thx-card, body.reduce-animations .thx-skel { animation: none !important; } body.reduce-animations .thx-card:hover, body.reduce-animations .thx-card:hover .thx-mock { transform: none; }
    `;
    document.head.appendChild(css);

    // ---------- little building blocks ----------
    function mockStyle(t) {
        const v = Object.assign({}, DEF); const src = (t && t.vars && typeof t.vars === 'object') ? t.vars : null;
        if (src) { for (const k in src) if (SAFE_VAR(k, src[k])) v[k] = src[k]; }
        else if (t && Array.isArray(t.colors) && t.colors.length) { if (t.colors[0]) v['--accent-color'] = t.colors[0]; if (t.colors[1]) v['--bg-dark'] = t.colors[1]; if (t.colors[2]) v['--success'] = t.colors[2]; if (t.colors[1]) { v['--bg-glass'] = t.colors[1]; v['--bg-glass-light'] = t.colors[1]; } }
        return Object.keys(v).filter((k) => SAFE_VAR(k, v[k])).map((k) => k + ':' + v[k]).join(';');
    }
    const mock = (t, big) => '<div class="thx-mock' + (big ? ' big' : '') + '" style="' + E(mockStyle(t)) + '"><div class="mk-side"><i class="on"></i><i></i><i></i><i></i></div><div class="mk-main"><div class="mk-top"><b></b><span></span></div><div class="mk-grid"><div class="mk-c"><div></div><u></u></div><div class="mk-c"><div></div><u></u></div><div class="mk-c"><div></div><u></u></div></div><div class="mk-row"><span class="mk-btn">Play</span><em></em><s></s></div></div></div>';
    const avatar = (a, name) => '<span class="thx-av">' + E(initial(name)) + (a ? '<img src="' + E(a) + '" alt="" onerror="this.remove()">' : '') + '</span>';
    function dialog(title, hint, value, withInput) {
        return new Promise((resolve) => {
            const o = document.createElement('div'); o.className = 'thx-dlg';
            o.innerHTML = '<div><h4>' + E(title) + '</h4><p>' + E(hint) + '</p>' + (withInput ? '<input class="thx-in" id="thx-d-in" maxlength="300" style="width:100%;box-sizing:border-box" value="' + E(value || '') + '">' : '') + '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px"><button class="thx-btn" id="thx-d-no">Cancel</button><button class="thx-btn pri" id="thx-d-ok">OK</button></div></div>';
            document.body.appendChild(o); const inp = o.querySelector('#thx-d-in'); if (inp) setTimeout(() => inp.focus(), 40);
            const done = (v) => { o.remove(); resolve(v); };
            o.querySelector('#thx-d-ok').onclick = () => done(inp ? (inp.value.trim() || null) : true); o.querySelector('#thx-d-no').onclick = () => done(null); o.addEventListener('click', (e) => { if (e.target === o) done(null); });
            if (inp) inp.onkeydown = (e) => { if (e.key === 'Enter') done(inp.value.trim() || null); if (e.key === 'Escape') done(null); };
        });
    }
    const confirmBox = (t, m) => (typeof showConfirm === 'function' ? showConfirm(t, m) : dialog(t, m, '', false).then(Boolean));
    const hexToRgba = (hex, a) => { const m = /^#?([0-9a-f]{6})$/i.exec(hex); if (!m) return hex; const n = parseInt(m[1], 16); return 'rgba(' + ((n >> 16) & 255) + ', ' + ((n >> 8) & 255) + ', ' + (n & 255) + ', ' + a + ')'; };
    const toHex = (c, fb) => { c = String(c || '').trim(); if (/^#[0-9a-f]{6}$/i.test(c)) return c.toLowerCase(); if (/^#[0-9a-f]{3}$/i.test(c)) return '#' + c.slice(1).split('').map((x) => x + x).join('').toLowerCase(); const m = /rgba?\(\s*(\d+)[ ,]+(\d+)[ ,]+(\d+)/i.exec(c); if (m) return '#' + [m[1], m[2], m[3]].map((n) => Math.min(255, +n).toString(16).padStart(2, '0')).join(''); return fb; };
    const lum = (hex) => { const m = /^#([0-9a-f]{6})$/i.exec(hex); if (!m) return 0; const n = parseInt(m[1], 16), f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f((n >> 16) & 255) + 0.7152 * f((n >> 8) & 255) + 0.0722 * f(n & 255); };
    const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    const hsl = (h, s, l) => { s /= 100; l /= 100; const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); return '#' + [f(0), f(8), f(4)].map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join(''); };
    const dl = (obj, name) => { const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = String(name || 'theme').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); };

    // ---------- state ----------
    const T = { tab: 'official', official: null, meta: null, sort: 'liked', q: '', server: null, mine: [], items: {}, qTimer: null, accountName: '' };
    const published = () => getUiPrefSafe('themePublished', {});
    const getUiPrefSafe = (k, d) => { try { return getUiPref(k, d); } catch (e) { return d; } };
    const setPub = async (map) => { try { await setUiPref({ themePublished: map }); } catch (e) { } };
    const custom = () => (cfg().customThemes || []), saved = () => (cfg().savedThemes || []);
    const saveLists = async () => { try { await api.saveConfig({ customThemes: cfg().customThemes || [], savedThemes: cfg().savedThemes || [] }); } catch (e) { } };
    const applied = (t) => { const cur = cfg().themeVars || {}, v = t.vars || {}; return !!(v['--accent-color'] && cur['--accent-color'] === v['--accent-color'] && cur['--bg-dark'] === v['--bg-dark'] && (cur['--text-primary'] || '') === (v['--text-primary'] || '')); };
    const reg = (key, t, kind) => { T.items[key] = { t, kind }; return key; };

    // ---------- the window ----------
    let modal = null;
    function ensure() {
        if (modal) return modal;
        modal = document.createElement('div'); modal.id = 'thx-modal'; modal.className = 'modal-backdrop';
        modal.innerHTML = '<div class="thx-wrap"><div class="thx-head"><div><h3>Themes</h3><div class="thx-sub" id="thx-sub"></div></div><div class="thx-tabs" id="thx-tabs"><button data-tab="official">Official</button><button data-tab="community">Community</button><button data-tab="mine">My library</button></div>' +
            '<div class="thx-tools"><span class="thx-acc">Accent <input type="color" id="thx-accent"></span><button class="thx-btn" id="thx-import">Import</button><button class="thx-btn pri" id="thx-create">' + ICO.plus + ' Create theme</button><button class="thx-btn thx-x" id="thx-close" title="Close">' + ICO.x + '</button></div></div><div class="thx-bar" id="thx-bar"></div><div class="thx-body" id="thx-body"></div></div>';
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
        $('thx-close').onclick = () => { snd('close'); close(); };
        $('thx-tabs').onclick = (e) => { const b = e.target.closest('[data-tab]'); if (b) { snd('click'); go(b.dataset.tab); } };
        $('thx-create').onclick = () => { snd('whoosh'); openMaker(); };
        $('thx-import').onclick = () => { const b = $('import-theme-btn'); if (b) b.click(); };
        const acc = $('thx-accent'); acc.addEventListener('input', (e) => document.documentElement.style.setProperty('--accent-color', e.target.value));
        acc.addEventListener('change', async (e) => { try { await setAccent(e.target.value); toast('Accent color saved.'); } catch (er) { } });
        $('thx-body').addEventListener('click', onBody);
        return modal;
    }
    function close() { if (modal) modal.classList.remove('active'); }
    async function open(tab) {
        ensure(); T.tab = ['official', 'community', 'mine'].includes(tab) ? tab : T.tab; snd('whoosh');
        try { $('thx-accent').value = toHex(cfg().accentColor || getComputedStyle(document.documentElement).getPropertyValue('--accent-color'), '#8b5cf6'); } catch (e) { }
        void modal.offsetWidth; modal.classList.add('active'); go(T.tab);
    }
    function go(tab) {
        T.tab = tab; T.items = {}; Array.from($('thx-tabs').children).forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
        $('thx-sub').textContent = tab === 'official' ? 'Themes that ship with SteamLite, plus rewards you unlock' : tab === 'community' ? 'Themes made by SteamLite players. Download them with one click.' : 'Themes you made or downloaded';
        if (tab === 'official') showOfficial(); else if (tab === 'community') showCommunity(); else showMine();
    }
    const skel = (n) => '<div class="thx-grid">' + Array.from({ length: n || 6 }, (_, i) => '<div class="thx-skel" style="animation-delay:' + i * 60 + 'ms"></div>').join('') + '</div>';
    const emptyBox = (b, m, retry) => '<div class="thx-empty"><b>' + E(b) + '</b>' + E(m) + (retry ? '<div style="margin-top:14px"><button class="thx-btn" data-act="retry">Try again</button></div>' : '') + '</div>';

    // ----- official -----
    async function loadMeta() { try { T.meta = await api.getMetaAchievements({ librarySize: (typeof installedGames !== 'undefined' ? installedGames.length : 0) + (typeof uninstalledGames !== 'undefined' ? uninstalledGames.length : 0) }); } catch (e) { T.meta = null; } }
    async function showOfficial() {
        $('thx-bar').innerHTML = ''; const body = $('thx-body'); body.innerHTML = skel(6);
        const [res] = await Promise.all([api.getThemeShop().catch(() => null), loadMeta()]);
        if (T.tab !== 'official') return;
        if (!res || !res.ok) { body.innerHTML = emptyBox('Could not load the themes', 'Check your connection and try again.', true); return; }
        T.official = res.themes || [];
        const meta = T.meta, un = {}, prog = {}, nm = {}, evOf = {}; ((meta && meta.achievements) || []).forEach((a) => { un[a.id] = !!a.unlockedAt; prog[a.id] = a.progress; nm[a.id] = a.name; evOf[a.id] = a.event || null; });
        const granted = new Set((meta && meta.unlockedThemes) || []), events = (meta && meta.events) || [];
        const ended = (req) => { if (String(req).startsWith('event:')) { const e = events.find((x) => x.id === String(req).slice(6)); return !!e && !e.open; } const id = evOf[req]; if (!id) return false; const e = events.find((x) => x.id === id); return !!e && !e.open; };
        const info = (t) => { const locked = !!(t.requires && !un[t.requires] && !granted.has(t.id)), end = locked && ended(t.requires); let hint = ''; if (locked) { const r = String(t.requires); hint = end ? 'Limited-time event theme. The event has ended and returns next year.' : r.startsWith('event:') ? 'Complete 5 quests in ' + (((events.find((x) => x.id === r.slice(6))) || {}).name || 'the event') : r.startsWith('season:') ? 'Reach tier 20 in the ' + r.slice(7) + ' season' : (nm[r] || r) + (prog[r] ? ' (' + prog[r].current + ' / ' + prog[r].max + ')' : ''); } return { locked, end, hint }; };
        const hide = (t) => { const id = t.requires ? evOf[t.requires] : null; if (!id) return false; const e = events.find((x) => x.id === id); return !!e && !e.open && !granted.has(t.id) && !un[t.requires]; };
        const off = T.official.filter((t) => (!t.source || t.source === 'official') && !hide(t));
        const html = off.map((t, i) => { const f = info(t), key = reg('o:' + t.id, t, 'official'); return cardHtml(key, i, t, { badge: f.locked ? '<span class="thx-badge warn">Locked</span>' : '', hint: f.hint, locked: f.locked, actions: (f.locked ? '' : '<button class="thx-btn pri sm" data-act="apply">Apply</button>') + '<button class="thx-btn sm" data-act="preview">Preview</button>' }); }).join('');
        body.innerHTML = '<div class="thx-sec" style="margin-top:6px">Official themes (' + off.length + ')</div><div class="thx-grid">' + html + '</div>';
        T.lock = info;
    }
    function cardHtml(key, i, t, o) {
        const by = t.author ? '<div class="thx-by">' + avatar(t.authorAvatar, t.author) + '<span>' + E(t.author) + '</span></div>' : '';
        return '<div class="thx-card' + (o.locked ? ' locked' : '') + (o.on ? ' on' : '') + '" data-k="' + E(key) + '" style="--i:' + i + '">' + mock(t) + '<div class="thx-info"><div class="thx-name">' + E(t.name || t.id) + (o.on ? '<span class="thx-badge ok">Applied</span>' : '') + (o.badge || '') + '</div>' + by + '<div class="thx-desc">' + E(t.description || t.desc || '') + '</div>' + (o.hint ? '<div class="thx-hint">' + ICO.lock + '<span>' + E(o.hint) + '</span></div>' : '') + (o.stats || '') + '</div><div class="thx-act">' + (o.actions || '') + '</div></div>';
    }

    // ----- community -----
    const statsHtml = (t, liked) => '<div class="thx-stats"><span title="Likes">' + ICO.heart + '<b data-likes>' + fmt(t.likes) + '</b></span><span title="Downloads">' + ICO.down + fmt(t.downloads) + '</span></div>';
    async function showCommunity() {
        const bar = $('thx-bar'), body = $('thx-body');
        bar.innerHTML = '<input type="search" id="thx-q" placeholder="Search themes or authors" maxlength="30" value="' + E(T.q) + '">' + [['liked', 'Most liked'], ['new', 'Newest'], ['downloads', 'Most downloaded']].map((x) => '<button class="thx-chip' + (T.sort === x[0] ? ' on' : '') + '" data-sort="' + x[0] + '">' + x[1] + '</button>').join('') + '<span class="thx-sub" style="margin-left:auto" id="thx-count"></span>';
        $('thx-q').oninput = (e) => { T.q = e.target.value; clearTimeout(T.qTimer); T.qTimer = setTimeout(loadCommunity, 380); };
        bar.onclick = (e) => { const c = e.target.closest('[data-sort]'); if (c) { T.sort = c.dataset.sort; Array.from(bar.querySelectorAll('[data-sort]')).forEach((b) => b.classList.toggle('on', b === c)); loadCommunity(); } };
        body.innerHTML = skel(6); loadCommunity();
    }
    async function loadCommunity() {
        const body = $('thx-body'); if (T.tab !== 'community') return; const mySeq = T.seq = (T.seq || 0) + 1;
        if (!T.official) { const res = await api.getThemeShop().catch(() => null); T.official = res && res.ok ? (res.themes || []) : []; }
        const r = await feat('srvThemes', { sort: T.sort, q: T.q }); if (mySeq !== T.seq || T.tab !== 'community') return;
        if (!r || !r.ok) { body.innerHTML = emptyBox('SteamLite Online is not reachable', 'The community gallery needs a connection. Everything else still works.', true); $('thx-count').textContent = ''; return; }
        T.server = r.themes || []; T.mine = r.mine || []; T.items = {};
        const exist = new Set(saved().map((x) => x.remoteId).filter(Boolean)); const pubIds = new Set(Object.values(published()).map((x) => x && x.id));
        $('thx-count').textContent = fmt(T.server.length) + (T.server.length === 1 ? ' theme' : ' themes');
        let html = '';
        if (!T.q) { const gh = (T.official || []).filter((t) => t.source === 'community'); if (gh.length) html += '<div class="thx-sec" style="margin-top:6px">Picked by the SteamLite team</div><div class="thx-grid">' + gh.map((t, i) => cardHtml(reg('g:' + t.id, t, 'official'), i, t, { actions: '<button class="thx-btn pri sm" data-act="apply">Apply</button><button class="thx-btn sm" data-act="preview">Preview</button>' })).join('') + '</div>'; }
        html += T.server.length ? (T.q ? '' : '<div class="thx-sec">From players</div>') + '<div class="thx-grid">' + T.server.map((t, i) => { const mine = pubIds.has(t.id); return cardHtml(reg('s:' + t.id, t, 'server'), i, t, { on: applied(t), badge: (mine ? '<span class="thx-badge">Yours</span>' : '') + (exist.has(t.id) ? '<span class="thx-badge ok">Saved</span>' : ''), stats: statsHtml(t), actions: '<button class="thx-btn pri sm" data-act="apply">Apply</button><button class="thx-btn sm" data-act="preview">Preview</button><button class="thx-btn sm thx-like' + (t.liked ? ' on' : '') + '" data-act="like" title="Like">' + ICO.heart + '</button>' + (exist.has(t.id) ? '' : '<button class="thx-btn sm" data-act="save" title="Save to My library">' + ICO.down + '</button>') + (mine ? '' : '<button class="thx-btn sm" data-act="report" title="Report this theme">' + ICO.flag + '</button>') }); }).join('') + '</div>'
            : (html ? '' : emptyBox(T.q ? 'No themes found' : 'No community themes yet', T.q ? 'Try another word.' : 'Be the first: press Create theme, design one and publish it.'));
        body.innerHTML = html;
    }

    // ----- my library -----
    async function showMine() {
        $('thx-bar').innerHTML = ''; const body = $('thx-body'); T.items = {};
        const mine = custom(), got = saved();
        let st = {}; const r = await feat('srvThemes', { sort: 'new' }); if (r && r.ok) (r.mine || []).forEach((x) => { st[x.id] = x; });
        if (T.tab !== 'mine') return; const pub = published();
        const card = (t, i, kind) => { const p = pub[t.id], s = p && st[p.id], live = !!(p && (!r || !r.ok || s)); const key = reg('l:' + t.id, t, kind);
            const badges = (kind === 'mine' ? '<span class="thx-badge">Made by you</span>' : '<span class="thx-badge ok">Downloaded</span>') + (live ? '<span class="thx-badge ok">Published</span>' : '');
            const actions = '<button class="thx-btn pri sm" data-act="apply">Apply</button><button class="thx-btn sm" data-act="preview">Preview</button>' + (kind === 'mine' ? '<button class="thx-btn sm" data-act="edit">Edit</button>' + (live ? '<button class="thx-btn sm" data-act="unpublish">Unpublish</button>' : '<button class="thx-btn sm" data-act="publish">Publish</button>') : '') + '<button class="thx-btn sm" data-act="export">Export</button><button class="thx-btn sm bad" data-act="delete">Delete</button>';
            return cardHtml(key, i, t, { on: applied(t), badge: badges, stats: s ? statsHtml(s) : '', actions }); };
        body.innerHTML = (mine.length ? '<div class="thx-sec" style="margin-top:6px">Made by you (' + mine.length + ')</div><div class="thx-grid">' + mine.map((t, i) => card(t, i, 'mine')).join('') + '</div>' : '') +
            (got.length ? '<div class="thx-sec">Downloaded (' + got.length + ')</div><div class="thx-grid">' + got.map((t, i) => card(t, i, 'saved')).join('') + '</div>' : '') +
            (!mine.length && !got.length ? emptyBox('Your library is empty', 'Themes you create or download from the Community tab show up here. Press Create theme to make your first one.') : '');
    }

    // ----- clicks on cards -----
    async function onBody(e) {
        const act = e.target.closest('[data-act]'); if (!act) return; const a = act.dataset.act;
        if (a === 'retry') { go(T.tab); return; }
        const cardEl = act.closest('[data-k]'); const it = cardEl && T.items[cardEl.dataset.k]; if (!it) return; const t = it.t, kind = it.kind;
        if (act.disabled) return; snd('click');
        try {
            if (a === 'apply') await applyIt(it, act);
            else if (a === 'preview') await previewIt(it);
            else if (a === 'like') { const r = await feat('srvThemeLike', { id: t.id }); if (r && r.ok) { act.classList.toggle('on', !!r.liked); const b = cardEl.querySelector('[data-likes]'); if (b) b.textContent = fmt(r.likes); t.likes = r.likes; t.liked = r.liked; } else toast(r && r.error === 'offline' ? 'Could not reach SteamLite Online.' : ((r && r.error) || 'Could not like it.')); }
            else if (a === 'save') { act.disabled = true; const th = await fetchServer(t, true); if (th) { await keep(t, th); toast('Saved to My library.'); go('community'); } else act.disabled = false; }
            else if (a === 'report') { const why = await dialog('Report this theme', 'What is wrong with it? A moderator will take a look.', '', true); if (!why) return; const r = await feat('srvThemeReport', { id: t.id, reason: why }); toast(r && r.ok ? 'Thanks, your report was sent.' : ((r && r.error) || 'Could not send the report.')); }
            else if (a === 'edit') { openMaker(t); }
            else if (a === 'publish') { act.disabled = true; const ok = await publishEntry(t); act.disabled = false; if (ok) go('mine'); }
            else if (a === 'unpublish') { if (!await confirmBox('Unpublish this theme?', 'It disappears from the Community tab and nobody can download it any more. Players who already have it keep it.')) return; const p = published()[t.id]; const r = p ? await feat('srvThemeDelete', { id: p.id }) : { ok: true }; if (r && (r.ok || r.code === 404)) { const m = Object.assign({}, published()); delete m[t.id]; await setPub(m); toast('Unpublished.'); go('mine'); } else toast((r && r.error) || 'Could not unpublish.'); }
            else if (a === 'export') { dl({ canvas: [], vars: t.vars || {}, css: t.css || '' }, t.name); toast('Exported as a .json file.'); }
            else if (a === 'delete') {
                if (!await confirmBox('Delete this theme?', kind === 'mine' && published()[t.id] ? 'It is removed from your library. It stays in the Community tab until you unpublish it.' : 'It is removed from your library.')) return;
                if (kind === 'mine') cfg().customThemes = custom().filter((x) => x.id !== t.id); else cfg().savedThemes = saved().filter((x) => x.id !== t.id);
                await saveLists(); toast('Deleted.'); go('mine');
            }
        } catch (er) { toast('Something went wrong. Try again.'); }
    }
    async function fetchServer(t, countDownload) {
        const r = await feat('srvTheme', { id: t.id, dl: !!countDownload });
        if (!r || !r.ok) { toast(r && r.error === 'offline' ? 'Could not reach SteamLite Online.' : ((r && r.error) || 'Could not get that theme.')); return null; }
        const vars = {}; Object.keys(r.vars || {}).forEach((k) => { if (SAFE_VAR(k, r.vars[k])) vars[k] = r.vars[k]; });
        return { vars, css: safeCss(r.css) };
    }
    async function keep(t, th) {
        const id = 'srv-' + t.id; const entry = { id, remoteId: t.id, name: t.name, author: t.author, description: t.desc || t.description || '', colors: t.colors || [], vars: th.vars, css: th.css, saved: true };
        cfg().savedThemes = saved().filter((x) => x.remoteId !== t.id).concat([entry]); await saveLists(); return entry;
    }
    async function applyIt(it, btn) {
        const t = it.t, old = btn.textContent; btn.disabled = true; btn.textContent = '...';
        try {
            if (it.kind === 'official') { const th = await api.downloadTheme(t.file); if (th && th.locked) { toast('This theme is still locked.'); return; } if (!th || typeof th !== 'object') { toast('Could not download that theme.'); return; } applyThemeObject(th); close(); return; }
            if (it.kind === 'server') {
                const have = saved().find((x) => x.remoteId === t.id); let th = have ? { vars: have.vars, css: have.css } : null;
                if (!th) { th = await fetchServer(t, true); if (!th) return; await keep(t, th); }
                applyThemeObject(th); close(); toast('Applied. It is saved in My library.'); return;
            }
            applyThemeObject({ vars: t.vars || {}, css: t.css || '' }); close();
        } finally { btn.disabled = false; btn.textContent = old; }
    }
    function previewObj(theme, name, onApply) {
        if (typeof themePreview !== 'undefined' && themePreview) endThemePreview(true);
        const root = document.documentElement.style, vars = theme.vars || {}, keys = new Set([...(typeof SUE_COLOR_VARS !== 'undefined' ? SUE_COLOR_VARS : []), ...Object.keys(vars)]), prev = {}; keys.forEach((k) => { prev[k] = root.getPropertyValue(k); });
        const styleEl = $('custom-theme-style'); themePreview = { prev, css: styleEl.textContent, themeId: '', name };
        (typeof SUE_COLOR_VARS !== 'undefined' ? SUE_COLOR_VARS : []).forEach((v) => root.removeProperty(v)); styleEl.textContent = safeCss(theme.css); for (const k in vars) root.setProperty(k, vars[k]);
        $('tp-title').textContent = 'Previewing ' + name; $('tp-sub').textContent = 'Only a preview. Nothing is changed until you apply it.';
        const act = $('tp-action'); act.textContent = 'Apply theme'; act.onclick = () => { snd('click'); onApply(); };
        $('theme-preview-bar').classList.add('active'); snd('open');
    }
    async function previewIt(it) {
        const t = it.t; close();
        if (it.kind === 'official') { await startThemePreview(t.file, t.id, t.name); return; }
        let th = null; if (it.kind === 'server') { const have = saved().find((x) => x.remoteId === t.id); th = have ? { vars: have.vars, css: have.css } : await fetchServer(t, false); } else th = { vars: t.vars || {}, css: t.css || '' };
        if (!th) { open(T.tab); return; }
        previewObj(th, t.name, async () => { if (it.kind === 'server') { let x = saved().find((s) => s.remoteId === t.id); if (!x) { const full = await fetchServer(t, true); if (full) await keep(t, full); } } applyThemeObject(th); });
    }

    // ---------- publishing ----------
    async function acctName() { try { const s = await feat('acctStatus'); return s && s.signedIn ? s.name : ''; } catch (e) { return ''; } }
    function checkTheme(name, vars, cssText) {
        const errs = []; if (String(name).trim().length < 3) errs.push('Give the theme a name (3+ letters).'); if (String(name).trim().length > 32) errs.push('The name can be 32 letters at most.');
        if (cssText && cssText.length > 8000) errs.push('The extra CSS is too long (8000 characters).'); if (cssText && BAD_CSS.test(cssText)) errs.push('Published themes can not use images, imports, scripts or url(...) in the extra CSS. Remove them to publish, or just save the theme for yourself.');
        Object.keys(vars).forEach((k) => { if (!SAFE_VAR(k, vars[k])) errs.push('A colour value is not allowed: ' + k); }); return errs;
    }
    async function publishEntry(t) {
        const errs = checkTheme(t.name, t.vars || {}, t.css || ''); if (errs.length) { toast(errs[0]); return false; }
        const author = (await acctName()) || t.author || 'Anonymous'; if (!(await acctName())) { toast('Sign in with Steam first (More settings > SteamLite account).'); return false; }
        const map = Object.assign({}, published()), old = map[t.id];
        if (old) { await feat('srvThemeDelete', { id: old.id }); }
        const r = await feat('srvThemeShare', { name: t.name, desc: t.description || '', author, vars: t.vars, css: t.css || '' });
        if (!r || !r.ok) { toast(r && r.error === 'offline' ? 'Could not reach SteamLite Online. Try again in a moment.' : ((r && r.error) || 'Could not publish it.')); return false; }
        map[t.id] = { id: r.id, at: Date.now() }; await setPub(map); snd('chime');
        toast(r.status === 'approved' ? 'Published! Everyone can find "' + t.name + '" in Themes > Community.' : 'Sent for review. It shows up once a moderator approves it.'); return true;
    }

    // ---------- the Theme Maker ----------
    const PRESETS = [
        { n: 'Midnight', bg: '#0b0b10', gl: '#0f0f14', gll: '#1c1c24', tx: '#eef0f6', t2: '#9598a8', ac: '#8b5cf6', ok: '#6ee7a0', wn: '#f5d76e', bd: '#ff6b6b' },
        { n: 'Ocean', bg: '#06131f', gl: '#0a1b2b', gll: '#12283c', tx: '#e6f4ff', t2: '#8fb0c9', ac: '#38bdf8', ok: '#5eead4', wn: '#fde68a', bd: '#fb7185' },
        { n: 'Sunset', bg: '#1a0b12', gl: '#241018', gll: '#321821', tx: '#fff1f2', t2: '#d1a3ad', ac: '#fb7185', ok: '#86efac', wn: '#fdba74', bd: '#f43f5e' },
        { n: 'Forest', bg: '#07140d', gl: '#0c1d13', gll: '#14291c', tx: '#ecfdf5', t2: '#8fbfa4', ac: '#34d399', ok: '#a3e635', wn: '#fcd34d', bd: '#f87171' },
        { n: 'Mono', bg: '#0a0a0a', gl: '#121212', gll: '#1c1c1c', tx: '#f5f5f5', t2: '#a3a3a3', ac: '#e5e5e5', ok: '#a3e635', wn: '#fde047', bd: '#f87171' },
        { n: 'Candy', bg: '#150a1f', gl: '#1d1029', gll: '#2a1a3a', tx: '#fdf4ff', t2: '#c9a7d6', ac: '#f472b6', ok: '#6ee7b7', wn: '#fde68a', bd: '#fb7185' },
        { n: 'Paper', bg: '#f4f1ea', gl: '#ffffff', gll: '#ece7dc', tx: '#1c1917', t2: '#6b645a', ac: '#d97706', ok: '#15803d', wn: '#b45309', bd: '#b91c1c' }
    ];
    const FIELDS = [['bg', 'Background', '--bg-dark'], ['gl', 'Panels', '--bg-glass'], ['gll', 'Raised panels', '--bg-glass-light'], ['tx', 'Text', '--text-primary'], ['t2', 'Soft text', '--text-secondary'], ['ac', 'Accent', '--accent-color'], ['ok', 'Success', '--success'], ['wn', 'Warning', '--warning'], ['bd', 'Danger', '--danger']];
    let mk = null, mModal = null;
    function collect() {
        const c = mk.c; return { '--bg-dark': c.bg, '--bg-glass': hexToRgba(c.gl, 0.88), '--bg-glass-light': hexToRgba(c.gll, 0.92), '--border-glass': hexToRgba(c.ac, 0.18), '--border-glass-hover': hexToRgba(c.ac, 0.4), '--text-primary': c.tx, '--text-secondary': c.t2, '--accent-color': c.ac, '--success': c.ok, '--warning': c.wn, '--danger': c.bd };
    }
    function startColors(t) {
        const cur = (k, fb) => { try { return toHex(getComputedStyle(document.documentElement).getPropertyValue(k), fb); } catch (e) { return fb; } };
        const v = t && t.vars ? t.vars : null, g = (k, fb) => toHex(v ? v[k] : cur(k, fb), fb);
        return { bg: g('--bg-dark', '#0b0b10'), gl: g('--bg-glass', '#0f0f14'), gll: g('--bg-glass-light', '#1c1c24'), tx: g('--text-primary', '#eef0f6'), t2: g('--text-secondary', '#9598a8'), ac: g('--accent-color', '#8b5cf6'), ok: g('--success', '#6ee7a0'), wn: g('--warning', '#f5d76e'), bd: g('--danger', '#ff6b6b') };
    }
    function openMaker(entry) {
        const editing = entry && entry.vars ? entry : null; const root = document.documentElement.style;
        const snap = {}; (typeof SUE_COLOR_VARS !== 'undefined' ? SUE_COLOR_VARS : []).forEach((k) => { snap[k] = root.getPropertyValue(k); }); snap['--border-glass-hover'] = root.getPropertyValue('--border-glass-hover');
        mk = { editing, c: startColors(editing), live: false, snap, snapCss: ($('custom-theme-style') || {}).textContent || '', busy: false };
        close();
        if (!mModal) { mModal = document.createElement('div'); mModal.id = 'thxm-modal'; mModal.className = 'modal-backdrop'; document.body.appendChild(mModal); mModal.addEventListener('click', (e) => { if (e.target === mModal) closeMaker(); }); }
        mModal.innerHTML = '<div class="thx-wrap"><div class="thx-head"><div><h3>' + (editing ? 'Edit theme' : 'Create a theme') + '</h3><div class="thx-sub">Design it, see it update live, then keep it for yourself or publish it for everyone.</div></div><div class="thx-tools"><button class="thx-btn thx-x" id="thxm-x" title="Close">' + ICO.x + '</button></div></div>' +
            '<div class="thxm-cols"><div class="thxm-form"><label class="thxm-lab" style="margin-top:4px">Name</label><input class="thx-in" id="thxm-name" maxlength="32" placeholder="e.g. Neon Dusk" value="' + E(editing ? editing.name : '') + '">' +
            '<label class="thxm-lab">Description</label><input class="thx-in" id="thxm-desc" maxlength="120" placeholder="What is the vibe?" value="' + E(editing ? (editing.description || '') : '') + '">' +
            '<label class="thxm-lab">Start from</label><div class="thxm-pre" id="thxm-pre">' + PRESETS.map((p, i) => '<button class="thxm-sw" data-p="' + i + '"><i style="background:linear-gradient(135deg,' + p.bg + ' 50%,' + p.ac + ' 50%)"></i>' + p.n + '</button>').join('') + '<button class="thxm-sw" data-p="cur">' + ICO.globe + ' Current look</button><button class="thxm-sw" data-p="rand">' + ICO.shuffle + ' Surprise me</button></div>' +
            '<label class="thxm-lab">Colours</label><div class="thxm-colors" id="thxm-colors">' + FIELDS.map((f) => '<div class="thxm-c"><input type="color" data-f="' + f[0] + '" value="' + mk.c[f[0]] + '"><label>' + f[1] + '</label><code id="thxm-h-' + f[0] + '">' + mk.c[f[0]] + '</code></div>').join('') + '</div>' +
            '<label class="thxm-lab">Extra CSS (optional)</label><textarea class="thx-in" id="thxm-css" placeholder=".game-card { box-shadow: 0 6px 18px rgba(255,61,154,.25); }">' + E(editing ? (editing.css || '') : '') + '</textarea>' +
            '<div class="thxm-msg" style="margin-top:8px">To publish, the extra CSS can not use images, imports, scripts or url(...). Colours are always fine.</div></div>' +
            '<div class="thxm-prev"><div id="thxm-mock"></div><div id="thxm-status"></div><div class="thxm-live"><label class="switch-toggle" style="flex:none"><input type="checkbox" id="thxm-live"><span class="switch-slider"></span></label> Try it on the whole app while I edit</div></div></div>' +
            '<div class="thxm-foot"><button class="thx-btn" id="thxm-export">Export .json</button><span class="grow"></span><button class="thx-btn" id="thxm-cancel">Cancel</button><button class="thx-btn" id="thxm-save">Save to my library</button><button class="thx-btn pri" id="thxm-pub">' + ICO.globe + ' Save and publish</button></div></div>';
        void mModal.offsetWidth; mModal.classList.add('active'); snd('whoosh'); mkRefresh();
        mModal.querySelector('#thxm-x').onclick = closeMaker; mModal.querySelector('#thxm-cancel').onclick = closeMaker;
        mModal.querySelector('#thxm-colors').oninput = (e) => { const f = e.target.dataset && e.target.dataset.f; if (!f) return; mk.c[f] = e.target.value; const h = $('thxm-h-' + f); if (h) h.textContent = e.target.value; mkRefresh(); };
        mModal.querySelector('#thxm-pre').onclick = (e) => { const b = e.target.closest('[data-p]'); if (!b) return; snd('click'); const p = b.dataset.p; if (p === 'cur') mk.c = startColors(null); else if (p === 'rand') { const h = Math.floor(Math.random() * 360); mk.c = { bg: hsl(h, 45, 6), gl: hsl(h, 38, 9), gll: hsl(h, 32, 13), tx: '#f1f3f9', t2: hsl(h, 16, 68), ac: hsl((h + 20) % 360, 85, 62), ok: '#6ee7a0', wn: '#f5d76e', bd: '#ff6b6b' }; } else { const q = PRESETS[+p]; mk.c = { bg: q.bg, gl: q.gl, gll: q.gll, tx: q.tx, t2: q.t2, ac: q.ac, ok: q.ok, wn: q.wn, bd: q.bd }; } FIELDS.forEach((f) => { const inp = mModal.querySelector('[data-f="' + f[0] + '"]'); if (inp) inp.value = mk.c[f[0]]; const h = $('thxm-h-' + f[0]); if (h) h.textContent = mk.c[f[0]]; }); mkRefresh(); };
        ['thxm-name', 'thxm-css', 'thxm-desc'].forEach((id) => { $(id).oninput = mkRefresh; });
        $('thxm-live').onchange = (e) => { mk.live = e.target.checked; mkApplyLive(); };
        $('thxm-export').onclick = () => { snd('click'); dl({ canvas: [], vars: collect(), css: $('thxm-css').value || '' }, $('thxm-name').value || 'my-theme'); toast('Exported as a .json file.'); };
        $('thxm-save').onclick = () => finish(false); $('thxm-pub').onclick = () => finish(true);
    }
    function mkApplyLive() {
        const root = document.documentElement.style, st = $('custom-theme-style');
        if (mk.live) { const v = collect(); (typeof SUE_COLOR_VARS !== 'undefined' ? SUE_COLOR_VARS : []).forEach((k) => root.removeProperty(k)); for (const k in v) root.setProperty(k, v[k]); if (st) st.textContent = $('thxm-css').value || ''; }
        else restoreApp();
    }
    function restoreApp() { const root = document.documentElement.style; for (const k in mk.snap) { if (mk.snap[k]) root.setProperty(k, mk.snap[k]); else root.removeProperty(k); } const st = $('custom-theme-style'); if (st) st.textContent = mk.snapCss; }
    function mkRefresh() {
        if (!mk || !$('thxm-mock')) return; const vars = collect(), name = $('thxm-name').value, cssText = $('thxm-css').value;
        $('thxm-mock').innerHTML = mock({ vars }, true); mkApplyLive_light();
        const errs = checkTheme(name, vars, cssText), cr = contrast(mk.c.tx, mk.c.bg), cr2 = contrast(mk.c.tx, mk.c.gl); let h = '';
        if (cr < 4.5 || cr2 < 4.5) h += '<div class="thxm-msg warn">The text is hard to read on this background (contrast ' + Math.min(cr, cr2).toFixed(1) + ':1). Aim for 4.5 or more.</div>'; else h += '<div class="thxm-msg good">Text is easy to read (contrast ' + Math.min(cr, cr2).toFixed(1) + ':1).</div>';
        if (errs.length) h += '<div class="thxm-msg err" style="margin-top:8px">' + E(errs[0]) + '</div>';
        $('thxm-status').innerHTML = h; const pub = $('thxm-pub'); if (pub) pub.disabled = errs.length > 0 || mk.busy; const sv = $('thxm-save'); if (sv) sv.disabled = String(name).trim().length < 2 || mk.busy;
    }
    function mkApplyLive_light() { if (mk && mk.live) mkApplyLive(); }
    function closeMaker() { if (!mk) return; if (mk.live) restoreApp(); mk = null; if (mModal) mModal.classList.remove('active'); snd('close'); }
    async function finish(publish) {
        if (!mk || mk.busy) return; const name = $('thxm-name').value.trim(), desc = $('thxm-desc').value.trim(), cssText = $('thxm-css').value || '', vars = collect();
        if (name.length < 2) { toast('Give your theme a name first.'); return; } if (publish) { const errs = checkTheme(name, vars, cssText); if (errs.length) { toast(errs[0]); return; } }
        mk.busy = true; mkRefresh(); const btn = publish ? $('thxm-pub') : $('thxm-save'); const old = btn.innerHTML; btn.innerHTML = 'Working...';
        try {
            const author = (await acctName()) || '', prev = mk.editing;
            const entry = { id: prev ? prev.id : 'custom-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36), name, author: author || (prev && prev.author) || 'Anonymous', description: desc, colors: [vars['--accent-color'], vars['--bg-dark'], vars['--success']], vars, css: cssText, local: true, mine: true };
            cfg().customThemes = custom().filter((x) => x.id !== entry.id && x.name !== name).concat([entry]); await saveLists(); snd('chime');
            let ok = true; if (publish) ok = await publishEntry(entry);
            if (!publish || ok) { if (mk.live) restoreApp(); mk.live = false; closeMaker(); open('mine'); if (!publish) toast('Saved "' + name + '" to My library.'); }
        } finally { if (mk) { mk.busy = false; btn.innerHTML = old; mkRefresh(); } }
    }

    // ---------- take over the old Theme Shop ----------
    window.SLThemes = { open, openMaker };
    window.openThemeShop = function (tab) { return open(typeof tab === 'string' ? tab : undefined); };
})();
