import Joi from 'joi'
import { createTransaction } from '../../utils/shippo'
import { requireShippingAdmin } from '../../utils/shipping-admin'
import { createError } from 'h3'

const schema = Joi.object({
  rate: Joi.string().required(),
  label_file_type: Joi.string().valid(
    'PDF_4x6', 'PDF_4x8', 'PDF_A4', 'PDF_A5', 'PDF_A6', 'PDF', 'PNG', 'ZPLII',
  ).default('PDF_4x6'),
  async: Joi.boolean().default(false),
  reference: Joi.string().optional(),
  metadata: Joi.object().optional(),
  extra: Joi.object().optional(),
}).required()

export default defineEventHandler(async (event) => {
  try {
    // This actually spends money against the merchant's Shippo balance —
    // only trusted backend/ops callers may hit it directly. The buyer-
    // facing checkout flow purchases labels via the Stripe webhook after
    // payment clears, never through this endpoint.
    requireShippingAdmin(event)

    const body = await readBody(event)
    const { error, value } = schema.validate(body, { abortEarly: false })

    if (error) {
      const messages = error.details.map((d) => d.message).join(', ')
      throw createError({
        statusCode: 400,
        statusMessage: `Validation error: ${messages}`,
      })
    }

    const result = await createTransaction(value)

    const response = {
      success: result.object_status === 'SUCCESS',
      transactionId: result.object_id,
      trackingNumber: result.tracking_number,
      labelUrl: result.label_url,
      trackingUrl: result.tracking_url_provider,
      eta: result.eta,
      messages: result.messages,
    }

    return response
  } catch (error: any) {
    console.error('[shippo:label] Error:', error)

    if (error.statusCode) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.message,
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Label purchase failed',
    })
  }
})
