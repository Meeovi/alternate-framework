/**
 * Unit tests — OpenSearch Adapter
 *
 * All OpenSearch network calls are intercepted by a mock client injected into
 * createOpenSearchAdapter(), so these tests run without any live service.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

// vi.mock is hoisted ahead of all imports by Vitest, preventing the real
// @opensearch-project/opensearch Client from making any connection attempt
// when the adapter's client.ts module is first evaluated.
vi.mock('@opensearch-project/opensearch', () => ({
  Client: vi.fn().mockImplementation(() => ({
    search: vi.fn(),
    indices: {
      exists: vi.fn(),
      create: vi.fn(),
      refresh: vi.fn(),
      delete: vi.fn(),
    },
  })),
}))

import { createOpenSearchAdapter } from '@mframework/adapter-opensearch'

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Build a mock OpenSearch client whose search() returns the supplied fixture. */
function buildMockClient(overrides: { hits?: any[]; total?: any } = {}) {
  const defaultHits = [
    { _id: 'doc-1', _source: { title: 'The Matrix', year: 1999 } },
    { _id: 'doc-2', _source: { title: 'Inception', year: 2010 } },
  ]
  return {
    search: vi.fn().mockResolvedValue({
      body: {
        hits: {
          hits: overrides.hits ?? defaultHits,
          total: overrides.total ?? { value: 2 },
        },
      },
    }),
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('OpenSearch Adapter — createOpenSearchAdapter()', () => {
  // ── Adapter creation ────────────────────────────────────────────────────────
  describe('creation', () => {
    it('returns an adapter object with the expected shape', () => {
      const adapter = createOpenSearchAdapter({ client: buildMockClient() })
      expect(adapter).toBeDefined()
      expect(typeof adapter.search).toBe('function')
    })

    it('uses default id "adapter-opensearch"', () => {
      const adapter = createOpenSearchAdapter({ client: buildMockClient() })
      expect(adapter.id).toBe('adapter-opensearch')
    })

    it('uses custom id when provided', () => {
      const adapter = createOpenSearchAdapter({ id: 'products-search', client: buildMockClient() })
      expect(adapter.id).toBe('products-search')
    })

    it('sets type to "search"', () => {
      const adapter = createOpenSearchAdapter({ client: buildMockClient() })
      expect(adapter.type).toBe('search')
    })

    it('exposes config.provider as "opensearch"', () => {
      const adapter = createOpenSearchAdapter({ client: buildMockClient() })
      expect((adapter.config as any).provider).toBe('opensearch')
    })
  })

  // ── Term-based search ───────────────────────────────────────────────────────
  describe('term-based search', () => {
    it('sends a multi_match query for the provided term', async () => {
      const mockClient = buildMockClient()
      const adapter = createOpenSearchAdapter({ client: mockClient, index: 'movies' })

      await adapter.search({ term: 'matrix' } as any)

      const [callArg] = mockClient.search.mock.calls[0]
      expect(callArg.index).toBe('movies')
      expect(callArg.body.query.multi_match).toBeDefined()
      expect(callArg.body.query.multi_match.query).toBe('matrix')
    })

    it('boosts title^3 and name^2 in the multi_match fields', async () => {
      const mockClient = buildMockClient()
      const adapter = createOpenSearchAdapter({ client: mockClient })

      await adapter.search({ term: 'test' } as any)

      const fields: string[] = mockClient.search.mock.calls[0][0].body.query.multi_match.fields
      expect(fields).toContain('title^3')
      expect(fields).toContain('name^2')
    })

    it('accepts query.q as the search term (alias)', async () => {
      const mockClient = buildMockClient()
      const adapter = createOpenSearchAdapter({ client: mockClient })

      await adapter.search({ q: 'inception' } as any)

      const callArg = mockClient.search.mock.calls[0][0]
      expect(callArg.body.query.multi_match.query).toBe('inception')
    })

    it('calls the client exactly once per search call', async () => {
      const mockClient = buildMockClient()
      const adapter = createOpenSearchAdapter({ client: mockClient })

      await adapter.search({ term: 'test' } as any)
      expect(mockClient.search).toHaveBeenCalledOnce()
    })
  })

  // ── Result mapping ──────────────────────────────────────────────────────────
  describe('result mapping', () => {
    it('maps _source fields and _id into result items', async () => {
      const mockClient = buildMockClient()
      const adapter = createOpenSearchAdapter({ client: mockClient })

      const result = await adapter.search({ term: 'movie' } as any)

      expect(result.items).toHaveLength(2)
      expect(result.items[0]).toMatchObject({ id: 'doc-1', title: 'The Matrix', year: 1999 })
      expect(result.items[1]).toMatchObject({ id: 'doc-2', title: 'Inception', year: 2010 })
    })

    it('returns total from object-shaped total (OpenSearch/ES format)', async () => {
      const mockClient = buildMockClient({ total: { value: 42 } })
      const adapter = createOpenSearchAdapter({ client: mockClient })

      const result = await adapter.search({} as any)
      expect(result.total).toBe(42)
    })

    it('returns total when total is a plain number', async () => {
      const mockClient = {
        search: vi.fn().mockResolvedValue({
          body: { hits: { hits: [], total: 100 } },
        }),
      }
      const adapter = createOpenSearchAdapter({ client: mockClient })

      const result = await adapter.search({} as any)
      expect(result.total).toBe(100)
    })

    it('returns empty items array and total 0 when there are no hits', async () => {
      const mockClient = buildMockClient({ hits: [], total: { value: 0 } })
      const adapter = createOpenSearchAdapter({ client: mockClient })

      const result = await adapter.search({ term: 'ghost' } as any)
      expect(result.items).toHaveLength(0)
      expect(result.total).toBe(0)
    })
  })

  // ── Match-all fallback ──────────────────────────────────────────────────────
  describe('match-all fallback', () => {
    it('uses match_all when neither term nor filters is provided', async () => {
      const mockClient = buildMockClient()
      const adapter = createOpenSearchAdapter({ client: mockClient })

      await adapter.search({} as any)

      const callArg = mockClient.search.mock.calls[0][0]
      expect(callArg.body.query).toHaveProperty('match_all')
    })

    it('uses match_all when term is an empty string', async () => {
      const mockClient = buildMockClient()
      const adapter = createOpenSearchAdapter({ client: mockClient })

      await adapter.search({ term: '' } as any)

      const callArg = mockClient.search.mock.calls[0][0]
      expect(callArg.body.query).toHaveProperty('match_all')
    })
  })

  // ── Filter-based search ─────────────────────────────────────────────────────
  describe('filter-based search', () => {
    it('builds a bool filter query when a filters object is supplied', async () => {
      const mockClient = buildMockClient()
      const adapter = createOpenSearchAdapter({ client: mockClient })

      await adapter.search({ filters: { genre: 'action', year: 1999 } } as any)

      const callArg = mockClient.search.mock.calls[0][0]
      expect(callArg.body.query.bool).toBeDefined()
      expect(Array.isArray(callArg.body.query.bool.filter)).toBe(true)
    })

    it('creates a term clause for each filter key', async () => {
      const mockClient = buildMockClient()
      const adapter = createOpenSearchAdapter({ client: mockClient })

      await adapter.search({ filters: { genre: 'sci-fi' } } as any)

      const filterClauses: any[] = mockClient.search.mock.calls[0][0].body.query.bool.filter
      const genreClause = filterClauses.find((c: any) => c.term?.genre !== undefined)
      expect(genreClause).toBeDefined()
      expect(genreClause.term.genre).toBe('sci-fi')
    })
  })

  // ── Pagination ──────────────────────────────────────────────────────────────
  describe('pagination', () => {
    it('calculates from=0 for page 1', async () => {
      const mockClient = buildMockClient()
      const adapter = createOpenSearchAdapter({ client: mockClient })

      await adapter.search({ page: 1, pageSize: 10, term: 'a' } as any)

      const callArg = mockClient.search.mock.calls[0][0]
      expect(callArg.body.from).toBe(0)
      expect(callArg.body.size).toBe(10)
    })

    it('calculates correct from for page > 1', async () => {
      const mockClient = buildMockClient()
      const adapter = createOpenSearchAdapter({ client: mockClient })

      await adapter.search({ page: 3, pageSize: 10, term: 'a' } as any)

      // (3 - 1) * 10 = 20
      expect(mockClient.search.mock.calls[0][0].body.from).toBe(20)
    })

    it('returns page and pageSize in the result', async () => {
      const mockClient = buildMockClient()
      const adapter = createOpenSearchAdapter({ client: mockClient })

      const result = await adapter.search({ page: 2, pageSize: 5, term: 'a' } as any)

      expect(result.page).toBe(2)
      expect(result.pageSize).toBe(5)
    })

    it('defaults to page 1 and pageSize 10 when not specified', async () => {
      const mockClient = buildMockClient()
      const adapter = createOpenSearchAdapter({ client: mockClient })

      const result = await adapter.search({ term: 'test' } as any)

      expect(result.page).toBe(1)
      expect(result.pageSize).toBe(10)
    })

    it('falls back to query.limit as pageSize', async () => {
      const mockClient = buildMockClient()
      const adapter = createOpenSearchAdapter({ client: mockClient })

      const result = await adapter.search({ limit: 25 } as any)

      expect(result.pageSize).toBe(25)
    })
  })
})
