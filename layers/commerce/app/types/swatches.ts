import type { Ref } from 'vue'
import type { SfAttribute, SfProduct } from '~/composables/system/models'

export interface SwatchAttribute {
  attributeCode: string
  attributeName: string
  options: Array<{
    value: string
    label: string
    swatchType?: 'visual' | 'text'
    swatchValue?: string
    sortOrder?: number
  }>
}

export interface UseSwatchesState {
  data: SwatchAttribute[] | null
  loading: boolean
}

export type FetchSwatches = () => Promise<Ref<SwatchAttribute[] | null>>

export interface UseSwatches {
  data: Readonly<Ref<UseSwatchesState['data']>>
  loading: Readonly<Ref<boolean>>
  fetchSwatches: FetchSwatches
}

export interface UseSwatchesComputed {
  getSwatchOptions: (attributeCode: string) => any[]
  getSelectedSwatch: (attributeCode: string, value: string) => any
  getProductSwatchImage: (product: SfProduct, attributeCode: string) => string | undefined
}

export type UseSwatchesReturn = () => UseSwatches & UseSwatchesComputed
