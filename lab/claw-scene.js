/* Grablab claw machine as a SimArena scene (simarena/scene@1.0, MuJoCo underneath).
   node claw-scene.js        -> writes grablab-claw.scene.json + grablab-claw-mech.asset.json next to this file (keep them together)
   in a browser               -> window.buildClawScene() returns the scene object
   Units: metres, z up, the machine's front faces -y.
   Controls (press Run, click the claw): arrow keys move it (claw/move_y, claw/move_x are velocity motors), sliders claw/lift (position) and claw/grip (force on the 3 coupled fingers, 0.7 = our on-chain grip). */
function buildClawScene(assetUrl = "grablab-claw-mech.asset.json"){
  let seed = 7; const rnd = () => (seed = (seed*16807) % 2147483647) / 2147483647;
  const r4 = v => Math.round(v*1e4)/1e4;
  const q = (ax, a) => [Math.cos(a/2), ax[0]*Math.sin(a/2), ax[1]*Math.sin(a/2), ax[2]*Math.sin(a/2)].map(r4);

  const material = {
    navy:{rgba:[.03,.05,.13,1],metalness:.3,roughness:.55}, navy2:{rgba:[.06,.1,.29,1],metalness:.35,roughness:.45},
    trim:{rgba:[.12,.2,.56,1],metalness:.6,roughness:.35},
    chrome:{rgba:[.86,.89,.95,1],metalness:1,roughness:.16}, chrome_dk:{rgba:[.42,.46,.58,1],metalness:1,roughness:.25},
    glass:{rgba:[.7,.76,1,.1],metalness:.1,roughness:.05}, glass_bk:{rgba:[.18,.22,.55,.55],metalness:.1,roughness:.2},
    shell:{rgba:[.85,.89,1,.3],metalness:.2,roughness:.05},
    gold:{rgba:[1,.7,.29,1],metalness:.9,roughness:.25,emission:.35}, violet:{rgba:[.6,.48,1,1],metalness:.8,roughness:.3,emission:.4},
    rare:{rgba:[.23,.48,1,1],metalness:.9,roughness:.2,emission:.6},
    led_blue:{rgba:[.23,.48,1,1],emission:1}, led_cyan:{rgba:[.25,.91,1,1],emission:1}, led_pink:{rgba:[1,.36,.68,1],emission:1}, led_gold:{rgba:[1,.75,.4,1],emission:1},
    floor:{rgba:[.16,.19,.32,1],metalness:.1,roughness:.9},
    /* warehouse / filming bay */
    concrete:{rgba:[.1,.11,.15,1],metalness:.05,roughness:.95},
    wall:{rgba:[.06,.07,.11,1],metalness:.12,roughness:.75},
    wall_lt:{rgba:[.1,.12,.18,1],metalness:.15,roughness:.7},
    paint:{rgba:[.12,.18,.42,1],metalness:.2,roughness:.6},
    cam_body:{rgba:[.04,.05,.08,1],metalness:.45,roughness:.4},
    lens:{rgba:[.08,.1,.18,1],metalness:.75,roughness:.12},
    rec:{rgba:[1,.2,.25,1],emission:1.2},
    truss:{rgba:[.28,.31,.4,1],metalness:.8,roughness:.35},
    fixture:{rgba:[.9,.93,1,1],emission:.9},
    /* one closed room, lit lamps, control panel */
    pillar:{rgba:[.08,.1,.17,1],metalness:.3,roughness:.6},
    acoustic:{rgba:[.09,.13,.3,1],metalness:.05,roughness:.95},
    glass_room:{rgba:[.75,.82,1,.07],metalness:.1,roughness:.05},
    lamp_body:{rgba:[.05,.06,.09,1],metalness:.6,roughness:.35},
    lamp_lens:{rgba:[1,.97,.88,1],emission:2},
    beam_1:{rgba:[1,.95,.82,.09],emission:.6},
    beam_2:{rgba:[1,.95,.82,.05],emission:.4},
    beam_3:{rgba:[1,.95,.82,.03],emission:.3},
    wood:{rgba:[.22,.16,.12,1],metalness:.05,roughness:.8},
    screen:{rgba:[.2,.45,1,1],emission:1.1},
    rubber:{rgba:[.03,.03,.04,1],metalness:0,roughness:.9},
    ball_red:{rgba:[.95,.13,.2,1],metalness:.2,roughness:.25},
    btn_red:{rgba:[1,.2,.25,1],metalness:.2,roughness:.3,emission:.7},
    btn_blue:{rgba:[.3,.55,1,1],metalness:.2,roughness:.3,emission:.7}
  };
  const E = [];
  const box = (size, pos, mat, extra) => Object.assign({type:"box", size:size.map(r4), pos:pos.map(r4), material:mat}, extra);
  const ghost = g => Object.assign(g, {contype:0, conaffinity:0});
  const fixed = (name, geoms) => E.push({name, geoms, collider:{}});
  const drive = (k, d, f, lo, hi) => ({mode:"position", stiffness:k, damping:d, forceLimit:f, ctrlrange:[lo,hi]});

  /* cabinet */
  const W = .9, D = .7, X0 = -.42, X1 = .42, Y0 = -.32, Y1 = .32, PF = .75, TOP = 1.46, HX = -.22, HY = -.12;
  const CW = HX + W/2, CD = HY + D/2, CX = (-W/2 + HX)/2, CY = (-D/2 + HY)/2, H = TOP - PF, CH = .1, RZ = TOP - .06;
  fixed("floor", [{type:"plane", size:[10,10,.05], material:"concrete"},
    ghost(box([.85,.72,.003], [CX, 0, .003], "paint")),
    ghost(box([.86,.01,.006], [CX, -.74, .006], "led_blue")),
    ghost(box([.86,.01,.006], [CX, .74, .006], "led_blue")),
    ghost(box([.01,.74,.006], [CX - .86, 0, .006], "led_blue")),
    ghost(box([.01,.74,.006], [CX + .86, 0, .006], "led_blue"))
  ]);
  fixed("cabinet", [
    box([W/2 - HX, D, PF - .02], [(HX + W/2)/2, 0, (PF - .02)/2], "navy"),
    box([CW, D/2 - HY, PF - .02], [CX, (HY + D/2)/2, (PF - .02)/2], "navy"),
    box([CW, CD, .28], [CX, CY, .14], "navy"),
    box([CW, CD, .02], [CX, CY, .29], "trim"),
    box([.01, CD, PF - .3], [-W/2 + .005, CY, .3 + (PF - .3)/2], "navy"),
    box([CW, .01, .13], [CX, -D/2 + .005, PF - .065], "navy2")
  ]);
  fixed("playfield", [
    box([X1 - HX, Y1 - Y0, .02], [(X1 + HX)/2, 0, PF - .01], "navy2"),
    box([HX - X0, Y1 - HY, .02], [(X0 + HX)/2, (Y1 + HY)/2, PF - .01], "navy2")
  ]);
  fixed("chute", [
    box([.012, HY - Y0, CH], [HX, (Y0 + HY)/2, PF + CH/2], "glass"),
    box([HX - X0, .012, CH], [(X0 + HX)/2, HY, PF + CH/2], "glass"),
    ghost(box([.014, HY - Y0, .008], [HX, (Y0 + HY)/2, PF + CH], "led_gold")),
    ghost(box([HX - X0, .014, .008], [(X0 + HX)/2, HY, PF + CH], "led_gold")),
    ghost(box([CW - .02, .006, .01], [CX, -D/2 - .002, .31], "led_gold"))
  ]);
  fixed("case", [
    box([W, .01, H], [0, -D/2 + .005, PF + H/2], "glass"),
    box([W, .01, H], [0, D/2 - .005, PF + H/2], "glass_bk"),
    box([.01, D, H], [-W/2 + .005, 0, PF + H/2], "glass"),
    box([.01, D, H], [W/2 - .005, 0, PF + H/2], "glass"),
    box([W + .02, D + .02, .1], [0, 0, TOP + .05], "navy"),
    box([W + .04, .05, .14], [0, -D/2 - .005, TOP + .07], "navy2"),
    ghost(box([W - .06, .006, .02], [0, -D/2 - .032, TOP + .07], "led_blue")),
    ghost(box([.018, .018, H], [-W/2 + .01, -D/2 + .01, PF + H/2], "led_cyan")),
    ghost(box([.018, .018, H], [W/2 - .01, -D/2 + .01, PF + H/2], "led_pink")),
    ghost(box([.018, .018, H], [-W/2 + .01, D/2 - .01, PF + H/2], "led_cyan")),
    ghost(box([.018, .018, H], [W/2 - .01, D/2 - .01, PF + H/2], "led_pink")),
    ghost(box([W, .012, .012], [0, D/2 - .012, PF + .006], "led_blue"))
  ]);
  fixed("rails", [ghost(box([.03, D - .04, .02], [X0 + .01, 0, RZ], "chrome")), ghost(box([.03, D - .04, .02], [X1 - .01, 0, RZ], "chrome"))]);

  /* ---------------- one closed room around the machine ---------------- */
  /* Four walls joined at the corners by pillars, a skirting board and a ring beam on top: ONE room. The front and
     right walls are glass with mullions, so SimArena's default camera (looking in from the front-right) sees the
     machine; there is no ceiling slab, only a beam grid that carries the lamps. */
  const RX = 2.0, RB = 2.2, RF = -1.6, RH = 3.6, t = .12, RD = RB - RF, RZT = RH - .07;
  fixed("room", [
    box([2*RX + t, t, RH], [0, RB, RH/2], "wall"),                               // back wall, full width
    box([t, RD + t, RH], [-RX, (RB + RF)/2, RH/2], "wall_lt"),                   // left wall, full depth, overlaps both corners
    box([.02, RD, RH - .14], [RX, (RB + RF)/2, (RH - .14)/2 + .07], "glass_room"),   // right wall: glass, so SimArena's default camera (front-right) sees in
    ...[-.65, .3, 1.25].map(y => box([.1, .1, RH], [RX, y, RH/2], "pillar")),            // its mullions
    box([.1, RD + .2, .07], [RX, (RB + RF)/2, .035], "pillar"),
    box([.1, RD + .2, .07], [RX, (RB + RF)/2, RH - .035], "pillar"),
    box([2*RX + t, .02, RH - .14], [0, RF, (RH - .14)/2 + .07], "glass_room"),   // front wall: glass between the frame rails
    ...[[-RX, RB], [RX, RB], [-RX, RF], [RX, RF]].map(([x, y]) => box([.2, .2, RH], [x, y, RH/2], "pillar")),   // corner pillars
    box([2*RX, .03, .1], [0, r4(RB - t/2 - .015), .05], "pillar"),               // skirting boards
    box([.03, RD, .1], [r4(-RX + t/2 + .015), (RB + RF)/2, .05], "pillar"),
    box([2*RX + .2, .1, .07], [0, RF, .035], "pillar"),                           // front frame: sill + header
    box([2*RX + .2, .1, .07], [0, RF, RH - .035], "pillar")
  ]);
  /* ring beam + cross beams: the ceiling grid every lamp hangs from */
  fixed("ceiling", [
    ghost(box([2*RX + .2, .14, .1], [0, RB, RZT], "truss")),
    ghost(box([2*RX + .2, .14, .1], [0, RF, RZT], "truss")),
    ghost(box([.14, RD + .2, .1], [-RX, (RB + RF)/2, RZT], "truss")),
    ghost(box([.14, RD + .2, .1], [RX, (RB + RF)/2, RZT], "truss")),
    ...[-.65, .45, 1.45].map(y => ghost(box([2*RX, .07, .07], [0, y, RZT], "truss"))),
    ghost(box([.07, RD, .07], [0, (RB + RF)/2, RZT], "truss")),
    ghost(box([2*RX - .2, .02, .02], [0, r4(RB - t/2 - .02), RH - .16], "led_blue")),   // cove LEDs along the top of the walls
    ghost(box([.02, RD - .2, .02], [r4(-RX + t/2 + .02), (RB + RF)/2, RH - .16], "led_cyan")),
    ghost(box([.02, RD - .2, .02], [r4(RX - t/2 - .02), (RB + RF)/2, RH - .16], "led_pink"))
  ]);
  /* lamps hanging from the grid: body, glowing lens, a soft visible light shaft, and a real spot light aimed at the machine */
  /* the two front lamps were removed (they hung in front of the claw and got in the way); their light stays, as
     invisible spots in the ceiling grid */
  [[-.75, -.65], [.75, -.65]].forEach(([x, y], i) => {
    const d = [-x, -y, .75 - RZT], n = Math.hypot(...d);
    E.push({name:"front_light_" + (i + 1), transform:{pos:[x, y, r4(RZT - .1)]}, light:{type:"spot", color:"#fff2dc", intensity:5, dir:d.map(v => r4(v/n)), angle:.75}});
  });
  const LAMPS = [[0, .45], [-1.2, 1.45], [1.2, 1.45]];
  LAMPS.forEach(([x, y], i) => {
    const DROP = 1.25, zl = RZT - DROP;   /* lamps hang on long drops from the high ceiling grid */
    fixed("lamp_" + (i + 1), [
      ghost({type:"cylinder", radius:.008, height:DROP - .05, pos:[x, y, r4(RZT - (DROP - .05)/2)], material:"truss"}),
      ghost({type:"cylinder", radius:.075, height:.12, pos:[x, y, r4(zl)], material:"lamp_body"}),
      ghost({type:"cylinder", radius:.065, height:.008, pos:[x, y, r4(zl - .064)], material:"lamp_lens"}),
      ghost({type:"cylinder", radius:.079, height:.022, pos:[x, y, r4(zl - .045)], material:"lamp_lens"}),   // glowing rim, so a lamp reads as "on" from any angle
      ghost({type:"cylinder", radius:.09, height:.35, pos:[x, y, r4(zl - .25)], material:"beam_1"}),
      /* the soft shaft stops above the machine roof, otherwise it shows up inside the glass case */
      ...(Math.abs(x) < .7 && Math.abs(y) < .6 ? [] : [
        ghost({type:"cylinder", radius:.16, height:.45, pos:[x, y, r4(zl - .65)], material:"beam_2"}),
        ghost({type:"cylinder", radius:.24, height:.5, pos:[x, y, r4(zl - 1.12)], material:"beam_3"})])
    ]);
    const d = [-x, -y, .75 - zl], n = Math.hypot(...d);
    E.push({name:"lamp_light_" + (i + 1), transform:{pos:[x, y, r4(zl - .08)]}, light:{type:"spot", color:"#fff2dc", intensity:i < 1 ? 5 : 3, dir:d.map(v => r4(v/n)), angle:.75, castShadow:i === 0}});
  });
  E.push({name:"back_glow", transform:{pos:[0, 2.0, 2.2]}, light:{type:"point", color:"#7d84ff", intensity:2, range:4.5}});
  /* back wall: acoustic panels around the Grablab sign */
  const ACC = [];
  for (let c = 0; c < 6; c++) for (let r = 0; r < 2; r++){
    const x = -1.62 + c*.65, z = .75 + r*.72;
    if (Math.abs(x) < .5 && r === 1) continue;
    ACC.push(box([.58, .05, .64], [r4(x), r4(RB - t/2 - .025), r4(z)], "acoustic"));
  }
  fixed("back_wall_detail", [...ACC,
    box([.95, .05, .34], [0, r4(RB - t/2 - .03), 2.05], "navy2"),
    ghost(box([.9, .012, .012], [0, r4(RB - t/2 - .06), 1.87], "led_cyan")),
    ghost(box([.9, .012, .012], [0, r4(RB - t/2 - .06), 2.23], "led_cyan")),
    ghost(box([.5, .01, .05], [0, r4(RB - t/2 - .06), 2.05], "led_gold"))
  ]);
  /* left wall: capsule shelving */
  const SX = -RX + t/2 + .2, SH = [];
  [.35, .85, 1.35, 1.85].forEach(z => SH.push(box([.36, 1.3, .03], [r4(SX), .9, z], "wood")));
  [.28, 1.52].forEach(y => SH.push(box([.36, .04, 1.9], [r4(SX), y, .95], "pillar")));
  [.85, 1.35].forEach((z, k) => { for (let j = 0; j < 5; j++) SH.push(box([.22, .2, .16], [r4(SX), r4(.42 + j*.24), r4(z + .095)], k ? (j % 2 ? "violet" : "gold") : "navy2")); });
  for (let j = 0; j < 9; j++) SH.push({type:"sphere", radius:.038, pos:[r4(SX + (j % 2 ? .07 : -.07)), r4(.36 + j*.13), r4(1.85 + .053)], material:"shell"});
  fixed("shelf", SH);
  /* right side: the operator desk, where the stream is run from */
  const DX = 1.45, DY = .95;
  fixed("desk", [
    box([.6, 1.1, .035], [DX, DY, .74], "wood"),
    ...[[-.27, -.5], [.27, -.5], [-.27, .5], [.27, .5]].map(([dx, dy]) => box([.04, .04, .72], [r4(DX + dx), r4(DY + dy), .36], "pillar")),
    box([.06, .5, .32], [r4(DX + .18), DY, .95], "lamp_body"),
    ghost(box([.012, .46, .28], [r4(DX + .145), DY, .95], "screen")),
    box([.18, .42, .015], [r4(DX - .05), DY, .765], "lamp_body"),
    {type:"cylinder", radius:.2, height:.05, pos:[r4(DX - .55), DY, .5], material:"lamp_body"},
    {type:"cylinder", radius:.025, height:.48, pos:[r4(DX - .55), DY, .24], material:"truss"}
  ]);
  /* one camera on a tripod, off to the side at a filming angle so it never hides the control panel (ghost: no collision) */
  function camRig(name, px, py){
    const z = 1.25, yaw = Math.atan2(-py, -px), Q = q([0,0,1], yaw), c = Math.cos(yaw), s = Math.sin(yaw);
    const feet = [0,1,2].map(i => { const a = yaw + Math.PI + (i-1)*1.0; return ghost(Object.assign(box([.16,.014,.014], [r4(px + .13*Math.cos(a)), r4(py + .13*Math.sin(a)), .014], "truss"), {quat:q([0,0,1], a)})); });
    fixed(name, [
      ghost({type:"cylinder", radius:.018, height:z - .12, pos:[px, py, r4((z - .12)/2)], material:"truss"}),
      ...feet,
      ghost(box([.06,.06,.05], [px, py, r4(z)], "cam_body")),
      ghost(Object.assign(box([.16,.09,.1], [px, py, r4(z + .075)], "cam_body"), {quat:Q})),
      ghost(Object.assign(box([.08,.055,.055], [r4(px + .12*c), r4(py + .12*s), r4(z + .075)], "lens"), {quat:Q})),
      ghost(box([.012,.012,.012], [r4(px + .07*c - .05*s), r4(py + .07*s + .05*c), r4(z + .135)], "rec"))
    ]);
  }
  camRig("camera", .95, -1.15);

  /* control panel on the front of the cabinet, in front of the capsules: joystick, GRAB, START and the coin slot */
  const CPX = .12, CPY = -D/2 - .085, CPZ = .7, TILT_CP = .2;
  fixed("controls", [
    Object.assign(box([.62, .17, .05], [CPX, CPY, CPZ], "navy2"), {quat:q([1,0,0], TILT_CP)}),
    Object.assign(ghost(box([.62, .006, .012], [CPX, r4(CPY - .086), r4(CPZ - .02)], "led_blue")), {quat:q([1,0,0], TILT_CP)}),
    box([.62, .02, .22], [CPX, r4(-D/2 - .01), .56], "navy"),
    ghost({type:"cylinder", radius:.035, height:.008, pos:[r4(CPX - .14), r4(CPY - .01), r4(CPZ + .03)], material:"chrome"}),
    ghost({type:"cylinder", radius:.022, height:.01, pos:[r4(CPX - .14), r4(CPY - .01), r4(CPZ + .037)], material:"rubber"}),
    ghost({type:"cylinder", radius:.008, height:.09, pos:[r4(CPX - .14), r4(CPY - .01), r4(CPZ + .082)], material:"chrome_dk"}),
    ghost({type:"sphere", radius:.028, pos:[r4(CPX - .14), r4(CPY - .01), r4(CPZ + .14)], material:"ball_red"}),
    ghost({type:"cylinder", radius:.04, height:.012, pos:[r4(CPX + .1), r4(CPY - .005), r4(CPZ + .03)], material:"chrome"}),
    ghost({type:"cylinder", radius:.032, height:.026, pos:[r4(CPX + .1), r4(CPY - .005), r4(CPZ + .048)], material:"btn_red"}),
    ghost({type:"cylinder", radius:.017, height:.008, pos:[r4(CPX + .22), r4(CPY + .01), r4(CPZ + .03)], material:"chrome"}),
    ghost({type:"cylinder", radius:.013, height:.016, pos:[r4(CPX + .22), r4(CPY + .01), r4(CPZ + .04)], material:"btn_blue"}),
    ghost(box([.07, .006, .1], [r4(CPX + .16), r4(-D/2 - .021), .52], "chrome")),
    ghost(box([.006, .008, .05], [r4(CPX + .16), r4(-D/2 - .025), .53], "rubber")),
    ghost(box([.05, .007, .01], [r4(CPX + .16), r4(-D/2 - .025), .485], "btn_red"))
  ]);

  /* The motor ORDER matters in SimArena: its arrow keys write [up/down, 0, left/right] into the first three motors of the
     selected robot (made for walking robots), and its sliders share that same command buffer. So:
       0 move_y : velocity, arrow up = back, arrow down = front, stops when released
       1 lift   : velocity too (slider left = down, right = up); it stops at the grab depth (-0.42) and at the top
       2 move_x : velocity, joint axis points to -x so arrow left = left
       3 grip   : force on the 3 coupled fingers; springs keep the claw CLOSED (that spring force is our 70% grip),
                  slider left opens it, back to the centre closes it on the capsule. Never touched by the arrows.
     Why velocity + springs: when one slider moves, SimArena resends the other sliders' values and often sends 0
     for them. With this design a stray 0 means "stop" for motion and "stay closed" for the claw, never "jump".
     The tree follows that order: Y bridge -> lift -> X trolley -> fingers. Space can't be bound: SimArena only listens to arrows. */
  const vel = (lo, hi) => ({mode:"velocity", damping:60, forceLimit:80, ctrlrange:[lo, hi]});
  const M = [];
  M.push({name:"move_y", transform:{pos:[0, .05, r4(RZ)]}, physics:{type:"rigid", motion:"dynamic", mass:.6},
    joint:{type:"slide", axis:[0,1,0], range:[-.3,.22], damping:4, drive:vel(-.12,.12)},
    geoms:[ghost(box([W - .06, .035, .025], [0,0,0], "chrome"))], collider:{}});
  M.push({name:"lift", relation:{parent:"move_y"}, transform:{pos:[0,0,-.035]}, gravcomp:1, physics:{type:"rigid", motion:"dynamic", mass:.1},
    joint:{type:"slide", axis:[0,0,1], range:[-.42,0], damping:10, drive:{mode:"velocity", damping:120, forceLimit:80, ctrlrange:[-.1,.1]}}, geoms:[], collider:{}});
  M.push({name:"move_x", relation:{parent:"lift"}, transform:{pos:[.12,0,-.07]}, gravcomp:1, physics:{type:"rigid", motion:"dynamic", mass:.3},
    joint:{type:"slide", axis:[-1,0,0], range:[-.26,.5], damping:4, drive:vel(-.12,.12)},
    geoms:[{type:"cylinder", radius:.032, height:.05, pos:[0,0,0], material:"chrome"},
           ghost({type:"cylinder", radius:.004, height:.3, pos:[0,0,.17], material:"chrome_dk"}),
           ghost(box([.09,.08,.04], [0,0,.06], "navy2")),
           ghost({type:"cylinder", radius:.034, height:.006, pos:[0,0,-.012], material:"led_blue"})], collider:{}});
  const fingers = [];
  /* profile from a 2D sweep: opens to ~5.5 cm, tip meets the capsule 3 cm below its centre. The geometry is built
     0.6 rad more closed (OFF) so the hinge spring, which pulls towards angle 0, keeps the claw shut */
  const UP = .09, OFF = .6, TILT = .5 - OFF, TIP = -1 - OFF, TL = .05, SPRING = .14;
  for (let k = 0; k < 3; k++){
    const a = k*2*Math.PI/3, name = "finger_" + (k+1); fingers.push(name);
    /* local +x points away from the hub; hinge about local y, +angle swings the tip inward (closes) */
    M.push({name, relation:{parent:"move_x"}, transform:{pos:[r4(.024*Math.cos(a)), r4(.024*Math.sin(a)), -.025], quat:q([0,0,1], a)},
      gravcomp:1, physics:{type:"rigid", motion:"dynamic", mass:.02},
      joint:{type:"hinge", axis:[0,1,0], range:[r4(-.3 - OFF), r4(.7 - OFF)], damping:.02, stiffness:SPRING, armature:.0005},
      geoms:[
        {type:"capsule", radius:.0065, height:UP, pos:[r4(Math.sin(TILT)*UP/2), 0, r4(-Math.cos(TILT)*UP/2)], quat:q([0,1,0], TILT), material:"chrome", friction:1.4},
        {type:"capsule", radius:.0065, height:TL, pos:[r4(Math.sin(TILT)*UP + Math.sin(TIP)*TL/2), 0, r4(-Math.cos(TILT)*UP - Math.cos(TIP)*TL/2)], quat:q([0,1,0], TIP), material:"chrome", friction:1.6}
      ], collider:{}});
  }
  const pick = (...k) => Object.fromEntries(k.map(n => [n, material[n]]));
  const asset = { _format:"simarena/asset@1.0", name:"grablab_claw", entities:M,
    material: pick("chrome", "chrome_dk", "navy2", "led_blue"),
    /* force (N·m) on the 3 coupled fingers: negative opens against the springs, positive adds squeeze.
       no "gain": SimArena writes it as an attribute MuJoCo rejects, and gain 1 is what we want anyway */
    coupling: { grip:{ type:"fixed_tendon", joints:fingers.map(j => ({joint:j, coefficient:1})), drive:{forceLimit:.4, ctrlrange:[-.4,.15]} } } };
  E.push({name:"claw", asset:assetUrl, controller:{type:"direct", config:""}});

  /* capsules : glass shell + coin */
  const R = .038, spots = [];
  /* a full bottom layer about 10 cm apart, plus a second layer resting in the gaps: about 40 capsules */
  for (let row = 0; row < 6; row++) for (let col = 0; col < 6; col++){
    const x = HX + .07 + col*.105 + (row % 2 ? .05 : 0) + (rnd() - .5)*.02, y = Y0 + .055 + row*.105 + (rnd() - .5)*.02;
    if (x <= X1 - .045 && y <= Y1 - .045) spots.push([x, y, PF + R + .002]);
  }
  for (let k = 0; k < 10; k++){
    const x = HX + .14 + rnd()*(X1 - .1 - HX - .14), y = Y0 + .1 + rnd()*(Y1 - .1 - Y0 - .1);
    spots.push([x, y, PF + R*2.7 + k*.004]);
  }
  spots.forEach(([x, y, z], i) => {
    const r = rnd(), kind = r < .1 ? "rare" : r < .38 ? "violet" : "gold";
    E.push({name:"capsule_" + String(i+1).padStart(2,"0"), transform:{pos:[r4(x), r4(y), r4(z)]}, physics:{type:"rigid", motion:"dynamic", mass:.03}, joint:{type:"free"},
      geoms:[{type:"sphere", radius:R, material:"shell", friction:1.3},
             ghost({type:"cylinder", radius:r4(R*.55), height:.008, quat:q([1,0,0], Math.PI/2), material:kind})], collider:{}});
  });

  /* lights */
  E.push({name:"key_light", transform:{pos:[.6,-1.2,2.2]}, light:{type:"spot", color:"#dfe6ff", intensity:6, dir:[-.3,.6,-.8], angle:.7, castShadow:true}});
  E.push({name:"inner_glow", transform:{pos:[0,.1,r4(TOP - .1)]}, light:{type:"point", color:"#7d84ff", intensity:1.6, range:1.4}});
  E.push({name:"chute_glow", transform:{pos:[r4((X0 + HX)/2), r4((Y0 + HY)/2), r4(PF + .05)]}, light:{type:"point", color:"#ffb24a", intensity:.8, range:.5}});

  const task = { instruction:"Press Run, open the Scene tab and click claw, then Controls. Arrow keys move the claw. Grip left opens it, lift left lowers it, grip back to the centre closes it (70% spring grip), lift right raises it. Carry the capsule to the gold chute (front left) with the arrows and open the grip." };
  return { scene:{ _format:"simarena/scene@1.0", name:"Grablab claw machine", sim:{timestep:.002, gravity:[0,0,-9.81]}, material, task, entities:E }, asset };
}
if (typeof module !== "undefined" && require.main === module){
  const fs = require("fs"), path = require("path"), { scene, asset } = buildClawScene();
  fs.writeFileSync(path.join(__dirname, "grablab-claw.scene.json"), JSON.stringify(scene, null, 1));
  fs.writeFileSync(path.join(__dirname, "grablab-claw-mech.asset.json"), JSON.stringify(asset, null, 1));
  console.log("wrote grablab-claw.scene.json + grablab-claw-mech.asset.json");
} else if (typeof window !== "undefined") window.buildClawScene = buildClawScene;
