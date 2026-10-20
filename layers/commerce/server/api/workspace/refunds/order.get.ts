import type Stripe from 'stripe'
import { createError, defineEventHandler, getQuery } from 'h3'
import { requireAdmin } from '#auth/server/utils/sessions'
import { stripe } from '../../../utils/stripe'
import { findAdminOrder, refundBackend, storeError } from '../../../utils/storeAdmin'
import { repository } from '../../../licensing-host'

/**
 * GET /api/workspace/refunds/order?store=magento&id=|number=|reference= —
 * one store order for an admin: its lines and what's left to refund, the
 * Stripe payment behind it, and the licenses that payment bought.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const q = getQuery(event)
  const text = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, 100) : undefined)
  const lookup = { id: text(q.id), number: text(q.number), reference: text(q.reference) }
  if (!lookup.id && !lookup.number && !lookup.reference) throw createError({ statusCode: 400, statusMessage: 'Give an order number, id or payment reference' })
  const backend = refundBackend(String(q.store || 'magento'))
  const order = await findAdminOrder(backend, lookup).catch((e) => storeError(e, 'find the order'))
  if (!order) throw createError({ statusCode: 404, statusMessage: 'No such order' })

  let payment: { id: string, amount: number, refunded: number, currency: string, status: string } | null = null
  if (order.reference?.startsWith('pi_')) {
    const pi = await stripe.paymentIntents.retrieve(order.reference, { expand: ['latest_charge'] })
    const charge = typeof pi.latest_charge === 'object' ? pi.latest_charge as Stripe.Charge | null : null
    payment = { id: pi.id, amount: charge?.amount ?? pi.amount, refunded: charge?.amount_refunded ?? 0, currency: pi.currency, status: pi.status }
  }
  const licenses = order.reference
    ? (await repository().findUserLicenseByPurchase(`stripe:${order.reference}`)).map((l) => ({ id: l.id, productId: l.productId, status: l.status }))
    : []
  return { store: backend.id, order, payment, licenses }
})
