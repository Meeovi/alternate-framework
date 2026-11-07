import { createError, defineEventHandler, getRouterParam, setResponseHeader } from 'h3'
import { requireAuth } from '#auth/server/utils/sessions'
import { detectAssetType } from '#shared/server/utils/pixanomy'
import { assetOriginAllowed, canUse, ownedProductIds, readEffect } from '../../../../../utils/vibeEffects'

/**
 * GET /api/social/vibez/effects/:id/asset — an effect's image, for members
 * who may use it (their own, shared, free, or bought). Served from Meeovi so
 * the editor's canvas can record it; the Pixanomy link stays on the server.
 */
const MAX_BYTES = 10 * 1024 * 1024

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event) as { id: string, role?: string | null }
  const row = await readEffect(String(getRouterParam(event, 'id') ?? ''))
  const owned = row.product && Number(row.product.price) > 0 && row.creator_id !== user.id ? await ownedProductIds(user.id) : new Set<string>()
  if (!canUse(row, user, owned)) throw createError({ statusCode: 403, statusMessage: 'Get this effect first' })
  if (!row.asset_url || !assetOriginAllowed(row.asset_url)) throw createError({ statusCode: 404, statusMessage: 'This effect has no image' })

  const res = await fetch(row.asset_url, { redirect: 'follow', signal: AbortSignal.timeout(20_000) }).catch(() => null)
  if (!res?.ok) throw createError({ statusCode: 502, statusMessage: "The effect's image couldn't be loaded" })
  const length = Number(res.headers.get('content-length') || 0)
  if (length > MAX_BYTES) throw createError({ statusCode: 502, statusMessage: 'The image is too big' })
  const data = new Uint8Array(await res.arrayBuffer())
  if (data.length > MAX_BYTES) throw createError({ statusCode: 502, statusMessage: 'The image is too big' })
  const type = detectAssetType(data)
  if (!type?.startsWith('image/')) throw createError({ statusCode: 502, statusMessage: 'The effect is not an image' })

  setResponseHeader(event, 'Content-Type', type)
  setResponseHeader(event, 'Cache-Control', 'private, max-age=86400')
  setResponseHeader(event, 'X-Content-Type-Options', 'nosniff')
  setResponseHeader(event, 'Content-Security-Policy', "default-src 'none'; sandbox")
  return data
})
