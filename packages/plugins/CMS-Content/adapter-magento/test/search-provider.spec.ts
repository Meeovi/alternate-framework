import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { searchMock, runtimePublic } = vi.hoisted(() => ({ searchMock: vi.fn(), runtimePublic: {} as Record<string, unknown> }))

vi.mock('#imports', () => ({
  useRuntimeConfig: () => ({
    searchProviders: { magento: { enabled: true, endpoint: 'https://example.com/graphql' } },
    public: runtimePublic,
  }),
}))
vi.mock('@mframework/adapter-magento', () => ({
  MagentoAdapter: class {
    content = { search: searchMock }
  },
}))

import { buildFilter, buildSort, aggregationsToFacets, magentoProvider } from '../src/runtime/server/search-provider'

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

describe('magentoProvider through Directus (public.magento.via = directus)', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    Object.assign(runtimePublic, { magento: { via: 'directus' }, directus: { url: 'https://cms.test/' } })
    fetchMock.mockReset()
    searchMock.mockClear()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    for (const key of Object.keys(runtimePublic)) delete runtimePublic[key]
    vi.unstubAllGlobals()
  })

  const page = (items: unknown[], total = items.length, facets: unknown[] = []) =>
    ({ ok: true, json: async () => ({ data: { items, total, facets } }) })

  it('searches /commerce/search, never GraphQL, and keys hits as store products', async () => {
    fetchMock.mockResolvedValue(page([{ sku: 'HABIT', name: 'Habit Tracker', price: { final: 4.99 }, images: ['https://img/h.jpg'] }], 7,
      [{ code: 'brand', options: [{ value: 'acme', count: 3 }] }]))

    const result = await magentoProvider.search({ query: 'habit', page: 2, pageSize: 12, fields: [], facets: ['brand'], sort: { field: 'price', direction: 'desc' } })

    const url = new URL(fetchMock.mock.calls[0]![0])
    expect(url.origin + url.pathname).toBe('https://cms.test/commerce/search')
    expect(Object.fromEntries(url.searchParams)).toEqual({ q: 'habit', page: '2', limit: '12', sort: '-price', facets: '1' })
    expect(searchMock).not.toHaveBeenCalled()
    expect(result.total).toBe(7)
    expect(result.items[0]).toMatchObject({ id: 'HABIT', source: { id: 'magento:HABIT', sku: 'HABIT', price: 4.99, image: 'https://img/h.jpg' } })
    expect(result.facets).toEqual({ brand: [{ value: 'acme', count: 3 }] })
  })

  it('lists the catalogue for an empty query (/commerce/search needs one)', async () => {
    fetchMock.mockResolvedValue(page([]))

    await magentoProvider.search({ query: '', page: 1, pageSize: 24, fields: [], facets: [] })

    expect(new URL(fetchMock.mock.calls[0]![0]).pathname).toBe('/commerce/products')
  })

  it('fails the provider (not the whole search) when Directus errors', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 503 })

    await expect(magentoProvider.search({ query: 'x', page: 1, pageSize: 12, fields: [], facets: [] })).rejects.toThrow('503')
  })
})
