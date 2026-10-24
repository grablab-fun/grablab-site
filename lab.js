/* ============ PHYSICS LAB : load SimArena with our claw scene, on demand ============
   SimArena fetches the scene by URL (?scene=), so it must be a public https URL with CORS (vercel.json).
   On localhost that fetch can't reach this machine, so we say so instead of showing a broken lab.
   SimArena is a third-party embed that may store data in the browser: it loads only with "Embedded content" consent. */
(function(){
  const EDITOR = "https://app.simarena.ai/editor";
  const frame = document.getElementById("labFrame"), note = document.getElementById("labNote"), open = document.getElementById("labOpen");
  const play = frame && frame.querySelector(".lab-cta b");
  const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || location.protocol === "file:";
  const sceneUrl = new URL("lab/grablab-claw-revb.scene.json?v=15", location.href).href;   /* bump on every scene change: SimArena fetches it and browsers cache /lab/ for 5 min */
  const labUrl = EDITOR + "?scene=" + encodeURIComponent(sceneUrl);
  const NOTE = note ? note.textContent : "";
  if (open) open.href = local ? EDITOR : labUrl;
  const allowed = () => !window.GLConsent || GLConsent.allowed("embeds");
  let asked = false;

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
  document.querySelectorAll("[data-lab-load]").forEach(b => b.addEventListener("click", load));
  document.addEventListener("gl:consent", e => {
    if (e.detail && e.detail.embeds){ if (asked) mount(); }
    else if (frame.classList.contains("on")){ frame.querySelector("iframe")?.remove(); frame.classList.remove("on"); asked = false; if (play) play.textContent = "Load the lab"; note.textContent = NOTE; }
  });
})();
