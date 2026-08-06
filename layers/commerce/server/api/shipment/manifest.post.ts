import Joi from 'joi'
import { createManifest } from '../../utils/shippo'
import { createError } from 'h3'

const addressSchema = Joi.object({
  street1: Joi.string().required(),
  street2: Joi.string().optional(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  zip: Joi.string().required(),
  country: Joi.string().length(2).required(),
})

const schema = Joi.object({
  carrier_account: Joi.string().required(),
  shipment_date: Joi.string().optional(),
  address_from: addressSchema.required(),
  transactions: Joi.array().items(Joi.string()).optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { error, value } = schema.validate(body, { abortEarly: false })

    if (error) {
      const messages = error.details.map((d) => d.message).join(', ')
      throw createError({
        statusCode: 400,
        statusMessage: `Validation error: ${messages}`,
      })
    }

    const result = await createManifest(value)

    return {
      success: result.object_status === 'SUCCESS',
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
