import { describe, it, expect } from 'vitest'
import { matchLanguages } from '../../app/utils/language'

describe('matchLanguages', () => {
  const languages = ['en-US', 'fr-FR', 'es-ES', 'ca-valencia']

  it('matches an exact locale', () => {
    expect(matchLanguages(languages, ['fr-FR'])).toBe('fr-FR')
  })

  it('falls back to a base-language prefix match when no exact match exists', () => {
    expect(matchLanguages(languages, ['en-GB'])).toBe('en-US')
  })

  it('handles the ca-valencia Edge browser special case', () => {
    expect(matchLanguages(languages, ['ca-Es-VALENCIA'])).toBe('ca-valencia')
  })

  it('returns null when nothing matches at all', () => {
    expect(matchLanguages(languages, ['de-DE'])).toBeNull()
  })

  it('respects accept-language preference order', () => {
    expect(matchLanguages(languages, ['de-DE', 'es-ES'])).toBe('es-ES')
  })
})
