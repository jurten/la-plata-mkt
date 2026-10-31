import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { BufferAttribute, BufferGeometry, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { refineHeadGeometry } from '../../src/lib/alien/refine-head-geometry';

type Accessor = { bufferView: number; byteOffset?: number; componentType: number; count: number; type: string; normalized?: boolean };
type View = { byteOffset?: number; byteLength: number; byteStride?: number };

// Exercise the actual licensed asset, including its authored rig/UV attributes.
function loadHead() {
  const bytes = readFileSync(new URL('../../public/models/alien-grey-head-web.glb', import.meta.url));
  expect(bytes.toString('ascii', 0, 4)).toBe('glTF');
  const jsonLength = bytes.readUInt32LE(12);
  const gltf = JSON.parse(bytes.toString('utf8', 20, 20 + jsonLength));
  const binary = bytes.subarray(28 + jsonLength);
  const primitive = gltf.meshes[0].primitives[0];
  const arity: Record<string, number> = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
  const componentBytes: Record<number, number> = { 5121: 1, 5123: 2, 5125: 4, 5126: 4 };
  const attribute = (index: number) => {
    const a = gltf.accessors[index] as Accessor;
    const v = gltf.bufferViews[a.bufferView] as View;
    const width = componentBytes[a.componentType] * arity[a.type];
    const packed = new Uint8Array(a.count * width);
    const offset = (v.byteOffset ?? 0) + (a.byteOffset ?? 0);
    for (let i = 0; i < a.count; i++) packed.set(binary.subarray(offset + i * (v.byteStride ?? width), offset + i * (v.byteStride ?? width) + width), i * width);
    const values = a.componentType === 5126 ? new Float32Array(packed.buffer)
      : a.componentType === 5125 ? new Uint32Array(packed.buffer)
        : a.componentType === 5123 ? new Uint16Array(packed.buffer) : packed;
    return new BufferAttribute(values, arity[a.type], a.normalized ?? false);
  };
  const geometry = new BufferGeometry();
  const names: Record<string, string> = { POSITION: 'position', NORMAL: 'normal', TEXCOORD_0: 'uv', JOINTS_0: 'skinIndex', WEIGHTS_0: 'skinWeight' };
  for (const [name, index] of Object.entries(primitive.attributes)) geometry.setAttribute(names[name], attribute(index as number));
  geometry.setIndex(attribute(primitive.indices));
  return { geometry, gltf };
}

function checksum(attribute: BufferAttribute) {
  const a = attribute.array;
  return createHash('sha256').update(new Uint8Array(a.buffer, a.byteOffset, a.byteLength)).digest('hex');
}

describe('refining the licensed rigged alien head', () => {
  it('retains the real topology, material maps, UV atlas and rig while keeping finite volumetric geometry', () => {
    const { geometry, gltf } = loadHead();
    try {
      const preserved = ['uv', 'skinIndex', 'skinWeight'].map((name) => ({ name, attribute: geometry.getAttribute(name), hash: checksum(geometry.getAttribute(name) as BufferAttribute) }));
      const index = geometry.getIndex()!;
      const indexHash = checksum(index);
      const positionCount = geometry.getAttribute('position').count;
      expect(gltf.skins).toHaveLength(1);
      expect(gltf.nodes.some((node: { name?: string }) => node.name === 'Head')).toBeTruthy();
      expect(gltf.materials[0].normalTexture).toBeDefined();
      expect(gltf.materials[0].pbrMetallicRoughness.baseColorTexture).toBeDefined();
      expect(gltf.materials[0].pbrMetallicRoughness.metallicRoughnessTexture).toBeDefined();
      expect(index.count / 3).toBeGreaterThan(50_000);
      refineHeadGeometry(geometry);
      expect(geometry.getAttribute('position').count).toBe(positionCount);
      expect(geometry.getIndex()).toBe(index);
      expect(checksum(geometry.getIndex()!)).toBe(indexHash);
      for (const item of preserved) {
        expect(geometry.getAttribute(item.name)).toBe(item.attribute);
        expect(checksum(geometry.getAttribute(item.name) as BufferAttribute)).toBe(item.hash);
      }
      const positions = geometry.getAttribute('position');
      const normals = geometry.getAttribute('normal');
      let nonfinite = 0, normalError = 0;
      const point = new Vector3();
      for (let i = 0; i < positions.count; i++) {
        point.fromBufferAttribute(positions, i);
        if (!point.toArray().every(Number.isFinite)) nonfinite++;
        point.fromBufferAttribute(normals, i);
        if (!point.toArray().every(Number.isFinite)) nonfinite++;
        normalError = Math.max(normalError, Math.abs(point.length() - 1));
      }
      expect(nonfinite).toBe(0);
      expect(normalError).toBeLessThan(.001);
      const size = geometry.boundingBox!.getSize(new Vector3());
      expect(size.x).toBeGreaterThan(.25);
      expect(size.y).toBeGreaterThan(.35);
      expect(size.z).toBeGreaterThan(.15);
    } finally { geometry.dispose(); }
  });

  it('broadens the upper cranium without moving the neck, mouth or core eye lenses, and does not apply twice', () => {
    const { geometry } = loadHead();
    try {
      const before = new Float32Array(geometry.getAttribute('position').array);
      refineHeadGeometry(geometry);
      const after = geometry.getAttribute('position');
      let fixedVertices = 0, fixedError = 0, eyeVertices = 0, eyeError = 0, domeVertices = 0, widthError = 0;
      for (let i = 0; i < after.count; i++) {
        const x = before[i * 3], y = before[i * 3 + 1], z = before[i * 3 + 2];
        const change = Math.hypot(after.getX(i) - x, after.getY(i) - y, after.getZ(i) - z);
        if (y < 1.185) { fixedVertices++;fixedError = Math.max(fixedError, change); }
        if (Math.abs(x) > .03 && Math.abs(x) < .08 && y > 1.234 && y < 1.262 && z > .06) {
          eyeVertices++;eyeError = Math.max(eyeError, change);
        }
        if (y > 1.335 && Math.abs(x) > .03) {
          domeVertices++;widthError = Math.max(widthError, Math.abs(after.getX(i) / x - 1.13));
          expect(after.getY(i)).toBeGreaterThan(y);
        }
      }
      expect(fixedVertices).toBeGreaterThan(1000);
      expect(fixedError).toBe(0);
      expect(eyeVertices).toBeGreaterThan(100);
      expect(eyeError).toBeLessThan(.00025);
      expect(domeVertices).toBeGreaterThan(500);
      expect(widthError).toBeLessThan(.00001);
      const once = checksum(after as BufferAttribute);
      refineHeadGeometry(geometry);
      expect(checksum(geometry.getAttribute('position') as BufferAttribute)).toBe(once);
    } finally { geometry.dispose(); }
  });

  it('keeps authored smooth normals continuous across duplicated UV-seam vertices', () => {
    const { geometry } = loadHead();
    try {
      const positions = geometry.getAttribute('position');
      const originalNormals = new Float32Array(geometry.getAttribute('normal').array);
      const seams = new Map<string, number[]>();
      for (let i = 0; i < positions.count; i++) {
        // A micrometre bucket captures exported duplicates without merging
        // unrelated nearby surfaces or altering the model's UV/rig attributes.
        const key = [positions.getX(i), positions.getY(i), positions.getZ(i)].map((v) => Math.round(v * 1e6)).join(':');
        const group = seams.get(key) ?? [];
        group.push(i);seams.set(key, group);
      }
      refineHeadGeometry(geometry);
      const normals = geometry.getAttribute('normal');
      const one = new Vector3(), two = new Vector3();
      const authoredSmoothDot = Math.cos(.1 * Math.PI / 180);
      let checkedPairs = 0, maximumAngle = 0;
      for (const vertices of seams.values()) for (let i = 0; i < vertices.length; i++) for (let j = i + 1; j < vertices.length; j++) {
        const a = vertices[i], b = vertices[j];
        one.fromArray(originalNormals, a * 3).normalize();two.fromArray(originalNormals, b * 3).normalize();
        // Preserve intentional hard boundaries; this regression specifically
        // guards smooth skin being split by a per-UV-island normal recompute.
        if (one.dot(two) < authoredSmoothDot) continue;
        one.fromBufferAttribute(normals, a).normalize();two.fromBufferAttribute(normals, b).normalize();
        maximumAngle = Math.max(maximumAngle, Math.acos(Math.max(-1, Math.min(1, one.dot(two)))) * 180 / Math.PI);
        checkedPairs++;
      }
      expect(checkedPairs).toBeGreaterThan(100);
      expect(maximumAngle).toBeLessThan(1);
    } finally { geometry.dispose(); }
  });
});
