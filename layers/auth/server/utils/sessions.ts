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
