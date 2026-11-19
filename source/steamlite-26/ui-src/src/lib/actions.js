// Small Svelte actions for motion.

// a card that leans toward the pointer, with a light that follows it
export function tilt(node, { max = 7, glare = true } = {}) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return {};
  let raf = 0;
  const move = (e) => {
    const r = node.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      node.style.setProperty('--rx', ((0.5 - py) * max).toFixed(2) + 'deg'); node.style.setProperty('--ry', ((px - 0.5) * max).toFixed(2) + 'deg');
      if (glare) { node.style.setProperty('--mx', (px * 100).toFixed(1) + '%'); node.style.setProperty('--my', (py * 100).toFixed(1) + '%'); }
    });
  };
  const enter = () => node.style.setProperty('--on', '1');
  const leave = () => { cancelAnimationFrame(raf); node.style.setProperty('--rx', '0deg'); node.style.setProperty('--ry', '0deg'); node.style.setProperty('--on', '0'); };
  node.addEventListener('pointermove', move); node.addEventListener('pointerenter', enter); node.addEventListener('pointerleave', leave);
  return { destroy() { node.removeEventListener('pointermove', move); node.removeEventListener('pointerenter', enter); node.removeEventListener('pointerleave', leave); cancelAnimationFrame(raf); } };
}

// moves an element slower than the page scrolls (the scrolling parent is found automatically)
export function parallax(node, { speed = 0.35 } = {}) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return {};
  let p = node.parentElement; while (p && getComputedStyle(p).overflowY !== 'auto' && getComputedStyle(p).overflowY !== 'scroll') p = p.parentElement;
  if (!p) return {};
  let raf = 0;
  const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { node.style.transform = `translate3d(0, ${(p.scrollTop * speed).toFixed(1)}px, 0) scale(1.08)`; }); };
  p.addEventListener('scroll', on, { passive: true }); on();
  return { destroy() { p.removeEventListener('scroll', on); cancelAnimationFrame(raf); } };
}

// closes on Escape
export function escape(node, fn) { const k = (e) => { if (e.key === 'Escape') { e.stopPropagation(); fn(); } }; window.addEventListener('keydown', k, true); return { destroy() { window.removeEventListener('keydown', k, true); } }; }

// a horizontal shelf that also scrolls with the mouse wheel
export function wheelX(node) {
  const f = (e) => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && node.scrollWidth > node.clientWidth && e.shiftKey) { node.scrollLeft += e.deltaY; e.preventDefault(); } };
  node.addEventListener('wheel', f, { passive: false }); return { destroy() { node.removeEventListener('wheel', f); } };
}

// things below the fold rise into view when you scroll to them
export function reveal(node) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return {};
  node.classList.add('rv');
  const io = new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) { node.classList.add('in'); io.disconnect(); } }, { root: node.closest('main'), threshold: 0.06, rootMargin: '0px 0px -4% 0px' });
  io.observe(node);
  return { destroy() { io.disconnect(); } };
}

// Clicks: a ripple that grows from where you pressed, and a springy press. The press uses the Web Animations API on purpose: a CSS class that
// swapped the "animation" property made the entrance animation of chips, tabs and buttons play again when it was removed.
const FX = '.btn, .chip, .seg button, .seg2 button, .tabs button, .acc, .it, .tg, .gc, nav .list button, .acts button, .btns button, .me';
const PRESS = [{ transform: 'scale(1)' }, { transform: 'scale(.93)', offset: 0.28 }, { transform: 'scale(1.035)', offset: 0.62 }, { transform: 'scale(1)' }];
const ICON = [{ transform: 'scale(1)' }, { transform: 'scale(.8) rotate(-8deg)', offset: 0.3 }, { transform: 'scale(1.18) rotate(4deg)', offset: 0.65 }, { transform: 'scale(1)' }];
// sparks that fly out of a star when it is switched on
function sparks(el) {
  const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  for (let i = 0; i < 9; i++) {
    const s = document.createElement('i'), a = (Math.PI * 2 * i) / 9 + Math.random() * 0.4, d = 20 + Math.random() * 16;
    s.className = 'spark'; s.style.transform = 'translate(' + cx + 'px,' + cy + 'px)'; document.body.appendChild(s);
    s.animate([{ transform: 'translate(' + cx + 'px,' + cy + 'px) scale(1)', opacity: 1 }, { transform: 'translate(' + (cx + Math.cos(a) * d) + 'px,' + (cy + Math.sin(a) * d) + 'px) scale(0)', opacity: 0 }], { duration: 520 + Math.random() * 200, easing: 'cubic-bezier(.2,.8,.2,1)' }).finished.then(() => s.remove(), () => s.remove());
  }
}
export function installClickFx() {
  document.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || document.documentElement.dataset.motion === 'reduced') return;
    const t = e.target.closest && e.target.closest(FX); if (!t || t.disabled || t.hasAttribute('disabled')) return;
    const nav = t.matches('nav .list button'), inner = nav ? t.querySelector('.ic') : t.matches('.gc') ? t.querySelector('.art') : t.matches('.tg') ? t.querySelector('i') : t;
    if (t.getAttribute('aria-label') === 'Add to favorites') sparks(t);
    if (inner) inner.animate(nav ? ICON : PRESS, { duration: nav ? 550 : 480, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' });
    if (t.matches('nav .list button, .gc, .me, .tg, .acts button')) return;                         // these have shapes a ripple would spill out of
    const r = t.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2.3, s = document.createElement('span');
    s.className = 'fx-ripple'; s.style.cssText = 'width:' + d + 'px;height:' + d + 'px;left:' + (e.clientX - r.left - d / 2) + 'px;top:' + (e.clientY - r.top - d / 2) + 'px';
    t.appendChild(s); setTimeout(() => s.remove(), 750);
  }, true);
}

// smooth wheel scrolling: the page eases toward where the wheel points (like a spring) instead of jumping a notch at a time
export function smooth(node) {
  let target = node.scrollTop, raf = 0, last = 0;
  const off = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'reduced' || document.documentElement.dataset.gaming === '1';
  const inner = (el) => { for (; el && el !== node; el = el.parentElement) { if (el.tagName === 'TEXTAREA') return true; const o = getComputedStyle(el).overflowY; if ((o === 'auto' || o === 'scroll') && el.scrollHeight > el.clientHeight) return true; } return false; };
  const step = (t) => {
    const dt = Math.min(0.05, (t - last) / 1000); last = t; const d = target - node.scrollTop;
    if (Math.abs(d) < 0.4) { node.scrollTop = target; raf = 0; return; }
    node.scrollTop += d * (1 - Math.exp(-dt * 11)); raf = requestAnimationFrame(step);
  };
  const wheel = (e) => {
    if (e.ctrlKey || e.shiftKey || e.defaultPrevented || off() || Math.abs(e.deltaX) > Math.abs(e.deltaY) || inner(e.target)) return;
    e.preventDefault();
    const unit = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? node.clientHeight : 1;
    if (!raf) target = node.scrollTop;
    target = Math.max(0, Math.min(node.scrollHeight - node.clientHeight, target + e.deltaY * unit));
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); }
  };
  const sync = () => { if (!raf) target = node.scrollTop; };
  node.addEventListener('wheel', wheel, { passive: false }); node.addEventListener('scroll', sync, { passive: true });
  return { destroy() { node.removeEventListener('wheel', wheel); node.removeEventListener('scroll', sync); cancelAnimationFrame(raf); } };
}
