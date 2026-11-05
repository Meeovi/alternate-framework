// utils/resultsUrl.ts
//
// The results page's state <-> its address:
//   /results?q=loops&category=Music+Bytes&type=Products&price=:25&sort=price-desc&per=48&page=2
// so a results page can be shared, bookmarked, reloaded and gone back to.
import { buildSortIndexName } from '../composables/useSearchClient'

// vue-router's LocationQuery / LocationQueryRaw, written out: importing
// even just the types from 'vue-router' in this file made the dev server
// fail every component that imported it ("Failed to fetch dynamically
// imported module").
type QueryValue = string | number | null | undefined | Array<string | number | null | undefined>
type LocationQuery = Record<string, QueryValue>
type LocationQueryRaw = Record<string, QueryValue>

/** InstantSearch's ui state for one index (the parts this page uses). */
export type ResultsUiState = {
  query?: string
  page?: number
  refinementList?: Record<string, string[]>
  numericMenu?: Record<string, string>
  ratingMenu?: Record<string, number>
  sortBy?: string
  hitsPerPage?: number
}

// Filter lists and the address parameter each one uses.
const LISTS: Record<string, string> = { category: 'category', resultType: 'type', brand: 'brand' }
const PER_PAGE = [12, 24, 48, 96]
const NUMERIC_RANGE = /^(-?\d+(\.\d+)?)?(:(-?\d+(\.\d+)?)?)?$/
const MAX_VALUES = 20
const MAX_VALUE_LENGTH = 200

function list(value: unknown): string[] {
  const values = Array.isArray(value) ? value : value == null ? [] : [value]
  return values
    .filter((entry): entry is string => typeof entry === 'string' && entry.length > 0 && entry.length <= MAX_VALUE_LENGTH)
    .slice(0, MAX_VALUES)
}

function first(value: unknown): string {
  return list(value)[0] ?? ''
}

export function uiStateFromQuery(query: LocationQuery, index: string): ResultsUiState {
  const state: ResultsUiState = {}
  const q = first(query.q).trim()
  if (q) state.query = q

  const page = Math.trunc(Number(first(query.page)))
  if (page > 1) state.page = page

  for (const [attribute, param] of Object.entries(LISTS)) {
    const values = list(query[param])
    if (values.length) (state.refinementList ??= {})[attribute] = values
  }

  const price = first(query.price)
  if (price && price !== ':' && NUMERIC_RANGE.test(price)) state.numericMenu = { price }

  const rating = Math.trunc(Number(first(query.rating)))
  if (rating >= 1 && rating <= 5) state.ratingMenu = { rating }

  const sort = first(query.sort).match(/^(price|rating)-(asc|desc)$/)
  if (sort) state.sortBy = buildSortIndexName(index, sort[1]!, sort[2] as 'asc' | 'desc')

  const per = Number(first(query.per))
  if (PER_PAGE.includes(per) && per !== 24) state.hitsPerPage = per

  return state
}

export function queryFromUiState(state: ResultsUiState, index: string): LocationQueryRaw {
  const query: LocationQueryRaw = {}
  if (state.query) query.q = state.query
  query.index = index

  for (const [attribute, param] of Object.entries(LISTS)) {
    const values = state.refinementList?.[attribute]
    if (values?.length) query[param] = values.slice()
  }

  const price = state.numericMenu?.price
  if (price && price !== ':') query.price = price
  const rating = state.ratingMenu?.rating
  if (rating) query.rating = String(rating)

  const sort = state.sortBy?.match(/__sort__(\w+)__(asc|desc)$/)
  if (sort) query.sort = `${sort[1]}-${sort[2]}`
  if (state.hitsPerPage && state.hitsPerPage !== 24) query.per = String(state.hitsPerPage)
  if (state.page && state.page > 1) query.page = String(state.page)
  return query
}

function normalise(query: LocationQuery | LocationQueryRaw): string {
  return JSON.stringify(Object.keys(query).filter((key) => key !== 'index').sort().map((key) => {
    const value = query[key]
    const values = (Array.isArray(value) ? value : [value]).filter((entry) => entry != null && entry !== '').map(String)
    return [key, values]
  }).filter(([, values]) => (values as string[]).length))
}

/** Same page state? (The index name doesn't count: it has a default.) */
export function sameQuery(a: LocationQuery | LocationQueryRaw, b: LocationQuery | LocationQueryRaw): boolean {
  return normalise(a) === normalise(b)
}

/** The filters in the address as /api/search takes them, so the
 *  server-rendered first view of a shared link is already filtered. */
export function apiFiltersFromQuery(query: LocationQuery, index: string) {
  const state = uiStateFromQuery(query, index)
  const facetFilters = Object.entries(state.refinementList ?? {})
    .map(([attribute, values]) => values.map((value) => `${attribute}:${value}`))
  const numericFilters: string[] = []
  const price = state.numericMenu?.price
  if (price) {
    const [start, end] = price.split(':')
    if (end === undefined) numericFilters.push(`price=${start}`)
    else {
      if (start) numericFilters.push(`price>=${start}`)
      if (end) numericFilters.push(`price<=${end}`)
    }
  }
  if (state.ratingMenu?.rating) numericFilters.push(`rating>=${state.ratingMenu.rating}`)
  const sort = first(query.sort).match(/^(price|rating)-(asc|desc)$/)
  return {
    algoliaFilters: facetFilters.length || numericFilters.length ? { facetFilters, numericFilters } : undefined,
    sort: sort ? { field: sort[1], direction: sort[2] } : undefined,
    pageSize: state.hitsPerPage,
  }
}
