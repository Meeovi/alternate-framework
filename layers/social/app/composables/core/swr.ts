import { getSocialCache } from './cache'

const refreshQueue = new Map<string, Promise<any>>()

export function scheduleBackgroundRefresh(
  key: string,
  fn: () => Promise<any>,
  ttlMs: number
) {
  if (refreshQueue.has(key)) return

  const promise = fn()
    .then((fresh) => {
      const cache = getSocialCache()
      cache.set(key, fresh, ttlMs)
    })
    .finally(() => {
      refreshQueue.delete(key)
    })

  refreshQueue.set(key, promise)
}
