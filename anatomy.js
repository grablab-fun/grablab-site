/* ============ ANATOMY : Prototype 01, exploded and interactive ============
   The machine is modelled part by part from the bill of materials and the build tutorial (anatomy-model.js).
   Three.js, self-hosted. An optional pixel post shader posterises to the Grablab palette. */
import * as THREE from "./assets/vendor/three.module.min.js";
import { buildMachine } from "./anatomy-model.js?v=2";

const $ = s => document.querySelector(s);
const PARTS = [
  { id:"frame", n:"01", name:"Frame", spec:"40 x 40 timber, matte black", ph:1.12, th:.95, anchor:[-.48,-.48,.7], ex:[0,0,0],
    text:"Four 1000 mm posts, a square of 920 mm rails at the bottom and one on top, two floor rails with their top at 400 mm. Joined with 16 steel angle brackets, on rubber feet.",
    subs:[["4 posts, 1000 mm", -.48,-.48,.6], ["Top and bottom squares", 0,-.48,1.02], ["Floor rails, top at 400", .48,0,.38], ["16 angle brackets", -.44,-.46,.02], ["Rubber feet", .48,.48,-.004]], proof:"Built from the parts list" },
  { id:"cage", n:"02", name:"Floor and walls", spec:"MDF 12 mm, acrylic 3 mm", ph:1.0, th:.95, anchor:[-.3,-.3,.412], ex:[0,0,.2],
    text:"One 1000 x 1000 sheet of 12 mm MDF on the floor rails, with a 120 mm square hole front right. Acrylic on the front and both sides, from 400 to 1000. The back stays open for service.",
    subs:[["MDF floor, 12 mm", -.2,.2,.412], ["Prize hole, 120 x 120", .34,-.34,.412], ["Acrylic front, 3 mm", 0,-.502,.75], ["Acrylic sides", -.502,0,.75]], proof:"Watched by the play camera" },
  { id:"panel", n:"03", name:"Rear panel", spec:"E-stop, scan to play, GRABLAB", ph:1.32, th:-1.57, anchor:[.05,.513,.19], ex:[0,.5,0],
    text:"MDF, 1000 x 300, screwed to the rear posts under the floor. Outside: the red E-stop, the QR you scan to play, the GRABLAB plate. Inside: every board, on one wall you can reach.",
    subs:[["E-stop, 22 mm", -.35,.53,.22], ["Scan to play QR", -.23,.515,.2], ["GRABLAB plate", .05,.515,.19], ["MDF 1000 x 300", .38,.512,.08]], proof:"No joystick. Browser only" },
  { id:"electronics", n:"04", name:"Electronics", spec:"Pi 4, OPTIGA Trust M, UNO + CNC Shield", ph:1.36, th:1.57, anchor:[.04,.47,.145], ex:[0,.28,0],
    text:"12 V 10 A supply, two Wago blocks, Arduino UNO with a CNC Shield and four A4988, an L298N for the claw, 12 V to 5 V, and the Pi case. Inside it, the Raspberry Pi 4 runs the play and the stream, and the OPTIGA Trust M Express signs every event. Its key never leaves the chip.",
    subs:[["OPTIGA Trust M Express", .04,.47,.145], ["Raspberry Pi 4", .07,.484,.17], ["Pi case, 30 mm fan", .078,.465,.17], ["12 V 10 A supply", -.36,.458,.084], ["UNO + CNC Shield", -.21,.478,.12], ["4 x A4988", -.2,.466,.124], ["L298N claw driver", -.13,.473,.112], ["12 V to 5 V", -.08,.484,.115], ["Wago 221 blocks", -.297,.49,.24]], proof:"Signed on peaqOS", logo:"assets/brand/partners/peaq-white.svg", href:"https://peaq.xyz" },
  { id:"chute", n:"05", name:"Chute and cup", spec:"E3JK beam, C960, ACR122U, MG90S", ph:1.22, th:.4, anchor:[.412,-.34,.3], ex:[.32,-.36,0],
    text:"A 12 mm MDF box under the hole, 120 x 120 inside and 250 deep. The E3JK beam crosses it 30 mm below the floor and the C960 watches the flap. The capsule stops on the printed tray over the ACR122U, the UID is read, then the MG90S tips the flap into the cup behind the door.",
    subs:[["MDF chute, 250 deep", .412,-.34,.3], ["E3JK beam pair", .433,-.34,.37], ["C960 cup camera", .31,-.40,.37], ["ACR122U on printed tray", .34,-.34,.118], ["Flap on a 3 mm axle", .34,-.33,.14], ["MG90S + pushrod", .406,-.34,.13], ["Refill door, magnetic catch", .3,-.512,.22], ["Cup floor", .4,-.42,.091]], proof:"Seen twice: beam and camera" },
  { id:"capsules", n:"06", name:"Capsules", spec:"clear shells, NTAG215 sticker", ph:1.0, th:.95, anchor:[.2,.2,.44], ex:[0,0,.42],
    text:"Clear two piece shells with an NTAG215 sticker, factory UID, read only. The size is not fixed yet: first we test what the claw can lift and hold, then the shells are bought or printed to fit that grip. Click one.",
    subs:[["Clear two piece shell", 0,-.1,.44], ["NTAG215 sticker", -.2,.1,.43], ["Size set by the grip test", .2,.2,.45]], proof:"Inventory on chain", logo:"assets/chains/solana.jpg", href:"https://solana.com" },
  { id:"gantry", n:"07", name:"Gantry", spec:"2020 + 2040 V-slot, three NEMA 17", ph:1.0, th:2.2, anchor:[.48,-.2,1.06], ex:[0,0,.6],
    text:"Two 2020 rails on the side rails, one 2040 beam on edge riding two Matik carriages on POM wheels. GT2 6 mm belts, a NEMA 17 at the back of each rail and one at the left end of the beam, idlers at the far ends, X and Y end stops, a drag chain to the carriage.",
    subs:[["2020 Y rails", -.48,-.2,1.06], ["2040 X beam, on edge", .2,.05,1.112], ["Matik carriage, POM wheels", .48,.05,1.07], ["NEMA 17, Y1 and Y2", .47,.54,1.09], ["NEMA 17, X", -.545,.04,1.12], ["GT2 belts + idlers", .51,-.3,1.077], ["End stops X + Y", -.42,.05,1.12], ["Drag chain", -.3,.05,1.16]], proof:"Position known to the step" },
  { id:"winch", n:"08", name:"Carriage and winch", spec:"Matik X carriage, NEMA 17, printed spool", ph:1.15, th:1.15, chain:["gantry"], anchor:[.05,-.0075,1.1], ex:[0,-.22,.12],
    text:"The X carriage rides the beam on four POM wheels. A 65 x 65 printed mount hangs a NEMA 17 under it, shaft down. A 30 mm spool winds the 2 mm Dyneema and the Z end stop sits under the spool. Two Wagos join the claw's coil cable to the 4 core in the chain.",
    subs:[["X carriage, 4 POM wheels", .05,.05,1.124], ["Winch mount, 65 x 65", .05,-.0025,1.129], ["NEMA 17, shaft down", .029,-.0075,1.1], ["30 mm spool, Dyneema", .05,-.03,1.06], ["Z end stop", .064,-.033,1.03], ["Wago joints", .067,.071,1.135], ["X belt clip", .05,.095,1.1]], proof:"Same depth every play" },
  { id:"claw", n:"09", name:"Claw", spec:"RolRah body, Justech 12 V actuator", ph:1.1, th:1.2, chain:["gantry","winch"], anchor:[.096,-.0075,.72], ex:[0,0,-.2], skip:["claw_coil_cable","claw_line"],
    text:"The RolRah printed claw: a cap with an eye on the swivel, a hex body, three fingers on MR63ZZ bearings and 3 mm rods. Inside, a Justech 12 V linear actuator with 30 mm of stroke drives the spreader. The coil cable is tied to the body and climbs to the carriage.",
    subs:[["Swivel on Dyneema", .066,-.0075,.81], ["Cap with eye", .066,-.0075,.78], ["Justech actuator, 30 mm", .094,-.0075,.73], ["3 fingers, MR63ZZ", .113,-.0075,.62], ["Coil cable", .084,.024,.9], ["Grip pads", .083,-.0075,.563]], proof:"Grip measured before you play" },
  { id:"camera", n:"10", name:"Play camera", spec:"Logitech C920 on a 60 mm block", ph:1.25, th:-.55, anchor:[-.44,-.44,.93], ex:[-.15,-.15,.1],
    text:"A Logitech C920 clipped under a 60 x 60 MDF block in the front left corner, tilted 45 degrees down over the floor. Its picture is the stream you play from.",
    subs:[["C920, 1080p", -.44,-.44,.93], ["60 x 60 MDF block", -.44,-.44,.98], ["USB down the post", -.455,-.455,.7]], proof:"The stream you play" }
];
const byId = id => PARTS.find(p => p.id === id);
const ICON = { frame:"assets/parts/post.png", cage:"assets/parts/mdf.png", panel:"assets/parts/estop.png", electronics:"assets/parts/optiga.png", chute:"assets/parts/funnel.png", capsules:"assets/parts/capsule.png", gantry:"assets/parts/rail.png", winch:"assets/parts/spool.png", claw:"assets/parts/claw.png", camera:"assets/parts/webcam.png" };
const SUBICON = {
  "4 posts, 1000 mm":"assets/parts/post.png", "Top and bottom squares":"assets/parts/framering.png", "Floor rails, top at 400":"assets/parts/framering.png", "16 angle brackets":"assets/parts/bracket.png", "Rubber feet":"assets/parts/foot.png",
  "MDF floor, 12 mm":"assets/parts/mdf.png", "Prize hole, 120 x 120":"assets/parts/opening.png", "Acrylic front, 3 mm":"assets/parts/guard.png", "Acrylic sides":"assets/parts/guard.png",
  "E-stop, 22 mm":"assets/parts/estop.png", "Scan to play QR":"assets/parts/qr.png", "GRABLAB plate":"assets/brand/mark-chrome-256.png", "MDF 1000 x 300":"assets/parts/mdf.png",
  "OPTIGA Trust M Express":"assets/parts/optiga.png", "Raspberry Pi 4":"assets/parts/pi.png", "Pi case, 30 mm fan":"assets/parts/fan.png", "12 V 10 A supply":"assets/parts/psu.png", "UNO + CNC Shield":"assets/parts/motionboard.png",
  "4 x A4988":"assets/parts/motionboard.png", "L298N claw driver":"assets/parts/clawdriver.png", "12 V to 5 V":"assets/parts/relay.png", "Wago 221 blocks":"assets/parts/wago.png",
  "MDF chute, 250 deep":"assets/parts/funnel.png", "E3JK beam pair":"assets/parts/beam.png", "C960 cup camera":"assets/parts/webcam.png", "ACR122U on printed tray":"assets/parts/nfcreader.png", "Flap on a 3 mm axle":"assets/parts/ramp.png",
  "MG90S + pushrod":"assets/parts/servo.png", "Refill door, magnetic catch":"assets/parts/drawer.png", "Cup floor":"assets/parts/mdf.png",
  "Clear two piece shell":"assets/parts/capsule.png", "NTAG215 sticker":"assets/parts/nfcsticker.png", "Size set by the grip test":"assets/parts/capsuleopen.png",
  "2020 Y rails":"assets/parts/rail.png", "2040 X beam, on edge":"assets/parts/beam2040.png", "Matik carriage, POM wheels":"assets/parts/bracket.png", "NEMA 17, Y1 and Y2":"assets/parts/nema17.png", "NEMA 17, X":"assets/parts/nema17.png",
  "GT2 belts + idlers":"assets/parts/belt.png", "End stops X + Y":"assets/parts/endstop.png", "Drag chain":"assets/parts/dragchain.png",
  "X carriage, 4 POM wheels":"assets/parts/rail.png", "Winch mount, 65 x 65":"assets/parts/bracket.png", "NEMA 17, shaft down":"assets/parts/nema17.png", "30 mm spool, Dyneema":"assets/parts/spool.png", "Z end stop":"assets/parts/endstop.png",
  "Wago joints":"assets/parts/wago.png", "X belt clip":"assets/parts/belt.png",
  "Swivel on Dyneema":"assets/parts/swivel.png", "Cap with eye":"assets/parts/collar.png", "Justech actuator, 30 mm":"assets/parts/actuator.png", "3 fingers, MR63ZZ":"assets/parts/claw.png", "Coil cable":"assets/parts/coil.png", "Grip pads":"assets/parts/tips.png",
  "C920, 1080p":"assets/parts/webcam.png", "60 x 60 MDF block":"assets/parts/mdf.png", "USB down the post":"assets/parts/gland.png" };

