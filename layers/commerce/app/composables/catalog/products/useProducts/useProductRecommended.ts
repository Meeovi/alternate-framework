import { toRefs } from '@vueuse/shared';
import { computed } from 'vue';
import type { Ref } from 'vue';
import type { SfProduct, Maybe } from '~/composables/system/models';
import type {
  UseProductRecommendedReturn,
  UseProductRecommendedState,
  FetchProductRecommended,
} from './types';
import { getCommerceClient } from '../../../../utils/client';
import { useHandleError } from '../../../system/useHandleError/useHandleError';

export const useProductRecommended: UseProductRecommendedReturn = (slug: string) => {
  const state = useState<UseProductRecommendedState>(`useProductRecommended-${slug}`, () => ({
    data: null,
    loading: false,
    error: null,
  }));

  const fetchProductRecommended: FetchProductRecommended = async (slug) => {
    state.value.loading = true;
    const client = getCommerceClient();

    try {
      let recommended: SfProduct[] = []

      if (client && typeof client.getProductRecommendations === 'function') {
        const result = await client.getProductRecommendations({ productSlug: slug })
        recommended = Array.isArray(result) ? result : result?.products || []
      } else if (client && typeof client.getRelatedProducts === 'function') {
        const result = await client.getRelatedProducts({ slug, type: 'upsell' })
        recommended = Array.isArray(result) ? result : result?.items || []
      } else if (client && typeof client.listProducts === 'function') {
        const result = await client.listProducts({ sort: 'featured', pageSize: 4 })
        const list = Array.isArray(result) ? result : result?.items || []
        recommended = list.slice(0, 4)
      }

      state.value.data = recommended
    } catch (error) {
      useHandleError(error as any)
      state.value.data = null
      state.value.error = error instanceof Error ? error : new Error('Failed to load recommended products')
    } finally {
      state.value.loading = false;
    }

    return computed(() => state.value.data) as unknown as Ref<Maybe<SfProduct[]>>;
  };

  const fetchCrossSellProducts: FetchProductRecommended = async (slug) => {
    const client = getCommerceClient()
    try {
      let products: SfProduct[] = []

      if (client && typeof client.getRelatedProducts === 'function') {
        const result = await client.getRelatedProducts({ slug, type: 'crosssell' })
        products = Array.isArray(result) ? result : result?.items || []
      }

      state.value.data = products
    } catch (error) {
      useHandleError(error as any)
      state.value.data = null
      state.value.error = error instanceof Error ? error : new Error('Failed to load cross-sell products')
    } finally {
      state.value.loading = false
    }

    return computed(() => state.value.data) as unknown as Ref<Maybe<SfProduct[]>>
  }

  return {
    fetchProductRecommended,
    fetchCrossSellProducts,
    ...toRefs(state.value),
  };
};
