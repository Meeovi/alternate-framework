import { createDirectus, readItems, rest, staticToken } from '@directus/sdk'
import { CommerceBackendRegistry } from 'alternate-sdk'
import type { BackendOrder } from 'alternate-sdk'
import { backendCustomerId } from './productRef'

/**
 * Order history, backend-agnostic. Each installed commerce backend that
 * keeps orders (CommerceBackendAdapter.customerOrders — adapter-magento's
 * Magento) owns the orders for its products; Directus holds the rest (the
 * app's own catalogue, written by the Stripe webhook). Pages read both
 * through /api/commerce/orders and never talk to a backend directly.
 *
 * Routing keys: `<backend>:<id>` for a backend's order, the plain id for
 * a Directus one.
 */

export type AppOrder = BackendOrder & {
  /** Route key (/order/<key>). */
  key: string
  /** 'directus' or the backend's id. */
  source: string
}

type SessionUser = { id: string, [key: string]: unknown }

const ORDER_FIELDS = ['*']

// The real Directus orders collection — not getDirectusFacade(), which
// would hand `orders` reads to the active backend's adapter.
const directusOrders = () => createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

function orderBackends() {
  return CommerceBackendRegistry.list().filter((b) => b.id !== 'directus' && b.isEnabled() && typeof b.customerOrders === 'function')
}

const fromDirectus = (row: Record<string, any>): AppOrder => ({
  ...(row as BackendOrder),
  id: String(row.id),
  number: String(row.id),
  line_items_snapshot: Array.isArray(row.line_items_snapshot) ? row.line_items_snapshot : [],
  key: String(row.id),
  source: 'directus',
})

const fromBackend = (backend: string, order: BackendOrder): AppOrder => ({ ...order, key: `${backend}:${order.id}`, source: backend })

/** The signed-in user's orders from every source, newest first. A backend
 *  that fails is skipped (and logged) rather than failing the page. */
export async function ordersFor(user: SessionUser): Promise<AppOrder[]> {
  const sources: Promise<AppOrder[]>[] = [
    directusOrders().request(readItems('orders', {
      fields: ORDER_FIELDS,
      filter: { buyer_id: { _eq: user.id } },
      sort: ['-date_created'],
      limit: 200,
    })).then((rows: any[]) => (rows ?? []).map(fromDirectus)),
  ]
  for (const backend of orderBackends()) {
    const customerId = backendCustomerId(backend.id, user)
    if (!customerId) continue
    sources.push(backend.customerOrders!(customerId).then((orders) => orders.map((o) => fromBackend(backend.id, o))))
  }
  const settled = await Promise.allSettled(sources)
  const orders: AppOrder[] = []
  for (const result of settled) {
    if (result.status === 'fulfilled') orders.push(...result.value)
    else console.error('[orders] a source failed', result.reason)
  }
  return orders.sort((a, b) => String(b.date_created ?? '').localeCompare(String(a.date_created ?? '')))
}

/** One of the signed-in user's orders by route key; null when it isn't theirs. */
export async function orderFor(user: SessionUser, key: string): Promise<AppOrder | null> {
  const match = /^([a-z][a-z0-9-]{1,31}):(.{1,64})$/.exec(key)
  if (match && match[1] !== 'directus') {
    const backend = CommerceBackendRegistry.get(match[1]!)
    const customerId = backend ? backendCustomerId(backend.id, user) : null
    if (!backend || typeof backend.customerOrder !== 'function' || !customerId) return null
    const order = await backend.customerOrder(customerId, match[2]!)
    return order ? fromBackend(backend.id, order) : null
  }
  const id = match ? match[2]! : key
  if (!/^\d+$/.test(id)) return null
  const rows = await directusOrders().request(readItems('orders', {
    fields: ORDER_FIELDS,
    filter: { _and: [{ id: { _eq: id } }, { buyer_id: { _eq: user.id } }] },
    limit: 1,
  })).catch(() => []) as any[]
  return rows?.[0] ? fromDirectus(rows[0]) : null
}
