import { Product } from '../../types/domain'

export type { Product }

export interface ProductProvider {
  getProduct(id: string): Promise<Product>
  listProducts(params?: Record<string, any>): Promise<Product[]>
}
