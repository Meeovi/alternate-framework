import { defineEventHandler } from 'h3'
import { requireAuth } from '#auth/server/utils/sessions'
import { giftCardsFor } from '../../../utils/giftCards'

/**
 * GET /api/commerce/wishes/mine — the signed-in user's gift cards:
 * `received` (sent to their verified email) and `purchased` (on their
 * orders). Only ever the session user's own; there are no parameters.
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  return giftCardsFor(user as { id: string })
})
