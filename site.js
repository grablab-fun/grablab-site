/* ============================================================
   GRABLAB : shared site engine (loaded on every page)
   - i18n (EN / 中文 / Español) with a language switcher
   - shared islands nav + footer + wallet modal, injected
   - glassmorphic page transitions
   - scroll-reveal
   - wallet connect (SAFE: read-only, no approvals)  + eligibility
   ============================================================ */

/* ---------------- i18n ---------------- */
const I18N = {
  en: {
    _name:"English", _flag:"EN",
    "nav.home":"Home", "nav.inside":"INSIDE", "nav.fair":"Provably fair", "nav.anatomy":"Anatomy", "nav.rent":"Rent", "nav.participate":"Participate",
    "cta.connect":"CONNECT WALLET",
    "foot.tagline":"The first claw machine that can't cheat you, and every capsule is a coin.",
    "foot.explore":"Explore", "foot.projects":"Projects", "foot.connect":"Connect",
    "foot.inside":"Inside the machine", "foot.fair":"Provably fair", "foot.rent":"Rent the claw",
    "foot.participate":"Participate", "foot.formats":"Formats", "foot.book":"Book a launch night",
    "wallet.title":"Connect a wallet", "wallet.side":"Connect a wallet to check eligibility and grab live.",
    "wallet.secured":"Secured by Privy", "wallet.new":"New to wallets?", "wallet.get":"Get Phantom ↗",
  },
  zh: {
    _name:"中文", _flag:"中文",
    "nav.home":"首页", "nav.inside":"机器内部", "nav.fair":"公平可证", "nav.anatomy":"机器解剖", "nav.rent":"租用", "nav.participate":"参与",
    "cta.connect":"连接钱包",
    "foot.tagline":"第一台无法作弊的抓娃娃机，每一个胶囊都是一枚代币。",
    "foot.explore":"探索", "foot.projects":"项目方", "foot.connect":"联系",
    "foot.inside":"机器内部", "foot.fair":"公平可证", "foot.rent":"租用机器",
    "foot.participate":"参与", "foot.formats":"玩法", "foot.book":"预订发射之夜",
    "wallet.title":"连接钱包", "wallet.side":"连接钱包以查看资格并实时抓取。只读，我们从不请求授权。",
    "wallet.secured":"由 Privy 保护", "wallet.new":"还没有钱包？", "wallet.get":"获取 Phantom ↗",
  },
  es: {
    _name:"Español", _flag:"ES",
    "nav.home":"Inicio", "nav.inside":"POR DENTRO", "nav.fair":"Juego justo", "nav.anatomy":"Anatomía", "nav.rent":"Alquilar", "nav.participate":"Participar",
    "cta.connect":"CONECTAR WALLET",
    "foot.tagline":"La primera máquina de garra que no puede hacer trampa, y cada cápsula es una moneda.",
    "foot.explore":"Explorar", "foot.projects":"Proyectos", "foot.connect":"Conectar",
    "foot.inside":"Por dentro", "foot.fair":"Juego justo", "foot.rent":"Alquila la garra",
    "foot.participate":"Participar", "foot.formats":"Formatos", "foot.book":"Reserva una noche de lanzamiento",
    "wallet.title":"Conecta una wallet", "wallet.side":"Conecta una wallet para ver tu elegibilidad y jugar en vivo.<br>Solo lectura, nunca pedimos aprobaciones.",
    "wallet.secured":"Protegido por Privy", "wallet.new":"¿Nuevo en wallets?", "wallet.get":"Descarga Phantom ↗",
  },
};
const LANGS = ["en","zh","es"];
let LANG = "en"; /* English only (language switcher removed) */
try { localStorage.removeItem("gc_lang"); } catch(e){}

function t(key){ return (I18N[LANG] && I18N[LANG][key]) || I18N.en[key] || key; }
function applyI18n(root=document){
  root.querySelectorAll("[data-i18n]").forEach(el=>{
    const k = el.getAttribute("data-i18n"); const v = t(k);
    if (v){ if (v.includes("<br>")) el.innerHTML = v; else el.textContent = v; }
  });
  document.documentElement.lang = LANG;
}
function setLang(l){
  LANG = l; try { localStorage.setItem("gc_lang", l); } catch(e){}
  applyI18n();
  const cur = document.querySelector("#langCur"); if (cur) cur.textContent = I18N[l]._flag;
  document.querySelectorAll(".lang-menu button").forEach(b=>b.classList.toggle("on", b.dataset.l===l));
}

/* ---------------- shared markup ---------------- */
const PAGE = document.body.dataset.page || "home";
const PFX = ""; // all pages sit in the same folder

function navHTML(){
  const link = (href,key,id)=>`<a href="${href}" class="${id===PAGE?"active":""}${id==="home"?" nav-home":""}" data-i18n="${key}">${t(key)}</a>`;
  return `
  <div class="islands">
    <div class="brand-isl">
      <a class="brand" href="index.html">
        <img class="brand-mark" src="assets/brand/mark-chrome-256.png?v=20261014g" alt="" />
        <span class="brand-name">GRABLAB</span>
      </a>
    </div>
    <nav class="isl nav-links">
      ${link("index.html","nav.home","home")}
      ${link("provably-fair.html","nav.fair","fair")}
      ${link("anatomy.html","nav.anatomy","anatomy")}
      ${link("rent.html","nav.rent","rent")}
      ${link("participate.html","nav.participate","participate")}
    </nav>
    <div class="nav-right">
      <span class="flipwrap"><button class="cta btn-flip" id="connectBtn"><span class="f" data-i18n="cta.connect">${t("cta.connect")}</span><span class="k" aria-hidden="true"><img src="assets/wallets/phantom.png" alt="" /><img src="assets/wallets/solflare.png" alt="" /><img src="assets/wallets/backpack.png" alt="" /><img src="assets/wallets/metamask.png" alt="" /><img src="assets/wallets/okx.png" alt="" /></span></button></span>
      <button class="burger" id="burger" type="button" aria-label="Open menu" aria-expanded="false"><span class="bt"><span>Menu</span><span>Close</span></span><svg class="bi" viewBox="0 0 16 16" aria-hidden="true"><path d="M7.33 16V0h1.34v16z"/><path d="M16 8.67H0V7.33h16z"/></svg></button>
    </div>
  </div>
  <div class="mmenu" id="mmenu" hidden>
    <div class="mm-overlay"></div>
    <div class="mm-panel">
      <i class="mm-layer"></i><i class="mm-layer"></i><i class="mm-layer"></i>
      <nav class="mm-links">
        <div class="mm-li">${link("index.html","nav.home","home")}</div>
        <div class="mm-li">${link("provably-fair.html","nav.fair","fair")}</div>
        <div class="mm-li">${link("anatomy.html","nav.anatomy","anatomy")}</div>
        <div class="mm-li">${link("rent.html","nav.rent","rent")}</div>
        <div class="mm-li">${link("participate.html","nav.participate","participate")}</div>
      </nav>
      <button class="mm-cta" id="connectBtnM" data-i18n="cta.connect">${t("cta.connect")}</button>
    </div>
  </div>`;
}

