import { createDirectus, rest, staticToken, createItem, readItems, updateItem } from '@directus/sdk'
import { centsToDollars } from './currency'
import { createTransaction, getRate } from './shippo'
import { triggerNovuWorkflow } from '#shared/server/utils/novu'
import { placeBackendOrders } from './backendOrders'
import { issueLicensesForPayment, revokeLicensesForPayment } from '../licensing-host/commerce-events'

/**
 * A completed checkout, whichever provider took the payment — what
 * fulfilment needs, and nothing provider-specific. Built from the
 * provider's own record of the payment (never from the client).
 */
export interface PaidCheckout {
  provider: 'paypal'
  /** The id refunds and disputes refer to (PayPal: the capture id). */
  paymentId: string
  /** The provider's order/session id, for support. */
  reference?: string
  /** 'pending' while funds are still clearing (e.g. an eCheck): only the
   *  payment is recorded until the provider reports it completed. */
  status: 'paid' | 'pending'
  currency: string
  totalCents: number
  itemCents: number
  shippingCents: number
  taxCents: number
  buyerId?: string | null
  email?: string | null
  name?: string | null
  phone?: string | null
  address?: {
    line1?: string | null
    line2?: string | null
    city?: string | null
    state?: string | null
    postcode?: string | null
    country?: string | null
  } | null
  lines: PaidLine[]
  shippoRateId?: string | null
  paidAt?: string | null
  /** Stored with the payment record for support (os_payments.metadata). */
  raw?: unknown
}

export interface PaidLine {
  /** Directus id, or `<backend>:<key>` (productRef.ts); null if unknown. */
  ref: string | null
  name: string
  quantity: number
  unitCents: number
  totalCents: number
}

// A privileged, static-token client — fulfilment writes orders, payments
// and download entitlements on the buyer's behalf, so it must not depend
// on any user's own Directus permissions.
function directusServer() {
  return createDirectus(process.env.DIRECTUS_URL!)
    .with(rest())
    .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))
}

/** The Directus order a payment created, if any. */
export async function findOrderForPayment(paymentId: string): Promise<{ id: number | string, grand_total: number } | null> {
  const rows = await directusServer().request(readItems('orders', {
    filter: { payment_id: { _eq: paymentId } },
    fields: ['id', 'grand_total'],
    limit: 1,
  })).catch(() => [])
  return (Array.isArray(rows) ? rows[0] : null) as { id: number | string, grand_total: number } | null
}

async function notifyPurchase(recipientId: string, orderId: string | number | null, amountCents: number, currency: string) {
  await triggerNovuWorkflow('purchase', {
    to: recipientId,
    payload: { subject: 'Order confirmed', orderId, amount: centsToDollars(amountCents), currency },
  })
}

