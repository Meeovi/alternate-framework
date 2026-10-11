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

/** Signed in? Asks the app's session endpoint (better-auth by default),
 *  forwarding the request's cookie. */
export async function hasSession(event: H3Event): Promise<boolean> {
  const cookie = getRequestHeader(event, 'cookie')
  if (!cookie) return false
  try {
    const session = await $fetch<{ user?: unknown } | null>(tablesConfig(event).sessionEndpoint, { headers: { cookie } })
    return Boolean(session?.user)
  } catch {
    return false
  }
}

export async function assertAccess(event: H3Event, options: MeeoviTableCollectionOptions): Promise<void> {
  if ((options.access ?? 'authenticated') === 'public') return
  if (!(await hasSession(event))) throw createError({ statusCode: 401, statusMessage: 'Sign in to view this table' })
}
