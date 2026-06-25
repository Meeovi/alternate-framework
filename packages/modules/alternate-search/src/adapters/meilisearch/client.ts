type TaskStatus = 'enqueued' | 'processing' | 'succeeded' | 'failed'

type MeilisearchTask = {
  taskUid: number
  status?: TaskStatus
  error?: { message?: string }
}

type MeilisearchSearchParams = {
  limit?: number
  offset?: number
  filter?: string[]
  sort?: string[]
  facets?: string[]
  attributesToHighlight?: string[]
  highlightPreTag?: string
  highlightPostTag?: string
  vector?: number[]
  showRankingScore?: boolean
}

type MeilisearchSearchResponse = {
  hits: Array<Record<string, unknown> & { _formatted?: Record<string, string[]> }>
  totalHits?: number
  estimatedTotalHits?: number
  processingTimeMs?: number
  facetDistribution?: Record<string, Record<string, number>>
  facetStats?: Record<string, { min: number; max: number }>
}

type MeilisearchIndexStats = {
  numberOfDocuments: number
}

export type MeilisearchClient = {
  createIndex(indexName: string, payload: { primaryKey: string }): Promise<MeilisearchTask>
  updateSettings(indexName: string, payload: Record<string, unknown>): Promise<MeilisearchTask>
  addDocuments(indexName: string, docs: Array<Record<string, unknown>>): Promise<MeilisearchTask>
  search(indexName: string, query: string, params: MeilisearchSearchParams): Promise<MeilisearchSearchResponse>
  deleteDocument(indexName: string, id: string): Promise<MeilisearchTask>
  deleteDocumentsByFilter(indexName: string, filter: string): Promise<MeilisearchTask>
  getStats(indexName: string): Promise<MeilisearchIndexStats>
  waitForTask(taskUid: number): Promise<MeilisearchTask>
}

export function createMeilisearchClient(baseUrl: string, apiKey?: string): MeilisearchClient {
  const root = baseUrl.replace(/\/$/, '')

  async function request<T>(path: string, init: RequestInit): Promise<T> {
    const res = await fetch(`${root}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        ...(init.headers || {}),
      },
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Meilisearch request failed (${res.status}): ${text}`)
    }

    return res.json() as Promise<T>
  }

  return {
    createIndex(indexName, payload) {
      return request('/indexes', {
        method: 'POST',
        body: JSON.stringify({ uid: indexName, ...payload }),
      })
    },

    updateSettings(indexName, payload) {
      return request(`/indexes/${encodeURIComponent(indexName)}/settings`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
    },

    addDocuments(indexName, docs) {
      return request(`/indexes/${encodeURIComponent(indexName)}/documents`, {
        method: 'POST',
        body: JSON.stringify(docs),
      })
    },

    search(indexName, query, params) {
      return request(`/indexes/${encodeURIComponent(indexName)}/search`, {
        method: 'POST',
        body: JSON.stringify({ q: query, ...params }),
      })
    },

    deleteDocument(indexName, id) {
      return request(`/indexes/${encodeURIComponent(indexName)}/documents/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
    },

    deleteDocumentsByFilter(indexName, filter) {
      return request(`/indexes/${encodeURIComponent(indexName)}/documents/delete`, {
        method: 'POST',
        body: JSON.stringify({ filter }),
      })
    },

    getStats(indexName) {
      return request(`/indexes/${encodeURIComponent(indexName)}/stats`, {
        method: 'GET',
      })
    },

    async waitForTask(taskUid) {
      return request(`/tasks/${taskUid}`, { method: 'GET' })
    },
  }
}
