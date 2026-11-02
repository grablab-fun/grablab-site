/* The machine's geometry: assets/machine/metal.glb (meshopt compressed, built from metal.json by build-machine-glb.py).
   Returns the same shape anatomy-metal.js always read, {params, move, meshes}, with meshes[name].geo a BufferGeometry in mm. */
import * as THREE from "./assets/vendor/three.module.min.js";
import { GLTFLoader } from "./assets/vendor/GLTFLoader.js";
import { MeshoptDecoder } from "./assets/vendor/meshopt_decoder.module.js";

export async function loadMachine(url = "assets/machine/metal.glb?v=1"){
  const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
  const g = await loader.loadAsync(url);
  g.scene.updateMatrixWorld(true);
  const meshes = {}, names = (g.scene.userData || {}).names || []; let k = 0;
  g.scene.traverse(o => {
    if (!o.isMesh) return;
    const name = names[k++] || o.name;   // gltfpack keeps the node order and nothing else
    /* gltfpack quantised the positions and moved the scale into the node: bake it back, so every vertex is a plain mm float */
    const a = o.geometry.attributes.position, f = new Float32Array(a.count * 3);
    for (let i = 0; i < a.count; i++){ f[i * 3] = a.getX(i); f[i * 3 + 1] = a.getY(i); f[i * 3 + 2] = a.getZ(i); }   // getX undoes the int16 normalisation
    const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(f, 3));
    if (o.geometry.index) geo.setIndex(o.geometry.index.clone());
    geo.applyMatrix4(o.matrixWorld);
    meshes[name] = { geo };
  });
  const x = g.scene.userData || {};
  return { params: x.params, move: x.move, meshes };
}
