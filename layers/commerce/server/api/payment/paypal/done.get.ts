import { getPayPalOrder, PAYPAL_ORDER_ID } from '../../../utils/paypal'

/**
 * GET /api/payment/paypal/done?order=<PayPal order id> — what /success
 * shows. No ownership check (guests land there too), so nothing personal:
 * only the order's status and what was bought.
 */
export default defineEventHandler(async (event) => {
  const orderId = String(getQuery(event).order ?? '')
  if (!PAYPAL_ORDER_ID.test(orderId)) return { checkout: null, product: null }

  const order = await getPayPalOrder(orderId).catch(() => null)
  if (!order) return { checkout: null, product: null }
  const unit = order.purchase_units?.[0]
  const items = unit?.items ?? []
  const capture = unit?.payments?.captures?.[0]
  return {
    checkout: { id: order.id, status: capture?.status === 'COMPLETED' ? 'complete' : capture ? 'pending' : order.status.toLowerCase() },
    product: items.length
      ? { name: items[0]!.name, description: items.length > 1 ? `and ${items.length - 1} more item${items.length > 2 ? 's' : ''}` : null }
      : null,
  }
})
