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
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

const relevantEvents = [
  'checkout.session.async_payment_failed',
  'checkout.session.async_payment_succeeded',
  'checkout.session.completed',
  'charge.refunded',
  'charge.dispute.created',
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

  // The real deployed env only sets NUXT_RESEND_API_KEY (confirmed) — the
  // unprefixed RESEND_API_KEY this previously checked is never set, so
  // every confirmation/fulfillment email (including digital-download
  // links) silently no-opped in production regardless of anything else
  // being correct.
  if (!process.env.NUXT_RESEND_API_KEY) {
    console.warn('[webhook] NUXT_RESEND_API_KEY missing; skipping confirmation email')
    return
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.NUXT_RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      // No RESEND_FROM_EMAIL-equivalent var exists in the real env either
      // — falls back to a placeholder sender until one is configured.
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

        // Informational only (see checkout-session.post.ts) — the buyer's
        // own shipping address, already collected once for the Shippo rate
        // quote. orders.shipping_addresses is an M2M relation to an
        // address collection this app's token can't introspect the fields
        // of, so rather than risk a malformed nested-create there, this
        // rides along in os_payments.metadata where support/ops can still
        // see it — better than the previous behavior of discarding it
        // entirely after the rate quote.
        const shippingAddress = {
          name: metadata?.shipping_name,
          street1: metadata?.shipping_street1,
          street2: metadata?.shipping_street2,
          city: metadata?.shipping_city,
          state: metadata?.shipping_state,
          zip: metadata?.shipping_zip,
          country: metadata?.shipping_country,
          phone: metadata?.shipping_phone,
        }
        const hasShippingAddress = Object.values(shippingAddress).some(Boolean)

        await directusServer.request(
          createItem('os_payments', {
            organization: organization_id,
            contact: contact_id,
            invoice: invoice_id,
            payment_date: new Date(createdSeconds * 1000).toISOString(),
            stripe_payment_id: paymentIntentId,
            amount: centsToDollars(checkoutSession.amount_total ?? 0),
            metadata: {
              checkoutSession,
              paymentIntent: paymentIntentResponse,
              ...(hasShippingAddress && { shippingAddress }),
            },
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

          // total_details (tax/discount/shipping breakdown) isn't always
          // populated on the event's embedded session object, so re-fetch
          // rather than guessing at values.
          const fullSession = await stripe.checkout.sessions.retrieve(checkoutSession.id)

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

          // Digital fulfillment for the standard cart checkout — distinct
          // from the marketplace listing_type branch above, which has no
          // reachable purchase flow of its own. `products.type` doesn't
          // exist as a field (confirmed against the live schema) — the
          // real vocabulary is a `product_types` M2M relation, and it's
          // sparsely/inconsistently populated on real product rows (some
          // products with a real `file` attached have no product_types at
          // all). Attaching a file to a product is itself the fulfillment
          // signal here, so detection keys directly on `file` being set
          // rather than on a type tag.
          const purchasedProductIds = items
            .map((item) => item.product_id)
            .filter((id): id is string => !!id)

          let digitalFileId: string | null = null
          let downloadToken: string | null = null
          let downloadExpiresAt: string | null = null

          if (purchasedProductIds.length > 0) {
            const purchasedProducts = await directusServer.request(
              readItems('products', {
                filter: { id: { _in: purchasedProductIds } },
                fields: ['id', 'file'],
              }),
            )
            const digitalProducts = Array.isArray(purchasedProducts)
              ? purchasedProducts.filter((p: any) => !!p.file)
              : []

            if (digitalProducts.length > 0) {
              // orders.file_id/download_token are single-asset fields — an
              // order with more than one digital item can only expose the
              // first for download here. A real multi-item digital order
              // needs a join table instead of two scalar columns; flagging
              // rather than silently dropping the rest.
              if (digitalProducts.length > 1) {
                console.warn(
                  '[webhook] Order has multiple digital items; only the first is downloadable via orders.file_id',
                  { paymentIntentId, productIds: purchasedProductIds },
                )
              }
              digitalFileId = digitalProducts[0].file ?? null
              downloadToken = crypto.randomUUID()
              downloadExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString()
            }
          }

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

          // Stripe's own payment_status is the source of truth — 'unpaid'
          // happens with delayed payment methods where the session
          // completes before funds actually clear. Hardcoding 'completed'
          // here would mark unpaid orders as paid.
          const orderPaymentStatus = checkoutSession.payment_status === 'unpaid' ? 'pending' : 'completed'

          const buyerName = checkoutSession.customer_details?.name?.trim() ?? ''
          const [customerFirstname, ...customerLastnameParts] = buyerName ? buyerName.split(/\s+/) : ['', '']
          const customerLastname = customerLastnameParts.join(' ')

          // orders.grand_total/subtotal/tax_amount/shipping_amount/
          // total_paid/total_refunded/total_due are `integer` columns in
          // the live schema (confirmed by direct write — a decimal dollar
          // value throws "invalid input syntax for type integer"), unlike
          // os_payments.amount which is `decimal` and correctly uses
          // centsToDollars above. Stripe's own amounts are already integer
          // cents, so these are written raw/unconverted.
          const orderGrandTotal = checkoutSession.amount_total ?? 0
          // total_paid reflects funds actually captured — for 'unpaid'
          // (delayed payment methods still clearing), nothing has been
          // captured yet; async_payment_succeeded reconciles this later.
          const orderTotalPaid = orderPaymentStatus === 'completed' ? orderGrandTotal : 0

          // Field names below match the real `orders` collection, which
          // mirrors a Magento sales_order schema (grand_total,
          // order_currency_code, customer_email, customer_firstname,
          // customer_lastname, subtotal, tax_amount, shipping_amount,
          // total_paid, total_due, date_created are Magento's own columns)
          // — a handful of fields with no Magento equivalent
          // (stripe_payment_id, line_items_snapshot, tracking_*,
          // shipment_*, fulfillment_status) were added specifically for
          // this integration. tax_amount will read 0 for every order until
          // Stripe Tax (automatic_tax) is enabled in checkout-session.post.ts
          // — no tax is currently being calculated or collected. The more
          // Magento-specific tax-compensation/base-currency fields
          // (shipping_incl_tax, shipping_tax_amount,
          // shipping_discount_tax_compensation_amount, base_*,
          // shipping_address_id) have no real source of truth in this
          // Stripe-based flow and are intentionally left unset rather than
          // populated with fabricated values.
          const createdOrder = await directusServer.request(
            createItem('orders', {
              user_id: buyer_id || null,
              stripe_payment_id: paymentIntentId,
              payment_status: orderPaymentStatus,
              // A shipping label being purchased takes precedence (it means
              // at least one physical item shipped); a fully-digital order
              // with nothing to ship is delivered as soon as it's paid.
              fulfillment_status: shipment ? 'shipped' : digitalFileId ? 'delivered' : 'pending',
              grand_total: orderGrandTotal,
              subtotal: fullSession.amount_subtotal ?? checkoutSession.amount_total ?? 0,
              tax_amount: fullSession.total_details?.amount_tax ?? 0,
              shipping_amount: fullSession.shipping_cost?.amount_total ?? 0,
              total_paid: orderTotalPaid,
              total_refunded: 0,
              total_due: orderGrandTotal - orderTotalPaid,
              order_currency_code: checkoutSession.currency,
              customer_email: buyerEmail || null,
              customer_firstname: customerFirstname || null,
              customer_lastname: customerLastname || null,
              line_items_snapshot: items,
              tracking_number: shipment?.tracking_number || null,
              tracking_url: shipment?.tracking_url || null,
              label_url: shipment?.label_url || null,
              shipment_carrier: shipment?.carrier || null,
              file_id: digitalFileId,
              download_token: downloadToken,
              download_expires_at: downloadExpiresAt,
            }),
          )

          if (digitalFileId && downloadToken && buyerEmail) {
            const orderId = (createdOrder as any)?.id
            const downloadUrl = `${process.env.NUXT_PUBLIC_SITE_URL}/api/download/${orderId}?token=${downloadToken}`
            await sendConfirmationEmail({
              to: buyerEmail,
              subject: 'Your digital purchase is ready',
              html: `<h1>Your digital purchase is ready</h1><p>You can download it using the link below:</p><p><a href="${downloadUrl}">Download now</a></p><p>This link expires in 7 days.</p>`,
              text: `Your digital purchase is ready.\nDownload: ${downloadUrl}\nThis link expires in 7 days.`,
            }).catch((emailError) => {
              // The order and its download entitlement already exist — a
              // failed email must not fail the whole webhook (and trigger a
              // Stripe retry that would re-run label purchase, etc). The
              // customer can still reach the file from their order history.
              console.error('[webhook] Digital fulfillment email failed', emailError)
            })
          }
        }

        break
      }

      case 'checkout.session.async_payment_succeeded':
      case 'checkout.session.async_payment_failed': {
        // Delayed payment methods (e.g. bank transfers) fire
        // checkout.session.completed with payment_status 'unpaid' first,
        // then resolve later via one of these two events — reconcile the
        // order's payment_status against whichever order that first event
        // already created.
        const asyncSession = stripeEvent.data.object as Stripe.Checkout.Session
        const asyncPaymentIntentId = asyncSession.payment_intent as string | null
        if (!asyncPaymentIntentId) break

        const ordersToUpdate = await directusServer.request(
          readItems('orders', {
            filter: { stripe_payment_id: { _eq: asyncPaymentIntentId } },
            fields: ['id', 'grand_total'],
            limit: 1,
          }),
        )
        const orderToUpdate = Array.isArray(ordersToUpdate) ? ordersToUpdate[0] : null
        if (!orderToUpdate) break

        const succeeded = stripeEvent.type === 'checkout.session.async_payment_succeeded'
        await directusServer.request(
          updateItem('orders', orderToUpdate.id, {
            payment_status: succeeded ? 'completed' : 'failed',
            total_paid: succeeded ? orderToUpdate.grand_total : 0,
            total_due: succeeded ? 0 : orderToUpdate.grand_total,
          }),
        )
        break
      }

      case 'charge.refunded': {
        const charge = stripeEvent.data.object as Stripe.Charge
        const refundedPaymentIntentId = charge.payment_intent as string | null
        if (!refundedPaymentIntentId) break

        const refundedOrders = await directusServer.request(
          readItems('orders', {
            filter: { stripe_payment_id: { _eq: refundedPaymentIntentId } },
            fields: ['id'],
            limit: 1,
          }),
        )
        const refundedOrder = Array.isArray(refundedOrders) ? refundedOrders[0] : null
        if (!refundedOrder) break

        // charge.amount_refunded is cumulative across every refund issued
        // against this charge, so comparing it to the original charge
        // amount tells a full refund from a partial one — a $5 refund on a
        // $50 order shouldn't flip the order's payment_status to
        // 'refunded' (misleadingly implying nothing was actually paid for
        // it), only a refund covering the whole charge should.
        const amountRefunded = charge.amount_refunded ?? 0
        const isFullyRefunded = amountRefunded >= (charge.amount ?? 0)

        await directusServer.request(
          updateItem('orders', refundedOrder.id, {
            ...(isFullyRefunded && { payment_status: 'refunded' }),
            total_refunded: amountRefunded,
          }),
        )
        break
      }

      case 'charge.dispute.created': {
        const dispute = stripeEvent.data.object as Stripe.Dispute
        const disputedPaymentIntentId = dispute.payment_intent as string | null
        if (!disputedPaymentIntentId) break

        const disputedOrders = await directusServer.request(
          readItems('orders', {
            filter: { stripe_payment_id: { _eq: disputedPaymentIntentId } },
            fields: ['id'],
            limit: 1,
          }),
        )
        const disputedOrder = Array.isArray(disputedOrders) ? disputedOrders[0] : null
        if (!disputedOrder) break

        await directusServer.request(
          updateItem('orders', disputedOrder.id, { payment_status: 'disputed' }),
        )
        break
      }

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
