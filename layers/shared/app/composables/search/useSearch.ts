import type { SharedSearchProvider } from '../../plugins/search.client'

export const useSearch = (): SharedSearchProvider => {
  const { $search } = useNuxtApp()
  return $search as SharedSearchProvider
}
