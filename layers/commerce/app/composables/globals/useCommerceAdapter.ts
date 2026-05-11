import { useProducts } from '../catalog/products/useProducts/useProducts'
import { useCart } from '../sales/cart/useCart/useCart'
import { useOrders } from '../sales/orders/orders'
import useCatalogPriceRules from '../catalog/price/useCatalogPriceRules'
import useCartPriceRules from '../catalog/price/useCartPriceRules'
import useContentFallback from '../content/useContent'

export function useCommerceAdapter(): any {
  // Compose existing domain composables to provide a unified adapter surface.
  const products = useProducts() as Record<string, any>
  const cart = (useCart && (useCart as any)()) as Record<string, any>
  const orders = (useOrders && (useOrders as any)()) as Record<string, any>
  const catalogPricing = useCatalogPriceRules() as Record<string, any>
  const cartPricing = useCartPriceRules() as Record<string, any>
  const content = useContentFallback() as Record<string, any>

  const getProductPrice = async (args: Record<string, any>) => ({
    pricing: await catalogPricing.getCatalogPriceForProduct(args?.product || {}, args || {}),
  })

  const getCatalogPriceRules = async (args: Record<string, any> = {}) => ({
    rules: await catalogPricing.listCatalogPriceRules(args),
  })

  const getCartPriceRules = async (args: Record<string, any> = {}) => ({
    rules: await cartPricing.listCartPriceRules(args),
  })

  const getBrandBar = async (args: Record<string, any> = {}) => content.getBrandBar(args)

  const getContentPage = async (args: Record<string, any> = {}) => (
    content.getContentPage(args?.slug || args?.id)
  )

  const getDotdigitalChatConfig = async (args: Record<string, any> = {}) => (
    content.getDotdigitalChatConfig(args)
  )

  const getProductRssFeeds = async (args: Record<string, any>) => (
    content.getProductRssFeeds(args?.product || {}, args || {})
  )

  const getProductRssLink = async (args: Record<string, any>) => ({
    link: await content.getProductRssLink(args?.product || {}, args || {}),
  })

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
    // content APIs
    ...content,
    // pricing APIs
    ...catalogPricing,
    ...cartPricing,
    // unified wrapper APIs
    getProductPrice,
    getCatalogPriceRules,
    getCartPriceRules,
    getBrandBar,
    getContentPage,
    getDotdigitalChatConfig,
    getProductRssFeeds,
    getProductRssLink,
    // brand helpers
    getBrands,
    getMeeBrands
  }
}

export default useCommerceAdapter
