import { toRefs } from '@vueuse/shared';
import { computed } from 'vue';
import { getCommerceClient } from '../../utils/client';
import { useAsyncData, useState } from 'nuxt/app';
import { useHandleError } from '../useHandleError';
/**
 * @description Composable managing product data
 * @param {string} slug Product slug
 * @returns {@link UseProductReturn}
 * @example
 * const { data, loading, fetchProduct } = useProduct('product-slug');
 */
export const useProduct = (slug) => {
    const state = useState(`useProduct-${slug}`, () => ({
        data: null,
        loading: false,
    }));
    /** Function for fetching product data
     * @param {string} slug Product slug
     * @example
     * fetchProduct('product-slug');
     */
    const fetchProduct = async (slug) => {
        state.value.loading = true;
        const client = getCommerceClient();
        const { data, error } = await useAsyncData(() => client.getProduct?.(slug) ?? client.fetchProduct?.(slug));
        useHandleError(error.value);
        state.value.data = data.value;
        state.value.loading = false;
        return computed(() => state.value.data);
    };
    return {
        fetchProduct,
        ...toRefs(state.value),
    };
};
