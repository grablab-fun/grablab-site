/* ============ Prototype 01, metal build (Oct 29 2026): the welded steel cabinet and the motion system come straight from the
   motion build's exact geometry (assets/machine/metal.json, mm, z 0 = top of the top ring); the service door, electronics,
   chute, claw and capsules are modelled here from the build tutorial.
   Units: metres. z up, ground at 0. Front (windows, prize hole) is -y, rear (service door) is +y, left is -x.
   Every mesh is named, so the card items can pick them. */
export function buildMachine(THREE, api){
  const { mat, onFont } = api;
  const parts = {};
  const G = id => parts[id] ||= Object.assign(new THREE.Group(), { name:id });
  let PART = "frame";
  const use = id => { PART = id; };

  /* sub-groups that shift a part as a whole (the door plates, the electronics board and the chute insert sit at fixed offsets in the metal box) */
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
  const toM = p => { for (let i = 0; i < p.length; i += 3){ p[i] = p[i]/1000 - .5; p[i + 1] = p[i + 1]/1000 - .5; p[i + 2] = (p[i + 2] + 1130)/1000; } };
  /* keep: optional test on each triangle's centre (mm), to leave parts of a mesh out */
  const mgeo = (n, keep) => { const d = SD.meshes[n]; if (!d) return null; const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(b64(d.v, Float32Array), 3)); g.setIndex(new THREE.BufferAttribute(b64(d.i, d.i32 ? Uint32Array : Uint16Array), 1));
    let f = g.toNonIndexed(); g.dispose();
    if (keep){ const P = f.attributes.position.array, out = []; for (let i = 0; i < P.length; i += 9) if (keep((P[i] + P[i + 3] + P[i + 6])/3, (P[i + 1] + P[i + 4] + P[i + 7])/3, (P[i + 2] + P[i + 5] + P[i + 8])/3)) for (let k = 0; k < 9; k++) out.push(P[i + k]);
      f.dispose(); f = new THREE.BufferGeometry(); f.setAttribute("position", new THREE.Float32BufferAttribute(out, 3)); }
    toM(f.attributes.position.array); f.computeVertexNormals(); return f; };
  const sm = (n, mt, name, parent, keep) => { const g = mgeo(n, keep); return g ? add(g, mt, 0, 0, 0, 0, 0, 0, name, parent) : null; };
  const SM = (list, mt, name) => list.forEach(n => sm(n, mt, name));
  const LR = a => a.flatMap(n => [n + "_L", n + "_R"]);
  const mm = v => v/1000 - .5, mz = z => (z + 1130)/1000;
  const steelT = () => m("tube", { color:0x16171b, roughness:.52, metalness:.55 });          // powder coated, matte black
  const pvc = () => m("pvc", { color:0x101114, roughness:.8, metalness:0 });
  const rivetM = () => m("rivet", { color:0x9ea3ad, roughness:.35, metalness:.9 });
  const pulleyM = () => m("pulley", { color:0xb3b8c2, roughness:.28, metalness:1 });

  /* =========================================================================================== frame: welded 25 x 25 steel tube */
  use("frame");
  SM(["FL", "FR", "BL", "BR"].map(c => "box_post_" + c), steelT, "frame_post");
  for (const l of ["ground", "floor", "lip", "top"]) SM(["F", "B", "L", "R"].map(s => `box_${l}_${s}`), steelT, "frame_rail");
  SM(["box_floor_X0", "box_floor_X1", "box_floor_chuteL", "box_floor_chuteB"], steelT, "frame_floor_rail");
  sm("boxhw_feet", steel, "frame_foot");

  /* =========================================================================================== front panel: the front base skin, with the E-stop, the QR and the GRABLAB plate */
  use("panel");
  /* the plates and the E-stop sit on the front base skin, under the window: built facing +y, turned round to face the player at -y, outer face at y -503 */
  { const g = new THREE.Group(); g.name = "panel_plates"; g.position.set(0, .009, -.02); g.rotation.z = Math.PI; G("panel").add(g); SUBP.panel = g; }
  sm("box_skin_F", pvc, "panel_skin", G("panel"));
  const IN = .50, PY1 = .512;                                     // inner face (components) and outer face (E-stop, QR, GRABLAB)
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
  /* =========================================================================================== electronics behind the service door, left to right */
  use("electronics");
  /* one plate on the inside of the back tubes, between the ground and the floor ring */
  { const g = new THREE.Group(); g.name = "el_board"; g.position.set(0, -.025, -.02); G("electronics").add(g); SUBP.electronics = g; }
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
  const FZ = .238, FT = .012, HX0 = mm(MP.CHUTE[0]), HX1 = mm(MP.CHUTE[1]), HY0 = mm(MP.CHUTE[2]), HY1 = mm(MP.CHUTE[3]);   // floor top at 250, 243 x 243 hole front right
  sm("box_floor", pvc, "cage_floor");
  SM(["box_prize_L", "box_prize_B"], pvc, "cage_prize_wall");
  sm("box_skin_L", pvc, "cage_skin");
  /* the right skin, cut round the prize bin door opening (y -440 to 200, z 35 to 210 from the centre / ground) */
  for (const [y0, y1, z0, z1] of [[-.5, .5, 0, .035], [-.5, .5, .21, .35], [-.5, -.44, .035, .21], [.2, .5, .035, .21]]) box(.5, y0, z0, .503, y1, z1, pvc, "cage_skin");
  sm("box_skin_B", pvc, "cage_door"); sm("boxhw_door", rivetM, "cage_door_rivnut");          // the back base skin is the service door
  sm("box_back_cage", pvc, "cage_showcase");
  sm("box_left_cage", acrylic, "cage_window");
  SM(["box_glass_F", "box_glass_R"], acrylic, "cage_window");
  SM(["boxhw_floor", "boxhw_glass"], rivetM, "cage_rivet");
  sm("boxhw_skins", rivetM, "cage_rivet", null, (x, y, z) => z < -920 || z > -870);     // no row on the floor ring: it read as specks in the middle of the base panels

  /* =========================================================================================== chute, cradle, prize cup */
  use("chute");
  /* the first chute design, built round a 120 mm opening and moved under the centre of the 243 mm hole; the floor frame is its top */
  const CHG = new THREE.Group(); CHG.name = "chute_insert"; CHG.position.set(.0135, -.0135, 0); G("chute").add(CHG); SUBP.chute = CHG;
  { const FZ = .222, HX0 = .28, HX1 = .40, HY0 = -.40, HY1 = -.28;
  const CZ0 = .172, CZ1 = FZ, WT = .012;                                 // a 50 deep chute under the floor frame, so the long prize bin fits under it
  const wall = m("wall", { color:0x17181c, roughness:.9, metalness:0 }); wall.userData.xray = .28;      // see-through when the chute is isolated
  box(HX0 - WT, HY0 - WT, CZ0, HX1 + WT, HY0, CZ1, wall, "chute_wall"); /* rear wall with a small acrylic window: the landing camera films from outside, out of the capsule's way */
  const WX0 = .30, WX1 = .38, WZ0 = .178, WZ1 = .214;
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
  rb(.291, Y1, CB - .02, .389, Y1 + .011, CB + .043, m("acr", { color:0x141518, roughness:.42 }), "chute_acr122u", .005);
  const acrl = label("acr", .06, .04, (g, w, h) => { g.fillStyle = "#141518"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(150,185,255,.6)"; g.lineWidth = h*.022;
    for (let i = 0; i < 4; i++){ g.beginPath(); g.arc(w/2, h/2, h*(.12 + i*.09), -Math.PI*.3, Math.PI*.3); g.stroke(); g.beginPath(); g.arc(w/2, h/2, h*(.12 + i*.09), Math.PI*.7, Math.PI*1.3); g.stroke(); } }, { transparent:true });
  add(new THREE.PlaneGeometry(.06, .04), acrl, .34, Y1 + .0112, CB + .012, ...FACE_POS_Y, "chute_acr122u_top");
  add(cylY(.0022, .0008, 16), led(0x52d96b), .375, Y1 + .0113, CB + .036, 0, 0, 0, "chute_acr122u_led");
  for (const x of [.296, .384]) add(cylY(.0028, .0012, 12), dark, x, Y1 + .0115, CB + .04, 0, 0, 0, "chute_acr122u_screw");
  /* trapdoor: hinged on the front edge, held shut by the servo; it swings down and the capsule drops straight into the bin */
  const AXZ = CB + .0015, AY = Y0 + .007;
  const flapM = m("flapM", { color:0x4a4f5c, roughness:.42, metalness:.08 });
  /* the trapdoor, its pad, hinge barrel and lever turn together around the axle (the page swings it open to show how it works) */
  const trap = new THREE.Group(); trap.name = "chute_trap"; trap.position.set(0, AY, AXZ); trap.userData.trap = true; CHG.add(trap);
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
  const hornP = new THREE.Group(); hornP.name = "chute_horn_pivot"; hornP.position.set(SX0 - .0055, shY, SZ0); CHG.add(hornP);
  add(rbox(.0014, .006, .0185, .0025), m("horn", { color:0xf2f2f4, roughness:.5 }), 0, 0, .00625, 0, 0, 0, "chute_horn", hornP);
  for (const dz of [.006, .0115]) add(cylX(.0007, .0016, 8), dark, 0, 0, dz, 0, 0, 0, "chute_horn_hole", hornP);
  /* pushrod: a straight steel link on the outer faces, a pin into the horn hole and one into the lever hole */
  const rod = add(new THREE.CylinderGeometry(.0008, .0008, 1, 10), steel, 0, 0, 0, 0, 0, 0, "chute_pushrod");
  const pins = [0, 1].map(() => add(cylX(.0007, .004, 8), steel, 0, 0, 0, 0, 0, 0, "chute_pushrod_pin"));
  trap.userData.link = { rod, pins, horn:hornP, lever:new THREE.Vector3(X1 + .003, .001, .018), rx:X1 + .0052 };
  { const L = trap.userData.link, A = new THREE.Vector3(L.rx, shY, SZ0 + .0115), B = new THREE.Vector3(L.rx, AY + .001, AXZ + .018), d = B.clone().sub(A);
    rod.position.copy(A).add(B).multiplyScalar(.5); rod.scale.y = d.length(); rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    pins[0].position.set(L.rx - .0015, A.y, A.z); pins[1].position.set(L.rx - .0015, B.y, B.z); }
  /* C960 clipped to the rear wall at the top, 250 above the flap, looking down at it; its cable leaves through a grommet */
  /* landing camera outside the chute, behind the window, on a printed L bracket, looking down at the flap */
  /* a printed shelf under the camera, held to the wall by two side plates that stay clear of the window */
  /* the shelf has a notch at the front, so the lens looks down through it */
  rb(.29, HY1 + WT + .021, .181, .39, HY1 + WT + .036, .185, petg, "chute_c960_clip", .002);
  rb(.29, HY1 + WT, .181, .322, HY1 + WT + .022, .185, petg, "chute_c960_clip", .002); rb(.358, HY1 + WT, .181, .39, HY1 + WT + .022, .185, petg, "chute_c960_clip", .002);
  for (const x of [.286, .39]) rb(x, HY1 + WT, .161, x + .004, HY1 + WT + .036, .189, petg, "chute_c960_clip", .0015);
  for (const x of [.288, .392]) for (const z of [.167, .181]) add(cylY(.0022, .0012, 10), dark, x, HY1 + WT + .036 + .0006, z, 0, 0, 0, "chute_c960_clip_screw");
  const cam = new THREE.Group(); cam.position.set(.34, HY1 + WT + .024, .202); cam.rotation.set(-2.43, 0, 0); CHG.add(cam);
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
    const ln = new THREE.LineSegments(lg, m("viewline", { color:0x9cc0ff, emissive:0x3b7bff, emissiveIntensity:1, transparent:true, opacity:.35, depthWrite:false, toneMapped:false })); ln.userData.part = "chute"; ln.name = "chute_c960_view"; ln.raycast = () => {}; CHG.add(ln); }

  }
  delete SUBP.chute;
  /* a funnel from the edges of the 243 hole down to the chute mouth */
  { const ft = .2495, fb = .2225, O = [[HX0, HY0, ft], [HX1, HY0, ft], [HX1, HY1, ft], [HX0, HY1, ft]], I = [[.2815, -.4255, fb], [.4255, -.4255, fb], [.4255, -.2815, fb], [.2815, -.2815, fb]], pos = [];
    for (let i = 0; i < 4; i++){ const j = (i + 1) % 4; pos.push(...O[i], ...O[j], ...I[j], ...O[i], ...I[j], ...I[i]); }
    const fg = new THREE.BufferGeometry(); fg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); fg.computeVertexNormals();
    add(fg, m("funnel", { color:0x2b2e36, roughness:.35, metalness:.2, side:THREE.DoubleSide }), 0, 0, 0, 0, 0, 0, "chute_funnel"); }
  /* the prize bin: long and low under the play floor, about 32 litres (room for every capsule in the machine), on two rails, emptied through a door in the right skin */
  const binM = () => m("binM", { color:0x2b2e36, roughness:.5, metalness:.05 }), QX0 = .05, QX1 = .465, QY0 = -.465, QY1 = .3, QZ0 = .008, QZ1 = .118;
  rb(QX0, QY0, QZ0, QX1, QY1, QZ0 + .005, binM, "chute_bin", .012);
  rb(QX0, QY0, QZ0 + .005, QX0 + .005, QY1, QZ1, binM, "chute_bin", .002); rb(QX1 - .005, QY0, QZ0 + .005, QX1, QY1, QZ1, binM, "chute_bin", .002);
  rb(QX0, QY0, QZ0 + .005, QX1, QY0 + .005, QZ1, binM, "chute_bin", .002); rb(QX0, QY1 - .005, QZ0 + .005, QX1, QY1, QZ1, binM, "chute_bin", .002);
  rb(QX1, -.1, .07, QX1 + .004, -.02, .09, binM, "chute_bin_handle", .002);
  for (const x of [QX0 + .03, QX1 - .055]) box(x, -.475, 0, x + .025, .475, QZ0, steelT, "chute_bin_rail");
  use("cage");
  /* the door turns on its hinge pins (the page swings it open while its card item is picked) */
  const binDoor = new THREE.Group(); binDoor.name = "cage_bin_door_pivot"; binDoor.position.set(.509, .204, 0); binDoor.userData.binDoor = true; G("cage").add(binDoor);
  const BD = (x0, y0, z0, x1, y1, z1, mt, nm) => box(x0 - .509, y0 - .204, z0, x1 - .509, y1 - .204, z1, mt, nm, binDoor);
  BD(.5035, -.44, .035, .5075, .2, .21, pvc, "cage_bin_door");
  for (const z of [.06, .185]){ BD(.503, .19, z - .012, .509, .2, z + .012, steel, "cage_bin_door_hinge"); box(.507, .199, z - .012, .511, .209, z + .012, steel, "cage_bin_door_hinge"); add(cylZ(.0018, .03, 10), steel, .509, .204, z, 0, 0, 0, "cage_bin_door_hinge_pin"); }
  BD(.5075, -.42, .11, .5135, -.4, .14, steel, "cage_bin_door_knob");
  /* the E-stop cable: from the switch at the front, under the floor, to the supply behind the service door */
  long(() => { harness([[.35, -.444, .195], [.27, -.444, .2], [.27, .38, .2], [-.2475, .38, .2], [-.2475, .41, .12], [-.2475, .423, .088], [-.2735, .423, .088]], .0015, wireR, "el_wire_estop");
    harness([[.35, -.444, .21], [.26, -.444, .212], [.26, .385, .212], [-.3145, .385, .212], [-.3145, .455, .2195]], .0015, wireR, "el_wire_estop"); });

  /* =========================================================================================== capsules: clear, one colour, size not fixed */
  use("capsules");
  const capsules = [], CR = .025;
  /* printed white shell: matte, layer lines (a stripe map along the latitude), five small holes on the lid, a seam where the halves meet */
  const layerT = canvasTex(8, 64, (g, W, H) => { g.fillStyle = "#ffffff"; g.fillRect(0, 0, W, H); for (let y = 0; y < H; y += 4){ g.fillStyle = "rgba(120,118,112,.22)"; g.fillRect(0, y, W, 1); } });
  layerT.wrapS = layerT.wrapT = THREE.RepeatWrapping; layerT.repeat.set(1, 6);
  const shell = m("shell", { color:0xf2f1ec, map:layerT, roughness:.68, metalness:0, side:THREE.DoubleSide });
  const tagT = new THREE.TextureLoader().load("assets/nfc-tag.png?v=1"); tagT.colorSpace = THREE.SRGBColorSpace; tagT.anisotropy = 8;
  const tagM = m("tag", { map:tagT, alphaTest:.4, roughness:.6, metalness:0 });
  const gTop = new THREE.SphereGeometry(CR, 36, 16, 0, Math.PI*2, 0, Math.PI/2).rotateX(Math.PI/2), gBot = new THREE.SphereGeometry(CR, 36, 16, 0, Math.PI*2, Math.PI/2, Math.PI/2).rotateX(Math.PI/2);
  const gHoles = (() => { const pos = [], nor = [], q = new THREE.Quaternion(), Z = new THREE.Vector3(0, 0, 1);
    for (let k = 0; k < 5; k++){ const ph = k*Math.PI*2/5 + .3, th = .62, n = new THREE.Vector3(Math.sin(th)*Math.cos(ph), Math.sin(th)*Math.sin(ph), Math.cos(th)), c = n.clone().multiplyScalar(CR + .00012);
      const d = new THREE.CircleGeometry(.0017, 14).toNonIndexed(); q.setFromUnitVectors(Z, n); d.applyQuaternion(q); d.translate(c.x, c.y, c.z);
      pos.push(...d.attributes.position.array); nor.push(...d.attributes.normal.array); d.dispose(); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3)); return g; })();
  const gSeam = new THREE.TorusGeometry(CR + .00005, .00028, 6, 48), holeM = m("hole", { color:0x2e2d2b, roughness:.9 }), seamM = m("seam", { color:0xb9b7b0, roughness:.8 });
  const gTag = new THREE.CircleGeometry(.0105, 32);
  let seed = 11; const rnd = () => (seed = (seed*16807) % 2147483647)/2147483647;
  /* a heap, not a grid: balls dropped one by one at random spots (more towards the middle), each settles on the floor or on the
     balls under it; of a few tries per ball the lowest wins, so holes fill first and a soft mound grows. Seeded, so it is the same every load. */
  const Lc = .471 - CR, spots = [], z0 = FZ + FT + CR + .0002, D2 = 4*CR*CR;
  const clear = (x, y) => !(x > HX0 - .004 - CR && y < HY1 + .004 + CR);
  let hs = 23; const hr = () => (hs = (hs*16807) % 2147483647)/2147483647;
  const restZ = (x, y) => { let z = z0; for (const [bx, by, bz] of spots){ const dd = (x - bx)**2 + (y - by)**2; if (dd < D2) z = Math.max(z, bz + Math.sqrt(D2 - dd) + .0001); } return z; };
  for (let n = 0; n < 470; n++){ let best = null;
    for (let t = 0; t < 7; t++){ const g = () => (hr() + hr() + hr() - 1.5)/1.5, x = Math.max(-Lc, Math.min(Lc, -.06 + g()*.62)), y = Math.max(-Lc, Math.min(Lc, .05 + g()*.62));
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
    const hl = new THREE.Mesh(gHoles, holeM), sm2 = new THREE.Mesh(gSeam, seamM);
    lidG.add(t, hl);
    /* NFC sticker on the outside of the lower half, on the side that turns to you when the capsule opens */
    const tg = new THREE.Mesh(gTag, tagM); tg.position.set(0, 0, -CR*.55);                     // lying on the inside floor of the lower half
    [t, b, tg, hl, sm2].forEach(mm => { mm.userData.part = "capsules"; mm.name = o.name; });
    o.add(b, tg, sm2); o.userData.lid = lidG; o.userData.q0 = o.quaternion.clone(); o.userData.cap = true; o.userData.part = "capsules";
    G("capsules").add(o); capsules.push(o);
  });


  /* =========================================================================================== XY gantry: the motion build, at its export pose */
  use("gantry");
  SM(["rail_L", "rail_R"], alu, "gantry_y_rail");
  sm("beam", alu, "gantry_x_beam");
  SM([...LR(["ymotorblock", "yidlerblock"]), "xmotorblock", "xidlerblock"], petg, "gantry_block");
  sm("boxhw_blocks", dark, "gantry_block_bolt");
  SM([...LR(["yfix_m", "yfix_i", "ymotorfix", "ysaddlefix", "ycapfix"]), "xfix_m", "xfix_i", "xmotorfix", ...[0, 1, 2, 3, 4, 5].map(i => "ledgefix_" + i)], dark, "gantry_screw");
  SM([...LR(["ymotor"]), "xmotor"], nema, "gantry_motor"); SM([...LR(["yshaft"]), "xshaft"], steel, "gantry_motor_shaft");
  SM([...LR(["ypulley"]), "xpulley"], pulleyM, "gantry_pulley");
  SM([...LR(["yidler"]), "xidler"], steel, "gantry_idler"); SM([...LR(["yspacer"]), "xspacer"], petg, "gantry_idler_spacer"); SM([...LR(["yaxle"]), "xaxle"], steel, "gantry_idler_axle");
  for (const e of ["yes", "xes"]){ sm(e + "_adapter", petg, "gantry_endstop"); sm(e + "_board", pcbRed, "gantry_endstop"); sm(e + "_switch", sw, "gantry_endstop"); sm(e + "_lever", steel, "gantry_endstop"); sm(e + "_fix", dark, "gantry_endstop"); }
  SM(LR(["ycart_plate"]), plate, "gantry_y_carriage"); SM(LR(["ycart_wheels"]), pom, "gantry_y_wheel"); SM(LR(["ycart_hw"]), steel, "gantry_y_carriage_hw");
  SM(LR(["ysaddle"]), petg, "gantry_saddle"); SM(LR(["ybolts"]), dark, "gantry_saddle_bolt"); SM(LR(["ycap"]), petg, "gantry_belt_cap");
  SM([0, 1, 2, 3, 4, 5].map(i => "ledge_" + i), petg, "gantry_chain_ledge");
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
    add(f, m("beltd", { color:0x0b0b0c, roughness:.85, metalness:0, side:THREE.DoubleSide }), 0, 0, 0, 0, 0, 0, name); };
  beltLoop(MP.Y_IDLER - MP.Y_SHAFT, 0, [MP.CL, MP.Y_SHAFT, MP.ZT_Y], "gantry_y_belt");
  beltLoop(MP.Y_SHAFT - MP.Y_IDLER, 180, [MP.CR, MP.Y_SHAFT, MP.ZT_Y], "gantry_y_belt");
  beltLoop(MP.X_IDLER - MP.X_SHAFT, -90, [MP.X_SHAFT, MP.Y_REF, MP.ZT_X], "gantry_x_belt");
  /* drag chain on the ledges behind the beam: fixed at the left, a U turn, the top run back to the cart */
  { const N = Math.round(MP.CHAIN_LEN/18.1), Pc = MP.CHAIN_LEN/N, zlo = MP.Z_LO, zhi = MP.Z_HI, zm = (zlo + zhi)/2, R = (zhi - zlo)/2, Xc = MP.X_REF;
    const Lp = MP.CHAIN_LEN - Math.PI*R, xb = (MP.CHAIN_FIX_X + Xc + Lp)/2, y = MP.Y_REF - (MP.CHAIN_A[0] + MP.CHAIN_A[1])/2, l1 = xb - MP.CHAIN_FIX_X, l2 = Math.PI*R;
    const geo = BOX((Pc - 1.6)/1000, MP.CHAIN_W/1000, MP.CHAIN_H/1000), cm = m("chain", { color:0x131416, roughness:.55 });
    for (let i = 0; i < N; i++){ const s = (i + .5)*Pc; let x, z, ang;
      if (s < l1){ x = MP.CHAIN_FIX_X + s; z = zlo; ang = 0; } else if (s < l1 + l2){ const q = -Math.PI/2 + (s - l1)/R; x = xb + R*Math.cos(q); z = zm + R*Math.sin(q); ang = q + Math.PI/2; } else { x = xb - (s - l1 - l2); z = zhi; ang = Math.PI; }
      add(geo, cm, mm(x), mm(y), mz(MP.ZT_X + z), 0, -ang, 0, "gantry_drag_chain"); } }

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
    const curve = new THREE.CatmullRomCurve3([P(0, 0), P(.016, -.01), P(.028, -.034), P(.027, -.06), P(.014, -.082), P(-.006, -.094)]);
    const nSeg = 26, L = curve.getLength(), slotM = m("slot", { color:0x060607, roughness:.9 });
    for (let i = 0; i < nSeg; i++){ const t = (i + .5)/nSeg, p = curve.getPointAt(t), d = curve.getTangentAt(t);
      const seg = A(BOX(.0042, .02, L/nSeg + .0012), blk, p.x, p.y, p.z, "claw_finger");
      const q1 = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), d), yA = new THREE.Vector3(0, 1, 0).applyQuaternion(q1);
      seg.quaternion.copy(q1).premultiply(new THREE.Quaternion().setFromUnitVectors(yA, side.clone().projectOnPlane(d).normalize()));
      if (i === 9 || i === 16){ const sl = A(BOX(.0046, .008, .005), slotM, p.x, p.y, p.z, "claw_finger_slot"); sl.quaternion.copy(seg.quaternion); } }
    /* paddle: a rounded triangle, cupped in towards the axis, so the three meet under the cage */
    const tip = curve.getPointAt(1), sh = new THREE.Shape(), W = .03, H = .05;
    sh.moveTo(-.008, 0); sh.lineTo(.008, 0); sh.lineTo(W*.9, H*.78); sh.quadraticCurveTo(W*1.02, H*.97, W*.72, H); sh.quadraticCurveTo(0, H*1.07, -W*.72, H); sh.quadraticCurveTo(-W*1.02, H*.97, -W*.9, H*.78); sh.lineTo(-.008, 0);   // rounded triangle: narrow at the arm, wide at the edge
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
  coil.push(new THREE.Vector3(ccx, ccy, CT - .03), new THREE.Vector3(ccx, ccy, CT - .024));
  for (let i = 0; i <= turns*16; i++){ const t = i/(turns*16), a = t*turns*2*Math.PI; coil.push(new THREE.Vector3(ccx + .007*Math.cos(a), ccy + .007*Math.sin(a), CT - .018 + t*(ZT - .03 - (CT - .018)))); }
  coil.push(new THREE.Vector3(ccx, ccy, ZT), new THREE.Vector3(ccx + .006, ccy - .004, EYE - .006), new THREE.Vector3(XC - .006, mm(458), EYE + .0005));
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coil, false, "centripetal"), 1800, .0016, 8), m("coil", { color:0x0e0f12, roughness:.38, metalness:.15 }), 0, 0, 0, 0, 0, 0, "claw_coil_cable");


  /* =========================================================================================== play camera: webcam under a printed block in the front left corner of the top ring */
  use("camera");
  const TOPZ = mz(-25);                                   // underside of the top ring
  box(-.475, -.475, TOPZ - .04, -.415, -.415, TOPZ, petg, "camera_block");
  const cg = new THREE.Group(); cg.position.set(-.445, -.445, TOPZ - .052); cg.rotation.z = -Math.PI/4; G("camera").add(cg);
  const c2 = new THREE.Group(); c2.rotation.x = -.78; cg.add(c2);
  add(BOX(.04, .03, .012), dark, 0, -.004, .006, 0, 0, 0, "camera_clip", cg); add(BOX(.03, .004, .022), dark, 0, -.017, -.005, 0, 0, 0, "camera_clip", cg);
  add(new THREE.CapsuleGeometry(.0145, .066, 8, 16).rotateZ(Math.PI/2), m("c920", { color:0x111215, roughness:.35, metalness:.2 }), 0, 0, -.008, 0, 0, 0, "camera_c920", c2);
  add(new THREE.CapsuleGeometry(.0128, .062, 8, 16).rotateZ(Math.PI/2).scale(1, .35, .92), m("face", { color:0x050507, roughness:.08, metalness:.3, clearcoat:1, clearcoatRoughness:.05 }, true), 0, .0108, -.008, 0, 0, 0, "camera_c920_face", c2);
  add(cylY(.0095, .006, 40), nemaCap, 0, .0145, -.008, 0, 0, 0, "camera_c920_lens_ring", c2);
  add(cylY(.0078, .0062, 40), lens, 0, .0149, -.008, 0, 0, 0, "camera_c920_lens", c2);
  add(cylY(.0048, .001, 32), m("glass", { color:0x2a3f8c, roughness:.02, metalness:.9, emissive:0x1a2a66, emissiveIntensity:.4 }), 0, .0181, -.008, 0, 0, 0, "camera_c920_glass", c2);
  for (const dx of [-.026, .026]) add(cylY(.0016, .001, 12), m("mic", { color:0x1a1b1f, roughness:.4, metalness:.6 }), dx, .0153, -.008, 0, 0, 0, "camera_c920_mic", c2);
  add(cylY(.0012, .001, 12), led(0xffffff), .016, .0153, -.008, 0, 0, 0, "camera_c920_led", c2);


  /* =========================================================================================== cables: the motion build's own routes (mm), at the export pose */
  use("wiring");
  { const V = (x, y, z) => new THREE.Vector3(x, y, z), BACK = MP.BOX_D + 12, LOOP_X = -28, LOOP_L = 1000, HOLE = [60, MP.FLOOR_TOP - 60];
    const UNO = [300, 955, -1030], PI = [550, 955, -995];                                     // the boards on the electronics plate behind the service door
    const loopPts = (x, Y, z0) => { const sp = BACK - Y, h = Math.max(25, (LOOP_L - sp - 65)/2), pts = []; for (let t = 0; t <= 1.0001; t += .1) pts.push(V(x, Y + sp*t, z0 + (-40 - z0)*t - h*Math.sin(Math.PI*t))); return pts; };
    const toCtrl = (x, k, t = UNO) => { const zh = HOLE[1] - k*3; return [V(x, BACK, -40), V(x, BACK, zh), V(HOLE[0] + k*4, BACK, zh), V(HOLE[0] + k*4, 985, zh), V(t[0] + k*4, 985, t[2] + 8), V(t[0] + k*4, t[1], t[2] + 8)]; };
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
      /* the play camera's USB: along the inside of the left top ring to the back, over it, then down the back like the rest */
      cam:[[0xc0392b, 2.0], [V(55, 55, -70), V(32, 45, -44), V(32, 300, -40), V(32, 960, -40), V(32, 990, 6), V(32, BACK, 6), ...toCtrl(32, 0, PI)]],
    };
    for (const [k, [[col, r], pts]] of Object.entries(R)){ const P = pts.map(v => new THREE.Vector3(mm(v.x), mm(v.y), mz(v.z)));
      add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P, false, "centripetal"), Math.max(24, P.length*8), r/1000, 8, false), m("cable" + k.replace(/\d/, ""), { color:col, roughness:.55 }), 0, 0, 0, 0, 0, 0, "wire_" + k); } }

  return { parts, capsules, dims:{ FZ, FT, HX0, HX1, HY0, HY1, CR, XC, YC, CT, LX, LY, IN, PY1 } };
}
