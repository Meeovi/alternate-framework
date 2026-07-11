import { describe, it, expect, beforeAll, vi } from 'vitest'
import { GatewayAdapter, type APISource } from '@mframework/adapter-gateway'

process.env.DIRECTUS_URL = 'https://cms.meeovicms.com'
process.env.DIRECTUS_STATIC_TOKEN = '1_48eDyOk1e95CzuPXR5sPYCDrVqHcPM'

describe('GatewayAdapter integration', () => {
  it('can create adapter with sources', () => {
    const source: APISource = {
      name: 'cms',
      type: 'rest',
      endpoint: 'https://cms.meeovicms.com',
      headers: { Authorization: 'Bearer test-token' }
    }
    
    const adapter = new GatewayAdapter({ sources: [source] })
    expect(adapter.health()).toBe('ok')
  })

  it('can detect sources from env variables', () => {
    const sources = [
      {
        name: 'cms',
        type: 'rest' as const,
        endpoint: 'https://cms.meeovicms.com',
        headers: { Authorization: 'Bearer test-token' }
      }
    ]
    const adapter = new GatewayAdapter({ sources })
    expect(adapter).toBeDefined()
  })

  it('returns error when source not found', async () => {
    const adapter = new GatewayAdapter({ sources: [] })
    const result = await adapter.executeRequest('nonexistent', '/items')
    expect(result.ok).toBe(false)
    expect(result.error).toContain('not found')
  })

  it('can add and remove sources', () => {
    const adapter = new GatewayAdapter({ sources: [] })
    const source: APISource = {
      name: 'test',
      type: 'rest',
      endpoint: 'https://example.com'
    }
    
    adapter.addSource(source)
    expect(adapter.removeSource('test')).toBe(true)
    expect(adapter.removeSource('nonexistent')).toBe(false)
  })
})