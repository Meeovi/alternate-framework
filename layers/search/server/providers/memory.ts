// server/providers/memory.ts
//
// Zero-dependency, in-process search provider. Useful as a zero-infra
// fallback for local dev, tests, and small catalogs that don't warrant
// standing up OpenSearch/Postgres/a hosted search service. Has no
// "connection" to speak of — data is seeded at runtime via
// seedMemoryIndex()/addMemoryDocuments(), typically from a Nitro plugin
// that loads a JSON file or pulls a small catalog from the CMS once at
// boot. Disabled by default (there's no natural "presence of connection
// config" signal to key off, unlike every other provider here) — opt in
// explicitly with ALTERNATE_SEARCH_MEMORY_ENABLED=true.
import { useRuntimeConfig } from '#imports'
import type { FacetBucket, NumericOperator, ProviderSearchResult, SearchProvider, SearchProviderOptions } from './types'

type MemoryConfig = {
  enabled: boolean
  idField: string
  searchFields: string[]
}

function getConfig(): MemoryConfig {
  const config = useRuntimeConfig()
  return (config.searchProviders as { memory: MemoryConfig }).memory
}

let documents: Array<Record<string, unknown>> = []

/** Replaces the entire in-memory index. */
export function seedMemoryIndex(docs: Array<Record<string, unknown>>): void {
  documents = [...docs]
}

/** Adds to (or upserts into, by idField) the in-memory index without
 *  clearing what's already there. */
export function addMemoryDocuments(docs: Array<Record<string, unknown>>, idField = 'id'): void {
  const byId = new Map(documents.map((doc) => [doc[idField], doc]))
  for (const doc of docs) byId.set(doc[idField], doc)
  documents = Array.from(byId.values())
}

export function clearMemoryIndex(): void {
  documents = []
}

function matchesQuery(doc: Record<string, unknown>, query: string, fields: string[]): boolean {
  if (!query) return true
  const needle = query.toLowerCase()
  return fields.some((field) => String(doc[field] ?? '').toLowerCase().includes(needle))
}

function scoreDoc(doc: Record<string, unknown>, query: string, fields: string[]): number {
  if (!query) return 1
  const needle = query.toLowerCase()
  const terms = needle.split(/\s+/).filter(Boolean)
  let score = 0
  for (const field of fields) {
    const value = String(doc[field] ?? '').toLowerCase()
    if (!value) continue
    if (value === needle) score += 10
    else if (value.startsWith(needle)) score += 5
    else if (value.includes(needle)) score += 2
    for (const term of terms) {
      if (value.includes(term)) score += 1
    }
  }
  return score
}

function matchesFilters(doc: Record<string, unknown>, filters: SearchProviderOptions['filters']): boolean {
  if (!filters) return true

  const allRefinements = {
    ...(filters.facetsRefinements || {}),
    ...(filters.disjunctiveFacetsRefinements || {}),
  }
  for (const [field, values] of Object.entries(allRefinements)) {
    if (!Array.isArray(values) || !values.length) continue
    if (!values.includes(String(doc[field] ?? ''))) return false
  }

  for (const [field, operators] of Object.entries(filters.numericRefinements || {})) {
    if (!operators) continue
    const docValue = Number(doc[field])
    if (!Number.isFinite(docValue)) return false

    for (const [operator, values] of Object.entries(operators) as [NumericOperator, Array<number | string>][]) {
      if (!Array.isArray(values) || !values.length) continue
      const numericValues = values.map(Number).filter((value) => Number.isFinite(value))
      if (!numericValues.length) continue

      const passes = numericValues.some((value) => {
        switch (operator) {
          case '=': return docValue === value
          case '!=': return docValue !== value
          case '<': return docValue < value
          case '<=': return docValue <= value
          case '>': return docValue > value
          case '>=': return docValue >= value
          default: return true
        }
      })
      if (!passes) return false
    }
  }

  return true
}

function buildFacets(matched: Array<Record<string, unknown>>, facetFields: string[]): Record<string, FacetBucket[]> {
  const facets: Record<string, FacetBucket[]> = {}
  for (const field of facetFields) {
    const counts = new Map<string, number>()
    for (const doc of matched) {
      const value = doc[field]
      if (value == null) continue
      const key = String(value)
      counts.set(key, (counts.get(key) || 0) + 1)
    }
    if (counts.size) {
      facets[field] = Array.from(counts.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
    }
  }
  return facets
}

export const memoryProvider: SearchProvider = {
  id: 'memory',

  isEnabled() {
    return Boolean(getConfig()?.enabled)
  },

  async search(options: SearchProviderOptions): Promise<ProviderSearchResult> {
    const start = Date.now()
    const config = getConfig()
    const searchFields = options.fields?.length ? options.fields : config.searchFields

    let matched = documents.filter(
      (doc) => matchesQuery(doc, options.query, searchFields) && matchesFilters(doc, options.filters),
    )

    if (options.sort) {
      const { field, direction } = options.sort
      matched = [...matched].sort((a, b) => {
        const aValue = a[field]
        const bValue = b[field]
        const aNum = Number(aValue)
        const bNum = Number(bValue)
        const comparison = Number.isFinite(aNum) && Number.isFinite(bNum)
          ? aNum - bNum
          : String(aValue ?? '').localeCompare(String(bValue ?? ''))
        return direction === 'asc' ? comparison : -comparison
      })
    } else {
      matched = [...matched].sort(
        (a, b) => scoreDoc(b, options.query, searchFields) - scoreDoc(a, options.query, searchFields),
      )
    }

    const pageSize = Math.max(1, options.pageSize)
    const offset = (Math.max(1, options.page) - 1) * pageSize
    const page = matched.slice(offset, offset + pageSize)

    return {
      provider: this.id,
      items: page.map((doc) => ({
        id: String(doc[config.idField] ?? ''),
        score: scoreDoc(doc, options.query, searchFields),
        source: doc,
      })),
      total: matched.length,
      facets: options.facets?.length ? buildFacets(matched, options.facets) : {},
      tookMs: Date.now() - start,
    }
  },

  async searchFacetValues(field: string, facetQuery: string, options: SearchProviderOptions): Promise<FacetBucket[]> {
    const config = getConfig()
    const searchFields = options.fields?.length ? options.fields : config.searchFields

    const matched = documents.filter(
      (doc) => matchesQuery(doc, options.query, searchFields) && matchesFilters(doc, options.filters),
    )

    const buckets = buildFacets(matched, [field])[field] || []
    const trimmedQuery = facetQuery.trim().toLowerCase()
    const filtered = trimmedQuery
      ? buckets.filter((bucket) => bucket.value.toLowerCase().includes(trimmedQuery))
      : buckets

    return filtered.slice(0, 10)
  },
}
