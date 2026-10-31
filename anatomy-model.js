/* ============ Prototype 01, modelled from the BOM and the build tutorial (Oct 2026) ============
   Units: metres. z up, ground at 0. Front (player side, door and cup) is -y, rear (electrical panel) is +y, left is -x.
   Sources: docs/prototype01-bom/bom.md, "Grablab Prototype 01 Build tutorial (EN)", docs/prototype01-stl/build_stl.py.
   Every mesh is named, so the connectivity check in anatomy.js can say exactly what floats. */
export function buildMachine(THREE, api){
  const { mat, onFont } = api;
  const parts = {};
  const G = id => parts[id] ||= Object.assign(new THREE.Group(), { name:id });
  let PART = "frame";
  const use = id => { PART = id; };

  /* ---------------- materials (one set per part, so isolating a part never leaves strays) ---------------- */
  const M = {};
  const m = (key, o, phys) => (M[PART + "|" + key] ||= mat(PART, key, o || {}, phys));
  const timber = () => m("timber", { color:0x1b1c21, roughness:.82, metalness:0 });
  const mdf = () => m("mdf", { color:0x17181c, roughness:.9, metalness:0 });
  const alu = () => m("alu", { color:0x1e1f25, roughness:.34, metalness:.65 });             // black anodised V-slot
  const plate = () => m("plate", { color:0xb7bcc6, roughness:.3, metalness:1 });             // Matik plates, raw aluminium
  const steel = () => m("steel", { color:0xc9cdd5, roughness:.22, metalness:1 });
  const dark = () => m("dark", { color:0x2a2c33, roughness:.45, metalness:.5 });
  const pom = () => m("pom", { color:0x101012, roughness:.4, metalness:0 });                // POM wheels, rubber
  const nema = () => m("nema", { color:0x15161a, roughness:.38, metalness:.4 });
  const nemaCap = () => m("nemacap", { color:0xa8adb7, roughness:.3, metalness:1 });
  const petg = () => m("petg", { color:0x2e313a, roughness:.5, metalness:.05 });             // printed parts
  const belt = () => m("belt", { color:0x0b0b0c, roughness:.85, metalness:0 });
  const brass = () => m("brass", { color:0xc9a35a, roughness:.3, metalness:1 });
  const red = () => m("red", { color:0xd01a1f, roughness:.28, metalness:.05 });
  const yellow = () => m("yellow", { color:0xf2c418, roughness:.4, metalness:0 });
  const wireR = () => m("wirer", { color:0xc22325, roughness:.45 });
  const wireK = () => m("wirek", { color:0x0e0e10, roughness:.45 });
  const acrylic0 = () => m("acrylic", { color:0xdfe7ff, roughness:.04, metalness:0, clearcoat:1, clearcoatRoughness:.05, transparent:true, opacity:.14, depthWrite:false }, true);
  const acrylic = () => { const a = acrylic0(); a.userData.noPick = true; return a; };
  const np = mt => { (typeof mt === "function" ? mt() : mt).userData.noPick = true; return mt; };
  const lens = () => m("lens", { color:0x05060a, roughness:.05, metalness:.8 });
  const led = c => m("led" + c.toString(16), { color:c, emissive:c, emissiveIntensity:1.6, roughness:1 });
  const pcbRed = () => m("pcbr", { color:0x8a1b1b, roughness:.45 });
  const sw = () => m("sw", { color:0x111114, roughness:.4 });
  const wagoM = () => m("wago", { color:0xe6e7ea, roughness:.5 });
  const lever = () => m("lever", { color:0xf08a1c, roughness:.45 });

  /* ---------------- geometry helpers ---------------- */
  let n = 0;
  const add = (geo, mt, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, name = "", parent = null) => {
    const o = new THREE.Mesh(geo, typeof mt === "function" ? mt() : mt); o.position.set(x, y, z); o.rotation.set(rx, ry, rz);
    o.name = name || (PART + "_" + n); n++; o.userData.part = PART; o.castShadow = o.receiveShadow = true;
    (parent || G(PART)).add(o); return o;
  };
  const BOX = (sx, sy, sz) => new THREE.BoxGeometry(sx, sy, sz);
  const box = (x0, y0, z0, x1, y1, z1, mt, name, parent) => add(BOX(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0)), mt, (x0 + x1)/2, (y0 + y1)/2, (z0 + z1)/2, 0, 0, 0, name, parent);
  /* a box with rounded edges and corners, centred, like a printed or moulded part */
  const rbox = (w, d, h, r = .002) => { const b = Math.min(r*.6, h*.3, w*.2, d*.2), W = w - 2*b, Dd = d - 2*b, R = Math.max(.0002, Math.min(r - b, W/2.01, Dd/2.01)), s = new THREE.Shape();
    s.moveTo(-W/2 + R, -Dd/2); s.lineTo(W/2 - R, -Dd/2); s.quadraticCurveTo(W/2, -Dd/2, W/2, -Dd/2 + R); s.lineTo(W/2, Dd/2 - R); s.quadraticCurveTo(W/2, Dd/2, W/2 - R, Dd/2);
    s.lineTo(-W/2 + R, Dd/2); s.quadraticCurveTo(-W/2, Dd/2, -W/2, Dd/2 - R); s.lineTo(-W/2, -Dd/2 + R); s.quadraticCurveTo(-W/2, -Dd/2, -W/2 + R, -Dd/2);
    const g = new THREE.ExtrudeGeometry(s, { depth:Math.max(.0001, h - 2*b), bevelEnabled:true, bevelSize:b, bevelThickness:b, bevelSegments:2, curveSegments:5 }); g.translate(0, 0, -(h - 2*b)/2); return g; };
  const rb = (x0, y0, z0, x1, y1, z1, mt, name, r) => add(rbox(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0), r), mt, (x0 + x1)/2, (y0 + y1)/2, (z0 + z1)/2, 0, 0, 0, name);
  const cylZ = (r, h, k = 32) => new THREE.CylinderGeometry(r, r, h, k).rotateX(Math.PI/2);
  const cylX = (r, h, k = 32) => new THREE.CylinderGeometry(r, r, h, k).rotateZ(Math.PI/2);
  const cylY = (r, h, k = 32) => new THREE.CylinderGeometry(r, r, h, k);
  const long = fn => { const was = PART; PART = "wiring"; fn(); PART = was; };
  const tube = (pts, r, mt, name, k = 64) => add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)), false, "centripetal"), k, r, 8), mt, 0, 0, 0, 0, 0, 0, name);
  /* a cable laid like a real harness: straight runs between the points, a small radius at every bend */
  const harness = (pts, r, mt, name) => { const P = pts.map(p => new THREE.Vector3(...p)), path = new THREE.CurvePath(); let prev = P[0];
    for (let i = 1; i < P.length; i++){ const a = P[i];
      if (i === P.length - 1){ path.add(new THREE.LineCurve3(prev, a)); break; }
      const f = Math.min(.007, a.distanceTo(P[i - 1])/2.2, a.distanceTo(P[i + 1])/2.2), p1 = a.clone().add(P[i - 1].clone().sub(a).setLength(f)), p2 = a.clone().add(P[i + 1].clone().sub(a).setLength(f));
      path.add(new THREE.LineCurve3(prev, p1)); path.add(new THREE.QuadraticBezierCurve3(p1, a, p2)); prev = p2; }
    return add(new THREE.TubeGeometry(path, Math.max(32, P.length*20), r, 8), mt, 0, 0, 0, 0, 0, 0, name); };
  const canvasTex = (w, h, draw) => { const cv = document.createElement("canvas"); cv.width = w; cv.height = h; const g = cv.getContext("2d"); draw(g, w, h);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.userData.redraw = () => { g.clearRect(0, 0, w, h); draw(g, w, h); t.needsUpdate = true; }; return t; };
  /* a printed face: canvas drawn at about 12 px per mm, capped at 2048 px */
  const label = (key, w, h, drawFn, o) => { const S = Math.min(12000, 2048/Math.max(w, h)); const t = canvasTex(Math.round(w*S), Math.round(h*S), drawFn); onFont(() => t.userData.redraw());
    return m(key, Object.assign({ map:t, roughness:.6, metalness:0 }, o || {})); };
  const FACE_NEG_Y = [Math.PI/2, 0, 0], FACE_POS_Y = [Math.PI/2, Math.PI, 0];   // plane rotations: printed side toward -y or +y, text upright

  /* V-slot cross section (mm): slots on every face, centre bores, extruded along one axis */
  function vslotShape(w, h){
    const s = new THREE.Shape(), W = w/2000, H = h/2000, g = .003, d = .0018, pts = [];
    const edge = (x0, y0, x1, y1, slots, nx, ny) => { pts.push([x0, y0]);
      const tx = Math.sign(x1 - x0), ty = Math.sign(y1 - y0);
      for (const c of slots){ const ax = x0 + (x1 - x0)*c, ay = y0 + (y1 - y0)*c;
        pts.push([ax - g*tx, ay - g*ty], [ax - g*.55*tx - d*nx, ay - g*.55*ty - d*ny], [ax + g*.55*tx - d*nx, ay + g*.55*ty - d*ny], [ax + g*tx, ay + g*ty]); } };
    const hs = w > h ? [.25, .75] : [.5], vs = h > w ? [.25, .75] : [.5];
    edge(-W, -H, W, -H, hs, 0, -1); edge(W, -H, W, H, vs, 1, 0); edge(W, H, -W, H, hs, 0, 1); edge(-W, H, -W, -H, vs, -1, 0);
    s.moveTo(...pts[0]); for (const p of pts.slice(1)) s.lineTo(...p); s.closePath();
    const bores = h > w ? [[0, -H/2], [0, H/2]] : w > h ? [[-W/2, 0], [W/2, 0]] : [[0, 0]];
    for (const [bx, by] of bores){ const c = new THREE.Path(); c.absarc(bx, by, .0021, 0, Math.PI*2, true); s.holes.push(c); }
    return s;
  }
  /* profile along axis x or y, w across (horizontal) and h up, in mm */
  function vslot(axis, len, w, h, x, y, z, name){
    const geo = new THREE.ExtrudeGeometry(vslotShape(w, h), { depth:len, bevelEnabled:false, curveSegments:12 }); geo.translate(0, 0, -len/2);
    const B = axis === "x" ? [[0, 1, 0], [0, 0, 1], [1, 0, 0]] : [[-1, 0, 0], [0, 0, 1], [0, 1, 0]];
    geo.applyMatrix4(new THREE.Matrix4().makeBasis(...B.map(v => new THREE.Vector3(...v))));
    return add(geo, alu, x, y, z, 0, 0, 0, name);
  }
  /* GT2 20T pulley or smooth idler; hs = which side the hub sits on, along the axis */
  function pulley(axis, x, y, z, name, idler, hs){
    const rot = axis === "x" ? [0, Math.PI/2, 0] : [Math.PI/2, 0, 0];
    const at = k => axis === "x" ? [x + k, y, z] : [x, y + k, z];
    const o = add(cylZ(idler ? .0062 : .0064, .0072, 24), idler ? steel : plate, x, y, z, ...rot, name);
    add(cylZ(.0085, .001, 32), steel, ...at(-.0041), ...rot, name + "_flange"); add(cylZ(.0085, .001, 32), steel, ...at(.0041), ...rot, name + "_flange");
    if (!idler) add(cylZ(.0055, .007, 24), plate, ...at(hs*.0078), ...rot, name + "_hub");
    return o;
  }
  /* NEMA 17: 42 x 42, silver caps, face at `face`, shaft along dir, body behind the face */
  function nema17(face, dir, L, name, shaft = .024){
    const d = new THREE.Vector3(...dir).normalize();
    const grp = new THREE.Group(); grp.position.set(...face); grp.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), d); G(PART).add(grp);
    const a = (geo, mt, x, y, z, nm) => add(geo, mt, x, y, z, 0, 0, 0, name + nm, grp);
    a(BOX(.042, .042, .009), nemaCap, 0, 0, -.0045, "_cap"); a(BOX(.0405, .0405, L - .018), nema, 0, 0, -L/2, "_body"); a(BOX(.042, .042, .009), nemaCap, 0, 0, -L + .0045, "_cap");
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) a(cylZ(.0018, .001, 10), dark, sx*.0155, sy*.0155, .0005, "_screw");
    a(cylZ(.011, .002), nemaCap, 0, 0, .001, "_boss"); a(cylZ(.0025, shaft, 16), steel, 0, 0, shaft/2, "_shaft");
    a(BOX(.016, .006, .008), m("plug", { color:0xf1f1f3, roughness:.5 }), 0, -.024, -L + .006, "_plug");
    return grp;
  }
  /* half a belt loop around a pulley: arc from e1 through e2 to -e1, belt width along e1 x e2 */
  function wrap(c, e1, e2, name){
    const g = new THREE.TorusGeometry(.0065, .0007, 6, 24, Math.PI); g.scale(1, 1, 4.3);
    const a = new THREE.Vector3(...e1), b = new THREE.Vector3(...e2); g.applyMatrix4(new THREE.Matrix4().makeBasis(a, b, a.clone().cross(b)));
    return add(g, belt, ...c, 0, 0, 0, name);
  }
  /* V wheel: POM tyre with a V edge, bearing inside, axis z */
  const vwheelGeo = new THREE.LatheGeometry([[.0042, -.0053], [.0095, -.0053], [.0118, -.0012], [.012, 0], [.0118, .0012], [.0095, .0053], [.0042, .0053]].map(([r, z]) => new THREE.Vector2(r, z)), 32);
  const vwheel = (x, y, z, nm) => { add(vwheelGeo, pom, x, y, z, Math.PI/2, 0, 0, nm); add(cylZ(.0042, .0112, 16), steel, x, y, z, 0, 0, 0, nm + "_bearing"); };
  /* micro switch end stop on a printed L, base in the xy plane */
  const endstop = (x, y, z, rz, nm) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.z = rz; G(PART).add(g);
    add(BOX(.025, .02, .003), petg, 0, 0, 0, 0, 0, 0, nm + "_mount", g); add(BOX(.003, .02, .023), petg, -.011, 0, .013, 0, 0, 0, nm + "_mount", g);
    add(BOX(.0016, .02, .016), pcbRed, -.0087, 0, .015, 0, 0, 0, nm + "_pcb", g);
    add(BOX(.006, .013, .006), sw, -.0049, 0, .015, 0, 0, 0, nm + "_switch", g);
    add(BOX(.0008, .016, .003), steel, -.0015, .002, .0185, 0, 0, 0, nm + "_lever", g); return g; };

  /* =========================================================================================== frame: 40 x 40 timber */
  use("frame");
  const T = .04, H0 = 1.2;                        // posts 1200: a tall play area over the cabinet
  const POSTS = [[-.48, -.48], [.48, -.48], [.48, .48], [-.48, .48]];
  for (const [x, y] of POSTS) box(x - .02, y - .02, 0, x + .02, y + .02, H0, timber, "frame_post");
  /* bottom square between the posts, top square sitting on them */
  box(-.46, -.5, 0, .46, -.46, T, timber, "frame_rail_bottom"); box(-.46, .46, 0, .46, .5, T, timber, "frame_rail_bottom");
  box(-.5, -.46, 0, -.46, .46, T, timber, "frame_rail_bottom"); box(.46, -.46, 0, .5, .46, T, timber, "frame_rail_bottom");
  box(-.5, -.5, H0, .5, -.46, H0 + T, timber, "frame_rail_top"); box(-.5, .46, H0, .5, .5, H0 + T, timber, "frame_rail_top");
  box(-.5, -.46, H0, -.46, .46, H0 + T, timber, "frame_rail_top"); box(.46, -.46, H0, .5, .46, H0 + T, timber, "frame_rail_top");
  /* the two floor rails, front to rear, top at 400 */
  box(-.5, -.46, .36, -.46, .46, .40, timber, "frame_floor_rail"); box(.46, -.46, .36, .5, .46, .40, timber, "frame_floor_rail");
  /* 16 steel angle brackets: 8 in the inside corners of the squares, 4 under each floor rail end */
  const angle = (x, y, z, sx, sy, nm) => { box(x, y, z, x + sx*.04, y + sy*.003, z + .04, steel, nm); box(x, y, z, x + sx*.003, y + sy*.04, z + .04, steel, nm);
    for (const k of [.014, .029]){ add(cylY(.0032, .0012, 12), dark, x + sx*k, y + sy*.0036, z + .02, 0, 0, 0, nm + "_screw"); add(cylX(.0032, .0012, 12), dark, x + sx*.0036, y + sy*k, z + .02, 0, 0, 0, nm + "_screw"); } };
  for (const [x, y, sx, sy] of [[-.46, -.46, 1, 1], [.46, -.46, -1, 1], [.46, .46, -1, -1], [-.46, .46, 1, -1]]){ angle(x, y, 0, sx, sy, "frame_bracket"); angle(x, y, H0, sx, sy, "frame_bracket"); }
  for (const s of [-1, 1]) for (const e of [-1, 1]){
    box(s*.46, e*.46, .32, s*.5, e*.458, .36, steel, "frame_bracket");            // leg on the post
    box(s*.46, e*.46, .358, s*.5, e*.42, .36, steel, "frame_bracket"); }           // leg under the rail
  const footG = new THREE.LatheGeometry([[0, 0], [.025, 0], [.026, .002], [.024, .012], [.019, .016], [0, .016]].map(([r, z]) => new THREE.Vector2(r, z)), 40).rotateX(Math.PI/2);
  for (const [x, y] of POSTS){ add(footG, m("rubber", { color:0x0c0c0e, roughness:.85 }), x, y, -.016, 0, 0, 0, "frame_foot"); add(cylZ(.006, .002, 6), steel, x, y, -.001, 0, 0, 0, "frame_foot_bolt"); }
  for (const [x, y] of [[-.48, -.5005], [.48, -.5005], [-.48, .5005], [.48, .5005]]) for (const z of [.012, .028, H0 + .012, H0 + .028]) add(cylY(.0035, .001, 12), steel, x, y, z, 0, 0, 0, "frame_screw");

  /* =========================================================================================== front panel: MDF 1000 x 300, the face of the machine under the floor */
  use("panel");
  const IN = .50, PY1 = .512;                                     // inner face (components) and outer face (E-stop, QR, GRABLAB)
  box(-.5, IN, .02, .5, PY1, .40, mdf, "panel_mdf");                 // up to the floor: no slot under it
  for (const [x, z] of [[-.48, .035], [-.48, .385], [.48, .035], [.48, .385], [0, .035], [0, .385]]) add(cylY(.0035, .0012, 12), steel, x, PY1 + .0006, z, 0, 0, 0, "panel_screw");
  /* E-stop: contact block inside, collar through the 22 mm hole, yellow legend, red mushroom outside */
  box(-.365, IN - .045, .205, -.335, IN, .235, m("estopbody", { color:0x1b1c20, roughness:.5 }), "panel_estop_contacts");
  for (let i = 0; i < 4; i++) add(cylY(.0022, .002, 10), steel, -.358 + (i % 2)*.016, IN - .046, .212 + (i > 1 ? .016 : 0), 0, 0, 0, "panel_estop_screw");
  add(cylY(.042, .002, 56), yellow, -.35, PY1 + .001, .22, 0, 0, 0, "panel_estop_plate");
  const legend = label("legend", .084, .084, (g, w, h) => { g.fillStyle = "#f2c418"; g.beginPath(); g.arc(w/2, h/2, w/2, 0, Math.PI*2); g.fill();
    g.fillStyle = "#141414"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `800 ${h*.07}px Satoshi, sans-serif`; try { g.letterSpacing = `${h*.006}px`; } catch (e) {} g.fillText("EMERGENCY", w/2, h*.13); g.font = `800 ${h*.085}px Satoshi, sans-serif`; g.fillText("STOP", w/2, h*.875); }, { transparent:true });
  add(new THREE.CircleGeometry(.042, 56), legend, -.35, PY1 + .00205, .22, ...FACE_POS_Y, "panel_estop_legend");
  add(cylY(.016, .012, 32), dark, -.35, PY1 + .006, .22, 0, 0, 0, "panel_estop_collar");
  add(cylY(.02, .006, 48), red, -.35, PY1 + .015, .22, 0, 0, 0, "panel_estop_rim");
  add(new THREE.SphereGeometry(.02, 40, 16, 0, Math.PI*2, 0, Math.PI/2), red, -.35, PY1 + .018, .22, 0, 0, 0, "panel_estop_mushroom");
  /* scan to play: anodised plate, QR, caption */
  const plateM = m("anod", { color:0x202229, roughness:.32, metalness:.7 });
  box(.31, PY1, .145, .39, PY1 + .003, .235, plateM, "panel_qr_plate");
  const qr = label("qr", .06, .06, (g, w, h) => { const N = 25, s = w/(N + 4); g.fillStyle = "#f4f5f8"; g.fillRect(0, 0, w, h); g.fillStyle = "#0c0d10"; let seed = 7; const rnd = () => (seed = (seed*16807) % 2147483647)/2147483647;
    const fin = (cx, cy) => { g.fillRect((cx + 2)*s, (cy + 2)*s, 7*s, 7*s); g.fillStyle = "#f4f5f8"; g.fillRect((cx + 3)*s, (cy + 3)*s, 5*s, 5*s); g.fillStyle = "#0c0d10"; g.fillRect((cx + 4)*s, (cy + 4)*s, 3*s, 3*s); };
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++){ if ((r < 8 && c < 8) || (r < 8 && c > N - 9) || (r > N - 9 && c < 8)) continue; if (rnd() < .48) g.fillRect((c + 2)*s, (r + 2)*s, s, s); }
    fin(0, 0); fin(N - 7, 0); fin(0, N - 7); });
  add(new THREE.PlaneGeometry(.06, .06), qr, .35, PY1 + .0031, .2, ...FACE_POS_Y, "panel_qr");
  const scan = label("scan", .07, .014, (g, w, h) => { g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#f2f3fa"; g.font = `700 ${h*.52}px Satoshi, sans-serif`; try { g.letterSpacing = `${h*.09}px`; } catch (e) {} g.fillText("SCAN TO PLAY", w/2, h/2); }, { transparent:true, toneMapped:false });
  add(new THREE.PlaneGeometry(.07, .014), scan, .35, PY1 + .0031, .1565, ...FACE_POS_Y, "panel_scan");
  /* GRABLAB plate with a chrome hairline */
  box(-.205, PY1, .13, .205, PY1 + .003, .25, plateM, "panel_wordmark_plate");
  box(-.205, PY1 + .003, .2465, .205, PY1 + .0036, .248, steel, "panel_trim"); box(-.205, PY1 + .003, .132, .205, PY1 + .0036, .1335, steel, "panel_trim");
  const wm = label("wordmark", .36, .1, (g, w, h) => { g.textAlign = "center"; g.textBaseline = "middle"; g.shadowColor = "rgba(200,215,255,.85)"; g.shadowBlur = h*.09; g.fillStyle = "#f6f7ff";
    g.font = `700 ${h*.44}px 'Clash Display', Satoshi, sans-serif`; try { g.letterSpacing = `${h*.02}px`; } catch (e) {} g.fillText("GRABLAB", w/2, h*.42); g.shadowBlur = 0; g.fillText("GRABLAB", w/2, h*.42);
    g.font = `500 ${h*.075}px Satoshi, sans-serif`; try { g.letterSpacing = `${h*.025}px`; } catch (e) {} g.fillStyle = "rgba(220,226,245,.78)"; g.fillText("PROVABLY FAIR CLAW", w/2, h*.76);
    g.fillStyle = "rgba(220,226,245,.5)"; g.font = `500 ${h*.06}px Satoshi, sans-serif`; g.fillText("PROTOTYPE 01", w/2, h*.89); }, { transparent:true, toneMapped:false });
  wm.emissive = new THREE.Color(0xffffff); wm.emissiveMap = wm.map; wm.emissiveIntensity = .9; wm.userData.base.ei = .9;
  add(new THREE.PlaneGeometry(.36, .1), wm, 0, PY1 + .0031, .19, ...FACE_POS_Y, "panel_wordmark");

  /* =========================================================================================== electronics on the inner face, left to right */
  use("electronics");
  /* 12 V 10 A supply, lying, terminals on the right */
  box(-.455, IN - .042, .035, -.256, IN, .133, m("psu", { color:0xc3c7cf, roughness:.38, metalness:.9 }), "el_psu");
  for (let r = 0; r < 3; r++) for (let i = 0; i < 12; i++) box(-.445 + i*.0085, IN - .0424, .04 + r*.012, -.441 + i*.0085, IN - .042, .048 + r*.012, dark, "el_psu_vent");
  box(-.288, IN - .05, .042, -.259, IN - .042, .126, m("term", { color:0x18191d, roughness:.5 }), "el_psu_terminals");
  for (let i = 0; i < 7; i++) add(cylY(.003, .002, 12), steel, -.2735, IN - .051, .05 + i*.0115, 0, 0, 0, "el_psu_screw");
  const psuLbl = label("psulbl", .08, .036, (g, w, h) => { g.fillStyle = "#e9ebef"; g.fillRect(0, 0, w, h); g.fillStyle = "#1d1f24"; g.font = `700 ${h*.3}px Satoshi, sans-serif`; g.fillText("DC 12 V", w*.06, h*.5); });
  add(new THREE.PlaneGeometry(.08, .036), psuLbl, -.34, IN - .0426, .1, ...FACE_NEG_Y, "el_psu_label");
  /* two 5 way lever connectors side by side: 12 V and ground */
  for (const x0 of [-.32, -.27]){ box(x0, IN - .018, .24, x0 + .045, IN, .26, wagoM, "el_wago");
    for (let i = 0; i < 5; i++) box(x0 + .002 + i*.009, IN - .022, .252, x0 + .009 + i*.009, IN - .018, .26, lever, "el_wago_lever"); }
  /* Arduino UNO on standoffs, CNC Shield V3 on its headers, 4 x A4988 with heatsinks */
  const ux0 = -.232, uz0 = .095;
  for (const [dx, dz] of [[.004, .004], [.064, .004], [.004, .049], [.064, .049]]) add(cylY(.0025, .006, 10), brass, ux0 + dx, IN - .003, uz0 + dz, 0, 0, 0, "el_uno_standoff");
  box(ux0, IN - .0076, uz0, ux0 + .0686, IN - .006, uz0 + .0534, m("uno", { color:0x0e6ea8, roughness:.45 }), "el_uno");
  box(ux0 + .03, IN - .019, uz0 - .006, ux0 + .042, IN - .0076, uz0 + .01, steel, "el_uno_usb");
  for (let i = 0; i < 24; i++) box(ux0 + .006 + i*.0024, IN - .0199, uz0 + .002, ux0 + .0072 + i*.0024, IN - .0076, uz0 + .0034, brass, "el_shield_pins");
  box(ux0 + .003, IN - .0215, uz0 + .001, ux0 + .0656, IN - .0199, uz0 + .052, m("shield", { color:0x1b3a87, roughness:.45 }), "el_cnc_shield");
  for (let i = 0; i < 4; i++){ const x = ux0 + .007 + i*.0145;
    box(x, IN - .028, uz0 + .018, x + .0127, IN - .0215, uz0 + .0382, m("a4988", { color:0xb81d24, roughness:.45 }), "el_a4988");
    box(x + .002, IN - .031, uz0 + .023, x + .0107, IN - .028, uz0 + .032, plate, "el_a4988_heatsink");
    for (let f = 0; f < 4; f++) box(x + .002 + f*.0024, IN - .036, uz0 + .023, x + .003 + f*.0024, IN - .031, uz0 + .032, plate, "el_a4988_fin"); }
  box(ux0 + .046, IN - .03, uz0 + .041, ux0 + .062, IN - .0215, uz0 + .051, m("term2", { color:0x1e7a3a, roughness:.5 }), "el_shield_power");
  /* printed carrier with the L298N and the 12 V to 5 V converter */
  const cx0 = -.155;
  box(cx0, IN - .003, .085, cx0 + .1, IN, .145, petg, "el_carrier");
  box(cx0 + .006, IN - .0046, .091, cx0 + .049, IN - .003, .134, m("l298", { color:0xc0262e, roughness:.45 }), "el_l298n");
  box(cx0 + .016, IN - .027, .1, cx0 + .039, IN - .0046, .125, m("hs", { color:0x101114, roughness:.4, metalness:.6 }), "el_l298n_heatsink");
  for (let f = 0; f < 7; f++) box(cx0 + .016 + f*.0035, IN - .035, .1, cx0 + .0175 + f*.0035, IN - .027, .125, m("hs"), "el_l298n_fin");
  box(cx0 + .008, IN - .0126, .091, cx0 + .03, IN - .0046, .099, m("term2"), "el_l298n_terminal"); box(cx0 + .034, IN - .0126, .134, cx0 + .048, IN - .0046, .142, m("term2"), "el_l298n_terminal");
  box(cx0 + .057, IN - .016, .1, cx0 + .095, IN - .003, .13, m("conv", { color:0x101013, roughness:.55 }), "el_converter");
  const convLbl = label("convlbl", .034, .022, (g, w, h) => { g.fillStyle = "#101013"; g.fillRect(0, 0, w, h); g.fillStyle = "#e6e8ee"; g.font = `700 ${h*.3}px Satoshi, sans-serif`; g.fillText("5 V", w*.08, h*.6); });
  add(new THREE.PlaneGeometry(.034, .022), convLbl, cx0 + .076, IN - .0161, .115, ...FACE_NEG_Y, "el_converter_label");
  /* Pi case 100 x 70 x 35: back on the panel, Raspberry Pi 4 on posts, OPTIGA Trust M Express on its own 2 posts, smoked lid with the 30 mm fan */
  const px0 = 0, pz0 = .12, pib = IN - .008;                       // pib: back of the Pi board
  box(px0, IN - .0025, pz0, px0 + .1, IN, pz0 + .07, petg, "el_picase_back");
  box(px0, IN - .035, pz0, px0 + .0025, IN - .0025, pz0 + .07, petg, "el_picase_wall"); box(px0 + .0975, IN - .035, pz0, px0 + .1, IN - .0025, pz0 + .07, petg, "el_picase_wall");
  box(px0, IN - .035, pz0, px0 + .1, IN - .0025, pz0 + .0025, petg, "el_picase_wall"); box(px0, IN - .035, pz0 + .0675, px0 + .1, IN - .0025, pz0 + .07, petg, "el_picase_wall");
  for (const [dx, dz] of [[.011, .0105], [.069, .0105], [.011, .0595], [.069, .0595]]) add(cylY(.003, .0055, 12), petg, px0 + dx, IN - .00525, pz0 + dz, 0, 0, 0, "el_pi_post");
  box(px0 + .0075, pib - .0016, pz0 + .007, px0 + .0925, pib, pz0 + .063, m("pi", { color:0x1f7a3c, roughness:.45 }), "el_pi4");
  box(px0 + .072, pib - .017, pz0 + .01, px0 + .0925, pib - .0016, pz0 + .025, steel, "el_pi_usb3"); box(px0 + .072, pib - .017, pz0 + .027, px0 + .0925, pib - .0016, pz0 + .042, steel, "el_pi_usb2");
  box(px0 + .074, pib - .0145, pz0 + .045, px0 + .0925, pib - .0016, pz0 + .06, steel, "el_pi_ethernet");
  box(px0 + .04, pib - .0045, pz0 + .03, px0 + .055, pib - .0016, pz0 + .045, m("soc", { color:0xa7abb3, roughness:.3, metalness:.9 }), "el_pi_heatsink");
  for (let f = 0; f < 5; f++) box(px0 + .0405 + f*.003, pib - .009, pz0 + .03, px0 + .0415 + f*.003, pib - .0045, pz0 + .045, plate, "el_pi_heatsink_fin");
  for (let r = 0; r < 2; r++) for (let c = 0; c < 20; c++) box(px0 + .012 + c*.00254, pib - .0085, pz0 + .057 + r*.00254, px0 + .0128 + c*.00254, pib - .0016, pz0 + .0578 + r*.00254, brass, "el_pi_gpio");
  const ox0 = px0 + .022, oz0 = pz0 + .012, ob = pib - .0199;     // OPTIGA board back face
  for (const dz of [.004, .02]) add(cylY(.0022, .0183, 10), petg, ox0 + .004, pib - .01075, oz0 + dz, 0, 0, 0, "el_optiga_post");
  box(ox0, ob - .0016, oz0, ox0 + .036, ob, oz0 + .026, m("optpcb", { color:0x9a1622, roughness:.4 }), "el_optiga_board");
  const opt = label("optiga", .036, .026, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#c2222f"); gr.addColorStop(1, "#7a0f19"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(255,214,214,.6)"; g.lineWidth = h*.02; g.strokeRect(w*.03, h*.04, w*.94, h*.92);
    g.fillStyle = "#fff4f4"; g.font = `700 ${h*.15}px Satoshi, sans-serif`; g.fillText("OPTIGA™", w*.07, h*.24); g.fillText("TRUST M", w*.07, h*.42);
    g.font = `500 ${h*.1}px Satoshi, sans-serif`; g.fillStyle = "rgba(255,230,230,.82)"; g.fillText("EXPRESS SHIELD", w*.07, h*.58);
    g.fillStyle = "rgba(255,230,230,.65)"; g.fillText("machine key inside", w*.07, h*.9); });
  add(new THREE.PlaneGeometry(.036, .026), opt, ox0 + .018, ob - .00165, oz0 + .013, ...FACE_NEG_Y, "el_optiga_label");
  box(ox0 + .024, ob - .0034, oz0 + .009, ox0 + .031, ob - .0016, oz0 + .016, m("chip", { color:0x0b0b0d, roughness:.25, metalness:.4 }), "el_optiga_chip");
  add(cylY(.0011, .0008, 10), led(0x6fe08a), ox0 + .032, ob - .002, oz0 + .022, 0, 0, 0, "el_optiga_led");
  /* 4 Dupont wires GPIO to OPTIGA (3V3, GND, SDA, SCL) */
  [[0xd8352a, 0], [0x111111, .0025], [0x2a6de0, .005], [0xf1c40f, .0075]].forEach(([c, dx], i) => tube([[px0 + .0124 + dx*2, pib - .0086, pz0 + .058], [px0 + .02 + dx, pib - .015, pz0 + .048], [ox0 + .006 + dx, ob - .0017, oz0 + .0235]], .0007, m("dup" + i, { color:c, roughness:.5 }), "el_dupont", 20));
  /* smoked lid and the 30 mm fan behind it */
  const lid = np(m("lid", { color:0x3a3d47, roughness:.3, metalness:.1, transparent:true, opacity:.3, depthWrite:false }));
  box(px0, IN - .0375, pz0, px0 + .1, IN - .035, pz0 + .07, lid, "el_picase_lid");
  const fx = px0 + .078, fz = pz0 + .05;
  for (const [a, b, c, d] of [[-.015, -.015, .015, -.013], [-.015, .013, .015, .015], [-.015, -.015, -.013, .015], [.013, -.015, .015, .015]]) box(fx + a, IN - .035, fz + b, fx + c, IN - .025, fz + d, m("fan", { color:0x15161a, roughness:.5 }), "el_pi_fan");
  add(cylY(.0055, .01, 24), m("fan"), fx, IN - .03, fz, 0, 0, 0, "el_pi_fan_hub");
  for (let i = 0; i < 7; i++) add(BOX(.027, .0008, .0045), m("fanblade", { color:0x2a2c33, roughness:.5 }), fx, IN - .033, fz, 0, i*Math.PI/7 + .3, 0, "el_pi_fan_blade");
  /* power and signal wiring: red on the panel, black one layer out, every bend rounded, never through a board */
  const R = (pts, nm) => harness(pts, .0015, wireR, nm), K = (pts, nm) => harness(pts, .0015, wireK, nm);
  const wr = i => -.32 + .0055 + .009*i, wk = i => -.27 + .0055 + .009*i, WB = .2395;
  R([[-.2735, IN - .052, .108], [-.2475, IN - .052, .108], [-.2475, IN - .004, .108], [-.2475, IN - .004, .162], [-.345, IN - .004, .162], [-.345, IN - .004, .19], [-.345, IN - .02, .2045]], "el_wire_psu_estop");
  R([[-.3345, IN - .02, .215], [wr(0), IN - .02, .215], [wr(0), IN - .009, .228], [wr(0), IN - .009, WB]], "el_wire_estop_wago");
  K([[-.2735, IN - .052, .073], [-.2435, IN - .052, .073], [-.2435, IN - .013, .073], [-.2435, IN - .013, .225], [wk(4), IN - .013, .225], [wk(4), IN - .009, WB]], "el_wire_psu_gnd");
  R([[wr(1), IN - .009, WB], [wr(1), IN - .004, .19], [-.182, IN - .004, .19], [-.182, IN - .004, .16], [-.182, IN - .026, .1465]], "el_wire_shield");
  K([[wk(0), IN - .009, WB], [wk(0), IN - .0085, .185], [-.174, IN - .0085, .185], [-.174, IN - .0085, .16], [-.174, IN - .026, .1465]], "el_wire_shield");
  R([[wr(2), IN - .009, WB], [wr(2), IN - .004, .182], [-.143, IN - .004, .182], [-.143, IN - .008, .175], [-.143, IN - .008, .0995]], "el_wire_l298n");
  K([[wk(1), IN - .009, WB], [wk(1), IN - .0085, .178], [-.152, IN - .0085, .178], [-.152, IN - .0085, .095], [-.1472, IN - .0085, .095]], "el_wire_l298n");
  R([[wr(3), IN - .009, WB], [wr(3), IN - .004, .174], [-.09, IN - .004, .174], [-.09, IN - .008, .168], [-.09, IN - .008, .1305]], "el_wire_converter");
  K([[wk(2), IN - .009, WB], [wk(2), IN - .0085, .17], [-.08, IN - .0085, .17], [-.08, IN - .0085, .1305]], "el_wire_converter");
  R([[-.0595, IN - .008, .118], [-.03, IN - .008, .118], [-.03, IN - .008, .14], [-.0005, IN - .008, .14]], "el_wire_pi_5v");
  K([[-.0595, IN - .012, .108], [-.025, IN - .012, .108], [-.025, IN - .012, .132], [-.0005, IN - .012, .132]], "el_wire_pi_5v");
  harness([[ux0 + .036, IN - .013, uz0 - .0065], [ux0 + .036, IN - .013, .075], [.08, IN - .013, .075], [.08, IN - .013, .1195]], .0028, m("usb", { color:0x0d0d0f, roughness:.5 }), "el_usb_uno_pi");
  /* the loom: claw power from the claw driver and the X motor leads, through a floor grommet in the corner, up to the gantry */
  long(() => harness([[-.114, IN - .008, .1425], [-.114, IN - .016, .15], [-.114, IN - .016, .284], [-.44, IN - .016, .284], [-.452, .452, .31], [-.452, .452, H0 - .01], [-.44, .44, H0 + .06], [-.44, .2, H0 + .14], [-.44, .07, H0 + .14], [-.453, .07, H0 + .125], [-.453, .0605, H0 + .117]], .0018, wireK, "el_wire_claw"));

  /* =========================================================================================== floor and walls */
  use("cage");
  const FZ = .40, FT = .012, HX0 = .28, HX1 = .40, HY0 = -.40, HY1 = -.28;     // 120 x 120 hole, 100 from the front and the right
  box(-.5, HY1, FZ, .5, .5, FZ + FT, mdf, "cage_floor"); box(-.5, -.5, FZ, HX0, HY1, FZ + FT, mdf, "cage_floor");
  box(HX1, -.5, FZ, .5, HY1, FZ + FT, mdf, "cage_floor"); box(HX0, -.5, FZ, HX1, HY0, FZ + FT, mdf, "cage_floor");
  for (const [x, y] of [[-.48, -.3], [-.48, .3], [.48, -.2], [.48, .3], [-.2, -.48], [.1, -.48], [-.2, .48], [.2, .48]]) add(cylZ(.0035, .001, 12), steel, x, y, FZ + FT + .0005, 0, 0, 0, "cage_floor_screw");
  /* acrylic on all four sides, outside the posts, 400 to 1000 */
  box(-.5, .5, FZ, .5, .503, H0, acrylic, "cage_acrylic"); box(-.5, -.503, FZ, .5, -.5, H0, acrylic, "cage_acrylic"); box(-.503, -.5, FZ, -.5, .5, H0, acrylic, "cage_acrylic"); box(.5, -.5, FZ, .503, .5, H0, acrylic, "cage_acrylic");
  for (const [a, z] of [[-.48, .42], [-.48, H0 - .02], [.48, .42], [.48, H0 - .02], [0, .42], [0, H0 - .02], [-.48, (FZ + H0)/2], [.48, (FZ + H0)/2]]){
    for (const s of [-1, 1]) add(cylY(.006, .0015, 16), steel, a, s*.50375, z, 0, 0, 0, "cage_acrylic_washer");
    for (const s of [-1, 1]) add(cylX(.006, .0015, 16), steel, s*.50375, a, z, 0, 0, 0, "cage_acrylic_washer"); }
  /* rubber grommets where cables cross the floor */
  const grom = m("grommet", { color:0x0d0d0f, roughness:.7 });
  for (const [x, y] of [[-.449, .449], [-.452, -.452]]){ add(new THREE.TorusGeometry(.0085, .0022, 10, 28), grom, x, y, FZ + FT, 0, 0, 0, "cage_grommet"); add(new THREE.TorusGeometry(.0085, .0022, 10, 28), grom, x, y, FZ, 0, 0, 0, "cage_grommet"); add(new THREE.CylinderGeometry(.0072, .0072, FT, 24, 1, true).rotateX(Math.PI/2), grom, x, y, FZ + FT/2, 0, 0, 0, "cage_grommet"); }
  /* the whole front right corner is the drop zone: a clear guard on its two open sides, wall to wall,
     and a funnel that slopes from the guard and the cage walls down into the 120 mm hole */
  const GH = .075, G0 = HX0 - .06, Q1 = HY1 + .06, XW = .497, YW = -.497, gz = FZ + FT, frameM = m("guardframe", { color:0x15161a, roughness:.4, metalness:.5 });
  const glass = m("guardglass", { color:0xdfe7ff, roughness:.04, metalness:0, clearcoat:1, transparent:true, opacity:.2, depthWrite:false }, true); glass.userData.noPick = true;
  box(G0, YW, gz, G0 + .003, Q1, gz + GH, glass, "cage_guard"); box(G0, Q1 - .003, gz, XW, Q1, gz + GH, glass, "cage_guard");
  for (const [x, y] of [[G0, YW + .005], [G0, Q1], [XW - .005, Q1]]) box(x - .005, y - .005, gz, x + .005, y + .005, gz + GH + .004, frameM, "cage_guard_post");
  box(G0 - .005, YW, gz + GH, G0 + .003, Q1 + .005, gz + GH + .004, frameM, "cage_guard_rim"); box(G0 - .005, Q1 - .003, gz + GH, XW, Q1 + .005, gz + GH + .004, frameM, "cage_guard_rim");
  { const ft = gz + .05, fb = gz + .001, O = [[G0 + .003, YW, ft], [XW, YW, ft], [XW, Q1 - .003, ft], [G0 + .003, Q1 - .003, ft]], I = [[HX0, HY0, fb], [HX1, HY0, fb], [HX1, HY1, fb], [HX0, HY1, fb]], pos = [];
    for (let i = 0; i < 4; i++){ const j = (i + 1) % 4; pos.push(...O[i], ...O[j], ...I[j], ...O[i], ...I[j], ...I[i]); }
    const fg = new THREE.BufferGeometry(); fg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); fg.computeVertexNormals();
    add(fg, m("funnel", { color:0x2b2e36, roughness:.35, metalness:.2, side:THREE.DoubleSide }), 0, 0, 0, 0, 0, 0, "cage_drop_funnel"); }

  /* =========================================================================================== chute, tray, cup */
  use("chute");
  const CZ0 = .25, CZ1 = FZ, WT = .012;                                  // a 150 deep chute, so the prize bin fits under it
  const wall = m("wall", { color:0x17181c, roughness:.9, metalness:0 }); wall.userData.xray = .28;      // see-through when the chute is isolated
  box(HX0 - WT, HY0 - WT, CZ0, HX1 + WT, HY0, CZ1, wall, "chute_wall"); /* rear wall with a small acrylic window: the landing camera films from outside, out of the capsule's way */
  const WX0 = .30, WX1 = .38, WZ0 = .30, WZ1 = .385;
  box(HX0 - WT, HY1, CZ0, WX0, HY1 + WT, CZ1, wall, "chute_wall"); box(WX1, HY1, CZ0, HX1 + WT, HY1 + WT, CZ1, wall, "chute_wall");
  box(WX0, HY1, CZ0, WX1, HY1 + WT, WZ0, wall, "chute_wall"); box(WX0, HY1, WZ1, WX1, HY1 + WT, CZ1, wall, "chute_wall");
  { const wg = m("window", { color:0xdfe7ff, roughness:.04, metalness:0, clearcoat:1, transparent:true, opacity:.18, depthWrite:false }, true); wg.userData.noPick = true; box(WX0, HY1 + .004, WZ0, WX1, HY1 + .007, WZ1, wg, "chute_c960_window"); }
  box(HX0 - WT, HY0, CZ0, HX0, HY1, CZ1, wall, "chute_wall"); box(HX1, HY0, CZ0, HX1 + WT, HY1, CZ1, wall, "chute_wall");
  /* the drop sensor pair: moulded bodies on printed L brackets, 30 below the floor, lenses through 20 mm holes in the side walls */
  const SZ = FZ - .03, e3 = m("e3jk", { color:0x23252b, roughness:.38, metalness:.15 });
  for (const o of [-1, 1]){
    const wx = o < 0 ? HX0 - WT : HX1 + WT, lo = (a, b) => [Math.min(a, b), Math.max(a, b)];
    const [b0, b1] = lo(wx, wx + o*.003), [f0, f1] = lo(wx, wx + o*.04), [s0, s1] = lo(wx + o*.003, wx + o*.021), sx = wx + o*.012, ox = wx + o*.021;
    rb(b0, -.38, SZ - .03, b1, -.30, FZ, petg, "chute_sensor_bracket", .0012); rb(f0, -.38, FZ - .003, f1, -.30, FZ, petg, "chute_sensor_bracket", .0012);
    for (const y of [-.372, -.308]) add(cylX(.0028, .0012, 12), dark, o < 0 ? b0 - .0005 : b1 + .0005, y, SZ - .022, 0, 0, 0, "chute_sensor_bracket_screw");
    rb(s0, -.365, SZ - .022, s1, -.315, SZ + .022, e3, o < 0 ? "chute_e3jk_emitter" : "chute_e3jk_receiver", .004);
    /* lens barrel through the wall, a ring on the inside face */
    add(cylX(.0062, .026, 28), lens, (o < 0 ? HX0 : HX1) + o*.0025 - o*.004, -.34, SZ, 0, 0, 0, "chute_e3jk_lens");
    add(new THREE.TorusGeometry(.0068, .0011, 8, 28), nemaCap, o < 0 ? HX0 + .0005 : HX1 - .0005, -.34, SZ, 0, Math.PI/2, 0, "chute_e3jk_lens_ring");
    /* back face: two indicator LEDs, the sensitivity knob with its slot, a label strip */
    add(cylX(.0016, .0016, 12), led(0xff8a2a), ox + o*.0004, -.354, SZ + .013, 0, 0, 0, "chute_e3jk_led"); add(cylX(.0016, .0016, 12), led(0x52d96b), ox + o*.0004, -.346, SZ + .013, 0, 0, 0, "chute_e3jk_led");
    add(cylX(.0034, .0022, 20), m("knob", { color:0xc9a35a, roughness:.3, metalness:1 }), ox + o*.0008, -.328, SZ + .012, 0, 0, 0, "chute_e3jk_knob");
    { const [k0, k1] = lo(ox + o*.0016, ox + o*.0021); box(k0, -.3296, SZ + .0092, k1, -.3264, SZ + .0148, dark, "chute_e3jk_knob_slot"); }
    { const [l0, l1] = lo(ox, ox + o*.0004); box(l0, -.36, SZ - .012, l1, -.32, SZ + .003, m("e3lbl", { color:0x3a3d46, roughness:.5 }), "chute_e3jk_label"); }
    /* cable gland under the body, the cable leaves downward */
    add(cylZ(.0042, .008, 16), dark, sx, -.34, SZ - .026, 0, 0, 0, "chute_e3jk_gland");
    { const ly = o < 0 ? .44 : .43, tx = o < 0 ? -.215 : -.205;
      long(() => harness([[sx, -.34, SZ - .03], [sx, -.34, SZ - .045], [sx, -.25, SZ - .045], [sx, ly, SZ - .045], [tx, ly, SZ - .045], [tx, ly, .1], [tx, IN - .0217, .1]], .002, wireK, "chute_e3jk_cable")); }
  }
  const beamM = m("laser", { color:0xff2a2a, emissive:0xff2a2a, emissiveIntensity:2.2, transparent:true, opacity:.85, toneMapped:false, depthWrite:false }); beamM.userData.noPick = true;
  add(cylX(.0009, HX1 - HX0 - .002, 10), beamM, (HX0 + HX1)/2, -.34, SZ, 0, 0, 0, "chute_e3jk_beam");
  add(cylX(.0028, HX1 - HX0 - .002, 16), m("laserglow", { color:0xff3030, emissive:0xff2020, emissiveIntensity:1.2, transparent:true, opacity:.18, toneMapped:false, depthWrite:false, blending:THREE.AdditiveBlending }), (HX0 + HX1)/2, -.34, SZ, 0, 0, 0, "chute_e3jk_beam");
  /* printed cradle at the bottom of the chute: four walls, a padded trapdoor as its floor, the NFC reader on the back wall */
  const X0 = HX0 - WT, X1 = HX1 + WT, Y0 = HY0 - WT, Y1 = HY1 + WT, CB = CZ0 - .045;
  const pla = () => m("pla", { color:0x34373f, roughness:.48, metalness:.05 });
  rb(X0, Y0, CB, X0 + .004, Y1, CZ0, pla, "chute_cradle", .002); rb(X1 - .004, Y0, CB, X1, Y1, CZ0, pla, "chute_cradle", .002);
  rb(X0, Y0, CB, X1, Y0 + .004, CZ0, pla, "chute_cradle", .002); rb(X0, Y1 - .004, CB, X1, Y1, CZ0, pla, "chute_cradle", .002);
  /* an open flange around the top, screwed under the chute walls: the capsule falls straight through it */
  rb(X0 - .004, Y0 - .004, CZ0 - .004, X1 + .004, Y0 + .004, CZ0, pla, "chute_cradle_flange", .002); rb(X0 - .004, Y1 - .004, CZ0 - .004, X1 + .004, Y1 + .004, CZ0, pla, "chute_cradle_flange", .002);
  rb(X0 - .004, Y0 - .004, CZ0 - .004, X0 + .004, Y1 + .004, CZ0, pla, "chute_cradle_flange", .002); rb(X1 - .004, Y0 - .004, CZ0 - .004, X1 + .004, Y1 + .004, CZ0, pla, "chute_cradle_flange", .002);
  /* the reader stands on the outside of the back wall and reads the capsule through 4 mm of plastic */
  rb(.291, Y1, CB - .01, .389, Y1 + .011, CB + .055, m("acr", { color:0x141518, roughness:.42 }), "chute_acr122u", .005);
  const acrl = label("acr", .06, .04, (g, w, h) => { g.fillStyle = "#141518"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(150,185,255,.6)"; g.lineWidth = h*.022;
    for (let i = 0; i < 4; i++){ g.beginPath(); g.arc(w/2, h/2, h*(.12 + i*.09), -Math.PI*.3, Math.PI*.3); g.stroke(); g.beginPath(); g.arc(w/2, h/2, h*(.12 + i*.09), Math.PI*.7, Math.PI*1.3); g.stroke(); } }, { transparent:true });
  add(new THREE.PlaneGeometry(.06, .04), acrl, .34, Y1 + .0112, CB + .022, ...FACE_POS_Y, "chute_acr122u_top");
  add(cylY(.0022, .0008, 16), led(0x52d96b), .375, Y1 + .0113, CB + .046, 0, 0, 0, "chute_acr122u_led");
  for (const x of [.296, .384]) add(cylY(.0028, .0012, 12), dark, x, Y1 + .0115, CB + .05, 0, 0, 0, "chute_acr122u_screw");
  /* trapdoor: hinged on the front edge, held shut by the servo; it swings down and the capsule drops straight into the bin */
  const AXZ = CB + .0015, AY = Y0 + .007;
  const flapM = m("flapM", { color:0x4a4f5c, roughness:.42, metalness:.08 });
  /* the trapdoor, its pad, hinge barrel and lever turn together around the axle (the page swings it open to show how it works) */
  const trap = new THREE.Group(); trap.name = "chute_trap"; trap.position.set(0, AY, AXZ); trap.userData.trap = true; G("chute").add(trap);
  const TR = (geo, mt, x, y, z, nm) => add(geo, mt, x, y - AY, z - AXZ, 0, 0, 0, nm, trap);
  TR(rbox(X1 - X0 - .01, Y1 - .005 - AY, .003, .004), flapM, (X0 + X1)/2, (AY + Y1 - .005)/2, AXZ, "chute_flap");
  TR(rbox(X1 - X0 - .018, Y1 - .009 - AY - .004, .0045, .003), m("foam", { color:0x24262c, roughness:.95 }), (X0 + X1)/2, (AY + .004 + Y1 - .009)/2, AXZ + .00375, "chute_flap_pad");
  TR(cylX(.0032, X1 - X0 - .012, 20), pla, .34, AY, AXZ, "chute_flap_hinge");
  add(cylX(.0015, X1 - X0 + .012, 12), steel, .34, AY, AXZ, 0, 0, 0, "chute_axle");
  /* lever on the axle outside the wall, pointing up */
  TR(cylX(.0042, .003, 20), pla, X1 + .003, AY, AXZ, "chute_lever");
  TR(rbox(.003, .008, .02, .002), pla, X1 + .003, AY, AXZ + .01, "chute_lever");
  /* servo: dark body, mounting ears on two standoffs, gear boss, white horn */
  const SY = -.352, SZ0 = AXZ + .008, SX0 = X1 + .0085;                       // SX0: the shaft face of the body
  rb(SX0, SY - .0114, SZ0 - .0061, SX0 + .0225, SY + .0114, SZ0 + .0061, m("mg90", { color:0x1d2c55, roughness:.4 }), "chute_mg90s", .0015);
  rb(SX0 + .003, SY - .016, SZ0 - .0061, SX0 + .0055, SY + .016, SZ0 + .0061, m("mg90"), "chute_mg90s_ears", .0012);
  for (const e of [-1, 1]) rb(X1, SY + e*.0135 - .003, SZ0 - .005, SX0 + .003, SY + e*.0135 + .003, SZ0 + .005, pla, "chute_mg90s_standoff", .001);
  const shY = SY - .0055;
  add(cylX(.0058, .003, 24), m("mg90"), SX0 - .0015, shY, SZ0, 0, 0, 0, "chute_mg90s_boss");
  add(cylX(.0022, .004, 12), m("gearM", { color:0xc9a35a, roughness:.3, metalness:1 }), SX0 - .004, shY, SZ0, 0, 0, 0, "chute_mg90s_shaft");
  /* the horn turns on the servo shaft; the page turns it with the trapdoor */
  const hornP = new THREE.Group(); hornP.name = "chute_horn_pivot"; hornP.position.set(SX0 - .0055, shY, SZ0); G("chute").add(hornP);
  add(rbox(.0014, .006, .0185, .0025), m("horn", { color:0xf2f2f4, roughness:.5 }), 0, 0, .00625, 0, 0, 0, "chute_horn", hornP);
  for (const dz of [.006, .0115]) add(cylX(.0007, .0016, 8), dark, 0, 0, dz, 0, 0, 0, "chute_horn_hole", hornP);
  /* pushrod: a straight steel link on the outer faces, a pin into the horn hole and one into the lever hole */
  const rod = add(new THREE.CylinderGeometry(.0008, .0008, 1, 10), steel, 0, 0, 0, 0, 0, 0, "chute_pushrod");
  const pins = [0, 1].map(() => add(cylX(.0007, .004, 8), steel, 0, 0, 0, 0, 0, 0, "chute_pushrod_pin"));
  trap.userData.link = { rod, pins, horn:hornP, lever:new THREE.Vector3(X1 + .003, .001, .018), rx:X1 + .0052 };
  { const L = trap.userData.link, A = new THREE.Vector3(L.rx, shY, SZ0 + .0115), B = new THREE.Vector3(L.rx, AY + .001, AXZ + .018), d = B.clone().sub(A);
    rod.position.copy(A).add(B).multiplyScalar(.5); rod.scale.y = d.length(); rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    pins[0].position.set(L.rx - .0015, A.y, A.z); pins[1].position.set(L.rx - .0015, B.y, B.z); }
  /* the prize bin: about 30 litres under the chute side of the cabinet, emptied through the side door */
  const binM = () => m("binM", { color:0x2b2e36, roughness:.5, metalness:.05 }), QBX0 = .16, QBX1 = .494, QBY0 = -.455, QBY1 = .2, QBZ0 = .04, QBZ1 = .2;
  rb(QBX0, QBY0, QBZ0, QBX1, QBY1, QBZ0 + .005, binM, "chute_bin", .012);
  rb(QBX0, QBY0, QBZ0 + .005, QBX0 + .005, QBY1, QBZ1, binM, "chute_bin", .002); rb(QBX1 - .005, QBY0, QBZ0 + .005, QBX1, QBY1, QBZ1, binM, "chute_bin", .002);
  rb(QBX0, QBY0, QBZ0 + .005, QBX1, QBY0 + .005, QBZ1, binM, "chute_bin", .002); rb(QBX0, QBY1 - .005, QBZ0 + .005, QBX1, QBY1, QBZ1, binM, "chute_bin", .002);
  rb(QBX1, -.16, .15, QBX1 + .004, -.08, .17, binM, "chute_bin_handle", .002);
  /* the cabinet under the floor: MDF sides, back and floor, with a side door to the prize bin */
  use("cage");
  const cab = m("mdf", { color:0x17181c, roughness:.9, metalness:0 });
  box(-.512, -.512, .02, -.5, .512, FZ, cab, "cage_cabinet_side");
  box(.5, -.512, .02, .512, -.45, FZ, cab, "cage_cabinet_side"); box(.5, .18, .02, .512, .512, FZ, cab, "cage_cabinet_side");
  box(.5, -.45, .02, .512, .18, .05, cab, "cage_cabinet_side"); box(.5, -.45, .34, .512, .18, FZ, cab, "cage_cabinet_side");
  box(-.5, -.512, .02, .5, -.5, FZ, cab, "cage_cabinet_back");
  box(-.46, -.5, .028, .46, .456, .04, cab, "cage_cabinet_floor");
  box(.5005, -.448, .052, .5115, .178, .338, cab, "cage_door");
  for (const z of [.08, .28]){ box(.5, .168, z, .5135, .184, z + .03, steel, "cage_door_hinge"); add(cylZ(.0018, .03, 10), steel, .5135, .18, z + .015, 0, 0, 0, "cage_door_hinge_pin"); }
  box(.5115, -.43, .18, .5175, -.41, .21, steel, "cage_door_knob");
  use("chute");
  /* C960 clipped to the rear wall at the top, 250 above the flap, looking down at it; its cable leaves through a grommet */
  /* landing camera outside the chute, behind the window, on a printed L bracket, looking down at the flap */
  /* a printed shelf under the camera, held to the wall by two side plates that stay clear of the window */
  /* the shelf has a notch at the front, so the lens looks down through it */
  rb(.29, HY1 + WT + .021, .316, .39, HY1 + WT + .036, .32, petg, "chute_c960_clip", .002);
  rb(.29, HY1 + WT, .316, .322, HY1 + WT + .022, .32, petg, "chute_c960_clip", .002); rb(.358, HY1 + WT, .316, .39, HY1 + WT + .022, .32, petg, "chute_c960_clip", .002);
  for (const x of [.286, .39]) rb(x, HY1 + WT, .296, x + .004, HY1 + WT + .036, .324, petg, "chute_c960_clip", .0015);
  for (const x of [.288, .392]) for (const z of [.302, .316]) add(cylY(.0022, .0012, 10), dark, x, HY1 + WT + .036 + .0006, z, 0, 0, 0, "chute_c960_clip_screw");
  const cam = new THREE.Group(); cam.position.set(.34, HY1 + WT + .024, .337); cam.rotation.set(-2.43, 0, 0); G("chute").add(cam);
  add(rbox(.064, .02, .024, .009), m("c960", { color:0x121317, roughness:.35, metalness:.2 }), 0, 0, 0, Math.PI/2, 0, 0, "chute_c960", cam);
  add(rbox(.05, .002, .017, .007), m("c960face", { color:0x050507, roughness:.08, metalness:.3, clearcoat:1 }, true), 0, .0105, 0, Math.PI/2, 0, 0, "chute_c960_face", cam);
  add(cylY(.0075, .004, 32), m("ring", { color:0xa8adb7, roughness:.3, metalness:1 }), 0, .0125, 0, 0, 0, 0, "chute_c960_lens_ring", cam);
  add(cylY(.006, .0045, 32), lens, 0, .013, 0, 0, 0, 0, "chute_c960_lens", cam);
  add(cylY(.0036, .001, 24), m("glass", { color:0x2a3f8c, roughness:.02, metalness:.9, emissive:0x1a2a66, emissiveIntensity:.4 }), 0, .0156, 0, 0, 0, 0, "chute_c960_glass", cam);
  add(cylY(.001, .001, 10), led(0x52d96b), .018, .0112, 0, 0, 0, 0, "chute_c960_led", cam);
  /* what it sees: a faint cone from the lens to the flap */
  cam.updateMatrixWorld(true); const apex = new THREE.Vector3(0, .016, 0).applyMatrix4(cam.matrixWorld);
  { const P = [[.287, -.393], [.393, -.393], [.393, -.287], [.287, -.287]].map(([x, y]) => new THREE.Vector3(x, y, AXZ + .002)), pos = [];
    for (let i = 0; i < 4; i++){ const a = P[i], b = P[(i + 1) % 4]; pos.push(apex.x, apex.y, apex.z, a.x, a.y, a.z, b.x, b.y, b.z); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
    const cone = m("viewcone", { color:0x7fb0ff, emissive:0x3b7bff, emissiveIntensity:.8, transparent:true, opacity:.07, depthWrite:false, side:THREE.DoubleSide, toneMapped:false, blending:THREE.AdditiveBlending }); cone.userData.noPick = true;
    add(g, cone, 0, 0, 0, 0, 0, 0, "chute_c960_view");
    const lp = []; for (const c of P) lp.push(apex.x, apex.y, apex.z, c.x, c.y, c.z);
    const lg = new THREE.BufferGeometry(); lg.setAttribute("position", new THREE.Float32BufferAttribute(lp, 3));
    const ln = new THREE.LineSegments(lg, m("viewline", { color:0x9cc0ff, emissive:0x3b7bff, emissiveIntensity:1, transparent:true, opacity:.35, depthWrite:false, toneMapped:false })); ln.userData.part = "chute"; ln.name = "chute_c960_view"; ln.raycast = () => {}; G("chute").add(ln); }
  long(() => harness([[.34, HY1 + WT + .036, .345], [.36, HY1 + WT + .05, .37], [.36, HY1 + .1, CZ1 - .02], [.36, .41, CZ1 - .02], [.072, .41, CZ1 - .02], [.072, .41, .137], [.072, IN - .0378, .137]], .0022, wireK, "chute_c960_cable"));
  long(() => harness([[.34, Y1 + .0112, CB + .04], [.34, -.245, CB + .04], [.34, -.245, .3], [.24, -.245, .3], [.24, .40, .3], [.062, .40, .3], [.062, .40, .137], [.062, IN - .0378, .137]], .0024, wireK, "chute_acr_usb"));
  long(() => harness([[SX0 + .0224, SY + .007, SZ0], [.452, SY + .007, SZ0], [.452, SY + .007, .3], [.452, .42, .3], [-.195, .42, .3], [-.195, .42, .1], [-.195, IN - .0217, .1]], .0012, wireK, "chute_servo_cable"));

  /* =========================================================================================== capsules: clear, one colour, size not fixed */
  use("capsules");
  const capsules = [], CR = .025;
  const shell = m("shell", { color:0xeef3ff, roughness:.03, metalness:0, clearcoat:1, clearcoatRoughness:.03, transparent:true, opacity:.2, specularIntensity:1, depthWrite:false, side:THREE.DoubleSide }, true);
  const tagT = new THREE.TextureLoader().load("assets/nfc-tag.webp?v=2"); tagT.colorSpace = THREE.SRGBColorSpace; tagT.anisotropy = 8;
  const tagM = m("tag", { map:tagT, alphaTest:.4, roughness:.6, metalness:0 });
  const gTop = new THREE.SphereGeometry(CR, 28, 12, 0, Math.PI*2, 0, Math.PI/2).rotateX(Math.PI/2), gBot = new THREE.SphereGeometry(CR, 28, 12, 0, Math.PI*2, Math.PI/2, Math.PI/2).rotateX(Math.PI/2);
  const gTag = new THREE.CircleGeometry(.0105, 32);
  let seed = 11; const rnd = () => (seed = (seed*16807) % 2147483647)/2147483647;
  /* a hexagonal pack on the floor, kept off the guard and the grommets, and a small pile on top of it */
  const d = 2*CR + .0012, dy = d*Math.sqrt(3)/2, Lc = .455 - CR, spots = [], keep = new Set();
  const clear = (x, y) => !(x > HX0 - .07 - CR && y < HY1 + .07 + CR) && Math.hypot(x + .449, y - .449) > .016 + CR && Math.hypot(x + .452, y + .452) > .016 + CR;
  const z1 = FZ + FT + CR + .0002, z2 = z1 + CR*1.633 - .0004;
  for (let r = 0; ; r++){ const y = -Lc + r*dy; if (y > Lc) break;
    for (let c = 0; ; c++){ const x = -Lc + (r % 2 ? d/2 : 0) + c*d; if (x > Lc) break; if (clear(x, y)){ spots.push([x, y, z1]); keep.add(r + "," + c); } } }
  for (let r = 0; ; r += 2){ const y = -Lc + r*dy; if (y > Lc) break;
    for (let c = 0; ; c++){ const x = -Lc + c*d; if (x > Lc) break;
      const x2 = x + d/2, y2 = y + dy/3; if (Math.hypot(x2 + .1, y2 - .08) > .19) continue;
      if (keep.has(r + "," + c) && keep.has(r + "," + (c + 1)) && keep.has((r + 1) + "," + c)) spots.push([x2, y2, z2]); } }
  spots.forEach(([x, y, z], k) => {
    const o = new THREE.Group(); o.name = "capsule_" + String(k + 1).padStart(3, "0"); o.position.set(x, y, z);
    o.quaternion.setFromEuler(new THREE.Euler((rnd() - .5)*.7, (rnd() - .5)*.7, rnd()*6.28));
    const lidG = new THREE.Group(); o.add(lidG);
    const t = new THREE.Mesh(gTop, shell), b = new THREE.Mesh(gBot, shell);
    lidG.add(t);
    /* NFC sticker on the outside of the lower half, on the side that turns to you when the capsule opens */
    const tg = new THREE.Mesh(gTag, tagM); tg.position.set(0, 0, -CR*.55);                     // lying on the inside floor of the lower half
    [t, b, tg].forEach(mm => { mm.userData.part = "capsules"; mm.name = o.name; });
    o.add(b, tg); o.userData.lid = lidG; o.userData.q0 = o.quaternion.clone(); o.userData.cap = true; o.userData.part = "capsules";
    G("capsules").add(o); capsules.push(o);
  });

  /* =========================================================================================== XY gantry */
  use("gantry");
  const RZ = H0 + T + .01, RX = .48, YC = .05;                                  // 2020 centre height and x, carriage position along Y
  for (const s of [-1, 1]) vslot("y", 1.0, 20, 20, s*RX, 0, RZ, "gantry_y_rail");
  for (const s of [-1, 1]) for (const y of [-.45, -.225, .225, .45]) add(cylZ(.0028, .002, 12), steel, s*RX, y, RZ + .009, 0, 0, 0, "gantry_rail_screw");
  /* Matik carriage on each Y rail: plate above, 4 wheels in the side slots, spacers, eccentric nuts on one side */
  const PZ0 = RZ + .016, PZ1 = PZ0 + .006;
  for (const s of [-1, 1]){
    box(s*RX - .0325, YC - .0325, PZ0, s*RX + .0325, YC + .0325, PZ1, plate, "gantry_y_carriage");
    for (const dx of [-1, 1]) for (const dy of [-1, 1]){ const wx = s*RX + dx*.0205, wy = YC + dy*.02;
      vwheel(wx, wy, RZ, "gantry_y_wheel"); add(cylZ(.004, PZ0 - RZ - .0053, 12), steel, wx, wy, (RZ + .0053 + PZ0)/2, 0, 0, 0, "gantry_y_wheel_spacer");
      add(new THREE.CylinderGeometry(.0055, .0055, .004, 6).rotateX(Math.PI/2), dx === s ? brass : steel, wx, wy, PZ1 + .002, 0, 0, 0, "gantry_y_wheel_nut"); }
  }
  /* 2040 X beam standing on edge, ends flush with the carriage outer faces, 2 Matik brackets per carriage */
  const BZ0 = PZ1, BL = 2*(RX + .0325);
  vslot("x", BL, 20, 40, 0, YC, BZ0 + .02, "gantry_x_beam");
  for (const s of [-1, 1]) for (const dy of [-1, 1]){ const x = s*RX, y = YC + dy*.01;
    box(x - .01, y, PZ1, x + .01, y + dy*.02, PZ1 + .004, m("matik", { color:0x17181c, roughness:.45, metalness:.4 }), "gantry_matik_bracket");
    box(x - .01, y, PZ1, x + .01, y + dy*.004, PZ1 + .02, m("matik"), "gantry_matik_bracket");
    add(cylZ(.004, .0015, 12), dark, x, y + dy*.013, PZ1 + .0048, 0, 0, 0, "gantry_bracket_screw"); }
  /* Y motors at the rear ends, idlers at the front, belts outside each rail; shaft 30 above the rail bottom */
  const RB = RZ - .01, SHZ = RB + .03;
  for (const s of [-1, 1]){
    const ox = s*(RX + .01), bx = s*(RX + .03);
    box(ox, .46, RB, ox + s*.005, .56, RB + .06, petg, "gantry_y_motor_plate");
    nema17([ox, .54, SHZ], [s, 0, 0], .04, "gantry_y_motor", .03);
    pulley("x", bx, .54, SHZ, "gantry_y_pulley", false, -s);
    box(ox, -.53, RB, ox + s*.005, -.46, RB + .06, petg, "gantry_y_idler_plate");
    add(cylX(.0025, .034, 12), steel, ox + s*.017, -.51, SHZ, 0, 0, 0, "gantry_y_idler_bolt"); add(new THREE.CylinderGeometry(.0045, .0045, .005, 6).rotateZ(Math.PI/2), steel, ox + s*.0315, -.51, SHZ, 0, 0, 0, "gantry_y_idler_nut");
    pulley("x", bx, -.51, SHZ, "gantry_y_idler", true);
    box(bx - .003, -.51, SHZ + .0058, bx + .003, .54, SHZ + .0072, belt, "gantry_y_belt"); box(bx - .003, -.51, SHZ - .0072, bx + .003, .54, SHZ - .0058, belt, "gantry_y_belt");
    wrap([bx, .54, SHZ], [0, 0, 1], [0, 1, 0], "gantry_y_belt"); wrap([bx, -.51, SHZ], [0, 0, 1], [0, -1, 0], "gantry_y_belt");
    /* belt clip and cap on the carriage's outer side, clamping the top run */
    box(bx - .012, YC - .012, PZ1, bx + .012, YC + .012, SHZ + .0058, petg, "gantry_y_belt_clip"); box(bx - .012, YC - .012, SHZ + .0072, bx + .012, YC + .012, SHZ + .011, petg, "gantry_y_belt_clip");
  }
  /* X motor at the left end on the rear face, idler at the right end, belt behind the beam */
  const BY1 = YC + .01, XB = YC + .042, XSZ = BZ0 + .03, XMX = -.545;
  box(-.5725, BY1, BZ0, -.4725, BY1 + .005, BZ0 + .04, petg, "gantry_x_motor_plate");
  nema17([XMX, BY1, XSZ], [0, 1, 0], .04, "gantry_x_motor", .036);
  pulley("y", XMX, XB, XSZ, "gantry_x_pulley", false, -1);
  box(.4625, BY1, BZ0, .5325, BY1 + .005, BZ0 + .04, petg, "gantry_x_idler_plate");
  add(cylY(.0025, .038, 12), steel, .515, BY1 + .019, XSZ, 0, 0, 0, "gantry_x_idler_bolt"); pulley("y", .515, XB, XSZ, "gantry_x_idler", true);
  box(XMX, XB - .003, XSZ + .0058, .515, XB + .003, XSZ + .0072, belt, "gantry_x_belt"); box(XMX, XB - .003, XSZ - .0072, .515, XB + .003, XSZ - .0058, belt, "gantry_x_belt");
  wrap([XMX, XB, XSZ], [0, 0, 1], [-1, 0, 0], "gantry_x_belt"); wrap([.515, XB, XSZ], [0, 0, 1], [1, 0, 0], "gantry_x_belt");
  /* end stops: X on the beam next to the motor, Y on the left rail next to motor Y1 */
  const CTZ = BZ0 + .04;
  endstop(-.42, YC, CTZ + .0015, Math.PI, "gantry_x_endstop");
  endstop(-RX, .42, RZ + .0115, -Math.PI/2, "gantry_y_endstop");
  /* drag chain 10 x 20: fixed on the beam's top slot near the X motor, a U turn, then the top run to the carriage */
  const XC = 0, lo = CTZ + .005, hi = lo + .038, UX = -.49;
  const cpts = [[-.45, YC, lo], [-.47, YC, lo]]; for (let i = 0; i <= 12; i++){ const th = -Math.PI/2 - i*Math.PI/12; cpts.push([UX + .019*Math.cos(th), YC, lo + .019 + .019*Math.sin(th)]); }
  cpts.push([-.47, YC, hi], [-.2, YC, hi], [XC - .03, YC, hi]);
  { const c = new THREE.CatmullRomCurve3(cpts.map(p => new THREE.Vector3(...p)), false, "centripetal"), L = c.getLength(), k = Math.floor(L/.0135);
    for (let i = 0; i < k; i++){ const t = (i + .5)/k, p = c.getPointAt(t), d = c.getTangentAt(t);
      const o = add(BOX(.0128, .02, .01), m("chain", { color:0x131416, roughness:.55 }), p.x, p.y, p.z, 0, 0, 0, "gantry_drag_chain"); o.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), d); } }
  box(-.462, YC - .01, CTZ, -.444, YC + .01, CTZ + .01, petg, "gantry_drag_chain_mount");
  /* the top run rests on a thin tray, held off the beam by three posts */
  const trayM = m("tray", { color:0x2a2c33, roughness:.4, metalness:.7 });
  box(-.49, YC - .012, hi - .0072, XC - .045, YC + .012, hi - .005, trayM, "gantry_chain_tray");
  box(-.49, YC - .012, hi - .0072, XC - .045, YC - .0108, hi + .004, trayM, "gantry_chain_tray"); box(-.49, YC + .0108, hi - .0072, XC - .045, YC + .012, hi + .004, trayM, "gantry_chain_tray");
  for (const x of [-.39, -.22, -.06]) box(x - .004, YC - .004, CTZ, x + .004, YC + .004, hi - .0072, trayM, "gantry_chain_tray_post");
  /* motor leads down the rear left post to the panel */
  long(() => harness([[XMX, YC - .024, XSZ + .0245], [XMX, YC - .024, H0 + .17], [-.432, .15, H0 + .17], [-.432, .43, H0 + .07], [-.446, .446, H0 - .01], [-.446, .446, .38], [-.3, .47, .31], [-.205, IN - .026, .29], [-.205, IN - .026, .155], [-.205, IN - .0207, .1475]], .0026, wireK, "gantry_motor_leads"));

  /* =========================================================================================== X carriage and winch */
  use("winch");
  const XP0 = CTZ + .006, XP1 = XP0 + .006;
  box(XC - .0325, YC - .0325, XP0, XC + .0325, YC + .0325, XP1, plate, "winch_x_carriage");
  for (const dx of [-1, 1]) for (const dy of [-1, 1]){ const wx = XC + dx*.02, wy = YC + dy*.0205;
    vwheel(wx, wy, BZ0 + .03, "winch_x_wheel"); add(cylZ(.004, XP0 - (BZ0 + .0353), 12), steel, wx, wy, (BZ0 + .0353 + XP0)/2, 0, 0, 0, "winch_x_wheel_spacer");
    add(new THREE.CylinderGeometry(.0055, .0055, .004, 6).rotateX(Math.PI/2), dy < 0 ? brass : steel, wx, wy, XP1 + .002, 0, 0, 0, "winch_x_wheel_nut"); }
  /* belt clip hanging behind the carriage, clamping the X belt */
  box(XC - .02, YC + .0322, XSZ - .011, XC + .02, XB + .007, XP1, petg, "winch_x_belt_clip");
  /* drag chain end on a printed post */
  box(XC - .0325, YC - .01, XP1, XC - .0225, YC + .01, hi - .005, petg, "winch_chain_post");
  /* winch mount 65 x 65 on the carriage, overhanging the front of the beam; NEMA 17 under it, shaft down */
  const WY0 = YC - .085, WY1 = YC - .02, MY = (WY0 + WY1)/2 - .005, F = XP1 - .002 - .04;      // F: motor face, at the bottom
  box(XC - .0325, WY0, XP1, XC + .0325, WY1, XP1 + .005, petg, "winch_mount");
  for (const [dx, dy] of [[-.0275, 0], [.0275, 0], [-.0275, -.055], [.0275, -.055]]) add(cylZ(.004, .002, 12), dark, XC + dx, WY1 - .005 + dy, XP1 + .006, 0, 0, 0, "winch_mount_screw");
  box(XC - .021, MY - .021, XP1 - .002, XC + .021, MY + .021, XP1, petg, "winch_mount_pad");
  nema17([XC, MY, F], [0, 0, -1], .04, "winch_motor", .03);
  /* spool: hub with a brass insert, motor-side flange, 30 mm core with the Dyneema, outer flange */
  const dyn = m("dyneema", { color:0x46474e, roughness:.75 });
  add(cylZ(.006, .008), petg, XC, MY, F - .007, 0, 0, 0, "winch_spool_hub"); add(cylX(.0018, .013, 10), brass, XC, MY, F - .007, 0, 0, 0, "winch_spool_insert");
  add(cylZ(.022, .003), petg, XC, MY, F - .0125, 0, 0, 0, "winch_spool_flange"); add(cylZ(.015, .02), petg, XC, MY, F - .024, 0, 0, 0, "winch_spool_core");
  add(cylZ(.022, .003), petg, XC, MY, F - .0355, 0, 0, 0, "winch_spool_flange");
  for (let i = 0; i < 8; i++) add(new THREE.TorusGeometry(.0161, .00105, 6, 40), dyn, XC, MY, F - .0158 - i*.0021, 0, 0, 0, "winch_line_turn");
  /* Z end stop on a printed plate glued to the motor side, its lever under the spool beside the line */
  box(XC + .004, MY - .025, F - .062, XC + .024, MY - .0222, F + .03, petg, "winch_z_endstop_plate"); box(XC + .004, MY - .0222, F + .02, XC + .024, MY - .0202, F + .03, petg, "winch_z_endstop_plate");
  box(XC + .004, MY - .0266, F - .062, XC + .024, MY - .025, F - .032, pcbRed, "winch_z_endstop_pcb");
  box(XC + .009, MY - .0222, F - .062, XC + .021, MY - .013, F - .052, sw, "winch_z_endstop_switch");
  box(XC + .0135, MY - .013, F - .06, XC + .0151, MY - .002, F - .0585, steel, "winch_z_endstop_lever");
  /* Wago pair on the carriage: coil cable from the claw, 4 core from the chain */
  for (const x of [XC + .005, XC + .019]){ box(x, YC + .012, XP1, x + .012, YC + .03, XP1 + .018, wagoM, "winch_wago"); box(x + .002, YC + .016, XP1 + .018, x + .01, YC + .026, XP1 + .0205, lever, "winch_wago_lever"); }
  tube([[XC - .0275, YC, hi], [XC - .01, YC + .014, hi], [XC + .011, YC + .021, XP1 + .0205]], .0024, wireK, "winch_four_core", 24);

  /* =========================================================================================== claw: RolRah body, Justech actuator, 3 fingers */
  use("claw");
  const LX = XC + .0162, LY = MY, CT = H0 - .22;
  add(new THREE.CylinderGeometry(.001, .001, (F - .032) - (CT + .022), 8), m("dyneema", { color:0x46474e, roughness:.75 }), LX, LY, (F - .032 + CT + .022)/2, Math.PI/2, 0, 0, "claw_line");
  const claw = new THREE.Group(); claw.position.set(LX, LY, CT); G("claw").add(claw);
  const C = (geo, mt, x, y, z, nm, rx = 0, ry = 0, rz = 0) => add(geo, mt, x, y, z, rx, ry, rz, nm, claw);
  /* swivel: two rings and a barrel */
  C(new THREE.TorusGeometry(.0045, .0009, 8, 20), steel, 0, 0, .019, "claw_swivel", Math.PI/2);
  C(new THREE.CylinderGeometry(.0022, .0028, .009, 16).rotateX(Math.PI/2), steel, 0, 0, .011, "claw_swivel");
  C(new THREE.TorusGeometry(.0045, .0009, 8, 20), steel, 0, 0, .003, "claw_swivel", 0, 0, Math.PI/2);
  /* printed cap with the eye */
  C(new THREE.TorusGeometry(.005, .0018, 10, 24), petg, 0, 0, -.003, "claw_cap_eye", Math.PI/2);
  C(new THREE.CylinderGeometry(.022, .03, .022, 6).rotateX(Math.PI/2), petg, 0, 0, -.019, "claw_cap", 0, 0, Math.PI/6);
  /* hex body, two open windows that show the actuator */
  const bodyH = .1;
  for (let k = 0; k < 6; k++){ const a = k*Math.PI/3; if (k === 0 || k === 3) continue;
    C(BOX(.0302, .004, bodyH), petg, .026*Math.cos(a), .026*Math.sin(a), -.033 - bodyH/2, "claw_body", 0, 0, a + Math.PI/2); }
  for (const a of [0, Math.PI]){ const cx = .026*Math.cos(a);
    C(BOX(.004, .0302, .014), petg, cx, 0, -.04, "claw_body"); C(BOX(.004, .0302, .014), petg, cx, 0, -.126, "claw_body");
    for (const s of [-1, 1]) C(BOX(.004, .004, bodyH - .028), petg, cx, s*.013, -.083, "claw_body"); }
  C(new THREE.CylinderGeometry(.03, .03, .006, 6).rotateX(Math.PI/2), petg, 0, 0, -.033, "claw_body_top", 0, 0, Math.PI/6);
  /* Justech 12 V actuator: motor can, gearbox, tube, rod, top ear on an M3 through the walls */
  C(cylZ(.0105, .034), m("motor", { color:0xb9bec8, roughness:.3, metalness:1 }), 0, 0, -.053, "claw_actuator_motor");
  C(cylZ(.011, .014), m("gear", { color:0x16171b, roughness:.4 }), 0, 0, -.077, "claw_actuator_gearbox");
  C(cylZ(.0075, .036), m("tube", { color:0x16171b, roughness:.35, metalness:.3 }), 0, 0, -.102, "claw_actuator_tube");
  C(cylZ(.003, .036), steel, 0, 0, -.138, "claw_actuator_rod");
  C(BOX(.006, .022, .006), m("ear", { color:0x16171b, roughness:.4 }), 0, 0, -.039, "claw_actuator_ear"); C(cylY(.0016, .064, 10), steel, 0, 0, -.039, "claw_actuator_screw");
  for (const [c, x] of [[0xd02a2a, .004], [0x111111, -.004]]) C(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(x, .006, -.04), new THREE.Vector3(x*1.5, .014, -.037), new THREE.Vector3(x*2, .0235, -.036)]), 12, .0007, 6), m("aw" + c, { color:c, roughness:.5 }), 0, 0, 0, "claw_actuator_wire");
  /* bottom hub with 3 lugs, spreader on the rod, 3 links, 3 fingers on MR63ZZ bearings and 3 mm rods */
  const HZ = -.033 - bodyH;
  C(new THREE.CylinderGeometry(.03, .028, .01, 6).rotateX(Math.PI/2), petg, 0, 0, HZ - .005, "claw_hub", 0, 0, Math.PI/6);
  C(new THREE.CylinderGeometry(.009, .011, .01, 24).rotateX(Math.PI/2), petg, 0, 0, HZ - .028, "claw_spreader");
  for (let k = 0; k < 3; k++){
    const a = k*2*Math.PI/3 + Math.PI/2, c = Math.cos(a), s = Math.sin(a), P = (r, z) => new THREE.Vector3(r*c, r*s, z);
    C(BOX(.008, .012, .012), petg, .026*c, .026*s, HZ - .014, "claw_lug", 0, 0, a);
    C(new THREE.CylinderGeometry(.0015, .0015, .014, 10), steel, .027*c, .027*s, HZ - .016, "claw_rod", 0, 0, a);
    for (const e of [-1, 1]) C(new THREE.CylinderGeometry(.003, .003, .0025, 16), steel, .027*c - e*.0058*s, .027*s + e*.0058*c, HZ - .016, "claw_bearing", 0, 0, a);
    const curve = new THREE.CatmullRomCurve3([P(.027, HZ - .016), P(.04, HZ - .03), P(.047, HZ - .055), P(.042, HZ - .08), P(.028, HZ - .097), P(.017, HZ - .104)]);
    const nSeg = 20, side = new THREE.Vector3(-s, c, 0);
    for (let i = 0; i < nSeg; i++){ const p = curve.getPointAt((i + .5)/nSeg), d = curve.getTangentAt((i + .5)/nSeg), w = .013 - .004*i/nSeg, t = .0065 - .002*i/nSeg;
      const seg = C(BOX(t, w, curve.getLength()/nSeg + .0012), petg, p.x, p.y, p.z, "claw_finger");
      const q1 = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), d), yA = new THREE.Vector3(0, 1, 0).applyQuaternion(q1);
      seg.quaternion.copy(q1).premultiply(new THREE.Quaternion().setFromUnitVectors(yA, side.clone().projectOnPlane(d).normalize())); }
    const tip = curve.getPointAt(1), td = curve.getTangentAt(1);
    const pad = C(new THREE.CapsuleGeometry(.0034, .008, 6, 12), pom, tip.x + td.x*.003, tip.y + td.y*.003, tip.z + td.z*.003, "claw_pad"); pad.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), td);
    const l0 = new THREE.Vector3(.008*c, .008*s, HZ - .028), l1 = curve.getPointAt(.25), dl = l1.clone().sub(l0);
    const ln = C(new THREE.CylinderGeometry(.0018, .0018, dl.length(), 10), petg, (l0.x + l1.x)/2, (l0.y + l1.y)/2, (l0.z + l1.z)/2, "claw_link"); ln.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dl.normalize());
    C(cylZ(.0012, .006, 8), steel, l1.x, l1.y, l1.z, "claw_link_pin");
  }
  /* coil cable: tied to a body wall 30 below the clamps, then up beside the line to the Wago on the carriage */
  const CA = Math.PI/3, ccx = LX + .036*Math.cos(CA), ccy = LY + .036*Math.sin(CA), ZT = XP1 - .012, coil = [], turns = 28;
  for (const z of [-.052, -.06]){ C(BOX(.003, .012, .003), m("tie", { color:0x0c0c0d, roughness:.6 }), .029*Math.cos(CA), .029*Math.sin(CA), z, "claw_cable_tie", 0, 0, CA); }
  coil.push(new THREE.Vector3(ccx, ccy, CT - .062), new THREE.Vector3(ccx, ccy, CT - .056));
  for (let i = 0; i <= turns*16; i++){ const t = i/(turns*16), a = t*turns*2*Math.PI; coil.push(new THREE.Vector3(ccx + .007*Math.cos(a), ccy + .007*Math.sin(a), CT - .05 + t*(ZT - .03 - (CT - .05)))); }
  coil.push(new THREE.Vector3(ccx, ccy, ZT), new THREE.Vector3(XC + .045, ccy, XP1 - .004), new THREE.Vector3(XC + .045, YC + .01, XP1 + .03), new THREE.Vector3(XC + .025, YC + .021, XP1 + .026), new THREE.Vector3(XC + .025, YC + .021, XP1 + .0205));
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coil, false, "centripetal"), 1800, .0016, 8), m("coil", { color:0x0e0f12, roughness:.38, metalness:.15 }), 0, 0, 0, 0, 0, 0, "claw_coil_cable");

  /* =========================================================================================== play camera: C920 under a 60 x 60 block, front left */
  use("camera");
  box(-.47, -.47, H0 - .04, -.41, -.41, H0, mdf, "camera_block");
  const cg = new THREE.Group(); cg.position.set(-.44, -.44, H0 - .052); cg.rotation.z = -Math.PI/4; G("camera").add(cg);
  const c2 = new THREE.Group(); c2.rotation.x = -.78; cg.add(c2);
  add(BOX(.04, .03, .012), dark, 0, -.004, .006, 0, 0, 0, "camera_clip", cg); add(BOX(.03, .004, .022), dark, 0, -.017, -.005, 0, 0, 0, "camera_clip", cg);
  add(new THREE.CapsuleGeometry(.0145, .066, 8, 16).rotateZ(Math.PI/2), m("c920", { color:0x111215, roughness:.35, metalness:.2 }), 0, 0, -.008, 0, 0, 0, "camera_c920", c2);
  add(new THREE.CapsuleGeometry(.0128, .062, 8, 16).rotateZ(Math.PI/2).scale(1, .35, .92), m("face", { color:0x050507, roughness:.08, metalness:.3, clearcoat:1, clearcoatRoughness:.05 }, true), 0, .0108, -.008, 0, 0, 0, "camera_c920_face", c2);
  add(cylY(.0095, .006, 40), nemaCap, 0, .0145, -.008, 0, 0, 0, "camera_c920_lens_ring", c2);
  add(cylY(.0078, .0062, 40), lens, 0, .0149, -.008, 0, 0, 0, "camera_c920_lens", c2);
  add(cylY(.0048, .001, 32), m("glass", { color:0x2a3f8c, roughness:.02, metalness:.9, emissive:0x1a2a66, emissiveIntensity:.4 }), 0, .0181, -.008, 0, 0, 0, "camera_c920_glass", c2);
  for (const dx of [-.026, .026]) add(cylY(.0016, .001, 12), m("mic", { color:0x1a1b1f, roughness:.4, metalness:.6 }), dx, .0153, -.008, 0, 0, 0, "camera_c920_mic", c2);
  add(cylY(.0012, .001, 12), led(0xffffff), .016, .0153, -.008, 0, 0, 0, "camera_c920_led", c2);
  long(() => harness([[-.44, -.44, H0 - .046], [-.452, -.452, H0 - .07], [-.452, -.452, .38], [-.43, -.43, .38], [-.43, .38, .38], [.082, .38, .38], [.082, .38, .137], [.082, IN - .0378, .137]], .0025, wireK, "camera_usb"));

  return { parts, capsules, dims:{ FZ, FT, HX0, HX1, HY0, HY1, CR, XC, YC, CT, LX, LY, IN, PY1 } };
}
