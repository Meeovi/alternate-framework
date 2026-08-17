import { describe, it, expect, vi, beforeEach } from 'vitest'

const { search } = vi.hoisted(() => ({ search: vi.fn() }))

vi.mock('#imports', () => ({
  useRuntimeConfig: () => ({
    searchProviders: {
      typesense: {
        enabled: true,
        host: 'localhost',
        port: 8108,
        protocol: 'http',
        apiKey: 'key',
        collectionName: 'products',
        idField: 'id',
      },
    },
  }),
}))
vi.mock('typesense', () => ({
  default: {
    Client: class {
      collections() {
        return { documents: () => ({ search }) }
      }
    },
  },
}))

import { typesenseProvider } from '../../server/providers/typesense'

const baseOptions = { query: 'shirt', page: 1, pageSize: 10 }

describe('typesenseProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    search.mockResolvedValue({ hits: [], found: 0, search_time_ms: 2, request_params: {}, out_of: 0, page: 1 })
  })

  it('isEnabled requires config.enabled plus a host', () => {
    expect(typesenseProvider.isEnabled()).toBe(true)
  })

  it('defaults query_by to "*" when no fields are given, and passes page/per_page through as given', async () => {
    await typesenseProvider.search({ ...baseOptions, page: 2, pageSize: 5 })

    expect(search).toHaveBeenCalledWith(
      expect.objectContaining({ q: 'shirt', query_by: '*', page: 2, per_page: 5 }),
    )
  })

  it('honors explicit fields for query_by', async () => {
    await typesenseProvider.search({ ...baseOptions, fields: ['title', 'description'] })

    expect(search).toHaveBeenCalledWith(expect.objectContaining({ query_by: 'title,description' }))
  })

  it('builds filter_by as OR-within-field bracket lists, &&-joined across fields and numeric clauses', async () => {
    await typesenseProvider.search({
      ...baseOptions,
      filters: {
        facetsRefinements: { color: ['red', 'blue'] },
        numericRefinements: { price: { '>=': [10], '<=': [50] } },
      },
    })

    const call = search.mock.calls[0][0]
    expect(call.filter_by).toContain('color:[red,blue]')
    expect(call.filter_by).toContain('price:>=10')
    expect(call.filter_by).toContain('price:<=50')
    expect(call.filter_by.split(' && ')).toHaveLength(3)
  })

  it('passes an explicit sort as "field:direction"', async () => {
    await typesenseProvider.search({ ...baseOptions, sort: { field: 'price', direction: 'asc' } })

    expect(search).toHaveBeenCalledWith(expect.objectContaining({ sort_by: 'price:asc' }))
  })

  it('normalizes hits, reading the document from hit.document and score from text_match', async () => {
    search.mockResolvedValue({
      hits: [{ document: { id: 'p1', name: 'Shirt' }, text_match: 123 }],
      found: 1,
      search_time_ms: 3,
      request_params: {},
      out_of: 1,
      page: 1,
    })

    const result = await typesenseProvider.search(baseOptions)

    expect(result.items).toEqual([{ id: 'p1', score: 123, source: { id: 'p1', name: 'Shirt' } }])
    expect(result.total).toBe(1)
    expect(result.tookMs).toBe(3)
  })

  it('normalizes facet_counts into FacetBucket[] keyed by field_name', async () => {
    search.mockResolvedValue({
      hits: [],
      found: 0,
      search_time_ms: 1,
      request_params: {},
      out_of: 0,
      page: 1,
      facet_counts: [{
        field_name: 'color',
        counts: [{ value: 'red', count: 3, highlighted: 'red' }, { value: 'blue', count: 1, highlighted: 'blue' }],
        sampled: false,
        stats: {},
      }],
    })

    const result = await typesenseProvider.search({ ...baseOptions, facets: ['color'] })

    expect(result.facets).toEqual({ color: [{ value: 'red', count: 3 }, { value: 'blue', count: 1 }] })
  })

  it('searchFacetValues reads the matching facet_counts entry for the requested field', async () => {
    search.mockResolvedValue({
      hits: [],
      found: 0,
      search_time_ms: 1,
      request_params: {},
      out_of: 0,
      page: 1,
      facet_counts: [{
        field_name: 'color',
        counts: [{ value: 'red', count: 2, highlighted: 'red' }],
        sampled: false,
        stats: {},
      }],
    })

    const buckets = await typesenseProvider.searchFacetValues!('color', 're', baseOptions)

    expect(buckets).toEqual([{ value: 'red', count: 2 }])
    expect(search).toHaveBeenCalledWith(
      expect.objectContaining({ facet_by: 'color', facet_query: 'color:re' }),
    )
  })
})
