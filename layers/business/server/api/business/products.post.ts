import { randomBytes } from 'node:crypto'
import { createError, defineEventHandler, readMultipartFormData } from 'h3'
import { eq } from 'drizzle-orm'
import { createDirectus, createItem, createItems, readItem, readItems, rest, staticToken, uploadFiles } from '@directus/sdk'
import { commerce } from '@mframework/mageos-commerce-sdk'
import { db } from '#auth/server/utils/drizzle'
import { users } from '#auth/server/database/migrations/schema'
import { requireSeller } from '#auth/server/utils/sessions'
import { sniffMedia } from '#shared/server/utils/mediaSniff'

/**
 * POST /api/business/products (multipart) — a seller adds a product. It is
 * created in the commerce backend (Mage-OS, through Directus's
 * /commerce/sync/* routes) under the signed-in seller, never in Directus
 * directly; the store mirror then brings it into Directus. New seller
 * products wait for the store's approval.
 *
 * Fields: name, price, description?, qty?, allowFreeDownload ("true"),
 * departmentId, categoryId (one of that department's categories),
 * tags (JSON list, up to 5 in all), image (JPEG/PNG/GIF),
 * download (the file buyers get).
 * With price 0 and allowFreeDownload, anyone may download it without
 * checking out.
 *
 * Department, category and tags are the CMS's (Directus). The product's
 * Directus row is written straight away, as the store mirror will see it
 * (source 'magento', mageos_id = the store's uid), carrying those links;
 * the mirror adopts it once the store approves the product. Tags: what
 * the seller kept of the form's suggestions (the department's and
 * category's names) plus their own.
 */

const MAX_IMAGE_BYTES = 8 * 1024 * 1024
const MAX_TAGS = 5

/** A tag's slug: lowercase letters and digits, as hashtags are written. */
const tagSlug = (name: string) => name.toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu, '')
const MAX_DOWNLOAD_BYTES = 200 * 1024 * 1024

function imageType(b: Uint8Array): 'image/jpeg' | 'image/png' | 'image/gif' | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg'
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png'
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) return 'image/gif'
  return null
}

/** What a download really is, from its bytes: images, PDFs, ZIPs (EPUB too), audio and video. */
function downloadType(b: Uint8Array): string | null {
  const image = imageType(b)
  if (image) return image
  if (b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) return 'application/pdf'
  if (b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04) return 'application/zip'
  return sniffMedia(b)?.type ?? null
}

/** Plain text from the form, as the store's HTML description. */
function paragraphs(text: string): string {
  const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean).map((p) => `<p>${escape(p).replace(/\n/g, '<br>')}</p>`).join('')
}

