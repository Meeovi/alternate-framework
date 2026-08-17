import { describe, it, expect, vi, beforeEach } from 'vitest'

const { search, searchForFacetValues } = vi.hoisted(() => ({
  search: vi.fn(),
  searchForFacetValues: vi.fn(),
}))

vi.mock('#imports', () => ({
  useRuntimeConfig: () => ({
    searchProviders: {
      meilisearch: { enabled: true, host: 'http://localhost:7700', apiKey: 'key', indexUid: 'products', idField: 'id' },
    },
  }),
}))
vi.mock('meilisearch', () => ({
  Meilisearch: class {
    index() {
      return { search, searchForFacetValues }
    }
  },
}))

import { meilisearchProvider } from '../../server/providers/meilisearch'

const baseOptions = { query: 'shirt', page: 1, pageSize: 10 }

describe('meilisearchProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    search.mockResolvedValue({ hits: [], totalHits: 0, processingTimeMs: 2 })
  })

  it('isEnabled requires config.enabled plus a host', () => {
    expect(meilisearchProvider.isEnabled()).toBe(true)
  })

  it('passes page/hitsPerPage through as given (Meilisearch pagination is already 1-indexed)', async () => {
    await meilisearchProvider.search({ ...baseOptions, page: 3, pageSize: 5 })

    expect(search).toHaveBeenCalledWith('shirt', expect.objectContaining({ page: 3, hitsPerPage: 5 }))
  })

  it('builds a filter expression as OR-within-field arrays, ANDed with numeric range clauses', async () => {
    await meilisearchProvider.search({
      ...baseOptions,
      filters: {
        facetsRefinements: { color: ['red', 'blue'] },
        numericRefinements: { price: { '>=': [10] } },
      },
    })

    const call = search.mock.calls[0][1]
    expect(call.filter).toEqual(
      expect.arrayContaining([['color = "red"', 'color = "blue"'], 'price >= 10']),
    )
  })

  it('passes an explicit sort as "field:direction"', async () => {
    await meilisearchProvider.search({ ...baseOptions, sort: { field: 'price', direction: 'desc' } })

    expect(search).toHaveBeenCalledWith('shirt', expect.objectContaining({ sort: ['price:desc'] }))
  })

  it('normalizes hits using the configured idField, with a rank-based score', async () => {
    search.mockResolvedValue({
      hits: [{ id: 'p1', name: 'Shirt' }, { id: 'p2', name: 'Hat' }],
      totalHits: 2,
      processingTimeMs: 5,
    })

    const result = await meilisearchProvider.search(baseOptions)

    expect(result.items).toEqual([
      { id: 'p1', score: 2, source: { id: 'p1', name: 'Shirt' } },
      { id: 'p2', score: 1, source: { id: 'p2', name: 'Hat' } },
    ])
    expect(result.total).toBe(2)
    expect(result.tookMs).toBe(5)
  })

  it('falls back to estimatedTotalHits when totalHits is absent (infinite pagination mode)', async () => {
    search.mockResolvedValue({ hits: [{ id: 'p1' }], estimatedTotalHits: 42, processingTimeMs: 1 })

    const result = await meilisearchProvider.search(baseOptions)

    expect(result.total).toBe(42)
  })

  it('normalizes facetDistribution into FacetBucket[] per field', async () => {
    search.mockResolvedValue({
      hits: [],
      totalHits: 0,
      processingTimeMs: 1,
      facetDistribution: { color: { red: 3, blue: 1 } },
    })

    const result = await meilisearchProvider.search({ ...baseOptions, facets: ['color'] })

    expect(result.facets).toEqual({ color: [{ value: 'red', count: 3 }, { value: 'blue', count: 1 }] })
  })

  it('searchFacetValues maps facetHits into sorted FacetBucket[]', async () => {
    searchForFacetValues.mockResolvedValue({
      facetHits: [{ value: 'blue', count: 1 }, { value: 'red', count: 3 }],
      facetQuery: 're',
      processingTimeMs: 1,
    })

    const buckets = await meilisearchProvider.searchFacetValues!('color', 're', baseOptions)

    expect(buckets).toEqual([{ value: 'red', count: 3 }, { value: 'blue', count: 1 }])
    expect(searchForFacetValues).toHaveBeenCalledWith(
      expect.objectContaining({ facetName: 'color', facetQuery: 're', q: 'shirt' }),
    )
  })
})
