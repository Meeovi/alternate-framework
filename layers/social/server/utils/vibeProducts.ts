import { createError } from 'h3'
import { createDirectus, createItems, deleteItems, readItems, rest, staticToken } from '@directus/sdk'

/**
 * Shoppable vibez: the products tagged on a vibe (Directus `shorts_products`,
 * with optional `start_seconds` / `end_seconds` for a card that pops up over
 * the player at that moment, and `tagged_by`). The vibe's creator (or an
 * admin) tags any product on Meeovi; store products are tagged through their
 * Directus mirror row (`mageos_sku`).
 */

const directus = () => createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

/** What the vibe's product cards and Add to cart need. */
export const VIBE_PRODUCT_FIELDS = [
  'id', 'name', 'slug', 'sku', 'mageos_sku', 'source', 'status', 'price', 'currency_code',
  'image', 'image_url', 'seller_name', 'seller_username', 'download_url', 'allow_free_download',
]

export const MAX_TAGS = 20

export type VibeTagInput = { product: string | number, start?: number | null, end?: number | null }

/**
 * Where a video's tags are kept: a vibe's in `shorts_products` (by
 * `shorts_id`), a Video product's in `products_tagged` (by `video_id`,
 * "Products in this video" on the product page). Same columns otherwise.
 */
export type TagTarget = { collection: 'shorts_products' | 'products_tagged', field: 'shorts_id' | 'video_id' }
export const VIBE_TARGET: TagTarget = { collection: 'shorts_products', field: 'shorts_id' }
export const VIDEO_TARGET: TagTarget = { collection: 'products_tagged', field: 'video_id' }

export type VibeProduct = {
  id: number
  start: number | null
  end: number | null
  product: Record<string, unknown>
}

type Short = { id: number, creator_id?: string | null, status?: string | null }

export async function readShort(id: string): Promise<Short> {
  if (!/^\d{1,12}$/.test(id)) throw createError({ statusCode: 404, statusMessage: 'Vibe not found' })
  const rows = await directus().request(readItems('shorts' as never, {
    filter: { id: { _eq: id } }, fields: ['id', 'creator_id', 'status'], limit: 1,
  } as never)) as Short[]
  if (!rows[0]) throw createError({ statusCode: 404, statusMessage: 'Vibe not found' })
  return rows[0]
}

/** A time in seconds, or null; at most 6 hours. */
export function seconds(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0 || n > 6 * 3600) throw createError({ statusCode: 400, statusMessage: 'Times must be between 0 and 6 hours' })
  return Math.round(n * 10) / 10
}

/** Checks and normalises the tags: real, published products, no repeats, end after start. */
export async function resolveTags(tags: VibeTagInput[]): Promise<Array<{ productId: number, start: number | null, end: number | null }>> {
  if (tags.length > MAX_TAGS) throw createError({ statusCode: 400, statusMessage: `At most ${MAX_TAGS} products per vibe` })
  const ids: string[] = []
  const skus: string[] = []
  for (const tag of tags) {
    const key = String(tag.product)
    const store = /^magento:([\w.\-]{1,64})$/.exec(key)
    if (store) skus.push(store[1]!)
    else if (/^\d{1,18}$/.test(key)) ids.push(key)
    else throw createError({ statusCode: 400, statusMessage: 'Unknown product' })
  }
  const or = [
    ...(ids.length ? [{ id: { _in: ids } }] : []),
    ...(skus.length ? [{ mageos_sku: { _in: skus } }] : []),
  ]
  const found = or.length
    ? await directus().request(readItems('products' as never, {
      filter: { _and: [{ _or: or }, { status: { _eq: 'published' } }] },
      fields: ['id', 'mageos_sku'], limit: MAX_TAGS * 2,
    } as never)) as Array<{ id: number | string, mageos_sku?: string | null }>
    : []
  const byKey = new Map<string, number>()
  for (const row of found) {
    byKey.set(String(row.id), Number(row.id))
    if (row.mageos_sku) byKey.set(`magento:${row.mageos_sku}`, Number(row.id))
  }
  const out: Array<{ productId: number, start: number | null, end: number | null }> = []
  for (const tag of tags) {
    const productId = byKey.get(String(tag.product))
    if (productId === undefined) throw createError({ statusCode: 400, statusMessage: 'One of those products is not for sale' })
    if (out.some((t) => t.productId === productId)) continue
    const start = seconds(tag.start)
    let end = seconds(tag.end)
    if (start === null) end = null
    if (start !== null && end !== null && end <= start) throw createError({ statusCode: 400, statusMessage: 'A product card must end after it starts' })
    out.push({ productId, start, end })
  }
  return out
}

