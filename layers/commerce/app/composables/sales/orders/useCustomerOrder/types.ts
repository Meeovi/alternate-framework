import type { Ref } from 'vue';
import type { Maybe, SfOrder, SfAddress } from '~/composables/system/models';

export type OrderData = SfOrder;

export interface UseCustomerOrderState {
  data: Maybe<OrderData>;
  loading: boolean;
}

export type FetchCustomerOrder = (id: string) => Promise<Ref<Maybe<OrderData>>>;

export interface UseCustomerOrder {
  data: Readonly<Ref<UseCustomerOrderState['data']>>;
  loading: Readonly<Ref<boolean>>;
  fetchCustomerOrder: FetchCustomerOrder;
}

export type UseCustomerOrderReturn = (id: string) => UseCustomerOrder;
