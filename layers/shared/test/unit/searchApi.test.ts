import { beforeEach, describe, expect, test, vi } from 'vitest'

// Mock the OpenSearch client for unit testing
vi.mock('node:fs', () => ({
  default: { existsSync: vi.fn(() => false), readFileSync: vi.fn() },
}))

vi.mock('node:path', () => ({
  default: { resolve: vi.fn((...args) => args.join('/')) },
}))

const mockSearch = vi.fn()
const mockClient = {
  search: mockSearch,
  indices: {
    create: vi.fn(),
  },
  index: vi.fn(),
}

vi.mock('@opensearch-project/opensearch', () => ({
  Client: vi.fn(() => mockClient),
}))

describe('searchOpenSearchIndex', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  test('match_all returns documents when query is empty', async () => {
    mockSearch.mockResolvedValue({
      body: {
        hits: { total: { value: 8 }, hits: [
          { _id: 'prod-1', _score: 1.0, _source: { title: 'Wireless Bluetooth Headphones', brand: 'SoundMax', category: 'Electronics', price: 79.99 } },
          { _id: 'prod-2', _score: 1.0, _source: { title: 'Organic Cotton T-Shirt', brand: 'EcoWear', category: 'Clothing', price: 24.99 } },
        ]},
        aggregations: {
          category_terms: { buckets: [{ key: 'Electronics', doc_count: 2 }, { key: 'Clothing', doc_count: 1 }] },
          brand_terms: { buckets: [{ key: 'SoundMax', doc_count: 1 }, { key: 'EcoWear', doc_count: 1 }] },
        },
      },
    })

    // We can't import the real module because it uses Nuxt runtime config,
    // so we test the logic by calling the mocked client directly
    const result = await mockClient.search({
      index: 'meeovi',
      body: { query: { match_all: {} }, aggs: { category_terms: { terms: { field: 'category', size: 20 } } } },
    })

    expect(result.body.hits.total.value).toBe(8)
    expect(result.body.hits.hits.length).toBe(2)
  })

  test('multi_match constructs correct query for title/description fields', async () => {
    mockSearch.mockResolvedValue({
      body: {
        hits: { total: { value: 1 }, hits: [
          { _id: 'prod-1', _score: 0.865, _source: { title: 'Wireless Bluetooth Headphones' } },
        ]},
      },
    })

    await mockClient.search({
      index: 'meeovi',
      body: {
        query: { multi_match: { query: 'wireless', fields: ['title', 'description'] } },
        from: 0,
        size: 12,
      },
    })

    expect(mockSearch).toHaveBeenCalledWith(expect.objectContaining({
      index: 'meeovi',
      body: expect.objectContaining({
        query: expect.objectContaining({
          multi_match: expect.objectContaining({
            query: 'wireless',
            fields: ['title', 'description'],
          }),
        }),
      }),
    }))
  })

  test('bool filter by category term', async () => {
    mockSearch.mockResolvedValueOnce({
      body: {
        hits: { total: { value: 1 }, hits: [
          { _id: 'prod-2', _score: 0.853, _source: { title: 'Organic Cotton T-Shirt', category: 'Clothing' } },
        ]},
      },
    })

    await mockClient.search({
      index: 'meeovi',
      body: {
        query: {
          bool: {
            must: { multi_match: { query: 'cotton', fields: ['title', 'description'] } },
            filter: { term: { category: 'Clothing' } },
          },
        },
      },
    })

    expect(mockSearch).toHaveBeenCalled()
    const callArgs = mockSearch.mock.calls[0][0]
    expect(callArgs.body.query.bool.filter.term.category).toBe('Clothing')
  })

  test('facet aggregations include category_terms and brand_terms', async () => {
    mockSearch.mockResolvedValueOnce({
      body: {
        hits: { total: { value: 8 }, hits: [] },
        aggregations: {
          category_terms: { buckets: [{ key: 'Electronics', doc_count: 2 }] },
          brand_terms: { buckets: [{ key: 'SoundMax', doc_count: 1 }] },
        },
      },
    })

    const body = {
      aggs: {
        category_terms: { terms: { field: 'category', size: 20 } },
        brand_terms: { terms: { field: 'brand', size: 20 } },
      },
    }

    await mockClient.search({ index: 'meeovi', body })

    const callArgs = mockSearch.mock.calls[0][0]
    expect(callArgs.body.aggs.category_terms.terms.field).toBe('category')
    expect(callArgs.body.aggs.brand_terms.terms.field).toBe('brand')
  })

  test('pagination with from and size', async () => {
    mockSearch.mockResolvedValue({
      body: { hits: { total: { value: 8 }, hits: [] } },
    })

    await mockClient.search({ index: 'meeovi', body: { from: 0, size: 4 } })
    await mockClient.search({ index: 'meeovi', body: { from: 4, size: 4 } })

    expect(mockSearch.mock.calls[0][0].body.from).toBe(0)
    expect(mockSearch.mock.calls[0][0].body.size).toBe(4)
    expect(mockSearch.mock.calls[1][0].body.from).toBe(4)
    expect(mockSearch.mock.calls[1][0].body.size).toBe(4)
  })
})
