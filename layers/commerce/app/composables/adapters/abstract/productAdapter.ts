import type { SfProduct } from '../../system/models/product';

export interface ProductAdapter {
  list(): Promise<SfProduct[]>
  get(id: string): Promise<SfProduct | null>
  search(query: string): Promise<SfProduct[]>
}