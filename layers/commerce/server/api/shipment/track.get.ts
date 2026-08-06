import Joi from 'joi'
import { getTrack } from '../../utils/shippo'
import { createError } from 'h3'

const schema = Joi.object({
  carrier: Joi.string().required(),
  trackingNumber: Joi.string().required(),
})

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { error, value } = schema.validate(query, { abortEarly: false })

    if (error) {
      const messages = error.details.map((d) => d.message).join(', ')
      throw createError({
        statusCode: 400,
        statusMessage: `Validation error: ${messages}`,
      })
    }

    const result = await getTrack(value.carrier, value.trackingNumber)

    return {
      success: true,
      trackingNumber: result.tracking_number,
      carrier: result.carrier,
      status: result.tracking_status,
      history: result.tracking_history,
      eta: result.eta,
      trackingUrl: result.tracking_url_provider,
    }
  } catch (error: any) {
    console.error('[shippo:track] Error:', error)

    if (error.statusCode) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.message,
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Tracking lookup failed',
    })
  }
})
