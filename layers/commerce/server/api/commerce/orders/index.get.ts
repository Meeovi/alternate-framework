import { defineEventHandler } from 'h3'
import { requireAuth } from '#auth/server/utils/sessions'
import { ordersFor } from '../../../utils/orders'

/**
 * GET /api/commerce/orders — the signed-in user's order history from every
 * commerce backend that keeps orders (e.g. Magento via adapter-magento),
 * plus the app's own Directus orders, newest first.
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  return { orders: await ordersFor(user as { id: string }) }
})
