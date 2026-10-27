import { defineEventHandler, getQuery } from 'h3'
import { requireAuth } from '#auth/server/utils/sessions'
import { ordersFor } from '../../../utils/orders'
import { PAID, productsForRefs, purchasedRefs, readLimit } from '../../../utils/purchasedProducts'

/**
 * GET /api/commerce/purchases/mine?limit=12 — the products on the signed-in
 * user's own paid orders (every source: the app's and the store's), most
 * recent first, each once.
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const orders = (await ordersFor(user as { id: string })).filter((order) => PAID.has(String(order.payment_status)))
  return { products: await productsForRefs(purchasedRefs(orders), readLimit(getQuery(event).limit)) }
})
