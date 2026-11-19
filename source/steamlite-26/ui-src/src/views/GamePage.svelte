<script>
  import { magnet } from '../lib/magnet.js';
  import { onMount } from 'svelte';
  import { fly, slide, fade } from 'svelte/transition';
  import { expoOut } from 'svelte/easing';
  import { S, api, toast, game, goBack, play, stop, toggleFavorite, toggleHidden, saveCollections, loadLibrary } from '../lib/state.svelte.js';
  import { hours, played, ago, bytes, date } from '../lib/util.js';
  import { glowFor } from '../lib/color.js';
  import { parallax, tilt, reveal } from '../lib/actions.js';
  import Cover from '../parts/Cover.svelte';
  import Icon from '../parts/Icon.svelte';
  import Count from '../parts/Count.svelte';
  import Toggle from '../parts/Toggle.svelte';
  import PlayButton from '../parts/PlayButton.svelte';

  const g = $derived(game(S.gameId));
  const live = $derived(S.running && g && S.running.id === g.id);
  const fav = $derived(g && S.favorites.includes(g.id));
  let tab = $state('overview'), ach = $state(null), news = $state(null), notes = $state(''), cfg = $state({ args: '', exePath: '', admin: false });
  let menu = $state(''), newCol = $state(''), saveT, tabs = $state([]);

  onMount(async () => {
    if (!g) return;
    glowFor(g);
    notes = await api('game:notes', g.id); cfg = await api('game:config', g.id);
    if (!g.nonSteam) { api('game:achievements', g.id).then((a) => (ach = a)); api('game:news', g.id).then((n) => (news = n)); }
  });
  const saveNotes = () => { clearTimeout(saveT); saveT = setTimeout(() => api('game:saveNotes', { id: g.id, text: notes }), 600); };
  async function saveCfg() { await api('game:saveConfig', { id: g.id, ...cfg }); toast('Launch options saved.'); menu = ''; }
  async function pickExe() { const p = await api('dialog:exe'); if (p) cfg.exePath = p; }
  const inCol = (c) => (S.collections[c] || []).map(String).includes(g.id);
  async function toggleCol(c) { const l = (S.collections[c] || []).map(String); S.collections[c] = l.includes(g.id) ? l.filter((x) => x !== g.id) : [...l, g.id]; await saveCollections(); }
  async function addCol() { const n = newCol.trim(); if (!n || S.collections[n]) return; S.collections[n] = [g.id]; newCol = ''; await saveCollections(); }
  async function removeCol(c) { const before = S.collections[c]; delete S.collections[c]; await saveCollections(); toast('Deleted the collection ' + c + '.', '', { label: 'Undo', fn: async () => { S.collections[c] = before; await saveCollections(); } }); }
  const prog = $derived(g && S.progress[g.id]), PL = { downloading: 'Downloading', installing: 'Installing', updating: 'Updating', verifying: 'Verifying files', paused: 'Download paused', waiting: 'Waiting in the Steam queue' };
  async function removeNonSteam() { await api('nonsteam:remove', g.id); await loadLibrary(); goBack(); }
  const done = $derived(ach ? ach.filter((a) => a.achieved).length : 0);
  const pct = $derived(ach && ach.length ? Math.round((done / ach.length) * 100) : 0);
  const steamAct = (action) => api('game:steamAction', { id: g.id, action });
  const TABS = $derived([['overview', 'Overview'], ...(g && !g.nonSteam ? [['ach', 'Achievements' + (ach && ach.length ? ' ' + done + '/' + ach.length : '')], ['news', 'News']] : [])]);
  const ti = $derived(Math.max(0, TABS.findIndex((t) => t[0] === tab)));
  let tabEls = $state([]);
  const ind = $derived(tabEls[ti] ? { x: tabEls[ti].offsetLeft, w: tabEls[ti].offsetWidth } : { x: 0, w: 0 });
</script>

