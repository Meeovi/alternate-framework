import type { ProductProvider } from '../catalog/products/useProducts/types'
import type { CartProvider } from '../../types/cart'
import { registerProductProvider } from '../catalog/products/registry'
import { registerCartProvider } from '../sales/cart/useCart/registry'

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
export { registerProductProviderRuntime } from '../catalog/products/registry'
export { registerCartProviderRuntime } from '../sales/cart/useCart/registry'
export { registerEventProviderRuntime } from '../catalog/products/registry'
export { registerGiftCardProviderRuntime } from '../catalog/products/registry'
export { registerSubscriptionProviderRuntime } from '../catalog/products/registry'
