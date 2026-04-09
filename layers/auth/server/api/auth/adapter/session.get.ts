import { defineEventHandler, getCookie } from 'h3'
import { getAdapterSession, getAuthBackend } from '../../../utils/adapter-auth'

export default defineEventHandler(async (event) => {
  const backend = getAuthBackend()
  const cookieName = process.env.AUTH_COOKIE_NAME || 'auth-token'
  const hasCookie = Boolean(getCookie(event, cookieName))

  const session = await getAdapterSession(event)

  if (process.env.NODE_ENV === 'development') {
    console.info('[auth][adapter][session]', {
      backend,
      cookieName,
      hasCookie,
      hasSession: Boolean(session?.session && session?.user),
    })
  }

  return {
    backend,
    ...session,
  }
})
