import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'
import Joi from 'joi'
import { eq, and } from 'drizzle-orm'
import { db } from '#auth/server/utils/drizzle'
import { cartItems } from '#auth/server/database/migrations/schema'
import { resolveCartContext, recomputeCartTotals, serializeCart } from '../../../../utils/cart'

const bodySchema = Joi.object({
  quantity: Joi.number().integer().min(0).max(999).required(),
})

export default defineEventHandler(async (event) => {
  const itemId = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(itemId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid cart item id' })
  }

  const body = await readBody(event)
  const { error, value } = bodySchema.validate(body)
  if (error) {
    throw createError({ statusCode: 400, statusMessage: `Validation error: ${error.details.map((d) => d.message).join(', ')}` })
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

  // Matches the store's existing semantics (updateQuantity(key, 0) removes
  // the line) rather than leaving a zero-quantity row behind.
  if (value.quantity <= 0) {
    await db.delete(cartItems).where(eq(cartItems.id, itemId))
  } else {
    await db
      .update(cartItems)
      .set({
        quantity: value.quantity,
        total: (item.price ?? 0) * value.quantity,
      })
      .where(eq(cartItems.id, itemId))
  }

  await recomputeCartTotals(cartId)
  return serializeCart(cartId)
})
