/* Your account: one page per wallet, built from the connected address.
   The page is drawn once per wallet, then each block repaints alone, so a balance refresh never clears a form.
   Swaps go through Jupiter Ultra (they build the route and land it, the wallet signs). Delivery details live on the API. */
(function(){
  const root = document.getElementById("account"); if (!root) return;
  const CATS = { launch:"Launches", quest:"Quests", news:"News" };
  const API = "/api/v1/", JUP = "https://lite-api.jup.ag/ultra/v1/";
  const SOL = "So11111111111111111111111111111111111111112";
  const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch(e){ return d; } };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));
  const $ = id => document.getElementById(id);
  let drops = [], drawn = null;

  function gate(wait){
    drawn = null;
    root.innerHTML = `<section class="ac-gate glass"><img src="assets/sub/tier-gold.webp" alt="" /><h1 class="chrome">Your account.</h1>${wait ? `<p>Finding your wallet</p>` : `<p>Connect to see your balance, tier and capsules.</p><button type="button" class="nv-go" id="connectBtn2">Connect wallet</button>`}</section>`;
  }
  const mine = addr => (window.glAuth && window.glAuth.me && window.glAuth.me.wallet === addr) ? window.glAuth.me : null;

  function paintDrops(){
    const box = $("acDrops"); if (!box) return;
    const on = read("gl_reminders", []), now = Date.now();
    const list = drops.map(d => ({ ...d, t:Date.parse(String(d.at).replace(" ", "T") + ":00Z") })).filter(d => d.t > now).sort((a, b) => a.t - b.t).slice(0, 3);
    box.innerHTML = list.length ? `<ul class="ac-drops">${list.map(d => `<li><b>${esc(d.name)}</b><span>${new Date(d.t).toLocaleString("en-GB", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit", timeZone:"UTC" })} UTC</span>${on.includes(d.id) ? `<em>Reminder on</em>` : ""}</li>`).join("")}</ul>` : `<p class="ac-empty">No drops announced yet.</p>`;
  }
  function paintMe(addr){
    const me = mine(addr), caps = me ? me.capsules : [], n = read("gl_notify", {});
    const pl = $("acPlays"), cp = $("acCaps"), li = $("acCapList"), pg = $("acPings");
    if (pl) pl.textContent = me ? me.plays : 0;
    if (cp) cp.textContent = caps.length;
    if (li) li.innerHTML = caps.length ? `<ul class="ac-drops">${caps.map(c => `<li><b>${esc(c.label)}</b><span>${esc(c.status)}</span></li>`).join("")}</ul>` : `<p class="ac-empty">Your first grab lands here.</p>`;
    if (pg) pg.textContent = n.on ? (n.cats || []).map(c => CATS[c]).filter(Boolean).join(", ") : "Off on this device";
    const adm = $("acAdmin");
    if (adm) adm.innerHTML = me && me.role === "admin" ? `<section class="glass ac-admin"><iframe src="/api/v1/admin/ui" title="Admin" id="adminFrame"></iframe></section>` : "";
    Ship.paint(addr);
  }
  function paintChain(){
    const c = window.glChain.data, box = $("acBig"); if (!box || window.glChain.addr !== window.glWallet.addr || !c) return;
    box.innerHTML = `${fmtSol(c.sol)} <small>SOL</small>`;
    $("acUsd").textContent = c.usd == null ? "" : fmtUsd(c.usd);
    $("acTok").textContent = c.tokensUsd >= .01 ? `Plus ${fmtUsd(c.tokensUsd)} in other tokens` : "";
    Swap.chain(c);
  }

  function draw(addr){
    const e = demoTierFor(addr), t = e && glTiers[e.tier];
    drawn = addr;
    root.innerHTML = `
    <section class="ac-hero">
      <img class="ac-badge" src="assets/sub/${t ? t.img : "tier-iron"}.webp" alt="" />
      <span class="ac-k">${t ? `${e.tier} tier` : "No tier yet"}</span>
      <h1 class="chrome">Your account.</h1>
      <div class="ac-addr"><code title="${esc(addr)}">${esc(shorten(addr))}</code><button type="button" data-a="copy">Copy</button><button type="button" data-a="switch">Switch wallet</button><button type="button" data-a="out">Disconnect</button></div>
    </section>
    <section class="glass ac-card ac-bal">
      <img src="assets/sub/a-sol.webp" alt="" />
      <h2>Your balance</h2>
      <div class="ac-big" id="acBig">...</div>
      <div class="ac-usd" id="acUsd"></div>
      <div class="ac-tok" id="acTok"></div>
      <div class="ac-acts"><a class="nv-go" href="#swap">Add SOL</a><button type="button" class="ac-link" data-a="deposit">Copy address to deposit</button></div>
    </section>
    <section class="ac-stats">
      <div class="glass"><img src="assets/sub/a-ticket.webp" alt="" /><b>${t ? t.plays : 0}</b><span>Free plays</span></div>
      <div class="glass"><img src="assets/icons/claw.webp" alt="" /><b id="acPlays">0</b><span>Plays</span></div>
      <div class="glass"><img src="assets/parts/capsule.png" alt="" /><b id="acCaps">0</b><span>Capsules</span></div>
    </section>
    <div id="acAdmin"></div>
    <section class="glass ac-card" id="swap">
      <img src="assets/sub/a-swap.webp" alt="" />
      <h2>Add SOL</h2>
      <p class="ac-sub">Swap a token from your wallet to SOL.</p>
      ${Swap.html()}
    </section>
    <section class="ac-grid">
      <div class="glass ac-card"><img src="assets/sub/vault.webp" alt="" /><h2>Your capsules</h2><div id="acCapList"></div><a class="nv-go" href="participate.html">Find a drop</a></div>
      <div class="glass ac-card"><img src="assets/sub/a-cal.webp" alt="" /><h2>Next drops</h2><div id="acDrops"></div></div>
    </section>
    <section class="glass ac-card" id="delivery">
      <img src="assets/sub/a-parcel.webp" alt="" />
      <h2>Delivery details</h2>
      <p class="ac-sub">For prizes we ship to your door.</p>
      <div id="acShip" style="width:100%;display:grid;justify-items:center"></div>
    </section>
    <section class="glass ac-card"><img src="assets/sub/n-bell.webp" alt="" /><h2>Notifications</h2><p class="ac-empty" id="acPings"></p><button type="button" class="ac-link" data-notify>Manage</button></section>`;
    Swap.reset(); Ship.reset();
    paintDrops(); paintMe(addr); paintChain();
    window.glChain.load(true);
    if (location.hash) { const h = document.querySelector(location.hash); if (h) h.scrollIntoView(); }
  }

  /* ---------- swap: any token in the wallet into SOL ---------- */
  const Swap = (() => {
    const BASE = [
      { mint:"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", symbol:"USDC", decimals:6, ui:0, raw:"0", usd:0, icon:"https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png" },
      { mint:"Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", symbol:"USDT", decimals:6, ui:0, raw:"0", usd:0, icon:"https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg" }
    ];
    let tokens = BASE, tk = BASE[0], order = null, tm = 0, seq = 0, busy = false, refresh = 0;
    const dot = '<svg viewBox="0 0 12 12"><path d="M2 4l4 4 4-4"/></svg>';
    const icon = t => t.icon ? `<img src="${esc(t.icon)}" alt="" onerror="this.src='assets/sub/token-silver.webp'" />` : `<img src="assets/sub/token-silver.webp" alt="" />`;
    const trim = (v, d) => { const s = v.toFixed(d); return s.includes(".") ? s.replace(/\.?0+$/, "") : s; };
    /* the typed decimal to raw units, without going through a float */
    const toRaw = (txt, dec) => {
      const m = /^(\d*)(?:\.(\d*))?$/.exec(txt.trim()); if (!m || !(m[1] || m[2])) return 0n;
      return BigInt((m[1] || "0") + (m[2] || "").slice(0, dec).padEnd(dec, "0"));
    };
    const html = () => `<div class="sw">
      <div class="sw-box"><span class="sw-lab">You pay</span>
        <div class="sw-row"><input class="sw-amt" id="swAmt" inputmode="decimal" placeholder="0" aria-label="Amount to swap" autocomplete="off" /><button type="button" class="sw-tk" id="swTk" aria-haspopup="listbox"></button></div>
        <div class="sw-meta"><span id="swHave"></span><button type="button" class="sw-max" id="swMax">Max</button></div>
        <div class="sw-m" id="swMenu" role="listbox" hidden></div></div>
      <img class="sw-mid" src="assets/sub/a-swap.webp" alt="" />
      <div class="sw-box"><span class="sw-lab">You get</span>
        <div class="sw-row"><span class="sw-amt" id="swOut">0</span><button type="button" class="sw-tk" disabled><img src="assets/sub/a-sol.webp" alt="" />SOL</button></div>
        <div class="sw-meta"><span id="swOutUsd"></span></div></div>
      <div class="sw-info" id="swInfo" hidden></div>
      <button type="button" class="nv-go" id="swGo" disabled>Enter an amount</button>
      <p class="sw-note" id="swNote" role="status"></p>
      <p class="sw-fine"><img src="assets/chains/jup.png" alt="" />Routed by Jupiter. You approve every swap in your wallet.</p></div>`;
    const paintTk = () => {
      if (!$("swTk")) return;
      $("swTk").innerHTML = `${icon(tk)}${esc(tk.symbol)}${dot}`;
      $("swHave").textContent = `You have ${trim(tk.ui, 4)} ${tk.symbol}`;
    };
    const set = (label, on) => { const b = $("swGo"); if (b){ b.textContent = label; b.disabled = !on; } };
    const note = (msg, bad) => { const n = $("swNote"); if (n){ n.innerHTML = msg; n.classList.toggle("bad", !!bad); } };
    const clearOut = () => { order = null; if ($("swOut")){ $("swOut").textContent = "0"; $("swOutUsd").textContent = ""; $("swInfo").hidden = true; } };
    const REASON = { 1:"Not enough for this swap.", 2:"Not enough SOL to pay the network fee." };

    async function quote(raw){
      const u = `${JUP}order?inputMint=${tk.mint}&outputMint=${SOL}&amount=${raw}&taker=${window.glWallet.addr}`;
      const r = await fetch(u); const o = await r.json();
      if (!r.ok || o.error) throw new Error(o.error || "quote");
      return o;
    }
    async function update(keep){
      clearTimeout(refresh);
      const mySeq = ++seq, raw = toRaw($("swAmt").value, tk.decimals);
      if (keep !== true) note("");
      if (raw <= 0n){ clearOut(); return set("Enter an amount", false); }
      if (raw > BigInt(tk.raw)){ clearOut(); return set(`Not enough ${tk.symbol}`, false); }
      set("Getting price", false);
      try {
        const o = await quote(raw); if (mySeq !== seq) return;
        order = o;
        const out = Number(o.outAmount) / 1e9, min = Number(o.otherAmountThreshold) / 1e9;
        $("swOut").textContent = trim(out, 5);
        $("swOutUsd").textContent = o.outUsdValue ? fmtUsd(o.outUsdValue) : "";
        const info = $("swInfo"); info.hidden = false;
        info.innerHTML = `<p><span>Rate</span><em>1 SOL = ${trim(Number(raw) / 10 ** tk.decimals / out, 2)} ${esc(tk.symbol)}</em></p>
          ${min && min < out ? `<p><span>Minimum you get</span><em>${trim(min, 5)} SOL</em></p>` : ""}
          <p><span>Price impact</span><em>${Math.abs(+o.priceImpact || 0).toFixed(2)}%</em></p>`;
        if (!o.transaction){ set("Swap to SOL", false); note(REASON[o.errorCode] || esc(o.errorMessage || "This swap isn't available right now."), true); return; }
        set("Swap to SOL", true);
        refresh = setTimeout(update, 20000);   // a price is only good for a few seconds on chain
      } catch (e){ if (mySeq !== seq) return; clearOut(); set("Swap to SOL", false); note("No price right now. Try again in a moment.", true); }
    }
    async function go(){
      if (busy || !order) return;
      busy = true; seq++; clearTimeout(refresh);
      const addr = window.glWallet.addr, raw = toRaw($("swAmt").value, tk.decimals);
      try {
        set("Open your wallet", false); note("");
        const p = await window.glWallet.signer();
        const o = await quote(raw);   // a fresh order: the one on screen may have expired
        if (!o.transaction) throw new Error("no tx");
        if (o.inputMint !== tk.mint || o.outputMint !== SOL || o.taker !== addr || o.inAmount !== raw.toString()) throw new Error("mismatch");
        const signedTransaction = await p.signTx(o.transaction, addr);
        set("Landing your swap", false);
        const r = await fetch(`${JUP}execute`, { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify({ signedTransaction, requestId:o.requestId }) });
        const x = await r.json();
        if (x.status !== "Success") throw new Error("failed");
        $("swAmt").value = ""; clearOut(); set("Enter an amount", false);
        note(`Done. <a href="https://solscan.io/tx/${encodeURIComponent(x.signature)}" target="_blank" rel="noopener">View on Solscan</a>`);
        window.glChain.load(true);
      } catch (e){
        const m = String(e && e.message || "");
        set("Swap to SOL", false);
        note(m === "reconnect" ? "Reconnect your wallet, then swap." : /reject|cancel|denied|closed/i.test(m) ? "Swap cancelled." : "The swap didn't go through. Nothing left your wallet unless your wallet shows it.", !/cancel|reject|denied|closed/i.test(m));
        update(true);
      } finally { busy = false; }
    }
    root.addEventListener("input", e => { if (e.target.id !== "swAmt") return; clearTimeout(tm); tm = setTimeout(update, 380); });
    root.addEventListener("click", e => {
      const menu = $("swMenu"); if (!menu) return;
      if (e.target.closest("#swTk")){ menu.hidden = !menu.hidden; return; }
      const b = e.target.closest("[data-mint]");
      if (b){ tk = tokens.find(t => t.mint === b.dataset.mint) || tk; menu.hidden = true; paintTk(); update(); return; }
      if (!menu.hidden && !e.target.closest("#swMenu")) menu.hidden = true;
      if (e.target.id === "swMax"){ $("swAmt").value = (BigInt(tk.raw) === 0n) ? "" : (tk.raw.padStart(tk.decimals + 1, "0").replace(new RegExp(`(\\d{${tk.decimals}})$`), ".$1").replace(/\.0*$|(\.\d*?)0+$/, "$1")); update(); }
      if (e.target.id === "swGo") go();
    });
    return { html,
      reset(){ tk = tokens[0]; order = null; paintTk(); },
      chain(c){
        const have = c.tokens.filter(t => !BASE.some(b => b.mint === t.mint));
        tokens = [...BASE.map(b => c.tokens.find(t => t.mint === b.mint) ? { ...b, ...c.tokens.find(t => t.mint === b.mint), icon:b.icon } : b), ...have].sort((a, b) => b.usd - a.usd);
        tk = tokens.find(t => t.mint === tk.mint) || tokens[0];
        const m = $("swMenu"); if (m) m.innerHTML = tokens.map(t => `<button type="button" role="option" data-mint="${esc(t.mint)}">${icon(t)}${esc(t.symbol)}<em>${trim(t.ui, 4)}</em></button>`).join("");
        paintTk();
      } };
  })();

  /* ---------- delivery details: the street search fills in the rest ---------- */
  const Ship = (() => {
    let state = null, tm = 0, seq = 0, hits = [], pick = -1, saved = null;
    const F = [["name","Full name","s6","name"],["phone","Phone","s6","tel"],["street","Street","s4","off"],["number","No.","s2","off"],["extra","Apartment, floor","s6","address-line2"],["city","City","s3 m3","address-level2"],["region","County or state","s3 m3","address-level1"],["postcode","Postal code","s3 m3","postal-code"],["country","Country","s3 m3","country-name"]];
    const form = () => `<form class="dl" id="dlForm" novalidate>${F.map(([k, l, c, ac]) => `<label class="dl-f ${c}" data-f="${k}"><span>${l}</span><input name="${k}" autocomplete="${ac}" ${k === "street" ? `placeholder="Start typing your street" role="combobox" aria-expanded="false" aria-autocomplete="list"` : ""} ${k === "phone" ? `inputmode="tel" placeholder="+40 700 000 000"` : ""} />${k === "street" ? `<ul class="dl-l" id="dlList" role="listbox" hidden></ul>` : ""}</label>`).join("")}<input type="hidden" name="cc" /><div class="dl-acts"><button type="submit" class="nv-go">Save details</button><p class="dl-msg" id="dlMsg" role="status"></p><button type="button" class="ac-link" id="dlDel" hidden>Remove my details</button></div></form>`;
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
        if (!mine(window.glWallet.addr) && $("dlSign")){ e.target.disabled = false; e.target.textContent = "Verify wallet"; }
      }
    });
    return {
      reset(){ state = null; saved = null; },
      async paint(addr){
        const box = $("acShip"), me = mine(addr); if (!box) return;
        if (!me){
          if (state !== "gate"){ state = "gate"; box.innerHTML = `<button type="button" class="nv-go" id="dlSign">Verify wallet</button><p class="ac-empty" style="margin-top:8px">One signature, so only you can see them.</p>`; }
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
    if (b.dataset.a === "out") window.glWallet.disconnect();
    if (b.dataset.a === "switch"){ await window.glWallet.disconnect(); openWallet(b); }
    if (b.dataset.a === "copy" || b.dataset.a === "deposit"){ const was = b.textContent; try { await navigator.clipboard.writeText(window.glWallet.addr); b.textContent = "Copied"; setTimeout(() => { b.textContent = was; }, 1400); } catch(err){} }
  });
  const show = () => {
    const a = window.glWallet && window.glWallet.addr;
    if (!a) return gate(false);
    if (drawn !== a) draw(a); else paintMe(a);
  };
  addEventListener("gl:wallet", show);
  addEventListener("gl:auth", show);
  addEventListener("gl:chain", paintChain);
  /* the admin room sizes itself */
  addEventListener("message", e => { if (e.origin === location.origin && e.data && e.data.glAdminHeight){ const f = document.getElementById("adminFrame"); if (f) f.style.height = e.data.glAdminHeight + "px"; } });
  let legacy = false; try { legacy = localStorage.getItem("gl_wallet") === "1"; } catch(e){}
  if (legacy && !(window.glWallet && window.glWallet.addr)){ gate(true); setTimeout(() => { if (!window.glWallet.addr) gate(false); }, 7000); } else show();
  fetch("assets/drops.json?m=" + Math.floor(Date.now()/6e4)).then(r => r.json()).then(f => { drops = f.drops || []; paintDrops(); }).catch(() => {});
})();
