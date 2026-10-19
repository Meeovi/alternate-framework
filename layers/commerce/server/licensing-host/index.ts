/**
 * The app's licensing host: wires the licensing module (../licensing) to
 * this app — Postgres storage and idempotency, better-auth identity,
 * organisation membership, commerce product keys, and Nitro hooks for
 * webhook events.
 *
 * Workspaces: every user's /workspace is their own, so a user manages the
 * workspace whose id is their user id. Organisations: better-auth
 * organisation owners and admins manage theirs.
 */
import { and, eq, inArray } from 'drizzle-orm'
import { getHeader, setResponseStatus, type H3Event } from 'h3'
import { useNitroApp } from 'nitropack/runtime'
import { db } from '#auth/server/utils/drizzle'
import { getAuthSession } from '#auth/server/utils/sessions'
import { authOrganizationMembers } from '#auth/server/database/migrations/schema'
import {
  createLicensingModule, IDEMPOTENCY_HEADER, LicensingError, licensingErrorResponse,
  type AuthenticatedUser, type LicensingEvent, type LicensingModule, type ProductLicense,
} from '../licensing'
import { parseProductRef } from '../utils/productRef'
import { PostgresIdempotency, PostgresLicenseRepository } from './postgres'

declare module 'nitropack/types' {
  interface NitroRuntimeHooks {
    /** A licensing webhook event (license.activated, plugin.installed, …). */
    'licensing:event': (event: LicensingEvent) => void | Promise<void>
  }
}

let licensingModule: LicensingModule | null = null
/** Direct storage access for host code (offers, download counts). */
export const repository = () => new PostgresLicenseRepository(db)

/** The app's licensing module (one per server process). */
export function useLicensing(): LicensingModule {
  licensingModule ??= createLicensingModule({
    repository: repository(),
    idempotency: new PostgresIdempotency(db),
    products: {
      // Directus ids, or `<backend>:<key>` for an installed commerce backend.
      getProduct: async (id) => (parseProductRef(id) ? { id } : null),
    },
    // Commerce events carry what licensing needs; nothing is looked up.
    purchases: { getPurchase: async () => null },
    subscriptions: { getSubscription: async () => null },
    // Request identity is passed to forRequest (licensingFor below).
    authenticatedUser: { getAuthenticatedUser: async () => null },
    workspaces: {
      userCanManageWorkspace: async (user, workspaceId) => workspaceId === user.id,
      userCanManageOrganisation: async (user, organisationId) => {
        if (!/^[0-9a-f-]{36}$/i.test(organisationId)) return false
        const [member] = await db.select({ role: authOrganizationMembers.role }).from(authOrganizationMembers)
          .where(and(eq(authOrganizationMembers.userId, user.id), eq(authOrganizationMembers.organizationId, organisationId), inArray(authOrganizationMembers.role, ['owner', 'admin'])))
          .limit(1)
        return !!member
      },
    },
    outlets: { userCanAccessOutlet: async () => false },
    integrations: { isIntegrationAvailable: async () => true },
    events: {
      async publish(event: LicensingEvent) {
        console.info(`[licensing] ${event.event} ${event.licenseId}${'pluginId' in event ? ` ${event.pluginId}` : ''}${'reason' in event ? ` (${event.reason})` : ''}`)
        // Subscribers: nitroApp.hooks.hook('licensing:event', (event) => …)
        await useNitroApp().hooks.callHook('licensing:event', event)
      },
    },
  })
  return licensingModule
}

/** The signed-in user as licensing sees them, or null. */
export async function licensingUser(event: H3Event): Promise<AuthenticatedUser | null> {
  const session = await getAuthSession(event).catch(() => null)
  const user = session?.user as { id?: string, role?: string | null } | undefined
  if (!user?.id) return null
  return {
    id: user.id,
    roles: String(user.role || 'user').split(',').map((r) => r.trim()).filter(Boolean),
    identityProvider: 'meeovi',
    workspaceIds: [user.id],
  }
}

