import Stripe from 'stripe'
import { createDirectus, rest, staticToken, createItem, readItems, updateItem } from '@directus/sdk'
import { centsToDollars } from '../../../utils/currency'
import { stripe } from '../../../utils/stripe'
import { createTransaction, getRate } from '../../../utils/shippo'

// A privileged, static-token client — webhook fulfillment writes orders,
// payments, and fulfillment tokens on behalf of the buyer, so it must not
// depend on any user's own Directus permissions.
const directusServer = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN!))

const relevantEvents = [
  'checkout.session.async_payment_failed',
  'checkout.session.async_payment_succeeded',
  'checkout.session.completed',
]

interface ListingMetadata {
  listing_type?: 'digital' | 'service' | 'local'
  listing_id?: string
  buyer_id?: string
}

function normalizeMetadata(
  metadata?: Stripe.Checkout.Session['metadata'],
): ListingMetadata {
  if (!metadata || typeof metadata !== 'object') return {}
  const out: ListingMetadata = {}
  for (const [key, value] of Object.entries(metadata)) {
    if (key === 'listing_type' && typeof value === 'string') {
      out.listing_type = value as ListingMetadata['listing_type']
    } else if (key === 'listing_id' && typeof value === 'string') {
      out.listing_id = value
    } else if (key === 'buyer_id' && typeof value === 'string') {
      out.buyer_id = value
    }
  }
  return out
}

async function sendConfirmationEmail(params: {
  to: string
  subject: string
  html: string
  text: string
}): Promise<void> {
  // Vue-email templates are rendered at build time; for runtime webhook
  // fulfillment we send a minimal transactional HTML payload through the
  // project's email transport. Swap this block for your actual mailer.
  const { to, subject, html, text } = params

  if (!process.env.RESEND_API_KEY) {
    console.warn('[webhook] RESEND_API_KEY missing; skipping confirmation email')
    return
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || 'no-reply@example.com',
      to,
      subject,
      html,
      text,
    }),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Email delivery failed: ${response.status} ${body}`)
  }
}

function buildDigitalFulfillmentEmail(listingId: string, downloadToken: string): { html: string; text: string } {
  const downloadUrl = `${process.env.NUXT_PUBLIC_SITE_URL}/api/download/${listingId}?token=${downloadToken}`
  return {
    html: `
      <h1>Your digital asset is ready</h1>
      <p>Thank you for your purchase. You can download your asset using the link below:</p>
      <p><a href="${downloadUrl}">Download now</a></p>
      <p>This link is time-limited. If it expires, please contact support.</p>`,
    text: `Your digital asset is ready.\nDownload: ${downloadUrl}\nThis link is time-limited.`,
  }
}

function buildServiceConfirmationEmail(listingId: string, startTime: string): { html: string; text: string } {
  return {
    html: `
      <h1>Booking confirmed</h1>
      <p>Your service appointment has been confirmed.</p>
      <p><strong>Listing:</strong> ${listingId}</p>
      <p><strong>Start time:</strong> ${startTime}</p>
      <p>We've locked the appointment slot in your calendar.</p>`,
    text: `Booking confirmed.\nListing: ${listingId}\nStart time: ${startTime}`,
  }
}

function buildLocalBusinessEmail(listingId: string): { html: string; text: string } {
  return {
    html: `
      <h1>Order confirmed</h1>
      <p>Your local business order has been received.</p>
      <p><strong>Listing:</strong> ${listingId}</p>
      <p>The seller will contact you with pickup/delivery details.</p>`,
    text: `Order confirmed.\nListing: ${listingId}\nThe seller will contact you with pickup/delivery details.`,
  }
}

