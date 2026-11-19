<script>
  import { S, api, loadLibrary, refreshAccounts } from '../lib/state.svelte.js';
  import SteamLogin from '../parts/SteamLogin.svelte';
  // shown for a new sign-in, and once for everyone who was signed in the old way (a Steam ID and API key)
  const migrate = $derived(S.signedIn && S.migrate);
  async function done() {
    const b = await api('app:boot'); S.signedIn = true; S.migrate = false; S.steamId = b.steamId; S.settings = b.settings;
    loadLibrary(); refreshAccounts();
  }
  const skip = () => { S.migrate = false; };     // only offered when the server cannot be reached; it asks again next time
</script>

<div class="box glass" style="z-index:1">
  <img class="logo rise" style="--i:0" src="/icon.png" alt="SteamLite" draggable="false" />
  <h1 class="rise" style="--i:1">{migrate ? 'Sign in with Steam' : 'Sign in with Steam'}</h1>
  <p class="muted rise" style="--i:2">{migrate ? 'SteamLite now signs in through Steam. Your library, favorites, collections and play time are kept. You only need to do this once.' : 'SteamLite shows your Steam games and counts your play time. Sign in to load your library.'}</p>
  <div class="rise" style="--i:3"><SteamLogin allowSkip={migrate} onDone={done} onSkip={skip} /></div>
</div>

<style>
  .orbs { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
  .orbs i { position: fixed; border-radius: 50%; filter: blur(80px); opacity: .5; animation: float 14s ease-in-out infinite alternate; } .orbs i:nth-child(1) { width: 420px; height: 420px; left: 12%; top: 10%; background: #6d7dff; } .orbs i:nth-child(2) { width: 360px; height: 360px; right: 12%; bottom: 8%; background: #3fd6ee; animation-delay: -5s; } .orbs i:nth-child(3) { width: 280px; height: 280px; right: 30%; top: 6%; background: #b266ff; animation-delay: -9s; opacity: .35; }
  @keyframes float { to { transform: translate3d(40px, -30px, 0) scale(1.15); } }
  .box { position: relative; width: min(460px, calc(100vw - 48px)); display: grid; gap: 14px; text-align: center; justify-items: stretch; padding: 40px; border-radius: 30px; background: var(--slab); box-shadow: var(--shadow-lg); }
  .logo { width: 64px; height: 64px; border-radius: 50%; margin: 0 auto; margin-bottom: 8px; animation: rise .65s var(--ease) both; } @keyframes lg { 50% { transform: rotate(8deg) scale(1.06); } }
  h1 { font-size: var(--t-2xl); font-weight: 650; letter-spacing: -0.02em; } p { line-height: 1.55; margin-bottom: 6px; }
</style>
