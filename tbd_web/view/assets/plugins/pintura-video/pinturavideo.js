/*!
* Pintura Video Extension v1.5.0 
* (c) 2018-2023 PQINA Inc. - All Rights Reserved
* License: https://pqina.nl/pintura/license/
*/
/* eslint-disable */
const xn = (e) => typeof e == "function";
let Gt = null;
const st = () => (Gt === null && (Gt = typeof window < "u" && typeof window.document < "u"), Gt), fn = (e) => st() ? RegExp(e).test(window.navigator.userAgent) : void 0;
let Xt = null;
const Jo = () => (Xt === null && (Xt = fn(/Android/)), Xt), $n = (e, t, n = []) => {
  const o = document.createElement(e), r = Object.getOwnPropertyDescriptors(o.__proto__);
  for (const i in t)
    i === "style" ? o.style.cssText = t[i] : r[i] && r[i].set || /textContent|innerHTML/.test(i) || typeof t[i] == "function" ? o[i] = t[i] : o.setAttribute(i, t[i]);
  return n.forEach((i) => o.appendChild(i)), o;
}, eo = (e) => {
  e.width = 1, e.height = 1;
  const t = e.getContext("2d");
  t && t.clearRect(0, 0, 1, 1);
}, Qo = (e, t = void 0, n = void 0) => new Promise((o, r) => {
  try {
    e.toBlob(
      (i) => {
        if (!i)
          return r(new Error("Failed to create blob"));
        o(i);
      },
      t,
      n
    );
  } catch (i) {
    r(i);
  }
}), Pn = "__pqina_webapi__", to = (e) => window[Pn] ? window[Pn][e] : window[e], Ce = (...e) => {
}, xo = {
  matroska: "mkv"
}, no = (e) => {
  const t = (e.match(/\/([a-z0-9]+)/) || [])[1];
  if (/^x/.test(t)) {
    const [, n = ""] = e.split("/x-");
    return xo[n];
  }
  return t;
}, $o = (e) => e.substr(0, e.lastIndexOf(".")) || e, er = (e) => e.split(".").pop(), tr = /avif|bmp|gif|jpg|jpeg|jpe|jif|jfif|png|svg|tiff|webp/, nr = (e) => tr.test(e) ? "image/" + (/jfif|jif|jpe|jpg/.test(e) ? "jpeg" : e === "svg" ? "svg+xml" : e) : "", or = (e) => e && nr(er(e).toLowerCase()), rr = (e, t) => {
  const n = or(e);
  if (n === t)
    return e;
  const o = no(t) || n;
  return `${$o(e)}.${o}`;
}, ir = (e, t, n) => {
  const o = (/* @__PURE__ */ new Date()).getTime(), r = e.type.length && !/null|text/.test(e.type), i = r ? e.type : n, s = rr(t, i);
  try {
    return new (to("File"))([e], s, {
      lastModified: o,
      type: r ? e.type : i
    });
  } catch {
    const u = r ? e.slice() : e.slice(0, e.size, i);
    return u.lastModified = o, u.name = s, u;
  }
}, En = (e) => e, Ve = (e, t = 12) => parseFloat(e.toFixed(t)), sr = () => Oe(0, 0), Oe = (e, t) => ({ x: e, y: t }), ar = (e) => Oe(e.width, e.height), Tn = (e) => Oe(e.x, e.y), lr = (e) => (e.x = -e.x, e.y = -e.y, e), oo = (e, t, n = sr()) => {
  const o = Math.cos(t), r = Math.sin(t), i = e.x - n.x, s = e.y - n.y;
  return e.x = n.x + o * i - r * s, e.y = n.y + r * i + o * s, e;
}, cr = (e, t) => (e.x = t(e.x), e.y = t(e.y), e), ur = (e, t) => (e.x += t.x, e.y += t.y, e), ro = (e, t) => (e.x -= t.x, e.y -= t.y, e), fr = (e, t) => ({ width: e, height: t }), dr = (e) => fr(e.width, e.height), mr = (e, t) => (e.width = t(e.width), e.height = t(e.height), e), It = (e, t, n, o) => ({
  x: e,
  y: t,
  width: n,
  height: o
}), io = (e) => It(0, 0, e.width, e.height), hr = (e) => It(e.x || 0, e.y || 0, e.width || 0, e.height || 0), so = (e) => {
  let t = e[0].x, n = e[0].x, o = e[0].y, r = e[0].y;
  return e.forEach((i) => {
    t = Math.min(t, i.x), n = Math.max(n, i.x), o = Math.min(o, i.y), r = Math.max(r, i.y);
  }), It(t, o, n - t, r - o);
}, gr = (e, t, n, o) => It(e, t, n, o), tt = (e) => Oe(e.x + e.width * 0.5, e.y + e.height * 0.5), ao = (e, t, n) => (n || (n = tt(e)), pr(e).map((o) => oo(o, t, n))), pr = (e) => [
  Oe(e.x, e.y),
  Oe(e.x + e.width, e.y),
  Oe(e.x + e.width, e.y + e.height),
  Oe(e.x, e.y + e.height)
], _r = (e) => (e.x = 0, e.y = 0, e), At = (e) => typeof e == "string";
st() && Node.prototype.replaceChildren;
st() && $n("div", {
  class: "PinturaMeasure",
  style: "position:absolute;left:0;top:0;width:99999px;height:0;pointer-events:none;contain:strict;margin:0;padding:0;"
});
const Cn = (e = 0, t = !0) => new (to("ProgressEvent"))("progress", {
  loaded: e * 100,
  total: 100,
  lengthComputable: t
}), yr = (e, t) => {
  const { headers: n = {}, credentials: o } = t || {};
  Object.entries(n).forEach(
    ([r, i]) => e.setRequestHeader(r, i)
  ), o && (e.withCredentials = o !== "omit");
};
let Zt = null;
const lo = () => (Zt === null && (Zt = st() && /^mac/i.test(navigator.platform)), Zt);
let Yt = null;
const $t = () => (Yt === null && (Yt = st() && (fn(/iPhone|iPad|iPod/) || lo() && navigator.maxTouchPoints >= 1)), Yt), wr = (e) => typeof e == "object" && e.constructor == Object, br = (e) => wr(e) ? JSON.stringify(e) : e, Mr = (e, t, n) => new Promise((o, r) => {
  const { token: i = {}, beforeSend: s = Ce, onprogress: c = Ce } = n;
  i.cancel = () => u.abort();
  const u = new XMLHttpRequest();
  u.upload.onprogress = c, u.onload = () => u.status >= 200 && u.status < 300 ? o(u) : r(u), u.onerror = () => r(u), u.ontimeout = () => r(u), u.open("POST", encodeURI(e)), s(u), u.send(
    // if is FormData, we use that
    t instanceof FormData ? t : (
      // reduce the dataset to FormData
      t.reduce((l, f) => (l.append(...f.map(br)), l), new FormData())
    )
  );
}), dt = (e) => typeof e == "number", vr = (e) => Array.isArray(e);
let Jt = null;
const Dt = () => (Jt === null && (Jt = fn(/Firefox/)), Jt), Sr = (e, t) => {
  const n = new Array(20);
  return n[0] = e[0] * t[0] + e[1] * t[5] + e[2] * t[10] + e[3] * t[15], n[1] = e[0] * t[1] + e[1] * t[6] + e[2] * t[11] + e[3] * t[16], n[2] = e[0] * t[2] + e[1] * t[7] + e[2] * t[12] + e[3] * t[17], n[3] = e[0] * t[3] + e[1] * t[8] + e[2] * t[13] + e[3] * t[18], n[4] = e[0] * t[4] + e[1] * t[9] + e[2] * t[14] + e[3] * t[19] + e[4], n[5] = e[5] * t[0] + e[6] * t[5] + e[7] * t[10] + e[8] * t[15], n[6] = e[5] * t[1] + e[6] * t[6] + e[7] * t[11] + e[8] * t[16], n[7] = e[5] * t[2] + e[6] * t[7] + e[7] * t[12] + e[8] * t[17], n[8] = e[5] * t[3] + e[6] * t[8] + e[7] * t[13] + e[8] * t[18], n[9] = e[5] * t[4] + e[6] * t[9] + e[7] * t[14] + e[8] * t[19] + e[9], n[10] = e[10] * t[0] + e[11] * t[5] + e[12] * t[10] + e[13] * t[15], n[11] = e[10] * t[1] + e[11] * t[6] + e[12] * t[11] + e[13] * t[16], n[12] = e[10] * t[2] + e[11] * t[7] + e[12] * t[12] + e[13] * t[17], n[13] = e[10] * t[3] + e[11] * t[8] + e[12] * t[13] + e[13] * t[18], n[14] = e[10] * t[4] + e[11] * t[9] + e[12] * t[14] + e[13] * t[19] + e[14], n[15] = e[15] * t[0] + e[16] * t[5] + e[17] * t[10] + e[18] * t[15], n[16] = e[15] * t[1] + e[16] * t[6] + e[17] * t[11] + e[18] * t[16], n[17] = e[15] * t[2] + e[16] * t[7] + e[17] * t[12] + e[18] * t[17], n[18] = e[15] * t[3] + e[16] * t[8] + e[17] * t[13] + e[18] * t[18], n[19] = e[15] * t[4] + e[16] * t[9] + e[17] * t[14] + e[18] * t[19] + e[19], n;
}, kr = (e) => e.length ? e.reduce(
  (t, n) => Sr([...t], n),
  e.shift()
) : [];
function ne() {
}
function mt(e, t) {
  for (const n in t)
    e[n] = t[n];
  return e;
}
function co(e) {
  return e();
}
function Rn() {
  return /* @__PURE__ */ Object.create(null);
}
function we(e) {
  e.forEach(co);
}
function Re(e) {
  return typeof e == "function";
}
function Pe(e, t) {
  return e != e ? t == t : e !== t || e && typeof e == "object" || typeof e == "function";
}
function Pr(e) {
  return Object.keys(e).length === 0;
}
function Lt(e, ...t) {
  if (e == null)
    return ne;
  const n = e.subscribe(...t);
  return n.unsubscribe ? () => n.unsubscribe() : n;
}
function le(e, t, n) {
  e.$$.on_destroy.push(Lt(t, n));
}
function je(e, t, n, o) {
  if (e) {
    const r = uo(e, t, n, o);
    return e[0](r);
  }
}
function uo(e, t, n, o) {
  return e[1] && o ? mt(n.ctx.slice(), e[1](o(t))) : n.ctx;
}
function Ke(e, t, n, o) {
  if (e[2] && o) {
    const r = e[2](o(n));
    if (t.dirty === void 0)
      return r;
    if (typeof r == "object") {
      const i = [], s = Math.max(t.dirty.length, r.length);
      for (let c = 0; c < s; c += 1)
        i[c] = t.dirty[c] | r[c];
      return i;
    }
    return t.dirty | r;
  }
  return t.dirty;
}
function Ne(e, t, n, o, r, i) {
  if (r) {
    const s = uo(t, n, o, i);
    e.p(s, r);
  }
}
function He(e) {
  if (e.ctx.length > 32) {
    const t = [], n = e.ctx.length / 32;
    for (let o = 0; o < n; o++)
      t[o] = -1;
    return t;
  }
  return -1;
}
function Fn(e) {
  const t = {};
  for (const n in e)
    n[0] !== "$" && (t[n] = e[n]);
  return t;
}
function qe(e) {
  return e && Re(e.destroy) ? e.destroy : ne;
}
const Er = typeof window < "u";
let fo = Er ? (e) => requestAnimationFrame(e) : ne;
const nt = /* @__PURE__ */ new Set();
function mo(e) {
  nt.forEach((t) => {
    t.c(e) || (nt.delete(t), t.f());
  }), nt.size !== 0 && fo(mo);
}
function Tr(e) {
  let t;
  return nt.size === 0 && fo(mo), {
    promise: new Promise((n) => {
      nt.add(t = { c: e, f: n });
    }),
    abort() {
      nt.delete(t);
    }
  };
}
const ho = typeof window < "u" ? window : typeof globalThis < "u" ? globalThis : global;
"WeakMap" in ho;
function G(e, t) {
  e.appendChild(t);
}
function J(e, t, n) {
  e.insertBefore(t, n || null);
}
function Y(e) {
  e.parentNode && e.parentNode.removeChild(e);
}
function go(e, t) {
  for (let n = 0; n < e.length; n += 1)
    e[n] && e[n].d(t);
}
function X(e) {
  return document.createElement(e);
}
function pt(e) {
  return document.createElementNS("http://www.w3.org/2000/svg", e);
}
function ht(e) {
  return document.createTextNode(e);
}
function ae() {
  return ht(" ");
}
function po() {
  return ht("");
}
function de(e, t, n, o) {
  return e.addEventListener(t, n, o), () => e.removeEventListener(t, n, o);
}
function y(e, t, n) {
  n == null ? e.removeAttribute(t) : e.getAttribute(t) !== n && e.setAttribute(t, n);
}
function Cr(e) {
  return Array.from(e.childNodes);
}
function en(e, t) {
  t = "" + t, e.data !== t && (e.data = t);
}
function Rr(e, t, { bubbles: n = !1, cancelable: o = !1 } = {}) {
  const r = document.createEvent("CustomEvent");
  return r.initCustomEvent(e, n, o, t), r;
}
class Fr {
  constructor(t = !1) {
    this.is_svg = !1, this.is_svg = t, this.e = this.n = null;
  }
  c(t) {
    this.h(t);
  }
  m(t, n, o = null) {
    this.e || (this.is_svg ? this.e = pt(n.nodeName) : this.e = X(n.nodeType === 11 ? "TEMPLATE" : n.nodeName), this.t = n.tagName !== "TEMPLATE" ? n : n.content, this.c(t)), this.i(o);
  }
  h(t) {
    this.e.innerHTML = t, this.n = Array.from(this.e.nodeName === "TEMPLATE" ? this.e.content.childNodes : this.e.childNodes);
  }
  i(t) {
    for (let n = 0; n < this.n.length; n += 1)
      J(this.t, this.n[n], t);
  }
  p(t) {
    this.d(), this.h(t), this.i(this.a);
  }
  d() {
    this.n.forEach(Y);
  }
}
let gt;
function ft(e) {
  gt = e;
}
function dn() {
  if (!gt)
    throw new Error("Function called outside component initialization");
  return gt;
}
function Ar(e) {
  dn().$$.on_mount.push(e);
}
function Lr() {
  const e = dn();
  return (t, n, { cancelable: o = !1 } = {}) => {
    const r = e.$$.callbacks[t];
    if (r) {
      const i = Rr(t, n, { cancelable: o });
      return r.slice().forEach((s) => {
        s.call(e, i);
      }), !i.defaultPrevented;
    }
    return !0;
  };
}
function _t(e) {
  return dn().$$.context.get(e);
}
function mn(e, t) {
  const n = e.$$.callbacks[t.type];
  n && n.slice().forEach((o) => o.call(this, t));
}
const et = [], ze = [];
let ot = [];
const tn = [], Br = /* @__PURE__ */ Promise.resolve();
let nn = !1;
function Ir() {
  nn || (nn = !0, Br.then(Ge));
}
function on(e) {
  ot.push(e);
}
function Dr(e) {
  tn.push(e);
}
const Qt = /* @__PURE__ */ new Set();
let xe = 0;
function Ge() {
  if (xe !== 0)
    return;
  const e = gt;
  do {
    try {
      for (; xe < et.length; ) {
        const t = et[xe];
        xe++, ft(t), Or(t.$$);
      }
    } catch (t) {
      throw et.length = 0, xe = 0, t;
    }
    for (ft(null), et.length = 0, xe = 0; ze.length; )
      ze.pop()();
    for (let t = 0; t < ot.length; t += 1) {
      const n = ot[t];
      Qt.has(n) || (Qt.add(n), n());
    }
    ot.length = 0;
  } while (et.length);
  for (; tn.length; )
    tn.pop()();
  nn = !1, Qt.clear(), ft(e);
}
function Or(e) {
  if (e.fragment !== null) {
    e.update(), we(e.before_update);
    const t = e.dirty;
    e.dirty = [-1], e.fragment && e.fragment.p(e.ctx, t), e.after_update.forEach(on);
  }
}
function zr(e) {
  const t = [], n = [];
  ot.forEach((o) => e.indexOf(o) === -1 ? t.push(o) : n.push(o)), n.forEach((o) => o()), ot = t;
}
const Ft = /* @__PURE__ */ new Set();
let Xe;
function rt() {
  Xe = {
    r: 0,
    c: [],
    p: Xe
    // parent group
  };
}
function it() {
  Xe.r || we(Xe.c), Xe = Xe.p;
}
function j(e, t) {
  e && e.i && (Ft.delete(e), e.i(t));
}
function W(e, t, n, o) {
  if (e && e.o) {
    if (Ft.has(e))
      return;
    Ft.add(e), Xe.c.push(() => {
      Ft.delete(e), o && (n && e.d(1), o());
    }), e.o(t);
  } else
    o && o();
}
function An(e, t) {
  const n = {}, o = {}, r = { $$scope: 1 };
  let i = e.length;
  for (; i--; ) {
    const s = e[i], c = t[i];
    if (c) {
      for (const u in s)
        u in c || (o[u] = 1);
      for (const u in c)
        r[u] || (n[u] = c[u], r[u] = 1);
      e[i] = c;
    } else
      for (const u in s)
        r[u] = 1;
  }
  for (const s in o)
    s in n || (n[s] = void 0);
  return n;
}
function Rt(e) {
  return typeof e == "object" && e !== null ? e : {};
}
const Ur = [
  "allowfullscreen",
  "allowpaymentrequest",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "defer",
  "disabled",
  "formnovalidate",
  "hidden",
  "inert",
  "ismap",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "selected"
];
[...Ur];
function Vr(e, t, n) {
  const o = e.$$.props[t];
  o !== void 0 && (e.$$.bound[o] = n, n(e.$$.ctx[o]));
}
function he(e) {
  e && e.c();
}
function ue(e, t, n, o) {
  const { fragment: r, after_update: i } = e.$$;
  r && r.m(t, n), o || on(() => {
    const s = e.$$.on_mount.map(co).filter(Re);
    e.$$.on_destroy ? e.$$.on_destroy.push(...s) : we(s), e.$$.on_mount = [];
  }), i.forEach(on);
}
function fe(e, t) {
  const n = e.$$;
  n.fragment !== null && (zr(n.after_update), we(n.on_destroy), n.fragment && n.fragment.d(t), n.on_destroy = n.fragment = null, n.ctx = []);
}
function jr(e, t) {
  e.$$.dirty[0] === -1 && (et.push(e), Ir(), e.$$.dirty.fill(0)), e.$$.dirty[t / 31 | 0] |= 1 << t % 31;
}
function Fe(e, t, n, o, r, i, s, c = [-1]) {
  const u = gt;
  ft(e);
  const l = e.$$ = {
    fragment: null,
    ctx: [],
    // state
    props: i,
    update: ne,
    not_equal: r,
    bound: Rn(),
    // lifecycle
    on_mount: [],
    on_destroy: [],
    on_disconnect: [],
    before_update: [],
    after_update: [],
    context: new Map(t.context || (u ? u.$$.context : [])),
    // everything else
    callbacks: Rn(),
    dirty: c,
    skip_bound: !1,
    root: t.target || u.$$.root
  };
  s && s(l.root);
  let f = !1;
  if (l.ctx = n ? n(e, t.props || {}, (d, v, ...h) => {
    const w = h.length ? h[0] : v;
    return l.ctx && r(l.ctx[d], l.ctx[d] = w) && (!l.skip_bound && l.bound[d] && l.bound[d](w), f && jr(e, d)), v;
  }) : [], l.update(), f = !0, we(l.before_update), l.fragment = o ? o(l.ctx) : !1, t.target) {
    if (t.hydrate) {
      const d = Cr(t.target);
      l.fragment && l.fragment.l(d), d.forEach(Y);
    } else
      l.fragment && l.fragment.c();
    t.intro && j(e.$$.fragment), ue(e, t.target, t.anchor, t.customElement), Ge();
  }
  ft(u);
}
class Ae {
  $destroy() {
    fe(this, 1), this.$destroy = ne;
  }
  $on(t, n) {
    if (!Re(n))
      return ne;
    const o = this.$$.callbacks[t] || (this.$$.callbacks[t] = []);
    return o.push(n), () => {
      const r = o.indexOf(n);
      r !== -1 && o.splice(r, 1);
    };
  }
  $set(t) {
    this.$$set && !Pr(t) && (this.$$.skip_bound = !0, this.$$set(t), this.$$.skip_bound = !1);
  }
}
const $e = [];
function Kr(e, t) {
  return {
    subscribe: _o(e, t).subscribe
  };
}
function _o(e, t = ne) {
  let n;
  const o = /* @__PURE__ */ new Set();
  function r(c) {
    if (Pe(e, c) && (e = c, n)) {
      const u = !$e.length;
      for (const l of o)
        l[1](), $e.push(l, e);
      if (u) {
        for (let l = 0; l < $e.length; l += 2)
          $e[l][0]($e[l + 1]);
        $e.length = 0;
      }
    }
  }
  function i(c) {
    r(c(e));
  }
  function s(c, u = ne) {
    const l = [c, u];
    return o.add(l), o.size === 1 && (n = t(r) || ne), c(e), () => {
      o.delete(l), o.size === 0 && n && (n(), n = null);
    };
  }
  return { set: r, update: i, subscribe: s };
}
function Nr(e, t, n) {
  const o = !Array.isArray(e), r = o ? [e] : e, i = t.length < 2;
  return Kr(n, (s) => {
    let c = !1;
    const u = [];
    let l = 0, f = ne;
    const d = () => {
      if (l)
        return;
      f();
      const h = t(o ? u[0] : u, s);
      i ? s(h) : f = Re(h) ? h : ne;
    }, v = r.map((h, w) => Lt(h, (p) => {
      u[w] = p, l &= ~(1 << w), c && d();
    }, () => {
      l |= 1 << w;
    }));
    return c = !0, d(), function() {
      we(v), f(), c = !1;
    };
  });
}
const Hr = (e, t, n) => {
  const o = io(e), r = tt(o), i = ao(o, n, r), s = tt(
    _r(so(i))
  ), c = tt(t), u = oo(
    c,
    -n,
    s
  ), l = ro(
    u,
    s
  ), f = cr(
    ur(r, l),
    Ve
  );
  return gr(
    f.x - t.width * 0.5,
    f.y - t.height * 0.5,
    t.width,
    t.height
  );
}, Bt = (e, t, n) => Math.max(t, Math.min(e, n)), hn = (e, t = (...o) => o, n) => async (o, r, i) => {
  i(Cn(0, !1));
  let s = !1;
  const c = await e(
    ...t(o, r, (u) => {
      s = !0, i(u);
    })
  );
  return n && n(o, c), s || i(Cn(1, !1)), o;
}, qr = ({
  renameFile: e = void 0,
  srcBlob: t = "blob",
  srcFile: n = "src",
  destFile: o = "dest",
  defaultFilename: r = void 0
} = {}) => [
  hn(
    ir,
    (i) => [
      i[t],
      e ? e(i[n]) : i[n].name || `${r}.${no(i[t].type)}`
    ],
    (i, s) => i[o] = s
  ),
  "blob-to-file"
], Ln = ({
  url: e = "./",
  dataset: t = (i) => [
    ["dest", i.dest, i.dest.name],
    ["imageState", i.imageState]
  ],
  destStore: n = "store",
  credentials: o,
  headers: r = {}
}) => [
  hn(
    // upload function
    async (i, s) => await Mr(e, i, {
      onprogress: s,
      beforeSend: (c) => yr(c, { headers: r, credentials: o })
    }),
    // get state values
    (i, s, c) => [
      t(i),
      c
    ],
    // set state values
    (i, s) => i[n] = s
    // logs XHR request returned by `post`
  ),
  "store"
], Wr = (e) => [
  hn((t) => (!e || !e.length || Object.keys(t).forEach((n) => {
    e.includes(n) || delete t[n];
  }), t)),
  "prop-filter"
], Gr = (e) => e && (At(e) ? (
  // a basic store to post to
  Ln({ url: e })
) : (
  // see if is fully custom or store config
  xn(e) ? (
    // fully custom store function
    [e, "store"]
  ) : (
    // a store configuration object
    Ln(e)
  )
)), ns = (e) => (t, n, o = {}) => {
  const {
    encoder: r = void 0,
    renameFile: i = void 0,
    store: s = void 0,
    targetSize: c = void 0,
    outputProps: u = ["src", "dest", "imageState", "store"],
    filter: l = void 0
  } = { ...o, ...e };
  if (/video/.test(t.type)) {
    if (r === void 0) {
      console.warn("No encoder supplied.");
      return;
    }
    if (!(xn(l) && !l(t, n)))
      return [
        // encode video
        [
          r({
            targetSize: c
          }),
          "encode-video"
        ],
        // convert to file
        qr({ defaultFilename: "video", renameFile: i }),
        // store video
        Gr(s),
        // remove unwanted props
        Wr(u)
      ].filter(Boolean);
  }
}, gn = (e) => !!e.mozHasAudio || !!e.webkitAudioDecodedByteCount || !!(e.audioTracks && e.audioTracks.length), Xr = (e, t) => e[(e.captureStream ? "c" : "mozC") + "aptureStream"](t), Zr = [
  // prefer mp4
  "video/mp4;codecs=avc1,aac",
  "video/mp4;codecs=avc,aac",
  "video/mp4;codecs=mp4a,aac",
  "video/mp4;codecs=h264,aac",
  "video/mp4",
  // webm usually possible
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm;codecs=h264,opus",
  "video/webm",
  // matroska for Linux
  "video/x-matroska;codecs=avc1,opus",
  "video/x-matroska;codecs=vp9,opus",
  "video/x-matroska;codecs=vp8,opus",
  "video/x-matroska"
], Bn = (e, t) => {
  const n = e.createMediaStreamDestination();
  return e.createMediaElementSource(t).connect(n), n.stream;
}, Yr = (e, t, n, o, r) => new Promise((i, s) => {
  const {
    trim: c = [[0, 1]],
    volume: u,
    framesPerSecond: l = 24,
    mimeType: f,
    setupCanvas: d,
    prepareCanvas: v,
    updateCanvas: h,
    audioBitrate: w,
    videoBitrate: p,
    mimeTypes: b = Zr
  } = t, C = f || b.find((m) => MediaRecorder.isTypeSupported(m));
  let P, R = u === 0, M = !0, S = !1;
  o.cancel = () => {
    S = !0, r("cancelled"), i();
  };
  const L = new AudioContext();
  $t() && L.resume();
  let I = !1, E;
  const z = (m) => {
    if (!n)
      return;
    const _ = Math.round(m * 100);
    _ !== E && (E = _, n(
      new ProgressEvent("progress", {
        loaded: _,
        total: 100,
        lengthComputable: !0
      })
    ));
  };
  r("recordVideo", C), z(0);
  const D = () => {
    if (r("detectVideoReady", a.readyState), !S && !I) {
      if (a.readyState === 4) {
        M = gn(a), z(0.25), H();
        return;
      }
      setTimeout(D, 16);
    }
  }, B = (m, _) => new Promise((k) => {
    r("drawRange", m);
    let F = 0;
    const [O, q] = m, V = a.duration, K = Math.max(O, 0) * V, Z = Math.min(q, 1) * V, re = Z - K, ge = () => {
      if (S)
        return;
      const me = a.currentTime;
      if (r("draw", me), h(a), _(Math.min(1 - (Z - me) / re, 1)), F++, me >= Z) {
        r("draw calls", F), k();
        return;
      }
      requestAnimationFrame(ge);
    };
    ge();
  }), H = async () => {
    if (r("videoReady"), S)
      return;
    const m = d(a);
    r("captureVideo", !0);
    const k = [...Xr(m, l).getTracks()];
    if (r("captureAudio", M && !R), M && !R) {
      const K = Bn(L, a);
      k.push(...K.getTracks());
    } else {
      if (Dt()) {
        const K = Bn(L, a);
        k.push(
          ...K.getTracks().map((Z) => (Z.enabled = !1, Z))
        );
      }
      a.muted = !0;
    }
    r("create MediaStream");
    const F = new MediaStream(k.filter(Boolean)), O = M && !R ? w || 48e3 : 0, q = p || 384e3;
    r("create MediaRecorder"), P = new MediaRecorder(F, {
      mimeType: C,
      audioBitsPerSecond: O,
      videoBitsPerSecond: q
    });
    const V = [];
    P.ondataavailable = ({ data: K }) => {
      if (r("ondataavailable", K), K.size === 0 && V.every((Z) => Z.size === 0)) {
        S = !0, V.length = 0, P.stop();
        return;
      }
      V.push(K);
    }, P.onstop = () => {
      r("onstop"), eo(m);
      const K = a.src;
      if (a.src = "", URL.revokeObjectURL(K), z(1), !V.length)
        return s(new Error("No data received"));
      i(new Blob(V, { type: C.split(";")[0] }));
    }, await v(), oe();
  }, Q = (m, _) => new Promise((k, F) => {
    r("startRecording"), a.play().then(() => {
      r("startDrawing"), B(m, _).then(k).catch(F), P.state === "paused" ? P.resume() : P.start(500);
    }).catch(F);
  }), U = () => {
    r("pauseRecording"), a.pause(), P.state === "recording" && P.pause();
  }, N = () => {
    r("stopRecording"), a.pause(), P.stop();
  }, oe = async () => {
    const m = c.reduce((F, O) => {
      const [q, V] = O;
      return F + (V - q) * a.duration;
    }, 0);
    let _ = 0;
    r("record", m);
    const k = c.entries();
    for (const [F, O] of k) {
      const [q, V] = O, K = (V - q) * a.duration;
      try {
        await A(O, (Z) => {
          const re = _ + Z * K;
          z(0.25 + re / m * 0.75);
        });
      } catch (Z) {
        s(Z);
        return;
      }
      _ += K, F < c.length && U();
    }
    N();
  }, A = (m, _) => new Promise((k, F) => {
    r("recordRange", m);
    const [O] = m;
    a.onseeked = void 0;
    let q = !1;
    const V = () => {
      if (r("detectRangeReady", q), !S) {
        if (q) {
          K();
          return;
        }
        a.onseeked || (a.onseeked = () => q = !0, a.currentTime = a.duration * O), setTimeout(V, 16);
      }
    }, K = () => {
      r("rangeReady"), h(a), setTimeout(() => {
        Q(m, _).then(k).catch(F);
      }, 500);
    };
    V();
  });
  r("create video");
  const a = document.createElement("video");
  a.preload = "auto", a.onerror = (m) => {
    I = !0, s(m);
  }, a.src = URL.createObjectURL(e), a.playsInline = !0, a.load(), D();
}), yo = async (e) => {
  const t = await Jr(e), n = new DataView(t);
  return Qr(n);
}, Jr = (e) => new Promise((t) => {
  const n = new FileReader();
  n.onload = () => t(n.result), n.readAsArrayBuffer(e);
}), Qr = (e, { limit: t = 1024 } = {}) => {
  let s = 0;
  if (s += 4, e.getUint32(s) !== 1718909296 || (s += 4, e.getUint32(s) !== 1836069938))
    return 0;
  let l = !1, f = -1;
  for (let p = s; p < t; p++) {
    if (!l && e.getUint32(p) === 1953653099 && (l = !0, p += 4), !l)
      continue;
    if (e.getUint8(p) == 64) {
      f = p;
      break;
    }
  }
  if (f < 0)
    return 0;
  const d = e.getUint32(f - 28), v = e.getUint32(f - 20), h = e.getUint32(f - 32), w = e.getUint32(f - 16);
  return d === 65536 && v === 4294901760 ? 90 : h === 4294901760 && w === 4294901760 ? 180 : d === 4294901760 && v === 65536 ? 270 : 0;
}, os = (e) => (t) => async (n, o, r) => {
  const {
    imageStateToCanvas: i,
    framesPerSecond: s,
    audioBitrate: c,
    videoBitrate: u,
    mimeTypes: l,
    log: f = !1
  } = e || {};
  if (!i)
    throw new Error("createMediaStreamEncoder: imageStateToCanvas is a required parameter");
  const { src: d, imageState: v } = n, h = await (Dt() ? yo(d) : Promise.resolve()), { targetSize: w } = t || {};
  let p;
  const { taskCancelToken: b, shapePreprocessor: C } = o, P = (E) => (h && (E.dataset.rotation = `${h}`), p = i(E, v, { targetSize: w, shapePreprocessor: C }), p.canvas), R = () => p.redraw(), M = () => p.prepare(), { trim: S, volume: L } = v, I = Date.now();
  try {
    const E = await Yr(
      d,
      {
        trim: Array.isArray(S) && dt(S[0]) ? [S] : S,
        volume: L,
        targetSize: w,
        framesPerSecond: s,
        audioBitrate: c,
        videoBitrate: u,
        mimeTypes: l,
        setupCanvas: P,
        prepareCanvas: M,
        updateCanvas: R
      },
      r,
      b,
      f ? (...z) => console.log(Date.now() - I, ...z) : Ce
    );
    return {
      ...n,
      // this is picked up by BlobToFile
      blob: E
    };
  } catch (E) {
    throw console.error(E), new Error("createMediaStreamEncoder: error during video recording");
  }
}, wo = (e) => new Promise((t, n) => {
  const o = new FileReader();
  o.onerror = () => n(o.error), o.onload = () => t(o.result), o.readAsArrayBuffer(e);
}), In = async (e) => {
  const t = await wo(e);
  return new Uint8Array(t);
}, xr = (e, t) => new Promise((n, o) => {
  const r = document.createElement("script");
  r.onerror = () => o(new Error("Script error")), r.onload = () => n(t ? window[t] : void 0), r.src = e, document.head.append(r);
}), $r = (e, t, n) => new File([e], t, n), ei = (e, t) => {
  let n;
  return (o) => {
    if (!e)
      return;
    const [r, i] = t || [0, 1], s = i - r, c = r + s * o, u = Math.round(c * 100);
    u !== n && (n = u, e(
      new ProgressEvent("progress", {
        loaded: u,
        total: 100,
        lengthComputable: !0
      })
    ));
  };
}, ti = (e) => new Promise((t, n) => {
  const o = document.createElement("video");
  o.onerror = () => n(o.error), o.onloadeddata = () => {
    t({
      audio: gn(o),
      size: {
        width: o.videoWidth,
        height: o.videoHeight
      },
      duration: o.duration
    });
  }, o.preload = "auto", o.src = URL.createObjectURL(e), o.playsInline = !0, o.load();
}), ni = (e, t, n = !1) => new Promise((o, r) => {
  xr(
    // where to get the script
    e,
    // this is the global var
    "FFmpeg"
  ).then((i) => {
    const s = i.createFFmpeg({
      // where to get the core
      corePath: t,
      // log info to console
      log: n
    });
    o(s);
  }).catch(r);
}), rs = (e) => (t) => async (n, o, r) => {
  const {
    imageStateToCanvas: i,
    scriptPath: s,
    corePath: c,
    audioBitrate: u,
    videoBitrate: l,
    framesPerSecond: f,
    log: d
  } = e || {}, { shapePreprocessor: v, taskCancelToken: h } = o;
  let w = !1;
  h.cancel = () => {
    w = !0;
    try {
      z && z.exit();
    } catch (D) {
      d && console.log("ffmpeg cancelled", D);
    }
  };
  const p = Date.now(), { src: b, imageState: C } = n, { duration: P, size: R, audio: M } = await ti(b), S = C.volume === 0, L = M && !S;
  if (w)
    return;
  const { targetSize: I } = t || {};
  let E, z;
  try {
    if (z = await ni(s, c, d), w || (await z.load(), w))
      return;
    const D = ei(r);
    if (z.setProgress(({ ratio: A }) => {
      D(A);
    }), z.FS("writeFile", "src.mp4", await In(b)), w)
      return;
    const B = [];
    B.push("-i", "src.mp4");
    const H = [];
    if (C.annotation.length || C.decoration.length) {
      const { canvas: A, prepare: a } = i(
        $n("canvas", R),
        C,
        { shapePreprocessor: v, targetSize: I }
      );
      await a();
      const m = await Qo(A);
      if (z.FS("writeFile", "overlay.png", await In(m)), w)
        return;
      B.push("-i", "overlay.png"), H.push("overlay=0:0");
    }
    typeof f == "number" && B.push("-r", f), l && B.push(
      "-b:v",
      typeof l == "number" ? Math.round(l / 1e3) + "k" : l
    ), u && B.push(
      "-b:a",
      typeof u == "number" ? Math.round(u / 1e3) + "k" : u
    );
    const U = [];
    {
      const { flipX: A, flipY: a } = C;
      (A || a) && (A && U.push("hflip"), a && U.push("vflip"));
    }
    {
      const { rotation: A } = C;
      if (A) {
        const a = mr(
          dr(
            so(ao(hr(R), A))
          ),
          Math.floor
        );
        U.push(
          `rotate=${A}:ow=${a.width}:oh=${a.height}`
        );
      }
    }
    {
      const { crop: A } = C;
      A.x === 0 && A.y === 0 && A.width === R.width && A.height === R.height || U.push(`crop=${A.width}:${A.height}:${A.x}:${A.y}`);
    }
    if (I) {
      const { crop: A } = C, { fit: a = "contain", upscale: m = !1 } = I;
      let { width: _, height: k } = I;
      if (_ = _ % 2 === 0 ? _ : _ + 1, k = k % 2 === 0 ? k : k + 1, !m) {
        const F = Math.min(
          (_ || Number.MAX_SAFE_INTEGER) / A.width,
          (k || Number.MAX_SAFE_INTEGER) / A.height
        );
        F > 1 && (_ && (_ = Math.round(_ / F)), k && (k = Math.round(_ / F)));
      }
      _ && !k ? U.push(`scale=${_}:trunc(ow/a/2)*2`) : k && !_ ? U.push(`scale=trunc(oh/a/2)*2:${k}`) : _ && k && (a === "contain" ? U.push(
        `scale=${_}:${k}:force_original_aspect_ratio=decrease`
      ) : a === "cover" ? U.push(
        `scale=${_}:${k}:force_original_aspect_ratio=increase,setsar=1`
      ) : a === "force" && U.push(`scale=${_}:${k},setsar=1`));
    }
    {
      const { convolutionMatrix: A } = C;
      A && A.clarity && U.push(`convolution='${A.clarity.join(" ")}'`);
    }
    {
      const { gamma: A } = C;
      A > 0 && U.push(`eq=gamma=${A}:gamma_weight=0.85`);
    }
    {
      const A = Object.values(C.colorMatrix || {}).filter(Boolean);
      if (A.length) {
        const a = kr(A), m = [4, 9, 14, 19], _ = a, k = a.filter((V, K) => !m.includes(K)), [F, O, q] = [_[4] + _[3], _[9] + _[8], _[14] + _[13]];
        U.push(
          `colorchannelmixer=${k.join(":")}`,
          `lutrgb=r=val+(${F * 255}):g=val+(${O * 255}):b=val+(${q * 255})`
        );
      }
    }
    const { trim: N } = C;
    if (N) {
      const A = (Array.isArray(N) && dt(N[0]) ? [N] : N).map((V, K) => {
        const Z = V[0] * P, re = V[1] * P, ge = U.length ? `,${U.join(",")}` : "", me = `[0:v]trim=start=${Z}:end=${re},setpts=PTS-STARTPTS${ge}[${K}v];`, be = L ? `[0:a]atrim=start=${Z}:end=${re},asetpts=PTS-STARTPTS[${K}a];` : "";
        return me + be;
      }).join("");
      U.length = 0;
      const a = N.map((V, K) => `[${K}v]${L ? `[${K}a]` : ""}`).join(""), m = `n=${N.length}`, k = `${a}concat=v=1:${m}${L ? ":a=1" : ""}[video]${L ? "[audio]" : ""}`, F = `${A}${k}`, O = [], q = [];
      O.push(F), q.push("[video]"), H.length && O.push(`[video][1:v]${H}[video]`), B.push("-filter_complex", `${O.join(";")}`), q.forEach((V) => {
        B.push("-map", V);
      }), L && B.push("-map", "[audio]");
    } else {
      const A = [], a = [];
      U.length && (A.push(`[0:v]${U.join(",")}[video]`), a.push("[video]")), H.length && A.push(`[video][1:v]${H}[video]`), A.length && B.push("-filter_complex", `${A.join(";")}`), a.forEach((m) => {
        B.push("-map", m);
      }), L && B.push("-map", "0:a?");
    }
    B.push("dest.mp4"), d && console.log("ffmpeg arguments", B), E = B.join(" "), await z.run(...B);
    const oe = $r(z.FS("readFile", "dest.mp4"), b.name, {
      type: b.type
    });
    return d && console.log("ffmpeg time", (Date.now() - p) / 1e3), {
      ...n,
      // This is picked up by BlobToFile
      blob: oe
    };
  } catch (D) {
    throw console.log("ffplay " + E), /SharedArrayBuffer/.test(D.message) ? (console.error(D.message), console.error(
      `To enable SharedArrayBuffer your document needs to be in a secure context:
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer`
    )) : console.error(D), new Error("createFFmpegEncoder: error during video encoding");
  }
}, oi = {
  "video/webm": {
    muxer: {
      video: "V_VP9",
      audio: "A_OPUS"
    },
    encoder: {
      video: "vp09.00.10.08",
      audio: "opus"
    }
  },
  "video/mp4": {
    muxer: {
      video: "avc",
      audio: "aac"
    },
    encoder: {
      video: "avc1.640028",
      // this codec supports 1920x1080, avc1.42001f does not https://github.com/Vanilagy/mp4-muxer/issues/2
      audio: "mp4a.40.2"
    }
  }
}, is = (e) => {
  if (!("VideoEncoder" in window) || !("AudioEncoder" in window)) {
    console.warn("createMuxerEncoder: Browser doesn't support WebCodecs API");
    return;
  }
  return (t) => (n, o, r) => new Promise(async (i, s) => {
    const { src: c, imageState: u } = n, {
      muxer: l,
      mimeType: f,
      imageStateToCanvas: d,
      framesPerSecond: v = 24,
      audioSampleRate: h = 48e3,
      audioBitrate: w = 128e3,
      videoBitrate: p = 384e3,
      log: b
    } = e;
    if (b && console.log("Init video muxer"), !d)
      return s(
        new Error("createMuxerEncoder: imageStateToCanvas is a required parameter")
      );
    if (!f)
      return s(
        new Error("createMuxerEncoder: mimeType is a required parameter")
      );
    if (!l)
      return s(new Error("createMuxerEncoder: muxer is a required parameter"));
    const C = Date.now(), P = oi[f];
    if (!P)
      return s(
        new Error(
          "createMuxerEncoder: Invalid MimeType, needs to be either 'video/webm' or 'video/mp4'"
        )
      );
    const { Muxer: R, ArrayBufferTarget: M } = l, { targetSize: S } = t || {}, { taskCancelToken: L, shapePreprocessor: I } = o, { trim: E, volume: z } = u;
    let D = !1;
    L.cancel = () => {
      D = !0, b && console.log("Cancelled"), i({
        ...n,
        blob: void 0
      });
    };
    const B = Array.isArray(E) && dt(E[0]) ? [E] : E, H = z === 0;
    let Q;
    const U = (ee) => {
      if (!r)
        return;
      const te = Math.round(ee * 100);
      te !== Q && (Q = te, r(
        new ProgressEvent("progress", {
          loaded: te,
          total: 100,
          lengthComputable: !0
        })
      ));
    };
    U(0);
    let N;
    try {
      N = await ii(c);
    } catch (ee) {
      s(ee);
      return;
    }
    const oe = gn(N);
    U(0.1);
    const A = E.reduce((ee, [te, pe]) => ee + (pe - te) * N.duration, 0), a = 2;
    let m, _;
    if (oe && !H) {
      const ee = new AudioContext(), te = await wo(c), pe = await ee.decodeAudioData(te);
      if (D)
        return;
      const { sampleRate: ce, numberOfChannels: Me } = pe;
      m = Math.min(Me, a), b && console.log("Audio channels", m);
      const Ee = new Float32Array(
        Math.round(A * ce) * m
      );
      b && console.log("Audio data length", Ee.length);
      for (const [, Se] of B.entries()) {
        const [Le, Ze] = Se, Be = Le * N.duration, Ie = Ze * N.duration, T = Ie - Be, ie = Math.round(Be * ce), ke = Math.round(Ie * ce);
        b && console.log(
          "Trim audio data",
          Be,
          Ie,
          "data",
          ie,
          ke
        );
        for (let ve = 0; ve < m; ve++) {
          const Te = Math.round(ve * T) * ce, _e = pe.getChannelData(ve).subarray(ie, ke);
          b && console.log(
            "Set data for channel",
            ve,
            "at",
            Te,
            _e.length
          ), Ee.set(_e, Te);
        }
      }
      b && console.log("Create audio data");
      const Ue = new AudioData({
        format: "f32-planar",
        sampleRate: ce,
        numberOfChannels: m,
        numberOfFrames: Math.round(A * ce),
        timestamp: 0,
        data: Ee
      });
      _ = new AudioEncoder({
        output: (Se, Le) => {
          q.addAudioChunk(Se, Le);
        },
        error: (Se) => {
          s(new Error("Audio " + Se.message));
        }
      }), b && console.log("Configure audio encoder", {
        channels: m,
        sampleRate: h,
        bitrate: w
      }), _.configure({
        codec: P.encoder.audio,
        numberOfChannels: m,
        sampleRate: h,
        bitrate: w
      }), b && console.log("Encode audio data", Ue), _.encode(Ue);
    }
    b && console.log("Prepare canvas");
    const k = d(N, u, {
      targetSize: S,
      shapePreprocessor: I
    });
    if (await k.prepare(), D)
      return;
    U(0.2);
    const { width: F, height: O } = k.canvas, q = new R({
      target: new M(),
      video: {
        codec: P.muxer.video,
        width: F,
        height: O,
        frameRate: v
      },
      audio: oe && !H ? {
        codec: P.muxer.audio,
        sampleRate: h,
        numberOfChannels: m
      } : void 0,
      firstTimestampBehavior: "offset"
    }), V = new VideoEncoder({
      output: (ee, te) => {
        q.addVideoChunk(ee, te);
      },
      error: (ee) => {
        s(new Error("Video " + ee.message));
      }
    });
    V.configure({
      codec: P.encoder.video,
      width: F,
      height: O,
      bitrate: p
    }), b && console.log("Start encoding frames");
    const K = N.duration * 1e3;
    let Z = -1 / 0;
    const re = async (ee, te) => {
      ee = Math.max(0, Math.min(K, ee)), await ri(N, ee), k.redraw(N);
      const pe = new VideoFrame(k.canvas, {
        timestamp: te * 1e3
      }), ce = te - Z >= 1e4;
      ce && (Z = te), b && console.log(ce ? "Encode keyframe" : "Encode frame", te), V.encode(pe, { keyFrame: ce }), pe.close(), U(0.2 + 0.8 * (te / (A * 1e3)));
    }, ge = 1e3 / v;
    let me = 0;
    for (const [, ee] of B.entries()) {
      const [te, pe] = ee, ce = pe * K;
      let Me = te * K;
      try {
        do {
          if (Me = Math.min(ce, Me), await re(Me, me), D)
            return;
          Me += ge, me += ge;
        } while (Me < ce + ge);
      } catch (Ee) {
        s(Ee);
        return;
      }
    }
    if (await (V == null ? void 0 : V.flush()), await (_ == null ? void 0 : _.flush()), D)
      return;
    b && console.log("Encoding time in seconds", (Date.now() - C) / 1e3), q.finalize();
    const { buffer: be } = q.target;
    k.destroy(), i({
      ...n,
      // this is picked up by BlobToFile
      blob: new Blob([be], { type: f })
    });
  });
}, ri = (e, t) => new Promise((n) => {
  e.onseeked = () => n(), e.currentTime = t / 1e3;
}), ii = (e) => new Promise((t, n) => {
  const o = document.createElement("video");
  o.preload = "auto", o.onloadeddata = async () => {
    const r = await (Dt() ? yo(e) : Promise.resolve());
    r && (o.dataset.rotation = `${r}`), t(o);
  }, o.onerror = () => n(o.error), o.src = URL.createObjectURL(e), o.playsInline = !0, o.load();
});
function rn(e, t, n, o) {
  if (typeof n == "number") {
    const r = o - n, i = (n - t) / (e.dt || 1 / 60), s = e.opts.stiffness * r, c = e.opts.damping * i, u = (s - c) * e.inv_mass, l = (i + u) * e.dt;
    return Math.abs(l) < e.opts.precision && Math.abs(r) < e.opts.precision ? o : (e.settled = !1, n + l);
  } else {
    if (vr(n))
      return n.map(
        (r, i) => rn(e, t[i], n[i], o[i])
      );
    if (typeof n == "object") {
      const r = {};
      for (const i in n)
        r[i] = rn(e, t[i], n[i], o[i]);
      return r;
    } else
      throw new Error(`Cannot spring ${typeof n} values`);
  }
}
function bo(e, t = {}) {
  const n = _o(e), { stiffness: o = 0.15, damping: r = 0.8, precision: i = 0.01 } = t;
  let s, c, u, l = e, f = e, d = 1, v = 0, h = !1;
  function w(b, C = {}) {
    f = b;
    const P = u = {};
    if (e == null || C.hard || p.stiffness >= 1 && p.damping >= 1)
      return h = !0, s = null, l = b, n.set(e = f), Promise.resolve();
    if (C.soft && (v = 1 / ((C.soft === !0 ? 0.5 : +C.soft) * 60), d = 0), !c) {
      s = null, h = !1;
      const R = {
        inv_mass: void 0,
        opts: p,
        settled: !0,
        dt: void 0
      };
      c = Tr((M) => {
        if (s === null && (s = M), h)
          return h = !1, c = null, !1;
        d = Math.min(d + v, 1), R.inv_mass = d, R.opts = p, R.settled = !0, R.dt = (M - s) * 60 / 1e3;
        const S = rn(R, l, e, f);
        return s = M, l = e, n.set(e = S), R.settled && (c = null), !R.settled;
      });
    }
    return new Promise((R) => {
      c.promise.then(() => {
        P === u && R();
      });
    });
  }
  const p = {
    set: w,
    update: (b, C) => w(b(f, e), C),
    subscribe: n.subscribe,
    stiffness: o,
    damping: r,
    precision: i
  };
  return p;
}
function si(e) {
  let t, n, o;
  const r = (
    /*#slots*/
    e[5].default
  ), i = je(
    r,
    e,
    /*$$scope*/
    e[4],
    null
  );
  return {
    c() {
      t = pt("svg"), i && i.c(), y(
        t,
        "class",
        /*klass*/
        e[3]
      ), y(
        t,
        "style",
        /*style*/
        e[2]
      ), y(
        t,
        "width",
        /*width*/
        e[0]
      ), y(
        t,
        "height",
        /*height*/
        e[1]
      ), y(t, "viewBox", n = "0 0 " + /*width*/
      e[0] + `
    ` + /*height*/
      e[1]), y(t, "xmlns", "http://www.w3.org/2000/svg"), y(t, "aria-hidden", "true"), y(t, "focusable", "false"), y(t, "stroke-linecap", "round"), y(t, "stroke-linejoin", "round");
    },
    m(s, c) {
      J(s, t, c), i && i.m(t, null), o = !0;
    },
    p(s, [c]) {
      i && i.p && (!o || c & /*$$scope*/
      16) && Ne(
        i,
        r,
        s,
        /*$$scope*/
        s[4],
        o ? Ke(
          r,
          /*$$scope*/
          s[4],
          c,
          null
        ) : He(
          /*$$scope*/
          s[4]
        ),
        null
      ), (!o || c & /*klass*/
      8) && y(
        t,
        "class",
        /*klass*/
        s[3]
      ), (!o || c & /*style*/
      4) && y(
        t,
        "style",
        /*style*/
        s[2]
      ), (!o || c & /*width*/
      1) && y(
        t,
        "width",
        /*width*/
        s[0]
      ), (!o || c & /*height*/
      2) && y(
        t,
        "height",
        /*height*/
        s[1]
      ), (!o || c & /*width, height*/
      3 && n !== (n = "0 0 " + /*width*/
      s[0] + `
    ` + /*height*/
      s[1])) && y(t, "viewBox", n);
    },
    i(s) {
      o || (j(i, s), o = !0);
    },
    o(s) {
      W(i, s), o = !1;
    },
    d(s) {
      s && Y(t), i && i.d(s);
    }
  };
}
function ai(e, t, n) {
  let { $$slots: o = {}, $$scope: r } = t, { width: i = 24 } = t, { height: s = 24 } = t, { style: c = void 0 } = t, { class: u = void 0 } = t;
  return e.$$set = (l) => {
    "width" in l && n(0, i = l.width), "height" in l && n(1, s = l.height), "style" in l && n(2, c = l.style), "class" in l && n(3, u = l.class), "$$scope" in l && n(4, r = l.$$scope);
  }, [i, s, c, u, r, o];
}
class sn extends Ae {
  constructor(t) {
    super(), Fe(this, t, ai, si, Pe, { width: 0, height: 1, style: 2, class: 3 });
  }
}
const De = (e, t = Boolean, n = " ") => e.filter(t).join(n), li = (e, t) => t === e.target || t.contains(e.target), ci = (e) => e.map((t) => t === "CMD" ? lo() ? "⌘" : "Ctrl" : t).join("+"), Dn = (e, t, n) => (At(t) ? t : e) + (n ? ` (${ci(n)})` : "");
function On(e) {
  let t, n;
  return t = new sn({
    props: {
      class: "PinturaButtonIcon",
      $$slots: { default: [ui] },
      $$scope: { ctx: e }
    }
  }), {
    c() {
      he(t.$$.fragment);
    },
    m(o, r) {
      ue(t, o, r), n = !0;
    },
    p(o, r) {
      const i = {};
      r & /*$$scope, icon*/
      536870920 && (i.$$scope = { dirty: r, ctx: o }), t.$set(i);
    },
    i(o) {
      n || (j(t.$$.fragment, o), n = !0);
    },
    o(o) {
      W(t.$$.fragment, o), n = !1;
    },
    d(o) {
      fe(t, o);
    }
  };
}
function ui(e) {
  let t;
  return {
    c() {
      t = pt("g");
    },
    m(n, o) {
      J(n, t, o), t.innerHTML = /*icon*/
      e[3];
    },
    p(n, o) {
      o & /*icon*/
      8 && (t.innerHTML = /*icon*/
      n[3]);
    },
    d(n) {
      n && Y(t);
    }
  };
}
function zn(e) {
  let t;
  return {
    c() {
      t = X("span"), y(
        t,
        "class",
        /*elLabelClass*/
        e[11]
      );
    },
    m(n, o) {
      J(n, t, o), t.innerHTML = /*label*/
      e[0];
    },
    p(n, o) {
      o & /*label*/
      1 && (t.innerHTML = /*label*/
      n[0]), o & /*elLabelClass*/
      2048 && y(
        t,
        "class",
        /*elLabelClass*/
        n[11]
      );
    },
    d(n) {
      n && Y(t);
    }
  };
}
function fi(e) {
  let t, n, o, r = (
    /*icon*/
    e[3] && On(e)
  ), i = (
    /*label*/
    e[0] && zn(e)
  );
  return {
    c() {
      t = X("span"), r && r.c(), n = ae(), i && i.c(), y(
        t,
        "class",
        /*elButtonInnerClass*/
        e[13]
      );
    },
    m(s, c) {
      J(s, t, c), r && r.m(t, null), G(t, n), i && i.m(t, null), o = !0;
    },
    p(s, c) {
      /*icon*/
      s[3] ? r ? (r.p(s, c), c & /*icon*/
      8 && j(r, 1)) : (r = On(s), r.c(), j(r, 1), r.m(t, n)) : r && (rt(), W(r, 1, 1, () => {
        r = null;
      }), it()), /*label*/
      s[0] ? i ? i.p(s, c) : (i = zn(s), i.c(), i.m(t, null)) : i && (i.d(1), i = null), (!o || c & /*elButtonInnerClass*/
      8192) && y(
        t,
        "class",
        /*elButtonInnerClass*/
        s[13]
      );
    },
    i(s) {
      o || (j(r), o = !0);
    },
    o(s) {
      W(r), o = !1;
    },
    d(s) {
      s && Y(t), r && r.d(), i && i.d();
    }
  };
}
function di(e) {
  let t, n, o, r, i;
  const s = (
    /*#slots*/
    e[27].default
  ), c = je(
    s,
    e,
    /*$$scope*/
    e[29],
    null
  ), u = c || fi(e);
  return {
    c() {
      t = X("button"), u && u.c(), y(
        t,
        "type",
        /*type*/
        e[6]
      ), y(
        t,
        "style",
        /*style*/
        e[4]
      ), t.disabled = /*disabled*/
      e[5], y(
        t,
        "class",
        /*elButtonClass*/
        e[12]
      ), y(t, "title", n = Dn(
        /*label*/
        e[0],
        /*title*/
        e[1],
        /*shortcut*/
        e[2]
      ));
    },
    m(l, f) {
      J(l, t, f), u && u.m(t, null), e[28](t), o = !0, r || (i = [
        de(t, "keydown", function() {
          Re(
            /*onkeydown*/
            e[8]
          ) && e[8].apply(this, arguments);
        }),
        de(t, "click", function() {
          Re(
            /*onclick*/
            e[7]
          ) && e[7].apply(this, arguments);
        }),
        de(t, "pointerdown", function() {
          Re(
            /*handleDown*/
            e[14]
          ) && e[14].apply(this, arguments);
        }),
        qe(
          /*action*/
          e[9].call(null, t)
        )
      ], r = !0);
    },
    p(l, [f]) {
      e = l, c ? c.p && (!o || f & /*$$scope*/
      536870912) && Ne(
        c,
        s,
        e,
        /*$$scope*/
        e[29],
        o ? Ke(
          s,
          /*$$scope*/
          e[29],
          f,
          null
        ) : He(
          /*$$scope*/
          e[29]
        ),
        null
      ) : u && u.p && (!o || f & /*elButtonInnerClass, elLabelClass, label, icon*/
      10249) && u.p(e, o ? f : -1), (!o || f & /*type*/
      64) && y(
        t,
        "type",
        /*type*/
        e[6]
      ), (!o || f & /*style*/
      16) && y(
        t,
        "style",
        /*style*/
        e[4]
      ), (!o || f & /*disabled*/
      32) && (t.disabled = /*disabled*/
      e[5]), (!o || f & /*elButtonClass*/
      4096) && y(
        t,
        "class",
        /*elButtonClass*/
        e[12]
      ), (!o || f & /*label, title, shortcut*/
      7 && n !== (n = Dn(
        /*label*/
        e[0],
        /*title*/
        e[1],
        /*shortcut*/
        e[2]
      ))) && y(t, "title", n);
    },
    i(l) {
      o || (j(u, l), o = !0);
    },
    o(l) {
      W(u, l), o = !1;
    },
    d(l) {
      l && Y(t), u && u.d(l), e[28](null), r = !1, we(i);
    }
  };
}
function mi(e, t, n) {
  let o, r, i, s, c, { $$slots: u = {}, $$scope: l } = t, { class: f = void 0 } = t, { label: d = void 0 } = t, { title: v = void 0 } = t, { shortcut: h = void 0 } = t, { labelClass: w = void 0 } = t, { innerClass: p = void 0 } = t, { hideLabel: b = !1 } = t, { icon: C = void 0 } = t, { style: P = void 0 } = t, { disabled: R = void 0 } = t, { type: M = "button" } = t, { onclick: S = void 0 } = t, { onkeydown: L = void 0 } = t, { onhold: I = void 0 } = t, { action: E = () => {
  } } = t, { holdThreshold: z = 500 } = t, { holdSpeedUpFactor: D = 0.5 } = t, { holdSpeedMin: B = 20 } = t, H;
  const Q = (a) => {
    n(25, H = setTimeout(
      () => {
        I(), Q(Math.max(a * D, B));
      },
      a
    ));
  };
  let U;
  const N = (a) => li(a, U), oe = () => U;
  function A(a) {
    ze[a ? "unshift" : "push"](() => {
      U = a, n(10, U);
    });
  }
  return e.$$set = (a) => {
    "class" in a && n(15, f = a.class), "label" in a && n(0, d = a.label), "title" in a && n(1, v = a.title), "shortcut" in a && n(2, h = a.shortcut), "labelClass" in a && n(16, w = a.labelClass), "innerClass" in a && n(17, p = a.innerClass), "hideLabel" in a && n(18, b = a.hideLabel), "icon" in a && n(3, C = a.icon), "style" in a && n(4, P = a.style), "disabled" in a && n(5, R = a.disabled), "type" in a && n(6, M = a.type), "onclick" in a && n(7, S = a.onclick), "onkeydown" in a && n(8, L = a.onkeydown), "onhold" in a && n(19, I = a.onhold), "action" in a && n(9, E = a.action), "holdThreshold" in a && n(20, z = a.holdThreshold), "holdSpeedUpFactor" in a && n(21, D = a.holdSpeedUpFactor), "holdSpeedMin" in a && n(22, B = a.holdSpeedMin), "$$scope" in a && n(29, l = a.$$scope);
  }, e.$$.update = () => {
    e.$$.dirty & /*onhold, holdTimer, handleUp*/
    101187584 && n(26, r = I ? () => {
      H && (clearTimeout(H), n(25, H = void 0), document.documentElement.removeEventListener("pointerup", r));
    } : ne), e.$$.dirty & /*onhold, handleUp, holdThreshold*/
    68681728 && n(14, o = I ? () => {
      document.documentElement.addEventListener("pointerup", r), Q(z);
    } : ne), e.$$.dirty & /*innerClass*/
    131072 && n(13, i = De(["PinturaButtonInner", p])), e.$$.dirty & /*hideLabel, klass*/
    294912 && n(12, s = De(["PinturaButton", b && "PinturaButtonIconOnly", f])), e.$$.dirty & /*hideLabel, labelClass*/
    327680 && n(11, c = De([b ? "implicit" : "PinturaButtonLabel", w]));
  }, [
    d,
    v,
    h,
    C,
    P,
    R,
    M,
    S,
    L,
    E,
    U,
    c,
    s,
    i,
    o,
    f,
    w,
    p,
    b,
    I,
    z,
    D,
    B,
    N,
    oe,
    H,
    r,
    u,
    A,
    l
  ];
}
class an extends Ae {
  constructor(t) {
    super(), Fe(this, t, mi, di, Pe, {
      class: 15,
      label: 0,
      title: 1,
      shortcut: 2,
      labelClass: 16,
      innerClass: 17,
      hideLabel: 18,
      icon: 3,
      style: 4,
      disabled: 5,
      type: 6,
      onclick: 7,
      onkeydown: 8,
      onhold: 19,
      action: 9,
      holdThreshold: 20,
      holdSpeedUpFactor: 21,
      holdSpeedMin: 22,
      isEventTarget: 23,
      getElement: 24
    });
  }
  get isEventTarget() {
    return this.$$.ctx[23];
  }
  get getElement() {
    return this.$$.ctx[24];
  }
}
function hi(e) {
  let t, n, o, r;
  const i = (
    /*#slots*/
    e[5].default
  ), s = je(
    i,
    e,
    /*$$scope*/
    e[4],
    null
  );
  return {
    c() {
      t = X("div"), s && s.c(), y(
        t,
        "class",
        /*klass*/
        e[0]
      );
    },
    m(c, u) {
      J(c, t, u), s && s.m(t, null), n = !0, o || (r = [
        de(t, "measure", function() {
          Re(
            /*didMount*/
            e[1] && /*handleResize*/
            e[3]
          ) && /*didMount*/
          (e[1] && /*handleResize*/
          e[3]).apply(this, arguments);
        }),
        qe(
          /*measurable*/
          e[2].call(null, t)
        )
      ], o = !0);
    },
    p(c, [u]) {
      e = c, s && s.p && (!n || u & /*$$scope*/
      16) && Ne(
        s,
        i,
        e,
        /*$$scope*/
        e[4],
        n ? Ke(
          i,
          /*$$scope*/
          e[4],
          u,
          null
        ) : He(
          /*$$scope*/
          e[4]
        ),
        null
      ), (!n || u & /*klass*/
      1) && y(
        t,
        "class",
        /*klass*/
        e[0]
      );
    },
    i(c) {
      n || (j(s, c), n = !0);
    },
    o(c) {
      W(s, c), n = !1;
    },
    d(c) {
      c && Y(t), s && s.d(c), o = !1, we(r);
    }
  };
}
function gi(e, t, n) {
  let { $$slots: o = {}, $$scope: r } = t;
  const i = Lr();
  let { class: s = null } = t;
  const c = _t("measurable");
  let u = !1;
  const l = ({ detail: f }) => i("measure", f);
  return Ar(() => n(1, u = !0)), e.$$set = (f) => {
    "class" in f && n(0, s = f.class), "$$scope" in f && n(4, r = f.$$scope);
  }, [s, u, c, l, r, o];
}
class pi extends Ae {
  constructor(t) {
    super(), Fe(this, t, gi, hi, Pe, { class: 0 });
  }
}
const _i = (e) => ({}), Un = (e) => ({}), yi = (e) => ({}), Vn = (e) => ({}), wi = (e) => ({}), jn = (e) => ({});
function Kn(e) {
  let t, n;
  const o = (
    /*#slots*/
    e[4].header
  ), r = je(
    o,
    e,
    /*$$scope*/
    e[3],
    jn
  );
  return {
    c() {
      t = X("div"), r && r.c(), y(t, "class", "PinturaUtilHeader");
    },
    m(i, s) {
      J(i, t, s), r && r.m(t, null), n = !0;
    },
    p(i, s) {
      r && r.p && (!n || s & /*$$scope*/
      8) && Ne(
        r,
        o,
        i,
        /*$$scope*/
        i[3],
        n ? Ke(
          o,
          /*$$scope*/
          i[3],
          s,
          wi
        ) : He(
          /*$$scope*/
          i[3]
        ),
        jn
      );
    },
    i(i) {
      n || (j(r, i), n = !0);
    },
    o(i) {
      W(r, i), n = !1;
    },
    d(i) {
      i && Y(t), r && r.d(i);
    }
  };
}
function bi(e) {
  let t, n;
  return t = new pi({ props: { class: "PinturaStage" } }), t.$on(
    "measure",
    /*measure_handler*/
    e[5]
  ), {
    c() {
      he(t.$$.fragment);
    },
    m(o, r) {
      ue(t, o, r), n = !0;
    },
    p: ne,
    i(o) {
      n || (j(t.$$.fragment, o), n = !0);
    },
    o(o) {
      W(t.$$.fragment, o), n = !1;
    },
    d(o) {
      fe(t, o);
    }
  };
}
function Nn(e) {
  let t, n;
  const o = (
    /*#slots*/
    e[4].footer
  ), r = je(
    o,
    e,
    /*$$scope*/
    e[3],
    Un
  );
  return {
    c() {
      t = X("div"), r && r.c(), y(t, "class", "PinturaUtilFooter");
    },
    m(i, s) {
      J(i, t, s), r && r.m(t, null), n = !0;
    },
    p(i, s) {
      r && r.p && (!n || s & /*$$scope*/
      8) && Ne(
        r,
        o,
        i,
        /*$$scope*/
        i[3],
        n ? Ke(
          o,
          /*$$scope*/
          i[3],
          s,
          _i
        ) : He(
          /*$$scope*/
          i[3]
        ),
        Un
      );
    },
    i(i) {
      n || (j(r, i), n = !0);
    },
    o(i) {
      W(r, i), n = !1;
    },
    d(i) {
      i && Y(t), r && r.d(i);
    }
  };
}
function Mi(e) {
  let t, n, o, r, i, s, c = (
    /*hasHeader*/
    e[1] && Kn(e)
  );
  const u = (
    /*#slots*/
    e[4].main
  ), l = je(
    u,
    e,
    /*$$scope*/
    e[3],
    Vn
  ), f = l || bi(e);
  let d = (
    /*hasFooter*/
    e[2] && Nn(e)
  ), v = !1;
  return {
    c() {
      c && c.c(), t = ae(), n = X("div"), f && f.c(), o = ae(), d && d.c(), r = ae(), i = po(), y(n, "class", "PinturaUtilMain");
    },
    m(h, w) {
      c && c.m(h, w), J(h, t, w), J(h, n, w), f && f.m(n, null), e[6](n), J(h, o, w), d && d.m(h, w), J(h, r, w), J(h, i, w), s = !0;
    },
    p(h, [w]) {
      /*hasHeader*/
      h[1] ? c ? (c.p(h, w), w & /*hasHeader*/
      2 && j(c, 1)) : (c = Kn(h), c.c(), j(c, 1), c.m(t.parentNode, t)) : c && (rt(), W(c, 1, 1, () => {
        c = null;
      }), it()), l && l.p && (!s || w & /*$$scope*/
      8) && Ne(
        l,
        u,
        h,
        /*$$scope*/
        h[3],
        s ? Ke(
          u,
          /*$$scope*/
          h[3],
          w,
          yi
        ) : He(
          /*$$scope*/
          h[3]
        ),
        Vn
      ), /*hasFooter*/
      h[2] ? d ? (d.p(h, w), w & /*hasFooter*/
      4 && j(d, 1)) : (d = Nn(h), d.c(), j(d, 1), d.m(r.parentNode, r)) : d && (rt(), W(d, 1, 1, () => {
        d = null;
      }), it());
    },
    i(h) {
      s || (j(c), j(f, h), j(d), j(v), s = !0);
    },
    o(h) {
      W(c), W(f, h), W(d), W(v), s = !1;
    },
    d(h) {
      c && c.d(h), h && Y(t), h && Y(n), f && f.d(h), e[6](null), h && Y(o), d && d.d(h), h && Y(r), h && Y(i);
    }
  };
}
function vi(e, t, n) {
  let { $$slots: o = {}, $$scope: r } = t, { hasHeader: i = !!t.$$slots.header } = t, { hasFooter: s = !!t.$$slots.footer } = t, { root: c = void 0 } = t;
  function u(f) {
    mn.call(this, e, f);
  }
  function l(f) {
    ze[f ? "unshift" : "push"](() => {
      c = f, n(0, c);
    });
  }
  return e.$$set = (f) => {
    n(7, t = mt(mt({}, t), Fn(f))), "hasHeader" in f && n(1, i = f.hasHeader), "hasFooter" in f && n(2, s = f.hasFooter), "root" in f && n(0, c = f.root), "$$scope" in f && n(3, r = f.$$scope);
  }, t = Fn(t), [c, i, s, r, o, u, l];
}
class Si extends Ae {
  constructor(t) {
    super(), Fe(this, t, vi, Mi, Pe, { hasHeader: 1, hasFooter: 2, root: 0 });
  }
}
const ki = (e, t = {}) => {
  const {
    direction: n = void 0,
    shiftMultiplier: o = 10,
    bubbles: r = !1,
    preventDefault: i = !1,
    stopKeydownPropagation: s = !0
  } = t, c = n === "horizontal", u = n === "vertical", l = (f) => {
    const { key: d } = f, v = f.shiftKey, h = /up|down/i.test(d), w = /left|right/i.test(d);
    if (!w && !h || c && h || u && w)
      return;
    const p = v ? o : 1;
    s && f.stopPropagation(), i && f.preventDefault(), e.dispatchEvent(
      new CustomEvent("nudge", {
        bubbles: r,
        detail: Oe(
          (/left/i.test(d) ? -1 : /right/i.test(d) ? 1 : 0) * p,
          (/up/i.test(d) ? -1 : /down/i.test(d) ? 1 : 0) * p
        )
      })
    );
  };
  return e.addEventListener("keydown", l), {
    destroy() {
      e.removeEventListener("keydown", l);
    }
  };
}, Pi = (e, t) => (t = 1 / t, Math.round(e * t) / t), Ei = (e, t, n) => (e - t) / (n - t), Ti = (e) => ({}), Hn = (e) => ({});
function qn(e) {
  let t, n, o, r, i, s, c, u;
  return n = new sn({
    props: {
      $$slots: { default: [Ci] },
      $$scope: { ctx: e }
    }
  }), i = new sn({
    props: {
      $$slots: { default: [Ri] },
      $$scope: { ctx: e }
    }
  }), {
    c() {
      t = X("button"), he(n.$$.fragment), o = ae(), r = X("button"), he(i.$$.fragment), y(t, "type", "button"), y(t, "aria-label", "Increase"), y(r, "type", "button"), y(r, "aria-label", "Decrease");
    },
    m(l, f) {
      J(l, t, f), ue(n, t, null), J(l, o, f), J(l, r, f), ue(i, r, null), s = !0, c || (u = [
        de(
          t,
          "pointerdown",
          /*handleUpdaterDown*/
          e[20](1)
        ),
        de(
          r,
          "pointerdown",
          /*handleUpdaterDown*/
          e[20](-1)
        )
      ], c = !0);
    },
    p(l, f) {
      const d = {};
      f[1] & /*$$scope*/
      128 && (d.$$scope = { dirty: f, ctx: l }), n.$set(d);
      const v = {};
      f[1] & /*$$scope*/
      128 && (v.$$scope = { dirty: f, ctx: l }), i.$set(v);
    },
    i(l) {
      s || (j(n.$$.fragment, l), j(i.$$.fragment, l), s = !0);
    },
    o(l) {
      W(n.$$.fragment, l), W(i.$$.fragment, l), s = !1;
    },
    d(l) {
      l && Y(t), fe(n), l && Y(o), l && Y(r), fe(i), c = !1, we(u);
    }
  };
}
function Ci(e) {
  let t;
  return {
    c() {
      t = pt("path"), y(t, "d", "M8 12 h8 M12 8 v8");
    },
    m(n, o) {
      J(n, t, o);
    },
    p: ne,
    d(n) {
      n && Y(t);
    }
  };
}
function Ri(e) {
  let t;
  return {
    c() {
      t = pt("path"), y(t, "d", "M9 12 h6");
    },
    m(n, o) {
      J(n, t, o);
    },
    p: ne,
    d(n) {
      n && Y(t);
    }
  };
}
function Fi(e) {
  let t, n, o, r, i, s, c, u, l, f, d, v, h, w, p, b, C;
  const P = (
    /*#slots*/
    e[36].default
  ), R = je(
    P,
    e,
    /*$$scope*/
    e[38],
    null
  ), M = (
    /*#slots*/
    e[36].knob
  ), S = je(
    M,
    e,
    /*$$scope*/
    e[38],
    Hn
  );
  let L = (
    /*enableSpinButtons*/
    e[9] && qn(e)
  );
  return {
    c() {
      t = X("div"), n = X("div"), o = X("input"), i = ae(), s = X("div"), R && R.c(), u = ae(), l = X("div"), f = X("div"), S && S.c(), h = ae(), L && L.c(), y(o, "type", "range"), y(
        o,
        "id",
        /*id*/
        e[3]
      ), y(
        o,
        "min",
        /*min*/
        e[0]
      ), y(
        o,
        "max",
        /*max*/
        e[1]
      ), y(
        o,
        "step",
        /*step*/
        e[2]
      ), o.value = /*numberValue*/
      e[14], y(o, "style", r = /*enableForceUseKnob*/
      e[10] ? "pointer-events:none" : ""), y(s, "class", c = De([
        "PinturaSliderTrack",
        /*trackClass*/
        e[5]
      ])), y(
        s,
        "style",
        /*trackStyle*/
        e[4]
      ), y(f, "class", d = De([
        "PinturaSliderKnob",
        /*knobClass*/
        e[7]
      ])), y(
        f,
        "style",
        /*knobStyle*/
        e[6]
      ), y(l, "class", "PinturaSliderKnobController"), y(
        l,
        "style",
        /*knobControllerStyle*/
        e[17]
      ), y(n, "class", "PinturaSliderControl"), y(n, "style", v = `--slider-position:${Math.round(
        /*position*/
        e[15]
      )}`), y(t, "class", w = De([
        "PinturaSlider",
        /*klass*/
        e[12]
      ])), y(
        t,
        "data-direction",
        /*direction*/
        e[8]
      );
    },
    m(I, E) {
      J(I, t, E), G(t, n), G(n, o), e[37](o), G(n, i), G(n, s), R && R.m(s, null), G(n, u), G(n, l), G(l, f), S && S.m(f, null), G(t, h), L && L.m(t, null), p = !0, b || (C = [
        de(
          o,
          "input",
          /*handleInput*/
          e[18]
        ),
        de(
          o,
          "nudge",
          /*handleNudge*/
          e[19]
        ),
        qe(ki.call(null, o)),
        de(n, "pointerdown", function() {
          Re(
            /*enablePointerdownListener*/
            e[11] && /*handlePointerDown*/
            e[13]
          ) && /*enablePointerdownListener*/
          (e[11] && /*handlePointerDown*/
          e[13]).apply(this, arguments);
        })
      ], b = !0);
    },
    p(I, E) {
      e = I, (!p || E[0] & /*id*/
      8) && y(
        o,
        "id",
        /*id*/
        e[3]
      ), (!p || E[0] & /*min*/
      1) && y(
        o,
        "min",
        /*min*/
        e[0]
      ), (!p || E[0] & /*max*/
      2) && y(
        o,
        "max",
        /*max*/
        e[1]
      ), (!p || E[0] & /*step*/
      4) && y(
        o,
        "step",
        /*step*/
        e[2]
      ), (!p || E[0] & /*numberValue*/
      16384) && (o.value = /*numberValue*/
      e[14]), (!p || E[0] & /*enableForceUseKnob*/
      1024 && r !== (r = /*enableForceUseKnob*/
      e[10] ? "pointer-events:none" : "")) && y(o, "style", r), R && R.p && (!p || E[1] & /*$$scope*/
      128) && Ne(
        R,
        P,
        e,
        /*$$scope*/
        e[38],
        p ? Ke(
          P,
          /*$$scope*/
          e[38],
          E,
          null
        ) : He(
          /*$$scope*/
          e[38]
        ),
        null
      ), (!p || E[0] & /*trackClass*/
      32 && c !== (c = De([
        "PinturaSliderTrack",
        /*trackClass*/
        e[5]
      ]))) && y(s, "class", c), (!p || E[0] & /*trackStyle*/
      16) && y(
        s,
        "style",
        /*trackStyle*/
        e[4]
      ), S && S.p && (!p || E[1] & /*$$scope*/
      128) && Ne(
        S,
        M,
        e,
        /*$$scope*/
        e[38],
        p ? Ke(
          M,
          /*$$scope*/
          e[38],
          E,
          Ti
        ) : He(
          /*$$scope*/
          e[38]
        ),
        Hn
      ), (!p || E[0] & /*knobClass*/
      128 && d !== (d = De([
        "PinturaSliderKnob",
        /*knobClass*/
        e[7]
      ]))) && y(f, "class", d), (!p || E[0] & /*knobStyle*/
      64) && y(
        f,
        "style",
        /*knobStyle*/
        e[6]
      ), (!p || E[0] & /*knobControllerStyle*/
      131072) && y(
        l,
        "style",
        /*knobControllerStyle*/
        e[17]
      ), (!p || E[0] & /*position*/
      32768 && v !== (v = `--slider-position:${Math.round(
        /*position*/
        e[15]
      )}`)) && y(n, "style", v), /*enableSpinButtons*/
      e[9] ? L ? (L.p(e, E), E[0] & /*enableSpinButtons*/
      512 && j(L, 1)) : (L = qn(e), L.c(), j(L, 1), L.m(t, null)) : L && (rt(), W(L, 1, 1, () => {
        L = null;
      }), it()), (!p || E[0] & /*klass*/
      4096 && w !== (w = De([
        "PinturaSlider",
        /*klass*/
        e[12]
      ]))) && y(t, "class", w), (!p || E[0] & /*direction*/
      256) && y(
        t,
        "data-direction",
        /*direction*/
        e[8]
      );
    },
    i(I) {
      p || (j(R, I), j(S, I), j(L), p = !0);
    },
    o(I) {
      W(R, I), W(S, I), W(L), p = !1;
    },
    d(I) {
      I && Y(t), e[37](null), R && R.d(I), S && S.d(I), L && L.d(), b = !1, we(C);
    }
  };
}
function Ai(e, t, n) {
  let o, r, i, s, c, u, l, f, d, { $$slots: v = {}, $$scope: h } = t, { min: w = 0 } = t, { max: p = 100 } = t, { step: b = 1 } = t, { id: C = void 0 } = t, { value: P = 0 } = t, { valueMin: R = void 0 } = t, { valueMax: M = void 0 } = t, { trackStyle: S = void 0 } = t, { trackClass: L = void 0 } = t, { knobStyle: I = void 0 } = t, { knobClass: E = void 0 } = t, { ongrab: z = Ce } = t, { onchange: D = Ce } = t, { onrelease: B = Ce } = t, { onexceed: H = Ce } = t, { direction: Q = "x" } = t, { getValue: U = En } = t, { setValue: N = En } = t, { enableSpinButtons: oe = !0 } = t, { enableForceUseKnob: A = !1 } = t, { enableStopPropagation: a = !0 } = t, { enablePointerdownListener: m = !0 } = t, { maxInteractionDistance: _ = 6 } = t, { class: k = void 0 } = t, F, O, q, V, K, Z;
  const re = (T) => N(Pi(Bt(T, w, p), b)), ge = (T, ie, ke = {}) => {
    const { grabbed: ve = !1, released: Te = !1 } = ke, _e = re(w + T / ie * r), Ye = R || w, yt = M || p;
    n(21, P = At(_e) ? _e : Bt(_e, Ye, yt)), Z !== _e && (Z = _e, !At(_e) && (_e < Ye || _e > yt) && H(P, _e), P !== K && (K = P, ve && z(P), D(P), Te && B(P)));
  }, me = (T) => {
    O || (n(21, P = N(parseFloat(T.target.value))), P !== K && (K = P, D(P)));
  };
  let be;
  const ee = (T) => {
    const ie = F[l], ke = o / r * ie;
    ge(ke + T.detail[Q], ie), clearTimeout(be), be = setTimeout(
      () => {
        B(P);
      },
      250
    );
  }, te = (T) => {
    const ie = F.getBoundingClientRect(), ve = T[f] - ie[Q], Te = F[l];
    return Math.abs(ve - i * Te);
  }, pe = (T) => {
    let ie = !1;
    a && T.stopPropagation(), clearTimeout(be);
    const ke = F.getBoundingClientRect();
    if (O = F[l], V = T[f], q = V - ke[Q], A) {
      if (Math.abs(q - i * O) > _)
        return;
      ie = !0, T.stopPropagation();
    }
    return document.activeElement !== F && F.focus(), ge(q, O, { grabbed: !0 }), document.documentElement.addEventListener("pointermove", ce), document.documentElement.addEventListener("pointerup", Me), ie;
  }, ce = (T) => {
    const ie = T[f] - V;
    ge(q + ie, O);
  }, Me = (T) => {
    O = void 0, document.documentElement.removeEventListener("pointermove", ce), document.documentElement.removeEventListener("pointerup", Me), D(P), B(P);
  }, Ee = () => {
    n(21, P = re(o + Se * b)), D(P);
  };
  let Ue, Se = 1, Le = !1;
  const Ze = (T) => (ie) => {
    clearTimeout(be), Se = T, Le = !1, Ue = setInterval(
      () => {
        Le = !0, Ee();
      },
      100
    ), document.addEventListener("pointercancel", Be), document.addEventListener("pointerup", Be);
  }, Be = (T) => {
    clearTimeout(Ue), Le || Ee(), B(P), document.removeEventListener("pointerup", Be);
  };
  function Ie(T) {
    ze[T ? "unshift" : "push"](() => {
      F = T, n(16, F);
    });
  }
  return e.$$set = (T) => {
    "min" in T && n(0, w = T.min), "max" in T && n(1, p = T.max), "step" in T && n(2, b = T.step), "id" in T && n(3, C = T.id), "value" in T && n(21, P = T.value), "valueMin" in T && n(22, R = T.valueMin), "valueMax" in T && n(23, M = T.valueMax), "trackStyle" in T && n(4, S = T.trackStyle), "trackClass" in T && n(5, L = T.trackClass), "knobStyle" in T && n(6, I = T.knobStyle), "knobClass" in T && n(7, E = T.knobClass), "ongrab" in T && n(24, z = T.ongrab), "onchange" in T && n(25, D = T.onchange), "onrelease" in T && n(26, B = T.onrelease), "onexceed" in T && n(27, H = T.onexceed), "direction" in T && n(8, Q = T.direction), "getValue" in T && n(28, U = T.getValue), "setValue" in T && n(29, N = T.setValue), "enableSpinButtons" in T && n(9, oe = T.enableSpinButtons), "enableForceUseKnob" in T && n(10, A = T.enableForceUseKnob), "enableStopPropagation" in T && n(30, a = T.enableStopPropagation), "enablePointerdownListener" in T && n(11, m = T.enablePointerdownListener), "maxInteractionDistance" in T && n(31, _ = T.maxInteractionDistance), "class" in T && n(12, k = T.class), "$$scope" in T && n(38, h = T.$$scope);
  }, e.$$.update = () => {
    e.$$.dirty[0] & /*value, getValue*/
    270532608 && n(14, o = P !== void 0 ? U(P) : 0), e.$$.dirty[0] & /*max, min*/
    3 && (r = p - w), e.$$.dirty[0] & /*numberValue, min, max*/
    16387 && n(33, i = Ei(o, w, p)), e.$$.dirty[1] & /*fraction*/
    4 && n(15, s = i * 100), e.$$.dirty[0] & /*direction*/
    256 && n(34, c = Q.toUpperCase()), e.$$.dirty[0] & /*direction*/
    256 && n(35, u = Q === "x" ? "Width" : "Height"), e.$$.dirty[1] & /*dimension*/
    16 && (l = `offset${u}`), e.$$.dirty[1] & /*axis*/
    8, e.$$.dirty[1] & /*axis*/
    8 && (f = `page${c}`), e.$$.dirty[0] & /*position*/
    32768 | e.$$.dirty[1] & /*axis*/
    8 && n(17, d = `transform: translate${c}(${s}%)`);
  }, [
    w,
    p,
    b,
    C,
    S,
    L,
    I,
    E,
    Q,
    oe,
    A,
    m,
    k,
    pe,
    o,
    s,
    F,
    d,
    me,
    ee,
    Ze,
    P,
    R,
    M,
    z,
    D,
    B,
    H,
    U,
    N,
    a,
    _,
    te,
    i,
    c,
    u,
    v,
    Ie,
    h
  ];
}
class ln extends Ae {
  constructor(t) {
    super(), Fe(
      this,
      t,
      Ai,
      Fi,
      Pe,
      {
        min: 0,
        max: 1,
        step: 2,
        id: 3,
        value: 21,
        valueMin: 22,
        valueMax: 23,
        trackStyle: 4,
        trackClass: 5,
        knobStyle: 6,
        knobClass: 7,
        ongrab: 24,
        onchange: 25,
        onrelease: 26,
        onexceed: 27,
        direction: 8,
        getValue: 28,
        setValue: 29,
        enableSpinButtons: 9,
        enableForceUseKnob: 10,
        enableStopPropagation: 30,
        enablePointerdownListener: 11,
        maxInteractionDistance: 31,
        class: 12,
        eventDistanceToKnob: 32,
        handlePointerDown: 13
      },
      null,
      [-1, -1]
    );
  }
  get eventDistanceToKnob() {
    return this.$$.ctx[32];
  }
  get handlePointerDown() {
    return this.$$.ctx[13];
  }
}
const { Boolean: Li } = ho;
function Wn(e, t, n) {
  const o = e.slice();
  return o[31] = t[n], o[32] = t, o[33] = n, o;
}
function Gn(e) {
  let t, n, o, r, i, s, c, u, l = (
    /*index*/
    e[33]
  ), f, d, v, h, w, p, b, C;
  function P() {
    return (
      /*func*/
      e[20](
        /*index*/
        e[33]
      )
    );
  }
  function R(...a) {
    return (
      /*func_1*/
      e[21](
        /*index*/
        e[33],
        /*range*/
        e[31],
        ...a
      )
    );
  }
  function M(...a) {
    return (
      /*func_2*/
      e[22](
        /*range*/
        e[31],
        /*index*/
        e[33],
        ...a
      )
    );
  }
  function S(...a) {
    return (
      /*func_3*/
      e[23](
        /*range*/
        e[31],
        /*index*/
        e[33],
        ...a
      )
    );
  }
  const L = [
    /*range*/
    e[31].defaults,
    /*range*/
    e[31].from,
    { ongrab: P },
    { onchange: R },
    { onexceed: M },
    { onrelease: S }
  ], I = () => (
    /*slider0_binding*/
    e[24](u, l)
  ), E = () => (
    /*slider0_binding*/
    e[24](null, l)
  );
  let z = {};
  for (let a = 0; a < L.length; a += 1)
    z = mt(z, L[a]);
  u = new ln({ props: z }), I();
  function D() {
    return (
      /*func_4*/
      e[25](
        /*index*/
        e[33]
      )
    );
  }
  function B(...a) {
    return (
      /*func_5*/
      e[26](
        /*index*/
        e[33],
        /*range*/
        e[31],
        ...a
      )
    );
  }
  function H(...a) {
    return (
      /*func_6*/
      e[27](
        /*range*/
        e[31],
        /*index*/
        e[33],
        ...a
      )
    );
  }
  function Q(...a) {
    return (
      /*func_7*/
      e[28](
        /*range*/
        e[31],
        /*index*/
        e[33],
        ...a
      )
    );
  }
  const U = [
    /*range*/
    e[31].defaults,
    /*range*/
    e[31].to,
    { ongrab: D },
    { onchange: B },
    { onexceed: H },
    { onrelease: Q }
  ], N = () => (
    /*slider1_binding*/
    e[29](d, l)
  ), oe = () => (
    /*slider1_binding*/
    e[29](null, l)
  );
  let A = {};
  for (let a = 0; a < U.length; a += 1)
    A = mt(A, U[a]);
  return d = new ln({ props: A }), N(), {
    c() {
      t = X("div"), n = X("div"), o = X("div"), r = ae(), i = X("div"), c = ae(), he(u.$$.fragment), f = ae(), he(d.$$.fragment), v = ae(), y(o, "class", "PinturaMediaRangeIndicatorShadow"), y(i, "class", "PinturaMediaRangeIndicatorOutline"), y(n, "class", "PinturaMediaRangeIndicator"), y(n, "style", s = `left: ${/*range*/
      e[31].indicator.left * 100}%;width:${Ve(
        /*range*/
        e[31].indicator.width * 100,
        6
      )}%`), y(t, "class", "PinturaMediaRangeClip"), y(t, "data-index", `range_${/*index*/
      e[33]}`), y(t, "data-merge", h = /*mergeOption*/
      e[6][1] === /*index*/
      e[33] + 1 ? "right" : (
        /*mergeOption*/
        e[6][0] === /*index*/
        e[33] - 1 ? "left" : "none"
      )), y(t, "data-flex", w = /*mergeFlex*/
      e[7][0] || void 0), y(t, "data-state", p = [
        /*activeClipIndex*/
        e[5] === /*index*/
        e[33] && "active",
        /*range*/
        e[31].indicator.visible && "visible"
      ].filter(Boolean).join(" ")), y(t, "style", b = `${dt(
        /*mergeFlex*/
        e[7][1]
      ) ? "--flex:" + /*mergeFlex*/
      e[7][1] + ";" : ""}`);
    },
    m(a, m) {
      J(a, t, m), G(t, n), G(n, o), G(n, r), G(n, i), G(t, c), ue(u, t, null), G(t, f), ue(d, t, null), G(t, v), C = !0;
    },
    p(a, m) {
      e = a, (!C || m[0] & /*sliderRanges*/
      1024 && s !== (s = `left: ${/*range*/
      e[31].indicator.left * 100}%;width:${Ve(
        /*range*/
        e[31].indicator.width * 100,
        6
      )}%`)) && y(n, "style", s), l !== /*index*/
      e[33] && (E(), l = /*index*/
      e[33], I());
      const _ = m[0] & /*sliderRanges, activeClipIndex, updateRanges, ondragrange, mergeOption, mergeFlex, mergeRanges, onrelease*/
      7398 ? An(L, [
        m[0] & /*sliderRanges*/
        1024 && Rt(
          /*range*/
          e[31].defaults
        ),
        m[0] & /*sliderRanges*/
        1024 && Rt(
          /*range*/
          e[31].from
        ),
        m[0] & /*activeClipIndex*/
        32 && { ongrab: P },
        m[0] & /*updateRanges, sliderRanges, ondragrange, mergeOption, mergeFlex*/
        3266 && { onchange: R },
        m[0] & /*sliderRanges, mergeFlex, mergeOption*/
        1216 && { onexceed: M },
        m[0] & /*mergeFlex, sliderRanges, mergeOption, mergeRanges, onrelease*/
        5316 && { onrelease: S }
      ]) : {};
      u.$set(_), l !== /*index*/
      e[33] && (oe(), l = /*index*/
      e[33], N());
      const k = m[0] & /*sliderRanges, activeClipIndex, updateRanges, ondragrange, ranges, mergeOption, mergeFlex, mergeRanges, onrelease*/
      7399 ? An(U, [
        m[0] & /*sliderRanges*/
        1024 && Rt(
          /*range*/
          e[31].defaults
        ),
        m[0] & /*sliderRanges*/
        1024 && Rt(
          /*range*/
          e[31].to
        ),
        m[0] & /*activeClipIndex*/
        32 && { ongrab: D },
        m[0] & /*updateRanges, sliderRanges, ondragrange, ranges, mergeOption, mergeFlex*/
        3267 && { onchange: B },
        m[0] & /*sliderRanges, mergeFlex, mergeOption*/
        1216 && { onexceed: H },
        m[0] & /*mergeFlex, sliderRanges, mergeOption, mergeRanges, onrelease*/
        5316 && { onrelease: Q }
      ]) : {};
      d.$set(k), (!C || m[0] & /*mergeOption*/
      64 && h !== (h = /*mergeOption*/
      e[6][1] === /*index*/
      e[33] + 1 ? "right" : (
        /*mergeOption*/
        e[6][0] === /*index*/
        e[33] - 1 ? "left" : "none"
      ))) && y(t, "data-merge", h), (!C || m[0] & /*mergeFlex*/
      128 && w !== (w = /*mergeFlex*/
      e[7][0] || void 0)) && y(t, "data-flex", w), (!C || m[0] & /*activeClipIndex, sliderRanges*/
      1056 && p !== (p = [
        /*activeClipIndex*/
        e[5] === /*index*/
        e[33] && "active",
        /*range*/
        e[31].indicator.visible && "visible"
      ].filter(Boolean).join(" "))) && y(t, "data-state", p), (!C || m[0] & /*mergeFlex*/
      128 && b !== (b = `${dt(
        /*mergeFlex*/
        e[7][1]
      ) ? "--flex:" + /*mergeFlex*/
      e[7][1] + ";" : ""}`)) && y(t, "style", b);
    },
    i(a) {
      C || (j(u.$$.fragment, a), j(d.$$.fragment, a), C = !0);
    },
    o(a) {
      W(u.$$.fragment, a), W(d.$$.fragment, a), C = !1;
    },
    d(a) {
      a && Y(t), E(), fe(u), oe(), fe(d);
    }
  };
}
function Bi(e) {
  let t, n, o, r, i = (
    /*sliderRanges*/
    e[10]
  ), s = [];
  for (let u = 0; u < i.length; u += 1)
    s[u] = Gn(Wn(e, i, u));
  const c = (u) => W(s[u], 1, 1, () => {
    s[u] = null;
  });
  return {
    c() {
      t = X("div");
      for (let u = 0; u < s.length; u += 1)
        s[u].c();
      y(t, "class", "PinturaMediaClipper");
    },
    m(u, l) {
      J(u, t, l);
      for (let f = 0; f < s.length; f += 1)
        s[f] && s[f].m(t, null);
      e[30](t), n = !0, o || (r = de(t, "pointerdown", function() {
        Re(
          /*enablePointerdownListener*/
          e[3] && /*handlePointerDown*/
          e[4]
        ) && /*enablePointerdownListener*/
        (e[3] && /*handlePointerDown*/
        e[4]).apply(this, arguments);
      }), o = !0);
    },
    p(u, l) {
      if (e = u, l[0] & /*mergeOption, mergeFlex, activeClipIndex, sliderRanges, updateRanges, ondragrange, ranges, mergeRanges, onrelease, sliders*/
      7911) {
        i = /*sliderRanges*/
        e[10];
        let f;
        for (f = 0; f < i.length; f += 1) {
          const d = Wn(e, i, f);
          s[f] ? (s[f].p(d, l), j(s[f], 1)) : (s[f] = Gn(d), s[f].c(), j(s[f], 1), s[f].m(t, null));
        }
        for (rt(), f = i.length; f < s.length; f += 1)
          c(f);
        it();
      }
    },
    i(u) {
      if (!n) {
        for (let l = 0; l < i.length; l += 1)
          j(s[l]);
        n = !0;
      }
    },
    o(u) {
      s = s.filter(Li);
      for (let l = 0; l < s.length; l += 1)
        W(s[l]);
      n = !1;
    },
    d(u) {
      u && Y(t), go(s, u), e[30](null), o = !1, r();
    }
  };
}
function Ii(e, t, n) {
  let o, r, i, s, { ranges: c } = t, { minSize: u = 0 } = t, { maxSize: l = 1 } = t, { precision: f } = t, { onchange: d = Ce } = t, { ondragrange: v = Ce } = t, { onrelease: h = Ce } = t, { enablePointerdownListener: w = !0 } = t, p, b = [], C = [];
  const P = (a, m) => {
    const _ = [...c];
    _[a] = m, d(_);
  }, R = (a, m) => {
    const _ = c[a][0], k = c[m][1], F = [_, k], O = [...c];
    O.splice(a, 2, F), d(O);
  };
  let M;
  const S = [], L = (a) => {
    if (!M.contains(a.target))
      return !1;
    const m = S.filter(Boolean).map((k) => ({
      slider: k,
      dist: k.eventDistanceToKnob(a)
    })).sort((k, F) => k.dist < F.dist ? -1 : k.dist > F.dist ? 1 : 0).map(({ slider: k }) => k);
    let _ = !1;
    for (const k of m)
      if (k.handlePointerDown(a)) {
        a.stopPropagation(), _ = !0;
        break;
      }
    return _;
  }, I = (a) => n(5, p = a), E = (a, m, _) => {
    if (P(a, [_, m.to.value]), v(_), _ > m.from.valueMin || a - 1 < 0) {
      n(6, b = []), n(7, C = []);
      return;
    }
    n(7, C = [a * 2, 0]), n(6, b = [a - 1, a]);
  }, z = (a, m, _, k) => {
    if (_ > a.to.valueAdjacent) {
      n(7, C = []), n(6, b = []);
      return;
    }
    const F = Math.abs(k - _), O = Bt(F / 0.05, 0, 1);
    n(7, C = [m * 2, Ve(O, 6)]);
  }, D = (a, m, _) => {
    n(7, C = []), _ === a.from.valueAdjacent ? m - 1 >= 0 && (n(6, b = []), R(m - 1, m)) : n(6, b = []), h();
  };
  function B(a, m) {
    ze[a ? "unshift" : "push"](() => {
      S[m * 2] = a, n(9, S);
    });
  }
  const H = (a) => n(5, p = a), Q = (a, m, _) => {
    if (P(a, [m.from.value, _]), v(_), _ < m.to.valueMax || a + 1 >= c.length) {
      n(6, b = []), n(7, C = []);
      return;
    }
    n(7, C = [a * 2 + 1, 0]), n(6, b = [a, a + 1]);
  }, U = (a, m, _, k) => {
    if (_ < a.to.valueAdjacent) {
      n(7, C = []), n(6, b = []);
      return;
    }
    const F = Math.abs(k - _), O = Bt(F / 0.05, 0, 1);
    n(7, C = [m * 2 + 1, Ve(O, 6)]);
  }, N = (a, m, _) => {
    n(7, C = []), _ === a.to.valueAdjacent ? m + 1 < s.length && (n(6, b = []), R(m, m + 1)) : n(6, b = []), h();
  };
  function oe(a, m) {
    ze[a ? "unshift" : "push"](() => {
      S[m * 2 + 1] = a, n(9, S);
    });
  }
  function A(a) {
    ze[a ? "unshift" : "push"](() => {
      M = a, n(8, M);
    });
  }
  return e.$$set = (a) => {
    "ranges" in a && n(0, c = a.ranges), "minSize" in a && n(13, u = a.minSize), "maxSize" in a && n(14, l = a.maxSize), "precision" in a && n(15, f = a.precision), "onchange" in a && n(16, d = a.onchange), "ondragrange" in a && n(1, v = a.ondragrange), "onrelease" in a && n(2, h = a.onrelease), "enablePointerdownListener" in a && n(3, w = a.enablePointerdownListener);
  }, e.$$.update = () => {
    e.$$.dirty[0] & /*ranges*/
    1 && n(19, o = c.reduce((a, [m, _]) => a + (_ - m), 0)), e.$$.dirty[0] & /*maxSize, rangeSpaceTotal*/
    540672 && n(17, r = l - o), e.$$.dirty[0] & /*rangeSpaceTotal, minSize*/
    532480 && n(18, i = o - u), e.$$.dirty[0] & /*ranges, precision, rangeSpaceAvailableMax, rangeSpaceAvailableMin*/
    425985 && n(10, s = c.map(([a, m], _) => {
      const [, k] = c[_ - 1] || [, 0], [F] = c[_ + 1] || [1];
      return {
        defaults: {
          min: 0,
          max: 1,
          step: f,
          enableSpinButtons: !1,
          enableForceUseKnob: !0,
          enableStopPropagation: !1,
          enablePointerdownListener: !1,
          maxInteractionDistance: 20
        },
        indicator: {
          left: a,
          width: m - a,
          visible: !(a === 0 && m === 1)
        },
        from: {
          value: a,
          valueMin: Math.max(k, a - r),
          valueMax: Math.min(m, i + a),
          // end,
          valueAdjacent: k
        },
        to: {
          value: m,
          valueMin: Math.max(a, m - i),
          valueMax: Math.min(F, m + r),
          valueAdjacent: F
        }
      };
    }));
  }, [
    c,
    v,
    h,
    w,
    L,
    p,
    b,
    C,
    M,
    S,
    s,
    P,
    R,
    u,
    l,
    f,
    d,
    r,
    i,
    o,
    I,
    E,
    z,
    D,
    B,
    H,
    Q,
    U,
    N,
    oe,
    A
  ];
}
class Di extends Ae {
  constructor(t) {
    super(), Fe(
      this,
      t,
      Ii,
      Bi,
      Pe,
      {
        ranges: 0,
        minSize: 13,
        maxSize: 14,
        precision: 15,
        onchange: 16,
        ondragrange: 1,
        onrelease: 2,
        enablePointerdownListener: 3,
        handlePointerDown: 4
      },
      null,
      [-1, -1]
    );
  }
  get handlePointerDown() {
    return this.$$.ctx[4];
  }
}
const Oi = (e, t = 0, n, o = 0) => {
  const r = [], i = [];
  let s = [], c = [], u = o;
  const l = () => {
    c.forEach((d) => d()), c = [];
  }, f = () => {
    l();
    for (let d = 0; d < u; d++) {
      r[d] = e(t, n);
      const v = r[d].subscribe((h) => {
        i[d] = h, s.forEach((w) => w(i));
      });
      c.push(v);
    }
  };
  return f(), {
    subscribe: (d) => (s.push(d), d(i), () => s = s.filter((v) => v === d)),
    unsubscribe: () => {
      l();
    },
    set: (d, v, h) => {
      r[d].set(v, h);
    },
    set length(d) {
      u = d, f();
    },
    reset: () => {
      for (let d = 0; d < u; d++)
        r[d].set(t, { hard: !0 });
    }
  };
}, cn = (e, t) => {
  e.fastSeek && e.fastSeek(t), e.currentTime = t;
};
function Xn(e, t, n) {
  const o = e.slice();
  return o[31] = t[n], o[33] = n, o;
}
function Zn(e) {
  let t, n;
  return {
    c() {
      t = X("div"), y(t, "class", "PinturaMediaMask"), y(t, "style", n = `left: ${/*range*/
      e[31][0] * 100}%;width:${/*range*/
      (e[31][1] - /*range*/
      e[31][0]) * 100}%`), y(t, "data-index", `mask_${/*index*/
      e[33]}`);
    },
    m(o, r) {
      J(o, t, r);
    },
    p(o, r) {
      r[0] & /*maskRanges*/
      4 && n !== (n = `left: ${/*range*/
      o[31][0] * 100}%;width:${/*range*/
      (o[31][1] - /*range*/
      o[31][0]) * 100}%`) && y(t, "style", n);
    },
    d(o) {
      o && Y(t);
    }
  };
}
function zi(e) {
  let t, n, o, r = (
    /*maskRanges*/
    e[2]
  ), i = [];
  for (let s = 0; s < r.length; s += 1)
    i[s] = Zn(Xn(e, r, s));
  return {
    c() {
      t = X("div");
      for (let s = 0; s < i.length; s += 1)
        i[s].c();
      y(t, "class", "PinturaVideoFrames");
    },
    m(s, c) {
      J(s, t, c);
      for (let u = 0; u < i.length; u += 1)
        i[u] && i[u].m(t, null);
      n || (o = [
        de(
          t,
          "measure",
          /*measure_handler*/
          e[23]
        ),
        qe(
          /*measurable*/
          e[3].call(null, t, { observePosition: !0 })
        )
      ], n = !0);
    },
    p(s, c) {
      if (c[0] & /*maskRanges*/
      4) {
        r = /*maskRanges*/
        s[2];
        let u;
        for (u = 0; u < r.length; u += 1) {
          const l = Xn(s, r, u);
          i[u] ? i[u].p(l, c) : (i[u] = Zn(l), i[u].c(), i[u].m(t, null));
        }
        for (; u < i.length; u += 1)
          i[u].d(1);
        i.length = r.length;
      }
    },
    i: ne,
    o: ne,
    d(s) {
      s && Y(t), go(i, s), n = !1, we(o);
    }
  };
}
function Ui(e, t, n) {
  let o, r, i, s, c, u, l, f, d, v, h, w, { video: p } = t, { videoSize: b } = t, { cropAspectRatio: C } = t, { pixelRatio: P } = t, { onchange: R = Ce } = t, { frameBackgroundColor: M } = t, { frameScaleFactor: S = 2 } = t, { frameLimit: L = 16 } = t, { ranges: I } = t;
  const E = _t("measurable"), z = st() && document.createElement("canvas");
  let D = [], B;
  const H = Oi(bo, 0, {
    stiffness: 0.2,
    damping: 0.7,
    precision: 0.01
  });
  le(e, H, (a) => n(22, w = a));
  const Q = () => {
    D.forEach((re) => eo(re)), D = [], H.reset();
    const a = p.cloneNode();
    let m = !1, _ = !1, k = 0, F = 1, O = 0;
    const q = () => {
      if (m || !_)
        return;
      const re = document.createElement("canvas");
      if (re.width = v, re.height = h, re.getContext("2d").drawImage(a, 0, 0, v, h), re.dataset.retain = !0, D = [...D, re], H.set(O, 1), O++, k += F, k + F * 0.5 >= p.duration) {
        setTimeout(
          () => {
            a.removeEventListener("seeked", K), a.removeEventListener("error", Z), a.src = "", a.remove();
          },
          0
        );
        return;
      }
      cn(a, k + F * 0.5);
    }, V = () => {
      a.removeEventListener("loadeddata", V), !m && (F = p.duration / l, k = 0, _ = !0, cn(a, F * 0.5));
    }, K = () => {
      q();
    }, Z = () => {
      console.error(a.error);
    };
    return a.addEventListener("seeked", K), a.addEventListener("error", Z), $t() && a.load(), a.readyState > 0 ? V() : a.addEventListener("loadeddata", V), () => {
      a.removeEventListener("seeked", K), a.removeEventListener("error", Z), a.removeEventListener("loadeddata", V), m = !0;
    };
  }, U = () => {
    D = [], H.reset();
    let a = p.duration / l, m = !1;
    const _ = (k, F) => {
      const O = p.cloneNode(), q = () => {
        m || (O.currentTime = F, D[k] = O, H.set(k, 1));
      };
      O.readyState > 0 ? q() : O.onloadeddata = q, $t() && O.load();
    };
    for (let k = 0; k < l; k++) {
      const F = k * a + a * 0.5;
      _(k, F);
    }
    return () => {
      m = !0;
    };
  };
  let N;
  const oe = (a, m, _) => {
    const k = [];
    for (let F = 0; F < a; F++) {
      const O = F, q = Math.min(1, m[O]), V = _.width / a, K = _.height, Z = V * O;
      k.push({
        itemRect: { x: Z, y: 0, width: V, height: K },
        // fade in
        opacity: Math.min(q, 1),
        // placeholder background color while we wait for image to load
        backgroundColor: [...M],
        // frame data
        data: D[O] || z,
        // data size
        dataSize: { width: f, height: d }
      });
    }
    R(k);
  }, A = (a) => n(0, B = a.detail);
  return e.$$set = (a) => {
    "video" in a && n(4, p = a.video), "videoSize" in a && n(5, b = a.videoSize), "cropAspectRatio" in a && n(6, C = a.cropAspectRatio), "pixelRatio" in a && n(7, P = a.pixelRatio), "onchange" in a && n(8, R = a.onchange), "frameBackgroundColor" in a && n(9, M = a.frameBackgroundColor), "frameScaleFactor" in a && n(10, S = a.frameScaleFactor), "frameLimit" in a && n(11, L = a.frameLimit), "ranges" in a && n(12, I = a.ranges);
  }, e.$$.update = () => {
    e.$$.dirty[0] & /*ranges*/
    4096 && n(2, o = I.map(([a, m], _) => {
      const [, k] = I[_ - 1] || [, 0];
      return [k, a];
    }).concat([[I[I.length - 1][1], 1]])), e.$$.dirty[0] & /*videoFrameContainerRect*/
    1 && n(15, r = B && B.width && B.height), e.$$.dirty[0] & /*video, videoSize*/
    48 && n(18, i = p && b.width / b.height), e.$$.dirty[0] & /*cropAspectRatio, videoAspectRatio*/
    262208 && n(20, s = C || i), e.$$.dirty[0] & /*videoFrameContainerRectHasSize, videoFrameContainerRect*/
    32769 && n(21, c = r && B.width / B.height), e.$$.dirty[0] & /*videoFramesContainerAspectRatio, frameAspectRatio*/
    3145728 && n(19, u = c && s && Math.ceil(c / s)), e.$$.dirty[0] & /*videoFramesMax, frameLimit*/
    526336 && n(14, l = u && Math.min(L, u)), e.$$.dirty[0] & /*videoFrameContainerRect, videoFramesTotal*/
    16385 && n(17, f = B && l && B.width / l), e.$$.dirty[0] & /*frameWidth, videoAspectRatio*/
    393216 && n(16, d = f && f / i), e.$$.dirty[0] & /*videoFramesTotal*/
    16384 && n(1, H.length = l, H), e.$$.dirty[0] & /*frameWidth, pixelRatio, frameScaleFactor*/
    132224 && (v = f && Math.floor(f * P * S)), e.$$.dirty[0] & /*frameHeight, pixelRatio, frameScaleFactor*/
    66688 && (h = d && Math.floor(d * P * S)), e.$$.dirty[0] & /*video, videoFramesTotal, cancelFrameRedrawAction*/
    24592 && p && l && (N && N(), n(13, N = Dt() && Jo() ? U() : Q())), e.$$.dirty[0] & /*videoFrameContainerRectHasSize, videoFramesTotal, $videoFrameOpacitySprings, videoFrameContainerRect*/
    4243457 && r && oe(l, w, B);
  }, [
    B,
    H,
    o,
    E,
    p,
    b,
    C,
    P,
    R,
    M,
    S,
    L,
    I,
    N,
    l,
    r,
    d,
    f,
    i,
    u,
    s,
    c,
    w,
    A
  ];
}
class Vi extends Ae {
  constructor(t) {
    super(), Fe(
      this,
      t,
      Ui,
      zi,
      Pe,
      {
        video: 4,
        videoSize: 5,
        cropAspectRatio: 6,
        pixelRatio: 7,
        onchange: 8,
        frameBackgroundColor: 9,
        frameScaleFactor: 10,
        frameLimit: 11,
        ranges: 12
      },
      null,
      [-1, -1]
    );
  }
}
function Yn(e) {
  let t, n;
  return {
    c() {
      t = new Fr(!1), n = po(), t.a = n;
    },
    m(o, r) {
      t.m(
        /*svg*/
        e[1],
        o,
        r
      ), J(o, n, r);
    },
    p(o, r) {
      r & /*svg*/
      2 && t.p(
        /*svg*/
        o[1]
      );
    },
    d(o) {
      o && Y(n), o && t.d();
    }
  };
}
function ji(e) {
  let t, n, o, r = (
    /*svg*/
    e[1] && Yn(e)
  );
  return {
    c() {
      t = X("div"), r && r.c(), y(t, "class", "PinturaMeter");
    },
    m(i, s) {
      J(i, t, s), r && r.m(t, null), n || (o = [
        de(
          t,
          "measure",
          /*measure_handler*/
          e[6]
        ),
        qe(
          /*measurable*/
          e[2].call(null, t)
        )
      ], n = !0);
    },
    p(i, [s]) {
      /*svg*/
      i[1] ? r ? r.p(i, s) : (r = Yn(i), r.c(), r.m(t, null)) : r && (r.d(1), r = null);
    },
    i: ne,
    o: ne,
    d(i) {
      i && Y(t), r && r.d(), n = !1, we(o);
    }
  };
}
function Ki(e, t, n) {
  let { steps: o = 10 } = t, { skipFirst: r = !1 } = t, { skipLast: i = !1 } = t, { size: s = void 0 } = t;
  const c = _t("measurable");
  let u;
  const l = { x: 2, y: 0 }, f = (v, h, w) => `M ${v} ${h} L${v} ${h + w}`, d = (v) => n(0, s = ar(v.detail));
  return e.$$set = (v) => {
    "steps" in v && n(3, o = v.steps), "skipFirst" in v && n(4, r = v.skipFirst), "skipLast" in v && n(5, i = v.skipLast), "size" in v && n(0, s = v.size);
  }, e.$$.update = () => {
    if (e.$$.dirty & /*size, steps, skipFirst, skipLast*/
    57 && s) {
      let v, h, w = "", p, b = s.y;
      const C = s.x / o;
      for (let P = 0; P <= o; P++)
        if (v = l.x + P * C, h = 0, !(P === 0 && r)) {
          if (P === o && i)
            break;
          w += f(v, h, 4) + " ";
        }
      p = v + l.x, n(1, u = `<svg width="${p}" height="${b}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${p} ${b}" aria-hidden="true" focusable="false"><path fill-rule="evenodd" d="${w.trim()}"/></svg>`);
    }
  }, [s, u, c, o, r, i, d];
}
class Ni extends Ae {
  constructor(t) {
    super(), Fe(this, t, Ki, ji, Pe, {
      steps: 3,
      skipFirst: 4,
      skipLast: 5,
      size: 0
    });
  }
}
const Hi = (e) => {
  const t = Math.floor(e / 3600), n = Math.floor((e - t * 3600) / 60), o = Math.round(e - t * 3600 - n * 60);
  return [t, n, o];
}, un = (e) => Hi(e).filter((t, n) => n === 0 ? t > 0 : !0).map((t, n) => n > 0 ? `${t}`.padStart(2, "0") : t).join(":");
function qi(e) {
  let t, n, o, r, i, s, c, u, l, f, d, v, h;
  function w(b) {
    e[6](b);
  }
  let p = {
    steps: 16,
    skipFirst: !0,
    skipLast: !0
  };
  return (
    /*meterSize*/
    e[0] !== void 0 && (p.size = /*meterSize*/
    e[0]), n = new Ni({ props: p }), ze.push(() => Vr(n, "size", w)), {
      c() {
        t = X("div"), he(n.$$.fragment), r = ae(), i = X("div"), s = X("time"), c = ht(
          /*start*/
          e[1]
        ), u = ae(), l = X("time"), f = ht(
          /*end*/
          e[2]
        ), y(i, "class", "timeLabels"), y(t, "class", "PinturaTimeline");
      },
      m(b, C) {
        J(b, t, C), ue(n, t, null), G(t, r), G(t, i), G(i, s), G(s, c), G(i, u), G(i, l), G(l, f), d = !0, v || (h = [
          de(
            t,
            "measure",
            /*measure_handler*/
            e[5]
          ),
          qe(
            /*measurable*/
            e[3].call(null, t)
          )
        ], v = !0);
      },
      p(b, [C]) {
        const P = {};
        !o && C & /*meterSize*/
        1 && (o = !0, P.size = /*meterSize*/
        b[0], Dr(() => o = !1)), n.$set(P), (!d || C & /*start*/
        2) && en(
          c,
          /*start*/
          b[1]
        ), (!d || C & /*end*/
        4) && en(
          f,
          /*end*/
          b[2]
        );
      },
      i(b) {
        d || (j(n.$$.fragment, b), d = !0);
      },
      o(b) {
        W(n.$$.fragment, b), d = !1;
      },
      d(b) {
        b && Y(t), fe(n), v = !1, we(h);
      }
    }
  );
}
function Wi(e, t, n) {
  let o, r, { duration: i } = t;
  const s = _t("measurable");
  let c;
  function u(f) {
    mn.call(this, e, f);
  }
  function l(f) {
    c = f, n(0, c);
  }
  return e.$$set = (f) => {
    "duration" in f && n(4, i = f.duration);
  }, e.$$.update = () => {
    e.$$.dirty & /*duration*/
    16 && n(2, o = un(i));
  }, n(1, r = un(0)), [
    c,
    r,
    o,
    s,
    i,
    u,
    l
  ];
}
class Gi extends Ae {
  constructor(t) {
    super(), Fe(this, t, Wi, qi, Pe, { duration: 4 });
  }
}
function Xi(e) {
  let t, n;
  return {
    c() {
      t = X("span"), n = ht(
        /*videoTime*/
        e[4]
      ), y(t, "slot", "knob");
    },
    m(o, r) {
      J(o, t, r), G(t, n);
    },
    p(o, r) {
      r & /*videoTime*/
      16 && en(
        n,
        /*videoTime*/
        o[4]
      );
    },
    d(o) {
      o && Y(t);
    }
  };
}
function Zi(e) {
  let t, n;
  return t = new ln({
    props: {
      class: "PinturaActiveFrame",
      enableSpinButtons: !1,
      enableStopPropagation: !1,
      knobClass: "PinturaActiveFrameKnob",
      value: (
        /*frameOffset*/
        e[0]
      ),
      onchange: (
        /*onchange*/
        e[2]
      ),
      onrelease: (
        /*onrelease*/
        e[3]
      ),
      min: 0,
      max: 1,
      step: (
        /*precision*/
        e[1]
      ),
      $$slots: { knob: [Xi] },
      $$scope: { ctx: e }
    }
  }), {
    c() {
      he(t.$$.fragment);
    },
    m(o, r) {
      ue(t, o, r), n = !0;
    },
    p(o, [r]) {
      const i = {};
      r & /*frameOffset*/
      1 && (i.value = /*frameOffset*/
      o[0]), r & /*onchange*/
      4 && (i.onchange = /*onchange*/
      o[2]), r & /*onrelease*/
      8 && (i.onrelease = /*onrelease*/
      o[3]), r & /*precision*/
      2 && (i.step = /*precision*/
      o[1]), r & /*$$scope, videoTime*/
      80 && (i.$$scope = { dirty: r, ctx: o }), t.$set(i);
    },
    i(o) {
      n || (j(t.$$.fragment, o), n = !0);
    },
    o(o) {
      W(t.$$.fragment, o), n = !1;
    },
    d(o) {
      fe(t, o);
    }
  };
}
function Yi(e, t, n) {
  let o, { frameOffset: r } = t, { duration: i } = t, { precision: s } = t, { onchange: c } = t, { onrelease: u } = t;
  return e.$$set = (l) => {
    "frameOffset" in l && n(0, r = l.frameOffset), "duration" in l && n(5, i = l.duration), "precision" in l && n(1, s = l.precision), "onchange" in l && n(2, c = l.onchange), "onrelease" in l && n(3, u = l.onrelease);
  }, e.$$.update = () => {
    e.$$.dirty & /*frameOffset, duration*/
    33 && n(4, o = un(r * i));
  }, [r, s, c, u, o, i];
}
class Ji extends Ae {
  constructor(t) {
    super(), Fe(this, t, Yi, Zi, Pe, {
      frameOffset: 0,
      duration: 5,
      precision: 1,
      onchange: 2,
      onrelease: 3
    });
  }
}
function Jn(e) {
  let t, n;
  return t = new an({
    props: {
      disabled: !/*canSplitVideo*/
      (e[9] ? !/*shouldDisableSplitVideo*/
      e[20] : (
        /*canMergeVideo*/
        e[21] && !/*shouldDisableMergeVideo*/
        e[19]
      )),
      onclick: (
        /*func*/
        e[77]
      ),
      label: (
        /*canSplitVideo*/
        e[9] ? (
          /*locale*/
          e[3].trimLabelSplit
        ) : (
          /*locale*/
          e[3].trimLabelMerge
        )
      ),
      icon: (
        /*canSplitVideo*/
        e[9] ? (
          /*locale*/
          e[3].trimIconButtonSplit
        ) : (
          /*locale*/
          e[3].trimIconButtonMerge
        )
      ),
      class: "PinturaButtonSplit"
    }
  }), {
    c() {
      he(t.$$.fragment);
    },
    m(o, r) {
      ue(t, o, r), n = !0;
    },
    p(o, r) {
      const i = {};
      r[0] & /*canSplitVideo, shouldDisableSplitVideo, canMergeVideo, shouldDisableMergeVideo*/
      3670528 && (i.disabled = !/*canSplitVideo*/
      (o[9] ? !/*shouldDisableSplitVideo*/
      o[20] : (
        /*canMergeVideo*/
        o[21] && !/*shouldDisableMergeVideo*/
        o[19]
      ))), r[0] & /*canSplitVideo*/
      512 && (i.onclick = /*func*/
      o[77]), r[0] & /*canSplitVideo, locale*/
      520 && (i.label = /*canSplitVideo*/
      o[9] ? (
        /*locale*/
        o[3].trimLabelSplit
      ) : (
        /*locale*/
        o[3].trimLabelMerge
      )), r[0] & /*canSplitVideo, locale*/
      520 && (i.icon = /*canSplitVideo*/
      o[9] ? (
        /*locale*/
        o[3].trimIconButtonSplit
      ) : (
        /*locale*/
        o[3].trimIconButtonMerge
      )), t.$set(i);
    },
    i(o) {
      n || (j(t.$$.fragment, o), n = !0);
    },
    o(o) {
      W(t.$$.fragment, o), n = !1;
    },
    d(o) {
      fe(t, o);
    }
  };
}
function Qi(e) {
  let t, n, o, r, i, s, c, u, l, f, d, v, h, w, p, b, C, P;
  r = new an({
    props: {
      onclick: (
        /*togglePlay*/
        e[47]
      ),
      label: (
        /*isPlaying*/
        e[17] ? (
          /*locale*/
          e[3].trimLabelPause
        ) : (
          /*locale*/
          e[3].trimLabelPlay
        )
      ),
      icon: (
        /*isPlaying*/
        e[17] ? (
          /*locale*/
          e[3].trimIconButtonPause
        ) : (
          /*locale*/
          e[3].trimIconButtonPlay
        )
      ),
      class: "PinturaButtonPlay",
      hideLabel: !0
    }
  }), s = new an({
    props: {
      onclick: (
        /*toggleMute*/
        e[48]
      ),
      label: (
        /*$muteAudioStore*/
        e[23] ? (
          /*locale*/
          e[3].trimLabelUnmute
        ) : (
          /*locale*/
          e[3].trimLabelMute
        )
      ),
      icon: (
        /*$muteAudioStore*/
        e[23] ? (
          /*locale*/
          e[3].trimIconButtonUnmute
        ) : (
          /*locale*/
          e[3].trimIconButtonMute
        )
      ),
      class: "PinturaButtonMute",
      hideLabel: !0
    }
  });
  let R = (
    /*trimEnableSplit*/
    e[2] && Jn(e)
  );
  return l = new Gi({
    props: { duration: (
      /*$mediaDuration*/
      e[16]
    ) }
  }), l.$on(
    "measure",
    /*measure_handler_1*/
    e[78]
  ), d = new Vi({
    props: {
      video: (
        /*$imagePreview*/
        e[15]
      ),
      videoSize: (
        /*$imageSize*/
        e[22]
      ),
      cropAspectRatio: (
        /*$imageCropRectAspectRatio*/
        e[13]
      ),
      ranges: (
        /*clipRanges*/
        e[10]
      ),
      pixelRatio: (
        /*$pixelRatio*/
        e[24]
      ),
      frameBackgroundColor: (
        /*$rootForegroundColor*/
        e[25]
      ),
      onchange: (
        /*func_1*/
        e[79]
      )
    }
  }), h = new Di({
    props: {
      ranges: (
        /*clipRanges*/
        e[10]
      ),
      minSize: (
        /*clipMinSize*/
        e[11]
      ),
      maxSize: (
        /*clipMaxSize*/
        e[12]
      ),
      precision: Qn,
      onchange: (
        /*func_2*/
        e[80]
      ),
      ondragrange: (
        /*func_3*/
        e[81]
      ),
      onrelease: (
        /*func_4*/
        e[82]
      )
    }
  }), p = new Ji({
    props: {
      frameOffset: (
        /*frameOffset*/
        e[7]
      ),
      duration: (
        /*$mediaDuration*/
        e[16]
      ),
      precision: Qn,
      onchange: (
        /*didDragActiveFrame*/
        e[44]
      ),
      onrelease: (
        /*didReleaseActiveFrame*/
        e[45]
      )
    }
  }), {
    c() {
      t = X("div"), n = X("div"), o = X("div"), he(r.$$.fragment), i = ae(), he(s.$$.fragment), c = ae(), R && R.c(), u = ae(), he(l.$$.fragment), f = ae(), he(d.$$.fragment), v = ae(), he(h.$$.fragment), w = ae(), he(p.$$.fragment), y(o, "class", "PinturaTrimControls"), y(n, "class", "PinturaVideoTrimmer"), y(t, "slot", "footer"), y(
        t,
        "style",
        /*footerStyle*/
        e[18]
      );
    },
    m(M, S) {
      J(M, t, S), G(t, n), G(n, o), ue(r, o, null), G(o, i), ue(s, o, null), G(o, c), R && R.m(o, null), G(n, u), ue(l, n, null), G(n, f), ue(d, n, null), G(n, v), ue(h, n, null), G(n, w), ue(p, n, null), b = !0, C || (P = [
        de(
          n,
          "keydown",
          /*keydown_handler*/
          e[83]
        ),
        de(
          n,
          "measure",
          /*measure_handler_2*/
          e[84]
        ),
        qe(
          /*measurable*/
          e[26].call(null, n, { observePosition: !0 })
        ),
        de(
          t,
          "measure",
          /*measure_handler_3*/
          e[85]
        ),
        qe(
          /*measurable*/
          e[26].call(null, t, { observePosition: !0 })
        )
      ], C = !0);
    },
    p(M, S) {
      const L = {};
      S[0] & /*isPlaying, locale*/
      131080 && (L.label = /*isPlaying*/
      M[17] ? (
        /*locale*/
        M[3].trimLabelPause
      ) : (
        /*locale*/
        M[3].trimLabelPlay
      )), S[0] & /*isPlaying, locale*/
      131080 && (L.icon = /*isPlaying*/
      M[17] ? (
        /*locale*/
        M[3].trimIconButtonPause
      ) : (
        /*locale*/
        M[3].trimIconButtonPlay
      )), r.$set(L);
      const I = {};
      S[0] & /*$muteAudioStore, locale*/
      8388616 && (I.label = /*$muteAudioStore*/
      M[23] ? (
        /*locale*/
        M[3].trimLabelUnmute
      ) : (
        /*locale*/
        M[3].trimLabelMute
      )), S[0] & /*$muteAudioStore, locale*/
      8388616 && (I.icon = /*$muteAudioStore*/
      M[23] ? (
        /*locale*/
        M[3].trimIconButtonUnmute
      ) : (
        /*locale*/
        M[3].trimIconButtonMute
      )), s.$set(I), /*trimEnableSplit*/
      M[2] ? R ? (R.p(M, S), S[0] & /*trimEnableSplit*/
      4 && j(R, 1)) : (R = Jn(M), R.c(), j(R, 1), R.m(o, null)) : R && (rt(), W(R, 1, 1, () => {
        R = null;
      }), it());
      const E = {};
      S[0] & /*$mediaDuration*/
      65536 && (E.duration = /*$mediaDuration*/
      M[16]), l.$set(E);
      const z = {};
      S[0] & /*$imagePreview*/
      32768 && (z.video = /*$imagePreview*/
      M[15]), S[0] & /*$imageSize*/
      4194304 && (z.videoSize = /*$imageSize*/
      M[22]), S[0] & /*$imageCropRectAspectRatio*/
      8192 && (z.cropAspectRatio = /*$imageCropRectAspectRatio*/
      M[13]), S[0] & /*clipRanges*/
      1024 && (z.ranges = /*clipRanges*/
      M[10]), S[0] & /*$pixelRatio*/
      16777216 && (z.pixelRatio = /*$pixelRatio*/
      M[24]), S[0] & /*$rootForegroundColor*/
      33554432 && (z.frameBackgroundColor = /*$rootForegroundColor*/
      M[25]), S[0] & /*framePreviews*/
      256 && (z.onchange = /*func_1*/
      M[79]), d.$set(z);
      const D = {};
      S[0] & /*clipRanges*/
      1024 && (D.ranges = /*clipRanges*/
      M[10]), S[0] & /*clipMinSize*/
      2048 && (D.minSize = /*clipMinSize*/
      M[11]), S[0] & /*clipMaxSize*/
      4096 && (D.maxSize = /*clipMaxSize*/
      M[12]), S[0] & /*$imagePreview*/
      32768 && (D.ondragrange = /*func_3*/
      M[81]), h.$set(D);
      const B = {};
      S[0] & /*frameOffset*/
      128 && (B.frameOffset = /*frameOffset*/
      M[7]), S[0] & /*$mediaDuration*/
      65536 && (B.duration = /*$mediaDuration*/
      M[16]), p.$set(B), (!b || S[0] & /*footerStyle*/
      262144) && y(
        t,
        "style",
        /*footerStyle*/
        M[18]
      );
    },
    i(M) {
      b || (j(r.$$.fragment, M), j(s.$$.fragment, M), j(R), j(l.$$.fragment, M), j(d.$$.fragment, M), j(h.$$.fragment, M), j(p.$$.fragment, M), b = !0);
    },
    o(M) {
      W(r.$$.fragment, M), W(s.$$.fragment, M), W(R), W(l.$$.fragment, M), W(d.$$.fragment, M), W(h.$$.fragment, M), W(p.$$.fragment, M), b = !1;
    },
    d(M) {
      M && Y(t), fe(r), fe(s), R && R.d(), fe(l), fe(d), fe(h), fe(p), C = !1, we(P);
    }
  };
}
function xi(e) {
  let t, n, o, r;
  return t = new Si({
    props: {
      $$slots: { footer: [Qi] },
      $$scope: { ctx: e }
    }
  }), t.$on(
    "measure",
    /*measure_handler*/
    e[86]
  ), {
    c() {
      he(t.$$.fragment);
    },
    m(i, s) {
      ue(t, i, s), n = !0, o || (r = de(window, "keydown", function() {
        Re(
          /*$isActive*/
          e[14] && /*handleWindowKeydown*/
          e[49]
        ) && /*$isActive*/
        (e[14] && /*handleWindowKeydown*/
        e[49]).apply(this, arguments);
      }), o = !0);
    },
    p(i, s) {
      e = i;
      const c = {};
      s[0] & /*footerStyle, footerRect, videoTrimmerContainerRect, frameOffset, $mediaDuration, clipRanges, clipMinSize, clipMaxSize, $imagePreview, $imageSize, $imageCropRectAspectRatio, $pixelRatio, $rootForegroundColor, framePreviews, timelineSize, canSplitVideo, shouldDisableSplitVideo, canMergeVideo, shouldDisableMergeVideo, locale, trimEnableSplit, $muteAudioStore, isPlaying*/
      67092476 | s[3] & /*$$scope*/
      262144 && (c.$$scope = { dirty: s, ctx: e }), t.$set(c);
    },
    i(i) {
      n || (j(t.$$.fragment, i), n = !0);
    },
    o(i) {
      W(t.$$.fragment, i), n = !1;
    },
    d(i) {
      fe(t, i), o = !1, r();
    }
  };
}
const Qn = 1e-5, xt = 5e-3;
function $i(e, t, n) {
  let o, r, i, s, c, u, l, f, d, v, h, w, p, b, C, P, R, M, S, L = ne, I = () => (L(), L = Lt(me, (g) => n(14, S = g)), me), E, z, D, B, H = ne, Q = () => (H(), H = Lt(be, (g) => n(69, B = g)), be), U, N, oe, A, a, m, _, k, F, O, q, V, K, Z;
  e.$$.on_destroy.push(() => L()), e.$$.on_destroy.push(() => H());
  const re = !0, ge = "trim";
  let { isActive: me } = t;
  I();
  let { isActiveFraction: be } = t;
  Q();
  let { stores: ee } = t, { trimEnableSplit: te = !0 } = t, { locale: pe = {} } = t;
  const ce = _t("measurable"), { imagePreview: Me, imageEffects: Ee, imageCropRectAspectRatio: Ue, imageSize: Se, animation: Le, pixelRatio: Ze, stageRectBase: Be, interfaceImages: Ie, mediaDuration: T, mediaTrim: ie, rootForegroundColor: ke, utilRect: ve, history: Te, redrawTrigger: _e, imageCropRect: Ye, imageRotation: yt, imageFlipX: Mo, imageFlipY: vo, allowPan: So, allowZoom: ko, allowZoomControls: Po, muteAudioStore: wt, mediaMinDuration: pn, mediaMaxDuration: _n } = ee;
  le(e, Me, (g) => n(15, E = g)), le(e, Ee, (g) => n(68, D = g)), le(e, Ue, (g) => n(13, M = g)), le(e, Se, (g) => n(22, N = g)), le(e, Le, (g) => n(73, _ = g)), le(e, Ze, (g) => n(24, K = g)), le(e, Be, (g) => n(72, m = g)), le(e, Ie, (g) => n(94, oe = g)), le(e, T, (g) => n(16, F = g)), le(e, ie, (g) => n(74, O = g)), le(e, ke, (g) => n(25, Z = g)), le(e, ve, (g) => n(71, a = g)), le(e, Ye, (g) => n(93, U = g)), le(e, wt, (g) => n(23, k = g)), le(e, pn, (g) => n(76, V = g)), le(e, _n, (g) => n(75, q = g));
  const Ot = () => {
    E.setAttribute("data-redraw", "true"), _e.set({});
  };
  let bt, Mt, vt, yn, zt;
  const Eo = (g) => {
    n(7, x = g), Pt();
  };
  let St;
  const To = (g) => {
    St === void 0 && (St = !E.paused), Eo(g);
  }, Co = () => {
    St && bn(), St = void 0;
  };
  let Ut = !1, x = 0;
  const Ro = () => {
    n(57, Ut = !0), n(7, x = E.currentTime / F);
  }, kt = (g, $) => {
    if (!E.paused)
      return;
    const se = Date.now();
    if (zt && se - zt < 16)
      return;
    zt = se;
    const ye = F * g;
    ye.toFixed(1) !== yn && (yn = ye.toFixed(1), $.addEventListener("seeked", Ot), cn($, ye));
  };
  let wn;
  const Fo = () => {
    wt.set(!1);
  }, Ao = () => {
    wt.set(!0);
  }, Pt = () => {
    E.paused || (E.pause(), cancelAnimationFrame(wn), n(7, x = E.currentTime / F), Ot());
  };
  let Vt = !1;
  const bn = () => {
    if (!E.paused)
      return;
    const g = E;
    Vt = !1, x >= l && (n(7, x = u), kt(x, E)), g.currentTime = F * x, g.play().catch(() => {
    });
    const $ = () => {
      E.paused || (wn = requestAnimationFrame($), n(7, x = g.currentTime / g.duration), x >= l && (n(7, x = l), Pt()), v > -1 && (Vt = !0), Vt && v === -1 && h > 0 && (n(7, x = i[h][0]), g.currentTime = x * g.duration), Ot());
    };
    $();
  }, jt = () => E.paused ? bn() : Pt(), Lo = () => k ? Fo() : Ao(), Bo = (g) => {
    const { keyCode: $ } = g;
    $ === 32 && (g.target && /button|textarea|input/i.test(g.target.nodeName) || jt());
  }, Mn = () => {
    const g = i.findIndex(([ct, Je]) => x > ct && x < Je), [$, se] = i[g], ye = [...i], We = [$, x - xt], lt = [x + xt, se];
    ye.splice(g, 1, We, lt), ie.set(ye), Te.write();
  }, vn = () => {
    const g = [...i], $ = i.findIndex(([ye]) => x < ye) - 1, se = i.length - [...i].reverse().findIndex(([ye, We]) => x > We);
    g.splice($, 2, [i[$][0], i[se][1]]), ie.set(g), Te.write();
  }, Kt = bo(_ ? 20 : 0);
  le(e, Kt, (g) => n(70, A = g));
  let at;
  const Sn = () => oe.filter((g) => g.id !== "trim"), Io = (g, $, { transforms: se, effects: ye }) => {
    const We = at.x, lt = at.y;
    return g.map((ct, Je) => {
      const { itemRect: Qe, opacity: Ht, backgroundColor: qt, data: Tt, dataSize: Ct } = ct, ut = {
        x: We + Qe.x,
        y: lt + Qe.y,
        width: Qe.width,
        height: Qe.height
      };
      let Wt = [0, 0, 0, 0];
      Je === 0 ? Wt = [6, 0, 6, 0] : Je === g.length - 1 && (Wt = [0, 6, 0, 6]);
      const Wo = {
        x: ut.x + ut.width * 0.5,
        y: Math.floor(ut.y + ut.height * 0.5)
      }, Go = {
        width: N.width,
        height: N.height
      }, Xo = {
        x: se.origin.x,
        y: se.origin.y
      }, Zo = {
        x: se.translation.x,
        y: se.translation.y
      }, Yo = Math.max(Ct.width / U.width, Ct.height / U.height);
      return {
        // apply current image effects
        ...ye,
        // no blurring / sharpening as is too gpu intensive
        convolutionMatrix: void 0,
        // frame
        id: "trim",
        backgroundColor: qt,
        data: Tt,
        offset: Wo,
        size: Go,
        mask: ut,
        maskCornerRadius: Wt,
        opacity: Math.min(Ht, $),
        scale: Yo,
        origin: Xo,
        translation: Zo,
        rotation: se.rotation
      };
    });
  }, kn = Nr([me, Ye, Se, yt, Mo, vo], ([
    g,
    // $canvasSize,
    $,
    se,
    ye,
    We,
    lt
  ], ct) => {
    if (!g || !se)
      return z;
    const Je = io(se), Qe = tt(Je), Ht = Hr(se, $, ye), qt = tt(Ht), Tt = ro(Tn(Qe), qt), Ct = lr(Tn(Tt));
    ct({
      origin: Ct,
      translation: Tt,
      rotation: {
        x: lt ? Math.PI : 0,
        y: We ? Math.PI : 0,
        z: ye
      }
    });
  });
  le(e, kn, (g) => n(67, z = g));
  let Et, Nt;
  const Do = () => w ? Mn() : vn(), Oo = (g) => n(6, vt = g.detail), zo = (g) => n(8, Et = g), Uo = (g) => ie.set(g), Vo = (g) => {
    kt(g, E);
  }, jo = () => {
    Te.write();
  }, Ko = (g) => /space/i.test(g.code) && jt(), No = (g) => n(5, Mt = g.detail), Ho = (g) => n(4, bt = g.detail);
  function qo(g) {
    mn.call(this, e, g);
  }
  return e.$$set = (g) => {
    "isActive" in g && I(n(0, me = g.isActive)), "isActiveFraction" in g && Q(n(1, be = g.isActiveFraction)), "stores" in g && n(56, ee = g.stores), "trimEnableSplit" in g && n(2, te = g.trimEnableSplit), "locale" in g && n(3, pe = g.locale);
  }, e.$$.update = () => {
    if (e.$$.dirty[0] & /*$isActive*/
    16384 && So.set(S), e.$$.dirty[0] & /*$isActive*/
    16384 && ko.set(S), e.$$.dirty[0] & /*$isActive*/
    16384 && Po.set(S), e.$$.dirty[0] & /*$mediaDuration*/
    65536 | e.$$.dirty[2] & /*$mediaMinDuration*/
    16384 && n(11, o = V / F), e.$$.dirty[0] & /*$mediaDuration*/
    65536 | e.$$.dirty[2] & /*$mediaMaxDuration*/
    8192 && n(12, r = Math.min(F, q) / F), e.$$.dirty[0] & /*clipMaxSize*/
    4096 | e.$$.dirty[2] & /*$mediaTrim*/
    4096 && n(10, i = O || [[0, r]]), e.$$.dirty[0] & /*clipRanges*/
    1024 && n(66, s = i.reduce((g, [$, se]) => g + (se - $), 0)), e.$$.dirty[0] & /*clipMinSize*/
    2048 | e.$$.dirty[2] & /*clipRangeSpaceTotal*/
    16 && n(62, c = s - o), e.$$.dirty[1] & /*frameOffsetInitialised*/
    67108864 && (Ut || Ro()), e.$$.dirty[0] & /*clipRanges*/
    1024 && n(61, u = i[0][0]), e.$$.dirty[0] & /*clipRanges*/
    1024 && n(60, l = i[i.length - 1][1]), e.$$.dirty[0] & /*$imagePreview, $mediaDuration, frameOffset*/
    98432 && E && F && kt(x, E), e.$$.dirty[0] & /*$isActive*/
    16384 && (S || Pt()), e.$$.dirty[0] & /*frameOffset*/
    128 && n(64, f = Ve(x, 6)), e.$$.dirty[0] & /*clipRanges*/
    1024 && n(65, d = i.map(([g, $]) => [Ve(g, 6), Ve($, 6)])), e.$$.dirty[2] & /*clipRangesFixes, frameOffsetFixed*/
    12 && n(63, v = d.findIndex(([g, $]) => f >= g && f <= $)), e.$$.dirty[0] & /*clipRanges, frameOffset*/
    1152 | e.$$.dirty[2] & /*currentClipIndex*/
    2 && (h = v === -1 && i.findIndex((g, $) => {
      const se = i[$ - 1];
      return se ? x <= g[0] && x >= se[1] : x <= g[0];
    })), e.$$.dirty[2] & /*currentClipIndex*/
    2 && n(9, w = v > -1), e.$$.dirty[0] & /*canSplitVideo*/
    512 && n(21, p = !w), e.$$.dirty[2] & /*clipRangeSpaceAvailableMin*/
    1 && n(20, b = c < xt * 2), e.$$.dirty[0] & /*frameOffset*/
    128 | e.$$.dirty[1] & /*trimFirst, trimLast*/
    1610612736 && n(19, C = x < u || x > l), e.$$.dirty[0] & /*$isActive*/
    16384 | e.$$.dirty[2] & /*$animation*/
    2048 && _ && Kt.set(S ? 0 : 20), e.$$.dirty[2] & /*$footerOffset*/
    256 && n(18, P = A ? `transform: translateY(${A}px)` : void 0), e.$$.dirty[0] & /*footerRect, videoTrimmerContainerRect, timelineSize*/
    112 | e.$$.dirty[2] & /*$utilRect, $stageRectBase, $footerOffset*/
    1792 && a && m && bt && Mt && vt && n(58, at = {
      x: m.x - a.x + Mt.x,
      y: m.y - a.y + bt.y + A + vt.height
    }), e.$$.dirty[0] & /*framePreviews, $isActive*/
    16640 | e.$$.dirty[1] & /*frameContainerOffset*/
    134217728 | e.$$.dirty[2] & /*$isActiveFraction, $imageEffects, $imageTransforms*/
    224)
      if (Et && at && S) {
        const g = [
          ...Sn(),
          ...Io(Et, B, {
            effects: D,
            transforms: z
          })
        ];
        Ie.set(g);
      } else {
        const g = Sn();
        Ie.set(g);
      }
    e.$$.dirty[0] & /*$imagePreview*/
    32768 && E && (E.addEventListener("play", () => {
      n(17, Nt = !0);
    }), E.addEventListener("pause", () => {
      n(17, Nt = !1);
    })), e.$$.dirty[0] & /*$isActive, $imageCropRectAspectRatio*/
    24576 | e.$$.dirty[1] & /*frameCropAspectRatio*/
    268435456 && n(59, R = S ? M : R || void 0);
  }, [
    me,
    be,
    te,
    pe,
    bt,
    Mt,
    vt,
    x,
    Et,
    w,
    i,
    o,
    r,
    M,
    S,
    E,
    F,
    Nt,
    P,
    C,
    b,
    p,
    N,
    k,
    K,
    Z,
    ce,
    Me,
    Ee,
    Ue,
    Se,
    Le,
    Ze,
    Be,
    Ie,
    T,
    ie,
    ke,
    ve,
    Te,
    Ye,
    wt,
    pn,
    _n,
    To,
    Co,
    kt,
    jt,
    Lo,
    Bo,
    Mn,
    vn,
    Kt,
    kn,
    re,
    ge,
    ee,
    Ut,
    at,
    R,
    l,
    u,
    c,
    v,
    f,
    d,
    s,
    z,
    D,
    B,
    A,
    a,
    m,
    _,
    O,
    q,
    V,
    Do,
    Oo,
    zo,
    Uo,
    Vo,
    jo,
    Ko,
    No,
    Ho,
    qo
  ];
}
class es extends Ae {
  constructor(t) {
    super(), Fe(
      this,
      t,
      $i,
      xi,
      Pe,
      {
        external: 54,
        name: 55,
        isActive: 0,
        isActiveFraction: 1,
        stores: 56,
        trimEnableSplit: 2,
        locale: 3
      },
      null,
      [-1, -1, -1, -1]
    );
  }
  get external() {
    return this.$$.ctx[54];
  }
  get name() {
    return this.$$.ctx[55];
  }
  get isActive() {
    return this.$$.ctx[0];
  }
  set isActive(t) {
    this.$$set({ isActive: t }), Ge();
  }
  get isActiveFraction() {
    return this.$$.ctx[1];
  }
  set isActiveFraction(t) {
    this.$$set({ isActiveFraction: t }), Ge();
  }
  get stores() {
    return this.$$.ctx[56];
  }
  set stores(t) {
    this.$$set({ stores: t }), Ge();
  }
  get trimEnableSplit() {
    return this.$$.ctx[2];
  }
  set trimEnableSplit(t) {
    this.$$set({ trimEnableSplit: t }), Ge();
  }
  get locale() {
    return this.$$.ctx[3];
  }
  set locale(t) {
    this.$$set({ locale: t }), Ge();
  }
}
const ts = (e) => /video/.test(e.type), ss = {
  util: ["trim", es, ({ src: e }) => e && ts(e)]
}, as = {
  trimLabel: "Trim",
  trimIcon: '<g stroke-width=".125em" stroke="currentColor" fill="none"><path d=" M1 3 v18 M5 3 v2 M9 3 v2 M5 18 v2 M9 18 v2 M1 3 h12 M1 6 h10 M1 18 h9 M1 21 h8 M14 0 l-4 24 M18 3 h5 M17.5 6 h6 M15.5 18 h7 M15 21 h8 M19 3 v2 M15 18 v2 M19 18 v2 M23 3 v18"/></g>',
  trimLabelPlay: "Play",
  trimLabelPause: "Pause",
  trimLabelMute: "Mute",
  trimLabelUnmute: "Unmute",
  trimLabelSplit: "Split",
  trimLabelMerge: "Merge",
  trimIconButtonMute: '<g stroke-width=".125em" stroke="currentColor"><polygon fill="currentColor" points="2 16 2 8 8 8 15 1 15 23 8 16"/><path d="M19.3781212,15.2166107 C20.3621122,14.4879168 21,13.3184517 21,12 C21,10.6815483 20.3621122,9.51208318 19.3781212,8.78338927"/></g>',
  trimIconButtonUnmute: '<g stroke-width=".125em" stroke="currentColor"><polygon fill="currentColor" points="2 16 2 8 3 8 15 20 15 23 8 16"/><polygon fill="currentColor" points="8 8 15 1 15 15"/><line x1="1" y1="1" x2="23" y2="23"/></g>',
  trimIconButtonPlay: '<polygon fill="currentColor" points="7 3, 21 12, 7 21"/>',
  trimIconButtonPause: '<g fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></g>',
  trimIconButtonSplit: `<g stroke="currentColor" stroke-width=".125em">
    <path d="M12 4 V20"/>
    <path fill="currentColor" d="M6 8 L6 16 L2 12 Z M18 8 L22 12 L18 16 Z"/>
    </g>`,
  trimIconButtonMerge: `<g stroke="currentColor" stroke-width=".125em">
    <path d="M1 4 V20 M23 4 V20"/>
    <path fill="currentColor" d="M6 8 L10 12 L6 16 Z M18 8 L14 12 L18 16 Z"/>
    </g>`,
  // overrides, replace image with media
  statusLabelLoadImage: (e) => !e || !e.task ? "Waiting for media" : e.error ? e.error.code === "IMAGE_TOO_SMALL" ? "Minimum media size is {minWidth} &times; {minHeight}" : e.error.code === "VIDEO_TOO_SHORT" ? `Minimum video duration is {minDuration} ${e.error.metadata.minDuration === 1 ? "second" : "seconds"}` : "Error loading media" : e.task === "blob-to-bitmap" ? "Preparing media&hellip;" : "Loading media&hellip;",
  statusLabelProcessImage: (e) => {
    if (!(!e || !e.task))
      return e.task === "store" ? e.error ? "Error uploading media" : "Uploading media&hellip;" : e.error ? "Error processing media" : "Processing media&hellip;";
  },
  cropLabelCropBoundaryEdge: "Edge of media"
};
export {
  ns as createDefaultVideoWriter,
  rs as createFFmpegEncoder,
  os as createMediaStreamEncoder,
  is as createMuxerEncoder,
  ss as plugin_trim,
  as as plugin_trim_locale_en_gb
};
