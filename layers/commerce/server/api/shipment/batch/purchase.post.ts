import Joi from 'joi'
import { purchaseBatch, getBatch } from '../../../utils/shippo'
import { createError } from 'h3'

const purchaseSchema = Joi.object({
  batchId: Joi.string().required(),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { error, value } = purchaseSchema.validate(body, { abortEarly: false })

    if (error) {
      const messages = error.details.map((d) => d.message).join(', ')
      throw createError({
        statusCode: 400,
        statusMessage: `Validation error: ${messages}`,
      })
    }

    const result = await purchaseBatch(value.batchId)

    return {
      success: true,
      batchId: result.object_id,
      status: result.object_status,
    }
  } catch (error: any) {
    console.error('[shippo:batch:purchase] Error:', error)

    if (error.statusCode) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.message,
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Batch purchase failed',
    })
  }
})
