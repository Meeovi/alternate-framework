import { getAssetURL } from '#shared/app/utils/get-asset-url'

export default function useDirectusRequest() {
  // Previously referenced a bare `nuxt` identifier that was never assigned
  // anywhere in this file — every call (resolveDirectusClient,
  // resolveBuilder, _toast) would throw ReferenceError at runtime.
  const nuxt = useNuxtApp() as any

  function _toast(message: string) {
    try {
      const toast = nuxt?.$toast || (globalThis as any).__toast
      if (toast && typeof toast.error === 'function') toast.error(message)
    } catch (_) {}
  }

  function resolveDirectusClient() {
    return nuxt?.$directus || (globalThis as any).__directus || null
  }

  function resolveBuilder(name: string) {
    return nuxt?.[`$${name}`] || (globalThis as any)[`__${name}`] || null
  }

  async function request(config: any) {
    try {
      const client = resolveDirectusClient()
      if (client && typeof client.request === 'function') {
        return await client.request(config)
      }
      _toast('Data client unavailable')
      throw new Error('Data client.request is not available')
    } catch (e) {
      _toast('Request failed')
      throw e
    }
  }

  async function readItems(collection: string, opts?: any) {
    const client = resolveDirectusClient()
    const builder = resolveBuilder('readItems')
    if (client && typeof client.request === 'function' && typeof builder === 'function') {
      return await client.request(builder(collection, opts))
    }
    _toast('readItems not available')
    throw new Error('readItems not available')
  }

  async function readItem(collection: string, id: string, opts?: any) {
    const client = resolveDirectusClient()
    const builder = resolveBuilder('readItem')
    if (client && typeof client.request === 'function' && typeof builder === 'function') {
      return await client.request(builder(collection, id, opts))
    }
    _toast('readItem not available')
    throw new Error('readItem not available')
  }

  async function readFieldsByCollection(collection: string, opts?: any) {
    const client = resolveDirectusClient()
    const builder = resolveBuilder('readFieldsByCollection')
    if (client && typeof client.request === 'function' && typeof builder === 'function') {
      return await client.request(builder(collection, opts))
    }
    _toast('readFieldsByCollection not available')
    throw new Error('readFieldsByCollection not available')
  }

  async function deleteItem(collection: string, id: string) {
    const client = resolveDirectusClient()
    const builder = resolveBuilder('deleteItem')
    if (client && typeof client.request === 'function' && typeof builder === 'function') {
      return await client.request(builder(collection, id))
    }
    _toast('deleteItem not available')
    throw new Error('deleteItem not available')
  }

  async function createItem(collection: string, data: any) {
    const client = resolveDirectusClient()
    const builder = resolveBuilder('createItem')
    if (client && typeof client.request === 'function' && typeof builder === 'function') {
      return await client.request(builder(collection, data))
    }
    _toast('createItem not available')
    throw new Error('createItem not available')
  }

  async function updateItem(collection: string, idOrFilter: any, data: any) {
    const client = resolveDirectusClient()
    const builder = resolveBuilder('updateItem')
    if (client && typeof client.request === 'function' && typeof builder === 'function') {
      return await client.request(builder(collection, idOrFilter, data))
    }
    _toast('updateItem not available')
    throw new Error('updateItem not available')
  }

  async function uploadFiles(formData: FormData) {
    const client = resolveDirectusClient()
    const builder = resolveBuilder('uploadFiles')
    if (client && typeof client.request === 'function' && typeof builder === 'function') {
      return await client.request(builder(formData))
    }
    _toast('uploadFiles not available')
    throw new Error('uploadFiles not available')
  }

  async function getAssetUrl(file: any) {
    const url = getAssetURL(file)
    return typeof url === 'string' ? url : ''
  }

  return { request, readItems, readItem, readFieldsByCollection, createItem, updateItem, deleteItem, uploadFiles, getAssetUrl }
}
