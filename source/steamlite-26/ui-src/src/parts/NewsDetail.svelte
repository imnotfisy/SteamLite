<script>
  import { onMount } from 'svelte';
  import { api } from '../lib/state.svelte.js';
  import { blocks, frontMatter } from '../lib/md.js';
  import Icon from './Icon.svelte';

  // One news post, opened from its card: the card grows into a panel, then the whole post is shown (Markdown, with pictures).
  // If the post belongs to a release, that release's notes are shown under it.
  let { item, rect, onclose } = $props();
  let panel, inner, back, rel = $state(null), post = $state(item.body || ''), loadingPost = $state(!item.body && !!item.file), loading = $state(!!item.release), failed = $state(false), zoom = $state(''), busy = false;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'reduced';
  const postBlocks = $derived(blocks(post));
  const relBlocks = $derived(blocks((rel && rel.body) || ''));
  const releaseUrl = $derived((rel && rel.url) || (item.release ? 'https://github.com/imnotfisy/SteamLite/releases/tag/' + item.release : ''));
  const when = $derived(item.date ? new Date(item.date).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' }) : '');

  // The card grows into the panel. The panel is not stretched: it is moved onto the card, scaled evenly, and clipped to the card's height, then the clip opens.
  const ease = 'cubic-bezier(.16, 1, .3, 1)';
  function flip(closing) {
    const f = panel.getBoundingClientRect(), s = rect.width / f.width, dx = rect.left - f.left, dy = rect.top - f.top, cut = Math.max(0, f.height - rect.height / s);
    panel.style.transformOrigin = 'top left';
    const frames = [{ transform: `translate(${dx}px, ${dy}px) scale(${s})`, clipPath: `inset(0px 0px ${cut}px 0px round ${14 / s}px)` }, { transform: 'none', clipPath: 'inset(0px 0px 0px 0px round 24px)' }];
    return panel.animate(closing ? [...frames].reverse() : frames, { duration: closing ? 420 : 680, easing: closing ? 'cubic-bezier(.7, 0, .84, 0)' : ease, fill: 'both' }).finished;
  }
  function close() {
    if (busy) return; busy = true;
    if (reduce) return onclose();
    [...inner.children].forEach((el) => el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, fill: 'both' }));
    back.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420, delay: 60, fill: 'both' });
    flip(true).then(() => onclose());
  }
  onMount(() => {
    if (!reduce) {
      back.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 480, fill: 'both' });
      flip(false);
      [...inner.children].forEach((el, i) => el.animate([{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }], { duration: 560, delay: 220 + i * 70, easing: ease, fill: 'both' }));
    }
    if (item.file && !item.body) api('news:post', item.file).then((t) => { if (t) post = frontMatter(t).body; else failed = true; loadingPost = false; }).catch(() => { failed = true; loadingPost = false; });
    if (item.release) api('news:release', item.release).then((r) => { rel = r; loading = false; }).catch(() => (loading = false));
    const key = (e) => { if (e.key === 'Escape') { if (zoom) zoom = ''; else close(); } };
    addEventListener('keydown', key); panel.focus();
    return () => removeEventListener('keydown', key);
  });
  // links open in the browser; pictures open full size
  const click = (e) => {
    const a = e.target.closest && e.target.closest('a[data-u]'); if (a) { e.preventDefault(); api('app:openUrl', a.dataset.u); return; }
    const im = e.target.closest && e.target.closest('img'); if (im && im.src) zoom = im.src;
  };
</script>

