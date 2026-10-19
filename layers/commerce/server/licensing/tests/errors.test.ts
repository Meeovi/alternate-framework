import { describe, expect, it } from 'vitest'
import {
  CLIENT_ERROR_STATUSES, FROZEN_LICENSING_ERROR_CODES, isLicensingErrorResponse, LICENSING_ERROR_CODES, LICENSING_ERROR_STATUS,
  LicensingError, licensingErrorResponse, SERVER_ERROR_STATUSES,
} from '../errors'

describe('error contract (frozen)', () => {
  it('frozen codes and their statuses', () => {
    expect(FROZEN_LICENSING_ERROR_CODES).toEqual(['LICENSE_NOT_FOUND', 'AUTH_REQUIRED', 'LICENSE_ACCESS_DENIED', 'INVALID_LICENSE_TYPE', 'INSTALL_LIMIT_EXCEEDED', 'LICENSE_ALREADY_INSTALLED', 'DUPLICATE_IDEMPOTENCY_KEY'])
    expect(LICENSING_ERROR_STATUS).toMatchObject({
      LICENSE_NOT_FOUND: 404, AUTH_REQUIRED: 401, LICENSE_ACCESS_DENIED: 403, INVALID_LICENSE_TYPE: 400,
      INSTALL_LIMIT_EXCEEDED: 400, LICENSE_ALREADY_INSTALLED: 409, DUPLICATE_IDEMPOTENCY_KEY: 409,
    })
  })
  it('every code maps to an approved status', () => {
    const approved = [...CLIENT_ERROR_STATUSES, ...SERVER_ERROR_STATUSES] as number[]
    expect(Object.keys(LICENSING_ERROR_STATUS).sort()).toEqual([...LICENSING_ERROR_CODES].sort())
    for (const status of Object.values(LICENSING_ERROR_STATUS)) expect(approved).toContain(status)
  })
  it('envelope shape', () => {
    const body = licensingErrorResponse('LICENSE_NOT_FOUND', 'License does not exist')
    expect(body).toEqual({ success: false, error: { code: 'LICENSE_NOT_FOUND', message: 'License does not exist', details: {} } })
    expect(isLicensingErrorResponse(body)).toBe(true)
    expect(isLicensingErrorResponse({ success: false, error: { code: 'NOPE', message: '', details: {} } })).toBe(false)
    expect(isLicensingErrorResponse({ success: false, error: { code: 'AUTH_REQUIRED', message: 'x' } })).toBe(false)
  })
  it('LicensingError carries its status and envelope', () => {
    const e = new LicensingError('INSTALL_LIMIT_EXCEEDED', 'Installation limit reached', { max: 1 })
    expect(e.status).toBe(400)
    expect(e.toResponse()).toEqual({ success: false, error: { code: 'INSTALL_LIMIT_EXCEEDED', message: 'Installation limit reached', details: { max: 1 } } })
  })
})
