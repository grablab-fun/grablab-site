/* ============ ANATOMY : Prototype 01 Rev B, exploded, interactive, pixel-art rendered ============
   The machine is the SimArena physics scene (lab/grablab-claw-revb.scene.json + the mechanism asset), so what you
   explode here is the same geometry the physics lab drives and Aethelark builds. Three.js, self-hosted.
   Render: the scene draws into a small target (1/3 res) with a depth texture, then one quad shader posterises the
   colours to the Grablab palette, dithers, draws outlines from depth and luminance steps, and scales up with hard pixels. */
import * as THREE from "./assets/vendor/three.module.min.js";

const $ = s => document.querySelector(s);
const PARTS = [
  { id:"frame", n:"01", name:"Frame", spec:"2020 V-slot, black anodised", ents:["frame"], ex:[0,0,0],
    text:"Twelve 1 m bars and four posts make a 1000 mm cube. No glass: the play camera is the window.", proof:"Open by design" },
  { id:"gantry", n:"02", name:"Gantry", spec:"H-bot, two NEMA 17", ents:["gantry_static","move_y"], ex:[0,0,.62],
    text:"Two Y rails on the top beams carry a 2040 X beam on linear blocks. One GT2 belt loop, both motors fixed to the frame, so the moving mass stays light.", proof:"Position known by step count" },
  { id:"winch", n:"03", name:"Carriage and winch", spec:"pancake NEMA 17, printed spool", ents:["move_x"], ex:[0,0,-.12],
    text:"Rides the X rail. A 30 mm spool with a helical groove winds 2 mm Dyneema. Top from the Z end stop, bottom from stall detection.", proof:"Same depth every play" },
  { id:"claw", n:"04", name:"Claw", spec:"3 fingers, 12 V linear actuator", ents:["seg_1"], ex:[0,0,-.22],
    text:"Three printed fingers on a 30 mm linear actuator, fed by the 6 core coiled cable. A spring closes it: that force is the grip we promise.", proof:"Grip measured, published before you play" },
  { id:"capsules", n:"05", name:"Capsules", spec:"50 mm shells, NTAG215 inside", ents:["capsules"], ex:[0,0,.14],
    text:"Every capsule carries an NFC sticker with a factory UID that cannot be rewritten. The UID maps to the prize in the published inventory.", proof:"Inventory on chain" },
  { id:"tray", n:"06", name:"Prize tray", spec:"MDF 18 mm, raised", ents:["floor_mdf"], ex:[0,0,0],
    text:"A black floor so the capsules read on camera. One layer of prizes, the chute in the front right corner.", proof:"Seen by the play camera" },
  { id:"chute", n:"07", name:"Chute", spec:"beam, camera, NFC cradle, servo flap", ents:["chute"], ex:[.34,-.36,.04],
    text:"The capsule breaks the beam, the chute camera hashes its frames, the cradle reads the tag, then the flap lets it slide into the drawer.", proof:"Seen twice: beam and camera" },
  { id:"base", n:"08", name:"Base and panel", spec:"QR, E-stop, prize drawer", ents:["base_box"], ex:[0,0,-.34],
    text:"No joystick. Scan the code and play from the browser. The red mushroom cuts the 12 V to everything that moves.", proof:"Browser only" },
  { id:"electronics", n:"09", name:"Electronics", spec:"Raspberry Pi, OPTIGA Trust M, motion board", ents:["electronics"], ex:[0,-.52,.02],
    text:"The Pi runs the play and the stream. The motion board drives the gantry and the winch. The OPTIGA chip signs every event with a key that never leaves it.", proof:"Signed by the machine on peaqOS" }
];
const KEEP = new Set(["frame","floor_mdf","base_box","electronics","chute","gantry_static","claw"]);
const PAL = [[.047,.051,.098],[.094,.09,.188],[.192,.161,.31],[.33,.27,.42],[.545,.475,.576],[.855,.843,.847],[1,.824,.478],[.788,.714,1],[.231,.482,1],[.122,.31,.82]];

