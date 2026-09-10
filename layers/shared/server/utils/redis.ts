import Redis from 'ioredis';

const config = useRuntimeConfig();

export const REDIS_URL =
  config.redisUrl || process.env.NUXT_REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(REDIS_URL, {
  // Reject a command after a few attempts rather than buffering it 20
  // deep (the ioredis default) while a remote Redis is unreachable —
  // otherwise every request that touches Redis hangs during an outage.
  maxRetriesPerRequest: 3,
  connectTimeout: 10_000,
  // Keep reconnecting (feed / notifications recover on their own once
  // Redis is back) but cap the backoff.
  retryStrategy: (times: number) => Math.min(times * 200, 2000),
});

// ioredis emits 'error' on every failed connection attempt. An 'error'
// event with no listener is re-thrown by EventEmitter and takes the whole
// Nitro process down the moment Redis blips — this listener is what keeps
// an outage degraded-but-alive.
redis.on('error', (err: Error) => {
  console.error('[redis] client error:', err?.message || err);
});
