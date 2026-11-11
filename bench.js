/* Workbench: one part of Prototype 01 at a time, built in code at real size (mm), on a dark ESD mat under a soft studio light.
   The claw is the same build the anatomy page uses (anatomy-metal.js); the Pi and the stepper are modelled here from their datasheets. */
import * as THREE from "./assets/vendor/three.module.min.js";
import { buildMachine } from "./anatomy-metal.js?v=39";
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
  s.add(new THREE.Mesh(new THREE.BoxGeometry(10, 6, 10), new THREE.MeshBasicMaterial({ color:0x3c3f48, side:THREE.BackSide })));
  const panel = (w, h, col, k, x, y, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color:new THREE.Color(col).multiplyScalar(k), side:THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m); };
  panel(7, 4, 0xffffff, 4, -1, 2.9, 1.5);    // overhead soft box
  panel(4, 3, 0xffd9ae, 2.6, -4.9, 1, -1);   // warm lamp, left
  panel(4, 2.4, 0xb8ccff, 1.6, 4.9, .8, -2);   // blue rim, right
  panel(7, 1.4, 0xffffff, 2.2, 0, .6, 4.9);
  panel(3, 5, 0xffffff, 1.4, 4.9, 1.5, 3);     // tall strip, right front: a clean line down the metal
  panel(6, 3, 0xffffff, 1.3, 0, 1.2, -4.9);    // back wall card: the faces turned away still read as metal
  panel(3, 4, 0xffffff, 1.1, -4.9, 1.2, 3);     // low front strip, lifts the dark sides
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
const head = new THREE.DirectionalLight(0xf2f4ff, .55); scene.add(head);   // soft fill from the camera, so dark plastic still shows its shape

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
  const P = new THREE.Group(), T = 1.4, BX = 85, BZ = 56, tags = {}; P.userData.tags = tags;
  const tag = (k, ...o) => { (tags[k] = tags[k] || []).push(...o); return o[0]; };
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
    g.fillStyle = "#f2f2ea";
    g.font = `600 ${1.1*S}px ui-monospace, monospace`; g.fillText("J8", 6 * S, 8.6 * S); g.fillText("GPIO", 52 * S, 8.6 * S); g.fillText("DISPLAY", 6.2 * S, 22 * S); g.fillText("CAMERA", 49 * S, 33 * S);
    g.fillText("POWER IN", 6.5 * S, 47.5 * S); g.fillText("HDMI0", 23.5 * S, 47.5 * S); g.fillText("HDMI1", 37 * S, 47.5 * S); g.fillText("A/V", 52.5 * S, 47.5 * S);
    g.strokeStyle = "#f2f2ea"; g.lineWidth = .12 * S; g.strokeRect(6.6 * S, 0.9 * S, 51.6 * S, 5.2 * S);
  });
  /* board with the right UVs on top: the canvas maps straight onto x, z */
  const bg = rbox(BX, T, BZ, 3, 0), pos = bg.attributes.position, uv = bg.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + BX/2)/BX, 1 - (pos.getZ(i) + BZ/2)/BZ);
  const board = mesh(bg, [phys({ map:pcb, roughness:.62, metalness:0, clearcoat:.12, clearcoatRoughness:.6 }), std({ color:0x2f5a34, roughness:.7 })]); P.add(board);

  const silver = std({ color:0xe4e6ea, roughness:.3, metalness:.88 }), brushed = std({ color:0xb9bdc4, roughness:.42, metalness:1 });
  const blackPl = std({ color:0x141518, roughness:.55 }), gold = std({ color:0xf2c46a, roughness:.22, metalness:1 });
  const white = std({ color:0xeeeae0, roughness:.6 }), hole = std({ color:0x050506, roughness:.9 });

  /* GPIO: 2 x 20 header, gold pins */
  tag("gpio", at(rbox(50.8, 2.5, 5.08, .2, .05), blackPl, 32.4, 0, 3.5));
  const pinG = new THREE.BoxGeometry(.64, 8.5, .64), pins = new THREE.InstancedMesh(pinG, gold, 44); pins.castShadow = true; let n = 0; const mx = new THREE.Matrix4();
  for (let i = 0; i < 20; i++) for (const dz of [-1.27, 1.27]) pins.setMatrixAt(n++, mx.makeTranslation(32.4 - 24.13 + i*2.54 - BX/2, T + 4.25, 3.5 + dz - BZ/2));
  /* PoE: 2 x 2 */
  tag("gpio", at(rbox(5.08, 2.5, 5.08, .2, .05), blackPl, 66.5, 0, 6.2));
  for (const dx of [-1.27, 1.27]) for (const dz of [-1.27, 1.27]) pins.setMatrixAt(n++, mx.makeTranslation(66.5 + dx - BX/2, T + 4.25, 6.2 + dz - BZ/2));
  P.add(pins); tag("gpio", pins);

  /* SoC under its lid, laser marked */
  tag("soc", at(rbox(17, .8, 17, .3, .05), std({ color:0x1d3b25, roughness:.5 }), 29, 0, 32));
  tag("soc", at(rbox(15, 1.6, 15, 1, .2), [label(512, 512, (g, W) => {
    g.fillStyle = "#c9ccd2"; g.fillRect(0, 0, W, W);
    const gr = g.createLinearGradient(0, 0, W, W); gr.addColorStop(0, "rgba(255,255,255,.18)"); gr.addColorStop(1, "rgba(0,0,0,.12)"); g.fillStyle = gr; g.fillRect(0, 0, W, W);
    g.fillStyle = "rgba(60,62,70,.75)"; g.font = "700 46px Arial"; g.fillText("BROADCOM", 70, 190); g.font = "600 40px Arial"; g.fillText("BCM2711B0T", 70, 250); g.font = "500 30px ui-monospace,monospace"; g.fillText("HB2004 P21", 70, 300); g.fillText("2138", 70, 340);
  }, { roughness:.32, metalness:.9 }), brushed], 29, .8, 32));
  /* LPDDR4 */
  tag("ram", at(rbox(10, 1, 14.5, .2, .05), [label(256, 384, (g, W, H) => { g.fillStyle = "#15161a"; g.fillRect(0, 0, W, H); g.fillStyle = "rgba(220,220,225,.6)"; g.font = "600 30px Arial"; g.fillText("Micron", 30, 120); g.font = "500 22px ui-monospace,monospace"; g.fillText("D9WHT", 30, 170); g.fillText("8GB", 30, 205); g.beginPath(); g.arc(30, 330, 9, 0, 7); g.fill(); }, { roughness:.55 }), blackPl], 45.5, 0, 32));
  /* USB controller, Ethernet PHY, PMIC */
  for (const [x, z, s, t] of [[59, 32, 7, "VL805"], [59, 13, 6, "BCM54213"], [21, 47, 5, "MXL7704"]])
    tag(t === "VL805" ? "usbctl" : t === "BCM54213" ? "phy" : "pmic", at(rbox(s, .9, s, .15, .05), [label(256, 256, (g, W) => { g.fillStyle = "#17181c"; g.fillRect(0, 0, W, W); g.fillStyle = "rgba(220,220,225,.55)"; g.font = `600 ${t.length > 6 ? 30 : 36}px Arial`; g.fillText(t, 24, 120); g.beginPath(); g.arc(30, 200, 8, 0, 7); g.fill(); }, { roughness:.55 }), blackPl], x, 0, z));
  /* wireless module under its can */
  tag("wifi", at(rbox(10, 1.3, 12, .3, .05), [label(256, 300, (g, W, H) => { g.fillStyle = "#cfd2d8"; g.fillRect(0, 0, W, H); g.fillStyle = "rgba(60,62,70,.7)"; g.strokeStyle = "rgba(60,62,70,.6)"; g.lineWidth = 3; g.strokeRect(14, 14, W - 28, H - 28); }, { roughness:.3, metalness:.95 }), silver], 12, 0, 15));

  /* metal shells with real openings: the front plate is a shape with holes, the cavity behind it is seen from inside */
  const cavity = std({ color:0x7d8087, roughness:.5, metalness:1, side:THREE.BackSide });   // the inside of the shell, darker sheet metal
  function shell(len, h, wid, openings, parent){   // len along x (front at +x), h up, wid along z; openings: [y, height, width, notch]
    const t = .3, g = new THREE.Group(); parent.add(g);
    mesh(new THREE.BoxGeometry(len - t, t, wid), silver, -t/2, h - t/2, 0, g);   // top
    mesh(new THREE.BoxGeometry(len - t, t, wid), silver, -t/2, t/2, 0, g);       // bottom
    for (const sz of [-1, 1]) mesh(new THREE.BoxGeometry(len - t, h, t), silver, -t/2, h/2, sz*(wid/2 - t/2), g);
    mesh(new THREE.BoxGeometry(t, h, wid), silver, -len/2 + t/2, h/2, 0, g);    // back
    const f = new THREE.Shape(); f.moveTo(-wid/2, 0); f.lineTo(wid/2, 0); f.lineTo(wid/2, h); f.lineTo(-wid/2, h); f.lineTo(-wid/2, 0);
    for (const [y, hh, ww, notch] of openings){
      const o = new THREE.Path(), r = .5, a = -ww/2, b = ww/2;
      o.moveTo(a + r, y); if (notch){ o.lineTo(-notch/2, y); o.lineTo(-notch/2, y - 1.6); o.lineTo(notch/2, y - 1.6); o.lineTo(notch/2, y); }
      o.lineTo(b - r, y); o.quadraticCurveTo(b, y, b, y + r); o.lineTo(b, y + hh - r); o.quadraticCurveTo(b, y + hh, b - r, y + hh);
      o.lineTo(a + r, y + hh); o.quadraticCurveTo(a, y + hh, a, y + hh - r); o.lineTo(a, y + r); o.quadraticCurveTo(a, y, a + r, y); f.holes.push(o);
      const cv = mesh(new THREE.BoxGeometry(len - 1.2, hh + (notch ? 1.6 : 0), ww), cavity, -.6, y + hh/2 - (notch ? .8 : 0), 0, g); cv.castShadow = cv.receiveShadow = false;
    }
    const fg = new THREE.ExtrudeGeometry(f, { depth:t, bevelEnabled:false, curveSegments:4 }); fg.rotateY(Math.PI/2);
    mesh(fg, silver, len/2 - t, 0, 0, g);
    /* a lip round the mouth and two spring tabs on top, as pressed in the sheet */
    for (const sz of [-1, 1]) mesh(new THREE.BoxGeometry(4, .12, 1.6), silver, len/2 - 4, h + .04, sz*wid/4, g).rotation.z = -.12;
    return g;
  }

  /* Ethernet jack, shell over the edge, latch slot down, LEDs in the top corners */
  const ej = new THREE.Group(); ej.position.set(75.5 - BX/2, T, 10.25 - BZ/2); P.add(ej); tag("eth", ej);
  shell(21, 13.5, 16, [[3.2, 8.2, 11.8, 6.2]], ej);
  const jackIn = std({ color:0x16171a, roughness:.7 });
  mesh(new THREE.BoxGeometry(12, 2.4, 11.6), jackIn, -.5, 10.2, 0, ej);                // insert roof, carries the contacts
  const wires = new THREE.InstancedMesh(new THREE.BoxGeometry(5, .2, .45), gold, 8);
  for (let i = 0; i < 8; i++) wires.setMatrixAt(i, mx.makeTranslation(4, 9.9, -4.45 + i*1.27)); ej.add(wires);
  P.userData.leds = [mesh(new THREE.BoxGeometry(.4, 1.6, 2.2), std({ color:0x3dff7a, emissive:0x1fdc5c, emissiveIntensity:.9, roughness:.3 }), 10.55, 12, -5.6, ej),
    mesh(new THREE.BoxGeometry(.4, 1.6, 2.2), std({ color:0xffb23a, emissive:0xff9a1a, emissiveIntensity:.7, roughness:.3 }), 10.55, 12, 5.6, ej)];
  /* two USB stacks: USB 3 with blue tongues, USB 2 with black; the tongue rides in the top of each mouth, contacts down */
  for (const [z, tongue] of [[29, 0x1f62e8], [47, 0x18191c]]){
    const u = new THREE.Group(); u.position.set(78.5 - BX/2, T, z - BZ/2); P.add(u); tag(z === 29 ? "usb3" : "usb2", u);
    shell(17.5, 16, 13.1, [[1.6, 5.2, 12], [9.2, 5.2, 12]], u);
    mesh(new THREE.BoxGeometry(17, .9, 13.1), silver, -.25, 7.55, 0, u);              // divider between the two ports
    const tm = std({ color:tongue === 0x18191c ? 0x1c1d21 : tongue, roughness:.42 });
    for (const y of [1.6, 9.2]){
      mesh(new THREE.BoxGeometry(14.5, 1.9, 11.2), tm, -.6, y + 5.2 - 1.9 - .55, 0, u);
      const pads = new THREE.InstancedMesh(new THREE.BoxGeometry(6, .08, 1), gold, 4);
      for (let i = 0; i < 4; i++) pads.setMatrixAt(i, mx.makeTranslation(3.2, y + 5.2 - 1.9 - .55 - .96, -3.75 + i*2.5)); u.add(pads);
    }
  }
  /* bottom edge: USB C, two micro HDMI, the A/V jack */
  tag("usbc", at(rbox(9, 3.2, 7.4, 1.5, .3), silver, 11.2, 0, 52.8), at(new THREE.BoxGeometry(6.4, 1.2, .6), hole, 11.2, 1, 56.55));
  for (const x of [26, 39.5]) tag("hdmi" + (x < 30 ? 0 : 1), at(rbox(6.6, 3, 7.6, .8, .25), silver, x, 0, 52.6), at(new THREE.BoxGeometry(5.2, 1.4, .6), hole, x, .9, 56.45));
  tag("av", at(rbox(7, 6, 12, .6, .2), blackPl, 54, 0, 50));
  const jack = at(new THREE.CylinderGeometry(3, 3, 2.6, 28), blackPl, 54, 3, 57.2); jack.rotation.x = Math.PI/2; tag("av", jack);
  const jh = at(new THREE.CylinderGeometry(1.75, 1.75, .4, 20), hole, 54, 3, 58.4); jh.rotation.x = Math.PI/2; tag("av", jh);
  /* ribbon connectors, white with a black latch */
  for (const [x, z] of [[3.6, 28], [47, 44]]) tag(x < 10 ? "dsi" : "csi", at(rbox(3.2, 2.6, 22.5, .2, .05), white, x, 0, z), at(new THREE.BoxGeometry(1.2, .9, 21.5), blackPl, x + .6, 2.6, z));
  /* the underside: its own print, test pads, no parts but the card socket */
  const under = canvasTex(BX*12, BZ*12, (g, W, H) => {
    const s = 12; g.fillStyle = "#1a6436"; g.fillRect(0, 0, W, H);
    g.strokeStyle = "rgba(60,140,85,.35)"; g.lineWidth = .25*s; for (let i = 0; i < 70; i++){ g.beginPath(); let x = Math.random()*W, y = Math.random()*H; g.moveTo(x, y); for (let k = 0; k < 3; k++){ if (k % 2) x += (Math.random() - .5)*20*s; else y += (Math.random() - .5)*16*s; g.lineTo(x, y); } g.stroke(); }
    g.fillStyle = "#d9b45a"; for (let i = 0; i < 60; i++){ g.beginPath(); g.arc((4 + Math.random()*77)*s, (8 + Math.random()*40)*s, .5*s, 0, 7); g.fill(); }
    for (let i = 0; i < 40; i++) g.fillRect((32.4 - 24.13 + (i >> 1)*2.54 - .6)*s, (3.5 + (i & 1 ? 1.27 : -1.27) - .6)*s, 1.2*s, 1.2*s);   // GPIO joints, mirrored
    for (const [x, y] of holes){ g.beginPath(); g.arc(x*s, y*s, 3.1*s, 0, 7); g.fill(); }
    g.fillStyle = "#0a0b0d"; for (const [x, y] of holes){ g.beginPath(); g.arc(x*s, y*s, 1.375*s, 0, 7); g.fill(); }
    g.translate(0, H); g.scale(1, -1);   // seen from below, the print reads mirrored in board coordinates
  });
  const ug = rbox(BX, .02, BZ, 3, 0), up = ug.attributes.position, uu = ug.attributes.uv;
  for (let i = 0; i < up.count; i++) uu.setXY(i, (up.getX(i) + BX/2)/BX, 1 - (up.getZ(i) + BZ/2)/BZ);
  const ub = mesh(ug, std({ map:under, roughness:.5 }), 0, -.03, 0, P); ub.castShadow = false;
  /* microSD socket under the board */
  tag("sd", mesh(new THREE.BoxGeometry(11.5, 1.4, 11.5), silver, 6.5 - BX/2, -1.4, 28 - BZ/2, P));

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
  const N = new THREE.Group(), W = 42.3, C = 4.6, tags = {}; N.userData.tags = tags;
  const grp = k => { const g = new THREE.Group(); N.add(g); tags[k] = [g]; return g; };
  const outline = () => { const s = new THREE.Shape(), a = W/2, c = C; s.moveTo(-a + c, -a); s.lineTo(a - c, -a); s.lineTo(a, -a + c); s.lineTo(a, a - c); s.lineTo(a - c, a); s.lineTo(-a + c, a); s.lineTo(-a, a - c); s.lineTo(-a, -a + c); s.closePath(); return s; };
  const slab = (h, bev, holesAt, bore) => {
    const shape = outline();
    if (holesAt) for (const [x, y] of holesAt){ const p = new THREE.Path(); p.absarc(x, y, 1.6, 0, Math.PI*2, true); shape.holes.push(p); }
    if (bore){ const p = new THREE.Path(); p.absarc(0, 0, bore, 0, Math.PI*2, true); shape.holes.push(p); }
    const g = new THREE.ExtrudeGeometry(shape, { depth:h - 2*bev, bevelEnabled:bev > 0, bevelThickness:bev, bevelSize:bev, bevelSegments:3, curveSegments:32 });
    g.rotateX(-Math.PI/2); g.translate(0, bev, 0); g.computeVertexNormals(); return g;
  };
  const cap = std({ color:0x1b1c20, roughness:.38, metalness:.75 }), shaftM = std({ color:0xdfe2e7, roughness:.16, metalness:1 });
  const S = [[15.5, 15.5], [-15.5, 15.5], [15.5, -15.5], [-15.5, -15.5]];

  /* rear cap with the JST socket */
  const rear = grp("rear");
  mesh(slab(8.5, .8), cap, 0, 0, 0, rear);
  const jst = new THREE.Group(); jst.position.set(0, 1.5, -W/2 - 3); rear.add(jst);
  mesh(rbox(14, 6, 6, .4, .15), std({ color:0xeceae2, roughness:.55 }), 0, 0, 0, jst);
  for (let i = 0; i < 6; i++) mesh(new THREE.BoxGeometry(1.3, 2.4, .4), std({ color:0x050506, roughness:.9 }), -5 + i*2, 2.6, -3.05, jst);

  /* laminated stator round a bore, eight poles wound in copper; the end turns show above the stack */
  const stator = grp("stator");
  const lam = canvasTex(64, 256, (g, w, h) => { for (let y = 0; y < h; y++){ const k = y % 4 < 3 ? 168 + Math.random()*10 : 120; g.fillStyle = `rgb(${k},${k + 3},${k + 8})`; g.fillRect(0, y, w, 1); } });
  lam.wrapS = lam.wrapT = THREE.RepeatWrapping; lam.repeat.set(1, 1.6);
  mesh(slab(22, .2, null, 11.4), std({ color:0xffffff, map:lam, roughness:.36, metalness:1 }), 0, 8.5, 0, stator);
  const copper = std({ color:0xc8743a, roughness:.32, metalness:1, emissive:0x000000 });
  N.userData.coils = [];
  for (let k = 0; k < 8; k++){
    const a = k * Math.PI/4, cx = Math.cos(a), cz = Math.sin(a);
    for (const y of [30.5, 7.3]){
      const m = mesh(new THREE.TorusGeometry(3.2, 1.25, 10, 24), copper.clone(), cx*15.5, y + 1.2, cz*15.5, stator);
      m.rotation.set(0, Math.PI/2 - a, 0); m.scale.set(1, .9, 1);   // ring round a radial pole, half buried in the stack: the end turn
      m.userData.phase = k % 2; m.userData.pol = (k >> 1) % 2; N.userData.coils.push(m);
    }
  }
  const lb = mesh(new THREE.PlaneGeometry(30, 16), label(600, 320, (g, w, h) => {
    g.fillStyle = "#e9ebef"; g.fillRect(0, 0, w, h); g.fillStyle = "#16171b";
    g.font = "800 46px Satoshi, Arial"; g.fillText("STEPPERONLINE", 30, 76);
    g.font = "600 36px ui-monospace,monospace"; g.fillText("17HS15-1504S", 30, 140); g.font = "500 28px ui-monospace,monospace"; g.fillText("1.8°  1.5A  42Ncm", 30, 196); g.fillText("2304 0118", 30, 246);
    g.fillRect(430, 220, 140, 70);
  }, { roughness:.45 }), 0, 19.5, W/2 + .35, stator);
  lb.castShadow = false;

  /* rotor: two toothed cups round a magnet, on the shaft, a bearing at each end */
  const rotor = grp("rotor"); N.userData.rotor = rotor;
  const teeth = canvasTex(512, 64, (g, w, h) => { g.fillStyle = "#9da2aa"; g.fillRect(0, 0, w, h); g.fillStyle = "#4b4f57"; for (let i = 0; i < 50; i++) g.fillRect(i * w/50, 0, w/100, h); });
  const tm = std({ color:0xffffff, map:teeth, roughness:.35, metalness:1 });
  mesh(new THREE.CylinderGeometry(11, 11, 9.5, 64), tm, 0, 9 + 4.75, 0, rotor);
  mesh(new THREE.CylinderGeometry(10.2, 10.2, 3, 48), std({ color:0x3a3d45, roughness:.5, metalness:.6 }), 0, 19.5, 0, rotor);
  mesh(new THREE.CylinderGeometry(11, 11, 9.5, 64), tm, 0, 21 + 4.75, 0, rotor);
  mesh(new THREE.CylinderGeometry(2.5, 2.5, 39, 32), shaftM, 0, 4 + 19.5, 0, rotor);
  for (const y of [5.5, 34]) mesh(new THREE.CylinderGeometry(5.5, 5.5, 3.5, 32), std({ color:0xc9cdd3, roughness:.25, metalness:1 }), 0, y, 0, rotor);
  const ds = new THREE.Shape(); ds.absarc(0, 0, 2.5, Math.acos(2/2.5), Math.PI*2 - Math.acos(2/2.5), false); ds.closePath();
  const dg = new THREE.ExtrudeGeometry(ds, { depth:15, bevelEnabled:false, curveSegments:32 }); dg.rotateX(-Math.PI/2);
  mesh(dg, shaftM, 0, 41 + 9, 0, rotor);
  mesh(new THREE.CylinderGeometry(2.5, 2.5, 9, 32), shaftM, 0, 41 + 4.5, 0, rotor);

  /* front cap with the pilot boss */
  const front = grp("front");
  mesh(slab(8.5, .8, S), cap, 0, 30.5, 0, front);
  mesh(new THREE.CylinderGeometry(11, 11, 2, 48), std({ color:0xc4c8cf, roughness:.3, metalness:1 }), 0, 39 + 1, 0, front);

  /* four long screws hold the stack together */
  const screws = grp("screws"), head = std({ color:0x2a2b30, roughness:.3, metalness:.9 });
  for (const [x, z] of S){
    mesh(new THREE.CylinderGeometry(2.7, 2.7, 1.2, 28), head, x, 38.6, z, screws);
    mesh(new THREE.CylinderGeometry(1.25, 1.25, .3, 6), std({ color:0x050506, roughness:.8 }), x, 39.12, z, screws);
    mesh(new THREE.CylinderGeometry(1.45, 1.45, 30, 12), std({ color:0x7c8088, roughness:.35, metalness:1 }), x, 38 - 15, z, screws);   // M3 through the stack
  }
  return N;
}

