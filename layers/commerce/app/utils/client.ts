import * as CommercePkg from '~/types';
import { sdk } from '@mframework/core';
import imports from '../types';
import { normalizeProductsQueryOutput, normalizeProduct } from '../normalizers/ProductList.type';
import { normalizeProductsResponse } from '../normalizers/ProductList.query';
import { normalizeMenuResponse } from '../normalizers/Menu.query';
import { normalizeCategoryResponse } from '../normalizers/Category.query';
import { normalizeCompareResponse } from '../normalizers/ProductCompare.query';
import { normalizeStoresResponse } from '../normalizers/StoreInPickUp.query';
import { normalizeCmsPage } from '../normalizers/CmsPage.type';
import { normalizeUrlRewrite } from '../normalizers/UrlRewrites.query';
import { normalizeWishlistResponse } from '../normalizers/Wishlist.query';
import { normalizeCart } from '../normalizers/Cart.type';
import { normalizeOrder } from '../normalizers/Order.type';
import { normalizeReview } from '../normalizers/Review.type';
import { normalizeGiftCard, normalizeGiftCards } from '../normalizers/GiftCard.type';
import { normalizeSubscription, normalizeSubscriptions } from '../normalizers/Subscription.type';
import { normalizeReturn, normalizeReturns } from '../normalizers/Return.type';
import { normalizeCreditMemo, normalizeCreditMemos } from '../normalizers/CreditMemo.type';
import { normalizeInvoice, normalizeInvoices } from '../normalizers/Invoice.type';
import { normalizeTransaction, normalizeTransactions } from '../normalizers/Transaction.type';
import { normalizePayment, normalizePayments } from '../normalizers/Payment.type';

function getRawCommerceClient(provider?: string, config?: any): any {
  try {
    if (typeof (imports as any)?.createClient === 'function') {
      return (imports as any).createClient(provider, config);
    }
    if (typeof (imports as any)?.init === 'function') {
      return (imports as any).init(config);
    }
    if ((imports as any).commerce) return (imports as any).commerce;
  } catch (e) {
    // ignore and continue to other fallbacks
  }

  try {
    const CommerceAny: any = CommercePkg as any;
    if (typeof CommerceAny?.createClient === 'function') return CommerceAny.createClient(provider, config);
    if (typeof CommerceAny?.init === 'function') return CommerceAny.init(config);
    if (CommerceAny?.commerce) return CommerceAny.commerce;
  } catch (e) {
    // ignore and fallback to sdk
  }

  return (sdk as any)?.commerce || null;
}

