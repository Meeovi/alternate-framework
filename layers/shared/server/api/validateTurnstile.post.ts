import { createError, defineEventHandler, readBody } from 'h3'

/**
 * Checks a Cloudflare Turnstile token for the forms plugin's <DynamicForm>,
 * which calls this before saving (Turnstile is on whenever a site key is
 * configured). The save itself goes through the CMS proxy, which requires a
 * session — this only keeps bots from hammering the form UI.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ token?: unknown }>(event).catch(() => null)
  const token = typeof body?.token === 'string' ? body.token : ''
  if (!token || token.length > 4096) {
    throw createError({ statusCode: 400, statusMessage: 'Complete the verification and try again' })
  }
  const result = await verifyTurnstileToken(token, event).catch(() => null)
  if (!result?.success) {
    throw createError({ statusCode: 403, statusMessage: 'Verification failed. Please try again.' })
  }
  return { success: true }
})
