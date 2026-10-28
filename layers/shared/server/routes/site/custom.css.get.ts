import { defineEventHandler, getQuery, setResponseHeader } from 'h3'
import { siteCustomCss } from '../../utils/siteCustomCss'

/**
 * GET /site/custom.css — the CSS admins edit live in Directus
 * (globals.custom_css, Theming group); see utils/siteCustomCss.ts.
 * Linked after the built stylesheets by app/plugins/custom-css.ts, so a
 * change shows on the next page load (within ~10 s) with no rebuild.
 *
 * Asked for with the current ?v= it is cached for a year: the URL changes
 * whenever the CSS does. Anything else (no or an old version) is not
 * cached at all, so Cloudflare's own 4-hour default for .css can't hold
 * an old copy.
 */
export default defineEventHandler(async (event) => {
  const { body, version } = await siteCustomCss()
  setResponseHeader(event, 'Content-Type', 'text/css; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', getQuery(event).v === version
    ? 'public, max-age=31536000, immutable'
    : 'no-store')
  setResponseHeader(event, 'X-Content-Type-Options', 'nosniff')
  return body
})
