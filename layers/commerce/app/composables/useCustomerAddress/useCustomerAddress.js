import { toRefs } from '@vueuse/shared';
import { computed } from 'vue';
import { useAsyncData, useState } from 'nuxt/app';
import { useHandleError } from '../useHandleError';
/**
 * @description Composable managing address data
 * @returns {@link UseCustomerAddressReturn}
 * @example
 * const { data, loading, fetchCustomerAddress } = useCustomerAddress();
 */
export const useCustomerAddress = () => {
    const state = useState(`useCustomerAddress`, () => ({
        data: null,
        loading: false,
    }));
    /** Function for fetching address data
     * @example
     * fetchCustomerAddress();
     */
    const fetchCustomerAddress = async () => {
        state.value.loading = true;
        const { data, error } = await useAsyncData(() => Promise.resolve({
            firstName: 'Hieronim',
            lastName: 'Anonim',
            address1: 'Oak Drive',
            address2: '3633',
            city: 'Colonie',
            country: 'US',
            phoneNumber: '+1 321 765 0987',
            postalCode: '12205',
            state: 'NY',
            titleCode: '',
        }));
        useHandleError(error.value);
        state.value.data = data.value;
        state.value.loading = false;
        return computed(() => state.value.data);
    };
    return {
        fetchCustomerAddress,
        ...toRefs(state.value),
    };
};
