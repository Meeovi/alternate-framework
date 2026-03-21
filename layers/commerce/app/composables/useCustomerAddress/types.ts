import type { Ref } from 'vue';
import type { Maybe, SfAddress } from '../models/shared';

export interface UseCustomerAddressState {
  data: Maybe<SfAddress>;
  loading: boolean;
}

export type FetchCustomerAddress = () => Promise<Ref<Maybe<SfAddress>>>;

export interface UseCustomerAddress {
  data: Readonly<Ref<UseCustomerAddressState['data']>>;
  loading: Readonly<Ref<boolean>>;
  fetchCustomerAddress: FetchCustomerAddress;
}

export type UseCustomerAddressReturn = () => UseCustomerAddress;
