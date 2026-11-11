/* Workbench: one part of Prototype 01 at a time, built in code at real size (mm), on a dark ESD mat under a soft studio light.
   The claw is the same build the anatomy page uses (anatomy-metal.js); the Pi and the stepper are modelled here from their datasheets. */
import * as THREE from "./assets/vendor/three.module.min.js";
import { buildMachine } from "./anatomy-metal.js?v=37";
import { loadMachine } from "./machine-scene.js?v=2";

const cv = document.getElementById("bench");
const R = new THREE.WebGLRenderer({ canvas:cv, antialias:true, preserveDrawingBuffer:false });
R.setPixelRatio(Math.min(devicePixelRatio, 2));
R.outputColorSpace = THREE.SRGBColorSpace;
R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x070a18);
scene.fog = new THREE.Fog(0x070a18, 900, 2600);
const cam = new THREE.PerspectiveCamera(28, 1, 5, 4000);

/* ---------- studio: a dark room with three soft boxes, baked to an environment map ---------- */
(function studio(){
  const s = new THREE.Scene();
  s.add(new THREE.Mesh(new THREE.BoxGeometry(10, 6, 10), new THREE.MeshBasicMaterial({ color:0x262d4a, side:THREE.BackSide })));
  const panel = (w, h, col, k, x, y, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color:new THREE.Color(col).multiplyScalar(k), side:THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m); };
  panel(7, 4, 0xffffff, 4, -1, 2.9, 1.5);    // overhead soft box
  panel(4, 3, 0xffd9ae, 2.6, -4.9, 1, -1);   // warm lamp, left
  panel(4, 2.4, 0x8fb4ff, 2.4, 4.9, .8, -2);   // blue rim, right
  panel(7, 1.4, 0xffffff, 1.8, 0, .6, 4.9);     // low front strip, lifts the dark sides
  const pm = new THREE.PMREMGenerator(R);
  scene.environment = pm.fromScene(s, .035).texture; scene.environmentIntensity = 1.15;
})();

const key = new THREE.DirectionalLight(0xfff1de, 2.4);
key.position.set(-90, 210, 120); key.castShadow = true;
Object.assign(key.shadow.camera, { left:-140, right:140, top:140, bottom:-140, near:10, far:600 });
key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 6; key.shadow.bias = -.0004; key.shadow.normalBias = .4;
scene.add(key);
const rim = new THREE.DirectionalLight(0x9cc0ff, .9); rim.position.set(160, 70, -140); scene.add(rim);
scene.add(new THREE.HemisphereLight(0x8fa6ff, 0x0a0c14, .25));

/* ---------- helpers ---------- */
const canvasTex = (w, h, draw, srgb = true) => {
  const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = R.capabilities.getMaxAnisotropy(); return t;
};
const std = o => new THREE.MeshStandardMaterial(o), phys = o => new THREE.MeshPhysicalMaterial(o);
/* rounded block, w along x, h up, d along z, bottom at y=0 */
function rbox(w, h, d, r = .4, bev = .15){
  r = Math.min(r, w/2 - .01, d/2 - .01); const s = new THREE.Shape(), x = w/2, z = d/2;
  s.moveTo(-x + r, -z); s.lineTo(x - r, -z); s.quadraticCurveTo(x, -z, x, -z + r); s.lineTo(x, z - r); s.quadraticCurveTo(x, z, x - r, z);
  s.lineTo(-x + r, z); s.quadraticCurveTo(-x, z, -x, z - r); s.lineTo(-x, -z + r); s.quadraticCurveTo(-x, -z, -x + r, -z);
  const b = Math.min(bev, h/3);
  const g = new THREE.ExtrudeGeometry(s, { depth:h - 2*b, bevelEnabled:b > 0, bevelThickness:b, bevelSize:b, bevelSegments:2, curveSegments:6 });
  g.rotateX(-Math.PI/2); g.translate(0, b, 0); g.computeVertexNormals(); return g;
}
/* bounds of what is drawn: Box3.setFromObject also counts hidden meshes (the claw's line) */
const visBox = obj => { const b = new THREE.Box3(), t = new THREE.Box3(); obj.updateMatrixWorld(true); obj.traverse(o => { if (!o.isMesh) return; for (let p = o; p && p !== obj.parent; p = p.parent) if (!p.visible && p !== obj) return; if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); b.union(t.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld)); }); return b; };
const mesh = (g, m, x = 0, y = 0, z = 0, parent) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; if (parent) parent.add(o); return o; };
const label = (w, h, draw, o = {}) => std({ map:canvasTex(w, h, draw), roughness:.5, metalness:0, ...o });

