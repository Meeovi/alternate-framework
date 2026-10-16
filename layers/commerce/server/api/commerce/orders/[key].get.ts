import { createError, defineEventHandler, getRouterParam } from 'h3'
import { requireAuth } from '#auth/server/utils/sessions'
import { orderFor } from '../../../utils/orders'

/**
 * GET /api/commerce/orders/:key — one of the signed-in user's orders
 * (`<backend>:<id>`, or a Directus order id). Someone else's order is 404.
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const key = decodeURIComponent(String(getRouterParam(event, 'key') ?? ''))
  const order = key ? await orderFor(user as { id: string }, key) : null
  if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })
  return { order }
})
