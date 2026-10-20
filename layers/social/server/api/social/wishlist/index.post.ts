import { requireAuth } from '#auth/server/utils/sessions'
import { addToList, ensureWishlist, wishlistKeys } from '#social/server/utils/wishlist'

/**
 * POST /api/social/wishlist `{ productKeys: string[] }` — saves products to
 * the signed-in user's wishlist, creating it on first use. Keys are a
 * Directus product id or `<backend>:<key>` (at most 50 per call).
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event).catch(() => null) as { productKeys?: unknown } | null
  const keys = Array.isArray(body?.productKeys) ? body.productKeys.map(String).filter(Boolean) : []
  if (!keys.length || keys.length > 50) throw createError({ statusCode: 400, statusMessage: 'productKeys must list 1 to 50 products' })

  const list = await ensureWishlist(String(user.id))
  for (const key of keys) await addToList(list.id, key)
  return { list, items: await wishlistKeys(list.id) }
})
