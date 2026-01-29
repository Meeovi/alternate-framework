import { toRefs } from '@vueuse/shared';
import { getCommerceClient } from '../../utils/client';
import { useAsyncData, useState } from 'nuxt/app';
import { useHandleError } from '../useHandleError';
import { ref } from 'vue';
/**
 * @description Composable for managing cart.
 * @returns {@link UseCartReturn}
 * @example
 * const { data, loading } = useCart();
 */
export const useCart = () => {
    const state = useState('useCart', () => ({
        data: null,
        loading: false,
    }));
    /**
     * @description Function for fetching the cart.
     * @example
     * getCart();
     */
    const fetchCard = async () => {
        state.value.loading = true;
        try {
            const client = getCommerceClient();
            const { data, error } = await useAsyncData(() => client.getCart?.());
            useHandleError(error.value);
            state.value.data = data.value;
            // wrap the returned ref into our Vue ref to avoid cross-package Ref mismatch
            return ref(data.value);
        }
        catch (error) {
            throw new Error(error);
        }
        finally {
            state.value.loading = false;
        }
    };
    return {
        fetchCard,
        ...toRefs(state.value),
    };
};
