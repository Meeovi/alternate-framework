import { ref } from 'vue'

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
    return value.flatMap((entry) => {
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
    normalized[key === 'file' ? 'directus_files_id' : key] = expandLegacyFields(entry)
  }
  return normalized
}

function resolveNuxtApp(): any {
  return typeof useNuxtApp === 'function' ? useNuxtApp() : (globalThis as any).__nuxtApp || {}
}

function resolveContentClient() {
  const nuxtApp = resolveNuxtApp()
  const gatewayFactory = (globalThis as any).useGateway as (() => any) | undefined

  try {
    if (typeof gatewayFactory === 'function') {
      const gateway = gatewayFactory()
      if (gateway?.content) return gateway.content
    }
  } catch {
    // ignore gateway resolution failures
  }

  return nuxtApp?.$contentClient
    || nuxtApp?.$dataClient
    || nuxtApp?.$adapter
    || nuxtApp?.$meeoviAdapter
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
  } catch {
    return await $fetch('/content', {
      method: 'POST',
      body: {
        operation,
        ...payload,
      },
    })
  }
}

export default function useContentRequest() {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const fetch = async (query: any) => {
    loading.value = true
    try {
      error.value = null

      if (query?.operation && typeof query.operation === 'string') {
        data.value = await requestContent(query.operation, query.payload || {})
        return data.value
      }

      if (query?.collection && query?.id != null) {
        data.value = await readItem(query.collection, query.id, query.options || query.opts)
        return data.value
      }

      if (query?.collection) {
        data.value = await readItems(query.collection, query.options || query.opts)
        return data.value
      }

      data.value = query ?? null
      return data.value
    } catch (err) {
      error.value = err as any
      throw err
    } finally {
      loading.value = false
    }
  }

  async function readItems(collection: string, opts?: any) {
    const client = resolveContentClient()
    const normalizedOpts = expandLegacyFields(opts)

    if (client && typeof client.readItems === 'function') {
      try {
        return normalizeResult(await client.readItems(collection, normalizedOpts))
      } catch {
        // fall through to endpoint fallback
      }
    }

    try {
      return normalizeResult(await requestContent('readItems', { collection, opts: normalizedOpts }))
    } catch {
      return []
    }
  }

  async function readItem(collection: string, id: string | number, opts?: any) {
    const client = resolveContentClient()
    const normalizedOpts = expandLegacyFields(opts)

    if (client && typeof client.readItem === 'function') {
      try {
        return normalizeResult(await client.readItem(collection, id, normalizedOpts))
      } catch {
        // fall through to endpoint fallback
      }
    }

    try {
      return normalizeResult(await requestContent('readItem', { collection, id, opts: normalizedOpts }))
    } catch {
      return null
    }
  }

  function getAssetUrl(file: any) {
    const client = resolveContentClient()
    if (!file) return ''
    if (typeof file === 'string') return file
    if (client && typeof client.getAssetUrl === 'function') {
      return client.getAssetUrl(file)
    }
    return file?.url || file?.src || file?.path || ''
  }

  return {
    data,
    loading,
    error,
    fetch,
    readItems,
    readItem,
    getAssetUrl,
  }
}