import { describe, it, expect } from 'vitest'
import { safeRelation, safeRelationId } from '../../app/utils/relations'

describe('safeRelation', () => {
  it('wraps a bare string id in an object', () => {
    expect(safeRelation('abc')).toEqual({ id: 'abc' })
  })

  it('returns undefined for nullish input', () => {
    expect(safeRelation(null)).toBeUndefined()
    expect(safeRelation(undefined)).toBeUndefined()
  })

  it('returns the nested id (not the object) when given an expanded relation object', () => {
    expect(safeRelation({ id: 'abc', name: 'thing' })).toBe('abc')
  })

  it('returns null when given an object with no id', () => {
    expect(safeRelation({ name: 'thing' })).toBeNull()
  })
})

describe('safeRelationId', () => {
  it('returns the string id as-is', () => {
    expect(safeRelationId('abc')).toBe('abc')
  })

  it('extracts id from an expanded relation object', () => {
    expect(safeRelationId({ id: 'abc', name: 'thing' })).toBe('abc')
  })

  it('returns null for nullish or id-less input', () => {
    expect(safeRelationId(null)).toBeNull()
    expect(safeRelationId({ name: 'thing' })).toBeNull()
  })
})
