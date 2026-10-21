import { createError, defineEventHandler, getHeader, readBody, setResponseStatus } from 'h3'
import { requireAdmin } from '#auth/server/utils/sessions'
import { logAuditEvent } from '#auth/server/utils/audits'
import { PayPalError, refundPayPalCapture } from '../../../utils/paypal'
import { isPayPalCapture, paypalPaymentSummary } from '../../../utils/paypalCheckout'
import { refundBackend, storeError } from '../../../utils/storeAdmin'

/**
 * POST /api/workspace/refunds `{ store, orderId, items?: [{ key, qty }], reason? }`
 * with an `Idempotency-Key` header — refunds a store order an admin picked:
 *
 *  1. the money, through PayPal (the order's payment reference is the
 *     capture), for the chosen lines (all that's left without `items`);
 *  2. then an offline credit memo in the store for the same lines, so the
 *     store's books, seller commission and purchase history match.
 *
 * PayPal's PAYMENT.CAPTURE.REFUNDED webhook then does the rest (a full
 * refund of the payment revokes the licenses it bought). A retry with the
 * same key never refunds twice: PayPal returns the same refund for the same
 * request id. Once the credit memo is recorded the lines are no longer
 * refundable, so a later retry is refused before reaching PayPal. If the
 * credit memo fails after the money went back, the answer is 207 with the
 * reason — retrying with the same key records it.
 */
export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const key = getHeader(event, 'idempotency-key')?.trim()
  if (!key || !/^[\w-]{8,100}$/.test(key)) throw createError({ statusCode: 400, statusMessage: 'Send an Idempotency-Key header' })
  const body = await readBody(event).catch(() => null) as Record<string, unknown> | null
  const orderId = String(body?.orderId ?? '')
  if (!/^\d{1,20}$/.test(orderId)) throw createError({ statusCode: 400, statusMessage: 'orderId is required' })
  const reason = typeof body?.reason === 'string' ? body.reason.trim().slice(0, 500) : ''
  const rawItems = Array.isArray(body?.items) ? body!.items as Array<Record<string, unknown>> : []
  const items = rawItems.map((i) => ({ key: String(i?.key ?? ''), qty: Number(i?.qty) }))
  if (items.some((i) => !/^\d{1,20}$/.test(i.key) || !(i.qty > 0) || i.qty > 10_000)) {
    throw createError({ statusCode: 400, statusMessage: 'Each item needs a line key and a quantity' })
  }

  const backend = refundBackend(String(body?.store || 'magento'))
  const order = await backend.adminOrder(orderId).catch((e) => storeError(e, 'find the order'))
  if (!order) throw createError({ statusCode: 404, statusMessage: 'No such order' })
  if (!isPayPalCapture(order.reference)) {
    throw createError({ statusCode: 409, statusMessage: 'This order wasn\'t paid through the app\'s PayPal checkout — refund it where it was paid' })
  }
  const captureId = order.reference

  // The lines and amount (store prices are in currency units, here in cents).
  const lines = items.length ? items : order.refundable.map((l) => ({ key: l.key, qty: l.qty }))
  if (!lines.length) throw createError({ statusCode: 409, statusMessage: 'Nothing left to refund on this order' })
  let cents = 0
  for (const item of lines) {
    const line = order.refundable.find((l) => l.key === item.key)
    if (!line || item.qty > line.qty) throw createError({ statusCode: 400, statusMessage: `Line ${item.key} can't be refunded ${item.qty}×` })
    cents += Math.round(line.unit_amount * item.qty * 100)
  }

  const payment = await paypalPaymentSummary(captureId).catch(() => null)
  if (!payment) throw createError({ statusCode: 502, statusMessage: 'PayPal could not find the payment for this order' })
  if (payment.currency.toUpperCase() !== order.order_currency_code.toUpperCase()) {
    throw createError({ statusCode: 409, statusMessage: `The payment is in ${payment.currency.toUpperCase()}, the order in ${order.order_currency_code}` })
  }
  const remaining = payment.amount - payment.refunded

  let refund
  try {
    refund = await refundPayPalCapture(captureId, {
      // Never more than is left on the payment.
      amount: (remaining > 0 ? Math.min(cents, remaining) : cents) / 100,
      currency: payment.currency,
      note: reason || `Refund for order ${order.number}`,
      requestId: `workspace-refund:${key}`,
    })
  } catch (error) {
    const message = error instanceof PayPalError ? error.message : (error as Error).message
    throw createError({ statusCode: 402, statusMessage: `PayPal refused the refund: ${message}`.slice(0, 300) })
  }
  if (refund.status === 'FAILED' || refund.status === 'CANCELLED') {
    throw createError({ statusCode: 402, statusMessage: `PayPal refund ${refund.id} ${refund.status.toLowerCase()}` })
  }
  const refundCents = Math.round(Number(refund.amount?.value ?? 0) * 100) || cents

  const audit = (status: string, details: Record<string, unknown>) => logAuditEvent({
    id: '', userId: String(admin.id), category: 'store-admin', action: 'order_refund', targetType: `${backend.id}_order`,
    targetId: order.number, status, details: JSON.stringify({ refund: refund.id, amount: refundCents, lines, reason, ...details }),
  })
  const result = { refundId: refund.id, amount: refundCents, currency: payment.currency, refundStatus: refund.status.toLowerCase() }

  try {
    const { creditMemoId } = await backend.refundOrder({
      orderId: order.id,
      items: lines,
      comment: [`Refunded in PayPal (${refund.id}) from Meeovi Workspace.`, reason].filter(Boolean).join(' '),
    })
    await audit('success', { creditMemoId })
    return { ...result, creditMemoId }
  } catch (error) {
    const message = String((error as Error)?.message ?? error).slice(0, 300)
    await audit('partial', { creditMemoError: message })
    setResponseStatus(event, 207)
    return { ...result, creditMemoId: null, creditMemoError: `The money was refunded, but the store's credit memo failed: ${message}. Retry to record it.` }
  }
})
