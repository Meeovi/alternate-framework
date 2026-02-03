import type { SimpleProduct } from './product'

export interface ProductState {
  products: SimpleProduct[]
  selectedProduct: SimpleProduct | null
  isLoading: boolean
  error?: string | null
}
