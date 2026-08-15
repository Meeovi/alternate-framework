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
  if (!user.id) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  const email = typeof body?.email === 'string' ? body.email.trim() : ''

  try {
    const account = await stripe.accounts.create({
      type: 'express',
      ...(email ? { email } : {}),
      // charges_enabled/payouts_enabled are read-only status fields on an
      // Account, not valid capability-request keys — Stripe's real
      // creation-time shape requests each capability individually.
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
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
