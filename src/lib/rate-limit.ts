interface RateLimiterOptions {
  limit: number;
  windowMs: number;
  maxEntries?: number;
  now?: () => number;
}

interface RateLimitDecision {
  allowed: boolean;
  retryAfterSeconds: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

export function createRateLimiter({
  limit,
  windowMs,
  maxEntries = 10_000,
  now = Date.now,
}: RateLimiterOptions) {
  const buckets = new Map<string, Bucket>();

  function makeRoom(at: number) {
    if (buckets.size < maxEntries) return;

    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= at) buckets.delete(key);
    }

    while (buckets.size >= maxEntries) {
      const oldestKey = buckets.keys().next().value as string | undefined;
      if (oldestKey === undefined) break;
      buckets.delete(oldestKey);
    }
  }

  return {
    check(key: string): RateLimitDecision {
      const at = now();
      const existing = buckets.get(key);

      if (!existing || existing.resetAt <= at) {
        makeRoom(at);
        buckets.delete(key);
        buckets.set(key, { count: 1, resetAt: at + windowMs });
        return { allowed: true, retryAfterSeconds: 0 };
      }

      if (existing.count >= limit) {
        return {
          allowed: false,
          retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - at) / 1_000)),
        };
      }

      existing.count += 1;
      return { allowed: true, retryAfterSeconds: 0 };
    },
  };
}
