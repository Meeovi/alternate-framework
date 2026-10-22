import { CommerceError } from '../errors'
import { body, capability, idParam, list, number, privateHeaders, requireTrusted, route, text, type RouteContext } from '../http'
import type { AdminCollection } from '../types'

const COLLECTIONS = new Set<AdminCollection>(['customers', 'orders', 'creditmemos'])
const collectionParam = (value: string | undefined): AdminCollection => {
  if (!value || !COLLECTIONS.has(value as AdminCollection)) throw new CommerceError('NOT_FOUND', 'Unknown collection (customers, orders, creditmemos)')
  return value as AdminCollection
}

/**
 * Store administration (trusted callers only) — the app's /workspace tables:
 *
 *   GET    /commerce/admin/:collection                  rows (customers | orders | creditmemos)
 *   GET    /commerce/admin/:collection/schema           column definitions
 *   POST   /commerce/admin/customers                    create
 *   PATCH  /commerce/admin/customers/:id                edit (email, firstname, lastname, group_id)
 *   DELETE /commerce/admin/customers/:id
 *   GET    /commerce/admin/orders/by-reference/:ref     an order by its payment reference
 *   GET    /commerce/admin/orders/:orderId              one order, with what's refundable
 *   POST   /commerce/admin/orders/:orderId/refund       offline credit memo { items?, comment? }
 */
export function adminRoutes({ router, config, logger, backend }: RouteContext) {
  const trusted = (handler: Parameters<typeof route>[1]) => route(logger, async (req, res) => {
    requireTrusted(req, config)
    privateHeaders(res)
    await handler(req, res)
  })
  const admin = () => capability(backend().admin, 'store administration')

  // Specific paths before the :collection / :orderId patterns.
  router.get('/admin/orders/by-reference/:reference', trusted(async (req, res) => {
    const reference = String(req.params.reference ?? '')
    if (!reference || reference.length > 128) throw new CommerceError('INVALID_QUERY', 'Invalid reference')
    const order = await admin().orderByReference(reference)
    if (!order) throw new CommerceError('NOT_FOUND', 'No order with that reference')
    res.json({ data: order })
  }))

  router.get('/admin/:collection/schema', trusted(async (req, res) => {
    res.json({ data: admin().schema(collectionParam(req.params.collection)) })
  }))

  router.get('/admin/orders/:orderId', trusted(async (req, res) => {
    const order = await admin().order(idParam(req.params.orderId, 'orderId'))
    if (!order) throw new CommerceError('NOT_FOUND', 'Order not found')
    res.json({ data: order })
  }))

  router.get('/admin/:collection', trusted(async (req, res) => {
    res.json({ data: await admin().list(collectionParam(req.params.collection)) })
  }))

  router.post('/admin/customers', trusted(async (req, res) => {
    res.status(201).json({ data: await admin().createCustomer(body(req)) })
  }))

  router.patch('/admin/customers/:id', trusted(async (req, res) => {
    res.json({ data: await admin().updateCustomer(idParam(req.params.id, 'id'), body(req)) })
  }))

  router.delete('/admin/customers/:id', trusted(async (req, res) => {
    await admin().deleteCustomer(idParam(req.params.id, 'id'))
    res.status(204).end()
  }))

  router.post('/admin/orders/:orderId/refund', trusted(async (req, res) => {
    const input = req.body && typeof req.body === 'object' ? body(req) : {}
    const result = await admin().refund({
      orderId: idParam(req.params.orderId, 'orderId'),
      items: list(input, 'items', 200, (item) => ({ key: text(item, 'key', { max: 32 }), qty: number(item, 'qty', { min: 0 })! }), { required: false }),
      comment: text(input, 'comment', { max: 1000, required: false }),
    })
    res.status(201).json({ data: result })
  }))
}
