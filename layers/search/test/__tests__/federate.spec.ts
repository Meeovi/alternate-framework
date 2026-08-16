import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NormalizedHit, ProviderSearchResult, SearchProviderOptions } from '../../server/providers/types'

vi.mock('../../server/providers/opensearch', () => ({
  openSearchProvider: { id: 'opensearch', isEnabled: vi.fn(), search: vi.fn(), searchFacetValues: vi.fn() },
}))
vi.mock('../../server/providers/postgres', () => ({
  postgresProvider: { id: 'postgres', isEnabled: vi.fn(), search: vi.fn(), searchFacetValues: vi.fn() },
}))
vi.mock('../../server/providers/mysql', () => ({
  mysqlProvider: { id: 'mysql', isEnabled: vi.fn(), search: vi.fn() },
}))
vi.mock('../../server/providers/magento', () => ({
  magentoProvider: { id: 'magento', isEnabled: vi.fn(), search: vi.fn() },
}))

import { openSearchProvider } from '../../server/providers/opensearch'
import { postgresProvider } from '../../server/providers/postgres'
import { mysqlProvider } from '../../server/providers/mysql'
import { magentoProvider } from '../../server/providers/magento'
import { federatedSearch, federatedSearchFacetValues, getEnabledProviders } from '../../server/search/federate'

const baseOptions: SearchProviderOptions = { query: 'shirt', page: 1, pageSize: 10 }

function hit(id: string, score: number, source: Record<string, unknown> = {}): NormalizedHit {
  return { id, score, source }
}

function result(provider: string, items: NormalizedHit[], overrides: Partial<ProviderSearchResult> = {}): ProviderSearchResult {
  return { provider, items, total: items.length, facets: {}, tookMs: 5, ...overrides }
}

