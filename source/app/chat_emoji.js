// SteamLite 9.2.4 - the emoji picker and shortcodes used by Messages. The emoji are plain text, so they work everywhere.
(function () {
    'use strict';
    const sp = (s) => s.split(' ').filter(Boolean);
    const CATS = [
        { n: 'Smileys', i: '😀', e: sp('😀 😃 😄 😁 😆 😅 🤣 😂 🙂 🙃 😉 😊 😇 🥰 😍 🤩 😘 😗 😚 😋 😛 😜 🤪 😝 🤑 🤗 🤭 🤫 🤔 🤐 🤨 😐 😑 😶 😏 😒 🙄 😬 😌 😔 😪 🤤 😴 😷 🤒 🤕 🤢 🤮 🥵 🥶 🥴 😵 🤯 🤠 🥳 😎 🤓 🧐 😕 😟 🙁 😮 😯 😲 😳 🥺 🥹 😦 😧 😨 😰 😥 😢 😭 😱 😖 😣 😞 😓 😩 😫 🥱 😤 😡 😠 🤬 😈 👿 💀 ☠️ 💩 🤡 👻 👽 👾 🤖 😺 😸 😹 😻 🙈 🙉 🙊') },
        { n: 'People', i: '👍', e: sp('👍 👎 👌 🤌 ✌️ 🤞 🤟 🤘 🤙 👈 👉 👆 👇 ☝️ ✋ 🤚 🖐️ 🖖 👋 🤝 🙏 👏 🙌 🤲 💪 🦾 🫶 🫡 🫠 🧠 👀 👁️ 👅 👄 🗣️ 🧑‍💻 🥷 🦸 🧙 🧛 🧟 🕺 💃 🤷 🤦 🙋 🙇') },
        { n: 'Hearts', i: '❤️', e: sp('❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝 💯 💢 💥 💫 💦 💨 💬 ✨ ⭐ 🌟 🔥 🎉 🎊 ✅ ❌ ⚠️ ❓ ❗ ➕ ➖ ♻️ 🔔 🔕 🔒 🔓') },
        { n: 'Gaming', i: '🎮', e: sp('🎮 🕹️ 👾 🎲 ♟️ 🎯 🏆 🥇 🥈 🥉 🏅 🎰 🃏 🧩 🎧 🎤 🎸 🥁 🎬 🍿 📺 🖥️ 💻 ⌨️ 🖱️ 🔫 ⚔️ 🛡️ 💣 🧨 🪄 🗡️ 🏹 🧪 🧬 🔮 💎 👑 🪙 🗝️ 🚀 🛸 🏰 🐉 🧟‍♂️ 🕷️ 🦇 🎃') },
        { n: 'Animals', i: '🐶', e: sp('🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🐔 🐧 🐦 🦆 🦅 🦉 🐺 🐗 🐴 🦄 🐝 🐛 🦋 🐌 🐞 🐢 🐍 🐙 🦑 🦀 🐠 🐬 🐳 🦈 🐊 🦖 🦕') },
        { n: 'Food', i: '🍕', e: sp('🍎 🍊 🍌 🍉 🍇 🍓 🍑 🍒 🥑 🍔 🍟 🍕 🌭 🌮 🍣 🍜 🍝 🍰 🎂 🍪 🍩 🍫 🍿 ☕ 🍵 🍺 🍻 🥂 🍷 🥤 🧋 🍦') },
        { n: 'Things', i: '🌈', e: sp('🌈 ☀️ 🌙 🌍 🌸 🌹 🌲 🍀 ⚡ ❄️ 🎁 🎈 📱 💡 🛒 💰 💸 🏠 🚗 ✈️ ⏰ 📅 📌 📎 🔧 🔨 🧰 🔑') }
    ];
    const SHORT = { ':smile:': '😄', ':grin:': '😁', ':joy:': '😂', ':lol:': '🤣', ':wink:': '😉', ':blush:': '😊', ':heart_eyes:': '😍', ':kiss:': '😘', ':thinking:': '🤔', ':cool:': '😎', ':sob:': '😭', ':cry:': '😢', ':angry:': '😡', ':scream:': '😱', ':sleep:': '😴', ':skull:': '💀', ':ghost:': '👻', ':clown:': '🤡', ':thumbsup:': '👍', ':thumbsdown:': '👎', ':ok:': '👌', ':clap:': '👏', ':pray:': '🙏', ':wave:': '👋', ':muscle:': '💪', ':fire:': '🔥', ':heart:': '❤️', ':broken_heart:': '💔', ':100:': '💯', ':star:': '⭐', ':sparkles:': '✨', ':party:': '🎉', ':tada:': '🎉', ':gg:': '🎮', ':game:': '🎮', ':trophy:': '🏆', ':crown:': '👑', ':eyes:': '👀', ':rocket:': '🚀', ':check:': '✅', ':x:': '❌', ':pizza:': '🍕', ':beer:': '🍺', ':coffee:': '☕', ':cat:': '🐱', ':dog:': '🐶', ':gem:': '💎', ':sword:': '⚔️', ':shield:': '🛡️', ':bomb:': '💣', ':ghost_game:': '👾', ':pog:': '😮', ':gigachad:': '😎' };
    const EMOTICON = { ':)': '🙂', ':-)': '🙂', ':D': '😄', ':-D': '😄', ';)': '😉', ';-)': '😉', ':(': '🙁', ':-(': '🙁', ":'(": '😢', ':P': '😛', ':-P': '😛', ':p': '😛', ':O': '😮', ':o': '😮', '<3': '❤️', '</3': '💔', 'xD': '😆', 'XD': '😆', ':/': '😕', 'B)': '😎', ':*': '😘' };
    const recent = () => { try { return JSON.parse(localStorage.getItem('sl_emoji_recent') || '[]').slice(0, 24); } catch (e) { return []; } };
    const remember = (e) => { try { const r = [e].concat(recent().filter(x => x !== e)).slice(0, 24); localStorage.setItem('sl_emoji_recent', JSON.stringify(r)); } catch (er) { } };
    // turns :shortcodes: and, after a space, :) style faces into emoji. Returns the new text and where the caret should go.
    function convert(text, caret) {
        let out = text, c = caret;
        out = out.replace(/:[a-z0-9_+-]{2,20}:/g, (m, off) => { const e = SHORT[m]; if (!e) return m; if (off < c) c += e.length - m.length; return e; });
        out = out.replace(/(^|\s)(:-?\)|:-?D|;-?\)|:-?\(|:'\(|:-?[Pp]|:[Oo]|<3|<\/3|[xX]D|:\/|B\)|:\*)(?=\s)/g, (m, pre, face, off) => { const e = EMOTICON[face]; if (!e) return m; if (off < c) c += e.length - face.length; return pre + e; });
        return { text: out, caret: Math.max(0, Math.min(out.length, c)) };
    }
    const EMOJI_ONLY = /^(?:\s*(?:\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic}|\p{Emoji_Modifier})*)\s*){1,3}$/u;
    const isJumbo = (t) => EMOJI_ONLY.test(String(t || '')) && String(t).trim().length > 0;

    const css = document.createElement('style');
    css.textContent = `
    .cx-emoji { position: absolute; left: 12px; bottom: 66px; z-index: 30; width: 330px; max-width: calc(100% - 24px); border-radius: 18px; background: var(--bg-dark, #111); border: 1px solid var(--border-glass); box-shadow: 0 20px 50px rgba(0, 0, 0, .55); overflow: hidden; animation: cxPop .2s cubic-bezier(.2, 1.3, .3, 1) both; transform-origin: bottom left; }
    @keyframes cxPop { from { opacity: 0; transform: translateY(8px) scale(.94); } to { opacity: 1; transform: none; } }
    .cx-emoji-tabs { display: flex; gap: 2px; padding: 6px 8px 0; border-bottom: 1px solid var(--border-glass); overflow-x: auto; } .cx-emoji-tabs button { flex: none; width: 34px; height: 32px; border: 0; background: transparent; border-radius: 10px 10px 0 0; font-size: 17px; cursor: pointer; opacity: .55; border-bottom: 2px solid transparent; } .cx-emoji-tabs button.on { opacity: 1; border-bottom-color: var(--accent-color); }
    .cx-emoji-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 2px; padding: 8px; max-height: 232px; overflow-y: auto; } .cx-emoji-grid button { aspect-ratio: 1; border: 0; background: transparent; border-radius: 9px; font-size: 21px; cursor: pointer; transition: transform .12s, background .12s; } .cx-emoji-grid button:hover { background: var(--bg-glass); transform: scale(1.18); }
    .cx-emoji-name { padding: 2px 12px 8px; font-size: 10.5px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: var(--text-tertiary); }
    body.reduce-animations .cx-emoji { animation: none; }
    `;
    document.head.appendChild(css);

    function toggle(host, onPick) {
        const old = host.querySelector('.cx-emoji'); if (old) { old.remove(); return false; }
        const box = document.createElement('div'); box.className = 'cx-emoji'; box.setAttribute('data-no-icons', '');
        const cats = [{ n: 'Recent', i: '🕘', e: recent() }].concat(CATS); let cur = recent().length ? 0 : 1;
        const paint = () => { const c = cats[cur]; box.innerHTML = '<div class="cx-emoji-tabs">' + cats.map((x, k) => '<button data-c="' + k + '" class="' + (k === cur ? 'on' : '') + '" title="' + x.n + '">' + x.i + '</button>').join('') + '</div><div class="cx-emoji-name">' + c.n + '</div><div class="cx-emoji-grid">' + (c.e.length ? c.e.map(e => '<button data-e="' + e + '">' + e + '</button>').join('') : '<div style="grid-column:1/-1;padding:18px;text-align:center;font-size:12px;color:var(--text-secondary)">Emoji you use show up here.</div>') + '</div>'; };
        paint(); host.appendChild(box);
        box.addEventListener('click', (ev) => { const t = ev.target.closest('[data-c]'), e = ev.target.closest('[data-e]'); if (t) { cur = Number(t.dataset.c); paint(); } else if (e) { remember(e.dataset.e); onPick(e.dataset.e); } });
        const away = (ev) => { if (!box.isConnected) { document.removeEventListener('mousedown', away, true); document.removeEventListener('keydown', esc, true); return; } if (!box.contains(ev.target) && !ev.target.closest('[data-a="emoji"]')) { box.remove(); document.removeEventListener('mousedown', away, true); document.removeEventListener('keydown', esc, true); } };
        const esc = (ev) => { if (ev.key === 'Escape' && box.isConnected) { ev.stopPropagation(); box.remove(); document.removeEventListener('mousedown', away, true); document.removeEventListener('keydown', esc, true); } };
        setTimeout(() => { document.addEventListener('mousedown', away, true); document.addEventListener('keydown', esc, true); }, 0);
        return true;
    }
    window.SLEmoji = { toggle, convert, isJumbo, recent, remember, QUICK: ['👍', '❤️', '😂', '😮', '😢', '🔥'] };
})();