{#snippet render(list)}
  {#each list as b}
    {#if b.t === 'h'}{#if b.level <= 2}<h3>{@html b.html}</h3>{:else}<h4>{@html b.html}</h4>{/if}
    {:else if b.t === 'p'}<p>{@html b.html}</p>
    {:else if b.t === 'ul'}<ul>{#each b.items as it}<li>{@html it}</li>{/each}</ul>
    {:else if b.t === 'ol'}<ol>{#each b.items as it}<li>{@html it}</li>{/each}</ol>
    {:else if b.t === 'quote'}<blockquote class={b.kind}>{#if b.kind}<b class="qk">{b.kind[0].toUpperCase() + b.kind.slice(1)}</b>{/if}{@html b.html}</blockquote>
    {:else if b.t === 'code'}<pre><code>{@html b.text}</code></pre>
    {:else if b.t === 'img'}<figure><img src={b.src} alt={b.alt} loading="lazy" draggable="false" />{#if b.alt}<figcaption>{b.alt}</figcaption>{/if}</figure>
    {:else if b.t === 'table'}<div class="tw"><table><thead><tr>{#each b.head as c}<th>{@html c}</th>{/each}</tr></thead><tbody>{#each b.rows as r}<tr>{#each r as c}<td>{@html c}</td>{/each}</tr>{/each}</tbody></table></div>
    {:else if b.t === 'hr'}<hr />{/if}
  {/each}
{/snippet}

<div class="back" bind:this={back} role="presentation" onclick={close}>
  <div class="panel" bind:this={panel} role="dialog" aria-modal="true" aria-label={item.title} tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={() => { }}>
    <div class="inner" bind:this={inner} style={item.release ? 'min-height: min(520px, calc(100vh - 140px))' : ''}>
      <div class="top">
        <div class="meta"><span class="tag">{item.tag}</span>{#if when}<span class="faint">{when}</span>{/if}</div>
        <button class="btn icon sm x" aria-label="Close" onclick={close}><Icon name="x" size={16} /></button>
      </div>
      <h2>{item.title}</h2>
      {#if loadingPost}<div class="skel" style="height:14px;width:80%"></div><div class="skel" style="height:14px;width:92%;margin-top:10px"></div><div class="skel" style="height:14px;width:60%;margin-top:10px"></div>
      {:else if failed}<p class="muted">Could not load this post. Check your connection and try again.</p>{/if}

      {#if postBlocks.length}
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
        <div class="notes post" onclick={click}>{@render render(postBlocks)}</div>
      {/if}

      {#if item.release}<div class="sec"><h3>Everything in this release</h3>
        {#if loading}<div class="skel" style="height:14px;width:70%"></div><div class="skel" style="height:14px;width:90%;margin-top:10px"></div>
        {:else if !rel}<p class="muted">Could not load the full notes. Read them on GitHub.</p>{/if}
      </div>{/if}
      {#if relBlocks.length}
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
        <div class="notes" onclick={click}>{@render render(relBlocks)}</div>
      {/if}

      {#if releaseUrl}<div class="foot"><button class="btn" onclick={() => api('app:openUrl', releaseUrl)}><Icon name="ext" size={16} />Open on GitHub</button></div>{/if}
    </div>
  </div>
</div>

{#if zoom}
  <div class="zoom" role="presentation" onclick={() => (zoom = '')}><img src={zoom} alt="" draggable="false" /></div>
{/if}

<style>
  @keyframes rise { from { opacity: 0; transform: translateY(12px); } }
  .back { position: fixed; inset: 0; z-index: 150; display: grid; place-items: center; padding: 40px 24px; background: rgba(10, 11, 18, 0.74); backdrop-filter: blur(8px); }
  .panel { width: min(840px, 100%); max-height: calc(100vh - 80px); overflow: auto; border-radius: 24px; background: var(--slab), var(--bg); border: 1px solid var(--line2); box-shadow: 0 40px 100px -30px #000; outline: none; will-change: transform; }
  .inner { padding: 30px 34px 32px; }
  .top { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; } .meta { display: flex; align-items: center; gap: 12px; font-size: 13px; }
  .tag { padding: 3px 12px; border-radius: 999px; background: var(--s3); color: var(--muted); font-weight: 600; font-size: 12.5px; }
  h2 { font-size: 30px; line-height: 1.15; margin-bottom: 12px; text-wrap: balance; }
  .sec { margin-top: 26px; } h3 { font-size: 19px; margin: 24px 0 8px; } h4 { font-size: 16px; margin: 18px 0 6px; } .sec h3 { margin-top: 0; }
  .notes { margin-top: 4px; color: var(--muted); line-height: 1.7; font-size: 15px; animation: rise .55s var(--ease) both; } .notes.post { color: var(--text); opacity: .92; }
  .notes p { margin: 10px 0; } .notes :global(b) { color: var(--text); } .notes :global(code) { padding: 1px 6px; border-radius: 6px; background: var(--s3); font-size: .9em; } .notes :global(a) { color: var(--accent2); text-decoration: underline; text-underline-offset: 3px; }
  ul, ol { margin: 10px 0 10px 22px; display: grid; gap: 7px; } li::marker { color: var(--accent); }
  blockquote { margin: 14px 0; padding: 10px 16px; border-left: 3px solid var(--line2); background: var(--s1); border-radius: 0 10px 10px 0; } blockquote.note, blockquote.tip, blockquote.important { border-left-color: var(--accent); } blockquote.warning { border-left-color: var(--warn); } .qk { display: block; margin-bottom: 2px; font-size: 13px; }
  pre { margin: 14px 0; padding: 14px 16px; border-radius: 12px; background: rgba(0, 0, 0, 0.35); overflow: auto; font-size: 13px; line-height: 1.5; } pre code { background: none; padding: 0; }
  hr { border: 0; border-top: 1px solid var(--line); margin: 20px 0; }
  .tw { overflow-x: auto; margin: 14px 0; } table { border-collapse: collapse; min-width: 60%; } th, td { text-align: left; padding: 8px 14px; border: 1px solid var(--line); } th { background: var(--s2); color: var(--text); }
  figure { margin: 16px 0; } figure img, .notes :global(p img) { display: block; max-width: 100%; height: auto; border-radius: 14px; border: 1px solid var(--line2); cursor: zoom-in; transition: transform .25s var(--ease), border-color .2s; } figure img:hover { transform: translateY(-2px); border-color: var(--accent); } figcaption { margin-top: 7px; font-size: 12.5px; color: var(--faint); }
  .foot { margin-top: 24px; padding-top: 18px; border-top: 1px solid var(--line); }
  .zoom { position: fixed; inset: 0; z-index: 170; display: grid; place-items: center; padding: 30px; background: rgba(5, 6, 10, 0.92); cursor: zoom-out; animation: fadein .25s ease both; } .zoom img { max-width: 100%; max-height: 100%; border-radius: 12px; box-shadow: 0 30px 80px #000; } @keyframes fadein { from { opacity: 0; } }
</style>
