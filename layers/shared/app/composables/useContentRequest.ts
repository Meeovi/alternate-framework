// Restored from dist/app/composables/useContentRequest.js
// This composable bridges Nuxt app with the active content adapter.

export default function useContentRequest() {
  const nuxt = typeof useNuxtApp === 'function' ? useNuxtApp() : (globalThis as any).__nuxtApp || {}

  function normalizeResult(value: any): any {
    if (Array.isArray(value)) return value.map(normalizeResult)
    if (!value || typeof value !== 'object') return value
    const normalized: Record<string, any> = {}
    for (const [key, entry] of Object.entries(value)) {
      normalized[key] = normalizeResult(entry)
    }
    if (normalized.directus_files_id && !normalized.file) {
      normalized.file = normalized.directus_files_id
    }
    return normalized
  }

  function expandLegacyFields(value: any): any {
    if (Array.isArray(value)) {
      return value.flatMap((entry: any) => {
        const expanded = expandLegacyFields(entry)
        return Array.isArray(expanded) ? expanded : [expanded]
      })
    }
    if (!value || typeof value !== 'object') {
      if (typeof value === 'string' && value.includes('file')) {
        const legacyValue = value.replace(/(^|\.)file(\.|$)/g, '$1directus_files_id$2')
        return legacyValue === value ? value : [value, legacyValue]
      }
      return value
    }
    const normalized: Record<string, any> = {}
    for (const [key, entry] of Object.entries(value)) {
      const nextKey = key === 'file' ? 'directus_files_id' : key
      normalized[nextKey] = expandLegacyFields(entry)
    }
    return normalized
  }

  function normalizeOptions(opts: any) {
    if (!opts) return opts
    return expandLegacyFields(opts)
  }

  function normalizePayload(data: any): any {
    if (Array.isArray(data)) return data.map(normalizePayload)
    if (!data || typeof data !== 'object') return data
    const normalized: Record<string, any> = {}
    for (const [key, entry] of Object.entries(data)) {
      const nextKey = key === 'file' ? 'directus_files_id' : key
      normalized[nextKey] = normalizePayload(entry)
    }
    return normalized
  }

  function notifyFailure(message: string) {
    try {
      const alert = (useNuxtApp() as any).$alert
      if (alert?.error) alert.error(message)
    } catch (_) {}
  }

  function resolveAdapter() {
    return (nuxt as any)?.$adapter
      || (nuxt as any)?.$contentClient
      || (nuxt as any)?.$meeoviAdapter
      || (globalThis as any).__adapter
      || null
  }

  async function request(config: any) {
    try {
      const adapter = resolveAdapter()
      if (adapter && typeof adapter.request === 'function') return await adapter.request(config)
      notifyFailure('Content client unavailable')
      throw new Error('Content client.request is not available')
    } catch (error) {
      notifyFailure('Request failed')
      throw error
    }
  }

  async function readItems(collection: string, opts?: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.readItems === 'function')
      return normalizeResult(await adapter.readItems(collection, normalizeOptions(opts)))
    notifyFailure('readItems not available')
    throw new Error('readItems not available')
  }

  async function readItem(collection: string, id: string, opts?: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.readItem === 'function')
      return normalizeResult(await adapter.readItem(collection, id, normalizeOptions(opts)))
    notifyFailure('readItem not available')
    throw new Error('readItem not available')
  }

  async function readFieldsByCollection(collection: string, opts?: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.readFieldsByCollection === 'function')
      return await adapter.readFieldsByCollection(collection, opts)
    notifyFailure('readFieldsByCollection not available')
    throw new Error('readFieldsByCollection not available')
  }

  async function createItem(collection: string, data: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.createItem === 'function')
      return normalizeResult(await adapter.createItem(collection, normalizePayload(data)))
    notifyFailure('createItem not available')
    throw new Error('createItem not available')
  }

  async function updateItem(collection: string, idOrFilter: any, data: any) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.updateItem === 'function')
      return normalizeResult(await adapter.updateItem(collection, idOrFilter, normalizePayload(data)))
    notifyFailure('updateItem not available')
    throw new Error('updateItem not available')
  }

  async function deleteItem(collection: string, id: string) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.deleteItem === 'function')
      return await adapter.deleteItem(collection, id)
    notifyFailure('deleteItem not available')
    throw new Error('deleteItem not available')
  }

  async function uploadFiles(formData: FormData) {
    const adapter = resolveAdapter()
    if (adapter && typeof adapter.uploadFiles === 'function')
      return await adapter.uploadFiles(formData)
    notifyFailure('uploadFiles not available')
    throw new Error('uploadFiles not available')
  }

  function getAssetUrl(file: any) {
    const adapter = resolveAdapter()
    if (!file) return ''
    if (adapter && typeof adapter.getAssetUrl === 'function') return adapter.getAssetUrl(file)
    return file?.url || ''
  }

  return {
    request,
    readItems,
    readItem,
    readFieldsByCollection,
    createItem,
    updateItem,
    deleteItem,
    uploadFiles,
    getAssetUrl,
  }
}
