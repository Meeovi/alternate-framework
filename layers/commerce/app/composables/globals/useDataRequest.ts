export function useDataRequest() {
  const nuxtApp = useNuxtApp() as any
  const client = nuxtApp?.$contentClient
    || nuxtApp?.$adapter
    || nuxtApp?.$meeoviAdapter
    || null

  const readItems = async (collection: string, options: Record<string, any> = {}) => {
    if (client && typeof client.readItems === 'function') {
      return client.readItems(collection, options)
    }
    return []
  }

  const readItem = async (collection: string, id: string | number, options: Record<string, any> = {}) => {
    if (client && typeof client.readItem === 'function') {
      return client.readItem(collection, id, options)
    }
    return null
  }

  const getAssetUrl = (file: any) => {
    if (!file) return ''
    if (typeof file === 'string') return file
    if (client && typeof client.getAssetUrl === 'function') {
      return client.getAssetUrl(file)
    }
    return file?.url || file?.src || ''
  }

  return {
    readItems,
    readItem,
    getAssetUrl,
  }
}

export default useDataRequest
