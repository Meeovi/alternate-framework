import { createError, defineEventHandler, getHeader, getRequestURL, readBody } from 'h3'
import { needsTurnstile, TURNSTILE_HEADER } from '../../shared/formProtection'

/**
 * Form submissions (shared/formProtection.ts) need a Cloudflare Turnstile
 * token, checked here before the route runs: the browser plugin
 * (app/plugins/turnstile-forms.client.ts) attaches one to each submission,
 * a bot posting straight to the API has none. Tokens are single-use, so a
 * captured token can't be replayed.
 *
 * Off when no Turnstile secret is configured (local development).
 */
export default defineEventHandler(async (event) => {
  const method = event.method
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return
  const { pathname } = getRequestURL(event)
  if (!pathname.startsWith('/api/')) return
  const secretKey = (useRuntimeConfig(event) as { turnstile?: { secretKey?: string } }).turnstile?.secretKey
  if (!secretKey) return
  if (!(await needsTurnstile(method, pathname, () => readBody(event).catch(() => null)))) return

  const token = getHeader(event, TURNSTILE_HEADER)
  const result = token && token.length <= 4096
    ? await verifyTurnstileToken(token, event).catch(() => null)
    : null
  if (!result?.success) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Please complete the security check and try again.',
      data: { turnstile: true },
    })
  }
})
