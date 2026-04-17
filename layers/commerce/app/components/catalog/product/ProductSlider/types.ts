import type { HTMLAttributes } from 'vue';
import type { SfProduct } from '~/composables/system/models';

export type ProductSliderProps = {
  items?: SfProduct[];
  wrapperClass?: HTMLAttributes['class'];
};
