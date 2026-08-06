import Joi from 'joi'
import { createShipment } from '../../utils/shippo'
import { createError } from 'h3'

const parcelSchema = Joi.object({
  length: Joi.string().required(),
  width: Joi.string().required(),
  height: Joi.string().required(),
  distance_unit: Joi.string().valid('in', 'cm').required(),
  weight: Joi.string().required(),
  mass_unit: Joi.string().valid('lb', 'kg').required(),
})

const addressSchema = Joi.object({
  name: Joi.string().optional(),
  company: Joi.string().optional(),
  street1: Joi.string().required(),
  street2: Joi.string().optional(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  zip: Joi.string().required(),
  country: Joi.string().length(2).required(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
})

const schema = Joi.object({
  address_from: addressSchema.required(),
  address_to: addressSchema.required(),
  parcels: Joi.array().items(parcelSchema).min(1).max(100).required(),
  async: Joi.boolean().default(false),
  label_file_type: Joi.string().valid(
    'PDF_4x6', 'PDF_4x8', 'PDF_A4', 'PDF_A5', 'PDF_A6', 'PDF', 'PNG', 'ZPLII',
  ).default('PDF_4x6'),
  extra: Joi.object().optional(),
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

    const result = await createShipment(value)

    return { success: true, rates: result.rates, shipmentId: result.object_id }
  } catch (error: any) {
    console.error('[shippo:rates] Error:', error)

    if (error.statusCode) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.message,
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Rate shopping failed',
    })
  }
})