function footHTML(){
  return `
  <div class="footer-bg" aria-hidden="true"></div>
  <div class="foot-grid">
    <div class="foot-brand">
      <a class="brand" href="index.html"><img class="brand-mark" src="assets/brand/mark-chrome-256.png?v=20261013b" alt="" /><span class="brand-name">GRABLAB</span></a>
      <p data-i18n="foot.tagline">${t("foot.tagline")}</p>
      <a class="foot-tg" href="https://t.me/grablabfun" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.9 4.3 18.6 20c-.2 1.1-.9 1.4-1.8.9l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.2-8.3c.4-.4-.1-.6-.6-.2L6 13.6l-4.9-1.5c-1.1-.3-1.1-1.1.2-1.6L20.5 3c.9-.3 1.7.2 1.4 1.3Z"/></svg>Join the Telegram</a>
    </div>
    <div class="foot-col">
      <h5 data-i18n="foot.explore">${t("foot.explore")}</h5>
      <a href="index.html#inside" data-i18n="foot.inside">${t("foot.inside")}</a>
      <a href="provably-fair.html" data-i18n="foot.fair">${t("foot.fair")}</a>
      <a href="rent.html#formats" data-i18n="foot.formats">${t("foot.formats")}</a>
    </div>
    <div class="foot-col">
      <h5 data-i18n="foot.projects">${t("foot.projects")}</h5>
      <a href="rent.html" data-i18n="foot.rent">${t("foot.rent")}</a>
      <a href="participate.html" data-i18n="foot.participate">${t("foot.participate")}</a>
      <a href="mailto:contact@grablab.fun" data-i18n="foot.book">${t("foot.book")}</a>
    </div>
    <div class="foot-col">
      <h5 data-i18n="foot.connect">${t("foot.connect")}</h5>
      <a href="https://x.com/grablabfun" target="_blank" rel="noopener">X / Twitter</a>
      <a href="https://t.me/grablabfun" target="_blank" rel="noopener">Telegram</a>
      <a href="https://machine.fun" target="_blank" rel="noopener">machine.fun</a>
      <a href="https://peaq.xyz" target="_blank" rel="noopener">peaq</a>
      <a href="mailto:contact@grablab.fun">contact@grablab.fun</a>
    </div>
  </div>
  <div class="foot-bottom">
    <span>© 2026 Grablab. Not financial advice.</span>
    <span class="foot-legal"><a href="terms.html">Terms</a><a href="privacy.html">Privacy</a><a href="cookies.html">Cookies</a><button type="button" data-consent-open>Cookie settings</button></span>
  </div>`;
}

function walletHTML(){
  return `
  <div class="wallet-sheet" role="dialog" aria-modal="true" aria-label="Connect a wallet">
    <div class="wallet-side">
      <div class="wallet-logo"><img src="assets/brand/mark-chrome-256.png?v=20261013b" alt="" /><b>Grablab</b></div>
      <p data-i18n="wallet.side">${t("wallet.side")}</p>
      <a class="wallet-secured" href="https://privy.io" target="_blank" rel="noopener"><img src="assets/brand/partners/privy-protected.svg" alt="Protected by Privy" /></a>
    </div>
    <div class="wallet-main">
      <div class="wallet-head">
        <h4 data-i18n="wallet.title">${t("wallet.title")}</h4>
        <button class="wallet-close" id="walletClose" aria-label="Close">×</button>
      </div>
      <div class="wallet-list" id="walletList"></div>
    </div>`;
}

