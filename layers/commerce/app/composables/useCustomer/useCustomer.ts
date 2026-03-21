import { toRefs } from '@vueuse/shared';
import { computed } from 'vue';
import type { Ref } from 'vue';
import type { Maybe, SfCustomer } from '../models';
import type { UseCustomerReturn, UseCustomerState, FetchCustomer } from './types';
import { getCommerceClient } from '../../utils/client';
import { useAsyncData, useState } from 'nuxt/app';
import { useHandleError } from '../useHandleError';

/**
 * @description Composable managing customer data
 * @returns {@link UseCustomerReturn}
 * @example
 * const { data, loading, fetchCustomer } = useCustomer();
 */
export const useCustomer: UseCustomerReturn = () => {
  const state = useState<UseCustomerState>('useCustomer', () => ({
    data: null,
    loading: false,
  }));

  /** Function for fetching customer data
   * @example
   * fetchCustomer();
   */
  const fetchCustomer: FetchCustomer = async () => {
    state.value.loading = true;
      const client = getCommerceClient();
      const { data, error } = await useAsyncData<UseCustomerState['data']>(() => client.getCustomer?.());
    useHandleError(error.value);
    state.value.data = data.value;
    state.value.loading = false;
    return computed(() => state.value.data) as unknown as Ref<Maybe<SfCustomer>>;
  };

  return {
    fetchCustomer,
    ...toRefs(state.value),
  };
};
