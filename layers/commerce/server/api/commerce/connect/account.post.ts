import { stripe } from '../../../utils/stripe'
import { CONNECT_OWNER_METADATA_KEY } from '../../../utils/connect-auth'
import { createError, defineEventHandler, readBody } from 'h3'
import { requireAuth } from '#auth/server/utils/sessions'

/**
 * POST /api/commerce/connect/account
 *
 * Creates a Stripe Express Connect account for a commerce partner.
 * Returns the new account ID so the frontend can store it (e.g. in a
 * composable or store — NOT in localStorage at the server level).
 *
 * Body: { email?: string }
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const body = await readBody(event)
  const email = typeof body?.email === 'string' ? body.email.trim() : ''

  try {
    const account = await stripe.accounts.create({
      type: 'express',
      ...(email ? { email } : {}),
      capabilities: {
        charges_enabled: true,
        payouts_enabled: true,
      },
      integration_identifier: `alternate-connect-${Array.from({ length: 8 }, () =>
        'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
      ).join('')}`,
      // Tags the account with the owning user so account-link, account-status,
      // login-link, and product routes can verify ownership before acting on it.
      metadata: {
        [CONNECT_OWNER_METADATA_KEY]: user.id,
      },
    })

    return { accountId: account.id }
  } catch (error: any) {
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.message || 'Failed to create connect account',
    })
  }
})
