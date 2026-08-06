import { defineEventHandler, createError } from 'h3'
import { getAuthSession } from '../../utils/sessions'
import { stripeClient } from '../../utils/stripe'
import { db } from '../../utils/drizzle'
import { organizations } from '../../database/migrations/schema'
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
    .from(organizations)
    .where(eq(organizations.id, session.session.activeOrganizationId))
    .limit(1)

  const stripeAccountId = (org?.metadata as any)?.stripeAccountId as string | undefined

  if (!stripeAccountId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No connected Stripe account. Complete onboarding first.'
    })
  }

  // Already connected — create a login link to the Express dashboard
  const loginLink = await stripeClient.accounts.createLoginLink(stripeAccountId)
  return { url: loginLink.url, connected: true }
})
