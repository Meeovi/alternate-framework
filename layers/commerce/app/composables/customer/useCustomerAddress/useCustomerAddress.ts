import { toRefs } from '@vueuse/shared';
import { computed } from 'vue';
import type { Ref } from 'vue';
import type { Maybe, SfAddress } from '../models/shared';
import type {
  UseCustomerAddressReturn,
  UseCustomerAddressState,
  FetchCustomerAddress,
} from './types';
import { useAsyncData, useState } from 'nuxt/app';
import { useHandleError } from '../../system/useHandleError/useHandleError';

/**
 * @description Composable managing address data
 * @returns {@link UseCustomerAddressReturn}
 * @example
 * const { data, loading, fetchCustomerAddress } = useCustomerAddress();
 */
export const useCustomerAddress: UseCustomerAddressReturn = () => {
  const state = useState<UseCustomerAddressState>(`useCustomerAddress`, () => ({
    data: null,
    loading: false,
  }));

  /** Function for fetching address data
   * @example
   * fetchCustomerAddress();
   */
  const fetchCustomerAddress: FetchCustomerAddress = async () => {
    state.value.loading = true;
    const { data, error } = await useAsyncData(() =>
      Promise.resolve({
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
      }),
    );
    useHandleError(error.value);
    state.value.data = data.value ?? null;
    state.value.loading = false;
    return computed(() => state.value.data) as unknown as Ref<Maybe<SfAddress>>;
  };

  return {
    fetchCustomerAddress,
    ...toRefs(state.value),
  };
};
