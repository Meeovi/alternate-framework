import { createDirectus, rest, staticToken, uploadFiles, createItem } from '@directus/sdk'
import { requireAuth } from '#auth/server/utils/sessions'

// Matches exactly what vibe/upload.vue posts to. Backed by the `shorts`
// Directus collection (real, native file storage) — not the separate
// `videos` + MinIO path used by vibez.vue/vibe/[...id].vue previously;
// MINIO_ACCESS_KEY/SECRET_KEY/BUCKET/REGION are all blank in .env, so that
// path has no working storage backend regardless of any code fix.
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

  const name = namePart?.data?.toString('utf-8')?.trim() || 'Untitled'

  const uploadForm = new FormData()
  uploadForm.append(
    'file',
    new Blob([new Uint8Array(videoPart.data)], { type: videoPart.type || 'video/mp4' }),
    videoPart.filename || 'video.mp4',
  )

  const uploadedFile = await directus.request(uploadFiles(uploadForm))

  const short = await directus.request(
    createItem('shorts', {
      name,
      video: uploadedFile.id,
      creator: (user as any).username || user.name,
      status: 'published',
    }),
  )

  return { id: (short as any).id }
})
