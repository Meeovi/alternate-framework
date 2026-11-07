import { createError, defineEventHandler, readMultipartFormData } from 'h3'
import { requireAuth } from '#auth/server/utils/sessions'
import { detectAssetType, uploadToPixanomy } from '#shared/server/utils/pixanomy'
import { normalizeFilter } from '#shared/shared/vibeFilter'
import { MAX_PER_MEMBER, countMine, createEffect, toClient, type EffectKind } from '../../../utils/vibeEffects'

/**
 * POST /api/social/vibez/effects (multipart) — a member adds their own
 * sticker, filter or background: kind, name, visibility (private |
 * community) and either `file` (sticker: PNG/WebP/GIF up to 2 MB;
 * background: JPEG/PNG/WebP up to 5 MB) or `config` (a filter's settings,
 * JSON). Images go to the member's Pixanomy folder. Shared ones are free;
 * selling one is done as a seller product.
 */
const LIMITS: Record<'sticker' | 'background', { types: string[], bytes: number }> = {
  sticker: { types: ['image/png', 'image/webp', 'image/gif'], bytes: 2 * 1024 * 1024 },
  background: { types: ['image/jpeg', 'image/png', 'image/webp'], bytes: 5 * 1024 * 1024 },
}

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event) as { id: string, role?: string | null }
  const parts = await readMultipartFormData(event)
  if (!parts) throw createError({ statusCode: 400, statusMessage: 'Expected a form' })
  const field = (name: string) => parts.find((p) => p.name === name)?.data?.toString('utf-8')?.trim() ?? ''

  const kind = field('kind') as EffectKind
  if (!['sticker', 'filter', 'background'].includes(kind)) throw createError({ statusCode: 400, statusMessage: 'Choose sticker, filter or background' })
  const name = field('name').slice(0, 120)
  if (!name) throw createError({ statusCode: 400, statusMessage: 'Give it a name' })
  const visibility = field('visibility') === 'community' ? 'community' : 'private'
  if (await countMine(user.id) >= MAX_PER_MEMBER) throw createError({ statusCode: 409, statusMessage: `You can keep up to ${MAX_PER_MEMBER} effects. Delete some first.` })

  let assetUrl: string | null = null
  let config: Record<string, unknown> | null = null
  if (kind === 'filter') {
    let raw: unknown
    try { raw = JSON.parse(field('config') || '{}') } catch { throw createError({ statusCode: 400, statusMessage: 'Invalid filter settings' }) }
    config = normalizeFilter(raw)
    if (!Object.keys(config).length) throw createError({ statusCode: 400, statusMessage: 'Change at least one setting' })
  } else {
    const file = parts.find((p) => p.name === 'file')
    if (!file?.data?.length) throw createError({ statusCode: 400, statusMessage: 'Choose an image' })
    const limit = LIMITS[kind]
    if (file.data.length > limit.bytes) throw createError({ statusCode: 413, statusMessage: `That image is too big (up to ${limit.bytes / 1024 / 1024} MB)` })
    const data = new Uint8Array(file.data)
    const type = detectAssetType(data, file.type || '')
    if (!type || !limit.types.includes(type)) throw createError({ statusCode: 415, statusMessage: kind === 'sticker' ? 'Stickers must be PNG, WebP or GIF' : 'Backgrounds must be JPEG, PNG or WebP' })
    const asset = await uploadToPixanomy({ data, filename: file.filename || `${kind}.${type.split('/')[1]}`, contentType: type, ownerId: user.id, category: 'vibe-effects' })
    assetUrl = asset.url
  }

  const row = await createEffect({ status: 'published', kind, name, asset_url: assetUrl, config, creator_id: user.id, visibility })
  return toClient(row, user, new Set())
})
