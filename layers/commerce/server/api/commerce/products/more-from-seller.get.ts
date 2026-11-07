import { createError, defineEventHandler, getQuery, setResponseHeader } from 'h3'
import { createDirectus, readItems, rest, staticToken } from '@directus/sdk'
import { and, eq, isNull, or } from 'drizzle-orm'
import { db } from '#auth/server/utils/drizzle'
import { users } from '#auth/server/database/migrations/schema'
import { productSeller } from '../../../utils/backendSellers'

/**
 * GET /api/commerce/products/more-from-seller?key=<product key>&kind=videos|products
 * — discovery under a product page's tabs:
 *   kind=videos   "Other videos by this creator": the seller's other Video
 *                 products, and the vibez they posted.
 *   kind=products "Other products by this seller".
 * Key: a Directus id or `<backend>:<sku>`. The seller is the product's
 * `seller_username` (store products' Directus mirror), else the store's
 * seller lookup. Public: published items only, and only the seller's
 * display name and username. { seller, products, vibez }
 */
const LIMIT = 12
// Directus status values in use (shorts are 'Published').
const PUBLISHED = ['published', 'Published']
const PRODUCT_CARD_FIELDS = ['id', 'name', 'slug', 'sku', 'mageos_sku', 'source', 'price', 'currency_code', 'image', 'image_url', 'seller_name', 'seller_username', 'download_url', 'allow_free_download']
const SHORT_FIELDS = ['id', 'name', 'type', 'description', 'video_url', 'video', 'thumbnail_url', 'thumbnail', 'creator_id', 'date_created']

const directus = () => createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

type Row = Record<string, any>

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const key = String(query.key ?? '').trim()
  const kind = query.kind === 'videos' ? 'videos' : 'products'
  const store = /^([a-z][a-z0-9-]{1,31}):([\w.\-]{1,64})$/.exec(key)
  if (!key || (!store && !/^\d{1,18}$/.test(key))) throw createError({ statusCode: 400, statusMessage: 'Missing product key' })
  setResponseHeader(event, 'cache-control', 'public, max-age=300')

  const client = directus()
  // This product's Directus row (a store product's mirror), for its seller and to leave it out.
  const [row] = await client.request(readItems('products' as never, {
    filter: store ? { mageos_sku: { _eq: store[2] } } : { id: { _eq: key } },
    fields: ['id', 'seller_username', 'seller_name'], limit: 1,
  } as never)).catch(() => []) as Row[]

  let username = String(row?.seller_username ?? '').trim().toLowerCase() || null
  let name = String(row?.seller_name ?? '').trim() || null
  if (!username && store) {
    const seller = await productSeller(key).catch(() => null)
    username = seller?.username?.toLowerCase() ?? null
    name = name || seller?.name || null
  }
  if (!username) return { seller: null, products: [], vibez: [] }

  const filters: Row[] = [{ seller_username: { _eq: username } }, { status: { _in: PUBLISHED } }]
  if (row?.id) filters.push({ id: { _neq: row.id } })
  if (store) filters.push({ _or: [{ mageos_sku: { _null: true } }, { mageos_sku: { _neq: store[2] } }] })
  if (kind === 'videos') filters.push({ product_types: { product_types_id: { name: { _eq: 'Video' } } } })

  const productsRead = client.request(readItems('products' as never, {
    filter: { _and: filters }, fields: PRODUCT_CARD_FIELDS, sort: ['-created_at'], limit: LIMIT,
  } as never)).catch((error) => {
    console.error('[commerce] more-from-seller products', (error as Error)?.message)
    return []
  }) as Promise<Row[]>

  // The creator's vibez: shorts.creator_id is the member's user id.
  const vibezRead = kind === 'videos'
    ? (async () => {
        const [member] = await db.select({ id: users.id }).from(users)
          .where(and(eq(users.username, username), isNull(users.deletedAt), or(isNull(users.authBanned), eq(users.authBanned, false))))
          .limit(1)
        if (!member) return []
        return await client.request(readItems('shorts' as never, {
          filter: { _and: [{ creator_id: { _eq: member.id } }, { status: { _in: PUBLISHED } }] },
          fields: SHORT_FIELDS, sort: ['-date_created'], limit: LIMIT,
        } as never)) as Row[]
      })().catch((error) => {
        console.error('[commerce] more-from-seller vibez', (error as Error)?.message)
        return []
      })
    : Promise.resolve([] as Row[])

  const [products, vibez] = await Promise.all([productsRead, vibezRead])
  return { seller: { username, name: name || username }, products, vibez }
})
