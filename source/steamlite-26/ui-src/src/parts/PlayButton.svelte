<script>
  import { fly } from 'svelte/transition';
  import { S, play, stop } from '../lib/state.svelte.js';
  import { SPRING } from '../lib/magnet.js';
  import Icon from './Icon.svelte';

  // Play, Stop, Cancel (while a game is starting) and Install are ONE button that changes shape. The width glides to fit the new word, the icon
  // turns into the next one, the word slides up and the new one slides in, and a ring pulses out when the state changes.
  let { g, onInstall, installLabel = 'Install' } = $props();
  const live = $derived(!!(S.running && S.running.id === g.id));
  const st = $derived(live ? (S.running.starting ? 'cancel' : 'stop') : g.installed ? 'play' : 'install');
  const label = $derived(st === 'cancel' ? 'Cancel' : st === 'stop' ? 'Stop' : st === 'play' ? 'Play' : installLabel);
  const dl = $derived(installLabel === 'Install' ? 'download' : 'ext');
  const busy = $derived(st === 'play' && !!S.running);          // another game is running: Play waits
  const act = () => { if (st === 'play') play(g); else if (st === 'stop' || st === 'cancel') stop(g); else onInstall && onInstall(); };

  let btn, lastW = 0, pulse = $state(0), prev = '';
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'reduced';
  $effect(() => {
    const s = st; if (!btn) return;
    const w = btn.offsetWidth;
    if (prev && prev !== s) {
      pulse += 1;
      if (!reduce() && lastW && Math.abs(lastW - w) > 1) btn.animate([{ width: lastW + 'px' }, { width: w + 'px' }], { duration: 560, easing: SPRING });
    }
    prev = s; lastW = w;
  });
</script>

<span class="pb" data-st={st}>
  {#key pulse}{#if pulse > 0}<i class="burst" aria-hidden="true"></i>{/if}{/key}
  <button bind:this={btn} class="btn big pbtn" class:primary={st === 'play' || st === 'install'} class:play={st === 'play'} class:danger={st === 'stop' || st === 'cancel'} disabled={busy} onclick={act}>
    <span class="fx" aria-hidden="true"></span>
    <span class="ic" aria-hidden="true">
      <span class="i" class:on={st === 'play'}><Icon name="play" size={18} /></span>
      <span class="i" class:on={st === 'stop'}><Icon name="stop" size={16} /></span>
      <span class="i" class:on={st === 'cancel'}><Icon name="x" size={17} /></span>
      <span class="i dl" class:on={st === 'install'}><Icon name={dl} size={18} /></span>
    </span>
    <span class="lbl">{#key label}<span class="t" in:fly={{ y: 16, duration: 380, delay: 60 }} out:fly={{ y: -16, duration: 240 }}>{label}</span>{/key}</span>
  </button>
</span>

<style>
  .pb { position: relative; display: inline-flex; }
  .pbtn { overflow: hidden; gap: 10px; transition: background .3s, color .3s, box-shadow .4s, transform .18s var(--spring), border-color .2s; }
  .ic { position: relative; width: 18px; height: 18px; flex: none; display: block; }
  .i { position: absolute; inset: 0; display: grid; place-items: center; opacity: 0; transform: scale(.2) rotate(-140deg); transition: opacity .3s, transform .55s var(--spring); }
  .i.on { opacity: 1; transform: none; }
  .lbl { display: grid; } .t { grid-area: 1 / 1; white-space: nowrap; }

  /* what each icon does when you hover the button */
  .pbtn:hover .i.on :global(svg) { animation: nudge .6s var(--spring); }
  .pb[data-st='play'] .pbtn:hover .i.on { transform: translateX(2px) scale(1.12); }
  .pb[data-st='stop'] .pbtn:hover .i.on { transform: scale(1.18); }
  .pb[data-st='cancel'] .pbtn:hover .i.on { transform: rotate(90deg) scale(1.1); }
  .pb[data-st='install'] .pbtn:hover .i.dl.on :global(svg) { animation: drop .7s var(--ease) infinite; }
  @keyframes nudge { 40% { transform: scale(.85); } }
  @keyframes drop { 0% { transform: translateY(-3px); opacity: .4; } 60% { transform: translateY(2px); opacity: 1; } 100% { transform: translateY(0); } }

  /* starting: a light sweeps across the button until the game is up (Cancel is the way out) */
  .fx { position: absolute; inset: 0; pointer-events: none; opacity: 0; transition: opacity .3s; background: linear-gradient(100deg, transparent 20%, color-mix(in srgb, var(--bad) 40%, transparent) 50%, transparent 80%); background-size: 220% 100%; }
  .pb[data-st='cancel'] .fx { opacity: 1; animation: sweep 1.3s linear infinite; } @keyframes sweep { from { background-position: 150% 0; } to { background-position: -50% 0; } }
  .pb[data-st='cancel'] .i.on { animation: spin 1.6s linear infinite; } @keyframes spin { to { rotate: 360deg; } }

  /* running: the Stop button breathes, so you can tell the game is live */
  .pb[data-st='stop'] .pbtn { animation: live 2.6s ease-in-out infinite; }
  @keyframes live { 50% { box-shadow: 0 0 0 5px color-mix(in srgb, var(--bad) 22%, transparent); } }

  /* the ring that pulses out when the state changes */
  .burst { position: absolute; inset: 0; border-radius: 16px; pointer-events: none; border: 2px solid var(--play); animation: burst .85s cubic-bezier(.2, .7, .2, 1) both; }
  .pb[data-st='stop'] .burst, .pb[data-st='cancel'] .burst { border-color: var(--bad); }
  @keyframes burst { 0% { opacity: .85; transform: scale(1); } 100% { opacity: 0; transform: scale(1.5, 1.9); } }
</style>
