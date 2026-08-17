import { describe, it, expect, vi, beforeEach } from 'vitest'

const { searchSingleIndex, searchForFacetValues } = vi.hoisted(() => ({
  searchSingleIndex: vi.fn(),
  searchForFacetValues: vi.fn(),
}))

vi.mock('#imports', () => ({
  useRuntimeConfig: () => ({
    searchProviders: {
      algolia: { enabled: true, appId: 'app123', apiKey: 'key123', indexName: 'products' },
    },
  }),
}))
vi.mock('algoliasearch', () => ({
  algoliasearch: () => ({ searchSingleIndex, searchForFacetValues }),
}))

import { algoliaProvider } from '../../server/providers/algolia'

const baseOptions = { query: 'shirt', page: 1, pageSize: 10 }

describe('algoliaProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    searchSingleIndex.mockResolvedValue({ hits: [], nbHits: 0, processingTimeMS: 3 })
  })

  it('isEnabled requires config.enabled plus both appId and apiKey', () => {
    expect(algoliaProvider.isEnabled()).toBe(true)
  })

  it('converts the 1-indexed page to Algolia\'s 0-indexed page', async () => {
    await algoliaProvider.search({ ...baseOptions, page: 3 })

    expect(searchSingleIndex).toHaveBeenCalledWith(
      expect.objectContaining({ searchParams: expect.objectContaining({ page: 2 }) }),
    )
  })

  it('targets a "<index>_<field>_<direction>" replica index when a sort is requested', async () => {
    await algoliaProvider.search({ ...baseOptions, sort: { field: 'price', direction: 'asc' } })

    expect(searchSingleIndex).toHaveBeenCalledWith(
      expect.objectContaining({ indexName: 'products_price_asc' }),
    )
  })

  it('uses the plain configured index when no sort is requested', async () => {
    await algoliaProvider.search(baseOptions)

    expect(searchSingleIndex).toHaveBeenCalledWith(expect.objectContaining({ indexName: 'products' }))
  })

  it('builds facetFilters as OR-within-field arrays', async () => {
    await algoliaProvider.search({
      ...baseOptions,
      filters: { facetsRefinements: { color: ['red', 'blue'] }, disjunctiveFacetsRefinements: { size: ['M'] } },
    })

    const call = searchSingleIndex.mock.calls[0][0]
    expect(call.searchParams.facetFilters).toEqual(
      expect.arrayContaining([['color:red', 'color:blue'], ['size:M']]),
    )
  })

  it('builds numericFilters strings from numericRefinements', async () => {
    await algoliaProvider.search({
      ...baseOptions,
      filters: { numericRefinements: { price: { '>=': [10], '<=': [50] } } },
    })

    const call = searchSingleIndex.mock.calls[0][0]
    expect(call.searchParams.numericFilters).toEqual(expect.arrayContaining(['price>=10', 'price<=50']))
  })

  it('normalizes hits into NormalizedHit shape, using objectID as id', async () => {
    searchSingleIndex.mockResolvedValue({
      hits: [{ objectID: 'p1', name: 'Shirt' }],
      nbHits: 1,
      processingTimeMS: 4,
    })

    const result = await algoliaProvider.search(baseOptions)

    expect(result.items).toEqual([{ id: 'p1', score: 1, source: { name: 'Shirt' } }])
    expect(result.total).toBe(1)
    expect(result.tookMs).toBe(4)
  })

  it('normalizes the facets response into FacetBucket[] per field', async () => {
    searchSingleIndex.mockResolvedValue({
      hits: [],
      nbHits: 0,
      processingTimeMS: 1,
      facets: { color: { red: 3, blue: 1 } },
    })

    const result = await algoliaProvider.search({ ...baseOptions, facets: ['color'] })

    expect(result.facets).toEqual({ color: [{ value: 'red', count: 3 }, { value: 'blue', count: 1 }] })
  })

  it('searchFacetValues encodes query/facetFilters into a URL-encoded params string', async () => {
    searchForFacetValues.mockResolvedValue({ facetHits: [{ value: 'red', count: 2, highlighted: 'red' }] })

    const buckets = await algoliaProvider.searchFacetValues!('color', 're', {
      ...baseOptions,
      filters: { facetsRefinements: { size: ['M'] } },
    })

    expect(buckets).toEqual([{ value: 'red', count: 2 }])
    const call = searchForFacetValues.mock.calls[0][0]
    expect(call.facetName).toBe('color')
    expect(call.searchForFacetValuesRequest.facetQuery).toBe('re')
    const params = new URLSearchParams(call.searchForFacetValuesRequest.params)
    expect(params.get('query')).toBe('shirt')
    expect(JSON.parse(params.get('facetFilters')!)).toEqual([['size:M']])
  })
})
