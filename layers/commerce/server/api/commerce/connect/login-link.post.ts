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
  const body = await readBody(event)
  const accountId = typeof body?.accountId === 'string' ? body.accountId.trim() : ''

  if (!accountId) {
    throw createError({ statusCode: 400, statusMessage: 'accountId is required' })
  }

  await assertOwnsConnectAccount(accountId, user.id)

  try {
    const loginLink = await stripe.accounts.createLoginLink(accountId, {
      requestedCapabilities: ['transfers'],
    })

    return { url: loginLink.url }
  } catch (error: any) {
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.message || 'Failed to create login link',
    })
  }
})
