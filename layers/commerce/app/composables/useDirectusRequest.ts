declare function useNuxtApp(): any
import useNotification from './useNotification'

export default function useDirectusRequest() {
  const nuxt = typeof useNuxtApp === 'function' ? useNuxtApp() as any : (globalThis as any).__nuxtApp || {}

  function resolveAdapter() {
    return nuxt?.$adapter || nuxt?.$contentClient || nuxt?.$meeoviAdapter || (globalThis as any).__adapter || null
  }

  function notifyFailure(message: string) {
    try {
      const { show } = useNotification()
      show({ type: 'error', message })
    } catch (_) {}
  }

  async function request(config: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.request === 'function') return await adapter.request(config)
    notifyFailure('Content client.request is not available')
    throw new Error('Content client.request is not available')
  }

  async function readItems(collection: string, opts?: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.readItems === 'function') return await adapter.readItems(collection, opts)
    notifyFailure('readItems not available')
    throw new Error('readItems not available')
  }

  async function readItem(collection: string, id: string | number, opts?: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.readItem === 'function') return await adapter.readItem(collection, id, opts)
    notifyFailure('readItem not available')
    throw new Error('readItem not available')
  }

  async function readFieldsByCollection(collection: string, opts?: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.readFieldsByCollection === 'function') return await adapter.readFieldsByCollection(collection, opts)
    notifyFailure('readFieldsByCollection not available')
    throw new Error('readFieldsByCollection not available')
  }

  async function createItem(collection: string, data: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.createItem === 'function') return await adapter.createItem(collection, data)
    notifyFailure('createItem not available')
    throw new Error('createItem not available')
  }

  async function updateItem(collection: string, idOrFilter: any, data: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.updateItem === 'function') return await adapter.updateItem(collection, idOrFilter, data)
    notifyFailure('updateItem not available')
    throw new Error('updateItem not available')
  }

  async function deleteItem(collection: string, id: string | number) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.deleteItem === 'function') return await adapter.deleteItem(collection, id)
    notifyFailure('deleteItem not available')
    throw new Error('deleteItem not available')
  }

  async function uploadFiles(formData: FormData) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.uploadFiles === 'function') return await adapter.uploadFiles(formData)
    notifyFailure('uploadFiles not available')
    throw new Error('uploadFiles not available')
  }

  function getAssetUrl(file: any) {
    const adapter = resolveAdapter()
    if (!file) return ''
    if (adapter && typeof adapter.getAssetUrl === 'function') return adapter.getAssetUrl(file)
    return file?.url || ''
  }

  return { request, readItems, readItem, readFieldsByCollection, createItem, updateItem, deleteItem, uploadFiles, getAssetUrl }
}
