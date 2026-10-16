import { capturePayPalOrder, getPayPalOrderOwner, PAYPAL_ORDER_ID } from '../../../utils/paypal'
import { requireAuth } from '#auth/server/utils/sessions'
import Joi from 'joi'

const captureSchema = Joi.object({
  orderId: Joi.string().required(),
  idempotencyKey: Joi.string().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

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

    // Only the user the order was created for may capture it (and see the
    // captured order, which carries the payer's name, email and address).
    // Same 404 for "not yours" and "doesn't exist", so ids can't be probed.
    if (!PAYPAL_ORDER_ID.test(orderId) || (await getPayPalOrderOwner(orderId)) !== user.id) {
      throw createError({ statusCode: 404, statusMessage: 'Order not found' })
    }
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