const PAL = [[.047,.051,.098],[.094,.09,.188],[.192,.161,.31],[.33,.27,.42],[.545,.475,.576],[.855,.843,.847],[1,.824,.478],[.788,.714,1],[.231,.482,1],[.122,.31,.82]];

const stage = $("#stage"), canvas = $("#view");
let renderer;
try {
  const probe = document.createElement("canvas"); if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) throw new Error("no webgl");
  renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true, powerPreference:"high-performance" });
} catch (e){
  /* WebGL off (Brave Shields "strict" fingerprinting, hardware acceleration off, old GPU): say so instead of spinning forever */
  stage.classList.add("err"); throw e;
}
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = false;
const scene = new THREE.Scene(); scene.background = null; const PIXBG = new THREE.Color(0x0a0c1a);
const camera = new THREE.PerspectiveCamera(32, 1, .05, 40);
const root = new THREE.Group(); root.rotation.x = -Math.PI/2; scene.add(root);   // z-up scene into y-up three

/* ---------- lights ---------- */
scene.add(new THREE.HemisphereLight(0xc3caff, 0x141830, 1.3));
const key = new THREE.DirectionalLight(0xf3f5ff, 2.5); key.position.set(-1.4, 2.6, 2.2); scene.add(key);
key.castShadow = false; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -.0004; key.shadow.normalBias = .02;
Object.assign(key.shadow.camera, { left:-1.7, right:1.7, top:1.9, bottom:-1.3, near:.5, far:8 });
/* shadow catcher under the machine: the only thing the floor does */
const catcher = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.ShadowMaterial({ opacity:.55 })); catcher.receiveShadow = true; catcher.rotation.x = -Math.PI/2; catcher.position.y = .004; scene.add(catcher);
const rim = new THREE.DirectionalLight(0x6f8dff, 2.4); rim.position.set(2.2, 1.4, -2.4); scene.add(rim);
const fill = new THREE.PointLight(0xffb877, 2.0, 3.5); fill.position.set(.1, 1.0, .1); scene.add(fill);

