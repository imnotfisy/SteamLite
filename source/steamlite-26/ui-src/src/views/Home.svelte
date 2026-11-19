<script>
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { expoOut } from 'svelte/easing';
  import { S, api, go, loadLibrary, openGame } from '../lib/state.svelte.js';
  import { hours, played, ago, date } from '../lib/util.js';
  import { glowFor } from '../lib/color.js';
  import { reveal } from '../lib/actions.js';
  import GameCard from '../parts/GameCard.svelte';
  import Cover from '../parts/Cover.svelte';
  import Shelf from '../parts/Shelf.svelte';
  import Count from '../parts/Count.svelte';
  import Icon from '../parts/Icon.svelte';
  import PlayButton from '../parts/PlayButton.svelte';
  // import DevCard from '../parts/DevCard.svelte';

  const vis = $derived(S.games.filter((g) => !S.hidden.includes(g.id)));
  const recent = $derived([...vis].filter((g) => g.lastPlayed).sort((a, b) => b.lastPlayed - a.lastPlayed));
  const stage = $derived((recent.length ? recent : vis).slice(0, 5));
  const most = $derived([...vis].sort((a, b) => played(b) - played(a)).filter((g) => played(g)).slice(0, 12));
  const favs = $derived(vis.filter((g) => S.favorites.includes(g.id)));
  const totalH = $derived(vis.reduce((a, g) => a + played(g), 0) / 3600);
  const installed = $derived(vis.filter((g) => g.installed).length);
  const ach = $derived(0);
  let feed = $state([]), cur = $state(0), paused = false, tick = $state(0);
  const hero = $derived(stage[cur % Math.max(stage.length, 1)]);
  const live = $derived(hero && S.running && S.running.id === hero.id);

  onMount(() => {
    api('news:feed').then((f) => (feed = f.slice(0, 4))).catch(() => { });
    const t = setInterval(() => { if (paused || stage.length < 2 || document.documentElement.dataset.gaming === '1') return; tick += 1; if (tick >= 70) { tick = 0; cur = (cur + 1) % stage.length; } }, 100);   // about 7 seconds each
    return () => clearInterval(t);
  });
  $effect(() => { if (hero) glowFor(hero); });
  const pick = (i) => { cur = i; tick = 0; };
  const open = (u) => api('app:openUrl', u);
</script>

