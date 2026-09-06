import { capturePayPalOrder } from '../../../utils/paypal'
import { requireAuth } from '#auth/server/utils/sessions'
import Joi from 'joi'

const captureSchema = Joi.object({
  orderId: Joi.string().required(),
  idempotencyKey: Joi.string().optional(),
})

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  try {
    const body = await readBody(event)
    const { error, value } = captureSchema.validate(body, {
      abortEarly: false,
    })

    if (error) {
      const messages = error.details.map((d) => d.message).join(', ')
      throw createError({
        statusCode: 400,
        statusMessage: `Validation error: ${messages}`,
      })
    }

    const { orderId, idempotencyKey } = value
    const result = await capturePayPalOrder(orderId, idempotencyKey)

    return { success: true, order: result }
  } catch (error: any) {
    console.error('PayPal capture error:', error)

    if (error.statusCode) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.message,
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'PayPal order capture failed',
    })
  }
})