/* ================================================================ the claw: the anatomy build, scaled to mm and stood up */
async function buildClaw(){
  const cache = new Map();
  const mat = (part, k, o, p) => { const key = part + "|" + k; if (!cache.has(key)){ const m = p ? phys(o) : std(o); if (m.color && m.color.getHSL({ h:0, s:0, l:0 }).l < .06 && !m.metalness){ m.color.setHex(0x2b2d34); m.roughness = Math.min(m.roughness, .5); }   // black print reads as a dark grey under the studio light
      m.userData.base = { opacity:m.opacity, ei:m.emissiveIntensity || 0 }; cache.set(key, m); } return cache.get(key); };
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
  { id:"pi", kind:"Brain", icon:"assets/bench/pi-chrome.webp", title:"Raspberry Pi", build:buildPi, yaw:-.35,
    lead:"A full computer the size of a credit card. It runs the game, drives every motor and signs each play.",
    specs:[["Chip", "Broadcom BCM2711, 4 cores at 1.5 GHz"], ["Memory", "8 GB LPDDR4"], ["Board", "85 x 56 mm"], ["Runs", "Raspberry Pi OS, Klipper, peaqOS"]],
    job:"Behind the front panel, wired to the motor board, both cameras and the NFC reader." },
  { id:"nema", kind:"Motion", icon:"assets/bench/nema-chrome.webp", title:"NEMA 17 stepper", build:buildNema, yaw:-.35,
    lead:"Moves the gantry in 200 exact steps per turn, so the claw always knows where it is.",
    specs:[["Model", "StepperOnline 17HS15-1504S"], ["Frame", "42.3 x 42.3 x 39 mm"], ["Torque", "42 Ncm at 1.5 A"], ["Step", "1.8°, 200 per turn"]],
    job:"Two of them on the frame pull the X and Y belts, a slim one on the carriage winds the line." },
  { id:"claw", kind:"Grip", icon:"assets/bench/claw-chrome.webp", title:"The claw", build:buildClaw, yaw:.3,
    lead:"Three printed arms on one pivot hub, pulled shut by a square actuator through three links.",
    specs:[["Arms", "3, black PETG"], ["Drive", "Linear actuator in a square tube"], ["Hangs on", "1.5 mm Dyneema line"], ["Grip", "Set before the play, measured after"]],
    job:"The grip it promises is locked before you pay, and the grip it gave is signed after." }
];