function createNormalizedClient(client: any) {
  if (!client) return client;
  if ((client as any).__normalized) return client;

  const wrapped: any = Object.create(client);

  if (typeof client.listProducts === 'function') {
    wrapped.listProducts = async (...args: any[]) => {
      const res = await client.listProducts(...args);
      try {
        // prefer the type-level normalizer but also accept query-level responses
        return normalizeProductsQueryOutput(res) || normalizeProductsResponse(res);
      } catch (e) {
        return res;
      }
    };
  }

  // Menu endpoints
  const menuMethods = ['getMenu', 'getMenus', 'listMenus', 'listMenu', 'getMenuItems', 'listMenuItems'];
  for (const m of menuMethods) {
    if (typeof client[m] === 'function') {
      wrapped[m] = async (...args: any[]) => {
        const res = await client[m](...args);
        try {
          return normalizeMenuResponse(res);
        } catch (e) {
          return res;
        }
      };
    }
  }

  // Category endpoints
  const categoryMethods = ['getCategory', 'getCategoryBySlug', 'getCategories', 'listCategories', 'getCategoryTree'];
  for (const m of categoryMethods) {
    if (typeof client[m] === 'function') {
      wrapped[m] = async (...args: any[]) => {
        const res = await client[m](...args);
        try {
          return normalizeCategoryResponse(res);
        } catch (e) {
          return res;
        }
      };
    }
  }

  // CMS / pages
  const cmsMethods = ['getPage', 'getCmsPage', 'getPageBySlug', 'listPages', 'getPages'];
  for (const m of cmsMethods) {
    if (typeof client[m] === 'function') {
      wrapped[m] = async (...args: any[]) => {
        const res = await client[m](...args);
        try { return normalizeCmsPage(res); } catch (e) { return res; }
      };
    }
  }

  // URL rewrites / resolver
  const urlMethods = ['resolveUrl', 'getUrlRewrite', 'urlResolver', 'findUrl'];
  for (const m of urlMethods) {
    if (typeof client[m] === 'function') {
      wrapped[m] = async (...args: any[]) => {
        const res = await client[m](...args);
        try { return normalizeUrlRewrite(res); } catch (e) { return res; }
      };
    }
  }

  // Wishlist
  const wishlistMethods = ['getWishlist', 'listWishlist', 'getWishlistById', 'getWishlistItems'];
  for (const m of wishlistMethods) {
    if (typeof client[m] === 'function') {
      wrapped[m] = async (...args: any[]) => {
        const res = await client[m](...args);
        try { return normalizeWishlistResponse(res); } catch (e) { return res; }
      };
    }
  }

  // Compare / product compare
  const compareMethods = ['getCompare', 'listCompare', 'compareProducts', 'getCompareList'];
  for (const m of compareMethods) {
    if (typeof client[m] === 'function') {
      wrapped[m] = async (...args: any[]) => {
        const res = await client[m](...args);
        try { return normalizeCompareResponse(res); } catch (e) { return res; }
      };
    }
  }

  // Stores / pickup
  const storeMethods = ['listStores', 'getStores', 'getStore', 'listPickUpStores', 'getStoresInPickUp'];
  for (const m of storeMethods) {
    if (typeof client[m] === 'function') {
      wrapped[m] = async (...args: any[]) => {
        const res = await client[m](...args);
        try { return normalizeStoresResponse(res); } catch (e) { return res; }
      };
    }
  }

  if (typeof client.getProductById === 'function') {
    wrapped.getProductById = async (...args: any[]) => {
      const res = await client.getProductById(...args);
      try {
        return normalizeProduct(res);
      } catch (e) {
        return res;
      }
    };
  }

  if (typeof client.getProductBySlug === 'function') {
    wrapped.getProductBySlug = async (...args: any[]) => {
      const res = await client.getProductBySlug(...args);
      try {
        return normalizeProduct(res);
      } catch (e) {
        return res;
      }
    };
  }

  if (typeof client.getProduct === 'function') {
    wrapped.getProduct = async (...args: any[]) => {
      const res = await client.getProduct(...args);
      try {
        return normalizeProduct(res);
      } catch (e) {
        return res;
      }
    };
  }

  const cartMethods = ['getCart', 'createCart', 'addToCart', 'updateCart', 'removeFromCart', 'applyCoupon', 'setShippingAddress'];
  for (const m of cartMethods) {
    if (typeof client[m] === 'function') {
      wrapped[m] = async (...args: any[]) => {
        const res = await client[m](...args);
        try {
          return normalizeCart(res);
        } catch (e) {
          return res;
        }
      };
    }
  }

  // Order methods: normalize single orders and lists of orders
  if (typeof client.listOrders === 'function') {
    wrapped.listOrders = async (...args: any[]) => {
      const res = await client.listOrders(...args);
      try {
        if (Array.isArray(res)) return res.map(normalizeOrder);
        if (res && Array.isArray(res.items)) return res.items.map(normalizeOrder);
        return res;
      } catch (e) {
        return res;
      }
    };
  }

  const orderSingles = ['getOrder', 'getOrderById', 'getOrders'];
  for (const m of orderSingles) {
    if (typeof client[m] === 'function') {
      wrapped[m] = async (...args: any[]) => {
        const res = await client[m](...args);
        try {
          return normalizeOrder(res);
        } catch (e) {
          return res;
        }
      };
    }
  }

  // Returns
  if (typeof client.listReturns === 'function') {
    wrapped.listReturns = async (...args: any[]) => {
      const res = await client.listReturns(...args);
      try { if (Array.isArray(res)) return normalizeReturns(res); if (res && Array.isArray(res.items)) return normalizeReturns(res.items); return res; } catch (e) { return res; }
    };
  }
  if (typeof client.getReturn === 'function') {
    wrapped.getReturn = async (...args: any[]) => { const res = await client.getReturn(...args); try { return normalizeReturn(res); } catch (e) { return res; } };
  }
  if (typeof client.createReturn === 'function') {
    wrapped.createReturn = async (...args: any[]) => { const res = await client.createReturn(...args); try { return normalizeReturn(res); } catch (e) { return res; } };
  }

  // Credit memos
  if (typeof client.listCreditMemos === 'function') {
    wrapped.listCreditMemos = async (...args: any[]) => {
      const res = await client.listCreditMemos(...args);
      try { if (Array.isArray(res)) return normalizeCreditMemos(res); if (res && Array.isArray(res.items)) return normalizeCreditMemos(res.items); return res; } catch (e) { return res; }
    };
  }
  if (typeof client.getCreditMemo === 'function') {
    wrapped.getCreditMemo = async (...args: any[]) => { const res = await client.getCreditMemo(...args); try { return normalizeCreditMemo(res); } catch (e) { return res; } };
  }

  // Invoices
  if (typeof client.listInvoices === 'function') {
    wrapped.listInvoices = async (...args: any[]) => {
      const res = await client.listInvoices(...args);
      try { if (Array.isArray(res)) return normalizeInvoices(res); if (res && Array.isArray(res.items)) return normalizeInvoices(res.items); return res; } catch (e) { return res; }
    };
  }
  if (typeof client.getInvoice === 'function') {
    wrapped.getInvoice = async (...args: any[]) => { const res = await client.getInvoice(...args); try { return normalizeInvoice(res); } catch (e) { return res; } };
  }

  // Transactions
  if (typeof client.listTransactions === 'function') {
    wrapped.listTransactions = async (...args: any[]) => {
      const res = await client.listTransactions(...args);
      try { if (Array.isArray(res)) return normalizeTransactions(res); if (res && Array.isArray(res.items)) return normalizeTransactions(res.items); return res; } catch (e) { return res; }
    };
  }
  if (typeof client.getTransaction === 'function') {
    wrapped.getTransaction = async (...args: any[]) => { const res = await client.getTransaction(...args); try { return normalizeTransaction(res); } catch (e) { return res; } };
  }

  // Payments
  if (typeof client.listPayments === 'function') {
    wrapped.listPayments = async (...args: any[]) => {
      const res = await client.listPayments(...args);
      try { if (Array.isArray(res)) return normalizePayments(res); if (res && Array.isArray(res.items)) return normalizePayments(res.items); return res; } catch (e) { return res; }
    };
  }
  if (typeof client.getPayment === 'function') {
    wrapped.getPayment = async (...args: any[]) => { const res = await client.getPayment(...args); try { return normalizePayment(res); } catch (e) { return res; } };
  }
  if (typeof client.createPaymentIntent === 'function') {
    wrapped.createPaymentIntent = async (...args: any[]) => { const res = await client.createPaymentIntent(...args); try { return normalizePayment(res); } catch (e) { return res; } };
  }
  if (typeof client.createPayment === 'function') {
    wrapped.createPayment = async (...args: any[]) => { const res = await client.createPayment(...args); try { return normalizePayment(res); } catch (e) { return res; } };
  }
  if (typeof client.capturePayment === 'function') {
    wrapped.capturePayment = async (...args: any[]) => { const res = await client.capturePayment(...args); try { return normalizePayment(res); } catch (e) { return res; } };
  }
  if (typeof client.refundPayment === 'function') {
    wrapped.refundPayment = async (...args: any[]) => { const res = await client.refundPayment(...args); try { return normalizePayment(res); } catch (e) { return res; } };
  }

  // Reviews
  if (typeof client.listReviews === 'function') {
    wrapped.listReviews = async (...args: any[]) => {
      const res = await client.listReviews(...args);
      try {
        if (Array.isArray(res)) return res.map(normalizeReview);
        if (res && Array.isArray(res.items)) return res.items.map(normalizeReview);
        return res;
      } catch (e) {
        return res;
      }
    };
  }

  if (typeof client.getReview === 'function') {
    wrapped.getReview = async (...args: any[]) => {
      const res = await client.getReview(...args);
      try { return normalizeReview(res); } catch (e) { return res; }
    };
  }

  // Gift cards
  if (typeof client.listGiftCards === 'function') {
    wrapped.listGiftCards = async (...args: any[]) => {
      const res = await client.listGiftCards(...args);
      try { return normalizeGiftCards(res); } catch (e) { return res; }
    };
  }
  if (typeof client.getGiftCard === 'function') {
    wrapped.getGiftCard = async (...args: any[]) => {
      const res = await client.getGiftCard(...args);
      try { return normalizeGiftCard(res); } catch (e) { return res; }
    };
  }

  if (typeof client.redeemGiftCard === 'function') {
    wrapped.redeemGiftCard = async (...args: any[]) => {
      const res = await client.redeemGiftCard(...args);
      try { return normalizeGiftCard(res); } catch (e) { return res; }
    };
  }

  // Subscriptions
  if (typeof client.listSubscriptions === 'function') {
    wrapped.listSubscriptions = async (...args: any[]) => {
      const res = await client.listSubscriptions(...args);
      try { return normalizeSubscriptions(res); } catch (e) { return res; }
    };
  }
  if (typeof client.getSubscription === 'function') {
    wrapped.getSubscription = async (...args: any[]) => {
      const res = await client.getSubscription(...args);
      try { return normalizeSubscription(res); } catch (e) { return res; }
    };
  }
  if (typeof client.subscribe === 'function') {
    wrapped.subscribe = async (...args: any[]) => {
      const res = await client.subscribe(...args);
      try { return normalizeSubscription(res); } catch (e) { return res; }
    };
  }

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
