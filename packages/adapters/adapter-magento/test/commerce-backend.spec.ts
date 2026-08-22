import { describe, it, expect, vi } from 'vitest'
import { MagentoAdapter } from '../src/index'
import { createMagentoCommerceBackendAdapter } from '../src/runtime/commerce-backend'

// getProductsByCategory is the department/category product cross-reference
// used by layers/commerce/app/pages/departments/[...slug].vue and
// .../departments/category/[...id].vue — departments/categories themselves
// always stay Directus-sourced (see IN_SCOPE_COLLECTIONS in
// layers/commerce/app/plugins/directus.ts); this is only ever called to
// resolve the PRODUCTS shown inside one, keyed on the Directus record's
// slug (or an explicit externalId, when populated).
describe('createMagentoCommerceBackendAdapter.getProductsByCategory', () => {
  it('resolves category_uid by slug via categories(filters:{url_key}), then queries products(filter:{category_uid})', async () => {
    const magento = new MagentoAdapter('http://fake-magento.test/graphql')
    magento.store.queryField = vi.fn()
      .mockResolvedValueOnce({ items: [{ uid: 'cat-uid-1' }] })
      .mockResolvedValueOnce({
        items: [{ id: 'p1', sku: 'SKU1', name: 'Shoe', status: 1, stock_status: 'IN_STOCK' }],
        total_count: 1,
      })

    const adapter = createMagentoCommerceBackendAdapter(magento)
    const result = await adapter.getProductsByCategory!({ slug: 'shoes' })

    expect(magento.store.queryField).toHaveBeenNthCalledWith(
      1,
      'categories',
      { filters: { url_key: { eq: 'shoes' } }, pageSize: 1 },
      { fields: [{ items: ['uid'] }] },
    )
    expect(magento.store.queryField).toHaveBeenNthCalledWith(
      2,
      'products',
      { filter: { category_uid: { eq: 'cat-uid-1' } }, pageSize: 50 },
      expect.anything(),
    )
    expect(result).toEqual([expect.objectContaining({ id: 'p1', name: 'Shoe' })])
  })

  it('skips the categories lookup entirely when externalId is provided', async () => {
    const magento = new MagentoAdapter('http://fake-magento.test/graphql')
    magento.store.queryField = vi.fn().mockResolvedValueOnce({ items: [], total_count: 0 })

    const adapter = createMagentoCommerceBackendAdapter(magento)
    await adapter.getProductsByCategory!({ slug: 'shoes', externalId: 'cat-uid-explicit' })

    expect(magento.store.queryField).toHaveBeenCalledTimes(1)
    expect(magento.store.queryField).toHaveBeenCalledWith(
      'products',
      { filter: { category_uid: { eq: 'cat-uid-explicit' } }, pageSize: 50 },
      expect.anything(),
    )
  })

  it('returns [] without a products call when no matching Magento category exists', async () => {
    const magento = new MagentoAdapter('http://fake-magento.test/graphql')
    magento.store.queryField = vi.fn().mockResolvedValueOnce({ items: [], total_count: 0 })

    const adapter = createMagentoCommerceBackendAdapter(magento)
    const result = await adapter.getProductsByCategory!({ slug: 'no-such-department' })

    expect(result).toEqual([])
    expect(magento.store.queryField).toHaveBeenCalledTimes(1)
  })

  it('never declares departments/categories as swappable collections', () => {
    const magento = new MagentoAdapter('http://fake-magento.test/graphql')
    const adapter = createMagentoCommerceBackendAdapter(magento)

    expect(adapter.collections).toEqual(['products', 'orders'])
  })
})
