export function useDataRequest() {
  const nuxtApp = useNuxtApp() as any
  const client = nuxtApp?.$dataClient || null

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
    return file?.url || file?.src || ''
  }

  return {
    readItems,
    readItem,
    getAssetUrl,
  }
}

export default useDataRequest
