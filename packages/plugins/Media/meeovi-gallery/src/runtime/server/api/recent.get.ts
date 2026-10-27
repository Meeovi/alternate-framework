import { defineEventHandler, getQuery, setResponseHeader } from 'h3'
import type { GalleryRecentResponse } from '../../types'
import { galleryConfig, isGalleryConfigured, listOwnerFiles, ownerShareLinks, requireUser, toMediaItems } from '../utils/gallery'

const TYPES: Record<string, string[]> = {
  image: ['image/'],
  video: ['video/'],
  audio: ['audio/'],
  media: ['image/', 'video/'],
}

/**
 * GET /api/gallery/recent?limit=12&type=media|image|video|audio — the
 * signed-in user's latest uploads with their public links, for
 * <MeeoviRelatedMedia>. `type` defaults to photos and videos.
 */
export default defineEventHandler(async (event): Promise<GalleryRecentResponse> => {
  const user = await requireUser(event)
  setResponseHeader(event, 'Cache-Control', 'private, no-store')

  const { pixanomy } = galleryConfig(event)
  if (!isGalleryConfigured(pixanomy)) return { media: [] }

  const query = getQuery(event)
  const limit = Math.max(1, Math.min(50, Math.floor(Number(query.limit) || 12)))
  const types = TYPES[String(query.type || 'media')] ?? TYPES.media!

  const [files, links] = await Promise.all([
    listOwnerFiles(pixanomy, user.id, { limit, types }),
    ownerShareLinks(pixanomy, user.id),
  ])
  return { media: toMediaItems(files, links) }
})
