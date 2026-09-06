import Joi from 'joi'
import {
  createPayPalSetupToken,
  createPayPalPaymentToken,
  listPayPalPaymentTokens,
  deletePayPalPaymentToken,
} from '../../../utils/paypal'
import { requireAuth } from '#auth/server/utils/sessions'

// PayPal's real Payment Method Tokens API (v3) vaults a payment method in
// two steps: create a setup token (POST), then — once the payer has
// approved it, for a PayPal payment_source — swap it for a reusable
// payment token (PUT). This route exposes both steps rather than a single
// fabricated "create vault token" call.
const createSetupTokenSchema = Joi.object({
  paymentSource: Joi.object().unknown().required(),
  customerId: Joi.string().optional(),
})

const createPaymentTokenSchema = Joi.object({
  setupTokenId: Joi.string().required(),
})

const listTokensSchema = Joi.object({
  customerId: Joi.string().required(),
})

const deleteTokenSchema = Joi.object({
  tokenId: Joi.string().required(),
})

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  try {
    const method = event.node.req.method

    if (method === 'POST') {
      const body = await readBody(event)

      // Two POST shapes on the same route, distinguished by which field
      // is present: { paymentSource, customerId? } starts a new vaulting
      // flow (step 1); { setupTokenId } completes an already-approved one
      // (step 2).
      if (body?.setupTokenId) {
        const { error, value } = createPaymentTokenSchema.validate(body, { abortEarly: false })
        if (error) {
          throw createError({ statusCode: 400, statusMessage: `Validation error: ${error.details.map((d) => d.message).join(', ')}` })
        }
        const token = await createPayPalPaymentToken(value.setupTokenId)
        return { success: true, token }
      }

      const { error, value } = createSetupTokenSchema.validate(body, { abortEarly: false })
      if (error) {
        throw createError({ statusCode: 400, statusMessage: `Validation error: ${error.details.map((d) => d.message).join(', ')}` })
      }
      const setupToken = await createPayPalSetupToken(value.paymentSource, value.customerId)
      return { success: true, setupToken }
    }

    if (method === 'GET') {
      const query = getQuery(event)
      const { error, value } = listTokensSchema.validate(query, { abortEarly: false })
      if (error) {
        throw createError({ statusCode: 400, statusMessage: `Validation error: ${error.details.map((d) => d.message).join(', ')}` })
      }
      const tokens = await listPayPalPaymentTokens(value.customerId)
      return { success: true, tokens }
    }

    if (method === 'DELETE') {
      const body = await readBody(event)
      const { error, value } = deleteTokenSchema.validate(body, { abortEarly: false })
      if (error) {
        throw createError({ statusCode: 400, statusMessage: `Validation error: ${error.details.map((d) => d.message).join(', ')}` })
      }
      await deletePayPalPaymentToken(value.tokenId)
      return { success: true, tokenId: value.tokenId }
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
