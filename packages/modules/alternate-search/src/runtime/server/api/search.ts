// runtime/server/api/search.ts
import { defineEventHandler, getQuery } from 'h3'
import { SearchManager } from '../../../manager/core/SearchManager'
import { getSearchAdapter } from '../../../manager/adapter/registry'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const index = String(query.index || 'all')

  const params = {
    index,
    q: String(query.q || ''),
    page: Number(query.page || 1),
    pageSize: Number(query.pageSize || 12),
    filters: {
      categories: query.categories ? String(query.categories).split(',') : [],
      brands: query.brands ? String(query.brands).split(',') : [],
      price: query.price ? String(query.price) : ''
    },
    sort: query.sort ? String(query.sort) : 'relevance'
  }

  // Federated search
  if (index === 'all') {
    const manager = new SearchManager(null as any)
    return await manager.searchAllAdapters(params)
  }

  // Single adapter search
  const adapter = getSearchAdapter(index)
  if (!adapter) throw new Error(`No adapter registered for index "${index}"`)

  const manager = new SearchManager(adapter)
  return await manager.searchWithParams(params)
})

