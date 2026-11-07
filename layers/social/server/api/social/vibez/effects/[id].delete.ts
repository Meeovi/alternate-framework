import { createError, defineEventHandler, getRouterParam } from 'h3'
import { requireAuth } from '#auth/server/utils/sessions'
import { readEffect, removeEffect } from '../../../../utils/vibeEffects'

/** DELETE /api/social/vibez/effects/:id — a member deletes their own effect (admins any member effect). */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event) as { id: string, role?: string | null }
  const row = await readEffect(String(getRouterParam(event, 'id') ?? ''))
  const admin = (user.role || '').split(',').map((r) => r.trim()).includes('admin')
  if (row.product) throw createError({ statusCode: 403, statusMessage: 'Effects sold as products are managed from the product' })
  if (row.creator_id !== user.id && !admin) throw createError({ statusCode: 403, statusMessage: 'You can only delete your own effects' })
  await removeEffect(row.id)
  return { ok: true }
})
