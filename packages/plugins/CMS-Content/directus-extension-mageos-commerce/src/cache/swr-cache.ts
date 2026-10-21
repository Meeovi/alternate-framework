import { CommerceError } from '../errors'

export interface CacheEntry<T = unknown> {
  value: T
  /** Epoch ms when the value was fetched. */
  storedAt: number
}

export interface CacheStore {
  get(key: string): Promise<CacheEntry | null>
  /** `ttlSeconds` = how long the store may keep it at all. */
  set(key: string, entry: CacheEntry, ttlSeconds: number): Promise<void>
}

export type CacheStatus = 'HIT' | 'MISS' | 'STALE' | 'STALE-IF-ERROR' | 'BYPASS'

export interface CacheResult<T> {
  value: T
  status: CacheStatus
  /** Seconds since the value was fetched. */
  age: number
}

export interface SwrOptions {
  /** Seconds a value is fresh. */
  ttl: number
  /** Seconds after that it's served while refreshing in the background. */
  staleWhileRevalidate: number
  /** Seconds after `ttl` it may still be served when the backend fails. */
  staleIfError: number
}

type Logger = { warn: (...args: unknown[]) => void }

/** In-process LRU, used on its own or as the Redis fallback. */
export class MemoryStore implements CacheStore {
  private readonly entries = new Map<string, { entry: CacheEntry, expiresAt: number }>()
  constructor(private readonly maxEntries = 1000) {}

  async get(key: string): Promise<CacheEntry | null> {
    const hit = this.entries.get(key)
    if (!hit) return null
    if (hit.expiresAt <= Date.now()) {
      this.entries.delete(key)
      return null
    }
    // Re-insert to mark as most recently used.
    this.entries.delete(key)
    this.entries.set(key, hit)
    return hit.entry
  }

  async set(key: string, entry: CacheEntry, ttlSeconds: number): Promise<void> {
    this.entries.delete(key)
    this.entries.set(key, { entry, expiresAt: Date.now() + ttlSeconds * 1000 })
    while (this.entries.size > this.maxEntries) this.entries.delete(this.entries.keys().next().value!)
  }
}

/** The subset of ioredis used here. */
export interface RedisLike {
  get(key: string): Promise<string | null>
  set(key: string, value: string, mode: 'EX', seconds: number): Promise<unknown>
}

/**
 * Redis with a memory fallback: a Redis error never fails a request, it
 * just means this process caches locally until Redis answers again.
 */
export class RedisStore implements CacheStore {
  private readonly fallback = new MemoryStore()
  private warned = false

  constructor(private readonly redis: RedisLike, private readonly namespace: string, private readonly logger?: Logger) {}

  private key(key: string) {
    return `${this.namespace}:${key}`
  }

  private degrade(error: unknown) {
    if (this.warned) return
    this.warned = true
    this.logger?.warn(`[mageos-commerce] Redis cache unavailable, using in-memory cache: ${(error as Error)?.message ?? error}`)
  }

  async get(key: string): Promise<CacheEntry | null> {
    try {
      const raw = await this.redis.get(this.key(key))
      this.warned = false
      return raw ? JSON.parse(raw) as CacheEntry : await this.fallback.get(key)
    } catch (error) {
      this.degrade(error)
      return this.fallback.get(key)
    }
  }

  async set(key: string, entry: CacheEntry, ttlSeconds: number): Promise<void> {
    await this.fallback.set(key, entry, ttlSeconds)
    try {
      await this.redis.set(this.key(key), JSON.stringify(entry), 'EX', Math.max(1, Math.ceil(ttlSeconds)))
    } catch (error) {
      this.degrade(error)
    }
  }
}

/**
 * Stale-while-revalidate over a CacheStore:
 * - fresh (age ≤ ttl): served as is (HIT)
 * - stale (≤ ttl + staleWhileRevalidate): served, refreshed in the background (STALE)
 * - otherwise fetched (MISS); if the backend fails with an upstream error and
 *   a copy younger than ttl + staleIfError exists, that copy is served (STALE-IF-ERROR)
 * Concurrent loads of one key share a single backend request.
 */
export class SwrCache {
  private readonly inflight = new Map<string, Promise<CacheEntry>>()

  constructor(private readonly store: CacheStore, private readonly options: SwrOptions, private readonly logger?: Logger) {}

  private keep() {
    return this.options.ttl + Math.max(this.options.staleWhileRevalidate, this.options.staleIfError)
  }

  private load<T>(key: string, loader: () => Promise<T>): Promise<CacheEntry> {
    let pending = this.inflight.get(key)
    if (!pending) {
      pending = (async () => {
        const entry: CacheEntry = { value: await loader(), storedAt: Date.now() }
        await this.store.set(key, entry, this.keep())
        return entry
      })().finally(() => this.inflight.delete(key))
      this.inflight.set(key, pending)
    }
    return pending
  }

  async get<T>(key: string, loader: () => Promise<T>): Promise<CacheResult<T>> {
    const { ttl, staleWhileRevalidate, staleIfError } = this.options
    if (ttl <= 0) return { value: await loader(), status: 'BYPASS', age: 0 }

    const cached = await this.store.get(key)
    const age = cached ? (Date.now() - cached.storedAt) / 1000 : Infinity

    if (cached && age <= ttl) return { value: cached.value as T, status: 'HIT', age }
    if (cached && age <= ttl + staleWhileRevalidate) {
      this.load(key, loader).catch((error) => this.logger?.warn(`[mageos-commerce] background refresh of ${key} failed: ${(error as Error)?.message ?? error}`))
      return { value: cached.value as T, status: 'STALE', age }
    }

    try {
      const entry = await this.load(key, loader)
      return { value: entry.value as T, status: 'MISS', age: 0 }
    } catch (error) {
      if (cached && age <= ttl + staleIfError && error instanceof CommerceError && error.upstream) {
        this.logger?.warn(`[mageos-commerce] serving stale ${key} (${Math.round(age)}s old): ${error.message}`)
        return { value: cached.value as T, status: 'STALE-IF-ERROR', age }
      }
      throw error
    }
  }
}
