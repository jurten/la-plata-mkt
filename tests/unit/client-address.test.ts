import { describe, expect, it } from 'vitest';
import { resolveClientAddress } from '../../src/lib/client-address';

describe('resolveClientAddress', () => {
  it('usa el IP que Cloudflare adjunta a la solicitud', () => {
    const request = new Request('https://example.com/api/contact', {
      headers: { 'cf-connecting-ip': '2001:db8::7' },
    });

    expect(resolveClientAddress(request, () => '203.0.113.8')).toBe('2001:db8::7');
  });

  it('usa el IP del adaptador Node cuando no existe la cabecera de Cloudflare', () => {
    const request = new Request('http://127.0.0.1/api/contact');

    expect(resolveClientAddress(request, () => '203.0.113.8')).toBe('203.0.113.8');
  });

  it('falla de forma acotada si la cabecera es inválida y el adaptador no ofrece IP', () => {
    const request = new Request('http://127.0.0.1/api/contact', {
      headers: { 'cf-connecting-ip': 'not-an-ip' },
    });

    expect(
      resolveClientAddress(request, () => {
        throw new Error('ClientAddressNotAvailable');
      }),
    ).toBe('unknown');
  });
});
