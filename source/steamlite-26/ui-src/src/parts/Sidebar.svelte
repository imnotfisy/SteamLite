<script>
  import { S, go, game } from '../lib/state.svelte.js';
  import Icon from './Icon.svelte';
  import Ver from './Ver.svelte';
  const items = [['home', 'Home', 'home'], ['library', 'Library', 'library'], ['news', 'News', 'news'], ['settings', 'Settings', 'cog']];
  const now = $derived(S.running && (game(S.running.id) || { name: S.running.name }));
  const cur = $derived(S.view === 'game' ? 'library' : S.view);
  const idx = $derived(items.findIndex((x) => x[0] === cur));   // -1 on pages that are not in the rail (the profile page): no highlight
</script>

<!-- the rail runs from the very top to the bottom; its right edge is curved, and the page runs underneath it, so the curve never leaves a gap -->
<nav class="glass" aria-label="Main">
  <div class="logo"><img src="/icon.png" alt="SteamLite" draggable="false" /><span class="lb">SteamLite</span></div>
  <div class="list">
    <div class="pill" class:none={idx < 0} style="transform: translateY({Math.max(idx, 0) * 54}px)"></div>
    {#each items as [id, label, icon], n}
      <button class:on={cur === id} style="--n:{n}" onclick={(e) => { go(id); e.currentTarget.blur(); }} aria-label={label}>
        <span class="ic"><Icon name={icon} size={21} /></span><span class="lb">{label}</span>
      </button>
    {/each}
  </div>
  <div class="grow"></div>
  {#if now}
    <button class="now" onclick={(e) => { go('game', S.running.id); e.currentTarget.blur(); }} title={'Playing ' + now.name}>
      <span class="orb"><i></i></span><span class="lb"><small>{S.running.starting ? (S.running.steam ? 'Starting Steam' : 'Starting') : 'Playing'}</small><b class="ellipsis">{now.name}</b></span>
    </button>
  {/if}
  <div class="ver lb">v<Ver v={S.version} /></div>
</nav>

<style>
  nav { position: fixed; left: 0; top: 0; bottom: 0; width: 76px; z-index: 40; border-radius: 0 30px 30px 0; border-left: 0; padding: 18px 12px 14px; display: flex; flex-direction: column; overflow: hidden; background: var(--rail); transition: width .55s var(--ease), box-shadow .4s; animation: slidein .8s var(--ease) both; }
  @keyframes slidein { from { transform: translateX(-100%); } }
  nav:hover, nav:has(:focus-visible) { width: 236px; box-shadow: var(--shadow-lg); }
  .logo { display: flex; align-items: center; gap: 14px; height: 48px; padding-left: 5px; margin-bottom: 16px; font-weight: 800; font-size: 16px; letter-spacing: .01em; white-space: nowrap; }
  .logo img { width: 40px; height: 40px; flex: none; border-radius: 50%; animation: logoin .8s var(--ease) both .2s; }
  @keyframes logoin { from { transform: scale(.3) rotate(-120deg); opacity: 0; } }
  .list { position: relative; display: grid; gap: 6px; align-content: start; }
  .pill.none { opacity: 0; transform: scale(.9); } .pill { position: absolute; left: 0; right: 0; top: 0; height: 48px; border-radius: 12px; background: var(--s3); border: 1px solid var(--line2); transition: transform .4s var(--ease); }
  .list button { position: relative; height: 48px; display: flex; align-items: center; gap: 14px; padding: 0 14px; border-radius: 16px; color: var(--muted); font-weight: 600; white-space: nowrap; transition: color .25s; animation: itemin .7s var(--spring) both; animation-delay: calc(350ms + var(--n) * 80ms); }
  @keyframes itemin { from { opacity: 0; transform: translateX(-26px); } }
  .list button:hover { color: var(--text); } .list button.on { color: #fff; }
  .ic { display: grid; place-items: center; flex: none; transition: transform .4s var(--spring); } .list button:hover .ic { transform: scale(1.16) rotate(-5deg); } .list button:active .ic { transform: scale(.9); }
  .lb { opacity: 0; transform: translateX(-8px); transition: opacity .3s, transform .45s var(--ease); } nav:hover .lb, nav:has(:focus-visible) .lb { opacity: 1; transform: none; transition-delay: .06s; }
  .grow { flex: 1; }
  .now { display: flex; align-items: center; gap: 12px; padding: 8px; border-radius: 16px; background: color-mix(in srgb, var(--good) 12%, transparent); border: 1px solid color-mix(in srgb, var(--good) 35%, transparent); text-align: left; margin-bottom: 8px; min-width: 0; animation: pop .6s var(--spring) both; }
  .orb { width: 34px; height: 34px; flex: none; display: grid; place-items: center; border-radius: 50%; background: color-mix(in srgb, var(--good) 22%, transparent); } .orb i { width: 11px; height: 11px; border-radius: 50%; background: var(--good); animation: ring 1.8s infinite; }
  @keyframes ring { 0% { box-shadow: 0 0 0 0 #46e0a0aa; } 100% { box-shadow: 0 0 0 14px #46e0a000; } }
  .now small { display: block; color: var(--good); font-weight: 800; letter-spacing: .08em; text-transform: uppercase; font-size: 10px; } .now b { display: block; max-width: 130px; font-size: 13px; }
  .ver { padding: 4px 14px 0; font-size: 11.5px; color: var(--faint); white-space: nowrap; }
</style>
