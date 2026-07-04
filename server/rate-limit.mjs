const memoryStore = new Map();

const getUpstashRestUrl = () =>
  String(process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '').trim();

const getUpstashRestToken = () =>
  String(process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '').trim();

export const isUpstashRateLimitEnabled = () =>
  Boolean(getUpstashRestUrl() && getUpstashRestToken());

const upstashIncr = async (key, windowMs) => {
  const url = getUpstashRestUrl();
  const token = getUpstashRestToken();
  const ttlSec = Math.max(1, Math.ceil(windowMs / 1000));
  const response = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([
      ['INCR', key],
      ['EXPIRE', key, ttlSec],
    ]),
  });
  if (!response.ok) return null;
  const data = await response.json();
  const count = Number(data?.[0]?.result);
  return Number.isFinite(count) ? count : null;
};

export const createRateLimiter = ({ windowMs = 60_000, max = 20, keyPrefix = 'default' } = {}) => {
  return async (key) => {
    const bucketKey = `t1d:rl:${keyPrefix}:${key}`;
    const now = Date.now();

    if (isUpstashRateLimitEnabled()) {
      try {
        const count = await upstashIncr(bucketKey, windowMs);
        if (count !== null) {
          return {
            allowed: count <= max,
            remaining: Math.max(0, max - count),
            retryAfterMs: count <= max ? 0 : windowMs,
            backend: 'upstash',
          };
        }
      } catch {
        // fall through
      }
    }

    const current = memoryStore.get(bucketKey) || { count: 0, resetAt: now + windowMs };
    if (now >= current.resetAt) {
      current.count = 0;
      current.resetAt = now + windowMs;
    }
    current.count += 1;
    memoryStore.set(bucketKey, current);

    return {
      allowed: current.count <= max,
      remaining: Math.max(0, max - current.count),
      retryAfterMs: Math.max(0, current.resetAt - now),
      backend: 'memory',
    };
  };
};

export const clientIp = (req) =>
  String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown')
    .split(',')[0]
    .trim();
