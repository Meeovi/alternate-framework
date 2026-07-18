// import * as CommercePkg from '~/types';
// Use CommonJS require fallback with type ignore to avoid TS errors
// @ts-ignore
let staticSdk: any = undefined;
try {
  // @ts-ignore
  staticSdk = require('alternate-core').sdk;
} catch (e) {
  staticSdk = undefined;
}

import type * as Sf from '~/composables/system/models';
import { useNuxtApp } from '#app'

/**
 * Strict Interface Contract for the commerce backend.
 *
 * The layer defines this contract; adapters (e.g. Magento) MUST implement every
 * method. Composables blindly trust the interface and never probe for method
 * existence. Naming is dictated by the layer, not the backend: when a backend
 * exposes a different internal name it MUST be mapped inside the adapter.
 */
export interface CommerceClient {
  // ---- Catalog / Products ----
  getProducts(params?: Record<string, any>): Promise<Sf.SfProduct[]>;
  listProducts(params?: Record<string, any>): Promise<Sf.SfProduct[]>;
  getProductById(id: string): Promise<Sf.SfProduct | null>;
  getProductBySku(sku: string): Promise<Sf.SfProduct | null>;
  getProductBySlug(slug: string): Promise<Sf.SfProduct | null>;
  getProductByUrlKey(urlKey: string): Promise<Sf.SfProduct | null>;
  getBestSellingProducts(params?: Record<string, any>): Promise<Sf.SfProduct[]>;
  getNewestProducts(params?: Record<string, any>): Promise<Sf.SfProduct[]>;
  getRelatedProducts(id: string): Promise<Sf.SfProduct[]>;
  getProductRecommendations(id: string, limit?: number): Promise<Sf.SfProduct[]>;
  getRecommendations(params?: Record<string, any>): Promise<Sf.SfRecommendation[]>;
  getRecommendationRules(params?: Record<string, any>): Promise<Sf.SfRecommendationRule[]>;
  getSenseiRecommendations(params?: Record<string, any>): Promise<Sf.SfProduct[]>;
  sendRecommendation(payload: Record<string, any>): Promise<void>;
  getRelatedProductsRules(params?: Record<string, any>): Promise<any>;
  addProductLink(payload: Record<string, any>): Promise<void>;
  removeProductLink(payload: Record<string, any>): Promise<void>;

  // ---- Categories ----
  getCategories(params?: Record<string, any>): Promise<Sf.SfCategory[]>;
  getCategory(id: string): Promise<Sf.SfCategory | null>;
  getCategoryTree(params?: Record<string, any>): Promise<Sf.SfCategoryTree[]>;

  // ---- Cart ----
  getCart(): Promise<Sf.SfCart | null>;
  addCartLineItem(payload: Record<string, any>): Promise<Sf.SfCart>;
  updateCartLineItem(payload: Record<string, any>): Promise<Sf.SfCart>;
  removeCartLineItem(payload: Record<string, any>): Promise<Sf.SfCart>;
  applyCouponToCart(payload: Record<string, any>): Promise<Sf.SfCart>;
  removeCouponFromCart(payload: Record<string, any>): Promise<Sf.SfCart>;
  calculateCartPrices(payload: Record<string, any>): Promise<Sf.SfCart>;
  priceCartItem(payload: Record<string, any>): Promise<Sf.SfCart>;

  // ---- Checkout / Shipping ----
  estimateShippingMethods(payload: Record<string, any>): Promise<Sf.SfShippingMethod[]>;
  listShippingMethods(payload: Record<string, any>): Promise<Sf.SfShippingMethod[]>;
  selectShippingMethod(payload: Record<string, any>): Promise<Sf.SfCart>;
  setShippingMethod(payload: Record<string, any>): Promise<Sf.SfCart>;

  // ---- Customer / Address ----
  getCustomer(): Promise<Sf.SfCustomer | null>;
  createCustomerAddress(payload: Record<string, any>): Promise<Sf.SfCustomerAddress>;
  getCustomerAddresses(): Promise<Sf.SfCustomerAddress[]>;
  updateCustomerAddress(payload: Record<string, any>): Promise<Sf.SfCustomerAddress>;
  deleteCustomerAddress(id: string): Promise<void>;
  getCustomerGroups(): Promise<Sf.SfCustomerGroup[]>;

