import type { ICommerceAdapter } from '../adapters/base.adapter'
import { CommerceError } from '../errors'
import type { NormalizedProduct } from '../types'
import { categoryRow, customerRow, flattenCategories, orderRow, productRow, storeTime } from './rows'

/**
 * Mage-OS → Directus: keeps Directus's products, categories, orders and
 * customers collections in step with the store, which stays the source of
 * truth. Run by the "Mage-OS sync" Flow operation (src/operations).
 *
 *  - products: the whole catalogue each run, with everything the product
 *    page has, and linked to their categories (products_categories); rows
 *    the store no longer sells are archived (never deleted — lists and pages
 *    may reference them).
 *  - categories: the whole tree; an existing CMS category with the same slug
 *    and no uid yet is linked rather than duplicated, and keeps its own name
 *    and position (only rows the sync created, mageos_owned, take the store's).
 *  - orders, customers: what changed since the newest mirrored change
 *    (orders.mageos_updated_at / customers.updated_at — the store's times).
 */

export type MirrorSection = 'products' | 'categories' | 'orders' | 'customers'
export const MIRROR_SECTIONS: MirrorSection[] = ['categories', 'products', 'customers', 'orders']

type Row = Record<string, any>
type Filter = Record<string, unknown>

/** Directus item writes, without firing the collections' own Flows/hooks. */
export interface MirrorStore {
  read(collection: string, filter: Filter, fields: string[], options?: { sort?: string[], limit?: number }): Promise<Row[]>
  create(collection: string, rows: Row[]): Promise<void>
  update(collection: string, key: string | number, row: Row): Promise<void>
  remove(collection: string, keys: (string | number)[]): Promise<void>
}

export interface MirrorStats {
  section: MirrorSection
  created: number
  updated: number
  /** Matched rows whose synced fields were already up to date (not written). */
  unchanged?: number
  archived?: number
  linked?: number
  /** products_categories rows added or removed. */
  links?: number
  /** More changes are waiting than one run takes; the next run continues. */
  more?: boolean
  skipped?: 'already running'
}

export interface MirrorOptions {
  pageSize?: number
  /** Pages of orders/customers per run, to keep a run short. */
  maxPages?: number
  now?: () => Date
}

const running = new Set<MirrorSection>()

/** Loose equality for values as Directus returns them (decimals as strings, timestamps as ISO). */
function same(a: unknown, b: unknown): boolean {
  if (a == null || b == null) return a == null && b == null
  if (typeof a === 'object' || typeof b === 'object') return JSON.stringify(a) === JSON.stringify(b)
  if (typeof a === 'boolean' || typeof b === 'boolean') return Boolean(a) === Boolean(b)
  const x = String(a), y = String(b)
  if (x === y) return true
  if (x.trim() !== '' && y.trim() !== '' && Number.isFinite(Number(x)) && Number.isFinite(Number(y))) return Number(x) === Number(y)
  const dx = Date.parse(x), dy = Date.parse(y)
  return /\d{4}-\d{2}-\d{2}/.test(x) && /\d{4}-\d{2}-\d{2}/.test(y) && !Number.isNaN(dx) && dx === dy
}

/** The fields of `row` that differ from `current` (mageos_synced_at alone isn't a change). */
function changes(current: Row, row: Row): Row | null {
  const diff = Object.fromEntries(Object.entries(row).filter(([field, value]) => field !== 'mageos_synced_at' && !same(current[field], value)))
  return Object.keys(diff).length ? { ...diff, mageos_synced_at: row.mageos_synced_at } : null
}

const PRODUCT_FIELDS = ['id', 'mageos_id', 'status', 'source', 'mageos_sku', 'name', 'slug', 'type', 'price', 'regular_price', 'currency_code', 'in_stock',
  'visibility', 'content', 'short_description', 'meta_title', 'meta_description', 'image_url', 'gallery', 'options', 'variants', 'mageos_attributes',
  'stock', 'salable_quantity', 'updated_at']
const CATEGORY_FIELDS = ['id', 'uid', 'slug', 'name', 'sort', 'mageos_path', 'mageos_parent_uid', 'mageos_level', 'mageos_owned']

export async function mirror(section: MirrorSection, adapter: ICommerceAdapter, store: MirrorStore, options: MirrorOptions = {}): Promise<MirrorStats> {
  if (running.has(section)) return { section, created: 0, updated: 0, skipped: 'already running' }
  running.add(section)
  try {
    const syncedAt = (options.now?.() ?? new Date()).toISOString()
    switch (section) {
      case 'products': return await products(adapter, store, syncedAt)
      case 'categories': return await categories(adapter, store, syncedAt)
      case 'orders': return await changed('orders', adapter, store, syncedAt, options)
      case 'customers': return await changed('customers', adapter, store, syncedAt, options)
    }
  } finally {
    running.delete(section)
  }
}

