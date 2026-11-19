<script>
  import { onMount } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  import { expoOut } from 'svelte/easing';
  import { S, init, go, remember } from './lib/state.svelte.js';
  import NewsDetail from './parts/NewsDetail.svelte';
  import { resetGlow } from './lib/color.js';
  import { installClickFx, smooth } from './lib/actions.js';
  import Titlebar from './parts/Titlebar.svelte';
  import Sidebar from './parts/Sidebar.svelte';
  import Splash from './parts/Splash.svelte';
  import Toasts from './parts/Toasts.svelte';
  import AddAccount from './parts/AddAccount.svelte';
  import ConfirmClose from './parts/ConfirmClose.svelte';
  import UpdateDialog from './parts/UpdateDialog.svelte';
  import UpdateBar from './parts/UpdateBar.svelte';
  import Setup from './views/Setup.svelte';
  import Home from './views/Home.svelte';
  import Library from './views/Library.svelte';
  import GamePage from './views/GamePage.svelte';
  import News from './views/News.svelte';
  import Profile from './views/Profile.svelte';
  import Settings from './views/Settings.svelte';

  // While a game runs, animations that loop are stopped and blur is switched off (and everything pauses while SteamLite is behind the game)
  $effect(() => { document.documentElement.dataset.gaming = S.running && S.settings.gameLite !== false ? '1' : ''; });
  function idle() { document.documentElement.dataset.idle = document.documentElement.dataset.gaming === '1' && (document.hidden || !document.hasFocus()) ? '1' : ''; }
  $effect(() => { S.running; S.settings.gameLite; idle(); });
  let splash = $state(true);   // the opening screen: three seconds
  // / or Ctrl+F jumps to the library search, from any page (unless you are typing, or a pop-up is open)
  function shortcut(e) {
    const t = e.target, typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
    if (!S.ready || !S.signedIn || S.migrate || S.addAccount || S.confirmClose || document.querySelector('[role="dialog"]')) return;
    const find = (e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 'f', slash = e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey;
    if (find || slash) { e.preventDefault(); S.focusSearch = true; if (S.view !== 'library') go('library'); }
  }
  onMount(() => { installClickFx(); init().catch((e) => console.error(e)); addEventListener('keydown', shortcut); addEventListener('focus', idle); addEventListener('blur', idle); document.addEventListener('visibilitychange', idle); return () => { removeEventListener('keydown', shortcut); removeEventListener('focus', idle); removeEventListener('blur', idle); document.removeEventListener('visibilitychange', idle); }; });
  const centre = () => ({ left: innerWidth / 2 - 160, top: innerHeight / 2 - 50, width: 320, height: 100 });
  const views = { home: Home, library: Library, game: GamePage, news: News, profile: Profile, settings: Settings };
  const View = $derived(views[S.view] || Home);
  $effect(() => { if (S.ready && S.settings.splash === false && splash) splash = false; });
  $effect(() => { if (S.view !== 'home' && S.view !== 'game') resetGlow(); });
  // the page you were on is remembered, for "Open on: Last page"
  $effect(() => { if (S.ready && ['home', 'library', 'news', 'settings'].includes(S.view) && S.ui.page !== S.view) remember({ page: S.view }); });
  let scroller;
  $effect(() => { S.view; S.gameId; if (scroller) scroller.scrollTo({ top: 0 }); });
</script>

<Titlebar showMe={!splash && S.ready && S.signedIn && !S.migrate} />
{#if splash}
  <Splash duration={2500} ondone={() => (splash = false)} />
{:else if !S.ready}
  <div class="boot" out:fade={{ duration: 300 }}><img src="/icon.png" alt="" /></div>
{:else if !S.signedIn || S.migrate}
  <main class="solo" in:fade={{ duration: 500 }}><Setup /></main>
{:else}
  <Sidebar />
  <main bind:this={scroller} use:smooth>
    <UpdateBar />
    {#key S.view + (S.gameId || '')}<div class="view" in:fly={{ y: 22, duration: 650, easing: expoOut }}><View /></div>{/key}
  </main>
{/if}
{#if S.addAccount && S.signedIn}<AddAccount />{/if}
{#if S.update && !S.updateHidden && S.signedIn && !S.migrate}<UpdateDialog />{/if}
{#if S.confirmClose}<ConfirmClose />{/if}
{#if S.whatsNew && !splash && S.ready && S.signedIn && !S.migrate}<NewsDetail item={{ title: 'SteamLite ' + S.whatsNew.to + ' is installed', tag: "What's new", content: 'You updated from ' + S.whatsNew.from + '. Here is what changed.', release: S.whatsNew.tag, date: '' }} rect={centre()} onclose={() => (S.whatsNew = null)} />{/if}
<Toasts />

<style>
  main { position: fixed; inset: 0; overflow-y: auto; overflow-x: hidden; }
  main.solo { inset: 0; display: grid; place-items: center; overflow: hidden; }
  .view { min-height: 100%; }
  .boot { position: fixed; inset: 0; display: grid; place-items: center; } .boot img { width: 64px; height: 64px; border-radius: 50%; animation: bp 1.4s ease-in-out infinite; }
  @keyframes bp { 50% { transform: scale(1.18) rotate(8deg); box-shadow: 0 0 60px var(--glow); } }
</style>
