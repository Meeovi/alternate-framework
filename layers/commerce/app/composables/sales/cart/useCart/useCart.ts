import type { Maybe } from '~/composables/system/models/shared';
import type { SfCart, SfCartLineItem, SfShippingMethod } from '~/composables/system/models';
import { getCartProvider } from './registry'
import { toRefs } from '@vueuse/shared';
import type { UseCartReturn, UseCartState, FetchCart, CartProvider } from '~/types/cart';
import { getCommerceClient } from '../../../../utils/client';
import { useState, useRuntimeConfig } from 'nuxt/app';
import { ref } from 'vue';

export const useCart: UseCartReturn = () => {
  const _cfg: any = (typeof (useRuntimeConfig as any) === 'function') ? (useRuntimeConfig as any)() : (useRuntimeConfig || { public: {} })
  const providerName = (_cfg && _cfg.public && _cfg.public.cartProvider) ? _cfg.public.cartProvider : 'default'
  const emptyCart = { id: '', quoteId: '', items: [], total: 0, subtotal: 0, grandTotal: 0, taxAmount: 0, shippingAmount: 0, discountAmount: 0, currency: 'USD', itemsCount: 0, customerIsGuest: true } as any
  const stubProvider: CartProvider = {
    getCart: async () => emptyCart,
    getGuestCart: async () => emptyCart,
    createEmptyCart: async () => emptyCart,
    addCartLineItem: async () => emptyCart,
    updateCartLineItem: async () => emptyCart,
    removeCartLineItem: async () => emptyCart,
    clearCart: async () => emptyCart,
    estimateShippingMethods: async () => ({ methods: [] }),
    selectShippingMethod: async () => emptyCart,
    selectPaymentMethod: async () => emptyCart,
    applyCoupon: async () => emptyCart,
    removeCoupon: async () => emptyCart,
  }
  let provider: CartProvider
  try {
    provider = getCartProvider(providerName)
  } catch {
    provider = stubProvider
  }
  const state = useState<UseCartState>('useCart', () => ({
    data: null,
    loading: false,
  }));

  const fetchCart: FetchCart = async () => {
    state.value.loading = true;
    try {
      const client = getCommerceClient();
      if (!client || typeof client.getCart !== 'function') {
        state.value.data = null;
        return ref<Maybe<SfCart>>(state.value.data);
      }

      const data = await client.getCart();
      state.value.data = data ?? null;
      return ref<Maybe<SfCart>>(state.value.data);
    } catch (error) {
      throw new Error(error as string);
    } finally {
      state.value.loading = false;
    }
  };

  const persistentCartState = useState<UseCartState>('persistentCart', () => ({
    data: null,
    loading: false,
  }));

  const cartPriceRules = useState('cartPriceRules', () => ({
    data: null,
    loading: false,
  }));

  const fetchCartPriceRules = async (): Promise<void> => {
    cartPriceRules.value.loading = true;
    try {
      const client = getCommerceClient();
      if (!client || typeof client.getCartPriceRules !== 'function') {
        cartPriceRules.value.data = null;
        return;
      }

      const data = await client.getCartPriceRules();
      cartPriceRules.value.data = data ?? null;
    } catch (error) {
      throw new Error(error as string);
    } finally {
      cartPriceRules.value.loading = false;
    }
  };

  const splitCart = async (payload: {
    customerId: string
    storeId: string
    websiteId: string
    regionCode: string
    postcode: string
  }): Promise<SfCart> => {
    const client = getCommerceClient();
    if (!client || typeof client.splitCart !== 'function') {
      throw new Error('splitCart not supported by provider')
    }
    return client.splitCart(payload);
  };

  const fetchCard = fetchCart;

  return {
    fetchCart,
    fetchCard,
    fetchCartPriceRules,
    splitCart,
    ...toRefs(state.value),
    ...toRefs(persistentCartState.value),
    ...toRefs(cartPriceRules.value),
    getCart: provider.getCart,
    getGuestCart: provider.getGuestCart,
    createEmptyCart: provider.createEmptyCart,
    addItem: provider.addCartLineItem,
    updateItem: provider.updateCartLineItem,
    removeItem: provider.removeCartLineItem,
    clearCart: provider.clearCart,
    estimateShippingMethods: provider.estimateShippingMethods,
    selectShippingMethod: provider.selectShippingMethod,
    selectPaymentMethod: provider.selectPaymentMethod,
    applyCoupon: provider.applyCoupon,
    removeCoupon: provider.removeCoupon,
  };
};
