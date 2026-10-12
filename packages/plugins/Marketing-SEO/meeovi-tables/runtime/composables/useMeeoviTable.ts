import { computed, ref, watch, type MaybeRefOrGetter, toValue } from 'vue'
import type { MeeoviTableResponse, MeeoviTablesPublicConfig } from '../types'

export interface UseMeeoviTableOptions {
  /** Force a source ('directus', 'magento', ...); default: the API picks. */
  source?: MaybeRefOrGetter<string | undefined>
  pageSize?: number
  /** Initial sort, e.g. 'name' or '-date_created'. */
  sort?: string
}

/**
 * Server-paged, -sorted and -searched rows for one table, from the
 * meeovi-tables API (`GET {apiBase}/:collection`). Changing page, pageSize,
 * sort, search or source refetches; SSR forwards the visitor's cookie.
 */
export function useMeeoviTable(collection: MaybeRefOrGetter<string>, options: UseMeeoviTableOptions = {}) {
  const config = useRuntimeConfig().public.meeoviTables as MeeoviTablesPublicConfig
  const apiBase = config?.apiBase || '/api/tables'

  const page = ref(1)
  const pageSize = ref(options.pageSize || config?.pageSize || 25)
  const sort = ref<string | undefined>(options.sort)
  const search = ref('')
  const source = ref<string | undefined>(toValue(options.source))

  // A new search, sort, source or page size starts again at page 1.
  watch([search, sort, source, pageSize], () => { page.value = 1 })

  const query = computed(() => ({
    page: page.value,
    pageSize: pageSize.value,
    sort: sort.value || undefined,
    search: search.value.trim() || undefined,
    source: source.value || undefined,
  }))

  const { data, status, error, refresh } = useFetch<MeeoviTableResponse>(
    () => `${apiBase}/${encodeURIComponent(toValue(collection))}`,
    {
      query,
      key: computed(() => `meeovi-table:${toValue(collection)}`).value,
      watch: [query],
    },
  )

  return {
    data,
    rows: computed(() => data.value?.rows ?? []),
    schema: computed(() => data.value?.schema ?? []),
    total: computed(() => data.value?.total ?? 0),
    sources: computed(() => data.value?.sources ?? []),
    activeSource: computed(() => data.value?.source),
    label: computed(() => data.value?.label ?? toValue(collection)),
    canEdit: computed(() => Boolean(data.value?.canEdit)),
    primaryKey: computed(() => data.value?.primaryKey ?? 'id'),
    notice: computed(() => data.value?.notice ?? null),
    apiBase,
    pending: computed(() => status.value === 'pending'),
    error,
    refresh,
    page,
    pageSize,
    sort,
    search,
    source,
  }
}
