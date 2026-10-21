import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryStore, RedisStore, SwrCache } from '../src/cache/swr-cache'
import { CommerceError } from '../src/errors'

const options = { ttl: 300, staleWhileRevalidate: 60, staleIfError: 3600 }

describe('SwrCache', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-21T12:00:00Z')) })
  afterEach(() => vi.useRealTimers())

  it('MISS, then HIT while fresh', async () => {
    const cache = new SwrCache(new MemoryStore(), options)
    const loader = vi.fn(async () => 'v1')
    expect((await cache.get('k', loader)).status).toBe('MISS')
    vi.advanceTimersByTime(299_000)
    expect(await cache.get('k', loader)).toMatchObject({ value: 'v1', status: 'HIT' })
    expect(loader).toHaveBeenCalledTimes(1)
  })

  it('serves STALE inside the SWR window and refreshes in the background', async () => {
    const cache = new SwrCache(new MemoryStore(), options)
    await cache.get('k', async () => 'v1')
    vi.advanceTimersByTime(330_000)
    const loader = vi.fn(async () => 'v2')
    expect(await cache.get('k', loader)).toMatchObject({ value: 'v1', status: 'STALE' })
    await vi.runAllTimersAsync()
    expect(loader).toHaveBeenCalledTimes(1)
    expect(await cache.get('k', loader)).toMatchObject({ value: 'v2', status: 'HIT' })
  })

  it('serves STALE-IF-ERROR when the backend is down, and rethrows without a copy', async () => {
    const cache = new SwrCache(new MemoryStore(), options)
    await cache.get('k', async () => 'v1')
    vi.advanceTimersByTime(1_000_000)
    const down = async () => { throw new CommerceError('UPSTREAM_OFFLINE', 'Mage-OS is unreachable') }
    expect(await cache.get('k', down)).toMatchObject({ value: 'v1', status: 'STALE-IF-ERROR' })
    await expect(cache.get('other', down)).rejects.toMatchObject({ code: 'UPSTREAM_OFFLINE' })
  })

  it('does not hide request errors behind stale data', async () => {
    const cache = new SwrCache(new MemoryStore(), options)
    await cache.get('k', async () => 'v1')
    vi.advanceTimersByTime(1_000_000)
    await expect(cache.get('k', async () => { throw new CommerceError('INVALID_QUERY', 'bad') })).rejects.toMatchObject({ code: 'INVALID_QUERY' })
  })

  it('shares one backend call between concurrent misses', async () => {
    vi.useRealTimers()
    const cache = new SwrCache(new MemoryStore(), options)
    const loader = vi.fn(() => new Promise<string>((resolve) => setTimeout(() => resolve('v'), 20)))
    const results = await Promise.all([cache.get('k', loader), cache.get('k', loader), cache.get('k', loader)])
    expect(results.map((r) => r.value)).toEqual(['v', 'v', 'v'])
    expect(loader).toHaveBeenCalledTimes(1)
  })

  it('caches null (an unknown product) like any value', async () => {
    const cache = new SwrCache(new MemoryStore(), options)
    const loader = vi.fn(async () => null)
    await cache.get('missing', loader)
    expect(await cache.get('missing', loader)).toMatchObject({ value: null, status: 'HIT' })
    expect(loader).toHaveBeenCalledTimes(1)
  })
})

describe('RedisStore', () => {
  it('uses Redis, namespaced, with a TTL', async () => {
    const data = new Map<string, string>()
    const redis = { get: vi.fn(async (k: string) => data.get(k) ?? null), set: vi.fn(async (k: string, v: string) => { data.set(k, v) }) }
    const store = new RedisStore(redis, 'ns')
    await store.set('k', { value: 1, storedAt: 5 }, 120.4)
    expect(redis.set).toHaveBeenCalledWith('ns:k', JSON.stringify({ value: 1, storedAt: 5 }), 'EX', 121)
    expect(await new RedisStore(redis, 'ns').get('k')).toEqual({ value: 1, storedAt: 5 })
  })

  it('falls back to memory (and warns once) when Redis fails', async () => {
    const broken = { get: vi.fn(async () => { throw new Error('ECONNREFUSED') }), set: vi.fn(async () => { throw new Error('ECONNREFUSED') }) }
    const logger = { warn: vi.fn() }
    const store = new RedisStore(broken, 'ns', logger)
    await store.set('k', { value: 'local', storedAt: 1 }, 60)
    expect(await store.get('k')).toEqual({ value: 'local', storedAt: 1 })
    expect(logger.warn).toHaveBeenCalledTimes(1)
  })
})
