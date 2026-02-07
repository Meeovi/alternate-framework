import type { ProductProvider } from './products/types'
import type { CartProvider } from './cart/types'
import { registerProductProvider } from './products/registry'
import { registerCartProvider } from './cart/registry'

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
export { registerProductProviderRuntime } from './products/registry'
export { registerCartProviderRuntime } from './cart/registry'
export { registerEventProviderRuntime } from './products/registry'
export { registerGiftCardProviderRuntime } from './products/registry'
export { registerSubscriptionProviderRuntime } from './products/registry'
