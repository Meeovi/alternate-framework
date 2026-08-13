import { createDirectus, rest, staticToken, readItems, updateItem } from '@directus/sdk'
import { createError, defineEventHandler, getQuery, readBody } from 'h3'
import { safeEqual } from '../../utils/shipping-admin'

// Shippo doesn't sign webhook payloads with an HMAC the way Stripe/Polar do,
// so this route is secured with a shared-secret token in the webhook URL
// itself (configured when the webhook is registered via POST
// /api/shipment/webhook — e.g. https://.../api/shipment/track-updated?token=...).
// Without this, anyone who discovers the URL could post fake "delivered"
// events for arbitrary tracking numbers.

const directusServer = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN!))

export default defineEventHandler(async (event) => {
  const expectedToken = process.env.SHIPPO_WEBHOOK_TOKEN
  if (!expectedToken) {
    throw createError({ statusCode: 500, statusMessage: 'SHIPPO_WEBHOOK_TOKEN is not configured' })
  }

  const token = getQuery(event).token
  if (typeof token !== 'string' || !safeEqual(token, expectedToken)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid webhook token' })
  }

  const body = await readBody(event) as {
    event?: string
    data?: {
      tracking_number?: string
      carrier?: string
      tracking_status?: { status?: string; status_details?: string; status_date?: string }
      eta?: string | null
    }
  }

  if (body?.event !== 'track_updated' || !body.data?.tracking_number) {
    return { received: true, ignored: true }
  }

  const { tracking_number, carrier, tracking_status } = body.data

  const orders = await directusServer.request(
    readItems('orders', {
      filter: { tracking_number: { _eq: tracking_number } },
      fields: ['id'],
      limit: 1,
    }),
  )

  const order = Array.isArray(orders) ? orders[0] : null
  if (!order) {
    // Not necessarily an error — Shippo may notify about test events or
    // shipments this app didn't create.
    return { received: true, matched: false }
  }

  await directusServer.request(
    updateItem('orders', order.id, {
      shipment_status: tracking_status?.status || null,
      shipment_status_details: tracking_status?.status_details || null,
      shipment_carrier: carrier || null,
      ...(tracking_status?.status === 'DELIVERED' && { fulfillment_status: 'delivered' }),
    }),
  )

  return { received: true, matched: true }
})
