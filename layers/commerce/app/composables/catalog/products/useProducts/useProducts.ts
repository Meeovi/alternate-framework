import { toRefs } from '@vueuse/shared';
import { computed } from 'vue';
import type { Ref } from 'vue';
import type { FetchProducts, UseProductsReturn, UseProductsState } from './types';
import { getCommerceClient } from '../../../../utils/client';
import { useAsyncData, useState } from 'nuxt/app';
import type { Maybe } from '../../../models/shared';

/**
 * @description Composable for managing products.
 * @returns {@link UseProducts}
 * @example
 * const { data, loading, fetchProducts } = useProducts();
 */
export const useProducts: UseProductsReturn = () => {
  const state = useState<UseProductsState>('products', () => ({
    data: null,
    loading: false,
  }));

  /**
   * @description Function for fetching products.
   * @example
   * getProducts();
   */
  const fetchProducts: FetchProducts = async () => {
    state.value.loading = true;
    const client = getCommerceClient();
    if (!client || typeof (client as any).listProducts !== 'function') {
      state.value.data = [] as unknown as UseProductsState['data'];
      state.value.loading = false;
      return computed(() => state.value.data) as unknown as Ref<UseProductsState['data']>;
    }

    const { data, error } = await useAsyncData('commerce:products:list', () => (client as any).listProducts());
    if (error.value) {
      // Keep startup resilient when provider is not configured.
      state.value.data = [] as unknown as UseProductsState['data'];
      state.value.loading = false;
      return computed(() => state.value.data) as unknown as Ref<UseProductsState['data']>;
    }

    state.value.data = data.value as unknown as UseProductsState['data'];
    state.value.loading = false;
    return computed(() => state.value.data) as unknown as Ref<UseProductsState['data']>;
  };

  return {
    fetchProducts,
    ...toRefs(state.value),
  };
};
