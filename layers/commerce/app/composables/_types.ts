export type Maybe<T> = T | null | undefined;

// Re-export or alias common legacy names expected by the composables
// Fallback permissive types for isolated builds
export type SfProduct = any;
export type Product = any;
export type SfCart = any;
export type Cart = any;

// No direct equivalents in @meeovi/commerce yet — use permissive any types
export type SfCustomer = any;
export type SfAddress = any;
export type SfProductReview = any;
export type SfShippingMethods = any;
export type SfAttribute = any;

// Export additional useful types from the commerce package if needed
export type Category = any;
