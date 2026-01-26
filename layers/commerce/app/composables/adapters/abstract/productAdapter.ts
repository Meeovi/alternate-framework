import { Product } from "../../domain/product"

export interface ProductAdapter {
  list(): Promise<Product[]>
  get(id: string): Promise<Product | null>
  search(query: string): Promise<Product[]>
}