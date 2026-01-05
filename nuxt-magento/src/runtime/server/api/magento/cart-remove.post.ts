import { createError, defineEventHandler, readBody } from 'h3'
import { useMagentoServer } from '../../../utils/useMagentoServer'

export default defineEventHandler(async (event) => {
  const magento = useMagentoServer(event)
  const body = await readBody(event)

  const { cartId, itemId } = body

  if (!cartId || !itemId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'cartId and itemId are required'
    })
  }

  return await magento.cart.removeItem(cartId, itemId)
})
