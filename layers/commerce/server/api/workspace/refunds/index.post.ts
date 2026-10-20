import { createError, defineEventHandler, getHeader, readBody, setResponseStatus } from 'h3'
import { requireAdmin } from '#auth/server/utils/sessions'
import { logAuditEvent } from '#auth/server/utils/audits'
import { stripe } from '../../../utils/stripe'
import { refundBackend, storeError } from '../../../utils/storeAdmin'

/**
 * POST /api/workspace/refunds `{ store, orderId, items?: [{ key, qty }], reason? }`
 * with an `Idempotency-Key` header — refunds a store order an admin picked:
 *
 *  1. the money, through Stripe (the order's payment reference), for the
 *     chosen lines (all that's left without `items`);
 *  2. then an offline credit memo in the store for the same lines, so the
 *     store's books, seller commission and purchase history match.
 *
 * Stripe's charge.refunded webhook then does the rest (a full refund of the
 * payment revokes the licenses it bought). A retry with the same key never
 * refunds twice: Stripe returns the same refund, and the credit memo id is
 * kept on it, so a retry only records what's missing. If the credit memo
 * fails after the money went back, the answer is 207 with the reason —
 * retrying with the same key records it.
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
  if (!order.reference?.startsWith('pi_')) {
    throw createError({ statusCode: 409, statusMessage: 'This order wasn\'t paid through the app\'s Stripe checkout — refund it in the store itself' })
  }

  // The lines and amount (store prices are in currency units, Stripe in cents).
  const lines = items.length ? items : order.refundable.map((l) => ({ key: l.key, qty: l.qty }))
  if (!lines.length) throw createError({ statusCode: 409, statusMessage: 'Nothing left to refund on this order' })
  let cents = 0
  for (const item of lines) {
    const line = order.refundable.find((l) => l.key === item.key)
    if (!line || item.qty > line.qty) throw createError({ statusCode: 400, statusMessage: `Line ${item.key} can't be refunded ${item.qty}×` })
    cents += Math.round(line.unit_amount * item.qty * 100)
  }

  const pi = await stripe.paymentIntents.retrieve(order.reference, { expand: ['latest_charge'] })
  const charge = typeof pi.latest_charge === 'object' ? pi.latest_charge : null
  if (pi.currency.toUpperCase() !== order.order_currency_code.toUpperCase()) {
    throw createError({ statusCode: 409, statusMessage: `The payment is in ${pi.currency.toUpperCase()}, the order in ${order.order_currency_code}` })
  }
  const remaining = (charge?.amount ?? pi.amount) - (charge?.amount_refunded ?? 0)

  let refund
  try {
    refund = await stripe.refunds.create({
      payment_intent: pi.id,
      // Never more than is left on the payment (a retry after a partial
      // failure asks for the same amount and gets the same refund back).
      amount: remaining > 0 ? Math.min(cents, remaining) : cents,
      reason: 'requested_by_customer',
      metadata: {
        store: backend.id,
        order_id: order.id,
        order_number: order.number,
        lines: JSON.stringify(lines).slice(0, 450),
        refunded_by: String(admin.id),
      },
    }, { idempotencyKey: `workspace-refund:${key}` })
  } catch (error) {
    throw createError({ statusCode: 402, statusMessage: `Stripe refused the refund: ${(error as Error).message}`.slice(0, 300) })
  }
  if (refund.status === 'failed' || refund.status === 'canceled') {
    throw createError({ statusCode: 402, statusMessage: `Stripe refund ${refund.id} ${refund.status}` })
  }

  const audit = (status: string, details: Record<string, unknown>) => logAuditEvent({
    id: '', userId: String(admin.id), category: 'store-admin', action: 'order_refund', targetType: `${backend.id}_order`,
    targetId: order.number, status, details: JSON.stringify({ refund: refund.id, amount: refund.amount, lines, reason, ...details }),
  })
  const result = { refundId: refund.id, amount: refund.amount, currency: refund.currency, refundStatus: refund.status }

  // A retry after everything went through: already recorded.
  if (refund.metadata?.credit_memo) return { ...result, creditMemoId: refund.metadata.credit_memo }

  try {
    const { creditMemoId } = await backend.refundOrder({
      orderId: order.id,
      items: lines,
      comment: [`Refunded in Stripe (${refund.id}) from Meeovi Workspace.`, reason].filter(Boolean).join(' '),
    })
    await stripe.refunds.update(refund.id, { metadata: { credit_memo: creditMemoId } })
    await audit('success', { creditMemoId })
    return { ...result, creditMemoId }
  } catch (error) {
    const message = String((error as Error)?.message ?? error).slice(0, 300)
    await audit('partial', { creditMemoError: message })
    setResponseStatus(event, 207)
    return { ...result, creditMemoId: null, creditMemoError: `The money was refunded, but the store's credit memo failed: ${message}. Retry to record it.` }
  }
})