/* ---------- environment: a tiny painted studio cube, so metals have something to reflect ---------- */
(function env(){
  const faces = []; const N = 64;
  for (let f = 0; f < 6; f++){
    const cv = document.createElement("canvas"); cv.width = cv.height = N; const g = cv.getContext("2d");
    const grad = g.createLinearGradient(0, 0, 0, N);
    if (f === 2){ grad.addColorStop(0, "#e9eeff"); grad.addColorStop(1, "#7d86c8"); }                 // +y: warm ceiling light
    else if (f === 3){ grad.addColorStop(0, "#0b0d1c"); grad.addColorStop(1, "#05060e"); }            // -y: dark floor
    else { grad.addColorStop(0, "#6f78c4"); grad.addColorStop(.55, "#1c2048"); grad.addColorStop(1, "#07081a"); }
    g.fillStyle = grad; g.fillRect(0, 0, N, N);
    if (f === 0 || f === 4){ g.fillStyle = "rgba(236,242,255,.8)"; g.fillRect(N*.3, N*.08, N*.4, N*.34); }   // two softboxes
    if (f === 1){ g.fillStyle = "rgba(120,160,255,.7)"; g.fillRect(N*.1, N*.15, N*.25, N*.5); }               // a blue rim
    faces.push(cv);
  }
  const ct = new THREE.CubeTexture(faces); ct.colorSpace = THREE.SRGBColorSpace; ct.needsUpdate = true;
  scene.environment = ct; scene.environmentIntensity = .55;
})();

/* ---------- the machine: built from the BOM and the build tutorial (anatomy-model.js), one group per part ---------- */
const matCache = new Map(), ents = new Map();
const capsules = [], mech = {};
async function load(){
  const fonts = document.fonts ? Promise.all(["700 100px 'Clash Display'", "700 40px 'Satoshi'", "500 40px 'Satoshi'", "800 40px 'Satoshi'"].map(f => document.fonts.load(f))).catch(() => {}) : Promise.resolve();
  /* every material is keyed part|name, so shade() can isolate a part */
  const mat = (part, key, o, phys) => {
    const k = part + "|" + key; if (matCache.has(k)) return matCache.get(k);
    const m = phys ? new THREE.MeshPhysicalMaterial(o) : new THREE.MeshStandardMaterial(o);
    if (!o.emissive && !o.map){ m.emissive = m.color.clone(); m.emissiveIntensity = 0; }
    m.userData.base = { opacity:m.opacity, ei:m.emissiveIntensity || 0 }; matCache.set(k, m); return m;
  };
  const M = buildMachine(THREE, { mat, onFont:cb => fonts.then(cb) });
  for (const [id, g] of Object.entries(M.parts)){ root.add(g); ents.set(id, g); }
  M.capsules.forEach(o => { o.userData.home = o.position.clone(); o.userData.spread = new THREE.Vector3(o.position.x*.22, o.position.y*.22, 0); capsules.push(o); });
  for (const p of PARTS){ p.objs = [ents.get(p.id)].filter(Boolean); p.objs.forEach(o => { o.userData.home = o.position.clone(); }); }
  /* each part's real bounds in machine space (cables that leave the part are not part of its frame) */
  root.updateMatrixWorld(true); const inv = root.matrixWorld.clone().invert(), mm = new THREE.Matrix4();
  for (const p of PARTS){ p.lbox = new THREE.Box3();
    for (const o of p.objs) o.traverse(m => { if (!m.isMesh || m.userData.part !== p.id || (p.skip && p.skip.includes(m.name))) return;
      m.geometry.computeBoundingBox(); p.lbox.union(m.geometry.boundingBox.clone().applyMatrix4(mm.multiplyMatrices(inv, m.matrixWorld))); }); }
}
/* connectivity: every mesh must touch another one, and the whole machine must hang off the frame.
   Plain meshes use their world box; cables (tubes) are sampled along their path, and both ends must land on something. */
function check(tol = .0015){
  const prevE = explodeTarget; explode = explodeTarget = 0; applyExplode(); root.updateMatrixWorld(true);
  const items = [];
  root.traverse(o => { if (!o.isMesh) return;
    const g = o.geometry; let boxes;
    if (g.type === "TubeGeometry"){ const P = g.parameters.path, r = g.parameters.radius, L = P.getLength(), k = Math.max(4, Math.ceil(L/.01)); boxes = [];
      for (let i = 0; i <= k; i++){ const v = P.getPointAt(i/k).applyMatrix4(o.matrixWorld); boxes.push(new THREE.Box3().setFromCenterAndSize(v, new THREE.Vector3(2*r, 2*r, 2*r))); } }
    else { g.computeBoundingBox(); boxes = [g.boundingBox.clone().applyMatrix4(o.matrixWorld)]; }
    items.push({ o, boxes, tube:g.type === "TubeGeometry", part:o.userData.part, name:o.name }); });
  const hit = (a, b) => { for (const x of a.boxes){ const e = x.clone().expandByScalar(tol); for (const y of b.boxes) if (e.intersectsBox(y)) return true; } return false; };
  const adj = items.map(() => []);
  /* broad phase on the overall boxes */
  const all = items.map(it => it.boxes.reduce((u, b) => u.union(b), new THREE.Box3()).expandByScalar(tol));
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++){ if (!all[i].intersectsBox(all[j])) continue; if (hit(items[i], items[j])){ adj[i].push(j); adj[j].push(i); } }
  const seen = new Set(), q = []; items.forEach((it, i) => { if (it.name === "frame_post" || it.name === "frame_foot"){ seen.add(i); q.push(i); } });
  while (q.length){ const i = q.shift(); for (const j of adj[i]) if (!seen.has(j)){ seen.add(j); q.push(j); } }
  const floating = items.filter((it, i) => !seen.has(i)).map(it => it.part + ":" + it.name);
  /* a cable end must touch something other than the cable */
  const looseEnds = [];
  items.forEach((it, i) => { if (!it.tube) return; for (const end of [it.boxes[0], it.boxes[it.boxes.length - 1]]){
    const e = end.clone().expandByScalar(tol); const ok = items.some((jt, j) => j !== i && jt.boxes.some(b => e.intersectsBox(b))); if (!ok) looseEnds.push(it.part + ":" + it.name); } });
  explodeTarget = prevE;
  const count = {}; for (const f of floating) count[f] = (count[f] || 0) + 1;
  return { meshes:items.length, connected:seen.size, floating:Object.entries(count).map(([k, v]) => v > 1 ? k + " x" + v : k), looseEnds };
}

