import { MemoryStore } from '../cache/swr-cache'
import { CommerceError } from '../errors'
import { body, capability, catalogHeaders, isSignedIn, list, route, text, type RouteContext } from '../http'
import { categorySlugOf, MAX_STOCK_SKUS, optionsKey, parseProductQuery, parseSearchQuery, parseSkus, parseSlug } from '../query'
import type { NormalizedCategory, NormalizedProduct } from '../types'

/**
 * Public storefront routes (no Directus authentication needed):
 *
 *   GET  /commerce/products                    listing (filters, sort, paging)
 *   GET  /commerce/products/:slug              one product
 *   GET  /commerce/products/:slug/reviews      its reviews
 *   POST /commerce/products/:slug/reviews      write a review
 *   GET  /commerce/reviews/ratings             rating ids for writing reviews
 *   GET  /commerce/categories                  the category tree
 *   GET  /commerce/categories/:id              one category (with its subtree)
 *   GET  /commerce/search                      full-text search (+ facets)
 *   GET  /commerce/search/suggest              name suggestions
 *   GET  /commerce/store                       store settings
 *   GET  /commerce/gift-cards/products         gift card products
 *   GET  /commerce/sellers?sku=A,B             the marketplace seller of each SKU
 *   POST /commerce/realtime/stock              live quantities
 */
