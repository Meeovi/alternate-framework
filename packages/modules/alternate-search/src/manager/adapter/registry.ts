// manager/adapter/registry.ts
import type { MeeoviSearchAdapter } from './types'

const registry = new Map<string, MeeoviSearchAdapter>()

export function registerSearchAdapter(index: string, adapter: MeeoviSearchAdapter) {
  registry.set(index, adapter)
}

export function getSearchAdapter(index: string) {
  return registry.get(index)
}

export function getAllSearchAdapters() {
  return Array.from(registry.entries())
}