/* ---------- pixel post: low-res target + depth, palette quantise, dither, outlines ---------- */
const rt = new THREE.WebGLRenderTarget(2, 2, { minFilter:THREE.NearestFilter, magFilter:THREE.NearestFilter, depthTexture:new THREE.DepthTexture(2, 2) });
const post = new THREE.ShaderMaterial({
  uniforms:{ tex:{ value:rt.texture }, dep:{ value:rt.depthTexture }, px:{ value:new THREE.Vector2() }, near:{ value:camera.near }, far:{ value:camera.far }, pal:{ value:PAL.flat() }, pixel:{ value:1 }, t:{ value:0 } },
  vertexShader:`varying vec2 v; void main(){ v = uv; gl_Position = vec4(position.xy, 0., 1.); }`,
  fragmentShader:`precision highp float; varying vec2 v; uniform sampler2D tex, dep; uniform vec2 px; uniform float near, far, pixel, t; uniform float pal[30];
    vec3 aces(vec3 x){ return clamp((x*(2.51*x + .03))/(x*(2.43*x + .59) + .14), 0., 1.); }
    float lin(float z){ float n = 2.*z - 1.; return (2.*near*far)/(far + near - n*(far - near)); }
    float lum(vec3 c){ return dot(c, vec3(.299,.587,.114)); }
    float bayer(vec2 p){ int x = int(mod(p.x, 4.)), y = int(mod(p.y, 4.)); int i = x + y*4;
      float m[16]; m[0]=0.;m[1]=8.;m[2]=2.;m[3]=10.;m[4]=12.;m[5]=4.;m[6]=14.;m[7]=6.;m[8]=3.;m[9]=11.;m[10]=1.;m[11]=9.;m[12]=15.;m[13]=7.;m[14]=13.;m[15]=5.;
      for (int k = 0; k < 16; k++) if (k == i) return m[k]/16.; return 0.; }
    void main(){
      /* the target holds linear light: tone map and gamma here, the renderer only does that for the screen */
      vec3 c = pow(aces(texture2D(tex, v).rgb*1.1), vec3(1./2.2));
      if (pixel < .5){ gl_FragColor = vec4(c, 1.); return; }
      float d = lin(texture2D(dep, v).r);
      float e = 0.; vec2 o[4]; o[0] = vec2(px.x, 0.); o[1] = vec2(-px.x, 0.); o[2] = vec2(0., px.y); o[3] = vec2(0., -px.y);
      for (int i = 0; i < 4; i++){ float dn = lin(texture2D(dep, v + o[i]).r); e = max(e, abs(dn - d)/max(d, .2)); e = max(e, abs(lum(pow(aces(texture2D(tex, v + o[i]).rgb*1.1), vec3(1./2.2))) - lum(c))*1.4); }
      float edge = smoothstep(.06, .16, e);
      /* posterise: 6 brightness steps with ordered dither, then pull the colour toward the nearest palette entry */
      float b = bayer(gl_FragCoord.xy) - .5;
      vec3 q = floor(c*8. + b*.9)/8.;
      float best = 9.; vec3 pc = q;
      for (int i = 0; i < 10; i++){ vec3 p = vec3(pal[i*3], pal[i*3+1], pal[i*3+2]); float dd = distance(p, q); if (dd < best){ best = dd; pc = p; } }
      vec3 outc = mix(q, pc, .22);
      outc = mix(outc, vec3(.04,.045,.09), edge*.7);
      gl_FragColor = vec4(outc, 1.);
    }`
});
const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post), postScene = new THREE.Scene(), postCam = new THREE.Camera(); postScene.add(quad);
let pixel = false, PX = 3;
function resize(){
  const w = stage.clientWidth, h = stage.clientHeight; renderer.setPixelRatio(pixel ? 1 : Math.min(2, devicePixelRatio || 1)); renderer.setSize(w, h, false); camera.aspect = w/h; camera.updateProjectionMatrix();
  const rw = Math.max(240, Math.round(w/PX)), rh = Math.max(135, Math.round(h/PX)); rt.setSize(rw, rh); post.uniforms.px.value.set(1/rw, 1/rh);
}
addEventListener("resize", resize);

/* ---------- orbit: drag, wheel, inertia, idle auto spin ---------- */
const orb = { th:.95, ph:1.12, r:3.0, tx:0, ty:.52, tz:0, vth:0, vph:0, down:false, pan:false, px:0, py:0, pz:0, lx:0, ly:0, idle:0, zoom:1 };
const tgt = new THREE.Vector3();
function cam(){
  const sp = Math.sin(orb.ph), c = Math.cos(orb.ph), r = orb.r*orb.zoom;
  const tx = orb.tx + orb.px, ty = orb.ty + orb.py, tz = orb.tz + orb.pz;
  camera.position.set(tx + r*sp*Math.cos(orb.th), ty + r*c, tz + r*sp*Math.sin(orb.th));
  tgt.set(tx, ty, tz); camera.lookAt(tgt);
}
/* left button orbits, right button pans the view */
stage.addEventListener("contextmenu", e => e.preventDefault());
stage.addEventListener("pointerdown", e => { orb.down = e.button !== 2; orb.pan = e.button === 2; orb.phT = null; orb.thT = null; orb.lx = e.clientX; orb.ly = e.clientY; orb.idle = 0; stage.setPointerCapture(e.pointerId); });
stage.addEventListener("pointermove", e => { mouse.x = (e.clientX - stage.getBoundingClientRect().left)/stage.clientWidth*2 - 1; mouse.y = -((e.clientY - stage.getBoundingClientRect().top)/stage.clientHeight)*2 + 1;
  if (orb.pan){ const dx = e.clientX - orb.lx, dy = e.clientY - orb.ly; orb.lx = e.clientX; orb.ly = e.clientY; const k = orb.r*orb.zoom*.00045, m = camera.matrixWorld.elements;
    orb.px += (-dx*m[0] + dy*m[4])*k; orb.py += (-dx*m[1] + dy*m[5])*k; orb.pz += (-dx*m[2] + dy*m[6])*k; return; }
  if (!orb.down) return; orb.vth = (e.clientX - orb.lx)*.006; orb.vph = (e.clientY - orb.ly)*.006; orb.lx = e.clientX; orb.ly = e.clientY; orb.th += orb.vth; orb.ph = Math.min(1.5, Math.max(.35, orb.ph + orb.vph)); orb.moved = (orb.moved || 0) + Math.abs(orb.vth) + Math.abs(orb.vph); });
