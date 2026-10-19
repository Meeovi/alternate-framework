import { describe, expect, it } from 'vitest'
import { admin, buyer, buyerWorkspaceAdmin, otherUser, setup } from './support/fixture'

describe('idempotency', () => {
  it('a retried request with the same key returns the identical result and changes nothing', async () => {
    const t = await setup()
    await t.purchase()
    const [license] = await t.repository.listUserLicenses(buyer.id)
    const first = await t.as(buyer, 'same-key').installations.install(license!.id, 'user', buyer.id)
    const again = await t.as(buyer, 'same-key').installations.install(license!.id, 'user', buyer.id)
    expect(again).toEqual(first)
    expect(await t.repository.listInstallations(license!.id)).toHaveLength(1)
  })
  it('the same key for a different request is DUPLICATE_IDEMPOTENCY_KEY', async () => {
    const t = await setup()
    await t.purchase()
    const [license] = await t.repository.listUserLicenses(buyer.id)
    await t.as(buyer, 'k').installations.install(license!.id, 'user', buyer.id)
    await expect(t.as(buyerWorkspaceAdmin, 'k').installations.install(license!.id, 'workspace', 'ws-1'))
      .rejects.toMatchObject({ code: 'DUPLICATE_IDEMPOTENCY_KEY', status: 409 })
  })
  it('state changes without a key are refused', async () => {
    const t = await setup()
    await t.purchase()
    const [license] = await t.repository.listUserLicenses(buyer.id)
    await expect(t.module.forRequest({ user: buyer }).licensing.renewLicense(license!.id)).rejects.toMatchObject({ code: 'IDEMPOTENCY_KEY_REQUIRED' })
  })
  it('a purchase event delivered twice issues one license', async () => {
    const t = await setup()
    await t.purchase('p-1')
    await t.purchase('p-1')
    const licenses = await t.repository.listUserLicenses(buyer.id)
    expect(licenses).toHaveLength(1)
    expect(t.published.filter((e) => e.event === 'license.activated')).toHaveLength(1)
  })
  it('installing twice on the same target is LICENSE_ALREADY_INSTALLED', async () => {
    const t = await setup()
    await t.purchase()
    const [license] = await t.repository.listUserLicenses(buyer.id)
    await t.as(buyer).installations.install(license!.id, 'user', buyer.id)
    await expect(t.as(buyer).installations.install(license!.id, 'user', buyer.id)).rejects.toMatchObject({ code: 'LICENSE_ALREADY_INSTALLED', status: 409 })
  })
})

describe('purchase and refund flows', () => {
  it('purchase.completed issues an active license under the newest terms, keyed and announced', async () => {
    const t = await setup()
    await t.purchase()
    const [license] = await t.repository.listUserLicenses(buyer.id)
    expect(license).toMatchObject({ status: 'active', purchaseId: 'purchase-1', productLicenseId: 'offer-1', versionId: 'v-1.0' })
    expect(license!.licenseKey).toBeTruthy()
    expect(t.published).toContainEqual({ event: 'license.activated', licenseId: license!.id })
    expect(await t.as(buyer).licensing.validateLicense(buyer.id, 'prod-1')).toBe(true)
    expect(await t.as(buyer).downloads.authorizeDownload(buyer.id, 'prod-1')).toBe(true)
  })
  it('purchase.refunded revokes, disables installations and downloads', async () => {
    const t = await setup()
    await t.purchase()
    const [license] = await t.repository.listUserLicenses(buyer.id)
    await t.as(buyer).installations.install(license!.id, 'user', buyer.id)
    await t.module.commerceEvents.handle({ event: 'purchase.refunded', purchaseId: 'purchase-1' })
    expect((await t.repository.getUserLicense(license!.id))!.status).toBe('revoked')
    expect((await t.repository.listInstallations(license!.id)).every((i) => !i.active)).toBe(true)
    expect(await t.as(buyer).downloads.authorizeDownload(buyer.id, 'prod-1')).toBe(false)
    expect(t.published).toContainEqual({ event: 'license.revoked', licenseId: license!.id, reason: 'refund' })
    await expect(t.as(buyer).licensing.renewLicense(license!.id)).rejects.toMatchObject({ code: 'INVALID_STATUS_TRANSITION' })
  })
})

describe('subscription flows', () => {
  const sub = { offer: { subscriptionBased: true, expiresAfterDays: 30 } }
  it('renewal extends expiry; cancellation keeps access to period end; expiry stops access; reactivation restores it', async () => {
    const t = await setup(sub)
    await t.purchase()
    const [license] = await t.repository.listUserLicenses(buyer.id)
    const firstEnd = license!.expiresAt!
    expect(firstEnd.getTime() - t.now().getTime()).toBe(30 * 86_400_000)

    await t.module.commerceEvents.handle({ event: 'subscription.renewed', licenseId: license!.id })
    expect((await t.repository.getUserLicense(license!.id))!.expiresAt!.getTime()).toBe(firstEnd.getTime() + 30 * 86_400_000)

    const periodEnd = new Date(t.now().getTime() + 10 * 86_400_000)
    await t.module.commerceEvents.handle({ event: 'subscription.cancelled', licenseId: license!.id, currentPeriodEndsAt: periodEnd })
    expect((await t.repository.getUserLicense(license!.id))!.status).toBe('active')
    expect(await t.as(buyer).licensing.validateLicense(buyer.id, 'prod-1')).toBe(true)
    t.advance(11)
    expect(await t.as(buyer).licensing.validateLicense(buyer.id, 'prod-1')).toBe(false) // past the paid period

    await t.module.commerceEvents.handle({ event: 'subscription.expired', licenseId: license!.id })
    expect((await t.repository.getUserLicense(license!.id))!.status).toBe('expired')
    expect(t.published).toContainEqual({ event: 'license.expired', licenseId: license!.id })

    await t.module.commerceEvents.handle({ event: 'subscription.renewed', licenseId: license!.id })
    expect((await t.repository.getUserLicense(license!.id))!.status).toBe('active')
    expect(await t.as(buyer).licensing.validateLicense(buyer.id, 'prod-1')).toBe(true)
  })
})

