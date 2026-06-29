import type { DefineAddCustomFields, NormalizersConstraint } from "./types";
import type { UnifiedMethods } from "../methods";

export type DefineApi<TContext = Record<string, unknown>> = {
  [TKey in keyof UnifiedMethods]: (
    fn: (
      context: TContext,
      ...args: Parameters<UnifiedMethods[TKey]>
    ) => ReturnType<UnifiedMethods[TKey]>,
  ) => (
    context: TContext,
    ...args: Parameters<UnifiedMethods[TKey]>
  ) => ReturnType<UnifiedMethods[TKey]>;
};

export function getApiDefinitions<TContext = Record<string, unknown>>(): DefineApi<TContext> {
  return {
    getCategories: (fn) => fn,
    getCategory: (fn) => fn,
    getCategoryTree: (fn) => fn,
    getCategoryProducts: (fn) => fn,
    createCategory: (fn) => fn,
    updateCategory: (fn) => fn,
    deleteCategory: (fn) => fn,
    getCart: (fn) => fn,
    addCartLineItem: (fn) => fn,
    updateCartLineItem: (fn) => fn,
    removeCartLineItem: (fn) => fn,
    applyCouponToCart: (fn) => fn,
    removeCouponFromCart: (fn) => fn,
    splitCart: (fn) => fn,
    setCustomerEmail: (fn) => fn,
    setCartAddress: (fn) => fn,
    getAvailableShippingMethods: (fn) => fn,
    setShippingMethod: (fn) => fn,
    setPaymentMethod: (fn) => fn,
    getPaymentMethods: (fn) => fn,
    placeOrder: (fn) => fn,
    registerCustomer: (fn) => fn,
    loginCustomer: (fn) => fn,
    getCustomer: (fn) => fn,
    logoutCustomer: (fn) => fn,
    updateCustomer: (fn) => fn,
    changeCustomerPassword: (fn) => fn,
    getCustomerGroups: (fn) => fn,
    searchProducts: (fn) => fn,
    searchAutocomplete: (fn) => fn,
    getProductSearchSuggestions: (fn) => fn,
    getProducts: (fn) => fn,
    getProductDetails: (fn) => fn,
    getProductReviews: (fn) => fn,
    getProductPrice: (fn) => fn,
    getProductMediaGalleryEntries: (fn) => fn,
    getCatalogPriceRules: (fn) => fn,
    getCartPriceRules: (fn) => fn,
    createCustomerAddress: (fn) => fn,
    getCustomerAddresses: (fn) => fn,
    updateCustomerAddress: (fn) => fn,
    deleteCustomerAddress: (fn) => fn,
    getCurrencies: (fn) => fn,
    getExchangeRates: (fn) => fn,
    getOrders: (fn) => fn,
    getOrderDetails: (fn) => fn,
    getInvoices: (fn) => fn,
    getInvoice: (fn) => fn,
    getShipments: (fn) => fn,
    getShipment: (fn) => fn,
    getCreditMemos: (fn) => fn,
    getCreditMemo: (fn) => fn,
    getBrandBar: (fn) => fn,
    getContentPage: (fn) => fn,
    getDotdigitalChatConfig: (fn) => fn,
    getProductRssFeeds: (fn) => fn,
    getProductRssLink: (fn) => fn,
  };
}

export function defineAddCustomFieldsFactory<TNormalizers extends NormalizersConstraint>() {
  return <TInput extends DefineAddCustomFields<TNormalizers>>(input: TInput) => {
    return input;
  };
}
