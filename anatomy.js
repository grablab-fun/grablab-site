/* ============ ANATOMY : Prototype 01, exploded and interactive ============
   The machine is the metal build: steel cabinet and motion system from the motion build geometry, the rest modelled part by part (anatomy-metal.js).
   Three.js, self-hosted. An optional pixel post shader posterises to the Grablab palette. */
import * as THREE from "./assets/vendor/three.module.min.js";
import { buildMachine } from "./anatomy-metal.js?v=39";
import { loadMachine } from "./machine-scene.js?v=2";

const $ = s => document.querySelector(s);
/* ?rec=1: a clean, transparent, frame by frame render of the machine, for the home page video */
const REC = /[?&]rec=1/.test(location.search); if (REC) document.documentElement.classList.add("rec");
/* ?story=1 (with rec=1): the moving parts stay unmerged so a recorder can drive a full play, frame by frame */
const STORY = REC && /[?&]story=1/.test(location.search);
/* subs: [card item, mesh name prefixes it lights up in the model] */
const PARTS = [
  { id:"frame", n:"01", name:"Frame", spec:"Welded steel tube, matte black", ph:1.2, th:1.3, anchor:[-.34,-.34,.7], ex:[0,0,0],
    text:["A welded frame of 20 mm square steel tube.", "Four posts and three rings: ground, floor and top.", "One crossbar and a frame round the prize hole carry the floor.", "Adjustable feet below."],
    subs:[["Posts", ["frame_post"]], ["Rings", ["frame_rail"]], ["Floor crossbar", ["frame_floor_rail"]], ["Adjustable feet", ["frame_foot"], { ph:1.42, one:true }]], proof:"Built from the parts list" },
  { id:"cage", n:"02", name:"Skins and windows", spec:"Black panels, clear windows", ph:1.25, th:1.57, anchor:[-.2,-.2,.25], ex:[0,0,.2],
    text:["A black floor with one prize hole, front right.", "Clear windows on the front and the right.", "Black panels on the base, the back and the left.", "An LED strip on the top tubes lights the floor.", "The lower back and right panels come off on magnets.", "Bonded to the frame all round."],
    subs:[["Floor", ["cage_floor"]], ["Base panels", ["cage_skin"]], ["Showcase back", ["cage_showcase"]], ["Service panel", ["cage_door"]], ["Clear windows", []]], proof:"Watched from every side" },
  { id:"panel", n:"03", name:"Front panel", spec:"Black panel, anodised plates", ph:1.32, th:1.57, anchor:[0,-.355,.17], ex:[0,-.5,0],
    text:["The face of the machine, under the window.", "Scan to play QR, GRABLAB plate. No buttons: the machine is run remotely."],
    subs:[["Scan to play", ["panel_qr", "panel_scan"]], ["GRABLAB plate", ["panel_wordmark", "panel_trim"]], ["Panel", ["panel_skin"]]], proof:"No joystick. Browser only" },
  { id:"electronics", n:"04", name:"Electronics", spec:"Boards and wiring on one plate", ph:1.5, th:1.57, fitK:.8, anchor:[.19,.3,.12], ex:[0,.24,0],
    text:["Power, motion and claw drivers on one plate.", "A small computer runs the play and the stream.", "A secure chip signs every event.", "Its key never leaves the chip."],
    subs:[["Secure chip", ["el_optiga"]], ["Computer", ["el_pi4", "el_pi_usb", "el_pi_ethernet", "el_pi_heatsink", "el_pi_gpio", "el_pi_post"]], ["Case and fan", ["el_picase", "el_pi_fan"]], ["Power supply", ["el_psu"]], ["Motion controller", ["el_uno", "el_cnc", "el_shield", "el_a4988"]], ["Claw driver", ["el_l298n"]], ["5 V supply", ["el_converter", "el_carrier"]], ["Power splitters", ["el_wago"]], ["Wiring", ["el_wire", "el_usb", "el_dupont"]]], proof:"Signed on peaqOS", logo:"assets/brand/partners/peaq-white.svg", href:"https://peaq.xyz" },
  { id:"chute", n:"05", name:"Prize path", spec:"Printed funnel, seat, gate and tray", ph:1.22, th:.4, anchor:[.213,-.213,.15], ex:[.3,-.3,0],
    text:["A printed funnel fills the prize hole, walled 100 mm above the floor.", "The ball drops through a 55 mm throat onto the seat.", "A red light beam and the NFC reader both see it there.", "Beam broken for 0.3 s, same tag read twice, tag known and not yet won.", "Only then a small servo opens the gate.", "The ball rolls off into a wide tray behind the gate.", "Its floor falls to one corner, so no ball gets stuck.", "A small door on the right side opens and the tray slides out."],
    subs:[["Funnel", ["chute_funnel"]], ["Light beam sensors", ["chute_e3jk"], { out:[.15, -.15, .05] }], ["NFC reader", ["chute_acr122u"], { out:[.17, -.17, .06] }], ["Seat", ["chute_seat", "chute_ball"]], ["Gate and servo", ["chute_gate", "chute_mg90s"], { out:[.15, -.15, .05] }], ["Ball tray", ["chute_tray"]]], proof:"Checked twice: beam and tag" },
  { id:"capsules", n:"06", name:"Capsules", spec:"45 mm printed ball, NFC disc", ph:1.0, th:1.57, anchor:[.1,.1,.29], ex:[0,0,.98],
    text:["Two printed halves, 45 mm across.", "An NFC disc at the bottom pole, ballast above it, so it settles tag down.", "Factory UID, read only.", "Click one to open it."],
    subs:[["Printed two piece shell", []], ["NFC disc", []], ["Non metal ballast", []]], proof:"Inventory on chain", logo:"assets/chains/solana.jpg", href:"https://solana.com" },
  { id:"gantry", n:"07", name:"Gantry", spec:"Aluminium rails, printed blocks", ph:1.0, th:-1.9, anchor:[.33,-.2,1.14], ex:[0,0,.5],
    text:["Two rails front to back, one beam across.", "Printed corner blocks hold the motors and idlers.", "Three stepper motors pull toothed belts.", "End stops on X and Y, a drag chain for the cables."],
    subs:[["Y rails", ["gantry_y_rail"]], ["X beam", ["gantry_x_beam"]], ["Corner blocks", ["gantry_block"]], ["Carriages", ["gantry_y_carriage", "gantry_y_wheel", "gantry_saddle"]], ["Motors", ["gantry_motor"]], ["Belts and pulleys", ["gantry_y_belt", "gantry_x_belt", "gantry_pulley", "gantry_idler", "gantry_belt_cap"]], ["End stops", ["gantry_endstop"]], ["Drag chain", ["gantry_drag_chain", "gantry_chain_ledge"]]], proof:"Position known to the step" },
  { id:"winch", n:"08", name:"Carriage and winch", spec:"Printed saddle and spool", ph:1.15, th:1.15, chain:["gantry"], anchor:[.011,-.03,1.22], ex:[0,-.22,.12],
    text:["The carriage rides the X beam.", "A stepper winds the line on a printed spool.", "The line leaves through a brass eyelet.", "An end stop finds the top."],
    subs:[["Carriage", ["winch_x_carriage", "winch_x_wheel", "winch_saddle"]], ["Winch motor", ["winch_motor", "winch_mount"]], ["Spool and eyelet", ["winch_spool", "winch_eyelet"]], ["Top end stop", ["winch_z_endstop"]], ["Belt clip", ["winch_belt_cap"]]], proof:"Same depth every play" },
  { id:"claw", n:"09", name:"Claw", spec:"Black print, three paddles", ph:1.1, th:1.2, chain:["gantry", "winch"], anchor:[-.02,-.046,.8], ex:[0,0,-.2], skip:["claw_coil_cable", "claw_line"],
    text:["A black printed claw with three long arms.", "Closed, the paddles meet into a bowl under the capsule.", "A 12 V linear actuator down the middle opens and closes them.", "It hangs from a swivel on the line.", "A coiled cable brings the power down."],
    subs:[["Swivel", ["claw_swivel"]], ["Cap", ["claw_cap"]], ["Linear actuator", ["claw_actuator"]], ["Body", ["claw_body", "claw_hub"]], ["Fingers", ["claw_finger", "claw_pad", "claw_lug", "claw_rod", "claw_bearing", "claw_link", "claw_spreader"]], ["Coil cable", ["claw_coil", "claw_cable_tie"]]], proof:"Grip measured before you play" },
  { id:"camera", n:"10", name:"Cameras", spec:"Two 1080p webcams", ph:1.25, th:.8, anchor:[.3,.3,1.04], ex:[0,-.15,.1],
    text:["Camera 1 sits in the top corner and looks across the side.", "Camera 2 rides on the carriage and looks straight down.", "Click a camera to see through it."],
    subs:[["Camera 1: corner", ["camera_c920"]], ["Camera 2: carriage", ["camera_claw"]]], proof:"The stream you play" }
];
const byId = id => PARTS.find(p => p.id === id);
const ICON = { frame:"assets/parts/post.png", cage:"assets/parts/mdf.png", panel:"assets/parts/qr.png", electronics:"assets/parts/optiga.png", chute:"assets/parts/funnel.png", capsules:"assets/parts/capsule.png", gantry:"assets/parts/rail.png", winch:"assets/parts/spool.png", claw:"assets/parts/claw.png", camera:"assets/parts/webcam.png" };
const SUBICON = {
  "Posts":"assets/parts/post.png", "Rings":"assets/parts/framering.png", "Floor crossbar":"assets/parts/framering.png", "Angle brackets":"assets/parts/bracket.png", "Adjustable feet":"assets/parts/foot.png",
  "Floor":"assets/parts/mdf.png", "Drop zone walls":"assets/parts/guard.png", "Base panels":"assets/parts/mdf.png", "Showcase back":"assets/parts/mdf.png", "Rivets":"assets/parts/bracket.png", "Clear windows":"assets/parts/guard.png", "Drop zone guard and funnel":"assets/parts/guard.png", "Cable grommets":"assets/parts/gland.png", "Acrylic walls":"assets/parts/guard.png",
  "Scan to play":"assets/parts/qr.png", "GRABLAB plate":"assets/brand/mark-chrome-256.png", "Panel":"assets/parts/mdf.png", "Service panel":"assets/parts/mdf.png",
  "Secure chip":"assets/parts/optiga.png", "Computer":"assets/parts/pi.png", "Case and fan":"assets/parts/fan.png", "Power supply":"assets/parts/psu.png", "Motion controller":"assets/parts/motionboard.png",
  "Claw driver":"assets/parts/clawdriver.png", "5 V supply":"assets/parts/relay.png", "Power splitters":"assets/parts/wago.png", "Wiring":"assets/parts/coil.png",
  "Funnel":"assets/parts/funnel.png", "Light beam sensors":"assets/parts/beam.png", "Seat":"assets/parts/bracket.png", "Gate and servo":"assets/parts/servo.png", "Prize tray":"assets/parts/drawer.png", "NFC reader":"assets/parts/nfcreader.png",
  "Printed two piece shell":"assets/parts/capsule.png", "NFC disc":"assets/parts/nfcsticker.png", "Non metal ballast":"assets/parts/capsuleopen.png",
  "Y rails":"assets/parts/rail.png", "X beam":"assets/parts/beam2040.png", "Carriages":"assets/parts/bracket.png", "Corner blocks":"assets/parts/bracket.png", "Motors":"assets/parts/nema17.png", "Belts and pulleys":"assets/parts/belt.png", "End stops":"assets/parts/endstop.png", "Drag chain":"assets/parts/dragchain.png",
  "Carriage":"assets/parts/rail.png", "Winch motor":"assets/parts/nema17.png", "Spool and eyelet":"assets/parts/spool.png", "Top end stop":"assets/parts/endstop.png", "Cable joints":"assets/parts/wago.png", "Belt clip":"assets/parts/belt.png",
  "Swivel":"assets/parts/swivel.png", "Cap":"assets/parts/collar.png", "Linear actuator":"assets/parts/actuator.png", "Body":"assets/parts/claw.png", "Fingers":"assets/parts/claw.png", "Coil cable":"assets/parts/coil.png",
  "Webcams":"assets/parts/webcam.png", "Mounts":"assets/parts/bracket.png" };

