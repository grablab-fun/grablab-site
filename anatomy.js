/* ============ ANATOMY : Prototype 01 Rev B, exploded, interactive, pixel-art rendered ============
   The machine is the SimArena physics scene (lab/grablab-claw-revb.scene.json + the mechanism asset), so what you
   explode here is the same geometry the physics lab drives and Aethelark builds. Three.js, self-hosted.
   Render: the scene draws into a small target (1/3 res) with a depth texture, then one quad shader posterises the
   colours to the Grablab palette, dithers, draws outlines from depth and luminance steps, and scales up with hard pixels. */
import * as THREE from "./assets/vendor/three.module.min.js";

const $ = s => document.querySelector(s);
const PARTS = [
  { id:"base", n:"01", name:"Base and panel", spec:"QR, E-stop, prize drawer", ph:0.98, th:0.95, ents:["base_box"], anchor:[-.3,-.48,.12], ex:[0,0,0],
    text:"1000 x 200 x 110 mm, under the tray. Scan the QR, play from the browser. E-stop on the 12 V line. The drawer at the front gives you the prize.",
    subs:[["E-stop, 22 mm", -.415,-.48,.116], ["QR plate", -.324,-.48,.116], ["Wordmark", -.02,-.48,.116], ["Fan + grille", .34,-.48,.07], ["Power inlet", .3,.49,.07], ["Prize drawer", .2,-.53,.07]], proof:"No joystick. Browser only" },
  { id:"electronics", n:"02", name:"Electronics", spec:"Raspberry Pi, OPTIGA Trust M, motion board", ph:0.92, th:0.95, ents:["electronics"], ex:[0,-.56,.06],
    text:"One shelf in the base. Raspberry Pi runs the play and the stream. The motion board steps the gantry and the winch. OPTIGA Trust M signs each event. Its key never leaves the chip.",
    subs:[["Raspberry Pi", -.38,-.38,.04], ["OPTIGA Trust M shield", -.38,-.38,.058], ["Motion board", -.21,-.38,.036], ["12 V supply", -.01,-.38,.04], ["Claw driver", -.29,-.31,.036], ["WAGO terminals", -.07,-.305,.036], ["Beam relay", -.1,-.31,.04]], proof:"Signed on peaqOS" },
  { id:"tray", n:"03", name:"Prize tray", spec:"MDF 18 mm, raised", ph:1.0, th:1.2, ents:["floor_mdf"], anchor:[-.47,-.3,.25], ex:[0,0,.42],
    text:"Black MDF, 18 mm, 150 mm above the base. A rim all round. The chute opening sits front right.",
    subs:[["MDF floor, black", 0,.1,.22], ["Rim, 45 mm", -.47,0,.26], ["Chute opening, 160 mm", .38,-.39,.22]], proof:"Watched by the play camera" },
  { id:"chute", n:"04", name:"Chute", spec:"beam, camera, NFC cradle, servo flap", ph:1.02, th:0.45, ents:["chute"], ex:[.36,-.38,.48],
    text:"160 mm opening, funnel to 90 mm. The capsule breaks the beam, the camera keeps the frames, the cradle reads the tag. The flap opens only after the read.",
    subs:[["Guard glass + frame", .46,-.4,.3], ["Break beam pair", .31,-.44,.19], ["Chute camera + LED", .38,-.32,.19], ["Funnel, 160 to 90", .38,-.39,.15], ["Ramp", .4,-.4,.062], ["NFC cradle, PN532", .38,-.312,.06], ["Servo flap, MG90S", .333,-.31,.07], ["Chute camera", .3,-.3,.44]], proof:"Seen twice: beam and camera" },
  { id:"capsules", n:"05", name:"Capsules", spec:"50 mm shells, NTAG215 inside", ph:1.0, th:0.95, ents:["capsules"], anchor:[.35,-.2,.27], ex:[0,0,.62],
    text:"50 mm, two halves. An NTAG215 sticker inside, factory UID, read only. The inventory maps each UID to a prize before the night. Click one.",
    subs:[["50 mm shell", 0,-.1,.25], ["NTAG215 sticker inside", -.2,.1,.25], ["Gold or violet halves", .2,.2,.25]], proof:"Inventory on chain" },
  { id:"frame", n:"06", name:"Frame", spec:"2020 V-slot, black anodised", ph:1.1, th:0.95, ents:["frame"], anchor:[-.49,-.49,.92], ex:[0,0,.3],
    text:"2020 V-slot, black anodised. A 1000 mm cube: 12 bars, 4 posts, cast corners. A third ring at 150 mm carries the tray. No glass.",
    subs:[["4 posts, 1000 mm", -.49,-.49,.5], ["Top ring", 0,-.49,.99], ["Floor ring, 150 mm", .49,0,.192], ["Corner brackets", .47,-.47,.97], ["Rubber feet", .49,.49,.006]], proof:"Open by design" },
  { id:"gantry", n:"07", name:"Gantry", spec:"H-bot, two NEMA 17", ph:1.15, th:2.35, ents:["gantry_static","move_y"], anchor:[.49,.2,1.0], ex:[0,0,1.3],
    text:"Two Y rails, one 2040 X beam, MGN12 blocks. H-bot: one GT2 loop, both NEMA 17 fixed to the frame. Play camera in the top front corner.",
    subs:[["Y rail, left", -.49,0,1.004], ["Y rail, right", .49,0,1.004], ["X beam, 2040", 0,0,1.033], ["Y motors, NEMA 17", .526,.451,1.01], ["GT2 belt", -.503,0,1.007], ["Drag chain", -.515,.1,.995], ["Play camera", -.415,-.455,.945]], proof:"Position known to the step" },
  { id:"winch", n:"08", name:"Carriage and winch", spec:"pancake NEMA 17, printed spool", ph:1.0, th:1.1, ents:["move_x"], chain:["gantry"], ex:[0,0,-.3],
    text:"One block on the X rail. Pancake NEMA 17, printed 30 mm spool, 2 mm Dyneema. Z end stop at the top, stall detect at the bottom.",
    subs:[["MGN12 block", 0,0,1.061], ["Winch spool, 30 mm", 0,-.045,.985], ["Pancake NEMA 17", .042,-.045,.985], ["POV camera", -.048,-.045,.975], ["Z end stop", .03,-.06,1.076], ["Cable gland", .024,-.049,1.003]], proof:"Same depth every play" },
  { id:"claw", n:"09", name:"Claw", spec:"3 fingers, 12 V linear actuator", ph:1.08, th:0.95, ents:["seg_1"], focus:["seg_8"], chain:["gantry","winch"], ex:[0,0,-.42],
    text:"Three printed fingers. A 30 mm linear actuator opens them, a spring closes them. That closing force is the grip we publish. A 6 core coiled cable brings the 12 V down.",
    subs:[["Swivel on Dyneema", 0,-.045,.972], ["Coil cable, 6 core", .028,-.045,.95], ["Hub, 12 V actuator", 0,-.045,.915], ["Chrome collar", .024,-.045,.893], ["3 printed fingers", .035,-.045,.86], ["Rubber tips", .04,-.045,.825]], proof:"Grip measured before you play" }
];
const KEEP = new Set(["frame","floor_mdf","base_box","electronics","chute","gantry_static","claw"]);
const byId = id => PARTS.find(p => p.id === id);
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
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene(); scene.background = null; const PIXBG = new THREE.Color(0x0a0c1a);
const camera = new THREE.PerspectiveCamera(32, 1, .05, 40);
const root = new THREE.Group(); root.rotation.x = -Math.PI/2; scene.add(root);   // z-up scene into y-up three

