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
// provider is asked for `page * pageSize` results from the top, capped at
// MAX_FEDERATED_DEPTH; the merged, globally-sorted list is then sliced to
// the requested page. This is the standard, disclosed tradeoff for
// federated search without a shared index: correct up to the depth cap,
// approximate beyond it (most production search UIs cap deep pagination
// for the same reason).
import { openSearchProvider } from '../providers/opensearch'
import { postgresProvider } from '../providers/postgres'
import { mysqlProvider } from '../providers/mysql'
import { magentoProvider } from '../providers/magento'
import { algoliaProvider } from '../providers/algolia'
import { meilisearchProvider } from '../providers/meilisearch'
import { typesenseProvider } from '../providers/typesense'
import { databaseProvider } from '../providers/database'
import { memoryProvider } from '../providers/memory'
import type { FacetBucket, NormalizedHit, ProviderStatus, SearchProvider, SearchProviderOptions } from '../providers/types'

const MAX_FEDERATED_DEPTH = 500

const ALL_PROVIDERS: SearchProvider[] = [
  openSearchProvider,
  postgresProvider,
  mysqlProvider,
  magentoProvider,
  algoliaProvider,
  meilisearchProvider,
  typesenseProvider,
  databaseProvider,
  memoryProvider,
]

export function getEnabledProviders(): SearchProvider[] {
  return ALL_PROVIDERS.filter((provider) => {
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

function mergeFacets(results: Array<{ provider: string, facets: Record<string, FacetBucket[]> }>): Record<string, Record<string, number>> {
  const merged: Record<string, Record<string, number>> = {}

  for (const { facets } of results) {
    for (const [field, buckets] of Object.entries(facets)) {
      merged[field] ??= {}
      for (const bucket of buckets) {
        merged[field][bucket.value] = (merged[field][bucket.value] || 0) + bucket.count
      }
    }
  }

  return merged
}

export async function federatedSearch(options: SearchProviderOptions): Promise<FederatedSearchResult> {
  const providers = getEnabledProviders()
  const requestedPage = Math.max(1, options.page)
  const pageSize = Math.max(1, options.pageSize)
  const overfetchSize = Math.min(MAX_FEDERATED_DEPTH, requestedPage * pageSize)

  const overfetchOptions: SearchProviderOptions = { ...options, page: 1, pageSize: overfetchSize }

  const settled = await Promise.allSettled(
    providers.map((provider) => provider.search(overfetchOptions)),
  )

  const backends: ProviderStatus[] = []
  const successful: Array<{ provider: string, items: NormalizedHit[], total: number, facets: Record<string, FacetBucket[]>, tookMs: number | null }> = []

  settled.forEach((outcome, index) => {
    const providerId = providers[index]!.id
    if (outcome.status === 'fulfilled') {
      backends.push({ provider: providerId, ok: true, tookMs: outcome.value.tookMs })
      successful.push(outcome.value)
    } else {
      const message = outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason)
      console.error(`[federatedSearch] provider "${providerId}" failed:`, outcome.reason)
      backends.push({ provider: providerId, ok: false, tookMs: null, error: message })
    }
  })

  // Single provider fast path: skip score normalization entirely, its own
  // ordering is already correct.
  let orderedHits: Array<{ hit: NormalizedHit, provider: string }>

  if (successful.length === 1) {
    orderedHits = successful[0]!.items.map((hit) => ({ hit, provider: successful[0]!.provider }))
  } else if (options.sort) {
    const { field, direction } = options.sort
    const tagged = successful.flatMap(({ provider, items }) => items.map((hit) => ({ hit, provider })))
    tagged.sort((a, b) => compareBySortField(a.hit, b.hit, field, direction))
    orderedHits = tagged
  } else {
    const scoreMaps = successful.map(({ items }) => normalizeScores(items))
    const tagged = successful.flatMap(({ provider, items }, providerIndex) =>
      items.map((hit) => ({ hit, provider, normalizedScore: scoreMaps[providerIndex]!.get(hit) ?? 0 })),
    )
    tagged.sort((a, b) => b.normalizedScore - a.normalizedScore)
    orderedHits = tagged
  }

  const pageStart = (requestedPage - 1) * pageSize
  const pageItems = orderedHits.slice(pageStart, pageStart + pageSize)

  const items: FederatedHit[] = pageItems.map(({ hit, provider }) => ({
    ...hit.source,
    objectID: `${provider}:${hit.id}`,
    _provider: provider,
    _score: hit.score,
  }))

  return {
    items,
    total: successful.reduce((sum, result) => sum + result.total, 0),
    facets: mergeFacets(successful),
    tookMs: backends.reduce<number | null>((max, backend) => (backend.tookMs != null ? Math.max(max ?? 0, backend.tookMs) : max), null),
    backends,
  }
}

/** Powers ais-refinement-list's `searchable` facet-value search across every
 *  enabled provider that implements it. */
export async function federatedSearchFacetValues(field: string, facetQuery: string, options: SearchProviderOptions): Promise<FacetBucket[]> {
  const providers = getEnabledProviders().filter((provider) => typeof provider.searchFacetValues === 'function')

  const settled = await Promise.allSettled(
    providers.map((provider) => provider.searchFacetValues!(field, facetQuery, options)),
  )

  const merged = new Map<string, number>()
  for (const outcome of settled) {
    if (outcome.status !== 'fulfilled') continue
    for (const bucket of outcome.value) {
      merged.set(bucket.value, (merged.get(bucket.value) || 0) + bucket.count)
    }
  }

  return Array.from(merged.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}
