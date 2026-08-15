import { readItems } from '@directus/sdk'
import { createError, defineEventHandler, getQuery } from 'h3'
import { getTrack } from '../../utils/shippo'
import { requireAuth } from '#auth/server/utils/sessions'
import { getDirectusFacade } from '../../utils/directusClient'

// Tracking is only visible to the signed-in buyer who placed the order —
// the `orders` collection has no reliably-readable email field to check
// against instead, and an order id alone is guessable, so this is the
// same session-ownership check used by the digital download endpoint.
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const directusServer = getDirectusFacade()

  const query = getQuery(event)
  const orderId = String(query.orderId || '').trim()

  if (!orderId) {
    throw createError({ statusCode: 400, statusMessage: 'orderId is required' })
  }

  const orders = await directusServer.request(
    readItems('orders', {
      filter: {
        id: { _eq: orderId },
        user_id: { _eq: user.id },
      },
      fields: ['id', 'date_created', 'payment_status', 'tracking_number', 'tracking_url', 'shipment_carrier', 'shipment_status', 'fulfillment_status', 'line_items_snapshot'],
      limit: 1,
    }),
  )

  const order = Array.isArray(orders) ? orders[0] : null
  if (!order) {
    throw createError({ statusCode: 404, statusMessage: 'No matching order found' })
  }

  let live: Awaited<ReturnType<typeof getTrack>> | null = null
  if (order.tracking_number && order.shipment_carrier) {
    live = await getTrack(order.shipment_carrier, order.tracking_number).catch(() => null)
  }

  return {
    orderId: order.id,
    dateCreated: order.date_created,
    paymentStatus: order.payment_status,
    fulfillmentStatus: order.fulfillment_status,
    trackingNumber: order.tracking_number,
    trackingUrl: order.tracking_url,
    carrier: order.shipment_carrier,
    status: live?.tracking_status?.status || order.shipment_status || null,
    statusDetails: live?.tracking_status?.status_details || null,
    history: live?.tracking_history || [],
    eta: live?.eta || null,
    lineItems: order.line_items_snapshot || [],
  }
})
