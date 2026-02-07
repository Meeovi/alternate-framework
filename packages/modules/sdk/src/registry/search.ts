import { SearchQuery } from '@mframework/core'
import { getRegistry } from './index'

export const search = {
  search: (query: SearchQuery) => getRegistry().search?.search(query),
  facets: (query: SearchQuery) => getRegistry().search?.facets(query)
}