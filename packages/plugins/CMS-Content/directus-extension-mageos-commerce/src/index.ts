import { defineEndpoint } from '@directus/extensions-sdk'
import { Redis } from 'ioredis'
import type { Router } from 'express'
import type { ICommerceAdapter } from './adapters/base.adapter'
import { createAdapter } from './backend'
import { MemoryStore, RedisStore, SwrCache, type CacheStore } from './cache/swr-cache'
import { type CommerceConfig, directusRedisOptions, readConfig } from './config'
import { CommerceError } from './errors'
import type { Logger, RouteContext } from './http'
import { accountRoutes } from './routes/account'
import { adminRoutes } from './routes/admin'
import { catalogRoutes } from './routes/catalog'
import { sellerRoutes } from './routes/sellers'

/**
 * /commerce/* — the commerce backend (Mage-OS by default) behind one
 * normalized API, callable with the Directus SDK's customEndpoint (see
 * sdk/). Public storefront routes are in routes/catalog.ts; customer,
 * seller, sync and admin routes (routes/account, sellers, admin) need a
 * trusted Directus caller.
 */

function createStore(config: CommerceConfig, env: Record<string, unknown>, logger: Logger): CacheStore {
  if (config.cache.store === 'memory') return new MemoryStore()
  const connection = config.cache.redisUrl || directusRedisOptions(env)
  if (!connection) {
    logger.info('[mageos-commerce] no Redis configured (MAGEOS_CACHE_REDIS_URL or Directus REDIS_*); caching in memory')
    return new MemoryStore()
  }
  // Fail fast while Redis is down instead of queueing: RedisStore then
  // falls back to memory for that call.
  const options = { maxRetriesPerRequest: 1, enableOfflineQueue: false, connectTimeout: 2000, lazyConnect: false }
  const redis = typeof connection === 'string' ? new Redis(connection, options) : new Redis({ ...connection, ...options })
  redis.on('error', () => {}) // reported (once) by RedisStore when a call fails
  return new RedisStore(redis, config.cache.namespace, logger)
}

export default defineEndpoint({
  id: 'commerce',
  handler: (router: Router, { env, logger }: { env: Record<string, unknown>, logger: Logger }) => {
    const config = readConfig(env)
    let adapter: ICommerceAdapter | null = null
    let configError: CommerceError | null = null
    try {
      adapter = createAdapter(config)
    } catch (error) {
      // Directus keeps running; the routes answer 503 until it's configured.
      configError = error instanceof CommerceError ? error : new CommerceError('NOT_CONFIGURED', String(error))
      logger.warn(`[mageos-commerce] disabled: ${configError.message}`)
    }
    if (adapter && !config.trusted.users.length && !config.trusted.roles.length) {
      logger.info('[mageos-commerce] only Directus admins can use the customer/seller/admin routes (set MAGEOS_TRUSTED_USERS)')
    }

    const context: RouteContext = {
      router,
      config,
      logger,
      cache: new SwrCache(createStore(config, env, logger), {
        ttl: config.cache.ttl,
        staleWhileRevalidate: config.cache.staleWhileRevalidate,
        staleIfError: config.cache.staleIfError,
      }, logger),
      backend: () => {
        if (!adapter) throw configError!
        return adapter
      },
    }
    catalogRoutes(context)
    accountRoutes(context)
    sellerRoutes(context)
    adminRoutes(context)
  },
})
