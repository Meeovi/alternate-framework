import { describe, expect, test } from 'vitest'

describe('useSearchNotifications', () => {
  test('composable is defined and returns alertCreated and newResults methods', async () => {
    const { useSearchNotifications } = await import('../../app/composables/notifications/useSearchNotifications')
    const composable = useSearchNotifications()

    expect(composable).toBeDefined()
    expect(typeof composable.alertCreated).toBe('function')
    expect(typeof composable.newResults).toBe('function')
  })

  test('alertCreated method accepts correct input shape', async () => {
    const { useSearchNotifications } = await import('../../app/composables/notifications/useSearchNotifications')
    const composable = useSearchNotifications()

    const input = {
      userId: 'user-123',
      query: 'wireless headphones',
      alertUrl: 'https://example.com/alerts/123',
    }

    await expect(composable.alertCreated(input)).resolves.not.toThrow()
  })

  test('newResults method accepts correct input shape', async () => {
    const { useSearchNotifications } = await import('../../app/composables/notifications/useSearchNotifications')
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
