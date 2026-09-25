import type { mastodon } from '../../clients/mastodon'

export interface CacheEntry<T> {
  value: T
  expiresAt: number
}

export interface SocialCache {
  store: Map<string, CacheEntry<any>>
  get<T>(key: string): T | null
  set<T>(key: string, value: T, ttlMs: number): void
  delete(key: string): void
}

export interface AccountCacheToolsDeps {
  useFederationClient: () => mastodon.rest.Client
}

export interface AccountCacheTools {
  setSocialCache: (customCache: SocialCache) => void
  getSocialCache: () => SocialCache
  fetchAccountByHandle: (handle: string) => Promise<mastodon.v1.Account | null>
  fetchAccountById: (id: string) => Promise<mastodon.v1.Account | null>
}

function createDefaultCache(): SocialCache {
  return {
    store: new Map<string, CacheEntry<any>>(),

    get<T>(key: string): T | null {
      const entry = this.store.get(key)
      if (!entry)
        return null

      if (Date.now() > entry.expiresAt) {
        this.store.delete(key)
        return null
      }

      return entry.value
    },

    set<T>(key: string, value: T, ttlMs: number) {
      this.store.set(key, {
        value,
        expiresAt: Date.now() + ttlMs,
      })
    },

    delete(key: string) {
      this.store.delete(key)
    },
  }
}

export function createAccountCacheTools(deps: AccountCacheToolsDeps): AccountCacheTools {
  let cache = createDefaultCache()

  function setSocialCache(customCache: SocialCache) {
    cache = customCache
  }

  function getSocialCache() {
    return cache
  }

  async function fetchAccountByHandle(handle: string): Promise<mastodon.v1.Account | null> {
    const normalizedHandle = handle.replace(/^@/, '')
    const cacheKey = `account:handle:${normalizedHandle}`
    const cached = cache.get<mastodon.v1.Account>(cacheKey)
    if (cached)
      return cached

    try {
      const account = await deps.useFederationClient().v1.accounts.lookup({ acct: normalizedHandle })
      cache.set(cacheKey, account, 5 * 60 * 1000)
      cache.set(`account:id:${account.id}`, account, 5 * 60 * 1000)
      return account
    }
    catch {
      return null
    }
  }

  async function fetchAccountById(id: string): Promise<mastodon.v1.Account | null> {
    const cacheKey = `account:id:${id}`
    const cached = cache.get<mastodon.v1.Account>(cacheKey)
    if (cached)
      return cached

    try {
      const account = await deps.useFederationClient().v1.accounts.$select(id).fetch()
      cache.set(cacheKey, account, 5 * 60 * 1000)
      cache.set(`account:handle:${account.acct}`, account, 5 * 60 * 1000)
      return account
    }
    catch {
      return null
    }
  }

  return {
    setSocialCache,
    getSocialCache,
    fetchAccountByHandle,
    fetchAccountById,
  }
}
