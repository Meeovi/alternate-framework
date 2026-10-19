/**
 * In-memory storage and idempotency for the contract tests. They follow
 * the uniqueness rules a real repository must enforce (interfaces.ts).
 */
import { LicensingError } from '../../errors'
import type { IdempotencyProvider, LicenseRepository } from '../../interfaces'
import type { LicenseDownload, LicenseInstallation, LicenseType, LicenseTypeVersion, ProductLicense, UserLicense } from '../../models'

const clone = <T>(v: T): T => structuredClone(v)

export class MemoryRepository implements LicenseRepository {
  types = new Map<string, LicenseType>()
  versions = new Map<string, LicenseTypeVersion>()
  offers = new Map<string, ProductLicense>()
  licenses = new Map<string, UserLicense>()
  installations = new Map<string, LicenseInstallation>()
  downloads: LicenseDownload[] = []

  async saveLicenseType(t: LicenseType) { this.types.set(t.id, clone(t)); return clone(t) }
  async getLicenseType(id: string) { return clone(this.types.get(id) ?? null) }
  async insertLicenseTypeVersion(v: LicenseTypeVersion) {
    if (this.versions.has(v.id)) throw new LicensingError('VALIDATION_ERROR', 'License terms versions are immutable', { id: v.id })
    this.versions.set(v.id, clone(v)); return clone(v)
  }
  async getLicenseTypeVersion(id: string) { return clone(this.versions.get(id) ?? null) }
  async listLicenseTypeVersions(typeId: string) { return [...this.versions.values()].filter((v) => v.licenseTypeId === typeId).map(clone) }
  async saveProductLicense(o: ProductLicense) { this.offers.set(o.id, clone(o)); return clone(o) }
  async getProductLicense(id: string) { return clone(this.offers.get(id) ?? null) }
  async getUserLicense(id: string) { return clone(this.licenses.get(id) ?? null) }
  async findUserLicenseByPurchase(purchaseId: string, offerId?: string) {
    return [...this.licenses.values()].filter((l) => l.purchaseId === purchaseId && (!offerId || l.productLicenseId === offerId)).map(clone)
  }
  async listUserLicenses(userId: string) { return [...this.licenses.values()].filter((l) => l.userId === userId).map(clone) }
  async listUserLicensesForProduct(userId: string, productId: string) {
    return [...this.licenses.values()].filter((l) => l.userId === userId && l.productId === productId).map(clone)
  }
  async saveUserLicense(l: UserLicense) {
    const dupe = [...this.licenses.values()].find((x) => x.id !== l.id && ((x.purchaseId === l.purchaseId && x.productLicenseId === l.productLicenseId) || x.licenseKey === l.licenseKey))
    if (dupe) throw new Error('unique violation: user license')
    this.licenses.set(l.id, clone(l)); return clone(l)
  }
  async getInstallation(id: string) { return clone(this.installations.get(id) ?? null) }
  async listInstallations(licenseId: string) { return [...this.installations.values()].filter((i) => i.userLicenseId === licenseId).map(clone) }
  async saveInstallation(i: LicenseInstallation) {
    const dupe = [...this.installations.values()].find((x) => x.id !== i.id && x.active && i.active && x.userLicenseId === i.userLicenseId && x.targetType === i.targetType && x.targetId === i.targetId)
    if (dupe) throw new Error('unique violation: installation')
    this.installations.set(i.id, clone(i)); return clone(i)
  }
  async insertDownload(d: LicenseDownload) { this.downloads.push(clone(d)); return clone(d) }
  async countDownloads(licenseId: string) { return this.downloads.filter((d) => d.userLicenseId === licenseId).length }
}

export class MemoryIdempotency implements IdempotencyProvider {
  private results = new Map<string, { fingerprint: string, result: Promise<unknown> }>()
  async execute<T>(key: string, fingerprint: string, operation: () => Promise<T>): Promise<T> {
    const seen = this.results.get(key)
    if (seen) {
      if (seen.fingerprint !== fingerprint) throw new LicensingError('DUPLICATE_IDEMPOTENCY_KEY', 'This Idempotency-Key was used for a different request', { key })
      return clone(await seen.result) as T
    }
    const result = operation()
    this.results.set(key, { fingerprint, result })
    try { return clone(await result) } catch (e) { this.results.delete(key); throw e }
  }
}
