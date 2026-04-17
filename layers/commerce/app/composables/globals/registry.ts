import type { ProductProvider } from '../catalog/useProducts/types'
import type { CartProvider } from '../sales/useCart/types'
import { registerProductProvider } from '../catalog/useProducts/registry'
import { registerCartProvider } from '../sales/useCart/registry'

export interface CommerceProviderBundle {
  product?: ProductProvider
  cart?: CartProvider
  // future: category?: CategoryProvider
}

// Register multiple domain providers at once from an adapter package.
// Example adapter entrypoint can call this during app boot.
export function registerCommerceProviderRuntime(name: string, bundle: CommerceProviderBundle) {
  if (bundle.product) registerProductProvider(name, bundle.product)
  if (bundle.cart) registerCartProvider(name, bundle.cart)
}

// Also re-export individual runtime helpers for convenience
export { registerProductProviderRuntime } from '../catalog/useProducts/registry'
export { registerCartProviderRuntime } from '../sales/useCart/registry'
export { registerEventProviderRuntime } from '../catalog/useProducts/registry'
export { registerGiftCardProviderRuntime } from '../catalog/useProducts/registry'
export { registerSubscriptionProviderRuntime } from '../catalog/useProducts/registry'
