import { describe, expect, it } from 'vitest'
import {
  IDEMPOTENCY_HEADER,
  LICENSING_API_ENDPOINTS,
  LICENSING_ERROR_STATUS,
} from '../api-contracts'

describe('licensing API contracts', () => {
  it('declares the required REST operations', () => {
    expect(LICENSING_API_ENDPOINTS.map(({ method, path }) => `${method} ${path}`)).toEqual([
      'GET /api/licenses',
      'GET /api/licenses/{id}',
      'POST /api/licenses/{id}/activate',
      'POST /api/licenses/{id}/revoke',
      'POST /api/licenses/{id}/renew',
      'POST /api/licenses/{id}/install',
      'DELETE /api/installations/{id}',
      'GET /api/licenses/{id}/installations',
      'POST /api/licenses/{id}/download',
    ])
  })

  it('requires idempotency keys for every state-changing operation', () => {
    expect(IDEMPOTENCY_HEADER).toBe('Idempotency-Key')
    expect(LICENSING_API_ENDPOINTS.filter(({ method }) => method !== 'GET')
      .every(({ requiresIdempotencyKey }) => requiresIdempotencyKey)).toBe(true)
  })

  it('maps the standard authorization, validation, conflict, and not-found errors', () => {
    expect(LICENSING_ERROR_STATUS).toMatchObject({
      AUTH_REQUIRED: 401,
      LICENSE_ACCESS_DENIED: 403,
      INVALID_LICENSE_TYPE: 400,
      INSTALL_LIMIT_EXCEEDED: 400,
      LICENSE_ALREADY_INSTALLED: 409,
      DUPLICATE_IDEMPOTENCY_KEY: 409,
      LICENSE_NOT_FOUND: 404,
      PRODUCT_NOT_FOUND: 404,
    })
  })
})