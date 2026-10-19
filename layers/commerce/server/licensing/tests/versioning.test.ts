import { describe, expect, it } from 'vitest'
import type { LicenseTypeVersion } from '../models'
import {
  compareLicenseVersions, freezeLicenseTypeVersion, isValidVersionBump, latestPurchasableVersion,
  nextLicenseVersion, parseLicenseVersion, requiredChangeKind,
} from '../versioning'
import { commercialType } from './support/fixture'

const v = (id: string, version: string, over: Partial<LicenseTypeVersion> = {}): LicenseTypeVersion => ({
  id, licenseTypeId: 't', version, title: version, terms: '', effectiveDate: new Date('2026-01-01'), active: true, createdAt: new Date('2026-01-01'), ...over,
})

describe('versioning rules', () => {
  it('parses major.minor only', () => {
    expect(parseLicenseVersion('1.0')).toEqual({ major: 1, minor: 0 })
    expect(parseLicenseVersion('2.13')).toEqual({ major: 2, minor: 13 })
    for (const bad of ['1', '1.0.0', 'v1.0', '01.0', '1.x', '']) expect(parseLicenseVersion(bad)).toBeNull()
  })
  it('orders numerically', () => {
    expect(compareLicenseVersions('1.10', '1.9')).toBeGreaterThan(0)
    expect(compareLicenseVersions('2.0', '1.99')).toBeGreaterThan(0)
    expect(compareLicenseVersions('1.1', '1.1')).toBe(0)
  })
  it('rights changes are major, wording changes minor', () => {
    const p = commercialType.permissions
    expect(requiredChangeKind(p, { ...p })).toBe('minor')
    for (const key of Object.keys(p) as (keyof typeof p)[]) expect(requiredChangeKind(p, { ...p, [key]: !p[key] })).toBe('major')
  })
  it('bumps: 1.0 → 1.1 (minor), 1.x → 2.0 (major)', () => {
    expect(nextLicenseVersion('1.0', 'minor')).toBe('1.1')
    expect(nextLicenseVersion('1.4', 'major')).toBe('2.0')
    expect(isValidVersionBump('1.0', '1.1', 'minor')).toBe(true)
    expect(isValidVersionBump('1.0', '2.0', 'minor')).toBe(false)
    expect(isValidVersionBump('1.3', '2.0', 'major')).toBe(true)
    expect(isValidVersionBump('1.3', '1.4', 'major')).toBe(false)
  })
  it('new purchasers get the newest active, effective version', () => {
    const now = new Date('2026-06-01')
    const versions = [v('a', '1.0'), v('b', '1.1'), v('c', '2.0', { active: false }), v('d', '1.2', { effectiveDate: new Date('2026-12-01') })]
    expect(latestPurchasableVersion(versions, now)?.id).toBe('b')
    expect(latestPurchasableVersion([v('x', '1.0', { active: false })], now)).toBeNull()
  })
  it('terms versions are immutable', () => {
    const frozen = freezeLicenseTypeVersion(v('a', '1.0'))
    expect(() => { (frozen as { terms: string }).terms = 'changed' }).toThrow()
  })
})