const stage = $("#stage"), canvas = $("#view");
let renderer;
try {
  const probe = document.createElement("canvas"); if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) throw new Error("no webgl");
  renderer = new THREE.WebGLRenderer({ canvas, antialias:false, powerPreference:"high-performance" });
} catch (e){
  /* WebGL off (Brave Shields "strict" fingerprinting, hardware acceleration off, old GPU): say so instead of spinning forever */
  stage.classList.add("err"); throw e;
}
renderer.setPixelRatio(1); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.NoToneMapping;
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0a0c1a);
const camera = new THREE.PerspectiveCamera(32, 1, .05, 40);
const root = new THREE.Group(); root.rotation.x = -Math.PI/2; scene.add(root);   // z-up scene into y-up three

/* ---------- lights ---------- */
scene.add(new THREE.HemisphereLight(0xc3caff, 0x141830, 1.3));
const key = new THREE.DirectionalLight(0xfff1dc, 3.0); key.position.set(-1.4, 2.6, 2.2); scene.add(key);
const rim = new THREE.DirectionalLight(0x6f8dff, 2.4); rim.position.set(2.2, 1.4, -2.4); scene.add(rim);
const fill = new THREE.PointLight(0xffb877, 2.0, 3.5); fill.position.set(.1, 1.0, .1); scene.add(fill);

/* ---------- environment: a tiny painted studio cube, so metals have something to reflect ---------- */
(function env(){
  const faces = []; const N = 64;
  for (let f = 0; f < 6; f++){
    const cv = document.createElement("canvas"); cv.width = cv.height = N; const g = cv.getContext("2d");
    const grad = g.createLinearGradient(0, 0, 0, N);
    if (f === 2){ grad.addColorStop(0, "#fff4e4"); grad.addColorStop(1, "#8d93c8"); }                 // +y: warm ceiling light
    else if (f === 3){ grad.addColorStop(0, "#0b0d1c"); grad.addColorStop(1, "#05060e"); }            // -y: dark floor
    else { grad.addColorStop(0, "#6f78c4"); grad.addColorStop(.55, "#1c2048"); grad.addColorStop(1, "#07081a"); }
    g.fillStyle = grad; g.fillRect(0, 0, N, N);
    if (f === 0 || f === 4){ g.fillStyle = "rgba(255,246,228,.85)"; g.fillRect(N*.3, N*.08, N*.4, N*.34); }   // two softboxes
    if (f === 1){ g.fillStyle = "rgba(120,160,255,.7)"; g.fillRect(N*.1, N*.15, N*.25, N*.5); }               // a blue rim
    faces.push(cv);
  }
  const ct = new THREE.CubeTexture(faces); ct.colorSpace = THREE.SRGBColorSpace; ct.needsUpdate = true;
  scene.environment = ct; scene.environmentIntensity = .9;
})();

