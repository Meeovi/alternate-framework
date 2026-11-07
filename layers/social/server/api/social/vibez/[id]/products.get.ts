import { createError, defineEventHandler, getRouterParam } from 'h3'
import { getAuthSession } from '#auth/server/utils/sessions'
import { listVibeProducts, readShort } from '../../../../utils/vibeProducts'

/**
 * GET /api/social/vibez/:id/products — the products tagged on a vibe
 * (shoppable vibez, utils/vibeProducts.ts): { canEdit, items: [{ id, start,
 * end, product }] }, timed ones first. Anyone can read a published vibe's;
 * canEdit is true for the vibe's creator and admins.
 */
export default defineEventHandler(async (event) => {
  const short = await readShort(String(getRouterParam(event, 'id') ?? ''))
  const user = (await getAuthSession(event).catch(() => null))?.user as { id: string, role?: string | null } | undefined
  const isAdmin = (user?.role || '').split(',').map((r) => r.trim()).includes('admin')
  const canEdit = Boolean(user && (isAdmin || (short.creator_id && short.creator_id === user.id)))
  if (String(short.status ?? '').toLowerCase() !== 'published' && !canEdit) throw createError({ statusCode: 404, statusMessage: 'Vibe not found' })
  return { canEdit, items: await listVibeProducts(short.id) }
})