{#if !g}
  <div class="page"><button class="btn" onclick={goBack}><Icon name="back" size={17} />Back</button><p class="muted" style="margin-top:16px">That game is no longer in your library.</p></div>
{:else}
  <div class="hero">
    <div class="bg" ><Cover {g} kind="hero" /></div>
    <div class="shade"></div>
    <button class="btn back glass" onclick={goBack}><Icon name="back" size={17} />Back</button>
  </div>
  <div class="page body">
    <div class="top">
      <div class="cap" in:fly={{ y: 24, duration: 600, easing: expoOut }}><Cover {g} /></div>
      <div class="grow info">
        <div class="eyebrow rise" style="--i:1">{g.nonSteam ? 'Non-Steam game' : g.installed ? 'Installed' : 'Not installed'}</div>
        <h1 class="rise" style="--i:2">{g.name}</h1>
        <div class="facts rise" style="--i:3"><span><Icon name="clock" size={15} />{hours(played(g))} played</span><span>{g.lastPlayed ? 'Last played ' + ago(g.lastPlayed).toLowerCase() : 'Never played'}</span>{#if g.size}<span>{bytes(g.size)}</span>{/if}{#if prog}<span class="dlst">{PL[prog.a] || 'Working'}{prog.a === 'downloading' || prog.a === 'installing' || prog.a === 'paused' ? ' ' + Math.round(prog.p * 100) + '%' : ''}</span>{/if}</div>
        {#if prog}<div class="dlbar rise" style="--i:3"><i style="width:{Math.round(prog.p * 100)}%"></i></div>{/if}
        <div class="row act rise" style="--i:4">
          <PlayButton {g} onInstall={() => steamAct('install')} />
          <button class="btn icon" class:fav aria-label={fav ? 'Remove from favorites' : 'Add to favorites'} title="Favorite" onclick={() => toggleFavorite(g.id)}><Icon name="star" size={18} /></button>
          <button class="btn" class:open={menu === 'col'} onclick={() => (menu = menu === 'col' ? '' : 'col')}><Icon name="layers" size={18} />Collections</button>
          <button class="btn" class:open={menu === 'opt'} onclick={() => (menu = menu === 'opt' ? '' : 'opt')}><Icon name="sliders" size={18} />Options</button>
        </div>
      </div>
    </div>
      {#if menu === 'col'}
        <div class="pop glass" transition:slide={{ duration: 400, easing: expoOut }}>
          {#each Object.keys(S.collections) as c (c)}<div class="row ci"><button class="grow ck" onclick={() => toggleCol(c)}><span class="box" class:on={inCol(c)}><Icon name="check" size={13} stroke={3} /></span>{c}</button><button class="x" aria-label={'Delete ' + c} onclick={() => removeCol(c)}><Icon name="x" size={15} /></button></div>{/each}
          <div class="row"><input class="grow" placeholder="New collection" bind:value={newCol} onkeydown={(e) => e.key === 'Enter' && addCol()} /><button class="btn" onclick={addCol}>Create</button></div>
        </div>
      {:else if menu === 'opt'}
        <div class="pop glass" transition:slide={{ duration: 400, easing: expoOut }}>
          <label class="f">Launch options<input bind:value={cfg.args} placeholder="-windowed -novid" /></label>
          <label class="f">Game file override <span class="faint">(optional)</span><div class="row"><input class="grow" bind:value={cfg.exePath} /><button class="btn" onclick={pickExe}><Icon name="folder" size={17} />Browse</button></div></label>
          <div class="row"><div class="grow"><b>Run as administrator</b></div><Toggle checked={cfg.admin} onchange={(v) => (cfg.admin = v)} /></div>
          <div class="row wrap"><button class="btn primary" onclick={saveCfg}>Save</button><div class="grow"></div>
            {#if !g.nonSteam && g.installed}<button class="btn sm" onclick={() => api('game:openFolder', g.id)}><Icon name="folder" size={15} />Open folder</button><button class="btn sm" onclick={() => steamAct('verify')}>Verify files</button><button class="btn sm danger" onclick={() => steamAct('uninstall')}>Uninstall</button>{/if}
            {#if g.nonSteam}<button class="btn sm danger" onclick={removeNonSteam}>Remove</button>{/if}
            <button class="btn sm" onclick={() => toggleHidden(g.id)}><Icon name="eye" size={15} />{S.hidden.includes(g.id) ? 'Unhide' : 'Hide'}</button></div>
        </div>
      {/if}

    <div class="tabs rise" use:magnet style="--i:5">
      <div class="ind" style="transform: translateX({ind.x}px); width:{ind.w}px"></div>
      {#each TABS as [id, label], i}<button bind:this={tabEls[i]} class:on={tab === id} onclick={() => (tab = id)}>{label}</button>{/each}
    </div>

    {#key tab}
      <div in:fly={{ y: 16, duration: 500, easing: expoOut }}>
        {#if tab === 'overview'}
          <div class="stats">
            <div class="card st rise" style="--i:6"><Icon name="clock" size={20} /><div class="faint">Time played</div><b><Count value={played(g) / 3600} format={(n) => (n < 10 ? n.toFixed(1) : Math.round(n)) + ' h'} /></b></div>
            <div class="card st rise" style="--i:7"><Icon name="bolt" size={20} /><div class="faint">Tracked here</div><b>{hours(g.seconds)}</b></div>
            <div class="card st rise" style="--i:8"><Icon name="play" size={20} /><div class="faint">Launches</div><b><Count value={g.launches || 0} /></b></div>
            {#if ach && ach.length}<div class="card st rise" style="--i:9"><Icon name="trophy" size={20} /><div class="faint">Achievements</div><b><Count value={pct} format={(n) => Math.round(n) + '%'} /></b></div>{/if}
          </div>
          <div class="sech"><h2>Notes</h2></div>
          <textarea rows="5" placeholder="Anything worth remembering about this game" bind:value={notes} oninput={saveNotes}></textarea>
        {:else if tab === 'ach'}
          {#if ach === null}<div class="achs">{#each Array(6) as _}<div class="skel" style="height:72px"></div>{/each}</div>
          {:else if !ach.length}<div class="muted">No achievements to show. The game may have none, or its stats are private.</div>
          {:else}
            <div class="card prog"><div class="row"><b class="grow">{done} of {ach.length} unlocked</b><span class="muted">{pct}%</span></div><div class="track"><i style="width:{pct}%"></i></div></div>
            <div class="achs">{#each [...ach].sort((a, b) => b.achieved - a.achieved) as a, i}
              <div class="card ach rise" class:off={!a.achieved} style="--i:{Math.min(i, 12)}">{#if a.icon}<img src={a.icon} alt="" />{/if}<div><b>{a.name}</b><div class="muted">{a.description}</div></div></div>{/each}</div>
          {/if}
        {:else}
          {#if news === null}<div class="skel" style="height:110px"></div>
          {:else if !news.length}<div class="muted">No news for this game.</div>
          {:else}{#each news as n, i}<button class="card nw rise" style="--i:{i}" onclick={() => n.url && api('app:openUrl', n.url)}><div class="eyebrow">{date(n.date)}</div><b>{n.title}</b><p class="muted">{n.text}</p></button>{/each}{/if}
        {/if}
      </div>
    {/key}
  </div>
{/if}

<style>
  .hero { position: relative; height: 400px; overflow: hidden; }
  .bg { position: absolute; inset: 0; will-change: transform; transform: scale(1.08); } .bg :global(img) { filter: saturate(1.15); }
  .shade { position: absolute; inset: 0; background: linear-gradient(0deg, var(--bg) 4%, rgba(7, 8, 12, 0.35) 55%, rgba(7, 8, 12, 0.55)); }
  .back { position: absolute; left: 100px; top: 54px; border-radius: 14px; height: 40px; z-index: 3; }
  .body { margin-top: -190px; position: relative; z-index: 2; }
  .top { display: flex; gap: 34px; align-items: flex-end; }
  .cap { --rx: 0deg; --ry: 0deg; --mx: 50%; --my: 50%; --on: 0; position: relative; width: 210px; aspect-ratio: 2 / 3; border-radius: 20px; overflow: hidden; flex: none; border: 1px solid #ffffff2a; background: var(--bg-raise); box-shadow: 0 20px 40px -20px #000; }
  .glare { position: absolute; inset: 0; opacity: calc(var(--on) * .9); background: radial-gradient(300px circle at var(--mx) var(--my), #ffffff38, transparent 55%); mix-blend-mode: soft-light; pointer-events: none; }
  .info { padding-bottom: 6px; min-width: 0; } h1 { font-size: 40px; font-weight: 650; letter-spacing: -0.02em; line-height: 1.1; margin: 6px 0 12px; text-wrap: balance; }
  .facts { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; } .facts span { display: inline-flex; align-items: center; gap: 7px; padding: 6px 13px; border-radius: 999px; background: var(--s1); border: 1px solid var(--line); color: var(--muted); font-size: 13px; font-weight: 600; }
  .act { flex-wrap: wrap; } .btn.fav { color: var(--warn); } .btn.fav :global(path) { fill: var(--warn); } .btn.open { background: var(--s3); border-color: var(--line2); }
  
  .pop { margin-top: 18px; padding: 20px; display: grid; gap: 14px; max-width: 680px; border-radius: 22px; background: rgba(16, 18, 26, 0.85); } .f { display: grid; gap: 8px; font-weight: 600; font-size: 13px; color: var(--muted); } .wrap { flex-wrap: wrap; }
  .ci { gap: 6px; } .ck { display: flex; align-items: center; gap: 12px; padding: 8px 10px; border-radius: 12px; text-align: left; font-weight: 600; transition: background .2s; } .ck:hover { background: var(--s2); }
  .box { width: 22px; height: 22px; border-radius: 7px; display: grid; place-items: center; border: 1.5px solid var(--line2); color: transparent; transition: all .3s var(--spring); } .box.on { background: linear-gradient(135deg, var(--glow), var(--accent2)); border-color: transparent; color: var(--accent-ink); transform: scale(1.08); }
  .x { width: 32px; height: 32px; display: grid; place-items: center; border-radius: 9px; color: var(--faint); transition: all .2s; } .x:hover { color: var(--bad); background: color-mix(in srgb, var(--bad) 14%, transparent); }
  .tabs { position: relative; display: inline-flex; gap: 4px; padding: 4px; margin: 36px 0 24px; border-radius: 16px; background: var(--s1); border: 1px solid var(--line); }
  .tabs button { position: relative; z-index: 1; height: 38px; padding: 0 20px; border-radius: 12px; color: var(--muted); font-weight: 650; transition: color .25s; } .tabs button.on { color: var(--text); } .tabs button:hover { color: var(--text); }
  .ind { position: absolute; top: 4px; bottom: 4px; left: 0; border-radius: 12px; background: var(--s3); box-shadow: inset 0 1px 0 #ffffff14, 0 6px 20px -8px #000; transition: transform .5s var(--spring), width .4s var(--ease); }
  .stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; } .st { padding: 20px 22px; display: grid; gap: 4px; justify-items: start; } .st :global(svg) { color: var(--glow); margin-bottom: 8px; } .st b { font-size: 30px; font-weight: 750; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
  textarea { width: 100%; min-height: 120px; }
  .prog { padding: 18px 22px; margin-bottom: 16px; display: grid; gap: 12px; } .track { height: 10px; border-radius: 10px; background: var(--s3); overflow: hidden; } .track i { display: block; height: 100%; border-radius: 10px; background: linear-gradient(90deg, var(--glow), var(--accent2)); animation: grow 1.2s var(--ease); } @keyframes grow { from { width: 0 !important; } }
  .achs { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 12px; } .ach { display: flex; gap: 14px; padding: 14px; align-items: center; } .ach img { width: 52px; height: 52px; border-radius: 10px; } .ach.off { opacity: .45; } .ach.off img { filter: grayscale(1); }
  .nw { display: block; width: 100%; text-align: left; padding: 20px 22px; margin-bottom: 12px; transition: transform .3s var(--spring), border-color .25s; } .nw:hover { transform: translateY(-3px); border-color: color-mix(in srgb, var(--glow) 55%, transparent); } .nw b { font-size: 17px; display: block; margin: 4px 0; } .nw p { line-height: 1.55; }
  .dlst { color: var(--good); font-weight: 700; } .dlbar { height: 6px; max-width: 420px; margin-top: 10px; border-radius: 4px; background: var(--s2); overflow: hidden; } .dlbar i { display: block; height: 100%; background: var(--play); transition: width 1s linear; }
</style>
