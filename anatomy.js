/* ============ ANATOMY : Prototype 01, exploded and interactive ============
   The machine is modelled part by part from the bill of materials and the build tutorial (anatomy-model.js).
   Three.js, self-hosted. An optional pixel post shader posterises to the Grablab palette. */
import * as THREE from "./assets/vendor/three.module.min.js";
import { buildMachine } from "./anatomy-model.js?v=27";

const $ = s => document.querySelector(s);
/* ?rec=1: a clean, transparent, frame by frame render of the machine, for the home page video */
const REC = /[?&]rec=1/.test(location.search); if (REC) document.documentElement.classList.add("rec");
/* subs: [card item, mesh name prefixes it lights up in the model] */
const PARTS = [
  { id:"frame", n:"01", name:"Frame", spec:"40 x 40 profile, matte black", ph:1.15, th:-1.2, anchor:[-.48,-.48,.7], ex:[0,0,0],
    text:["Four 1200 mm posts, 40 x 40 profile, matte black.", "Two floor rails carry the play floor.", "Steel brackets in the corners, rubber feet below."],
    subs:[["Posts", ["frame_post"]], ["Rails", ["frame_rail", "frame_floor_rail"]], ["Angle brackets", ["frame_bracket"]], ["Rubber feet", ["frame_foot"], { ph:1.42, one:true }]], proof:"Built from the parts list" },
  { id:"cage", n:"02", name:"Floor and walls", spec:"12 mm MDF, 3 mm acrylic", ph:1.0, th:-1.2, anchor:[-.3,-.3,.412], ex:[0,0,.2],
    text:["A 12 mm MDF floor with one prize hole.", "The front right corner is the drop zone, a funnel.", "Clear acrylic on all four sides.", "A closed cabinet below, with a side door."],
    subs:[["MDF floor", ["cage_floor"]], ["Drop zone guard and funnel", ["cage_guard", "cage_drop_funnel"]], ["Cable grommets", ["cage_grommet"]], ["Cabinet walls", ["cage_cabinet"]], ["Prize bin door", ["cage_door"]], ["Acrylic walls", []]], proof:"Watched by the play camera" },
  { id:"panel", n:"03", name:"Front panel", spec:"MDF, anodised plates", ph:1.32, th:-1.57, anchor:[.05,.513,.19], ex:[0,.5,0],
    text:["The face of the machine, under the floor.", "Emergency stop, scan to play QR, GRABLAB plate.", "All the electronics sit behind it."],
    subs:[["Emergency stop", ["panel_estop"]], ["Scan to play", ["panel_qr", "panel_scan"]], ["GRABLAB plate", ["panel_wordmark", "panel_trim"]], ["MDF panel", ["panel_mdf", "panel_screw"]]], proof:"No joystick. Browser only" },
  { id:"electronics", n:"04", name:"Electronics", spec:"Boards and wiring on MDF", ph:1.36, th:1.57, anchor:[.04,.47,.145], ex:[0,.24,0],
    text:["Power, motion and claw drivers on one panel.", "The Raspberry Pi runs the play and the stream.", "The OPTIGA Trust M signs every event.", "Its key never leaves the chip."],
    subs:[["OPTIGA Trust M", ["el_optiga"]], ["Raspberry Pi", ["el_pi4", "el_pi_usb", "el_pi_ethernet", "el_pi_heatsink", "el_pi_gpio", "el_pi_post"]], ["Pi case and fan", ["el_picase", "el_pi_fan"]], ["Power supply", ["el_psu"]], ["Motion controller", ["el_uno", "el_cnc", "el_shield", "el_a4988"]], ["Claw driver", ["el_l298n"]], ["5 V supply", ["el_converter", "el_carrier"]], ["Power splitters", ["el_wago"]], ["Wiring", ["el_wire", "el_usb", "el_dupont"]]], proof:"Signed on peaqOS", logo:"assets/brand/partners/peaq-white.svg", href:"https://peaq.xyz" },
  { id:"chute", n:"05", name:"Chute and prize bin", spec:"MDF chute, printed cradle", ph:1.22, th:.4, anchor:[.412,-.34,.3], ex:[.32,-.36,0],
    text:["A closed MDF chute under the prize hole.", "A red light beam sees the capsule fall.", "It lands on a padded trapdoor, filmed up close.", "The NFC reader takes its UID.", "Then the trapdoor drops it into the 30 L bin."],
    subs:[["Chute", ["chute_wall"]], ["Drop sensor, laser beam", ["chute_e3jk", "chute_sensor"]], ["Landing camera", ["chute_c960"]], ["NFC reader", ["chute_acr122u"]], ["Printed cradle", ["chute_cradle", "chute_axle_block"]], ["Trapdoor and servo", ["chute_flap", "chute_axle", "chute_lever", "chute_mg90s", "chute_horn", "chute_pushrod"]], ["Prize bin", ["chute_bin"]]], proof:"Seen twice: beam and camera" },
  { id:"capsules", n:"06", name:"Capsules", spec:"Clear plastic, NFC sticker", ph:1.0, th:-1.2, anchor:[.2,.2,.44], ex:[0,0,.42],
    text:["Clear two piece shells, NFC sticker inside.", "Factory UID, read only.", "Size set by the grip test, then bought or printed.", "Click one to open it."],
    subs:[["Clear two piece shell", []], ["NFC sticker", []], ["Size set by the grip test", []]], proof:"Inventory on chain", logo:"assets/chains/solana.jpg", href:"https://solana.com" },
  { id:"gantry", n:"07", name:"Gantry", spec:"Aluminium V-slot, steel", ph:1.0, th:-1.9, anchor:[.48,-.2,1.06], ex:[0,0,.6],
    text:["Two Y rails and one X beam on V wheels.", "Three stepper motors with toothed belts.", "End stops on X and Y, a drag chain for cables."],
    subs:[["Y rails", ["gantry_y_rail", "gantry_rail_screw"]], ["X beam", ["gantry_x_beam"]], ["Carriages", ["gantry_y_carriage", "gantry_y_wheel", "gantry_matik", "gantry_bracket"]], ["Motors", ["gantry_y_motor", "gantry_x_motor"]], ["Belts and pulleys", ["gantry_y_belt", "gantry_x_belt", "gantry_y_pulley", "gantry_x_pulley", "gantry_y_idler", "gantry_x_idler"]], ["End stops", ["gantry_x_endstop", "gantry_y_endstop"]], ["Drag chain", ["gantry_drag", "gantry_chain"]]], proof:"Position known to the step" },
  { id:"winch", n:"08", name:"Carriage and winch", spec:"Aluminium plate, printed spool", ph:1.15, th:1.15, chain:["gantry"], anchor:[.05,-.0075,1.1], ex:[0,-.22,.12],
    text:["The carriage rides the X beam.", "A stepper winds the line on a printed spool.", "An end stop finds the top."],
    subs:[["Carriage", ["winch_x_carriage", "winch_x_wheel"]], ["Winch motor", ["winch_motor", "winch_mount"]], ["Spool and line", ["winch_spool", "winch_line"]], ["Top end stop", ["winch_z_endstop"]], ["Cable joints", ["winch_wago", "winch_four_core", "winch_chain"]], ["Belt clip", ["winch_x_belt_clip"]]], proof:"Same depth every play" },
  { id:"claw", n:"09", name:"Claw", spec:"Printed body, steel pins", ph:1.1, th:1.2, chain:["gantry", "winch"], anchor:[.096,-.0075,.72], ex:[0,0,-.2], skip:["claw_coil_cable", "claw_line"],
    text:["A printed claw with three fingers.", "A 12 V actuator opens and closes them.", "It hangs from a swivel on the line.", "A coiled cable brings the power down."],
    subs:[["Swivel", ["claw_swivel"]], ["Cap", ["claw_cap"]], ["Linear actuator", ["claw_actuator"]], ["Body", ["claw_body", "claw_hub"]], ["Fingers", ["claw_finger", "claw_pad", "claw_lug", "claw_rod", "claw_bearing", "claw_link", "claw_spreader"]], ["Coil cable", ["claw_coil", "claw_cable_tie"]]], proof:"Grip measured before you play" },
  { id:"camera", n:"10", name:"Play camera", spec:"Webcam on an MDF block", ph:1.25, th:-.55, anchor:[-.44,-.44,.93], ex:[-.15,-.15,.1],
    text:["A webcam in the front corner, tilted down.", "Its picture is the stream you play from."],
    subs:[["Webcam", ["camera_c920"]], ["Mount", ["camera_block", "camera_clip"]]], proof:"The stream you play" }
];
const byId = id => PARTS.find(p => p.id === id);
const ICON = { frame:"assets/parts/post.png", cage:"assets/parts/mdf.png", panel:"assets/parts/estop.png", electronics:"assets/parts/optiga.png", chute:"assets/parts/funnel.png", capsules:"assets/parts/capsule.png", gantry:"assets/parts/rail.png", winch:"assets/parts/spool.png", claw:"assets/parts/claw.png", camera:"assets/parts/webcam.png" };
const SUBICON = {
  "Posts":"assets/parts/post.png", "Rails":"assets/parts/framering.png", "Angle brackets":"assets/parts/bracket.png", "Rubber feet":"assets/parts/foot.png",
  "MDF floor":"assets/parts/mdf.png", "Drop zone guard and funnel":"assets/parts/guard.png", "Cable grommets":"assets/parts/gland.png", "Acrylic walls":"assets/parts/guard.png",
  "Emergency stop":"assets/parts/estop.png", "Scan to play":"assets/parts/qr.png", "GRABLAB plate":"assets/brand/mark-chrome-256.png", "MDF panel":"assets/parts/mdf.png",
  "OPTIGA Trust M":"assets/parts/optiga.png", "Raspberry Pi":"assets/parts/pi.png", "Pi case and fan":"assets/parts/fan.png", "Power supply":"assets/parts/psu.png", "Motion controller":"assets/parts/motionboard.png",
  "Claw driver":"assets/parts/clawdriver.png", "5 V supply":"assets/parts/relay.png", "Power splitters":"assets/parts/wago.png", "Wiring":"assets/parts/coil.png",
  "Chute":"assets/parts/funnel.png", "Drop sensor, laser beam":"assets/parts/beam.png", "Rubber curtain":"assets/parts/guard.png", "Landing camera":"assets/parts/webcam.png", "NFC reader":"assets/parts/nfcreader.png", "Printed cradle":"assets/parts/bracket.png", "Trapdoor and servo":"assets/parts/servo.png", "Prize bin door":"assets/parts/drawer.png", "Prize bin":"assets/parts/drawer.png",
  "Clear two piece shell":"assets/parts/capsule.png", "NFC sticker":"assets/parts/nfcsticker.png", "Size set by the grip test":"assets/parts/capsuleopen.png",
  "Y rails":"assets/parts/rail.png", "X beam":"assets/parts/beam2040.png", "Carriages":"assets/parts/bracket.png", "Motors":"assets/parts/nema17.png", "Belts and pulleys":"assets/parts/belt.png", "End stops":"assets/parts/endstop.png", "Drag chain":"assets/parts/dragchain.png",
  "Carriage":"assets/parts/rail.png", "Winch motor":"assets/parts/nema17.png", "Spool and line":"assets/parts/spool.png", "Top end stop":"assets/parts/endstop.png", "Cable joints":"assets/parts/wago.png", "Belt clip":"assets/parts/belt.png",
  "Swivel":"assets/parts/swivel.png", "Cap":"assets/parts/collar.png", "Linear actuator":"assets/parts/actuator.png", "Body":"assets/parts/claw.png", "Fingers":"assets/parts/claw.png", "Coil cable":"assets/parts/coil.png",
  "Webcam":"assets/parts/webcam.png", "Mount":"assets/parts/bracket.png" };

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
const camera = new THREE.PerspectiveCamera(32, 1, .05, 40);
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

