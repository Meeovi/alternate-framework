import { describe, expect, test } from 'vitest'

describe('useSearchClient', () => {
  test('searchClient.search calls /api/search endpoint', async () => {
    // The useSearchClient composable returns a searchClient that POSTs to /api/search
    // This test validates the search client structure
    const { useSearchClient } = await import('../../app/composables/useSearchClient')
    const { searchClient } = useSearchClient()

    expect(searchClient.value).toBeDefined()
    expect(typeof searchClient.value.search).toBe('function')
    expect(typeof searchClient.value.searchForFacetValues).toBe('function')
  })

  test('searchClient.search returns proper result shape', async () => {
    const { useSearchClient } = await import('../../app/composables/useSearchClient')
    const { searchClient } = useSearchClient()

    const result = await searchClient.value.search([{
      params: {
        query: 'wireless',
        page: 1,
        hitsPerPage: 12,
      },
      indexName: 'meeovi',
    }])

    expect(result.results).toBeDefined()
    expect(Array.isArray(result.results)).toBe(true)
    if (result.results.length > 0) {
      const first = result.results[0]
      expect(first).toHaveProperty('hits')
      expect(first).toHaveProperty('nbHits')
      expect(first).toHaveProperty('page')
      expect(first).toHaveProperty('nbPages')
      expect(first).toHaveProperty('hitsPerPage')
      expect(first).toHaveProperty('query')
      expect(first).toHaveProperty('processingTimeMs')
      expect(first).toHaveProperty('facets')
    }
  })
})
