# Meeovi Licensing Module

## Phase 1 Contract Freeze Checklist (v1.0)

**Status: READY FOR APPROVAL.** Every item below is done and points at where it's satisfied. The freeze takes effect when the owner signs off under "Approval".

Module: [`layers/commerce/server/licensing/`](../../layers/commerce/server/licensing/) ([README](../../layers/commerce/server/licensing/README.md)). Tests: `npx vitest run --config server/licensing/vitest.config.ts` from `layers/commerce` (54 tests passing).

### Purpose

Phase 1 Contract Freeze marks the point at which the Licensing Module's public contracts become stable.

After approval, implementations, commerce-adapter integrations, storage providers, and API handlers may be added. Public contract shapes, event names, error codes, and core entity fields may not change without version review.

Do not approve the freeze while any required item remains unchecked or any contract conflict remains unresolved.

### Resolved Contract Decision: partial refunds

The specification listed `partial_refund` as a `UserLicense` status and defined a `purchase.partially_refunded` event, while this checklist omitted both. **Resolved: neither is part of v1.0.**

- The specification says a partially refunded license "remains active", so a partial refund doesn't change rights, and a separate status would only make every consumer treat `partial_refund` as active.
- Where a partial refund should remove rights (one item of a bundle), the adapter emits `purchase.refunded` for that item's own purchase line. Each line has its own `purchaseId`, so the other items keep their licenses.
- Adding an event later is non-breaking. Adding a status value later would be breaking, so the decision is made now rather than deferred.

Statuses are frozen as `active`, `expired`, `revoked`, `suspended`, and commerce events as the five below. `parseCommerceEvent` rejects `purchase.partially_refunded`.

## 1. Domain Model Freeze

### LicenseType

- [x] Interface documented: `models.ts`, every field has a doc comment
- [x] All fields documented
- [x] Scope values finalized: `LICENSE_SCOPES`, each scope defined
- [x] Permission flags finalized: `LicensePermissions` / `LICENSE_PERMISSION_KEYS`, all required
- [x] Unit tests exist: `tests/models.test.ts`

Freeze fields: `id`, `slug`, `name`, `description`, `scope`, `permissions`, `active`, `createdAt`, `updatedAt`.

### LicenseTypeVersion

- [x] Versioning rules documented: `versioning.ts`, README "Versioning"
- [x] Major version strategy approved: any permission change means `x.y` to `(x+1).0` (`requiredChangeKind`, `isValidVersionBump`)
- [x] Minor version strategy approved: wording only means `x.y` to `x.(y+1)`
- [x] Immutable terms policy documented: readonly fields, `insertLicenseTypeVersion` rejects an existing id, `freezeLicenseTypeVersion`

Freeze fields: `id`, `licenseTypeId`, `version`, `title`, `terms`, `effectiveDate`, `active`, `createdAt`.

### ProductLicense

- [x] Pricing structure approved: `price` is the amount the commerce backend charges, in the store's currency; several offers per product
- [x] Subscription support approved: `subscriptionBased`, with `expiresAfterDays` as the default period length; renewal and expiry by commerce events
- [x] Installation limits approved: `maxInstallations` counts active installations; omitted means unlimited, `0` means none
- [x] Download limits approved: `maxDownloads` per license, same rules

Freeze fields: `id`, `productId`, `licenseTypeId`, `licenseVersionId`, `title`, `price`, `active`, `subscriptionBased`, `maxDownloads`, `maxInstallations`, `expiresAfterDays`, `metadata`, `createdAt`.

### UserLicense

- [x] Lifecycle complete: `USER_LICENSE_TRANSITIONS` (`revoked` is final), `grantsAccess`, README state diagram
- [x] Purchase relationship defined: one UserLicense per (`purchaseId`, `productLicenseId`); `Purchase.productLicenseId` names the offer bought
- [x] Status values approved: see the resolved decision

Freeze status values: `active`, `expired`, `revoked`, `suspended`.

### LicenseInstallation

- [x] Plugin installation model approved: one active installation per (license, target); uninstalling deactivates it and keeps it for audit; `plugin.installed` / `plugin.removed`
- [x] Workspace installation model approved: workspace and organisation targets, managed by their administrators

Freeze target types: `user`, `workspace`, `organisation`.

### LicenseDownload

- [x] Download tracking requirements approved: each download is recorded and counts against `maxDownloads`
- [x] Audit requirements approved: append-only, never edited; audit details in `metadata`

## 2. API Contract Freeze

### LicensingService

- [x] Interface complete: `interfaces.ts`
- [x] No missing use cases: catalog administration added as `LicenseCatalogService`; transfer and version history are deferred to v1.1 (additive)
- [x] Return types approved

Freeze methods: `createLicense`, `activateLicense`, `revokeLicense`, `expireLicense`, `renewLicense`, `validateLicense`, `getLicense`, `listUserLicenses`.

### InstallationService

- [x] Installation lifecycle approved

Freeze methods: `install`, `uninstall`, `listInstallations`.

### DownloadService

- [x] Download authorization approved: active, unexpired license within its download limit

Freeze methods: `authorizeDownload`, `recordDownload`.

## 3. REST Contract Freeze

`api-contracts.ts` declares each endpoint's permission, success status, idempotency requirement, error codes, and request and response bodies. Tested in `tests/api.test.ts`.

### License Endpoints

- [x] Endpoint naming approved
- [x] Resource structure approved

Freeze:

