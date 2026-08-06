import { getSocialDriver } from '../../utils/social'
import type { SocialDriverContract } from '@mframework/alternate-sdk/contracts/social'

/**
 * POST /api/social/driver
 *
 * A typed proxy endpoint that forwards method calls to the server-side
 * social driver (`nuxtApp.$sdk.social`). This keeps all SDK resolution
 * on the server — the frontend compositor calls `$fetch` instead of
 * accessing `nuxtApp.$sdk` directly, making the frontend code backend-
 * agnostic (it only depends on HTTP + the method contract).
 *
 * Request body:
 *   { method: string, args?: unknown[] }
 *
 * Response: whatever the social driver method returns.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { method, args = [] } = body as { method: string; args?: unknown[] }

  if (!method || typeof method !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'method (string) is required in the request body' })
  }

  const social = getSocialDriver()
  const fn = social?.[method as keyof SocialDriverContract]

  if (typeof fn !== 'function') {
    throw createError({
      statusCode: 404,
      statusMessage: `Social driver method "${method}" is not available`,
    })
  }

  try {
    return await (fn as (...a: unknown[]) => any).apply(social, args as any[])
  } catch (error: any) {
    const statusCode = error?.$statusCode || error?.statusCode || 500
    const message = error?.message || 'Social driver call failed'
    const details = error?.data || error?.details

    throw createError({
      statusCode,
      statusMessage: message,
      data: details,
    })
  }
})
