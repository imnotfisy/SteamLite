// Magnet tabs. The highlight of a tab bar can be grabbed and dragged. While you drag, the page follows it: as soon as the highlight is
// closest to another tab, that tab is chosen and its page slides in. The closest tab also pulls the highlight toward it like a magnet,
// and when you let go the highlight snaps into place with a springy overshoot.
// Use it on the container:  <div use:magnet>  (a row of buttons with a highlight inside), or  <div use:magnet={{ axis: 'y' }}>  for a vertical list.
// The highlight is the element with class "ind" or "pill". Clicking a tab still works as before (a drag only starts after the pointer moves a few pixels).

// a spring as a CSS easing: it overshoots the target and settles. (Falls back to a plain overshoot curve where linear() is not available.)
function makeSpring(zeta = 0.52, omega = 15, steps = 56) {
  const pts = []; const wd = omega * Math.sqrt(1 - zeta * zeta);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    pts.push((1 - Math.exp(-zeta * omega * t) * (Math.cos(wd * t) + (zeta * omega / wd) * Math.sin(wd * t))).toFixed(4));
  }
  pts[steps] = '1';
  return 'linear(' + pts.join(', ') + ')';
}
export const SPRING = (typeof CSS !== 'undefined' && CSS.supports && CSS.supports('animation-timing-function', 'linear(0, 1)')) ? makeSpring() : 'cubic-bezier(.34, 1.56, .64, 1)';

export function magnet(node, opts = {}) {
  const axis = opts.axis === 'y' ? 'y' : 'x';
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'reduced';
  const ind = () => node.querySelector(':scope > .ind, :scope > .pill');
  const items = () => [...node.querySelectorAll(':scope > button')].filter((b) => !b.disabled);
  const pos = (el) => (axis === 'x' ? el.offsetLeft + el.offsetWidth / 2 : el.offsetTop + el.offsetHeight / 2);
  const size = (el) => (axis === 'x' ? el.offsetWidth : el.offsetHeight);
  const off = (d) => (axis === 'x' ? d + 'px 0' : '0 ' + d + 'px');
  const isOn = (b) => b.classList.contains('on') || b.getAttribute('aria-checked') === 'true';

  let st = null, justDragged = false;

  function down(e) {
    if (e.button !== 0 || reduce()) return;
    const bar = ind(), list = items(); if (!bar || list.length < 2) return;
    const btn = e.target.closest && e.target.closest(':scope > button, button'); if (!btn || !node.contains(btn)) return;
    // the highlight sits under the chosen tab, so the chosen tab (or the highlight itself) is what you grab
    const active = list.find(isOn) || list[0];
    if (btn !== active && e.target !== bar) return;
    st = { id: e.pointerId, x0: e.clientX, y0: e.clientY, active, bar, list, moved: false, origin: pos(active), near: active, shown: 0, drag: null };
  }

  const put = (s, v) => { s.shown = v; s.drag.effect.setKeyframes([{ translate: off(v) }]); };      // moves the highlight without touching its style attribute

  function move(e) {
    if (!st || e.pointerId !== st.id) return;
    const d = axis === 'x' ? e.clientX - st.x0 : e.clientY - st.y0;
    if (!st.moved) {
      if (Math.abs(d) < 6) return;
      st.moved = true; try { node.setPointerCapture(e.pointerId); } catch (err) { }
      node.classList.add('grabbing'); st.bar.classList.add('held');                                  // "held" switches off the highlight's own sliding
      st.drag = st.bar.animate([{ translate: off(0) }], { duration: 1, fill: 'both' });
    }
    // where the highlight wants to be: the grab point, kept inside the bar
    const lo = pos(st.list[0]), hi = pos(st.list[st.list.length - 1]);
    const want = Math.max(lo, Math.min(hi, st.origin + d));
    let near = st.list[0], best = 1e9; for (const b of st.list) { const dist = Math.abs(pos(b) - want); if (dist < best) { best = dist; near = b; } }
    // the closest tab pulls the highlight toward its centre (the "magnet")
    const pull = Math.max(0, 1 - best / (size(near) * 0.5));      // 0 halfway between two tabs (so nothing jumps when the closest tab changes), 1 right on a tab
    const centre = want + (pos(near) - want) * (0.7 * pull);
    // the page follows the highlight: the tab it is closest to is chosen now. The highlight's home moves to that tab, so the offset is measured from it.
    if (near !== st.active) { st.active = near; near.click(); }
    put(st, centre - pos(st.active));
    if (near !== st.near) { st.near = near; try { navigator.vibrate && navigator.vibrate(4); } catch (err) { } }
    st.list.forEach((b) => (b === near ? b.setAttribute('data-near', '') : b.removeAttribute('data-near')));
  }

  function up(e) {
    if (!st || e.pointerId !== st.id) return;
    const s = st; st = null;
    if (!s.moved) return;                                          // an ordinary click: leave it to the buttons
    justDragged = true; setTimeout(() => (justDragged = false), 60);
    node.classList.remove('grabbing'); try { node.releasePointerCapture(e.pointerId); } catch (err) { }
    s.list.forEach((b) => b.removeAttribute('data-near'));
    const bar = s.bar, a = s.drag;
    // the highlight snaps into place, overshoots a little and settles
    a.effect.setKeyframes([{ translate: off(s.shown) }, { translate: off(0) }]); a.effect.updateTiming({ duration: 560, easing: SPRING, fill: 'both' }); a.currentTime = 0; a.play();
    bar.animate([{ scale: '1 1' }, { scale: axis === 'x' ? '1.07 .92' : '.92 1.07', offset: .35 }, { scale: '1 1' }], { duration: 420, delay: 80, easing: 'ease-out' });
    a.finished.then(() => { a.cancel(); requestAnimationFrame(() => bar.classList.remove('held')); }).catch(() => bar.classList.remove('held'));
  }

  // a drag must not also count as a click on whatever is under the pointer when it ends
  const click = (e) => { if (justDragged) { e.preventDefault(); e.stopPropagation(); justDragged = false; } };

  node.addEventListener('pointerdown', down); node.addEventListener('pointermove', move); node.addEventListener('pointerup', up); node.addEventListener('pointercancel', up); node.addEventListener('click', click, true);
  node.dataset.magnetAxis = axis;
  return { destroy() { node.removeEventListener('pointerdown', down); node.removeEventListener('pointermove', move); node.removeEventListener('pointerup', up); node.removeEventListener('pointercancel', up); node.removeEventListener('click', click, true); } };
}
