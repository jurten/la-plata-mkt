import { describe, expect, it } from 'vitest';
import { createTurnstileVerifier } from '../../src/lib/turnstile';

describe('createTurnstileVerifier', () => {
  it('envía secreto y token al endpoint oficial y devuelve su resultado', async () => {
    let capturedBody = '';
    const verify = createTurnstileVerifier({
      secret: 'turnstile-secret',
      fetchImpl: async (_url, init) => {
        capturedBody = String(init?.body);
        return Response.json({ success: true });
      },
    });

    await expect(verify('visitor-token')).resolves.toBe(true);
    expect(new URLSearchParams(capturedBody).get('secret')).toBe('turnstile-secret');
    expect(new URLSearchParams(capturedBody).get('response')).toBe('visitor-token');
  });
});
