import { defineEventHandler, getQuery, parseCookies, setCookie } from 'h3'
import { useMagentoServer } from '../../../utils/useMagentoServer'

export default defineEventHandler(async (event) => {
  const magento = useMagentoServer(event)
  const query = getQuery(event)

  const cookieName = magento.config.customerTokenCookie || 'magento_customer_token'
  const cartCookie = 'magento_cart_id'

  const cookies = parseCookies(event)
  const customerToken = cookies[cookieName]
  const guestCartId = cookies[cartCookie]

  // 1. Customer cart
  if (customerToken) {
    try {
      const customerCart = await magento.cart.getCustomerCart(customerToken)
      return { cart: customerCart }
    } catch (e) {
      // fallback to guest cart
    }
  }

  // 2. Guest cart
  if (guestCartId) {
    try {
      const cart = await magento.cart.get(guestCartId)
      return { cart }
    } catch (e) {
      // cart expired → create new
    }
  }

  // 3. Create new guest cart
  const newCartId = await magento.cart.createGuestCart()

  setCookie(event, cartCookie, newCartId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/'
  })

  const cart = await magento.cart.get(newCartId)

  return { cart }
})
