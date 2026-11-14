const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

// scroll reveal, with a small stagger between siblings
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
$$('.reveal').forEach((el) => { const sibs = $$(':scope > .reveal', el.parentElement), i = sibs.indexOf(el); el.style.setProperty('--rd', Math.min(i, 6) * 80 + 'ms'); io.observe(el); });

// marquee words
const words = ['Your library', 'Play time', 'Collections', 'Sign in with Steam', 'One Play button', 'Updates in place', 'Stable and Beta', 'Island support', 'Free and open source'];
const marq = $('#marq'); if (marq) marq.innerHTML = [...words, ...words].map((w) => `<span>${w}</span>`).join('');

// progress bar, floating nav, hero 3D frame
const nav = $('#nav'), prog = $('#progress'), frame = $('#frame'), stage = $('#stage');
const links = $$('#navLinks a[href^="#"]'), secs = links.map((a) => $(a.getAttribute('href')));
let lastY = 0, tiltX = 0, tiltY = 0, tick = false;
function onScroll() {
  const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
  prog.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  nav.classList.toggle('stuck', y > 20);
  if (!nav.classList.contains('open')) nav.classList.toggle('hide', y > lastY + 4 && y > 500 ? true : y < lastY - 4 ? false : nav.classList.contains('hide'));
  lastY = y;
  if (!reduce && stage && frame) {
    const r = stage.getBoundingClientRect(), p = Math.max(0, Math.min(1, 1 - r.top / innerHeight * 1.1));
    frame.style.setProperty('--rx', (10 - p * 10 + tiltX).toFixed(2) + 'deg'); frame.style.setProperty('--sc', (0.94 + p * 0.06).toFixed(3));
    frame.style.setProperty('--ty', (-p * 18).toFixed(1) + 'px'); frame.style.setProperty('--ry', tiltY.toFixed(2) + 'deg');
  }
  let cur = -1; secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.4) cur = i; });
  links.forEach((a, i) => a.classList.toggle('on', i === cur));
  tick = false;
}
addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true }); addEventListener('resize', onScroll); onScroll();
if (fine && !reduce && stage) {
  stage.addEventListener('pointermove', (e) => { const r = stage.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; tiltY = x * 8; tiltX = -y * 5; frame.style.setProperty('--sx', (x * 120 + 10) + '%'); onScroll(); });
  stage.addEventListener('pointerleave', () => { tiltX = tiltY = 0; frame.style.setProperty('--sx', '-60%'); onScroll(); });
  const orbs = $$('.orb'); addEventListener('pointermove', (e) => orbs.forEach((o, i) => { o.style.translate = `${(e.clientX / innerWidth - 0.5) * (i ? 40 : -40)}px ${(e.clientY / innerHeight - 0.5) * (i ? 40 : -40)}px`; }), { passive: true });
}

// mobile menu
const burger = $('#burger');
burger.addEventListener('click', () => { const o = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', o); });
$$('#navLinks a').forEach((a) => a.addEventListener('click', () => { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }));

// light that follows the pointer on the feature tiles, and a ripple on buttons
$$('.tile').forEach((el) => el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); el.style.setProperty('--mx', e.clientX - r.left + 'px'); el.style.setProperty('--my', e.clientY - r.top + 'px'); }));
document.addEventListener('pointerdown', (e) => {
  const b = e.target.closest && e.target.closest('.btn'); if (!b || reduce) return;
  const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2.2, s = document.createElement('span'); s.className = 'ripple';
  s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`; b.appendChild(s); setTimeout(() => s.remove(), 750);
});

// a session timer that ticks, as a little demo of play time
const timer = $('#timer');
if (timer) { let t = 3 * 3600 + 24 * 60 + 9; const fmt = (n) => Math.floor(n / 3600) + ':' + String(Math.floor(n % 3600 / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0'); const small = timer.querySelector('small'); const draw = () => { timer.firstChild.textContent = fmt(t); }; draw(); if (!reduce) setInterval(() => { t++; draw(); }, 1000); }

// screenshot tabs: they advance by themselves and pause while you look
const tabs = $$('#tabs button'), shots = $$('#shot img'); let cur = 0, prog2 = 0, hover = false;
function show(i) { cur = i; prog2 = 0; tabs.forEach((b, n) => { b.classList.toggle('on', n === i); const f = $('.bar2 i', b); if (f) f.style.width = '0'; }); shots.forEach((s, n) => s.classList.toggle('on', n === i)); }
tabs.forEach((b, i) => b.addEventListener('click', () => show(i)));
const area = $('.show'); if (area) { area.addEventListener('pointerenter', () => (hover = true)); area.addEventListener('pointerleave', () => (hover = false)); }
if (!reduce) setInterval(() => { if (hover || document.hidden) return; prog2 += 1; const f = $('.bar2 i', tabs[cur]); if (f) f.style.width = Math.min(100, prog2 / 0.5) + '%'; if (prog2 >= 50) show((cur + 1) % tabs.length); }, 100);

// FAQ
$$('.q button').forEach((b) => b.addEventListener('click', () => { const o = b.getAttribute('aria-expanded') === 'true'; $$('.q button').forEach((x) => x.setAttribute('aria-expanded', 'false')); b.setAttribute('aria-expanded', String(!o)); }));

// downloads: the newest stable release and the newest beta, straight from GitHub
const niceVer = (t) => t.replace(/^v/, '').replace(/\.0$/, '').replace(/-beta$/, '.beta').replace(/\.0\.beta$/, '.beta');
const size = (n) => (n / 1048576).toFixed(0) + ' MB';
const day = (d) => new Date(d).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' });
(async () => {
  if (!$('#stableDl')) return;
  try {
    const rs = (await (await fetch('https://api.github.com/repos/imnotfisy/SteamLite/releases?per_page=30')).json()).filter((r) => !r.draft);
    const exe = (r) => (r.assets || []).find((a) => /\.exe$/i.test(a.name));
    const isNew = (r) => /^v2\d\./.test(r.tag_name);
    const stable = rs.find((r) => !r.prerelease && isNew(r) && exe(r)), beta = rs.find((r) => r.prerelease && exe(r));
    if (stable) {
      const v = niceVer(stable.tag_name), a = exe(stable);
      $('#heroVer').textContent = 'SteamLite ' + v + ' is out'; $('#heroTag').textContent = 'Stable'; $('#heroDl').href = a.browser_download_url; $('#heroDlText').textContent = 'Download SteamLite ' + v;
      $('#stableVer').textContent = 'SteamLite ' + v; $('#stableDl').href = a.browser_download_url; $('#stableInfo').textContent = size(a.size) + ' · Windows 10 and 11 · ' + day(stable.published_at); $('#navDl').href = '#download';
      $('#heroMeta').textContent = size(a.size) + ' · Windows 10 and 11 · Free · Open source';
    }
    if (beta) { const a = exe(beta); $('#betaVer').textContent = 'SteamLite ' + niceVer(beta.tag_name); $('#betaDl').href = a.browser_download_url; $('#betaInfo').textContent = size(a.size) + ' · Windows 10 and 11 · ' + day(beta.published_at); }
  } catch (e) { /* the links already point to the releases page */ }
})();
