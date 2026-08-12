import Joi from 'joi'
import { createWebhook, listWebhooks } from '../../utils/shippo'
import { requireShippingAdmin } from '../../utils/shipping-admin'
import { createError } from 'h3'

const createSchema = Joi.object({
  url: Joi.string().uri().required(),
  event: Joi.string().valid('track_updated').required(),
  active: Joi.boolean().default(true),
})

export default defineEventHandler(async (event) => {
  try {
    // Registering/listing webhooks reconfigures where the merchant's live
    // Shippo account sends shipment events — an anonymous caller must
    // never be able to do this (they could redirect tracking events to
    // their own server, or enumerate existing webhook URLs).
    requireShippingAdmin(event)

    const method = event.node.req.method

    if (method === 'POST') {
      const body = await readBody(event)
      const { error, value } = createSchema.validate(body, { abortEarly: false })

      if (error) {
        const messages = error.details.map((d) => d.message).join(', ')
        throw createError({
          statusCode: 400,
          statusMessage: `Validation error: ${messages}`,
        })
      }

      const result = await createWebhook(value)

      return {
        success: true,
        webhookId: result.object_id,
        url: result.url,
        event: result.event,
        active: result.active,
      }
    }

    if (method === 'GET') {
      const result = await listWebhooks()

      return { success: true, webhooks: result.results }
    }

    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed',
    })
  } catch (error: any) {
    console.error('[shippo:webhook] Error:', error)

    if (error.statusCode) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.message,
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Webhook operation failed',
    })
  }
})
