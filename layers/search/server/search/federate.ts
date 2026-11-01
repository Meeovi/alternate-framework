// server/search/federate.ts
//
// Fans a single search out to every enabled backend (OpenSearch,
// Postgres/Supabase, MySQL, ...) in parallel and merges the results into one
// response. Each backend is queried and scored independently — there's no
// shared index or comparable relevance scale across them — so the merge
// step normalizes scores per-provider before interleaving.
//
// Pagination note: because each backend orders its own results
// independently, correctly merging page N requires re-deriving the full
// ordering from the start on every request (a k-way merge of independently
// paginated slices would not reflect the true global order). Each enabled
// provider is asked for `page * pageSize` results from the top (at least
// FACET_DEPTH, so filters and facet counts see more than one page), capped
// at MAX_FEDERATED_DEPTH; the merged list is filtered, sorted and then
// sliced to the requested page. This is the standard, disclosed tradeoff for
// federated search without a shared index: correct up to the depth cap,
// approximate beyond it (most production search UIs cap deep pagination
// for the same reason).
import { openSearchProvider } from '../providers/opensearch'
import { postgresProvider } from '../providers/postgres'
import { mysqlProvider } from '../providers/mysql'
import { databaseProvider } from '../providers/database'
import { memoryProvider } from '../providers/memory'
import { directusProvider } from '../providers/directus'
import { getRegisteredProviders } from './registry'
import type { FacetBucket, NormalizedHit, ProviderStatus, SearchProvider, SearchProviderOptions } from '../providers/types'
import { filtersFromRefinements, isEmptyFilters, matchesFilters, withoutAttribute, type SearchFilters } from './filters'

const MAX_FEDERATED_DEPTH = 500

// How long to wait for one provider before answering without it, so a slow
// or hanging backend can't hold up every search. A provider can set its own
// `timeoutMs`.
const DEFAULT_PROVIDER_TIMEOUT_MS = 5000

function providerTimeout(provider: SearchProvider): number {
  const configured = provider.timeoutMs ?? Number(process.env.ALTERNATE_SEARCH_PROVIDER_TIMEOUT_MS)
  return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_PROVIDER_TIMEOUT_MS
}

/** Runs one provider call, rejecting once its timeout passes. The provider
 *  gets an AbortSignal so it can cancel its own requests. */
async function withTimeout<T>(provider: SearchProvider, call: (signal: AbortSignal) => Promise<T>): Promise<T> {
  const ms = providerTimeout(provider)
  const controller = new AbortController()
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort()
      reject(new Error(`timed out after ${ms} ms`))
    }, ms)
  })
  try {
    return await Promise.race([call(controller.signal), timeout])
  } finally {
    clearTimeout(timer)
  }
}

// Built-in providers. Backend-specific ones ship with their plugins and add
// themselves via ./registry.ts: Algolia, Meilisearch and Typesense
// (packages/plugins/Search/search-*), Magento (adapter-magento) and
// AT Protocol (meeovi-atproto).
const BUILT_IN_PROVIDERS: SearchProvider[] = [
  openSearchProvider,
  postgresProvider,
  mysqlProvider,
  databaseProvider,
  memoryProvider,
  directusProvider,
]

export function getEnabledProviders(): SearchProvider[] {
  const builtInIds = new Set(BUILT_IN_PROVIDERS.map((provider) => provider.id))
  const plugins = getRegisteredProviders().filter((provider) => !builtInIds.has(provider.id))
  return [...BUILT_IN_PROVIDERS, ...plugins].filter((provider) => {
    try {
      return provider.isEnabled()
    } catch {
      return false
    }
  })
}

export type FederatedHit = Record<string, unknown> & {
  objectID: string
  _provider: string
  _score: number
}

export type FederatedSearchResult = {
  items: FederatedHit[]
  total: number
  facets: Record<string, Record<string, number>>
  tookMs: number | null
  backends: ProviderStatus[]
}

function normalizeScores(items: NormalizedHit[]): Map<NormalizedHit, number> {
  const normalized = new Map<NormalizedHit, number>()
  if (!items.length) return normalized

  const maxScore = Math.max(...items.map((item) => item.score))
  const minScore = Math.min(...items.map((item) => item.score))
  const range = maxScore - minScore

  for (const item of items) {
    normalized.set(item, range > 0 ? (item.score - minScore) / range : 1)
  }
  return normalized
}

