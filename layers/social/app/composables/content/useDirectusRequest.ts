declare function useNuxtApp(): any

export default function useDirectusRequest() {
  const nuxt = typeof useNuxtApp === 'function' ? useNuxtApp() as any : (globalThis as any).__nuxtApp || {}

  function _toast(message: string) {
    try {
      const toast = nuxt?.$toast || (globalThis as any).__toast
      if (toast && typeof toast.error === 'function') toast.error(message)
    } catch (_) {}
  }

  function resolveSdkContent() {
    return nuxt?.$sdk?.content || null
  }

  async function request(config: any) {
    try {
      const sdkContent = resolveSdkContent()
      if (sdkContent && typeof sdkContent.request === 'function') return await sdkContent.request(config)

      _toast('Data client unavailable')
      throw new Error('Data client.request is not available')
    } catch (e) {
      _toast('Request failed')
      throw e
    }
  }

  async function readItems(collection: string, opts?: any) {
    const sdkContent = resolveSdkContent()
    if (sdkContent && typeof sdkContent.readItems === 'function') return await sdkContent.readItems(collection, opts)

    _toast('readItems not available')
    throw new Error('readItems not available')
  }

  async function readItem(collection: string, id: string, opts?: any) {
    const sdkContent = resolveSdkContent()
    if (sdkContent && typeof sdkContent.readItem === 'function') return await sdkContent.readItem(collection, id, opts)

    _toast('readItem not available')
    throw new Error('readItem not available')
  }

  async function readFieldsByCollection(collection: string, opts?: any) {
    const sdkContent = resolveSdkContent()
    if (sdkContent && typeof sdkContent.readFieldsByCollection === 'function') return await sdkContent.readFieldsByCollection(collection, opts)

    _toast('readFieldsByCollection not available')
    throw new Error('readFieldsByCollection not available')
  }

  async function deleteItem(collection: string, id: string) {
    const sdkContent = resolveSdkContent()
    if (sdkContent && typeof sdkContent.deleteItem === 'function') return await sdkContent.deleteItem(collection, id)

    _toast('deleteItem not available')
    throw new Error('deleteItem not available')
  }

  async function createItem(collection: string, data: any) {
    const sdkContent = resolveSdkContent()
    if (sdkContent && typeof sdkContent.createItem === 'function') return await sdkContent.createItem(collection, data)

    _toast('createItem not available')
    throw new Error('createItem not available')
  }

  async function updateItem(collection: string, idOrFilter: any, data: any) {
    const sdkContent = resolveSdkContent()
    if (sdkContent && typeof sdkContent.updateItem === 'function') return await sdkContent.updateItem(collection, idOrFilter, data)

    _toast('updateItem not available')
    throw new Error('updateItem not available')
  }

  async function uploadFiles(formData: FormData) {
    const sdkContent = resolveSdkContent()
    if (sdkContent && typeof sdkContent.uploadFiles === 'function') return await sdkContent.uploadFiles(formData)

    _toast('uploadFiles not available')
    throw new Error('uploadFiles not available')
  }

  async function getAssetUrl(file: any) {
    const sdkMedia = nuxt?.$sdk?.media
    if (sdkMedia && typeof sdkMedia.getAssetUrl === 'function') return sdkMedia.getAssetUrl(file)
    return ''
  }

  return { request, readItems, readItem, readFieldsByCollection, createItem, updateItem, deleteItem, uploadFiles, getAssetUrl }
}
