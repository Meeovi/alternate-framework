import { createError, defineEventHandler, getQuery, getRequestHeader, setResponseHeader } from 'h3'
import { findNearbyProducts } from '../../../utils/nearbyProducts'
import { coarsen, toLatLng } from '../../../../app/utils/geo'

const clamp = (value: unknown, min: number, max: number, fallback: number) => {
  const n = Number(value)
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback
}

/**
 * GET /api/commerce/products/nearby?lat=&lng=&radius=50&limit=24&department=travel
 * Products near a point, nearest first, each with `distanceKm`. Public.
 *
 * Without lat/lng it uses the visitor's approximate location from
 * Cloudflare's cf-iplatitude/cf-iplongitude headers (sent only when the
 * zone's "Add visitor location headers" managed transform is on); with
 * neither, `origin` is null and the list is empty.
 */
export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const department = typeof q.department === 'string' ? q.department.trim() : ''
  if (department && !/^[a-z0-9-]{1,64}$/i.test(department)) {
    throw createError({ statusCode: 400, statusMessage: 'Bad department' })
  }

  const fromQuery = toLatLng(q.lat, q.lng)
  const fromIp = fromQuery ? null : toLatLng(getRequestHeader(event, 'cf-iplatitude'), getRequestHeader(event, 'cf-iplongitude'))
  const point = fromQuery ?? fromIp
  // A query-string location is the cache key; an IP one is per visitor.
  setResponseHeader(event, 'cache-control', fromQuery ? 'public, max-age=300' : 'private, max-age=300')
  if (!point) return { origin: null, source: null, products: [] }

  const origin = coarsen(point)
  const products = await findNearbyProducts({
    origin,
    radiusKm: clamp(q.radius, 1, 500, 50),
    limit: Math.round(clamp(q.limit, 1, 60, 24)),
    department: department || undefined,
  }).catch((error) => {
    console.error('[commerce] nearby products failed', (error as Error)?.message)
    return []
  })
  return { origin, source: fromQuery ? 'query' : 'ip', products }
})
