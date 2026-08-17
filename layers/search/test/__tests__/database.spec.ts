import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { mkdtempSync, rmSync } from 'node:fs'
import DatabaseCtor from 'better-sqlite3'

// A real file-backed SQLite database (not ':memory:', which is isolated
// per-connection) so this test's own setup connection and the provider's
// own internally-cached connection see the same data — the provider opens
// its own connection lazily and there's no way to inject a pre-built one.
const dir = mkdtempSync(join(tmpdir(), 'search-db-test-'))
const filePath = join(dir, 'test.sqlite')

const { config } = vi.hoisted(() => ({
  config: {
    enabled: true,
    filePath: '',
    table: 'products',
    idColumn: 'id',
    searchColumns: ['title', 'description'],
  },
}))
config.filePath = filePath

vi.mock('#imports', () => ({
  useRuntimeConfig: () => ({ searchProviders: { database: config } }),
}))

import { databaseProvider } from '../../server/providers/database'

const baseOptions = { query: '', page: 1, pageSize: 10 }

beforeAll(() => {
  const setup = new DatabaseCtor(filePath)
  setup.exec(`
    CREATE TABLE products (
      id INTEGER PRIMARY KEY,
      title TEXT,
      description TEXT,
      color TEXT,
      price REAL
    );
  `)
  const insert = setup.prepare('INSERT INTO products (id, title, description, color, price) VALUES (?, ?, ?, ?, ?)')
  insert.run(1, 'Blue Shirt', 'A comfortable cotton shirt', 'blue', 20)
  insert.run(2, 'Red Hat', 'A stylish hat', 'red', 15)
  insert.run(3, 'Blue Hat', 'A warm winter hat', 'blue', 25)
  setup.close()
})

afterAll(() => {
  rmSync(dir, { recursive: true, force: true })
})

describe('databaseProvider', () => {
  it('isEnabled reflects config.enabled', () => {
    expect(databaseProvider.isEnabled()).toBe(true)
    config.enabled = false
    expect(databaseProvider.isEnabled()).toBe(false)
    config.enabled = true
  })

  it('falls back to LIKE search when the table has no FTS5 index, and finds matches', async () => {
    const result = await databaseProvider.search({ ...baseOptions, query: 'shirt' })

    expect(result.items).toHaveLength(1)
    expect(result.items[0].id).toBe('1')
    expect(result.items[0].source.title).toBe('Blue Shirt')
  })

  it('LIKE search matches across all configured search columns', async () => {
    const result = await databaseProvider.search({ ...baseOptions, query: 'cotton' })
    expect(result.items.map((item) => item.id)).toEqual(['1'])
  })

  it('applies facetsRefinements as an IN filter', async () => {
    const result = await databaseProvider.search({
      ...baseOptions,
      query: '',
      filters: { facetsRefinements: { color: ['blue'] } },
    })

    expect(result.items.map((item) => item.id).sort()).toEqual(['1', '3'])
  })

  it('applies numericRefinements as a range filter', async () => {
    const result = await databaseProvider.search({
      ...baseOptions,
      query: '',
      filters: { numericRefinements: { price: { '>=': [18], '<=': [22] } } },
    })

    expect(result.items.map((item) => item.id)).toEqual(['1'])
  })

  it('honors an explicit sort', async () => {
    const result = await databaseProvider.search({
      ...baseOptions,
      query: '',
      sort: { field: 'price', direction: 'asc' },
    })

    expect(result.items.map((item) => item.id)).toEqual(['2', '1', '3'])
  })

  it('paginates using page/pageSize and reports the real total', async () => {
    const result = await databaseProvider.search({ ...baseOptions, query: '', page: 2, pageSize: 2 })

    expect(result.items).toHaveLength(1)
    expect(result.total).toBe(3)
  })

  it('builds facet buckets for requested fields', async () => {
    const result = await databaseProvider.search({ ...baseOptions, query: '', facets: ['color'] })

    expect(result.facets.color).toEqual(
      expect.arrayContaining([{ value: 'blue', count: 2 }, { value: 'red', count: 1 }]),
    )
  })

  it('searchFacetValues narrows buckets by a query substring', async () => {
    const buckets = await databaseProvider.searchFacetValues!('color', 'lu', { ...baseOptions, query: '' })
    expect(buckets).toEqual([{ value: 'blue', count: 2 }])
  })

  it('rejects a table/column name that is not a valid SQL identifier', async () => {
    config.table = 'products; DROP TABLE products;--'
    await expect(databaseProvider.search({ ...baseOptions, query: '' })).rejects.toThrow(/Invalid SQLite identifier/)
    config.table = 'products'
  })
})
