<script>
  import { fade, scale } from 'svelte/transition';
  import { expoOut } from 'svelte/easing';
  import { api, toast, loadLibrary } from '../lib/state.svelte.js';
  import { escape } from '../lib/actions.js';
  import Icon from './Icon.svelte';
  let { onclose } = $props();
  let name = $state(''), exe = $state(''), args = $state(''), busy = $state(false);
  async function choose() { const p = await api('dialog:exe'); if (p) { exe = p; if (!name) name = p.split('\\').pop().replace(/\.exe$/i, '').replace(/[_-]+/g, ' '); } }
  async function add() {
    busy = true; const r = await api('nonsteam:add', { name, exe, args }); busy = false;
    if (!r.ok) return toast(r.error, 'bad');
    await loadLibrary(); toast(name + ' was added.'); onclose();
  }
</script>

<div class="back" role="presentation" onclick={onclose} transition:fade={{ duration: 250 }} use:escape={onclose}>
  <div class="dlg glass" role="dialog" tabindex="-1" aria-label="Add a non-Steam game" onclick={(e) => e.stopPropagation()} onkeydown={() => { }} in:scale={{ start: 0.92, duration: 450, easing: expoOut }}>
    <div class="row"><h2 class="grow">Add a game</h2><button class="btn icon sm" aria-label="Close" onclick={onclose}><Icon name="x" size={16} /></button></div>
    <p class="muted">Add a game that is not on Steam. SteamLite will launch it and count your play time.</p>
    <label>Game file<div class="row"><input class="grow" readonly value={exe} placeholder="Choose the game's .exe" /><button class="btn" onclick={choose}><Icon name="folder" size={17} />Browse</button></div></label>
    <label>Name<input bind:value={name} placeholder="Game name" /></label>
    <label>Launch options <span class="faint">(optional)</span><input bind:value={args} placeholder="-windowed" /></label>
    <div class="row end"><button class="btn" onclick={onclose}>Cancel</button><button class="btn primary" disabled={busy || !name || !exe} onclick={add}>Add to library</button></div>
  </div>
</div>

<style>
  .back { position: fixed; inset: 0; z-index: 150; display: grid; place-items: center; background: rgba(4, 5, 8, 0.7); backdrop-filter: blur(10px); }
  .dlg { width: min(520px, calc(100vw - 40px)); padding: 28px; display: grid; gap: 16px; border-radius: 26px; background: rgba(18, 20, 28, 0.92); box-shadow: var(--shadow-lg); }
  h2 { font-size: 24px; } label { display: grid; gap: 8px; font-weight: 600; font-size: 13px; color: var(--muted); } .end { justify-content: flex-end; margin-top: 6px; }
</style>
