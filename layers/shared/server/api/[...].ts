/**
 * Unknown /api/* paths. Without this they fall through to the Vue renderer
 * and the site's catch-all CMS page, answering `200 text/html` — callers
 * (and scanners) can't tell a missing endpoint from a real one. Every real
 * route is more specific than this one, so it only ever sees misses.
 */
export default defineEventHandler(() => {
  throw createError({ statusCode: 404, statusMessage: 'API route not found' })
})
