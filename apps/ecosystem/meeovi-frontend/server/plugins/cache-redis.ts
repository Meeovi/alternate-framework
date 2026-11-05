// Nitro's cache (rendered pages from routeRules `swr`, cached API handlers)
// lives in Redis instead of the process's memory. The page cache is keyed on
// cookies, so every visitor adds their own entries: in memory they were
// never removed and grew until the next restart. In Redis each entry expires
// after CACHE_TTL_SECONDS, and a restart (each deploy) keeps the warm cache.
//
// Uses the app's shared Redis client (retries, error listener). If Redis is
// unreachable, Nitro treats a failed cache read as a miss and renders the
// page as usual.
import { defineDriver } from 'unstorage'
import { redis } from '#shared/server/utils/redis'

const CACHE_TTL_SECONDS = 600
const PREFIX = 'meeovi:nitro-cache:'

const redisCache = defineDriver(() => ({
  name: 'meeovi-redis-cache',
  async hasItem(key: string) {
    return (await redis.exists(PREFIX + key)) === 1
  },
  async getItem(key: string) {
    return await redis.get(PREFIX + key)
  },
  async setItem(key: string, value: string) {
    await redis.set(PREFIX + key, value, 'EX', CACHE_TTL_SECONDS)
  },
  async removeItem(key: string) {
    await redis.del(PREFIX + key)
  },
  async getKeys(base: string) {
    const keys: string[] = []
    let cursor = '0'
    do {
      const [next, batch] = await redis.scan(cursor, 'MATCH', `${PREFIX}${base || ''}*`, 'COUNT', 500)
      cursor = next
      keys.push(...batch.map((key) => key.slice(PREFIX.length)))
    } while (cursor !== '0')
    return keys
  },
  async clear(base: string) {
    const keys = await this.getKeys!(base, {})
    if (keys.length) await redis.del(...keys.map((key) => PREFIX + key))
  },
}))

export default defineNitroPlugin(() => {
  // Off in development unless NITRO_CACHE_REDIS=true; NITRO_CACHE_REDIS=false
  // turns it off anywhere (back to the in-memory cache).
  const setting = process.env.NITRO_CACHE_REDIS
  if (setting === 'false' || (process.env.NODE_ENV === 'development' && setting !== 'true')) return
  const storage = useStorage()
  try {
    // Nitro may already have mounted its own cache storage (development
    // does, on disk): unmount it first, without disposing it — with
    // dispose off, unmount finishes synchronously, before the mount below.
    void storage.unmount('cache', false)
    storage.mount('cache', redisCache({}))
  } catch (error) {
    // Anything wrong here must not take the site down: keep Nitro's cache.
    console.error('[cache-redis] not mounted, using the default cache:', (error as Error)?.message || error)
  }
})
