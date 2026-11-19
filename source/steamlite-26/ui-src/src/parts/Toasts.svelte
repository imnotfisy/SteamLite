<script>
  import { flip } from 'svelte/animate';
  import { fly } from 'svelte/transition';
  import { backOut, cubicIn } from 'svelte/easing';
  import { S, dismissToast } from '../lib/state.svelte.js';
</script>
<div class="t">{#each S.toasts as t (t.id)}
  <div class="toast glass {t.kind}" animate:flip={{ duration: 300 }} in:fly={{ x: 60, duration: 500, easing: backOut }} out:fly={{ x: 40, duration: 260, easing: cubicIn }}><i></i><span>{t.text}</span>{#if t.action}<button class="act" onclick={() => { t.action.fn(); dismissToast(t.id); }}>{t.action.label}</button>{/if}</div>{/each}</div>
<style>
  .t { position: fixed; right: 22px; bottom: 22px; display: grid; gap: 10px; z-index: 200; justify-items: end; }
  .toast { display: flex; align-items: center; gap: 12px; padding: 13px 18px; border-radius: 16px; max-width: 380px; box-shadow: var(--shadow-lg); background: rgba(20, 23, 31, 0.85); font-weight: 550; }
  .toast .act { flex: none; margin-left: 4px; padding: 5px 12px; border-radius: 9px; font-weight: 700; color: var(--accent-ink); background: var(--accent); transition: filter .2s, transform .2s var(--spring); } .toast .act:hover { filter: brightness(1.12); } .toast .act:active { transform: scale(.95); }
  .toast i { width: 8px; height: 8px; border-radius: 50%; flex: none; background: var(--glow); box-shadow: 0 0 12px var(--glow); } .toast.bad i { background: var(--bad); box-shadow: 0 0 12px var(--bad); }
</style>
