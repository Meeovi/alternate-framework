import { randomBytes } from 'node:crypto'
import { createError, type H3Event } from 'h3'
import { createDirectus, createItem, readItems, rest, staticToken } from '@directus/sdk'
import { commerce } from '@mframework/mageos-commerce-sdk'
import { eq } from 'drizzle-orm'
import { useRuntimeConfig } from '#imports'
import { db } from '#auth/server/utils/drizzle'
import { users } from '#auth/server/database/migrations/schema'
import { safeFetchBytes } from '../safe-fetch'
import { PROVIDER_LABELS, type CheckedVideo } from './providers'
import { listFromEnv, type SafetyConfig } from './safety'

/**
 * A linked video is a product like any uploaded video: a free (price 0)
 * product in the commerce backend (Mage-OS), created under the member as
 * seller in the store category behind Theater → Videos, through the same
 * Directus /commerce/sync routes as the seller product form
 * (layers/business server/api/business/products.post.ts). The store
 * approves it; the mirror then publishes its Directus row, which carries the
 * video: video_link_url, video_link_embed_url, video_link_provider and
 * video_link_id (provider:id — a video is only added once). The product page
 * plays it with the platform's player.
 */

type Config = {
  departmentSlug: string
  categorySlug: string
  dailyLimit: number
  youtubeApiKey: string
  safety: SafetyConfig
}

const unquote = (s: unknown) => String(s ?? '').trim().replace(/^(['"])(.*)\1$/, '$2')

export function videoBookmarksConfig(event?: H3Event): Config {
  const own = (useRuntimeConfig(event) as Record<string, any>).meeoviVideoBookmarks ?? {}
  return {
    departmentSlug: own.departmentSlug || 'theater',
    categorySlug: own.categorySlug || 'videos',
    dailyLimit: Number(own.dailyLimit) || 30,
    youtubeApiKey: unquote(own.youtubeApiKey || process.env.YOUTUBE_API_KEY),
    safety: {
      terms: [...(own.blockedTerms ?? []), ...listFromEnv(process.env.VIDEO_BOOKMARKS_BLOCKED_TERMS)],
      hosts: [...(own.blockedHosts ?? []), ...listFromEnv(process.env.VIDEO_BOOKMARKS_BLOCKED_HOSTS)],
    },
  }
}

/** The CMS client with the app's server token (as the seller product form uses). */
export function cms(event?: H3Event) {
  const config = useRuntimeConfig(event) as Record<string, any>
  const url = unquote(config.public?.directus?.url || process.env.DIRECTUS_URL).replace(/\/+$/, '')
  const token = unquote(config.directus?.token || process.env.NUXTUS_DIRECTUS_STATIC_TOKEN)
  if (!url || !token) throw createError({ statusCode: 503, statusMessage: 'The store is not configured.' })
  return createDirectus(url).with(staticToken(token)).with(rest())
}

/** The seller's store account (users.magento_customer_id). */
export async function storeCustomerId(userId: string): Promise<number> {
  const [member] = await db.select({ customerId: users.magentoCustomerId }).from(users).where(eq(users.id, userId)).limit(1)
  const id = Number(member?.customerId)
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 409, statusMessage: 'Your account has no store account yet, so you can\'t add videos.' })
  return id
}

type Target = { departmentId: number, categoryId: number, storeCategoryId: number, productTypeId: number | null }

/** Theater → Videos: the Directus ids, the store category (from the mirrored uid) and the Video product type. */
export async function videoTarget(event: H3Event): Promise<Target> {
  const { departmentSlug, categorySlug } = videoBookmarksConfig(event)
  const client = cms(event)
  const [department] = await client.request(readItems('departments' as never, {
    filter: { slug: { _eq: departmentSlug } },
    fields: ['id', { categories: [{ categories_id: ['id', 'slug', 'uid'] }] }],
    limit: 1,
  } as never)) as Array<{ id: number, categories?: Array<{ categories_id?: { id: number, slug?: string | null, uid?: string | null } | null }> }>
  let category = department?.categories?.map((c) => c.categories_id).find((c) => c?.slug === categorySlug)
  if (!category) {
    // The store-owned category may only be linked to the department through the store's tree.
    const [byPath] = await client.request(readItems('categories' as never, {
      filter: { _and: [{ slug: { _eq: categorySlug } }, { mageos_path: { _eq: `${departmentSlug}/${categorySlug}` } }] },
      fields: ['id', 'slug', 'uid'], limit: 1,
    } as never)) as Array<{ id: number, slug?: string | null, uid?: string | null }>
    category = byPath
  }
  const storeCategoryId = category?.uid ? Number(Buffer.from(category.uid, 'base64').toString('utf8')) : NaN
  if (!department?.id || !category?.id || !Number.isInteger(storeCategoryId) || storeCategoryId <= 0) {
    throw createError({ statusCode: 503, statusMessage: 'The Videos category isn\'t set up in the store.' })
  }
  const [type] = await client.request(readItems('product_types' as never, { filter: { name: { _eq: 'Video' } }, fields: ['id'], limit: 1 } as never)) as Array<{ id: number }>
  return { departmentId: department.id, categoryId: category.id, storeCategoryId, productTypeId: type?.id ?? null }
}

/** The product page key of a video already on Meeovi (published or awaiting approval), else null. */
export async function existingVideoProduct(event: H3Event, linkId: string): Promise<string | null> {
  const [row] = await cms(event).request(readItems('products' as never, {
    filter: { _and: [{ video_link_id: { _eq: linkId } }, { status: { _in: ['published', 'draft'] } }] },
    fields: ['id', 'mageos_sku'], limit: 1,
  } as never)) as Array<{ id: number, mageos_sku?: string | null }>
  if (!row) return null
  return row.mageos_sku ? `magento:${row.mageos_sku}` : String(row.id)
}

/** Videos the seller linked in the last 24 hours. */
export async function addedToday(event: H3Event, username: string): Promise<number> {
  const since = new Date(Date.now() - 24 * 3600_000).toISOString()
  const rows = await cms(event).request(readItems('products' as never, {
    filter: { _and: [{ seller_username: { _eq: username } }, { video_link_id: { _nnull: true } }, { created_at: { _gte: since } }] },
    fields: ['id'], limit: 200,
  } as never)) as unknown[]
  return rows.length
}

/** A Directus SDK error's own message (its `errors` list), else the error's. */
const reason = (error: any) => error?.errors?.[0]?.message || error?.message || JSON.stringify(error?.errors ?? error?.response?.status ?? error)

/** Plain text as the store's HTML description. */
export function paragraphs(text: string): string {
  const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  return text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean).map((p) => `<p>${escape(p).replace(/\n/g, '<br>')}</p>`).join('')
}