/* ---------- the mat ---------- */
{
  const t = canvasTex(1024, 1024, (g, W) => {
    g.fillStyle = "#161b2c"; g.fillRect(0, 0, W, W);
    const im = g.getImageData(0, 0, W, W), d = im.data; for (let i = 0; i < d.length; i += 4){ const n = (Math.random() - .5) * 9; d[i] += n; d[i + 1] += n; d[i + 2] += n; } g.putImageData(im, 0, 0);
    for (let i = 0; i <= 20; i++){ const p = i * W/20; g.strokeStyle = i % 5 ? "rgba(140,170,255,.07)" : "rgba(140,170,255,.17)"; g.lineWidth = i % 5 ? 1 : 2; g.beginPath(); g.moveTo(p, 0); g.lineTo(p, W); g.moveTo(0, p); g.lineTo(W, p); g.stroke(); }
    g.fillStyle = "rgba(156,192,255,.28)"; g.font = "600 15px ui-monospace,monospace"; for (let i = 1; i < 4; i++) g.fillText(String(i * 50), i * W/4 + 6, 18);
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(9, 9);   // one tile = 200 mm
  const mat = mesh(new THREE.PlaneGeometry(1800, 1800), std({ map:t, roughness:.88, metalness:0 }));
  mat.rotation.x = -Math.PI/2; mat.castShadow = false; scene.add(mat);
}

/* ================================================================ Raspberry Pi 4 Model B, 85 x 56 x 1.4 mm board */
function buildPi(){
  const P = new THREE.Group(), T = 1.4, BX = 85, BZ = 56;
  const at = (g, m, bx, by, bz) => mesh(g, m, bx - BX/2, T + by, bz - BZ/2, P);   // board coordinates: x from the left edge, z from the GPIO edge
  const holes = [[3.5, 3.5], [61.5, 3.5], [3.5, 52.5], [61.5, 52.5]];
  const S = 24;   // px per mm
  const pcb = canvasTex(BX*S, BZ*S, (g, W, H) => {
    g.fillStyle = "#1c6a39"; g.fillRect(0, 0, W, H);
    /* ground pour and traces: slightly lighter copper under the mask */
    g.strokeStyle = "rgba(60,140,85,.4)"; g.lineCap = "round"; g.lineJoin = "round";
    const rnd = (a, b) => a + Math.random() * (b - a);
    for (let i = 0; i < 120; i++){
      g.lineWidth = rnd(.12, .3) * S; g.beginPath(); let x = rnd(4, 80) * S, y = rnd(4, 52) * S; g.moveTo(x, y);
      for (let k = 0; k < 4; k++){ if (Math.random() < .5) x += rnd(-14, 14) * S; else y += rnd(-10, 10) * S; x = Math.max(S, Math.min(W - S, x)); y = Math.max(S, Math.min(H - S, y)); g.lineTo(x, y); }
      g.stroke();
    }
    g.fillStyle = "rgba(10,40,22,.35)"; for (let i = 0; i < 900; i++){ g.beginPath(); g.arc(rnd(2, 83) * S, rnd(2, 54) * S, .22 * S, 0, 7); g.fill(); }   // vias
    g.fillStyle = "#d9b45a"; for (let i = 0; i < 900; i++){ g.beginPath(); g.arc(rnd(2, 83) * S, rnd(2, 54) * S, .1 * S, 0, 7); g.fill(); }
    for (const [x, y] of holes){ g.fillStyle = "#d6b25e"; g.beginPath(); g.arc(x * S, y * S, 3.1 * S, 0, 7); g.fill(); g.fillStyle = "#0a0b0d"; g.beginPath(); g.arc(x * S, y * S, 1.375 * S, 0, 7); g.fill(); }
    /* silkscreen */
    g.fillStyle = "#f2f2ea"; g.font = `700 ${2.4*S}px Satoshi, Arial, sans-serif`; g.fillText("Raspberry Pi 4 Model B", 13 * S, 41.6 * S);
    g.font = `500 ${1.5*S}px Satoshi, Arial, sans-serif`; g.fillText("© Raspberry Pi 2018", 13 * S, 44.2 * S);
    g.font = `600 ${1.1*S}px ui-monospace, monospace`; g.fillText("J8", 6 * S, 8.6 * S); g.fillText("GPIO", 52 * S, 8.6 * S); g.fillText("DISPLAY", 6.2 * S, 22 * S); g.fillText("CAMERA", 49 * S, 33 * S);
    g.fillText("POWER IN", 6.5 * S, 47.5 * S); g.fillText("HDMI0", 23.5 * S, 47.5 * S); g.fillText("HDMI1", 37 * S, 47.5 * S); g.fillText("A/V", 52.5 * S, 47.5 * S);
    g.strokeStyle = "#f2f2ea"; g.lineWidth = .12 * S; g.strokeRect(6.6 * S, 0.9 * S, 51.6 * S, 5.2 * S);
  });
  /* board with the right UVs on top: the canvas maps straight onto x, z */
  const bg = rbox(BX, T, BZ, 3, 0), pos = bg.attributes.position, uv = bg.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + BX/2)/BX, 1 - (pos.getZ(i) + BZ/2)/BZ);
  const board = mesh(bg, [phys({ map:pcb, roughness:.48, metalness:0, clearcoat:.35, clearcoatRoughness:.4 }), std({ color:0x2f5a34, roughness:.7 })]); P.add(board);

  const silver = std({ color:0xd4d7dc, roughness:.28, metalness:1 }), brushed = std({ color:0xb9bdc4, roughness:.42, metalness:1 });
  const blackPl = std({ color:0x141518, roughness:.55 }), gold = std({ color:0xe0b85e, roughness:.25, metalness:1 });
  const white = std({ color:0xeeeae0, roughness:.6 }), hole = std({ color:0x050506, roughness:.9 });

  /* GPIO: 2 x 20 header, gold pins */
  at(rbox(50.8, 2.5, 5.08, .2, .05), blackPl, 32.4, 0, 3.5);
  const pinG = new THREE.BoxGeometry(.64, 8.5, .64), pins = new THREE.InstancedMesh(pinG, gold, 44); pins.castShadow = true; let n = 0; const mx = new THREE.Matrix4();
  for (let i = 0; i < 20; i++) for (const dz of [-1.27, 1.27]) pins.setMatrixAt(n++, mx.makeTranslation(32.4 - 24.13 + i*2.54 - BX/2, T + 4.25, 3.5 + dz - BZ/2));
  /* PoE: 2 x 2 */
  at(rbox(5.08, 2.5, 5.08, .2, .05), blackPl, 66.5, 0, 6.2);
  for (const dx of [-1.27, 1.27]) for (const dz of [-1.27, 1.27]) pins.setMatrixAt(n++, mx.makeTranslation(66.5 + dx - BX/2, T + 4.25, 6.2 + dz - BZ/2));
  P.add(pins);

  /* SoC under its lid, laser marked */
  at(rbox(17, .8, 17, .3, .05), std({ color:0x1d3b25, roughness:.5 }), 29, 0, 32);
  at(rbox(15, 1.6, 15, 1, .2), [label(512, 512, (g, W) => {
    g.fillStyle = "#c9ccd2"; g.fillRect(0, 0, W, W);
    const gr = g.createLinearGradient(0, 0, W, W); gr.addColorStop(0, "rgba(255,255,255,.18)"); gr.addColorStop(1, "rgba(0,0,0,.12)"); g.fillStyle = gr; g.fillRect(0, 0, W, W);
    g.fillStyle = "rgba(60,62,70,.75)"; g.font = "700 46px Arial"; g.fillText("BROADCOM", 70, 190); g.font = "600 40px Arial"; g.fillText("BCM2711B0T", 70, 250); g.font = "500 30px ui-monospace,monospace"; g.fillText("HB2004 P21", 70, 300); g.fillText("2138", 70, 340);
  }, { roughness:.32, metalness:.9 }), brushed], 29, .8, 32);
  /* LPDDR4 */
  at(rbox(10, 1, 14.5, .2, .05), [label(256, 384, (g, W, H) => { g.fillStyle = "#15161a"; g.fillRect(0, 0, W, H); g.fillStyle = "rgba(220,220,225,.6)"; g.font = "600 30px Arial"; g.fillText("Micron", 30, 120); g.font = "500 22px ui-monospace,monospace"; g.fillText("D9WHT", 30, 170); g.fillText("8GB", 30, 205); g.beginPath(); g.arc(30, 330, 9, 0, 7); g.fill(); }, { roughness:.55 }), blackPl], 45.5, 0, 32);
  /* USB controller, Ethernet PHY, PMIC */
  for (const [x, z, s, t] of [[59, 32, 7, "VL805"], [59, 13, 6, "BCM54213"], [21, 47, 5, "MXL7704"]])
    at(rbox(s, .9, s, .15, .05), [label(256, 256, (g, W) => { g.fillStyle = "#17181c"; g.fillRect(0, 0, W, W); g.fillStyle = "rgba(220,220,225,.55)"; g.font = `600 ${t.length > 6 ? 30 : 36}px Arial`; g.fillText(t, 24, 120); g.beginPath(); g.arc(30, 200, 8, 0, 7); g.fill(); }, { roughness:.55 }), blackPl], x, 0, z);
  /* wireless module under its can */
  at(rbox(10, 1.3, 12, .3, .05), [label(256, 300, (g, W, H) => { g.fillStyle = "#cfd2d8"; g.fillRect(0, 0, W, H); g.fillStyle = "rgba(60,62,70,.7)"; g.font = "700 26px Arial"; g.fillText("Raspberry Pi", 30, 110); g.font = "500 20px Arial"; g.fillText("Wi-Fi 5 / BT 5.0", 30, 150); g.strokeStyle = "rgba(60,62,70,.6)"; g.lineWidth = 3; g.strokeRect(14, 14, W - 28, H - 28); }, { roughness:.3, metalness:.95 }), silver], 12, 0, 15);

  /* Ethernet jack, shell over the edge */
  const ej = new THREE.Group(); ej.position.set(75.5 - BX/2, T, 10.25 - BZ/2); P.add(ej);
  mesh(rbox(21, 13.5, 16, .6, .3), silver, 0, 0, 0, ej);
  mesh(new THREE.BoxGeometry(1, 9.5, 12), hole, 10.3, 1.5, 0, ej);
  mesh(new THREE.BoxGeometry(.6, 2, 2.4), std({ color:0x3dff7a, emissive:0x1fdc5c, emissiveIntensity:.8, roughness:.3 }), 10.6, 11.2, -5.5, ej);
  mesh(new THREE.BoxGeometry(.6, 2, 2.4), std({ color:0xffb23a, emissive:0xff9a1a, emissiveIntensity:.6, roughness:.3 }), 10.6, 11.2, 5.5, ej);
  /* two USB stacks: USB 3 with blue tongues, USB 2 with black */
  for (const [z, tongue] of [[29, 0x1f62e8], [47, 0x18191c]]){
    const u = new THREE.Group(); u.position.set(78.5 - BX/2, T, z - BZ/2); P.add(u);
    mesh(rbox(17.5, 16, 13.1, .5, .25), silver, 0, 0, 0, u);
    for (const y of [2, 9.6]){ mesh(new THREE.BoxGeometry(1, 5.2, 12.2), hole, 8.4, y, 0, u); mesh(new THREE.BoxGeometry(9, 1.9, 11), std({ color:tongue, roughness:.45 }), 4.8, y + 1.2, 0, u); }
  }
  /* bottom edge: USB C, two micro HDMI, the A/V jack */
  at(rbox(9, 3.2, 7.4, 1.5, .3), silver, 11.2, 0, 52.8); at(new THREE.BoxGeometry(6.4, 1.2, .6), hole, 11.2, 1, 56.55);
  for (const x of [26, 39.5]){ at(rbox(6.6, 3, 7.6, .8, .25), silver, x, 0, 52.6); at(new THREE.BoxGeometry(5.2, 1.4, .6), hole, x, .9, 56.45); }
  at(rbox(7, 6, 12, .6, .2), blackPl, 54, 0, 50);
  const jack = at(new THREE.CylinderGeometry(3, 3, 2.6, 28), blackPl, 54, 3, 57.2); jack.rotation.x = Math.PI/2;
  const jh = at(new THREE.CylinderGeometry(1.75, 1.75, .4, 20), hole, 54, 3, 58.4); jh.rotation.x = Math.PI/2;
  /* ribbon connectors, white with a black latch */
  for (const [x, z] of [[3.6, 28], [47, 44]]){ at(rbox(3.2, 2.6, 22.5, .2, .05), white, x, 0, z); at(new THREE.BoxGeometry(1.2, .9, 21.5), blackPl, x + .6, 2.6, z); }
  /* the underside: its own print, test pads, no parts but the card socket */
  const under = canvasTex(BX*12, BZ*12, (g, W, H) => {
    const s = 12; g.fillStyle = "#1a6436"; g.fillRect(0, 0, W, H);
    g.strokeStyle = "rgba(60,140,85,.35)"; g.lineWidth = .25*s; for (let i = 0; i < 70; i++){ g.beginPath(); let x = Math.random()*W, y = Math.random()*H; g.moveTo(x, y); for (let k = 0; k < 3; k++){ if (k % 2) x += (Math.random() - .5)*20*s; else y += (Math.random() - .5)*16*s; g.lineTo(x, y); } g.stroke(); }
    g.fillStyle = "#d9b45a"; for (let i = 0; i < 60; i++){ g.beginPath(); g.arc((4 + Math.random()*77)*s, (8 + Math.random()*40)*s, .5*s, 0, 7); g.fill(); }
    for (let i = 0; i < 40; i++) g.fillRect((32.4 - 24.13 + (i >> 1)*2.54 - .6)*s, (3.5 + (i & 1 ? 1.27 : -1.27) - .6)*s, 1.2*s, 1.2*s);   // GPIO joints, mirrored
    for (const [x, y] of holes){ g.beginPath(); g.arc(x*s, y*s, 3.1*s, 0, 7); g.fill(); }
    g.fillStyle = "#0a0b0d"; for (const [x, y] of holes){ g.beginPath(); g.arc(x*s, y*s, 1.375*s, 0, 7); g.fill(); }
    g.translate(0, H); g.scale(1, -1);   // seen from below, the print reads mirrored in board coordinates
    g.fillStyle = "#f2f2ea"; g.font = `700 ${2.6*s}px Satoshi, Arial`; g.fillText("Raspberry Pi 4 Model B", 22*s, 30*s); g.font = `500 ${1.4*s}px ui-monospace, monospace`; g.fillText("Designed and Sold by Raspberry Pi", 22*s, 33.5*s); g.fillText("Made in the UK", 22*s, 36*s);
    g.strokeStyle = "#f2f2ea"; g.lineWidth = .25*s; g.strokeRect(19*s, 25*s, 46*s, 13*s);
  });
  const ug = rbox(BX, .02, BZ, 3, 0), up = ug.attributes.position, uu = ug.attributes.uv;
  for (let i = 0; i < up.count; i++) uu.setXY(i, (up.getX(i) + BX/2)/BX, 1 - (up.getZ(i) + BZ/2)/BZ);
  const ub = mesh(ug, std({ map:under, roughness:.5 }), 0, -.03, 0, P); ub.castShadow = false;
  /* microSD socket under the board */
  mesh(new THREE.BoxGeometry(11.5, 1.4, 11.5), silver, 6.5 - BX/2, -1.4, 28 - BZ/2, P);

  /* small passives scattered where the board is clear */
  const keep = [[6, 0, 59, 7], [20, 23, 38, 41], [40, 24, 51, 40], [62, 0, 86, 56], [5, 8, 18, 22], [0, 16, 6, 40], [44, 32, 50, 56], [6, 48, 60, 56], [16, 43, 25, 51], [55, 9, 62, 36], [12, 38, 46, 46]];
  const ok = (x, z) => x > 2 && x < 83 && z > 2 && z < 54 && !keep.some(([a, b, c, d]) => x > a && x < c && z > b && z < d) && !holes.some(([hx, hz]) => Math.hypot(x - hx, z - hz) < 4);
  const caps = new THREE.InstancedMesh(new THREE.BoxGeometry(1, .5, .5), std({ color:0xa98552, roughness:.5 }), 160);
  const res = new THREE.InstancedMesh(new THREE.BoxGeometry(1, .35, .5), std({ color:0x111214, roughness:.5 }), 160);
  const q = new THREE.Quaternion(), sc = new THREE.Vector3(1, 1, 1), v = new THREE.Vector3();
  for (const [im, h] of [[caps, .55], [res, .35]]){
    let k = 0, guard = 0;
    while (k < 55 && guard++ < 5000){
      const x = 2 + Math.random() * 81, z = 2 + Math.random() * 52; if (!ok(x, z)) continue;
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() < .5 ? 0 : Math.PI/2);
      im.setMatrixAt(k++, mx.compose(v.set(x - BX/2, T + h/2, z - BZ/2), q, sc));
    }
    im.count = k; im.castShadow = true; P.add(im);
  }
  P.position.y = 1.4;   // the socket under the board sits on the mat
  return P;
}

