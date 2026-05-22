
import { useState, useCookie } from 'nuxt/app'

const RECENTLY_VIEWED_KEY = 'recently_viewed_products'

export function addViewed(productId: string) {
  const { products } = useRecentlyViewed()
  if (!products.value.includes(productId)) {
    products.value.unshift(productId)
    if (products.value.length > 20) products.value.length = 20
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
  return { products, load }
}

export default useRecentlyViewed
