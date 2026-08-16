import { describe, it, expect } from 'vitest'
import { getContrastColor } from '../../app/utils/color'

describe('getContrastColor', () => {
  it('returns white text for a dark background', () => {
    expect(getContrastColor('#000000')).toBe('#ffffff')
  })

  it('returns black text for a light background', () => {
    expect(getContrastColor('#ffffff')).toBe('#000000')
  })
})
