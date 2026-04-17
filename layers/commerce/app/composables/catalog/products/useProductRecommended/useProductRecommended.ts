import { toRefs } from '@vueuse/shared';
import { computed } from 'vue';
import type { Ref } from 'vue';
import type { Maybe, SfProduct } from '../../models';
import { useAsyncData, useState } from 'nuxt/app';
import type {
  UseProductRecommendedReturn,
  UseProductRecommendedState,
  FetchProductRecommended,
} from './types';
import { getCommerceClient } from '../../../utils/client';
import { useHandleError } from '../../useHandleError';

/**
 * Composable for getting recommended products data
 * @param {string} slug Product slug
 */
export const useProductRecommended: UseProductRecommendedReturn = (slug: string) => {
  const state = useState<UseProductRecommendedState>(`useProductRecommended-${slug}`, () => ({
    data: null,
    loading: false,
  }));

  /** Function for fetching product recommended data
   * @param {string} slug Product slug
   * @example
   * fetchProductRecommended('product-slug');
   */
  const fetchProductRecommended: FetchProductRecommended = async (slug) => {
    state.value.loading = true;
    const client = getCommerceClient();
    const { data, error } = await useAsyncData(() => client.listProducts?.());
    useHandleError(error.value);
    state.value.data = data.value as unknown as Maybe<SfProduct[]>;
    state.value.loading = false;
    return computed(() => state.value.data) as unknown as Ref<Maybe<SfProduct[]>>;
  };

  return {
    fetchProductRecommended,
    ...toRefs(state.value),
  };
};
