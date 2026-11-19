<script>
  // a small switch between a few choices, with a highlight that slides to the chosen one
  import { magnet } from '../lib/magnet.js';
  let { options = [], value = '', onchange, label = '' } = $props();
  const idx = $derived(Math.max(0, options.findIndex((o) => o[0] === value)));
</script>

<div class="seg" use:magnet role="radiogroup" aria-label={label} style="--n:{options.length}">
  <div class="ind" style="transform: translateX({idx * 100}%)"></div>
  {#each options as [v, l]}
    <button role="radio" aria-checked={v === value} class:on={v === value} onclick={() => onchange && onchange(v)}>{l}</button>
  {/each}
</div>

<style>
  .seg { position: relative; display: grid; grid-template-columns: repeat(var(--n), 1fr); padding: 4px; border-radius: 14px; background: var(--s1); border: 1px solid var(--line); flex: none; }
  .seg button { position: relative; z-index: 1; height: 36px; min-width: 92px; padding: 0 14px; border-radius: 10px; font-weight: 650; color: var(--muted); transition: color .25s; white-space: nowrap; }
  .seg button.on { color: var(--accent-ink); } .seg button:not(.on):hover { color: var(--text); }
  .ind { position: absolute; top: 4px; bottom: 4px; left: 4px; width: calc((100% - 8px) / var(--n)); border-radius: 10px; background: linear-gradient(135deg, color-mix(in srgb, var(--glow) 70%, white), var(--accent2)); box-shadow: 0 6px 20px -6px color-mix(in srgb, var(--glow) 90%, transparent); transition: transform .5s var(--spring); }
</style>
