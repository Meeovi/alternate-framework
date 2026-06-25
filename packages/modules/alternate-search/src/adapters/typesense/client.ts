export type TypesenseFieldType =
  | 'string'
  | 'string[]'
  | 'float'
  | 'float[]'
  | 'bool'

export type TypesenseField = {
  name: string
  type: TypesenseFieldType
  facet?: boolean
  optional?: boolean
  index?: boolean
  sort?: boolean
  num_dim?: number
}

type TypesenseCollectionPayload = {
  name: string
  fields: TypesenseField[]
  default_sorting_field?: string
  enable_nested_fields?: boolean
}

type TypesenseImportOptions = {
  action?: 'create' | 'upsert'
}

type TypesenseSearchParams = {
  query_by: string
  filter_by?: string
  sort_by?: string
  facet_by?: string
  max_facet_values?: number
  page?: number
  per_page?: number
  highlight_fields?: string
  highlight_start_tag?: string
  highlight_end_tag?: string
  vector_query?: string
  prefix?: boolean
  num_typos?: number
}

type TypesenseDeleteByFilterResult = {
  num_deleted?: number
}

type TypesenseCollectionStats = {
  num_documents?: number
}

type TypesenseFacetCount = {
  field_name: string
  counts?: Array<{ value: string | number | boolean; count: number }>
  stats?: { min?: number; max?: number; avg?: number; sum?: number }
}

type TypesenseHit = {
  document: Record<string, unknown>
  highlights?: Array<{ field: string; snippet: string; snippets?: string[] }>
}

export type TypesenseSearchResponse = {
  hits?: TypesenseHit[]
  found?: number
  search_time_ms?: number
  facet_counts?: TypesenseFacetCount[]
}

export type TypesenseClient = {
  createCollection(payload: TypesenseCollectionPayload): Promise<unknown>
  importDocuments(indexName: string, docs: Array<Record<string, unknown>>, options?: TypesenseImportOptions): Promise<unknown>
  search(indexName: string, params: TypesenseSearchParams): Promise<TypesenseSearchResponse>
  deleteDocument(indexName: string, id: string): Promise<unknown>
  deleteByFilter(indexName: string, filterBy: string): Promise<TypesenseDeleteByFilterResult>
  getCollection(indexName: string): Promise<TypesenseCollectionStats>
}

export function createTypesenseClient(host: string, apiKey: string): TypesenseClient {
  const root = host.replace(/\/$/, '')

  async function request<T>(path: string, init: RequestInit): Promise<T> {
    const res = await fetch(`${root}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        'X-TYPESENSE-API-KEY': apiKey,
        ...(init.headers || {}),
      },
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Typesense request failed (${res.status}): ${text}`)
    }

    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('application/json'))
      return undefined as T

    return res.json() as Promise<T>
  }

  return {
    createCollection(payload) {
      return request('/collections', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },

    importDocuments(indexName, docs, options) {
      const action = options?.action || 'upsert'
      return request(`/collections/${encodeURIComponent(indexName)}/documents/import?action=${encodeURIComponent(action)}`, {
        method: 'POST',
        body: docs.map(doc => JSON.stringify(doc)).join('\n'),
        headers: {
          'Content-Type': 'text/plain',
        },
      })
    },

    search(indexName, params) {
      const query = new URLSearchParams()
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null)
          query.set(key, String(value))
      }
      return request(`/collections/${encodeURIComponent(indexName)}/documents/search?${query.toString()}`, {
        method: 'GET',
      })
    },

    deleteDocument(indexName, id) {
      return request(`/collections/${encodeURIComponent(indexName)}/documents/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
    },

    deleteByFilter(indexName, filterBy) {
      return request(`/collections/${encodeURIComponent(indexName)}/documents?filter_by=${encodeURIComponent(filterBy)}`, {
        method: 'DELETE',
      })
    },

    getCollection(indexName) {
      return request(`/collections/${encodeURIComponent(indexName)}`, {
        method: 'GET',
      })
    },
  }
}