/** Request-scoped licensing services for this request's user and Idempotency-Key. */
export async function licensingFor(event: H3Event) {
  const user = await licensingUser(event)
  const idempotencyKey = getHeader(event, IDEMPOTENCY_HEADER)?.trim() || undefined
  return { user, ...useLicensing().forRequest({ user, idempotencyKey }) }
}

/**
 * Runs a licensing route and answers in the contract's envelope:
 * `{ success: true, data }` with the endpoint's success status (204 → no
 * body), or `{ success: false, error }` with the error's status.
 */
export async function licensingResponse<T>(event: H3Event, successStatus: number, run: () => Promise<T>) {
  try {
    const data = await run()
    setResponseStatus(event, successStatus)
    return successStatus === 204 ? null : { success: true as const, data }
  } catch (error) {
    if (error instanceof LicensingError) {
      setResponseStatus(event, error.status)
      return error.toResponse()
    }
    // h3 errors (e.g. the site rate limiter) keep their status.
    const status = (error as { statusCode?: number })?.statusCode
    if (status === 429) {
      setResponseStatus(event, 429)
      return licensingErrorResponse('RATE_LIMITED', 'Too many requests')
    }
    console.error('[licensing] request failed', error)
    setResponseStatus(event, 500)
    return licensingErrorResponse('INTERNAL_ERROR', 'Something went wrong. Please try again.')
  }
}

/** Route param, or 400 VALIDATION_ERROR. */
export function routeId(event: H3Event): string {
  const id = decodeURIComponent(event.context.params?.id ?? '')
  if (!id || id.length > 200) throw new LicensingError('VALIDATION_ERROR', 'Missing or invalid id')
  return id
}

/** A JSON body field that must be a non-empty string, or 400 VALIDATION_ERROR. */
export function bodyString(body: unknown, field: string, max = 200): string {
  const value = (body as Record<string, unknown> | null)?.[field]
  if (typeof value !== 'string' || !value.trim() || value.length > max) {
    throw new LicensingError('VALIDATION_ERROR', `\`${field}\` is required`, { field })
  }
  return value.trim()
}

/** Signed-in user, or 401 AUTH_REQUIRED. */
export function requireLicensingUser(user: AuthenticatedUser | null): AuthenticatedUser {
  if (!user) throw new LicensingError('AUTH_REQUIRED', 'Sign in to manage licenses')
  return user
}

// ---------------------------------------------------------------------------
// Default offers for paid integrations

/** The license type new integration offers use (users install them on themselves). */
export const INTEGRATION_LICENSE_TYPE = 'personal'

/** The default offer's id for a product key. */
export const defaultOfferId = (productKey: string) => `default:${productKey}`

/**
 * The default license offer for a paid integration, created on first use
 * under the newest active terms of the integration license type, at the
 * store's price. Kept in step with the store price; its terms version is
 * only set at creation (later purchases get the newest version anyway).
 */
export async function ensureIntegrationOffer(input: { productKey: string, title: string, price: number, pluginId: string }): Promise<ProductLicense> {
  const repo = repository()
  const id = defaultOfferId(input.productKey)
  const existing = await repo.getProductLicense(id)
  if (existing && existing.price === input.price && existing.title === input.title && existing.metadata?.pluginId === input.pluginId) return existing
  const versions = (await repo.listLicenseTypeVersions(INTEGRATION_LICENSE_TYPE)).filter((v) => v.active)
  const version = existing?.licenseVersionId ?? versions.at(-1)?.id
  if (!version) throw new Error(`No active terms version for the ${INTEGRATION_LICENSE_TYPE} license type (run the licensing migration)`)
  return repo.saveProductLicense({
    id,
    productId: input.productKey,
    licenseTypeId: INTEGRATION_LICENSE_TYPE,
    licenseVersionId: version,
    title: input.title,
    price: input.price,
    active: true,
    subscriptionBased: false,
    metadata: { ...(existing?.metadata ?? {}), pluginId: input.pluginId, source: 'integration' },
    createdAt: existing?.createdAt ?? new Date(),
  })
}
