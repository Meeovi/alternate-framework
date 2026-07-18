import { stripe } from '../../utils/stripe'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const sessionId = query.session_id as string
  if (!sessionId) return { checkout: null, product: null }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'line_items.data.price.product'],
    })

    const lineItem = session.line_items?.data?.[0]
    const product = lineItem?.price?.product

    const checkout = {
      id: session.id,
      status: session.status,
      customer_email: session.customer_details?.email,
    }

    const productData =
      product && typeof product === 'object' && !('deleted' in product)
        ? { name: product.name, description: product.description }
        : null

    return { checkout, product: productData }
  } catch (error) {
    console.error('Failed to fetch checkout session:', error)
    return { checkout: null, product: null }
  }
})
