import { describe, expect, it } from 'vitest';
import { isTrustedHostHeader, parsePublicSiteUrl } from '../../src/lib/site-origin';

describe('trusted public site origin', () => {
  it('acepta solo el Host configurado y sus puertos HTTPS equivalentes', () => {
    const site = parsePublicSiteUrl('https://laplata.example');

    expect(isTrustedHostHeader('laplata.example', site)).toBe(true);
    expect(isTrustedHostHeader('laplata.example:443', site)).toBe(true);
    expect(isTrustedHostHeader('laplata.example:80', site)).toBe(false);
    expect(isTrustedHostHeader('laplata.example:444', site)).toBe(false);
    expect(isTrustedHostHeader('attacker.example', site)).toBe(false);
  });

  it('rechaza rutas, consultas y fragmentos en PUBLIC_SITE_URL', () => {
    expect(() => parsePublicSiteUrl('https://laplata.example/path')).toThrow();
    expect(() => parsePublicSiteUrl('https://laplata.example/?query=1')).toThrow();
    expect(() => parsePublicSiteUrl('https://laplata.example/#fragment')).toThrow();
  });
});
