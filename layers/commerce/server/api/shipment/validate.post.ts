import Joi from 'joi'
import { validateAddress } from '../../utils/shippo'
import { createError } from 'h3'

const schema = Joi.object({
  street1: Joi.string().required(),
  street2: Joi.string().optional(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  zip: Joi.string().required(),
  country: Joi.string().length(2).required(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { error, value } = schema.validate(body, {
      abortEarly: false,
    })

    if (error) {
      const messages = error.details.map((d) => d.message).join(', ')
      throw createError({
        statusCode: 400,
        statusMessage: `Validation error: ${messages}`,
      })
    }

    const result = await validateAddress(value)

    return { success: true, result }
  } catch (error: any) {
    console.error('[shippo:validate] Error:', error)

    if (error.statusCode) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.message,
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Address validation failed',
    })
  }
})
