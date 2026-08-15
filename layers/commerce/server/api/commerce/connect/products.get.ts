import { stripe } from '../../../utils/stripe'
import { assertOwnsConnectAccount } from '../../../utils/connect-auth'
import { createError, defineEventHandler, getQuery } from 'h3'
import { requireAuth } from '#auth/server/utils/sessions'

/**
 * GET /api/commerce/connect/products?accountId=...
 *
 * Lists products created under a Stripe Connect account.
 * Returns an array of product objects.
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  if (!user.id) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  const query = getQuery(event)
  const accountId = typeof query.accountId === 'string' ? query.accountId.trim() : ''

  if (!accountId) {
    throw createError({ statusCode: 400, statusMessage: 'accountId query parameter is required' })
  }

  await assertOwnsConnectAccount(accountId, user.id)

  try {
    const products = await stripe.products.list(
      { limit: 100 },
      { stripeAccount: accountId }
    )

    return products.data.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      defaultPrice: product.default_price,
      images: product.images,
      metadata: product.metadata,
    }))
  } catch (error: any) {
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.message || 'Failed to fetch products',
    })
  }
})
