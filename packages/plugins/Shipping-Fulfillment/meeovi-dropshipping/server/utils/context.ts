import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'
import { createError, getRequestHeader } from 'h3'
import type { H3Event } from 'h3'
import { MagentoAdapter } from 'adapter-magento'
import type { MagentoOAuth1Credentials } from 'adapter-magento'
import type { Credentials } from '../providers/types'

/**
 * Shared plumbing: runtime config, the Directus store (static token —
 * these collections are server-only, denied to the /api/cms proxy), the
 * seller check, credential encryption and the Magento Integration client.
 */

const clean = (value: unknown) => String(value ?? '').trim().replace(/^(['"])(.*)\1$/, '$2')

export function dropshipConfig(event?: H3Event) {
  const own = (useRuntimeConfig(event) as Record<string, any>).meeoviDropshipping ?? {}
  return {
    sessionEndpoint: own.sessionEndpoint || '/api/auth/get-session',
    roles: (own.roles ?? ['seller', 'admin']) as string[],
    providers: (own.providers ?? ['printful', 'cj']) as string[],
    printOnDemandQty: Number(own.printOnDemandQty ?? 999),
    secret: clean(own.secret),
    directus: { url: clean(own.directus?.url).replace(/\/+$/, ''), token: clean(own.directus?.token) },
    magento: {
      graphqlUrl: clean(own.magento?.graphqlUrl),
      credentials: {
        consumerKey: clean(own.magento?.consumerKey),
        consumerSecret: clean(own.magento?.consumerSecret),
        accessToken: clean(own.magento?.accessToken),
        accessTokenSecret: clean(own.magento?.accessTokenSecret),
      } as MagentoOAuth1Credentials,
    },
  }
}

// ---------------------------------------------------------------------------
// Directus

export function directus(event?: H3Event) {
  const { directus: { url, token } } = dropshipConfig(event)
  if (!url || !token) throw createError({ statusCode: 503, statusMessage: 'Dropshipping is not configured' })
  return <T>(path: string, options: Record<string, any> = {}) =>
    $fetch<T>(`${url}${path}`, { timeout: 20000, ...options, headers: { Authorization: `Bearer ${token}`, ...options.headers } })
}

// ---------------------------------------------------------------------------
// Seller

export interface Seller {
  id: string
  magentoCustomerId: number
  isAdmin: boolean
}

/** The signed-in user, if they hold a dropshipping role and a Magento customer. */
export async function requireSeller(event: H3Event): Promise<Seller> {
  const config = dropshipConfig(event)
  const cookie = getRequestHeader(event, 'cookie')
  const session = cookie
    ? await $fetch<{ user?: { id?: string, role?: string, magentoCustomerId?: string | number | null } } | null>(
        config.sessionEndpoint, { headers: { cookie } }).catch(() => null)
    : null
  const user = session?.user
  if (!user?.id) throw createError({ statusCode: 401, statusMessage: 'Sign in to manage suppliers' })
  const roles = String(user.role || '').split(',').map((r) => r.trim())
  if (!config.roles.some((r) => roles.includes(r))) {
    throw createError({ statusCode: 403, statusMessage: 'Only sellers can connect suppliers' })
  }
  const magentoCustomerId = Number(user.magentoCustomerId)
  if (!Number.isInteger(magentoCustomerId) || magentoCustomerId <= 0) {
    throw createError({ statusCode: 409, statusMessage: 'Your account is not linked to a marketplace seller yet' })
  }
  await requireInstalled(event, cookie!)
  return { id: String(user.id), magentoCustomerId, isAdmin: roles.includes('admin') }
}

const PLUGIN = '@mframework/meeovi-dropshipping'

// ---------------------------------------------------------------------------
// Outside hosts — only what the integration manifest declares
// (package.json `mframework.integration.hosts`); these defaults apply when
// the app doesn't use @mframework/meeovi-integrations.

const DEFAULT_HOSTS = ['api.printful.com', '*.printful.com', 'developers.cjdropshipping.com', '*.cjdropshipping.com']

function allowedHosts(): string[] {
  const config = typeof useRuntimeConfig === 'function' ? useRuntimeConfig() as Record<string, any> : {}
  const registry = config.meeoviIntegrations?.registry
  const entry = Array.isArray(registry) ? registry.find((p: { plugin?: string }) => p.plugin === PLUGIN) : null
  return Array.isArray(entry?.hosts) ? entry.hosts : DEFAULT_HOSTS
}

const hostMatches = (hosts: string[], hostname: string) => {
  const name = hostname.toLowerCase().replace(/\.$/, '')
  return hosts.some((h) => (h.startsWith('*.') ? name.endsWith(h.slice(1)) && name.length > h.length - 1 : name === h))
}

/** Refuse any outside request to a host the integration didn't declare. */
export function assertAllowedHost(url: string | URL) {
  const parsed = new URL(String(url))
  if (parsed.protocol !== 'https:' || !hostMatches(allowedHosts(), parsed.hostname)) {
    throw createError({ statusCode: 403, statusMessage: `Dropshipping may not connect to ${parsed.hostname}` })
  }
}

export function isAllowedHost(url: string | URL): boolean {
  try {
    assertAllowedHost(url)
    return true
  } catch {
    return false
  }
}

/**
 * When the app uses per-user integrations (@mframework/meeovi-integrations),
 * dropshipping is on only for sellers who installed it.
 */
async function requireInstalled(event: H3Event, cookie: string) {
  const apiBase = (useRuntimeConfig(event) as Record<string, any>).public?.meeoviIntegrations?.apiBase
  if (!apiBase) return
  const installed = await $fetch<{ plugins?: string[] }>(`${apiBase}/installed`, { headers: { cookie } })
    .catch(() => ({ plugins: [] as string[] }))
  if (!installed.plugins?.includes(PLUGIN)) {
    throw createError({ statusCode: 403, statusMessage: 'Install Dropshipping from Integrations to connect suppliers' })
  }
}

// ---------------------------------------------------------------------------
// Credentials at rest: AES-256-GCM, key derived from NUXT_DROPSHIP_SECRET.

function key(event?: H3Event) {
  const { secret } = dropshipConfig(event)
  if (secret.length < 32) {
    throw createError({ statusCode: 503, statusMessage: 'Dropshipping is not configured (NUXT_DROPSHIP_SECRET)' })
  }
  return createHash('sha256').update(`meeovi-dropshipping:${secret}`).digest()
}

export function sealCredentials(credentials: Credentials, event?: H3Event): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key(event), iv)
  const body = Buffer.concat([cipher.update(JSON.stringify(credentials), 'utf8'), cipher.final()])
  return ['v1', iv.toString('base64'), cipher.getAuthTag().toString('base64'), body.toString('base64')].join('.')
}

export function openCredentials(sealed: string, event?: H3Event): Credentials {
  const [version, iv, tag, body] = String(sealed).split('.')
  if (version !== 'v1' || !iv || !tag || !body) throw new Error('Unreadable credentials')
  const decipher = createDecipheriv('aes-256-gcm', key(event), Buffer.from(iv, 'base64'))
  decipher.setAuthTag(Buffer.from(tag, 'base64'))
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(body, 'base64')), decipher.final()]).toString('utf8'))
}

// ---------------------------------------------------------------------------
// Magento (Integration token, OAuth 1.0a)

let adapter: MagentoAdapter | null = null

export function magento(event?: H3Event) {
  const { magento: m } = dropshipConfig(event)
  const c = m.credentials
  if (!m.graphqlUrl || !c.consumerKey || !c.consumerSecret || !c.accessToken || !c.accessTokenSecret) {
    throw createError({ statusCode: 503, statusMessage: 'Magento is not configured for dropshipping' })
  }
  adapter ??= new MagentoAdapter(m.graphqlUrl)
  return { sync: adapter.catalogSync, credentials: c }
}

// ---------------------------------------------------------------------------
// Ids

export const ID = /^[A-Za-z0-9_-]{1,64}$/

/** Magento SKU for a supplier variant — seller-scoped so sellers can't collide. */
export function skuFor(provider: string, magentoCustomerId: number, variantId: string): string {
  const safe = variantId.replace(/[^A-Za-z0-9-]/g, '')
  return `DS-${provider.toUpperCase()}-${magentoCustomerId}-${safe}`.slice(0, 128)
}

export const SKU_PREFIX = /^DS-(PRINTFUL|CJ)-(\d+)-/