  // ---- Orders ----
  getOrders(params?: Record<string, any>): Promise<Sf.SfOrder[]>;
  listOrders(params?: Record<string, any>): Promise<Sf.SfOrder[]>;
  getOrder(id: string): Promise<Sf.SfOrder | null>;
  getOrderByIncrementId(incrementId: string): Promise<Sf.SfOrder | null>;
  createOrder(payload: Record<string, any>): Promise<Sf.SfOrder>;
  createPosOrder(payload: Record<string, any>): Promise<Sf.SfOrder>;
  orderBySku(payload: Record<string, any>): Promise<any>;

  // ---- Invoices ----
  getInvoices(orderId: string): Promise<Sf.SfInvoice[]>;
  listInvoices(params?: Record<string, any>): Promise<Sf.SfInvoice[]>;
  getInvoice(id: string): Promise<Sf.SfInvoice | null>;

  // ---- Shipments ----
  createShipment(payload: Record<string, any>): Promise<Sf.SfShipment>;
  bookShipment(payload: Record<string, any>): Promise<Sf.SfShipment>;
  cancelShipment(id: string): Promise<void>;
  cancelShipmentBooking(id: string): Promise<void>;
  trackShipment(id: string): Promise<Sf.SfShipment>;
  getTrackingInfo(payload: Record<string, any>): Promise<any>;

  // ---- Credit memos ----
  getCreditMemos(orderId: string): Promise<Sf.SfCreditMemo[]>;
  listCreditMemos(params?: Record<string, any>): Promise<Sf.SfCreditMemo[]>;
  getCreditMemo(id: string): Promise<Sf.SfCreditMemo | null>;

  // ---- Coupons / Rewards / Gift cards ----
  listCoupons(params?: Record<string, any>): Promise<Sf.SfCoupon[]>;
  applyCoupon(payload: Record<string, any>): Promise<void>;
  removeCoupon(payload: Record<string, any>): Promise<void>;
  validateCoupon(code: string): Promise<boolean>;
  getCoupon(code: string): Promise<Sf.SfCoupon | null>;
  getRewards(params?: Record<string, any>): Promise<Sf.SfRewardPoint[]>;
  listRewards(params?: Record<string, any>): Promise<Sf.SfRewardPoint[]>;
  getRewardBalance(customerId: string): Promise<number>;
  redeemReward(payload: Record<string, any>): Promise<void>;
  listGiftCards(params?: Record<string, any>): Promise<Sf.SfGiftCard[]>;
  listGiftCertificates(params?: Record<string, any>): Promise<Sf.SfGiftCard[]>;
  applyGiftCard(payload: Record<string, any>): Promise<void>;
  applyGiftCertificate(payload: Record<string, any>): Promise<void>;

  // ---- Compare ----
  addToCompare(payload: Record<string, any>): Promise<void>;
  removeFromCompare(payload: Record<string, any>): Promise<void>;
  getComparedProducts(): Promise<Sf.SfProduct[]>;

  // ---- Discounts / Promotions / Price rules ----
  listDiscounts(params?: Record<string, any>): Promise<any>;
  getPromotions(params?: Record<string, any>): Promise<any>;
  getDiscountForCart(cartId: string): Promise<any>;
  calculateDiscounts(payload: Record<string, any>): Promise<any>;
  getSpecialOffer(id: string): Promise<any>;
  listSpecialOffers(params?: Record<string, any>): Promise<any>;
  getCatalogPriceRules(params?: Record<string, any>): Promise<any>;
  listCatalogPriceRules(params?: Record<string, any>): Promise<any>;
  getCartPriceRules(params?: Record<string, any>): Promise<any>;
  listCartPriceRules(params?: Record<string, any>): Promise<any>;
  getCatalogPriceBySku(sku: string): Promise<any>;
  getCatalogPriceForProduct(productId: string): Promise<any>;
  getMinimumAdvertisedPrice(payload: Record<string, any>): Promise<any>;
  getSuggestedRetailPrice(payload: Record<string, any>): Promise<any>;

