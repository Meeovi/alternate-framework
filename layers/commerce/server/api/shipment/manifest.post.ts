import Joi from 'joi'
import { createManifest } from '../../utils/shippo'
import { requireShippingAdmin } from '../../utils/shipping-admin'
import { getShippingOrigin } from '../../utils/shipping-origin'
import { createError } from 'h3'

const schema = Joi.object({
  carrier_account: Joi.string().required(),
  shipment_date: Joi.string().optional(),
  transactions: Joi.array().items(Joi.string()).optional(),
})

export default defineEventHandler(async (event) => {
  try {
    // Closing a carrier manifest is an ops/batch action, not something a
    // shopper ever does — only trusted backend callers may hit it.
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

    const result = await createManifest({
      ...value,
      address_from: getShippingOrigin(),
    })

    return {
      success: result.status === 'SUCCESS',
      manifestId: result.object_id,
      shipmentCount: result.shipment_count,
      labelUrls: result.label_url,
    }
  } catch (error: any) {
    console.error('[shippo:manifest] Error:', error)

    if (error.statusCode) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.message,
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Manifest creation failed',
    })
  }
})
