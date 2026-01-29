import { toRefs } from '@vueuse/shared';
import { computed } from 'vue';
import { useAsyncData, useState } from 'nuxt/app';
import { useHandleError } from '../useHandleError';
const order = {
    id: '0e4fec5a-61e6-48b8-94cc-d5f77687e2b0',
    date: '2022-08-11',
    paymentAmount: 295.87,
};
/**
 * @description Composable managing customer orders data
 * @returns {@link UseCustomerOrdersReturn}
 * @example
 * const { data, loading, fetchCustomerOrders } = useCustomerOrders();
 */
export const useCustomerOrders = () => {
    const state = useState('useCustomerOrders', () => ({
        data: null,
        loading: false,
    }));
    /** Function for fetching customer orders data
     * @example
     * fetchCustomerOrders();
     */
    const fetchCustomerOrders = async () => {
        state.value.loading = true;
        const { data, error } = await useAsyncData(() => Promise.resolve([
            { ...order, status: 'Completed' },
            { ...order, status: 'Shipped' },
            { ...order, status: 'Open' },
            { ...order, status: 'Cancelled' },
        ]));
        useHandleError(error.value);
        state.value.data = data.value;
        state.value.loading = false;
        return computed(() => state.value.data);
    };
    return {
        fetchCustomerOrders,
        ...toRefs(state.value),
    };
};
