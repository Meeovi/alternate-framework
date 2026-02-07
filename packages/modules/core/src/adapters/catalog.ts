import { BaseAdapter, BaseAdapterConfig } from './common'

export interface CatalogAdapterConfig extends BaseAdapterConfig {
  provider: string
}

export interface CatalogProduct {
  id: string
  slug: string
  name: string
  price: number
  [key: string]: unknown
}

export interface CatalogAdapter<TProduct extends CatalogProduct = CatalogProduct>
  extends BaseAdapter<CatalogAdapterConfig> {
  type: 'catalog'
  getProductById(id: string): Promise<TProduct | null>
  getProductBySlug(slug: string): Promise<TProduct | null>
  listProducts(params?: Record<string, unknown>): Promise<TProduct[]>
}