function compareBySortField(a: NormalizedHit, b: NormalizedHit, field: string, direction: 'asc' | 'desc'): number {
  const aValue = a.source[field]
  const bValue = b.source[field]

  if (aValue == null && bValue == null) return 0
  if (aValue == null) return 1
  if (bValue == null) return -1

  const aNum = Number(aValue)
  const bNum = Number(bValue)
  const comparison = Number.isFinite(aNum) && Number.isFinite(bNum)
    ? aNum - bNum
    : String(aValue).localeCompare(String(bValue))

  return direction === 'asc' ? comparison : -comparison
}

// ---------------------------------------------------------------------------
// Facets and filters.
//
// Providers are asked for results only, never filtered: most of them (the
// live Directus, Bluesky and store searches) can't apply the results page's
// filters, and the ones that half could (the store's GraphQL path) expect
// other attribute names. So every enabled provider is fetched unfiltered to
// a fixed depth, and the filters, facet counts, sort and paging below are
// applied here, the same way for every hit. Before this, no filter reached
// any provider and the filter lists were empty.

// Hits fetched per provider for the first pages, so filters and facet
// counts cover more than the visible page.
const FACET_DEPTH = 100

// The `resultType` facet: one plural label per kind of result. A hit's own
// `type` decides how ResultCard.vue renders it (anything it doesn't know is a
// product, including a product's own sub-type), so the same rule here.
const RESULT_TYPE_LABELS: Record<string, string> = {
  atproto_post: 'Bluesky posts',
  atproto_actor: 'Bluesky profiles',
  space: 'Spaces',
  post: 'Posts',
  hashtag: 'Hashtags',
  shop: 'Shops',
  brand: 'Brands',
  category: 'Categories',
  department: 'Departments',
  coupon: 'Coupons',
  profile: 'Profiles',
  user: 'Profiles',
  article: 'Articles',
  list: 'Lists',
}

function resultTypeOf(source: Record<string, unknown>): string {
  const type = String(source.type ?? '').trim().toLowerCase()
  return RESULT_TYPE_LABELS[type] ?? 'Products'
}

/** Names from a string, a number, an object with a name, or a list of those
 *  (e.g. a Directus M2M junction row { categories_id: { name } }). */
function namesOf(value: unknown, depth = 0): string[] {
  if (value == null || depth > 3) return []
  if (typeof value === 'string') return value.trim() ? [value.trim()] : []
  if (typeof value === 'number' || typeof value === 'boolean') return [String(value)]
  if (Array.isArray(value)) return value.flatMap((entry) => namesOf(entry, depth + 1))
  if (typeof value === 'object') {
    const object = value as Record<string, unknown>
    for (const key of ['name', 'title', 'label', 'value']) {
      if (typeof object[key] === 'string' || typeof object[key] === 'number') return namesOf(object[key], depth + 1)
    }
    // A junction row: its one nested object holds the name.
    const nested = Object.values(object).find((entry) => entry && typeof entry === 'object')
    return nested ? namesOf(nested, depth + 1) : []
  }
  return []
}

function facetValuesOf(source: Record<string, unknown>, attribute: string): string[] {
  if (attribute === 'resultType') return [resultTypeOf(source)]
  const raw = attribute === 'category'
    ? source.category ?? source.categories
    : attribute === 'brand'
      ? source.brand ?? source.brands
      : source[attribute]
  return Array.from(new Set(namesOf(raw)))
}

function numberOf(source: Record<string, unknown>, attribute: string): number | null {
  const raw = source[attribute]
  if (raw === null || raw === undefined || raw === '') return null
  const value = typeof raw === 'object' ? Number((raw as Record<string, unknown>).final ?? (raw as Record<string, unknown>).value) : Number(raw)
  return Number.isFinite(value) ? value : null
}

function hitMatches(hit: NormalizedHit, filters: SearchFilters): boolean {
  return matchesFilters(
    filters,
    (attribute) => facetValuesOf(hit.source, attribute),
    (attribute) => numberOf(hit.source, attribute),
  )
}

function countFacet(hits: NormalizedHit[], attribute: string): Map<string, number> {
  const counts = new Map<string, number>()
  for (const hit of hits) {
    for (const value of facetValuesOf(hit.source, attribute)) {
      counts.set(value, (counts.get(value) || 0) + 1)
    }
  }
  return counts
}

