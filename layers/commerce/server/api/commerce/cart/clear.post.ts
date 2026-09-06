import { defineEventHandler } from 'h3'
import { eq } from 'drizzle-orm'
import { db } from '#auth/server/utils/drizzle'
import { cartItems } from '#auth/server/database/migrations/schema'
import { resolveCartContext, recomputeCartTotals, serializeCart } from '../../../utils/cart'

export default defineEventHandler(async (event) => {
  const { cartId } = await resolveCartContext(event)
  await db.delete(cartItems).where(eq(cartItems.cart, cartId))
  await recomputeCartTotals(cartId)
  return serializeCart(cartId)
})
