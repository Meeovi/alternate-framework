import { createError, getRequestHeader } from 'h3'
import type { H3Event } from 'h3'
import type {
  IntegrationCatalogItem,
  IntegrationEntitlements,
  IntegrationPlugin,
  IntegrationState,
  IntegrationStore,
  IntegrationStoreProduct,
} from '../../runtime/types'

/**
 * Per-user integrations.
 *
 *  - Plugins: discovered at build time from the plugins folder (each declares
 *    `mframework.integration` in its package.json). Admin plugins are only
 *    ever shown to, or installable by, signed-in admins.
 *  - Store: a plugin whose manifest names a `sku` is sold (or given away)
 *    as that product in the commerce backend — the registered
 *    IntegrationStore (adapter-magento). A paid plugin only switches on for
 *    users who paid for it there, or its seller.
 *  - Installs (Directus `integration_installs`): one row per user + plugin,
 *    `user_id` = the better-auth user id, always taken from the session —
 *    a client never says whose install it is. Uninstalling sets
 *    `status: 'uninstalled'` and keeps the row, so the user's plugin data
 *    (`settings`) stays attached to them and comes back on reinstall.
 *
 * Plugins check installs on their own server routes with
 * `requireIntegration(event, '@mframework/my-plugin')` and keep per-user
 * data with `getIntegrationData` / `setIntegrationData`
 * (import from '@mframework/meeovi-integrations/server').
 */

type Config = {
  sessionEndpoint: string
  installsCollection: string
  directus: { url: string, token: string }
  registry: IntegrationPlugin[]
  requireSandbox: boolean
}

