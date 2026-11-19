<script>
  // the version, with ".beta" picked out in the accent colour
  let { v = '' } = $props();
  const beta = $derived(/\.beta$/i.test(v));
  const num = $derived(v.replace(/\.beta$/i, ''));
</script>
<span class="ver">{num}{#if beta}<span class="b">.beta</span>{/if}</span>
<style>
  .b { color: var(--warn); font-weight: 750; text-shadow: 0 0 14px color-mix(in srgb, var(--warn) 60%, transparent); }
</style>
