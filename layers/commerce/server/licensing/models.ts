/**
 * Licensing domain model — contract v1.0, frozen 19 October 2026 (see
 * docs/architecture/licensing-contract-freeze-v1.md).
 *
 * Product and user ids are opaque references owned by the host (commerce
 * and auth); nothing here depends on a commerce backend, auth provider or
 * storage provider.
 */

export const LICENSING_CONTRACT_VERSION = '1.0'

// ---------------------------------------------------------------------------
// LicenseType: reusable licensing templates
// ---------------------------------------------------------------------------

/**
 * What a license is for. Finalized for v1.0:
 * - `personal`: one person's own, non-commercial use.
 * - `commercial`: use in commercial work by the licensee.
 * - `workspace`: shared by a Meeovi workspace (installed per workspace).
 * - `organisation`: shared across an organisation's workspaces and members.
 * - `exclusive`: sold once; the seller stops offering it to others.
 * - `subscription`: rights last only while a subscription is current.
 */
export const LICENSE_SCOPES = ['personal', 'commercial', 'workspace', 'organisation', 'exclusive', 'subscription'] as const
export type LicenseScope = typeof LICENSE_SCOPES[number]

/**
 * Rights a license grants. Finalized for v1.0; every flag is required
 * (no implied defaults), so a template states each right explicitly.
 */
export interface LicensePermissions {
  /** Use by the licensee for their own, non-commercial purposes. */
  personalUse: boolean
  /** Use in work that earns money for the licensee. */
  commercialUse: boolean
  /** Use in work delivered to the licensee's clients. */
  clientProjects: boolean
  /** Editing or creating derivatives of the asset. */
  modification: boolean
  /** Passing the asset (or derivatives) on, free of charge. */
  redistribution: boolean
  /** Selling the asset itself (not just work that contains it). */
  resale: boolean
  /** Whether use must credit the creator. */
  attributionRequired: boolean
}

export const LICENSE_PERMISSION_KEYS = [
  'personalUse',
  'commercialUse',
  'clientProjects',
  'modification',
  'redistribution',
  'resale',
  'attributionRequired',
] as const satisfies readonly (keyof LicensePermissions)[]

/** A reusable licensing template, e.g. "Commercial License". */
export interface LicenseType {
  /** Stable id. */
  id: string
  /** URL-safe unique name, e.g. `commercial`. */
  slug: string
  /** Display name, e.g. "Commercial License". */
  name: string
  /** Plain-language summary shown to buyers. */
  description: string
  scope: LicenseScope
  permissions: LicensePermissions
  /** Inactive templates can't be attached to new product offers. */
  active: boolean
  createdAt: Date
  updatedAt: Date
}

// ---------------------------------------------------------------------------
// LicenseTypeVersion: immutable, versioned terms (rules in versioning.ts)
// ---------------------------------------------------------------------------

/**
 * One version of a template's legal terms. Immutable once created: a
 * change of terms is a new version, never an edit. Every UserLicense keeps
 * the version it was issued under.
 */
export interface LicenseTypeVersion {
  readonly id: string
  readonly licenseTypeId: string
  /** `<major>.<minor>`, e.g. `1.0`, `1.1`, `2.0` (see versioning.ts). */
  readonly version: string
  readonly title: string
  /** Full terms text (Markdown). */
  readonly terms: string
  /** When these terms apply to new purchases. */
  readonly effectiveDate: Date
  /** Offered to new purchasers. Existing licenses keep their version regardless. */
  readonly active: boolean
  readonly createdAt: Date
}

// ---------------------------------------------------------------------------
// ProductLicense: a license offer attached to a product
// ---------------------------------------------------------------------------

/**
 * A license offer on a product, e.g. "Modern Icon Pack — Commercial £29".
 *
 * Pricing: `price` is a decimal amount in the selling store's currency, as
 * the commerce backend charges it (licensing never takes payment). A
 * product can carry several offers at different prices.
 *
 * Subscriptions: when `subscriptionBased` is true, the license lasts only
 * while the host's subscription is current; renewal and expiry arrive as
 * commerce events. `expiresAfterDays` sets the first period's length when
 * the host doesn't supply one.
 *
 * Limits: an omitted limit means unlimited; `0` means none allowed.
 */
