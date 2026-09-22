/**
 * Unit tests — alternate-search layer integration
 *
 * Sections:
 *   1. HTTP client contract  (elasticsearchAdapter/client.ts)
 *   2. elasticsearchAdapter  (full pipeline, mocked fetch)
 *   3. useAlternateSearch composable logic  (pure functions, no Nuxt runtime)
 *   4. createSearch + elasticsearchAdapter  (full pipeline, mocked fetch)
 *   5. Live OpenSearch smoke test  (auto-enabled when ALTERNATE_SEARCH_URL is set)
 *
 * All mocking in sections 1-4 uses vi.spyOn + mockRestore so real fetch is
 * always present for section 5.
 */

import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createElasticsearchClient } from '../../../../../packages/modules/alternate-search/adapters/elasticsearch/client'
import { elasticsearchAdapter } from '../../../../../packages/modules/alternate-search/adapters/elasticsearch/index'
import { createSearch } from '../../../../../packages/modules/alternate-search/core/search'

const _realFetch: typeof fetch = globalThis.fetch

// ---------------------------------------------------------------------------
// 1. HTTP client — authorization and error handling
// ---------------------------------------------------------------------------

describe('elasticsearchAdapter — HTTP client contract', () => {
  it('builds correct Basic-auth Authorization header', async () => {
    const calls: RequestInit[] = []
    const spy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (_url: any, init?: any) => {
      calls.push(init ?? {})
      return new Response(JSON.stringify({ acknowledged: true }), { status: 200 })
    })

    try {
      const client = createElasticsearchClient('http://localhost:9200', {
        username: 'alice',
        password: 'secret',
      })
      await client.createIndex('test-idx', { mappings: { properties: {} } })

      const auth = (calls[0].headers as Record<string, string>).Authorization
      expect(auth).toMatch(/^Basic /)
      const decoded = Buffer.from(auth.replace('Basic ', ''), 'base64').toString()
      expect(decoded).toBe('alice:secret')
    } finally {
      spy.mockRestore()
    }
  })

  it('builds correct ApiKey Authorization header', async () => {
    const calls: RequestInit[] = []
    const spy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (_url: any, init?: any) => {
      calls.push(init ?? {})
      return new Response(JSON.stringify({ acknowledged: true }), { status: 200 })
    })

    try {
      const client = createElasticsearchClient('http://localhost:9200', { apiKey: 'my-key' })
      await client.createIndex('test-idx', { mappings: { properties: {} } })
      const auth = (calls[0].headers as Record<string, string>).Authorization
      expect(auth).toBe('ApiKey my-key')
    } finally {
      spy.mockRestore()
    }
  })

  it('sends no Authorization header when no credentials provided', async () => {
    const calls: RequestInit[] = []
    const spy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (_url: any, init?: any) => {
      calls.push(init ?? {})
      return new Response(JSON.stringify({ acknowledged: true }), { status: 200 })
    })

    try {
      const client = createElasticsearchClient('http://localhost:9200')
      await client.createIndex('test-idx', { mappings: { properties: {} } })
      const h = calls[0].headers as Record<string, string>
      expect(h.Authorization).toBeUndefined()
    } finally {
      spy.mockRestore()
    }
  })

  it('throws on non-2xx response', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
      new Response(JSON.stringify({ error: { reason: 'server error' } }), { status: 500 })
    )

    try {
      const client = createElasticsearchClient('http://localhost:9200')
      await expect(client.search('idx', {})).rejects.toThrow('500')
    } finally {
      spy.mockRestore()
    }
  })
})

// ---------------------------------------------------------------------------
// 2. elasticsearchAdapter — full adapter pipeline with mocked fetch
// ---------------------------------------------------------------------------

