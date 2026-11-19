<script>
  import { slide } from 'svelte/transition';
  import { expoOut } from 'svelte/easing';
  import { S, api, toast } from '../lib/state.svelte.js';
  import Icon from './Icon.svelte';
  async function install() {
    S.updateState = 'downloading'; S.updatePct = 0;
    const r = await api('update:install');
    if (!r.ok) { S.updateState = ''; toast(r.error || 'The update could not be downloaded.', 'bad'); return; }
    restart();                                          // downloaded: SteamLite closes and the installer opens
  }
  async function restart() { if (!(await api('update:restart'))) toast('Could not start the installer.', 'bad'); }
</script>

{#if S.update && S.updateHidden && S.updateState}
  <div class="wrap" transition:slide={{ duration: 450, easing: expoOut }}>
    <div class="bar glass">
      <span class="ic"><Icon name="download" size={19} /></span>
      <div class="grow"><b>SteamLite {S.update.version} is ready to download</b>
        <div class="muted">{S.updateState === 'downloading' ? 'Downloading ' + S.updatePct + '%' : S.updateState === 'ready' ? 'Downloaded. Opening the installer...' : 'A new version is available.'}</div></div>
      {#if S.updateState === 'ready'}<button class="btn primary" onclick={restart}>Open the installer</button>
      {:else if S.updateState === 'downloading'}<div class="track"><i style="width:{S.updatePct}%"></i></div>
      {:else}<button class="btn primary" onclick={install}>Update</button><button class="btn" onclick={() => (S.update = null)}>Later</button>{/if}
    </div>
  </div>
{/if}

<style>
  .wrap { padding: 16px 44px 0 100px; max-width: 1500px; margin: 0 auto; }
  .bar { display: flex; align-items: center; gap: 14px; padding: 12px 16px; border-radius: 18px; border-color: color-mix(in srgb, var(--glow) 50%, transparent); box-shadow: 0 10px 40px -16px var(--glow); }
  .ic { width: 38px; height: 38px; display: grid; place-items: center; border-radius: 12px; background: color-mix(in srgb, var(--glow) 25%, transparent); }
  .track { width: 200px; height: 8px; border-radius: 8px; background: var(--s3); overflow: hidden; } .track i { display: block; height: 100%; border-radius: 8px; background: linear-gradient(90deg, var(--glow), var(--accent2)); transition: width .4s var(--ease); }
</style>