export default defineEventHandler(async (event) => {
  const sig = getHeader(event, 'stripe-signature')
  const { stripeWebhookSecret } = useRuntimeConfig()

  if (!sig || !stripeWebhookSecret) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing stripe-signature header or webhook secret',
    })
  }

  const rawBody = await readRawBody(event)
  if (!rawBody) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Empty request body',
    })
  }

  let stripeEvent: Stripe.Event
  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, stripeWebhookSecret)
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: `Webhook signature verification failed: ${(error as Error).message}`,
    })
  }

  if (!relevantEvents.includes(stripeEvent.type)) {
    return { received: true, ignored: stripeEvent.type }
  }

  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const checkoutSession = stripeEvent.data.object as Stripe.Checkout.Session
        const paymentIntentId = checkoutSession.payment_intent as string | null

        if (checkoutSession.mode !== 'payment' || !paymentIntentId) {
          break
        }

        // Idempotency guard
        const existing = await directusServer.request(
          readItems('os_payments', {
            filter: { stripe_payment_id: { _eq: paymentIntentId } },
            limit: 1,
          }),
        )
        if (Array.isArray(existing) && existing.length > 0) {
          break
        }

        const paymentIntentResponse = await stripe.paymentIntents.retrieve(paymentIntentId, {
          expand: ['charges'],
        }) as Stripe.PaymentIntent & {
          charges?: { data: Stripe.Charge[] }
        }

        const metadata = checkoutSession.metadata
        const contact_id = metadata?.contact_id
        const organization_id = metadata?.organization_id
        const invoice_id = metadata?.invoice_id
        const charge = paymentIntentResponse?.charges?.data[0]
        const createdSeconds = charge?.created ?? 0
        const buyerEmail = checkoutSession.customer_details?.email ?? charge?.billing_details?.email ?? ''

        await directusServer.request(
          createItem('os_payments', {
            organization: organization_id,
            contact: contact_id,
            invoice: invoice_id,
            payment_date: new Date(createdSeconds * 1000).toISOString(),
            stripe_payment_id: paymentIntentId,
            amount: centsToDollars(checkoutSession.amount_total ?? 0),
            metadata: { checkoutSession, paymentIntent: paymentIntentResponse },
            receipt_url: charge?.receipt_url ?? null,
          }),
        )

        // Fulfillment by listing type — this branch is for marketplace
        // listings sold by third-party sellers (Stripe Connect), separate
        // from the standard storefront cart purchase handled in the `else`
        // branch below. Session metadata is now built entirely server-side
        // in checkout-session.post.ts and never sets listing_type/
        // listing_id, so this only fires for a Checkout Session created
        // outside this app (e.g. directly via the Stripe API/Dashboard) —
        // there is currently no in-app marketplace purchase flow that
        // reaches it. digital_fulfillment_tokens (below) is also not read
        // by the digital-download endpoint (server/api/download/[orderId]
        // .get.ts, which reads orders.file_id/download_token instead) —
        // these two are not yet wired together.
        const listingMeta = normalizeMetadata(metadata)
        const { listing_type, listing_id, buyer_id } = listingMeta

        if (listing_type === 'digital' && listing_id) {
          // Generate a short-lived fulfillment token
          const downloadToken = crypto.randomUUID()
          await directusServer.request(
            createItem('digital_fulfillment_tokens', {
              listing_id,
              buyer_id: buyer_id || checkoutSession.customer,
              token: downloadToken,
              expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24h
              payment_intent_id: paymentIntentId,
            }),
          )

          if (buyerEmail) {
            const { html, text } = buildDigitalFulfillmentEmail(listing_id, downloadToken)
            await sendConfirmationEmail({ to: buyerEmail, subject: 'Your digital asset is ready', html, text })
          }
        } else if (listing_type === 'service' && listing_id) {
          // Lock the calendar appointment slot via Directus
          // Assumes a `calendar_events` collection is provisioned for the SVAR calendar
          const startTime = metadata?.start_time as string | undefined
          if (startTime) {
            await directusServer.request(
              updateItem('calendar_events', listing_id, {
                status: 'booked',
                booking_payment_intent: paymentIntentId,
                buyer_id: buyer_id || checkoutSession.customer,
              }),
            )
          }

          if (buyerEmail) {
            const { html, text } = buildServiceConfirmationEmail(
              listing_id,
              startTime || 'TBD',
            )
            await sendConfirmationEmail({ to: buyerEmail, subject: 'Booking confirmed', html, text })
          }
        } else if (listing_type === 'local' && listing_id) {
          if (buyerEmail) {
            const { html, text } = buildLocalBusinessEmail(listing_id)
            await sendConfirmationEmail({ to: buyerEmail, subject: 'Order confirmed', html, text })
          }
        } else {
          // Standard multi-item cart purchase (no marketplace listing_type)
          // — this is the path a normal storefront checkout takes, and it
          // previously never wrote an order at all.
          //
          // Idempotency here is checked against `orders` specifically, not
          // just the `os_payments` guard above — os_payments is written
          // before this point, so if order creation (or the Shippo label
          // purchase before it) throws, Stripe's retry would otherwise
          // short-circuit on the os_payments check and silently never
          // create the order at all despite the customer having been
          // charged. Checking here means a retry after a partial failure
          // still creates the missing order instead of skipping it.
          const existingOrder = await directusServer.request(
            readItems('orders', {
              filter: { stripe_payment_id: { _eq: paymentIntentId } },
              fields: ['id'],
              limit: 1,
            }),
          )
          if (Array.isArray(existingOrder) && existingOrder.length > 0) {
            break
          }

          const lineItems = await stripe.checkout.sessions.listLineItems(checkoutSession.id, {
            expand: ['data.price.product'],
          })

          const items = lineItems.data.map((lineItem) => {
            const product = lineItem.price?.product
            const productMetadata =
              product && typeof product === 'object' && !('deleted' in product && product.deleted)
                ? (product as Stripe.Product).metadata
                : undefined

            return {
              product_id: productMetadata?.internal_product_id ?? null,
              name: lineItem.description,
              quantity: lineItem.quantity,
              unit_amount: centsToDollars(lineItem.price?.unit_amount ?? 0),
              subtotal: centsToDollars(lineItem.amount_total ?? 0),
            }
          })

          // Buy the actual shipping label now that payment has cleared —
          // never before, since an abandoned/failed checkout must not
          // result in a purchased (and non-refundable) label.
          const shippoRateId = metadata?.shippo_rate_id
          let shipment: {
            tracking_number?: string
            tracking_url?: string
            label_url?: string
            carrier?: string
          } | null = null

          if (shippoRateId) {
            try {
              const transaction = await createTransaction({
                rate: shippoRateId,
                reference: paymentIntentId,
                metadata: { payment_intent_id: paymentIntentId },
              })

              if (transaction.object_status === 'SUCCESS') {
                const rate = await getRate(shippoRateId).catch(() => null)
                shipment = {
                  tracking_number: transaction.tracking_number,
                  tracking_url: transaction.tracking_url_provider,
                  label_url: transaction.label_url,
                  carrier: rate?.provider,
                }
              } else {
                console.error('[webhook] Shippo label purchase did not succeed', transaction.messages)
              }
            } catch (shippoError) {
              // Don't fail the whole webhook (and retry payment fulfillment
              // forever) just because label purchase failed — the order
              // still needs to exist so support can buy the label manually.
              console.error('[webhook] Shippo label purchase failed', shippoError)
            }
          }

          // Field names below match the real `orders` collection, which
          // mirrors a Magento sales_order schema (grand_total,
          // order_currency_code, customer_email, date_created are Magento's
          // own columns) — a handful of fields with no Magento equivalent
          // (stripe_payment_id, line_items_snapshot, tracking_*,
          // shipment_*, fulfillment_status) were added specifically for
          // this integration.
          await directusServer.request(
            createItem('orders', {
              user_id: buyer_id || null,
              stripe_payment_id: paymentIntentId,
              payment_status: 'completed',
              fulfillment_status: shipment ? 'shipped' : 'pending',
              grand_total: centsToDollars(checkoutSession.amount_total ?? 0),
              order_currency_code: checkoutSession.currency,
              customer_email: buyerEmail || null,
              line_items_snapshot: items,
              tracking_number: shipment?.tracking_number || null,
              tracking_url: shipment?.tracking_url || null,
              label_url: shipment?.label_url || null,
              shipment_carrier: shipment?.carrier || null,
            }),
          )
        }

        break
      }

      case 'checkout.session.async_payment_failed':
      case 'checkout.session.async_payment_succeeded':
        // Payment state is reconciled on checkout.session.completed
        break

      default:
        throw new Error('Unhandled relevant event!')
    }
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      statusMessage: err.message,
    })
  }

  return {
    received: true,
  }
})
