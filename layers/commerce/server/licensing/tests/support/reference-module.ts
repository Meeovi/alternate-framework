/**
 * In-memory reference implementation of the licensing contracts, used only
 * by the contract tests (not exported from the module). It shows the
 * frozen interfaces can be implemented as specified — idempotency,
 * uniqueness, lifecycle, refund, subscription and versioning rules — and
 * gives real implementations a behaviour to match.
 */
import { randomUUID } from 'node:crypto'
import { assertAllowed, type AuthorizationContext, type LicensingAction } from '../../authorization'
import { LicensingError } from '../../errors'
import { parseLicensingEvent, type CommerceEvent, type LicensingEvent } from '../../events'
import type {
  AuthenticatedUser,
  IdempotencyProvider,
  LicenseRepository,
  LicensingModule,
  LicensingModuleDependencies,
  LicensingRequestContext,
  Purchase,
} from '../../interfaces'
import type { LicenseDownload, LicenseInstallation, LicenseType, LicenseTypeVersion, ProductLicense, UserLicense, UserLicenseStatus } from '../../models'
import { canTransition, grantsAccess, withinLimit } from '../../models'
import { latestPurchasableVersion } from '../../versioning'

const DAY = 86_400_000
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

export function createReferenceLicensingModule(deps: LicensingModuleDependencies): LicensingModule {
  const repo = deps.repository
  const now = deps.now ?? (() => new Date())
  const newId = deps.generateId ?? (() => randomUUID())
  const newKey = deps.generateLicenseKey ?? (() => randomUUID().replace(/-/g, '').toUpperCase())
  const publish = (e: LicensingEvent) => deps.events.publish(parseLicensingEvent(e))

  const mustGetLicense = async (id: string) => {
    const l = await repo.getUserLicense(id)
    if (!l) throw new LicensingError('LICENSE_NOT_FOUND', 'License does not exist', { licenseId: id })
    return l
  }
  const transition = async (l: UserLicense, to: UserLicenseStatus, patch: Partial<UserLicense> = {}) => {
    if (l.status !== to && !canTransition(l.status, to)) throw new LicensingError('INVALID_STATUS_TRANSITION', `Cannot change a ${l.status} license to ${to}`, { from: l.status, to })
    return repo.saveUserLicense({ ...l, ...patch, status: to })
  }
  const deactivateInstallations = async (licenseId: string) => {
    for (const i of await repo.listInstallations(licenseId)) if (i.active) await repo.saveInstallation({ ...i, active: false })
  }
  const offerFor = async (l: UserLicense) => {
    const o = await repo.getProductLicense(l.productLicenseId)
    if (!o) throw new LicensingError('INVALID_LICENSE_TYPE', 'License offer no longer exists', { productLicenseId: l.productLicenseId })
    return o
  }

  // Core operations, without per-request authorization (shared with commerce events).
  const core = {
    async createLicense(purchase: { id: string, userId: string, productId: string, productLicenseId: string }) {
      const existing = await repo.findUserLicenseByPurchase(purchase.id, purchase.productLicenseId)
      if (existing[0]) return existing[0]
      const offer = await repo.getProductLicense(purchase.productLicenseId)
      if (!offer || !offer.active || offer.productId !== purchase.productId) throw new LicensingError('INVALID_LICENSE_TYPE', 'No active license offer for this product', { productLicenseId: purchase.productLicenseId })
      // New purchasers get the newest active version of the offer's license type.
      const latest = latestPurchasableVersion(await repo.listLicenseTypeVersions(offer.licenseTypeId), now())
      const at = now()
      const license = await repo.saveUserLicense({
        id: newId(), licenseKey: newKey(), userId: purchase.userId, productId: purchase.productId, productLicenseId: offer.id,
        purchaseId: purchase.id, versionId: latest?.id ?? offer.licenseVersionId, status: 'active', activatedAt: at,
        expiresAt: offer.expiresAfterDays !== undefined ? new Date(at.getTime() + offer.expiresAfterDays * DAY) : undefined, createdAt: at,
      })
      await publish({ event: 'license.activated', licenseId: license.id })
      return license
    },
    async revoke(id: string, reason: string) {
      const l = await mustGetLicense(id)
      if (l.status === 'revoked') return l
      const saved = await transition(l, 'revoked')
      await deactivateInstallations(id)
      await publish({ event: 'license.revoked', licenseId: id, reason })
      return saved
    },
    async expire(id: string) {
      const l = await mustGetLicense(id)
      if (l.status === 'expired') return l
      const saved = await transition(l, 'expired', { expiresAt: l.expiresAt && l.expiresAt < now() ? l.expiresAt : now() })
      await deactivateInstallations(id)
      await publish({ event: 'license.expired', licenseId: id })
      return saved
    },
    async renew(id: string, periodEnd?: Date) {
      const l = await mustGetLicense(id)
      const offer = await offerFor(l)
      const base = l.expiresAt && l.expiresAt > now() ? l.expiresAt : now()
      const expiresAt = periodEnd ?? (offer.expiresAfterDays !== undefined ? new Date(base.getTime() + offer.expiresAfterDays * DAY) : undefined)
      const reactivated = l.status !== 'active'
      const saved = await transition(l, 'active', { expiresAt })
      if (reactivated) await publish({ event: 'license.activated', licenseId: id })
      return saved
    },
  }

  const commerceEvents = {
    async handle(event: CommerceEvent) {
      switch (event.event) {
        case 'purchase.completed':
          await core.createLicense({ id: event.purchaseId, userId: event.userId, productId: event.productId, productLicenseId: event.licenseId })
          return
        case 'purchase.refunded':
          for (const l of await repo.findUserLicenseByPurchase(event.purchaseId)) await core.revoke(l.id, 'refund')
          return
        case 'subscription.renewed':
          await core.renew(event.licenseId, event.currentPeriodEndsAt)
          return
        case 'subscription.expired':
          await core.expire(event.licenseId)
          return
        case 'subscription.cancelled': {
          // Access continues until the period ends; expiry arrives later.
          const l = await mustGetLicense(event.licenseId)
          await repo.saveUserLicense({ ...l, expiresAt: event.currentPeriodEndsAt })
        }
      }
    },
  }

  function forRequest({ user, idempotencyKey }: LicensingRequestContext) {
    const guard = (action: LicensingAction, ctx: AuthorizationContext = {}) => assertAllowed(user, action, ctx)
    const once = async <T>(operation: string, args: unknown, run: () => Promise<T>): Promise<T> => {
      if (!idempotencyKey) throw new LicensingError('IDEMPOTENCY_KEY_REQUIRED', 'Send an Idempotency-Key header')
      return deps.idempotency.execute(`${user?.id}:${idempotencyKey}`, JSON.stringify([operation, args]), run)
    }
    const targetFacts = async (u: AuthenticatedUser | null, type: LicenseInstallation['targetType'], id: string): Promise<AuthorizationContext> => ({
      target: { type, id },
      canManageTargetWorkspace: !!u && type === 'workspace' && await deps.workspaces.userCanManageWorkspace(u, id),
      canManageTargetOrganisation: !!u && type === 'organisation' && await deps.workspaces.userCanManageOrganisation(u, id),
    })

    const licensing = {
      createLicense: (purchase: Purchase) =>
        once('createLicense', purchase.id, async () => { guard('license.issue'); return core.createLicense(purchase) }),
      activateLicense: (id: string) => once('activateLicense', id, async () => {
        const l = await mustGetLicense(id); guard('license.activate', { licenseOwnerId: l.userId })
        if (l.status === 'active') return l
        const saved = await transition(l, 'active', { activatedAt: l.activatedAt ?? now() })
        await publish({ event: 'license.activated', licenseId: id })
        return saved
      }),
      revokeLicense: (id: string, reason: string) => once('revokeLicense', [id, reason], async () => {
        guard('license.revoke')
        if (!reason?.trim()) throw new LicensingError('VALIDATION_ERROR', 'A reason is required')
        return core.revoke(id, reason)
      }),
      expireLicense: (id: string) => once('expireLicense', id, async () => { guard('license.expire'); return core.expire(id) }),
      renewLicense: (id: string) => once('renewLicense', id, async () => {
        const l = await mustGetLicense(id); guard('license.renew', { licenseOwnerId: l.userId })
        return core.renew(id)
      }),
      validateLicense: async (userId: string, productId: string) => {
        guard('license.view', { licenseOwnerId: userId })
        return (await repo.listUserLicensesForProduct(userId, productId)).some((l) => grantsAccess(l, now()))
      },
      getLicense: async (id: string) => {
        const l = await mustGetLicense(id); guard('license.view', { licenseOwnerId: l.userId }); return l
      },
      listUserLicenses: async (userId: string) => { guard('license.view', { licenseOwnerId: userId }); return repo.listUserLicenses(userId) },
    }

    const installations = {
      install: (licenseId: string, targetType: LicenseInstallation['targetType'], targetId: string) => once('install', [licenseId, targetType, targetId], async () => {
        const l = await mustGetLicense(licenseId)
        guard('license.install', { licenseOwnerId: l.userId, ...await targetFacts(user, targetType, targetId) })
        if (!grantsAccess(l, now())) throw new LicensingError('LICENSE_NOT_ACTIVE', 'This license is not active', { status: l.status })
        const all = await repo.listInstallations(licenseId)
        const active = all.filter((i) => i.active)
        if (active.some((i) => i.targetType === targetType && i.targetId === targetId)) throw new LicensingError('LICENSE_ALREADY_INSTALLED', 'Already installed here', { targetType, targetId })
        if (!withinLimit((await offerFor(l)).maxInstallations, active.length)) throw new LicensingError('INSTALL_LIMIT_EXCEEDED', 'Installation limit reached')
        const pluginId = String((await repo.getProductLicense(l.productLicenseId))?.metadata?.pluginId ?? l.productId)
        const saved = await repo.saveInstallation({ id: newId(), userLicenseId: licenseId, targetType, targetId, installedAt: now(), active: true })
        await publish({ event: 'plugin.installed', pluginId, licenseId })
        return saved
      }),
      uninstall: (installationId: string) => once('uninstall', installationId, async () => {
        const inst = await repo.getInstallation(installationId)
        if (!inst) throw new LicensingError('INSTALLATION_NOT_FOUND', 'Installation does not exist', { installationId })
        const l = await mustGetLicense(inst.userLicenseId)
        guard('installation.remove', { licenseOwnerId: l.userId, ...await targetFacts(user, inst.targetType, inst.targetId) })
        if (!inst.active) return
        await repo.saveInstallation({ ...inst, active: false })
        await publish({ event: 'plugin.removed', pluginId: String((await repo.getProductLicense(l.productLicenseId))?.metadata?.pluginId ?? l.productId), licenseId: l.id })
      }),
      listInstallations: async (licenseId: string) => {
        const l = await mustGetLicense(licenseId); guard('installation.list', { licenseOwnerId: l.userId })
        return repo.listInstallations(licenseId)
      },
    }

    const downloads = {
      authorizeDownload: async (userId: string, productId: string) => {
        guard('license.download', { licenseOwnerId: userId })
        for (const l of await repo.listUserLicensesForProduct(userId, productId)) {
          if (grantsAccess(l, now()) && withinLimit((await offerFor(l)).maxDownloads, await repo.countDownloads(l.id))) return true
        }
        return false
      },
      recordDownload: (licenseId: string, fileId: string) => once('recordDownload', [licenseId, fileId], async () => {
        const l = await mustGetLicense(licenseId); guard('license.download', { licenseOwnerId: l.userId })
        if (!grantsAccess(l, now())) throw new LicensingError('LICENSE_NOT_ACTIVE', 'This license is not active', { status: l.status })
        if (!withinLimit((await offerFor(l)).maxDownloads, await repo.countDownloads(l.id))) throw new LicensingError('DOWNLOAD_LIMIT_EXCEEDED', 'Download limit reached')
        await repo.insertDownload({ id: newId(), userLicenseId: l.id, fileId, downloadedAt: now() })
      }),
    }

    const catalog = {
      createLicenseType: (t: LicenseType) => once('createLicenseType', t.id, async () => { guard('template.manage'); return repo.saveLicenseType(t) }),
      createLicenseTypeVersion: (v: LicenseTypeVersion) => once('createLicenseTypeVersion', v.id, async () => { guard('version.manage'); return repo.insertLicenseTypeVersion(v) }),
      listLicenseTypeVersions: async (typeId: string) => repo.listLicenseTypeVersions(typeId),
      createProductLicense: (o: ProductLicense) => once('createProductLicense', o.id, async () => {
        guard('template.manage')
        const type = await repo.getLicenseType(o.licenseTypeId)
        if (!type?.active) throw new LicensingError('INVALID_LICENSE_TYPE', 'Unknown or inactive license type', { licenseTypeId: o.licenseTypeId })
        if (!await deps.products.getProduct(o.productId)) throw new LicensingError('PRODUCT_NOT_FOUND', 'Product does not exist', { productId: o.productId })
        return repo.saveProductLicense(o)
      }),
    }

    return { licensing, installations, downloads, catalog }
  }

  return { forRequest, commerceEvents }
}
