import type { Maybe } from '~/composables/system/models/shared';
import type { SfCart } from '../../models';
import { getCartProvider } from './registry'
import { toRefs } from '@vueuse/shared';
import type { UseCartReturn, UseCartState, FetchCart, CartProvider } from './types';
import { getCommerceClient } from '../../../../utils/client';
import { useState, useRuntimeConfig } from 'nuxt/app';
import { ref } from 'vue';

/**
 * @description Composable for managing cart.
 * @returns {@link UseCartReturn}
 * @example
 * const { data, loading } = useCart();
 */
export const useCart: UseCartReturn = () => {
  const _cfg: any = (typeof (useRuntimeConfig as any) === 'function') ? (useRuntimeConfig as any)() : (useRuntimeConfig || { public: {} })
  const providerName = (_cfg && _cfg.public && _cfg.public.cartProvider) ? _cfg.public.cartProvider : 'default'
  const emptyCart = { id: '', items: [], total: 0 }
  const stubProvider: CartProvider = {
    getCart: async () => emptyCart,
    addItem: async () => emptyCart,
    removeItem: async () => emptyCart,
    clearCart: async () => emptyCart,
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

  /**
   * @description Function for fetching the cart.
   * @example
   * getCart();
   */
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
      // wrap the returned ref into our Vue ref to avoid cross-package Ref mismatch
      return ref<Maybe<SfCart>>(state.value.data);
    } catch (error) {
      throw new Error(error as string);
    } finally {
      state.value.loading = false;
    }
  };

  // Backward-compatible alias for existing callers using the old typo.
  const fetchCard = fetchCart;

  return {
    fetchCart,
    fetchCard,
    ...toRefs(state.value),
    getCart: provider.getCart,
    addItem: provider.addItem,
    removeItem: provider.removeItem,
    clearCart: provider.clearCart
  };
};
