import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { colorThemes, themeChoices } from '../../src/lib/themes';

const globalCss = readFileSync(new URL('../../src/styles/global.css', import.meta.url), 'utf8');
const cssTokenByColor = {
  bg: '--bg',
  surface: '--surface',
  ink: '--ink',
  muted: '--muted',
  blue: '--blue',
  blueText: '--blue-text',
  blueStrong: '--blue-strong',
  sky: '--sky',
  signal: '--signal',
  pulse: '--pulse',
  night: '--night',
  onNight: '--on-night',
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

function cssBlock(selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const block = globalCss.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`))?.[1];
  expect(block, selector).toBeDefined();
  return block!;
}

function colorFromBlock(block: string, token: string): string {
  const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const value = block.match(new RegExp(`${escapedToken}\\s*:\\s*(#[0-9a-f]{6})`, 'i'))?.[1];
  expect(value, token).toBeDefined();
  return value!;
}

describe('LPM theme system', () => {
  it('publishes only the light, automatic and dark controls used by both pages', () => {
    expect(themeChoices).toEqual([
      { id: 'light', shortLabel: 'L', accessibleLabel: 'Modo claro', title: 'Modo claro' },
      { id: 'auto', shortLabel: 'A', accessibleLabel: 'Usar preferencia del sistema', title: 'Automático' },
      { id: 'dark', shortLabel: 'D', accessibleLabel: 'Modo oscuro', title: 'Modo oscuro' },
    ]);
  });

  it.each(Object.entries(colorThemes))('%s matches its CSS custom-property block', (id, colors) => {
    const block = cssBlock(id === 'light' ? ':root' : "html[data-theme='dark']");
    for (const [colorName, token] of Object.entries(cssTokenByColor)) {
      expect(colorFromBlock(block, token).toLowerCase(), `${id} ${token}`).toBe(
        colors[colorName as keyof typeof colors].toLowerCase(),
      );
    }
  });

  it('uses the dark tokens when automatic mode detects a dark system preference', () => {
    const autoBlock = cssBlock("html[data-theme='auto']");
    for (const [colorName, token] of Object.entries(cssTokenByColor)) {
      expect(colorFromBlock(autoBlock, token).toLowerCase(), `auto ${token}`).toBe(
        colorThemes.dark[colorName as keyof typeof colorThemes.dark].toLowerCase(),
      );
    }
  });

  it.each(Object.entries(colorThemes))('%s preserves every text pairing used by the interface', (id, colors) => {
    expect(contrastRatio(colors.ink, colors.bg)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(colors.ink, colors.surface)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(colors.muted, colors.bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio('#FFFFFF', colors.blue)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colors.blueText, colors.bg)).toBeGreaterThanOrEqual(4.5);
    if (id === 'dark') {
      expect(contrastRatio(colors.blue, colors.bg)).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(colors.blue, colors.signal)).toBeGreaterThanOrEqual(4.5);
    } else {
      expect(contrastRatio(colors.blue, colors.bg)).toBeGreaterThanOrEqual(4.5);
    }
    expect(contrastRatio(colors.signal, id === 'light' ? colors.ink : colors.bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colors.pulse, id === 'light' ? colors.ink : colors.bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colors.onNight, colors.night)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(colors.error, colors.surface)).toBeGreaterThanOrEqual(4.5);
  });

  it('contains no retired public palette hooks or alternative IDs', () => {
    expect(globalCss).not.toMatch(/data-palette\s*=|data-palette-preview/);
    for (const retired of ['registro', 'manchette', 'archivo', 'sobreimpresion']) {
      expect(globalCss.toLowerCase()).not.toContain(retired);
    }
  });
});
