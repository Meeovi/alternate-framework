// server/providers/magento.ts
//
// Federates Magento product search into the shared SearchProvider contract,
// following the same shape as mysql.ts/postgres.ts/opensearch.ts. All actual
// GraphQL query-building for Magento lives in adapter-magento's
// MagentoAdapter (content.search, backed by store.queryField's real
// `products(search: ...)` root field) — this file only calls into it and
// reshapes the result, it never talks to Magento's GraphQL endpoint
// directly. Every other part of layers/search (federate.ts, types.ts, the
// /api/search route) stays generic and has no Magento-specific code.
import { useRuntimeConfig } from '#imports'
import { MagentoAdapter } from 'adapter-magento'
import type { FacetBucket, NumericOperator, ProviderSearchResult, SearchProvider, SearchProviderOptions } from './types'

type MagentoConfig = {
  enabled: boolean
  endpoint: string
  storeCode?: string
  token: string
}

type MagentoAggregation = {
  attribute_code: string
  options?: Array<{ value: string, label?: string, count?: number }>
}

type MagentoProductItem = {
  sku?: string
  id?: string | number
  name?: string
  price_range?: { minimum_price?: { final_price?: { value?: number } } }
  small_image?: { url?: string }
}

type MagentoSearchResult = {
  items: MagentoProductItem[]
  total: number
  aggregations: MagentoAggregation[]
}

function getConfig(): MagentoConfig {
  const config = useRuntimeConfig()
  return (config.searchProviders as { magento: MagentoConfig }).magento
}

let _adapter: MagentoAdapter | null = null

function getAdapter(config: MagentoConfig): MagentoAdapter {
  if (_adapter) return _adapter
  // config.token (GQL_KEY) is intentionally NOT passed as customerToken —
  // confirmed live against a real Magento instance that it isn't a valid
  // customer JWT, and attaching it makes Magento reject every GraphQL
  // request on this client, search included.
  _adapter = new MagentoAdapter(config.endpoint, config.storeCode)
  return _adapter
}

// ProductAttributeFilterInput has one input type per attribute (Equal,
// Match, or Range) rather than one generic shape, and there's no way to
// discover which type a given attribute code needs without introspecting
// the live schema per-store. `in` (FilterEqualTypeInput) covers the common
// faceted-nav case — select/multiselect attributes like category or color —
// correctly. Free-text attributes that actually need FilterMatchTypeInput's
// `match` won't filter correctly through this path; accepted gap, same
// category as this codebase's other documented relational-field mismatches.
type MagentoFilterValue = { in?: string[], from?: string, to?: string }

export function buildFilter(filters: SearchProviderOptions['filters']): Record<string, MagentoFilterValue> {
  if (!filters) return {}

  const filter: Record<string, MagentoFilterValue> = {}

  const allRefinements = {
    ...(filters.facetsRefinements || {}),
    ...(filters.disjunctiveFacetsRefinements || {}),
  }
  for (const [field, values] of Object.entries(allRefinements)) {
    if (!Array.isArray(values) || !values.length) continue
    filter[field] = { in: values }
  }

  // FilterRangeTypeInput only has `from`/`to` — >=/> and <=/< map onto
  // those; = and != have no native range equivalent and are skipped rather
  // than silently misapplied.
  for (const [field, operators] of Object.entries(filters.numericRefinements || {})) {
    if (!operators) continue
    for (const [operator, values] of Object.entries(operators) as [NumericOperator, Array<number | string>][]) {
      if (!Array.isArray(values) || !values.length) continue
      const numericValues = values.map(Number).filter((value) => Number.isFinite(value))
      if (!numericValues.length) continue

      if (operator === '>=' || operator === '>') {
        filter[field] = { ...filter[field], from: String(Math.max(...numericValues)) }
      } else if (operator === '<=' || operator === '<') {
        filter[field] = { ...filter[field], to: String(Math.min(...numericValues)) }
      }
    }
  }

  return filter
}

// The full set ProductAttributeSortInput exposes — there is no
// arbitrary-attribute sort on Magento's schema. A requested sort field
// outside this set falls back to default relevance ordering.
const SORTABLE_FIELDS = new Set(['name', 'position', 'price', 'relevance'])

