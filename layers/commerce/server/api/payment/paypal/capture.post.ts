import Joi from 'joi'
import { getAuthSession } from '#auth/server/utils/sessions'
import { getPayPalOrder, PayPalError, PAYPAL_ORDER_ID } from '../../../utils/paypal'
import { captureAndFulfil, decodeCheckoutRef } from '../../../utils/paypalCheckout'

const schema = Joi.object({
  orderId: Joi.string().pattern(PAYPAL_ORDER_ID).required(),
}).unknown(true)

/**
 * POST /api/payment/paypal/capture — takes the payment the buyer just
 * approved and fulfils the order. An order made for a signed-in buyer can
 * only be captured by them; a guest's by whoever holds its id (the buyer's
 * own browser — capturing only completes what they approved).
 */
export default defineEventHandler(async (event) => {
  const { error, value } = schema.validate(await readBody(event))
  if (error) throw createError({ statusCode: 400, statusMessage: 'A PayPal order id is required' })

  // Same 404 for "not yours" and "doesn't exist", so ids can't be probed.
  const notFound = () => createError({ statusCode: 404, statusMessage: 'Order not found' })
  const existing = await getPayPalOrder(value.orderId).catch(() => null)
  if (!existing) throw notFound()
  const { buyerId } = decodeCheckoutRef(existing.purchase_units?.[0]?.custom_id)
  if (buyerId) {
    const session = await getAuthSession(event).catch(() => null)
    if (session?.user?.id !== buyerId) throw notFound()
  }

  try {
    const { paid, orderRecord } = await captureAndFulfil(value.orderId)
    if (!paid) throw createError({ statusCode: 502, statusMessage: 'PayPal did not take the payment. Please try again.' })
    return { status: paid.status, orderId: value.orderId, order: orderRecord }
  } catch (err) {
    if (err instanceof PayPalError) {
      console.error('[paypal] capture failed', value.orderId, err.message)
      // The buyer's funding source was declined: they can pick another.
      if (/INSTRUMENT_DECLINED|PAYER_ACTION_REQUIRED/.test(err.message)) {
        throw createError({ statusCode: 402, statusMessage: 'Your payment method was declined. Please choose another.', data: { retry: true } })
      }
      throw createError({ statusCode: 502, statusMessage: 'PayPal could not complete the payment. You have not been charged.' })
    }
    throw err
  }
})
