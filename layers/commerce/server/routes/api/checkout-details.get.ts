import { getPolarClient } from '../../utils/polar'

// Unused scaffolding — no frontend caller (grepped, none found). See
// checkout.get.ts for context on the disconnected Polar checkout surface.
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const checkoutId = query.checkoutId as string
  if (!checkoutId) return { checkout: null, product: null }
  try {
    const polar = getPolarClient()
    const checkout = await polar.checkouts.get({ id: checkoutId })
    let product = null
    if (checkout.productId) product = await polar.products.get({ id: checkout.productId })
    // Public (keyed only by the checkout id, which travels in URLs): return
    // status and product only — the full object carries the buyer's email,
    // name and billing address.
    return {
      checkout: { id: checkout.id, status: checkout.status },
      product: product ? { name: product.name, description: product.description } : null,
    }
  } catch (error) {
    console.error('Failed to fetch checkout details:', error)
    return { checkout: null, product: null }
  }
})