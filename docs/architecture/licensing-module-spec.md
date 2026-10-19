Meeovi Licensing Module Specification (Final)
Overview

Create a backend-agnostic Licensing Module for Meeovi.

The licensing system must work across all current and future commerce adapters, product types, integrations, and digital assets.

The system must not depend on:

Magento
Webkul
Shopify
WooCommerce
Saleor
Directus
Any specific commerce backend

Instead, licensing must consume normalized commerce events through Meeovi's Commerce Abstraction Layer.

The licensing module becomes a first-class Meeovi core service alongside:

Products
Subscriptions
Ratings
Discussions
Messages
Tasks
Licences

Goals
Backend Agnostic

The licensing engine must only communicate with:

Product
Purchase
Subscription
User


interfaces.

No commerce adapter-specific logic should exist inside the licensing module.

Universal

The system must support:

Fonts
Icons
Photography
Stock Images
Videos
Music
Templates
eBooks
Software
Plugins
Language Packs
AI Tools
Vibez Assets
Courses
Future Digital Products


without schema changes.

Modular

Licensing must be installable and maintainable as an independent Meeovi core module.

Core Entities
LicenseType

Reusable licensing templates.

interface LicenseType {
  id: string

  slug: string

  name: string

  description: string

  scope:
    | "personal"
    | "commercial"
    | "workspace"
    | "organisation"
    | "exclusive"
    | "subscription"

  permissions: {
    personalUse: boolean
    commercialUse: boolean
    clientProjects: boolean
    modification: boolean
    redistribution: boolean
    resale: boolean
    attributionRequired: boolean
  }

  active: boolean

  createdAt: Date
  updatedAt: Date
}

LicenseTypeVersion

Immutable versioned terms.

interface LicenseTypeVersion {
  id: string

  licenseTypeId: string

  version: string

  title: string

  terms: string

  effectiveDate: Date

  active: boolean

  createdAt: Date
}


Example:

Commercial License

v1.0
v1.1
v2.0

ProductLicense

Attach licences to products.

interface ProductLicense {
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


Example:

Modern Icon Pack

Personal £9
Commercial £29
Extended £99

UserLicense

Represents purchased rights.

interface UserLicense {
  id: string

  licenseKey: string

  userId: string

  productId: string

  productLicenseId: string

  purchaseId: string

  versionId: string

  status:
    | "active"
    | "expired"
    | "revoked"
    | "suspended"

  activatedAt?: Date

  expiresAt?: Date

  metadata?: Record<string, unknown>

  createdAt: Date
}

LicenseInstallation

For plugins and installable assets.

interface LicenseInstallation {
  id: string

  userLicenseId: string

  targetType:
    | "user"
    | "workspace"
    | "organisation"

  targetId: string

  installedAt: Date

  active: boolean
}

LicenseDownload

Track download activity.

interface LicenseDownload {
  id: string

  userLicenseId: string

  fileId: string

  downloadedAt: Date

  metadata?: Record<string, unknown>
}

Authentication Requirements

All licensing APIs must integrate with Meeovi Auth.

Supported identity providers:

Meeovi Auth
SSO
Federated Identity
Future Identity Adapters


The licensing service should only consume:

AuthenticatedUser


and never directly authenticate users itself.

Authorization Rules

Users may:

View their licences
Download owned assets
Install owned plugins
Manage owned licences


Workspace Administrators may:

Install workspace-scoped licences
Remove workspace installations
View organisation licences


Platform Administrators may:

Suspend licences
Revoke licences
Manage licence templates
Manage licence versions

API Contracts
LicensingService
interface LicensingService {
  createLicense(
    purchase: Purchase
  ): Promise<UserLicense>

  activateLicense(
    licenseId: string
  ): Promise<UserLicense>

  revokeLicense(
    licenseId: string,
    reason: string
  ): Promise<UserLicense>

  expireLicense(
    licenseId: string
  ): Promise<UserLicense>

  renewLicense(
    licenseId: string
  ): Promise<UserLicense>

  validateLicense(
    userId: string,
    productId: string
  ): Promise<boolean>

  getLicense(
    licenseId: string
  ): Promise<UserLicense>

  listUserLicenses(
    userId: string
  ): Promise<UserLicense[]>
}

InstallationService
interface InstallationService {
  install(
    licenseId: string,
    targetType: string,
    targetId: string
  ): Promise<LicenseInstallation>

  uninstall(
    installationId: string
  ): Promise<void>

  listInstallations(
    licenseId: string
  ): Promise<LicenseInstallation[]>
}

DownloadService
interface DownloadService {
  authorizeDownload(
    userId: string,
    productId: string
  ): Promise<boolean>

