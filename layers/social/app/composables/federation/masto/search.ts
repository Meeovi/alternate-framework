import {
  createSearchTools,
  type AccountSearchResult,
  type BuildSearchResult,
  type HashTagSearchResult,
  type mastodon,
  type SearchResult,
  type StatusSearchResult,
  type UseSearchOptions,
} from '@mframework/adapter-federation'
import { computed, toValue } from 'vue'
import { isHydrated } from '../../core/vue'
import { currentUser } from '../../contacts/users'
import { getAccountRoute, getStatusRoute, getTagRoute } from './routes'
import { useMastoClient } from './masto'

const searchTools = createSearchTools({
  isHydrated,
  currentUser,
  useMasto: () => ({ client: { value: useMastoClient() } }),
  getAccountRoute: (account: mastodon.v1.Account) => getAccountRoute(account) as any,
  getTagRoute: (tag: string) => getTagRoute(tag) as any,
  getStatusRoute: (status: mastodon.v1.Status) => getStatusRoute(status) as any,
} as any)

export type {
  UseSearchOptions,
  BuildSearchResult,
  AccountSearchResult,
  HashTagSearchResult,
  StatusSearchResult,
  SearchResult,
}

export function useSearch(query: unknown, options: UseSearchOptions = {}) {
  return searchTools.useSearch(String(toValue(query as any) ?? ''), options)
}
