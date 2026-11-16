import { describe, expect, it } from 'vitest';
import { SmokeDisplacement } from '../../src/scripts/smoke-displacement';

function read(flow: SmokeDisplacement, x: number, y: number) {
 const k = (Math.round(y * (flow.height - 1)) * flow.width + Math.round(x * (flow.width - 1))) * 4;
 return [(flow.pixels[k] * 256 + flow.pixels[k + 1]) / 65535 * .3 - .15,
  (flow.pixels[k + 2] * 256 + flow.pixels[k + 3]) / 65535 * .3 - .15];
}

describe('smoke cursor displacement', () => {
 it('pushes along the whole cursor path, in either direction, without affecting distant smoke', () => {
  for (const direction of [-1, 1]) {
   const flow = new SmokeDisplacement();
   flow.step(1 / 60, .5 - direction * .1, .5, .5 + direction * .1, .5, 1440, 1000);
   expect(read(flow, .5, .5)[0] * direction).toBeGreaterThan(.01);
   expect(Math.abs(read(flow, .5, .5)[1])).toBeLessThan(.00001);
   expect(Math.abs(read(flow, .1, .1)[0])).toBeLessThan(.00001);
  }
 });

 it('responds more strongly to faster travel while keeping extreme input bounded', () => {
  const slow = new SmokeDisplacement(), fast = new SmokeDisplacement();
  slow.step(1 / 60, .49, .5, .51, .5, 1440, 1000);
  fast.step(1 / 60, .1, .5, .9, .5, 1440, 1000);
  expect(fast.energy).toBeGreaterThan(slow.energy);
  expect(fast.energy * 1440).toBeLessThan(45);
 });

 it('releases at the same rate across frame rates and adds no pressure at rest', () => {
  const remaining = [30, 60].map(fps => {
   const flow = new SmokeDisplacement();
   flow.step(1 / 60, .4, .5, .6, .5, 1440, 1000);
   const initial = flow.energy;
   for (let i = 0; i < fps; i++) flow.step(1 / fps, .6, .5, .6, .5, 1440, 1000);
   return flow.energy / initial;
  });
  expect(remaining[0]).toBeLessThan(.02);
  expect(remaining[0]).toBeCloseTo(remaining[1], 5);
 });
});
