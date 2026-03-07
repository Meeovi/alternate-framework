import { useRecentlyViewedStore } from '../../stores/recentlyViewedProducts'

export function addViewed(productId: string) {
  const store = useRecentlyViewedStore()
  if (store && typeof store.addViewed === 'function') {
    store.addViewed(productId)
  }
}

export function useRecentlyViewed() {
  const store = useRecentlyViewedStore()
  return {
    products: store.items,
    load: store.fetch
  }
}

export default useRecentlyViewed
