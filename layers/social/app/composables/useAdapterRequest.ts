export default function useAdapterRequest() {
  const nuxtApp = (globalThis as any).__nuxtApp || {}
  const adapter = nuxtApp?.$adapter || (globalThis as any).__adapter || null

  async function readItems(collection: string, opts?: any) {
    if (adapter && typeof adapter.readItems === 'function') {
      return adapter.readItems(collection, opts)
    }
    return []
  }

  async function readItem(collection: string, id: string | number, opts?: any) {
    if (adapter && typeof adapter.readItem === 'function') {
      return adapter.readItem(collection, id, opts)
    }
    return null
  }

  async function readFieldsByCollection(collection: string) {
    if (adapter && typeof adapter.readFieldsByCollection === 'function') {
      return adapter.readFieldsByCollection(collection)
    }
    return []
  }

  async function createItem(collection: string, payload: any) {
    if (adapter && typeof adapter.createItem === 'function') {
      return adapter.createItem(collection, payload)
    }
    return null
  }

  async function updateItem(collection: string, id: any, payload?: any) {
    if (adapter && typeof adapter.updateItem === 'function') {
      return adapter.updateItem(collection, id, payload)
    }
    return null
  }

  async function deleteItem(collection: string, id: any) {
    if (adapter && typeof adapter.deleteItem === 'function') {
      return adapter.deleteItem(collection, id)
    }
    return null
  }

  async function uploadFiles(files: any) {
    if (adapter && typeof adapter.uploadFiles === 'function') {
      return adapter.uploadFiles(files)
    }
    return null
  }

  function getAssetUrl(file: any) {
    if (!file) return ''
    if (adapter && typeof adapter.getAssetUrl === 'function') {
      return adapter.getAssetUrl(file)
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
