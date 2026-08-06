import { stripe } from '../../../utils/stripe'
import { createError, defineEventHandler, getQuery } from 'h3'

/**
 * GET /api/commerce/connect/products?accountId=...
 *
 * Lists products created under a Stripe Connect account.
 * Returns an array of product objects.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const accountId = typeof query.accountId === 'string' ? query.accountId.trim() : ''

  if (!accountId) {
    throw createError({ statusCode: 400, statusMessage: 'accountId query parameter is required' })
  }

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
