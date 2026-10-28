import { randomBytes } from 'node:crypto'
import { createError, defineEventHandler, readMultipartFormData } from 'h3'
import { eq } from 'drizzle-orm'
import { createDirectus, rest, staticToken, uploadFiles } from '@directus/sdk'
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
 * image (JPEG/PNG/GIF), download (the file buyers get).
 * With price 0 and allowFreeDownload, anyone may download it without
 * checking out.
 */

const MAX_IMAGE_BYTES = 8 * 1024 * 1024
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
      customerId, sku, name, price, description: paragraphs(description), shortDescription: '', qty, weight: null, categoryIds: [], enabled: true,
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

  return { sku, productId: product.product_id, pendingApproval: true, problems }
})
