<script>
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { S } from '../lib/state.svelte.js';
  import Ver from './Ver.svelte';
  // The opening screen: three seconds in all: 2.5 seconds of logo and name, then a half-second fade.
  let { duration = 2500, ondone } = $props();
  const word = 'SteamLite'.split('');
  onMount(() => { const t = setTimeout(() => ondone && ondone(), duration); return () => clearTimeout(t); });
</script>

<div class="splash" out:fade={{ duration: 500 }} style="--d:{duration}ms">
  <div class="orbs" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="grid" aria-hidden="true"></div>
  <div class="center">
    <div class="mark"><span class="ring"></span><span class="ring r2"></span><img src="/icon.png" alt="SteamLite" draggable="false" /></div>
    <h1 aria-label="SteamLite">{#each word as ch, i}<span style="--i:{i}">{ch}</span>{/each}</h1>
    <div class="tag">Your Steam library</div>
    <div class="ver">{#if S.version}<Ver v={S.version} />{/if}</div>
    <div class="bar"><i></i></div>
  </div>
</div>

<style>
  .splash { position: fixed; inset: 0; z-index: 55; background: var(--bg); background-image: var(--page); overflow: hidden; }
  .orbs i { position: absolute; border-radius: 50%; filter: blur(90px); opacity: 0; animation: orb 3s ease-in-out forwards; }
  .orbs i:nth-child(1) { width: 460px; height: 460px; left: 14%; top: 8%; background: #8D99AE; } .orbs i:nth-child(2) { width: 380px; height: 380px; right: 12%; bottom: 6%; background: #8D99AE; animation-delay: .15s; } .orbs i:nth-child(3) { width: 300px; height: 300px; right: 34%; top: 4%; background: #8D99AE; animation-delay: .3s; }
  @keyframes orb { 0% { opacity: 0; transform: scale(.6); } 40% { opacity: .5; } 100% { opacity: .38; transform: scale(1.25) translate3d(30px, -20px, 0); } }
  .grid { position: absolute; inset: 0; opacity: 0; animation: gi 1.2s .2s var(--ease) forwards; background-image: linear-gradient(#ffffff08 1px, transparent 1px), linear-gradient(90deg, #ffffff08 1px, transparent 1px); background-size: 56px 56px; mask-image: radial-gradient(60% 55% at 50% 45%, #000, transparent 75%); }
  @keyframes gi { to { opacity: 1; } }
  .center { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); display: grid; justify-items: center; gap: 14px; }
  .mark { position: relative; width: 132px; height: 132px; display: grid; place-items: center; }
  .mark img { width: 112px; height: 112px; border-radius: 50%; box-shadow: 0 20px 50px -14px #000; animation: logo 1.1s var(--spring) .1s both, float 4s ease-in-out 1.2s infinite; }
  @keyframes logo { from { transform: scale(.2) rotate(-200deg); opacity: 0; filter: blur(14px); } 60% { filter: none; } }
  @keyframes float { 50% { transform: translateY(-7px) scale(1.03); } }
  .ring { position: absolute; inset: 0; border-radius: 50%; border: 2px solid #8D99AE; opacity: 0; animation: ring 1.6s ease-out .7s infinite; } .r2 { animation-delay: 1.5s; border-color: #8D99AE; }
  @keyframes ring { from { transform: scale(.85); opacity: .7; } to { transform: scale(1.9); opacity: 0; } }
  h1 { display: flex; font-size: 46px; font-weight: 650; letter-spacing: -0.03em; margin-top: 10px; }
  h1 span { display: inline-block; animation: letter .7s var(--spring) both; animation-delay: calc(.55s + var(--i) * 45ms); background: linear-gradient(180deg, #fff, #cfd6e4); -webkit-background-clip: text; background-clip: text; color: transparent; }
  @keyframes letter { from { opacity: 0; transform: translateY(26px) scale(.8); filter: blur(8px); } }
  .tag { color: var(--muted); font-size: 15px; opacity: 0; animation: up .7s var(--ease) 1.15s forwards; }
  .ver { font-size: 14px; font-weight: 650; color: var(--faint); opacity: 0; animation: up .7s var(--ease) 1.4s forwards; }
  @keyframes up { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
  .bar { width: 240px; height: 4px; margin-top: 18px; border-radius: 4px; background: #ffffff14; overflow: hidden; opacity: 0; animation: up .5s ease .4s forwards; }
  .bar i { display: block; height: 100%; width: 0; border-radius: 4px; background: #8D99AE; animation: fill var(--d) cubic-bezier(.4, .1, .3, 1) forwards; }
  @keyframes fill { to { width: 100%; } }
</style>
