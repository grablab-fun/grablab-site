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
  /* phones and tablets: the SimArena editor needs a keyboard and a wide screen, so offer what works here instead */
  const touch = matchMedia("(pointer:coarse)").matches || innerWidth < 900;
  if (touch && frame){
    document.documentElement.classList.add("lab-touch");
    if (play) play.textContent = "Best on a desktop";
    note.textContent = "The lab is driven with the keyboard. On your phone, play the simulator instead.";
    const btn = frame.querySelector(".lab-play"); if (btn){ btn.removeAttribute("data-lab-load"); btn.setAttribute("aria-label", "Play the simulator"); btn.addEventListener("click", () => { location.href = "participate.html#simulate"; }); }
    const links = document.querySelector(".lab-links");
    if (links){ links.innerHTML = '<a href="participate.html#simulate">Play the simulator</a><a href="#" id="labSend">Send the lab to my desktop</a>';
      document.getElementById("labSend").addEventListener("click", async ev => { ev.preventDefault(); const url = location.origin + "/lab"; const t = ev.currentTarget;
        try { if (navigator.share){ await navigator.share({ title:"Grablab physics lab", text:"Open this on a desktop", url }); return; } await navigator.clipboard.writeText(url); t.textContent = "Link copied"; } catch (e) { t.textContent = url; } }); }
  }

  function mount(){
    if (frame.classList.contains("on")) return;
    const f = document.createElement("iframe");
    f.src = labUrl; f.title = "Grablab claw in SimArena"; f.allow = "fullscreen; clipboard-write"; f.loading = "eager";
    frame.appendChild(f); frame.classList.add("on");
  }
  function load(e){
    if (e) e.preventDefault();
    frame.scrollIntoView({ behavior: "smooth", block: "center" });
    if (local){ note.textContent = "The lab loads from the live site. Locally, open SimArena and load the scene files."; return; }
    if (allowed()) return mount();
    if (asked){ GLConsent.set({ embeds:true }); return; }   /* second click on the same button = consent given here */
    asked = true;
    if (play) play.textContent = "Allow & load";
    note.innerHTML = 'The lab runs on SimArena (app.simarena.ai), which may store data in your browser. Click again to allow embedded content. <a href="cookies.html" style="color:#f3f4fb;border-bottom:1px solid rgba(180,186,255,.4)">Cookie policy</a>';
  }
  if (!touch) document.querySelectorAll("[data-lab-load]").forEach(b => b.addEventListener("click", load));
  document.addEventListener("gl:consent", e => {
    if (e.detail && e.detail.embeds){ if (asked) mount(); }
    else if (frame.classList.contains("on")){ frame.querySelector("iframe")?.remove(); frame.classList.remove("on"); asked = false; if (play) play.textContent = "Load the lab"; note.textContent = NOTE; }
  });
})();
