import { getSearchDriver } from '../../../server/utils/gateway'
import type { SearchAdapter } from 'alternate-sdk/contracts/search'

/**
 * POST /api/gateway/search
 *
 * Proxies search-adapter method calls to the server-side search adapter.
 * The frontend calls this endpoint instead of accessing
 * `globalThis.useGateway` or importing `SearchAdapterRegistry` from
 * `alternate-sdk`.
 *
 * Request body:
 *   { method: string, args?: unknown[] }
 *
 * Response: whatever the search adapter method returns.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { method, args = [] } = body as { method: string; args?: unknown[] }

  if (!method || typeof method !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'method (string) is required in the request body' })
  }

  const driver = getSearchDriver()
  const fn = driver?.[method as keyof SearchAdapter]

  if (typeof fn !== 'function') {
    throw createError({
      statusCode: 404,
      statusMessage: `Search adapter method "${method}" is not available`,
    })
  }

  try {
    return await (fn as (...a: unknown[]) => any).apply(driver, args as any[])
  } catch (error: any) {
    throw createError({
      statusCode: error?.$statusCode || error?.statusCode || 500,
      statusMessage: error?.message || 'Search adapter call failed',
      data: error?.data || error?.details,
    })
  }
})
