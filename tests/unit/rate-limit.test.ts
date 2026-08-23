import { describe, expect, it } from 'vitest';
import { createRateLimiter } from '../../src/lib/rate-limit';

describe('createRateLimiter', () => {
  it('bloquea después del límite y vuelve a habilitar al comenzar otra ventana', () => {
    let now = 0;
    const limiter = createRateLimiter({ limit: 2, windowMs: 1_000, now: () => now });

    expect(limiter.check('client-a')).toEqual({ allowed: true, retryAfterSeconds: 0 });
    expect(limiter.check('client-a')).toEqual({ allowed: true, retryAfterSeconds: 0 });
    expect(limiter.check('client-a')).toEqual({ allowed: false, retryAfterSeconds: 1 });
    expect(limiter.check('client-b').allowed).toBe(true);

    now = 1_000;
    expect(limiter.check('client-a')).toEqual({ allowed: true, retryAfterSeconds: 0 });
  });

  it('expulsa la entrada más antigua al alcanzar maxEntries', () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000, maxEntries: 2, now: () => 0 });

    expect(limiter.check('client-a').allowed).toBe(true);
    expect(limiter.check('client-b').allowed).toBe(true);
    expect(limiter.check('client-c').allowed).toBe(true);
    expect(limiter.check('client-b').allowed).toBe(false);
    expect(limiter.check('client-a').allowed).toBe(true);
  });
});
