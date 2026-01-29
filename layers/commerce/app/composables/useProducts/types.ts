import { Ref } from 'vue'
import type { Product } from '../_types'
import type { Maybe } from '../_types'

export type GetProducts = {
  items: Product[]
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
