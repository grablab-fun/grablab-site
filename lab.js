/* ============ PHYSICS LAB : load SimArena with our claw scene, on demand ============
   SimArena fetches the scene by URL (?scene=), so it must be a public https URL with CORS (see _headers).
   On localhost that fetch can't reach this machine, so we say so instead of showing a broken lab. */
(function(){
  const EDITOR = "https://app.simarena.ai/editor";
  const frame = document.getElementById("labFrame"), note = document.getElementById("labNote"), open = document.getElementById("labOpen");
  const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || location.protocol === "file:";
  const sceneUrl = new URL("lab/grablab-claw.scene.json", location.href).href;
  const labUrl = EDITOR + "?scene=" + encodeURIComponent(sceneUrl);
  if (open) open.href = local ? EDITOR : labUrl;

  function load(e){
    if (e) e.preventDefault();
    frame.scrollIntoView({ behavior: "smooth", block: "center" });
    if (local){
      note.textContent = "The lab loads from the live site. Locally, open SimArena and load the scene files.";
      return;
    }
    if (frame.classList.contains("on")) return;
    const f = document.createElement("iframe");
    f.src = labUrl; f.title = "Grablab claw in SimArena"; f.allow = "fullscreen; clipboard-write"; f.loading = "eager";
    frame.appendChild(f); frame.classList.add("on");
  }
  document.querySelectorAll("[data-lab-load]").forEach(b => b.addEventListener("click", load));
})();
