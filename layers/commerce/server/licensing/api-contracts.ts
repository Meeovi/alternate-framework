/**
 * REST contract (v1.0). Describes the surface; registers no routes. A host
 * registers handlers matching these entries.
 *
 * - Every endpoint needs an authenticated user (401 AUTH_REQUIRED).
 * - Every state-changing endpoint needs the Idempotency-Key header
 *   (400 IDEMPOTENCY_KEY_REQUIRED when missing). A retry with the same key
 *   and request returns the original result; the same key with a
 *   different request returns 409 DUPLICATE_IDEMPOTENCY_KEY.
 * - Responses use the envelope in errors.ts:
 *   `{ success: true, data }` / `{ success: false, error }`. A 204 has no body.
 */
import type { LicensingAction } from './authorization'
import type { LicensingErrorCode } from './errors'
import type { LicenseInstallation, LicenseInstallationTargetType, UserLicense } from './models'

export const IDEMPOTENCY_HEADER = 'Idempotency-Key'

export type ApiMethod = 'GET' | 'POST' | 'DELETE'

export interface ApiEndpointContract {
  method: ApiMethod
  path: string
  /** Service method that serves it. */
  operation: string
  /** Permission checked (authorization.ts). */
  action: LicensingAction
  authenticated: true
  requiresIdempotencyKey: boolean
  /** Status on success. */
  successStatus: 200 | 201 | 202 | 204
  /** Error codes this endpoint may return, besides AUTH_REQUIRED, RATE_LIMITED and server errors. */
  errors: readonly LicensingErrorCode[]
}

const WRITE_ERRORS = ['IDEMPOTENCY_KEY_REQUIRED', 'DUPLICATE_IDEMPOTENCY_KEY'] as const

export const LICENSING_API_ENDPOINTS = [
  { method: 'GET', path: '/api/licenses', operation: 'listUserLicenses', action: 'license.view', authenticated: true, requiresIdempotencyKey: false, successStatus: 200, errors: [] },
  { method: 'GET', path: '/api/licenses/{id}', operation: 'getLicense', action: 'license.view', authenticated: true, requiresIdempotencyKey: false, successStatus: 200, errors: ['LICENSE_NOT_FOUND', 'LICENSE_ACCESS_DENIED'] },
  { method: 'POST', path: '/api/licenses/{id}/activate', operation: 'activateLicense', action: 'license.activate', authenticated: true, requiresIdempotencyKey: true, successStatus: 200, errors: ['LICENSE_NOT_FOUND', 'LICENSE_ACCESS_DENIED', 'INVALID_STATUS_TRANSITION', ...WRITE_ERRORS] },
  { method: 'POST', path: '/api/licenses/{id}/revoke', operation: 'revokeLicense', action: 'license.revoke', authenticated: true, requiresIdempotencyKey: true, successStatus: 200, errors: ['LICENSE_NOT_FOUND', 'LICENSE_ACCESS_DENIED', 'INVALID_STATUS_TRANSITION', 'VALIDATION_ERROR', ...WRITE_ERRORS] },
  { method: 'POST', path: '/api/licenses/{id}/renew', operation: 'renewLicense', action: 'license.renew', authenticated: true, requiresIdempotencyKey: true, successStatus: 200, errors: ['LICENSE_NOT_FOUND', 'LICENSE_ACCESS_DENIED', 'INVALID_STATUS_TRANSITION', ...WRITE_ERRORS] },
  { method: 'POST', path: '/api/licenses/{id}/install', operation: 'install', action: 'license.install', authenticated: true, requiresIdempotencyKey: true, successStatus: 201, errors: ['LICENSE_NOT_FOUND', 'LICENSE_ACCESS_DENIED', 'LICENSE_NOT_ACTIVE', 'INSTALL_LIMIT_EXCEEDED', 'LICENSE_ALREADY_INSTALLED', 'VALIDATION_ERROR', ...WRITE_ERRORS] },
  { method: 'DELETE', path: '/api/installations/{id}', operation: 'uninstall', action: 'installation.remove', authenticated: true, requiresIdempotencyKey: true, successStatus: 204, errors: ['INSTALLATION_NOT_FOUND', 'LICENSE_ACCESS_DENIED', ...WRITE_ERRORS] },
  { method: 'GET', path: '/api/licenses/{id}/installations', operation: 'listInstallations', action: 'installation.list', authenticated: true, requiresIdempotencyKey: false, successStatus: 200, errors: ['LICENSE_NOT_FOUND', 'LICENSE_ACCESS_DENIED'] },
  { method: 'POST', path: '/api/licenses/{id}/download', operation: 'recordDownload', action: 'license.download', authenticated: true, requiresIdempotencyKey: true, successStatus: 200, errors: ['LICENSE_NOT_FOUND', 'LICENSE_ACCESS_DENIED', 'LICENSE_NOT_ACTIVE', 'DOWNLOAD_LIMIT_EXCEEDED', 'VALIDATION_ERROR', ...WRITE_ERRORS] },
] as const satisfies readonly ApiEndpointContract[]

// ---------------------------------------------------------------------------
// Request and response bodies
// ---------------------------------------------------------------------------

/** Dates travel as ISO 8601 strings. */
export type Serialized<T> = { [K in keyof T]: T[K] extends Date ? string : T[K] extends Date | undefined ? string | undefined : T[K] }

export type UserLicenseDto = Serialized<UserLicense>
export type LicenseInstallationDto = Serialized<LicenseInstallation>

export interface RevokeLicenseRequest {
  /** Why, e.g. `refund`, `fraud`, `admin`. */
  reason: string
}

export interface InstallLicenseRequest {
  targetType: LicenseInstallationTargetType
  targetId: string
}

export interface DownloadLicenseRequest {
  fileId: string
}

export interface DownloadLicenseResponse {
  licenseId: string
  fileId: string
  /** Downloads left under ProductLicense.maxDownloads; omitted when unlimited. */
  remainingDownloads?: number
}

/** Response `data` per endpoint ("METHOD path"). */
export interface LicensingResponseBodies {
  'GET /api/licenses': UserLicenseDto[]
  'GET /api/licenses/{id}': UserLicenseDto
  'POST /api/licenses/{id}/activate': UserLicenseDto
  'POST /api/licenses/{id}/revoke': UserLicenseDto
  'POST /api/licenses/{id}/renew': UserLicenseDto
  'POST /api/licenses/{id}/install': LicenseInstallationDto
  'DELETE /api/installations/{id}': never
  'GET /api/licenses/{id}/installations': LicenseInstallationDto[]
  'POST /api/licenses/{id}/download': DownloadLicenseResponse
}

/** Request bodies for endpoints that take one. */
export interface LicensingRequestBodies {
  'POST /api/licenses/{id}/revoke': RevokeLicenseRequest
  'POST /api/licenses/{id}/install': InstallLicenseRequest
  'POST /api/licenses/{id}/download': DownloadLicenseRequest
}
