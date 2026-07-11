import { describe, it, expect, vi, beforeAll } from 'vitest'
import { GatewayAdapter, loadSourcesFromEnv, installGatewayAdapter } from '@mframework/adapter-gateway'

const mockFetch = vi.fn()

beforeAll(() => {
  global.fetch = mockFetch
})

describe('End-to-end gateway flow', () => {
  it('loads Directus configuration from meeovi-frontend .env', () => {
    // Simulate the .env configuration
    const env = {
      MESH_SOURCE_CMS_ENDPOINT: 'https://cms.meeovicms.com',
      MESH_SOURCE_CMS_TYPE: 'rest',
      MESH_SOURCE_CMS_HEADERS: '{"Authorization":"Bearer test-token"}',
      DIRECTUS_URL: 'https://cms.meeovicms.com',
      DIRECTUS_STATIC_TOKEN: 'test-token'
    }

    process.env = { ...process.env, ...env }

    const sources = loadSourcesFromEnv('MESH_SOURCE_')
    expect(sources.length).toBeGreaterThan(0)
    expect(sources[0].name).toBe('cms')
    expect(sources[0].endpoint).toBe('https://cms.meeovicms.com')
  })

  it('installGatewayAdapter creates working adapter', () => {
    const adapter = installGatewayAdapter({
      envPrefix: 'MESH_SOURCE_'
    })
    expect(adapter).toBeInstanceOf(GatewayAdapter)
    expect(adapter.health()).toBe('ok')
  })

  it('simulates fetching data from Directus via gateway adapter', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          { id: '1', title: 'Product A', price: 10 },
          { id: '2', title: 'Product B', price: 20 }
        ]
      })
    } as Response)

    const adapter = new GatewayAdapter({
      sources: [{
        name: 'cms',
        type: 'rest',
        endpoint: 'https://cms.meeovicms.com',
        headers: { Authorization: 'Bearer 1_48eDyOk1e95CzuPXR5sPYCDrVqHcPM' }
      }]
    })

    const result = await adapter.executeRequest('cms', '/items/products', {
      method: 'GET',
      query: { limit: 10, fields: ['id', 'title', 'price'] }
    })

    expect(result.ok).toBe(true)
    expect(mockFetch).toHaveBeenCalled()
    
    const [url, opts] = mockFetch.mock.calls[0]
    expect(opts.method).toBe('GET')
    expect(opts.headers.Authorization).toContain('Bearer')
  })

  it('handles different backend types through same interface', () => {
    // Test that the same interface works for different backends
    const backends = [
      { name: 'cms', endpoint: 'https://cms.meeovicms.com' },
      { name: 'api', endpoint: 'https://api.example.com' },
      { name: 'graphql', endpoint: 'https://gql.example.com/graphql' }
    ]

    backends.forEach((config) => {
      const adapter = new GatewayAdapter({
        sources: [{
          ...config,
          type: config.name === 'graphql' ? 'graphql' : 'rest'
        }]
      })
      expect(adapter).toBeDefined()
    })
  })
})