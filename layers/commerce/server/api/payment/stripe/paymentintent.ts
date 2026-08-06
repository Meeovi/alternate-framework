import Stripe from 'stripe'
import Joi from 'joi'
import { stripe } from '../../../utils/stripe'

const paymentIntentSchema = {
  amount: Joi.number().positive().required(),
  currency: Joi.string().length(3).lowercase().default('usd'),
  customerId: Joi.string().optional(),
  metadata: Joi.object().optional(),
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { error, value } = Joi.object(paymentIntentSchema).validate(body, {
      abortEarly: false,
    })

    if (error) {
      const messages = error.details.map((d: any) => d.message).join(', ')
      throw createError({
        statusCode: 400,
        statusMessage: `Validation error: ${messages}`,
      })
    }

    const { amount, currency, customerId, metadata } = value

    const params: Stripe.PaymentIntentCreateParams = {
      amount: Math.round(amount * 100),
      currency,
      automatic_payment_methods: { enabled: true },
      ...(customerId && { customer: customerId }),
      ...(metadata && { metadata }),
    }

    const paymentIntent = await stripe.paymentIntents.create(params)

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    }
  } catch (err: any) {
    console.error('PaymentIntent error:', err)

    if (err.statusCode) {
      throw createError({
        statusCode: err.statusCode,
        statusMessage: err.message,
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create payment intent',
    })
  }
})
