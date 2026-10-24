/* ============ ANATOMY : Prototype 01 Rev B, exploded, interactive, pixel-art rendered ============
   The machine is the SimArena physics scene (lab/grablab-claw-revb.scene.json + the mechanism asset), so what you
   explode here is the same geometry the physics lab drives and Aethelark builds. Three.js, self-hosted.
   Render: the scene draws into a small target (1/3 res) with a depth texture, then one quad shader posterises the
   colours to the Grablab palette, dithers, draws outlines from depth and luminance steps, and scales up with hard pixels. */
import * as THREE from "./assets/vendor/three.module.min.js";

const $ = s => document.querySelector(s);
const PARTS = [
  { id:"base", n:"01", name:"Base and panel", spec:"QR, E-stop, prize drawer", ents:["base_box"], anchor:[-.3,-.48,.12], ex:[0,0,0],
    text:"The whole machine stands on this box. No joystick: you scan the code and play from the browser. The red mushroom cuts the 12 V to everything that moves, the drawer at the front gives you the prize.",
    subs:[["E-stop, 22 mm", -.415,-.48,.116], ["QR plate", -.324,-.48,.116], ["Wordmark", -.02,-.48,.116], ["Service hatch", .34,-.48,.07], ["Prize drawer", .2,-.3,.06]], proof:"Browser only" },
  { id:"electronics", n:"02", name:"Electronics", spec:"Raspberry Pi, OPTIGA Trust M, motion board", ents:["electronics"], ex:[0,-.56,.06],
    text:"One shelf inside the base. The Pi runs the play, the stream and the proof. The motion board drives the gantry and the winch. The OPTIGA chip signs every event with a key that never leaves it, so a play cannot be faked after the fact.",
    subs:[["Raspberry Pi", -.38,-.38,.04], ["OPTIGA Trust M shield", -.38,-.38,.058], ["Motion board", -.21,-.38,.036], ["12 V supply", -.01,-.38,.04], ["Claw driver", -.29,-.31,.036], ["WAGO terminals", -.07,-.305,.036]], proof:"Signed by the machine on peaqOS" },
  { id:"tray", n:"03", name:"Prize tray", spec:"MDF 18 mm, raised", ents:["floor_mdf"], anchor:[-.47,-.3,.25], ex:[0,0,.42],
    text:"A black floor with a rim all round, 150 mm above the base so the drawer fits under it. One layer of prizes, the opening for the chute in the front right corner.",
    subs:[["MDF floor, black", 0,.1,.22], ["Rim, 45 mm", -.47,0,.26], ["Chute opening, 160 mm", .38,-.39,.22]], proof:"Seen by the play camera" },
  { id:"chute", n:"04", name:"Chute", spec:"beam, camera, NFC cradle, servo flap", ents:["chute"], ex:[.36,-.38,.48],
    text:"The drop, proven. The capsule falls through the glass guard, breaks the beam, the chute camera hashes its frames, it rolls down the ramp into the cradle where the PN532 reads its tag, then the servo flap lets it slide into the drawer.",
    subs:[["Guard glass + frame", .46,-.4,.3], ["Break beam pair", .31,-.44,.19], ["Chute camera + LED", .38,-.32,.19], ["Funnel, 160 to 90", .38,-.39,.15], ["Ramp", .4,-.4,.062], ["NFC cradle, PN532", .38,-.312,.06], ["Servo flap, MG90S", .333,-.31,.07]], proof:"Seen twice: beam and camera" },
  { id:"capsules", n:"05", name:"Capsules", spec:"50 mm shells, NTAG215 inside", ents:["capsules"], anchor:[.35,-.2,.27], ex:[0,0,.62],
    text:"Every capsule is two halves with a prize and an NFC sticker inside. The sticker has a factory UID that cannot be rewritten. Before the night, the inventory maps each UID to its prize and is published on chain.",
    subs:[["50 mm shell", 0,-.1,.25], ["NTAG215 sticker inside", -.2,.1,.25], ["Gold or violet halves", .2,.2,.25]], proof:"Inventory on chain" },
  { id:"frame", n:"06", name:"Frame", spec:"2020 V-slot, black anodised", ents:["frame"], anchor:[-.49,-.49,.92], ex:[0,0,.3],
    text:"Twelve 1 m bars and four posts make a 1000 mm cube, joined with cast corner brackets. A third ring at 150 mm carries the tray. No glass: the play camera is the window.",
    subs:[["4 posts, 1000 mm", -.49,-.49,.5], ["Top ring", 0,-.49,.99], ["Floor ring, 150 mm", .49,0,.192], ["Corner brackets", .47,-.47,.97], ["Rubber feet", .49,.49,.006]], proof:"Open by design" },
  { id:"gantry", n:"07", name:"Gantry", spec:"H-bot, two NEMA 17", ents:["gantry_static","move_y"], anchor:[.49,.2,1.0], ex:[0,0,1.3],
    text:"Two Y rails on the top beams carry a 2040 X beam on linear blocks. One GT2 belt loop in H-bot routing, both motors fixed to the frame, so the moving mass stays light. The play camera sits in the top front corner.",
    subs:[["Y rail, left", -.49,0,1.004], ["Y rail, right", .49,0,1.004], ["X beam, 2040", 0,0,1.033], ["Y motors, NEMA 17", .526,.451,1.01], ["GT2 belt", -.503,0,1.007], ["Drag chain", -.515,.1,.995], ["Play camera", -.415,-.455,.945]], proof:"Position known by step count" },
  { id:"winch", n:"08", name:"Carriage and winch", spec:"pancake NEMA 17, printed spool", ents:["move_x"], chain:["gantry"], ex:[0,0,-.3],
    text:"Rides the X rail on a linear block. A pancake stepper turns a printed 30 mm spool with a helical groove that winds 2 mm Dyneema. Top position from the Z end stop, bottom from stall detection when the claw touches down.",
    subs:[["MGN12 block", 0,0,1.061], ["Winch spool, 30 mm", 0,-.045,.985], ["Pancake NEMA 17", .042,-.045,.985], ["POV camera", -.048,-.045,.975], ["Z end stop", .03,-.06,1.076], ["Cable gland", .024,-.049,1.003]], proof:"Same depth every play" },
  { id:"claw", n:"09", name:"Claw", spec:"3 fingers, 12 V linear actuator", ents:["seg_1"], focus:["seg_8"], chain:["gantry","winch"], ex:[0,0,-.42],
    text:"Hangs from a swivel on the line. A 30 mm linear actuator in the hub pushes three printed fingers open; a spring closes them, and that closing force is the grip we promise. The 6 core coiled cable brings the 12 V down beside the line.",
    subs:[["Swivel on Dyneema", 0,-.045,.972], ["Coil cable, 6 core", .028,-.045,.95], ["Hub, 12 V actuator", 0,-.045,.915], ["Chrome collar", .024,-.045,.893], ["3 printed fingers", .035,-.045,.86], ["Rubber tips", .04,-.045,.825]], proof:"Grip measured, published before you play" }
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
  const OVR = { tray:[.045,.047,.055,1], base:[.04,.042,.05,1], alu:[.02,.02,.025,1], cap_gold:[1,.62,.16,1], cap_violet:[.52,.42,1,1] };
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
let GEO_TOP, GEO_BOT, GEO_TAG, GEO_COIN, tagMat, coinMat, tagTex;
function buildCapsule(e, mats){
  const o = new THREE.Group(); o.name = e.name; const t = e.transform || {};
  if (t.pos) o.position.set(...t.pos); if (t.quat) o.quaternion.set(t.quat[1], t.quat[2], t.quat[3], t.quat[0]);
  const R = .03, shell = material(mats, e.geoms[0].material, "capsules");
  GEO_TOP ||= new THREE.SphereGeometry(R, 28, 18, 0, Math.PI*2, 0, Math.PI/2).rotateX(Math.PI/2);
  GEO_BOT ||= new THREE.SphereGeometry(R, 28, 18, 0, Math.PI*2, Math.PI/2, Math.PI/2).rotateX(Math.PI/2);
  if (!tagMat){
    const cv = document.createElement("canvas"); cv.width = cv.height = 256; const g = cv.getContext("2d");
    g.fillStyle = "#f4f4f6"; g.beginPath(); g.arc(128, 128, 126, 0, Math.PI*2); g.fill();
    g.strokeStyle = "#b8893a"; g.lineWidth = 7; for (let r = 40; r <= 104; r += 16){ g.beginPath(); g.arc(128, 128, r, 0, Math.PI*2); g.stroke(); }
    g.fillStyle = "#1a1a1a"; g.fillRect(118, 112, 20, 32); g.font = "700 22px Satoshi, system-ui, sans-serif"; g.fillStyle = "#333"; g.textAlign = "center"; g.fillText("NTAG215", 128, 236);
    tagTex = new THREE.CanvasTexture(cv); tagTex.colorSpace = THREE.SRGBColorSpace;
    tagMat = new THREE.MeshStandardMaterial({ map:tagTex, roughness:.7, metalness:0 });
    coinMat = new THREE.MeshPhysicalMaterial({ color:0xffc04a, metalness:1, roughness:.18, clearcoat:.6, emissive:0xffb347, emissiveIntensity:.25 });
    GEO_TAG = new THREE.CylinderGeometry(.019, .019, .0012, 40).rotateX(Math.PI/2); GEO_COIN = new THREE.CylinderGeometry(.011, .011, .0024, 40).rotateX(Math.PI/2);
    /* register them under the capsules part so isolation hides them with the shells */
    for (const [k, m] of [["capsules|tag", tagMat], ["capsules|coin", coinMat]]){ m.userData.base = { opacity:1, ei:m.emissiveIntensity }; matCache.set(k, m); }
  }
  const lid = new THREE.Group(); const top = new THREE.Mesh(GEO_TOP, shell); lid.add(top);
  const bot = new THREE.Mesh(GEO_BOT, shell), seam = new THREE.Mesh(geometry({ type:"cylinder", radius:R + .0006, height:.0035 }), material(mats, "seam", "capsules"));
  const tag = new THREE.Mesh(GEO_TAG, tagMat); tag.position.z = -.012; const coin = new THREE.Mesh(GEO_COIN, coinMat); coin.position.set(.004, .003, -.001); coin.rotation.set(1.0, .35, 0);
  [top, bot, seam, tag, coin].forEach(m => { m.userData.part = "capsules"; m.castShadow = true; m.receiveShadow = true; });
  o.add(lid, bot, seam, tag, coin); o.userData.lid = lid; o.userData.q0 = o.quaternion.clone(); o.userData.cap = true;
  ents.set(e.name, o); partOf.set(e.name, "capsules"); return o;
}
async function load(){
  const [sc, as] = await Promise.all([fetch("lab/grablab-claw-revb.scene.json?v=13").then(r => r.json()), fetch("lab/grablab-claw-revb-mech.asset.json?v=13").then(r => r.json())]);
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
  /* GRABLAB wordmark: real type on a thin emissive plane on the front panel */
  (function wordmark(){
    const cv = document.createElement("canvas"); cv.width = 1024; cv.height = 220; const g = cv.getContext("2d");
    g.fillStyle = "#fff"; g.font = "700 150px Anton, 'Clash Display', Impact, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; try { g.letterSpacing = "6px"; } catch (e) {} g.fillText("GRABLAB", 512, 118);
    const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(.30, .064), new THREE.MeshBasicMaterial({ map:tx, transparent:true, toneMapped:false }));
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
const orb = { th:-.95, ph:1.12, r:3.0, tx:0, ty:.52, tz:0, vth:0, vph:0, down:false, lx:0, ly:0, idle:0, zoom:1 };
const tgt = new THREE.Vector3();
function cam(){
  const sp = Math.sin(orb.ph), c = Math.cos(orb.ph), r = orb.r*orb.zoom;
  camera.position.set(orb.tx + r*sp*Math.cos(orb.th), orb.ty + r*c, orb.tz + r*sp*Math.sin(orb.th));
  tgt.set(orb.tx, orb.ty, orb.tz); camera.lookAt(tgt);
}
stage.addEventListener("pointerdown", e => { orb.down = true; orb.lx = e.clientX; orb.ly = e.clientY; orb.idle = 0; stage.setPointerCapture(e.pointerId); });
stage.addEventListener("pointermove", e => { mouse.x = (e.clientX - stage.getBoundingClientRect().left)/stage.clientWidth*2 - 1; mouse.y = -((e.clientY - stage.getBoundingClientRect().top)/stage.clientHeight)*2 + 1;
  if (!orb.down) return; orb.vth = (e.clientX - orb.lx)*.006; orb.vph = (e.clientY - orb.ly)*.006; orb.lx = e.clientX; orb.ly = e.clientY; orb.th += orb.vth; orb.ph = Math.min(1.5, Math.max(.35, orb.ph + orb.vph)); orb.moved = (orb.moved || 0) + Math.abs(orb.vth) + Math.abs(orb.vph); });
stage.addEventListener("pointerup", () => { orb.down = false; });
stage.addEventListener("wheel", e => { e.preventDefault(); orb.zoom = Math.min(2.4, Math.max(.45, orb.zoom*(1 + Math.sign(e.deltaY)*.08))); orb.idle = 0; }, { passive:false });
/* where the camera wants to be: the whole machine, or the selected part framed */
const sph = new THREE.Sphere();
function goal(){
  if (selectedCap){ selectedCap.getWorldPosition(tmpV); return { tx:tmpV.x, ty:tmpV.y + .01, tz:tmpV.z, r:.26 }; }
  if (selected){ box.makeEmpty(); for (const o of (selected.focus ? selected.focus.map(n => ents.get(n)) : selected.objs)) o.traverse(m => { if (m.isMesh && m.userData.part === selected.id){ m.getWorldPosition(tmpV); box.expandByPoint(tmpV); } }); if (!box.isEmpty()){ box.getBoundingSphere(sph); return { tx:sph.center.x, ty:sph.center.y, tz:sph.center.z, r:Math.max(.6, sph.radius*2.7) }; } }
  return { tx:0, ty:.52 + .55*explode, tz:0, r:3.0*(1 + .62*explode) };
}
function easeCam(dt){ const g = goal(), k = Math.min(1, dt*3.2); orb.tx += (g.tx - orb.tx)*k; orb.ty += (g.ty - orb.ty)*k; orb.tz += (g.tz - orb.tz)*k; orb.r += (g.r - orb.r)*k; }

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
  selected = p; liftK = 0; selectedCap = null;
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
  card.innerHTML = `<span class="n">Capsule #${num}</span><h3>Custom NFC capsule</h3><span class="spec">50 mm shell, NTAG215 inside</span>
    <p>Every capsule is a custom NFC tag with a prize slot. What goes in is up to the project: an SPL token, an NFT, a tokenized stock, merch, or a code for something off chain. The tag's factory UID is mapped to that prize in the inventory published before the night, so the machine cannot swap it later.</p>
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
function placeLabels(){
  const W = stage.clientWidth, H = stage.clientHeight; let svg = "";
  const show = explode > .35 || selected || hovered;
  for (const p of PARTS){
    const d = lab[p.id];
    if (p.anchor){ const o = offOf(p); ctr.set(p.anchor[0] + o[0], p.anchor[1] + o[1], p.anchor[2] + o[2]); root.localToWorld(ctr); }
    else {
      let n = 0; ctr.set(0, 0, 0);
      for (const o of p.objs) o.traverse(m => { if (m.isMesh && m.userData.part === p.id){ m.getWorldPosition(tmpV); ctr.add(tmpV); n++; } });
      if (!n){ d.style.display = "none"; continue; } ctr.multiplyScalar(1/n);
    }
    const s = ctr.clone().project(camera); const sx = (s.x*.5 + .5)*W, sy = (-s.y*.5 + .5)*H;
    const vis = show && s.z < 1 && !selectedCap && (selected ? selected.id === p.id : (explode > .35 || (hovered && hovered.id === p.id)));
    d.style.display = vis ? "" : "none"; if (!vis) continue;
    const sideW = document.body.classList.contains("ui-min") || W < 980 ? 0 : 330, side = sx > W*.58 ? -1 : 1;
    let lx = sx + side*(W*.12), ly = Math.min(H - 110, Math.max(70, sy - 26 - (p.ex[2] > 0 ? 10 : 0)));
    lx = Math.min(W - sideW - 12 - (side > 0 ? d.offsetWidth : 0), Math.max(12 + (side < 0 ? d.offsetWidth : 0), lx));
    d.style.transform = `translate(${lx + (side < 0 ? -d.offsetWidth : 0)}px, ${ly - 12}px)`;
    d.classList.toggle("on", (selected && selected.id === p.id) || (hovered && hovered.id === p.id));
    svg += `<line x1="${sx}" y1="${sy}" x2="${lx}" y2="${ly}"/><circle cx="${sx}" cy="${sy}" r="2.5"/>`;
  }
  capLab ||= CAPSUBS.map(sd => { const e = document.createElement("div"); e.className = "lab sub"; e.textContent = sd[0]; labels.appendChild(e); return e; });
  capLab.forEach((e, i) => {
    if (!selectedCap || openK < .7){ e.style.display = "none"; return; }
    const sd = CAPSUBS[i]; ctr.set(sd[1], sd[2], sd[3]); selectedCap.localToWorld(ctr);
    const sc = ctr.clone().project(camera); if (sc.z > 1){ e.style.display = "none"; return; }
    const sx = (sc.x*.5 + .5)*W, sy = (-sc.y*.5 + .5)*H, side = i % 2 ? 1 : -1; e.style.display = "";
    const lx = sx + side*(120 + i*10), ly = sy - 10 - i*22; e.style.transform = `translate(${lx + (side < 0 ? -e.offsetWidth : 0)}px, ${ly - 11}px)`;
    svg += `<line class="s" x1="${sx}" y1="${sy}" x2="${lx}" y2="${ly}"/><circle class="s" cx="${sx}" cy="${sy}" r="2"/>`;
  });
  for (const p of PARTS){
    const on = selected && selected.id === p.id && liftK > .6 && !selectedCap;
    p.subEls ||= p.subs.map((sd, i) => { const e = document.createElement("div"); e.className = "lab sub"; e.textContent = sd[0]; labels.appendChild(e); return e; });
    p.subEls.forEach((e, i) => {
      if (!on){ e.style.display = "none"; return; }
      const sd = p.subs[i], o = offOf(p); ctr.set(sd[1] + o[0], sd[2] + o[1], sd[3] + o[2] + .09*liftK); root.localToWorld(ctr);
      const sc = ctr.clone().project(camera); if (sc.z > 1){ e.style.display = "none"; return; }
      const sx = (sc.x*.5 + .5)*W, sy = (-sc.y*.5 + .5)*H, side = i % 2 ? 1 : -1;
      e.style.display = ""; const lx = sx + side*(100 + (i >> 1)*18), ly = sy + (side < 0 ? -1 : 1)*(14 + (i >> 1)*24);
      e.style.transform = `translate(${lx + (side < 0 ? -e.offsetWidth : 0)}px, ${ly - 11}px)`;
      svg += `<line class="s" x1="${sx}" y1="${sy}" x2="${lx}" y2="${ly}"/><circle class="s" cx="${sx}" cy="${sy}" r="2"/>`;
    });
  }
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
$("#reset").onclick = () => { setSelected(null); setExplode(0); orb.th = -.95; orb.ph = 1.12; orb.zoom = 1; if (tour) stopTour(); };
if (q.get("ui") === "min"){ document.body.classList.add("ui-min"); document.getElementById("loader")?.remove(); }

/* ---------- loop ---------- */
let last = performance.now();
function frame(now){
  const dt = Math.min(.05, (now - last)/1000); last = now;
  if (tour) tourStep(dt); else { orb.idle += dt; if (false) orb.th += dt*.08; if (!orb.down){ orb.vth *= .9; orb.vph *= .9; orb.th += orb.vth; orb.ph = Math.min(1.5, Math.max(.35, orb.ph + orb.vph)); } }
  explode += (explodeTarget - explode)*Math.min(1, dt*4.5); liftK += ((selected ? 1 : 0) - liftK)*Math.min(1, dt*5);
  if (!orb.down && !tour){ const p = pick(); if (p !== hovered && !(hovered && list.matches(":hover"))) hovered = p; capHover = p && p.id === "capsules" ? lastHitCap : null; stage.style.cursor = p ? "pointer" : "grab"; }
  applyExplode(); clawCycle(dt); shade(); capAnim(dt); easeCam(dt); cam();
  if (pixel){ renderer.setRenderTarget(rt); renderer.render(scene, camera); renderer.setRenderTarget(null); post.uniforms.t.value = now/1000; renderer.render(postScene, postCam); }
  else renderer.render(scene, camera);
  placeLabels();
  requestAnimationFrame(frame);
}
load().then(() => { resize(); cam(); document.body.classList.add("ready"); if (q.get("tour") === "1") startTour(); requestAnimationFrame(frame); window.__anatomy = { setExplode, setSelected, selectCap, capsules, PARTS, startTour, orb, dbg:() => ({ openK, animCap:animCap && animCap.name, selectedCap:selectedCap && selectedCap.name, lid:animCap && animCap.userData.lid.rotation.x }) }; })
  .catch(e => { console.error(e); $("#stage").classList.add("err"); });
