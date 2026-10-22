import { CommerceError } from '../errors'
import { body, capability, email, idParam, list, number, privateHeaders, requireTrusted, route, text, type RouteContext } from '../http'

/**
 * Customer-scoped routes, for a trusted server that has already
 * authenticated its user (Directus admin or MAGEOS_TRUSTED_USERS/_ROLES):
 *
 *   POST /commerce/customers                                  create the backend customer for a user
 *   GET  /commerce/customers/:customerId/orders               their orders (page, limit)
 *   GET  /commerce/customers/:customerId/orders/:orderId      one of their orders
 *   GET  /commerce/customers/:customerId/purchased-skus       SKUs they've paid for
 *   GET  /commerce/customers/:customerId/gift-cards           gift cards on their orders
 *   GET  /commerce/gift-cards/received?email=                 gift cards sent to an email
 *   POST /commerce/orders                                     record an order paid outside the backend
 */
export function accountRoutes({ router, config, logger, backend }: RouteContext) {
  const trusted = (handler: Parameters<typeof route>[1]) => route(logger, async (req, res) => {
    requireTrusted(req, config)
    privateHeaders(res)
    await handler(req, res)
  })

  router.post('/customers', trusted(async (req, res) => {
    const customers = capability(backend().customers, 'customers')
    const input = body(req)
    const created = await customers.create({
      firstname: text(input, 'firstname', { max: 255 }),
      lastname: text(input, 'lastname', { max: 255 }),
      email: email(input.email),
      wantsToSell: input.wantsToSell === true,
    })
    res.status(201).json({ data: created })
  }))

  router.get('/customers/:customerId/orders', trusted(async (req, res) => {
    const orders = capability(backend().orders, 'orders')
    const page = Math.max(Number(req.query.page) || 1, 1)
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100)
    res.json({ data: await orders.forCustomer(idParam(req.params.customerId, 'customerId'), page, limit) })
  }))

  router.get('/customers/:customerId/orders/:orderId', trusted(async (req, res) => {
    const orders = capability(backend().orders, 'orders')
    const order = await orders.oneForCustomer(idParam(req.params.customerId, 'customerId'), idParam(req.params.orderId, 'orderId'))
    if (!order) throw new CommerceError('NOT_FOUND', 'Order not found')
    res.json({ data: order })
  }))

  router.get('/customers/:customerId/purchased-skus', trusted(async (req, res) => {
    const orders = capability(backend().orders, 'orders')
    res.json({ data: await orders.purchasedSkus(idParam(req.params.customerId, 'customerId')) })
  }))

  router.get('/customers/:customerId/gift-cards', trusted(async (req, res) => {
    const giftCards = capability(backend().giftCards, 'gift cards')
    res.json({ data: await giftCards.purchased(idParam(req.params.customerId, 'customerId')) })
  }))

  router.get('/gift-cards/received', trusted(async (req, res) => {
    const giftCards = capability(backend().giftCards, 'gift cards')
    res.json({ data: await giftCards.received(email(req.query.email)) })
  }))

  // Idempotent on `reference` (e.g. the PayPal capture id): a retry returns the same order with created: false.
  router.post('/orders', trusted(async (req, res) => {
    const orders = capability(backend().orders, 'orders')
    const input = body(req)
    const billing = input.billingAddress
    if (billing !== undefined && (typeof billing !== 'object' || billing === null || Array.isArray(billing))) {
      throw new CommerceError('INVALID_QUERY', 'billingAddress must be an object')
    }
    const placed = await orders.placePaid({
      reference: text(input, 'reference', { max: 128 }),
      customerId: idParam(String(input.customerId ?? ''), 'customerId'),
      items: list(input, 'items', 100, (item) => ({ key: text(item, 'key', { max: 64 }), qty: number(item, 'qty', { min: 1, integer: true })! })),
      amountPaid: number(input, 'amountPaid')!,
      currency: text(input, 'currency', { max: 3 }),
      ...(billing ? { billingAddress: billing as Record<string, never> } : {}),
    })
    res.status(placed.created ? 201 : 200).json({ data: placed })
  }))
}
