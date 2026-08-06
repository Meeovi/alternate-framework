import Joi from 'joi'
import { getBatch } from '../../../utils/shippo'
import { createError } from 'h3'

const schema = Joi.object({
  batchId: Joi.string().required(),
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

    const result = await getBatch(value.batchId)

    return {
      success: true,
      batchId: result.object_id,
      status: result.object_status,
      errors: result.errors,
      shipmentCount: result.batch_shipments?.length ?? 0,
      shipments: result.batch_shipments,
    }
  } catch (error: any) {
    console.error('[shippo:batch:get] Error:', error)

    if (error.statusCode) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.message,
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Batch lookup failed',
    })
  }
})
