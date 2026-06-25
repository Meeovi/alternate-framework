import { createError, defineEventHandler, getQuery, getRouterParam, setHeader } from 'h3'
import type { SearchResult } from '../../../index'
import { defineSearchEventHandler } from '../../nuxt'
import { getSearchInstance } from './search-instance'
import { getMultiBackendSearchInstance } from './search-multi-backend'

export function createStarterSearchRouteHandler() {
  return defineEventHandler(async (event) => {
    const search = getSearchInstance()
    const handler = defineSearchEventHandler(search, {
      cors: process.env.ALTERNATE_SEARCH_CORS || '*',
    })
    return handler(event)
  })
}

export function createStarterMultiBackendSearchRouteHandler() {
  return defineEventHandler(async (event) => {
    const index = getRouterParam(event, 'index')
    const query = getQuery(event)

    try {
      if (!index) {
        throw createError({
          statusCode: 400,
          message: 'Index parameter required',
        })
      }

      const searchQuery = String(query.q || '')
      if (!searchQuery.trim()) {
        return {
          items: [],
          total: 0,
          page: 1,
          pageSize: 20,
          facets: [],
          took: 0,
        }
      }

      const page = Math.max(1, parseInt(String(query.page || '1')) || 1)
      const pageSize = Math.min(100, Math.max(1, parseInt(String(query.pageSize || '20')) || 20))

      let filters: Array<unknown> = []
      if (query.filters) {
        try {
          filters = JSON.parse(String(query.filters))
        } catch {
          throw createError({
            statusCode: 400,
            message: 'Invalid filters parameter (must be valid JSON)',
          })
        }
      }

      const facets = query.facets
        ? String(query.facets)
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean)
        : []

      const search = await getMultiBackendSearchInstance()
      const result: SearchResult = await search.query(index, {
        search: searchQuery.trim(),
        page,
        pageSize,
        filters,
        facets,
        sort: query.sort ? [{ field: String(query.sort), order: 'asc' }] : [],
      })

      setHeader(event, 'cache-control', 'public, max-age=60, stale-while-revalidate=300')
      if (result.took) {
        setHeader(event, 'x-search-time-ms', String(result.took))
      }
      setHeader(event, 'x-search-backends', 'multi-backend')

      return result
    } catch (error) {
      console.error(`Multi-backend search failed for index "${index}"`, error)

      if (error instanceof Error) {
        const message = error.message.toLowerCase()
        if (message.includes('timeout') || message.includes('abort')) {
          return createError({
            statusCode: 504,
            message: 'Search took too long. Try with fewer results or more specific terms.',
          })
        }
        if (message.includes('required backends failed')) {
          return createError({
            statusCode: 503,
            message: 'Primary search service temporarily unavailable. Please try again in a moment.',
          })
        }
        if (message.includes('invalid') || message.includes('syntax')) {
          return createError({
            statusCode: 400,
            message: 'Invalid search query. Check your search terms.',
          })
        }
      }

      return createError({
        statusCode: 500,
        message: 'Search service error. Please try again later.',
      })
    }
  })
}
