import { SfShippingMethods, Maybe } from '../_types';
import type { Ref } from 'vue';

export interface UseCartShippingMethodsState {
  data: Maybe<SfShippingMethods>;
  loading: boolean;
}

export type GetShippingMethods = () => Promise<Ref<Maybe<SfShippingMethods>>>;

export interface UseCartShippingMethods {
  data: Readonly<Ref<UseCartShippingMethodsState['data']>>;
  loading: Readonly<Ref<boolean>>;
  getShippingMethods: GetShippingMethods;
}

export type UseCartShippingMethodsReturn = () => UseCartShippingMethods;