/* ---------- the machine: built from the BOM and the build tutorial (anatomy-model.js), one group per part ---------- */
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
  const M = buildMachine(THREE, { mat, onFont:cb => fonts.then(cb) });
  for (const [id, g] of Object.entries(M.parts)){ root.add(g); ents.set(id, g); }
  /* draw calls: siblings with the same material and the same name become one mesh, so a weak GPU draws ~hundreds, not ~1900.
     Names survive (card items pick meshes by name); anything that moves on its own is left alone. */
  const KEEP = /estop|pushrod|horn|trap|capsule|lever|flap|grommet|view/;
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
const orb = { th:-1.57, ph:1.28, r:3.0, tx:0, ty:.52, tz:0, vth:0, vph:0, down:false, pan:false, px:0, py:0, pz:0, lx:0, ly:0, idle:0, zoom:1 };
const tgt = new THREE.Vector3();
function cam(){
  const sp = Math.sin(orb.ph), c = Math.cos(orb.ph), r = orb.r*orb.zoom;
  const tx = orb.tx + orb.px, ty = orb.ty + orb.py, tz = orb.tz + orb.pz;
  camera.position.set(tx + r*sp*Math.cos(orb.th), ty + r*c, tz + r*sp*Math.sin(orb.th));
  tgt.set(tx, ty, tz); camera.lookAt(tgt);
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
  if (selected){ partBox(selected, box); if (!box.isEmpty()){ box.expandByScalar(.03); return fit(box, .42, 1.12); } }
  whole.makeEmpty(); for (const p of PARTS) if (p.lbox && !p.lbox.isEmpty() && p.id !== "capsules") whole.union(partBox(p, pb));
  return fit(whole, 1.2, 1.04);
}
function easeCam(dt){ measure(); const g = goal(), k = Math.min(1, dt*3.2); if (orb.phT != null){ orb.ph += (orb.phT - orb.ph)*k; if (Math.abs(orb.phT - orb.ph) < .002) orb.phT = null; }
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
let liftK = 0;
/* the meshes of the selected part whose names start with one of the prefixes of a card item */
function subMeshes(p, pre){ const out = []; if (!pre || !pre.length) return out;
  for (const o of p.objs) o.traverse(m => { if (m.isMesh && m.userData.part === p.id && pre.some(s => m.name.startsWith(s))) out.push(m); }); return out; }
function setSub(i){ wake(3500);
  if (!selected) return; const sd = selected.subs[i];
  if (!sd || (subFocus && subFocus.i === i)){ subFocus = null; }
  else { let ms = subMeshes(selected, sd[1]); if (sd[2] && sd[2].one) ms = ms.filter(m => m.position.distanceTo(ms[0].position) < .03); if (!ms.length){ subFocus = null; } else {
    root.updateMatrixWorld(true); const b = new THREE.Box3(); ms.forEach(m => { m.geometry.computeBoundingBox(); b.union(m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld)); });
    subFocus = { i, meshes:ms, box:b }; if (sd[2] && sd[2].ph) orb.phT = sd[2].ph; } }
  card.querySelectorAll(".inside button").forEach((b, k) => b.classList.toggle("on", !!subFocus && subFocus.i === k));
}
function setSelected(p, fromList){ wake(3500);
  selected = p; selectedCap = null; subFocus = null; orb.phT = p && p.ph ? p.ph : null; orb.thT = p && p.th != null ? p.th : null; orb.zoom = 1; orb.px = orb.py = orb.pz = 0;
  for (const li of list.children) li.classList.toggle("on", !!p && li.dataset.id === p.id);
  if (p){
    card.innerHTML = `<span class="n">${p.n} / ${String(PARTS.length).padStart(2, "0")}</span><h3>${p.name}</h3><div class="lines">${p.text.map(t => `<p>${t}</p>`).join("")}</div><div class="inside">${p.subs.map((x, i) => `<button type="button" data-i="${i}"${x[1] && x[1].length ? "" : " disabled"}><img src="${SUBICON[x[0]] || ICON[p.id]}" alt="" />${x[0]}</button>`).join("")}</div>${p.logo ? `<a class="proof" href="${p.href}" target="_blank" rel="noopener"><img src="${p.logo}" alt="" />${p.proof}</a>` : `<span class="proof"><img src="assets/parts/shield.png" alt="" />${p.proof}</span>`}<div class="cnav"><button type="button" data-prev>&larr;</button><button type="button" data-next>&rarr;</button></div><button class="x" type="button" aria-label="Close">&times;</button>`;
    card.classList.add("on"); document.body.classList.add("card-on"); wireCard(); mobileFocus(p);
    card.querySelectorAll(".inside button").forEach(b => { b.onclick = () => setSub(+b.dataset.i); });
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
/* the emergency stop can be pressed: it latches down, a second click twists it back out */
const estop = { ms:[], k:0, on:false }, toast = document.createElement("div"); toast.className = "an-tip an-toast"; labels.appendChild(toast); let toastT = 0;
function estopHit(){ ray.setFromCamera(mouse, camera); for (const h of ray.intersectObjects(root.children, true)){ const o = h.object; if (!o.isMesh || !o.visible || !o.material || !o.material.visible || o.material.userData.noPick) continue; return /^panel_estop_(mushroom|rim)/.test(o.name); } return false; }
function pressEstop(){ estop.on = !estop.on; toast.innerHTML = estop.on ? "<b>E-STOP</b>Pressed. Motors and claw lose power" : "<b>E-STOP</b>Released. The machine can run again"; toast.classList.add("on"); toastT = 2.6; }
stage.addEventListener("click", e => { setMouse(e); if (orb.moved > .02){ orb.moved = 0; return; } orb.moved = 0; if (estopHit()){ pressEstop(); return; } const p = pick(); if (tour) stopTour();
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
    <div class="lines"><p>A clear shell with an NFC sticker, factory UID.</p><p>The prize is whatever the project loads.</p><p>A token, an NFT, a stock, merch or a code.</p><p>Mapped to the UID in the published inventory.</p></div>
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
  const sel = selected ? selected.id : null;
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
/* capsule open: the shell turns its sticker to you and the lid swings back */
/* capsules: 330 shells drawn as three instanced meshes; the one you hover or open switches to its real meshes */
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
  else if (T < 2.5 + N*S + 6.5){ if (selected){ setSelected(null); orb.thT = -1.57; orb.phT = 1.28; } }
  else { tour.t = 0; tour.i = -1; }
}

/* ---------- ui bits ---------- */
const q = new URLSearchParams(location.search);
$("#pix").onclick = e => { pixel = !pixel; e.currentTarget.classList.toggle("on", pixel); document.body.classList.toggle("pix", pixel); post.uniforms.pixel.value = pixel ? 1 : 0; scene.background = null; resize(); };
if (q.get("pixel") === "1") $("#pix").click();
$("#reset").onclick = () => { setSelected(null); setExplode(0); orb.px = orb.py = orb.pz = 0; orb.thT = -1.57; orb.phT = 1.28; orb.zoom = 1; if (tour) stopTour(); };
if (q.get("ui") === "min"){ document.body.classList.add("ui-min"); document.getElementById("loader")?.remove(); }

/* ---------- loop: render only while something moves; phones get a lower, self adjusting resolution ---------- */
let prCap = REC ? 2 : LITE ? .85 : innerWidth < 980 ? 1.5 : 2, activeUntil = 0, mouseMoved = false, slow = 0, fast = 0;
const wake = (ms = 2500) => { activeUntil = Math.max(activeUntil, performance.now() + ms); };
for (const ev of ["pointermove", "pointerdown", "pointerup", "wheel", "keydown", "scroll", "touchmove"]) addEventListener(ev, () => wake(), { passive:true });
addEventListener("resize", () => wake());
stage.addEventListener("pointermove", () => { mouseMoved = true; });
let last = performance.now(), trapG = null, trapT = 0; const linkA = new THREE.Vector3(), linkB = new THREE.Vector3(), linkD = new THREE.Vector3(), XAX = new THREE.Vector3(1, 0, 0), YAX = new THREE.Vector3(0, 1, 0);
function frame(now){
  const raw = now - last, dt = Math.min(.05, raw/1000); last = now;
  const trapOn = selected && selected.id === "chute" && subFocus && /Trapdoor/.test(selected.subs[subFocus.i][0]);
  if (!(now < activeUntil || tour || trapOn || Math.abs(explodeTarget - explode) > .001 || toastT > 0 || estop.k > .001 && estop.k < .999)){ requestAnimationFrame(frame); return; }
  /* frame time watchdog: drop the resolution a step if the device cannot keep up, raise it back when it can */
  if (REC) slow = fast = 0; else if (raw > 28) slow++; else if (raw < 18) fast++;
  const floor = LITE || document.documentElement.classList.contains("lite") ? .6 : 1;
  if (slow > 40 && prCap > floor){ prCap = Math.max(floor, prCap - .25); slow = fast = 0; resize(); }
  else if (fast > 240 && prCap < (innerWidth < 980 ? 1.5 : 2)){ prCap = Math.min(innerWidth < 980 ? 1.5 : 2, prCap + .25); slow = fast = 0; resize(); }
  if (tour) tourStep(dt); else { orb.idle += dt; if (false) orb.th += dt*.08; if (!orb.down){ orb.vth *= .9; orb.vph *= .9; orb.th += orb.vth; orb.ph = Math.min(1.5, Math.max(.35, orb.ph + orb.vph)); } }
  explode += (explodeTarget - explode)*Math.min(1, dt*4.5);
  if (!orb.down && !orb.pan && !tour && mouseMoved){ mouseMoved = false; const p = pick(); if (p !== hovered && !(hovered && list.matches(":hover"))) hovered = p; capHover = p && p.id === "capsules" ? lastHitCap : null; stage.style.cursor = p || estopHit() ? "pointer" : "grab"; }
  /* the trapdoor swings open and shut while its card item is picked */
  if (!trapG) root.traverse(o => { if (o.userData.trap) trapG = o; });
  if (trapG){ const on = selected && selected.id === "chute" && subFocus && /Trapdoor/.test(selected.subs[subFocus.i][0]); trapT = on ? trapT + dt : 0;
    const want = on ? -1.1*(.5 - .5*Math.cos(trapT*2.2)) : 0; trapG.rotation.x += (want - trapG.rotation.x)*Math.min(1, dt*10);
    /* the servo horn turns with the trapdoor and the pushrod follows both ends */
    const L = trapG.userData.link; if (L){ const th = trapG.rotation.x; L.horn.rotation.x = th;
      const A = linkA.set(L.rx, L.horn.position.y - .0115*Math.sin(th), L.horn.position.z + .0115*Math.cos(th));
      const B = linkB.copy(L.lever).applyAxisAngle(XAX, th).add(trapG.position); B.x = L.rx;
      L.rod.position.copy(A).add(B).multiplyScalar(.5); linkD.copy(B).sub(A); L.rod.scale.y = linkD.length(); L.rod.quaternion.setFromUnitVectors(YAX, linkD.normalize());
      L.pins[0].position.set(L.rx - .0015, A.y, A.z); L.pins[1].position.set(L.rx - .0015, B.y, B.z); } }
  if (!estop.ms.length) root.traverse(o => { if (/^panel_estop_(mushroom|rim)/.test(o.name)){ o.userData.y0 = o.position.y; estop.ms.push(o); } });
  estop.k += ((estop.on ? 1 : 0) - estop.k)*Math.min(1, dt*14); for (const o of estop.ms) o.position.y = o.userData.y0 - .007*estop.k;
  if (toastT > 0 && (toastT -= dt) <= 0) toast.classList.remove("on");
  applyExplode(); shade(); capAnim(dt); easeCam(dt); cam();
  renderer.toneMappingExposure += ((selected ? 1.08 : 1.0) - renderer.toneMappingExposure)*Math.min(1, dt*4);
  if (pixel){ renderer.setRenderTarget(rt); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, camera); renderer.setRenderTarget(null); post.uniforms.t.value = now/1000; renderer.render(postScene, postCam); }
  else { renderer.render(scene, camera); if (outlinePass()){ renderer.autoClear = false; renderer.render(outlineScene, camera); renderer.autoClear = true; } }
  placeLabels();
  if (!REC) requestAnimationFrame(frame);
}
load().then(() => {
  root.traverse(o => { if (o.isMesh && !/pushrod|estop/.test(o.name)){ o.updateMatrix(); o.matrixAutoUpdate = false; } });
  if (LITE || innerWidth < 980){ const sh = matCache.get("capsules|shell"); if (sh){ sh.side = THREE.FrontSide; sh.clearcoat = 0; sh.needsUpdate = true; } }
  buildInstances(); syncInstances();
  wake(4000); resize(); cam(); document.body.classList.add("ready"); if (q.get("tour") === "1") startTour(); requestAnimationFrame(frame); window.__anatomy = { setExplode, setSelected, selectCap, capsules, PARTS, startTour, orb, check, setSub, recFrame:(t, T) => { const k = t/T, ease = x => x < .5 ? 4*x*x*x : 1 - Math.pow(-2*x + 2, 3)/2;
    explodeTarget = explode = k < .16 ? 0 : k < .42 ? ease((k - .16)/.26) : k < .6 ? 1 : k < .86 ? 1 - ease((k - .6)/.26) : 0;
    orb.th = -1.2 + .42*Math.sin(2*Math.PI*k); orb.ph = 1.16; orb.vth = orb.vph = 0; activeUntil = 1e15; frame(performance.now()); return renderer.domElement.toDataURL("image/png"); }, hover:p => { hovered = p; }, dbg:() => ({ openK, animCap:animCap && animCap.name, selectedCap:selectedCap && selectedCap.name, lid:animCap && animCap.userData.lid.rotation.x }) }; })
  .catch(e => { console.error(e); $("#stage").classList.add("err"); });