  // ---- Enterprise ----
  getDynamicBlockById(id: string): Promise<Sf.SfDynamicBlock | null>;
  listDynamicBlocks(params?: Record<string, any>): Promise<Sf.SfDynamicBlock[]>;
  getCatalogEventById(id: string): Promise<Sf.SfEvent | null>;
  listCatalogEvents(params?: Record<string, any>): Promise<Sf.SfEvent[]>;
  getCompanyCredits(companyId?: string): Promise<Sf.SfCompanyCredit | null>;
  updateCreditBalance(payload: Record<string, any>): Promise<Sf.SfCompanyCredit>;
  getGiftRegistryById(id: string): Promise<Sf.SfGiftRegistry | null>;
  listGiftRegistries(params?: Record<string, any>): Promise<Sf.SfGiftRegistry[]>;
  createGiftRegistry(payload: Record<string, any>): Promise<Sf.SfGiftRegistry>;
  updateGiftRegistry(payload: Record<string, any>): Promise<Sf.SfGiftRegistry>;
  addGiftRegistryItem(payload: Record<string, any>): Promise<void>;
  removeGiftRegistryItem(payload: Record<string, any>): Promise<void>;
  getStoreCredit(customerId?: string): Promise<Sf.SfStoreCredit>;
  updateStoreCredit(payload: Record<string, any>): Promise<Sf.SfStoreCredit>;
  applyStoreCreditToCart(payload: Record<string, any>): Promise<void>;
  getCatalogPermissions(userId?: string): Promise<any>;
  getUserRoles(userId?: string): Promise<Sf.SfRole[]>;
  createRMA(payload: Record<string, any>): Promise<Sf.SfRMARequest>;
  listReturns(params?: Record<string, any>): Promise<Sf.SfRMARequest[]>;
  getReturn(id: string): Promise<Sf.SfRMARequest | null>;
  createReturn(payload: Record<string, any>): Promise<Sf.SfRMARequest>;
  getNegotiableCredits(companyId?: string): Promise<Sf.SfNegotiableCredit>;
  applyCreditToQuote(payload: Record<string, any>): Promise<void>;
  getCompanyHierarchy(companyId?: string): Promise<any>;
  getTeams(companyId?: string): Promise<Sf.SfTeam[]>;
  listSharedCatalogs(params?: Record<string, any>): Promise<Sf.SfSharedCatalog[]>;
  getSharedCatalogById(id: string): Promise<Sf.SfSharedCatalog | null>;
  createCompanyAccount(payload: Record<string, any>): Promise<Sf.SfCompanyAccount>;
  getCompanyAccountById(id: string): Promise<Sf.SfCompanyAccount | null>;
  listCompanyAccounts(params?: Record<string, any>): Promise<Sf.SfCompanyAccount[]>;
  updateCompanyAccount(payload: Record<string, any>): Promise<Sf.SfCompanyAccount>;
  deleteCompanyAccount(id: string): Promise<void>;
  createApprovalRule(payload: Record<string, any>): Promise<any>;
  listApprovalRules(params?: Record<string, any>): Promise<any[]>;
  updateApprovalRule(payload: Record<string, any>): Promise<any>;
  deleteApprovalRule(id: string): Promise<void>;
  listAdminActionLogs(params?: Record<string, any>): Promise<any[]>;
  createPurchaseOrder(payload: Record<string, any>): Promise<Sf.SfPurchaseOrder>;
  getPurchaseOrderById(id: string): Promise<Sf.SfPurchaseOrder | null>;
  listPurchaseOrders(params?: Record<string, any>): Promise<Sf.SfPurchaseOrder[]>;
  updatePurchaseOrder(payload: Record<string, any>): Promise<Sf.SfPurchaseOrder>;
  deletePurchaseOrder(id: string): Promise<void>;
  createQuote(payload: Record<string, any>): Promise<Sf.SfNegotiableQuote>;
  getQuote(id: string): Promise<any>;
  listQuotes(params?: Record<string, any>): Promise<any[]>;
  acceptQuote(id: string): Promise<any>;
  createRequisitionList(payload: Record<string, any>): Promise<Sf.SfRequisitionList>;
  getRequisitionListById(id: string): Promise<Sf.SfRequisitionList | null>;
  listRequisitionLists(params?: Record<string, any>): Promise<Sf.SfRequisitionList[]>;
  updateRequisitionList(payload: Record<string, any>): Promise<Sf.SfRequisitionList>;
  deleteRequisitionList(id: string): Promise<void>;
  addRequisitionListItem(payload: Record<string, any>): Promise<void>;
  removeRequisitionListItem(payload: Record<string, any>): Promise<void>;
  getInvitations(params?: Record<string, any>): Promise<any[]>;
  sendInvitation(payload: Record<string, any>): Promise<void>;
  resendInvitation(id: string): Promise<void>;
  cancelInvitation(id: string): Promise<void>;
  listAffiliates(params?: Record<string, any>): Promise<Sf.SfAffiliate[]>;
  getAffiliateSummary(affiliateId?: string): Promise<Sf.SfAffiliate>;
  listChannels(params?: Record<string, any>): Promise<any[]>;
  setChannel(channel: string): Promise<void>;

