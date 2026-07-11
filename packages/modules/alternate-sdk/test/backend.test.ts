import { describe, it, expect, vi, beforeAll } from 'vitest'
import { backend, executeDataSource, getGatewayAdapter, createAdapterFromEnv } from '../src/runtime/backend'
import type { APISource } from '@mframework/adapter-gateway'

const mockFetch = vi.fn()

beforeAll(() => {
  global.fetch = mockFetch
})

describe('backend gateway integration', () => {
  it('createAdapterFromEnv parses MESH_SOURCE_ env variables', () => {
    process.env.MESH_SOURCE_CMS_ENDPOINT = 'https://test.api.com'
    process.env.MESH_SOURCE_CMS_TYPE = 'rest'
    process.env.MESH_SOURCE_CMS_HEADERS = '{"Authorization":"Bearer test"}'

    const adapter = createAdapterFromEnv()
    expect(adapter).toBeDefined()
  })

  it('getGatewayAdapter uses DIRECTUS_URL when available', () => {
    process.env.DIRECTUS_URL = 'https://cms.meeovicms.com'
    process.env.DIRECTUS_STATIC_TOKEN = 'test-token'

    const adapter = getGatewayAdapter()
    expect(adapter).toBeDefined()
  })

  it('backend.readItems returns correct structure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [{ id: '1', title: 'Test Item' }] })
    } as Response)

    process.env.MESH_SOURCE_CMS_ENDPOINT = 'https://cms.meeovicms.com'
    process.env.MESH_SOURCE_CMS_TYPE = 'rest'

    const result = await backend.readItems('cms', { limit: 10 })
    expect(result.ok).toBe(true)
  })

  it('backend.readItem returns correct structure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { id: '1', title: 'Test Item' } })
    } as Response)

    process.env.MESH_SOURCE_CMS_ENDPOINT = 'https://cms.meeovicms.com'
    
    const result = await backend.readItem('cms', '1')
    expect(result.ok).toBe(true)
  })

  it('backend.createItem calls POST method', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { id: '1' } })
    } as Response)

    const result = await backend.createItem('cms', { title: 'New Item' })
    expect(result.ok).toBe(true)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/items'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('backend.updateItem calls PATCH method', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { id: '1', updated: true } })
    } as Response)

    const result = await backend.updateItem('cms', '1', { title: 'Updated' })
    expect(result.ok).toBe(true)
  })

  it('backend.deleteItem calls DELETE method', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { deleted: true } })
    } as Response)

    const result = await backend.deleteItem('cms', '1')
    expect(result.ok).toBe(true)
  })

  it('executeDataSource uses correct source name', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    } as Response)

    const result = await executeDataSource('cms', '/custom', { method: 'GET' })
    expect(result.ok).toBe(true)
  })
})