describe('versioning', () => {
  it('existing purchasers keep their version; new purchasers get the newest active one', async () => {
    const t = await setup()
    await t.purchase('p-old', buyer.id)
    await t.as(admin).catalog.createLicenseTypeVersion({ id: 'v-1.1', licenseTypeId: 'type-commercial', version: '1.1', title: '1.1', terms: 'clarified', effectiveDate: new Date('2026-05-01'), active: true, createdAt: new Date('2026-05-01') })
    await t.purchase('p-new', otherUser.id)
    expect((await t.repository.listUserLicenses(buyer.id))[0]!.versionId).toBe('v-1.0')
    expect((await t.repository.listUserLicenses(otherUser.id))[0]!.versionId).toBe('v-1.1')
  })
  it('a terms version cannot be overwritten', async () => {
    const t = await setup()
    await expect(t.as(admin).catalog.createLicenseTypeVersion({ id: 'v-1.0', licenseTypeId: 'type-commercial', version: '1.0', title: 'x', terms: 'changed', effectiveDate: new Date(), active: true, createdAt: new Date() }))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
    expect((await t.repository.getLicenseTypeVersion('v-1.0'))!.terms).toBe('Terms 1.0')
  })
})

describe('limits and access', () => {
  it('installation limit counts active installations', async () => {
    const t = await setup({ offer: { maxInstallations: 1 } })
    await t.purchase()
    const [license] = await t.repository.listUserLicenses(buyer.id)
    const first = await t.as(buyerWorkspaceAdmin).installations.install(license!.id, 'user', buyer.id)
    await expect(t.as(buyerWorkspaceAdmin).installations.install(license!.id, 'workspace', 'ws-1')).rejects.toMatchObject({ code: 'INSTALL_LIMIT_EXCEEDED', status: 400 })
    await t.as(buyer).installations.uninstall(first.id)
    expect(t.published).toContainEqual({ event: 'plugin.removed', pluginId: 'prod-1', licenseId: license!.id })
    await expect(t.as(buyerWorkspaceAdmin).installations.install(license!.id, 'workspace', 'ws-1')).resolves.toMatchObject({ targetType: 'workspace', active: true })
  })
  it('download limit and audit trail', async () => {
    const t = await setup({ offer: { maxDownloads: 2 } })
    await t.purchase()
    const [license] = await t.repository.listUserLicenses(buyer.id)
    await t.as(buyer).downloads.recordDownload(license!.id, 'file-1')
    await t.as(buyer).downloads.recordDownload(license!.id, 'file-1')
    expect(await t.as(buyer).downloads.authorizeDownload(buyer.id, 'prod-1')).toBe(false)
    await expect(t.as(buyer).downloads.recordDownload(license!.id, 'file-1')).rejects.toMatchObject({ code: 'DOWNLOAD_LIMIT_EXCEEDED' })
    expect(t.repository.downloads).toHaveLength(2)
  })
  it("other users can't see or use someone's license; signed-out callers get AUTH_REQUIRED", async () => {
    const t = await setup()
    await t.purchase()
    const [license] = await t.repository.listUserLicenses(buyer.id)
    await expect(t.as(otherUser).licensing.getLicense(license!.id)).rejects.toMatchObject({ code: 'LICENSE_ACCESS_DENIED', status: 403 })
    await expect(t.as(null).licensing.getLicense(license!.id)).rejects.toMatchObject({ code: 'AUTH_REQUIRED', status: 401 })
    await expect(t.as(buyer).licensing.getLicense('missing')).rejects.toMatchObject({ code: 'LICENSE_NOT_FOUND', status: 404 })
    await expect(t.as(buyer).licensing.revokeLicense(license!.id, 'x')).rejects.toMatchObject({ code: 'LICENSE_ACCESS_DENIED' })
  })
  it('works the same for every identity provider (identity is consumed, not provided)', async () => {
    const t = await setup()
    for (const [i, identityProvider] of ['meeovi', 'sso', 'federated', 'future-adapter'].entries()) {
      const user = { id: `u-${i}`, roles: ['user'], identityProvider }
      await t.purchase(`p-${i}`, user.id)
      expect(await t.as(user).licensing.listUserLicenses(user.id)).toHaveLength(1)
    }
  })
  it('catalog: unknown license types and products are refused', async () => {
    const t = await setup()
    const base = { id: 'offer-2', productId: 'prod-2', licenseTypeId: 'type-commercial', licenseVersionId: 'v-1.0', title: 'x', price: 9, active: true, subscriptionBased: false, createdAt: new Date() }
    await expect(t.as(admin).catalog.createProductLicense({ ...base, licenseTypeId: 'nope' })).rejects.toMatchObject({ code: 'INVALID_LICENSE_TYPE', status: 400 })
    await expect(t.as(admin).catalog.createProductLicense({ ...base, productId: 'missing' })).rejects.toMatchObject({ code: 'PRODUCT_NOT_FOUND', status: 404 })
    await expect(t.as(buyer).catalog.createProductLicense(base)).rejects.toMatchObject({ code: 'LICENSE_ACCESS_DENIED' })
  })
})
