import { describe, expect, it, vi } from 'vitest'
import ssoPlugin, { ssoOrganizationRole } from '../runtime/server'
import ssoClient from '../runtime/client'

describe('auth-sso', () => {
  it('maps IdP attributes to an organization role', () => {
    expect(ssoOrganizationRole({ attributes: { jobTitle: 'Engineering Manager' } })).toBe('admin')
    expect(ssoOrganizationRole({ attributes: { jobTitle: 'VP Sales' } })).toBe('admin')
    expect(ssoOrganizationRole({ attributes: { department: 'IT' } })).toBe('admin')
    expect(ssoOrganizationRole({ attributes: { jobTitle: 'Designer', department: 'Product' } })).toBe('member')
    expect(ssoOrganizationRole({})).toBe('member')
  })

  it('builds the server and client plugins', () => {
    expect(ssoPlugin({ logAuditEvent: vi.fn(), sendAuthEmail: vi.fn() }).id).toBe('sso')
    expect(ssoClient().id).toBe('sso-client')
  })
})
