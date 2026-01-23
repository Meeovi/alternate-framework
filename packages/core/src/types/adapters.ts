import type { SearchAdapter } from '../adapters/search'
import type { CatalogAdapter } from '../adapters/catalog'
import type { CartAdapter } from '../adapters/cart'
import type { AuthAdapter } from '../adapters/auth' // when you add it

export interface AlternateAdapterMap {
  search: SearchAdapter
  catalog: CatalogAdapter
  cart: CartAdapter
  auth: AuthAdapter
  // modules can extend this via declaration merging
}

export type AlternateAdapterKey = keyof AlternateAdapterMap
export type AlternateAdapterOf<K extends AlternateAdapterKey> = AlternateAdapterMap[K]