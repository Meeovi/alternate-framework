// POST /api/admin/wikipedia-news/import { days?, limit? } — admins only.
// The member is read from better-auth's session endpoint with the caller's
// cookie (plugins don't import the auth layer).
import { createError, defineEventHandler, getRequestHeader, readBody } from 'h3'
import { runImport } from '../run'

export default defineEventHandler(async (event) => {
  const cookie = getRequestHeader(event, 'cookie') || ''
  const session = cookie
    ? await $fetch<{ user?: { role?: string | null } } | null>('/api/auth/get-session', { headers: { cookie } }).catch(() => null)
    : null
  if (!session?.user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  const roles = String(session.user.role || '').split(',').map((r) => r.trim())
  if (!roles.includes('admin')) throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  const body = (await readBody(event).catch(() => null)) as { days?: unknown, limit?: unknown } | null
  const days = body?.days === undefined ? undefined : Math.max(1, Math.min(Number(body.days) || 1, 14))
  const limit = body?.limit === undefined ? undefined : Math.max(1, Math.min(Number(body.limit) || 1, 200))
  try {
    return await runImport({ days, limit })
  } catch (error: any) {
    console.error('[wikipedia-news] import failed', error?.message || error)
    throw createError({ statusCode: 502, statusMessage: 'The news import failed' })
  }
})
