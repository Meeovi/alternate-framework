import { createError, defineEventHandler, getRouterParam, setResponseHeader } from 'h3'
import { getAuthSession } from '#auth/server/utils/sessions'
import { VIDEO_TARGET, canTagVideo, listVibeProducts, readVideoProduct } from '../../../../utils/vibeProducts'

/**
 * GET /api/social/videos/:key/products — "Products in this video" on a Video
 * product's page (key: Directus id or `magento:<sku>`): { canEdit, items:
 * [{ id, start, end, product }] }, timed ones first. Anyone can read a
 * published video's; canEdit is true for its seller and admins.
 */
export default defineEventHandler(async (event) => {
  const video = await readVideoProduct(String(getRouterParam(event, 'id', { decode: true }) ?? ''))
  const user = (await getAuthSession(event).catch(() => null))?.user as { username?: string | null, role?: string | null } | undefined
  const canEdit = video.isVideo && canTagVideo(video, user)
  if (String(video.status ?? '').toLowerCase() !== 'published' && !canEdit) throw createError({ statusCode: 404, statusMessage: 'Video not found' })
  setResponseHeader(event, 'cache-control', 'private, no-store')
  return { canEdit, items: video.isVideo ? await listVibeProducts(video.id, VIDEO_TARGET) : [] }
})
