/**
 * Postgres implementations of the licensing storage and idempotency ports
 * (layers/commerce/server/licensing/interfaces.ts), on the `licensing`
 * schema (schema.ts). The database enforces the uniqueness rules; the
 * service settles races by re-reading after a unique violation.
 */
import { and, asc, count, eq, lt } from 'drizzle-orm'
import type { PgAsyncDatabase } from 'drizzle-orm/pg-core'
import type { IdempotencyProvider, LicenseRepository } from '../licensing/interfaces'
import { LicensingError } from '../licensing/errors'
import type {
  LicenseDownload, LicenseInstallation, LicenseType, LicenseTypeVersion, ProductLicense, UserLicense,
} from '../licensing/models'
import {
  idempotencyKeys, licenseDownloads, licenseInstallations, licenseTypes, licenseTypeVersions, productLicenses, userLicenses,
} from './schema'

// Any async drizzle Postgres database (postgres-js in the app).
type Db = PgAsyncDatabase<any, any>

const opt = <T>(v: T | null): T | undefined => (v === null ? undefined : v)

const toLicenseType = (r: typeof licenseTypes.$inferSelect): LicenseType => ({
  id: r.id, slug: r.slug, name: r.name, description: r.description, scope: r.scope as LicenseType['scope'],
  permissions: r.permissions as LicenseType['permissions'], active: r.active, createdAt: r.createdAt, updatedAt: r.updatedAt,
})
const toVersion = (r: typeof licenseTypeVersions.$inferSelect): LicenseTypeVersion => ({
  id: r.id, licenseTypeId: r.licenseTypeId, version: r.version, title: r.title, terms: r.terms,
  effectiveDate: r.effectiveDate, active: r.active, createdAt: r.createdAt,
})
const toOffer = (r: typeof productLicenses.$inferSelect): ProductLicense => ({
  id: r.id, productId: r.productId, licenseTypeId: r.licenseTypeId, licenseVersionId: r.licenseVersionId, title: r.title,
  price: Number(r.price), active: r.active, subscriptionBased: r.subscriptionBased, maxDownloads: opt(r.maxDownloads),
  maxInstallations: opt(r.maxInstallations), expiresAfterDays: opt(r.expiresAfterDays),
  metadata: opt(r.metadata as Record<string, unknown> | null), createdAt: r.createdAt,
})
const toLicense = (r: typeof userLicenses.$inferSelect): UserLicense => ({
  id: r.id, licenseKey: r.licenseKey, userId: r.userId, productId: r.productId, productLicenseId: r.productLicenseId,
  purchaseId: r.purchaseId, versionId: r.versionId, status: r.status as UserLicense['status'],
  activatedAt: opt(r.activatedAt), expiresAt: opt(r.expiresAt), metadata: opt(r.metadata as Record<string, unknown> | null), createdAt: r.createdAt,
})
const toInstallation = (r: typeof licenseInstallations.$inferSelect): LicenseInstallation => ({
  id: r.id, userLicenseId: r.userLicenseId, targetType: r.targetType as LicenseInstallation['targetType'],
  targetId: r.targetId, installedAt: r.installedAt, active: r.active,
})
const toDownload = (r: typeof licenseDownloads.$inferSelect): LicenseDownload => ({
  id: r.id, userLicenseId: r.userLicenseId, fileId: r.fileId, downloadedAt: r.downloadedAt,
  metadata: opt(r.metadata as Record<string, unknown> | null),
})

export class PostgresLicenseRepository implements LicenseRepository {
  constructor(private readonly db: Db) {}

  async saveLicenseType(t: LicenseType) {
    const values = { ...t, permissions: t.permissions }
    const [row] = await this.db.insert(licenseTypes).values(values)
      .onConflictDoUpdate({ target: licenseTypes.id, set: { slug: t.slug, name: t.name, description: t.description, scope: t.scope, permissions: t.permissions, active: t.active, updatedAt: t.updatedAt } })
      .returning()
    return toLicenseType(row!)
  }