// Full product detail (variants included) per page, so smaller pages than a listing.
const PRODUCT_PAGE = 50
const STOCK_BATCH = 50

async function products(adapter: ICommerceAdapter, store: MirrorStore, syncedAt: string): Promise<MirrorStats> {
  const all: NormalizedProduct[] = []
  for (let page = 1; ; page++) {
    const result = await adapter.getProductPage({ page, pageSize: PRODUCT_PAGE, sort: 'name', detail: true })
    all.push(...result.items)
    if (page >= result.totalPages || !result.items.length) break
  }

  // Live quantities; when the store won't say, stock is left as it was.
  const qty: Record<string, number> = {}
  for (let i = 0; i < all.length; i += STOCK_BATCH) {
    Object.assign(qty, await adapter.getInventory(all.slice(i, i + STOCK_BATCH).map((p) => p.sku)).catch(() => ({})))
  }

  const existing = await store.read('products', { source: { _eq: 'magento' } }, PRODUCT_FIELDS, { limit: -1 })
  const byId = new Map(existing.filter((r) => r.mageos_id).map((r) => [String(r.mageos_id), r]))
  const stats: MirrorStats = { section: 'products', created: 0, updated: 0, unchanged: 0, archived: 0 }

  const fresh: Row[] = []
  for (const product of all) {
    const row = productRow(product, qty[product.sku], syncedAt)
    const current = byId.get(product.id)
    byId.delete(product.id)
    if (current) {
      const diff = changes(current, row)
      if (diff) {
        await store.update('products', current.id, diff)
        stats.updated++
      } else {
        stats.unchanged!++
      }
    } else {
      fresh.push(row)
    }
  }
  if (fresh.length) await store.create('products', fresh)
  stats.created = fresh.length

  for (const gone of byId.values()) {
    if (gone.status === 'archived') continue
    await store.update('products', gone.id, { status: 'archived', mageos_synced_at: syncedAt })
    stats.archived!++
  }
  stats.links = await linkCategories(store, all)
  return stats
}

/**
 * products_categories as the store has them. Only links to the store's
 * categories (categories.uid set) are managed; links an editor made to a
 * CMS-only category are left alone. Categories mirror first, so their rows
 * exist by now.
 */
async function linkCategories(store: MirrorStore, all: NormalizedProduct[]): Promise<number> {
  const storeCategories = await store.read('categories', { uid: { _nnull: true } }, ['id', 'uid'], { limit: -1 })
  const categoryByUid = new Map(storeCategories.map((r) => [String(r.uid), r.id]))
  const storeCategoryIds = new Set(storeCategories.map((r) => String(r.id)))
  const rows = await store.read('products', { source: { _eq: 'magento' }, mageos_id: { _nnull: true } }, ['id', 'mageos_id'], { limit: -1 })
  const productByUid = new Map(rows.map((r) => [String(r.mageos_id), r.id]))
  if (!productByUid.size) return 0

  const links = await store.read('products_categories', { products_id: { _in: [...productByUid.values()] } }, ['id', 'products_id', 'categories_id'], { limit: -1 })
  const linksOf = new Map<string, Row[]>()
  for (const link of links) {
    if (link.categories_id == null || !storeCategoryIds.has(String(link.categories_id))) continue
    linksOf.set(String(link.products_id), [...(linksOf.get(String(link.products_id)) ?? []), link])
  }

  const add: Row[] = []
  const remove: (string | number)[] = []
  for (const product of all) {
    const productId = productByUid.get(product.id)
    if (productId === undefined) continue
    const wanted = new Map(product.categories
      .map((c) => categoryByUid.get(c.id))
      .filter((id) => id !== undefined)
      .map((id) => [String(id), id]))
    for (const link of linksOf.get(String(productId)) ?? []) {
      // Kept once; a duplicate or a category the store dropped goes.
      if (wanted.delete(String(link.categories_id))) continue
      remove.push(link.id)
    }
    for (const categoryId of wanted.values()) add.push({ products_id: productId, categories_id: categoryId })
  }
  if (remove.length) await store.remove('products_categories', remove)
  if (add.length) await store.create('products_categories', add)
  return add.length + remove.length
}

