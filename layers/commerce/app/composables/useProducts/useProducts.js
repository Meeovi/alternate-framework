import { toRefs } from '@vueuse/shared';
import { computed } from 'vue';
import { getCommerceClient } from '../../utils/client';
import { useAsyncData, useState } from 'nuxt/app';
import { useHandleError } from '../useHandleError';
/**
 * @description Composable for managing products.
 * @returns {@link UseProducts}
 * @example
 * const { data, loading, fetchProducts } = useProducts();
 */
export const useProducts = () => {
    const state = useState('products', () => ({
        data: null,
        loading: false,
    }));
    /**
     * @description Function for fetching products.
     * @example
     * getProducts();
     */
    const fetchProducts = async () => {
        state.value.loading = true;
        const client = getCommerceClient();
        const { data, error } = await useAsyncData(() => client.listProducts?.());
        useHandleError(error.value);
        state.value.data = data.value;
        state.value.loading = false;
        return computed(() => state.value.data);
    };
    return {
        fetchProducts,
        ...toRefs(state.value),
    };
};
