import { useRuntimeConfig } from './core/vue'
import useAdapterRequest from './core/useAdapterRequest'
import {
  createDirectusCompatClient,
  describeDirectusContentError,
} from '@mframework/adapter-directus'

type ContentErrorContext = {
  label?: string
}

export function useContentAdapter() {
  const adapter = useAdapterRequest()
  const runtimeConfig = useRuntimeConfig()
  const provider = String((runtimeConfig.public as any)?.meeoviProvider || 'content').toLowerCase()
  const directusUrl = String((runtimeConfig.public as any)?.directus?.url || '')

  function describeError(error: any, context: ContentErrorContext = {}) {
    const label = context.label || 'content'
    if (provider === 'directus') {
      return describeDirectusContentError(error, {
        label,
        directusUrl,
      })
    }

    const message = String(error?.data?.message || error?.statusMessage || error?.message || '').trim()
    return message ? `Unable to load ${label}: ${message}` : `Unable to load ${label}.`
  }

  async function readOne(collection: string, id: string | number, opts?: any) {
    const result = await adapter.readItem(collection, id, opts)
    return result?.data ?? result ?? null
  }

  async function readMany(collection: string, opts?: any) {
    const result = await adapter.readItems(collection, opts)
    return result?.data ?? result ?? []
  }

  const directusClient = createDirectusCompatClient({
    readMany,
    createItem: adapter.createItem,
    updateItem: adapter.updateItem,
    deleteItem: adapter.deleteItem,
    readOne,
  })

  return {
    ...adapter,
    provider,
    describeError,
    readOne,
    readMany,
    directusClient,
  }
}

export default useContentAdapter