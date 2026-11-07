import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import { z } from 'zod'
import { requireAuth } from '#auth/server/utils/sessions'
import { MAX_TAGS, VIDEO_TARGET, canTagVideo, listVibeProducts, readVideoProduct, resolveTags, setVibeProducts } from '../../../../utils/vibeProducts'

/**
 * PUT /api/social/videos/:key/products — a Video product's seller (or an
 * admin) sets the products shown in it, replacing the old list.
 * Body: { tags: [{ product: <Directus id | 'magento:<sku>'>, start?, end? }] }
 * (seconds; with a start the product card pops up over the player then).
 */
const Body = z.object({
  tags: z.array(z.object({
    product: z.union([z.string().max(80), z.number().int().nonnegative()]),
    start: z.number().nullable().optional(),
    end: z.number().nullable().optional(),
  })).max(MAX_TAGS),
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event) as { id: string, username?: string | null, role?: string | null }
  const video = await readVideoProduct(String(getRouterParam(event, 'id', { decode: true }) ?? ''))
  if (!video.isVideo) throw createError({ statusCode: 400, statusMessage: 'Only video products can have products tagged in them' })
  if (!canTagVideo(video, user)) throw createError({ statusCode: 403, statusMessage: 'Only the video\'s seller can tag products in it' })
  const parsed = Body.safeParse(await readBody(event).catch(() => null))
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Invalid products' })
  // A video can't be tagged in itself.
  const tags = (await resolveTags(parsed.data.tags)).filter((tag) => tag.productId !== video.id)
  await setVibeProducts(video.id, user.id, tags, VIDEO_TARGET)
  return { canEdit: true, items: await listVibeProducts(video.id, VIDEO_TARGET) }
})
