/* ============ PHYSICS LAB : load SimArena with our claw scene, on demand ============
   SimArena fetches the scene by URL (?scene=), so it must be a public https URL with CORS (vercel.json).
   On localhost that fetch can't reach this machine, so we say so instead of showing a broken lab.
   SimArena is a third-party embed that may store data in the browser: it loads only with "Embedded content" consent. */
(function(){
  const EDITOR = "https://app.simarena.ai/editor";
  const frame = document.getElementById("labFrame"), note = document.getElementById("labNote"), open = document.getElementById("labOpen");
  const play = frame && frame.querySelector(".lab-cta b");
  const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || location.protocol === "file:";
  const sceneUrl = new URL("lab/grablab-claw-revb.scene.json?v=16", location.href).href;   /* bump on every scene change: SimArena fetches it and browsers cache /lab/ for 5 min */
  const labUrl = EDITOR + "?scene=" + encodeURIComponent(sceneUrl);
  const NOTE = note ? note.textContent : "";
  if (open) open.href = local ? EDITOR : labUrl;
  const allowed = () => !window.GLConsent || GLConsent.allowed("embeds");
  let asked = false;
  /* phones and tablets: the SimArena editor is laid out for a desktop, so it runs at desktop size, scaled down to fit;
     its Controls sliders work with a finger, the arrow keys need a keyboard */
  const touch = matchMedia("(pointer:coarse)").matches || innerWidth < 900;
  if (touch && frame){
    document.documentElement.classList.add("lab-touch");
    note.textContent = "Runs at desktop size, scaled to your screen. Use the Controls sliders.";
    const links = document.querySelector(".lab-links");
    if (links){ const send = document.createElement("a"); send.href = "#"; send.textContent = "Send to my desktop"; links.appendChild(send);
      send.addEventListener("click", async ev => { ev.preventDefault(); const url = location.origin + "/lab";
        try { if (navigator.share){ await navigator.share({ title:"Grablab physics lab", url }); return; } await navigator.clipboard.writeText(url); send.textContent = "Link copied"; } catch (e) { send.textContent = url; } }); }
  }

  function mount(){
    if (frame.classList.contains("on")) return;
    const f = document.createElement("iframe");
    f.src = labUrl; f.title = "Grablab claw in SimArena"; f.allow = "fullscreen; clipboard-write"; f.loading = "eager";
    /* SimArena takes a while to start its physics engine: say so, and offer the direct link if it takes too long */
    let ld = frame.querySelector(".lab-loading");
    if (!ld){ ld = document.createElement("div"); ld.className = "lab-loading"; ld.innerHTML = '<b>Loading the lab</b><i></i><small>Starting the physics engine, about 9 MB. This takes 10 to 30 seconds.</small>'; frame.appendChild(ld); }
    frame.classList.add("loading");
    const done = () => setTimeout(() => frame.classList.remove("loading"), 6000);
    f.addEventListener("load", done, { once:true });
    setTimeout(() => { if (frame.classList.contains("loading")) ld.querySelector("small").innerHTML = 'Still loading. <a href="' + labUrl + '" target="_blank" rel="noopener" style="color:#fff;border-bottom:1px solid rgba(180,186,255,.5)">Open it in a new tab</a>'; }, 30000);
    frame.appendChild(f); frame.classList.add("on");
    if (touch){ const fit = () => { const w = frame.clientWidth, VW = 960, VH = 1240, k = w/VW; f.style.width = VW + "px"; f.style.height = VH + "px"; f.style.transform = `scale(${k})`; f.style.transformOrigin = "0 0"; frame.style.height = Math.round(VH*k) + "px"; };
      fit(); addEventListener("resize", fit); }
  }
  function load(e){
    if (e) e.preventDefault();
    frame.scrollIntoView({ behavior: "smooth", block: "center" });
    if (local){ note.textContent = "The lab loads from the live site. Locally, open SimArena and load the scene files."; return; }
    if (allowed()) return mount();
    if (asked){ GLConsent.set({ embeds:true }); if (allowed()) mount(); return; }   /* second click on the same button = consent given here */
    asked = true;
    if (play) play.textContent = "Allow & load";
    note.innerHTML = 'The lab runs on SimArena (app.simarena.ai), which may store data in your browser. Click again to allow embedded content. <a href="cookies.html" style="color:#f3f4fb;border-bottom:1px solid rgba(180,186,255,.4)">Cookie policy</a>';
  }
  document.querySelectorAll("[data-lab-load]").forEach(b => b.addEventListener("click", load));
  document.addEventListener("gl:consent", e => {
    if (e.detail && e.detail.embeds){ if (asked) mount(); }
    else if (frame.classList.contains("on")){ frame.querySelector("iframe")?.remove(); frame.classList.remove("on"); asked = false; if (play) play.textContent = "Load the lab"; note.textContent = NOTE; }
  });
})();
