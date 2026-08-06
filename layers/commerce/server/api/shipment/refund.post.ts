import Joi from 'joi'
import { createRefund } from '../../utils/shippo'
import { createError } from 'h3'

const schema = Joi.object({
  transactionId: Joi.string().required(),
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

    const result = await createRefund(value.transactionId)

    return {
      success: true,
      refundId: result.object_id,
      status: result.status,
      transactionId: result.transaction,
    }
  } catch (error: any) {
    console.error('[shippo:refund] Error:', error)

    if (error.statusCode) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.message,
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Refund failed',
    })
  }
})
