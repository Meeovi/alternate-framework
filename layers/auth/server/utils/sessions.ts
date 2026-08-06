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
