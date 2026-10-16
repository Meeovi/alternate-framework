import type { H3Event } from 'h3'
import type { ForwardedOrder, ImportedProduct, MarkupRule, ProviderId, SupplierConnection } from '../../runtime/types'
import { directus } from './context'

/**
 * Directus collections (created by scripts/setup-directus.mjs):
 *   dropship_connections — a seller's supplier account; `credentials` is
 *                          AES-GCM sealed (context.ts), never sent to clients
 *   dropship_products    — supplier variant ↔ Magento SKU
 *   dropship_orders      — Magento order forwarded to a supplier
 */

export interface ConnectionRow {
  id: string
  user_id: string
  magento_customer_id: number
  provider: ProviderId
  label: string
  credentials: string
  status: SupplierConnection['status']
  last_error: string | null
  auto_confirm_orders: boolean
  date_created: string
}

export interface ProductRow {
  id: string
  connection_id: string
  user_id: string
  magento_customer_id: number
  provider: ProviderId
  supplier_product_id: string
  supplier_variant_id: string
  sku: string
  name: string
  cost: number | null
  price: number
  markup: MarkupRule | null
  stock: number | null
  status: ImportedProduct['status']
  last_error: string | null
  last_synced: string | null
}

export interface OrderRow {
  id: string
  connection_id: string
  user_id: string
  provider: ProviderId
  magento_order_id: number
  magento_increment_id: string
  /** This seller's lines in the Magento order. */
  magento_items: { item_id: number, qty: number }[]
  supplier_order_id: string | null
  status: ForwardedOrder['status']
  tracking_number: string | null
  tracking_url: string | null
  carrier: string | null
  attempts: number
  last_error: string | null
  date_created: string
}

const rows = <T>(res: { data?: T[] }) => res.data ?? []

export const store = (event?: H3Event) => {
  const api = directus(event)
  const list = <T>(collection: string, filter: Record<string, unknown>, extra: Record<string, unknown> = {}) =>
    api<{ data: T[] }>(`/items/${collection}`, { query: { filter: JSON.stringify(filter), limit: -1, ...extra } }).then(rows)
  const create = <T>(collection: string, body: Record<string, unknown>) =>
    api<{ data: T }>(`/items/${collection}`, { method: 'POST', body }).then((r) => r.data)
  const update = <T>(collection: string, id: string, body: Record<string, unknown>) =>
    api<{ data: T }>(`/items/${collection}/${encodeURIComponent(id)}`, { method: 'PATCH', body }).then((r) => r.data)

  return {
    connections: {
      forUser: (userId: string) => list<ConnectionRow>('dropship_connections', { user_id: { _eq: userId } }, { sort: '-date_created' }),
      active: () => list<ConnectionRow>('dropship_connections', { status: { _neq: 'disconnected' } }),
      get: async (id: string) => (await list<ConnectionRow>('dropship_connections', { id: { _eq: id } }))[0] ?? null,
      create: (body: Partial<ConnectionRow>) => create<ConnectionRow>('dropship_connections', body),
      update: (id: string, body: Partial<ConnectionRow>) => update<ConnectionRow>('dropship_connections', id, body),
    },
    products: {
      forUser: (userId: string) => list<ProductRow>('dropship_products', { user_id: { _eq: userId } }, { sort: '-date_created' }),
      forConnection: (connectionId: string) => list<ProductRow>('dropship_products', { connection_id: { _eq: connectionId } }),
      bySku: async (sku: string) => (await list<ProductRow>('dropship_products', { sku: { _eq: sku } }))[0] ?? null,
      create: (body: Partial<ProductRow>) => create<ProductRow>('dropship_products', body),
      update: (id: string, body: Partial<ProductRow>) => update<ProductRow>('dropship_products', id, body),
    },
    orders: {
      forUser: (userId: string) => list<OrderRow>('dropship_orders', { user_id: { _eq: userId } }, { sort: '-date_created', limit: 200 }),
      find: async (connectionId: string, magentoOrderId: number) =>
        (await list<OrderRow>('dropship_orders', { connection_id: { _eq: connectionId }, magento_order_id: { _eq: magentoOrderId } }))[0] ?? null,
      awaitingTracking: () => list<OrderRow>('dropship_orders', { status: { _in: ['forwarded', 'awaiting_payment'] } }),
      create: (body: Partial<OrderRow>) => create<OrderRow>('dropship_orders', body),
      update: (id: string, body: Partial<OrderRow>) => update<OrderRow>('dropship_orders', id, body),
    },
  }
}

// ---------------------------------------------------------------------------
// Pricing

/** Retail price from supplier cost and the seller's markup rule. */
export function priceFrom(cost: number, rule: MarkupRule): number {
  const raw = rule.type === 'percent' ? cost * (1 + rule.value / 100) : cost + rule.value
  if (!rule.charmPricing) return Math.round(raw * 100) / 100
  return Math.max(0.99, Math.ceil(raw) - 0.01)
}

export function checkMarkup(input: unknown): MarkupRule {
  const rule = (input ?? {}) as Partial<MarkupRule>
  const type = rule.type === 'fixed' ? 'fixed' : 'percent'
  const value = Number(rule.value ?? 40)
  if (!Number.isFinite(value) || value < 0 || value > (type === 'percent' ? 1000 : 10000)) {
    throw new Error('Markup must be a positive number')
  }
  return { type, value, charmPricing: Boolean(rule.charmPricing) }
}

// ---------------------------------------------------------------------------
// Client-safe shapes

export const toConnection = (r: ConnectionRow): SupplierConnection => ({
  id: r.id, provider: r.provider, label: r.label, status: r.status, lastError: r.last_error,
  autoConfirmOrders: Boolean(r.auto_confirm_orders), dateCreated: r.date_created,
})

export const toProduct = (r: ProductRow): ImportedProduct => ({
  id: r.id, provider: r.provider, connectionId: r.connection_id, supplierProductId: r.supplier_product_id,
  supplierVariantId: r.supplier_variant_id, sku: r.sku, name: r.name, cost: r.cost === null ? null : Number(r.cost),
  price: Number(r.price), stock: r.stock, status: r.status, lastError: r.last_error, lastSynced: r.last_synced,
})

export const toOrder = (r: OrderRow): ForwardedOrder => ({
  id: r.id, provider: r.provider, magentoOrder: r.magento_increment_id, supplierOrderId: r.supplier_order_id,
  status: r.status, trackingNumber: r.tracking_number, trackingUrl: r.tracking_url, lastError: r.last_error,
  dateCreated: r.date_created,
})
