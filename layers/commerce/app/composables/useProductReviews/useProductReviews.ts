import { toRefs } from '@vueuse/shared';
import { computed } from 'vue';
import type { Ref } from 'vue';
import type { Maybe, SfProductReview } from '../_types';
import type {
  UseProductReviews,
  UseProductReviewsState,
  FetchProductReviews,
} from './types';
import { getCommerceClient } from '../../utils/client';
import { useAsyncData, useState } from 'nuxt/app';
import { useHandleError } from '../useHandleError';

/**
 * @description Composable managing product reviews data
 * @param {string} slug Product slug
 * @returns {@link UseProductReturn}
 * @example
 * const { data, loading, fetchProductReviews } = useProductReviews('product-slug');
 */
export const useProductReviews: UseProductReviews = (slug) => {
  const state = useState<UseProductReviewsState>(`useProductReviews-${slug}`, () => ({
    data: null,
    loading: false,
  }));

  /** Function for fetching product reviews data
   * @param {string} slug Product slug
   * @example
   * fetchProductReviews('product-slug');
   */
  const fetchProductReviews: FetchProductReviews = async (slug) => {
    state.value.loading = true;
    const client = getCommerceClient();
      const { data, error } = await useAsyncData(() => client.listProductReviews?.(slug) ?? client.listReviews?.(slug));
    useHandleError(error.value);
    state.value.data = data.value as unknown as Maybe<SfProductReview[]>;
    state.value.loading = false;
    return computed(() => state.value.data) as unknown as Ref<Maybe<SfProductReview[]>>;
  };

  return {
    fetchProductReviews,
    ...toRefs(state.value),
  };
};
