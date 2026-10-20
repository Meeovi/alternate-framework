import { requireAuth } from '#auth/server/utils/sessions'
import { findWishlist, removeFromList, wishlistKeys } from '#social/server/utils/wishlist'

/**
 * DELETE /api/social/wishlist `{ productKey }` — removes a product from the
 * signed-in user's wishlist.
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event).catch(() => null) as { productKey?: unknown } | null
  if (!body?.productKey) throw createError({ statusCode: 400, statusMessage: 'productKey is required' })

  const list = await findWishlist(String(user.id))
  if (!list) return { list: null, items: [] }
  await removeFromList(list.id, body.productKey)
  return { list, items: await wishlistKeys(list.id) }
})
