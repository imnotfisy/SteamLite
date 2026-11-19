<script>
  import { fade, scale } from 'svelte/transition';
  import { expoOut } from 'svelte/easing';
  import { S, api, toast, loadLibrary, refreshAccounts } from '../lib/state.svelte.js';
  import { escape } from '../lib/actions.js';
  import SteamLogin from './SteamLogin.svelte';
  import Icon from './Icon.svelte';
  // "Add an account": a dialog in the middle of the screen, opened from the account menu and from Settings
  const close = () => { api('account:steamLoginCancel'); S.addAccount = false; };
  async function done(r) {
    S.steamId = r.steamId || (await api('app:boot')).steamId; S.games = []; S.favorites = []; S.hidden = []; S.collections = {};
    await refreshAccounts(); loadLibrary(); S.addAccount = false; toast('Added ' + (r.name || 'the account') + '.');
  }
</script>

<div class="back" role="presentation" onclick={close} transition:fade={{ duration: 250 }} use:escape={close}>
  <div class="dlg glass" role="dialog" tabindex="-1" aria-label="Add an account" onclick={(e) => e.stopPropagation()} onkeydown={() => { }} in:scale={{ start: 0.92, duration: 450, easing: expoOut }}>
    <button class="x btn icon sm" aria-label="Close" onclick={close}><Icon name="x" size={16} /></button>
    <img class="logo" src="/icon.png" alt="" draggable="false" />
    <h2>Add an account</h2>
    <p class="muted">Sign in with another Steam account. Each account keeps its own play time and favorites, and you can switch between them from your picture at the top right.</p>
    <SteamLogin keep onDone={done} onCancel={close} />
  </div>
</div>

<style>
  .back { position: fixed; inset: 0; z-index: 150; display: grid; place-items: center; background: rgba(4, 5, 8, 0.7); backdrop-filter: blur(10px); }
  .dlg { position: relative; width: min(440px, calc(100vw - 48px)); padding: 38px 34px 32px; display: grid; gap: 14px; justify-items: stretch; text-align: center; border-radius: 28px; background: rgba(18, 20, 28, 0.94); box-shadow: var(--shadow-lg); }
  .logo { width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 4px;  }
  h2 { font-size: 26px; } p { line-height: 1.55; font-size: 13.5px; }
  .x { position: absolute; right: 14px; top: 14px; }
</style>
