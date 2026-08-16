import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { CommerceBackendRegistry, registerCommerceBackendAdapter } from 'alternate-sdk'
import type { CommerceBackendAdapter } from 'alternate-sdk'

// Regression coverage for a real bug found and fixed this session: the
// registry was only ever populated from a Vue app plugin (addPlugin),
// invisible to Nitro-only server routes that build their own Directus
// client via getDirectusFacade() — those routes always silently fell
// through to real Directus regardless of the configured backend. See
// packages/adapters/adapter-magento/src/runtime/server/commerce-link.ts
// for the fix (a real addServerPlugin-based registration).
describe('CommerceBackendRegistry', () => {
  it('returns undefined for a backend that was never registered', () => {
    expect(CommerceBackendRegistry.get('never-registered-backend')).toBeUndefined()
  })

  it('makes a registered adapter retrievable by its id', () => {
    const adapter: CommerceBackendAdapter = {
      id: 'test-backend',
      collections: ['products'],
      isEnabled: () => true,
      request: vi.fn(),
    }

    registerCommerceBackendAdapter(adapter)

    expect(CommerceBackendRegistry.get('test-backend')).toBe(adapter)
  })

  it('get() with no name returns undefined rather than any registered adapter', () => {
    registerCommerceBackendAdapter({
      id: 'some-backend',
      collections: [],
      isEnabled: () => true,
      request: vi.fn(),
    })

    expect(CommerceBackendRegistry.get(undefined)).toBeUndefined()
  })

  it('registering a second adapter under the same id replaces the first', () => {
    const first: CommerceBackendAdapter = { id: 'dup', collections: ['a'], isEnabled: () => true, request: vi.fn() }
    const second: CommerceBackendAdapter = { id: 'dup', collections: ['b'], isEnabled: () => true, request: vi.fn() }

    registerCommerceBackendAdapter(first)
    registerCommerceBackendAdapter(second)

    expect(CommerceBackendRegistry.get('dup')).toBe(second)
  })
})

describe('getDirectusFacade routing (server/utils/directusClient.ts)', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.resetModules()
    process.env.DIRECTUS_URL = 'https://directus.example.com'
    process.env.NUXTUS_DIRECTUS_STATIC_TOKEN = 'test-token'
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  async function loadFacadeWithBackend(commerceBackend: string) {
    vi.doMock('#imports', () => ({
      useRuntimeConfig: () => ({ public: { commerceBackend } }),
    }))

    const realRequest = vi.fn().mockResolvedValue({ real: true })
    vi.doMock('@directus/sdk', () => ({
      createDirectus: () => ({
        with: () => ({
          with: () => ({ request: realRequest }),
        }),
      }),
      rest: () => (client: any) => client,
      staticToken: () => (client: any) => client,
    }))

    const { getDirectusFacade } = await import('../../server/utils/directusClient')
    return { getDirectusFacade, realRequest }
  }

  it('routes an in-scope GET to the registered adapter when a non-directus backend is active', async () => {
    const { getDirectusFacade, realRequest } = await loadFacadeWithBackend('magento')
    const { CommerceBackendRegistry: Registry } = await import('alternate-sdk')

    const adapterRequest = vi.fn().mockResolvedValue([{ id: 1, name: 'Real Product' }])
    Registry.register({
      id: 'magento',
      collections: ['products'],
      isEnabled: () => true,
      request: adapterRequest,
    })

    const facade = getDirectusFacade()
    const result = await facade.request(() => ({ path: '/items/products', method: 'GET', params: { limit: 10 } }))

    expect(adapterRequest).toHaveBeenCalledWith({ method: 'GET', collection: 'products', key: undefined, params: { limit: 10 } })
    expect(realRequest).not.toHaveBeenCalled()
    expect(result).toEqual([{ id: 1, name: 'Real Product' }])
  })

  it('falls through to real Directus when the active backend is "directus"', async () => {
    const { getDirectusFacade, realRequest } = await loadFacadeWithBackend('directus')

    const facade = getDirectusFacade()
    await facade.request(() => ({ path: '/items/products', method: 'GET' }))

    expect(realRequest).toHaveBeenCalledOnce()
  })

  it('falls through to real Directus for a collection the active adapter does not declare', async () => {
    const { getDirectusFacade, realRequest } = await loadFacadeWithBackend('magento')
    const { CommerceBackendRegistry: Registry } = await import('alternate-sdk')

    Registry.register({
      id: 'magento',
      collections: ['products'], // deliberately does not include 'brands'
      isEnabled: () => true,
      request: vi.fn(),
    })

    const facade = getDirectusFacade()
    await facade.request(() => ({ path: '/items/brands', method: 'GET' }))

    expect(realRequest).toHaveBeenCalledOnce()
  })

  it('never routes a write (non-GET) to the adapter, even for an in-scope collection', async () => {
    const { getDirectusFacade, realRequest } = await loadFacadeWithBackend('magento')
    const { CommerceBackendRegistry: Registry } = await import('alternate-sdk')

    const adapterRequest = vi.fn()
    Registry.register({
      id: 'magento',
      collections: ['products'],
      isEnabled: () => true,
      request: adapterRequest,
    })

    const facade = getDirectusFacade()
    await facade.request(() => ({ path: '/items/products', method: 'POST', body: { name: 'New' } }))

    expect(adapterRequest).not.toHaveBeenCalled()
    expect(realRequest).toHaveBeenCalledOnce()
  })
})
