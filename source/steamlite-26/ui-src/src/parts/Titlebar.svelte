<script>
  import { fly } from 'svelte/transition';
  import { expoOut } from 'svelte/easing';
  import { S, A, go, refreshAccounts, switchAccount, signOutAll } from '../lib/state.svelte.js';
  import { escape } from '../lib/actions.js';
  import Icon from './Icon.svelte';
  // show the picture only while the app itself is showing (not on the opening screen or the sign-in page)
  let { showMe = false } = $props();
  let open = $state(false);
  const me = $derived(A.profiles.find((p) => p.steamId === A.activeId) || A.profiles[0]);
  const initial = (n) => ((n || '?').trim()[0] || '?').toUpperCase();
  const toggle = () => { open = !open; if (open) refreshAccounts(); };
  const pick = async (id) => { open = false; if (id !== A.activeId) await switchAccount(id); };
  const goto = (v) => { open = false; go(v); };
  const out = async () => { open = false; await signOutAll(); };
</script>

<div class="bar" data-tauri-drag-region>
  <div class="grow" data-tauri-drag-region></div>
  {#if showMe && me}
    <button class="me" class:open aria-label="Account menu" aria-expanded={open} onclick={toggle} title={me.name}>
      {#if me.avatar}<img src={me.avatar} alt="" draggable="false" />{:else}<span>{initial(me.name)}</span>{/if}
      <i class="dot"></i>
    </button>
  {/if}
  <div class="btns">
    <button aria-label="Minimize" onclick={() => window.sl.minimize()}><svg width="11" height="11" viewBox="0 0 12 12"><path d="M2 6h8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg></button>
    <button class="x" aria-label="Close" onclick={() => (S.running && S.settings.confirmClose !== false && !S.settings.closeToTray ? (S.confirmClose = true) : window.sl.close())}><svg width="11" height="11" viewBox="0 0 12 12"><path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg></button>
  </div>
</div>

{#if open && showMe}
  <div class="scrim" role="presentation" onclick={() => (open = false)} use:escape={() => (open = false)}></div>
  <div class="menu glass" role="menu" transition:fly={{ y: -14, duration: 380, easing: expoOut }}>
    <div class="hd">Accounts</div>
    {#each A.profiles as p, i (p.steamId)}
      <button class="acc" class:cur={p.steamId === A.activeId} role="menuitem" style="--i:{i}" onclick={() => pick(p.steamId)}>
        <span class="av">{#if p.avatar}<img src={p.avatar} alt="" draggable="false" />{:else}<b>{initial(p.name)}</b>{/if}</span>
        <span class="nm ellipsis">{p.name || p.steamId}<small>{p.steamId === A.activeId ? 'Signed in' : 'Switch to this account'}</small></span>
        {#if p.steamId === A.activeId}<span class="ck"><Icon name="check" size={16} stroke={3} /></span>{/if}
      </button>
    {/each}
    <div class="sep"></div>
    <button class="it" role="menuitem" onclick={() => goto('profile')}><Icon name="user" size={18} />View profile</button>
    <button class="it" role="menuitem" onclick={() => { open = false; S.addAccount = true; }}><Icon name="plus" size={18} />Add another account</button>
    <button class="it bad" role="menuitem" onclick={out}><Icon name="logout" size={18} />Sign out</button>
  </div>
{/if}

<style>
  .bar { position: fixed; top: 0; left: 0; right: 0; height: 40px; display: flex; align-items: flex-start; justify-content: flex-end; gap: 8px; z-index: 60; pointer-events: auto; }
  .grow { flex: 1; height: 100%; }
  .btns { display: flex; margin: 6px 10px 0 0; padding: 2px; gap: 2px; border-radius: 12px; background: var(--rail); border: 1px solid var(--line); }
  .btns button { width: 38px; height: 26px; border-radius: 9px; display: grid; place-items: center; color: var(--muted); transition: background .15s, color .15s; }
  .btns button:hover { background: var(--s3); color: var(--text); } .btns .x:hover { background: #e5384f; color: white; }
  .me { position: relative; margin-top: 4px; width: 32px; height: 32px; border-radius: 50%; padding: 0; background: linear-gradient(135deg, var(--glow), var(--accent2)); border: 2px solid var(--line2); display: grid; place-items: center; overflow: visible; transition: transform .35s var(--spring), border-color .25s, box-shadow .35s; animation: pop .6s var(--spring) both; }
  .me:hover, .me.open { border-color: var(--accent); }
  .me img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; } .me span { font-weight: 800; font-size: 13px; color: var(--accent-ink); }
  .dot { position: absolute; right: -2px; bottom: -2px; width: 11px; height: 11px; border-radius: 50%; background: var(--good); border: 2px solid #0b0d12; }
  .scrim { position: fixed; inset: 0; z-index: 58; }
  .menu { position: fixed; top: 46px; right: 10px; z-index: 62; width: 310px; padding: 10px; border-radius: 22px; background: rgba(16, 18, 26, 0.92); box-shadow: var(--shadow-lg); display: grid; gap: 2px; transform-origin: top right; }
  .hd { padding: 8px 12px 6px; font-size: 11.5px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--faint); }
  .acc { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 15px; text-align: left; transition: background .2s, transform .3s var(--spring); animation: pop .5s var(--spring) both; animation-delay: calc(80ms + var(--i) * 50ms); }
  .acc:hover { background: var(--s2); transform: translateX(3px); } .acc.cur { background: color-mix(in srgb, var(--glow) 14%, transparent); }
  .av { width: 42px; height: 42px; border-radius: 50%; overflow: hidden; flex: none; display: grid; place-items: center; background: linear-gradient(135deg, var(--glow), var(--accent2)); } .av img { width: 100%; height: 100%; object-fit: cover; } .av b { color: var(--accent-ink); font-size: 17px; }
  .nm { flex: 1; min-width: 0; font-weight: 650; } .nm small { display: block; font-weight: 500; font-size: 12px; color: var(--faint); }
  .ck { color: var(--good); display: grid; }
  .sep { height: 1px; background: var(--line); margin: 6px 4px; }
  .it { display: flex; align-items: center; gap: 12px; padding: 11px 12px; border-radius: 13px; font-weight: 600; color: var(--muted); text-align: left; transition: background .2s, color .2s, transform .3s var(--spring); } .it:hover { background: var(--s2); color: var(--text); transform: translateX(3px); } .it.bad:hover { color: var(--bad); background: color-mix(in srgb, var(--bad) 12%, transparent); }
</style>
