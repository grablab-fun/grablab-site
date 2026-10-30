/* ============ SUBPAGES v2 behaviour : play receipts, verifier, live phone timer ============ */
(function(){
  const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const rnd = n => [...Array(n)].map(() => "0123456789abcdef"[Math.floor(Math.random()*16)]).join("");
  const b58 = n => [...Array(n)].map(() => "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"[Math.floor(Math.random()*57)]).join("");

  /* fill a receipt's rows for a given play number, then light them up one by one */
  function runReceipt(el, play, loop){
    if (!el) return;
    const rows = [...el.querySelectorAll(".rrow")];
    const prize = el.dataset.prize || "+100 USDC";
    const vals = [
      `commit ${b58(4)}…${b58(4)}, 240 capsules`,
      `70%, locked before play #${play}`,
      `70.${Math.floor(Math.random()*4)}%, signed on peaqOS`,
      `beam + camera, frame 0x${rnd(4)}…${rnd(4)}`,
      `${prize} → ${b58(4)}…${b58(4)}`
    ];
    el.querySelector(".pn").textContent = "#" + String(play).padStart(6,"0");
    rows.forEach((r,i) => { r.classList.remove("on"); const s = r.querySelector("small"); if (s && vals[i]) s.textContent = vals[i]; });
    el.classList.remove("done");
    clearTimeout(el._t); let i = 0;
    const step = () => {
      if (i < rows.length){ rows[i].classList.add("on"); i++; el._t = setTimeout(step, 620); }
      else { el.classList.add("done"); if (loop) el._t = setTimeout(() => runReceipt(el, play + 1 + Math.floor(Math.random()*3), true), 3800); }
    };
    el._t = setTimeout(step, 500);
  }
  document.querySelectorAll(".rrow .ok").forEach(o => { if (!o.closest(".con")) o.innerHTML = CHECK; });

  const hero = document.getElementById("heroRcpt");
  if (hero){
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting){ runReceipt(hero, 427, true); io.disconnect(); } }), {threshold:.3});
    io.observe(hero);
  }

  /* verifier: type a play number, get its receipt */
  const vBtn = document.getElementById("vfyBtn"), vIn = document.getElementById("vfyIn"), vR = document.getElementById("vfyRcpt");
  if (vBtn && vIn && vR){
    const go = () => { const n = parseInt((vIn.value||"").replace(/\D/g,""),10) || 427; runReceipt(vR, n, false); };
    vBtn.addEventListener("click", go);
    vIn.addEventListener("keydown", e => { if (e.key === "Enter") go(); });
    const io2 = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting){ go(); io2.disconnect(); } }), {threshold:.4});
    io2.observe(vR);
  }

  /* hero headline: shrink until its longest line fits the copy column (never under the centerpiece) */
  const h1 = document.querySelector(".ph h1"), col = document.querySelector(".ph-copy");
  function fit(){
    if (!h1 || !col) return;
    h1.style.fontSize = "";
    const lines = [...h1.querySelectorAll(".line")];
    let size = parseFloat(getComputedStyle(h1).fontSize);
    for (let k = 0; k < 30; k++){
      const widest = Math.max(...lines.map(l => l.scrollWidth));
      if (widest <= col.clientWidth) break;
      size *= 0.95; h1.style.fontSize = size + "px";
    }
  }
  fit(); addEventListener("resize", fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

  /* live phone: 30 s play timer that loops */
  const tm = document.getElementById("phTimer");
  if (tm && !tm.hasAttribute("data-sync")){ let s = 30; setInterval(() => { s = s <= 0 ? 30 : s - 1; tm.textContent = "0:" + String(s).padStart(2,"0"); }, 1000); }
})();

/* the live window: the tabs pick a column */
(function(){
  const app = document.querySelector(".app"); if (!app) return;
  const tabs = [...app.querySelectorAll(".tabs button")];
  tabs.forEach(t => t.addEventListener("click", () => { tabs.forEach(x => x.classList.toggle("on", x === t)); app.dataset.col = t.dataset.col; }));
})();

