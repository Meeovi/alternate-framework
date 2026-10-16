import { sql } from 'drizzle-orm'
import { db } from '../utils/drizzle'
import { sendAuthEmail } from '../../shared/utils/infrastructure/email'

/**
 * Watches the auth audit log (failed sign-ins, 2FA codes, sign-ups — see
 * createAuthAuditMiddleware in utils/audits.ts) for bursts that look like
 * brute force or credential stuffing, and reports each one once an hour:
 * a `[abuse]` line in the server log, plus an email when
 * NUXT_SECURITY_ALERT_EMAIL is set. Production only.
 */
const EVERY_MS = 5 * 60 * 1000
const LOOKBACK = '15 minutes'
const THRESHOLDS = { perIp: 20, perAccount: 10, total: 100 }
const QUIET_MS = 60 * 60 * 1000

type Row = { kind: string, key: string, failures: number, sample: string | null }

export default defineNitroPlugin(() => {
  if (process.env.NODE_ENV !== 'production' || import.meta.prerender) return
  const alerted = new Map<string, number>()

  const check = async () => {
    const result = await db.execute(sql`
      with failures as (
        select ip_address, payload->>'targetId' as target, payload->>'action' as action
        from auth.audit_log_entries
        where created_at > now() - ${LOOKBACK}::interval and payload->>'status' = 'failure'
      )
      select 'ip' as kind, ip_address as key, count(*)::int as failures, min(action) as sample
        from failures where ip_address <> '' group by ip_address having count(*) >= ${THRESHOLDS.perIp}
      union all
      select 'account', target, count(*)::int, string_agg(distinct ip_address, ', ')
        from failures where target not in ('', 'unknown') group by target having count(*) >= ${THRESHOLDS.perAccount}
      union all
      select 'total', 'all', count(*)::int, null
        from failures having count(*) >= ${THRESHOLDS.total}
    `)
    const rows = ((result as unknown as { rows?: Row[] }).rows ?? (result as unknown as Row[]))
    const now = Date.now()
    const fresh = rows.filter((r) => now - (alerted.get(`${r.kind}:${r.key}`) ?? 0) > QUIET_MS)
    if (!fresh.length) return

    const lines = fresh.map((r) =>
      r.kind === 'ip' ? `${r.failures} failed auth attempts from IP ${r.key} (e.g. ${r.sample})`
        : r.kind === 'account' ? `${r.failures} failed attempts against account "${r.key}" (from ${r.sample || 'unknown IPs'})`
          : `${r.failures} failed auth attempts site-wide`)
    for (const r of fresh) alerted.set(`${r.kind}:${r.key}`, now)
    for (const line of lines) console.warn(`[abuse] ${line} in the last ${LOOKBACK}`)

    const to = process.env.NUXT_SECURITY_ALERT_EMAIL
    if (to) {
      const text = `${lines.join('\n')}\n\nWindow: last ${LOOKBACK}. Source: auth.audit_log_entries.`
      const { error } = await sendAuthEmail({ to, subject: 'Security alert: unusual sign-in failures', text, html: `<pre>${text.replace(/[<>&]/g, (c) => `&#${c.charCodeAt(0)};`)}</pre>` })
      if (error) console.error('[abuse] alert email failed', error)
    }
  }

  const timer = setInterval(() => {
    check().catch((error) => console.error('[abuse] check failed', error))
  }, EVERY_MS)
  timer.unref?.()
})