const PAL = [[.047,.051,.098],[.094,.09,.188],[.192,.161,.31],[.33,.27,.42],[.545,.475,.576],[.855,.843,.847],[1,.824,.478],[.788,.714,1],[.231,.482,1],[.122,.31,.82]];

const stage = $("#stage"), canvas = $("#view");
let renderer; const LITE = document.documentElement.classList.contains("lite");
try {
  const probe = document.createElement("canvas"); if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) throw new Error("no webgl");
  renderer = new THREE.WebGLRenderer({ canvas, antialias:!LITE, alpha:true, powerPreference:"high-performance", preserveDrawingBuffer:REC });
} catch (e){
  /* WebGL off (Brave Shields "strict" fingerprinting, hardware acceleration off, old GPU): say so instead of spinning forever */
  stage.classList.add("err"); throw e;
}
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = false;
const scene = new THREE.Scene(); scene.background = null;
const camera = new THREE.PerspectiveCamera(32, 1, .08, 20);
const root = new THREE.Group(); root.rotation.x = -Math.PI/2; scene.add(root);   // z-up scene into y-up three

/* ---------- lights ---------- */
scene.add(new THREE.HemisphereLight(0xc3caff, 0x141830, 1.3));
const key = new THREE.DirectionalLight(0xf3f5ff, 2.5); key.position.set(-1.4, 2.6, 2.2); scene.add(key);
key.castShadow = false; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -.0004; key.shadow.normalBias = .02;
Object.assign(key.shadow.camera, { left:-1.7, right:1.7, top:1.9, bottom:-1.3, near:.5, far:8 });
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

