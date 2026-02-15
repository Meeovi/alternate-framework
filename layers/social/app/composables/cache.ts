export interface CacheEntry<T> {
  value: T
  expiresAt: number
}

export interface SocialCache {
  store: any
  get<T>(key: string): T | null
  set<T>(key: string, value: T, ttlMs: number): void
  delete(key: string): void
}

let cache: SocialCache = {
  store: new Map<string, CacheEntry<any>>(),

  get<T>(key: string): T | null {
    const entry = this.store.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return null
    }
    return entry.value
  },

  set<T>(key: string, value: T, ttlMs: number) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs
    })
  },

  delete(key: string) {
    this.store.delete(key)
  }
}

export function setSocialCache(customCache: SocialCache) {
  cache = customCache
}

export function getSocialCache() {
  return cache
}

export async function fetchAccountByHandle(handle: string) {
  // Minimal stub used during build to satisfy imports.
  return null
}

export async function fetchAccountById(id: string) {
  // Minimal stub used during build to satisfy imports.
  return null
}
