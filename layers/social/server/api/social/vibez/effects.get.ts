import { createError, defineEventHandler, getQuery } from 'h3'
import { requireAuth } from '#auth/server/utils/sessions'
import { KINDS, listEffects, type EffectKind, type Tab } from '../../../utils/vibeEffects'

/**
 * GET /api/social/vibez/effects?tab=mine|owned|community|shop&kind=sticker|filter|background
 * — the vibe editor's effects picker (utils/vibeEffects.ts). `shop` lists
 * every effect sold as a product, each with `usable` (owned or free).
 */
const TABS: Tab[] = ['mine', 'owned', 'community', 'shop']

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event) as { id: string, role?: string | null }
  const query = getQuery(event)
  const tab = String(query.tab ?? 'mine') as Tab
  const kind = query.kind ? String(query.kind) as EffectKind : undefined
  if (!TABS.includes(tab) || (kind && !KINDS.includes(kind))) throw createError({ statusCode: 400, statusMessage: 'Unknown tab or kind' })
  return { items: await listEffects(user, tab, kind) }
})
