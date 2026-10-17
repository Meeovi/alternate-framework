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

describe('savedItemTarget', () => {
  it('sends commerce-backend product keys to lists_backend_products', async () => {
    const { savedItemTarget } = await import('../../server/utils/listItemKinds')
    expect(savedItemTarget('product', 'magento:meeovi-habit-tracker')).toEqual({
      junctionCollection: 'lists_backend_products',
      itemIdColumn: 'product_key',
      listsAliasField: 'backend_products',
      itemId: 'magento:meeovi-habit-tracker',
      backend: { id: 'magento', key: 'meeovi-habit-tracker' },
    })
  })

  it('keeps Directus products, spaces and vibes on their junctions', async () => {
    const { savedItemTarget } = await import('../../server/utils/listItemKinds')
    expect(savedItemTarget('product', '42')).toMatchObject({ junctionCollection: 'lists_products', itemIdColumn: 'products_id', itemId: 42 })
    expect(savedItemTarget('product', 'directus:42')).toBeNull()
    expect(savedItemTarget('space', 7)).toMatchObject({ junctionCollection: 'spaces_lists', itemId: 7 })
    // Only products can come from a commerce backend.
    expect(savedItemTarget('vibe', 'magento:x')).toBeNull()
  })

  it('refuses what lists can\'t hold', async () => {
    const { savedItemTarget } = await import('../../server/utils/listItemKinds')
    expect(savedItemTarget('product', 'MjExNg==')).toBeNull()
    expect(savedItemTarget('product', '')).toBeNull()
  })
})
