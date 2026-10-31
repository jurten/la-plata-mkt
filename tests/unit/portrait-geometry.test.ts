import { Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { createPortraitGeometry } from '../../src/lib/alien/portrait-geometry';

const width = 9;
const height = 7;
const depth = Float32Array.from({ length: width * height }, (_, index) => {
  const x = index % width;
  const y = Math.floor(index / width);
  return (x / (width - 1) + y / (height - 1)) / 2;
});

describe('the original portrait reconstructed as 3D geometry', () => {
  it('has real depth, finite unit normals, and preserves every source UV under the resting camera', () => {
    const cameraDistance = 3;
    const depthScale = .45;
    const geometry = createPortraitGeometry({ width, height, depth, columns: 12, rows: 8, cameraDistance, depthScale });
    try {
      const positions = geometry.getAttribute('position');
      const normals = geometry.getAttribute('normal');
      const uv = geometry.getAttribute('uv');
      expect(positions.count).toBe(13 * 9);
      expect(geometry.getIndex()!.count).toBe(12 * 8 * 6);
      geometry.computeBoundingBox();
      const size = geometry.boundingBox!.getSize(new Vector3());
      expect(size.x).toBeGreaterThan(1);
      expect(size.y).toBeGreaterThan(1);
      expect(size.z).toBeCloseTo(depthScale, 6);
      const point = new Vector3();
      const normal = new Vector3();
      for (let index = 0; index < positions.count; index += 1) {
        point.fromBufferAttribute(positions, index);
        normal.fromBufferAttribute(normals, index);
        expect(point.toArray().every(Number.isFinite)).toBe(true);
        expect(normal.toArray().every(Number.isFinite)).toBe(true);
        expect(normal.length()).toBeCloseTo(1, 4);
        const projectedX = point.x * cameraDistance / (cameraDistance - point.z);
        const projectedY = point.y * cameraDistance / (cameraDistance - point.z);
        expect(projectedX / (2 * width / height) + .5).toBeCloseTo(uv.getX(index), 6);
        expect(projectedY / 2 + .5).toBeCloseTo(uv.getY(index), 6);
      }
    } finally { geometry.dispose(); }
  });

  it('registers the top and bottom of the depth image to the portrait instead of mirroring its features', () => {
    const imageDepth = Float32Array.from({ length: 12 }, (_, index) => Math.floor(index / 3) / 3);
    const geometry = createPortraitGeometry({ width: 3, height: 4, depth: imageDepth, columns: 2, rows: 3, depthScale: .6 });
    try {
      const positions = geometry.getAttribute('position');
      const uv = geometry.getAttribute('uv');
      for (let index = 0; index < positions.count; index += 1) {
        // Image row zero is the top, whose texture V is one.
        expect(positions.getZ(index)).toBeCloseTo((1 - uv.getY(index)) * .6, 6);
      }
    } finally { geometry.dispose(); }
  });
});
