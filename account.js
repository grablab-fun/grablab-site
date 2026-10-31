/* Your account: one page per wallet, built from the connected address.
   There is no player backend yet: plays and capsules show their empty state until one exists. */
(function(){
  const root = document.getElementById("account"); if (!root) return;
  const TIERS = { Iron:{ img:"tier-iron", plays:1 }, Gold:{ img:"tier-gold", plays:3 }, Diamond:{ img:"tier-diamond", plays:5 } };
  const CATS = { launch:"Launches", quest:"Quests", news:"News" };
  const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch(e){ return d; } };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));
  let drops = [];

  function gate(wait){
    root.innerHTML = `<section class="ac-gate glass"><img src="assets/sub/tier-gold.webp" alt="" /><h1 class="chrome">Your account.</h1>${wait ? `<p>Finding your wallet</p>` : `<p>Connect to see your tier, plays and capsules.</p><button type="button" class="nv-go" id="connectBtn2">Connect wallet</button>`}</section>`;
  }
  function next(){
    const on = read("gl_reminders", []), now = Date.now();
    const list = drops.map(d => ({ ...d, t:Date.parse(String(d.at).replace(" ", "T") + ":00Z") })).filter(d => d.t > now).sort((a, b) => a.t - b.t).slice(0, 3);
    if (!list.length) return `<p class="ac-empty">No drops announced yet.</p>`;
    return `<ul class="ac-drops">${list.map(d => `<li><b>${esc(d.name)}</b><span>${new Date(d.t).toLocaleString("en-GB", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit", timeZone:"UTC" })} UTC</span>${on.includes(d.id) ? `<em>Reminder on</em>` : ""}</li>`).join("")}</ul>`;
  }
  function render(addr){
    const e = demoTierFor(addr), t = e && TIERS[e.tier], n = read("gl_notify", {});
    const pings = n.on ? (n.cats || []).map(c => CATS[c]).filter(Boolean).join(", ") : "Off on this device";
    root.innerHTML = `
    <section class="ac-hero">
      <img class="ac-badge" src="assets/sub/${t ? t.img : "tier-iron"}.webp" alt="" />
      <div>
        <span class="ac-k">${t ? `${e.tier} tier` : "No tier yet"}</span>
        <h1 class="chrome">Your account.</h1>
        <div class="ac-addr"><code title="${esc(addr)}">${esc(shorten(addr))}</code><button type="button" data-a="copy">Copy</button><button type="button" data-a="out">Disconnect</button></div>
      </div>
    </section>
    <section class="ac-stats">
      <div class="glass"><b>${t ? t.plays : 0}</b><span>Free plays</span></div>
      <div class="glass"><b>0</b><span>Plays</span></div>
      <div class="glass"><b>0</b><span>Capsules</span></div>
    </section>
    <section class="ac-grid">
      <div class="glass ac-card ac-wide"><img src="assets/parts/capsule.png" alt="" /><div><h2>Your capsules</h2><p class="ac-empty">Your first grab lands here.</p><a class="nv-go" href="participate.html">Find a drop</a></div></div>
      <div class="glass ac-card"><div><h2>Next drops</h2>${next()}</div></div>
      <div class="glass ac-card"><img src="assets/sub/n-bell.webp" alt="" /><div><h2>Notifications</h2><p class="ac-empty">${esc(pings)}</p><button type="button" class="ac-link" data-notify>Manage</button></div></div>
    </section>`;
  }
  root.addEventListener("click", async e => {
    const b = e.target.closest("[data-a]"); if (!b) return;
    if (b.dataset.a === "out") window.glWallet.disconnect();
    if (b.dataset.a === "copy"){ try { await navigator.clipboard.writeText(window.glWallet.addr); b.textContent = "Copied"; setTimeout(() => { b.textContent = "Copy"; }, 1400); } catch(err){} }
  });
  const show = () => { const a = window.glWallet && window.glWallet.addr; if (a) render(a); else gate(false); };
  addEventListener("gl:wallet", show);
  let saved = false; try { saved = !!localStorage.getItem("gl_wallet"); } catch(e){}
  if (saved){ gate(true); setTimeout(() => { if (!(window.glWallet && window.glWallet.addr)) gate(false); }, 7000); } else gate(false);
  fetch("assets/drops.json?m=" + Math.floor(Date.now()/6e4)).then(r => r.json()).then(f => { drops = f.drops || []; if (window.glWallet && window.glWallet.addr) render(window.glWallet.addr); }).catch(() => {});
})();
