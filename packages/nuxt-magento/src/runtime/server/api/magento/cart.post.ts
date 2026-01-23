import { defineEventHandler } from 'h3'
import { useMagentoServer } from '../../../utils/useMagentoServer'

export default defineEventHandler(async (event) => {
  const magento = useMagentoServer(event)
  const cartId = await magento.cart.createGuestCart()
  return { cartId }
})
