import type { LicensingEvent } from '../../events'
import type { AuthenticatedUser, IdempotencyProvider, LicenseRepository, LicensingModuleDependencies } from '../../interfaces'
import type { LicenseType, LicenseTypeVersion, ProductLicense } from '../../models'
import { createLicensingModule } from '../../service'
import { MemoryIdempotency, MemoryRepository } from './memory'

export const buyer: AuthenticatedUser = { id: 'user-1', roles: ['user'], identityProvider: 'meeovi' }
export const otherUser: AuthenticatedUser = { id: 'user-2', roles: ['user'], identityProvider: 'sso' }
export const admin: AuthenticatedUser = { id: 'admin-1', roles: ['admin'], identityProvider: 'meeovi' }
/** The buyer, as administrator of workspace ws-1. */
export const buyerWorkspaceAdmin: AuthenticatedUser = { ...buyer, workspaceIds: ['ws-1'] }

export const commercialType: LicenseType = {
  id: 'type-commercial', slug: 'commercial', name: 'Commercial License', description: 'Use in commercial work',
  scope: 'commercial',
  permissions: { personalUse: true, commercialUse: true, clientProjects: true, modification: true, redistribution: false, resale: false, attributionRequired: false },
  active: true, createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-01-01'),
}

export const v1_0: LicenseTypeVersion = {
  id: 'v-1.0', licenseTypeId: 'type-commercial', version: '1.0', title: 'Commercial 1.0', terms: 'Terms 1.0',
  effectiveDate: new Date('2026-01-01'), active: true, createdAt: new Date('2026-01-01'),
}

export function offer(over: Partial<ProductLicense> = {}): ProductLicense {
  return {
    id: 'offer-1', productId: 'prod-1', licenseTypeId: 'type-commercial', licenseVersionId: 'v-1.0', title: 'Commercial',
    price: 29, active: true, subscriptionBased: false, createdAt: new Date('2026-01-01'), ...over,
  }
}

/**
 * Storage for the flow tests: in memory, or the real Postgres repository
 * and idempotency store when LICENSING_TEST_DATABASE_URL points at a
 * throwaway database with the licensing migration applied: every
 * licensing table is emptied before each test. Never point it at a real one.
 */
async function storage(): Promise<{ repository: LicenseRepository, idempotency: IdempotencyProvider }> {
  const url = process.env.LICENSING_TEST_DATABASE_URL
  if (!url) return { repository: new MemoryRepository(), idempotency: new MemoryIdempotency() }
  const { testDb, truncate } = await import('./postgres-db')
  const db = testDb(url)
  await truncate(db)
  const { PostgresIdempotency, PostgresLicenseRepository } = await import('../../../licensing-host/postgres')
  return { repository: new PostgresLicenseRepository(db), idempotency: new PostgresIdempotency(db) }
}

export async function setup(options: { offer?: Partial<ProductLicense> } = {}) {
  const { repository, idempotency } = await storage()
  const published: LicensingEvent[] = []
  let clock = new Date('2026-06-01T00:00:00Z')
  let seq = 0
  const deps: LicensingModuleDependencies = {
    products: { getProduct: async (id) => (id.startsWith('prod-') ? { id } : null) },
    purchases: { getPurchase: async () => null },
    subscriptions: { getSubscription: async () => null },
    authenticatedUser: { getAuthenticatedUser: async () => null },
    workspaces: {
      userCanManageWorkspace: async (u, ws) => !!u.workspaceIds?.includes(ws),
      userCanManageOrganisation: async (u, org) => !!u.organisationIds?.includes(org),
    },
    outlets: { userCanAccessOutlet: async () => true },
    integrations: { isIntegrationAvailable: async () => true },
    repository,
    idempotency,
    events: { publish: async (e) => { published.push(e) } },
    now: () => clock,
    generateId: () => `id-${++seq}`,
    generateLicenseKey: () => `KEY-${++seq}`,
  }
  await repository.saveLicenseType(commercialType)
  await repository.insertLicenseTypeVersion(v1_0)
  await repository.saveProductLicense(offer(options.offer))
  const module = createLicensingModule(deps)
  let keys = 0
  /** Services for one request; each call gets a fresh Idempotency-Key unless one is given. */
  const as = (user: AuthenticatedUser | null, idempotencyKey: string | undefined = `k-${++keys}`) => module.forRequest({ user, idempotencyKey })
  const purchase = (purchaseId = 'purchase-1', userId = buyer.id) =>
    module.commerceEvents.handle({ event: 'purchase.completed', purchaseId, userId, productId: 'prod-1', licenseId: 'offer-1' })
  const advance = (days: number) => { clock = new Date(clock.getTime() + days * 86_400_000) }
  return { module, repository, published, as, purchase, advance, now: () => clock }
}