stage.addEventListener("pointerup", () => { orb.down = false; orb.pan = false; });
stage.addEventListener("wheel", e => { e.preventDefault(); orb.zoom = Math.min(2.4, Math.max(.45, orb.zoom*(1 + Math.sign(e.deltaY)*.08))); orb.idle = 0; }, { passive:false });
/* where the camera wants to be: the whole machine, or the selected part framed */
const sph = new THREE.Sphere();
function goal(){
  if (selectedCap){ selectedCap.getWorldPosition(tmpV); return { tx:tmpV.x, ty:tmpV.y + .015, tz:tmpV.z, r:.2 }; }
  if (selected){ partBox(selected, box);
    if (!box.isEmpty()){
      box.getCenter(ctr); box.expandByScalar(.03);
      /* distance that keeps every box corner inside both the vertical and the horizontal field of view */
      const sp = Math.sin(orb.ph), c = Math.cos(orb.ph), dir = new THREE.Vector3(-sp*Math.cos(orb.th), -c, -sp*Math.sin(orb.th)).normalize();
      const right = new THREE.Vector3().crossVectors(dir, camera.up).normalize(), up2 = new THREE.Vector3().crossVectors(right, dir);
      const tv = Math.tan(THREE.MathUtils.degToRad(camera.fov)/2), th = tv*camera.aspect; let D = 0;
      for (let i = 0; i < 8; i++){ tmpV.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z).sub(ctr);
        const x = Math.abs(tmpV.dot(right)), y = Math.abs(tmpV.dot(up2)), z = tmpV.dot(dir); D = Math.max(D, Math.max(x/th, y/tv) - z); }
      return { tx:ctr.x, ty:ctr.y, tz:ctr.z, r:Math.max(.42, D*1.18) };
    } }
  return { tx:0, ty:.52 + .55*explode, tz:0, r:3.0*(1 + .62*explode) };
}
function easeCam(dt){ const g = goal(), k = Math.min(1, dt*3.2); if (orb.phT != null){ orb.ph += (orb.phT - orb.ph)*k; if (Math.abs(orb.phT - orb.ph) < .002) orb.phT = null; }
  if (orb.thT != null){ let d = ((orb.thT - orb.th + Math.PI) % (2*Math.PI) + 2*Math.PI) % (2*Math.PI) - Math.PI; orb.th += d*k; if (Math.abs(d) < .002) orb.thT = null; } orb.tx += (g.tx - orb.tx)*k; orb.ty += (g.ty - orb.ty)*k; orb.tz += (g.tz - orb.tz)*k; orb.r += (g.r - orb.r)*k; }

/* ---------- explode, selection, labels ---------- */
let explode = 0, explodeTarget = 0, selected = null, hovered = null, tour = null, selectedCap = null, animCap = null, openK = 0, capHover = null, lastHitCap = null;
const ray = new THREE.Raycaster(), mouse = new THREE.Vector2(-2, -2);
const ex = $("#explode"), card = $("#card"), list = $("#parts"), labels = $("#labels"), lines = $("#lines");
ex.addEventListener("input", () => { explodeTarget = +ex.value/100; if (tour) stopTour(); });
function setExplode(v){ explodeTarget = v; ex.value = Math.round(v*100); }
function applyExplode(){
  const E = explode;
  for (const p of PARTS){ const off = offOf(p); for (const o of p.objs){ o.position.copy(o.userData.home); o.position.x += off[0]; o.position.y += off[1]; o.position.z += off[2]; } }
  /* selected part lifts a little more, others step back */
  if (selected) for (const o of selected.objs) o.position.z += .09*liftK;
  for (const c of capsules){ c.position.copy(c.userData.home).addScaledVector(c.userData.spread, E); }
  /* long cables run between parts: shown only while the machine is together */
  const wr = ents.get("wiring"); if (wr) wr.visible = E < .04;
}
let liftK = 0;
function setSelected(p, fromList){
  selected = p; liftK = 0; selectedCap = null; orb.phT = p && p.ph ? p.ph : null; orb.thT = p && p.th != null ? p.th : null; orb.zoom = 1; orb.px = orb.py = orb.pz = 0;
  for (const li of list.children) li.classList.toggle("on", !!p && li.dataset.id === p.id);
  if (p){
    card.innerHTML = `<span class="n">${p.n} / ${String(PARTS.length).padStart(2, "0")}</span><h3>${p.name}</h3><p>${p.text}</p><div class="inside">${p.subs.map(x => `<span><img src="${SUBICON[x[0]] || ICON[p.id]}" alt="" />${x[0]}</span>`).join("")}</div>${p.logo ? `<a class="proof" href="${p.href}" target="_blank" rel="noopener"><img src="${p.logo}" alt="" />${p.proof}</a>` : `<span class="proof"><img src="assets/parts/shield.png" alt="" />${p.proof}</span>`}<div class="cnav"><button type="button" data-prev>&larr;</button><button type="button" data-next>&rarr;</button></div><button class="x" type="button" aria-label="Close">&times;</button>`;

    card.classList.add("on"); wireCard();
    if (explodeTarget < .5 && !tour) setExplode(.72);
  } else card.classList.remove("on");
  if (!fromList && !tour) orb.idle = 0;
}
function wireCard(){
  card.querySelector(".x").onclick = () => setSelected(null);
  const i = selected ? PARTS.indexOf(selected) : -1;
  card.querySelector("[data-prev]").onclick = () => setSelected(PARTS[(i + PARTS.length - 1) % PARTS.length], true);
  card.querySelector("[data-next]").onclick = () => setSelected(PARTS[(i + 1) % PARTS.length], true);
}
for (const p of PARTS){
  const li = document.createElement("button"); li.type = "button"; li.className = "pt"; li.dataset.id = p.id;
  li.innerHTML = `<img class="th" alt="" /><span class="nm"><b>${p.name}</b><small>${p.spec}</small></span><i class="dot">${p.n}</i>`;
  li.onmouseenter = () => { hovered = p; }; li.onmouseleave = () => { hovered = null; };
  li.onclick = () => { setSelected(selected === p ? null : p, true); if (tour) stopTour(); };
  list.appendChild(li);
}
stage.addEventListener("click", () => { if (orb.moved > .02){ orb.moved = 0; return; } orb.moved = 0; const p = pick(); if (tour) stopTour();
  if (p && p.id === "capsules" && lastHitCap){ if (lastHitCap === selectedCap) setSelected(null); else selectCap(lastHitCap); return; }
  setSelected(p && p !== selected ? p : null); });