/* ---------- scene loader: SimArena json -> three meshes, grouped by entity ---------- */
const matCache = new Map(), ents = new Map(), partOf = new Map();
function material(mats, name, part){
  const k = part + "|" + name; if (matCache.has(k)) return matCache.get(k);
  const d = mats[name] || { rgba:[.5,.5,.5,1] }, c = d.rgba;
  const m = new THREE.MeshStandardMaterial({ color:new THREE.Color(c[0], c[1], c[2]), metalness:d.metalness ?? .2, roughness:d.roughness ?? .6,
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
    if (g.material === "invis" || g.type === "plane") continue;
    const geo = geometry(g); if (!geo) continue;
    const m = new THREE.Mesh(geo, material(mats, g.material, part));
    if (g.pos) m.position.set(...g.pos); if (g.quat) m.quaternion.set(g.quat[1], g.quat[2], g.quat[3], g.quat[0]);
    m.userData.part = part; obj.add(m);
  }
}
function entityObj(e, mats, part){
  const o = new THREE.Group(); o.name = e.name;
  const t = e.transform || {}; if (t.pos) o.position.set(...t.pos); if (t.quat) o.quaternion.set(t.quat[1], t.quat[2], t.quat[3], t.quat[0]);
  addGeoms(o, e.geoms || [], mats, part); ents.set(e.name, o); partOf.set(e.name, part); return o;
}
const partFor = n => { for (const p of PARTS) if (p.ents.includes(n)) return p.id; return null; };
const capsules = [], mech = {};
async function load(){
  const [sc, as] = await Promise.all([fetch("lab/grablab-claw-revb.scene.json?v=13").then(r => r.json()), fetch("lab/grablab-claw-revb-mech.asset.json?v=13").then(r => r.json())]);
  const capsGroup = new THREE.Group(); capsGroup.name = "capsules"; root.add(capsGroup); ents.set("capsules", capsGroup);
  for (const e of sc.entities){
    if (/^capsule_/.test(e.name)){ const o = entityObj(e, sc.material, "capsules"); capsGroup.add(o); o.userData.home = o.position.clone(); capsules.push(o); continue; }
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
let pixel = true, PX = 3;
function resize(){
  const w = stage.clientWidth, h = stage.clientHeight; renderer.setSize(w, h, false); camera.aspect = w/h; camera.updateProjectionMatrix();
  const rw = Math.max(240, Math.round(w/PX)), rh = Math.max(135, Math.round(h/PX)); rt.setSize(rw, rh); post.uniforms.px.value.set(1/rw, 1/rh);
}
addEventListener("resize", resize);

/* ---------- orbit: drag, wheel, inertia, idle auto spin ---------- */
const orb = { th:-.95, ph:1.12, r:3.4, tx:0, ty:.52, vth:0, vph:0, down:false, lx:0, ly:0, idle:0 };
const tgt = new THREE.Vector3();
function cam(){
  const sp = Math.sin(orb.ph), c = Math.cos(orb.ph), r = orb.r*(1 + .42*explode), ty = orb.ty + .1*explode;
  camera.position.set(orb.tx + r*sp*Math.cos(orb.th), ty + r*c, r*sp*Math.sin(orb.th));
  tgt.set(orb.tx, ty, 0); camera.lookAt(tgt);
}
stage.addEventListener("pointerdown", e => { orb.down = true; orb.lx = e.clientX; orb.ly = e.clientY; orb.idle = 0; stage.setPointerCapture(e.pointerId); });
stage.addEventListener("pointermove", e => { mouse.x = (e.clientX - stage.getBoundingClientRect().left)/stage.clientWidth*2 - 1; mouse.y = -((e.clientY - stage.getBoundingClientRect().top)/stage.clientHeight)*2 + 1;
  if (!orb.down) return; orb.vth = (e.clientX - orb.lx)*.006; orb.vph = (e.clientY - orb.ly)*.006; orb.lx = e.clientX; orb.ly = e.clientY; orb.th += orb.vth; orb.ph = Math.min(1.5, Math.max(.35, orb.ph + orb.vph)); orb.moved = (orb.moved || 0) + Math.abs(orb.vth) + Math.abs(orb.vph); });
stage.addEventListener("pointerup", () => { orb.down = false; });
stage.addEventListener("wheel", e => { e.preventDefault(); orb.r = Math.min(7, Math.max(1.6, orb.r*(1 + Math.sign(e.deltaY)*.08))); orb.idle = 0; }, { passive:false });

/* ---------- explode, selection, labels ---------- */
let explode = 0, explodeTarget = 0, selected = null, hovered = null, tour = null;
const ray = new THREE.Raycaster(), mouse = new THREE.Vector2(-2, -2);
const ex = $("#explode"), card = $("#card"), list = $("#parts"), labels = $("#labels"), lines = $("#lines");
ex.addEventListener("input", () => { explodeTarget = +ex.value/100; if (tour) stopTour(); });
function setExplode(v){ explodeTarget = v; ex.value = Math.round(v*100); }
function applyExplode(){
  const E = explode;
  for (const p of PARTS) for (const o of p.objs){ o.position.copy(o.userData.home); o.position.x += p.ex[0]*E; o.position.y += p.ex[1]*E; o.position.z += p.ex[2]*E; }
  /* selected part lifts a little more, others step back */
  if (selected) for (const o of selected.objs) o.position.z += .06*liftK;
  for (const c of capsules){ c.position.copy(c.userData.home).addScaledVector(c.userData.spread, E); }
}
let liftK = 0;
function setSelected(p, fromList){
  selected = p; liftK = 0;
  for (const li of list.children) li.classList.toggle("on", !!p && li.dataset.id === p.id);
  if (p){
    card.innerHTML = `<span class="n">${p.n} / 09</span><h3>${p.name}</h3><span class="spec">${p.spec}</span><p>${p.text}</p><span class="proof"><i></i>${p.proof}</span><button class="x" type="button" aria-label="Close">&times;</button>`;
    card.classList.add("on"); card.querySelector(".x").onclick = () => setSelected(null);
    if (explodeTarget < .5 && !tour) setExplode(.72);
  } else card.classList.remove("on");
  if (!fromList && !tour) orb.idle = 0;
}
for (const p of PARTS){
  const li = document.createElement("button"); li.type = "button"; li.className = "pt"; li.dataset.id = p.id;
  li.innerHTML = `<span class="n">${p.n}</span><span class="nm">${p.name}</span><span class="sp">${p.spec}</span>`;
  li.onmouseenter = () => { hovered = p; }; li.onmouseleave = () => { hovered = null; };
  li.onclick = () => { setSelected(selected === p ? null : p, true); if (tour) stopTour(); };
  list.appendChild(li);
}
stage.addEventListener("click", () => { if (orb.moved > .02){ orb.moved = 0; return; } orb.moved = 0; const p = pick(); setSelected(p && p !== selected ? p : null); if (tour) stopTour(); });
function pick(){
  ray.setFromCamera(mouse, camera); const hits = ray.intersectObjects(root.children, true);
  for (const h of hits){ if (h.object.material && h.object.material.opacity < .3) continue; const id = h.object.userData.part; const p = PARTS.find(q => q.id === id); if (p) return p; }
  return null;
}
/* per part material state: hover glow, fade when another part is selected */
function shade(){
  const dimOthers = !!selected;
  for (const [k, m] of matCache){
    const id = k.split("|")[0], base = m.userData.base; const isSel = selected && selected.id === id, isHov = hovered && hovered.id === id;
    const target = dimOthers && !isSel ? Math.min(base.opacity, .14) : base.opacity;
    m.opacity += (target - m.opacity)*.18; m.transparent = m.opacity < .999 || base.opacity < 1; m.depthWrite = m.opacity > .5 && base.opacity >= 1;
    const ei = base.ei + (isHov || isSel ? .22 : 0); m.emissiveIntensity += (ei - m.emissiveIntensity)*.2;
  }
}
/* labels: one per part, anchored on the part's bounding centre, with a leader line drawn in the svg overlay */
const lab = {}; const box = new THREE.Box3(), ctr = new THREE.Vector3();
for (const p of PARTS){ const d = document.createElement("div"); d.className = "lab"; d.innerHTML = `<b>${p.n}</b>${p.name}`; d.onclick = () => setSelected(p); labels.appendChild(d); lab[p.id] = d; }
function placeLabels(){
  const W = stage.clientWidth, H = stage.clientHeight; let svg = "";
  const show = explode > .35 || selected || hovered;
  for (const p of PARTS){
    const d = lab[p.id]; box.makeEmpty(); for (const o of p.objs) box.expandByObject(o);
    if (box.isEmpty()){ d.style.display = "none"; continue; }
    box.getCenter(ctr);
    const s = ctr.clone().project(camera); const sx = (s.x*.5 + .5)*W, sy = (-s.y*.5 + .5)*H;
    const vis = show && s.z < 1 && (explode > .35 || (selected && selected.id === p.id) || (hovered && hovered.id === p.id));
    d.style.display = vis ? "" : "none"; if (!vis) continue;
    const sideW = document.body.classList.contains("ui-min") || W < 980 ? 0 : 330, side = sx > W*.58 ? -1 : 1;
    let lx = sx + side*(W*.12), ly = Math.min(H - 110, Math.max(70, sy - 26 - (p.ex[2] > 0 ? 10 : 0)));
    lx = Math.min(W - sideW - 12 - (side > 0 ? d.offsetWidth : 0), Math.max(12 + (side < 0 ? d.offsetWidth : 0), lx));
    d.style.transform = `translate(${lx + (side < 0 ? -d.offsetWidth : 0)}px, ${ly - 12}px)`;
    d.classList.toggle("on", (selected && selected.id === p.id) || (hovered && hovered.id === p.id));
    svg += `<line x1="${sx}" y1="${sy}" x2="${lx}" y2="${ly}"/><circle cx="${sx}" cy="${sy}" r="2.5"/>`;
  }
  lines.setAttribute("viewBox", `0 0 ${W} ${H}`); lines.innerHTML = svg;
}

/* ---------- claw cycle: a slow grab, even while exploded ---------- */
const CY = { t:0, cap:null, held:null };
const CHUTE = [.38, -.39], PICK = [-.30, -.31], S = .79, GRAB_Z = .22 + .03 + .087*S, TRAVEL = .97 - .025 - GRAB_Z, SEG = TRAVEL/8;
const ease = x => x < .5 ? 2*x*x : 1 - Math.pow(-2*x + 2, 2)/2;
function clawCycle(dt){
  if (!mech.move_y) return; CY.t = (CY.t + dt) % 22;
  const t = CY.t; let x = 0, y = 0, lift = 0, open = 0, hold = false;
  const seg = (a, b) => t >= a && t < b ? ease((t - a)/(b - a)) : (t >= b ? 1 : 0);
  /* 0-3 travel to pick, 3-6 lower, 6-7 close, 7-10 raise, 10-14 travel to chute, 14-15 open, 15-17 hold open, 17-20 home, 20-22 rest */
  const toPick = seg(0, 3), down = seg(3, 6) - seg(7, 10), closeK = seg(6, 7) - seg(14, 15), toChute = seg(10, 14), home = seg(17, 20);
  x = PICK[0]*toPick + (CHUTE[0] - PICK[0])*toChute - CHUTE[0]*home; y = PICK[1]*toPick + (CHUTE[1] - PICK[1])*toChute - CHUTE[1]*home;
  lift = -SEG*Math.max(0, down); open = (1 - closeK)*.55 + (t >= 3 && t < 7 ? .55*(1 - seg(6, 7)) : 0); hold = closeK > .98 && t > 7.2;
  mech.move_y.o.position.y = mech.move_y.o.userData.home.y + y + PARTS[1].ex[1]*explode;
  mech.move_x.o.position.x = mech.move_x.o.userData.home.x - x;
  for (let s = 1; s <= 8; s++) mech["seg_" + s].o.position.z = (s === 1 ? mech.seg_1.o.userData.home.z + PARTS[3].ex[2]*explode : 0) + lift;
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
  else if (T < 5 + PARTS.length*2.6 + 2.5){ if (selected) setSelected(null); setExplode(1 - ease(Math.min(1, (T - 5 - PARTS.length*2.6)/2.2))); }
  else { tour.t = 0; tour.i = -1; }
}

/* ---------- ui bits ---------- */
$("#pix").onclick = e => { pixel = !pixel; e.currentTarget.classList.toggle("on", pixel); post.uniforms.pixel.value = pixel ? 1 : 0; };
$("#pix").classList.add("on");
$("#reset").onclick = () => { setSelected(null); setExplode(0); orb.th = -.95; orb.ph = 1.12; orb.r = 3.4; if (tour) stopTour(); };
const q = new URLSearchParams(location.search);
if (q.get("ui") === "min"){ document.body.classList.add("ui-min"); document.getElementById("loader")?.remove(); }

/* ---------- loop ---------- */
let last = performance.now();
function frame(now){
  const dt = Math.min(.05, (now - last)/1000); last = now;
  if (tour) tourStep(dt); else { orb.idle += dt; if (!orb.down && orb.idle > 2.5) orb.th += dt*.08; if (!orb.down){ orb.vth *= .9; orb.vph *= .9; orb.th += orb.vth; orb.ph = Math.min(1.5, Math.max(.35, orb.ph + orb.vph)); } }
  explode += (explodeTarget - explode)*Math.min(1, dt*4.5); liftK += ((selected ? 1 : 0) - liftK)*Math.min(1, dt*5);
  if (!orb.down && !tour){ const p = pick(); if (p !== hovered && !(hovered && list.matches(":hover"))) hovered = p; stage.style.cursor = p ? "pointer" : "grab"; }
  cam(); applyExplode(); clawCycle(dt); shade();
  renderer.setRenderTarget(rt); renderer.render(scene, camera); renderer.setRenderTarget(null); post.uniforms.t.value = now/1000; renderer.render(postScene, postCam);
  placeLabels();
  requestAnimationFrame(frame);
}
load().then(() => { resize(); cam(); document.body.classList.add("ready"); if (q.get("tour") === "1") startTour(); requestAnimationFrame(frame); window.__anatomy = { setExplode, setSelected, PARTS, startTour, orb }; })
  .catch(e => { console.error(e); $("#stage").classList.add("err"); });
