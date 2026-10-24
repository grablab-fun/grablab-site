/* Grablab Prototype 01 Rev B as a SimArena scene (simarena/scene@1.0, MuJoCo underneath).
   node claw-scene-revb.js -> writes grablab-claw-revb.scene.json + grablab-claw-revb-mech.asset.json next to this file
   Same machine as docs/prototype01-revb/render_revb.py (Blender), converted to SimArena units:
   Blender x,y in 0..1 with the front at y = 0 become X = x - .5, Y = y - .5 here. Metres, z up, the front faces -y.
   Open 2020 aluminium frame, 1000 mm cube, no glass. Raised black MDF floor at 150 mm, control box across the front
   base, chute in the front right corner (collar, funnel, tube, ramp, NFC cradle, servo flap), H-bot gantry on top
   (two Y rails, a 2040 X beam, a carriage with the Z winch), the claw on a line with a blue coil cable.
   Controls (press Run, click the claw): arrow keys move it, sliders claw/lift (velocity, left = down) and claw/grip
   (left opens, centre closes on the spring grip). */
function buildRevBScene(assetUrl = "grablab-claw-revb-mech.asset.json"){
  let seed = 11; const rnd = () => (seed = (seed*16807) % 2147483647) / 2147483647;
  const r4 = v => Math.round(v*1e4)/1e4;
  const q = (ax, a) => [Math.cos(a/2), ax[0]*Math.sin(a/2), ax[1]*Math.sin(a/2), ax[2]*Math.sin(a/2)].map(r4);
  const qmul = (a, b) => [a[0]*b[0]-a[1]*b[1]-a[2]*b[2]-a[3]*b[3], a[0]*b[1]+a[1]*b[0]+a[2]*b[3]-a[3]*b[2],
    a[0]*b[2]-a[1]*b[3]+a[2]*b[0]+a[3]*b[1], a[0]*b[3]+a[1]*b[2]-a[2]*b[1]+a[3]*b[0]].map(r4);
  /* quat that turns the local z axis onto direction d (for capsules and cylinders laid along a path) */
  const qz = d => { const n = Math.hypot(...d), z = d.map(v => v/n), ax = [-z[1], z[0], 0], s = Math.hypot(ax[0], ax[1]);
    if (s < 1e-6) return z[2] > 0 ? [1,0,0,0] : [0,1,0,0]; return q(ax.map(v => v/s), Math.acos(Math.max(-1, Math.min(1, z[2])))); };

  const material = {
    alu:{rgba:[.035,.035,.045,1],metalness:.75,roughness:.38},          // black anodised 2020 / 2040
    slot:{rgba:[.008,.008,.012,1],metalness:.3,roughness:.7},           // the V-slot grooves
    steel:{rgba:[.62,.63,.66,1],metalness:1,roughness:.26},             // MGN12 rails
    block:{rgba:[.4,.41,.44,1],metalness:1,roughness:.35},
    plastic:{rgba:[.03,.03,.035,1],metalness:.1,roughness:.55},
    plastic2:{rgba:[.06,.06,.07,1],metalness:.1,roughness:.6},
    mdf:{rgba:[.02,.02,.022,1],metalness:0,roughness:.85},
    belt:{rgba:[.015,.015,.015,1],metalness:0,roughness:.85},
    blue:{rgba:[.23,.48,1,1],metalness:1,roughness:.14},                // blue chrome accent (coil cable, collar, LED walls, handle)
    line:{rgba:[.92,.92,.9,1],metalness:0,roughness:.55},               // Dyneema
    orange:{rgba:[.9,.25,.03,1],metalness:.1,roughness:.35},            // claw tips
    acrylic:{rgba:[.8,.86,1,.16],metalness:.1,roughness:.04},
    panel:{rgba:[.05,.06,.09,.62],metalness:.3,roughness:.2},           // smoked front panel: the electronics show through
    shell:{rgba:[.88,.92,1,.26],metalness:.2,roughness:.04},            // capsule glass
    gold:{rgba:[1,.72,.3,1],metalness:1,roughness:.25,emission:.25}, silver:{rgba:[.85,.85,.88,1],metalness:1,roughness:.22,emission:.15},
    coin_blue:{rgba:[.23,.48,1,1],metalness:1,roughness:.2,emission:.35},
    pcb:{rgba:[.03,.2,.08,1],metalness:.2,roughness:.4}, pcb_red:{rgba:[.4,.05,.05,1],metalness:.2,roughness:.4}, pcb_blue:{rgba:[.05,.1,.45,1],metalness:.2,roughness:.4},
    chip:{rgba:[.015,.015,.015,1],metalness:.3,roughness:.3}, psu:{rgba:[.6,.6,.62,1],metalness:.9,roughness:.4},
    lens:{rgba:[.03,.03,.05,1],metalness:.8,roughness:.06},
    red:{rgba:[.8,.03,.03,1],metalness:.1,roughness:.25,emission:.25},
    qr_w:{rgba:[.92,.92,.92,1],metalness:0,roughness:.6}, qr_k:{rgba:[.01,.01,.01,1],metalness:0,roughness:.7},
    led_warm:{rgba:[1,.72,.45,1],emission:2}, led_chute:{rgba:[1,.88,.72,1],emission:1.6}, led_red:{rgba:[1,.15,.1,1],emission:1.5},
    /* the filming room around the machine */
    concrete:{rgba:[.1,.11,.15,1],metalness:.05,roughness:.95}, wall:{rgba:[.06,.07,.11,1],metalness:.12,roughness:.75},
    wall_lt:{rgba:[.1,.12,.18,1],metalness:.15,roughness:.7}, paint:{rgba:[.03,.05,.14,1],metalness:.1,roughness:.6},
    led_blue:{rgba:[.23,.48,1,1],emission:1}, led_cyan:{rgba:[.25,.91,1,1],emission:1}, led_pink:{rgba:[1,.36,.68,1],emission:1}, led_gold:{rgba:[1,.75,.4,1],emission:1},
    cam_body:{rgba:[.04,.05,.08,1],metalness:.45,roughness:.4}, rec:{rgba:[1,.2,.25,1],emission:1.2},
    truss:{rgba:[.28,.31,.4,1],metalness:.8,roughness:.35}, pillar:{rgba:[.08,.1,.17,1],metalness:.3,roughness:.6},
    acoustic:{rgba:[.09,.13,.3,1],metalness:.05,roughness:.95}, glass_room:{rgba:[.75,.82,1,.07],metalness:.1,roughness:.05},
    lamp_body:{rgba:[.05,.06,.09,1],metalness:.6,roughness:.35}, lamp_lens:{rgba:[1,.97,.88,1],emission:2},
    beam_1:{rgba:[1,.95,.82,.09],emission:.6}, beam_2:{rgba:[1,.95,.82,.05],emission:.4}, beam_3:{rgba:[1,.95,.82,.03],emission:.3},
    wood:{rgba:[.22,.16,.12,1],metalness:.05,roughness:.8}, screen:{rgba:[.2,.45,1,1],emission:1.1}, navy2:{rgba:[.06,.1,.29,1],metalness:.35,roughness:.45},
    violet:{rgba:[.6,.48,1,1],metalness:.8,roughness:.3,emission:.4}
  };
  const E = [];
  /* SimArena box size = full extents; B() takes half sizes (MuJoCo style) and doubles them */
  const B = (size, pos, mat, extra) => Object.assign({type:"box", size:size.map(v => r4(v*2)), pos:pos.map(r4), material:mat}, extra);
  /* box from two corners, Blender style (x0,y0,z0,x1,y1,z1), already in SimArena coordinates */
  const BB = (x0, y0, z0, x1, y1, z1, mat, extra) => B([(x1-x0)/2, (y1-y0)/2, (z1-z0)/2], [(x0+x1)/2, (y0+y1)/2, (z0+z1)/2], mat, extra);
  const Bh = (sx, sy, sz, cx, cy, cz, mat, extra) => B([sx/2, sy/2, sz/2], [cx, cy, cz], mat, extra);   // full sizes, centre
  const cyl = (r, h, pos, mat, extra) => Object.assign({type:"cylinder", radius:r4(r), height:r4(h), pos:pos.map(r4), material:mat}, extra);
  const ghost = g => Object.assign(g, {contype:0, conaffinity:0});
  const fixed = (name, geoms) => E.push({name, geoms, collider:{}});
  const QX90 = q([1,0,0], Math.PI/2), QY90 = q([0,1,0], Math.PI/2);

  /* ---------------- frame: 2020 V-slot, 4 posts + top, bottom and floor rings + a floor stringer ---------------- */
  const FR = [];
  /* one extrusion along an axis with a groove on each of its 4 faces */
  function bar(axis, len, c){
    const s = [.01, .01, .01]; const i = {x:0, y:1, z:2}[axis]; s[i] = len/2;
    FR.push(B(s, c, "alu"));
    for (let k = 0; k < 4; k++){
      const g = [.0031, .0031, .0031]; g[i] = len/2 - .004;
      const o = [0, 0, 0]; const other = [0,1,2].filter(j => j !== i); const j = other[k >> 1]; const sg = k & 1 ? 1 : -1;
      g[j] = .0006; o[j] = sg*.0098;
      FR.push(ghost(B(g, c.map((v, n) => v + o[n]), "slot")));
    }
  }
  [[-.49,-.49],[.49,-.49],[.49,.49],[-.49,.49]].forEach(([x, y]) => bar("z", 1, [x, y, .5]));
  [[.01, "bot"], [.99, "top"], [.122, "floor"]].forEach(([z]) => {
    bar("x", .96, [0, -.49, z]); bar("x", .96, [0, .49, z]); bar("y", .96, [-.49, 0, z]); bar("y", .96, [.49, 0, z]);
  });
  bar("x", .96, [0, .1, .122]);
  [[-.47,-.47],[.47,-.47],[.47,.47],[-.47,.47]].forEach(([x, y]) => [.03, .97].forEach(z => FR.push(ghost(Bh(.02, .02, .02, x, y, z, "plastic2")))));
  fixed("frame", FR);

  /* ---------------- floor: black MDF raised to 150 mm with the 160 x 160 chute opening front right ---------------- */
  const FZ = .15, FT = .018, CH = [.30, .46, -.47, -.31];
  fixed("floor_mdf", [
    BB(-.48, CH[3], FZ - FT, .48, .48, FZ, "mdf"),
    BB(-.48, -.48, FZ - FT, CH[0], CH[3], FZ, "mdf"),
    BB(CH[1], -.48, FZ - FT, .48, CH[3], FZ, "mdf"),
    BB(CH[0], -.48, FZ - FT, CH[1], CH[2], FZ, "mdf")
  ]);

  /* ---------------- control box 1000 x 200 x 112 across the front base, smoked front panel ---------------- */
  const BX0 = -.48, BX1 = .48, BY0 = -.48, BY1 = -.28, BZ0 = .02, BZ1 = FZ - FT, QZ = (BZ0 + BZ1)/2;
  const CB = [
    BB(BX0, BY0, BZ0, BX1, BY1, BZ0 + .003, "plastic2"), BB(BX0, BY1 - .003, BZ0, BX1, BY1, BZ1, "plastic2"),
    BB(BX0, BY0, BZ0, BX0 + .003, BY1, BZ1, "plastic2"), BB(BX1 - .003, BY0, BZ0, BX1, BY1, BZ1, "plastic2"),
    BB(BX0, BY0, BZ0, BX1, BY0 + .004, BZ1, "panel"),
    /* QR plate in the middle (the machine is QR only: scan, play in the browser), E-stop at the right, drawer face */
    ghost(BB(-.04, BY0 - .003, QZ - .04, .04, BY0, QZ + .04, "plastic2")),
    ghost(BB(-.031, BY0 - .0034, QZ - .031, .031, BY0 - .003, QZ + .031, "qr_w")),
    ghost(cyl(.015, .012, [.42, BY0 - .005, QZ], "plastic", {quat:QX90})),
    ghost(cyl(.02, .012, [.42, BY0 - .015, QZ], "red", {quat:QX90})),
    ghost(BB(.12, BY0 - .004, BZ0 + .01, .28, BY0, BZ1 - .012, "plastic")),
    ghost(Bh(.06, .008, .006, .2, BY0 - .009, .085, "blue")),
    ghost(BB(.12, BY0 + .004, BZ0 + .004, .28, BY1 - .01, .09, "plastic2"))      // prize drawer body
  ];
  /* QR: 21 x 21 modules, three finder squares, seeded data cells */
  const n = 21, mod = .054/n, G = [...Array(n)].map(() => Array(n).fill(0));
  const finder = (r0, c0) => { for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++){ const ring = Math.max(Math.abs(r-3), Math.abs(c-3)); G[r0+r][c0+c] = ring === 3 || ring <= 1 ? 1 : 0; } };
  finder(0, 0); finder(0, n - 7); finder(n - 7, 0);
  for (let i = 8; i < n - 8; i++) G[6][i] = G[i][6] = 1 - (i % 2);
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++){
    if ((r < 8 && c < 8) || (r < 8 && c >= n - 8) || (r >= n - 8 && c < 8) || r === 6 || c === 6) continue;
    G[r][c] = rnd() < .45 ? 1 : 0;
  }
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (G[r][c])
    CB.push(ghost(Bh(mod, .0005, mod, -.027 + (c + .5)*mod, BY0 - .0037, QZ + .027 - (r + .5)*mod, "qr_k")));
  fixed("control_box", CB);
  /* electronics inside the box, same layout as render 04 (Blender x,y -> X = x - .5, Y = y - .5) */
  const EL = [];
  const board = (x, y, z, sx, sy, sz, m, chips = []) => { EL.push(ghost(Bh(sx, sy, sz, x, y, z + sz/2, m))); chips.forEach(([cx, cy, csx, csy, csz]) => EL.push(ghost(Bh(csx, csy, csz, x + cx, y + cy, z + sz + csz/2, "chip")))); };
  board(-.38, -.38, BZ0 + .012, .085, .056, .0016, "pcb", [[0, .004, .016, .016, .0025], [.028, 0, .014, .012, .003]]);   // Raspberry Pi 5
  EL.push(ghost(Bh(.048, .04, .012, -.385, -.376, BZ0 + .026, "psu")));                                                    // active cooler
  board(-.38, -.38, BZ0 + .032, .065, .056, .0016, "pcb_red", [[-.01, 0, .008, .008, .002]]);                               // OPTIGA Trust M shield
  board(-.21, -.38, BZ0 + .012, .1, .07, .0016, "pcb", [0,1,2,3].map(i => [-.025 + .018*i, .012, .014, .014, .004]));     // SKR Mini E3 V3
  for (let i = 0; i < 4; i++) EL.push(ghost(Bh(.011, .011, .009, -.235 + .018*i, -.368, BZ0 + .0226, "psu")));
  EL.push(ghost(Bh(.129, .097, .03, -.01, -.38, BZ0 + .018, "psu")));                                                      // Mean Well LRS-100-12
  for (let i = 0; i < 9; i++) EL.push(ghost(Bh(.004, .08, .001, -.06 + i*.011, -.38, BZ0 + .0335, "chip")));
  board(-.29, -.31, BZ0 + .012, .045, .04, .0016, "pcb_blue", [[0, 0, .012, .012, .012]]);                                 // BTS7960
  board(-.23, -.31, BZ0 + .012, .03, .02, .0016, "pcb_blue", [[0, 0, .008, .008, .006]]);                                  // buck converter
  for (let i = 0; i < 5; i++) EL.push(ghost(Bh(.012, .02, .018, -.1 + i*.014, -.305, BZ0 + .012, "plastic2")));            // WAGO 221
  EL.push(ghost(Bh(.004, .004, .004, -.33, -.4, BZ0 + .03, "led_red")));                                                   // power LED
  fixed("electronics", EL);

  /* ---------------- chute: acrylic collar, funnel 160 -> 90, square tube, ramp, NFC cradle, servo flap ---------------- */
  const [cx0, cx1, cy0, cy1] = CH, LIP = FZ + .04, t = .003, ix0 = .335, ix1 = .425, iy0 = -.435, iy1 = -.345, zf0 = FZ - FT, zf1 = .095;
  const CHU = [
    BB(cx0, cy0, zf0, cx1, cy0 + t, LIP, "acrylic"), BB(cx0, cy1 - t, zf0, cx1, cy1, LIP, "acrylic"),
    BB(cx0, cy0, zf0, cx0 + t, cy1, LIP, "acrylic"), BB(cx1 - t, cy0, zf0, cx1, cy1, LIP, "acrylic")
  ];
  /* funnel: four slanted acrylic plates from the 160 collar down to the 90 tube */
  const fun = (a, b, c, d) => {   // a,b: top edge ends; c,d: bottom edge ends (same side)
    const mid = [0,1,2].map(k => (a[k] + b[k] + c[k] + d[k])/4), u = [0,1,2].map(k => b[k] - a[k]), w = [0,1,2].map(k => (c[k] + d[k])/2 - (a[k] + b[k])/2);
    const L = Math.hypot(...w), Wd = (Math.hypot(...u) + Math.hypot(c[0]-d[0], c[1]-d[1], c[2]-d[2]))/2;
    /* plate local x along the edge, local z along the slope */
    const qa = qz(w), ex = [0,1,2].map(k => u[k]/Math.hypot(...u));
    /* rotate about the slope so local x matches the edge direction */
    const rx = [1 - 2*(qa[2]**2 + qa[3]**2), 2*(qa[1]*qa[2] + qa[0]*qa[3]), 2*(qa[1]*qa[3] - qa[0]*qa[2])];
    const ang = Math.atan2([0,1,2].reduce((s, k) => s + w[k]/L*( [rx[1]*ex[2]-rx[2]*ex[1], rx[2]*ex[0]-rx[0]*ex[2], rx[0]*ex[1]-rx[1]*ex[0]][k] ), 0), rx.reduce((s, v, k) => s + v*ex[k], 0));
    return Object.assign(B([Wd/2, .0015, L/2], mid, "acrylic"), {quat:qmul(qa, q([0,0,1], ang))});
  };
  CHU.push(fun([cx0, cy0, zf0], [cx1, cy0, zf0], [ix0, iy0, zf1], [ix1, iy0, zf1]));
  CHU.push(fun([cx1, cy1, zf0], [cx0, cy1, zf0], [ix1, iy1, zf1], [ix0, iy1, zf1]));
  CHU.push(fun([cx0, cy1, zf0], [cx0, cy0, zf0], [ix0, iy1, zf1], [ix0, iy0, zf1]));
  CHU.push(fun([cx1, cy0, zf0], [cx1, cy1, zf0], [ix1, iy0, zf1], [ix1, iy1, zf1]));
  /* a short 90 mm throat under the funnel (the 60 mm capsule needs the room below it to roll out) */
  const zt0 = .088;
  CHU.push(BB(ix0, iy0, zt0, ix1, iy0 + t, zf1, "acrylic"), BB(ix0, iy1 - t, zt0, ix1, iy1, zf1, "acrylic"),
           BB(ix0, iy0, zt0, ix0 + t, iy1, zf1, "acrylic"), BB(ix1 - t, iy0, zt0, ix1, iy1, zf1, "acrylic"));
  /* ramp from the tube exit down toward the cradle at the back, then the cradle cup over the PN532 */
  CHU.push(Object.assign(Bh(.09, .08, .004, .38, -.392, .025, "plastic"), {quat:q([1,0,0], -.09)}));
  const CUPX = .38, CUPY = -.312, CUPR = .037;
  CHU.push(ghost(cyl(CUPR + .004, .002, [CUPX, CUPY, .024], "plastic")));
  for (let k = 0; k < 12; k++){ const a = k*Math.PI/6; if (Math.sin(a) < -.4) continue;   /* open toward the ramp */
    CHU.push(Object.assign(Bh(.02, .004, .016, CUPX + (CUPR + .002)*Math.cos(a), CUPY + (CUPR + .002)*Math.sin(a), .029, "plastic"), {quat:q([0,0,1], a + Math.PI/2)})); }
  CHU.push(ghost(Bh(.042, .04, .0016, CUPX, CUPY, .0215, "pcb_blue")), ghost(Bh(.034, .032, .0004, CUPX, CUPY, .0226, "gold")));
  CHU.push(ghost(Object.assign(Bh(.04, .03, .002, .333, CUPY, .05, "plastic2"), {quat:q([0,1,0], -1.05)})), ghost(Bh(.012, .023, .029, .333, CUPY + .03, .045, "plastic")));
  /* break beam pair on the collar diagonal, chute camera + LED on the back collar wall */
  CHU.push(ghost(Bh(.012, .01, .01, cx0 + .008, cy0 + .03, LIP - .03, "plastic")), ghost(Bh(.012, .01, .01, cx1 - .008, cy1 - .03, LIP - .03, "plastic")));
  CHU.push(ghost(Bh(.003, .003, .003, cx0 + .015, cy0 + .03, LIP - .03, "led_red")));
  CHU.push(ghost(Bh(.025, .004, .024, .38, cy1 - .012, LIP - .012, "pcb")), ghost(cyl(.004, .006, [.38, cy1 - .015, LIP - .012], "lens", {quat:QX90})),
           ghost(Bh(.006, .001, .006, .4, cy1 - .0145, LIP - .012, "led_chute")));
  fixed("chute", CHU);

  /* ---------------- grip calibration puck, back left ---------------- */
  fixed("grip_puck", [cyl(.03, .004, [-.4, .4, FZ + .002], "plastic2"), cyl(.01, .028, [-.4, .4, FZ + .018], "plastic2"),
    ghost(Bh(.034, .0127, .0127, -.4, .4, FZ + .018, "psu")), {type:"sphere", radius:.0275, pos:[-.4, .4, r4(FZ + .055)], material:"plastic"}]);

  /* ---------------- static gantry parts: Y rails on the top beams, belts, Y motors, drag chain shelf ---------------- */
  const GS = [];
  [-.49, .49].forEach(x => {
    GS.push(BB(x - .006, -.48, 1.0, x + .006, .48, 1.008, "steel"));
    const bx = x < 0 ? -.504 : .5025, mx = x < 0 ? -.547 : .505;
    GS.push(ghost(BB(bx, -.45, 1.004, bx + .0015, .43, 1.01, "belt")));
    GS.push(ghost(BB(mx, .43, .99, mx + .042, .472, 1.032, "plastic")), ghost(cyl(.0065, .008, [mx + .021, .451, 1.036], "steel")));
    GS.push(ghost(cyl(.006, .01, [bx + .0008, -.45, 1.0], "steel")));
  });
  /* Y drag chain on an outboard shelf along the left rail (fixed half, from the back toward the middle) */
  GS.push(ghost(BB(-.53, -.2, .985, -.5, .48, .989, "plastic2")));
  for (let k = 0; k < 24; k++){ const y = .46 - k*.0195; GS.push(ghost(Bh(.015, .017, .011, -.515, y, .9945, "plastic")), ghost(Bh(.009, .0085, .002, -.515, y, 1.0005, "chip"))); }
  /* LED bars under the four top beams: black U-profile, blue chrome walls, warm strip */
  const led = (x0, y0, x1, y1) => {
    GS.push(ghost(BB(x0, y0, .978, x1, y1, .98, "plastic")));
    if (x1 - x0 > y1 - y0){ GS.push(ghost(BB(x0, y0, .968, x1, y0 + .0012, .98, "blue")), ghost(BB(x0, y1 - .0012, .968, x1, y1, .98, "blue"))); }
    else { GS.push(ghost(BB(x0, y0, .968, x0 + .0012, y1, .98, "blue")), ghost(BB(x1 - .0012, y0, .968, x1, y1, .98, "blue"))); }
    GS.push(ghost(BB(x0 + .002, y0 + .002, .9745, x1 - .002, y1 - .002, .975, "led_warm")));
  };
  led(-.478, -.466, -.466, .466); led(.466, -.466, .478, .466); led(-.466, -.478, .466, -.466); led(-.466, .466, .466, .478);
  /* play camera: Camera Module 3 Wide in the top front left corner, aimed at the floor centre */
  const PC = [-.415, -.455, .945], aim = [0 - PC[0], .05 - PC[1], FZ - PC[2]], qa = qz(aim);
  GS.push(ghost(Object.assign(Bh(.025, .024, .004, ...PC, "pcb"), {quat:qa})), ghost(Object.assign(cyl(.0045, .007, PC.map((v, k) => v + aim[k]/Math.hypot(...aim)*.004), "lens"), {quat:qa})));
  GS.push(ghost(Bh(.02, .02, .03, -.43, -.47, .955, "plastic2")));
  fixed("gantry_static", GS);

  /* ---------------- the moving mechanism (asset) ----------------
     SimArena orders the motors by walking the body tree, and its arrow keys write [up/down, 0, left/right] into the
     first three. So the tree is: move_y (the X beam, slides in y) -> [lift (hidden driver, first child), move_x (the
     carriage, slides in x)]. The hoist under the carriage is a telescoping chain of K segments; equal_joints keeps every
     segment equal to the lift driver, so the line and the coil cable stretch from the spool to the claw like the real
     winch line. Motors: 0 move_y, 1 lift, 2 move_x, then the grip tendon. Velocity drives + spring-closed fingers, so a
     stray 0 from SimArena's slider buffer means "stop" / "stay closed" (see claw-scene.js). */
  const BZ = 1.033, LINE_Y = -.045, LINE_TOP = .97 - BZ;         // beam centre height; line leaves the spool 15 mm under its axis
  const S = .79, R = .03;                                        // claw scale vs the tuned v1 claw, capsule radius (60 mm capsules)
  const HUB = .025;                                              // claw frame sits 25 mm under the line end (hub centre)
  const GRAB = FZ + R + .087*S;                                  // claw frame height when the fingertips sit under a capsule
  const K = 8, TRAVEL = r4(.97 - HUB - GRAB), SEG = r4(TRAVEL/K);
  const vel = (lo, hi, d = 60) => ({mode:"velocity", damping:d, forceLimit:80, ctrlrange:[lo, hi]});
  const M = [];
  /* X beam: 2040 with its rail, end plates, X motor, belt, Y blocks and the X drag chain shelf */
  const BEAM = [B([.5, .01, .02], [0, 0, 0], "alu"), ghost(B([.495, .0006, .004], [0, -.0103, .008], "slot")), ghost(B([.495, .0006, .004], [0, -.0103, -.008], "slot")),
    ghost(B([.495, .0006, .004], [0, .0103, .008], "slot")), ghost(B([.495, .0006, .004], [0, .0103, -.008], "slot")),
    ghost(BB(-.48, -.006, .02, .48, .006, .028, "steel")),
    ghost(BB(-.504, -.025, -.025, -.5, .025, .025, "plastic2")), ghost(BB(.5, -.025, -.025, .504, .025, .025, "plastic2")),
    ghost(BB(-.546, -.021, -.021, -.504, .021, .021, "plastic")), ghost(BB(-.47, -.0115, -.003, .47, -.01, .003, "belt")),
    ghost(BB(-.5035, -.0227, -.03, -.4765, .0227, -.02, "block")), ghost(BB(.4765, -.0227, -.03, .5035, .0227, -.02, "block")),
    ghost(BB(-.47, .01, .016, .47, .045, .02, "plastic2"))];
  for (let k = 0; k < 16; k++){ const x = -.45 + k*.0195; BEAM.push(ghost(Bh(.017, .02, .011, x, .0275, .0255, "plastic")), ghost(Bh(.0085, .012, .002, x, .0275, .0315, "chip"))); }
  M.push({name:"move_y", transform:{pos:[0, 0, BZ]}, physics:{type:"rigid", motion:"dynamic", mass:.8},
    joint:{type:"slide", axis:[0,1,0], range:[-.35,.44], damping:4, drive:vel(-.12,.12)}, geoms:BEAM, collider:{}});
  M.push({name:"lift", relation:{parent:"move_y"}, transform:{pos:[0,0,0]}, gravcomp:1, physics:{type:"rigid", motion:"dynamic", mass:.05},
    joint:{type:"slide", axis:[0,0,1], range:[-SEG, 0], damping:2, frictionLoss:3, drive:{mode:"velocity", damping:900, forceLimit:12, ctrlrange:[r4(-.12/K), r4(.12/K)]}}, geoms:[], collider:{}});
  /* carriage 90 x 90 x 75 with the Z winch: block on the rail, top plate, body in front of the beam, spool, pancake motor */
  const CAR = [ghost(BB(-.0227, -.0135, .023, .0227, .0135, .033, "block")), BB(-.045, -.075, .033, .045, .02, .038, "plastic"),
    BB(-.045, -.075, -.03, .045, -.012, .033, "plastic"),
    ghost(BB(-.03, LINE_Y - .025, -.071, -.026, LINE_Y + .025, -.03, "plastic")), ghost(BB(.026, LINE_Y - .025, -.071, .03, LINE_Y + .025, -.03, "plastic")),
    ghost(cyl(.015, .05, [0, LINE_Y, -.048], "plastic2", {quat:QY90})),
    ghost(cyl(.019, .002, [-.025, LINE_Y, -.048], "plastic2", {quat:QY90})), ghost(cyl(.019, .002, [.025, LINE_Y, -.048], "plastic2", {quat:QY90})),
    ...[0,1,2,3,4,5].map(i => ghost(cyl(.0155, .001, [-.019 + i*.0075, LINE_Y, -.048], "chip", {quat:QY90}))),
    ghost(BB(.03, LINE_Y - .021, -.069, .053, LINE_Y + .021, -.027, "plastic")),
    ghost(Bh(.02, .02, .016, -.048, LINE_Y, -.058, "plastic2")), ghost(cyl(.004, .004, [-.048, LINE_Y, -.068], "lens")),
    ghost(Bh(.02, .01, .008, .03, -.06, .043, "pcb_red")), ghost(Bh(.012, .012, .006, .024, LINE_Y - .004, -.03, "plastic2")),
    ghost(BB(-.052, .01, .016, -.04, .045, .044, "plastic2"))];
  M.push({name:"move_x", relation:{parent:"move_y"}, transform:{pos:[0,0,0]}, gravcomp:1, physics:{type:"rigid", motion:"dynamic", mass:.3},
    joint:{type:"slide", axis:[-1,0,0], range:[-.4,.42], damping:4, drive:vel(-.12,.12)}, geoms:CAR, collider:{}});
  /* telescoping hoist: each segment carries one stretch of the line and of the blue coil cable */
  const constraint = {};
  for (let s = 1; s <= K; s++){
    const geoms = [ghost(cyl(.0011, SEG, [0, 0, SEG/2], "line"))];
    const turns = 2, pts = 8*turns, cr = .009, cx = .024;
    for (let k = 0; k < pts; k++){
      const a0 = 2*Math.PI*k/8, a1 = 2*Math.PI*(k + 1)/8, z0 = SEG*k/pts, z1 = SEG*(k + 1)/pts;
      const p0 = [cx + cr*Math.cos(a0), cr*Math.sin(a0), z0], p1 = [cx + cr*Math.cos(a1), cr*Math.sin(a1), z1], d = [0,1,2].map(i => p1[i] - p0[i]);
      geoms.push(ghost({type:"capsule", radius:.0024, height:r4(Math.hypot(...d)), pos:[0,1,2].map(i => r4((p0[i] + p1[i])/2)), quat:qz(d), material:"blue"}));
    }
    if (s === K){
      /* the claw itself: swivel, eye, hub, blue collar, actuator body (Aethelark module look) */
      geoms.push(ghost({type:"sphere", radius:.004, pos:[0,0,-.002], material:"steel"}), ghost(cyl(.0025, .012, [0,0,-.01], "steel")),
        cyl(.026*S/.79, .04, [0,0,-HUB], "plastic"), ghost(cyl(.02, .006, [0,0,-.006], "blue")),
        ghost(cyl(.012, .03, [0,0,-HUB - .03], "plastic2")), ghost({type:"cylinder", radius:.0275, height:.004, pos:[0,0,-HUB - .019], material:"blue"}));
      /* the coil cable's lower end ties into the hub */
      geoms.push(ghost(cyl(.0035, .01, [.012, 0, -.002], "plastic2", {quat:QY90})));
    }
    M.push({name:"seg_" + s, relation:{parent:s === 1 ? "move_x" : "seg_" + (s - 1)}, transform:{pos:[0, s === 1 ? LINE_Y : 0, s === 1 ? r4(LINE_TOP) : 0]},
      gravcomp:1, physics:{type:"rigid", motion:"dynamic", mass:s === K ? .03 : .003},
      joint:{type:"slide", axis:[0,0,1], range:[-SEG, 0], damping:.5, frictionLoss:.4}, geoms, collider:{}});
    constraint["hoist_" + s] = {type:"equal_joints", joint1:"seg_" + s, joint2:"lift"};
  }
  /* three spring-closed fingers, the tuned v1 profile scaled by S (opens to ~4.3 cm, tip under the capsule) */
  const fingers = [], UP = .09*S, OFF = .6, TILT = .5 - OFF, TIP = -1 - OFF, TL = .05*S, SPRING = .14, FR_ = .0065*S;
  for (let k = 0; k < 3; k++){
    const a = k*2*Math.PI/3, name = "finger_" + (k+1); fingers.push(name);
    M.push({name, relation:{parent:"seg_" + K}, transform:{pos:[r4(.024*S*Math.cos(a)), r4(.024*S*Math.sin(a)), r4(-HUB - .025*S)], quat:q([0,0,1], a)},
      gravcomp:1, physics:{type:"rigid", motion:"dynamic", mass:.015},
      joint:{type:"hinge", axis:[0,1,0], range:[r4(-.3 - OFF), r4(.7 - OFF)], damping:.02, stiffness:SPRING, armature:.0005},
      geoms:[
        {type:"capsule", radius:r4(FR_), height:r4(UP), pos:[r4(Math.sin(TILT)*UP/2), 0, r4(-Math.cos(TILT)*UP/2)], quat:q([0,1,0], TILT), material:"plastic", friction:1.4},
        {type:"capsule", radius:r4(FR_), height:r4(TL), pos:[r4(Math.sin(TILT)*UP + Math.sin(TIP)*TL/2), 0, r4(-Math.cos(TILT)*UP - Math.cos(TIP)*TL/2)], quat:q([0,1,0], TIP), material:"orange", friction:1.6},
        ghost(cyl(.0025, .012, [r4(Math.sin(TILT)*UP*.55 - .008), 0, r4(-Math.cos(TILT)*UP*.4)], "steel", {quat:q([0,1,0], .9)}))   // push rod
      ], collider:{}});
  }
  const used = new Set(); M.forEach(e => e.geoms.forEach(g => used.add(g.material)));
  const asset = { _format:"simarena/asset@1.0", name:"grablab_claw_revb", entities:M,
    material:Object.fromEntries([...used].map(k => [k, material[k]])), constraint,
    /* force (N m) on the 3 coupled fingers: negative opens against the springs, positive adds squeeze; no "gain" (MuJoCo rejects it) */
    coupling:{ grip:{ type:"fixed_tendon", joints:fingers.map(j => ({joint:j, coefficient:1})), drive:{forceLimit:.4, ctrlrange:[-.4,.15]} } } };
  E.push({name:"claw", asset:assetUrl, controller:{type:"direct", config:""}});

  /* ---------------- capsules: 60 mm glass shells with a coin inside, one layer like the real floor ---------------- */
  const caps = [];
  for (let j = 0; j < 9; j++) for (let i = 0; i < 11; i++){
    const x = .085 + i*.082 + (rnd() - .5)*.016, y = .27 + j*.082 + (rnd() - .5)*.016;
    if (x > .76 && y < .26) continue;
    if ((x - .1)**2 + (y - .9)**2 < .075**2) continue;
    caps.push([x - .5, y - .5]);
  }
  [[.2, .19], [.34, .19], [.5, .19], [.64, .19]].forEach(([x, y]) => caps.push([x - .5 + (rnd() - .5)*.01, y - .5]));
  caps.forEach(([x, y], k) => {
    const coin = k % 9 === 0 ? "coin_blue" : k % 4 === 0 ? "silver" : "gold";
    E.push({name:"capsule_" + String(k + 1).padStart(2, "0"), transform:{pos:[r4(x), r4(y), r4(FZ + R + .002)], quat:q([rnd(), rnd(), 1].map((v, i, a) => v/Math.hypot(...a)), rnd()*6.28)},
      physics:{type:"rigid", motion:"dynamic", mass:.015}, joint:{type:"free"},
      geoms:[{type:"sphere", radius:R, material:"shell", friction:1.3},
             ghost({type:"cylinder", radius:.0145, height:.003, pos:[r4((rnd() - .5)*.008), r4((rnd() - .5)*.008), r4(-.016 + rnd()*.004)], quat:q([1,0,0], (rnd() - .5)*1.2), material:coin})], collider:{}});
  });

  /* ---------------- the filming room (same room as v1: walls, glass front and right, lamp grid, shelf, desk, tripod) ---------------- */
  const RX = 2.0, RB = 2.2, RF = -1.6, RH = 3.6, tw = .12, RD = RB - RF, RZT = RH - .07;
  fixed("room_floor", [{type:"plane", size:[10,10,.05], material:"concrete"}, ghost(B([.75,.75,.003], [0,0,.003], "paint")),
    ghost(B([.76,.008,.005], [0,-.76,.005], "led_blue")), ghost(B([.76,.008,.005], [0,.76,.005], "led_blue")),
    ghost(B([.008,.76,.005], [-.76,0,.005], "led_blue")), ghost(B([.008,.76,.005], [.76,0,.005], "led_blue"))]);
  fixed("room", [
    B([RX + tw/2, tw/2, RH/2], [0, RB, RH/2], "wall"), B([tw/2, (RD + tw)/2, RH/2], [-RX, (RB + RF)/2, RH/2], "wall_lt"),
    B([.01, RD/2, (RH - .14)/2], [RX, (RB + RF)/2, (RH - .14)/2 + .07], "glass_room"),
    ...[-.65, .3, 1.25].map(y => B([.05, .05, RH/2], [RX, y, RH/2], "pillar")),
    B([.05, (RD + .2)/2, .035], [RX, (RB + RF)/2, .035], "pillar"), B([.05, (RD + .2)/2, .035], [RX, (RB + RF)/2, RH - .035], "pillar"),
    B([RX + tw/2, .01, (RH - .14)/2], [0, RF, (RH - .14)/2 + .07], "glass_room"),
    ...[[-RX, RB], [RX, RB], [-RX, RF], [RX, RF]].map(([x, y]) => B([.1, .1, RH/2], [x, y, RH/2], "pillar")),
    B([RX + .1, .05, .035], [0, RF, .035], "pillar"), B([RX + .1, .05, .035], [0, RF, RH - .035], "pillar")]);
  fixed("ceiling", [ghost(B([RX + .1, .07, .05], [0, RB, RZT], "truss")), ghost(B([RX + .1, .07, .05], [0, RF, RZT], "truss")),
    ghost(B([.07, (RD + .2)/2, .05], [-RX, (RB + RF)/2, RZT], "truss")), ghost(B([.07, (RD + .2)/2, .05], [RX, (RB + RF)/2, RZT], "truss")),
    ...[-.65, .45, 1.45].map(y => ghost(B([RX, .035, .035], [0, y, RZT], "truss"))), ghost(B([.035, RD/2, .035], [0, (RB + RF)/2, RZT], "truss")),
    ghost(B([RX - .1, .01, .01], [0, r4(RB - tw/2 - .02), RH - .16], "led_blue")), ghost(B([.01, RD/2 - .1, .01], [r4(-RX + tw/2 + .02), (RB + RF)/2, RH - .16], "led_cyan"))]);
  [[0, .45], [-1.2, 1.45], [1.2, 1.45]].forEach(([x, y], i) => {
    const DROP = 1.25, zl = RZT - DROP;
    fixed("lamp_" + (i + 1), [ghost(cyl(.008, DROP - .05, [x, y, RZT - (DROP - .05)/2], "truss")), ghost(cyl(.075, .12, [x, y, zl], "lamp_body")),
      ghost(cyl(.065, .008, [x, y, zl - .064], "lamp_lens")), ghost(cyl(.079, .022, [x, y, zl - .045], "lamp_lens")), ghost(cyl(.09, .35, [x, y, zl - .25], "beam_1")),
      ...(Math.abs(x) < .7 && Math.abs(y) < .6 ? [] : [ghost(cyl(.16, .45, [x, y, zl - .65], "beam_2")), ghost(cyl(.24, .5, [x, y, zl - 1.12], "beam_3"))])]);
    const d = [-x, -y, .6 - zl], nn = Math.hypot(...d);
    E.push({name:"lamp_light_" + (i + 1), transform:{pos:[x, y, r4(zl - .08)]}, light:{type:"spot", color:"#fff2dc", intensity:i < 1 ? 4 : 2.5, dir:d.map(v => r4(v/nn)), angle:.75, castShadow:i === 0}});
  });
  const ACC = [];
  for (let c = 0; c < 6; c++) for (let r = 0; r < 2; r++){ const x = -1.62 + c*.65, z = .75 + r*.72; if (Math.abs(x) < .5 && r === 1) continue; ACC.push(B([.29, .025, .32], [r4(x), r4(RB - tw/2 - .025), r4(z)], "acoustic")); }
  fixed("back_wall_detail", [...ACC, B([.475, .025, .17], [0, r4(RB - tw/2 - .03), 2.05], "navy2"),
    ghost(B([.45, .006, .006], [0, r4(RB - tw/2 - .06), 1.87], "led_cyan")), ghost(B([.45, .006, .006], [0, r4(RB - tw/2 - .06), 2.23], "led_cyan")), ghost(B([.25, .005, .025], [0, r4(RB - tw/2 - .06), 2.05], "led_gold"))]);
  const SX = -RX + tw/2 + .2, SH = [];
  [.35, .85, 1.35, 1.85].forEach(z => SH.push(B([.18, .65, .015], [r4(SX), .9, z], "wood")));
  [.28, 1.52].forEach(y => SH.push(B([.18, .02, .95], [r4(SX), y, .95], "pillar")));
  [.85, 1.35].forEach((z, k) => { for (let j = 0; j < 5; j++) SH.push(B([.11, .1, .08], [r4(SX), r4(.42 + j*.24), r4(z + .095)], k ? (j % 2 ? "violet" : "gold") : "navy2")); });
  for (let j = 0; j < 9; j++) SH.push({type:"sphere", radius:R, pos:[r4(SX + (j % 2 ? .07 : -.07)), r4(.36 + j*.13), r4(1.85 + .045)], material:"shell"});
  fixed("shelf", SH);
  const DX = 1.45, DY = .95;
  fixed("desk", [B([.3, .55, .0175], [DX, DY, .74], "wood"), ...[[-.27, -.5], [.27, -.5], [-.27, .5], [.27, .5]].map(([dx, dy]) => B([.02, .02, .36], [r4(DX + dx), r4(DY + dy), .36], "pillar")),
    B([.03, .25, .16], [r4(DX + .18), DY, .95], "lamp_body"), ghost(B([.006, .23, .14], [r4(DX + .145), DY, .95], "screen")), B([.09, .21, .0075], [r4(DX - .05), DY, .765], "lamp_body")]);
  (function camRig(name, px, py){
    const z = 1.25, yaw = Math.atan2(-py, -px), Q = q([0,0,1], yaw), c = Math.cos(yaw), s = Math.sin(yaw);
    const feet = [0,1,2].map(i => { const a = yaw + Math.PI + (i - 1); return ghost(Object.assign(B([.08,.007,.007], [r4(px + .13*Math.cos(a)), r4(py + .13*Math.sin(a)), .014], "truss"), {quat:q([0,0,1], a)})); });
    fixed(name, [ghost(cyl(.018, z - .12, [px, py, (z - .12)/2], "truss")), ...feet, ghost(B([.03,.03,.025], [px, py, z], "cam_body")),
      ghost(Object.assign(B([.08,.045,.05], [px, py, r4(z + .075)], "cam_body"), {quat:Q})), ghost(Object.assign(B([.04,.0275,.0275], [r4(px + .12*c), r4(py + .12*s), r4(z + .075)], "lens"), {quat:Q})),
      ghost(B([.006,.006,.006], [r4(px + .07*c - .05*s), r4(py + .07*s + .05*c), r4(z + .135)], "rec"))]);
  })("camera", 1.05, -1.25);

  /* ---------------- lights: studio key / fill / blue rim like the Blender renders, warm LED bars inside, chute LED ---------------- */
  E.push({name:"key_light", transform:{pos:[-.3,-2.1,2.6]}, light:{type:"spot", color:"#fff4e6", intensity:6, dir:[.12,.86,-.5], angle:.7, castShadow:true}});
  E.push({name:"rim_light", transform:{pos:[.7,2.3,1.6]}, light:{type:"spot", color:"#8ca8ff", intensity:5, dir:[-.25,-.9,-.35], angle:.8}});
  E.push({name:"fill_light", transform:{pos:[-2.0,-.6,.9]}, light:{type:"point", color:"#d8e2ff", intensity:1.4, range:4}});
  E.push({name:"led_light_l", transform:{pos:[-.3,0,.95]}, light:{type:"point", color:"#ffb877", intensity:1, range:1.1}});
  E.push({name:"led_light_r", transform:{pos:[.3,0,.95]}, light:{type:"point", color:"#ffb877", intensity:1, range:1.1}});
  E.push({name:"back_glow", transform:{pos:[0, 2.0, 2.2]}, light:{type:"point", color:"#7d84ff", intensity:2, range:4.5}});
  E.push({name:"chute_glow", transform:{pos:[.38, -.39, r4(FZ + .05)]}, light:{type:"point", color:"#ffd6a8", intensity:.12, range:.3}});

  const task = { instruction:"Grablab Prototype 01 Rev B. Press Run, open the Scene tab and click claw, then Controls. Arrow keys move the gantry. Lift left lowers the claw on its line, grip left opens it, grip back to the centre closes it on the spring grip, lift right raises it. Carry the capsule to the chute in the front right corner and open the grip: it drops through the beam into the NFC cradle." };
  return { scene:{ _format:"simarena/scene@1.0", name:"Grablab Prototype 01 Rev B", sim:{timestep:.002, gravity:[0,0,-9.81]}, material, task, entities:E }, asset };
}
if (typeof module !== "undefined" && require.main === module){
  const fs = require("fs"), path = require("path"), { scene, asset } = buildRevBScene();
  fs.writeFileSync(path.join(__dirname, "grablab-claw-revb.scene.json"), JSON.stringify(scene, null, 1));
  fs.writeFileSync(path.join(__dirname, "grablab-claw-revb-mech.asset.json"), JSON.stringify(asset, null, 1));
  const g = scene.entities.reduce((s, e) => s + (e.geoms ? e.geoms.length : 0), 0) + asset.entities.reduce((s, e) => s + e.geoms.length, 0);
  console.log("wrote grablab-claw-revb.scene.json + grablab-claw-revb-mech.asset.json,", scene.entities.length, "entities,", g, "geoms");
} else if (typeof window !== "undefined") window.buildRevBScene = buildRevBScene;
