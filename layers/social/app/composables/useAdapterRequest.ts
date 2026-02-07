export default function useAdapterRequest() {
  const nuxtApp = (globalThis as any).__nuxtApp || {}

  const adapter = nuxtApp?.$adapter || (globalThis as any).__adapter || null
  const directus = nuxtApp?.$directus || (globalThis as any).__directus || null
  let _directusHelper: any = null

  async function getDirectusHelper() {
    if (_directusHelper) return _directusHelper
    try {
      const mod = await import('../../../shared/app/composables/useDirectusRequest')
      _directusHelper = mod.default()
      return _directusHelper
    } catch (err) {
      return null
    }
  }

  async function readItems(collection: string, opts?: any) {
    if (adapter && typeof adapter.readItems === 'function') return adapter.readItems(collection, opts)
    if (directus) {
      const dh = await getDirectusHelper()
      if (dh && typeof dh.readItems === 'function') return dh.readItems(collection, opts)
    }
    return []
  }

  async function readItem(collection: string, id: string | number, opts?: any) {
    if (adapter && typeof adapter.readItem === 'function') return adapter.readItem(collection, id, opts)
    if (directus) {
      const dh = await getDirectusHelper()
      if (dh && typeof dh.readItem === 'function') return dh.readItem(collection, id, opts)
    }
    return null
  }

  async function readFieldsByCollection(collection: string) {
    if (adapter && typeof adapter.readFieldsByCollection === 'function') return adapter.readFieldsByCollection(collection)
    if (directus) {
      const dh = await getDirectusHelper()
      if (dh && typeof dh.readFieldsByCollection === 'function') return dh.readFieldsByCollection(collection)
    }
    return []
  }

  async function createItem(collection: string, payload: any) {
    if (adapter && typeof adapter.createItem === 'function') return adapter.createItem(collection, payload)
    if (directus) {
      const dh = await getDirectusHelper()
      if (dh && typeof dh.createItem === 'function') return dh.createItem(collection, payload)
    }
    return null
  }

  async function updateItem(collection: string, id: any, payload?: any) {
    if (adapter && typeof adapter.updateItem === 'function') return adapter.updateItem(collection, id, payload)
    if (directus) {
      const dh = await getDirectusHelper()
      if (dh && typeof dh.updateItem === 'function') return dh.updateItem(collection, id, payload)
    }
    return null
  }

  async function deleteItem(collection: string, id: any) {
    if (adapter && typeof adapter.deleteItem === 'function') return adapter.deleteItem(collection, id)
    if (directus) {
      const dh = await getDirectusHelper()
      if (dh && typeof dh.deleteItem === 'function') return dh.deleteItem(collection, id)
    }
    return null
  }

  async function uploadFiles(files: any) {
    if (adapter && typeof adapter.uploadFiles === 'function') return adapter.uploadFiles(files)
    if (directus) {
      const dh = await getDirectusHelper()
      if (dh && typeof dh.uploadFiles === 'function') return dh.uploadFiles(files)
    }
    return null
  }

  function getAssetUrl(file: any) {
    if (!file) return ''
    if (adapter && typeof adapter.getAssetUrl === 'function') return adapter.getAssetUrl(file)
    if (directus) {
      const base = directus.url || (globalThis as any).__directus?.url || ''
      return `${base}assets/${file?.filename_disk || file}`
    }
    return file?.url || ''
  }

  return {
    readItems,
    readItem,
    readFieldsByCollection,
    createItem,
    updateItem,
    deleteItem,
    uploadFiles,
    getAssetUrl
  }
}
