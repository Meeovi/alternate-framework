// server/api/search.ts
//
// Fans a single query out to every enabled backend (OpenSearch,
// Postgres/Supabase, MySQL) via federatedSearch and returns one merged
// response. See server/search/federate.ts for the merge strategy.
import { federatedSearch, getEnabledProviders } from '../search/federate'
import type { SearchProviderOptions, SearchProviderSort } from '../providers/types'

const MAX_PAGE_SIZE = 96
const MAX_QUERY_LENGTH = 512
const DEFAULT_FACET_FIELDS = ['category', 'brand', 'type']
const DEFAULT_TEXT_FIELDS = ['title^3', 'name^3', 'description', 'brand^2', 'category']

function parseSort(raw: unknown): SearchProviderSort | null {
  if (!raw || typeof raw !== 'object') return null
  const field = (raw as Record<string, unknown>).field
  const direction = (raw as Record<string, unknown>).direction
  if (typeof field !== 'string' || !field) return null
  return {
    field,
    direction: direction === 'asc' ? 'asc' : 'desc',
  }
}

function parseStringArray(raw: unknown, fallback: string[]): string[] {
  if (Array.isArray(raw) && raw.every((entry) => typeof entry === 'string') && raw.length > 0) {
    return raw
  }
  return fallback
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const body = await readBody(event).catch(() => ({})) || {}

  if (getEnabledProviders().length === 0) {
    console.warn('[api/search] No search backends are enabled — check ALTERNATE_SEARCH_* / ALTERNATE_SEARCH_PG_URL / ALTERNATE_SEARCH_MYSQL_URL env vars.')
  }

  const searchString = String(query.q ?? body.q ?? '').trim().slice(0, MAX_QUERY_LENGTH)
  const page = Math.max(1, Math.trunc(Number(query.page ?? body.page ?? 1)) || 1)
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.trunc(Number(query.pageSize ?? body.pageSize ?? 12)) || 12),
  )

  const facetFields = parseStringArray(body.facets ?? query.facets, DEFAULT_FACET_FIELDS)
  const textFields = parseStringArray(body.fields ?? query.fields, DEFAULT_TEXT_FIELDS)
  const sort = parseSort(body.sort ?? query.sort)
  const filters = body.instantsearchFilters || body.filters || undefined

  const options: SearchProviderOptions = {
    query: searchString,
    fields: textFields,
    page,
    pageSize,
    facets: facetFields,
    filters,
    sort,
  }

  const result = await federatedSearch(options)
  const failedBackends = result.backends.filter((backend) => !backend.ok)
  const allFailed = result.backends.length > 0 && failedBackends.length === result.backends.length

  return {
    success: true,
    items: result.items,
    total: result.total,
    page,
    pageSize,
    facets: result.facets,
    tookMs: result.tookMs,
    backends: result.backends,
    ...(allFailed
      ? { warning: 'All search backends are unavailable right now.' }
      : result.backends.length === 0
        ? { warning: 'No search backends are configured.' }
        : failedBackends.length > 0
          ? { warning: `${failedBackends.map((b) => b.provider).join(', ')} unavailable; showing results from the remaining backend(s).` }
          : {}),
  }
})
