import { defineEventHandler, readBody, createError } from 'h3'
import { classifyBusinessDriverMethod } from '../../utils/driverAccess'
import { getBusinessDriver } from '../../utils/business'
import { requireSeller } from '#auth/server/utils/sessions'

/**
 * POST /api/business/driver
 *
 * A typed proxy endpoint that forwards method calls to the server-side
 * business driver (see `alternate-sdk/contracts/business.ts`). Mirrors
 * `layers/commerce/server/api/commerce/driver.post.ts` and
 * `layers/social/server/api/social/driver.post.ts` — the Vue layer only
 * ever talks HTTP + the `BusinessDriverContract` method names, never a
 * concrete backend SDK, which is what keeps `layers/business` backend
 * agnostic.
 *
 * Request body:
 *   { method: string, args?: unknown[] }
 *
 * Only methods listed in server/utils/driverAccess.ts are reachable.
 * Every method requires a signed-in seller (`requireSeller`), and the
 * seller's own user id is injected into the call as `sellerId`, so a
 * caller can never request another seller's data by supplying their own
 * `sellerId` in the request body.
 *
 * Response: whatever the business driver method returns.
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

  const access = classifyBusinessDriverMethod(method)
  if (access === 'denied') {
    throw createError({
      statusCode: 403,
      statusMessage: `Business driver method "${method}" is not exposed through this endpoint`,
    })
  }

  const seller = await requireSeller(event)

  const business = getBusinessDriver()

  // Every contract method is either flat ("getStats") or nested under a
  // sub-driver ("products.list") — see BusinessDriverContract in
  // alternate-sdk/contracts. The manifest above only contains these known
  // contract paths, so traversal here is over trusted, fixed keys.
  const segments = method.split('.')
  const key = segments.pop() as string
  let target: any = business
  for (const segment of segments) {
    target = target?.[segment]
  }
  const fn = target?.[key]

  if (typeof fn !== 'function') {
    throw createError({
      statusCode: 404,
      statusMessage: `Business driver method "${method}" is not available`,
    })
  }

  // sellerId always comes from the session, never the request body — the
  // params object (if any) is a plain object, so a spread is safe here.
  const params = { ...(args[0] as Record<string, unknown> | undefined), sellerId: (seller as { id: string }).id }

  try {
    return await (fn as (...a: unknown[]) => any).call(target, params)
  } catch (error: any) {
    const statusCode = error?.$statusCode || error?.statusCode || 500
    const message = error?.message || 'Business driver call failed'
    const details = error?.data || error?.details

    throw createError({
      statusCode,
      statusMessage: message,
      data: details,
    })
  }
})
