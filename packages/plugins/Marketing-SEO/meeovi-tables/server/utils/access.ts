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

type SessionUser = { id?: string, role?: string | null }

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

export async function assertAccess(event: H3Event, options: MeeoviTableCollectionOptions): Promise<void> {
  const isPublic = !options.roles?.length && (options.access ?? 'authenticated') === 'public'
  if (isPublic) return
  const user = await sessionUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Sign in to view this table' })
  if (!canRead(options, user)) throw createError({ statusCode: 403, statusMessage: "You don't have access to this table" })
}
