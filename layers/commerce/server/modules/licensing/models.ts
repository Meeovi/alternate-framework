export type LicenseScope =
  | 'personal'
  | 'commercial'
  | 'workspace'
  | 'organisation'
  | 'exclusive'
  | 'subscription'

export interface LicensePermissions {
  personalUse: boolean
  commercialUse: boolean
  clientProjects: boolean
  modification: boolean
  redistribution: boolean
  resale: boolean
  attributionRequired: boolean
}

export interface LicenseType {
  id: string
  slug: string
  name: string
  description: string
  scope: LicenseScope
  permissions: LicensePermissions
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface LicenseTypeVersion {
  readonly id: string
  readonly licenseTypeId: string
  readonly version: string
  readonly title: string
  readonly terms: string
  readonly effectiveDate: Date
  readonly active: boolean
  readonly createdAt: Date
}

export interface ProductLicense {
  id: string
  productId: string
  licenseTypeId: string
  licenseVersionId: string
  title: string
  price: number
  active: boolean
  subscriptionBased: boolean
  maxDownloads?: number
  maxInstallations?: number
  expiresAfterDays?: number
  metadata?: Record<string, unknown>
  createdAt: Date
}

export type UserLicenseStatus = 'active' | 'expired' | 'revoked' | 'suspended' | 'partial_refund'

export interface UserLicense {
  id: string
  licenseKey: string
  userId: string
  productId: string
  productLicenseId: string
  purchaseId: string
  versionId: string
  status: UserLicenseStatus
  activatedAt?: Date
  expiresAt?: Date
  metadata?: Record<string, unknown>
  createdAt: Date
}

export type LicenseInstallationTargetType = 'user' | 'workspace' | 'organisation'

export interface LicenseInstallation {
  id: string
  userLicenseId: string
  targetType: LicenseInstallationTargetType
  targetId: string
  installedAt: Date
  active: boolean
}

export interface LicenseDownload {
  id: string
  userLicenseId: string
  fileId: string
  downloadedAt: Date
  metadata?: Record<string, unknown>
}