/* ---------- how each part comes apart and how it works ----------
   apart: pieces in build order, each lifted along dir (mm, in the part's own frame) or pushed out from the axis (radial).
   run: a loop of captioned steps; tick(t, dt, step, st) drives the motion. */
const byName = re => root => { const out = []; root.traverse(o => { if (o.name && re.test(o.name) && !(o.parent && re.test(o.parent.name || ""))) out.push(o); }); return out; };
const tagged = (...k) => root => k.flatMap(x => root.userData.tags[x] || []);
const clawRig = root => { let r = null; root.traverse(o => { if (o.userData.clawRig) r = o.userData.clawRig; }); return r; };
const HI = new Map();
function glow(objs, k, col = 0x2f6bff){   // swap in a glowing copy of the material while lit
  for (const ob of objs) ob.traverse(m => { if (!m.isMesh) return;
    if (!m.userData.mat0){ m.userData.mat0 = m.material; const cl = x => { const c = x.clone(); c.emissive = new THREE.Color(col); return c; }; m.userData.matHi = Array.isArray(m.material) ? m.material.map(cl) : cl(m.material); }
    m.material = k > .01 ? m.userData.matHi : m.userData.mat0;
    if (k > .01) for (const x of [].concat(m.userData.matHi)) x.emissiveIntensity = k; });
}
const SIM = {
  pi:{
    apart:[["Main chip", tagged("soc"), [0, 46, 0]], ["Memory", tagged("ram"), [0, 30, 0]], ["Wireless", tagged("wifi"), [-6, 30, -6]], ["GPIO header", tagged("gpio"), [0, 36, -18]],
      ["Ethernet", tagged("eth", "phy"), [26, 30, -10]], ["USB 3", tagged("usb3", "usbctl"), [30, 14, 0]], ["USB 2", tagged("usb2"), [34, 0, 8]],
      ["Power, video, audio", tagged("usbc", "hdmi0", "hdmi1", "av", "pmic"), [0, 8, 26]], ["Camera and display", tagged("csi", "dsi"), [0, 18, 0]]],
    steps:[["Power comes in on USB C: 5 V at 3 A.", ["usbc"]], ["The main chip runs the game, the stream and the signing.", ["soc"]], ["8 GB of memory holds each video frame on its way out.", ["ram"]],
      ["The USB ports carry both cameras and the NFC reader.", ["usbctl", "usb3", "usb2"]], ["Ethernet sends the stream out. The lights blink with the traffic.", ["phy", "eth"]], ["The header talks to the motor board and the gate servo.", ["gpio"]]].map(([t, k]) => [t, 2.8, k]),
    tick(root, t, dt, step, st){ const tg = root.userData.tags, all = Object.keys(tg);
      for (const k of all) glow(tg[k], 0);
      for (const k of this.steps[step][2]) glow(tg[k], .55 + .35*Math.sin(st*5));
      const L = root.userData.leds; L[0].material.emissiveIntensity = step === 4 ? (Math.random() < .5 ? 2 : .2) : .9; L[1].material.emissiveIntensity = step === 4 ? (Math.random() < .3 ? 1.6 : .3) : .7; },
    stop(root){ const tg = root.userData.tags; for (const k in tg) glow(tg[k], 0); }
  },
  nema:{
    apart:[["Screws", tagged("screws"), [0, 125, 0]], ["Front cap", tagged("front"), [0, 104, 0]], ["Rotor and shaft", tagged("rotor"), [0, 64, 0]], ["Stator and coils", tagged("stator"), [0, 14, 0]], ["Rear cap and plug", tagged("rear"), [0, 0, 0]]],
    runApart:{ "Screws":[0, 92, 0], "Front cap":[0, 70, 0] }, runView:[.5, .5, 1.0],
    steps:[["Two coils, A and B, wind round eight poles in the stator.", 3.2], ["The driver powers them in turn: A, B, A reversed, B reversed.", 3.2], ["Each pulse pulls the rotor teeth round one step, 1.8°.", 3.2], ["200 steps make one turn. The board counts every one.", 3.2]],
    tick(root, t){ const n = Math.floor(t / .07), ph = n % 2, pol = (n >> 1) % 2;
      root.userData.rotor.rotation.y = -n * 1.8 * Math.PI/180;
      for (const c of root.userData.coils){ const on = c.userData.phase === ph; c.material.emissive.setHex(on ? (pol ? 0x3b7bff : 0xff7a1a) : 0); c.material.emissiveIntensity = on ? 1.1 : 0; } },
    stop(root){ root.userData.rotor.rotation.y = 0; for (const c of root.userData.coils){ c.material.emissive.setHex(0); c.material.emissiveIntensity = 0; } }
  },
  claw:{
    apart:[["Swivel", byName(/^claw_(swivel|cap_eye)$/), [0, 74, 0]], ["Motor block", byName(/^claw_(body|body_screw|cable_tie)$/), [0, 50, 0]], ["Cross plate", byName(/^claw_(cap|cap_ear)$/), [0, 28, 0]],
      ["Linear actuator", byName(/^claw_actuator(_collar|_lead|_rod)?$/), [0, 0, 0]], ["Links", byName(/^claw_link$/), { r:30, y:0 }], ["Arms", root => clawRig(root).arms, { r:58, y:0 }], ["Pivot hub", byName(/^claw_(hub|hub_nut|lug)$/), [0, -46, 0]]],
    steps:[["The rod pulls back in, the hub rises and the three paddles close into a bowl.", 2.42], ["The actuator pushes its rod out and the hub drops. The links are rigid, so the arms swing open.", 2.42],
      ["One actuator, three links: the three arms always move together.", 2.42], ["The grip is set before the play and measured after.", 2.42]],
    tick(root, t){ clawRig(root).set(.55*(.5 + .5*Math.cos(t*1.3))); },
    stop(root){ clawRig(root).set(.55); }
  }
};

