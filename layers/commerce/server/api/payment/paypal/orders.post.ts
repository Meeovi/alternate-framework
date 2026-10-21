import Joi from 'joi'
import { getAuthSession } from '#auth/server/utils/sessions'
import { paypalRequest, PayPalError } from '../../../utils/paypal'
import { priceCart } from '../../../utils/checkoutCart'
import { encodeCheckoutRef } from '../../../utils/paypalCheckout'

const money = (cents: number, currency: string) => ({ currency_code: currency.toUpperCase(), value: (cents / 100).toFixed(2) })

const schema = Joi.object({
  items: Joi.array().items(Joi.object({
    id: Joi.string().required(),
    quantity: Joi.number().integer().min(1).max(100).required(),
  }).unknown(true)).min(1).max(100).required(),
  currency: Joi.string().length(3).lowercase().default('usd'),
  // An opaque Shippo rate id chosen on /checkout; its amount is re-fetched.
  shippoRateId: Joi.string().max(64).optional(),
  // The address the rate was quoted for; PayPal ships to it.
  shippingAddress: Joi.object({
    name: Joi.string().allow('').max(300).optional(),
    street1: Joi.string().allow('').max(300).optional(),
    street2: Joi.string().allow('').max(300).optional(),
    city: Joi.string().allow('').max(120).optional(),
    state: Joi.string().allow('').max(300).optional(),
    zip: Joi.string().allow('').max(60).optional(),
    country: Joi.string().allow('').max(2).optional(),
    phone: Joi.string().allow('').max(30).optional(),
  }).optional(),
  // Reused across retries of one checkout attempt, so a double-click
  // creates one PayPal order (PayPal-Request-Id).
  idempotencyKey: Joi.string().max(108).optional(),
})

/**
 * POST /api/payment/paypal/orders — creates the PayPal order for a cart.
 * Guests may check out (commerce-backend lines still need a signed-in,
 * linked buyer; see priceCart). Returns { orderId } for the v6 SDK.
 */
export default defineEventHandler(async (event) => {
  const { error, value } = schema.validate(await readBody(event), { abortEarly: false })
  if (error) {
    throw createError({ statusCode: 400, statusMessage: `Validation error: ${error.details.map((d) => d.message).join(', ')}` })
  }

  const session = await getAuthSession(event).catch(() => null)
  const buyer = (session?.user ?? null) as Record<string, any> | null
  const cart = await priceCart({ items: value.items, shippoRateId: value.shippoRateId, currency: value.currency, buyer })
  const { currency } = cart
  const address = value.shippingAddress

  const purchaseUnit = {
    // Read back on capture: who bought it and which label to buy.
    custom_id: encodeCheckoutRef({ buyerId: buyer?.id ?? null, shippoRateId: cart.shipping?.rateId ?? null }),
    amount: {
      ...money(cart.itemCents + (cart.shipping?.cents ?? 0), currency),
      breakdown: {
        item_total: money(cart.itemCents, currency),
        ...(cart.shipping && { shipping: money(cart.shipping.cents, currency) }),
      },
    },
    items: cart.lines.map((line) => ({
      name: line.name.slice(0, 127),
      // The product key fulfilment links the line back to.
      sku: line.ref.slice(0, 127),
      quantity: String(line.quantity),
      unit_amount: money(line.unitCents, currency),
      category: line.requiresShipping ? 'PHYSICAL_GOODS' : 'DIGITAL_GOODS',
    })),
    ...(cart.shipping && address?.street1 && {
      shipping: {
        ...(address.name && { name: { full_name: address.name.slice(0, 300) } }),
        address: {
          address_line_1: address.street1,
          ...(address.street2 && { address_line_2: address.street2 }),
          admin_area_2: address.city,
          admin_area_1: address.state,
          postal_code: address.zip,
          country_code: String(address.country || '').toUpperCase(),
        },
      },
    }),
  }

  try {
    const order = await paypalRequest<{ id: string }>('/v2/checkout/orders', {
      method: 'POST',
      requestId: value.idempotencyKey,
      body: {
        intent: 'CAPTURE',
        purchase_units: [purchaseUnit],
        payment_source: {
          paypal: {
            experience_context: {
              user_action: 'PAY_NOW',
              // Ship to the address the rate was quoted for; nothing ships
              // for a digital-only cart.
              shipping_preference: purchaseUnit.shipping ? 'SET_PROVIDED_ADDRESS' : 'NO_SHIPPING',
              brand_name: 'Meeovi',
            },
          },
        },
      },
    })
    return { orderId: order.id }
  } catch (err) {
    if (err instanceof PayPalError) {
      console.error('[paypal] order creation failed', err.message, err.details)
      // An address PayPal can't ship to is the buyer's to fix.
      const status = err.status === 422 ? 400 : 502
      throw createError({ statusCode: status, statusMessage: status === 400 ? `PayPal couldn't use this order: ${err.message}` : 'PayPal is unavailable. Please try again.' })
    }
    throw err
  }
})
