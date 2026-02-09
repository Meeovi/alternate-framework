import type { HTMLAttributes } from 'vue';
import { SfProduct } from '~/composables';

export type ProductSliderProps = {
  items?: SfProduct[];
  wrapperClass?: HTMLAttributes['class'];
};