function imageType(b: Uint8Array): 'image/jpeg' | 'image/png' | 'image/gif' | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg'
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png'
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) return 'image/gif'
  return null
}

export type CreatedVideo = { sku: string, key: string, productId: number, pendingApproval: true, problems: string[] }

/** Creates the store product, its image (the video's thumbnail) and its Directus mirror row. */
export async function createVideoProduct(
  event: H3Event,
  seller: { id: string, username: string, customerId: number },
  checked: CheckedVideo,
  input: { name: string, description: string },
  target: Target,
): Promise<CreatedVideo> {
  const { link, meta } = checked
  const client = cms(event)
  const name = input.name.slice(0, 255)
  const label = PROVIDER_LABELS[link.provider]
  const slug = name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'video'
  const sku = `${slug}-${randomBytes(3).toString('hex')}`
  const credit = meta.author ? `${label} · ${meta.author}` : label
  const description = paragraphs(`${input.description}\n\nWatch on ${credit}: ${link.url}`.trim())

  let product: { product_id: number, sku: string }
  try {
    product = await client.request(commerce.syncProduct({
      customerId: seller.customerId, sku, name, price: 0, description, shortDescription: '', qty: 100000, weight: null,
      categoryIds: [target.storeCategoryId], enabled: true,
    }))
  } catch (error: any) {
    console.error('[video-bookmarks] store product create failed', sku, reason(error))
    // The store makes the product's address from its title, and two products can't share one.
    if (/url key/i.test(reason(error))) throw createError({ statusCode: 409, statusMessage: 'The store already has a product with that title. Change the title a little and try again.', data: { code: 'title-taken' } })
    throw createError({ statusCode: 502, statusMessage: 'The store couldn\'t add the video. Please try again.' })
  }

  const problems: string[] = []
  if (meta.thumbnail) {
    try {
      const file = await safeFetchBytes(meta.thumbnail)
      const mime = file ? imageType(file.data) : null
      if (!file || !mime) throw new Error('thumbnail is not a JPEG, PNG or GIF')
      await client.request(commerce.syncImage({
        customerId: seller.customerId, sku, base64Content: file.data.toString('base64'), mimeType: mime, fileName: `${slug}.${mime.split('/')[1]}`, isMain: true,
      }))
    } catch (error: any) {
      console.error('[video-bookmarks] thumbnail failed', sku, reason(error))
      problems.push('image')
    }
  }

  try {
    await client.request(createItem('products' as never, {
      source: 'magento',
      mageos_id: Buffer.from(String(product.product_id)).toString('base64'),
      mageos_sku: sku,
      name,
      price: 0,
      // The mirror publishes it once the store has approved it.
      status: 'draft',
      seller_username: seller.username,
      created_at: new Date().toISOString(),
      image_url: meta.thumbnail ?? null,
      video_link_url: link.url,
      video_link_embed_url: link.embedUrl,
      video_link_provider: link.provider,
      video_link_id: `${link.provider}:${link.id}`.slice(0, 255),
      departments: [{ departments_id: target.departmentId }],
      categories: [{ categories_id: target.categoryId }],
      ...(target.productTypeId ? { product_types: [{ product_types_id: target.productTypeId }] } : {}),
    } as never, { fields: ['id'] } as never))
  } catch (error: any) {
    console.error('[video-bookmarks] CMS row failed', sku, reason(error))
    problems.push('video details')
  }
  return { sku, key: `magento:${sku}`, productId: product.product_id, pendingApproval: true, problems }
}
