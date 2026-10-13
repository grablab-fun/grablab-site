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
      `commit ${b58(4)}…${b58(4)} · 240 capsules`,
      `70% · locked before play #${play}`,
      `70.${Math.floor(Math.random()*4)}% · signed on peaqOS`,
      `beam + camera · frame 0x${rnd(4)}…${rnd(4)}`,
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
  document.querySelectorAll(".rrow .ok").forEach(o => o.innerHTML = CHECK);

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

/* tokenized stocks: live xStocks prices (Jupiter price API, one request every 5 s); the chart keeps scrolling with every new tick */
(function(){
  const rows = [...document.querySelectorAll(".stk[data-mint]")]; if (!rows.length) return;
  const W = 340, H = 64, N = 60, ids = rows.map(r => r.dataset.mint).join(",");
  const state = new Map();
  function seeded(seed){ let x = seed; return () => (x = (x * 9301 + 49297) % 233280) / 233280; }
  function seed(price, ch, key){ /* the first frame: a 24h-shaped path that ends at the live price */
    const start = price / (1 + ch/100), rnd = seeded(key.length * 97 + Math.round(price)), pts = []; let v = start;
    for (let i = 0; i < N; i++){ const t = start + (price - start) * (i/(N-1)); v = t + (v - t) * .55 + (rnd() - .5) * price * .005; pts.push(i === N-1 ? price : v); }
    return pts;
  }
  const fmt = p => "$" + p.toLocaleString("en-US", { minimumFractionDigits:2, maximumFractionDigits:2 });
  function draw(row, st){
    const pts = st.pts, lo = Math.min(...pts), hi = Math.max(...pts), pad = (hi - lo) * .15 || 1;
    const xy = pts.map((p,i) => [i/(pts.length-1)*W, H - 6 - (p - lo + pad) / (hi - lo + 2*pad) * (H - 12)]);
    const d = xy.map((q,i) => (i ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1)).join("");
    const dn = st.ch < 0 ? " dn" : "", last = xy[xy.length-1];
    row.querySelector(".stk-chart").innerHTML = `<path class="area${dn}" d="${d}L${W} ${H}L0 ${H}Z"/><path class="line${dn}" d="${d}"/><circle class="dot" cx="${last[0]}" cy="${last[1]}" r="3.2"/>`;
    const px = row.querySelector(".stk-px"), b = px.querySelector("b"), s = px.querySelector("span");
    const prev = st.shown; b.textContent = fmt(st.price); st.shown = st.price;
    if (prev != null && prev !== st.price){ b.classList.remove("tick-up","tick-dn"); void b.offsetWidth; b.classList.add(st.price > prev ? "tick-up" : "tick-dn"); }
    s.className = st.ch < 0 ? "dn" : "up"; s.textContent = (st.ch < 0 ? "▼ " : "▲ ") + Math.abs(st.ch).toFixed(2) + "% 24h";
  }
  async function poll(){
    try{
      const j = await (await fetch("https://lite-api.jup.ag/price/v3?ids=" + ids, { cache:"no-store" })).json();
      rows.forEach(row => {
        const t = j && j[row.dataset.mint]; if (!t) return;
        const price = (t.stockData && t.stockData.price) || t.usdPrice, ch = t.priceChange24h || 0; if (!price) return;
        let st = state.get(row);
        if (!st){ st = { pts: seed(price, ch, row.dataset.mint), price, ch, shown:null }; state.set(row, st); }
        else { st.pts.push(price); st.pts.shift(); st.price = price; st.ch = ch; }
        draw(row, st);
      });
    }catch(e){}
  }
  poll(); setInterval(() => { if (!document.hidden) poll(); }, 5000);
})();