export interface ProductLicense {
  id: string
  /** Host product reference (opaque). */
  productId: string
  licenseTypeId: string
  /** Terms version issued to new purchasers of this offer. */
  licenseVersionId: string
  title: string
  price: number
  /** Inactive offers can't be bought; issued licenses are unaffected. */
  active: boolean
  subscriptionBased: boolean
  /** Downloads allowed per issued license (omitted = unlimited). */
  maxDownloads?: number
  /** Active installations allowed per issued license (omitted = unlimited). */
  maxInstallations?: number
  /** License lifetime from activation, in days (omitted = perpetual). */
  expiresAfterDays?: number
  metadata?: Record<string, unknown>
  createdAt: Date
}

/** Whether another use is allowed under a limit (omitted = unlimited, 0 = none). */
export function withinLimit(limit: number | undefined, used: number): boolean {
  return limit === undefined || used < limit
}

// ---------------------------------------------------------------------------
// UserLicense: purchased rights
// ---------------------------------------------------------------------------

/**
 * Status values, frozen for v1.0:
 * - `active`: rights in force (downloads and installs allowed).
 * - `expired`: term or subscription ended; can be renewed.
 * - `revoked`: withdrawn (refund, fraud, admin); final.
 * - `suspended`: temporarily withdrawn by a platform administrator.
 *
 * There is no `partial_refund` status: a partial refund leaves rights
 * unchanged, so the license stays `active` (see the freeze checklist's
 * resolved decision).
 */
export const USER_LICENSE_STATUSES = ['active', 'expired', 'revoked', 'suspended'] as const
export type UserLicenseStatus = typeof USER_LICENSE_STATUSES[number]

/**
 * The license lifecycle: which status changes are allowed. `revoked` is
 * final. New licenses are created `active`.
 */
export const USER_LICENSE_TRANSITIONS: Readonly<Record<UserLicenseStatus, readonly UserLicenseStatus[]>> = {
  active: ['expired', 'revoked', 'suspended'],
  expired: ['active', 'revoked'],
  suspended: ['active', 'revoked', 'expired'],
  revoked: [],
}

export function canTransition(from: UserLicenseStatus, to: UserLicenseStatus): boolean {
  return USER_LICENSE_TRANSITIONS[from].includes(to)
}

/** Statuses under which downloads and installations are allowed. */
export function grantsAccess(license: Pick<UserLicense, 'status' | 'expiresAt'>, now: Date = new Date()): boolean {
  return license.status === 'active' && (!license.expiresAt || license.expiresAt.getTime() > now.getTime())
}

/**
 * Rights a user bought. Purchase relationship: exactly one UserLicense per
 * (purchaseId, productLicenseId) — retried purchase events never issue a
 * second license. `purchaseId` is the commerce backend's purchase (order
 * line) reference.
 */
export interface UserLicense {
  id: string
  /** Unique, unguessable key shown to the buyer (e.g. for plugin activation). */
  licenseKey: string
  userId: string
  productId: string
  productLicenseId: string
  purchaseId: string
  /** LicenseTypeVersion issued with this license; never changes. */
  versionId: string
  status: UserLicenseStatus
  activatedAt?: Date
  /** Omitted = perpetual. */
  expiresAt?: Date
  metadata?: Record<string, unknown>
  createdAt: Date
}

// ---------------------------------------------------------------------------
// LicenseInstallation: plugins and other installable assets
// ---------------------------------------------------------------------------

/**
 * Where a license is installed:
 * - `user`: on the buyer's own account (personal plugins, language packs).
 * - `workspace`: into a workspace; managed by its administrators.
 * - `organisation`: across an organisation.
 */
export const INSTALLATION_TARGET_TYPES = ['user', 'workspace', 'organisation'] as const
export type LicenseInstallationTargetType = typeof INSTALLATION_TARGET_TYPES[number]

/**
 * One installation of a license. At most one active installation per
 * (userLicenseId, targetType, targetId); uninstalling sets `active` false
 * (kept for audit), and active installations count against
 * ProductLicense.maxInstallations.
 */
export interface LicenseInstallation {
  id: string
  userLicenseId: string
  targetType: LicenseInstallationTargetType
  targetId: string
  installedAt: Date
  active: boolean
}

// ---------------------------------------------------------------------------
// LicenseDownload: download audit trail
// ---------------------------------------------------------------------------

/**
 * One recorded download. Append-only audit record: never edited or
 * deleted while the license exists. Counts against
 * ProductLicense.maxDownloads.
 */
export interface LicenseDownload {
  id: string
  userLicenseId: string
  /** Host file reference (opaque). */
  fileId: string
  downloadedAt: Date
  /** e.g. user agent or IP hash, as the host's audit policy requires. */
  metadata?: Record<string, unknown>
}