  // ---- Content ----
  getPoll(id: string): Promise<any>;
  listPolls(params?: Record<string, any>): Promise<any[]>;
  votePoll(payload: Record<string, any>): Promise<void>;
  getGlossaryTermBySlug(slug: string): Promise<any>;
  listGlossaryTerms(params?: Record<string, any>): Promise<any[]>;

  // ---- Sales / Misc ----
  getStores(params?: Record<string, any>): Promise<Sf.SfStore[]>;
  listCarriers(params?: Record<string, any>): Promise<Sf.SfCarrier[]>;
  listRegisters(params?: Record<string, any>): Promise<any[]>;
  listPaymentGateways(params?: Record<string, any>): Promise<any[]>;
  getPaymentGateway(id: string): Promise<any>;
  listPayments(params?: Record<string, any>): Promise<any[]>;
  listTransactions(params?: Record<string, any>): Promise<any[]>;
  getTransaction(id: string): Promise<any>;
  listShippingIntegrations(params?: Record<string, any>): Promise<any[]>;
  addGiftMessage(payload: Record<string, any>): Promise<void>;
  getGiftMessages(params?: Record<string, any>): Promise<any[]>;
  updateGiftMessage(payload: Record<string, any>): Promise<void>;
  deleteGiftMessage(id: string): Promise<void>;
  listGiftWrappingOptions(params?: Record<string, any>): Promise<any[]>;
  addGiftWrapToCart(payload: Record<string, any>): Promise<void>;
  removeGiftWrapFromCart(payload: Record<string, any>): Promise<void>;
  sendToAFriend(payload: Record<string, any>): Promise<void>;
  tellAFriend(payload: Record<string, any>): Promise<void>;
  trackEvent(payload: Record<string, any>): Promise<void>;
  trackReferral(payload: Record<string, any>): Promise<void>;
  createReservation(payload: Record<string, any>): Promise<any>;
  listReservations(params?: Record<string, any>): Promise<any[]>;
  updateStock(payload: Record<string, any>): Promise<void>;
  getStock(payload: Record<string, any>): Promise<any>;
  getStockByProductId(sku: string): Promise<Sf.SfProductStockItem | null>;
  getStockBySku(sku: string): Promise<Sf.SfProductStockItem | null>;
  checkInventory(sku: string, qty: number): Promise<boolean>;
  listInventorySources(): Promise<Sf.SfInventorySource[]>;
  listInventorySourceItems(params: { sourceCode: string; skus: string[] }): Promise<Sf.SfStockItem[]>;
  assignStockToSource(payload: {
    sourceCode: string;
    sku: string;
    qty: number;
    status?: number;
  }): Promise<unknown>;

  // ---- Tax ----
  listTaxRates(params?: Record<string, any>): Promise<Sf.SfTaxRate[]>;
  listTax(params?: Record<string, any>): Promise<any>;

  /**
   * Low-level GraphQL request passthrough for ad-hoc queries the contract does
   * not yet cover. Kept intentionally narrow.
   */
  request<T = any>(document: string, variables?: Record<string, any>): Promise<T>;
}