/* ================================================================ NEMA 17 stepper, StepperOnline 17HS15-1504S: 42.3 mm frame, 39 mm body */
function buildNema(){
  const N = new THREE.Group(), W = 42.3, C = 4.6;
  const shape = (() => { const s = new THREE.Shape(), a = W/2, c = C; s.moveTo(-a + c, -a); s.lineTo(a - c, -a); s.lineTo(a, -a + c); s.lineTo(a, a - c); s.lineTo(a - c, a); s.lineTo(-a + c, a); s.lineTo(-a, a - c); s.lineTo(-a, -a + c); s.closePath(); return s; })();
  const slab = (h, bev, holesAt) => {
    if (holesAt) for (const [x, y] of holesAt){ const p = new THREE.Path(); p.absarc(x, y, 1.6, 0, Math.PI*2, true); shape.holes.push(p); }
    const g = new THREE.ExtrudeGeometry(shape, { depth:h - 2*bev, bevelEnabled:bev > 0, bevelThickness:bev, bevelSize:bev, bevelSegments:3, curveSegments:24 });
    shape.holes.length = 0; g.rotateX(-Math.PI/2); g.translate(0, bev, 0); g.computeVertexNormals(); return g;
  };
  const cap = std({ color:0x1b1c20, roughness:.38, metalness:.75 });
  /* laminated stator: a fine ridge texture on the sides */
  const lam = canvasTex(64, 256, (g, w, h) => { for (let y = 0; y < h; y++){ const k = y % 4 < 3 ? 168 + Math.random()*10 : 120; g.fillStyle = `rgb(${k},${k + 3},${k + 8})`; g.fillRect(0, y, w, 1); } });
  lam.wrapS = lam.wrapT = THREE.RepeatWrapping; lam.repeat.set(1, 1.6);
  const stack = std({ color:0xffffff, map:lam, roughness:.36, metalness:1 });
  mesh(slab(8.5, .8), cap, 0, 0, 0, N);
  mesh(slab(22, .2), stack, 0, 8.5, 0, N);
  const S = [[15.5, 15.5], [-15.5, 15.5], [15.5, -15.5], [-15.5, -15.5]];
  mesh(slab(8.5, .8, S), cap, 0, 30.5, 0, N);
  /* screws in the front cap: socket heads */
  const head = std({ color:0x2a2b30, roughness:.3, metalness:.9 });
  for (const [x, z] of S){
    mesh(new THREE.CylinderGeometry(2.7, 2.7, 1.2, 28), head, x, 38.6, z, N);
    mesh(new THREE.CylinderGeometry(1.25, 1.25, .3, 6), std({ color:0x050506, roughness:.8 }), x, 39.12, z, N);
  }
  /* pilot boss and the D cut shaft */
  mesh(new THREE.CylinderGeometry(11, 11, 2, 48), std({ color:0xc4c8cf, roughness:.3, metalness:1 }), 0, 39 + 1, 0, N);
  const ds = new THREE.Shape(); ds.absarc(0, 0, 2.5, Math.acos(2/2.5), Math.PI*2 - Math.acos(2/2.5), false); ds.closePath();
  const dg = new THREE.ExtrudeGeometry(ds, { depth:15, bevelEnabled:false, curveSegments:32 }); dg.rotateX(-Math.PI/2);
  mesh(dg, std({ color:0xdfe2e7, roughness:.16, metalness:1 }), 0, 41 + 9, 0, N);
  mesh(new THREE.CylinderGeometry(2.5, 2.5, 9, 32), std({ color:0xdfe2e7, roughness:.16, metalness:1 }), 0, 41 + 4.5, 0, N);
  /* label on the stator */
  const lb = mesh(new THREE.PlaneGeometry(30, 16), label(600, 320, (g, w, h) => {
    g.fillStyle = "#e9ebef"; g.fillRect(0, 0, w, h); g.fillStyle = "#16171b";
    g.font = "800 46px Satoshi, Arial"; g.fillText("STEPPERONLINE", 30, 76);
    g.font = "600 36px ui-monospace,monospace"; g.fillText("17HS15-1504S", 30, 140); g.font = "500 28px ui-monospace,monospace"; g.fillText("1.8°  1.5A  42Ncm", 30, 196); g.fillText("2304 0118", 30, 246);
    g.fillRect(430, 220, 140, 70);
  }, { roughness:.45 }), 0, 19.5, W/2 + .35, N);
  lb.castShadow = false;
  /* JST connector on the back cap */
  const jst = new THREE.Group(); jst.position.set(0, 1.5, -W/2 - 3); N.add(jst);
  mesh(rbox(14, 6, 6, .4, .15), std({ color:0xeceae2, roughness:.55 }), 0, 0, 0, jst);
  for (let i = 0; i < 6; i++) mesh(new THREE.BoxGeometry(1.3, 2.4, .4), std({ color:0x050506, roughness:.9 }), -5 + i*2, 2.6, -3.05, jst);
  return N;
}