function pick(){
  ray.setFromCamera(mouse, camera); const hits = ray.intersectObjects(root.children, true); lastHitCap = null;
  for (const h of hits){
    if (!h.object.visible || (h.object.material && !h.object.material.visible)) continue;
    const id = h.object.userData.part; const p = PARTS.find(q => q.id === id); if (!p) continue;
    if (id === "capsules"){ let o = h.object; while (o && !o.userData.cap) o = o.parent; lastHitCap = o || null; }
    return p;
  }
  return null;
}
const CAPSUBS = [["NTAG215 sticker, factory UID", 0, -.0157, -.0197], ["Prize lives on the UID", 0, 0, 0], ["Two clear halves, sized to the grip", 0, .006, .026]];
function selectCap(o){
  selectedCap = o; animCap = o; selected = byId("capsules"); liftK = 0;
  for (const li of list.children) li.classList.toggle("on", li.dataset.id === "capsules");
  const num = o.name.replace("capsule_", "");
  card.innerHTML = `<span class="n">Capsule #${num}</span><h3>Custom NFC capsule</h3>
    <p>NTAG215 sticker on the shell, factory UID. The prize is whatever the project loads: an SPL token, an NFT, a tokenized stock, merch, an off chain code. Mapped to the UID in the published inventory.</p>
    <div class="inside"><span><img src="assets/sub/token.png" alt="" />SPL token</span><span><img src="assets/parts/nft.png" alt="" />NFT</span><span><img src="assets/parts/stock.png" alt="" />Tokenized stock</span><span><img src="assets/parts/merch.png" alt="" />Merch</span><span><img src="assets/parts/voucher.png" alt="" />Off chain code</span><span><img src="assets/parts/gift.png" alt="" />Anything else</span></div>
    <a class="proof" href="https://solana.com" target="_blank" rel="noopener"><img src="assets/chains/solana.jpg" alt="" />UID published in the inventory</a><div class="cnav"><button type="button" data-prev>&larr;</button><button type="button" data-next>&rarr;</button></div><button class="x" type="button" aria-label="Close">&times;</button>`;
  wireCard(); card.classList.add("on");
}
/* hover outline: the hovered part is redrawn as an inflated back-face silhouette in chrome blue */
const outlineMat = new THREE.MeshBasicMaterial({ color:0x7fb0ff, side:THREE.BackSide, toneMapped:false });
const maskMat = new THREE.MeshBasicMaterial({ colorWrite:false });
const outlineScene = new THREE.Scene(); const outlineMeshes = new Map(); const kv = new THREE.Vector3();
function outlinePass(){
  const want = hovered && !selected && !orb.down && !tour ? hovered : null;
  for (const [src, o] of outlineMeshes){ if (!want || src.userData.part !== want.id){ outlineScene.remove(o); outlineMeshes.delete(src); } }
  if (!want) return false;
  for (const ob of want.objs) ob.traverse(m => {
    if (!m.isMesh || m.userData.part !== want.id || !m.visible) return;
    let o = outlineMeshes.get(m); if (!o){ o = new THREE.Mesh(m.geometry, outlineMat); outlineMeshes.set(m, o); outlineScene.add(o); }
    m.updateWorldMatrix(true, false); o.matrixAutoUpdate = false; o.matrix.copy(m.matrixWorld);
    /* inflate by about 2 mm in world space, whatever the mesh size */
    const e = m.matrixWorld.elements, sx = Math.hypot(e[0], e[1], e[2]) || 1;
    const bb = m.geometry.boundingBox || (m.geometry.computeBoundingBox(), m.geometry.boundingBox); const sz = bb.getSize(tmpV);
    kv.set(1 + .003/Math.max(.003, sz.x*sx), 1 + .003/Math.max(.003, sz.y*sx), 1 + .003/Math.max(.003, sz.z*sx));
    o.matrix.scale(kv); o.matrixWorld.copy(o.matrix);
  });
  return true;
}
/* per part material state: hover glow, fade when another part is selected */
function shade(){
  const dimOthers = !!selected;
  for (const [k, m] of matCache){
    const id = k.split("|")[0], base = m.userData.base; const isSel = selected && selected.id === id, isHov = hovered && hovered.id === id;
    m.visible = !dimOthers || isSel;
    if (base.xray != null || m.userData.xray){ base.xray ??= m.userData.xray; const x = isSel ? base.xray : 1; m.opacity += (x - m.opacity)*.2; const t = m.opacity < .98; if (m.transparent !== t){ m.transparent = t; m.depthWrite = !t; m.needsUpdate = true; } }
    const ei = base.ei + (isHov || isSel ? .22 : 0); m.emissiveIntensity += (ei - m.emissiveIntensity)*.2;
  }
}
/* capsule open animation: the shell turns upright, the lid swings back; the hovered one grows a little */
function capAnim(dt){
  openK += ((selectedCap ? 1 : 0) - openK)*Math.min(1, dt*4);
  for (const c of capsules){
    c.visible = !selectedCap || c === selectedCap;
    const hv = c === capHover && !selectedCap ? 1.08 : 1; c.scale.x += (hv - c.scale.x)*.25; c.scale.y = c.scale.z = c.scale.x;
    if (c !== animCap){ c.userData.lid.rotation.x = 0; c.userData.lid.position.z = 0; c.quaternion.copy(c.userData.q0); continue; }
    const cp = root.worldToLocal(camera.position.clone()); const yaw = Math.atan2(cp.y - c.position.y, cp.x - c.position.x) - Math.PI/2;
    YQ.setFromAxisAngle(ZAX, yaw); c.quaternion.copy(c.userData.q0).slerp(YQ, openK); c.userData.lid.position.z = .006*openK; c.userData.lid.rotation.x = 1.3*openK;
  }
  if (!selectedCap && openK < .01) animCap = null;
}
const IDQ = new THREE.Quaternion(), YQ = new THREE.Quaternion(), ZAX = new THREE.Vector3(0, 0, 1);
/* labels: one per part, anchored on the part's bounding centre, with a leader line drawn in the svg overlay */
const lab = {}; let capLab = null; const box = new THREE.Box3(), ctr = new THREE.Vector3(), tmpV = new THREE.Vector3();
for (const p of PARTS){ const d = document.createElement("div"); d.className = "lab"; d.innerHTML = `<b>${p.n}</b>${p.name}`; d.onclick = () => setSelected(p); labels.appendChild(d); lab[p.id] = d; }
const offOf = p => { const o = [0,0,0]; for (const id of [...(p.chain || []), p.id]){ const e = byId(id).ex; o[0] += e[0]*explode; o[1] += e[1]*explode; o[2] += e[2]*explode; } return o; };
/* labels live in the margins: on the side of the thing they name, outside the picture, stacked so they never overlap */
/* a part's bounds in world space, following the explode offset and the selection lift */
const offV = new THREE.Vector3();
function partBox(p, out){ const o = offOf(p); offV.set(o[0], o[1], o[2] + (selected === p ? .09*liftK : 0)); return out.copy(p.lbox).translate(offV).applyMatrix4(root.matrixWorld); }
function screenBox(objs, part, W, H){
  if (part){ const p = byId(part); if (p && p.lbox && !p.lbox.isEmpty()){ partBox(p, box); let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (let i = 0; i < 8; i++){ tmpV.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z).project(camera); const x = (tmpV.x*.5 + .5)*W, y = (-tmpV.y*.5 + .5)*H; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    return { x0:x0 - 20, x1:x1 + 20, y0, y1 }; } }
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, n = 0;
  for (const o of objs) o.traverse(m => {
    if (!m.isMesh || !m.visible || (part && m.userData.part !== part) || (m.material && m.material.visible === false)) return;
    m.getWorldPosition(tmpV).project(camera); if (tmpV.z > 1) return;
    const x = (tmpV.x*.5 + .5)*W, y = (-tmpV.y*.5 + .5)*H; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); n++;
  });
  if (!n) return { x0:W*.4, x1:W*.6, y0:H*.4, y1:H*.6 };
  return { x0:x0 - 34, x1:x1 + 34, y0, y1 };
}
function layout(items, sb, W, H){
  let svg = ""; const railW = document.body.classList.contains("ui-min") || W < 980 ? 0 : 118, cardOn = card.classList.contains("on");
  const cx = (sb.x0 + sb.x1)/2, L = [], R = [];
  for (const it of items){ it.side = it.sx < cx ? -1 : 1; (it.side < 0 ? L : R).push(it); }
  for (const g of [L, R]){
    g.sort((a, b) => a.sy - b.sy); let y = -1e9;
    for (const it of g){
      const w = it.el.offsetWidth || 120, h = it.el.offsetHeight || 26;
      it.ly = Math.max(y + h + 8, it.sy - h/2); y = it.ly;
      it.lx = it.side < 0 ? Math.max(10, sb.x0 - 30 - w) : Math.min(W - w - 10 - railW, sb.x1 + 30);
    }
    /* keep the stack on screen: above the bar, and on the left above the card */
    const sr = stage.getBoundingClientRect(), barTop = (document.querySelector(".an-bar")?.getBoundingClientRect().top ?? sr.bottom) - sr.top;
    const cardTop = cardOn ? card.getBoundingClientRect().top - sr.top : H;
    const limit = (g === L && cardOn ? Math.min(cardTop, barTop) : barTop) - 12;
    const maxY = limit - (g.length ? (g[g.length - 1].el.offsetHeight || 26) : 0), lastBottom = g.length ? g[g.length - 1].ly : 0;
    if (lastBottom > maxY){ let shift = lastBottom - maxY; for (let i = g.length - 1; i >= 0 && shift > 0; i--){ g[i].ly -= shift; if (i > 0){ const h2 = g[i - 1].el.offsetHeight || 26; const room = g[i].ly - (g[i - 1].ly + h2 + 8); if (room >= 0) shift = 0; } } }
    for (const it of g){
      it.ly = Math.max(8, it.ly); it.el.style.transform = `translate(${it.lx}px, ${it.ly}px)`;
      const h = it.el.offsetHeight || 26, ex = it.side < 0 ? it.lx + (it.el.offsetWidth || 120) : it.lx, ey = it.ly + h/2;
      svg += `<line class="${it.cls}" x1="${it.sx}" y1="${it.sy}" x2="${ex}" y2="${ey}"/><circle class="${it.cls}" cx="${it.sx}" cy="${it.sy}" r="2.4"/>`;
    }
  }
  return svg;
}
function placeLabels(){
  const W = stage.clientWidth, H = stage.clientHeight, items = [];
  const focusObjs = selectedCap ? [selectedCap] : selected ? (selected.focus ? selected.focus.map(n => ents.get(n)) : selected.objs) : [root];
  const sb = screenBox(focusObjs, selected && !selectedCap ? selected.id : null, W, H);
  const proj = () => { const sc = ctr.clone().project(camera); return sc.z > 1 ? null : [(sc.x*.5 + .5)*W, (-sc.y*.5 + .5)*H]; };
  for (const p of PARTS){
    const d = lab[p.id];
    if (p.anchor){ const o = offOf(p); ctr.set(p.anchor[0] + o[0], p.anchor[1] + o[1], p.anchor[2] + o[2]); root.localToWorld(ctr); }
    else { let n = 0; ctr.set(0, 0, 0); for (const o of p.objs) o.traverse(m => { if (m.isMesh && m.userData.part === p.id){ m.getWorldPosition(tmpV); ctr.add(tmpV); n++; } }); if (!n){ d.style.display = "none"; continue; } ctr.multiplyScalar(1/n); }
    const sp = proj();
    const vis = sp && !selectedCap && (selected ? selected.id === p.id : !!(hovered && hovered.id === p.id));
    d.style.display = vis ? "" : "none"; if (!vis) continue;
    d.classList.toggle("on", (selected && selected.id === p.id) || (hovered && hovered.id === p.id));
    items.push({ el:d, sx:sp[0], sy:sp[1], cls:"" });
  }
  capLab ||= CAPSUBS.map(sd => { const e = document.createElement("div"); e.className = "lab sub"; e.textContent = sd[0]; labels.appendChild(e); return e; });
  capLab.forEach((e, i) => {
    if (!selectedCap || openK < .7){ e.style.display = "none"; return; }
    const sd = CAPSUBS[i]; ctr.set(sd[1], sd[2], sd[3]); selectedCap.localToWorld(ctr); const sp = proj(); if (!sp){ e.style.display = "none"; return; }
    e.style.display = ""; items.push({ el:e, sx:sp[0], sy:sp[1], cls:"s" });
  });
  for (const p of PARTS){
    const on = selected && selected.id === p.id && liftK > .6 && !selectedCap;
    p.subEls ||= p.subs.map(sd => { const e = document.createElement("div"); e.className = "lab sub"; e.textContent = sd[0]; labels.appendChild(e); return e; });
    p.subEls.forEach((e, i) => {
      if (!on){ e.style.display = "none"; return; }
      const sd = p.subs[i], o = offOf(p); ctr.set(sd[1] + o[0], sd[2] + o[1], sd[3] + o[2] + .09*liftK); root.localToWorld(ctr); const sp = proj(); if (!sp){ e.style.display = "none"; return; }
      e.style.display = ""; items.push({ el:e, sx:sp[0], sy:sp[1], cls:"s" });
    });
  }
  const svg = layout(items, sb, W, H);
  lines.setAttribute("viewBox", `0 0 ${W} ${H}`); lines.innerHTML = svg;
}

