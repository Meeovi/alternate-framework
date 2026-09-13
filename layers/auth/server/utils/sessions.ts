import type { H3Event } from 'h3'
import { createError } from 'h3'
import type { User } from '../../app/types'

export const getAuthSession = async (event: H3Event) => {
  const headers = event.headers
  const serverAuth = (await import('./auth')).useServerAuth() as any
  const session = await serverAuth.api.getSession({
    headers
  })
  return session
}

export const requireAuth = async (event: H3Event) => {
  const session = await getAuthSession(event)
  if (!session || !session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }
  event.context.user = session.user
  return session.user as User
}

/**
 * Server-side admin gate. Route middleware (app/middleware/admin.ts) only
 * guards page navigation — every administrative `/api/*` handler must call
 * this itself so it can't be reached by hitting the endpoint directly.
 *
 *   export default defineEventHandler(async (event) => {
 *     const admin = await requireAdmin(event)
 *     // ...
 *   })
 */
export const requireAdmin = async (event: H3Event) => {
  const user = await requireAuth(event)
  if ((user as { role?: string }).role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden'
    })
  }
  return user
}

const hasRole = (user: { role?: string | null }, role: string) =>
  (user.role || '').split(',').map((r) => r.trim()).includes(role)

/**
 * Server-side seller gate — same rationale as requireAdmin above: the
 * seller.ts route middleware only guards page navigation, so any
 * layers/business/dashboard `/api/*` handler must call this itself.
 * `role` is comma-separated (better-auth's admin plugin natively supports
 * "user,seller" — see shared/utils/permissions.ts's seller role), so this
 * checks membership rather than exact equality.
 */
export const requireSeller = async (event: H3Event) => {
  const user = await requireAuth(event)
  if (!hasRole(user as { role?: string }, 'seller')) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden'
    })
  }
  return user
}
