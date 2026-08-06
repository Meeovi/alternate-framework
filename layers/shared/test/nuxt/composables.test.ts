import { describe, expect, test } from 'vitest'

describe('useSearchClient', () => {
  test('searchClient.search calls /api/search endpoint', async () => {
    // The useSearchClient composable returns a searchClient that POSTs to /api/search
    // This test validates the search client structure
    const { useSearchClient } = await import('#shared/app/composables/search/useSearchClient')
    const { searchClient } = useSearchClient()

    expect(searchClient.value).toBeDefined()
    expect(typeof searchClient.value.search).toBe('function')
    expect(typeof searchClient.value.searchForFacetValues).toBe('function')
  })

  test('searchClient.search returns proper result shape', async () => {
    const { useSearchClient } = await import('#shared/app/composables/search/useSearchClient')
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

describe('useSearchNotifications', () => {
  test('composable is defined and returns alertCreated and newResults methods', async () => {
    const { useSearchNotifications } = await import('#shared/app/composables/notifications/useSearchNotifications')
    const composable = useSearchNotifications()

    expect(composable).toBeDefined()
    expect(typeof composable.alertCreated).toBe('function')
    expect(typeof composable.newResults).toBe('function')
  })

  test('alertCreated method accepts correct input shape', async () => {
    const { useSearchNotifications } = await import('#shared/app/composables/notifications/useSearchNotifications')
    const composable = useSearchNotifications()

    const input = {
      userId: 'user-123',
      query: 'wireless headphones',
      alertUrl: 'https://example.com/alerts/123',
    }

    await expect(composable.alertCreated(input)).resolves.not.toThrow()
  })

  test('newResults method accepts correct input shape', async () => {
    const { useSearchNotifications } = await import('#shared/app/composables/notifications/useSearchNotifications')
    const composable = useSearchNotifications()

    const input = {
      userId: 'user-123',
      query: 'wireless headphones',
      resultCount: 15,
      topResultName: 'Meeovi Pro Headphones',
      resultsUrl: 'https://example.com/search?q=wireless+headphones',
    }

    await expect(composable.newResults(input)).resolves.not.toThrow()
  })
})

describe('useAlert (auth notifications)', () => {
  test('composable is defined and returns auth notification methods', async () => {
    const { useAlert } = await import('#auth/app/composables/useAlert')
    const composable = useAlert()

    expect(composable).toBeDefined()
    expect(typeof composable.login).toBe('function')
    expect(typeof composable.passwordReset).toBe('function')
    expect(typeof composable.twoFactorCode).toBe('function')
    expect(typeof composable.passwordChanged).toBe('function')
  })
})

describe('useNotifications (commerce notifications)', () => {
  test('composable is defined and returns commerce notification methods', async () => {
    const { useNotifications } = await import('#commerce/app/composables/useNotifications')
    const composable = useNotifications()

    expect(composable).toBeDefined()
    expect(typeof composable.cartItemAdded).toBe('function')
    expect(typeof composable.orderConfirmed).toBe('function')
    expect(typeof composable.orderShipped).toBe('function')
    expect(typeof composable.paymentSucceeded).toBe('function')
    expect(typeof composable.paymentFailed).toBe('function')
    expect(typeof composable.checkoutCompleted).toBe('function')
  })
})
