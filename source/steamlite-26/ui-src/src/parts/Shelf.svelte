<script>
  import { wheelX, reveal } from '../lib/actions.js';
  import Icon from './Icon.svelte';
  // a row of things that scrolls sideways, with arrows that appear when there is more to see
  let { children } = $props();
  let el, atStart = $state(true), atEnd = $state(false);
  const upd = () => { if (!el) return; atStart = el.scrollLeft < 8; atEnd = el.scrollLeft + el.clientWidth > el.scrollWidth - 8; };
  const by = (d) => el.scrollBy({ left: d * el.clientWidth * 0.8, behavior: 'smooth' });
  $effect(() => { upd(); });
</script>

<div class="shelf" use:reveal>
  <button class="ar l" class:hide={atStart} aria-label="Scroll left" onclick={() => by(-1)}><Icon name="back" size={20} /></button>
  <div class="track" bind:this={el} onscroll={upd} use:wheelX>{@render children()}</div>
  <button class="ar r" class:hide={atEnd} aria-label="Scroll right" onclick={() => by(1)}><Icon name="back" size={20} /></button>
</div>

<style>
  .shelf { position: relative; margin: 0 -12px; }
  .track { display: flex; gap: 20px; overflow-x: auto; padding: 14px 12px 18px; scroll-snap-type: x proximity; scroll-padding-inline: 12px; scrollbar-width: none; mask-image: linear-gradient(90deg, transparent, #000 12px, #000 calc(100% - 40px), transparent); }
  .track::-webkit-scrollbar { display: none; } .track > :global(*) { flex: 0 0 172px; scroll-snap-align: start; }
  .ar { position: absolute; top: 38%; z-index: 5; width: 46px; height: 46px; border-radius: 50%; display: grid; place-items: center; background: rgba(12, 14, 20, 0.82); border: 1px solid var(--line2); backdrop-filter: blur(12px); box-shadow: var(--shadow-lg); transition: opacity .25s, transform .3s var(--spring); }
  .ar.l { left: 6px; } .ar.r { right: 6px; transform: scaleX(-1); } .ar:hover { transform: scale(1.1); } .ar.r:hover { transform: scaleX(-1) scale(1.1); }
  .ar.hide { opacity: 0; pointer-events: none; }
</style>