  recordDownload(
    licenseId: string,
    fileId: string
  ): Promise<void>
}

REST Endpoints
Licences
GET /api/licenses
GET /api/licenses/{id}

POST /api/licenses/{id}/activate
POST /api/licenses/{id}/revoke
POST /api/licenses/{id}/renew

Installations
POST /api/licenses/{id}/install

DELETE /api/installations/{id}

GET /api/licenses/{id}/installations

Downloads
POST /api/licenses/{id}/download

Idempotency Requirements

All state-changing requests must support idempotency.

Required header:

Idempotency-Key:


Example:

POST /api/licenses/{id}/install

Idempotency-Key:
7c2e664d-3f56-4b18


Repeated requests using the same key must:

Not create duplicate records
Not create duplicate installations
Not issue duplicate licence keys

Idempotent Operations
Activate Licence
Renew Licence
Install Plugin
Create Licence
Record Purchase
Record Refund


must all be safe to retry.

Commerce Events

The licensing engine consumes events emitted by commerce adapters.

PurchaseCompleted
{
  "event": "purchase.completed",
  "purchaseId": "abc123",
  "userId": "user123",
  "productId": "prod123",
  "licenseId": "commercial"
}


Action:

Generate UserLicense

PurchaseRefunded
{
  "event": "purchase.refunded",
  "purchaseId": "abc123"
}


Action:

Revoke Licence
Disable Installations
Invalidate Downloads

SubscriptionRenewed
{
  "event": "subscription.renewed",
  "licenseId": "lic123"
}


Action:

Extend Expiration Date

SubscriptionExpired
{
  "event": "subscription.expired",
  "licenseId": "lic123"
}


Action:

Mark Expired
Disable Downloads

SubscriptionCancelled
{
  "event": "subscription.cancelled",
  "licenseId": "lic123"
}


Action:

Remain Active Until Current Billing Period Ends

Webhooks
License Activated
{
  "event": "license.activated",
  "licenseId": "lic123"
}

License Revoked
{
  "event": "license.revoked",
  "licenseId": "lic123",
  "reason": "refund"
}

License Expired
{
  "event": "license.expired",
  "licenseId": "lic123"
}

Plugin Installed
{
  "event": "plugin.installed",
  "pluginId": "french-language-pack",
  "licenseId": "lic123"
}

Plugin Removed
{
  "event": "plugin.removed",
  "pluginId": "french-language-pack",
  "licenseId": "lic123"
}

Refund Flows
Immediate Revocation

Applicable to:

Plugins
Language Packs
Digital Assets
Fonts
Icons
Templates


Flow:

Refund
→ Revoke Licence
→ Disable Installations
→ Disable Downloads

Grace Period Refunds

Optional.

{
  "refundGraceDays": 30
}

Partial Refunds
Licence Remains Active
Status:
partial_refund


Useful for:

Bundles
Subscription Credits

Subscription Flows
Initial Purchase
Purchase
→ Create Licence
→ Status Active

Renewal
Payment Successful
→ Extend Expiry Date

Cancellation
User Cancels
→ Stop Future Billing
→ Continue Current Access

Expiration
Subscription Ends
→ Licence Expired
→ Downloads Disabled
→ Installations Disabled

Reactivation
Subscription Restored
→ Licence Active
→ Restore Access

License Versioning Rules
Immutable Terms

Purchased licences are permanently linked to a licence version.

Example:

{
  "licenseVersion": "1.1"
}

Existing Customers

If terms change:

Existing Purchasers
Keep Existing Rights


No automatic migration.

New Customers

Receive:

Latest Active Version

Major Changes

Require new version.

Examples:

Commercial Rights
Redistribution Rights
Attribution Rules
Resale Rules


Version bump:

1.x → 2.x

Minor Changes

Examples:

Typos
Formatting
Clarifications


Version bump:

1.0 → 1.1

Standard Error Response

All errors return:

{
  "success": false,
  "error": {
    "code": "LICENSE_NOT_FOUND",
    "message": "License does not exist",
    "details": {}
  }
}

Status Codes
Success
200 OK
201 Created
202 Accepted
204 No Content

Authentication
401 Unauthorized


Example:

{
  "code": "AUTH_REQUIRED"
}

Authorization
403 Forbidden


Example:

{
  "code": "LICENSE_ACCESS_DENIED"
}

Validation
400 Bad Request


Examples:

{
  "code": "INVALID_LICENSE_TYPE"
}

{
  "code": "INSTALL_LIMIT_EXCEEDED"
}

Not Found
404 Not Found


Examples:

{
  "code": "LICENSE_NOT_FOUND"
}

{
  "code": "PRODUCT_NOT_FOUND"
}

Conflict
409 Conflict


Examples:

{
  "code": "LICENSE_ALREADY_INSTALLED"
}

{
  "code": "DUPLICATE_IDEMPOTENCY_KEY"
}

Rate Limiting
429 Too Many Requests

Server Errors
500 Internal Server Error
503 Service Unavailable

Workspace Integration

Add:

Workspace
└── Licences


Sections:

Active
Expired
Downloads
Installations
Subscriptions


Supported Actions:

Download
Install
Uninstall
Renew
Transfer
View Terms
View Version History

Success Criteria

The licensing system must support:

Fonts
Icons
Photos
Stock Images
Videos
Music
Templates
eBooks
Vibez Assets
Plugins
Language Packs
AI Tools
Future Integrations


using one unified licensing engine that is:

Backend Agnostic
Versioned
Event Driven
API First
Secure
Idempotent
Multi-Tenant
Commerce Adapter Independent


and fully integrated into Meeovi's product, subscription, workspace, outlet, and integration ecosystems.