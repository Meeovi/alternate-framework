import type { Ref } from 'vue'
import type { SfProduct } from '../../../models'
import type { Maybe } from '../../../models'

export type GetProducts = {
  items: SfProduct[]
  total?: number
}

export interface UseProductsState {
  data: GetProducts | null
  loading: boolean
}

export type FetchProducts = () => Promise<Ref<Maybe<GetProducts>>>
export interface UseProducts {
  data: Readonly<Ref<UseProductsState['data']>>
  loading: Readonly<Ref<boolean>>
  fetchProducts: FetchProducts
}

export type UseProductsReturn = () => UseProducts

export interface ProductProvider {
  getProducts(): Promise<GetProducts>
}