/** The vibe's (or video product's) tagged products that are still for sale, by start time (untimed last). */
export async function listVibeProducts(shortId: number | string, target: TagTarget = VIBE_TARGET): Promise<VibeProduct[]> {
  const rows = await directus().request(readItems(target.collection as never, {
    filter: { [target.field]: { _eq: shortId } },
    fields: ['id', 'start_seconds', 'end_seconds', ...VIBE_PRODUCT_FIELDS.map((f) => `products_id.${f}`)],
    limit: MAX_TAGS * 2,
  } as never)) as Array<{ id: number, start_seconds: number | null, end_seconds: number | null, products_id: Record<string, unknown> | null }>
  return rows
    .filter((row) => row.products_id && row.products_id.status === 'published')
    .map((row) => ({ id: row.id, start: row.start_seconds ?? null, end: row.end_seconds ?? null, product: row.products_id! }))
    .sort((a, b) => (a.start ?? Infinity) - (b.start ?? Infinity) || a.id - b.id)
}

/** Replaces the vibe's (or video product's) tags. */
export async function setVibeProducts(shortId: number, userId: string, tags: Awaited<ReturnType<typeof resolveTags>>, target: TagTarget = VIBE_TARGET): Promise<void> {
  const client = directus()
  const existing = await client.request(readItems(target.collection as never, {
    filter: { [target.field]: { _eq: shortId } }, fields: ['id', target.field], limit: -1,
  } as never)) as Array<Record<string, number>>
  // Only this video's rows (checked again here, never trusted from the query).
  const old = existing.filter((row) => Number(row[target.field]) === shortId).map((row) => row.id!)
  if (tags.length) {
    await client.request(createItems(target.collection as never, tags.map((t) => ({
      [target.field]: shortId, products_id: t.productId, start_seconds: t.start, end_seconds: t.end, tagged_by: userId,
    })) as never))
  }
  if (old.length) await client.request(deleteItems(target.collection as never, old as never))
}

type VideoProduct = { id: number, status?: string | null, seller_username?: string | null, isVideo: boolean }

/**
 * A product by its page key (Directus id, or `magento:<sku>` for a store
 * product's Directus mirror), with what tagging needs: its seller and
 * whether it's a Video product.
 */
export async function readVideoProduct(key: string): Promise<VideoProduct> {
  const store = /^magento:([\w.\-]{1,64})$/.exec(key)
  if (!store && !/^\d{1,18}$/.test(key)) throw createError({ statusCode: 404, statusMessage: 'Video not found' })
  const rows = await directus().request(readItems('products' as never, {
    filter: store ? { mageos_sku: { _eq: store[1] } } : { id: { _eq: key } },
    fields: ['id', 'status', 'seller_username', 'product_types.product_types_id.name'], limit: 1,
  } as never)) as Array<{ id: number | string, status?: string | null, seller_username?: string | null, product_types?: Array<{ product_types_id?: { name?: string } | null }> }>
  const row = rows[0]
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Video not found' })
  return {
    id: Number(row.id),
    status: row.status,
    seller_username: row.seller_username,
    isVideo: (row.product_types ?? []).some((pt) => pt?.product_types_id?.name === 'Video'),
  }
}

/** The video product's seller (by Meeovi username) or an admin. */
export function canTagVideo(video: VideoProduct, user: { username?: string | null, role?: string | null } | null | undefined): boolean {
  if (!user) return false
  if ((user.role || '').split(',').map((r) => r.trim()).includes('admin')) return true
  const seller = String(video.seller_username ?? '').trim().toLowerCase()
  return Boolean(seller && seller === String(user.username ?? '').trim().toLowerCase())
}

/** Tagged product counts for feed cards. */
export async function countVibeProducts(shortIds: number[]): Promise<Record<string, number>> {
  if (!shortIds.length) return {}
  const rows = await directus().request(readItems('shorts_products' as never, {
    filter: { _and: [{ shorts_id: { _in: shortIds } }, { products_id: { status: { _eq: 'published' } } }] },
    fields: ['shorts_id'], limit: shortIds.length * MAX_TAGS,
  } as never)) as Array<{ shorts_id: number }>
  const counts: Record<string, number> = {}
  for (const row of rows) counts[String(row.shorts_id)] = (counts[String(row.shorts_id)] ?? 0) + 1
  return counts
}
