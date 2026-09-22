import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { colorThemes } from '../../src/lib/themes';

const favicon = readFileSync(new URL('../../public/favicon.svg', import.meta.url), 'utf8').toLowerCase();
const faviconIcoUrl = new URL('../../public/favicon.ico', import.meta.url);
const faviconGeneratorUrl = new URL('../../scripts/generate-favicon.py', import.meta.url);
const ogGenerator = readFileSync(new URL('../../scripts/generate-og.py', import.meta.url), 'utf8').toLowerCase();
const production = colorThemes.light;

describe('LPM brand assets', () => {
  it('publishes a reproducible multi-size ICO matching the vector mark', () => {
    expect(existsSync(faviconIcoUrl)).toBe(true);
    expect(existsSync(faviconGeneratorUrl)).toBe(true);

    const ico = readFileSync(faviconIcoUrl);
    expect([...ico.subarray(0, 4)]).toEqual([0, 0, 1, 0]);
    const imageCount = ico.readUInt16LE(4);
    expect(imageCount).toBe(4);
    const sizes = Array.from({ length: imageCount }, (_, index) => {
      const encodedSize = ico[6 + index * 16];
      return encodedSize === 0 ? 256 : encodedSize;
    });
    expect(sizes).toEqual([16, 32, 48, 64]);

    const generator = readFileSync(faviconGeneratorUrl, 'utf8').toLowerCase();
    for (const value of ['#1536f1', '#ffffff', '#f4c430', '(16, 16)', '(32, 32)', '(48, 48)', '(64, 64)']) {
      expect(generator).toContain(value);
    }
  });

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
