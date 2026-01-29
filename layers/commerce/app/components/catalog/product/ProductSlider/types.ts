import type { HTMLAttributes } from 'vue'
import type { Product } from '../../../../composables/_types'

export type ProductSliderProps = {
  items?: Product[]
  wrapperClass?: HTMLAttributes['class']
}
