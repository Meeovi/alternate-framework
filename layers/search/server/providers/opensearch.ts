// server/providers/opensearch.ts
import { Client, errors } from '@opensearch-project/opensearch'
import fs from 'node:fs'
import path from 'node:path'
import { useRuntimeConfig } from '#imports'
import type {
  FacetBucket,
  NumericOperator,
  ProviderSearchResult,
  SearchProvider,
  SearchProviderFilters,
  SearchProviderOptions,
} from './types'

let _client: Client | null = null

/** Lazily instantiates and returns the OpenSearch Client using runtime config. */
export function useOpenSearchClient() {
  if (_client) return _client

  const config = useRuntimeConfig()
  const opensearch = config.opensearch as {
    protocol: string
    auth: string
    host: string
    port: number
    caCertsPath?: string
    appName: string
  }

  const nodeUrl = `${opensearch.protocol}://${opensearch.auth}@${opensearch.host}:${opensearch.port}`
  const sslOptions: { ca?: Buffer, rejectUnauthorized?: boolean } = {}

  if (opensearch.caCertsPath) {
    const fullPath = path.resolve(process.cwd(), opensearch.caCertsPath)
    if (fs.existsSync(fullPath)) {
      sslOptions.ca = fs.readFileSync(fullPath)
    } else {
      console.warn(`[OpenSearch Provider] CA certificate not found at ${fullPath}`)
    }
  } else if (opensearch.protocol === 'https') {
    // For local dev with self-signed certs where you don't pass a CA root
    sslOptions.rejectUnauthorized = false
  }

  _client = new Client({
    node: nodeUrl,
    ssl: Object.keys(sslOptions).length ? sslOptions : undefined,
  })

  return _client
}

/** Resolves the dynamic index name based on runtime configurations. */
export function getOpenSearchIndexName() {
  const config = useRuntimeConfig()
  return (config.opensearch as { appName: string }).appName.toLowerCase()
}

export async function createOpenSearchIndex(shards = 4, replicas = 3) {
  const client = useOpenSearchClient()
  const index = getOpenSearchIndexName()

  return await client.indices.create({
    index,
    body: {
      settings: {
        index: {
          number_of_shards: shards,
          number_of_replicas: replicas,
        },
      },
    },
  })
}

export async function indexOpenSearchDocument(id: string, document: Record<string, unknown>) {
  const client = useOpenSearchClient()
  const index = getOpenSearchIndexName()

  return await client.index({
    id,
    index,
    body: document,
    refresh: true,
  })
}

const RANGE_OPERATOR_MAP: Record<string, 'gte' | 'lte' | 'gt' | 'lt'> = {
  '>=': 'gte',
  '<=': 'lte',
  '>': 'gt',
  '<': 'lt',
}

type QueryClause = Record<string, unknown>

/**
 * Translates InstantSearch-style numeric refinements (operators like `>=`,
 * `<=`, `=`, `!=`) into OpenSearch `range`/`term`/`bool.must_not` clauses.
 * The raw operator strings are not valid OpenSearch range keys, so they must
 * be mapped explicitly rather than passed through.
 */
function buildNumericFilterClauses(numericRefinements: SearchProviderFilters['numericRefinements']): QueryClause[] {
  const clauses: QueryClause[] = []
  if (!numericRefinements) return clauses

  for (const [field, operators] of Object.entries(numericRefinements)) {
    if (!operators) continue

    const range: Record<string, number | string> = {}

    for (const [operator, values] of Object.entries(operators) as [NumericOperator, Array<number | string>][]) {
      if (!Array.isArray(values) || values.length === 0) continue

      const mapped = RANGE_OPERATOR_MAP[operator]
      if (mapped) {
        const numericValues = values.map(Number).filter((value) => Number.isFinite(value))
        if (!numericValues.length) continue
        const candidate = mapped === 'gte' || mapped === 'gt'
          ? Math.max(...numericValues)
          : Math.min(...numericValues)
        range[mapped] = candidate
        continue
      }

      if (operator === '=') {
        clauses.push({ terms: { [field]: values } })
        continue
      }

      if (operator === '!=') {
        clauses.push({ bool: { must_not: [{ terms: { [field]: values } }] } })
      }
    }

    if (Object.keys(range).length > 0) {
      clauses.push({ range: { [field]: range } })
    }
  }

  return clauses
}