describe('federatedSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(openSearchProvider.isEnabled).mockReturnValue(true)
    vi.mocked(postgresProvider.isEnabled).mockReturnValue(true)
    vi.mocked(mysqlProvider.isEnabled).mockReturnValue(false)
    vi.mocked(magentoProvider.isEnabled).mockReturnValue(false)
  })

  it('getEnabledProviders only returns providers whose isEnabled() is true', () => {
    const enabled = getEnabledProviders().map((p) => p.id)
    expect(enabled).toEqual(['opensearch', 'postgres'])
  })

  it('a provider whose isEnabled() throws is treated as disabled, not a crash', () => {
    vi.mocked(openSearchProvider.isEnabled).mockImplementation(() => {
      throw new Error('config missing')
    })

    const enabled = getEnabledProviders().map((p) => p.id)
    expect(enabled).toEqual(['postgres'])
  })

  it('single enabled provider: uses its own order as-is, no score renormalization needed', async () => {
    vi.mocked(postgresProvider.isEnabled).mockReturnValue(false)
    vi.mocked(openSearchProvider.search).mockResolvedValue(
      result('opensearch', [hit('a', 5, { name: 'A' }), hit('b', 3, { name: 'B' })]),
    )

    const response = await federatedSearch(baseOptions)

    expect(response.items.map((i) => i.objectID)).toEqual(['opensearch:a', 'opensearch:b'])
    expect(response.backends).toEqual([{ provider: 'opensearch', ok: true, tookMs: 5 }])
  })

  it('multiple providers: normalizes each provider\'s scores independently before interleaving by normalized score', async () => {
    // opensearch's own scale (0-5) and postgres's own scale (0-1) are not
    // comparable — federatedSearch must normalize each provider's scores
    // to its own 0-1 range before merging, not compare raw scores directly.
    vi.mocked(openSearchProvider.search).mockResolvedValue(
      result('opensearch', [hit('os-high', 5), hit('os-low', 1)]),
    )
    vi.mocked(postgresProvider.search).mockResolvedValue(
      result('postgres', [hit('pg-high', 0.9), hit('pg-low', 0.1)]),
    )

    const response = await federatedSearch(baseOptions)

    // Both providers' top hit normalizes to 1.0 and both bottom hits to 0 —
    // ties broken by provider order, but both "high" items must sort before
    // both "low" items regardless of raw score scale.
    const ids = response.items.map((i) => i.objectID)
    const highIndex = Math.max(ids.indexOf('opensearch:os-high'), ids.indexOf('postgres:pg-high'))
    const lowIndex = Math.min(ids.indexOf('opensearch:os-low'), ids.indexOf('postgres:pg-low'))
    expect(highIndex).toBeLessThan(lowIndex)
  })

  it('a failed provider is excluded from results but reported in backends[], not thrown', async () => {
    vi.mocked(openSearchProvider.search).mockRejectedValue(new Error('connection refused'))
    vi.mocked(postgresProvider.search).mockResolvedValue(result('postgres', [hit('p1', 1)]))

    const response = await federatedSearch(baseOptions)

    expect(response.items).toHaveLength(1)
    expect(response.backends).toContainEqual(
      expect.objectContaining({ provider: 'opensearch', ok: false, error: 'connection refused' }),
    )
    expect(response.backends).toContainEqual({ provider: 'postgres', ok: true, tookMs: 5 })
  })

  it('when every provider fails, returns an empty result rather than throwing', async () => {
    vi.mocked(openSearchProvider.search).mockRejectedValue(new Error('down'))
    vi.mocked(postgresProvider.search).mockRejectedValue(new Error('down'))

    const response = await federatedSearch(baseOptions)

    expect(response.items).toEqual([])
    expect(response.total).toBe(0)
    expect(response.backends.every((b) => !b.ok)).toBe(true)
  })

  it('when no providers are enabled, returns an empty result immediately', async () => {
    vi.mocked(openSearchProvider.isEnabled).mockReturnValue(false)
    vi.mocked(postgresProvider.isEnabled).mockReturnValue(false)

    const response = await federatedSearch(baseOptions)

    expect(response.items).toEqual([])
    expect(response.backends).toEqual([])
    expect(openSearchProvider.search).not.toHaveBeenCalled()
  })

  it('an explicit sort option orders by the requested field instead of relevance score', async () => {
    vi.mocked(openSearchProvider.search).mockResolvedValue(
      result('opensearch', [hit('cheap', 1, { price: 10 }), hit('pricey', 5, { price: 100 })]),
    )
    vi.mocked(postgresProvider.isEnabled).mockReturnValue(false)

    const response = await federatedSearch({ ...baseOptions, sort: { field: 'price', direction: 'asc' } })

    // Relevance score (5 vs 1) would normally put "pricey" first — sort
    // must override that and order by price ascending instead.
    expect(response.items.map((i) => i.objectID)).toEqual(['opensearch:cheap', 'opensearch:pricey'])
  })

  it('total sums each successful provider\'s own total, not just the returned page size', async () => {
    vi.mocked(openSearchProvider.search).mockResolvedValue(result('opensearch', [hit('a', 1)], { total: 340 }))
    vi.mocked(postgresProvider.search).mockResolvedValue(result('postgres', [hit('b', 1)], { total: 12 }))

    const response = await federatedSearch(baseOptions)

    expect(response.total).toBe(352)
  })
})

describe('federatedSearchFacetValues', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(openSearchProvider.isEnabled).mockReturnValue(true)
    vi.mocked(postgresProvider.isEnabled).mockReturnValue(true)
    vi.mocked(mysqlProvider.isEnabled).mockReturnValue(false)
    vi.mocked(magentoProvider.isEnabled).mockReturnValue(false)
  })

  it('merges facet-value counts across providers that implement searchFacetValues, skipping those that don\'t', async () => {
    vi.mocked(openSearchProvider.searchFacetValues!).mockResolvedValue([{ value: 'red', count: 3 }])
    vi.mocked(postgresProvider.searchFacetValues!).mockResolvedValue([{ value: 'red', count: 2 }, { value: 'blue', count: 1 }])
    // mysqlProvider has no searchFacetValues at all — must be silently
    // skipped, not called or awaited.

    const buckets = await federatedSearchFacetValues('color', 're', baseOptions)

    expect(buckets).toEqual(
      expect.arrayContaining([
        { value: 'red', count: 5 },
        { value: 'blue', count: 1 },
      ]),
    )
  })
})
