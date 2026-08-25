import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { paletteOptions } from '../../src/lib/palettes';

const favicon = readFileSync(new URL('../../public/favicon.svg', import.meta.url), 'utf8').toLowerCase();
const ogGenerator = readFileSync(new URL('../../scripts/generate-og.py', import.meta.url), 'utf8').toLowerCase();
const production = paletteOptions[0].colors;

describe('palette-bearing brand assets', () => {
  it('uses the production ink system in the favicon and Open Graph generator', () => {
    for (const color of [
      production.ink,
      production.paper,
      production.primary,
      production.highlight,
      production.signal,
    ]) {
      expect(`${favicon}\n${ogGenerator}`).toContain(color.toLowerCase());
    }
  });

  it('contains no retired rose-system colors or legacy constant names', () => {
    const sources = `${favicon}\n${ogGenerator}`;
    for (const retired of ['#111111', '#fffdf5', '#b70d8a', '#f4e600', '#85d2ff', '#ffc7dd']) {
      expect(sources).not.toContain(retired);
    }
    for (const legacyName of ['purple =', 'dark_purple =', 'acid =', 'sky =', 'soft_pink =']) {
      expect(ogGenerator).not.toContain(legacyName);
    }
  });
});