/* ================================================================ the claw: the anatomy build, scaled to mm and stood up */
async function buildClaw(){
  const cache = new Map();
  const mat = (part, k, o, p) => { const key = part + "|" + k; if (!cache.has(key)){ const m = p ? phys(o) : std(o); m.userData.base = { opacity:m.opacity, ei:m.emissiveIntensity || 0 }; cache.set(key, m); } return cache.get(key); };
  const M = buildMachine(THREE, { mat, onFont:cb => (document.fonts ? document.fonts.ready : Promise.resolve()).then(cb), scene:await loadMachine() });
  const claw = M.parts.claw; claw.traverse(o => { if (o.name === "claw_line" || o.name === "claw_coil_cable") o.visible = false; if (o.isMesh) o.castShadow = o.receiveShadow = true; });
  const Z = new THREE.Group(); Z.add(claw); Z.rotation.x = -Math.PI/2; Z.scale.setScalar(1000);
  const H = new THREE.Group(); H.add(Z); H.updateMatrixWorld(true);
  const bb = visBox(H);
  const c = bb.getCenter(new THREE.Vector3()); Z.position.set(-c.x, -bb.min.y, -c.z);
  return H;
}

/* ---------- the parts list shown on the card ---------- */
const PARTS = [
  { id:"pi", kind:"Brain", title:"Raspberry Pi 4 Model B", build:buildPi, yaw:-.35,
    lead:"A full computer the size of a credit card. It runs the game, drives every motor and signs each play.",
    specs:[["Chip", "Broadcom BCM2711, 4 cores at 1.5 GHz"], ["Memory", "8 GB LPDDR4"], ["Board", "85 x 56 mm"], ["Runs", "Raspberry Pi OS, Klipper, peaqOS"]],
    job:"<b>In the machine:</b> behind the front panel, wired to the motor board, both cameras and the NFC reader." },
  { id:"nema", kind:"Motion", title:"NEMA 17 stepper", build:buildNema, yaw:-.35,
    lead:"Moves the gantry in 200 exact steps per turn, so the claw always knows where it is.",
    specs:[["Model", "StepperOnline 17HS15-1504S"], ["Frame", "42.3 x 42.3 x 39 mm"], ["Torque", "42 Ncm at 1.5 A"], ["Step", "1.8°, 200 per turn"]],
    job:"<b>In the machine:</b> two of them on the frame pull the X and Y belts, a slim one on the carriage winds the line." },
  { id:"claw", kind:"Grip", title:"The claw", build:buildClaw, yaw:.3,
    lead:"Three printed arms on one pivot hub, pulled shut by a square actuator through three links.",
    specs:[["Arms", "3, black PETG"], ["Drive", "Linear actuator in a square tube"], ["Hangs on", "1.5 mm Dyneema line"], ["Grip", "Set before the play, measured after"]],
    job:"<b>In the machine:</b> the grip it promises is locked before you pay, and the grip it gave is signed after." }
];

