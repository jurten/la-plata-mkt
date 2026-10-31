import { BufferAttribute, BufferGeometry } from 'three';

export interface PortraitGeometryOptions {
  /** Pixel dimensions of the registered, scalar depth image. */
  width: number;
  height: number;
  /** One normalized depth value per pixel, stored from the top row downward. */
  depth: Float32Array;
  /** Exact color-image aspect; defaults to the registered depth image's ratio. */
  aspect?: number;
  /** Grid cell counts, not vertex counts. */
  columns?: number;
  rows?: number;
  cameraDistance?: number;
  depthScale?: number;
}

/**
 * Reconstruct the original portrait as a textured, triangulated depth surface.
 *
 * XY is calibrated to the original camera: viewing from (0, 0, cameraDistance)
 * with vertical FOV 2 * atan(1 / cameraDistance) projects every vertex back onto
 * its source UV. Moving that camera reveals genuine vertex depth without
 * changing the face, silhouette, or baked photographic material at rest.
 *
 * This is deliberately a front-surface reconstruction, not an invented back
 * of the head. The supplied image contains no evidence for hidden anatomy.
 */
export function createPortraitGeometry(options: PortraitGeometryOptions): BufferGeometry {
  const { width, height, depth } = options;
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width < 2 || height < 2) {
    throw new RangeError('Portrait depth dimensions must be integers of at least two pixels.');
  }
  if (!(depth instanceof Float32Array) || depth.length !== width * height) {
    throw new RangeError('Portrait depth must contain one Float32 value per pixel.');
  }
  for (let index = 0; index < depth.length; index += 1) {
    if (!Number.isFinite(depth[index])) throw new RangeError('Portrait depth must contain only finite values.');
  }

  const aspect = options.aspect ?? width / height;
  if (!Number.isFinite(aspect) || aspect <= 0) {
    throw new RangeError('Portrait source aspect must be positive and finite.');
  }
  const columns = options.columns ?? 256;
  const rows = options.rows ?? Math.min(512, Math.max(1, Math.round(columns / aspect)));
  const cameraDistance = options.cameraDistance ?? 3;
  const depthScale = options.depthScale ?? .45;
  if (![columns, rows].every((value) => Number.isInteger(value) && value >= 1 && value <= 512)) {
    throw new RangeError('Portrait grid cell counts must be integers between one and 512.');
  }
  if (!Number.isFinite(cameraDistance) || cameraDistance <= 0) {
    throw new RangeError('Portrait camera distance must be positive and finite.');
  }
  if (!Number.isFinite(depthScale) || depthScale < 0 || depthScale >= cameraDistance * .8) {
    throw new RangeError('Portrait depth scale must be finite, nonnegative, and below 80% of camera distance.');
  }

  const stride = columns + 1;
  const vertexCount = stride * (rows + 1);
  const positions = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const indices = vertexCount > 65535
    ? new Uint32Array(columns * rows * 6)
    : new Uint16Array(columns * rows * 6);

  for (let row = 0; row <= rows; row += 1) {
    const sourceY = row / rows * (height - 1);
    const top = Math.floor(sourceY);
    const bottom = Math.min(top + 1, height - 1);
    const fractionY = sourceY - top;
    const v = 1 - row / rows;
    for (let column = 0; column <= columns; column += 1) {
      const u = column / columns;
      const sourceX = u * (width - 1);
      const left = Math.floor(sourceX);
      const right = Math.min(left + 1, width - 1);
      const fractionX = sourceX - left;
      const upperDepth = depth[top * width + left] * (1 - fractionX) + depth[top * width + right] * fractionX;
      const lowerDepth = depth[bottom * width + left] * (1 - fractionX) + depth[bottom * width + right] * fractionX;
      const sampled = Math.max(0, Math.min(1, upperDepth * (1 - fractionY) + lowerDepth * fractionY));
      const z = sampled * depthScale;
      const perspectiveScale = (cameraDistance - z) / cameraDistance;
      const vertex = row * stride + column;
      positions[vertex * 3] = (u - .5) * aspect * 2 * perspectiveScale;
      positions[vertex * 3 + 1] = (v - .5) * 2 * perspectiveScale;
      positions[vertex * 3 + 2] = z;
      uvs[vertex * 2] = u;
      uvs[vertex * 2 + 1] = v;

      if (row < rows && column < columns) {
        const nextRow = vertex + stride;
        const triangle = (row * columns + column) * 6;
        // Front-facing +Z winding; the source rows themselves run downward.
        indices[triangle] = vertex;
        indices[triangle + 1] = nextRow;
        indices[triangle + 2] = vertex + 1;
        indices[triangle + 3] = vertex + 1;
        indices[triangle + 4] = nextRow;
        indices[triangle + 5] = nextRow + 1;
      }
    }
  }

  const geometry = new BufferGeometry();
  geometry.name = 'original-alien-depth-surface';
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new BufferAttribute(uvs, 2));
  geometry.setIndex(new BufferAttribute(indices, 1));
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}
