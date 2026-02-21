import { graphql, buildSchema } from 'graphql'
import type { SearchManager } from '../core/SearchManager'

const schema = buildSchema(`
  type Hit { id: ID, title: String, description: String, price: Float }
  type SearchResult {
    items: [Hit]
    total: Int
    page: Int
    pageSize: Int
  }
  type Query {
    search(term: String, page: Int, pageSize: Int, filters: String): SearchResult
  }
`)

function parseFilters(filters?: string) {
  if (!filters) return {}
  const entries = String(filters).split(' AND ').map((s) => s.split(':'))
  return Object.fromEntries(entries.map(([k, v]) => [k, v?.replace(/^"|"$/g, '')]))
}

export function createStorefrontGraphQLHandler(manager: SearchManager) {
  const root: any = {
    search: async ({ term, page, pageSize, filters }: any) => {
      manager.context.setQuery(term || '')
      manager.context.setPage(page || 1)
      manager.context.setPageSize(pageSize || manager.context.state.pageSize)
      if (filters) {
        manager.context.state.filters = parseFilters(filters) as any
      }

      const res = await manager.search()

      return {
        items: res.items,
        total: res.total,
        page: res.page,
        pageSize: res.pageSize,
      }
    },
  }

  return async function handler(req: any, res: any) {
    const { query, variables } = req.body || {}
    const result = await graphql({ schema, source: query, rootValue: root, variableValues: variables })
    res.json(result)
  }
}

export default createStorefrontGraphQLHandler