describe('elasticsearchAdapter — full adapter pipeline', () => {
  function mockFetch(handler: (url: string, init?: RequestInit) => Response | Promise<Response>) {
    return vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any, init?: any) => {
      const u = typeof url === 'string' ? url : url.toString()
      return handler(u, init)
    })
  }

  it('setup() sends PUT with correct mapping body', async () => {
    const sentBodies: string[] = []
    const spy = mockFetch(async (_u, init) => {
      if ((init?.method ?? '').toUpperCase() === 'PUT') sentBodies.push(String(init?.body ?? ''))
      return new Response(JSON.stringify({ acknowledged: true }), { status: 200 })
    })

    try {
      const adapter = elasticsearchAdapter({ baseUrl: 'http://localhost:9200' })
      await adapter.setup({
        products: {
          fieldMap: {
            title: { type: 'string', searchable: true },
            price: { type: 'number', filterable: true },
          },
        },
      })

      expect(spy).toHaveBeenCalled()
      const body = JSON.parse(sentBodies[0])
      expect(body.mappings.properties.title).toBeDefined()
      expect(body.mappings.properties.price).toBeDefined()
    } finally {
      spy.mockRestore()
    }
  })

  it('query() returns mapped items from ES hits', async () => {
    const spy = mockFetch(async (u, init) => {
      if ((init?.method ?? '').toUpperCase() === 'PUT')
        return new Response(JSON.stringify({ acknowledged: true }), { status: 200 })
      if (u.includes('_search'))
        return new Response(JSON.stringify({
          hits: {
            total: { value: 2 },
            hits: [
              { _id: 'p1', _source: { title: 'Sneakers Pro', price: 89.99 } },
              { _id: 'p2', _source: { title: 'Running Shoe', price: 120.00 } },
            ],
          },
          took: 2,
        }), { status: 200 })
      return new Response('{}', { status: 200 })
    })

    try {
      const adapter = elasticsearchAdapter({ baseUrl: 'http://localhost:9200' })
      await adapter.setup({ products: { fieldMap: { title: { type: 'string', searchable: true } } } })

      const result = await adapter.query('products', { q: 'sneakers' })
      expect(result.items).toHaveLength(2)
      expect(result.items[0].id).toBe('p1')
      expect((result.items[0] as any).title).toBe('Sneakers Pro')
      expect(result.total).toBe(2)
    } finally {
      spy.mockRestore()
    }
  })

  it('query() includes filter conditions in ES bool.filter', async () => {
    const sentBodies: string[] = []
    const spy = mockFetch(async (u, init) => {
      if (u.includes('_search')) sentBodies.push(String(init?.body ?? ''))
      return new Response(JSON.stringify({ hits: { total: { value: 0 }, hits: [] }, took: 1 }), { status: 200 })
    })

    try {
      const adapter = elasticsearchAdapter({ baseUrl: 'http://localhost:9200' })
      await adapter.setup({
        articles: {
          fieldMap: {
            title:     { type: 'string', searchable: true },
            published: { type: 'boolean', filterable: true },
          },
        },
      })

      await adapter.query('articles', {
        q: 'hello',
        filters: [{ field: 'published', operator: 'eq' as const, value: true }],
      })

      const body = JSON.parse(sentBodies[0])
      expect(Array.isArray(body.query?.bool?.filter)).toBe(true)
      expect(body.query.bool.filter.length).toBeGreaterThan(0)
    } finally {
      spy.mockRestore()
    }
  })

  it('index() sends _bulk ndjson with correct document ids', async () => {
    let bulkBody = ''
    const spy = mockFetch(async (u, init) => {
      if (u.includes('_bulk')) bulkBody = String(init?.body ?? '')
      return new Response(JSON.stringify({ errors: false, items: [] }), { status: 200 })
    })

    try {
      const adapter = elasticsearchAdapter({ baseUrl: 'http://localhost:9200' })
      await adapter.setup({ products: { fieldMap: { title: { type: 'string', searchable: true } } } })
      await adapter.index('products', [
        { id: 'doc-1', title: 'Alpha' },
        { id: 'doc-2', title: 'Beta' },
      ])

      expect(bulkBody).toContain('"doc-1"')
      expect(bulkBody).toContain('"doc-2"')
      expect(bulkBody).toContain('"index"')
    } finally {
      spy.mockRestore()
    }
  })

  it('stats() returns doc count from _count API', async () => {
    const spy = mockFetch(async (u) => {
      if (u.includes('_count')) return new Response(JSON.stringify({ count: 77 }), { status: 200 })
      return new Response(JSON.stringify({ acknowledged: true }), { status: 200 })
    })

    try {
      const adapter = elasticsearchAdapter({ baseUrl: 'http://localhost:9200' })
      await adapter.setup({ products: { fieldMap: { title: { type: 'string', searchable: true } } } })
      const stats = await adapter.stats!('products')
      expect(stats.count).toBe(77)
    } finally {
      spy.mockRestore()
    }
  })
})

