import type { BaseAdapter } from '../adapters/common'

export function validateAdapterShape(adapter: BaseAdapter, domain: string) {
  if (!adapter.id) {
    throw new Error(`[@meeovi/core] ${domain} adapter is missing "id"`)
  }
  if (!adapter.type) {
    throw new Error(`[@meeovi/core] ${domain} adapter is missing "type"`)
  }
}