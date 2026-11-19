<script>
  import { onDestroy } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import { expoOut } from 'svelte/easing';
  import { api } from '../lib/state.svelte.js';
  import Icon from './Icon.svelte';

  // "Sign in with Steam": opens Steam's own sign-in page in the browser, waits for it, and asks for the Steam Web API key only if it is not known yet.
  let { keep = false, allowSkip = false, onDone, onSkip, onCancel } = $props();
  let phase = $state('idle'), error = $state(''), name = $state(''), key = $state(''), busy = $state(false), unreachable = $state(false), timer = 0;

  async function start() {
    error = ''; unreachable = false; busy = true;
    const r = await api('account:steamLogin', { keep }); busy = false;
    if (!r.ok) { error = r.error || "SteamLite could not start the sign-in. Check your internet connection and try again."; unreachable = !!r.unreachable; return; }
    phase = 'waiting'; poll();
  }
  function poll() {
    clearInterval(timer);
    timer = setInterval(async () => {
      let r; try { r = await api('account:steamLoginCheck'); } catch (e) { return; }
      if (r.expired) { clearInterval(timer); phase = 'idle'; error = 'The sign-in was not finished in the browser in time. Press "Sign in with Steam" to try again.'; return; }
      if (!r.done) return;
      clearInterval(timer); handle(r);
    }, 1800);
  }
  function handle(r) {
    if (r.failed) { phase = 'idle'; error = r.error || 'Steam did not confirm the sign-in. Press "Sign in with Steam" to try again and finish it in the browser window.'; return; }
    if (r.needKey) { phase = 'key'; name = r.name || ''; error = r.error || ''; return; }
    phase = 'done'; onDone && onDone(r);
  }
  async function saveKey() { busy = true; error = ''; const r = await api('account:saveKey', { key }); busy = false; handle(r); }
  async function cancel() { clearInterval(timer); await api('account:steamLoginCancel'); phase = 'idle'; error = ''; onCancel && onCancel(); }
  const open = (e, u) => { e.preventDefault(); api('app:openUrl', u); };
  onDestroy(() => clearInterval(timer));
</script>

<div class="sl">
  {#if phase === 'idle'}
    <div in:fade={{ duration: 250 }} class="col">
      <button class="steam" disabled={busy} onclick={start}><img src="/icon.png" alt="" draggable="false" />{busy ? 'Opening Steam...' : keep ? 'Add an account with Steam' : 'Sign in with Steam'}</button>
      <p class="muted small">This opens Steam's own sign-in page in your browser. SteamLite never sees your password.</p>
      {#if error}<div class="err">{error}</div>{/if}
      {#if unreachable && allowSkip}<button class="btn" onclick={() => onSkip && onSkip()}>Continue for now</button>{/if}
      {#if keep}<button class="btn" onclick={() => onCancel && onCancel()}>Cancel</button>{/if}
    </div>
  {:else if phase === 'waiting'}
    <div in:scale={{ start: 0.96, duration: 400, easing: expoOut }} class="col wait">
      <div class="ring" aria-hidden="true"><i></i><img src="/icon.png" alt="" draggable="false" /></div>
      <b>Waiting for you to sign in on Steam...</b>
      <p class="muted small">Finish signing in in your browser. This page updates by itself.</p>
      <div class="row"><button class="btn sm" onclick={() => api('account:steamLoginReopen')}><Icon name="ext" size={15} />Open the page again</button><button class="btn sm" onclick={cancel}>Cancel</button></div>
    </div>
  {:else if phase === 'key'}
    <div in:fade={{ duration: 250 }} class="col">
      <b>{name ? 'Welcome, ' + name + '.' : 'Signed in.'} One more step.</b>
      <p class="muted small">SteamLite needs a free Steam Web API key to read your library. Paste it here once. It is saved for your account.</p>
      <input bind:value={key} type="password" placeholder="32 letters and numbers" autocomplete="off" />
      <a class="hint" href="#top" onclick={(e) => open(e, 'https://steamcommunity.com/dev/apikey')}>Get a free API key from Steam<Icon name="ext" size={13} /></a>
      {#if error}<div class="err">{error}</div>{/if}
      <button class="btn primary big" disabled={busy || !key} onclick={saveKey}>{busy ? 'Saving...' : 'Continue'}</button>
    </div>
  {:else}
    <div in:fade={{ duration: 250 }} class="col"><b>Signed in.</b></div>
  {/if}
</div>

<style>
  .sl { text-align: center; } .col { display: grid; gap: 12px; justify-items: stretch; text-align: center; } .col .row { justify-content: center; } .col .hint { margin: 0 auto; }
  .small { font-size: 12.5px; line-height: 1.5; }
  .steam { display: inline-flex; align-items: center; justify-content: center; gap: 12px; height: 56px; border-radius: 16px; font-weight: 650; font-size: 16px; color: #fff; background: #2a475e; border: 1px solid #4b6a8a66; transition: transform .25s var(--spring), box-shadow .3s, filter .2s; }
  .steam img { width: 26px; height: 26px; border-radius: 50%; } .steam:hover { filter: brightness(1.15); } .steam:active { transform: scale(.97); } .steam[disabled] { opacity: .6; pointer-events: none; }
  .err { color: var(--bad); font-size: 13px; }
  .wait { text-align: center; justify-items: center; }
  .ring { position: relative; width: 84px; height: 84px; display: grid; place-items: center; } .ring img { width: 52px; height: 52px; border-radius: 50%; }
  .ring i { position: absolute; inset: 0; border-radius: 50%; border: 3px solid transparent; border-top-color: var(--accent); animation: spin 1.1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }
  .hint { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; width: fit-content; }
</style>
