import { describe, expect, it } from 'vitest';
import { createRateLimiter } from '../../server/rate-limit.mjs';

describe('rate-limit', () => {
  it('allows requests under the limit', async () => {
    const limiter = createRateLimiter({ windowMs: 60_000, max: 3, keyPrefix: 'test' });
    expect((await limiter('127.0.0.1')).allowed).toBe(true);
    expect((await limiter('127.0.0.1')).allowed).toBe(true);
    expect((await limiter('127.0.0.1')).allowed).toBe(true);
  });

  it('blocks requests over the limit', async () => {
    const limiter = createRateLimiter({ windowMs: 60_000, max: 2, keyPrefix: 'test-block' });
    await limiter('10.0.0.1');
    await limiter('10.0.0.1');
    const blocked = await limiter('10.0.0.1');
    expect(blocked.allowed).toBe(false);
  });
});
