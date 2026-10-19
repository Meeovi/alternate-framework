import { describe, expect, it } from 'vitest'
import {
  canTransition, grantsAccess, INSTALLATION_TARGET_TYPES, LICENSE_PERMISSION_KEYS, LICENSE_SCOPES,
  USER_LICENSE_STATUSES, USER_LICENSE_TRANSITIONS, withinLimit,
} from '../models'

describe('domain model (frozen values)', () => {
  it('scopes', () => {
    expect(LICENSE_SCOPES).toEqual(['personal', 'commercial', 'workspace', 'organisation', 'exclusive', 'subscription'])
  })
  it('permission flags', () => {
    expect(LICENSE_PERMISSION_KEYS).toEqual(['personalUse', 'commercialUse', 'clientProjects', 'modification', 'redistribution', 'resale', 'attributionRequired'])
  })
  it('user license statuses (no partial_refund)', () => {
    expect(USER_LICENSE_STATUSES).toEqual(['active', 'expired', 'revoked', 'suspended'])
  })
  it('installation target types', () => {
    expect(INSTALLATION_TARGET_TYPES).toEqual(['user', 'workspace', 'organisation'])
  })
})

describe('license lifecycle', () => {
  it('has a rule for every status, and revoked is final', () => {
    expect(Object.keys(USER_LICENSE_TRANSITIONS).sort()).toEqual([...USER_LICENSE_STATUSES].sort())
    for (const to of USER_LICENSE_STATUSES) expect(canTransition('revoked', to)).toBe(false)
  })
  it('allows the spec flows', () => {
    expect(canTransition('active', 'expired')).toBe(true) // subscription ends
    expect(canTransition('expired', 'active')).toBe(true) // reactivation / renewal
    expect(canTransition('active', 'revoked')).toBe(true) // refund
    expect(canTransition('active', 'suspended')).toBe(true) // admin
    expect(canTransition('suspended', 'active')).toBe(true)
    expect(canTransition('expired', 'suspended')).toBe(false)
  })
  it('grants access only while active and unexpired', () => {
    const now = new Date('2026-06-01')
    expect(grantsAccess({ status: 'active' }, now)).toBe(true)
    expect(grantsAccess({ status: 'active', expiresAt: new Date('2026-07-01') }, now)).toBe(true)
    expect(grantsAccess({ status: 'active', expiresAt: new Date('2026-05-01') }, now)).toBe(false)
    for (const status of ['expired', 'revoked', 'suspended'] as const) expect(grantsAccess({ status }, now)).toBe(false)
  })
})

describe('limits', () => {
  it('omitted = unlimited, 0 = none', () => {
    expect(withinLimit(undefined, 10_000)).toBe(true)
    expect(withinLimit(0, 0)).toBe(false)
    expect(withinLimit(2, 1)).toBe(true)
    expect(withinLimit(2, 2)).toBe(false)
  })
})
