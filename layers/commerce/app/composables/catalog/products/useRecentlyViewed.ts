// layers/commerce/app/composables/catalog/products/useRecentlyViewed.ts
import { useState, useCookie } from '#imports'

const RECENTLY_VIEWED_KEY = 'recently_viewed_products'
const MAX_ITEMS = 20

/**
 * Tracks a customer's recently viewed product ids (persisted in a cookie).
 * Previously lived in `useProducts/useRecentlyViewed.ts`; moved to a flat,
 * single-responsibility module during the composables consolidation.
 */
export function addViewed(productId: string) {
  const { products } = useRecentlyViewed()
  if (!products.value.includes(productId)) {
    products.value.unshift(productId)
    if (products.value.length > MAX_ITEMS) products.value.length = MAX_ITEMS
    useCookie(RECENTLY_VIEWED_KEY).value = JSON.stringify(products.value)
  }
}

export function useRecentlyViewed() {
  const products = useState<string[]>(RECENTLY_VIEWED_KEY, () => {
    const cookie = useCookie(RECENTLY_VIEWED_KEY).value
    try {
      return cookie ? JSON.parse(cookie) : []
    } catch {
      return []
    }
  })

  function load() {
    const cookie = useCookie(RECENTLY_VIEWED_KEY).value
    try {
      products.value = cookie ? JSON.parse(cookie) : []
    } catch {
      products.value = []
    }
  }

  function clear() {
    products.value = []
    useCookie(RECENTLY_VIEWED_KEY).value = JSON.stringify([])
  }

  return { products, load, clear }
}

export default useRecentlyViewed
