<script>
  import { onMount } from 'svelte';
  import { S, api, openGame } from '../lib/state.svelte.js';
  import { hours, ago } from '../lib/util.js';
  import { reveal } from '../lib/actions.js';
  import Count from '../parts/Count.svelte';
  import Icon from '../parts/Icon.svelte';

  let p = $state(undefined), disk = $state([]);
  onMount(async () => { p = await api('account:profile'); disk = await api('library:storage'); });
  const owned = $derived(S.games.filter((g) => !g.nonSteam).length);
  const gb = (n) => (n / 1073741824).toFixed(0) + ' GB';
  const initial = (n) => (n || '?').trim()[0].toUpperCase();
</script>

<div class="page">
  {#if p === undefined}<div class="skel" style="height:150px"></div>
  {:else if !p || !p.summary}<h1 class="title">Profile</h1><p class="muted">Could not load your Steam profile. Check your connection.</p>
  {:else}
    <div class="card head rise" style="--i:0">
      <div class="av">{#if p.summary.avatarfull}<img src={p.summary.avatarfull} alt="" />{:else}<span>{initial(p.summary.personaname)}</span>{/if}</div>
      <div class="grow"><div class="eyebrow">Signed in</div><h1>{p.summary.personaname}</h1><div class="muted">Steam level {p.level}{p.bans && (p.bans.VACBanned || p.bans.NumberOfGameBans) ? ' - has bans on record' : ''}</div></div>
      <button class="btn" onclick={() => api('app:openUrl', p.summary.profileurl)}><Icon name="ext" size={16} />Open on Steam</button>
    </div>
    <div class="stats">
      <div class="card st rise" style="--i:1"><div class="faint">Games</div><b><Count value={owned} /></b></div>
      <div class="card st rise" style="--i:2"><div class="faint">Tracked with SteamLite</div><b><Count value={p.stats.totalSeconds / 3600} format={(n) => n.toFixed(1) + ' h'} /></b></div>
      <div class="card st rise" style="--i:3"><div class="faint">Last 7 days</div><b><Count value={p.stats.weekSeconds / 3600} format={(n) => n.toFixed(1) + ' h'} /></b></div>
      <div class="card st rise" style="--i:4"><div class="faint">Sessions</div><b><Count value={p.stats.sessions} /></b></div>
    </div>
    {#if disk.length}<div class="sech" use:reveal><h2>Disk space</h2></div><div class="disks" use:reveal>{#each disk as d, i}<div class="card dk"><div class="row"><b class="grow">{d.drive}</b><span class="muted">{gb(d.free)} free of {gb(d.total)}</span></div><div class="track"><i style="width:{Math.round((1 - d.free / d.total) * 100)}%"></i></div></div>{/each}</div>{/if}
    {#if p.recent.length}<div class="sech" use:reveal><h2>Recent sessions</h2></div>
      <div class="card list" use:reveal>{#each p.recent as s, i}<button class="row it" onclick={() => S.games.some((g) => g.id === String(s.gameId)) && openGame(s.gameId)}><span class="grow ellipsis">{s.name}</span><span class="muted">{hours(s.seconds)}</span><span class="faint w">{ago(s.start)}</span></button>{/each}</div>{/if}
  {/if}
</div>

<style>
  .head { display: flex; align-items: center; gap: 24px; padding: 26px; margin-bottom: 14px; background: linear-gradient(135deg, color-mix(in srgb, var(--glow) 14%, transparent), rgba(255, 255, 255, 0.02)); }
  .av { width: 96px; height: 96px; border-radius: 28px; overflow: hidden; flex: none; display: grid; place-items: center; background: linear-gradient(135deg, var(--glow), var(--accent2)); box-shadow: 0 20px 50px -18px var(--glow); } .av img { width: 100%; height: 100%; object-fit: cover; } .av span { font-size: 40px; font-weight: 800; color: var(--accent-ink); }
  h1 { font-size: 34px; margin: 2px 0 4px; }
  .stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 14px; } .st { padding: 20px 22px; display: grid; gap: 4px; } .st b { font-size: 30px; font-weight: 750; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
  .disks { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 14px; } .dk { padding: 18px 20px; } .track { height: 10px; border-radius: 10px; background: var(--s3); overflow: hidden; margin-top: 14px; } .track i { display: block; height: 100%; border-radius: 10px; background: linear-gradient(90deg, var(--glow), var(--accent2)); animation: grow 1.3s var(--ease); } @keyframes grow { from { width: 0 !important; } }
  .list { padding: 8px; max-width: 920px; } .it { width: 100%; padding: 12px 14px; border-radius: 13px; text-align: left; transition: background .2s, transform .25s var(--ease); } .it:hover { background: var(--s2); transform: translateX(4px); } .w { width: 110px; text-align: right; }
</style>
