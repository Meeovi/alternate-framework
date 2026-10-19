/**
 * Service contracts and host ports (v1.0).
 *
 * Licensing owns licenses, installations, download records and terms
 * versions. Everything else — products, purchases, subscriptions, users,
 * workspaces, storage, idempotency storage, event delivery — is reached
 * through the host interfaces below, so the module has no commerce,
 * auth or storage dependency.
 */
import type { CommerceEvent, LicensingEvent } from './events'
import type {
  LicenseDownload,
  LicenseInstallation,
  LicenseInstallationTargetType,
  LicenseType,
  LicenseTypeVersion,
  ProductLicense,
  UserLicense,
} from './models'

// ---------------------------------------------------------------------------
// Host references (normalized by the host from its commerce/auth backends)
// ---------------------------------------------------------------------------

export interface Product {
  id: string
  tenantId?: string
  metadata?: Record<string, unknown>
}

export interface Purchase {
  /** Commerce purchase (order line) reference; one license per (id, productLicenseId). */
  id: string
  userId: string
  productId: string
  /** The ProductLicense (offer) bought. */
  productLicenseId: string
  status: string
  completedAt?: Date
  metadata?: Record<string, unknown>
}

export interface Subscription {
  id: string
  userId: string
  productId: string
  status: string
  currentPeriodEndsAt?: Date
  metadata?: Record<string, unknown>
}

/**
 * The signed-in caller, as resolved by the host's identity integration.
 * Licensing consumes identity; it never authenticates.
 */
export interface AuthenticatedUser {
  id: string
  roles: readonly string[]
  /** Which identity integration resolved the user: `meeovi`, `sso`, `federated`, or a future adapter's name. */
  identityProvider?: 'meeovi' | 'sso' | 'federated' | (string & {})
  tenantId?: string
  workspaceIds?: readonly string[]
  organisationIds?: readonly string[]
}

// ---------------------------------------------------------------------------
// Host providers
// ---------------------------------------------------------------------------

export interface ProductProvider {
  getProduct(productId: string): Promise<Product | null>
}

export interface PurchaseProvider {
  getPurchase(purchaseId: string): Promise<Purchase | null>
}

export interface SubscriptionProvider {
  getSubscription(subscriptionId: string): Promise<Subscription | null>
}

/**
 * Identity host interface. One implementation per identity integration
 * (Meeovi Auth, SSO, federated identity, future adapters), or one that
 * delegates between them.
 */
export interface AuthenticatedUserProvider {
  getAuthenticatedUser(): Promise<AuthenticatedUser | null>
}

export interface WorkspaceProvider {
  userCanManageWorkspace(user: AuthenticatedUser, workspaceId: string): Promise<boolean>
  userCanManageOrganisation(user: AuthenticatedUser, organisationId: string): Promise<boolean>
}

export interface OutletProvider {
  userCanAccessOutlet(user: AuthenticatedUser, outletId: string): Promise<boolean>
}

export interface IntegrationProvider {
  isIntegrationAvailable(integrationId: string): Promise<boolean>
}

// ---------------------------------------------------------------------------
// Storage port
// ---------------------------------------------------------------------------

/**
 * Persistence, implemented by a storage provider. Implementations must
 * enforce the uniqueness rules: one UserLicense per (purchaseId,
 * productLicenseId), a unique licenseKey, and one active installation per
 * (userLicenseId, targetType, targetId).
 */
export interface LicenseRepository {
  saveLicenseType(licenseType: LicenseType): Promise<LicenseType>
  getLicenseType(licenseTypeId: string): Promise<LicenseType | null>
  /** Creates a version; must reject an existing id (versions are immutable). */
  insertLicenseTypeVersion(version: LicenseTypeVersion): Promise<LicenseTypeVersion>
  getLicenseTypeVersion(versionId: string): Promise<LicenseTypeVersion | null>
  listLicenseTypeVersions(licenseTypeId: string): Promise<LicenseTypeVersion[]>
  saveProductLicense(productLicense: ProductLicense): Promise<ProductLicense>
  getProductLicense(productLicenseId: string): Promise<ProductLicense | null>

  getUserLicense(licenseId: string): Promise<UserLicense | null>
  findUserLicenseByPurchase(purchaseId: string, productLicenseId?: string): Promise<UserLicense[]>
  listUserLicenses(userId: string): Promise<UserLicense[]>
  listUserLicensesForProduct(userId: string, productId: string): Promise<UserLicense[]>
  saveUserLicense(license: UserLicense): Promise<UserLicense>

