import { createError, defineEventHandler, readBody } from 'h3'
import { requireAdmin } from '#auth/server/utils/sessions'
import { logAuditEvent } from '#auth/server/utils/audits'
import { getPayPalOrder, paypalRequest } from '../../../utils/paypal'
import { isPayPalCapture, paidCheckoutFromPayPal } from '../../../utils/paypalCheckout'
import { issueLicensesForPayment } from '../../../licensing-host/commerce-events'
import { repository } from '../../../licensing-host'

/**
 * POST /api/workspace/licenses/reissue `{ paymentId }` — runs the
 * paid-checkout license step again for one PayPal payment (its capture
 * id), e.g. when the webhook failed or a paid integration was added to the
 * store after the sale. Idempotent: licenses that exist are kept as they
 * are (a revoked one stays revoked); missing ones are issued.
 */
export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const body = await readBody(event).catch(() => null) as { paymentId?: unknown } | null
  const paymentId = typeof body?.paymentId === 'string' ? body.paymentId.trim().toUpperCase() : ''
  if (!isPayPalCapture(paymentId)) throw createError({ statusCode: 400, statusMessage: 'paymentId must be a PayPal payment (capture) id' })

  const capture = await paypalRequest<{ supplementary_data?: { related_ids?: { order_id?: string } } }>(`/v2/payments/captures/${paymentId}`).catch(() => null)
  const orderId = capture?.supplementary_data?.related_ids?.order_id
  const paid = orderId ? paidCheckoutFromPayPal(await getPayPalOrder(orderId)) : null
  if (!paid || paid.paymentId !== paymentId) throw createError({ statusCode: 404, statusMessage: 'No checkout for that payment' })
  if (paid.status !== 'paid') throw createError({ statusCode: 409, statusMessage: 'That payment hasn\'t cleared yet' })

  await issueLicensesForPayment(paid)
  const licenses = await repository().findUserLicenseByPurchase(`paypal:${paymentId}`)
  await logAuditEvent({
    id: '', userId: String(admin.id), category: 'store-admin', action: 'licenses_reissue', targetType: 'payment',
    targetId: paymentId, status: 'success', details: JSON.stringify({ licenses: licenses.map((l) => [l.id, l.status]) }),
  })
  return { paymentId, licenses: licenses.map((l) => ({ id: l.id, productId: l.productId, status: l.status })) }
})
