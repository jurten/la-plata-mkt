import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { paletteOptions, resolvePalette } from '../../src/lib/palettes';

const globalCss = readFileSync(new URL('../../src/styles/global.css', import.meta.url), 'utf8');
const cssTokenByColor = {
  ink: '--ink',
  paper: '--paper',
  paperBright: '--paper-bright',
  primary: '--purple',
  primaryDark: '--purple-dark',
  accent: '--acid',
  sky: '--sky',
  soft: '--soft-pink',
  green: '--green',
} as const;

function relativeLuminance(hex: string): number {
  const channels = [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const [red, green, blue] = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(foreground: string, background: string): number {
  const [lighter, darker] = [relativeLuminance(foreground), relativeLuminance(background)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('alternative palettes', () => {
  it.each(paletteOptions)('$name preserves the intended high-contrast pairings', ({ colors }) => {
    expect(contrastRatio(colors.primary, colors.paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colors.primaryDark, colors.paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colors.accent, colors.ink)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colors.sky, colors.ink)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colors.soft, colors.ink)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(paletteOptions)('$name matches its CSS custom-property block', ({ id, colors }) => {
    const selector = id === 'editorial' ? ':root' : `:root[data-palette='${id}']`;
    const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const block = globalCss.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`))?.[1];

    expect(block).toBeDefined();
    for (const [colorName, token] of Object.entries(cssTokenByColor)) {
      const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const cssValue = block?.match(new RegExp(`${escapedToken}\\s*:\\s*(#[0-9a-f]{6})`, 'i'))?.[1];
      expect(cssValue?.toLowerCase(), `${id} ${token}`).toBe(colors[colorName as keyof typeof colors].toLowerCase());
    }
  });

  it('falls back to editorial for an unknown palette ID', () => {
    expect(resolvePalette('not-a-palette')).toBe('editorial');
  });
});
