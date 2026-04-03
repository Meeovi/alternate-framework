import type { ContentProvider } from "./types"

const providers: Record<string, ContentProvider> = {}

export function registerContentProvider(name: string, provider: ContentProvider) {
  providers[name] = provider
}

export function getContentProvider(name: string) {
  const provider = providers[name]
  if (!provider) throw new Error(`Content provider "${name}" not found`)
  return provider
}
