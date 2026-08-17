import { describe, it, expect, vi, beforeEach } from 'vitest'

const { enabled } = vi.hoisted(() => ({ enabled: { value: true } }))

vi.mock('#imports', () => ({
  useRuntimeConfig: () => ({
    searchProviders: {
      memory: {
        get enabled() { return enabled.value },
        idField: 'id',
        searchFields: ['title', 'description'],
      },
    },
  }),
}))

import { memoryProvider, seedMemoryIndex, addMemoryDocuments, clearMemoryIndex } from '../../server/providers/memory'

const baseOptions = { query: '', page: 1, pageSize: 10 }

describe('memoryProvider', () => {
  beforeEach(() => {
    enabled.value = true
    clearMemoryIndex()
  })

  it('isEnabled reflects config.enabled', () => {
    expect(memoryProvider.isEnabled()).toBe(true)
    enabled.value = false
    expect(memoryProvider.isEnabled()).toBe(false)
  })

  it('matches documents by substring across the configured search fields', async () => {
    seedMemoryIndex([
      { id: '1', title: 'Blue Shirt', description: 'A comfortable cotton shirt' },
      { id: '2', title: 'Red Hat', description: 'A stylish hat' },
    ])

    const result = await memoryProvider.search({ ...baseOptions, query: 'shirt' })

    expect(result.items).toHaveLength(1)
    expect(result.items[0].id).toBe('1')
  })

  it('ranks exact and prefix matches above plain substring matches', async () => {
    seedMemoryIndex([
      { id: '1', title: 'A Blue Shirt For Everyone', description: '' },
      { id: '2', title: 'shirt', description: '' },
      { id: '3', title: 'shirts and more', description: '' },
    ])

    const result = await memoryProvider.search({ ...baseOptions, query: 'shirt' })

    expect(result.items.map((item) => item.id)).toEqual(['2', '3', '1'])
  })

  it('returns everything, unranked-filter-wise, when the query is empty', async () => {
    seedMemoryIndex([{ id: '1', title: 'A' }, { id: '2', title: 'B' }])
    const result = await memoryProvider.search({ ...baseOptions, query: '' })
    expect(result.total).toBe(2)
  })

  it('applies facetsRefinements/disjunctiveFacetsRefinements as an AND-across-fields, OR-within-field filter', async () => {
    seedMemoryIndex([
      { id: '1', title: 'shirt', color: 'blue', size: 'M' },
      { id: '2', title: 'shirt', color: 'red', size: 'M' },
      { id: '3', title: 'shirt', color: 'blue', size: 'L' },
    ])

    const result = await memoryProvider.search({
      ...baseOptions,
      query: 'shirt',
      filters: { facetsRefinements: { color: ['blue'], size: ['M'] } },
    })

    expect(result.items.map((item) => item.id)).toEqual(['1'])
  })

  it('applies numericRefinements operators', async () => {
    seedMemoryIndex([
      { id: '1', title: 'shirt', price: 10 },
      { id: '2', title: 'shirt', price: 20 },
      { id: '3', title: 'shirt', price: 30 },
    ])

    const result = await memoryProvider.search({
      ...baseOptions,
      query: 'shirt',
      filters: { numericRefinements: { price: { '>=': [15], '<=': [25] } } },
    })

    expect(result.items.map((item) => item.id)).toEqual(['2'])
  })

  it('honors an explicit sort over relevance ranking', async () => {
    seedMemoryIndex([
      { id: '1', title: 'shirt', price: 30 },
      { id: '2', title: 'shirt', price: 10 },
      { id: '3', title: 'shirt', price: 20 },
    ])

    const result = await memoryProvider.search({
      ...baseOptions,
      query: 'shirt',
      sort: { field: 'price', direction: 'asc' },
    })

    expect(result.items.map((item) => item.id)).toEqual(['2', '3', '1'])
  })

  it('paginates using page/pageSize', async () => {
    seedMemoryIndex(Array.from({ length: 5 }, (_, i) => ({ id: String(i), title: 'shirt' })))

    const result = await memoryProvider.search({ ...baseOptions, query: 'shirt', page: 2, pageSize: 2 })

    expect(result.items).toHaveLength(2)
    expect(result.total).toBe(5)
  })

  it('builds facet buckets only for requested fields', async () => {
    seedMemoryIndex([
      { id: '1', title: 'shirt', color: 'blue' },
      { id: '2', title: 'shirt', color: 'blue' },
      { id: '3', title: 'shirt', color: 'red' },
    ])

    const result = await memoryProvider.search({ ...baseOptions, query: 'shirt', facets: ['color'] })

    expect(result.facets).toEqual({
      color: [{ value: 'blue', count: 2 }, { value: 'red', count: 1 }],
    })
  })

  it('addMemoryDocuments upserts by idField without clearing the existing index', async () => {
    seedMemoryIndex([{ id: '1', title: 'shirt' }])
    addMemoryDocuments([{ id: '1', title: 'updated shirt' }, { id: '2', title: 'hat' }])

    const result = await memoryProvider.search({ ...baseOptions, query: '' })

    expect(result.total).toBe(2)
    expect(result.items.find((item) => item.id === '1')?.source.title).toBe('updated shirt')
  })

  it('searchFacetValues narrows buckets to those matching facetQuery', async () => {
    seedMemoryIndex([
      { id: '1', title: 'shirt', color: 'red' },
      { id: '2', title: 'shirt', color: 'burgundy' },
      { id: '3', title: 'shirt', color: 'blue' },
    ])

    const buckets = await memoryProvider.searchFacetValues!('color', 'r', { ...baseOptions, query: 'shirt' })

    expect(buckets.map((bucket) => bucket.value).sort()).toEqual(['burgundy', 'red'])
  })
})
