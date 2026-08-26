import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { paletteOptions } from '../../src/lib/palettes';

const globalCss = readFileSync(new URL('../../src/styles/global.css', import.meta.url), 'utf8');
const cssTokenByColor = {
  ink: '--ink',
  muted: '--muted',
  paper: '--paper',
  surface: '--surface',
  primary: '--primary',
  primaryStrong: '--primary-strong',
  highlight: '--highlight',
  secondary: '--secondary',
  signal: '--signal',
  success: '--success',
  error: '--error',
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

describe('reference-derived color system', () => {
  it('publishes Registro activo as the only permanent production direction', () => {
    expect(paletteOptions.map(({ id, name }) => ({ id, name }))).toEqual([
      { id: 'registro', name: 'Registro activo' },
    ]);
    expect(paletteOptions[0].colors).toEqual({
      ink: '#17292D',
      muted: '#4B5B5E',
      paper: '#F3EEE6',
      surface: '#FFF9F0',
      primary: '#1D62A8',
      primaryStrong: '#154C86',
      highlight: '#F2D31B',
      secondary: '#8EC5E6',
      signal: '#FC4C5A',
      success: '#276749',
      error: '#A62828',
    });
  });

  it.each(paletteOptions)('$name preserves every intended semantic pairing', ({ colors }) => {
    expect(contrastRatio(colors.ink, colors.paper)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(colors.ink, colors.surface)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(colors.muted, colors.paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colors.primary, colors.paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colors.primary, colors.surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colors.primaryStrong, colors.paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colors.highlight, colors.ink)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colors.secondary, colors.ink)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colors.signal, colors.ink)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colors.success, colors.paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colors.error, colors.paper)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(paletteOptions)('$name matches its CSS custom-property block', ({ id, colors }) => {
    const selector = id === 'registro' ? ':root' : `:root[data-palette='${id}']`;
    const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const block = globalCss.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`))?.[1];

    expect(block).toBeDefined();
    for (const [colorName, token] of Object.entries(cssTokenByColor)) {
      const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const cssValue = block?.match(new RegExp(`${escapedToken}\\s*:\\s*(#[0-9a-f]{6})`, 'i'))?.[1];
      expect(cssValue?.toLowerCase(), `${id} ${token}`).toBe(colors[colorName as keyof typeof colors].toLowerCase());
    }
  });

  it('contains no legacy color-named variables or hardcoded retired system colors', () => {
    for (const legacy of [
      '--purple',
      '--purple-dark',
      '--acid',
      '--sky',
      '--soft-pink',
      '--green',
      '#b70d8a',
      '#f4e600',
      '#85d2ff',
      '#ffc7dd',
      'rgba(17,17,17',
      'rgba(17, 17, 17',
      'background: white',
      'color: #555',
      'color: #a21c12',
    ]) {
      expect(globalCss.toLowerCase()).not.toContain(legacy);
    }
  });

  it('contains no comparison-palette selectors or retired alternative IDs', () => {
    expect(globalCss).not.toMatch(/data-palette\s*=|data-palette-preview/);
    for (const retired of ['manchette', 'archivo', 'sobreimpresion']) {
      expect(globalCss).not.toContain(retired);
    }
  });
});