/* five proofs: the pinned countdown steps 1 to 5 with scroll */
(function(){
  const root = document.getElementById("countdown"); if (!root) return;
  const num = root.querySelector(".cd-num b"), steps = [...root.querySelectorAll(".cd-s")], dots = [...root.querySelectorAll(".cd-dots i")];
  let cur = 0;
  function update(){
    if (innerWidth <= 900) return;
    const r = root.getBoundingClientRect();
    const p = Math.min(.9999, Math.max(0, -r.top / (r.height - innerHeight)));
    const k = Math.floor(p * steps.length);
    if (k === cur) return; cur = k;
    num.textContent = k + 1; num.classList.remove("tick"); void num.offsetWidth; num.classList.add("tick");
    steps.forEach((s,i) => s.classList.toggle("on", i === k));
    dots.forEach((d,i) => d.classList.toggle("on", i <= k));
  }
  addEventListener("scroll", update, { passive:true }); addEventListener("resize", update); update();
})();

/* app preview: the next drop counts down */
(function(){
  const el = document.getElementById("nextClock"); if (!el) return;
  let t = 2*3600 + 14*60 + 9;
  setInterval(() => { t = t > 0 ? t - 1 : 2*3600 + 14*60 + 9; const p = n => String(n).padStart(2,"0"); el.textContent = `${p(Math.floor(t/3600))}:${p(Math.floor(t%3600/60))}:${p(t%60)}`; }, 1000);
})();

/* tokenized stocks: real intraday charts of the last US session (GeckoTerminal 5 min candles of each xStock's main pool),
   the live dot follows Jupiter's price every 5 s while the market is open; closed market = the full last session, no flat tail */
