import { toRefs } from '@vueuse/shared';
import { computed } from 'vue';
import type { Ref } from 'vue';
import type { Maybe } from '~/composables/system/models/shared';
import type {
  UseCustomerOrdersReturn,
  UseCustomerOrdersState,
  FetchCustomerOrders,
  OrdersData,
} from './types';
import { useHandleError } from '../../useHandleError';
import { useAsyncData, useState } from 'nuxt/app';
import type { OrderData } from '../useCustomerOrder/types';

const order: Pick<OrderData, 'id' | 'date' | 'paymentAmount'> = {
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
export const useCustomerOrders: UseCustomerOrdersReturn = () => {
  const state = useState<UseCustomerOrdersState>('useCustomerOrders', () => ({
    data: null,
    loading: false,
  }));

  /** Function for fetching customer orders data
   * @example
   * fetchCustomerOrders();
   */
  const fetchCustomerOrders: FetchCustomerOrders = async () => {
    state.value.loading = true;
    const { data, error } = await useAsyncData(() =>
      Promise.resolve([
        { ...order, status: 'Completed' },
        { ...order, status: 'Shipped' },
        { ...order, status: 'Open' },
        { ...order, status: 'Cancelled' },
      ] as OrderData[]),
    );
    useHandleError(error.value);
    state.value.data = data.value ?? null;
    state.value.loading = false;
    return computed(() => state.value.data) as unknown as Ref<Maybe<OrdersData>>;
  };

  return {
    fetchCustomerOrders,
    ...toRefs(state.value),
  };
};
