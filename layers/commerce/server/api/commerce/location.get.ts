import { defineEventHandler, getRequestHeader, setResponseHeader } from 'h3'
import { coarsen, toLatLng } from '../../../app/utils/geo'

/**
 * GET /api/commerce/location — the visitor's approximate location (city
 * level) from Cloudflare's visitor location headers, for "near you" lists
 * when the browser's location isn't shared. `location` is null when the
 * headers aren't sent (managed transform off, or not behind Cloudflare).
 */
export default defineEventHandler((event) => {
  setResponseHeader(event, 'cache-control', 'private, no-store')
  const point = toLatLng(getRequestHeader(event, 'cf-iplatitude'), getRequestHeader(event, 'cf-iplongitude'))
  return {
    location: point ? coarsen(point) : null,
    city: getRequestHeader(event, 'cf-ipcity') || null,
    country: getRequestHeader(event, 'cf-ipcountry') || null,
  }
})
