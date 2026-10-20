import { createError, defineEventHandler, readBody } from 'h3'
import { requireAdmin } from '#auth/server/utils/sessions'
import { logAuditEvent } from '#auth/server/utils/audits'
import { stripe } from '../../../utils/stripe'
import { issueLicensesForCheckout } from '../../../licensing-host/commerce-events'
import { repository } from '../../../licensing-host'

/**
 * POST /api/workspace/licenses/reissue `{ paymentIntentId }` — runs the
 * paid-checkout license step again for one Stripe payment, e.g. when the
 * webhook failed or a paid integration was added to the store after the
 * sale. Idempotent: licenses that exist are kept as they are (a revoked
 * one stays revoked); missing ones are issued.
 */
export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const body = await readBody(event).catch(() => null) as { paymentIntentId?: unknown } | null
  const paymentIntentId = typeof body?.paymentIntentId === 'string' ? body.paymentIntentId.trim() : ''
  if (!/^pi_[A-Za-z0-9]{8,100}$/.test(paymentIntentId)) throw createError({ statusCode: 400, statusMessage: 'paymentIntentId must be a Stripe payment id (pi_…)' })

  const sessions = await stripe.checkout.sessions.list({ payment_intent: paymentIntentId, limit: 1 })
  const session = sessions.data[0]
  if (!session) throw createError({ statusCode: 404, statusMessage: 'No checkout for that payment' })
  if (session.payment_status !== 'paid') throw createError({ statusCode: 409, statusMessage: `That checkout isn't paid (${session.payment_status})` })

  await issueLicensesForCheckout(session, paymentIntentId)
  const licenses = await repository().findUserLicenseByPurchase(`stripe:${paymentIntentId}`)
  await logAuditEvent({
    id: '', userId: String(admin.id), category: 'store-admin', action: 'licenses_reissue', targetType: 'payment',
    targetId: paymentIntentId, status: 'success', details: JSON.stringify({ licenses: licenses.map((l) => [l.id, l.status]) }),
  })
  return { paymentIntentId, licenses: licenses.map((l) => ({ id: l.id, productId: l.productId, status: l.status })) }
})
