// Restored from dist/app/composables/useContent.js

export interface ContentItem {
  id?: string
  [key: string]: any
}

export interface ContentProvider {
  getContent(slug: string): Promise<ContentItem>
  listContent(params?: Record<string, any>): Promise<ContentItem[]>
}

// Minimal default provider — adapters override via registerContentProvider().
const _defaultProvider: ContentProvider = {
  async getContent() { throw new Error('No content provider registered.') },
  async listContent() { throw new Error('No content provider registered.') },
}

const _providers: Record<string, ContentProvider> = {}

export function registerContentProvider(name: string, provider: ContentProvider): void {
  _providers[name] = provider
}

export function getContentProvider(name: string): ContentProvider {
  return _providers[name] ?? _defaultProvider
}

export function useContent() {
  const config = useRuntimeConfig()
  const providerName = (config.public as any).contentProvider || 'directus'
  const provider = getContentProvider(providerName)
  const requestApi = useSdkContentAdapter()
  return {
    getContent: provider.getContent.bind(provider),
    listContent: provider.listContent.bind(provider),
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
