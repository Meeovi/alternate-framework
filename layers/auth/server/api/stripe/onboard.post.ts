import { defineEventHandler, createError } from 'h3'
import { stripeClient } from '../../utils/stripe'
import { db } from '../../utils/drizzle'
import { authOrganizations } from '../../database/migrations/schema'
import { eq } from 'drizzle-orm'
import { requireOrgStripeManager } from '../../utils/stripeConnect'

/**
 * POST /api/stripe/onboard
 *
 * The previously-missing half of Connect onboarding — account-link.post.ts,
 * balance.get.ts and payouts.get.ts all assumed an authOrganizations
 * Stripe account already existed, but nothing ever created one. Matches
 * the v1 Accounts API pattern already shipped and verified in
 * layers/commerce/server/api/commerce/connect/account.post.ts +
 * account-link.post.ts, rather than the newer v2 Accounts API, so this app
 * doesn't end up with two incompatible connected-account models.
 *
 * Creates the account (if the organization doesn't have one yet) and
 * immediately returns an onboarding account-link URL to redirect to.
 */
export default defineEventHandler(async (event) => {
  // Signed in (401), active org (400), and its owner/admin (403) — creating
  // the account and its onboarding link hands over control of payouts.
  const { user, organizationId, metadata } = await requireOrgStripeManager(event)

  let stripeAccountId = metadata.stripeAccountId as string | undefined

  if (!stripeAccountId) {
    try {
      const account = await stripeClient.accounts.create({
        type: 'express',
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          organizationId,
        },
      })
      stripeAccountId = account.id

      await db
        .update(authOrganizations)
        .set({ metadata: JSON.stringify({ ...metadata, stripeAccountId }) })
        .where(eq(authOrganizations.id, organizationId))
    } catch (error: any) {
      throw createError({
        statusCode: error?.statusCode || 500,
        statusMessage: error?.message || 'Failed to create Stripe Connect account',
      })
    }
  }

  const config = useRuntimeConfig()
  const isDev = process.env.NODE_ENV !== 'production'
  const domain =
    process.env.DOMAIN ||
    ((config.public as any)?.siteUrl as string | undefined) ||
    (isDev ? 'http://localhost:3000' : '')

  if (!domain) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Site URL is not configured (set DOMAIN or NUXT_PUBLIC_SITE_URL)',
    })
  }

  try {
    const link = await stripeClient.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${domain}/settings/business-account`,
      return_url: `${domain}/settings/business-account`,
      type: 'account_onboarding',
    })

    return { url: link.url, accountId: stripeAccountId }
  } catch (error: any) {
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.message || 'Failed to create account link',
    })
  }
})
