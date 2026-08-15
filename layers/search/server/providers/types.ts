// server/providers/types.ts
//
// Shared contract every search backend (OpenSearch, Postgres/Supabase,
// MySQL, ...) implements. server/search/federate.ts fans a single query out
// to every enabled provider in parallel and merges their results, so each
// provider only needs to translate InstantSearch-shaped filters into its own
// query language and normalize its response back into this shape.

export type NumericOperator = '=' | '!=' | '<' | '<=' | '>' | '>='

export type SearchProviderFilters = {
  /** Conjunctive/disjunctive term refinements (e.g. category, brand). Both
   *  are treated as disjunctive (OR within an attribute, AND across
   *  attributes) — the distinction matters to InstantSearch's UI state, not
   *  to how a backend executes the filter. */
  facetsRefinements?: Record<string, string[]>
  disjunctiveFacetsRefinements?: Record<string, string[]>
  numericRefinements?: Record<string, Partial<Record<NumericOperator, Array<number | string>>>>
}

export type SearchProviderSort = {
  field: string
  direction: 'asc' | 'desc'
}

export type SearchProviderOptions = {
  query: string
  /** Fields to run full-text search against. Providers map these onto their
   *  own schema (OpenSearch fields, SQL columns) as best they can. */
  fields?: string[]
  page: number
  pageSize: number
  /** Facet fields to return term counts for. */
  facets?: string[]
  filters?: SearchProviderFilters
  sort?: SearchProviderSort | null
}

export type NormalizedHit = {
  /** Stable id, unique within this provider. */
  id: string
  /** Backend-native relevance score, NOT comparable across providers
   *  (BM25 vs ts_rank vs MySQL relevance live on different scales) — see
   *  federate.ts for how scores are normalized before merging. */
  score: number
  source: Record<string, unknown>
}

export type FacetBucket = {
  value: string
  count: number
}

export type ProviderSearchResult = {
  provider: string
  items: NormalizedHit[]
  /** Total matching documents for this provider alone (federate.ts sums
   *  these into an approximate combined total). */
  total: number
  facets: Record<string, FacetBucket[]>
  tookMs: number | null
}

export type ProviderStatus = {
  provider: string
  ok: boolean
  tookMs: number | null
  error?: string
}

export interface SearchProvider {
  readonly id: string
  isEnabled(): boolean
  search(options: SearchProviderOptions): Promise<ProviderSearchResult>
  /** Optional: powers ais-refinement-list's `searchable` facet-value search.
   *  Providers that can't support it (or haven't implemented it yet) are
   *  simply skipped by the aggregator. */
  searchFacetValues?(field: string, facetQuery: string, options: SearchProviderOptions): Promise<FacetBucket[]>
}
