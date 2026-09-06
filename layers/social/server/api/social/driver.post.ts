import { getSocialDriver } from '../../utils/social'
import { classifySocialDriverMethod } from '../../utils/driverAccess'
import { getAuthSession } from '#auth/server/utils/sessions'

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
 * Only methods listed in server/utils/driverAccess.ts are reachable; the
 * request is rejected otherwise. Methods classified `authed` additionally
 * require a signed-in session.
 *
 * Response: whatever the social driver method returns.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { method, args = [] } = body as { method: string; args?: unknown[] }

  if (!method || typeof method !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'method (string) is required in the request body' })
  }

  if (!Array.isArray(args)) {
    throw createError({ statusCode: 400, statusMessage: 'args must be an array' })
  }

  const access = classifySocialDriverMethod(method)
  if (access === 'denied') {
    throw createError({
      statusCode: 403,
      statusMessage: `Social driver method "${method}" is not exposed through this endpoint`,
    })
  }

  if (access === 'authed') {
    const session = await getAuthSession(event)
    if (!session?.user) {
      throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
    }
    event.context.user = session.user
  }

  const social = getSocialDriver()

  // Most operations live under a sub-driver (e.g. "posts.getPosts", not a
  // flat "getPosts") — see SocialDriverContract in alternate-sdk/contracts.
  // Only getUser/searchUsers/follow/unfollow/getFollowers/getFollowing are
  // flat on the top-level contract. The manifest above only contains these
  // known contract paths, so traversal here is over trusted, fixed keys.
  const segments = method.split('.')
  const key = segments.pop() as string
  let target: any = social
  for (const segment of segments) {
    target = target?.[segment]
  }
  const fn = target?.[key]

  if (typeof fn !== 'function') {
    throw createError({
      statusCode: 404,
      statusMessage: `Social driver method "${method}" is not available`,
    })
  }

  try {
    return await (fn as (...a: unknown[]) => any).apply(target, args as any[])
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
