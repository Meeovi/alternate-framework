import type { Maybe } from '~/composables/system/models/shared';
import type { SfCart } from '../../models';
import { getCartProvider } from './registry'
import { toRefs } from '@vueuse/shared';
import type { UseCartReturn, UseCartState, FetchCard } from './types';
import { getCommerceClient } from '../../../../utils/client';
import { useAsyncData, useState, useRuntimeConfig } from 'nuxt/app';
import { useHandleError } from '../../../system/useHandleError';
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
  const provider = getCartProvider(providerName)
  const state = useState<UseCartState>('useCart', () => ({
    data: null,
    loading: false,
  }));

  /**
   * @description Function for fetching the cart.
   * @example
   * getCart();
   */
  const fetchCard: FetchCard = async () => {
    state.value.loading = true;
    try {
      const client = getCommerceClient();
      const { data, error } = await useAsyncData<SfCart>(() => client.getCart?.());
      useHandleError(error.value);
      state.value.data = data.value ?? null;
      // wrap the returned ref into our Vue ref to avoid cross-package Ref mismatch
      return ref<Maybe<SfCart>>(state.value.data);
    } catch (error) {
      throw new Error(error as string);
    } finally {
      state.value.loading = false;
    }
  };

  return {
    fetchCard,
    ...toRefs(state.value),
    getCart: provider.getCart,
    addItem: provider.addItem,
    removeItem: provider.removeItem,
    clearCart: provider.clearCart
  };
};
