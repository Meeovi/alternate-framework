import { createDirectus, rest, staticToken, readItem } from '@directus/sdk'
import { createPayPalOrder } from '../../../utils/paypal'
import Joi from 'joi'

// A privileged client used only to look up each item's authoritative price —
// never trust a client-supplied amount, since that would let a caller
// dictate what they get charged.
const directus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

const createOrderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      id: Joi.string().required(),
      quantity: Joi.number().integer().min(1).max(100).required(),
    })
  ).min(1).max(100).required(),
  currency: Joi.string().length(3).lowercase().default('usd'),
  description: Joi.string().optional(),
  idempotencyKey: Joi.string().optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { error, value } = createOrderSchema.validate(body, {
      abortEarly: false,
    })

    if (error) {
      const messages = error.details.map((d) => d.message).join(', ')
      throw createError({
        statusCode: 400,
        statusMessage: `Validation error: ${messages}`,
      })
    }

    const { items, currency, idempotencyKey } = value

    const amount = await items.reduce(async (totalPromise: Promise<number>, item: { id: string; quantity: number }) => {
      const total = await totalPromise
      const product = await directus.request(
        readItem('products', item.id, { fields: ['id', 'price'] })
      ).catch(() => null) as { price?: number | string } | null

      // Directus serializes decimal columns as strings, so this must be
      // coerced rather than checked with typeof.
      const productPrice = Number(product?.price)

      if (!product || !Number.isFinite(productPrice)) {
        throw createError({ statusCode: 400, statusMessage: `Unknown or unpriced product: ${item.id}` })
      }

      return total + productPrice * item.quantity
    }, Promise.resolve(0))

    const order = await createPayPalOrder(amount, currency, idempotencyKey)

    return { success: true, order }
  } catch (error: any) {
    console.error('PayPal orders error:', error)

    if (error.statusCode) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.message,
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'PayPal order creation failed',
    })
  }
})
