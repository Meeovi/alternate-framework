import type { SearchFilter, SearchQuery, SortOption } from '../types/search/query'

export class SearchValidationError extends Error {
  statusCode: number

  constructor(message: string, statusCode = 400) {
    super(message)
    this.name = 'SearchValidationError'
    this.statusCode = statusCode
  }
}

export const SEARCH_MAX_QUERY_LENGTH = 200
export const SEARCH_MAX_FILTERS = 10
export const SEARCH_MAX_SORT_FIELDS = 3
export const SEARCH_MAX_PAGE_SIZE = 50
export const SEARCH_MAX_PAGE = 1000
export const SEARCH_FIELD_PATTERN = /^[A-Za-z0-9_.-]{1,64}$/

function asTrimmedString(value: unknown) {
  return String(value ?? '').trim()
}

export function sanitizeSearchText(value: unknown) {
  const normalized = asTrimmedString(value).slice(0, SEARCH_MAX_QUERY_LENGTH)

  if (!normalized) {
    return ''
  }

  if (/^[*%]+$/.test(normalized) || normalized.includes('*')) {
    throw new SearchValidationError('Wildcard search terms are not allowed')
  }

  return normalized
}

export function sanitizeSearchPositiveInteger(value: unknown, fallback: number, max: number) {
  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback
  }

  return Math.min(parsed, max)
}

export function sanitizeSearchOffset(value: unknown) {
  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed < 0) {
    return 0
  }

  return parsed
}

export function sanitizeSearchFilters(filters: unknown): SearchFilter[] {
  if (!Array.isArray(filters)) {
    return []
  }

  return filters.slice(0, SEARCH_MAX_FILTERS).flatMap<SearchFilter>((entry) => {
    if (!entry || typeof entry !== 'object') {
      return []
    }

    const field = asTrimmedString((entry as any).field)

    if (!SEARCH_FIELD_PATTERN.test(field)) {
      return []
    }

    const value = (entry as any).value

    if (typeof value === 'string') {
      const normalizedValue = value.trim().slice(0, SEARCH_MAX_QUERY_LENGTH)
      return normalizedValue ? [{ field, value: normalizedValue }] : []
    }

    if (typeof value === 'number') {
      return Number.isFinite(value) ? [{ field, value }] : []
    }

    if (typeof value === 'boolean') {
      return [{ field, value }]
    }

    return []
  })
}

export function sanitizeSearchSort(sort: unknown): SortOption[] {
  if (!Array.isArray(sort)) {
    return []
  }

  return sort.slice(0, SEARCH_MAX_SORT_FIELDS).flatMap((entry) => {
    if (!entry || typeof entry !== 'object') {
      return []
    }

    const field = asTrimmedString((entry as any).field)
    const direction = asTrimmedString((entry as any).direction).toLowerCase()

    if (!SEARCH_FIELD_PATTERN.test(field) || !['asc', 'desc'].includes(direction)) {
      return []
    }

    return [{ field, direction: direction as SortOption['direction'] }]
  })
}

export function sanitizeSearchQuery(query: Partial<SearchQuery> & { term?: unknown }) {
  const pageSize = sanitizeSearchPositiveInteger((query as any).pageSize ?? query.limit, 10, SEARCH_MAX_PAGE_SIZE)
  const page = sanitizeSearchPositiveInteger(query.page, 1, SEARCH_MAX_PAGE)
  const offset = sanitizeSearchOffset(query.offset)

  return {
    term: sanitizeSearchText((query as any).term ?? query.q),
    q: sanitizeSearchText((query as any).term ?? query.q),
    filters: sanitizeSearchFilters(query.filters),
    sort: sanitizeSearchSort(query.sort),
    page,
    limit: pageSize,
    pageSize,
    offset,
  }
}

export function isGraphqlSearchRequest(body: unknown) {
  if (!body || typeof body !== 'object') {
    return false
  }

  const query = typeof (body as any).query === 'string' ? (body as any).query : ''
  const operationName = asTrimmedString((body as any).operationName)

  return /\bsearch\s*\(/.test(query) || operationName.toLowerCase() === 'search'
}

export function sanitizeGraphqlSearchRequestBody<T extends Record<string, any>>(body: T): T {
  if (!isGraphqlSearchRequest(body)) {
    return body
  }

  const sanitizedSearch = sanitizeSearchQuery({
    q: body?.variables?.q,
    page: body?.variables?.page,
    limit: body?.variables?.limit,
    pageSize: body?.variables?.pageSize,
    offset: body?.variables?.offset,
    filters: body?.variables?.filters,
    sort: body?.variables?.sort,
  })

  return {
    ...body,
    variables: {
      ...(body.variables || {}),
      q: sanitizedSearch.q,
      page: sanitizedSearch.page,
      limit: sanitizedSearch.limit,
      pageSize: sanitizedSearch.pageSize,
      offset: sanitizedSearch.offset,
      filters: sanitizedSearch.filters,
      sort: sanitizedSearch.sort,
    },
  }
}