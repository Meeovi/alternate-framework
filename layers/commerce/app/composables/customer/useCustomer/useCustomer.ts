import { toRefs } from '@vueuse/shared';
import { computed } from 'vue';
import type { Ref } from 'vue';
import type { Maybe, SfCustomer, SfCustomerAddress, SfCustomerGroup } from '~/composables/system/models';
import type { UseCustomerReturn, UseCustomerState, FetchCustomer } from './types';
import { getCommerceClient } from '../../../utils/client';
import type { CommerceClient } from '../../../utils/client';
import { useAsyncData, useState } from '#app';

export const useCustomer: UseCustomerReturn = () => {
  const state = useState<UseCustomerState>('useCustomer', () => ({
    data: null,
    loading: false,
  }));

  const fetchCustomer: FetchCustomer = async () => {
    state.value.loading = true;
    const client = getCommerceClient() as CommerceClient;

    try {
      const { data, error } = await useAsyncData<UseCustomerState['data']>(() => client.getCustomer())
      if (error.value) console.error('Customer fetch error:', error.value)
      state.value.data = data.value ?? null;
    } catch (error) {
      console.error('Customer fetch error:', error)
      state.value.data = null;
    } finally {
      state.value.loading = false;
    }

    return computed(() => state.value.data) as unknown as Ref<Maybe<SfCustomer>>;
  };

  const getAddresses = async (): Promise<SfCustomerAddress[]> => {
    const client = getCommerceClient() as CommerceClient;
    const result = await client.getCustomerAddresses()
    return Array.isArray((result as any)?.addresses) ? (result as any).addresses : []
  }

  const getGroups = async (): Promise<SfCustomerGroup[]> => {
    const client = getCommerceClient() as CommerceClient;
    return client.getCustomerGroups()
  }

  return {
    fetchCustomer,
    getAddresses,
    getGroups,
    ...toRefs(state.value),
  };
};
