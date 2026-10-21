import { createError, defineEventHandler, getQuery } from 'h3'
import { requireAdmin } from '#auth/server/utils/sessions'
import { isPayPalCapture, paypalPaymentSummary } from '../../../utils/paypalCheckout'
import { findAdminOrder, refundBackend, storeError } from '../../../utils/storeAdmin'
import { repository } from '../../../licensing-host'

/**
 * GET /api/workspace/refunds/order?store=magento&id=|number=|reference= —
 * one store order for an admin: its lines and what's left to refund, the
 * PayPal payment behind it, and the licenses that payment bought.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const q = getQuery(event)
  const text = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, 100) : undefined)
  const lookup = { id: text(q.id), number: text(q.number), reference: text(q.reference) }
  if (!lookup.id && !lookup.number && !lookup.reference) throw createError({ statusCode: 400, statusMessage: 'Give an order number, id or payment reference' })
  const backend = refundBackend(String(q.store || 'magento'))
  const order = await findAdminOrder(backend, lookup).catch((e) => storeError(e, 'find the order'))
  if (!order) throw createError({ statusCode: 404, statusMessage: 'No such order' })

  let payment: Awaited<ReturnType<typeof paypalPaymentSummary>> | null = null
  if (isPayPalCapture(order.reference)) {
    payment = await paypalPaymentSummary(order.reference).catch(() => null)
  }
  const licenses = payment
    ? (await repository().findUserLicenseByPurchase(`paypal:${payment.id}`)).map((l) => ({ id: l.id, productId: l.productId, status: l.status }))
    : []
  return { store: backend.id, order, payment, licenses }
})