(function(){
  const rows = [...document.querySelectorAll(".stk[data-mint]")]; if (!rows.length) return;
  const H = 50, GT = "https://api.geckoterminal.com/api/v2/networks/solana/", BUCKET = 300;
  const HOLIDAYS = new Set(["2026-01-01","2026-01-19","2026-02-16","2026-04-03","2026-05-25","2026-06-19","2026-07-03","2026-09-07","2026-11-26","2026-12-25",
    "2027-01-01","2027-01-18","2027-02-15","2027-03-26","2027-05-31","2027-06-18","2027-07-05","2027-09-06","2027-11-25","2027-12-24"]);
  const fmt = p => "$" + p.toLocaleString("en-US", { minimumFractionDigits:2, maximumFractionDigits:2 });
  const hhmm = s => new Date(s*1000).toLocaleTimeString("en-US", { hour:"numeric", minute:"2-digit", timeZone:"America/New_York" }) + " ET";

  /* New York session clock: 9:30 to 16:00 ET, weekdays, minus exchange holidays */
  function etOffset(ms){ const z = new Intl.DateTimeFormat("en-US", { timeZone:"America/New_York", timeZoneName:"shortOffset" }).formatToParts(new Date(ms)).find(p => p.type === "timeZoneName").value.match(/GMT([+-]\d+)/); return z ? +z[1] : -5; }
  function etDay(ms){ const p = new Intl.DateTimeFormat("en-CA", { timeZone:"America/New_York", year:"numeric", month:"2-digit", day:"2-digit" }).format(new Date(ms)).split("-"); return Date.UTC(+p[0], p[1]-1, +p[2]); }
  function trading(day){ const w = new Date(day).getUTCDay(); return w > 0 && w < 6 && !HOLIDAYS.has(new Date(day).toISOString().slice(0,10)); }
  function bounds(day){ const off = etOffset(day + 17*3600e3); return [(day + (9.5 - off)*3600e3)/1000, (day + (16 - off)*3600e3)/1000]; }
  function sessions(){
    const now = Date.now()/1000, out = []; let day = etDay(Date.now());
    for (let k = 0; k < 12 && out.length < 2; k++, day -= 864e5){ if (!trading(day)) continue; const b = bounds(day); if (b[0] <= now) out.push(b); }
    return { cur: out[0], prev: out[1], open: !!out[0] && now < out[0][1] };
  }

  const cache = (k, v) => { try{ if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); }catch(e){ return null; } };
  async function pool(mint, known){
    if (known) return known;
    const key = "gl-pool-" + mint, hit = cache(key); if (hit) return hit;
    const j = await get(GT + "tokens/" + mint + "/pools?page=1");
    const best = (j.data || []).sort((a,b) => (+b.attributes.reserve_in_usd) - (+a.attributes.reserve_in_usd))[0];
    if (!best) throw 0; cache(key, best.attributes.address); return best.attributes.address;
  }
  const wait = ms => new Promise(r => setTimeout(r, ms));
  async function get(url){ /* the free API rate limits bursts: back off and retry */
    for (let k = 0; k < 4; k++){ try{ const r = await fetch(url, { cache:"no-store" }); if (r.ok) return await r.json(); }catch(e){} await wait(2500 * (k + 1)); }
    throw 0;
  }
  const memo = (k, v) => { try{ if (v === undefined) return JSON.parse(sessionStorage.getItem(k)); sessionStorage.setItem(k, JSON.stringify(v)); }catch(e){ return null; } };
  async function candles(mint, known){ /* a closed session never changes, so it is fetched once per visit */
    const key = "gl-c2-" + mint + "-" + ses.cur[0], hit = !ses.open && memo(key); if (hit) return hit;
    const addr = await pool(mint, known);
    const j = await get(GT + "pools/" + addr + "/ohlcv/minute?aggregate=5&limit=1000&currency=usd&token=base");
    const list = clean(((j.data && j.data.attributes.ohlcv_list) || []).map(c => [c[0], c[4]]).sort((a,b) => a[0] - b[0]));
    if (!ses.open && list.length) memo(key, list);
    return list;
  }
  const med = a => a.slice().sort((x,y) => x-y)[a.length >> 1];
  function clean(list){ /* a stray swap in a thin pool prints a candle far off the market: drop anything 3% away from its neighbours */
    return list.filter((c,i) => { const w = list.slice(Math.max(0,i-4), i+5).map(q => q[1]); return Math.abs(c[1] / med(w) - 1) < .03; });
  }
  function smooth(pts){ /* pool trades bounce between bid and ask: a median of 3 then a mean of 3, ends kept exact */
    if (pts.length < 5) return pts;
    const v = pts.map(p => p[1]), m = v.map((x,i) => i && i < v.length-1 ? [v[i-1], x, v[i+1]].sort((a,b) => a-b)[1] : x);
    return pts.map((p,i) => [p[0], i && i < v.length-1 ? (m[i-1] + m[i] + m[i+1]) / 3 : v[i]]);
  }

  const state = new Map(); let ses = sessions();
  function build(st, list){
    const [s0, s1] = ses.cur, pts = list.filter(c => c[0] >= s0 && c[0] < s1);
    const before = ses.prev ? list.filter(c => c[0] >= ses.prev[0] && c[0] < ses.prev[1]) : [];
    st.pts = smooth(pts); st.base = before.length ? med(before.slice(-5).map(c => c[1])) : (pts[0] ? pts[0][1] : null);
  }
  function draw(row, st){
    const svg = row.querySelector(".stk-chart"), W = Math.max(120, Math.round(svg.getBoundingClientRect().width)), id = svg.dataset.g || (svg.dataset.g = "sg" + Math.random().toString(36).slice(2,7));
    const [s0, s1] = ses.cur, pts = st.pts; if (!pts.length || st.base == null) return;
    const sv = pts.map(p => p[1]), sLo = Math.min(...sv), sHi = Math.max(...sv), far = st.base < sLo - (sHi - sLo) || st.base > sHi + (sHi - sLo); /* a gap day: keep the session readable, drop the previous close line */
    const vals = far ? sv : sv.concat(st.base), lo = Math.min(...vals), hi = Math.max(...vals), pad = (hi - lo) * .12 || st.base * .002;
    const X = t => (t - s0) / (s1 - s0) * W, Y = v => 4 + (1 - (v - lo + pad) / (hi - lo + 2*pad)) * (H - 8);
    const xy = pts.map(p => [X(p[0]), Y(p[1])]), last = pts[pts.length-1][1], dn = last < st.base, by = Y(st.base).toFixed(1);
    const d = xy.map((q,i) => (i ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1)).join(""), e = xy[xy.length-1];
    st.geo = { W, X, Y, xy };
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`); svg.setAttribute("preserveAspectRatio", "none");
    svg.classList.toggle("dn", dn); svg.classList.toggle("closed", !ses.open);
    svg.innerHTML = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="g0"/><stop offset="1" class="g1"/></linearGradient></defs>`
      + (far ? "" : `<line class="base" x1="0" x2="${W}" y1="${by}" y2="${by}"/>`)
      + `<path class="area" fill="url(#${id})" d="${d}L${e[0].toFixed(1)} ${H}L${xy[0][0].toFixed(1)} ${H}Z"/><path class="line" d="${d}"/>`
      + (ses.open ? `<circle class="ping" cx="${e[0]}" cy="${e[1]}" r="3"/>` : "") + `<circle class="dot" cx="${e[0]}" cy="${e[1]}" r="3"/>`
      + `<g class="hov"><line class="xh" y1="0" y2="${H}"/><circle class="hd" r="3.6"/></g>`;
    price(row, st, last, null);
    row.querySelector(".stk-id span").innerHTML = ses.open ? `<i class="live"></i>Live` : "Market closed";
  }
  function price(row, st, v, t){
    const px = row.querySelector(".stk-px"), b = px.querySelector("b"), s = px.querySelector("span"), ch = (v - st.base) / st.base * 100;
    const prev = st.shown; b.textContent = fmt(v); st.shown = v;
    if (t == null && prev != null && Math.abs(prev - v) > 1e-9){ b.classList.remove("tick-up","tick-dn"); void b.offsetWidth; b.classList.add(v > prev ? "tick-up" : "tick-dn"); }
    s.className = ch < 0 ? "dn" : "up"; s.textContent = (ch < 0 ? "▼ " : "▲ ") + Math.abs(ch).toFixed(2) + "% " + (t != null ? hhmm(t) : ses.open ? "today" : "at close");
  }

  /* hover: crosshair snaps to the nearest candle, the price block shows that moment */
  rows.forEach(row => {
    const svg = row.querySelector(".stk-chart");
    row.addEventListener("pointermove", ev => {
      const st = state.get(row); if (!st || !st.geo) return;
      const r = svg.getBoundingClientRect(), mx = (ev.clientX - r.left) / r.width * st.geo.W; if (mx < -20 || mx > st.geo.W + 20) return leave();
      let i = 0, best = 1e9; st.geo.xy.forEach((q,k) => { const dd = Math.abs(q[0] - mx); if (dd < best){ best = dd; i = k; } });
      const q = st.geo.xy[i], g = svg.querySelector(".hov"); svg.classList.add("on");
      g.querySelector(".xh").setAttribute("x1", q[0]); g.querySelector(".xh").setAttribute("x2", q[0]);
      g.querySelector(".hd").setAttribute("cx", q[0]); g.querySelector(".hd").setAttribute("cy", q[1]);
      svg.style.setProperty("--cut", (q[0] / st.geo.W * 100).toFixed(2) + "%");
      price(row, st, st.pts[i][1], st.pts[i][0]);
    });
    const leave = () => { const st = state.get(row); svg.classList.remove("on"); if (st && st.pts && st.pts.length) price(row, st, st.pts[st.pts.length-1][1], null); };
    row.addEventListener("pointerleave", leave);
  });

  async function load(){
    ses = sessions(); if (!ses.cur) return;
    for (const row of rows){
      try{ const list = await candles(row.dataset.mint, row.dataset.pool), st = state.get(row) || {}; build(st, list); state.set(row, st); draw(row, st); }catch(e){}
    }
  }
  async function tick(){ /* the open session: Jupiter's live price moves the newest 5 min point */
    if (!ses.open) return;
    try{
      const j = await (await fetch("https://lite-api.jup.ag/price/v3?ids=" + rows.map(r => r.dataset.mint).join(","), { cache:"no-store" })).json();
      const now = Math.floor(Date.now()/1000), t = now - now % BUCKET;
      rows.forEach(row => {
        const st = state.get(row), p = j && j[row.dataset.mint] && j[row.dataset.mint].usdPrice; if (!st || !st.pts || !p) return;
        const L = st.pts[st.pts.length-1]; if (L && L[0] === t) L[1] = p; else st.pts.push([t, p]);
        if (!row.querySelector(".stk-chart.on")) draw(row, st);
      });
    }catch(e){}
  }
  load(); setInterval(() => { if (!document.hidden) tick(); }, 5000);
  setInterval(() => { if (!document.hidden && (ses.open || sessions().open)) load(); }, 5*60e3);
  let rz; addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => rows.forEach(r => { const st = state.get(r); if (st && st.pts) draw(r, st); }), 150); });
})();

/* format cards: tilt and spotlight follow the pointer */
(function(){
  if (matchMedia("(hover:none)").matches) return;
  document.querySelectorAll(".fmts .fm").forEach(c => {
    c.addEventListener("pointermove", e => {
      const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      c.style.setProperty("--rx", ((.5 - y) * 7).toFixed(2) + "deg"); c.style.setProperty("--ry", ((x - .5) * 9).toFixed(2) + "deg");
      c.style.setProperty("--mx", (x * 100).toFixed(1) + "%"); c.style.setProperty("--my", (y * 100).toFixed(1) + "%");
      c.style.setProperty("--px", ((.5 - x) * 10).toFixed(1) + "px"); c.style.setProperty("--py", ((.5 - y) * 8).toFixed(1) + "px");
    });
    c.addEventListener("pointerleave", () => ["--rx","--ry","--px","--py"].forEach(k => c.style.removeProperty(k)));
  });
})();
