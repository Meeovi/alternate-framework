import { requireAuth } from '#auth/server/utils/sessions'
import { findWishlist, wishlistKeys } from '#social/server/utils/wishlist'

/**
 * GET /api/social/wishlist — the signed-in user's wishlist (a list of type
 * "Wishlist") and the product keys saved in it. `list` is null until they
 * save their first product.
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const list = await findWishlist(String(user.id))
  return { list, items: list ? await wishlistKeys(list.id) : [] }
})
