import { describe, expect, it, vi } from 'vitest'
import { MageOsAdapter, normalizeCategory, normalizeProduct, productVariables, type RawProduct } from '../src/adapters/mage-os.adapter'
import { CommerceError } from '../src/errors'

// Shape as returned by commerce.meeovicms.com (Mage-OS 2.2), trimmed.
const configurable: RawProduct = {
  __typename: 'ConfigurableProduct',
  uid: 'MTIz',
  sku: 'MJ01',
  name: 'Beaumont Summit Kit',
  url_key: 'beaumont-summit-kit',
  updated_at: '2026-10-19 08:30:00',
  stock_status: 'IN_STOCK',
  only_x_left_in_stock: 3,
  price_range: { minimum_price: { regular_price: { value: 42, currency: 'USD' }, final_price: { value: 33.6, currency: 'USD' } } },
  image: { url: 'https://shop/media/catalog/product/placeholder/default/logo.png' },
  small_image: { url: 'https://shop/media/catalog/product/placeholder/default/logo.png' },
  media_gallery: [
    { url: 'https://shop/media/b.jpg', position: 2, disabled: false },
    { url: 'https://shop/media/a.jpg', position: 1, disabled: false },
    { url: 'https://shop/media/hidden.jpg', position: 0, disabled: true },
  ],
  categories: [{ uid: 'Mzg=', name: 'Jackets', url_key: 'jackets-men', url_path: 'men/tops-men/jackets-men' }],
  description: { html: '<p>Warm.</p>' },
  custom_attributesV2: {
    items: [
      { code: 'name', value: 'Beaumont Summit Kit' },
      { code: 'status', selected_options: [{ label: 'Enabled', value: '1' }] },
      { code: 'tier_price', value: null },
      { code: 'material', selected_options: [{ label: 'Fleece', value: '144' }, { label: 'Nylon', value: '37' }] },
      { code: 'climate', selected_options: [{ label: 'Cool', value: '205' }] },
      { code: 'warranty', value: '2 years' },
    ],
  },
  configurable_options: [{ attribute_code: 'color', label: 'Color', values: [{ label: 'Red', value_index: 58, swatch_data: { value: '#ff0000' } }] }],
  variants: [{ attributes: [{ code: 'color', value_index: 58, label: 'Red' }], product: { uid: 'NDU2', sku: 'MJ01-XS-Red', stock_status: 'OUT_OF_STOCK', price_range: { minimum_price: { regular_price: { value: 42, currency: 'USD' }, final_price: { value: 42, currency: 'USD' } } } } }],
}

describe('normalizeProduct', () => {
  it('flattens Magento nesting into the normalized contract', () => {
    const product = normalizeProduct(configurable)
    expect(product).toMatchObject({
      id: 'MTIz',
      sku: 'MJ01',
      name: 'Beaumont Summit Kit',
      slug: 'beaumont-summit-kit',
      price: { regular: 42, final: 33.6, currency: 'USD' },
      inStock: true,
      images: ['https://shop/media/a.jpg', 'https://shop/media/b.jpg'],
      categories: [{ id: 'Mzg=', name: 'Jackets', slug: 'jackets-men' }],
      updatedAt: '2026-10-19T08:30:00.000Z',
    })
  })

  it('keeps store attributes, drops system ones, and adds options/variants', () => {
    const { attributes } = normalizeProduct(configurable)
    expect(attributes).toMatchObject({
      type: 'configurable',
      material: ['Fleece', 'Nylon'],
      climate: 'Cool',
      warranty: '2 years',
      description: '<p>Warm.</p>',
      onlyLeftInStock: 3,
      options: [{ code: 'color', label: 'Color', values: [{ id: 58, label: 'Red', swatch: '#ff0000' }] }],
      variants: [{ id: 'NDU2', sku: 'MJ01-XS-Red', inStock: false, price: { regular: 42, final: 42, currency: 'USD' }, options: { color: 58 } }],
    })
    expect(attributes).not.toHaveProperty('name')
    expect(attributes).not.toHaveProperty('status')
    expect(attributes).not.toHaveProperty('tier_price')
  })

  it('treats placeholder-only images as no images, and missing prices as 0', () => {
    const product = normalizeProduct({ uid: 'x', sku: 'x', name: 'X', url_key: null, image: { url: 'https://shop/media/catalog/product/placeholder/x.png' } })
    expect(product.images).toEqual([])
    expect(product.price).toEqual({ regular: 0, final: 0, currency: '' })
    expect(product.inStock).toBe(false)
    expect(product.attributes.type).toBe('simple')
  })
})

describe('normalizeCategory', () => {
  it('makes levels relative to the root and sorts children by position', () => {
    const category = normalizeCategory({
      uid: 'MjA=', name: 'Women', url_key: 'women', url_path: 'apparel/women', level: 3, position: 2, include_in_menu: 1, product_count: 12,
      children: [
        { uid: 'b', name: 'B', url_key: 'b', url_path: 'apparel/women/b', level: 4, position: 2, include_in_menu: 0, product_count: 1 },
        { uid: 'a', name: 'A', url_key: 'a', url_path: 'apparel/women/a', level: 4, position: 1, include_in_menu: 1, product_count: 2 },
      ],
    }, 1)
    expect(category).toMatchObject({ id: 'MjA=', slug: 'women', path: 'apparel/women', level: 2, productCount: 12, includeInMenu: true })
    expect(category.children.map((c) => [c.id, c.level, c.includeInMenu])).toEqual([['a', 3, true], ['b', 3, false]])
  })
})

