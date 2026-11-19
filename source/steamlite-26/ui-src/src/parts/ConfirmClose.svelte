<script>
  import { fade, scale } from 'svelte/transition';
  import { expoOut } from 'svelte/easing';
  import { S, game } from '../lib/state.svelte.js';
  import { escape } from '../lib/actions.js';
  import Icon from './Icon.svelte';
  // closing SteamLite ends the play-time count of the running game, so it asks first
  const name = $derived((S.running && (game(S.running.id) || {}).name) || (S.running && S.running.name) || 'your game');
  const no = () => { S.confirmClose = false; };
  const yes = () => window.sl.close();
</script>

<div class="back" role="presentation" onclick={no} transition:fade={{ duration: 220 }} use:escape={no}>
  <div class="dlg glass" role="alertdialog" tabindex="-1" aria-label="Close SteamLite?" onclick={(e) => e.stopPropagation()} onkeydown={() => { }} in:scale={{ start: 0.92, duration: 420, easing: expoOut }}>
    <span class="ic"><Icon name="stop" size={22} /></span>
    <h2>Close SteamLite?</h2>
    <p class="muted"><b>{name}</b> is still running. If you close SteamLite now, it stops counting your play time for this session.</p>
    <div class="row"><button class="btn" onclick={no}>Keep playing</button><button class="btn danger" onclick={yes}>Close anyway</button></div>
  </div>
</div>

<style>
  .back { position: fixed; inset: 0; z-index: 170; display: grid; place-items: center; background: rgba(4, 5, 8, 0.7); backdrop-filter: blur(8px); }
  .dlg { width: min(400px, calc(100vw - 48px)); padding: 30px; display: grid; gap: 12px; justify-items: center; text-align: center; border-radius: 26px; background: rgba(18, 20, 28, 0.95); box-shadow: var(--shadow-lg); }
  .ic { width: 52px; height: 52px; border-radius: 16px; display: grid; place-items: center; color: var(--bad); background: color-mix(in srgb, var(--bad) 16%, transparent); }
  h2 { font-size: 22px; } p { line-height: 1.55; font-size: 14px; } .row { margin-top: 8px; }
</style>
