import type { ProductProvider } from './useProducts/types'
import type { CartProvider } from './useCart/types'
import { registerProductProvider } from './useProducts/registry'
import { registerCartProvider } from './useCart/registry'

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
export { registerProductProviderRuntime } from './useProducts/registry'
export { registerCartProviderRuntime } from './useCart/registry'
export { registerEventProviderRuntime } from './useProducts/registry'
export { registerGiftCardProviderRuntime } from './useProducts/registry'
export { registerSubscriptionProviderRuntime } from './useProducts/registry'
