import { toRefs } from '@vueuse/shared';
import { computed } from 'vue';
import { useAsyncData, useState } from 'nuxt/app';
import { useHandleError } from '../useHandleError';
/**
 * @description Composable managing returns data
 * @returns {@link UseCustomerReturnsReturn}
 * @example
 * const { data, loading, fetchCustomerReturns } = useCustomerReturns();
 */
export const useCustomerReturns = () => {
    const state = useState(`useCustomerReturns`, () => ({
        data: [],
        loading: false,
    }));
    /** Function for fetching returns data
     * @example
     * fetchCustomerReturns();
     */
    const fetchCustomerReturns = async () => {
        state.value.loading = true;
        const { data, error } = await useAsyncData(() => Promise.resolve([]));
        useHandleError(error.value);
        state.value.data = data.value;
        state.value.loading = false;
        return computed(() => state.value.data);
    };
    return {
        fetchCustomerReturns,
        ...toRefs(state.value),
    };
};
