import type { MeeoviSearchItem } from './types'
import type { BuiltSearchQuery } from '../core/QueryBuilder'

export function createMockSearchAdapter(items: MeeoviSearchItem[] = []) {
  const cfg = { provider: 'mock' }

  const adapter = {
    id: 'search:mock',
    type: 'search',
    config: cfg,

    async search(query: BuiltSearchQuery | any) {
      const term = String((query && (query.term || query.params?.q)) || '')
      const filtered = items.filter((item) => item.title?.toLowerCase().includes(term.toLowerCase()))

      return {
        items: filtered,
        total: filtered.length,
        page: 1,
        pageSize: filtered.length
      }
    }
  }

  return adapter
}