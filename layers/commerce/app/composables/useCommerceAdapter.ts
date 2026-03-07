import { useProducts } from './useProducts/useProducts'
import { useCart } from './useCart/useCart'
import { useOrders } from './orders'

export function useCommerceAdapter(): any {
  // Compose existing domain composables to provide a unified adapter surface.
  const products = useProducts() as Record<string, any>
  const cart = (useCart && (useCart as any)()) as Record<string, any>
  const orders = (useOrders && (useOrders as any)()) as Record<string, any>

  // Lightweight brand helpers (adapters can override by providing their own registrars)
  const getBrands = async () => {
    // Default: try to list products grouped by brand, otherwise return empty
    try {
      if (products.listProducts) return await products.listProducts()
    } catch (e) {
      // ignore
    }
    return []
  }

  const getMeeBrands = async () => {
    // Default noop - adapters may provide a specialized implementation
    return []
  }

  return {
    // product APIs
    ...products,
    // cart APIs (namespaced flattened)
    ...cart,
    // order APIs
    ...orders,
    // brand helpers
    getBrands,
    getMeeBrands
  }
}

export default useCommerceAdapter