/* ---------- claw cycle: a slow grab, even while exploded ---------- */
const CY = { t:0, cap:null, held:null };
const CHUTE = [.38, -.39], PICK = [-.30, -.31], S = .79, GRAB_Z = .22 + .03 + .087*S, TRAVEL = .97 - .025 - GRAB_Z, SEG = TRAVEL/8;
const ease = x => x < .5 ? 2*x*x : 1 - Math.pow(-2*x + 2, 2)/2;
let motionOn = false;
function clawCycle(dt){
  if (!mech.move_y) return;
  if (!motionOn) return; CY.t = (CY.t + dt) % 22;
  const t = CY.t; let x = 0, y = 0, lift = 0, open = 0, hold = false;
  const seg = (a, b) => t >= a && t < b ? ease((t - a)/(b - a)) : (t >= b ? 1 : 0);
  /* 0-3 travel to pick, 3-6 lower, 6-7 close, 7-10 raise, 10-14 travel to chute, 14-15 open, 15-17 hold open, 17-20 home, 20-22 rest */
  const toPick = seg(0, 3), down = seg(3, 6) - seg(7, 10), closeK = seg(6, 7) - seg(14, 15), toChute = seg(10, 14), home = seg(17, 20);
  x = PICK[0]*toPick + (CHUTE[0] - PICK[0])*toChute - CHUTE[0]*home; y = PICK[1]*toPick + (CHUTE[1] - PICK[1])*toChute - CHUTE[1]*home;
  lift = -SEG*Math.max(0, down); open = (1 - closeK)*.55 + (t >= 3 && t < 7 ? .55*(1 - seg(6, 7)) : 0); hold = closeK > .98 && t > 7.2;
  mech.move_y.o.position.y = mech.move_y.o.userData.home.y + y + byId("gantry").ex[1]*explode;
  mech.move_x.o.position.x = mech.move_x.o.userData.home.x - x;
  for (let s = 1; s <= 8; s++) mech["seg_" + s].o.position.z = (s === 1 ? mech.seg_1.o.userData.home.z + byId("claw").ex[2]*explode : 0) + lift;
  for (let k = 1; k <= 3; k++) mech["finger_" + k].o.rotation.y = -.6 - .55 + open;   /* geometry is built 0.6 rad more closed; opening swings the tip outward */
  /* the capsule under the pick point rides with the claw when it is closed, then falls into the chute */
  if (!CY.cap) CY.cap = capsules.reduce((b, c) => Math.hypot(c.userData.home.x - PICK[0], c.userData.home.y - PICK[1]) < Math.hypot(b.userData.home.x - PICK[0], b.userData.home.y - PICK[1]) ? c : b, capsules[0]);
  const c = CY.cap; const hubWorld = new THREE.Vector3(); mech.seg_8.o.getWorldPosition(hubWorld); root.worldToLocal(hubWorld);
  if (hold){ c.position.set(hubWorld.x, hubWorld.y, hubWorld.z - .025 - .065); c.userData.drop = null; }
  else if (t >= 15 && t < 17.5){ c.userData.drop ??= { z:c.position.z, t0:t }; const k = Math.min(1, (t - c.userData.drop.t0)/1.1); c.position.set(CHUTE[0], CHUTE[1] + .02, c.userData.drop.z - (c.userData.drop.z - .11)*k*k); c.visible = k < .97; }
  else if (t >= 17.5 || t < 3){ c.visible = true; c.position.copy(c.userData.home).addScaledVector(c.userData.spread, explode); }
}

