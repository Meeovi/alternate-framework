import { getContentProvider } from './registry'
declare function useRuntimeConfig(): any

export function useContent() {
  const config = useRuntimeConfig()
  const providerName = config.public.contentProvider || 'directus'
  const provider = getContentProvider(providerName)

  return {
    getContent: provider.getContent,
    listContent: provider.listContent
  }
}
