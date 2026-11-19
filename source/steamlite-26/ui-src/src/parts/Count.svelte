<script>
  import { onMount } from 'svelte';
  // a number that counts up to its value, then follows changes smoothly
  let { value = 0, format = (n) => Math.round(n).toLocaleString(), duration = 900 } = $props();
  let shown = $state(0), from = 0, raf = 0;
  function run(to) {
    cancelAnimationFrame(raf); const t0 = performance.now(), a = from;
    const step = (t) => { const k = Math.min(1, (t - t0) / duration), e = 1 - Math.pow(1 - k, 4); shown = a + (to - a) * e; if (k < 1) raf = requestAnimationFrame(step); else from = to; };
    raf = requestAnimationFrame(step);
  }
  $effect(() => { run(Number(value) || 0); return () => cancelAnimationFrame(raf); });
</script>
{format(shown)}
