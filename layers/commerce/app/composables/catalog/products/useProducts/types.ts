import type { Ref } from 'vue'
import type { SfProduct, SfPagination, Maybe } from '../../../system/models'

export interface UseProductState {
  data: Maybe<SfProduct>;
  loading: boolean;
}

export type FetchProduct = (slug: string) => Promise<Ref<Maybe<SfProduct>>>;

export interface UseProduct {
  data: Readonly<Ref<UseProductState['data']>>;
  loading: Readonly<Ref<boolean>>;
  fetchProduct: FetchProduct;
}

export type UseProductReturn = (slug: string) => UseProduct;

export type GetProducts = {
  items: SfProduct[]
  total?: number
  page?: number
  limit?: number
  hasMore?: boolean
}

export interface UseProductsState {
  data: GetProducts | null
  loading: boolean
  pagination: SfPagination | null
  error: Error | null
}

export type FetchProducts = () => Promise<Ref<Maybe<GetProducts>>>
export type FetchProductsByIds = (productIds: string[]) => Promise<Ref<Maybe<GetProducts>>>
export interface UseProducts {
  data: Readonly<Ref<UseProductsState['data']>>
  loading: Readonly<Ref<boolean>>
  fetchProducts: FetchProducts
  fetchConfigurableProducts: FetchProducts
  fetchBundleProducts: FetchProducts
  fetchGroupedProducts: FetchProducts
  fetchDownloadableProducts: FetchProducts
  fetchUpsellingProducts: FetchProducts
  fetchCrossSellingProducts: FetchProducts
  fetchProductsByIds: FetchProductsByIds
}

export type UseProductsReturn = () => UseProducts

export interface ProductProvider {
  getProducts(): Promise<GetProducts>
  getConfigurableProducts(productIds: string[]): Promise<GetProducts>
  getBundleProducts(productIds: string[]): Promise<GetProducts>
  getGroupedProducts(productIds: string[]): Promise<GetProducts>
  getDownloadableProducts(): Promise<GetProducts>
  getUpsellingProducts(productIds: string[]): Promise<GetProducts>
  getCrossSellingProducts(productIds: string[]): Promise<GetProducts>
  getProductsByIds(productIds: string[]): Promise<GetProducts>
}

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