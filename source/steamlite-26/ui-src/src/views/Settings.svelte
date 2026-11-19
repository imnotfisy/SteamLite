<script>
  import { onMount, onDestroy } from 'svelte';
  import { S, api, toast, loadLibrary, refreshAccounts, applySettings } from '../lib/state.svelte.js';
  import Toggle from '../parts/Toggle.svelte';
  import Seg from '../parts/Seg.svelte';
  import Icon from '../parts/Icon.svelte';
  import { magnet } from '../lib/magnet.js';
  import { themeOpen, themeState } from '../lib/util.js';
  import Ver from '../parts/Ver.svelte';
  import { fly, fade } from 'svelte/transition';
  import { expoOut } from 'svelte/easing';

  const isBeta = $derived(S.version.endsWith('.beta'));
  // Changes are kept in a draft until you press Save. cfg is what the page shows: what is saved, with the draft on top.
  let draft = $state({});
  const cfg = $derived({ ...S.settings, ...draft });
  const dirty = $derived(Object.keys(draft).length > 0);
  const channel = $derived(cfg.channel || 'beta');
  function set(k, v) {
    const saved = S.settings[k];
    if (v === saved || (!v && !saved)) { const { [k]: _gone, ...others } = draft; draft = others; } else draft = { ...draft, [k]: v };
  }
  const pickChannel = (c) => set('channel', c);
  const themes = [
    { id: 'default', name: 'Default look', text: 'The current SteamLite look: deep navy and steel grey, with a green Play button.', swatches: ['#1A1D2A', '#2E3349', '#8D99AE', '#3ddc97'], bg: 'linear-gradient(135deg, #1A1D2A, #2E3349)' },
    { id: 'purple', name: 'Original purple and blue', text: 'The first look of the new SteamLite, with a purple and blue glow.', swatches: ['#07080c', '#6d7dff', '#7c8cff', '#3fd6ee'], bg: 'linear-gradient(135deg, #07080c, #1b1f3d)' },
    { id: 'gta6', name: 'GTA 6', text: 'To celebrate the upcoming release of GTA 6, this theme will be available from: NOV 15 - DEC 1', swatches: ['#EB9998', '#5D549C', '#6F70A2', '#7E3A63', '#A373D3'], bg: 'linear-gradient(135deg, #2b2252, #5D549C 55%, #7E3A63)' }
  ];
  const cur = $derived(themeOpen(cfg.theme) ? (cfg.theme || 'default') : 'default');         // a theme that has ended counts as the default look
  $effect(() => { const t = cur; document.documentElement.dataset.theme = t === 'purple' || t === 'gta6' ? t : ''; });     // shows the theme as soon as it is picked
  onDestroy(() => applySettings());                                                                                              // an unsaved theme is dropped when you leave
  async function save() {
    const d = { ...draft }; await api('settings:set', d);
    Object.assign(S.settings, d); applySettings(); draft = {}; toast('Settings saved.');
    if ('showAllApps' in d) reload();
    if ('channel' in d) check();                                       // a new channel looks for its update straight away
  }
  let accounts = $state({ profiles: [], activeId: null }), checking = $state(false);
  const refresh = async () => { accounts = await api('account:list'); refreshAccounts(); };
  onMount(refresh);
  async function reload() { S.games = []; await loadLibrary(); }
  async function sw(id) { await api('account:switch', id); S.steamId = id; await refresh(); reload(); toast('Switched account.'); }
  async function rm(id) { await api('account:remove', id); refresh(); }
  $effect(() => { if (!S.addAccount) refresh(); });     // the list updates when the add-account dialog closes
  async function out() { await api('account:signOut'); S.signedIn = false; S.games = []; }
  async function check() { checking = true; const r = await api('update:check'); checking = false; if (!r.ok) toast(r.error, 'bad'); else if (r.available) { S.update = { version: r.version, notes: r.notes }; S.updateHidden = false; } else toast('You are on the latest version.'); }
  // the core copies it with Windows' own clip.exe, so the window never asks for clipboard permission
  async function copyDiag() { const ok = await api('app:copyDiagnostics'); toast(ok ? 'Copied. Paste it into your bug report.' : 'Could not copy. Try again.', ok ? undefined : 'bad'); }
  async function clearCache() { const r = await api('app:clearCache'); toast(r.files ? 'Cleared ' + r.files + ' saved Steam files. They load again when needed.' : 'Nothing saved to clear.'); }
  const open = (u) => api('app:openUrl', u);
  const pages = [['home', 'Home'], ['library', 'Library'], ['last', 'Last page']], sorts = [['name', 'A to Z'], ['played', 'Most played'], ['recent', 'Recent'], ['installed', 'Installed first'], ['size', 'Largest']];
