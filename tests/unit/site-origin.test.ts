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

  it('mantiene el modo sin configuración y acepta HTTP local', () => {
    expect(parsePublicSiteUrl(undefined)).toBeUndefined();
    expect(parsePublicSiteUrl('   ')).toBeUndefined();
    expect(isTrustedHostHeader('cualquier-host.example', undefined)).toBe(true);

    const localSite = parsePublicSiteUrl('http://127.0.0.1:4321');
    expect(localSite?.origin).toBe('http://127.0.0.1:4321');
    expect(isTrustedHostHeader('127.0.0.1:4321', localSite)).toBe(true);
    expect(isTrustedHostHeader('127.0.0.1', localSite)).toBe(false);
  });

  it('rechaza HTTP público y orígenes con credenciales', () => {
    expect(() => parsePublicSiteUrl('http://laplata.example')).toThrow(/HTTPS/);
    expect(() => parsePublicSiteUrl('https://usuario:clave@laplata.example')).toThrow(/credentials/);
  });

  it('exige el puerto personalizado configurado', () => {
    const site = parsePublicSiteUrl('https://laplata.example:8443');

    expect(isTrustedHostHeader('laplata.example:8443', site)).toBe(true);
    expect(isTrustedHostHeader('laplata.example', site)).toBe(false);
    expect(isTrustedHostHeader('laplata.example:443', site)).toBe(false);
  });
});
