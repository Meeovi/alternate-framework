import type { CatalogItem } from '../../runtime/types'
import { SupplierError, type Credentials, type SupplierProduct, type SupplierProvider } from './types'
import { assertAllowedHost } from '../utils/context'

/**
 * Printful (print on demand), API v1 — https://developers.printful.com/docs/
 * The seller connects their own Printful store with a private token
 * (Developer Portal → store-level token, scopes: sync_products/read, orders).
 * What gets imported are the seller's own designed "sync products"; prices
 * are the retail prices the seller set in Printful.
 * Rate limit: 120 requests / minute per store.
 */
const API = 'https://api.printful.com'
const PAGE_SIZE = 20

async function call<T>(credentials: Credentials, path: string, init: { method?: string, body?: unknown } = {}): Promise<T> {
  assertAllowedHost(`${API}${path}`)
  const response = await fetch(`${API}${path}`, {
    method: init.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${credentials.token}`,
      ...(credentials.storeId ? { 'X-PF-Store-Id': String(credentials.storeId) } : {}),
      ...(init.body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    ...(init.body === undefined ? {} : { body: JSON.stringify(init.body) }),
    signal: AbortSignal.timeout(20_000),
  })
  const data = await response.json().catch(() => null) as { result?: T, error?: { message?: string }, paging?: { total: number } } | null
  if (!response.ok) {
    const status = response.status === 401 || response.status === 403 ? 400 : 502
    throw new SupplierError(`Printful: ${data?.error?.message || `HTTP ${response.status}`}`, status)
  }
  return (path.startsWith('/store/products?') ? data : data?.result) as T
}

const money = (value: unknown) => {
  const n = Number.parseFloat(String(value ?? ''))
  return Number.isFinite(n) ? n : null
}

export const printful: SupplierProvider = {
  id: 'printful',
  label: 'Printful',

  async connect(input) {
    const token = String(input.token || '').trim()
    if (!/^[A-Za-z0-9._-]{20,200}$/.test(token)) throw new SupplierError('Paste a Printful private token', 400)
    const storeId = String(input.storeId || '').trim()
    if (storeId && !/^\d{1,12}$/.test(storeId)) throw new SupplierError('Store id must be a number', 400)
    const credentials: Credentials = { token, ...(storeId ? { storeId } : {}) }
    const store = await call<{ id: number, name: string }>(credentials, '/store')
    return { credentials, label: store?.name ? `Printful — ${store.name}` : 'Printful' }
  },

  async listCatalog(credentials, { page, query }) {
    const params = new URLSearchParams({ offset: String((page - 1) * PAGE_SIZE), limit: String(PAGE_SIZE) })
    if (query) params.set('search', query)
    const data = await call<{ result: { id: number, name: string, variants: number, thumbnail_url: string | null }[], paging: { total: number } }>(
      credentials, `/store/products?${params}`)
    const items: CatalogItem[] = (data.result ?? []).map((p) => ({
      id: String(p.id), name: p.name, image: p.thumbnail_url, price: null, variants: p.variants,
    }))
    return { items, hasMore: page * PAGE_SIZE < (data.paging?.total ?? 0) }
  },

  async getProduct(credentials, productId) {
    if (!/^\d{1,15}$/.test(productId)) throw new SupplierError('Invalid Printful product id', 400)
    const data = await call<{
      sync_product: { id: number, name: string, thumbnail_url: string | null }
      sync_variants: {
        id: number
        name: string
        retail_price: string
        availability_status?: string
        product: { product_id: number, image: string | null }
        files: { type: string, preview_url: string | null }[]
      }[]
    }>(credentials, `/store/products/${productId}`)

    // The catalogue product carries the description; one lookup is enough.
    const catalogId = data.sync_variants[0]?.product.product_id
    const catalog = catalogId
      ? await call<{ product: { description?: string } }>(credentials, `/products/${catalogId}`).catch(() => null)
      : null

    const previews = (v: (typeof data.sync_variants)[number]) =>
      v.files.find((f) => f.type === 'preview')?.preview_url ?? v.product.image ?? null
    const images = [data.sync_product.thumbnail_url, ...data.sync_variants.map(previews)]
      .filter((u): u is string => Boolean(u))

    const product: SupplierProduct = {
      id: String(data.sync_product.id),
      name: data.sync_product.name,
      description: catalog?.product.description ?? '',
      images: [...new Set(images)].slice(0, 8),
      variants: data.sync_variants.map((v) => ({
        id: String(v.id),
        name: v.name,
        cost: null,
        retailPrice: money(v.retail_price),
        stock: v.availability_status && v.availability_status !== 'active' ? 0 : null,
        weightKg: null,
        image: previews(v),
      })),
    }
    return product
  },

  async getStock(credentials, productId) {
    const product = await printful.getProduct(credentials, productId)
    return Object.fromEntries(product.variants.map((v) => [v.id, v.stock]))
  },

  async createOrder(credentials, order) {
    const r = order.recipient
    const result = await call<{ id: number, status: string }>(credentials, `/orders?confirm=${order.confirm ? 'true' : 'false'}`, {
      method: 'POST',
      body: {
        external_id: order.externalId.slice(0, 32),
        recipient: {
          name: r.name, address1: r.address1, address2: r.address2, city: r.city,
          state_code: r.regionCode, country_code: r.countryCode, zip: r.postcode, phone: r.phone, email: r.email,
        },
        items: order.items.map((i) => ({ sync_variant_id: Number(i.variantId), quantity: i.quantity })),
      },
    })
    return { supplierOrderId: String(result.id), status: result.status === 'draft' ? 'awaiting_payment' : 'forwarded' }
  },

  async getShipments(credentials, supplierOrderId) {
    const order = await call<{ shipments?: { carrier: string, tracking_number: string, tracking_url: string | null }[] }>(
      credentials, `/orders/${encodeURIComponent(supplierOrderId)}`)
    return (order.shipments ?? [])
      .filter((s) => s.tracking_number)
      .map((s) => ({ trackingNumber: s.tracking_number, trackingUrl: s.tracking_url, carrier: s.carrier }))
  },
}
