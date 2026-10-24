// Magento product search for the search layer (layers/search), on the
// shared SearchProvider contract. Registered from ./search.ts through the
// layer's Symbol.for() registry, so the layer has no Magento code at all.
// All GraphQL query-building lives in MagentoAdapter (content.search, backed
// by the real `products(search: ...)` root field); this file only calls into
// it and reshapes the result.
import { useRuntimeConfig } from '#imports'
// Self-referencing package import, as in ./commerce-link.ts.
import { MagentoAdapter } from '@mframework/adapter-magento'
import type { FacetBucket, NumericOperator, ProviderSearchResult, SearchProvider, SearchProviderOptions } from './search-types'

type MagentoConfig = {
  enabled: boolean
  endpoint: string
  storeCode?: string
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

/** With public.magento.via 'directus' (the default), the store is searched
 *  through Directus's /commerce/search like the rest of the store data, not
 *  over GraphQL. Returns the Directus URL then, otherwise null. */
function viaDirectus(): string | null {
  const config = useRuntimeConfig() as { public?: { magento?: { via?: string }, directus?: { url?: string } } }
  if (config.public?.magento?.via !== 'directus') return null
  const url = String(config.public?.directus?.url || '').replace(/\/+$/, '')
  return url || null
}

type DirectusProduct = {
  sku: string
  name: string
  price?: { final?: number | null } | null
  images?: string[]
}

type DirectusSearchPage = {
  items: DirectusProduct[]
  total: number
  facets?: Array<{ code: string, options?: Array<{ value: string, count?: number }> }>
}

const DIRECTUS_SORTS: Record<string, string> = {
  'name:asc': 'name', 'name:desc': '-name', 'price:asc': 'price', 'price:desc': '-price',
}

/** /commerce/search needs a query; an empty one lists the catalogue instead. */
export async function searchViaDirectus(url: string, options: SearchProviderOptions): Promise<DirectusSearchPage> {
  const params = new URLSearchParams({ page: String(Math.max(1, options.page)), limit: String(Math.min(50, options.pageSize)) })
  const sort = options.sort ? DIRECTUS_SORTS[`${options.sort.field}:${options.sort.direction}`] : undefined
  if (sort) params.set('sort', sort)
  const query = options.query.trim()
  if (query) {
    params.set('q', query)
    if (options.facets?.length) params.set('facets', '1')
  }
  const response = await fetch(`${url}/commerce/${query ? 'search' : 'products'}?${params}`, { signal: options.signal, headers: { accept: 'application/json' } })
  if (!response.ok) throw new Error(`Directus /commerce/${query ? 'search' : 'products'} answered ${response.status}`)
  const body = await response.json() as { data?: DirectusSearchPage }
  return { items: body.data?.items ?? [], total: Number(body.data?.total) || 0, facets: body.data?.facets ?? [] }
}

let _adapter: MagentoAdapter | null = null

function getAdapter(config: MagentoConfig): MagentoAdapter {
  if (_adapter) return _adapter
  // GQL_KEY is intentionally NOT passed as customerToken —
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
    const directus = viaDirectus()
    if (directus) {
      const page = await searchViaDirectus(directus, options)
      return {
        provider: this.id,
        items: page.items.map((item) => ({
          id: item.sku,
          score: 1,
          source: {
            // The cart/product key for a store product (see productRef.ts).
            id: `magento:${item.sku}`,
            sku: item.sku,
            name: item.name,
            price: item.price?.final ?? null,
            image: item.images?.[0] ?? null,
          },
        })),
        total: page.total,
        facets: options.facets?.length
          ? aggregationsToFacets((page.facets ?? []).map((f) => ({ attribute_code: f.code, options: f.options })), options.facets)
          : {},
        tookMs: Date.now() - start,
      }
    }

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
