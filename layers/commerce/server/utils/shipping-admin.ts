import { createError, getHeader, type H3Event } from 'h3'

// These shipment endpoints move real money (buying labels, closing carrier
// manifests) or reconfigure the merchant's Shippo webhooks — they must
// never be reachable by an anonymous caller. There's no admin/staff role
// wired up anywhere else in this codebase yet to gate against safely, so
// this follows the same fail-closed shared-secret pattern already used for
// the inbound Shippo webhook receiver: a service token in a header,
// checked against an env var, refusing every request if that var isn't
// configured rather than defaulting open.
export function requireShippingAdmin(event: H3Event) {
  const expectedToken = process.env.SHIPPING_ADMIN_TOKEN
  if (!expectedToken) {
    throw createError({ statusCode: 500, statusMessage: 'SHIPPING_ADMIN_TOKEN is not configured' })
  }

  const provided = getHeader(event, 'x-shipping-admin-token')
  if (!provided || provided !== expectedToken) {
    throw createError({ statusCode: 401, statusMessage: 'Missing or invalid shipping admin token' })
  }
}
