import { stripe } from '../../../../utils/stripe'

// Public: the Stripe Checkout return page (return.vue) hits this with the
// `session_id` from the redirect URL to show a success/processing/error
// state. Session ids are long unguessable tokens, but this endpoint is
// still unauthenticated, so it returns ONLY the coarse status — never
// customer PII (email/name/address), amounts, or line items.
export default defineEventHandler(async (event) => {
  const sessionId = getRouterParam(event, 'id') as string

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    return { status: session.status }
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid session ID'
    })
  }
})
