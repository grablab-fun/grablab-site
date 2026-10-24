/* ============ SIMULATOR 3D : our machine (anatomy-model.js) driven by the simulator's game state ============
   Three live cameras: the corner stream, the claw looking down, the landing camera in the chute.
   The main one fills the stage, the other two run in small windows; tap one to swap.
   Game space: x -1..1 (player left..right), z 0..1 (front..back), y 0..1 (floor..top), 1 unit = 0.45 m across, 0.9 m deep. */
import * as THREE from "./assets/vendor/three.module.min.js";
import { buildMachine } from "./anatomy-model.js?v=27";

export const CAP_R = .06;                                       // capsule radius in game x units (27 mm)
export const CHUTE = { x0:-1, x1:-.44, z0:.72, z1:1, h:0, cx:-.756, cz:.878 };   // the drop zone corner, in game space
const FLOOR = .412, SX = .45, SZ = .9;
const toM = (x, z) => [-x*SX, .45 - z*SZ];                      // game x,z to machine x,y (player stands at +y)
const toG = (mx, my) => [-mx/SX, (.45 - my)/SZ];

export function createSim3D(canvas, pips){
  /* the renderer is made on the first visible frame: a WebGL context on a hidden canvas gets dropped by some browsers */
  let renderer = null;
  let failed = false;
  const makeRenderer = () => { try { renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:false, powerPreference:"high-performance" });
    renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.setScissorTest(true); } catch (e){ failed = true; console.warn("sim3d: no WebGL", e); } };
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x070a1a); scene.fog = new THREE.Fog(0x070a1a, 3.5, 9);
  const root = new THREE.Group(); root.rotation.x = -Math.PI/2; scene.add(root);

  /* light and a small painted studio so the metal reads */
  scene.add(new THREE.HemisphereLight(0xc3caff, 0x141830, 1.25));
  const key = new THREE.DirectionalLight(0xf3f5ff, 2.6); key.position.set(-1.4, 2.6, 2.2); scene.add(key);
  const rim = new THREE.DirectionalLight(0x6f8dff, 2.0); rim.position.set(2.2, 1.4, -2.4); scene.add(rim);
  const inner = new THREE.PointLight(0xdfe6ff, 1.2, 1.6); inner.position.set(0, 1.0, 0); scene.add(inner);
  /* the cage's LED bars under the top rails: two strips you can see, and their light on the pile */
  const ledM = new THREE.MeshBasicMaterial({ color:0xeaf0ff, toneMapped:false });
  for (const y of [-.45, .45]){ const bar = new THREE.Mesh(new THREE.BoxGeometry(.86, .012, .006), ledM); bar.position.set(0, y, 1.193); root.add(bar);
    const l = new THREE.PointLight(0xe6edff, 1.6, 1.4, 1.6); l.position.set(0, 1.15, -y*.9); scene.add(l); }
  (function env(){ const faces = [], N = 64;
    for (let f = 0; f < 6; f++){ const cv = document.createElement("canvas"); cv.width = cv.height = N; const g = cv.getContext("2d"), gr = g.createLinearGradient(0, 0, 0, N);
      if (f === 2){ gr.addColorStop(0, "#e9eeff"); gr.addColorStop(1, "#7d86c8"); } else if (f === 3){ gr.addColorStop(0, "#0b0d1c"); gr.addColorStop(1, "#05060e"); }
      else { gr.addColorStop(0, "#6f78c4"); gr.addColorStop(.55, "#1c2048"); gr.addColorStop(1, "#07081a"); }
      g.fillStyle = gr; g.fillRect(0, 0, N, N); if (f === 0 || f === 4){ g.fillStyle = "rgba(236,242,255,.8)"; g.fillRect(N*.3, N*.08, N*.4, N*.34); } faces.push(cv); }
    const ct = new THREE.CubeTexture(faces); ct.colorSpace = THREE.SRGBColorSpace; ct.needsUpdate = true; scene.environment = ct; scene.environmentIntensity = .55; })();
  /* the room floor */
  const fl = new THREE.Mesh(new THREE.CircleGeometry(5, 48), new THREE.MeshStandardMaterial({ color:0x0b0f24, roughness:.85, metalness:.1 })); fl.position.z = -.017; root.add(fl);

  /* the machine */
  const cache = new Map();
  const mat = (part, key, o, phys) => { const k = part + "|" + key; if (cache.has(k)) return cache.get(k); const m = phys ? new THREE.MeshPhysicalMaterial(o) : new THREE.MeshStandardMaterial(o); m.userData.base = { opacity:m.opacity, ei:m.emissiveIntensity || 0 }; cache.set(k, m); return m; };
  const fonts = document.fonts ? Promise.all(["700 100px 'Clash Display'", "700 40px 'Satoshi'", "500 40px 'Satoshi'", "800 40px 'Satoshi'"].map(f => document.fonts.load(f))).catch(() => {}) : Promise.resolve();
  const M = buildMachine(THREE, { mat, onFont:cb => fonts.then(cb) });
  for (const [id, g] of Object.entries(M.parts)) if (id !== "capsules" && id !== "wiring" && id !== "electronics") root.add(g);   // the electronics sit behind the panel, never on camera

  /* moving parts: the beam and its carriages ride Y, the X carriage, winch and claw ride X on top of that */
  const gantry = M.parts.gantry, moveY = new THREE.Group(), moveX = new THREE.Group(); root.add(moveY); moveY.add(moveX);
  const nameOf = o => o.isMesh ? o.name : (o.children.find(c => c.isMesh) || {}).name || "";
  const RIDES = /^gantry_(y_carriage|y_wheel|matik|bracket_screw|x_beam|x_motor|x_pulley|x_idler|x_belt|x_endstop|drag_chain|chain_tray|y_belt_clip)/;
  for (const c of [...gantry.children]) if (RIDES.test(nameOf(c))) moveY.attach(c);
  moveX.attach(M.parts.winch); moveX.attach(M.parts.claw);
  const D = M.dims, YC = D.YC, XC = D.XC;
  const clawPart = M.parts.claw, clawG = clawPart.children.find(c => c.isGroup && c.children.length > 10), line = clawPart.children.find(c => c.name === "claw_line");
  clawPart.traverse(o => { if (o.name === "claw_coil_cable") o.visible = false; });
  root.traverse(o => { if (o.name === "chute_c960_view") o.visible = false; });   // the view cone is an anatomy diagram, not a part
  const lineTop = line.position.z + line.geometry.parameters.height/2, lineH = line.geometry.parameters.height, CT = clawG.position.z;
  /* the three fingers turn about their knuckles */
  const HZ = -.033 - .1, fingers = [];
  for (let k = 0; k < 3; k++){ const a = k*2*Math.PI/3 + Math.PI/2, pv = new THREE.Group(); pv.position.set(.027*Math.cos(a), .027*Math.sin(a), HZ - .016); pv.userData.ax = new THREE.Vector3(-Math.sin(a), Math.cos(a), 0); clawG.add(pv); fingers.push({ a, pv }); }
  for (const o of [...clawG.children]){
    if (!o.isMesh || !/^claw_(finger|pad|link_pin)/.test(o.name)) continue;
    const a = Math.atan2(o.position.y, o.position.x); let best = fingers[0], bd = 9;
    for (const f of fingers){ const d = Math.abs(Math.atan2(Math.sin(a - f.a), Math.cos(a - f.a))); if (d < bd){ bd = d; best = f; } }
    best.pv.attach(o);
  }
  for (const o of [...clawG.children]) if (o.isMesh && o.name === "claw_link") o.visible = false;   // the links would tear when the fingers open
  root.updateMatrixWorld(true);
  /* draw calls: merge every mesh that never moves relative to its holder into one mesh per material */
  function merge(holder, skip){
    holder.updateMatrixWorld(true); const inv = holder.matrixWorld.clone().invert(), groups = new Map(), dead = [];
    const walk = o => { if (o !== holder && skip.has(o)) return; for (const c of o.children) walk(c); if (o.isMesh && o.visible && !o.isInstancedMesh){ const k = o.material.uuid; if (!groups.has(k)) groups.set(k, { m:o.material, list:[] }); groups.get(k).list.push(o); } };
    walk(holder);
    for (const { m, list } of groups.values()){
      if (list.length < 2) continue;
      const parts = list.map(o => { let g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(); g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld)); return g; });
      let n = 0; for (const g of parts) n += g.attributes.position.count;
      const P = new Float32Array(n*3), N = new Float32Array(n*3), U = new Float32Array(n*2); let i = 0;
      for (const g of parts){ const c = g.attributes.position.count; P.set(g.attributes.position.array, i*3); if (g.attributes.normal) N.set(g.attributes.normal.array, i*3); if (g.attributes.uv) U.set(g.attributes.uv.array, i*2); i += c; g.dispose(); }
      const mg = new THREE.BufferGeometry(); mg.setAttribute("position", new THREE.BufferAttribute(P, 3)); mg.setAttribute("normal", new THREE.BufferAttribute(N, 3)); mg.setAttribute("uv", new THREE.BufferAttribute(U, 2));
      const mesh = new THREE.Mesh(mg, m); mesh.name = "merged"; holder.add(mesh); dead.push(...list);
    }
    for (const o of dead) o.parent && o.parent.remove(o);
  }
  const pivots = new Set(fingers.map(f => f.pv));
  merge(root, new Set([moveY, fl])); merge(moveY, new Set([moveX])); merge(moveX, new Set([clawPart])); merge(clawG, pivots); for (const pv of pivots) merge(pv, new Set());
  root.updateMatrixWorld(true);

  /* capsules: one instanced shell, as many as the game holds */
  const RM = CAP_R*SX;
  const shellG = new THREE.SphereGeometry(RM, 24, 14), shellM = new THREE.MeshPhysicalMaterial({ color:0xffffff, roughness:.02, metalness:0, clearcoat:1, clearcoatRoughness:.02, envMapIntensity:1.8, specularIntensity:1, transparent:true, opacity:.2, depthWrite:false });
  const tagG = new THREE.CircleGeometry(RM*.36, 20), tagM = new THREE.MeshStandardMaterial({ color:0x2a2f3c, roughness:.6, metalness:.2 });   // the NFC sticker inside, a small dark disc
  let caps = null, capTags = null, capN = 0;
  function capMeshes(n){
    if (caps && capN >= n) return; if (caps){ root.remove(caps); root.remove(capTags); }
    capN = Math.max(n, 64); caps = new THREE.InstancedMesh(shellG, shellM, capN); capTags = new THREE.InstancedMesh(tagG, tagM, capN);
    caps.frustumCulled = capTags.frustumCulled = false; root.add(capTags); root.add(caps);
  }

  /* cameras */
  const mk = fov => { const c = new THREE.PerspectiveCamera(fov, 1, .01, 30); return c; };
  const cams = [
    { name:"Corner camera", cam:mk(30), pose(c){ c.position.set(-1.62, 1.78, -2.05); c.lookAt(0, .64, .02); } },
    /* under the claw body, looking down past the fingers; the back of the machine is up on screen */
    { name:"Claw camera", cam:mk(74), pose(c, s){ const p = s.claw; c.up.set(0, 0, 1); c.position.set(p.x + .06, p.y - .1, p.z - .02); c.lookAt(p.x - .005, FLOOR - .02, p.z + .01); } },
    /* the landing camera behind the window of the chute, on the trapdoor */
    { name:"Chute camera", cam:mk(64), pose(c){ c.up.set(0, 1, 0); c.position.set(.34, .385, .292); c.lookAt(.34, .205, .345); } },
    /* recordings only: a stream camera over the front glass, looking down into the pile */
    { name:"Stream camera", cam:mk(46), pose(c){ c.up.set(0, 1, 0); c.position.set(-.34, 1.02, -.92); c.lookAt(.04, .6, .06); } },
    /* recordings only: straight down from above the machine */
    { name:"Top camera", cam:mk(44), pose(c){ c.up.set(0, 0, 1); c.position.set(0, 2.45, .0); c.lookAt(0, .42, 0); } }
  ];
  let main = 0;
  const setMain = i => { main = i; layoutPips(); };
  function layoutPips(){ if (!pips) return; const order = [0, 1, 2].filter(i => i !== main); pips.forEach((el, k) => { el.dataset.cam = order[k]; el.querySelector("span").textContent = cams[order[k]].name; }); if (pips.label) pips.label.textContent = cams[main].name; }
  if (pips) pips.forEach(el => el.addEventListener("click", () => setMain(+el.dataset.cam)));
  layoutPips();

  const S = { claw:new THREE.Vector3() }, m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3(1, 1, 1);
  let W = 0, H = 0, pr = 1, frameN = 0;
  function resize(){ const r = canvas.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return; if (!renderer && !failed) makeRenderer(); if (!renderer) return; pr = Math.min(innerWidth < 900 ? 1.2 : 1.25, devicePixelRatio || 1); W = r.width; H = r.height; renderer.setPixelRatio(pr); renderer.setSize(W, H, false); }
  canvas.addEventListener("webglcontextlost", e => { failed = true; e.preventDefault(); });

  /* draw one frame from the game state */
  function draw(st, list){
    if (!W) resize(); if (!W || !renderer || failed) return;
    const [mx, my] = toM(st.x, st.z), tipZ = FLOOR + (st.y - .1)*SX;
    moveY.position.set(0, my - YC, 0); moveX.position.set(mx - XC, 0, 0);
    const cz = tipZ + .243; clawG.position.z = cz;
    const bot = cz + .022; line.scale.y = Math.max(.01, (lineTop - bot)/lineH); line.position.z = (lineTop + bot)/2;
    clawPart.rotation.set(0, 0, 0); clawG.rotation.set(st.sw*.12, 0, 0);
    /* open: the tips swing out; holding: they close around the capsule, tips just under its middle */
    const fa = st.held ? -.06 : -.62*st.open;
    for (const f of fingers){ f.pv.quaternion.setFromAxisAngle(f.pv.userData.ax, fa); }
    root.updateMatrixWorld(true);
    clawG.getWorldPosition(S.claw);
    /* capsules */
    capMeshes(list.length); let n = 0;
    for (const c of list){
      if (c.state === "gone" && c.inBin) continue;
      let x, y, z;
      if (c === st.held){ v.set(0, 0, -.222).applyMatrix4(clawG.matrixWorld); root.worldToLocal(v); x = v.x; y = v.y; z = v.z; }
      else { [x, y] = toM(c.x, c.z); z = FLOOR + c.y*SX; if (c.state === "chute" || c.state === "gone"){ z = Math.max(.205 + RM, z); } }
      q.setFromEuler(new THREE.Euler(c.rx || (c.rx = Math.random()*6), c.ry || (c.ry = Math.random()*6), 0));
      m4.compose(v.set(x, y, z), q, sc); caps.setMatrixAt(n, m4);
      m4.compose(v.set(x, y, z - RM*.6), q.identity(), sc); capTags.setMatrixAt(n, m4); n++;
    }
    caps.count = capTags.count = n; caps.instanceMatrix.needsUpdate = capTags.instanceMatrix.needsUpdate = true;
    /* views */
    for (const c of cams) c.pose(c.cam, S);
    const view = (i, x, y, w, h) => { const c = cams[i].cam; c.aspect = w/h; c.updateProjectionMatrix(); renderer.setViewport(x, y, w, h); renderer.setScissor(x, y, w, h); renderer.render(scene, c); };
    view(main, 0, 0, W, H);
    frameN++;
    if (pips){ const cr = canvas.getBoundingClientRect();
      for (const el of pips){ const r = el.getBoundingClientRect(); if (!r.width) continue; view(+el.dataset.cam, r.left - cr.left, cr.bottom - r.bottom, r.width, r.height); } }
  }

  /* capsule spots for the game: a hex pack on the floor, clear of the drop zone and the grommets */
  function spots(){
    const out = [], d = 2*RM + .0012, dy = d*Math.sqrt(3)/2, L = .43 - RM;
    for (let r = 0; ; r++){ const y = -L + r*dy; if (y > L) break;
      for (let c = 0; ; c++){ const x = -L + (r % 2 ? d/2 : 0) + c*d; if (x > L) break;
        if (x > .2 - RM && y < -.2 + RM) continue; if (Math.hypot(x + .449, y - .449) < .03 || Math.hypot(x + .452, y + .452) < .03) continue;
        const [gx, gz] = toG(x, y); if (gz < .03 || gz > .97) continue; out.push([gx, gz]); } }
    return out;
  }
  return { draw, resize, spots, setMain, get main(){ return main; }, ok:() => !failed };
}
