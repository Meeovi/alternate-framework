import { toRefs } from '@vueuse/shared';
import { computed } from 'vue';
import type { Ref } from 'vue';
import type { Maybe, SfShippingMethods, SfShippingMethod } from '../../../system/models';
import type {
  UseCartShippingMethodsState,
  UseCartShippingMethodsReturn,
  GetShippingMethods,
} from './types';
import { getCommerceClient } from '../../../../utils/client';
import { useAsyncData, useState } from 'nuxt/app';
import { useHandleError } from '../../../system/useHandleError/useHandleError';

export const useCartShippingMethods: UseCartShippingMethodsReturn = () => {
  const state = useState<UseCartShippingMethodsState>('useCartShippingMethods', () => ({
    data: null,
    loading: false,
  }));

  const getShippingMethods: GetShippingMethods = async (payload?: {
    address?: Record<string, any>
    items?: Array<Record<string, any>>
  }) => {
    state.value.loading = true;
    const client = getCommerceClient();

    let result: { methods: SfShippingMethod[] } = { methods: [] };

    try {
      if (client && typeof client.estimateShippingMethods === 'function') {
        const res = await client.estimateShippingMethods(payload)
        if (res && Array.isArray(res.methods)) {
          result = res as { methods: SfShippingMethod[] }
        }
      } else if (client && typeof client.listShippingMethods === 'function') {
        const res = await client.listShippingMethods(payload) as any
        if (Array.isArray(res)) {
          result = { methods: res }
        } else if (res && Array.isArray(res.methods)) {
          result = res as { methods: SfShippingMethod[] }
        }
      }
    } catch (error) {
      useHandleError(error as any)
    }

    state.value.data = result;
    state.value.loading = false;
    return computed(() => state.value.data) as unknown as Ref<Maybe<SfShippingMethods>>;
  };

  const selectShippingMethod = async (payload: {
    cartId?: string
    shippingMethodCode: string
    shippingCarrierCode: string
  }) => {
    const client = getCommerceClient();
    if (!client || typeof client.selectShippingMethod !== 'function') {
      return null
    }
    return client.selectShippingMethod(payload);
  };

  return {
    getShippingMethods,
    selectShippingMethod,
    ...toRefs(state.value),
  };
};
