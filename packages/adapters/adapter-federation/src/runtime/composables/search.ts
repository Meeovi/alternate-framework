import { computed, readonly, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import type { RouteLocation } from 'vue-router'
import type { mastodon } from '../../clients/mastodon'

export type UseSearchOptions = MaybeRefOrGetter<
  Partial<Omit<mastodon.rest.v2.SearchParams, keyof mastodon.DefaultPaginationParams | 'q'>>
>

export interface BuildSearchResult<K extends keyof any, T> {
  id: string
  type: K
  data: T
  to: RouteLocation & {
    href: string
  }
}

export type AccountSearchResult = BuildSearchResult<'account', mastodon.v1.Account>
export type HashTagSearchResult = BuildSearchResult<'hashtag', mastodon.v1.Tag>
export type StatusSearchResult = BuildSearchResult<'status', mastodon.v1.Status>

export type SearchResult = HashTagSearchResult | AccountSearchResult | StatusSearchResult

export interface SearchToolsDeps {
  isHydrated: { value: boolean }
  currentUser: { value: unknown }
  useMasto: () => { client: { value: mastodon.rest.Client } }
  getAccountRoute: (account: mastodon.v1.Account) => RouteLocation & { href: string }
  getTagRoute: (tag: string) => RouteLocation & { href: string }
  getStatusRoute: (status: mastodon.v1.Status) => RouteLocation & { href: string }
}

export function createSearchTools(deps: SearchToolsDeps): { useSearch: (query: MaybeRefOrGetter<string>, options?: UseSearchOptions) => {
  accounts: ReturnType<typeof ref<AccountSearchResult[]>>,
  hashtags: ReturnType<typeof ref<HashTagSearchResult[]>>,
  statuses: ReturnType<typeof ref<StatusSearchResult[]>>,
  loading: ReturnType<typeof readonly<ReturnType<typeof ref<boolean>>>>,
  next: () => Promise<void>,
} } {
  function useSearch(query: MaybeRefOrGetter<string>, options: UseSearchOptions = {}) {
    const done = ref(false)
    const { client } = deps.useMasto()
    const loading = ref(false)
    const accounts = ref<AccountSearchResult[]>([])
    const hashtags = ref<HashTagSearchResult[]>([])
    const statuses = ref<StatusSearchResult[]>([])

    const q = computed(() => toValue(query).trim())

    let paginator: mastodon.Paginator<mastodon.v2.Search, mastodon.rest.v2.SearchParams> | undefined
    let debounceHandle: ReturnType<typeof setTimeout> | undefined

    const appendResults = (results: mastodon.v2.Search, empty = false) => {
      if (empty) {
        accounts.value = []
        hashtags.value = []
        statuses.value = []
      }

      accounts.value = [...accounts.value, ...results.accounts.map<AccountSearchResult>(account => ({
        type: 'account',
        id: account.id,
        data: account,
        to: deps.getAccountRoute(account),
      }))]

      hashtags.value = [...hashtags.value, ...results.hashtags.map<HashTagSearchResult>(hashtag => ({
        type: 'hashtag',
        id: `hashtag-${hashtag.name}`,
        data: hashtag,
        to: deps.getTagRoute(hashtag.name),
      }))]

      statuses.value = [...statuses.value, ...results.statuses.map<StatusSearchResult>(status => ({
        type: 'status',
        id: status.id,
        data: status,
        to: deps.getStatusRoute(status),
      }))]
    }

    watch(() => toValue(query), () => {
      loading.value = !!(q.value && deps.isHydrated.value)
    })

    watch(() => toValue(query), () => {
      if (debounceHandle)
        clearTimeout(debounceHandle)

      debounceHandle = setTimeout(async () => {
        if (!q.value || !deps.isHydrated.value)
          return

        loading.value = true
        paginator = client.value.v2.search.list({
          q: q.value,
          ...toValue(options),
          resolve: !!deps.currentUser.value,
        })

        const nextResults = await paginator.values().next()
        done.value = !!nextResults.done

        if (!nextResults.done)
          appendResults(nextResults.value, true)

        loading.value = false
      }, 300)
    })

    const next = async () => {
      if (!q.value || !deps.isHydrated.value || !paginator)
        return

      loading.value = true
      const nextResults = await paginator.values().next()
      loading.value = false

      done.value = !!nextResults.done
      if (!nextResults.done)
        appendResults(nextResults.value)
    }

    return {
      accounts,
      hashtags,
      statuses,
      loading: readonly(loading),
      next,
    }
  }

  return {
    useSearch,
  }
}
