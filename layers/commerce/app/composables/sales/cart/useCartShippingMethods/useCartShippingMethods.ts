import { toRefs } from '@vueuse/shared';
import { computed } from 'vue';
import type { Ref } from 'vue';
import type { Maybe, SfShippingMethods } from '../../models';
import type {
  UseCartShippingMethodsState,
  UseCartShippingMethodsReturn,
  GetShippingMethods,
} from './types';
import { getCommerceClient } from '../../../../utils/client';
import { useAsyncData, useState } from 'nuxt/app';
import { useHandleError } from '../../../system/useHandleError/useHandleError';

/**
 * @description Composable for getting shipping methods.
 * @example
 * const { data, loading, getShippingMethods } = useCartShippingMethods();
 */

export const useCartShippingMethods: UseCartShippingMethodsReturn = () => {
  const state = useState<UseCartShippingMethodsState>('useCartSippingMethods', () => ({
    data: null,
    loading: false,
  }));

  /**
   * @description Function for fetching shipping methods.
   * @example
   * getShippingMethods();
   */

  const getShippingMethods: GetShippingMethods = async () => {
    state.value.loading = true;
    const client = getCommerceClient();
    const { data, error } = await useAsyncData<any>(() => client.listShippingMethods?.());
    useHandleError(error.value);
    const result = (data.value && (data.value as any).methods) ? data.value : { methods: [] };
    state.value.data = result as any;
    state.value.loading = false;
    return computed(() => state.value.data) as unknown as Ref<Maybe<SfShippingMethods>>;
  };

  return {
    getShippingMethods,
    ...toRefs(state.value),
  };
};
