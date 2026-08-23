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
});
