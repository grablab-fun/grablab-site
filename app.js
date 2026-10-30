/* ============================================================
   GRABLAB : home-only interactions
   (nav, wallet, i18n, telemetry, transitions, reveal live in site.js)
   - inside the machine: scroll steps the countdown 1 to 5 beside the exploding machine
   ============================================================ */
(function inside(){
  const root = document.getElementById("inside"), num = document.getElementById("inNum"), st = [...document.querySelectorAll("#inStage .in-s")], dots = [...document.querySelectorAll("#inDots i")];
  if (!root || !num) return;
  let cur = 0;
  function update(){
    if (innerWidth <= 900) return;
    const r = root.getBoundingClientRect(), p = Math.min(1, Math.max(0, -r.top/(r.height - innerHeight))), i = Math.min(4, Math.floor(p*5));
    if (i === cur) return; cur = i;
    num.textContent = i + 1; num.classList.remove("tick"); void num.offsetWidth; num.classList.add("tick");
    st.forEach((s, k) => s.classList.toggle("on", k === i)); dots.forEach((d, k) => d.classList.toggle("on", k === i));
  }
  addEventListener("scroll", update, { passive:true }); addEventListener("resize", update); update();
})();


/* ---------- HERO : pinned scene, scroll drives four chapters (decode-in headline) ---------- */
window.__sceneP = 0;
(function scene(){
  const scene = document.getElementById("scene"), stage = document.getElementById("stage"), copy = document.getElementById("copy");
  const h1 = document.getElementById("h1"), sub = document.getElementById("sub"), eye = document.getElementById("eyebrow"), acts = document.getElementById("acts");
  if (!scene || !stage || !h1) return;
  const CH = [
    { eye:"Built on machine.fun", eyeHtml:'<span class="eb-g"><span class="eb-l">Built on</span> <a class="eb-mf" href="https://machine.fun" target="_blank" rel="noopener"><img src="assets/brand/partners/machinefun-white.svg" alt="" />machine.fun</a></span><i class="eb-sep"></i><span class="eb-g"><span class="eb-l">Powered by</span> <a class="eb-mf" href="https://www.peaq.network" target="_blank" rel="noopener" aria-label="peaq"><img class="eb-wm" src="assets/brand/partners/peaq-white.svg" alt="peaq" /></a></span><i class="eb-sep"></i><span class="eb-g"><span class="eb-l">Using</span> <a class="eb-mf" href="https://codecflow.ai" target="_blank" rel="noopener"><img class="eb-cf" src="assets/brand/partners/codecflow-white.svg" alt="" />CodecFlow</a></span>', h:["Every capsule","is a coin."], sub:"A real claw machine with on-chain prizes.\nThey settle on Solana the moment they drop.", acts:false },
    { eye:"Why it exists", h:["We undo","the rigged","machines."], hm:["We undo the","rigged machines."], sub:"Grip and prizes go on-chain before you play.\nThe claw cannot lie.", acts:false },
    { eye:"How it feels", h:["Play from","your browser."], sub:"Drive the real claw live on stream.\nBeam, camera and signature prove each drop.", acts:false },
    { eye:"Claw as a service", h:["Rent the claw","for your launch."], sub:"Your drop goes in capsules, grabbed live.\nEvery play is proven fair.", acts:true },
  ];
  /* the progress HUD lives outside the stage so the stage's bottom fade never dims it */
  const hudBr = stage.querySelector(".hud.br"); if (hudBr){ hudBr.classList.add("float"); document.body.appendChild(hudBr); }
  /* the progress bar starts right under the machine's left edge (the cabinet starts 9.7% into the video frame) */
  const clawVid = document.getElementById("clawVideo");
  function alignHud(){
    if (!hudBr || !clawVid) return;
    const v = clawVid.getBoundingClientRect(); if (!v.width) return;
    hudBr.style.left = Math.round(v.left + v.width * 0.097) + "px";
  }
  const GL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&<>/";
  const reduce = false; /* the decode is the brand moment: it runs even when the OS asks for reduced motion */
  let cur = -1, timer = null, subTimer = null, pending = false, idle = null;
  function scramble(lines){
    clearInterval(timer); clearInterval(idle);
    h1.innerHTML = lines.map(l => `<span class="line">${[...l].map(c => c === " " ? " " : `<span class="ch scr"></span>`).join("")}</span>`).join("");
    const chars = [...h1.querySelectorAll(".ch")];
    const roll = () => chars.forEach(el => el.textContent = GL[Math.floor(Math.random()*GL.length)]);
    roll(); if (!reduce) idle = setInterval(roll, 70);
  }
  function play(){
    if (!pending) return; pending = false; clearInterval(idle);
    const c = CH[cur]; decode(heads(c)); typeSub(c.sub);
    h1.classList.remove("glitch"); void h1.offsetWidth; h1.classList.add("glitch");
  }
  /* shrink the headline until its longest line fits the text column (never over the machine) */
  /* phones get a shorter line break where a chapter defines one */
  const heads = c => (innerWidth <= 900 && c.hm) ? c.hm : c.h;
  function fit(lines){
    h1.style.fontSize = "";
    const probe = document.createElement("span"); probe.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap;font:inherit";
    h1.appendChild(probe);
    let size = parseFloat(getComputedStyle(h1).fontSize); const max = copy.clientWidth;
    for (let k = 0; k < 24; k++){
      let widest = 0; lines.forEach(l => { probe.textContent = l; widest = Math.max(widest, probe.getBoundingClientRect().width); });
      if (widest <= max) break; size *= 0.94; h1.style.fontSize = size + "px"; probe.style.fontSize = size + "px";
    }
    probe.remove();
  }
  function decode(lines){
    h1.innerHTML = lines.map(l => `<span class="line">${[...l].map(c => c === " " ? " " : `<span class="ch scr"></span>`).join("")}</span>`).join("");
    const chars = [...h1.querySelectorAll(".ch")], target = lines.join("").replace(/ /g,"");
    clearInterval(timer);
    if (reduce){ chars.forEach((el,i) => { el.textContent = target[i]; el.classList.remove("scr"); }); return; }
    let frame = 0; const total = 34;
    timer = setInterval(() => {
      frame++;
      chars.forEach((el, i) => {
        const settleAt = Math.floor((i / chars.length) * (total - 8)) + 4;
        if (frame >= settleAt){ el.textContent = target[i]; el.classList.remove("scr"); }
        else el.textContent = GL[Math.floor(Math.random()*GL.length)];
      });
      if (frame >= total) clearInterval(timer);
    }, 42);
  }
  function typeSub(text){
    clearInterval(subTimer);
    if (reduce){ sub.textContent = text; return; }
    sub.textContent = ""; let i = 0;
    subTimer = setInterval(() => { i += 2; sub.textContent = text.slice(0, i) + (i < text.length ? "_" : ""); if (i >= text.length) clearInterval(subTimer); }, 22);
  }
  function setChapter(n){
    if (n === cur) return; cur = n;
    const c = CH[n]; stage.dataset.ch = n;
    if (c.eyeHtml) eye.innerHTML = c.eyeHtml; else eye.textContent = c.eye; fit(heads(c).map(l => l.toUpperCase())); acts.classList.toggle("on", c.acts);
    /* park the headline as scrambled glyphs; the decode runs once the chapter is actually on screen */
    scramble(heads(c)); sub.textContent = ""; pending = true;
    [...document.querySelectorAll("#hudChap span")].forEach((s,i) => s.classList.toggle("on", i === n));
    const cn = document.getElementById("chapNum"); if (cn) cn.textContent = String(n+1).padStart(2,"0") + " / " + String(CH.length).padStart(2,"0");
    const hint = document.getElementById("hint"); if (hint) hint.classList.toggle("gone", n !== 0);
  }
  function onScroll(){
    const r = scene.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight) || 0));  /* NaN when the scene is exactly one viewport tall */
    window.__sceneP = p;
    const pct = document.getElementById("hudPct"), bar = document.getElementById("hudBar");
    if (pct) pct.textContent = String(Math.round(p*100)).padStart(2,"0");
    if (bar) bar.style.width = (p*100) + "%";
    const raw = p * CH.length, n = Math.min(CH.length-1, Math.floor(raw)), t = n === CH.length-1 && p >= 1 ? 1 : raw - n;
    setChapter(n);
    /* scroll-scrubbed transition: each chapter rises in, holds, then lifts out as you keep scrolling */
    const EDGE = 0.22;
    let vis = 1, dy = 0;
    if (t < EDGE && n > 0){ const k = t / EDGE; vis = k; dy = (1 - k) * 90; }
    else if (t > 1 - EDGE && n < CH.length-1){ const k = (t - (1 - EDGE)) / EDGE; vis = 1 - k; dy = -k * 90; }
    if (vis >= 0.55) play();
    copy.style.setProperty("--vis", vis.toFixed(3));
    copy.style.setProperty("--dy", dy.toFixed(1) + "px");
    stage.style.setProperty("--p", p.toFixed(4));
    if (hudBr){ const sb = scene.getBoundingClientRect().bottom; hudBr.classList.toggle("off", sb < innerHeight * .92); }
  }
  addEventListener("scroll", onScroll, { passive:true });
  addEventListener("resize", () => { if (cur >= 0) fit(heads(CH[cur]).map(l => l.toUpperCase())); onScroll(); alignHud(); });
  onScroll(); setChapter(0); alignHud();
  if (clawVid) clawVid.addEventListener("loadedmetadata", alignHud);
  addEventListener("load", alignHud);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (cur >= 0) fit(heads(CH[cur]).map(l => l.toUpperCase())); });
  /* replay the current chapter the moment the loader doors open, so the decode is seen */
  addEventListener("gl:open", () => { const n = cur; cur = -1; setTimeout(() => { setChapter(Math.max(0, n)); onScroll(); }, 380); });
  window.__ch = setChapter;
})();