// ---------------------------------------------------------------------------
// Fetching, shared between requests for a short time: InstantSearch sends
// one extra request per selected filter list (for that list's counts), all
// with the same query, and a facet search right after; they reuse one fetch.

type MergedFetch = {
  /** Relevance order across providers. */
  hits: Array<{ hit: NormalizedHit, provider: string }>
  successful: Array<{ provider: string, items: NormalizedHit[], total: number, facets: Record<string, FacetBucket[]> }>
  backends: ProviderStatus[]
}

const CACHE_TTL_MS = 30_000
const CACHE_TTL_FAILED_MS = 5_000
const CACHE_MAX_ENTRIES = 200
const fetchCache = new Map<string, { expires: number, value: Promise<MergedFetch> }>()

/** For tests. */
export function clearSearchCache() {
  fetchCache.clear()
}

async function fetchMerged(query: string, depth: number, fields: string[] | undefined): Promise<MergedFetch> {
  const providers = getEnabledProviders()
  const key = JSON.stringify([providers.map((provider) => provider.id), query, depth, fields ?? null])
  const now = Date.now()
  const cached = fetchCache.get(key)
  if (cached && cached.expires > now) return cached.value

  const value = (async (): Promise<MergedFetch> => {
    const options: SearchProviderOptions = { query, fields, page: 1, pageSize: depth, facets: ['category', 'brand', 'type'] }
    const settled = await Promise.allSettled(
      providers.map((provider) => withTimeout(provider, (signal) => provider.search({ ...options, signal }))),
    )

    const backends: ProviderStatus[] = []
    const successful: MergedFetch['successful'] = []
    settled.forEach((outcome, index) => {
      const providerId = providers[index]!.id
      if (outcome.status === 'fulfilled' && outcome.value && Array.isArray(outcome.value.items)) {
        backends.push({ provider: providerId, ok: true, tookMs: outcome.value.tookMs })
        successful.push({ provider: providerId, items: outcome.value.items, total: Number(outcome.value.total) || 0, facets: outcome.value.facets || {} })
      } else {
        const reason = outcome.status === 'rejected' ? outcome.reason : new Error('returned no result')
        const message = reason instanceof Error ? reason.message : String(reason)
        console.error(`[federatedSearch] provider "${providerId}" failed:`, reason)
        backends.push({ provider: providerId, ok: false, tookMs: null, error: message })
      }
    })

    let hits: MergedFetch['hits']
    if (successful.length === 1) {
      // One provider: its own order is already right.
      hits = successful[0]!.items.map((hit) => ({ hit, provider: successful[0]!.provider }))
    } else {
      const scoreMaps = successful.map(({ items }) => normalizeScores(items))
      const tagged = successful.flatMap(({ provider, items }, providerIndex) =>
        items.map((hit) => ({ hit, provider, normalizedScore: scoreMaps[providerIndex]!.get(hit) ?? 0 })),
      )
      tagged.sort((a, b) => b.normalizedScore - a.normalizedScore)
      hits = tagged.map(({ hit, provider }) => ({ hit, provider }))
    }

    return { hits, successful, backends }
  })()

  const failed = (result: MergedFetch) => result.backends.some((backend) => !backend.ok)
  fetchCache.set(key, { expires: now + CACHE_TTL_MS, value })
  value.then((result) => {
    if (failed(result)) fetchCache.set(key, { expires: Date.now() + CACHE_TTL_FAILED_MS, value })
  }, () => fetchCache.delete(key))
  if (fetchCache.size > CACHE_MAX_ENTRIES) {
    for (const [entryKey, entry] of fetchCache) {
      if (entry.expires <= now || fetchCache.size > CACHE_MAX_ENTRIES) fetchCache.delete(entryKey)
    }
  }
  return value
}

function depthFor(page: number, pageSize: number): number {
  // Rounded up to whole FACET_DEPTH steps so neighbouring pages share a fetch.
  const needed = Math.max(FACET_DEPTH, page * pageSize)
  return Math.min(MAX_FEDERATED_DEPTH, Math.ceil(needed / FACET_DEPTH) * FACET_DEPTH)
}

export type FederatedSearchOptions = SearchProviderOptions & {
  /** The results page's filters (filters.ts); applied to every hit here. */
  searchFilters?: SearchFilters
}