function getRawCommerceClient(provider?: string, config?: any): any {
  try {
    const nuxtApp = useNuxtApp()
    const runtimeSdk = (nuxtApp.$sdk || {}) as any
    if (runtimeSdk.commerce) {
      return runtimeSdk.commerce
    }
  } catch {
    // useNuxtApp() can fail outside component context; fall back below
  }

  return (staticSdk as any)?.commerce || null
}

function createNormalizedClient(client: any) {
  if (!client) return client;
  if ((client as any).__normalized) return client;

  const wrapped: any = Object.create(client);

  if (typeof client.listProducts === 'function') {
    wrapped.listProducts = async (...args: any[]) => {
      const res = await client.listProducts(...args);
      return normalizeProductList(res);
    };
  }

  if (typeof client.getProduct === 'function') {
    wrapped.getProduct = async (...args: any[]) => {
      const res = await client.getProduct(...args);
      return normalizeProduct(res);
    };
  }

  if (typeof client.getProductBySku === 'function') {
    wrapped.getProductBySku = async (sku: string) => {
      const res = await client.getProductBySku(sku);
      return normalizeProduct(res);
    };
  }

  if (typeof client.getProductById === 'function') {
    wrapped.getProductById = async (id: string) => {
      const res = await client.getProductById(id);
      return normalizeProduct(res);
    };
  }

  if (typeof client.getProductBySlug === 'function') {
    wrapped.getProductBySlug = async (slug: string) => {
      const res = await client.getProductBySlug(slug);
      return normalizeProduct(res);
    };
  }

  if (typeof client.fetchProduct === 'function') {
    wrapped.fetchProduct = async (...args: any[]) => {
      const res = await client.fetchProduct(...args);
      return normalizeProduct(res);
    };
  }

  if (typeof client.getCategories === 'function') {
    wrapped.getCategories = async () => client.getCategories();
  }

  if (typeof client.getCategory === 'function') {
    wrapped.getCategory = async (id: string) => client.getCategory(id);
  }

  if (typeof client.getCategoryBySlug === 'function') {
    wrapped.getCategoryBySlug = async (slug: string) => client.getCategoryBySlug(slug);
  }

  if (typeof client.getCategoryTree === 'function') {
    wrapped.getCategoryTree = async () => client.getCategoryTree();
  }

  if (typeof client.getCart === 'function') {
    wrapped.getCart = async () => {
      const res = await client.getCart();
      return normalizeCart(res);
    };
  }

  if (typeof client.addCartLineItem === 'function') {
    wrapped.addCartLineItem = async (...args: any[]) => {
      const res = await client.addCartLineItem(...args);
      return normalizeCart(res);
    };
  }

  if (typeof client.updateCartLineItem === 'function') {
    wrapped.updateCartLineItem = async (...args: any[]) => {
      const res = await client.updateCartLineItem(...args);
      return normalizeCart(res);
    };
  }

  if (typeof client.removeCartLineItem === 'function') {
    wrapped.removeCartLineItem = async (...args: any[]) => {
      const res = await client.removeCartLineItem(...args);
      return normalizeCart(res);
    };
  }

  if (typeof client.applyCouponToCart === 'function') {
    wrapped.applyCouponToCart = async (...args: any[]) => {
      const res = await client.applyCouponToCart(...args);
      return normalizeCart(res);
    };
  }

  if (typeof client.removeCouponFromCart === 'function') {
    wrapped.removeCouponFromCart = async (...args: any[]) => {
      const res = await client.removeCouponFromCart(...args);
      return normalizeCart(res);
    };
  }

  if (typeof client.estimateShippingMethods === 'function') {
    wrapped.estimateShippingMethods = async (...args: any[]) => {
      const res = await client.estimateShippingMethods(...args);
      return normalizeShippingMethods(res);
    };
  }

  if (typeof client.listShippingMethods === 'function') {
    wrapped.listShippingMethods = async (...args: any[]) => {
      const res = await client.listShippingMethods(...args);
      return normalizeShippingMethods(res);
    };
  }

  if (typeof client.selectShippingMethod === 'function') {
    wrapped.selectShippingMethod = async (...args: any[]) => {
      const res = await client.selectShippingMethod(...args);
      return normalizeCart(res);
    };
  }

  if (typeof client.placeOrder === 'function') {
    wrapped.placeOrder = async (...args: any[]) => {
      const res = await client.placeOrder(...args);
      return normalizeOrder(res);
    };
  }

  if (typeof client.listOrders === 'function') {
    wrapped.listOrders = async () => {
      const res = await client.listOrders();
      return {
        orders: Array.isArray(res) ? res.map(normalizeOrder) : [],
        pagination: res?.pagination || {},
      };
    };
  }

  if (typeof client.getOrder === 'function') {
    wrapped.getOrder = async (id: string) => normalizeOrder(await client.getOrder(id));
  }

  if (typeof client.getOrderByIncrementId === 'function') {
    wrapped.getOrderByIncrementId = async (incrementId: string) =>
      normalizeOrder(await client.getOrderByIncrementId(incrementId));
  }

  if (typeof client.getInvoices === 'function') {
    wrapped.getInvoices = async (orderId: string) => {
      const res = await client.getInvoices(orderId);
      return {
        invoices: Array.isArray(res) ? res.map(normalizeInvoice) : [],
        pagination: res?.pagination || {},
      };
    };
  }

  if (typeof client.getShipments === 'function') {
    wrapped.getShipments = async (orderId: string) => {
      const res = await client.getShipments(orderId);
      return {
        shipments: Array.isArray(res) ? res.map(normalizeShipment) : [],
        pagination: res?.pagination || {},
      };
    };
  }

  if (typeof client.getCreditMemos === 'function') {
    wrapped.getCreditMemos = async (orderId: string) => {
      const res = await client.getCreditMemos(orderId);
      return {
        creditMemos: Array.isArray(res) ? res.map(normalizeCreditMemo) : [],
        pagination: res?.pagination || {},
      };
    };
  }

  if (typeof client.listProductReviews === 'function') {
    wrapped.listProductReviews = async (productId: string, params = {}) => {
      const res = await client.listProductReviews(productId, params);
      return {
        reviews: Array.isArray(res) ? res : res?.items || [],
        pagination: res?.pagination || {},
      };
    };
  }

  if (typeof client.listReturns === 'function') {
    wrapped.listReturns = async (params = {}) => {
      const res = await client.listReturns(params);
      return Array.isArray(res) ? res : res?.items || [];
    };
  }

  if (typeof client.createReturn === 'function') {
    wrapped.createReturn = async (data: any) => client.createReturn(data);
  }

  if (typeof client.getStockByProductId === 'function') {
    wrapped.getStockByProductId = async (productId: string) => client.getStockByProductId(productId);
  }

  if (typeof client.updateStock === 'function') {
    wrapped.updateStock = async (payload: any) => client.updateStock(payload);
  }

  if (typeof client.checkInventory === 'function') {
    wrapped.checkInventory = async (sku: string, qty: number) => client.checkInventory(sku, qty);
  }

  if (typeof client.listTransactions === 'function') {
    wrapped.listTransactions = async (params = {}) => {
      const res = await client.listTransactions(params);
      return Array.isArray(res) ? res : res?.items || [];
    };
  }

  if (typeof client.listCatalogPriceRules === 'function') {
    wrapped.listCatalogPriceRules = async (params = {}) => client.listCatalogPriceRules(params);
  }

  if (typeof client.listCartPriceRules === 'function') {
    wrapped.listCartPriceRules = async (params = {}) => client.listCartPriceRules(params);
  }

  if (typeof client.searchProducts === 'function') {
    wrapped.searchProducts = async (params = {}) => {
      const res = await client.searchProducts(params);
      return {
        products: res?.items || [],
        pagination: res?.pagination || {},
        facets: res?.aggregations || [],
        suggestions: res?.suggestions || [],
      };
    };
  }

  if (typeof client.searchAutocomplete === 'function') {
    wrapped.searchAutocomplete = async (params = {}) => {
      const res = await client.searchAutocomplete(params);
      return {
        products: res?.items || [],
        suggestions: res?.suggestions || [],
      };
    };
  }

  if (typeof client.getProductSearchSuggestions === 'function') {
    wrapped.getProductSearchSuggestions = async (keyword: string, limit: number) =>
      client.getProductSearchSuggestions(keyword, limit);
  }

  if (typeof client.getProductMediaGalleryEntries === 'function') {
    wrapped.getProductMediaGalleryEntries = async (productId: string) =>
      client.getProductMediaGalleryEntries(productId);
  }

  (wrapped as any).__normalized = true;
  return wrapped;
}

