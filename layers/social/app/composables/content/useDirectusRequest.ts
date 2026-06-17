declare function useNuxtApp(): any

/**
 * Adapter-aware request helpers.
 * Prefer runtime adapter injected on the Nuxt app (e.g. `nuxt.$adapter`).
 * If not present, fall back to runtime `globalThis.__directus` or Nuxt helpers
 * exposed at runtime (e.g. `$readItems`, `$createItem`). This avoids static
 * imports of Directus SDK at build time.
 */
export default function useDirectusRequest() {
  const nuxt = typeof useNuxtApp === 'function' ? useNuxtApp() as any : (globalThis as any).__nuxtApp || {}

  function _toast(message: string) {
    try {
      const toast = nuxt?.$toast || (globalThis as any).__toast
      if (toast && typeof toast.error === 'function') toast.error(message)
    } catch (_) {}
  }

  function resolveAdapter() {
    return nuxt?.$adapter || (globalThis as any).__adapter || null
  }

  function resolveDirectusClient() {
    // prefer Nuxt-injected $directus, then globalThis directus helpers
    return nuxt?.$directus || (globalThis as any).__directus || null
  }

  async function request(config: any) {
    try {
      const adapter = resolveAdapter()
      if (adapter && typeof adapter.request === 'function') return await adapter.request(config)

      const client = resolveDirectusClient()
      if (!client || typeof client.request !== 'function') {
        _toast('Data client unavailable')
        throw new Error('Data client.request is not available')
      }

      return await client.request(config)
    } catch (e) {
      _toast('Request failed')
      throw e
    }
  }

  async function readItems(collection: string, opts?: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.readItems === 'function') return await adapter.readItems(collection, opts)

    const client = resolveDirectusClient()
    const builder = nuxt?.$readItems || (globalThis as any).__readItems
    if (client && typeof client.request === 'function' && typeof builder === 'function') {
      return await client.request(builder(collection, opts))
    }

    _toast('readItems not available')
    throw new Error('readItems not available')
  }

  async function readItem(collection: string, id: string, opts?: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.readItem === 'function') return await adapter.readItem(collection, id, opts)

    const client = resolveDirectusClient()
    const builder = nuxt?.$readItem || (globalThis as any).__readItem
    if (client && typeof client.request === 'function' && typeof builder === 'function') {
      return await client.request(builder(collection, id, opts))
    }

    _toast('readItem not available')
    throw new Error('readItem not available')
  }

  async function readFieldsByCollection(collection: string, opts?: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.readFieldsByCollection === 'function') return await adapter.readFieldsByCollection(collection, opts)

    const client = resolveDirectusClient()
    const builder = nuxt?.$readFieldsByCollection || (globalThis as any).__readFieldsByCollection
    if (client && typeof client.request === 'function' && typeof builder === 'function') {
      return await client.request(builder(collection, opts))
    }

    _toast('readFieldsByCollection not available')
    throw new Error('readFieldsByCollection not available')
  }

  async function deleteItem(collection: string, id: string) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.deleteItem === 'function') return await adapter.deleteItem(collection, id)

    const client = resolveDirectusClient()
    const builder = nuxt?.$deleteItem || (globalThis as any).__deleteItem
    if (client && typeof client.request === 'function' && typeof builder === 'function') {
      return await client.request(builder(collection, id))
    }

    _toast('deleteItem not available')
    throw new Error('deleteItem not available')
  }

  async function createItem(collection: string, data: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.createItem === 'function') return await adapter.createItem(collection, data)

    const client = resolveDirectusClient()
    const builder = nuxt?.$createItem || (globalThis as any).__createItem
    if (client && typeof client.request === 'function' && typeof builder === 'function') {
      return await client.request(builder(collection, data))
    }

    _toast('createItem not available')
    throw new Error('createItem not available')
  }

  async function updateItem(collection: string, idOrFilter: any, data: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.updateItem === 'function') return await adapter.updateItem(collection, idOrFilter, data)

    const client = resolveDirectusClient()
    const builder = nuxt?.$updateItem || (globalThis as any).__updateItem
    if (client && typeof client.request === 'function' && typeof builder === 'function') {
      return await client.request(builder(collection, idOrFilter, data))
    }

    _toast('updateItem not available')
    throw new Error('updateItem not available')
  }

  async function uploadFiles(formData: FormData) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.uploadFiles === 'function') return await adapter.uploadFiles(formData)

    const client = resolveDirectusClient()
    const builder = nuxt?.$uploadFiles || (globalThis as any).__uploadFiles
    if (client && typeof client.request === 'function' && typeof builder === 'function') {
      return await client.request(builder(formData))
    }

    _toast('uploadFiles not available')
    throw new Error('uploadFiles not available')
  }

  return { request, readItems, readItem, readFieldsByCollection, createItem, updateItem, deleteItem, uploadFiles }
}