  async getLicenseType(id: string) {
    const [row] = await this.db.select().from(licenseTypes).where(eq(licenseTypes.id, id)).limit(1)
    return row ? toLicenseType(row) : null
  }

  async insertLicenseTypeVersion(v: LicenseTypeVersion) {
    const [row] = await this.db.insert(licenseTypeVersions).values({ ...v }).onConflictDoNothing().returning()
    if (!row) throw new LicensingError('VALIDATION_ERROR', 'License terms versions are immutable', { id: v.id })
    return toVersion(row)
  }

  async getLicenseTypeVersion(id: string) {
    const [row] = await this.db.select().from(licenseTypeVersions).where(eq(licenseTypeVersions.id, id)).limit(1)
    return row ? toVersion(row) : null
  }

  async listLicenseTypeVersions(licenseTypeId: string) {
    return (await this.db.select().from(licenseTypeVersions).where(eq(licenseTypeVersions.licenseTypeId, licenseTypeId)).orderBy(asc(licenseTypeVersions.createdAt))).map(toVersion)
  }

  async saveProductLicense(o: ProductLicense) {
    const values = {
      id: o.id, productId: o.productId, licenseTypeId: o.licenseTypeId, licenseVersionId: o.licenseVersionId, title: o.title,
      price: o.price.toFixed(2), active: o.active, subscriptionBased: o.subscriptionBased, maxDownloads: o.maxDownloads ?? null,
      maxInstallations: o.maxInstallations ?? null, expiresAfterDays: o.expiresAfterDays ?? null, metadata: o.metadata ?? null, createdAt: o.createdAt,
    }
    const { id: _id, createdAt: _created, ...set } = values
    const [row] = await this.db.insert(productLicenses).values(values).onConflictDoUpdate({ target: productLicenses.id, set }).returning()
    return toOffer(row!)
  }

  async getProductLicense(id: string) {
    const [row] = await this.db.select().from(productLicenses).where(eq(productLicenses.id, id)).limit(1)
    return row ? toOffer(row) : null
  }

  async getUserLicense(id: string) {
    const [row] = await this.db.select().from(userLicenses).where(eq(userLicenses.id, id)).limit(1)
    return row ? toLicense(row) : null
  }

  async findUserLicenseByPurchase(purchaseId: string, productLicenseId?: string) {
    const where = productLicenseId
      ? and(eq(userLicenses.purchaseId, purchaseId), eq(userLicenses.productLicenseId, productLicenseId))
      : eq(userLicenses.purchaseId, purchaseId)
    return (await this.db.select().from(userLicenses).where(where).orderBy(asc(userLicenses.createdAt))).map(toLicense)
  }

  async listUserLicenses(userId: string) {
    return (await this.db.select().from(userLicenses).where(eq(userLicenses.userId, userId)).orderBy(asc(userLicenses.createdAt))).map(toLicense)
  }

  async listUserLicensesForProduct(userId: string, productId: string) {
    return (await this.db.select().from(userLicenses)
      .where(and(eq(userLicenses.userId, userId), eq(userLicenses.productId, productId)))
      .orderBy(asc(userLicenses.createdAt))).map(toLicense)
  }

  async saveUserLicense(l: UserLicense) {
    const values = {
      id: l.id, licenseKey: l.licenseKey, userId: l.userId, productId: l.productId, productLicenseId: l.productLicenseId,
      purchaseId: l.purchaseId, versionId: l.versionId, status: l.status, activatedAt: l.activatedAt ?? null,
      expiresAt: l.expiresAt ?? null, metadata: l.metadata ?? null, createdAt: l.createdAt,
    }
    // Rights (who, what, which purchase and terms) never change after issue.
    const [row] = await this.db.insert(userLicenses).values(values).onConflictDoUpdate({
      target: userLicenses.id,
      set: { status: values.status, activatedAt: values.activatedAt, expiresAt: values.expiresAt, metadata: values.metadata },
    }).returning()
    return toLicense(row!)
  }

  async getInstallation(id: string) {
    const [row] = await this.db.select().from(licenseInstallations).where(eq(licenseInstallations.id, id)).limit(1)
    return row ? toInstallation(row) : null
  }