async function sendEmail(params: { to: string, subject: string, html: string, text: string }): Promise<void> {
  if (!process.env.NUXT_RESEND_API_KEY) {
    console.warn('[checkout] NUXT_RESEND_API_KEY missing; skipping email')
    return
  }
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.NUXT_RESEND_API_KEY}` },
    body: JSON.stringify({ from: process.env.RESEND_FROM_EMAIL || 'no-reply@example.com', ...params }),
  })
  if (!response.ok) throw new Error(`Email delivery failed: ${response.status} ${await response.text().catch(() => '')}`)
}

/**
 * Fulfils a checkout once its payment is taken: records commerce-backend
 * lines there (Magento) and issues integration licences, writes the
 * payment and the Directus order, buys the Shippo label, notifies the
 * buyer and sends any download link.
 *
 * Idempotent on paymentId — capture and the provider's webhook both call
 * it, and a retry after a partial failure finishes what's missing.
 * Throws when something that must happen didn't (so the webhook retries).
 */
export async function fulfilPaidCheckout(paid: PaidCheckout): Promise<{ orderId: string | number | null }> {
  const directus = directusServer()

  // Magento orders and licences only once the money has actually cleared;
  // both dedupe on the payment id.
  if (paid.status === 'paid') {
    await placeBackendOrders(paid)
    await issueLicensesForPayment(paid)
  }

  const existingPayment = await directus.request(readItems('os_payments', {
    filter: { payment_id: { _eq: paid.paymentId } },
    fields: ['id'],
    limit: 1,
  }))
  if (!Array.isArray(existingPayment) || !existingPayment.length) {
    await directus.request(createItem('os_payments', {
      payment_provider: paid.provider,
      payment_id: paid.paymentId,
      payment_date: paid.paidAt || new Date().toISOString(),
      amount: centsToDollars(paid.totalCents),
      metadata: { reference: paid.reference, address: paid.address, provider: paid.raw },
      receipt_url: null,
    }))
  }

  // Funds still clearing: the order is made when the provider reports the
  // payment completed (its webhook calls this again with status 'paid').
  if (paid.status !== 'paid') return { orderId: null }

  // os_payments is written first, so the order check is separate: a retry
  // after a failed order write still creates the order.
  const existingOrder = await findOrderForPayment(paid.paymentId)
  if (existingOrder) return { orderId: existingOrder.id }

  // Lines a commerce backend owns were ordered there (above) and live in
  // its order history; a Directus order records only Directus lines.
  const directusLines = paid.lines.filter((line) => !line.ref || /^\d+$/.test(line.ref))
  if (!directusLines.length) {
    if (paid.buyerId) await notifyPurchase(paid.buyerId, paid.paymentId, paid.totalCents, paid.currency)
    return { orderId: null }
  }

  // A file attached to a purchased product is the digital-delivery signal.
  const productIds = directusLines.map((line) => line.ref).filter((id): id is string => !!id)
  let digitalFileId: string | null = null
  let downloadToken: string | null = null
  let downloadExpiresAt: string | null = null
  if (productIds.length) {
    const products = await directus.request(readItems('products', {
      filter: { id: { _in: productIds } },
      fields: ['id', 'file'],
    }))
    const digital = Array.isArray(products) ? products.filter((p: any) => !!p.file) : []
    if (digital.length) {
      // orders.file_id/download_token hold one asset; only the first
      // digital item is downloadable from the order.
      if (digital.length > 1) console.warn('[checkout] order has several digital items; only the first is downloadable', { paymentId: paid.paymentId })
      digitalFileId = (digital[0] as any).file ?? null
      downloadToken = crypto.randomUUID()
      downloadExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString()
    }
  }

  // The label is bought only now that payment has cleared — an abandoned
  // checkout must never leave a purchased (non-refundable) label.
  let shipment: { tracking_number?: string, tracking_url?: string, label_url?: string, carrier?: string } | null = null
  if (paid.shippoRateId) {
    try {
      const transaction = await createTransaction({
        rate: paid.shippoRateId,
        reference: paid.paymentId,
        metadata: `payment_id=${paid.paymentId}`,
      })
      if (transaction.status === 'SUCCESS') {
        const rate = await getRate(paid.shippoRateId).catch(() => null)
        // orders.label_url is varchar(255); Shippo's signed label links
        // often exceed it, and the whole order write would fail.
        const labelUrl = transaction.label_url
        shipment = {
          tracking_number: transaction.tracking_number,
          tracking_url: transaction.tracking_url_provider,
          label_url: labelUrl && labelUrl.length <= 255 ? labelUrl : undefined,
          carrier: rate?.provider,
        }
      } else {
        console.error('[checkout] Shippo label purchase did not succeed', transaction.messages)
      }
    } catch (error) {
      // The order must still exist so support can buy the label by hand.
      console.error('[checkout] Shippo label purchase failed', error)
    }
  }

  const [firstname, ...lastname] = (paid.name ?? '').trim().split(/\s+/)
  // orders' money columns are integer cents.
  const created = await directus.request(createItem('orders', {
    buyer_id: paid.buyerId || null,
    payment_provider: paid.provider,
    payment_id: paid.paymentId,
    payment_status: 'completed',
    fulfillment_status: shipment ? 'shipped' : digitalFileId ? 'delivered' : 'pending',
    grand_total: paid.totalCents,
    subtotal: paid.itemCents,
    tax_amount: paid.taxCents,
    shipping_amount: paid.shippingCents,
    total_paid: paid.totalCents,
    total_refunded: 0,
    total_due: 0,
    order_currency_code: paid.currency.toLowerCase(),
    customer_email: paid.email || null,
    customer_firstname: firstname || null,
    customer_lastname: lastname.join(' ') || null,
    line_items_snapshot: directusLines.map((line) => ({
      product_id: line.ref,
      name: line.name,
      quantity: line.quantity,
      unit_amount: centsToDollars(line.unitCents),
      subtotal: centsToDollars(line.totalCents),
    })),
    tracking_number: shipment?.tracking_number || null,
    tracking_url: shipment?.tracking_url || null,
    label_url: shipment?.label_url || null,
    shipment_carrier: shipment?.carrier || null,
    file_id: digitalFileId,
    download_token: downloadToken,
    download_expires_at: downloadExpiresAt,
  })) as { id?: string | number }
  const orderId = created?.id ?? null

  if (paid.buyerId) await notifyPurchase(paid.buyerId, orderId, paid.totalCents, paid.currency)

  if (digitalFileId && downloadToken && paid.email) {
    const url = `${process.env.NUXT_PUBLIC_SITE_URL}/api/download/${orderId}?token=${downloadToken}`
    await sendEmail({
      to: paid.email,
      subject: 'Your digital purchase is ready',
      html: `<h1>Your digital purchase is ready</h1><p>You can download it using the link below:</p><p><a href="${url}">Download now</a></p><p>This link expires in 7 days.</p>`,
      text: `Your digital purchase is ready.\nDownload: ${url}\nThis link expires in 7 days.`,
    }).catch((error) => {
      // The entitlement exists; the buyer can reach it from their orders.
      console.error('[checkout] download email failed', error)
    })
  }

  return { orderId }
}

/**
 * A refund went through: `refundedCents` is the total refunded so far.
 * A full refund marks the order refunded and revokes the licences it
 * bought; a partial one only records the amount.
 */
export async function recordRefund(provider: PaidCheckout['provider'], paymentId: string, refundedCents: number, paymentCents: number): Promise<void> {
  const full = refundedCents >= paymentCents
  if (full) await revokeLicensesForPayment(provider, paymentId)
  const order = await findOrderForPayment(paymentId)
  if (!order) return
  await directusServer().request(updateItem('orders', order.id, {
    ...(full && { payment_status: 'refunded' }),
    total_refunded: refundedCents,
  }))
}

/** The buyer opened a dispute on the payment. */
export async function recordDispute(paymentId: string): Promise<void> {
  const order = await findOrderForPayment(paymentId)
  if (order) await directusServer().request(updateItem('orders', order.id, { payment_status: 'disputed' }))
}