function filtersOf(options: FederatedSearchOptions): SearchFilters {
  const parsed = options.searchFilters ?? { facets: [], numeric: [] }
  const legacy = filtersFromRefinements(options.filters)
  return { facets: [...parsed.facets, ...legacy.facets], numeric: [...parsed.numeric, ...legacy.numeric] }
}

export async function federatedSearch(options: FederatedSearchOptions): Promise<FederatedSearchResult> {
  const requestedPage = Math.max(1, options.page)
  const pageSize = Math.max(1, options.pageSize)
  const filters = filtersOf(options)
  const filtered = !isEmptyFilters(filters)

  const merged = await fetchMerged(options.query, depthFor(requestedPage, pageSize), options.fields)

  let hits = filtered ? merged.hits.filter(({ hit }) => hitMatches(hit, filters)) : merged.hits.slice()
  if (options.sort) {
    const { field, direction } = options.sort
    hits = hits.slice().sort((a, b) => compareBySortField(a.hit, b.hit, field, direction))
  }

  const facets: Record<string, Record<string, number>> = {}
  for (const attribute of options.facets ?? []) {
    const counts = countFacet(hits.map(({ hit }) => hit), attribute)
    // With nothing filtered, a provider's own counts can cover more than
    // the hits fetched here; use the larger number.
    if (!filtered) {
      for (const { facets: providerFacets } of merged.successful) {
        for (const bucket of providerFacets[attribute] ?? []) {
          counts.set(bucket.value, Math.max(counts.get(bucket.value) || 0, bucket.count))
        }
      }
    }
    if (counts.size) facets[attribute] = Object.fromEntries(counts)
  }

  const pageStart = (requestedPage - 1) * pageSize
  const items: FederatedHit[] = hits.slice(pageStart, pageStart + pageSize).map(({ hit, provider }) => ({
    ...hit.source,
    resultType: resultTypeOf(hit.source),
    objectID: `${provider}:${hit.id}`,
    _provider: provider,
    _score: hit.score,
  }))

  // Filtered: exactly what passed. Otherwise each provider's own total,
  // which can be more than was fetched.
  const total = filtered
    ? hits.length
    : merged.successful.reduce((sum, result) => sum + Math.max(result.total, result.items.length), 0)

  return {
    items,
    total,
    facets,
    tookMs: merged.backends.reduce<number | null>((max, backend) => (backend.tookMs != null ? Math.max(max ?? 0, backend.tookMs) : max), null),
    backends: merged.backends,
  }
}

export type FacetValueHit = FacetBucket & { highlighted?: string }

/** Powers the filter lists' search boxes ("Find categories"): the values of
 *  `field` among hits for the query that pass the other filters, matching
 *  `facetQuery`. Providers with their own facet search add theirs. */
export async function federatedSearchFacetValues(
  field: string,
  facetQuery: string,
  options: FederatedSearchOptions,
  highlight?: { pre: string, post: string },
): Promise<FacetValueHit[]> {
  const filters = withoutAttribute(filtersOf(options), field)
  const needle = facetQuery.trim().toLowerCase()

  const [merged, providerBuckets] = await Promise.all([
    fetchMerged(options.query, FACET_DEPTH, options.fields),
    Promise.allSettled(
      getEnabledProviders()
        .filter((provider) => typeof provider.searchFacetValues === 'function')
        .map((provider) => withTimeout(provider, (signal) => provider.searchFacetValues!(field, facetQuery, { ...options, signal }))),
    ),
  ])

  const counts = new Map(Array.from(countFacet(merged.hits.map(({ hit }) => hit).filter((hit) => hitMatches(hit, filters)), field))
    .filter(([value]) => !needle || value.toLowerCase().includes(needle)))
  // A provider's own facet search matched by its own rules; kept as given.
  for (const outcome of providerBuckets) {
    if (outcome.status !== 'fulfilled' || !Array.isArray(outcome.value)) continue
    for (const bucket of outcome.value) {
      counts.set(bucket.value, (counts.get(bucket.value) || 0) + bucket.count)
    }
  }

  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, count, ...(highlight ? { highlighted: highlightMatch(value, needle, highlight) } : {}) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}

function highlightMatch(value: string, needle: string, tags: { pre: string, post: string }): string {
  if (!needle) return value
  const at = value.toLowerCase().indexOf(needle)
  if (at === -1) return value
  return `${value.slice(0, at)}${tags.pre}${value.slice(at, at + needle.length)}${tags.post}${value.slice(at + needle.length)}`
}
