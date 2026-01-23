import type { BaseAdapter } from '../adapters/common'

export function defineAlternateAdapter<T extends BaseAdapter<any>>(adapter: T): T {
  return adapter
}