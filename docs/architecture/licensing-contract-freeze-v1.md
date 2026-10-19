# Meeovi Licensing Module

## Phase 1 Contract Freeze Checklist (v1.0)

### Purpose

Phase 1 Contract Freeze marks the point at which the Licensing Module's public contracts become stable.

After approval, implementations, commerce-adapter integrations, storage providers, and API handlers may be added. Public contract shapes, event names, error codes, and core entity fields may not change without version review.

Do not approve the freeze while any required item remains unchecked or any contract conflict remains unresolved.

### Current Open Contract Decision

The architecture specification describes `partial_refund` as a `UserLicense` status and defines a `purchase.partially_refunded` event. The v1.0 freeze checklist below omits both. Resolve whether these are part of v1.0 before freezing the status and commerce event contracts.

## 1. Domain Model Freeze

### LicenseType

- [ ] Interface documented
- [ ] All fields documented
- [ ] Scope values finalized
- [ ] Permission flags finalized
- [ ] Unit tests exist

Freeze fields: `id`, `slug`, `name`, `description`, `scope`, `permissions`, `active`, `createdAt`, `updatedAt`.

### LicenseTypeVersion

- [ ] Versioning rules documented
- [ ] Major version strategy approved
- [ ] Minor version strategy approved
- [ ] Immutable terms policy documented

Freeze fields: `id`, `licenseTypeId`, `version`, `title`, `terms`, `effectiveDate`, `active`, `createdAt`.

### ProductLicense

- [ ] Pricing structure approved
- [ ] Subscription support approved
- [ ] Installation limits approved
- [ ] Download limits approved

Freeze fields: `id`, `productId`, `licenseTypeId`, `licenseVersionId`, `title`, `price`, `active`, `subscriptionBased`, `maxDownloads`, `maxInstallations`, `expiresAfterDays`, `metadata`, `createdAt`.

### UserLicense

- [ ] Lifecycle complete
- [ ] Purchase relationship defined
- [ ] Status values approved

Freeze status values: `active`, `expired`, `revoked`, `suspended`.

### LicenseInstallation

- [ ] Plugin installation model approved
- [ ] Workspace installation model approved

Freeze target types: `user`, `workspace`, `organisation`.

### LicenseDownload

- [ ] Download tracking requirements approved
- [ ] Audit requirements approved

## 2. API Contract Freeze

### LicensingService

- [ ] Interface complete
- [ ] No missing use cases
- [ ] Return types approved

Freeze methods: `createLicense`, `activateLicense`, `revokeLicense`, `expireLicense`, `renewLicense`, `validateLicense`, `getLicense`, `listUserLicenses`.

### InstallationService

- [ ] Installation lifecycle approved

Freeze methods: `install`, `uninstall`, `listInstallations`.

### DownloadService

- [ ] Download authorization approved

Freeze methods: `authorizeDownload`, `recordDownload`.

## 3. REST Contract Freeze

### License Endpoints

- [ ] Endpoint naming approved
- [ ] Resource structure approved

Freeze:

- `GET /api/licenses`
- `GET /api/licenses/{id}`
- `POST /api/licenses/{id}/activate`
- `POST /api/licenses/{id}/revoke`
- `POST /api/licenses/{id}/renew`

### Installation Endpoints

- [ ] Installation routes approved

Freeze:

- `POST /api/licenses/{id}/install`
- `DELETE /api/installations/{id}`
- `GET /api/licenses/{id}/installations`

### Download Endpoint

- [ ] Download route approved

Freeze: `POST /api/licenses/{id}/download`.

## 4. Event Contract Freeze

### Commerce Events

- [ ] All adapter integrations can emit the normalized events
- [ ] Event payload schemas are approved and tested

Freeze event names:

- `purchase.completed`
- `purchase.refunded`
- `subscription.renewed`
- `subscription.expired`
- `subscription.cancelled`

### Webhook Events

- [ ] Webhook payload schemas are approved and tested

Freeze event names:

- `license.activated`
- `license.revoked`
- `license.expired`
- `plugin.installed`
- `plugin.removed`

## 5. Authentication Freeze

- [ ] Meeovi Auth supported through a host interface
- [ ] SSO supported through a host interface
- [ ] Federated identity supported through a host interface
- [ ] Module contains no authentication implementation

Contract: Licensing consumes identity; Licensing does not provide identity.

## 6. Authorization Freeze

### User Permissions

- [ ] View own licenses
- [ ] Download owned content
- [ ] Install owned integrations

### Workspace Permissions

- [ ] Manage workspace installations
- [ ] View workspace licenses

### Platform Administrator Permissions

- [ ] Suspend licenses
- [ ] Revoke licenses
- [ ] Manage templates
- [ ] Manage versions

## 7. Idempotency Freeze

- [ ] Every write operation supports the `Idempotency-Key` header
- [ ] Duplicate requests produce identical results
- [ ] Duplicate licenses cannot be issued
- [ ] Duplicate installations cannot be created

Freeze header: `Idempotency-Key`.

## 8. Error Contract Freeze

- [ ] Error envelope is documented and tested
- [ ] Error codes are documented and stable

Freeze envelope:

```json
{
  "success": false,
  "error": {
    "code": "",
    "message": "",
    "details": {}
  }
}
```

Freeze error codes:

- `LICENSE_NOT_FOUND`
- `AUTH_REQUIRED`
- `LICENSE_ACCESS_DENIED`
- `INVALID_LICENSE_TYPE`
- `INSTALL_LIMIT_EXCEEDED`
- `LICENSE_ALREADY_INSTALLED`
- `DUPLICATE_IDEMPOTENCY_KEY`

## 9. Status Code Freeze

- [ ] Success statuses approved: `200`, `201`, `202`, `204`
- [ ] Client error statuses approved: `400`, `401`, `403`, `404`, `409`, `429`
- [ ] Server error statuses approved: `500`, `503`

## 10. Versioning Freeze

- [ ] Existing purchasers keep acquired rights
- [ ] New purchasers receive the newest active version
- [ ] Major version rules documented
- [ ] Minor version rules documented
- [ ] Terms are immutable

Approved examples: `1.0` to `1.1` for clarification; `1.x` to `2.x` for rights changes.

## 11. Documentation Freeze

- [ ] README overview
- [ ] Ownership boundaries
- [ ] Licensing owns / does not own
- [ ] Host references
- [ ] Event flows
- [ ] Refund flows
- [ ] Subscription flows
- [ ] Lifecycle diagrams
- [ ] Implementation notes

## 12. Testing Freeze

- [ ] Contract tests pass
- [ ] Event schema tests exist
- [ ] API schema tests exist
- [ ] Versioning tests exist
- [ ] No Magento dependency
- [ ] No Webkul dependency
- [ ] No Directus dependency
- [ ] No Rocket.Chat dependency

## Exit Criteria

Phase 1 Contract Freeze is approved only when all checklist items are complete and the following are confirmed:

- [ ] Contracts stable
- [ ] Documentation complete
- [ ] Tests passing
- [ ] Event schemas locked
- [ ] Error contracts locked
- [ ] Public interfaces locked
- [ ] No commerce-adapter dependencies
- [ ] No auth-provider dependencies
- [ ] No storage-provider dependencies

## Outcome After Approval

- Module status: **CONTRACT FROZEN**
- Public API: **STABLE**
- Breaking changes: **REQUIRE VERSION REVIEW**
- Adapter development: **ALLOWED**
- Implementation work: **ALLOWED**