"""assets/machine/metal.json -> assets/machine/metal.glb: the same 149 meshes as glTF nodes (one node per mesh, the json key
   as the node name), params and move in the scene extras, then gltfpack with meshopt compression and no quantization,
   so positions stay plain mm floats for anatomy-metal.js.
     python build-machine-glb.py            (needs gltfpack on PATH or in GLTFPACK)"""
import base64, json, os, struct, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "assets", "machine", "metal.json"); OUT = os.path.join(HERE, "assets", "machine", "metal.glb")
d = json.load(open(SRC, encoding="utf-8")); meshes = d["meshes"]
bin_, views, accs, gmeshes, nodes = bytearray(), [], [], [], []
def view(data, target):
    while len(bin_) % 4: bin_.append(0)
    views.append({"buffer": 0, "byteOffset": len(bin_), "byteLength": len(data), "target": target}); bin_.extend(data); return len(views) - 1
for name, m in meshes.items():
    v = base64.b64decode(m["v"]); i = base64.b64decode(m["i"]); n = len(v) // 12
    f = struct.unpack("<%df" % (n * 3), v)
    lo = [min(f[k::3]) for k in range(3)]; hi = [max(f[k::3]) for k in range(3)]
    accs.append({"bufferView": view(v, 34962), "componentType": 5126, "count": n, "type": "VEC3", "min": lo, "max": hi}); pa = len(accs) - 1
    accs.append({"bufferView": view(i, 34963), "componentType": 5125 if m.get("i32") else 5123, "count": len(i) // (4 if m.get("i32") else 2), "type": "SCALAR"}); ia = len(accs) - 1
    gmeshes.append({"name": name, "primitives": [{"attributes": {"POSITION": pa}, "indices": ia}]})
    nodes.append({"name": name, "mesh": len(gmeshes) - 1})
gltf = {"asset": {"version": "2.0", "generator": "grablab build-machine-glb"}, "scene": 0,
        "scenes": [{"nodes": list(range(len(nodes))), "extras": {"params": d["params"], "move": d["move"], "names": list(meshes)}}],   # gltfpack strips node names and node extras, so the order carries the names
        "nodes": nodes, "meshes": gmeshes, "accessors": accs, "bufferViews": views, "buffers": [{"byteLength": len(bin_)}]}
js = json.dumps(gltf, separators=(",", ":")).encode(); js += b" " * (-len(js) % 4)
while len(bin_) % 4: bin_.append(0)
raw = os.path.join(HERE, "assets", "machine", "_raw.glb")
with open(raw, "wb") as f:
    f.write(struct.pack("<III", 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(bin_))); f.write(struct.pack("<II", len(js), 0x4E4F534A)); f.write(js); f.write(struct.pack("<II", len(bin_), 0x004E4942)); f.write(bin_)
gp = os.environ.get("GLTFPACK", "gltfpack")
r = subprocess.run([gp, "-i", raw, "-o", OUT, "-cc", "-vp", "16", "-kn", "-ke"], capture_output=True, text=True, shell=True)
if r.returncode: print(r.stderr); sys.exit(1)
os.remove(raw); print("raw json", os.path.getsize(SRC) // 1024, "KB -> glb", os.path.getsize(OUT) // 1024, "KB")
