import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const favicon = readFileSync(new URL('../../public/favicon.svg', import.meta.url), 'utf8').toLowerCase();
const faviconIcoUrl = new URL('../../public/favicon.ico', import.meta.url);
const faviconGeneratorUrl = new URL('../../scripts/generate-favicon.py', import.meta.url);
const ogGeneratorUrl = new URL('../../scripts/generate-og.mjs', import.meta.url);

describe('LPM brand assets', () => {
  it('publishes a reproducible multi-size ICO and SVG using the official full LPM logo', () => {
    expect(existsSync(faviconIcoUrl)).toBe(true);
    expect(existsSync(faviconGeneratorUrl)).toBe(true);
    expect(favicon).toContain('la plata marketing');
    for (const color of ['#1536f1', '#ffffff']) expect(favicon).toContain(color);
    expect(favicon).not.toContain('#f4c430');
    const official = readFileSync(new URL('../../public/brand/lpm-logo.svg', import.meta.url), 'utf8');
    const path = official.match(/\bd="([^"]+)"/)?.[1];
    expect(path).toBeDefined();
    expect(favicon).toContain(path!.toLowerCase());

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
    for (const value of ['#1536f1', '#ffffff', 'lpm-profile.png', 'lpm-logo.svg', '(16, 16)', '(32, 32)', '(48, 48)', '(64, 64)']) expect(generator).toContain(value);
  });

  it('publishes the Open Graph asset at the required 1200 by 630 pixels', () => {
    const image = readFileSync(new URL('../../public/og-la-plata-marketing.png', import.meta.url));
    expect([...image.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    expect(image.readUInt32BE(16)).toBe(1200);
    expect(image.readUInt32BE(20)).toBe(630);
  });

  it('can reproduce the current extraterrestrial proposition with the local portrait and brand assets', () => {
    expect(existsSync(ogGeneratorUrl)).toBe(true);
    const generator = readFileSync(ogGeneratorUrl, 'utf8');
    for (const text of ['Ideas de otro planeta.', 'Para problemas de acá.', 'La Plata Marketing', 'src/assets/lpm-visitor.png', 'public/brand/lpm-logo.svg', 'Radio Canada Big']) expect(generator).toContain(text);
    const packageJson = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
    expect(packageJson.scripts['assets:og']).toBe('node scripts/generate-og.mjs');
  });
});
