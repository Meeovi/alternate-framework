import { describe, it, expect } from 'vitest'
import { cloneObject, cloneArray, isObject } from '../../app/utils/objects'

describe('cloneObject', () => {
  it('deep clones so mutating the clone does not affect the original', () => {
    const original = { a: { b: 1 } }
    const clone = cloneObject(original)
    clone.a.b = 2
    expect(original.a.b).toBe(1)
    expect(clone.a.b).toBe(2)
  })
})

describe('cloneArray', () => {
  it('deep clones an array of objects', () => {
    const original = [{ a: 1 }]
    const clone = cloneArray(original)
    clone[0].a = 2
    expect(original[0].a).toBe(1)
  })
})

describe('isObject', () => {
  it('returns true only for plain objects', () => {
    expect(isObject({})).toBe(true)
    expect(isObject([])).toBe(false)
    expect(isObject(null)).toBeFalsy()
    expect(isObject('string')).toBe(false)
    expect(isObject(new Date())).toBe(false)
  })
})
