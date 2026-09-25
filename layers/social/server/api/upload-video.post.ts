import { createDirectus, rest, staticToken, createItem } from '@directus/sdk'
import { requireAuth } from '#auth/server/utils/sessions'
import { isAllowedAssetType, uploadToPixanomy } from '#shared/server/utils/pixanomy'

// Matches exactly what vibe/upload.vue posts to. The video file itself goes
// to Pixanomy (app.pixanomy.com — the centralized asset store); only the
// `shorts` record lives in Directus, with the public Pixanomy link in
// `video_url`. Legacy rows still carry a Directus file id in `video`, so
// readers use `short.video_url || short.video` (getAssetURL() handles both).
const directus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const parts = await readMultipartFormData(event)
  if (!parts) {
    throw createError({ statusCode: 400, statusMessage: 'Expected multipart/form-data body' })
  }

  const namePart = parts.find((p) => p.name === 'name')
  const videoPart = parts.find((p) => p.name === 'video')

  if (!videoPart?.data?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Please select a video file.' })
  }

  const contentType = videoPart.type || 'video/mp4'
  if (!contentType.startsWith('video/') || !isAllowedAssetType(contentType)) {
    throw createError({ statusCode: 415, statusMessage: 'Unsupported video format.' })
  }

  const name = namePart?.data?.toString('utf-8')?.trim() || 'Untitled'

  const asset = await uploadToPixanomy({
    data: new Uint8Array(videoPart.data),
    filename: videoPart.filename || 'video.mp4',
    contentType,
    ownerId: user.id,
    category: 'vibez',
  })

  const short = await directus.request(
    createItem('shorts', {
      name,
      video_url: asset.url,
      creator: (user as any).username || user.name,
      // The livebar shows the creator's avatar from this (users.image).
      creator_id: user.id,
      status: 'published',
    }),
  )

  return { id: (short as any).id, url: asset.url }
})
