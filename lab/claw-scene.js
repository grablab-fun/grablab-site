/* Grablab claw machine as a SimArena scene (simarena/scene@1.0, MuJoCo underneath).
   node claw-scene.js        -> writes grablab-claw.scene.json + grablab-claw-mech.asset.json next to this file (keep them together)
   in a browser               -> window.buildClawScene() returns the scene object
   Units: metres, z up, the machine's front faces -y.
   Motors (sliders in SimArena, select any part of the claw): claw/gantry_x, claw/gantry_y, claw/lift (position) and claw/grip (force on the 3 coupled fingers, 0.7 = our on-chain grip). */
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
    floor:{rgba:[.16,.19,.32,1],metalness:.1,roughness:.9}
  };
  const E = [];
  const box = (size, pos, mat, extra) => Object.assign({type:"box", size:size.map(r4), pos:pos.map(r4), material:mat}, extra);
  const ghost = g => Object.assign(g, {contype:0, conaffinity:0});
  const fixed = (name, geoms) => E.push({name, geoms, collider:{}});
  const drive = (k, d, f, lo, hi) => ({mode:"position", stiffness:k, damping:d, forceLimit:f, ctrlrange:[lo,hi]});

  /* cabinet */
  const W = .9, D = .7, X0 = -.42, X1 = .42, Y0 = -.32, Y1 = .32, PF = .75, TOP = 1.46, HX = -.22, HY = -.12;
  const CW = HX + W/2, CD = HY + D/2, CX = (-W/2 + HX)/2, CY = (-D/2 + HY)/2, H = TOP - PF, CH = .1, RZ = TOP - .06;
  fixed("floor", [{type:"plane", size:[6,6,.01], material:"floor"}]);
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

  /* motors are overdamped (slow, smooth) like a real claw: a fast yank shakes the capsule loose.
     gantry : x carriage -> y trolley -> lift -> 3 fingers. Packaged as a SimArena ASSET (like the SO-100 arm):
     the editor re-expands assets when the sim starts, which keeps the grip coupling, and names every motor "claw/..."
     so selecting any part of the claw shows sliders: claw/gantry_x, claw/gantry_y, claw/lift, claw/grip */
  const M = [];
  M.push({name:"gantry_x", transform:{pos:[.12, 0, r4(RZ)]}, physics:{type:"rigid", motion:"dynamic", mass:.6},
    joint:{type:"slide", axis:[1,0,0], range:[-.5,.26], damping:4, drive:drive(150,70,80,-.5,.26)},
    geoms:[ghost(box([.035, D - .06, .025], [0,0,0], "chrome"))], collider:{}});
  M.push({name:"gantry_y", relation:{parent:"gantry_x"}, transform:{pos:[0,.05,-.035]}, physics:{type:"rigid", motion:"dynamic", mass:.4},
    joint:{type:"slide", axis:[0,1,0], range:[-.3,.22], damping:4, drive:drive(150,70,80,-.3,.22)},
    geoms:[ghost(box([.09,.08,.045],[0,0,0],"navy2")), ghost(box([.092,.01,.01],[0,-.041,0],"led_blue"))], collider:{}});
  M.push({name:"lift", relation:{parent:"gantry_y"}, transform:{pos:[0,0,-.07]}, gravcomp:1, physics:{type:"rigid", motion:"dynamic", mass:.3},
    joint:{type:"slide", axis:[0,0,1], range:[-.5,0], damping:10, drive:drive(150,90,120,-.5,0)},
    geoms:[{type:"cylinder", radius:.032, height:.05, pos:[0,0,0], material:"chrome"},
           ghost({type:"cylinder", radius:.006, height:.09, pos:[0,0,.07], material:"chrome_dk"}),
           ghost({type:"cylinder", radius:.034, height:.006, pos:[0,0,-.012], material:"led_blue"})], collider:{}});
  const fingers = [];
  const UP = .09, TILT = .5, TIP = -1, TL = .05;   /* profile from a 2D sweep: opens to ~5.5 cm, tip meets the capsule 3 cm below its centre */
  for (let k = 0; k < 3; k++){
    const a = k*2*Math.PI/3, name = "finger_" + (k+1); fingers.push(name);
    /* local +x points away from the hub; hinge about local y, +angle swings the tip inward (closes) */
    M.push({name, relation:{parent:"lift"}, transform:{pos:[r4(.024*Math.cos(a)), r4(.024*Math.sin(a)), -.025], quat:q([0,0,1], a)},
      gravcomp:1, physics:{type:"rigid", motion:"dynamic", mass:.02},
      joint:{type:"hinge", axis:[0,1,0], range:[-.3,.7], damping:.02, armature:.0005},
      geoms:[
        {type:"capsule", radius:.0065, height:UP, pos:[r4(Math.sin(TILT)*UP/2), 0, r4(-Math.cos(TILT)*UP/2)], quat:q([0,1,0], TILT), material:"chrome", friction:1.4},
        {type:"capsule", radius:.0065, height:TL, pos:[r4(Math.sin(TILT)*UP + Math.sin(TIP)*TL/2), 0, r4(-Math.cos(TILT)*UP - Math.cos(TIP)*TL/2)], quat:q([0,1,0], TIP), material:"chrome", friction:1.6}
      ], collider:{}});
  }
  const pick = (...k) => Object.fromEntries(k.map(n => [n, material[n]]));
  const asset = { _format:"simarena/asset@1.0", name:"grablab_claw", entities:M,
    material: pick("chrome", "chrome_dk", "navy2", "led_blue"),
    /* force (N·m) on the 3 coupled fingers: negative opens, positive squeezes; 0.105 = 70% of full grip, the value we lock on-chain.
       no "gain": SimArena writes it as an attribute MuJoCo rejects, and gain 1 is what we want anyway */
    coupling: { grip:{ type:"fixed_tendon", joints:fingers.map(j => ({joint:j, coefficient:1})), drive:{forceLimit:.15, ctrlrange:[-.15,.15]} } } };
  E.push({name:"claw", asset:assetUrl, controller:{type:"direct", config:""}});

  /* capsules : glass shell + coin */
  const R = .038, spots = [];
  /* one loose layer, ~12 cm apart, so an open claw can reach the floor between neighbours */
  for (let row = 0; row < 5; row++) for (let col = 0; col < 5; col++){
    const x = HX + .08 + col*.122 + (row % 2 ? .05 : 0) + (rnd() - .5)*.025, y = Y0 + .065 + row*.13 + (rnd() - .5)*.025;
    if (x <= X1 - .045) spots.push([x, y, PF + R + .002]);
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

  const task = { instruction:"Drive the claw over a capsule, lower it to about -0.42, squeeze (grip 0.105 = 70%), lift, carry it over the gold chute (gantry_x -0.44, gantry_y -0.27) and open." };
  return { scene:{ _format:"simarena/scene@1.0", name:"Grablab claw machine", sim:{timestep:.002, gravity:[0,0,-9.81]}, material, task, entities:E }, asset };
}
if (typeof module !== "undefined" && require.main === module){
  const fs = require("fs"), path = require("path"), { scene, asset } = buildClawScene();
  fs.writeFileSync(path.join(__dirname, "grablab-claw.scene.json"), JSON.stringify(scene, null, 1));
  fs.writeFileSync(path.join(__dirname, "grablab-claw-mech.asset.json"), JSON.stringify(asset, null, 1));
  console.log("wrote grablab-claw.scene.json + grablab-claw-mech.asset.json");
} else if (typeof window !== "undefined") window.buildClawScene = buildClawScene;
