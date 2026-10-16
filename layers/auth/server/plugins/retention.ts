import { sql } from 'drizzle-orm'
import { db } from '../utils/drizzle'

/**
 * Data minimisation (UK/EU GDPR art. 5(1)(e)): once a day, drop personal
 * data that has stopped serving a purpose.
 *  - sessions 30 days past expiry (they hold IP + user agent) and expired
 *    verification tokens — always;
 *  - auth audit log entries older than NUXT_AUDIT_RETENTION_DAYS — only
 *    when that is set, since the period is a policy decision (and the
 *    privacy policy should state it).
 * Production only.
 */
const EVERY_MS = 24 * 60 * 60 * 1000

export default defineNitroPlugin(() => {
  if (process.env.NODE_ENV !== 'production' || import.meta.prerender) return
  const auditDays = Number.parseInt(process.env.NUXT_AUDIT_RETENTION_DAYS || '', 10)

  const sweep = async () => {
    const counts: string[] = []
    const count = (result: unknown) =>
      (result as { count?: number, rowCount?: number }).count ?? (result as { rowCount?: number }).rowCount ?? 0

    counts.push(`${count(await db.execute(sql`delete from public.sessions where expires_at < now() - interval '30 days'`))} expired sessions`)
    counts.push(`${count(await db.execute(sql`delete from public.verification where expires_at < now()`))} expired verification tokens`)
    if (auditDays >= 30) {
      counts.push(`${count(await db.execute(sql`delete from auth.audit_log_entries where created_at < now() - make_interval(days => ${auditDays})`))} audit entries older than ${auditDays} days`)
    }
    console.info(`[retention] removed ${counts.join(', ')}`)
  }

  // First run a few minutes after boot, then daily.
  const run = () => sweep().catch((error) => console.error('[retention] sweep failed', error))
  setTimeout(run, 5 * 60 * 1000).unref?.()
  setInterval(run, EVERY_MS).unref?.()
})
