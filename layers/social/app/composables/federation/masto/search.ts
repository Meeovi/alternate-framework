import {
  createSearchTools,
  type AccountSearchResult,
  type BuildSearchResult,
  type HashTagSearchResult,
  type SearchResult,
  type StatusSearchResult,
  type UseSearchOptions,
} from '@mframework/adapter-federation'
import type { MaybeRefOrGetter } from 'vue'

const searchTools = createSearchTools({
  isHydrated,
  currentUser,
  useMasto,
  getAccountRoute,
  getTagRoute,
  getStatusRoute,
})

export type {
  UseSearchOptions,
  BuildSearchResult,
  AccountSearchResult,
  HashTagSearchResult,
  StatusSearchResult,
  SearchResult,
}

export function useSearch(query: MaybeRefOrGetter<string>, options: UseSearchOptions = {}) {
  return searchTools.useSearch(query, options)
}
