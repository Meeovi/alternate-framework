import { stripe } from '../../../utils/stripe'
import { assertOwnsConnectAccount } from '../../../utils/connect-auth'
import { createError, defineEventHandler, readBody } from 'h3'
import { requireAuth } from '#auth/server/utils/sessions'

/**
 * POST /api/commerce/connect/login-link
 *
 * Creates a login link for a Stripe Express account so the partner
 * can access their Stripe Dashboard. Returns the URL.
 *
 * Body: { accountId: string }
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  if (!user.id) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  const body = await readBody(event)
  const accountId = typeof body?.accountId === 'string' ? body.accountId.trim() : ''

  if (!accountId) {
    throw createError({ statusCode: 400, statusMessage: 'accountId is required' })
  }

  await assertOwnsConnectAccount(accountId, user.id)

  try {
    // Login links only ever accept `expand` (per Stripe's real
    // AccountCreateLoginLinkParams) — there is no capability-request
    // param here. Capabilities are requested at account-creation time
    // instead (see account.post.ts).
    const loginLink = await stripe.accounts.createLoginLink(accountId)

    return { url: loginLink.url }
  } catch (error: any) {
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.message || 'Failed to create login link',
    })
  }
})
