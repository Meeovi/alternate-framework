import { toRefs } from '@vueuse/shared';
import { computed } from 'vue';
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
export const useProductReviews = (slug) => {
    const state = useState(`useProductReviews-${slug}`, () => ({
        data: null,
        loading: false,
    }));
    /** Function for fetching product reviews data
     * @param {string} slug Product slug
     * @example
     * fetchProductReviews('product-slug');
     */
    const fetchProductReviews = async (slug) => {
        state.value.loading = true;
        const client = getCommerceClient();
        const { data, error } = await useAsyncData(() => client.listProductReviews?.(slug) ?? client.listReviews?.(slug));
        useHandleError(error.value);
        state.value.data = data.value;
        state.value.loading = false;
        return computed(() => state.value.data);
    };
    return {
        fetchProductReviews,
        ...toRefs(state.value),
    };
};
