<script>
  import { art } from '../lib/util.js';
  import { api } from '../lib/state.svelte.js';
  // a game picture: the tall capsule, then the wide header, then a coloured tile with the first letter. It fades in when it has loaded.
  // If the usual addresses fail (many new games keep their art under a code in the address), the core asks Steam's store for the exact files.
  let { g, kind = 'capsule', alt = '', zoom = false } = $props();
  let failed = $state([]), extra = $state([]), loaded = $state(false), asked = false;
  const base = $derived(art.list(g, kind));
  const order = $derived([...base.slice(0, 1), ...extra, ...base.slice(1)]);
  const src = $derived(order.find((u) => !failed.includes(u)));
  let gid = g.id; $effect(() => { if (g.id !== gid) { gid = g.id; failed = []; extra = []; asked = false; loaded = false; } });
  function bad(u) {
    loaded = false; failed = [...failed, u];
    if (!asked && !g.nonSteam && /^\d+$/.test(String(g.id))) {           // the first address failed: ask for the right ones now, while the others are tried
      asked = true; const id = g.id;
      api('art:resolve', id).then((r) => { if (r && g.id === id) extra = (r[kind] || r.capsule || []).filter((x) => x.startsWith('https://')); }).catch(() => { });
    }
  }
  const hue = $derived([...(g.name || '?')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360);
</script>

<div class="c" class:zoom>
  {#if src}
    <img {src} alt={alt || g.name} draggable="false" class:in={loaded} onload={() => (loaded = true)} onerror={() => bad(src)} />
  {/if}
  {#if !src || !loaded}
    <div class="ph" class:skel={!!src} style="--h:{hue}">{#if !src}<span>{(g.name || '?').trim()[0]?.toUpperCase()}</span>{/if}</div>
  {/if}
</div>

<style>
  .c { position: absolute; inset: 0; overflow: hidden; }
  img { width: 100%; height: 100%; object-fit: cover; display: block; opacity: 0; transform: scale(1.06); filter: blur(10px); transition: opacity .6s var(--ease), transform .9s var(--ease), filter .7s var(--ease); }
  img.in { opacity: 1; transform: scale(1); filter: none; }
  .zoom img.in { transition: transform .9s var(--ease); } :global(.gc:hover) .zoom img.in { transform: scale(1.07); }
  .ph { position: absolute; inset: 0; display: grid; place-items: center; background: linear-gradient(145deg, hsl(var(--h) 45% 26%), hsl(calc(var(--h) + 40) 50% 14%)); }
  .ph.skel { background: var(--s1); } .ph span { font-size: 46px; font-weight: 800; color: #ffffffaa; }
</style>