</script>

<div class="page mid">
  <div class="hd rise" style="--i:0"><h1 class="title">Settings</h1><p class="sub">SteamLite <Ver v={S.version} /></p></div>

  <div class="sech rise" style="--i:1"><h2>Accounts</h2></div>
  <div class="card list rise" style="--i:2">
    {#each accounts.profiles as a (a.steamId)}
      <div class="row acc"><div class="av">{#if a.avatar}<img src={a.avatar} alt="" />{:else}<span>{(a.name || '?')[0].toUpperCase()}</span>{/if}</div>
        <div class="grow"><b>{a.name}</b><div class="faint">{a.steamId}</div></div>
        {#if a.steamId === accounts.activeId}<span class="signed"><Icon name="check" size={14} stroke={3} />Signed in</span>{:else}<button class="btn sm" onclick={() => sw(a.steamId)}>Switch</button><button class="btn sm danger" onclick={() => rm(a.steamId)}>Remove</button>{/if}</div>
    {/each}
    <div class="row"><button class="btn" onclick={() => (S.addAccount = true)}><Icon name="plus" size={17} />Add account</button><div class="grow"></div><button class="btn danger" onclick={out}><Icon name="logout" size={17} />Sign out</button></div>
  </div>

  <div class="sech rise" style="--i:3"><h2>General</h2></div>
  <div class="card list rise" style="--i:4">
    <div class="row opt"><div class="grow"><b>Start with Windows</b><div class="muted">Open SteamLite when you sign in to your PC.</div></div><Toggle checked={cfg.startWithWindows} onchange={(v) => set('startWithWindows', v)} /></div>
    <div class="row opt"><div class="grow"><b>Start minimised</b><div class="muted">When Windows starts SteamLite for you, it waits in the tray instead of opening a window. Needs Start with Windows.</div></div><Toggle checked={!!cfg.startMinimised} onchange={(v) => set('startMinimised', v)} /></div>
    <div class="row opt"><div class="grow"><b>Close to the tray</b><div class="muted">The close button hides SteamLite to the tray instead of quitting, so play time keeps counting. Right-click the tray icon for your recent games.</div></div><Toggle checked={!!cfg.closeToTray} onchange={(v) => set('closeToTray', v)} /></div>
    <div class="row opt"><div class="grow"><b>Show in Island</b><div class="muted">If the separate Island app is running, SteamLite shows the game you are playing (with a Stop button), how long your session was, and update progress in its pill at the top of your screen.</div></div><Toggle checked={cfg.island !== false} onchange={(v) => set('island', v)} /></div>
    <div class="row opt"><div class="grow"><b>Open on</b><div class="muted">The page SteamLite shows when it starts.</div></div><Seg options={pages} value={cfg.startPage} label="Start page" onchange={(v) => set('startPage', v)} /></div>
    <div class="row opt"><div class="grow"><b>Show the opening screen</b><div class="muted">The short logo screen when SteamLite starts.</div></div><Toggle checked={cfg.splash !== false} onchange={(v) => set('splash', v)} /></div>
    <div class="row opt"><div class="grow"><b>Show what changed after an update</b><div class="muted">The first time SteamLite opens after an update, it shows the release notes.</div></div><Toggle checked={cfg.whatsNew !== false} onchange={(v) => set('whatsNew', v)} /></div>
    <div class="row opt"><div class="grow"><b>Ask before closing during a game</b><div class="muted">Closing SteamLite stops counting your play time, so it checks first.</div></div><Toggle checked={cfg.confirmClose !== false} onchange={(v) => set('confirmClose', v)} /></div>
  </div>

  <div class="sech rise" style="--i:4"><h2>Themes</h2></div>
  <div class="themes rise" style="--i:4" role="radiogroup" aria-label="Theme">
    {#each themes as t}
      <button class="theme" class:on={cur === t.id} class:locked={!themeOpen(t.id)} role="radio" aria-checked={cur === t.id} disabled={!themeOpen(t.id)} onclick={() => set('theme', t.id)}>
        <span class="prev" style="background:{t.bg}">{#each t.swatches as c}<i style="background:{c}"></i>{/each}</span>
        <b>{t.name}</b><small>{themeState(t.id).text || t.text}</small>
        {#if !themeOpen(t.id)}<span class="note">{themeState(t.id).note}</span>{/if}
        {#if cur === t.id}<span class="tick" aria-hidden="true"><Icon name="check" size={14} stroke={3} /></span>{/if}
      </button>
    {/each}
  </div>

  <div class="sech rise" style="--i:5"><h2>Appearance</h2></div>
  <div class="card list rise" style="--i:6">
    <div class="row opt"><div class="grow"><b>Colours from the game's art</b><div class="muted">The accent colour follows the game you are looking at. Off keeps the standard steel grey.</div></div><Toggle checked={!!cfg.artColour} onchange={(v) => set('artColour', v)} /></div>
    <div class="row opt"><div class="grow"><b>Animated background</b><div class="muted">The slowly moving glow behind the app.</div></div><Toggle checked={cfg.animBg !== false} onchange={(v) => set('animBg', v)} /></div>
    <div class="row opt"><div class="grow"><b>Lighter animations during a game</b><div class="muted">While a game is running, looping animations stop and the blur behind panels is switched off, so SteamLite uses less of your GPU.</div></div><Toggle checked={cfg.gameLite !== false} onchange={(v) => set('gameLite', v)} /></div>
    <div class="row opt"><div class="grow"><b>Pause SteamLite while you play</b><div class="muted">While a game is running and SteamLite is in the background, its window is paused completely: it draws nothing and uses almost no CPU, GPU or memory. It wakes up the moment you open it.</div></div><Toggle checked={!!cfg.pauseInGame} onchange={(v) => set('pauseInGame', v)} /></div>
    <div class="row opt"><div class="grow"><b>Simpler graphics</b><div class="muted">Turns off blur and large soft shadows. This makes SteamLite smoother on older PCs, virtual machines and Linux. It is on by default on Linux.</div></div><Toggle checked={!!cfg.lightGfx} onchange={(v) => set('lightGfx', v)} /></div>
    <div class="row opt"><div class="grow"><b>Reduce motion</b><div class="muted">Turns off most animations. SteamLite also follows the Windows setting.</div></div><Toggle checked={!!cfg.reduceMotion} onchange={(v) => set('reduceMotion', v)} /></div>
  </div>

  <div class="sech rise" style="--i:7"><h2>Library and notifications</h2></div>
  <div class="card list rise" style="--i:8">
    <div class="row opt"><div class="grow"><b>Sort the library by</b><div class="muted">How games are ordered when you open the library.</div></div><Seg options={sorts} value={cfg.defaultSort} label="Default sort" onchange={(v) => set('defaultSort', v)} /></div>
    <div class="row opt"><div class="grow"><b>Show everything in the library</b><div class="muted">SteamLite hides soundtracks, demos, playtests, benchmarks, servers and tools by default. Turn this on to see them too.</div></div><Toggle checked={!!cfg.showAllApps} onchange={(v) => set('showAllApps', v)} /></div>
    <div class="row opt"><div class="grow"><b>Tell me when I stop playing</b><div class="muted">A Windows notification with how long you played.</div></div><Toggle checked={!!cfg.notifyStop} onchange={(v) => set('notifyStop', v)} /></div>
  </div>

  <div class="sech rise" style="--i:9"><h2>Updates</h2></div>
  <div class="card list rise" style="--i:10">
    <div class="row opt"><div class="grow"><b>Check for updates automatically</b><div class="muted">SteamLite looks for a new version when it starts.</div></div><Toggle checked={cfg.autoUpdate} onchange={(v) => set('autoUpdate', v)} /></div>
    <div class="row opt chan"><div class="grow"><b>Update channel</b><div class="muted">Choose which updates SteamLite offers you.</div></div>
      <div class="seg2" use:magnet role="radiogroup" aria-label="Update channel">
        <div class="ind" style="transform: translateX({channel === 'release' ? 100 : 0}%)"></div>
        <button role="radio" aria-checked={channel === 'beta'} class:on={channel === 'beta'} onclick={() => pickChannel('beta')}>Beta</button>
        <button role="radio" aria-checked={channel === 'release'} class:on={channel === 'release'} onclick={() => pickChannel('release')}>Stable</button>
      </div></div>
    <div class="notice"><Icon name="news" size={20} /><div><b>SteamLite 26.11 is out as the stable version.</b><div class="muted">If you are on the Beta channel you can stay there. Beta gets new features first, so you can test them before the stable release gets them. Switch to Stable any time if you would rather have only finished updates.</div></div></div>
    <div class="row opt"><div class="grow"><b>Version <Ver v={S.version} /></b><div class="muted">Versions are the year and month, like 26.11.{isBeta ? ' This is a beta build.' : ''}</div></div><button class="btn" disabled={checking} onclick={check}><Icon name="refresh" size={17} />{checking ? 'Checking...' : 'Check now'}</button></div>
  </div>

  <div class="sech rise" style="--i:11"><h2>Data and help</h2></div>
  <div class="card list rise" style="--i:12">
    <div class="row opt"><div class="grow"><b>Open the data folder</b><div class="muted">Where SteamLite keeps your settings and play time.</div></div><button class="btn" onclick={() => api('app:openDataFolder')}><Icon name="folder" size={17} />Open</button></div>
    <div class="row opt"><div class="grow"><b>Clear saved Steam data</b><div class="muted">Removes the saved copies SteamLite keeps for offline use. Your settings and play time stay.</div></div><button class="btn" onclick={clearCache}><Icon name="refresh" size={17} />Clear</button></div>
    <div class="row opt"><div class="grow"><b>Copy diagnostics</b><div class="muted">Copies your SteamLite and Windows versions to paste into a bug report. It has nothing personal in it.</div></div><button class="btn" onclick={copyDiag}><Icon name="layers" size={17} />Copy</button></div>
    <div class="row opt"><div class="grow"><b>Report a bug or ask for something</b><div class="muted">Open the SteamLite page on GitHub.</div></div><button class="btn" onclick={() => open('https://github.com/imnotfisy/SteamLite/issues')}><Icon name="ext" size={17} />Open</button></div>
  </div>
</div>

{#if dirty}
  <div class="savebar" role="status" in:fly={{ y: 18, duration: 380, easing: expoOut }} out:fade={{ duration: 200 }}>
    <span class="msg">Careful, you have unsaved changes!</span>
    <button class="save" onclick={save}>Save</button>
  </div>
{/if}

<style>
  .themes { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
  .theme { position: relative; display: grid; gap: 4px; align-content: start; text-align: left; padding: 12px 12px 16px; border-radius: var(--r-lg); background: var(--slab); border: 1px solid var(--line); transition: border-color .2s, transform .25s var(--spring); } .theme:hover { transform: translateY(-2px); border-color: var(--line2); }
  .theme.on { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }
  .theme .prev { display: flex; align-items: flex-end; gap: 6px; height: 74px; padding: 10px; border-radius: 12px; margin-bottom: 8px; border: 1px solid rgba(255, 255, 255, 0.1); } .theme .prev i { flex: 1; height: 100%; border-radius: 8px; box-shadow: 0 4px 10px -4px rgba(0, 0, 0, 0.5); }
  .theme b { font-size: 15px; padding: 0 4px; } .theme small { padding: 0 4px; font-size: 12.5px; line-height: 1.45; color: var(--muted); }
  .theme.locked { opacity: .5; filter: grayscale(.85); cursor: not-allowed; pointer-events: none; } .theme .note { position: absolute; top: 20px; right: 20px; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; background: rgba(0, 0, 0, 0.62); color: #fff; }
  .theme .tick { position: absolute; top: 20px; right: 20px; width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; background: var(--accent); color: var(--accent-ink); }
  @media (max-width: 900px) { .themes { grid-template-columns: 1fr; } }
  .savebar { position: fixed; z-index: 70; left: calc(50% + 38px); bottom: 26px; transform: translateX(-50%); display: flex; align-items: center; gap: 18px; padding: 10px 10px 10px 22px; border-radius: 18px; background: var(--rail); border: 1px solid var(--line2); box-shadow: 0 24px 60px -18px #000, 0 0 0 1px rgba(0, 0, 0, 0.3); backdrop-filter: blur(12px); white-space: nowrap; }
  .savebar .msg { font-weight: 600; }
  .savebar .save { height: 42px; padding: 0 26px; border-radius: 12px; font-weight: 700; color: var(--accent-ink); background: var(--accent); transition: background .2s, transform .2s var(--spring); } .savebar .save:hover { filter: brightness(1.12); transform: translateY(-1px); } .savebar .save:active { transform: scale(.97); }
  .hd { text-align: center; }
  .seg2 { position: relative; display: grid; grid-template-columns: 1fr 1fr; padding: 4px; border-radius: 14px; background: var(--s1); border: 1px solid var(--line); flex: none; }
  .seg2 button { position: relative; z-index: 1; height: 36px; min-width: 104px; padding: 0 16px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; gap: 7px; font-weight: 650; color: var(--muted); transition: color .25s; }
  .seg2 button.on { color: var(--accent-ink); }
  .notice { display: flex; gap: 14px; align-items: flex-start; padding: 16px 0; color: var(--text); } .notice > :global(svg) { flex: none; margin-top: 2px; color: var(--accent); } .notice .muted { margin-top: 2px; line-height: 1.5; }
  .seg2 .ind { position: absolute; top: 4px; bottom: 4px; left: 4px; width: calc(50% - 4px); border-radius: 10px; background: linear-gradient(135deg, color-mix(in srgb, var(--glow) 70%, white), var(--accent2)); box-shadow: 0 6px 20px -6px color-mix(in srgb, var(--glow) 90%, transparent); transition: transform .5s var(--spring); }
  .list { padding: 6px 22px; display: grid; } .list > * { padding: 18px 0; border-bottom: 1px solid var(--line); } .list > *:last-child { border-bottom: 0; }
  .av { width: 48px; height: 48px; border-radius: 15px; overflow: hidden; display: grid; place-items: center; background: linear-gradient(135deg, var(--glow), var(--accent2)); } .av img { width: 100%; height: 100%; object-fit: cover; } .av span { font-weight: 800; color: var(--accent-ink); font-size: 19px; }
  .signed { display: inline-flex; align-items: center; gap: 6px; color: var(--good); font-weight: 700; font-size: 13px; padding: 5px 12px; border-radius: 999px; background: color-mix(in srgb, var(--good) 14%, transparent); }
</style>