- `GET /api/licenses`
- `GET /api/licenses/{id}`
- `POST /api/licenses/{id}/activate`
- `POST /api/licenses/{id}/revoke`
- `POST /api/licenses/{id}/renew`

### Installation Endpoints

- [x] Installation routes approved

Freeze:

- `POST /api/licenses/{id}/install`
- `DELETE /api/installations/{id}`
- `GET /api/licenses/{id}/installations`

### Download Endpoint

- [x] Download route approved

Freeze: `POST /api/licenses/{id}/download`.

## 4. Event Contract Freeze

### Commerce Events

- [x] All adapter integrations can emit the normalized events: the payloads use only purchase, user, product and license ids, which every adapter has
- [x] Event payload schemas are approved and tested: `COMMERCE_EVENT_SCHEMAS`, `parseCommerceEvent`, `tests/events.test.ts`

Freeze event names:

- `purchase.completed`
- `purchase.refunded`
- `subscription.renewed`
- `subscription.expired`
- `subscription.cancelled`

### Webhook Events

- [x] Webhook payload schemas are approved and tested: `LICENSING_EVENT_SCHEMAS`, `parseLicensingEvent`

Freeze event names:

- `license.activated`
- `license.revoked`
- `license.expired`
- `plugin.installed`
- `plugin.removed`

## 5. Authentication Freeze

- [x] Meeovi Auth supported through a host interface: `AuthenticatedUserProvider`
- [x] SSO supported through a host interface
- [x] Federated identity supported through a host interface (`AuthenticatedUser.identityProvider`; tested with all three plus a future adapter)
- [x] Module contains no authentication implementation (`tests/boundaries.test.ts`)

Contract: Licensing consumes identity; Licensing does not provide identity.

## 6. Authorization Freeze

`authorization.ts`, tested in `tests/authorization.test.ts`.

### User Permissions

- [x] View own licenses
- [x] Download owned content
- [x] Install owned integrations

### Workspace Permissions

- [x] Manage workspace installations
- [x] View workspace licenses

### Platform Administrator Permissions

- [x] Suspend licenses
- [x] Revoke licenses
- [x] Manage templates
- [x] Manage versions

## 7. Idempotency Freeze

- [x] Every write operation supports the `Idempotency-Key` header (`requiresIdempotencyKey` on every non-GET endpoint)
- [x] Duplicate requests produce identical results (same key and request returns the stored result; same key with a different request returns `DUPLICATE_IDEMPOTENCY_KEY`)
- [x] Duplicate licenses cannot be issued (one per purchase and offer; a twice-delivered purchase event issues one)
- [x] Duplicate installations cannot be created (`LICENSE_ALREADY_INSTALLED`)

Freeze header: `Idempotency-Key`. Tested in `tests/flows.test.ts` against the reference implementation.

## 8. Error Contract Freeze

- [x] Error envelope is documented and tested (`errors.ts`, `tests/errors.test.ts`)
- [x] Error codes are documented and stable

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

Also part of v1.0, for the cases the specification describes: `PRODUCT_NOT_FOUND`, `INSTALLATION_NOT_FOUND`, `DOWNLOAD_LIMIT_EXCEEDED`, `LICENSE_NOT_ACTIVE`, `INVALID_STATUS_TRANSITION`, `IDEMPOTENCY_KEY_REQUIRED`, `VALIDATION_ERROR`, `RATE_LIMITED`, `INTERNAL_ERROR`, `SERVICE_UNAVAILABLE`.

## 9. Status Code Freeze

- [x] Success statuses approved: `200`, `201`, `202`, `204`
- [x] Client error statuses approved: `400`, `401`, `403`, `404`, `409`, `429`
- [x] Server error statuses approved: `500`, `503`

Every error code maps to one of these (tested).

## 10. Versioning Freeze

- [x] Existing purchasers keep acquired rights
- [x] New purchasers receive the newest active version
- [x] Major version rules documented
- [x] Minor version rules documented
- [x] Terms are immutable

Approved examples: `1.0` to `1.1` for clarification; `1.x` to `2.x` for rights changes. Tested in `tests/versioning.test.ts` and `tests/flows.test.ts`.

## 11. Documentation Freeze

All in the module [README](../../layers/commerce/server/licensing/README.md).

- [x] README overview
- [x] Ownership boundaries
- [x] Licensing owns / does not own
- [x] Host references
- [x] Event flows
- [x] Refund flows
- [x] Subscription flows
- [x] Lifecycle diagrams
- [x] Implementation notes

## 12. Testing Freeze

- [x] Contract tests pass (54 tests)
- [x] Event schema tests exist (`events.test.ts`)
- [x] API schema tests exist (`api.test.ts`)
- [x] Versioning tests exist (`versioning.test.ts`)
- [x] No Magento dependency (`boundaries.test.ts`: the module imports only its own files)
- [x] No Webkul dependency
- [x] No Directus dependency
- [x] No Rocket.Chat dependency

## Exit Criteria

- [x] Contracts stable
- [x] Documentation complete
- [x] Tests passing
- [x] Event schemas locked
- [x] Error contracts locked
- [x] Public interfaces locked
- [x] No commerce-adapter dependencies
- [x] No auth-provider dependencies
- [x] No storage-provider dependencies

## Approval

- [ ] Approved by the module owner (name and date)

## Outcome After Approval

- Module status: **CONTRACT FROZEN**
- Public API: **STABLE**
- Breaking changes: **REQUIRE VERSION REVIEW**
- Adapter development: **ALLOWED**
- Implementation work: **ALLOWED**
