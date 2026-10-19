import type {
  CommerceEvent,
  PurchaseCompletedEvent,
  PurchasePartiallyRefundedEvent,
  PurchaseRefundedEvent,
  SubscriptionCancelledEvent,
  SubscriptionExpiredEvent,
  SubscriptionRenewedEvent,
} from './interfaces'

export type {
  CommerceEvent,
  PurchaseCompletedEvent,
  PurchasePartiallyRefundedEvent,
  PurchaseRefundedEvent,
  SubscriptionCancelledEvent,
  SubscriptionExpiredEvent,
  SubscriptionRenewedEvent,
}

export type LicensingEventName =
  | 'license.activated'
  | 'license.revoked'
  | 'license.expired'
  | 'plugin.installed'
  | 'plugin.removed'

export interface LicensingEvent {
  event: LicensingEventName
  licenseId: string
  reason?: string
  pluginId?: string
}