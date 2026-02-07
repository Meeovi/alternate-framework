import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig() as any
  const endpoint: string | undefined = config.search?.endpoint || process.env.SEARCH_ENDPOINT
  const indexName: string = config.search?.indexName || process.env.SEARCH_INDEX_NAME || 'default'

  // Simple helpers that consumers may rely on
  const helpers = {
    mapAggregations(aggs: any) {
      return aggs || {}
    },
    async semanticRerank(hits: any[], _query: string) {
      // no-op rerank: return input
      return hits
    },
  }

  // HTTP-backed ES-compatible client when endpoint is configured
  const httpClient = endpoint
    ? {
        async search(requests: Array<any>) {
          const base = endpoint.replace(/\/+$/, '')
          return Promise.all(
            requests.map(async (req: any) => {
              const idx = req.indexName || indexName
              // Build a basic ES query body from params
              let body: any = {}

              // If params contains q/size/from, map to simple query_string
              if (req.params) {
                const p = req.params
                const q = (p.q || (p.params && p.params.q)) || '*'
                const size = p.size || (p.params && p.params.size) || 10
                const from = p.from || 0
                if (!req.body) body = {}
                if (q && q !== '*') {
                  body.query = { query_string: { query: q } }
                } else if (!req.body) {
                  body.query = { match_all: {} }
                }
                body.size = size
                body.from = from
              }

              if (req.body) {
                body = { ...body, ...req.body }
              }

              // fetch with retries and exponential backoff
              async function fetchWithRetry(url: string, init: RequestInit, retries = 2, backoff = 200): Promise<any> {
                try {
                  const res = await fetch(url, init)
                  if (!res.ok) {
                    const text = await res.text().catch(() => '')
                    if (retries > 0) {
                      await new Promise((r) => setTimeout(r, backoff))
                      return fetchWithRetry(url, init, retries - 1, backoff * 2)
                    }
                    return { hits: [], error: `HTTP ${res.status}: ${text}` }
                  }
                  return await res.json()
                } catch (err) {
                  if (retries > 0) {
                    await new Promise((r) => setTimeout(r, backoff))
                    return fetchWithRetry(url, init, retries - 1, backoff * 2)
                  }
                  return { hits: [], error: String(err) }
                }
              }

              const resJson = await fetchWithRetry(`${base}/${encodeURIComponent(idx)}/_search`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(body),
              })
              // Ensure a consistent shape on error
              if (!resJson) return { hits: [] }
              return resJson
            })
          )
        },
      }
    : null

  // In-memory fallback client for environments without an endpoint
  const stubClient = {
    async search(requests: Array<any>) {
      return requests.map((req: any) => {
        const q = (req.params && (req.params.q || (req.params.params && req.params.params.q))) || '*'
        const hits = [
          { _source: { title: q && q !== '*' ? `Result for ${q}` : 'Sample result', description: 'Stubbed result' } },
        ]
        return { hits: { hits }, aggregations: {}, nbHits: hits.length }
      })
    },
  }

  const client = httpClient || stubClient

  return {
    provide: {
      $searchClient: client,
      $searchIndexName: indexName,
      $searchHelpers: helpers,
    },
  }
})
