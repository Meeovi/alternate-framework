export type Maybe<T> = T | null | undefined;

// Re-export or alias common legacy names expected by the composables
export type SfProduct = import('@meeovi/commerce').Product;
export type Product = import('@meeovi/commerce').Product;
export type SfCart = import('@meeovi/commerce').Cart;
export type Cart = import('@meeovi/commerce').Cart;

// No direct equivalents in @meeovi/commerce yet — use permissive any types
export type SfCustomer = any;
export type SfAddress = any;
export type SfProductReview = any;
export type SfShippingMethods = any;
export type SfAttribute = any;

// Export additional useful types from the commerce package if needed
export type Category = import('@meeovi/commerce').Category;
