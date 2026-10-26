import { getAuthSession } from '#auth/server/utils/sessions'
import { priceCart } from '../../utils/checkoutCart'
import { checkoutSchema, validateCheckout } from '../../utils/checkoutRequest'

/**
 * POST /api/payment/quote — what a checkout will cost before the buyer
 * pays: priced exactly as /api/payment/paypal/orders prices it, with the
 * tax from the commerce backend. Amounts in cents.
 */
export default defineEventHandler(async (event) => {
  const value = validateCheckout<Record<string, any>>(checkoutSchema, await readBody(event))
  const session = await getAuthSession(event).catch(() => null)
  const cart = await priceCart({
    items: value.items,
    shippoRateId: value.shippoRateId,
    currency: value.currency,
    buyer: (session?.user ?? null) as Record<string, any> | null,
    address: value.shippingAddress,
  })
  const shippingCents = cart.shipping?.cents ?? 0
  return {
    currency: cart.currency,
    itemCents: cart.itemCents,
    shippingCents,
    taxCents: cart.taxCents,
    totalCents: cart.itemCents + shippingCents + cart.taxCents,
  }
})