function buildTermFilterClauses(filters?: SearchProviderFilters): QueryClause[] {
  const clauses: QueryClause[] = []
  if (!filters) return clauses

  const allRefinements = {
    ...(filters.facetsRefinements || {}),
    ...(filters.disjunctiveFacetsRefinements || {}),
  }

  for (const [field, values] of Object.entries(allRefinements)) {
    if (Array.isArray(values) && values.length > 0) {
      clauses.push({ terms: { [field]: values } })
    }
  }

  return clauses
}

// `phrase_prefix` multi_match only works against `text`-type fields — it
// throws `illegal_argument_exception` if any field in the list is
// `keyword`-typed (a normal thing to configure, e.g. `brand`/`category` are
// commonly keyword fields used for both search and faceting). Since field
// types are deployment-specific schema, not something known at code-authoring
// time, we detect the failure at runtime and remember it per field set —
// same pattern as the MySQL provider's FULLTEXT-index fallback — rather than
// paying a failed round-trip on every request.
const phrasePrefixUnsupportedFieldSets = new Set<string>()

function fieldSetKey(fields: string[]): string {
  return fields.join(',')
}

/**
 * Builds a robust full-text query: exact/phrase matches are boosted while a
 * fuzzy fallback (fuzziness AUTO) keeps the search forgiving of typos, the
 * way Amazon/eBay/Etsy-style search bars behave.
 */
function buildTextQuery(searchQuery: string, fields: string[]): QueryClause {
  if (!searchQuery) return { match_all: {} }

  const should: QueryClause[] = [
    { multi_match: { query: searchQuery, fields, type: 'best_fields', operator: 'and', boost: 3 } },
    { multi_match: { query: searchQuery, fields, type: 'best_fields', fuzziness: 'AUTO', prefix_length: 2 } },
  ]

  if (!phrasePrefixUnsupportedFieldSets.has(fieldSetKey(fields))) {
    should.push({ multi_match: { query: searchQuery, fields, type: 'phrase_prefix', boost: 2 } })
  }

  return { bool: { should, minimum_should_match: 1 } }
}

function buildQueryBody(options: SearchProviderOptions) {
  const fields = options.fields?.length ? options.fields : ['title', 'description']
  const filterClauses = [
    ...buildTermFilterClauses(options.filters),
    ...buildNumericFilterClauses(options.filters?.numericRefinements),
  ]
  const textQuery = buildTextQuery(options.query, fields)

  return filterClauses.length > 0
    ? { bool: { ...(options.query ? { must: [textQuery] } : {}), filter: filterClauses } }
    : textQuery
}

// The generated `HitsMetadata.hits` type is `Hit & { _source?: T }[]` —
// missing parentheses around the intersection, so it type-checks as an
// array of just `{ _source?: T }` and hides every other Hit field. This
// reflects what OpenSearch actually returns on the wire; `asSearchResult`
// below is the single, documented seam where we assert past the bug.
interface OpenSearchHit {
  _id?: string
  _score?: number | null
  _source?: Record<string, unknown>
}

interface OpenSearchTermsBucket {
  key: string
  doc_count: number
}

interface OpenSearchRawResult {
  body: {
    took?: number
    hits: {
      total?: number | { value: number, relation?: string }
      hits: OpenSearchHit[]
    }
    aggregations?: Record<string, { buckets?: OpenSearchTermsBucket[] } | undefined>
  }
}

function asSearchResult(raw: unknown): OpenSearchRawResult {
  return raw as unknown as OpenSearchRawResult
}

function asSearchParams(params: { index: string, body: Record<string, unknown> }): Parameters<Client['search']>[0] {
  return params as unknown as Parameters<Client['search']>[0]
}

async function runSearch(options: SearchProviderOptions, sortOverride?: SearchProviderOptions['sort'] | undefined) {
  const client = useOpenSearchClient()
  const index = getOpenSearchIndexName()
  const pageSize = Math.max(1, options.pageSize)
  const from = (Math.max(1, options.page) - 1) * pageSize
  const facets = options.facets?.length ? options.facets : ['category', 'brand', 'type']

  const aggs: Record<string, unknown> = {}
  for (const field of facets) {
    aggs[`${field}_terms`] = { terms: { field, size: 100 } }
  }

  const sort = sortOverride !== undefined ? sortOverride : options.sort
  const sortClause = sort ? [{ [sort.field]: sort.direction }, '_score'] : undefined

  // The OpenSearch client's generated types require every request body
  // field (query DSL, aggs) to match its full polymorphic union types,
  // which isn't practical to hand-satisfy for a dynamically built query —
  // `search()`'s response types have the same issue (see asSearchResult
  // above). This is the single, documented seam where we assert past it.
  return await client.search(asSearchParams({
    index,
    body: {
      query: buildQueryBody(options),
      aggs,
      from,
      size: pageSize,
      ...(sortClause ? { sort: sortClause } : {}),
    },
  }))
}

