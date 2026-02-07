import { describe, it, expect, vi } from 'vitest'
import { createOpenSearchAdapter } from '../src/adapter'

describe('createOpenSearchAdapter', () => {
  it('transforms opensearch hits into SearchResult shape', async () => {
    const mockClient = {
      search: vi.fn().mockResolvedValue({
        body: {
          hits: {
            hits: [
              { _id: '1', _source: { title: 'Alpha' } },
              { _id: '2', _source: { title: 'Beta' } }
            ],
            total: { value: 2 }
          }
        }
      })
    }

    const adapter = createOpenSearchAdapter({ index: 'test-index', client: mockClient })

    const res = await adapter.search({ q: 'alpha' } as any)

    expect(res).toBeDefined()
    expect(res.items).toHaveLength(2)
    expect(res.items[0].title).toBe('Alpha')
    expect(res.total).toBe(2)
    expect(mockClient.search).toHaveBeenCalled()
  })
})
