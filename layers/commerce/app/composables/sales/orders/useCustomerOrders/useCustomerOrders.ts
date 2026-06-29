import { toRefs } from '@vueuse/shared';
import { computed } from 'vue';
import type { Ref } from 'vue';
import type { Maybe, SfOrderListItem, SfPagination } from '~/composables/system/models';
import type {
  UseCustomerOrdersReturn,
  UseCustomerOrdersState,
  FetchCustomerOrders,
} from './types';
import { useHandleError } from '../../../system/useHandleError/useHandleError';
import { useAsyncData, useState } from 'nuxt/app';
import { getCommerceClient } from '../../../../utils/client';

export const useCustomerOrders: UseCustomerOrdersReturn = () => {
  const state = useState<UseCustomerOrdersState>('useCustomerOrders', () => ({
    data: null,
    loading: false,
  }));

  const fetchCustomerOrders: FetchCustomerOrders = async (params: {
    pageSize?: number
    currentPage?: number
    status?: string[]
  } = {}) => {
    state.value.loading = true;
    const client = getCommerceClient();

    try {
      let result: { orders: SfOrderListItem[]; pagination: SfPagination } | null = null

      if (client && typeof client.getOrders === 'function') {
        const res = await client.getOrders({
          filters: params.status ? { status: params.status } : undefined,
          pageSize: params.pageSize,
          currentPage: params.currentPage,
        })
        result = res as { orders: SfOrderListItem[]; pagination: SfPagination }
      }

      const orders: SfOrderListItem[] = result?.orders ?? []
      const pagination = result?.pagination ?? {
        currentPage: 1,
        pageSize: 20,
        totalPages: 0,
        totalResults: 0,
      }

      const normalizedOrders = orders.map((order: any) => ({
        id: order.id,
        orderNumber: order.orderNumber || order.incrementId,
        incrementId: order.incrementId,
        orderDate: order.orderDate,
        status: order.status,
        state: order.state,
        grandTotal: order.grandTotal?.amount ?? order.grandTotal ?? 0,
        totalQtyOrdered: order.totalQtyOrdered,
        customerEmail: order.customerEmail,
      })) as unknown as SfOrderListItem[];

      state.value.data = normalizedOrders;
    } catch (error) {
      useHandleError(error as any)
      state.value.data = null;
    } finally {
      state.value.loading = false;
    }

    return computed(() => state.value.data) as unknown as Ref<Maybe<any>>;
  };

  return {
    fetchCustomerOrders,
    ...toRefs(state.value),
  };
};