/* ---------- camera: drag to turn, wheel to zoom, slow turn when idle ---------- */
const view = { th:.7, ph:1.0, r:200, tTh:.7, tPh:1.0, tR:200, target:new THREE.Vector3(), tTarget:new THREE.Vector3(), spin:true };
let drag = null;
cv.addEventListener("pointerdown", e => { drag = { x:e.clientX, y:e.clientY }; cv.setPointerCapture(e.pointerId); });
cv.addEventListener("pointermove", e => { if (!drag) return; view.tTh -= (e.clientX - drag.x) * .006; view.tPh = Math.min(1.5, Math.max(.05, view.tPh - (e.clientY - drag.y) * .005)); drag = { x:e.clientX, y:e.clientY }; });
addEventListener("pointerup", () => drag = null);
cv.addEventListener("wheel", e => { e.preventDefault(); view.tR = Math.min(view.fit * 2.2, Math.max(view.fit * .45, view.tR * (1 + Math.sign(e.deltaY) * .1))); }, { passive:false });

const VIEWS = { iso:[.7, 1.0], top:[0, .06], bottom:[0, .06], front:[0, 1.42] };
let cur = null, flip = 0, tFlip = 0;
function setView(v){
  document.querySelectorAll(".bn-views [data-v]").forEach(b => b.classList.toggle("on", b.dataset.v === v));
  const [th, ph] = VIEWS[v]; view.tTh = th + (cur ? cur.yaw : 0); view.tPh = ph; view.tR = view.fit;
  view.th = ((view.th - view.tTh + Math.PI) % (Math.PI*2) + Math.PI*2) % (Math.PI*2) - Math.PI + view.tTh;   // turn the short way round
  tFlip = v === "bottom" ? Math.PI : 0;
  if (v !== "iso") setSpin(false);
}
function setSpin(on){ view.spin = on; document.getElementById("spin").classList.toggle("on", on); }
document.querySelectorAll(".bn-views [data-v]").forEach(b => b.onclick = () => setView(b.dataset.v));
document.getElementById("spin").onclick = () => setSpin(!view.spin);

