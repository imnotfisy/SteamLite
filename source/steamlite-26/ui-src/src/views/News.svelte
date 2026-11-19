<script>
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { expoOut } from 'svelte/easing';
  import { api } from '../lib/state.svelte.js';
  import { date } from '../lib/util.js';
  import Icon from '../parts/Icon.svelte';
  import { magnet } from '../lib/magnet.js';
  import NewsDetail from '../parts/NewsDetail.svelte';
  import Roadmap from '../parts/Roadmap.svelte';

  // News: posts are Markdown files on GitHub, listed by when they were published. The newest one is featured, the rest are grouped by day.
  let tab = $state('steamlite'), list = $state(null), failed = $state(false), feed = $state(null), q = $state(''), tag = $state('All'), shown = $state(14), detail = $state(null), seen = $state('');
  const SEEN = 'sl-news-seen';
  const read = () => { try { return localStorage.getItem(SEEN) || ''; } catch (e) { return ''; } };
  async function load() { list = null; failed = false; const r = await api('news:list'); failed = !!r.failed; list = (r.posts || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date)); }
  onMount(() => { seen = read(); load(); api('news:feed').then((d) => (feed = d)).catch(() => (feed = [])); });
  // everything shown on the SteamLite tab counts as read after a moment
  $effect(() => { if (tab === 'steamlite' && list && list.length) { const t = setTimeout(() => { try { localStorage.setItem(SEEN, list[0].date); } catch (e) { } }, 2500); return () => clearTimeout(t); } });
  const isNew = (p) => !!seen && new Date(p.date) > new Date(seen);

  const tags = $derived(list ? ['All', ...[...new Set(list.map((p) => p.tag))]] : ['All']);
  const filtered = $derived((list || []).filter((p) => (tag === 'All' || p.tag === tag) && (!q.trim() || (p.title + ' ' + (p.summary || '')).toLowerCase().includes(q.trim().toLowerCase()))));
  const feature = $derived(!q.trim() && tag === 'All' ? (filtered.find((p) => p.pinned) || filtered[0]) : null);
  const rest = $derived(filtered.filter((p) => p !== feature));
  const visible = $derived(rest.slice(0, shown));

  const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  function dayLabel(iso) {
    const d = new Date(iso), now = new Date(), y = new Date(now.getTime() - 864e5);
    if (sameDay(d, now)) return 'Today'; if (sameDay(d, y)) return 'Yesterday';
    return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: d.getFullYear() === now.getFullYear() ? undefined : 'numeric' });
  }
  const groups = $derived.by(() => { const out = []; for (const p of visible) { const k = dayLabel(p.date), last = out[out.length - 1]; if (last && last.k === k) last.posts.push(p); else out.push({ k, posts: [p] }); } return out; });
  const clock = (iso) => new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  const ago = (iso) => { const m = Math.round((Date.now() - new Date(iso)) / 60000); if (m < 1) return 'just now'; if (m < 60) return m + ' min ago'; const h = Math.round(m / 60); if (h < 24) return h + ' h ago'; const d = Math.round(h / 24); return d < 30 ? d + ' days ago' : ''; };

  const open = (u) => u && api('app:openUrl', u);
  const show = (e, p) => { const el = e.currentTarget; detail = { item: { title: p.title, tag: p.tag, date: p.date, file: p.file, release: p.release }, rect: el.getBoundingClientRect(), el }; el.style.visibility = 'hidden'; };   // the card is hidden while it is open: it is the card that grows
  const closed = () => { if (detail && detail.el) detail.el.style.visibility = ''; detail = null; };
</script>

