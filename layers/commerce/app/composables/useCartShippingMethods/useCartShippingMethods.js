import { toRefs } from '@vueuse/shared';
import { computed } from 'vue';
import { getCommerceClient } from '../../utils/client';
import { useAsyncData, useState } from 'nuxt/app';
import { useHandleError } from '../useHandleError';
/**
 * @description Composable for getting shipping methods.
 * @example
 * const { data, loading, getShippingMethods } = useCartShippingMethods();
 */
export const useCartShippingMethods = () => {
    const state = useState('useCartSippingMethods', () => ({
        data: null,
        loading: false,
    }));
    /**
     * @description Function for fetching shipping methods.
     * @example
     * getShippingMethods();
     */
    const getShippingMethods = async () => {
        state.value.loading = true;
        const client = getCommerceClient();
        const { data, error } = await useAsyncData(() => client.listShippingMethods?.());
        useHandleError(error.value);
        const result = (data.value && data.value.methods) ? data.value : { methods: [] };
        state.value.data = result;
        state.value.loading = false;
        return computed(() => state.value.data);
    };
    return {
        getShippingMethods,
        ...toRefs(state.value),
    };
};
