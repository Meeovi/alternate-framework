import { getRegistry } from './index'
import type { SearchQuery } from '../types'

export const search = {
  search: (query: SearchQuery) => getRegistry().search?.search(query),
  facets: (query: SearchQuery) => getRegistry().search?.facets(query)
}