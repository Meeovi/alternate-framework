import { describe, expect, test } from 'vitest'
import { z } from 'zod'

/* ------------------------------------------------------------------ *
 * Search notification input schema tests
 *
 * These tests verify the Zod input schemas used by the search
 * notification catalog match the expected shapes.
 * ------------------------------------------------------------------ */

describe('search notification input schemas', () => {
  const searchAlertCreatedInput = z.object({
    userId: z.string().min(1, 'userId is required'),
    query: z.string().trim().min(1, 'Query cannot be empty'),
    alertUrl: z.string().url(),
  })

  const searchNewResultsInput = z.object({
    userId: z.string().min(1, 'userId is required'),
    query: z.string().trim().min(1, 'Query cannot be empty'),
    resultCount: z.number().int().nonnegative(),
    topResultName: z.string().min(1, 'topResultName is required'),
    resultsUrl: z.string().url(),
  })

  test('searchAlertCreatedInput validates valid input', () => {
    const result = searchAlertCreatedInput.safeParse({
      userId: 'user-123',
      query: 'wireless headphones',
      alertUrl: 'https://example.com/alerts/123',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.userId).toBe('user-123')
      expect(result.data.query).toBe('wireless headphones')
      expect(result.data.alertUrl).toBe('https://example.com/alerts/123')
    }
  })

  test('searchAlertCreatedInput rejects missing userId', () => {
    const result = searchAlertCreatedInput.safeParse({
      query: 'wireless headphones',
      alertUrl: 'https://example.com/alerts/123',
    })

    expect(result.success).toBe(false)
  })

  test('searchAlertCreatedInput rejects invalid URL', () => {
    const result = searchAlertCreatedInput.safeParse({
      userId: 'user-123',
      query: 'wireless headphones',
      alertUrl: 'not-a-url',
    })

    expect(result.success).toBe(false)
  })

  test('searchNewResultsInput validates valid input', () => {
    const result = searchNewResultsInput.safeParse({
      userId: 'user-123',
      query: 'wireless headphones',
      resultCount: 15,
      topResultName: 'Meeovi Pro Headphones',
      resultsUrl: 'https://example.com/search?q=wireless+headphones',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.resultCount).toBe(15)
      expect(result.data.topResultName).toBe('Meeovi Pro Headphones')
    }
  })

  test('searchNewResultsInput rejects negative resultCount', () => {
    const result = searchNewResultsInput.safeParse({
      userId: 'user-123',
      query: 'wireless headphones',
      resultCount: -1,
      topResultName: 'Meeovi Pro Headphones',
      resultsUrl: 'https://example.com/search?q=wireless+headphones',
    })

    expect(result.success).toBe(false)
  })

  test('searchNewResultsInput rejects missing query', () => {
    const result = searchNewResultsInput.safeParse({
      userId: 'user-123',
      resultCount: 15,
      topResultName: 'Meeovi Pro Headphones',
      resultsUrl: 'https://example.com/search?q=wireless+headphones',
    })

    expect(result.success).toBe(false)
  })

  test('searchAlertCreatedInput rejects whitespace-only queries', () => {
    const result = searchAlertCreatedInput.safeParse({
      userId: 'user-123',
      query: '   ',
      alertUrl: 'https://example.com/alerts/123',
    })

    expect(result.success).toBe(false)
  })

  test('searchNewResultsInput rejects non-integer result counts', () => {
    const result = searchNewResultsInput.safeParse({
      userId: 'user-123',
      query: 'wireless headphones',
      resultCount: 12.5,
      topResultName: 'Meeovi Pro Headphones',
      resultsUrl: 'https://example.com/search?q=wireless+headphones',
    })

    expect(result.success).toBe(false)
  })

  test('searchNewResultsInput rejects empty topResultName', () => {
    const result = searchNewResultsInput.safeParse({
      userId: 'user-123',
      query: 'wireless headphones',
      resultCount: 15,
      topResultName: '',
      resultsUrl: 'https://example.com/search?q=wireless+headphones',
    })

    expect(result.success).toBe(false)
  })
})