export default defineEventHandler(async (event) => {
  const user = await requireSeller(event)
  const [member] = await db.select({ customerId: users.magentoCustomerId }).from(users).where(eq(users.id, String(user.id))).limit(1)
  const customerId = Number(member?.customerId)
  if (!Number.isInteger(customerId) || customerId <= 0) {
    throw createError({ statusCode: 409, statusMessage: 'Your account has no store account yet, so you can\'t add products.' })
  }

  const config = useRuntimeConfig() as Record<string, any>
  const directusUrl = String(config.public?.directus?.url || '').replace(/\/+$/, '')
  const token = String(config.directus?.token || '')
  if (!directusUrl || !token) throw createError({ statusCode: 503, statusMessage: 'The store is not configured.' })
  const directus = createDirectus(directusUrl).with(staticToken(token)).with(rest())

  const parts = await readMultipartFormData(event) ?? []
  const field = (name: string) => {
    const part = parts.find((p) => p.name === name && !p.filename)
    return part ? part.data.toString('utf8').trim() : ''
  }
  const file = (name: string) => parts.find((p) => p.name === name && p.filename && p.data.length)

  const name = field('name')
  if (!name || name.length > 255) throw createError({ statusCode: 400, statusMessage: 'The product needs a name of up to 255 characters.' })
  const price = Number(field('price') || '0')
  if (!Number.isFinite(price) || price < 0 || price > 1_000_000) throw createError({ statusCode: 400, statusMessage: 'The price must be between 0 and 1,000,000.' })
  const description = field('description')
  if (description.length > 20_000) throw createError({ statusCode: 400, statusMessage: 'The description is too long.' })
  const allowFreeDownload = field('allowFreeDownload') === 'true'

  const departmentId = Number(field('departmentId'))
  const categoryId = Number(field('categoryId'))
  if (!Number.isInteger(departmentId) || departmentId <= 0 || !Number.isInteger(categoryId) || categoryId <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Choose a department and a category.' })
  }
  const department = await directus.request(readItem('departments', departmentId, {
    fields: ['id', 'name', 'type', { categories: [{ categories_id: ['id', 'name', 'uid'] }] }] as any,
  })).catch(() => null) as { name?: string, type?: string, categories?: { categories_id?: { id: number, name?: string, uid?: string | null } | null }[] } | null
  const category = department?.type === 'department'
    ? department.categories?.map((c) => c.categories_id).find((c) => Number(c?.id) === categoryId)
    : undefined
  if (!department?.name || !category?.name) throw createError({ statusCode: 400, statusMessage: 'That category isn\'t in that department.' })

  let requestedTags: unknown = []
  try {
    requestedTags = JSON.parse(field('tags') || '[]')
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Tags must be a list.' })
  }
  if (!Array.isArray(requestedTags) || requestedTags.length > MAX_TAGS
    || requestedTags.some((t) => typeof t !== 'string' || !tagSlug(t) || t.trim().length > 30)) {
    throw createError({ statusCode: 400, statusMessage: `Add up to ${MAX_TAGS} tags of up to 30 letters or numbers each.` })
  }
  // Duplicates (by slug) dropped.
  const tagNames = new Map<string, string>()
  for (const name of requestedTags as string[]) {
    const clean = name.trim().replace(/\s+/g, ' ')
    if (!tagNames.has(tagSlug(clean))) tagNames.set(tagSlug(clean), clean)
  }
  // A store category (mirrored, uid = base64 of its id) is set in the store too.
  const storeCategoryId = category.uid ? Number(Buffer.from(category.uid, 'base64').toString('utf8')) : NaN

  const image = file('image')
  const imageMime = image ? imageType(image.data) : null
  if (image && (!imageMime || image.data.length > MAX_IMAGE_BYTES)) {
    throw createError({ statusCode: 400, statusMessage: 'The image must be a JPEG, PNG or GIF of up to 8 MB.' })
  }
  const download = file('download')
  const downloadMime = download ? downloadType(download.data) : null
  if (download && (!downloadMime || download.data.length > MAX_DOWNLOAD_BYTES)) {
    throw createError({ statusCode: 400, statusMessage: 'The download must be an image, PDF, ZIP, audio or video file of up to 200 MB.' })
  }
  if (allowFreeDownload && (!download || price > 0)) {
    throw createError({ statusCode: 400, statusMessage: 'A free download needs a price of 0 and a download file.' })
  }
  const qty = download ? 100000 : Math.max(0, Math.trunc(Number(field('qty') || '0')) || 0)

  const slug = name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'product'
  const sku = `${slug}-${randomBytes(3).toString('hex')}`

  let product: { product_id: number, sku: string }
  try {
    product = await directus.request(commerce.syncProduct({
      customerId, sku, name, price, description: paragraphs(description), shortDescription: '', qty, weight: null,
      categoryIds: Number.isInteger(storeCategoryId) && storeCategoryId > 0 ? [storeCategoryId] : [], enabled: true,
    }))
  } catch (error: any) {
    console.error('[business] seller product create failed', sku, error?.message)
    throw createError({ statusCode: 502, statusMessage: 'The store couldn\'t create the product. Please try again.' })
  }

  const problems: string[] = []
  if (image && imageMime) {
    await directus.request(commerce.syncImage({
      customerId, sku, base64Content: image.data.toString('base64'), mimeType: imageMime, fileName: image.filename || 'image', isMain: true,
    })).catch((error: any) => {
      console.error('[business] seller product image failed', sku, error?.message)
      problems.push('image')
    })
  }
  if (download && downloadMime) {
    try {
      const form = new FormData()
      form.append('title', `${name} (download)`)
      form.append('file', new Blob([download.data], { type: downloadMime }), download.filename || 'download')
      const uploaded = await directus.request(uploadFiles(form)) as { id: string }
      await directus.request(commerce.syncDownload({
        customerId, sku, title: name, url: `${directusUrl}/assets/${uploaded.id}`, shareable: allowFreeDownload && price === 0,
      }))
    } catch (error: any) {
      console.error('[business] seller product download failed', sku, error?.message)
      problems.push('download')
    }
  }

  // The CMS links, on the row the mirror will adopt.
  try {
    const slugs = [...tagNames.keys()]
    const existing = await directus.request(readItems('tags', { filter: { slug: { _in: slugs } }, fields: ['id', 'slug'], limit: -1 })) as { id: number, slug: string }[]
    const missing = slugs.filter((slug) => !existing.some((t) => t.slug === slug))
    const created = missing.length
      ? await directus.request(createItems('tags', missing.map((slug) => ({ name: tagNames.get(slug), slug, status: 'published' })))) as { id: number, slug: string }[]
      : []
    const tagIds = [...existing, ...created].map((t) => t.id)
    await directus.request(createItem('products', {
      source: 'magento',
      mageos_id: Buffer.from(String(product.product_id)).toString('base64'),
      mageos_sku: sku,
      name,
      price,
      // The mirror publishes it once the store has approved it.
      status: 'draft',
      seller_username: (user as { username?: string }).username ?? null,
      departments: [{ departments_id: departmentId }],
      categories: [{ categories_id: categoryId }],
      tags: tagIds.map((id) => ({ tags_id: id })),
    } as any))
  } catch (error: any) {
    console.error('[business] seller product CMS links failed', sku, error?.message)
    problems.push('department, category and tags')
  }

  return { sku, productId: product.product_id, pendingApproval: true, problems, tags: [...tagNames.values()] }
})