function bookingHTML(){
  return `
  <div class="booking-sheet" role="dialog" aria-modal="true" aria-label="Book a launch night">
    <button class="booking-close" id="bookingClose" aria-label="Close">×</button>
    <div class="booking-head">
      <div class="booking-logo"><img src="assets/brand/mark-chrome-256.png?v=20261013b" alt="" /><b>Book a launch night</b></div>
      <p>One machine, one project per night.<br>Tell us about your drop, we read every inquiry.</p>
    </div>
    <form class="booking-form" id="bookingForm" novalidate>
      <div class="bk-grid">
        <label class="bk-field"><span>Project / token</span><input name="project" required placeholder="e.g. Grablab" autocomplete="off" spellcheck="false" /></label>
        <label class="bk-field"><span>Your name or handle</span><input name="name" required placeholder="@you" autocomplete="off" spellcheck="false" /></label>
        <label class="bk-field bk-span"><span>Email or Telegram</span><input name="contact" required placeholder="you@email.com or @telegram" autocomplete="off" spellcheck="false" /></label>
      </div>
      <div class="bk-choice">
        <span class="bk-lbl">Format</span>
        <div class="bk-chips" data-field="format">
          <button type="button" class="bk-chip on" data-val="Airdrop claw"><b>Airdrop claw</b><small>holders play free</small></button>
          <button type="button" class="bk-chip" data-val="Paid play"><b>Paid play</b><small>pay per grab</small></button>
          <button type="button" class="bk-chip" data-val="Mixed"><b>Mixed</b><small>both</small></button>
          <button type="button" class="bk-chip" data-val="Mint night"><b>Mint night</b><small>grab to mint</small></button>
        </div>
      </div>
      <div class="bk-choice">
        <span class="bk-lbl">When</span>
        <div class="bk-chips bk-chips-s" data-field="when">
          <button type="button" class="bk-chip on" data-val="This week"><b>This week</b></button>
          <button type="button" class="bk-chip" data-val="This month"><b>This month</b></button>
          <button type="button" class="bk-chip" data-val="Flexible"><b>Flexible</b></button>
        </div>
      </div>
      <label class="bk-field"><span>What are you dropping?</span><textarea name="details" rows="3" placeholder="Token, NFTs, allocations.&#10;Pool size, chain, anything we should know."></textarea></label>
      <button type="submit" class="btn btn-primary big bk-submit">Send inquiry</button>
    </form>
    <div class="booking-done" id="bookingDone" hidden>
      <div class="bk-check"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></div>
      <h4>Inquiry ready.</h4>
      <p>Your email app just opened with everything filled in. Hit send and we reply fast.</p>
      <button class="btn btn-ghost" id="bookingDoneClose">Close</button>
    </div>
  </div>`;
}

/* ---------------- inject layout ---------------- */
(function layout(){
  const header = document.getElementById("site-header");
  if (header){ header.className = "nav"; header.id = "top"; header.innerHTML = navHTML(); }
  const footer = document.getElementById("site-footer");
  if (footer){ footer.className = "footer"; footer.innerHTML = footHTML(); }
  // wallet modal
  const ov = document.createElement("div");
  ov.className = "wallet-overlay"; ov.id = "walletOverlay"; ov.hidden = true;
  ov.innerHTML = walletHTML();
  document.body.appendChild(ov);
  // booking modal (Book a launch night)
  const bov = document.createElement("div");
  bov.className = "booking-overlay"; bov.id = "bookingOverlay"; bov.hidden = true;
  bov.innerHTML = bookingHTML();
  document.body.appendChild(bov);
  // shared atmosphere behind everything
  if (!document.querySelector(".page-atmosphere")){
    const atmo = document.createElement("div");
    atmo.className = "page-atmosphere"; atmo.setAttribute("aria-hidden","true");
    document.body.appendChild(atmo);
  }
  // page-transition wipe
  const wipe = document.createElement("div");
  wipe.className = "page-wipe"; wipe.id = "pageWipe"; wipe.setAttribute("aria-hidden","true");
  document.body.appendChild(wipe);
})();


/* ---------------- preloader : colorizing machine + roaming counter, opens like a double door ---------------- */
(function preloader(){
  const el = document.getElementById("loader"); if (!el) return;
  document.body.classList.add("is-loading");
  const V = "?v=2";
  const scene = `
    <div class="ld-glow"></div>
    <div class="ld-machine"><img class="bw" src="assets/claw-grab-poster-alpha.webp${V}" alt=""><img class="col" src="assets/claw-grab-poster-alpha.webp${V}" alt=""><span class="scan"></span></div>
    <div class="ld-load">LOADING<i class="dots">...</i></div>
    <div class="ld-pct"><span class="n">00</span><small>%</small></div>
    <div class="ld-brand"><img src="assets/brand/mark-chrome-256.png${V}" alt="">GRABLAB</div>`;
  el.innerHTML = `<div class="leaf l"><div class="inner">${scene}</div><img class="ld-hand" src="assets/glove-l.webp${V}" alt=""></div><div class="leaf r"><div class="inner">${scene}</div><img class="ld-hand" src="assets/glove-r.webp${V}" alt=""></div><span class="seam"></span>`;
  const q = s => [...el.querySelectorAll(s)];
  /* the counter roams round all four corners, a quarter each (top right, bottom right, bottom left, top left under LOADING), then lands in the middle */
  const E = "clamp(24px,4vw,72px)", TOP = "clamp(70px,12vh,120px)", BOT = "calc(100vh - clamp(30px,6vh,60px))";
  const SPOTS = [
    { left:`calc(100vw - ${E})`, top:TOP, t:"translateX(-100%)" },
    { left:`calc(100vw - ${E})`, top:BOT, t:"translate(-100%,-100%)" },
    { left:E, top:BOT, t:"translateY(-100%)" },
    { left:E, top:TOP, t:"none" },
    { left:"50%", top:"50%", t:"translate(-50%,-50%)" },
  ];
  let spot = -1;
  function place(i){ if (i === spot) return; spot = i; const s = SPOTS[i]; q(".ld-pct").forEach(p => { p.style.left = s.left; p.style.top = s.top; p.style.transform = s.t; }); }
  place(0);
  let d = 0; const dots = setInterval(() => { d = (d+1)%4; q(".dots").forEach(x => x.textContent = ".".repeat(d)); }, 260);
  const t0 = performance.now(), MIN = 3200, MAX = 6000;
  const tasks = [];
  if (document.fonts && document.fonts.ready) tasks.push(document.fonts.ready);
  tasks.push(new Promise(r => document.readyState === "complete" ? r() : addEventListener("load", r, { once:true })));
  const v = document.getElementById("clawVideo");
  if (v) tasks.push(new Promise(r => { if (v.readyState >= 3) return r(); v.addEventListener("canplaythrough", r, { once:true }); v.addEventListener("error", r, { once:true }); }));
  let done = 0, shown = 0, finished = false; tasks.forEach(t => t.then(() => done++));
  function paint(n){
    q(".n").forEach(x => x.textContent = String(n).padStart(2, "0"));
    q(".ld-machine").forEach(m => m.style.setProperty("--p", n + "%"));
    place(n >= 100 ? 4 : Math.min(3, Math.floor(n / 25)));
  }
  function open(){
    clearInterval(dots);
    /* crack glows -> two white gloves reach through and grab the edges -> strain -> pull the screen apart onto the sky */
    el.classList.add("split");
    setTimeout(() => el.classList.add("grab"), 380);
    setTimeout(() => el.classList.add("strain"), 1050);
    setTimeout(() => { el.classList.add("open"); document.body.classList.remove("is-loading"); window.dispatchEvent(new Event("gl:open")); try{ sessionStorage.setItem("gl_loaded","1"); }catch(e){} }, 1550);
    setTimeout(() => el.remove(), 3300);
  }
  function tick(){
    const time = Math.min(1, (performance.now() - t0) / MIN), real = done / tasks.length;
    const target = finished ? 100 : Math.min(99, Math.round(100 * Math.min(real * .8 + time * .2, time)));
    shown += Math.max(0, (target - shown) * .14);
    const n = Math.min(100, Math.round(shown)); paint(n);
    if (finished && n >= 100){ setTimeout(open, 420); return; }
    setTimeout(tick, 16);
  }
  Promise.race([Promise.all(tasks), new Promise(r => setTimeout(r, MAX))]).then(() => { setTimeout(() => { finished = true; }, Math.max(0, MIN - (performance.now() - t0))); });
  tick();
})();