function isMissingIndexError(error: unknown): boolean {
  if (error instanceof errors.ResponseError) {
    return error.body?.error?.type === 'index_not_found_exception'
  }
  return false
}

// OpenSearch wraps shard-level failures in nested `root_cause`/`caused_by`
// objects at varying depths depending on the failure type — the useful
// message is rarely at the top-level `error.body.error.reason` (which is
// often just the generic "all shards failed"). Matching against the whole
// stringified body sidesteps having to pin an exact nesting shape.
function responseErrorText(error: unknown): string {
  if (!(error instanceof errors.ResponseError)) return ''
  try {
    return JSON.stringify(error.body ?? {})
  } catch {
    return ''
  }
}

function isUnsortableFieldError(error: unknown): boolean {
  return /no mapping found for \[.*?\] in order to sort/i.test(responseErrorText(error))
}

function isPhrasePrefixUnsupportedError(error: unknown): boolean {
  return /phrase prefix queries on text fields/i.test(responseErrorText(error))
}

export const openSearchProvider: SearchProvider = {
  id: 'opensearch',

  isEnabled() {
    const config = useRuntimeConfig()
    const providers = config.searchProviders as { opensearch?: { enabled?: boolean } } | undefined
    return providers?.opensearch?.enabled !== false
  },

  async search(options: SearchProviderOptions): Promise<ProviderSearchResult> {
    const start = Date.now()

    let raw
    try {
      raw = await runSearch(options)
    } catch (error: unknown) {
      if (isMissingIndexError(error)) {
        return { provider: this.id, items: [], total: 0, facets: {}, tookMs: Date.now() - start }
      }

      if (isPhrasePrefixUnsupportedError(error)) {
        const fields = options.fields?.length ? options.fields : ['title', 'description']
        phrasePrefixUnsupportedFieldSets.add(fieldSetKey(fields))
        raw = await runSearch(options)
      } else if (isUnsortableFieldError(error) && options.sort) {
        // A misconfigured sort field shouldn't take this provider out of a
        // federated response — fall back to relevance for this backend only.
        raw = await runSearch(options, null)
      } else {
        throw error
      }
    }

    const result = asSearchResult(raw)
    const hits = result.body.hits.hits || []
    const total = typeof result.body.hits.total === 'object' && result.body.hits.total !== null
      ? result.body.hits.total.value
      : (result.body.hits.total ?? hits.length)

    const facets: Record<string, FacetBucket[]> = {}
    for (const field of (options.facets?.length ? options.facets : ['category', 'brand', 'type'])) {
      const bucket = result.body.aggregations?.[`${field}_terms`]
      if (bucket?.buckets?.length) {
        facets[field] = bucket.buckets.map((b) => ({ value: b.key, count: b.doc_count }))
      }
    }

    return {
      provider: this.id,
      items: hits.map((hit) => ({
        id: hit._id ?? '',
        score: hit._score ?? 0,
        source: hit._source ?? {},
      })),
      total,
      facets,
      tookMs: result.body.took ?? (Date.now() - start),
    }
  },

  async searchFacetValues(field: string, facetQuery: string, options: SearchProviderOptions): Promise<FacetBucket[]> {
    const client = useOpenSearchClient()
    const index = getOpenSearchIndexName()

    const buildParams = () => asSearchParams({
      index,
      body: {
        query: buildQueryBody(options),
        size: 0,
        aggs: { values: { terms: { field, size: 1000 } } },
      },
    })

    let raw
    try {
      raw = await client.search(buildParams())
    } catch (error: unknown) {
      if (!isPhrasePrefixUnsupportedError(error)) throw error
      const fields = options.fields?.length ? options.fields : ['title', 'description']
      phrasePrefixUnsupportedFieldSets.add(fieldSetKey(fields))
      raw = await client.search(buildParams())
    }

    const result = asSearchResult(raw)
    const buckets = result.body.aggregations?.values?.buckets ?? []
    const needle = facetQuery.trim().toLowerCase()

    return buckets
      .filter((b) => !needle || b.key.toLowerCase().includes(needle))
      .sort((a, b) => b.doc_count - a.doc_count)
      .slice(0, 10)
      .map((b) => ({ value: b.key, count: b.doc_count }))
  },
}
