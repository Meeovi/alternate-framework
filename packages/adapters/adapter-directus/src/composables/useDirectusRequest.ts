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

  async function request(config: any) {
    try {
      const adapter = resolveAdapter()
      if (adapter && typeof adapter.request === 'function') return await adapter.request(config)
      _toast('Data client unavailable')
      throw new Error('Data client.request is not available')
    } catch (e) {
      _toast('Request failed')
      throw e
    }
  }

  async function readItems(collection: string, opts?: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.readItems === 'function') return await adapter.readItems(collection, opts)

    _toast('readItems not available')
    throw new Error('readItems not available')
  }

  async function readItem(collection: string, id: string, opts?: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.readItem === 'function') return await adapter.readItem(collection, id, opts)

    _toast('readItem not available')
    throw new Error('readItem not available')
  }

  async function readFieldsByCollection(collection: string, opts?: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.readFieldsByCollection === 'function') return await adapter.readFieldsByCollection(collection, opts)

    _toast('readFieldsByCollection not available')
    throw new Error('readFieldsByCollection not available')
  }

  async function deleteItem(collection: string, id: string) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.deleteItem === 'function') return await adapter.deleteItem(collection, id)

    _toast('deleteItem not available')
    throw new Error('deleteItem not available')
  }

  async function createItem(collection: string, data: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.createItem === 'function') return await adapter.createItem(collection, data)

    _toast('createItem not available')
    throw new Error('createItem not available')
  }

  async function updateItem(collection: string, idOrFilter: any, data: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.updateItem === 'function') return await adapter.updateItem(collection, idOrFilter, data)

    _toast('updateItem not available')
    throw new Error('updateItem not available')
  }

  async function uploadFiles(formData: FormData) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.uploadFiles === 'function') return await adapter.uploadFiles(formData)

    _toast('uploadFiles not available')
    throw new Error('uploadFiles not available')
  }

  return { request, readItems, readItem, readFieldsByCollection, createItem, updateItem, deleteItem, uploadFiles }
}
