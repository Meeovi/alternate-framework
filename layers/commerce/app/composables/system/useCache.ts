import type { SfProduct, SfCategory, SfPrice } from '~/composables/system/models'

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

export function useCache() {
  const cache = new Map<string, CacheEntry<any>>()

  function setCacheItem<T>(key: string, value: T, ttlMs = 5 * 60 * 1000) {
    try {
      const entry: CacheEntry<T> = {
        value,
        expiresAt: Date.now() + ttlMs,
      }
      cache.set(key, entry)
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, JSON.stringify(entry))
      }
    } catch (e) {
      // ignore storage failures
    }
  }

  function getCacheItem<T>(key: string): T | null {
    const memoryEntry = cache.get(key) as CacheEntry<T> | undefined
    if (memoryEntry) {
      if (Date.now() < memoryEntry.expiresAt) {
        return memoryEntry.value
      }
      cache.delete(key)
    }

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem(key)
        if (raw) {
          const parsed = JSON.parse(raw) as CacheEntry<T>
          if (Date.now() < parsed.expiresAt) {
            cache.set(key, parsed)
            return parsed.value
          }
          localStorage.removeItem(key)
        }
      }
    } catch {}

    return null
  }

  function removeCacheItem(key: string) {
    cache.delete(key)
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key)
      }
    } catch {}
  }

  function createProductCacheKey(product: SfProduct | string, context: Record<string, any> = {}): string {
    const idOrSku = typeof product === 'string' ? product : product.sku || product.id
    return `product:${idOrSku}:${JSON.stringify(context)}`
  }

  function createCategoryCacheKey(category: SfCategory | string): string {
    const idOrSlug = typeof category === 'string' ? category : category.slug || category.id
    return `category:${idOrSlug}`
  }

  return {
    setCacheItem,
    getCacheItem,
    removeCacheItem,
    createProductCacheKey,
    createCategoryCacheKey,
  }
}

export default useCache
