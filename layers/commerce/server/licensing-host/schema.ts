/**
 * Drizzle definitions of the `licensing` schema. The schema itself is
 * created by the hand-written migration
 * layers/auth/server/database/migrations/20261019120000_licensing_schema
 * (drizzle-kit generate is broken here); keep the two in step.
 */
import { boolean, index, integer, jsonb, numeric, pgSchema, text, timestamp, uniqueIndex, unique } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const licensing = pgSchema('licensing')

const ts = (name: string) => timestamp(name, { withTimezone: true, mode: 'date' })

export const licenseTypes = licensing.table('license_types', {
  id: text().primaryKey(),
  slug: text().notNull().unique(),
  name: text().notNull(),
  description: text().notNull().default(''),
  scope: text().notNull(),
  permissions: jsonb().notNull(),
  active: boolean().notNull().default(true),
  createdAt: ts('created_at').notNull().defaultNow(),
  updatedAt: ts('updated_at').notNull().defaultNow(),
})

export const licenseTypeVersions = licensing.table('license_type_versions', {
  id: text().primaryKey(),
  licenseTypeId: text('license_type_id').notNull(),
  version: text().notNull(),
  title: text().notNull(),
  terms: text().notNull(),
  effectiveDate: ts('effective_date').notNull(),
  active: boolean().notNull().default(true),
  createdAt: ts('created_at').notNull().defaultNow(),
}, (t) => [unique().on(t.licenseTypeId, t.version)])

export const productLicenses = licensing.table('product_licenses', {
  id: text().primaryKey(),
  productId: text('product_id').notNull(),
  licenseTypeId: text('license_type_id').notNull(),
  licenseVersionId: text('license_version_id').notNull(),
  title: text().notNull(),
  price: numeric({ precision: 12, scale: 2 }).notNull(),
  active: boolean().notNull().default(true),
  subscriptionBased: boolean('subscription_based').notNull().default(false),
  maxDownloads: integer('max_downloads'),
  maxInstallations: integer('max_installations'),
  expiresAfterDays: integer('expires_after_days'),
  metadata: jsonb(),
  createdAt: ts('created_at').notNull().defaultNow(),
}, (t) => [index('product_licenses_product_idx').on(t.productId)])

export const userLicenses = licensing.table('user_licenses', {
  id: text().primaryKey(),
  licenseKey: text('license_key').notNull().unique(),
  userId: text('user_id').notNull(),
  productId: text('product_id').notNull(),
  productLicenseId: text('product_license_id').notNull(),
  purchaseId: text('purchase_id').notNull(),
  versionId: text('version_id').notNull(),
  status: text().notNull(),
  activatedAt: ts('activated_at'),
  expiresAt: ts('expires_at'),
  metadata: jsonb(),
  createdAt: ts('created_at').notNull().defaultNow(),
}, (t) => [
  unique().on(t.purchaseId, t.productLicenseId),
  index('user_licenses_user_product_idx').on(t.userId, t.productId),
])

export const licenseInstallations = licensing.table('license_installations', {
  id: text().primaryKey(),
  userLicenseId: text('user_license_id').notNull(),
  targetType: text('target_type').notNull(),
  targetId: text('target_id').notNull(),
  installedAt: ts('installed_at').notNull().defaultNow(),
  active: boolean().notNull().default(true),
}, (t) => [
  uniqueIndex('license_installations_one_active_idx').on(t.userLicenseId, t.targetType, t.targetId).where(sql`active`),
  index('license_installations_license_idx').on(t.userLicenseId),
])

export const licenseDownloads = licensing.table('license_downloads', {
  id: text().primaryKey(),
  userLicenseId: text('user_license_id').notNull(),
  fileId: text('file_id').notNull(),
  downloadedAt: ts('downloaded_at').notNull().defaultNow(),
  metadata: jsonb(),
}, (t) => [index('license_downloads_license_idx').on(t.userLicenseId)])

export const idempotencyKeys = licensing.table('idempotency_keys', {
  key: text().primaryKey(),
  fingerprint: text().notNull(),
  state: text().notNull(),
  result: jsonb(),
  createdAt: ts('created_at').notNull().defaultNow(),
})
