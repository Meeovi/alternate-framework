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
    const directus = nuxt?.$directus || (globalThis as any).__directus
    const readItemsOp = nuxt?.$readItems || directus?.readItems
    const readItemOp = nuxt?.$readItem || directus?.readItem
    const readFieldsByCollectionOp = nuxt?.$readFieldsByCollection || directus?.readFieldsByCollection
    const createItemOp = nuxt?.$createItem || directus?.createItem
    const updateItemOp = nuxt?.$updateItem || directus?.updateItem
    const deleteItemOp = nuxt?.$deleteItem || directus?.deleteItem
    const uploadFilesOp = nuxt?.$uploadFiles || directus?.uploadFiles

    const sdkAdapter = directus && typeof directus.request === 'function' ? {
      request: (query: any) => directus.request(query),
      readItems: (collection: string, opts?: any) => {
        if (typeof readItemsOp !== 'function') throw new Error('readItems op unavailable')
        return directus.request(readItemsOp(collection, opts))
      },
      readItem: (collection: string, id: string | number, opts?: any) => {
        if (typeof readItemOp !== 'function') throw new Error('readItem op unavailable')
        return directus.request(readItemOp(collection, id, opts))
      },
      readFieldsByCollection: (collection: string, opts?: any) => {
        if (typeof readFieldsByCollectionOp !== 'function') throw new Error('readFieldsByCollection op unavailable')
        return directus.request(readFieldsByCollectionOp(collection, opts))
      },
      createItem: (collection: string, data: any) => {
        if (typeof createItemOp !== 'function') throw new Error('createItem op unavailable')
        return directus.request(createItemOp(collection, data))
      },
      updateItem: (collection: string, idOrFilter: any, data: any) => {
        if (typeof updateItemOp !== 'function') throw new Error('updateItem op unavailable')
        return directus.request(updateItemOp(collection, idOrFilter, data))
      },
      deleteItem: (collection: string, id: string | number) => {
        if (typeof deleteItemOp !== 'function') throw new Error('deleteItem op unavailable')
        return directus.request(deleteItemOp(collection, id))
      },
      uploadFiles: (formData: FormData) => {
        if (typeof uploadFilesOp !== 'function') throw new Error('uploadFiles op unavailable')
        return directus.request(uploadFilesOp(formData))
      },
    } : null

    return nuxt?.$adapter || nuxt?.$contentClient || (globalThis as any).__adapter || sdkAdapter || null
  }

  async function requestContent(operation: string, payload: Record<string, any>) {
    try {
      return await $fetch('/api/content', {
        method: 'POST',
        body: {
          operation,
          ...payload,
        },
      })
    } catch (_error) {
      return await $fetch('/content', {
        method: 'POST',
        body: {
          operation,
          ...payload,
        },
      })
    }
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
    try {
      if (adapter && typeof adapter.readItems === 'function') return await adapter.readItems(collection, opts)
      return await requestContent('readItems', { collection, opts })
    } catch (error) {
      _toast('readItems not available')
      throw error
    }
  }

  async function readItem(collection: string, id: string | number, opts?: any) {
    const adapter = resolveAdapter()
    try {
      if (adapter && typeof adapter.readItem === 'function') return await adapter.readItem(collection, id, opts)
      return await requestContent('readItem', { collection, id, opts })
    } catch (error) {
      _toast('readItem not available')
      throw error
    }
  }

  async function readFieldsByCollection(collection: string, opts?: any) {
    const adapter = resolveAdapter()
    try {
      if (adapter && typeof adapter.readFieldsByCollection === 'function') return await adapter.readFieldsByCollection(collection, opts)
      return await requestContent('readFieldsByCollection', { collection, opts })
    } catch (error) {
      _toast('readFieldsByCollection not available')
      throw error
    }
  }

  async function deleteItem(collection: string, id: string) {
    const adapter = resolveAdapter()
    try {
      if (adapter && typeof adapter.deleteItem === 'function') return await adapter.deleteItem(collection, id)
      return await requestContent('deleteItem', { collection, id })
    } catch (error) {
      _toast('deleteItem not available')
      throw error
    }
  }

  async function createItem(collection: string, data: any) {
    const adapter = resolveAdapter()
    try {
      if (adapter && typeof adapter.createItem === 'function') return await adapter.createItem(collection, data)
      return await requestContent('createItem', { collection, data })
    } catch (error) {
      _toast('createItem not available')
      throw error
    }
  }

  async function updateItem(collection: string, idOrFilter: any, data: any) {
    const adapter = resolveAdapter()
    try {
      if (adapter && typeof adapter.updateItem === 'function') return await adapter.updateItem(collection, idOrFilter, data)
      return await requestContent('updateItem', { collection, id: idOrFilter, data })
    } catch (error) {
      _toast('updateItem not available')
      throw error
    }
  }

  async function uploadFiles(formData: FormData) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.uploadFiles === 'function') return await adapter.uploadFiles(formData)

    _toast('uploadFiles not available')
    throw new Error('uploadFiles not available')
  }

  return { request, readItems, readItem, readFieldsByCollection, createItem, updateItem, deleteItem, uploadFiles }
}
