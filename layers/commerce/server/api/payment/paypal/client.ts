import { getBrowserSafeClientToken } from '../../../utils/paypal'

export default defineEventHandler(async (event) => {
  try {
    if (event.node.req.method !== 'GET') {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method not allowed',
      })
    }

    const clientToken = await getBrowserSafeClientToken()

    return { success: true, clientToken }
  } catch (error: any) {
    console.error('PayPal client token error:', error)

    if (error.statusCode) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.message,
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get PayPal client token',
    })
  }
})
