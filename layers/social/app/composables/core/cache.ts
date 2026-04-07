import type { mastodon } from 'masto'
import { useMastoClient } from '../federation/masto/masto'

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

export async function fetchAccountByHandle(handle: string): Promise<mastodon.v1.Account | null> {
  const normalizedHandle = handle.replace(/^@/, '')
  const cacheKey = `account:handle:${normalizedHandle}`
  const cached = cache.get<mastodon.v1.Account>(cacheKey)
  if (cached)
    return cached

  try {
    const account = await useMastoClient().v1.accounts.lookup({ acct: normalizedHandle })
    cache.set(cacheKey, account, 5 * 60 * 1000)
    cache.set(`account:id:${account.id}`, account, 5 * 60 * 1000)
    return account
  }
  catch {
    return null
  }
}

export async function fetchAccountById(id: string): Promise<mastodon.v1.Account | null> {
  const cacheKey = `account:id:${id}`
  const cached = cache.get<mastodon.v1.Account>(cacheKey)
  if (cached)
    return cached

  try {
    const account = await useMastoClient().v1.accounts.$select(id).fetch()
    cache.set(cacheKey, account, 5 * 60 * 1000)
    cache.set(`account:handle:${account.acct}`, account, 5 * 60 * 1000)
    return account
  }
  catch {
    return null
  }
}