describe('productVariables', () => {
  it('maps options to Magento filters and sorts', () => {
    expect(productVariables({ categoryId: 'Mzg=', priceMin: 10, priceMax: 50, skus: ['A', 'B'], page: 2, pageSize: 12, sort: '-price' })).toEqual({
      search: undefined,
      filter: { category_uid: { eq: 'Mzg=' }, sku: { in: ['A', 'B'] }, price: { from: '10', to: '50' } },
      sort: { price: 'DESC' },
      pageSize: 12,
      currentPage: 2,
    })
  })

  it('defaults the sort to relevance for search, position for categories, else name', () => {
    expect(productVariables({ search: 'jacket' }).sort).toEqual({ relevance: 'DESC' })
    expect(productVariables({ categoryPath: 'men/tops' }).sort).toEqual({ position: 'ASC' })
    expect(productVariables({ categoryPath: 'men/tops' }).filter).toEqual({ category_url_path: { eq: 'men/tops' } })
    expect(productVariables({}).sort).toEqual({ name: 'ASC' })
  })
})

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

describe('MageOsAdapter transport', () => {
  const make = (fetch: typeof globalThis.fetch, extra = {}) => new MageOsAdapter({ url: 'https://shop', token: 'tok', timeoutMs: 1000, fetch, ...extra })

  it('requires a URL', () => {
    expect(() => new MageOsAdapter({ url: '' })).toThrow(/MAGEOS_URL/)
  })

  it('pages products over GET with the Store header', async () => {
    const fetch = vi.fn(async () => json({ data: { products: { total_count: 41, page_info: { current_page: 2, page_size: 20, total_pages: 3 }, items: [configurable] } } }))
    const page = await make(fetch as never, { storeCode: 'en' }).getProductPage({ page: 2 })
    expect(page).toMatchObject({ page: 2, pageSize: 20, total: 41, totalPages: 3 })
    expect(page.items[0]!.sku).toBe('MJ01')
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit]
    expect(url.startsWith('https://shop/graphql?query=')).toBe(true)
    expect(init.method).toBe('GET')
    expect((init.headers as Record<string, string>).Store).toBe('en')
  })

  it('returns null for an unknown slug', async () => {
    expect(await make(async () => json({ data: { products: { items: [] } } })).getProductBySlug('nope')).toBeNull()
  })

  it('maps timeouts, outages and maintenance mode to upstream errors (after one retry)', async () => {
    const timeout = vi.fn(async () => { throw Object.assign(new Error('timed out'), { name: 'TimeoutError' }) })
    await expect(make(timeout).getCategories()).rejects.toMatchObject({ code: 'UPSTREAM_TIMEOUT', status: 504 })

    const refused = vi.fn(async () => { throw Object.assign(new TypeError('fetch failed'), { cause: { code: 'ECONNREFUSED' } }) })
    await expect(make(refused).getCategories()).rejects.toMatchObject({ code: 'UPSTREAM_OFFLINE', status: 503 })
    expect(refused).toHaveBeenCalledTimes(2)

    const maintenance = vi.fn(async () => new Response('<html>Service Temporarily Unavailable</html>', { status: 503 }))
    await expect(make(maintenance).getCategories()).rejects.toMatchObject({ code: 'UPSTREAM_UNAVAILABLE', status: 503 })
    expect(maintenance).toHaveBeenCalledTimes(2)
  })

  it('surfaces GraphQL errors, but keeps partial data', async () => {
    await expect(make(async () => json({ errors: [{ message: 'Field "x" is not defined' }] })).getProducts({})).rejects.toMatchObject({ code: 'UPSTREAM_ERROR' })
    const partial = await make(async () => json({ data: { products: { items: [configurable] } }, errors: [{ message: 'one item failed' }] })).getProductBySlug('beaumont-summit-kit')
    expect(partial?.sku).toBe('MJ01')
  })

  it('reads stock over REST with the token, skipping unknown SKUs', async () => {
    const fetch = vi.fn(async (url: string) => {
      if (url.endsWith('/A')) return json({ qty: 7, is_in_stock: true })
      if (url.endsWith('/B')) return json({ qty: 4, is_in_stock: false })
      return json({ message: 'not found' }, 404)
    })
    expect(await make(fetch as never).getInventory(['A', 'B', 'C', 'A'])).toEqual({ A: 7, B: 0 })
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://shop/rest/V1/stockItems/A')
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer tok')
  })

  it('explains a missing ACL resource on stock', async () => {
    const denied = async () => json({ message: "The consumer isn't authorized to access %resources.", parameters: { resources: 'Magento_Catalog::catalog_inventory' } }, 401)
    const error = await make(denied).getInventory(['A']).catch((e) => e) as CommerceError
    expect(error.code).toBe('UPSTREAM_AUTH')
    expect(error.message).toContain('Magento_Catalog::catalog_inventory')
  })

  it('needs a token for stock', async () => {
    await expect(new MageOsAdapter({ url: 'https://shop', fetch: vi.fn() }).getInventory(['A'])).rejects.toMatchObject({ code: 'NOT_CONFIGURED' })
  })
})