  async listInstallations(licenseId: string) {
    return (await this.db.select().from(licenseInstallations).where(eq(licenseInstallations.userLicenseId, licenseId)).orderBy(asc(licenseInstallations.installedAt))).map(toInstallation)
  }

  async saveInstallation(i: LicenseInstallation) {
    const [row] = await this.db.insert(licenseInstallations).values({ ...i }).onConflictDoUpdate({
      target: licenseInstallations.id, set: { active: i.active },
    }).returning()
    return toInstallation(row!)
  }

  async insertDownload(d: LicenseDownload) {
    const [row] = await this.db.insert(licenseDownloads).values({ ...d, metadata: d.metadata ?? null }).returning()
    return toDownload(row!)
  }

  async countDownloads(licenseId: string) {
    const [row] = await this.db.select({ n: count() }).from(licenseDownloads).where(eq(licenseDownloads.userLicenseId, licenseId))
    return Number(row?.n ?? 0)
  }
}

// ---------------------------------------------------------------------------
// Idempotency

/** JSON with Dates kept as Dates, and `undefined` results. */
const encode = (value: unknown) => ({ v: JSON.parse(JSON.stringify(value ?? null)), dates: datePaths(value) })
function datePaths(value: unknown, path: string[] = [], out: string[][] = []): string[][] {
  if (value instanceof Date) out.push(path)
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) datePaths(v, [...path, k], out)
  return out
}
function decode(stored: { v: unknown, dates?: string[][] } | null): unknown {
  if (!stored) return undefined
  const value = structuredClone(stored.v)
  for (const path of stored.dates ?? []) {
    if (!path.length) return new Date(value as string)
    let node = value as Record<string, unknown>
    for (const key of path.slice(0, -1)) node = node[key] as Record<string, unknown>
    const last = path.at(-1)!
    node[last] = new Date(node[last] as string)
  }
  return stored.v === null ? undefined : value
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export class PostgresIdempotency implements IdempotencyProvider {
  constructor(
    private readonly db: Db,
    private readonly options: { waitMs?: number, staleMs?: number } = {},
  ) {}

  async execute<T>(key: string, fingerprint: string, operation: () => Promise<T>): Promise<T> {
    const waitMs = this.options.waitMs ?? 10_000
    const staleMs = this.options.staleMs ?? 120_000
    const deadline = Date.now() + waitMs
    for (;;) {
      const [claimed] = await this.db.insert(idempotencyKeys).values({ key, fingerprint, state: 'pending' }).onConflictDoNothing().returning({ key: idempotencyKeys.key })
      if (claimed) {
        try {
          const result = await operation()
          await this.db.update(idempotencyKeys).set({ state: 'done', result: encode(result) }).where(eq(idempotencyKeys.key, key))
          return result
        } catch (error) {
          // Failed requests aren't remembered: a retry runs again.
          await this.db.delete(idempotencyKeys).where(eq(idempotencyKeys.key, key))
          throw error
        }
      }
      const [row] = await this.db.select().from(idempotencyKeys).where(eq(idempotencyKeys.key, key)).limit(1)
      if (!row) continue // the first request failed and released the key
      if (row.fingerprint !== fingerprint) {
        throw new LicensingError('DUPLICATE_IDEMPOTENCY_KEY', 'This Idempotency-Key was used for a different request', { key })
      }
      if (row.state === 'done') return decode(row.result as { v: unknown, dates?: string[][] }) as T
      // Still running elsewhere. A request that died mid-way is taken over.
      if (Date.now() - row.createdAt.getTime() > staleMs) {
        await this.db.delete(idempotencyKeys).where(and(eq(idempotencyKeys.key, key), eq(idempotencyKeys.state, 'pending'), lt(idempotencyKeys.createdAt, new Date(Date.now() - staleMs))))
        continue
      }
      if (Date.now() > deadline) {
        throw new LicensingError('DUPLICATE_IDEMPOTENCY_KEY', 'A request with this Idempotency-Key is still being processed', { key, inProgress: true })
      }
      await sleep(200)
    }
  }
}