/* ---------- show a part ---------- */
const holder = new THREE.Group(); scene.add(holder);
function frame(obj){
  const bb = visBox(obj), s = bb.getBoundingSphere(new THREE.Sphere());
  view.fit = s.radius / Math.sin(THREE.MathUtils.degToRad(cam.fov/2)) * 1.3;
  view.tTarget.set(0, s.center.y * .9, 0); return s;
}
function show(p, instant){
  cur = p;
  document.querySelectorAll(".bn-shelf button").forEach(b => b.classList.toggle("on", b.dataset.id === p.id));
  const card = document.getElementById("card"); card.classList.add("swap");
  setTimeout(() => {
    document.getElementById("cKind").textContent = p.kind; document.getElementById("cNum").textContent = String(PARTS.indexOf(p) + 1).padStart(2, "0") + " / " + String(PARTS.length).padStart(2, "0");
    document.getElementById("cTitle").textContent = p.title; document.getElementById("cLead").textContent = p.lead;
    document.getElementById("cSpecs").innerHTML = p.specs.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join(""); document.getElementById("cJob").innerHTML = p.job;
    card.classList.remove("swap");
  }, instant ? 0 : 220);
  holder.children.forEach(c => c.visible = false); p.obj.visible = true; p.drop = instant ? 0 : 1;
  holder.rotation.set(0, 0, 0); flip = tFlip = 0;
  frame(p.obj); setView("iso"); setSpin(true);
  if (instant){ view.th = view.tTh; view.ph = view.tPh; view.r = view.tR; view.target.copy(view.tTarget); }
  try { history.replaceState(null, "", "#" + p.id); } catch (e) {}
}

