/* Grablab Prototype 01, final metal build, as a SimArena scene (simarena/scene@1.0, MuJoCo underneath).
   node claw-scene-final.js -> writes grablab-claw-final.scene.json + grablab-claw-final-mech.asset.json next to this file
   Same machine as anatomy-metal.js (dimensions from assets/machine/metal.json). Metres, z up, the front faces -y.
   Welded 25 mm black steel cabinet, 1000 x 1000 x 1130: black base skins, black left and back panels, glass front and right,
   play floor at 250, 243 mm prize hole front right with two walls, LED profiles under the top ring, V-slot gantry on top,
   the black claw on a line with a black coil cable, white printed capsules.
   Physics carried over from the tuned Rev B scene (claw-scene-revb.js): motor order, equal_joints hoist, capsule radius 30 mm
   against the real 25 mm because the finger profile is tuned for it, one layer of capsules so the browser keeps up.
   Controls (press Run, click the claw): arrow keys move it, sliders claw/lift (velocity, left = down) and claw/grip
   (left opens, centre closes on the spring grip). */
function buildFinalScene(assetUrl = "grablab-claw-final-mech.asset.json"){
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
    tray:{rgba:[.09,.095,.105,1],metalness:.25,roughness:.55}, base:{rgba:[.075,.08,.09,1],metalness:.35,roughness:.45},
    chrome:{rgba:[.86,.88,.92,1],metalness:1,roughness:.12}, carriage:{rgba:[.32,.33,.36,1],metalness:.6,roughness:.35},
    cable:{rgba:[.025,.025,.028,1],metalness:.15,roughness:.42}, dyneema:{rgba:[.22,.22,.24,1],metalness:0,roughness:.7},
    invis:{rgba:[0,0,0,0],metalness:0,roughness:1}, rubber:{rgba:[.04,.04,.045,1],metalness:0,roughness:.85}, chrome_dk:{rgba:[.5,.52,.58,1],metalness:1,roughness:.22},
    yellow:{rgba:[.95,.72,.05,1],metalness:.1,roughness:.3}, logo:{rgba:[1,1,1,1],emission:1.6}, hole:{rgba:[.005,.005,.008,1],metalness:0,roughness:1},
    cap_gold:{rgba:[.95,.7,.32,1],metalness:.85,roughness:.22}, cap_violet:{rgba:[.74,.68,.95,1],metalness:.6,roughness:.18}, seam:{rgba:[.12,.12,.15,1],metalness:.5,roughness:.4},
    belt:{rgba:[.015,.015,.015,1],metalness:0,roughness:.85},
    blue:{rgba:[.23,.48,1,1],metalness:1,roughness:.14},                // blue chrome accent (coil cable, collar, LED walls, handle)
    line:{rgba:[.92,.92,.9,1],metalness:0,roughness:.55},               // Dyneema
    orange:{rgba:[.9,.25,.03,1],metalness:.1,roughness:.35},            // claw tips
    acrylic:{rgba:[.75,.82,.95,.07],metalness:.3,roughness:.02},
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
    concrete:{rgba:[.025,.028,.04,1],metalness:.35,roughness:.32}, wall:{rgba:[.018,.02,.032,1],metalness:.1,roughness:.85},
    wall_lt:{rgba:[.022,.025,.04,1],metalness:.1,roughness:.85}, paint:{rgba:[.03,.05,.14,1],metalness:.1,roughness:.6},
    led_blue:{rgba:[.23,.48,1,1],emission:1}, led_cyan:{rgba:[.25,.91,1,1],emission:1}, led_pink:{rgba:[1,.36,.68,1],emission:1}, led_gold:{rgba:[1,.75,.4,1],emission:1},
    cam_body:{rgba:[.04,.05,.08,1],metalness:.45,roughness:.4}, rec:{rgba:[1,.2,.25,1],emission:1.2},
    truss:{rgba:[.28,.31,.4,1],metalness:.8,roughness:.35}, pillar:{rgba:[.03,.035,.05,1],metalness:.3,roughness:.6},
    acoustic:{rgba:[.03,.04,.08,1],metalness:.05,roughness:.95}, glass_room:{rgba:[.75,.82,1,.03],metalness:.1,roughness:.05},
    lamp_body:{rgba:[.05,.06,.09,1],metalness:.6,roughness:.35}, lamp_lens:{rgba:[1,.97,.88,1],emission:2},
    beam_1:{rgba:[1,.95,.82,.09],emission:.6}, beam_2:{rgba:[1,.95,.82,.05],emission:.4}, beam_3:{rgba:[1,.95,.82,.03],emission:.3},
    wood:{rgba:[.22,.16,.12,1],metalness:.05,roughness:.8}, screen:{rgba:[.2,.45,1,1],emission:1.1}, navy2:{rgba:[.06,.1,.29,1],metalness:.35,roughness:.45},
    violet:{rgba:[.6,.48,1,1],metalness:.8,roughness:.3,emission:.4},
    tube:{rgba:[.022,.023,.028,1],metalness:.55,roughness:.52}, panel_k:{rgba:[.016,.017,.02,1],metalness:0,roughness:.8},
    anod:{rgba:[.05,.055,.07,1],metalness:.7,roughness:.32}, cap_white:{rgba:[.9,.895,.86,1],metalness:0,roughness:.68}, cap_seam:{rgba:[.46,.45,.42,1],metalness:0,roughness:.8}, cap_dot:{rgba:[.05,.05,.045,1],metalness:0,roughness:.9},
    claw_k:{rgba:[.022,.023,.027,1],metalness:.05,roughness:.55}, claw_k2:{rgba:[.04,.042,.05,1],metalness:.1,roughness:.42}, tube_s:{rgba:[.62,.64,.68,1],metalness:.9,roughness:.32},
    laser:{rgba:[1,.12,.1,.5],emission:1.4}, opal:{rgba:[1,.93,.8,1],emission:2.4}
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


  /* ---------------- cabinet: welded 25 mm tube, four rings on four posts ---------------- */
  const FZ = .25, TOP = 1.13, HX0 = .232, HX1 = .475, HY0 = -.475, HY1 = -.232;
  const T = .025, O = .5, I_ = O - T;
  const FRM = [];
  [[-O, -O], [I_, -O], [-O, I_], [I_, I_]].forEach(([x, y]) => FRM.push(BB(x, y, 0, x + T, y + T, TOP, "tube")));
  [[0, T], [.222, .247], [.325, .35], [1.105, TOP]].forEach(([z0, z1]) => FRM.push(
    BB(-I_, -O, z0, I_, -I_, z1, "tube"), BB(-I_, I_, z0, I_, O, z1, "tube"), BB(-O, -I_, z0, -I_, I_, z1, "tube"), BB(I_, -I_, z0, O, I_, z1, "tube")));
  [[-.47, -.47], [.47, -.47], [-.47, .47], [.47, .47]].forEach(([x, y]) => FRM.push(ghost(cyl(.02, .012, [x, y, .006], "rubber"))));
  fixed("frame", FRM);
  /* panels: black base skins all round, black left and back of the showcase, glass front and right */
  fixed("panels", [BB(-.503, -.503, T, .503, -O, .35, "panel_k"), BB(-.503, O, T, .503, .503, .35, "panel_k"), BB(-.503, -O, T, -O, O, .35, "panel_k"), BB(O, -O, T, .503, O, .35, "panel_k"),
    BB(-.503, O, .35, .503, .503, TOP, "panel_k"), BB(-.503, -O, .35, -O, O, TOP, "panel_k"),
    BB(-O, -.502, .35, O, -O, TOP, "acrylic"), BB(O, -O, .35, .502, O, TOP, "acrylic")]);
  /* play floor: collides 70 mm deep so a dropped capsule can never tunnel through it, prize hole front right, two walls round it */
  fixed("play_floor", [BB(-O, HY1, FZ - .07, O, O, FZ, "panel_k"), BB(-O, -O, FZ - .07, HX0, HY1, FZ, "panel_k"),
    BB(HX1, -O, FZ - .07, O, HY1, FZ, "panel_k"), BB(HX0, -O, FZ - .07, HX1, HY0, FZ, "panel_k"),
    BB(HX0 - .006, HY0, FZ, HX0, HY1 + .006, .35, "panel_k"), BB(HX0, HY1, FZ, HX1, HY1 + .006, .35, "panel_k")]);

  /* ---------------- front plates: QR on the left, wordmark plate in the middle, E-stop on the right ---------------- */
  const PY = -.503, PL = [];
  PL.push(ghost(BB(-.205, PY - .003, .11, .205, PY, .23, "anod")), ghost(BB(-.205, PY - .0036, .2265, .205, PY - .003, .228, "steel")), ghost(BB(-.205, PY - .0036, .112, .205, PY - .003, .1135, "steel")));
  PL.push(ghost(cyl(.042, .002, [.35, PY - .001, .2], "yellow", {quat:QX90})), ghost(cyl(.016, .012, [.35, PY - .007, .2], "plastic", {quat:QX90})),
    ghost(cyl(.02, .006, [.35, PY - .015, .2], "red", {quat:QX90})), ghost({type:"sphere", radius:.02, pos:[.35, r4(PY - .018), .2], material:"red"}));
  PL.push(ghost(BB(-.39, PY - .003, .125, -.31, PY, .215, "anod")), ghost(BB(-.38, PY - .0034, .15, -.32, PY - .003, .21, "qr_w")));
  /* QR: 21 x 21 modules, three finder squares, seeded data cells */
  const n = 21, mod = .056/n, G = [...Array(n)].map(() => Array(n).fill(0));
  const finder = (r0, c0) => { for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++){ const ring = Math.max(Math.abs(r-3), Math.abs(c-3)); G[r0+r][c0+c] = ring === 3 || ring <= 1 ? 1 : 0; } };
  finder(0, 0); finder(0, n - 7); finder(n - 7, 0);
  for (let i = 8; i < n - 8; i++) G[6][i] = G[i][6] = 1 - (i % 2);
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++){
    if ((r < 8 && c < 8) || (r < 8 && c >= n - 8) || (r >= n - 8 && c < 8) || r === 6 || c === 6) continue;
    G[r][c] = rnd() < .45 ? 1 : 0;
  }
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (G[r][c])
    PL.push(ghost(Bh(mod, .0005, mod, -.378 + (c + .5)*mod, PY - .0037, .208 - (r + .5)*mod, "qr_k")));
  /* GRABLAB wordmark, glowing white, drawn from strokes on a 4 x 6 grid per letter */
  const GLY = {
    G:[[0,4.6,4,6],[0,0,1.4,6],[0,0,4,1.4],[2.6,0,4,3.2],[2,1.9,4,3.2]], R:[[0,0,1.4,6],[0,4.6,4,6],[2.6,3,4,6],[0,2.4,4,3.7],[2.5,0,3.9,2.6]],
    A:[[0,0,1.4,6],[2.6,0,4,6],[0,4.6,4,6],[0,2.4,4,3.7]], B:[[0,0,1.4,6],[0,4.6,3.4,6],[0,0,3.4,1.4],[0,2.4,3.4,3.6],[2.6,.5,4,2.9],[2.6,3.2,4,5.5]],
    L:[[0,0,1.4,6],[0,0,4,1.4]] };
  const U = .0085, LW = 4*U, GAP = .3*4*U, WORD = "GRABLAB", W0 = -(WORD.length*LW + (WORD.length - 1)*GAP)/2, LZ = .17 - 3*U;
  [...WORD].forEach((ch, i) => GLY[ch].forEach(([x0, y0, x1, y1]) =>
    PL.push(ghost(BB(W0 + i*(LW + GAP) + x0*U, PY - .0045, LZ + y0*U, W0 + i*(LW + GAP) + x1*U, PY - .003, LZ + y1*U, "logo")))));
  fixed("front_plates", PL);

  /* ---------------- chute: funnel under the 243 mm hole down to the 120 mm throat, break beam, a shaft to the cradle ---------------- */
  const OX0 = .2935, OX1 = .4135, OY0 = -.4135, OY1 = -.2935, ZF0 = FZ - .07, ZF1 = .125, ZB = .04;
  const fun = (a, b, c, d) => {   // a,b: top edge ends; c,d: bottom edge ends (same side)
    const mid = [0,1,2].map(k => (a[k] + b[k] + c[k] + d[k])/4), u = [0,1,2].map(k => b[k] - a[k]), w = [0,1,2].map(k => (c[k] + d[k])/2 - (a[k] + b[k])/2);
    const L = Math.hypot(...w), Wd = (Math.hypot(...u) + Math.hypot(c[0]-d[0], c[1]-d[1], c[2]-d[2]))/2;
    const qa = qz(w), ex = [0,1,2].map(k => u[k]/Math.hypot(...u));
    const rx = [1 - 2*(qa[2]**2 + qa[3]**2), 2*(qa[1]*qa[2] + qa[0]*qa[3]), 2*(qa[1]*qa[3] - qa[0]*qa[2])];
    const ang = Math.atan2([0,1,2].reduce((s, k) => s + w[k]/L*( [rx[1]*ex[2]-rx[2]*ex[1], rx[2]*ex[0]-rx[0]*ex[2], rx[0]*ex[1]-rx[1]*ex[0]][k] ), 0), rx.reduce((s, v, k) => s + v*ex[k], 0));
    return Object.assign(B([Wd/2, .004, L/2], mid, "hole"), {quat:qmul(qa, q([0,0,1], ang))});
  };
  const CHU = [
    fun([HX0, HY0, ZF0], [HX1, HY0, ZF0], [OX0, OY0, ZF1], [OX1, OY0, ZF1]), fun([HX1, HY1, ZF0], [HX0, HY1, ZF0], [OX1, OY1, ZF1], [OX0, OY1, ZF1]),
    fun([HX0, HY1, ZF0], [HX0, HY0, ZF0], [OX0, OY1, ZF1], [OX0, OY0, ZF1]), fun([HX1, HY0, ZF0], [HX1, HY1, ZF0], [OX1, OY0, ZF1], [OX1, OY1, ZF1]),
    BB(OX0 - .008, OY0 - .008, ZB, OX0, OY1 + .008, ZF1, "hole"), BB(OX1, OY0 - .008, ZB, OX1 + .008, OY1 + .008, ZF1, "hole"),
    BB(OX0, OY0 - .008, ZB, OX1, OY0, ZF1, "hole"), BB(OX0, OY1, ZB, OX1, OY1 + .008, ZF1, "hole"),
    BB(OX0 - .008, OY0 - .008, ZB - .02, OX1 + .008, OY1 + .008, ZB, "plastic2"),   // cradle floor, the trapdoor in the real machine
    ghost(Bh(.042, .04, .0016, .3535, -.3535, ZB + .001, "pcb_blue")), ghost(Bh(.034, .032, .0004, .3535, -.3535, ZB + .0022, "gold")),
    ghost(cyl(.0012, OX1 - OX0, [.3535, -.3535, .145], "laser", {quat:QY90})), ghost(Bh(.02, .05, .044, OX0 - .012, -.3535, .145, "plastic")), ghost(Bh(.02, .05, .044, OX1 + .012, -.3535, .145, "plastic"))
  ];
  fixed("chute", CHU);

  /* ---------------- gantry on the top ring: two V-slot Y rails, motor and idler blocks, LED profiles under the ring, webcams ---------------- */
  const GS = [];
  [-1, 1].forEach(sg => {
    const x = sg*.47;
    GS.push(BB(x - .01, -.5, 1.136, x + .01, .5, 1.156, "alu"), ghost(BB(x - .002, -.5, 1.1555, x + .002, .5, 1.158, "steel")));
    GS.push(ghost(BB(x - .03, .444, 1.13, x + .03, .5, 1.206, "plastic2")), ghost(BB(sg*.477 - .02, .451, 1.161, sg*.477 + .02, .493, 1.209, "plastic")));
    GS.push(ghost(BB(x - .03, -.5, 1.13, x + .03, -.46, 1.196, "plastic2")));
    GS.push(ghost(cyl(.009, .018, [sg*.51, .472, 1.182], "steel", {quat:QY90})), ghost(cyl(.009, .012, [sg*.514, -.48, 1.182], "steel", {quat:QY90})));
    GS.push(ghost(BB(sg*.51 - .0008, -.48, 1.18, sg*.51 + .0008, .472, 1.185, "belt")));
  });
  /* LPU18 LED profiles on the inner top edges, opal cover facing down and in; front and left stop short of the camera block */
  const LP = .018, IN = .4745, LZ0 = 1.105 - LP;
  [[-IN, -IN + LP, -.41, IN], [IN - LP, IN, -IN, IN]].forEach(([x0, x1, y0, y1]) => GS.push(ghost(BB(x0, y0, LZ0, x1, y1, 1.105, "plastic")), ghost(BB(x0, y0, LZ0 - .0012, x1, y1, LZ0, "opal"))));
  [[-.41, IN, IN - LP, IN], [-IN, IN, IN - LP, IN]].forEach(([x0, x1], i) => { const y0 = i ? IN - LP : -IN, y1 = i ? IN : -IN + LP; GS.push(ghost(BB(x0, y0, LZ0, x1, y1, 1.105, "plastic")), ghost(BB(x0, y0, LZ0 - .0012, x1, y1, LZ0, "opal"))); });
  GS.push(ghost(BB(-.475, -.475, 1.06, -.42, -.42, 1.105, "plastic2")), ghost(cyl(.008, .01, [-.44, -.44, 1.056], "lens")));
  GS.push(ghost(BB(-.048, .438, 1.072, .048, .478, 1.108, "plastic2")), ghost(cyl(.012, .004, [0, .436, 1.09], "lens", {quat:QX90})));
  fixed("gantry_static", GS);

  /* ---------------- the moving mechanism (asset) ----------------
     SimArena orders the motors by walking the body tree, and its arrow keys write [up/down, 0, left/right] into the
     first three. So the tree is: move_y (the X beam, slides in y) -> [lift (hidden driver, first child), move_x (the
     carriage, slides in x)]. The hoist under the carriage is a telescoping chain of K segments; equal_joints keeps every
     segment equal to the lift driver, so the line and the coil cable stretch from the spool to the claw like the real
     winch line. Motors: 0 move_y, 1 lift, 2 move_x, then the grip tendon. Velocity drives + spring-closed fingers, so a
     stray 0 from SimArena's slider buffer means "stop" / "stay closed" (see claw-scene.js). */
  const BZ = 1.188, LINE_Y = -.045, LINE_Z = 1.125, LINE_TOP = LINE_Z - BZ;   // beam centre height; line leaves the spool under the beam
  const S = .79, R = .03;                                        // claw scale vs the tuned v1 claw, capsule radius (60 mm capsules)
  const HUB = .11;                                               // the pivot hub sits 110 mm under the line end, the claw body fills the gap
  const GRAB = FZ + R + .087*S;                                  // claw frame height when the fingertips sit under a capsule
  const K = 8, TRAVEL = r4(LINE_Z - HUB - GRAB), SEG = r4(TRAVEL/K);
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
    joint:{type:"slide", axis:[0,0,1], range:[-SEG, 0], damping:2, frictionLoss:1, drive:{mode:"velocity", damping:900, forceLimit:15, ctrlrange:[r4(-.12/K), r4(.12/K)]}}, geoms:[], collider:{}});
  /* carriage 90 x 90 x 75 with the Z winch: block on the rail, top plate, body in front of the beam, spool, pancake motor */
  const CAR = [ghost(BB(-.0227, -.0135, .023, .0227, .0135, .033, "block")), BB(-.045, -.075, .033, .045, .02, .038, "carriage"),
    BB(-.045, -.075, -.03, .045, -.012, .033, "carriage"),
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
    const geoms = [ghost(cyl(.0011, SEG, [0, 0, SEG/2], "dyneema"))];
    const turns = 6, pts = 8*turns, cr = .0078, cx = .02;
    for (let k = 0; k < pts; k++){
      const a0 = 2*Math.PI*k/8, a1 = 2*Math.PI*(k + 1)/8, z0 = SEG*k/pts, z1 = SEG*(k + 1)/pts;
      const p0 = [cx + cr*Math.cos(a0), cr*Math.sin(a0), z0], p1 = [cx + cr*Math.cos(a1), cr*Math.sin(a1), z1], d = [0,1,2].map(i => p1[i] - p0[i]);
      geoms.push(ghost({type:"capsule", radius:.0021, height:r4(Math.hypot(...d)), pos:[0,1,2].map(i => r4((p0[i] + p1[i])/2)), quat:qz(d), material:"cable"}));
    }
    if (s === K){
      /* the black claw: swivel on the line, motor block, cross plate with three link ears, the actuator's square tube, the pivot hub */
      geoms.push(ghost({type:"sphere", radius:.0045, pos:[0,0,-.003], material:"steel"}), ghost(cyl(.0028, .012, [0,0,-.01], "steel")),
        cyl(.026*S/.79, .04, [0,0,-HUB], "invis"),
        ghost(Bh(.03, .03, .034, 0, 0, -.033, "claw_k")),                            // motor block
        ghost(Bh(.05, .05, .006, 0, 0, -.053, "claw_k2")),                           // cross plate
        ghost(Bh(.02, .02, .012, 0, 0, -.062, "claw_k")),                            // actuator collar
        ghost(Bh(.012, .012, .05, 0, 0, -.088, "tube_s")),                           // square tube, the rod inside
        ghost(cyl(.03, .01, [0,0,-HUB - .006], "claw_k2")), ghost(cyl(.009, .014, [0,0,-HUB - .016], "claw_k")),
        ...[0,1,2].map(k => { const a = k*2*Math.PI/3; return ghost(Object.assign(Bh(.012, .016, .014, .03*Math.cos(a), .03*Math.sin(a), -HUB - .012, "claw_k2"), {quat:q([0,0,1], a)})); }),
        ...[0,1,2].map(k => { const a = k*2*Math.PI/3; return ghost(Object.assign(Bh(.014, .01, .012, .03*Math.cos(a), .03*Math.sin(a), -.053, "claw_k2"), {quat:q([0,0,1], a)})); }),
        /* the three links from the cross plate ears down to the arms */
        ...[0,1,2].map(k => { const a = k*2*Math.PI/3, p0 = [.03*Math.cos(a), .03*Math.sin(a), -.053], p1 = [.03*Math.cos(a), .03*Math.sin(a), -HUB - .012], d = [0,1,2].map(i => p1[i] - p0[i]);
          return ghost({type:"capsule", radius:.0024, height:r4(Math.hypot(...d)), pos:[0,1,2].map(i => r4((p0[i] + p1[i])/2)), quat:qz(d), material:"claw_k2"}); }));
      /* the coil cable's lower end ties into the hub */
      geoms.push(ghost(cyl(.0035, .01, [.012, 0, -.002], "plastic2", {quat:QY90})));
    }
    M.push({name:"seg_" + s, relation:{parent:s === 1 ? "move_x" : "seg_" + (s - 1)}, transform:{pos:[0, s === 1 ? LINE_Y : 0, s === 1 ? r4(LINE_TOP) : 0]},
      gravcomp:1, physics:{type:"rigid", motion:"dynamic", mass:s === K ? .03 : .003},
      joint:{type:"slide", axis:[0,0,1], range:[-SEG, 0], damping:.5}, geoms, collider:{}});
    constraint["hoist_" + s] = {type:"equal_joints", joint1:"seg_" + s, joint2:"lift"};
  }
  /* three spring-closed fingers, the tuned v1 profile scaled by S (opens to ~4.3 cm, tip under the capsule) */
  const fingers = [], UP = .09*S, OFF = .6, TILT = .5 - OFF, TIP = -1 - OFF, TL = .05*S, SPRING = .14, FR_ = .0065*S;
  /* visual arm in the finger frame (x out, z down): a smooth chrome blade along the collider path, bowed outward,
     with a hinge boss, knuckle pin, a dark inner rib and a rubber tip pad */
  /* visual arm in the finger frame (x out, z down): a flat black blade along the collider path, bowed outward, ending in a cupped paddle */
  function armVis(){
    const P0 = [0, 0], P1 = [Math.sin(TILT)*UP, -Math.cos(TILT)*UP], P2 = [P1[0] + Math.sin(TIP)*TL, P1[1] - Math.cos(TIP)*TL];
    const C = [P1[0] + .014, P1[1] + .003], N = 14, G = [], pt = t => [0,1].map(i => (1-t)*(1-t)*P0[i] + 2*(1-t)*t*C[i] + t*t*P2[i]);
    for (let i = 0; i < N; i++){
      const a = pt(i/N), b = pt((i + 1)/N), d = [b[0] - a[0], 0, b[1] - a[1]], L = Math.hypot(d[0], d[2]);
      G.push(ghost(Object.assign(Bh(.0042, .016, L + .001, (a[0] + b[0])/2, 0, (a[1] + b[1])/2, "claw_k"), {quat:qz(d)})));
    }
    G.push(ghost(cyl(.0018, .02, [0, 0, 0], "steel", {quat:QX90})));
    /* paddle: wider plate on the arm's end, turned in toward the axis */
    const e = pt(.82), f = pt(1), dd = [f[0] - e[0], 0, f[1] - e[1]], n = Math.hypot(dd[0], dd[2]);
    G.push(ghost(Object.assign(Bh(.0036, .03, .03, (e[0] + f[0])/2 + dd[0]/n*.004, 0, (e[1] + f[1])/2 + dd[2]/n*.004, "claw_k"), {quat:qz(dd)})));
    return G;
  }
  for (let k = 0; k < 3; k++){
    const a = k*2*Math.PI/3, name = "finger_" + (k+1); fingers.push(name);
    M.push({name, relation:{parent:"seg_" + K}, transform:{pos:[r4(.024*S*Math.cos(a)), r4(.024*S*Math.sin(a)), r4(-HUB - .025*S)], quat:q([0,0,1], a)},
      gravcomp:1, physics:{type:"rigid", motion:"dynamic", mass:.015},
      joint:{type:"hinge", axis:[0,1,0], range:[r4(-.3 - OFF), r4(.7 - OFF)], damping:.02, stiffness:SPRING, armature:.0005},
      geoms:[
        {type:"capsule", radius:r4(FR_), height:r4(UP), pos:[r4(Math.sin(TILT)*UP/2), 0, r4(-Math.cos(TILT)*UP/2)], quat:q([0,1,0], TILT), material:"invis", friction:1.4},
        {type:"capsule", radius:r4(FR_), height:r4(TL), pos:[r4(Math.sin(TILT)*UP + Math.sin(TIP)*TL/2), 0, r4(-Math.cos(TILT)*UP - Math.cos(TIP)*TL/2)], quat:q([0,1,0], TIP), material:"invis", friction:1.6},
        ...armVis()
      ], collider:{}});
  }
  const used = new Set(); M.forEach(e => e.geoms.forEach(g => used.add(g.material)));
  const asset = { _format:"simarena/asset@1.0", name:"grablab_claw_final", entities:M,
    material:Object.fromEntries([...used].map(k => [k, material[k]])), constraint,
    /* force (N m) on the 3 coupled fingers: negative opens against the springs, positive adds squeeze; no "gain" (MuJoCo rejects it) */
    coupling:{ grip:{ type:"fixed_tendon", joints:fingers.map(j => ({joint:j, coefficient:1})), drive:{forceLimit:.4, ctrlrange:[-.4,.15]} } } };
  E.push({name:"claw", asset:assetUrl, controller:{type:"direct", config:""}});


  /* ---------------- capsules: white printed shells with a seam and five small holes, one even layer across the floor ---------------- */
  const caps = [], PITCH = .07, ROW = PITCH*.866;
  for (let j = 0; j*ROW < .9; j++) for (let i = 0; i*PITCH < .92; i++){
    const x = -.44 + i*PITCH + (j % 2 ? PITCH/2 : 0) + (rnd() - .5)*.006, y = -.44 + j*ROW + (rnd() - .5)*.006;
    if (x > .44 || y > .445) continue;
    if (x > HX0 - .05 && y < HY1 + .05) continue;
    caps.push([x, y]);
  }
  const DOTS = [0,1,2,3,4].map(k => { const ph = k*Math.PI*2/5 + .3, th = .62; return [Math.sin(th)*Math.cos(ph), Math.sin(th)*Math.sin(ph), Math.cos(th)].map(v => r4(v*(R - .0012))); });
  caps.forEach(([x, y], k) => {
    E.push({name:"capsule_" + String(k + 1).padStart(3, "0"), transform:{pos:[r4(x), r4(y), r4(FZ + R + .002)], quat:q([rnd(), rnd(), 1].map((v, i, a) => v/Math.hypot(...a)), rnd()*6.28)},
      physics:{type:"rigid", motion:"dynamic", mass:.015, angularDamping:.00003, linearDamping:.0005}, joint:{type:"free"},
      geoms:[{type:"sphere", radius:R, material:"cap_white", friction:1.3},
             ghost({type:"cylinder", radius:r4(R + .0002), height:.0012, pos:[0,0,0], material:"cap_seam"}),
             ...DOTS.map(p => ghost({type:"sphere", radius:.002, pos:p, material:"cap_dot"}))], collider:{}});
  });

  /* ---------------- the filming room (same room as v1: walls, glass front and right, lamp grid, shelf, desk, tripod) ---------------- */
  const RX = 2.0, RB = 2.2, RF = -1.6, RH = 3.6, tw = .12, RD = RB - RF, RZT = RH - .07;
  fixed("room_floor", [{type:"plane", size:[10,10,.05], material:"concrete"}]);
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
      ghost(cyl(.065, .008, [x, y, zl - .064], "lamp_lens")), ghost(cyl(.079, .022, [x, y, zl - .045], "lamp_lens")), ]);
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
  E.push({name:"top_light", transform:{pos:[0,-.1,1.75]}, light:{type:"point", color:"#e6ecff", intensity:1.6, range:2.2}});
  E.push({name:"back_glow", transform:{pos:[0, 2.0, 2.2]}, light:{type:"point", color:"#7d84ff", intensity:2, range:4.5}});
  E.push({name:"chute_glow", transform:{pos:[.3535, -.3535, r4(FZ + .05)]}, light:{type:"point", color:"#ffd6a8", intensity:.04, range:.22}});
  E.push({name:"cage_led", transform:{pos:[0, .05, 1.3]}, light:{type:"spot", color:"#ffe6c4", intensity:2.2, dir:[0, 0, -1], angle:.8}});
  E.push({name:"cage_led_low", transform:{pos:[-.2, .2, .6]}, light:{type:"point", color:"#fff0dc", intensity:.22, range:1.1}});

  const task = { instruction:"Grablab Prototype 01. Press Run, open the Scene tab and click claw, then Controls. Arrow keys move the gantry. Lift left lowers the claw on its line, grip left opens it, grip back to the centre closes it on the spring grip, lift right raises it. Carry the capsule to the chute in the front right corner and open the grip: it drops through the break beam into the NFC cradle." };
  return { scene:{ _format:"simarena/scene@1.0", name:"Grablab Prototype 01", sim:{timestep:.002, gravity:[0,0,-9.81], sleep:true}, material, task, entities:E }, asset };
}
if (typeof module !== "undefined" && require.main === module){
  const fs = require("fs"), path = require("path"), { scene, asset } = buildFinalScene();
  fs.writeFileSync(path.join(__dirname, "grablab-claw-final.scene.json"), JSON.stringify(scene, null, 1));
  fs.writeFileSync(path.join(__dirname, "grablab-claw-final-mech.asset.json"), JSON.stringify(asset, null, 1));
  const g = scene.entities.reduce((s, e) => s + (e.geoms ? e.geoms.length : 0), 0) + asset.entities.reduce((s, e) => s + e.geoms.length, 0);
  console.log("wrote grablab-claw-final.scene.json + grablab-claw-final-mech.asset.json,", scene.entities.length, "entities,", g, "geoms");
} else if (typeof window !== "undefined") window.buildFinalScene = buildFinalScene;