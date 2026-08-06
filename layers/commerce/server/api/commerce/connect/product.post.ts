import { stripe } from '../../../utils/stripe'
import { createError, defineEventHandler, readBody } from 'h3'

/**
 * POST /api/commerce/connect/product
 *
 * Creates a product under a Stripe Connect account.
 *
 * Body: { accountId: string, productName: string, productDescription?: string, productPrice: number }
 *   productPrice is in cents.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { accountId, productName, productDescription, productPrice } = body as {
    accountId?: string
    productName?: string
    productDescription?: string
    productPrice?: number
  }

  const safeAccountId = typeof accountId === 'string' ? accountId.trim() : ''
  const safeName = typeof productName === 'string' ? productName.trim() : ''
  const safeDescription = typeof productDescription === 'string' ? productDescription.trim() : ''
  const priceNum = typeof productPrice === 'number' ? productPrice : NaN

  if (!safeAccountId) {
    throw createError({ statusCode: 400, statusMessage: 'accountId is required' })
  }
  if (!safeName) {
    throw createError({ statusCode: 400, statusMessage: 'productName is required' })
  }
  if (!Number.isFinite(priceNum) || priceNum < 0) {
    throw createError({ statusCode: 400, statusMessage: 'productPrice must be a non-negative number (cents)' })
  }

  try {
    // Create the product under the connected account
    const product = await stripe.products.create(
      {
        name: safeName,
        ...(safeDescription ? { description: safeDescription } : {}),
      },
      { stripeAccount: safeAccountId }
    )

    // Create a default price for the product
    const price = await stripe.prices.create(
      {
        product: product.id,
        unit_amount: Math.round(priceNum),
        currency: 'usd',
      },
      { stripeAccount: safeAccountId }
    )

    return {
      productId: product.id,
      priceId: price.id,
    }
  } catch (error: any) {
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.message || 'Failed to create product',
    })
  }
})
