import type { SearchAdapter } from '../adapters/search'
import type { ListsAdapter } from '../adapters/lists'
import type { CatalogAdapter } from '../adapters/catalog'
import type { CartAdapter } from '../adapters/cart'
import type { AuthAdapter } from '../adapters/auth' // when you add it

export interface MFrameworkAdapterMap {
  search: SearchAdapter
  lists: ListsAdapter
  catalog: CatalogAdapter
  cart: CartAdapter
  auth: AuthAdapter
  // modules can extend this via declaration merging
}

export type MFrameworkAdapterKey = keyof MFrameworkAdapterMap
export type MFrameworkAdapterOf<K extends MFrameworkAdapterKey> = MFrameworkAdapterMap[K]