/* ---------------- nav behavior ---------------- */
const nav = document.getElementById("top");
if (nav){
  /* scroll-linked morph: target follows the first 260px of scroll, the drawn value eases toward it every frame (smooth, never a jump) */
  const isl = nav.querySelector(".islands"), RANGE = 260;
  let target = 0, shown = -1, raf = 0;
  /* the pill width: measured in the condensed state itself, whatever the scroll position, so the button never spills out */
  function measure(){
    const np = nav.style.getPropertyValue("--np"), sc = nav.classList.contains("scrolled");
    nav.classList.add("measuring", "scrolled"); nav.style.setProperty("--np", "1");
    const prevW = isl.style.width; isl.style.width = "max-content";
    const w = isl.getBoundingClientRect().width;
    isl.style.width = prevW; nav.style.setProperty("--np", np || "0"); nav.classList.toggle("scrolled", sc); nav.classList.remove("measuring");
    isl.style.setProperty("--pillw", Math.min(Math.ceil(w) + 4, innerWidth - 24) + "px");
  }
  function frame(){
    shown = shown < 0 ? target : shown + (target - shown) * 0.12;
    if (Math.abs(target - shown) < 0.002) shown = target;
    nav.style.setProperty("--np", shown.toFixed(4));
    nav.classList.toggle("scrolled", shown > 0.5);
    raf = shown === target ? 0 : requestAnimationFrame(frame);
  }
  const onScroll = () => { const r = Math.min(1, Math.max(0, scrollY / RANGE)); target = r * r * (3 - 2 * r); if (!raf) raf = requestAnimationFrame(frame); };
  measure(); addEventListener("resize", () => { measure(); onScroll(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  onScroll(); addEventListener("scroll", onScroll, { passive:true });
}
/* language switcher */
(function langUI(){
  const btn = document.getElementById("langBtn"), menu = document.getElementById("langMenu"), wrap = document.getElementById("lang");
  if (!btn) return;
  btn.addEventListener("click", e=>{ e.stopPropagation(); wrap.classList.toggle("open"); btn.setAttribute("aria-expanded", wrap.classList.contains("open")); });
  menu.querySelectorAll("button").forEach(b=> b.addEventListener("click", ()=>{ setLang(b.dataset.l); wrap.classList.remove("open"); }));
  document.addEventListener("click", ()=> wrap.classList.remove("open"));
})();
applyI18n();

/* ---------------- Back closes overlays instead of leaving the site ----------------
   Opening an overlay (menu, wallet, booking, simulator) adds one history entry; the browser / phone Back
   gesture then closes it (or steps back inside it). Closing it with its own button removes that entry. */
window.glBack = (function(){
  const stack = []; let skip = 0, held = [];
  addEventListener("popstate", () => {
    if (skip){ skip--; if (!skip){ held.forEach(id => history.pushState({ glo:id }, "")); held = []; } return; }
    const top = stack.pop(); if (top) top.fn();
  });
  return {
    /* a back() from drop() is async: pushing before it lands lets it eat the new entry, so hold the push until it does */
    push(id, fn){ stack.push({ id, fn }); if (skip) held.push(id); else history.pushState({ glo:id }, ""); },
    drop(id){ const i = stack.map(x => x.id).lastIndexOf(id); if (i < 0) return; stack.splice(i, 1);
      const h = held.lastIndexOf(id); if (h >= 0){ held.splice(h, 1); return; }   /* its entry was never pushed */
      skip++; history.back(); },
    has(id){ return stack.some(x => x.id === id); }
  };
})();

/* ---------------- glass page transitions ---------------- */
(function transitions(){
  const wipe = document.getElementById("pageWipe");
  // entrance: clear the wipe after load
  requestAnimationFrame(()=> document.body.classList.add("page-in"));
  // Back/Forward (incl. restoring from the bfcache): always clear the wipe-out so the page we return to shows correctly
  window.addEventListener("pageshow", ()=>{ document.body.classList.remove("page-out"); document.body.classList.add("page-in"); });
  // intercept internal links
  document.addEventListener("click", e=>{
    const a = e.target.closest("a");
    if (!a) return;
    const href = a.getAttribute("href") || "";
    if (a.target === "_blank" || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("#")) return;
    if (!/\.html(\#.*)?$/.test(href) && href !== "index.html") return;
    // same-page hash handled natively; only wipe on real page change
    const samePage = href.split("#")[0] === (location.pathname.split("/").pop() || "index.html");
    if (samePage) return;
    e.preventDefault();
    document.body.classList.add("page-out");
    setTimeout(()=> { location.href = href; }, 140);
  });
  /* the next page is fetched as soon as the pointer or a finger reaches its link, so the click opens it instantly */
  const warmed = new Set();
  const warm = a => { const href = a && a.getAttribute("href"); if (!href || warmed.has(href) || a.target === "_blank" || /^(https?:|mailto:|#)/.test(href)) return;
    warmed.add(href); const l = document.createElement("link"); l.rel = "prefetch"; l.href = href; document.head.appendChild(l); };
  ["pointerover", "touchstart", "focusin"].forEach(ev => document.addEventListener(ev, e => warm(e.target.closest && e.target.closest("a")), { passive:true }));
  /* Chrome: prerender the page you hover, so it is already rendered on click */
  if (HTMLScriptElement.supports && HTMLScriptElement.supports("speculationrules")){
    const sr = document.createElement("script"); sr.type = "speculationrules";
    sr.textContent = JSON.stringify({ prerender:[{ where:{ and:[{ href_matches:"/*" }, { not:{ selector_matches:"[target=_blank]" } }] }, eagerness:"moderate" }] });
    document.head.appendChild(sr);
  }
})();

/* ---------------- lite mode: if the first second of frames is slow, drop the expensive glass and glows ---------------- */
(function lite(){
  const root = document.documentElement;
  try { if (localStorage.getItem("gl_lite") === "1" || /[?&]lite=1/.test(location.search)){ root.classList.add("lite"); return; } } catch (e){}
  if (/[?&]lite=0/.test(location.search)) return;
  if ((navigator.deviceMemory && navigator.deviceMemory <= 2) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2)){ root.classList.add("lite"); return; }
  const ts = []; let l = 0, n = 0;
  const f = t => { if (l) ts.push(t - l); l = t; if (++n < 70) requestAnimationFrame(f); else { ts.sort((a, b) => a - b); const med = ts[ts.length >> 1];
    if (med > 24 && !document.hidden){ root.classList.add("lite"); try { localStorage.setItem("gl_lite", "1"); } catch (e){} } } };
  setTimeout(() => requestAnimationFrame(f), 1800);   /* after the loader and the first paint */
})();

/* ---------------- atmosphere parallax (gives depth on scroll) ---------------- */
(function parallax(){
  const atmo = document.querySelector(".page-atmosphere"); if (!atmo) return;
  let ticking = false;
  /* gentle parallax: the layer is 130vh tall and travels at most 10vh over the whole page, so it stays close to the hero sky at the handoff and never leaves the screen */
  function update(){ const max = Math.max(1, document.documentElement.scrollHeight - innerHeight); const p = Math.min(1, scrollY / max); atmo.style.transform = `translate3d(0, ${-p * 10}vh, 0)`; ticking = false; }
  window.addEventListener("scroll", () => { if (document.documentElement.classList.contains("lite")) return; if (!ticking){ ticking = true; requestAnimationFrame(update); } }, { passive:true });
  update();
})();

/* ---------------- scroll reveal ---------------- */
(function reveal(){
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;
  if (!("IntersectionObserver" in window)){ els.forEach(e=>e.classList.add("in")); return; }
  const io = new IntersectionObserver((es)=> es.forEach(en=>{ if (en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); } }), { rootMargin:"0px 0px -4% 0px" });
  els.forEach(e=>io.observe(e));
})();

/* ============================================================
   WALLET (SAFE : read-only, no approve/permit, nothing sent out)
   Our modal picks the wallet; Privy (EVM + Solana, built from wallet-src/ into assets/privy/) does the
   connection. It is loaded only when the modal is used, or on load when this browser connected before.
   ============================================================ */
let privy = null, privyAddr = null;
function loadPrivy(){
  if (!privy) privy = import("./assets/privy/wallet.js").then(() => {
    window.GLPrivy.onChange(a => { privyAddr = a; try { a ? localStorage.setItem("gl_wallet", "1") : localStorage.removeItem("gl_wallet"); } catch (e) {} onConnected(a); });
    return window.GLPrivy;
  }).catch(() => { privy = null; return null; });
  return privy;
}
try { if (localStorage.getItem("gl_wallet")) (window.requestIdleCallback || setTimeout)(loadPrivy); } catch (e) {}
/* speed: fetch the Privy bundle in the background once the page is idle (download only, nothing runs),
   then start it for real as soon as the pointer or focus heads for a Connect button */
addEventListener("load", () => setTimeout(() => (window.requestIdleCallback || setTimeout)(() => {
  if (privy || document.querySelector('link[href$="privy/wallet.js"]')) return;
  if (document.documentElement.classList.contains("lite")) return;
  const l = document.createElement("link"); l.rel = "prefetch"; l.as = "script"; l.href = "assets/privy/wallet.js"; document.head.appendChild(l);   /* download only; it is compiled when a Connect button is reached */
}), 2500));
["pointerover", "focusin", "touchstart"].forEach(ev => document.addEventListener(ev, e => {
  if (!privy && e.target.closest && e.target.closest("#connectBtn, #connectBtn2, #connectBtnM")) loadPrivy();
}, { passive:true }));
const WALLETS = [
  { id:"phantom",  name:"Phantom",  icon:"assets/wallets/phantom.png",  chain:"solana", detect:()=>window.solana?.isPhantom },
  { id:"solflare", name:"Solflare", icon:"assets/wallets/solflare.png", chain:"solana", detect:()=>window.solflare?.isSolflare || window.solflare },
  { id:"backpack", name:"Backpack", icon:"assets/wallets/backpack.png", chain:"solana", detect:()=>window.backpack?.isBackpack },
  /* multi-chain wallets, connected on their Solana account only */
  { id:"metamask", name:"MetaMask", icon:"assets/wallets/metamask.png", chain:"solana", detect:()=>window.ethereum?.isMetaMask },
  { id:"coinbase", name:"Coinbase Wallet", icon:"assets/wallets/coinbase.svg", chain:"solana", detect:()=>window.coinbaseSolana || window.ethereum?.isCoinbaseWallet },
  { id:"okx", name:"OKX Wallet", icon:"assets/wallets/okx.png", chain:"solana", detect:()=>window.okxwallet?.solana || window.okxwallet },
  { id:"trust", name:"Trust Wallet", icon:"assets/wallets/trust.png", chain:"solana", detect:()=>window.trustwallet?.solana || window.trustWallet || window.ethereum?.isTrust },
  { id:"walletconnect", name:"WalletConnect", icon:"assets/wallets/walletconnect.png", chain:"multi", detect:()=>false },
];
const installUrls = { phantom:"https://phantom.com", solflare:"https://solflare.com", backpack:"https://backpack.app", metamask:"https://metamask.io", coinbase:"https://www.coinbase.com/wallet", okx:"https://www.okx.com/web3", trust:"https://trustwallet.com", walletconnect:"https://walletconnect.network" };
const overlay = document.getElementById("walletOverlay");
const walletList = document.getElementById("walletList");
function buildWalletList(){
  if (!walletList) return; walletList.innerHTML = "";
  if (privyAddr){
    const out = document.createElement("button");
    out.className = "wallet-item wallet-out";
    out.innerHTML = `<span class="wi-ic wi-dot"></span><span class="wi-name">${shorten(privyAddr)}</span><span class="wi-meta">Disconnect</span>`;
    out.addEventListener("click", async () => { const p = await loadPrivy(); if (p) p.logout(); closeWallet(); });
    walletList.appendChild(out);
  }
  WALLETS.forEach(w=>{
    const detected = (()=>{ try { return !!w.detect(); } catch(e){ return false; } })();
    const btn = document.createElement("button");
    btn.className = "wallet-item";
    btn.innerHTML = `<span class="wi-ic"><img src="${w.icon}" alt="" /></span><span class="wi-name">${w.name}</span><span class="wi-meta ${detected?"detected":""}">${detected?"Detected":w.id==="walletconnect"?"Scan QR":"Install ↗"}</span>`;
    btn.addEventListener("click", ()=> chooseWallet(w, detected));
    walletList.appendChild(btn);
  });
  /* email sign in, set apart from the wallets: Privy sends a code and makes a wallet for you */
  const or = document.createElement("div"); or.className = "wallet-or"; or.innerHTML = "<span>or sign in with email</span>";
  const mail = document.createElement("form");
  mail.className = "wallet-mail"; mail.noValidate = true;
  mail.innerHTML = `<span class="wm-ic"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7l8 6 8-6"/></svg></span><input type="email" name="email" placeholder="your@email.com" autocomplete="email" aria-label="Email" /><button type="submit" aria-label="Continue with email">Continue<svg viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6"/></svg></button>`;
  mail.addEventListener("submit", async e => {
    e.preventDefault();
    const v = mail.email.value.trim();
    if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){ mail.classList.add("bad"); mail.email.focus(); return; }
    mail.classList.remove("bad");
    const p = await loadPrivy(); if (!p) return; closeWallet(); p.email(v);
  });
  const hint = document.createElement("p"); hint.className = "wallet-mail-k"; hint.innerHTML = "No wallet yet? We create one for you, on Solana.";
  walletList.append(or, mail, hint);
}
/* open: the backdrop grows as a circle out of the clicked button, the window morphs out of the button,
   then the wallet rows flip in one by one; close plays it backwards */
function openWallet(src){
  loadPrivy(); if (!overlay) return;
  buildWalletList();
  const r = src && src.getBoundingClientRect ? src.getBoundingClientRect() : null;
  const cx = r ? r.left + r.width / 2 : innerWidth / 2, cy = r ? r.top + r.height / 2 : innerHeight / 2;
  overlay.style.setProperty("--ox", cx + "px"); overlay.style.setProperty("--oy", cy + "px");
  clearTimeout(overlay._t); overlay.classList.remove("in"); overlay.hidden = false;
  document.documentElement.classList.add("wl-open");
  const sheet = overlay.querySelector(".wallet-sheet");
  if (sheet){
    sheet.style.transform = "none"; const to = sheet.getBoundingClientRect(); sheet.style.transform = "";
    sheet.style.setProperty("--from", r && r.width
      ? `translate(${cx - (to.left + to.width / 2)}px,${cy - (to.top + to.height / 2)}px) scale(${Math.max(.12, r.width / to.width)})`
      : "scale(.2)");
    sheet.getBoundingClientRect();
  }
  requestAnimationFrame(() => overlay.classList.add("in"));
  if (!glBack.has("wallet")) glBack.push("wallet", () => closeWallet(true));
}
function closeWallet(fromBack){
  if (overlay && !overlay.hidden){
    overlay.classList.remove("in"); clearTimeout(overlay._t);
    document.documentElement.classList.remove("wl-open");
    overlay._t = setTimeout(() => { if (!overlay.classList.contains("in")) overlay.hidden = true; }, 560);
  }
  if (!fromBack) glBack.drop("wallet");
}
async function chooseWallet(w, detected){
  const p = await loadPrivy();
  if (p){ closeWallet(); p.connect(w.id); return; }   /* Privy handles extension, mobile deep link and QR */
  if (!detected){ window.open(installUrls[w.id] || "https://phantom.com", "_blank", "noopener"); return; }
  let addr = null;
  try {
    if (w.chain === "solana"){ const prov = w.id==="solflare"?window.solflare:w.id==="backpack"?window.backpack:window.solana; const r = await prov.connect(); addr = (r?.publicKey||prov.publicKey)?.toString(); }
  } catch(e){ return; }
  if (!addr) return; closeWallet(); onConnected(addr);
}
function shorten(a){ return a && a.length>12 ? a.slice(0,6)+"…"+a.slice(-4) : a; }
function onConnected(addr){
  document.querySelectorAll("#connectBtn, #connectBtn2").forEach(b=> (b.querySelector(".f") || b).textContent = addr ? shorten(addr) : t("cta.connect"));
  if (!addr) return;
  const input = document.getElementById("addrInput"); if (input){ input.value = addr; renderResult(addr); document.getElementById("check")?.scrollIntoView({behavior:"smooth",block:"center"}); }
}
document.addEventListener("click", e=>{
  const cb = e.target.closest("#connectBtn, #connectBtn2, #connectBtnM");
  if (cb){ closeMenu(); openWallet(cb); }
  if (e.target.id === "walletClose") closeWallet();
  if (e.target.id === "walletOverlay") closeWallet();
});
document.addEventListener("keydown", e=>{ if (e.key==="Escape") closeWallet(); });

/* ---------------- booking modal (Book a launch night) : inquiry form, opens an email, no backend ---------------- */
(function booking(){
  const ov = document.getElementById("bookingOverlay"); if (!ov) return;
  const form = ov.querySelector("#bookingForm"), done = ov.querySelector("#bookingDone");
  function open(){ if (form){ form.hidden = false; } if (done){ done.hidden = true; } ov.hidden = false; document.documentElement.classList.add("wl-open"); if (!glBack.has("book")) glBack.push("book", () => close(true)); }
  function close(fromBack){ ov.hidden = true; document.documentElement.classList.remove("wl-open"); if (!fromBack) glBack.drop("book"); }
  window.__openBooking = open;
  ov.addEventListener("click", e=>{
    if (e.target === ov || e.target.closest("#bookingClose") || e.target.closest("#bookingDoneClose")){ close(); return; }
    const chip = e.target.closest(".bk-chip");
    if (chip){ chip.parentElement.querySelectorAll(".bk-chip").forEach(c=>c.classList.remove("on")); chip.classList.add("on"); }
  });
  if (form) form.addEventListener("submit", e=>{
    e.preventDefault();
    let ok = true;
    form.querySelectorAll("[required]").forEach(f=>{ const bad = !f.value.trim(); f.closest(".bk-field")?.classList.toggle("invalid", bad); if (bad) ok = false; });
    if (!ok){ form.querySelector(".invalid input")?.focus(); return; }
    const g = n => (form.querySelector(`[name="${n}"]`)?.value || "").trim();
    const chosen = f => ov.querySelector(`.bk-chips[data-field="${f}"] .bk-chip.on`)?.dataset.val || "";
    const subject = `Launch night inquiry: ${g("project") || "new project"}`;
    const body = [
      `Project / token: ${g("project")}`,
      `Name / handle: ${g("name")}`,
      `Contact: ${g("contact")}`,
      `Format: ${chosen("format")}`,
      `When: ${chosen("when")}`,
      ``,
      `What they are dropping:`,
      g("details") || "(not specified)",
      ``,
      `Sent from grablab.fun`
    ].join("\n");
    window.location.href = `mailto:contact@grablab.fun?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if (form) form.hidden = true; if (done) done.hidden = false;
  });
  /* any "Book a launch night" / "Be the first project" CTA opens the form instead of a raw mailto */
  document.addEventListener("click", e=>{
    const a = e.target.closest('a[href^="mailto:contact@grablab.fun"]');
    if (a && (a.classList.contains("btn") || a.dataset.i18n === "foot.book")){ e.preventDefault(); open(); }
  });
  document.addEventListener("keydown", e=>{ if (e.key === "Escape") close(); });
})();

/* ---------------- eligibility (local, read-only) ---------------- */
function demoTierFor(addr){
  let h=0; for (let i=0;i<addr.length;i++) h=(h*31+addr.charCodeAt(i))>>>0; const r=h%100;
  if (r<8) return {tier:"Diamond", note:"5 free plays in the airdrop claw"};
  if (r<28) return {tier:"Gold", note:"3 free plays in the airdrop claw"};
  if (r<60) return {tier:"Iron", note:"1 free play in the airdrop claw"};
  return null;
}
function renderResult(addr){
  const box = document.getElementById("checkResult"); if (!box) return;
  const e = demoTierFor(addr); box.hidden = false;
  if (e){ box.className="check-result ok"; box.innerHTML = `<span class="tier">Eligible: ${e.tier}</span><div><code>${shorten(addr)}</code> gets <b>${e.note}</b>.<br>Grab your capsule live on launch night.</div>`; }
  else { box.className="check-result no"; box.innerHTML = `<span class="tier">Not on the snapshot yet</span><div><code>${shorten(addr)}</code> isn't on the list for this draw.<br>Be early for the next launch.</div>`; }
}
document.addEventListener("click", e=>{
  if (e.target.id === "checkBtn"){
    const v = (document.getElementById("addrInput")?.value||"").trim(); const box = document.getElementById("checkResult");
    if (v.length<8){ if (box){ box.hidden=false; box.className="check-result no"; box.innerHTML=`<span class="tier">Invalid address</span><div>Paste a valid Solana address.</div>`; } return; }
    renderResult(v);
  }
});
document.addEventListener("keydown", e=>{ if (e.key==="Enter" && e.target.id==="addrInput") document.getElementById("checkBtn")?.click(); });

/* ---------------- mobile menu : burger opens a full-screen sheet ---------------- */
function closeMenu(fromBack){ const m = document.getElementById("mmenu"), b = document.getElementById("burger"); if (!m) return; if (!fromBack) glBack.drop("menu"); document.body.classList.remove("menu-open"); if (b) b.setAttribute("aria-expanded","false"); setTimeout(() => { if (!document.body.classList.contains("menu-open")) m.hidden = true; }, 760); }
document.addEventListener("click", e => {
  if (e.target.closest("#burger")){
    const m = document.getElementById("mmenu"), b = document.getElementById("burger");
    if (document.body.classList.contains("menu-open")) return closeMenu();
    m.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add("menu-open"))); b.setAttribute("aria-expanded","true");
    if (!glBack.has("menu")) glBack.push("menu", () => closeMenu(true));
  } else if (e.target.closest(".mm-links a") || e.target.closest(".mm-overlay")) closeMenu();
});
document.addEventListener("keydown", e => { if (e.key === "Escape") closeMenu(); });

/* ---------------- display headings: a full stop sits right against letters whose foot is narrow (P, T, Y, V, W, F) ---------------- */
(function(){
  const PULL = { P:-.11, T:-.12, Y:-.1, V:-.09, W:-.05, F:-.1 };
  function kern(root=document){
    root.querySelectorAll("h1,h2,h3,.chrome,.hl").forEach(h => {
      if (!/Anton/i.test(getComputedStyle(h).fontFamily)) return;
      const up = getComputedStyle(h).textTransform === "uppercase", walk = document.createTreeWalker(h, NodeFilter.SHOW_TEXT), nodes = [];
      while (walk.nextNode()) nodes.push(walk.currentNode);
      nodes.forEach((n, i) => {
        if (n.parentNode.classList && n.parentNode.classList.contains("kp")) return;
        const s = n.nodeValue; let prev = i ? nodes[i-1].nodeValue.slice(-1) : "";
        if (!/\./.test(s)) return;
        const frag = document.createDocumentFragment(); let buf = "";
        for (const ch of s){
          const L = up ? prev.toUpperCase() : prev;
          if (ch === "." && PULL[L] !== undefined){ if (buf) frag.append(buf); buf = ""; const k = document.createElement("span"); k.className = "kp"; k.style.marginLeft = PULL[L] + "em"; k.textContent = "."; frag.append(k); }
          else buf += ch;
          prev = ch;
        }
        if (buf) frag.append(buf);
        n.replaceWith(frag);
      });
    });
  }
  window.glKern = kern;
  kern(); addEventListener("load", () => kern());
})();

/* ---------------- live cards and the CTA band (Oct 31): a light follows the pointer, the card tilts toward it ---------------- */
(function(){
  const SEL = ".card,.prize,.pq,.uc,.case,.callout";
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches, still = matchMedia("(prefers-reduced-motion:reduce)").matches;
  document.addEventListener("pointermove", e => {
    const el = e.target.closest && e.target.closest(SEL); if (!el || !fine) return;
    const r = el.getBoundingClientRect(), x = (e.clientX - r.left)/r.width, y = (e.clientY - r.top)/r.height;
    el.style.setProperty("--mx", (x*100).toFixed(1) + "%"); el.style.setProperty("--my", (y*100).toFixed(1) + "%");
    if (!still && !el.classList.contains("callout")){ el.style.setProperty("--ry", ((x - .5)*6).toFixed(2) + "deg"); el.style.setProperty("--rx", ((.5 - y)*5).toFixed(2) + "deg"); }
    el.classList.add("live");
  }, { passive:true });
  document.addEventListener("pointerout", e => { const el = e.target.closest && e.target.closest(SEL); if (el && !el.contains(e.relatedTarget)){ el.classList.remove("live"); el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); } }, { passive:true });
  /* stagger the idle float per card and the quest rows per row; cards built later (the simulator) get it through the observer below */
  function prime(root=document){
    root.querySelectorAll(SEL).forEach((el, i) => { if (!el.style.getPropertyValue("--i")) el.style.setProperty("--i", i % 6); });
    root.querySelectorAll(".pq-l li").forEach((li, j) => li.style.setProperty("--j", j % 8));
  }
  prime();
  if ("IntersectionObserver" in window){
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); } }), { threshold:.2 });
    const watch = root => root.querySelectorAll(".pq,.uc").forEach(el => io.observe(el));
    watch(document);
    new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1){ prime(n); watch(n); if (n.matches && n.matches(".pq,.uc")) io.observe(n); } }))).observe(document.body, { childList:true, subtree:true });
  } else document.querySelectorAll(".pq,.uc").forEach(el => el.classList.add("in"));
  /* quest progress: once something is done the bar stops scanning */
  document.addEventListener("click", e => { const pq = e.target.closest && e.target.closest(".pq"); if (pq && e.target.closest(".qc-cta")) pq.classList.add("started"); });
  /* upcoming clocks: a tile flips when its digit changes */
  new MutationObserver(ms => ms.forEach(m => { const b = m.target.nodeType === 3 ? m.target.parentElement : m.target; if (b && b.matches && b.matches(".uc-tiles b")){ b.classList.remove("flip"); void b.offsetWidth; b.classList.add("flip"); } })).observe(document.body, { characterData:true, subtree:true, childList:true });

  /* the CTA band: the last two words of the headline go blue chrome, the claw hangs in on the right */
  document.querySelectorAll(".callout").forEach(c => {
    const h = c.querySelector("h2"); if (!h || c.querySelector(".co-claw")) return;
    const last = [...h.childNodes].reverse().find(n => n.nodeType === 3 && n.nodeValue.trim());
    if (last){ const m = last.nodeValue.match(/^(.*?)(\S+\s+\S+\.?)\s*$/); if (m){ const sp = document.createElement("span"); sp.className = "hl"; sp.textContent = m[2]; last.nodeValue = m[1]; last.after(sp); } }
    const body = document.createElement("div"); body.className = "co-body"; while (c.firstChild) body.appendChild(c.firstChild); c.appendChild(body);
    const art = document.createElement("div"); art.className = "co-art"; art.innerHTML = '<i class="co-line"></i><img class="co-claw" src="assets/icons/claw.png" alt="" /><i class="co-glow"></i>'; c.appendChild(art);
    const k = document.createElement("span"); k.className = "co-k"; k.textContent = c.dataset.k || "Next"; body.prepend(k);
    const a = c.querySelector("a.btn"); if (a && !a.querySelector("svg")) a.insertAdjacentHTML("beforeend", '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4.5L12 8l-3.5 3.5"/></svg>');
    if (window.glKern) glKern(c);
  });
})();
