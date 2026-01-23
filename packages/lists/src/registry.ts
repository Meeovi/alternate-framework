import type { ListsProvider } from './types'

const providers: Record<string, ListsProvider> = {}

export function registerListsProvider(name: string, provider: ListsProvider) {
  providers[name] = provider
}

export function getListsProvider(name: string): ListsProvider {
  const provider = providers[name]
  if (!provider) throw new Error(`Lists provider "${name}" not found`)
  return provider
}