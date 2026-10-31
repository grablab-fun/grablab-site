/* Never miss a drop: one card on every page. It adapts to the device.
   Any element with data-notify opens it; data-notify="launch" preselects a category. */
(function(){
  const API = "https://grablab-bot.grablab.workers.dev";
  const KEY = "BCHp775DXgwdChbbR9fCMnkTu26leCJ63t7tpfNBBB_wmCFzc8vv-ppl4rvS4CKsD71Lk6X7jjJFWBAerOVOC-c";
  const STORE = "gl_notify", TG = "https://t.me/Grablab_news_bot?start=all";
  const CATS = [["launch","Launches","10 minutes before every drop"],["quest","Quests","When new plays can be earned"],["news","News","The big stuff, once a week at most"]];
  const load = () => { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch(e){ return {}; } };
  const save = o => { try { localStorage.setItem(STORE, JSON.stringify(o)); } catch(e){} };
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  const canPush = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  const needsHome = ios && !standalone;
  let installEvt = null, el = null, picked = null, busy = false, err = "";

  if ("serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
  addEventListener("beforeinstallprompt", e => { e.preventDefault(); installEvt = e; if (el) paint(); });
  addEventListener("appinstalled", () => { installEvt = null; if (el) paint(); });

  const b64 = s => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length/4)*4, "=")), c => c.charCodeAt(0));
  const post = (path, body) => fetch(API + path, { method:"POST", headers:{ "content-type":"application/json" }, body:JSON.stringify(body) }).then(r => r.json());
  const isOn = () => !!load().on;
  const switches = cats => CATS.map(([k, n, d]) => `<label class="nv-sw"><input type="checkbox" data-c="${k}" ${cats.includes(k) ? "checked" : ""}/><i></i><span><b>${n}</b><small>${d}</small></span></label>`).join("");
  const tgRow = `<a class="nv-tg" href="${TG}" target="_blank" rel="noopener"><img src="assets/sub/n-plane.webp" alt="" /><span><b>Prefer Telegram?</b><small>Same pings from our bot, on any device</small></span></a>`;
  const installRow = () => installEvt ? `<button type="button" class="nv-install" data-act="install"><img src="assets/sub/n-app.webp" alt="" /><span><b>Add Grablab to this device</b><small>Opens like an app, one click from your ${innerWidth < 900 ? "home screen" : "desktop"}</small></span></button>` : "";

  function body(){
    if (needsHome) return `<ol class="nv-steps"><li><span>Tap <b>Share</b> in the browser bar</span></li><li><span>Choose <b>Add to Home Screen</b></span></li><li><span>Open <b>Grablab</b> from your Home Screen and tap the bell</span></li></ol><p class="nv-note">Apple only allows notifications from apps on the Home Screen, iOS 16.4 or newer.</p>${tgRow}`;
    if (!canPush) return `<p class="nv-note">This browser can't show notifications. Open grablab.fun in Chrome, Edge or Safari, or use Telegram.</p>${tgRow}`;
    if (Notification.permission === "denied") return `<p class="nv-note">Notifications are blocked for this site.<br />Allow them in your browser's site settings, then come back.</p><a class="nv-link" href="notify.html">How to unblock them</a>${tgRow}`;
    if (isOn()) return `<div class="nv-list">${switches(load().cats || [])}</div>${installRow()}<button type="button" class="nv-off" data-act="off">Turn off on this device</button>${tgRow}`;
    return `<div class="nv-list">${switches(picked)}</div><button type="button" class="nv-go" data-act="on" ${busy || !picked.length ? "disabled" : ""}>${busy ? "Turning on" : "Turn on notifications"}</button>${err ? `<p class="nv-err">${err}</p>` : ""}${installRow()}${tgRow}`;
  }
  function paint(){
    const on = isOn();
    el.querySelector(".nv-b").innerHTML = body();
    el.querySelector("h2").textContent = on ? "You're on the list." : "Never miss a drop.";
    el.querySelector(".nv-sub").textContent = needsHome ? "Add Grablab to your Home Screen first." : on ? "Change what pings you, anytime." : "Launches, quests and news, the moment they happen.";
    document.querySelectorAll(".nav-bell").forEach(b => b.classList.toggle("on", on));
  }
  function open(cat){
    if (!el){
      el = document.createElement("div"); el.className = "nv-wrap"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", "Notifications");
      el.innerHTML = `<div class="nv-card"><button type="button" class="nv-x" data-act="close" aria-label="Close"></button><img class="nv-ic" src="assets/sub/n-bell.webp" alt="" /><h2 class="chrome"></h2><p class="nv-sub"></p><div class="nv-b"></div></div>`;
      document.body.appendChild(el);
      el.addEventListener("click", click); el.addEventListener("change", change);
      addEventListener("keydown", e => { if (e.key === "Escape") close(); });
    }
    picked = cat ? [cat] : ["launch", "quest", "news"]; err = "";
    paint(); requestAnimationFrame(() => el.classList.add("show"));
  }
  const close = () => el && el.classList.remove("show");
  function change(e){
    const c = e.target.dataset.c; if (!c) return;
    const list = [...el.querySelectorAll("[data-c]:checked")].map(i => i.dataset.c);
    if (!isOn()){ picked = list; const g = el.querySelector(".nv-go"); if (g) g.disabled = !list.length; return; }
    if (!list.length) return off();
    save({ on:true, cats:list });
    navigator.serviceWorker.ready.then(r => r.pushManager.getSubscription()).then(s => s && post("/push/subscribe", { sub:s.toJSON(), cats:list, ua:ua }));
  }
  async function on(){
    busy = true; err = ""; paint();
    try {
      const perm = await Notification.requestPermission();   /* first await: iOS needs it inside the tap */
      if (perm === "granted"){
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription() || await reg.pushManager.subscribe({ userVisibleOnly:true, applicationServerKey:b64(KEY) });
        const r = await post("/push/subscribe", { sub:sub.toJSON(), cats:picked, ua:ua, hello:true });
        if (!r.ok) throw new Error(r.error);
        save({ on:true, cats:picked });
      }
    } catch(e){ err = "That didn't work. Try again, or use Telegram below."; }
    busy = false; paint();
  }
  async function off(){
    try { const r = await navigator.serviceWorker.ready, s = await r.pushManager.getSubscription(); if (s){ await post("/push/unsubscribe", { sub:s.toJSON() }); await s.unsubscribe(); } } catch(e){}
    save({}); picked = ["launch", "quest", "news"]; paint();
  }
  function click(e){
    if (e.target === el) return close();
    const a = e.target.closest("[data-act]")?.dataset.act; if (!a) return;
    if (a === "close") close();
    if (a === "on") on();
    if (a === "off") off();
    if (a === "install" && installEvt){ installEvt.prompt(); installEvt.userChoice.finally(() => { installEvt = null; paint(); }); }
  }
  document.addEventListener("click", e => { const t = e.target.closest("[data-notify]"); if (t){ e.preventDefault(); open(t.dataset.notify || null); } });
  window.glNotify = { open, isOn };
  const mark = () => { if (isOn()) document.querySelectorAll(".nav-bell").forEach(b => b.classList.add("on")); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mark); else mark();
})();
