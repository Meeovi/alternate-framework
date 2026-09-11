import Redis from 'ioredis';

const config = useRuntimeConfig();

export const REDIS_URL =
  config.redisUrl || process.env.NUXT_REDIS_URL || 'redis://localhost:6379';

// Catches exactly the failure mode that bit this app in .env once already:
// a mangled value (e.g. a stray `REDIS_URL=` fragment glued onto the front
// of NUXT_REDIS_URL) connects fine at the TCP level but never sends AUTH,
// so it fails silently in a reconnect loop with a cryptic
// "NOAUTH HELLO must be called..." — instead of a clear, immediate signal
// that the env var itself is malformed.
if (!/^rediss?:\/\//.test(REDIS_URL)) {
  console.error(
    `[redis] NUXT_REDIS_URL / config.redisUrl does not look like a redis:// URL ` +
    `(got: ${JSON.stringify(REDIS_URL)}). The client will fail to authenticate.`,
  );
}

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
