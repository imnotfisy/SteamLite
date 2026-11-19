<script>
  import { fade, scale } from 'svelte/transition';
  import { expoOut } from 'svelte/easing';
  import { S, api, toast } from '../lib/state.svelte.js';
  import { notesBlocks } from '../lib/util.js';
  import { escape } from '../lib/actions.js';
  import Icon from './Icon.svelte';
  import Ver from './Ver.svelte';
  // A new version is available: what is new, and the buttons to download and install it.
  const blocks = $derived(notesBlocks(S.update && S.update.notes));
  const busy = $derived(S.updateState === 'downloading');
  async function install() {
    S.updateState = 'downloading'; S.updatePct = 0;
    const r = await api('update:install');
    if (!r.ok) { S.updateState = ''; toast(r.error || 'The update could not be downloaded.', 'bad'); return; }
    restart();                                          // downloaded: SteamLite closes and the installer opens
  }
  async function restart() { if (!(await api('update:restart'))) toast('Could not start the installer.', 'bad'); }
  const hide = () => { S.updateHidden = true; };
</script>

<div class="back" role="presentation" onclick={hide} transition:fade={{ duration: 250 }} use:escape={hide}>
  <div class="dlg glass" role="dialog" tabindex="-1" aria-label="Update available" onclick={(e) => e.stopPropagation()} onkeydown={() => { }} in:scale={{ start: 0.93, duration: 480, easing: expoOut }}>
    <div class="head">
      <span class="ic"><Icon name="download" size={26} /></span>
      <div class="grow">
        <div class="eyebrow">Update available</div>
        <h2>SteamLite <Ver v={S.update.version} /></h2>
        <div class="vers muted">You have <Ver v={S.version} /> <Icon name="back" size={13} /> <b><Ver v={S.update.version} /></b></div>
      </div>
      <button class="btn icon sm" aria-label="Close" onclick={hide}><Icon name="x" size={16} /></button>
    </div>

    <div class="notes">
      <h3>What's new</h3>
      {#if blocks.length}
        <ul>{#each blocks as b}{#if b.t === 'li'}<li>{@html b.html}</li>{:else if b.t === 'h'}<h4>{@html b.html}</h4>{:else}<p class="muted">{@html b.html}</p>{/if}{/each}</ul>
      {:else}<p class="muted">This version has no release notes yet.</p>{/if}
    </div>

    <div class="foot">
      {#if S.updateState === 'ready'}
        <div class="grow"><b>Downloaded.</b><div class="muted">SteamLite is closing and the installer is opening. Your settings and data are kept.</div></div>
        <button class="btn primary big" onclick={restart}>Open the installer</button>
      {:else if busy}
        <div class="grow"><b>Downloading {S.updatePct}%</b><div class="track"><i style="width:{S.updatePct}%"></i></div></div>
        <button class="btn" onclick={hide}>Hide</button>
      {:else}
        <div class="grow muted">Your settings and data are kept.</div>
        <button class="btn" onclick={hide}>Later</button>
        <button class="btn primary big" onclick={install}><Icon name="download" size={18} />Update now</button>
      {/if}
    </div>
  </div>
</div>

<style>
  .back { position: fixed; inset: 0; z-index: 160; display: grid; place-items: center; background: rgba(4, 5, 8, 0.72); backdrop-filter: blur(10px); }
  .dlg { width: min(600px, calc(100vw - 48px)); max-height: calc(100vh - 80px); display: grid; grid-template-rows: auto minmax(0, 1fr) auto; border-radius: 28px; background: rgba(18, 20, 28, 0.95); box-shadow: var(--shadow-lg), 0 0 80px -30px var(--glow); overflow: hidden; }
  .head { display: flex; align-items: center; gap: 16px; padding: 26px 26px 18px; border-bottom: 1px solid var(--line); background: linear-gradient(135deg, color-mix(in srgb, var(--glow) 16%, transparent), transparent); }
  .ic { width: 56px; height: 56px; border-radius: 18px; display: grid; place-items: center; color: var(--accent-ink); background: linear-gradient(135deg, color-mix(in srgb, var(--glow) 70%, white), var(--accent2)); box-shadow: 0 14px 34px -10px var(--glow); }
  h2 { font-size: 24px; margin: 2px 0 4px; } .vers { display: flex; align-items: center; gap: 7px; font-size: 13px; } .vers :global(svg) { transform: scaleX(-1); }
  .notes { padding: 20px 26px; overflow-y: auto; } h3 { font-size: 15px; margin-bottom: 12px; }
  ul { list-style: none; display: grid; gap: 10px; } li { position: relative; padding-left: 20px; line-height: 1.55; color: var(--text); } li::before { content: ''; position: absolute; left: 2px; top: 9px; width: 7px; height: 7px; border-radius: 50%; background: linear-gradient(135deg, var(--glow), var(--accent2)); }
  p { line-height: 1.55; } h4 { margin-top: 6px; } :global(.notes code) { padding: 1px 6px; border-radius: 6px; background: var(--s2); font-size: 12.5px; }
  .foot { display: flex; align-items: center; gap: 12px; padding: 18px 26px 22px; border-top: 1px solid var(--line); background: rgba(255, 255, 255, 0.02); }
  .track { height: 8px; border-radius: 8px; background: var(--s3); overflow: hidden; margin-top: 8px; } .track i { display: block; height: 100%; border-radius: 8px; background: linear-gradient(90deg, var(--glow), var(--accent2)); transition: width .4s var(--ease); position: relative; } .track i::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, .45), transparent); animation: sh 1.3s infinite; } @keyframes sh { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
</style>
