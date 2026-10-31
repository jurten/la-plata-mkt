import { type BufferGeometry, MathUtils } from 'three';

/**
 * Refine the licensed Grab3D head in its authored rest coordinates (metres).
 * The original topology, UV atlas and rig remain intact. This is deliberately a
 * small anatomical correction, rather than a new primitive-based character.
 */
export function refineHeadGeometry(geometry: BufferGeometry): void {
  if (geometry.userData.lpmHeadRefinement) return;
  const position = geometry.getAttribute('position');
  if (!position || position.itemSize !== 3) throw new Error('Head geometry requires XYZ positions.');
  if (!geometry.getAttribute('normal')) geometry.computeVertexNormals();
  const normal = geometry.getAttribute('normal');

  const gaussian = (x: number, y: number, centerX: number, centerY: number, width: number, height: number) =>
    Math.exp(-.5 * (((x - centerX) / width) ** 2 + ((y - centerY) / height) ** 2));
  const smoothDerivative = (value: number, minimum: number, maximum: number) => {
    if (value <= minimum || value >= maximum) return 0;
    const amount = (value - minimum) / (maximum - minimum);
    return 6 * amount * (1 - amount) / (maximum - minimum);
  };
  const relief = (x: number, y: number) => {
    const face = MathUtils.smoothstep(y, 1.185, 1.205) * (1 - MathUtils.smoothstep(y, 1.245, 1.265));
    const cheek = gaussian(x, y, -.047, 1.207, .017, .016)
      + gaussian(x, y, .047, 1.207, .017, .016);
    const bridge = gaussian(x, y, 0, 1.214, .008, .021);
    const socketGuard = 1 - Math.min(.95,
      gaussian(x, y, -.047, 1.25, .031, .018)
      + gaussian(x, y, .047, 1.25, .031, .018));
    return face * socketGuard * (cheek * .0018 + bridge * .0012);
  };
  const derivativeStep = .000005;

  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index);
    const y = position.getY(index);
    const z = position.getZ(index);
    if (![x, y, z].every(Number.isFinite)) throw new Error('Head geometry contains nonfinite positions.');

    // The skull dome starts above the eye sockets. Its increasing width gives
    // the familiar broad cranium without pulling apart the eye rims or mouth.
    const dome = MathUtils.smoothstep(y, 1.265, 1.335);
    const domeDerivative = smoothDerivative(y, 1.265, 1.335);
    const broadening = 1 + dome * .13;
    const nextX = x * broadening;
    const nextY = y + Math.max(0, y - 1.265) * dome * .03;

    // A gentle, continuous cheek/nasal relief supplies form beneath grazing
    // light. The face-only mask leaves the back, neck and collar unmodified.
    const front = MathUtils.smoothstep(z, .025, .075);
    const surfaceRelief = relief(x, y);
    const nextZ = z + front * surfaceRelief;

    // Transport authored smooth normals with J^-T. Rebuilding triangle normals
    // opens the original UV seams; the bounded rest-space derivative does not.
    const dXdy = x * domeDerivative * .13;
    const dYdy = 1 + (y > 1.265 ? .03 * (dome + (y - 1.265) * domeDerivative) : 0);
    const dZdx = front * (relief(x + derivativeStep, y) - relief(x - derivativeStep, y)) / (2 * derivativeStep);
    const dZdy = front * (relief(x, y + derivativeStep) - relief(x, y - derivativeStep)) / (2 * derivativeStep);
    const dZdz = 1 + smoothDerivative(z, .025, .075) * surfaceRelief;
    if (broadening !== 1 || dXdy !== 0 || dYdy !== 1 || dZdx !== 0 || dZdy !== 0 || dZdz !== 1) {
      const nz = normal.getZ(index) / dZdz;
      const nx = (normal.getX(index) - dZdx * nz) / broadening;
      const ny = (normal.getY(index) - dXdy * nx - dZdy * nz) / dYdy;
      const magnitude = Math.hypot(nx, ny, nz);
      if (Number.isFinite(magnitude) && magnitude > 0) normal.setXYZ(index, nx / magnitude, ny / magnitude, nz / magnitude);
    }
    position.setXYZ(index, nextX, nextY, nextZ);
  }

  position.needsUpdate = true;
  normal.needsUpdate = true;
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  geometry.userData.lpmHeadRefinement = {
    version: 1,
    sourceCoordinates: 'Grab3D alien-grey rest-space metres',
    craniumWidthMaximum: 1.13,
    upperCraniumHeightScale: 1.03,
    topologyAndRigPreserved: true,
  };
}
