import { describe, it, expect, vi } from 'vitest'
import { MagentoAdapter } from '../src/index'
import { createMagentoCommerceBackendAdapter } from '../src/runtime/commerce-backend'

// Gift cards through the Meeovi_GiftCards module: product SKUs and a
// customer's cards over the Integration, products over the storefront.
const credentials = { consumerKey: 'ck', consumerSecret: 'cs', accessToken: 'at', accessTokenSecret: 'ats' }

function setup() {
  const magento = new MagentoAdapter('http://fake-magento.test/graphql')
  const giftCards = {
    productSkus: vi.fn().mockResolvedValue(['gc-25', 'gc-50']),
    received: vi.fn().mockResolvedValue([{ code: 'ABC123', state: 'available', enabled: true, balance: 25, sender_name: 'Sam' }]),
    purchased: vi.fn().mockResolvedValue([{ state: 'pending', product_name: 'Gift Card', order_number: '000000009' }]),
  }
  ;(magento as any).giftCards = giftCards
  magento.store.queryField = vi.fn().mockResolvedValue({ items: [{ uid: 'MQ==', sku: 'gc-25', name: 'Gift Card $25', __typename: 'GiftCardProduct' }] })
  return { magento, giftCards, adapter: createMagentoCommerceBackendAdapter(magento, credentials) }
}

describe('gift cards', () => {
  it('are only offered with the Integration', () => {
    const adapter = createMagentoCommerceBackendAdapter(new MagentoAdapter('http://x.test/graphql'))
    expect(adapter.giftCardProducts).toBeUndefined()
    expect(adapter.receivedGiftCards).toBeUndefined()
  })

  it('loads gift card products by SKU and normalizes them', async () => {
    const { adapter, magento } = setup()
    const products = await adapter.giftCardProducts!()
    expect(magento.store.queryField).toHaveBeenCalledWith('products', { filter: { sku: { in: ['gc-25', 'gc-50'] } }, pageSize: 2 }, expect.anything())
    expect(products[0]).toMatchObject({ sku: 'gc-25', name: 'Gift Card $25', source: 'magento' })
  })

  it('skips the product query when there are no gift cards', async () => {
    const { adapter, magento, giftCards } = setup()
    giftCards.productSkus.mockResolvedValueOnce([])
    expect(await adapter.giftCardProducts!()).toEqual([])
    expect(magento.store.queryField).not.toHaveBeenCalled()
  })

  it('fills in the fields Magento leaves out', async () => {
    const { adapter, giftCards } = setup()
    const [received] = await adapter.receivedGiftCards!('me@example.com')
    expect(giftCards.received).toHaveBeenCalledWith(credentials, 'me@example.com')
    expect(received).toEqual(expect.objectContaining({ code: 'ABC123', state: 'available', enabled: true, balance: 25, sender_name: 'Sam', recipient_email: null, expires_at: null }))
    const [bought] = await adapter.purchasedGiftCards!('42')
    expect(giftCards.purchased).toHaveBeenCalledWith(credentials, 42)
    expect(bought).toEqual(expect.objectContaining({ code: null, state: 'pending', enabled: false, order_number: '000000009' }))
  })

  it('refuses customer ids that are not numbers', async () => {
    const { adapter, giftCards } = setup()
    expect(await adapter.purchasedGiftCards!('1 OR 1')).toEqual([])
    expect(giftCards.purchased).not.toHaveBeenCalled()
  })
})
