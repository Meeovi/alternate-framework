import { getPolarClient } from '../../utils/polar'

// Unused scaffolding — no frontend caller (grepped, none found). The
// storefront's real catalog is layers/commerce's `products` Directus
// collection, not Polar products. See checkout.get.ts for context.
export default defineEventHandler(async (event) => {
  const polar = getPolarClient()
  const products = await polar.products.list({ isArchived: false })
  return products?.result?.items ?? []
})