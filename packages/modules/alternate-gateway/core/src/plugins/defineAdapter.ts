import type { BaseAdapter } from '../adapters/common'

export function defineMFrameworkAdapter<T extends BaseAdapter<any>>(adapter: T): T {
  return adapter
}