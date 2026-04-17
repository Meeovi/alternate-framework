import {
  normalizeDirectusReadOptions,
  normalizeDirectusResult,
  normalizeDirectusWritePayload,
} from '@mframework/adapter-directus'

export default function useAdapterRequest() {
  const nuxtApp = typeof useNuxtApp === 'function' ? useNuxtApp() : (globalThis as any).__nuxtApp || {}

  function resolveAdapter() {
    return (nuxtApp as any)?.$adapter
      || (nuxtApp as any)?.$contentClient
      || (nuxtApp as any)?.$meeoviAdapter
      || (globalThis as any).__adapter
      || null
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
      // Legacy fallback for deployments still exposing /content.
      return await $fetch('/content', {
        method: 'POST',
        body: {
          operation,
          ...payload,
        },
      })
    }
  }

  async function readItems(collection: string, opts?: any) {
    const adapter = resolveAdapter()
    const normalizedOpts = normalizeDirectusReadOptions(opts)
    if (adapter && typeof adapter.readItems === 'function') {
      return normalizeDirectusResult(await adapter.readItems(collection, normalizedOpts))
    }
    try {
      return normalizeDirectusResult(await requestContent('readItems', { collection, opts: normalizedOpts }))
    } catch (_) {
      return []
    }
  }

  async function readItem(collection: string, id: string | number, opts?: any) {
    const adapter = resolveAdapter()
    const normalizedOpts = normalizeDirectusReadOptions(opts)
    if (adapter && typeof adapter.readItem === 'function') {
      return normalizeDirectusResult(await adapter.readItem(collection, id, normalizedOpts))
    }
    try {
      return normalizeDirectusResult(await requestContent('readItem', { collection, id, opts: normalizedOpts }))
    } catch (_) {
      return null
    }
  }

  async function readFieldsByCollection(collection: string, opts?: any) {
    const adapter = resolveAdapter()
    const normalizedOpts = normalizeDirectusReadOptions(opts)
    if (adapter && typeof adapter.readFieldsByCollection === 'function') {
      return await adapter.readFieldsByCollection(collection, normalizedOpts)
    }
    try {
      return await requestContent('readFieldsByCollection', { collection, opts: normalizedOpts })
    } catch (_) {
      return []
    }
  }

  async function createItem(collection: string, payload: any) {
    const adapter = resolveAdapter()
    const normalizedPayload = normalizeDirectusWritePayload(payload)
    if (adapter && typeof adapter.createItem === 'function') {
      return normalizeDirectusResult(await adapter.createItem(collection, normalizedPayload))
    }
    try {
      return normalizeDirectusResult(await requestContent('createItem', { collection, data: normalizedPayload }))
    } catch (_) {
      return null
    }
  }

  async function updateItem(collection: string, id: any, payload?: any) {
    const adapter = resolveAdapter()
    const normalizedPayload = normalizeDirectusWritePayload(payload)
    if (adapter && typeof adapter.updateItem === 'function') {
      return normalizeDirectusResult(await adapter.updateItem(collection, id, normalizedPayload))
    }
    try {
      return normalizeDirectusResult(await requestContent('updateItem', { collection, id, data: normalizedPayload }))
    } catch (_) {
      return null
    }
  }

  async function deleteItem(collection: string, id: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.deleteItem === 'function') {
      return await adapter.deleteItem(collection, id)
    }
    try {
      return await requestContent('deleteItem', { collection, id })
    } catch (_) {
      return null
    }
  }

  async function uploadFiles(files: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.uploadFiles === 'function') {
      return adapter.uploadFiles(files)
    }
    return null
  }

  function getAssetUrl(file: any) {
    const adapter = resolveAdapter()
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