<div class="page">
  <div class="rise" style="--i:0"><h1 class="title">Home</h1></div>

  {#if S.libLoading && !S.games.length}
    <div class="loading" role="status"><span class="spinner"></span>Loading your library from Steam...</div>
    <div class="skel herosk"></div>
  {:else if S.libError && !S.games.length}
    <div class="card empty rise"><h2>Your library did not load</h2><p class="muted">{S.libError}</p><div class="row"><button class="btn primary" onclick={() => loadLibrary()}>Try again</button></div></div>
  {:else if !S.games.length}
    <div class="card empty rise"><h2>No games found</h2><p class="muted">Steam returned no games for this account. If your profile is private, SteamLite cannot see them. Set "Game details" to Public in Steam, then refresh.</p>
      <div class="row"><button class="btn primary" onclick={() => open('https://steamcommunity.com/my/edit/settings?tab=privacy')}>Open Steam privacy settings</button><button class="btn" onclick={() => loadLibrary()}>Refresh library</button></div></div>
  {:else}
    {#if hero}
      <section class="hero rise" style="--i:1" role="group" onmouseenter={() => (paused = true)} onmouseleave={() => (paused = false)}>
        {#key hero.id}
          <div class="art" in:fade={{ duration: 900 }} out:fade={{ duration: 900 }}><div class="kb"><Cover g={hero} kind="hero" /></div></div>
        {/key}
        <div class="veil"></div>
        {#key hero.id}
          <div class="copy" in:fly={{ y: 24, duration: 800, easing: expoOut, delay: 150 }}>
            <div class="eyebrow">{hero.lastPlayed ? 'Continue playing' : 'In your library'}</div>
            <h2>{hero.name}</h2>
            <div class="chips">
              <span><Icon name="clock" size={15} />{hours(played(hero))} played</span>
              {#if hero.lastPlayed}<span>Last played {ago(hero.lastPlayed).toLowerCase()}</span>{/if}
              {#if live}<span class="lv">Playing now</span>{/if}
            </div>
            <div class="row act">
              <PlayButton g={hero} installLabel="View game" onInstall={() => openGame(hero.id)} />
              <button class="btn" onclick={() => openGame(hero.id)}>Details</button>
            </div>
          </div>
        {/key}
        <div class="side">{#key hero.id}<div class="cap" in:fly={{ x: 60, duration: 900, easing: expoOut }}><Cover g={hero} /></div>{/key}</div>
        {#if stage.length > 1}
          <div class="dots">{#each stage as _, i}<button aria-label={'Show ' + stage[i].name} class:on={i === cur % stage.length} onclick={() => pick(i)}><i style="width:{i === cur % stage.length ? Math.min(100, tick / 0.7) : 0}%"></i></button>{/each}</div>
        {/if}
      </section>
    {/if}

    <div class="tiles">
      <div class="card tile rise" style="--i:2"><div class="faint">Games in library</div><b><Count value={vis.length} /></b></div>
      <div class="card tile rise" style="--i:3"><div class="faint">Installed</div><b><Count value={installed} /></b></div>
      <div class="card tile rise" style="--i:4"><div class="faint">Hours played</div><b><Count value={totalH} /></b></div>
      <div class="card tile rise" style="--i:5"><div class="faint">Favorites</div><b><Count value={favs.length} /></b></div>
    </div>
    {#if S.offline}<div class="muted off">You are offline. This is the last saved copy of your library. Reconnect and press refresh in the library to update it.</div>{/if}

    {#if recent.length > 5}<div class="sech" use:reveal><h2>Recently played</h2></div><Shelf>{#each recent.slice(5, 17) as g, i (g.id)}<GameCard {g} {i} />{/each}</Shelf>{/if}
    {#if most.length}<div class="sech" use:reveal><h2>Most played</h2></div><Shelf>{#each most as g, i (g.id)}<GameCard {g} {i} />{/each}</Shelf>{/if}
    {#if favs.length}<div class="sech" use:reveal><h2>Favorites</h2></div><Shelf>{#each favs as g, i (g.id)}<GameCard {g} {i} />{/each}</Shelf>{/if}

    {#if feed.length}
      <div class="sech" use:reveal><h2>News from your games</h2><div class="grow"></div><button class="btn sm" onclick={() => go('news')}>All news</button></div>
      <div class="news" use:reveal>{#each feed as n, i (n.gid)}
        <button class="card item" onclick={() => n.url && api('app:openUrl', n.url)}><div class="eyebrow">{n.game}</div><b>{n.title}</b><div class="faint">{date(n.date)}</div></button>{/each}</div>
    {/if}
  {/if}
  <!-- <DevCard /> hidden until the Island page exists -->
</div>

<style>
  .title { margin-top: 4px; margin-bottom: 22px; }
  .herosk { height: 380px; border-radius: 20px; } .loading { display: flex; align-items: center; gap: 10px; color: var(--muted); margin-bottom: 14px; } .spinner { width: 16px; height: 16px; border-radius: 50%; border: 2px solid var(--line2); border-top-color: var(--accent); animation: spin .9s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }
  .hero { position: relative; height: 380px; border-radius: 20px; overflow: hidden; border: 1px solid var(--line2); isolation: isolate; background: var(--bg-raise); }
  .art { position: absolute; inset: 0; } .kb { position: absolute; inset: 0; transform-origin: 70% 40%; } @keyframes kb { to { transform: scale(1.1) translate3d(-1.5%, -1%, 0); } }
  .veil { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(7, 8, 12, 0.94) 0%, rgba(7, 8, 12, 0.7) 38%, rgba(7, 8, 12, 0.1) 72%), linear-gradient(0deg, rgba(7, 8, 12, 0.9), transparent 45%); }
  .copy { position: absolute; left: 44px; bottom: 54px; max-width: 54%; display: grid; gap: 12px; }
  .copy h2 { font-size: 40px; font-weight: 650; letter-spacing: -0.02em; line-height: 1.1; text-wrap: balance; }
  .chips { display: flex; gap: 10px; flex-wrap: wrap; } .chips span { display: inline-flex; align-items: center; gap: 7px; padding: 6px 13px; border-radius: 999px; background: #ffffff14; border: 1px solid #ffffff1c; backdrop-filter: blur(10px); font-size: 13px; font-weight: 600; } .chips .lv { background: color-mix(in srgb, var(--good) 22%, transparent); border-color: color-mix(in srgb, var(--good) 50%, transparent); color: var(--good); }
  .act { margin-top: 6px; }
  .side { position: absolute; right: 54px; top: 50%; margin-top: -170px; width: 226px; aspect-ratio: 2 / 3; --rx: 0deg; --ry: 0deg; transform: perspective(900px) rotateX(var(--rx)) rotateY(var(--ry)); transition: transform .3s var(--ease); }
  .cap { position: absolute; inset: 0; border-radius: 20px; overflow: hidden; border: 1px solid #ffffff30; box-shadow: 0 20px 40px -20px #000; }
  .dots { position: absolute; left: 44px; bottom: 22px; display: flex; gap: 8px; } .dots button { width: 44px; height: 4px; border-radius: 4px; background: #ffffff30; overflow: hidden; transition: width .4s var(--ease), background .2s; } .dots button.on { width: 70px; } .dots button:hover { background: #ffffff55; } .dots i { display: block; height: 100%; background: #fff; }
  .tiles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-top: 18px; } .tile { padding: 18px 22px; display: grid; gap: 2px; } .tile b { font-size: 32px; letter-spacing: -0.03em; font-weight: 750; font-variant-numeric: tabular-nums; }
  .off { margin-top: 12px; }
  .news { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 14px; }
  .item { text-align: left; padding: 18px 20px; display: grid; gap: 7px; transition: transform .3s var(--spring), border-color .25s, box-shadow .3s; } .item:hover { transform: translateY(-4px); border-color: color-mix(in srgb, var(--glow) 60%, transparent); box-shadow: 0 20px 50px -24px var(--glow); } .item b { font-size: 15.5px; line-height: 1.3; }
  .empty { padding: 34px; display: grid; gap: 8px; margin-top: 20px; }
  @media (max-width: 1100px) { .side { display: none; } .copy { max-width: 80%; } .copy h2 { font-size: 40px; } .tiles { grid-template-columns: repeat(2, 1fr); } }
</style>
