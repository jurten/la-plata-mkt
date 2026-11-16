import { describe, expect, it } from 'vitest';
import { advanceGalaxy, createGalaxyMotion, galaxyArrivalScale } from '../../src/lib/alien/galaxy';

describe('Galaxy motion', () => {
  const inactive = { active: false, x: .5, y: .5 };

  it('brings the alien from small to full size on the opening flight without replaying on warp', () => {
    const motion = createGalaxyMotion();
    expect(galaxyArrivalScale(motion)).toBeCloseTo(.38);
    let previous = galaxyArrivalScale(motion);
    for (let frame = 0; frame < 60; frame++) {
      advanceGalaxy(motion, 1 / 24, inactive, 0);
      const scale = galaxyArrivalScale(motion);
      expect(scale).toBeGreaterThanOrEqual(previous);
      expect(scale).toBeLessThanOrEqual(1);
      previous = scale;
    }
    expect(previous).toBe(1);
    advanceGalaxy(motion, 1 / 24, inactive, 1);
    expect(galaxyArrivalScale(motion)).toBe(1);
  });

  it('moves the star layers independently of pointer input', () => {
    const motion = createGalaxyMotion();
    for (let frame = 0; frame < 96; frame++) advanceGalaxy(motion, 1 / 24, inactive, 0);
    expect(motion.time).toBeCloseTo(4);
    expect(motion.depth).toBeGreaterThan(0);
    expect(motion.angle).toBeGreaterThan(0);
    expect(motion.reveal).toBe(1);
    expect(motion.active).toBe(0);
  });

  it('damps pointer engagement and releases repulsion when the pointer leaves', () => {
    const motion = createGalaxyMotion();
    const pointer = { active: true, x: .8, y: .2 };
    advanceGalaxy(motion, 1 / 24, pointer, 0);
    expect(motion.x).toBeGreaterThan(.5);
    expect(motion.x).toBeLessThan(.8);
    expect(motion.active).toBeGreaterThan(0);
    for (let frame = 0; frame < 96; frame++) advanceGalaxy(motion, 1 / 24, inactive, 0);
    expect(motion.active).toBe(0);
  });

  it('bounds resumed time and triggers each click warp only once', () => {
    const motion = createGalaxyMotion();
    motion.reveal = 1;
    advanceGalaxy(motion, 60, inactive, 1);
    expect(motion.time).toBe(.12);
    const boost = motion.boost;
    advanceGalaxy(motion, 1 / 24, inactive, 1);
    expect(motion.boost).toBeLessThan(boost);
    advanceGalaxy(motion, 1 / 24, inactive, 2);
    expect(motion.boost).toBeGreaterThan(boost);
    expect(motion.boost).toBeLessThanOrEqual(1.6);
  });
});
