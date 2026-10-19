/**
 * Event contracts (v1.0).
 *
 * Commerce events are what any commerce adapter (Magento, Shopify, …)
 * normalizes its own events into; licensing consumes only these. Webhook
 * events are what licensing emits. Names and payloads are frozen; both
 * kinds are validated with parseCommerceEvent / parseLicensingEvent.
 */

// ---------------------------------------------------------------------------
// Commerce events (consumed)
// ---------------------------------------------------------------------------

export const COMMERCE_EVENT_NAMES = [
  'purchase.completed',
  'purchase.refunded',
  'subscription.renewed',
  'subscription.expired',
  'subscription.cancelled',
] as const
export type CommerceEventName = typeof COMMERCE_EVENT_NAMES[number]

/** Payment captured → issue a UserLicense (idempotent per purchaseId). */
export interface PurchaseCompletedEvent {
  event: 'purchase.completed'
  /** Commerce purchase (order line) reference. */
  purchaseId: string
  userId: string
  productId: string
  /** The ProductLicense (offer) bought. */
  licenseId: string
}

/** Full refund → revoke the license, disable installations and downloads. */
export interface PurchaseRefundedEvent {
  event: 'purchase.refunded'
  purchaseId: string
}

/** Subscription payment succeeded → extend the license's expiry. */
export interface SubscriptionRenewedEvent {
  event: 'subscription.renewed'
  /** The UserLicense. */
  licenseId: string
  /** New end of the paid period; defaults to expiresAfterDays from the old expiry. */
  currentPeriodEndsAt?: Date
}

/** Subscription ended → mark expired; downloads and installations stop. */
export interface SubscriptionExpiredEvent {
  event: 'subscription.expired'
  licenseId: string
}

/** User cancelled → no change now; access continues until the period ends. */
export interface SubscriptionCancelledEvent {
  event: 'subscription.cancelled'
  licenseId: string
  /** When access ends; the license expires then (subscription.expired). */
  currentPeriodEndsAt: Date
}

export type CommerceEvent =
  | PurchaseCompletedEvent
  | PurchaseRefundedEvent
  | SubscriptionRenewedEvent
  | SubscriptionExpiredEvent
  | SubscriptionCancelledEvent

// ---------------------------------------------------------------------------
// Webhook events (emitted)
// ---------------------------------------------------------------------------

export const LICENSING_EVENT_NAMES = [
  'license.activated',
  'license.revoked',
  'license.expired',
  'plugin.installed',
  'plugin.removed',
] as const
export type LicensingEventName = typeof LICENSING_EVENT_NAMES[number]

export interface LicenseActivatedEvent {
  event: 'license.activated'
  licenseId: string
}

export interface LicenseRevokedEvent {
  event: 'license.revoked'
  licenseId: string
  /** e.g. `refund`, `fraud`, `admin`. */
  reason: string
}

export interface LicenseExpiredEvent {
  event: 'license.expired'
  licenseId: string
}

export interface PluginInstalledEvent {
  event: 'plugin.installed'
  /** The installed integration's id, e.g. `french-language-pack`. */
  pluginId: string
  licenseId: string
}

export interface PluginRemovedEvent {
  event: 'plugin.removed'
  pluginId: string
  licenseId: string
}

export type LicensingEvent =
  | LicenseActivatedEvent
  | LicenseRevokedEvent
  | LicenseExpiredEvent
  | PluginInstalledEvent
  | PluginRemovedEvent

// ---------------------------------------------------------------------------
// Schemas and validation (no runtime dependencies)
// ---------------------------------------------------------------------------

type FieldType = 'string' | 'date'
interface EventSchema { required: Readonly<Record<string, FieldType>>, optional?: Readonly<Record<string, FieldType>> }

export const COMMERCE_EVENT_SCHEMAS: Readonly<Record<CommerceEventName, EventSchema>> = {
  'purchase.completed': { required: { purchaseId: 'string', userId: 'string', productId: 'string', licenseId: 'string' } },
  'purchase.refunded': { required: { purchaseId: 'string' } },
  'subscription.renewed': { required: { licenseId: 'string' }, optional: { currentPeriodEndsAt: 'date' } },
  'subscription.expired': { required: { licenseId: 'string' } },
  'subscription.cancelled': { required: { licenseId: 'string', currentPeriodEndsAt: 'date' } },
}

export const LICENSING_EVENT_SCHEMAS: Readonly<Record<LicensingEventName, EventSchema>> = {
  'license.activated': { required: { licenseId: 'string' } },
  'license.revoked': { required: { licenseId: 'string', reason: 'string' } },
  'license.expired': { required: { licenseId: 'string' } },
  'plugin.installed': { required: { pluginId: 'string', licenseId: 'string' } },
  'plugin.removed': { required: { pluginId: 'string', licenseId: 'string' } },
}

export class EventSchemaError extends Error {
  constructor(message: string, readonly details: Record<string, unknown> = {}) {
    super(message)
    this.name = 'EventSchemaError'
  }
}

function parseWith<N extends string, E>(schemas: Readonly<Record<N, EventSchema>>, input: unknown): E {
  if (!input || typeof input !== 'object') throw new EventSchemaError('Event must be an object')
  const raw = input as Record<string, unknown>
  const name = raw.event
  if (typeof name !== 'string' || !Object.prototype.hasOwnProperty.call(schemas, name)) throw new EventSchemaError('Unknown event', { event: name })
  const schema = schemas[name as N]
  const out: Record<string, unknown> = { event: name }
  const fields: Array<[string, FieldType, boolean]> = [
    ...Object.entries(schema.required).map(([k, t]) => [k, t, true] as [string, FieldType, boolean]),
    ...Object.entries(schema.optional ?? {}).map(([k, t]) => [k, t, false] as [string, FieldType, boolean]),
  ]
  for (const [key, type, required] of fields) {
    const value = raw[key]
    if (value === undefined || value === null) {
      if (required) throw new EventSchemaError(`Missing field ${key}`, { event: name, field: key })
      continue
    }
    if (type === 'string') {
      if (typeof value !== 'string' || !value.trim()) throw new EventSchemaError(`Field ${key} must be a non-empty string`, { event: name, field: key })
      out[key] = value
    } else {
      const date = value instanceof Date ? value : typeof value === 'string' || typeof value === 'number' ? new Date(value) : null
      if (!date || Number.isNaN(date.getTime())) throw new EventSchemaError(`Field ${key} must be a date`, { event: name, field: key })
      out[key] = date
    }
  }
  return out as E
}

/** Validates and normalizes a commerce event (ISO date strings → Date). Unknown fields are dropped. */
export function parseCommerceEvent(input: unknown): CommerceEvent {
  return parseWith<CommerceEventName, CommerceEvent>(COMMERCE_EVENT_SCHEMAS, input)
}

/** Validates a licensing webhook event before it's published. */
export function parseLicensingEvent(input: unknown): LicensingEvent {
  return parseWith<LicensingEventName, LicensingEvent>(LICENSING_EVENT_SCHEMAS, input)
}
