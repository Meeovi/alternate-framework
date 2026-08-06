import { stripe } from '../../../../utils/stripe'

export default defineEventHandler(async (event) => {
  const sessionId = getRouterParam(event, 'id') as string
  
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    return { status: session.status, customer_email: session.customer_details?.email }
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid session ID'
    })
  }
})