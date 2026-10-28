import { createDirectus, readItems, rest, staticToken } from '@directus/sdk'

/**
 * "Recently purchased" rows: the products on paid orders, newest first, as
 * productCard renders them. An order line names its product as a Directus
 * id (the app's own catalogue) or `magento:<sku>` (a store product, often a
 * variant SKU of a configurable product). Store products are matched to
 * their synced row in Directus `products` (the Mage-OS mirror), whose
 * checkout the cart already routes to the store. Products no longer for
 * sale are left out.
 */

const directus = () => createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

/** What productCard reads (as bestsellers.vue asks for it). */
const CARD_FIELDS = ['*', 'brands.brands_id.*', 'image.*', 'shops.shops_id.name']

/** Only orders the buyer has paid for and kept. */
export const PAID = new Set(['completed', 'paid'])

type OrderLike = { line_items_snapshot?: Array<{ product_id?: string | null }> | null }

/** Each line's product ref, newest order first, without repeats. */
export function purchasedRefs(orders: OrderLike[]): string[] {
  const refs: string[] = []
  for (const order of orders) {
    for (const line of order.line_items_snapshot ?? []) {
      const ref = line?.product_id ? String(line.product_id) : ''
      if (ref && !refs.includes(ref)) refs.push(ref)
    }
  }
  return refs
}

/** Card-ready products for refs, in the refs' order (after deduping variants to their product), at most `limit`. */
export async function productsForRefs(refs: string[], limit: number): Promise<Record<string, any>[]> {
  const directusIds = refs.filter((ref) => /^\d+$/.test(ref))
  const skus = refs.filter((ref) => ref.startsWith('magento:')).map((ref) => ref.slice('magento:'.length)).filter(Boolean)
  const api = directus()

  const own = directusIds.length
    ? await api.request(readItems('products' as any, {
        fields: CARD_FIELDS,
        filter: { id: { _in: directusIds }, status: { _eq: 'published' } },
        limit: directusIds.length,
      })).catch(() => []) as Record<string, any>[]
    : []

  // Store products by their own SKU, then variant SKUs through their parent's variants.
  const store = skus.length
    ? await api.request(readItems('products' as any, {
        fields: [...CARD_FIELDS, 'variants'],
        filter: { source: { _eq: 'magento' }, status: { _eq: 'published' }, _or: [{ mageos_sku: { _in: skus } }, { type: { _eq: 'configurable' } }] },
        limit: -1,
      })).catch(() => []) as Record<string, any>[]
    : []
  const bySku = new Map<string, Record<string, any>>()
  for (const product of store) {
    if (product.mageos_sku) bySku.set(String(product.mageos_sku), product)
    for (const variant of Array.isArray(product.variants) ? product.variants : []) {
      if (variant?.sku && !bySku.has(String(variant.sku))) bySku.set(String(variant.sku), product)
    }
  }

  const byId = new Map(own.map((product) => [String(product.id), product]))
  const out: Record<string, any>[] = []
  const seen = new Set<string>()
  for (const ref of refs) {
    const found = ref.startsWith('magento:') ? bySku.get(ref.slice('magento:'.length)) : byId.get(ref)
    if (!found || seen.has(String(found.id))) continue
    seen.add(String(found.id))
    // `*` also returns the ids of every order, list, return… linked to the
    // product: who bought or saved it is not for a public product card.
    const { variants: _variants, orders: _o, order_items: _oi, returns: _r, subscriptions: _s, shipment: _sh, report: _rp, lists: _l, list_items: _li, user: _u, ...product } = found
    // A store product's image is the store's URL (image_url), not a Directus file.
    out.push(product.source === 'magento' ? { ...product, image: product.image || product.image_url || null } : product)
    if (out.length >= limit) break
  }
  return out
}

/** Recent paid orders across the site (Directus `orders`: the app's own and the store's, synced). */
export async function recentPaidOrders(take = 60): Promise<OrderLike[]> {
  const rows = await directus().request(readItems('orders' as any, {
    fields: ['payment_status', 'date_created', 'mageos_created_at', 'line_items_snapshot'],
    filter: { payment_status: { _in: [...PAID] } },
    sort: ['-date_created'],
    limit: take,
  })) as Array<OrderLike & { date_created?: string | null, mageos_created_at?: string | null }>
  // A synced order's date_created is when it was copied; the store's own time wins.
  const when = (row: { date_created?: string | null, mageos_created_at?: string | null }) => String(row.mageos_created_at || row.date_created || '')
  return [...rows].sort((a, b) => when(b).localeCompare(when(a)))
}

export function readLimit(raw: unknown, fallback = 12, max = 24): number {
  const n = Number(raw)
  return Number.isInteger(n) && n > 0 ? Math.min(n, max) : fallback
}
