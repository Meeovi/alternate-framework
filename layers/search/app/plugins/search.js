import { defineNuxtPlugin } from '#imports'
import { getSearchClient, getIndexName } from '../utils/search/client'

export default defineNuxtPlugin((nuxtApp) => {
  let searchClient
  let indexName
  try {
    searchClient = getSearchClient()
    indexName = getIndexName()
  } catch (e) {
    // fallback placeholder to avoid build/runtime crash when not configured
    // Provide a clearer validation message to help users wire env vars
    // eslint-disable-next-line no-console
    console.warn('Search client not configured:', e.message || e)
    // Helpful runtime guidance
    // eslint-disable-next-line no-console
    console.info('Search layer requires configuring SEARCHKIT_HOST or SEARCHKIT_HOSTNAME/SEARCHKIT_PORT (or their NUXT_PUBLIC_ variants). Example:')
    // eslint-disable-next-line no-console
    console.info('  SEARCHKIT_HOST=https://search.example.com')
    // eslint-disable-next-line no-console
    console.info('  or:')
    // eslint-disable-next-line no-console
    console.info('  SEARCHKIT_PROTOCOL=https')
    // eslint-disable-next-line no-console
    console.info('  SEARCHKIT_HOSTNAME=search.example.com')
    // eslint-disable-next-line no-console
    console.info('  SEARCHKIT_PORT=9200')
    searchClient = { _client: 'searchkit-fallback' }
    indexName = 'default'
  }

  // Helper: normalize aggregations/ facets into { name: buckets[] }
  function mapAggregations(aggs) {
    const mapped = {}
    if (!aggs) return mapped
    for (const key of Object.keys(aggs)) {
      const a = aggs[key]
      if (!a) continue
      if (Array.isArray(a)) mapped[key] = a
      else if (a.buckets) mapped[key] = a.buckets
      else if (a.terms) mapped[key] = a.terms
      else mapped[key] = a
    }
    return mapped
  }

  // Basic suggestion helper that performs a small search to return candidate documents
  async function suggest(q, opts = {}) {
    if (!searchClient || typeof searchClient.search !== 'function') return []
    const size = opts.size || 6
    const params = { params: { q: q || '*', size } }
    try {
      const resArr = await searchClient.search([{ indexName, ...params }])
      const res = resArr && resArr[0]
      const hits = (res && ((res.hits && res.hits.hits) || res.hits)) || []
      return Array.isArray(hits) ? hits.map((h) => (h._source ? h._source : h)) : []
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Suggest failed', e && e.message ? e.message : e)
      return []
    }
  }

  // Server-side semantic reranking: call embeddings API if configured, otherwise noop.
  // Expects an embeddings API that can accept { query, docs } and return either
  // { ranked: [ids...] } or { scores: [number...] } aligned with docs.
  async function semanticRerank(hitsArray, queryStr) {
    const url = process.env.NUXT_PUBLIC_EMBEDDINGS_API_URL || process.env.EMBEDDINGS_API_URL
    const key = process.env.NUXT_PUBLIC_EMBEDDINGS_API_KEY || process.env.EMBEDDINGS_API_KEY
    if (!url || !key) return hitsArray
    try {
      const docs = hitsArray.slice(0, 100).map((h) => ({ id: h._meta || h.id || h._id, text: h.title || h.name || h.description || '' }))
      const body = { query: queryStr, docs }
      const resp = await (globalThis.fetch || fetch)(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
        body: JSON.stringify(body),
      })
      if (!resp.ok) return hitsArray
      const json = await resp.json()
      if (Array.isArray(json.ranked)) {
        const idToHit = new Map(hitsArray.map((h) => [(h._meta || h.id || h._id), h]))
        const ordered = json.ranked.map((id) => idToHit.get(id)).filter(Boolean)
        const remaining = hitsArray.filter((h) => !ordered.includes(h))
        return [...ordered, ...remaining]
      }
      if (Array.isArray(json.scores)) {
        const paired = hitsArray.map((h, i) => ({ h, s: json.scores[i] ?? 0 }))
        paired.sort((a, b) => b.s - a.s)
        return paired.map((p) => p.h)
      }
      return hitsArray
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('semanticRerank failed', e && e.message ? e.message : e)
      return hitsArray
    }
  }

  nuxtApp.provide('searchClient', searchClient)
  nuxtApp.provide('searchIndexName', indexName)
  nuxtApp.provide('searchHelpers', { suggest, mapAggregations, semanticRerank })
})
