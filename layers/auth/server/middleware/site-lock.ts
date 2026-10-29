import { createHash, timingSafeEqual } from 'node:crypto'
import { createError, defineEventHandler, getHeader, getRequestURL, sendRedirect, setHeader } from 'h3'
import { getAuthSession } from '../utils/sessions'
import { siteLockAccess } from '../utils/siteLock'

/**
 * Locks the whole site behind a login (NUXT_SITE_LOCK_ENABLED=true). Used on
 * demo.meeovicms.com once meeovi.com is live, so the demo stays a private
 * beta: signed-out visitors are sent to /login and APIs answer 401, apart from
 * the sign-in pages, static files and webhooks (utils/siteLock.ts).
 *
 * NUXT_SITE_LOCK_BYPASS_TOKEN lets the production tests through: they send it
 * as the `x-site-lock-bypass` header.
 *
 * Also set NUXT_SITE_INDEXABLE=false: Nuxt SEO writes its own X-Robots-Tag on
 * pages (over the one below) and serves robots.txt. Files in public/ are
 * served before any middleware, so they stay readable.
 */
const BYPASS_HEADER = 'x-site-lock-bypass'
const digest = (s: string) => createHash('sha256').update(s).digest()

export default defineEventHandler(async (event) => {
  const lock = (useRuntimeConfig(event) as { siteLock?: { enabled?: boolean | string, bypassToken?: string } }).siteLock
  if (lock?.enabled !== true && lock?.enabled !== 'true') return

  // Search engines shouldn't list anything here (APIs and redirects; pages
  // get theirs from NUXT_SITE_INDEXABLE=false).
  setHeader(event, 'X-Robots-Tag', 'noindex, nofollow')

  const { pathname, search } = getRequestURL(event)
  const access = siteLockAccess(pathname)
  if (access === 'open') return

  const bypass = getHeader(event, BYPASS_HEADER)
  if (bypass && lock.bypassToken && timingSafeEqual(digest(bypass), digest(lock.bypassToken))) return

  const session = await getAuthSession(event).catch(() => null)
  if (session?.user) return

  if (access === 'api') {
    throw createError({ statusCode: 401, statusMessage: 'Sign in to use this site.' })
  }
  setHeader(event, 'Cache-Control', 'no-store')
  const back = pathname === '/' ? '' : `?redirect=${encodeURIComponent(pathname + search)}`
  return sendRedirect(event, `/login${back}`, 302)
})
