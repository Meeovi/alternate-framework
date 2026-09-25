import { requireAuth } from '#auth/server/utils/sessions'
import { isAllowedAssetType, sanitizeSegment, uploadToPixanomy } from '../../utils/pixanomy'

/**
 * The single upload endpoint for every user file in Meeovi — posts, vibez,
 * form file fields, etc. all come through here (client side:
 * useAssetUpload()), and everything lands in Pixanomy (app.pixanomy.com).
 *
 * multipart/form-data:
 *   file      (required, repeatable) — the file(s)
 *   category  (optional) — folder grouping, e.g. "posts", "vibez"
 *
 * Returns `{ assets: PixanomyAsset[] }` in the same order as the files.
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const maxBytes = Number((useRuntimeConfig() as any).pixanomy?.maxUploadMb || 200) * 1024 * 1024

  // Refuse oversized bodies before buffering them into memory.
  const declared = Number(getRequestHeader(event, 'content-length') || 0)
  if (declared > maxBytes) {
    throw createError({ statusCode: 413, statusMessage: 'File too large' })
  }

  const parts = await readMultipartFormData(event)
  if (!parts) {
    throw createError({ statusCode: 400, statusMessage: 'Expected multipart/form-data body' })
  }

  const category = sanitizeSegment(
    parts.find((p) => p.name === 'category' && !p.filename)?.data.toString('utf-8') || 'uploads',
    'uploads',
  )
  const files = parts.filter((p) => p.name === 'file' && p.filename && p.data?.length)
  if (!files.length) {
    throw createError({ statusCode: 400, statusMessage: 'No file provided' })
  }

  for (const file of files) {
    if (file.data.length > maxBytes) {
      throw createError({ statusCode: 413, statusMessage: `${file.filename} is too large` })
    }
    if (!isAllowedAssetType(file.type || '')) {
      throw createError({ statusCode: 415, statusMessage: `${file.filename}: unsupported file type` })
    }
  }

  const assets = []
  for (const file of files) {
    assets.push(await uploadToPixanomy({
      data: new Uint8Array(file.data),
      filename: file.filename!,
      contentType: file.type!,
      ownerId: user.id,
      category,
    }))
  }

  return { assets }
})
