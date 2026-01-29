import { toRefs } from '@vueuse/shared';
import { computed } from 'vue';
import { getCommerceClient } from '../../utils/client';
import { useAsyncData, useState } from 'nuxt/app';
import { useHandleError } from '../useHandleError';
/**
 * @description Composable managing customer data
 * @returns {@link UseCustomerReturn}
 * @example
 * const { data, loading, fetchCustomer } = useCustomer();
 */
export const useCustomer = () => {
    const state = useState('useCustomer', () => ({
        data: null,
        loading: false,
    }));
    /** Function for fetching customer data
     * @example
     * fetchCustomer();
     */
    const fetchCustomer = async () => {
        state.value.loading = true;
        const client = getCommerceClient();
        const { data, error } = await useAsyncData(() => client.getCustomer?.());
        useHandleError(error.value);
        state.value.data = data.value;
        state.value.loading = false;
        return computed(() => state.value.data);
    };
    return {
        fetchCustomer,
        ...toRefs(state.value),
    };
};
