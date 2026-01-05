import { defineEventHandler, setCookie } from 'h3'
import { useMagentoServer } from '../../../utils/useMagentoServer'

export default defineEventHandler(async (event) => {
  const magento = useMagentoServer(event)

  const cookieName = magento.config.customerTokenCookie || 'magento_customer_token'

  // Clear cookie
  setCookie(event, cookieName, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: true,
    maxAge: 0
  })

  return { success: true }
})