function resize(){
  const w = innerWidth, h = innerHeight; R.setSize(w, h, false); cam.aspect = w/h;
  /* desktop: the card sits on the left, so the part moves right of centre */
  if (w > 720) cam.setViewOffset(w, h, -w * .13, 0, w, h); else cam.setViewOffset(w, h, 0, -h * .08, w, h);
  cam.updateProjectionMatrix();
}
addEventListener("resize", resize);

/* ---------- loop ---------- */
const clock = new THREE.Clock();
function tick(){
  const dt = Math.min(clock.getDelta(), .05), k = 1 - Math.exp(-dt * 6);
  if (view.spin && !drag) view.tTh += dt * .18;
  view.th += (view.tTh - view.th) * k; view.ph += (view.tPh - view.ph) * k; view.r += (view.tR - view.r) * k; view.target.lerp(view.tTarget, k);
  flip += (tFlip - flip) * k;
  if (cur){
    cur.drop = Math.max(0, (cur.drop || 0) - dt * 2.2);
    const e = cur.drop * cur.drop; cur.obj.position.y = e * 40;
    /* bottom view: the part turns over in place, around its own middle */
    const s = frame._s || (frame._s = new THREE.Box3()); holder.rotation.x = flip;
    const hh = cur.h || 0; holder.position.y = Math.sin(flip/2) ** 2 * hh;
  }
  const sp = Math.sin(view.ph); cam.position.set(view.target.x + view.r * sp * Math.sin(view.th), view.target.y + view.r * Math.cos(view.ph), view.target.z + view.r * sp * Math.cos(view.th));
  cam.lookAt(view.target);
  R.render(scene, cam); requestAnimationFrame(tick);
}

