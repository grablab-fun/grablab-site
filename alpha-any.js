/* ============ transparent render videos anywhere (Blender scenes) ============
   Markup: <video class="av" data-webm="assets/x-alpha.webm" data-stacked="assets/x-stacked.mp4" poster="..." muted loop playsinline autoplay></video>
   Chrome / Edge / Firefox play the VP9-alpha WebM directly.
   Safari / iOS can't decode alpha WebM, so they get the stacked MP4 (colour on top, alpha below) recombined in WebGL. */
(function(){
  const ua = navigator.userAgent;
  const webkit = /iP(hone|ad|od)/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ||
                 (/Safari\//.test(ua) && !/Chrome|Chromium|CriOS|FxiOS|Android|Edg/.test(ua));
  const force = /[?&]stacked=1/.test(location.search);
  /* a video far down the page waits until it is about a screen away; the one in view starts at once */
  const near = v => { const r = v.getBoundingClientRect(); return r.bottom > -innerHeight && r.top < innerHeight*2; };
  const pending = [];
  const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting){ io.unobserve(e.target); setup(e.target); } }), { rootMargin:"100% 0px" }) : null;
  document.querySelectorAll("video.av").forEach(v => { if (!io || near(v)) setup(v); else io.observe(v); });
  function setup(v){
    if (!(webkit || force)){ v.src = v.dataset.webm; v.load(); v.play && v.play().catch(() => {}); return; }
    const cv = document.createElement("canvas");
    const gl = cv.getContext("webgl", { alpha:true, premultipliedAlpha:true, antialias:false });
    if (!gl){ v.src = v.dataset.webm; return; }
    cv.className = v.className.replace(/\bav\b/, "av-cv"); cv.setAttribute("aria-hidden", "true");
    if (v.poster) cv.style.backgroundImage = `url("${v.poster}")`;
    v.parentNode.insertBefore(cv, v.nextSibling);
    v.src = v.dataset.stacked; v.style.position = "absolute"; v.style.opacity = "0"; v.style.pointerEvents = "none"; v.load(); v.play && v.play().catch(() => {});
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, "attribute vec2 p;varying vec2 uv;void main(){uv=vec2((p.x+1.)*.5,(1.-p.y)*.5);gl_Position=vec4(p,0.,1.);}"));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, "precision mediump float;uniform sampler2D t;varying vec2 uv;void main(){" +
      "vec3 c=texture2D(t,vec2(uv.x,min(uv.y*.5,.498))).rgb;" +
      "float a=clamp((texture2D(t,vec2(uv.x,max(.5+uv.y*.5,.502))).r-.03)/.94,0.,1.);gl_FragColor=vec4(c*a,a);}"));
    gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(k => gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE));
    [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach(k => gl.texParameteri(gl.TEXTURE_2D, k, gl.LINEAR));
    gl.clearColor(0, 0, 0, 0);
    let shown = false;
    const draw = () => { if (v.readyState < 2) return; gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, v);
      gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); if (!shown){ shown = true; cv.style.backgroundImage = "none"; } };
    const size = () => { const r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1);
      const w = Math.max(1, Math.round(r.width * d)), h = Math.max(1, Math.round(r.height * d));
      if (cv.width !== w || cv.height !== h){ cv.width = w; cv.height = h; fit(); draw(); } };
    const fit = () => { const w = cv.width, h = cv.height, va = v.videoWidth && v.videoHeight ? v.videoWidth / (v.videoHeight / 2) : w / h;  // object-fit: contain
      const vw = Math.min(w, h * va), vh = vw / va; gl.viewport(Math.round((w - vw) / 2), Math.round((h - vh) / 2), Math.round(vw), Math.round(vh)); };
    if ("requestVideoFrameCallback" in v){ const tick = () => { draw(); v.requestVideoFrameCallback(tick); }; v.requestVideoFrameCallback(tick); }
    else { const loop = () => { if (!v.paused) draw(); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
    v.addEventListener("loadeddata", () => { size(); fit(); draw(); }); addEventListener("resize", size); size();
  }
})();
