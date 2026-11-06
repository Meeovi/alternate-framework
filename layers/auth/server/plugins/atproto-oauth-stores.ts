import { defineNitroPlugin } from 'nitropack/runtime'
import { registerAtprotoOAuthStores, type OAuthKeyValueStore } from '@mframework/meeovi-atproto/oauth'
import { redis } from '#shared/server/utils/redis'

/**
 * Where "Sign in with Bluesky" (atproto OAuth, meeovi-atproto
 * runtime/oauth.ts) keeps its data: Redis, under `atproto-oauth:`.
 *  - state:   one per sign-in in progress, gone after 10 minutes;
 *  - session: one per Bluesky account (by DID) — DPoP key and tokens the
 *    library refreshes; kept 180 days after the last refresh, then the
 *    member signs in with Bluesky again.
 * Tokens are secrets: this Redis needs a password and must not be public.
 */
const store = <V>(prefix: string, ttlSeconds: number): OAuthKeyValueStore<V> => ({
  async get(key) {
    const raw = await redis.get(`atproto-oauth:${prefix}:${key}`)
    return raw ? JSON.parse(raw) as V : undefined
  },
  async set(key, value) {
    await redis.set(`atproto-oauth:${prefix}:${key}`, JSON.stringify(value), 'EX', ttlSeconds)
  },
  async del(key) {
    await redis.del(`atproto-oauth:${prefix}:${key}`)
  },
})

// One token refresh per member at a time, across processes: a Redis lock
// (SET NX with a 30 s expiry), waited for up to 10 s.
async function lock<T>(name: string, fn: () => T | PromiseLike<T>): Promise<T> {
  const key = `atproto-oauth:lock:${name}`
  const token = `${process.pid}-${Math.random().toString(36).slice(2)}`
  const until = Date.now() + 10_000
  while (await redis.set(key, token, 'PX', 30_000, 'NX') !== 'OK') {
    if (Date.now() > until) throw new Error(`Timed out waiting for ${key}`)
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  try {
    return await fn()
  } finally {
    // Release only our own lock.
    await redis.eval("if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end", 1, key, token).catch(() => {})
  }
}

export default defineNitroPlugin(() => {
  registerAtprotoOAuthStores({
    state: store('state', 10 * 60),
    session: store('session', 180 * 24 * 60 * 60),
    lock,
  })
})
