<script>
  import { flip } from 'svelte/animate';
  import { onMount, onDestroy } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  import { expoOut } from 'svelte/easing';
  import { S, api, toast, openGame, loadLibrary, remember, bulk, saveCollections } from '../lib/state.svelte.js';
  import { played, bytes } from '../lib/util.js';
  import GameCard from '../parts/GameCard.svelte';
  import AddGame from '../parts/AddGame.svelte';
  import Icon from '../parts/Icon.svelte';
  import Seg from '../parts/Seg.svelte';

  let box;
  $effect(() => { if (S.focusSearch && box) { box.focus(); box.select(); S.focusSearch = false; } });
  let q = $state(''), filter = $state(S.ui.filter || 'all'), sort = $state(S.ui.sort || S.settings.defaultSort || 'recent'), adding = $state(false), spin = $state(false);
  let size = $state(Number((() => { try { return localStorage.getItem('sl-size'); } catch (e) { return null; } })()) || 176);
  $effect(() => { try { localStorage.setItem('sl-size', String(size)); } catch (e) { } });
  const cols = $derived(Object.keys(S.collections));
  const list = $derived.by(() => {
    let l = S.games.filter((g) => (filter === 'hidden' ? S.hidden.includes(g.id) : !S.hidden.includes(g.id)));
    if (filter === 'installed') l = l.filter((g) => g.installed);
    else if (filter === 'favorites') l = l.filter((g) => S.favorites.includes(g.id));
    else if (filter === 'nonsteam') l = l.filter((g) => g.nonSteam);
    else if (filter.startsWith('c:')) { const ids = (S.collections[filter.slice(2)] || []).map(String); l = l.filter((g) => ids.includes(g.id)); }
    const t = q.trim().toLowerCase(); if (t) l = l.filter((g) => g.name.toLowerCase().includes(t));
    const by = { name: (a, b) => a.name.localeCompare(b.name), played: (a, b) => played(b) - played(a), recent: (a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0), installed: (a, b) => (b.installed ? 1 : 0) - (a.installed ? 1 : 0) || a.name.localeCompare(b.name), size: (a, b) => (b.size || 0) - (a.size || 0) || a.name.localeCompare(b.name) };
    return [...l].sort(by[sort]);
  });
  const hasNon = $derived(S.games.some((g) => g.nonSteam));
  const pick = () => { const pool = list.filter((g) => g.installed); if (pool.length) openGame(pool[Math.floor(Math.random() * pool.length)].id); else toast('No installed games match this view.'); };
  async function refresh() { spin = true; await loadLibrary(); setTimeout(() => (spin = false), 400); }
  const sorts = [['recent', 'Recently played'], ['name', 'A to Z'], ['installed', 'Installed first'], ['played', 'Most played'], ['size', 'Largest first']];
  const open = (u) => api('app:openUrl', u);
  const clear = () => { q = ''; filter = 'all'; };
  // the library remembers its sort and filter between runs (a filter for something that is gone falls back to All)
  $effect(() => { if ((filter.startsWith('c:') && !cols.includes(filter.slice(2))) || (filter === 'hidden' && !S.hidden.length) || (filter === 'nonsteam' && !hasNon)) filter = 'all'; });
  let mounted = false; $effect(() => { const f = filter, s = sort; if (mounted) remember({ filter: f, sort: s }); });
  $effect(() => { S.visible = list.map((g) => g.id); });
  // storage: what the installed games take, and what is left on each drive
  let drives = $state([]);
  onMount(async () => { mounted = true; try { drives = await api('library:storage'); } catch (e) { } window.addEventListener('keydown', esc); });
  onDestroy(() => { window.removeEventListener('keydown', esc); S.sel = []; });
  const esc = (e) => { if (e.key === 'Escape' && S.sel.length) { S.sel = []; e.stopPropagation(); } };
  const inst = $derived(S.games.filter((g) => g.installed && !g.nonSteam && !S.hidden.includes(g.id))), used = $derived(inst.reduce((a, g) => a + (g.size || 0), 0));
  const storageLine = $derived(inst.length ? inst.length + ' installed, ' + bytes(used) + ' on disk' + (drives.length ? ', ' + drives.map((d) => bytes(d.free) + ' free on ' + d.drive.slice(0, 2).toUpperCase()).join(', ') : '') : '');
  // act on the games picked with Ctrl or Shift
  let colMenu = $state(false);
  async function addToCol(c) {
    const before = (S.collections[c] || []).map(String), ids = [...S.sel];
    S.collections[c] = [...new Set([...before, ...ids])]; await saveCollections(); colMenu = false; S.sel = [];
    toast('Added ' + ids.length + (ids.length === 1 ? ' game' : ' games') + ' to ' + c + '.', '', { label: 'Undo', fn: async () => { S.collections[c] = before; await saveCollections(); } });
  }
