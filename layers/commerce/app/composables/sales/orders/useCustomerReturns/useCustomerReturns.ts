import { toRefs } from '@vueuse/shared';
import { computed } from 'vue';
import type { Ref } from 'vue';
import type { Maybe, SfRMARequest } from '~/composables/system/models';
import type {
  UseCustomerReturnsReturn,
  UseCustomerReturnsState,
  FetchCustomerReturns,
} from './types';
import { useHandleError } from '../../../system/useHandleError/useHandleError';
import { useAsyncData, useState } from 'nuxt/app';
import { getCommerceClient } from '../../../../utils/client';

export const useCustomerReturns: UseCustomerReturnsReturn = () => {
  const state = useState<UseCustomerReturnsState>('useCustomerReturns', () => ({
    data: null,
    loading: false,
  }));

  const fetchCustomerReturns: FetchCustomerReturns = async (params: Record<string, any> = {}) => {
    state.value.loading = true;
    const client = getCommerceClient();

    try {
      let returns: SfRMARequest[] = []

      if (client && typeof client.listReturns === 'function') {
        returns = (await client.listReturns(params)) as SfRMARequest[]
      }

      state.value.data = returns;
    } catch (error) {
      useHandleError(error as any)
      state.value.data = null;
    } finally {
      state.value.loading = false;
    }

    return computed(() => state.value.data) as unknown as Ref<Maybe<SfRMARequest[] | null>>;
  };

  const getReturnById = async (id: string) => {
    const client = getCommerceClient();
    if (client && typeof client.getReturn === 'function') {
      return client.getReturn(id) as Promise<SfRMARequest | null>
    }
    const returns = await fetchCustomerReturns()
    const list = Array.isArray(returns.value) ? returns.value : []
    if (Array.isArray(list)) {
      return list.find((r: any) => r?.id === id) ?? null
    }
    return null
  }

  const createReturn = async (payload: Record<string, any>) => {
    const client = getCommerceClient();
    if (client && typeof client.createReturn === 'function') {
      return client.createReturn(payload)
    }
    return null
  }

  return {
    fetchCustomerReturns,
    getReturnById,
    createReturn,
    ...toRefs(state.value),
  };
};
