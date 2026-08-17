import Joi from 'joi'
import {
  createPayPalSubscription,
  suspendPayPalSubscription,
  reactivatePayPalSubscription,
  cancelPayPalSubscription,
} from '../../../utils/paypal'

const createSchema = Joi.object({
  planId: Joi.string().required(),
  subscriberEmail: Joi.string().email().required(),
  customId: Joi.string().optional(),
})

const manageSchema = Joi.object({
  subscriptionId: Joi.string().required(),
  action: Joi.string().valid('suspend', 'reactivate').default('reactivate'),
  reason: Joi.string().optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const method = event.node.req.method

    if (method === 'POST') {
      const body = await readBody(event)
      const { error, value } = createSchema.validate(body, {
        abortEarly: false,
      })

      if (error) {
        const messages = error.details.map((d) => d.message).join(', ')
        throw createError({
          statusCode: 400,
          statusMessage: `Validation error: ${messages}`,
        })
      }

      const { planId, subscriberEmail, customId } = value
      const subscription = await createPayPalSubscription(
        planId,
        subscriberEmail,
        customId,
      )

      return { success: true, subscription }
    }

    if (method === 'PUT') {
      const body = await readBody(event)
      const { error, value } = manageSchema.validate(body, {
        abortEarly: false,
      })

      if (error) {
        const messages = error.details.map((d) => d.message).join(', ')
        throw createError({
          statusCode: 400,
          statusMessage: `Validation error: ${messages}`,
        })
      }

      const { subscriptionId, action, reason } = value
      if (action === 'suspend') {
        await suspendPayPalSubscription(subscriptionId, reason)
      } else {
        await reactivatePayPalSubscription(subscriptionId, reason)
      }

      // PayPal's suspend/activate endpoints return 204 No Content — there
      // is no updated subscription resource to echo back here.
      return { success: true, subscriptionId, action }
    }

    if (method === 'DELETE') {
      const body = await readBody(event)
      const { error, value } = manageSchema.validate(body, {
        abortEarly: false,
      })

      if (error) {
        const messages = error.details.map((d) => d.message).join(', ')
        throw createError({
          statusCode: 400,
          statusMessage: `Validation error: ${messages}`,
        })
      }

      const { subscriptionId, reason } = value
      await cancelPayPalSubscription(subscriptionId, reason)

      return { success: true, subscriptionId }
    }

    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed',
    })
  } catch (error: any) {
    console.error('PayPal subscriptions error:', error)

    if (error.statusCode) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.message,
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'PayPal subscriptions operation failed',
    })
  }
})
