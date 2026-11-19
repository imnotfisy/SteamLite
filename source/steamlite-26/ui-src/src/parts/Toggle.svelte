<script>
  let { checked = false, onchange } = $props();
</script>
<button class="tg" class:on={checked} role="switch" aria-checked={checked} aria-label="Toggle" onclick={() => onchange && onchange(!checked)}><i></i></button>
<style>
  .tg { width: 50px; height: 30px; border-radius: 999px; background: var(--s3); border: 1px solid var(--line2); position: relative; flex: none; transition: background .3s var(--ease), box-shadow .3s; }
  .tg i { position: absolute; top: 3px; left: 3px; width: 22px; height: 22px; border-radius: 50%; background: white; box-shadow: 0 2px 8px #0006; transition: transform .35s var(--spring), width .2s; }
  .tg:active i { width: 27px; }
  .tg.on { background: linear-gradient(135deg, var(--glow), var(--accent2)); border-color: transparent; box-shadow: 0 6px 20px -6px var(--glow); } .tg.on i { transform: translateX(20px); } .tg.on:active i { transform: translateX(15px); }
</style>
