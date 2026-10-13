/* ============ LEGAL PAGES : build the side index from the sections and highlight the one in view ============ */
(function(){
  const toc = document.querySelector(".lg-toc"), secs = [...document.querySelectorAll(".lg-doc section[id]")];
  if (!toc || !secs.length) return;
  toc.innerHTML = secs.map(s => { const h = s.querySelector("h2"); const n = h.querySelector("i")?.textContent || ""; const t = h.textContent.replace(n, "").trim(); return `<a href="#${s.id}"><i>${n}</i>${t}</a>`; }).join("");
  const links = [...toc.querySelectorAll("a")];
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id));
  }), { rootMargin: "-30% 0px -60% 0px" });
  secs.forEach(s => io.observe(s));
})();
