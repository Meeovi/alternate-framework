/**
 * Who sells a product, and the page their name links to, from the fields
 * the product row already carries:
 *  - a commerce-backend product (mirrored): its marketplace seller, which
 *    the store sync writes as seller_username / seller_name → /u/<username>
 *  - a Directus product: its first shop → /outlet/<slug>
 * Null when neither is known.
 */
export function productSeller(product: Record<string, any> | null | undefined): { name: string, to: string | null } | null {
  if (!product) return null
  const username = typeof product.seller_username === 'string' ? product.seller_username.trim() : ''
  if (username) {
    return { name: String(product.seller_name || username), to: `/u/${encodeURIComponent(username)}` }
  }
  const shop = product.shops?.[0]?.shops_id
  if (shop && typeof shop === 'object' && shop.name) {
    return { name: String(shop.name), to: shop.slug ? `/outlet/${encodeURIComponent(shop.slug)}` : null }
  }
  return null
}
