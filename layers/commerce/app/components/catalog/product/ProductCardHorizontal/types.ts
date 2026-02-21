import type { Product } from '../../../../types/ui'

export type ProductHorizontalProps = {
  product: Omit<Product, 'id' | 'images' | 'price'>
}
