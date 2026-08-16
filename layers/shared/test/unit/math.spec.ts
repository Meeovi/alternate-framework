import { describe, it, expect } from 'vitest'
import { formatPercent, percentChange, roundToDecimal, isEven, isOdd } from '../../app/utils/math'

describe('formatPercent', () => {
  it('converts a fraction to a percentage string with one decimal', () => {
    expect(formatPercent(0.5)).toBe('50%')
    expect(formatPercent(0.333)).toBe('33.3%')
  })
})

describe('percentChange', () => {
  it('computes the relative change between two numbers', () => {
    expect(percentChange(100, 50)).toBe(0.5)
  })

  it('returns 0 when either input is 0 to avoid a divide-by-zero', () => {
    expect(percentChange(0, 50)).toBe(0)
    expect(percentChange(100, 0)).toBe(0)
  })
})

describe('roundToDecimal', () => {
  it('rounds to the requested number of decimal places', () => {
    expect(roundToDecimal(1.2345, 2)).toBe(1.23)
  })

  it('accepts string inputs for both value and decimals', () => {
    expect(roundToDecimal('1.2345', '2')).toBe(1.23)
  })
})

describe('isEven / isOdd', () => {
  it('classifies even and odd numbers', () => {
    expect(isEven(4)).toBe(true)
    expect(isEven(3)).toBe(false)
    expect(isOdd(3)).toBe(true)
    expect(isOdd(4)).toBe(false)
  })

  it('handles negative numbers', () => {
    expect(isOdd(-3)).toBe(true)
    expect(isEven(-4)).toBe(true)
  })
})