export function buildSort(sort: SearchProviderOptions['sort']): Record<string, 'ASC' | 'DESC'> | undefined {
  if (!sort || !SORTABLE_FIELDS.has(sort.field)) return undefined
  return { [sort.field]: sort.direction === 'asc' ? 'ASC' : 'DESC' }
}

export function aggregationsToFacets(
  aggregations: MagentoAggregation[],
  requestedFields: string[],
): Record<string, FacetBucket[]> {
  const requested = new Set(requestedFields)
  const facets: Record<string, FacetBucket[]> = {}
  for (const aggregation of aggregations) {
    if (!requested.has(aggregation.attribute_code)) continue
    const buckets = (aggregation.options || [])
      .filter((option) => option.value != null)
      .map((option) => ({ value: String(option.value), count: Number(option.count) || 0 }))
    if (buckets.length) facets[aggregation.attribute_code] = buckets
  }
  return facets
}

export const magentoProvider: SearchProvider = {
  id: 'magento',

  isEnabled() {
    return Boolean(getConfig()?.enabled)
  },

  async search(options: SearchProviderOptions): Promise<ProviderSearchResult> {
    const start = Date.now()
    const config = getConfig()
    const magento = getAdapter(config)

    // content.search already builds the Magento GraphQL query (see
    // adapter-magento's src/index.ts) — reused as-is rather than
    // duplicating query-building logic here. `price` isn't a scalar on
    // ProductInterface (confirmed live) — only `price_range` exists.
    const searchResult = await magento.content.search(options.query, {
      pageSize: options.pageSize,
      currentPage: Math.max(1, options.page),
      filter: buildFilter(options.filters),
      sort: buildSort(options.sort),
      aggregations: Boolean(options.facets?.length),
      fields: ['sku', 'name', { price_range: [{ minimum_price: [{ final_price: ['value'] }] }] }, { small_image: ['url'] }],
    }) as MagentoSearchResult

    const rawItems = searchResult?.items ?? []
    const items = rawItems.map((item) => ({
      id: String(item.sku ?? item.id ?? ''),
      score: 1,
      source: {
        sku: item.sku,
        name: item.name,
        price: item.price_range?.minimum_price?.final_price?.value ?? null,
        image: item.small_image?.url ?? null,
      },
    }))

    return {
      provider: this.id,
      items,
      // Real Magento match count (total_count), not just this page's item
      // count — the adapter previously discarded it, which undercounted
      // federated pagination whenever Magento matched more than one page.
      total: searchResult?.total ?? items.length,
      facets: options.facets?.length ? aggregationsToFacets(searchResult?.aggregations ?? [], options.facets) : {},
      tookMs: Date.now() - start,
    }
  },

  // Magento's aggregations have no live "search within facet values"
  // capability — there's no argument to filter an attribute's own option
  // list by a substring. Runs the same filtered aggregations query and
  // narrows the returned option list to facetQuery client-side instead,
  // which is the only way to honor it without a differently-shaped backend
  // query the schema doesn't expose.
  async searchFacetValues(field: string, facetQuery: string, options: SearchProviderOptions): Promise<FacetBucket[]> {
    const config = getConfig()
    const magento = getAdapter(config)

    const searchResult = await magento.content.search(options.query, {
      pageSize: 1,
      filter: buildFilter(options.filters),
      aggregations: true,
      fields: ['sku'],
    }) as MagentoSearchResult

    const aggregation = (searchResult?.aggregations ?? []).find((a) => a.attribute_code === field)
    const buckets: FacetBucket[] = (aggregation?.options ?? [])
      .filter((option) => option.value != null)
      .map((option) => ({ value: String(option.value), count: Number(option.count) || 0 }))

    const trimmedQuery = facetQuery.trim().toLowerCase()
    const filtered = trimmedQuery
      ? buckets.filter((bucket) => bucket.value.toLowerCase().includes(trimmedQuery))
      : buckets

    return filtered.sort((a, b) => b.count - a.count).slice(0, 10)
  },
}
