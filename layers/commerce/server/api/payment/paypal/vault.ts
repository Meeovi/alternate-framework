import Joi from 'joi'
import {
  createPayPalVaultToken,
  listPayPalVaultTokens,
  deletePayPalVaultToken,
} from '../../../utils/paypal'

const createTokenSchema = Joi.object({
  tokenType: Joi.string().valid('CARD', 'PAYPAL').required(),
  tokenDetails: Joi.object().unknown().required(),
})

const listTokensSchema = Joi.object({
  customerId: Joi.string().required(),
})

const deleteTokenSchema = Joi.object({
  tokenId: Joi.string().required(),
})

export default defineEventHandler(async (event) => {
  try {
    const method = event.node.req.method

    if (method === 'POST') {
      const body = await readBody(event)
      const { error, value } = createTokenSchema.validate(body, {
        abortEarly: false,
      })

      if (error) {
        const messages = error.details.map((d) => d.message).join(', ')
        throw createError({
          statusCode: 400,
          statusMessage: `Validation error: ${messages}`,
        })
      }

      const { tokenType, tokenDetails } = value
      const token = await createPayPalVaultToken(tokenType, tokenDetails)

      return { success: true, token }
    }

    if (method === 'GET') {
      const query = getQuery(event)
      const { error, value } = listTokensSchema.validate(query, {
        abortEarly: false,
      })

      if (error) {
        const messages = error.details.map((d) => d.message).join(', ')
        throw createError({
          statusCode: 400,
          statusMessage: `Validation error: ${messages}`,
        })
      }

      const { customerId } = value
      const tokens = await listPayPalVaultTokens(customerId)

      return { success: true, tokens }
    }

    if (method === 'DELETE') {
      const body = await readBody(event)
      const { error, value } = deleteTokenSchema.validate(body, {
        abortEarly: false,
      })

      if (error) {
        const messages = error.details.map((d) => d.message).join(', ')
        throw createError({
          statusCode: 400,
          statusMessage: `Validation error: ${messages}`,
        })
      }

      const { tokenId } = value
      await deletePayPalVaultToken(tokenId)

      return { success: true, tokenId }
    }

    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed',
    })
  } catch (error: any) {
    console.error('PayPal vault error:', error)

    if (error.statusCode) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.message,
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'PayPal vault operation failed',
    })
  }
})