/* ---------- lights ---------- */
scene.add(new THREE.HemisphereLight(0xc3caff, 0x141830, 1.3));
const key = new THREE.DirectionalLight(0xf3f5ff, 2.5); key.position.set(-1.4, 2.6, 2.2); scene.add(key);
key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -.0004; key.shadow.normalBias = .02;
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

/* ---------- scene loader: SimArena json -> three meshes, grouped by entity ---------- */
const matCache = new Map(), ents = new Map(), partOf = new Map();
function material(mats, name, part){
  const k = part + "|" + name; if (matCache.has(k)) return matCache.get(k);
  const OVR = { tray:[.045,.047,.055,1], base:[.04,.042,.05,1], alu:[.02,.02,.025,1], cap_gold:[1,.62,.16,1], cap_violet:[.52,.42,1,1], pcb:[.05,.36,.16,1], pcb_red:[.55,.08,.08,1], pcb_blue:[.08,.18,.7,1], psu:[.72,.73,.76,1] };
  const d = mats[name] || { rgba:[.5,.5,.5,1] }, c = OVR[name] || d.rgba;
  const m = name.startsWith("cap_") ? new THREE.MeshPhysicalMaterial({ side:THREE.DoubleSide, color:new THREE.Color(c[0]*.85, c[1]*.85, c[2]*.85), metalness:.08, roughness:.32, clearcoat:1, clearcoatRoughness:.1, emissive:new THREE.Color(c[0], c[1], c[2]), emissiveIntensity:.03 })
    : new THREE.MeshStandardMaterial({ color:new THREE.Color(c[0], c[1], c[2]), metalness:d.metalness ?? .2, roughness:d.roughness ?? .6,
    transparent:c[3] < 1, opacity:c[3] < 1 ? Math.max(.12, c[3]*1.6) : 1, emissive:new THREE.Color(c[0], c[1], c[2]), emissiveIntensity:d.emission || 0 });
  if (c[3] < 1) m.depthWrite = false;
  m.userData.base = { opacity:m.opacity, ei:m.emissiveIntensity }; matCache.set(k, m); return m;
}
const GEO = { box:{}, cyl:{}, sph:{}, cap:{} };
function geometry(g){
  if (g.type === "box"){ const k = g.size.join(","); return GEO.box[k] ||= new THREE.BoxGeometry(g.size[0], g.size[1], g.size[2]); }
  if (g.type === "cylinder"){ const k = g.radius + "," + g.height; return GEO.cyl[k] ||= new THREE.CylinderGeometry(g.radius, g.radius, g.height, 18).rotateX(Math.PI/2); }
  if (g.type === "sphere"){ const k = g.radius; return GEO.sph[k] ||= new THREE.SphereGeometry(g.radius, 20, 14); }
  if (g.type === "capsule"){ const k = g.radius + "," + g.height; return GEO.cap[k] ||= new THREE.CapsuleGeometry(g.radius, g.height, 4, 10).rotateX(Math.PI/2); }
  return null;
}
function addGeoms(obj, geoms, mats, part){
  for (const g of geoms){
    if (g.material === "invis" || g.material === "logo" || g.type === "plane") continue;
    const geo = geometry(g); if (!geo) continue;
    const m = new THREE.Mesh(geo, material(mats, g.material, part));
    if (g.pos) m.position.set(...g.pos); if (g.quat) m.quaternion.set(g.quat[1], g.quat[2], g.quat[3], g.quat[0]);
    m.userData.part = part; m.castShadow = true; m.receiveShadow = true; obj.add(m);
  }
}
function entityObj(e, mats, part){
  const o = new THREE.Group(); o.name = e.name;
  const t = e.transform || {}; if (t.pos) o.position.set(...t.pos); if (t.quat) o.quaternion.set(t.quat[1], t.quat[2], t.quat[3], t.quat[0]);
  addGeoms(o, e.geoms || [], mats, part); ents.set(e.name, o); partOf.set(e.name, part); return o;
}
const partFor = n => { for (const p of PARTS) if (p.ents.includes(n)) return p.id; return null; };
const capsules = [], mech = {};
let GEO_TOP, GEO_BOT, GEO_TAG, GEO_COIN, tagMat, coinMat, coinFace, tagTex;
function buildCapsule(e, mats){
  const o = new THREE.Group(); o.name = e.name; const t = e.transform || {};
  if (t.pos) o.position.set(...t.pos); if (t.quat) o.quaternion.set(t.quat[1], t.quat[2], t.quat[3], t.quat[0]);
  const R = .03, shell = material(mats, e.geoms[0].material, "capsules");
  GEO_TOP ||= new THREE.SphereGeometry(R, 48, 32, 0, Math.PI*2, 0, Math.PI/2).rotateX(Math.PI/2);
  GEO_BOT ||= new THREE.SphereGeometry(R, 48, 32, 0, Math.PI*2, Math.PI/2, Math.PI/2).rotateX(Math.PI/2);
  if (!tagMat){
    const cv = document.createElement("canvas"); cv.width = cv.height = 256; const g = cv.getContext("2d");
    g.fillStyle = "#f4f4f6"; g.beginPath(); g.arc(128, 128, 126, 0, Math.PI*2); g.fill();
    g.strokeStyle = "#8a5a1e"; g.lineWidth = 9; for (let r = 40; r <= 104; r += 16){ g.beginPath(); g.arc(128, 128, r, 0, Math.PI*2); g.stroke(); }
    g.fillStyle = "#1a1a1a"; g.fillRect(118, 112, 20, 32); g.font = "700 22px Satoshi, system-ui, sans-serif"; g.fillStyle = "#333"; g.textAlign = "center"; g.fillText("NTAG215", 128, 236);
    tagTex = new THREE.CanvasTexture(cv); tagTex.colorSpace = THREE.SRGBColorSpace;
    tagMat = new THREE.MeshStandardMaterial({ map:tagTex, roughness:.7, metalness:0 });
    coinMat = new THREE.MeshPhysicalMaterial({ color:0xffc04a, metalness:1, roughness:.18, clearcoat:.6, emissive:0xffb347, emissiveIntensity:.25 });
    /* the coin face carries the G mark */
    const fc = document.createElement("canvas"); fc.width = fc.height = 256; const fg = fc.getContext("2d"); fg.fillStyle = "#e9a93a"; fg.fillRect(0, 0, 256, 256);
    coinFace = new THREE.MeshPhysicalMaterial({ map:new THREE.CanvasTexture(fc), metalness:.9, roughness:.22, clearcoat:.6 }); coinFace.map.colorSpace = THREE.SRGBColorSpace;
    const im = new Image(); im.onload = () => { fg.drawImage(im, 40, 40, 176, 176); coinFace.map.needsUpdate = true; }; im.src = "assets/brand/mark-chrome-256.png";
    GEO_TAG = new THREE.CylinderGeometry(.019, .019, .0012, 40).rotateX(Math.PI/2); GEO_COIN = new THREE.CylinderGeometry(.011, .011, .004, 48);
    /* register them under the capsules part so isolation hides them with the shells */
    for (const [k, m] of [["capsules|tag", tagMat], ["capsules|coin", coinMat], ["capsules|coinface", coinFace]]){ m.userData.base = { opacity:1, ei:m.emissiveIntensity }; matCache.set(k, m); }
  }
  const lid = new THREE.Group(); const top = new THREE.Mesh(GEO_TOP, shell); lid.add(top);
  const bot = new THREE.Mesh(GEO_BOT, shell), seam = new THREE.Mesh(geometry({ type:"cylinder", radius:R + .0006, height:.0035 }), material(mats, "seam", "capsules"));
  const tag = new THREE.Mesh(GEO_TAG, tagMat); tag.position.z = -.012; const coin = new THREE.Mesh(GEO_COIN, [coinMat, coinFace, coinMat]); coin.position.set(.003, .004, 0); coin.rotation.set(-.55, .3, .2);
  [top, bot, seam, tag, coin].forEach(m => { m.userData.part = "capsules"; m.castShadow = true; m.receiveShadow = true; });
  o.add(lid, bot, seam, tag, coin); o.userData.lid = lid; o.userData.q0 = o.quaternion.clone(); o.userData.cap = true;
  ents.set(e.name, o); partOf.set(e.name, "capsules"); return o;
}
async function load(){
  const [sc, as] = await Promise.all([fetch("lab/grablab-claw-revb.scene.json?v=14").then(r => r.json()), fetch("lab/grablab-claw-revb-mech.asset.json?v=14").then(r => r.json())]);
  const capsGroup = new THREE.Group(); capsGroup.name = "capsules"; root.add(capsGroup); ents.set("capsules", capsGroup);
  for (const e of sc.entities){
    if (/^capsule_/.test(e.name)){ const o = buildCapsule(e, sc.material); capsGroup.add(o); o.userData.home = o.position.clone(); capsules.push(o); continue; }
    if (!KEEP.has(e.name)) continue;
    if (e.asset){
      /* mechanism: parent by relation, asset materials; parts by entity name */
      const by = new Map();
      for (const m of as.entities){ const p = partFor(m.name) || (m.name.startsWith("seg_") || m.name.startsWith("finger_") ? "claw" : "gantry"); by.set(m.name, entityObj(m, as.material, p)); }
      for (const m of as.entities){ const o = by.get(m.name); (m.relation ? by.get(m.relation.parent) : root).add(o); mech[m.name] = { o, j:m.joint }; }
      continue;
    }
    root.add(entityObj(e, sc.material, partFor(e.name)));
  }
  /* electronics details: USB and ethernet blocks, GPIO header, HDMI, PSU terminal block, board standoffs */
  (function details(){
    const el = ents.get("electronics"); if (!el) return; const M = (n, r) => new THREE.MeshStandardMaterial({ color:n, metalness:r ? .9 : .1, roughness:r ? .3 : .5 });
    const steel = M(0xb8bcc4, 1), black = M(0x111114), yellow = M(0xd8c26a), green = M(0x3a8a4a); [steel, black, yellow, green].forEach((m, i) => { m.userData.base = { opacity:1, ei:0 }; matCache.set("electronics|d" + i, m); });
    const add = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.userData.part = "electronics"; o.castShadow = o.receiveShadow = true; el.add(o); };
    const B = (a, b, c) => new THREE.BoxGeometry(a, b, c);
    add(B(.016, .013, .016), steel, -.345, -.395, .041); add(B(.016, .013, .016), steel, -.345, -.375, .041);   // USB stacks
    add(B(.016, .016, .013), steel, -.345, -.355, .0395);                                                          // ethernet
    add(B(.052, .005, .009), black, -.38, -.352, .0375);                                                            // GPIO header
    add(B(.007, .012, .004), steel, -.4, -.405, .035);                                                              // HDMI
    add(B(.004, .004, .012), yellow, -.351, -.39, .058); add(B(.004, .004, .012), yellow, -.409, -.39, .058);       // shield standoffs
    add(B(.02, .09, .012), green, .05, -.38, .024);                                                                 // PSU terminal block
    for (let i = 0; i < 6; i++) add(B(.003, .003, .006), steel, .05, -.42 + i*.016, .033);
  })();
  /* detail packs: the SimArena scene only carries what physics needs; the page shows the rest of the parts list */
  (function detailPacks(){
    const mats = {};
    const M = (k, o) => mats[k] ||= (() => { const m = new THREE.MeshStandardMaterial(o); m.userData.base = { opacity:m.opacity, ei:m.emissiveIntensity }; return m; })();
    const reg = (part, m, k) => { const key = part + "|dp_" + k; if (!matCache.has(key)) matCache.set(key, m); return m; };
    const steel = o => M("steel", { color:0xb9bdc6, metalness:.95, roughness:.28 }), black = o => M("black", { color:0x121216, metalness:.15, roughness:.55 }),
      dark = o => M("dark", { color:0x24262e, metalness:.3, roughness:.5 }), red = o => M("red", { color:0xd01c22, metalness:.1, roughness:.35 }),
      white = o => M("white", { color:0xe9e9ee, metalness:0, roughness:.5 }), cable = o => M("cable", { color:0x0b0b0e, metalness:.1, roughness:.45 }),
      copper = o => M("copper", { color:0xb87333, metalness:.9, roughness:.35 }), green = o => M("green", { color:0x2f7a3e, metalness:.1, roughness:.5 }),
      blue = o => M("blue", { color:0x1f4fd1, metalness:.6, roughness:.3 }), plastic = o => M("plastic", { color:0x3a3c46, metalness:.05, roughness:.6 }),
      led = o => M("led", { color:0xffffff, emissive:0x9cc0ff, emissiveIntensity:1.6, roughness:1 }), dyn = o => M("dyn", { color:0x3a3a40, roughness:.7 });
    const B = (a, b, c) => new THREE.BoxGeometry(a, b, c), C = (r, h, n = 24) => new THREE.CylinderGeometry(r, r, h, n).rotateX(Math.PI/2);
    const Cx = (r, h, n = 24) => new THREE.CylinderGeometry(r, r, h, n).rotateZ(Math.PI/2), Cy = (r, h, n = 24) => new THREE.CylinderGeometry(r, r, h, n);
    function put(part, ent, geo, m, x, y, z, rot){
      const mat = typeof m === "function" ? m() : m; const o = new THREE.Mesh(geo, reg(part, mat, mat.uuid)); o.position.set(x, y, z); if (rot) o.rotation.set(...rot);
      o.userData.part = part; o.castShadow = o.receiveShadow = true; ents.get(ent).add(o); return o;
    }
    /* a cable between two points */
    function wire(part, ent, m, a, b, r = .002){
      const d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), L = d.length();
      const o = put(part, ent, new THREE.CapsuleGeometry(r, L, 3, 8), m, (a[0] + b[0])/2, (a[1] + b[1])/2, (a[2] + b[2])/2);
      o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return o;
    }

    /* 01 base: drawer pulled out on slides, 40 mm fan behind the grille, power inlet with switch and fuse, panel screws, cable gland + sleeve, tray brackets */
    const bb = "base_box";
    put("base", bb, B(.15, .19, .062), dark, .2, -.385, .056);                                  // drawer body
    put("base", bb, B(.17, .05, .075), black, .2, -.51, .062);                                   // drawer face, pulled 30 mm
    put("base", bb, B(.06, .006, .006), steel, .2, -.537, .085);                                 // handle
    [.122, .278].forEach(x => put("base", bb, B(.004, .19, .012), steel, x, -.385, .03));        // slides
    put("base", bb, C(.021, .01), black, .34, -.468, .072); put("base", bb, C(.006, .012), dark, .34, -.462, .072);   // fan + hub
    for (let i = 0; i < 5; i++) put("base", bb, B(.036, .002, .003), plastic, .34, -.466, .072, [0, i*Math.PI/5, 0]);  // blades
    put("base", bb, B(.03, .018, .024), black, .28, .488, .07); put("base", bb, B(.012, .006, .016), red, .33, .49, .07); put("base", bb, C(.005, .012), plastic, .36, .49, .07);  // IEC inlet, rocker, fuse
    [[-.455, .035], [-.455, .185], [0, .035], [0, .185], [.455, .035], [.455, .185]].forEach(([x, z]) => put("base", bb, C(.0035, .002, 12), black, x, -.4855, z));   // panel screws
    put("base", bb, C(.009, .02), black, -.44, .49, .11); wire("base", bb, cable, [-.44, .5, .11], [-.44, .5, .19], .004);  // gland + sleeve up the rear post
    [[-.46, -.46], [.46, -.46], [-.46, .46], [.46, .46]].forEach(([x, y]) => { put("base", bb, B(.03, .03, .003), steel, x, y, .2); put("base", bb, B(.003, .03, .03), steel, x + (x < 0 ? .0135 : -.0135), y, .187); });  // tray brackets
    [[-.44, -.44], [.44, -.44], [-.44, .44], [.44, .44]].forEach(([x, y]) => put("base", bb, C(.016, .01), plastic, x, y, .015));   // rubber feet

    /* 02 electronics: shelf plate, standoffs, wiring, relay for the beam sensor, SD card, USB lead */
    const el = "electronics";
    put("electronics", el, B(.64, .22, .004), dark, -.2, -.385, .029);                           // shelf plate
    [[-.42, -.405], [-.34, -.355], [-.26, -.41], [-.16, -.35], [.05, -.42], [-.08, -.34]].forEach(([x, y]) => put("electronics", el, Cy(.0025, .01, 8), steel, x, y, .036));   // standoffs
    put("electronics", el, B(.04, .03, .0016), M("pcbb", { color:0x12309a, roughness:.45 }), -.1, -.31, .033); put("electronics", el, B(.016, .012, .012), black, -.1, -.31, .04);   // relay module
    put("electronics", el, B(.011, .015, .001), black, -.424, -.38, .037);                      // SD card
    wire("electronics", el, cable, [-.345, -.37, .046], [-.265, -.395, .045], .0025);          // Pi to motion board USB
    wire("electronics", el, M("wred", { color:0xc0262b, roughness:.5 }), [.04, -.43, .036], [-.165, -.43, .04]); wire("electronics", el, cable, [.04, -.425, .034], [-.165, -.425, .038]);   // 12 V to the board
    wire("electronics", el, M("wred", { color:0xc0262b, roughness:.5 }), [-.07, -.3, .04], [-.29, -.3, .04]); wire("electronics", el, cable, [-.07, -.295, .038], [-.29, -.295, .038]);      // WAGO to claw driver
    wire("electronics", el, cable, [-.1, -.3, .04], [-.1, -.27, .06], .002);                   // relay to the beam sensor, leaves the shelf

    /* 03 tray: rim screws, two battens underneath, the tray wears the chute bezel on the physics side already */
    const tr = "floor_mdf";
    [[-.47, -.47], [.47, -.47], [-.47, .47], [.47, .47], [0, -.47], [0, .47]].forEach(([x, y]) => put("tray", tr, Cy(.0035, .002, 12), black, x, y, .266));
    [-.25, .25].forEach(y => put("tray", tr, B(.9, .03, .03), black, 0, y, .187));

    /* 04 chute: the second webcam on a stalk over the guard, lenses on the beam pair, cable to the cradle */
    const ch = "chute";
    put("chute", ch, Cy(.004, .09, 10), steel, .3, -.3, .39); put("chute", ch, B(.034, .026, .022), black, .3, -.3, .44); put("chute", ch, C(.007, .008), M("lens", { color:0x0a0a12, metalness:.8, roughness:.05 }), .3, -.314, .44, [.6, 0, 0]);
    put("chute", ch, C(.0025, .002), led, .31, -.315, .446, [.6, 0, 0]);
    [[.31, -.44], [.45, -.32]].forEach(([x, y]) => put("chute", ch, C(.003, .004, 10), M("lens", { color:0x0a0a12, metalness:.8, roughness:.05 }), x, y, .208));
    wire("chute", ch, cable, [.3, -.3, .35], [.3, -.3, .1], .002); wire("chute", ch, cable, [.38, -.312, .052], [.42, -.28, .03], .0018);

    /* 06 frame: post caps, bracket screws, cable sleeve clipped to the rear left post */
    const fr = "frame";
    [[-.49, -.49], [.49, -.49], [.49, .49], [-.49, .49]].forEach(([x, y]) => put("frame", fr, B(.022, .022, .004), black, x, y, 1.002));
    [[-.47, -.47], [.47, -.47], [.47, .47], [-.47, .47]].forEach(([x, y]) => [.03, .97].forEach(z => put("frame", fr, C(.003, .002, 10), black, x, y + (y < 0 ? -.011 : .011), z, [Math.PI/2, 0, 0])));
    wire("frame", fr, cable, [-.44, .5, .2], [-.44, .5, .975], .004); [.35, .6, .85].forEach(z => put("frame", fr, B(.02, .01, .01), black, -.455, .5, z));

    /* 07 gantry: X and Y end stops, belt clamps, motor connectors, a beam end cap */
    const g = "move_y";
    put("gantry", g, B(.02, .01, .006), M("pcbr", { color:0x8a1b1b, roughness:.5 }), -.44, -.03, .012); put("gantry", g, B(.004, .004, .004), steel, -.432, -.035, .017);   // X min end stop
    [-.1, .1].forEach(x => put("gantry", g, B(.014, .012, .008), plastic, x, -.016, .004));          // belt clamps
    put("gantry", g, B(.012, .014, .01), white, -.525, 0, .024);                                      // X motor connector
    const gs = "gantry_static";
    put("gantry", gs, B(.01, .02, .006), M("pcbr", { color:0x8a1b1b, roughness:.5 }), -.48, -.45, 1.012); // Y min end stop
    [[-.53, .45], [.53, .45]].forEach(([x, y]) => put("gantry", gs, B(.012, .012, .014), white, x, y, 1.035)); // Y motor connectors
    wire("gantry", gs, cable, [-.53, .46, 1.04], [-.515, .4, .999], .0025); wire("gantry", gs, cable, [.53, .46, 1.04], [.52, .49, .99], .0025);

    /* 08 winch: line wound on the spool, motor lead, a swivel hook */
    const w = "move_x";
    for (let i = 0; i < 5; i++) put("winch", w, C(.0158, .0012, 20), dyn, -.016 + i*.007, -.045, -.048, [0, Math.PI/2, 0]);
    wire("winch", w, cable, [.048, -.045, -.05], [.03, -.03, -.01], .002);
    put("winch", w, B(.012, .012, .012), white, .05, -.07, -.03);                                    // winch motor connector

    /* 09 claw: actuator rod, hex nut on the eye, hub gland, three push rods */
    const cl = "seg_8";
    put("claw", cl, C(.003, .03, 10), steel, 0, 0, -.1); put("claw", cl, C(.0045, .004, 6), steel, 0, 0, -.015);
    put("claw", cl, Cx(.004, .01, 10), black, .024, 0, -.03);
    for (let k = 0; k < 3; k++){ const a = k*2*Math.PI/3 + Math.PI/3; put("claw", cl, C(.0015, .028, 8), steel, .012*Math.cos(a), .012*Math.sin(a), -.078); }
  })();
  /* GRABLAB wordmark: real type on a thin emissive plane on the front panel */
  (function wordmark(){
    const cv = document.createElement("canvas"); cv.width = 1024; cv.height = 220; const g = cv.getContext("2d");
    g.fillStyle = "#fff"; g.font = "700 150px Anton, 'Clash Display', Impact, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; try { g.letterSpacing = "6px"; } catch (e) {} g.fillText("GRABLAB", 512, 118);
    const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8;
    const wm = new THREE.MeshBasicMaterial({ map:tx, transparent:true, toneMapped:false }); wm.userData.base = { opacity:1, ei:0 }; matCache.set("base|wordmark", wm);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(.30, .064), wm);
    m.rotation.x = Math.PI/2; m.position.set(-.02, -.4845, .116); m.userData.part = "base"; ents.get("base_box").add(m);
  })();
  /* part roots: the objects that get the explode offset */
  for (const p of PARTS){ p.objs = p.ents.map(n => ents.get(n)).filter(Boolean); p.objs.forEach(o => { o.userData.home = o.position.clone(); }); }
  /* capsules spread a little outward when exploded */
  capsules.forEach(o => { o.userData.spread = new THREE.Vector3(o.userData.home.x*.22, o.userData.home.y*.22, 0); });
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
const orb = { th:.95, ph:1.12, r:3.0, tx:0, ty:.52, tz:0, vth:0, vph:0, down:false, lx:0, ly:0, idle:0, zoom:1 };
const tgt = new THREE.Vector3();
function cam(){
  const sp = Math.sin(orb.ph), c = Math.cos(orb.ph), r = orb.r*orb.zoom;
  camera.position.set(orb.tx + r*sp*Math.cos(orb.th), orb.ty + r*c, orb.tz + r*sp*Math.sin(orb.th));
  tgt.set(orb.tx, orb.ty, orb.tz); camera.lookAt(tgt);
}
stage.addEventListener("pointerdown", e => { orb.down = true; orb.phT = null; orb.thT = null; orb.lx = e.clientX; orb.ly = e.clientY; orb.idle = 0; stage.setPointerCapture(e.pointerId); });
stage.addEventListener("pointermove", e => { mouse.x = (e.clientX - stage.getBoundingClientRect().left)/stage.clientWidth*2 - 1; mouse.y = -((e.clientY - stage.getBoundingClientRect().top)/stage.clientHeight)*2 + 1;
  if (!orb.down) return; orb.vth = (e.clientX - orb.lx)*.006; orb.vph = (e.clientY - orb.ly)*.006; orb.lx = e.clientX; orb.ly = e.clientY; orb.th += orb.vth; orb.ph = Math.min(1.5, Math.max(.35, orb.ph + orb.vph)); orb.moved = (orb.moved || 0) + Math.abs(orb.vth) + Math.abs(orb.vph); });
