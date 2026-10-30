/* ============ SIMULATOR 3D : the real machine (the metal build, anatomy-metal.js) driven by the simulator's game state ============
   Three live cameras: the play camera in the front left corner, the claw looking down, the landing camera in the chute.
   The main one fills the stage, the other two run in small windows; tap one to swap.
   Game space: x -1..1 (left..right), z 0..1 (front..back), y 0..1 (floor..top), 1 unit = 0.45 m across, 0.9 m deep.
   Game x runs along the machine's x (left..right as the front left play camera sees it), game z along y (front glass..back), so the prize hole is front right.
   Light on purpose: no point lights, no shadows, the electronics and cables left out, every still mesh merged, capsules one instanced mesh. */
import * as THREE from "./assets/vendor/three.module.min.js";
import { buildMachine } from "./anatomy-metal.js?v=14";

const SCENE = await fetch("assets/machine/metal.json?v=2").then(r => r.json());

export const CAP_R = .06;                                       // capsule radius in game x units (27 mm)
export const CHUTE = { x0:.52, x1:1.1, z0:-.1, z1:.24, h:0, cx:.786, cz:.107, any:true };   // the prize hole, front right in game space (any: test all four edges)
const FLOOR = .25, SX = .45, SZ = .9;
const toM = (x, z) => [x*SX, -.45 + z*SZ];                      // game x,z to machine x,y
const toG = (mx, my) => [mx/SX, (my + .45)/SZ];