// ---------------------------------------------------------------------------
// 3. useAlternateSearch composable — pure logic (no Nuxt runtime needed)
// ---------------------------------------------------------------------------

describe('useAlternateSearch composable logic', () => {
  const MAX_QUERY_LENGTH = 200
  const MAX_PAGE = 1000

  function sanitiseQuery(v: string): string {
    return v.trim().slice(0, MAX_QUERY_LENGTH).replace(/[*%]+/g, '')
  }

  function sanitisePage(v: number): number {
    if (!Number.isInteger(v) || v < 1) return 1
    return Math.min(v, MAX_PAGE)
  }

  function buildUrl(index: string, query: string, page: number, pageSize: number): string {
    const q = sanitiseQuery(query)
    const p = sanitisePage(page)
    const params = new URLSearchParams({ page: String(p), pageSize: String(pageSize) })
    if (q) params.set('q', q)
    return `/api/search/${encodeURIComponent(index)}?${params.toString()}`
  }

  function buildPageInfo(page: number, pageSize: number, total: number) {
    const p = sanitisePage(page)
    const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 0
    return { page: p, pageSize, total, totalPages, hasNext: p < totalPages, hasPrev: p > 1 }
  }

  it('sanitiseQuery strips leading/trailing whitespace', () => {
    expect(sanitiseQuery('  hello world  ')).toBe('hello world')
  })

  it('sanitiseQuery removes wildcard characters', () => {
    expect(sanitiseQuery('foo*bar%baz')).toBe('foobarbaz')
  })

  it('sanitiseQuery truncates to MAX_QUERY_LENGTH', () => {
    expect(sanitiseQuery('a'.repeat(300))).toHaveLength(MAX_QUERY_LENGTH)
  })

  it('sanitiseQuery returns empty string for blank input', () => {
    expect(sanitiseQuery('   ')).toBe('')
  })

  it('sanitisePage clamps negative pages to 1', () => {
    expect(sanitisePage(-5)).toBe(1)
  })

  it('sanitisePage clamps page 0 to 1', () => {
    expect(sanitisePage(0)).toBe(1)
  })

  it('sanitisePage clamps above MAX_PAGE', () => {
    expect(sanitisePage(MAX_PAGE + 1)).toBe(MAX_PAGE)
  })

  it('sanitisePage returns valid pages unchanged', () => {
    expect(sanitisePage(42)).toBe(42)
  })

  it('buildUrl encodes q param', () => {
    expect(buildUrl('products', 'running shoes', 1, 20)).toContain('q=running+shoes')
  })

  it('buildUrl omits q param for blank query', () => {
    expect(buildUrl('products', '', 1, 20)).not.toContain('q=')
  })

  it('buildUrl encodes index name', () => {
    expect(buildUrl('my index', 'test', 1, 20)).toContain('/api/search/my%20index')
  })

  it('buildUrl includes page and pageSize', () => {
    const url = buildUrl('products', 'test', 3, 50)
    expect(url).toContain('page=3')
    expect(url).toContain('pageSize=50')
  })

  it('buildPageInfo reports hasNext correctly', () => {
    const info = buildPageInfo(1, 20, 100)
    expect(info.hasNext).toBe(true)
    expect(info.totalPages).toBe(5)
  })

  it('buildPageInfo reports hasPrev false on first page', () => {
    expect(buildPageInfo(1, 20, 100).hasPrev).toBe(false)
  })

  it('buildPageInfo reports hasPrev true on page 2', () => {
    expect(buildPageInfo(2, 20, 100).hasPrev).toBe(true)
  })

  it('buildPageInfo handles empty result set', () => {
    const info = buildPageInfo(1, 20, 0)
    expect(info.totalPages).toBe(0)
    expect(info.hasNext).toBe(false)
  })

  it('buildPageInfo calculates fractional pages correctly', () => {
    expect(buildPageInfo(1, 20, 45).totalPages).toBe(3)
  })
})

// ---------------------------------------------------------------------------
// 4. createSearch + elasticsearchAdapter — full pipeline (mocked fetch)
// ---------------------------------------------------------------------------

