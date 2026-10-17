import { describe, expect, it } from 'vitest'
import { savedItemId } from '../../server/utils/listItemKinds'

describe('savedItemId', () => {
  it('accepts positive integer ids, as numbers or numeric strings', () => {
    expect(savedItemId(42)).toBe(42)
    expect(savedItemId('42')).toBe(42)
  })

  it('rejects ids a list junction can\'t hold (commerce backend products, junk)', () => {
    expect(savedItemId('MjExNg==')).toBeNull() // a Magento product uid
    expect(savedItemId('magento:meeovi-habit-tracker')).toBeNull()
    expect(savedItemId('')).toBeNull()
    expect(savedItemId(0)).toBeNull()
    expect(savedItemId(-3)).toBeNull()
    expect(savedItemId(1.5)).toBeNull()
  })
})
