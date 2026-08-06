import Joi from 'joi'
import { searchPayPalTransactions } from '../../../utils/paypal'

const searchSchema = Joi.object({
  startTime: Joi.string().required(),
  endTime: Joi.string().required(),
  fields: Joi.array().items(Joi.string()).optional(),
})

export default defineEventHandler(async (event) => {
  try {
    if (event.node.req.method !== 'GET') {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method not allowed',
      })
    }

    const query = getQuery(event)
    const { error, value } = searchSchema.validate(query, {
      abortEarly: false,
    })

    if (error) {
      const messages = error.details.map((d) => d.message).join(', ')
      throw createError({
        statusCode: 400,
        statusMessage: `Validation error: ${messages}`,
      })
    }

    const { startTime, endTime, fields } = value
    const result = await searchPayPalTransactions(
      startTime,
      endTime,
      fields,
    )

    return { success: true, transactions: result }
  } catch (error: any) {
    console.error('PayPal search error:', error)

    if (error.statusCode) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.message,
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'PayPal transaction search failed',
    })
  }
})
