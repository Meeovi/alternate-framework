import { assertOwnsConnectAccount } from '../../../utils/connect-auth'
import { createError, defineEventHandler, getQuery } from 'h3'
import { requireAuth } from '#auth/server/utils/sessions'

/**
 * GET /api/commerce/connect/account-status?accountId=...
 *
 * Retrieves the Stripe Connect account status so the frontend can
 * render an account dashboard without touching the backend SDK.
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const query = getQuery(event)
  const accountId = typeof query.accountId === 'string' ? query.accountId.trim() : ''

  if (!accountId) {
    throw createError({ statusCode: 400, statusMessage: 'accountId query parameter is required' })
  }

  try {
    const account = await assertOwnsConnectAccount(accountId, user.id)

    return {
      id: account.id,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
    }
  } catch (error: any) {
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.message || 'Failed to fetch account status',
    })
  }
})
