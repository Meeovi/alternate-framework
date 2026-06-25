
export type UseSwatchesState = {
  data: any[] | null
  loading: boolean
}

export type FetchSwatches = () => Promise<Ref<any[] | null>>

export interface UseSwatches {
  data: Readonly<Ref<UseSwatchesState['data']>>
  loading: Readonly<Ref<boolean>>
  fetchSwatches: FetchSwatches
}

export type UseSwatchesReturn = () => UseSwatches
