const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

// split headline words so they can stagger in
$$('#h1 .w').forEach((w, i) => w.style.setProperty('--i', i));

// scroll reveal with a small stagger for siblings
const io = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in'); io.unobserve(e.target);
}), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
$$('.reveal').forEach((el) => {
  const sibs = $$(':scope > .reveal', el.parentElement), i = sibs.indexOf(el);
  el.style.setProperty('--rd', Math.min(i, 6) * 80 + 'ms');
  io.observe(el);
});

// count-up numbers
const ease = (t) => 1 - Math.pow(1 - t, 4);
const cio = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return; cio.unobserve(e.target);
  const to = +e.target.dataset.count; if (reduce) { e.target.textContent = to; return; }
  const t0 = performance.now(), dur = 1400;
  (function tick(t) { const p = Math.min(1, (t - t0) / dur); e.target.textContent = Math.round(to * ease(p)); if (p < 1) requestAnimationFrame(tick); })(t0);
}), { threshold: 0.1 });
$$('[data-count]').forEach((el) => cio.observe(el));

// theme-colour marquee
const PAL = [['#8b5cf6', '#1b1233'], ['#38bdf8', '#0c2238'], ['#34d399', '#0b2a22'], ['#f472b6', '#2c1022'], ['#fb923c', '#2c1708'], ['#facc15', '#2a2308'], ['#f87171', '#2b0f10'], ['#a3e635', '#18260a'], ['#818cf8', '#14173a'], ['#2dd4bf', '#0a2926'], ['#e879f9', '#2a1030'], ['#94a3b8', '#141a24']];
const track = $('#track');
if (track) track.innerHTML = [...PAL, ...PAL].map(([a, b]) => `<i style="--a:${a};--b:${b}"></i>`).join('');

// scroll-driven state: progress bar, nav, hero parallax, active nav link
const nav = $('#nav'), prog = $('#progress'), frame = $('#frame'), stage = $('#stage3d');
const links = $$('#navLinks a'), ink = $('#ink');
const sections = links.map((a) => (a.getAttribute('href').startsWith('#') ? $(a.getAttribute('href')) : null));
let lastY = 0, tiltX = 0, tiltY = 0, ticking = false;
function onScroll() {
  const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
  prog.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  nav.classList.toggle('stuck', y > 20);
  nav.classList.toggle('hide', y > lastY + 4 && y > 500 ? true : y < lastY - 4 ? false : nav.classList.contains('hide'));
  lastY = y;
  if (!reduce && stage) {
    const r = stage.getBoundingClientRect(), p = Math.max(0, Math.min(1, 1 - r.top / innerHeight * 1.15));
    frame.style.setProperty('--rx', (10 - p * 10 + tiltX).toFixed(2) + 'deg');
    frame.style.setProperty('--sc', (0.94 + p * 0.06).toFixed(3));
    frame.style.setProperty('--ty', (-p * 20).toFixed(1) + 'px');
    frame.style.setProperty('--ry', tiltY.toFixed(2) + 'deg');
  }
  let cur = -1; sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.4) cur = i; });
  links.forEach((a, i) => a.classList.toggle('on', i === cur));
  if (cur >= 0) { const a = links[cur]; ink.style.width = a.offsetWidth + 'px'; ink.style.transform = `translateX(${a.offsetLeft}px)`; ink.style.opacity = 1; } else ink.style.opacity = 0;
  ticking = false;
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
addEventListener('resize', onScroll); onScroll();

// hero tilt follows the pointer
if (fine && !reduce && stage) {
  stage.addEventListener('pointermove', (e) => {
    const r = stage.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    tiltY = x * 9; tiltX = -y * 6; frame.style.setProperty('--sx', (x * 120 + 10) + '%'); onScroll();
  });
  stage.addEventListener('pointerleave', () => { tiltX = tiltY = 0; frame.style.setProperty('--sx', '-60%'); onScroll(); });
  // aurora drifts slightly against the pointer
  const au = $('.aurora');
  addEventListener('pointermove', (e) => { au.style.transform = `translate3d(${(e.clientX / innerWidth - 0.5) * -30}px,${(e.clientY / innerHeight - 0.5) * -30}px,0)`; }, { passive: true });
  au.style.transition = 'transform 1.2s cubic-bezier(.22,1,.36,1)';
}

