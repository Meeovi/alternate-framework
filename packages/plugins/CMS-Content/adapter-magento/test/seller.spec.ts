import { describe, it, expect, vi, afterEach } from 'vitest'
import { MagentoAdapter } from '../src/index'

// `seller.registerSeller` / `seller.createProduct` bridge to the custom
// Meeovi_MarketplaceApi PHP module (no GraphQL surface exists for these —
// see MagentoAdapter.restUrl). There is no staging Magento instance, only
// the live production store, so these are tested against a mocked global
// `fetch` — verifying the request shape/payload/headers this adapter sends
// — rather than against real production data. See
// packages/plugins/CMS-Content/adapter-magento/magento-module/Meeovi/MarketplaceApi
// for the PHP side of the contract these calls assume.
describe('MagentoAdapter.seller', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('registerSeller', () => {
    it('POSTs to /rest/V1/meeovi-marketplace/seller/register with a bearer token and customerId', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ sellerRecordId: 42, isApproved: false, shopUrl: 'jane-doe-shop' }),
      })
      vi.stubGlobal('fetch', fetchMock)

      const magento = new MagentoAdapter('https://fake-magento.test/graphql')
      const result = await magento.seller.registerSeller(7, 'customer-token-abc')

      expect(fetchMock).toHaveBeenCalledWith('https://fake-magento.test/rest/V1/meeovi-marketplace/seller/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer customer-token-abc',
        },
        body: JSON.stringify({ customerId: 7 }),
      })
      expect(result).toEqual({ sellerRecordId: 42, isApproved: false, shopUrl: 'jane-doe-shop' })
    })

    it('includes shopUrl in the body when provided', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ sellerRecordId: 1, isApproved: false, shopUrl: 'custom-shop' }),
      })
      vi.stubGlobal('fetch', fetchMock)

      const magento = new MagentoAdapter('https://fake-magento.test/graphql')
      await magento.seller.registerSeller(7, 'customer-token-abc', 'custom-shop')

      expect(fetchMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ body: JSON.stringify({ customerId: 7, shopUrl: 'custom-shop' }) }),
      )
    })

    it('returns null (never throws) when Magento rejects the registration', async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 401, text: async () => 'Unauthorized' })
      vi.stubGlobal('fetch', fetchMock)

      const magento = new MagentoAdapter('https://fake-magento.test/graphql')
      const result = await magento.seller.registerSeller(7, 'bad-token')

      expect(result).toBeNull()
    })
  })

  describe('createProduct', () => {
    it('POSTs to /rest/V1/meeovi-marketplace/seller/products with customerId merged into the product input', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ productId: 501, sku: 'TEST-SKU-1', marketplaceProductId: 9 }),
      })
      vi.stubGlobal('fetch', fetchMock)

      const magento = new MagentoAdapter('https://fake-magento.test/graphql')
      const result = await magento.seller.createProduct(7, 'customer-token-abc', {
        sku: 'TEST-SKU-1',
        name: 'Test Product',
        price: 19.99,
      })

      expect(fetchMock).toHaveBeenCalledWith('https://fake-magento.test/rest/V1/meeovi-marketplace/seller/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer customer-token-abc',
        },
        body: JSON.stringify({ customerId: 7, sku: 'TEST-SKU-1', name: 'Test Product', price: 19.99 }),
      })
      expect(result).toEqual({ productId: 501, sku: 'TEST-SKU-1', marketplaceProductId: 9 })
    })

    it('returns null (never throws) when the product create is rejected', async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 422, text: async () => 'Invalid SKU' })
      vi.stubGlobal('fetch', fetchMock)

      const magento = new MagentoAdapter('https://fake-magento.test/graphql')
      const result = await magento.seller.createProduct(7, 'customer-token-abc', {
        sku: 'DUPLICATE-SKU',
        name: 'Test Product',
        price: 19.99,
      })

      expect(result).toBeNull()
    })
  })

  describe('commerce.createCustomer wantsToSell path', () => {
    it('calls seller.registerSeller with the recovered customer id and freshly minted token', async () => {
      const magento = new MagentoAdapter('https://fake-magento.test/graphql')

      magento.store.mutateEntity = vi.fn()
        .mockResolvedValueOnce({ customer: { id: null, email: 'jane@example.com', firstname: 'Jane', lastname: 'Doe' } })
        // uid is null, so createCustomer mints a token to recover it from the JWT payload
        .mockResolvedValueOnce({
          token: `header.${Buffer.from(JSON.stringify({ uid: 99 })).toString('base64')}.sig`,
        })

      const registerSeller = vi.fn().mockResolvedValue({ sellerRecordId: 1, isApproved: false, shopUrl: 'jane-doe-shop' })
      magento.seller.registerSeller = registerSeller

      const result = await magento.commerce.createCustomer({
        firstname: 'Jane',
        lastname: 'Doe',
        email: 'jane@example.com',
        wantsToSell: true,
      })

      expect(registerSeller).toHaveBeenCalledWith(99, expect.stringContaining('header.'))
      expect(result).toMatchObject({ id: 99, email: 'jane@example.com' })
    })

    it('does not call seller.registerSeller when wantsToSell is false', async () => {
      const magento = new MagentoAdapter('https://fake-magento.test/graphql')
      magento.store.mutateEntity = vi.fn()
        .mockResolvedValueOnce({ customer: { id: 5, email: 'sam@example.com', firstname: 'Sam', lastname: 'Lee' } })

      const registerSeller = vi.fn()
      magento.seller.registerSeller = registerSeller

      await magento.commerce.createCustomer({ firstname: 'Sam', lastname: 'Lee', email: 'sam@example.com' })

      expect(registerSeller).not.toHaveBeenCalled()
    })
  })

  // The 6 SellerDashboardManagementInterface routes are called with a
  // Magento Integration (OAuth 1.0a: consumer key/secret + access
  // token/secret), not a bearer token — Magento's Integrations feature
  // doesn't issue bearer tokens, only OAuth 1.0a credential pairs. These
  // assert the signed Authorization header shape rather than a fixed
  // signature (HMAC input includes a timestamp/nonce, so it's
  // non-deterministic across runs).
  describe('admin-scoped dashboard reads (OAuth 1.0a)', () => {
    const credentials = {
      consumerKey: 'ck-123',
      consumerSecret: 'cs-456',
      accessToken: 'at-789',
      accessTokenSecret: 'ats-012',
    }

    function expectSignedOAuthHeader(headers: Record<string, string>) {
      const auth = headers.Authorization
      expect(auth).toMatch(/^OAuth /)
      expect(auth).toContain(`oauth_consumer_key="${credentials.consumerKey}"`)
      expect(auth).toContain(`oauth_token="${credentials.accessToken}"`)
      expect(auth).toContain('oauth_signature_method="HMAC-SHA1"')
      expect(auth).toMatch(/oauth_signature="[^"]+"/)
      expect(auth).toMatch(/oauth_nonce="[^"]+"/)
      expect(auth).toMatch(/oauth_timestamp="\d+"/)
    }

    it('getShopProfile GETs with a signed OAuth header and double-decodes the JSON-string response', async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => JSON.stringify({ shopName: 'Jane Shop' }) })
      vi.stubGlobal('fetch', fetchMock)

      const magento = new MagentoAdapter('https://fake-magento.test/graphql')
      const result = await magento.seller.getShopProfile(7, credentials)

      expect(fetchMock).toHaveBeenCalledTimes(1)
      const [url, init] = fetchMock.mock.calls[0]
      expect(url).toBe('https://fake-magento.test/rest/V1/meeovi-marketplace/seller/shop?customerId=7')
      expectSignedOAuthHeader(init.headers)
      expect(result).toEqual({ shopName: 'Jane Shop' })
    })

    it('updateShopProfile PUTs JSON body with customerId merged in, signed without body params', async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => JSON.stringify({ shopName: 'New Name' }) })
      vi.stubGlobal('fetch', fetchMock)

      const magento = new MagentoAdapter('https://fake-magento.test/graphql')
      const result = await magento.seller.updateShopProfile(7, credentials, { shopName: 'New Name' })

      const [url, init] = fetchMock.mock.calls[0]
      expect(url).toBe('https://fake-magento.test/rest/V1/meeovi-marketplace/seller/shop')
      expect(init.method).toBe('PUT')
      expect(init.body).toBe(JSON.stringify({ customerId: 7, shopName: 'New Name' }))
      expectSignedOAuthHeader(init.headers)
      expect(result).toEqual({ shopName: 'New Name' })
    })

    it('getSellerProducts returns [] (never throws) on a non-ok response', async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 401 })
      vi.stubGlobal('fetch', fetchMock)

      const magento = new MagentoAdapter('https://fake-magento.test/graphql')
      const result = await magento.seller.getSellerProducts(7, credentials)

      expect(result).toEqual([])
    })

    it('getSellerOrders, getSellerTransactions, getLowStockProducts each sign their GET request', async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => JSON.stringify([]) })
      vi.stubGlobal('fetch', fetchMock)

      const magento = new MagentoAdapter('https://fake-magento.test/graphql')
      await magento.seller.getSellerOrders(7, credentials)
      await magento.seller.getSellerTransactions(7, credentials)
      await magento.seller.getLowStockProducts(7, credentials)

      expect(fetchMock).toHaveBeenCalledTimes(3)
      const paths = fetchMock.mock.calls.map(([url]: [string]) => new URL(url).pathname)
      expect(paths).toEqual([
        '/rest/V1/meeovi-marketplace/seller/orders',
        '/rest/V1/meeovi-marketplace/seller/transactions',
        '/rest/V1/meeovi-marketplace/seller/low-stock',
      ])
      fetchMock.mock.calls.forEach(([, init]: [string, { headers: Record<string, string> }]) => expectSignedOAuthHeader(init.headers))
    })
  })
})
