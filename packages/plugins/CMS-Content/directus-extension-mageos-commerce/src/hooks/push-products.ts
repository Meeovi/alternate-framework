import { randomBytes } from 'node:crypto'
import { defineHook } from '@directus/extensions-sdk'
import type { ICommerceAdapter } from '../adapters/base.adapter'
import { createAdapter } from '../backend'
import { readConfig } from '../config'

/**
 * Products live in the commerce backend. A product an editor creates in
 * Directus is created in the store first, under its seller, and the
 * Directus row becomes that product's mirror row (source 'magento',
 * mageos_id/mageos_sku), so the next mirror run fills in the rest and no
 * duplicate appears. Mirror writes don't emit events, so they never come
 * through here; rows that already name a source are left alone.
 *
 * Fields the editor sets:
 *  - seller_username: the seller's Meeovi username (else MAGEOS_DEFAULT_SELLER_USERNAME)
 *  - image: becomes the store product's main image
 *  - file + allow_free_download: the download; free to anyone when the price is 0
 */

const MAX_IMAGE_BYTES = 8 * 1024 * 1024

/** An error Directus shows the editor as-is (it checks the name and status). */
function invalid(message: string): Error {
  return Object.assign(new Error(message), { name: 'DirectusError', code: 'INVALID_PAYLOAD', status: 400, extensions: { reason: message } })
}

function skuFor(name: string): string {
  const slug = name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'product'
  return `${slug}-${randomBytes(3).toString('hex')}`
}

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of stream) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string))
  return Buffer.concat(chunks)
}

export default defineHook(({ filter }, { env, services, database, getSchema, logger }) => {
  const config = readConfig(env)
  let adapter: ICommerceAdapter | null = null
  try {
    adapter = createAdapter(config)
  } catch (error) {
    logger.warn(`[mageos-commerce] product push disabled: ${(error as Error).message}`)
  }
  const publicUrl = String(env.PUBLIC_URL || '').replace(/\/+$/, '')

  /** The store image for a Directus file: resized when Directus can, else as uploaded. */
  async function imageOf(fileId: string): Promise<{ base64: string, mimeType: 'image/jpeg' | 'image/png' | 'image/gif', name: string } | null> {
    const assets = new services.AssetsService({ schema: await getSchema(), knex: database })
    const resized = { transformationParams: { width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true, format: 'jpg', quality: 82 } } as const
    const attempts: (typeof resized | Record<string, never>)[] = [resized, {}]
    for (const transformation of attempts) {
      try {
        const asset = await assets.getAsset(fileId, transformation as Parameters<typeof assets.getAsset>[1])
        const bytes = await streamToBuffer(asset.stream)
        const type = Object.keys(transformation).length ? 'image/jpeg' : String(asset.file?.type || '')
        if (bytes.length && bytes.length <= MAX_IMAGE_BYTES && ['image/jpeg', 'image/png', 'image/gif'].includes(type)) {
          return { base64: bytes.toString('base64'), mimeType: type as 'image/jpeg', name: String(asset.file?.filename_download || 'image') }
        }
      } catch (error) {
        // Directus won't resize past ASSETS_TRANSFORM_IMAGE_MAX_DIMENSION; try the original.
        logger.debug(`[mageos-commerce] image ${fileId}: ${(error as Error).message}`)
      }
    }
    return null
  }

  filter('products.items.create', async (input) => {
    const payload = input as Record<string, any>
    if (payload.source) return payload
    const sync = adapter?.catalogSync
    if (!sync) throw invalid('Products are created in the store, and the store connection is not configured.')

    const name = String(payload.name ?? '').trim()
    if (!name) throw invalid('A product needs a name.')
    const price = Number(payload.price ?? 0)
    if (!Number.isFinite(price) || price < 0) throw invalid('The price must be 0 or more.')

    const username = String(payload.seller_username || env.MAGEOS_DEFAULT_SELLER_USERNAME || '').trim().replace(/^@/, '')
    if (!username) throw invalid('Choose the seller (Seller username): products are created in the store under a seller.')
    const seller = await database('users').select('magento_customer_id').where({ username }).whereNull('deleted_at').first()
    const customerId = Number(seller?.magento_customer_id)
    if (!Number.isInteger(customerId) || customerId <= 0) throw invalid(`@${username} has no store account, so they can't sell yet.`)

    const fileId = typeof payload.file === 'string' ? payload.file : payload.file?.id
    const imageId = typeof payload.image === 'string' ? payload.image : payload.image?.id
    const sku = String(payload.mageos_sku || skuFor(name))

    let product: { product_id: number, sku: string }
    try {
      product = await sync.upsertProduct({
        customerId,
        sku,
        name,
        price,
        description: String(payload.content ?? ''),
        shortDescription: String(payload.short_description ?? ''),
        // A download never runs out; physical stock is the editor's number.
        qty: Number(payload.stock ?? (fileId ? 100000 : 0)),
        weight: null,
        categoryIds: [],
        enabled: payload.status !== 'draft',
      })
    } catch (error) {
      throw invalid(`The store refused the product: ${(error as Error).message}`)
    }

    // The product exists from here on; a failed image or download is
    // reported but the row is still saved so the editor can fix it.
    if (imageId) {
      const image = await imageOf(imageId)
      if (image) {
        await sync.addImage({ customerId, sku, base64Content: image.base64, mimeType: image.mimeType, fileName: image.name, isMain: true })
          .catch((error) => logger.warn(`[mageos-commerce] ${sku}: image not added: ${(error as Error).message}`))
      }
    }
    if (fileId && publicUrl) {
      await sync.setDownload({ customerId, sku, title: name, url: `${publicUrl}/assets/${fileId}`, shareable: payload.allow_free_download === true && price === 0 })
        .catch((error) => logger.warn(`[mageos-commerce] ${sku}: download not added: ${(error as Error).message}`))
    }

    logger.info(`[mageos-commerce] created store product ${sku} for seller @${username}`)
    return {
      ...payload,
      source: 'magento',
      mageos_sku: sku,
      // The store's GraphQL uid, which the mirror matches rows on.
      mageos_id: Buffer.from(String(product.product_id)).toString('base64'),
    }
  })
})
