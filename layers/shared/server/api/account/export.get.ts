import { createError, defineEventHandler, setHeader } from 'h3'
import { joinURL } from 'ufo'
import { sql } from 'drizzle-orm'
import { db } from '#auth/server/utils/drizzle'
import { requireAuth } from '#auth/server/utils/sessions'

/**
 * GET /api/account/export — a copy of the signed-in user's own data, as a
 * JSON download (UK/EU GDPR art. 15 & 20: right of access / portability).
 * Account, sign-in history and connected logins from the auth database,
 * plus the content they own in the CMS (same owner columns the CMS proxy
 * enforces). Secrets — password hashes, OAuth/session tokens, 2FA secrets,
 * passkey keys — are never included.
 */

// Directus collections the user owns, and the column that says so.
const OWNED: Record<string, string> = {
  profiles: 'id',
  posts: 'creator_id',
  shorts: 'creator_id',
  radios: 'creator_id',
  reactions: 'user_id',
  media_folders: 'user',
  spaces: 'owner',
  websites: 'creator',
  orders: 'user_id',
  invoices: 'user',
}
const MAX_ROWS = 5000
const SECRET = /password|token|secret|backup_codes|public_key|^instance_id$|^aud$|^confirmation|^recovery|^reauthentication/i

const rowsOf = (result: unknown) =>
  ((result as { rows?: Record<string, unknown>[] }).rows ?? (result as Record<string, unknown>[]))
const withoutSecrets = (rows: Record<string, unknown>[]) =>
  rows.map((row) => Object.fromEntries(Object.entries(row).filter(([key]) => !SECRET.test(key))))

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = String(user.id)

  const [account, logins, sessions, passkeys, twoFactor, organizations, activity] = await Promise.all([
    db.execute(sql`select * from public.users where id = ${id}`),
    db.execute(sql`select provider_id, created_at, updated_at from public.accounts where user_id = ${id}`),
    db.execute(sql`select created_at, updated_at, expires_at, ip_address, user_agent from public.sessions where user_id = ${id} order by created_at desc`),
    db.execute(sql`select name, device_type, backed_up, created_at from public.passkey where user_id = ${id}`),
    db.execute(sql`select verified from public.two_factor where user_id = ${id}`),
    db.execute(sql`select organization_id, role, created_at from public.auth_organization_members where user_id = ${id}`),
    db.execute(sql`select created_at, ip_address, payload->>'action' as action, payload->>'status' as status
      from auth.audit_log_entries where payload->>'userId' = ${id} and created_at > now() - interval '365 days'
      order by created_at desc limit ${MAX_ROWS}`),
  ])

  const config = useRuntimeConfig()
  const directusUrl = (config.public as { directus?: { url?: string } }).directus?.url
  const token = (config as { directus?: { token?: string } }).directus?.token
  const content: Record<string, unknown> = {}
  if (directusUrl) {
    await Promise.all(Object.entries(OWNED).map(async ([collection, owner]) => {
      const res = await $fetch<{ data?: unknown[] }>(joinURL(directusUrl, 'items', collection), {
        query: { [`filter[${owner}][_eq]`]: id, limit: MAX_ROWS, fields: '*' },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).catch(() => null)
      content[collection] = res?.data ?? { error: 'Could not be read right now — try again later' }
    }))
  }

  const [profile] = withoutSecrets(rowsOf(account))
  if (!profile) throw createError({ statusCode: 404, statusMessage: 'Account not found' })

  setHeader(event, 'Content-Disposition', `attachment; filename="meeovi-data-${new Date().toISOString().slice(0, 10)}.json"`)
  setHeader(event, 'Cache-Control', 'no-store')
  return {
    exportedAt: new Date().toISOString(),
    account: profile,
    connectedLogins: rowsOf(logins),
    sessions: rowsOf(sessions),
    passkeys: rowsOf(passkeys),
    twoFactorEnabled: rowsOf(twoFactor).some((r) => r.verified !== false),
    organizations: rowsOf(organizations),
    accountActivity: rowsOf(activity),
    content,
  }
})
