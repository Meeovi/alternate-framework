import { describe, expect, it } from 'vitest'
import { IDEMPOTENCY_HEADER, LICENSING_API_ENDPOINTS } from '../api-contracts'
import { LICENSING_ACTIONS } from '../authorization'
import { LICENSING_ERROR_STATUS, SUCCESS_STATUSES } from '../errors'

describe('REST contract (frozen)', () => {
  it('declares exactly the frozen endpoints, in order', () => {
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
  it('requires the Idempotency-Key header on every state-changing endpoint, and only there', () => {
    expect(IDEMPOTENCY_HEADER).toBe('Idempotency-Key')
    for (const e of LICENSING_API_ENDPOINTS) expect(e.requiresIdempotencyKey).toBe(e.method !== 'GET')
  })
  it('every endpoint is authenticated, uses an approved success status and a known permission', () => {
    for (const e of LICENSING_API_ENDPOINTS) {
      expect(e.authenticated).toBe(true)
      expect(SUCCESS_STATUSES).toContain(e.successStatus)
      expect(LICENSING_ACTIONS).toContain(e.action)
    }
    expect(LICENSING_API_ENDPOINTS.find((e) => e.method === 'DELETE')?.successStatus).toBe(204)
    expect(LICENSING_API_ENDPOINTS.find((e) => e.path.endsWith('/install'))?.successStatus).toBe(201)
  })
  it('lists only defined error codes; writes declare the idempotency errors', () => {
    for (const e of LICENSING_API_ENDPOINTS) {
      for (const code of e.errors) expect(LICENSING_ERROR_STATUS).toHaveProperty(code)
      if (e.requiresIdempotencyKey) expect(e.errors).toEqual(expect.arrayContaining(['IDEMPOTENCY_KEY_REQUIRED', 'DUPLICATE_IDEMPOTENCY_KEY']))
    }
  })
})