</script>

<div class="page">
  <div class="head rise" style="--i:0">
    <div><h1 class="title">Your library <span class="count">{list.length} {list.length === 1 ? 'game' : 'games'}</span></h1>{#if storageLine}<div class="stor faint">{storageLine}</div>{/if}</div>
    <div class="row">
      <button class="btn" onclick={pick} title="Opens a random installed game from this view"><Icon name="dice" size={18} />Random game</button>
      <button class="btn" onclick={() => (adding = true)}><Icon name="plus" size={18} />Add game</button>
      <button class="btn icon" aria-label="Refresh library" onclick={refresh}><span class:spin><Icon name="refresh" size={18} /></span></button>
    </div>
  </div>

  <div class="bar glass rise" style="--i:1">
    <div class="search"><Icon name="search" size={18} /><input placeholder="Search games (press /)" aria-label="Search your library" bind:this={box} bind:value={q} onkeydown={(e) => { if (e.key === 'Escape') { q = ''; box.blur(); } }} /></div>
    <Seg options={sorts} value={sort} label="Sort the library" onchange={(v) => (sort = v)} />
    <label class="size" title="Cover size"><Icon name="grid" size={16} /><input type="range" min="130" max="260" step="2" bind:value={size} /></label>
  </div>
  <div class="chips rise" style="--i:2">
    <button class="chip" class:on={filter === 'all'} onclick={() => (filter = 'all')}>All</button>
    <button class="chip" class:on={filter === 'installed'} onclick={() => (filter = 'installed')}>Installed</button>
    <button class="chip" class:on={filter === 'favorites'} onclick={() => (filter = 'favorites')}>Favorites</button>
    {#if hasNon}<button class="chip" class:on={filter === 'nonsteam'} onclick={() => (filter = 'nonsteam')}>Non-Steam</button>{/if}
    {#each cols as c}<button class="chip" class:on={filter === 'c:' + c} onclick={() => (filter = 'c:' + c)}>{c}</button>{/each}
    {#if S.hidden.length}<button class="chip" class:on={filter === 'hidden'} onclick={() => (filter = 'hidden')}>Hidden</button>{/if}
    {#if !S.sel.length}<span class="pickhint faint">Hold Ctrl or Shift and click games to pick several</span>{/if}
  </div>

  {#if S.libLoading && !S.games.length}
    <div class="loading" role="status"><span class="spinner"></span>Loading your library from Steam...</div>
    <div class="grid" style="--size:{size}px">{#each Array(12) as _}<div class="skel" style="aspect-ratio:2/3"></div>{/each}</div>
  {:else if S.libError && !S.games.length}
    <div class="none"><Icon name="refresh" size={30} /><h3>Your library did not load</h3><p class="muted">{S.libError}</p><div class="row"><button class="btn primary" onclick={refresh}>Try again</button></div></div>
  {:else if !S.games.length}
    <div class="none"><Icon name="library" size={30} /><h3>No games found</h3><p class="muted">Steam returned no games for this account. If your profile is private, SteamLite cannot see them. Set "Game details" to Public in Steam, then refresh.</p>
      <div class="row"><button class="btn primary" onclick={() => open('https://steamcommunity.com/my/edit/settings?tab=privacy')}>Open Steam privacy settings</button><button class="btn" onclick={refresh}>Refresh library</button></div></div>
  {:else if !list.length}
    <div class="none"><Icon name="search" size={30} /><h3>{q ? 'No games match "' + q + '"' : 'No games in this view'}</h3><p class="muted">{q ? 'Check the spelling, or search with fewer words.' : 'Try a different filter.'}</p><div class="row"><button class="btn" onclick={clear}>Show all games</button></div></div>
  {:else}
    {#key filter + sort}<div class="grid" style="--size:{size}px">{#each list as g, i (g.id)}<div animate:flip={{ duration: 400 }}><GameCard {g} {i} /></div>{/each}</div>{/key}
  {/if}
</div>
{#if S.sel.length}
  <div class="selbar glass" role="toolbar" aria-label="Selected games" in:fly={{ y: 20, duration: 360, easing: expoOut }} out:fade={{ duration: 160 }}>
    <b>{S.sel.length} selected</b>
    <button class="btn sm" onclick={() => bulk('fav', S.sel)}><Icon name="star" size={15} />Favorite</button>
    <button class="btn sm" onclick={() => bulk('hide', S.sel)}><Icon name="eye" size={15} />Hide</button>
    <span class="colwrap"><button class="btn sm" class:open={colMenu} onclick={() => (colMenu = !colMenu)}><Icon name="layers" size={15} />Collection</button>
      {#if colMenu}<div class="colmenu glass">{#each cols as c}<button onclick={() => addToCol(c)}>{c}</button>{:else}<span class="faint">No collections yet. Make one on a game page.</span>{/each}</div>{/if}</span>
    <button class="btn sm" onclick={() => (S.sel = [])}>Clear</button>
  </div>
{/if}
{#if adding}<AddGame onclose={() => (adding = false)} />{/if}

<style>
  .head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 22px; } .count { font-size: 18px; font-weight: 600; color: var(--faint); margin-left: 8px; letter-spacing: 0; }
  .bar { position: sticky; top: 10px; z-index: 20; display: flex; align-items: center; gap: 14px; padding: 8px; border-radius: 18px; margin-bottom: 14px; background: rgba(14, 16, 22, 0.7); }
  .search { flex: 1; display: flex; align-items: center; gap: 10px; padding-left: 14px; color: var(--faint); border-radius: 12px; transition: color .2s; } .search:focus-within { color: var(--glow); } .search input { flex: 1; border: 0 !important; background: transparent !important; box-shadow: none !important; height: 40px; padding: 0; color: var(--text); }
  .seg { display: flex; padding: 3px; gap: 2px; border-radius: 12px; background: var(--s1); } .seg button { height: 34px; padding: 0 14px; border-radius: 9px; color: var(--muted); font-weight: 600; font-size: 13px; transition: all .25s var(--ease); } .seg button:hover { color: var(--text); } .seg button.on { background: var(--s3); color: var(--text); box-shadow: inset 0 1px 0 #ffffff14, 0 4px 14px -6px #000; }
  .size { display: flex; align-items: center; gap: 10px; padding: 0 12px 0 6px; color: var(--faint); } .size input { width: 110px; accent-color: var(--glow); }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 26px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(var(--size), 1fr)); gap: 26px 20px; }
  .none { display: grid; justify-items: center; gap: 8px; padding: 80px 0; color: var(--faint); text-align: center; } .none h3 { color: var(--text); font-size: var(--t-lg); } .none p { max-width: 460px; } .none .row { margin-top: 8px; }
  .loading { display: flex; align-items: center; gap: 10px; color: var(--muted); margin-bottom: 16px; } .spinner { width: 16px; height: 16px; border-radius: 50%; border: 2px solid var(--line2); border-top-color: var(--accent); animation: sp .9s linear infinite; }
  .spin { display: inline-flex; animation: sp .8s var(--ease); } @keyframes sp { to { transform: rotate(360deg); } }
  .stor { margin-top: 4px; font-size: var(--t-sm); } .pickhint { margin-left: auto; align-self: center; font-size: var(--t-xs); }
  .selbar { position: fixed; z-index: 60; left: calc(50% + 38px); bottom: 26px; transform: translateX(-50%); display: flex; align-items: center; gap: 10px; padding: 10px 12px 10px 20px; border-radius: 18px; background: var(--rail); border: 1px solid var(--line2); box-shadow: 0 24px 60px -18px #000; white-space: nowrap; } .selbar b { margin-right: 8px; }
  .colwrap { position: relative; } .colmenu { position: absolute; bottom: 46px; left: 0; min-width: 200px; max-height: 260px; overflow: auto; display: grid; padding: 6px; border-radius: 14px; background: var(--rail); border: 1px solid var(--line2); box-shadow: var(--shadow-lg); }
  .colmenu button { text-align: left; padding: 9px 12px; border-radius: 9px; font-weight: 600; } .colmenu button:hover { background: var(--s2); } .colmenu span { padding: 9px 12px; font-size: var(--t-sm); }
</style>