<div class="page mid">
  <div class="hd rise" style="--i:0"><h1 class="title">News</h1><p class="sub">What is new in SteamLite and in the games you play.</p></div>
  <div class="seg rise" use:magnet style="--i:1"><div class="ind" style="transform:translateX({tab === 'steamlite' ? 0 : tab === 'roadmap' ? 100 : 200}%)"></div><button class:on={tab === 'steamlite'} onclick={() => (tab = 'steamlite')}>SteamLite</button><button class:on={tab === 'roadmap'} onclick={() => (tab = 'roadmap')}>Roadmap</button><button class:on={tab === 'games'} onclick={() => (tab = 'games')}>Your games</button></div>

  {#key tab}
    <div class="list" in:fly={{ y: 18, duration: 500, easing: expoOut }}>
      {#if tab === 'steamlite'}
        {#if list === null}<div class="skel" style="height:210px"></div>{#each Array(3) as _}<div class="skel" style="height:96px"></div>{/each}
        {:else if failed || !list.length}
          <div class="empty card"><Icon name="news" size={28} /><h3>{failed ? 'The news did not load' : 'No news yet'}</h3><p class="muted">{failed ? 'SteamLite could not reach GitHub. Check your connection, then try again.' : 'Nothing has been posted yet.'}</p><button class="btn" onclick={load}><Icon name="refresh" size={16} />Try again</button></div>
        {:else}
          <div class="tools">
            <label class="search"><Icon name="search" size={16} /><input placeholder="Search news" aria-label="Search news" bind:value={q} oninput={() => (shown = 14)} /></label>
            <div class="chips">{#each tags as t}<button class="chip" class:on={tag === t} onclick={() => { tag = t; shown = 14; }}>{t}</button>{/each}</div>
          </div>

          {#if feature}
            <button class="feature card link rise" onclick={(e) => show(e, feature)} style="--i:0">
              {#if feature.cover}<span class="cover" style="background-image:url({feature.cover})"></span>{/if}
              <span class="ftext">
                <span class="meta"><span class="tag hot">{feature.tag}</span>{#if isNew(feature)}<span class="new">New</span>{/if}<span class="faint">{ago(feature.date) || date(new Date(feature.date) / 1000)}</span></span>
                <b class="ftitle">{feature.title}</b>
                {#if feature.summary}<span class="muted fsum">{feature.summary}</span>{/if}
                <span class="more">Read the post<Icon name="back" size={15} /></span>
              </span>
            </button>
          {/if}

          {#each groups as g, gi (g.k)}
            <section class="day">
              <h2 class="dh">{g.k}</h2>
              <div class="posts">
                {#each g.posts as p, i (p.id)}
                  <button class="card post link rise" style="--i:{Math.min(i + gi, 8)}" onclick={(e) => show(e, p)}>
                    <span class="time">{clock(p.date)}</span>
                    <span class="pbody">
                      <span class="meta"><span class="tag">{p.tag}</span>{#if isNew(p)}<span class="new">New</span>{/if}</span>
                      <b class="ptitle">{p.title}</b>
                      {#if p.summary}<span class="muted psum">{p.summary}</span>{/if}
                    </span>
                    {#if p.cover}<span class="thumb" style="background-image:url({p.cover})"></span>{/if}
                  </button>
                {/each}
              </div>
            </section>
          {/each}

          {#if !filtered.length}<div class="muted none">No posts match your search.</div>{/if}
          {#if rest.length > shown}<button class="btn more-btn" onclick={() => (shown += 14)}>Show older posts ({rest.length - shown} more)</button>{/if}
        {/if}
      {:else if tab === 'roadmap'}<Roadmap />
      {:else if feed === null}{#each Array(4) as _}<div class="skel" style="height:110px"></div>{/each}
      {:else if !feed.length}<div class="muted">No news for your games right now.</div>
      {:else}{#each feed as n, i (n.gid)}<button class="card gpost link rise" style="--i:{Math.min(i, 10)}" onclick={() => open(n.url)}><div class="meta"><span class="tag">{n.game}</span><span class="faint">{date(n.date)}</span><span class="grow"></span><Icon name="ext" size={15} /></div><h3>{n.title}</h3>{#if n.text}<p class="muted">{n.text}</p>{/if}</button>{/each}{/if}
    </div>
  {/key}
</div>

{#if detail}<NewsDetail item={detail.item} rect={detail.rect} onclose={closed} />{/if}

<style>
  .hd { text-align: center; }
  .seg { position: relative; display: grid; grid-template-columns: repeat(3, 1fr); padding: 4px; border-radius: 16px; background: var(--s1); border: 1px solid var(--line); margin: 0 auto 24px; width: fit-content; }
  .seg button { position: relative; z-index: 1; height: 40px; min-width: 130px; padding: 0 22px; border-radius: 12px; color: var(--muted); font-weight: 650; transition: color .25s; } .seg button.on { color: var(--text); }
  .ind { position: absolute; top: 4px; bottom: 4px; left: 4px; width: calc((100% - 8px) / 3); border-radius: 12px; background: var(--s3); box-shadow: inset 0 1px 0 #ffffff14; transition: transform .5s var(--spring); }
  .list { display: grid; gap: 14px; }
  .tools { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between; }
  .search { display: flex; align-items: center; gap: 10px; flex: 1 1 220px; max-width: 320px; padding: 0 14px; height: 42px; border-radius: 13px; background: var(--s1); border: 1px solid var(--line); color: var(--faint); } .search:focus-within { border-color: var(--accent); color: var(--accent); } .search input { flex: 1; border: 0 !important; background: transparent !important; box-shadow: none !important; height: 40px; padding: 0; color: var(--text); }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .meta { display: flex; gap: 10px; align-items: center; font-size: 12.5px; color: var(--faint); }
  .tag { padding: 3px 11px; border-radius: 999px; background: var(--s2); color: var(--muted); font-weight: 600; font-size: 12px; } .tag.hot { background: var(--accent); color: var(--accent-ink); }
  .new { padding: 2px 9px; border-radius: 999px; font-size: 11.5px; font-weight: 700; background: var(--accent2); color: var(--accent-ink); }
  .link { text-align: left; cursor: pointer; transition: transform .3s var(--spring), border-color .25s; } .link:hover { transform: translateY(-3px); border-color: var(--accent); }
  .feature { position: relative; display: grid; grid-template-columns: minmax(0, 1fr); overflow: hidden; width: 100%; min-height: 190px; padding: 0; }
  .feature .cover { position: absolute; inset: 0; background-size: cover; background-position: center; opacity: .28; mask-image: linear-gradient(90deg, transparent 20%, #000 100%); }
  .ftext { position: relative; display: grid; gap: 10px; align-content: center; padding: 28px 30px; max-width: 78%; }
  .ftitle { font-size: 26px; line-height: 1.15; letter-spacing: -0.02em; text-wrap: balance; } .fsum { line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  .more { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: var(--faint); transition: color .2s, gap .25s var(--ease); } .more :global(svg) { transform: rotate(180deg); } .link:hover .more { color: var(--text); gap: 10px; }
  .day { display: grid; gap: 10px; margin-top: 10px; }
  .dh { position: sticky; top: 8px; z-index: 5; width: fit-content; padding: 5px 14px; border-radius: 999px; font-size: 13px; font-weight: 650; letter-spacing: 0; color: var(--muted); background: var(--rail); border: 1px solid var(--line); }
  .posts { display: grid; gap: 10px; }
  .post { display: grid; grid-template-columns: 64px minmax(0, 1fr) auto; gap: 16px; align-items: start; width: 100%; padding: 16px 18px; }
  .time { padding-top: 3px; font-size: 13px; font-weight: 600; color: var(--faint); font-variant-numeric: tabular-nums; }
  .pbody { display: grid; gap: 6px; min-width: 0; } .ptitle { font-size: 17px; line-height: 1.25; } .psum { font-size: 14px; line-height: 1.55; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .thumb { width: 104px; height: 66px; border-radius: 10px; background-size: cover; background-position: center; border: 1px solid var(--line2); }
  .gpost { display: block; width: 100%; padding: 20px 22px; } .gpost h3 { font-size: 18px; margin: 6px 0; } .gpost p { line-height: 1.55; }
  .empty { display: grid; justify-items: center; gap: 10px; padding: 50px 24px; text-align: center; color: var(--faint); } .empty h3 { color: var(--text); }
  .none { text-align: center; padding: 30px 0; } .more-btn { justify-self: center; margin-top: 8px; }
  @media (max-width: 760px) { .post { grid-template-columns: minmax(0, 1fr); } .time { padding: 0; } .thumb { display: none; } .ftext { max-width: 100%; } }
</style>