  getInstallation(installationId: string): Promise<LicenseInstallation | null>
  listInstallations(licenseId: string): Promise<LicenseInstallation[]>
  saveInstallation(installation: LicenseInstallation): Promise<LicenseInstallation>

  insertDownload(download: LicenseDownload): Promise<LicenseDownload>
  countDownloads(licenseId: string): Promise<number>
}

/**
 * Idempotency store. `execute` runs the operation once per key and returns
 * the stored result on retries. `fingerprint` identifies the request
 * (operation + target + body); reusing a key with a different fingerprint
 * must fail with DUPLICATE_IDEMPOTENCY_KEY.
 */
export interface IdempotencyProvider {
  execute<T>(key: string, fingerprint: string, operation: () => Promise<T>): Promise<T>
}

export interface LicensingEventPublisher {
  publish(event: LicensingEvent): Promise<void>
}

// ---------------------------------------------------------------------------
// Services (frozen methods)
// ---------------------------------------------------------------------------

export interface LicensingService {
  /** Issues the license for a completed purchase (idempotent per purchase). */
  createLicense(purchase: Purchase): Promise<UserLicense>
  activateLicense(licenseId: string): Promise<UserLicense>
  revokeLicense(licenseId: string, reason: string): Promise<UserLicense>
  expireLicense(licenseId: string): Promise<UserLicense>
  renewLicense(licenseId: string): Promise<UserLicense>
  /** Whether the user holds a license granting access to the product now. */
  validateLicense(userId: string, productId: string): Promise<boolean>
  getLicense(licenseId: string): Promise<UserLicense>
  listUserLicenses(userId: string): Promise<UserLicense[]>
}

export interface InstallationService {
  install(licenseId: string, targetType: LicenseInstallationTargetType, targetId: string): Promise<LicenseInstallation>
  uninstall(installationId: string): Promise<void>
  listInstallations(licenseId: string): Promise<LicenseInstallation[]>
}

export interface DownloadService {
  authorizeDownload(userId: string, productId: string): Promise<boolean>
  recordDownload(licenseId: string, fileId: string): Promise<void>
}

/** Platform administrators: templates, terms versions and product offers. */
export interface LicenseCatalogService {
  createLicenseType(licenseType: LicenseType): Promise<LicenseType>
  createLicenseTypeVersion(version: LicenseTypeVersion): Promise<LicenseTypeVersion>
  listLicenseTypeVersions(licenseTypeId: string): Promise<LicenseTypeVersion[]>
  createProductLicense(productLicense: ProductLicense): Promise<ProductLicense>
}

/** Applies normalized commerce events (see events.ts for each event's effect). */
export interface CommerceEventHandler {
  handle(event: CommerceEvent): Promise<void>
}

// ---------------------------------------------------------------------------
// Module wiring
// ---------------------------------------------------------------------------

export interface LicensingModuleDependencies {
  products: ProductProvider
  purchases: PurchaseProvider
  subscriptions: SubscriptionProvider
  authenticatedUser: AuthenticatedUserProvider
  workspaces: WorkspaceProvider
  outlets: OutletProvider
  integrations: IntegrationProvider
  repository: LicenseRepository
  idempotency: IdempotencyProvider
  events: LicensingEventPublisher
  /** Defaults to the system clock. */
  now?: () => Date
  /** Defaults to random UUIDs. */
  generateId?: () => string
  /** Defaults to a random, unguessable key. */
  generateLicenseKey?: () => string
}

/**
 * Per-request context. Services are created per request so the frozen
 * method signatures carry no caller or key parameters.
 */
export interface LicensingRequestContext {
  user: AuthenticatedUser | null
  /** The request's Idempotency-Key header (required for state changes). */
  idempotencyKey?: string
}

export interface LicensingModule {
  forRequest(context: LicensingRequestContext): {
    licensing: LicensingService
    installations: InstallationService
    downloads: DownloadService
    catalog: LicenseCatalogService
  }
  /** Commerce events come from the host, not a user request. */
  commerceEvents: CommerceEventHandler
}

export type LicensingModuleFactory = (dependencies: LicensingModuleDependencies) => LicensingModule
