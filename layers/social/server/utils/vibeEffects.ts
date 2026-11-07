import { createError } from 'h3'
import { createDirectus, createItem, deleteItem, readItems, rest, staticToken } from '@directus/sdk'
import { ordersFor } from '#commerce/server/utils/orders'
import { PAID, purchasedRefs } from '#commerce/server/utils/purchasedProducts'

/**
 * Stickers, filters and backgrounds for the vibe editor (Directus
 * `vibe_effects`, admin-only through the CMS proxy):
 *  - a member's own (creator_id), private or shared free with the community;
 *  - a seller's, sold as a product (`product` → the Directus product, a
 *    Mage-OS mirror): usable once bought, or by anyone when it's free.
 * Images are served through /api/social/vibez/effects/:id/asset (same
 * origin, so the editor's canvas can record them, and paid ones only reach
 * their owners). The Pixanomy link itself never leaves the server.
 */

const directus = () => createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

export type EffectKind = 'sticker' | 'filter' | 'background'
export const KINDS: EffectKind[] = ['sticker', 'filter', 'background']
export const MAX_PER_MEMBER = 100

type Viewer = { id: string, role?: string | null } | null | undefined

export type EffectRow = {
  id: number
  status?: string | null
  kind: EffectKind
  name: string
  asset_url?: string | null
  config?: Record<string, unknown> | null
  creator_id?: string | null
  visibility?: string | null
  product?: { id: number, name?: string, slug?: string | null, price?: string | number | null, status?: string | null, mageos_sku?: string | null, source?: string | null } | null
  date_created?: string | null
}

const FIELDS = ['id', 'status', 'kind', 'name', 'asset_url', 'config', 'creator_id', 'visibility', 'date_created',
  'product.id', 'product.name', 'product.slug', 'product.price', 'product.status', 'product.mageos_sku', 'product.source']

const isAdmin = (viewer: Viewer) => (viewer?.role || '').split(',').map((r) => r.trim()).includes('admin')
const isFree = (row: EffectRow) => !(Number(row.product?.price) > 0)

/** The Directus product ids the member has paid for. */
export async function ownedProductIds(userId: string): Promise<Set<string>> {
  const orders = (await ordersFor({ id: userId } as never)).filter((order: any) => PAID.has(String(order.payment_status)))
  const refs = purchasedRefs(orders as never)
  const ids = new Set(refs.filter((ref) => /^\d+$/.test(ref)))
  const skus = refs.filter((ref) => ref.startsWith('magento:')).map((ref) => ref.slice('magento:'.length))
  if (skus.length) {
    const mirrored = await directus().request(readItems('products' as never, {
      filter: { mageos_sku: { _in: skus } }, fields: ['id'], limit: skus.length,
    } as never)).catch(() => []) as Array<{ id: number }>
    for (const row of mirrored) ids.add(String(row.id))
  }
  return ids
}

/** May this member use (and load the image of) this effect? */
export function canUse(row: EffectRow, viewer: Viewer, owned: Set<string>): boolean {
  if (viewer && (row.creator_id === viewer.id || isAdmin(viewer))) return true
  if (row.status !== 'published') return false
  if (row.product) {
    if (row.product.status !== 'published') return false
    return isFree(row) || owned.has(String(row.product.id))
  }
  return row.visibility === 'community'
}

/** What the editor gets: no Pixanomy link, the image through our own route. */
export function toClient(row: EffectRow, viewer: Viewer, owned: Set<string>) {
  const usable = canUse(row, viewer, owned)
  return {
    id: row.id,
    kind: row.kind,
    name: row.name,
    config: row.kind === 'filter' ? (row.config ?? {}) : null,
    asset_url: row.asset_url && row.kind !== 'filter' ? `/api/social/vibez/effects/${row.id}/asset` : null,
    visibility: row.visibility ?? 'private',
    mine: Boolean(viewer && row.creator_id === viewer.id),
    usable,
    product: row.product
      ? { id: row.product.id, name: row.product.name, price: row.product.price ?? null, key: row.product.source === 'magento' && row.product.mageos_sku ? `magento:${row.product.mageos_sku}` : String(row.product.id) }
      : null,
  }
}

export type Tab = 'mine' | 'owned' | 'community' | 'shop'

export async function listEffects(viewer: { id: string, role?: string | null }, tab: Tab, kind?: EffectKind) {
  const kindFilter = kind ? [{ kind: { _eq: kind } }] : []
  const published = [{ status: { _eq: 'published' } }]
  const filter = {
    mine: { _and: [{ creator_id: { _eq: viewer.id } }, ...kindFilter] },
    community: { _and: [{ visibility: { _eq: 'community' } }, { product: { _null: true } }, ...published, ...kindFilter] },
    owned: { _and: [{ product: { _nnull: true } }, { product: { status: { _eq: 'published' } } }, ...published, ...kindFilter] },
    shop: { _and: [{ product: { _nnull: true } }, { product: { status: { _eq: 'published' } } }, ...published, ...kindFilter] },
  }[tab]
  const rows = await directus().request(readItems('vibe_effects' as never, {
    filter, fields: FIELDS, sort: ['-date_created'], limit: tab === 'owned' ? 300 : 60,
  } as never)) as EffectRow[]
  const owned = tab === 'owned' || tab === 'shop' ? await ownedProductIds(viewer.id) : new Set<string>()
  const items = rows.map((row) => toClient(row, viewer, owned))
  return tab === 'owned' ? items.filter((item) => item.usable).slice(0, 60) : items
}

export async function readEffect(id: string): Promise<EffectRow> {
  if (!/^\d{1,12}$/.test(id)) throw createError({ statusCode: 404, statusMessage: 'Effect not found' })
  const rows = await directus().request(readItems('vibe_effects' as never, {
    filter: { id: { _eq: id } }, fields: FIELDS, limit: 1,
  } as never)) as EffectRow[]
  if (!rows[0]) throw createError({ statusCode: 404, statusMessage: 'Effect not found' })
  return rows[0]
}

export async function countMine(userId: string): Promise<number> {
  const rows = await directus().request(readItems('vibe_effects' as never, {
    filter: { creator_id: { _eq: userId } }, fields: ['id'], limit: MAX_PER_MEMBER + 1,
  } as never)) as unknown[]
  return rows.length
}

export async function createEffect(row: Omit<EffectRow, 'id' | 'product' | 'date_created'>): Promise<EffectRow> {
  const created = await directus().request(createItem('vibe_effects' as never, row as never, { fields: ['id'] } as never)) as { id: number }
  return readEffect(String(created.id))
}

export async function removeEffect(id: number): Promise<void> {
  await directus().request(deleteItem('vibe_effects' as never, id as never))
}

/** Only Pixanomy share links (and Directus assets) are fetched for an effect's image. */
export function assetOriginAllowed(url: string): boolean {
  try {
    const u = new URL(url)
    if (u.protocol !== 'https:') return false
    const allowed = [process.env.NUXT_PIXANOMY_URL || 'https://app.pixanomy.com', process.env.DIRECTUS_URL || '']
      .filter(Boolean).map((origin) => new URL(origin.replace(/^http:/, 'https:')).host)
    return allowed.includes(u.host)
  } catch {
    return false
  }
}
