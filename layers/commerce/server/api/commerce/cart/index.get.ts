import { defineEventHandler } from 'h3'
import { resolveCartContext, serializeCart } from '../../../utils/cart'

export default defineEventHandler(async (event) => {
  const { cartId } = await resolveCartContext(event)
  return serializeCart(cartId)
})
