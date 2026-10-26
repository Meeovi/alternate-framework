import { dollarsToCents } from './currency'
import { getPayPalOrder, paypalRequest, PayPalError, type PayPalOrder } from './paypal'
import { fulfilPaidCheckout, type PaidCheckout } from './paidCheckout'

type CheckoutRef = { buyerId: string | null, shippoRateId: string | null, backendTaxCents: Record<string, number> }

/**
 * What a PayPal order carries for fulfilment in its purchase unit's
 * custom_id (max 127 chars): the buyer, the Shippo rate charged for, and
 * the tax charged on each commerce backend's lines (`t=magento:124`).
 * Set server-side when the order is created, never by the client.
 */
export function encodeCheckoutRef(ref: { buyerId: string | null, shippoRateId: string | null, backendTaxCents?: Record<string, number> }): string | undefined {
  const tax = Object.entries(ref.backendTaxCents ?? {}).filter(([, cents]) => cents > 0).map(([id, cents]) => `${id}:${cents}`).join(',')
  const parts = [ref.buyerId && `b=${ref.buyerId}`, ref.shippoRateId && `r=${ref.shippoRateId}`, tax && `t=${tax}`].filter(Boolean) as string[]
  const encoded = parts.join(';')
  // Truncating would lose what fulfilment needs to record the order.
  if (encoded.length > 127) throw new Error(`Checkout reference too long (${encoded.length} chars)`)
  return encoded || undefined
}

export function decodeCheckoutRef(customId: string | undefined | null): CheckoutRef {
  const out: CheckoutRef = { buyerId: null, shippoRateId: null, backendTaxCents: {} }
  for (const part of (customId ?? '').split(';')) {
    const [key, value] = [part.slice(0, 2), part.slice(2)]
    if (key === 'b=' && value) out.buyerId = value
    if (key === 'r=' && value) out.shippoRateId = value
    if (key === 't=' && value) {
      for (const entry of value.split(',')) {
        const [id, cents] = [entry.slice(0, entry.lastIndexOf(':')), Number(entry.slice(entry.lastIndexOf(':') + 1))]
        if (id && Number.isInteger(cents) && cents > 0) out.backendTaxCents[id] = cents
      }
    }
  }
  return out
}

/** The captured order as a PaidCheckout (null until it has a capture). */
export function paidCheckoutFromPayPal(order: PayPalOrder): PaidCheckout | null {
  const unit = order.purchase_units?.[0]
  const capture = unit?.payments?.captures?.[0]
  if (!unit || !capture) return null
  const breakdown = unit.amount?.breakdown
  const cents = (m?: { value: string }) => (m ? dollarsToCents(Number(m.value)) : 0)
  const ref = decodeCheckoutRef(unit.custom_id)
  const shipTo = unit.shipping?.address
  const payerName = [order.payer?.name?.given_name, order.payer?.name?.surname].filter(Boolean).join(' ')
  return {
    provider: 'paypal',
    paymentId: capture.id,
    reference: order.id,
    status: capture.status === 'COMPLETED' ? 'paid' : 'pending',
    currency: (capture.amount?.currency_code || unit.amount?.currency_code || 'USD').toLowerCase(),
    totalCents: cents(capture.amount),
    itemCents: cents(breakdown?.item_total),
    shippingCents: cents(breakdown?.shipping),
    taxCents: cents(breakdown?.tax_total),
    buyerId: ref.buyerId,
    backendTaxCents: ref.backendTaxCents,
    email: order.payer?.email_address ?? null,
    name: unit.shipping?.name?.full_name || payerName || null,
    phone: order.payer?.phone?.phone_number?.national_number ?? null,
    address: shipTo ? {
      line1: shipTo.address_line_1, line2: shipTo.address_line_2, city: shipTo.admin_area_2,
      state: shipTo.admin_area_1, postcode: shipTo.postal_code, country: shipTo.country_code,
    } : null,
    lines: (unit.items ?? []).map((item) => {
      const quantity = Number(item.quantity) || 1
      const unitCents = cents(item.unit_amount)
      return { ref: item.sku || null, name: item.name, quantity, unitCents, totalCents: unitCents * quantity }
    }),
    shippoRateId: ref.shippoRateId,
    paidAt: capture.create_time ?? null,
    raw: { orderId: order.id, captureId: capture.id, status: capture.status, payerId: order.payer?.payer_id },
  }
}

/**
 * Captures an approved order (or reads it, if it was captured already —
 * a retried request or the webhook got there first) and fulfils it.
 *
 * Once the money is taken a fulfilment failure doesn't throw: the buyer
 * has paid and must see that. It's logged, and PayPal's
 * PAYMENT.CAPTURE.COMPLETED webhook runs the (idempotent) fulfilment again.
 */
export async function captureAndFulfil(orderId: string): Promise<{ order: PayPalOrder, paid: PaidCheckout | null, orderRecord: string | number | null }> {
  let order: PayPalOrder
  try {
    order = await paypalRequest<PayPalOrder>(`/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      // The same capture whenever it's retried.
      requestId: `capture-${orderId}`,
      body: {},
    })
  } catch (err) {
    if (!(err instanceof PayPalError) || !/ORDER_ALREADY_CAPTURED/.test(err.message)) throw err
    order = await getPayPalOrder(orderId)
  }
  const paid = paidCheckoutFromPayPal(order)
  if (!paid) return { order, paid: null, orderRecord: null }
  try {
    const { orderId: orderRecord } = await fulfilPaidCheckout(paid)
    return { order, paid, orderRecord }
  } catch (err) {
    console.error(`[paypal] payment ${paid.paymentId} (order ${orderId}) captured but fulfilment failed; the webhook will retry`, err)
    return { order, paid, orderRecord: null }
  }
}

/** A store order's payment reference that is a PayPal capture id (17
 *  upper-case letters and digits; never all digits like an order number). */
export const isPayPalCapture = (reference: string | null | undefined): reference is string =>
  !!reference && /^(?=[0-9]*[A-Z])[A-Z0-9]{12,40}$/.test(reference)

/**
 * A capture's amount and how much of it has been refunded (in cents) —
 * the refunds are listed on the order the capture belongs to.
 */
export async function paypalPaymentSummary(captureId: string): Promise<{ provider: 'paypal', id: string, amount: number, refunded: number, currency: string, status: string }> {
  const capture = await paypalRequest<{ id: string, status: string, amount: { value: string, currency_code: string }, supplementary_data?: { related_ids?: { order_id?: string } } }>(`/v2/payments/captures/${captureId}`)
  const orderId = capture.supplementary_data?.related_ids?.order_id
  const order = orderId ? await getPayPalOrder(orderId).catch(() => null) : null
  const refunds = ((order?.purchase_units?.[0]?.payments as { refunds?: Array<{ status: string, amount?: { value: string } }> } | undefined)?.refunds ?? [])
  return {
    provider: 'paypal',
    id: capture.id,
    amount: dollarsToCents(Number(capture.amount.value)),
    refunded: refunds.filter((r) => r.status === 'COMPLETED').reduce((sum, r) => sum + dollarsToCents(Number(r.amount?.value ?? 0)), 0),
    currency: capture.amount.currency_code.toLowerCase(),
    status: capture.status,
  }
}
