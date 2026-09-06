import { defineEventHandler, readBody, createError } from 'h3'
import Joi from 'joi'
import { eq, and, isNull } from 'drizzle-orm'
import { db } from '#auth/server/utils/drizzle'
import { cartItems } from '#auth/server/database/migrations/schema'
import { resolveCartContext, resolveProductForCart, recomputeCartTotals, serializeCart } from '../../../utils/cart'

const bodySchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).max(999).default(1),
  variantId: Joi.string().optional(),
  variant: Joi.string().optional(),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { error, value } = bodySchema.validate(body, { abortEarly: false })
  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: `Validation error: ${error.details.map((d) => d.message).join(', ')}`,
    })
  }

  // Never trust a client-supplied price/name — resolve the real product
  // from Directus, the same trusted path checkout re-prices from.
  const product = await resolveProductForCart(value.productId)
  if (!product) {
    throw createError({ statusCode: 400, statusMessage: `Unknown or unpriced product: ${value.productId}` })
  }

  const { cartId } = await resolveCartContext(event)
  const unitPriceCents = Math.round(product.price * 100)

  const [existing] = await db
    .select()
    .from(cartItems)
    .where(
      and(
        eq(cartItems.cart, cartId),
        eq(cartItems.productId, product.id),
        value.variantId ? eq(cartItems.variantId, value.variantId) : isNull(cartItems.variantId),
      ),
    )
    .limit(1)

  if (existing) {
    const nextQuantity = (existing.quantity ?? 0) + value.quantity
    await db
      .update(cartItems)
      .set({
        quantity: nextQuantity,
        // Refresh price to the current catalog price on every add, same
        // as re-pricing at checkout — a cart shouldn't keep charging a
        // stale price from whenever the item was first added.
        price: unitPriceCents,
        total: unitPriceCents * nextQuantity,
        metadata: { name: product.name, image: product.image },
      })
      .where(eq(cartItems.id, existing.id))
  } else {
    await db.insert(cartItems).values({
      cart: cartId,
      products: Number(product.id),
      productId: product.id,
      quantity: value.quantity,
      price: unitPriceCents,
      total: unitPriceCents * value.quantity,
      variantId: value.variantId,
      variant: value.variant,
      metadata: { name: product.name, image: product.image },
    })
  }

  await recomputeCartTotals(cartId)
  return serializeCart(cartId)
})
