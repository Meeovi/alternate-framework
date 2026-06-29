import type { Ref } from 'vue';
import type { Maybe, SfOrderListItem } from '~/composables/system/models';

export type OrdersData = SfOrderListItem[];

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
