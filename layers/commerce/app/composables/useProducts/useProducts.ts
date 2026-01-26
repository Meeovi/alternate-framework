import { toRefs } from '@vueuse/shared';
import { computed } from 'vue';
import type { Ref } from 'vue';
import { FetchProducts, UseProductsReturn, UseProductsState } from './types';
import { getCommerceClient } from '../../utils/client';
import { useAsyncData, useState } from 'nuxt/app';
import { useHandleError } from '../useHandleError';
import type { Maybe } from '../_types';

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
    const { data, error } = await useAsyncData(() => client.listProducts?.());
    useHandleError(error.value);
    state.value.data = data.value as unknown as UseProductsState['data'];
    state.value.loading = false;
    return computed(() => state.value.data) as unknown as Ref<UseProductsState['data']>;
  };

  return {
    fetchProducts,
    ...toRefs(state.value),
  };
};