export function integrationsConfig(event?: H3Event): Config {
  const own = (useRuntimeConfig(event) as Record<string, any>).meeoviIntegrations ?? {}
  return {
    sessionEndpoint: own.sessionEndpoint || '/api/auth/get-session',
    installsCollection: own.installsCollection || 'integration_installs',
    directus: {
      url: String(own.directus?.url || '').trim().replace(/^(['"])(.*)\1$/, '$2').replace(/\/+$/, ''),
      token: String(own.directus?.token || '').trim(),
    },
    registry: Array.isArray(own.registry) ? own.registry : [],
    requireSandbox: own.requireSandbox !== false,
  }
}

function directus(event?: H3Event) {
  const { directus: { url, token } } = integrationsConfig(event)
  if (!url) throw createError({ statusCode: 503, statusMessage: 'Integrations are not configured' })
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined
  return <T>(path: string, options: Record<string, any> = {}) =>
    $fetch<T>(`${url}${path}`, { timeout: 15000, ...options, headers: { ...headers, ...options.headers } })
}

// ---------------------------------------------------------------------------
// Who is asking

export type IntegrationsUser = {
  id: string
  role: string | null
  admin: boolean
  /** The session's user record (the store reads its customer link from it). */
  session: Record<string, unknown>
}

// better-auth roles are comma-separated ("user,admin"), so check membership.
const hasAdminRole = (role: string | null | undefined) =>
  String(role || '').split(',').map((r) => r.trim()).includes('admin')

/** The signed-in user (better-auth session, forwarding the request cookie). */
export async function integrationsUser(event: H3Event): Promise<IntegrationsUser | null> {
  const cookie = getRequestHeader(event, 'cookie')
  if (!cookie) return null
  try {
    const session = await $fetch<{ user?: { id?: string, role?: string | null, [key: string]: unknown } } | null>(
      integrationsConfig(event).sessionEndpoint, { headers: { cookie } },
    )
    const id = session?.user?.id
    if (!id) return null
    const role = session?.user?.role ?? null
    return { id: String(id), role, admin: hasAdminRole(role), session: session!.user! }
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
// Plugins

/** Plugins this user may see: everything for admins, no admin plugins otherwise. */
export function visiblePlugins(event: H3Event, user: IntegrationsUser | null): IntegrationPlugin[] {
  return integrationsConfig(event).registry.filter((p) => !p.admin || user?.admin)
}

/** A plugin by slug or package name, if this user may see it. Admin plugins
 *  are "not found" for everyone else — their existence isn't revealed. */
export function findPlugin(event: H3Event, user: IntegrationsUser | null, slugOrName: string): IntegrationPlugin | null {
  return visiblePlugins(event, user).find((p) => p.slug === slugOrName || p.plugin === slugOrName) ?? null
}

export function pluginOrThrow(event: H3Event, user: IntegrationsUser | null, slug: unknown): IntegrationPlugin {
  const plugin = typeof slug === 'string' && /^[a-z0-9][a-z0-9._-]{0,99}$/i.test(slug) ? findPlugin(event, user, slug) : null
  if (!plugin) throw createError({ statusCode: 404, statusMessage: 'Integration not found' })
  return plugin
}

// ---------------------------------------------------------------------------
// Store (the commerce backend that sells integrations)
//
// A plugin whose manifest names a `sku` is sold as that product in the
// commerce backend (Magento, via adapter-magento, which registers itself as
// the IntegrationStore). Price above 0 = paid: installable once the user
// has paid for it there, or if they're its seller; 0 = free. The manifest
// is the trust anchor — only that SKU counts. Plugins without a SKU are
// first-party and free.

const STORE_TTL_MS = 60 * 1000
let storeCache: { at: number, key: string, products: Map<string, IntegrationStoreProduct> } | null = null

/** The registered store, if any. */
export function integrationStore(): IntegrationStore | null {
  const store = (globalThis as Record<symbol, unknown>)[Symbol.for('mframework.integrations.store')] as IntegrationStore | undefined
  return store && typeof store.products === 'function' ? store : null
}

/** The store's products for every plugin that names a SKU, by SKU. Cached;
 *  if the store is unreachable, the last good answer (or nothing). */
export async function storeProducts(event?: H3Event, fresh = false): Promise<Map<string, IntegrationStoreProduct>> {
  const store = integrationStore()
  const skus = integrationsConfig(event).registry.map((p) => p.sku).filter((s): s is string => !!s).sort()
  const key = skus.join('|')
  if (!store || !skus.length) return new Map()
  if (!fresh && storeCache?.key === key && Date.now() - storeCache.at < STORE_TTL_MS) return storeCache.products
  try {
    const products = await store.products(skus)
    storeCache = { at: Date.now(), key, products: new Map(products.map((p) => [p.sku, p])) }
  } catch {
    storeCache = { at: Date.now(), key, products: storeCache?.key === key ? storeCache.products : new Map() }
  }
  return storeCache.products
}

const isPaid = (product: IntegrationStoreProduct | undefined) => !!product && product.price > 0

/** The user's customer id in the store (from their session user). */
const storeCustomer = (user: IntegrationsUser | null) =>
  (user && integrationStore()?.customerId(user.session)) || null

/** The registered entitlement source (e.g. the app's licensing), if any. */
export function integrationEntitlements(): IntegrationEntitlements | null {
  const source = (globalThis as Record<symbol, unknown>)[Symbol.for('mframework.integrations.entitlements')] as IntegrationEntitlements | undefined
  return source && typeof source.entitledRefs === 'function' ? source : null
}

/**
 * SKUs of paid plugins this user may use: from the entitlement source
 * (licenses) when one is registered, else the store's purchase history.
 * Fails closed: if neither can tell, paid plugins stay off.
 */
export async function purchasedSkus(user: IntegrationsUser | null, products?: Map<string, IntegrationStoreProduct>): Promise<Set<string>> {
  if (!user) return new Set()
  const entitlements = integrationEntitlements()
  if (entitlements) {
    const paid = [...(products ?? new Map<string, IntegrationStoreProduct>()).values()].filter(isPaid)
    if (!paid.length) return new Set()
    try {
      const refs = new Set(await entitlements.entitledRefs(user.id, paid.map((p) => p.ref)))
      return new Set(paid.filter((p) => refs.has(p.ref)).map((p) => p.sku))
    } catch {
      return new Set()
    }
  }
  const customerId = storeCustomer(user)
  const store = integrationStore()
  if (!customerId || !store) return new Set()
  try {
    return new Set(await store.purchasedSkus(customerId))
  } catch {
    return new Set()
  }
}

/** May this user use the plugin? Not sold, free, theirs to sell, or bought. */
const entitled = (
  plugin: IntegrationPlugin, product: IntegrationStoreProduct | undefined,
  user: IntegrationsUser | null, purchased: Set<string>,
) => {
  if (!plugin.sku) return true
  if (!product) return false
  if (!isPaid(product)) return true
  const customer = storeCustomer(user)
  return (!!customer && product.seller?.id === customer) || purchased.has(product.sku)
}

/**
 * Why a plugin can't be switched on here, if it can't: not registered in
 * this app; for user plugins while sandboxing is required, no sandboxed UI
 * yet (admin plugins are first-party infrastructure, exempt); or it's sold
 * but the store doesn't have its product (yet).
 */
export function blockedReason(
  event: H3Event, plugin: IntegrationPlugin, products?: Map<string, IntegrationStoreProduct>,
): IntegrationCatalogItem['reason'] {
  if (!plugin.inBuild) return 'not-in-app'
  if (!plugin.admin && !plugin.sandbox && integrationsConfig(event).requireSandbox) return 'not-sandboxed'
  if (plugin.sku && products && !products.has(plugin.sku)) return 'not-in-store'
  return null
}

export function pluginState(reason: IntegrationCatalogItem['reason'], paidFor: boolean, installed: boolean): IntegrationState {
  if (reason) return 'coming-soon'
  // A paid plugin the user hasn't bought (or was refunded) is off, even if
  // they installed it before.
  if (!paidFor) return 'paid'
  if (installed) return 'installed'
  return 'available'
}

export function pluginItem(
  event: H3Event, plugin: IntegrationPlugin, products: Map<string, IntegrationStoreProduct>,
  installedAt: string | null, paidFor: boolean,
): IntegrationCatalogItem {
  const reason = blockedReason(event, plugin, products)
  const product = plugin.sku ? products.get(plugin.sku) : undefined
  const paid = isPaid(product)
  return {
    slug: plugin.slug,
    name: product?.name || plugin.name,
    description: product?.description || plugin.description,
    category: plugin.category,
    icon: plugin.icon,
    developer: product?.seller?.name || plugin.developer,
    version: plugin.version,
    cost: paid ? 'paid' : 'free',
    price: paid ? product!.price : null,
    sku: plugin.sku ?? null,
    productRef: product?.ref ?? null,
    purchased: paid && paidFor,
    plugin: plugin.plugin,
    admin: plugin.admin,
    sandboxed: Boolean(plugin.sandbox),
    hosts: plugin.hosts ?? [],
    state: pluginState(reason, paidFor || !!reason, installedAt !== null),
    reason,
    installedAt,
  }
}

/** Everything this user may see, with each entry's state for them. */
export async function catalogFor(event: H3Event, user: IntegrationsUser | null): Promise<IntegrationCatalogItem[]> {
  const plugins = visiblePlugins(event, user)
  const [products, installs] = await Promise.all([
    storeProducts(event),
    user ? activeInstalls(event, user.id) : Promise.resolve([]),
  ])
  // Only ask about purchases when something here is paid.
  const purchased = user && plugins.some((p) => p.sku) ? await purchasedSkus(user, products) : new Set<string>()
  const installedAt = new Map(installs.map((i) => [i.plugin, i.date_created ?? '']))
  return plugins.map((p) => pluginItem(
    event, p, products,
    installedAt.has(p.plugin) ? installedAt.get(p.plugin)! : null,
    entitled(p, p.sku ? products.get(p.sku) : undefined, user, purchased),
  ))
}

/** One entry by slug. */
export async function catalogItem(event: H3Event, user: IntegrationsUser | null, slug: string): Promise<IntegrationCatalogItem | null> {
  return (await catalogFor(event, user)).find((i) => i.slug === slug) ?? null
}

// ---------------------------------------------------------------------------
// Installs

export type InstallRow = {
  id: number
  plugin: string
  status: string | null
  settings: Record<string, unknown> | null
  date_created: string | null
}

const isActive = (row: InstallRow) => (row.status ?? 'installed') === 'installed'

/** All of this user's install rows (active and uninstalled). */
export async function installsFor(event: H3Event, userId: string): Promise<InstallRow[]> {
  const { installsCollection } = integrationsConfig(event)
  const res = await directus(event)<{ data: InstallRow[] }>(`/items/${installsCollection}`, {
    query: {
      limit: -1,
      sort: 'id',
      fields: 'id,plugin,status,settings,date_created',
      filter: JSON.stringify({ user_id: { _eq: userId }, plugin: { _nnull: true } }),
    },
  })
  return res.data ?? []
}

/** This user's installs that are switched on. */
export async function activeInstalls(event: H3Event, userId: string): Promise<InstallRow[]> {
  return (await installsFor(event, userId)).filter(isActive)
}

/** This user's row for one plugin (installed or not). */
async function installRow(event: H3Event, userId: string, plugin: string): Promise<InstallRow | null> {
  return (await installsFor(event, userId)).find((r) => r.plugin === plugin) ?? null
}

/**
 * Plugin packages switched on for this user: installed, still in the
 * registry and in this build, and — for admin plugins — still an admin.
 */
export async function installedPlugins(event: H3Event, user: IntegrationsUser): Promise<string[]> {
  // An install only counts while the plugin may run here (in this app, and
  // sandboxed unless it's an admin plugin) and, if it's paid, while the
  // user's purchase stands.
  const products = await storeProducts(event)
  const live = new Set(visiblePlugins(event, user).filter((p) => !blockedReason(event, p, products)).map((p) => p.plugin))
  const installed = [...new Set((await activeInstalls(event, user.id)).map((r) => r.plugin).filter((p) => live.has(p)))]
  const sold = integrationsConfig(event).registry.filter((p) => p.sku && installed.includes(p.plugin))
  if (!sold.length) return installed
  const purchased = sold.some((p) => isPaid(products.get(p.sku!))) ? await purchasedSkus(user, products) : new Set<string>()
  const off = new Set(sold.filter((p) => !entitled(p, products.get(p.sku!), user, purchased)).map((p) => p.plugin))
  return installed.filter((p) => !off.has(p))
}

/** Has the signed-in user installed `plugin`? */
export async function hasIntegration(event: H3Event, plugin: string): Promise<boolean> {
  const user = await integrationsUser(event)
  if (!user) return false
  try {
    return (await installedPlugins(event, user)).includes(plugin)
  } catch {
    return false
  }
}

/** For plugins' server routes: 401 signed out, 403 when not installed. */
export async function requireIntegration(event: H3Event, plugin: string): Promise<IntegrationsUser> {
  const user = await requireUser(event)
  if (!(await installedPlugins(event, user)).includes(plugin)) {
    throw createError({ statusCode: 403, statusMessage: 'Install this integration to use it' })
  }
  return user
}

/**
 * Switch a plugin on for this user. Reinstalling reuses their earlier row,
 * so their plugin data is still there. Idempotent.
 */
export async function install(event: H3Event, user: IntegrationsUser, plugin: IntegrationPlugin): Promise<void> {
  const { installsCollection } = integrationsConfig(event)
  const rows = (await installsFor(event, user.id)).filter((r) => r.plugin === plugin.plugin)
  if (rows.some(isActive)) return
  // Paid: tell the entitlement source first; it may refuse (e.g. a limit).
  const product = plugin.sku ? (await storeProducts(event)).get(plugin.sku) : undefined
  if (product && isPaid(product)) await integrationEntitlements()?.installed?.(user.id, product.ref, plugin.slug)
  const row = rows.at(-1)
  if (row) {
    await directus(event)(`/items/${installsCollection}/${row.id}`, { method: 'PATCH', body: { status: 'installed' } })
    return
  }
  await directus(event)(`/items/${installsCollection}`, {
    method: 'POST',
    body: { user_id: user.id, plugin: plugin.plugin, status: 'installed', settings: {} },
  })
}

/** Switch a plugin off for this user. Their row and data are kept. */
export async function uninstall(event: H3Event, user: IntegrationsUser, plugin: IntegrationPlugin): Promise<void> {
  const { installsCollection } = integrationsConfig(event)
  const ids = (await installsFor(event, user.id)).filter((r) => r.plugin === plugin.plugin && isActive(r)).map((r) => r.id)
  if (!ids.length) return
  await directus(event)(`/items/${installsCollection}`, { method: 'PATCH', body: { keys: ids, data: { status: 'uninstalled' } } })
  const product = plugin.sku ? (await storeProducts(event)).get(plugin.sku) : undefined
  if (product && isPaid(product)) await integrationEntitlements()?.uninstalled?.(user.id, product.ref, plugin.slug)
}

// ---------------------------------------------------------------------------
// Per-user plugin data (stored on the user's own install row)

/** Largest data a user may keep per plugin, as JSON. */
export const MAX_DATA_BYTES = 64 * 1024

const asData = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}

/** This user's data for `plugin` ({} when there is none). Requires the install. */
export async function getIntegrationData(event: H3Event, plugin: string): Promise<Record<string, unknown>> {
  const user = await requireIntegration(event, plugin)
  return asData((await installRow(event, user.id, plugin))?.settings)
}

/** Replace (or, with `merge`, shallow-merge into) this user's data for `plugin`. */
export async function setIntegrationData(
  event: H3Event, plugin: string, data: Record<string, unknown>, { merge = false } = {},
): Promise<Record<string, unknown>> {
  const user = await requireIntegration(event, plugin)
  const row = await installRow(event, user.id, plugin)
  if (!row) throw createError({ statusCode: 403, statusMessage: 'Install this integration to use it' })
  const next = merge ? { ...asData(row.settings), ...data } : data
  if (Buffer.byteLength(JSON.stringify(next)) > MAX_DATA_BYTES) {
    throw createError({ statusCode: 413, statusMessage: 'Integration data is too large' })
  }
  const { installsCollection } = integrationsConfig(event)
  await directus(event)(`/items/${installsCollection}/${row.id}`, { method: 'PATCH', body: { settings: next } })
  return next
}

// ---------------------------------------------------------------------------
// Sandbox

/** Nitro server-asset name for a plugin's sandbox folder (matches module.ts). */
export const sandboxAssetName = (slug: string) => `meeovi-sandbox-${slug.replace(/[^a-z0-9-]/gi, '-')}`

/** CSP source for a declared host: "api.x.com" → https://api.x.com, "*.x.com" → https://*.x.com. */
const hostSource = (host: string) => `https://${host}`

/**
 * The enforced policy for a plugin's sandboxed files. `self` is the URL of
 * the plugin's own sandbox folder; `hosts` are the only outside hosts it may
 * connect to. No 'self' in connect-src: the sandbox can't call this app's
 * API — it only talks to the app through the bridge.
 */
export function sandboxCsp(self: string, hosts: string[]): string {
  const connect = hosts.length ? hosts.map(hostSource).join(' ') : "'none'"
  return [
    "default-src 'none'",
    `script-src ${self}`,
    `style-src ${self}`,
    `img-src ${self} data: blob:`,
    `font-src ${self} data:`,
    `media-src ${self} data: blob:`,
    `connect-src ${connect}`,
    "frame-src 'none'",
    "child-src 'none'",
    "worker-src 'none'",
    "manifest-src 'none'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'self'",
    'sandbox allow-scripts',
  ].join('; ')
}

/** Is `hostname` one of these declared hosts (exact, or "*.domain" for its subdomains)? */
export function hostAllowed(hosts: string[], hostname: string): boolean {
  const name = hostname.toLowerCase().replace(/\.$/, '')
  return hosts.some((h) => (h.startsWith('*.') ? name.endsWith(h.slice(1)) && name.length > h.length - 1 : name === h))
}

/**
 * Outside requests from a plugin's server code: https only, and only to the
 * hosts its manifest declares — everything else is refused. Redirects are not
 * followed (a redirect could leave the allowlist).
 *
 *   await integrationFetch(event, '@mframework/my-plugin', 'https://api.example.com/v1/x')
 */
export async function integrationFetch<T = unknown>(
  event: H3Event | undefined, plugin: string, url: string, options: Record<string, any> = {},
): Promise<T> {
  const entry = integrationsConfig(event).registry.find((p) => p.plugin === plugin)
  assertHostAllowed(entry?.hosts ?? [], url, plugin)
  return $fetch<T>(url, { redirect: 'manual', ...options })
}

export function assertHostAllowed(hosts: string[], url: string, plugin = 'This integration') {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid outside URL' })
  }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || !hostAllowed(hosts, parsed.hostname)) {
    throw createError({ statusCode: 403, statusMessage: `${plugin} may not connect to ${parsed.hostname || 'that address'}` })
  }
}
