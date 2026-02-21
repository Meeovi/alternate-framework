import type { ContentAdapter } from '../types'

const providers: Record<string, ContentAdapter> = {}

export function registerContentProvider(name: string, provider: ContentAdapter) {
  providers[name] = provider
}

export function registerContentProviderRuntime(name: string, provider: ContentAdapter) {
  registerContentProvider(name, provider)
}

export function getContentProvider(name: string): ContentAdapter {
  const provider = providers[name]
  if (!provider) throw new Error(`Content provider "${name}" not found`)
  return provider
}

export default {
  registerContentProvider,
  registerContentProviderRuntime,
  getContentProvider
}
