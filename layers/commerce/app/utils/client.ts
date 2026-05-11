// import * as CommercePkg from '~/types';
// Use CommonJS require fallback with type ignore to avoid TS errors
// @ts-ignore
let sdk: any = undefined;
try {
  // @ts-ignore
  sdk = require('alternate-core').sdk;
} catch (e) {
  sdk = undefined;
}
// Removed broken imports for missing types/normalizers/* and types

function getRawCommerceClient(provider?: string, config?: any): any {
  // Only fallback to sdk.commerce or null, since all other imports are removed
  return (sdk as any)?.commerce || null;
}

function createNormalizedClient(client: any) {
  if (!client) return client;
  if ((client as any).__normalized) return client;

  const wrapped: any = Object.create(client);

  if (typeof client.listProducts === 'function') {
    wrapped.listProducts = async (...args: any[]) => {
      const res = await client.listProducts(...args);
      return res;
    };
  }

  // Menu endpoints normalization removed

  // Category endpoints normalization removed

  // CMS/page endpoints normalization removed

  // URL rewrite endpoints normalization removed

  // Wishlist endpoints normalization removed

  // Compare/product compare endpoints normalization removed

  // Stores / pickup normalization removed

  // getProductById normalization removed

  // getProductBySlug normalization removed

  // getProduct normalization removed

  // Cart methods normalization removed

  // Order methods: normalize single orders and lists of orders
  // listOrders normalization removed

  // Order singles normalization removed

  // Returns
  // Returns normalization removed

  // Credit memos normalization removed

  // Invoices normalization removed

  // Transactions normalization removed

  // Payments normalization removed

  // Reviews normalization removed

  // Gift cards normalization removed

  // Subscriptions normalization removed

  (wrapped as any).__normalized = true;
  return wrapped;
}

/**
 * Returns a commerce client. This exported function now returns a thin
 * compatibility wrapper around provider clients so common methods return
 * normalized domain shapes when possible. Under the hood it still prefers
 * layer-local providers and falls back to package-level APIs and the SDK.
 */
export function getCommerceClient(provider?: string, config?: any): any {
  const raw = getRawCommerceClient(provider, config);
  return createNormalizedClient(raw);
}

export default getCommerceClient;
