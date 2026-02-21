import { ref, computed } from 'vue'
export type SearchHit = Record<string, any>
import { useNuxtApp } from 'nuxt/app'
import { useSearch as useSearchBridge } from './bridges/vue'

// Layer-local composable that prefers a runtime SearchManager (adapter) when available.
export function useStorefront() {
  const nuxt = useNuxtApp() as any

  // Try common locations for a SearchManager injected by the runtime/module.
  const manager = nuxt?.$searchManager || nuxt?.searchManager || nuxt?._context?.searchManager || nuxt?.nuxt?.searchManager
  if (manager) {
    // Delegate to the Vue bridge which expects a SearchManager instance
    // and extend it with an `autocomplete` helper so the returned shape
    // matches the fallback branch (keeps components type-safe).
    const bridge = useSearchBridge(manager)

    async function autocomplete(input: string, limit = 6) {
      // Best-effort suggestions via manager.search; preserve previous state.
      try {
        const prevQuery = manager.context.state.query
        const prevPage = manager.context.state.page
        const prevPageSize = manager.context.state.pageSize

        manager.context.setQuery(input || '')
        manager.context.setPage(1)
        manager.context.setPageSize(limit)

        const res = await manager.search()
        const items = res.items || []
        return Array.isArray(items) ? items.slice(0, limit) : []
      } catch (e) {
        return []
      }
    }

    return {
      query: bridge.query,
      page: bridge.page,
      pageSize: (bridge as any).pageSize || (bridge as any).perPage,
      results: (bridge as any).results,
      total: bridge.total,
      loading: bridge.loading,
      search: bridge.search,
      autocomplete
    }
  }

  // Fallback to legacy instantsearch client behaviour (maintain existing pattern).
  const client: any = nuxt.$searchClient
  const indexName: string = (nuxt.$searchIndexName as string) || 'default'
  const helpers: any = nuxt.$searchHelpers || {}

  const query = ref('')
  const hits = ref<SearchHit[]>([])
  const total = ref(0)
  const loading = ref(false)
  const page = ref(1)
  const perPage = ref(12)
  const sortBy = ref<string | null>(null)
  const facets = ref<Record<string, any>>({})
  const geo = ref<{ lat?: number; lon?: number; distanceKm?: number }>({})
  const semantic = ref(false)
  const ranking = ref<'relevance' | 'newest' | 'popularity' | 'custom'>('relevance')

  async function search() {
    if (!client || typeof client.search !== 'function') {
      throw new Error('Search client is not available or does not implement `search`')
    }

    loading.value = true
    const from = (page.value - 1) * perPage.value

    const params: any = {
      params: {
        q: query.value || '*',
        size: perPage.value,
        from,
      },
    }

    if (ranking.value === 'newest') {
      params.params.sort = 'created_at:desc'
    } else if (ranking.value === 'popularity') {
      params.params.sort = 'popularity:desc'
    } else if (sortBy.value) {
      params.params.sort = sortBy.value
    }

    if (geo.value.lat && geo.value.lon && geo.value.distanceKm) {
      params.body = params.body || {}
      params.body.query = params.body.query || { bool: { must: [{ match_all: {} }], filter: [] } }
      const filter = { geo_distance: { distance: `${geo.value.distanceKm}km`, location: { lat: geo.value.lat, lon: geo.value.lon } } }
      params.body.query.bool.filter.push(filter)
    }

    if (semantic.value) {
      params.params.semantic = true
    }

    try {
      const results = await client.search([{ indexName, ...params }])
      const res = results && results[0]
      if (!res) {
        hits.value = []
        total.value = 0
        facets.value = {}
        return
      }

      const rawHits = (res.hits && res.hits.hits) || (res.hits && res.hits) || res.hits
      let parsedHits: any[] = []
      if (Array.isArray(rawHits)) {
        parsedHits = rawHits.map((h: any) => (h._source ? { ...h._source, _meta: h._id } : h))
      } else if (res.hits && res.hits.hits) {
        parsedHits = res.hits.hits.map((h: any) => (h._source ? { ...h._source, _meta: h._id } : h))
      } else if (res.hits) {
        parsedHits = res.hits
      } else {
        parsedHits = []
      }

      total.value = (res.hits && (res.hits.total?.value ?? res.hits.total)) || res.nbHits || 0

      const rawAggs = res.aggregations || res.facets || {}
      if (helpers && typeof helpers.mapAggregations === 'function') {
        try {
          facets.value = helpers.mapAggregations(rawAggs)
        } catch (e) {
          facets.value = rawAggs
        }
      } else {
        facets.value = rawAggs
      }

      if (semantic.value && helpers && typeof helpers.semanticRerank === 'function') {
        try {
          const reranked = await helpers.semanticRerank(parsedHits, query.value)
          hits.value = Array.isArray(reranked) ? reranked : parsedHits
        } catch (e) {
          hits.value = parsedHits
        }
      } else {
        hits.value = parsedHits
      }
    } finally {
      loading.value = false
    }
  }

  async function autocomplete(input: string, limit = 6) {
    if (!client) return []
    try {
      const params = {
        params: { q: input || '*', size: limit },
      }
      const result = await client.search([{ indexName, ...params }])
      const r = result && result[0]
      const suggestionHits = (r && ((r.hits && r.hits.hits) || r.hits)) || []
      return Array.isArray(suggestionHits)
        ? suggestionHits.map((h: any) => (h._source ? h._source : h))
        : []
    } catch (e) {
      return []
    }
  }

  function setPage(p: number) {
    page.value = p
    return search()
  }

  function setPerPage(n: number) {
    perPage.value = n
    page.value = 1
    return search()
  }

  function setSort(sort: string | null) {
    sortBy.value = sort
    return search()
  }

  function setGeo(lat: number, lon: number, distanceKm = 50) {
    geo.value = { lat, lon, distanceKm }
    page.value = 1
    return search()
  }

  function setSemantic(enabled: boolean) {
    semantic.value = enabled
    return search()
  }

  const totalPages = computed(() => Math.max(1, Math.ceil((total.value || 0) / perPage.value)))

  const normalizedFacets = computed(() => {
    const out: Record<string, Array<{ key: string; doc_count: number }>> = {}
    try {
      for (const k of Object.keys(facets.value || {})) {
        const v = (facets.value as any)[k]
        if (!v) {
          out[k] = []
          continue
        }
        if (Array.isArray(v)) {
          out[k] = v.map((b: any) => ({ key: b.key ?? b.value ?? String(b), doc_count: b.doc_count ?? b.count ?? 0 }))
        } else if (v.buckets) {
          out[k] = v.buckets.map((b: any) => ({ key: b.key ?? b.value, doc_count: b.doc_count ?? 0 }))
        } else if (v.terms) {
          out[k] = v.terms.map((b: any) => ({ key: b.key ?? b.value, doc_count: b.doc_count ?? 0 }))
        } else {
          out[k] = Object.keys(v).map((kk) => ({ key: kk, doc_count: (v as any)[kk] }))
        }
      }
    } catch (e) {
      return {}
    }
    return out
  })

  return {
    query,
    hits,
    total,
    loading,
    page,
    perPage,
    sortBy,
    facets,
    geo,
    semantic,
    ranking,
    totalPages,

    search,
    autocomplete,
    setPage,
    setPerPage,
    setSort,
    setGeo,
    setSemantic,
    normalizedFacets,
  }
}

export default useStorefront
