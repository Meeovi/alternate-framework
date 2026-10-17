import { createError, defineEventHandler, getQuery, setResponseHeader } from 'h3'
import { productSeller } from '../../../utils/backendSellers'

/**
 * GET /api/commerce/products/seller?key=<backend>:<key> — the seller of a
 * commerce-backend product, for the product page's "By" line. Public; only
 * a display name and profile username are returned.
 */
export default defineEventHandler(async (event) => {
  const key = String(getQuery(event).key ?? '').trim()
  if (!key || key.length > 160) throw createError({ statusCode: 400, statusMessage: 'Missing product key' })
  const seller = await productSeller(key).catch((error) => {
    console.error('[commerce] product seller lookup failed', key, (error as Error)?.message)
    return null
  })
  setResponseHeader(event, 'cache-control', 'public, max-age=300')
  return { seller }
})
