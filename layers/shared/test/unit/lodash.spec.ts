import { describe, it, expect } from 'vitest'
import { omit, get } from '../../app/utils/lodash'

describe('omit', () => {
  it('returns a new object without the given keys', () => {
    expect(omit({ a: 1, b: 2, c: 3 }, ['b'])).toEqual({ a: 1, c: 3 })
  })

  it('does not mutate the original object', () => {
    const original = { a: 1, b: 2 }
    omit(original, ['b'])
    expect(original).toEqual({ a: 1, b: 2 })
  })
})

describe('get', () => {
  it('reads a nested path given as a dot-separated string', () => {
    expect(get({ a: { b: { c: 42 } } }, 'a.b.c')).toBe(42)
  })

  it('reads a nested path given as an array', () => {
    expect(get({ a: { b: 42 } }, ['a', 'b'])).toBe(42)
  })

  it('resolves numeric path segments as array indices', () => {
    expect(get({ a: [10, 20, 30] }, 'a.1')).toBe(20)
  })

  it('returns the default value when the path does not resolve', () => {
    expect(get({ a: {} }, 'a.b.c', 'fallback')).toBe('fallback')
  })

  it('returns the default value when traversing through null/undefined', () => {
    expect(get({ a: null }, 'a.b', 'fallback')).toBe('fallback')
  })
})
