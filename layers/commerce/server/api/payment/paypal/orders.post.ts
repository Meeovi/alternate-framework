import { createPayPalOrder } from '../../../utils/paypal'
import Joi from 'joi'

const createOrderSchema = Joi.object({
  amount: Joi.number().positive().required(),
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

    const { amount, currency, idempotencyKey } = value
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
