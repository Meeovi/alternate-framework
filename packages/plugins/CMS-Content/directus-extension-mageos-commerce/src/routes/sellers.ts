import { CommerceError } from '../errors'
import { body, capability, idParam, list, number, privateHeaders, requireTrusted, route, text, type Body, type RouteContext } from '../http'
import type { OrderFilter } from '../types'

/** An optional list of positive whole numbers (category / website ids). */
function integers(source: Body, key: string): number[] | undefined {
  const value = source[key]
  if (value === undefined || value === null) return undefined
  if (!Array.isArray(value) || value.length > 50 || value.some((n) => !Number.isInteger(Number(n)) || Number(n) <= 0)) {
    throw new CommerceError('INVALID_QUERY', `${key} must be a list of at most 50 whole numbers`)
  }
  return value.map(Number)
}

/**
 * Marketplace seller and catalogue-sync routes (trusted callers only):
 *
 *   POST  /commerce/sellers/register                       { customerId, customerToken, shopUrl? }
 *   POST  /commerce/sellers/:customerId/products           { customerToken, sku, name, price, … }
 *   GET   /commerce/sellers/:customerId/shop               shop profile
 *   PATCH /commerce/sellers/:customerId/shop               update shop profile
 *   GET   /commerce/sellers/:customerId/products|orders|transactions|low-stock
 *   POST  /commerce/sync/products | /sync/stock | /sync/images
 *   GET   /commerce/sync/orders?filters=[{field,value,condition}]&limit=
 *   POST  /commerce/sync/orders/:orderId/ship
 *
 * register / create product are self-scoped in Mage-OS: they run with the
 * seller's own customer token, which the caller passes in.
 */
