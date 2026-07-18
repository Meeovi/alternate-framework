import { getQuery, createError, defineEventHandler, readBody } from 'h3'
import { searchOpenSearchIndex } from '../search/client'
// server/api/search.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const body = await readBody(event).catch(() => ({}))
  const searchString = String(query.q || body.q || '')
  const page = Math.max(1, Number(query.page || body.page || 1))
  const pageSize = Math.max(1, Number(query.pageSize || body.pageSize || 12))

  try {
    // Works dynamically using the runtime config properties
    const results = await searchOpenSearchIndex(searchString, ['title', 'description'], page, pageSize)
    const hits = results.body.hits.hits || []
    const total = typeof results.body.hits.total === 'object' && results.body.hits.total !== null && 'value' in results.body.hits.total
      ? (results.body.hits.total as { value: number }).value
      : hits.length

    return {
      success: true,
      items: hits.map((hit: any) => ({
        ...hit._source,
        _score: hit._score,
        _id: hit._id,
        _index: hit._index,
      })),
      total,
      page,
      pageSize,
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'OpenSearch query failed',
    })
  }
})