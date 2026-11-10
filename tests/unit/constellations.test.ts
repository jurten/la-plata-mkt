import { describe, expect, it } from 'vitest';
import { generateConstellations } from '../../src/lib/alien/constellations';

describe('generative hero sky', () => {
  it('reproduces a sky from its seed and changes stars with a new seed', () => {
    const field = generateConstellations(410);
    expect(generateConstellations(410)).toEqual(field);
    const next = generateConstellations(912);
    expect(next.stars).not.toEqual(field.stars);
  });

  it('keeps stars in frame across many generated skies', () => {
    for (let seed = 0; seed < 100; seed++) {
      const field = generateConstellations(seed);
      expect(field.stars).toHaveLength(300);
      for (const star of field.stars) {
        expect(star.x).toBeGreaterThan(0);
        expect(star.x).toBeLessThan(1);
        expect(star.y).toBeGreaterThan(0);
        expect(star.y).toBeLessThan(1);
      }
    }
  });
});
