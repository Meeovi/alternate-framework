import { defineEventHandler, createError, getRouterParam } from 'h3'
import { eq, and } from 'drizzle-orm'
import { db } from '#auth/server/utils/drizzle'
import { cartItems } from '#auth/server/database/migrations/schema'
import { resolveCartContext, recomputeCartTotals, serializeCart } from '../../../../utils/cart'

export default defineEventHandler(async (event) => {
  const itemId = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(itemId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid cart item id' })
  }

  const { cartId } = await resolveCartContext(event)

  const [item] = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.id, itemId), eq(cartItems.cart, cartId)))
    .limit(1)

  if (!item) {
    throw createError({ statusCode: 404, statusMessage: 'Cart item not found' })
  }

  await db.delete(cartItems).where(eq(cartItems.id, itemId))
  await recomputeCartTotals(cartId)
  return serializeCart(cartId)
})