/* ---------- boot: build all, photograph each for the shelf, then show the one in the URL ---------- */
(async () => {
  resize();
  for (const p of PARTS){ p.obj = await p.build(); p.obj.rotation.y = 0; holder.add(p.obj); p.obj.visible = false; p.obj.visible = true; p.h = visBox(p.obj).max.y; p.obj.visible = false; }
  const shelf = document.getElementById("shelf"), w = innerWidth, h = innerHeight;
  R.setSize(264, 168, false); cam.aspect = 264/168; cam.clearViewOffset(); cam.updateProjectionMatrix();
  for (const p of PARTS){
    holder.children.forEach(c => c.visible = c === p.obj); const s = frame(p.obj);
    const th = .7 + p.yaw, ph = 1.0, r = view.fit * .78; cam.position.set(Math.sin(ph) * Math.sin(th) * r, s.center.y + Math.cos(ph) * r, Math.sin(ph) * Math.cos(th) * r); cam.lookAt(0, s.center.y * .8, 0);
    R.render(scene, cam);
    const b = document.createElement("button"); b.type = "button"; b.dataset.id = p.id; b.innerHTML = `<img alt="" src="${cv.toDataURL("image/jpeg", .85)}" /><span>${p.title}</span>`; b.onclick = () => show(p); shelf.appendChild(b);
  }
  resize();
  show(PARTS.find(p => "#" + p.id === location.hash) || PARTS[0], true);
  tick();
  document.getElementById("boot").classList.add("gone");
  window.__bench = { PARTS, show, setView, view };
})().catch(e => { console.error(e); document.querySelector("#boot b").textContent = "3D could not start"; });
