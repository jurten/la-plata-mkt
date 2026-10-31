import { readFile, writeFile, mkdir } from 'node:fs/promises';
import sharp from 'sharp';
import { MeshoptSimplifier } from 'meshoptimizer';

// Extract grey-alien-head-3d-model.zip to artifacts/alien-source first.
// Keep the supplied source intact; publish a smaller, same-origin derivative.
const source = await readFile('artifacts/alien-source/source/Alien.glb');
const document = JSON.parse(source.subarray(20, 20 + source.readUInt32LE(12)).toString());
const binaryStart = 28 + source.readUInt32LE(12);
const binary = source.subarray(binaryStart);
const primitive = document.meshes[0].primitives[0];
function accessor(index) {
  const a = document.accessors[index], view = document.bufferViews[a.bufferView];
  const components = { SCALAR: 1, VEC2: 2, VEC3: 3 }[a.type];
  const Type = { 5126: Float32Array, 5125: Uint32Array, 5123: Uint16Array }[a.componentType];
  const offset = (view.byteOffset ?? 0) + (a.byteOffset ?? 0);
  return new Type(binary.buffer, binary.byteOffset + offset, a.count * components).slice();
}
await MeshoptSimplifier.ready;
const positions = accessor(primitive.attributes.POSITION);
const originalIndices = new Uint32Array(accessor(primitive.indices));
const [indices, error] = MeshoptSimplifier.simplify(originalIndices, positions, 3, 100_000 * 3, .003, ['LockBorder']);
const [remap, count] = MeshoptSimplifier.compactMesh(indices);
const views = [], accessors = [], parts = [];
let byteLength = 0;
function append(array, type, componentType, target, extra = {}) {
  const bytes = Buffer.from(array.buffer, array.byteOffset, array.byteLength);
  views.push({ buffer: 0, byteOffset: byteLength, byteLength: bytes.length, target });
  accessors.push({ bufferView: views.length - 1, componentType, count: array.length / { SCALAR: 1, VEC2: 2, VEC3: 3 }[type], type, ...extra });
  parts.push(bytes, Buffer.alloc((4 - bytes.length % 4) % 4));
  byteLength += bytes.length + (4 - bytes.length % 4) % 4;
  return accessors.length - 1;
}
const attributes = {};
for (const [name, index] of Object.entries(primitive.attributes)) {
  const a = document.accessors[index], input = accessor(index);
  const size = { VEC2: 2, VEC3: 3 }[a.type];
  const output = new Float32Array(count * size);
  for (let i = 0; i < remap.length; i++) if (remap[i] < count) {
    output.set(input.subarray(i * size, (i + 1) * size), remap[i] * size);
  }
  attributes[name] = append(output, a.type, 5126, 34962, name === 'POSITION' ? { min: a.min, max: a.max } : {});
}
// compactMesh already rewrites the indices in place; only attributes need remapping.
for (const index of indices) if (index >= count) throw new Error('Compacted triangle index exceeds the vertex count');
const indexAccessor = append(indices, 'SCALAR', 5125, 34963);
await mkdir('public/models/supplied-alien-textures', { recursive: true });
const imageNames = ['specular', 'normal', 'basecolor', 'metallic-roughness'];
for (const [i, image] of document.images.entries()) {
  const view = document.bufferViews[image.bufferView];
  const input = binary.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength);
  const name = imageNames[i];
  const size = name === 'basecolor' ? 1536 : 1024;
  const output = await sharp(input).resize(size, size, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: name === 'normal' ? 96 : 90 }).toBuffer();
  await writeFile(`public/models/supplied-alien-textures/${name}.jpg`, output);
  document.images[i] = { uri: `supplied-alien-textures/${name}.jpg` };
}
document.bufferViews = views;
document.accessors = accessors;
document.buffers = [{ byteLength }];
document.meshes[0].primitives[0] = { attributes, indices: indexAccessor, material: 0 };
document.asset.extras = {
  source: 'grey-alien-head-3d-model.zip / source/Alien.glb',
  author: 'Joel Dcosta (joel_shanky)',
  sourceURL: 'https://sketchfab.com/3d-models/grey-alien-head-3d-model-915a6375927e4003a8790d8932655e76',
  license: 'CC BY 4.0',
  modifications: 'Mesh simplified for the web; textures resized and externalized. Runtime cobalt tint and CRT effect.',
};
let json = Buffer.from(JSON.stringify(document));
json = Buffer.concat([json, Buffer.alloc((4 - json.length % 4) % 4, 32)]);
const header = Buffer.alloc(20);
header.writeUInt32LE(0x46546c67, 0); header.writeUInt32LE(2, 4);
header.writeUInt32LE(28 + json.length + byteLength, 8);
header.writeUInt32LE(json.length, 12); header.writeUInt32LE(0x4e4f534a, 16);
const binaryHeader = Buffer.alloc(8);
binaryHeader.writeUInt32LE(byteLength, 0); binaryHeader.writeUInt32LE(0x004e4942, 4);
const result = Buffer.concat([header, json, binaryHeader, ...parts]);
await writeFile('public/models/supplied-alien-head.glb', result);
console.log(JSON.stringify({ vertices: count, triangles: indices.length / 3, simplificationError: error, bytes: result.length }));
