import type {
  LicenseInstallation,
  LicenseInstallationTargetType,
  LicenseType,
  LicenseTypeVersion,
  ProductLicense,
  UserLicense,
} from './models'

export interface Product {
  id: string
  tenantId?: string
  metadata?: Record<string, unknown>
}

export interface Purchase {
  id: string
  userId: string
  productId: string
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

export interface AuthenticatedUser {
  id: string
  roles: readonly string[]
  tenantId?: string
  workspaceIds?: readonly string[]
  organisationIds?: readonly string[]
}

export interface ProductProvider {
  getProduct(productId: string): Promise<Product | null>
}

export interface PurchaseProvider {
  getPurchase(purchaseId: string): Promise<Purchase | null>
}

export interface SubscriptionProvider {
  getSubscription(subscriptionId: string): Promise<Subscription | null>
}

export interface AuthenticatedUserProvider {
  getAuthenticatedUser(): Promise<AuthenticatedUser | null>
}

export interface WorkspaceProvider {
  userCanManageWorkspace(user: AuthenticatedUser, workspaceId: string): Promise<boolean>
}

export interface OutletProvider {
  userCanAccessOutlet(user: AuthenticatedUser, outletId: string): Promise<boolean>
}

export interface IntegrationProvider {
  isIntegrationAvailable(integrationId: string): Promise<boolean>
}

export interface LicenseRepository {
  createLicenseType(licenseType: LicenseType): Promise<LicenseType>
  getLicenseType(licenseTypeId: string): Promise<LicenseType | null>
  getProductLicense(productLicenseId: string): Promise<ProductLicense | null>
  getUserLicense(licenseId: string): Promise<UserLicense | null>
  findUserLicenseByPurchase(purchaseId: string): Promise<UserLicense | null>
  listUserLicenses(userId: string): Promise<UserLicense[]>
  saveUserLicense(license: UserLicense): Promise<UserLicense>
  getInstallation(installationId: string): Promise<LicenseInstallation | null>
  listInstallations(licenseId: string): Promise<LicenseInstallation[]>
  saveInstallation(installation: LicenseInstallation): Promise<LicenseInstallation>
  saveLicenseTypeVersion(version: LicenseTypeVersion): Promise<LicenseTypeVersion>
}

export interface IdempotencyProvider {
  execute<T>(key: string, operation: () => Promise<T>): Promise<T>
}

export interface LicensingEventPublisher {
  publish(event: LicensingWebhookEvent): Promise<void>
}

export interface LicensingService {
  createLicense(purchase: Purchase): Promise<UserLicense>
  activateLicense(licenseId: string): Promise<UserLicense>
  revokeLicense(licenseId: string, reason: string): Promise<UserLicense>
  expireLicense(licenseId: string): Promise<UserLicense>
  renewLicense(licenseId: string): Promise<UserLicense>
  validateLicense(userId: string, productId: string): Promise<boolean>
  getLicense(licenseId: string): Promise<UserLicense>
  listUserLicenses(userId: string): Promise<UserLicense[]>
}

export interface InstallationService {
  install(
    licenseId: string,
    targetType: LicenseInstallationTargetType,
    targetId: string,
  ): Promise<LicenseInstallation>
  uninstall(installationId: string): Promise<void>
  listInstallations(licenseId: string): Promise<LicenseInstallation[]>
}

export interface DownloadService {
  authorizeDownload(userId: string, productId: string): Promise<boolean>
  recordDownload(licenseId: string, fileId: string): Promise<void>
}

export interface LicenseCatalogService {
  createLicenseType(licenseType: LicenseType): Promise<LicenseType>
  createLicenseTypeVersion(version: LicenseTypeVersion): Promise<LicenseTypeVersion>
}

export interface LicensingWebhookEvent {
  event: 'license.activated' | 'license.revoked' | 'license.expired' | 'plugin.installed' | 'plugin.removed'
  licenseId: string
  reason?: string
  pluginId?: string
}

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
}

export interface CommerceEventHandler {
  handle(event: CommerceEvent): Promise<void>
}

export type CommerceEvent =
  | PurchaseCompletedEvent
  | PurchaseRefundedEvent
  | PurchasePartiallyRefundedEvent
  | SubscriptionRenewedEvent
  | SubscriptionExpiredEvent
  | SubscriptionCancelledEvent

export interface PurchaseCompletedEvent {
  event: 'purchase.completed'
  purchaseId: string
  userId: string
  productId: string
  licenseId: string
}

export interface PurchaseRefundedEvent {
  event: 'purchase.refunded'
  purchaseId: string
}

export interface PurchasePartiallyRefundedEvent {
  event: 'purchase.partially_refunded'
  purchaseId: string
  metadata?: Record<string, unknown>
}

export interface SubscriptionRenewedEvent {
  event: 'subscription.renewed'
  licenseId: string
  currentPeriodEndsAt?: Date
}

export interface SubscriptionExpiredEvent {
  event: 'subscription.expired'
  licenseId: string
}

export interface SubscriptionCancelledEvent {
  event: 'subscription.cancelled'
  licenseId: string
  currentPeriodEndsAt: Date
}