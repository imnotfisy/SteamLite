<script>
  import { openGame, S, play, toggleFavorite, pick } from '../lib/state.svelte.js';
  import { hours, played, ago, bytes } from '../lib/util.js';
  import Cover from './Cover.svelte';
  import Icon from './Icon.svelte';
  let { g, i = 0, wide = false } = $props();
  const live = $derived(S.running && S.running.id === g.id);
  const fav = $derived(S.favorites.includes(g.id));
  const sel = $derived(S.sel.includes(g.id)), prog = $derived(S.progress[g.id]);
  const PL = { downloading: 'Downloading', installing: 'Installing', updating: 'Updating', verifying: 'Verifying', paused: 'Paused', waiting: 'Waiting' };
  // Ctrl or Shift picks games to act on together; once something is picked, a plain click picks too
  const open = (e) => { if (e && (e.ctrlKey || e.metaKey || e.shiftKey || S.sel.length)) { e.preventDefault(); pick(g.id, e); } else openGame(g.id); };
  const key = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } };
  const last = $derived(g.lastPlayed ? 'Last played ' + ago(g.lastPlayed).toLowerCase() : 'Never played');
</script>

<!-- a game in the library: a plain cover (2:3, or the 460:215 header), its name, and what you need to scan: installed or not, play time, last played -->
<div class="gc rise" class:wide class:sel class:off={!g.installed} role="button" tabindex="0" style="--i:{Math.min(i, 14)}" onclick={(e) => open(e)} onkeydown={key} title={g.name}>
  <div class="art">
    <Cover {g} kind={wide ? 'header' : 'capsule'} />
    {#if sel}<span class="pickmark"><Icon name="check" size={15} stroke={3} /></span>{/if}
    {#if prog}<div class="prog"><i style="width:{Math.round(prog.p * 100)}%"></i></div>{/if}
    {#if live}<span class="live"><i></i>Playing</span>{/if}
    {#if fav}<span class="star" title="Favorite"><Icon name="star" size={13} /></span>{/if}
    <div class="acts">
      <button class="fav" class:on={fav} aria-label={fav ? 'Remove from favorites' : 'Add to favorites'} onclick={(e) => { e.stopPropagation(); toggleFavorite(g.id); }}><Icon name="star" size={16} /></button>
      {#if g.installed && !live}<button class="go" aria-label={'Play ' + g.name} disabled={!!S.running} onclick={(e) => { e.stopPropagation(); play(g); }}><Icon name="play" size={18} /></button>{/if}
    </div>
  </div>
  <div class="meta">
    <div class="name ellipsis">{g.name}</div>
    <div class="line">{#if prog}<span class="st on">{PL[prog.a] || 'Working'}{prog.a === 'downloading' || prog.a === 'installing' || prog.a === 'paused' ? ' ' + Math.round(prog.p * 100) + '%' : ''}</span>{:else}<span class="st" class:on={g.installed}>{g.installed ? 'Installed' : 'Not installed'}</span>{/if}<span class="dotsep">·</span><span>{played(g) ? hours(played(g)) + ' played' : 'No play time'}</span></div>
    <div class="line faint">{last}{g.installed && g.size ? ' · ' + bytes(g.size) : ''}</div>
  </div>
</div>

<style>
  .gc { display: block; text-align: left; border-radius: 12px; min-width: 0; cursor: pointer; outline-offset: 4px; }
  .art { position: relative; aspect-ratio: 2 / 3; border-radius: 12px; overflow: hidden; background: var(--bg-raise); border: 1px solid var(--line); transition: border-color .2s, transform .25s var(--ease), box-shadow .25s; }
  .gc:hover .art, .gc:focus-visible .art { border-color: var(--accent); transform: translateY(-2px); box-shadow: 0 10px 24px -14px #000; }
  .wide .art { aspect-ratio: 460 / 215; }
  .off .art :global(img) { filter: grayscale(.45) brightness(.78); }
  .acts { position: absolute; left: 8px; right: 8px; bottom: 8px; display: flex; justify-content: space-between; align-items: center; opacity: 0; transition: opacity .2s; } .gc:hover .acts, .gc:focus-within .acts { opacity: 1; }
  .acts button { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; background: rgba(20, 22, 36, 0.82); border: 1px solid var(--line2); transition: background .2s, color .2s; } .acts button:hover { background: rgba(20, 22, 36, 1); }
  .acts .fav.on { color: var(--warn); } .acts .fav.on :global(path) { fill: var(--warn); }
  .acts .go { width: 44px; height: 44px; margin-left: auto; color: var(--play-ink); border: 0; background: var(--play); } .acts .go:hover { background: #5be6ab; } .go :global(svg) { margin-left: 2px; } .acts button[disabled] { opacity: .4; }
  .star { position: absolute; left: 8px; top: 8px; width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; color: var(--warn); background: rgba(20, 22, 36, 0.82); } .star :global(path) { fill: var(--warn); }
  .live { position: absolute; right: 8px; top: 8px; display: flex; align-items: center; gap: 6px; padding: 3px 10px 3px 8px; border-radius: 999px; background: var(--play); color: var(--play-ink); font-size: 12px; font-weight: 700; } .live i { width: 7px; height: 7px; border-radius: 50%; background: var(--play-ink); }
  .meta { padding: 9px 2px 0; display: grid; gap: 1px; } .name { font-weight: 600; font-size: var(--t-md); }
  .line { font-size: var(--t-xs); color: var(--muted); display: flex; gap: 5px; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .line.faint { color: var(--faint); }
  .gc.sel .art { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent); }
  .pickmark { position: absolute; left: 8px; top: 8px; z-index: 3; width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; color: var(--accent-ink); background: var(--accent); }
  .prog { position: absolute; left: 0; right: 0; bottom: 0; height: 5px; background: rgba(0, 0, 0, 0.55); z-index: 2; } .prog i { display: block; height: 100%; background: var(--play); transition: width 1s linear; }
  .st { font-weight: 600; color: var(--faint); } .st.on { color: var(--good); } .dotsep { color: var(--faint); }
</style>
