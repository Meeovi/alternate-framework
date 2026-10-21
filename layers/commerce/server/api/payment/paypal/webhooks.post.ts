import { dollarsToCents } from '../../../utils/currency'
import { getPayPalOrder, paypalRequest, verifyPayPalWebhook } from '../../../utils/paypal'
import { paidCheckoutFromPayPal } from '../../../utils/paypalCheckout'
import { fulfilPaidCheckout, recordDispute, recordRefund } from '../../../utils/paidCheckout'

type WebhookEvent = { id?: string, event_type?: string, resource?: any }

const cents = (m?: { value?: string } | null) => (m?.value ? dollarsToCents(Number(m.value)) : 0)
/** The capture a refund belongs to (its `up` link). */
const captureOfRefund = (refund: any): string | null =>
  refund?.links?.find((l: any) => l.rel === 'up')?.href?.match(/\/captures\/([A-Z0-9]+)/)?.[1] ?? null

/**
 * POST /api/payment/paypal/webhooks — PayPal's notifications for this app
 * (register this URL in the PayPal developer dashboard and set the
 * webhook's id as NUXT_PAYPAL_WEBHOOK_ID). Only signature-verified events
 * are acted on; a failure answers 500 so PayPal retries.
 */
export default defineEventHandler(async (event) => {
  const raw = await readRawBody(event)
  let body: WebhookEvent
  try {
    body = JSON.parse(raw || '')
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid JSON' })
  }

  const headers = getHeaders(event)
  if (!(await verifyPayPalWebhook(headers, body))) {
    throw createError({ statusCode: 400, statusMessage: 'Webhook signature could not be verified' })
  }

  const resource = body.resource ?? {}
  try {
    switch (body.event_type) {
      // Covers captures that were pending (eChecks), and finishes any
      // fulfilment that failed straight after capture. Idempotent.
      case 'PAYMENT.CAPTURE.COMPLETED': {
        const orderId = resource.supplementary_data?.related_ids?.order_id
        if (!orderId) break
        const paid = paidCheckoutFromPayPal(await getPayPalOrder(orderId))
        if (paid?.status === 'paid') await fulfilPaidCheckout(paid)
        break
      }
      case 'PAYMENT.CAPTURE.REFUNDED': {
        const captureId = captureOfRefund(resource)
        if (!captureId) break
        const refunded = cents(resource.seller_payable_breakdown?.total_refunded_amount) || cents(resource.amount)
        const capture = await paypalRequest<{ amount?: { value: string } }>(`/v2/payments/captures/${captureId}`)
        await recordRefund('paypal', captureId, refunded, cents(capture.amount))
        break
      }
      // PayPal pulled the money back (e.g. a chargeback decided).
      case 'PAYMENT.CAPTURE.REVERSED': {
        if (resource.id) await recordRefund('paypal', resource.id, cents(resource.amount), cents(resource.amount))
        break
      }
      case 'CUSTOMER.DISPUTE.CREATED': {
        for (const tx of resource.disputed_transactions ?? []) {
          if (tx.seller_transaction_id) await recordDispute(tx.seller_transaction_id)
        }
        break
      }
      default:
        return { received: true, ignored: body.event_type }
    }
  } catch (err: any) {
    console.error(`[paypal] webhook ${body.event_type} ${body.id} failed`, err)
    throw createError({ statusCode: 500, statusMessage: 'Webhook processing failed' })
  }
  return { received: true }
})

