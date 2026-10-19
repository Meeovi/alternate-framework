export const IDEMPOTENCY_HEADER = 'Idempotency-Key'

export type ApiMethod = 'GET' | 'POST' | 'DELETE'

export interface ApiEndpointContract {
  method: ApiMethod
  path: string
  operation: string
  authenticated: true
  requiresIdempotencyKey: boolean
}

export const LICENSING_API_ENDPOINTS = [
  { method: 'GET', path: '/api/licenses', operation: 'listUserLicenses', authenticated: true, requiresIdempotencyKey: false },
  { method: 'GET', path: '/api/licenses/{id}', operation: 'getLicense', authenticated: true, requiresIdempotencyKey: false },
  { method: 'POST', path: '/api/licenses/{id}/activate', operation: 'activateLicense', authenticated: true, requiresIdempotencyKey: true },
  { method: 'POST', path: '/api/licenses/{id}/revoke', operation: 'revokeLicense', authenticated: true, requiresIdempotencyKey: true },
  { method: 'POST', path: '/api/licenses/{id}/renew', operation: 'renewLicense', authenticated: true, requiresIdempotencyKey: true },
  { method: 'POST', path: '/api/licenses/{id}/install', operation: 'installLicense', authenticated: true, requiresIdempotencyKey: true },
  { method: 'DELETE', path: '/api/installations/{id}', operation: 'uninstallLicense', authenticated: true, requiresIdempotencyKey: true },
  { method: 'GET', path: '/api/licenses/{id}/installations', operation: 'listInstallations', authenticated: true, requiresIdempotencyKey: false },
  { method: 'POST', path: '/api/licenses/{id}/download', operation: 'authorizeDownload', authenticated: true, requiresIdempotencyKey: true },
] as const satisfies readonly ApiEndpointContract[]

export interface IdempotencyRequest {
  idempotencyKey: string
}

export type LicensingErrorCode =
  | 'AUTH_REQUIRED'
  | 'LICENSE_ACCESS_DENIED'
  | 'INVALID_LICENSE_TYPE'
  | 'INSTALL_LIMIT_EXCEEDED'
  | 'LICENSE_ALREADY_INSTALLED'
  | 'DUPLICATE_IDEMPOTENCY_KEY'
  | 'LICENSE_NOT_FOUND'
  | 'PRODUCT_NOT_FOUND'
  | 'SUBSCRIPTION_NOT_ACTIVE'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'

export interface LicensingError {
  code: LicensingErrorCode
  message: string
  details: Record<string, unknown>
}

export interface LicensingErrorResponse {
  success: false
  error: LicensingError
}

export interface LicensingSuccessResponse<T> {
  success: true
  data: T
}

export type LicensingApiResponse<T> = LicensingSuccessResponse<T> | LicensingErrorResponse

export const LICENSING_ERROR_STATUS: Record<LicensingErrorCode, number> = {
  AUTH_REQUIRED: 401,
  LICENSE_ACCESS_DENIED: 403,
  INVALID_LICENSE_TYPE: 400,
  INSTALL_LIMIT_EXCEEDED: 400,
  LICENSE_ALREADY_INSTALLED: 409,
  DUPLICATE_IDEMPOTENCY_KEY: 409,
  LICENSE_NOT_FOUND: 404,
  PRODUCT_NOT_FOUND: 404,
  SUBSCRIPTION_NOT_ACTIVE: 400,
  VALIDATION_ERROR: 400,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
}