import { toRefs } from '@vueuse/shared';
import { computed } from 'vue';
import type { Ref } from 'vue';
import type { Maybe, SfAddress, SfCustomerAddress } from '~/composables/system/models';
import type {
  UseCustomerAddressReturn,
  UseCustomerAddressState,
  FetchCustomerAddress,
} from './types';
import { getCommerceClient } from '../../../utils/client';
import { useAsyncData, useState } from 'nuxt/app';
import { useHandleError } from '../../system/useHandleError/useHandleError';

export const useCustomerAddress: UseCustomerAddressReturn = () => {
  const state = useState<UseCustomerAddressState>('useCustomerAddress', () => ({
    data: null,
    loading: false,
  }));

  const fetchCustomerAddress: FetchCustomerAddress = async () => {
    state.value.loading = true;
    const client = getCommerceClient();

    try {
      const { data, error } = await useAsyncData(
        'default-address',
        () => client.getCustomerAddresses?.() ?? client.getCustomer?.(),
      );
      useHandleError(error.value);

      const raw = data.value
      if (Array.isArray(raw)) {
        const defaultAddress = raw.find((addr: any) => addr.isDefaultBilling || addr.isDefaultShipping) || raw[0]
        state.value.data = defaultAddress ?? null
      } else if (raw && typeof raw === 'object') {
        state.value.data = raw as SfAddress
      } else {
        state.value.data = null
      }
      state.value.loading = false;
      return computed(() => state.value.data) as unknown as Ref<Maybe<SfAddress>>;
    } catch (error) {
      useHandleError(error.value)
      state.value.data = null;
      state.value.loading = false;
      return computed(() => null) as unknown as Ref<Maybe<SfAddress>>;
    }
  };

  const createAddress = async (address: SfAddress) => {
    const client = getCommerceClient();
    if (client && typeof client.createCustomerAddress === 'function') {
      return client.createCustomerAddress({ address }) as Promise<{ address: SfCustomerAddress }>
    }
    return null
  }

  const updateAddress = async (id: string, address: SfAddress) => {
    const client = getCommerceClient();
    if (client && typeof client.updateCustomerAddress === 'function') {
      return client.updateCustomerAddress({ id, address }) as Promise<{ address: SfCustomerAddress }>
    }
    return null
  }

  const deleteAddress = async (id: string) => {
    const client = getCommerceClient();
    if (client && typeof client.deleteCustomerAddress === 'function') {
      return client.deleteCustomerAddress({ id })
    }
    return false
  }

  return {
    fetchCustomerAddress,
    createAddress,
    updateAddress,
    deleteAddress,
    ...toRefs(state.value),
  };
};
