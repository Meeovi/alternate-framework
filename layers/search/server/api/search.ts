import { searchOpenSearchIndex } from '../search/client'
// server/api/search.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const body = await readBody(event).catch(() => ({}))
  const searchString = String(query.q || body.q || '')
  const page = Math.max(1, Number(query.page || body.page || 1))
  const pageSize = Math.max(1, Number(query.pageSize || body.pageSize || 12))
  const facetFields = ['category', 'brand', 'type']
  const filters = body.instantsearchFilters || body.filters || undefined

  try {
    // Works dynamically using the runtime config properties
    const results = await searchOpenSearchIndex(searchString, ['title', 'description'], page, pageSize, facetFields, filters)
    const hits = results.body.hits.hits || []
    const total = typeof results.body.hits.total === 'object' && results.body.hits.total !== null && 'value' in results.body.hits.total
      ? (results.body.hits.total as { value: number }).value
      : hits.length

    const facets: Record<string, Record<string, number>> = {}
    for (const key of facetFields) {
      const bucket = results.body.aggregations?.[`${key}_terms`]
      if (bucket?.buckets?.length) {
        facets[key] = Object.fromEntries(
          bucket.buckets.map((b: any) => [b.key, b.doc_count]),
        )
      } else if (results.body.aggregations?.[key]?.buckets?.length) {
        facets[key] = Object.fromEntries(
          results.body.aggregations[key].buckets.map((b: any) => [b.key, b.doc_count]),
        )
      }
    }

    return {
      success: true,
      items: hits.map((hit: any) => ({
        ...hit._source,
        objectID: hit._id || hit.objectID,
        _score: hit._score,
        _id: hit._id,
        _index: hit._index,
      })),
      total,
      page,
      pageSize,
      facets,
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'OpenSearch query failed',
    })
  }
})