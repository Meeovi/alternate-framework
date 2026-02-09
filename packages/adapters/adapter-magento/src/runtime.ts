import { createMagentoCommerceAdapter, MagentoAdapterOptions } from './adapter'

// Create providers backed by the Magento adapter. This does NOT import or
// call into the commerce layer — adapters should expose backend features and
// let the layer decide how to register them.
export function createMagentoProviders(options: MagentoAdapterOptions) {
  const adapter = createMagentoCommerceAdapter(options)

  const productProvider = {
    async getProduct(id: string) {
      if (typeof (adapter as any).getProductBySlug === 'function') {
        return (await (adapter as any).getProductBySlug(id)) as any
      }
      if (typeof (adapter as any).getProducts === 'function') {
        const list = await (adapter as any).getProducts({ ids: [id] })
        return Array.isArray(list) ? list.find((p: any) => String(p.id) === String(id) || p.sku === id) ?? null : null
      }
      return null
    },

    async listProducts(params?: Record<string, any>) {
      if (typeof (adapter as any).getProducts === 'function') return (await (adapter as any).getProducts(params)) as any[]
      return []
    },
  }

  const cartProvider = {
    async getCart() {
      if (typeof (adapter as any).getCart === 'function') return (await (adapter as any).getCart()) as any
      return null
    },

    async addItem(productId: string, quantity: number = 1) {
      if (typeof (adapter as any).addToCart === 'function') return (await (adapter as any).addToCart(null, { productId, quantity })) as any
      return null
    },

    async removeItem(productId: string) {
      if (typeof (adapter as any).removeCartItem === 'function') return (await (adapter as any).removeCartItem(productId)) as any
      if (typeof (adapter as any).updateCartItem === 'function') return (await (adapter as any).updateCartItem(productId, 0)) as any
      return null
    },

    async clearCart() {
      if (typeof (adapter as any).clearCart === 'function') return (await (adapter as any).clearCart()) as any
      return null
    },
  }

  return { productProvider, cartProvider }
}

// Convenience helper: given registrar callbacks from a layer, register the
// Magento providers. This keeps the adapter free of layer imports while still
// making it easy to register providers from app bootstrap code.
export function registerMagentoProvidersRuntime(
  name: string,
  options: MagentoAdapterOptions,
  registrars: {
    registerProductProvider?: (name: string, provider: any) => void
    registerCartProvider?: (name: string, provider: any) => void
  } = {},
) {
  const { productProvider, cartProvider } = createMagentoProviders(options)

  try {
    registrars.registerProductProvider && registrars.registerProductProvider(name, productProvider)
  } catch (e) {
    // ignore registration errors
  }

  try {
    registrars.registerCartProvider && registrars.registerCartProvider(name, cartProvider)
  } catch (e) {
    // ignore registration errors
  }

  return { productProvider, cartProvider }
}

export default createMagentoProviders
