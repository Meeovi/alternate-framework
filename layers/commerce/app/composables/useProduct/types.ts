import type { Ref } from 'vue';
import type { SfProduct, Maybe } from '../_types';

export interface UseProductState {
  data: Maybe<SfProduct>;
  loading: boolean;
}

export type FetchProduct = (slug: string) => Promise<Ref<Maybe<SfProduct>>>;

export interface UseProduct {
  data: Readonly<Ref<UseProductState['data']>>;
  loading: Readonly<Ref<boolean>>;
  fetchProduct: FetchProduct;
}

export type UseProductReturn = (slug: string) => UseProduct;
