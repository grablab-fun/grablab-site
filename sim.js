/* ============ SIMULATOR : pick a sponsored drop, pay (simulated), claim, drive the claw for 30 s, win ============
   Everything here is a demo: no wallet is touched, nothing is signed or sent. Open with #simulate or any [data-sim]. */
(function(){
  const PROJECTS = [
    { id:"rover",    name:"Rover Labs",  tk:"$ROVR", c:"#13a3b3", logo:"assets/proj/rover.png",    tags:"Delivery robots", gold:2500,  violet:12000, rare:"Rover Genesis pass", left:148, cap:240, price:0.05, status:"live" },
    { id:"kinetic",  name:"Kinetic Arm", tk:"$KNTC", c:"#fd730a", logo:"assets/proj/kinetic.png",  tags:"Industrial arms", gold:1800,  violet:9000,  rare:"Kinetic Founder NFT", left:201, cap:300, price:0.04, status:"live" },
    { id:"orbit",    name:"Orbit Drone", tk:"$ORBT", c:"#6847fd", logo:"assets/proj/orbit.png",    tags:"Drone mapping",   gold:3000,  violet:15000, rare:"Orbit Pilot badge",   left:57,  cap:180, price:0.06, status:"hot" },
    { id:"lumen",    name:"Lumen Hand",  tk:"$LUMN", c:"#fc5267", logo:"assets/proj/lumen.png",    tags:"Humanoid hands",  gold:1200,  violet:6000,  rare:"Lumen Glove NFT",     left:233, cap:240, price:0.05, status:"live" },
    { id:"fieldbot", name:"Fieldbot",    tk:"$FLDB", c:"#f7c842", logo:"assets/proj/fieldbot.png", tags:"Agritech DePIN",  gold:5000,  violet:20000, rare:"Fieldbot Seed pass",  left:96,  cap:120, price:0.03, status:"new" },
    { id:"pallet",   name:"Pallet Bots", tk:"$PLT",  c:"#bff339", logo:"assets/proj/pallet.png",   tags:"Warehouse",       gold:4000,  violet:18000, rare:"Pallet Ops NFT",      left:180, cap:200, price:0.05, status:"live" }
  ];
  const WALLETS = [["Phantom","assets/wallets/phantom.png"],["Solflare","assets/wallets/solflare.png"],["Backpack","assets/wallets/backpack.png"]];
  const STEPS = ["Drop","Pay","Claim","Play","Prize"];
  const PLAY_S = 30;
  const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const b58 = n => [...Array(n)].map(() => "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"[Math.floor(Math.random()*57)]).join("");
  const fmt = n => n.toLocaleString("en-US");
  const short = a => a.length > 12 ? a.slice(0,4) + "…" + a.slice(-4) : a;
  const $ = (s, r) => (r || document).querySelector(s);

  let root, proj = PROJECTS[0], wallet = 0, addr = "", playNo = 428 + Math.floor(Math.random()*40), lastFocus = null;

  /* ---------------- markup ---------------- */
  function capRow(n){ return `<span class="pc-caps">${["","v","","r",""].slice(0,n).map(k => `<i class="cap ${k}"></i>`).join("")}</span>`; }
  function card(p, i, feat){
    const pill = p.status === "live" ? '<span class="pill-s live">Live</span>' : p.status === "hot" ? '<span class="pill-s">Almost gone</span>' : '<span class="pill-s">New</span>';
    return `<button class="pc${feat ? " feat" : ""}" style="--c:${p.c}" data-i="${i}">
      <div class="pc-cover"><span class="pc-pill">${pill}</span><img class="pc-logo" src="${p.logo}" alt="" />${capRow(feat ? 5 : 3)}</div>
      <div class="pc-b">
        ${feat ? '<span class="pc-tag">Featured drop</span>' : ""}
        <div class="pc-t"><b>${p.name}</b><span>${p.tk}</span></div>
        <div class="pc-prize"><span>Top capsule</span><strong>${fmt(p.violet)} ${p.tk}</strong></div>
        <div class="pc-bar"><i style="--f:${(1 - p.left/p.cap).toFixed(2)}"></i></div>
        <div class="pc-meta"><span>${p.left} / ${p.cap} left</span><span>${p.price} SOL</span></div>
        <span class="pc-go">Participate</span>
      </div></button>`;
  }
  function build(){
    root = document.createElement("div");
    root.className = "sim"; root.id = "sim"; root.hidden = true;
    root.setAttribute("role","dialog"); root.setAttribute("aria-modal","true"); root.setAttribute("aria-label","Grablab simulator");
    root.innerHTML = `
    <div class="sim-top">
      <div class="sim-brand"><img src="assets/brand/mark-chrome-256.png" alt="" /><b>GRABLAB</b><span>Simulator</span></div>
      <ol class="sim-steps">${STEPS.map((s,i) => `<li><i>${i+1}</i><span>${s}</span></li>`).join("")}</ol>
      <span class="chip sim-demo">Demo · no real funds</span>
      <button class="sim-x" type="button" aria-label="Close simulator">&times;</button>
    </div>
    <div class="sim-body">
      <section class="sv" data-v="pick">
        <div class="sv-head"><span class="k">Sponsored drops</span><h2>Pick your <span class="hl">airdrop.</span></h2></div>
        <div class="pgrid">${PROJECTS.map((p,i) => card(p, i, i === 0)).join("")}</div>
      </section>

      <section class="sv" data-v="pay">
        <div class="sv-head"><span class="k">One play · 30 seconds</span><h2>Buy a <span class="hl">play.</span></h2></div>
        <div class="pay">
          <div class="glass pay-sum">
            <div class="pay-p"><img id="payLogo" src="" alt="" /><div><b id="payName"></b><small id="payTags"></small></div></div>
            <div class="row"><span>1 play on Machine 01</span><b id="payPrice"></b></div>
            <div class="row"><span>Network fee</span><b>0.000005 SOL</b></div>
            <div class="row"><span>Refund if the machine fails</span><b class="yes">Yes</b></div>
            <div class="row"><span>Grip, locked on-chain</span><b>70%</b></div>
            <div class="row tot"><span>Total</span><b id="payTot"></b></div>
          </div>
          <div class="glass pay-w">
            <small>Pay with</small>
            ${WALLETS.map((w,i) => `<button class="wl${i===0?" on":""}" type="button" data-w="${i}"><img src="${w[1]}" alt="" />${w[0]}<em>${i===0?"Selected":"Detected"}</em></button>`).join("")}
            <button class="btn btn-primary big act" id="payBtn" type="button"></button>
            <div class="okline" id="payOk">${CHECK}<span></span></div>
            <p class="fine">Simulated. Your wallet is never opened.</p>
          </div>
        </div>
      </section>

      <section class="sv" data-v="claim">
        <div class="sv-head c"><span class="k" id="claimK"></span><h2>Where does the <span class="hl">prize land?</span></h2></div>
        <div class="glass claim">
          <label for="simAddr">Your Solana address</label>
          <div class="inrow"><input id="simAddr" type="text" autocomplete="off" spellcheck="false" /><button class="btn btn-ghost" id="simAddrNew" type="button">New demo</button></div>
          <div class="err" id="simErr"></div>
          <div class="tick"><i></i><span>Paid · play reserved</span><i></i><span>Prize goes straight to this address</span><i></i><span>Grip 70%, locked before your play</span></div>
          <button class="btn btn-primary big act" id="claimBtn" type="button">Claim my play</button>
        </div>
      </section>

      <section class="sv" data-v="play">
        <div class="stagew" id="stagew">
          <canvas id="simCv"></canvas>
          <div class="shud tl"><span class="chip live">Live</span><span class="chip" id="hudProj"></span></div>
          <div class="shud tm"><b id="simT">0:30</b><span class="tb"><i id="simTb"></i></span></div>
          <div class="shud tr"><span class="chip">1,284 watching</span></div>
          <div class="toast" id="simToast"></div>
          <div class="toast hint" id="simHint"></div>
          <div class="queue" id="simQ"><div><small>Machine 01 · you're up</small><b id="simQn">3</b></div></div>
        </div>
        <div class="ctrl">
          <div class="joy" id="simJoy" aria-label="Joystick"><i class="ar u"></i><i class="ar d"></i><i class="ar l"></i><i class="ar r"></i><span class="knob"></span></div>
          <div class="ctrl-mid">
            <div class="grip">Grip <span class="gb"><i></i></span> 70% · on-chain</div>
            <div class="keys"><kbd>&larr;</kbd><kbd>&uarr;</kbd><kbd>&darr;</kbd><kbd>&rarr;</kbd> or <kbd>WASD</kbd> to move · <kbd>Space</kbd> to grab</div>
          </div>
          <button class="grabb" id="simGrab" type="button">Grab</button>
        </div>
      </section>

      <section class="sv" data-v="win">
        <div class="win-cap" id="winCap"><i class="cap"></i></div>
        <span class="win-k" id="winK"></span>
        <h2 class="win-prize" id="winP"></h2>
        <p class="win-sub" id="winS"></p>
        <div class="glass rc" id="winRc">
          <div class="rc-h"><span>Play receipt</span><span id="rcNo"></span></div>
          <div class="rc-r"><i></i>Inventory committed<small id="rc0"></small></div>
          <div class="rc-r"><i></i>Grip locked<small>70%</small></div>
          <div class="rc-r"><i></i>Machine signed the play<small>peaqOS</small></div>
          <div class="rc-r"><i></i>Drop seen<small>beam + camera</small></div>
          <div class="rc-r"><i></i><span id="rc4t">Paid out</span><small id="rc4"></small></div>
        </div>
        <div class="win-acts"><button class="btn btn-primary big" id="winAgain" type="button">Play again</button><button class="btn btn-ghost big" id="winOther" type="button">Other drops</button></div>
      </section>
    </div>
    <canvas class="confetti" id="simConf"></canvas>`;
    document.body.appendChild(root);

    root.querySelector(".sim-x").addEventListener("click", close);
    root.querySelectorAll(".pc").forEach(b => b.addEventListener("click", () => { proj = PROJECTS[+b.dataset.i]; go("pay"); }));
    root.querySelectorAll(".wl").forEach(b => b.addEventListener("click", () => {
      wallet = +b.dataset.w;
      root.querySelectorAll(".wl").forEach(x => { x.classList.toggle("on", x === b); x.querySelector("em").textContent = x === b ? "Selected" : "Detected"; });
      setPayLabel();
    }));
    $("#payBtn", root).addEventListener("click", pay);
    $("#simAddrNew", root).addEventListener("click", () => { $("#simAddr", root).value = b58(44); $("#simErr", root).textContent = ""; });
    $("#claimBtn", root).addEventListener("click", claim);
    $("#simAddr", root).addEventListener("keydown", e => { if (e.key === "Enter") claim(); });
    $("#winAgain", root).addEventListener("click", () => go("pay"));
    $("#winOther", root).addEventListener("click", () => go("pick"));
    game.init();
  }

  /* ---------------- navigation ---------------- */
  let view = "pick";
  function go(v){
    view = v;
    const idx = ["pick","pay","claim","play","win"].indexOf(v);
    root.querySelectorAll(".sv").forEach(s => s.classList.toggle("on", s.dataset.v === v));
    root.querySelectorAll(".sim-steps li").forEach((li,i) => { li.classList.toggle("on", i === idx); li.classList.toggle("done", i < idx); });
    $(".sim-body", root).scrollTop = 0;
    if (v === "pay") enterPay();
    if (v === "claim") enterClaim();
    if (v === "play") game.start();
    else game.stop();
  }
  function open(){
    if (!root) build();
    lastFocus = document.activeElement;
    root.hidden = false; document.body.classList.add("sim-lock");
    requestAnimationFrame(() => root.classList.add("open"));
    go("pick");
    setTimeout(() => { const f = root.querySelector(".pc"); if (f) f.focus({ preventScroll:true }); }, 60);
  }
  function close(){
    if (!root || root.hidden) return;
    game.stop(); confetti.stop();
    root.classList.remove("open"); document.body.classList.remove("sim-lock");
    setTimeout(() => { root.hidden = true; }, 350);
    if (location.hash === "#simulate") history.replaceState(null, "", location.pathname + location.search);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll:true });
  }
  addEventListener("keydown", e => { if (e.key === "Escape" && root && !root.hidden) close(); });

  /* ---------------- 2. pay ---------------- */
  function setPayLabel(){ $("#payBtn", root).innerHTML = `Pay ${proj.price} SOL with ${WALLETS[wallet][0]}`; }
  function enterPay(){
    $("#payLogo", root).src = proj.logo; $("#payName", root).textContent = proj.name;
    $("#payTags", root).textContent = proj.tk + " · " + proj.tags;
    $("#payPrice", root).textContent = proj.price + " SOL";
    $("#payTot", root).textContent = (proj.price + 0.000005).toFixed(6).replace(/0+$/,"") + " SOL";
    const b = $("#payBtn", root); b.disabled = false; setPayLabel();
    $("#payOk", root).classList.remove("on");
  }
  function pay(){
    const b = $("#payBtn", root); if (b.disabled) return;
    b.disabled = true; b.innerHTML = `<span class="spin"></span>Approve in ${WALLETS[wallet][0]}`;
    setTimeout(() => {
      b.innerHTML = `<span class="spin"></span>Confirming`;
      setTimeout(() => {
        b.innerHTML = "Paid";
        const ok = $("#payOk", root); ok.querySelector("span").textContent = `Confirmed · tx ${b58(4)}…${b58(4)} · play #${String(playNo).padStart(6,"0")}`; ok.classList.add("on");
        setTimeout(() => { if (view === "pay") go("claim"); }, 1100);
      }, 800);
    }, 1100);
  }

  /* ---------------- 3. claim ---------------- */
  function enterClaim(){
    $("#claimK", root).textContent = `${proj.name} · play #${String(playNo).padStart(6,"0")}`;
    const i = $("#simAddr", root); if (!i.value) i.value = addr || b58(44);
    $("#simErr", root).textContent = "";
    const b = $("#claimBtn", root); b.disabled = false; b.textContent = "Claim my play";
  }
  function claim(){
    const v = ($("#simAddr", root).value || "").trim();
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(v) && !/^0x[0-9a-fA-F]{40}$/.test(v)){ $("#simErr", root).textContent = "That doesn't look like a wallet address."; return; }
    addr = v;
    const b = $("#claimBtn", root); b.disabled = true; b.innerHTML = '<span class="spin"></span>Claiming';
    setTimeout(() => go("play"), 900);
  }

  /* ---------------- 5. result ---------------- */
  function result(win, kind){
    go("win");
    const cap = $("#winCap", root), P = $("#winP", root);
    cap.className = "win-cap " + (win ? (kind === "violet" ? "v" : kind === "rare" ? "r" : "") : "lose");
    cap.innerHTML = `<i class="cap ${win ? (kind === "violet" ? "v" : kind === "rare" ? "r" : "") : ""}"></i>`;
    const no = "#" + String(playNo).padStart(6,"0");
    $("#rcNo", root).textContent = no; $("#rc0", root).textContent = `${proj.cap} capsules`;
    if (win){
      const txt = kind === "rare" ? proj.rare : kind === "violet" ? `+${fmt(proj.violet)} ${proj.tk}` : `+${fmt(proj.gold)} ${proj.tk}`;
      $("#winK", root).textContent = kind === "rare" ? "Rare capsule" : "You won";
      P.textContent = txt; P.className = "win-prize" + (kind === "gold" ? " gold" : "");
      $("#winS", root).textContent = `Sent to ${short(addr)} · tx ${b58(4)}…${b58(4)}`;
      $("#rc4t", root).textContent = "Paid out"; $("#rc4", root).textContent = short(addr);
      confetti.burst(kind);
    } else {
      $("#winK", root).textContent = game.why || "No grab this time";
      P.textContent = "So close."; P.className = "win-prize";
      $("#winS", root).textContent = "The capsule stays in the machine. Every grab is on the record.";
      $("#rc4t", root).textContent = "Result"; $("#rc4", root).textContent = "no prize";
    }
    const rows = [...root.querySelectorAll(".rc-r")]; rows.forEach(r => r.classList.remove("on"));
    rows.forEach((r,i) => setTimeout(() => r.classList.add("on"), 500 + i*380));
    playNo += 1 + Math.floor(Math.random()*3);
  }

  /* ================= the machine : pseudo 3D canvas game ================= */
  const game = (function(){
    let cv, cx, W = 0, H = 0, dpr = 1, raf = 0, last = 0, running = false;
    let caps = [], parts = [], st, keys = {}, joyV = { x:0, z:0 };
    const R = 0.085, TOP = 0.98, CHUTE = { x0:-1, x1:-0.6, z0:0, z1:0.36, h:0.2 };

    function layout(){
      const r = cv.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1);
      W = r.width; H = r.height; cv.width = Math.round(W*dpr); cv.height = Math.round(H*dpr);
    }
    /* world: x -1..1 (left..right), z 0..1 (front..back), y 0..1 (floor..top) */
    function P(x, y, z){
      const s = 1 - 0.3*z, fy = H*0.88 - z*H*0.33;
      return { x: W/2 + x*W*0.44*s, y: fy - y*H*0.66*s, s, k: W*0.44*s };
    }

    function fill(){
      caps = [];
      const kinds = () => { const r = Math.random(); return r < 0.1 ? "rare" : r < 0.38 ? "violet" : "gold"; };
      for (let row = 0; row < 5; row++){
        for (let col = 0; col < 9; col++){
          const x = -0.42 + col*0.165 + (row % 2 ? 0.08 : 0) + (Math.random()-.5)*0.04;
          const z = 0.12 + row*0.19 + (Math.random()-.5)*0.04;
          if (x > 0.93) continue;
          caps.push({ x, z, y:R, kind:kinds(), vy:0, rest:R, state:"pile", a:1 });
        }
      }
      /* a second layer on top, nested between the first */
      for (let k = 0; k < 9; k++){
        const x = -0.3 + Math.random()*1.15, z = 0.2 + Math.random()*0.65;
        caps.push({ x, z, y:R*2.3, kind:kinds(), vy:0, rest:R*2.3, state:"pile", a:1 });
      }
    }

    function reset(){
      fill(); parts = [];
      st = { phase:"count", t:PLAY_S, x:0.25, z:0.55, y:TOP, open:0, held:null, slipAt:0, target:0, timeUp:false, ph:0, chuteGlow:0, shake:0 };
      api.why = "";
    }

    /* ---------- drawing ---------- */
    function quad(a, b, c, d, f, s, lw){
      cx.beginPath(); cx.moveTo(a.x,a.y); cx.lineTo(b.x,b.y); cx.lineTo(c.x,c.y); cx.lineTo(d.x,d.y); cx.closePath();
      if (f){ cx.fillStyle = f; cx.fill(); }
      if (s){ cx.strokeStyle = s; cx.lineWidth = lw || 1; cx.stroke(); }
    }
    function line(a, b, s, lw){ cx.beginPath(); cx.moveTo(a.x,a.y); cx.lineTo(b.x,b.y); cx.strokeStyle = s; cx.lineWidth = lw; cx.stroke(); }
    function glowLine(a, b, col, lw){
      cx.save(); cx.shadowColor = col; cx.shadowBlur = 16; line(a, b, col, lw); cx.restore();
    }

    function drawRoom(){
      const g = cx.createLinearGradient(0,0,0,H); g.addColorStop(0,"#070c22"); g.addColorStop(1,"#03050d");
      cx.fillStyle = g; cx.fillRect(0,0,W,H);
      const TOPY = 1.18;
      /* back wall */
      const bl = P(-1,0,1), br = P(1,0,1), tr = P(1,TOPY,1), tl = P(-1,TOPY,1);
      const bw = cx.createRadialGradient(W/2, bl.y - H*0.18, 10, W/2, bl.y - H*0.18, W*0.5);
      bw.addColorStop(0,"rgba(68,82,190,.55)"); bw.addColorStop(.6,"rgba(24,32,96,.35)"); bw.addColorStop(1,"rgba(8,12,34,.2)");
      quad(bl, br, tr, tl, bw);
      /* side walls */
      quad(P(-1,0,0), P(-1,0,1), P(-1,TOPY,1), P(-1,TOPY,0), "rgba(14,22,66,.55)");
      quad(P(1,0,0), P(1,0,1), P(1,TOPY,1), P(1,TOPY,0), "rgba(14,22,66,.55)");
      /* floor */
      const fl = cx.createLinearGradient(0, P(0,0,1).y, 0, P(0,0,0).y); fl.addColorStop(0,"#0d1640"); fl.addColorStop(1,"#060a1e");
      quad(P(-1,0,0), P(1,0,0), P(1,0,1), P(-1,0,1), fl);
      cx.globalAlpha = .18;
      for (let i = 1; i < 10; i++){ const x = -1 + i*0.2; line(P(x,0,0), P(x,0,1), "#7d84ff", 1); }
      for (let i = 1; i < 5; i++){ const z = i*0.2; line(P(-1,0,z), P(1,0,z), "#7d84ff", 1); }
      cx.globalAlpha = 1;
      /* neon edges */
      glowLine(P(-1,0,1), P(1,0,1), "rgba(125,132,255,.9)", 2);
      glowLine(P(-1,0,1), P(-1,TOPY,1), "rgba(63,233,255,.7)", 2);
      glowLine(P(1,0,1), P(1,TOPY,1), "rgba(255,92,174,.6)", 2);
      glowLine(P(-1,0,0), P(-1,0,1), "rgba(63,233,255,.5)", 2);
      glowLine(P(1,0,0), P(1,0,1), "rgba(255,92,174,.45)", 2);
      /* gantry */
      line(P(-0.98,1.1,0.02), P(-0.98,1.1,0.98), "rgba(200,210,235,.5)", 3);
      line(P(0.98,1.1,0.02), P(0.98,1.1,0.98), "rgba(200,210,235,.5)", 3);
      line(P(-0.98,1.1,0.98), P(0.98,1.1,0.98), "rgba(200,210,235,.35)", 3);
    }

    function drawChute(){
      const { x0, x1, z0, z1, h } = CHUTE, gl = st.chuteGlow;
      /* right face */
      const rg = cx.createLinearGradient(P(x1,h,z0).x, 0, P(x1,h,z1).x, 0); rg.addColorStop(0,"#1a2766"); rg.addColorStop(1,"#0e1747");
      quad(P(x1,0,z0), P(x1,0,z1), P(x1,h,z1), P(x1,h,z0), rg, "rgba(180,186,255,.35)", 1);
      /* top (opening) */
      const a = P(x0,h,z0), b = P(x1,h,z0), c = P(x1,h,z1), d = P(x0,h,z1);
      quad(a, b, c, d, "#02030a");
      cx.save(); cx.shadowColor = `rgba(255,178,74,${.35 + gl*.6})`; cx.shadowBlur = 14 + gl*30;
      quad(a, b, c, d, null, `rgba(255,${190 - gl*20},${90 - gl*30},${.55 + gl*.45})`, 2 + gl*2); cx.restore();
      /* front face */
      const fg = cx.createLinearGradient(0, a.y, 0, P(x0,0,z0).y); fg.addColorStop(0,"#25358a"); fg.addColorStop(1,"#121c55");
      quad(P(x0,0,z0), P(x1,0,z0), b, a, fg, "rgba(180,186,255,.4)", 1);
      /* label */
      const m = P((x0+x1)/2, h*0.5, z0);
      cx.font = `600 ${Math.max(9, m.k*0.035)}px ui-monospace, Menlo, monospace`; cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillStyle = `rgba(255,${210 - gl*40},140,${.7 + gl*.3})`; cx.fillText("DROP", m.x, m.y);
      /* pulsing arrow when carrying */
      if (st.phase === "carry"){
        const t = performance.now()/400, top = P((x0+x1)/2, h + 0.3 + Math.sin(t)*0.04, (z0+z1)/2);
        cx.fillStyle = "rgba(255,200,110,.95)"; cx.beginPath();
        const s = top.k*0.05; cx.moveTo(top.x - s, top.y - s); cx.lineTo(top.x + s, top.y - s); cx.lineTo(top.x, top.y + s*0.6); cx.closePath(); cx.fill();
      }
    }

    function drawCap(c){
      const p = P(c.x, c.y, c.z), r = R*p.k;
      if (c.a <= 0) return;
      cx.save(); cx.globalAlpha = c.a;
      /* contact shadow */
      if (c.state !== "chute"){
        const f = P(c.x, 0, c.z), lift = Math.max(0, c.y - c.rest);
        cx.fillStyle = `rgba(0,0,0,${.45 - Math.min(.3, lift)})`;
        cx.beginPath(); cx.ellipse(f.x, f.y, r*1.05, r*0.32, 0, 0, Math.PI*2); cx.fill();
      }
      /* coin */
      const col = c.kind === "rare" ? ["#ffffff","#7db0ff","#1f4fd1","rgba(59,123,255,.9)"] : c.kind === "violet" ? ["#efe8ff","#9a7bff","#4b2fc0","rgba(154,123,255,.8)"] : ["#fff3cf","#ffb24a","#c06a10","rgba(255,178,74,.75)"];
      const cg = cx.createRadialGradient(p.x - r*.15, p.y - r*.18, r*.05, p.x, p.y, r*.48);
      cg.addColorStop(0,col[0]); cg.addColorStop(.5,col[1]); cg.addColorStop(1,col[2]);
      cx.shadowColor = col[3]; cx.shadowBlur = r*.9;
      cx.fillStyle = cg; cx.beginPath(); cx.ellipse(p.x, p.y, r*.46, r*.42, -0.3, 0, Math.PI*2); cx.fill();
      cx.shadowBlur = 0;
      /* glass shell */
      const sg = cx.createRadialGradient(p.x - r*.35, p.y - r*.4, r*.05, p.x, p.y, r);
      sg.addColorStop(0,"rgba(255,255,255,.75)"); sg.addColorStop(.18,"rgba(255,255,255,.12)"); sg.addColorStop(.7,"rgba(150,165,255,.08)"); sg.addColorStop(1,"rgba(220,228,255,.45)");
      cx.fillStyle = sg; cx.beginPath(); cx.arc(p.x, p.y, r, 0, Math.PI*2); cx.fill();
      cx.strokeStyle = "rgba(230,236,255,.45)"; cx.lineWidth = Math.max(1, r*.05); cx.stroke();
      /* seam */
      cx.strokeStyle = "rgba(230,236,255,.25)"; cx.beginPath(); cx.ellipse(p.x, p.y, r*.98, r*.22, 0, 0, Math.PI); cx.stroke();
      cx.restore();
    }

    function chromeStroke(a, b){
      const g = cx.createLinearGradient(a.x, a.y, b.x, b.y);
      g.addColorStop(0,"#f4f6fb"); g.addColorStop(.45,"#8f9ab6"); g.addColorStop(.6,"#ffffff"); g.addColorStop(1,"#6b7593");
      return g;
    }
    function prong(hx, hy, dir, L, open, lw, dim){
      const a = (0.18 + open*0.62) * dir;
      const p1 = { x: hx + Math.sin(a)*L*0.62, y: hy + Math.cos(a)*L*0.62 };
      const b = a - dir*(0.95 + (1-open)*0.35);
      const p2 = { x: p1.x + Math.sin(b)*L*0.5, y: p1.y + Math.cos(b)*L*0.5 };
      cx.lineCap = "round"; cx.lineJoin = "round";
      cx.strokeStyle = dim ? "#59627e" : chromeStroke({x:hx,y:hy}, p2); cx.lineWidth = lw;
      cx.beginPath(); cx.moveTo(hx, hy); cx.lineTo(p1.x, p1.y); cx.lineTo(p2.x, p2.y); cx.stroke();
    }
    function drawClaw(){
      const top = P(st.x, 1.1, st.z), h = P(st.x, st.y, st.z), k = h.k;
      /* bridge across the gantry at the claw's depth + carriage */
      line(P(-0.98,1.1,st.z), P(0.98,1.1,st.z), "rgba(210,218,240,.65)", Math.max(2, k*0.012));
      cx.fillStyle = chromeStroke({x:top.x - k*.05, y:top.y}, {x:top.x + k*.05, y:top.y});
      cx.fillRect(top.x - k*0.05, top.y - k*0.02, k*0.1, k*0.04);
      /* cable */
      line(top, { x:h.x, y:h.y - k*0.04 }, "rgba(220,226,245,.85)", Math.max(1.2, k*0.005));
      const L = k*0.2, lw = Math.max(3, k*0.02), hy = h.y + k*0.025;
      /* back prong, then held capsule, then front prongs */
      prong(h.x, hy, 0.0001, L*0.82, st.open*0.3, lw*0.9, true);
      if (st.held) drawCap(st.held);
      prong(h.x - k*0.012, hy, -1, L, st.open, lw);
      prong(h.x + k*0.012, hy, 1, L, st.open, lw);
      /* hub */
      const hg = cx.createLinearGradient(h.x - k*.055, 0, h.x + k*.055, 0);
      hg.addColorStop(0,"#6b7593"); hg.addColorStop(.35,"#f4f6fb"); hg.addColorStop(.6,"#aab4cf"); hg.addColorStop(1,"#4b5470");
      cx.fillStyle = hg; cx.beginPath();
      if (cx.roundRect) cx.roundRect(h.x - k*.055, h.y - k*.065, k*.11, k*.095, k*.022); else cx.rect(h.x - k*.055, h.y - k*.065, k*.11, k*.095);
      cx.fill();
      cx.fillStyle = "rgba(59,123,255,.9)"; cx.beginPath(); cx.arc(h.x, h.y - k*.012, k*.01, 0, Math.PI*2); cx.fill();
    }
    function drawAim(){
      if (!(st.phase === "aim" || st.phase === "carry")) return;
      const r = R*P(st.x, 0, st.z).k*1.1;
      const under = topAt(st.x, st.z), on = P(st.x, under, st.z);
      cx.save();
      cx.setLineDash([3,5]); line(P(st.x, st.y - 0.12, st.z), on, "rgba(125,176,255,.45)", 1); cx.setLineDash([]);
      cx.strokeStyle = "rgba(125,176,255,.9)"; cx.lineWidth = 2; cx.shadowColor = "#3b7bff"; cx.shadowBlur = 12;
      cx.beginPath(); cx.ellipse(on.x, on.y, r, r*0.34, 0, 0, Math.PI*2); cx.stroke();
      cx.restore();
    }
    function drawParts(dt){
      parts = parts.filter(p => (p.life -= dt) > 0);
      parts.forEach(p => {
        p.vy += 900*dt; p.x += p.vx*dt; p.y += p.vy*dt;
        cx.globalAlpha = Math.min(1, p.life*2); cx.fillStyle = p.c;
        cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, Math.PI*2); cx.fill();
      });
      cx.globalAlpha = 1;
    }
    function glassFront(){
      const g = cx.createLinearGradient(0,0,W,H);
      g.addColorStop(0,"rgba(255,255,255,.05)"); g.addColorStop(.35,"rgba(255,255,255,0)"); g.addColorStop(.62,"rgba(180,186,255,.05)"); g.addColorStop(.66,"rgba(180,186,255,0)");
      cx.fillStyle = g; cx.fillRect(0,0,W,H);
      const v = cx.createRadialGradient(W/2, H/2, H*0.3, W/2, H/2, W*0.75); v.addColorStop(0,"rgba(0,0,0,0)"); v.addColorStop(1,"rgba(0,0,0,.45)");
      cx.fillStyle = v; cx.fillRect(0,0,W,H);
    }

    function render(dt){
      cx.setTransform(dpr,0,0,dpr,0,0);
      const sh = st.shake > 0 ? (Math.random()-.5)*st.shake*8 : 0;
      cx.translate(sh, 0);
      drawRoom(); drawChute();
      const list = caps.filter(c => c !== st.held && c.state !== "gone").sort((a,b) => b.z - a.z || a.y - b.y);
      let clawDrawn = false;
      for (const c of list){
        if (!clawDrawn && c.z < st.z - 0.02){ drawAim(); drawClaw(); clawDrawn = true; }
        drawCap(c);
      }
      if (!clawDrawn){ drawAim(); drawClaw(); }
      drawParts(dt);
      glassFront();
    }

    /* ---------- logic ---------- */
    function topAt(x, z){
      let best = 0;
      for (const c of caps){ if (c.state !== "pile") continue; const d = Math.hypot(c.x - x, (c.z - z)*1.15); if (d < R*1.1) best = Math.max(best, c.y + R*Math.sqrt(1 - Math.min(1,(d/(R*1.1))**2))); }
      return best;
    }
    function nearest(x, z){
      let best = null, bd = 1e9;
      for (const c of caps){ if (c.state !== "pile") continue; const d = Math.hypot(c.x - x, (c.z - z)*1.15) - (c.y - R)*0.4; if (d < bd){ bd = d; best = c; } }
      return { c: best, d: bd };
    }
    function inChute(){ return st.x < CHUTE.x1 - 0.02 && st.z < CHUTE.z1 - 0.02; }
    function toast(t, ms){
      const el = $("#simToast", root); el.textContent = t; el.classList.add("on");
      clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("on"), ms || 1300);
    }
    function hint(t){ const el = $("#simHint", root); if (t){ el.textContent = t; el.classList.add("on"); } else el.classList.remove("on"); }
    function setTimer(){
      const s = Math.max(0, Math.ceil(st.t)), b = $("#simT", root);
      b.textContent = "0:" + String(s).padStart(2,"0"); b.classList.toggle("low", s <= 5 && st.t > 0);
      $("#simTb", root).style.transform = `scaleX(${Math.max(0, st.t/PLAY_S)})`;
    }
    function burst(x, y, n, cols){
      for (let i = 0; i < n; i++){
        const a = -Math.PI/2 + (Math.random()-.5)*2.2, v = 180 + Math.random()*420;
        parts.push({ x, y, vx: Math.cos(a)*v, vy: Math.sin(a)*v, r: 1.5 + Math.random()*3, life: .6 + Math.random()*.8, c: cols[i % cols.length] });
      }
    }
    function dropHeld(){
      const c = st.held; if (!c) return;
      st.held = null; c.state = "fall"; c.vy = 0;
      c.rest = R; /* settle on the floor or on a lower capsule */
      const t = topAt(c.x, c.z); if (t > R*1.2) c.rest = Math.min(R*2.3, t + R*0.3);
    }
    function lose(why){
      if (st.phase === "end") return;
      st.phase = "end"; api.why = why; grabBtn(false); hint("");
      setTimeout(() => { if (running) result(false); }, 1500);
    }

    function step(dt){
      /* falling / chute capsules */
      for (const c of caps){
        if (c.state === "fall"){
          c.vy -= 3.2*dt; c.y += c.vy*dt;
          if (c.y <= c.rest){ c.y = c.rest; if (Math.abs(c.vy) > 0.35){ c.vy = -c.vy*0.32; } else { c.vy = 0; c.state = "pile"; } }
        } else if (c.state === "chute"){
          c.vy -= 3.4*dt; c.y += c.vy*dt;
          if (c.y < CHUTE.h){ c.a = Math.max(0, c.a - dt*5); }
          if (c.y < CHUTE.h - 0.05 && !c.burst){
            c.burst = true; st.chuteGlow = 1; st.shake = 0.6;
            const p = P((CHUTE.x0 + CHUTE.x1)/2, CHUTE.h, (CHUTE.z0 + CHUTE.z1)/2);
            burst(p.x, p.y, 70, ["#ffe3ad","#ffb24a","#ffffff","#7db0ff","#9a7bff"]);
            st.phase = "end"; hint("");
            setTimeout(() => { if (running) result(true, c.kind); }, 1300);
          }
          if (c.a <= 0) c.state = "gone";
        }
      }
      st.chuteGlow = Math.max(st.phase === "carry" ? 0.35 + Math.sin(performance.now()/260)*0.25 : 0, st.chuteGlow - dt*0.8);
      st.shake = Math.max(0, st.shake - dt*2);

      /* the 30 s clock */
      if (["aim","down","close","up","carry"].includes(st.phase)){
        st.t -= dt; setTimer();
        if (st.t <= 0){
          st.t = 0; setTimer();
          if (st.phase === "aim"){ toast("Time's up", 1400); lose("Time ran out"); return; }
          if (st.phase === "carry"){ st.open = 1; dropHeld(); toast("Time's up", 1400); lose("Time ran out with the capsule in the claw"); return; }
          st.timeUp = true;
        }
      }

      /* movement */
      if (st.phase === "aim" || st.phase === "carry"){
        let mx = joyV.x, mz = joyV.z;
        if (keys.ArrowLeft || keys.a) mx = -1; if (keys.ArrowRight || keys.d) mx = 1;
        if (keys.ArrowUp || keys.w) mz = 1; if (keys.ArrowDown || keys.s) mz = -1;
        st.x = Math.max(-0.9, Math.min(0.9, st.x + mx*dt*0.85));
        st.z = Math.max(0.06, Math.min(0.94, st.z + mz*dt*0.62));
        if (st.held){ st.held.x = st.x; st.held.z = st.z; st.held.y = st.y - 0.15; }
        if (st.phase === "carry" && inChute()){
          st.phase = "release"; st.ph = 0; hint("");
        }
      }

      if (st.phase === "down"){
        st.open = Math.min(1, st.open + dt*3);
        st.y = Math.max(st.target, st.y - dt*0.8);
        if (st.y <= st.target){ st.phase = "close"; st.ph = 0; }
      } else if (st.phase === "close"){
        st.ph += dt;
        const n = nearest(st.x, st.z), reach = R*1.25;
        const hold = n.c && n.d < reach;
        st.open = Math.max(hold ? 0.32 : 0, 1 - st.ph/0.45);
        if (st.ph >= 0.55){
          if (hold){
            const p = 0.32 + 0.6*(1 - Math.max(0, n.d)/reach); /* centred = 92%, edge = 32% */
            st.held = n.c; n.c.state = "held";
            st.slipAt = Math.random() < p ? 0 : 0.45 + Math.random()*0.4;
          } else st.held = null;
          st.phase = "up";
        }
      } else if (st.phase === "up"){
        st.y = Math.min(TOP, st.y + dt*0.62);
        if (st.held){
          st.held.x = st.x; st.held.z = st.z; st.held.y = st.y - 0.15;
          if (st.slipAt && st.y > st.slipAt){ st.open = 0.55; dropHeld(); toast("Slipped!", 1200); st.slipAt = 0; }
        }
        if (st.y >= TOP){
          if (st.held){
            if (st.timeUp){ st.open = 1; dropHeld(); toast("Time's up", 1400); lose("Time ran out with the capsule in the claw"); return; }
            st.phase = "carry"; hint("Bring it to the drop chute"); grabBtn(true, "Drop");
          } else {
            if (st.timeUp || st.t <= 0){ toast("Time's up", 1400); lose(st.open > 0.4 ? "It slipped at the last second" : "Time ran out"); return; }
            st.phase = "aim"; st.open = 0; grabBtn(true);
            if (!$("#simToast", root).classList.contains("on")) toast("Missed. Again!", 1100);
          }
        }
      } else if (st.phase === "release"){
        st.ph += dt;
        /* glide to the centre of the chute, then open */
        const tx = (CHUTE.x0 + CHUTE.x1)/2 + 0.04, tz = (CHUTE.z0 + CHUTE.z1)/2, e = Math.min(1, dt*7);
        st.x += (tx - st.x)*e; st.z += (tz - st.z)*e;
        if (st.held){ st.held.x = st.x; st.held.z = st.z; }
        if (st.ph > 0.4) st.open = Math.min(1, st.open + dt*4);
        if (st.held && st.ph > 0.5){ const c = st.held; st.held = null; c.state = "chute"; c.vy = 0; c.x = st.x; c.z = st.z; }
      } else if (st.phase === "aim" && st.open > 0){ st.open = Math.max(0, st.open - dt*2); }
    }

    function grab(){
      if (st.phase === "aim"){
        st.phase = "down";
        const n = nearest(st.x, st.z);
        const top = n.c && n.d < R*1.25 ? n.c.y + R*0.25 : 0.02;
        st.target = top + 0.1;
        grabBtn(false); hint("");
        const b = $("#simGrab", root); b.classList.add("press"); setTimeout(() => b.classList.remove("press"), 150);
      } else if (st.phase === "carry"){
        /* manual drop away from the chute: the capsule falls back on the pile */
        st.open = 1; dropHeld(); toast("Dropped", 1000); st.phase = "aim"; grabBtn(true); hint("");
      }
    }
    function grabBtn(on, label){ const b = $("#simGrab", root); b.disabled = !on; b.textContent = label || "Grab"; }

    function frame(now){
      const dt = Math.min(0.1, (now - last)/1000 || 0); last = now;
      if (st.phase !== "count") step(dt);
      render(dt);
    }
    function loop(now){
      if (!running) return;
      frame(now);
      raf = requestAnimationFrame(loop);
    }
    /* watchdog: if rAF is throttled (background pane, power saving) keep the clock and the claw honest */
    setInterval(() => { if (running && performance.now() - last > 120) frame(performance.now()); }, 100);

    function countdown(){
      const q = $("#simQ", root), n = $("#simQn", root);
      q.classList.add("on"); let k = 3;
      const tick = () => {
        if (!running) return;
        if (k === 0){ q.classList.remove("on"); st.phase = "aim"; grabBtn(true); hint("Steer over a capsule, then grab"); setTimeout(() => { if (st.phase === "aim") hint(""); }, 3600); return; }
        n.textContent = k; n.classList.remove("pop"); void n.offsetWidth; n.classList.add("pop"); k--;
        setTimeout(tick, 800);
      };
      tick();
    }

    /* joystick : drag the knob, or press and hold an edge */
    function joystick(){
      const j = $("#simJoy", root), kn = j.querySelector(".knob");
      let id = null;
      const setFrom = e => {
        const r = j.getBoundingClientRect(), max = r.width*0.32;
        let dx = e.clientX - (r.left + r.width/2), dy = e.clientY - (r.top + r.height/2);
        const l = Math.hypot(dx, dy); if (l > max){ dx *= max/l; dy *= max/l; }
        kn.style.transform = `translate(${dx}px,${dy}px)`;
        const ux = dx/max, uy = dy/max;
        joyV.x = Math.abs(ux) > 0.18 ? ux : 0; joyV.z = Math.abs(uy) > 0.18 ? -uy : 0;
      };
      j.addEventListener("pointerdown", e => { id = e.pointerId; j.setPointerCapture(id); j.classList.add("drag"); setFrom(e); e.preventDefault(); });
      j.addEventListener("pointermove", e => { if (e.pointerId === id) setFrom(e); });
      const end = e => { if (e.pointerId !== id) return; id = null; j.classList.remove("drag"); kn.style.transform = ""; joyV.x = joyV.z = 0; };
      j.addEventListener("pointerup", end); j.addEventListener("pointercancel", end);
    }

    const api = {
      why: "",
      init(){
        cv = $("#simCv", root); cx = cv.getContext("2d");
        joystick();
        $("#simGrab", root).addEventListener("click", grab);
        addEventListener("keydown", e => {
          if (!running) return;
          const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
          if (["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","w","a","s","d"].includes(k)){ keys[k] = true; e.preventDefault(); }
          if (k === " " || k === "Enter"){ e.preventDefault(); if (!e.repeat) grab(); }
        });
        addEventListener("keyup", e => { const k = e.key.length === 1 ? e.key.toLowerCase() : e.key; keys[k] = false; });
        addEventListener("blur", () => { keys = {}; });
        addEventListener("resize", () => { if (running) layout(); });
      },
      start(){
        $("#hudProj", root).textContent = proj.name;
        reset(); setTimer(); grabBtn(false); hint("");
        running = true; layout(); last = performance.now();
        cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
        countdown();
      },
      stop(){ running = false; cancelAnimationFrame(raf); keys = {}; joyV = { x:0, z:0 }; }
    };
    window.__sim = { get st(){ return st; }, get caps(){ return caps; }, grab, step: dt => step(dt) };
    return api;
  })();

  /* ---------------- confetti ---------------- */
  const confetti = (function(){
    let cv, cx, ps = [], raf = 0, until = 0;
    const COLS = { gold:["#ffb24a","#ffe3ad","#ffffff","#3b7bff","#b4baff"], violet:["#9a7bff","#c9bfff","#ffffff","#3b7bff","#ffb24a"], rare:["#3b7bff","#d6e4ff","#ffffff","#7db0ff","#ffb24a"] };
    function size(){ const d = Math.min(2, devicePixelRatio || 1); cv.width = innerWidth*d; cv.height = innerHeight*d; cx.setTransform(d,0,0,d,0,0); }
    function add(n, cols, fromTop){
      for (let i = 0; i < n; i++){
        const a = -Math.PI/2 + (Math.random()-.5)*1.6, v = 500 + Math.random()*700;
        ps.push(fromTop
          ? { x: Math.random()*innerWidth, y: -20 - Math.random()*200, vx:(Math.random()-.5)*60, vy: 60 + Math.random()*120, w: 6 + Math.random()*6, h: 3 + Math.random()*4, r: Math.random()*6, vr:(Math.random()-.5)*10, c: cols[i % cols.length], life: 6 }
          : { x: innerWidth/2 + (Math.random()-.5)*120, y: innerHeight*0.42, vx: Math.cos(a)*v, vy: Math.sin(a)*v, w: 6 + Math.random()*7, h: 3 + Math.random()*4, r: Math.random()*6, vr:(Math.random()-.5)*12, c: cols[i % cols.length], life: 5 });
      }
    }
    function frame(){
      cx.clearRect(0,0,innerWidth,innerHeight);
      const dt = 1/60;
      ps = ps.filter(p => (p.life -= dt) > 0 && p.y < innerHeight + 40);
      for (const p of ps){
        p.vy += 520*dt; p.vx *= 0.985; p.vy = Math.min(p.vy, 380); p.x += p.vx*dt; p.y += p.vy*dt; p.r += p.vr*dt;
        cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.scale(1, Math.cos(p.r*1.7));
        cx.fillStyle = p.c; cx.fillRect(-p.w/2, -p.h/2, p.w, p.h); cx.restore();
      }
      if (ps.length || performance.now() < until) raf = requestAnimationFrame(frame); else cx.clearRect(0,0,innerWidth,innerHeight);
    }
    return {
      burst(kind){
        cv = $("#simConf", root); cx = cv.getContext("2d"); size();
        const cols = COLS[kind] || COLS.gold;
        add(180, cols, false); setTimeout(() => add(160, cols, true), 350); setTimeout(() => add(90, cols, false), 900);
        until = performance.now() + 2000; cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
      },
      stop(){ ps = []; cancelAnimationFrame(raf); if (cx) cx.clearRect(0,0,innerWidth,innerHeight); }
    };
  })();

  /* ---------------- hero phone : the pre-rendered play, with its UI synced to the clip ---------------- */
  (function(){
    const v = document.getElementById("phVid"), tm = document.getElementById("phTimer"), won = document.getElementById("phWon"), gb = document.querySelector(".ph-grab");
    if (!v || !tm) return;
    /* clip beats (s): claw steered 0-4, grab 4.1, lift 6.5, carry 7.5-9.5, drop 10.3 */
    const GRAB = 4.1, DROP = 10.4;
    let pressed = false;
    v.addEventListener("timeupdate", () => {
      const t = v.currentTime;
      tm.textContent = "0:" + String(Math.max(0, 30 - Math.floor(t*1.6))).padStart(2,"0");
      if (gb){ const on = t > GRAB && t < GRAB + 0.35; if (on !== pressed){ pressed = on; gb.classList.toggle("press", on); } }
      if (won) won.classList.toggle("on", t > DROP);
    });
  })();

  /* ---------------- entry points ---------------- */
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-sim], a[href='#simulate']");
    if (!t) return;
    e.preventDefault(); open();
  });
  if (location.hash === "#simulate") addEventListener("load", () => setTimeout(open, 300));
  window.GrabSim = { open, close };
})();
