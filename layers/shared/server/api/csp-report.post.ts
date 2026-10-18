/**
 * POST /api/csp-report — where browsers send Content-Security-Policy
 * violations (see buildContentSecurityPolicy in nuxt.config.ts). Accepts
 * both formats:
 *   - legacy `report-uri`: application/csp-report  { "csp-report": {…} }
 *   - Reporting API `report-to`: application/reports+json  [{ type: "csp-violation", body: {…} }]
 *
 * Each distinct (directive, blocked source, page path) is logged once per
 * process, so a busy page can't flood the journal:
 *   journalctl -u meeovi-demo | grep '\[csp\]'
 * Public and unauthenticated by nature; it only ever writes to the log.
 */
const seen = new Set<string>()
const MAX_DISTINCT = 1000

// Only origins / paths are logged — never query strings, which can carry
// tokens or personal data.
const trimUrl = (value: unknown) => {
  if (typeof value !== 'string' || !value) return ''
  try {
    const u = new URL(value)
    return `${u.origin}${u.pathname}`.slice(0, 200)
  } catch {
    return value.replace(/[?#].*$/, '').slice(0, 60) // 'inline', 'eval', 'data', …
  }
}

export default defineEventHandler(async (event) => {
  let raw: unknown
  try { raw = await readBody(event) } catch { raw = null }
  if (typeof raw === 'string') {
    try { raw = JSON.parse(raw) } catch { raw = null }
  }

  const reports = Array.isArray(raw)
    ? raw.filter((r) => r?.type === 'csp-violation').map((r) => r.body)
    : [(raw as { 'csp-report'?: unknown } | null)?.['csp-report']]

  for (const r of reports.slice(0, 20)) {
    if (!r || typeof r !== 'object') continue
    const report = r as Record<string, unknown>
    const directive = String(report.effectiveDirective ?? report['effective-directive'] ?? report['violated-directive'] ?? '').split(' ')[0]!.slice(0, 40)
    const blocked = trimUrl(report.blockedURL ?? report['blocked-uri'])
    const page = trimUrl(report.documentURL ?? report['document-uri']).replace(/^https?:\/\/[^/]+/, '')
    const source = trimUrl(report.sourceFile ?? report['source-file'])
    const key = `${directive}|${blocked}|${page}`
    if (!directive || seen.has(key) || seen.size >= MAX_DISTINCT) continue
    seen.add(key)
    console.warn(`[csp] ${directive} blocked=${blocked || '-'} page=${page || '-'}${source ? ` source=${source}` : ''}`)
  }

  setResponseStatus(event, 204)
  return null
})
