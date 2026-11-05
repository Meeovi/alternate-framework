// What the home page's product sliders show, worked out on the server
// (/api/commerce/home/<section>, cached), so the browser never has to put
// these queries together itself: through the /api/cms proxy, several of the
// old ones were refused (they asked for fields products don't have) and the
// sliders came up empty after moving between pages.
import { createDirectus, readItems, rest, staticToken } from '@directus/sdk'
import { useRuntimeConfig } from '#imports'
import { redis } from '#shared/server/utils/redis'

type Row = Record<string, any>

/** Redis hash: product key (`magento:<sku>` or a Directus id) → free downloads. */
export const PRODUCT_DOWNLOADS_KEY = 'meeovi:product-downloads'

export const PRODUCT_FIELDS = ['*', 'image.*', 'brands.brands_id.*']
const LIMIT = 12
const PUBLISHED = { status: { _eq: 'published' } }
const PUBLIC_CONTENT = [
  { status: { _in: ['published', 'Published', 'public', 'Public'] } },
  { _or: [{ visibility_scope: { _null: true } }, { visibility_scope: { _eq: 'public' } }] },
]

const list = (value: string | undefined, fallback: string) =>
  String(value ?? fallback).split(',').map((s) => s.trim()).filter(Boolean)

/** Whose products and content are Exclusives (names as sellers, member ids, Directus users). */
export const EXCLUSIVES = {
  sellers: list(process.env.EXCLUSIVE_SELLERS, 'Sebastian Hilton,Meeovi'),
  // Sebastian Hilton's Meeovi account.
  members: list(process.env.EXCLUSIVE_MEMBER_IDS, '01a18210-3346-72f9-9fad-5e345d944f0b'),
  // Content Meeovi uploads itself, in Directus as the Meeovi Administrator
  // (not the app server, which writes the automatic news posts).
  directusUsers: list(process.env.EXCLUSIVE_DIRECTUS_USERS, '39f4a8eb-aeda-4997-aeb8-da3ed731de1d'),
  department: 'exclusives',
}

const directus = () => createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

const read = (collection: string, query: Row): Promise<Row[]> =>
  directus().request(readItems(collection as any, query as any)).catch((error) => {
    console.error(`[home-sections] ${collection}:`, (error as Error)?.message || error)
    return []
  }) as Promise<Row[]>

/** Published products for product keys (`magento:<sku>` or a Directus id), in the keys' order. */
export async function productsByKeys(keys: string[]): Promise<Row[]> {
  const ids = keys.filter((k) => /^\d{1,12}$/.test(k))
  const skus = keys.filter((k) => k.startsWith('magento:')).map((k) => k.slice('magento:'.length))
  if (!ids.length && !skus.length) return []
  const rows = await read('products', {
    fields: PRODUCT_FIELDS,
    filter: { _and: [PUBLISHED, { _or: [...(ids.length ? [{ id: { _in: ids } }] : []), ...(skus.length ? [{ mageos_sku: { _in: skus } }] : [])] }] },
    limit: keys.length,
  })
  const byKey = new Map<string, Row>()
  for (const row of rows) {
    byKey.set(String(row.id), row)
    if (row.mageos_sku) byKey.set(`magento:${row.mageos_sku}`, row)
  }
  const seen = new Set<string>()
  return keys.map((k) => byKey.get(k)).filter((row): row is Row => !!row && !seen.has(String(row.id)) && !!seen.add(String(row.id)))
}

/** Product key → count, added up. */
const tally = () => {
  const counts = new Map<string, number>()
  return {
    counts,
    add: (key: unknown, n: unknown) => {
      const k = String(key ?? '').trim()
      const v = Number(n) || 0
      if (k && v > 0) counts.set(k, (counts.get(k) || 0) + v)
    },
  }
}

const top = (counts: Map<string, number>, n = LIMIT) =>
  [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([key]) => key)

/** Best Sellers: most downloaded plus most purchased (quantities in paid orders). */
export async function bestSellers(): Promise<Row[]> {
  const { counts, add } = tally()
  const downloads = await redis.hgetall(PRODUCT_DOWNLOADS_KEY).catch(() => ({} as Record<string, string>))
  for (const [key, n] of Object.entries(downloads || {})) add(key, n)
  const orders = await read('orders', {
    fields: ['line_items_snapshot'],
    filter: { status: { _nin: ['draft', 'canceled', 'cancelled', 'closed', 'pending_payment'] } },
    limit: -1,
  })
  for (const order of orders) {
    for (const line of Array.isArray(order.line_items_snapshot) ? order.line_items_snapshot : []) add(line?.product_id, line?.quantity ?? 1)
  }
  return productsByKeys(top(counts))
}

export async function latestProducts(): Promise<Row[]> {
  return read('products', { fields: PRODUCT_FIELDS, filter: PUBLISHED, sort: ['-created_at', '-id'], limit: LIMIT })
}

