import { ref } from 'vue'

// Normalize provider-specific media relation fields to a stable UI contract.
// UI consumers should read `file`, not adapter-specific keys.
function applyFileAlias(normalized: Record<string, any>) {
  if (normalized.directus_files_id && !normalized.file) {
    normalized.file = normalized.directus_files_id
  }
  if (normalized.data_files_id && !normalized.file) {
    normalized.file = normalized.data_files_id
  }
}

function normalizeResult(value: any): any {
  if (Array.isArray(value)) return value.map(normalizeResult)
  if (!value || typeof value !== 'object') return value

  const normalized: Record<string, any> = {}
  for (const [key, entry] of Object.entries(value)) {
    normalized[key] = normalizeResult(entry)
  }

  applyFileAlias(normalized)

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

function resolveContentClient() {
  const nuxtApp = useNuxtApp()
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
        const result = await requestContent(query.operation, query.payload || {})
        data.value = typeof result === 'undefined' ? null : (result === null ? null : (typeof result === 'object' && Object.keys(result).length === 0 ? null : result)) as any
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

  async function createItems(collection: string, items: any[], opts?: any) {
    const client = resolveContentClient()
    const normalizedItems = expandLegacyFields(items)
    const normalizedOpts = expandLegacyFields(opts)

    if (client && typeof client.createItems === 'function') {
      try {
        return normalizeResult(await client.createItems(collection, normalizedItems, normalizedOpts))
      } catch {
        // fall through to endpoint fallback
      }
    }

    if (client && typeof client.createItem === 'function') {
      try {
        const created = await Promise.all((normalizedItems || []).map((item: any) => client.createItem(collection, item, normalizedOpts)))
        return normalizeResult(created)
      } catch {
        // fall through to endpoint fallback
      }
    }

    try {
      return normalizeResult(await requestContent('createItems', { collection, items: normalizedItems, opts: normalizedOpts }))
    } catch {
      return []
    }
  }

  async function createItem(collection: string, item: any, opts?: any) {
    const client = resolveContentClient()
    const normalizedItem = expandLegacyFields(item)
    const normalizedOpts = expandLegacyFields(opts)

    if (client && typeof client.createItem === 'function') {
      try {
        return normalizeResult(await client.createItem(collection, normalizedItem, normalizedOpts))
      } catch {
        // fall through to endpoint fallback
      }
    }

    if (client && typeof client.createItems === 'function') {
      try {
        const created = await client.createItems(collection, [normalizedItem], normalizedOpts)
        return normalizeResult(Array.isArray(created) ? created[0] : created)
      } catch {
        // fall through to endpoint fallback
      }
    }

    try {
      return normalizeResult(await requestContent('createItem', { collection, item: normalizedItem, data: normalizedItem, opts: normalizedOpts }))
    } catch {
      return null
    }
  }

  async function updateItems(collection: string, idsOrItems: any, dataOrOpts?: any, maybeOpts?: any) {
    const client = resolveContentClient()
    const looksLikeBulkPayload = Array.isArray(idsOrItems) && (typeof dataOrOpts === 'undefined' || Array.isArray(dataOrOpts) || typeof dataOrOpts === 'object')

    const ids = looksLikeBulkPayload ? undefined : idsOrItems
    const items = looksLikeBulkPayload ? idsOrItems : undefined
    const data = looksLikeBulkPayload ? undefined : dataOrOpts
    const opts = looksLikeBulkPayload ? dataOrOpts : maybeOpts

    const normalizedItems = expandLegacyFields(items)
    const normalizedData = expandLegacyFields(data)
    const normalizedOpts = expandLegacyFields(opts)

    if (client && typeof client.updateItems === 'function') {
      try {
        if (typeof normalizedItems !== 'undefined') {
          return normalizeResult(await client.updateItems(collection, normalizedItems, normalizedOpts))
        }
        return normalizeResult(await client.updateItems(collection, ids, normalizedData, normalizedOpts))
      } catch {
        // fall through to endpoint fallback
      }
    }

    if (client && typeof client.updateItem === 'function' && Array.isArray(ids)) {
      try {
        const updated = await Promise.all(ids.map((id) => client.updateItem(collection, id, normalizedData, normalizedOpts)))
        return normalizeResult(updated)
      } catch {
        // fall through to endpoint fallback
      }
    }

    try {
      return normalizeResult(await requestContent('updateItems', {
        collection,
        ids,
        items: normalizedItems,
        data: normalizedData,
        opts: normalizedOpts,
      }))
    } catch {
      return []
    }
  }

  async function updateItem(collection: string, idOrFilter: any, data: any, opts?: any) {
    const client = resolveContentClient()
    const normalizedData = expandLegacyFields(data)
    const normalizedOpts = expandLegacyFields(opts)

    if (client && typeof client.updateItem === 'function') {
      try {
        return normalizeResult(await client.updateItem(collection, idOrFilter, normalizedData, normalizedOpts))
      } catch {
        // fall through to endpoint fallback
      }
    }

    if (client && typeof client.updateItems === 'function') {
      try {
        const updated = await client.updateItems(collection, [idOrFilter], normalizedData, normalizedOpts)
        return normalizeResult(Array.isArray(updated) ? updated[0] : updated)
      } catch {
        // fall through to endpoint fallback
      }
    }

    try {
      return normalizeResult(await requestContent('updateItem', { collection, id: idOrFilter, filter: idOrFilter, data: normalizedData, opts: normalizedOpts }))
    } catch {
      return null
    }
  }

  async function deleteItems(collection: string, ids: any, opts?: any) {
    const client = resolveContentClient()
    const normalizedOpts = expandLegacyFields(opts)

    if (client && typeof client.deleteItems === 'function') {
      try {
        return await client.deleteItems(collection, ids, normalizedOpts)
      } catch {
        // fall through to endpoint fallback
      }
    }

    if (client && typeof client.deleteItem === 'function' && Array.isArray(ids)) {
      try {
        await Promise.all(ids.map((id) => client.deleteItem(collection, id, normalizedOpts)))
        return true
      } catch {
        // fall through to endpoint fallback
      }
    }

    try {
      return await requestContent('deleteItems', { collection, ids, opts: normalizedOpts })
    } catch {
      return false
    }
  }

  async function deleteItem(collection: string, id: any, opts?: any) {
    const client = resolveContentClient()
    const normalizedOpts = expandLegacyFields(opts)

    if (client && typeof client.deleteItem === 'function') {
      try {
        return await client.deleteItem(collection, id, normalizedOpts)
      } catch {
        // fall through to endpoint fallback
      }
    }

    if (client && typeof client.deleteItems === 'function') {
      try {
        return await client.deleteItems(collection, [id], normalizedOpts)
      } catch {
        // fall through to endpoint fallback
      }
    }

    try {
      return await requestContent('deleteItem', { collection, id, opts: normalizedOpts })
    } catch {
      return false
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
    createItems,
    createItem,
    readItems,
    readItem,
    updateItems,
    updateItem,
    deleteItems,
    deleteItem,
    getAssetUrl,
  }
}