import { defineEventHandler, readBody, setCookie } from 'h3'
import { useMagentoServer } from '../../../utils/useMagentoServer'

export default defineEventHandler(async (event) => {
  const magento = useMagentoServer(event)
  const body = await readBody(event)

  const {
    cartId,
    email,
    shippingAddress,
    billingAddress,
    shippingMethod,
    paymentProvider,
    paymentData
  } = body

  // 1. Set shipping information
  const shippingInfo = await magento.checkout.setShippingInformation({
    cartId,
    email,
    shippingAddress,
    billingAddress,
    shippingMethod
  })

  // 2. Create payment intent (Stripe, Adyen, etc.)
  const paymentIntent = await magento.checkout.createPaymentIntent({
    provider: paymentProvider,
    cartId,
    amount: shippingInfo.totals.grand_total
  })

  // 3. Place order
  const orderId = await magento.checkout.placeOrder({
    cartId,
    paymentMethod: {
      method: paymentProvider,
      additional_data: paymentData
    },
    billingAddress
  })

  return {
    orderId,
    paymentIntent
  }
})
