import { getResponseHeader, setResponseHeader } from 'h3'

/**
 * Sends the site CSP (built in nuxt.config.ts, buildContentSecurityPolicy)
 * on every HTML response.
 *
 * Not a routeRules header: nuxt-security, whose own CSP is switched off,
 * removes a `Content-Security-Policy` header that equals the routeRules
 * value. `beforeResponse` runs after its render:response hook, for fresh
 * and ISR-cached pages alike.
 *
 * Rollback without a rebuild: NUXT_CSP_REPORT_ONLY=true sends it as
 * Content-Security-Policy-Report-Only instead (violations are still
 * reported to /api/csp-report either way).
 */
export default defineNitroPlugin((nitroApp) => {
  const { csp } = useRuntimeConfig()
  if (!csp?.policy) return
  const header = String(csp.reportOnly) === 'true' ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy'

  nitroApp.hooks.hook('beforeResponse', (event) => {
    if (!String(getResponseHeader(event, 'content-type') || '').includes('text/html')) return
    setResponseHeader(event, header, csp.policy)
  })
})
