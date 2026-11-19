<script>
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { api } from '../lib/state.svelte.js';
  import { reveal } from '../lib/actions.js';
  import Icon from './Icon.svelte';

  // "From the developer": another app by the same developer. Island is a separate program, so this is only a card with pictures and a link.
  const ISLAND_URL = 'https://github.com/imnotfisy/Island';
  const shots = [
    ['/island/game.png', 'Your game and its timer'],
    ['/island/music.png', 'The music that is playing, with buttons'],
    ['/island/download.png', 'Downloads from your browser'],
    ['/island/steam.png', 'Steam downloads, with progress']
  ];
  let i = $state(0), paused = false;
  onMount(() => { const t = setInterval(() => { if (!paused) i = (i + 1) % shots.length; }, 4200); return () => clearInterval(t); });
</script>

<div class="sech" use:reveal><h2>From the developer</h2></div>
<section class="card dev" use:reveal>
  <div class="copy">
    <div class="who"><img src="/island/icon.png" alt="" draggable="false" /><div><h3>Island</h3><div class="muted">A dynamic island for your PC</div></div></div>
    <p class="muted">A small pill at the top of your screen that shows what is happening right now. It is a separate app, free, and works with SteamLite.</p>
    <ul>
      <li>The game you are playing, with its timer and a Stop button</li>
      <li>The music that is playing, with previous, pause and next</li>
      <li>Downloads from your browser and from Steam</li>
      <li>A timer, and anything another program sends it</li>
    </ul>
    <button class="btn primary" onclick={() => api('app:openUrl', ISLAND_URL)}><Icon name="ext" size={17} />Get Island</button>
  </div>
  <div class="shots" role="presentation" onmouseenter={() => (paused = true)} onmouseleave={() => (paused = false)}>
    {#key i}<img class="shot" src={shots[i][0]} alt={shots[i][1]} draggable="false" in:fade={{ duration: 500 }} />{/key}
    <div class="cap">{shots[i][1]}</div>
    <div class="dots">{#each shots as s, n}<button aria-label={s[1]} class:on={n === i} onclick={() => (i = n)}></button>{/each}</div>
  </div>
</section>

<style>
  .dev { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr); gap: 26px; padding: 28px; align-items: center; overflow: hidden; background: linear-gradient(135deg, color-mix(in srgb, var(--glow) 12%, transparent), rgba(255, 255, 255, 0.02)); }
  .who { display: flex; align-items: center; gap: 14px; margin-bottom: 12px; } .who img { width: 54px; height: 54px; border-radius: 15px; box-shadow: 0 12px 30px -10px var(--glow); } .who h3 { font-size: 22px; }
  p { line-height: 1.55; margin-bottom: 12px; }
  ul { list-style: none; display: grid; gap: 8px; margin-bottom: 18px; } li { position: relative; padding-left: 18px; font-size: 13.5px; color: var(--text); } li::before { content: ''; position: absolute; left: 1px; top: 8px; width: 7px; height: 7px; border-radius: 50%; background: linear-gradient(135deg, var(--glow), var(--accent2)); }
  .shots { position: relative; height: 210px; border-radius: 18px; background: radial-gradient(80% 90% at 50% 0%, #1b2236, #0a0c12); border: 1px solid var(--line); display: grid; place-items: center; overflow: hidden; }
  .shot { max-width: 92%; max-height: 150px; object-fit: contain; filter: drop-shadow(0 18px 30px rgba(0, 0, 0, 0.6)); position: absolute; top: 26px; }
  .cap { position: absolute; left: 0; right: 0; bottom: 34px; text-align: center; font-size: 12.5px; color: var(--muted); }
  .dots { position: absolute; left: 0; right: 0; bottom: 12px; display: flex; justify-content: center; gap: 7px; } .dots button { width: 8px; height: 8px; border-radius: 8px; background: var(--s3); transition: width .35s var(--ease), background .25s; } .dots button.on { width: 24px; background: linear-gradient(90deg, var(--glow), var(--accent2)); }
</style>
