/**
 * Access-control manifest for the `POST /api/commerce/driver` RPC proxy.
 *
 * The proxy forwards a method name from an untrusted request body straight
 * to the server-side commerce adapter. The adapter interface
 * (`CommerceClient` in app/utils/client.ts) is huge and includes
 * back-office operations — arbitrary financial writes, inventory
 * adjustments, B2B company/credit management, and a raw GraphQL
 * passthrough (`request`). None of that belongs on a public storefront
 * endpoint, so this endpoint forwards only the methods listed here and
 * rejects everything else (fail closed).
 *
 * `public` — catalog / content reads and guest-cart operations. A guest
 *            cart is addressed by a cart token the caller already holds,
 *            so cart mutation is safe for anonymous callers.
 * `authed` — customer account data, orders, checkout completion,
 *            subscriptions, returns, rewards, store credit. Requires a
 *            signed-in session; the adapter/backend is still responsible
 *            for scoping results to that customer.
 *
 * Intentionally NOT reachable through this endpoint (call a dedicated,
 * separately-authorized server route instead): `request` (raw GraphQL),
 * payment capture/authorize/void/refund, invoice/credit-memo creation,
 * inventory writes (updateStock / adjustStock / assignStockToSource),
 * gift-card issuance, POS orders, shipment booking, catalog-link edits,
 * and every B2B / company-account / approval-rule / purchase-order /
 * negotiable-quote / shared-catalog / affiliate / admin-log method.
 */
export const COMMERCE_DRIVER_PUBLIC_METHODS: ReadonlySet<string> = new Set([
  // Products
  'getProduct', 'getProducts', 'listProducts', 'fetchProduct',
  'getProductById', 'getProductBySku', 'getProductBySlug', 'getProductByUrlKey',
  'getBestSellingProducts', 'getNewestProducts', 'getRelatedProducts',
  'getProductRecommendations', 'getRecommendations', 'getRecommendationRules',
  'getSenseiRecommendations', 'getRelatedProductsRules',
  'getProductMediaGalleryEntries', 'getProductSearchSuggestions',
  // Categories & brands
  'getCategories', 'getCategory', 'getCategoryById', 'getCategoryBySlug', 'getCategoryTree',
  'getBrands', 'getBrand',
  // Search
  'search', 'getSuggestions',
  // Catalog pricing & promotions (not customer-specific)
  'getPrice', 'getCatalogPriceRules', 'listCatalogPriceRules',
  'getCartPriceRules', 'listCartPriceRules', 'getCatalogPriceBySku',
  'getCatalogPriceForProduct', 'getMinimumAdvertisedPrice', 'getSuggestedRetailPrice',
  'getPromotions', 'listDiscounts', 'getSpecialOffer', 'listSpecialOffers',
  'getDiscountForCart', 'calculateDiscounts', 'getPlans', 'listPriceRules',
  // Content
  'getPoll', 'listPolls', 'getGlossaryTermBySlug', 'listGlossaryTerms',
  'getEvents', 'getEventById', 'getEventBySlug', 'getCatalogEventById', 'listCatalogEvents',
  'getDynamicBlockById', 'listDynamicBlocks',
  // Store / shipping catalogue info
  'getStores', 'listCarriers', 'listShippingIntegrations', 'listGiftWrappingOptions',
  'getMethods', 'listChannels',
  // Stock availability (read-only)
  'getStock', 'getStockByProductId', 'getStockBySku', 'getStockItemBySku',
  'getStockItems', 'checkInventory', 'listInventorySources', 'getSources',
  // Coupon / gift-card validation (caller supplies the code they hold)
  'validateCoupon', 'getCoupon', 'getCouponById', 'getGiftCardByCode',
  // Compare (cookie/session scoped, works for guests)
  'addToCompare', 'removeFromCompare', 'getComparedProducts',
  // Cart (guest carts addressed by a token the caller holds)
  'getCart', 'addToCart', 'updateCart', 'removeFromCart', 'clearCart',
  'addCartLineItem', 'updateCartLineItem', 'removeCartLineItem',
  'applyCouponToCart', 'removeCouponFromCart', 'calculateCartPrices', 'priceCartItem',
  'estimateShippingMethods', 'listShippingMethods', 'selectShippingMethod', 'setShippingMethod',
  'addGiftMessage', 'getGiftMessages', 'updateGiftMessage', 'deleteGiftMessage',
  'addGiftWrapToCart', 'removeGiftWrapFromCart', 'getCartRules',
])

export const COMMERCE_DRIVER_AUTHED_METHODS: ReadonlySet<string> = new Set([
  // Customer profile & addresses
  'getCustomer', 'getCustomerGroups',
  'getCustomerAddresses', 'createCustomerAddress', 'updateCustomerAddress', 'deleteCustomerAddress',
  // Orders
  'getOrders', 'listOrders', 'getOrder', 'getOrderByIncrementId', 'createOrder',
  'orderBySku', 'cancelOrder',
  // Checkout completion
  'getCheckout', 'createCheckout', 'updateCheckout', 'completeCheckout',
  // Invoices / shipments / credit memos (customer-visible)
  'getInvoices', 'listInvoices', 'getInvoice', 'getInvoiceById',
  'getShipments', 'trackShipment', 'getTrackingInfo',
  'getCreditMemos', 'listCreditMemos', 'getCreditMemo', 'getCreditMemoById',
  // Returns
  'getReturns', 'listReturns', 'getReturn', 'getReturnById', 'createReturn', 'createRMA',
  // Rewards / gift cards / store credit (customer wallet)
  'getRewards', 'listRewards', 'getRewardBalance', 'redeemReward', 'balance',
  'getGiftCards', 'listGiftCards', 'listGiftCertificates',
  'applyGiftCard', 'applyGiftCertificate', 'redeemGiftCard',
  'getStoreCredit', 'applyStoreCreditToCart',
  // Subscriptions
  'getSubscriptions', 'getSubscriptionById', 'subscribe', 'updateSubscription',
  'cancelSubscription', 'pauseSubscription', 'resumeSubscription', 'getBillingHistory',
  // Gift registry
  'getGiftRegistryById', 'listGiftRegistries', 'createGiftRegistry', 'updateGiftRegistry',
  'addGiftRegistryItem', 'removeGiftRegistryItem',
  // Misc customer actions
  'votePoll', 'registerAttendee', 'sendToAFriend', 'tellAFriend', 'sendRecommendation',
  'trackEvent', 'trackReferral',
])

export type CommerceDriverAccess = 'public' | 'authed' | 'denied'

export function classifyCommerceDriverMethod(method: string): CommerceDriverAccess {
  if (COMMERCE_DRIVER_PUBLIC_METHODS.has(method)) return 'public'
  if (COMMERCE_DRIVER_AUTHED_METHODS.has(method)) return 'authed'
  return 'denied'
}
