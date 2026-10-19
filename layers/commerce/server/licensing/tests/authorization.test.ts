import { describe, expect, it } from 'vitest'
import { ADMIN_ONLY_ACTIONS, assertAllowed, isAllowed, LICENSING_ACTIONS } from '../authorization'
import { LicensingError } from '../errors'
import { admin, buyer, otherUser } from './support/fixture'

const own = { licenseOwnerId: buyer.id }

describe('user permissions', () => {
  it('view, download, activate and renew their own licenses only', () => {
    for (const action of ['license.view', 'license.download', 'license.activate', 'license.renew'] as const) {
      expect(isAllowed(buyer, action, own)).toBe(true)
      expect(isAllowed(otherUser, action, own)).toBe(false)
    }
  })
  it('install owned integrations on themselves', () => {
    expect(isAllowed(buyer, 'license.install', { ...own, target: { type: 'user', id: buyer.id } })).toBe(true)
    expect(isAllowed(buyer, 'license.install', { ...own, target: { type: 'user', id: otherUser.id } })).toBe(false)
    expect(isAllowed(otherUser, 'license.install', { ...own, target: { type: 'user', id: otherUser.id } })).toBe(false)
  })
})

describe('workspace permissions', () => {
  const ws = { type: 'workspace' as const, id: 'ws-1' }
  it('install into and manage installations on a workspace they administer', () => {
    expect(isAllowed(buyer, 'license.install', { ...own, target: ws, canManageTargetWorkspace: true })).toBe(true)
    expect(isAllowed(buyer, 'license.install', { ...own, target: ws, canManageTargetWorkspace: false })).toBe(false)
    expect(isAllowed(otherUser, 'installation.remove', { licenseOwnerId: buyer.id, target: ws, canManageTargetWorkspace: true })).toBe(true)
    expect(isAllowed(otherUser, 'installation.remove', { licenseOwnerId: buyer.id, target: ws })).toBe(false)
  })
  it('view workspace licenses', () => {
    expect(isAllowed(otherUser, 'workspace.licenses.view', { canManageTargetWorkspace: true })).toBe(true)
    expect(isAllowed(otherUser, 'workspace.licenses.view', {})).toBe(false)
  })
})

describe('platform administrator permissions', () => {
  it('suspend, revoke, expire, issue, manage templates and versions — admins only', () => {
    expect(ADMIN_ONLY_ACTIONS).toEqual(expect.arrayContaining(['license.suspend', 'license.revoke', 'template.manage', 'version.manage']))
    for (const action of ADMIN_ONLY_ACTIONS) {
      expect(isAllowed(admin, action)).toBe(true)
      expect(isAllowed(buyer, action, own)).toBe(false)
    }
  })
  it('admins may do everything', () => {
    for (const action of LICENSING_ACTIONS) expect(isAllowed(admin, action)).toBe(true)
  })
})

describe('authentication', () => {
  it('no user: nothing is allowed; assertAllowed says AUTH_REQUIRED, else LICENSE_ACCESS_DENIED', () => {
    for (const action of LICENSING_ACTIONS) expect(isAllowed(null, action, own)).toBe(false)
    expect(() => assertAllowed(null, 'license.view', own)).toThrow(expect.objectContaining({ code: 'AUTH_REQUIRED' }))
    expect(() => assertAllowed(otherUser, 'license.view', own)).toThrow(expect.objectContaining({ code: 'LICENSE_ACCESS_DENIED' }))
    expect(() => assertAllowed(buyer, 'license.view', own)).not.toThrow()
    try { assertAllowed(null, 'license.view') } catch (e) { expect(e).toBeInstanceOf(LicensingError) }
  })
})