const EMBED = new URLSearchParams(location.search).has("embed");
if (EMBED){ document.documentElement.classList.add("embed"); addEventListener("keydown", e => { if (e.key === "Escape") parent.postMessage({ bench:"close" }, location.origin); }); }

/* ---------- the apart and run engine ---------- */
const tagsEl = document.getElementById("tags"), capEl = document.getElementById("cap");
const st = { apart:false, aT:0, run:false, rT:0, mask:0, labels:[] };
const STAG = .16, DUR = .7;
/* resolve the pieces once, with the matrix that turns a move in the part's own frame into a move in each object's parent */
function prep(p){
  const sim = SIM[p.id]; if (!sim || p.pieces) return;
  const root = p.obj, inv = new THREE.Matrix4(); holder.rotation.set(0, 0, 0); holder.position.set(0, 0, 0); root.updateMatrixWorld(true);
  const rinv = root.matrixWorld.clone().invert();
  p.pieces = sim.apart.map(([name, pick, dir]) => {
    const objs = pick(root).map(o => ({ o, home:o.position.clone(), M:inv.copy(o.parent.matrixWorld).invert().multiply(root.matrixWorld).clone(), hr:o.getWorldPosition(new THREE.Vector3()).applyMatrix4(rinv), d:new THREE.Vector3() }));
    const bb = new THREE.Box3(), tb = new THREE.Box3();
    for (const { o } of objs){ o.updateMatrixWorld(true); o.traverse(m => { if (!m.isMesh || !m.visible) return; if (!m.geometry.boundingBox) m.geometry.computeBoundingBox(); tb.copy(m.geometry.boundingBox).applyMatrix4(m.matrixWorld).applyMatrix4(rinv); bb.union(tb); }); }
    let anchor = bb.isEmpty() ? new THREE.Vector3() : bb.getCenter(new THREE.Vector3());
    if (!Array.isArray(dir) && objs.length){ const fb = new THREE.Box3(); objs[0].o.traverse(m => { if (!m.isMesh || !m.visible) return; tb.copy(m.geometry.boundingBox || (m.geometry.computeBoundingBox(), m.geometry.boundingBox)).applyMatrix4(m.matrixWorld).applyMatrix4(rinv); fb.union(tb); }); if (!fb.isEmpty()) anchor = fb.getCenter(new THREE.Vector3()); }
    return { name, dir, objs, anchor, ad:new THREE.Vector3(), k:0 };
  });
}
const dirOf = (dir, at) => Array.isArray(dir) ? new THREE.Vector3(...dir) : new THREE.Vector3(at.x, 0, at.z).normalize().multiplyScalar(dir.r).setY(dir.y);
/* mode "apart": every piece to its place; "run": only the lifts the run asks for; null: all home */
function aim(p, mode){
  const ra = SIM[p.id].runApart || {};
  for (const pc of p.pieces){
    const dir = mode === "apart" ? pc.dir : mode === "run" && ra[pc.name] ? ra[pc.name] : [0, 0, 0];
    pc.ad.copy(dirOf(dir, pc.anchor));
    for (const ob of pc.objs){ const w = ob.hr.clone().add(dirOf(dir, ob.hr)).applyMatrix4(ob.M); ob.d.copy(w).sub(ob.home); }
  }
}
function place(p){ if (p.pieces) for (const pc of p.pieces) for (const ob of pc.objs) ob.o.position.copy(ob.home).addScaledVector(ob.d, pc.k); }
/* fit the camera to the part as it will stand once the pieces have moved */
function fitTo(p, k){
  if (!p.pieces){ frame(p.obj); return; }
  const ks = p.pieces.map(pc => pc.k); p.pieces.forEach(pc => pc.k = k); place(p); frame(p.obj); p.pieces.forEach((pc, i) => pc.k = ks[i]); place(p);
}
function buildLabels(p){
  tagsEl.innerHTML = ""; st.labels = [];
  if (!p.pieces) return;
  for (const pc of p.pieces){ const el = document.createElement("div"); el.className = "bn-pl"; el.innerHTML = `<i></i><span>${pc.name}</span>`; tagsEl.appendChild(el); st.labels.push(el); }
}
const _v = new THREE.Vector3();
function drawLabels(p){
  const w = innerWidth, h = innerHeight, L = [];
  p.pieces.forEach((pc, i) => { const el = st.labels[i], on = st.apart && pc.k > .85; el.classList.toggle("on", on);
    if (!on) return; _v.copy(pc.anchor).addScaledVector(pc.ad, pc.k); p.obj.localToWorld(_v); _v.project(cam);
    L.push({ el, x:(_v.x*.5 + .5)*w, y:(-_v.y*.5 + .5)*h, w:el._w || (el._w = el.offsetWidth || 110) }); });
  /* a few passes of pushing overlapping labels apart, up and down */
  for (let it = 0; it < 14; it++) for (let a = 0; a < L.length; a++) for (let b = a + 1; b < L.length; b++){
    const A = L[a], B = L[b]; if (A.x + A.w + 6 < B.x || B.x + B.w + 6 < A.x) continue;
    const dy = B.y - A.y, need = 30 - Math.abs(dy); if (need <= 0) continue;
    const s = dy >= 0 ? 1 : -1; A.y -= s*need/2; B.y += s*need/2; }
  for (const l of L) l.el.style.transform = `translate(${l.x.toFixed(1)}px,${l.y.toFixed(1)}px)`;
}
function setApart(on){
  const p = cur; if (!p || !p.pieces) return;
  if (on && st.run) setRun(false);
  st.apart = on; document.getElementById("apart").classList.toggle("on", on);
  if (on){ aim(p, "apart"); setView("iso", true); setSpin(false); fitTo(p, 1); view.tR = view.fit * 1.08; }
  else { fitTo(p, 0); view.tR = view.fit; }
}
function setRun(on){
  const p = cur, sim = p && SIM[p.id]; if (!sim) return;
  if (on && st.apart){ st.apart = false; document.getElementById("apart").classList.remove("on"); st.aT = 0; p.pieces.forEach(pc => pc.k = 0); place(p); }
  st.run = on; st.rT = 0; capEl.dataset.i = ""; document.getElementById("run").classList.toggle("on", on); capEl.classList.toggle("on", on);
  document.querySelector("#run span").textContent = on ? "Stop" : "Run";
  if (on){ setSpin(false); st.mask = sim.runApart ? 1 : 0; if (p.pieces) aim(p, "run");
    fitTo(p, st.mask); view.tR = view.fit;
    if (sim.runView){ const [th, ph, z] = sim.runView; view.tTh = th + p.yaw; view.tPh = ph; view.tR = view.fit * z; } }
  else { sim.stop(p.obj); st.mask = 0; fitTo(p, 0); view.tR = view.fit; }
}
function simStep(dt){
  const p = cur; if (!p) return;
  if (p.pieces){
    const n = p.pieces.length, full = STAG*(n - 1) + DUR, want = st.apart || (st.run && st.mask);
    st.aT = Math.max(0, Math.min(full, st.aT + (want ? dt : -dt) * 1.4));
    p.pieces.forEach((pc, i) => { const x = st.run ? Math.min(1, st.aT/DUR) : Math.max(0, Math.min(1, (st.aT - i*STAG)/DUR)); pc.k = x*x*(3 - 2*x); });
    if (!want && st.aT === 0 && !st.run) aim(p, null);
    place(p); drawLabels(p);
  }
  if (st.run){
    const sim = SIM[p.id], T = sim.steps.reduce((a, x) => a + x[1], 0); st.rT += dt; const t = st.rT % T;
    let acc = 0, i = 0; while (i < sim.steps.length - 1 && t >= acc + sim.steps[i][1]){ acc += sim.steps[i][1]; i++; }
    sim.tick(p.obj, st.rT, dt, i, t - acc);
    if (capEl.dataset.i !== String(i)){ capEl.dataset.i = i; capEl.querySelector("b").textContent = `${i + 1} / ${sim.steps.length}`; capEl.querySelector("p").textContent = sim.steps[i][0]; }
    capEl.querySelector("em").style.width = ((t - acc)/sim.steps[i][1]*100).toFixed(1) + "%";
  }
}
document.getElementById("apart").onclick = () => setApart(!st.apart);
document.getElementById("run").onclick = () => setRun(!st.run);

