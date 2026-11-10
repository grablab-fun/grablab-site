/* Your account: one page per wallet, built from the connected address.
   The page is drawn once per wallet, then each block repaints alone, so a balance refresh never clears a form.
   Swaps go through Jupiter Ultra (they build the route and land it, the wallet signs). Delivery details live on the API. */
(function(){
  const root = document.getElementById("account"); if (!root) return;
  const CATS = { launch:"Launches", quest:"Quests", news:"News" };
  /* Add USDC: on wide screens the page stays where it is, the swap card lights up and takes the cursor; stacked on a phone it scrolls to the card */
  function goSwap(){
    const s = document.getElementById("swap"), a = document.getElementById("swAmt"); if (!s) return;
    if (matchMedia("(min-width:1180px)").matches){ scrollTo({ top:0, behavior:"instant" }); a?.focus({ preventScroll:true }); }
    else s.scrollIntoView({ behavior:"smooth", block:"start" });
    s.classList.remove("ac-flash"); void s.offsetWidth; s.classList.add("ac-flash");
  }
  document.addEventListener("click", e => { if (e.target.closest?.('a[href$="#swap"]') && document.getElementById("swap")){ e.preventDefault(); goSwap(); } });
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
    const pages = []; for (let i = 0; i < caps.length; i += 2) pages.push(caps.slice(i, i + 2));
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
    if (location.hash === "#swap"){ history.replaceState(null, "", location.pathname); goSwap(); }
    else if (location.hash) { const h = document.querySelector(location.hash); if (h) h.scrollIntoView(); }
  }

  /* ---------- where the money comes from: Solana swaps through Jupiter, every other chain bridges in through deBridge.
     Whatever the source, the only thing that comes out is USDC on Solana ---------- */
  const NATIVE = "0x0000000000000000000000000000000000000000", DB_SOLANA = 7565164, DLN = "https://dln.debridge.finance/v1.0/dln/order/create-tx";
  const LG = n => `assets/chains/${n}`;
  /* probe = how many units to price the coin with, big enough to clear the bridge's minimum */
  const ETH = { symbol:"ETH", name:"Ether", icon:LG("ethereum.jpg"), mint:NATIVE, decimals:18, probe:"0.05" };
  const evUSDC = a => ({ symbol:"USDC", name:"USD Coin", icon:LG("usdc.png"), mint:a, decimals:6, usd:true });
  const evUSDT = (a, d = 6) => ({ symbol:"USDT", name:"Tether", icon:LG("usdt.svg"), mint:a, decimals:d, usd:true });
  const CHAINS = [
    { id:"solana", name:"Solana", icon:LG("solana-mark.svg"), note:"Swap with Jupiter" },
    { id:1, name:"Ethereum", icon:LG("ethereum.jpg"), gas:"ETH", tokens:[ETH, evUSDC("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"), evUSDT("0xdAC17F958D2ee523a2206206994597C13D831ec7")] },
    { id:8453, name:"Base", icon:LG("base.svg"), gas:"ETH", tokens:[ETH, evUSDC("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913")] },
    { id:42161, name:"Arbitrum", icon:LG("arbitrum.jpg"), gas:"ETH", tokens:[ETH, evUSDC("0xaf88d065e77c8cC2239327c5EDb3A432268e5831"), evUSDT("0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9")] },
    { id:56, name:"BNB Chain", icon:LG("binance.jpg"), gas:"BNB", tokens:[{ symbol:"BNB", name:"BNB", icon:LG("binance.jpg"), mint:NATIVE, decimals:18, probe:"0.1" }, evUSDT("0x55d398326f99059fF775485246999027B3197955", 18), { ...evUSDC("0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d"), decimals:18 }] },
    { id:137, name:"Polygon", icon:LG("polygon.jpg"), gas:"POL", tokens:[{ symbol:"POL", name:"Polygon", icon:LG("polygon.jpg"), mint:NATIVE, decimals:18, probe:"200" }, evUSDC("0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359"), evUSDT("0xc2132D05D31c914a87C6611C10748AEb04B58e8F")] },
    { id:10, name:"Optimism", icon:LG("optimism.jpg"), gas:"ETH", tokens:[ETH, evUSDC("0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85")] },
    { id:43114, name:"Avalanche", icon:LG("avalanche.jpg"), gas:"AVAX", tokens:[{ symbol:"AVAX", name:"Avalanche", icon:LG("avalanche.jpg"), mint:NATIVE, decimals:18, probe:"2" }, evUSDC("0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E"), evUSDT("0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7")] }
  ];
  for (const c of CHAINS) if (c.id !== "solana") c.note = "Bridge with deBridge";
  /* deBridge widget colours, matched to the site (same as the simulator) */
  const DB_STYLES = btoa(JSON.stringify({ appBackground:"#0b0e1b", appAccentBg:"#121a36", chartBg:"#0b0e1b", primary:"#b4baff", secondary:"#1e2648",
    badge:"#7d84ff", borderColor:"#262e55", borderRadius:16, fontColor:"#f3f4fb", fontColorAccent:"#9cc0ff", fontFamily:"Inter" }));
  let dbLoad = null;
  function loadDeBridge(){
    if (!dbLoad) dbLoad = new Promise((res, rej) => {
      const sc = document.createElement("script"); sc.src = "https://app.debridge.com/assets/scripts/widget.js"; sc.async = true;
      sc.onload = () => res(window.deBridge); sc.onerror = () => { dbLoad = null; sc.remove(); rej(new Error("deBridge failed to load")); };
      document.head.appendChild(sc);
    });
    return dbLoad;
  }

  /* ---------- swap: any token in the wallet into USDC, or bridged in from another chain ---------- */
  const Swap = (() => {
    const BASE = [
      { mint:SOL, symbol:"SOL", decimals:9, ui:0, raw:"0", usd:0, icon:"assets/chains/solana-mark.svg" },
      { mint:"Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", symbol:"USDT", decimals:6, ui:0, raw:"0", usd:0, icon:"https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg" }
    ];
    let tokens = BASE, tk = BASE[0], order = null, tm = 0, seq = 0, busy = false, refresh = 0;
    let dir = "in", usdcRaw = 0n;   /* "in": a token becomes USDC. "out": USDC becomes the token. The arrow in the middle flips it */
    let src = CHAINS[0], solTk = BASE[0], price = {};   /* src: the chain paying in. Bridges only run one way: into USDC on Solana */
    const bridging = () => src.id !== "solana";
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
      <div class="sw-box"><div class="sw-top"><span class="sw-lab">You pay on <button type="button" class="sw-ch" id="swCh" aria-haspopup="listbox" aria-label="Pick the chain you pay from"></button></span><span id="swHave"></span></div>
        <div class="sw-row"><input class="sw-amt" id="swAmt" inputmode="decimal" placeholder="0" aria-label="Amount to swap" autocomplete="off" /><span class="sw-side" id="swPayTk">${tkBtn}</span></div>
        <div class="sw-pct" id="swPct"></div>
        <div class="sw-m" id="swChMenu" hidden><div id="swChList" role="listbox">${CHAINS.map(c => `<button type="button" role="option" data-ch="${c.id}"><img src="${c.icon}" alt="" /><span>${c.name}<small>${c.note}</small></span>${c.id === "solana" ? "<em>Fastest</em>" : ""}</button>`).join("")}</div></div>
        <div class="sw-m" id="swMenu" hidden><input id="swFind" placeholder="Search any token or address" aria-label="Search a token" autocomplete="off" /><div id="swList" role="listbox"></div></div></div>
      <button type="button" class="sw-mid" id="swFlip" aria-label="Swap direction"><img src="assets/sub/a-swap.webp" alt="" /></button>
      <div class="sw-box"><div class="sw-top"><span class="sw-lab">You get</span><span id="swHaveGet"></span></div>
        <div class="sw-row"><span class="sw-amt" id="swOut">0</span><span class="sw-side" id="swGetTk">${usdcBtn}</span></div>
        <div class="sw-meta"><span>Worth</span><span id="swOutUsd">$0.00</span></div></div>
      <div class="sw-info" id="swInfo" hidden></div>
      <button type="button" class="nv-go" id="swGo" disabled>Enter an amount</button>
      <p class="sw-note" id="swNote" role="status"></p>
      <p class="sw-fine" id="swFine"></p></div>`;
    const PCT = `<button type="button" data-pct="25">25%</button><button type="button" data-pct="50">50%</button><button type="button" data-pct="75">75%</button><button type="button" data-pct="100">Max</button>`;
    const USD = [10, 25, 50, 100].map(v => `<button type="button" data-usd="${v}">$${v}</button>`).join("");
    /* the list: what the wallet holds, then the most traded verified tokens, or the search results */
    const TOK = "https://lite-api.jup.ag/tokens/v2/";
    const fromJup = t => ({ mint:t.id, symbol:String(t.symbol || "").slice(0, 12), name:String(t.name || "").slice(0, 26), decimals:t.decimals, icon:t.icon || null, ui:0, raw:"0", usd:0 });
    const usable = list => list.filter(t => t.isVerified && t.id !== USDC_MINT).map(fromJup);
    let shown = [], popular = null, found = null, findSeq = 0;
    const paintMenu = () => {
      const l = $("swList"); if (!l) return;
      const held = bridging() ? src.tokens : found ? found.map(f => tokens.find(t => t.mint === f.mint) || f) : [...tokens, ...(popular || []).filter(p => !tokens.some(t => t.mint === p.mint))];
      shown = held;
      l.innerHTML = held.length ? held.map(t => `<button type="button" role="option" data-mint="${esc(t.mint)}">${icon(t)}<span>${esc(t.symbol)}${t.name && t.name !== t.symbol ? `<small>${esc(t.name)}</small>` : ""}</span><em>${t.ui ? trim(t.ui, 4) : ""}</em></button>`).join("") : `<p class="sw-none">No token found.</p>`;
      /* any other coin on that chain: deBridge has the full list */
      if (bridging()) l.insertAdjacentHTML("beforeend", `<button type="button" role="option" data-any><span class="sw-any">+</span><span>Another coin<small>Search any token on ${esc(src.name)}</small></span></button>`);
      $("swFind").hidden = bridging();
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
      const usdcNow = `You have ${trim(Number(usdcRaw) / 1e6, 4)} USDC`, tkNow = bridging() ? `Fee paid in ${src.gas}` : `You have ${trim(tk.ui, 4)} ${tk.symbol}`;
      $("swHave").textContent = dir === "in" ? tkNow : usdcNow; $("swHaveGet").textContent = dir === "in" ? usdcNow : tkNow;
      $("swCh").innerHTML = `<img src="${src.icon}" alt="" />${esc(src.name)}${dot}`;
      /* the wallet balance is only known on Solana: other chains get dollar amounts */
      const pct = $("swPct"), want = bridging() ? "usd" : "pct";
      if (pct.dataset.k !== want){ pct.innerHTML = bridging() ? USD : PCT; pct.dataset.k = want; }
      $("swFlip").disabled = bridging();
      $("swFine").innerHTML = bridging()
        ? `<img src="assets/debridge-mark.webp?v=1" alt="" />Bridged by deBridge. You approve every step in your wallet.`
        : `<img src="assets/chains/jup.png" alt="" />Routed by Jupiter. You approve every swap in your wallet.`;
      $("swGo") && set(order ? goLabel() : "Enter an amount", !!order);
    };
    const goLabel = () => bridging() ? "Bridge to USDC" : `Swap to ${get().symbol}`;
    function pickChain(id){
      const c = CHAINS.find(x => String(x.id) === String(id)); if (!c || c === src) return;
      if (!bridging()) solTk = tk;
      src = c; dir = "in"; tk = bridging() ? c.tokens[0] : solTk;
      $("swAmt").value = ""; clearOut(); note(""); paintTk(); set("Enter an amount", false);
      if (bridging()) loadDeBridge().catch(() => {});   /* warm the widget while they type */
    }
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
    /* a bridge estimate from deBridge: no wallet needed until the bridge window opens */
    async function bridgeQuote(t, raw){
      const u = `${DLN}?srcChainId=${src.id}&srcChainTokenIn=${t.mint}&srcChainTokenInAmount=${raw}&dstChainId=${DB_SOLANA}&dstChainTokenOut=${USDC_MINT}&dstChainTokenOutAmount=auto&prependOperatingExpenses=false`;
      const r = await fetch(u); const o = await r.json();
      if (!r.ok || o.errorId || !o.estimation) throw new Error(o.errorId || "quote");
      if (o.estimation.dstChainTokenOut.address !== USDC_MINT) throw new Error("mismatch");
      return o;
    }
    const soon = s => !s || s < 60 ? "Under a minute" : `About ${Math.round(s / 60)} min`;
    async function updateBridge(keep){
      const mySeq = ++seq, t = tk, raw = toRaw($("swAmt").value, t.decimals);
      if (keep !== true) note("");
      if (raw <= 0n){ clearOut(); return set("Enter an amount", false); }
      set("Getting price", false);
      try {
        const o = await bridgeQuote(t, raw); if (mySeq !== seq) return;
        order = o;
        const e = o.estimation, out = Number(e.dstChainTokenOut.recommendedAmount || e.dstChainTokenOut.amount) / 1e6, inAmt = Number(raw) / 10 ** t.decimals;
        $("swOut").textContent = trim(out, 5);
        $("swOutUsd").textContent = fmtUsd(e.dstChainTokenOut.recommendedApproximateUsdValue ?? e.dstChainTokenOut.approximateUsdValue ?? out);
        const fee = Number(o.fixFee || 0) / 1e18;
        const info = $("swInfo"); info.hidden = false;
        info.innerHTML = `<p><span>Rate</span><em>1 ${esc(t.symbol)} = ${trim(out / inAmt, 4)} USDC</em></p>
          ${fee ? `<p><span>Bridge fee</span><em>${trim(fee, 5)} ${esc(src.gas)}</em></p>` : ""}
          <p><span>Arrives in</span><em>${soon(o.order?.approximateFulfillmentDelay)}</em></p>`;
        set(goLabel(), true);
        refresh = setTimeout(() => update(true), 20000);
      } catch (e){
        if (mySeq !== seq) return; clearOut(); set(goLabel(), false);
        note(/LOW_GIVE/.test(e.message) ? "Too small to bridge.<br />Try a bigger amount." : "No price right now. Try again in a moment.", true);
      }
    }
    async function update(keep){
      clearTimeout(refresh);
      if (bridging()) return updateBridge(keep);
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
    /* the bridge itself runs in deBridge's own window: it connects the wallet on the other chain and asks it to sign.
       Locked so the only way out is USDC on Solana, sent to the wallet signed in here */
    let sheet = null;
    const shut = () => { if (sheet){ sheet.remove(); sheet = null; document.documentElement.classList.remove("br-open"); } };
    addEventListener("keydown", e => { if (e.key === "Escape" && sheet) shut(); });
    async function openBridge(t){
      if (sheet) return;
      const addr = window.glWallet.addr, amt = $("swAmt").value.trim(), c = src;
      clearTimeout(refresh);
      sheet = document.createElement("div"); sheet.className = "br";
      sheet.innerHTML = `<div class="br-sheet glass" role="dialog" aria-modal="true" aria-labelledby="brT">
        <div class="br-h"><div><h2 id="brT">Bridge to USDC</h2>
          <p>Connect your ${esc(c.name)} wallet below.</p>
          <p>USDC lands in <b>${esc(addr.slice(0, 4))}...${esc(addr.slice(-4))}</b> on Solana.</p></div>
          <button type="button" class="br-x" aria-label="Close">×</button></div>
        <div class="br-db" id="brDb"><span class="br-load">Loading the bridge</span></div></div>`;
      document.body.appendChild(sheet); document.documentElement.classList.add("br-open");
      sheet.addEventListener("click", e => { if (e.target === sheet || e.target.closest(".br-x")) shut(); });
      sheet.querySelector(".br-x").focus();
      const mine = sheet;
      try {
        const DB = await loadDeBridge(); if (sheet !== mine) return;
        const box = $("brDb"); box.innerHTML = "";
        const cfg = { v:"1", element:"brDb", mode:"deswap", title:"Grablab", theme:"dark", styles:DB_STYLES, lang:"en",
          width: Math.round(box.clientWidth) || 420, height: 600,
          inputChain: c.id, outputChain: DB_SOLANA, outputCurrency: USDC_MINT,
          supportedChains: JSON.stringify({ inputChains:{ [c.id]:"all" }, outputChains:{ [DB_SOLANA]:[USDC_MINT] } }) };
        if (t){ cfg.inputCurrency = t.mint; if (amt && toRaw(amt, t.decimals) > 0n) cfg.amount = amt; }
        const w = await DB.widget(cfg); if (sheet !== mine) return;
        /* the window ignores some of its start settings, so set them again once it is ready and put them back if anything moves */
        const lock = () => { try { w.changeOutputChain(DB_SOLANA); w.changeOutputToken(USDC_MINT); } catch (e) {} };
        /* it takes a few seconds to accept the amount: keep offering it until they click into the window themselves */
        const fill = () => { if (sheet !== mine || document.activeElement?.tagName === "IFRAME") return; try { w.setReceiverAddress(addr); if (cfg.amount) w.setInputAmount(cfg.amount); } catch (e) {} };
        lock();
        if (t){ try { w.changeInputChain(c.id); w.changeInputToken(t.mint); } catch (e) {} }
        [500, 2000, 4000, 6500, 9000].forEach(ms => setTimeout(fill, ms));
        let relock = 0;
        const guard = ok => { if (!ok && relock++ < 5) lock(); };
        w.on?.("outputChainChanged", (_, p) => { if (p) guard(p.chainId == DB_SOLANA); });
        w.on?.("outputTokenChanged", (_, p) => { if (p && p.address) guard(String(p.address).toLowerCase() === USDC_MINT.toLowerCase()); });
        w.on?.("order", () => {
          window.glTrack({ a:"bridge" });
          $("swAmt").value = ""; clearOut(); set("Enter an amount", false);
          note(`Bridge sent from ${esc(c.name)}.<br />Your USDC lands in a minute or two.`);
          [30, 90, 180].forEach(s => setTimeout(() => window.glChain.load(true), s * 1000));
        });
      } catch (e){
        if (sheet === mine) $("brDb").innerHTML = `<p class="br-load">The bridge could not load.<br />Try again in a moment.</p>`;
      }
    }
    /* a dollar chip: stablecoins are 1 to 1, other coins get priced once with a probe quote */
    async function dollars(v){
      const t = tk, key = src.id + ":" + t.mint;
      if (!t.usd && !price[key]){
        set("Getting price", false);
        try { const e = (await bridgeQuote(t, toRaw(t.probe, t.decimals))).estimation.srcChainTokenIn; price[key] = e.originApproximateUsdValue / Number(t.probe); }
        catch (e){ set(goLabel(), false); note("No price right now. Try again in a moment.", true); return; }
        if (t !== tk) return;
      }
      const n = t.usd ? v : v / price[key];
      $("swAmt").value = t.usd ? trim(n, 2) : n < 1 ? String(+n.toPrecision(4)) : trim(n, 4); update();
    }
    async function go(){
      if (bridging()) return openBridge(tk);
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
    /* the open token menu holds the wheel: the page moves only once the mouse leaves it */
    root.addEventListener("wheel", e => {
      if (!e.target.closest?.("#swMenu")) return;
      const l = $("swList"), inList = e.target.closest("#swList"), end = e.deltaY < 0 ? l.scrollTop <= 0 : l.scrollTop + l.clientHeight >= l.scrollHeight - 1;
      if (inList && !end) return;
      e.preventDefault(); if (!inList) l.scrollTop += e.deltaY;
    }, { passive:false });
    root.addEventListener("click", e => {
      const menu = $("swMenu"), chm = $("swChMenu"); if (!menu) return;
      if (e.target.closest("#swCh")){ menu.hidden = true; chm.hidden = !chm.hidden; return; }
      const ch = e.target.closest("[data-ch]");
      if (ch){ chm.hidden = true; pickChain(ch.dataset.ch); return; }
      if (e.target.closest("#swTk")){ chm.hidden = true; menu.hidden = !menu.hidden; if (!menu.hidden && !bridging()){ loadPopular(); $("swFind").focus(); } return; }
      if (e.target.closest("[data-any]")){ menu.hidden = true; openBridge(null); return; }
      const b = e.target.closest("[data-mint]");
      if (b){ tk = shown.find(t => t.mint === b.dataset.mint) || tk; $("swFind").value = ""; found = null; menu.hidden = true; paintTk(); update(); return; }
      if (!menu.hidden && !e.target.closest("#swMenu")) menu.hidden = true;
      if (!chm.hidden && !e.target.closest("#swChMenu")) chm.hidden = true;
      if (e.target.closest("#swFlip")){ if (bridging()) return; dir = dir === "in" ? "out" : "in"; $("swAmt").value = ""; clearOut(); paintTk(); set("Enter an amount", false); note(""); return; }
      const usd = e.target.closest("[data-usd]");
      if (usd){ dollars(+usd.dataset.usd); return; }
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
      reset(){ shut(); src = CHAINS[0]; tk = solTk = tokens[0]; order = null; dir = "in"; paintTk(); },
      chain(c){
        usdcRaw = BigInt(c.tokens.find(t => t.mint === USDC_MINT)?.raw || "0");
        const sol = { ...BASE[0], ui:c.sol, raw:String(c.lamports), usd:c.usd || 0 }, usdt = c.tokens.find(t => t.mint === BASE[1].mint);
        const have = c.tokens.filter(t => t.mint !== USDC_MINT && !BASE.some(b => b.mint === t.mint));
        tokens = [sol, usdt ? { ...BASE[1], ...usdt, icon:BASE[1].icon } : BASE[1], ...have];
        solTk = tokens.find(t => t.mint === solTk.mint) || solTk;
        if (!bridging()) tk = tokens.find(t => t.mint === tk.mint) || tk;
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
