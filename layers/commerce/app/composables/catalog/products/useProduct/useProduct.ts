import { toRefs } from '@vueuse/shared';
import { computed } from 'vue';
import type { Ref } from 'vue';
import type { SfProduct } from '~/composables/system/models';
import type { Maybe } from '~/composables/system/models';
import type { UseProductReturn, UseProductState, FetchProduct } from './types';
import { getCommerceClient } from '../../../../utils/client';
import { useAsyncData, useState } from 'nuxt/app';
import { useHandleError } from '../../../system/useHandleError/useHandleError';

/**
 * @description Composable managing product data
 * @param {string} slug Product slug
 * @returns {@link UseProductReturn}
 * @example
 * const { data, loading, fetchProduct } = useProduct('product-slug');
 */
export const useProduct: UseProductReturn = (slug) => {
  const state = useState<UseProductState>(`useProduct-${slug}`, () => ({
    data: null as Maybe<SfProduct>,
    loading: false,
  }));

  /** Function for fetching product data
   * @param {string} slug Product slug
   * @example
   * fetchProduct('product-slug');
   */
  const fetchProduct: FetchProduct = async (slug: string) => {
    state.value.loading = true;
    const client = getCommerceClient();
    const { data, error } = await useAsyncData(() => client.getProduct?.(slug) ?? client.fetchProduct?.(slug));
    useHandleError(error.value);
    state.value.data = data.value as unknown as Maybe<SfProduct>;
    state.value.loading = false;
    return computed(() => state.value.data) as Ref<Maybe<SfProduct>>;
  };

  return {
    fetchProduct,
    ...toRefs(state.value),
  };
};