/* ---------- camera: drag to turn, wheel to zoom, slow turn when idle ---------- */
const view = { th:.7, ph:1.0, r:200, tTh:.7, tPh:1.0, tR:200, target:new THREE.Vector3(), tTarget:new THREE.Vector3(), spin:true };
let drag = null;
cv.addEventListener("pointerdown", e => { drag = { x:e.clientX, y:e.clientY }; cv.setPointerCapture(e.pointerId); });
cv.addEventListener("pointermove", e => { if (!drag) return; view.tTh -= (e.clientX - drag.x) * .006; view.tPh = Math.min(1.5, Math.max(.05, view.tPh - (e.clientY - drag.y) * .005)); drag = { x:e.clientX, y:e.clientY }; });
addEventListener("pointerup", () => drag = null);
cv.addEventListener("wheel", e => { e.preventDefault(); view.tR = Math.min(view.fit * 2.2, Math.max(view.fit * .45, view.tR * (1 + Math.sign(e.deltaY) * .1))); }, { passive:false });

const VIEWS = { iso:[.7, 1.0], top:[0, .06], bottom:[0, .06], front:[0, 1.42] };
let cur = null, flip = 0, tFlip = 0;
function setView(v, keep){
  if (!keep && cur && (st.apart || st.run)){ if (st.run) setRun(false); if (st.apart) setApart(false); }
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
  const vf = THREE.MathUtils.degToRad(cam.fov/2), hf = Math.atan(Math.tan(vf) * Math.max(cam.aspect, .1));   // portrait screens: the width is the tight side
  view.fit = s.radius / Math.sin(Math.min(vf, hf)) * (cam.aspect < 1 ? 1.15 : 1.3);
  view.tTarget.set(0, s.center.y * .9, 0); return s;
}
function show(p, instant){
  if (cur && cur !== p){ if (st.run) setRun(false); if (st.apart){ st.apart = false; document.getElementById("apart").classList.remove("on"); } if (cur.pieces){ cur.pieces.forEach(pc => pc.k = 0); place(cur); } st.aT = 0; }
  cur = p; prep(p); buildLabels(p);
  const has = !!SIM[p.id]; document.getElementById("apart").disabled = document.getElementById("run").disabled = !has;
  document.querySelectorAll(".bn-shelf button").forEach(b => b.classList.toggle("on", b.dataset.id === p.id));
  const card = document.getElementById("card"); card.classList.add("swap");
  setTimeout(() => {
    document.getElementById("cKind").textContent = p.kind; document.getElementById("cIcon").src = p.icon; document.getElementById("cNum").textContent = String(PARTS.indexOf(p) + 1).padStart(2, "0") + " / " + String(PARTS.length).padStart(2, "0");
    document.getElementById("cTitle").textContent = p.title; document.getElementById("cLead").textContent = p.lead;
    document.getElementById("cSpecs").innerHTML = p.specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join(""); document.getElementById("cJob").textContent = p.job;
    card.classList.remove("swap");
  }, instant ? 0 : 220);
  holder.children.forEach(c => c.visible = false); p.obj.visible = true; p.drop = instant ? 0 : 1;
  holder.rotation.set(0, 0, 0); flip = tFlip = 0;
  frame(p.obj); setView("iso"); setSpin(true);
  if (instant){ view.th = view.tTh; view.ph = view.tPh; view.r = view.tR; view.target.copy(view.tTarget); }
  if (!EMBED) try { history.replaceState(null, "", "#" + p.id); } catch (e) {}
}