function normalizeProductList(res: any): any {
  if (Array.isArray(res)) {
    return res.map(normalizeProduct);
  }
  if (res && Array.isArray(res.items)) {
    return res.items.map(normalizeProduct);
  }
  return res;
}

function normalizeProduct(res: any): any {
  if (!res || typeof res !== 'object') return res;

  const priceRange = res.price_range || res.priceRange || {};
  const maximumPrice = priceRange?.maximum_price || priceRange?.maximumPrice || {};
  const minimumPrice = priceRange?.minimum_price || priceRange?.minimumPrice || {};
  const finalPrice = maximumPrice?.final_price || maximumPrice?.finalPrice || minimumPrice?.final_price || minimumPrice?.finalPrice;
  const regularPrice = maximumPrice?.regular_price || maximumPrice?.regularPrice || minimumPrice?.regular_price || minimumPrice?.regularPrice;

  return {
    ...res,
    price: res.price ? {
      regular: regularPrice?.value || res.price?.regular || res.price?.regular_price || res.price?.value || 0,
      final: finalPrice?.value || res.price?.final || res.price?.final_price || res.price?.value || 0,
      currency: finalPrice?.currency || regularPrice?.currency || res.currency || 'USD',
    } : undefined,
  };
}

function normalizeCart(res: any): any {
  if (!res || typeof res !== 'object') return res;
  return {
    ...res,
    totals: res.totals ? {
      subtotal: res.totals.subtotal || { currency: res.currency || 'USD', amount: 0, precisionAmount: '0.00' },
      subtotalExclTax: res.totals.subtotal_excl_tax || res.totals.subtotalExclTax || { currency: res.currency || 'USD', amount: 0, precisionAmount: '0.00' },
      subtotalInclTax: res.totals.subtotal_incl_tax || res.totals.subtotalInclTax || { currency: res.currency || 'USD', amount: 0, precisionAmount: '0.00' },
      discount: res.totals.discount || { currency: res.currency || 'USD', amount: 0, precisionAmount: '0.00' },
      grandTotal: res.totals.grand_total || res.totals.grandTotal || { currency: res.currency || 'USD', amount: 0, precisionAmount: '0.00' },
    } : undefined,
  };
}

