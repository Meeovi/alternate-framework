import { toRefs } from '@vueuse/shared';
import { computed } from 'vue';
import { useAsyncData, useState } from 'nuxt/app';
import { getCommerceClient } from '../../utils/client';
import { useHandleError } from '../useHandleError';
/**
 * Composable for getting recommended products data
 * @param {string} slug Product slug
 */
export const useProductRecommended = (slug) => {
    const state = useState(`useProductRecommended-${slug}`, () => ({
        data: null,
        loading: false,
    }));
    /** Function for fetching product recommended data
     * @param {string} slug Product slug
     * @example
     * fetchProductRecommended('product-slug');
     */
    const fetchProductRecommended = async (slug) => {
        state.value.loading = true;
        const client = getCommerceClient();
        const { data, error } = await useAsyncData(() => client.listProducts?.());
        useHandleError(error.value);
        state.value.data = data.value;
        state.value.loading = false;
        return computed(() => state.value.data);
    };
    return {
        fetchProductRecommended,
        ...toRefs(state.value),
    };
};
