import { defineEventHandler, createError } from 'h3'
import { getAuthSession } from '../../utils/sessions'
import { stripeClient } from '../../utils/stripe'
import { db } from '../../utils/drizzle'
import { authOrganizations } from '../../database/migrations/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await getAuthSession(event)
  if (!session?.session?.activeOrganizationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No active organization'
    })
  }

  const [org] = await db
    .select()
    .from(authOrganizations)
    .where(eq(authOrganizations.id, session.session.activeOrganizationId))
    .limit(1)

  const metadata = org?.metadata ? JSON.parse(org.metadata) : undefined
  const stripeAccountId = metadata?.stripeAccountId as string | undefined

  if (!stripeAccountId) {
    return { balance: null, connected: false }
  }

  // stripeAccount belongs in the second argument (RequestOptions), not the
  // first (BalanceRetrieveParams, which only accepts `expand`) — Stripe
  // rejected this as "unknown parameter: stripeAccount" on every call.
  const balance = await stripeClient.balance.retrieve({}, {
    stripeAccount: stripeAccountId
  })

  return { balance, connected: true }
})