async function categories(adapter: ICommerceAdapter, store: MirrorStore, syncedAt: string): Promise<MirrorStats> {
  const flat = flattenCategories(await adapter.getCategories())
  const existing = await store.read('categories', {}, CATEGORY_FIELDS, { limit: -1 })
  const byUid = new Map(existing.filter((r) => r.uid).map((r) => [String(r.uid), r]))
  const unlinkedBySlug = new Map(existing.filter((r) => !r.uid && r.slug).map((r) => [String(r.slug).toLowerCase(), r]))
  const stats: MirrorStats = { section: 'categories', created: 0, updated: 0, unchanged: 0, linked: 0 }

  const fresh: Row[] = []
  for (const entry of flat) {
    const row = categoryRow(entry, syncedAt)
    const current = byUid.get(entry.category.id)
    const sameSlug = current ? undefined : unlinkedBySlug.get(entry.category.slug.toLowerCase())
    if (current) {
      // A CMS category the sync linked keeps its own name and position.
      const { name: _n, sort: _s, ...linkOnly } = row
      const diff = changes(current, current.mageos_owned ? row : linkOnly)
      if (diff) {
        await store.update('categories', current.id, diff)
        stats.updated++
      } else {
        stats.unchanged!++
      }
    } else if (sameSlug) {
      // An existing CMS category: link it, keep its CMS name and copy.
      const { name: _name, sort: _sort, ...link } = row
      await store.update('categories', sameSlug.id, link)
      unlinkedBySlug.delete(entry.category.slug.toLowerCase())
      stats.linked!++
    } else {
      fresh.push({ ...row, slug: entry.category.slug, title: entry.category.name, mageos_owned: true })
    }
  }
  if (fresh.length) await store.create('categories', fresh)
  stats.created = fresh.length
  return stats
}

const DEFAULT_PAGE = 100
const DEFAULT_MAX_PAGES = 20

async function changed(section: 'orders' | 'customers', adapter: ICommerceAdapter, store: MirrorStore, syncedAt: string, options: MirrorOptions): Promise<MirrorStats> {
  if (!adapter.mirror) throw new CommerceError('NOT_SUPPORTED', `This backend can't mirror ${section}`)
  const pageSize = options.pageSize ?? DEFAULT_PAGE
  const maxPages = options.maxPages ?? DEFAULT_MAX_PAGES
  const changedField = section === 'orders' ? 'mageos_updated_at' : 'updated_at'

  // Resume from the newest change already mirrored (inclusive: re-reading it is harmless).
  const [newest] = await store.read(section, { mageos_synced_at: { _nnull: true } }, [changedField], { sort: [`-${changedField}`], limit: 1 })
  const since = newest?.[changedField] ? storeTime(newest[changedField]) : null

  const stats: MirrorStats = { section, created: 0, updated: 0, unchanged: 0 }
  for (let page = 1; page <= maxPages; page++) {
    const { items, total } = await adapter.mirror[section](since, page, pageSize)
    if (!items.length) break

    if (section === 'orders') {
      const ids = items.map((o) => Number(o.entity_id))
      const known = new Map((await store.read('orders', { entity_id: { _in: ids } }, ['id', 'entity_id', 'mageos_updated_at'], { limit: -1 })).map((r) => [Number(r.entity_id), r]))
      const fresh: Row[] = []
      for (const order of items) {
        const current = known.get(Number(order.entity_id))
        const row = orderRow(order, syncedAt)
        if (current && same(current.mageos_updated_at, row.mageos_updated_at)) {
          stats.unchanged!++
        } else if (current) {
          await store.update('orders', current.id, row)
          stats.updated++
        } else {
          fresh.push(row)
        }
      }
      if (fresh.length) await store.create('orders', fresh)
      stats.created += fresh.length
    } else {
      const ids = items.map((c) => Number(c.id))
      const known = new Map((await store.read('customers', { id: { _in: ids } }, ['id', 'updated_at', 'user_id'], { limit: -1 })).map((r) => [Number(r.id), r]))
      // The app account each customer belongs to (better-auth users.magento_customer_id).
      const users = await store.read('users', { magento_customer_id: { _in: ids.map(String) } }, ['id', 'magento_customer_id'], { limit: -1 })
      const userOf = new Map(users.map((u) => [String(u.magento_customer_id), String(u.id)]))
      const fresh: Row[] = []
      for (const customer of items) {
        const row = customerRow(customer, userOf.get(String(customer.id)) ?? null, syncedAt)
        const current = known.get(Number(customer.id))
        if (current && same(current.updated_at, row.updated_at) && same(current.user_id, row.user_id)) {
          stats.unchanged!++
        } else if (current) {
          const { id, ...fields } = row
          await store.update('customers', id!, fields)
          stats.updated++
        } else {
          fresh.push(row)
        }
      }
      if (fresh.length) await store.create('customers', fresh)
      stats.created += fresh.length
    }

    if (page * pageSize >= total) return stats
  }
  stats.more = true
  return stats
}
