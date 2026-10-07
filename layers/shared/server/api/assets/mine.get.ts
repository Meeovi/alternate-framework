import { requireAuth } from '#auth/server/utils/sessions'
import { isPixanomyConfigured, listPixanomyAssets } from '../../utils/pixanomy'

/**
 * The signed-in user's own media on Pixanomy (app.pixanomy.com), newest
 * first — everything they've uploaded anywhere in Meeovi via
 * /api/assets/upload.
 *
 * Query: limit (1-50, default 12), type ("image" | "video" | omitted = both)
 * Returns `{ assets: PixanomyListedAsset[] }`.
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  // Personal data — never let a shared cache hold it.
  setResponseHeader(event, 'Cache-Control', 'private, no-store')

  if (!isPixanomyConfigured()) return { assets: [] }

  const query = getQuery(event)
  const limit = Number(query.limit) || 12
  const types = query.type === 'image' ? ['image/'] : query.type === 'video' ? ['video/'] : ['image/', 'video/']

  return { assets: await listPixanomyAssets(user.id, { limit, types }) }
})