export function createSim3D(canvas, pips){
  const LITE = document.documentElement.classList.contains("lite");
  /* the renderer is made on the first visible frame: a WebGL context on a hidden canvas gets dropped by some browsers */
  let renderer = null;
  let failed = false;
  const makeRenderer = () => { try { renderer = new THREE.WebGLRenderer({ canvas, antialias:!LITE, alpha:false, powerPreference:"high-performance" });
    renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05; renderer.setScissorTest(true); } catch (e){ failed = true; console.warn("sim3d: no WebGL", e); } };
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x070a1a); scene.fog = new THREE.Fog(0x070a1a, 3.5, 9);
  const root = new THREE.Group(); root.rotation.x = -Math.PI/2; scene.add(root);

  /* studio light: sky fill, a soft key from the front left, a cool rim from the back, and an environment for the metal */
  scene.add(new THREE.HemisphereLight(0xc9d0ff, 0x161a30, 1.35));
  const key = new THREE.DirectionalLight(0xf6f7ff, 2.4); key.position.set(-2.2, 2.8, 1.6); scene.add(key);
  const rim = new THREE.DirectionalLight(0x7d95ff, 1.6); rim.position.set(2.0, 1.6, -2.2); scene.add(rim);
  const top = new THREE.DirectionalLight(0xffffff, .9); top.position.set(0, 4, 0); scene.add(top);
  (function env(){ const faces = [], N = 64;
    for (let f = 0; f < 6; f++){ const cv = document.createElement("canvas"); cv.width = cv.height = N; const g = cv.getContext("2d"), gr = g.createLinearGradient(0, 0, 0, N);
      if (f === 2){ gr.addColorStop(0, "#eef2ff"); gr.addColorStop(1, "#8790cf"); } else if (f === 3){ gr.addColorStop(0, "#0b0d1c"); gr.addColorStop(1, "#05060e"); }
      else { gr.addColorStop(0, "#7780c9"); gr.addColorStop(.55, "#1c2048"); gr.addColorStop(1, "#07081a"); }
      g.fillStyle = gr; g.fillRect(0, 0, N, N); if (f === 0 || f === 4){ g.fillStyle = "rgba(240,244,255,.85)"; g.fillRect(N*.3, N*.08, N*.4, N*.34); } faces.push(cv); }
    const ct = new THREE.CubeTexture(faces); ct.colorSpace = THREE.SRGBColorSpace; ct.needsUpdate = true; scene.environment = ct; scene.environmentIntensity = .6; })();
  /* the room floor */
  const fl = new THREE.Mesh(new THREE.CircleGeometry(5, 48), new THREE.MeshStandardMaterial({ color:0x0b0f24, roughness:.85, metalness:.1 })); fl.position.z = -.023; root.add(fl);

  /* the machine */
  const cache = new Map();
  const mat = (part, key, o, phys) => { const k = part + "|" + key; if (cache.has(k)) return cache.get(k);
    if (LITE && phys){ o = { ...o }; delete o.clearcoat; delete o.clearcoatRoughness; delete o.specularIntensity; phys = false; }
    const m = phys ? new THREE.MeshPhysicalMaterial(o) : new THREE.MeshStandardMaterial(o); m.userData.base = { opacity:m.opacity, ei:m.emissiveIntensity || 0 }; cache.set(k, m); return m; };
  const fonts = document.fonts ? Promise.all(["700 100px 'Clash Display'", "700 40px 'Satoshi'", "500 40px 'Satoshi'", "800 40px 'Satoshi'"].map(f => document.fonts.load(f))).catch(() => {}) : Promise.resolve();
  const M = buildMachine(THREE, { mat, onFont:cb => fonts.then(cb), scene:SCENE });
  for (const [id, g] of Object.entries(M.parts)) if (id !== "capsules" && id !== "wiring" && id !== "electronics") root.add(g);   // electronics and cables sit behind panels, never on camera

  /* moving parts: what rides the beam (move y) and what rides the X cart (move xy), from the motion build's own tags */
  const moveY = new THREE.Group(), moveX = new THREE.Group(); root.add(moveY); moveY.add(moveX);
  root.updateMatrixWorld(true);
  const riders = []; M.parts.gantry.traverse(o => { if (o.isMesh && (o.userData.move === "y" || o.userData.move === "xy")) riders.push(o); });
  for (const o of riders) (o.userData.move === "xy" ? moveX : moveY).attach(o);
  moveX.attach(M.parts.winch); moveX.attach(M.parts.claw);
  const D = M.dims, YC = D.YC, XC = D.XC;
  const clawPart = M.parts.claw, clawG = clawPart.children.find(c => c.userData.clawRig), rig = clawG.userData.clawRig, line = clawPart.children.find(c => c.name === "claw_line");
  clawPart.traverse(o => { if (o.name === "claw_coil_cable") o.visible = false; });
  root.traverse(o => { if (o.name === "chute_c960_view") o.visible = false; });   // the view cone is an anatomy diagram, not a part
  const lineTop = line.position.z + line.geometry.parameters.height/2, lineH = line.geometry.parameters.height;
  /* the claw's arms turn on their pins; the links follow both ends */
  const Yax = new THREE.Vector3(0, 1, 0), lb = new THREE.Vector3(), ld = new THREE.Vector3(), rq = new THREE.Quaternion();
  function setOpen(k){ if (Math.abs(k - rig.open) < .0004) return; rig.open = k;
    for (const arm of rig.arms){ const u = arm.userData.clawArm; arm.quaternion.copy(u.q0).multiply(rq.setFromAxisAngle(u.side, -k)); }
    for (const l of rig.links){ lb.copy(l.b).applyQuaternion(l.arm.quaternion).add(l.arm.position); ld.copy(lb).sub(l.a); l.mesh.position.copy(l.a).add(lb).multiplyScalar(.5); l.mesh.scale.y = ld.length(); l.mesh.quaternion.setFromUnitVectors(Yax, ld.normalize()); } }
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
  const live = new Set([...rig.arms, ...rig.links.map(l => l.mesh)]);
  merge(root, new Set([moveY, fl])); merge(moveY, new Set([moveX])); merge(moveX, new Set([clawPart])); merge(clawPart, new Set([clawG, line])); merge(clawG, live); for (const a of rig.arms) merge(a, new Set());
  root.updateMatrixWorld(true);

  /* capsules: white printed shells, one instanced mesh; layer lines, the five lid holes and the seam are painted in one small texture */
  const RM = CAP_R*SX;
  const shellT = (() => { const cv = document.createElement("canvas"); cv.width = 256; cv.height = 128; const g = cv.getContext("2d");
    g.fillStyle = "#ffffff"; g.fillRect(0, 0, 256, 128); g.fillStyle = "rgba(120,118,112,.16)"; for (let y = 0; y < 128; y += 3) g.fillRect(0, y, 256, 1);
    g.fillStyle = "rgba(150,148,140,.75)"; g.fillRect(0, 63, 256, 2);
    g.fillStyle = "#2e2d2b"; for (let k = 0; k < 5; k++){ g.beginPath(); g.ellipse(25 + k*51.2, 23, 4.2, 2.6, 0, 0, 7); g.fill(); }
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; })();
  const shellG = new THREE.SphereGeometry(RM, 28, 16).rotateX(Math.PI/2), shellM = new THREE.MeshStandardMaterial({ color:0xf3f2ee, map:shellT, roughness:.62, metalness:0 });
  let caps = null, capN = 0;
  function capMeshes(n){
    if (caps && capN >= n) return; if (caps) root.remove(caps);
    capN = Math.max(n, 64); caps = new THREE.InstancedMesh(shellG, shellM, capN); caps.frustumCulled = false; root.add(caps);
  }

  /* cameras (three.js space: x = machine x, y = up, z = toward the machine's front) */
  const mk = fov => new THREE.PerspectiveCamera(fov, 1, .01, 30);
  const cams = [
    /* the real play camera: under the top ring in the front left corner, looking across the pile */
    { name:"Corner camera", cam:mk(68), pose(c){ c.up.set(0, 1, 0); c.position.set(-.43, 1.04, .43); c.lookAt(.12, .36, -.06); } },
    /* under the claw body, looking down past the arms; game back is up on screen */
    { name:"Claw camera", cam:mk(74), pose(c, s){ const p = s.claw; c.up.set(0, 0, -1); c.position.set(p.x + .02, p.y - .12, p.z + .07); c.lookAt(p.x, FLOOR - .02, p.z - .005); } },
    /* the landing camera behind the chute window, on the trapdoor */
    { name:"Chute camera", cam:mk(78), pose(c){ c.up.set(0, 1, 0); c.position.set(.3535, .216, .297); c.lookAt(.3535, .128, .3605); } },   // inside the top of the chute, looking down at the trapdoor
    /* recordings only: over the front glass, looking down into the pile */
    { name:"Stream camera", cam:mk(46), pose(c){ c.up.set(0, 1, 0); c.position.set(-.3, 1.02, .95); c.lookAt(.04, .45, -.06); } },
    /* recordings only: straight down from above the machine */
    { name:"Top camera", cam:mk(44), pose(c){ c.up.set(0, 0, -1); c.position.set(0, 2.45, 0); c.lookAt(0, .3, 0); } }
  ];
  let main = 0;
  const setMain = i => { main = i; layoutPips(); };
  function layoutPips(){ if (!pips) return; const order = [0, 1, 2].filter(i => i !== main); pips.forEach((el, k) => { el.dataset.cam = order[k]; el.querySelector("span").textContent = cams[order[k]].name; }); if (pips.label) pips.label.textContent = cams[main].name; }
  if (pips) pips.forEach(el => el.addEventListener("click", () => setMain(+el.dataset.cam)));
  layoutPips();

  const S = { claw:new THREE.Vector3() }, m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3(1, 1, 1), eu = new THREE.Euler();
  let W = 0, H = 0, pr = 1, frameN = 0; const PRX = +(new URLSearchParams(location.search).get("pr") || 0);   // recordings render supersampled
  function resize(){ const r = canvas.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return; if (!renderer && !failed) makeRenderer(); if (!renderer) return;
    pr = PRX || (LITE ? 1 : Math.min(innerWidth < 900 ? 1.5 : 1.5, devicePixelRatio || 1)); W = r.width; H = r.height; renderer.setPixelRatio(pr); renderer.setSize(W, H, false); }
  canvas.addEventListener("webglcontextlost", e => { failed = true; e.preventDefault(); });

  /* draw one frame from the game state */
  const HELD = -.188, BOT = .215;                                 // closed: a held capsule's centre and the paddles' lowest point, under the claw's origin
  function draw(st, list){
    if (!W) resize(); if (!W || !renderer || failed) return;
    const [mx, my] = toM(st.x, st.z), tipZ = FLOOR + (st.y - .1)*SX;
    moveY.position.set(0, my - YC, 0); moveX.position.set(mx - XC, 0, 0);
    const cz = tipZ + BOT; clawG.position.z = cz;
    const bot = cz + .022; line.scale.y = Math.max(.01, (lineTop - bot)/lineH); line.position.z = (lineTop + bot)/2;
    clawG.rotation.set(0, st.sw*.12, 0);
    /* open: the arms swing out; holding: they close round the capsule */
    setOpen(st.held ? .04 : .55*st.open);
    root.updateMatrixWorld(true);
    clawG.getWorldPosition(S.claw);
    /* capsules */
    capMeshes(list.length); let n = 0;
    for (const c of list){
      if (c.state === "gone" && c.inBin) continue;
      let x, y, z;
      if (c === st.held){ v.set(0, 0, HELD).applyMatrix4(clawG.matrixWorld); root.worldToLocal(v); x = v.x; y = v.y; z = v.z; }
      else { [x, y] = toM(c.x, c.z); z = FLOOR + c.y*SX; if (c.state === "chute" || c.state === "gone"){ z = Math.max(.136 + RM, z); } }
      q.setFromEuler(eu.set(c.rx || (c.rx = Math.random()*6.28), c.ry || (c.ry = Math.random()*6.28), c.rz || (c.rz = Math.random()*6.28)));
      m4.compose(v.set(x, y, z), q, sc); caps.setMatrixAt(n, m4); n++;
    }
    caps.count = n; caps.instanceMatrix.needsUpdate = true;
    /* views */
    for (const c of cams) c.pose(c.cam, S);
    const view = (i, x, y, w, h) => { const c = cams[i].cam; c.aspect = w/h; c.updateProjectionMatrix(); renderer.setViewport(x, y, w, h); renderer.setScissor(x, y, w, h); renderer.render(scene, c); };
    view(main, 0, 0, W, H);
    frameN++;
    if (pips){ const cr = canvas.getBoundingClientRect();
      for (const el of pips){ const r = el.getBoundingClientRect(); if (!r.width) continue; view(+el.dataset.cam, r.left - cr.left, cr.bottom - r.bottom, r.width, r.height); } }
  }

  /* capsule spots for the game: a loose hex pack on the floor, jittered, clear of the prize hole and its walls */
  function spots(){
    const out = [], d = 2*RM + .0055, dy = d*Math.sqrt(3)/2, L = .445 - RM; let sd = 5; const r = () => (sd = (sd*16807) % 2147483647)/2147483647;
    for (let row = 0; ; row++){ const y = -L + row*dy; if (y > L) break;
      for (let c = 0; ; c++){ const x = -L + (row % 2 ? d/2 : 0) + c*d; if (x > L) break;
        if (x > .229 - RM - .006 && y < -.229 + RM + .006) continue;
        const jx = x + (r() - .5)*.005, jy = y + (r() - .5)*.005;            // loose and a little uneven, so the pile does not read as a grid
        const [gx, gz] = toG(jx, jy); if (gz < .02 || gz > .98 || gx < -.99 || gx > .99) continue; out.push([gx, gz]); } }
    return out;
  }
  return { draw, resize, spots, setMain, get main(){ return main; }, ok:() => !failed };
}
