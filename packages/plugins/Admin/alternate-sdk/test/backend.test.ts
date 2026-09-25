import { describe, it, expect, vi, beforeAll } from 'vitest'
import { backend, executeDataSource, getGatewayAdapter, createAdapterFromEnv } from '../src/runtime/backend'

const mockFetch = vi.fn()

beforeAll(() => {
  global.fetch = mockFetch
})

describe('backend gateway integration', () => {
  it.skip('createAdapterFromEnv parses MESH_SOURCE_ env variables', () => {
    // Gateway adapter removed: @mframework/adapter-gateway no longer exists.
  })

  it.skip('getGatewayAdapter uses DIRECTUS_URL when available', () => {
    // Gateway adapter removed: @mframework/adapter-gateway no longer exists.
  })

  it.skip('backend.readItems returns correct structure', () => {
    // Gateway adapter removed: @mframework/adapter-gateway no longer exists.
  })

  it.skip('backend.readItem returns correct structure', () => {
    // Gateway adapter removed: @mframework/adapter-gateway no longer exists.
  })

  it.skip('backend.createItem calls POST method', () => {
    // Gateway adapter removed: @mframework/adapter-gateway no longer exists.
  })

  it.skip('backend.updateItem calls PATCH method', () => {
    // Gateway adapter removed: @mframework/adapter-gateway no longer exists.
  })

  it.skip('backend.deleteItem calls DELETE method', () => {
    // Gateway adapter removed: @mframework/adapter-gateway no longer exists.
  })

  it.skip('executeDataSource uses correct source name', () => {
    // Gateway adapter removed: @mframework/adapter-gateway no longer exists.
  })
})