stage.addEventListener("pointerup", () => { orb.down = false; });
stage.addEventListener("wheel", e => { e.preventDefault(); orb.zoom = Math.min(2.4, Math.max(.45, orb.zoom*(1 + Math.sign(e.deltaY)*.08))); orb.idle = 0; }, { passive:false });
/* where the camera wants to be: the whole machine, or the selected part framed */
const sph = new THREE.Sphere();
function goal(){
  if (selectedCap){ selectedCap.getWorldPosition(tmpV); return { tx:tmpV.x, ty:tmpV.y + .01, tz:tmpV.z, r:.26 }; }
  if (selected){ box.makeEmpty(); for (const o of (selected.focus ? selected.focus.map(n => ents.get(n)) : selected.objs)) o.traverse(m => { if (m.isMesh && m.userData.part === selected.id){ m.getWorldPosition(tmpV); box.expandByPoint(tmpV); } });
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
  for (const p of PARTS) for (const o of p.objs){ o.position.copy(o.userData.home); o.position.x += p.ex[0]*E; o.position.y += p.ex[1]*E; o.position.z += p.ex[2]*E; }
  /* selected part lifts a little more, others step back */
  if (selected) for (const o of selected.objs) o.position.z += .09*liftK;
  for (const c of capsules){ c.position.copy(c.userData.home).addScaledVector(c.userData.spread, E); }
}
let liftK = 0;
function setSelected(p, fromList){
  selected = p; liftK = 0; selectedCap = null; orb.phT = p && p.ph ? p.ph : null; orb.thT = p && p.th != null ? p.th : null; orb.zoom = 1;
  for (const li of list.children) li.classList.toggle("on", !!p && li.dataset.id === p.id);
  if (p){
    card.innerHTML = `<span class="n">${p.n} / 09</span><h3>${p.name}</h3><span class="spec">${p.spec}</span><p>${p.text}</p><div class="inside">${p.subs.map(x => `<span>${x[0]}</span>`).join("")}</div><span class="proof"><i></i>${p.proof}</span><div class="cnav"><button type="button" data-prev>&larr;</button><button type="button" data-next>&rarr;</button></div><button class="x" type="button" aria-label="Close">&times;</button>`;
    card.dataset.n = p.n;
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
  li.innerHTML = `<span class="nm"><b>${p.name}</b><small>${p.spec}</small></span><i class="dot">${p.n}</i>`;
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
const CAPSUBS = [["NFC sticker, factory UID", -.012, -.008, -.011], ["Prize slot, on chain or off", .006, .004, .006], ["Two halves, 50 mm", 0, .02, .05]];
function selectCap(o){
  selectedCap = o; animCap = o; selected = byId("capsules"); liftK = 0;
  for (const li of list.children) li.classList.toggle("on", li.dataset.id === "capsules");
  const num = o.name.replace("capsule_", "");
  card.innerHTML = `<span class="n">Capsule #${num}</span><h3>Custom NFC capsule</h3><span class="spec">50 mm shell, any prize</span>
    <p>NTAG215 inside, factory UID. The prize is whatever the project loads: an SPL token, an NFT, a tokenized stock, merch, an off chain code. Mapped to the UID in the published inventory.</p>
    <div class="inside"><span>SPL token</span><span>NFT</span><span>Tokenized stock</span><span>Merch</span><span>Off chain code</span><span>Anything else</span></div>
    <span class="proof"><i></i>UID published in the inventory</span><div class="cnav"><button type="button" data-prev>&larr;</button><button type="button" data-next>&rarr;</button></div><button class="x" type="button" aria-label="Close">&times;</button>`;
  wireCard(); card.classList.add("on");
}
/* per part material state: hover glow, fade when another part is selected */
function shade(){
  const dimOthers = !!selected;
  for (const [k, m] of matCache){
    const id = k.split("|")[0], base = m.userData.base; const isSel = selected && selected.id === id, isHov = hovered && hovered.id === id;
    m.visible = !dimOthers || isSel;
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
function screenBox(objs, part, W, H){
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
  const show = explode > .35 || selected || hovered;
  const focusObjs = selectedCap ? [selectedCap] : selected ? (selected.focus ? selected.focus.map(n => ents.get(n)) : selected.objs) : [root];
  const sb = screenBox(focusObjs, selected && !selectedCap ? selected.id : null, W, H);
  const proj = () => { const sc = ctr.clone().project(camera); return sc.z > 1 ? null : [(sc.x*.5 + .5)*W, (-sc.y*.5 + .5)*H]; };
  for (const p of PARTS){
    const d = lab[p.id];
    if (p.anchor){ const o = offOf(p); ctr.set(p.anchor[0] + o[0], p.anchor[1] + o[1], p.anchor[2] + o[2]); root.localToWorld(ctr); }
    else { let n = 0; ctr.set(0, 0, 0); for (const o of p.objs) o.traverse(m => { if (m.isMesh && m.userData.part === p.id){ m.getWorldPosition(tmpV); ctr.add(tmpV); n++; } }); if (!n){ d.style.display = "none"; continue; } ctr.multiplyScalar(1/n); }
    const sp = proj();
    const vis = show && sp && !selectedCap && (selected ? selected.id === p.id : (explode > .35 || (hovered && hovered.id === p.id)));
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
  if (!motionOn){ for (let k = 1; k <= 3; k++) mech["finger_" + k].o.rotation.y = -.95; return; } CY.t = (CY.t + dt) % 22;
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
$("#reset").onclick = () => { setSelected(null); setExplode(0); orb.th = .95; orb.ph = 1.12; orb.zoom = 1; if (tour) stopTour(); };
if (q.get("ui") === "min"){ document.body.classList.add("ui-min"); document.getElementById("loader")?.remove(); }

/* ---------- loop ---------- */
let last = performance.now();
function frame(now){
  const dt = Math.min(.05, (now - last)/1000); last = now;
  if (tour) tourStep(dt); else { orb.idle += dt; if (false) orb.th += dt*.08; if (!orb.down){ orb.vth *= .9; orb.vph *= .9; orb.th += orb.vth; orb.ph = Math.min(1.5, Math.max(.35, orb.ph + orb.vph)); } }
  explode += (explodeTarget - explode)*Math.min(1, dt*4.5); liftK += ((selected ? 1 : 0) - liftK)*Math.min(1, dt*5);
  if (!orb.down && !tour){ const p = pick(); if (p !== hovered && !(hovered && list.matches(":hover"))) hovered = p; capHover = p && p.id === "capsules" ? lastHitCap : null; stage.style.cursor = p ? "pointer" : "grab"; }
  applyExplode(); clawCycle(dt); shade(); capAnim(dt); easeCam(dt); cam();
  renderer.toneMappingExposure += ((selected ? 1.15 : 1.0) - renderer.toneMappingExposure)*Math.min(1, dt*4);
  if (pixel){ renderer.setRenderTarget(rt); renderer.render(scene, camera); renderer.setRenderTarget(null); post.uniforms.t.value = now/1000; renderer.render(postScene, postCam); }
  else renderer.render(scene, camera);
  placeLabels();
  requestAnimationFrame(frame);
}
load().then(() => { resize(); cam(); document.body.classList.add("ready"); if (q.get("tour") === "1") startTour(); requestAnimationFrame(frame); window.__anatomy = { setExplode, setSelected, selectCap, capsules, PARTS, startTour, orb, hover:p => { hovered = p; }, dbg:() => ({ openK, animCap:animCap && animCap.name, selectedCap:selectedCap && selectedCap.name, lid:animCap && animCap.userData.lid.rotation.x }) }; })
  .catch(e => { console.error(e); $("#stage").classList.add("err"); });