// spotlight on cards, light on buttons, magnetic buttons
$$('.card.spot, .btn').forEach((el) => el.addEventListener('pointermove', (e) => {
  const r = el.getBoundingClientRect(); el.style.setProperty('--mx', e.clientX - r.left + 'px'); el.style.setProperty('--my', e.clientY - r.top + 'px');
}));
if (fine && !reduce) $$('.mag').forEach((b) => {
  const s = $('span', b);
  b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2; b.style.transform = `translate(${x * 0.18}px,${y * 0.28}px)`; if (s) s.style.transform = `translate(${x * 0.08}px,${y * 0.12}px)`; });
  b.addEventListener('pointerleave', () => { b.style.transform = ''; if (s) s.style.transform = ''; });
});

// sticky tour: crossfade the screenshot to match the step in view
const steps = $$('.step'), shots = $$('#shotbox img');
const sio = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  const id = e.target.dataset.img;
  steps.forEach((s) => s.classList.toggle('on', s === e.target));
  shots.forEach((im) => im.classList.toggle('on', im.dataset.img === id));
}), { rootMargin: '-45% 0px -45% 0px' });
steps.forEach((s) => sio.observe(s));
steps.forEach((s) => s.addEventListener('click', () => s.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' })));

// faq accordion
$$('.q button').forEach((b) => b.addEventListener('click', () => {
  const q = b.parentElement, open = !q.classList.contains('open');
  $$('.q.open').forEach((o) => { o.classList.remove('open'); $('button', o).setAttribute('aria-expanded', 'false'); });
  q.classList.toggle('open', open); b.setAttribute('aria-expanded', open);
}));

// latest releases from GitHub (falls back to the static links)
(async () => {
  try {
    const rs = await (await fetch('https://api.github.com/repos/imnotfisy/SteamLite/releases?per_page=20')).json();
    if (!Array.isArray(rs)) return;
    const setup = (r) => (r.assets || []).find((a) => /\.exe$/i.test(a.name));
    const st = rs.find((r) => !r.prerelease && !r.draft && setup(r));
    if (st) { $('#stableBtn').href = setup(st).browser_download_url; $('#stableVer').textContent = st.tag_name.replace(/^v/, ''); }
  } catch (e) { /* keep fallbacks */ }
})();

// server status: pings the SteamLite Online server (no-cors, so we only learn reachable / not reachable, plus how long it took)
(function () {
  const el = $('#status'), txt = $('#statusTxt'), URL = 'https://steamlite-online.bayxturtle.workers.dev/health';
  const set = (s, t) => { el.dataset.s = s; txt.textContent = t; };
  async function check() {
    const t0 = performance.now(), ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 6000);
    try {
      let r = null;
      try { r = await fetch(URL + '?t=' + Date.now(), { cache: 'no-store', signal: ctl.signal }); }
      catch (e) { await fetch(URL + '?t=' + Date.now(), { mode: 'no-cors', cache: 'no-store', signal: ctl.signal }); } // server without CORS: we can only tell it answered
      const ms = Math.round(performance.now() - t0);
      if (r && r.status === 503) set('off', 'Servers switched off');
      else set(ms > 1500 ? 'slow' : 'up', ms > 1500 ? 'Servers slow · ' + ms + ' ms' : 'Servers online · ' + ms + ' ms');
    } catch (e) { set('down', 'Servers unreachable'); }
    clearTimeout(to);
  }
  check(); setInterval(() => { if (!document.hidden) check(); }, 30000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
})();

// mobile menu
(function () {
  const bar = $('#nav'), b = $('#burger'); if (!b) return;
  const set = (o) => { bar.classList.toggle('open', o); b.setAttribute('aria-expanded', o); };
  b.addEventListener('click', (e) => { e.stopPropagation(); set(!bar.classList.contains('open')); });
  $$('#navLinks a').forEach((a) => a.addEventListener('click', () => set(false)));
  addEventListener('click', (e) => { if (!bar.contains(e.target)) set(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  addEventListener('resize', () => { if (innerWidth > 900) set(false); });
})();
