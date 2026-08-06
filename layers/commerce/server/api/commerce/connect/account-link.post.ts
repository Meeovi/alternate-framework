import { stripe } from '../../../utils/stripe'
import { createError, defineEventHandler, readBody } from 'h3'

/**
 * POST /api/commerce/connect/account-link
 *
 * Creates an account link (onboarding or refresh) for a Stripe Express
 * account. Returns the URL the frontend should redirect the user to.
 *
 * Body: { accountId: string }
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const isDev = process.env.NODE_ENV !== 'production'
  const domain =
    process.env.DOMAIN ||
    (config.public?.siteUrl as string | undefined) ||
    (isDev ? 'http://localhost:3000' : '')

  if (!domain) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Site URL is not configured (set DOMAIN or NUXT_PUBLIC_SITE_URL)',
    })
  }

  const body = await readBody(event)
  const accountId = typeof body?.accountId === 'string' ? body.accountId.trim() : ''

  if (!accountId) {
    throw createError({ statusCode: 400, statusMessage: 'accountId is required' })
  }

  try {
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${domain}/commerce/connect/dashboard`,
      return_url: `${domain}/commerce/connect/dashboard`,
      type: 'account_onboarding',
    })

    return { url: link.url }
  } catch (error: any) {
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.message || 'Failed to create account link',
    })
  }
})
