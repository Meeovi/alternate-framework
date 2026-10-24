import { beforeEach, describe, expect, it, vi } from 'vitest'

const request = vi.fn()

vi.mock('#imports', () => ({
  useRuntimeConfig: () => ({
    searchProviders: {
      directus: {
        enabled: true,
        collections: [
          { collection: 'lists', type: 'list', titleField: 'name', path: '/lists/list/{slug}' },
          { collection: 'brands', type: 'brand', titleField: 'name', statusField: null },
          { collection: 'products', type: 'product', titleField: 'name', slugField: null, extraFields: ['price'], filter: { source: { _neq: 'magento' } } },
        ],
      },
    },
    directus: { token: 'server-token' },
    public: { directus: { url: 'https://cms.test' } },
  }),
}))

vi.mock('@directus/sdk', () => ({
  createDirectus: () => ({ with() { return this }, request }),
  rest: () => ({}),
  staticToken: () => ({}),
  // The query object is what the provider sends; return it as the command.
  readItems: (collection: string, query: Record<string, unknown>) => ({ collection, query }),
}))

import { directusProvider } from '../../server/providers/directus'

const options = { query: 'music', page: 1, pageSize: 12, fields: [], facets: [] }

describe('directus search provider', () => {
  beforeEach(() => {
    request.mockReset()
    request.mockResolvedValue([])
  })

  it("never returns a private row, although the server token could read it", async () => {
    await directusProvider.search(options)

    const lists = request.mock.calls.map(([command]) => command).find((command) => command.collection === 'lists')
    const filter = JSON.stringify(lists.query.filter)
    // privateContent.ts's signed-out rule for lists, on top of the status deny-list.
    expect(filter).toContain('"status":{"_nin":["Private","Space-only"]}')
    expect(filter).toContain('"_nin":["draft","Draft","private","Private"')
    expect(lists.query.filter._and).toHaveLength(2)
  })

  it('searches a collection without a status field and without private rows unfiltered', async () => {
    await directusProvider.search(options)

    const brands = request.mock.calls.map(([command]) => command).find((command) => command.collection === 'brands')
    expect(brands.query.filter).toBeUndefined()
    expect(brands.query.search).toBe('music')
  })

  it("adds a collection's own filter, and copies its extra fields onto the hit", async () => {
    request.mockImplementation(async (command: { collection: string }) =>
      command.collection === 'products' ? [{ id: 3, name: 'Poster', price: '15.00' }] : [])

    const result = await directusProvider.search(options)

    const products = request.mock.calls.map(([command]) => command).find((command) => command.collection === 'products')
    expect(JSON.stringify(products.query.filter)).toContain('"source":{"_neq":"magento"}')
    expect(products.query.fields).toEqual(['id', 'name', 'price'])
    expect(result.items[0]!.source).toMatchObject({ id: 3, type: 'product', name: 'Poster', price: '15.00' })
  })

  it('links a hit through the collection path template', async () => {
    request.mockImplementation(async (command: { collection: string }) =>
      command.collection === 'lists' ? [{ id: 7, slug: 'summer', name: 'Summer music' }] : [])

    const result = await directusProvider.search(options)

    expect(result.items).toHaveLength(1)
    expect(result.items[0]!.source).toMatchObject({ type: 'list', title: 'Summer music', path: '/lists/list/summer' })
  })
})
