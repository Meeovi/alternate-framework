import { getContentProvider } from './registry'
import useContentRequest from './useContentRequest'
declare function useRuntimeConfig(): any

export function useContent() {
  const config = useRuntimeConfig()
  const providerName = config.public.contentProvider || 'directus'
  const provider = getContentProvider(providerName)
  const requestApi = useContentRequest()

  return {
    getContent: provider.getContent,
    listContent: provider.listContent,
    request: requestApi.request,
    readItems: requestApi.readItems,
    readItem: requestApi.readItem,
    readFieldsByCollection: requestApi.readFieldsByCollection,
    createItem: requestApi.createItem,
    updateItem: requestApi.updateItem,
    deleteItem: requestApi.deleteItem,
    uploadFiles: requestApi.uploadFiles,
    getAssetUrl: requestApi.getAssetUrl,
  }
}

export default useContent
