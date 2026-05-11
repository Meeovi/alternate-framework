import type { SearchAdapter as CoreSearchAdapter, SearchAdapterConfig } from 'alternate-gateway/adapters/search'
import type {
  SearchQuery as CoreSearchQuery,
  SearchResult as CoreSearchResult,
  Facet,
  Result
} from 'alternate-gateway/types'
import { client } from './client'

export interface OpenSearchAdapterOptions {
  id?: string
  index?: string
  client?: any
}

export function createOpenSearchAdapter(opts: OpenSearchAdapterOptions = {}): CoreSearchAdapter<Record<string, unknown>> {
  const id = opts.id || 'adapter-opensearch'
  const indexName = opts.index || process.env.ALTERNATE_SEARCH_INDEX || 'movies'
  const _client = opts.client || client

  const adapter: CoreSearchAdapter<Record<string, unknown>> = {
    id,
    type: 'search',
    config: { provider: 'opensearch' } satisfies SearchAdapterConfig,

    async search(query: CoreSearchQuery) {
      const page = (query as any).page && (query as any).page > 0 ? (query as any).page : 1
      const pageSize = ((query as any).pageSize && (query as any).pageSize > 0
        ? (query as any).pageSize
        : ((query as any).limit && (query as any).limit > 0 ? (query as any).limit : 10))
      const from = (page - 1) * pageSize

      const body: any = {}

      const term = (query as any).term ?? (query as any).q ?? ''

      if (term) {
        body.query = {
          multi_match: {
            query: term,
            fields: ['title^3', 'name^2', 'description', '*']
          }
        }
      } else if ((query as any).filters) {
        body.query = { bool: { filter: [] } }
        for (const [k, v] of Object.entries((query as any).filters)) {
          (body.query.bool.filter as any[]).push({ term: { [k]: v as any } })
        }
      } else {
        body.query = { match_all: {} }
      }

      if (typeof from === 'number') body.from = from
      if (typeof pageSize === 'number') body.size = pageSize

      const resp = await _client.search({ index: indexName, body })

      const hits = resp?.body?.hits?.hits || []
      const total = resp?.body?.hits?.total
      const totalCount = typeof total === 'object' ? total.value ?? total : total ?? 0

      const items = hits.map((h: any) => ({ ...(h._source || {}), id: h._id }))

      const result: CoreSearchResult<Record<string, unknown>> = {
        items,
        total: totalCount,
        page,
        pageSize
      }

      return result
    },

    async facets(_query: CoreSearchQuery): Promise<Result<Facet[]>> {
      return {
        ok: true,
        data: []
      }
    }
  }

  return adapter
}

export default createOpenSearchAdapter