/** Deals: under $20, paid ones first (most products are free). */
export async function deals(): Promise<Row[]> {
  return read('products', { fields: PRODUCT_FIELDS, filter: { _and: [PUBLISHED, { price: { _lt: 20 } }] }, sort: ['-price', '-created_at'], limit: LIMIT })
}

/** Product discussions (Rocket.Chat rooms `<prefix>-product-<id>`) by message count. */
async function commentCounts(): Promise<Map<string, number>> {
  const runtime = useRuntimeConfig() as Record<string, any>
  const own = runtime.meeoviDiscussions ?? {}
  const url = String(runtime.public?.meeoviDiscussions?.url || '').trim().replace(/\/+$/, '')
  const userId = String(own.admin?.userId || '').trim()
  const token = String(own.admin?.token || '').trim()
  const prefix = `${own.roomPrefix || 'discussion'}-product-`
  const counts = new Map<string, number>()
  if (!url || !userId || !token) return counts
  // rooms.adminRooms filters by name (channels.list ignores its query).
  const res = await $fetch<{ rooms?: { name?: string, msgs?: number }[] }>(`${url}/api/v1/rooms.adminRooms`, {
    query: { filter: prefix, 'types[]': 'c', count: 200 },
    headers: { 'X-User-Id': userId, 'X-Auth-Token': token },
    timeout: 10000,
  }).catch((error) => {
    console.error('[home-sections] discussions:', (error as Error)?.message || error)
    return { rooms: [] }
  })
  for (const room of res.rooms ?? []) {
    if (room.name?.startsWith(prefix) && room.msgs) counts.set(room.name.slice(prefix.length), room.msgs)
  }
  return counts
}

/** Featured: highest rated (average stars, then number of ratings), then most commented. */
export async function featured(): Promise<Row[]> {
  const [ratingRows, comments] = await Promise.all([
    read('content_ratings', {
      aggregate: { avg: ['rating'], count: ['id'] },
      groupBy: ['target_id'],
      filter: { target_type: { _eq: 'product' } },
      limit: -1,
    }),
    commentCounts(),
  ])
  const score = new Map<string, { avg: number, ratings: number, comments: number }>()
  const entry = (key: string) => score.get(key) ?? score.set(key, { avg: 0, ratings: 0, comments: 0 }).get(key)!
  for (const row of ratingRows) {
    const e = entry(String(row.target_id))
    e.avg = Number(row.avg?.rating) || 0
    e.ratings = Number(row.count?.id) || 0
  }
  // Discussion rooms are named by the id the product page had: a Directus
  // id, or the product's store id/SKU.
  for (const [id, n] of comments) entry(/^\d+$/.test(id) ? id : `magento:${id}`).comments += n
  const ranked = [...score.entries()]
    .sort(([, a], [, b]) => (b.avg - a.avg) || (b.ratings - a.ratings) || (b.comments - a.comments))
    .map(([key]) => key)
  return productsByKeys(ranked.slice(0, LIMIT * 2)).then((rows) => rows.slice(0, LIMIT))
}

/** Exclusives: products and content by Sebastian Hilton and Meeovi. */
export async function exclusives(): Promise<{ products: Row[], posts: Row[], shorts: Row[] }> {
  const { sellers, members, directusUsers, department } = EXCLUSIVES
  const byThem = [
    ...(members.length ? [{ creator_id: { _in: members } }] : []),
    ...(directusUsers.length ? [{ user_created: { _in: directusUsers } }] : []),
  ]
  const [products, posts, shorts] = await Promise.all([
    read('products', {
      fields: PRODUCT_FIELDS,
      filter: { _and: [PUBLISHED, { _or: [{ seller_name: { _in: sellers } }, { departments: { departments_id: { slug: { _eq: department } } } }] }] },
      sort: ['-created_at', '-id'],
      limit: LIMIT,
    }),
    byThem.length ? read('posts', { fields: ['*'], filter: { _and: [...PUBLIC_CONTENT, { _or: byThem }] }, sort: ['-date_created'], limit: LIMIT }) : [],
    byThem.length ? read('shorts', { fields: ['*'], filter: { _and: [{ status: { _in: ['published', 'Published', 'public', 'Public'] } }, { _or: byThem }] }, sort: ['-date_created'], limit: LIMIT }) : [],
  ])
  return { products, posts, shorts }
}

/** Pixanomy: the department's newest products (its notes and spaces come from /api/social/topic). */
export async function pixanomy(): Promise<{ departmentId: number | null, products: Row[] }> {
  const [dept] = await read('departments', { fields: ['id'], filter: { slug: { _eq: 'pixanomy' } }, limit: 1 })
  const products = await read('products', {
    fields: PRODUCT_FIELDS,
    filter: { _and: [PUBLISHED, { departments: { departments_id: { slug: { _eq: 'pixanomy' } } } }] },
    sort: ['-created_at', '-id'],
    limit: LIMIT,
  })
  return { departmentId: dept?.id ?? null, products }
}
