var en = Array.isArray, tv = Array.prototype.indexOf, Xr = Array.prototype.includes, Tn = Array.from, gl = Object.defineProperty, br = Object.getOwnPropertyDescriptor, _l = Object.getOwnPropertyDescriptors, bl = Object.prototype, av = Array.prototype, Ln = Object.getPrototypeOf, Pi = Object.isExtensible;
function sv(t) {
  return typeof t == "function";
}
const es = () => {
};
function rv(t) {
  return t();
}
function Xn(t) {
  for (var a = 0; a < t.length; a++)
    t[a]();
}
function yl() {
  var t, a, s = new Promise((r, i) => {
    t = r, a = i;
  });
  return { promise: s, resolve: t, reject: a };
}
function Ns(t, a) {
  if (Array.isArray(t))
    return t;
  if (a === void 0 || !(Symbol.iterator in t))
    return Array.from(t);
  const s = [];
  for (const r of t)
    if (s.push(r), s.length === a) break;
  return s;
}
const Ea = 2, Mr = 4, tn = 8, wl = 1 << 24, Ua = 16, ls = 32, js = 64, Jn = 128, mi = 256, ns = 512, ka = 1024, va = 2048, $a = 4096, Pa = 8192, Ta = 16384, vr = 32768, Jr = 1 << 25, Ts = 65536, gn = 1 << 17, nv = 1 << 18, Er = 1 << 19, kl = 1 << 20, vs = 1 << 25, _n = 1 << 21, yr = 1 << 22, qs = 1 << 23, xs = Symbol("$state"), xl = Symbol("component"), iv = Symbol("legacy props"), lv = Symbol(""), Sl = Symbol("attributes"), Zn = Symbol("class"), Qn = Symbol("style"), ei = Symbol("text"), dn = Symbol("form reset"), an = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), ov = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml")
), vv = 1, cv = 2, Ml = 4, dv = 8, uv = 16, fv = 1, hv = 2, pv = 4, mv = 8, gv = 16, _v = 1, bv = 2, yv = 4, wv = 1, kv = 2, Tl = {}, wa = Symbol("uninitialized"), Ll = "http://www.w3.org/1999/xhtml", xv = "http://www.w3.org/2000/svg", Sv = "http://www.w3.org/1998/Math/MathML";
function Mv() {
  console.warn("https://svelte.dev/e/derived_inert");
}
function Tv() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function Lv() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function zl(t) {
  return t === this.v;
}
function Cl(t, a) {
  return t != t ? a == a : t !== a || t !== null && typeof t == "object" || typeof t == "function";
}
function El(t) {
  return !Cl(t, this.v);
}
function Al(t) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function zv() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Cv(t, a, s) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function Ev(t) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function Av() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Iv(t) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function Pv() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Dv(t) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function Nv() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Ov() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function qv() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function jv() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
let Ar = !1;
function Hv() {
  Ar = !0;
}
const Rv = [];
function $v(t, a = !1, s = !1) {
  return un(t, /* @__PURE__ */ new Map(), "", Rv, null, s);
}
function un(t, a, s, r, i = null, o = !1) {
  if (typeof t == "object" && t !== null) {
    var d = a.get(t);
    if (d !== void 0) return d;
    if (t instanceof Map) return (
      /** @type {Snapshot<T>} */
      new Map(t)
    );
    if (t instanceof Set) return (
      /** @type {Snapshot<T>} */
      new Set(t)
    );
    if (en(t)) {
      var f = (
        /** @type {Snapshot<any>} */
        Array(t.length)
      );
      a.set(t, f), i !== null && a.set(i, f);
      for (var u = 0; u < t.length; u += 1) {
        var m = t[u];
        u in t && (f[u] = un(m, a, s, r, null, o));
      }
      return f;
    }
    if (Ln(t) === bl) {
      f = {}, a.set(t, f), i !== null && a.set(i, f);
      for (var p of Object.keys(t))
        f[p] = un(
          // @ts-expect-error
          t[p],
          a,
          s,
          r,
          null,
          o
        );
      return f;
    }
    if (t instanceof Date)
      return t.getTime(), /** @type {Snapshot<T>} */
      structuredClone(t);
    if (typeof /** @type {T & { toJSON?: any } } */
    t.toJSON == "function" && !o)
      return un(
        /** @type {T & { toJSON(): any } } */
        t.toJSON(),
        a,
        s,
        r,
        // Associate the instance with the toJSON clone
        t
      );
  }
  if (t instanceof EventTarget)
    return (
      /** @type {Snapshot<T>} */
      t
    );
  try {
    return (
      /** @type {Snapshot<T>} */
      structuredClone(t)
    );
  } catch {
    return (
      /** @type {Snapshot<T>} */
      t
    );
  }
}
let la = null;
function Tr(t) {
  la = t;
}
function Tt(t, a = !1, s) {
  la = {
    p: la,
    i: !1,
    c: null,
    e: null,
    s: t,
    x: null,
    r: (
      /** @type {Effect} */
      qt
    ),
    l: Ar && !a ? { s: null, u: null, $: [] } : null
  };
}
function Lt(t) {
  var a = (
    /** @type {ComponentContext} */
    la
  ), s = a.e;
  if (s !== null) {
    a.e = null;
    for (var r of s)
      Xl(r);
  }
  return a.i = !0, la = a.p, gi(t);
}
function gi(t = {}) {
  return gl(t, xl, { value: !0 }), t;
}
function Ir() {
  return !Ar || la !== null && la.l === null;
}
let Zs = [];
function Il() {
  var t = Zs;
  Zs = [], Xn(t);
}
function ts(t) {
  if (Zs.length === 0 && !Ur) {
    var a = Zs;
    queueMicrotask(() => {
      a === Zs && Il();
    });
  }
  Zs.push(t);
}
function Fv() {
  for (; Zs.length > 0; )
    Il();
}
const Bv = -7169;
function ma(t, a) {
  t.f = t.f & Bv | a;
}
function _i(t) {
  (t.f & ns) !== 0 || t.deps === null ? ma(t, ka) : ma(t, $a);
}
function Pl(t, a) {
  (t.f & va) !== 0 ? a.set(t, va) : (t.f & $a) !== 0 && a.get(t) !== va && a.set(t, $a), ma(t, ka);
}
let Di = !1;
function Gv() {
  Di || (Di = !0, document.addEventListener(
    "reset",
    (t) => {
      Promise.resolve().then(() => {
        if (!t.defaultPrevented)
          for (
            const a of
            /**@type {HTMLFormElement} */
            t.target.elements
          )
            a[dn]?.();
      });
    },
    // In the capture phase to guarantee we get noticed of it (no possibility of stopPropagation)
    { capture: !0 }
  ));
}
function Fs(t) {
  var a = Rt, s = qt;
  Va(null), us(null);
  try {
    return t();
  } finally {
    Va(a), us(s);
  }
}
function Dl(t, a, s, r = s) {
  t.addEventListener(a, () => Fs(s));
  const i = (
    /** @type {any} */
    t[dn]
  );
  i ? t[dn] = () => {
    i(), r(!0);
  } : t[dn] = () => r(!0), Gv();
}
function Wv(t, a, s, r) {
  const i = Ir() ? Lr : bi;
  var o = t.filter((b) => !b.settled), d = a.map(i);
  if (s.length === 0 && o.length === 0) {
    r(d);
    return;
  }
  var f = (
    /** @type {Effect} */
    qt
  ), u = Yv(), m = o.length === 1 ? o[0].promise : o.length > 1 ? Promise.all(o.map((b) => b.promise)) : null;
  function p(b) {
    if ((f.f & Ta) === 0) {
      u();
      try {
        r([...d, ...b]);
      } catch (S) {
        os(S, f);
      }
      bn();
    }
  }
  var _ = Nl();
  if (s.length === 0) {
    m.then(() => p([])).finally(_);
    return;
  }
  function k() {
    Promise.all(s.map((b) => /* @__PURE__ */ Uv(b))).then(p).catch((b) => os(b, f)).finally(_);
  }
  m ? m.then(() => {
    if ((f.f & Ta) !== 0) {
      _();
      return;
    }
    u(), k(), bn();
  }) : k();
}
function Yv() {
  var t = (
    /** @type {Effect} */
    qt
  ), a = Rt, s = la, r = (
    /** @type {Batch} */
    Et
  );
  return function(o = !0) {
    us(t), Va(a), Tr(s), o && (t.f & Ta) === 0 && (r?.activate(), r?.apply());
  };
}
function bn(t = !0) {
  us(null), Va(null), Tr(null), t && Et?.deactivate();
}
function Nl() {
  var t = (
    /** @type {Effect} */
    qt
  ), a = t.b, s = (
    /** @type {Batch} */
    Et
  ), r = !!a?.is_rendered();
  return a?.update_pending_count(1, s), s.increment(r, t), () => {
    a?.update_pending_count(-1, s), s.decrement(r, t);
  };
}
// @__NO_SIDE_EFFECTS__
function Lr(t) {
  var a = Ea | va;
  return qt !== null && (qt.f |= Er), {
    ctx: la,
    deps: null,
    effects: null,
    equals: zl,
    f: a,
    fn: t,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      wa
    ),
    wv: 0,
    parent: qt,
    ac: null
  };
}
const Gr = Symbol("obsolete");
// @__NO_SIDE_EFFECTS__
function Uv(t, a, s) {
  let r = (
    /** @type {Effect | null} */
    qt
  );
  r === null && zv();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), o = Rs(
    /** @type {V} */
    wa
  ), d = !Rt, f = /* @__PURE__ */ new Set();
  return lc(() => {
    var u = (
      /** @type {Effect} */
      qt
    ), m = yl();
    i = m.promise;
    try {
      Promise.resolve(t()).then(m.resolve, (b) => {
        b !== an && m.reject(b);
      }).finally(bn);
    } catch (b) {
      m.reject(b), bn();
    }
    var p = (
      /** @type {Batch} */
      Et
    );
    if (d) {
      if ((u.f & vr) !== 0)
        var _ = Nl();
      if (
        // boundary can be null if the async derived is inside an $effect.root not connected to the component render tree
        r.b?.is_rendered()
      )
        p.async_deriveds.get(u)?.reject(Gr);
      else
        for (const b of f.values())
          b.reject(Gr);
      f.add(m), p.async_deriveds.set(u, m);
    }
    const k = (b, S = void 0) => {
      _?.(), f.delete(m), S !== Gr && (p.activate(), S ? (o.f |= qs, zr(o, S)) : ((o.f & qs) !== 0 && (o.f ^= qs), zr(o, b)), p.deactivate());
    };
    m.promise.then(k, (b) => k(null, b || "unknown"));
  }), Si(() => {
    for (const u of f)
      u.reject(Gr);
  }), new Promise((u) => {
    function m(p) {
      function _() {
        p === i ? u(o) : m(i);
      }
      p.then(_, _);
    }
    m(i);
  });
}
// @__NO_SIDE_EFFECTS__
function P(t) {
  const a = /* @__PURE__ */ Lr(t);
  return ao(a), a;
}
// @__NO_SIDE_EFFECTS__
function bi(t) {
  const a = /* @__PURE__ */ Lr(t);
  return a.equals = El, a;
}
function Vv(t) {
  var a = t.effects;
  if (a !== null) {
    t.effects = null;
    for (var s = 0; s < a.length; s += 1)
      ja(
        /** @type {Effect} */
        a[s]
      );
  }
}
function yi(t) {
  var a, s = qt, r = t.parent;
  if (!zs && r !== null && t.v !== wa && // if it was never evaluated before, it's guaranteed to fail downstream, so we try to execute instead
  (r.f & (Ta | Pa)) !== 0)
    return Mv(), t.v;
  us(r);
  try {
    Vv(t), a = io(t);
  } finally {
    us(s);
  }
  return a;
}
function Ol(t) {
  var a = yi(t);
  if (!t.equals(a) && (t.wv = ro(), (!Et?.is_fork || t.deps === null) && (Et !== null ? (Et.capture(t, a, !0), wr?.capture(t, a, !0)) : t.v = a, t.deps === null))) {
    ma(t, ka);
    return;
  }
  zs || (as !== null ? (xi() || Et?.is_fork) && as.set(t, a) : _i(t));
}
function Kv(t) {
  if (t.effects !== null)
    for (const a of t.effects)
      (a.teardown || a.ac) && (a.teardown?.(), a.ac !== null && Fs(() => {
        a.ac.abort(an), a.ac = null;
      }), a.fn !== null && (a.teardown = es), Zr(a, 0), Mi(a));
}
function ql(t) {
  if (t.effects !== null)
    for (const a of t.effects)
      a.teardown && a.fn !== null && Cr(a);
}
let qn = null, pr = null, Et = null, wr = null, as = null, ti = null, Ur = !1, jn = !1, Vr = null, fn = null;
var Ni = 0;
let Xv = 1;
class Hs {
  id = Xv++;
  /** True as soon as `#process` was called */
  started = !1;
  linked = !0;
  /** @type {Batch | null} */
  prev = null;
  /** @type {Batch | null} */
  next = null;
  /** @type {Map<Effect, ReturnType<typeof deferred<any>>>} */
  async_deriveds = /* @__PURE__ */ new Map();
  /**
   * The current values of any signals that are updated in this batch.
   * Tuple format: [value, is_derived] (note: is_derived is false for deriveds, too, if they were overridden via assignment)
   * The keys of this map are identical to `this.previous`
   * @type {Map<Value, [any, boolean]>}
   */
  current = /* @__PURE__ */ new Map();
  /**
   * The values of any signals (sources and deriveds) that are updated in this batch _before_ those updates took place.
   * The keys of this map are identical to `this.current`
   * @type {Map<Value, any>}
   */
  previous = /* @__PURE__ */ new Map();
  /**
   * When the batch is committed (and the DOM is updated), we need to remove old branches
   * and append new ones by calling the functions added inside (if/each/key/etc) blocks
   * @type {Set<(batch: Batch) => void>}
   */
  #t = /* @__PURE__ */ new Set();
  /**
   * If a fork is discarded, we need to destroy any effects that are no longer needed
   * @type {Set<(batch: Batch) => void>}
   */
  #o = /* @__PURE__ */ new Set();
  /**
   * The number of async effects that are currently in flight
   */
  #e = 0;
  /**
   * Async effects that are currently in flight, _not_ inside a pending boundary
   * @type {Map<Effect, number>}
   */
  #i = /* @__PURE__ */ new Map();
  /**
   * A deferred that resolves when the batch is committed, used with `settled()`
   * TODO replace with Promise.withResolvers once supported widely enough
   * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
   */
  #a = null;
  /**
   * Effects that were scheduled in this batch but not yet 'resolved' into the
   * root effects that need to be flushed. Resolving — the upwards traversal that
   * marks the path to each effect on the shared effect tree (see #resolve) — is
   * deferred until the batch is processed, so that the markers are created and
   * consumed within a single traversal. Scheduling into other batches (which can
   * happen concurrently, e.g. while a batch is committed) can therefore never
   * observe (and be confused by) this batch's markers.
   * May contain duplicates — deduplication happens during resolving
   * @type {Effect[]}
   */
  #s = [];
  /**
   * Effects created while this batch was active.
   * @type {Effect[]}
   */
  #n = [];
  /**
   * Deferred effects (which run after async work has completed) and their status (DIRTY or MAYBE_DIRTY)
   * @type {Map<Effect, number>}
   */
  #r = /* @__PURE__ */ new Map();
  /**
   * A map of branches that still exist, but will be destroyed when this batch
   * is committed — we skip over these during `process`.
   * The value contains child effects that were dirty/maybe_dirty before being reset,
   * so they can be rescheduled if the branch survives.
   * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
   */
  #l = /* @__PURE__ */ new Map();
  /**
   * Inverse of #skipped_branches which we need to tell prior batches to unskip them when committing
   * @type {Set<Effect>}
   */
  #f = /* @__PURE__ */ new Set();
  is_fork = !1;
  #v = !1;
  constructor() {
    pr === null ? qn = pr = this : (pr.next = this, this.prev = pr), pr = this;
  }
  #h() {
    if (this.is_fork) return !0;
    for (const a of this.#i.keys())
      if (!this.#g(a))
        return !0;
    return !1;
  }
  /**
   * Whether `effect` is inside a branch that this batch skips
   * @param {Effect} effect
   */
  #g(a) {
    for (var s = (
      /** @type {Effect | null} */
      a
    ); s !== null; s = s.parent)
      if (this.#l.has(s)) return !0;
    return !1;
  }
  /**
   * Add an effect to the #skipped_branches map and reset its children
   * @param {Effect} effect
   */
  skip_effect(a) {
    this.#l.has(a) || this.#l.set(a, { d: [], m: [] }), this.#f.delete(a);
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   * @param {(e: Effect) => void} callback
   */
  unskip_effect(a, s = (r) => this.schedule(r)) {
    var r = this.#l.get(a);
    if (r) {
      this.#l.delete(a);
      for (var i of r.d)
        ma(i, va), s(i);
      for (i of r.m)
        ma(i, $a), s(i);
    }
    this.#f.add(a);
  }
  /**
   * Convert the effects that were scheduled in this batch into the root effects
   * that need to be traversed, marking the path to each effect (by clearing the
   * `CLEAN` flag on ancestor branches) so that the traversal can find them.
   * This happens right before traversal rather than at scheduling time, so that
   * the markers left on the (shared) effect tree are created and consumed within
   * a single traversal — scheduling into other batches can never observe them
   * @returns {Effect[]}
   */
  #c() {
    var a = [];
    for (const o of this.#s)
      if (!((o.f & Ta) !== 0 || (o.f & (va | $a)) === 0)) {
        for (var s = o, r = !1; s.parent !== null; ) {
          s = s.parent;
          var i = s.f;
          if ((i & (js | ls)) !== 0) {
            if ((i & ka) === 0) {
              r = !0;
              break;
            }
            s.f ^= ka;
          }
        }
        r || a.push(s);
      }
    return this.#s = [], a;
  }
  #p() {
    this.started = !0;
    for (const [f, u] of this.#r)
      ma(f, u), this.schedule(f);
    this.apply();
    for (var a = Vr = [], s = [], r = fn = []; this.#s.length > 0; ) {
      Ni++ > 1e3 && (this.#u(), Zv());
      for (const f of this.#c())
        try {
          this.#b(f, a, s);
        } catch (u) {
          throw Rl(f), this.#h() || this.discard(), u;
        }
    }
    if (Et = null, r.length > 0) {
      var i = Hs.ensure();
      for (const f of r)
        i.schedule(f);
    }
    if (Vr = null, fn = null, this.#h()) {
      this.#m(s), this.#m(a);
      for (const [f, u] of this.#l)
        Hl(f, u);
      r.length > 0 && /** @type {unknown} */
      Et.#p();
      return;
    }
    const o = this.#k();
    if (o) {
      this.#m(s), this.#m(a), o.#d(this);
      return;
    }
    this.#r.clear();
    for (const f of this.#t) f(this);
    this.#t.clear(), wr = this, Oi(s), Oi(a), wr = null, this.#a?.resolve();
    var d = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      Et
    );
    this.#e === 0 && (this.#s.length === 0 || d !== null) && this.#u(), d !== null && (cs.clear(), d.#p());
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #b(a, s, r) {
    a.f ^= ka;
    for (var i = a.first; i !== null; ) {
      var o = i.f, d = (o & (ls | js)) !== 0, f = d && (o & ka) !== 0, u = f || (o & Pa) !== 0 || this.#l.has(i);
      if (!u && i.fn !== null) {
        d ? i.f ^= ka : (o & Mr) !== 0 ? s.push(i) : rn(i) && ((o & Ua) !== 0 && this.add_dirty_reaction(i, $a), Cr(i));
        var m = i.first;
        if (m !== null) {
          i = m;
          continue;
        }
      }
      for (; i !== null; ) {
        var p = i.next;
        if (p !== null) {
          i = p;
          break;
        }
        i = i.parent;
      }
    }
  }
  #k() {
    for (var a = this.prev; a !== null; a = a.prev)
      if (!a.is_fork && this.#_(a)) return a;
    return null;
  }
  /** @param {Batch} batch */
  #_(a) {
    for (const [s, [, r]] of this.current)
      if (!r && a.current.has(s))
        return !0;
    return !1;
  }
  /**
   * @param {Batch} batch
   */
  #d(a) {
    for (const [r, i] of a.current)
      !this.previous.has(r) && a.previous.has(r) && this.previous.set(r, a.previous.get(r)), this.current.set(r, i);
    for (const [r, i] of a.async_deriveds) {
      const o = this.async_deriveds.get(r);
      o && i.promise.then(o.resolve).catch(o.reject);
    }
    a.async_deriveds.clear(), this.transfer_reactions(a.#r);
    const s = (r) => {
      var i = r.reactions;
      if (i !== null && !((r.f & Ea) !== 0 && (r.f & (va | $a)) === 0))
        for (const f of i) {
          var o = f.f;
          if ((o & Ea) !== 0)
            s(
              /** @type {Derived} */
              f
            );
          else {
            var d = (
              /** @type {Effect} */
              f
            );
            o & (yr | Ua) && !this.async_deriveds.has(d) && (this.#r.delete(d), ma(d, va), this.schedule(d));
          }
        }
    };
    for (const r of this.current.keys())
      s(r);
    this.oncommit(() => a.discard()), a.#u(), Et = this, this.#p();
  }
  /**
   * @param {Effect[]} effects
   */
  #m(a) {
    for (var s = 0; s < a.length; s += 1)
      Pl(a[s], this.#r);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} value
   * @param {boolean} [is_derived]
   */
  capture(a, s, r = !1) {
    a.v !== wa && !this.previous.has(a) && this.previous.set(a, a.v), (a.f & qs) === 0 && (this.current.set(a, [s, r]), as?.set(a, s)), this.is_fork || (a.v = s);
  }
  activate() {
    Et = this;
  }
  deactivate() {
    Et = null, as = null;
  }
  flush() {
    try {
      jn = !0, Et = this, this.#p();
    } finally {
      Ni = 0, ti = null, Vr = null, fn = null, jn = !1, Et = null, as = null, cs.clear();
    }
  }
  discard() {
    for (const a of this.#o) a(this);
    this.#o.clear();
    for (const a of this.async_deriveds.values())
      a.reject(Gr);
    this.#u(), this.#a?.resolve();
  }
  /**
   * @param {Effect} effect
   */
  register_created_effect(a) {
    this.#n.push(a);
  }
  #y() {
    for (let _ = qn; _ !== null; _ = _.next) {
      var a = _.id < this.id, s = [];
      for (const [k, [b, S]] of this.current) {
        if (_.current.has(k)) {
          var r = (
            /** @type {[any, boolean]} */
            _.current.get(k)[0]
          );
          if (a && b !== r)
            _.current.set(k, [b, S]);
          else
            continue;
        }
        s.push(k);
      }
      if (a)
        for (const [k, b] of this.async_deriveds) {
          const S = _.async_deriveds.get(k);
          S && b.promise.then(S.resolve).catch(S.reject);
        }
      var i = [..._.current.keys()].filter(
        (k) => !/** @type {[any, boolean]} */
        _.current.get(k)[1]
      );
      if (!(!_.started || i.length === 0)) {
        var o = i.filter((k) => !this.current.has(k));
        if (o.length === 0)
          a && _.discard();
        else if (s.length > 0) {
          if (a)
            for (const k of this.#f)
              _.unskip_effect(k, (b) => {
                (b.f & (Ua | yr)) !== 0 ? _.schedule(b) : _.#m([b]);
              });
          _.activate();
          var d = /* @__PURE__ */ new Set(), f = /* @__PURE__ */ new Map();
          for (var u of s)
            jl(u, o, d, f);
          f = /* @__PURE__ */ new Map();
          var m = [..._.current].filter(([k, b]) => {
            const S = this.current.get(k);
            return S ? S[0] !== b[0] || S[1] !== b[1] : !0;
          }).map(([k]) => k);
          if (m.length > 0)
            for (const k of this.#n)
              (k.f & (Ta | Pa | gn)) === 0 && wi(k, m, f) && ((k.f & (yr | Ua)) !== 0 ? (ma(k, va), _.schedule(k)) : _.add_dirty_reaction(k, va));
          if (_.#s.length > 0 && !_.#v) {
            _.apply();
            for (var p of _.#c())
              _.#b(p, [], []);
          }
          _.deactivate();
        }
      }
    }
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   */
  increment(a, s) {
    if (this.#e += 1, a) {
      let r = this.#i.get(s) ?? 0;
      this.#i.set(s, r + 1);
    }
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   */
  decrement(a, s) {
    if (this.#e -= 1, a) {
      let r = this.#i.get(s) ?? 0;
      r === 1 ? this.#i.delete(s) : this.#i.set(s, r - 1);
    }
    this.#v || (this.#v = !0, ts(() => {
      this.#v = !1, this.linked && this.flush();
    }));
  }
  /**
   * @param {Map<Effect, number>} dirty_reactions
   */
  transfer_reactions(a) {
    for (const [s, r] of a)
      this.add_dirty_reaction(s, r);
    a.clear();
  }
  /**
   * @param {Effect} effect
   * @param {number} status
   */
  add_dirty_reaction(a, s) {
    (s === va || this.#r.get(a) !== va) && this.#r.set(a, s);
  }
  /** @param {(batch: Batch) => void} fn */
  oncommit(a) {
    this.#t.add(a);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(a) {
    this.#o.add(a);
  }
  settled() {
    return (this.#a ??= yl()).promise;
  }
  static ensure() {
    if (Et === null) {
      const a = Et = new Hs();
      !jn && !Ur && ts(() => {
        a.started || a.flush();
      });
    }
    return Et;
  }
  apply() {
    {
      as = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(a) {
    if (ti = a, a.b?.is_pending && (a.f & (Mr | tn | wl)) !== 0 && (a.f & vr) === 0) {
      a.b.defer_effect(a);
      return;
    }
    this.#s.push(a);
  }
  #u() {
    if (this.linked) {
      var a = this.prev, s = this.next;
      a === null ? qn = s : a.next = s, s === null ? pr = a : s.prev = a, this.linked = !1;
    }
  }
}
function Jv(t) {
  var a = Ur, s = wr;
  wr = null, Ur = !0;
  try {
    for (var r; ; ) {
      if (Fv(), Et === null)
        return (
          /** @type {T} */
          r
        );
      Et.flush();
    }
  } finally {
    Ur = a, wr = s;
  }
}
function Zv() {
  try {
    Pv();
  } catch (t) {
    os(t, ti);
  }
}
let bs = null;
function Oi(t) {
  var a = t.length;
  if (a !== 0) {
    for (var s = 0; s < a; ) {
      var r = t[s++];
      if ((r.f & (Ta | Pa)) === 0 && rn(r) && (bs = /* @__PURE__ */ new Set(), Cr(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Ql(r), bs?.size > 0)) {
        cs.clear();
        for (const i of bs) {
          if ((i.f & (Ta | Pa)) !== 0) continue;
          const o = [i];
          let d = i.parent;
          for (; d !== null; )
            bs.has(d) && (bs.delete(d), o.push(d)), d = d.parent;
          for (let f = o.length - 1; f >= 0; f--) {
            const u = o[f];
            (u.f & (Ta | Pa)) === 0 && Cr(u);
          }
        }
        bs.clear();
      }
    }
    bs = null;
  }
}
function jl(t, a, s, r) {
  if (!s.has(t) && (s.add(t), t.reactions !== null))
    for (const i of t.reactions) {
      const o = i.f;
      (o & Ea) !== 0 ? jl(
        /** @type {Derived} */
        i,
        a,
        s,
        r
      ) : (o & (yr | Ua)) !== 0 && (o & va) === 0 && wi(i, a, r) && (ma(i, va), ki(
        /** @type {Effect} */
        i
      ));
    }
}
function wi(t, a, s) {
  const r = s.get(t);
  if (r !== void 0) return r;
  if (t.deps !== null)
    for (const i of t.deps) {
      if (Xr.call(a, i))
        return !0;
      if ((i.f & Ea) !== 0 && wi(
        /** @type {Derived} */
        i,
        a,
        s
      ))
        return s.set(
          /** @type {Derived} */
          i,
          !0
        ), !0;
    }
  return s.set(t, !1), !1;
}
function ki(t) {
  Et.schedule(t);
}
function Hl(t, a) {
  if (!((t.f & ls) !== 0 && (t.f & ka) !== 0)) {
    (t.f & va) !== 0 ? a.d.push(t) : (t.f & $a) !== 0 && a.m.push(t), ma(t, ka);
    for (var s = t.first; s !== null; )
      Hl(s, a), s = s.next;
  }
}
function Rl(t) {
  ma(t, ka);
  for (var a = t.first; a !== null; )
    Rl(a), a = a.next;
}
let yn = /* @__PURE__ */ new Set();
const cs = /* @__PURE__ */ new Map();
let $l = !1;
function Rs(t, a) {
  var s = {
    f: 0,
    v: t,
    reactions: null,
    equals: zl,
    rv: 0,
    wv: 0
  };
  return s;
}
// @__NO_SIDE_EFFECTS__
function G(t, a) {
  const s = Rs(t);
  return ao(s), s;
}
// @__NO_SIDE_EFFECTS__
function Qv(t, a = !1, s = !0) {
  const r = Rs(t);
  return a || (r.equals = El), Ar && s && la !== null && la.l !== null && (la.l.s ??= []).push(r), r;
}
function g(t, a, s = !1) {
  Rt !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!rs || (Rt.f & gn) !== 0) && Ir() && (Rt.f & (Ea | Ua | yr | gn)) !== 0 && (ds === null || !ds.has(t)) && qv();
  let r = s ? Ct(a) : a;
  return zr(t, r, fn);
}
var Js = null, ai = 0;
function zr(t, a, s = null) {
  if (!t.equals(a)) {
    zs ? cs.set(t, a) : cs.has(t) || cs.set(t, t.v);
    var r = Hs.ensure();
    if (r.capture(t, a), (t.f & Ea) !== 0) {
      const i = (
        /** @type {Derived} */
        t
      );
      (t.f & va) !== 0 && yi(i), as === null && _i(i);
    }
    t.wv = ro(), Js = null, ai = 0, Fl(t, va, s), Js = null, Ir() && qt !== null && (qt.f & ka) !== 0 && (qt.f & (ls | js)) === 0 && (Ga === null ? vc([t]) : Ga.push(t)), !r.is_fork && yn.size > 0 && !$l && ec();
  }
  return a;
}
function ec() {
  $l = !1;
  for (const t of yn) {
    (t.f & ka) !== 0 && ma(t, $a);
    let a;
    try {
      a = rn(t);
    } catch {
      a = !0;
    }
    a && Cr(t);
  }
  yn.clear();
}
function si(t, a = 1) {
  var s = e(t), r = a === 1 ? s++ : s--;
  return g(t, s), r;
}
function Kr(t) {
  g(t, t.v + 1);
}
function Fl(t, a, s) {
  var r = t.reactions;
  if (r !== null) {
    var i = Ir(), o = r.length;
    if (ai += o, ai > 1e5 && Js === null && (Js = /* @__PURE__ */ new Set()), Js !== null) {
      if (Js.has(t)) return;
      Js.add(t);
    }
    for (var d = 0; d < o; d++) {
      var f = r[d], u = f.f;
      if (!(!i && f === qt)) {
        var m = (u & va) === 0;
        if (m && ma(f, a), (u & gn) !== 0)
          yn.add(
            /** @type {Effect} */
            f
          );
        else if ((u & Ea) !== 0) {
          var p = (
            /** @type {Derived} */
            f
          );
          as?.delete(p), Fl(p, $a, s);
        } else if (m) {
          var _ = (
            /** @type {Effect} */
            f
          );
          (u & Ua) !== 0 && bs !== null && bs.add(_), s !== null ? s.push(_) : ki(_);
        }
      }
    }
  }
}
function Ct(t) {
  if (typeof t != "object" || t === null || xs in t || xl in t)
    return t;
  const a = Ln(t);
  if (a !== bl && a !== av)
    return t;
  var s = /* @__PURE__ */ new Map(), r = en(t), i = /* @__PURE__ */ G(0), o = rr, d = (f) => {
    if (rr === o)
      return f();
    var u = Rt, m = rr;
    Va(null), Hi(o);
    var p = f();
    return Va(u), Hi(m), p;
  };
  return r && s.set("length", /* @__PURE__ */ G(
    /** @type {any[]} */
    t.length
  )), new Proxy(
    /** @type {any} */
    t,
    {
      defineProperty(f, u, m) {
        (!("value" in m) || m.configurable === !1 || m.enumerable === !1 || m.writable === !1) && Nv();
        var p = s.get(u);
        return p === void 0 ? d(() => {
          var _ = /* @__PURE__ */ G(m.value);
          return s.set(u, _), _;
        }) : g(p, m.value, !0), !0;
      },
      deleteProperty(f, u) {
        var m = s.get(u);
        if (m === void 0) {
          if (u in f) {
            const p = d(() => /* @__PURE__ */ G(wa));
            s.set(u, p), Kr(i);
          }
        } else
          g(m, wa), Kr(i);
        return !0;
      },
      get(f, u, m) {
        if (u === xs)
          return t;
        var p = s.get(u), _ = u in f;
        if (p === void 0 && (!_ || br(f, u)?.writable) && (p = d(() => {
          var b = Ct(_ ? f[u] : wa), S = /* @__PURE__ */ G(b);
          return S;
        }), s.set(u, p)), p !== void 0) {
          var k = e(p);
          return k === wa ? void 0 : k;
        }
        return Reflect.get(f, u, m);
      },
      getOwnPropertyDescriptor(f, u) {
        this.has?.(f, u);
        var m = Reflect.getOwnPropertyDescriptor(f, u), p = s.get(u);
        if (p !== void 0) {
          var _ = e(p);
          if (_ === wa)
            return;
          if (m && "value" in m)
            m.value = _;
          else
            return {
              enumerable: !0,
              configurable: !0,
              value: _,
              writable: !0
            };
        }
        return m;
      },
      has(f, u) {
        if (u === xs)
          return !0;
        var m = s.get(u), p = m !== void 0 && m.v !== wa || Reflect.has(f, u);
        if (m !== void 0 || (qt !== null || Rt !== null) && (!p || br(f, u)?.writable)) {
          m === void 0 && (m = d(() => {
            var k = p ? Ct(f[u]) : wa, b = /* @__PURE__ */ G(k);
            return b;
          }), s.set(u, m));
          var _ = e(m);
          if (_ === wa)
            return !1;
        }
        return p;
      },
      set(f, u, m, p) {
        var _ = s.get(u), k = u in f;
        if (r && u === "length")
          for (var b = m; b < /** @type {Source<number>} */
          _.v; b += 1) {
            var S = s.get(b + "");
            S !== void 0 ? g(S, wa) : b in f && (S = d(() => /* @__PURE__ */ G(wa)), s.set(b + "", S));
          }
        if (_ === void 0)
          (!k || br(f, u)?.writable) && (_ = d(() => /* @__PURE__ */ G(void 0)), g(_, Ct(m)), s.set(u, _));
        else {
          k = _.v !== wa;
          var E = d(() => Ct(m));
          g(_, E);
        }
        var z = Reflect.getOwnPropertyDescriptor(f, u);
        if (z?.set && z.set.call(p, m), !k) {
          if (r && typeof u == "string") {
            var x = (
              /** @type {Source<number>} */
              s.get("length")
            ), A = Number(u);
            Number.isInteger(A) && A >= x.v && g(x, A + 1);
          }
          Kr(i);
        }
        return !0;
      },
      ownKeys(f) {
        e(i);
        var u = Reflect.ownKeys(f).filter((_) => {
          var k = s.get(_);
          return k === void 0 || k.v !== wa;
        });
        for (var [m, p] of s)
          p.v !== wa && !(m in f) && u.push(m);
        return u;
      },
      setPrototypeOf() {
        Ov();
      }
    }
  );
}
function qi(t) {
  try {
    if (t !== null && typeof t == "object" && xs in t)
      return t[xs];
  } catch {
  }
  return t;
}
function Bl(t, a) {
  return Object.is(qi(t), qi(a));
}
var Ls, Gl, Wl, Yl;
function tc() {
  if (Ls === void 0) {
    Ls = window, Gl = /Firefox/.test(navigator.userAgent);
    var t = Element.prototype, a = Node.prototype, s = Text.prototype;
    Wl = br(a, "firstChild").get, Yl = br(a, "nextSibling").get, Pi(t) && (t[Zn] = void 0, t[Sl] = null, t[Qn] = void 0, t.__e = void 0), Pi(s) && (s[ei] = void 0);
  }
}
function Ss(t = "") {
  return document.createTextNode(t);
}
// @__NO_SIDE_EFFECTS__
function ss(t) {
  return (
    /** @type {TemplateNode | null} */
    Wl.call(t)
  );
}
// @__NO_SIDE_EFFECTS__
function sn(t) {
  return (
    /** @type {TemplateNode | null} */
    Yl.call(t)
  );
}
function l(t, a) {
  return /* @__PURE__ */ ss(t);
}
function we(t, a = !1) {
  {
    var s = /* @__PURE__ */ ss(t);
    return s instanceof Comment && s.data === "" ? /* @__PURE__ */ sn(s) : s;
  }
}
function C(t, a = !1) {
  return /* @__PURE__ */ ss(t);
}
function n(t, a = 1, s = !1) {
  let r = t;
  for (; a--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ sn(r);
  return r;
}
function ac(t) {
  t.textContent = "";
}
function Ul() {
  return !1;
}
function Vl(t, a, s) {
  return a == null || a === Ll ? (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    s ? document.createElement(t, { is: s }) : document.createElement(t)
  ) : (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    s ? document.createElementNS(a, t, { is: s }) : document.createElementNS(a, t)
  );
}
function sc(t) {
  var a = qt;
  if (a === null)
    return Rt.f |= qs, t;
  if ((a.f & vr) === 0 && (a.f & Mr) === 0)
    throw t;
  os(t, a);
}
function os(t, a) {
  if (t === Tl)
    throw t;
  if (!(a !== null && (a.f & Ta) !== 0)) {
    for (; a !== null; ) {
      if ((a.f & Jn) !== 0 && (a.f & (Ta | Jr)) === 0) {
        if ((a.f & vr) === 0)
          throw t;
        try {
          a.b.error(t);
          return;
        } catch (s) {
          t = s;
        }
      }
      a = a.parent;
    }
    throw t;
  }
}
function Kl(t) {
  qt === null && (Rt === null && Iv(), Av()), zs && Ev();
}
function rc(t, a) {
  var s = a.last;
  s === null ? a.last = a.first = t : (s.next = t, t.prev = s, a.last = t);
}
function hs(t, a) {
  var s = qt;
  s !== null && (s.f & Pa) !== 0 && (t |= Pa);
  var r = {
    ctx: la,
    deps: null,
    nodes: null,
    f: t | va | ns,
    first: null,
    fn: a,
    last: null,
    next: null,
    parent: s,
    b: s && s.b,
    prev: null,
    teardown: null,
    wv: 0,
    ac: null
  };
  Et?.register_created_effect(r);
  var i = r;
  if ((t & Mr) !== 0)
    Vr !== null ? Vr.push(r) : Hs.ensure().schedule(r);
  else if (a !== null) {
    try {
      Cr(r);
    } catch (d) {
      throw ja(r), d;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & Er) === 0 && (i = i.first, (t & Ua) !== 0 && (t & Ts) !== 0 && i !== null && (i.f |= Ts));
  }
  if (i !== null && (i.parent = s, s !== null && rc(i, s), Rt !== null && (Rt.f & Ea) !== 0 && (t & js) === 0)) {
    var o = (
      /** @type {Derived} */
      Rt
    );
    (o.effects ??= []).push(i);
  }
  return r;
}
function xi() {
  return Rt !== null && !rs;
}
function Si(t) {
  const a = hs(tn, null);
  return ma(a, ka), a.teardown = t, a;
}
function $t(t) {
  Kl();
  var a = (
    /** @type {Effect} */
    qt.f
  ), s = !Rt && (a & ls) !== 0 && la !== null && !la.i;
  if (s) {
    var r = (
      /** @type {ComponentContext} */
      la
    );
    (r.e ??= []).push(t);
  } else
    return Xl(t);
}
function Xl(t) {
  return hs(Mr | kl, t);
}
function nc(t) {
  return Kl(), hs(tn | kl, t);
}
function ic(t) {
  Hs.ensure();
  const a = hs(js | Er, t);
  return (s = {}) => new Promise((r) => {
    s.outro ? sr(a, () => {
      ja(a), r(void 0);
    }) : (ja(a), r(void 0));
  });
}
function zn(t) {
  return hs(Mr, t);
}
function lc(t) {
  return hs(yr | Er, t);
}
function Cn(t, a = 0) {
  return hs(tn | a, t);
}
function L(t, a = [], s = [], r = []) {
  Wv(r, a, s, (i) => {
    hs(tn, () => {
      t(...i.map(e));
    });
  });
}
function Pr(t, a = 0) {
  var s = hs(Ua | a, t);
  return s;
}
function Ya(t) {
  return hs(ls | Er, t);
}
function Jl(t) {
  var a = t.teardown;
  if (a !== null) {
    const s = zs, r = Rt;
    ji(!0), Va(null);
    try {
      a.call(null);
    } catch (i) {
      os(i, t.parent);
    } finally {
      ji(s), Va(r);
    }
  }
}
function Mi(t, a = !1) {
  var s = t.first;
  for (t.first = t.last = null; s !== null; ) {
    const i = s.ac;
    i !== null && Fs(() => {
      i.abort(an);
    });
    var r = s.next;
    (s.f & js) !== 0 ? s.parent = null : ja(s, a), s = r;
  }
}
function oc(t) {
  for (var a = t.first; a !== null; ) {
    var s = a.next;
    (a.f & ls) === 0 && ja(a), a = s;
  }
}
function ja(t, a = !0) {
  var s = !1;
  (a || (t.f & nv) !== 0) && t.nodes !== null && t.nodes.end !== null && (Zl(
    t.nodes.start,
    /** @type {TemplateNode} */
    t.nodes.end
  ), s = !0), t.f |= Jr, Mi(t, a && !s), Zr(t, 0);
  var r = t.nodes && t.nodes.t;
  if (r !== null)
    for (const o of r)
      o.stop();
  Jl(t), t.f ^= Jr, t.f |= Ta;
  var i = t.parent;
  i !== null && i.first !== null && Ql(t), t.next = t.prev = t.teardown = t.ctx = t.deps = t.fn = t.nodes = t.ac = t.b = null;
}
function Zl(t, a) {
  for (; t !== null; ) {
    var s = t === a ? null : /* @__PURE__ */ sn(t);
    t.remove(), t = s;
  }
}
function Ql(t) {
  var a = t.parent, s = t.prev, r = t.next;
  s !== null && (s.next = r), r !== null && (r.prev = s), a !== null && (a.first === t && (a.first = r), a.last === t && (a.last = s));
}
function sr(t, a, s = !0) {
  var r = [];
  t.f |= mi, eo(t, r, !0);
  var i = () => {
    s && ja(t), a && a();
  }, o = r.length;
  if (o > 0) {
    var d = () => --o || i();
    for (var f of r)
      f.out(d);
  } else
    i();
}
function eo(t, a, s) {
  if ((t.f & Pa) === 0) {
    t.f ^= Pa;
    var r = t.nodes && t.nodes.t;
    if (r !== null)
      for (const f of r)
        (f.is_global || s) && a.push(f);
    for (var i = t.first; i !== null; ) {
      var o = i.next;
      if ((i.f & js) === 0) {
        var d = (i.f & Ts) !== 0 || // If this is a branch effect without a block effect parent,
        // it means the parent block effect was pruned. In that case,
        // transparency information was transferred to the branch effect.
        (i.f & ls) !== 0 && (t.f & Ua) !== 0;
        eo(i, a, d ? s : !1);
      }
      i = o;
    }
  }
}
function wn(t) {
  t.f &= ~mi, to(t, !0);
}
function to(t, a) {
  if ((t.f & mi) === 0 && (t.f & Pa) !== 0) {
    t.f ^= Pa, (t.f & ka) === 0 && (ma(t, va), Hs.ensure().schedule(t));
    for (var s = t.first; s !== null; ) {
      var r = s.next, i = (s.f & Ts) !== 0 || (s.f & ls) !== 0;
      to(s, i ? a : !1), s = r;
    }
    var o = t.nodes && t.nodes.t;
    if (o !== null)
      for (const d of o)
        (d.is_global || a) && d.in();
  }
}
function Ti(t, a) {
  if (t.nodes)
    for (var s = t.nodes.start, r = t.nodes.end; s !== null; ) {
      var i = s === r ? null : /* @__PURE__ */ sn(s);
      a.append(s), s = i;
    }
}
let zs = !1;
function ji(t) {
  zs = t;
}
let Rt = null, rs = !1;
function Va(t) {
  Rt = t;
}
let qt = null;
function us(t) {
  qt = t;
}
let ds = null;
function ao(t) {
  Rt !== null && ((Rt.f & _n) !== 0 || (Rt.f & Ea) !== 0) && (ds ??= /* @__PURE__ */ new Set()).add(t);
}
let qa = null, Ra = 0, Ga = null;
function vc(t) {
  Ga = t;
}
let so = 1, Qs = 0, rr = Qs;
function Hi(t) {
  rr = t;
}
function ro() {
  return ++so;
}
function rn(t) {
  var a = t.f;
  if ((a & va) !== 0)
    return !0;
  if ((a & $a) !== 0) {
    for (var s = (
      /** @type {Value[]} */
      t.deps
    ), r = s.length, i = 0; i < r; i++) {
      var o = s[i];
      if (rn(
        /** @type {Derived} */
        o
      ) && Ol(
        /** @type {Derived} */
        o
      ), o.wv > t.wv)
        return !0;
    }
    (a & ns) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    as === null && ma(t, ka);
  }
  return !1;
}
function no(t, a, s = !0) {
  var r = t.reactions;
  if (r !== null && !(ds !== null && ds.has(t)))
    for (var i = 0; i < r.length; i++) {
      var o = r[i];
      (o.f & Ea) !== 0 ? no(
        /** @type {Derived} */
        o,
        a,
        !1
      ) : a === o && (s ? ma(o, va) : (o.f & ka) !== 0 && ma(o, $a), ki(
        /** @type {Effect} */
        o
      ));
    }
}
function io(t) {
  var a = qa, s = Ra, r = Ga, i = Rt, o = ds, d = la, f = rs, u = rr, m = t.f;
  qa = /** @type {null | Value[]} */
  null, Ra = 0, Ga = null, Rt = (m & (ls | js)) === 0 ? t : null, ds = null, Tr(t.ctx), rs = !1, rr = ++Qs, t.ac !== null && (Fs(() => {
    t.ac.abort(an);
  }), t.ac = null);
  try {
    t.f |= _n;
    var p = (
      /** @type {Function} */
      t.fn
    ), _ = p();
    t.f |= vr;
    var k = Ri(t);
    if (Ir() && Ga !== null && !rs && k !== null && (t.f & (Ea | $a | va)) === 0)
      for (var b = 0; b < /** @type {Source[]} */
      Ga.length; b++)
        no(
          Ga[b],
          /** @type {Effect} */
          t
        );
    if (i !== null && i !== t) {
      if (Qs++, i.deps !== null)
        for (let S = 0; S < s; S += 1)
          i.deps[S].rv = Qs;
      if (a !== null)
        for (const S of a)
          S.rv = Qs;
      Ga !== null && (r === null ? r = Ga : r.push(.../** @type {Source[]} */
      Ga));
    }
    return (t.f & qs) !== 0 && (t.f ^= qs), _;
  } catch (S) {
    return Ri(t), sc(S);
  } finally {
    t.f ^= _n, qa = a, Ra = s, Ga = r, Rt = i, ds = o, Tr(d), rs = f, rr = u;
  }
}
function Ri(t) {
  var a = t.deps, s = Et?.is_fork;
  if (qa !== null) {
    var r;
    if (s || Zr(t, Ra), a !== null && Ra > 0)
      for (a.length = Ra + qa.length, r = 0; r < qa.length; r++)
        a[Ra + r] = qa[r];
    else
      t.deps = a = qa;
    if (xi() && (t.f & ns) !== 0)
      for (r = Ra; r < a.length; r++)
        (a[r].reactions ??= []).push(t);
  } else !s && a !== null && Ra < a.length && (Zr(t, Ra), a.length = Ra);
  return a;
}
function cc(t, a) {
  let s = a.reactions;
  if (s !== null) {
    var r = tv.call(s, t);
    if (r !== -1) {
      var i = s.length - 1;
      i === 0 ? s = a.reactions = null : (s[r] = s[i], s.pop());
    }
  }
  if (s === null && (a.f & Ea) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (qa === null || !Xr.call(qa, a))) {
    var o = (
      /** @type {Derived} */
      a
    );
    (o.f & ns) !== 0 && (o.f ^= ns), o.v !== wa && _i(o), o.ac !== null && Fs(() => {
      o.ac.abort(an), o.ac = null, ma(o, va);
    }), Kv(o), Zr(o, 0);
  }
}
function Zr(t, a) {
  var s = t.deps;
  if (s !== null)
    for (var r = a; r < s.length; r++)
      cc(t, s[r]);
}
function Cr(t) {
  var a = t.f;
  if ((a & Ta) === 0) {
    ma(t, ka);
    var s = qt;
    qt = t;
    try {
      (a & (Ua | wl)) !== 0 ? oc(t) : Mi(t), Jl(t);
      var r = io(t);
      t.teardown = typeof r == "function" ? r : null, t.wv = so;
      var i;
    } finally {
      qt = s;
    }
  }
}
async function lo() {
  await Promise.resolve(), Jv();
}
function e(t) {
  var a = t.f, s = (a & Ea) !== 0;
  if (Rt !== null && !rs) {
    var r = qt !== null && (qt.f & Ta) !== 0;
    if (!r && (ds === null || !ds.has(t))) {
      var i = Rt.deps;
      if ((Rt.f & _n) !== 0)
        t.rv < Qs && (t.rv = Qs, qa === null && i !== null && i[Ra] === t ? Ra++ : qa === null ? qa = [t] : qa.push(t));
      else {
        Rt.deps ??= [], Xr.call(Rt.deps, t) || Rt.deps.push(t);
        var o = t.reactions;
        o === null ? t.reactions = [Rt] : Xr.call(o, Rt) || o.push(Rt);
      }
    }
  }
  if (zs && cs.has(t))
    return cs.get(t);
  if (s) {
    var d = (
      /** @type {Derived} */
      t
    );
    if (zs) {
      var f = d.v;
      return ((d.f & ka) === 0 && d.reactions !== null || vo(d)) && (f = yi(d)), cs.set(d, f), f;
    }
    var u = (d.f & ns) === 0 && !rs && Rt !== null && (Rt.f & ns) !== 0, m = (d.f & vr) === 0;
    rn(d) && (u && (d.f |= ns), Ol(d)), u && !m && (ql(d), oo(d));
  }
  if (as?.has(t))
    return as.get(t);
  if ((t.f & qs) !== 0)
    throw t.v;
  return t.v;
}
function oo(t) {
  if (t.f |= ns, t.deps !== null)
    for (const s of t.deps) {
      var a = s.reactions;
      a === null ? s.reactions = [t] : Xr.call(a, t) || a.push(t), (s.f & Ea) !== 0 && (s.f & ns) === 0 && (ql(
        /** @type {Derived} */
        s
      ), oo(
        /** @type {Derived} */
        s
      ));
    }
}
function vo(t) {
  if (t.v === wa) return !0;
  if (t.deps === null) return !1;
  for (const a of t.deps)
    if (cs.has(a) || (a.f & Ea) !== 0 && vo(
      /** @type {Derived} */
      a
    ))
      return !0;
  return !1;
}
function ps(t) {
  var a = rs;
  try {
    return rs = !0, t();
  } finally {
    rs = a;
  }
}
function co(t) {
  if (!(typeof t != "object" || !t || t instanceof EventTarget)) {
    if (xs in t)
      ri(t);
    else if (!Array.isArray(t))
      for (let a in t) {
        const s = t[a];
        typeof s == "object" && s && xs in s && ri(s);
      }
  }
}
function ri(t, a = /* @__PURE__ */ new Set()) {
  if (typeof t == "object" && t !== null && // We don't want to traverse DOM elements
  !(t instanceof EventTarget) && !a.has(t)) {
    a.add(t), t instanceof Date && t.getTime();
    for (let r in t)
      try {
        ri(t[r], a);
      } catch {
      }
    const s = Ln(t);
    if (s !== Object.prototype && s !== Array.prototype && s !== Map.prototype && s !== Set.prototype && s !== Date.prototype) {
      const r = _l(s);
      for (let i in r) {
        const o = r[i].get;
        if (o)
          try {
            o.call(t);
          } catch {
          }
      }
    }
  }
}
const dc = ["touchstart", "touchmove"];
function uc(t) {
  return dc.includes(t);
}
const Wr = Symbol("events"), uo = /* @__PURE__ */ new Set(), ni = /* @__PURE__ */ new Set();
function fc(t, a, s, r = {}) {
  function i(o) {
    if (r.capture || ii.call(a, o), !o.cancelBubble)
      return Fs(() => s?.call(this, o));
  }
  return t.startsWith("pointer") || t.startsWith("touch") || t === "wheel" ? (i.__removed = !1, ts(() => {
    i.__removed || a.addEventListener(t, i, r);
  })) : a.addEventListener(t, i, r), i;
}
function xa(t, a, s, r, i) {
  var o = { capture: r, passive: i }, d = fc(t, a, s, o);
  (a === document.body || // @ts-ignore
  a === window || // @ts-ignore
  a === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  a instanceof HTMLMediaElement) && Si(() => {
    d.__removed = !0, a.removeEventListener(t, d, o);
  });
}
function y(t, a, s) {
  (a[Wr] ??= {})[t] = s;
}
function Wt(t) {
  for (var a = 0; a < t.length; a++)
    uo.add(t[a]);
  for (var s of ni)
    s(t);
}
let Hn = null, Rn = !1;
function ii(t) {
  var a = this, s = (
    /** @type {Node} */
    a.ownerDocument
  ), r = t.type, i = t.composedPath?.() || [], o = (
    /** @type {null | Element} */
    i[0] || t.target
  );
  Hn = t, Rn || (Rn = !0, setTimeout(() => {
    Rn = !1, Hn = null;
  }));
  var d = 0, f = Hn === t && t[Wr];
  if (f) {
    var u = i.indexOf(f);
    if (u !== -1 && (a === document || a === /** @type {any} */
    window)) {
      t[Wr] = a;
      return;
    }
    var m = i.indexOf(a);
    if (m === -1)
      return;
    u <= m && (d = u);
  }
  if (o = /** @type {Element} */
  i[d] || t.target, o !== a) {
    gl(t, "currentTarget", {
      configurable: !0,
      get() {
        return o || s;
      }
    });
    var p = Rt, _ = qt;
    Va(null), us(null);
    try {
      for (var k, b = []; o !== null && o !== a; ) {
        try {
          var S = o[Wr]?.[r];
          S != null && (!/** @type {any} */
          o.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          t.target === o) && S.call(o, t);
        } catch (E) {
          k ? b.push(E) : k = E;
        }
        if (t.cancelBubble) break;
        d++, o = d < i.length ? (
          /** @type {Element} */
          i[d]
        ) : null;
      }
      if (k) {
        for (let E of b)
          queueMicrotask(() => {
            throw E;
          });
        throw k;
      }
    } finally {
      t[Wr] = a, delete t.currentTarget, Va(p), us(_);
    }
  }
}
const hc = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (t) => t
  })
);
function pc(t) {
  return (
    /** @type {string} */
    hc?.createHTML(t) ?? t
  );
}
function fo(t) {
  var a = Vl("template");
  return a.innerHTML = pc(t.replaceAll("<!>", "<!---->")), a.content;
}
function ir(t, a) {
  var s = (
    /** @type {Effect} */
    qt
  );
  s.nodes === null && (s.nodes = { start: t, end: a, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function h(t, a) {
  var s = (a & wv) !== 0, r = (a & kv) !== 0, i, o = !t.startsWith("<!>");
  return () => {
    i === void 0 && (i = fo(o ? t : "<!>" + t), s || (i = /** @type {TemplateNode} */
    /* @__PURE__ */ ss(i)));
    var d = (
      /** @type {TemplateNode} */
      r || Gl ? document.importNode(i, !0) : i.cloneNode(!0)
    );
    if (s) {
      var f = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ ss(d)
      ), u = (
        /** @type {TemplateNode} */
        d.lastChild
      );
      ir(f, u);
    } else
      ir(d, d);
    return d;
  };
}
// @__NO_SIDE_EFFECTS__
function mc(t, a, s = "svg") {
  var r = !t.startsWith("<!>"), i = `<${s}>${r ? t : "<!>" + t}</${s}>`, o;
  return () => {
    if (!o) {
      var d = (
        /** @type {DocumentFragment} */
        fo(i)
      ), f = (
        /** @type {Element} */
        /* @__PURE__ */ ss(d)
      );
      o = /** @type {Element} */
      /* @__PURE__ */ ss(f);
    }
    var u = (
      /** @type {TemplateNode} */
      o.cloneNode(!0)
    );
    return ir(u, u), u;
  };
}
// @__NO_SIDE_EFFECTS__
function gc(t, a) {
  return /* @__PURE__ */ mc(t, a, "svg");
}
function za(t = "") {
  {
    var a = Ss(t + "");
    return ir(a, a), a;
  }
}
function ta() {
  var t = document.createDocumentFragment(), a = document.createComment(""), s = Ss();
  return t.append(a, s), ir(a, s), t;
}
function v(t, a) {
  t !== null && t.before(
    /** @type {Node} */
    a
  );
}
function _c(t) {
  let a = 0, s = Rs(0), r;
  return () => {
    xi() && (e(s), Cn(() => (a === 0 && (r = ps(() => t(() => Kr(s)))), a += 1, () => {
      ts(() => {
        a -= 1, a === 0 && (r?.(), r = void 0, Kr(s));
      });
    })));
  };
}
var bc = Ts | Er;
function yc(t, a, s, r) {
  new wc(t, a, s, r);
}
class wc {
  /** @type {Boundary | null} */
  parent;
  is_pending = !1;
  /**
   * API-level transformError transform function. Transforms errors before they reach the `failed` snippet.
   * Inherited from parent boundary, or defaults to identity.
   * @type {(error: unknown) => unknown}
   */
  transform_error;
  /** @type {TemplateNode} */
  #t;
  /** @type {TemplateNode | null} */
  #o = null;
  /** @type {BoundaryProps} */
  #e;
  /** @type {((anchor: Node) => void)} */
  #i;
  /** @type {Effect} */
  #a;
  /** @type {Effect | null} */
  #s = null;
  /** @type {Effect | null} */
  #n = null;
  /** @type {Effect | null} */
  #r = null;
  /** @type {DocumentFragment | null} */
  #l = null;
  #f = 0;
  #v = 0;
  #h = !1;
  /** @type {Map<Effect, number>} */
  #g = /* @__PURE__ */ new Map();
  /**
   * A source containing the number of pending async deriveds/expressions.
   * Only created if `$effect.pending()` is used inside the boundary,
   * otherwise updating the source results in needless `Batch.ensure()`
   * calls followed by no-op flushes
   * @type {Source<number> | null}
   */
  #c = null;
  #p = _c(() => (this.#c = Rs(this.#f), () => {
    this.#c = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(a, s, r, i) {
    this.#t = a, this.#e = s, this.#i = (o) => {
      var d = (
        /** @type {Effect} */
        qt
      );
      d.b = this, d.f |= Jn, r(o);
    }, this.parent = /** @type {Effect} */
    qt.b, this.transform_error = i ?? this.parent?.transform_error ?? ((o) => o), this.#a = Pr(() => {
      this.#y();
    }, bc);
  }
  #b() {
    try {
      this.#s = Ya(() => this.#i(this.#t));
    } catch (a) {
      this.error(a);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #k(a) {
    const s = this.#e.failed, { reset: r, invoke_onerror: i } = this.#_(a);
    ts(i), s && (this.#r = Ya(() => {
      s(
        this.#t,
        () => a,
        () => r
      );
    }));
  }
  /**
   * Creates the `reset` function for a failed boundary, along with a function
   * that invokes `onerror` with it (if provided)
   * @param {unknown} error
   * @returns {{ reset: () => void, invoke_onerror: () => void }}
   */
  #_(a) {
    var s = !1, r = !1;
    const i = () => {
      if (!this.#d()) {
        if (s) {
          Lv();
          return;
        }
        s = !0, r && jv(), this.#r !== null && sr(this.#r, () => {
          this.#r = null;
        }), this.#w(() => {
          this.#y();
        });
      }
    };
    return { reset: i, invoke_onerror: () => {
      if (!this.#d())
        try {
          r = !0, this.#e.onerror?.(a, i), r = !1;
        } catch (d) {
          os(d, this.#a && this.#a.parent);
        }
    } };
  }
  #d() {
    return (this.#a.f & (Ta | Jr)) !== 0;
  }
  #m() {
    const a = this.#e.pending;
    a && (this.is_pending = !0, this.#n = Ya(() => a(this.#t)), ts(() => {
      if (!this.#d()) {
        var s = this.#l = document.createDocumentFragment(), r = Ss(), i = !1;
        if (s.append(r), this.#s = this.#w(() => {
          try {
            return Ya(() => this.#i(r));
          } catch (o) {
            try {
              this.error(o), i = !0;
            } catch (d) {
              os(d, this.#a.parent);
            }
            return null;
          }
        }), this.#s === null) {
          this.#l = null, i && this.#u(
            /** @type {Batch} */
            Et
          );
          return;
        }
        this.#v === 0 && (this.#t.before(s), this.#l = null, sr(
          /** @type {Effect} */
          this.#n,
          () => {
            this.#n = null;
          }
        ), this.#u(
          /** @type {Batch} */
          Et
        ));
      }
    }));
  }
  #y() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#v = 0, this.#f = 0, this.#s = Ya(() => {
        this.#i(this.#t);
      }), this.#v > 0) {
        var a = this.#l = document.createDocumentFragment();
        Ti(this.#s, a);
        const s = (
          /** @type {(anchor: Node) => void} */
          this.#e.pending
        );
        this.#n = Ya(() => s(this.#t));
      } else
        this.#u(
          /** @type {Batch} */
          Et
        );
    } catch (s) {
      this.error(s);
    }
  }
  /**
   * @param {Batch} batch
   */
  #u(a) {
    this.is_pending = !1, a.transfer_reactions(this.#g);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(a) {
    Pl(a, this.#g);
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!this.#e.pending;
  }
  /**
   * @template T
   * @param {() => T} fn
   */
  #w(a) {
    var s = qt, r = Rt, i = la;
    us(this.#a), Va(this.#a), Tr(this.#a.ctx);
    try {
      return Hs.ensure(), a();
    } finally {
      us(s), Va(r), Tr(i);
    }
  }
  /**
   * Updates the pending count associated with the currently visible pending snippet,
   * if any, such that we can replace the snippet with content once work is done
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  #x(a, s) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#x(a, s);
      return;
    }
    this.#v += a, this.#v === 0 && (this.#u(s), this.#n && sr(this.#n, () => {
      this.#n = null;
    }), this.#l && (this.#t.before(this.#l), this.#l = null));
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  update_pending_count(a, s) {
    this.#x(a, s), this.#f += a, !(!this.#c || this.#h) && (this.#h = !0, ts(() => {
      this.#h = !1, this.#c && zr(this.#c, this.#f);
    }));
  }
  get_effect_pending() {
    return this.#p(), e(
      /** @type {Source<number>} */
      this.#c
    );
  }
  /** @param {unknown} error */
  error(a) {
    if (a === Tl || !this.#e.onerror && !this.#e.failed)
      throw a;
    Et?.is_fork ? (this.#s && Et.skip_effect(this.#s), this.#n && Et.skip_effect(this.#n), this.#r && Et.skip_effect(this.#r), Et.oncommit(() => {
      this.#d() || this.#S(a);
    })) : this.#S(a);
  }
  /**
   * @param {unknown} error
   */
  #S(a) {
    this.#s && (ja(this.#s), this.#s = null), this.#n && (ja(this.#n), this.#n = null), this.#r && (ja(this.#r), this.#r = null);
    let s = this.#e.failed;
    const r = (i) => {
      if (this.#d()) return;
      const { reset: o, invoke_onerror: d } = this.#_(i);
      d(), s && !this.#d() && (this.#r = this.#w(() => {
        try {
          return Ya(() => {
            var f = (
              /** @type {Effect} */
              qt
            );
            f.b = this, f.f |= Jn, s(
              this.#t,
              () => i,
              () => o
            );
          });
        } catch (f) {
          return os(
            f,
            /** @type {Effect} */
            this.#a.parent
          ), null;
        }
      }));
    };
    ts(() => {
      if (!this.#d()) {
        var i;
        try {
          i = this.transform_error(a);
        } catch (o) {
          os(o, this.#a && this.#a.parent);
          return;
        }
        i !== null && typeof i == "object" && typeof /** @type {any} */
        i.then == "function" ? i.then(
          r,
          /** @param {unknown} e */
          (o) => os(o, this.#a && this.#a.parent)
        ) : r(i);
      }
    });
  }
}
let li = !0;
function T(t, a) {
  var s = a == null ? "" : typeof a == "object" ? `${a}` : a;
  s !== /** @type {any} */
  (t[ei] ??= t.nodeValue) && (t[ei] = s, t.nodeValue = `${s}`);
}
function kc(t, a) {
  return xc(t, a);
}
const on = /* @__PURE__ */ new Map();
function xc(t, { target: a, anchor: s, props: r = {}, events: i, context: o, intro: d = !0, transformError: f }) {
  tc();
  var u = void 0, m = ic(() => {
    var p = s ?? a.appendChild(Ss());
    yc(
      /** @type {TemplateNode} */
      p,
      {
        pending: () => {
        }
      },
      (b) => {
        Tt({});
        var S = (
          /** @type {ComponentContext} */
          la
        );
        o && (S.c = o), i && (r.$$events = i), li = d, u = t(b, r) || gi(), li = !0, Lt();
      },
      f
    );
    var _ = /* @__PURE__ */ new Set(), k = (b) => {
      for (var S = 0; S < b.length; S++) {
        var E = b[S];
        if (!_.has(E)) {
          _.add(E);
          var z = uc(E);
          for (const j of [a, document]) {
            var x = on.get(j);
            x === void 0 && (x = /* @__PURE__ */ new Map(), on.set(j, x));
            var A = x.get(E);
            A === void 0 ? (j.addEventListener(E, ii, { passive: z }), x.set(E, 1)) : x.set(E, A + 1);
          }
        }
      }
    };
    return k(Tn(uo)), ni.add(k), () => {
      for (var b of _)
        for (const z of [a, document]) {
          var S = (
            /** @type {Map<string, number>} */
            on.get(z)
          ), E = (
            /** @type {number} */
            S.get(b)
          );
          --E == 0 ? (z.removeEventListener(b, ii), S.delete(b), S.size === 0 && on.delete(z)) : S.set(b, E);
        }
      ni.delete(k), p !== s && p.parentNode?.removeChild(p);
    };
  });
  return Sc.set(u, m), u;
}
let Sc = /* @__PURE__ */ new WeakMap();
class En {
  /** @type {TemplateNode} */
  anchor;
  /** @type {Map<Batch, Key>} */
  #t = /* @__PURE__ */ new Map();
  /**
   * Map of keys to effects that are currently rendered in the DOM.
   * These effects are visible and actively part of the document tree.
   * Example:
   * ```
   * {#if condition}
   * 	foo
   * {:else}
   * 	bar
   * {/if}
   * ```
   * Can result in the entries `true->Effect` and `false->Effect`
   * @type {Map<Key, Effect>}
   */
  #o = /* @__PURE__ */ new Map();
  /**
   * Similar to #onscreen with respect to the keys, but contains branches that are not yet
   * in the DOM, because their insertion is deferred.
   * @type {Map<Key, Branch>}
   */
  #e = /* @__PURE__ */ new Map();
  /**
   * Keys of effects that are currently outroing
   * @type {Set<Key>}
   */
  #i = /* @__PURE__ */ new Set();
  /**
   * Whether to pause (i.e. outro) on change, or destroy immediately.
   * This is necessary for `<svelte:element>`
   */
  #a = !0;
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(a, s = !0) {
    this.anchor = a, this.#a = s;
  }
  /**
   * @param {Batch} batch
   */
  #s = (a) => {
    if (this.#t.has(a)) {
      var s = (
        /** @type {Key} */
        this.#t.get(a)
      ), r = this.#o.get(s);
      if (r)
        wn(r), this.#i.delete(s);
      else {
        var i = this.#e.get(s);
        i && (wn(i.effect), this.#o.set(s, i.effect), this.#e.delete(s), i.fragment.lastChild.remove(), this.anchor.before(i.fragment), r = i.effect);
      }
      for (const [o, d] of this.#t) {
        if (this.#t.delete(o), o === a)
          break;
        const f = this.#e.get(d);
        f && (ja(f.effect), this.#e.delete(d));
      }
      for (const [o, d] of this.#o) {
        if (o === s || this.#i.has(o)) continue;
        const f = () => {
          if (Array.from(this.#t.values()).includes(o)) {
            var m = document.createDocumentFragment();
            Ti(d, m), m.append(Ss()), this.#e.set(o, { effect: d, fragment: m });
          } else
            ja(d);
          this.#i.delete(o), this.#o.delete(o);
        };
        this.#a || !r ? (this.#i.add(o), sr(d, f, !1)) : f();
      }
    }
  };
  /**
   * @param {Batch} batch
   */
  #n = (a) => {
    this.#t.delete(a);
    const s = Array.from(this.#t.values());
    for (const [r, i] of this.#e)
      s.includes(r) || (ja(i.effect), this.#e.delete(r));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(a, s) {
    var r = (
      /** @type {Batch} */
      Et
    ), i = Ul();
    if (s && !this.#o.has(a) && !this.#e.has(a))
      if (i) {
        var o = document.createDocumentFragment(), d = Ss();
        o.append(d), this.#e.set(a, {
          effect: Ya(() => s(d)),
          fragment: o
        });
      } else
        this.#o.set(
          a,
          Ya(() => s(this.anchor))
        );
    if (this.#t.set(r, a), i) {
      for (const [f, u] of this.#o)
        f === a ? r.unskip_effect(u) : r.skip_effect(u);
      for (const [f, u] of this.#e)
        f === a ? r.unskip_effect(u.effect) : r.skip_effect(u.effect);
      r.oncommit(this.#s), r.ondiscard(this.#n);
    } else
      this.#s(r);
  }
}
function M(t, a, s = !1) {
  var r = new En(t), i = s ? Ts : 0;
  function o(d, f) {
    r.ensure(d, f);
  }
  Pr(() => {
    var d = !1;
    a((f, u = 0) => {
      d = !0, o(u, f);
    }), d || o(-1, null);
  }, i);
}
const Mc = Symbol("NaN");
function is(t, a, s) {
  var r = new En(t), i = !Ir();
  Pr(() => {
    var o = a();
    o !== o && (o = /** @type {any} */
    Mc), i && o !== null && typeof o == "object" && (o = /** @type {V} */
    {}), r.ensure(o, s);
  });
}
function _t(t, a) {
  return a;
}
function Tc(t, a, s) {
  for (var r = [], i = a.length, o, d = a.length, f = 0; f < i; f++) {
    let _ = a[f];
    sr(
      _,
      () => {
        if (o) {
          if (o.pending.delete(_), o.done.add(_), o.pending.size === 0) {
            var k = (
              /** @type {Set<EachOutroGroup>} */
              t.outrogroups
            );
            oi(t, Tn(o.done)), k.delete(o), k.size === 0 && (t.outrogroups = null);
          }
        } else
          d -= 1;
      },
      !1
    );
  }
  if (d === 0) {
    var u = r.length === 0 && s !== null && t.pending.size === 0;
    if (u) {
      var m = (
        /** @type {Element} */
        s
      ), p = (
        /** @type {Element} */
        m.parentNode
      );
      ac(p), p.append(m), t.items.clear();
    }
    oi(t, a, !u);
  } else
    o = {
      pending: new Set(a),
      done: /* @__PURE__ */ new Set()
    }, (t.outrogroups ??= /* @__PURE__ */ new Set()).add(o);
}
function oi(t, a, s = !0) {
  var r;
  if (t.pending.size > 0) {
    r = /* @__PURE__ */ new Set();
    for (const d of t.pending.values())
      for (const f of d)
        r.add(
          /** @type {EachItem} */
          t.items.get(f).e
        );
  }
  for (var i = 0; i < a.length; i++) {
    var o = a[i];
    if (r?.has(o)) {
      o.f |= vs;
      const d = document.createDocumentFragment();
      Ti(o, d);
    } else
      ja(a[i], s);
  }
}
var $i;
function Ve(t, a, s, r, i, o = null) {
  var d = t, f = /* @__PURE__ */ new Map(), u = (a & Ml) !== 0;
  if (u) {
    var m = (
      /** @type {Element} */
      t
    );
    d = m.appendChild(Ss());
  }
  var p = null, _ = /* @__PURE__ */ bi(() => {
    var A = s();
    return (
      /** @type {V[]} */
      en(A) ? A : A == null ? [] : Tn(A)
    );
  }), k = /* @__PURE__ */ new Map(), b = !0;
  function S(A) {
    if ((x.effect.f & Ta) === 0) {
      x.pending.delete(A);
      var j = e(_);
      x.fallback = p, Lc(x, j, d, a, r), p !== null && (j.length === 0 ? (p.f & vs) === 0 ? wn(p) : (p.f ^= vs, Yr(p, null, d)) : sr(p, () => {
        p = null;
      }));
    }
  }
  function E(A) {
    x.pending.delete(A);
  }
  var z = Pr(() => {
    for (var A = (
      /** @type {V[]} */
      e(_)
    ), j = A.length, O = /* @__PURE__ */ new Set(), H = (
      /** @type {Batch} */
      Et
    ), I = Ul(), w = 0; w < j; w += 1) {
      var $ = A[w], B = r($, w), te = b ? null : f.get(B);
      te ? (te.v && zr(te.v, $), te.i && zr(te.i, w), I && H.unskip_effect(te.e)) : (te = zc(
        f,
        b ? d : $i ??= Ss(),
        $,
        B,
        w,
        i,
        a,
        s
      ), b || (te.e.f |= vs), f.set(B, te)), O.add(B);
    }
    if (j === 0 && o && !p && (b ? p = Ya(() => o(d)) : (p = Ya(() => o($i ??= Ss())), p.f |= vs)), j > O.size && Cv(), !b)
      if (k.set(H, O), I) {
        for (const [he, se] of f)
          O.has(he) || H.skip_effect(se.e);
        H.oncommit(S), H.ondiscard(E);
      } else
        S(H);
    e(_);
  }), x = { effect: z, items: f, pending: k, outrogroups: null, fallback: p };
  b = !1;
}
function $r(t) {
  for (; t !== null && (t.f & ls) === 0; )
    t = t.next;
  return t;
}
function Lc(t, a, s, r, i) {
  var o = (r & dv) !== 0, d = a.length, f = t.items, u = $r(t.effect.first), m, p = null, _, k = [], b = [], S, E, z, x;
  if (o)
    for (x = 0; x < d; x += 1)
      S = a[x], E = i(S, x), z = /** @type {EachItem} */
      f.get(E).e, (z.f & vs) === 0 && (z.nodes?.a?.measure(), (_ ??= /* @__PURE__ */ new Set()).add(z));
  for (x = 0; x < d; x += 1) {
    if (S = a[x], E = i(S, x), z = /** @type {EachItem} */
    f.get(E).e, t.outrogroups !== null)
      for (const te of t.outrogroups)
        te.pending.delete(z), te.done.delete(z);
    if ((z.f & Pa) !== 0 && (wn(z), o && (z.nodes?.a?.unfix(), (_ ??= /* @__PURE__ */ new Set()).delete(z))), (z.f & vs) !== 0)
      if (z.f ^= vs, z === u)
        Yr(z, null, s);
      else {
        var A = p ? p.next : u;
        z === t.effect.last && (t.effect.last = z.prev), z.prev && (z.prev.next = z.next), z.next && (z.next.prev = z.prev), Ps(t, p, z), Ps(t, z, A), Yr(z, A, s), p = z, k = [], b = [], u = $r(p.next);
        continue;
      }
    if (z !== u) {
      if (m !== void 0 && m.has(z)) {
        if (k.length < b.length) {
          var j = b[0], O;
          p = j.prev;
          var H = k[0], I = k[k.length - 1];
          for (O = 0; O < k.length; O += 1)
            Yr(k[O], j, s);
          for (O = 0; O < b.length; O += 1)
            m.delete(b[O]);
          Ps(t, H.prev, I.next), Ps(t, p, H), Ps(t, I, j), u = j, p = I, x -= 1, k = [], b = [];
        } else
          m.delete(z), Yr(z, u, s), Ps(t, z.prev, z.next), Ps(t, z, p === null ? t.effect.first : p.next), Ps(t, p, z), p = z;
        continue;
      }
      for (k = [], b = []; u !== null && u !== z; )
        (m ??= /* @__PURE__ */ new Set()).add(u), b.push(u), u = $r(u.next);
      if (u === null)
        continue;
    }
    (z.f & vs) === 0 && k.push(z), p = z, u = $r(z.next);
  }
  if (t.outrogroups !== null) {
    for (const te of t.outrogroups)
      te.pending.size === 0 && (oi(t, Tn(te.done)), t.outrogroups?.delete(te));
    t.outrogroups.size === 0 && (t.outrogroups = null);
  }
  if (u !== null || m !== void 0) {
    var w = [];
    if (m !== void 0)
      for (z of m)
        (z.f & Pa) === 0 && w.push(z);
    for (; u !== null; )
      (u.f & Pa) === 0 && u !== t.fallback && w.push(u), u = $r(u.next);
    var $ = w.length;
    if ($ > 0) {
      var B = (r & Ml) !== 0 && d === 0 ? s : null;
      if (o) {
        for (x = 0; x < $; x += 1)
          w[x].nodes?.a?.measure();
        for (x = 0; x < $; x += 1)
          w[x].nodes?.a?.fix();
      }
      Tc(t, w, B);
    }
  }
  o && ts(() => {
    if (_ !== void 0)
      for (z of _)
        z.nodes?.a?.apply();
  });
}
function zc(t, a, s, r, i, o, d, f) {
  var u = (d & vv) !== 0 ? (d & uv) === 0 ? /* @__PURE__ */ Qv(s, !1, !1) : Rs(s) : null, m = (d & cv) !== 0 ? Rs(i) : null;
  return {
    v: u,
    i: m,
    e: Ya(() => (o(a, u ?? s, m ?? i, f), () => {
      t.delete(r);
    }))
  };
}
function Yr(t, a, s) {
  if (t.nodes)
    for (var r = t.nodes.start, i = t.nodes.end, o = a && (a.f & vs) === 0 ? (
      /** @type {EffectNodes} */
      a.nodes.start
    ) : s; r !== null; ) {
      var d = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ sn(r)
      );
      if (o.before(r), r === i)
        return;
      r = d;
    }
}
function Ps(t, a, s) {
  a === null ? t.effect.first = s : a.next = s, s === null ? t.effect.last = a : s.prev = a;
}
function Wa(t, a, s = !1, r = !1, i = !1, o = !1) {
  var d = t, f = "";
  if (s)
    var u = (
      /** @type {Element} */
      t
    );
  L(() => {
    var m = (
      /** @type {Effect} */
      qt
    );
    if (f !== (f = a() ?? "")) {
      if (s) {
        m.nodes = null, u.innerHTML = /** @type {string} */
        f, f !== "" && ir(
          /** @type {TemplateNode} */
          /* @__PURE__ */ ss(u),
          /** @type {TemplateNode} */
          u.lastChild
        );
        return;
      }
      if (m.nodes !== null && (Zl(
        m.nodes.start,
        /** @type {TemplateNode} */
        m.nodes.end
      ), m.nodes = null), f !== "") {
        var p = r ? xv : i ? Sv : void 0, _ = (
          /** @type {HTMLTemplateElement | SVGElement | MathMLElement} */
          Vl(r ? "svg" : i ? "math" : "template", p)
        );
        _.innerHTML = /** @type {any} */
        f;
        var k = r || i ? _ : (
          /** @type {HTMLTemplateElement} */
          _.content
        );
        if (ir(
          /** @type {TemplateNode} */
          /* @__PURE__ */ ss(k),
          /** @type {TemplateNode} */
          k.lastChild
        ), r || i)
          for (; /* @__PURE__ */ ss(k); )
            d.before(
              /** @type {TemplateNode} */
              /* @__PURE__ */ ss(k)
            );
        else
          d.before(k);
      }
    }
  });
}
function vi(t, a, ...s) {
  var r = new En(t);
  Pr(() => {
    const i = a() ?? null;
    r.ensure(i, i && ((o) => i(o, ...s)));
  }, Ts);
}
function Cc(t, a, s) {
  var r = new En(t);
  Pr(() => {
    var i = a() ?? null;
    r.ensure(i, i && ((o) => s(o, i)));
  }, Ts);
}
const Ec = () => performance.now(), ws = {
  // don't access requestAnimationFrame eagerly outside method
  // this allows basic testing of user code without JSDOM
  // bunder will eval and remove ternary when the user's app is built
  tick: (
    /** @param {any} _ */
    (t) => requestAnimationFrame(t)
  ),
  now: () => Ec(),
  tasks: /* @__PURE__ */ new Set()
};
function ho() {
  const t = ws.now();
  ws.tasks.forEach((a) => {
    a.c(t) || (ws.tasks.delete(a), a.f());
  }), ws.tasks.size !== 0 && ws.tick(ho);
}
function Ac(t) {
  let a;
  return ws.tasks.size === 0 && ws.tick(ho), {
    promise: new Promise((s) => {
      ws.tasks.add(a = { c: t, f: s });
    }),
    abort() {
      ws.tasks.delete(a);
    }
  };
}
function vn(t, a) {
  Fs(() => {
    t.dispatchEvent(new CustomEvent(a));
  });
}
function Ic(t) {
  if (t === "float") return "cssFloat";
  if (t === "offset") return "cssOffset";
  if (t.startsWith("--")) return t;
  const a = t.split("-");
  return a.length === 1 ? a[0] : a[0] + a.slice(1).map(
    /** @param {any} word */
    (s) => s[0].toUpperCase() + s.slice(1)
  ).join("");
}
function Fi(t) {
  const a = {}, s = t.split(";");
  for (const r of s) {
    const [i, o] = r.split(":");
    if (!i || o === void 0) break;
    const d = Ic(i.trim());
    a[d] = o.trim();
  }
  return a;
}
const Pc = (t) => t;
function po(t, a, s) {
  var r = (
    /** @type {Effect} */
    qt
  ), i = (
    /** @type {EffectNodes} */
    r.nodes
  ), o, d, f, u = null;
  i.a ??= {
    element: t,
    measure() {
      o = this.element.getBoundingClientRect();
    },
    apply() {
      if (f?.abort(), d = this.element.getBoundingClientRect(), o.left !== d.left || o.right !== d.right || o.top !== d.top || o.bottom !== d.bottom) {
        const m = a()(this.element, { from: o, to: d }, s?.());
        f = kn(
          this.element,
          m,
          void 0,
          1,
          () => {
          },
          () => {
            f?.abort(), f = void 0;
          }
        );
      }
    },
    fix() {
      if (!t.getAnimations().length) {
        var { position: m, width: p, height: _ } = getComputedStyle(t);
        if (m !== "absolute" && m !== "fixed") {
          var k = (
            /** @type {HTMLElement | SVGElement} */
            t.style
          );
          u = {
            position: k.position,
            width: k.width,
            height: k.height,
            transform: k.transform
          }, k.position = "absolute", k.width = p, k.height = _;
          var b = t.getBoundingClientRect();
          if (o.left !== b.left || o.top !== b.top) {
            var S = `translate(${o.left - b.left}px, ${o.top - b.top}px)`;
            k.transform = k.transform ? `${k.transform} ${S}` : S;
          }
        }
      }
    },
    unfix() {
      if (u) {
        var m = (
          /** @type {HTMLElement | SVGElement} */
          t.style
        );
        m.position = u.position, m.width = u.width, m.height = u.height, m.transform = u.transform;
      }
    }
  }, i.a.element = t;
}
function bt(t, a, s, r) {
  var i = (t & _v) !== 0, o = (t & bv) !== 0, d = i && o, f = (t & yv) !== 0, u = d ? "both" : i ? "in" : "out", m, p = a.inert, _ = a.style.overflow, k, b;
  function S() {
    return Fs(() => m ??= s()(a, r?.() ?? /** @type {P} */
    {}, {
      direction: u
    }));
  }
  var E = {
    is_global: f,
    in() {
      if (a.inert = p, !i) {
        b?.abort(), b?.reset?.();
        return;
      }
      o || k?.abort(), k = kn(
        a,
        S(),
        b,
        1,
        () => {
          vn(a, "introstart");
        },
        () => {
          vn(a, "introend"), k?.abort(), k = m = void 0, a.style.overflow = _;
        }
      );
    },
    out(j) {
      if (!o) {
        j?.(), m = void 0;
        return;
      }
      a.inert = !0, b = kn(
        a,
        S(),
        k,
        0,
        () => {
          vn(a, "outrostart");
        },
        () => {
          vn(a, "outroend"), j?.();
        }
      );
    },
    stop: () => {
      k?.abort(), b?.abort();
    }
  }, z = (
    /** @type {Effect & { nodes: EffectNodes }} */
    qt
  );
  if ((z.nodes.t ??= []).push(E), i && li) {
    var x = f;
    if (!x) {
      for (var A = (
        /** @type {Effect | null} */
        z.parent
      ); A && (A.f & Ts) !== 0; )
        for (; (A = A.parent) && (A.f & Ua) === 0; )
          ;
      x = !A || (A.f & vr) !== 0;
    }
    x && zn(() => {
      ps(() => E.in());
    });
  }
}
function kn(t, a, s, r, i, o) {
  var d = r === 1, f = !1;
  if (sv(a)) {
    var u;
    return ts(() => {
      if (!f) {
        var E = a({ direction: d ? "in" : "out" });
        u = kn(t, E, s, r, i, o);
      }
    }), {
      abort: () => {
        f = !0, u?.abort();
      },
      deactivate: () => u?.deactivate(),
      reset: () => u?.reset(),
      t: () => u?.t() ?? 1 - r
    };
  }
  if (s?.deactivate(), !a?.duration && !a?.delay)
    return i(), o(), {
      abort: es,
      deactivate: es,
      reset: es,
      t: () => r
    };
  const { delay: m = 0, css: p, tick: _, easing: k = Pc } = a;
  var b, S = () => 1 - r;
  return ts(() => {
    if (!f) {
      var E = [];
      if (d && s === void 0 && (_ && _(0, 1), p)) {
        var z = Fi(p(0, 1));
        E.push(z, z);
      }
      b = t.animate(E, { duration: m, fill: "forwards" }), b.onfinish = () => {
        b.cancel(), i();
        var x = s?.t() ?? 1 - r;
        s?.abort();
        var A = r - x, j = (
          /** @type {number} */
          a.duration * Math.abs(A)
        ), O = [];
        if (j > 0) {
          var H = !1;
          if (p)
            for (var I = Math.ceil(j / 16.666666666666668), w = 0; w <= I; w += 1) {
              var $ = x + A * k(w / I), B = Fi(p($, 1 - $));
              O.push(B), H ||= B.overflow === "hidden";
            }
          H && (t.style.overflow = "hidden"), S = () => {
            var te = (
              /** @type {number} */
              /** @type {globalThis.Animation} */
              b.currentTime
            );
            return x + A * k(te / j);
          }, _ && Ac(() => {
            if (b.playState !== "running") return !1;
            var te = S();
            return _(te, 1 - te), !0;
          });
        }
        b = t.animate(O, { duration: j, fill: "forwards" }), b.onfinish = () => {
          S = () => r, _?.(r, 1 - r), o();
        };
      };
    }
  }), {
    abort: () => {
      f = !0, b && (b.cancel(), b.effect = null, b.onfinish = es);
    },
    deactivate: () => {
      o = es;
    },
    reset: () => {
      r === 0 && _?.(1, 0);
    },
    t: () => S()
  };
}
function zt(t, a, s) {
  zn(() => {
    var r = ps(() => a(t, s?.()) || {});
    if (s && r?.update) {
      var i = !1, o = (
        /** @type {any} */
        {}
      );
      Cn(() => {
        var d = s();
        co(d), i && Cl(o, d) && (o = d, r.update(d));
      }), i = !0;
    }
    if (r?.destroy)
      return () => (
        /** @type {Function} */
        r.destroy()
      );
  });
}
function mo(t) {
  var a, s, r = "";
  if (typeof t == "string" || typeof t == "number") r += t;
  else if (typeof t == "object") if (Array.isArray(t)) {
    var i = t.length;
    for (a = 0; a < i; a++) t[a] && (s = mo(t[a])) && (r && (r += " "), r += s);
  } else for (s in t) t[s] && (r && (r += " "), r += s);
  return r;
}
function Dc() {
  for (var t, a, s = 0, r = "", i = arguments.length; s < i; s++) (t = arguments[s]) && (a = mo(t)) && (r && (r += " "), r += a);
  return r;
}
function Nc(t) {
  return typeof t == "object" ? Dc(t) : t ?? "";
}
const Bi = [...` 	
\r\f \v\uFEFF`];
function Oc(t, a, s) {
  var r = t == null ? "" : "" + t;
  if (a && (r = r ? r + " " + a : a), s) {
    for (var i of Object.keys(s))
      if (s[i])
        r = r ? r + " " + i : i;
      else if (r.length)
        for (var o = i.length, d = 0; (d = r.indexOf(i, d)) >= 0; ) {
          var f = d + o;
          (d === 0 || Bi.includes(r[d - 1])) && (f === r.length || Bi.includes(r[f])) ? r = (d === 0 ? "" : r.substring(0, d)) + r.substring(f + 1) : d = f;
        }
  }
  return r === "" ? null : r;
}
function qc(t, a) {
  return t == null ? null : String(t);
}
function je(t, a, s, r, i, o) {
  var d = (
    /** @type {any} */
    t[Zn]
  );
  if (d !== s || d === void 0) {
    var f = Oc(s, r, o);
    f == null ? t.removeAttribute("class") : t.className = f, t[Zn] = s;
  } else if (o && i !== o)
    for (var u in o) {
      var m = !!o[u];
      (i == null || m !== !!i[u]) && t.classList.toggle(u, m);
    }
  return o;
}
function dt(t, a, s, r) {
  var i = (
    /** @type {any} */
    t[Qn]
  );
  if (i !== a) {
    var o = qc(a);
    o == null ? t.removeAttribute("style") : t.style.cssText = o, t[Qn] = a;
  }
  return r;
}
function jc(t, a) {
  a ? t.hasAttribute("selected") || t.setAttribute("selected", "") : t.removeAttribute("selected");
}
function Hc(t, a) {
  var s = t.__defaultValue, r = t.multiple, i = r ? s ?? [] : null;
  if (!(r && !en(i))) {
    t.selectedIndex;
    for (var o of t.options) {
      var d = kr(o);
      jc(
        o,
        r ? (
          /** @type {any[]} */
          i.includes(d)
        ) : Bl(d, s)
      );
    }
  }
}
function go(t, a, s = !1) {
  if (t.multiple) {
    if (a == null)
      return;
    if (!en(a))
      return Tv();
    for (var r of t.options)
      r.selected = a.includes(kr(r));
    return;
  }
  for (r of t.options) {
    var i = kr(r);
    if (Bl(i, a)) {
      r.selected = !0;
      return;
    }
  }
  (!s || a !== void 0) && (t.selectedIndex = -1);
}
function Gi(t) {
  var a = new MutationObserver((s) => {
    s.every(Rc) || ("__defaultValue" in t && Hc(t), "__value" in t && go(t, t.__value));
  });
  a.observe(t, {
    // Listen to option element changes
    childList: !0,
    subtree: !0,
    // because of <optgroup>
    // Listen to option element value attribute changes
    // (doesn't get notified of select value changes,
    // because that property is not reflected as an attribute)
    attributes: !0,
    attributeFilter: ["value"]
  }), Si(() => {
    a.disconnect();
  });
}
function Wi(t, a, s = a) {
  var r = /* @__PURE__ */ new WeakSet(), i = !0;
  Dl(t, "change", (o) => {
    var d = o ? "[selected]" : ":checked", f;
    if (t.multiple)
      f = [].map.call(t.querySelectorAll(d), kr);
    else {
      var u = t.querySelector(d) ?? // will fall back to first non-disabled option if no option is selected
      t.querySelector("option:not([disabled])");
      f = u && kr(u);
    }
    s(f), t.__value = f, Et !== null && r.add(Et);
  }), zn(() => {
    var o = a();
    if (t === document.activeElement) {
      var d = (
        /** @type {Batch} */
        Et
      );
      if (r.has(d))
        return;
    }
    if (go(t, o, i), i && o === void 0) {
      var f = t.querySelector(":checked");
      f !== null && (o = kr(f), s(o));
    }
    t.__value = o, i = !1;
  });
}
function kr(t) {
  return "__value" in t ? t.__value : t.value;
}
function Rc(t) {
  if (
    /** @type {Element} */
    t.target.closest("selectedcontent") !== null
  )
    return !0;
  if (t.type === "childList") {
    var a = [...t.addedNodes, ...t.removedNodes];
    return a.length > 0 && a.every((s) => s.nodeName === "SELECTEDCONTENT");
  }
  return !1;
}
const $c = Symbol("is custom element"), Fc = Symbol("is html"), Bc = ov ? "progress" : "PROGRESS";
function ys(t, a) {
  var s = _o(t);
  s.value === (s.value = // treat null and undefined the same for the initial value
  a ?? void 0) || // @ts-expect-error
  // `progress` elements always need their value set when it's `0`
  t.value === a && (a !== 0 || t.nodeName !== Bc) || (t.value = a ?? "");
}
function Be(t, a, s, r) {
  var i = _o(t), o = i[a];
  o !== (i[a] = s) && (a === "loading" && (t[lv] = s), s == null ? t.removeAttribute(a) : typeof s != "string" && Gc(t).has(a) ? t[a] = s : t.setAttribute(a, s));
}
function _o(t) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    /** @type {any} */
    t[Sl] ??= {
      [$c]: t.nodeName.includes("-"),
      [Fc]: t.namespaceURI === Ll
    }
  );
}
var Yi = /* @__PURE__ */ new Map();
function Gc(t) {
  var a = t.getAttribute("is") || t.nodeName, s = Yi.get(a);
  if (s) return s;
  Yi.set(a, s = /* @__PURE__ */ new Set());
  for (var r, i = t, o = Element.prototype; o !== i; ) {
    r = _l(i);
    for (var d in r)
      r[d].set && // better safe than sorry, we don't want spread attributes to mess with HTML content
      d !== "innerHTML" && d !== "textContent" && d !== "innerText" && s.add(d);
    i = Ln(i);
  }
  return s;
}
function ia(t, a, s = a) {
  var r = /* @__PURE__ */ new WeakSet();
  Dl(t, "input", async (i) => {
    var o = i ? t.defaultValue : t.value;
    if (o = $n(t) ? Fn(o) : o, s(o), Et !== null && r.add(Et), await lo(), o !== (o = a())) {
      var d = t.selectionStart, f = t.selectionEnd, u = t.value.length;
      if (t.value = o ?? "", f !== null) {
        var m = t.value.length;
        d === f && f === u && m > u ? (t.selectionStart = m, t.selectionEnd = m) : (t.selectionStart = d, t.selectionEnd = Math.min(f, m));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  ps(a) == null && t.value && (s($n(t) ? Fn(t.value) : t.value), Et !== null && r.add(Et)), Cn(() => {
    var i = a();
    if (t === document.activeElement) {
      var o = (
        /** @type {Batch} */
        Et
      );
      if (r.has(o))
        return;
    }
    $n(t) && i === Fn(t.value) || t.type === "date" && !i && !t.value || i !== t.value && (t.value = i ?? "");
  });
}
function $n(t) {
  var a = t.type;
  return a === "number" || a === "range";
}
function Fn(t) {
  return t === "" ? null : +t;
}
function Bn(t, a) {
  return t === a || t?.[xs] === a;
}
function _a(t = gi(), a, s, r) {
  var i = (
    /** @type {ComponentContext} */
    la.r
  ), o = (
    /** @type {Effect} */
    qt
  );
  return zn(() => {
    var d, f;
    return Cn(() => {
      d = f, f = r?.() || [], ps(() => {
        Bn(s(...f), t) || (a(t, ...f), d && Bn(s(...d), t) && a(null, ...d));
      });
    }), () => {
      let u = o;
      for (; u !== i && u.parent !== null && u.parent.f & Jr; )
        u = u.parent;
      const m = () => {
        f && Bn(s(...f), t) && a(null, ...f);
      }, p = u.teardown;
      u.teardown = () => {
        m(), p?.();
      };
    };
  }), t;
}
function An(t = !1) {
  const a = (
    /** @type {ComponentContextLegacy} */
    la
  ), s = a.l.u;
  if (!s) return;
  let r = () => co(a.s);
  if (t) {
    let i = 0, o = (
      /** @type {Record<string, any>} */
      {}
    );
    const d = /* @__PURE__ */ Lr(() => {
      let f = !1;
      const u = a.s;
      for (const m in u)
        u[m] !== o[m] && (o[m] = u[m], f = !0);
      return f && i++, i;
    });
    r = () => e(d);
  }
  s.b.length && nc(() => {
    Ui(a, r), Xn(s.b);
  }), $t(() => {
    const i = ps(() => s.m.map(rv));
    return () => {
      for (const o of i)
        typeof o == "function" && o();
    };
  }), s.a.length && $t(() => {
    Ui(a, r), Xn(s.a);
  });
}
function Ui(t, a) {
  if (t.l.s)
    for (const s of t.l.s) e(s);
  a();
}
function bo(t) {
  var a = Rs(0);
  return function() {
    return arguments.length === 1 ? (g(a, e(a) + 1), arguments[0]) : (e(a), t());
  };
}
let cn = !1;
function Wc(t) {
  var a = cn;
  try {
    return cn = !1, [t(), cn];
  } finally {
    cn = a;
  }
}
function Dt(t, a, s, r) {
  var i = !Ar || (s & hv) !== 0, o = (s & mv) !== 0, d = (s & gv) !== 0, f = (
    /** @type {V} */
    r
  ), u = !0, m = (
    /** @type {Derived<V> | undefined} */
    void 0
  ), p = () => d && i ? (m ??= /* @__PURE__ */ Lr(
    /** @type {() => V} */
    r
  ), e(m)) : (u && (u = !1, f = d ? ps(
    /** @type {() => V} */
    r
  ) : (
    /** @type {V} */
    r
  )), f);
  let _;
  if (o) {
    var k = xs in t || iv in t;
    _ = br(t, a)?.set ?? (k && a in t ? (O) => t[a] = O : void 0);
  }
  var b, S = !1;
  o ? [b, S] = Wc(() => (
    /** @type {V} */
    t[a]
  )) : b = /** @type {V} */
  t[a], b === void 0 && r !== void 0 && (b = p(), _ && (i && Dv(), _(b)));
  var E;
  if (i ? E = () => {
    var O = (
      /** @type {V} */
      t[a]
    );
    return O === void 0 ? p() : (u = !0, O);
  } : E = () => {
    var O = (
      /** @type {V} */
      t[a]
    );
    return O !== void 0 && (f = /** @type {V} */
    void 0), O === void 0 ? f : O;
  }, i && (s & pv) === 0)
    return E;
  if (_) {
    var z = t.$$legacy;
    return (
      /** @type {() => V} */
      (function(O, H) {
        return arguments.length > 0 ? ((!i || !H || z || S) && _(H ? E() : O), O) : E();
      })
    );
  }
  var x = !1, A = ((s & fv) !== 0 ? Lr : bi)(() => (x = !1, E()));
  o && e(A);
  var j = (
    /** @type {Effect} */
    qt
  );
  return (
    /** @type {() => V} */
    (function(O, H) {
      if (arguments.length > 0) {
        const I = H ? e(A) : i && o ? Ct(O) : O;
        return g(A, I), x = !0, f !== void 0 && (f = I), O;
      }
      return zs && x || (j.f & Ta) !== 0 ? A.v : e(A);
    })
  );
}
function oa(t) {
  la === null && Al(), Ar && la.l !== null ? Yc(la).m.push(t) : $t(() => {
    const a = ps(t);
    if (typeof a == "function") return (
      /** @type {() => void} */
      a
    );
  });
}
function nn(t) {
  la === null && Al(), oa(() => () => ps(t));
}
function Yc(t) {
  var a = (
    /** @type {ComponentContextLegacy} */
    t.l
  );
  return a.u ??= { a: [], b: [], m: [] };
}
const Uc = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(Uc);
const Vc = (t) => t;
function Li(t) {
  const a = t - 1;
  return a * a * a + 1;
}
function Vi(t) {
  const a = typeof t == "string" && t.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);
  return a ? [parseFloat(a[1]), a[2] || "px"] : [
    /** @type {number} */
    t,
    "px"
  ];
}
function Us(t, a, s) {
  return Number.isNaN(a) ? "" : `${t}: ${s * a}px;`;
}
function ha(t, { delay: a = 0, duration: s = 400, easing: r = Vc } = {}) {
  const i = +getComputedStyle(t).opacity;
  return {
    delay: a,
    duration: s,
    easing: r,
    css: (o) => `opacity: ${o * i}`
  };
}
function La(t, { delay: a = 0, duration: s = 400, easing: r = Li, x: i = 0, y: o = 0, opacity: d = 0 } = {}) {
  const f = getComputedStyle(t), u = +f.opacity, m = f.transform === "none" ? "" : f.transform, p = u * (1 - d), [_, k] = Vi(i), [b, S] = Vi(o);
  return {
    delay: a,
    duration: s,
    easing: r,
    css: (E, z) => `
			transform: ${m} translate(${(1 - E) * _}${k}, ${(1 - E) * b}${S});
			opacity: ${u - p * z}`
  };
}
function ci(t, { delay: a = 0, duration: s = 400, easing: r = Li, axis: i = "y" } = {}) {
  const o = getComputedStyle(t), d = +o.opacity, f = i === "y" ? "height" : "width", u = parseFloat(o[f]), m = i === "y" ? ["top", "bottom"] : ["left", "right"], p = m.map(
    (x) => (
      /** @type {'Left' | 'Right' | 'Top' | 'Bottom'} */
      `${x[0].toUpperCase()}${x.slice(1)}`
    )
  ), _ = parseFloat(o[`padding${p[0]}`]), k = parseFloat(o[`padding${p[1]}`]), b = parseFloat(o[`margin${p[0]}`]), S = parseFloat(o[`margin${p[1]}`]), E = parseFloat(
    o[`border${p[0]}Width`]
  ), z = parseFloat(
    o[`border${p[1]}Width`]
  );
  return {
    delay: a,
    duration: s,
    easing: r,
    css: (x) => `overflow: hidden;opacity: ${Math.min(x * 20, 1) * d};` + Us(f, u, x) + Us(`padding-${m[0]}`, _, x) + Us(`padding-${m[1]}`, k, x) + Us(`margin-${m[0]}`, b, x) + Us(`margin-${m[1]}`, S, x) + Us(`border-${m[0]}-width`, E, x) + Us(`border-${m[1]}-width`, z, x) + `min-${f}: 0`
  };
}
function Bs(t, { delay: a = 0, duration: s = 400, easing: r = Li, start: i = 0, opacity: o = 0 } = {}) {
  const d = getComputedStyle(t), f = +d.opacity, u = d.transform === "none" ? "" : d.transform, m = 1 - i, p = f * (1 - o);
  return {
    delay: a,
    duration: s,
    easing: r,
    css: (_, k) => `
			transform: ${u} scale(${1 - m * k});
			opacity: ${f - p * k}
		`
  };
}
function Kc(t) {
  return --t * t * ((1.70158 + 1) * t + 1.70158) + 1;
}
function Xc(t) {
  return t * t * t;
}
function Jc(t) {
  const a = t - 1;
  return a * a * a + 1;
}
function ca(t) {
  return t === 1 ? t : 1 - Math.pow(2, -10 * t);
}
const Zc = [
  "https://cdn.cloudflare.steamstatic.com/steam/apps/",
  "https://cdn.akamai.steamstatic.com/steam/apps/",
  "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/",
  "https://steamcdn-a.akamaihd.net/steam/apps/"
], _s = (t, a) => t.nonSteam ? [t.cover] : Zc.map((s) => s + t.id + "/" + a), yo = {
  capsule: (t) => _s(t, "library_600x900.jpg")[0],
  header: (t) => _s(t, "header.jpg")[0],
  hero: (t) => _s(t, "library_hero.jpg")[0],
  // every address worth trying for a kind of picture, best first (the store's own capsule pictures come last: they exist for games with no library art)
  list(t, a) {
    if (t.nonSteam) return t.cover ? [t.cover] : [];
    const s = _s(t, "library_600x900.jpg"), r = _s(t, "header.jpg"), i = _s(t, "library_hero.jpg"), o = _s(t, "capsule_616x353.jpg").concat(_s(t, "capsule_467x181.jpg").slice(0, 2), _s(t, "library_header.jpg").slice(0, 2));
    return a === "hero" ? [...i, ...r, ...o] : a === "header" ? [...r, ...o] : [...s, ...r, ...o];
  }
};
function Ia(t) {
  if (!t) return "0 min";
  const a = Math.round(t / 60);
  if (a < 60) return a + " min";
  const s = t / 3600;
  return (s < 10 ? s.toFixed(1) : Math.round(s)) + " h";
}
const ua = (t) => (t.steamMinutes || 0) * 60 + (t.seconds || 0);
function lr(t) {
  if (!t) return "Never";
  const a = Math.floor((Date.now() - t) / 864e5);
  if (a <= 0) return "Today";
  if (a === 1) return "Yesterday";
  if (a < 30) return a + " days ago";
  if (a < 365) {
    const r = Math.floor(a / 30);
    return r + (r === 1 ? " month ago" : " months ago");
  }
  const s = Math.floor(a / 365);
  return s + (s === 1 ? " year ago" : " years ago");
}
function xn(t) {
  if (!t) return "";
  const a = ["B", "KB", "MB", "GB", "TB"];
  let s = 0;
  for (; t >= 1024 && s < 4; )
    t /= 1024, s++;
  return (t >= 10 || s === 0 ? Math.round(t) : t.toFixed(1)) + " " + a[s];
}
function Sn(t) {
  return new Date(t * 1e3).toLocaleDateString(void 0, { month: "short", day: "numeric", year: "numeric" });
}
const Qc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"), Gn = (t) => Qc(t).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, "$1<i>$2</i>").replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g, '<a href="#" data-u="$2">$1</a>');
function ed(t) {
  const a = [];
  for (const s of String(t || "").replace(/\r/g, "").split(`
`)) {
    const r = s.trim().replace(/^>\s?/, "").trim();
    if (!r || /^-{3,}$/.test(r) || r[0] === "<") continue;
    const i = /^!\[([^\]]*)\]\((https:\/\/[^)\s]+)\)$/.exec(r), o = /^#{1,4}\s+(.*)/.exec(r), d = /^[-*]\s+(.*)/.exec(r);
    i ? a.push({ t: "img", alt: i[1], src: i[2] }) : o ? a.push({ t: "h", html: Gn(o[1]) }) : d ? a.push({ t: "li", html: Gn(d[1]) }) : a.push({ t: "p", html: Gn(r) });
  }
  return a;
}
const zi = { xmas: { from: new Date(2026, 11, 1, 0, 0, 0), to: new Date(2027, 0, 1, 23, 59, 59), hiddenBefore: !0, startText: "Starts Dec 1", endText: "Ended Jan 1", endedDescription: "The Christmas theme comes back next December." }, gta6: { from: new Date(2026, 10, 15, 0, 0, 0), to: new Date(2026, 10, 27, 23, 59, 59), everyLaunch: !0, startText: "Starts Nov 15", endText: "Ended Nov 27", endedDescription: "The 'GTA 6' theme will return when the game releases for the PC platform, or when it's available on Steam." } }, Ci = () => typeof window < "u" && window.__slNow ? new Date(window.__slNow) : /* @__PURE__ */ new Date();
function di(t) {
  const a = zi[t];
  if (!a) return { open: !0, note: "" };
  const s = Ci();
  return s < a.from ? { open: !1, note: a.startText } : s > a.to ? { open: !1, note: a.endText, text: a.endedDescription } : { open: !0, note: "" };
}
const Os = (t) => di(t).open, td = (t) => {
  const a = zi[t];
  return !(a && a.hiddenBefore && Ci() < a.from);
}, ad = { gta6: "GTA 6", xmas: "Christmas" };
function sd(t = 5) {
  const a = Ci();
  let s = null;
  for (const [r, i] of Object.entries(zi)) {
    if (a < i.from || a > i.to) continue;
    const o = (i.to - a) / 864e5;
    o > t && !i.everyLaunch || (!s || o < s.left) && (s = { id: r, left: o, everyLaunch: !!i.everyLaunch, name: ad[r] || r, daysLeft: Math.max(0, Math.ceil(o)), endText: i.to.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) });
  }
  return s;
}
let Ds = null, wo = !1, ko = 0.5, xo = () => !1;
function rd(t, a) {
  wo = !!(t && t.navSounds), ko = { low: 0.3, medium: 0.6, high: 1 }[t && t.soundVolume || "medium"] || 0.6, a && (xo = a);
}
function Vs(t, a, s, r = "sine", i = 1, o = 0) {
  if (!(!wo || xo()))
    try {
      Ds = Ds || new (window.AudioContext || window.webkitAudioContext)(), Ds.state === "suspended" && Ds.resume();
      const d = Ds.currentTime + o, f = Ds.createOscillator(), u = Ds.createGain();
      f.type = r, f.frequency.setValueAtTime(t, d), a !== t && f.frequency.exponentialRampToValueAtTime(a, d + s), u.gain.setValueAtTime(1e-4, d), u.gain.exponentialRampToValueAtTime(0.16 * ko * i, d + 8e-3), u.gain.exponentialRampToValueAtTime(1e-4, d + s), f.connect(u), u.connect(Ds.destination), f.start(d), f.stop(d + s + 0.03);
    } catch {
    }
}
const Cs = {
  nav() {
    Vs(460, 700, 0.12);
  },
  // changing page
  click() {
    Vs(880, 660, 0.05, "triangle", 0.8);
  },
  // pressing a button
  ok() {
    Vs(660, 660, 0.1), Vs(990, 990, 0.18, "sine", 0.9, 0.09);
  },
  // saved, done
  bad() {
    Vs(240, 170, 0.22, "triangle");
  },
  // something went wrong
  play() {
    Vs(380, 820, 0.2);
  },
  // a game is starting
  stop() {
    Vs(620, 300, 0.2);
  }
  // a game is stopped
}, c = Ct({
  ready: !1,
  version: "",
  signedIn: !1,
  migrate: !1,
  addAccount: !1,
  steamId: "",
  settings: {},
  view: "home",
  gameId: null,
  back: null,
  games: [],
  favorites: [],
  hidden: [],
  collections: {},
  offline: !1,
  libLoading: !1,
  libError: "",
  whatsNew: null,
  focusSearch: !1,
  running: null,
  update: null,
  updateHidden: !1,
  updateState: "",
  updatePct: 0,
  toasts: [],
  confirmClose: !1,
  progress: {},
  sel: [],
  visible: [],
  mod: null,
  applying: null,
  themeNotice: null,
  discordLink: null,
  live: { theme: "", snow: !0 },
  friendsOpen: !1,
  editOpen: !1,
  look: null,
  me: null,
  player: null,
  onboard: !1,
  ui: {}
}), Sa = (...t) => window.sl.call(...t), ve = Sa;
let nd = 0;
function yt(t, a = "", s = null) {
  a === "bad" ? Cs.bad() : Cs.ok();
  const r = ++nd;
  c.toasts.push({ id: r, text: t, kind: a, action: s }), setTimeout(
    () => {
      c.toasts = c.toasts.filter((i) => i.id !== r);
    },
    s ? 7e3 : 4200
  );
}
const id = (t) => {
  c.toasts = c.toasts.filter((a) => a.id !== t);
};
function or(t) {
  c.ui = { ...c.ui, ...t }, window.sl.call("ui:set", t).catch(() => {
  });
}
function Da(t, a = null) {
  Cs.nav(), c.back = c.view === "game" ? c.back : { view: c.view }, c.view = t, c.gameId = a;
}
async function nr() {
  try {
    c.look = await Sa("online:look"), c.me = await Sa("online:me");
  } catch {
  }
  return c.look;
}
async function Ks(t) {
  c.look = await Sa("online:setLook", t);
}
function ld(t) {
  Cs.nav(), c.friendsOpen = !1, c.back = {
    view: c.view === "player" ? c.back && c.back.view || "home" : c.view
  }, c.player = t, c.view = "player", c.gameId = null;
}
function $s(t) {
  Cs.nav(), c.back = {
    view: c.view === "game" ? c.back && c.back.view || "library" : c.view
  }, c.view = "game", c.gameId = String(t);
}
function hn() {
  Cs.nav();
  const t = c.back && c.back.view || "library";
  c.view = t, c.gameId = null;
}
const Ki = (t) => {
  c.games = t.games, c.favorites = t.favorites.map(String), c.hidden = t.hidden.map(String), c.collections = t.collections || {}, c.offline = t.offline;
};
async function Fa() {
  if (c.libError = "", c.libLoading = !c.games.length, !c.games.length)
    try {
      const t = await Sa("library:cached");
      !t.none && t.games.length && (Ki(t), c.libLoading = !1);
    } catch {
    }
  try {
    Ki(await Sa("library:get"));
  } catch {
    c.libError = "SteamLite could not load your library from Steam. Check your internet connection, then try again.";
  }
  c.libLoading = !1;
}
let Wn = 0;
function od() {
  clearTimeout(Wn);
  const t = async () => {
    let a = Object.keys(c.progress).length > 0;
    if (!document.hidden && c.signedIn && !c.migrate)
      try {
        const s = await Sa("library:progress"), r = Object.keys(c.progress);
        c.progress = s, a = Object.keys(s).length > 0, r.some((i) => !s[i]) && Fa();
      } catch {
      }
    Wn = setTimeout(t, c.running && c.settings.gameLite !== !1 ? 45e3 : a ? 4e3 : 2e4);
  };
  Wn = setTimeout(t, 1500);
}
const xr = (t) => c.games.find((a) => a.id === String(t));
async function So(t) {
  c.favorites = (await Sa("library:favorite", t)).map(String);
}
async function Mo(t, a = !1) {
  const s = c.hidden.includes(String(t));
  c.hidden = (await Sa("library:hide", t)).map(String), a || yt(s ? "Game unhidden." : "Game hidden.", "", { label: "Undo", fn: () => Mo(t, !0) });
}
async function Xi(t, a) {
  const s = t === "hide" ? "hidden" : "favorites", r = new Set(c[s]), i = a.filter((o) => !r.has(String(o)));
  for (const o of i) {
    const d = (await Sa(t === "hide" ? "library:hide" : "library:favorite", o)).map(String);
    c[s] = d;
  }
  c.sel = [], yt((t === "hide" ? "Hid " : "Added to favorites: ") + i.length + (i.length === 1 ? " game." : " games."), "", {
    label: "Undo",
    fn: async () => {
      for (const o of i) c[s] = (await Sa(t === "hide" ? "library:hide" : "library:favorite", o)).map(String);
    }
  });
}
function vd(t, a) {
  t = String(t);
  const s = c.sel.indexOf(t);
  if (a && a.shiftKey && c.sel.length && c.visible.length) {
    const r = c.sel[c.sel.length - 1], i = c.visible.indexOf(r), o = c.visible.indexOf(t);
    if (i >= 0 && o >= 0) {
      const [d, f] = i < o ? [i, o] : [o, i];
      c.sel = [.../* @__PURE__ */ new Set([...c.sel, ...c.visible.slice(d, f + 1)])];
      return;
    }
  }
  c.sel = s >= 0 ? c.sel.filter((r) => r !== t) : [...c.sel, t];
}
async function _r() {
  await Sa("library:collections", $v(c.collections));
}
async function To(t) {
  const a = await Sa("game:launch", { id: t.id, name: t.name });
  a.ok ? (Cs.play(), c.running = {
    id: t.id,
    name: t.name,
    starting: !0,
    since: 0,
    steam: !!a.steamStarting
  }, a.steamStarting && yt("Steam is not running, so SteamLite is starting it first. The game opens when Steam is ready.")) : yt(a.error || "Could not start the game.", "bad");
}
async function cd(t) {
  Cs.stop(), await Sa("game:stop", t.id);
}
function Dr() {
  const t = document.documentElement.dataset, a = c.settings || {};
  rd(a, () => !!(c.running && c.settings.gameLite !== !1)), t.lite = a.lightGfx ? "1" : "", t.motion = a.reduceMotion ? "reduced" : "", t.bg = a.animBg === !1 ? "still" : "", t.accent = a.artColour === !1 ? "fixed" : "";
  {
    const s = c.mod ? c.mod.base : a.theme;
    t.theme = ["purple", "gta6", "xmas", "discord"].includes(s) && Os(s) ? s : "";
  }
  c.live = { theme: t.theme, snow: a.snow !== !1 }, a.artColour === !1 && document.documentElement.style.removeProperty("--glow");
}
async function dd() {
  const t = await Sa("app:boot");
  if (c.version = t.version, c.whatsNew = t.justUpdated || null, c.signedIn = t.signedIn, c.migrate = !!t.needsSteamLogin, c.steamId = t.steamId, c.settings = t.settings, c.running = t.running, c.ui = t.ui || {}, c.ready = !0, Dr(), t.signedIn && !t.needsSteamLogin) {
    const a = t.settings.startPage, s = c.ui.page;
    a === "library" ? c.view = "library" : a === "last" && ["library", "news", "stats", "settings"].includes(s) && (c.view = s);
  }
  Promise.resolve().then(() => vu).then((a) => {
    a.applyModule(t.module), a.installSafeKey();
  }), window.sl.on("game:state", (a) => {
    if (a.status === "running") c.running = {
      id: a.id,
      name: (xr(a.id) || {}).name || "",
      since: a.since,
      starting: !1
    };
    else if (a.status === "starting") c.running = {
      ...c.running || {},
      id: a.id,
      name: (xr(a.id) || {}).name || "",
      since: 0,
      starting: !0,
      steam: !!a.steam
    };
    else if (a.status === "stopped") {
      c.running = null;
      const s = xr(a.id);
      s && a.telemetry && (s.seconds = a.telemetry.playtime, s.launches = a.telemetry.launches, s.lastPlayed = a.telemetry.lastPlayed);
    }
  }), window.sl.on("game:sync", (a) => {
    const s = c.running;
    c.running = a ? {
      id: a.id,
      name: a.name,
      since: a.since,
      starting: !!a.starting
    } : null, s && !a && Fa();
  }), window.sl.on("library:types", () => {
    c.settings.smartLibrary && Fa();
  }), window.sl.on("app:showUpdate", () => {
    c.updateHidden = !1;
  }), window.sl.on("update:available", (a) => {
    c.update = a, c.updateHidden = !1;
  }), window.sl.on("update:progress", (a) => {
    c.updatePct = a.percent;
  }), window.sl.on("update:ready", () => {
    c.updateState = "ready";
  }), od(), Sa("discord:link").then((a) => {
    c.discordLink = a;
  }).catch(() => {
  }), c.signedIn && (Fa(), Ms(), t.needsSteamLogin || nr().then(() => {
    c.me && c.me.linked && !c.me.prompted && (c.onboard = !0);
  }));
}
const ga = Ct({ profiles: [], activeId: null });
async function Ms() {
  try {
    const t = await Sa("account:list");
    ga.profiles = t.profiles, ga.activeId = t.activeId;
  } catch {
  }
}
async function Lo(t) {
  return await Sa("account:switch", t) ? (c.steamId = t, c.games = [], c.favorites = [], c.hidden = [], c.collections = {}, c.view = "home", c.gameId = null, await Ms(), Fa(), nr(), yt("Switched account."), !0) : !1;
}
async function zo() {
  await Sa("account:signOut"), c.signedIn = !1, c.migrate = !1, c.games = [], ga.profiles = [], ga.activeId = null;
}
const pn = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"), Ji = (t) => /^https:\/\/[^\s"'<>]+$/i.test(t) ? t : "";
function mr(t) {
  let a = pn(t);
  const s = [];
  return a = a.replace(/`([^`]+)`/g, (r, i) => (s.push("<code>" + i + "</code>"), "\0" + (s.length - 1) + "\0")), a = a.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (r, i, o) => {
    const d = Ji(o.replace(/&amp;/g, "&"));
    return d ? '<img src="' + pn(d) + '" alt="' + i + '" loading="lazy">' : i;
  }), a = a.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (r, i, o) => {
    const d = Ji(o.replace(/&amp;/g, "&"));
    return d ? '<a href="#" data-u="' + pn(d) + '">' + i + "</a>" : i;
  }), a = a.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, "$1<i>$2</i>").replace(/(^|[\s(])_([^_\s][^_]*)_(?=[\s).,!?]|$)/g, "$1<i>$2</i>"), a.replace(/\u0000(\d+)\u0000/g, (r, i) => s[+i]);
}
function ud(t) {
  const a = String(t || "").replace(/\r\n/g, `
`).replace(/^﻿/, ""), s = /^---\n([\s\S]*?)\n---\n?/.exec(a);
  if (!s) return { meta: {}, body: a };
  const r = {};
  for (const i of s[1].split(`
`)) {
    const o = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(i);
    o && (r[o[1]] = o[2].replace(/^(["'])(.*)\1$/, "$2"));
  }
  return { meta: r, body: a.slice(s[0].length) };
}
function Zi(t) {
  const a = String(t || "").replace(/\r\n/g, `
`).split(`
`), s = [];
  let r = 0;
  for (; r < a.length; ) {
    const i = a[r], o = i.trim();
    if (!o) {
      r++;
      continue;
    }
    if (/^```/.test(o)) {
      const m = [];
      for (r++; r < a.length && !/^```/.test(a[r].trim()); ) m.push(a[r++]);
      r++, s.push({ t: "code", text: pn(m.join(`
`)) });
      continue;
    }
    if (/^-{3,}$|^\*{3,}$/.test(o)) {
      s.push({ t: "hr" }), r++;
      continue;
    }
    const d = /^(#{1,4})\s+(.*)$/.exec(o);
    if (d) {
      s.push({ t: "h", level: d[1].length, html: mr(d[2]) }), r++;
      continue;
    }
    const f = /^!\[([^\]]*)\]\((https:\/\/[^)\s]+)\)\s*$/.exec(o);
    if (f) {
      s.push({ t: "img", alt: f[1], src: f[2] }), r++;
      continue;
    }
    if (/^>/.test(o)) {
      const m = [];
      for (; r < a.length && /^>/.test(a[r].trim()); ) m.push(a[r++].trim().replace(/^>\s?/, ""));
      let p = "";
      const _ = /^\[!(NOTE|TIP|WARNING|IMPORTANT)\]$/i.exec(m[0] || "");
      _ && (p = _[1].toLowerCase(), m.shift()), s.push({ t: "quote", kind: p, html: m.map(mr).join("<br>") });
      continue;
    }
    if (/^\|.*\|$/.test(o) && r + 1 < a.length && /^\|[\s:|-]+\|$/.test(a[r + 1].trim())) {
      const m = (k) => k.trim().replace(/^\||\|$/g, "").split("|").map((b) => mr(b.trim())), p = m(o);
      r += 2;
      const _ = [];
      for (; r < a.length && /^\|.*\|$/.test(a[r].trim()); ) _.push(m(a[r++]));
      s.push({ t: "table", head: p, rows: _ });
      continue;
    }
    if (/^[-*]\s+/.test(o)) {
      const m = [];
      for (; r < a.length && /^\s*[-*]\s+/.test(a[r]); ) m.push(mr(a[r++].replace(/^\s*[-*]\s+/, "")));
      s.push({ t: "ul", items: m });
      continue;
    }
    if (/^\d+[.)]\s+/.test(o)) {
      const m = [];
      for (; r < a.length && /^\s*\d+[.)]\s+/.test(a[r]); ) m.push(mr(a[r++].replace(/^\s*\d+[.)]\s+/, "")));
      s.push({ t: "ol", items: m });
      continue;
    }
    if (o[0] === "<") {
      r++;
      continue;
    }
    const u = [o];
    for (r++; r < a.length && a[r].trim() && !/^(#{1,4}\s|>|```|[-*]\s|\d+[.)]\s|!\[|\||-{3,}$)/.test(a[r].trim()); ) u.push(a[r++].trim());
    s.push({ t: "p", html: mr(u.join(" ")) });
  }
  return s;
}
var fd = /* @__PURE__ */ gc('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path></path></svg>');
function oe(t, a) {
  let s = Dt(a, "size", 3, 20), r = Dt(a, "stroke", 3, 1.8);
  const i = {
    home: "M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6.5H9V21H4a1 1 0 01-1-1z",
    chart: "M5 20V11M12 20V4M19 20v-6",
    users: "M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM2.5 20c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5M16 4.3a3.5 3.5 0 010 6.4M18.5 14.8c1.9.7 3 2.4 3 5.2",
    pencil: "M4 20h4L19.5 8.5a2.1 2.1 0 00-3-3L5 17l-1 3zM14.5 7.5l3 3",
    up: "M6 14l6-6 6 6",
    down: "M6 10l6 6 6-6",
    image: "M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M9 9.5h.01",
    eyeoff: "M3 3l18 18M10.6 6.2A9.8 9.8 0 0112 6c5 0 8.5 4.2 9.5 6-.5 1-1.6 2.5-3.2 3.8M6.4 7.6C4.3 9 2.9 10.9 2.5 12c1 1.8 4.5 6 9.5 6 1.4 0 2.7-.3 3.8-.8M9.9 10a3 3 0 004 4",
    more: "M5 12h.01M12 12h.01M19 12h.01",
    send: "M22 2L11 13M22 2l-7 20-4-9-9-4z",
    library: "M4 4.5h5v15H4zM11 4.5h3v15h-3zM16.4 5.4l2.9-.8 3.1 14.1-2.9.8z",
    news: "M4 5h12.5v14H6a2 2 0 01-2-2zM16.5 8.5H20v8.5a2 2 0 01-2 2M7.5 9h5M7.5 13h5",
    user: "M12 12.5a4.5 4.5 0 100-9 4.5 4.5 0 000 9zM4.5 21a7.5 7.5 0 0115 0",
    cog: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z",
    play: "M7 4.5v15l13-7.5z",
    stop: "M7 7h10v10H7z",
    star: "M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.7l1-5.9L3.5 9.7l5.9-.8z",
    lock: "M7 11V8a5 5 0 0110 0v3M6 11h12a1 1 0 011 1v8a1 1 0 01-1 1H6a1 1 0 01-1-1v-8a1 1 0 011-1z",
    back: "M15 5l-7 7 7 7",
    plus: "M12 5v14M5 12h14",
    search: "M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-4-4",
    dice: "M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1zM8.5 8.5h.01M15.5 8.5h.01M12 12h.01M8.5 15.5h.01M15.5 15.5h.01",
    folder: "M3 6.5a1.5 1.5 0 011.5-1.5H9l2 2.5h8.5A1.5 1.5 0 0121 9v9a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 18z",
    check: "M5 12.5l4.5 4.5L19 7.5",
    x: "M6 6l12 12M18 6L6 18",
    clock: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2",
    trophy: "M8 4h8v6a4 4 0 01-8 0zM8 6H4.5a2.5 2.5 0 002.7 3.5M16 6h3.5a2.5 2.5 0 01-2.7 3.5M12 14v4M8.5 20h7",
    download: "M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14",
    layers: "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 17.5l9 5 9-5",
    ext: "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5",
    refresh: "M20 11a8 8 0 00-14-4.5L4 9M4 4v5h5M4 13a8 8 0 0014 4.5L20 15M20 20v-5h-5",
    sliders: "M4 7h9M17 7h3M4 17h3M11 17h9M15 4v6M9 14v6",
    bolt: "M13 3L5 13.5h6L10 21l8-10.5h-6z",
    grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
    eye: "M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12zM12 14.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z",
    logout: "M10 4H5a1 1 0 00-1 1v14a1 1 0 001 1h5M15 8l4 4-4 4M19 12H9"
  };
  var o = fd(), d = C(o);
  L(() => {
    Be(o, "width", s()), Be(o, "height", s()), Be(o, "stroke-width", r()), Be(d, "d", i[a.name] || ""), Be(d, "fill", a.name === "stop" ? "currentColor" : "none");
  }), v(t, o);
}
const Qi = (t, a = es) => {
  var s = ta(), r = we(s);
  Ve(r, 17, a, _t, (i, o) => {
    var d = ta(), f = we(d);
    {
      var u = (x) => {
        var A = ta(), j = we(A);
        {
          var O = (I) => {
            var w = hd();
            Wa(w, () => e(o).html, !0), v(I, w);
          }, H = (I) => {
            var w = pd();
            Wa(w, () => e(o).html, !0), v(I, w);
          };
          M(j, (I) => {
            e(o).level <= 2 ? I(O) : I(H, -1);
          });
        }
        v(x, A);
      }, m = (x) => {
        var A = md();
        Wa(A, () => e(o).html, !0), v(x, A);
      }, p = (x) => {
        var A = gd();
        Ve(A, 21, () => e(o).items, _t, (j, O) => {
          var H = el();
          Wa(H, () => e(O), !0), v(j, H);
        }), v(x, A);
      }, _ = (x) => {
        var A = _d();
        Ve(A, 21, () => e(o).items, _t, (j, O) => {
          var H = el();
          Wa(H, () => e(O), !0), v(j, H);
        }), v(x, A);
      }, k = (x) => {
        var A = yd(), j = l(A);
        {
          var O = (I) => {
            var w = bd(), $ = C(w, !0);
            L((B) => T($, B), [
              () => e(o).kind[0].toUpperCase() + e(o).kind.slice(1)
            ]), v(I, w);
          };
          M(j, (I) => {
            e(o).kind && I(O);
          });
        }
        var H = n(j);
        Wa(H, () => e(o).html), L(() => je(A, 1, Nc(e(o).kind), "svelte-u81em")), v(x, A);
      }, b = (x) => {
        var A = wd(), j = l(A);
        Wa(j, () => e(o).text, !0), v(x, A);
      }, S = (x) => {
        var A = xd(), j = l(A), O = n(j);
        {
          var H = (I) => {
            var w = kd(), $ = C(w, !0);
            L(() => T($, e(o).alt)), v(I, w);
          };
          M(O, (I) => {
            e(o).alt && I(H);
          });
        }
        L(() => {
          Be(j, "src", e(o).src), Be(j, "alt", e(o).alt);
        }), v(x, A);
      }, E = (x) => {
        var A = Ld(), j = l(A), O = l(j), H = l(O);
        Ve(H, 21, () => e(o).head, _t, (w, $) => {
          var B = Sd();
          Wa(B, () => e($), !0), v(w, B);
        });
        var I = n(O);
        Ve(I, 21, () => e(o).rows, _t, (w, $) => {
          var B = Td();
          Ve(B, 21, () => e($), _t, (te, he) => {
            var se = Md();
            Wa(se, () => e(he), !0), v(te, se);
          }), v(w, B);
        }), v(x, A);
      }, z = (x) => {
        var A = zd();
        v(x, A);
      };
      M(f, (x) => {
        e(o).t === "h" ? x(u) : e(o).t === "p" ? x(m, 1) : e(o).t === "ul" ? x(p, 2) : e(o).t === "ol" ? x(_, 3) : e(o).t === "quote" ? x(k, 4) : e(o).t === "code" ? x(b, 5) : e(o).t === "img" ? x(S, 6) : e(o).t === "table" ? x(E, 7) : e(o).t === "hr" && x(z, 8);
      });
    }
    v(i, d);
  }), v(t, s);
};
var hd = /* @__PURE__ */ h('<h3 class="svelte-u81em"></h3>'), pd = /* @__PURE__ */ h('<h4 class="svelte-u81em"></h4>'), md = /* @__PURE__ */ h('<p class="svelte-u81em"></p>'), el = /* @__PURE__ */ h('<li class="svelte-u81em"></li>'), gd = /* @__PURE__ */ h('<ul class="svelte-u81em"></ul>'), _d = /* @__PURE__ */ h('<ol class="svelte-u81em"></ol>'), bd = /* @__PURE__ */ h('<b class="qk svelte-u81em"> </b>'), yd = /* @__PURE__ */ h("<blockquote><!><!></blockquote>"), wd = /* @__PURE__ */ h('<pre class="svelte-u81em"><code class="svelte-u81em"></code></pre>'), kd = /* @__PURE__ */ h('<figcaption class="svelte-u81em"> </figcaption>'), xd = /* @__PURE__ */ h('<figure class="svelte-u81em"><img loading="lazy" draggable="false" class="svelte-u81em"/><!></figure>'), Sd = /* @__PURE__ */ h('<th class="svelte-u81em"></th>'), Md = /* @__PURE__ */ h('<td class="svelte-u81em"></td>'), Td = /* @__PURE__ */ h("<tr></tr>"), Ld = /* @__PURE__ */ h('<div class="tw svelte-u81em"><table class="svelte-u81em"><thead><tr></tr></thead><tbody></tbody></table></div>'), zd = /* @__PURE__ */ h('<hr class="svelte-u81em"/>'), Cd = /* @__PURE__ */ h('<span class="faint"> </span>'), Ed = /* @__PURE__ */ h('<div class="skel" style="height:14px;width:80%"></div><div class="skel" style="height:14px;width:92%;margin-top:10px"></div><div class="skel" style="height:14px;width:60%;margin-top:10px"></div>', 1), Ad = /* @__PURE__ */ h('<p class="muted">Could not load this post. Check your connection and try again.</p>'), Id = /* @__PURE__ */ h('<div class="notes post svelte-u81em"><!></div>'), Pd = /* @__PURE__ */ h('<div class="skel" style="height:14px;width:70%"></div><div class="skel" style="height:14px;width:90%;margin-top:10px"></div>', 1), Dd = /* @__PURE__ */ h('<p class="muted">Could not load the full notes. Read them on GitHub.</p>'), Nd = /* @__PURE__ */ h('<div class="sec svelte-u81em"><h3 class="svelte-u81em">Everything in this release</h3> <!></div>'), Od = /* @__PURE__ */ h('<div class="notes svelte-u81em"><!></div>'), qd = /* @__PURE__ */ h('<div class="foot svelte-u81em"><button class="btn"><!>Open on GitHub</button></div>'), jd = /* @__PURE__ */ h('<div class="zoom svelte-u81em" role="presentation"><img alt="" draggable="false" class="svelte-u81em"/></div>'), Hd = /* @__PURE__ */ h('<div class="back svelte-u81em" role="presentation"><div class="panel svelte-u81em" role="dialog" aria-modal="true" tabindex="-1"><div class="inner svelte-u81em"><div class="top svelte-u81em"><div class="meta svelte-u81em"><span class="tag svelte-u81em"> </span><!></div> <button class="btn icon sm x" aria-label="Close"><!></button></div> <h2 class="svelte-u81em"> </h2> <!> <!> <!> <!> <!></div></div></div> <!>', 1);
function Co(t, a) {
  Tt(a, !0);
  let s, r, i, o = /* @__PURE__ */ G(null), d = /* @__PURE__ */ G(Ct(a.item.body || "")), f = /* @__PURE__ */ G(Ct(!a.item.body && !!a.item.file)), u = /* @__PURE__ */ G(!!a.item.release), m = /* @__PURE__ */ G(!1), p = /* @__PURE__ */ G(""), _ = !1;
  const k = matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "reduced", b = /* @__PURE__ */ P(() => Zi(e(d))), S = /* @__PURE__ */ P(() => Zi(e(o) && e(o).body || "")), E = /* @__PURE__ */ P(() => e(o) && e(o).url || (a.item.release ? "https://github.com/imnotfisy/SteamLite/releases/tag/" + a.item.release : "")), z = /* @__PURE__ */ P(() => a.item.date ? new Date(a.item.date).toLocaleString(void 0, { dateStyle: "long", timeStyle: "short" }) : ""), x = "cubic-bezier(.16, 1, .3, 1)";
  function A(W) {
    const ee = s.getBoundingClientRect(), pe = a.rect.width / ee.width, R = a.rect.left - ee.left, ge = a.rect.top - ee.top, be = Math.max(0, ee.height - a.rect.height / pe);
    s.style.transformOrigin = "top left";
    const N = [
      {
        transform: `translate(${R}px, ${ge}px) scale(${pe})`,
        clipPath: `inset(0px 0px ${be}px 0px round ${14 / pe}px)`
      },
      {
        transform: "none",
        clipPath: "inset(0px 0px 0px 0px round 24px)"
      }
    ];
    return s.animate(W ? [...N].reverse() : N, {
      duration: W ? 420 : 680,
      easing: W ? "cubic-bezier(.7, 0, .84, 0)" : x,
      fill: "both"
    }).finished;
  }
  function j() {
    if (!_) {
      if (_ = !0, k) return a.onclose();
      [...r.children].forEach((W) => W.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, fill: "both" })), i.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420, delay: 60, fill: "both" }), A(!0).then(() => a.onclose());
    }
  }
  oa(() => {
    k || (i.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 480, fill: "both" }), A(!1), [...r.children].forEach((ee, pe) => ee.animate(
      [
        { opacity: 0, transform: "translateY(20px)" },
        { opacity: 1, transform: "none" }
      ],
      {
        duration: 560,
        delay: 220 + pe * 70,
        easing: x,
        fill: "both"
      }
    ))), a.item.file && !a.item.body && ve("news:post", a.item.file).then((ee) => {
      ee ? g(d, ud(ee).body, !0) : g(m, !0), g(f, !1);
    }).catch(() => {
      g(m, !0), g(f, !1);
    }), a.item.release && ve("news:release", a.item.release).then((ee) => {
      g(o, ee, !0), g(u, !1);
    }).catch(() => g(u, !1));
    const W = (ee) => {
      ee.key === "Escape" && (e(p) ? g(p, "") : j());
    };
    return addEventListener("keydown", W), s.focus(), () => removeEventListener("keydown", W);
  });
  const O = (W) => {
    const ee = W.target.closest && W.target.closest("a[data-u]");
    if (ee) {
      W.preventDefault(), ve("app:openUrl", ee.dataset.u);
      return;
    }
    const pe = W.target.closest && W.target.closest("img");
    pe && pe.src && g(p, pe.src, !0);
  };
  var H = Hd(), I = we(H), w = l(I), $ = l(w), B = l($), te = l(B), he = l(te), se = C(he, !0), de = n(he);
  {
    var U = (W) => {
      var ee = Cd(), pe = C(ee, !0);
      L(() => T(pe, e(z))), v(W, ee);
    };
    M(de, (W) => {
      e(z) && W(U);
    });
  }
  var re = n(te, 2), ke = l(re);
  oe(ke, { name: "x", size: 16 });
  var F = n(B, 2), ne = C(F, !0), V = n(F, 2);
  {
    var ye = (W) => {
      var ee = Ed();
      v(W, ee);
    }, Se = (W) => {
      var ee = Ad();
      v(W, ee);
    };
    M(V, (W) => {
      e(f) ? W(ye) : e(m) && W(Se, 1);
    });
  }
  var Re = n(V, 2);
  {
    var $e = (W) => {
      var ee = Id(), pe = l(ee);
      Qi(pe, () => e(b)), y("click", ee, O), v(W, ee);
    };
    M(Re, (W) => {
      e(b).length && W($e);
    });
  }
  var Ye = n(Re, 2);
  {
    var ce = (W) => {
      var ee = Nd(), pe = n(l(ee), 2);
      {
        var R = (be) => {
          var N = Pd();
          v(be, N);
        }, ge = (be) => {
          var N = Dd();
          v(be, N);
        };
        M(pe, (be) => {
          e(u) ? be(R) : e(o) || be(ge, 1);
        });
      }
      v(W, ee);
    };
    M(Ye, (W) => {
      a.item.release && W(ce);
    });
  }
  var J = n(Ye, 2);
  {
    var q = (W) => {
      var ee = Od(), pe = l(ee);
      Qi(pe, () => e(S)), y("click", ee, O), v(W, ee);
    };
    M(J, (W) => {
      e(S).length && W(q);
    });
  }
  var D = n(J, 2);
  {
    var X = (W) => {
      var ee = qd(), pe = l(ee), R = l(pe);
      oe(R, { name: "ext", size: 16 }), y("click", pe, () => ve("app:openUrl", e(E))), v(W, ee);
    };
    M(D, (W) => {
      e(E) && W(X);
    });
  }
  _a($, (W) => r = W, () => r), _a(w, (W) => s = W, () => s), _a(I, (W) => i = W, () => i);
  var fe = n(I, 2);
  {
    var Z = (W) => {
      var ee = jd(), pe = C(ee);
      L(() => Be(pe, "src", e(p))), y("click", ee, () => g(p, "")), v(W, ee);
    };
    M(fe, (W) => {
      e(p) && W(Z);
    });
  }
  L(() => {
    Be(w, "aria-label", a.item.title), dt($, a.item.release ? "min-height: min(520px, calc(100vh - 140px))" : ""), T(se, a.item.tag), T(ne, a.item.title);
  }), y("click", I, j), y("click", w, (W) => W.stopPropagation()), y("keydown", w, () => {
  }), y("click", re, j), v(t, H), Lt();
}
Wt(["click", "keydown"]);
const Yn = /* @__PURE__ */ new Map(), Eo = "#8D99AE", Rd = (t) => `hsl(${[...String(t)].reduce((s, r) => s + r.charCodeAt(0) * 7, 0) % 360} 70% 62%)`;
function $d(t) {
  return new Promise((a) => {
    const s = new Image();
    s.crossOrigin = "anonymous", s.onload = () => {
      try {
        const r = document.createElement("canvas");
        r.width = 24, r.height = 14;
        const i = r.getContext("2d", { willReadFrequently: !0 });
        i.drawImage(s, 0, 0, 24, 14);
        const o = i.getImageData(0, 0, 24, 14).data;
        let d = 0, f = 0, u = 0, m = 0;
        for (let k = 0; k < o.length; k += 4) {
          const b = Math.max(o[k], o[k + 1], o[k + 2]), S = Math.min(o[k], o[k + 1], o[k + 2]), E = b ? (b - S) / b : 0, z = E * E * (0.3 + b / 255) + 0.01;
          d += o[k] * z, f += o[k + 1] * z, u += o[k + 2] * z, m += z;
        }
        d /= m, f /= m, u /= m;
        const p = Math.max(d, f, u), _ = p < 150 ? 190 / p : 1;
        a(`rgb(${Math.min(255, d * _) | 0} ${Math.min(255, f * _) | 0} ${Math.min(255, u * _) | 0})`);
      } catch {
        a(null);
      }
    }, s.onerror = () => a(null), s.src = t;
  });
}
async function Fd(t) {
  if (!t) return Eo;
  if (Yn.has(t.id)) return Yn.get(t.id);
  let a = t.nonSteam && !t.cover ? null : await $d(yo.header(t));
  return a = a || Rd(t.name), Yn.set(t.id, a), a;
}
function Ao(t) {
  const a = document.documentElement.style;
  document.documentElement.dataset.accent === "fixed" || !t ? a.removeProperty("--glow") : a.setProperty("--glow", t);
}
async function Io(t) {
  const a = await Fd(t);
  return Ao(a), a;
}
const Bd = () => Ao(Eo);
function Gs(t, a) {
  const s = (r) => {
    r.key === "Escape" && (r.stopPropagation(), a());
  };
  return window.addEventListener("keydown", s, !0), { destroy() {
    window.removeEventListener("keydown", s, !0);
  } };
}
function Gd(t) {
  const a = (s) => {
    Math.abs(s.deltaY) > Math.abs(s.deltaX) && t.scrollWidth > t.clientWidth && s.shiftKey && (t.scrollLeft += s.deltaY, s.preventDefault());
  };
  return t.addEventListener("wheel", a, { passive: !1 }), { destroy() {
    t.removeEventListener("wheel", a);
  } };
}
function Kt(t) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return {};
  t.classList.add("rv");
  const a = new IntersectionObserver((s) => {
    for (const r of s) r.isIntersecting && (t.classList.add("in"), a.disconnect());
  }, { root: t.closest("main"), threshold: 0.06, rootMargin: "0px 0px -4% 0px" });
  return a.observe(t), { destroy() {
    a.disconnect();
  } };
}
const Wd = ".btn, .chip, .seg button, .seg2 button, .tabs button, .acc, .it, .tg, .gc, nav .list button, .acts button, .btns button, .me", Yd = [{ transform: "scale(1)" }, { transform: "scale(.93)", offset: 0.28 }, { transform: "scale(1.035)", offset: 0.62 }, { transform: "scale(1)" }], Ud = [{ transform: "scale(1)" }, { transform: "scale(.8) rotate(-8deg)", offset: 0.3 }, { transform: "scale(1.18) rotate(4deg)", offset: 0.65 }, { transform: "scale(1)" }];
function Vd(t) {
  const a = t.getBoundingClientRect(), s = a.left + a.width / 2, r = a.top + a.height / 2;
  for (let i = 0; i < 9; i++) {
    const o = document.createElement("i"), d = Math.PI * 2 * i / 9 + Math.random() * 0.4, f = 20 + Math.random() * 16;
    o.className = "spark", o.style.transform = "translate(" + s + "px," + r + "px)", document.body.appendChild(o), o.animate([{ transform: "translate(" + s + "px," + r + "px) scale(1)", opacity: 1 }, { transform: "translate(" + (s + Math.cos(d) * f) + "px," + (r + Math.sin(d) * f) + "px) scale(0)", opacity: 0 }], { duration: 520 + Math.random() * 200, easing: "cubic-bezier(.2,.8,.2,1)" }).finished.then(() => o.remove(), () => o.remove());
  }
}
function Kd() {
  document.addEventListener("pointerdown", (t) => {
    if (t.button !== 0 || document.documentElement.dataset.motion === "reduced") return;
    const a = t.target.closest && t.target.closest(Wd);
    if (!a || a.disabled || a.hasAttribute("disabled")) return;
    const s = a.matches("nav .list button"), r = s ? a.querySelector(".ic") : a.matches(".gc") ? a.querySelector(".art") : a.matches(".tg") ? null : a;
    if (a.getAttribute("aria-label") === "Add to favorites" && Vd(a), r && r.animate(s ? Ud : Yd, { duration: s ? 550 : 480, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" }), a.matches("nav .list button, .gc, .me, .tg, .acts button")) return;
    const i = a.getBoundingClientRect(), o = Math.max(i.width, i.height) * 2.3, d = document.createElement("span");
    d.className = "fx-ripple", d.style.cssText = "width:" + o + "px;height:" + o + "px;left:" + (t.clientX - i.left - o / 2) + "px;top:" + (t.clientY - i.top - o / 2) + "px", a.appendChild(d), setTimeout(() => d.remove(), 750);
  }, !0);
}
const er = /* @__PURE__ */ new Set();
let ui = 0, fi = 0;
function Po(t) {
  const a = Math.min(0.033, Math.max(1e-3, (t - fi) / 1e3));
  fi = t;
  const s = Math.ceil(a / 8e-3), r = a / s;
  for (const i of [...er]) {
    for (let o = 0; o < s; o++) {
      const d = (-i.k * (i.x - i.t) - i.c * i.v) / i.m;
      i.v += d * r, i.x += i.v * r;
    }
    Math.abs(i.x - i.t) < i.eps && Math.abs(i.v) < i.eps * 8 && (i.x = i.t, i.v = 0, er.delete(i)), i.fire();
  }
  ui = er.size ? requestAnimationFrame(Po) : 0;
}
function tl() {
  ui || (fi = performance.now(), ui = requestAnimationFrame(Po));
}
class ks {
  constructor(a = 0, { k: s = 170, c: r = 20, m: i = 1, eps: o = 0.01 } = {}) {
    this.x = a, this.t = a, this.v = 0, this.k = s, this.c = r, this.m = i, this.eps = o, this.fns = /* @__PURE__ */ new Set();
  }
  on(a) {
    return this.fns.add(a), () => this.fns.delete(a);
  }
  fire() {
    for (const a of this.fns) a(this.x, this.v);
  }
  to(a) {
    return this.t = a, er.add(this), tl(), this;
  }
  set(a) {
    return this.x = this.t = a, this.v = 0, er.delete(this), this.fire(), this;
  }
  push(a) {
    return this.v += a, er.add(this), tl(), this;
  }
  // a kick
  get settled() {
    return !er.has(this);
  }
}
function Xd(t, a = 8.5, s = 10.5) {
  return t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.exp(-a * t) * Math.cos(s * t);
}
function Do(t, { duration: a = 950, delay: s = 0 } = {}) {
  return {
    delay: s,
    duration: a,
    css: (r) => {
      const i = Xd(r), o = 1 - i;
      return "opacity:" + Math.min(1, r * 2.4) + ";transform:translateY(" + (o * 54).toFixed(2) + "px) scale(" + (1 - o * 0.05).toFixed(4) + "," + (1 + o * 0.018).toFixed(4) + ");transform-origin:50% 100%;";
    }
  };
}
function No(t) {
  const a = new ks(t.scrollTop, { k: 140, c: 25, eps: 0.05 }), s = () => Math.max(0, t.scrollHeight - t.clientHeight), r = () => t.querySelector(".stretch"), i = () => matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "reduced" || document.documentElement.dataset.gaming === "1";
  let o = 0;
  const d = (p, _) => {
    const k = s(), b = Math.max(0, Math.min(k, p)), S = p - b;
    Math.abs(t.scrollTop - b) > 0.4 && (t.scrollTop = b);
    const E = r();
    if (!E) return;
    if (Math.abs(S) < 0.25) {
      E.style.getPropertyValue("--pull") && (E.style.removeProperty("--pull"), E.style.removeProperty("--grow"), E.style.removeProperty("--origin"));
      return;
    }
    const z = Math.sign(S) * Math.min(160, Math.abs(S) * 0.5), x = 1 + Math.min(0.045, Math.abs(S) / 2600);
    E.style.setProperty("--origin", S < 0 ? "50% 0%" : "50% 100%"), E.style.setProperty("--pull", (-z).toFixed(2) + "px"), E.style.setProperty("--grow", x.toFixed(4));
  };
  a.on(d);
  const f = (p) => {
    if (p.ctrlKey || p.shiftKey || p.defaultPrevented || Math.abs(p.deltaX) > Math.abs(p.deltaY)) return;
    let _ = p.target;
    for (; _ && _ !== t; _ = _.parentElement) {
      if (_.tagName === "TEXTAREA") return;
      const z = getComputedStyle(_).overflowY;
      if ((z === "auto" || z === "scroll") && _.scrollHeight > _.clientHeight + 1) return;
    }
    if (i()) return;
    p.preventDefault();
    const k = p.deltaMode === 1 ? 40 : p.deltaMode === 2 ? t.clientHeight : 1, b = s(), S = a.settled ? t.scrollTop : a.t;
    if (t.__snap) {
      const z = t.__snap(p.deltaY * k, S);
      z != null && a.to(z);
      return;
    }
    let E = S + p.deltaY * k;
    E < 0 ? E = Math.max(-240, S < 0 ? S + p.deltaY * k * 0.3 : E * 0.5) : E > b && (E = Math.min(b + 240, S > b ? S + p.deltaY * k * 0.3 : b + (E - b) * 0.5)), a.to(E), clearTimeout(o), o = setTimeout(() => {
      const z = s();
      (a.t < 0 || a.t > z) && a.to(Math.max(0, Math.min(z, a.t)));
    }, 90);
  }, u = () => {
    a.settled && Math.abs(a.x - t.scrollTop) > 1 && a.set(t.scrollTop);
  }, m = () => {
    a.set(0), t.scrollTop = 0;
    const p = r();
    p && (p.style.removeProperty("--pull"), p.style.removeProperty("--grow"), p.style.removeProperty("--origin"));
  };
  return t.addEventListener("wheel", f, { passive: !1 }), t.addEventListener("scroll", u, { passive: !0 }), t.addEventListener("sl-reset", m), { destroy() {
    t.removeEventListener("wheel", f), t.removeEventListener("scroll", u), t.removeEventListener("sl-reset", m), clearTimeout(o);
  } };
}
Hv();
var Jd = /* @__PURE__ */ h('<div class="ov svelte-18ktqx8" role="status" aria-live="polite"><div class="orbs svelte-18ktqx8" aria-hidden="true"><i class="svelte-18ktqx8"></i><i class="svelte-18ktqx8"></i></div> <div class="center svelte-18ktqx8"><div class="mark svelte-18ktqx8"><span class="ring svelte-18ktqx8"></span><span class="ring r2 svelte-18ktqx8"></span><img src="/icon.png" alt="" draggable="false" class="svelte-18ktqx8"/></div> <div class="t svelte-18ktqx8"> </div> <div class="bar svelte-18ktqx8"><i class="svelte-18ktqx8"></i></div></div></div>');
function Zd(t, a) {
  Tt(a, !1), An();
  var s = Jd(), r = n(l(s), 2), i = n(l(r), 2), o = C(i, !0);
  L(() => T(o, c.applying ? c.applying.label : "")), bt(1, s, () => ha, () => ({ duration: 180 })), bt(2, s, () => ha, () => ({ duration: 420 })), v(t, s), Lt();
}
var al = /* @__PURE__ */ h('<img alt="" draggable="false" class="svelte-1qgs1jv"/>'), Qd = /* @__PURE__ */ h('<span class="svelte-1qgs1jv"> </span>'), eu = /* @__PURE__ */ h('<button aria-label="Friends" title="Friends"><!></button> <button aria-label="Account menu"><!> <i class="dot svelte-1qgs1jv"></i></button>', 1), tu = /* @__PURE__ */ h('<b class="svelte-1qgs1jv"> </b>'), au = /* @__PURE__ */ h('<span class="ck svelte-1qgs1jv"><!></span>'), su = /* @__PURE__ */ h('<button role="menuitem"><span class="av svelte-1qgs1jv"><!></span> <span class="nm ellipsis svelte-1qgs1jv"> <small class="svelte-1qgs1jv"> </small></span> <!></button>'), ru = /* @__PURE__ */ h('<div class="scrim svelte-1qgs1jv" role="presentation"></div> <div class="menu glass svelte-1qgs1jv" role="menu"><div class="hd svelte-1qgs1jv">Accounts</div> <!> <div class="sep svelte-1qgs1jv"></div> <button class="it svelte-1qgs1jv" role="menuitem"><!>Account</button> <button class="it svelte-1qgs1jv" role="menuitem"><!>View profile</button> <button class="it svelte-1qgs1jv" role="menuitem"><!>Add another account</button> <button class="it bad svelte-1qgs1jv" role="menuitem"><!>Sign out</button></div>', 1), nu = /* @__PURE__ */ h('<div data-tauri-drag-region=""><div class="grow svelte-1qgs1jv" data-tauri-drag-region=""></div> <!> <div class="btns svelte-1qgs1jv"><button aria-label="Minimize" class="svelte-1qgs1jv"><svg width="11" height="11" viewBox="0 0 12 12"><path d="M2 6h8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"></path></svg></button> <button class="x svelte-1qgs1jv" aria-label="Close"><svg width="11" height="11" viewBox="0 0 12 12"><path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"></path></svg></button></div></div> <!>', 1);
function iu(t, a) {
  Tt(a, !0);
  let s = Dt(a, "showMe", 3, !1), r = /* @__PURE__ */ G(!1);
  const i = /* @__PURE__ */ P(() => ga.profiles.find((O) => O.steamId === ga.activeId) || ga.profiles[0]), o = (O) => ((O || "?").trim()[0] || "?").toUpperCase(), d = () => {
    g(r, !e(r)), e(r) && Ms();
  }, f = async (O) => {
    g(r, !1), O !== ga.activeId && await Lo(O);
  }, u = (O) => {
    g(r, !1), Da(O);
  }, m = async () => {
    g(r, !1), await zo();
  };
  var p = nu(), _ = we(p);
  let k;
  var b = n(l(_), 2);
  {
    var S = (O) => {
      var H = eu(), I = we(H);
      let w;
      var $ = l(I);
      oe($, { name: "users", size: 17 });
      var B = n(I, 2);
      let te;
      var he = l(B);
      {
        var se = (U) => {
          var re = al();
          L(() => Be(re, "src", c.look && c.look.avatarImage || e(i).avatar)), v(U, re);
        }, de = (U) => {
          var re = Qd(), ke = C(re, !0);
          L((F) => T(ke, F), [() => o(e(i).name)]), v(U, re);
        };
        M(he, (U) => {
          c.look && c.look.avatarImage || e(i).avatar ? U(se) : U(de, -1);
        });
      }
      L(() => {
        w = je(I, 1, "fb svelte-1qgs1jv", null, w, { open: c.friendsOpen }), Be(I, "aria-expanded", c.friendsOpen), te = je(B, 1, "me svelte-1qgs1jv", null, te, { open: e(r) }), Be(B, "aria-expanded", e(r)), Be(B, "title", e(i).name);
      }), y("click", I, () => {
        g(r, !1), c.friendsOpen = !c.friendsOpen;
      }), y("click", B, d), v(O, H);
    };
    M(b, (O) => {
      s() && e(i) && O(S);
    });
  }
  var E = n(b, 2), z = l(E), x = n(z, 2), A = n(_, 2);
  {
    var j = (O) => {
      var H = ru(), I = we(H);
      zt(I, (F, ne) => Gs?.(F, ne), () => () => g(r, !1));
      var w = n(I, 2), $ = n(l(w), 2);
      Ve($, 19, () => ga.profiles, (F) => F.steamId, (F, ne, V) => {
        var ye = su();
        let Se;
        var Re = l(ye), $e = l(Re);
        {
          var Ye = (W) => {
            var ee = al();
            L(() => Be(ee, "src", e(ne).avatar)), v(W, ee);
          }, ce = (W) => {
            var ee = tu(), pe = C(ee, !0);
            L((R) => T(pe, R), [() => o(e(ne).name)]), v(W, ee);
          };
          M($e, (W) => {
            e(ne).avatar ? W(Ye) : W(ce, -1);
          });
        }
        var J = n(Re, 2), q = l(J), D = n(q), X = C(D, !0), fe = n(J, 2);
        {
          var Z = (W) => {
            var ee = au(), pe = l(ee);
            oe(pe, { name: "check", size: 16, stroke: 3 }), v(W, ee);
          };
          M(fe, (W) => {
            e(ne).steamId === ga.activeId && W(Z);
          });
        }
        L(() => {
          Se = je(ye, 1, "acc svelte-1qgs1jv", null, Se, { cur: e(ne).steamId === ga.activeId }), dt(ye, `--i:${e(V) ?? ""}`), T(q, e(ne).name || e(ne).steamId), T(X, e(ne).steamId === ga.activeId ? "Signed in" : "Switch to this account");
        }), y("click", ye, () => f(e(ne).steamId)), v(F, ye);
      });
      var B = n($, 4), te = l(B);
      oe(te, { name: "cog", size: 18 });
      var he = n(B, 2), se = l(he);
      oe(se, { name: "user", size: 18 });
      var de = n(he, 2), U = l(de);
      oe(U, { name: "plus", size: 18 });
      var re = n(de, 2), ke = l(re);
      oe(ke, { name: "logout", size: 18 }), y("click", I, () => g(r, !1)), y("click", B, () => u("account")), y("click", he, () => u("profile")), y("click", de, () => {
        g(r, !1), c.addAccount = !0;
      }), y("click", re, m), bt(3, w, () => La, () => ({ y: -14, duration: 380, easing: ca })), v(O, H);
    };
    M(A, (O) => {
      e(r) && s() && O(j);
    });
  }
  L(() => k = je(_, 1, "bar svelte-1qgs1jv", null, k, { chrome: s() })), y("click", z, () => window.sl.minimize()), y("click", x, () => c.running && c.settings.confirmClose !== !1 && !c.settings.closeToTray ? c.confirmClose = !0 : window.sl.close()), v(t, p), Lt();
}
Wt(["click"]);
const Oo = (t) => {
  let a = document.getElementById(t);
  return a || (a = document.createElement("style"), a.id = t, document.head.appendChild(a)), a;
};
function tr(t) {
  c.mod = t || null;
  const a = document.documentElement;
  if (t && t.css !== void 0)
    a.dataset.module = t.id, Oo("sl-module").textContent = t.css;
  else {
    delete a.dataset.module;
    const s = document.getElementById("sl-module");
    s && (s.textContent = "");
  }
  Dr();
}
function qo(t, a) {
  const s = a && Os(a) ? a : "";
  document.documentElement.dataset.theme = s, c.live = { theme: s, snow: (c.settings || {}).snow !== !1 }, lu(t);
}
function lu(t) {
  const a = Oo("sl-module-draft");
  a.textContent = t || "", document.documentElement.dataset.moduleDraft = t ? "1" : "", t && (document.documentElement.dataset.module = document.documentElement.dataset.module || "draft");
}
function jo() {
  Dr();
  const t = document.getElementById("sl-module-draft");
  t && (t.textContent = ""), delete document.documentElement.dataset.moduleDraft, c.mod || delete document.documentElement.dataset.module;
}
async function hi(t) {
  const a = await ve("modules:setActive", t || null);
  return !a || !a.ok ? yt(a && a.error || "That did not work.", "bad") : (tr(a.active), !0);
}
const Ho = (t) => !!(c.mod && c.mod.layout && c.mod.layout.sidebar && c.mod.layout.sidebar.hide.includes(t)), Xs = (t) => !!(c.mod && c.mod.layout && c.mod.layout.home && c.mod.layout.home.hide.includes(t)), Ro = (t) => {
  const a = c.mod && c.mod.layout && c.mod.layout.sidebar && c.mod.layout.sidebar.order;
  return !a || !a.length ? t : [...t].sort((s, r) => {
    const i = a.indexOf(s[0]), o = a.indexOf(r[0]);
    return (i < 0 ? 99 : i) - (o < 0 ? 99 : o);
  });
};
function ou() {
  window.addEventListener("keydown", async (t) => {
    if (t.ctrlKey && t.altKey && t.shiftKey && (t.key === "M" || t.key === "m")) {
      t.preventDefault();
      const a = c.settings.modulesOn === !1;
      await ve("settings:set", { modulesOn: a }), c.settings = { ...c.settings, modulesOn: a }, tr(a ? await ve("modules:active") : null), yt(a ? "Modules are on." : "Modules are off. Press Ctrl+Alt+Shift+M to turn them on again.");
    }
  });
}
const Un = (t) => Math.round(Math.min(255, Math.max(0, t))).toString(16).padStart(2, "0"), Qr = (t) => {
  t = String(t || "#000000").replace("#", ""), t.length === 3 && (t = t.split("").map((s) => s + s).join(""));
  const a = parseInt(t.slice(0, 6), 16) || 0;
  return [a >> 16 & 255, a >> 8 & 255, a & 255];
}, $o = ([t, a, s]) => "#" + Un(t) + Un(a) + Un(s), Fr = (t, a, s) => {
  const r = Qr(t), i = Qr(a);
  return $o(r.map((o, d) => o + (i[d] - o) * s));
}, Ei = (t) => {
  const [a, s, r] = Qr(t).map((i) => (i /= 255, i <= 0.03928 ? i / 12.92 : Math.pow((i + 0.055) / 1.055, 2.4)));
  return 0.2126 * a + 0.7152 * s + 0.0722 * r;
}, sl = (t) => Ei(t) > 0.4 ? "#101114" : "#ffffff", Br = (t, a) => {
  const [s, r, i] = Qr(t);
  return "rgba(" + s + "," + r + "," + i + "," + a + ")";
}, Fo = [
  ["", "SteamLite default"],
  ["Segoe UI, system-ui, sans-serif", "Segoe UI"],
  ["Trebuchet MS, Segoe UI, sans-serif", "Trebuchet"],
  ["Georgia, serif", "Georgia (serif)"],
  ["Consolas, Cascadia Mono, monospace", "Consolas (mono)"],
  ["Verdana, Segoe UI, sans-serif", "Verdana"]
];
function Bo(t, a = {}) {
  const s = Ei(t.bg) > 0.4, r = {}, i = (u, m) => Fr(u, s ? "#000000" : "#ffffff", m), o = (u, m) => Fr(u, s ? "#ffffff" : "#000000", m);
  r["--bg"] = t.bg, r["--bg-raise"] = i(t.bg, 0.06), r["--text"] = t.text, r["--muted"] = Fr(t.text, t.bg, 0.3), r["--faint"] = Fr(t.text, t.bg, 0.5), r["--glow"] = t.accent, r["--accent"] = t.accent, r["--accent2"] = t.accent2 || Fr(t.accent, "#ffffff", 0.3), r["--accent-ink"] = sl(t.accent), r["--slab"] = "linear-gradient(180deg, " + i(t.bg, 0.1) + ", " + i(t.bg, 0.05) + ")", r["--face"] = "linear-gradient(180deg, " + i(t.bg, 0.14) + ", " + i(t.bg, 0.08) + ")", r["--face-hi"] = "linear-gradient(180deg, " + i(t.bg, 0.19) + ", " + i(t.bg, 0.12) + ")", r["--rail"] = o(t.bg, 0.25), r["--play"] = t.play, r["--play-ink"] = sl(t.play);
  const d = s ? "#000000" : "#ffffff";
  r["--s1"] = Br(d, 0.04), r["--s2"] = Br(d, 0.07), r["--s3"] = Br(d, 0.11), r["--line"] = Br(d, s ? 0.1 : 0.08), r["--line2"] = Br(d, s ? 0.22 : 0.16), s && (r["--good"] = "#15803d", r["--bad"] = "#b91c1c", r["--warn"] = "#b45309"), a.page && (r["--page"] = "linear-gradient(" + (a.angle == null ? 180 : a.angle) + "deg, " + t.bg + ", " + a.page + ")");
  const f = Math.round(a.radius == null ? 12 : a.radius);
  return r["--r-xl"] = Math.round(f * 1.6) + "px", r["--r-lg"] = Math.round(f * 1.15) + "px", r["--r"] = f + "px", r["--r-sm"] = Math.round(f * 0.75) + "px", a.font && (r["--font"] = a.font), r;
}
const Go = (t) => String(t || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 38);
async function gr(t, a) {
  const s = Date.now();
  c.applying = { label: t };
  try {
    return await new Promise((r) => setTimeout(r, 80)), await a();
  } finally {
    const r = 1100 - (Date.now() - s);
    r > 0 && await new Promise((i) => setTimeout(i, r)), c.applying = null;
  }
}
const vu = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  FONTS: Fo,
  applyDraft: qo,
  applyModule: tr,
  applying: gr,
  clearDraft: jo,
  deriveTokens: Bo,
  hiddenHome: Xs,
  hiddenSidebar: Ho,
  installSafeKey: ou,
  lum: Ei,
  sidebarOrder: Ro,
  slug: Go,
  toHex: $o,
  toRgb: Qr,
  useModule: hi
}, Symbol.toStringTag, { value: "Module" }));
var cu = /* @__PURE__ */ h('<button><span class="ic svelte-1njg66l"><!></span> <span class="tip svelte-1njg66l"> </span></button>'), du = /* @__PURE__ */ h('<i class="sep svelte-1njg66l"></i> <button class="now svelte-1njg66l"><span class="orb svelte-1njg66l"><i class="svelte-1njg66l"></i></span><span class="nm svelte-1njg66l"><small class="svelte-1njg66l"> </small><b class="ellipsis svelte-1njg66l"> </b></span></button>', 1), uu = /* @__PURE__ */ h('<nav class="dock svelte-1njg66l" aria-label="Main"><div class="list svelte-1njg66l"><div class="blob svelte-1njg66l"></div> <!></div> <!></nav>');
function fu(t, a) {
  Tt(a, !0);
  const s = [
    ["home", "Home", "home"],
    ["library", "Library", "library"],
    ["news", "News", "news"],
    ["stats", "Stats", "chart"],
    ["customise", "Customise", "sliders"],
    ["settings", "Settings", "cog"]
  ], r = /* @__PURE__ */ P(() => [
    ...Ro(s.filter((se) => !["customise", "settings"].includes(se[0]) && !Ho(se[0]))),
    ...s.filter((se) => ["customise", "settings"].includes(se[0]))
  ]), i = /* @__PURE__ */ P(() => c.running && (xr(c.running.id) || { name: c.running.name })), o = /* @__PURE__ */ P(() => c.view === "game" ? "library" : c.view), d = /* @__PURE__ */ P(() => e(r).findIndex((se) => se[0] === e(o))), f = 54, u = 0.24, m = 70;
  let p, _, k = Ct([]), b = [];
  const S = new ks(0, { k: 360, c: 30, eps: 0.1 }), E = new ks(0, { k: 260, c: 27, eps: 0.1 }), z = () => {
    _ && (_.style.transform = "translate3d(" + S.x.toFixed(2) + "px,0,0)", _.style.width = Math.max(12, E.x - S.x).toFixed(2) + "px");
  };
  S.on(z), E.on(z);
  const x = (se) => {
    const de = k[e(d)];
    if (!de || !_) {
      _ && (_.style.opacity = 0);
      return;
    }
    _.style.opacity = 1;
    const U = de.offsetLeft, re = de.offsetLeft + de.offsetWidth;
    se ? (S.set(U), E.set(re)) : (S.to(U), E.to(re));
  };
  $t(() => {
    e(d), e(r).length, queueMicrotask(() => x(!1));
  }), oa(() => {
    setTimeout(() => x(!0), 30);
  });
  function A(se, de) {
    const U = k[se];
    U && (U.style.width = (f * de).toFixed(2) + "px", U.style.height = (f * de).toFixed(2) + "px", U.firstElementChild.style.transform = "scale(" + (0.9 + 0.1 * de).toFixed(3) + ")");
  }
  function j() {
    e(r).forEach((se, de) => {
      if (!b[de]) {
        const U = new ks(1, { k: 300, c: 30, eps: 2e-3 });
        U.on((re) => {
          A(de, re), x(!0);
        }), b[de] = U;
      }
    });
  }
  function O(se) {
    j(), e(r).forEach((de, U) => {
      const re = k[U];
      if (!re) return;
      const ke = re.getBoundingClientRect(), F = Math.abs(se.clientX - (ke.left + ke.width / 2));
      b[U].to(1 + u * Math.exp(-((F / m) ** 2)));
    });
  }
  function H() {
    b.forEach((se) => se && se.to(1));
  }
  var I = uu(), w = l(I), $ = l(w);
  _a($, (se) => _ = se, () => _);
  var B = n($, 2);
  Ve(B, 17, () => e(r), _t, (se, de, U) => {
    var re = /* @__PURE__ */ P(() => Ns(e(de), 3));
    let ke = () => e(re)[0], F = () => e(re)[1], ne = () => e(re)[2];
    var V = cu();
    let ye;
    var Se = l(V), Re = l(Se);
    oe(Re, {
      get name() {
        return ne();
      },
      size: 23
    });
    var $e = n(Se, 2), Ye = C($e, !0);
    _a(V, (ce, J) => k[J] = ce, (ce) => k?.[ce], () => [U]), L(() => {
      Be(V, "aria-label", F()), ye = je(V, 1, "svelte-1njg66l", null, ye, { on: e(o) === ke() }), T(Ye, F());
    }), y("click", V, (ce) => {
      Da(ke()), ce.currentTarget.blur();
    }), v(se, V);
  }), _a(w, (se) => p = se, () => p);
  var te = n(w, 2);
  {
    var he = (se) => {
      var de = du(), U = n(we(de), 2), re = n(l(U)), ke = l(re), F = C(ke, !0), ne = n(ke), V = C(ne, !0);
      L(() => {
        Be(U, "title", "Playing " + e(i).name), T(F, c.running.starting ? "Starting" : "Playing"), T(V, e(i).name);
      }), y("click", U, (ye) => {
        Da("game", c.running.id), ye.currentTarget.blur();
      }), v(se, de);
    };
    M(te, (se) => {
      e(i) && se(he);
    });
  }
  y("pointermove", I, O), xa("pointerleave", I, H), v(t, I), Lt();
}
Wt(["pointermove", "click"]);
var hu = /* @__PURE__ */ h('<span class="svelte-vprbkf"> </span>'), pu = /* @__PURE__ */ h('<div class="logo svelte-vprbkf"><span class="ring svelte-vprbkf"></span><span class="ring r2 svelte-vprbkf"></span><img src="/icon.png" alt="" draggable="false" class="svelte-vprbkf"/></div> <h1 class="big svelte-vprbkf"></h1>', 1), mu = /* @__PURE__ */ h('<h2 class="svelte-vprbkf"> </h2>'), gu = /* @__PURE__ */ h('<button><span class="ic svelte-vprbkf"><!></span></button>'), _u = /* @__PURE__ */ h('<div class="demo dockdemo svelte-vprbkf"><div class="mdock svelte-vprbkf"><div class="blob svelte-vprbkf"></div> <!></div></div>'), bu = /* @__PURE__ */ h('<div class="demo springs svelte-vprbkf"><div class="btns svelte-vprbkf"><button class="btn primary svelte-vprbkf">Press me</button><button class="btn svelte-vprbkf">And me</button><button class="btn svelte-vprbkf">Squash</button></div> <div class="pad svelte-vprbkf"><div class="drag svelte-vprbkf" role="button" tabindex="-1" aria-label="A card to drag"><!><b class="svelte-vprbkf">Drag me</b></div></div></div>'), yu = /* @__PURE__ */ h('<div class="srow svelte-vprbkf"><i class="svelte-vprbkf"></i><span class="svelte-vprbkf"> </span><em class="svelte-vprbkf"></em></div>'), wu = /* @__PURE__ */ h('<div class="demo sbox svelte-vprbkf"><div class="sh svelte-vprbkf"><b class="svelte-vprbkf">Your library</b><span class="svelte-vprbkf">12 games</span></div> <div class="sscroll svelte-vprbkf"><div class="stretch svelte-vprbkf"></div></div></div>'), ku = /* @__PURE__ */ h('<div class="demo makeit svelte-vprbkf"><div class="mk svelte-vprbkf"><div class="sw s1 svelte-vprbkf"></div><div class="sw s2 svelte-vprbkf"></div><div class="sw s3 svelte-vprbkf"></div><b class="svelte-vprbkf">Themes</b><small class="svelte-vprbkf">Ready-made looks</small></div> <div class="mk svelte-vprbkf"><div class="sw m1 svelte-vprbkf"></div><div class="sw m2 svelte-vprbkf"></div><div class="sw m3 svelte-vprbkf"></div><b class="svelte-vprbkf">Modules</b><small class="svelte-vprbkf">Your colours, corners and logo</small></div> <button class="btn svelte-vprbkf"><!>Open Customise</button></div>'), xu = /* @__PURE__ */ h('<div class="hint svelte-vprbkf"><!> </div>'), Su = /* @__PURE__ */ h('<div class="step svelte-vprbkf"><!> <p class="muted svelte-vprbkf"> </p> <!> <!></div>'), Mu = /* @__PURE__ */ h("<i></i>"), Tu = /* @__PURE__ */ h('<button class="btn svelte-vprbkf">Back</button>'), Lu = /* @__PURE__ */ h('<div class="back svelte-vprbkf" role="dialog" aria-modal="true" aria-label="Tour of the 27.1 interface"><div class="orbs svelte-vprbkf" aria-hidden="true"><i class="svelte-vprbkf"></i><i class="svelte-vprbkf"></i></div> <div class="panel svelte-vprbkf"><div class="stage svelte-vprbkf"><!></div> <div class="dots svelte-vprbkf" aria-hidden="true"></div> <div class="foot svelte-vprbkf"><button class="btn svelte-vprbkf"> </button> <div class="grow svelte-vprbkf"></div> <!> <button class="btn primary svelte-vprbkf"> </button></div></div></div>');
function zu(t, a) {
  Tt(a, !0);
  const s = [
    {
      t: "Welcome to 27.1",
      d: "A new way to move around SteamLite. Everything here reacts to you: it swells, squashes, stretches and springs back. This takes under a minute, and you can try each part."
    },
    {
      t: "A dock that follows you",
      d: "The sidebar is now a floating dock. Icons swell toward the pointer and push their neighbours aside, and the highlight stretches from one icon to the next.",
      h: "Move your mouse over the dock, then click an icon."
    },
    {
      t: "Everything springs",
      d: "Buttons squash when you press them and spring back. Panels and covers lean toward the pointer. Nothing just appears: it arrives.",
      h: "Press the buttons, then drag the card and let go."
    },
    {
      t: "Stretchy scrolling",
      d: "Scrolling glides, and at the top and bottom the page stretches like rubber. The title and controls at the top of a page stay where they are while the content moves.",
      h: "Scroll inside the box, past either end."
    },
    {
      t: "Make it yours",
      d: "Customise has themes and modules: your own colours, corners, logos and backgrounds, shared on GitHub. A module can even include a theme.",
      h: "If anything ever misbehaves, press Ctrl + Alt + Shift + U to go back to the normal interface."
    }
  ];
  let r = /* @__PURE__ */ G(0);
  const i = (Z) => {
    Z > e(r), g(r, Math.max(0, Math.min(s.length - 1, Z)), !0);
  }, o = /* @__PURE__ */ P(() => e(r) === s.length - 1);
  function d(Z) {
    Z.key === "Escape" ? a.onclose() : Z.key === "ArrowRight" || Z.key === "Enter" ? e(o) ? a.onclose() : i(e(r) + 1) : Z.key === "ArrowLeft" && i(e(r) - 1);
  }
  const f = ["home", "library", "news", "chart", "sliders", "cog"];
  let u = /* @__PURE__ */ G(1), m, p, _ = Ct([]), k = [];
  const b = 52, S = 0.3, E = 66, z = new ks(0, { k: 360, c: 30, eps: 0.1 }), x = new ks(0, { k: 260, c: 27, eps: 0.1 }), A = () => {
    p && (p.style.transform = "translate3d(" + z.x.toFixed(2) + "px,0,0)", p.style.width = Math.max(12, x.x - z.x).toFixed(2) + "px");
  };
  z.on(A), x.on(A);
  const j = (Z) => {
    const W = _[e(u)];
    if (!W || !p) return;
    const ee = W.offsetLeft, pe = ee + W.offsetWidth;
    Z ? (z.set(ee), x.set(pe)) : (z.to(ee), x.to(pe));
  };
  function O(Z, W) {
    const ee = _[Z];
    ee && (ee.style.width = ee.style.height = (b * W).toFixed(2) + "px", ee.firstElementChild.style.transform = "scale(" + (0.9 + 0.1 * W).toFixed(3) + ")");
  }
  function H() {
    f.forEach((Z, W) => {
      if (!k[W]) {
        const ee = new ks(1, { k: 300, c: 30, eps: 2e-3 });
        ee.on((pe) => {
          O(W, pe), j(!0);
        }), k[W] = ee;
      }
    });
  }
  function I(Z) {
    H(), f.forEach((W, ee) => {
      const pe = _[ee];
      if (!pe) return;
      const R = pe.getBoundingClientRect(), ge = Math.abs(Z.clientX - (R.left + R.width / 2));
      k[ee].to(1 + S * Math.exp(-((ge / E) ** 2)));
    });
  }
  const w = () => k.forEach((Z) => Z && Z.to(1));
  let $, B = !1, te = 0, he = 0;
  const se = new ks(0, { k: 150, c: 11, eps: 0.05 }), de = new ks(0, { k: 150, c: 11, eps: 0.05 }), U = () => {
    if (!$) return;
    const Z = Math.hypot(se.x, de.x), W = Math.min(0.42, Z / 520), ee = Math.atan2(de.x, se.x);
    $.style.transform = "translate3d(" + se.x.toFixed(1) + "px," + de.x.toFixed(1) + "px,0) rotate(" + ee.toFixed(3) + "rad) scale(" + (1 + W).toFixed(3) + "," + (1 / (1 + W * 0.8)).toFixed(3) + ") rotate(" + (-ee).toFixed(3) + "rad)";
  };
  se.on(U), de.on(U);
  const re = (Z) => {
    B = !0, te = Z.clientX - se.x, he = Z.clientY - de.x, $.setPointerCapture(Z.pointerId), se.t = se.x, de.t = de.x;
  }, ke = (Z) => {
    if (!B) return;
    const W = Z.clientX - te, ee = Z.clientY - he, pe = 0.6;
    se.set(W * pe), de.set(ee * pe);
  }, F = () => {
    B && (B = !1, se.to(0), de.to(0));
  };
  oa(() => {
    addEventListener("keydown", d, !0);
    const Z = setTimeout(() => j(!0), 60);
    return () => {
      removeEventListener("keydown", d, !0), clearTimeout(Z);
    };
  }), $t(() => {
    e(r) === 1 && setTimeout(() => j(!0), 30);
  });
  const ne = [
    "Counter-Strike 2",
    "Dota 2",
    "ELDEN RING",
    "Cyberpunk 2077",
    "The Witcher 3",
    "Terraria",
    "Stardew Valley",
    "Red Dead Redemption 2",
    "Don't Starve",
    "Hades",
    "Portal 2",
    "Hollow Knight"
  ];
  var V = Lu(), ye = n(l(V), 2), Se = l(ye), Re = l(Se);
  is(Re, () => e(r), (Z) => {
    var W = Su(), ee = l(W);
    {
      var pe = (De) => {
        var Ge = pu(), We = n(we(Ge), 2);
        Ve(We, 20, () => "SteamLite 27.1".split(""), _t, (Je, vt, Q) => {
          var xe = hu();
          dt(xe, `--n:${Q}`);
          var Te = C(xe, !0);
          L(() => T(Te, vt === " " ? " " : vt)), v(Je, xe);
        }), v(De, Ge);
      }, R = (De) => {
        var Ge = mu(), We = C(Ge, !0);
        L(() => T(We, s[e(r)].t)), v(De, Ge);
      };
      M(ee, (De) => {
        e(r) === 0 ? De(pe) : De(R, -1);
      });
    }
    var ge = n(ee, 2), be = C(ge, !0), N = n(ge, 2);
    {
      var ae = (De) => {
        var Ge = _u(), We = l(Ge), Je = l(We);
        _a(Je, (Q) => p = Q, () => p);
        var vt = n(Je, 2);
        Ve(vt, 17, () => f, _t, (Q, xe, Te) => {
          var tt = gu();
          let He;
          var lt = l(tt), ut = l(lt);
          oe(ut, {
            get name() {
              return e(xe);
            },
            size: 23
          }), _a(tt, (it, jt) => _[jt] = it, (it) => _?.[it], () => [Te]), L(() => {
            Be(tt, "aria-label", e(xe)), He = je(tt, 1, "svelte-vprbkf", null, He, { on: e(u) === Te });
          }), y("click", tt, () => {
            g(u, Te, !0), j(!1);
          }), v(Q, tt);
        }), _a(We, (Q) => m = Q, () => m), y("pointermove", We, I), xa("pointerleave", We, w), v(De, Ge);
      }, ie = (De) => {
        var Ge = bu(), We = n(l(Ge), 2), Je = l(We), vt = l(Je);
        oe(vt, { name: "library", size: 26 }), _a(Je, (Q) => $ = Q, () => $), y("pointerdown", Je, re), y("pointermove", Je, ke), y("pointerup", Je, F), xa("pointercancel", Je, F), v(De, Ge);
      }, me = (De) => {
        var Ge = wu(), We = n(l(Ge), 2), Je = l(We);
        Ve(Je, 21, () => ne, _t, (vt, Q, xe) => {
          var Te = yu(), tt = l(Te);
          dt(tt, `--h:${xe * 47 % 360}`);
          var He = n(tt), lt = C(He, !0), ut = n(He);
          ut.textContent = `${(xe * 7 + 3) % 40} h`, L(() => T(lt, e(Q))), v(vt, Te);
        }), zt(We, (vt) => No?.(vt)), v(De, Ge);
      }, Me = (De) => {
        var Ge = ku(), We = n(l(Ge), 4), Je = l(We);
        oe(Je, { name: "sliders", size: 16 }), y("click", We, () => {
          a.onclose(), Da("customise");
        }), v(De, Ge);
      };
      M(N, (De) => {
        e(r) === 1 ? De(ae) : e(r) === 2 ? De(ie, 1) : e(r) === 3 ? De(me, 2) : e(r) === 4 && De(Me, 3);
      });
    }
    var Ae = n(N, 2);
    {
      var Ie = (De) => {
        var Ge = xu(), We = l(Ge);
        oe(We, { name: "check", size: 14 });
        var Je = n(We, 1, !0);
        L(() => T(Je, s[e(r)].h)), v(De, Ge);
      };
      M(Ae, (De) => {
        s[e(r)].h && De(Ie);
      });
    }
    L(() => T(be, s[e(r)].d)), bt(1, W, () => Do, () => ({ duration: 800 })), v(Z, W);
  });
  var $e = n(Se, 2);
  Ve($e, 21, () => s, _t, (Z, W, ee) => {
    var pe = Mu();
    let R;
    L(() => R = je(pe, 1, "svelte-vprbkf", null, R, { on: ee === e(r) })), v(Z, pe);
  });
  var Ye = n($e, 2), ce = l(Ye), J = C(ce, !0), q = n(ce, 4);
  {
    var D = (Z) => {
      var W = Tu();
      y("click", W, () => i(e(r) - 1)), v(Z, W);
    };
    M(q, (Z) => {
      e(r) > 0 && Z(D);
    });
  }
  var X = n(q, 2), fe = C(X, !0);
  L(() => {
    T(J, e(o) ? "Close" : "Skip the tour"), T(fe, e(o) ? "Start using 27.1" : e(r) === 0 ? "Take the tour" : "Next");
  }), y("click", ce, function(...Z) {
    a.onclose?.apply(this, Z);
  }), y("click", X, () => e(o) ? a.onclose() : i(e(r) + 1)), bt(3, V, () => ha, () => ({ duration: 260 })), v(t, V), Lt();
}
Wt(["pointermove", "click", "pointerdown", "pointerup"]);
var Cu = /* @__PURE__ */ h('<span class="b svelte-1gl3gsj">.beta</span>'), Eu = /* @__PURE__ */ h('<span class="ver"> <!></span>');
function Sr(t, a) {
  Tt(a, !0);
  let s = Dt(a, "v", 3, "");
  const r = /* @__PURE__ */ P(() => /\.beta$/i.test(s())), i = /* @__PURE__ */ P(() => s().replace(/\.beta$/i, ""));
  var o = Eu(), d = l(o), f = n(d);
  {
    var u = (m) => {
      var p = Cu();
      v(m, p);
    };
    M(f, (m) => {
      e(r) && m(u);
    });
  }
  L(() => T(d, e(i))), v(t, o), Lt();
}
var Au = /* @__PURE__ */ h('<span class="svelte-dkdjar"> </span>'), Iu = /* @__PURE__ */ h('<div class="splash svelte-dkdjar"><div class="orbs svelte-dkdjar" aria-hidden="true"><i class="svelte-dkdjar"></i><i class="svelte-dkdjar"></i><i class="svelte-dkdjar"></i></div> <div class="grid svelte-dkdjar" aria-hidden="true"></div> <div class="center svelte-dkdjar"><div class="mark svelte-dkdjar"><span class="ring svelte-dkdjar"></span><span class="ring r2 svelte-dkdjar"></span><img src="/icon.png" alt="SteamLite" draggable="false" class="svelte-dkdjar"/></div> <h1 aria-label="SteamLite" class="svelte-dkdjar"></h1> <div class="tag svelte-dkdjar">Your Steam library</div> <div class="ver svelte-dkdjar"><!></div> <div class="bar svelte-dkdjar"><i class="svelte-dkdjar"></i></div></div></div>');
function Pu(t, a) {
  Tt(a, !0);
  let s = Dt(a, "duration", 3, 2500);
  const r = "SteamLite".split("");
  oa(() => {
    const p = setTimeout(() => a.ondone && a.ondone(), s());
    return () => clearTimeout(p);
  });
  var i = Iu(), o = n(l(i), 4), d = n(l(o), 2);
  Ve(d, 21, () => r, _t, (p, _, k) => {
    var b = Au();
    dt(b, `--i:${k}`);
    var S = C(b, !0);
    L(() => T(S, e(_))), v(p, b);
  });
  var f = n(d, 4), u = l(f);
  {
    var m = (p) => {
      Sr(p, {
        get v() {
          return c.version;
        }
      });
    };
    M(u, (p) => {
      c.version && p(m);
    });
  }
  L(() => dt(i, `--d:${s() ?? ""}ms`)), bt(2, i, () => ha, () => ({ duration: 500 })), v(t, i), Lt();
}
function Wo(t, { from: a, to: s }, r = {}) {
  var { delay: i = 0, duration: o = (I) => Math.sqrt(I) * 120, easing: d = Jc } = r, f = getComputedStyle(t), u = f.transform === "none" ? "" : f.transform, [m, p] = f.transformOrigin.split(" ").map(parseFloat);
  m /= t.clientWidth, p /= t.clientHeight;
  var _ = Du(t), k = t.clientWidth / s.width / _, b = t.clientHeight / s.height / _, S = a.left + a.width * m, E = a.top + a.height * p, z = s.left + s.width * m, x = s.top + s.height * p, A = (S - z) * k, j = (E - x) * b, O = a.width / s.width, H = a.height / s.height;
  return {
    delay: i,
    duration: typeof o == "function" ? o(Math.sqrt(A * A + j * j)) : o,
    easing: d,
    css: (I, w) => {
      var $ = w * A, B = w * j, te = I + w * O, he = I + w * H;
      return `transform: ${u} translate(${$}px, ${B}px) scale(${te}, ${he});`;
    }
  };
}
function Du(t) {
  if ("currentCSSZoom" in t)
    return (
      /** @type {number} */
      t.currentCSSZoom
    );
  for (var a = t, s = 1; a !== null; )
    s *= +getComputedStyle(a).zoom, a = /** @type {Element | null} */
    a.parentElement;
  return s;
}
var Nu = /* @__PURE__ */ h('<button class="act svelte-4089l0"> </button>'), Ou = /* @__PURE__ */ h('<div><i class="svelte-4089l0"></i><span> </span><!></div>'), qu = /* @__PURE__ */ h('<div class="t svelte-4089l0"></div>');
function ju(t, a) {
  Tt(a, !1), An();
  var s = qu();
  Ve(s, 13, () => c.toasts, (r) => r.id, (r, i) => {
    var o = Ou(), d = n(l(o)), f = C(d, !0), u = n(d);
    {
      var m = (p) => {
        var _ = Nu(), k = C(_, !0);
        L(() => T(k, e(i).action.label)), y("click", _, () => {
          e(i).action.fn(), id(e(i).id);
        }), v(p, _);
      };
      M(u, (p) => {
        e(i).action && p(m);
      });
    }
    L(() => {
      je(o, 1, `toast glass ${e(i).kind ?? ""}`, "svelte-4089l0"), T(f, e(i).text);
    }), po(o, () => Wo, () => ({ duration: 300 })), bt(1, o, () => La, () => ({ x: 60, duration: 500, easing: Kc })), bt(2, o, () => La, () => ({ x: 40, duration: 260, easing: Xc })), v(r, o);
  }), v(t, s), Lt();
}
Wt(["click"]);
var rl = /* @__PURE__ */ h('<div class="err svelte-z3vq2p"> </div>'), Hu = /* @__PURE__ */ h('<button class="btn">Continue for now</button>'), Ru = /* @__PURE__ */ h('<button class="btn">Cancel</button>'), $u = /* @__PURE__ */ h(`<div class="col svelte-z3vq2p"><button class="steam svelte-z3vq2p"><img src="/icon.png" alt="" draggable="false" class="svelte-z3vq2p"/> </button> <p class="muted small svelte-z3vq2p">This opens Steam's own sign-in page in your browser. SteamLite never sees your password.</p> <!> <!> <!></div>`), Fu = /* @__PURE__ */ h('<div class="col wait svelte-z3vq2p"><div class="ring svelte-z3vq2p" aria-hidden="true"><i class="svelte-z3vq2p"></i><img src="/icon.png" alt="" draggable="false" class="svelte-z3vq2p"/></div> <b>Waiting for you to sign in on Steam...</b> <p class="muted small svelte-z3vq2p">Finish signing in in your browser. This page updates by itself.</p> <div class="row svelte-z3vq2p"><button class="btn sm"><!>Open the page again</button><button class="btn sm">Cancel</button></div></div>'), Bu = /* @__PURE__ */ h('<div class="col svelte-z3vq2p"><b> </b> <p class="muted small svelte-z3vq2p">SteamLite needs a free Steam Web API key to read your library. Paste it here once. It is saved for your account.</p> <input type="password" placeholder="32 letters and numbers" autocomplete="off"/> <a class="hint svelte-z3vq2p" href="#top">Get a free API key from Steam<!></a> <!> <button class="btn primary big"> </button></div>'), Gu = /* @__PURE__ */ h('<div class="col svelte-z3vq2p"><b>Signed in.</b></div>'), Wu = /* @__PURE__ */ h('<div class="sl svelte-z3vq2p"><!></div>');
function Yo(t, a) {
  Tt(a, !0);
  let s = Dt(a, "keep", 3, !1), r = Dt(a, "allowSkip", 3, !1), i = /* @__PURE__ */ G("idle"), o = /* @__PURE__ */ G(""), d = /* @__PURE__ */ G(""), f = /* @__PURE__ */ G(""), u = /* @__PURE__ */ G(!1), m = /* @__PURE__ */ G(!1), p = 0;
  async function _() {
    g(o, ""), g(m, !1), g(u, !0);
    const w = await ve("account:steamLogin", { keep: s() });
    if (g(u, !1), !w.ok) {
      g(o, w.error || "SteamLite could not start the sign-in. Check your internet connection and try again.", !0), g(m, !!w.unreachable);
      return;
    }
    g(i, "waiting"), k();
  }
  function k() {
    clearInterval(p), p = setInterval(
      async () => {
        let w;
        try {
          w = await ve("account:steamLoginCheck");
        } catch {
          return;
        }
        if (w.expired) {
          clearInterval(p), g(i, "idle"), g(o, 'The sign-in was not finished in the browser in time. Press "Sign in with Steam" to try again.');
          return;
        }
        w.done && (clearInterval(p), b(w));
      },
      1800
    );
  }
  function b(w) {
    if (w.failed) {
      g(i, "idle"), g(o, w.error || 'Steam did not confirm the sign-in. Press "Sign in with Steam" to try again and finish it in the browser window.', !0);
      return;
    }
    if (w.needKey) {
      g(i, "key"), g(d, w.name || "", !0), g(o, w.error || "", !0);
      return;
    }
    g(i, "done"), a.onDone && a.onDone(w);
  }
  async function S() {
    g(u, !0), g(o, "");
    const w = await ve("account:saveKey", { key: e(f) });
    g(u, !1), b(w);
  }
  async function E() {
    clearInterval(p), await ve("account:steamLoginCancel"), g(i, "idle"), g(o, ""), a.onCancel && a.onCancel();
  }
  const z = (w, $) => {
    w.preventDefault(), ve("app:openUrl", $);
  };
  nn(() => clearInterval(p));
  var x = Wu(), A = l(x);
  {
    var j = (w) => {
      var $ = $u(), B = l($), te = n(l(B), 1, !0), he = n(B, 4);
      {
        var se = (F) => {
          var ne = rl(), V = C(ne, !0);
          L(() => T(V, e(o))), v(F, ne);
        };
        M(he, (F) => {
          e(o) && F(se);
        });
      }
      var de = n(he, 2);
      {
        var U = (F) => {
          var ne = Hu();
          y("click", ne, () => a.onSkip && a.onSkip()), v(F, ne);
        };
        M(de, (F) => {
          e(m) && r() && F(U);
        });
      }
      var re = n(de, 2);
      {
        var ke = (F) => {
          var ne = Ru();
          y("click", ne, () => a.onCancel && a.onCancel()), v(F, ne);
        };
        M(re, (F) => {
          s() && F(ke);
        });
      }
      L(() => {
        B.disabled = e(u), T(te, e(u) ? "Opening Steam..." : s() ? "Add an account with Steam" : "Sign in with Steam");
      }), y("click", B, _), bt(1, $, () => ha, () => ({ duration: 250 })), v(w, $);
    }, O = (w) => {
      var $ = Fu(), B = n(l($), 6), te = l(B), he = l(te);
      oe(he, { name: "ext", size: 15 });
      var se = n(te);
      y("click", te, () => ve("account:steamLoginReopen")), y("click", se, E), bt(1, $, () => Bs, () => ({ start: 0.96, duration: 400, easing: ca })), v(w, $);
    }, H = (w) => {
      var $ = Bu(), B = l($), te = C(B), he = n(B, 4), se = n(he, 2), de = n(l(se));
      oe(de, { name: "ext", size: 13 });
      var U = n(se, 2);
      {
        var re = (ne) => {
          var V = rl(), ye = C(V, !0);
          L(() => T(ye, e(o))), v(ne, V);
        };
        M(U, (ne) => {
          e(o) && ne(re);
        });
      }
      var ke = n(U, 2), F = C(ke, !0);
      L(() => {
        T(te, `${e(d) ? "Welcome, " + e(d) + "." : "Signed in."} One more step.`), ke.disabled = e(u) || !e(f), T(F, e(u) ? "Saving..." : "Continue");
      }), ia(he, () => e(f), (ne) => g(f, ne)), y("click", se, (ne) => z(ne, "https://steamcommunity.com/dev/apikey")), y("click", ke, S), bt(1, $, () => ha, () => ({ duration: 250 })), v(w, $);
    }, I = (w) => {
      var $ = Gu();
      bt(1, $, () => ha, () => ({ duration: 250 })), v(w, $);
    };
    M(A, (w) => {
      e(i) === "idle" ? w(j) : e(i) === "waiting" ? w(O, 1) : e(i) === "key" ? w(H, 2) : w(I, -1);
    });
  }
  v(t, x), Lt();
}
Wt(["click"]);
var Oa = bo(() => c), Yu = /* @__PURE__ */ h('<div class="back svelte-1x5nu92" role="presentation"><div class="dlg glass svelte-1x5nu92" role="dialog" tabindex="-1" aria-label="Add an account"><button class="x btn icon sm svelte-1x5nu92" aria-label="Close"><!></button> <img class="logo svelte-1x5nu92" src="/icon.png" alt="" draggable="false"/> <h2 class="svelte-1x5nu92">Add an account</h2> <p class="muted svelte-1x5nu92">Sign in with another Steam account. Each account keeps its own play time and favorites, and you can switch between them from your picture at the top right.</p> <!></div></div>');
function Uu(t, a) {
  Tt(a, !1);
  const s = () => {
    ve("account:steamLoginCancel"), Oa(Oa().addAccount = !1);
  };
  async function r(m) {
    Oa(Oa().steamId = m.steamId || (await ve("app:boot")).steamId), Oa(Oa().games = []), Oa(Oa().favorites = []), Oa(Oa().hidden = []), Oa(Oa().collections = {}), await Ms(), Fa(), Oa(Oa().addAccount = !1), yt("Added " + (m.name || "the account") + ".");
  }
  An();
  var i = Yu(), o = l(i), d = l(o), f = l(d);
  oe(f, { name: "x", size: 16 });
  var u = n(d, 8);
  Yo(u, { keep: !0, onDone: r, onCancel: s }), zt(i, (m, p) => Gs?.(m, p), () => s), y("click", i, s), y("click", o, (m) => m.stopPropagation()), y("keydown", o, () => {
  }), y("click", d, s), bt(1, o, () => Bs, () => ({ start: 0.92, duration: 450, easing: ca })), bt(3, i, () => ha, () => ({ duration: 250 })), v(t, i), Lt();
}
Wt(["click", "keydown"]);
var Vu = /* @__PURE__ */ h('<div class="back svelte-124xt8o" role="presentation"><div class="dlg glass svelte-124xt8o" role="alertdialog" tabindex="-1" aria-label="Close SteamLite?"><span class="ic svelte-124xt8o"><!></span> <h2 class="svelte-124xt8o">Close SteamLite?</h2> <p class="muted svelte-124xt8o"><b> </b> is still running. If you close SteamLite now, it stops counting your play time for this session.</p> <div class="row svelte-124xt8o"><button class="btn">Keep playing</button><button class="btn danger">Close anyway</button></div></div></div>');
function Ku(t, a) {
  Tt(a, !0);
  const s = /* @__PURE__ */ P(() => c.running && (xr(c.running.id) || {}).name || c.running && c.running.name || "your game"), r = () => {
    c.confirmClose = !1;
  }, i = () => window.sl.close();
  var o = Vu(), d = l(o), f = l(d), u = l(f);
  oe(u, { name: "stop", size: 22 });
  var m = n(f, 4), p = l(m), _ = C(p, !0), k = n(m, 2), b = l(k), S = n(b);
  zt(o, (E, z) => Gs?.(E, z), () => r), L(() => T(_, e(s))), y("click", o, r), y("click", d, (E) => E.stopPropagation()), y("keydown", d, () => {
  }), y("click", b, r), y("click", S, i), bt(1, d, () => Bs, () => ({ start: 0.92, duration: 420, easing: ca })), bt(3, o, () => ha, () => ({ duration: 220 })), v(t, o), Lt();
}
Wt(["click", "keydown"]);
var Xu = /* @__PURE__ */ h('<li class="svelte-1yltabx"></li>'), Ju = /* @__PURE__ */ h('<h4 class="svelte-1yltabx"></h4>'), Zu = /* @__PURE__ */ h('<p class="muted svelte-1yltabx"></p>'), Qu = /* @__PURE__ */ h('<ul class="svelte-1yltabx"></ul>'), ef = /* @__PURE__ */ h('<p class="muted svelte-1yltabx">This version has no release notes yet.</p>'), tf = /* @__PURE__ */ h('<div class="grow"><b>Downloaded.</b><div class="muted">SteamLite is closing and the installer is opening. Your settings and data are kept.</div></div> <button class="btn primary big">Open the installer</button>', 1), af = /* @__PURE__ */ h('<div class="grow"><b> </b><div class="track svelte-1yltabx"><i class="svelte-1yltabx"></i></div></div> <button class="btn">Hide</button>', 1), sf = /* @__PURE__ */ h('<div class="grow muted">Your settings and data are kept.</div> <button class="btn">Later</button> <button class="btn primary big"><!>Update now</button>', 1), rf = /* @__PURE__ */ h(`<div class="back svelte-1yltabx" role="presentation"><div class="dlg glass svelte-1yltabx" role="dialog" tabindex="-1" aria-label="Update available"><div class="head svelte-1yltabx"><span class="ic svelte-1yltabx"><!></span> <div class="grow"><div class="eyebrow">Update available</div> <h2 class="svelte-1yltabx">SteamLite <!></h2> <div class="vers muted svelte-1yltabx">You have <!> <!> <b><!></b></div></div> <button class="btn icon sm" aria-label="Close"><!></button></div> <div class="notes svelte-1yltabx"><h3 class="svelte-1yltabx">What's new</h3> <!></div> <div class="foot svelte-1yltabx"><!></div></div></div>`);
function nf(t, a) {
  Tt(a, !0);
  const s = /* @__PURE__ */ P(() => ed(c.update && c.update.notes)), r = /* @__PURE__ */ P(() => c.updateState === "downloading");
  async function i() {
    c.updateState = "downloading", c.updatePct = 0;
    const re = await ve("update:install");
    if (!re.ok) {
      c.updateState = "", yt(re.error || "The update could not be downloaded.", "bad");
      return;
    }
    o();
  }
  async function o() {
    await ve("update:restart") || yt("Could not start the installer.", "bad");
  }
  const d = () => {
    c.updateHidden = !0;
  };
  var f = rf(), u = l(f), m = l(u), p = l(m), _ = l(p);
  oe(_, { name: "download", size: 26 });
  var k = n(p, 2), b = n(l(k), 2), S = n(l(b));
  Sr(S, {
    get v() {
      return c.update.version;
    }
  });
  var E = n(b, 2), z = n(l(E));
  Sr(z, {
    get v() {
      return c.version;
    }
  });
  var x = n(z, 2);
  oe(x, { name: "back", size: 13 });
  var A = n(x, 2), j = l(A);
  Sr(j, {
    get v() {
      return c.update.version;
    }
  });
  var O = n(k, 2), H = l(O);
  oe(H, { name: "x", size: 16 });
  var I = n(m, 2), w = n(l(I), 2);
  {
    var $ = (re) => {
      var ke = Qu();
      Ve(ke, 21, () => e(s), _t, (F, ne) => {
        var V = ta(), ye = we(V);
        {
          var Se = (Ye) => {
            var ce = Xu();
            Wa(ce, () => e(ne).html, !0), v(Ye, ce);
          }, Re = (Ye) => {
            var ce = Ju();
            Wa(ce, () => e(ne).html, !0), v(Ye, ce);
          }, $e = (Ye) => {
            var ce = Zu();
            Wa(ce, () => e(ne).html, !0), v(Ye, ce);
          };
          M(ye, (Ye) => {
            e(ne).t === "li" ? Ye(Se) : e(ne).t === "h" ? Ye(Re, 1) : Ye($e, -1);
          });
        }
        v(F, V);
      }), v(re, ke);
    }, B = (re) => {
      var ke = ef();
      v(re, ke);
    };
    M(w, (re) => {
      e(s).length ? re($) : re(B, -1);
    });
  }
  var te = n(I, 2), he = l(te);
  {
    var se = (re) => {
      var ke = tf(), F = n(we(ke), 2);
      y("click", F, o), v(re, ke);
    }, de = (re) => {
      var ke = af(), F = we(ke), ne = l(F), V = C(ne), ye = n(ne), Se = C(ye), Re = n(F, 2);
      L(() => {
        T(V, `Downloading ${c.updatePct ?? ""}%`), dt(Se, `width:${c.updatePct ?? ""}%`);
      }), y("click", Re, d), v(re, ke);
    }, U = (re) => {
      var ke = sf(), F = n(we(ke), 2), ne = n(F, 2), V = l(ne);
      oe(V, { name: "download", size: 18 }), y("click", F, d), y("click", ne, i), v(re, ke);
    };
    M(he, (re) => {
      c.updateState === "ready" ? re(se) : e(r) ? re(de, 1) : re(U, -1);
    });
  }
  zt(f, (re, ke) => Gs?.(re, ke), () => d), y("click", f, d), y("click", u, (re) => re.stopPropagation()), y("keydown", u, () => {
  }), y("click", O, d), bt(1, u, () => Bs, () => ({ start: 0.93, duration: 480, easing: ca })), bt(3, f, () => ha, () => ({ duration: 250 })), v(t, f), Lt();
}
Wt(["click", "keydown"]);
var Ma = bo(() => c), lf = /* @__PURE__ */ h('<button class="btn primary">Open the installer</button>'), of = /* @__PURE__ */ h('<div class="track svelte-1hg8ima"><i class="svelte-1hg8ima"></i></div>'), vf = /* @__PURE__ */ h('<button class="btn primary">Update</button><button class="btn">Later</button>', 1), cf = /* @__PURE__ */ h('<div class="wrap svelte-1hg8ima"><div class="bar glass svelte-1hg8ima"><span class="ic svelte-1hg8ima"><!></span> <div class="grow"><b> </b> <div class="muted"> </div></div> <!></div></div>');
function df(t, a) {
  Tt(a, !1);
  async function s() {
    Ma(Ma().updateState = "downloading"), Ma(Ma().updatePct = 0);
    const f = await ve("update:install");
    if (!f.ok) {
      Ma(Ma().updateState = ""), yt(f.error || "The update could not be downloaded.", "bad");
      return;
    }
    r();
  }
  async function r() {
    await ve("update:restart") || yt("Could not start the installer.", "bad");
  }
  An();
  var i = ta(), o = we(i);
  {
    var d = (f) => {
      var u = cf(), m = l(u), p = l(m), _ = l(p);
      oe(_, { name: "download", size: 19 });
      var k = n(p, 2), b = l(k), S = C(b), E = n(b, 2), z = C(E, !0), x = n(k, 2);
      {
        var A = (H) => {
          var I = lf();
          y("click", I, r), v(H, I);
        }, j = (H) => {
          var I = of(), w = C(I);
          L(() => dt(w, `width:${Ma().updatePct ?? ""}%`)), v(H, I);
        }, O = (H) => {
          var I = vf(), w = we(I), $ = n(w);
          y("click", w, s), y("click", $, () => Ma(Ma().update = null)), v(H, I);
        };
        M(x, (H) => {
          Ma().updateState === "ready" ? H(A) : Ma().updateState === "downloading" ? H(j, 1) : H(O, -1);
        });
      }
      L(() => {
        T(S, `SteamLite ${Ma().update.version ?? ""} is ready to download`), T(z, Ma().updateState === "downloading" ? "Downloading " + Ma().updatePct + "%" : Ma().updateState === "ready" ? "Downloaded. Opening the installer..." : "A new version is available.");
      }), bt(3, u, () => ci, () => ({ duration: 450, easing: ca })), v(f, u);
    };
    M(o, (f) => {
      Ma().update && Ma().updateHidden && Ma().updateState && f(d);
    });
  }
  v(t, i), Lt();
}
Wt(["click"]);
var uf = /* @__PURE__ */ h('<div class="box glass svelte-l1k67z" style="z-index:1"><img class="logo rise svelte-l1k67z" style="--i:0" src="/icon.png" alt="SteamLite" draggable="false"/> <h1 class="rise svelte-l1k67z" style="--i:1"> </h1> <p class="muted rise svelte-l1k67z" style="--i:2"> </p> <div class="rise svelte-l1k67z" style="--i:3"><!></div></div>');
function ff(t, a) {
  Tt(a, !0);
  const s = /* @__PURE__ */ P(() => c.signedIn && c.migrate);
  async function r() {
    const k = await ve("app:boot");
    c.signedIn = !0, c.migrate = !1, c.steamId = k.steamId, c.settings = k.settings, Fa(), Ms(), nr().then(() => {
      c.me && c.me.linked && !c.me.prompted && (c.onboard = !0);
    });
  }
  const i = () => {
    c.migrate = !1;
  };
  var o = uf(), d = n(l(o), 2), f = l(d);
  f.nodeValue = "Sign in with Steam";
  var u = n(d, 2), m = C(u, !0), p = n(u, 2), _ = l(p);
  Yo(_, {
    get allowSkip() {
      return e(s);
    },
    onDone: r,
    onSkip: i
  }), L(() => T(m, e(s) ? "SteamLite now signs in through Steam. Your library, favorites, collections and play time are kept. You only need to do this once." : "SteamLite shows your Steam games and counts your play time. Sign in to load your library.")), v(t, o), Lt();
}
var hf = /* @__PURE__ */ h('<img draggable="false"/>'), pf = /* @__PURE__ */ h('<span class="svelte-wo88vl"> </span>'), mf = /* @__PURE__ */ h("<div><!></div>"), gf = /* @__PURE__ */ h("<div><!> <!></div>");
function fs(t, a) {
  Tt(a, !0);
  let s = Dt(a, "kind", 3, "capsule"), r = Dt(a, "alt", 3, ""), i = Dt(a, "zoom", 3, !1), o = /* @__PURE__ */ G(Ct([])), d = /* @__PURE__ */ G(Ct([])), f = /* @__PURE__ */ G(!1), u = !1;
  const m = /* @__PURE__ */ P(() => yo.list(a.g, s())), p = /* @__PURE__ */ P(() => [
    ...e(m).slice(0, 1),
    ...e(d),
    ...e(m).slice(1)
  ]), _ = /* @__PURE__ */ P(() => e(p).find((H) => !e(o).includes(H)));
  let k = a.g.id;
  $t(() => {
    a.g.id !== k && (k = a.g.id, g(o, [], !0), g(d, [], !0), u = !1, g(f, !1));
  });
  function b(H) {
    if (g(f, !1), g(o, [...e(o), H], !0), !u && !a.g.nonSteam && /^\d+$/.test(String(a.g.id))) {
      u = !0;
      const I = a.g.id;
      ve("art:resolve", I).then((w) => {
        w && a.g.id === I && g(d, (w[s()] || w.capsule || []).filter(($) => $.startsWith("https://")), !0);
      }).catch(() => {
      });
    }
  }
  const S = /* @__PURE__ */ P(() => [...a.g.name || "?"].reduce((H, I) => H + I.charCodeAt(0), 0) % 360);
  var E = gf();
  let z;
  var x = l(E);
  {
    var A = (H) => {
      var I = hf();
      let w;
      L(() => {
        Be(I, "src", e(_)), Be(I, "alt", r() || a.g.name), w = je(I, 1, "svelte-wo88vl", null, w, { in: e(f) });
      }), xa("load", I, () => g(f, !0)), xa("error", I, () => b(e(_))), v(H, I);
    };
    M(x, (H) => {
      e(_) && H(A);
    });
  }
  var j = n(x, 2);
  {
    var O = (H) => {
      var I = mf();
      let w;
      var $ = l(I);
      {
        var B = (te) => {
          var he = pf(), se = C(he, !0);
          L((de) => T(se, de), [() => (a.g.name || "?").trim()[0]?.toUpperCase()]), v(te, he);
        };
        M($, (te) => {
          e(_) || te(B);
        });
      }
      L(() => {
        w = je(I, 1, "ph svelte-wo88vl", null, w, { skel: !!e(_) }), dt(I, `--h:${e(S) ?? ""}`);
      }), v(H, I);
    };
    M(j, (H) => {
      (!e(_) || !e(f)) && H(O);
    });
  }
  L(() => z = je(E, 1, "c svelte-wo88vl", null, z, { zoom: i() })), v(t, E), Lt();
}
var _f = /* @__PURE__ */ h('<span class="pickmark svelte-ddf1q8"><!></span>'), bf = /* @__PURE__ */ h('<div class="prog svelte-ddf1q8"><i class="svelte-ddf1q8"></i></div>'), yf = /* @__PURE__ */ h('<span class="live svelte-ddf1q8"><i class="svelte-ddf1q8"></i>Playing</span>'), wf = /* @__PURE__ */ h('<span class="star svelte-ddf1q8" title="Favorite"><!></span>'), kf = /* @__PURE__ */ h('<button class="go svelte-ddf1q8"><!></button>'), xf = /* @__PURE__ */ h('<span class="st on svelte-ddf1q8"> </span>'), Sf = /* @__PURE__ */ h("<span> </span>"), Mf = /* @__PURE__ */ h('<div role="button" tabindex="0"><div class="art svelte-ddf1q8"><!> <!> <!> <!> <!> <div class="acts svelte-ddf1q8"><button><!></button> <!></div></div> <div class="meta svelte-ddf1q8"><div class="name ellipsis svelte-ddf1q8"> </div> <div class="line svelte-ddf1q8"><!><span class="dotsep svelte-ddf1q8">·</span><span> </span></div> <div class="line faint svelte-ddf1q8"> </div></div></div>');
function mn(t, a) {
  Tt(a, !0);
  let s = Dt(a, "i", 3, 0), r = Dt(a, "wide", 3, !1);
  const i = /* @__PURE__ */ P(() => c.running && c.running.id === a.g.id), o = /* @__PURE__ */ P(() => c.favorites.includes(a.g.id)), d = /* @__PURE__ */ P(() => c.sel.includes(a.g.id)), f = /* @__PURE__ */ P(() => c.progress[a.g.id]), u = {
    downloading: "Downloading",
    installing: "Installing",
    updating: "Updating",
    verifying: "Verifying",
    paused: "Paused",
    waiting: "Waiting"
  }, m = (ce) => {
    ce && (ce.ctrlKey || ce.metaKey || ce.shiftKey || c.sel.length) ? (ce.preventDefault(), vd(a.g.id, ce)) : $s(a.g.id);
  }, p = (ce) => {
    (ce.key === "Enter" || ce.key === " ") && (ce.preventDefault(), m());
  }, _ = /* @__PURE__ */ P(() => a.g.lastPlayed ? "Last played " + lr(a.g.lastPlayed).toLowerCase() : "Never played");
  var k = Mf();
  let b;
  var S = l(k), E = l(S);
  {
    let ce = /* @__PURE__ */ P(() => r() ? "header" : "capsule");
    fs(E, {
      get g() {
        return a.g;
      },
      get kind() {
        return e(ce);
      }
    });
  }
  var z = n(E, 2);
  {
    var x = (ce) => {
      var J = _f(), q = l(J);
      oe(q, { name: "check", size: 15, stroke: 3 }), v(ce, J);
    };
    M(z, (ce) => {
      e(d) && ce(x);
    });
  }
  var A = n(z, 2);
  {
    var j = (ce) => {
      var J = bf(), q = C(J);
      L((D) => dt(q, `width:${D ?? ""}%`), [() => Math.round(e(f).p * 100)]), v(ce, J);
    };
    M(A, (ce) => {
      e(f) && ce(j);
    });
  }
  var O = n(A, 2);
  {
    var H = (ce) => {
      var J = yf();
      v(ce, J);
    };
    M(O, (ce) => {
      e(i) && ce(H);
    });
  }
  var I = n(O, 2);
  {
    var w = (ce) => {
      var J = wf(), q = l(J);
      oe(q, { name: "star", size: 13 }), v(ce, J);
    };
    M(I, (ce) => {
      e(o) && ce(w);
    });
  }
  var $ = n(I, 2), B = l($);
  let te;
  var he = l(B);
  oe(he, { name: "star", size: 16 });
  var se = n(B, 2);
  {
    var de = (ce) => {
      var J = kf(), q = l(J);
      oe(q, { name: "play", size: 18 }), L(() => {
        Be(J, "aria-label", "Play " + a.g.name), J.disabled = !!c.running;
      }), y("click", J, (D) => {
        D.stopPropagation(), To(a.g);
      }), v(ce, J);
    };
    M(se, (ce) => {
      a.g.installed && !e(i) && ce(de);
    });
  }
  var U = n(S, 2), re = l(U), ke = C(re, !0), F = n(re, 2), ne = l(F);
  {
    var V = (ce) => {
      var J = xf(), q = C(J);
      L((D) => T(q, `${(u[e(f).a] || "Working") ?? ""}${D ?? ""}`), [
        () => e(f).a === "downloading" || e(f).a === "installing" || e(f).a === "paused" ? " " + Math.round(e(f).p * 100) + "%" : ""
      ]), v(ce, J);
    }, ye = (ce) => {
      var J = Sf();
      let q;
      var D = C(J, !0);
      L(() => {
        q = je(J, 1, "st svelte-ddf1q8", null, q, { on: a.g.installed }), T(D, a.g.installed ? "Installed" : "Not installed");
      }), v(ce, J);
    };
    M(ne, (ce) => {
      e(f) ? ce(V) : ce(ye, -1);
    });
  }
  var Se = n(ne, 2), Re = C(Se, !0), $e = n(F, 2), Ye = C($e);
  L(
    (ce, J, q) => {
      b = je(k, 1, "gc rise svelte-ddf1q8", null, b, { wide: r(), sel: e(d), off: !a.g.installed }), dt(k, `--i:${ce ?? ""}`), Be(k, "title", a.g.name), te = je(B, 1, "fav svelte-ddf1q8", null, te, { on: e(o) }), Be(B, "aria-label", e(o) ? "Remove from favorites" : "Add to favorites"), T(ke, a.g.name), T(Re, J), T(Ye, `${e(_) ?? ""}${q ?? ""}`);
    },
    [
      () => Math.min(s(), 14),
      () => ua(a.g) ? Ia(ua(a.g)) + " played" : "No play time",
      () => a.g.installed && a.g.size ? " · " + xn(a.g.size) : ""
    ]
  ), y("click", k, (ce) => m(ce)), y("keydown", k, p), y("click", B, (ce) => {
    ce.stopPropagation(), So(a.g.id);
  }), v(t, k), Lt();
}
Wt(["click", "keydown"]);
var Tf = /* @__PURE__ */ h('<div class="shelf svelte-tleokw"><button aria-label="Scroll left"><!></button> <div class="track svelte-tleokw"><!></div> <button aria-label="Scroll right"><!></button></div>');
function Vn(t, a) {
  Tt(a, !0);
  let s, r = /* @__PURE__ */ G(!0), i = /* @__PURE__ */ G(!1);
  const o = () => {
    s && (g(r, s.scrollLeft < 8), g(i, s.scrollLeft + s.clientWidth > s.scrollWidth - 8));
  }, d = (z) => s.scrollBy({ left: z * s.clientWidth * 0.8, behavior: "smooth" });
  $t(() => {
    o();
  });
  var f = Tf(), u = l(f);
  let m;
  var p = l(u);
  oe(p, { name: "back", size: 20 });
  var _ = n(u, 2), k = l(_);
  vi(k, () => a.children), _a(_, (z) => s = z, () => s), zt(_, (z) => Gd?.(z));
  var b = n(_, 2);
  let S;
  var E = l(b);
  oe(E, { name: "back", size: 20 }), zt(f, (z) => Kt?.(z)), L(() => {
    m = je(u, 1, "ar l svelte-tleokw", null, m, { hide: e(r) }), S = je(b, 1, "ar r svelte-tleokw", null, S, { hide: e(i) });
  }), y("click", u, () => d(-1)), xa("scroll", _, o), y("click", b, () => d(1)), v(t, f), Lt();
}
Wt(["click"]);
function Ca(t, a) {
  Tt(a, !0);
  let s = Dt(a, "value", 3, 0), r = Dt(a, "format", 3, (p) => Math.round(p).toLocaleString()), i = Dt(a, "duration", 3, 900), o = /* @__PURE__ */ G(0), d = 0, f = 0;
  function u(p) {
    cancelAnimationFrame(f);
    const _ = performance.now(), k = d, b = (S) => {
      const E = Math.min(1, (S - _) / i()), z = 1 - Math.pow(1 - E, 4);
      g(o, k + (p - k) * z), E < 1 ? f = requestAnimationFrame(b) : d = p;
    };
    f = requestAnimationFrame(b);
  }
  $t(() => (u(Number(s()) || 0), () => cancelAnimationFrame(f)));
  var m = za();
  L((p) => T(m, p), [() => r()(e(o))]), v(t, m), Lt();
}
function Lf(t = 0.52, a = 15, s = 56) {
  const r = [], i = a * Math.sqrt(1 - t * t);
  for (let o = 0; o <= s; o++) {
    const d = o / s;
    r.push((1 - Math.exp(-t * a * d) * (Math.cos(i * d) + t * a / i * Math.sin(i * d))).toFixed(4));
  }
  return r[s] = "1", "linear(" + r.join(", ") + ")";
}
const Uo = typeof CSS < "u" && CSS.supports && CSS.supports("animation-timing-function", "linear(0, 1)") ? Lf() : "cubic-bezier(.34, 1.56, .64, 1)";
function In(t, a = {}) {
  const s = a.axis === "y" ? "y" : "x", r = () => matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "reduced", i = () => t.querySelector(":scope > .ind, :scope > .pill"), o = () => [...t.querySelectorAll(":scope > button")].filter((x) => !x.disabled), d = (x) => s === "x" ? x.offsetLeft + x.offsetWidth / 2 : x.offsetTop + x.offsetHeight / 2, f = (x) => s === "x" ? x.offsetWidth : x.offsetHeight, u = (x) => s === "x" ? x + "px 0" : "0 " + x + "px", m = (x) => x.classList.contains("on") || x.getAttribute("aria-checked") === "true";
  let p = null, _ = !1;
  function k(x) {
    if (x.button !== 0 || r()) return;
    const A = i(), j = o();
    if (!A || j.length < 2) return;
    const O = x.target.closest && x.target.closest(":scope > button, button");
    if (!O || !t.contains(O)) return;
    const H = j.find(m) || j[0];
    O !== H && x.target !== A || (p = { id: x.pointerId, x0: x.clientX, y0: x.clientY, active: H, bar: A, list: j, moved: !1, origin: d(H), near: H, shown: 0, drag: null });
  }
  const b = (x, A) => {
    x.shown = A, x.drag.effect.setKeyframes([{ translate: u(A) }]);
  };
  function S(x) {
    if (!p || x.pointerId !== p.id) return;
    const A = s === "x" ? x.clientX - p.x0 : x.clientY - p.y0;
    if (!p.moved) {
      if (Math.abs(A) < 6) return;
      p.moved = !0;
      try {
        t.setPointerCapture(x.pointerId);
      } catch {
      }
      t.classList.add("grabbing"), p.bar.classList.add("held"), p.drag = p.bar.animate([{ translate: u(0) }], { duration: 1, fill: "both" });
    }
    const j = d(p.list[0]), O = d(p.list[p.list.length - 1]), H = Math.max(j, Math.min(O, p.origin + A));
    let I = p.list[0], w = 1e9;
    for (const te of p.list) {
      const he = Math.abs(d(te) - H);
      he < w && (w = he, I = te);
    }
    const $ = Math.max(0, 1 - w / (f(I) * 0.5)), B = H + (d(I) - H) * (0.7 * $);
    if (I !== p.active && (p.active = I, I.click()), b(p, B - d(p.active)), I !== p.near) {
      p.near = I;
      try {
        navigator.vibrate && navigator.vibrate(4);
      } catch {
      }
    }
    p.list.forEach((te) => te === I ? te.setAttribute("data-near", "") : te.removeAttribute("data-near"));
  }
  function E(x) {
    if (!p || x.pointerId !== p.id) return;
    const A = p;
    if (p = null, !A.moved) return;
    _ = !0, setTimeout(() => _ = !1, 60), t.classList.remove("grabbing");
    try {
      t.releasePointerCapture(x.pointerId);
    } catch {
    }
    A.list.forEach((H) => H.removeAttribute("data-near"));
    const j = A.bar, O = A.drag;
    O.effect.setKeyframes([{ translate: u(A.shown) }, { translate: u(0) }]), O.effect.updateTiming({ duration: 560, easing: Uo, fill: "both" }), O.currentTime = 0, O.play(), j.animate([{ scale: "1 1" }, { scale: s === "x" ? "1.07 .92" : ".92 1.07", offset: 0.35 }, { scale: "1 1" }], { duration: 420, delay: 80, easing: "ease-out" }), O.finished.then(() => {
      O.cancel(), requestAnimationFrame(() => j.classList.remove("held"));
    }).catch(() => j.classList.remove("held"));
  }
  const z = (x) => {
    _ && (x.preventDefault(), x.stopPropagation(), _ = !1);
  };
  return t.addEventListener("pointerdown", k), t.addEventListener("pointermove", S), t.addEventListener("pointerup", E), t.addEventListener("pointercancel", E), t.addEventListener("click", z, !0), t.dataset.magnetAxis = s, { destroy() {
    t.removeEventListener("pointerdown", k), t.removeEventListener("pointermove", S), t.removeEventListener("pointerup", E), t.removeEventListener("pointercancel", E), t.removeEventListener("click", z, !0);
  } };
}
var zf = /* @__PURE__ */ h('<i class="burst svelte-9iy8lm" aria-hidden="true"></i>'), Cf = /* @__PURE__ */ h('<span class="t svelte-9iy8lm"> </span>'), Ef = /* @__PURE__ */ h('<span class="pb svelte-9iy8lm"><!> <button><span class="fx svelte-9iy8lm" aria-hidden="true"></span> <span class="ic svelte-9iy8lm" aria-hidden="true"><span><!></span> <span><!></span> <span><!></span> <span><!></span></span> <span class="lbl svelte-9iy8lm"><!></span></button></span>');
function Vo(t, a) {
  Tt(a, !0);
  let s = Dt(a, "installLabel", 3, "Install");
  const r = /* @__PURE__ */ P(() => !!(c.running && c.running.id === a.g.id)), i = /* @__PURE__ */ P(() => e(r) ? c.running.starting ? "cancel" : "stop" : a.g.installed ? "play" : "install"), o = /* @__PURE__ */ P(() => e(i) === "cancel" ? "Cancel" : e(i) === "stop" ? "Stop" : e(i) === "play" ? "Play" : s()), d = /* @__PURE__ */ P(() => s() === "Install" ? "download" : "ext"), f = /* @__PURE__ */ P(() => e(
    i
    // another game is running: Play waits
  ) === "play" && !!c.running), u = () => {
    e(i) === "play" ? To(a.g) : e(i) === "stop" || e(i) === "cancel" ? cd(a.g) : a.onInstall && a.onInstall();
  };
  let m, p = 0, _ = /* @__PURE__ */ G(0), k = "";
  const b = () => matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "reduced";
  $t(() => {
    const F = e(i);
    if (!m) return;
    const ne = m.offsetWidth;
    k && k !== F && (g(_, e(_) + 1), !b() && p && Math.abs(p - ne) > 1 && m.animate([{ width: p + "px" }, { width: ne + "px" }], { duration: 560, easing: Uo })), k = F, p = ne;
  });
  var S = Ef(), E = l(S);
  is(E, () => e(_), (F) => {
    var ne = ta(), V = we(ne);
    {
      var ye = (Se) => {
        var Re = zf();
        v(Se, Re);
      };
      M(V, (Se) => {
        e(_) > 0 && Se(ye);
      });
    }
    v(F, ne);
  });
  var z = n(E, 2);
  let x;
  var A = n(l(z), 2), j = l(A);
  let O;
  var H = l(j);
  oe(H, { name: "play", size: 18 });
  var I = n(j, 2);
  let w;
  var $ = l(I);
  oe($, { name: "stop", size: 16 });
  var B = n(I, 2);
  let te;
  var he = l(B);
  oe(he, { name: "x", size: 17 });
  var se = n(B, 2);
  let de;
  var U = l(se);
  oe(U, {
    get name() {
      return e(d);
    },
    size: 18
  });
  var re = n(A, 2), ke = l(re);
  is(ke, () => e(o), (F) => {
    var ne = Cf(), V = C(ne, !0);
    L(() => T(V, e(o))), bt(1, ne, () => La, () => ({ y: 16, duration: 380, delay: 60 })), bt(2, ne, () => La, () => ({ y: -16, duration: 240 })), v(F, ne);
  }), _a(z, (F) => m = F, () => m), L(() => {
    Be(S, "data-st", e(i)), x = je(z, 1, "btn big pbtn svelte-9iy8lm", null, x, {
      primary: e(i) === "play" || e(i) === "install",
      play: e(i) === "play",
      danger: e(i) === "stop" || e(i) === "cancel"
    }), z.disabled = e(f), O = je(j, 1, "i svelte-9iy8lm", null, O, { on: e(i) === "play" }), w = je(I, 1, "i svelte-9iy8lm", null, w, { on: e(i) === "stop" }), te = je(B, 1, "i svelte-9iy8lm", null, te, { on: e(i) === "cancel" }), de = je(se, 1, "i dl svelte-9iy8lm", null, de, { on: e(i) === "install" });
  }), y("click", z, u), v(t, S), Lt();
}
Wt(["click"]);
var Af = /* @__PURE__ */ h('<div class="loading svelte-1rta8r" role="status"><span class="spinner svelte-1rta8r"></span>Loading your library from Steam...</div> <div class="skel herosk svelte-1rta8r"></div>', 1), If = /* @__PURE__ */ h('<div class="card empty rise svelte-1rta8r"><h2>Your library did not load</h2><p class="muted"> </p><div class="row"><button class="btn primary">Try again</button></div></div>'), Pf = /* @__PURE__ */ h('<div class="card empty rise svelte-1rta8r"><h2>No games found</h2><p class="muted">Steam returned no games for this account. If your profile is private, SteamLite cannot see them. Set "Game details" to Public in Steam, then refresh.</p> <div class="row"><button class="btn primary">Open Steam privacy settings</button><button class="btn">Refresh library</button></div></div>'), Df = /* @__PURE__ */ h('<div class="art svelte-1rta8r"><div class="kb svelte-1rta8r"><!></div></div>'), Nf = /* @__PURE__ */ h('<span class="svelte-1rta8r"> </span>'), Of = /* @__PURE__ */ h('<span class="lv svelte-1rta8r">Playing now</span>'), qf = /* @__PURE__ */ h('<div class="copy svelte-1rta8r"><div class="eyebrow"> </div> <h2 class="svelte-1rta8r"> </h2> <div class="chips svelte-1rta8r"><span class="svelte-1rta8r"><!> </span> <!> <!></div> <div class="row act svelte-1rta8r"><!> <button class="btn">Details</button></div></div>'), jf = /* @__PURE__ */ h('<div class="cap svelte-1rta8r"><!></div>'), Hf = /* @__PURE__ */ h('<button><i class="svelte-1rta8r"></i></button>'), Rf = /* @__PURE__ */ h('<div class="dots svelte-1rta8r"></div>'), $f = /* @__PURE__ */ h('<section class="hero rise svelte-1rta8r" style="--i:1" role="group"><!> <div class="veil svelte-1rta8r"></div> <!> <div class="side svelte-1rta8r"><!></div> <!></section>'), Ff = /* @__PURE__ */ h('<div class="tiles svelte-1rta8r"><div class="card tile rise svelte-1rta8r" style="--i:2"><div class="faint">Games in library</div><b class="svelte-1rta8r"><!></b></div> <div class="card tile rise svelte-1rta8r" style="--i:3"><div class="faint">Installed</div><b class="svelte-1rta8r"><!></b></div> <div class="card tile rise svelte-1rta8r" style="--i:4"><div class="faint">Hours played</div><b class="svelte-1rta8r"><!></b></div> <div class="card tile rise svelte-1rta8r" style="--i:5"><div class="faint">Favorites</div><b class="svelte-1rta8r"><!></b></div></div>'), Bf = /* @__PURE__ */ h('<div class="muted off svelte-1rta8r">You are offline. This is the last saved copy of your library. Reconnect and press refresh in the library to update it.</div>'), Gf = /* @__PURE__ */ h('<div class="sech"><h2>Recently played</h2></div><!>', 1), Wf = /* @__PURE__ */ h('<div class="sech"><h2>Most played</h2></div><!>', 1), Yf = /* @__PURE__ */ h('<div class="sech"><h2>Favorites</h2></div><!>', 1), Uf = /* @__PURE__ */ h('<button class="card item svelte-1rta8r"><div class="eyebrow"> </div><b class="svelte-1rta8r"> </b><div class="faint"> </div></button>'), Vf = /* @__PURE__ */ h('<div class="sech"><h2>News from your games</h2><div class="grow"></div><button class="btn sm">All news</button></div> <div class="news svelte-1rta8r"></div>', 1), Kf = /* @__PURE__ */ h("<!> <!> <!> <!> <!> <!> <!>", 1), Xf = /* @__PURE__ */ h('<div class="page"><div class="phead"><div class="rise" style="--i:0"><h1 class="title svelte-1rta8r">Home</h1></div></div> <!></div>');
function nl(t, a) {
  Tt(a, !0);
  const s = /* @__PURE__ */ P(() => c.games.filter((w) => !c.hidden.includes(w.id))), r = /* @__PURE__ */ P(() => [...e(s)].filter((w) => w.lastPlayed).sort((w, $) => $.lastPlayed - w.lastPlayed)), i = /* @__PURE__ */ P(() => (e(r).length ? e(r) : e(s)).slice(0, 5)), o = /* @__PURE__ */ P(() => [...e(s)].sort((w, $) => ua($) - ua(w)).filter((w) => ua(w)).slice(0, 12)), d = /* @__PURE__ */ P(() => e(s).filter((w) => c.favorites.includes(w.id))), f = /* @__PURE__ */ P(() => e(s).reduce((w, $) => w + ua($), 0) / 3600), u = /* @__PURE__ */ P(() => e(s).filter((w) => w.installed).length);
  let m = /* @__PURE__ */ G(Ct([])), p = /* @__PURE__ */ G(0), _ = !1, k = /* @__PURE__ */ G(0);
  const b = /* @__PURE__ */ P(() => e(i)[e(p) % Math.max(e(i).length, 1)]), S = /* @__PURE__ */ P(() => e(b) && c.running && c.running.id === e(b).id);
  oa(() => {
    ve("news:feed").then(($) => g(m, $.slice(0, 4), !0)).catch(() => {
    });
    const w = setInterval(
      () => {
        _ || e(
          i
          // about 7 seconds each
        ).length < 2 || document.documentElement.dataset.gaming === "1" || (g(k, e(k) + 1), e(k) >= 70 && (g(
          k,
          0
          // about 7 seconds each
        ), g(p, (e(p) + 1) % e(i).length)));
      },
      100
    );
    return () => clearInterval(w);
  }), $t(() => {
    e(b) && Io(e(b));
  });
  const E = (w) => {
    g(p, w, !0), g(k, 0);
  }, z = (w) => ve("app:openUrl", w);
  var x = Xf(), A = n(l(x), 2);
  {
    var j = (w) => {
      var $ = Af();
      v(w, $);
    }, O = (w) => {
      var $ = If(), B = n(l($)), te = C(B, !0), he = n(B), se = C(he);
      L(() => T(te, c.libError)), y("click", se, () => Fa()), v(w, $);
    }, H = (w) => {
      var $ = Pf(), B = n(l($), 3), te = l(B), he = n(te);
      y("click", te, () => z("https://steamcommunity.com/my/edit/settings?tab=privacy")), y("click", he, () => Fa()), v(w, $);
    }, I = (w) => {
      var $ = Kf(), B = we($);
      {
        var te = (X) => {
          var fe = $f(), Z = l(fe);
          is(Z, () => e(b).id, (be) => {
            var N = Df(), ae = l(N), ie = l(ae);
            fs(ie, {
              get g() {
                return e(b);
              },
              kind: "hero"
            }), bt(1, N, () => ha, () => ({ duration: 900 })), bt(2, N, () => ha, () => ({ duration: 900 })), v(be, N);
          });
          var W = n(Z, 4);
          is(W, () => e(b).id, (be) => {
            var N = qf(), ae = l(N), ie = C(ae, !0), me = n(ae, 2), Me = C(me, !0), Ae = n(me, 2), Ie = l(Ae), De = l(Ie);
            oe(De, { name: "clock", size: 15 });
            var Ge = n(De), We = n(Ie, 2);
            {
              var Je = (He) => {
                var lt = Nf(), ut = C(lt);
                L((it) => T(ut, `Last played ${it ?? ""}`), [() => lr(e(b).lastPlayed).toLowerCase()]), v(He, lt);
              };
              M(We, (He) => {
                e(b).lastPlayed && He(Je);
              });
            }
            var vt = n(We, 2);
            {
              var Q = (He) => {
                var lt = Of();
                v(He, lt);
              };
              M(vt, (He) => {
                e(S) && He(Q);
              });
            }
            var xe = n(Ae, 2), Te = l(xe);
            Vo(Te, {
              get g() {
                return e(b);
              },
              installLabel: "View game",
              onInstall: () => $s(e(b).id)
            });
            var tt = n(Te, 2);
            L(
              (He) => {
                T(ie, e(b).lastPlayed ? "Continue playing" : "In your library"), T(Me, e(b).name), T(Ge, `${He ?? ""} played`);
              },
              [() => Ia(ua(e(b)))]
            ), y("click", tt, () => $s(e(b).id)), bt(1, N, () => La, () => ({ y: 24, duration: 800, easing: ca, delay: 150 })), v(be, N);
          });
          var ee = n(W, 2), pe = l(ee);
          is(pe, () => e(b).id, (be) => {
            var N = jf(), ae = l(N);
            fs(ae, {
              get g() {
                return e(b);
              }
            }), bt(1, N, () => La, () => ({ x: 60, duration: 900, easing: ca })), v(be, N);
          });
          var R = n(ee, 2);
          {
            var ge = (be) => {
              var N = Rf();
              Ve(N, 21, () => e(i), _t, (ae, ie, me) => {
                var Me = Hf();
                let Ae;
                var Ie = C(Me);
                L(
                  (De) => {
                    Be(Me, "aria-label", "Show " + e(i)[me].name), Ae = je(Me, 1, "svelte-1rta8r", null, Ae, { on: me === e(p) % e(i).length }), dt(Ie, `width:${De ?? ""}%`);
                  },
                  [
                    () => me === e(p) % e(i).length ? Math.min(100, e(k) / 0.7) : 0
                  ]
                ), y("click", Me, () => E(me)), v(ae, Me);
              }), v(be, N);
            };
            M(R, (be) => {
              e(i).length > 1 && be(ge);
            });
          }
          xa("mouseenter", fe, () => _ = !0), xa("mouseleave", fe, () => _ = !1), v(X, fe);
        }, he = /* @__PURE__ */ P(() => e(b) && !Xs("hero"));
        M(B, (X) => {
          e(he) && X(te);
        });
      }
      var se = n(B, 2);
      {
        var de = (X) => {
          var fe = Ff(), Z = l(fe), W = n(l(Z)), ee = l(W);
          Ca(ee, {
            get value() {
              return e(s).length;
            }
          });
          var pe = n(Z, 2), R = n(l(pe)), ge = l(R);
          Ca(ge, {
            get value() {
              return e(u);
            }
          });
          var be = n(pe, 2), N = n(l(be)), ae = l(N);
          Ca(ae, {
            get value() {
              return e(f);
            }
          });
          var ie = n(be, 2), me = n(l(ie)), Me = l(me);
          Ca(Me, {
            get value() {
              return e(d).length;
            }
          }), v(X, fe);
        }, U = /* @__PURE__ */ P(() => !Xs("stats"));
        M(se, (X) => {
          e(U) && X(de);
        });
      }
      var re = n(se, 2);
      {
        var ke = (X) => {
          var fe = Bf();
          v(X, fe);
        };
        M(re, (X) => {
          c.offline && X(ke);
        });
      }
      var F = n(re, 2);
      {
        var ne = (X) => {
          var fe = Gf(), Z = we(fe);
          zt(Z, (ee) => Kt?.(ee));
          var W = n(Z);
          Vn(W, {
            children: (ee, pe) => {
              var R = ta(), ge = we(R);
              Ve(ge, 19, () => e(r).slice(5, 17), (be) => be.id, (be, N, ae) => {
                mn(be, {
                  get g() {
                    return e(N);
                  },
                  get i() {
                    return e(ae);
                  }
                });
              }), v(ee, R);
            },
            $$slots: { default: !0 }
          }), v(X, fe);
        }, V = /* @__PURE__ */ P(() => e(r).length > 5 && !Xs("recent"));
        M(F, (X) => {
          e(V) && X(ne);
        });
      }
      var ye = n(F, 2);
      {
        var Se = (X) => {
          var fe = Wf(), Z = we(fe);
          zt(Z, (ee) => Kt?.(ee));
          var W = n(Z);
          Vn(W, {
            children: (ee, pe) => {
              var R = ta(), ge = we(R);
              Ve(ge, 19, () => e(o), (be) => be.id, (be, N, ae) => {
                mn(be, {
                  get g() {
                    return e(N);
                  },
                  get i() {
                    return e(ae);
                  }
                });
              }), v(ee, R);
            },
            $$slots: { default: !0 }
          }), v(X, fe);
        }, Re = /* @__PURE__ */ P(() => e(o).length && !Xs("most"));
        M(ye, (X) => {
          e(Re) && X(Se);
        });
      }
      var $e = n(ye, 2);
      {
        var Ye = (X) => {
          var fe = Yf(), Z = we(fe);
          zt(Z, (ee) => Kt?.(ee));
          var W = n(Z);
          Vn(W, {
            children: (ee, pe) => {
              var R = ta(), ge = we(R);
              Ve(ge, 19, () => e(d), (be) => be.id, (be, N, ae) => {
                mn(be, {
                  get g() {
                    return e(N);
                  },
                  get i() {
                    return e(ae);
                  }
                });
              }), v(ee, R);
            },
            $$slots: { default: !0 }
          }), v(X, fe);
        }, ce = /* @__PURE__ */ P(() => e(d).length && !Xs("favorites"));
        M($e, (X) => {
          e(ce) && X(Ye);
        });
      }
      var J = n($e, 2);
      {
        var q = (X) => {
          var fe = Vf(), Z = we(fe), W = n(l(Z), 2);
          zt(Z, (pe) => Kt?.(pe));
          var ee = n(Z, 2);
          Ve(ee, 23, () => e(m), (pe) => pe.gid, (pe, R) => {
            var ge = Uf(), be = l(ge), N = C(be, !0), ae = n(be), ie = C(ae, !0), me = n(ae), Me = C(me, !0);
            L(
              (Ae) => {
                T(N, e(R).game), T(ie, e(R).title), T(Me, Ae);
              },
              [() => Sn(e(R).date)]
            ), y("click", ge, () => e(R).url && ve("app:openUrl", e(R).url)), v(pe, ge);
          }), zt(ee, (pe) => Kt?.(pe)), y("click", W, () => Da("news")), v(X, fe);
        }, D = /* @__PURE__ */ P(() => e(m).length && !Xs("news"));
        M(J, (X) => {
          e(D) && X(q);
        });
      }
      v(w, $);
    };
    M(A, (w) => {
      c.libLoading && !c.games.length ? w(j) : c.libError && !c.games.length ? w(O, 1) : c.games.length ? w(I, -1) : w(H, 2);
    });
  }
  v(t, x), Lt();
}
Wt(["click"]);
var Jf = /* @__PURE__ */ h(`<div class="back svelte-wq0ed3" role="presentation"><div class="dlg glass svelte-wq0ed3" role="dialog" tabindex="-1" aria-label="Add a non-Steam game"><div class="row"><h2 class="grow svelte-wq0ed3">Add a game</h2><button class="btn icon sm" aria-label="Close"><!></button></div> <p class="muted">Add a game that is not on Steam. SteamLite will launch it and count your play time.</p> <label class="svelte-wq0ed3">Game file<div class="row"><input class="grow" readonly="" placeholder="Choose the game's .exe"/><button class="btn"><!>Browse</button></div></label> <label class="svelte-wq0ed3">Name<input placeholder="Game name"/></label> <label class="svelte-wq0ed3">Launch options <span class="faint">(optional)</span><input placeholder="-windowed"/></label> <div class="row end svelte-wq0ed3"><button class="btn">Cancel</button><button class="btn primary">Add to library</button></div></div></div>`);
function Zf(t, a) {
  Tt(a, !0);
  let s = /* @__PURE__ */ G(""), r = /* @__PURE__ */ G(""), i = /* @__PURE__ */ G(""), o = /* @__PURE__ */ G(!1);
  async function d() {
    const B = await ve("dialog:exe");
    B && (g(r, B, !0), e(s) || g(s, B.split("\\").pop().replace(/\.exe$/i, "").replace(/[_-]+/g, " "), !0));
  }
  async function f() {
    g(o, !0);
    const B = await ve("nonsteam:add", { name: e(s), exe: e(r), args: e(i) });
    if (g(o, !1), !B.ok) return yt(B.error, "bad");
    await Fa(), yt(e(s) + " was added."), a.onclose();
  }
  var u = Jf(), m = l(u), p = l(m), _ = n(l(p)), k = l(_);
  oe(k, { name: "x", size: 16 });
  var b = n(p, 4), S = n(l(b)), E = l(S), z = n(E), x = l(z);
  oe(x, { name: "folder", size: 17 });
  var A = n(b, 2), j = n(l(A)), O = n(A, 2), H = n(l(O), 2), I = n(O, 2), w = l(I), $ = n(w);
  zt(u, (B, te) => Gs?.(B, te), () => a.onclose), L(() => {
    ys(E, e(r)), $.disabled = e(o) || !e(s) || !e(r);
  }), y("click", u, function(...B) {
    a.onclose?.apply(this, B);
  }), y("click", m, (B) => B.stopPropagation()), y("keydown", m, () => {
  }), y("click", _, function(...B) {
    a.onclose?.apply(this, B);
  }), y("click", z, d), ia(j, () => e(s), (B) => g(s, B)), ia(H, () => e(i), (B) => g(i, B)), y("click", w, function(...B) {
    a.onclose?.apply(this, B);
  }), y("click", $, f), bt(1, m, () => Bs, () => ({ start: 0.92, duration: 450, easing: ca })), bt(3, u, () => ha, () => ({ duration: 250 })), v(t, u), Lt();
}
Wt(["click", "keydown"]);
var Qf = /* @__PURE__ */ h('<button role="radio"> </button>'), e1 = /* @__PURE__ */ h('<div class="seg svelte-vud633" role="radiogroup"><div class="ind svelte-vud633"></div> <!></div>');
function ar(t, a) {
  Tt(a, !0);
  let s = Dt(a, "options", 19, () => []), r = Dt(a, "value", 3, ""), i = Dt(a, "label", 3, "");
  const o = /* @__PURE__ */ P(() => Math.max(0, s().findIndex((m) => m[0] === r())));
  var d = e1(), f = l(d), u = n(f, 2);
  Ve(u, 17, s, _t, (m, p) => {
    var _ = /* @__PURE__ */ P(() => Ns(e(p), 2));
    let k = () => e(_)[0], b = () => e(_)[1];
    var S = Qf();
    let E;
    var z = C(S, !0);
    L(() => {
      Be(S, "aria-checked", k() === r()), E = je(S, 1, "svelte-vud633", null, E, { on: k() === r() }), T(z, b());
    }), y("click", S, () => a.onchange && a.onchange(k())), v(m, S);
  }), zt(d, (m) => In?.(m)), L(() => {
    Be(d, "aria-label", i()), dt(d, `--n:${s().length ?? ""}`), dt(f, `transform: translateX(${e(o) * 100}%)`);
  }), v(t, d), Lt();
}
Wt(["click"]);
var t1 = /* @__PURE__ */ h('<div class="stor faint svelte-khfokh"> </div>'), a1 = /* @__PURE__ */ h('<button role="menuitemradio"><span class="ck svelte-khfokh"><!></span> </button>'), s1 = /* @__PURE__ */ h('<div class="fmenu glass svelte-khfokh" role="menu"><div class="fh svelte-khfokh">Sort by</div> <!> <div class="sep svelte-khfokh"></div> <div class="fh svelte-khfokh">Cover size</div> <label class="size svelte-khfokh" title="Cover size"><!><input type="range" min="130" max="260" step="2" aria-label="Cover size" class="svelte-khfokh"/></label></div>'), r1 = /* @__PURE__ */ h("<button>Non-Steam</button>"), n1 = /* @__PURE__ */ h("<button> </button>"), i1 = /* @__PURE__ */ h("<button>Hidden</button>"), l1 = /* @__PURE__ */ h('<span class="pickhint faint svelte-khfokh">Hold Ctrl or Shift and click games to pick several</span>'), o1 = /* @__PURE__ */ h('<div class="skel" style="aspect-ratio:2/3"></div>'), v1 = /* @__PURE__ */ h('<div class="loading svelte-khfokh" role="status"><span class="spinner svelte-khfokh"></span>Loading your library from Steam...</div> <div class="grid svelte-khfokh"></div>', 1), c1 = /* @__PURE__ */ h('<div class="none svelte-khfokh"><!><h3 class="svelte-khfokh">Your library did not load</h3><p class="muted svelte-khfokh"> </p><div class="row svelte-khfokh"><button class="btn primary">Try again</button></div></div>'), d1 = /* @__PURE__ */ h('<div class="none svelte-khfokh"><!><h3 class="svelte-khfokh">No games found</h3><p class="muted svelte-khfokh">Steam returned no games for this account. If your profile is private, SteamLite cannot see them. Set "Game details" to Public in Steam, then refresh.</p> <div class="row svelte-khfokh"><button class="btn primary">Open Steam privacy settings</button><button class="btn">Refresh library</button></div></div>'), u1 = /* @__PURE__ */ h('<div class="none svelte-khfokh"><!><h3 class="svelte-khfokh"> </h3><p class="muted svelte-khfokh"> </p><div class="row svelte-khfokh"><button class="btn">Show all games</button></div></div>'), f1 = /* @__PURE__ */ h("<div><!></div>"), h1 = /* @__PURE__ */ h('<div class="vwrap"><div class="grid svelte-khfokh"></div></div>'), p1 = /* @__PURE__ */ h('<button class="svelte-khfokh"> </button>'), m1 = /* @__PURE__ */ h('<span class="faint svelte-khfokh">No collections yet. Make one on a game page.</span>'), g1 = /* @__PURE__ */ h('<div class="colmenu glass svelte-khfokh"></div>'), _1 = /* @__PURE__ */ h('<div class="selbar glass svelte-khfokh" role="toolbar" aria-label="Selected games"><b class="svelte-khfokh"> </b> <button class="btn sm"><!>Favorite</button> <button class="btn sm"><!>Hide</button> <span class="colwrap svelte-khfokh"><button><!>Collection</button> <!></span> <button class="btn sm">Clear</button></div>'), b1 = /* @__PURE__ */ h('<div class="page"><div class="phead"><div class="head rise svelte-khfokh" style="--i:0"><div><h1 class="title">Your library <span class="count svelte-khfokh"> </span></h1><!></div> <div class="row"><button class="btn" title="Opens a random installed game from this view"><!>Random game</button> <button class="btn"><!>Add game</button> <button class="btn icon" aria-label="Refresh library"><span><!></span></button></div></div> <div class="bar glass rise svelte-khfokh" style="--i:1"><div class="search svelte-khfokh"><!><input placeholder="Search games (press /)" aria-label="Search your library" class="svelte-khfokh"/></div> <div class="fwrap svelte-khfokh"><button aria-haspopup="true"><!>Filters<span class="cur svelte-khfokh"> </span></button> <!></div></div> <div class="chips rise svelte-khfokh" style="--i:2"><button>All</button> <button>Installed</button> <button>Favorites</button> <!> <!> <!> <!></div></div> <!></div> <!> <!>', 1);
function y1(t, a) {
  Tt(a, !0);
  let s;
  const r = 20, i = 26;
  let o = /* @__PURE__ */ G(null), d = /* @__PURE__ */ G(900), f = /* @__PURE__ */ G(700), u = /* @__PURE__ */ G(0), m = /* @__PURE__ */ G(0), p = /* @__PURE__ */ G(0);
  const _ = /* @__PURE__ */ P(() => Math.max(1, Math.floor((e(d) + r) / (e(he) + r)))), k = /* @__PURE__ */ P(() => (e(d) - (e(_) - 1) * r) / e(_)), b = /* @__PURE__ */ P(() => (e(p) || e(k) * 1.5 + 78) + i), S = 500;
  let E = /* @__PURE__ */ G(S);
  $t(() => {
    e(
      w
      // a new view starts with the first 500 again
    ), e($), e(I), g(E, S);
  });
  const z = /* @__PURE__ */ P(() => e(de).length > e(E) ? e(de).slice(0, e(E)) : e(de)), x = /* @__PURE__ */ P(() => Math.ceil(e(z).length / e(_))), A = /* @__PURE__ */ P(() => Math.max(0, Math.floor((e(u) - e(m)) / e(b)) - 3)), j = /* @__PURE__ */ P(() => Math.min(e(x), Math.ceil((e(u) + e(f) - e(m)) / e(b)) + 3)), O = /* @__PURE__ */ P(() => e(z).slice(e(A) * e(_), e(j) * e(_)));
  $t(() => {
    e(E) < e(de).length && e(j) * e(_) >= e(E) - e(_) * 3 && g(E, Math.min(e(de).length, e(E) + S), !0);
  });
  let H = () => {
  };
  $t(() => {
    e(o), e(o) && queueMicrotask(() => H());
  }), $t(() => {
    e(O).length, e(he), e(_);
    const K = e(o);
    K && lo().then(() => {
      const Ce = K.querySelector(".gc"), Pe = Ce && Ce.parentElement ? Math.round(Ce.parentElement.getBoundingClientRect().height) : 0;
      Pe && Math.abs(Pe - ps(() => e(p))) > 1 && g(p, Pe, !0);
    });
  }), oa(() => {
    const K = document.querySelector("main");
    if (!K) return;
    let Ce = 0, Pe = 0, qe = 0, ot = 0, At = 0;
    const It = () => (K.querySelector(".phead") || {}).offsetHeight || 0, ra = () => Math.max(0, K.scrollHeight - K.clientHeight);
    H = () => {
      if (g(u, K.scrollTop, !0), g(f, K.clientHeight, !0), e(o)) {
        g(d, e(o).clientWidth, !0);
        const Ot = K.querySelector(".stretch");
        Ot && (Ot.style.transform || Ot.style.getPropertyValue("--pull")) || g(m, e(o).getBoundingClientRect().top - K.getBoundingClientRect().top + K.scrollTop);
      }
    };
    const Jt = () => {
      At || (At = requestAnimationFrame(() => {
        At = 0, H();
      }));
    }, Y = (Ot) => {
      const Gt = Math.round(e(m) + Ot * e(b) - It() - 14);
      return Math.max(0, Math.min(ra(), Gt < 8 ? 0 : Gt));
    };
    K.__snap = (Ot, Gt) => {
      const Ht = performance.now();
      if (Ce = (Ht - Pe > 200 ? 0 : Ce) + Ot, Pe = Ht, Math.abs(Ce) < 30 || Ht - qe < 130) return null;
      const Pt = Ce > 0 ? 1 : -1;
      Ce = 0;
      const Yt = (Gt + It() + 14 - e(m)) / e(b), ea = Pt > 0 ? Math.floor(Yt + 0.02) + 1 : Math.ceil(Yt - 0.02) - 1;
      let sa = ea < 0 ? 0 : Y(ea);
      if (Pt > 0 && sa <= Gt + 3) return null;
      if (Pt < 0 && sa >= Gt - 3)
        if (Gt > 3 && ea <= 0) sa = 0;
        else return null;
      return qe = Ht, sa;
    };
    const _e = () => {
      clearTimeout(ot), ot = setTimeout(
        () => {
          const Ot = (K.scrollTop + It() + 14 - e(m)) / e(b), Gt = [0, Y(Math.max(0, Math.round(Ot))), ra()];
          let Ht = Gt[0];
          for (const Pt of Gt) Math.abs(Pt - K.scrollTop) < Math.abs(Ht - K.scrollTop) && (Ht = Pt);
          Math.abs(Ht - K.scrollTop) > 3 && K.scrollTo({ top: Ht, behavior: "smooth" });
        },
        220
      );
    }, xt = () => {
      Jt(), _e();
    };
    K.addEventListener("scroll", xt, { passive: !0 });
    const Bt = new ResizeObserver(Jt);
    return Bt.observe(K), e(o) && Bt.observe(e(o)), window.addEventListener("resize", Jt), H(), () => {
      delete K.__snap, clearTimeout(ot), cancelAnimationFrame(At), Bt.disconnect(), window.removeEventListener("resize", Jt), K.removeEventListener("scroll", xt);
    };
  }), $t(() => {
    c.focusSearch && s && (s.focus(), s.select(), c.focusSearch = !1);
  });
  let I = /* @__PURE__ */ G(""), w = /* @__PURE__ */ G(Ct(c.ui.filter || "all")), $ = /* @__PURE__ */ G(Ct(c.ui.sort || c.settings.defaultSort || "recent")), B = /* @__PURE__ */ G(!1), te = /* @__PURE__ */ G(!1), he = /* @__PURE__ */ G(Ct(Number((() => {
    try {
      return localStorage.getItem("sl-size");
    } catch {
      return null;
    }
  })()) || c.mod && c.mod.layout && c.mod.layout.library && c.mod.layout.library.coverSize || 176));
  $t(() => {
    try {
      localStorage.setItem("sl-size", String(e(he)));
    } catch {
    }
  });
  const se = /* @__PURE__ */ P(() => Object.keys(c.collections)), de = /* @__PURE__ */ P(() => {
    let K = c.games.filter((qe) => e(w) === "hidden" ? c.hidden.includes(qe.id) : !c.hidden.includes(qe.id));
    if (e(w) === "installed") K = K.filter((qe) => qe.installed);
    else if (e(w) === "favorites") K = K.filter((qe) => c.favorites.includes(qe.id));
    else if (e(w) === "nonsteam") K = K.filter((qe) => qe.nonSteam);
    else if (e(w).startsWith("c:")) {
      const qe = (c.collections[e(w).slice(2)] || []).map(String);
      K = K.filter((ot) => qe.includes(ot.id));
    }
    const Ce = e(I).trim().toLowerCase();
    Ce && (K = K.filter((qe) => qe.name.toLowerCase().includes(Ce)));
    const Pe = {
      name: (qe, ot) => qe.name.localeCompare(ot.name),
      played: (qe, ot) => ua(ot) - ua(qe),
      recent: (qe, ot) => (ot.lastPlayed || 0) - (qe.lastPlayed || 0),
      installed: (qe, ot) => (ot.installed ? 1 : 0) - (qe.installed ? 1 : 0) || qe.name.localeCompare(ot.name),
      size: (qe, ot) => (ot.size || 0) - (qe.size || 0) || qe.name.localeCompare(ot.name)
    };
    return [...K].sort(Pe[e($)]);
  }), U = /* @__PURE__ */ P(() => c.games.some((K) => K.nonSteam)), re = () => {
    const K = e(de).filter((Ce) => Ce.installed);
    K.length ? $s(K[Math.floor(Math.random() * K.length)].id) : yt("No installed games match this view.");
  };
  async function ke() {
    g(te, !0), await Fa(), setTimeout(() => g(te, !1), 400);
  }
  const F = [
    ["recent", "Recently played"],
    ["name", "A to Z"],
    ["installed", "Installed first"],
    ["played", "Most played"],
    ["size", "Largest first"]
  ], ne = (K) => ve("app:openUrl", K), V = () => {
    g(I, ""), g(w, "all");
  };
  $t(() => {
    (e(w).startsWith("c:") && !e(se).includes(e(w).slice(2)) || e(w) === "hidden" && !c.hidden.length || e(w) === "nonsteam" && !e(U)) && g(w, "all");
  });
  let ye = !1;
  $t(() => {
    const K = e(w), Ce = e($);
    ye && or({ filter: K, sort: Ce });
  }), $t(() => {
    c.visible = e(z).map((K) => K.id);
  });
  let Se = /* @__PURE__ */ G(Ct([]));
  oa(async () => {
    ye = !0;
    try {
      g(Se, await ve("library:storage"), !0);
    } catch {
    }
    window.addEventListener("keydown", Re);
  }), nn(() => {
    window.removeEventListener("keydown", Re), c.sel = [];
  });
  const Re = (K) => {
    K.key === "Escape" && c.sel.length && (c.sel = [], K.stopPropagation());
  }, $e = /* @__PURE__ */ P(() => c.games.filter((K) => K.installed && !K.nonSteam && !c.hidden.includes(K.id))), Ye = /* @__PURE__ */ P(() => e($e).reduce((K, Ce) => K + (Ce.size || 0), 0)), ce = /* @__PURE__ */ P(() => e($e).length ? e($e).length + " installed, " + xn(e(Ye)) + " on disk" + (e(Se).length ? ", " + e(Se).map((K) => xn(K.free) + " free on " + K.drive.slice(0, 2).toUpperCase()).join(", ") : "") : "");
  let J = /* @__PURE__ */ G(!1), q = /* @__PURE__ */ G(!1);
  const D = (K) => {
    e(q) && !K.target.closest(".fwrap") && g(q, !1);
  };
  async function X(K) {
    const Ce = (c.collections[K] || []).map(String), Pe = [...c.sel];
    c.collections[K] = [.../* @__PURE__ */ new Set([...Ce, ...Pe])], await _r(), g(J, !1), c.sel = [], yt("Added " + Pe.length + (Pe.length === 1 ? " game" : " games") + " to " + K + ".", "", {
      label: "Undo",
      fn: async () => {
        c.collections[K] = Ce, await _r();
      }
    });
  }
  var fe = b1();
  xa("pointerdown", Ls, D), xa("keydown", Ls, (K) => K.key === "Escape" && g(q, !1));
  var Z = we(fe), W = l(Z), ee = l(W), pe = l(ee), R = l(pe), ge = n(l(R)), be = C(ge), N = n(R);
  {
    var ae = (K) => {
      var Ce = t1(), Pe = C(Ce, !0);
      L(() => T(Pe, e(ce))), v(K, Ce);
    };
    M(N, (K) => {
      e(ce) && K(ae);
    });
  }
  var ie = n(pe, 2), me = l(ie), Me = l(me);
  oe(Me, { name: "dice", size: 18 });
  var Ae = n(me, 2), Ie = l(Ae);
  oe(Ie, { name: "plus", size: 18 });
  var De = n(Ae, 2), Ge = l(De);
  let We;
  var Je = l(Ge);
  oe(Je, { name: "refresh", size: 18 });
  var vt = n(ee, 2), Q = l(vt), xe = l(Q);
  oe(xe, { name: "search", size: 18 });
  var Te = n(xe);
  _a(Te, (K) => s = K, () => s);
  var tt = n(Q, 2), He = l(tt);
  let lt;
  var ut = l(He);
  oe(ut, { name: "sliders", size: 17 });
  var it = n(ut, 2), jt = C(it, !0), Ke = n(He, 2);
  {
    var kt = (K) => {
      var Ce = s1(), Pe = n(l(Ce), 2);
      Ve(Pe, 17, () => F, _t, (It, ra) => {
        var Jt = /* @__PURE__ */ P(() => Ns(e(ra), 2));
        let Y = () => e(Jt)[0], _e = () => e(Jt)[1];
        var xt = a1();
        let Bt;
        var Ot = l(xt), Gt = l(Ot);
        {
          var Ht = (Yt) => {
            oe(Yt, { name: "check", size: 15, stroke: 3 });
          };
          M(Gt, (Yt) => {
            e($) === Y() && Yt(Ht);
          });
        }
        var Pt = n(Ot, 1, !0);
        L(() => {
          Bt = je(xt, 1, "fi svelte-khfokh", null, Bt, { on: e($) === Y() }), Be(xt, "aria-checked", e($) === Y()), T(Pt, _e());
        }), y("click", xt, () => {
          g($, Y(), !0);
        }), v(It, xt);
      });
      var qe = n(Pe, 6), ot = l(qe);
      oe(ot, { name: "grid", size: 16 });
      var At = n(ot);
      L(() => dt(At, `--p:${(e(he) - 130) / 130 * 100}%`)), ia(At, () => e(he), (It) => g(he, It)), bt(3, Ce, () => La, () => ({ y: -10, duration: 260, easing: ca })), v(K, Ce);
    };
    M(Ke, (K) => {
      e(q) && K(kt);
    });
  }
  var Mt = n(vt, 2), wt = l(Mt);
  let Ze;
  var st = n(wt, 2);
  let gt;
  var at = n(st, 2);
  let Qe;
  var mt = n(at, 2);
  {
    var Xe = (K) => {
      var Ce = r1();
      let Pe;
      L(() => Pe = je(Ce, 1, "chip", null, Pe, { on: e(w) === "nonsteam" })), y("click", Ce, () => g(w, "nonsteam")), v(K, Ce);
    };
    M(mt, (K) => {
      e(U) && K(Xe);
    });
  }
  var ue = n(mt, 2);
  Ve(ue, 17, () => e(se), _t, (K, Ce) => {
    var Pe = n1();
    let qe;
    var ot = C(Pe, !0);
    L(() => {
      qe = je(Pe, 1, "chip", null, qe, { on: e(w) === "c:" + e(Ce) }), T(ot, e(Ce));
    }), y("click", Pe, () => g(w, "c:" + e(Ce))), v(K, Pe);
  });
  var Ue = n(ue, 2);
  {
    var et = (K) => {
      var Ce = i1();
      let Pe;
      L(() => Pe = je(Ce, 1, "chip", null, Pe, { on: e(w) === "hidden" })), y("click", Ce, () => g(w, "hidden")), v(K, Ce);
    };
    M(Ue, (K) => {
      c.hidden.length && K(et);
    });
  }
  var Fe = n(Ue, 2);
  {
    var ft = (K) => {
      var Ce = l1();
      v(K, Ce);
    };
    M(Fe, (K) => {
      c.sel.length || K(ft);
    });
  }
  var rt = n(W, 2);
  {
    var ct = (K) => {
      var Ce = v1(), Pe = n(we(Ce), 2);
      Ve(Pe, 20, () => Array(12), _t, (qe, ot) => {
        var At = o1();
        v(qe, At);
      }), L(() => dt(Pe, `--size:${e(he) ?? ""}px`)), v(K, Ce);
    }, ze = (K) => {
      var Ce = c1(), Pe = l(Ce);
      oe(Pe, { name: "refresh", size: 30 });
      var qe = n(Pe, 2), ot = C(qe, !0), At = n(qe), It = C(At);
      L(() => T(ot, c.libError)), y("click", It, ke), v(K, Ce);
    }, nt = (K) => {
      var Ce = d1(), Pe = l(Ce);
      oe(Pe, { name: "library", size: 30 });
      var qe = n(Pe, 4), ot = l(qe), At = n(ot);
      y("click", ot, () => ne("https://steamcommunity.com/my/edit/settings?tab=privacy")), y("click", At, ke), v(K, Ce);
    }, pt = (K) => {
      var Ce = u1(), Pe = l(Ce);
      oe(Pe, { name: "search", size: 30 });
      var qe = n(Pe), ot = C(qe, !0), At = n(qe), It = C(At, !0), ra = n(At), Jt = C(ra);
      L(() => {
        T(ot, e(I) ? 'No games match "' + e(I) + '"' : "No games in this view"), T(It, e(I) ? "Check the spelling, or search with fewer words." : "Try a different filter.");
      }), y("click", Jt, V), v(K, Ce);
    }, Le = (K) => {
      var Ce = ta(), Pe = we(Ce);
      is(Pe, () => e(w) + e($), (qe) => {
        var ot = h1(), At = l(ot);
        Ve(At, 31, () => e(O), (It) => It.id, (It, ra, Jt) => {
          var Y = f1(), _e = l(Y);
          mn(_e, {
            get g() {
              return e(ra);
            },
            get i() {
              return e(Jt);
            }
          }), po(Y, () => Wo, () => ({ duration: e(de).length > 400 ? 0 : 400 })), v(It, Y);
        }), _a(ot, (It) => g(o, It), () => e(o)), L((It) => dt(At, `--size:${e(he) ?? ""}px; grid-template-columns: repeat(${e(_) ?? ""}, minmax(0, 1fr)); padding-top:${e(A) * e(b)}px; padding-bottom:${It ?? ""}px`), [
          () => Math.max(0, e(x) - e(j)) * e(b)
        ]), v(qe, ot);
      }), v(K, Ce);
    };
    M(rt, (K) => {
      c.libLoading && !c.games.length ? K(ct) : c.libError && !c.games.length ? K(ze, 1) : c.games.length ? e(de).length ? K(Le, -1) : K(pt, 3) : K(nt, 2);
    });
  }
  var St = n(Z, 2);
  {
    var Ft = (K) => {
      var Ce = _1(), Pe = l(Ce), qe = C(Pe), ot = n(Pe, 2), At = l(ot);
      oe(At, { name: "star", size: 15 });
      var It = n(ot, 2), ra = l(It);
      oe(ra, { name: "eye", size: 15 });
      var Jt = n(It, 2), Y = l(Jt);
      let _e;
      var xt = l(Y);
      oe(xt, { name: "layers", size: 15 });
      var Bt = n(Y, 2);
      {
        var Ot = (Ht) => {
          var Pt = g1();
          Ve(
            Pt,
            21,
            () => e(se),
            _t,
            (Yt, ea) => {
              var sa = p1(), ba = C(sa, !0);
              L(() => T(ba, e(ea))), y("click", sa, () => X(e(ea))), v(Yt, sa);
            },
            (Yt) => {
              var ea = m1();
              v(Yt, ea);
            }
          ), v(Ht, Pt);
        };
        M(Bt, (Ht) => {
          e(J) && Ht(Ot);
        });
      }
      var Gt = n(Jt, 2);
      L(() => {
        T(qe, `${c.sel.length ?? ""} selected`), _e = je(Y, 1, "btn sm", null, _e, { open: e(J) });
      }), y("click", ot, () => Xi("fav", c.sel)), y("click", It, () => Xi("hide", c.sel)), y("click", Y, () => g(J, !e(J))), y("click", Gt, () => c.sel = []), bt(1, Ce, () => La, () => ({ y: 20, duration: 360, easing: ca })), bt(2, Ce, () => ha, () => ({ duration: 160 })), v(K, Ce);
    };
    M(St, (K) => {
      c.sel.length && K(Ft);
    });
  }
  var Nt = n(St, 2);
  {
    var Vt = (K) => {
      Zf(K, { onclose: () => g(B, !1) });
    };
    M(Nt, (K) => {
      e(B) && K(Vt);
    });
  }
  L(
    (K) => {
      T(be, `${e(de).length ?? ""} ${e(de).length === 1 ? "game" : "games"}`), We = je(Ge, 1, "svelte-khfokh", null, We, { spin: e(te) }), lt = je(He, 1, "btn fbtn svelte-khfokh", null, lt, { open: e(q) }), Be(He, "aria-expanded", e(q)), T(jt, K), Ze = je(wt, 1, "chip", null, Ze, { on: e(w) === "all" }), gt = je(st, 1, "chip", null, gt, { on: e(w) === "installed" }), Qe = je(at, 1, "chip", null, Qe, { on: e(w) === "favorites" });
    },
    [() => (F.find((K) => K[0] === e($)) || [])[1]]
  ), y("click", me, re), y("click", Ae, () => g(B, !0)), y("click", De, ke), y("keydown", Te, (K) => {
    K.key === "Escape" && (g(I, ""), s.blur());
  }), ia(Te, () => e(I), (K) => g(I, K)), y("click", He, () => g(q, !e(q))), y("click", wt, () => g(w, "all")), y("click", st, () => g(w, "installed")), y("click", at, () => g(w, "favorites")), v(t, fe), Lt();
}
Wt(["click", "keydown"]);
var w1 = /* @__PURE__ */ h('<button role="switch" aria-label="Toggle"><i class="svelte-whip8s"></i></button>');
function Ut(t, a) {
  Tt(a, !0);
  let s = Dt(a, "checked", 3, !1);
  var r = w1();
  let i;
  L(() => {
    i = je(r, 1, "tg svelte-whip8s", null, i, { on: s() }), Be(r, "aria-checked", s());
  }), y("click", r, () => a.onchange && a.onchange(!s())), v(t, r), Lt();
}
Wt(["click"]);
var k1 = /* @__PURE__ */ h('<div class="page"><button class="btn"><!>Back</button><p class="muted" style="margin-top:16px">That game is no longer in your library.</p></div>'), x1 = /* @__PURE__ */ h('<span class="svelte-1p390nl"> </span>'), S1 = /* @__PURE__ */ h('<span class="dlst svelte-1p390nl"> </span>'), M1 = /* @__PURE__ */ h('<div class="dlbar rise svelte-1p390nl" style="--i:3"><i class="svelte-1p390nl"></i></div>'), T1 = /* @__PURE__ */ h('<div class="row ci svelte-1p390nl"><button class="grow ck svelte-1p390nl"><span><!></span> </button><button class="x svelte-1p390nl"><!></button></div>'), L1 = /* @__PURE__ */ h('<div class="pop glass svelte-1p390nl"><!> <div class="row"><input class="grow" placeholder="New collection"/><button class="btn">Create</button></div></div>'), z1 = /* @__PURE__ */ h('<button class="btn sm"><!>Open folder</button><button class="btn sm">Verify files</button><button class="btn sm danger">Uninstall</button>', 1), C1 = /* @__PURE__ */ h('<button class="btn sm danger">Remove</button>'), E1 = /* @__PURE__ */ h('<div class="pop glass svelte-1p390nl"><label class="f svelte-1p390nl">Launch options<input placeholder="-windowed -novid"/></label> <label class="f svelte-1p390nl">Game file override <span class="faint">(optional)</span><div class="row"><input class="grow"/><button class="btn"><!>Browse</button></div></label> <div class="row"><div class="grow"><b>Run as administrator</b></div><!></div> <div class="row wrap svelte-1p390nl"><button class="btn primary">Save</button><div class="grow"></div> <!> <!> <button class="btn sm"><!> </button></div></div>'), A1 = /* @__PURE__ */ h("<button> </button>"), I1 = /* @__PURE__ */ h('<div class="card st rise svelte-1p390nl" style="--i:9"><!><div class="faint">Achievements</div><b class="svelte-1p390nl"><!></b></div>'), P1 = /* @__PURE__ */ h('<div class="stats svelte-1p390nl"><div class="card st rise svelte-1p390nl" style="--i:6"><!><div class="faint">Time played</div><b class="svelte-1p390nl"><!></b></div> <div class="card st rise svelte-1p390nl" style="--i:7"><!><div class="faint">Tracked here</div><b class="svelte-1p390nl"> </b></div> <div class="card st rise svelte-1p390nl" style="--i:8"><!><div class="faint">Launches</div><b class="svelte-1p390nl"><!></b></div> <!></div> <div class="sech"><h2>Notes</h2></div> <textarea rows="5" placeholder="Anything worth remembering about this game" class="svelte-1p390nl"></textarea>', 1), D1 = /* @__PURE__ */ h('<div class="skel" style="height:72px"></div>'), N1 = /* @__PURE__ */ h('<div class="achs svelte-1p390nl"></div>'), O1 = /* @__PURE__ */ h('<div class="muted">No achievements to show. The game may have none, or its stats are private.</div>'), q1 = /* @__PURE__ */ h('<img alt="" class="svelte-1p390nl"/>'), j1 = /* @__PURE__ */ h('<div><!><div><b> </b><div class="muted"> </div></div></div>'), H1 = /* @__PURE__ */ h('<div class="card prog svelte-1p390nl"><div class="row"><b class="grow"> </b><span class="muted"> </span></div><div class="track svelte-1p390nl"><i class="svelte-1p390nl"></i></div></div> <div class="achs svelte-1p390nl"></div>', 1), R1 = /* @__PURE__ */ h('<div class="skel" style="height:110px"></div>'), $1 = /* @__PURE__ */ h('<div class="muted">No news for this game.</div>'), F1 = /* @__PURE__ */ h('<button class="card nw rise svelte-1p390nl"><div class="eyebrow"> </div><b class="svelte-1p390nl"> </b><p class="muted svelte-1p390nl"> </p></button>'), B1 = /* @__PURE__ */ h("<div><!></div>"), G1 = /* @__PURE__ */ h('<div class="hero svelte-1p390nl"><div class="bg svelte-1p390nl"><!></div> <div class="shade svelte-1p390nl"></div> <button class="btn back glass svelte-1p390nl"><!>Back</button></div> <div class="page body svelte-1p390nl"><div class="top svelte-1p390nl"><div class="cap svelte-1p390nl"><!></div> <div class="grow info svelte-1p390nl"><div class="eyebrow rise" style="--i:1"> </div> <h1 class="rise svelte-1p390nl" style="--i:2"> </h1> <div class="facts rise svelte-1p390nl" style="--i:3"><span class="svelte-1p390nl"><!> </span><span class="svelte-1p390nl"> </span><!><!></div> <!> <div class="row act rise svelte-1p390nl" style="--i:4"><!> <button title="Favorite"><!></button> <button><!>Collections</button> <button><!>Options</button></div></div></div> <!> <div class="tabs rise svelte-1p390nl" style="--i:5"><div class="ind svelte-1p390nl"></div> <!></div> <!></div>', 1);
function W1(t, a) {
  Tt(a, !0);
  const s = /* @__PURE__ */ P(() => xr(c.gameId)), r = /* @__PURE__ */ P(() => e(s) && c.favorites.includes(e(s).id));
  let i = /* @__PURE__ */ G("overview"), o = /* @__PURE__ */ G(null), d = /* @__PURE__ */ G(null), f = /* @__PURE__ */ G(""), u = /* @__PURE__ */ G(Ct({ args: "", exePath: "", admin: !1 })), m = /* @__PURE__ */ G(""), p = /* @__PURE__ */ G(""), _;
  Ct([]), oa(async () => {
    e(s) && (Io(e(s)), g(f, await ve("game:notes", e(s).id), !0), g(u, await ve("game:config", e(s).id), !0), e(s).nonSteam || (ve("game:achievements", e(s).id).then((F) => g(o, F, !0)), ve("game:news", e(s).id).then((F) => g(d, F, !0))));
  });
  const k = () => {
    clearTimeout(_), _ = setTimeout(() => ve("game:saveNotes", { id: e(s).id, text: e(f) }), 600);
  };
  async function b() {
    await ve("game:saveConfig", { id: e(s).id, ...e(u) }), yt("Launch options saved."), g(m, "");
  }
  async function S() {
    const F = await ve("dialog:exe");
    F && (e(u).exePath = F);
  }
  const E = (F) => (c.collections[F] || []).map(String).includes(e(s).id);
  async function z(F) {
    const ne = (c.collections[F] || []).map(String);
    c.collections[F] = ne.includes(e(s).id) ? ne.filter((V) => V !== e(s).id) : [...ne, e(s).id], await _r();
  }
  async function x() {
    const F = e(p).trim();
    !F || c.collections[F] || (c.collections[F] = [e(s).id], g(p, ""), await _r());
  }
  async function A(F) {
    const ne = c.collections[F];
    delete c.collections[F], await _r(), yt("Deleted the collection " + F + ".", "", {
      label: "Undo",
      fn: async () => {
        c.collections[F] = ne, await _r();
      }
    });
  }
  const j = /* @__PURE__ */ P(() => e(s) && c.progress[e(s).id]), O = {
    downloading: "Downloading",
    installing: "Installing",
    updating: "Updating",
    verifying: "Verifying files",
    paused: "Download paused",
    waiting: "Waiting in the Steam queue"
  };
  async function H() {
    await ve("nonsteam:remove", e(s).id), await Fa(), hn();
  }
  const I = /* @__PURE__ */ P(() => e(o) ? e(o).filter((F) => F.achieved).length : 0), w = /* @__PURE__ */ P(() => e(o) && e(o).length ? Math.round(e(I) / e(o).length * 100) : 0), $ = (F) => ve("game:steamAction", { id: e(s).id, action: F }), B = /* @__PURE__ */ P(() => [
    ["overview", "Overview"],
    ...e(s) && !e(s).nonSteam ? [
      [
        "ach",
        "Achievements" + (e(o) && e(o).length ? " " + e(I) + "/" + e(o).length : "")
      ],
      ["news", "News"]
    ] : []
  ]), te = /* @__PURE__ */ P(() => Math.max(0, e(B).findIndex((F) => F[0] === e(i))));
  let he = Ct([]);
  const se = /* @__PURE__ */ P(() => he[e(te)] ? {
    x: he[e(te)].offsetLeft,
    w: he[e(te)].offsetWidth
  } : { x: 0, w: 0 });
  var de = ta(), U = we(de);
  {
    var re = (F) => {
      var ne = k1(), V = l(ne), ye = l(V);
      oe(ye, { name: "back", size: 17 }), y("click", V, function(...Se) {
        hn?.apply(this, Se);
      }), v(F, ne);
    }, ke = (F) => {
      var ne = G1(), V = we(ne), ye = l(V), Se = l(ye);
      fs(Se, {
        get g() {
          return e(s);
        },
        kind: "hero"
      });
      var Re = n(ye, 4), $e = l(Re);
      oe($e, { name: "back", size: 17 });
      var Ye = n(V, 2), ce = l(Ye), J = l(ce), q = l(J);
      fs(q, {
        get g() {
          return e(s);
        }
      });
      var D = n(J, 2), X = l(D), fe = C(X, !0), Z = n(X, 2), W = C(Z, !0), ee = n(Z, 2), pe = l(ee), R = l(pe);
      oe(R, { name: "clock", size: 15 });
      var ge = n(R), be = n(pe), N = C(be, !0), ae = n(be);
      {
        var ie = (Ze) => {
          var st = x1(), gt = C(st, !0);
          L((at) => T(gt, at), [() => xn(e(s).size)]), v(Ze, st);
        };
        M(ae, (Ze) => {
          e(s).size && Ze(ie);
        });
      }
      var me = n(ae);
      {
        var Me = (Ze) => {
          var st = S1(), gt = C(st);
          L((at) => T(gt, `${(O[e(j).a] || "Working") ?? ""}${at ?? ""}`), [
            () => e(j).a === "downloading" || e(j).a === "installing" || e(j).a === "paused" ? " " + Math.round(e(j).p * 100) + "%" : ""
          ]), v(Ze, st);
        };
        M(me, (Ze) => {
          e(j) && Ze(Me);
        });
      }
      var Ae = n(ee, 2);
      {
        var Ie = (Ze) => {
          var st = M1(), gt = C(st);
          L((at) => dt(gt, `width:${at ?? ""}%`), [() => Math.round(e(j).p * 100)]), v(Ze, st);
        };
        M(Ae, (Ze) => {
          e(j) && Ze(Ie);
        });
      }
      var De = n(Ae, 2), Ge = l(De);
      Vo(Ge, {
        get g() {
          return e(s);
        },
        onInstall: () => $("install")
      });
      var We = n(Ge, 2);
      let Je;
      var vt = l(We);
      oe(vt, { name: "star", size: 18 });
      var Q = n(We, 2);
      let xe;
      var Te = l(Q);
      oe(Te, { name: "layers", size: 18 });
      var tt = n(Q, 2);
      let He;
      var lt = l(tt);
      oe(lt, { name: "sliders", size: 18 });
      var ut = n(ce, 2);
      {
        var it = (Ze) => {
          var st = L1(), gt = l(st);
          Ve(gt, 16, () => Object.keys(c.collections), (Xe) => Xe, (Xe, ue) => {
            var Ue = T1(), et = l(Ue), Fe = l(et);
            let ft;
            var rt = l(Fe);
            oe(rt, { name: "check", size: 13, stroke: 3 });
            var ct = n(Fe, 1, !0), ze = n(et), nt = l(ze);
            oe(nt, { name: "x", size: 15 }), L(
              (pt) => {
                ft = je(Fe, 1, "box svelte-1p390nl", null, ft, { on: pt }), T(ct, ue), Be(ze, "aria-label", "Delete " + ue);
              },
              [() => E(ue)]
            ), y("click", et, () => z(ue)), y("click", ze, () => A(ue)), v(Xe, Ue);
          });
          var at = n(gt, 2), Qe = l(at), mt = n(Qe);
          y("keydown", Qe, (Xe) => Xe.key === "Enter" && x()), ia(Qe, () => e(p), (Xe) => g(p, Xe)), y("click", mt, x), bt(3, st, () => ci, () => ({ duration: 400, easing: ca })), v(Ze, st);
        }, jt = (Ze) => {
          var st = E1(), gt = l(st), at = n(l(gt)), Qe = n(gt, 2), mt = n(l(Qe), 2), Xe = l(mt), ue = n(Xe), Ue = l(ue);
          oe(Ue, { name: "folder", size: 17 });
          var et = n(Qe, 2), Fe = n(l(et));
          Ut(Fe, {
            get checked() {
              return e(u).admin;
            },
            onchange: (Nt) => e(u).admin = Nt
          });
          var ft = n(et, 2), rt = l(ft), ct = n(rt, 3);
          {
            var ze = (Nt) => {
              var Vt = z1(), K = we(Vt), Ce = l(K);
              oe(Ce, { name: "folder", size: 15 });
              var Pe = n(K), qe = n(Pe);
              y("click", K, () => ve("game:openFolder", e(s).id)), y("click", Pe, () => $("verify")), y("click", qe, () => $("uninstall")), v(Nt, Vt);
            };
            M(ct, (Nt) => {
              !e(s).nonSteam && e(s).installed && Nt(ze);
            });
          }
          var nt = n(ct, 2);
          {
            var pt = (Nt) => {
              var Vt = C1();
              y("click", Vt, H), v(Nt, Vt);
            };
            M(nt, (Nt) => {
              e(s).nonSteam && Nt(pt);
            });
          }
          var Le = n(nt, 2), St = l(Le);
          oe(St, { name: "eye", size: 15 });
          var Ft = n(St, 1, !0);
          L((Nt) => T(Ft, Nt), [() => c.hidden.includes(e(s).id) ? "Unhide" : "Hide"]), ia(at, () => e(u).args, (Nt) => e(u).args = Nt), ia(Xe, () => e(u).exePath, (Nt) => e(u).exePath = Nt), y("click", ue, S), y("click", rt, b), y("click", Le, () => Mo(e(s).id)), bt(3, st, () => ci, () => ({ duration: 400, easing: ca })), v(Ze, st);
        };
        M(ut, (Ze) => {
          e(m) === "col" ? Ze(it) : e(m) === "opt" && Ze(jt, 1);
        });
      }
      var Ke = n(ut, 2), kt = l(Ke), Mt = n(kt, 2);
      Ve(Mt, 17, () => e(B), _t, (Ze, st, gt) => {
        var at = /* @__PURE__ */ P(() => Ns(e(st), 2));
        let Qe = () => e(at)[0], mt = () => e(at)[1];
        var Xe = A1();
        let ue;
        var Ue = C(Xe, !0);
        _a(Xe, (et, Fe) => he[Fe] = et, (et) => he?.[et], () => [gt]), L(() => {
          ue = je(Xe, 1, "svelte-1p390nl", null, ue, { on: e(i) === Qe() }), T(Ue, mt());
        }), y("click", Xe, () => g(i, Qe(), !0)), v(Ze, Xe);
      }), zt(Ke, (Ze) => In?.(Ze));
      var wt = n(Ke, 2);
      is(wt, () => e(i), (Ze) => {
        var st = B1(), gt = l(st);
        {
          var at = (Xe) => {
            var ue = P1(), Ue = we(ue), et = l(Ue), Fe = l(et);
            oe(Fe, { name: "clock", size: 20 });
            var ft = n(Fe, 2), rt = l(ft);
            {
              let Pe = /* @__PURE__ */ P(() => ua(e(s)) / 3600);
              Ca(rt, {
                get value() {
                  return e(Pe);
                },
                format: (qe) => (qe < 10 ? qe.toFixed(1) : Math.round(qe)) + " h"
              });
            }
            var ct = n(et, 2), ze = l(ct);
            oe(ze, { name: "bolt", size: 20 });
            var nt = n(ze, 2), pt = C(nt, !0), Le = n(ct, 2), St = l(Le);
            oe(St, { name: "play", size: 20 });
            var Ft = n(St, 2), Nt = l(Ft);
            {
              let Pe = /* @__PURE__ */ P(() => e(s).launches || 0);
              Ca(Nt, {
                get value() {
                  return e(Pe);
                }
              });
            }
            var Vt = n(Le, 2);
            {
              var K = (Pe) => {
                var qe = I1(), ot = l(qe);
                oe(ot, { name: "trophy", size: 20 });
                var At = n(ot, 2), It = l(At);
                Ca(It, {
                  get value() {
                    return e(w);
                  },
                  format: (ra) => Math.round(ra) + "%"
                }), v(Pe, qe);
              };
              M(Vt, (Pe) => {
                e(o) && e(o).length && Pe(K);
              });
            }
            var Ce = n(Ue, 4);
            L((Pe) => T(pt, Pe), [() => Ia(e(s).seconds)]), y("input", Ce, k), ia(Ce, () => e(f), (Pe) => g(f, Pe)), v(Xe, ue);
          }, Qe = (Xe) => {
            var ue = ta(), Ue = we(ue);
            {
              var et = (rt) => {
                var ct = N1();
                Ve(ct, 20, () => Array(6), _t, (ze, nt) => {
                  var pt = D1();
                  v(ze, pt);
                }), v(rt, ct);
              }, Fe = (rt) => {
                var ct = O1();
                v(rt, ct);
              }, ft = (rt) => {
                var ct = H1(), ze = we(ct), nt = l(ze), pt = l(nt), Le = C(pt), St = n(pt), Ft = C(St), Nt = n(nt), Vt = C(Nt), K = n(ze, 2);
                Ve(K, 21, () => [...e(o)].sort((Ce, Pe) => Pe.achieved - Ce.achieved), _t, (Ce, Pe, qe) => {
                  var ot = j1();
                  let At;
                  var It = l(ot);
                  {
                    var ra = (Ot) => {
                      var Gt = q1();
                      L(() => Be(Gt, "src", e(Pe).icon)), v(Ot, Gt);
                    };
                    M(It, (Ot) => {
                      e(Pe).icon && Ot(ra);
                    });
                  }
                  var Jt = n(It), Y = l(Jt), _e = C(Y, !0), xt = n(Y), Bt = C(xt, !0);
                  L(
                    (Ot) => {
                      At = je(ot, 1, "card ach rise svelte-1p390nl", null, At, { off: !e(Pe).achieved }), dt(ot, `--i:${Ot ?? ""}`), T(_e, e(Pe).name), T(Bt, e(Pe).description);
                    },
                    [() => Math.min(qe, 12)]
                  ), v(Ce, ot);
                }), L(() => {
                  T(Le, `${e(I) ?? ""} of ${e(o).length ?? ""} unlocked`), T(Ft, `${e(w) ?? ""}%`), dt(Vt, `width:${e(w) ?? ""}%`);
                }), v(rt, ct);
              };
              M(Ue, (rt) => {
                e(o) === null ? rt(et) : e(o).length ? rt(ft, -1) : rt(Fe, 1);
              });
            }
            v(Xe, ue);
          }, mt = (Xe) => {
            var ue = ta(), Ue = we(ue);
            {
              var et = (rt) => {
                var ct = R1();
                v(rt, ct);
              }, Fe = (rt) => {
                var ct = $1();
                v(rt, ct);
              }, ft = (rt) => {
                var ct = ta(), ze = we(ct);
                Ve(ze, 17, () => e(d), _t, (nt, pt, Le) => {
                  var St = F1();
                  dt(St, `--i:${Le}`);
                  var Ft = l(St), Nt = C(Ft, !0), Vt = n(Ft), K = C(Vt, !0), Ce = n(Vt), Pe = C(Ce, !0);
                  L(
                    (qe) => {
                      T(Nt, qe), T(K, e(pt).title), T(Pe, e(pt).text);
                    },
                    [() => Sn(e(pt).date)]
                  ), y("click", St, () => e(pt).url && ve("app:openUrl", e(pt).url)), v(nt, St);
                }), v(rt, ct);
              };
              M(Ue, (rt) => {
                e(d) === null ? rt(et) : e(d).length ? rt(ft, -1) : rt(Fe, 1);
              });
            }
            v(Xe, ue);
          };
          M(gt, (Xe) => {
            e(i) === "overview" ? Xe(at) : e(i) === "ach" ? Xe(Qe, 1) : Xe(mt, -1);
          });
        }
        bt(1, st, () => La, () => ({ y: 16, duration: 500, easing: ca })), v(Ze, st);
      }), L(
        (Ze, st) => {
          T(fe, e(s).nonSteam ? "Non-Steam game" : e(s).installed ? "Installed" : "Not installed"), T(W, e(s).name), T(ge, `${Ze ?? ""} played`), T(N, st), Je = je(We, 1, "btn icon svelte-1p390nl", null, Je, { fav: e(r) }), Be(We, "aria-label", e(r) ? "Remove from favorites" : "Add to favorites"), xe = je(Q, 1, "btn svelte-1p390nl", null, xe, { open: e(m) === "col" }), He = je(tt, 1, "btn svelte-1p390nl", null, He, { open: e(m) === "opt" }), dt(kt, `transform: translateX(${e(se).x ?? ""}px); width:${e(se).w ?? ""}px`);
        },
        [
          () => Ia(ua(e(s))),
          () => e(s).lastPlayed ? "Last played " + lr(e(s).lastPlayed).toLowerCase() : "Never played"
        ]
      ), y("click", Re, function(...Ze) {
        hn?.apply(this, Ze);
      }), bt(1, J, () => La, () => ({ y: 24, duration: 600, easing: ca })), y("click", We, () => So(e(s).id)), y("click", Q, () => g(m, e(m) === "col" ? "" : "col", !0)), y("click", tt, () => g(m, e(m) === "opt" ? "" : "opt", !0)), v(F, ne);
    };
    M(U, (F) => {
      e(s) ? F(ke, -1) : F(re);
    });
  }
  v(t, de), Lt();
}
Wt(["click", "keydown", "input"]);
var Y1 = /* @__PURE__ */ h('<div class="skel svelte-vvfy98" style="height:120px"></div>'), U1 = /* @__PURE__ */ h('<div class="muted svelte-vvfy98">Could not load the roadmap. Check your connection.</div>'), V1 = /* @__PURE__ */ h('<p class="muted svelte-vvfy98"> </p>'), K1 = /* @__PURE__ */ h('<li class="svelte-vvfy98"> </li>'), X1 = /* @__PURE__ */ h('<ul class="svelte-vvfy98"></ul>'), J1 = /* @__PURE__ */ h('<p class="note svelte-vvfy98"> </p>'), Z1 = /* @__PURE__ */ h('<span class="faint svelte-vvfy98"> </span>'), Q1 = /* @__PURE__ */ h('<div class="prog svelte-vvfy98" role="progressbar" aria-valuemin="0" aria-valuemax="100"><i class="svelte-vvfy98"></i></div> <div class="pl svelte-vvfy98"><span class="svelte-vvfy98"> </span><!></div>', 1), eh = /* @__PURE__ */ h('<article><div class="when svelte-vvfy98"><b class="svelte-vvfy98"> </b><small class="svelte-vvfy98"> </small></div> <div class="dot svelte-vvfy98"><i class="svelte-vvfy98"></i></div> <div class="card body svelte-vvfy98"><div class="top svelte-vvfy98"><h3 class="svelte-vvfy98"> </h3><span class="chip svelte-vvfy98"> </span></div> <!> <!> <!> <!></div></article>'), th = /* @__PURE__ */ h('<div class="faint upd svelte-vvfy98"> </div>'), ah = /* @__PURE__ */ h('<div class="road svelte-vvfy98"></div> <!>', 1);
function sh(t, a) {
  Tt(a, !0);
  let s = /* @__PURE__ */ G(null);
  oa(() => {
    ve("news:roadmap").then((b) => g(s, b, !0)).catch(() => g(s, { items: [] }, !0));
  });
  const r = {
    shipped: "Released",
    progress: "In progress",
    planned: "Planned",
    delayed: "Delayed",
    conditional: "If ready"
  }, i = (b) => {
    const S = /* @__PURE__ */ new Date(b + "T12:00:00");
    return isNaN(S) ? b : S.toLocaleDateString(void 0, { month: "short", day: "numeric" });
  }, o = (b) => {
    const S = /* @__PURE__ */ new Date(b + "T12:00:00");
    return isNaN(S) ? "" : S.getFullYear();
  }, d = (b) => Math.max(0, Math.min(100, Number(b.progress) || 0)), f = /* @__PURE__ */ P(() => e(s) && Array.isArray(e(s).items) ? e(s).items : []);
  var u = ta(), m = we(u);
  {
    var p = (b) => {
      var S = ta(), E = we(S);
      Ve(E, 16, () => Array(3), _t, (z, x) => {
        var A = Y1();
        v(z, A);
      }), v(b, S);
    }, _ = (b) => {
      var S = U1();
      v(b, S);
    }, k = (b) => {
      var S = ah(), E = we(S);
      Ve(E, 23, () => e(f), (A) => A.id || A.title, (A, j, O) => {
        var H = eh();
        let I;
        var w = l(H), $ = l(w), B = C($, !0), te = n($), he = C(te, !0), se = n(w, 2), de = n(se, 2), U = l(de), re = l(U), ke = C(re, !0), F = n(re), ne = C(F, !0), V = n(U, 2);
        {
          var ye = (q) => {
            var D = V1(), X = C(D, !0);
            L(() => T(X, e(j).text)), v(q, D);
          };
          M(V, (q) => {
            e(j).text && q(ye);
          });
        }
        var Se = n(V, 2);
        {
          var Re = (q) => {
            var D = X1();
            Ve(D, 21, () => e(j).features, _t, (X, fe) => {
              var Z = K1(), W = C(Z, !0);
              L(() => T(W, e(fe))), v(X, Z);
            }), v(q, D);
          };
          M(Se, (q) => {
            e(j).features && e(j).features.length && q(Re);
          });
        }
        var $e = n(Se, 2);
        {
          var Ye = (q) => {
            var D = J1(), X = C(D, !0);
            L(() => T(X, e(j).note)), v(q, D);
          };
          M($e, (q) => {
            e(j).note && q(Ye);
          });
        }
        var ce = n($e, 2);
        {
          var J = (q) => {
            var D = Q1(), X = we(D), fe = C(X), Z = n(X, 2), W = l(Z), ee = C(W), pe = n(W);
            {
              var R = (ge) => {
                var be = Z1(), N = C(be, !0);
                L(() => T(N, e(j).progressLabel)), v(ge, be);
              };
              M(pe, (ge) => {
                e(j).progressLabel && ge(R);
              });
            }
            L(
              (ge, be, N) => {
                Be(X, "aria-valuenow", ge), dt(fe, `width:${be ?? ""}%`), T(ee, `${N ?? ""}%`);
              },
              [
                () => d(e(j)),
                () => d(e(j)),
                () => d(e(j))
              ]
            ), v(q, D);
          };
          M(ce, (q) => {
            (e(j).status !== "shipped" || e(j).progress !== void 0) && q(J);
          });
        }
        L(
          (q, D) => {
            I = je(H, 1, "step rise svelte-vvfy98", null, I, { done: e(j).status === "shipped" }), dt(H, `--i:${e(O) ?? ""}`), T(B, q), T(he, D), Be(se, "data-s", e(j).status), T(ke, e(j).title), Be(F, "data-s", e(j).status), T(ne, r[e(j).status] || e(j).status);
          },
          [() => i(e(j).date), () => o(e(j).date)]
        ), v(A, H);
      });
      var z = n(E, 2);
      {
        var x = (A) => {
          var j = th(), O = C(j);
          L(() => T(O, `Updated ${e(s).updated ?? ""}. This list can change as we learn more.`)), v(A, j);
        };
        M(z, (A) => {
          e(s).updated && A(x);
        });
      }
      v(b, S);
    };
    M(m, (b) => {
      e(s) === null ? b(p) : e(f).length ? b(k, -1) : b(_, 1);
    });
  }
  v(t, u), Lt();
}
var rh = /* @__PURE__ */ h('<div class="skel" style="height:96px"></div>'), nh = /* @__PURE__ */ h('<div class="skel" style="height:210px"></div><!>', 1), ih = /* @__PURE__ */ h('<div class="empty card svelte-e7wisb"><!><h3 class="svelte-e7wisb"> </h3><p class="muted"> </p><button class="btn"><!>Try again</button></div>'), lh = /* @__PURE__ */ h("<button> </button>"), oh = /* @__PURE__ */ h('<span class="cover svelte-e7wisb"></span>'), il = /* @__PURE__ */ h('<span class="new svelte-e7wisb">New</span>'), vh = /* @__PURE__ */ h('<span class="muted fsum svelte-e7wisb"> </span>'), ch = /* @__PURE__ */ h('<button class="feature card link rise svelte-e7wisb" style="--i:0"><!> <span class="ftext svelte-e7wisb"><span class="meta svelte-e7wisb"><span class="tag hot svelte-e7wisb"> </span><!><span class="faint"> </span></span> <b class="ftitle svelte-e7wisb"> </b> <!> <span class="more svelte-e7wisb">Read the post<!></span></span></button>'), dh = /* @__PURE__ */ h('<span class="muted psum svelte-e7wisb"> </span>'), uh = /* @__PURE__ */ h('<span class="thumb svelte-e7wisb"></span>'), fh = /* @__PURE__ */ h('<button class="card post link rise svelte-e7wisb"><span class="time svelte-e7wisb"> </span> <span class="pbody svelte-e7wisb"><span class="meta svelte-e7wisb"><span class="tag svelte-e7wisb"> </span><!></span> <b class="ptitle svelte-e7wisb"> </b> <!></span> <!></button>'), hh = /* @__PURE__ */ h('<section class="day svelte-e7wisb"><h2 class="dh svelte-e7wisb"> </h2> <div class="posts svelte-e7wisb"></div></section>'), ph = /* @__PURE__ */ h('<div class="muted none svelte-e7wisb">No posts match your search.</div>'), mh = /* @__PURE__ */ h('<button class="btn more-btn svelte-e7wisb"> </button>'), gh = /* @__PURE__ */ h('<div class="tools svelte-e7wisb"><label class="search svelte-e7wisb"><!><input placeholder="Search news" aria-label="Search news" class="svelte-e7wisb"/></label> <div class="chips svelte-e7wisb"></div></div> <!> <!> <!> <!>', 1), _h = /* @__PURE__ */ h('<div class="skel" style="height:110px"></div>'), bh = /* @__PURE__ */ h('<div class="muted">No news for your games right now.</div>'), yh = /* @__PURE__ */ h('<p class="muted svelte-e7wisb"> </p>'), wh = /* @__PURE__ */ h('<button class="card gpost link rise svelte-e7wisb"><div class="meta svelte-e7wisb"><span class="tag svelte-e7wisb"> </span><span class="faint"> </span><span class="grow"></span><!></div><h3 class="svelte-e7wisb"> </h3><!></button>'), kh = /* @__PURE__ */ h('<div class="list svelte-e7wisb"><!></div>'), xh = /* @__PURE__ */ h('<div class="page mid"><div class="phead"><div class="hd rise svelte-e7wisb" style="--i:0"><h1 class="title">News</h1><p class="sub">What is new in SteamLite and in the games you play.</p></div> <div class="seg rise svelte-e7wisb" style="--i:1"><div class="ind svelte-e7wisb"></div><button>SteamLite</button><button>Roadmap</button><button>Your games</button></div></div> <!></div> <!>', 1);
function Sh(t, a) {
  Tt(a, !0);
  let s = /* @__PURE__ */ G("steamlite"), r = /* @__PURE__ */ G(null), i = /* @__PURE__ */ G(!1), o = /* @__PURE__ */ G(null), d = /* @__PURE__ */ G(""), f = /* @__PURE__ */ G("All"), u = /* @__PURE__ */ G(14), m = /* @__PURE__ */ G(null), p = /* @__PURE__ */ G("");
  const _ = "sl-news-seen", k = () => {
    try {
      return localStorage.getItem(_) || "";
    } catch {
      return "";
    }
  };
  async function b() {
    g(r, null), g(i, !1);
    const J = await ve("news:list");
    g(i, !!J.failed), g(r, (J.posts || []).slice().sort((q, D) => new Date(D.date) - new Date(q.date)), !0);
  }
  oa(() => {
    g(p, k(), !0), b(), ve("news:feed").then((J) => g(o, J, !0)).catch(() => g(o, [], !0));
  }), $t(() => {
    if (e(s) === "steamlite" && e(r) && e(r).length) {
      const J = setTimeout(
        () => {
          try {
            localStorage.setItem(_, e(r)[0].date);
          } catch {
          }
        },
        2500
      );
      return () => clearTimeout(J);
    }
  });
  const S = (J) => !!e(p) && new Date(J.date) > new Date(e(p)), E = /* @__PURE__ */ P(() => e(r) ? ["All", ...new Set(e(r).map((J) => J.tag))] : ["All"]), z = /* @__PURE__ */ P(() => (e(r) || []).filter((J) => (e(f) === "All" || J.tag === e(f)) && (!e(d).trim() || (J.title + " " + (J.summary || "")).toLowerCase().includes(e(d).trim().toLowerCase())))), x = /* @__PURE__ */ P(() => !e(d).trim() && e(f) === "All" ? e(z).find((J) => J.pinned) || e(z)[0] : null), A = /* @__PURE__ */ P(() => e(z).filter((J) => J !== e(x))), j = /* @__PURE__ */ P(() => e(A).slice(0, e(u))), O = (J, q) => J.getFullYear() === q.getFullYear() && J.getMonth() === q.getMonth() && J.getDate() === q.getDate();
  function H(J) {
    const q = new Date(J), D = /* @__PURE__ */ new Date(), X = new Date(D.getTime() - 864e5);
    return O(q, D) ? "Today" : O(q, X) ? "Yesterday" : q.toLocaleDateString(void 0, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: q.getFullYear() === D.getFullYear() ? void 0 : "numeric"
    });
  }
  const I = /* @__PURE__ */ P(() => {
    const J = [];
    for (const q of e(j)) {
      const D = H(q.date), X = J[J.length - 1];
      X && X.k === D ? X.posts.push(q) : J.push({ k: D, posts: [q] });
    }
    return J;
  }), w = (J) => new Date(J).toLocaleTimeString(void 0, { hour: "numeric", minute: "2-digit" }), $ = (J) => {
    const q = Math.round((Date.now() - new Date(J)) / 6e4);
    if (q < 1) return "just now";
    if (q < 60) return q + " min ago";
    const D = Math.round(q / 60);
    if (D < 24) return D + " h ago";
    const X = Math.round(D / 24);
    return X < 30 ? X + " days ago" : "";
  }, B = (J) => J && ve("app:openUrl", J), te = (J, q) => {
    const D = J.currentTarget;
    g(
      m,
      {
        item: {
          title: q.title,
          tag: q.tag,
          date: q.date,
          file: q.file,
          release: q.release
        },
        rect: D.getBoundingClientRect(),
        el: D
      },
      // the card is hidden while it is open: it is the card that grows
      !0
    ), D.style.visibility = "hidden";
  }, he = () => {
    e(m) && e(m).el && (e(m).el.style.visibility = ""), g(m, null);
  };
  var se = xh(), de = we(se), U = l(de), re = n(l(U), 2), ke = l(re), F = n(ke);
  let ne;
  var V = n(F);
  let ye;
  var Se = n(V);
  let Re;
  zt(re, (J) => In?.(J));
  var $e = n(U, 2);
  is($e, () => e(s), (J) => {
    var q = kh(), D = l(q);
    {
      var X = (pe) => {
        var R = ta(), ge = we(R);
        {
          var be = (ie) => {
            var me = nh(), Me = n(we(me));
            Ve(Me, 16, () => Array(3), _t, (Ae, Ie) => {
              var De = rh();
              v(Ae, De);
            }), v(ie, me);
          }, N = (ie) => {
            var me = ih(), Me = l(me);
            oe(Me, { name: "news", size: 28 });
            var Ae = n(Me), Ie = C(Ae, !0), De = n(Ae), Ge = C(De, !0), We = n(De), Je = l(We);
            oe(Je, { name: "refresh", size: 16 }), L(() => {
              T(Ie, e(i) ? "The news did not load" : "No news yet"), T(Ge, e(i) ? "SteamLite could not reach GitHub. Check your connection, then try again." : "Nothing has been posted yet.");
            }), y("click", We, b), v(ie, me);
          }, ae = (ie) => {
            var me = gh(), Me = we(me), Ae = l(Me), Ie = l(Ae);
            oe(Ie, { name: "search", size: 16 });
            var De = n(Ie), Ge = n(Ae, 2);
            Ve(Ge, 21, () => e(E), _t, (He, lt) => {
              var ut = lh();
              let it;
              var jt = C(ut, !0);
              L(() => {
                it = je(ut, 1, "chip", null, it, { on: e(f) === e(lt) }), T(jt, e(lt));
              }), y("click", ut, () => {
                g(f, e(lt), !0), g(u, 14);
              }), v(He, ut);
            });
            var We = n(Me, 2);
            {
              var Je = (He) => {
                var lt = ch(), ut = l(lt);
                {
                  var it = (Fe) => {
                    var ft = oh();
                    L(() => dt(ft, `background-image:url(${e(x).cover ?? ""})`)), v(Fe, ft);
                  };
                  M(ut, (Fe) => {
                    e(x).cover && Fe(it);
                  });
                }
                var jt = n(ut, 2), Ke = l(jt), kt = l(Ke), Mt = C(kt, !0), wt = n(kt);
                {
                  var Ze = (Fe) => {
                    var ft = il();
                    v(Fe, ft);
                  }, st = /* @__PURE__ */ P(() => S(e(x)));
                  M(wt, (Fe) => {
                    e(st) && Fe(Ze);
                  });
                }
                var gt = n(wt), at = C(gt, !0), Qe = n(Ke, 2), mt = C(Qe, !0), Xe = n(Qe, 2);
                {
                  var ue = (Fe) => {
                    var ft = vh(), rt = C(ft, !0);
                    L(() => T(rt, e(x).summary)), v(Fe, ft);
                  };
                  M(Xe, (Fe) => {
                    e(x).summary && Fe(ue);
                  });
                }
                var Ue = n(Xe, 2), et = n(l(Ue));
                oe(et, { name: "back", size: 15 }), L(
                  (Fe) => {
                    T(Mt, e(x).tag), T(at, Fe), T(mt, e(x).title);
                  },
                  [
                    () => $(e(x).date) || Sn(new Date(e(x).date) / 1e3)
                  ]
                ), y("click", lt, (Fe) => te(Fe, e(x))), v(He, lt);
              };
              M(We, (He) => {
                e(x) && He(Je);
              });
            }
            var vt = n(We, 2);
            Ve(vt, 19, () => e(I), (He) => He.k, (He, lt, ut) => {
              var it = hh(), jt = l(it), Ke = C(jt, !0), kt = n(jt, 2);
              Ve(kt, 23, () => e(lt).posts, (Mt) => Mt.id, (Mt, wt, Ze) => {
                var st = fh(), gt = l(st), at = C(gt, !0), Qe = n(gt, 2), mt = l(Qe), Xe = l(mt), ue = C(Xe, !0), Ue = n(Xe);
                {
                  var et = (Le) => {
                    var St = il();
                    v(Le, St);
                  }, Fe = /* @__PURE__ */ P(() => S(e(wt)));
                  M(Ue, (Le) => {
                    e(Fe) && Le(et);
                  });
                }
                var ft = n(mt, 2), rt = C(ft, !0), ct = n(ft, 2);
                {
                  var ze = (Le) => {
                    var St = dh(), Ft = C(St, !0);
                    L(() => T(Ft, e(wt).summary)), v(Le, St);
                  };
                  M(ct, (Le) => {
                    e(wt).summary && Le(ze);
                  });
                }
                var nt = n(Qe, 2);
                {
                  var pt = (Le) => {
                    var St = uh();
                    L(() => dt(St, `background-image:url(${e(wt).cover ?? ""})`)), v(Le, St);
                  };
                  M(nt, (Le) => {
                    e(wt).cover && Le(pt);
                  });
                }
                L(
                  (Le, St) => {
                    dt(st, `--i:${Le ?? ""}`), T(at, St), T(ue, e(wt).tag), T(rt, e(wt).title);
                  },
                  [
                    () => Math.min(e(Ze) + e(ut), 8),
                    () => w(e(wt).date)
                  ]
                ), y("click", st, (Le) => te(Le, e(wt))), v(Mt, st);
              }), L(() => T(Ke, e(lt).k)), v(He, it);
            });
            var Q = n(vt, 2);
            {
              var xe = (He) => {
                var lt = ph();
                v(He, lt);
              };
              M(Q, (He) => {
                e(z).length || He(xe);
              });
            }
            var Te = n(Q, 2);
            {
              var tt = (He) => {
                var lt = mh(), ut = C(lt);
                L(() => T(ut, `Show older posts (${e(A).length - e(u)} more)`)), y("click", lt, () => g(u, e(u) + 14)), v(He, lt);
              };
              M(Te, (He) => {
                e(A).length > e(u) && He(tt);
              });
            }
            y("input", De, () => g(u, 14)), ia(De, () => e(d), (He) => g(d, He)), v(ie, me);
          };
          M(ge, (ie) => {
            e(r) === null ? ie(be) : e(i) || !e(r).length ? ie(N, 1) : ie(ae, -1);
          });
        }
        v(pe, R);
      }, fe = (pe) => {
        sh(pe, {});
      }, Z = (pe) => {
        var R = ta(), ge = we(R);
        Ve(ge, 16, () => Array(4), _t, (be, N) => {
          var ae = _h();
          v(be, ae);
        }), v(pe, R);
      }, W = (pe) => {
        var R = bh();
        v(pe, R);
      }, ee = (pe) => {
        var R = ta(), ge = we(R);
        Ve(ge, 19, () => e(o), (be) => be.gid, (be, N, ae) => {
          var ie = wh(), me = l(ie), Me = l(me), Ae = C(Me, !0), Ie = n(Me), De = C(Ie, !0), Ge = n(Ie, 2);
          oe(Ge, { name: "ext", size: 15 });
          var We = n(me), Je = C(We, !0), vt = n(We);
          {
            var Q = (xe) => {
              var Te = yh(), tt = C(Te, !0);
              L(() => T(tt, e(N).text)), v(xe, Te);
            };
            M(vt, (xe) => {
              e(N).text && xe(Q);
            });
          }
          L(
            (xe, Te) => {
              dt(ie, `--i:${xe ?? ""}`), T(Ae, e(N).game), T(De, Te), T(Je, e(N).title);
            },
            [() => Math.min(e(ae), 10), () => Sn(e(N).date)]
          ), y("click", ie, () => B(e(N).url)), v(be, ie);
        }), v(pe, R);
      };
      M(D, (pe) => {
        e(s) === "steamlite" ? pe(X) : e(s) === "roadmap" ? pe(fe, 1) : e(o) === null ? pe(Z, 2) : e(o).length ? pe(ee, -1) : pe(W, 3);
      });
    }
    bt(1, q, () => La, () => ({ y: 18, duration: 500, easing: ca })), v(J, q);
  });
  var Ye = n(de, 2);
  {
    var ce = (J) => {
      Co(J, {
        get item() {
          return e(m).item;
        },
        get rect() {
          return e(m).rect;
        },
        onclose: he
      });
    };
    M(Ye, (J) => {
      e(m) && J(ce);
    });
  }
  L(() => {
    dt(ke, `transform:translateX(${e(s) === "steamlite" ? 0 : e(s) === "roadmap" ? 100 : 200}%)`), ne = je(F, 1, "svelte-e7wisb", null, ne, { on: e(s) === "steamlite" }), ye = je(V, 1, "svelte-e7wisb", null, ye, { on: e(s) === "roadmap" }), Re = je(Se, 1, "svelte-e7wisb", null, Re, { on: e(s) === "games" });
  }), y("click", F, () => g(s, "steamlite")), y("click", V, () => g(s, "roadmap")), y("click", Se, () => g(s, "games")), v(t, se), Lt();
}
Wt(["click", "input"]);
var ll = /* @__PURE__ */ h('<div class="bgi svelte-1rctp38"></div>'), Mh = /* @__PURE__ */ h('<div class="bg svelte-1rctp38" aria-hidden="true"><!></div>'), Th = /* @__PURE__ */ h('<img alt="" class="svelte-1rctp38"/>'), Lh = /* @__PURE__ */ h("<span> </span>"), zh = /* @__PURE__ */ h('<span class="lv svelte-1rctp38" title="Steam level"> </span>'), Ch = /* @__PURE__ */ h('<div class="eyebrow"> </div>'), Eh = /* @__PURE__ */ h('<div class="tag svelte-1rctp38"> </div>'), Ah = /* @__PURE__ */ h('<div class="card hero rise svelte-1rctp38" style="--i:0"><!> <div></div><div class="dimmer svelte-1rctp38"></div> <div class="hin svelte-1rctp38"><div><svg class="ringsvg svelte-1rctp38" viewBox="0 0 140 140" aria-hidden="true"><circle cx="70" cy="70" class="rt svelte-1rctp38"></circle><circle cx="70" cy="70" class="rp svelte-1rctp38" transform="rotate(-90 70 70)"></circle></svg> <div class="av svelte-1rctp38"><!></div> <!></div> <div class="who svelte-1rctp38"><!> <h1 class="svelte-1rctp38"> </h1> <!> <!></div> <div class="acts svelte-1rctp38"><!></div></div></div>');
function Ko(t, a) {
  Tt(a, !0);
  let s = Dt(a, "name", 3, ""), r = Dt(a, "avatar", 3, ""), i = Dt(a, "level", 3, 0), o = Dt(a, "tagline", 3, ""), d = Dt(a, "eyebrow", 3, ""), f = Dt(a, "banner", 19, () => ({ mode: "default" })), u = Dt(a, "bannerImage", 3, ""), m = Dt(a, "fav", 3, null);
  const p = 62, _ = 2 * Math.PI * p, k = /* @__PURE__ */ P(() => i() % 10 / 10 * _ || (i() > 0 ? _ : 0)), b = /* @__PURE__ */ P(() => i() >= 100 ? "gold" : i() >= 50 ? "purple" : i() >= 20 ? "blue" : "plain"), S = /* @__PURE__ */ P(() => f() && f().mode === "image" && u() ? "image" : f() && f().mode === "gradient" ? "gradient" : "default"), E = /* @__PURE__ */ P(() => Number(f() && f().blur || 0)), z = /* @__PURE__ */ P(() => Number(f() && f().dim || 0));
  var x = Ah(), A = l(x);
  {
    var j = (fe) => {
      var Z = ll();
      L(() => dt(Z, `background-image:url(${u() ?? ""}); filter: blur(${e(E) ?? ""}px); transform: scale(${1 + e(E) / 120})`)), v(fe, Z);
    }, O = (fe) => {
      var Z = ll();
      L(() => dt(Z, `background: linear-gradient(${f().angle ?? 135 ?? ""}deg, ${f().c1 ?? ""}, ${f().c2 ?? ""}); filter: blur(${e(E) ?? ""}px)`)), v(fe, Z);
    }, H = (fe) => {
      var Z = Mh(), W = l(Z);
      fs(W, {
        get g() {
          return m();
        },
        kind: "hero"
      }), v(fe, Z);
    };
    M(A, (fe) => {
      e(S) === "image" ? fe(j) : e(S) === "gradient" ? fe(O, 1) : m() && fe(H, 2);
    });
  }
  var I = n(A, 2);
  let w;
  var $ = n(I), B = n($, 2), te = l(B), he = l(te), se = l(he);
  Be(se, "r", p);
  var de = n(se);
  Be(de, "r", p);
  var U = n(he, 2), re = l(U);
  {
    var ke = (fe) => {
      var Z = Th();
      L(() => Be(Z, "src", r())), v(fe, Z);
    }, F = (fe) => {
      var Z = Lh(), W = C(Z, !0);
      L((ee) => T(W, ee), [() => (s() || "?").trim()[0]?.toUpperCase()]), v(fe, Z);
    };
    M(re, (fe) => {
      r() ? fe(ke) : fe(F, -1);
    });
  }
  var ne = n(U, 2);
  {
    var V = (fe) => {
      var Z = zh(), W = C(Z, !0);
      L(() => T(W, i())), v(fe, Z);
    };
    M(ne, (fe) => {
      i() && fe(V);
    });
  }
  var ye = n(te, 2), Se = l(ye);
  {
    var Re = (fe) => {
      var Z = Ch(), W = C(Z, !0);
      L(() => T(W, d())), v(fe, Z);
    };
    M(Se, (fe) => {
      d() && fe(Re);
    });
  }
  var $e = n(Se, 2), Ye = C($e, !0), ce = n($e, 2);
  {
    var J = (fe) => {
      var Z = Eh(), W = C(Z, !0);
      L(() => T(W, o())), v(fe, Z);
    };
    M(ce, (fe) => {
      o() && fe(J);
    });
  }
  var q = n(ce, 2);
  vi(q, () => a.meta ?? es);
  var D = n(ye, 2), X = l(D);
  vi(X, () => a.acts ?? es), L(() => {
    w = je(I, 1, "shade svelte-1rctp38", null, w, { flat: e(S) !== "default" }), dt($, `opacity:${e(z) / 100}`), je(te, 1, `avwrap ${e(b) ?? ""}`, "svelte-1rctp38"), Be(de, "stroke-dasharray", `${e(k) ?? ""} 389.55748904513433`), T(Ye, s());
  }), v(t, x), Lt();
}
var Ih = /* @__PURE__ */ h('<button class="drop svelte-1owyl5x"><!><b>Choose a picture</b><span class="muted">JPEG or PNG</span></button>'), Ph = /* @__PURE__ */ h('<div class="ctl svelte-1owyl5x"><span class="muted">Zoom</span><input type="range" min="1" max="3" step="0.01" class="svelte-1owyl5x"/><button class="btn sm">Different picture</button></div> <div class="muted hint svelte-1owyl5x">Drag the picture to move it.</div>', 1), Dh = /* @__PURE__ */ h('<div class="err svelte-1owyl5x"> </div>'), Nh = /* @__PURE__ */ h('<div class="back svelte-1owyl5x" role="presentation"><div class="dlg glass svelte-1owyl5x" role="dialog" tabindex="-1"><h2 class="svelte-1owyl5x"> </h2> <div role="presentation"><canvas style="width:100%;height:100%"></canvas> <!></div> <!> <!> <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden=""/> <div class="row svelte-1owyl5x"><button class="btn">Cancel</button><button class="btn primary">Use this picture</button></div></div></div>');
function Mn(t, a) {
  Tt(a, !0);
  let s = Dt(a, "title", 3, "Choose a picture"), r = Dt(a, "ratio", 3, 1), i = Dt(a, "outW", 3, 256), o = Dt(a, "outH", 3, 256), d = Dt(a, "round", 3, !1), f = Dt(a, "format", 3, "image/jpeg");
  const u = /* @__PURE__ */ P(() => r() >= 2 ? 560 : 380), m = /* @__PURE__ */ P(() => e(u) / r());
  let p = /* @__PURE__ */ G(null), _ = /* @__PURE__ */ G(1), k = /* @__PURE__ */ G(0), b = /* @__PURE__ */ G(0), S = /* @__PURE__ */ G(void 0), E = /* @__PURE__ */ G(""), z = /* @__PURE__ */ G(void 0), x = null;
  const A = /* @__PURE__ */ P(() => e(p) ? Math.max(e(u) / e(p).naturalWidth, e(m) / e(p).naturalHeight) : 1);
  function j(q) {
    if (g(E, ""), !q) return;
    if (!/^image\//.test(q.type)) {
      g(E, "That is not a picture.");
      return;
    }
    if (q.size > 12 * 1024 * 1024) {
      g(E, "That picture is too large (12 MB at most).");
      return;
    }
    const D = new FileReader();
    D.onload = () => {
      const X = new Image();
      X.onload = () => {
        g(p, X, !0), g(_, 1), g(k, 0), g(b, 0);
      }, X.onerror = () => {
        g(E, "That picture could not be opened.");
      }, X.src = D.result;
    }, D.readAsDataURL(q);
  }
  const O = () => {
    if (!e(p)) return;
    const q = Math.max(0, (e(p).naturalWidth * e(A) * e(_) - e(u)) / 2), D = Math.max(0, (e(p).naturalHeight * e(A) * e(_) - e(m)) / 2);
    g(k, Math.max(-q, Math.min(q, e(k))), !0), g(b, Math.max(-D, Math.min(D, e(b))), !0);
  };
  function H(q, D, X, fe) {
    const Z = q.getContext("2d");
    if (Z.fillStyle = "#10121a", Z.fillRect(0, 0, D, X), !e(p)) return;
    const W = e(A) * e(_) * fe, ee = e(p).naturalWidth * W, pe = e(p).naturalHeight * W;
    Z.imageSmoothingQuality = "high", Z.drawImage(e(p), (D - ee) / 2 + e(k) * fe, (X - pe) / 2 + e(b) * fe, ee, pe);
  }
  $t(() => {
    e(_), O(), e(S) && (e(S).width = e(u) * 2, e(S).height = e(m) * 2, H(e(S), e(u) * 2, e(m) * 2, 2));
  });
  const I = (q) => {
    e(p) && (x = { x: q.clientX, y: q.clientY, ox: e(k), oy: e(b) }, q.currentTarget.setPointerCapture(q.pointerId));
  }, w = (q) => {
    x && (g(k, x.ox + q.clientX - x.x), g(b, x.oy + q.clientY - x.y), O(), e(S) && H(e(S), e(u) * 2, e(m) * 2, 2));
  }, $ = () => {
    x = null;
  };
  function B() {
    const q = document.createElement("canvas");
    q.width = i(), q.height = o(), H(q, i(), o(), i() / e(u)), a.onsave && a.onsave(q.toDataURL(f(), 0.88));
  }
  var te = Nh(), he = l(te), se = l(he), de = C(se, !0), U = n(se, 2);
  let re;
  var ke = l(U);
  _a(ke, (q) => g(S, q), () => e(S));
  var F = n(ke, 2);
  {
    var ne = (q) => {
      var D = Ih(), X = l(D);
      oe(X, { name: "plus", size: 26 }), y("click", D, () => e(z).click()), v(q, D);
    };
    M(F, (q) => {
      e(p) || q(ne);
    });
  }
  var V = n(U, 2);
  {
    var ye = (q) => {
      var D = Ph(), X = we(D), fe = n(l(X)), Z = n(fe);
      ia(fe, () => e(_), (W) => g(_, W)), y("click", Z, () => e(z).click()), v(q, D);
    };
    M(V, (q) => {
      e(p) && q(ye);
    });
  }
  var Se = n(V, 2);
  {
    var Re = (q) => {
      var D = Dh(), X = C(D, !0);
      L(() => T(X, e(E))), v(q, D);
    };
    M(Se, (q) => {
      e(E) && q(Re);
    });
  }
  var $e = n(Se, 2);
  _a($e, (q) => g(z, q), () => e(z));
  var Ye = n($e, 2), ce = l(Ye), J = n(ce);
  zt(te, (q, D) => Gs?.(q, D), () => a.onclose), L(() => {
    Be(he, "aria-label", s()), T(de, s()), re = je(U, 1, "frame svelte-1owyl5x", null, re, { round: d() }), dt(U, `width:${e(u) ?? ""}px;height:${e(m) ?? ""}px;max-width:100%`), J.disabled = !e(p);
  }), y("click", te, function(...q) {
    a.onclose?.apply(this, q);
  }), y("click", he, (q) => q.stopPropagation()), y("keydown", he, () => {
  }), y("pointerdown", U, I), y("pointermove", U, w), y("pointerup", U, $), xa("pointercancel", U, $), y("change", $e, (q) => j(q.currentTarget.files[0])), y("click", ce, function(...q) {
    a.onclose?.apply(this, q);
  }), y("click", J, B), bt(1, he, () => Bs, () => ({ start: 0.94, duration: 380, easing: ca })), bt(3, te, () => ha, () => ({ duration: 200 })), v(t, te), Lt();
}
Wt([
  "click",
  "keydown",
  "pointerdown",
  "pointermove",
  "pointerup",
  "change"
]);
var Oh = /* @__PURE__ */ h('<img alt="" class="svelte-165xc1s"/>'), qh = /* @__PURE__ */ h('<button class="lnk svelte-165xc1s">Use my Steam picture</button>'), jh = /* @__PURE__ */ h('<div class="muted sm svelte-165xc1s">For now, other players still see your Steam picture. Only you see this one.</div>'), Hh = /* @__PURE__ */ h('<div class="cols svelte-165xc1s"><label class="svelte-165xc1s">From<input type="color" class="svelte-165xc1s"/></label><label class="svelte-165xc1s">To<input type="color" class="svelte-165xc1s"/></label></div> <label class="sl svelte-165xc1s">Angle<input type="range" min="0" max="360" class="svelte-165xc1s"/></label>', 1), Rh = /* @__PURE__ */ h('<div class="rowb svelte-165xc1s"><button class="btn sm svelte-165xc1s"><!>Choose another</button><button class="lnk svelte-165xc1s">Remove</button></div>'), $h = /* @__PURE__ */ h("<button></button>"), Fh = /* @__PURE__ */ h('<button class="lnk svelte-165xc1s">Automatic</button>'), Bh = /* @__PURE__ */ h('<div><span class="grow"> </span> <button class="ib svelte-165xc1s" aria-label="Move up"><!></button> <button class="ib svelte-165xc1s" aria-label="Move down"><!></button> <button class="ib eye svelte-165xc1s"><!></button></div>'), Gh = /* @__PURE__ */ h('<aside class="panel glass svelte-165xc1s" aria-label="Edit your profile"><header class="svelte-165xc1s"><div class="grow"><h2 class="svelte-165xc1s">Edit profile</h2><div class="muted">Changes show straight away.</div></div><button class="btn primary sm svelte-165xc1s"><!>Done</button></header> <div class="body svelte-165xc1s"><section class="svelte-165xc1s"><h3 class="svelte-165xc1s">Picture</h3> <div class="pic svelte-165xc1s"><span class="av svelte-165xc1s"><!></span> <div class="col svelte-165xc1s"><button class="btn sm svelte-165xc1s"><!>Change picture</button><!></div></div> <!></section> <section class="svelte-165xc1s"><h3 class="svelte-165xc1s">Banner</h3> <!> <!> <!> <label class="sl svelte-165xc1s">Blur<input type="range" min="0" max="24" class="svelte-165xc1s"/></label> <label class="sl svelte-165xc1s">Darken<input type="range" min="0" max="80" class="svelte-165xc1s"/></label></section> <section class="svelte-165xc1s"><h3 class="svelte-165xc1s">Tagline</h3> <input class="txt svelte-165xc1s" maxlength="80" placeholder="A short line under your name" aria-label="Tagline"/> <div class="faint cnt svelte-165xc1s"> </div></section> <section class="svelte-165xc1s"><h3 class="svelte-165xc1s">Colour</h3> <div class="sw svelte-165xc1s"><!><input type="color" aria-label="Pick a colour" class="svelte-165xc1s"/><!></div> <div class="muted sm svelte-165xc1s">Colours the ring, bars and glow on your profile.</div></section> <section class="svelte-165xc1s"><h3 class="svelte-165xc1s">Widgets</h3> <div class="muted sm svelte-165xc1s">Hide what you do not want on your profile, and put the rest in the order you like.</div> <div class="ws svelte-165xc1s"></div></section> <section class="svelte-165xc1s"><h3 class="svelte-165xc1s">Who can see it</h3> <div class="shr svelte-165xc1s"><div class="grow"><b>Share my profile</b><div class="muted sm svelte-165xc1s">Other SteamLite players can see your picture, banner, tagline, top games and the widgets you leave on.</div></div><!></div></section></div></aside> <!> <!>', 1);
function Wh(t, a) {
  Tt(a, !0);
  let s = /* @__PURE__ */ G(
    null
    // 'avatar' | 'banner' | null
  );
  const r = /* @__PURE__ */ P(() => c.look || {
    banner: { mode: "default" },
    hidden: [],
    order: [],
    tagline: "",
    accent: ""
  }), i = /* @__PURE__ */ P(() => e(r).banner || { mode: "default" }), o = {
    tiles: "The numbers at the top",
    top: "Your top games",
    library: "Library ring",
    recent30: "The last 30 days",
    recent: "Recent sessions",
    disk: "Disk space"
  }, d = [
    "#7b5cff",
    "#b57cff",
    "#ff7ab8",
    "#ff5a6a",
    "#ff9f40",
    "#ffc84a",
    "#46d17b",
    "#2ec4b6",
    "#4a9bff"
  ], f = () => {
    c.editOpen = !1;
  }, u = (Q) => {
    c.look = { ...c.look, banner: { ...e(i), ...Q } };
  }, m = (Q) => Ks({ banner: { ...e(i), ...Q } }), p = (Q) => {
    if (Q === "image" && !e(r).bannerImage) {
      g(s, "banner");
      return;
    }
    m({ mode: Q });
  };
  let _ = /* @__PURE__ */ G(Ct(c.look && c.look.tagline || ""));
  const k = () => {
    e(_) !== (c.look && c.look.tagline) && Ks({ tagline: e(_) });
  }, b = (Q, xe) => {
    const Te = [...e(r).order], tt = Q + xe;
    tt < 0 || tt >= Te.length || ([Te[Q], Te[tt]] = [Te[tt], Te[Q]], c.look = { ...c.look, order: Te }, Ks({ order: Te }));
  }, S = (Q) => {
    const xe = e(r).hidden.includes(Q) ? e(r).hidden.filter((Te) => Te !== Q) : [...e(r).hidden, Q];
    c.look = { ...c.look, hidden: xe }, Ks({ hidden: xe });
  };
  async function E(Q, xe) {
    g(s, null);
    const Te = await ve("online:image", { kind: Q, data: xe }).catch(() => null);
    if (!Te || !Te.ok) return yt(Te && Te.error || "That picture could not be saved.", "bad");
    await nr(), yt(Q === "avatar" ? "Picture changed." : "Banner changed.");
  }
  async function z(Q) {
    await ve("online:image", { kind: Q, data: "" }), await nr();
  }
  async function x(Q) {
    await ve("online:share", { on: Q, keepPrompt: !1 }), await nr(), c.me = await ve("online:me");
  }
  var A = Gh(), j = we(A), O = l(j), H = n(l(O)), I = l(H);
  oe(I, { name: "check", size: 15, stroke: 3 });
  var w = n(O, 2), $ = l(w), B = n(l($), 2), te = l(B), he = l(te);
  {
    var se = (Q) => {
      var xe = Oh();
      L(() => Be(xe, "src", e(r).avatarImage)), v(Q, xe);
    }, de = (Q) => {
      oe(Q, { name: "user", size: 24 });
    };
    M(he, (Q) => {
      e(r).avatarImage ? Q(se) : Q(de, -1);
    });
  }
  var U = n(te, 2), re = l(U), ke = l(re);
  oe(ke, { name: "image", size: 15 });
  var F = n(re);
  {
    var ne = (Q) => {
      var xe = qh();
      y("click", xe, () => z("avatar")), v(Q, xe);
    };
    M(F, (Q) => {
      e(r).avatarImage && Q(ne);
    });
  }
  var V = n(B, 2);
  {
    var ye = (Q) => {
      var xe = jh();
      v(Q, xe);
    };
    M(V, (Q) => {
      e(r).avatarImage && e(r).share && Q(ye);
    });
  }
  var Se = n($, 2), Re = n(l(Se), 2);
  ar(Re, {
    options: [
      ["default", "Game art"],
      ["gradient", "Colours"],
      ["image", "Picture"]
    ],
    get value() {
      return e(i).mode;
    },
    label: "Banner style",
    onchange: p
  });
  var $e = n(Re, 2);
  {
    var Ye = (Q) => {
      var xe = Hh(), Te = we(xe), tt = l(Te), He = n(l(tt)), lt = n(tt), ut = n(l(lt)), it = n(Te, 2), jt = n(l(it));
      L(() => {
        ys(He, e(i).c1), ys(ut, e(i).c2), ys(jt, e(i).angle);
      }), y("input", He, (Ke) => u({ c1: Ke.currentTarget.value })), y("change", He, (Ke) => m({ c1: Ke.currentTarget.value })), y("input", ut, (Ke) => u({ c2: Ke.currentTarget.value })), y("change", ut, (Ke) => m({ c2: Ke.currentTarget.value })), y("input", jt, (Ke) => u({ angle: +Ke.currentTarget.value })), y("change", jt, (Ke) => m({ angle: +Ke.currentTarget.value })), v(Q, xe);
    };
    M($e, (Q) => {
      e(i).mode === "gradient" && Q(Ye);
    });
  }
  var ce = n($e, 2);
  {
    var J = (Q) => {
      var xe = Rh(), Te = l(xe), tt = l(Te);
      oe(tt, { name: "image", size: 15 });
      var He = n(Te);
      y("click", Te, () => g(s, "banner")), y("click", He, () => z("banner")), v(Q, xe);
    };
    M(ce, (Q) => {
      e(i).mode === "image" && Q(J);
    });
  }
  var q = n(ce, 2), D = n(l(q)), X = n(q, 2), fe = n(l(X)), Z = n(Se, 2), W = n(l(Z), 2), ee = n(W, 2), pe = C(ee), R = n(Z, 2), ge = n(l(R), 2), be = l(ge);
  Ve(be, 17, () => d, _t, (Q, xe) => {
    var Te = $h();
    let tt;
    L(() => {
      tt = je(Te, 1, "chip svelte-165xc1s", null, tt, { on: e(r).accent === e(xe) }), dt(Te, `background:${e(xe) ?? ""}`), Be(Te, "aria-label", "Use " + e(xe));
    }), y("click", Te, () => Ks({ accent: e(xe) })), v(Q, Te);
  });
  var N = n(be), ae = n(N);
  {
    var ie = (Q) => {
      var xe = Fh();
      y("click", xe, () => Ks({ accent: "" })), v(Q, xe);
    };
    M(ae, (Q) => {
      e(r).accent && Q(ie);
    });
  }
  var me = n(R, 2), Me = n(l(me), 4);
  Ve(Me, 22, () => e(r).order, (Q) => Q, (Q, xe, Te) => {
    var tt = Bh();
    let He;
    var lt = l(tt), ut = C(lt, !0), it = n(lt, 2), jt = l(it);
    oe(jt, { name: "up", size: 15 });
    var Ke = n(it, 2), kt = l(Ke);
    oe(kt, { name: "down", size: 15 });
    var Mt = n(Ke, 2), wt = l(Mt);
    {
      let Ze = /* @__PURE__ */ P(() => e(r).hidden.includes(xe) ? "eyeoff" : "eye");
      oe(wt, {
        get name() {
          return e(Ze);
        },
        size: 16
      });
    }
    L(
      (Ze, st, gt) => {
        He = je(tt, 1, "w svelte-165xc1s", null, He, { off: Ze }), T(ut, o[xe]), it.disabled = e(Te) === 0, Ke.disabled = e(Te) === e(r).order.length - 1, Be(Mt, "aria-label", st), Be(Mt, "aria-pressed", gt);
      },
      [
        () => e(r).hidden.includes(xe),
        () => e(r).hidden.includes(xe) ? "Show " + o[xe] : "Hide " + o[xe],
        () => !e(r).hidden.includes(xe)
      ]
    ), y("click", it, () => b(e(Te), -1)), y("click", Ke, () => b(e(Te), 1)), y("click", Mt, () => S(xe)), v(Q, tt);
  });
  var Ae = n(me, 2), Ie = n(l(Ae), 2), De = n(l(Ie));
  {
    let Q = /* @__PURE__ */ P(() => !!e(r).share);
    Ut(De, {
      get checked() {
        return e(Q);
      },
      onchange: x
    });
  }
  var Ge = n(j, 2);
  {
    var We = (Q) => {
      Mn(Q, {
        title: "Your picture",
        ratio: 1,
        outW: 256,
        outH: 256,
        round: !0,
        onsave: (xe) => E("avatar", xe),
        onclose: () => g(s, null)
      });
    };
    M(Ge, (Q) => {
      e(s) === "avatar" && Q(We);
    });
  }
  var Je = n(Ge, 2);
  {
    var vt = (Q) => {
      Mn(Q, {
        title: "Your banner",
        ratio: 4.5,
        outW: 1440,
        outH: 320,
        onsave: (xe) => E("banner", xe),
        onclose: () => g(s, null)
      });
    };
    M(Je, (Q) => {
      e(s) === "banner" && Q(vt);
    });
  }
  L(() => {
    ys(D, e(i).blur || 0), ys(fe, e(i).dim || 0), T(pe, `${e(_).length ?? ""}/80`), ys(N, e(r).accent || "#7b5cff");
  }), y("click", H, f), y("click", re, () => g(s, "avatar")), y("input", D, (Q) => u({ blur: +Q.currentTarget.value })), y("change", D, (Q) => m({ blur: +Q.currentTarget.value })), y("input", fe, (Q) => u({ dim: +Q.currentTarget.value })), y("change", fe, (Q) => m({ dim: +Q.currentTarget.value })), xa("blur", W, k), y("keydown", W, (Q) => Q.key === "Enter" && (k(), Q.currentTarget.blur())), ia(W, () => e(_), (Q) => g(_, Q)), y("change", N, (Q) => Ks({ accent: Q.currentTarget.value })), bt(3, j, () => La, () => ({ x: 400, duration: 420, easing: ca, opacity: 1 })), v(t, A), Lt();
}
Wt(["click", "input", "change", "keydown"]);
var Yh = /* @__PURE__ */ h('<div class="skel" style="height:260px;border-radius:26px"></div>'), Uh = /* @__PURE__ */ h('<h1 class="title svelte-q6cak7">Profile</h1><p class="muted">Could not load your Steam profile. Check your connection.</p>', 1), ol = /* @__PURE__ */ h('<i class="svelte-q6cak7">·</i><span> </span>', 1), Vh = /* @__PURE__ */ h('<img alt="" class="svelte-q6cak7"/>'), Kh = /* @__PURE__ */ h('<div class="dchip svelte-q6cak7" title="Connected Discord account"><!><img class="dsym svelte-q6cak7" src="/discord/symbol-white.svg" alt="Discord" draggable="false"/><b class="svelte-q6cak7"> </b></div>'), Xh = /* @__PURE__ */ h('<div class="warn svelte-q6cak7">Has bans on record</div>'), Jh = /* @__PURE__ */ h('<div class="meta svelte-q6cak7"><span></span><span> </span><!><!></div> <!> <!>', 1), Zh = /* @__PURE__ */ h('<button class="btn primary"><!>Edit profile</button> <button class="btn"><!>Play stats</button> <button class="btn"><!>Open on Steam</button>', 1), Qh = /* @__PURE__ */ h('<div class="w2 svelte-q6cak7"><div class="tiles svelte-q6cak7"><div class="card tile rise svelte-q6cak7" style="--i:1"><div class="faint">Games</div><b class="svelte-q6cak7"><!></b><div class="muted"> </div></div> <div class="card tile rise svelte-q6cak7" style="--i:2"><div class="faint">Time in games</div><b class="svelte-q6cak7"><!></b><div class="muted">Steam and SteamLite together</div></div> <div class="card tile rise svelte-q6cak7" style="--i:3"><div class="faint">This week</div><b class="svelte-q6cak7"><!></b><div class="muted"> </div></div> <div class="card tile rise svelte-q6cak7" style="--i:4"><div class="faint">Day streak</div><b class="svelte-q6cak7"><!></b><div class="muted"> </div></div></div></div>'), ep = /* @__PURE__ */ h('<button class="pc svelte-q6cak7"><div class="pa svelte-q6cak7"><!><span class="rk svelte-q6cak7"></span></div> <div class="pm svelte-q6cak7"><b class="ellipsis svelte-q6cak7"> </b><span class="muted"> </span><span class="track svelte-q6cak7"><i class="svelte-q6cak7"></i></span></div></button>'), tp = /* @__PURE__ */ h('<div class="sech"><h2>Your top games</h2></div> <div class="podium svelte-q6cak7"></div>', 1), Kn = /* @__PURE__ */ h('<div class="w2 svelte-q6cak7"><!></div>'), ap = /* @__PURE__ */ h('<div class="w1 svelte-q6cak7"><div class="sech"><h2>Your library</h2></div> <div class="card lib svelte-q6cak7"><svg viewBox="0 0 130 130" class="donut svelte-q6cak7"><circle cx="65" cy="65" r="54" class="dt svelte-q6cak7"></circle><circle cx="65" cy="65" r="54" class="dp svelte-q6cak7" transform="rotate(-90 65 65)"></circle><text x="65" y="63" text-anchor="middle" class="dn svelte-q6cak7"> </text><text x="65" y="82" text-anchor="middle" class="dl svelte-q6cak7">played</text></svg> <div class="legend svelte-q6cak7"><div><i class="k1 svelte-q6cak7"></i><b> </b> played</div> <div><i class="k2 svelte-q6cak7"></i><b> </b> not played yet</div> <div class="muted sm svelte-q6cak7">A game counts as played after ten minutes.</div></div></div></div>'), sp = /* @__PURE__ */ h("<i></i>"), rp = /* @__PURE__ */ h('<div class="big svelte-q6cak7"><b class="svelte-q6cak7"><!></b><span class="muted"> </span></div> <div class="trend svelte-q6cak7"></div> <button class="lnk svelte-q6cak7">See all your play stats</button>', 1), np = /* @__PURE__ */ h('<div class="muted">No play counted in the last 30 days. Play a game from SteamLite and it shows up here.</div>'), ip = /* @__PURE__ */ h('<div class="w1 svelte-q6cak7"><div class="sech"><h2>The last 30 days</h2></div> <div class="card act svelte-q6cak7"><!></div></div>'), lp = /* @__PURE__ */ h('<button><span class="th svelte-q6cak7"><!></span> <span class="grow rn svelte-q6cak7"><b class="ellipsis"> </b><span class="muted"> </span></span> <span class="rt2 svelte-q6cak7"> </span></button>'), op = /* @__PURE__ */ h('<div class="sech"><h2>Recent sessions</h2></div> <div class="card rec svelte-q6cak7"></div>', 1), vp = /* @__PURE__ */ h('<div class="card dk svelte-q6cak7"><div class="row"><b class="grow"> </b><span class="muted"> </span></div><div class="track svelte-q6cak7"><i class="svelte-q6cak7"></i></div></div>'), cp = /* @__PURE__ */ h('<div class="sech"><h2>Disk space</h2></div> <div class="disks svelte-q6cak7"></div>', 1), dp = /* @__PURE__ */ h('<!> <div class="wgrid svelte-q6cak7"></div> <!>', 1), up = /* @__PURE__ */ h('<div class="page"><!></div>');
function fp(t, a) {
  Tt(a, !0);
  let s = /* @__PURE__ */ G(void 0), r = /* @__PURE__ */ G(Ct([])), i = /* @__PURE__ */ G(null);
  oa(async () => {
    ve("stats:get", "month").then((U) => g(i, U, !0)).catch(() => {
    }), g(r, await ve("library:storage").catch(() => []) || [], !0), g(s, await ve("account:profile"), !0);
  });
  const o = /* @__PURE__ */ P(() => c.games.filter((U) => !U.nonSteam && !c.hidden.includes(U.id))), d = /* @__PURE__ */ P(() => e(o).reduce((U, re) => U + ua(re), 0)), f = /* @__PURE__ */ P(() => e(
    o
    // ten minutes or more counts as played
  ).filter((U) => ua(U) >= 600).length), u = /* @__PURE__ */ P(() => e(o).length - e(f)), m = /* @__PURE__ */ P(() => e(o).filter((U) => U.installed).length), p = /* @__PURE__ */ P(() => e(o).length ? Math.round(e(f) / e(o).length * 100) : 0), _ = /* @__PURE__ */ P(() => [...e(o)].sort((U, re) => ua(re) - ua(U)).filter((U) => ua(U) > 0).slice(0, 3)), k = /* @__PURE__ */ P(() => e(_)[0] || null), b = (U) => (U / 1073741824).toFixed(0) + " GB", S = [
    "Offline",
    "Online",
    "Busy",
    "Away",
    "Snooze",
    "Looking to trade",
    "Looking to play"
  ], E = /* @__PURE__ */ P(() => e(s) && e(s).summary ? e(s).summary.gameextrainfo ? "In game: " + e(s).summary.gameextrainfo : S[e(s).summary.personastate] || "Offline" : ""), z = /* @__PURE__ */ P(() => !!(e(s) && e(s).summary && (e(s).summary.personastate > 0 || e(s).summary.gameextrainfo))), x = /* @__PURE__ */ P(() => e(s) && e(s).summary && e(s).summary.timecreated ? new Date(e(s).summary.timecreated * 1e3) : null), A = /* @__PURE__ */ P(() => e(x) ? Math.max(0, Math.floor((Date.now() - e(x).getTime()) / (365.25 * 864e5))) : 0), j = /* @__PURE__ */ P(() => e(s) && e(s).level || 0), O = /* @__PURE__ */ P(() => c.look || {
    banner: { mode: "default" },
    hidden: [],
    order: ["tiles", "top", "library", "recent30", "recent", "disk"],
    tagline: "",
    accent: ""
  });
  nn(() => {
    c.editOpen = !1;
  });
  const H = 2 * Math.PI * 54, I = /* @__PURE__ */ P(() => e(i) ? Math.max(1, ...e(i).bars.map((U) => U.seconds)) : 1), w = (U) => c.games.some((re) => re.id === String(U)), $ = (U, re) => c.games.find((ke) => ke.id === String(U)) || { id: String(U), name: re };
  var B = up(), te = l(B);
  {
    var he = (U) => {
      var re = Yh();
      v(U, re);
    }, se = (U) => {
      var re = Uh();
      v(U, re);
    }, de = (U) => {
      var re = dp(), ke = we(re);
      {
        const ye = ($e) => {
          var Ye = Jh(), ce = we(Ye), J = l(ce);
          let q;
          var D = n(J), X = C(D, !0), fe = n(D);
          {
            var Z = (N) => {
              var ae = ol(), ie = n(we(ae)), me = C(ie);
              L(
                (Me) => T(me, `On Steam since ${Me ?? ""}${e(A) ? " (" + e(A) + (e(A) === 1 ? " year" : " years") + ")" : ""}`),
                [() => e(x).getFullYear()]
              ), v(N, ae);
            };
            M(fe, (N) => {
              e(x) && N(Z);
            });
          }
          var W = n(fe);
          {
            var ee = (N) => {
              var ae = ol(), ie = n(we(ae)), me = C(ie, !0);
              L(() => T(me, e(s).summary.loccountrycode)), v(N, ae);
            };
            M(W, (N) => {
              e(s).summary.loccountrycode && N(ee);
            });
          }
          var pe = n(ce, 2);
          {
            var R = (N) => {
              var ae = Kh(), ie = l(ae);
              {
                var me = (Ie) => {
                  var De = Vh();
                  L(() => Be(De, "src", c.discordLink.avatar)), v(Ie, De);
                };
                M(ie, (Ie) => {
                  c.discordLink.avatar && Ie(me);
                });
              }
              var Me = n(ie, 2), Ae = C(Me, !0);
              L(() => T(Ae, c.discordLink.name)), v(N, ae);
            };
            M(pe, (N) => {
              c.discordLink && N(R);
            });
          }
          var ge = n(pe, 2);
          {
            var be = (N) => {
              var ae = Xh();
              v(N, ae);
            };
            M(ge, (N) => {
              e(s).bans && (e(s).bans.VACBanned || e(s).bans.NumberOfGameBans) && N(be);
            });
          }
          L(() => {
            q = je(J, 1, "dot svelte-q6cak7", null, q, { on: e(z) }), T(X, e(E));
          }), v($e, Ye);
        }, Se = ($e) => {
          var Ye = Zh(), ce = we(Ye), J = l(ce);
          oe(J, { name: "pencil", size: 16 });
          var q = n(ce, 2), D = l(q);
          oe(D, { name: "chart", size: 16 });
          var X = n(q, 2), fe = l(X);
          oe(fe, { name: "ext", size: 16 }), y("click", ce, () => c.editOpen = !c.editOpen), y("click", q, () => Da("stats")), y("click", X, () => ve("app:openUrl", e(s).summary.profileurl)), v($e, Ye);
        };
        let Re = /* @__PURE__ */ P(() => e(O).avatarImage || e(s).summary.avatarfull);
        Ko(ke, {
          get name() {
            return e(s).summary.personaname;
          },
          get avatar() {
            return e(Re);
          },
          get level() {
            return e(j);
          },
          get tagline() {
            return e(O).tagline;
          },
          eyebrow: "Signed in",
          get banner() {
            return e(O).banner;
          },
          get bannerImage() {
            return e(O).bannerImage;
          },
          get fav() {
            return e(k);
          },
          meta: ye,
          acts: Se,
          $$slots: { meta: !0, acts: !0 }
        });
      }
      var F = n(ke, 2);
      Ve(F, 20, () => e(O).order, (ye) => ye, (ye, Se) => {
        var Re = ta(), $e = we(Re);
        {
          var Ye = (J) => {
            var q = ta(), D = we(q);
            {
              var X = (R) => {
                var ge = Qh(), be = l(ge), N = l(be), ae = n(l(N)), ie = l(ae);
                Ca(ie, {
                  get value() {
                    return e(o).length;
                  }
                });
                var me = n(ae), Me = C(me), Ae = n(N, 2), Ie = n(l(Ae)), De = l(Ie);
                {
                  let ut = /* @__PURE__ */ P(() => e(d) / 3600);
                  Ca(De, {
                    get value() {
                      return e(ut);
                    },
                    format: (it) => Math.round(it).toLocaleString() + " h"
                  });
                }
                var Ge = n(Ae, 2), We = n(l(Ge)), Je = l(We);
                {
                  let ut = /* @__PURE__ */ P(() => e(s).stats.weekSeconds / 3600);
                  Ca(Je, {
                    get value() {
                      return e(ut);
                    },
                    format: (it) => it.toFixed(1) + " h"
                  });
                }
                var vt = n(We), Q = C(vt), xe = n(Ge, 2), Te = n(l(xe)), tt = l(Te);
                {
                  let ut = /* @__PURE__ */ P(() => e(i) ? e(i).streak.current : 0);
                  Ca(tt, {
                    get value() {
                      return e(ut);
                    }
                  });
                }
                var He = n(Te), lt = C(He, !0);
                L(() => {
                  T(Me, `${e(m) ?? ""} installed`), T(Q, `${e(s).stats.sessions ?? ""} ${e(s).stats.sessions === 1 ? "session" : "sessions"} tracked`), T(lt, e(i) ? "Best: " + e(i).streak.best + (e(i).streak.best === 1 ? " day" : " days") : "");
                }), v(R, ge);
              }, fe = (R) => {
                var ge = Kn(), be = l(ge);
                {
                  var N = (ae) => {
                    var ie = tp(), me = we(ie);
                    zt(me, (Ae) => Kt?.(Ae));
                    var Me = n(me, 2);
                    Ve(Me, 21, () => e(_), _t, (Ae, Ie, De) => {
                      var Ge = ep(), We = l(Ge), Je = l(We);
                      fs(Je, {
                        get g() {
                          return e(Ie);
                        },
                        kind: "header"
                      });
                      var vt = n(Je);
                      vt.textContent = De + 1;
                      var Q = n(We, 2), xe = l(Q), Te = C(xe, !0), tt = n(xe), He = C(tt), lt = n(tt), ut = C(lt);
                      L(
                        (it, jt, Ke) => {
                          Be(Ge, "title", e(Ie).name), T(Te, e(Ie).name), T(He, `${it ?? ""}${jt ?? ""}`), dt(ut, `width:${Ke ?? ""}%`);
                        },
                        [
                          () => Ia(ua(e(Ie))),
                          () => e(Ie).lastPlayed ? " · played " + lr(e(Ie).lastPlayed).toLowerCase() : "",
                          () => ua(e(Ie)) / ua(e(_)[0]) * 100
                        ]
                      ), y("click", Ge, () => $s(e(Ie).id)), v(Ae, Ge);
                    }), zt(Me, (Ae) => Kt?.(Ae)), v(ae, ie);
                  };
                  M(be, (ae) => {
                    e(_).length && ae(N);
                  });
                }
                v(R, ge);
              }, Z = (R) => {
                var ge = ap(), be = l(ge);
                zt(be, (Q) => Kt?.(Q));
                var N = n(be, 2), ae = l(N), ie = n(l(ae)), me = n(ie), Me = C(me), Ae = n(ae, 2), Ie = l(Ae), De = n(l(Ie)), Ge = C(De, !0), We = n(Ie, 2), Je = n(l(We)), vt = C(Je, !0);
                zt(N, (Q) => Kt?.(Q)), L(() => {
                  Be(ae, "aria-label", `${e(p) ?? ""} percent of your games have been played`), Be(ie, "stroke-dasharray", `${e(p) / 100 * H} 339.29200658769764`), T(Me, `${e(p) ?? ""}%`), T(Ge, e(f)), T(vt, e(u));
                }), v(R, ge);
              }, W = (R) => {
                var ge = ip(), be = l(ge);
                zt(be, (Me) => Kt?.(Me));
                var N = n(be, 2), ae = l(N);
                {
                  var ie = (Me) => {
                    var Ae = rp(), Ie = we(Ae), De = l(Ie), Ge = l(De);
                    {
                      let xe = /* @__PURE__ */ P(() => e(i).total / 3600);
                      Ca(Ge, {
                        get value() {
                          return e(xe);
                        },
                        format: (Te) => Te.toFixed(1) + " h"
                      });
                    }
                    var We = n(De), Je = C(We), vt = n(Ie, 2);
                    Ve(vt, 21, () => e(i).bars, _t, (xe, Te, tt) => {
                      var He = sp();
                      let lt;
                      L(
                        (ut, it) => {
                          Be(He, "title", `${e(Te).label ?? ""}: ${ut ?? ""}`), dt(He, `height:${it ?? ""}%; --d:${tt * 12}ms`), lt = je(He, 1, "svelte-q6cak7", null, lt, { z: !e(Te).seconds });
                        },
                        [
                          () => Ia(e(Te).seconds),
                          () => Math.max(e(Te).seconds ? 6 : 2, e(Te).seconds / e(I) * 100)
                        ]
                      ), v(xe, He);
                    });
                    var Q = n(vt, 2);
                    L(() => T(Je, `over ${e(i).playedDays ?? ""} ${e(i).playedDays === 1 ? "day" : "days"}`)), y("click", Q, () => Da("stats")), v(Me, Ae);
                  }, me = (Me) => {
                    var Ae = np();
                    v(Me, Ae);
                  };
                  M(ae, (Me) => {
                    e(i) && e(i).total > 0 ? Me(ie) : Me(me, -1);
                  });
                }
                zt(N, (Me) => Kt?.(Me)), v(R, ge);
              }, ee = (R) => {
                var ge = Kn(), be = l(ge);
                {
                  var N = (ae) => {
                    var ie = op(), me = we(ie);
                    zt(me, (Ae) => Kt?.(Ae));
                    var Me = n(me, 2);
                    Ve(Me, 21, () => e(s).recent.slice(0, 10), _t, (Ae, Ie) => {
                      var De = lp();
                      let Ge;
                      var We = l(De), Je = l(We);
                      {
                        let ut = /* @__PURE__ */ P(() => $(e(Ie).gameId, e(Ie).name));
                        fs(Je, {
                          get g() {
                            return e(ut);
                          },
                          kind: "capsule"
                        });
                      }
                      var vt = n(We, 2), Q = l(vt), xe = C(Q, !0), Te = n(Q), tt = C(Te, !0), He = n(vt, 2), lt = C(He, !0);
                      L(
                        (ut, it, jt) => {
                          Ge = je(De, 1, "rrow svelte-q6cak7", null, Ge, { dead: ut }), T(xe, e(Ie).name), T(tt, it), T(lt, jt);
                        },
                        [
                          () => !w(e(Ie).gameId),
                          () => lr(e(Ie).start),
                          () => Ia(e(Ie).seconds)
                        ]
                      ), y("click", De, () => w(e(Ie).gameId) && $s(e(Ie).gameId)), v(Ae, De);
                    }), zt(Me, (Ae) => Kt?.(Ae)), v(ae, ie);
                  };
                  M(be, (ae) => {
                    e(s).recent.length && ae(N);
                  });
                }
                v(R, ge);
              }, pe = (R) => {
                var ge = Kn(), be = l(ge);
                {
                  var N = (ae) => {
                    var ie = cp(), me = we(ie);
                    zt(me, (Ae) => Kt?.(Ae));
                    var Me = n(me, 2);
                    Ve(Me, 21, () => e(r), _t, (Ae, Ie) => {
                      var De = vp(), Ge = l(De), We = l(Ge), Je = C(We, !0), vt = n(We), Q = C(vt), xe = n(Ge), Te = C(xe);
                      L(
                        (tt, He, lt) => {
                          T(Je, e(Ie).drive), T(Q, `${tt ?? ""} free of ${He ?? ""}`), dt(Te, `width:${lt ?? ""}%`);
                        },
                        [
                          () => b(e(Ie).free),
                          () => b(e(Ie).total),
                          () => Math.round((1 - e(Ie).free / e(Ie).total) * 100)
                        ]
                      ), v(Ae, De);
                    }), zt(Me, (Ae) => Kt?.(Ae)), v(ae, ie);
                  };
                  M(be, (ae) => {
                    e(r).length && ae(N);
                  });
                }
                v(R, ge);
              };
              M(D, (R) => {
                Se === "tiles" ? R(X) : Se === "top" ? R(fe, 1) : Se === "library" ? R(Z, 2) : Se === "recent30" ? R(W, 3) : Se === "recent" ? R(ee, 4) : Se === "disk" && R(pe, 5);
              });
            }
            v(J, q);
          }, ce = /* @__PURE__ */ P(() => !e(O).hidden.includes(Se));
          M($e, (J) => {
            e(ce) && J(Ye);
          });
        }
        v(ye, Re);
      });
      var ne = n(F, 2);
      {
        var V = (ye) => {
          Wh(ye, {});
        };
        M(ne, (ye) => {
          c.editOpen && ye(V);
        });
      }
      v(U, re);
    };
    M(te, (U) => {
      e(s) === void 0 ? U(he) : !e(s) || !e(s).summary ? U(se, 1) : U(de, -1);
    });
  }
  L(() => dt(B, e(O).accent ? "--glow:" + e(O).accent + ";" : "")), v(t, B), Lt();
}
Wt(["click"]);
var hp = /* @__PURE__ */ h('<div class="skel" style="height:160px"></div>'), pp = /* @__PURE__ */ h('<div class="card empty rise svelte-fupvt" style="--i:1"><b class="svelte-fupvt">Nothing counted yet</b><div class="muted">Play a game from SteamLite, or start one in Steam while SteamLite is open, and its time shows up here.</div></div>'), mp = /* @__PURE__ */ h('<span class="svelte-fupvt"> </span>'), gp = /* @__PURE__ */ h('<div class="col svelte-fupvt"><i class="svelte-fupvt"></i><!></div>'), _p = /* @__PURE__ */ h('<small class="svelte-fupvt"> </small>'), bp = /* @__PURE__ */ h('<button><div class="art svelte-fupvt"><!><span class="rk svelte-fupvt"></span></div> <div class="nm ellipsis svelte-fupvt"> </div> <div class="meter svelte-fupvt"><span class="track svelte-fupvt"><i class="svelte-fupvt"></i></span><span class="hr svelte-fupvt"><b> </b><!></span></div></button>'), yp = /* @__PURE__ */ h('<div class="sech"><h2> </h2></div> <div class="cards svelte-fupvt"></div>', 1), wp = /* @__PURE__ */ h('<div class="hc svelte-fupvt"><i class="svelte-fupvt"></i></div>'), vl = /* @__PURE__ */ h('<div class="muted note svelte-fupvt"> </div>'), kp = /* @__PURE__ */ h('<div class="dc svelte-fupvt"><i class="svelte-fupvt"></i><span class="svelte-fupvt"> </span></div>'), xp = /* @__PURE__ */ h("<i></i>"), Sp = /* @__PURE__ */ h('<div class="wk svelte-fupvt"></div>'), Mp = /* @__PURE__ */ h('<div class="card long rise svelte-fupvt"><div class="faint svelte-fupvt"> </div><b class="svelte-fupvt"> </b><span class="muted"> </span></div>'), Tp = /* @__PURE__ */ h('<div class="stats svelte-fupvt"><div class="card st rise svelte-fupvt" style="--i:1"><div class="faint"> </div><b class="svelte-fupvt"><!></b><div class="muted"> </div></div> <div class="card st rise svelte-fupvt" style="--i:2"><div class="faint">Sessions</div><b class="svelte-fupvt"><!></b><div class="muted"> </div></div> <div class="card st rise svelte-fupvt" style="--i:3"><div class="faint">Day streak</div><b class="svelte-fupvt"><!></b><div class="muted"> </div></div> <div class="card st rise svelte-fupvt" style="--i:4"><div class="faint">This week</div><b class="svelte-fupvt"><!></b><div class="muted"> </div></div></div> <div class="sech"><h2> </h2></div> <div class="card chart svelte-fupvt"><div></div></div> <!> <div class="pair svelte-fupvt"><div><div class="sech"><h2>Time of day</h2></div> <div class="card mini svelte-fupvt"><div class="hours svelte-fupvt"></div> <div class="axis svelte-fupvt"><span>12 am</span><span>6 am</span><span>12 pm</span><span>6 pm</span></div> <!></div></div> <div><div class="sech"><h2>Day of the week</h2></div> <div class="card mini svelte-fupvt"><div class="days svelte-fupvt"></div> <!></div></div></div> <div class="sech"><h2>The last 17 weeks</h2></div> <div class="card cal svelte-fupvt"><div class="grid svelte-fupvt"></div> <div class="key svelte-fupvt"><span class="svelte-fupvt">Less</span><i class="l0 svelte-fupvt"></i><i class="l1 svelte-fupvt"></i><i class="l2 svelte-fupvt"></i><i class="l3 svelte-fupvt"></i><i class="l4 svelte-fupvt"></i><span class="svelte-fupvt">More</span></div></div> <!>', 1), Lp = /* @__PURE__ */ h('<div class="page"><div class="phead"><div class="top rise svelte-fupvt" style="--i:0"><div class="grow"><div class="eyebrow">Play stats</div><h1 class="title svelte-fupvt">Your time in games</h1><div class="muted"> </div></div> <!></div></div> <!></div>');
function zp(t, a) {
  Tt(a, !0);
  let s = /* @__PURE__ */ G(Ct(c.ui.statsRange === "week" || c.ui.statsRange === "all" ? c.ui.statsRange : "month")), r = /* @__PURE__ */ G(null), i = 0;
  async function o() {
    const V = ++i, ye = await ve("stats:get", e(s));
    V === i && g(r, ye, !0);
  }
  oa(o);
  function d(V) {
    g(s, V, !0), ve("ui:set", { statsRange: V }).catch(() => {
    }), o();
  }
  const f = [["week", "Week"], ["month", "Month"], ["all", "All time"]], u = {
    week: "the last 7 days",
    month: "the last 30 days",
    all: "all time"
  }, m = (V) => V.toFixed(1) + " h", p = /* @__PURE__ */ P(() => e(r) ? Math.max(1, ...e(r).bars.map((V) => V.seconds)) : 1), _ = /* @__PURE__ */ P(() => e(r) ? Math.max(1, ...e(r).perHour) : 1), k = /* @__PURE__ */ P(() => e(r) ? Math.max(1, ...e(r).perWeekday) : 1), b = /* @__PURE__ */ P(() => e(r) ? Math.max(1, ...e(r).calendar.map((V) => V.seconds)) : 1), S = (V) => V < 60 ? 0 : Math.min(4, 1 + Math.floor(V / e(b) * 3.999)), E = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], z = (V) => {
    if (e(s) === "all") {
      const [$e, Ye] = V.label.split("-");
      return new Date(+$e, +Ye - 1, 1).toLocaleDateString(void 0, { month: "short" });
    }
    const [ye, Se, Re] = V.label.split("-");
    return new Date(+ye, +Se - 1, +Re).toLocaleDateString(void 0, { day: "numeric", month: "short" });
  }, x = (V) => {
    if (e(s) === "all") {
      const [$e, Ye] = V.label.split("-");
      return new Date(+$e, +Ye - 1, 1).toLocaleDateString(void 0, { month: "long", year: "numeric" }) + ": " + Ia(V.seconds);
    }
    const [ye, Se, Re] = V.label.split("-");
    return new Date(+ye, +Se - 1, +Re).toLocaleDateString(void 0, { weekday: "short", day: "numeric", month: "short" }) + ": " + Ia(V.seconds);
  }, A = (V) => V === 0 ? "12 am" : V < 12 ? V + " am" : V === 12 ? "12 pm" : V - 12 + " pm", j = /* @__PURE__ */ P(() => e(r) && e(r).total > 0 ? e(r).perHour.indexOf(Math.max(...e(r).perHour)) : -1), O = /* @__PURE__ */ P(() => e(r) && e(r).total > 0 ? e(r).perWeekday.indexOf(Math.max(...e(r).perWeekday)) : -1), H = /* @__PURE__ */ P(() => e(r) && e(r).lastWeek > 0 ? Math.round((e(r).thisWeek - e(r).lastWeek) / e(r).lastWeek * 100) : null), I = /* @__PURE__ */ P(() => e(r) ? Array.from({ length: Math.ceil(e(r).calendar.length / 7) }, (V, ye) => e(r).calendar.slice(ye * 7, ye * 7 + 7)) : []), w = /* @__PURE__ */ P(() => e(r) ? e(s) === "all" ? c.games.filter((V) => ua(V) > 0).sort((V, ye) => ua(ye) - ua(V)).slice(0, 12).map((V) => ({
    g: V,
    known: !0,
    seconds: ua(V),
    sessions: V.launches || 0
  })) : e(r).games.map((V) => {
    const ye = c.games.find((Se) => Se.id === V.id);
    return {
      g: ye || { id: V.id, name: V.name },
      known: !!ye,
      seconds: V.seconds,
      sessions: V.sessions
    };
  }) : []);
  var $ = Lp(), B = l($), te = l(B), he = l(te), se = n(l(he), 2), de = C(se), U = n(he, 2);
  ar(U, {
    get options() {
      return f;
    },
    get value() {
      return e(s);
    },
    label: "Time range",
    onchange: d
  });
  var re = n(B, 2);
  {
    var ke = (V) => {
      var ye = hp();
      v(V, ye);
    }, F = (V) => {
      var ye = pp();
      v(V, ye);
    }, ne = (V) => {
      var ye = Tp(), Se = we(ye), Re = l(Se), $e = l(Re), Ye = C($e), ce = n($e), J = l(ce);
      {
        let ue = /* @__PURE__ */ P(() => e(r).total / 3600);
        Ca(J, {
          get value() {
            return e(ue);
          },
          format: m
        });
      }
      var q = n(ce), D = C(q), X = n(Re, 2), fe = n(l(X)), Z = l(fe);
      Ca(Z, {
        get value() {
          return e(r).sessions;
        }
      });
      var W = n(fe), ee = C(W, !0), pe = n(X, 2), R = n(l(pe)), ge = l(R);
      Ca(ge, {
        get value() {
          return e(r).streak.current;
        }
      });
      var be = n(R), N = C(be), ae = n(pe, 2), ie = n(l(ae)), me = l(ie);
      {
        let ue = /* @__PURE__ */ P(() => e(r).thisWeek / 3600);
        Ca(me, {
          get value() {
            return e(ue);
          },
          format: m
        });
      }
      var Me = n(ie), Ae = C(Me, !0), Ie = n(Se, 2), De = l(Ie), Ge = C(De, !0);
      zt(Ie, (ue) => Kt?.(ue));
      var We = n(Ie, 2), Je = l(We);
      let vt;
      Ve(Je, 21, () => e(r).bars, _t, (ue, Ue, et) => {
        var Fe = gp(), ft = l(Fe), rt = n(ft);
        {
          var ct = (ze) => {
            var nt = mp(), pt = C(nt, !0);
            L((Le) => T(pt, Le), [() => z(e(Ue))]), v(ze, nt);
          };
          M(rt, (ze) => {
            (e(r).bars.length <= 14 || et % 5 === 0 || et === e(r).bars.length - 1) && ze(ct);
          });
        }
        L(
          (ze, nt) => {
            Be(Fe, "title", ze), dt(ft, `height:${nt ?? ""}%; --d:${et * 14}ms`);
          },
          [
            () => x(e(Ue)),
            () => Math.max(e(Ue).seconds ? 4 : 0, e(Ue).seconds / e(p) * 100)
          ]
        ), v(ue, Fe);
      }), zt(We, (ue) => Kt?.(ue));
      var Q = n(We, 2);
      {
        var xe = (ue) => {
          var Ue = yp(), et = we(Ue), Fe = l(et), ft = C(Fe, !0);
          zt(et, (ct) => Kt?.(ct));
          var rt = n(et, 2);
          Ve(rt, 21, () => e(w), _t, (ct, ze, nt) => {
            var pt = bp();
            let Le;
            var St = l(pt), Ft = l(St);
            fs(Ft, {
              get g() {
                return e(ze).g;
              },
              kind: "capsule"
            });
            var Nt = n(Ft);
            Nt.textContent = nt + 1;
            var Vt = n(St, 2), K = C(Vt, !0), Ce = n(Vt, 2), Pe = l(Ce), qe = C(Pe), ot = n(Pe), At = l(ot), It = C(At, !0), ra = n(At);
            {
              var Jt = (Y) => {
                var _e = _p(), xt = C(_e);
                L(() => T(xt, `${e(ze).sessions ?? ""} ${e(ze).sessions === 1 ? "session" : "sessions"}`)), v(Y, _e);
              };
              M(ra, (Y) => {
                e(ze).sessions && Y(Jt);
              });
            }
            L(
              (Y) => {
                Le = je(pt, 1, "tc svelte-fupvt", null, Le, { dead: !e(ze).known }), Be(pt, "title", e(ze).g.name), T(K, e(ze).g.name), dt(qe, `width:${e(ze).seconds / e(w)[0].seconds * 100}%`), T(It, Y);
              },
              [() => Ia(e(ze).seconds)]
            ), y("click", pt, () => e(ze).known && $s(e(ze).g.id)), v(ct, pt);
          }), zt(rt, (ct) => Kt?.(ct)), L(() => T(ft, e(s) === "all" ? "Most played of all time" : "Most played, " + u[e(s)])), v(ue, Ue);
        };
        M(Q, (ue) => {
          e(w).length && ue(xe);
        });
      }
      var Te = n(Q, 2), tt = l(Te), He = l(tt);
      zt(He, (ue) => Kt?.(ue));
      var lt = n(He, 2), ut = l(lt);
      Ve(ut, 21, () => e(r).perHour, _t, (ue, Ue, et) => {
        var Fe = wp(), ft = C(Fe);
        L(
          (rt, ct) => {
            Be(Fe, "title", rt), dt(ft, `height:${ct ?? ""}%`);
          },
          [
            () => A(et) + ": " + Ia(e(Ue)),
            () => Math.max(e(Ue) ? 5 : 0, e(Ue) / e(_) * 100)
          ]
        ), v(ue, Fe);
      });
      var it = n(ut, 4);
      {
        var jt = (ue) => {
          var Ue = vl(), et = C(Ue);
          L((Fe) => T(et, `You play most around ${Fe ?? ""}.`), [() => A(e(j))]), v(ue, Ue);
        };
        M(it, (ue) => {
          e(j) >= 0 && ue(jt);
        });
      }
      zt(lt, (ue) => Kt?.(ue));
      var Ke = n(tt, 2), kt = l(Ke);
      zt(kt, (ue) => Kt?.(ue));
      var Mt = n(kt, 2), wt = l(Mt);
      Ve(wt, 21, () => e(r).perWeekday, _t, (ue, Ue, et) => {
        var Fe = kp(), ft = l(Fe), rt = n(ft), ct = C(rt, !0);
        L(
          (ze, nt) => {
            Be(Fe, "title", ze), dt(ft, `height:${nt ?? ""}%`), T(ct, E[et]);
          },
          [
            () => E[et] + ": " + Ia(e(Ue)),
            () => Math.max(e(Ue) ? 5 : 0, e(Ue) / e(k) * 100)
          ]
        ), v(ue, Fe);
      });
      var Ze = n(wt, 2);
      {
        var st = (ue) => {
          var Ue = vl(), et = C(Ue);
          L(() => T(et, `${[
            "Mondays",
            "Tuesdays",
            "Wednesdays",
            "Thursdays",
            "Fridays",
            "Saturdays",
            "Sundays"
          ][e(O)] ?? ""} are your busiest.`)), v(ue, Ue);
        };
        M(Ze, (ue) => {
          e(O) >= 0 && ue(st);
        });
      }
      zt(Mt, (ue) => Kt?.(ue));
      var gt = n(Te, 2);
      zt(gt, (ue) => Kt?.(ue));
      var at = n(gt, 2), Qe = l(at);
      Ve(Qe, 21, () => e(I), _t, (ue, Ue) => {
        var et = Sp();
        Ve(et, 21, () => e(Ue), _t, (Fe, ft) => {
          var rt = xp();
          L(
            (ct, ze) => {
              je(rt, 1, `l${ct ?? ""}`, "svelte-fupvt"), Be(rt, "title", ze);
            },
            [
              () => S(e(ft).seconds),
              () => new Date(e(ft).day.replace(/-/g, "/")).toLocaleDateString(void 0, { weekday: "short", day: "numeric", month: "short" }) + ": " + (e(ft).seconds ? Ia(e(ft).seconds) : "no play")
            ]
          ), v(Fe, rt);
        }), v(ue, et);
      }), zt(at, (ue) => Kt?.(ue));
      var mt = n(at, 2);
      {
        var Xe = (ue) => {
          var Ue = Mp(), et = l(Ue), Fe = C(et), ft = n(et), rt = C(ft, !0), ct = n(ft), ze = C(ct);
          zt(Ue, (nt) => Kt?.(nt)), L(
            (nt, pt) => {
              T(Fe, `Longest session, ${u[e(s)] ?? ""}`), T(rt, nt), T(ze, `in ${e(r).longest.name ?? ""}, on ${pt ?? ""}`);
            },
            [
              () => Ia(e(r).longest.seconds),
              () => new Date(e(r).longest.start).toLocaleDateString(void 0, { weekday: "long", day: "numeric", month: "long" })
            ]
          ), v(ue, Ue);
        };
        M(mt, (ue) => {
          e(r).longest && ue(Xe);
        });
      }
      L(
        (ue) => {
          T(Ye, `Play time, ${u[e(s)] ?? ""}`), T(D, `${e(r).playedDays ?? ""} ${e(r).playedDays === 1 ? "day" : "days"} played`), T(ee, ue), T(N, `Best: ${e(r).streak.best ?? ""} ${e(r).streak.best === 1 ? "day" : "days"}`), T(Ae, e(H) === null ? e(r).thisWeek ? "Nothing the week before" : "Nothing yet" : (e(H) >= 0 ? "+" : "") + e(H) + "% against last week"), T(Ge, e(s) === "all" ? "By month" : "By day"), vt = je(Je, 1, "bars svelte-fupvt", null, vt, { many: e(r).bars.length > 14 });
        },
        [
          () => e(r).sessions ? "Average " + Ia(e(r).average) : "None in this time"
        ]
      ), v(V, ye);
    };
    M(re, (V) => {
      e(r) ? e(r).since ? V(ne, -1) : V(F, 1) : V(ke);
    });
  }
  L((V) => T(de, `Counted by SteamLite while you play, and kept on this PC. ${V ?? ""}`), [
    () => e(r) && e(r).since ? "Counting since " + new Date(e(r).since).toLocaleDateString(void 0, { day: "numeric", month: "long", year: "numeric" }) + "." : ""
  ]), v(t, $), Lt();
}
Wt(["click"]);
var Cp = /* @__PURE__ */ h('<div class="skel" style="height:260px;border-radius:26px"></div>'), Ep = /* @__PURE__ */ h('<h1 class="title">Profile</h1><p class="muted">That profile could not be loaded. It may be private, or SteamLite Online may not be reachable.</p>', 1), Ap = /* @__PURE__ */ h("<span></span><span> </span>", 1), Ip = /* @__PURE__ */ h('<button class="dchip svelte-8f9rf5" title="Copy their Discord name"><img src="/discord/symbol-white.svg" alt="" draggable="false" class="svelte-8f9rf5"/> </button>'), Pp = /* @__PURE__ */ h('<div class="meta svelte-8f9rf5"><!></div> <!>', 1), Dp = /* @__PURE__ */ h('<button class="btn"><!>Open on Steam</button>'), Np = /* @__PURE__ */ h('<div class="card note rise svelte-8f9rf5" style="--i:1"><b> </b><div class="muted">When they do, their banner, picture and top games show up here.</div></div>'), Op = /* @__PURE__ */ h('<div class="nm ellipsis svelte-8f9rf5"> </div>'), qp = /* @__PURE__ */ h('<button><div class="pa svelte-8f9rf5"><!><span class="rk svelte-8f9rf5"></span></div> <!></button>'), jp = /* @__PURE__ */ h('<div class="sech"><h2>Top games</h2></div> <div class="cards svelte-8f9rf5"></div>', 1), Hp = /* @__PURE__ */ h("<!> <!> <!>", 1), Rp = /* @__PURE__ */ h('<div class="page"><button class="back btn sm svelte-8f9rf5"><!>Back</button> <!></div>');
function $p(t, a) {
  Tt(a, !0);
  let s = /* @__PURE__ */ G(void 0);
  oa(async () => {
    g(s, await ve("friends:player", c.player || {}).catch(() => null), !0);
  });
  const r = /* @__PURE__ */ P(() => e(s) && e(s).look ? e(s).look : { has: !1 }), i = /* @__PURE__ */ P(() => e(s) && e(s).summary), o = /* @__PURE__ */ P(() => e(i) && e(i).personaname || e(r).name || c.player && c.player.name || "Player"), d = /* @__PURE__ */ P(() => e(r).avatar || e(i) && e(i).avatarfull || ""), f = [
    "Offline",
    "Online",
    "Busy",
    "Away",
    "Snoozing",
    "Online",
    "Online"
  ], u = /* @__PURE__ */ P(() => e(i) ? e(i).gameextrainfo ? "Playing " + e(i).gameextrainfo : e(i).personastate > 0 ? f[e(i).personastate] : e(i).lastlogoff ? "Last online " + lr(e(i).lastlogoff * 1e3).toLowerCase() : "Offline" : ""), m = /* @__PURE__ */ P(() => !!(e(i) && (e(i).personastate > 0 || e(i).gameextrainfo))), p = /* @__PURE__ */ P(() => e(r).has && !(e(r).hidden || []).includes("top") && (e(r).showcase || []).length), _ = (H) => c.games.find((I) => I.id === String(H)) || { id: String(H), name: "" }, k = (H) => c.games.some((I) => I.id === String(H)), b = /* @__PURE__ */ P(() => e(r).banner || { mode: "default" });
  var S = Rp(), E = l(S), z = l(E);
  oe(z, { name: "back", size: 15 });
  var x = n(E, 2);
  {
    var A = (H) => {
      var I = Cp();
      v(H, I);
    }, j = (H) => {
      var I = Ep();
      v(H, I);
    }, O = (H) => {
      var I = Hp(), w = we(I);
      {
        const se = (V) => {
          var ye = Pp(), Se = we(ye), Re = l(Se);
          {
            var $e = (J) => {
              var q = Ap(), D = we(q);
              let X;
              var fe = n(D), Z = C(fe, !0);
              L(() => {
                X = je(D, 1, "dot svelte-8f9rf5", null, X, { on: e(m) }), T(Z, e(u));
              }), v(J, q);
            };
            M(Re, (J) => {
              e(i) && J($e);
            });
          }
          var Ye = n(Se, 2);
          {
            var ce = (J) => {
              var q = Ip(), D = n(l(q), 1, !0);
              L(() => T(D, e(r).discord)), y("click", q, () => ve("app:copyText", e(r).discord).then(() => yt("Discord name copied."))), v(J, q);
            };
            M(Ye, (J) => {
              e(r).discord && J(ce);
            });
          }
          v(V, ye);
        }, de = (V) => {
          var ye = ta(), Se = we(ye);
          {
            var Re = ($e) => {
              var Ye = Dp(), ce = l(Ye);
              oe(ce, { name: "ext", size: 16 }), y("click", Ye, () => ve("app:openUrl", e(i).profileurl)), v($e, Ye);
            };
            M(Se, ($e) => {
              e(i) && e(i).profileurl && $e(Re);
            });
          }
          v(V, ye);
        };
        let U = /* @__PURE__ */ P(() => e(s).level || e(r).level || 0), re = /* @__PURE__ */ P(() => e(r).tagline || ""), ke = /* @__PURE__ */ P(() => e(r).has ? "SteamLite profile" : "Steam profile"), F = /* @__PURE__ */ P(() => e(r).bannerUrl || ""), ne = /* @__PURE__ */ P(() => e(p) ? _(e(r).showcase[0]) : null);
        Ko(w, {
          get name() {
            return e(o);
          },
          get avatar() {
            return e(d);
          },
          get level() {
            return e(U);
          },
          get tagline() {
            return e(re);
          },
          get eyebrow() {
            return e(ke);
          },
          get banner() {
            return e(b);
          },
          get bannerImage() {
            return e(F);
          },
          get fav() {
            return e(ne);
          },
          meta: se,
          acts: de,
          $$slots: { meta: !0, acts: !0 }
        });
      }
      var $ = n(w, 2);
      {
        var B = (se) => {
          var de = Np(), U = l(de), re = C(U);
          L(() => T(re, `${e(o) ?? ""} has not set up a SteamLite profile yet.`)), v(se, de);
        };
        M($, (se) => {
          e(r).has || se(B);
        });
      }
      var te = n($, 2);
      {
        var he = (se) => {
          var de = jp(), U = we(de);
          zt(U, (ke) => Kt?.(ke));
          var re = n(U, 2);
          Ve(re, 21, () => e(r).showcase, _t, (ke, F, ne) => {
            var V = qp();
            let ye;
            var Se = l(V), Re = l(Se);
            {
              let q = /* @__PURE__ */ P(() => _(e(F)));
              fs(Re, {
                get g() {
                  return e(q);
                },
                kind: "capsule"
              });
            }
            var $e = n(Re);
            $e.textContent = ne + 1;
            var Ye = n(Se, 2);
            {
              var ce = (q) => {
                var D = Op(), X = C(D, !0);
                L((fe) => T(X, fe), [() => _(e(F)).name]), v(q, D);
              }, J = /* @__PURE__ */ P(() => _(e(F)).name);
              M(Ye, (q) => {
                e(J) && q(ce);
              });
            }
            L(
              (q, D) => {
                ye = je(V, 1, "pc svelte-8f9rf5", null, ye, { dead: q }), Be(V, "title", D);
              },
              [() => !k(e(F)), () => _(e(F)).name]
            ), y("click", V, () => k(e(F)) && $s(e(F))), v(ke, V);
          }), zt(re, (ke) => Kt?.(ke)), v(se, de);
        };
        M(te, (se) => {
          e(p) && se(he);
        });
      }
      v(H, I);
    };
    M(x, (H) => {
      e(s) === void 0 ? H(A) : !e(s) || !e(s).ok ? H(j, 1) : H(O, -1);
    });
  }
  L(() => dt(S, e(r).accent ? "--glow:" + e(r).accent + ";" : "")), y("click", E, function(...H) {
    hn?.apply(this, H);
  }), v(t, S), Lt();
}
Wt(["click"]);
const Ai = [
  {
    id: "default",
    name: "Default look",
    group: "main",
    text: "Deep navy and steel grey, with a green Play button.",
    prev: { bg: "#1A1D2A", rail: "#151827", card: "#2E3349", accent: "#8D99AE", play: "#3ddc97" }
  },
  {
    id: "purple",
    name: "Original purple and blue",
    group: "main",
    text: "The first look of the new SteamLite, with a purple and blue glow.",
    prev: { bg: "linear-gradient(160deg, #07080c, #1b1f3d)", rail: "#0c0e14", card: "#1f2347", accent: "#7c8cff", play: "#7c8cff" }
  },
  {
    id: "discord",
    name: "Discord",
    group: "main",
    text: "Blurple and charcoal, like the Discord app, with Discord green for Play.",
    prev: { bg: "#313338", rail: "#1e1f22", card: "#2b2d31", accent: "#5865f2", play: "#23a55a" }
  },
  {
    id: "xmas",
    name: "Christmas",
    group: "limited",
    menu: !0,
    text: "Red and white, with a red and white logo and snow drifting down.",
    prev: { bg: "linear-gradient(170deg, #4a0d1c, #c1121f 62%, #f3c9ce)", rail: "#36081a", card: "#a31a30", accent: "#ffffff", play: "#ffffff" }
  },
  {
    id: "gta6",
    name: "GTA 6",
    group: "limited",
    text: "A sunset mix of pink, purple and plum. Ending early: it is available until 27 November 2026.",
    prev: { bg: "linear-gradient(170deg, #2b2252, #5D549C 55%, #7E3A63)", rail: "#20183e", card: "#6F70A2", accent: "#EB9998", play: "#EB9998" }
  }
], Fp = [["main", "Always available"], ["limited", "Limited time"]];
var Bp = /* @__PURE__ */ h('<span class="mini svelte-1dp4nom"><i class="rail svelte-1dp4nom"><u class="svelte-1dp4nom"></u><u class="svelte-1dp4nom"></u><u class="svelte-1dp4nom"></u></i> <i class="main svelte-1dp4nom"><em class="top svelte-1dp4nom"></em><em class="c1 svelte-1dp4nom"></em><em class="c2 svelte-1dp4nom"></em><em class="play svelte-1dp4nom"></em></i></span>');
function pi(t, a) {
  Tt(a, !0);
  let s = Dt(a, "tokens", 19, () => ({})), r = Dt(a, "radius", 3, 6);
  const i = /* @__PURE__ */ P(() => s()["--page"] && s()["--page"] !== "none" ? s()["--page"] : s()["--bg"] || "#1A1D2A"), o = /* @__PURE__ */ P(() => s()["--rail"] || "#262B40"), d = /* @__PURE__ */ P(() => s()["--face"] || s()["--slab"] || s()["--bg-raise"] || "#2E3349"), f = /* @__PURE__ */ P(() => s()["--accent"] || "#8D99AE"), u = /* @__PURE__ */ P(() => s()["--play"] || "#3ddc97"), m = /* @__PURE__ */ P(() => Math.min(10, Math.max(2, parseInt(s()["--r"]) / 2 || r())));
  var p = Bp(), _ = l(p), k = l(_), b = n(_, 2), S = l(b), E = n(S), z = n(E), x = n(z);
  L(() => {
    dt(p, `background:${e(i) ?? ""}; --rr:${e(m) ?? ""}px`), dt(_, `background:${e(o) ?? ""}`), dt(k, `background:${e(f) ?? ""}`), dt(S, `background:${e(d) ?? ""}`), dt(E, `background:${e(d) ?? ""}`), dt(z, `background:${e(d) ?? ""}`), dt(x, `background:${e(u) ?? ""}`);
  }), v(t, p), Lt();
}
var cl = /* @__PURE__ */ h("<option> </option>"), Gp = /* @__PURE__ */ h(`<div class="muted sm svelte-1yg81ol">The colours are the theme's own, so the Colours below are locked. Corners, font, pictures, layout and CSS (without colours) still apply. Choose None to pick your own colours.</div>`), Wp = /* @__PURE__ */ h('<span class="lk svelte-1yg81ol">Locked by the theme</span>'), Yp = /* @__PURE__ */ h('<label class="cp svelte-1yg81ol"><input type="color" class="svelte-1yg81ol"/> </label>'), Up = /* @__PURE__ */ h('<div class="cg svelte-1yg81ol"><label class="cp svelte-1yg81ol"><input type="color" class="svelte-1yg81ol"/>Fade to</label><label class="sl svelte-1yg81ol">Angle<input type="range" min="0" max="360" class="svelte-1yg81ol"/></label></div>'), dl = /* @__PURE__ */ h('<img alt="" class="svelte-1yg81ol"/>'), Vp = /* @__PURE__ */ h('<span class="muted">SteamLite logo</span>'), ul = /* @__PURE__ */ h('<button class="lnk svelte-1yg81ol">Remove</button>'), Kp = /* @__PURE__ */ h('<span class="muted">Background</span>'), Xp = /* @__PURE__ */ h('<label class="sl svelte-1yg81ol">Darken<input type="range" min="0" max="80" class="svelte-1yg81ol"/><span class="svelte-1yg81ol"> </span></label><label class="sl svelte-1yg81ol">Blur<input type="range" min="0" max="24" class="svelte-1yg81ol"/><span class="svelte-1yg81ol"> </span></label>', 1), fl = /* @__PURE__ */ h('<label class="row2 svelte-1yg81ol"><!> </label>'), Jp = /* @__PURE__ */ h('<button class="lnk svelte-1yg81ol">Use my own cover size</button>'), Zp = /* @__PURE__ */ h('<div class="bad svelte-1yg81ol"> </div>'), Qp = /* @__PURE__ */ h('<div class="muted sm svelte-1yg81ol"> </div>'), em = /* @__PURE__ */ h('<section class="card svelte-1yg81ol"><!><!></section>'), tm = /* @__PURE__ */ h('<div class="cols svelte-1yg81ol"><div class="col svelte-1yg81ol"><section class="card svelte-1yg81ol"><h3 class="svelte-1yg81ol">About</h3> <label class="svelte-1yg81ol">Name<input class="txt svelte-1yg81ol" maxlength="40" placeholder="My look"/></label> <label class="svelte-1yg81ol">Your name<input class="txt svelte-1yg81ol" maxlength="40" placeholder="Shown with the module"/></label> <label class="svelte-1yg81ol">What it does<input class="txt svelte-1yg81ol" maxlength="200" placeholder="A short line"/></label></section> <section class="card svelte-1yg81ol"><h3 class="svelte-1yg81ol">Theme</h3> <div class="muted sm svelte-1yg81ol">A module replaces the theme you picked. You can include one of the ready-made themes in it, and people who use your module get that theme.</div> <label class="svelte-1yg81ol">Include a theme<select class="txt svelte-1yg81ol"><option>None (the plain look)</option><!></select></label> <!></section> <section><h3 class="svelte-1yg81ol">Colours<!></h3> <div class="cg svelte-1yg81ol"></div> <div class="muted sm svelte-1yg81ol">Everything else (panels, lines, the sidebar, hover colours) is worked out from these five. A light background gives a light theme.</div> <label class="row2 svelte-1yg81ol"><!> Fade the background into a second colour</label> <!></section> <section class="card svelte-1yg81ol"><h3 class="svelte-1yg81ol">Shape and text</h3> <label class="sl svelte-1yg81ol">Corners<input type="range" min="0" max="26" class="svelte-1yg81ol"/><span class="svelte-1yg81ol"> </span></label> <label class="svelte-1yg81ol">Font<select class="txt svelte-1yg81ol"></select></label></section> <section class="card svelte-1yg81ol"><h3 class="svelte-1yg81ol">Pictures</h3> <div class="pics svelte-1yg81ol"><div class="pic svelte-1yg81ol"><div class="pv logo svelte-1yg81ol"><!></div><div class="pb svelte-1yg81ol"><button class="btn sm svelte-1yg81ol"><!> </button><!></div></div> <div class="pic svelte-1yg81ol"><div class="pv bgp svelte-1yg81ol"><!></div><div class="pb svelte-1yg81ol"><button class="btn sm svelte-1yg81ol"><!> </button><!></div></div></div> <!> <div class="muted sm svelte-1yg81ol">PNG, JPEG or WebP. Pictures are kept inside the module.</div></section></div> <div class="col svelte-1yg81ol"><section class="card svelte-1yg81ol"><h3 class="svelte-1yg81ol">Preview</h3><div class="pvw svelte-1yg81ol"><!></div></section> <section class="card svelte-1yg81ol"><h3 class="svelte-1yg81ol">What shows</h3> <div class="muted sm svelte-1yg81ol">Turn off the parts of the app you do not use. Settings is always there.</div> <div class="lt svelte-1yg81ol"><b class="svelte-1yg81ol">Sidebar</b><!></div> <div class="lt svelte-1yg81ol"><b class="svelte-1yg81ol">Home page</b><!></div> <label class="sl svelte-1yg81ol">Library cover size<input type="range" min="0" max="260" step="2" class="svelte-1yg81ol"/><span class="svelte-1yg81ol"> </span></label> <!></section> <section class="card svelte-1yg81ol"><h3 class="svelte-1yg81ol">Advanced: your own CSS</h3> <div class="muted sm svelte-1yg81ol">For people who know CSS. It can restyle anything in the app. It cannot run code, load anything from the internet or use fixed or sticky positions, and anything unsafe is removed. Use <code class="svelte-1yg81ol">asset(logo.png)</code> to use a picture from this module.</div> <textarea class="txt code svelte-1yg81ol" rows="7" spellcheck="false"></textarea></section> <!></div></div>'), am = /* @__PURE__ */ h('<div class="skel" style="height:200px"></div>'), sm = /* @__PURE__ */ h('<div class="ed svelte-1yg81ol"><header class="eh svelte-1yg81ol"><button class="btn sm svelte-1yg81ol"><!>Back</button><div class="grow"><h2 class="svelte-1yg81ol"> </h2><div class="muted">Changes show on the app right now. Press Save to keep them.</div></div><button class="btn primary"><!>Save</button></header> <!></div> <!> <!>', 1);
function rm(t, a) {
  Tt(a, !0);
  let s = Dt(a, "id", 3, ""), r = /* @__PURE__ */ G(""), i = /* @__PURE__ */ G(""), o = /* @__PURE__ */ G(""), d = Ct(s()), f = /* @__PURE__ */ G(Ct({
    bg: "#1A1D2A",
    text: "#E9EBF2",
    accent: "#8D99AE",
    accent2: "#A0AABB",
    play: "#3ddc97"
  })), u = /* @__PURE__ */ G(!1), m = /* @__PURE__ */ G("#2b2252"), p = /* @__PURE__ */ G(160), _ = /* @__PURE__ */ G(12), k = /* @__PURE__ */ G(""), b = /* @__PURE__ */ G(""), S = /* @__PURE__ */ G(""), E = /* @__PURE__ */ G(30), z = /* @__PURE__ */ G(0), x = /* @__PURE__ */ G(null), A = /* @__PURE__ */ G(""), j = /* @__PURE__ */ G(Ct([])), O = /* @__PURE__ */ G(Ct([])), H = /* @__PURE__ */ G(0), I = /* @__PURE__ */ G(""), w = /* @__PURE__ */ G(Ct([])), $ = /* @__PURE__ */ G(Ct([])), B = /* @__PURE__ */ G(!s()), te = /* @__PURE__ */ G(!1), he = 0;
  const se = [
    ["home", "Home"],
    ["library", "Library"],
    ["news", "News"],
    ["stats", "Stats"]
  ], de = [
    ["hero", "The big game at the top"],
    ["stats", "The number tiles"],
    ["recent", "Recently played"],
    ["most", "Most played"],
    ["favorites", "Favorites"],
    ["news", "News from your games"]
  ], U = /* @__PURE__ */ P(() => Bo(e(f), {
    page: e(u) ? e(m) : "",
    angle: e(p),
    radius: e(_),
    font: e(k)
  })), re = ["--r-xl", "--r-lg", "--r", "--r-sm", "--font"], ke = /* @__PURE__ */ P(() => e(
    A
    // with a theme included the colours are the theme's own
  ) ? Object.fromEntries(Object.entries(e(U)).filter(([ie]) => re.includes(ie))) : e(U)), F = (ie) => String(ie || "").replace(/^data:[^,]+,/, ""), ne = () => ({
    ...e(b) ? { "assets/logo.png": F(e(b)) } : {},
    ...e(S) ? { "assets/bg.jpg": F(e(S)) } : {}
  }), V = /* @__PURE__ */ P(() => ({
    schema: 1,
    base: e(A),
    id: d || Go(e(r)) || "my-module",
    name: e(r) || "My module",
    version: "1.0.0",
    author: e(i),
    description: e(o),
    tokens: e(ke),
    editor: { ...e(f), radius: e(_), font: e(k) },
    ...e(b) ? { logo: "assets/logo.png" } : {},
    ...e(S) ? {
      background: { image: "assets/bg.jpg", dim: e(E), blur: e(z) }
    } : {},
    layout: {
      sidebar: { hide: e(j) },
      home: { hide: e(O) },
      ...e(H) ? { library: { coverSize: e(H) } } : {}
    },
    ...e(I).trim() ? { css: e(I) } : {}
  }));
  oa(async () => {
    if (!s()) return;
    const ie = await ve("modules:get", s()).catch(() => null);
    if (!ie) {
      a.onclose && a.onclose();
      return;
    }
    const me = ie.manifest, Me = me.tokens || {}, Ae = me.editor || {};
    g(r, me.name || "", !0), g(i, me.author || "", !0), g(o, me.description || "", !0), g(
      f,
      {
        bg: Ae.bg || Me["--bg"] || e(f).bg,
        text: Ae.text || Me["--text"] || e(f).text,
        accent: Ae.accent || Me["--accent"] || e(f).accent,
        accent2: Ae.accent2 || Me["--accent2"] || e(f).accent2,
        play: Ae.play || Me["--play"] || e(f).play
      },
      !0
    ), g(_, Ae.radius != null ? Ae.radius : parseInt(Me["--r"]) || 12, !0), g(k, Ae.font || "", !0);
    const Ie = String(Me["--page"] || "").match(/^linear-gradient\(\s*(\d+)deg,\s*#[0-9a-f]{6},\s*(#[0-9a-f]{6})\s*\)$/i);
    Ie && (g(u, !0), g(p, +Ie[1]), g(m, Ie[2], !0)), me.logo && ie.assets[me.logo.slice(7)] && g(b, ie.assets[me.logo.slice(7)], !0), me.background && ie.assets[me.background.image.slice(7)] && (g(S, ie.assets[me.background.image.slice(7)], !0), g(E, me.background.dim, !0), g(z, me.background.blur, !0)), g(j, me.layout && me.layout.sidebar && me.layout.sidebar.hide || [], !0), g(O, me.layout && me.layout.home && me.layout.home.hide || [], !0), g(H, me.layout && me.layout.library && me.layout.library.coverSize || 0, !0), g(I, me.css || "", !0), g(A, me.base || "", !0), g(B, !0);
  }), $t(() => {
    if (!e(B)) return;
    const ie = JSON.parse(JSON.stringify(e(V))), me = ne();
    clearTimeout(he), he = setTimeout(
      async () => {
        const Me = await ve("modules:preview", { manifest: ie, files: me }).catch(() => null);
        Me && (g($, Me.errors || [], !0), g(w, Me.warnings || [], !0), qo(Me.css, Me.base));
      },
      220
    );
  }), nn(() => {
    clearTimeout(he), jo();
  });
  const ye = (ie, me) => ie.includes(me) ? ie.filter((Me) => Me !== me) : [...ie, me];
  async function Se() {
    g(te, !0);
    const ie = await ve("modules:save", {
      manifest: JSON.parse(JSON.stringify(e(V))),
      files: ne()
    }).catch(() => null);
    if (g(te, !1), !ie || !ie.ok) {
      g($, ie && ie.errors || ["It could not be saved."], !0);
      return;
    }
    yt("Module saved."), a.onclose && a.onclose(ie.id);
  }
  const Re = (ie, me) => {
    g(x, null), g(ie === "logo" ? b : S, me, !0);
  };
  var $e = sm(), Ye = we($e), ce = l(Ye), J = l(ce), q = l(J);
  oe(q, { name: "back", size: 15 });
  var D = n(J), X = l(D), fe = C(X, !0), Z = n(D), W = l(Z);
  oe(W, { name: "check", size: 16, stroke: 3 });
  var ee = n(ce, 2);
  {
    var pe = (ie) => {
      var me = tm(), Me = l(me), Ae = l(Me), Ie = n(l(Ae), 2), De = n(l(Ie)), Ge = n(Ie, 2), We = n(l(Ge)), Je = n(Ge, 2), vt = n(l(Je)), Q = n(Ae, 2), xe = n(l(Q), 4), Te = n(l(xe)), tt = l(Te);
      tt.value = tt.__value = "";
      var He = n(tt);
      Ve(He, 17, () => Ai.filter((Ne) => Os(Ne.id) && Ne.id !== "default"), _t, (Ne, Ee) => {
        var ht = cl(), Xt = C(ht, !0), na = {};
        L(() => {
          T(Xt, e(Ee).name), na !== (na = e(Ee).id) && (ht.value = (ht.__value = na) ?? "");
        }), v(Ne, ht);
      }), Gi(Te);
      var lt = n(xe, 2);
      {
        var ut = (Ne) => {
          var Ee = Gp();
          v(Ne, Ee);
        };
        M(lt, (Ne) => {
          e(A) && Ne(ut);
        });
      }
      var it = n(Q, 2);
      let jt;
      var Ke = l(it), kt = n(l(Ke));
      {
        var Mt = (Ne) => {
          var Ee = Wp();
          v(Ne, Ee);
        };
        M(kt, (Ne) => {
          e(A) && Ne(Mt);
        });
      }
      var wt = n(Ke, 2);
      Ve(
        wt,
        20,
        () => [
          ["bg", "Background"],
          ["text", "Text"],
          ["accent", "Accent"],
          ["accent2", "Second accent"],
          ["play", "Play button"]
        ],
        _t,
        (Ne, Ee) => {
          var ht = /* @__PURE__ */ P(() => Ns(Ee, 2));
          let Xt = () => e(ht)[0], na = () => e(ht)[1];
          var Zt = Yp(), aa = l(Zt), fa = n(aa, 1, !0);
          L(() => T(fa, na())), ia(aa, () => e(f)[Xt()], (Za) => e(f)[Xt()] = Za), v(Ne, Zt);
        }
      );
      var Ze = n(wt, 4), st = l(Ze);
      Ut(st, {
        get checked() {
          return e(u);
        },
        onchange: (Ne) => g(u, Ne, !0)
      });
      var gt = n(Ze, 2);
      {
        var at = (Ne) => {
          var Ee = Up(), ht = l(Ee), Xt = l(ht), na = n(ht), Zt = n(l(na));
          ia(Xt, () => e(m), (aa) => g(m, aa)), ia(Zt, () => e(p), (aa) => g(p, aa)), v(Ne, Ee);
        };
        M(gt, (Ne) => {
          e(u) && Ne(at);
        });
      }
      var Qe = n(it, 2), mt = n(l(Qe), 2), Xe = n(l(mt)), ue = n(Xe), Ue = C(ue), et = n(mt, 2), Fe = n(l(et));
      Ve(Fe, 21, () => Fo, _t, (Ne, Ee) => {
        var ht = /* @__PURE__ */ P(() => Ns(e(Ee), 2));
        let Xt = () => e(ht)[0], na = () => e(ht)[1];
        var Zt = cl(), aa = C(Zt, !0), fa = {};
        L(() => {
          T(aa, na()), fa !== (fa = Xt()) && (Zt.value = (Zt.__value = fa) ?? "");
        }), v(Ne, Zt);
      }), Gi(Fe);
      var ft = n(Qe, 2), rt = n(l(ft), 2), ct = l(rt), ze = l(ct), nt = l(ze);
      {
        var pt = (Ne) => {
          var Ee = dl();
          L(() => Be(Ee, "src", e(b))), v(Ne, Ee);
        }, Le = (Ne) => {
          var Ee = Vp();
          v(Ne, Ee);
        };
        M(nt, (Ne) => {
          e(b) ? Ne(pt) : Ne(Le, -1);
        });
      }
      var St = n(ze), Ft = l(St), Nt = l(Ft);
      oe(Nt, { name: "image", size: 15 });
      var Vt = n(Nt, 1, !0), K = n(Ft);
      {
        var Ce = (Ne) => {
          var Ee = ul();
          y("click", Ee, () => g(b, "")), v(Ne, Ee);
        };
        M(K, (Ne) => {
          e(b) && Ne(Ce);
        });
      }
      var Pe = n(ct, 2), qe = l(Pe), ot = l(qe);
      {
        var At = (Ne) => {
          var Ee = dl();
          L(() => Be(Ee, "src", e(S))), v(Ne, Ee);
        }, It = (Ne) => {
          var Ee = Kp();
          v(Ne, Ee);
        };
        M(ot, (Ne) => {
          e(S) ? Ne(At) : Ne(It, -1);
        });
      }
      var ra = n(qe), Jt = l(ra), Y = l(Jt);
      oe(Y, { name: "image", size: 15 });
      var _e = n(Y, 1, !0), xt = n(Jt);
      {
        var Bt = (Ne) => {
          var Ee = ul();
          y("click", Ee, () => g(S, "")), v(Ne, Ee);
        };
        M(xt, (Ne) => {
          e(S) && Ne(Bt);
        });
      }
      var Ot = n(rt, 2);
      {
        var Gt = (Ne) => {
          var Ee = Xp(), ht = we(Ee), Xt = n(l(ht)), na = n(Xt), Zt = C(na), aa = n(ht), fa = n(l(aa)), Za = n(fa), Ys = C(Za);
          L(() => {
            T(Zt, `${e(E) ?? ""}%`), T(Ys, `${e(z) ?? ""}px`);
          }), ia(Xt, () => e(E), (As) => g(E, As)), ia(fa, () => e(z), (As) => g(z, As)), v(Ne, Ee);
        };
        M(Ot, (Ne) => {
          e(S) && Ne(Gt);
        });
      }
      var Ht = n(Me, 2), Pt = l(Ht), Yt = n(l(Pt)), ea = l(Yt);
      pi(ea, {
        get tokens() {
          return e(ke);
        }
      });
      var sa = n(Pt, 2), ba = n(l(sa), 4), Na = n(l(ba));
      Ve(Na, 17, () => se, _t, (Ne, Ee) => {
        var ht = /* @__PURE__ */ P(() => Ns(e(Ee), 2));
        let Xt = () => e(ht)[0], na = () => e(ht)[1];
        var Zt = fl(), aa = l(Zt);
        {
          let Za = /* @__PURE__ */ P(() => !e(j).includes(Xt()));
          Ut(aa, {
            get checked() {
              return e(Za);
            },
            onchange: () => g(j, ye(e(j), Xt()), !0)
          });
        }
        var fa = n(aa);
        L(() => T(fa, ` ${na() ?? ""}`)), v(Ne, Zt);
      });
      var Ka = n(ba, 2), Es = n(l(Ka));
      Ve(Es, 17, () => de, _t, (Ne, Ee) => {
        var ht = /* @__PURE__ */ P(() => Ns(e(Ee), 2));
        let Xt = () => e(ht)[0], na = () => e(ht)[1];
        var Zt = fl(), aa = l(Zt);
        {
          let Za = /* @__PURE__ */ P(() => !e(O).includes(Xt()));
          Ut(aa, {
            get checked() {
              return e(Za);
            },
            onchange: () => g(O, ye(e(O), Xt()), !0)
          });
        }
        var fa = n(aa);
        L(() => T(fa, ` ${na() ?? ""}`)), v(Ne, Zt);
      });
      var pa = n(Ka, 2), da = n(l(pa)), Ha = n(da), Xa = C(Ha, !0), cr = n(pa, 2);
      {
        var Ws = (Ne) => {
          var Ee = Jp();
          y("click", Ee, () => g(H, 0)), v(Ne, Ee);
        };
        M(cr, (Ne) => {
          e(H) && Ne(Ws);
        });
      }
      var dr = n(sa, 2), Ja = n(l(dr), 4);
      Be(Ja, "placeholder", ".btn { letter-spacing: .03em; }");
      var Nr = n(dr, 2);
      {
        var Or = (Ne) => {
          var Ee = em(), ht = l(Ee);
          Ve(ht, 17, () => e($), _t, (na, Zt) => {
            var aa = Zp(), fa = C(aa, !0);
            L(() => T(fa, e(Zt))), v(na, aa);
          });
          var Xt = n(ht);
          Ve(Xt, 17, () => e(w), _t, (na, Zt) => {
            var aa = Qp(), fa = C(aa, !0);
            L(() => T(fa, e(Zt))), v(na, aa);
          }), v(Ne, Ee);
        };
        M(Nr, (Ne) => {
          (e($).length || e(w).length) && Ne(Or);
        });
      }
      L(() => {
        jt = je(it, 1, "card svelte-1yg81ol", null, jt, { locked: !!e(A) }), wt.inert = !!e(A), Ze.inert = !!e(A), T(Ue, `${e(_) ?? ""}px`), T(Vt, e(b) ? "Change" : "Use your own logo"), T(_e, e(S) ? "Change" : "Add a background"), ys(da, e(H) || 176), T(Xa, e(H) ? e(H) + "px" : "yours");
      }), ia(De, () => e(r), (Ne) => g(r, Ne)), ia(We, () => e(i), (Ne) => g(i, Ne)), ia(vt, () => e(o), (Ne) => g(o, Ne)), Wi(Te, () => e(A), (Ne) => g(A, Ne)), ia(Xe, () => e(_), (Ne) => g(_, Ne)), Wi(Fe, () => e(k), (Ne) => g(k, Ne)), y("click", Ft, () => g(x, "logo")), y("click", Jt, () => g(x, "bg")), y("input", da, (Ne) => g(H, +Ne.currentTarget.value)), ia(Ja, () => e(I), (Ne) => g(I, Ne)), v(ie, me);
    }, R = (ie) => {
      var me = am();
      v(ie, me);
    };
    M(ee, (ie) => {
      e(B) ? ie(pe) : ie(R, -1);
    });
  }
  var ge = n(Ye, 2);
  {
    var be = (ie) => {
      Mn(ie, {
        title: "Your logo",
        ratio: 1,
        outW: 256,
        outH: 256,
        format: "image/png",
        onsave: (me) => Re("logo", me),
        onclose: () => g(x, null)
      });
    };
    M(ge, (ie) => {
      e(x) === "logo" && ie(be);
    });
  }
  var N = n(ge, 2);
  {
    var ae = (ie) => {
      Mn(ie, {
        title: "Your background",
        ratio: 1.78,
        outW: 1600,
        outH: 900,
        onsave: (me) => Re("bg", me),
        onclose: () => g(x, null)
      });
    };
    M(N, (ie) => {
      e(x) === "bg" && ie(ae);
    });
  }
  L(() => {
    T(fe, s() ? "Edit " + (e(r) || "module") : "Make a module"), Z.disabled = e(te) || !e(B) || !!e($).length;
  }), y("click", J, () => a.onclose && a.onclose()), y("click", Z, Se), v(t, $e), Lt();
}
Wt(["click", "input"]);
var nm = /* @__PURE__ */ h('<div class="step svelte-1ebj5r6"><div class="ico svelte-1ebj5r6"><!></div> <h2 class="svelte-1ebj5r6"> </h2> <p class="muted svelte-1ebj5r6"> </p></div>'), im = /* @__PURE__ */ h("<i></i>"), lm = /* @__PURE__ */ h('<button class="btn">Back</button>'), om = /* @__PURE__ */ h('<div class="back svelte-1ebj5r6" role="presentation"><div class="dlg glass svelte-1ebj5r6" role="dialog" aria-modal="true" aria-label="Customise tutorial" tabindex="-1"><!> <div class="dots svelte-1ebj5r6" aria-hidden="true"></div> <div class="row svelte-1ebj5r6"><button class="btn"> </button> <div class="grow"></div> <!> <button class="btn primary"> </button></div></div></div>');
function vm(t, a) {
  Tt(a, !0);
  const s = [
    {
      icon: "sliders",
      title: "Welcome to Customise",
      text: "Here you make SteamLite look the way you like. A module changes colours, shapes, a font, a logo, a background, and what shows in the app. Modules are plain settings, never code.",
      tab: "mine"
    },
    {
      icon: "plus",
      title: "Make your own",
      text: "Press Make a module. Pick five colours and SteamLite works out the whole theme. Everything you change shows on the real app while you work, and nothing is kept until you press Save.",
      tab: "mine"
    },
    {
      icon: "download",
      title: "Get one from someone else",
      text: "The Gallery has modules people have made. You can also press Add a module to paste a GitHub or Gist link, or to choose a file a friend sent you.",
      tab: "gallery"
    },
    {
      icon: "ext",
      title: "Share yours",
      text: "Open the three dots on a module to publish it to GitHub in one click, save it as a file, or submit it to the Gallery. You sign in to GitHub once with a short code, and SteamLite can only create Gists.",
      tab: "mine"
    },
    {
      icon: "layers",
      title: "Themes",
      text: "The Themes tab has the ready-made looks. While a module is in use your theme is switched off, because a module is its own whole look. A module can include a theme if its maker added one.",
      tab: "themes"
    },
    {
      icon: "lock",
      title: "If something goes wrong",
      text: "If a module ever makes SteamLite hard to use, press Ctrl + Alt + Shift + M. It switches every module off, and pressing it again switches them back on. You can play this tutorial again from the Tutorial button at the top.",
      tab: "mine"
    }
  ];
  let r = /* @__PURE__ */ G(0);
  const i = /* @__PURE__ */ P(() => s[e(r)]);
  $t(() => {
    a.onstep && a.onstep(e(i).tab);
  });
  const o = () => e(r) < s.length - 1 ? si(r) : a.onclose(), d = () => {
    e(r) > 0 && si(r, -1);
  };
  function f(j) {
    j.key === "Escape" ? a.onclose() : j.key === "ArrowRight" || j.key === "Enter" ? o() : j.key === "ArrowLeft" && d();
  }
  var u = om();
  xa("keydown", Ls, f);
  var m = l(u), p = l(m);
  is(p, () => e(r), (j) => {
    var O = nm(), H = l(O), I = l(H);
    oe(I, {
      get name() {
        return e(i).icon;
      },
      size: 30
    });
    var w = n(H, 2), $ = C(w, !0), B = n(w, 2), te = C(B, !0);
    L(() => {
      T($, e(i).title), T(te, e(i).text);
    }), bt(1, O, () => La, () => ({ x: 24, duration: 360, easing: ca })), v(j, O);
  });
  var _ = n(p, 2);
  Ve(_, 21, () => s, _t, (j, O, H) => {
    var I = im();
    let w;
    L(() => w = je(I, 1, "svelte-1ebj5r6", null, w, { on: H === e(r) })), v(j, I);
  });
  var k = n(_, 2), b = l(k), S = C(b, !0), E = n(b, 4);
  {
    var z = (j) => {
      var O = lm();
      y("click", O, d), v(j, O);
    };
    M(E, (j) => {
      e(r) > 0 && j(z);
    });
  }
  var x = n(E, 2), A = C(x, !0);
  L(() => {
    T(S, e(r) === s.length - 1 ? "Close" : "Skip"), T(A, e(r) === s.length - 1 ? "Got it" : "Next");
  }), y("click", b, function(...j) {
    a.onclose?.apply(this, j);
  }), y("click", x, o), bt(3, u, () => ha, () => ({ duration: 160 })), v(t, u), Lt();
}
Wt(["click"]);
var cm = /* @__PURE__ */ h('<span class="tick svelte-cup5bp" aria-hidden="true"><!></span>'), dm = /* @__PURE__ */ h("<span> </span>"), um = /* @__PURE__ */ h('<div class="tmenu glass svelte-cup5bp" role="menu"><button role="menuitemcheckbox" class="svelte-cup5bp"><span><!></span>Snow</button></div>'), fm = /* @__PURE__ */ h('<button aria-haspopup="menu"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="3" cy="8" r="1.5"></circle><circle cx="8" cy="8" r="1.5"></circle><circle cx="13" cy="8" r="1.5"></circle></svg></button> <!>', 1), hm = /* @__PURE__ */ h('<div class="tw svelte-cup5bp"><button role="radio"><span class="mini svelte-cup5bp"><i class="rail svelte-cup5bp"><u class="svelte-cup5bp"></u><u class="svelte-cup5bp"></u><u class="svelte-cup5bp"></u></i> <i class="main svelte-cup5bp"><em class="top svelte-cup5bp"></em><em class="c1 svelte-cup5bp"></em><em class="c2 svelte-cup5bp"></em><em class="play svelte-cup5bp"></em></i> <!></span> <span class="meta svelte-cup5bp"><b class="svelte-cup5bp"> </b><!></span> <small class="svelte-cup5bp"> </small></button> <!></div>'), pm = /* @__PURE__ */ h('<div class="gl svelte-cup5bp"> </div> <div class="grid svelte-cup5bp"></div>', 1), mm = /* @__PURE__ */ h('<div role="radiogroup" aria-label="Theme"></div>');
function gm(t, a) {
  Tt(a, !0);
  let s = Dt(a, "cur", 3, "default"), r = Dt(a, "snow", 3, !0), i = Dt(a, "locked", 3, !1), o = /* @__PURE__ */ G("");
  const d = (_) => {
    e(o) && !_.target.closest(".tw") && g(o, "");
  }, f = /* @__PURE__ */ P(() => Fp.map(([_, k]) => ({
    id: _,
    label: k,
    items: Ai.filter((b) => b.group === _ && td(b.id))
  })).filter((_) => _.items.length)), u = (_) => s() === _.id ? "In use" : Os(_.id) ? "" : di(_.id).note;
  var m = mm();
  xa("pointerdown", Ls, d), xa("keydown", Ls, (_) => _.key === "Escape" && g(o, ""));
  let p;
  Ve(m, 21, () => e(f), _t, (_, k) => {
    var b = pm(), S = we(b), E = C(S, !0), z = n(S, 2);
    Ve(z, 21, () => e(k).items, (x) => x.id, (x, A) => {
      var j = hm(), O = l(j);
      let H;
      var I = l(O), w = l(I), $ = l(w), B = n(w, 2), te = l(B), he = n(te), se = n(he), de = n(se), U = n(B, 2);
      {
        var re = (q) => {
          var D = cm(), X = l(D);
          oe(X, { name: "check", size: 13, stroke: 3 }), v(q, D);
        };
        M(U, (q) => {
          s() === e(A).id && q(re);
        });
      }
      var ke = n(I, 2), F = l(ke), ne = C(F, !0), V = n(F);
      {
        var ye = (q) => {
          var D = dm();
          let X;
          var fe = C(D, !0);
          L(
            (Z) => {
              X = je(D, 1, "pill svelte-cup5bp", null, X, { use: s() === e(A).id }), T(fe, Z);
            },
            [() => u(e(A))]
          ), v(q, D);
        }, Se = /* @__PURE__ */ P(() => u(e(A)));
        M(V, (q) => {
          e(Se) && q(ye);
        });
      }
      var Re = n(ke, 2), $e = C(Re, !0), Ye = n(O, 2);
      {
        var ce = (q) => {
          var D = fm(), X = we(D);
          let fe;
          var Z = n(X, 2);
          {
            var W = (ee) => {
              var pe = um(), R = l(pe), ge = l(R);
              let be;
              var N = l(ge);
              {
                var ae = (ie) => {
                  oe(ie, { name: "check", size: 13, stroke: 3 });
                };
                M(N, (ie) => {
                  r() && ie(ae);
                });
              }
              L(() => {
                Be(R, "aria-checked", r()), be = je(ge, 1, "cb svelte-cup5bp", null, be, { on: r() });
              }), y("click", R, () => a.onsnow && a.onsnow(!r())), v(ee, pe);
            };
            M(Z, (ee) => {
              e(o) === e(A).id && ee(W);
            });
          }
          L(() => {
            fe = je(X, 1, "dots svelte-cup5bp", null, fe, { shift: s() === e(A).id }), Be(X, "aria-label", `${e(A).name ?? ""} options`), Be(X, "aria-expanded", e(o) === e(A).id);
          }), y("click", X, (ee) => {
            ee.stopPropagation(), g(o, e(o) === e(A).id ? "" : e(A).id, !0);
          }), v(q, D);
        }, J = /* @__PURE__ */ P(() => e(A).menu && Os(e(A).id) && !i());
        M(Ye, (q) => {
          e(J) && q(ce);
        });
      }
      L(
        (q, D, X) => {
          H = je(O, 1, "tc svelte-cup5bp", null, H, { on: s() === e(A).id, locked: q }), Be(O, "aria-checked", s() === e(A).id), O.disabled = D, dt(I, `background:${e(A).prev.bg ?? ""}`), dt(w, `background:${e(A).prev.rail ?? ""}`), dt($, `background:${e(A).prev.accent ?? ""}`), dt(te, `background:${e(A).prev.card ?? ""}`), dt(he, `background:${e(A).prev.card ?? ""}`), dt(se, `background:${e(A).prev.card ?? ""}`), dt(de, `background:${e(A).prev.play ?? ""}`), T(ne, e(A).name), T($e, X);
        },
        [
          () => !Os(e(A).id),
          () => !Os(e(A).id) || i(),
          () => di(e(A).id).text || e(A).text
        ]
      ), y("click", O, () => a.onpick && a.onpick(e(A).id)), v(x, j);
    }), L(() => T(E, e(k).label)), v(_, b);
  }), L(() => p = je(m, 1, "tp svelte-cup5bp", null, p, { locked: i() })), v(t, m), Lt();
}
Wt(["click"]);
var _m = /* @__PURE__ */ h('<div class="page"><!></div>'), bm = /* @__PURE__ */ h('<div class="lock card rise svelte-1eka9zm" style="--i:3"><!><div class="grow"><b> </b><div class="muted sm svelte-1eka9zm">A module is its own whole look, so your theme is switched off while it is in use (unless the module includes one). Stop using the module to go back to your theme.</div></div><button class="btn primary">Stop using it</button></div>'), ym = /* @__PURE__ */ h('<!> <div class="rise" style="--i:4"><!></div>', 1), wm = /* @__PURE__ */ h('<div class="now card rise svelte-1eka9zm" style="--i:3"><span class="live svelte-1eka9zm"></span><div class="grow"><b> </b><div class="muted sm svelte-1eka9zm"> </div></div><button class="btn">Stop using it</button></div>'), km = /* @__PURE__ */ h('<div class="empty card rise svelte-1eka9zm" style="--i:4"><!><b>No modules yet</b><span class="muted">A module is your own look for SteamLite. Make one in a minute, or get one from the Gallery.</span><div class="row svelte-1eka9zm"><button class="btn primary">Make a module</button><button class="btn">Open the Gallery</button></div></div>'), xm = /* @__PURE__ */ h('<span class="pill use svelte-1eka9zm">In use</span>'), Sm = /* @__PURE__ */ h('<span class="pill upd svelte-1eka9zm">Update</span>'), Mm = /* @__PURE__ */ h('<span class="t svelte-1eka9zm">CSS</span>'), Tm = /* @__PURE__ */ h('<span class="t svelte-1eka9zm">Layout</span>'), Lm = /* @__PURE__ */ h('<span class="t svelte-1eka9zm">Theme</span>'), zm = /* @__PURE__ */ h('<span class="t svelte-1eka9zm">Logo</span>'), Cm = /* @__PURE__ */ h('<span class="t svelte-1eka9zm">Background</span>'), Em = /* @__PURE__ */ h('<span class="t svelte-1eka9zm">GitHub</span>'), Am = /* @__PURE__ */ h('<button class="btn sm primary svelte-1eka9zm"> </button>'), Im = /* @__PURE__ */ h("<button> </button>"), Pm = /* @__PURE__ */ h('<button role="menuitem" class="svelte-1eka9zm"><!> </button>'), Dm = /* @__PURE__ */ h('<div class="mm glass svelte-1eka9zm" role="menu"><button role="menuitem" class="svelte-1eka9zm"><!>Publish to GitHub</button> <button role="menuitem" class="svelte-1eka9zm"><!>Save as a file</button> <button role="menuitem" class="svelte-1eka9zm"><!>Submit to the gallery</button> <!> <div class="sep svelte-1eka9zm"></div> <button role="menuitem" class="bad svelte-1eka9zm"><!>Remove</button></div>'), Nm = /* @__PURE__ */ h('<article><!> <div class="meta svelte-1eka9zm"><b class="svelte-1eka9zm"> </b><!><!></div> <div class="muted sm svelte-1eka9zm"> </div> <div class="tags svelte-1eka9zm"><span> </span><!><!><!><!><!><!></div> <div class="acts svelte-1eka9zm"><!> <button class="btn sm svelte-1eka9zm">Edit</button> <div class="mw svelte-1eka9zm"><button class="btn sm ic svelte-1eka9zm" aria-haspopup="menu"><!></button> <!></div></div></article>'), Om = /* @__PURE__ */ h('<div class="grid svelte-1eka9zm"></div>'), qm = /* @__PURE__ */ h('Signed in to GitHub as <b> </b>. <button class="lnk svelte-1eka9zm">Sign out</button>', 1), jm = /* @__PURE__ */ h('<div class="acts2 rise svelte-1eka9zm" style="--i:2"><button class="btn primary"><!>Make a module</button> <button class="btn"><!>Add a module</button> <div class="grow"></div> <label class="sw svelte-1eka9zm" title="Switch every module off without removing them"><span class="muted">Modules on</span><!></label></div> <input type="file" accept=".slmod,.json,application/json" hidden=""/> <!> <!> <div class="muted sm foot svelte-1eka9zm">If a module ever makes SteamLite hard to use, press <kbd class="svelte-1eka9zm">Ctrl</kbd> <kbd class="svelte-1eka9zm">Alt</kbd> <kbd class="svelte-1eka9zm">Shift</kbd> <kbd class="svelte-1eka9zm">M</kbd> to switch every module off.<!></div>', 1), Hm = /* @__PURE__ */ h('<div class="skel" style="height:180px"></div>'), Rm = /* @__PURE__ */ h('<div class="card empty rise svelte-1eka9zm"><b> </b><button class="btn">Try again</button></div>'), $m = /* @__PURE__ */ h('<div class="card empty rise svelte-1eka9zm"><b>The gallery is empty</b><span class="muted">Be the first: make a module and submit it.</span></div>'), Fm = /* @__PURE__ */ h('<span class="pill use svelte-1eka9zm">Installed</span>'), Bm = /* @__PURE__ */ h('<span class="t svelte-1eka9zm"> </span>'), Gm = /* @__PURE__ */ h('<article class="mc svelte-1eka9zm"><!> <div class="meta svelte-1eka9zm"><b class="svelte-1eka9zm"> </b><!></div> <div class="muted sm svelte-1eka9zm"> </div> <div class="tags svelte-1eka9zm"><span> </span><!></div> <div class="acts svelte-1eka9zm"><button class="btn sm primary svelte-1eka9zm"> </button></div></article>'), Wm = /* @__PURE__ */ h('<div class="grid svelte-1eka9zm"></div> <div class="muted sm foot svelte-1eka9zm">Modules in the Gallery are made by people, so look at what a module changes before you use it. You can submit your own from My modules.</div>', 1), Ym = /* @__PURE__ */ h('<div class="back svelte-1eka9zm" role="presentation"><div class="dlg glass svelte-1eka9zm" role="dialog" tabindex="-1"><h2 class="svelte-1eka9zm">Add a module</h2> <p class="muted svelte-1eka9zm">Paste a link to a module on GitHub: a repository like <code class="svelte-1eka9zm">someone/their-module</code>, or the link to a Gist. SteamLite saves exactly what it downloads and never runs anything from it.</p> <div class="line svelte-1eka9zm"><input class="txt svelte-1eka9zm" placeholder="owner/repository or Gist link" aria-label="GitHub link"/><button class="btn primary"> </button></div> <div class="or svelte-1eka9zm"><span>or</span></div> <button class="btn"><!>Choose a file from your PC</button> <div class="row svelte-1eka9zm"><button class="btn">Close</button></div></div></div>'), Um = /* @__PURE__ */ h('<h2 class="svelte-1eka9zm"> </h2><p class="muted svelte-1eka9zm">Making a public Gist on your GitHub account.</p>', 1), Vm = /* @__PURE__ */ h('<h2 class="svelte-1eka9zm">Sign in to GitHub</h2><p class="muted svelte-1eka9zm">Open GitHub and type this code. SteamLite only asks to create and change Gists, nothing else on your account.</p> <div class="code svelte-1eka9zm"> </div><div class="row svelte-1eka9zm"><button class="btn">Cancel</button><button class="btn primary">Open GitHub</button></div><p class="muted sm svelte-1eka9zm">Waiting for you to approve it...</p>', 1), Km = /* @__PURE__ */ h('<h2 class="svelte-1eka9zm">Published</h2><p class="muted svelte-1eka9zm"> </p> <input class="txt svelte-1eka9zm" readonly="" aria-label="Gist link"/> <div class="row svelte-1eka9zm"><button class="btn">Submit to the gallery</button><button class="btn">View</button><button class="btn primary">Copy link</button></div><button class="btn">Done</button>', 1), Xm = /* @__PURE__ */ h('<h2 class="svelte-1eka9zm">That did not work</h2><p class="muted svelte-1eka9zm"> </p><div class="row svelte-1eka9zm"><button class="btn">Close</button></div>', 1), Jm = /* @__PURE__ */ h('<div class="back svelte-1eka9zm" role="presentation"><div class="dlg glass svelte-1eka9zm" role="dialog" tabindex="-1"><!></div></div>'), Zm = /* @__PURE__ */ h('<div class="back svelte-1eka9zm" role="presentation"><div class="dlg glass svelte-1eka9zm" role="alertdialog" tabindex="-1"><h2 class="svelte-1eka9zm"> </h2> <p class="muted svelte-1eka9zm">This module has its own CSS. It can change how anything in SteamLite looks, and it can hide or move things. It cannot run code, read your files, reach your Steam account or load anything from the internet, and anything unsafe in it is removed.</p> <p class="muted svelte-1eka9zm">If it makes SteamLite hard to use, press <kbd class="svelte-1eka9zm">Ctrl</kbd> <kbd class="svelte-1eka9zm">Alt</kbd> <kbd class="svelte-1eka9zm">Shift</kbd> <kbd class="svelte-1eka9zm">M</kbd> to switch modules off.</p> <div class="row svelte-1eka9zm"><button class="btn">Cancel</button><button class="btn primary">Use it</button></div></div></div>'), Qm = /* @__PURE__ */ h('<div class="page"><div class="phead"><div class="top rise svelte-1eka9zm" style="--i:0"><div class="grow"><div class="eyebrow">Customise</div><h1 class="title svelte-1eka9zm">Make SteamLite yours</h1><div class="muted">Pick a theme, or use a module to change colours, shapes, a logo, a background and what shows.</div></div> <button class="btn help svelte-1eka9zm" title="Play the tutorial"><!>Tutorial</button></div> <div class="bar rise svelte-1eka9zm" style="--i:1"><!></div></div> <!></div> <!> <!> <!> <!>', 1);
function eg(t, a) {
  Tt(a, !0);
  let s = /* @__PURE__ */ G(Ct(["mine", "gallery", "themes"].includes(c.ui.modTab) ? c.ui.modTab : "themes")), r = /* @__PURE__ */ G(Ct([])), i = /* @__PURE__ */ G(!0), o = /* @__PURE__ */ G(null), d = /* @__PURE__ */ G(Ct([])), f = /* @__PURE__ */ G(!c.ui.modTour), u = /* @__PURE__ */ G(null), m = /* @__PURE__ */ G(Ct({ signedIn: !1, login: "" })), p = 0, _ = /* @__PURE__ */ G(null), k = /* @__PURE__ */ G(""), b = /* @__PURE__ */ G(""), S = /* @__PURE__ */ G(null), E = /* @__PURE__ */ G(!1), z = /* @__PURE__ */ G(""), x;
  const A = [
    ["themes", "Themes"],
    ["mine", "My modules"],
    ["gallery", "Gallery"]
  ], j = /* @__PURE__ */ P(() => e(r).find((N) => N.active) || null), O = /* @__PURE__ */ P(() => !!c.mod), H = /* @__PURE__ */ P(() => Os(c.settings.theme) && c.settings.theme || "default"), I = (N) => (Ai.find((ae) => ae.id === N) || {}).name || "your theme";
  async function w(N, ae) {
    e(O) || await gr(N === "theme" ? "Applying " + I(ae) : "Updating your theme", async () => {
      await ve("settings:set", { [N]: ae }), c.settings = { ...c.settings, [N]: ae }, Dr();
    });
  }
  async function $() {
    await gr("Switching back to your theme", async () => {
      await hi(null), await B();
    });
  }
  async function B() {
    const N = await ve("modules:list").catch(() => null);
    N && (g(r, N.modules, !0), g(i, N.on, !0));
  }
  async function te() {
    g(o, null), g(o, await ve("modules:gallery").catch(() => ({ ok: !1, error: "The gallery could not be loaded." })), !0);
  }
  oa(async () => {
    ve("github:status").then((N) => N && g(m, N, !0)).catch(() => {
    }), await B(), ve("modules:updates").then((N) => g(d, N || [], !0)).catch(() => {
    }), e(s) === "gallery" && te();
  });
  function he() {
    g(f, !1), c.ui.modTour || or({ modTour: "1" });
  }
  function se(N) {
    g(s, N, !0), g(z, ""), or({ modTab: N }), N === "gallery" && !e(o) && te();
  }
  const de = (N) => e(r).some((ae) => ae.id === N), U = (N) => {
    e(z) && !N.target.closest(".mw") && g(z, "");
  };
  async function re(N) {
    if (N.hasCss && !N.active) {
      g(S, N, !0);
      return;
    }
    await ke(N);
  }
  async function ke(N) {
    g(S, null), await gr(N.active ? "Switching back to your theme" : "Applying " + N.name, async () => {
      await hi(N.active ? null : N.id), await B();
    });
  }
  async function F(N) {
    g(i, N, !0), await gr(N ? "Turning modules on" : "Turning modules off", async () => {
      await ve("settings:set", { modulesOn: N }), c.settings = { ...c.settings, modulesOn: N }, tr(N ? await ve("modules:active") : null), await B();
    });
  }
  async function ne(N, ae) {
    if (g(b, ""), !N || !N.ok) return yt(N && N.errors && N.errors[0] || "That did not work.", "bad");
    yt(ae + " installed."), g(E, !1), await B(), se("mine");
  }
  async function V(N, ae) {
    g(b, N, !0), ne(await ve("modules:installGallery", N).catch(() => null), ae);
  }
  async function ye() {
    if (!e(k).trim()) return;
    g(b, "repo");
    const N = await ve("modules:installRepo", e(k).trim()).catch(() => null);
    N && N.ok && g(k, ""), ne(N, "The module");
  }
  function Se(N) {
    const ae = N.currentTarget.files[0];
    if (!ae) return;
    if (ae.size > 8e6) return yt("That file is too large.", "bad");
    const ie = new FileReader();
    ie.onload = async () => {
      ne(await ve("modules:import", String(ie.result)).catch(() => null), "The module");
    }, ie.readAsText(ae), N.currentTarget.value = "";
  }
  async function Re(N) {
    g(z, ""), await ve("modules:remove", N.id), N.active && tr(null), await B(), yt("Removed " + N.name + ".");
  }
  async function $e(N) {
    g(z, "");
    const ae = await ve("modules:share", N.id).catch(() => null);
    yt(
      ae && ae.ok ? "Saved " + N.id + ".slmod in your Downloads folder." : "It could not be saved.",
      ae && ae.ok ? "" : "bad"
    );
  }
  async function Ye(N) {
    g(z, "");
    const ae = await ve("modules:submit", N.id).catch(() => null);
    yt(
      ae && ae.ok ? "Your Downloads folder and the GitHub page are open. Drag " + N.id + ".slmod into the issue." : "It could not be sent.",
      ae && ae.ok ? "" : "bad"
    );
  }
  async function ce(N) {
    if (g(z, ""), g(u, { m: N, step: "work", link: "", code: "", uri: "", err: "" }, !0), !e(m).signedIn) return q();
    await J();
  }
  async function J() {
    g(u, { ...e(u), step: "work", err: "" }, !0);
    const N = await ve("modules:publish", e(u).m.id).catch(() => null);
    if (N && N.needAuth)
      return g(m, { signedIn: !1, login: "" }, !0), q();
    if (N && N.ok) return g(u, { ...e(u), step: "done", link: N.url }, !0);
    g(
      u,
      {
        ...e(u),
        step: "err",
        err: N && N.error || "It could not be published."
      },
      !0
    );
  }
  async function q() {
    const N = await ve("github:start").catch(() => null);
    if (!N || !N.ok) return g(
      u,
      {
        ...e(u),
        step: "err",
        err: N && N.error || "GitHub could not be reached."
      },
      !0
    );
    g(u, { ...e(u), step: "code", code: N.code, uri: N.uri }, !0), clearInterval(p), p = setInterval(
      async () => {
        const ae = await ve("github:poll").catch(() => null);
        if (!e(u) || e(u).step !== "code") return clearInterval(p);
        ae && ae.done ? (clearInterval(p), g(m, { signedIn: !0, login: ae.login }, !0), J()) : ae && ae.error && (clearInterval(p), g(u, { ...e(u), step: "err", err: ae.error }, !0));
      },
      2e3
    );
  }
  function D() {
    clearInterval(p), ve("github:cancel"), g(u, null);
  }
  async function X() {
    try {
      await navigator.clipboard.writeText(e(u).link), yt("Link copied.");
    } catch {
      yt("Select the link and copy it.", "bad");
    }
  }
  async function fe() {
    await ve("github:signOut"), g(m, { signedIn: !1, login: "" }, !0), yt("Signed out of GitHub.");
  }
  async function Z() {
    const N = e(u).m, ae = e(u).link;
    await ve("modules:submit", N.id, ae), yt("The GitHub page is open. Your Gist link is in it.");
  }
  async function W(N) {
    g(b, N.id, !0);
    const ae = await ve("modules:installRepo", N.source.repo || N.source.gist).catch(() => null);
    g(d, e(d).filter((ie) => ie !== N.id), !0), N.active && tr(await ve("modules:active")), ne(ae, N.name + " updated");
  }
  async function ee(N) {
    if (g(_, null), await B(), N) {
      const ae = e(r).find((ie) => ie.id === N);
      ae && ae.active && await gr("Applying your changes", async () => tr(await ve("modules:active")));
    }
  }
  var pe = ta();
  xa("pointerdown", Ls, U), xa("keydown", Ls, (N) => N.key === "Escape" && g(z, ""));
  var R = we(pe);
  {
    var ge = (N) => {
      var ae = _m(), ie = l(ae);
      rm(ie, {
        get id() {
          return e(_);
        },
        onclose: ee
      }), v(N, ae);
    }, be = (N) => {
      var ae = Qm(), ie = we(ae), me = l(ie), Me = l(me), Ae = n(l(Me), 2), Ie = l(Ae);
      oe(Ie, { name: "play", size: 15 });
      var De = n(Me, 2), Ge = l(De);
      ar(Ge, {
        get options() {
          return A;
        },
        get value() {
          return e(s);
        },
        label: "Customise",
        onchange: se
      });
      var We = n(me, 2);
      {
        var Je = (Ke) => {
          var kt = ym(), Mt = we(kt);
          {
            var wt = (gt) => {
              var at = bm(), Qe = l(at);
              oe(Qe, { name: "lock", size: 20 });
              var mt = n(Qe), Xe = l(mt), ue = C(Xe), Ue = n(mt);
              L(() => T(ue, `${(c.mod.name || "A module") ?? ""} is replacing your theme`)), y("click", Ue, $), v(gt, at);
            };
            M(Mt, (gt) => {
              e(O) && gt(wt);
            });
          }
          var Ze = n(Mt, 2), st = l(Ze);
          {
            let gt = /* @__PURE__ */ P(() => c.settings.snow !== !1);
            gm(st, {
              get cur() {
                return e(H);
              },
              get snow() {
                return e(gt);
              },
              get locked() {
                return e(O);
              },
              onpick: (at) => w("theme", at),
              onsnow: (at) => w("snow", at)
            });
          }
          v(Ke, kt);
        }, vt = (Ke) => {
          var kt = jm(), Mt = we(kt), wt = l(Mt), Ze = l(wt);
          oe(Ze, { name: "plus", size: 16 });
          var st = n(wt, 2), gt = l(st);
          oe(gt, { name: "download", size: 16 });
          var at = n(st, 4), Qe = n(l(at));
          Ut(Qe, {
            get checked() {
              return e(i);
            },
            onchange: F
          });
          var mt = n(Mt, 2);
          _a(mt, (ze) => x = ze, () => x);
          var Xe = n(mt, 2);
          {
            var ue = (ze) => {
              var nt = wm(), pt = n(l(nt)), Le = l(pt), St = C(Le), Ft = n(Le), Nt = C(Ft), Vt = n(pt);
              L(() => {
                T(St, `Using ${e(j).name ?? ""}`), T(Nt, `It replaces your theme${e(j).base ? ", apart from the theme it includes" : ""}.`);
              }), y("click", Vt, () => ke(e(j))), v(ze, nt);
            };
            M(Xe, (ze) => {
              e(j) && ze(ue);
            });
          }
          var Ue = n(Xe, 2);
          {
            var et = (ze) => {
              var nt = km(), pt = l(nt);
              oe(pt, { name: "sliders", size: 28 });
              var Le = n(pt, 3), St = l(Le), Ft = n(St);
              y("click", St, () => g(_, "")), y("click", Ft, () => se("gallery")), v(ze, nt);
            }, Fe = (ze) => {
              var nt = Om();
              Ve(nt, 21, () => e(r), (pt) => pt.id, (pt, Le) => {
                var St = Nm();
                let Ft;
                var Nt = l(St);
                pi(Nt, {
                  get tokens() {
                    return e(Le).tokens;
                  }
                });
                var Vt = n(Nt, 2), K = l(Vt), Ce = C(K, !0), Pe = n(K);
                {
                  var qe = (Ee) => {
                    var ht = xm();
                    v(Ee, ht);
                  };
                  M(Pe, (Ee) => {
                    e(Le).active && Ee(qe);
                  });
                }
                var ot = n(Pe);
                {
                  var At = (Ee) => {
                    var ht = Sm();
                    v(Ee, ht);
                  }, It = /* @__PURE__ */ P(() => e(d).includes(e(Le).id));
                  M(ot, (Ee) => {
                    e(It) && Ee(At);
                  });
                }
                var ra = n(Vt, 2), Jt = C(ra, !0), Y = n(ra, 2), _e = l(Y), xt = C(_e, !0), Bt = n(_e);
                {
                  var Ot = (Ee) => {
                    var ht = Mm();
                    v(Ee, ht);
                  };
                  M(Bt, (Ee) => {
                    e(Le).hasCss && Ee(Ot);
                  });
                }
                var Gt = n(Bt);
                {
                  var Ht = (Ee) => {
                    var ht = Tm();
                    v(Ee, ht);
                  };
                  M(Gt, (Ee) => {
                    e(Le).layout && (e(Le).layout.sidebar || e(Le).layout.home) && Ee(Ht);
                  });
                }
                var Pt = n(Gt);
                {
                  var Yt = (Ee) => {
                    var ht = Lm();
                    v(Ee, ht);
                  };
                  M(Pt, (Ee) => {
                    e(Le).base && Ee(Yt);
                  });
                }
                var ea = n(Pt);
                {
                  var sa = (Ee) => {
                    var ht = zm();
                    v(Ee, ht);
                  };
                  M(ea, (Ee) => {
                    e(Le).hasLogo && Ee(sa);
                  });
                }
                var ba = n(ea);
                {
                  var Na = (Ee) => {
                    var ht = Cm();
                    v(Ee, ht);
                  };
                  M(ba, (Ee) => {
                    e(Le).hasBackground && Ee(Na);
                  });
                }
                var Ka = n(ba);
                {
                  var Es = (Ee) => {
                    var ht = Em();
                    v(Ee, ht);
                  };
                  M(Ka, (Ee) => {
                    e(Le).source && (e(Le).source.repo || e(Le).source.gist) && Ee(Es);
                  });
                }
                var pa = n(Y, 2), da = l(pa);
                {
                  var Ha = (Ee) => {
                    var ht = Am(), Xt = C(ht, !0);
                    L(() => {
                      ht.disabled = e(b) === e(Le).id, T(Xt, e(b) === e(Le).id ? "Updating..." : "Update");
                    }), y("click", ht, () => W(e(Le))), v(Ee, ht);
                  }, Xa = /* @__PURE__ */ P(() => e(d).includes(e(Le).id)), cr = (Ee) => {
                    var ht = Im();
                    let Xt;
                    var na = C(ht, !0);
                    L(() => {
                      Xt = je(ht, 1, "btn sm svelte-1eka9zm", null, Xt, { primary: !e(Le).active }), T(na, e(Le).active ? "Stop using" : "Use");
                    }), y("click", ht, () => re(e(Le))), v(Ee, ht);
                  };
                  M(da, (Ee) => {
                    e(Xa) ? Ee(Ha) : Ee(cr, -1);
                  });
                }
                var Ws = n(da, 2), dr = n(Ws, 2), Ja = l(dr), Nr = l(Ja);
                oe(Nr, { name: "more", size: 16 });
                var Or = n(Ja, 2);
                {
                  var Ne = (Ee) => {
                    var ht = Dm(), Xt = l(ht), na = l(Xt);
                    oe(na, { name: "ext", size: 16 });
                    var Zt = n(Xt, 2), aa = l(Zt);
                    oe(aa, { name: "download", size: 16 });
                    var fa = n(Zt, 2), Za = l(fa);
                    oe(Za, { name: "send", size: 16 });
                    var Ys = n(fa, 2);
                    {
                      var As = (jr) => {
                        var ur = Pm(), Hr = l(ur);
                        oe(Hr, { name: "check", size: 16 });
                        var Dn = n(Hr, 1, !0);
                        L(() => T(Dn, e(Le).active ? "Stop using" : "Use without updating")), y("click", ur, () => {
                          g(z, ""), re(e(Le));
                        }), v(jr, ur);
                      }, Pn = /* @__PURE__ */ P(() => e(d).includes(e(Le).id));
                      M(Ys, (jr) => {
                        e(Pn) && jr(As);
                      });
                    }
                    var qr = n(Ys, 4), ln = l(qr);
                    oe(ln, { name: "x", size: 16 }), y("click", Xt, () => ce(e(Le))), y("click", Zt, () => $e(e(Le))), y("click", fa, () => Ye(e(Le))), y("click", qr, () => Re(e(Le))), bt(3, ht, () => La, () => ({ y: -8, duration: 220, easing: ca })), v(Ee, ht);
                  };
                  M(Or, (Ee) => {
                    e(z) === e(Le).id && Ee(Ne);
                  });
                }
                L(() => {
                  Ft = je(St, 1, "mc svelte-1eka9zm", null, Ft, { on: e(Le).active, open: e(z) === e(Le).id }), T(Ce, e(Le).name), T(Jt, e(Le).description || "No description."), T(xt, e(Le).author ? "by " + e(Le).author : "v" + e(Le).version), Be(Ja, "aria-label", `More for ${e(Le).name ?? ""}`), Be(Ja, "aria-expanded", e(z) === e(Le).id);
                }), y("click", Ws, () => g(_, e(Le).id, !0)), y("click", Ja, () => g(z, e(z) === e(Le).id ? "" : e(Le).id, !0)), v(pt, St);
              }), zt(nt, (pt) => Kt?.(pt)), v(ze, nt);
            };
            M(Ue, (ze) => {
              e(r).length ? ze(Fe, -1) : ze(et);
            });
          }
          var ft = n(Ue, 2), rt = n(l(ft), 9);
          {
            var ct = (ze) => {
              var nt = qm(), pt = n(we(nt)), Le = C(pt, !0), St = n(pt, 2);
              L(() => T(Le, e(m).login || "you")), y("click", St, fe), v(ze, nt);
            };
            M(rt, (ze) => {
              e(m).signedIn && ze(ct);
            });
          }
          y("click", wt, () => g(_, "")), y("click", st, () => g(E, !0)), y("change", mt, Se), v(Ke, kt);
        }, Q = (Ke) => {
          var kt = ta(), Mt = we(kt);
          {
            var wt = (at) => {
              var Qe = Hm();
              v(at, Qe);
            }, Ze = (at) => {
              var Qe = Rm(), mt = l(Qe), Xe = C(mt, !0), ue = n(mt);
              L(() => T(Xe, e(o).error)), y("click", ue, te), v(at, Qe);
            }, st = (at) => {
              var Qe = $m();
              v(at, Qe);
            }, gt = (at) => {
              var Qe = Wm(), mt = we(Qe);
              Ve(mt, 21, () => e(o).modules, (Xe) => Xe.id, (Xe, ue) => {
                var Ue = Gm(), et = l(Ue);
                pi(et, {
                  get tokens() {
                    return e(ue).tokens;
                  }
                });
                var Fe = n(et, 2), ft = l(Fe), rt = C(ft, !0), ct = n(ft);
                {
                  var ze = (qe) => {
                    var ot = Fm();
                    v(qe, ot);
                  }, nt = /* @__PURE__ */ P(() => de(e(ue).id));
                  M(ct, (qe) => {
                    e(nt) && qe(ze);
                  });
                }
                var pt = n(Fe, 2), Le = C(pt, !0), St = n(pt, 2), Ft = l(St), Nt = C(Ft), Vt = n(Ft);
                Ve(Vt, 17, () => e(ue).tags, _t, (qe, ot) => {
                  var At = Bm(), It = C(At, !0);
                  L(() => T(It, e(ot))), v(qe, At);
                });
                var K = n(St, 2), Ce = l(K), Pe = C(Ce, !0);
                L(
                  (qe) => {
                    T(rt, e(ue).name), T(Le, e(ue).description), T(Nt, `by ${(e(ue).author || "someone") ?? ""}`), Ce.disabled = e(b) === e(ue).id, T(Pe, qe);
                  },
                  [
                    () => e(b) === e(ue).id ? "Installing..." : de(e(ue).id) ? "Reinstall" : "Install"
                  ]
                ), y("click", Ce, () => V(e(ue).id, e(ue).name)), v(Xe, Ue);
              }), zt(mt, (Xe) => Kt?.(Xe)), v(at, Qe);
            };
            M(Mt, (at) => {
              e(o) === null ? at(wt) : e(o).ok ? e(o).modules.length ? at(gt, -1) : at(st, 2) : at(Ze, 1);
            });
          }
          v(Ke, kt);
        };
        M(We, (Ke) => {
          e(s) === "themes" ? Ke(Je) : e(s) === "mine" ? Ke(vt, 1) : Ke(Q, -1);
        });
      }
      var xe = n(ie, 2);
      {
        var Te = (Ke) => {
          var kt = Ym(), Mt = l(kt), wt = n(l(Mt), 4), Ze = l(wt), st = n(Ze), gt = C(st, !0), at = n(wt, 4), Qe = l(at);
          oe(Qe, { name: "download", size: 16 });
          var mt = n(at, 2), Xe = C(mt);
          L(
            (ue) => {
              st.disabled = ue, T(gt, e(b) === "repo" ? "Installing..." : "Install");
            },
            [() => e(b) === "repo" || !e(k).trim()]
          ), y("click", kt, () => g(E, !1)), y("click", Mt, (ue) => ue.stopPropagation()), y("keydown", Mt, (ue) => ue.key === "Escape" && g(E, !1)), y("keydown", Ze, (ue) => ue.key === "Enter" && ye()), ia(Ze, () => e(k), (ue) => g(k, ue)), y("click", st, ye), y("click", at, () => x.click()), y("click", Xe, () => g(E, !1)), v(Ke, kt);
        };
        M(xe, (Ke) => {
          e(E) && Ke(Te);
        });
      }
      var tt = n(xe, 2);
      {
        var He = (Ke) => {
          vm(Ke, {
            onstep: (kt) => {
              kt !== e(s) && (g(s, kt, !0), kt === "gallery" && !e(o) && te());
            },
            onclose: he
          });
        };
        M(tt, (Ke) => {
          e(f) && Ke(He);
        });
      }
      var lt = n(tt, 2);
      {
        var ut = (Ke) => {
          var kt = Jm(), Mt = l(kt), wt = l(Mt);
          {
            var Ze = (Qe) => {
              var mt = Um(), Xe = we(mt), ue = C(Xe);
              L(() => T(ue, `Publishing ${e(u).m.name ?? ""}...`)), v(Qe, mt);
            }, st = (Qe) => {
              var mt = Vm(), Xe = n(we(mt), 3), ue = C(Xe, !0), Ue = n(Xe), et = l(Ue), Fe = n(et);
              L(() => T(ue, e(u).code)), y("click", et, D), y("click", Fe, () => ve("app:openUrl", e(u).uri)), v(Qe, mt);
            }, gt = (Qe) => {
              var mt = Km(), Xe = n(we(mt)), ue = C(Xe), Ue = n(Xe, 2), et = n(Ue, 2), Fe = l(et), ft = n(Fe), rt = n(ft), ct = n(et);
              L(() => {
                T(ue, `Anyone can install ${e(u).m.name ?? ""} by pasting this link into Add a module.`), ys(Ue, e(u).link);
              }), xa("focus", Ue, (ze) => ze.currentTarget.select()), y("click", Fe, Z), y("click", ft, () => ve("app:openUrl", e(u).link)), y("click", rt, X), y("click", ct, D), v(Qe, mt);
            }, at = (Qe) => {
              var mt = Xm(), Xe = n(we(mt)), ue = C(Xe, !0), Ue = n(Xe), et = C(Ue);
              L(() => T(ue, e(u).err)), y("click", et, D), v(Qe, mt);
            };
            M(wt, (Qe) => {
              e(u).step === "work" ? Qe(Ze) : e(u).step === "code" ? Qe(st, 1) : e(u).step === "done" ? Qe(gt, 2) : Qe(at, -1);
            });
          }
          y("click", kt, D), y("click", Mt, (Qe) => Qe.stopPropagation()), y("keydown", Mt, () => {
          }), v(Ke, kt);
        };
        M(lt, (Ke) => {
          e(u) && Ke(ut);
        });
      }
      var it = n(lt, 2);
      {
        var jt = (Ke) => {
          var kt = Zm(), Mt = l(kt), wt = l(Mt), Ze = C(wt), st = n(wt, 6), gt = l(st), at = n(gt);
          L(() => T(Ze, `Use ${e(S).name ?? ""}?`)), y("click", kt, () => g(S, null)), y("click", Mt, (Qe) => Qe.stopPropagation()), y("keydown", Mt, () => {
          }), y("click", gt, () => g(S, null)), y("click", at, () => ke(e(S))), v(Ke, kt);
        };
        M(it, (Ke) => {
          e(S) && Ke(jt);
        });
      }
      y("click", Ae, () => g(f, !0)), v(N, ae);
    };
    M(R, (N) => {
      e(_) !== null ? N(ge) : N(be, -1);
    });
  }
  v(t, pe), Lt();
}
Wt(["click", "change", "keydown"]);
var tg = /* @__PURE__ */ h('<div class="sk svelte-j642v9"></div>'), ag = /* @__PURE__ */ h('<div class="empty svelte-j642v9"><!><b class="svelte-j642v9">Your friends list is private</b><span class="muted svelte-j642v9">Set "Friends list" to Public in your Steam privacy settings, then press refresh.</span></div>'), sg = /* @__PURE__ */ h('<div class="empty svelte-j642v9"><!><b class="svelte-j642v9">No friends to show yet</b><span class="muted svelte-j642v9">Add friends on Steam and they appear here. You can also find a SteamLite player by their code below.</span></div>'), rg = /* @__PURE__ */ h('<img alt="" draggable="false" class="svelte-j642v9"/>'), hl = /* @__PURE__ */ h('<b class="svelte-j642v9"> </b>'), ng = /* @__PURE__ */ h('<span class="sl svelte-j642v9" title="Has a SteamLite profile">SL</span>'), ig = /* @__PURE__ */ h('<span class="dd svelte-j642v9" title="Shows a Discord name on their profile"><img src="/discord/symbol-white.svg" alt="" draggable="false" class="svelte-j642v9"/></span>'), lg = /* @__PURE__ */ h('<button class="fr svelte-j642v9"><span><!><i></i></span> <span class="nm svelte-j642v9"><span class="ellipsis svelte-j642v9"> </span><small> </small></span> <!><!></button>'), og = /* @__PURE__ */ h('<div class="gh svelte-j642v9"> <span class="svelte-j642v9"> </span></div> <!>', 1), vg = /* @__PURE__ */ h('<div class="empty svelte-j642v9"><span class="muted svelte-j642v9"> </span></div>'), cg = /* @__PURE__ */ h("<!> <!> <!> <!>", 1), dg = /* @__PURE__ */ h('<span class="mine svelte-j642v9" title="Your code"> </span>'), ug = /* @__PURE__ */ h('<img alt="" class="svelte-j642v9"/>'), fg = /* @__PURE__ */ h('<button class="fr res svelte-j642v9"><span class="av svelte-j642v9"><!></span><span class="nm svelte-j642v9"><span class="ellipsis svelte-j642v9"> </span><small class="svelte-j642v9">View profile</small></span></button>'), hg = /* @__PURE__ */ h('<div class="scrim svelte-j642v9" role="presentation"></div> <aside class="panel glass svelte-j642v9" aria-label="Friends"><header class="svelte-j642v9"><div class="grow svelte-j642v9"><h2 class="svelte-j642v9">Friends</h2><div class="muted svelte-j642v9"> </div></div> <button aria-label="Refresh"><!></button> <button class="ib svelte-j642v9" aria-label="Close friends"><!></button></header> <div class="search svelte-j642v9"><!><input placeholder="Search friends" aria-label="Search friends" class="svelte-j642v9"/></div> <div class="body svelte-j642v9"><!></div> <footer class="svelte-j642v9"><div class="ft svelte-j642v9">Find a SteamLite player by code<!></div> <div class="finder svelte-j642v9"><input placeholder="Friend code" aria-label="Friend code" class="svelte-j642v9"/><button class="btn sm svelte-j642v9">Find</button></div> <!></footer></aside>', 1);
function pg(t, a) {
  Tt(a, !0);
  let s = /* @__PURE__ */ G(null), r = /* @__PURE__ */ G(!1), i = /* @__PURE__ */ G(""), o = /* @__PURE__ */ G(Ct({})), d = /* @__PURE__ */ G(!1), f = /* @__PURE__ */ G(""), u = /* @__PURE__ */ G(null), m = /* @__PURE__ */ G(!1);
  const p = () => {
    c.friendsOpen = !1;
  };
  async function _(R = !1) {
    g(d, !0);
    const ge = await ve("friends:list", { force: R }).catch(() => null);
    if (g(d, !1), !ge) {
      g(s, [], !0);
      return;
    }
    g(r, !!ge.private), g(s, ge.friends || [], !0), e(s).length && ve("friends:badges", e(s).slice(0, 80).map((be) => be.steamid)).then((be) => {
      g(o, be || {}, !0);
    }).catch(() => {
    });
  }
  oa(() => {
    _();
    const R = setInterval(() => _(), 6e4);
    return () => clearInterval(R);
  });
  const k = /* @__PURE__ */ P(() => (e(s) || []).filter((R) => !e(i).trim() || R.name.toLowerCase().includes(e(i).trim().toLowerCase()))), b = /* @__PURE__ */ P(() => e(k).filter((R) => R.game)), S = /* @__PURE__ */ P(() => e(k).filter((R) => !R.game && R.state > 0)), E = /* @__PURE__ */ P(() => e(k).filter((R) => !R.game && R.state === 0)), z = [
    "Offline",
    "Online",
    "Busy",
    "Away",
    "Snoozing",
    "Online",
    "Online"
  ], x = (R) => R.game ? "Playing " + R.game : R.state > 0 ? z[R.state] : R.lastOff ? "Last online " + lr(R.lastOff * 1e3).toLowerCase() : "Offline", A = (R) => ((R || "?").trim()[0] || "?").toUpperCase();
  async function j() {
    const R = e(f).trim();
    if (!R) return;
    g(m, !0), g(u, null);
    const ge = await ve("friends:find", R).catch(() => null);
    if (g(m, !1), !ge || !ge.ok) return yt(ge && ge.error || "Could not search right now.", "bad");
    g(u, ge.found || [], !0), e(u).length || yt("No SteamLite player has that code.", "bad");
  }
  const O = (R) => ld(R.uid ? { uid: R.uid, name: R.name } : { steamid: R.steamid, name: R.name });
  var H = hg(), I = we(H);
  zt(I, (R, ge) => Gs?.(R, ge), () => p);
  var w = n(I, 2), $ = l(w), B = l($), te = n(l(B)), he = C(te, !0), se = n(B, 2);
  let de;
  var U = l(se);
  oe(U, { name: "refresh", size: 17 });
  var re = n(se, 2), ke = l(re);
  oe(ke, { name: "x", size: 17 });
  var F = n($, 2), ne = l(F);
  oe(ne, { name: "search", size: 16 });
  var V = n(ne), ye = n(F, 2), Se = l(ye);
  {
    var Re = (R) => {
      var ge = ta(), be = we(ge);
      Ve(be, 16, () => Array(6), _t, (N, ae) => {
        var ie = tg();
        v(N, ie);
      }), v(R, ge);
    }, $e = (R) => {
      var ge = ag(), be = l(ge);
      oe(be, { name: "eye", size: 26 }), v(R, ge);
    }, Ye = (R) => {
      var ge = sg(), be = l(ge);
      oe(be, { name: "user", size: 26 }), v(R, ge);
    }, ce = (R) => {
      const ge = (Ae, Ie = es, De = es) => {
        var Ge = ta(), We = we(Ge);
        {
          var Je = (vt) => {
            var Q = og(), xe = we(Q), Te = l(xe), tt = n(Te), He = C(tt, !0), lt = n(xe, 2);
            Ve(lt, 19, De, (ut) => ut.steamid, (ut, it, jt) => {
              var Ke = lg(), kt = l(Ke);
              let Mt;
              var wt = l(kt);
              {
                var Ze = (ze) => {
                  var nt = rg();
                  L(() => Be(nt, "src", e(it).avatar)), v(ze, nt);
                }, st = (ze) => {
                  var nt = hl(), pt = C(nt, !0);
                  L((Le) => T(pt, Le), [() => A(e(it).name)]), v(ze, nt);
                };
                M(wt, (ze) => {
                  e(it).avatar ? ze(Ze) : ze(st, -1);
                });
              }
              var gt = n(wt);
              let at;
              var Qe = n(kt, 2), mt = l(Qe), Xe = C(mt, !0), ue = n(mt);
              let Ue;
              var et = C(ue, !0), Fe = n(Qe, 2);
              {
                var ft = (ze) => {
                  var nt = ng();
                  v(ze, nt);
                };
                M(Fe, (ze) => {
                  e(o)[e(it).steamid] && ze(ft);
                });
              }
              var rt = n(Fe);
              {
                var ct = (ze) => {
                  var nt = ig();
                  v(ze, nt);
                };
                M(rt, (ze) => {
                  e(o)[e(it).steamid] === 2 && ze(ct);
                });
              }
              L(
                (ze, nt) => {
                  dt(Ke, `--i:${ze ?? ""}`), Mt = je(kt, 1, "av svelte-j642v9", null, Mt, { off: !e(it).game && e(it).state === 0 }), at = je(gt, 1, "st svelte-j642v9", null, at, {
                    on: e(it).state > 0 || e(it).game,
                    play: !!e(it).game
                  }), T(Xe, e(it).name), Ue = je(ue, 1, "ellipsis svelte-j642v9", null, Ue, { g: !!e(it).game }), T(et, nt);
                },
                [() => Math.min(e(jt), 10), () => x(e(it))]
              ), y("click", Ke, () => O(e(it))), v(ut, Ke);
            }), L(() => {
              T(Te, `${Ie() ?? ""} `), T(He, De().length);
            }), v(vt, Q);
          };
          M(We, (vt) => {
            De().length && vt(Je);
          });
        }
        v(Ae, Ge);
      };
      var be = cg(), N = we(be);
      ge(N, () => "Playing", () => e(b));
      var ae = n(N, 2);
      ge(ae, () => "Online", () => e(S));
      var ie = n(ae, 2);
      ge(ie, () => "Offline", () => e(E));
      var me = n(ie, 2);
      {
        var Me = (Ae) => {
          var Ie = vg(), De = l(Ie), Ge = C(De);
          L(() => T(Ge, `No friend called "${e(i) ?? ""}".`)), v(Ae, Ie);
        };
        M(me, (Ae) => {
          e(i) && !e(k).length && Ae(Me);
        });
      }
      v(R, be);
    };
    M(Se, (R) => {
      e(s) === null ? R(Re) : e(r) ? R($e, 1) : e(s).length ? R(ce, -1) : R(Ye, 2);
    });
  }
  var J = n(ye, 2), q = l(J), D = n(l(q));
  {
    var X = (R) => {
      var ge = dg(), be = C(ge);
      L(() => T(be, `Yours: ${c.me.code ?? ""}`)), v(R, ge);
    };
    M(D, (R) => {
      c.me && c.me.code && R(X);
    });
  }
  var fe = n(q, 2), Z = l(fe), W = n(Z), ee = n(fe, 2);
  {
    var pe = (R) => {
      var ge = ta(), be = we(ge);
      Ve(be, 17, () => e(u), _t, (N, ae) => {
        var ie = fg(), me = l(ie), Me = l(me);
        {
          var Ae = (Je) => {
            var vt = ug();
            L(() => Be(vt, "src", e(ae).avatar)), v(Je, vt);
          }, Ie = (Je) => {
            var vt = hl(), Q = C(vt, !0);
            L((xe) => T(Q, xe), [() => A(e(ae).name)]), v(Je, vt);
          };
          M(Me, (Je) => {
            e(ae).avatar ? Je(Ae) : Je(Ie, -1);
          });
        }
        var De = n(me), Ge = l(De), We = C(Ge, !0);
        L(() => T(We, e(ae).name)), y("click", ie, () => O(e(ae))), v(N, ie);
      }), v(R, ge);
    };
    M(ee, (R) => {
      e(u) && e(u).length && R(pe);
    });
  }
  L(
    (R, ge) => {
      T(he, R), de = je(se, 1, "ib svelte-j642v9", null, de, { spin: e(d) }), W.disabled = ge;
    },
    [
      () => e(s) ? e(s).filter((R) => R.state > 0 || R.game).length + " online, " + e(s).length + " in all" : "Loading",
      () => e(m) || !e(f).trim()
    ]
  ), y("click", I, p), bt(3, I, () => ha, () => ({ duration: 160 })), y("click", se, () => _(!0)), y("click", re, p), ia(V, () => e(i), (R) => g(i, R)), y("keydown", Z, (R) => R.key === "Enter" && j()), ia(Z, () => e(f), (R) => g(f, R)), y("click", W, j), bt(3, w, () => La, () => ({ x: 380, duration: 420, easing: ca, opacity: 1 })), v(t, H), Lt();
}
Wt(["click", "keydown"]);
var mg = /* @__PURE__ */ h('<img alt="" class="svelte-10k5u26"/>'), gg = /* @__PURE__ */ h("<b> </b>"), _g = /* @__PURE__ */ h('<div class="back svelte-10k5u26" role="presentation"><div class="dlg glass svelte-10k5u26" role="dialog" tabindex="-1" aria-label="Set up your SteamLite profile"><div class="top svelte-10k5u26"><span class="av svelte-10k5u26"><!></span> <span class="link svelte-10k5u26"><!></span> <span class="steam svelte-10k5u26"><!></span></div> <h2 class="svelte-10k5u26">Your SteamLite account is ready</h2> <p class="muted svelte-10k5u26">You signed in with Steam, so your SteamLite account is linked to <b> </b>. SteamLite never sees your Steam password.</p> <p class="muted svelte-10k5u26">Your SteamLite profile is what other SteamLite players see: your picture, banner, tagline and top games. You can change any of it, and hide the parts you would rather keep to yourself.</p> <div class="opts svelte-10k5u26" role="radiogroup" aria-label="Who can see your profile"><button role="radio"><span class="rd svelte-10k5u26"></span><span><b class="svelte-10k5u26">Share my profile</b><small class="svelte-10k5u26">Other SteamLite players can see it, and you can see theirs.</small></span></button> <button role="radio"><span class="rd svelte-10k5u26"></span><span><b class="svelte-10k5u26">Keep it private for now</b><small class="svelte-10k5u26">Nothing is sent anywhere. You can change this later in Settings.</small></span></button></div> <div class="row svelte-10k5u26"><button class="btn">Continue</button><button class="btn primary"><!>Customise my profile</button></div></div></div>');
function bg(t, a) {
  Tt(a, !0);
  let s = /* @__PURE__ */ G(!0), r = /* @__PURE__ */ G(!1);
  const i = /* @__PURE__ */ P(() => ga.profiles.find((U) => U.steamId === ga.activeId) || ga.profiles[0]), o = /* @__PURE__ */ P(() => c.me && c.me.name || e(i) && e(i).name || "your Steam account");
  async function d(U) {
    g(r, !0), await ve("online:share", { on: e(s) }).catch(() => {
    }), await nr(), g(r, !1), c.onboard = !1, U && (Da("profile"), c.editOpen = !0);
  }
  var f = _g(), u = l(f), m = l(u), p = l(m), _ = l(p);
  {
    var k = (U) => {
      var re = mg();
      L(() => Be(re, "src", c.look && c.look.avatarImage || e(i).avatar)), v(U, re);
    }, b = (U) => {
      var re = gg(), ke = C(re, !0);
      L((F) => T(ke, F), [() => (e(o) || "?")[0].toUpperCase()]), v(U, re);
    };
    M(_, (U) => {
      c.look && c.look.avatarImage || e(i) && e(i).avatar ? U(k) : U(b, -1);
    });
  }
  var S = n(p, 2), E = l(S);
  oe(E, { name: "check", size: 15, stroke: 3 });
  var z = n(S, 2), x = l(z);
  oe(x, { name: "user", size: 22 });
  var A = n(m, 4), j = n(l(A)), O = C(j, !0), H = n(A, 4), I = l(H);
  let w;
  var $ = n(I, 2);
  let B;
  var te = n(H, 2), he = l(te), se = n(he), de = l(se);
  oe(de, { name: "pencil", size: 16 }), L(() => {
    T(O, e(o)), w = je(I, 1, "opt svelte-10k5u26", null, w, { on: e(s) }), Be(I, "aria-checked", e(s)), B = je($, 1, "opt svelte-10k5u26", null, B, { on: !e(s) }), Be($, "aria-checked", !e(s)), he.disabled = e(r), se.disabled = e(r);
  }), y("click", I, () => g(s, !0)), y("click", $, () => g(s, !1)), y("click", he, () => d(!1)), y("click", se, () => d(!0)), bt(1, u, () => Bs, () => ({ start: 0.92, duration: 420, easing: ca })), bt(3, f, () => ha, () => ({ duration: 220 })), v(t, f), Lt();
}
Wt(["click"]);
var yg = /* @__PURE__ */ h("It will not be available after <b> </b>.<!>", 1), wg = /* @__PURE__ */ h("You are using it now. After <b> </b> it is locked, and SteamLite goes back to the default look.", 1), kg = /* @__PURE__ */ h("It is only available for a short time, until <b> </b>. After that it is locked. You can still pick it until then.", 1), xg = /* @__PURE__ */ h('<div class="back svelte-nn16jf" role="presentation"><div class="dlg glass svelte-nn16jf" role="alertdialog" tabindex="-1" aria-label="A theme is ending soon"><span class="ic svelte-nn16jf"><!></span> <h2 class="svelte-nn16jf"><!></h2> <p class="muted svelte-nn16jf"><!></p> <div class="row svelte-nn16jf"><button class="btn">Got it</button><button class="btn primary">Open themes</button></div></div></div>');
function Sg(t, a) {
  Tt(a, !0);
  const s = /* @__PURE__ */ P(() => c.settings.theme === a.t.id), r = /* @__PURE__ */ P(() => a.t.daysLeft <= 0 ? "today" : a.t.daysLeft === 1 ? "tomorrow" : "in " + a.t.daysLeft + " days"), i = /* @__PURE__ */ P(() => !!a.t.everyLaunch);
  function o(I) {
    if (a.t.everyLaunch) {
      c.themeNotice = null, I === !0 && Da("settings");
      return;
    }
    const w = String(c.ui.themeNotice || "").split(",").filter(Boolean);
    w.includes(a.t.id) || w.push(a.t.id), or({ themeNotice: w.join(",") }), c.themeNotice = null, I === !0 && Da("settings");
  }
  var d = xg(), f = l(d), u = l(f), m = l(u);
  oe(m, { name: "clock", size: 22 });
  var p = n(u, 2), _ = l(p);
  {
    var k = (I) => {
      var w = za();
      L(() => T(w, `The ${a.t.name ?? ""} theme is ending early`)), v(I, w);
    }, b = (I) => {
      var w = za();
      L(() => T(w, `The ${a.t.name ?? ""} theme ends ${e(r) ?? ""}`)), v(I, w);
    };
    M(_, (I) => {
      e(i) ? I(k) : I(b, -1);
    });
  }
  var S = n(p, 2), E = l(S);
  {
    var z = (I) => {
      var w = yg(), $ = n(we(w)), B = C($, !0), te = n($, 2);
      {
        var he = (de) => {
          var U = za();
          U.nodeValue = " You are using it now, and after that SteamLite goes back to the default look.", v(de, U);
        }, se = (de) => {
          var U = za();
          U.nodeValue = " You can still pick it until then.", v(de, U);
        };
        M(te, (de) => {
          e(s) ? de(he) : de(se, -1);
        });
      }
      L(() => T(B, a.t.endText)), v(I, w);
    }, x = (I) => {
      var w = wg(), $ = n(we(w)), B = C($, !0);
      L(() => T(B, a.t.endText)), v(I, w);
    }, A = (I) => {
      var w = kg(), $ = n(we(w)), B = C($, !0);
      L(() => T(B, a.t.endText)), v(I, w);
    };
    M(E, (I) => {
      e(i) ? I(z) : e(s) ? I(x, 1) : I(A, -1);
    });
  }
  var j = n(S, 2), O = l(j), H = n(O);
  zt(d, (I, w) => Gs?.(I, w), () => () => o()), y("click", d, () => o()), y("click", f, (I) => I.stopPropagation()), y("keydown", f, () => {
  }), y("click", O, () => o()), y("click", H, () => o(!0)), bt(1, f, () => Bs, () => ({ start: 0.92, duration: 420, easing: ca })), bt(3, d, () => ha, () => ({ duration: 220 })), v(t, d), Lt();
}
Wt(["click", "keydown"]);
var Mg = /* @__PURE__ */ h('<canvas aria-hidden="true" class="svelte-1m6ne07"></canvas>');
function Tg(t, a) {
  Tt(a, !0);
  let s = /* @__PURE__ */ G(void 0), r = 0, i = [], o = 0, d = 0, f = 0;
  const u = () => matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "reduced", m = () => document.hidden || document.documentElement.dataset.gaming === "1";
  function p() {
    const S = window.devicePixelRatio > 1.5 ? 1.5 : 1;
    o = innerWidth, d = innerHeight, e(s).width = o * S, e(s).height = d * S, e(s).getContext("2d").setTransform(S, 0, 0, S, 0, 0);
    const E = Math.round(Math.min(150, Math.max(50, o * d / 11e3)) * (document.documentElement.dataset.lite === "1" ? 0.5 : 1));
    for (; i.length < E; ) i.push(_(!0));
    i.length = E;
  }
  const _ = (S) => ({
    x: Math.random() * o,
    y: S ? Math.random() * d : -10,
    r: 1 + Math.random() * 2.6,
    v: 22 + Math.random() * 38,
    sw: Math.random() * 6.28,
    sp: 0.4 + Math.random() * 0.9,
    a: 0.45 + Math.random() * 0.5
  });
  function k(S) {
    r = requestAnimationFrame(k);
    const E = Math.min(0.05, (S - f) / 1e3);
    f = S;
    const z = e(s).getContext("2d");
    if (z.clearRect(0, 0, o, d), !m())
      for (const x of i) {
        x.y += x.v * E, x.sw += x.sp * E;
        const A = x.x + Math.sin(x.sw) * 14 * x.r * 0.5;
        x.y > d + 6 && Object.assign(x, _(!1), { x: Math.random() * o }), z.globalAlpha = x.a, z.fillStyle = "#fff", z.beginPath(), z.arc(A, x.y, x.r, 0, 6.2832), z.fill();
      }
  }
  oa(() => {
    if (p(), window.addEventListener("resize", p), u()) {
      const S = e(
        s
        // motion reduced: a still scatter of snow
      ).getContext("2d");
      for (const E of i)
        S.globalAlpha = E.a, S.fillStyle = "#fff", S.beginPath(), S.arc(E.x, E.y, E.r, 0, 6.2832), S.fill();
    } else
      f = performance.now(), r = requestAnimationFrame(k);
    return () => {
      cancelAnimationFrame(r), window.removeEventListener("resize", p);
    };
  });
  var b = Mg();
  _a(b, (S) => g(s, S), () => e(s)), v(t, b), Lt();
}
var Lg = /* @__PURE__ */ h('<span class="ln svelte-1l04y"> </span>'), zg = /* @__PURE__ */ h('<span class="tm svelte-1l04y"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7.5 7h9A5.5 5.5 0 0122 12.5v1a4.5 4.5 0 01-7.9 3l-.9-1h-2.4l-.9 1a4.5 4.5 0 01-7.9-3v-1A5.5 5.5 0 017.5 7zm.5 2.5H7v1.5H5.5V12H7v1.5h1V12h1.5v-1H8zm8.5.5a1 1 0 100 2 1 1 0 000-2zm2 2a1 1 0 100 2 1 1 0 000-2z"></path></svg> </span>'), Cg = /* @__PURE__ */ h('<span class="b svelte-1l04y"> </span>'), Eg = /* @__PURE__ */ h('<div class="bt svelte-1l04y"></div>'), Ag = /* @__PURE__ */ h('<div class="dc svelte-1l04y" role="img" aria-label="A preview of your Discord profile"><div class="hd svelte-1l04y">Playing</div> <div class="row svelte-1l04y"><div class="big svelte-1l04y"><img alt="" class="svelte-1l04y"/><img class="small svelte-1l04y" alt=""/><!></div> <div class="tx svelte-1l04y"><b class="nm svelte-1l04y"> </b> <span class="ln svelte-1l04y"> </span> <!> <!></div></div> <!></div>'), Ig = /* @__PURE__ */ h('<div class="none svelte-1l04y">Nothing shows on Discord here. This part is switched off.</div>');
function Pg(t, a) {
  Tt(a, !0);
  let s = /* @__PURE__ */ G(Ct(Date.now())), r = /* @__PURE__ */ G(0);
  oa(() => {
    const S = setInterval(() => g(s, Date.now(), !0), 1e3), E = setInterval(() => si(r), 4e3);
    return () => {
      clearInterval(S), clearInterval(E);
    };
  });
  const i = /* @__PURE__ */ P(() => a.p && a.p.card), o = /* @__PURE__ */ P(() => a.p && a.p.states || []), d = /* @__PURE__ */ P(() => e(o).length ? e(o)[e(r) % e(o).length] : e(i) && e(i).state || ""), f = (S) => {
    const E = Math.max(0, Math.floor(S / 1e3)), z = Math.floor(E / 3600), x = Math.floor(E % 3600 / 60);
    return (z ? z + ":" + String(x).padStart(2, "0") : String(x).padStart(2, "0")) + ":" + String(E % 60).padStart(2, "0");
  }, u = (S) => /raw\.githubusercontent\.com\/.*icon\.png$/.test(S || "") ? "/icon.png" : S, m = /* @__PURE__ */ P(() => e(i) && e(i).timestamps ? f(e(s) - e(i).timestamps.start) : "");
  var p = ta(), _ = we(p);
  {
    var k = (S) => {
      var E = Ag(), z = n(l(E), 2), x = l(z), A = l(x), j = n(A), O = n(j);
      {
        var H = (F) => {
        };
        M(O, (F) => {
          e(i).assets.small_image || F(H);
        });
      }
      var I = n(x, 2), w = l(I), $ = C(w, !0), B = n(w, 2), te = C(B, !0), he = n(B, 2);
      {
        var se = (F) => {
          var ne = Lg(), V = C(ne, !0);
          L(() => T(V, e(d))), v(F, ne);
        };
        M(he, (F) => {
          e(d) && F(se);
        });
      }
      var de = n(he, 2);
      {
        var U = (F) => {
          var ne = zg(), V = n(l(ne), 1, !0);
          L(() => T(V, e(m))), v(F, ne);
        };
        M(de, (F) => {
          e(m) && F(U);
        });
      }
      var re = n(z, 2);
      {
        var ke = (F) => {
          var ne = Eg();
          Ve(ne, 21, () => e(i).buttons, _t, (V, ye) => {
            var Se = Cg(), Re = C(Se, !0);
            L(() => T(Re, e(ye).label)), v(V, Se);
          }), v(F, ne);
        };
        M(re, (F) => {
          e(i).buttons && e(i).buttons.length && F(ke);
        });
      }
      L(
        (F, ne) => {
          Be(A, "src", F), Be(j, "src", ne), T($, a.p.appName), T(te, e(i).details);
        },
        [
          () => u(e(i).assets.large_image),
          () => u(e(i).assets.small_image) || "/icon.png"
        ]
      ), xa("error", j, (F) => F.currentTarget.style.display = "none"), v(S, E);
    }, b = (S) => {
      var E = Ig();
      v(S, E);
    };
    M(_, (S) => {
      e(i) ? S(k) : S(b, -1);
    });
  }
  v(t, p), Lt();
}
var Dg = /* @__PURE__ */ h('<button class="btn"><!> </button>'), Ng = /* @__PURE__ */ h('<button class="btn sm">Take the tour</button>'), Og = /* @__PURE__ */ h('<!><!><button class="btn sm">Remove</button>', 1), qg = /* @__PURE__ */ h('<div class="row opt svelte-1xc311x"><div class="grow"><b>Sound volume</b><div class="muted">How loud the navigation sounds are.</div></div><!></div>'), jg = /* @__PURE__ */ h('<div class="row opt svelte-1xc311x"><div class="grow"><b>Show game names</b><div class="muted">Off shows only "Playing a game", with no name, art or Steam link.</div></div><!></div> <div class="row opt svelte-1xc311x"><div class="grow"><b>Show my stats</b><div class="muted">Achievements, play time, streak and ranking in the second line.</div></div><!></div> <div class="row opt svelte-1xc311x"><div class="grow"><b>Show it while I browse</b><div class="muted">Shows the page you are on and your library numbers when no game is running.</div></div><!></div> <div class="row opt svelte-1xc311x"><div class="grow"><b>Buttons</b><div class="muted">"View on Steam" and "Get SteamLite" under your status.</div></div><!></div>', 1), Hg = /* @__PURE__ */ h("<div><!></div>"), Rg = /* @__PURE__ */ h('<button class="btn" disabled="">Please wait</button>'), $g = /* @__PURE__ */ h('<div class="two svelte-1xc311x"><button class="btn">Cancel</button><button class="btn primary">Go back</button></div>'), Fg = /* @__PURE__ */ h('<button class="btn"><!>Go back to stable</button>'), Bg = /* @__PURE__ */ h('<div class="row opt svelte-1xc311x"><div class="grow"><b>Go back to stable</b><div class="muted"><!></div></div> <!></div>'), Gg = /* @__PURE__ */ h('<div class="savebar svelte-1xc311x" role="status"><span class="msg svelte-1xc311x">Careful, you have unsaved changes!</span> <button class="save svelte-1xc311x">Save</button></div>'), Wg = /* @__PURE__ */ h(`<div class="page mid"><div class="phead"><div class="hd rise svelte-1xc311x" style="--i:0"><h1 class="title">Settings</h1><p class="sub">SteamLite <!></p></div></div> <div class="sech rise" style="--i:1"><h2>Account</h2></div> <div class="card list rise svelte-1xc311x" style="--i:2"><div class="row opt svelte-1xc311x"><div class="grow"><b>Your accounts, profile and linked services</b><div class="muted">Steam accounts, who can see your profile, Discord and GitHub are all on the Account page now.</div></div><button class="btn"><!>Open Account</button></div></div> <div class="sech rise" style="--i:3"><h2>General</h2></div> <div class="card list rise svelte-1xc311x" style="--i:4"><div class="row opt svelte-1xc311x"><div class="grow"><b>Start with Windows</b><div class="muted">Open SteamLite when you sign in to your PC.</div></div><!></div> <div class="row opt svelte-1xc311x"><div class="grow"><b>Start minimised</b><div class="muted">When Windows starts SteamLite for you, it waits in the tray instead of opening a window. Needs Start with Windows.</div></div><!></div> <div class="row opt svelte-1xc311x"><div class="grow"><b>Close to the tray</b><div class="muted">The close button hides SteamLite to the tray instead of quitting, so play time keeps counting. Right-click the tray icon for your recent games.</div></div><!></div> <div class="row opt svelte-1xc311x"><div class="grow"><b>Show in Island</b><div class="muted">If the separate Island app is running, SteamLite shows the game you are playing (with a Stop button), how long your session was, and update progress in its pill at the top of your screen.</div></div><!></div> <div class="row opt svelte-1xc311x"><div class="grow"><b>Open on</b><div class="muted">The page SteamLite shows when it starts.</div></div><!></div> <div class="row opt svelte-1xc311x"><div class="grow"><b>Show the opening screen</b><div class="muted">The short logo screen when SteamLite starts.</div></div><!></div> <div class="row opt svelte-1xc311x"><div class="grow"><b>Show what changed after an update</b><div class="muted">The first time SteamLite opens after an update, it shows the release notes.</div></div><!></div> <div class="row opt svelte-1xc311x"><div class="grow"><b>Ask before closing during a game</b><div class="muted">Closing SteamLite stops counting your play time, so it checks first.</div></div><!></div></div> <div class="sech rise" style="--i:4"><h2>Themes</h2></div> <div class="card list rise svelte-1xc311x" style="--i:4"><div class="row opt svelte-1xc311x"><div class="grow"><b>Themes have moved</b><div class="muted">Pick a theme, and make your own look, in Customise.</div></div><button class="btn"><!>Open Customise</button></div></div> <div class="sech rise" style="--i:5"><h2>Appearance</h2></div> <div class="card list rise svelte-1xc311x" style="--i:6"><div class="row opt svelte-1xc311x"><div class="grow"><b>Colours from the game's art</b><div class="muted">The accent colour follows the game you are looking at. Off keeps the standard steel grey.</div></div><!></div> <div class="row opt svelte-1xc311x"><div class="grow"><b>Animated background</b><div class="muted">The slowly moving glow behind the app.</div></div><!></div> <div class="row opt svelte-1xc311x"><div class="grow"><b>Lighter animations during a game</b><div class="muted">While a game is running, looping animations stop and the blur behind panels is switched off, so SteamLite uses less of your GPU.</div></div><!></div> <div class="row opt svelte-1xc311x"><div class="grow"><b>Pause SteamLite while you play</b><div class="muted">While a game is running and SteamLite is in the background, its window is paused completely: it draws nothing and uses almost no CPU, GPU or memory. It wakes up the moment you open it.</div></div><!></div> <div class="row opt svelte-1xc311x"><div class="grow"><b>Simpler graphics</b><div class="muted">Turns off blur and large soft shadows. This makes SteamLite smoother on older PCs, virtual machines and Linux. It is on by default on Linux.</div></div><!></div> <div class="row opt svelte-1xc311x"><div class="grow"><b>Reduce motion</b><div class="muted">Turns off most animations. SteamLite also follows the Windows setting.</div></div><!></div> <div class="row opt svelte-1xc311x"><div class="grow"><b>Preview the 27.1 UI</b><div class="muted">A first look at the next interface: a floating dock, fluid springy animations and stretchy scrolling. It downloads from GitHub<!>, and the normal interface is untouched. If it ever misbehaves, press <b>Ctrl + Alt + Shift + U</b> to go back. <!></div></div> <!></div></div> <div class="sech rise" style="--i:7"><h2>Library and notifications</h2></div> <div class="card list rise svelte-1xc311x" style="--i:8"><div class="row opt svelte-1xc311x"><div class="grow"><b>Sort the library by</b><div class="muted">How games are ordered when you open the library.</div></div><!></div> <div class="row opt svelte-1xc311x"><div class="grow"><b>Smart library</b><div class="muted">Keeps only games in your library. Apps from Steam that are not games, like Wallpaper Engine and other software, are left out. SteamLite asks Steam's store what each app is the first time, so it can take a moment, and it needs a connection for that.</div></div><!></div> <div class="row opt svelte-1xc311x"><div class="grow"><b>Show everything in the library</b><div class="muted">SteamLite hides soundtracks, demos, playtests, benchmarks, servers and tools by default. Turn this on to see them too.</div></div><!></div> <div class="row opt svelte-1xc311x"><div class="grow"><b>Navigation sounds</b><div class="muted">Short, soft sounds when you change page, press a button, or something is saved or goes wrong. They stay quiet while a game is running.</div></div><!></div> <!> <div class="row opt svelte-1xc311x"><div class="grow"><b>Tell me when I stop playing</b><div class="muted">A Windows notification with how long you played.</div></div><!></div></div> <div class="sech rise" style="--i:8"><h2 class="dh svelte-1xc311x"><img class="dlogo svelte-1xc311x" src="/discord/logo-white.svg" alt="Discord" draggable="false"/></h2></div> <div class="card list rise svelte-1xc311x" style="--i:9"><div class="row opt svelte-1xc311x"><div class="grow"><b>Show what I am doing on Discord</b><div class="muted">Your Discord profile shows the game you are playing, with its art and a live timer, and rotates through real numbers from your library: achievements (and what you unlocked this session), total and weekly play time, your day streak and where the game ranks. It needs the Discord app open on this PC.</div></div><!></div> <!> <div class="dprev svelte-1xc311x"><div class="dph svelte-1xc311x"><div class="grow"><b>Preview</b><div class="muted">This is how it looks on your Discord profile. It follows the switches above.<!></div></div><!></div><!></div> <div class="row opt svelte-1xc311x"><div class="grow"><b>Join the SteamLite Discord</b><div class="muted">Ask for help, share an idea or just say hello in the SteamLite community server.</div></div><button class="btn discord svelte-1xc311x"><img src="/discord/symbol-white.svg" alt="" draggable="false" class="svelte-1xc311x"/>Join</button></div></div> <div class="sech rise" style="--i:10"><h2>Updates</h2></div> <div class="card list rise svelte-1xc311x" style="--i:10"><div class="row opt svelte-1xc311x"><div class="grow"><b>Check for updates automatically</b><div class="muted">SteamLite looks for a new version when it starts.</div></div><!></div> <div class="row opt chan svelte-1xc311x"><div class="grow"><b>Update channel</b><div class="muted">Choose which updates SteamLite offers you.</div></div> <div class="seg2 svelte-1xc311x" role="radiogroup" aria-label="Update channel"><div class="ind svelte-1xc311x"></div> <button role="radio">Beta</button> <button role="radio">Stable</button></div></div> <!> <div class="notice svelte-1xc311x"><!><div><b>SteamLite 26.11 is out as the stable version.</b><div class="muted svelte-1xc311x">If you are on the Beta channel you can stay there. Beta gets new features first, so you can test them before the stable release gets them. Switch to Stable any time if you would rather have only finished updates.</div></div></div> <div class="row opt svelte-1xc311x"><div class="grow"><b>Version <!></b><div class="muted"> </div></div><button class="btn"><!> </button></div></div> <div class="sech rise" style="--i:11"><h2>Data and help</h2></div> <div class="card list rise svelte-1xc311x" style="--i:12"><div class="row opt svelte-1xc311x"><div class="grow"><b>Open the data folder</b><div class="muted">Where SteamLite keeps your settings and play time.</div></div><button class="btn"><!>Open</button></div> <div class="row opt svelte-1xc311x"><div class="grow"><b>Clear saved Steam data</b><div class="muted">Removes the saved copies SteamLite keeps for offline use. Your settings and play time stay.</div></div><button class="btn"><!>Clear</button></div> <div class="row opt svelte-1xc311x"><div class="grow"><b>Copy diagnostics</b><div class="muted">Copies your SteamLite and Windows versions to paste into a bug report. It has nothing personal in it.</div></div><button class="btn"><!>Copy</button></div> <div class="row opt svelte-1xc311x"><div class="grow"><b>Report a bug or ask for something</b><div class="muted">Open the SteamLite page on GitHub.</div></div><button class="btn"><!>Open</button></div></div></div> <!>`, 1);
function Yg(t, a) {
  Tt(a, !0);
  const s = /* @__PURE__ */ P(() => c.version.endsWith(".beta"));
  let r = /* @__PURE__ */ G(null), i = /* @__PURE__ */ G("game"), o = 0;
  $t(() => {
    const le = {
      discordNames: e(O).discordNames !== !1,
      discordStats: e(O).discordStats !== !1,
      discordBrowse: e(O).discordBrowse !== !1,
      discordButtons: e(O).discordButtons !== !1
    }, Oe = e(i);
    clearTimeout(o), o = setTimeout(
      async () => {
        g(r, await ve("presence:preview", { mode: Oe, options: le }).catch(() => null), !0);
      },
      160
    );
  });
  let d = /* @__PURE__ */ G(null);
  oa(() => {
    ve("discord:link").then((le) => g(d, le, !0)).catch(() => {
    });
  });
  let f = /* @__PURE__ */ G(Ct({ installed: null, enabled: !1 })), u = /* @__PURE__ */ G(""), m = /* @__PURE__ */ G(null);
  const p = (le) => (le / 1048576).toFixed(1) + " MB";
  async function _() {
    g(f, await ve("uipreview:status").catch(() => null) || e(f), !0), e(f).installed || g(m, await ve("uipreview:available").catch(() => null), !0);
  }
  oa(_);
  async function k() {
    g(u, "get");
    const le = await ve("uipreview:download").catch(() => ({ ok: !1, error: "The download did not work." }));
    if (g(u, ""), !le.ok) return yt(le.error, "bad");
    yt("The 27.1 preview is downloaded."), await _();
  }
  async function b(le) {
    const Oe = await ve("uipreview:set", le);
    if (!Oe.ok) return yt(Oe.error, "bad");
    g(u, "reload"), setTimeout(() => location.reload(), 350);
  }
  async function S() {
    await ve("uipreview:remove"), yt("The preview is removed.");
    const le = e(f).enabled;
    await _(), le && location.reload();
  }
  let E = /* @__PURE__ */ G(Ct({})), z = /* @__PURE__ */ G(!1), x = /* @__PURE__ */ G(!1), A = /* @__PURE__ */ G(0);
  async function j() {
    g(x, !0), g(A, 0), g(z, !1);
    const le = window.sl.on("stable:progress", (Qt) => {
      g(A, Qt.percent, !0);
    }), Oe = await ve("update:goStable").catch((Qt) => ({ ok: !1, error: String(Qt && Qt.message || Qt) }));
    typeof le == "function" && le(), (!Oe || !Oe.ok) && (g(x, !1), yt(Oe && Oe.error || "Could not go back to stable.", "bad"));
  }
  const O = /* @__PURE__ */ P(() => ({ ...c.settings, ...e(E) })), H = /* @__PURE__ */ P(() => Object.keys(e(E)).length > 0), I = /* @__PURE__ */ P(() => e(O).channel || "beta");
  function w(le, Oe) {
    const Qt = c.settings[le];
    if (Oe === Qt || !Oe && !Qt) {
      const { [le]: Ba, ...Qa } = e(E);
      g(E, Qa, !0);
    } else g(E, { ...e(E), [le]: Oe }, !0);
  }
  const $ = (le) => w("channel", le);
  async function B() {
    const le = { ...e(E) };
    await ve("settings:set", le), Object.assign(c.settings, le), Dr(), g(E, {}, !0), yt("Settings saved."), ("showAllApps" in le || "smartLibrary" in le) && de(), "channel" in le && U();
  }
  let te = /* @__PURE__ */ G(Ct({ profiles: [], activeId: null })), he = /* @__PURE__ */ G(!1);
  const se = async () => {
    g(te, await ve("account:list"), !0), Ms();
  };
  oa(se);
  async function de() {
    c.games = [], await Fa();
  }
  $t(
    () => {
      c.addAccount || se();
    }
    // the list updates when the add-account dialog closes
  );
  async function U() {
    g(he, !0);
    const le = await ve("update:check");
    g(he, !1), le.ok ? le.available ? (c.update = { version: le.version, notes: le.notes }, c.updateHidden = !1) : yt("You are on the latest version.") : yt(le.error, "bad");
  }
  async function re() {
    const le = await ve("app:copyDiagnostics");
    yt(
      le ? "Copied. Paste it into your bug report." : "Could not copy. Try again.",
      le ? void 0 : "bad"
    );
  }
  async function ke() {
    const le = await ve("app:clearCache");
    yt(le.files ? "Cleared " + le.files + " saved Steam files. They load again when needed." : "Nothing saved to clear.");
  }
  const F = (le) => ve("app:openUrl", le), ne = [["low", "Low"], ["medium", "Medium"], ["high", "High"]], V = [
    ["home", "Home"],
    ["library", "Library"],
    ["last", "Last page"]
  ], ye = [
    ["name", "A to Z"],
    ["played", "Most played"],
    ["recent", "Recent"],
    ["installed", "Installed first"],
    ["size", "Largest"]
  ];
  var Se = Wg(), Re = we(Se), $e = l(Re), Ye = l($e), ce = n(l(Ye)), J = n(l(ce));
  Sr(J, {
    get v() {
      return c.version;
    }
  });
  var q = n($e, 4), D = l(q), X = n(l(D)), fe = l(X);
  oe(fe, { name: "user", size: 17 });
  var Z = n(q, 4), W = l(Z), ee = n(l(W));
  Ut(ee, {
    get checked() {
      return e(O).startWithWindows;
    },
    onchange: (le) => w("startWithWindows", le)
  });
  var pe = n(W, 2), R = n(l(pe));
  {
    let le = /* @__PURE__ */ P(() => !!e(O).startMinimised);
    Ut(R, {
      get checked() {
        return e(le);
      },
      onchange: (Oe) => w("startMinimised", Oe)
    });
  }
  var ge = n(pe, 2), be = n(l(ge));
  {
    let le = /* @__PURE__ */ P(() => !!e(O).closeToTray);
    Ut(be, {
      get checked() {
        return e(le);
      },
      onchange: (Oe) => w("closeToTray", Oe)
    });
  }
  var N = n(ge, 2), ae = n(l(N));
  {
    let le = /* @__PURE__ */ P(() => e(O).island !== !1);
    Ut(ae, {
      get checked() {
        return e(le);
      },
      onchange: (Oe) => w("island", Oe)
    });
  }
  var ie = n(N, 2), me = n(l(ie));
  ar(me, {
    get options() {
      return V;
    },
    get value() {
      return e(O).startPage;
    },
    label: "Start page",
    onchange: (le) => w("startPage", le)
  });
  var Me = n(ie, 2), Ae = n(l(Me));
  {
    let le = /* @__PURE__ */ P(() => e(O).splash !== !1);
    Ut(Ae, {
      get checked() {
        return e(le);
      },
      onchange: (Oe) => w("splash", Oe)
    });
  }
  var Ie = n(Me, 2), De = n(l(Ie));
  {
    let le = /* @__PURE__ */ P(() => e(O).whatsNew !== !1);
    Ut(De, {
      get checked() {
        return e(le);
      },
      onchange: (Oe) => w("whatsNew", Oe)
    });
  }
  var Ge = n(Ie, 2), We = n(l(Ge));
  {
    let le = /* @__PURE__ */ P(() => e(O).confirmClose !== !1);
    Ut(We, {
      get checked() {
        return e(le);
      },
      onchange: (Oe) => w("confirmClose", Oe)
    });
  }
  var Je = n(Z, 4), vt = l(Je), Q = n(l(vt)), xe = l(Q);
  oe(xe, { name: "sliders", size: 17 });
  var Te = n(Je, 4), tt = l(Te), He = n(l(tt));
  {
    let le = /* @__PURE__ */ P(() => !!e(O).artColour);
    Ut(He, {
      get checked() {
        return e(le);
      },
      onchange: (Oe) => w("artColour", Oe)
    });
  }
  var lt = n(tt, 2), ut = n(l(lt));
  {
    let le = /* @__PURE__ */ P(() => e(O).animBg !== !1);
    Ut(ut, {
      get checked() {
        return e(le);
      },
      onchange: (Oe) => w("animBg", Oe)
    });
  }
  var it = n(lt, 2), jt = n(l(it));
  {
    let le = /* @__PURE__ */ P(() => e(O).gameLite !== !1);
    Ut(jt, {
      get checked() {
        return e(le);
      },
      onchange: (Oe) => w("gameLite", Oe)
    });
  }
  var Ke = n(it, 2), kt = n(l(Ke));
  {
    let le = /* @__PURE__ */ P(() => !!e(O).pauseInGame);
    Ut(kt, {
      get checked() {
        return e(le);
      },
      onchange: (Oe) => w("pauseInGame", Oe)
    });
  }
  var Mt = n(Ke, 2), wt = n(l(Mt));
  {
    let le = /* @__PURE__ */ P(() => !!e(O).lightGfx);
    Ut(wt, {
      get checked() {
        return e(le);
      },
      onchange: (Oe) => w("lightGfx", Oe)
    });
  }
  var Ze = n(Mt, 2), st = n(l(Ze));
  {
    let le = /* @__PURE__ */ P(() => !!e(O).reduceMotion);
    Ut(st, {
      get checked() {
        return e(le);
      },
      onchange: (Oe) => w("reduceMotion", Oe)
    });
  }
  var gt = n(Ze, 2), at = l(gt), Qe = n(l(at)), mt = n(l(Qe));
  {
    var Xe = (le) => {
      var Oe = za();
      L((Qt) => T(Oe, `(${Qt ?? ""})`), [() => p(e(m).size)]), v(le, Oe);
    };
    M(mt, (le) => {
      !e(f).installed && e(m) && e(m).ok && le(Xe);
    });
  }
  var ue = n(mt, 4);
  {
    var Ue = (le) => {
      var Oe = za();
      L(() => T(Oe, `Downloaded: version ${e(f).installed.version ?? ""}.`)), v(le, Oe);
    };
    M(ue, (le) => {
      e(f).installed && le(Ue);
    });
  }
  var et = n(at, 2);
  {
    var Fe = (le) => {
      var Oe = Dg(), Qt = l(Oe);
      oe(Qt, { name: "download", size: 17 });
      var Ba = n(Qt, 1, !0);
      L(() => {
        Oe.disabled = e(u) === "get", T(Ba, e(u) === "get" ? "Downloading..." : "Download");
      }), y("click", Oe, k), v(le, Oe);
    }, ft = (le) => {
      var Oe = Og(), Qt = we(Oe);
      {
        var Ba = (Is) => {
          var fr = Ng();
          y("click", fr, () => window.dispatchEvent(new Event("sl-showcase"))), v(Is, fr);
        };
        M(Qt, (Is) => {
          e(f).enabled && Is(Ba);
        });
      }
      var Qa = n(Qt);
      Ut(Qa, {
        get checked() {
          return e(f).enabled;
        },
        onchange: b
      });
      var Rr = n(Qa);
      y("click", Rr, S), v(le, Oe);
    };
    M(et, (le) => {
      e(f).installed ? le(ft, -1) : le(Fe);
    });
  }
  var rt = n(Te, 4), ct = l(rt), ze = n(l(ct));
  ar(ze, {
    get options() {
      return ye;
    },
    get value() {
      return e(O).defaultSort;
    },
    label: "Default sort",
    onchange: (le) => w("defaultSort", le)
  });
  var nt = n(ct, 2), pt = n(l(nt));
  {
    let le = /* @__PURE__ */ P(() => !!e(O).smartLibrary);
    Ut(pt, {
      get checked() {
        return e(le);
      },
      onchange: (Oe) => w("smartLibrary", Oe)
    });
  }
  var Le = n(nt, 2), St = n(l(Le));
  {
    let le = /* @__PURE__ */ P(() => !!e(O).showAllApps);
    Ut(St, {
      get checked() {
        return e(le);
      },
      onchange: (Oe) => w("showAllApps", Oe)
    });
  }
  var Ft = n(Le, 2), Nt = n(l(Ft));
  {
    let le = /* @__PURE__ */ P(() => !!e(O).navSounds);
    Ut(Nt, {
      get checked() {
        return e(le);
      },
      onchange: (Oe) => w("navSounds", Oe)
    });
  }
  var Vt = n(Ft, 2);
  {
    var K = (le) => {
      var Oe = qg(), Qt = n(l(Oe));
      {
        let Ba = /* @__PURE__ */ P(() => e(O).soundVolume || "medium");
        ar(Qt, {
          get options() {
            return ne;
          },
          get value() {
            return e(Ba);
          },
          label: "Sound volume",
          onchange: (Qa) => w("soundVolume", Qa)
        });
      }
      v(le, Oe);
    };
    M(Vt, (le) => {
      e(O).navSounds && le(K);
    });
  }
  var Ce = n(Vt, 2), Pe = n(l(Ce));
  {
    let le = /* @__PURE__ */ P(() => !!e(O).notifyStop);
    Ut(Pe, {
      get checked() {
        return e(le);
      },
      onchange: (Oe) => w("notifyStop", Oe)
    });
  }
  var qe = n(rt, 4), ot = l(qe), At = n(l(ot));
  {
    let le = /* @__PURE__ */ P(() => !!e(O).discord);
    Ut(At, {
      get checked() {
        return e(le);
      },
      onchange: (Oe) => w("discord", Oe)
    });
  }
  var It = n(ot, 2);
  {
    var ra = (le) => {
      var Oe = jg(), Qt = we(Oe), Ba = n(l(Qt));
      {
        let ms = /* @__PURE__ */ P(() => e(O).discordNames !== !1);
        Ut(Ba, {
          get checked() {
            return e(ms);
          },
          onchange: (gs) => w("discordNames", gs)
        });
      }
      var Qa = n(Qt, 2), Rr = n(l(Qa));
      {
        let ms = /* @__PURE__ */ P(() => e(O).discordStats !== !1);
        Ut(Rr, {
          get checked() {
            return e(ms);
          },
          onchange: (gs) => w("discordStats", gs)
        });
      }
      var Is = n(Qa, 2), fr = n(l(Is));
      {
        let ms = /* @__PURE__ */ P(() => e(O).discordBrowse !== !1);
        Ut(fr, {
          get checked() {
            return e(ms);
          },
          onchange: (gs) => w("discordBrowse", gs)
        });
      }
      var Nn = n(Is, 2), On = n(l(Nn));
      {
        let ms = /* @__PURE__ */ P(() => e(O).discordButtons !== !1);
        Ut(On, {
          get checked() {
            return e(ms);
          },
          onchange: (gs) => w("discordButtons", gs)
        });
      }
      v(le, Oe);
    };
    M(It, (le) => {
      e(O).discord && le(ra);
    });
  }
  var Jt = n(It, 2), Y = l(Jt), _e = l(Y), xt = n(l(_e)), Bt = n(l(xt));
  {
    var Ot = (le) => {
      var Oe = za("It is off at the moment.");
      v(le, Oe);
    };
    M(Bt, (le) => {
      e(O).discord || le(Ot);
    });
  }
  var Gt = n(_e);
  ar(Gt, {
    options: [["game", "Playing a game"], ["browse", "Browsing"]],
    get value() {
      return e(i);
    },
    label: "Preview",
    onchange: (le) => g(i, le, !0)
  });
  var Ht = n(Y);
  {
    var Pt = (le) => {
      var Oe = Hg();
      let Qt;
      var Ba = l(Oe);
      Pg(Ba, {
        get p() {
          return e(r);
        }
      }), L(() => Qt = je(Oe, 1, "dpc svelte-1xc311x", null, Qt, { off: !e(O).discord })), v(le, Oe);
    };
    M(Ht, (le) => {
      e(r) && le(Pt);
    });
  }
  var Yt = n(Jt, 2), ea = n(l(Yt)), sa = n(qe, 4), ba = l(sa), Na = n(l(ba));
  Ut(Na, {
    get checked() {
      return e(O).autoUpdate;
    },
    onchange: (le) => w("autoUpdate", le)
  });
  var Ka = n(ba, 2), Es = n(l(Ka), 2), pa = l(Es), da = n(pa, 2);
  let Ha;
  var Xa = n(da, 2);
  let cr;
  zt(Es, (le) => In?.(le));
  var Ws = n(Ka, 2);
  {
    var dr = (le) => {
      var Oe = Bg(), Qt = l(Oe), Ba = n(l(Qt)), Qa = l(Ba);
      {
        var Rr = (ya) => {
          var Aa = za();
          L((hr) => T(Aa, hr), [
            () => e(A) < 100 ? "Downloading the stable version... " + Math.round(e(A)) + "%" : "Starting the installer. SteamLite closes and the installer puts the stable version back."
          ]), v(ya, Aa);
        }, Is = (ya) => {
          var Aa = za("This downloads the newest stable SteamLite, closes this beta and installs it over it. Your games, collections and play time are kept. Go back now?");
          v(ya, Aa);
        }, fr = (ya) => {
          var Aa = za("Leave the beta and return to the newest stable version. Your games, collections and play time are kept.");
          v(ya, Aa);
        };
        M(Qa, (ya) => {
          e(x) ? ya(Rr) : e(z) ? ya(Is, 1) : ya(fr, -1);
        });
      }
      var Nn = n(Qt, 2);
      {
        var On = (ya) => {
          var Aa = Rg();
          v(ya, Aa);
        }, ms = (ya) => {
          var Aa = $g(), hr = l(Aa), ev = n(hr);
          y("click", hr, () => g(z, !1)), y("click", ev, j), v(ya, Aa);
        }, gs = (ya) => {
          var Aa = Fg(), hr = l(Aa);
          oe(hr, { name: "back", size: 17 }), y("click", Aa, () => g(z, !0)), v(ya, Aa);
        };
        M(Nn, (ya) => {
          e(x) ? ya(On) : e(z) ? ya(ms, 1) : ya(gs, -1);
        });
      }
      v(le, Oe);
    };
    M(Ws, (le) => {
      c.settings.betaBuild && le(dr);
    });
  }
  var Ja = n(Ws, 2), Nr = l(Ja);
  oe(Nr, { name: "news", size: 20 });
  var Or = n(Ja, 2), Ne = l(Or), Ee = l(Ne), ht = n(l(Ee));
  Sr(ht, {
    get v() {
      return c.version;
    }
  });
  var Xt = n(Ee), na = C(Xt), Zt = n(Ne), aa = l(Zt);
  oe(aa, { name: "refresh", size: 17 });
  var fa = n(aa, 1, !0), Za = n(sa, 4), Ys = l(Za), As = n(l(Ys)), Pn = l(As);
  oe(Pn, { name: "folder", size: 17 });
  var qr = n(Ys, 2), ln = n(l(qr)), jr = l(ln);
  oe(jr, { name: "refresh", size: 17 });
  var ur = n(qr, 2), Hr = n(l(ur)), Dn = l(Hr);
  oe(Dn, { name: "layers", size: 17 });
  var Xo = n(ur, 2), Ii = n(l(Xo)), Jo = l(Ii);
  oe(Jo, { name: "ext", size: 17 });
  var Zo = n(Re, 2);
  {
    var Qo = (le) => {
      var Oe = Gg(), Qt = n(l(Oe), 2);
      y("click", Qt, B), bt(1, Oe, () => La, () => ({ y: 18, duration: 380, easing: ca })), bt(2, Oe, () => ha, () => ({ duration: 200 })), v(le, Oe);
    };
    M(Zo, (le) => {
      e(H) && le(Qo);
    });
  }
  L(() => {
    dt(pa, `transform: translateX(${e(I) === "release" ? 100 : 0}%)`), Be(da, "aria-checked", e(I) === "beta"), Ha = je(da, 1, "svelte-1xc311x", null, Ha, { on: e(I) === "beta" }), Be(Xa, "aria-checked", e(I) === "release"), cr = je(Xa, 1, "svelte-1xc311x", null, cr, { on: e(I) === "release" }), T(na, `Versions are the year and month, like 26.11.${e(s) ? " This is a beta build." : ""}`), Zt.disabled = e(he), T(fa, e(he) ? "Checking..." : "Check now");
  }), y("click", X, () => Da("account")), y("click", Q, () => {
    or({ modTab: "themes" }), Da("customise");
  }), y("click", ea, () => F("https://discord.gg/kBzXWQevw5")), y("click", da, () => $("beta")), y("click", Xa, () => $("release")), y("click", Zt, U), y("click", As, () => ve("app:openDataFolder")), y("click", ln, ke), y("click", Hr, re), y("click", Ii, () => F("https://github.com/imnotfisy/SteamLite/issues")), v(t, Se), Lt();
}
Wt(["click"]);
var Ug = /* @__PURE__ */ h('<img alt="" draggable="false" class="svelte-11w59y9"/>'), pl = /* @__PURE__ */ h('<span class="svelte-11w59y9"> </span>'), Vg = /* @__PURE__ */ h('<span class="pill ok svelte-11w59y9">Profile shared</span>'), Kg = /* @__PURE__ */ h('<span class="pill svelte-11w59y9">Profile private</span>'), Xg = /* @__PURE__ */ h('<button class="code svelte-11w59y9" title="Copy your friend code"><span><small class="svelte-11w59y9">Your friend code</small><b class="svelte-11w59y9"> </b></span><!></button>'), Jg = /* @__PURE__ */ h('<img alt="" class="svelte-11w59y9"/>'), Zg = /* @__PURE__ */ h('<span class="signed svelte-11w59y9"><!>In use</span>'), Qg = /* @__PURE__ */ h('<button class="btn sm svelte-11w59y9">Switch</button><button class="btn sm danger svelte-11w59y9">Remove</button>', 1), e_ = /* @__PURE__ */ h('<div class="row acc svelte-11w59y9"><div class="av svelte-11w59y9"><!></div> <div class="grow svelte-11w59y9"><b> </b><div class="faint"> </div></div> <!></div>'), t_ = /* @__PURE__ */ h("Signed in as <b> </b> ", 1), a_ = /* @__PURE__ */ h('<span class="bad svelte-11w59y9"> </span>'), s_ = /* @__PURE__ */ h('<button class="btn">Disconnect</button>'), r_ = /* @__PURE__ */ h('<button class="btn discordb svelte-11w59y9"> </button>'), n_ = /* @__PURE__ */ h("Signed in as <b> </b>. It is only used to publish your modules as Gists, and it cannot touch anything else on your account.", 1), i_ = /* @__PURE__ */ h('<button class="btn">Sign out</button>'), l_ = /* @__PURE__ */ h('<button class="btn">Sign in</button>'), o_ = /* @__PURE__ */ h(`<h2 class="svelte-11w59y9">Continue in your browser</h2><p class="muted svelte-11w59y9">Discord's page opened in your browser. Approve it there and this window updates by itself. SteamLite only asks who you are.</p> <div class="wait svelte-11w59y9"><span class="spin svelte-11w59y9"></span>Waiting for Discord...</div> <div class="dr svelte-11w59y9"><button class="btn">Cancel</button><button class="btn">Open it again</button></div>`, 1), v_ = /* @__PURE__ */ h('<h2 class="svelte-11w59y9">That did not work</h2><p class="muted svelte-11w59y9"> </p><div class="dr svelte-11w59y9"><button class="btn">Close</button><button class="btn primary">Try again</button></div>', 1), ml = /* @__PURE__ */ h('<div class="back svelte-11w59y9" role="presentation"><div class="dlg glass svelte-11w59y9" role="dialog" tabindex="-1"><!></div></div>'), c_ = /* @__PURE__ */ h('<div class="back svelte-11w59y9" role="presentation"><div class="dlg glass svelte-11w59y9" role="alertdialog" tabindex="-1"><h2 class="svelte-11w59y9">Sign out of SteamLite?</h2><p class="muted svelte-11w59y9">This signs out of every Steam account in SteamLite on this PC. Your settings and play time stay where they are.</p> <div class="dr svelte-11w59y9"><button class="btn">Cancel</button><button class="btn danger">Sign out</button></div></div></div>'), d_ = /* @__PURE__ */ h('<h2 class="svelte-11w59y9">Starting...</h2><p class="muted svelte-11w59y9">Asking GitHub for a code.</p>', 1), u_ = /* @__PURE__ */ h('<h2 class="svelte-11w59y9">Sign in to GitHub</h2><p class="muted svelte-11w59y9">Open GitHub and type this code. SteamLite only asks to create and change Gists, nothing else on your account.</p> <div class="gcode svelte-11w59y9"> </div><div class="dr svelte-11w59y9"><button class="btn">Cancel</button><button class="btn primary">Open GitHub</button></div><p class="muted sm svelte-11w59y9">Waiting for you to approve it...</p>', 1), f_ = /* @__PURE__ */ h('<h2 class="svelte-11w59y9">That did not work</h2><p class="muted svelte-11w59y9"> </p><div class="dr svelte-11w59y9"><button class="btn">Close</button></div>', 1), h_ = /* @__PURE__ */ h('<div class="page mid"><div class="phead"><div class="hd rise svelte-11w59y9" style="--i:0"><h1 class="title">Account</h1><p class="sub">You, your Steam accounts and everything you have linked</p></div></div> <div class="card me rise svelte-11w59y9" style="--i:1"><div class="pic svelte-11w59y9"><!><i></i></div> <div class="who svelte-11w59y9"><h2 class="svelte-11w59y9"> </h2> <div class="faint"> </div> <div class="chips svelte-11w59y9"><span> </span> <!></div></div> <div class="acts svelte-11w59y9"><button class="btn primary"><!>Edit profile</button><button class="btn"><!>View profile</button></div> <!></div> <div class="sech rise" style="--i:2"><h2>Steam accounts</h2></div> <div class="card list rise svelte-11w59y9" style="--i:3"><!> <div class="row svelte-11w59y9"><button class="btn"><!>Add a Steam account</button><div class="grow svelte-11w59y9"></div><button class="btn danger"><!>Sign out of everything</button></div></div> <div class="sech rise" style="--i:4"><h2>Profile and privacy</h2></div> <div class="card list rise svelte-11w59y9" style="--i:5"><div class="row opt svelte-11w59y9"><div class="grow svelte-11w59y9"><b>Share my profile</b><div class="muted svelte-11w59y9">Other SteamLite players can see your picture, banner, tagline, top games and the widgets you leave on. Off, and nobody but you can see it.</div></div><!></div> <div class="row opt svelte-11w59y9"><div class="grow svelte-11w59y9"><b>Show my Discord on my profile</b><div class="muted svelte-11w59y9"><!></div></div><span><!></span></div> <div class="row opt svelte-11w59y9"><div class="grow svelte-11w59y9"><b>What others see</b><div class="muted svelte-11w59y9">Change your picture, banner, tagline, colour and widgets, and hide any of them, from the profile editor.</div></div><button class="btn">Open the editor</button></div></div> <div class="sech rise" style="--i:6"><h2>Linked services</h2></div> <div class="card list rise svelte-11w59y9" style="--i:7"><div class="row opt svelte-11w59y9"><div class="svc discord svelte-11w59y9"><img src="/discord/symbol-white.svg" alt="" draggable="false" class="svelte-11w59y9"/></div> <div class="grow svelte-11w59y9"><b>Discord</b><div class="muted svelte-11w59y9"><!><!></div></div> <!></div> <div class="row opt svelte-11w59y9"><div class="svc github svelte-11w59y9"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.7 5.4-5.27 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z"></path></svg></div> <div class="grow svelte-11w59y9"><b>GitHub</b><div class="muted svelte-11w59y9"><!></div></div> <!></div></div> <div class="sech rise" style="--i:8"><h2>Your data</h2></div> <div class="card list rise svelte-11w59y9" style="--i:9"><div class="row opt svelte-11w59y9"><div class="grow svelte-11w59y9"><b>Open the data folder</b><div class="muted svelte-11w59y9">Where SteamLite keeps your settings, favorites, modules and play time, on this PC. Nothing in it is sent anywhere unless you share your profile.</div></div><button class="btn"><!>Open</button></div></div></div> <!> <!> <!>', 1);
function p_(t, a) {
  Tt(a, !0);
  let s = /* @__PURE__ */ G(Ct(c.me)), r = /* @__PURE__ */ G(Ct({ signedIn: !1, login: "" })), i = /* @__PURE__ */ G(Ct(c.discordLink)), o = /* @__PURE__ */ G(!1), d = /* @__PURE__ */ G(""), f = /* @__PURE__ */ G(!1), u = /* @__PURE__ */ G(null), m = 0;
  const p = /* @__PURE__ */ P(() => ga.profiles.find((Y) => Y.steamId === ga.activeId) || ga.profiles[0] || null), _ = /* @__PURE__ */ P(() => c.look && c.look.avatarImage || e(p) && e(p).avatar || ""), k = /* @__PURE__ */ P(() => !!c.settings.onlineShare);
  oa(async () => {
    Ms(), ve("online:me").then((Y) => {
      Y && (g(s, Y, !0), c.me = Y);
    }).catch(() => {
    }), ve("github:status").then((Y) => Y && g(r, Y, !0)).catch(() => {
    }), ve("discord:link").then((Y) => {
      g(i, Y, !0), c.discordLink = Y;
    }).catch(() => {
    });
  }), nn(() => {
    clearInterval(m), clearInterval(I), ve("github:cancel"), ve("discord:oauthCancel");
  });
  async function b(Y) {
    await ve("settings:set", { onlineShare: Y }), c.settings = { ...c.settings, onlineShare: Y }, Dr(), ve("online:me").then((_e) => {
      _e && (g(s, _e, !0), c.me = _e);
    }), yt(Y ? "Your profile can now be seen by other SteamLite players." : "Your profile is hidden from other SteamLite players.");
  }
  const S = /* @__PURE__ */ P(() => !!c.settings.onlineDiscord);
  async function E(Y) {
    await ve("settings:set", { onlineDiscord: Y }), c.settings = { ...c.settings, onlineDiscord: Y }, ve("online:setLook", {}), yt(Y ? "Your Discord name is shown on your profile." : "Your Discord name is hidden.");
  }
  async function z() {
    const Y = await ve("app:copyText", e(s).code);
    yt(Y ? "Friend code copied." : "Could not copy it.", Y ? void 0 : "bad");
  }
  const x = () => {
    Da("profile"), setTimeout(() => c.editOpen = !0, 450);
  };
  async function A(Y) {
    await Lo(Y), yt("Switched account."), Ms();
  }
  async function j(Y) {
    await ve("account:remove", Y), Ms();
  }
  async function O() {
    g(f, !1), await zo();
  }
  let H = /* @__PURE__ */ G(null), I = 0;
  async function w() {
    g(d, ""), g(o, !0);
    const Y = await ve("discord:oauthStart").catch(() => null);
    if (g(o, !1), !Y || !Y.ok) {
      g(d, Y && Y.error || "Could not start the sign-in.", !0);
      return;
    }
    g(H, { step: "wait", url: Y.url }, !0), clearInterval(I), I = setInterval(
      async () => {
        const _e = await ve("discord:oauthPoll").catch(() => null);
        if (!e(H)) return clearInterval(I);
        _e && _e.done ? (clearInterval(I), g(i, _e.link, !0), c.discordLink = _e.link, g(H, null), yt("Signed in with Discord as " + _e.link.name + ".")) : _e && _e.error && (clearInterval(I), g(H, { step: "err", err: _e.error }, !0));
      },
      1500
    );
  }
  function $() {
    clearInterval(I), ve("discord:oauthCancel"), g(H, null);
  }
  async function B() {
    await ve("discord:unlink"), g(i, null), c.discordLink = null;
  }
  async function te() {
    g(u, { step: "work", code: "", uri: "", err: "" }, !0);
    const Y = await ve("github:start").catch(() => null);
    if (!Y || !Y.ok) return g(
      u,
      {
        ...e(u),
        step: "err",
        err: Y && Y.error || "GitHub could not be reached."
      },
      !0
    );
    g(u, { ...e(u), step: "code", code: Y.code, uri: Y.uri }, !0), clearInterval(m), m = setInterval(
      async () => {
        const _e = await ve("github:poll").catch(() => null);
        if (!e(u) || e(u).step !== "code") return clearInterval(m);
        _e && _e.done ? (clearInterval(m), g(r, { signedIn: !0, login: _e.login }, !0), g(u, null), yt("Signed in to GitHub as " + (_e.login || "you") + ".")) : _e && _e.error && (clearInterval(m), g(u, { ...e(u), step: "err", err: _e.error }, !0));
      },
      2e3
    );
  }
  function he() {
    clearInterval(m), ve("github:cancel"), g(u, null);
  }
  async function se() {
    await ve("github:signOut"), g(r, { signedIn: !1, login: "" }, !0), yt("Signed out of GitHub.");
  }
  var de = h_(), U = we(de), re = n(l(U), 2), ke = l(re), F = l(ke);
  {
    var ne = (Y) => {
      var _e = Ug();
      L(() => Be(_e, "src", e(_))), v(Y, _e);
    }, V = (Y) => {
      var _e = pl(), xt = C(_e, !0);
      L((Bt) => T(xt, Bt), [
        () => (e(p) && e(p).name || "?")[0].toUpperCase()
      ]), v(Y, _e);
    };
    M(F, (Y) => {
      e(_) ? Y(ne) : Y(V, -1);
    });
  }
  var ye = n(F);
  let Se;
  var Re = n(ke, 2), $e = l(Re), Ye = C($e, !0), ce = n($e, 2), J = C(ce), q = n(ce, 2), D = l(q);
  let X;
  var fe = C(D, !0), Z = n(D, 2);
  {
    var W = (Y) => {
      var _e = Vg();
      v(Y, _e);
    }, ee = (Y) => {
      var _e = Kg();
      v(Y, _e);
    };
    M(Z, (Y) => {
      e(k) ? Y(W) : Y(ee, -1);
    });
  }
  var pe = n(Re, 2), R = l(pe), ge = l(R);
  oe(ge, { name: "pencil", size: 16 });
  var be = n(R), N = l(be);
  oe(N, { name: "user", size: 16 });
  var ae = n(pe, 2);
  {
    var ie = (Y) => {
      var _e = Xg(), xt = l(_e), Bt = n(l(xt)), Ot = C(Bt, !0), Gt = n(xt);
      oe(Gt, { name: "layers", size: 18 }), L(() => T(Ot, e(s).code)), y("click", _e, z), v(Y, _e);
    };
    M(ae, (Y) => {
      e(s) && e(s).code && Y(ie);
    });
  }
  var me = n(re, 4), Me = l(me);
  Ve(Me, 17, () => ga.profiles, (Y) => Y.steamId, (Y, _e) => {
    var xt = e_(), Bt = l(xt), Ot = l(Bt);
    {
      var Gt = (pa) => {
        var da = Jg();
        L(() => Be(da, "src", e(_e).avatar)), v(pa, da);
      }, Ht = (pa) => {
        var da = pl(), Ha = C(da, !0);
        L((Xa) => T(Ha, Xa), [() => (e(_e).name || "?")[0].toUpperCase()]), v(pa, da);
      };
      M(Ot, (pa) => {
        e(_e).avatar ? pa(Gt) : pa(Ht, -1);
      });
    }
    var Pt = n(Bt, 2), Yt = l(Pt), ea = C(Yt, !0), sa = n(Yt), ba = C(sa, !0), Na = n(Pt, 2);
    {
      var Ka = (pa) => {
        var da = Zg(), Ha = l(da);
        oe(Ha, { name: "check", size: 14, stroke: 3 }), v(pa, da);
      }, Es = (pa) => {
        var da = Qg(), Ha = we(da), Xa = n(Ha);
        y("click", Ha, () => A(e(_e).steamId)), y("click", Xa, () => j(e(_e).steamId)), v(pa, da);
      };
      M(Na, (pa) => {
        e(_e).steamId === ga.activeId ? pa(Ka) : pa(Es, -1);
      });
    }
    L(() => {
      T(ea, e(_e).name), T(ba, e(_e).steamId);
    }), v(Y, xt);
  });
  var Ae = n(Me, 2), Ie = l(Ae), De = l(Ie);
  oe(De, { name: "plus", size: 17 });
  var Ge = n(Ie, 2), We = l(Ge);
  oe(We, { name: "logout", size: 17 });
  var Je = n(me, 4), vt = l(Je), Q = n(l(vt));
  Ut(Q, {
    get checked() {
      return e(k);
    },
    onchange: b
  });
  var xe = n(vt, 2), Te = l(xe), tt = n(l(Te)), He = l(tt);
  {
    var lt = (Y) => {
      var _e = za("Sign in with Discord below first.");
      v(Y, _e);
    }, ut = (Y) => {
      var _e = za("Turn on Share my profile first.");
      v(Y, _e);
    }, it = (Y) => {
      var _e = za("Friends see your Discord name on your profile and a small Discord mark next to you in their friends list. It is off until you turn it on.");
      v(Y, _e);
    };
    M(He, (Y) => {
      e(i) ? e(k) ? Y(it, -1) : Y(ut, 1) : Y(lt);
    });
  }
  var jt = n(Te);
  let Ke;
  var kt = l(jt);
  {
    let Y = /* @__PURE__ */ P(() => e(S) && !!e(i) && e(k));
    Ut(kt, {
      get checked() {
        return e(Y);
      },
      onchange: E
    });
  }
  var Mt = n(xe, 2), wt = n(l(Mt)), Ze = n(Je, 4), st = l(Ze), gt = n(l(st), 2), at = n(l(gt)), Qe = l(at);
  {
    var mt = (Y) => {
      var _e = t_(), xt = n(we(_e)), Bt = C(xt, !0), Ot = n(xt);
      L(() => {
        T(Bt, e(i).name), T(Ot, `${e(i).username && e(i).username !== e(i).name ? " (" + e(i).username + ")" : ""}${e(i).verified ? ", confirmed by Discord" : ""}. It shows on your profile.`);
      }), v(Y, _e);
    }, Xe = (Y) => {
      var _e = za("Sign in with your Discord account. Discord's own page opens in your browser, and SteamLite only learns your name and picture. It never sees your password or your messages.");
      v(Y, _e);
    };
    M(Qe, (Y) => {
      e(i) ? Y(mt) : Y(Xe, -1);
    });
  }
  var ue = n(Qe);
  {
    var Ue = (Y) => {
      var _e = a_(), xt = C(_e, !0);
      L(() => T(xt, e(d))), v(Y, _e);
    };
    M(ue, (Y) => {
      e(d) && Y(Ue);
    });
  }
  var et = n(gt, 2);
  {
    var Fe = (Y) => {
      var _e = s_();
      y("click", _e, B), v(Y, _e);
    }, ft = (Y) => {
      var _e = r_(), xt = C(_e, !0);
      L(() => {
        _e.disabled = e(o), T(xt, e(o) ? "Opening..." : "Sign in with Discord");
      }), y("click", _e, w), v(Y, _e);
    };
    M(et, (Y) => {
      e(i) ? Y(Fe) : Y(ft, -1);
    });
  }
  var rt = n(st, 2), ct = n(l(rt), 2), ze = n(l(ct)), nt = l(ze);
  {
    var pt = (Y) => {
      var _e = n_(), xt = n(we(_e)), Bt = C(xt, !0);
      L(() => T(Bt, e(r).login || "you")), v(Y, _e);
    }, Le = (Y) => {
      var _e = za("Sign in to publish your own modules from Customise. SteamLite only asks to create and change Gists.");
      v(Y, _e);
    };
    M(nt, (Y) => {
      e(r).signedIn ? Y(pt) : Y(Le, -1);
    });
  }
  var St = n(ct, 2);
  {
    var Ft = (Y) => {
      var _e = i_();
      y("click", _e, se), v(Y, _e);
    }, Nt = (Y) => {
      var _e = l_();
      y("click", _e, te), v(Y, _e);
    };
    M(St, (Y) => {
      e(r).signedIn ? Y(Ft) : Y(Nt, -1);
    });
  }
  var Vt = n(Ze, 4), K = l(Vt), Ce = n(l(K)), Pe = l(Ce);
  oe(Pe, { name: "folder", size: 17 });
  var qe = n(U, 2);
  {
    var ot = (Y) => {
      var _e = ml(), xt = l(_e), Bt = l(xt);
      {
        var Ot = (Ht) => {
          var Pt = o_(), Yt = n(we(Pt), 5), ea = l(Yt), sa = n(ea);
          y("click", ea, $), y("click", sa, () => ve("app:openUrl", e(H).url)), v(Ht, Pt);
        }, Gt = (Ht) => {
          var Pt = v_(), Yt = n(we(Pt)), ea = C(Yt, !0), sa = n(Yt), ba = l(sa), Na = n(ba);
          L(() => T(ea, e(H).err)), y("click", ba, $), y("click", Na, () => {
            g(H, null), w();
          }), v(Ht, Pt);
        };
        M(Bt, (Ht) => {
          e(H).step === "wait" ? Ht(Ot) : Ht(Gt, -1);
        });
      }
      y("click", _e, $), y("click", xt, (Ht) => Ht.stopPropagation()), y("keydown", xt, () => {
      }), v(Y, _e);
    };
    M(qe, (Y) => {
      e(H) && Y(ot);
    });
  }
  var At = n(qe, 2);
  {
    var It = (Y) => {
      var _e = c_(), xt = l(_e), Bt = n(l(xt), 3), Ot = l(Bt), Gt = n(Ot);
      y("click", _e, () => g(f, !1)), y("click", xt, (Ht) => Ht.stopPropagation()), y("keydown", xt, () => {
      }), y("click", Ot, () => g(f, !1)), y("click", Gt, O), v(Y, _e);
    };
    M(At, (Y) => {
      e(f) && Y(It);
    });
  }
  var ra = n(At, 2);
  {
    var Jt = (Y) => {
      var _e = ml(), xt = l(_e), Bt = l(xt);
      {
        var Ot = (Pt) => {
          var Yt = d_();
          v(Pt, Yt);
        }, Gt = (Pt) => {
          var Yt = u_(), ea = n(we(Yt), 3), sa = C(ea, !0), ba = n(ea), Na = l(ba), Ka = n(Na);
          L(() => T(sa, e(u).code)), y("click", Na, he), y("click", Ka, () => ve("app:openUrl", e(u).uri)), v(Pt, Yt);
        }, Ht = (Pt) => {
          var Yt = f_(), ea = n(we(Yt)), sa = C(ea, !0), ba = n(ea), Na = C(ba);
          L(() => T(sa, e(u).err)), y("click", Na, he), v(Pt, Yt);
        };
        M(Bt, (Pt) => {
          e(u).step === "work" ? Pt(Ot) : e(u).step === "code" ? Pt(Gt, 1) : Pt(Ht, -1);
        });
      }
      y("click", _e, he), y("click", xt, (Pt) => Pt.stopPropagation()), y("keydown", xt, () => {
      }), v(Y, _e);
    };
    M(ra, (Y) => {
      e(u) && Y(Jt);
    });
  }
  L(() => {
    Se = je(ye, 1, "dot svelte-11w59y9", null, Se, { off: e(s) && e(s).offline }), T(Ye, c.look && c.look.name || e(s) && e(s).name || e(p) && e(p).name || "You"), T(J, `Steam ID ${(e(p) && e(p).steamId || e(s) && e(s).steamid || "") ?? ""}`), X = je(D, 1, "pill svelte-11w59y9", null, X, { ok: e(s) && e(s).linked }), T(fe, e(s) && e(s).linked ? "SteamLite account linked" : e(s) && e(s).offline ? "SteamLite is offline" : "Not linked yet"), Ke = je(jt, 1, "svelte-11w59y9", null, Ke, { off: !e(i) || !e(k) });
  }), y("click", R, x), y("click", be, () => Da("profile")), y("click", Ie, () => c.addAccount = !0), y("click", Ge, () => g(f, !0)), y("click", wt, x), y("click", Ce, () => ve("app:openDataFolder")), v(t, de), Lt();
}
Wt(["click", "keydown"]);
var m_ = /* @__PURE__ */ h('<div class="frost svelte-153cihh" aria-hidden="true"></div>'), g_ = /* @__PURE__ */ h('<div class="boot svelte-153cihh"><img src="/icon.png" alt="" class="svelte-153cihh"/></div>'), __ = /* @__PURE__ */ h('<main class="solo svelte-153cihh"><!></main>'), b_ = /* @__PURE__ */ h('<div class="view svelte-153cihh"><!></div>'), y_ = /* @__PURE__ */ h('<!> <main class="svelte-153cihh"><div class="stretch svelte-153cihh"><!> <!></div></main>', 1), w_ = /* @__PURE__ */ h("<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>", 1);
function k_(t, a) {
  Tt(a, !0), $t(() => {
    document.documentElement.dataset.gaming = c.running && c.settings.gameLite !== !1 ? "1" : "";
  });
  function s() {
    document.documentElement.dataset.idle = document.documentElement.dataset.gaming === "1" && (document.hidden || !document.hasFocus()) ? "1" : "";
  }
  $t(() => {
    c.running, c.settings.gameLite, s();
  });
  let r = /* @__PURE__ */ G(!1), i = !1;
  $t(() => {
    !i && c.ready && c.signedIn && !c.migrate && !e(d) && !c.onboard && !c.whatsNew && !c.themeNotice && !c.ui.showcase && (i = !0, setTimeout(() => g(r, !0), 600));
  });
  const o = () => {
    g(r, !1), c.ui.showcase || or({ showcase: "1" });
  };
  oa(() => {
    const D = () => g(r, !0);
    return addEventListener("sl-showcase", D), () => removeEventListener("sl-showcase", D);
  });
  let d = /* @__PURE__ */ G(
    !0
    // the opening screen: three seconds
  );
  function f(D) {
    const X = D.target, fe = X && (X.tagName === "INPUT" || X.tagName === "TEXTAREA" || X.isContentEditable);
    if (!c.ready || !c.signedIn || c.migrate || c.addAccount || c.confirmClose || document.querySelector('[role="dialog"]')) return;
    const Z = (D.ctrlKey || D.metaKey) && !D.altKey && D.key.toLowerCase() === "f", W = D.key === "/" && !fe && !D.ctrlKey && !D.metaKey && !D.altKey;
    (Z || W) && (D.preventDefault(), c.focusSearch = !0, c.view !== "library" && Da("library"));
  }
  oa(() => (Kd(), dd().catch((D) => console.error(D)), addEventListener("keydown", f), document.addEventListener(
    "click",
    (D) => {
      const X = D.target.closest && D.target.closest("button, .chip");
      X && !X.disabled && !X.closest("nav, .gc") && Cs.click();
    },
    !0
  ), addEventListener("focus", s), addEventListener("blur", s), document.addEventListener("visibilitychange", s), () => {
    removeEventListener("keydown", f), removeEventListener("focus", s), removeEventListener("blur", s), document.removeEventListener("visibilitychange", s);
  }));
  const u = () => ({
    left: innerWidth / 2 - 160,
    top: innerHeight / 2 - 50,
    width: 320,
    height: 100
  }), m = {
    home: nl,
    library: y1,
    game: W1,
    news: Sh,
    profile: fp,
    stats: zp,
    player: $p,
    customise: eg,
    settings: Yg,
    account: p_
  }, p = /* @__PURE__ */ P(() => m[c.view] || nl);
  $t(() => {
    c.ready && c.settings.splash === !1 && e(d) && g(d, !1);
  }), $t(() => {
    c.view !== "home" && c.view !== "game" && Bd();
  }), $t(() => {
    c.ready && ["home", "library", "news", "stats", "settings"].includes(c.view) && c.ui.page !== c.view && or({ page: c.view });
  }), $t(() => {
    const D = c.view, X = c.gameId;
    c.ready && c.settings.discord && ve("presence:page", { view: D, gameId: X }).catch(() => {
    });
  }), $t(() => {
    c.view, c.gameId, c.friendsOpen = !1;
  });
  let _ = !1;
  function k() {
    const D = sd(5);
    if (D) {
      if (D.everyLaunch) {
        _ || (_ = !0, c.themeNotice = D);
        return;
      }
      String(c.ui.themeNotice || "").split(",").includes(D.id) || (c.themeNotice = D);
    }
  }
  $t(() => {
    if (c.ready && c.signedIn && !c.migrate && !e(d) && !c.onboard && !c.whatsNew && !c.themeNotice) {
      k();
      const D = setInterval(k, 36e5);
      return window.addEventListener("focus", k), () => {
        clearInterval(D), window.removeEventListener("focus", k);
      };
    }
  });
  let b;
  $t(() => {
    c.view, c.gameId, c.player, b && (b.dispatchEvent(new Event("sl-reset")), b.scrollTop = 0);
  });
  var S = w_(), E = we(S);
  {
    var z = (D) => {
      pg(D, {});
    };
    M(E, (D) => {
      c.friendsOpen && c.signedIn && !c.migrate && D(z);
    });
  }
  var x = n(E, 2);
  {
    var A = (D) => {
      Tg(D, {});
    };
    M(x, (D) => {
      c.live.theme === "xmas" && c.live.snow && c.signedIn && !c.migrate && D(A);
    });
  }
  var j = n(x, 2);
  {
    var O = (D) => {
      var X = m_();
      v(D, X);
    };
    M(j, (D) => {
      !e(d) && c.ready && c.signedIn && !c.migrate && D(O);
    });
  }
  var H = n(j, 2);
  {
    let D = /* @__PURE__ */ P(() => !e(d) && c.ready && c.signedIn && !c.migrate);
    iu(H, {
      get showMe() {
        return e(D);
      }
    });
  }
  var I = n(H, 2);
  {
    var w = (D) => {
      Pu(D, { duration: 2500, ondone: () => g(d, !1) });
    }, $ = (D) => {
      var X = g_();
      bt(2, X, () => ha, () => ({ duration: 300 })), v(D, X);
    }, B = (D) => {
      var X = __(), fe = l(X);
      ff(fe, {}), bt(1, X, () => ha, () => ({ duration: 500 })), v(D, X);
    }, te = (D) => {
      var X = y_(), fe = we(X);
      fu(fe, {});
      var Z = n(fe, 2), W = l(Z), ee = l(W);
      df(ee, {});
      var pe = n(ee, 2);
      is(pe, () => c.view + (c.gameId || ""), (R) => {
        var ge = b_(), be = l(ge);
        Cc(be, () => e(p), (N, ae) => {
          ae(N, {});
        }), bt(1, ge, () => Do), v(R, ge);
      }), _a(Z, (R) => b = R, () => b), zt(Z, (R) => No?.(R)), v(D, X);
    };
    M(I, (D) => {
      e(d) ? D(w) : c.ready ? !c.signedIn || c.migrate ? D(B, 2) : D(te, -1) : D($, 1);
    });
  }
  var he = n(I, 2);
  {
    var se = (D) => {
      Uu(D, {});
    };
    M(he, (D) => {
      c.addAccount && c.signedIn && D(se);
    });
  }
  var de = n(he, 2);
  {
    var U = (D) => {
      nf(D, {});
    };
    M(de, (D) => {
      c.update && !c.updateHidden && c.signedIn && !c.migrate && D(U);
    });
  }
  var re = n(de, 2);
  {
    var ke = (D) => {
      Ku(D, {});
    };
    M(re, (D) => {
      c.confirmClose && D(ke);
    });
  }
  var F = n(re, 2);
  {
    var ne = (D) => {
      Sg(D, {
        get t() {
          return c.themeNotice;
        }
      });
    };
    M(F, (D) => {
      c.themeNotice && !c.onboard && !c.whatsNew && c.signedIn && !c.migrate && !e(d) && D(ne);
    });
  }
  var V = n(F, 2);
  {
    var ye = (D) => {
      bg(D, {});
    };
    M(V, (D) => {
      c.onboard && c.signedIn && !c.migrate && !e(d) && D(ye);
    });
  }
  var Se = n(V, 2);
  {
    var Re = (D) => {
      {
        let X = /* @__PURE__ */ P(() => ({
          title: "SteamLite " + c.whatsNew.to + " is installed",
          tag: "What's new",
          content: "You updated from " + c.whatsNew.from + ". Here is what changed.",
          release: c.whatsNew.tag,
          date: ""
        })), fe = /* @__PURE__ */ P(u);
        Co(D, {
          get item() {
            return e(X);
          },
          get rect() {
            return e(fe);
          },
          onclose: () => c.whatsNew = null
        });
      }
    };
    M(Se, (D) => {
      c.whatsNew && !e(d) && c.ready && c.signedIn && !c.migrate && D(Re);
    });
  }
  var $e = n(Se, 2);
  {
    var Ye = (D) => {
      Zd(D, {});
    };
    M($e, (D) => {
      c.applying && D(Ye);
    });
  }
  var ce = n($e, 2);
  {
    var J = (D) => {
      zu(D, { onclose: o });
    };
    M(ce, (D) => {
      e(r) && D(J);
    });
  }
  var q = n(ce, 2);
  ju(q, {}), v(t, S), Lt();
}
function x_() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let t = null;
  const a = (s) => {
    const r = s.target.closest && s.target.closest(".gc, .tc, .mc, .gcard");
    if (t && t !== r && (t.style.transform = "", t = null), !r) return;
    t = r;
    const i = r.getBoundingClientRect(), o = ((s.clientX - i.left) / i.width - 0.5) * 2, d = ((s.clientY - i.top) / i.height - 0.5) * 2;
    r.style.transform = "perspective(900px) rotateX(" + (-d * 5).toFixed(2) + "deg) rotateY(" + (o * 6).toFixed(2) + "deg) translateY(-4px) scale(1.018)";
  };
  addEventListener("pointermove", a, { passive: !0 }), document.addEventListener("pointerleave", () => {
    t && (t.style.transform = "", t = null);
  });
}
function M_(t) {
  return document.documentElement.dataset.ui = "27.1", x_(), kc(k_, { target: t });
}
export {
  M_ as start
};