function resize(){
  const w = innerWidth, h = innerHeight; R.setSize(w, h, false); cam.aspect = w/h;
  /* desktop: the card sits on the left, so the part moves right of centre */
  cam.clearViewOffset();   // the part always sits in the middle of the screen
  cam.updateProjectionMatrix();
}
addEventListener("resize", resize);

/* ---------- loop ---------- */
const clock = new THREE.Clock();
let paused = false;   // the anatomy page hides the bench: stop drawing
function tick(){
  if (paused){ clock.getDelta(); requestAnimationFrame(tick); return; }
  const dt = Math.min(clock.getDelta(), .05), k = 1 - Math.exp(-dt * 6);
  if (view.spin && !drag) view.tTh += dt * .18;
  view.th += (view.tTh - view.th) * k; view.ph += (view.tPh - view.ph) * k; view.r += (view.tR - view.r) * k; view.target.lerp(view.tTarget, k);
  flip += (tFlip - flip) * k; simStep(dt);
  if (cur){
    cur.drop = Math.max(0, (cur.drop || 0) - dt * 2.2);
    const e = cur.drop * cur.drop; cur.obj.position.y = e * 40;
    /* bottom view: the part turns over in place, around its own middle */
    const s = frame._s || (frame._s = new THREE.Box3()); holder.rotation.x = flip;
    const hh = cur.h || 0; holder.position.y = Math.sin(flip/2) ** 2 * hh;
  }
  const sp = Math.sin(view.ph); cam.position.set(view.target.x + view.r * sp * Math.sin(view.th), view.target.y + view.r * Math.cos(view.ph), view.target.z + view.r * sp * Math.cos(view.th));
  cam.lookAt(view.target);
  head.position.copy(cam.position); head.target.position.copy(view.target); head.target.updateMatrixWorld();
  R.render(scene, cam); requestAnimationFrame(tick);
}

