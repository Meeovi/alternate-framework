import { defineEventHandler, setResponseHeader } from 'h3'
import { siteCustomCss } from '../../utils/siteCustomCss'

/** GET /site/custom-css-version — { version } of the live site CSS, for app/plugins/custom-css.ts. */
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return { version: (await siteCustomCss()).version }
})
