import { describe, expect, it, vi } from 'vitest'
import scimPlugin, { canGenerateScimToken } from '../runtime/server'

describe('auth-scim', () => {
  it('lets site admins mint any token, org admins/owners only for their organization', () => {
    expect(canGenerateScimToken({ role: 'admin' }, null)).toBe(true)
    expect(canGenerateScimToken({ role: 'user,admin' }, { role: 'member' })).toBe(true)
    expect(canGenerateScimToken({ role: 'user' }, { role: 'owner' })).toBe(true)
    expect(canGenerateScimToken({ role: 'user' }, { role: 'admin' })).toBe(true)
    expect(canGenerateScimToken({ role: 'user' }, { role: 'member' })).toBe(false)
    // A provider with no organization: site admins only.
    expect(canGenerateScimToken({ role: 'user' }, null)).toBe(false)
    expect(canGenerateScimToken(null, null)).toBe(false)
  })

  it('builds the scim plugin with the layer context', () => {
    const plugin = scimPlugin({ logAuditEvent: vi.fn(), sendAuthEmail: vi.fn() })
    expect(plugin.id).toBe('scim')
  })
})
