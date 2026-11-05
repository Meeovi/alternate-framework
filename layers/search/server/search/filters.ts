// server/search/filters.ts
//
// The results page's filters, as one shape federate.ts applies to every
// hit: an AND of OR-groups. InstantSearch sends Algolia's own parameters
// (facetFilters: [["category:Music", "category:Art"], "type:Products"],
// numericFilters: ["price>=25", "price<=50"]); older callers send the
// helper-state shape (facetsRefinements & co.). Both end up here.
import type { NumericOperator, SearchProviderFilters } from '../providers/types'

export type FacetClause = { attribute: string, value: string, negate: boolean }
export type NumericClause = { attribute: string, operator: NumericOperator, value: number }

export type SearchFilters = {
  facets: FacetClause[][]
  numeric: NumericClause[][]
}

export type AlgoliaFilterParams = {
  facetFilters?: unknown
  numericFilters?: unknown
}

const MAX_CLAUSES = 50
const MAX_VALUE_LENGTH = 200
const OPERATORS: NumericOperator[] = ['<=', '>=', '!=', '<', '>', '=']

export function isEmptyFilters(filters: SearchFilters): boolean {
  return !filters.facets.length && !filters.numeric.length
}

/** "category:Music Bytes" -> clause; "-brand:Acme" negates. The helper
 *  escapes a value's own leading "-" as "\-". */
function parseFacetFilter(raw: unknown): FacetClause | null {
  if (typeof raw !== 'string') return null
  let text = raw.trim()
  const negate = text.startsWith('-')
  if (negate) text = text.slice(1)
  const colon = text.indexOf(':')
  if (colon <= 0) return null
  const attribute = text.slice(0, colon).trim()
  let value = text.slice(colon + 1).trim()
  if (value.startsWith('"') && value.endsWith('"') && value.length > 1) value = value.slice(1, -1)
  value = value.replace(/^\\-/, '-')
  if (!attribute || !value || value.length > MAX_VALUE_LENGTH) return null
  return { attribute, value, negate }
}

/** "price>=25" -> clause. */
function parseNumericFilter(raw: unknown): NumericClause | null {
  if (typeof raw !== 'string') return null
  const match = raw.trim().match(/^([\w.]+)\s*(<=|>=|!=|<|>|=)\s*(-?\d+(?:\.\d+)?)$/)
  if (!match) return null
  const operator = match[2] as NumericOperator
  if (!OPERATORS.includes(operator)) return null
  return { attribute: match[1]!, operator, value: Number(match[3]) }
}

function parseGroups<T>(raw: unknown, parse: (entry: unknown) => T | null): T[][] {
  // Algolia also accepts a single string here; an array's entries are
  // ANDed, and an entry that is itself an array is an OR-group.
  const list = typeof raw === 'string' ? [raw] : Array.isArray(raw) ? raw : []
  const groups: T[][] = []
  for (const entry of list.slice(0, MAX_CLAUSES)) {
    const group = (Array.isArray(entry) ? entry.slice(0, MAX_CLAUSES) : [entry])
      .map(parse)
      .filter((clause): clause is T => clause !== null)
    if (group.length) groups.push(group)
  }
  return groups
}

export function parseAlgoliaFilters(params: AlgoliaFilterParams | undefined): SearchFilters {
  return {
    facets: parseGroups(params?.facetFilters, parseFacetFilter),
    numeric: parseGroups(params?.numericFilters, parseNumericFilter),
  }
}

/** The helper-state shape: OR within an attribute, AND across attributes. */
export function filtersFromRefinements(refinements: SearchProviderFilters | undefined): SearchFilters {
  const facets: FacetClause[][] = []
  const numeric: NumericClause[][] = []
  if (!refinements || typeof refinements !== 'object') return { facets, numeric }

  for (const source of [refinements.facetsRefinements, refinements.disjunctiveFacetsRefinements]) {
    for (const [attribute, values] of Object.entries(source || {})) {
      if (!Array.isArray(values)) continue
      const group = values
        .map((value) => String(value))
        .filter((value) => value && value.length <= MAX_VALUE_LENGTH)
        .map((value) => ({ attribute, value, negate: false }))
      if (group.length) facets.push(group)
    }
  }
  for (const [attribute, operators] of Object.entries(refinements.numericRefinements || {})) {
    for (const [operator, values] of Object.entries(operators || {})) {
      if (!OPERATORS.includes(operator as NumericOperator) || !Array.isArray(values)) continue
      for (const value of values) {
        const number = Number(value)
        if (Number.isFinite(number)) numeric.push([{ attribute, operator: operator as NumericOperator, value: number }])
      }
    }
  }
  return { facets: facets.slice(0, MAX_CLAUSES), numeric: numeric.slice(0, MAX_CLAUSES) }
}

/** Every filter given in a request body, whichever shape it came in. */
export function filtersFromBody(body: Record<string, any>): SearchFilters {
  const algolia = parseAlgoliaFilters(body.algoliaFilters)
  const legacy = filtersFromRefinements(body.instantsearchFilters || body.filters)
  return {
    facets: [...algolia.facets, ...legacy.facets],
    numeric: [...algolia.numeric, ...legacy.numeric],
  }
}

/** The same filters without any on `attribute` (facet counts for a
 *  disjunctive facet ignore its own selection). */
export function withoutAttribute(filters: SearchFilters, attribute: string): SearchFilters {
  return {
    facets: filters.facets.map((group) => group.filter((clause) => clause.attribute !== attribute)).filter((group) => group.length),
    numeric: filters.numeric,
  }
}

function compare(left: number, operator: NumericOperator, right: number): boolean {
  switch (operator) {
    case '<': return left < right
    case '<=': return left <= right
    case '>': return left > right
    case '>=': return left >= right
    case '=': return left === right
    case '!=': return left !== right
  }
}

/** Whether a hit passes; `facetValues` gives a hit's values for an
 *  attribute, `numberValue` its number (null when it has none). */
export function matchesFilters(
  filters: SearchFilters,
  facetValues: (attribute: string) => string[],
  numberValue: (attribute: string) => number | null,
): boolean {
  for (const group of filters.facets) {
    const ok = group.some((clause) => {
      const values = facetValues(clause.attribute).map((value) => value.toLowerCase())
      const has = values.includes(clause.value.toLowerCase())
      return clause.negate ? !has : has
    })
    if (!ok) return false
  }
  for (const group of filters.numeric) {
    const ok = group.some((clause) => {
      const value = numberValue(clause.attribute)
      return value !== null && compare(value, clause.operator, clause.value)
    })
    if (!ok) return false
  }
  return true
}