/* ---------- HERO : capsule leaves the chute, falls into the bowl, gets verified ---------- */
(function capsuleFlow(){
  const v = document.getElementById("clawVideo"), cap = document.getElementById("fallCapsule");
  const frame = document.querySelector(".claw-frame"), bowl = document.getElementById("bowlInner");
  if (!v || !cap || !frame || !bowl) return;
  document.body.appendChild(cap);
  let fired = false, count = 0; const MAX = 14;
  const hx = n => [...crypto.getRandomValues(new Uint8Array(n))].map(b => b.toString(16).padStart(2,"0")).join("");
  const docRect = el => { const r = el.getBoundingClientRect(); return { x:r.left+scrollX, y:r.top+scrollY, w:r.width, h:r.height }; };
  /* six recesses in the glass tray (fractions of the tray image), front row first */
  const SLOTS = [[.258,.654],[.522,.589],[.780,.494],[.194,.359],[.436,.295],[.691,.239]], CS = .18;
  function drop(){
    const f = docRect(frame), b = docRect(bowl);
    const S = Math.round(b.w * CS), slot = count % SLOTS.length, [fx, fy] = SLOTS[slot];
    const lx = fx * b.w, ly = fy * b.h;
    cap.style.width = cap.style.height = S + "px"; cap.style.marginLeft = "0";
    const sx = f.x + f.w*0.71 - S/2, sy = f.y + f.h - S*0.4;
    const ex = b.x + lx - S/2, ey = b.y + ly - S*0.56;
    const violet = Math.random() < 0.45; cap.classList.toggle("v", violet); cap.dataset.v = violet ? "1" : "";
    const vf = document.getElementById("verify"); if (vf) vf.classList.remove("ok");
    ["vc1","vc2","vc3","vc4"].forEach(id => { const e = document.getElementById(id); if (e) e.classList.remove("on"); });
    cap.style.left = sx+"px"; cap.style.top = sy+"px"; cap.style.opacity = "1";
    const dur = Math.max(900, Math.min(2600, (ey-sy)*1.1));
    const a = cap.animate([{ transform:"translate(0,0) rotate(0deg)" },
      { transform:`translate(${ex-sx}px,${ey-sy}px) rotate(${(Math.random()>.5?1:-1)*220}deg)` }],
      { duration:dur, easing:"cubic-bezier(.35,0,.85,.45)", fill:"forwards" });
    a.onfinish = () => { cap.style.opacity = "0"; a.cancel(); land(slot, fx, fy); };
  }
  function land(slot, fx, fy){   /* fractions of the tray, so page zoom on big screens never shifts the landing */
    const prev = bowl.querySelector(`.mini-cap[data-slot="${slot}"]`); if (prev) prev.remove();
    const m = document.createElement("span"); m.className = "mini-cap" + (cap.dataset.v ? " v" : ""); m.dataset.slot = slot;
    m.style.left = (fx * 100) + "%"; m.style.top = (fy * 100) + "%"; m.style.setProperty("--cs", (CS*100) + "%");
    bowl.appendChild(m);
    count++;
    const c = document.getElementById("vCount"); if (c) c.textContent = count;
    const h = document.getElementById("vHash"); if (h) h.textContent = "frame 0x" + hx(2) + "…" + hx(2);
    ["vc1","vc2","vc3","vc4"].forEach((id,i) => { const e = document.getElementById(id); if (!e) return; setTimeout(() => e.classList.add("on"), 380*(i+1)); });
    setTimeout(() => { const vf = document.getElementById("verify"); if (vf) vf.classList.add("ok"); }, 380*4 + 120);
  }
  /* the claw only starts once the loader has opened; it then waits with the capsule in the claw, just before the release,
     until the catch tray under the machine is on screen, so the drop is always seen landing */
  let started = false, held = false;
  const holdAt = () => (v.duration || 10) - 1.45;
  const trayVisible = () => { const r = bowl.getBoundingClientRect(); return r.top < innerHeight * .82 && r.bottom > 0; };
  function start(){ if (started) return; started = true; try{ v.currentTime = 0; }catch(e){} v.play().catch(() => {}); }
  if (document.getElementById("loader")) addEventListener("gl:open", () => setTimeout(start, 450), { once:true });
  else setTimeout(start, 650);
  setTimeout(start, 12000); // safety net if the loader never reports
  v.addEventListener("timeupdate", () => {
    const d = v.duration || 10;
    if (!fired && !held && v.currentTime >= holdAt() && v.currentTime < d - 0.7 && !trayVisible()){ v.pause(); held = true; return; }
    if (!fired && v.currentTime >= d - 0.7){ fired = true; drop(); }
    if (v.currentTime < 0.8) fired = false;
  });
  addEventListener("scroll", () => { if (held && trayVisible()){ held = false; v.play().catch(() => {}); } }, { passive:true });
  window.__drop = drop; // test hook
})();

/* ---------- keep the catch bin exactly under the machine chute (71% of the claw frame) ---------- */
(function alignCatch(){
  const frame = document.querySelector(".stage .claw-frame"), col = document.getElementById("catchCol"), stack = document.querySelector(".catch-stack");
  if (!frame || !col || !stack) return;
  function place(){
    if (innerWidth <= 900){ stack.style.left = ""; return; }
    stack.style.left = "0px";
    const f = frame.getBoundingClientRect(), c = col.getBoundingClientRect();
    const z = col.offsetWidth ? c.width / col.offsetWidth : 1;   /* big screens zoom this block: convert screen px back to its CSS px */
    const want = f.left + f.width * 0.52 - c.left, half = stack.offsetWidth * z / 2, maxC = innerWidth - 24 - half - c.left;
    stack.style.left = Math.min(want, maxC) / z + "px";
  }
  addEventListener("resize", place); addEventListener("load", place); place();
})();
