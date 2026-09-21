import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { colorThemes } from '../../src/lib/themes';

const favicon = readFileSync(new URL('../../public/favicon.svg', import.meta.url), 'utf8').toLowerCase();
const ogGenerator = readFileSync(new URL('../../scripts/generate-og.py', import.meta.url), 'utf8').toLowerCase();
const production = colorThemes.light;

describe('LPM brand assets', () => {
  it('uses the production visual system in the favicon and Open Graph generator', () => {
    for (const color of [
      production.ink,
      production.bg,
      production.surface,
      production.blue,
      production.sky,
      production.signal,
      production.pulse,
    ]) {
      expect(`${favicon}\n${ogGenerator}`).toContain(color.toLowerCase());
    }
  });

  it('contains no retired palette colors or legacy constant names', () => {
    const sources = `${favicon}\n${ogGenerator}`;
    for (const retired of [
      '#17292d',
      '#f3eee6',
      '#1d62a8',
      '#f2d31b',
      '#fc4c5a',
      '#b70d8a',
      '#f4e600',
      '#85d2ff',
      '#ffc7dd',
    ]) {
      expect(sources).not.toContain(retired);
    }
    for (const legacyName of ['purple =', 'dark_purple =', 'acid =', 'soft_pink =']) {
      expect(ogGenerator).not.toContain(legacyName);
    }
  });
});
