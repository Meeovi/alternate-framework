import { createError, getRequestHeader } from 'h3'
import type { H3Event } from 'h3'
import type { MeeoviTableCollectionOptions } from '../../runtime/types'

export type TablesRuntimeConfig = {
  collections: Record<string, MeeoviTableCollectionOptions>
  pageSize: number
  maxPageSize: number
  sessionEndpoint: string
}

export function tablesConfig(event?: H3Event): TablesRuntimeConfig {
  const runtime = useRuntimeConfig(event) as Record<string, any>
  const own = runtime.meeoviTables ?? {}
  return {
    collections: own.collections ?? {},
    pageSize: Number(own.pageSize) || 25,
    maxPageSize: Number(own.maxPageSize) || 200,
    sessionEndpoint: own.sessionEndpoint || '/api/auth/get-session',
  }
}

/**
 * Only allowlisted collections are readable — the Directus source reads with
 * the server's static token, so an open endpoint would expose every
 * collection (users, sessions, ...). Unknown collections are a 404 so the
 * allowlist itself isn't probeable.
 */
export function collectionOptions(event: H3Event, collection: string): MeeoviTableCollectionOptions {
  const options = tablesConfig(event).collections[collection]
  if (!options) throw createError({ statusCode: 404, statusMessage: `Unknown table "${collection}"` })
  return options
}

type SessionUser = { id?: string, role?: string | null, name?: string | null, username?: string | null }

/** The signed-in user, from the app's session endpoint (better-auth by
 *  default), forwarding the request's cookie. */
export async function sessionUser(event: H3Event): Promise<SessionUser | null> {
  const cookie = getRequestHeader(event, 'cookie')
  if (!cookie) return null
  try {
    const session = await $fetch<{ user?: SessionUser } | null>(tablesConfig(event).sessionEndpoint, { headers: { cookie } })
    return session?.user ?? null
  } catch {
    return null
  }
}

/** better-auth stores roles comma-separated ("user,seller"). */
export function userRoles(user: SessionUser | null): string[] {
  return String(user?.role ?? '').split(',').map((r) => r.trim()).filter(Boolean)
}

export function canRead(options: MeeoviTableCollectionOptions, user: SessionUser | null): boolean {
  if (options.roles?.length) return Boolean(user) && userRoles(user).some((r) => options.roles!.includes(r))
  if ((options.access ?? 'authenticated') === 'public') return true
  return Boolean(user)
}

/** Checks read access; returns the signed-in user (null for public tables). */
export async function assertAccess(event: H3Event, options: MeeoviTableCollectionOptions): Promise<SessionUser | null> {
  const isPublic = !options.roles?.length && !options.owner && (options.access ?? 'authenticated') === 'public'
  if (isPublic) return null
  const user = await sessionUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Sign in to view this table' })
  if (!canRead(options, user)) throw createError({ statusCode: 403, statusMessage: "You don't have access to this table" })
  return user
}

/** May this user create / edit / delete in the collection? On `owner`
 *  tables every signed-in reader may — limited to their own rows. */
export function canEditRows(options: MeeoviTableCollectionOptions, user: SessionUser | null): boolean {
  if (!user) return false
  if (options.owner && user.id) return true
  if (!options.editRoles?.length) return false
  return userRoles(user).some((r) => options.editRoles!.includes(r))
}

export async function assertEdit(event: H3Event, options: MeeoviTableCollectionOptions): Promise<SessionUser> {
  if (!options.editRoles?.length && !options.owner) throw createError({ statusCode: 405, statusMessage: 'This table is read-only' })
  const user = await sessionUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Sign in to edit this table' })
  if (!canRead(options, user) || !canEditRows(options, user)) {
    throw createError({ statusCode: 403, statusMessage: "You don't have permission to edit this table" })
  }
  return user
}

/** The user id rows must belong to, or null when this user sees every row
 *  (no `owner` on the table, or a bypass role such as admin). */
export function ownerScope(options: MeeoviTableCollectionOptions, user: SessionUser | null): string | null {
  if (!options.owner) return null
  const bypass = options.ownerBypassRoles ?? ['admin']
  if (user && userRoles(user).some((r) => bypass.includes(r))) return null
  // A signed-in user without an id can't own anything — match nothing.
  return user?.id ? String(user.id) : '\u0000'
}

/** The table's fixed `filter` combined with its owner scope, if any. */
export function readFilter(options: MeeoviTableCollectionOptions, user: SessionUser | null): Record<string, unknown> | undefined {
  const parts: Record<string, unknown>[] = []
  if (options.filter) parts.push(options.filter)
  const owner = ownerScope(options, user)
  if (owner !== null) parts.push({ [options.owner!]: { _eq: owner } })
  if (!parts.length) return undefined
  return parts.length === 1 ? parts[0] : { _and: parts }
}
