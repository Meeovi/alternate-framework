/**
 * Error contract (v1.0). Every error response uses the envelope
 * `{ success: false, error: { code, message, details } }`.
 *
 * Frozen codes (stable; never renamed or re-mapped): LICENSE_NOT_FOUND,
 * AUTH_REQUIRED, LICENSE_ACCESS_DENIED, INVALID_LICENSE_TYPE,
 * INSTALL_LIMIT_EXCEEDED, LICENSE_ALREADY_INSTALLED,
 * DUPLICATE_IDEMPOTENCY_KEY. The others below are also part of v1.0 and
 * cover the spec's remaining cases (product not found, download limits,
 * inactive licenses, validation, rate limits, server errors).
 */

export const FROZEN_LICENSING_ERROR_CODES = [
  'LICENSE_NOT_FOUND',
  'AUTH_REQUIRED',
  'LICENSE_ACCESS_DENIED',
  'INVALID_LICENSE_TYPE',
  'INSTALL_LIMIT_EXCEEDED',
  'LICENSE_ALREADY_INSTALLED',
  'DUPLICATE_IDEMPOTENCY_KEY',
] as const

export const LICENSING_ERROR_CODES = [
  ...FROZEN_LICENSING_ERROR_CODES,
  'PRODUCT_NOT_FOUND',
  'INSTALLATION_NOT_FOUND',
  'DOWNLOAD_LIMIT_EXCEEDED',
  'LICENSE_NOT_ACTIVE',
  'INVALID_STATUS_TRANSITION',
  'IDEMPOTENCY_KEY_REQUIRED',
  'VALIDATION_ERROR',
  'RATE_LIMITED',
  'INTERNAL_ERROR',
  'SERVICE_UNAVAILABLE',
] as const
export type LicensingErrorCode = typeof LICENSING_ERROR_CODES[number]

/** HTTP status per error code. Only the frozen status set is used. */
export const LICENSING_ERROR_STATUS: Readonly<Record<LicensingErrorCode, number>> = {
  LICENSE_NOT_FOUND: 404,
  AUTH_REQUIRED: 401,
  LICENSE_ACCESS_DENIED: 403,
  INVALID_LICENSE_TYPE: 400,
  INSTALL_LIMIT_EXCEEDED: 400,
  LICENSE_ALREADY_INSTALLED: 409,
  // Same key reused for a different request (different operation or body).
  DUPLICATE_IDEMPOTENCY_KEY: 409,
  PRODUCT_NOT_FOUND: 404,
  INSTALLATION_NOT_FOUND: 404,
  DOWNLOAD_LIMIT_EXCEEDED: 400,
  // Downloading or installing under an expired, revoked or suspended license.
  LICENSE_NOT_ACTIVE: 403,
  // e.g. renewing a revoked license.
  INVALID_STATUS_TRANSITION: 409,
  IDEMPOTENCY_KEY_REQUIRED: 400,
  VALIDATION_ERROR: 400,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
}

export const SUCCESS_STATUSES = [200, 201, 202, 204] as const
export const CLIENT_ERROR_STATUSES = [400, 401, 403, 404, 409, 429] as const
export const SERVER_ERROR_STATUSES = [500, 503] as const

export interface LicensingErrorBody {
  code: LicensingErrorCode
  message: string
  details: Record<string, unknown>
}

export interface LicensingErrorResponse {
  success: false
  error: LicensingErrorBody
}

export interface LicensingSuccessResponse<T> {
  success: true
  data: T
}

export type LicensingApiResponse<T> = LicensingSuccessResponse<T> | LicensingErrorResponse

/** Error thrown by licensing services; hosts turn it into the envelope. */
export class LicensingError extends Error {
  readonly status: number
  constructor(readonly code: LicensingErrorCode, message: string, readonly details: Record<string, unknown> = {}) {
    super(message)
    this.name = 'LicensingError'
    this.status = LICENSING_ERROR_STATUS[code]
  }

  toResponse(): LicensingErrorResponse {
    return licensingErrorResponse(this.code, this.message, this.details)
  }
}

export function licensingErrorResponse(code: LicensingErrorCode, message: string, details: Record<string, unknown> = {}): LicensingErrorResponse {
  return { success: false, error: { code, message, details } }
}

export function isLicensingErrorResponse(value: unknown): value is LicensingErrorResponse {
  const v = value as LicensingErrorResponse | null
  return !!v && v.success === false && !!v.error
    && (LICENSING_ERROR_CODES as readonly string[]).includes(v.error.code)
    && typeof v.error.message === 'string'
    && !!v.error.details && typeof v.error.details === 'object' && !Array.isArray(v.error.details)
}
