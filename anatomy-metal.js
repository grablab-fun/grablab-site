/* ============ Prototype 01, metal build (Oct 29 2026): the welded steel cabinet and the motion system come straight from the
   motion build's exact geometry (assets/machine/metal.json, mm, z 0 = top of the top ring), and so does the prize path; the front panel,
   electronics, claw and capsules are modelled here from the build tutorial.
   Units: metres. z up, ground at 0. Front (windows, prize hole) is -y, rear (service door) is +y, left is -x.
   Every mesh is named, so the card items can pick them. */
export function buildMachine(THREE, api){
  const { mat, onFont } = api;
  const parts = {};
  const G = id => parts[id] ||= Object.assign(new THREE.Group(), { name:id });
  let PART = "frame";
  const use = id => { PART = id; };

  /* sub-groups that shift a part as a whole (the door plates and the electronics board sit at fixed offsets in the metal box) */
  const SUBP = {};
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
    (parent || SUBP[PART] || G(PART)).add(o); return o;
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
    return m(key, Object.assign({ map:t, roughness:.6, metalness:0, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-4 }, o || {})); };
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


  /* ---------------- metal build geometry: base64 vertex and index arrays in mm, mapped to metres, flat shaded ---------------- */
  const SD = api.scene, MP = SD.params;
  const b64 = (s, T) => { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return new T(u.buffer); };
  /* the seat, gate, reader, beams and servo are turned 180 degrees round the funnel throat (563, 137): the ball now leaves to the back, onto the tray */
  const FLIP = new Set(["prize_seat", "prize_gate", "prize_reader", "prize_servo", "prize_beamline", "prize_ball_top", "prize_ball_bottom", "prize_beam_E", "prize_beam_R", "prize_beam_E_win", "prize_beam_R_win", "prize_beam_E_cable", "prize_beam_R_cable"]);
  const flip = p => { for (let i = 0; i < p.length; i += 3){ p[i] = 1126 - p[i]; p[i + 1] = 274 - p[i + 1]; } };
  const toM = p => { for (let i = 0; i < p.length; i += 3){ p[i] = p[i]/1000 - .35; p[i + 1] = p[i + 1]/1000 - .35; p[i + 2] = (p[i + 2] + MP.BOX_H)/1000; } };
  /* keep: optional test on each triangle's centre (mm), to leave parts of a mesh out */
  const mgeo = (n, keep) => { const d = SD.meshes[n]; if (!d) return null; let g;
    if (d.geo) g = d.geo.clone();   // from metal.glb (machine-scene.js)
    else { g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(b64(d.v, Float32Array), 3)); g.setIndex(new THREE.BufferAttribute(b64(d.i, d.i32 ? Uint32Array : Uint16Array), 1)); }
    let f = g.toNonIndexed(); g.dispose();
    if (keep){ const P = f.attributes.position.array, out = []; for (let i = 0; i < P.length; i += 9) if (keep((P[i] + P[i + 3] + P[i + 6])/3, (P[i + 1] + P[i + 4] + P[i + 7])/3, (P[i + 2] + P[i + 5] + P[i + 8])/3)) for (let k = 0; k < 9; k++) out.push(P[i + k]);
      f.dispose(); f = new THREE.BufferGeometry(); f.setAttribute("position", new THREE.Float32BufferAttribute(out, 3)); }
    if (FLIP.has(n)) flip(f.attributes.position.array);
    toM(f.attributes.position.array); f.computeVertexNormals(); return f; };
  const sm = (n, mt, name, parent, keep) => { const g = mgeo(n, keep); if (!g) return null; const o = add(g, mt, 0, 0, 0, 0, 0, 0, name, parent); o.userData.move = (SD.move || {})[n] || "s"; return o; };   // move: s still, y rides the beam, xy rides the X cart
  const SM = (list, mt, name) => list.forEach(n => sm(n, mt, name));
  const LR = a => a.flatMap(n => [n + "_L", n + "_R"]);
  const mm = v => v/1000 - .35, mz = z => (z + MP.BOX_H)/1000;
  const steelT = () => m("tube", { color:0x16171b, roughness:.52, metalness:.55 });          // powder coated, matte black
  const pvc = () => m("pvc", { color:0x101114, roughness:.8, metalness:0, side:THREE.DoubleSide });   // seen from inside too (the simulator looks through the front at the left panel)
  const rivetM = () => m("rivet", { color:0x9ea3ad, roughness:.35, metalness:.9 });
  const pulleyM = () => m("pulley", { color:0xb3b8c2, roughness:.28, metalness:1 });

  /* =========================================================================================== frame: welded 20 x 20 x 1.5 steel tube */
  use("frame");
  SM(["FL", "FR", "BL", "BR"].map(c => "box_post_" + c), steelT, "frame_post");
  for (const l of ["ground", "floor", "top"]) SM(["F", "B", "L", "R"].map(s => `box_${l}_${s}`), steelT, "frame_rail");
  SM(["box_floor_X0", "box_floor_chuteL", "box_floor_chuteB"], steelT, "frame_floor_rail");
  sm("boxhw_feet", steel, "frame_foot");

  /* =========================================================================================== front panel: the front base skin, with the QR and the GRABLAB plate */
  use("panel");
  /* the plates sit on the front base skin, under the window: built facing +y, turned round to face the player at -y, outer face at y -353 */
  { const g = new THREE.Group(); g.name = "panel_plates"; g.position.set(.0525, .159, -.07); g.rotation.z = Math.PI; G("panel").add(g); SUBP.panel = g; }
  sm("box_skin_F_low", pvc, "panel_skin", G("panel"));
  const IN = .50, PY1 = .512;                                     // inner face (components) and outer face (QR, GRABLAB)
  /* scan to play: anodised plate, QR, caption */
  const plateM = m("anod", { color:0x202229, roughness:.32, metalness:.7 });
  box(.23, PY1, .145, .31, PY1 + .003, .235, plateM, "panel_qr_plate");
  const qr = label("qr", .06, .06, (g, w, h) => { const N = 25, s = w/(N + 4); g.fillStyle = "#f4f5f8"; g.fillRect(0, 0, w, h); g.fillStyle = "#0c0d10"; let seed = 7; const rnd = () => (seed = (seed*16807) % 2147483647)/2147483647;
    const fin = (cx, cy) => { g.fillRect((cx + 2)*s, (cy + 2)*s, 7*s, 7*s); g.fillStyle = "#f4f5f8"; g.fillRect((cx + 3)*s, (cy + 3)*s, 5*s, 5*s); g.fillStyle = "#0c0d10"; g.fillRect((cx + 4)*s, (cy + 4)*s, 3*s, 3*s); };
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++){ if ((r < 8 && c < 8) || (r < 8 && c > N - 9) || (r > N - 9 && c < 8)) continue; if (rnd() < .48) g.fillRect((c + 2)*s, (r + 2)*s, s, s); }
    fin(0, 0); fin(N - 7, 0); fin(0, N - 7); });
  add(new THREE.PlaneGeometry(.06, .06), qr, .27, PY1 + .0031, .2, ...FACE_POS_Y, "panel_qr");
  const scan = label("scan", .07, .014, (g, w, h) => { g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#f2f3fa"; g.font = `700 ${h*.52}px Satoshi, sans-serif`; try { g.letterSpacing = `${h*.09}px`; } catch (e) {} g.fillText("SCAN TO PLAY", w/2, h/2); }, { transparent:true, toneMapped:false });
  add(new THREE.PlaneGeometry(.07, .014), scan, .27, PY1 + .0031, .1565, ...FACE_POS_Y, "panel_scan");
  /* GRABLAB plate with a chrome hairline */
  box(-.205, PY1, .13, .205, PY1 + .003, .25, plateM, "panel_wordmark_plate");
  box(-.205, PY1 + .003, .2465, .205, PY1 + .0036, .248, steel, "panel_trim"); box(-.205, PY1 + .003, .132, .205, PY1 + .0036, .1335, steel, "panel_trim");
  const wm = label("wordmark", .36, .1, (g, w, h) => { g.textAlign = "center"; g.textBaseline = "middle"; g.shadowColor = "rgba(200,215,255,.85)"; g.shadowBlur = h*.09; g.fillStyle = "#f6f7ff";
    g.font = `700 ${h*.44}px 'Clash Display', Satoshi, sans-serif`; try { g.letterSpacing = `${h*.02}px`; } catch (e) {} g.fillText("GRABLAB", w/2, h*.42); g.shadowBlur = 0; g.fillText("GRABLAB", w/2, h*.42);
    g.font = `500 ${h*.075}px Satoshi, sans-serif`; try { g.letterSpacing = `${h*.025}px`; } catch (e) {} g.fillStyle = "rgba(220,226,245,.78)"; g.fillText("PROVABLY FAIR CLAW", w/2, h*.76);
    g.fillStyle = "rgba(220,226,245,.5)"; g.font = `500 ${h*.06}px Satoshi, sans-serif`; g.fillText("PROTOTYPE 01", w/2, h*.89); }, { transparent:true, toneMapped:false });
  wm.emissive = new THREE.Color(0xffffff); wm.emissiveMap = wm.map; wm.emissiveIntensity = .9; wm.userData.base.ei = .9;
  add(new THREE.PlaneGeometry(.36, .1), wm, 0, PY1 + .0031, .19, ...FACE_POS_Y, "panel_wordmark");
  /* =========================================================================================== electronics behind the service door, left to right */
  use("electronics");
  /* one plate on the inside of the back tubes, between the ground and the floor ring */
  { const g = new THREE.Group(); g.name = "el_board"; g.position.set(.15, -.175, -.02); G("electronics").add(g); SUBP.electronics = g; }
  box(-.47, IN - .0025, .045, .13, IN, .235, pvc, "el_plate");                 // front face 0.5 mm behind the carrier and the case back, so no two faces share a plane
  /* ---- board details: PCB faces drawn on canvas (copper traces, vias, pads, silkscreen), real parts on top ---- */
  const pcbFace = (key, w, h, base, ink, extra) => label(key, w, h, (g, W, H) => {
    g.fillStyle = base; g.fillRect(0, 0, W, H);
    let sd = 0; for (const ch of key) sd = (sd*31 + ch.charCodeAt(0)) % 2147483647; sd = sd || 7; const r = () => (sd = (sd*16807) % 2147483647)/2147483647;
    g.lineCap = "round"; g.strokeStyle = "rgba(255,255,255,.085)"; g.lineWidth = Math.max(1, W*.005);
    for (let i = 0; i < 34; i++){ let x = r()*W, y = r()*H; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 3; k++){ if (r() < .5) x += (r() - .5)*W*.5; else y += (r() - .5)*H*.5; g.lineTo(x, y); } g.stroke(); }
    for (let i = 0; i < 46; i++){ const x = r()*W, y = r()*H; g.fillStyle = "rgba(222,186,96,.7)"; g.beginPath(); g.arc(x, y, W*.0065, 0, 7); g.fill(); g.fillStyle = "rgba(0,0,0,.55)"; g.beginPath(); g.arc(x, y, W*.0028, 0, 7); g.fill(); }
    g.strokeStyle = ink; g.lineWidth = Math.max(1, W*.006); g.strokeRect(W*.025, H*.035, W*.95, H*.93);
    g.fillStyle = "rgba(222,186,96,.85)"; for (const [x, y] of [[.05, .07], [.95, .07], [.05, .93], [.95, .93]]){ g.beginPath(); g.arc(W*x, H*y, W*.028, 0, 7); g.fill(); g.fillStyle = "#08080a"; g.beginPath(); g.arc(W*x, H*y, W*.015, 0, 7); g.fill(); g.fillStyle = "rgba(222,186,96,.85)"; }
    if (extra){ g.fillStyle = ink; g.strokeStyle = ink; extra(g, W, H); } });
  const onFace = (mt, w, h, x, y, z, nm) => add(new THREE.PlaneGeometry(w, h), mt, x, y, z, ...FACE_NEG_Y, nm);
  const txt = (g, t, x, y, px, wgt = 700) => { g.font = `${wgt} ${px}px Satoshi, sans-serif`; g.textBaseline = "middle"; g.fillText(t, x, y); };
  const capBody = () => m("capb", { color:0x15192a, roughness:.35, metalness:.15 }), capTop = () => m("capt", { color:0xb9bec8, roughness:.25, metalness:1 });
  /* electrolytic capacitor standing out of a board face at yb (towards -y) */
  const ecap = (x, z, r, hgt, yb, nm) => { add(cylY(r, hgt, 28), capBody, x, yb - hgt/2, z, 0, 0, 0, nm); add(cylY(r*.86, .0004, 28), capTop, x, yb - hgt - .0002, z, 0, 0, 0, nm + "_top");
    add(BOX(r*1.5, .00045, r*.12), dark, x, yb - hgt - .00045, z, 0, 0, 0, nm + "_vent"); add(BOX(r*.12, .00045, r*1.5), dark, x, yb - hgt - .00045, z, 0, 0, 0, nm + "_vent"); };
  /* screw terminal block: n ways at 5 mm, body on the board face, screw heads facing -y */
  const termBlock = (x0, z0, n, yb, col, nm, vertical) => { const W = .005*n, D = .009, Hh = .008;
    const bm = m("tb" + col.toString(16), { color:col, roughness:.45 });
    if (vertical) box(x0, yb - D, z0, x0 + Hh, yb, z0 + W, bm, nm); else box(x0, yb - D, z0, x0 + W, yb, z0 + Hh, bm, nm);
    for (let i = 0; i < n; i++){ const cx = vertical ? x0 + Hh/2 : x0 + .0025 + i*.005, cz = vertical ? z0 + .0025 + i*.005 : z0 + Hh/2;
      add(cylY(.0017, .0006, 16), steel, cx, yb - D - .0003, cz, 0, 0, 0, nm + "_screw"); add(BOX(.0026, .0004, .0004), dark, cx, yb - D - .0006, cz, 0, 0, 0, nm + "_slot"); } };
  const header = (x0, z0, n, rows, yb, nm, len = .006) => { for (let rr = 0; rr < rows; rr++){ box(x0 - .0002, yb - .0025, z0 + rr*.00254 - .0012, x0 + n*.00254 - .0002, yb, z0 + rr*.00254 + .0012, dark, nm + "_base");
    for (let i = 0; i < n; i++) box(x0 + i*.00254 + .0009, yb - len, z0 + rr*.00254 - .0003, x0 + i*.00254 + .0015, yb - .0025, z0 + rr*.00254 + .0003, brass, nm); } };
  const chip = (x, z, w, h, yb, nm) => box(x - w/2, yb - .0012, z - h/2, x + w/2, yb, z + h/2, m("ic", { color:0x0b0b0d, roughness:.3, metalness:.25 }), nm);
  const smdR = (x, z, yb, nm) => box(x - .0008, yb - .0005, z - .0004, x + .0008, yb, z + .0004, m("smd", { color:0x1b1b1e, roughness:.4 }), nm);
  const heatsink = (x0, z0, w, h, yb, depth, fins, mt, nm) => { box(x0, yb - .0015, z0, x0 + w, yb, z0 + h, mt, nm);
    for (let f = 0; f < fins; f++){ const fx = x0 + (f + .5)*w/fins; box(fx - w/fins*.22, yb - depth, z0, fx + w/fins*.22, yb - .0015, z0 + h, mt, nm + "_fin"); } };

  /* 12 V 10 A supply, lying: perforated cover, terminal strip on the right under a clear guard, trimmer and power LED */
  { const P0 = -.455, P1 = -.256, Z0 = .035, Z1 = .133, F = IN - .042;
    box(P0, F, Z0, P1, IN, Z1, m("psu", { color:0xb7bcc6, roughness:.34, metalness:.92 }), "el_psu");
    for (const z of [Z0 + .0015, Z1 - .0015]) box(P0 - .0005, F - .0008, z - .0015, P1 + .0005, F + .004, z + .0015, m("psuedge", { color:0x9aa0ab, roughness:.3, metalness:1 }), "el_psu_edge");
    const mesh = label("psumesh", .145, .088, (g, W, H) => { g.fillStyle = "#aeb3bd"; g.fillRect(0, 0, W, H); const st = W/46;
      for (let yy = st; yy < H - st*.5; yy += st*.87) for (let xx = st*((Math.round(yy/(st*.87)) % 2) ? 1 : .5); xx < W - st*.4; xx += st){ g.fillStyle = "#1a1c21"; g.beginPath(); g.arc(xx, yy, st*.31, 0, 7); g.fill(); }
      g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 2; g.strokeRect(1, 1, W - 2, H - 2); }, { metalness:.85, roughness:.38 });
    onFace(mesh, .145, .088, P0 + .078, F - .0002, (Z0 + Z1)/2, "el_psu_cover");
    box(-.292, IN - .052, .04, -.258, F, .128, m("term", { color:0x17181c, roughness:.5 }), "el_psu_terminals");
    for (let i = 0; i < 7; i++){ const z = .05 + i*.0115; box(-.29, IN - .053, z - .0052, -.26, IN - .052, z + .0052, m("termbay", { color:0x0c0c0e, roughness:.6 }), "el_psu_terminals");
      add(cylY(.0034, .0018, 20), m("brass2", { color:0xcfa64e, roughness:.28, metalness:1 }), -.2735, IN - .0538, z, 0, 0, 0, "el_psu_screw"); add(BOX(.0048, .0005, .0007), dark, -.2735, IN - .0548, z, 0, 0, 0, "el_psu_screw_slot"); }
    box(-.293, IN - .061, .04, -.257, IN - .0595, .128, np(m("guard", { color:0xdfe7ff, roughness:.05, transparent:true, opacity:.16, depthWrite:false })), "el_psu_guard");
    const tl = label("psuterm", .012, .084, (g, W, H) => { g.fillStyle = "#e9ebef"; g.fillRect(0, 0, W, H); g.fillStyle = "#1d1f24"; g.textAlign = "center";
      ["L", "N", "⏚", "-V", "-V", "+V", "+V"].forEach((t, i) => txt(g, t, W/2, H*(1 - (i + .5)/7), H*.05, 800)); });
    onFace(tl, .012, .084, -.2985, F - .0002, .0845, "el_psu_label");
    add(cylY(.0026, .002, 16), m("trim", { color:0xe8e9ec, roughness:.4 }), -.3085, F - .001, .052, 0, 0, 0, "el_psu_trim"); add(BOX(.0034, .0004, .0006), dark, -.3085, F - .0021, .052, 0, 0, 0, "el_psu_trim");
    add(cylY(.0016, .0016, 12), led(0x52d96b), -.3085, F - .0008, .064, 0, 0, 0, "el_psu_led");
    const pl = label("psulbl", .046, .022, (g, W, H) => { g.fillStyle = "#14161b"; g.fillRect(0, 0, W, H); g.fillStyle = "#e9ebef"; txt(g, "12 V  10 A", W*.08, H*.36, H*.26, 800);
      g.fillStyle = "rgba(233,235,239,.6)"; txt(g, "SWITCHING POWER SUPPLY", W*.08, H*.72, H*.13, 600); });
    onFace(pl, .046, .022, P0 + .03, F - .0004, Z1 - .016, "el_psu_tag"); }

  /* two 5 way lever connectors side by side: 12 V and ground, translucent housings, orange levers */
  for (const x0 of [-.32, -.27]){ box(x0, IN - .018, .24, x0 + .045, IN, .26, np(m("wagoT", { color:0xc9ccd4, roughness:.18, transmission:0, transparent:true, opacity:.72 }, true)), "el_wago");
    box(x0 + .001, IN - .004, .2405, x0 + .044, IN, .2595, m("wagoCore", { color:0x8f949e, roughness:.4, metalness:.6 }), "el_wago");
    for (let i = 0; i < 5; i++){ box(x0 + .0022 + i*.009, IN - .0225, .2505, x0 + .0078 + i*.009, IN - .018, .2605, lever, "el_wago_lever"); add(cylZ(.0018, .003, 12), dark, x0 + .0055 + i*.009, IN - .009, .2385, 0, 0, 0, "el_wago_port"); } }

  /* motion controller: board on brass standoffs, the shield on its headers, four drivers with heatsinks */
  const ux0 = -.232, uz0 = .095;
  for (const [dx, dz] of [[.004, .004], [.064, .004], [.004, .049], [.064, .049]]){ add(cylY(.0025, .006, 6), brass, ux0 + dx, IN - .003, uz0 + dz, 0, 0, 0, "el_uno_standoff"); add(cylY(.0022, .0012, 16), steel, ux0 + dx, IN - .0221, uz0 + dz, 0, 0, 0, "el_shield_screw"); }
  box(ux0, IN - .0076, uz0, ux0 + .0686, IN - .006, uz0 + .0534, m("uno", { color:0x0e6ea8, roughness:.45 }), "el_uno");
  box(ux0 + .03, IN - .019, uz0 - .006, ux0 + .042, IN - .0076, uz0 + .01, steel, "el_uno_usb"); box(ux0 + .0052, IN - .018, uz0 - .004, ux0 + .0142, IN - .0076, uz0 + .009, dark, "el_uno_jack");
  for (let i = 0; i < 24; i++) box(ux0 + .006 + i*.0024, IN - .0199, uz0 + .002, ux0 + .0072 + i*.0024, IN - .0076, uz0 + .0034, brass, "el_shield_pins");
  box(ux0 + .003, IN - .0215, uz0 + .001, ux0 + .0656, IN - .0199, uz0 + .052, m("shield", { color:0x1b3a87, roughness:.45 }), "el_cnc_shield");
  const SB = IN - .0215;
  onFace(pcbFace("cncshield", .0626, .051, "#1d3e8f", "#e8edf8", (g, W, H) => { g.textAlign = "center"; ["X", "Y", "Z", "A"].forEach((t, i) => txt(g, t, W*(.12 + i*.232), H*.16, H*.075, 800));
    g.textAlign = "left"; txt(g, "MOTION", W*.07, H*.9, H*.055, 800); txt(g, "12-36V", W*.62, H*.9, H*.05, 700); }), .0626, .051, ux0 + .0343, SB - .0001, uz0 + .0265, "el_cnc_shield_face");
  for (let i = 0; i < 4; i++){ const x = ux0 + .007 + i*.0145, DB = SB - .0085;
    header(x + .0004, uz0 + .0165, 5, 1, SB, "el_shield_header", .0085); header(x + .0004, uz0 + .0395, 5, 1, SB, "el_shield_header", .0085);
    box(x, DB - .0016, uz0 + .015, x + .0127, DB, uz0 + .0412, m("a4988", { color:0xb81d24, roughness:.42 }), "el_a4988");
    onFace(pcbFace("drv" + i, .0127, .0262, "#b81d24", "#ffe1e1"), .0127, .0262, x + .00635, DB - .0017, uz0 + .0281, "el_a4988_face");
    chip(x + .0064, uz0 + .028, .005, .005, DB - .0016, "el_a4988_chip");
    heatsink(x + .0019, uz0 + .0235, .009, .009, DB - .0028, .0075, 5, m("hsalu", { color:0x7d8492, roughness:.3, metalness:1 }), "el_a4988_heatsink");
    add(cylY(.0016, .0012, 16), m("pot", { color:0xc9a35a, roughness:.3, metalness:1 }), x + .0035, DB - .0022, uz0 + .0185, 0, 0, 0, "el_a4988_pot");
    for (let j = 0; j < 3; j++) box(x + .0012 + j*.004, SB - .0042, uz0 + .006, x + .0034 + j*.004, SB, uz0 + .0105, m("jumper", { color:0xf2c418, roughness:.45 }), "el_shield_jumper"); }
  termBlock(ux0 + .046, uz0 + .042, 2, SB, 0x1f5fd0, "el_shield_power");
  ecap(ux0 + .0405, uz0 + .046, .004, .011, SB, "el_shield_cap");
  header(ux0 + .006, uz0 + .0035, 12, 2, SB, "el_shield_endstops", .007);
  box(ux0 + .057, SB - .0035, uz0 + .006, ux0 + .063, SB, uz0 + .012, m("btn", { color:0xd9dadf, roughness:.4 }), "el_shield_reset"); add(cylY(.0016, .0012, 14), dark, ux0 + .06, SB - .0041, uz0 + .009, 0, 0, 0, "el_shield_reset");

  /* printed carrier with the claw driver and the 12 V to 5 V converter */
  const cx0 = -.155, LB = IN - .0046;
  box(cx0, IN - .003, .085, cx0 + .1, IN, .145, petg, "el_carrier");
  for (const [x, z] of [[cx0 + .004, .089], [cx0 + .096, .089], [cx0 + .004, .141], [cx0 + .096, .141]]) add(cylY(.0021, .0012, 16), steel, x, IN - .0036, z, 0, 0, 0, "el_carrier_screw");
  box(cx0 + .006, LB, .091, cx0 + .049, IN - .003, .134, m("l298", { color:0xc0262e, roughness:.42 }), "el_l298n");
  onFace(pcbFace("l298", .043, .043, "#c0262e", "#ffe7e7", (g, W, H) => { g.textAlign = "left"; txt(g, "MOTOR A", W*.06, H*.93, H*.06, 800); txt(g, "B", W*.85, H*.93, H*.06, 800); txt(g, "+12V GND +5V", W*.08, H*.08, H*.05, 700); }), .043, .043, cx0 + .0275, LB - .0001, .1125, "el_l298n_face");
  heatsink(cx0 + .0135, .099, .025, .027, LB - .004, .019, 10, m("hs", { color:0x101114, roughness:.42, metalness:.65 }), "el_l298n_heatsink");
  chip(cx0 + .026, .113, .02, .005, LB - .0022, "el_l298n_chip"); box(cx0 + .016, LB - .004, .1005, cx0 + .036, LB, .126, m("hs"), "el_l298n_heatsink");
  termBlock(cx0 + .0075, .0915, 3, LB, 0x1f5fd0, "el_l298n_terminal"); termBlock(cx0 + .033, .1335, 3, LB, 0x1f5fd0, "el_l298n_terminal");
  termBlock(cx0 + .0075, .1235, 2, LB, 0x1f5fd0, "el_l298n_terminal", true); termBlock(cx0 + .0405, .108, 2, LB, 0x1f5fd0, "el_l298n_terminal", true);
  ecap(cx0 + .0105, .106, .0032, .009, LB, "el_l298n_cap"); ecap(cx0 + .0105, .1145, .0032, .009, LB, "el_l298n_cap");
  chip(cx0 + .041, .097, .007, .006, LB, "el_l298n_reg"); header(cx0 + .03, .093, 6, 1, LB, "el_l298n_header", .0065);
  for (const [x, cc] of [[cx0 + .045, 0xff3b3b]]) add(cylY(.0011, .0012, 10), led(cc), x, LB - .0006, .129, 0, 0, 0, "el_l298n_led");
  { const B0 = cx0 + .055, B1 = cx0 + .097, VB = IN - .0046;
    box(B0, VB, .1, B1, IN - .003, .13, m("buck", { color:0x123a7a, roughness:.42 }), "el_converter");
    onFace(pcbFace("buck", B1 - B0, .03, "#123a7a", "#e3ecff", (g, W, H) => { g.textAlign = "left"; txt(g, "IN+", W*.05, H*.12, H*.11, 800); txt(g, "OUT+", W*.72, H*.12, H*.11, 800); txt(g, "IN-", W*.05, H*.9, H*.11, 800); txt(g, "OUT-", W*.72, H*.9, H*.11, 800); }), B1 - B0, .03, (B0 + B1)/2, VB - .0001, .115, "el_converter_face");
    add(cylY(.0068, .006, 32), m("core", { color:0x1a1b1f, roughness:.55 }), B0 + .0145, VB - .003, .115, 0, 0, 0, "el_converter_inductor");
    add(new THREE.TorusGeometry(.0068, .0011, 8, 40), m("copper", { color:0xb8692e, roughness:.32, metalness:1 }), B0 + .0145, VB - .006, .115, Math.PI/2, 0, 0, "el_converter_inductor");
    for (let k = 0; k < 14; k++){ const an = k/14*Math.PI*2; add(BOX(.0012, .006, .0012), m("copper"), B0 + .0145 + .0068*Math.cos(an), VB - .003, .115 + .0068*Math.sin(an), 0, an, 0, "el_converter_inductor"); }
    ecap(B0 + .028, .108, .0034, .009, VB, "el_converter_cap"); ecap(B0 + .028, .1225, .0034, .009, VB, "el_converter_cap");
    box(B0 + .0335, VB - .006, .103, B0 + .0405, VB, .113, m("trimb", { color:0x2a62d8, roughness:.4 }), "el_converter_trim"); add(cylY(.0011, .0008, 12), m("brass2"), B0 + .037, VB - .0064, .1055, 0, 0, 0, "el_converter_trim");
    chip(B0 + .036, .123, .006, .005, VB, "el_converter_chip");
    for (const [x, z] of [[B0 + .003, .103], [B0 + .003, .127], [B1 - .003, .103], [B1 - .003, .127]]){ add(cylY(.0019, .0007, 16), m("brass2"), x, VB - .0003, z, 0, 0, 0, "el_converter_pad"); } }

  /* computer case 100 x 70 x 35: dark anodised aluminium, the board on posts, the secure chip on its own 2 posts, smoked lid with the 30 mm fan */
  const px0 = 0, pz0 = .12, pib = IN - .008, caseM = () => m("picase", { color:0x1d1f26, roughness:.32, metalness:.8 });
  box(px0, IN - .0031, pz0, px0 + .1, IN - .0025, pz0 + .07, caseM, "el_picase_back");
  box(px0, IN - .035, pz0, px0 + .0025, IN - .0025, pz0 + .07, caseM, "el_picase_wall"); box(px0 + .0975, IN - .035, pz0, px0 + .1, IN - .0025, pz0 + .07, caseM, "el_picase_wall");
  box(px0, IN - .035, pz0, px0 + .1, IN - .0025, pz0 + .0025, caseM, "el_picase_wall"); box(px0, IN - .035, pz0 + .0675, px0 + .1, IN - .0025, pz0 + .07, caseM, "el_picase_wall");
  for (let i = 0; i < 9; i++) box(px0 + .012 + i*.0085, IN - .0352, pz0 + .0675, px0 + .0165 + i*.0085, IN - .0348, pz0 + .07, dark, "el_picase_vent");
  for (const [dx, dz] of [[.011, .0105], [.069, .0105], [.011, .0595], [.069, .0595]]){ add(cylY(.003, .0055, 12), caseM, px0 + dx, IN - .00525, pz0 + dz, 0, 0, 0, "el_pi_post"); add(cylY(.0019, .0008, 14), steel, px0 + dx, pib - .002, pz0 + dz, 0, 0, 0, "el_pi_screw"); }
  box(px0 + .0075, pib - .0016, pz0 + .007, px0 + .0925, pib, pz0 + .063, m("pi", { color:0x1f7a3c, roughness:.45 }), "el_pi4");
  onFace(pcbFace("pi4", .085, .056, "#1d7a3b", "#eef8f0", (g, W, H) => { g.textAlign = "left"; txt(g, "4 GB", W*.06, H*.3, H*.06, 800); }), .085, .056, px0 + .05, pib - .0017, pz0 + .035, "el_pi4_face");
  box(px0 + .072, pib - .017, pz0 + .01, px0 + .0925, pib - .0016, pz0 + .025, steel, "el_pi_usb3"); box(px0 + .072, pib - .017, pz0 + .027, px0 + .0925, pib - .0016, pz0 + .042, steel, "el_pi_usb2");
  for (const z of [pz0 + .0145, pz0 + .0315]) box(px0 + .0921, pib - .0145, z, px0 + .0926, pib - .0042, z + .006, m("usbblue", { color:0x1f5fd0, roughness:.4 }), "el_pi_usb3");
  box(px0 + .074, pib - .0145, pz0 + .045, px0 + .0925, pib - .0016, pz0 + .06, steel, "el_pi_ethernet");
  for (const x of [px0 + .02, px0 + .034]) box(x, pib - .0045, pz0 + .007, x + .0075, pib - .0016, pz0 + .0105, steel, "el_pi_hdmi");
  box(px0 + .009, pib - .0048, pz0 + .007, px0 + .0175, pib - .0016, pz0 + .0105, steel, "el_pi_usbc");
  box(px0 + .04, pib - .0045, pz0 + .03, px0 + .055, pib - .0016, pz0 + .045, m("soc", { color:0xa7abb3, roughness:.3, metalness:.9 }), "el_pi_heatsink");
  for (let f = 0; f < 5; f++) box(px0 + .0405 + f*.003, pib - .009, pz0 + .03, px0 + .0415 + f*.003, pib - .0045, pz0 + .045, plate, "el_pi_heatsink_fin");
  chip(px0 + .062, pz0 + .037, .008, .011, pib - .0016, "el_pi_ram"); chip(px0 + .067, pz0 + .019, .005, .005, pib - .0016, "el_pi_usbchip");
  for (let r = 0; r < 2; r++) for (let c = 0; c < 20; c++) box(px0 + .012 + c*.00254, pib - .0085, pz0 + .057 + r*.00254, px0 + .0128 + c*.00254, pib - .0016, pz0 + .0578 + r*.00254, brass, "el_pi_gpio");
  box(px0 + .0116, pib - .0026, pz0 + .0555, px0 + .0632, pib - .0016, pz0 + .0605, dark, "el_pi_gpio");

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
  R([[-.2735, IN - .052, .108], [-.2475, IN - .052, .108], [-.2475, IN - .004, .108], [-.2475, IN - .004, .215], [wr(0), IN - .004, .215], [wr(0), IN - .009, WB]], "el_wire_psu_wago");
  K([[-.2735, IN - .052, .0845], [-.2435, IN - .052, .0845], [-.2435, IN - .013, .0845], [-.2435, IN - .013, .225], [wk(4), IN - .013, .225], [wk(4), IN - .009, WB]], "el_wire_psu_gnd");
  R([[wr(1), IN - .009, WB], [wr(1), IN - .004, .19], [-.182, IN - .004, .19], [-.182, IN - .004, .16], [-.182, IN - .026, .1465]], "el_wire_shield");
  K([[wk(0), IN - .009, WB], [wk(0), IN - .0085, .185], [-.174, IN - .0085, .185], [-.174, IN - .0085, .16], [-.174, IN - .026, .1465]], "el_wire_shield");
  R([[wr(2), IN - .009, WB], [wr(2), IN - .004, .182], [-.143, IN - .004, .182], [-.143, IN - .008, .175], [-.143, IN - .008, .0995]], "el_wire_l298n");
  K([[wk(1), IN - .009, WB], [wk(1), IN - .0085, .178], [-.152, IN - .0085, .178], [-.152, IN - .0085, .095], [-.1472, IN - .0085, .095]], "el_wire_l298n");
  R([[wr(3), IN - .009, WB], [wr(3), IN - .004, .174], [-.09, IN - .004, .174], [-.09, IN - .008, .168], [-.09, IN - .008, .1305]], "el_wire_converter");
  K([[wk(2), IN - .009, WB], [wk(2), IN - .0085, .17], [-.08, IN - .0085, .17], [-.08, IN - .0085, .1305]], "el_wire_converter");
  R([[-.0595, IN - .008, .118], [-.03, IN - .008, .118], [-.03, IN - .008, .14], [-.0005, IN - .008, .14]], "el_wire_pi_5v");
  K([[-.0595, IN - .012, .108], [-.025, IN - .012, .108], [-.025, IN - .012, .132], [-.0005, IN - .012, .132]], "el_wire_pi_5v");
  harness([[ux0 + .036, IN - .013, uz0 - .0065], [ux0 + .036, IN - .013, .075], [.08, IN - .013, .075], [.08, IN - .013, .1195]], .0028, m("usb", { color:0x0d0d0f, roughness:.5 }), "el_usb_uno_pi");

  /* =========================================================================================== skins, floor, windows */
  use("cage");
  const FZ = .238, FT = .012, HX0 = mm(MP.CHUTE[0]), HX1 = mm(MP.CHUTE[1]), HY0 = mm(MP.CHUTE[2]), HY1 = mm(MP.CHUTE[3]);   // floor top at 250, 222 x 222 hole front right
  sm("box_floor", pvc, "cage_floor");
  /* the floor runs out to the skins: a strip over each floor ring tube, so no 3 mm step reads as a gap along the walls */
  for (const [x0, y0, x1, y1] of [[-.35, -.35, .35, -.33], [-.35, .33, .35, .35], [-.35, -.33, -.33, .33], [.33, -.33, .35, .33]]) box(x0, y0, .247, x1, y1, .25, pvc, "cage_floor");
  sm("box_skin_L_low", pvc, "cage_skin");
  /* the right skin around the tray opening */
  for (const [y0, z0, y1, z1] of [[0, -1110, 232, -873], [606, -1110, 700, -873], [232, -1110, 606, -1089], [232, -1033, 606, -873]]) box(mm(700), mm(y0), mz(z0), mm(703), mm(y1), mz(z1), pvc, "cage_skin");       // the lower right skin comes off on magnets to empty the tray
  sm("box_skin_B_low", pvc, "cage_door");      // the lower back skin is the service panel, on magnets
  SM(["box_skin_B", "box_skin_L"], pvc, "cage_showcase");   // upper back and upper left are black panels; front and right are clear
  SM(["box_glass_F", "box_glass_R"], acrylic, "cage_window");
  /* LED strip straight on the four top tubes, lighting the play floor */
  { const opal = () => m("cobwarm", { color:0xffd9a8, emissive:0xffb066, emissiveIntensity:1.5, roughness:.9 }), prof = () => m("ledprofile", { color:0x0b0c0f, roughness:.5, metalness:.5 });
    /* COB strip 3000 K in a black U-12 profile: the diffuser shows only on the underside */
    for (const n of ["F", "B", "L", "R"]){ const o = sm("box_led_" + n, opal, "cage_led_cover"); if (!o) continue; o.geometry.computeBoundingBox(); const b = o.geometry.boundingBox; box(b.min.x - .002, b.min.y - .002, b.min.z + .001, b.max.x + .002, b.max.y + .002, b.max.z + .004, prof, "cage_led_profile"); } }
  /* no rivets drawn: on the black panels and the glass they read as specks */

  /* =========================================================================================== prize path: funnel, seat, reader, beam, gate, tray (the motion build's own parts) */
  use("chute");
  const prizeM = () => m("prize", { color:0x2e313a, roughness:.48, metalness:.05 }), e3 = () => m("e3", { color:0x34373f, roughness:.5, metalness:.25 });
  sm("prize_funnel", () => m("funnel", { color:0x2b2e36, roughness:.35, metalness:.2, side:THREE.DoubleSide }), "chute_funnel");   // one piece: 222 opening, 100 mm wall on the floor, 55 mm throat
  sm("prize_seat", prizeM, "chute_seat");
  /* a pivot that animates, holding parts drawn in machine coordinates */
  const rig = (x, y, z) => { const pivot = new THREE.Group(), hold = new THREE.Group(); pivot.position.set(x, y, z); hold.position.set(-x, -y, -z); pivot.add(hold); G("chute").add(pivot); return { pivot, hold }; };
  const gateR = rig(0, mm(200), mz(-974.8)), ballR = rig(0, 0, 0), trayR = rig(0, 0, 0), doorR = rig(mm(703.4), mm(606), mz(-1070));
  sm("prize_gate", prizeM, "chute_gate", gateR.hold);
  box(mm(522), mm(196), mz(-978), mm(540), mm(204), mz(-971), () => m("horn", { color:0xe9e9e4, roughness:.5 }), "chute_mg90s_horn", gateR.hold);
  sm("prize_servo", () => m("mg90", { color:0x1d2c55, roughness:.4 }), "chute_mg90s");
  sm("prize_reader", () => m("acr", { color:0x141518, roughness:.42 }), "chute_acr122u");
  for (const s of ["E", "R"]){ sm("prize_beam_" + s, e3, "chute_e3jk"); sm(`prize_beam_${s}_cable`, () => m("cableE3", { color:0x101114, roughness:.6 }), "chute_e3jk_cable"); sm(`prize_beam_${s}_win`, lens, "chute_e3jk_lens"); }
  { const g = mgeo("prize_beamline"); if (g) add(g, m("laserglow", { color:0xff3030, emissive:0xff2020, emissiveIntensity:1.6, transparent:true, opacity:.5, toneMapped:false, depthWrite:false, blending:THREE.AdditiveBlending }), 0, 0, 0, 0, 0, 0, "chute_e3jk_beam"); }
  /* the ball tray: a narrow drawer behind the gate, against the right skin, pulled out sideways through a small door */
  { const trayM = m("trayM", { color:0x2b2e36, roughness:.45, metalness:.35 }), slotM = m("slotM", { color:0x05060a, roughness:.9 }), H = trayR.hold;
    const X0 = mm(40), X1 = mm(672), Y0 = mm(235), Y1 = mm(600), Z0 = mz(-1088), Z1 = mz(-1085), ZT = mz(-1034), T = .003;
    box(X0, Y0, Z0, X1, Y1, Z1, trayM, "chute_tray", H);
    /* the floor falls toward the back left corner, so every ball crosses the tray, ends there and none sits stuck */
    add(BOX(.632, .365, .003), trayM, mm(356), mm(417.5), mz(-1072.5), -.0274, -.0285, 0, "chute_tray", H);
    /* a notch in the wall facing the gate, so the ball leaves the seat freely */
    box(X0, Y0, Z1, mm(510), Y0 + T, ZT, trayM, "chute_tray", H); box(mm(616), Y0, Z1, X1, Y0 + T, ZT, trayM, "chute_tray", H); box(mm(510), Y0, Z1, mm(616), Y0 + T, mz(-1066), trayM, "chute_tray", H); box(X0, Y1 - T, Z1, X1, Y1, ZT, trayM, "chute_tray", H);
    box(X0, Y0, Z1, X0 + T, Y1, ZT, trayM, "chute_tray", H); box(X1 - T, Y0, Z1, X1, Y1, ZT, trayM, "chute_tray", H);
    box(mm(672), mm(377), mz(-1066), mm(690), mm(417), mz(-1056), steel, "chute_tray", H);
    for (const y of [240, 585]) box(mm(40), mm(y), mz(-1092), mm(699), mm(y + 10), mz(-1088), steel, "chute_tray_rail");
    box(mm(703.4), mm(232), mz(-1089), mm(706), mm(606), mz(-1033), pvc, "chute_side_door", doorR.hold);
    box(mm(706), mm(245), mz(-1070), mm(710), mm(255), mz(-1052), steel, "chute_side_door", doorR.hold); }
  /* a ball on the seat, tag down over the reader */
  { const ballM = () => m("ballM", { color:0xf2f1ec, roughness:.68, metalness:0 }); sm("prize_ball_top", ballM, "chute_ball", ballR.hold); sm("prize_ball_bottom", ballM, "chute_ball", ballR.hold); }
  G("chute").userData.prizeRig = { gate:gateR.pivot, ball:ballR.pivot, tray:trayR.pivot, door:doorR.pivot };
  use("cage");

  /* =========================================================================================== capsules: 45 mm printed balls */
  use("capsules");
  const capsules = [], CR = .0225;
  /* printed white shell: matte, layer lines (a stripe map along the latitude), a seam where the halves meet */
  const layerT = canvasTex(8, 64, (g, W, H) => { g.fillStyle = "#ffffff"; g.fillRect(0, 0, W, H); for (let y = 0; y < H; y += 4){ g.fillStyle = "rgba(120,118,112,.22)"; g.fillRect(0, y, W, 1); } });
  layerT.wrapS = layerT.wrapT = THREE.RepeatWrapping; layerT.repeat.set(1, 6);
  const shell = m("shell", { color:0xf2f1ec, map:layerT, roughness:.68, metalness:0, side:THREE.DoubleSide });
  const tagT = new THREE.TextureLoader().load("assets/nfc-tag.webp?v=2"); tagT.colorSpace = THREE.SRGBColorSpace; tagT.anisotropy = 8;
  const tagM = m("tag", { map:tagT, alphaTest:.4, roughness:.6, metalness:0 });
  const gTop = new THREE.SphereGeometry(CR, 36, 16, 0, Math.PI*2, 0, Math.PI/2).rotateX(Math.PI/2), gBot = new THREE.SphereGeometry(CR, 36, 16, 0, Math.PI*2, Math.PI/2, Math.PI/2).rotateX(Math.PI/2);
  const gSeam = new THREE.TorusGeometry(CR + .00005, .00028, 6, 48), seamM = m("seam", { color:0xb9b7b0, roughness:.8 });
  const gTag = new THREE.CircleGeometry(.0135, 32);
  let seed = 11; const rnd = () => (seed = (seed*16807) % 2147483647)/2147483647;
  /* a heap, not a grid: balls dropped one by one at random spots (more towards the middle), each settles on the floor or on the
     balls under it; of a few tries per ball the lowest wins, so holes fill first and a soft mound grows. Seeded, so it is the same every load. */
  const Lc = .328 - CR, spots = [], z0 = FZ + FT + CR + .0002, D2 = 4*CR*CR;
  const clear = (x, y) => !(x > HX0 - .004 - CR && y < HY1 + .004 + CR);
  let hs = 23; const hr = () => (hs = (hs*16807) % 2147483647)/2147483647;
  const restZ = (x, y) => { let z = z0; for (const [bx, by, bz] of spots){ const dd = (x - bx)**2 + (y - by)**2; if (dd < D2) z = Math.max(z, bz + Math.sqrt(D2 - dd) + .0001); } return z; };
  for (let n = 0; n < 300; n++){ let best = null;
    for (let t = 0; t < 7; t++){ const g = () => (hr() + hr() + hr() - 1.5)/1.5, x = Math.max(-Lc, Math.min(Lc, -.04 + g()*.43)), y = Math.max(-Lc, Math.min(Lc, .035 + g()*.43));
      if (!clear(x, y)) continue; const z = restZ(x, y); if (!best || z < best[2]) best = [x, y, z]; }
    if (best && best[2] < z0 + .125) spots.push(best); }
  /* then let them settle: small gravity steps, pushed apart where they overlap and kept off the walls and the drop zone, so a ball
     resting on one other rolls off into a pocket of three, as real spheres do (no ball is left balanced in the air) */
  { const N = spots.length, X = spots.map(q => q[0]), Y = spots.map(q => q[1]), Z = spots.map(q => q[2]), R2 = 2*CR, cell = R2, grid = new Map();
    const key = (x, y) => Math.floor(x/cell) + "," + Math.floor(y/cell);
    for (let it = 0; it < 260; it++){
      for (let i = 0; i < N; i++){ Z[i] -= .0025*Math.max(.12, 1 - it/200); if (Z[i] < z0) Z[i] = z0; X[i] = Math.max(-Lc, Math.min(Lc, X[i])); Y[i] = Math.max(-Lc, Math.min(Lc, Y[i]));
        if (!clear(X[i], Y[i])){ const ex = X[i] - (HX0 - .004 - CR), ey = (HY1 + .004 + CR) - Y[i]; if (ex < ey) X[i] -= ex + .0001; else Y[i] += ey + .0001; } }
      grid.clear(); for (let i = 0; i < N; i++){ const k = key(X[i], Y[i]); if (!grid.has(k)) grid.set(k, []); grid.get(k).push(i); }
      for (let i = 0; i < N; i++){ const cx = Math.floor(X[i]/cell), cy = Math.floor(Y[i]/cell);
        for (let gx = cx - 1; gx <= cx + 1; gx++) for (let gy = cy - 1; gy <= cy + 1; gy++){ const L = grid.get(gx + "," + gy); if (!L) continue;
          for (const j of L){ if (j <= i) continue; let dx = X[j] - X[i], dy = Y[j] - Y[i], dz = Z[j] - Z[i]; const d = Math.hypot(dx, dy, dz);
            if (d >= R2 || d < 1e-6) continue; const push = (R2 - d)/2/d; dx *= push; dy *= push; dz *= push;
            X[i] -= dx; Y[i] -= dy; Z[i] -= dz; X[j] += dx; Y[j] += dy; Z[j] += dz; } } } }
    for (let i = 0; i < N; i++) spots[i] = [X[i], Y[i], Math.max(z0, Z[i])]; }
  spots.forEach(([x, y, z], k) => {
    const o = new THREE.Group(); o.name = "capsule_" + String(k + 1).padStart(3, "0"); o.position.set(x, y, z);
    o.quaternion.setFromEuler(new THREE.Euler(rnd()*6.28, rnd()*6.28, rnd()*6.28));
    const lidG = new THREE.Group(); o.add(lidG);
    const t = new THREE.Mesh(gTop, shell), b = new THREE.Mesh(gBot, shell);
    const sm2 = new THREE.Mesh(gSeam, seamM);
    lidG.add(t);
    /* NFC disc at the bottom pole, on the side that turns to you when the capsule opens */
    const tg = new THREE.Mesh(gTag, tagM); tg.position.set(0, 0, -CR*.55);                     // lying on the inside floor of the lower half
    [t, b, tg, sm2].forEach(mm => { mm.userData.part = "capsules"; mm.name = o.name; });
    o.add(b, tg, sm2); o.userData.lid = lidG; o.userData.q0 = o.quaternion.clone(); o.userData.cap = true; o.userData.part = "capsules";
    G("capsules").add(o); capsules.push(o);
  });


  /* =========================================================================================== XY gantry: the motion build, at its export pose */
  use("gantry");
  SM(["rail_L", "rail_R"], alu, "gantry_y_rail");
  sm("beam", alu, "gantry_x_beam");
  SM([...LR(["ymotorblock", "yidlerblock"]), "xmotorblock", "xidlerblock"], petg, "gantry_block");
  sm("boxhw_blocks", dark, "gantry_block_bolt");
  SM([...LR(["yfix_m", "yfix_i", "ymotorfix", "ysaddlefix", "ycapfix"]), "xfix_m", "xfix_i", "xmotorfix", ...[0, 1, 2, 3, 4].map(i => "ledgefix_" + i)], dark, "gantry_screw");
  SM([...LR(["ymotor"]), "xmotor"], nema, "gantry_motor"); SM([...LR(["yshaft"]), "xshaft"], steel, "gantry_motor_shaft");
  SM([...LR(["ypulley"]), "xpulley"], pulleyM, "gantry_pulley");
  SM([...LR(["yidler"]), "xidler"], steel, "gantry_idler"); SM([...LR(["yspacer"]), "xspacer"], petg, "gantry_idler_spacer"); SM([...LR(["yaxle"]), "xaxle"], steel, "gantry_idler_axle");
  for (const e of ["yes", "xes"]){ sm(e + "_adapter", petg, "gantry_endstop"); sm(e + "_board", pcbRed, "gantry_endstop"); sm(e + "_switch", sw, "gantry_endstop"); sm(e + "_lever", steel, "gantry_endstop"); sm(e + "_fix", dark, "gantry_endstop"); }
  SM(LR(["ycart_plate"]), plate, "gantry_y_carriage"); SM(LR(["ycart_wheels"]), pom, "gantry_y_wheel"); SM(LR(["ycart_hw"]), steel, "gantry_y_carriage_hw");
  SM(LR(["ysaddle"]), petg, "gantry_saddle"); SM(LR(["ybolts"]), dark, "gantry_saddle_bolt"); SM(LR(["ycap"]), petg, "gantry_belt_cap");
  SM([0, 1, 2, 3, 4].map(i => "ledge_" + i), petg, "gantry_chain_ledge");
  /* toothed belts: a closed loop round each pulley and idler (the motion build's own belt path, in mm) */
  const beltLoop = (Lw, rotDeg, t, name) => {
    const r0 = MP.TIP_R, r1 = MP.BACK_R, zc = MP.ZS, a0 = MP.BELT_A - 3, a1 = MP.BELT_A + 3, dd = Math.sign(Lw), Lb = Math.abs(Lw), path = [], R = (r0 + r1)/2, h = (r1 - r0)/2;
    for (let i = 0; i <= 20; i++) path.push([dd*Lb*i/20, zc + R, 0, 1]);
    for (let i = 1; i <= 28; i++){ const q = Math.PI/2 - Math.PI*i/28; path.push([dd*Lb + dd*Math.cos(q)*R, zc + Math.sin(q)*R, dd*Math.cos(q), Math.sin(q)]); }
    for (let i = 1; i <= 20; i++) path.push([dd*Lb*(1 - i/20), zc - R, 0, -1]);
    for (let i = 1; i <= 28; i++){ const q = -Math.PI/2 - Math.PI*i/28; path.push([dd*Math.cos(q)*R, zc + Math.sin(q)*R, dd*Math.cos(q), Math.sin(q)]); }
    const pos = [], idx = [];
    for (const [w, z, nw, nz] of path) for (const a of [a0, a1]){ pos.push(a, w - nw*h, z - nz*h); pos.push(a, w + nw*h, z + nz*h); }
    for (let k = 0; k < path.length - 1; k++){ const b = k*4, c = b + 4; idx.push(b, c, b + 2, c, c + 2, b + 2, b + 1, b + 3, c + 1, c + 1, b + 3, c + 3, b, b + 1, c, c, b + 1, c + 1, b + 2, c + 2, b + 3, c + 2, c + 3, b + 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
    g.rotateZ(rotDeg*Math.PI/180); g.translate(...t); const f = g.toNonIndexed(); g.dispose(); toM(f.attributes.position.array); f.computeVertexNormals();
    add(f, m("beltd", { color:0x0b0b0c, roughness:.85, metalness:0, side:THREE.DoubleSide }), 0, 0, 0, 0, 0, 0, name).userData.move = name === "gantry_x_belt" ? "y" : "s"; };
  beltLoop(MP.Y_IDLER - MP.Y_SHAFT, 0, [MP.CL, MP.Y_SHAFT, MP.ZT_Y], "gantry_y_belt");
  beltLoop(MP.Y_SHAFT - MP.Y_IDLER, 180, [MP.CR, MP.Y_SHAFT, MP.ZT_Y], "gantry_y_belt");
  beltLoop(MP.X_IDLER - MP.X_SHAFT, -90, [MP.X_SHAFT, MP.Y_REF, MP.ZT_X], "gantry_x_belt");
  /* drag chain on the ledges behind the beam: fixed at the left, a U turn, the top run back to the cart */
  { const N = Math.round(MP.CHAIN_LEN/18.1), Pc = MP.CHAIN_LEN/N, zlo = MP.Z_LO, zhi = MP.Z_HI, zm = (zlo + zhi)/2, R = (zhi - zlo)/2, Xc = MP.X_REF;
    const Lp = MP.CHAIN_LEN - Math.PI*R, xb = (MP.CHAIN_FIX_X + Xc + Lp)/2, y = MP.Y_REF - (MP.CHAIN_A[0] + MP.CHAIN_A[1])/2, l1 = xb - MP.CHAIN_FIX_X, l2 = Math.PI*R;
    const geo = BOX((Pc - 1.6)/1000, MP.CHAIN_W/1000, MP.CHAIN_H/1000), cm = m("chain", { color:0x131416, roughness:.55 });
    for (let i = 0; i < N; i++){ const s = (i + .5)*Pc; let x, z, ang;
      if (s < l1){ x = MP.CHAIN_FIX_X + s; z = zlo; ang = 0; } else if (s < l1 + l2){ const q = -Math.PI/2 + (s - l1)/R; x = xb + R*Math.cos(q); z = zm + R*Math.sin(q); ang = q + Math.PI/2; } else { x = xb - (s - l1 - l2); z = zhi; ang = Math.PI; }
      add(geo, cm, mm(x), mm(y), mz(MP.ZT_X + z), 0, -ang, 0, "gantry_drag_chain").userData.move = "y"; } }

  /* =========================================================================================== X cart and winch */
  use("winch");
  sm("xcart_plate", plate, "winch_x_carriage"); sm("xcart_wheels", pom, "winch_x_wheel"); sm("xcart_hw", steel, "winch_x_carriage");
  sm("xsaddle", petg, "winch_saddle"); sm("xbolts", dark, "winch_saddle"); sm("xcap", petg, "winch_belt_cap"); sm("xcapfix", dark, "winch_belt_cap");
  sm("winch_bracket", petg, "winch_mount"); sm("winchfix", dark, "winch_mount"); sm("winch_motor", nema, "winch_motor"); sm("winch_shaft", steel, "winch_motor");
  sm("winch_spool", petg, "winch_spool"); sm("spoolfix", dark, "winch_spool"); sm("winch_tube", brass, "winch_eyelet");
  sm("zes_hanger", petg, "winch_z_endstop"); sm("zes_board", pcbRed, "winch_z_endstop"); sm("zes_switch", sw, "winch_z_endstop"); sm("zes_lever", steel, "winch_z_endstop");
  const XC = mm(MP.X_REF), YC = mm(MP.Y_REF), EYE = mz(91);       // the line leaves the brass eyelet 1221 above the ground

  /* =========================================================================================== claw: black print, motor block, square actuator tube, 3 long arms with paddles on a pivot hub */
  use("claw");
  const LX = mm(MP.X_REF + MP.WSIGN*MP.EYE_W), LY = mm(MP.Y_REF - MP.EYE_A), CT = .9;
  add(new THREE.CylinderGeometry(.001, .001, EYE - (CT + .022), 8), m("dyneema", { color:0x46474e, roughness:.75 }), LX, LY, (EYE + CT + .022)/2, Math.PI/2, 0, 0, "claw_line");
  const claw = new THREE.Group(); claw.position.set(LX, LY, CT); G("claw").add(claw);
  const C = (geo, mt, x, y, z, nm, rx = 0, ry = 0, rz = 0) => add(geo, mt, x, y, z, rx, ry, rz, nm, claw);
  /* swivel: two rings and a barrel */
  C(new THREE.TorusGeometry(.0045, .0009, 8, 20), steel, 0, 0, .019, "claw_swivel", Math.PI/2);
  C(new THREE.CylinderGeometry(.0022, .0028, .009, 16).rotateX(Math.PI/2), steel, 0, 0, .011, "claw_swivel");
  C(new THREE.TorusGeometry(.0045, .0009, 8, 20), steel, 0, 0, .003, "claw_swivel", 0, 0, Math.PI/2);
  /* the new claw, all black print: the motor block on top with a cross plate and three link ears, the actuator's square
     tube down the middle, a hub on its end where three long arms pivot, a link from each top ear to the arm's elbow.
     Closed, the arms make a round cage and the three paddles meet under it as a bowl; the page opens and closes it. */
  const blk = () => m("clawblk", { color:0x16171a, roughness:.55, metalness:.05 }), blk2 = () => m("clawblk2", { color:0x202126, roughness:.42, metalness:.1 });
  C(new THREE.TorusGeometry(.005, .0018, 10, 24), blk, 0, 0, -.001, "claw_cap_eye", Math.PI/2);
  C(rbox(.03, .03, .034, .003), blk, 0, 0, -.022, "claw_body");                                   // motor block
  for (const [x, y] of [[-.011, -.0151], [.011, -.0151], [-.011, .0151], [.011, .0151]]) C(cylY(.0019, .001, 12), steel, x, y, -.012, "claw_body_screw");
  C(rbox(.05, .05, .006, .004), blk2, 0, 0, -.042, "claw_cap");                                    // cross plate
  const ZT0 = -.042, ZP = -.112, RP = .036, RE = .032;                                             // top ears, arm pivots
  for (let k = 0; k < 3; k++){ const a = k*2*Math.PI/3 + Math.PI/2; C(BOX(.014, .01, .012), blk2, RE*Math.cos(a), RE*Math.sin(a), ZT0, "claw_cap_ear", 0, 0, a); }
  C(BOX(.012, .012, .066), m("acttube", { color:0xa9adb5, roughness:.32, metalness:.9 }), 0, 0, -.077, "claw_actuator");   // square tube, the rod inside
  C(rbox(.02, .02, .012, .002), blk, 0, 0, -.051, "claw_actuator_collar");
  C(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(.012, .012, -.03), new THREE.Vector3(.03, .02, -.05), new THREE.Vector3(.038, .024, -.09), new THREE.Vector3(.044, .02, -.13)]), 24, .0009, 8), m("redlead", { color:0xc22325, roughness:.45 }), 0, 0, 0, "claw_actuator_lead");
  C(new THREE.CylinderGeometry(.03, .03, .01, 6).rotateX(Math.PI/2), blk2, 0, 0, ZP, "claw_hub", 0, 0, Math.PI/6);   // pivot hub
  C(cylZ(.009, .014, 20), blk, 0, 0, ZP - .01, "claw_hub_nut");
  const arms = [], links = [];
  for (let k = 0; k < 3; k++){
    const a = k*2*Math.PI/3 + Math.PI/2, c = Math.cos(a), s = Math.sin(a), side = new THREE.Vector3(-s, c, 0);
    C(BOX(.012, .016, .014), blk2, RP*Math.cos(a), RP*Math.sin(a), ZP, "claw_lug", 0, 0, a);
    /* the arm turns on its pin; built closed, in its own frame: u out from the axis, z down */
    const arm = new THREE.Group(); arm.position.set(RP*c, RP*s, ZP); claw.add(arm);
    const P = (u, z) => new THREE.Vector3(u*c, u*s, z);
    const A = (geo, mt, x, y, z, nm) => add(geo, mt, x, y, z, 0, 0, 0, nm, arm);
    A(new THREE.CylinderGeometry(.0018, .0018, .022, 10).rotateZ(Math.PI/2).rotateZ(a + Math.PI/2), steel, 0, 0, 0, "claw_rod");
    const curve = new THREE.CatmullRomCurve3([P(0, 0), P(.016, -.01), P(.028, -.034), P(.027, -.06), P(.016, -.082), P(.006, -.097)]);
    const nSeg = 26, L = curve.getLength(), slotM = m("slot", { color:0x060607, roughness:.9 });
    for (let i = 0; i < nSeg; i++){ const t = (i + .5)/nSeg, p = curve.getPointAt(t), d = curve.getTangentAt(t);
      const seg = A(BOX(.0042, .02, L/nSeg + .0012), blk, p.x, p.y, p.z, "claw_finger");
      const q1 = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), d), yA = new THREE.Vector3(0, 1, 0).applyQuaternion(q1);
      seg.quaternion.copy(q1).premultiply(new THREE.Quaternion().setFromUnitVectors(yA, side.clone().projectOnPlane(d).normalize()));
      if (i === 9 || i === 16){ const sl = A(BOX(.0046, .008, .005), slotM, p.x, p.y, p.z, "claw_finger_slot"); sl.quaternion.copy(seg.quaternion); } }
    /* paddle: a rounded triangle, cupped in towards the axis, so the three meet under the cage */
    const tip = curve.getPointAt(1), sh = new THREE.Shape(), W = .032, H = .041;   // each paddle stays inside its third of the bowl, so closed they meet, never cross
    sh.moveTo(-W*.86, 0); sh.quadraticCurveTo(0, -.004, W*.86, 0); sh.quadraticCurveTo(W, .002, W*.9, .008); sh.lineTo(.003, H*.97); sh.quadraticCurveTo(0, H, -.003, H*.97); sh.lineTo(-W*.9, .008); sh.quadraticCurveTo(-W, .002, -W*.86, 0);   // a rounded slice: wide at the arm, its point at the bowl's centre
    const pg = new THREE.ExtrudeGeometry(sh, { depth:.003, bevelEnabled:true, bevelSize:.0012, bevelThickness:.0012, bevelSegments:2, curveSegments:10 }); pg.translate(0, 0, -.0015);
    const along = new THREE.Vector3(-c, -s, -.38).normalize(), nrm = new THREE.Vector3().crossVectors(side, along).normalize();
    const pad = A(pg, blk, tip.x, tip.y, tip.z, "claw_pad"); pad.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(side, along, nrm));
    /* the elbow lug the link pulls on */
    const el = curve.getPointAt(.36).add(new THREE.Vector3(c*.004, s*.004, 0));
    A(BOX(.008, .012, .01), blk2, el.x, el.y, el.z, "claw_link_lug").rotation.z = a;
    arm.userData.clawArm = { side:side.clone(), q0:arm.quaternion.clone() }; arms.push(arm);
    /* link: top ear to elbow, redrawn by the page as the arm turns */
    const ln = C(new THREE.CylinderGeometry(.0024, .0024, 1, 10), blk2, 0, 0, 0, "claw_link");
    links.push({ mesh:ln, a:new THREE.Vector3(RE*c, RE*s, ZT0), arm, b:el.clone() });
  }
  claw.userData.clawRig = { arms, links };
  /* start open, as it waits over the capsules */
  { const open = .55, q = new THREE.Quaternion(), Y = new THREE.Vector3(0, 1, 0), B = new THREE.Vector3(), D = new THREE.Vector3();
    for (const arm of arms){ const u = arm.userData.clawArm; arm.quaternion.copy(u.q0).multiply(q.setFromAxisAngle(u.side, -open)); }
    for (const l of links){ B.copy(l.b).applyQuaternion(l.arm.quaternion).add(l.arm.position); D.copy(B).sub(l.a); l.mesh.position.copy(l.a).add(B).multiplyScalar(.5); l.mesh.scale.y = D.length(); l.mesh.quaternion.setFromUnitVectors(Y, D.normalize()); }
    claw.userData.clawRig.open = open; }
  /* coil cable: tied to a body wall 30 below the clamps, then up beside the line to the Wago on the carriage */
  const CA = Math.PI/3, ccx = LX + .036*Math.cos(CA), ccy = LY + .036*Math.sin(CA), ZT = EYE - .016, coil = [], turns = 28;
  for (const z of [-.016, -.028]){ C(BOX(.003, .012, .003), m("tie", { color:0x0c0c0d, roughness:.6 }), .0155*Math.cos(CA)*1.25, .0155*Math.sin(CA)*1.25, z, "claw_cable_tie", 0, 0, CA); }
  /* the cable starts on the body wall under the two ties (tie radius 19 mm), runs up through them, then bends out to the coil radius */
  { const tr = .0155*1.25, tx = LX + tr*Math.cos(CA), ty = LY + tr*Math.sin(CA);
    coil.push(new THREE.Vector3(tx, ty, CT - .04), new THREE.Vector3(tx, ty, CT - .03), new THREE.Vector3(tx, ty, CT - .014), new THREE.Vector3(tx + (ccx - tx)*.5, ty + (ccy - ty)*.5, CT - .006), new THREE.Vector3(ccx, ccy, CT + .002)); }
  for (let i = 0; i <= turns*16; i++){ const t = i/(turns*16), a = t*turns*2*Math.PI; coil.push(new THREE.Vector3(ccx + .007*Math.cos(a), ccy + .007*Math.sin(a), CT + .008 + t*(ZT - .03 - (CT + .008)))); }
  coil.push(new THREE.Vector3(ccx, ccy, ZT), new THREE.Vector3(ccx + .006, ccy - .004, EYE - .006), new THREE.Vector3(XC - .006, mm(MP.Y_REF - 29), EYE + .0005));
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coil, false, "centripetal"), 1800, .0016, 8), m("coil", { color:0x0e0f12, roughness:.38, metalness:.15 }), 0, 0, 0, 0, 0, 0, "claw_coil_cable");


  /* =========================================================================================== play camera: webcams on the top tubes */
  use("camera");
  /* two 1080p webcams: front on the top tube, side inside under the right top tube, each on a flat bar tab */
  /* two webcams. Camera 1 in the back right top corner, turned to the middle of the floor. Camera 2 on the carriage plate, straight down. */
  { const c920 = () => m("c920", { color:0x111215, roughness:.35, metalness:.2 });
    const lensM = () => m("camlens", { color:0x0a1430, roughness:.05, metalness:.9, emissive:0x16286a, emissiveIntensity:.5 }), faceM = () => m("camface", { color:0x050507, roughness:.1, metalness:.3 }), ringM = () => m("camring", { color:0x9aa0aa, roughness:.3, metalness:1 });
    /* a C920 shape: a 94 mm pill, gloss face, metal lens ring, status light, clip. It looks along local -y. */
    const webcam = (name, x, y, z, rx, rz, view) => { const g = new THREE.Group(); g.name = name; g.position.set(x, y, z); g.rotation.order = "ZXY"; g.rotation.set(rx, 0, rz); G("camera").add(g);
      const A = (geo, mt, px, py, pz) => { const o = add(geo, mt, px, py, pz, 0, 0, 0, name, g); o.userData.view = view; return o; };
      A(new THREE.CapsuleGeometry(.0145, .065, 8, 28).rotateZ(Math.PI/2), c920, 0, 0, 0);
      A(new THREE.CapsuleGeometry(.0105, .062, 6, 24).rotateZ(Math.PI/2).scale(1, .22, 1), faceM, 0, -.0125, 0);
      A(new THREE.CylinderGeometry(.0088, .0088, .004, 32), ringM, 0, -.0145, 0);
      A(new THREE.CylinderGeometry(.0064, .0064, .001, 32), lensM, 0, -.0168, 0);
      A(new THREE.CylinderGeometry(.0013, .0013, .001, 12), () => m("camled", { color:0x9cc0ff, emissive:0x5a8cff, emissiveIntensity:2 }), .02, -.0152, 0);
      A(new THREE.CylinderGeometry(.0013, .0013, .001, 12), () => m("camled", { color:0x9cc0ff, emissive:0x5a8cff, emissiveIntensity:2 }), -.02, -.0152, 0);
      A(BOX(.024, .012, .016), dark, 0, .017, 0); };
    webcam("camera_c920", .3, .3, 1.05, .85, -Math.PI/4, { pos:[.285, .285, 1.03], look:[-.03, -.03, .3] });
    /* camera 2 is on the plate beside the winch, rides the carriage at a fixed height, looks straight down */
    /* it hangs on a short arm below the top ring, or the ring and the skins cut the view at the end of travel */
    webcam("camera_claw", -.041, -.07, 1.08, Math.PI/2, 0, { pos:[-.041, -.07, 1.06], look:[-.041, -.069, .25] });
    box(-.045, -.0605, 1.09, -.037, -.0565, 1.165, dark, "camera_claw_arm"); }


  /* =========================================================================================== cables: the motion build's own routes (mm), at the export pose */
  use("wiring");
  { const V = (x, y, z) => new THREE.Vector3(x, y, z), BACK = MP.BOX_D + 12, LOOP_X = -28, LOOP_L = 1000, HOLE = [60, MP.FLOOR_TOP - 60];
    const UNO = [300, 672, 100 - MP.BOX_H], PI = [550, 672, 135 - MP.BOX_H];                                     // the boards on the electronics plate behind the service door
    const loopPts = (x, Y, z0) => { const sp = BACK - Y, h = Math.max(25, (LOOP_L - sp - 65)/2), pts = []; for (let t = 0; t <= 1.0001; t += .1) pts.push(V(x, Y + sp*t, z0 + (-40 - z0)*t - h*Math.sin(Math.PI*t))); return pts; };
    const toCtrl = (x, k, t = UNO) => { const zh = HOLE[1] - k*3; return [V(x, BACK, -40), V(x, BACK, zh), V(HOLE[0] + k*4, BACK, zh), V(HOLE[0] + k*4, 690, zh), V(t[0] + k*4, 690, t[2] + 8), V(t[0] + k*4, t[1], t[2] + 8)]; };
    const Y = MP.Y_REF, X = MP.X_REF, yc = Y - (MP.CHAIN_A[0] + MP.CHAIN_A[1])/2, [a, b, c] = [MP.PLUG_YL, MP.PLUG_YR, MP.ES_Y];
    const px = MP.PLUG_X, ex = MP.ES_X, pw = MP.PLUG_W, ez = MP.ES_Z;
    const cm = V(X, yc, MP.ZT_X + MP.Z_HI + 9), cf = V(MP.CHAIN_FIX_X - 10, yc, MP.ZT_X + MP.Z_LO);
    const hz = (k, start) => [...start, V(LOOP_X - k*3, Y + 4*k, 26), ...loopPts(LOOP_X - k*3, Y + 4*k, 26).slice(1), ...toCtrl(LOOP_X - k*3, k)];
    const slot = Y + 8, lowSlot = MP.ZT_X - 30;
    const R = {
      yl:[[0xf28c28, 2.6], [V(...a), V(a[0], a[1], a[2] + 10), V(a[0], BACK, a[2] + 10), ...toCtrl(a[0], 0)]],
      yes:[[0x3fa34d, 1.4], [V(c[0], c[1], c[2] - 18), V(-6, c[1], 8), V(-6, BACK, 8), ...toCtrl(-6, 1)]],
      yr:[[0xd6a019, 2.6], [V(...b), V(b[0], b[1], b[2] + 10), V(b[0], BACK, b[2] + 10), ...toCtrl(b[0], 2)]],
      x:[[0x2b8cd6, 2.6], hz(0, [V(...px), V(px[0], px[1], px[2] + 12), V(LOOP_X, px[1], px[2] + 12)])],
      xes:[[0x66c27a, 1.4], hz(1, [V(...ex), V(ex[0], slot, lowSlot), V(6, slot, lowSlot), V(LOOP_X - 3, slot, 70)])],
      w1:[[0x7a4fd6, 2.6], [V(...pw), V(pw[0], pw[1], pw[2] + 14), V(pw[0], yc, pw[2] + 14), cm]], w2:[[0x7a4fd6, 2.6], hz(2, [cf, V(30, yc, 72), V(LOOP_X - 6, yc, 72)])],
      z1:[[0x9ad47a, 1.4], [V(...ez), V(ez[0], ez[1] - 6, ez[2] + 70), V(ez[0], yc - 4, MP.ZT_X + 72), V(X - 4, yc - 4, cm.z)]], z2:[[0x9ad47a, 1.4], hz(3, [V(cf.x, cf.y - 4, cf.z), V(30, yc - 4, 74), V(LOOP_X - 9, yc - 4, 74)])],
      a1:[[0x1c1b19, 2.0], [V(X + MP.WSIGN*MP.EYE_W, Y - MP.EYE_A, MP.ZT_X + 70), V(X + 6, yc + 4, cm.z)]], a2:[[0x1c1b19, 2.0], hz(4, [V(cf.x, cf.y + 4, cf.z), V(30, yc + 4, 76), V(LOOP_X - 12, yc + 4, 76)])],
      /* the cameras' USB: along the top of the top tubes to the back, then down the back like the rest */
      cam:[[0x141416, 2.0], [V(350, 12, 24), V(200, 10, 22), V(40, 10, 22), V(10, 40, 22), V(10, 660, 22), V(10, BACK, 6), ...toCtrl(10, 0, PI)]],
      cams:[[0x141416, 2.0], [V(660, 350, -66), V(676, 350, -30), V(690, 350, 22), V(690, 660, 22), V(660, BACK, 6), ...toCtrl(660, 1, PI)]],
    };
    for (const [k, [[col, r], pts]] of Object.entries(R)){ const P = pts.map(v => new THREE.Vector3(mm(v.x), mm(v.y), mz(v.z)));
      add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P, false, "centripetal"), Math.max(24, P.length*8), r/1000, 8, false), m("cable" + k.replace(/\d/, ""), { color:col, roughness:.55 }), 0, 0, 0, 0, 0, 0, "wire_" + k); } }

  return { parts, capsules, dims:{ FZ, FT, HX0, HX1, HY0, HY1, CR, XC, YC, CT, LX, LY, IN, PY1 } };
}
