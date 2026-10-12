import { createError, getRequestHeader } from 'h3'
import type { H3Event } from 'h3'
import type { IntegrationCatalogItem, IntegrationState } from '../../runtime/types'

/**
 * Per-user integrations, stored in Directus:
 *  - catalog  (`integrations`): what can be installed; `plugin` names the
 *    plugin package an entry switches on.
 *  - installs (`integration_installs`): one row per user + integration,
 *    `user_id` = the better-auth user id. Only ever written here, from the
 *    signed-in session — clients never say whose install it is.
 *
 * Plugins check installs on their own server routes with
 * `requireIntegration(event, '@mframework/my-plugin')`
 * (import from '@mframework/meeovi-integrations/server').
 */

type Config = {
  sessionEndpoint: string
  catalogCollection: string
  installsCollection: string
  directus: { url: string, token: string }
}

export function integrationsConfig(event?: H3Event): Config {
  const own = (useRuntimeConfig(event) as Record<string, any>).meeoviIntegrations ?? {}
  return {
    sessionEndpoint: own.sessionEndpoint || '/api/auth/get-session',
    catalogCollection: own.catalogCollection || 'integrations',
    installsCollection: own.installsCollection || 'integration_installs',
    directus: {
      url: String(own.directus?.url || '').trim().replace(/^(['"])(.*)\1$/, '$2').replace(/\/+$/, ''),
      token: String(own.directus?.token || '').trim(),
    },
  }
}

function directus(event?: H3Event) {
  const { directus: { url, token } } = integrationsConfig(event)
  if (!url) throw createError({ statusCode: 503, statusMessage: 'Integrations are not configured' })
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined
  return <T>(path: string, options: Record<string, any> = {}) =>
    $fetch<T>(`${url}${path}`, { timeout: 15000, ...options, headers: { ...headers, ...options.headers } })
}

export type IntegrationsUser = { id: string, role?: string | null }

/** The signed-in user (better-auth session, forwarding the request cookie). */
export async function integrationsUser(event: H3Event): Promise<IntegrationsUser | null> {
  const cookie = getRequestHeader(event, 'cookie')
  if (!cookie) return null
  try {
    const session = await $fetch<{ user?: { id?: string, role?: string | null } } | null>(
      integrationsConfig(event).sessionEndpoint, { headers: { cookie } },
    )
    const id = session?.user?.id
    return id ? { id: String(id), role: session?.user?.role ?? null } : null
  } catch {
    return null
  }
}

export async function requireUser(event: H3Event): Promise<IntegrationsUser> {
  const user = await integrationsUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Sign in to manage integrations' })
  return user
}

// ---------------------------------------------------------------------------
// Catalog

type CatalogRow = {
  id: number
  name?: string | null
  description?: string | null
  type?: string | null
  developer?: string | null
  version?: string | null
  is_cost?: string | null
  price?: number | null
  status?: string | null
  plugin?: string | null
}

const CATALOG_FIELDS = 'id,name,description,type,developer,version,is_cost,price,status,plugin'
const CATALOG_TTL_MS = 60 * 1000
let catalogCache: { at: number, rows: CatalogRow[] } | null = null

/** Published + "Coming Soon" catalog entries (drafts / archived are hidden). */
export async function catalogRows(event?: H3Event, fresh = false): Promise<CatalogRow[]> {
  if (!fresh && catalogCache && Date.now() - catalogCache.at < CATALOG_TTL_MS) return catalogCache.rows
  const { catalogCollection } = integrationsConfig(event)
  const res = await directus(event)<{ data: CatalogRow[] }>(`/items/${catalogCollection}`, {
    query: {
      limit: -1,
      fields: CATALOG_FIELDS,
      sort: 'name',
      filter: JSON.stringify({ status: { _nin: ['draft', 'archived'] } }),
    },
  })
  catalogCache = { at: Date.now(), rows: res.data ?? [] }
  return catalogCache.rows
}

const isPaid = (row: CatalogRow) => String(row.is_cost ?? '').toLowerCase() === 'paid' || Number(row.price) > 0

/** Can a user install this entry right now? Published, linked to a plugin, free. */
export function installable(row: CatalogRow): boolean {
  return String(row.status ?? '').toLowerCase() === 'published' && Boolean(row.plugin?.trim()) && !isPaid(row)
}

export function stateOf(row: CatalogRow, installed: boolean): IntegrationState {
  if (installed) return 'installed'
  if (String(row.status ?? '').toLowerCase() !== 'published' || !row.plugin?.trim()) return 'coming-soon'
  if (isPaid(row)) return 'paid'
  return 'available'
}

export function toCatalogItem(row: CatalogRow, installedAt: string | null): IntegrationCatalogItem {
  return {
    id: row.id,
    name: String(row.name ?? '').trim() || `Integration ${row.id}`,
    description: row.description ?? null,
    type: row.type ?? null,
    developer: row.developer?.trim() || null,
    version: row.version ?? null,
    cost: row.is_cost ?? null,
    price: row.price ?? null,
    plugin: row.plugin?.trim() || null,
    state: stateOf(row, installedAt !== null),
    installedAt,
  }
}

// ---------------------------------------------------------------------------
// Installs

export type InstallRow = { id: number, integration: number, plugin: string | null, date_created: string | null }

/** This user's install rows. */
export async function installsFor(event: H3Event, userId: string): Promise<InstallRow[]> {
  const { installsCollection } = integrationsConfig(event)
  const res = await directus(event)<{ data: InstallRow[] }>(`/items/${installsCollection}`, {
    query: {
      limit: -1,
      fields: 'id,integration,plugin,date_created',
      filter: JSON.stringify({ user_id: { _eq: userId } }),
    },
  })
  return res.data ?? []
}

/**
 * Plugin packages switched on for this user. An install only counts while
 * its catalog entry still links that plugin and is published — unpublishing
 * an integration switches it off for everyone.
 */
export async function installedPlugins(event: H3Event, userId: string): Promise<{ plugins: string[], integrations: number[] }> {
  const [rows, catalog] = await Promise.all([installsFor(event, userId), catalogRows(event)])
  const byId = new Map(catalog.map((c) => [c.id, c]))
  const live = rows.filter((r) => {
    const entry = byId.get(Number(r.integration))
    return entry && String(entry.status ?? '').toLowerCase() === 'published' && entry.plugin?.trim()
  })
  return {
    plugins: [...new Set(live.map((r) => byId.get(Number(r.integration))!.plugin!.trim()))],
    integrations: [...new Set(live.map((r) => Number(r.integration)))],
  }
}

/** Has the signed-in user installed the integration that provides `plugin`? */
export async function hasIntegration(event: H3Event, plugin: string): Promise<boolean> {
  const user = await integrationsUser(event)
  if (!user) return false
  try {
    return (await installedPlugins(event, user.id)).plugins.includes(plugin)
  } catch {
    return false
  }
}

/** For plugins' server routes: 401 signed out, 403 when not installed. */
export async function requireIntegration(event: H3Event, plugin: string): Promise<IntegrationsUser> {
  const user = await requireUser(event)
  if (!(await installedPlugins(event, user.id)).plugins.includes(plugin)) {
    throw createError({ statusCode: 403, statusMessage: 'Install this integration to use it' })
  }
  return user
}

export async function addInstall(event: H3Event, userId: string, row: CatalogRow): Promise<void> {
  const { installsCollection } = integrationsConfig(event)
  await directus(event)(`/items/${installsCollection}`, {
    method: 'POST',
    body: { user_id: userId, integration: row.id, plugin: row.plugin?.trim() || null },
  })
}

export async function removeInstalls(event: H3Event, ids: number[]): Promise<void> {
  if (!ids.length) return
  const { installsCollection } = integrationsConfig(event)
  await directus(event)(`/items/${installsCollection}`, { method: 'DELETE', body: ids })
}

export function integrationId(raw: unknown): number {
  const id = Number(raw)
  if (!Number.isInteger(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: 'Invalid integration id' })
  return id
}
