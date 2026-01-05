import { createError, defineEventHandler, readBody, setCookie } from 'h3'
import { useMagentoServer } from '../../../utils/useMagentoServer'

export default defineEventHandler(async (event) => {
  const magento = useMagentoServer(event)
  const body = await readBody(event)

  const { email, password } = body

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'email and password are required'
    })
  }

  // Magento returns a customer token string
  const token = await magento.customer.login(email, password)

  // Store token in cookie
  const cookieName = magento.config.customerTokenCookie || 'magento_customer_token'

  setCookie(event, cookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: true
  })

  // Fetch customer profile
  const customer = await magento.customer.me(token)

  return {
    token,
    customer
  }
})
