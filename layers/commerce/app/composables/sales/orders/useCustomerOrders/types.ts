import type { Ref } from 'vue';
import type { Maybe } from '~/composables/system/models/shared';
import type { OrderData } from '../useCustomerOrder/types';

export type OrdersData = Pick<OrderData, 'id' | 'date' | 'paymentAmount' | 'status'>[];

export interface UseCustomerOrdersState {
  data: Maybe<OrdersData>;
  loading: boolean;
}

export type FetchCustomerOrders = () => Promise<Ref<Maybe<OrdersData>>>;

export interface UseCustomerOrders {
  data: Readonly<Ref<UseCustomerOrdersState['data']>>;
  loading: Readonly<Ref<boolean>>;
  fetchCustomerOrders: FetchCustomerOrders;
}

export type UseCustomerOrdersReturn = () => UseCustomerOrders;
