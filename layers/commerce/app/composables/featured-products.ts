import { useProducts } from './useProducts/useProducts'

export function useFeaturedProducts() {
  const { fetchProducts } = useProducts()
  return {
    async getFeaturedProducts(options: any = {}) {
      const items = await fetchProducts()
      // If fetchProducts returns a ref/computed, attempt to unwrap
      // and filter by a common `featured` flag if present
      try {
        const list = (items as any)?.value ?? items
        return (Array.isArray(list) ? list.filter((p: any) => p.featured || p.is_featured || p.isFeatured) : []) as any[]
      } catch (e) {
        return []
      }
    }
  }
}

export default useFeaturedProducts