/* ---------- boot: build all, photograph each for the shelf, then show the one in the URL ---------- */
(async () => {
  resize();
  /* embedded in anatomy: build only the part asked for, no shelf; the parent switches parts through the hash */
  if (EMBED){
    /* #claw opens the part, #claw/apart opens it already taken apart */
    const want = () => { const [id, mode] = location.hash.slice(1).split("/"); return [PARTS.find(p => p.id === id) || PARTS[0], mode]; };
    const open = async ([p, mode], instant) => { if (!p.obj){ p.obj = await p.build(); holder.add(p.obj); p.h = visBox(p.obj).max.y; }
      if (p !== cur) show(p, instant); else { if (st.run) setRun(false); setView("iso"); }
      if (mode === "apart") setTimeout(() => setApart(true), instant ? 350 : 0); else if (mode === "run") setTimeout(() => setRun(true), 350); };
    await open(want(), true);
    addEventListener("hashchange", () => open(want(), true));
    addEventListener("message", e => { if (e.origin === location.origin && e.data && e.data.bench === "open"){ paused = false; history.replaceState(null, "", "#" + e.data.id); open(want(), true); } if (e.origin === location.origin && e.data && e.data.bench === "pause"){ if (st.run) setRun(false); paused = true; } });
    tick();
    document.getElementById("boot").classList.add("gone");
    window.__bench = { PARTS, show, setView, view };
    return;
  }
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