function normalizeOrder(res: any): any {
  if (!res || typeof res !== 'object') return res;
  return {
    ...res,
    orderNumber: res.increment_id || res.orderNumber,
    state: res.state || 'new',
    subtotal: {
      value: res.subtotal || 0,
      currency: res.order_currency_code || res.currency || 'USD',
    },
    grandTotal: {
      value: res.grand_total || 0,
      currency: res.order_currency_code || res.currency || 'USD',
    },
    shippingAmount: {
      value: res.shipping_amount || 0,
      currency: res.order_currency_code || res.currency || 'USD',
    },
    taxAmount: {
      value: res.tax_amount || 0,
      currency: res.order_currency_code || res.currency || 'USD',
    },
  };
}

function normalizeInvoice(res: any): any {
  if (!res || typeof res !== 'object') return res;
  return {
    ...res,
    incrementId: res.increment_id,
  };
}

function normalizeShipment(res: any): any {
  if (!res || typeof res !== 'object') return res;
  return {
    ...res,
    incrementId: res.increment_id,
    shipmentNumber: res.shipment_number,
    trackingNumber: res.tracking_number,
  };
}

function normalizeCreditMemo(res: any): any {
  if (!res || typeof res !== 'object') return res;
  return {
    ...res,
    incrementId: res.increment_id,
    creditMemoNumber: res.creditmemo_number,
  };
}

function normalizeShippingMethods(res: any): any {
  if (!res || typeof res !== 'object') return res;
  if (Array.isArray(res)) {
    return { methods: res };
  }
  if (Array.isArray(res.methods)) {
    return res;
  }
  return { methods: [] };
}

export function getCommerceClient(provider?: string, config?: any): any {
  const raw = getRawCommerceClient(provider, config);
  return createNormalizedClient(raw);
}

export default getCommerceClient;
