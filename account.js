/* Your account: one page per wallet, built from the connected address.
   The page is drawn once per wallet, then each block repaints alone, so a balance refresh never clears a form.
   Swaps go through Jupiter Ultra (they build the route and land it, the wallet signs). Delivery details live on the API. */
(function(){
  const root = document.getElementById("account"); if (!root) return;
  const CATS = { launch:"Launches", quest:"Quests", news:"News" };
  const API = "/api/v1/", JUP = "https://lite-api.jup.ag/ultra/v1/";
  const SOL = "So11111111111111111111111111111111111111112";
  const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
  const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch(e){ return d; } };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));
  const $ = id => document.getElementById(id);
  let drops = [], drawn = null, switched = null, capAt = 0;

  function gate(wait){
    drawn = null;
    root.classList.remove("ac-room");
    root.innerHTML = `<section class="ac-gate glass"><img src="assets/sub/tier-gold.webp" alt="" /><h1 class="chrome">Your account.</h1>${wait ? `<p>Finding your wallet</p>` : `<p>Connect to see your balance, tier and capsules.</p><button type="button" class="nv-go" id="connectBtn2">Connect wallet</button>`}</section>`;
  }
  const mine = addr => (window.glAuth && window.glAuth.me && window.glAuth.me.wallet === addr) ? window.glAuth.me : null;

  function paintDrops(){
    const box = $("acDrops"); if (!box) return;
    const on = read("gl_reminders", []), now = Date.now();
    const list = drops.map(d => ({ ...d, t:Date.parse(String(d.at).replace(" ", "T") + ":00Z") })).filter(d => d.t > now).sort((a, b) => a.t - b.t).slice(0, 3);
    box.innerHTML = list.length ? `<ul class="ac-next">${list.map(d => `<li><img src="${esc(d.logo || "assets/sub/drop-own.webp")}" alt="" /><div><a href="${esc(d.url || "participate.html#app")}">${esc(d.name)}</a><span>${new Date(d.t).toLocaleString("en-GB", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit", timeZone:"UTC" })} UTC</span></div><div class="side"><time data-t="${d.t}">${left(d.t)}</time><button type="button" class="${on.includes(d.id) ? "on" : ""}" data-a="rem" data-id="${esc(d.id)}">${on.includes(d.id) ? "Reminder set" : "Remind me"}</button></div></li>`).join("")}</ul>` : `<p class="ac-empty">No drops announced yet.</p>`;
  }
  const left = t => { const s = Math.max(0, Math.floor((t - Date.now()) / 1000)), p = n => String(n).padStart(2, "0"); return `${Math.floor(s / 86400)}d ${p(Math.floor(s / 3600) % 24)}h ${p(Math.floor(s / 60) % 60)}m ${p(s % 60)}s`; };
  setInterval(() => root.querySelectorAll(".ac-next time").forEach(c => { c.textContent = left(+c.dataset.t); }), 1000);
  function paintMe(addr){
    const me = mine(addr), caps = me ? me.capsules : [], n = read("gl_notify", {});
    const pl = $("acPlays"), cp = $("acCaps"), li = $("acCapList"), pg = $("acPings");
    if (pl) pl.textContent = me ? me.plays : 0;
    const lb = $("acLvl"), lv = glLevel(me), cur = lv.tier && glTiers[lv.tier], nx = lv.next && glTiers[lv.next];
    if (lb && lb.dataset.xp !== String(lv.xp)){
      lb.dataset.xp = lv.xp;
      lb.innerHTML = `${cur ? `<img class="ac-badge" src="assets/sub/${cur.img}.webp" alt="" />` : ""}<div class="ac-lvl-b"><p><b>${lv.tier ? `${lv.tier} tier` : "No tier yet"}</b><em>${lv.xp.toLocaleString("en-US")} XP</em></p><div class="ac-bar" title="10 XP a play, 40 XP a win"><i style="width:${lv.pct}%"></i></div><span>${lv.next ? `${lv.need.toLocaleString("en-US")} XP to ${lv.next}` : "Top tier reached"}</span></div>${nx ? `<img class="ac-lvl-n" src="assets/sub/${nx.img}.webp" alt="" />` : ""}`;
      $("acFree").textContent = cur ? cur.plays : 0;
    }
    if (cp) cp.textContent = caps.length;
    if (li) li.innerHTML = caps.length ? capPages(caps) : `<p class="ac-empty">Your first grab lands here.</p>`;
    capMark();
    if (pg){
      pg.textContent = n.on ? (n.cats || []).map(c => CATS[c]).filter(Boolean).join(", ") : "Off on this device";
      pg.parentNode.classList.toggle("on", !!n.on);
      $("acPingGo").textContent = n.on ? "Manage" : "Turn on";
    }
    const adm = $("acAdmin"), admin = !!me && me.role === "admin";
    root.classList.toggle("ac-room", admin);   /* the team wallet holds no money: it only sees the control room */
    if (adm && !!adm.firstChild !== admin) adm.innerHTML = admin ? `<section class="glass ac-admin"><iframe src="/api/v1/admin/ui" title="Admin" id="adminFrame"></iframe></section>` : "";
    Ship.paint(addr);
  }
  /* capsules, three to a page: swipe them, or pick a page under the list. Past eight pages the dots become a counter */
  function capPages(caps){
    const pages = []; for (let i = 0; i < caps.length; i += 3) pages.push(caps.slice(i, i + 3));
    const n = pages.length, mid = n > 8 ? `<span id="acPgN"></span>` : pages.map((_, i) => `<button type="button" class="dot" data-a="pg" data-i="${i}" aria-label="Page ${i + 1}"></button>`).join("");
    return `<div class="ac-pages" id="acPages">${pages.map(p => `<ul class="ac-drops">${p.map(c => `<li><b>${esc(c.label)}</b><span>${esc(c.status)}</span></li>`).join("")}</ul>`).join("")}</div>${n > 1 ? `<div class="ac-pager"><button type="button" data-a="pg" data-d="-1" aria-label="Previous page">‹</button>${mid}<button type="button" data-a="pg" data-d="1" aria-label="Next page">›</button></div>` : ""}`;
  }
  function capMark(){
    const b = $("acPages"); if (!b) return;
    const i = Math.round(b.scrollLeft / (b.clientWidth || 1)), n = b.children.length, c = $("acPgN"), bar = b.nextElementSibling; capAt = i;
    if (c) c.textContent = `${i + 1} / ${n}`;
    if (bar) bar.querySelectorAll("button").forEach(x => { if (x.dataset.i) x.classList.toggle("on", +x.dataset.i === i); else x.disabled = x.dataset.d < 0 ? i === 0 : i === n - 1; });
  }
  function paintChain(){
    const c = window.glChain.data, box = $("acBig"); if (!box || window.glChain.addr !== window.glWallet.addr || !c) return;
    box.innerHTML = `<span>${fmtUsdc(c.usdc)}</span><img src="assets/chains/usdc.png" alt="USDC" />`;
    $("acUsd").innerHTML = `<img src="assets/chains/solana-mark.svg" alt="SOL" />${fmtSol(c.sol)} for network fees`;
    /* the other tokens open over the page, so the card keeps its height */
    const others = c.tokens.filter(t => t.mint !== USDC_MINT);
    $("acTok").innerHTML = c.otherUsd >= .01 ? `<button type="button" class="ac-link" data-a="toks" aria-expanded="false">Plus ${fmtUsd(c.otherUsd)} in other tokens</button><ul class="ac-toks" id="acToks" hidden>${others.map(t => `<li>${t.icon ? `<img src="${esc(t.icon)}" alt="" />` : ""}<b>${esc(t.symbol)}</b><span>${t.ui.toLocaleString("en-US", { maximumFractionDigits:4 })}</span><em>${fmtUsd(t.usd)}</em></li>`).join("")}</ul>` : "";
    Swap.chain(c);
  }

  function draw(addr){
    drawn = addr;
    const same = switched === addr; switched = null;
    root.innerHTML = `
    <section class="glass ac-hero">
      <h1 class="chrome">Your account.</h1>
      <div class="ac-lvl" id="acLvl"></div>
      <div class="ac-addr"><code title="${esc(addr)}">${esc(shorten(addr))}</code><button type="button" data-a="copy">Copy</button><button type="button" data-a="switch">Switch wallet</button><button type="button" data-a="out">Disconnect</button></div>
      ${same ? `<p class="ac-note"><span>Your wallet gave the same account.</span><span>Disconnect grablab.fun inside the wallet, then switch again.</span></p>` : ""}
    </section>
    <section class="glass ac-card ac-bal">
      <h2>Your balance</h2>
      <div class="ac-big" id="acBig">...</div>
      <div class="ac-usd" id="acUsd"></div>
      <div class="ac-tok" id="acTok"></div>
    </section>
    <section class="ac-stats">
      <div class="glass"><img src="assets/sub/a-ticket.webp" alt="" /><b id="acFree">0</b><span>Free plays</span></div>
      <div class="glass"><img src="assets/icons/claw.webp" alt="" /><b id="acPlays">0</b><span>Plays</span></div>
      <div class="glass"><img src="assets/parts/capsule.png" alt="" /><b id="acCaps">0</b><span>Capsules</span></div>
    </section>
    <div id="acAdmin"></div>
    <section class="glass ac-card" id="swap">
      <h2>Add USDC</h2>
      <p class="ac-sub">Plays are paid in <img src="assets/chains/usdc.png" alt="" />USDC on <img src="assets/chains/solana-mark.svg" alt="" />Solana.</p>
      ${Swap.html()}
    </section>
    <section class="ac-grid">
      <div class="glass ac-card" id="acVault"><img src="assets/sub/vault.webp" alt="" /><h2>Your capsules</h2><div id="acCapList"></div><a class="nv-go" href="participate.html#simulate">Find a drop</a></div>
      <div class="glass ac-card" id="acNext"><img src="assets/sub/a-cal.webp" alt="" /><h2>Next drops</h2><div id="acDrops"></div></div>
    </section>
    <section class="glass ac-card" id="delivery">
      <img src="assets/sub/a-parcel.webp" alt="" />
      <h2>Delivery details</h2>
      <p class="ac-sub">For prizes we ship to your door.</p>
      <div id="acShip" style="width:100%;display:grid;justify-items:center"></div>
    </section>
    <section class="glass ac-card" id="acNotif"><img src="assets/sub/n-bell.webp" alt="" /><h2>Notifications</h2><div class="ac-ping"><i></i><span id="acPings"></span><button type="button" class="nv-go" id="acPingGo" data-notify>Turn on</button></div></section>`;
    Swap.reset(); Ship.reset();
    paintDrops(); paintMe(addr); paintChain();
    window.glChain.load(true);
    if (location.hash) { const h = document.querySelector(location.hash); if (h) h.scrollIntoView(); }
  }

  /* ---------- swap: any token in the wallet into SOL ---------- */
  const Swap = (() => {
    const BASE = [
      { mint:SOL, symbol:"SOL", decimals:9, ui:0, raw:"0", usd:0, icon:"assets/chains/solana-mark.svg" },
      { mint:"Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", symbol:"USDT", decimals:6, ui:0, raw:"0", usd:0, icon:"https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg" }
    ];
    let tokens = BASE, tk = BASE[0], order = null, tm = 0, seq = 0, busy = false, refresh = 0;
    let dir = "in", usdcRaw = 0n;   /* "in": a token becomes USDC. "out": USDC becomes the token. The arrow in the middle flips it */
    const USDCT = { mint: USDC_MINT, symbol: "USDC", decimals: 6 };
    const pay = () => dir === "in" ? tk : USDCT, get = () => dir === "in" ? USDCT : tk;
    const payRaw = () => dir === "in" ? BigInt(tk.raw) : usdcRaw;
    const usdcBtn = `<button type="button" class="sw-tk" disabled><img src="assets/chains/usdc.png" alt="" />USDC</button>`;
    const tkBtn = `<button type="button" class="sw-tk" id="swTk" aria-haspopup="listbox"></button>`;
    const dot = '<svg viewBox="0 0 12 12"><path d="M2 4l4 4 4-4"/></svg>';
    const icon = t => t.icon ? `<img src="${esc(t.icon)}" alt="" onerror="this.src='assets/sub/token-silver.webp'" />` : `<img src="assets/sub/token-silver.webp" alt="" />`;
    const trim = (v, d) => { const s = v.toFixed(d); return s.includes(".") ? s.replace(/\.?0+$/, "") : s; };
    /* the typed decimal to raw units, without going through a float */
    const toRaw = (txt, dec) => {
      const m = /^(\d*)(?:\.(\d*))?$/.exec(txt.trim()); if (!m || !(m[1] || m[2])) return 0n;
      return BigInt((m[1] || "0") + (m[2] || "").slice(0, dec).padEnd(dec, "0"));
    };
    const html = () => `<div class="sw">
      <div class="sw-box"><div class="sw-top"><span class="sw-lab">You pay</span><span id="swHave"></span></div>
        <div class="sw-row"><input class="sw-amt" id="swAmt" inputmode="decimal" placeholder="0" aria-label="Amount to swap" autocomplete="off" /><span class="sw-side" id="swPayTk">${tkBtn}</span></div>
        <div class="sw-pct"><button type="button" data-pct="25">25%</button><button type="button" data-pct="50">50%</button><button type="button" data-pct="75">75%</button><button type="button" data-pct="100">Max</button></div>
        <div class="sw-m" id="swMenu" hidden><input id="swFind" placeholder="Search any token or address" aria-label="Search a token" autocomplete="off" /><div id="swList" role="listbox"></div></div></div>
      <button type="button" class="sw-mid" id="swFlip" aria-label="Swap direction"><img src="assets/sub/a-swap.webp" alt="" /></button>
      <div class="sw-box"><div class="sw-top"><span class="sw-lab">You get</span><span id="swHaveGet"></span></div>
        <div class="sw-row"><span class="sw-amt" id="swOut">0</span><span class="sw-side" id="swGetTk">${usdcBtn}</span></div>
        <div class="sw-meta"><span>Worth</span><span id="swOutUsd">$0.00</span></div></div>
      <div class="sw-info" id="swInfo" hidden></div>
      <button type="button" class="nv-go" id="swGo" disabled>Enter an amount</button>
      <p class="sw-note" id="swNote" role="status"></p>
      <p class="sw-fine"><img src="assets/chains/jup.png" alt="" />Routed by Jupiter. You approve every swap in your wallet.</p></div>`;
    /* the list: what the wallet holds, then the most traded verified tokens, or the search results */
    const TOK = "https://lite-api.jup.ag/tokens/v2/";
    const fromJup = t => ({ mint:t.id, symbol:String(t.symbol || "").slice(0, 12), name:String(t.name || "").slice(0, 26), decimals:t.decimals, icon:t.icon || null, ui:0, raw:"0", usd:0 });
    const usable = list => list.filter(t => t.isVerified && t.id !== USDC_MINT).map(fromJup);
    let shown = [], popular = null, found = null, findSeq = 0;
    const paintMenu = () => {
      const l = $("swList"); if (!l) return;
      const held = found ? found.map(f => tokens.find(t => t.mint === f.mint) || f) : [...tokens, ...(popular || []).filter(p => !tokens.some(t => t.mint === p.mint))];
      shown = held;
      l.innerHTML = held.length ? held.map(t => `<button type="button" role="option" data-mint="${esc(t.mint)}">${icon(t)}<span>${esc(t.symbol)}${t.name && t.name !== t.symbol ? `<small>${esc(t.name)}</small>` : ""}</span><em>${t.ui ? trim(t.ui, 4) : ""}</em></button>`).join("") : `<p class="sw-none">No token found.</p>`;
    };
    async function loadPopular(){
      if (popular) return;
      try { popular = usable(await (await fetch(TOK + "toporganicscore/24h?limit=60")).json()); paintMenu(); } catch (e) {}
    }
    async function find(q){
      const mine = ++findSeq; q = q.trim();
      if (!q){ found = null; return paintMenu(); }
      try { const r = usable(await (await fetch(TOK + "search?query=" + encodeURIComponent(q))).json()); if (mine === findSeq){ found = r.slice(0, 20); paintMenu(); } } catch (e) {}
    }
    const paintTk = () => {
      if (!$("swPayTk")) return;
      $("swPayTk").innerHTML = dir === "in" ? tkBtn : usdcBtn; $("swGetTk").innerHTML = dir === "in" ? usdcBtn : tkBtn;
      $("swTk").innerHTML = `${icon(tk)}${esc(tk.symbol)}${dot}`;
      /* the token list opens under whichever box holds the token button */
      const menu = $("swMenu"); menu.hidden = true; $("swTk").closest(".sw-box").appendChild(menu); paintMenu();
      const usdcNow = `You have ${trim(Number(usdcRaw) / 1e6, 4)} USDC`, tkNow = `You have ${trim(tk.ui, 4)} ${tk.symbol}`;
      $("swHave").textContent = dir === "in" ? tkNow : usdcNow; $("swHaveGet").textContent = dir === "in" ? usdcNow : tkNow;
      $("swGo") && set(order ? `Swap to ${get().symbol}` : "Enter an amount", !!order);
    };
    const set = (label, on) => { const b = $("swGo"); if (b){ b.textContent = label; b.disabled = !on; } };
    const note = (msg, bad) => { const n = $("swNote"); if (n){ n.innerHTML = msg; n.classList.toggle("bad", !!bad); } };
    const clearOut = () => { order = null; if ($("swOut")){ $("swOut").textContent = "0"; $("swOutUsd").textContent = "$0.00"; $("swInfo").hidden = true; } };
    const REASON = { 1:"Not enough for this swap.", 2:"Not enough SOL to pay the network fee." };

    async function quote(raw){
      const u = `${JUP}order?inputMint=${pay().mint}&outputMint=${get().mint}&amount=${raw}&taker=${window.glWallet.addr}`;
      const r = await fetch(u); const o = await r.json();
      if (!r.ok || o.error) throw new Error(o.error || "quote");
      return o;
    }
    async function update(keep){
      clearTimeout(refresh);
      const P = pay(), G = get(), mySeq = ++seq, raw = toRaw($("swAmt").value, P.decimals);
      if (keep !== true) note("");
      if (raw <= 0n){ clearOut(); return set("Enter an amount", false); }
      if (raw > payRaw()){ clearOut(); return set(`Not enough ${P.symbol}`, false); }
      set("Getting price", false);
      try {
        const o = await quote(raw); if (mySeq !== seq) return;
        order = o;
        const out = Number(o.outAmount) / 10 ** G.decimals, min = Number(o.otherAmountThreshold) / 10 ** G.decimals, inAmt = Number(raw) / 10 ** P.decimals;
        $("swOut").textContent = trim(out, 5);
        $("swOutUsd").textContent = o.outUsdValue ? fmtUsd(o.outUsdValue) : "$0.00";
        const info = $("swInfo"); info.hidden = false;
        const rate = `1 ${esc(tk.symbol)} = ${trim(dir === "in" ? out / inAmt : inAmt / out, 4)} USDC`;
        info.innerHTML = `<p><span>Rate</span><em>${rate}</em></p>
          ${min && min < out ? `<p><span>Minimum you get</span><em>${trim(min, 5)} ${esc(G.symbol)}</em></p>` : ""}
          <p><span>Price impact</span><em>${Math.abs(+(o.priceImpactPct ?? o.priceImpact) || 0).toFixed(2)}%</em></p>`;
        if (!o.transaction){ set(`Swap to ${G.symbol}`, false); note(REASON[o.errorCode] || esc(o.errorMessage || "This swap isn't available right now."), true); return; }
        set(`Swap to ${G.symbol}`, true);
        refresh = setTimeout(update, 20000);   // a price is only good for a few seconds on chain
      } catch (e){ if (mySeq !== seq) return; clearOut(); set(`Swap to ${G.symbol}`, false); note("No price right now. Try again in a moment.", true); }
    }
    async function go(){
      if (busy || !order) return;
      busy = true; seq++; clearTimeout(refresh);
      const P = pay(), G = get(), addr = window.glWallet.addr, raw = toRaw($("swAmt").value, P.decimals);
      try {
        set("Open your wallet", false); note("");
        const p = await window.glWallet.signer();
        const o = await quote(raw);   // a fresh order: the one on screen may have expired
        if (!o.transaction) throw new Error("no tx");
        if (o.inputMint !== P.mint || o.outputMint !== G.mint || o.taker !== addr || o.inAmount !== raw.toString()) throw new Error("mismatch");
        const signedTransaction = await p.signTx(o.transaction, addr);
        set("Landing your swap", false);
        const r = await fetch(`${JUP}execute`, { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify({ signedTransaction, requestId:o.requestId }) });
        const x = await r.json();
        if (x.status !== "Success") throw new Error("failed");
        window.glTrack({ a:"swap" });
        $("swAmt").value = ""; clearOut(); set("Enter an amount", false);
        note(`Done. <a href="https://solscan.io/tx/${encodeURIComponent(x.signature)}" target="_blank" rel="noopener">View on Solscan</a>`);
        window.glChain.load(true);
      } catch (e){
        const m = String(e && e.message || "");
        set(`Swap to ${G.symbol}`, false);
        note(m === "reconnect" ? "Reconnect your wallet, then swap." : /reject|cancel|denied|closed/i.test(m) ? "Swap cancelled." : "The swap didn't go through. Nothing left your wallet unless your wallet shows it.", !/cancel|reject|denied|closed/i.test(m));
        update(true);
      } finally { busy = false; }
    }
    root.addEventListener("input", e => {
      if (e.target.id === "swFind"){ clearTimeout(tm); tm = setTimeout(() => find(e.target.value), 260); return; }
      if (e.target.id !== "swAmt") return; clearTimeout(tm); tm = setTimeout(update, 380);
    });
    root.addEventListener("click", e => {
      const menu = $("swMenu"); if (!menu) return;
      if (e.target.closest("#swTk")){ menu.hidden = !menu.hidden; if (!menu.hidden){ loadPopular(); $("swFind").focus(); } return; }
      const b = e.target.closest("[data-mint]");
      if (b){ tk = shown.find(t => t.mint === b.dataset.mint) || tk; $("swFind").value = ""; found = null; menu.hidden = true; paintTk(); update(); return; }
      if (!menu.hidden && !e.target.closest("#swMenu")) menu.hidden = true;
      if (e.target.closest("#swFlip")){ dir = dir === "in" ? "out" : "in"; $("swAmt").value = ""; clearOut(); paintTk(); set("Enter an amount", false); note(""); return; }
      const part = e.target.closest("[data-pct]");
      if (part){
        /* a share of it, with 0.01 SOL always kept for network fees when paying in SOL */
        const P = pay(); let r = payRaw(); if (P.mint === SOL) r = r > 10000000n ? r - 10000000n : 0n;
        r = r * BigInt(part.dataset.pct) / 100n;
        $("swAmt").value = r === 0n ? "" : r.toString().padStart(P.decimals + 1, "0").replace(new RegExp(`(\\d{${P.decimals}})$`), ".$1").replace(/\.0*$|(\.\d*?)0+$/, "$1"); update();
      }
      if (e.target.id === "swGo") go();
    });
    return { html,
      reset(){ tk = tokens[0]; order = null; dir = "in"; paintTk(); },
      chain(c){
        usdcRaw = BigInt(c.tokens.find(t => t.mint === USDC_MINT)?.raw || "0");
        const sol = { ...BASE[0], ui:c.sol, raw:String(c.lamports), usd:c.usd || 0 }, usdt = c.tokens.find(t => t.mint === BASE[1].mint);
        const have = c.tokens.filter(t => t.mint !== USDC_MINT && !BASE.some(b => b.mint === t.mint));
        tokens = [sol, usdt ? { ...BASE[1], ...usdt, icon:BASE[1].icon } : BASE[1], ...have];
        tk = tokens.find(t => t.mint === tk.mint) || tk;
        paintMenu();
        paintTk();
      } };
  })();

  /* ---------- delivery details: the street search fills in the rest ---------- */
  const Ship = (() => {
    let state = null, tm = 0, seq = 0, hits = [], pick = -1, saved = null;
    const F = [["name","Full name","s6","name"],["phone","Phone","s6","tel"],["street","Street","s4","off"],["number","No.","s2","off"],["extra","Apartment, floor","s6","address-line2"],["city","City","s3 m3","address-level2"],["region","County or state","s3 m3","address-level1"],["postcode","Postal code","s3 m3","postal-code"],["country","Country","s3 m3","country-name"]];
    const HINT = { name:"John Smith", phone:"+1 212 555 0123", street:"5th Avenue", number:"350", extra:"Apt 12B", city:"New York", region:"NY", postcode:"10118", country:"United States" };
    const form = () => `<form class="dl" id="dlForm" novalidate>${F.map(([k, l, c, ac]) => `<label class="dl-f ${c}" data-f="${k}"><span>${l}</span><input name="${k}" autocomplete="${ac}" placeholder="${HINT[k]}" ${k === "street" ? `role="combobox" aria-expanded="false" aria-autocomplete="list"` : ""} ${k === "phone" ? `inputmode="tel"` : ""} />${k === "street" ? `<ul class="dl-l" id="dlList" role="listbox" hidden></ul>` : ""}</label>`).join("")}<input type="hidden" name="cc" /><div class="dl-acts"><button type="submit" class="nv-go">Save details</button><p class="dl-msg" id="dlMsg" role="status"></p><button type="button" class="ac-link" id="dlDel" hidden>Remove my details</button></div></form>`;
    const msg = (t, bad) => { const m = $("dlMsg"); if (m){ m.textContent = t; m.classList.toggle("bad", !!bad); } };
    const fill = v => { const f = $("dlForm"); for (const k of Object.keys(v)) if (f.elements[k]) f.elements[k].value = v[k] || ""; };
    const closeList = () => { const l = $("dlList"); if (l){ l.hidden = true; l.innerHTML = ""; } hits = []; pick = -1; const f = $("dlForm"); if (f) f.elements.street.setAttribute("aria-expanded", "false"); };
    async function search(q){
      const mine = ++seq;
      try {
        const r = await fetch(API + "geo?q=" + encodeURIComponent(q), { credentials:"same-origin" });
        const d = await r.json(); if (mine !== seq) return;
        hits = d.results || []; pick = -1;
        const l = $("dlList"); if (!l) return;
        l.innerHTML = hits.map((h, i) => `<li role="option" data-i="${i}">${esc(h.street)}${h.number ? " " + esc(h.number) : ""}<span>${esc([h.postcode, h.city, h.country].filter(Boolean).join(", "))}</span></li>`).join("");
        l.hidden = !hits.length; $("dlForm").elements.street.setAttribute("aria-expanded", String(!!hits.length));
      } catch (e){}
    }
    function choose(h){
      const { street, number, city, region, postcode, country, cc } = h, f = $("dlForm");
      fill({ street, city, region, postcode, country, cc }); if (number) f.elements.number.value = number;
      closeList(); (number ? f.elements.extra : f.elements.number).focus();
    }
    root.addEventListener("input", e => {
      if (e.target.closest("[data-f]")) e.target.closest("[data-f]").classList.remove("bad");
      if (e.target.name !== "street" || !e.target.closest("#dlForm")) return;
      clearTimeout(tm); const q = e.target.value.trim();
      if (q.length < 3){ seq++; closeList(); return; }
      tm = setTimeout(() => search(q), 280);
    });
    root.addEventListener("keydown", e => {
      if (e.target.name !== "street" || !hits.length) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp"){ e.preventDefault(); pick = (pick + (e.key === "ArrowDown" ? 1 : hits.length - 1 + (pick < 0 ? 1 : 0))) % hits.length; [...$("dlList").children].forEach((li, i) => li.setAttribute("aria-selected", String(i === pick))); }
      if (e.key === "Enter" && pick >= 0){ e.preventDefault(); choose(hits[pick]); }
      if (e.key === "Escape") closeList();
    });
    root.addEventListener("pointerdown", e => { const li = e.target.closest("#dlList li"); if (li){ e.preventDefault(); choose(hits[+li.dataset.i]); } });
    root.addEventListener("focusout", e => { if (e.target.name === "street") setTimeout(closeList, 120); });
    root.addEventListener("submit", async e => {
      if (e.target.id !== "dlForm") return; e.preventDefault();
      const f = e.target, v = Object.fromEntries(new FormData(f)), miss = ["name", "phone", "street", "city", "postcode", "country"].filter(k => !v[k].trim());
      if (!/^[+()\d\s.\/-]{6,24}$/.test(v.phone.trim()) && !miss.includes("phone")) miss.push("phone");
      miss.forEach(k => f.querySelector(`[data-f="${k}"]`).classList.add("bad"));
      if (miss.length){ msg(miss.includes("phone") && miss.length === 1 ? "Check your phone number." : "Fill in the marked fields.", true); f.querySelector(".bad input").focus(); return; }
      msg("Saving");
      try {
        const r = await fetch(API + "me/delivery", { method:"POST", credentials:"same-origin", headers:{ "content-type":"application/json" }, body: JSON.stringify(v) });
        if (!r.ok) throw 0;
        saved = (await r.json()).delivery; $("dlDel").hidden = false; msg("Saved.");
      } catch (err){ msg("Couldn't save. Try again.", true); }
    });
    root.addEventListener("click", async e => {
      if (e.target.id === "dlDel"){
        try { await fetch(API + "me/delivery/delete", { method:"POST", credentials:"same-origin" }); $("dlForm").reset(); saved = null; e.target.hidden = true; msg("Removed."); } catch (err){ msg("Couldn't remove. Try again.", true); }
      }
      if (e.target.id === "dlSign"){
        e.target.disabled = true; e.target.textContent = "Open your wallet";
        try { await window.glAuth.login(); } catch (err){}
        if (!mine(window.glWallet.addr) && $("dlSign")){ e.target.disabled = false; const why = window.glAuth.why; e.target.textContent = why === "slow down" ? "Too many tries, wait 10 minutes" : why === "reconnect" ? "Verify wallet" : location.hostname === "localhost" ? "Works only on grablab.fun" : "Couldn't verify, try again"; }
      }
    });
    return {
      reset(){ state = null; saved = null; },
      async paint(addr){
        const box = $("acShip"), me = mine(addr); if (!box) return;
        if (!me){
          if (state !== "gate"){ state = "gate"; box.innerHTML = `<button type="button" class="nv-go" id="dlSign">Verify wallet</button>`; }
          return;
        }
        if (state === "form") return;
        state = "form"; box.innerHTML = form();
        try {
          const r = await fetch(API + "me/delivery", { credentials:"same-origin" }), d = await r.json();
          if (d.delivery && $("dlForm")){ saved = d.delivery; fill(saved); $("dlDel").hidden = false; }
        } catch (e){}
      } };
  })();

  root.addEventListener("click", async e => {
    const b = e.target.closest("[data-a]"); if (!b) return;
    if (b.dataset.a === "rem"){ const a = read("gl_reminders", []), i = a.indexOf(b.dataset.id); if (i < 0) a.push(b.dataset.id); else a.splice(i, 1); try { localStorage.setItem("gl_reminders", JSON.stringify(a)); } catch (err) {} paintDrops(); if (i < 0 && window.glNotify && !window.glNotify.isOn()) window.glNotify.open("launch"); return; }
    if (b.dataset.a === "toks"){ const l = $("acToks"); l.hidden = !l.hidden; b.setAttribute("aria-expanded", String(!l.hidden)); return; }
    if (b.dataset.a === "pg"){ const p = $("acPages"), to = b.dataset.i ? +b.dataset.i : capAt + +b.dataset.d; p.scrollTo({ left: to * p.clientWidth, behavior:"smooth" }); return; }
    if (b.dataset.a === "out") window.glWallet.disconnect();
    if (b.dataset.a === "switch"){ switched = window.glWallet.addr; await window.glWallet.disconnect(); openWallet(b); }
    if (b.dataset.a === "copy" || b.dataset.a === "deposit"){ const was = b.textContent; try { await navigator.clipboard.writeText(window.glWallet.addr); b.textContent = "Copied"; setTimeout(() => { b.textContent = was; }, 1400); } catch(err){} }
  });
  const show = () => {
    const a = window.glWallet && window.glWallet.addr;
    if (!a) return gate(false);
    if (drawn !== a) draw(a); else paintMe(a);
  };
  document.addEventListener("click", e => { const l = $("acToks"); if (l && !l.hidden && !e.target.closest("#acTok")){ l.hidden = true; root.querySelector('[data-a="toks"]').setAttribute("aria-expanded", "false"); } });
  root.addEventListener("scroll", e => { if (e.target.id === "acPages") capMark(); }, true);
  addEventListener("gl:wallet", show);
  addEventListener("gl:auth", show);
  addEventListener("gl:chain", paintChain);
  /* the admin room sizes itself */
  addEventListener("message", e => { if (e.origin === location.origin && e.data && e.data.glAdminHeight){ const f = document.getElementById("adminFrame"); if (f) f.style.height = e.data.glAdminHeight + "px"; } });
  let legacy = false; try { legacy = localStorage.getItem("gl_wallet") === "1"; } catch(e){}
  if (legacy && !(window.glWallet && window.glWallet.addr)){ gate(true); setTimeout(() => { if (!window.glWallet.addr) gate(false); }, 7000); } else show();
  fetch("assets/drops.json?m=" + Math.floor(Date.now()/6e4)).then(r => r.json()).then(f => { drops = f.drops || []; paintDrops(); }).catch(() => {});
})();
