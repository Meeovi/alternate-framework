import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'

let cached: ReturnType<typeof drizzle> | null = null

/** A drizzle connection to the test database (one per test run). */
export function testDb(url: string) {
  cached ??= drizzle({ connection: { url, max: 4, ssl: /@(localhost|127\.0\.0\.1)/.test(url) ? undefined : 'require' } })
  return cached
}

/** Empties every licensing table. Test databases only. */
export async function truncate(db: ReturnType<typeof drizzle>) {
  // TRUNCATE skips the append-only/immutable row triggers.
  await db.execute(sql`TRUNCATE licensing.license_downloads, licensing.license_installations, licensing.user_licenses, licensing.product_licenses, licensing.license_type_versions, licensing.license_types, licensing.idempotency_keys`)
}
