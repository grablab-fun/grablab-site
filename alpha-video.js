/* ============ transparent hero claw on Safari / iOS ============
   Safari can't play VP9-alpha WebM, so it fell back to the MP4 with its dark box (the "bars" on iPhone).
   There we load a stacked MP4 instead (colour on top, alpha mask below) and recombine it in WebGL.
   The <video> keeps playing hidden, so app.js play / hold / drop logic is untouched. Force with ?stacked=1. */
(function(){
  const v = document.getElementById("clawVideo");
  if (!v) return;
  const ua = navigator.userAgent;
  const webkit = /iP(hone|ad|od)/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ||
                 (/Safari\//.test(ua) && !/Chrome|Chromium|CriOS|FxiOS|Android|Edg/.test(ua));
  if (!webkit && !/[?&]stacked=1/.test(location.search)) return;

  const cv = document.createElement("canvas");
  const gl = cv.getContext("webgl", { alpha:true, premultipliedAlpha:true, antialias:false });
  if (!gl) return;

  cv.className = "alpha-cv";
  cv.setAttribute("aria-hidden", "true");
  if (v.poster) cv.style.backgroundImage = `url("${v.poster}")`;
  v.parentNode.insertBefore(cv, v.nextSibling);
  v.querySelectorAll("source").forEach(s => s.remove());
  v.src = "assets/claw-grab-stacked.mp4?v=1";
  v.classList.add("alpha-src");
  v.load();

  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER,
    "attribute vec2 p;varying vec2 uv;void main(){uv=vec2((p.x+1.)*.5,(1.-p.y)*.5);gl_Position=vec4(p,0.,1.);}"));
  gl.attachShader(pr, sh(gl.FRAGMENT_SHADER,
    "precision mediump float;uniform sampler2D t;varying vec2 uv;void main(){" +
    "vec3 c=texture2D(t,vec2(uv.x,min(uv.y*.5,.498))).rgb;" +
    "float a=clamp((texture2D(t,vec2(uv.x,max(.5+uv.y*.5,.502))).r-.03)/.94,0.,1.);" +
    "gl_FragColor=vec4(c*a,a);}"));
  gl.linkProgram(pr); gl.useProgram(pr);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, "p");
  gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.clearColor(0, 0, 0, 0);

  function size(){
    const r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1);
    const w = Math.max(1, Math.round(r.width * d)), h = Math.max(1, Math.round(r.height * d));
    if (cv.width !== w || cv.height !== h){ cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); draw(); }
  }
  let shown = false;
  function draw(){
    if (v.readyState < 2) return;
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, v);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (!shown){ shown = true; cv.style.backgroundImage = "none"; }
  }
  /* draw every decoded frame; rAF fallback for older Safari */
  if ("requestVideoFrameCallback" in v){
    const tick = () => { draw(); v.requestVideoFrameCallback(tick); };
    v.requestVideoFrameCallback(tick);
  } else {
    const loop = () => { if (!v.paused) draw(); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
  v.addEventListener("seeked", draw);
  v.addEventListener("loadeddata", () => { size(); draw(); });
  addEventListener("resize", size);
  size();
})();