export function catalogRoutes({ router, config, cache, logger, backend }: RouteContext) {
  const stockCache = new MemoryStore(5000)

  // Product pages and reviews both start from the (cached) product.
  const productBySlug = async (slug: string) => {
    const result = await cache.get(`product:${slug.toLowerCase()}`, () => backend().getProductBySlug(slug))
    if (!result.value) throw new CommerceError('NOT_FOUND', `No product with slug "${slug}"`)
    return result as typeof result & { value: NormalizedProduct }
  }
  const categoryTree = () => cache.get('categories:tree', () => backend().getCategories())

  router.get('/products', route(logger, async (req, res) => {
    const options = parseProductQuery(req.query as Record<string, unknown>)
    const slug = categorySlugOf(req.query as Record<string, unknown>)
    if (slug && !options.categoryId && !options.categoryPath) {
      const resolve = capability(backend().resolveCategoryId, 'category slugs')
      const found = await cache.get(`category-slug:${slug.toLowerCase()}`, () => resolve(slug))
      // An unknown category is an empty listing, not an error (a CMS-only department, say).
      if (!found.value) {
        res.set('Cache-Control', `public, s-maxage=${config.cache.ttl}`)
        res.json({ data: { items: [], page: options.page ?? 1, pageSize: options.pageSize ?? 20, total: 0, totalPages: 0 } })
        return
      }
      options.categoryId = found.value
    }
    const result = await cache.get(`products:${optionsKey(options)}`, () => backend().getProductPage(options))
    catalogHeaders(res, config, result)
    // Paging lives inside `data`: the Directus SDK returns only `data`.
    res.json({ data: result.value })
  }))

  router.get('/products/:slug', route(logger, async (req, res) => {
    const result = await productBySlug(parseSlug(req.params.slug))
    catalogHeaders(res, config, result)
    res.json({ data: result.value })
  }))

  router.get('/products/:slug/reviews', route(logger, async (req, res) => {
    const reviews = capability(backend().reviews, 'reviews')
    const product = (await productBySlug(parseSlug(req.params.slug))).value
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100)
    const result = await cache.get(`reviews:${product.sku}:${limit}`, () => reviews.list(product.sku, limit))
    catalogHeaders(res, config, result)
    res.json({ data: result.value })
  }))

  // Public like the storefront's own review form; Mage-OS applies its guest-review
  // setting and moderation. Directus's rate limiter (RATE_LIMITER_*) bounds abuse.
  router.post('/products/:slug/reviews', route(logger, async (req, res) => {
    const reviews = capability(backend().reviews, 'reviews')
    const product = (await productBySlug(parseSlug(req.params.slug))).value
    const input = body(req)
    const review = await reviews.create(product.sku, {
      nickname: text(input, 'nickname', { max: 100 }),
      summary: text(input, 'summary', { max: 255 }),
      text: text(input, 'text', { max: 5000 }),
      ratings: list(input, 'ratings', 20, (r) => ({ id: text(r, 'id', { max: 64 }), valueId: text(r, 'valueId', { max: 64 }) })),
    })
    res.set('Cache-Control', 'no-store')
    res.status(201).json({ data: review })
  }))

  router.get('/reviews/ratings', route(logger, async (_req, res) => {
    const reviews = capability(backend().reviews, 'reviews')
    const result = await cache.get('reviews:ratings', () => reviews.ratings())
    catalogHeaders(res, config, result)
    res.json({ data: result.value })
  }))

  router.get('/categories', route(logger, async (_req, res) => {
    const result = await categoryTree()
    catalogHeaders(res, config, result)
    res.json({ data: result.value })
  }))

  router.get('/categories/:id', route(logger, async (req, res) => {
    const wanted = String(req.params.id ?? '')
    const result = await categoryTree()
    const find = (nodes: NormalizedCategory[]): NormalizedCategory | null => {
      for (const node of nodes) {
        if (node.id === wanted || node.path === wanted) return node
        const hit = find(node.children)
        if (hit) return hit
      }
      return null
    }
    const category = find(result.value)
    if (!category) throw new CommerceError('NOT_FOUND', 'No such category')
    catalogHeaders(res, config, result)
    res.json({ data: category })
  }))

  router.get('/search', route(logger, async (req, res) => {
    const search = capability(backend().search, 'search')
    const options = parseSearchQuery(req.query as Record<string, unknown>)
    const result = await cache.get(`search:${optionsKey(options)}`, () => search.call(backend(), options))
    catalogHeaders(res, config, result)
    res.json({ data: result.value })
  }))

  router.get('/search/suggest', route(logger, async (req, res) => {
    const suggest = capability(backend().suggest, 'suggestions')
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : ''
    if (!q || q.length > 100) throw new CommerceError('INVALID_QUERY', 'q is required (at most 100 characters)')
    const result = await cache.get(`suggest:${q.toLowerCase()}`, () => suggest.call(backend(), q))
    catalogHeaders(res, config, result)
    res.json({ data: result.value })
  }))

  router.get('/store', route(logger, async (_req, res) => {
    const getStoreConfig = capability(backend().getStoreConfig, 'store settings')
    const result = await cache.get('store:config', () => getStoreConfig.call(backend()))
    catalogHeaders(res, config, result)
    res.json({ data: result.value })
  }))

  router.get('/gift-cards/products', route(logger, async (_req, res) => {
    const giftCards = capability(backend().giftCards, 'gift cards')
    const result = await cache.get('gift-cards:products', () => giftCards.products())
    catalogHeaders(res, config, result)
    res.json({ data: result.value })
  }))

  router.get('/sellers', route(logger, async (req, res) => {
    const sellers = capability(backend().sellers, 'marketplace sellers')
    const skus = parseSkus(req.query.sku, 100)
    if (!skus.length) throw new CommerceError('INVALID_QUERY', 'sku is required (comma-separated)')
    const result = await cache.get(`sellers:${optionsKey(skus.slice().sort())}`, () => sellers.forSkus(skus))
    catalogHeaders(res, config, result)
    res.json({ data: result.value })
  }))

  // Live stock: skips the catalog cache. Answers are reused for a few
  // seconds (MAGEOS_STOCK_CACHE_SECONDS) only so a burst of identical
  // checks (e.g. a busy product page) doesn't fan out to Mage-OS.
  router.post('/realtime/stock', route(logger, async (req, res) => {
    if (config.stockRequiresAuth && !isSignedIn(req)) throw new CommerceError('FORBIDDEN', 'Sign in to check live stock')
    const input = (req.body ?? {}) as { skus?: unknown, sku?: unknown }
    const skus = parseSkus(input.skus ?? input.sku, MAX_STOCK_SKUS)
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
    res.json({ data: stock })
  }))
}
