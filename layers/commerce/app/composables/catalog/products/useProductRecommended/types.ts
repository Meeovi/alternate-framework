import type { Ref } from 'vue';
import type { SfProduct } from '~/composables/system/models';
import type { Maybe } from '~/composables/system/models';

export interface UseProductRecommendedState {
  data: Maybe<SfProduct[]>;
  loading: boolean;
}

export type FetchProductRecommended = (slug: string) => Promise<Ref<Maybe<SfProduct[]>>>;

export interface UseProductRecommended {
  data: Readonly<Ref<UseProductRecommendedState['data']>>;
  loading: Readonly<Ref<boolean>>;
  fetchProductRecommended: FetchProductRecommended;
}

export type UseProductRecommendedReturn = (slug: string) => UseProductRecommended;
