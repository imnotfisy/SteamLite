// SteamLite 9.2.4 - Messages: friends who also use SteamLite, private chats, group chats and friend streaks.
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
        check: SV('<path d="M20 6 9 17l-5-5"/>', 14),
        smile: SV('<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01M15 9h.01"/>', 17), reply: SV('<path d="M9 17l-5-5 5-5"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>', 15),
        more: SV('<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>', 17), pin: SV('<path d="M12 17v5"/><path d="M9 3h6l-1 7 3 3H7l3-3z"/>', 14),
        search: SV('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>', 16), bell: SV('<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>', 16),
        copy: SV('<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>', 14), edit: SV('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>', 14),
        flag: SV('<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>', 14), plus: SV('<path d="M12 5v14M5 12h14"/>', 18),
        game: SV('<line x1="6" y1="11" x2="10" y2="11"/><line x1="8" y1="9" x2="8" y2="13"/><line x1="15" y1="12" x2="15.01" y2="12"/><line x1="18" y1="10" x2="18.01" y2="10"/><path d="M17.3 5H6.7a4 4 0 0 0-3.9 3.2l-1.6 8a3 3 0 0 0 5.2 2.3L8.5 17h7l1.1 1.5a3 3 0 0 0 5.2-2.3l-1.6-8A4 4 0 0 0 17.3 5z"/>', 15),
        list: SV('<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>', 15), user: SV('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>', 15),
        trophy: SV('<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z"/>', 15)
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

    .cx-wrap { position: relative; flex: 1; min-height: 0; display: flex; } .cx-wrap .cx-msgs { flex: 1; }
    .cx-msgs { scroll-behavior: auto; } .cx-msg { transition: opacity .2s; } .cx-msg.sp { margin-top: -2px; } .cx-msg.gi { margin-left: 38px; }
    .cx-bub { border-radius: 18px; } .cx-msg:not(.mine).sp .cx-bub { border-top-left-radius: 6px; } .cx-msg:not(.mine).sn .cx-bub { border-bottom-left-radius: 6px; } .cx-msg.mine.sp .cx-bub { border-top-right-radius: 6px; } .cx-msg.mine.sn .cx-bub { border-bottom-right-radius: 6px; }
    .cx-msg.pending .cx-bub { opacity: .62; } .cx-msg.failed .cx-bub { background: rgba(239, 68, 68, .2); border-color: #ef4444; color: var(--text-primary); }
    .cx-fail { font-size: 11px; color: #f87171; margin: 3px 6px 0; text-align: right; } .cx-fail button { background: none; border: 0; color: #fca5a5; text-decoration: underline; cursor: pointer; font: inherit; padding: 0 2px; }
    .cx-seen { color: var(--accent-color); font-weight: 700; } .cx-seen.fresh { animation: cxFade .4s ease both; } @keyframes cxFade { from { opacity: 0; } to { opacity: 1; } }
    .cx-av.cx-sm { position: absolute; left: -38px; bottom: 0; width: 28px; height: 28px; flex: none; font-size: 12px; }
    .cx-msg.in-l { animation: cxInL .42s cubic-bezier(.2, 1.25, .3, 1) both; transform-origin: left bottom; } .cx-msg.in-r { animation: cxInR .4s cubic-bezier(.2, 1.25, .3, 1) both; transform-origin: right bottom; }
    @keyframes cxInL { from { opacity: 0; transform: translateX(-16px) scale(.9); } to { opacity: 1; transform: none; } } @keyframes cxInR { from { opacity: 0; transform: translateX(20px) translateY(8px) scale(.88); } to { opacity: 1; transform: none; } }
    .cx-typing { display: flex; align-items: flex-end; gap: 8px; align-self: flex-start; max-height: 0; opacity: 0; overflow: hidden; transform: translateY(6px) scale(.9); transform-origin: left bottom; transition: max-height .28s ease, opacity .22s ease, transform .28s cubic-bezier(.2, 1.2, .3, 1), margin .28s; margin-top: 0; } .cx-typing.on { max-height: 64px; opacity: 1; transform: none; margin-top: 6px; }
    .cx-typ-bub { display: inline-flex; padding: 12px 14px; border-radius: 18px 18px 18px 6px; background: var(--bg-glass); border: 1px solid var(--border-glass); } .cx-typ-who { font-size: 11px; color: var(--text-secondary); padding-bottom: 4px; }
    .cx-dots { display: inline-flex; align-items: center; gap: 4px; } .cx-dots i { width: 7px; height: 7px; border-radius: 50%; background: var(--text-secondary); animation: cxDot 1.25s infinite ease-in-out; } .cx-dots i:nth-child(2) { animation-delay: .16s; } .cx-dots i:nth-child(3) { animation-delay: .32s; }
    @keyframes cxDot { 0%, 60%, 100% { transform: translateY(0); opacity: .4; } 30% { transform: translateY(-5px); opacity: 1; } }
    .cx-typ-sub { color: var(--accent-color); font-weight: 700; display: inline-flex; align-items: center; gap: 6px; } .cx-typ-sub .cx-dots i { width: 4px; height: 4px; background: var(--accent-color); }
    .cx-unread { display: flex; align-items: center; gap: 10px; margin: 10px 0 6px; color: var(--accent-color); font-size: 10.5px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; } .cx-unread::before, .cx-unread::after { content: ''; flex: 1; height: 1px; background: color-mix(in srgb, var(--accent-color) 45%, transparent); }
    .cx-pill { position: absolute; left: 50%; bottom: 12px; transform: translate(-50%, 14px) scale(.9); opacity: 0; pointer-events: none; padding: 7px 16px; border-radius: 999px; border: 0; background: var(--accent-color); color: #fff; font: inherit; font-size: 12px; font-weight: 800; cursor: pointer; box-shadow: 0 8px 24px rgba(0, 0, 0, .4); transition: opacity .2s, transform .28s cubic-bezier(.2, 1.3, .3, 1); } .cx-pill.on { opacity: 1; transform: translate(-50%, 0); pointer-events: auto; }
    .cx-count { align-self: center; font-size: 11px; color: var(--text-tertiary); min-width: 0; } .cx-count:empty { display: none; }
    .cx-send { transition: transform .18s, filter .2s; } .cx-send:hover:not(:disabled) { filter: brightness(1.12); transform: translateY(-1px); } .cx-send:active { transform: scale(.92); } .cx-send.fly svg { animation: cxFly .5s ease; }
    @keyframes cxFly { 0% { transform: none; opacity: 1; } 45% { transform: translate(14px, -14px) scale(.7); opacity: 0; } 55% { transform: translate(-12px, 12px) scale(.7); opacity: 0; } 100% { transform: none; opacity: 1; } }
    .cx-msgs { animation: cxFade .25s ease both; }
    body.reduce-animations .cx-msg, body.reduce-animations .cx-typing, body.reduce-animations .cx-pill, body.reduce-animations .cx-send svg, body.reduce-animations .cx-dots i { animation: none !important; transition: none !important; }
    @media (prefers-reduced-motion: reduce) { .cx-msg, .cx-send svg, .cx-dots i { animation: none !important; } }
    

    .cx-right { position: relative; }
    .cx-ibtn { width: 36px; height: 36px; flex: none; border-radius: 12px; border: 1px solid var(--border-glass); background: transparent; color: var(--text-secondary); cursor: pointer; display: grid; place-items: center; transition: background .15s, color .15s, border-color .15s; position: relative; } .cx-ibtn:hover { color: var(--text-primary); border-color: var(--accent-color); background: var(--bg-glass); } .cx-ibtn.on { color: #f87171; border-color: rgba(248, 113, 113, .5); } #cx-bell.on::after { content: ''; position: absolute; width: 20px; height: 2px; border-radius: 2px; background: #f87171; transform: rotate(-45deg); }
    .cx-av.pres::after { content: ''; position: absolute; right: 0; bottom: 0; width: 11px; height: 11px; border-radius: 50%; background: #22c55e; border: 2px solid var(--bg-dark, #111); box-sizing: border-box; } .cx-av[data-prof], .cx-av.cx-sm { cursor: pointer; } .cx-pdot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #22c55e; margin-right: 6px; box-shadow: 0 0 6px #22c55e; }
    .cx-room { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 7px 16px; font-size: 12px; border-bottom: 1px solid var(--border-glass); background: color-mix(in srgb, #22c55e 8%, transparent); } .cx-room-t { font-weight: 800; letter-spacing: .06em; text-transform: uppercase; font-size: 10.5px; color: #4ade80; } .cx-room-i { display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px 3px 4px; border-radius: 999px; background: rgba(0, 0, 0, .25); } .cx-room-i img { width: 34px; height: 16px; border-radius: 4px; object-fit: cover; }
    .cx-pinbar { display: flex; align-items: center; gap: 8px; padding: 7px 16px; font-size: 12px; border-bottom: 1px solid var(--border-glass); color: var(--text-secondary); } .cx-pinbar svg { color: var(--accent-color); flex: none; } .cx-pin-t { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .cx-pin-t b { color: var(--text-primary); margin-right: 6px; } .cx-pinbar button { background: none; border: 0; color: var(--accent-color); font: inherit; font-weight: 800; cursor: pointer; }
    .cx-sin { width: 100%; box-sizing: border-box; padding: 9px 12px; border-radius: 12px; border: 1px solid var(--border-glass); background: var(--bg-glass); color: var(--text-primary); font: inherit; font-size: 13px; outline: none; margin-bottom: 8px; } .cx-sres { padding: 8px 10px; border-radius: 12px; cursor: pointer; font-size: 12.5px; } .cx-sres:hover { background: var(--bg-glass); } .cx-sres small { color: var(--text-tertiary); } .cx-sres div { color: var(--text-secondary); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cx-earlier { align-self: center; margin: 4px 0 8px; padding: 6px 14px; border-radius: 999px; border: 1px solid var(--border-glass); background: var(--bg-glass); color: var(--text-secondary); font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; } .cx-earlier:hover { color: var(--text-primary); border-color: var(--accent-color); }
    .cx-sysmsg { align-self: center; margin: 8px 0; padding: 5px 14px; border-radius: 999px; background: var(--bg-glass); border: 1px solid var(--border-glass); font-size: 11.5px; font-weight: 700; color: var(--text-secondary); text-align: center; max-width: 85%; }
    .cx-msg { position: relative; } .cx-msg.flash > .cx-bub, .cx-msg.flash > .cx-gcard, .cx-msg.flash > .cx-jumbo { animation: cxFlash 1.4s ease; } @keyframes cxFlash { 0%, 60% { box-shadow: 0 0 0 3px var(--accent-color); } 100% { box-shadow: 0 0 0 0 transparent; } }
    .cx-msg .cx-act { position: absolute; top: -30px; display: none; gap: 2px; padding: 3px; border-radius: 12px; background: var(--bg-dark, #111); border: 1px solid var(--border-glass); box-shadow: 0 8px 22px rgba(0, 0, 0, .45); z-index: 4; left: auto; right: 0; } .cx-msg:not(.mine) .cx-act { right: auto; left: 0; } .cx-msg:hover .cx-act { display: flex; } .cx-msg.gi .cx-act { left: 0; }
    .cx-act button { width: 28px; height: 28px; border-radius: 9px; border: 0; background: transparent; color: var(--text-secondary); cursor: pointer; display: grid; place-items: center; font-size: 15px; padding: 0; transition: transform .12s, background .12s; } .cx-act button:hover { background: var(--bg-glass); color: var(--text-primary); transform: scale(1.12); }
    .cx-quote { display: flex; flex-direction: column; gap: 1px; padding: 5px 10px; margin-bottom: -4px; border-left: 3px solid var(--accent-color); border-radius: 8px; background: rgba(0, 0, 0, .22); font-size: 11.5px; cursor: pointer; max-width: 100%; } .cx-quote b { color: var(--accent-color); font-size: 11px; } .cx-quote span { color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .cx-msg.mine .cx-quote { background: rgba(255, 255, 255, .16); border-left-color: #fff; } .cx-msg.mine .cx-quote b, .cx-msg.mine .cx-quote span { color: #fff; }
    .cx-bub a.cx-link { color: inherit; text-decoration: underline; text-underline-offset: 2px; font-weight: 600; word-break: break-all; } .cx-msg:not(.mine) .cx-bub a.cx-link { color: var(--accent-color); }
    .cx-jumbo { font-size: 44px; line-height: 1.15; padding: 2px 4px; } .cx-msg.jumbo .cx-act { top: -26px; }
    .cx-reacts { display: flex; gap: 4px; flex-wrap: wrap; margin: 3px 2px 0; } .cx-msg.mine .cx-reacts { justify-content: flex-end; } .cx-react { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 999px; border: 1px solid var(--border-glass); background: var(--bg-glass); color: var(--text-primary); font-size: 13px; cursor: pointer; transition: transform .12s; } .cx-react.pop { animation: cxPopIn .25s cubic-bezier(.2, 1.4, .3, 1) both; } .cx-react i { font-style: normal; font-size: 11px; font-weight: 800; color: var(--text-secondary); } .cx-react:hover { transform: scale(1.08); } .cx-react.on { background: color-mix(in srgb, var(--accent-color) 24%, transparent); border-color: var(--accent-color); } .cx-react.on i { color: var(--text-primary); } @keyframes cxPopIn { from { transform: scale(.4); opacity: 0; } to { transform: none; opacity: 1; } }
    .cx-pinmark { position: absolute; top: -6px; color: var(--accent-color); background: var(--bg-dark, #111); border-radius: 50%; width: 18px; height: 18px; display: grid; place-items: center; border: 1px solid var(--border-glass); z-index: 2; left: -6px; } .cx-msg.mine .cx-pinmark { left: auto; right: -6px; }
    .cx-gcard, .cx-lcard { display: flex; gap: 0; width: 330px; max-width: 100%; border-radius: 16px; overflow: hidden; background: var(--bg-glass); border: 1px solid var(--border-glass); flex-direction: column; } .cx-gcard img { width: 100%; height: 118px; object-fit: cover; background: rgba(0, 0, 0, .3); display: block; } .cx-gbody { padding: 10px 12px 12px; min-width: 0; } .cx-gname { font-weight: 800; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .cx-gsub { font-size: 11.5px; color: var(--text-secondary); margin-top: 2px; } .cx-gacts { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; margin-top: 9px; }
    .cx-mini.buy { background: linear-gradient(135deg, #22c55e, #16a34a); border-color: #16a34a; color: #fff; } .cx-owned { font-size: 11px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; padding: 4px 9px; border-radius: 999px; background: rgba(34, 197, 94, .16); color: #86efac; border: 1px solid rgba(34, 197, 94, .45); }
    .cx-lcard { flex-direction: row; align-items: center; padding: 10px 12px; gap: 10px; } .cx-lcard .cx-gbody { flex: 1; padding: 0; } .cx-lic { width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; background: color-mix(in srgb, var(--accent-color) 24%, transparent); color: var(--accent-color); flex: none; }
    .cx-replybar { display: flex; align-items: center; gap: 10px; padding: 8px 16px; border-top: 1px solid var(--border-glass); background: var(--bg-glass); font-size: 12px; animation: cxFade .2s ease both; } .cx-replybar > div { flex: 1; min-width: 0; display: flex; flex-direction: column; border-left: 3px solid var(--accent-color); padding-left: 10px; } .cx-replybar.edit > div { border-left-color: #f59e0b; } .cx-replybar b { font-size: 11.5px; } .cx-replybar span { color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .cx-replybar button { width: 26px; height: 26px; border-radius: 8px; border: 0; background: transparent; color: var(--text-secondary); cursor: pointer; }
    .cx-menu { position: absolute; z-index: 40; min-width: 190px; padding: 6px; border-radius: 14px; background: var(--bg-dark, #111); border: 1px solid var(--border-glass); box-shadow: 0 18px 44px rgba(0, 0, 0, .55); animation: cxPop .16s cubic-bezier(.2, 1.3, .3, 1) both; } .cx-menu button { display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px 10px; border: 0; border-radius: 9px; background: transparent; color: var(--text-primary); font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; text-align: left; } .cx-menu button:hover { background: var(--bg-glass); } .cx-menu button.bad { color: #f87171; } .cx-msep { height: 1px; margin: 4px 6px; background: var(--border-glass); } .cx-menu.cx-rpick { display: grid; grid-template-columns: repeat(8, 1fr); min-width: 0; width: 290px; gap: 2px; } .cx-rpick button { padding: 5px; justify-content: center; font-size: 19px; } .cx-rpick button:hover { transform: scale(1.18); }
    .cx-compose .cx-ibtn { margin-bottom: 2px; } .cx-wrap { position: relative; }
    .cx-chbtn { display: inline-flex; align-items: center; gap: 6px; }
    .cx-mute { margin-left: 4px; color: var(--text-tertiary); display: inline-flex; vertical-align: -2px; }
    body.reduce-animations .cx-react, body.reduce-animations .cx-menu, body.reduce-animations .cx-replybar { animation: none; }

    @media (max-width: 760px) { #chat-modal .fx-body { flex-direction: column; } .cx-left { width: auto; flex: 1; border-right: 0; } .cx-right { display: none; } #chat-modal.in-conv .cx-left { display: none; } #chat-modal.in-conv .cx-right { display: flex; } .cx-back { display: grid; } }
    `;
    document.head.appendChild(css);

    const soc = (op, p) => feat('soc', Object.assign({ op }, p || {}));
    const S = { rseen: new Set(), lastSeenId: 0, reply: null, editing: null, panel: '', sq: '', sres: null, flash: 0, seen: new Set(), ready: false, unreadFrom: 0, pill: 0, lastPing: 0, ov: null, tab: 'chats', conv: null, info: null, msgs: [], lastId: 0, polls: 0, members: false, grp: null, sf: null, busy: false, convTimer: null, ovTimer: null };
    const open = () => !!($('chat-modal') && $('chat-modal').classList.contains('active'));
    const vt = (u) => (u && u.verified && window.SLVerified ? window.SLVerified(14, u.owner) : '');
    const initial = (n) => (String(n || '?').trim()[0] || '?').toUpperCase();
    const av = (u, cls) => '<span class="cx-av' + (cls ? ' ' + cls : '') + (u.online ? ' pres' : '') + '"' + (u.uid ? ' data-prof="' + E(u.uid) + '"' : '') + '>' + E(initial(u.name)) + (u.avatar ? '<img src="' + E(u.avatar) + '" alt="" onerror="this.remove()">' : '') + '</span>';
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
    const unm = (r) => r.convs.filter(c => !c.muted).reduce((n, c) => n + c.unread, 0); // chats you muted do not pop up
    async function loadOv(quiet) {
        const r = await soc('overview'); if (!r || !r.ok) { if (!quiet) S.ov = S.ov || null; return false; }
        S.ov = r; setBadge(r.unread);
        const req = (r.incoming || []).length;
        if (!open()) {
            if (lastUnread !== null && unm(r) > lastUnread) { const c = r.convs.find(x => x.unread && !x.muted && x.last && !x.last.mine); notify('New message from ' + (c ? (c.kind === 'group' ? c.name + ': ' + (c.last.from || '') : c.name) : 'a friend') + (c && c.last ? ': ' + c.last.text.slice(0, 60) : '')); }
            else if (lastUnread === null && unm(r) > 0) notify('You have ' + unm(r) + ' unread message' + (unm(r) === 1 ? '' : 's') + '.');
            if (lastReq !== null && req > lastReq) notify('New friend request from ' + r.incoming[0].name + '.'); else if (lastReq === null && req > 0) notify('You have ' + req + ' friend request' + (req === 1 ? '' : 's') + '.');
            riskNudge();
        }
        lastUnread = unm(r); lastReq = req; return true;
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
    function stop() { try { saveDraft(); } catch (e) { } clearInterval(S.ovTimer); clearTimeout(S.convTimer); S.ovTimer = S.convTimer = null; }
    btn.addEventListener('click', () => openChat());
    SLF.openChat = openChat;

    function wire() {
        const left = $('cx-left'), right = $('cx-right');
        left.onclick = onLeft; right.onclick = onRight;
        right.onkeydown = (e) => {
            if (e.target.id === 'cx-text') {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendNow(); return; }
                if (e.key === 'Escape' && (S.reply || S.editing)) { e.stopPropagation(); S.reply = null; S.editing = null; renderBars(); return; }
                if (e.key === 'ArrowUp' && !e.target.value) { const m = [...S.msgs].reverse().find(canEdit); if (m) { e.preventDefault(); startEdit(m); } }
            } else if (e.target.id === 'cx-sq' && e.key === 'Escape') { e.stopPropagation(); S.panel = ''; renderPanel(); }
        };
        right.oninput = (e) => {
            if (e.target.id === 'cx-sq') { S.sq = e.target.value; clearTimeout(S.sqT); S.sqT = setTimeout(async () => { if (S.sq.trim().length < 2) { S.sres = null; renderPanel(); return; } const r = await soc('search', { conv: S.conv, q: S.sq.trim() }); S.sres = r && r.ok ? r.results : []; renderPanel(); }, 320); return; }
            if (e.target.id === 'cx-text') {
                const ta = e.target; if (window.SLEmoji) { const c = SLEmoji.convert(ta.value, ta.selectionStart || 0); if (c.text !== ta.value) { ta.value = c.text; ta.setSelectionRange(c.caret, c.caret); } }
                const v = ta.value; ta.style.height = '40px'; ta.style.height = Math.min(110, ta.scrollHeight) + 'px'; const c = $('cx-count'); if (c) c.textContent = v.length > 700 ? String(1000 - v.length) : '';
                if (v.trim() && S.conv && !S.editing && Date.now() - (S.lastPing || 0) > 2500) { S.lastPing = Date.now(); soc('typing', { conv: S.conv }); }
            }
        };
    }

    // ----- left column -----
    function renderLeft(keepScroll) {
        const left = $('cx-left'); if (!left) return; const ov = S.ov, y = left.querySelector('.cx-list') ? left.querySelector('.cx-list').scrollTop : 0;
        const nReq = ov ? (ov.incoming || []).length : 0, nUn = ov ? ov.unread : 0;
        let list = '';
        if (!ov) list = '<div class="cx-note">Loading... If this stays empty, SteamLite Online may be unreachable. Messages need a connection.</div>';
        else if (S.tab === 'chats') {
            list = mobCard() + '<div class="cx-btns"><button class="cx-mini pri" data-a="newgroup">New group chat</button><button class="cx-mini cx-chbtn" data-a="challenges">' + ICO.trophy + ' Challenges</button></div>' + (ov.convs.length ? pinSort(ov.convs).map(c => { const fp = c.kind === 'group' ? null : ov.friends.find(x => x.uid === c.peer); return '<div class="cx-row' + (S.conv === c.id ? ' on' : '') + '" data-c="' + E(c.id) + '">' + (c.kind === 'group' ? grpAv(c.name) : av({ name: c.name, avatar: c.avatar, uid: c.peer, online: !!(fp && fp.online) })) + '<div class="cx-main"><div class="cx-name">' + E(c.name) + (c.kind === 'group' ? '' : vt(c)) + (c.muted ? '<span class="cx-mute" title="Muted">' + ICO.bell + '</span>' : '') + (c.kind === 'group' ? ' <span class="cx-sub" style="display:inline">(' + c.members + ')</span>' : '') + '</div><div class="cx-sub' + (c.unread ? ' unread' : '') + '">' + (c.last ? (c.last.mine ? 'You: ' : (c.kind === 'group' && c.last.from ? E(c.last.from) + ': ' : '')) + E(c.last.text) : 'No messages yet') + '</div></div>' + (c.unread ? '<span class="cx-dot">' + c.unread + '</span>' : '') + '<button class="cx-pinc' + (pinnedChats().includes(c.id) ? ' on' : '') + '" data-pinc="' + E(c.id) + '" title="' + (pinnedChats().includes(c.id) ? 'Unpin this chat' : 'Pin this chat to the top') + '">' + ICO.pin + '</button></div>'; }).join('') : '<div class="cx-note">No chats yet. Add a friend in the Friends tab, then press Message.</div>');
        } else {
            const myCode = ov.me.code;
            list = '<div class="cx-sec">Add a friend</div><div class="cx-add"><input id="cx-code" placeholder="Friend code (SL-XXXXXXXXXX)" maxlength="40"><button class="cx-mini pri" data-a="addcode">Add</button></div>' +
                '<div class="cx-note">Your code: <b>' + E(myCode) + '</b> <button class="cx-mini" data-a="copycode" style="padding:3px 9px">Copy</button></div>' +
                '<div class="cx-btns"><button class="cx-mini" data-a="steamfriends">Find my Steam friends on SteamLite</button></div>' +
                (S.sf ? '<div class="cx-sec">On SteamLite</div>' + (S.sf.length ? S.sf.map(u => '<div class="cx-row">' + av(u) + '<div class="cx-main"><div class="cx-name">' + E(u.name) + vt(u) + '</div></div>' + (relationOf(u.uid) ? '<span class="cx-sub">' + relationOf(u.uid) + '</span>' : '<button class="cx-mini pri" data-a="add" data-u="' + E(u.uid) + '">Add</button>') + '</div>').join('') : '<div class="cx-note">None of your Steam friends were found on SteamLite yet. Share your code with them.</div>') : '') +
                (nReq ? '<div class="cx-sec">Requests</div>' + ov.incoming.map(u => '<div class="cx-row">' + av(u) + '<div class="cx-main"><div class="cx-name">' + E(u.name) + vt(u) + '</div></div><button class="cx-mini pri" data-a="accept" data-u="' + E(u.uid) + '">Accept</button><button class="cx-mini" data-a="decline" data-u="' + E(u.uid) + '">No</button></div>').join('') : '') +
                (ov.outgoing.length ? '<div class="cx-sec">Waiting for an answer</div>' + ov.outgoing.map(u => '<div class="cx-row">' + av(u) + '<div class="cx-main"><div class="cx-name">' + E(u.name) + vt(u) + '</div></div><span class="cx-sub">Pending</span></div>').join('') : '') +
                '<div class="cx-sec">Friends (' + ov.friends.length + ')</div>' + (ov.friends.length ? ov.friends.map(f => '<div class="cx-row" data-f="' + E(f.uid) + '">' + av(f) + '<div class="cx-main"><div class="cx-name">' + E(f.name) + vt(f) + '</div><div class="cx-sub">' + (f.playing ? 'Playing ' + E(f.playing.name) : f.online ? 'Online' : f.doneToday ? 'Streak kept today' : f.atRisk ? 'Streak at risk today' : f.best ? 'Best streak ' + f.best : 'Say hi') + '</div></div>' + streakChip(f) + '</div>').join('') : '<div class="cx-note">No friends yet. Add someone with their code, or find your Steam friends.</div>');
        }
        left.innerHTML = '<div class="cx-tabs"><button data-t="chats" class="' + (S.tab === 'chats' ? 'on' : '') + '">Chats' + (nUn ? '<span class="cx-dot">' + nUn + '</span>' : '') + '</button><button data-t="friends" class="' + (S.tab === 'friends' ? 'on' : '') + '">Friends' + (nReq ? '<span class="cx-dot">' + nReq + '</span>' : '') + '</button></div><div class="cx-list">' + list + '</div>';
        if (keepScroll) left.querySelector('.cx-list').scrollTop = y;
    }
    const relationOf = (uid) => { const o = S.ov; if (!o) return ''; return o.friends.some(f => f.uid === uid) ? 'Friends' : o.outgoing.some(f => f.uid === uid) ? 'Pending' : o.incoming.some(f => f.uid === uid) ? 'Wants to be friends' : ''; };
    async function friendAction(fn, ok) { if (S.busy) return; S.busy = true; try { const r = await fn(); if (r && r.ok) { if (ok) toast(ok); } else toast(err(r)); } finally { S.busy = false; } await loadOv(true); renderLeft(true); }

    async function onLeft(e) {
        const mg = e.target.closest('[data-a=mobget]'), mh = e.target.closest('[data-a=mobhide]'); if (mg) { try { api.openExternal(MOB_URL); } catch (er) { } return; } if (mh) { try { localStorage.setItem(MOB_KEY, '1'); } catch (er) { } renderLeft(true); return; }
        const pc = e.target.closest('[data-pinc]'); if (pc) { e.stopPropagation(); togglePin(pc.dataset.pinc); return; }
        const t = e.target.closest('[data-t]'), c = e.target.closest('[data-c]'), a = e.target.closest('[data-a]'), f = e.target.closest('[data-f]'), pf = e.target.closest('[data-prof]');
        if (pf && pf.dataset.prof && window.SLPeople) { SLPeople.openProfile(pf.dataset.prof); return; }
        if (a && a.dataset.a === 'challenges') { if (window.SLPeople) SLPeople.openChallenges(); return; }
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
    const REACT = ["👍","❤️","😂","😮","😢","🔥","🎉","👏","😍","🤔","👀","💯","🙏","😎","🤣","😭","😡","🥳","💀","✅","❌","🎮","👑","⭐","🙌","💪","🤝","😅","🥹","😴","🤯","💔"];
    const typingText = (list, isG) => { if (!list || !list.length) return ''; const n = list.map(x => x.name); return !isG ? 'typing' : n.length === 1 ? n[0] + ' is typing' : n.length === 2 ? n[0] + ' and ' + n[1] + ' are typing' : n.length + ' people are typing'; };
    const dotsHtml = '<span class="cx-dots"><i></i><i></i><i></i></span>';
    const linkify = (t) => E(t).replace(/(https:\/\/[^\s<]{3,220})/g, (u) => { const c = u.replace(/(?:[.,!?)]|&quot;|&#39;)+$/, ''), tail = u.slice(c.length); return '<a href="#" class="cx-link" data-url="' + E(c.replace(/&amp;/g, '&')) + '">' + c + '</a>' + tail; });
    const lastDraftKey = 'sl_chat_drafts';
    const drafts = (() => { try { return JSON.parse(localStorage.getItem(lastDraftKey) || '{}'); } catch (e) { return {}; } })();
    const saveDraft = () => { try { const t = $('cx-text'); if (S.conv && t) { if (t.value.trim()) drafts[S.conv] = t.value; else delete drafts[S.conv]; const keys = Object.keys(drafts); if (keys.length > 40) delete drafts[keys[0]]; localStorage.setItem(lastDraftKey, JSON.stringify(drafts)); } } catch (e) { } };
    function schedule() {
        clearTimeout(S.convTimer); if (!open() || !S.conv) return;
        const d = document.hidden ? 8000 : (S.info && S.info.typing && S.info.typing.length ? 1100 : 2200);
        S.convTimer = setTimeout(async () => { if (!open()) return stop(); if (!document.hidden) await pull(++S.polls % 4 === 0); schedule(); }, d);
    }
    async function pick(id, refresh) {
        saveDraft();
        S.conv = id; S.grp = null; S.members = false; S.lastId = 0; S.msgs = []; S.polls = 0; S.seen = new Set(); S.ready = false; S.unreadFrom = 0; S.pill = 0; S.lastPing = 0; S.reply = null; S.editing = null; S.panel = ''; S.sq = ''; S.sres = null; S.rseen = new Set(); S.lastSeenId = 0; S.info = refresh && S.info && S.info.id === id ? S.info : null;
        const ch = $('chat-modal'); if (ch) ch.classList.add('in-conv'); renderLeft(true); renderRight();
        await pull(true); clearTimeout(S.convTimer); schedule();
    }
    async function pull(full) {
        if (!S.conv) return; const id = S.conv, r = await soc('conv', { id, after: full ? 0 : S.lastId });
        if (S.conv !== id) return; if (!r || !r.ok) { if (!S.info) { const rt = $('cx-right'); if (rt) rt.innerHTML = '<div class="cx-empty"><b>Could not open this chat</b>' + E(err(r)) + '</div>'; } return; }
        const first = !S.ready, hadInfo = !!S.info, pend = S.msgs.filter(m => m.pending || m.failed), prevMsgs = S.msgs;
        const keepHasMore = S.info && !full ? S.info.hasMore : r.hasMore; if (!full && S.info) { r.pins = S.info.pins; }
        S.info = r; if (!full) S.info.hasMore = keepHasMore;
        if (first) { S.unreadFrom = (r.messages.find(m => !m.mine && m.id > (r.myRead || 0)) || {}).id || 0; }
        if (full) { const firstNew = r.messages.length ? r.messages[0].id : Infinity; const older = prevMsgs.filter(m => typeof m.id === 'number' && m.id < firstNew); S.msgs = older.concat(r.messages).concat(pend); if (older.length) S.info.hasMore = prevMsgs.length ? S.info.hasMore || false : r.hasMore; }
        else if (r.messages.length) S.msgs = S.msgs.filter(m => !m.pending && !m.failed).concat(r.messages.filter(m => !S.msgs.some(x => x.id === m.id))).concat(pend);
        const real = S.msgs.filter(m => typeof m.id === 'number'); S.lastId = real.length ? real[real.length - 1].id : 0;
        if (first) { S.msgs.forEach(m => S.seen.add(m.id)); S.ready = true; }
        if (!$('cx-msgs') || !$('cx-head') || !hadInfo) { renderRight(true); return; }
        if (full) renderPins(); renderMsgs(); updateMeta();
        if (r.messages.length && !full) loadOv(true).then(() => renderLeft(true));
    }
    async function loadEarlier() {
        const real = S.msgs.filter(m => typeof m.id === 'number'); if (!real.length || !S.conv) return; const id = S.conv, ms = $('cx-msgs'), h0 = ms ? ms.scrollHeight : 0;
        const r = await soc('conv', { id, before: real[0].id }); if (S.conv !== id) return; if (!r || !r.ok) return toast(err(r));
        r.messages.forEach(m => S.seen.add(m.id)); S.msgs = r.messages.filter(m => !S.msgs.some(x => x.id === m.id)).concat(S.msgs); S.info.hasMore = !!r.hasMore;
        renderMsgs(true); const m2 = $('cx-msgs'); if (m2) m2.scrollTop = m2.scrollHeight - h0;
    }
    function presenceLine(u) { return u ? (u.playing ? 'Playing ' + u.playing.name : u.online ? 'Online' : '') : ''; }
    function updateMeta() {
        const i = S.info; if (!i) return; const isG = i.kind === 'group', t = typingText(i.typing, isG), sub = $('cx-sub'), ty = $('cx-typing');
        const peer = !isG ? i.members.find(m => m.uid === i.peerUid) : null, pl = isG ? '' : presenceLine(peer), on = i.members.filter(m => m.online && m.uid !== (S.ov && S.ov.me.uid)).length;
        if (sub) sub.innerHTML = t ? '<span class="cx-typ-sub">' + E(t) + dotsHtml + '</span>' : (isG ? i.members.length + ' members' + (on ? ' &middot; ' + on + ' online' : '') : (pl ? (peer.online ? '<span class="cx-pdot"></span>' : '') + E(pl) : 'Private chat'));
        const rooms = $('cx-room'); if (rooms) { const pls = isG ? i.members.filter(m => m.playing) : []; rooms.style.display = pls.length ? '' : 'none'; rooms.innerHTML = pls.length ? '<span class="cx-room-t">Playing now</span>' + pls.map(m => '<span class="cx-room-i"><img src="' + cover(m.playing.appid) + '" onerror="this.remove()" alt="">' + E(m.name) + ' <b>' + E(m.playing.name) + '</b></span>').join('') : ''; }
        if (ty) { const was = ty.classList.contains('on'); ty.classList.toggle('on', !!t); const lab = ty.querySelector('.cx-typ-who'); if (lab) lab.textContent = isG ? t : ''; if (t && !was) { const ms = $('cx-msgs'); if (ms && ms.scrollHeight - ms.scrollTop - ms.clientHeight < 140) setTimeout(() => ms.scrollTo({ top: ms.scrollHeight, behavior: 'smooth' }), 30); } }
        const bell = $('cx-bell'); if (bell) { bell.classList.toggle('on', !!i.muted); bell.title = i.muted ? 'Notifications are off for this chat. Click to turn them on.' : 'Turn notifications off for this chat'; }
    }
    const cover = (id) => 'steamlite://cache/' + String(id).replace(/[^0-9]/g, '');
    // photos and voice messages sent from SteamLite Mobile
    const MEDIA_BASE = 'https://steamlite-online.bayxturtle.workers.dev/media/';
    (function () { const st = document.createElement('style'); st.textContent = '.cx-lp{display:block;margin-top:6px;border-radius:12px;overflow:hidden;background:rgba(255,255,255,.06);max-width:320px;text-decoration:none;color:inherit}.cx-lp img{width:100%;max-height:150px;object-fit:cover;display:block}.cx-lp div{padding:8px 11px}.cx-lp b{display:block;font-size:13px}.cx-lp span{display:block;font-size:12px;opacity:.7;margin-top:2px}.cx-row{position:relative}.cx-pinc{position:absolute;right:8px;top:8px;opacity:0;background:transparent;border:0;color:var(--text-secondary);cursor:pointer;padding:4px;border-radius:6px;transition:opacity .15s}.cx-row:hover .cx-pinc,.cx-pinc.on{opacity:1}.cx-pinc.on{color:var(--accent-color)}.cx-pinc:hover{background:rgba(255,255,255,.1)}.cx-replybar.rec b{color:#ff6b6b}.cx-photo{display:block;max-width:min(320px,100%);max-height:360px;border-radius:14px;cursor:zoom-in;background:rgba(255,255,255,.05)}.cx-photo-cap{margin-top:6px}.cx-voice{display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:16px;background:rgba(255,255,255,.07)}.cx-voice audio{height:34px;max-width:240px}'; document.head.appendChild(st); })();
    function mediaBody(m) {
        const d = m.data || {}, id = String(d.id || '').replace(/[^a-f0-9]/g, '');
        if (m.kind === 'image') return '<img class="cx-photo" src="' + (m.localSrc ? E(m.localSrc) : MEDIA_BASE + id) + '" alt="Photo" onclick="window.open(this.src)" onerror="this.style.display=\'none\'">' + (m.text && m.text !== '\ud83d\udcf7 Photo' ? '<div class="cx-bub cx-photo-cap" data-no-icons>' + linkify(m.text) + '</div>' : '');
        if (!id) return '<div class="cx-voice">\ud83c\udfa4 Sending voice message...</div>';
        return '<div class="cx-voice">\ud83c\udfa4<audio controls preload="none" src="' + MEDIA_BASE + id + '"></audio></div>';
    }
    const avSm = (u) => '<span class="cx-av cx-sm" data-prof="' + E(u.uid || '') + '">' + E(initial(u.name)) + (u.avatar ? '<img src="' + E(u.avatar) + '" alt="" onerror="this.remove()">' : '') + '</span>';
    const ownedGame = (appid) => (window.SLPeople ? SLPeople.owned(appid) : null);
    const installed = (appid) => { try { return installedGames.some(g => String(g.appid || g.id) === String(appid)); } catch (e) { return false; } };
    function gameCard(m) {
        const d = m.data || {}, id = String(d.appid || '').replace(/[^0-9]/g, ''), mine = ownedGame(id), sub = (m.mine ? 'You shared this game' : E(m.name) + ' shared this game') + (d.hours ? ' &middot; ' + fmtn(d.hours) + ' h played' : '');
        return '<div class="cx-gcard"><img src="' + cover(id) + '" onerror="this.style.visibility=\'hidden\'" alt=""><div class="cx-gbody"><div class="cx-gname">' + E(d.name || 'Game') + '</div><div class="cx-gsub">' + sub + '</div><div class="cx-gacts">' + (m.mine ? '' : mine ? '<span class="cx-owned">In your library</span>' + (installed(id) ? '<button class="cx-mini pri" data-play="' + id + '">Play</button>' : '') : '<button class="cx-mini buy" data-buy="' + id + '">Buy on Steam</button>') + '<button class="cx-mini" data-store="' + id + '">Store page</button></div></div></div>';
    }
    const fmtn = (n) => Number(n || 0).toLocaleString('en-US');
    function listCard(m) { const d = m.data || {}; return '<div class="cx-lcard" data-list="' + E(d.id || '') + '"><div class="cx-lic">' + SV('<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>', 20) + '</div><div class="cx-gbody"><div class="cx-gname">' + E(d.title || 'Game list') + '</div><div class="cx-gsub">' + (m.mine ? 'You shared a game list' : E(m.name) + ' shared a game list') + '</div></div><button class="cx-mini pri" data-list="' + E(d.id || '') + '">Open list</button></div>'; }
    function msgBody(m) {
        if (m.kind === 'game') return gameCard(m); if (m.kind === 'list') return listCard(m); if (m.kind === 'image' || m.kind === 'voice') return mediaBody(m);
        const jumbo = window.SLEmoji && SLEmoji.isJumbo(m.text);
        return jumbo ? '<div class="cx-jumbo" data-no-icons>' + E(m.text) + '</div>' : '<div class="cx-bub" data-no-icons>' + linkify(m.text) + '</div>' + previewHtml(m.text);
    }
    const canEdit = (m) => m.mine && m.kind === 'text' && typeof m.id === 'number' && Date.now() - m.at < 900000;
    function renderMsgs(keep) {
        const ms = $('cx-msgs'), i = S.info; if (!ms || !i) return;
        const isG = i.kind === 'group', near = ms.scrollHeight - ms.scrollTop - ms.clientHeight < 90, prevTop = ms.scrollTop, avatars = {}; i.members.forEach(m => { avatars[m.uid] = m; });
        let lastMine = 0; S.msgs.forEach(m => { if (m.mine && typeof m.id === 'number') lastMine = m.id; });
        let html = i.hasMore ? '<button class="cx-earlier" data-a="earlier">Load earlier messages</button>' : '', lastDay = '', added = 0, addedOther = 0, divDone = false;
        S.msgs.forEach((m, k) => {
            const d = dayLabel(m.at), prev = S.msgs[k - 1], next = S.msgs[k + 1], same = (a, b) => a && b && a.uid === b.uid && a.kind !== 'system' && b.kind !== 'system' && dayLabel(a.at) === dayLabel(b.at) && Math.abs(b.at - a.at) < 240000;
            if (d !== lastDay) { html += '<div class="cx-day">' + E(d) + '</div>'; lastDay = d; }
            if (m.kind === 'system') { html += '<div class="cx-sysmsg" data-no-icons>' + E(m.text) + '</div>'; return; }
            const sp = same(prev, m), sn = same(m, next);
            if (!divDone && S.unreadFrom && m.id === S.unreadFrom) { html += '<div class="cx-unread"><span>New messages</span></div>'; divDone = true; }
            const isNew = S.ready && !S.seen.has(m.id); if (isNew) { added++; if (!m.mine) addedOther++; }
            const card = m.kind === 'game' || m.kind === 'list' || m.kind === 'image' || m.kind === 'voice', jumbo = m.kind === 'text' && window.SLEmoji && SLEmoji.isJumbo(m.text), real = typeof m.id === 'number';
            const cls = 'cx-msg' + (m.mine ? ' mine' : '') + (sp ? ' sp' : '') + (sn ? ' sn' : '') + (isNew ? (m.mine ? ' in-r' : ' in-l') : '') + (m.pending ? ' pending' : '') + (m.failed ? ' failed' : '') + (isG && !m.mine ? ' gi' : '') + (card ? ' card' : '') + (jumbo ? ' jumbo' : '') + (m.pinned ? ' pinned' : '') + (S.flash === m.id ? ' flash' : '');
            const showWho = isG && !m.mine && !sp, who = avatars[m.uid];
            const quote = m.replyTo ? '<div class="cx-quote" data-q="' + m.replyTo.id + '"><b>' + E(m.replyTo.name || 'Message') + '</b><span data-no-icons>' + E(m.replyTo.kind === 'game' || m.replyTo.kind === 'list' ? m.replyTo.text : m.replyTo.text) + '</span></div>' : '';
            const reacts = m.reactions && m.reactions.length ? '<div class="cx-reacts" data-no-icons>' + m.reactions.map(r => { const rk = m.id + '|' + r.e + '|' + r.n; const rnew = S.ready && !S.rseen.has(rk); S.rseen.add(rk); return '<button class="cx-react' + (r.me ? ' on' : '') + (rnew ? ' pop' : '') + '" data-re="' + m.id + '" data-e="' + E(r.e) + '" title="' + (r.me ? 'Click to remove' : 'Click to add') + '">' + r.e + '<i>' + r.n + '</i></button>'; }).join('') + '</div>' : '';
            const act = real && !m.pending && !m.failed ? '<div class="cx-act" data-no-icons>' + REACT.slice(0, 3).map(e => '<button data-qr="' + m.id + '" data-e="' + E(e) + '" title="React">' + e + '</button>').join('') + '<button data-rmore="' + m.id + '" title="More reactions">' + ICO.smile + '</button><button data-reply="' + m.id + '" title="Reply">' + ICO.reply + '</button><button data-more="' + m.id + '" title="More">' + ICO.more + '</button></div>' : '';
            html += (showWho ? '<div class="cx-who">' + E(m.name) + vt(m) + '</div>' : '') + '<div class="' + cls + '" data-mid="' + (real ? m.id : '') + '">' + (isG && !m.mine && !sn ? avSm(Object.assign({ uid: m.uid }, who || { name: m.name })) : '') + act + (m.pinned ? '<span class="cx-pinmark" title="Pinned">' + ICO.pin + '</span>' : '') + quote + msgBody(m) + reacts +
                (m.failed ? '<div class="cx-fail">Not sent. <button data-retry="' + E(m.id) + '">Try again</button> <button data-drop="' + E(m.id) + '">Delete</button></div>' : (!sn || m.reactions.length ? '<div class="cx-time" title="' + E(new Date(m.at).toLocaleString()) + '">' + (m.pending ? 'Sending' : clock(m.at)) + (m.edited ? ' &middot; edited' : '') + (!isG && m.mine && m.id === lastMine && i.peerRead >= m.id ? ' &middot; <span class="cx-seen' + (S.lastSeenId !== m.id ? ' fresh' : '') + '">Seen</span>' : '') + '</div>' : '')) + '</div>';
        });
        const typ = '<div class="cx-typing' + (i.typing && i.typing.length ? ' on' : '') + '" id="cx-typing"><span class="cx-typ-bub">' + dotsHtml + '</span><span class="cx-typ-who">' + E(isG ? typingText(i.typing, true) : '') + '</span></div>';
        ms.innerHTML = (html || '<div class="cx-empty"><b>No messages yet</b>' + (isG || i.canSend ? 'Say hello!' : '') + '</div>') + typ;
        const sendMine = S.msgs.length && S.msgs[S.msgs.length - 1].mine && added;
        if (keep) { ms.scrollTop = prevTop; }
        else if (near || sendMine || !S.ready) { ms.scrollTo({ top: ms.scrollHeight, behavior: S.ready && added ? 'smooth' : 'auto' }); S.pill = 0; }
        else { ms.scrollTop = prevTop; if (addedOther) S.pill += addedOther; }
        S.msgs.forEach(m => S.seen.add(m.id)); S.lastSeenId = (!isG && i.peerRead >= lastMine && lastMine) ? lastMine : 0; paintPill(); if (S.flash) setTimeout(() => { S.flash = 0; const f = ms.querySelector('.flash'); if (f) f.classList.remove('flash'); }, 1600);
    }
    function paintPill() { const p = $('cx-pill'); if (!p) return; p.classList.toggle('on', S.pill > 0); p.textContent = S.pill > 0 ? (S.pill === 1 ? '1 new message' : S.pill + ' new messages') : ''; }
    function renderPins() {
        const bar = $('cx-pinbar'); if (!bar) return; const pins = (S.info && S.info.pins) || [];
        bar.style.display = pins.length ? '' : 'none'; bar.innerHTML = pins.length ? ICO.pin + '<span class="cx-pin-t" data-no-icons><b>' + (pins.length > 1 ? pins.length + ' pinned messages' : 'Pinned') + '</b> ' + E(pins[0].text) + '</span><button data-a="pins">View</button>' : '';
    }
    function renderPanel() {
        const host = $('cx-panelhost'); if (!host) return; const i = S.info; let h = '';
        if (S.panel === 'members' && i && i.kind === 'group') h = '<div class="cx-panel"><div class="cx-sec" style="margin-top:0">Members (' + i.members.length + ')</div>' + i.members.map(m => '<div class="cx-row" data-prof="' + E(m.uid) + '">' + av(m) + '<div class="cx-main"><div class="cx-name">' + E(m.name) + vt(m) + (m.role === 'owner' ? ' <span class="cx-sub" style="display:inline">owner</span>' : '') + '</div><div class="cx-sub">' + E(presenceLine(m) || 'Offline') + '</div></div>' + (i.owner && m.role !== 'owner' ? '<button class="cx-mini bad" data-k="' + E(m.uid) + '">Remove</button>' : '') + '</div>').join('') + '<div class="cx-btns">' + (i.owner ? '<button class="cx-mini" data-a="addmember">Add a friend</button><button class="cx-mini" data-a="rename">Rename</button>' : '') + '<button class="cx-mini bad" data-a="leave">Leave group</button></div></div>';
        else if (S.panel === 'search') { const res = S.sres; h = '<div class="cx-panel"><input class="cx-sin" id="cx-sq" placeholder="Search this chat" maxlength="40" value="' + E(S.sq || '') + '" autocomplete="off">' + (res ? (res.length ? res.map(r => '<div class="cx-sres" data-jump="' + r.id + '"><b>' + E(r.mine ? 'You' : r.name) + '</b> <small>' + E(new Date(r.at).toLocaleString()) + '</small><div data-no-icons>' + E(r.text) + '</div></div>').join('') : '<div class="cx-note">Nothing found.</div>') : '<div class="cx-note">Type at least 2 letters. Searches the last 30 days.</div>') + '</div>'; }
        else if (S.panel === 'pins') { const pins = (i && i.pins) || []; h = '<div class="cx-panel"><div class="cx-sec" style="margin-top:0">Pinned messages</div>' + (pins.length ? pins.map(p => '<div class="cx-sres" data-jump="' + p.id + '"><b>' + E(p.name) + '</b><div data-no-icons>' + E(p.text) + '</div></div>').join('') : '<div class="cx-note">Nothing is pinned.</div>') + '</div>'; }
        host.innerHTML = h; const q = $('cx-sq'); if (q && S.panel === 'search') { q.focus(); q.setSelectionRange(q.value.length, q.value.length); }
    }
    function renderBars() {
        const host = $('cx-barhost'); if (!host) return; let h = '';
        if (S.rec) h = '<div class="cx-replybar rec"><div><b>Recording...</b><span id="cx-rt">0:00</span></div><button class="cx-mini pri" data-a="recsend">Send</button><button class="cx-mini" data-a="reccancel">Cancel</button></div>';
        else if (S.editing) h = '<div class="cx-replybar edit"><div><b>Editing your message</b><span data-no-icons>' + E(S.editing.text) + '</span></div><button data-a="cancelbar" title="Cancel">' + ICO.x + '</button></div>';
        else if (S.reply) h = '<div class="cx-replybar"><div><b>Replying to ' + E(S.reply.name) + '</b><span data-no-icons>' + E(S.reply.text) + '</span></div><button data-a="cancelbar" title="Cancel">' + ICO.x + '</button></div>';
        host.innerHTML = h;
    }
    function renderRight(keepInput) {
        const right = $('cx-right'); if (!right) return;
        if (S.grp) { renderGroupForm(right); return; }
        right.onclick = onRight;
        if (!S.conv || !S.info) { right.innerHTML = S.conv ? '<div class="cx-empty">Opening...</div>' : '<div class="cx-empty"><div style="width:54px;height:54px;margin:0 auto 12px;color:var(--accent-color)">' + SV('<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 20l1.2-4.6A8.4 8.4 0 1 1 21 11.5z"/>', 54) + '</div><b>Messages</b>Chat with friends who use SteamLite, share games, make group chats and keep a daily streak going. Pick a chat on the left, or add a friend.</div>'; return; }
        const i = S.info, isG = i.kind === 'group', old = $('cx-text'), draft = keepInput && old ? old.value : (drafts[S.conv] || ''), keepFocus = old && document.activeElement === old;
        const peer = !isG ? i.members.find(m => m.uid === i.peerUid) || i.members.find(m => m.uid !== (S.ov && S.ov.me.uid)) : null;
        const title = isG ? i.name : (peer ? peer.name : 'Chat'), st = i.streak;
        const banner = !isG && st ? (st.doneToday ? '<div class="cx-banner">' + ICO.flame + ' <b>' + st.streak + '-day streak</b> kept for today. See you tomorrow!</div>' : st.atRisk || st.streak ? '<div class="cx-banner">' + ICO.flame + ' <b>' + st.streak + '-day streak.</b> ' + (st.mineToday ? 'You sent yours. Waiting for ' + E(title) + '.' : 'Both of you message today to keep it going.') + '</div>' : (st.theirsToday || st.mineToday ? '<div class="cx-banner">' + ICO.flame + ' A streak starts when you both send a message on the same day.</div>' : '')) : '';
        const canSend = isG || i.canSend;
        right.innerHTML = '<div class="cx-head" id="cx-head"><button class="cx-mini cx-back" data-a="back" style="padding:6px 9px">' + ICO.back + '</button>' + (isG ? grpAv(title) : '<span data-prof="' + E(peer ? peer.uid : '') + '" style="cursor:pointer" title="See their profile">' + av(peer || { name: title }) + '</span>') + '<div class="cx-main"><div class="cx-name">' + E(title) + (isG ? '' : vt(peer)) + '</div><div class="cx-sub" id="cx-sub"></div></div>' + (!isG ? streakChip(st) : '') +
            '<button class="cx-ibtn' + (S.panel === 'search' ? ' on' : '') + '" data-a="search" title="Search this chat">' + ICO.search + '</button><button class="cx-ibtn" id="cx-bell" data-a="mute">' + ICO.bell + '</button>' + (isG ? '<button class="cx-mini" data-a="members">' + ICO.users + ' Members</button>' : '<button class="cx-ibtn" data-a="peermenu" title="More">' + ICO.more + '</button>') + '</div>' + banner +
            '<div class="cx-room" id="cx-room" style="display:none"></div><div class="cx-pinbar" id="cx-pinbar" style="display:none"></div><div id="cx-panelhost"></div>' +
            '<div class="cx-wrap"><div class="cx-msgs" id="cx-msgs"></div><button class="cx-pill" id="cx-pill" data-a="pill"></button></div><div id="cx-barhost"></div>' +
            (canSend ? '<div class="cx-compose"><button class="cx-ibtn" data-a="plus" title="Photo, voice message, quick replies or share a game">' + ICO.plus + '</button><button class="cx-ibtn" data-a="emoji" title="Emoji">' + ICO.smile + '</button><textarea id="cx-text" placeholder="Write a message..." maxlength="1000" rows="1"></textarea><span class="cx-count" id="cx-count"></span><button class="cx-send" data-a="send" id="cx-sendbtn" title="Send">' + ICO.send + '</button></div>' : '<div class="cx-compose"><div class="cx-note" style="flex:1">You can not message this player any more. They may have removed you.</div></div>');
        S.seen = S.seen || new Set(); const wasReady = S.ready; renderMsgs(); updateMeta(); renderPins(); renderPanel(); renderBars(); S.ready = wasReady || S.ready;
        right.ondragover = (e) => { if (e.dataTransfer && [...e.dataTransfer.types].includes('Files')) e.preventDefault(); }; right.ondrop = (e) => { const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]; if (f && /^image\//.test(f.type)) { e.preventDefault(); sendPhoto(f); } };
        const ta = $('cx-text'); if (ta) { ta.onpaste = (e) => { const it = [...((e.clipboardData && e.clipboardData.items) || [])].find((x) => x.type.indexOf('image/') === 0); if (it) { e.preventDefault(); sendPhoto(it.getAsFile()); } }; ta.value = draft; if (draft) ta.style.height = Math.min(110, ta.scrollHeight) + 'px'; if (keepFocus || !keepInput) ta.focus(); }
    }
    let sendQ = Promise.resolve();
    async function sendNow(retry, extra) {
        const ta = $('cx-text'); if (!S.conv) return; let text, tmp;
        if (S.editing && !retry && !extra) {
            if (!ta) return; text = ta.value.trim(); if (!text) return; const ed = S.editing; if (text === ed.text) { S.editing = null; renderBars(); ta.value = ''; return; }
            const r = await soc('edit', { id: ed.id, text }); if (!r || !r.ok) return toast(err(r));
            const m = S.msgs.find(x => x.id === ed.id); if (m) { m.text = text; m.edited = true; } S.editing = null; ta.value = ''; ta.style.height = '40px'; renderBars(); renderMsgs(true); return;
        }
        if (retry) { tmp = S.msgs.find(m => String(m.id) === String(retry)); if (!tmp) return; text = tmp.text; tmp.failed = false; tmp.pending = true; tmp.at = Date.now(); }
        else if (extra) { tmp = Object.assign({ id: 'p' + (++S.tmp), uid: S.ov ? S.ov.me.uid : '', name: 'You', at: Date.now(), mine: true, pending: true, reactions: [], replyTo: null }, extra); S.msgs.push(tmp); }
        else {
            if (!ta) return; text = ta.value.trim(); if (!text) return;
            const rp = S.reply; tmp = { id: 'p' + (++S.tmp), uid: S.ov ? S.ov.me.uid : '', name: 'You', text, kind: 'text', at: Date.now(), mine: true, pending: true, reactions: [], replyTo: rp ? { id: rp.id, name: rp.name, text: rp.text, kind: 'text' } : null, replyId: rp ? rp.id : 0 }; S.msgs.push(tmp);
            ta.value = ''; ta.style.height = '40px'; const c = $('cx-count'); if (c) c.textContent = ''; delete drafts[S.conv]; S.reply = null; renderBars(); ta.focus();
        }
        const sb = $('cx-sendbtn'); if (sb) { sb.classList.remove('fly'); void sb.offsetWidth; sb.classList.add('fly'); }
        renderMsgs(); const conv = S.conv;
        sendQ = sendQ.then(async () => {
            if (tmp.upload) {
                const u = await soc('media', { mime: tmp.upload.mime, data: tmp.upload.data });
                if (!u || !u.ok) { tmp.pending = false; tmp.failed = true; toast(err(u)); if (S.conv === conv) renderMsgs(); return; }
                tmp.data = Object.assign({}, tmp.data, { id: u.id }); tmp.upload = null;
            }
            const payload = { conv, text: tmp.text, kind: tmp.kind || 'text', data: tmp.data, reply: tmp.replyId || 0 };
            const r = await soc('send', payload);
            if (!r || !r.ok) { tmp.pending = false; tmp.failed = true; toast(err(r)); if (S.conv === conv) renderMsgs(); return; }
            tmp.pending = false; tmp.id = r.id; tmp.at = r.at; S.seen.add(r.id); S.lastId = Math.max(S.lastId, r.id);
            if (S.conv === conv) { renderMsgs(); if (S.info) { if (r.streak) S.info.streak = r.streak; } }
            const was = S.info && S.info.streak ? S.info.streak.streak : 0;
            if (r.streak && r.streak.streak > was && r.streak.doneToday) toast('Streak: ' + r.streak.streak + ' day' + (r.streak.streak === 1 ? '' : 's') + '! Keep it going tomorrow.');
            if (S.conv === conv && r.streak) { renderRight(true); }
            loadOv(true).then(() => renderLeft(true));
        });
    }
    S.tmp = 0;
    // ---- small floating menus (more actions, emoji for reactions, the + menu) ----
    function closeMenu() { const m = document.querySelector('#cx-right .cx-menu'); if (m) m.remove(); }
    function showMenu(anchor, items) {
        closeMenu(); const right = $('cx-right'); if (!right || !anchor) return; const r = anchor.getBoundingClientRect(), rr = right.getBoundingClientRect();
        const m = document.createElement('div'); m.className = 'cx-menu'; m.setAttribute('data-no-icons', ''); m.innerHTML = items.map((it, k) => it.sep ? '<div class="cx-msep"></div>' : '<button data-mi="' + k + '" class="' + (it.bad ? 'bad' : '') + '">' + (it.ico || '') + '<span>' + E(it.label) + '</span></button>').join('');
        right.appendChild(m); const w = m.offsetWidth, h = m.offsetHeight; let left = r.left - rr.left - (r.left + w > rr.right - 8 ? w - r.width : 0), top = r.bottom - rr.top + 6; if (top + h > rr.height - 8) top = Math.max(8, r.top - rr.top - h - 6); m.style.left = Math.max(8, left) + 'px'; m.style.top = top + 'px';
        m.addEventListener('click', (e) => { const b = e.target.closest('[data-mi]'); if (!b) return; const it = items[Number(b.dataset.mi)]; closeMenu(); if (it && it.run) it.run(); });
        setTimeout(() => { const away = (e) => { if (!m.isConnected) { document.removeEventListener('mousedown', away, true); return; } if (!m.contains(e.target)) { m.remove(); document.removeEventListener('mousedown', away, true); } }; document.addEventListener('mousedown', away, true); }, 0);
    }
    function showReactPicker(anchor, mid) {
        showMenu(anchor, []); const m = document.querySelector('#cx-right .cx-menu'); if (!m) return; m.classList.add('cx-rpick'); m.innerHTML = REACT.map(e => '<button data-pr="' + e + '">' + e + '</button>').join('');
        m.onclick = (ev) => { const b = ev.target.closest('[data-pr]'); if (!b) return; m.remove(); react(mid, b.dataset.pr); };
    }
    async function react(mid, e) {
        const m = S.msgs.find(x => x.id === Number(mid)); if (!m) return; const cur = (m.reactions || []).find(r => r.e === e), on = !(cur && cur.me);
        if (cur) { cur.me = on; cur.n += on ? 1 : -1; if (cur.n <= 0) m.reactions = m.reactions.filter(r => r !== cur); } else { m.reactions = (m.reactions || []).concat([{ e, n: 1, me: true }]); }
        renderMsgs(true); const r = await soc('react', { msg: Number(mid), emoji: e, on }); if (!r || !r.ok) { toast(err(r)); pull(true); }
    }
    function scrollToMsg(id) {
        const ms = $('cx-msgs'), el = ms && ms.querySelector('[data-mid="' + id + '"]'); if (!el) { toast('That message is older. Press "Load earlier messages" at the top of the chat.'); return false; }
        el.scrollIntoView({ block: 'center', behavior: 'smooth' }); el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 1500); return true;
    }
    function startReply(mid) { const m = S.msgs.find(x => x.id === Number(mid)); if (!m) return; S.reply = { id: m.id, name: m.mine ? 'yourself' : m.name, text: String(m.text).slice(0, 100) }; S.editing = null; renderBars(); const t = $('cx-text'); if (t) t.focus(); }
    function startEdit(m) { S.editing = { id: m.id, text: m.text }; S.reply = null; renderBars(); const t = $('cx-text'); if (t) { t.value = m.text; t.style.height = Math.min(110, t.scrollHeight) + 'px'; t.focus(); } }
    function moreMenu(anchor, mid) {
        const m = S.msgs.find(x => x.id === Number(mid)); if (!m || !S.info) return; const i = S.info, items = [];
        items.push({ label: 'Copy text', ico: ICO.copy, run: async () => { try { await navigator.clipboard.writeText(m.text); toast('Copied.'); } catch (e) { toast('Could not copy.'); } } });
        if (canEdit(m)) items.push({ label: 'Edit message', ico: ICO.edit, run: () => startEdit(m) });
        if (i.kind === 'dm' || i.owner) items.push({ label: m.pinned ? 'Unpin' : 'Pin to the chat', ico: ICO.pin, run: async () => { const r = await soc('pin', { id: m.id, on: !m.pinned }); if (!r || !r.ok) return toast(err(r)); await pull(true); } });
        if (m.mine || i.owner) items.push({ label: 'Delete', bad: true, ico: ICO.x, run: async () => { if (!await showConfirm('Delete this message?', 'It is removed for everyone in the chat.')) return; const r = await soc('del', { id: m.id }); if (!r || !r.ok) return toast(err(r)); await pull(true); } });
        if (!m.mine) items.push({ label: 'Report', bad: true, ico: ICO.flag, run: async () => { const why = await promptText('Report this message', 'What is wrong with it? A moderator will take a look.'); if (!why) return; const r = await soc('report', { uid: m.uid, conv: S.conv, msgId: m.id, reason: why }); toast(r && r.ok ? 'Thanks, your report was sent.' : err(r)); } });
        showMenu(anchor, items);
    }
    // photos and GIFs: pick, paste or drop one. Pictures are shrunk first so they send fast.
    const b64 = (blob) => new Promise((res) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.onerror = () => res(''); r.readAsDataURL(blob); });
    async function shrinkImage(file) {
        if (file.type === 'image/gif') { if (file.size > 950000) return null; return { mime: 'image/gif', data: await b64(file), w: 0, h: 0, local: URL.createObjectURL(file) }; }
        const bmp = await createImageBitmap(file), sc = Math.min(1, 1280 / Math.max(bmp.width, bmp.height)), cv = document.createElement('canvas'); cv.width = Math.max(1, Math.round(bmp.width * sc)); cv.height = Math.max(1, Math.round(bmp.height * sc));
        const cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height); cx.drawImage(bmp, 0, 0, cv.width, cv.height);
        let q = 0.86, blob; do { blob = await new Promise((r) => cv.toBlob(r, 'image/jpeg', q)); q -= 0.12; } while (blob && blob.size > 900000 && q > 0.3);
        return blob ? { mime: 'image/jpeg', data: await b64(blob), w: cv.width, h: cv.height, local: URL.createObjectURL(blob) } : null;
    }
    async function sendPhoto(file) {
        if (!S.conv || !file) return; if (!/^image\/(jpeg|png|gif|webp)$/.test(file.type)) return toast('Pick a JPG, PNG, GIF or WebP picture.');
        let f = null; try { f = await shrinkImage(file); } catch (e) { }
        if (!f || !f.data) return toast('That picture could not be sent. GIFs can be up to 1 MB.');
        const ta = $('cx-text'), cap = ta ? ta.value.trim() : ''; if (ta && cap) { ta.value = ''; ta.style.height = '40px'; delete drafts[S.conv]; }
        sendNow(null, { kind: 'image', text: cap || '\ud83d\udcf7 Photo', data: { w: f.w, h: f.h }, upload: { mime: f.mime, data: f.data }, localSrc: f.local });
    }
    function pickPhoto() { let inp = document.getElementById('cx-file'); if (!inp) { inp = document.createElement('input'); inp.type = 'file'; inp.id = 'cx-file'; inp.accept = 'image/png,image/jpeg,image/gif,image/webp'; inp.style.display = 'none'; inp.onchange = () => { const f = inp.files && inp.files[0]; inp.value = ''; if (f) sendPhoto(f); }; document.body.appendChild(inp); } inp.click(); }
    // voice messages: record, then send or cancel (up to 60 seconds)
    async function startVoice() {
        if (S.rec || !S.conv) return; let stream;
        try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (e) { return toast('SteamLite could not use a microphone. Check that one is plugged in and allowed in Windows privacy settings.'); }
        const type = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm', mr = new MediaRecorder(stream, { mimeType: type, audioBitsPerSecond: 32000 }), chunks = [];
        const rec = S.rec = { mr, t0: Date.now(), cancel: false, conv: S.conv };
        mr.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
        mr.onstop = async () => {
            clearInterval(rec.iv); stream.getTracks().forEach((t) => t.stop()); if (S.rec === rec) S.rec = null; renderBars();
            const ms = Date.now() - rec.t0; if (rec.cancel) return; if (ms < 700) return toast('That was too short.');
            const blob = new Blob(chunks, { type: 'audio/webm' }); if (blob.size > 900000) return toast('That recording is too long.');
            if (S.conv !== rec.conv) return toast('You left the chat, so the voice message was not sent.');
            sendNow(null, { kind: 'voice', text: '\ud83c\udfa4 Voice message', data: { ms }, upload: { mime: 'audio/webm', data: await b64(blob) } });
        };
        mr.start(); rec.iv = setInterval(() => { const e = $('cx-rt'); if (e) e.textContent = fmtDur(Date.now() - rec.t0); if (Date.now() - rec.t0 >= 60000) mr.state !== 'inactive' && mr.stop(); }, 250); renderBars();
    }
    const fmtDur = (ms) => { const s = Math.round(ms / 1000); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); };
    // quick replies: one click sends a saved phrase
    const QR_KEY = 'sl_chat_qr', QR_DEFAULT = ['On my way \ud83c\udfc3', 'Give me 5 minutes', 'Sounds good \ud83d\udc4d', "Let's play! \ud83c\udfae", "Can't right now, later?", 'GG \ud83c\udf89'];
    const quickReplies = () => { try { const q = JSON.parse(localStorage.getItem(QR_KEY) || 'null'); return q && q.length ? q : QR_DEFAULT; } catch (e) { return QR_DEFAULT; } };
    function quickMenu(anchor) {
        const q = quickReplies(); showMenu(anchor, q.map((t) => ({ label: t, run: () => sendNow(null, { kind: 'text', text: t }) })).concat([{ sep: true }, { label: 'Add your own...', run: async () => { const t = await promptText('New quick reply', 'A short message you can send with one click.'); if (!t) return; try { localStorage.setItem(QR_KEY, JSON.stringify(q.concat([t.slice(0, 60)]).slice(-12))); } catch (e) { } toast('Saved.'); } }, { label: 'Reset to the defaults', run: () => { try { localStorage.removeItem(QR_KEY); } catch (e) { } toast('Quick replies reset.'); } }]));
    }
    // "what should we play?": the games everyone in this chat owns
    async function gameNight() {
        const i = S.info; if (!i) return; const me = S.ov && S.ov.me.uid, ms = (i.members || []).filter((m) => m.uid && m.uid !== me), names = {}; ms.forEach((m) => { names[m.uid] = m.name; });
        if (!ms.length) return toast('Nobody to compare with.'); toast('Comparing libraries...');
        const r = await feat('socNight', { uids: ms.map((m) => m.uid), names }); if (!r || !r.ok) return toast(err(r));
        if (!r.games.length) return toast('No shared games found.' + (r.skipped.length ? ' Skipped: ' + r.skipped.join(', ') + ' (private or not linked).' : ''));
        dialog('What should we play?', '<div class="cx-note" style="padding:0 0 8px">' + (r.everyone ? r.everyone + ' game' + (r.everyone === 1 ? '' : 's') + ' everyone owns.' : 'Nothing everyone owns, so these are games most of you own.') + (r.skipped.length ? ' Skipped (private or not linked): ' + E(r.skipped.join(', ')) + '.' : '') + '</div><div style="max-height:360px;overflow-y:auto">' + r.games.map((g) => '<div class="cx-row" style="cursor:default"><img src="' + cover(g.appid) + '" style="width:92px;height:43px;border-radius:6px;object-fit:cover;flex:none" onerror="this.style.visibility=\'hidden\'" alt=""><div class="cx-main"><div class="cx-name">' + E(g.name) + '</div><div class="cx-sub">' + (g.n === r.total ? 'Everyone owns it' : g.n + ' of ' + r.total + ' own it') + '</div></div><button class="cx-mini pri" data-sug="' + g.appid + '">Suggest</button></div>').join('') + '</div><div class="cx-btns" style="padding:12px 0 0;justify-content:flex-end"><button class="cx-mini" id="gn-no">Close</button></div>', (ov, done) => {
            ov.onclick = (e) => { const b = e.target.closest('[data-sug]'); if (b) { const g = r.games.find((x) => String(x.appid) === b.dataset.sug); done(null); if (g) sendNow(null, { kind: 'game', text: 'Shared a game: ' + g.name, data: { appid: g.appid, name: g.name, hours: g.hours } }); } else if (e.target.id === 'gn-no' || e.target === ov) done(null); };
        });
    }
    // link previews (the server fetches the page title and picture)
    // SteamLite Mobile: a small dismissible card above the chat list, and a tile with the download link
    const MOB_URL = 'https://github.com/imnotfisy/SteamLite-Mobile/releases/latest', MOB_KEY = 'sl_mobile_promo';
    (function () { const st = document.createElement('style'); st.textContent = '.cx-mob{position:relative;margin:0 0 10px;padding:12px 38px 12px 12px;border-radius:14px;background:linear-gradient(135deg,color-mix(in srgb,var(--accent-color) 38%,transparent),rgba(255,255,255,.05));border:1px solid color-mix(in srgb,var(--accent-color) 45%,transparent)}.cx-mob b{display:block;font-size:13px}.cx-mob span{display:block;font-size:12px;opacity:.8;margin:2px 0 8px}.cx-mob .x{position:absolute;right:6px;top:6px;background:transparent;border:0;color:inherit;opacity:.6;cursor:pointer;padding:4px;border-radius:6px}.cx-mob .x:hover{opacity:1;background:rgba(255,255,255,.1)}'; document.head.appendChild(st); })();
    const mobHidden = () => { try { return localStorage.getItem(MOB_KEY) === '1'; } catch (e) { return false; } };
    const mobCard = () => mobHidden() ? '' : '<div class="cx-mob"><button class="x" data-a="mobhide" title="Hide this">' + ICO.x + '</button><b>SteamLite Mobile is here</b><span>Your chats, friends, library and themes on your Android phone, with notifications.</span><button class="cx-mini pri" data-a="mobget">Get the app</button></div>';
    function mobOpen() {
        dialog('SteamLite Mobile for Android', '<div style="text-align:center;padding:4px 0 10px"><div style="font-size:42px;line-height:1">\ud83d\udcf1</div></div><div class="cx-note" style="padding:0 0 10px;line-height:1.5">Take SteamLite with you. Sign in with the same Steam account and you get:<br>\u2022 Your messages, with photos and voice, and notifications<br>\u2022 Friends, challenges and "what should we play?"<br>\u2022 Your library and wishlist<br>\u2022 Browse and publish themes</div><div class="cx-btns" style="padding:6px 0 0;justify-content:flex-end"><button class="cx-mini" id="mb-no">Not now</button><button class="cx-mini pri" id="mb-go">Download for Android</button></div>', (ov, done) => {
            ov.querySelector('#mb-go').onclick = () => { try { api.openExternal(MOB_URL); } catch (e) { } done(null); }; ov.querySelector('#mb-no').onclick = () => done(null);
        });
    }
    const UF = {};
    const firstUrl = (t) => { const m = /https:\/\/[^\s<]{3,220}/.exec(String(t || '')); return m ? m[0].replace(/[.,!?)]+$/, '') : ''; };
    function previewHtml(text) {
        const u = firstUrl(text); if (!u) return ''; const p = UF[u];
        if (p === undefined) { UF[u] = null; soc('unfurl', { u }).then((r) => { UF[u] = r && r.ok ? r : false; if (S.conv) renderMsgs(true); }).catch(() => { UF[u] = false; }); return ''; }
        return p ? '<a href="#" class="cx-link cx-lp" data-url="' + E(u) + '">' + (p.image ? '<img src="' + E(p.image) + '" alt="" onerror="this.remove()">' : '') + '<div><b>' + E(p.title) + '</b>' + (p.desc ? '<span>' + E(p.desc.slice(0, 120)) + '</span>' : '') + '<span>' + E(p.host) + '</span></div></a>' : '';
    }
    // pinned chats stay at the top of the list
    const PIN_KEY = 'sl_chat_pins', pinnedChats = () => { try { return JSON.parse(localStorage.getItem(PIN_KEY) || '[]'); } catch (e) { return []; } };
    const pinSort = (arr) => { const p = pinnedChats(); return arr.slice().sort((a, b) => (p.includes(b.id) ? 1 : 0) - (p.includes(a.id) ? 1 : 0)); };
    function togglePin(id) { let p = pinnedChats(); p = p.includes(id) ? p.filter((x) => x !== id) : p.concat([id]).slice(-5); try { localStorage.setItem(PIN_KEY, JSON.stringify(p)); } catch (e) { } renderLeft(true); }
    async function shareGame() { if (!window.SLPeople) return; const g = await SLPeople.pickGame(); if (!g) return; sendNow(null, { kind: 'game', text: 'Shared a game: ' + g.name, data: { appid: g.appid, name: g.name, hours: g.hours } }); }
    async function shareList() { if (!window.SLPeople) return; const l = await SLPeople.chooseList(); if (!l) return; sendNow(null, { kind: 'list', text: 'Shared a list: ' + l.title, data: { id: l.id, title: l.title } }); }
    async function onRight(e) {
        const t = e.target;
        const lk = t.closest('.cx-link'); if (lk) { e.preventDefault(); try { api.openExternal(lk.dataset.url); } catch (er) { } return; }
        const pr = t.closest('[data-prof]'); if (pr && pr.dataset.prof && !t.closest('[data-k]') && window.SLPeople) { SLPeople.openProfile(pr.dataset.prof); return; }
        const qr = t.closest('[data-qr]'); if (qr) { react(qr.dataset.qr, qr.dataset.e); return; }
        const re = t.closest('[data-re]'); if (re) { react(re.dataset.re, re.dataset.e); return; }
        const rm = t.closest('[data-rmore]'); if (rm) { showReactPicker(rm, rm.dataset.rmore); return; }
        const rp0 = t.closest('[data-reply]'); if (rp0) { startReply(rp0.dataset.reply); return; }
        const mo = t.closest('[data-more]'); if (mo) { moreMenu(mo, mo.dataset.more); return; }
        const qu = t.closest('[data-q]'); if (qu) { scrollToMsg(qu.dataset.q); return; }
        const jp = t.closest('[data-jump]'); if (jp) { scrollToMsg(jp.dataset.jump); return; }
        const by = t.closest('[data-buy]'); if (by) { try { api.openExternal(SLPeople.storeUrl(by.dataset.buy)); } catch (er) { } return; }
        const sto = t.closest('[data-store]'); if (sto) { try { api.openExternal(SLPeople.storeUrl(sto.dataset.store)); } catch (er) { } return; }
        const pl = t.closest('[data-play]'); if (pl) { const g = ownedGame(pl.dataset.play); if (g && SLF.launch) { await SLF.launch(g); toast('Launching ' + g.name + '...'); } return; }
        const ls = t.closest('[data-list]'); if (ls && ls.dataset.list && window.SLPeople) { SLPeople.openList(ls.dataset.list); return; }
        const a = t.closest('[data-a]'), d = t.closest('[data-d]'), k = t.closest('[data-k]'), pk = t.closest('[data-g]'), rt = t.closest('[data-retry]'), dr = t.closest('[data-drop]');
        if (rt) { sendNow(rt.dataset.retry); return; }
        if (dr) { S.msgs = S.msgs.filter(m => String(m.id) !== dr.dataset.drop); renderMsgs(); return; }
        if (k) { if (!await showConfirm('Remove from the group?', '')) return; const r = await soc('groupRemove', { conv: S.conv, uid: k.dataset.k }); if (!r || !r.ok) return toast(err(r)); await pull(true); renderPanel(); return; }
        if (pk) return;
        if (!a) return; const op = a.dataset.a, i = S.info;
        if (op === 'send') sendNow();
        else if (op === 'earlier') loadEarlier();
        else if (op === 'pill') { const ms = $('cx-msgs'); if (ms) ms.scrollTo({ top: ms.scrollHeight, behavior: 'smooth' }); S.pill = 0; paintPill(); }
        else if (op === 'back') { saveDraft(); const ch = $('chat-modal'); if (ch) ch.classList.remove('in-conv'); S.conv = null; S.grp = null; clearTimeout(S.convTimer); renderLeft(true); renderRight(); }
        else if (op === 'members') { S.panel = S.panel === 'members' ? '' : 'members'; renderPanel(); }
        else if (op === 'search') { S.panel = S.panel === 'search' ? '' : 'search'; S.sres = null; renderPanel(); const b = $('cx-head') && $('cx-head').querySelector('[data-a=search]'); if (b) b.classList.toggle('on', S.panel === 'search'); }
        else if (op === 'pins') { S.panel = S.panel === 'pins' ? '' : 'pins'; renderPanel(); }
        else if (op === 'mute') { const on = !i.muted; i.muted = on; updateMeta(); const r = await soc('mute', { conv: S.conv, on }); if (!r || !r.ok) { i.muted = !on; updateMeta(); return toast(err(r)); } toast(on ? 'Notifications are off for this chat.' : 'Notifications are on for this chat.'); loadOv(true).then(() => renderLeft(true)); }
        else if (op === 'peermenu') showMenu(a, [{ label: 'View profile', ico: ICO.user, run: () => window.SLPeople && SLPeople.openProfile(i.peerUid) }, { sep: true }, { label: 'Unfriend', run: async () => { if (!await showConfirm('Remove this friend?', 'You can not message each other and the streak ends.')) return; const r = await soc('unfriend', { uid: i.peerUid }); if (!r || !r.ok) return toast(err(r)); await loadOv(true); await pull(true); renderRight(true); renderLeft(true); } }, { label: 'Block', bad: true, run: async () => { if (!await showConfirm('Block this player?', 'They are removed from your friends and can not message you or add you again. You can unblock them later.')) return; const r = await soc('block', { uid: i.peerUid }); if (!r || !r.ok) return toast(err(r)); S.conv = null; S.info = null; clearTimeout(S.convTimer); await loadOv(true); renderLeft(); renderRight(); toast('Blocked.'); } }]);
        else if (op === 'plus') showMenu(a, [{ label: 'Photo or GIF', ico: ICO.plus, run: pickPhoto }, { label: 'Voice message', ico: ICO.bell, run: startVoice }, { label: 'Quick replies', ico: ICO.send, run: () => quickMenu($('cx-right').querySelector('[data-a=plus]')) }, { sep: true }, { label: 'What should we play?', ico: ICO.game, run: gameNight }, { label: 'Share a game', ico: ICO.game, run: shareGame }, { label: 'Share a game list', ico: ICO.list, run: shareList }]);
        else if (op === 'recsend') { if (S.rec && S.rec.mr.state !== 'inactive') S.rec.mr.stop(); }
        else if (op === 'reccancel') { if (S.rec) { S.rec.cancel = true; if (S.rec.mr.state !== 'inactive') S.rec.mr.stop(); } }
        else if (op === 'emoji') { const ta = $('cx-text'); const host = $('cx-right').querySelector('.cx-compose').parentNode; if (window.SLEmoji) SLEmoji.toggle($('cx-right'), (em) => { if (!ta) return; const s0 = ta.selectionStart || ta.value.length, s1 = ta.selectionEnd || s0; ta.value = ta.value.slice(0, s0) + em + ta.value.slice(s1); const p = s0 + em.length; ta.focus(); ta.setSelectionRange(p, p); ta.dispatchEvent(new Event('input', { bubbles: true })); }); }
        else if (op === 'cancelbar') { S.reply = null; S.editing = null; const ta = $('cx-text'); if (ta && S.editing === null) { /* keep what was typed */ } renderBars(); }
        else if (op === 'leave') { if (!await showConfirm('Leave this group?', 'You will not see its messages any more.')) return; const r = await soc('groupRemove', { conv: S.conv, uid: S.ov.me.uid }); if (!r || !r.ok) return toast(err(r)); S.conv = null; S.info = null; clearTimeout(S.convTimer); await loadOv(true); renderLeft(); renderRight(); }
        else if (op === 'rename') { const nm = await promptText('Rename the group', 'New name', i.name); if (!nm) return; const r = await soc('groupRename', { conv: S.conv, name: nm }); if (!r || !r.ok) return toast(err(r)); await pull(true); renderRight(true); loadOv(true).then(() => renderLeft(true)); }
        else if (op === 'addmember') {
            const inG = new Set(i.members.map(m => m.uid)), cand = S.ov.friends.filter(f => !inG.has(f.uid)); if (!cand.length) return toast('All your friends are already in this group.');
            const pickd = await promptChoice('Add a friend to the group', cand.map(f => ({ id: f.uid, name: f.name }))); if (!pickd) return;
            const r = await soc('groupAdd', { conv: S.conv, uid: pickd }); toast(r && r.ok ? 'Added.' : err(r)); await pull(true); renderPanel();
        }
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

    SLF.safe && SLF.safe('mobile', () => SLF.addTile('Social', '\ud83d\udcf1', 'SteamLite Mobile', 'Get SteamLite on your Android phone: messages, friends, library and themes.', () => mobOpen()));
    SLF.safe && SLF.safe('chat', () => SLF.addTile('Social', '💬', 'Messages', 'Chat with friends who use SteamLite, make group chats and keep friend streaks going.', () => openChat()));
})();
