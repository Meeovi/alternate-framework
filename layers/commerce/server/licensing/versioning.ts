/**
 * License terms versioning rules (contract v1.0).
 *
 * - Terms are immutable: a change is a new LicenseTypeVersion.
 * - Existing purchasers keep the version they bought under; nothing is
 *   migrated automatically.
 * - New purchasers receive the newest active, effective version.
 * - Major bump (1.x → 2.x): any change to rights — commercial use,
 *   redistribution, attribution or resale rules (any permission flag).
 * - Minor bump (1.0 → 1.1): wording only — typos, formatting,
 *   clarifications. Rights must be identical.
 */
import type { LicensePermissions, LicenseTypeVersion } from './models'
import { LICENSE_PERMISSION_KEYS } from './models'

export interface ParsedLicenseVersion {
  major: number
  minor: number
}

const VERSION_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)$/

/** Parses `<major>.<minor>`; returns null for anything else. */
export function parseLicenseVersion(version: string): ParsedLicenseVersion | null {
  const match = VERSION_PATTERN.exec(version)
  return match ? { major: Number(match[1]), minor: Number(match[2]) } : null
}

/** Orders two versions: negative if a < b, 0 if equal, positive if a > b. */
export function compareLicenseVersions(a: string, b: string): number {
  const pa = parseLicenseVersion(a), pb = parseLicenseVersion(b)
  if (!pa || !pb) throw new Error(`Invalid license version: ${!pa ? a : b}`)
  return pa.major - pb.major || pa.minor - pb.minor
}

export type LicenseChangeKind = 'major' | 'minor'

/** Rights changes need a major version; wording-only changes a minor one. */
export function requiredChangeKind(before: LicensePermissions, after: LicensePermissions): LicenseChangeKind {
  return LICENSE_PERMISSION_KEYS.some((key) => before[key] !== after[key]) ? 'major' : 'minor'
}

/** The version that follows `current` for a change of the given kind. */
export function nextLicenseVersion(current: string, kind: LicenseChangeKind): string {
  const parsed = parseLicenseVersion(current)
  if (!parsed) throw new Error(`Invalid license version: ${current}`)
  return kind === 'major' ? `${parsed.major + 1}.0` : `${parsed.major}.${parsed.minor + 1}`
}

/**
 * Whether `next` is a valid successor of `current` for the change kind:
 * a major change must raise the major number; a minor change must keep
 * the major number and raise the minor one.
 */
export function isValidVersionBump(current: string, next: string, kind: LicenseChangeKind): boolean {
  const c = parseLicenseVersion(current), n = parseLicenseVersion(next)
  if (!c || !n) return false
  return kind === 'major' ? n.major > c.major : n.major === c.major && n.minor > c.minor
}

/**
 * The version new purchasers receive: the highest active version whose
 * effective date has passed. Null when none qualifies.
 */
export function latestPurchasableVersion(
  versions: readonly LicenseTypeVersion[],
  now: Date = new Date(),
): LicenseTypeVersion | null {
  return versions
    .filter((v) => v.active && v.effectiveDate.getTime() <= now.getTime() && parseLicenseVersion(v.version))
    .reduce<LicenseTypeVersion | null>((best, v) => (!best || compareLicenseVersions(v.version, best.version) > 0 ? v : best), null)
}

/** Freezes a terms version so it can't be edited in memory. */
export function freezeLicenseTypeVersion<T extends LicenseTypeVersion>(version: T): Readonly<T> {
  return Object.freeze({ ...version })
}