/* ---------- the machine: the metal build (anatomy-metal.js + assets/machine/metal.json), one group per part ---------- */
const matCache = new Map(), ents = new Map();
const capsules = [];
async function load(){
  const fonts = document.fonts ? Promise.all(["700 100px 'Clash Display'", "700 40px 'Satoshi'", "500 40px 'Satoshi'", "800 40px 'Satoshi'"].map(f => document.fonts.load(f))).catch(() => {}) : Promise.resolve();
  /* every material is keyed part|name, so shade() can isolate a part */
  const mat = (part, key, o, phys) => {
    const k = part + "|" + key; if (matCache.has(k)) return matCache.get(k);
    /* weak GPUs: clearcoat doubles the lighting cost of every glass pixel, so lite mode draws plain standard materials */
    if (LITE && phys){ o = { ...o }; delete o.clearcoat; delete o.clearcoatRoughness; delete o.specularIntensity; phys = false; }
    const m = phys ? new THREE.MeshPhysicalMaterial(o) : new THREE.MeshStandardMaterial(o);
    if (!o.emissive && !o.map){ m.emissive = m.color.clone(); m.emissiveIntensity = 0; }
    m.userData.base = { opacity:m.opacity, ei:m.emissiveIntensity || 0 }; matCache.set(k, m); return m;
  };
  const scene = await loadMachine();
  const M = buildMachine(THREE, { mat, onFont:cb => fonts.then(cb), scene });
  for (const [id, g] of Object.entries(M.parts)){ root.add(g); ents.set(id, g); }
  /* draw calls: siblings with the same material and the same name become one mesh, so a weak GPU draws ~hundreds, not ~1900.
     Names survive (card items pick meshes by name); anything that moves on its own is left alone. */
  const KEEP = STORY ? /pushrod|horn|trap|capsule|lever|flap|grommet|view|gantry|winch|claw|chute_gate|chute_ball|chute_tray|chute_side_door|camera_/ : /pushrod|horn|trap|capsule|lever|flap|grommet|view|claw_link$|chute_gate|chute_ball|chute_tray|chute_side_door|camera_/;
  (function mergeAll(o){
    for (const c of [...o.children]) if (c.children.length && !c.isMesh) mergeAll(c);
    const groups = new Map();
    for (const c of o.children){ if (!c.isMesh || c.isInstancedMesh || KEEP.test(c.name) || c.children.length) continue;
      const k = c.material.uuid + "|" + c.name; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(c); }
    for (const list of groups.values()){
      if (list.length < 2) continue;
      const parts = list.map(m => { m.updateMatrix(); const g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone(); g.applyMatrix4(m.matrix); return g; });
      let n = 0; for (const g of parts) n += g.attributes.position.count;
      const P = new Float32Array(n*3), N = new Float32Array(n*3), U = new Float32Array(n*2); let i = 0;
      for (const g of parts){ const c = g.attributes.position.count; P.set(g.attributes.position.array, i*3); if (g.attributes.normal) N.set(g.attributes.normal.array, i*3); if (g.attributes.uv) U.set(g.attributes.uv.array, i*2); i += c; g.dispose(); }
      const mg = new THREE.BufferGeometry(); mg.setAttribute("position", new THREE.BufferAttribute(P, 3)); mg.setAttribute("normal", new THREE.BufferAttribute(N, 3)); mg.setAttribute("uv", new THREE.BufferAttribute(U, 2));
      const mesh = new THREE.Mesh(mg, list[0].material); mesh.name = list[0].name; mesh.userData = { ...list[0].userData }; o.add(mesh);
      for (const m of list) o.remove(m);
    }
  })(root);
  M.capsules.forEach(o => { o.userData.home = o.position.clone(); o.userData.spread = new THREE.Vector3(o.position.x*.06, o.position.y*.06, 0); capsules.push(o); });
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
  root.traverse(o => { if (!o.isMesh || o.isInstancedMesh) return;
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
  /* a cable must not run through a solid box: sample its middle against unrotated boxes, grommets excepted */
  const gro = items.filter(it => /grommet/.test(it.name)).map(it => it.boxes[0].getCenter(new THREE.Vector3()));
  const solids = items.filter(it => !it.tube && it.o.geometry.type === "BoxGeometry" && Math.abs(it.o.getWorldQuaternion(new THREE.Quaternion()).dot(root.quaternion)) > .9999 && !(it.o.parent && it.o.parent !== ents.get(it.part)));
  const through = new Set();
  for (const it of items){ if (!it.tube) continue; const B = it.boxes;
    for (let k = 2; k < B.length - 2; k++){ const c = B[k].getCenter(new THREE.Vector3()); if (gro.some(g => g.distanceTo(c) < .02)) continue;
      const sh = B[k].clone().expandByScalar(-.0004);
      for (const so of solids) if (so.boxes[0].intersectsBox(sh)){ through.add(it.part + ":" + it.name + " > " + so.name); break; } } }
  explodeTarget = prevE;
  const count = {}; for (const f of floating) count[f] = (count[f] || 0) + 1;
  return { meshes:items.length, connected:seen.size, floating:Object.entries(count).map(([k, v]) => v > 1 ? k + " x" + v : k), looseEnds, through:[...through], solids:solids.length, grommets:gro.length };
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
      vec4 src = texture2D(tex, v); if (src.a < .02) discard;   /* empty pixels let the page sky through */
      if (src.a < .6){ gl_FragColor = vec4(pow(src.rgb*1.4, vec3(1./2.2))*src.a, src.a); return; }   /* ghosts stay see-through */
      vec3 c = pow(aces(src.rgb*1.1), vec3(1./2.2));
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
      gl_FragColor = vec4(outc, 1.);   /* solid, so the outline and the dither stay crisp */
    }`
});
const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post), postScene = new THREE.Scene(), postCam = new THREE.Camera(); postScene.add(quad);
let pixel = false, PX = 2;
function resize(){
  const w = stage.clientWidth, h = stage.clientHeight; renderer.setPixelRatio(pixel ? 1 : Math.min(prCap, devicePixelRatio || 1)); renderer.setSize(w, h, false); camera.aspect = w/h; camera.updateProjectionMatrix();
  const rw = Math.max(240, Math.round(w/PX)), rh = Math.max(135, Math.round(h/PX)); rt.setSize(rw, rh); post.uniforms.px.value.set(1/rw, 1/rh);
}
addEventListener("resize", resize);

/* ---------- orbit: drag, wheel, inertia, idle auto spin ---------- */
const orb = { th:1.57, ph:1.3, r:3.0, tx:0, ty:.52, tz:0, vth:0, vph:0, down:false, pan:false, px:0, py:0, pz:0, lx:0, ly:0, idle:0, zoom:1 };
const tgt = new THREE.Vector3();
let camView = null, camK = 0, camFov0 = null; const camP = new THREE.Vector3(), camL = new THREE.Vector3();
function cam(){
  const sp = Math.sin(orb.ph), c = Math.cos(orb.ph), r = orb.r*orb.zoom;
  const tx = orb.tx + orb.px, ty = orb.ty + orb.py, tz = orb.tz + orb.pz;
  camera.position.set(tx + r*sp*Math.cos(orb.th), ty + r*c, tz + r*sp*Math.sin(orb.th));
  tgt.set(tx, ty, tz);
  if (camView || camK > .002){ if (camView){ camP.fromArray(camView.pos); camL.fromArray(camView.look); root.localToWorld(camP); root.localToWorld(camL); } camera.position.lerp(camP, camK); tgt.lerp(camL, camK); }
  if (camFov0 == null) camFov0 = camera.fov; { const f = camFov0 + (72 - camFov0)*camK; if (Math.abs(f - camera.fov) > .01){ camera.fov = f; camera.updateProjectionMatrix(); } }
  camera.lookAt(tgt);
  /* shift the picture so its centre sits in the middle of the free part of the screen */
  const W = stage.clientWidth, H = stage.clientHeight; orb.vx = (orb.vx ?? 0) + ((W/2 - view.cx) - (orb.vx ?? 0))*.12; orb.vy = (orb.vy ?? 0) + ((H/2 - view.cy) - (orb.vy ?? 0))*.12;
  if (W && H) camera.setViewOffset(W, H, orb.vx, orb.vy, W, H);
}
/* left button orbits, right button pans the view */
stage.addEventListener("contextmenu", e => e.preventDefault());
const setMouse = e => { const r = stage.getBoundingClientRect(); mouse.x = (e.clientX - r.left)/r.width*2 - 1; mouse.y = -((e.clientY - r.top)/r.height)*2 + 1; };
stage.addEventListener("pointercancel", () => { orb.down = false; orb.pan = false; });
stage.addEventListener("pointerdown", e => { setMouse(e); orb.down = e.button !== 2; orb.pan = e.button === 2; orb.phT = null; orb.thT = null; orb.lx = e.clientX; orb.ly = e.clientY; orb.idle = 0; stage.setPointerCapture(e.pointerId); });
stage.addEventListener("pointermove", e => { mouse.x = (e.clientX - stage.getBoundingClientRect().left)/stage.clientWidth*2 - 1; mouse.y = -((e.clientY - stage.getBoundingClientRect().top)/stage.clientHeight)*2 + 1;
  if (orb.pan){ const dx = e.clientX - orb.lx, dy = e.clientY - orb.ly; orb.lx = e.clientX; orb.ly = e.clientY; const k = orb.r*orb.zoom*.00045, m = camera.matrixWorld.elements;
    orb.px += (-dx*m[0] + dy*m[4])*k; orb.py += (-dx*m[1] + dy*m[5])*k; orb.pz += (-dx*m[2] + dy*m[6])*k; return; }
  if (!orb.down) return; orb.vth = (e.clientX - orb.lx)*.006; orb.vph = e.pointerType === "touch" ? 0 : (e.clientY - orb.ly)*.006; orb.lx = e.clientX; orb.ly = e.clientY; orb.th += orb.vth; orb.ph = Math.min(1.5, Math.max(.35, orb.ph + orb.vph)); orb.moved = (orb.moved || 0) + Math.abs(orb.vth) + Math.abs(orb.vph); });
stage.addEventListener("pointerup", () => { orb.down = false; orb.pan = false; });
stage.addEventListener("wheel", e => { if (!e.ctrlKey && !e.metaKey) return; /* a plain wheel scrolls the page; ctrl + wheel or a pinch zooms */ e.preventDefault(); orb.zoom = Math.min(2.4, Math.max(.45, orb.zoom*(1 + Math.sign(e.deltaY)*.08))); orb.idle = 0; }, { passive:false });
/* where the camera wants to be: the whole machine, or the selected part framed */
const sph = new THREE.Sphere(), whole = new THREE.Box3(), pb = new THREE.Box3();
/* the free part of the screen: between the nav and the bar, and between the card (or the title) and the parts list */
const view = { cx:0, cy:0, fx:1, fy:1 };
function measure(){
  if (REC){ view.cx = stage.clientWidth/2; view.cy = stage.clientHeight/2; view.fx = .96; view.fy = .96; return; }
  const W = stage.clientWidth, H = stage.clientHeight, sr = stage.getBoundingClientRect();
  if (W < 980){ const c = card.classList.contains("on") ? card.getBoundingClientRect() : null, n = document.querySelector("#site-header, .nav"), nb = Math.max(14, n ? n.getBoundingClientRect().bottom - sr.top + 8 : 14);
    const bot = c ? c.top - sr.top - 10 : H*.92; view.cx = W/2; view.cy = (nb + bot)/2; view.fx = .9; view.fy = Math.max(.25, (bot - nb)/H); return; }
  const rect = el => el && el.offsetParent !== null ? el.getBoundingClientRect() : null;
  const nav = rect(document.querySelector("#site-header, .nav")), bar = rect(document.querySelector(".an-bar")), rail = rect(list), cd = card.classList.contains("on") ? rect(card) : null;
  const top = Math.max(12, (nav ? nav.bottom - sr.top : 70) + 10), bottom = (bar ? bar.top - sr.top : H - 90) - 14;
  const hd = rect(document.querySelector(".an-head")), left = cd ? cd.right - sr.left + 24 : (hd ? hd.right - sr.left + 24 : W*.25), right = (rail ? rail.left - sr.left : W - 300) - 24;
  /* with no card open the machine stands on the middle of the screen, sized to the narrower side */
  if (cd){ view.cx = (left + right)/2; view.fx = Math.max(.2, (right - left)/W); } else { view.cx = W/2; view.fx = Math.max(.2, 2*Math.min(W/2 - left, right - W/2)/W); }
  view.cy = (top + bottom)/2; view.fy = Math.max(.3, (bottom - top)/H);
}
/* distance that keeps a box inside the free part of the view */
function fit(b, minR, margin){
  b.getCenter(ctr);
  const sp = Math.sin(orb.ph), c = Math.cos(orb.ph), dir = new THREE.Vector3(-sp*Math.cos(orb.th), -c, -sp*Math.sin(orb.th)).normalize();
  const right = new THREE.Vector3().crossVectors(dir, camera.up).normalize(), up2 = new THREE.Vector3().crossVectors(right, dir);
  const tv = Math.tan(THREE.MathUtils.degToRad(camera.fov)/2)*view.fy, th = Math.tan(THREE.MathUtils.degToRad(camera.fov)/2)*camera.aspect*view.fx; let D = 0;
  for (let i = 0; i < 8; i++){ tmpV.set(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z).sub(ctr);
    const x = Math.abs(tmpV.dot(right)), y = Math.abs(tmpV.dot(up2)), z = tmpV.dot(dir); D = Math.max(D, Math.max(x/th, y/tv) - z); }
  return { tx:ctr.x, ty:ctr.y, tz:ctr.z, r:Math.max(minR, D*margin) };
}
function goal(){
  if (selectedCap){ selectedCap.getWorldPosition(tmpV); return { tx:tmpV.x, ty:tmpV.y + .015, tz:tmpV.z, r:.2 }; }
  if (subFocus){ box.copy(subFocus.box).expandByScalar(.02); return fit(box, .2, 1.15); }
  if (selected){ partBox(selected, box); if (!box.isEmpty()){ box.expandByScalar(.03); return fit(box, .42, selected.fitK || 1.12); } }   /* fitK: a part can ask to be framed closer */
  whole.makeEmpty(); for (const p of PARTS) if (p.lbox && !p.lbox.isEmpty() && p.id !== "capsules") whole.union(partBox(p, pb));
  return fit(whole, 1.2, 1.04);
}
function easeCam(dt){ camK += ((camView ? 1 : 0) - camK)*Math.min(1, dt*3.2); measure(); const g = goal(), k = Math.min(1, dt*3.2); if (orb.phT != null){ orb.ph += (orb.phT - orb.ph)*k; if (Math.abs(orb.phT - orb.ph) < .002) orb.phT = null; }
  if (orb.thT != null){ let d = ((orb.thT - orb.th + Math.PI) % (2*Math.PI) + 2*Math.PI) % (2*Math.PI) - Math.PI; orb.th += d*k; if (Math.abs(d) < .002) orb.thT = null; } orb.tx += (g.tx - orb.tx)*k; orb.ty += (g.ty - orb.ty)*k; orb.tz += (g.tz - orb.tz)*k; orb.r += (g.r - orb.r)*k; }

/* ---------- focus in place: the machine stays whole, the chosen part stays solid, the rest turns to a ghost ---------- */
let explode = 0, explodeTarget = 0, selected = null, hovered = null, tour = null, selectedCap = null, animCap = null, openK = 0, capHover = null, lastHitCap = null, subFocus = null;
const ray = new THREE.Raycaster(), mouse = new THREE.Vector2(-2, -2);
const card = $("#card"), list = $("#parts"), labels = $("#labels"), lines = $("#lines");
function setExplode(v){ wake(3500); explodeTarget = v; const b = document.getElementById("explode"); if (b){ b.classList.toggle("on", v > .5);  } }
document.getElementById("explode").onclick = () => { subFocus = null; const on = explodeTarget < .5; setExplode(on ? 1 : 0); if (!selected){ orb.thT = on ? -.9 : -1.57; orb.phT = on ? 1.1 : 1.28; } if (tour) stopTour(); };
function applyExplode(){
  const E = explode;
  for (const p of PARTS){ const off = offOf(p); for (const o of p.objs){ o.position.copy(o.userData.home); o.position.x += off[0]; o.position.y += off[1]; o.position.z += off[2]; } }
  for (const c of capsules){ c.position.copy(c.userData.home).addScaledVector(c.userData.spread, E); }
  const wr = ents.get("wiring"); if (wr) wr.visible = E < .04;
}
/* the workbench: a close, studio lit model of one real part, opened over the machine */
const BENCH = { "Computer":"pi", "Motors":"nema", "Winch motor":"nema/run", "Body":"claw/run", "Fingers":"claw/apart" };
let benchEl = null;
function openBench(id){
  if (!benchEl){
    benchEl = document.createElement("div"); benchEl.className = "an-bench"; benchEl.setAttribute("role", "dialog"); benchEl.setAttribute("aria-label", "Part up close");
    benchEl.innerHTML = `<iframe title="Part up close" src="bench.html?embed=1#${id}"></iframe><button class="bx" type="button" aria-label="Back to the machine"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg></button>`;
    document.body.appendChild(benchEl); benchEl.querySelector(".bx").onclick = closeBench;
    addEventListener("message", e => { if (e.origin === location.origin && e.data && e.data.bench === "close") closeBench(); });
    addEventListener("keydown", e => { if (e.key === "Escape" && benchEl.classList.contains("on")) closeBench(); });
  } else benchEl.querySelector("iframe").contentWindow.postMessage({ bench:"open", id }, location.origin);
  requestAnimationFrame(() => { benchEl.classList.add("on"); document.body.classList.add("bench-on"); benchEl.querySelector("iframe").focus(); });
}
function closeBench(){ if (!benchEl) return; benchEl.classList.remove("on"); try { benchEl.querySelector("iframe").contentWindow.postMessage({ bench:"pause" }, location.origin); } catch (e) {} document.body.classList.remove("bench-on"); wake(1500); }

let liftK = 0;
/* the meshes of the selected part whose names start with one of the prefixes of a card item */
function subMeshes(p, pre){ const out = []; if (!pre || !pre.length) return out;
  for (const o of p.objs) o.traverse(m => { if (m.isMesh && m.userData.part === p.id && pre.some(s => m.name.startsWith(s))) out.push(m); }); return out; }
function setSub(i){ wake(3500);
  if (!selected) return; const sd = selected.subs[i];
  if (!sd || (subFocus && subFocus.i === i)){ subFocus = null; }
  else { let ms = subMeshes(selected, sd[1]); if (sd[2] && sd[2].one) ms = ms.filter(m => m.position.distanceTo(ms[0].position) < .03); if (!ms.length){ subFocus = null; } else {
    root.updateMatrixWorld(true); const b = new THREE.Box3(); ms.forEach(m => { m.geometry.computeBoundingBox(); b.union(m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld)); });
    subFocus = { i, meshes:ms, box:b.clone(), box0:b, dw:new THREE.Vector3() }; if (sd[2] && sd[2].ph) orb.phT = sd[2].ph;
    if (sd[2] && sd[2].out) popOut(ms, sd[2].out, subFocus); } }
  for (const e of pops) if (!subFocus || e.focus !== subFocus) e.on = false;
  camView = subFocus && selected.id === "camera" ? subFocus.meshes[0].userData.view || null : null;
  card.querySelectorAll(".inside button").forEach((b, k) => b.classList.toggle("on", !!subFocus && subFocus.i === k));
}
/* parts buried inside the machine slide out along "out" (machine frame, m) while picked, and slide back after */
const pops = [];
function popOut(ms, out, focus){
  root.updateMatrixWorld(true);
  const m0 = ms[0], h0 = (m0.userData.popHome || m0.position).clone(), w = new THREE.Vector3();
  const dw = m0.parent.localToWorld(h0.clone().add(new THREE.Vector3(...out))).sub(m0.parent.localToWorld(h0.clone()));
  const list = ms.map(m => { m.getWorldPosition(w); const home = m.userData.popHome || (m.userData.popHome = m.position.clone());
    return { m, home, d:new THREE.Vector3(...out) }; });   // the part groups share the machine frame: metres, z up
  pops.push({ list, k:0, on:true, focus, dw });
}
function popStep(dt){
  for (let i = pops.length - 1; i >= 0; i--){ const e = pops[i];
    e.k = Math.max(0, Math.min(1, e.k + (e.on ? dt : -dt) * 2.2)); const k = e.k*e.k*(3 - 2*e.k);
    for (const { m, home, d } of e.list){ m.position.copy(home).addScaledVector(d, k); m.updateMatrix(); }   // meshes are frozen (matrixAutoUpdate off)
    if (e.focus && e.focus === subFocus){ subFocus.box.copy(subFocus.box0).translate(subFocus.dw.copy(e.dw).multiplyScalar(k)); }
    if (e.k > 0 && e.k < 1) wake(300);
    if (!e.on && e.k === 0){ for (const { m, home } of e.list){ m.position.copy(home); m.updateMatrix(); } pops.splice(i, 1); } }
}
function setSelected(p, fromList){ wake(3500); for (const e of pops) e.on = false;
  selected = p; camView = null; selectedCap = null; subFocus = null; orb.phT = p && p.ph ? p.ph : null; orb.thT = p && p.th != null ? p.th : null; orb.zoom = 1; orb.px = orb.py = orb.pz = 0;
  for (const li of list.children) li.classList.toggle("on", !!p && li.dataset.id === p.id);
  if (p){
    card.innerHTML = `<span class="n">${p.n} / ${String(PARTS.length).padStart(2, "0")}</span><h3>${p.name}</h3><div class="lines">${p.text.map(t => `<p>${t}</p>`).join("")}</div><div class="inside">${p.subs.map((x, i) => `<button type="button" data-i="${i}"${x[1] && x[1].length ? "" : " disabled"}><img src="${SUBICON[x[0]] || ICON[p.id]}" alt="" />${x[0]}${BENCH[x[0]] ? `<i class="ins" data-b="${BENCH[x[0]]}" title="Inspect up close" aria-label="Inspect ${x[0]} up close"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10.2 10.2 14 14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></i>` : ""}</button>`).join("")}</div>${p.logo ? `<a class="proof" href="${p.href}" target="_blank" rel="noopener"><img src="${p.logo}" alt="" />${p.proof}</a>` : `<span class="proof"><img src="assets/parts/shield.png" alt="" />${p.proof}</span>`}<div class="cnav"><button type="button" data-prev>&larr;</button><button type="button" data-next>&rarr;</button></div><button class="x" type="button" aria-label="Close">&times;</button>`;
    card.classList.add("on"); document.body.classList.add("card-on"); wireCard(); mobileFocus(p);
    card.querySelectorAll(".inside button").forEach(b => { b.onclick = e => { const ins = e.target.closest(".ins"); if (ins){ e.stopPropagation(); openBench(ins.dataset.b); return; } setSub(+b.dataset.i); }; });
  } else { card.classList.remove("on"); document.body.classList.remove("card-on"); }
  if (!fromList && !tour) orb.idle = 0;
}
/* phones: bring the 3D view under the nav and the picked chip into view */
function mobileFocus(p){
  if (innerWidth >= 980 || tour) return;
  const nav = document.querySelector("#site-header, .nav"), nh = nav ? nav.getBoundingClientRect().height : 60, y = stage.getBoundingClientRect().top + scrollY - nh;
  if (Math.abs(scrollY - y) > 8) scrollTo({ top:y, behavior:"smooth" });
}
function wireCard(){
  card.querySelector(".x").onclick = () => setSelected(null);
  const i = selected ? PARTS.indexOf(selected) : -1;
  card.querySelector("[data-prev]").onclick = () => setSelected(PARTS[(i + PARTS.length - 1) % PARTS.length], true);
  card.querySelector("[data-next]").onclick = () => setSelected(PARTS[(i + 1) % PARTS.length], true);
}
for (const p of PARTS){
  const li = document.createElement("button"); li.type = "button"; li.className = "pt"; li.dataset.id = p.id;
  li.innerHTML = `<i class="dot">${p.n}</i><span class="nm">${p.name}</span>`;
  li.onmouseenter = () => { hovered = p; }; li.onmouseleave = () => { hovered = null; };
  li.onclick = () => { setSelected(selected === p ? null : p, true); if (tour) stopTour(); };
  list.appendChild(li);
}
const toast = document.createElement("div"); toast.className = "an-tip an-toast"; labels.appendChild(toast); let toastT = 0;
stage.addEventListener("click", e => { setMouse(e); if (orb.moved > .02){ orb.moved = 0; return; } orb.moved = 0; const p = pick(); if (tour) stopTour();
  if (p && p.id === "capsules" && lastHitCap){ if (lastHitCap === selectedCap) setSelected(null); else selectCap(lastHitCap); return; }
  if (!p){ if (selected) setSelected(null); return; }
  if (p !== selected) setSelected(p); });
/* the selected part wins over a ghost in front of it; acrylic and smoked lids never catch the click */
function pick(){
  ray.setFromCamera(mouse, camera); const hits = ray.intersectObjects(root.children, true); lastHitCap = null;
  let first = null, glassHit = null;
  for (const h of hits){
    const o = h.object, m = o.material; if (!o.isMesh || !o.visible || !m || !m.visible) continue;
    if (m.userData.noPick){ if (!glassHit && o.userData.part === "cage" && !selected) glassHit = byId("cage"); continue; }   /* glass lets the click through; lines and cones never catch it */
    let g = o; while (g && g.visible) g = g.parent; if (g) continue;
    const id = o.userData.part; const p = PARTS.find(q => q.id === id); if (!p) continue;
    if (selected && p !== selected) continue;            // ghosts never answer the pointer
    if (id === "capsules"){ if (o.isInstancedMesh) lastHitCap = capsules[h.instanceId] || null; else { let c = o; while (c && !c.userData.cap) c = c.parent; lastHitCap = c || null; } }
    return p;
  }
  if (!first && glassHit) return glassHit;
  if (first){ if (first.p.id === "capsules"){ let c = first.o; while (c && !c.userData.cap) c = c.parent; lastHitCap = c || null; } return first.p; }
  return null;
}
function selectCap(o){ wake(3500);
  selectedCap = o; animCap = o; selected = byId("capsules"); subFocus = null;
  for (const li of list.children) li.classList.toggle("on", li.dataset.id === "capsules");
  const num = o.name.replace("capsule_", "");
  card.innerHTML = `<span class="n">Capsule #${num}</span><h3>Custom NFC capsule</h3>
    <div class="lines"><p>A 45 mm printed ball with an NFC disc, factory UID.</p><p>The prize is whatever the project loads.</p><p>A token, an NFT, a stock, merch or a code.</p><p>Mapped to the UID in the published inventory.</p></div>
    <div class="inside"><button type="button" disabled><img src="assets/sub/token-silver.webp" alt="" />Token</button><button type="button" disabled><img src="assets/parts/nft.png" alt="" />NFT</button><button type="button" disabled><img src="assets/parts/stock.png" alt="" />Tokenized stock</button><button type="button" disabled><img src="assets/parts/merch.png" alt="" />Merch</button><button type="button" disabled><img src="assets/parts/voucher.png" alt="" />Off chain code</button><button type="button" disabled><img src="assets/parts/gift.png" alt="" />Anything else</button></div>
    <a class="proof" href="https://solana.com" target="_blank" rel="noopener"><img src="assets/chains/solana.jpg" alt="" />UID published in the inventory</a><div class="cnav"><button type="button" data-prev>&larr;</button><button type="button" data-next>&rarr;</button></div><button class="x" type="button" aria-label="Close">&times;</button>`;
  wireCard(); card.classList.add("on"); document.body.classList.add("card-on"); mobileFocus(byId("capsules"));
}
/* outline: a thin chrome blue rim around the hovered part, or around the card item you picked; never on glass */
const outlineMat = new THREE.MeshBasicMaterial({ color:0x8fb8ff, side:THREE.BackSide, toneMapped:false, transparent:true, opacity:.9 });
const outlineScene = new THREE.Scene(); const outlineMeshes = new Map(); const kv = new THREE.Vector3(); const oC = new THREE.Vector3(), oM1 = new THREE.Matrix4(), oM2 = new THREE.Matrix4(), oM3 = new THREE.Matrix4();
function outlinePass(){
  let want = null;
  if (subFocus) want = subFocus.meshes;
  else if (hovered && !selected && !orb.down && !tour){ want = []; for (const ob of hovered.objs) ob.traverse(m => { if (m.isMesh && m.userData.part === hovered.id) want.push(m); }); }
  const keep = new Set((want || []).filter(m => m.visible && m.material && !m.material.userData.base?.tr0 && m.material.opacity > .9 && !m.material.userData.noPick && m.geometry.type !== "TubeGeometry"));
  for (const [src, o] of outlineMeshes) if (!keep.has(src)){ outlineScene.remove(o); outlineMeshes.delete(src); }
  if (!keep.size) return false;
  for (const m of keep){
    let o = outlineMeshes.get(m); if (!o){ o = new THREE.Mesh(m.geometry, outlineMat); outlineMeshes.set(m, o); outlineScene.add(o); }
    m.updateWorldMatrix(true, false); o.matrixAutoUpdate = false; o.matrix.copy(m.matrixWorld);
    const e = m.matrixWorld.elements, sx = Math.hypot(e[0], e[1], e[2]) || 1;
    const bb = m.geometry.boundingBox || (m.geometry.computeBoundingBox(), m.geometry.boundingBox); const sz = bb.getSize(tmpV);
    kv.set(1 + .0016/Math.max(.002, sz.x*sx), 1 + .0016/Math.max(.002, sz.y*sx), 1 + .0016/Math.max(.002, sz.z*sx));
    /* inflate about the mesh's own centre: many geometries carry absolute coordinates, so a scale about the origin would throw thin parts across the room */
    bb.getCenter(oC); o.matrix.multiply(oM1.makeTranslation(oC.x, oC.y, oC.z)).multiply(oM2.makeScale(kv.x, kv.y, kv.z)).multiply(oM3.makeTranslation(-oC.x, -oC.y, -oC.z)); o.matrixWorld.copy(o.matrix);
  }
  return true;
}
/* per material state: the selected part solid, the rest a faint ghost, glass and xray walls handled on their own */
function shade(){
  const sel = selected && !camView ? selected.id : null;
  for (const [k, m] of matCache){
    const id = k.split("|")[0], b = m.userData.base;
    b.op0 ??= m.opacity; b.tr0 ??= m.transparent; b.dw0 ??= m.depthWrite;
    const isSel = sel === id, ghost = !!sel && !isSel;
    const target = ghost ? Math.min(b.op0, id === "capsules" ? .025 : b.tr0 ? .04 : .085) : (isSel && m.userData.xray ? m.userData.xray : b.op0);
    m.opacity += (target - m.opacity)*.18;
    const needT = b.tr0 || m.opacity < b.op0 - .01;
    if (m.transparent !== needT){ m.transparent = needT; m.needsUpdate = true; }
    m.depthWrite = needT ? (b.dw0 && !b.tr0 && m.opacity > .9) : b.dw0;
    m.visible = m.opacity > .01;
    const isHov = hovered && hovered.id === id && !sel && !b.tr0;
    const ei = b.ei + (isHov ? .14 : 0); m.emissiveIntensity += (ei - m.emissiveIntensity)*.2;
  }
}
/* capsule open: the shell turns its NFC disc to you and the lid swings back */
/* capsules: 264 shells drawn as three instanced meshes; the one you hover or open switches to its real meshes */
const inst = { ims:[], hide:new THREE.Matrix4().makeTranslation(0, 0, -50).scale(new THREE.Vector3(1e-4, 1e-4, 1e-4)), m:new THREE.Matrix4() };
function buildInstances(){
  const c0 = capsules[0]; if (!c0) return; const host = c0.parent, src = [];
  c0.traverse(o => { if (o.isMesh) src.push(o); });
  for (const o of src){ const im = new THREE.InstancedMesh(o.geometry, o.material, capsules.length); im.name = "capsule_inst"; im.userData.part = "capsules"; im.userData.local = o.matrix.clone(); im.userData.inLid = o.parent !== c0; im.frustumCulled = false; host.add(im); inst.ims.push(im); }
  for (const c of capsules){ c.userData.meshes = []; c.traverse(o => { if (o.isMesh){ c.userData.meshes.push(o); o.visible = false; const rc = o.raycast; o.raycast = function(r, i){ if (this.visible) rc.call(this, r, i); }; } }); }
}
function syncInstances(){
  if (!inst.ims.length) return;
  for (const im of inst.ims) im.visible = !selectedCap;
  capsules.forEach((c, i) => {
    const live = c === selectedCap || c === animCap || c === capHover;
    for (const o of c.userData.meshes) o.visible = live;
    c.updateMatrix();
    for (const im of inst.ims) im.setMatrixAt(i, live ? inst.hide : inst.m.multiplyMatrices(c.matrix, im.userData.local));
  });
  for (const im of inst.ims){ im.instanceMatrix.needsUpdate = true; im.computeBoundingSphere(); }
}
/* the prize path runs while it is picked: the ball falls, sits on the beam and reader, the servo opens the gate, the ball drops in the tray, the door opens and the tray slides out */
let prizeRig = null, prizeT = 0;
const seg = (t, a, b) => { const k = Math.min(1, Math.max(0, (t - a)/(b - a))); return k*k*(3 - 2*k); };
function prizeStep(dt){
  if (!prizeRig) root.traverse(o => { if (o.userData.prizeRig) prizeRig = o.userData.prizeRig; }); if (!prizeRig) return;
  const on = selected && selected.id === "chute"; if (on) prizeT = (prizeT + dt) % 9.8; else prizeT = 2;
  const t = prizeT, R = prizeRig; let x = 0, y = 0, z = 0;
  if (t < .7){ const k = t/.7; y = -.04; z = .18 - .14*k*k; }
  else if (t < 1.1){ const k = seg(t, .7, 1.1); y = -.04*(1 - k); z = .04*(1 - k); }
  else if (t >= 2.8){ const k = Math.min(1, (t - 2.8)/.3), f = Math.min(1, Math.max(0, (t - 3.1)/.4)); y = .09*k + .05*f; z = -.01*k - .0199*f*f;
    /* it rolls down the slope to the back wall, then along that wall into the back left corner, and taps it */
    const r = Math.max(0, t - 3.5), w = Math.min(r, 1.64), u = Math.max(0, r - 1.64), s = .1385*w*w, b = Math.max(0, r - 2.23); x = Math.max(-.4975, -.721*s - .327*u - .1*u*u) + .005*Math.abs(Math.sin(b*10))*Math.exp(-b*6); y += .693*s; z += .0285*x - .0274*.693*s; }
  const out = seg(t, 6.8, 7.7) - seg(t, 8.1, 8.9);
  R.gate.rotation.x = 1.2*(seg(t, 2.4, 2.8) - seg(t, 3.5, 3.9));
  R.door.rotation.z = 1.8*(seg(t, 6.1, 6.7) - seg(t, 8.9, 9.4));
  R.tray.position.x = .64*out;
  R.ball.position.set(x + (t >= 3.5 ? .64*out : 0), y, z); R.ball.visible = t < 9;
}
function capAnim(dt){
  openK += ((selectedCap ? 1 : 0) - openK)*Math.min(1, dt*4);
  for (const c of capsules){
    c.visible = !selectedCap || c === selectedCap;
    const hv = c === capHover && !selectedCap ? 1.08 : 1; c.scale.x += (hv - c.scale.x)*.25; c.scale.y = c.scale.z = c.scale.x;
    if (c !== animCap){ c.userData.lid.rotation.x = 0; c.userData.lid.position.set(0, 0, 0); c.quaternion.copy(c.userData.q0); continue; }
    const cp = root.worldToLocal(camera.position.clone()); const yaw = Math.atan2(cp.y - c.position.y, cp.x - c.position.x) - Math.PI/2;
    YQ.setFromAxisAngle(ZAX, yaw); c.quaternion.copy(c.userData.q0).slerp(YQ, openK);
    c.userData.lid.position.set(0, -.012*openK, .01*openK); c.userData.lid.rotation.x = 1.15*openK;
  }
  if (!selectedCap && openK < .01) animCap = null;
  syncInstances();
}
const IDQ = new THREE.Quaternion(), YQ = new THREE.Quaternion(), ZAX = new THREE.Vector3(0, 0, 1);
const box = new THREE.Box3(), ctr = new THREE.Vector3(), tmpV = new THREE.Vector3();
const offOf = p => { const o = [0,0,0]; for (const id of [...(p.chain || []), p.id]){ const e = byId(id).ex; o[0] += e[0]*explode; o[1] += e[1]*explode; o[2] += e[2]*explode; } return o; };
const offV = new THREE.Vector3();
function partBox(p, out){ const o = offOf(p); offV.set(o[0], o[1], o[2]); return out.copy(p.lbox).translate(offV).applyMatrix4(root.matrixWorld); }
/* no labels on the model: a small tooltip next to the pointer names what you are about to open */
const tip = document.createElement("div"); tip.className = "an-tip"; labels.appendChild(tip); let tipX = 0, tipY = 0, touch = false;
stage.addEventListener("pointermove", e => { touch = e.pointerType === "touch"; const r = stage.getBoundingClientRect(); tipX = e.clientX - r.left; tipY = e.clientY - r.top; });
stage.addEventListener("pointerleave", () => { mouse.set(-2, -2); hovered = null; });
stage.addEventListener("pointerup", e => { if (e.pointerType === "touch") setTimeout(() => mouse.set(-2, -2), 0); });
function placeLabels(){
  lines.innerHTML = "";
  const p = !touch && !orb.down && !tour && !selectedCap ? (capHover && !selectedCap ? "capsule" : hovered && hovered !== selected ? hovered : null) : null;
  if (!p || list.matches(":hover")){ tip.classList.remove("on"); return; }
  tip.innerHTML = p === "capsule" ? "<b>06</b>Open this capsule" : `<b>${p.n}</b>${p.name}`;
  tip.style.transform = `translate(${Math.round(tipX + 16)}px, ${Math.round(tipY + 14)}px)`; tip.classList.add("on");
}


/* ---------- tour: for the video and the lazy ---------- */
const tourBtn = $("#tour");
function startTour(){ tour = { t:0, i:-1 }; tourBtn.classList.add("on"); tourBtn.querySelector("span").textContent = "Stop tour"; setSelected(null); }
function stopTour(){ tour = null; tourBtn.classList.remove("on"); tourBtn.querySelector("span").textContent = "Play tour"; }
tourBtn.onclick = () => tour ? stopTour() : startTour();
function tourStep(dt){
  tour.t += dt; const T = tour.t, S = 3, N = PARTS.length;
  if (T < 2.5){ if (selected) setSelected(null); orb.th += dt*.12; }
  else if (T < 2.5 + N*S){ const i = Math.floor((T - 2.5)/S); if (i !== tour.i){ tour.i = i; setSelected(PARTS[i]); } }
  else if (T < 2.5 + N*S + 4){ if (tour.i !== 99){ tour.i = 99; selectCap(capsules[Math.floor(capsules.length*.45)]); } }
  else if (T < 2.5 + N*S + 6.5){ if (selected){ setSelected(null); orb.thT = 1.57; orb.phT = 1.3; } }
  else { tour.t = 0; tour.i = -1; }
}

/* ---------- ui bits ---------- */
const q = new URLSearchParams(location.search);
$("#pix").onclick = e => { pixel = !pixel; e.currentTarget.classList.toggle("on", pixel); document.body.classList.toggle("pix", pixel); post.uniforms.pixel.value = pixel ? 1 : 0; scene.background = null; resize(); };
if (q.get("pixel") === "1") $("#pix").click();
$("#reset").onclick = () => { setSelected(null); setExplode(0); orb.px = orb.py = orb.pz = 0; orb.thT = 1.57; orb.phT = 1.3; orb.zoom = 1; if (tour) stopTour(); };
if (q.get("ui") === "min"){ document.body.classList.add("ui-min"); document.getElementById("loader")?.remove(); }

/* ---------- loop: render only while something moves; phones get a lower, self adjusting resolution ---------- */
let prCap = REC ? 2 : LITE ? .85 : innerWidth < 980 ? 1.5 : 2, activeUntil = 0, mouseMoved = false, slow = 0, fast = 0;
const wake = (ms = 2500) => { activeUntil = Math.max(activeUntil, performance.now() + ms); };
for (const ev of ["pointermove", "pointerdown", "pointerup", "wheel", "keydown", "scroll", "touchmove"]) addEventListener(ev, () => wake(), { passive:true });
addEventListener("resize", () => wake());
stage.addEventListener("pointermove", () => { mouseMoved = true; });
let last = performance.now(); let clawRig = null, clawT = 0; const clawQ = new THREE.Quaternion(); const linkB = new THREE.Vector3(), linkD = new THREE.Vector3(), YAX = new THREE.Vector3(0, 1, 0);
function frame(now){
  const raw = now - last, dt = Math.min(.05, raw/1000); last = now; if (pops.length) popStep(dt);
  const clawOn = selected && (selected.id === "claw" || selected.id === "chute");
  if (!(now < activeUntil || tour || clawOn || Math.abs(explodeTarget - explode) > .001 || toastT > 0)){ requestAnimationFrame(frame); return; }
  /* frame time watchdog: drop the resolution a step if the device cannot keep up, raise it back when it can */
  if (REC) slow = fast = 0; else if (raw > 28) slow++; else if (raw < 18) fast++;
  const floor = LITE || document.documentElement.classList.contains("lite") ? .6 : 1;
  if (slow > 40 && prCap > floor){ prCap = Math.max(floor, prCap - .25); slow = fast = 0; resize(); }
  else if (fast > 240 && prCap < (innerWidth < 980 ? 1.5 : 2)){ prCap = Math.min(innerWidth < 980 ? 1.5 : 2, prCap + .25); slow = fast = 0; resize(); }
  if (tour) tourStep(dt); else { orb.idle += dt; if (false) orb.th += dt*.08; if (!orb.down){ orb.vth *= .9; orb.vph *= .9; orb.th += orb.vth; orb.ph = Math.min(1.5, Math.max(.35, orb.ph + orb.vph)); } }
  explode += (explodeTarget - explode)*Math.min(1, dt*4.5);
  if (!orb.down && !orb.pan && !tour && mouseMoved){ mouseMoved = false; const p = pick(); if (p !== hovered && !(hovered && list.matches(":hover"))) hovered = p; capHover = p && p.id === "capsules" ? lastHitCap : null; stage.style.cursor = p ? "pointer" : "grab"; }
  /* the claw closes and opens while it is picked, then waits open */
  if (!clawRig) root.traverse(o => { if (o.userData.clawRig) clawRig = o.userData.clawRig; });
  if (clawRig){ clawT = clawOn && selected.id === "claw" ? clawT + dt : 0; const want = clawT ? .55*(.5 + .5*Math.cos(clawT*1.7)) : .55;
    if (Math.abs(want - clawRig.open) > .0005) clawRig.set(clawRig.open + (want - clawRig.open)*Math.min(1, dt*8)); }
  prizeStep(dt);
  if (toastT > 0 && (toastT -= dt) <= 0) toast.classList.remove("on");
  applyExplode(); shade(); capAnim(dt); easeCam(dt); cam();
  renderer.toneMappingExposure += ((selected ? 1.08 : 1.0) - renderer.toneMappingExposure)*Math.min(1, dt*4);
  if (pixel){ renderer.setRenderTarget(rt); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, camera); renderer.setRenderTarget(null); post.uniforms.t.value = now/1000; renderer.render(postScene, postCam); }
  else { renderer.render(scene, camera); if (outlinePass()){ renderer.autoClear = false; renderer.render(outlineScene, camera); renderer.autoClear = true; } }
  placeLabels();
  if (!REC) requestAnimationFrame(frame);
}
load().then(() => {
  root.traverse(o => { if (o.isMesh && !/pushrod/.test(o.name)){ o.updateMatrix(); o.matrixAutoUpdate = false; } });
  if (LITE || innerWidth < 980){ const sh = matCache.get("capsules|shell"); if (sh){ sh.side = THREE.FrontSide; sh.clearcoat = 0; sh.needsUpdate = true; } }
  buildInstances(); syncInstances();
  wake(4000); resize(); cam(); document.body.classList.add("ready"); if (q.get("tour") === "1") startTour(); requestAnimationFrame(frame); window.__anatomy = { setExplode, setSelected, selectCap, capsules, PARTS, startTour, orb, check, setSub, recFrame:(t, T) => { const k = t/T, ease = x => x < .5 ? 4*x*x*x : 1 - Math.pow(-2*x + 2, 3)/2;
    explodeTarget = explode = k < .16 ? 0 : k < .42 ? ease((k - .16)/.26) : k < .6 ? 1 : k < .86 ? 1 - ease((k - .6)/.26) : 0;
    orb.th = (+(new URLSearchParams(location.search).get("th")) || 1.42) + .22*Math.sin(2*Math.PI*k); orb.ph = 1.2; orb.vth = orb.vph = 0; activeUntil = 1e15; frame(performance.now()); return renderer.domElement.toDataURL("image/png"); }, hover:p => { hovered = p; }, story:STORY ? { THREE, scene, root, camera, renderer, matCache, capsules, ents, shade, syncInstances, view, setAnimCap:c => { animCap = c; }, setSel:id => { selected = id ? PARTS.find(p => p.id === id) : null; } } : null, dbg:() => ({ openK, animCap:animCap && animCap.name, selectedCap:selectedCap && selectedCap.name, lid:animCap && animCap.userData.lid.rotation.x }) }; })
  .catch(e => { console.error(e); $("#stage").classList.add("err"); });