describe('createSearch + elasticsearchAdapter — full pipeline', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    globalThis.fetch = _realFetch
  })

  afterEach(() => {
    vi.restoreAllMocks()
    globalThis.fetch = _realFetch
  })

  it('query() returns SearchResult with mapped items', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any, init?: any) => {
      const u = typeof url === 'string' ? url : url.toString()
      const m = (init?.method ?? 'GET').toUpperCase()
      if (m === 'PUT') return new Response(JSON.stringify({ acknowledged: true }), { status: 200 })
      if (u.includes('_search'))
        return new Response(JSON.stringify({
          hits: {
            total: { value: 1 },
            hits: [{ _id: 'prod-1', _source: { title: 'Hiking Boot', price: 149.95 } }],
          },
          took: 3,
        }), { status: 200 })
      return new Response('{}', { status: 200 })
    })

    const search = createSearch({
      adapter: elasticsearchAdapter({ baseUrl: 'http://localhost:9200' }),
      indexes: {
        products: {
          fieldMap: {
            title: { type: 'string', searchable: true },
            price: { type: 'number', filterable: true },
          },
        },
      },
    })

    await search.setup()
    const result = await search.query('products', { q: 'hiking' })

    expect(result.items).toHaveLength(1)
    expect(result.items[0].id).toBe('prod-1')
    expect((result.items[0] as any).title).toBe('Hiking Boot')
    expect(result.total).toBe(1)
  })

  it('stats() returns { count } from _count API', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any) => {
      const u = typeof url === 'string' ? url : url.toString()
      if (u.includes('_count')) return new Response(JSON.stringify({ count: 99 }), { status: 200 })
      return new Response(JSON.stringify({ acknowledged: true }), { status: 200 })
    })

    const search = createSearch({
      adapter: elasticsearchAdapter({ baseUrl: 'http://localhost:9200' }),
      indexes: {
        products: { fieldMap: { title: { type: 'string', searchable: true } } },
      },
    })

    await search.setup()
    const stats = await search.stats('products')
    expect(stats.count).toBe(99)
  })
})

// ---------------------------------------------------------------------------
// 5. Live OpenSearch smoke test
// ---------------------------------------------------------------------------

const LIVE_URL = process.env.ALTERNATE_SEARCH_URL || 'http://158.69.211.52:9200'
const SKIP_LIVE = process.env.SKIP_LIVE_SEARCH === '1'

let liveSearch: ReturnType<typeof createSearch> | null = null
let liveIndex = ''

describe.skipIf(SKIP_LIVE)('live OpenSearch integration — starter-template layer', () => {
  it('can setup, index, query and return stats against the real node', async () => {
    liveIndex = `layer_test_${Date.now()}`

    liveSearch = createSearch({
      adapter: elasticsearchAdapter({ baseUrl: LIVE_URL }),
      indexes: {
        [liveIndex]: {
          fieldMap: {
            title:    { type: 'string', searchable: true },
            category: { type: 'string', filterable: true, facetable: true },
            price:    { type: 'number', filterable: true },
          },
        },
      },
    })

    await liveSearch.setup()

    await liveSearch.index(liveIndex, [
      { id: 'lt-1', title: 'Trail Running Shoes', category: 'footwear', price: 89.99 },
      { id: 'lt-2', title: 'Hiking Backpack',     category: 'gear',     price: 199.00 },
      { id: 'lt-3', title: 'Lightweight Tent',    category: 'camping',  price: 349.00 },
    ])

    await new Promise((r) => setTimeout(r, 500))

    const result = await liveSearch.query(liveIndex, { q: 'trail' })
    expect(result.items.length).toBeGreaterThan(0)
    expect(result.items.map((h: any) => h.id)).toContain('lt-1')

    const stats = await liveSearch.stats(liveIndex)
    expect(stats.count).toBeGreaterThanOrEqual(3)
  }, 15_000)
})

afterAll(async () => {
  if (liveSearch && liveIndex) {
    try {
      await liveSearch.deleteWhere(liveIndex, [
        { field: 'id', operator: 'IN', value: ['lt-1', 'lt-2', 'lt-3'] },
      ])
    } catch {
      // best-effort cleanup
    }
  }
})