export function sellerRoutes({ router, config, logger, backend }: RouteContext) {
  const trusted = (handler: Parameters<typeof route>[1]) => route(logger, async (req, res) => {
    requireTrusted(req, config)
    privateHeaders(res)
    await handler(req, res)
  })
  const sellers = () => capability(backend().sellers, 'marketplace sellers')
  const sync = () => capability(backend().catalogSync, 'catalogue sync')

  router.post('/sellers/register', trusted(async (req, res) => {
    const input = body(req)
    const result = await sellers().register(idParam(String(input.customerId ?? ''), 'customerId'), text(input, 'customerToken', { max: 2048 }), text(input, 'shopUrl', { max: 255, required: false }))
    res.status(201).json({ data: result })
  }))

  router.post('/sellers/:customerId/products', trusted(async (req, res) => {
    const input = body(req)
    const result = await sellers().createProduct(idParam(req.params.customerId, 'customerId'), text(input, 'customerToken', { max: 2048 }), {
      sku: text(input, 'sku', { max: 64 }),
      name: text(input, 'name', { max: 255 }),
      price: number(input, 'price')!,
      description: text(input, 'description', { max: 65_000, required: false }),
      shortDescription: text(input, 'shortDescription', { max: 5000, required: false }),
      qty: number(input, 'qty', { required: false }),
      weight: number(input, 'weight', { required: false }),
      attributeSetId: number(input, 'attributeSetId', { integer: true, required: false }),
      websiteIds: integers(input, 'websiteIds'),
      categoryIds: integers(input, 'categoryIds'),
    })
    res.status(201).json({ data: result })
  }))

  router.get('/sellers/:customerId/shop', trusted(async (req, res) => {
    const shop = await sellers().shop(idParam(req.params.customerId, 'customerId'))
    if (!shop) throw new CommerceError('NOT_FOUND', 'Not a seller')
    res.json({ data: shop })
  }))

  router.patch('/sellers/:customerId/shop', trusted(async (req, res) => {
    const updates = body(req)
    delete updates.customerId
    res.json({ data: await sellers().updateShop(idParam(req.params.customerId, 'customerId'), updates) })
  }))

  for (const [path, method] of [['products', 'products'], ['orders', 'orders'], ['transactions', 'transactions'], ['low-stock', 'lowStock']] as const) {
    router.get(`/sellers/:customerId/${path}`, trusted(async (req, res) => {
      res.json({ data: await sellers()[method](idParam(req.params.customerId, 'customerId')) })
    }))
  }

  router.post('/sync/products', trusted(async (req, res) => {
    const input = body(req)
    res.json({
      data: await sync().upsertProduct({
        customerId: number(input, 'customerId', { min: 1, integer: true })!,
        sku: text(input, 'sku', { max: 64 }),
        name: text(input, 'name', { max: 255 }),
        price: number(input, 'price')!,
        description: text(input, 'description', { max: 65_000, required: false }),
        shortDescription: text(input, 'shortDescription', { max: 5000, required: false }),
        qty: number(input, 'qty', { required: false }),
        weight: number(input, 'weight', { required: false }) ?? null,
        categoryIds: integers(input, 'categoryIds'),
        ...(typeof input.enabled === 'boolean' ? { enabled: input.enabled } : {}),
      }),
    })
  }))

  router.post('/sync/stock', trusted(async (req, res) => {
    const input = body(req)
    res.json({
      data: await sync().updateStock({
        customerId: number(input, 'customerId', { min: 1, integer: true })!,
        sku: text(input, 'sku', { max: 64 }),
        qty: number(input, 'qty')!,
        price: number(input, 'price', { required: false }) ?? null,
        enabled: typeof input.enabled === 'boolean' ? input.enabled : null,
      }),
    })
  }))

  router.post('/sync/images', trusted(async (req, res) => {
    const input = body(req)
    const mimeType = text(input, 'mimeType', { max: 20 })
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(mimeType)) throw new CommerceError('INVALID_QUERY', 'mimeType must be image/jpeg, image/png or image/gif')
    res.json({
      data: await sync().addImage({
        customerId: number(input, 'customerId', { min: 1, integer: true })!,
        sku: text(input, 'sku', { max: 64 }),
        base64Content: text(input, 'base64Content', { max: 15_000_000 }),
        mimeType: mimeType as 'image/jpeg',
        fileName: text(input, 'fileName', { max: 255 }),
        ...(typeof input.isMain === 'boolean' ? { isMain: input.isMain } : {}),
      }),
    })
  }))

  router.get('/sync/orders', trusted(async (req, res) => {
    let filters: OrderFilter[] = []
    if (typeof req.query.filters === 'string' && req.query.filters) {
      try {
        filters = JSON.parse(req.query.filters)
      } catch {
        throw new CommerceError('INVALID_QUERY', 'filters must be JSON: [{"field":"…","value":"…","condition":"eq"}]')
      }
    }
    if (!Array.isArray(filters) || filters.length > 10 || filters.some((f) => typeof f?.field !== 'string' || typeof f?.value !== 'string' || !/^[a-z_.]{1,64}$/.test(f.field))) {
      throw new CommerceError('INVALID_QUERY', 'filters must be up to 10 {field, value, condition?} objects')
    }
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200)
    res.json({ data: await sync().listOrders(filters, limit) })
  }))

  router.post('/sync/orders/:orderId/ship', trusted(async (req, res) => {
    const input = body(req)
    const shipmentId = await sync().shipOrder(idParam(req.params.orderId, 'orderId'), {
      items: list(input, 'items', 200, (item) => ({ order_item_id: number(item, 'order_item_id', { min: 1, integer: true })!, qty: number(item, 'qty', { min: 1 })! })),
      tracks: list(input, 'tracks', 20, (t) => ({ track_number: text(t, 'track_number', { max: 128 }), title: text(t, 'title', { max: 128 }), carrier_code: text(t, 'carrier_code', { max: 64 }) }), { required: false }),
      ...(typeof input.notify === 'boolean' ? { notify: input.notify } : {}),
    })
    res.status(201).json({ data: { shipmentId: String(shipmentId) } })
  }))
}
