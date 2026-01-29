import { registerProductProvider } from './products/registry';
import { registerCartProvider } from './cart/registry';
// Register multiple domain providers at once from an adapter package.
// Example adapter entrypoint can call this during app boot.
export function registerCommerceProviderRuntime(name, bundle) {
    if (bundle.product)
        registerProductProvider(name, bundle.product);
    if (bundle.cart)
        registerCartProvider(name, bundle.cart);
}
// Also re-export individual runtime helpers for convenience
export { registerProductProviderRuntime } from './products/registry';
export { registerCartProviderRuntime } from './cart/registry';
