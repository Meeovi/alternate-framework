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

function getRawCommerceClient(provider?: string, config?: any): any {
  return (sdk as any)?.commerce || null;
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
