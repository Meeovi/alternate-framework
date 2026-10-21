import { defineEndpoint } from '@directus/extensions-sdk'
import { Redis } from 'ioredis'
import type { Request, Response, Router } from 'express'
import type { ICommerceAdapter } from './adapters/base.adapter'
import { MageOsAdapter } from './adapters/mage-os.adapter'
import { MemoryStore, RedisStore, SwrCache, type CacheResult, type CacheStore } from './cache/swr-cache'
import { type CommerceConfig, directusRedisOptions, readConfig } from './config'
import { CommerceError } from './errors'
import { MAX_STOCK_SKUS, optionsKey, parseProductQuery, parseSkus, parseSlug } from './query'

/**
 * /commerce/* — the storefront catalog in a backend-agnostic shape
 * (src/types.ts), backed by an ICommerceAdapter (Mage-OS by default).
 *
 *   GET  /commerce/products          paginated, filtered, sorted listing
 *   GET  /commerce/products/:slug    one product
 *   GET  /commerce/categories        the category tree
 *   POST /commerce/realtime/stock    live quantities, { skus: string[] }
 */

type Logger = { info: (...a: unknown[]) => void, warn: (...a: unknown[]) => void, error: (...a: unknown[]) => void }

/** The one place that knows which backend is in use. */
export function createAdapter(config: CommerceConfig): ICommerceAdapter {
  return new MageOsAdapter({
    url: config.mageos.url,
    token: config.mageos.token,
    consumerKey: config.mageos.consumerKey,
    consumerSecret: config.mageos.consumerSecret,
    tokenSecret: config.mageos.tokenSecret,
    storeCode: config.mageos.storeCode,
    timeoutMs: config.mageos.timeoutMs,
    categoryDepth: config.mageos.categoryDepth,
  })
}

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

function catalogHeaders(res: Response, config: CommerceConfig, result: CacheResult<unknown>) {
  res.set('X-Commerce-Cache', result.status)
  res.set('Age', String(Math.floor(result.age)))
  // A stale-if-error answer is cached briefly so the CDN retries Mage-OS soon.
  res.set('Cache-Control', result.status === 'STALE-IF-ERROR'
    ? 'public, s-maxage=30'
    : `public, s-maxage=${config.cache.ttl}, stale-while-revalidate=${config.cache.staleWhileRevalidate}`)
}

function sendError(res: Response, error: unknown, logger: Logger) {
  const known = error instanceof CommerceError
  if (!known) logger.error(error, '[mageos-commerce] unexpected error')
  else if (error.upstream || error.code === 'NOT_CONFIGURED') logger.warn(`[mageos-commerce] ${error.code}: ${error.message}`)
  res.set('Cache-Control', 'no-store')
  res.status(known ? error.status : 500).json({
    errors: [{
      message: known ? error.message : 'Internal error',
      extensions: { code: known ? error.code : 'INTERNAL' },
    }],
  })
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
    const cache = new SwrCache(createStore(config, env, logger), {
      ttl: config.cache.ttl,
      staleWhileRevalidate: config.cache.staleWhileRevalidate,
      staleIfError: config.cache.staleIfError,
    }, logger)
    const stockCache = new MemoryStore(5000)

    const backend = (): ICommerceAdapter => {
      if (!adapter) throw configError!
      return adapter
    }
    const route = (handler: (req: Request, res: Response) => Promise<void>) =>
      (req: Request, res: Response) => { handler(req, res).catch((error) => sendError(res, error, logger)) }

    router.get('/products', route(async (req, res) => {
      const options = parseProductQuery(req.query as Record<string, unknown>)
      const result = await cache.get(`products:${optionsKey(options)}`, () => backend().getProductPage(options))
      catalogHeaders(res, config, result)
      const { items, ...meta } = result.value
      res.json({ data: items, meta })
    }))

    router.get('/products/:slug', route(async (req, res) => {
      const slug = parseSlug(req.params.slug)
      const result = await cache.get(`product:${slug.toLowerCase()}`, () => backend().getProductBySlug(slug))
      if (!result.value) throw new CommerceError('NOT_FOUND', `No product with slug "${slug}"`)
      catalogHeaders(res, config, result)
      res.json({ data: result.value })
    }))

    router.get('/categories', route(async (_req, res) => {
      const result = await cache.get('categories:tree', () => backend().getCategories())
      catalogHeaders(res, config, result)
      res.json({ data: result.value })
    }))

    // Live stock: skips the catalog cache. Answers are reused for a few
    // seconds (MAGEOS_STOCK_CACHE_SECONDS) only so a burst of identical
    // checks (e.g. a busy product page) doesn't fan out to Mage-OS.
    router.post('/realtime/stock', route(async (req, res) => {
      if (config.stockRequiresAuth && !(req as Request & { accountability?: { user?: string | null } }).accountability?.user) {
        throw new CommerceError('FORBIDDEN', 'Sign in to check live stock')
      }
      const body = (req.body ?? {}) as { skus?: unknown, sku?: unknown }
      const skus = parseSkus(body.skus ?? body.sku, MAX_STOCK_SKUS)
      if (!skus.length) throw new CommerceError('INVALID_QUERY', 'Send { "skus": ["SKU-1", …] }')

      const stock: Record<string, number | null> = {}
      const missing: string[] = []
      for (const sku of skus) {
        const hit = config.cache.stockTtl > 0 ? await stockCache.get(`stock:${sku}`) : null
        if (hit) stock[sku] = hit.value as number | null
        else missing.push(sku)
      }
      if (missing.length) {
        const live = await backend().getInventory(missing)
        for (const sku of missing) {
          // null = SKU unknown to the backend.
          stock[sku] = live[sku] ?? null
          if (config.cache.stockTtl > 0) await stockCache.set(`stock:${sku}`, { value: stock[sku], storedAt: Date.now() }, config.cache.stockTtl)
        }
      }
      res.set('Cache-Control', 'no-store')
      res.json({ data: stock, meta: { checkedAt: new Date().toISOString() } })
    }))
  },
})
