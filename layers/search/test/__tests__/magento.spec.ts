import { describe, it, expect, vi, beforeEach } from 'vitest'

const { searchMock } = vi.hoisted(() => ({ searchMock: vi.fn() }))

vi.mock('#imports', () => ({
  useRuntimeConfig: () => ({
    searchProviders: { magento: { enabled: true, endpoint: 'https://example.com/graphql', token: '' } },
  }),
}))
vi.mock('adapter-magento', () => ({
  MagentoAdapter: class {
    content = { search: searchMock }
  },
}))

import { buildFilter, buildSort, aggregationsToFacets, magentoProvider } from '../../server/providers/magento'

describe('buildFilter', () => {
  it('maps facetsRefinements to Magento\'s FilterEqualTypeInput "in" shape', () => {
    expect(buildFilter({ facetsRefinements: { color: ['red', 'blue'] } })).toEqual({
      color: { in: ['red', 'blue'] },
    })
  })

  it('merges facetsRefinements and disjunctiveFacetsRefinements into the same filter object', () => {
    expect(
      buildFilter({
        facetsRefinements: { color: ['red'] },
        disjunctiveFacetsRefinements: { brand: ['acme'] },
      }),
    ).toEqual({ color: { in: ['red'] }, brand: { in: ['acme'] } })
  })

  it('skips a refinement field with an empty value array', () => {
    expect(buildFilter({ facetsRefinements: { color: [] } })).toEqual({})
  })

  it('maps >= / > numeric operators onto FilterRangeTypeInput\'s "from"', () => {
    expect(buildFilter({ numericRefinements: { price: { '>=': [10] } } })).toEqual({
      price: { from: '10' },
    })
  })

  it('maps <= / < numeric operators onto FilterRangeTypeInput\'s "to"', () => {
    expect(buildFilter({ numericRefinements: { price: { '<=': [100] } } })).toEqual({
      price: { to: '100' },
    })
  })

  it('combines a from and to on the same field into one range object', () => {
    expect(buildFilter({ numericRefinements: { price: { '>=': [10], '<=': [100] } } })).toEqual({
      price: { from: '10', to: '100' },
    })
  })

  it('skips = and != operators — no native FilterRangeTypeInput equivalent', () => {
    expect(buildFilter({ numericRefinements: { price: { '=': [50], '!=': [0] } } })).toEqual({})
  })

  it('returns an empty object when filters is undefined', () => {
    expect(buildFilter(undefined)).toEqual({})
  })
})

describe('buildSort', () => {
  it('maps a supported Magento sort field to its GraphQL enum direction', () => {
    expect(buildSort({ field: 'price', direction: 'asc' })).toEqual({ price: 'ASC' })
    expect(buildSort({ field: 'name', direction: 'desc' })).toEqual({ name: 'DESC' })
  })

  it('returns undefined for a sort field Magento\'s schema has no sort input for', () => {
    expect(buildSort({ field: 'popularity', direction: 'asc' })).toBeUndefined()
  })

  it('returns undefined when no sort is given', () => {
    expect(buildSort(null)).toBeUndefined()
    expect(buildSort(undefined)).toBeUndefined()
  })
})

describe('aggregationsToFacets', () => {
  it('maps Magento aggregation buckets into the shared FacetBucket shape', () => {
    const aggregations = [
      { attribute_code: 'color', options: [{ value: 'red', count: 3 }, { value: 'blue', count: 1 }] },
    ]
    expect(aggregationsToFacets(aggregations, ['color'])).toEqual({
      color: [{ value: 'red', count: 3 }, { value: 'blue', count: 1 }],
    })
  })

  it('only includes attributes that were actually requested — Magento returns aggregations for every layered-nav attribute regardless', () => {
    const aggregations = [
      { attribute_code: 'color', options: [{ value: 'red', count: 3 }] },
      { attribute_code: 'brand', options: [{ value: 'acme', count: 2 }] },
    ]
    expect(aggregationsToFacets(aggregations, ['color'])).toEqual({
      color: [{ value: 'red', count: 3 }],
    })
  })

  it('skips options with a nullish value', () => {
    const aggregations = [{ attribute_code: 'color', options: [{ value: null as unknown as string, count: 1 }] }]
    expect(aggregationsToFacets(aggregations, ['color'])).toEqual({})
  })

  it('omits a requested field with no matching aggregation entirely', () => {
    expect(aggregationsToFacets([], ['color'])).toEqual({})
  })
})

// content.search's page/filter/sort/aggregations wiring — the real gaps this
// pass closed (previously: no pagination beyond page 1, no filters, no sort,
// no facets at all for the magento provider).
describe('magentoProvider.search / searchFacetValues', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    searchMock.mockResolvedValue({ items: [], total: 0, aggregations: [] })
  })

  it('forwards the requested page as Magento\'s 1-indexed currentPage', async () => {
    await magentoProvider.search({ query: 'shirt', page: 3, pageSize: 20 })

    expect(searchMock).toHaveBeenCalledWith('shirt', expect.objectContaining({ currentPage: 3 }))
  })

  it('only requests aggregations when facets were actually asked for', async () => {
    await magentoProvider.search({ query: 'shirt', page: 1, pageSize: 20 })
    expect(searchMock).toHaveBeenCalledWith('shirt', expect.objectContaining({ aggregations: false }))

    await magentoProvider.search({ query: 'shirt', page: 1, pageSize: 20, facets: ['color'] })
    expect(searchMock).toHaveBeenCalledWith('shirt', expect.objectContaining({ aggregations: true }))
  })

  it('searchFacetValues narrows the matching aggregation\'s options to those containing facetQuery', async () => {
    searchMock.mockResolvedValue({
      items: [],
      total: 0,
      aggregations: [
        { attribute_code: 'color', options: [{ value: 'red', count: 3 }, { value: 'burgundy', count: 1 }, { value: 'blue', count: 2 }] },
      ],
    })

    const buckets = await magentoProvider.searchFacetValues!('color', 'r', { query: '', page: 1, pageSize: 20 })

    expect(buckets).toEqual([{ value: 'red', count: 3 }, { value: 'burgundy', count: 1 }])
  })
})