/* ---------- tour: for the video and the lazy ---------- */
const tourBtn = $("#tour");
function startTour(){ tour = { t:0, i:-1 }; tourBtn.classList.add("on"); tourBtn.textContent = "Stop tour"; setSelected(null); }
function stopTour(){ tour = null; tourBtn.classList.remove("on"); tourBtn.textContent = "Play tour"; }
tourBtn.onclick = () => tour ? stopTour() : startTour();
function tourStep(dt){
  tour.t += dt; const T = tour.t;
  orb.th += dt*.16;
  if (T < 2.5){ setExplode(0); orb.ph += (1.1 - orb.ph)*.02; }
  else if (T < 5){ setExplode(ease(Math.min(1, (T - 2.5)/2.2))); }
  else if (T < 5 + PARTS.length*2.6){ const i = Math.floor((T - 5)/2.6); if (i !== tour.i){ tour.i = i; setSelected(PARTS[i]); } }
  else if (T < 5 + PARTS.length*2.6 + 4){ if (tour.i !== 99){ tour.i = 99; selectCap(capsules[40]); } }
  else if (T < 5 + PARTS.length*2.6 + 6.5){ if (selected) setSelected(null); setExplode(1 - ease(Math.min(1, (T - 5 - PARTS.length*2.6 - 4)/2.2))); }
  else { tour.t = 0; tour.i = -1; }
}

/* ---------- ui bits ---------- */
const q = new URLSearchParams(location.search);
$("#pix").onclick = e => { pixel = !pixel; e.currentTarget.classList.toggle("on", pixel); document.body.classList.toggle("pix", pixel); post.uniforms.pixel.value = pixel ? 1 : 0; scene.background = pixel ? PIXBG : null; resize(); };
if (q.get("pixel") === "1") $("#pix").click();
if (q.get("motion") === "1") motionOn = true;
$("#reset").onclick = () => { setSelected(null); setExplode(0); orb.px = orb.py = orb.pz = 0; orb.th = .95; orb.ph = 1.12; orb.zoom = 1; if (tour) stopTour(); };
if (q.get("ui") === "min"){ document.body.classList.add("ui-min"); document.getElementById("loader")?.remove(); }

/* ---------- loop ---------- */
let last = performance.now();
function frame(now){
  const dt = Math.min(.05, (now - last)/1000); last = now;
  if (tour) tourStep(dt); else { orb.idle += dt; if (false) orb.th += dt*.08; if (!orb.down){ orb.vth *= .9; orb.vph *= .9; orb.th += orb.vth; orb.ph = Math.min(1.5, Math.max(.35, orb.ph + orb.vph)); } }
  explode += (explodeTarget - explode)*Math.min(1, dt*4.5); liftK += ((selected ? 1 : 0) - liftK)*Math.min(1, dt*5);
  if (!orb.down && !orb.pan && !tour){ const p = pick(); if (p !== hovered && !(hovered && list.matches(":hover"))) hovered = p; capHover = p && p.id === "capsules" ? lastHitCap : null; stage.style.cursor = p ? "pointer" : "grab"; }
  applyExplode(); clawCycle(dt); shade(); capAnim(dt); easeCam(dt); cam();
  renderer.toneMappingExposure += ((selected ? 1.15 : 1.0) - renderer.toneMappingExposure)*Math.min(1, dt*4);
  if (pixel){ renderer.setRenderTarget(rt); renderer.render(scene, camera); renderer.setRenderTarget(null); post.uniforms.t.value = now/1000; renderer.render(postScene, postCam); }
  else { renderer.render(scene, camera); if (outlinePass()){ renderer.autoClear = false; renderer.render(outlineScene, camera); renderer.autoClear = true; } }
  placeLabels();
  requestAnimationFrame(frame);
}
function makeThumbs(){
  const TW = 288, TH = 192, rt2 = new THREE.WebGLRenderTarget(TW, TH), cam2 = new THREE.PerspectiveCamera(28, TW/TH, .02, 40), buf = new Uint8Array(TW*TH*4);
  const cv = document.createElement("canvas"); cv.width = TW; cv.height = TH; const g = cv.getContext("2d"), img = g.createImageData(TW, TH);
  const catcherWas = catcher.visible; catcher.visible = false; const expWas = renderer.toneMappingExposure; renderer.toneMappingExposure = 1.25;
  for (const p of PARTS){
    for (const [k, m] of matCache) m.visible = k.split("|")[0] === p.id;
    if (!p.lbox || p.lbox.isEmpty()) continue; partBox(p, box); box.expandByScalar(.03); box.getBoundingSphere(sph); const d = sph.radius/Math.sin(THREE.MathUtils.degToRad(14))*1.05;
    const th = p.th ?? .95, ph = p.ph ?? 1.05, sp = Math.sin(ph), c = Math.cos(ph);
    cam2.position.set(sph.center.x + d*sp*Math.cos(th), sph.center.y + d*c, sph.center.z + d*sp*Math.sin(th)); cam2.lookAt(sph.center); cam2.updateProjectionMatrix();
    renderer.setRenderTarget(rt2); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, cam2); renderer.readRenderTargetPixels(rt2, 0, 0, TW, TH, buf);
    for (let y = 0; y < TH; y++) img.data.set(buf.subarray(y*TW*4, (y + 1)*TW*4), (TH - 1 - y)*TW*4);
    g.putImageData(img, 0, 0); const el = list.querySelector(`[data-id="${p.id}"] .th`); if (el) el.src = cv.toDataURL("image/png");
  }
  renderer.setRenderTarget(null); for (const [, m] of matCache) m.visible = true; catcher.visible = catcherWas; renderer.toneMappingExposure = expWas; rt2.dispose();
}
load().then(() => { resize(); cam(); try { makeThumbs(); } catch (e) { console.warn("thumbs", e); } document.body.classList.add("ready"); if (q.get("tour") === "1") startTour(); requestAnimationFrame(frame); window.__anatomy = { setExplode, setSelected, selectCap, capsules, PARTS, startTour, orb, check, hover:p => { hovered = p; }, dbg:() => ({ openK, animCap:animCap && animCap.name, selectedCap:selectedCap && selectedCap.name, lid:animCap && animCap.userData.lid.rotation.x }) }; })
  .catch(e => { console.error(e); $("#stage").classList.add("err"); });
