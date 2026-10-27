import { defineEventHandler, setResponseHeader } from 'h3'
import type { GalleryFilesResponse } from '../../types'
import { galleryConfig, isGalleryConfigured, listOwnerFiles, ownerShareLinks, requireUser, toEntries } from '../utils/gallery'

/**
 * GET /api/gallery/files — the signed-in user's whole gallery (every file
 * they've uploaded anywhere in Meeovi) as SVAR File Manager entries.
 */
export default defineEventHandler(async (event): Promise<GalleryFilesResponse> => {
  const user = await requireUser(event)
  // Personal data — never let a shared cache hold it.
  setResponseHeader(event, 'Cache-Control', 'private, no-store')

  const { pixanomy } = galleryConfig(event)
  if (!isGalleryConfigured(pixanomy)) return { files: [], drive: { used: 0 } }

  const [files, links] = await Promise.all([listOwnerFiles(pixanomy, user.id), ownerShareLinks(pixanomy, user.id)])
  return {
    files: toEntries(files, links),
    drive: { used: files.reduce((sum, f) => sum + f.size, 0) },
  }
})
