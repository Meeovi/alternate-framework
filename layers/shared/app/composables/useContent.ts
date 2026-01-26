import { getContentProvider } from './registry'
import { useRuntimeConfig } from '#imports'

export function useContent() {
  const config = useRuntimeConfig()
  const providerName = config.public.contentProvider || 'directus'
  const provider = getContentProvider(providerName)

  return {
    getContent: provider.getContent,
    listContent: provider.listContent
  }
}
