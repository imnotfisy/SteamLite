<script>
  import { onMount } from 'svelte';
  import { api } from '../lib/state.svelte.js';

  // The roadmap: what is being worked on, when, and how far along it is. It comes from roadmap.json on GitHub, so it can change without a new release.
  let data = $state(null);
  onMount(() => { api('news:roadmap').then((d) => (data = d)).catch(() => (data = { items: [] })); });
  const LABEL = { shipped: 'Released', progress: 'In progress', planned: 'Planned', delayed: 'Delayed', conditional: 'If ready' };
  const day = (s) => { const d = new Date(s + 'T12:00:00'); return isNaN(d) ? s : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); };
  const year = (s) => { const d = new Date(s + 'T12:00:00'); return isNaN(d) ? '' : d.getFullYear(); };
  const pct = (it) => Math.max(0, Math.min(100, Number(it.progress) || 0));
  const items = $derived(data && Array.isArray(data.items) ? data.items : []);
</script>

{#if data === null}
  {#each Array(3) as _}<div class="skel" style="height:120px"></div>{/each}
{:else if !items.length}
  <div class="muted">Could not load the roadmap. Check your connection.</div>
{:else}
  <div class="road">
    {#each items as it, i (it.id || it.title)}
      <article class="step rise" class:done={it.status === 'shipped'} style="--i:{i}">
        <div class="when"><b>{day(it.date)}</b><small>{year(it.date)}</small></div>
        <div class="dot" data-s={it.status}><i></i></div>
        <div class="card body">
          <div class="top"><h3>{it.title}</h3><span class="chip" data-s={it.status}>{LABEL[it.status] || it.status}</span></div>
          {#if it.text}<p class="muted">{it.text}</p>{/if}
          {#if it.features && it.features.length}<ul>{#each it.features as f}<li>{f}</li>{/each}</ul>{/if}
          {#if it.note}<p class="note">{it.note}</p>{/if}
          {#if it.status !== 'shipped' || it.progress !== undefined}
            <div class="prog" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={pct(it)}><i style="width:{pct(it)}%"></i></div>
            <div class="pl"><span>{pct(it)}%</span>{#if it.progressLabel}<span class="faint">{it.progressLabel}</span>{/if}</div>
          {/if}
        </div>
      </article>
    {/each}
  </div>
  {#if data.updated}<div class="faint upd">Updated {data.updated}. This list can change as we learn more.</div>{/if}
{/if}

<style>
  .road { position: relative; display: grid; gap: 16px; }
  .road::before { content: ''; position: absolute; left: 112px; top: 14px; bottom: 14px; width: 2px; background: var(--line2); border-radius: 2px; }
  .step { display: grid; grid-template-columns: 84px 28px minmax(0, 1fr); gap: 14px; align-items: start; }
  .when { text-align: right; padding-top: 18px; } .when b { display: block; font-size: 16px; } .when small { color: var(--faint); font-size: 12px; }
  .dot { position: relative; z-index: 1; display: grid; place-items: center; width: 28px; height: 28px; margin-top: 16px; border-radius: 50%; background: var(--bg); border: 2px solid var(--line2); } .dot i { width: 10px; height: 10px; border-radius: 50%; background: var(--faint); }
  .dot[data-s='shipped'] { border-color: var(--good); } .dot[data-s='shipped'] i { background: var(--good); }
  .dot[data-s='progress'] { border-color: var(--accent); } .dot[data-s='progress'] i { background: var(--accent); animation: pulse 1.8s ease-in-out infinite; }
  .dot[data-s='delayed'] { border-color: var(--warn); } .dot[data-s='delayed'] i { background: var(--warn); }
  @keyframes pulse { 50% { transform: scale(1.5); opacity: .55; } }
  .body { padding: 18px 20px 16px; } .top { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; } h3 { font-size: 19px; }
  .chip { padding: 3px 11px; border-radius: 999px; font-size: 12px; font-weight: 650; background: var(--s3); color: var(--muted); }
  .chip[data-s='shipped'] { background: color-mix(in srgb, var(--good) 22%, transparent); color: var(--good); } .chip[data-s='progress'] { background: var(--accent); color: var(--accent-ink); } .chip[data-s='delayed'] { background: color-mix(in srgb, var(--warn) 22%, transparent); color: var(--warn); }
  p { line-height: 1.6; margin-top: 8px; } ul { margin: 10px 0 0 20px; display: grid; gap: 6px; color: var(--muted); } li::marker { color: var(--accent); }
  .note { font-size: 13px; color: var(--faint); font-style: italic; }
  .prog { height: 6px; border-radius: 6px; background: var(--s3); overflow: hidden; margin-top: 14px; } .prog i { display: block; height: 100%; border-radius: 6px; background: var(--accent); transition: width .9s var(--ease); }
  .done .prog i { background: var(--good); }
  .pl { display: flex; justify-content: space-between; margin-top: 6px; font-size: 12.5px; color: var(--muted); font-variant-numeric: tabular-nums; }
  .upd { margin-top: 18px; text-align: center; font-size: 12.5px; }
  @media (max-width: 760px) { .road::before { display: none; } .step { grid-template-columns: 1fr; } .when { text-align: left; padding-top: 0; } .dot { display: none; } }
</style>
