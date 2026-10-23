/* ============ CONSENT : cookie / storage banner + settings, self-contained (injects its own CSS) ============
   Categories: essential (always on: this choice + the once-per-session intro flag) and embeds (third-party
   embeds that may store data in the browser, today only the SimArena physics lab).
   API: GLConsent.allowed("embeds") -> bool, GLConsent.set({embeds:true}), GLConsent.open(), event "gl:consent".
   Any element with [data-consent-open] reopens the settings. Accept and Reject carry the same weight on purpose. */
(function(){
  const KEY = "gl_consent", VERSION = 1;
  const read = () => { try { const c = JSON.parse(localStorage.getItem(KEY) || "null"); return c && c.v === VERSION ? c : null; } catch(e){ return null; } };
  const write = c => { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch(e){} };
  let state = read();

  const css = `
.glc{position:fixed;z-index:9500;left:clamp(12px,2vw,24px);bottom:clamp(12px,2vw,24px);width:min(384px,calc(100vw - 24px));color:#f3f4fb;font-family:'Satoshi',system-ui,sans-serif;
  background:linear-gradient(160deg,rgba(14,22,62,.92),rgba(5,9,24,.94));border:1px solid rgba(180,186,255,.22);border-radius:18px;padding:18px 18px 13px;
  box-shadow:0 30px 80px rgba(0,0,0,.55),0 0 50px rgba(59,123,255,.14);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);
  transform:translateY(24px);opacity:0;transition:transform .45s cubic-bezier(.2,.8,.2,1),opacity .35s}
.glc.on{transform:none;opacity:1}
.glc[hidden]{display:none}
.glc-top{display:flex;align-items:center;gap:12px;margin-bottom:11px}
.glc-top img{width:32px;height:32px;flex:none;display:block}
.glc-top b{font-family:'Anton',Impact,sans-serif;font-weight:400;font-size:19px;letter-spacing:.03em;text-transform:uppercase;line-height:.95;display:block}
.glc-k{display:block;font-family:ui-monospace,Menlo,monospace;font-size:8.5px;letter-spacing:.24em;text-transform:uppercase;color:#9cc0ff;margin-bottom:4px;line-height:1}
.glc p{font-size:12px;line-height:1.6;color:#a7b0cc;margin:0 0 14px;text-wrap:pretty}
.glc p span{display:block}
.glc p a{display:inline-block;margin-top:4px;color:#f3f4fb;border-bottom:1px solid rgba(180,186,255,.4)}
.glc-row{display:flex;gap:8px}
.glc-btn{flex:1;display:flex;align-items:center;justify-content:center;height:38px;font:700 13px/1 'Satoshi',system-ui,sans-serif;padding:0 16px;border-radius:999px;border:1px solid transparent;cursor:pointer;transition:transform .15s,box-shadow .2s}
.glc-btn:active{transform:translateY(1px)}
.glc-acc{color:#071029;background:linear-gradient(176deg,#fff 0%,#d6e4ff 30%,#3b7bff 50%,#e8f0ff 62%,#1f4fd1 100%);box-shadow:0 0 22px rgba(59,123,255,.35)}
.glc-rej{color:#0a0c16;background:#f3f4fb}
.glc-links{display:flex;justify-content:center;align-items:center;gap:22px;margin-top:10px}
.glc-links a{font:500 10.5px/1 ui-monospace,Menlo,monospace;letter-spacing:.16em;text-transform:uppercase;color:#a7b0cc;padding:4px}
.glc-links a:hover{color:#f3f4fb}
.glc-more{display:block;margin:0;background:none;border:0;color:#a7b0cc;font:500 10.5px/1 ui-monospace,Menlo,monospace;letter-spacing:.16em;text-transform:uppercase;cursor:pointer;padding:4px}
.glc-more:hover{color:#f3f4fb}
.glc-cats{display:none;margin:0 0 14px;border-top:1px solid rgba(180,186,255,.14);border-bottom:1px solid rgba(180,186,255,.14)}
.glc.cfg .glc-cats{display:block}
.glc.cfg .glc-more{display:none}
.glc.cfg .glc-links{margin-top:12px}
.glc.glc-r{left:auto;right:clamp(12px,2vw,24px)}
.glc-cat{display:grid;grid-template-columns:1fr 40px;gap:4px 18px;align-items:center;padding:11px 0}
.glc-cat+.glc-cat{border-top:1px solid rgba(180,186,255,.1)}
.glc-cat b{font-size:13px;line-height:1.2}
.glc-cat small{grid-column:1;font-size:11.5px;line-height:1.45;color:#a7b0cc;text-wrap:pretty}
.glc-sw{grid-row:1/3;grid-column:2;align-self:center;position:relative;width:40px;height:22px;border-radius:999px;border:1px solid rgba(180,186,255,.3);background:rgba(5,9,24,.6);cursor:pointer;transition:background .2s}
.glc-sw::after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#a7b0cc;transition:transform .2s,background .2s}
.glc-sw[aria-checked="true"]{background:rgba(59,123,255,.35);border-color:#7db0ff}
.glc-sw[aria-checked="true"]::after{transform:translateX(18px);background:#fff}
.glc-sw[disabled]{opacity:.6;cursor:default}
.glc-save{display:none}
.glc.cfg .glc-save{display:flex}
.glc.cfg .glc-main{display:none}
.glc.cfg{padding-bottom:18px}
@media(max-width:520px){.glc{left:12px;right:12px;width:auto;bottom:12px;padding:18px}.glc-row{flex-direction:column}}`;

  /* styles go in at once: the footer "Cookie settings" row needs them even when the banner never shows */
  const style = document.createElement("style");
  style.textContent = css + `
.foot-legal{display:flex;flex-wrap:wrap;align-items:center;gap:8px 0}
.foot-legal a,.foot-legal button{-webkit-appearance:none;appearance:none;background:transparent;border:0;padding:0;margin:0;cursor:pointer;
  font:inherit;letter-spacing:inherit;text-transform:inherit;color:inherit;opacity:.85;transition:opacity .2s,color .2s}
.foot-legal a:hover,.foot-legal button:hover{opacity:1;color:#fff}
.foot-legal > *+*::before{content:"";display:inline-block;width:1px;height:10px;margin:0 14px;background:currentColor;opacity:.3;vertical-align:-1px;pointer-events:none}`;
  document.head.appendChild(style);

  function el(){
    const d = document.createElement("div");
    d.className = "glc"; d.hidden = true;
    d.setAttribute("role", "dialog"); d.setAttribute("aria-live", "polite"); d.setAttribute("aria-label", "Cookie choices");
    d.innerHTML = `
      <div class="glc-top"><img src="assets/brand/mark-chrome-256.png" alt="" /><div><span class="glc-k">Cookies</span><b>Your call.</b></div></div>
      <p><span>No ads, no trackers. We only store what the site needs.</span><span>Embeds like the physics lab load only if you allow them.</span></p>
      <div class="glc-cats">
        <div class="glc-cat"><b>Essential</b><button class="glc-sw" type="button" role="switch" aria-checked="true" disabled aria-label="Essential, always on"></button><small>Remembers this choice and that you saw the intro. Always on.</small></div>
        <div class="glc-cat"><b>Embedded content</b><button class="glc-sw" type="button" role="switch" aria-checked="false" data-cat="embeds" aria-label="Embedded content"></button><small>The physics lab runs on SimArena (app.simarena.ai), which may store data in your browser.</small></div>
      </div>
      <div class="glc-row glc-main"><button class="glc-btn glc-rej" type="button" data-act="reject">Reject</button><button class="glc-btn glc-acc" type="button" data-act="accept">Accept all</button></div>
      <div class="glc-row glc-save"><button class="glc-btn glc-rej" type="button" data-act="reject">Reject all</button><button class="glc-btn glc-acc" type="button" data-act="save">Save choices</button></div>
      <div class="glc-links"><button class="glc-more" type="button" data-act="cfg">Customize</button><a href="cookies.html">Cookie policy</a></div>`;
    document.body.appendChild(d);
    d.addEventListener("click", e => {
      const sw = e.target.closest(".glc-sw[data-cat]");
      if (sw){ sw.setAttribute("aria-checked", sw.getAttribute("aria-checked") === "true" ? "false" : "true"); return; }
      const a = e.target.closest("[data-act]"); if (!a) return;
      const act = a.dataset.act;
      if (act === "cfg"){ d.classList.add("cfg"); return; }
      if (act === "accept") decide({ embeds:true });
      if (act === "reject") decide({ embeds:false });
      if (act === "save") decide({ embeds: d.querySelector('[data-cat="embeds"]').getAttribute("aria-checked") === "true" });
    });
    return d;
  }
  let box = null;
  function show(cfg){
    if (!box) box = el();
    box.querySelector('[data-cat="embeds"]').setAttribute("aria-checked", state && state.embeds ? "true" : "false");
    box.classList.toggle("cfg", !!cfg);
    box.hidden = false; place(); requestAnimationFrame(() => requestAnimationFrame(() => box.classList.add("on")));
  }
  /* never cover the hero headline: if the bottom-left spot would overlap it, sit bottom-right instead */
  function place(){
    if (!box || box.hidden) return;
    const h = document.querySelector(".stage .copy h1"); box.classList.remove("glc-r");
    if (!h || innerWidth <= 520) return;
    const sub = document.querySelector(".stage .copy .sub"), hr = h.getBoundingClientRect(), br = box.getBoundingClientRect();
    const bottom = Math.max(hr.bottom, sub ? sub.getBoundingClientRect().bottom : 0);
    if (br.top < bottom + 10 && br.left < hr.right) box.classList.add("glc-r");
  }
  addEventListener("resize", place);
  function hide(){ if (!box) return; box.classList.remove("on"); setTimeout(() => { box.hidden = true; }, 400); }
  function decide(choice){
    state = { v:VERSION, date:new Date().toISOString(), essential:true, embeds:!!choice.embeds };
    write(state); hide();
    document.dispatchEvent(new CustomEvent("gl:consent", { detail:state }));
  }

  window.GLConsent = {
    allowed: cat => cat === "essential" || !!(state && state[cat]),
    decided: () => !!state,
    set: c => decide(Object.assign({}, state || {}, c)),
    open: () => show(true)
  };
  document.addEventListener("click", e => { if (e.target.closest("[data-consent-open]")){ e.preventDefault(); show(true); } });

  /* first visit: ask after the intro has had its moment */
  const start = () => { if (!state) setTimeout(() => show(false), document.getElementById("loader") ? 3600 : 900); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
