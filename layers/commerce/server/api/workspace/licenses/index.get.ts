import { and, count, desc, eq, ilike, or, sql, type SQL } from 'drizzle-orm'
import { defineEventHandler, getQuery } from 'h3'
import { requireAdmin } from '#auth/server/utils/sessions'
import { db } from '#auth/server/utils/drizzle'
import { users } from '#auth/server/database/migrations/schema'
import { USER_LICENSE_STATUSES } from '../../../licensing'
import { licenseInstallations, productLicenses, userLicenses } from '../../../licensing-host/schema'

/**
 * GET /api/workspace/licenses?search=&status=&page= — every license, for
 * admins (newest first, 50 a page). `search` matches the owner's email or
 * username, the product, the license key or the purchase (e.g. a PayPal
 * payment id).
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const q = getQuery(event)
  const search = typeof q.search === 'string' ? q.search.trim().slice(0, 100) : ''
  const status = typeof q.status === 'string' && (USER_LICENSE_STATUSES as readonly string[]).includes(q.status) ? q.status : null
  const page = Math.max(1, Math.min(1000, Number.parseInt(String(q.page ?? '1'), 10) || 1))
  const pageSize = 50

  const where: SQL[] = []
  if (status) where.push(eq(userLicenses.status, status))
  if (search) {
    const like = `%${search.replace(/[\\%_]/g, (c) => `\\${c}`)}%`
    where.push(or(
      ilike(users.email, like), ilike(users.username, like), ilike(userLicenses.productId, like),
      ilike(userLicenses.licenseKey, like), ilike(userLicenses.purchaseId, like),
    )!)
  }
  const condition = where.length ? and(...where) : undefined

  const activeInstalls = db.select({ licenseId: licenseInstallations.userLicenseId, n: count().as('n') })
    .from(licenseInstallations).where(eq(licenseInstallations.active, true))
    .groupBy(licenseInstallations.userLicenseId).as('active_installs')

  const [rows, [total]] = await Promise.all([
    db.select({
      id: userLicenses.id,
      licenseKey: userLicenses.licenseKey,
      status: userLicenses.status,
      productId: userLicenses.productId,
      offer: productLicenses.title,
      purchaseId: userLicenses.purchaseId,
      createdAt: userLicenses.createdAt,
      expiresAt: userLicenses.expiresAt,
      userId: userLicenses.userId,
      email: users.email,
      username: users.username,
      installations: sql<number>`coalesce(${activeInstalls.n}, 0)`.mapWith(Number),
    })
      .from(userLicenses)
      .leftJoin(users, sql`${users.id}::text = ${userLicenses.userId}`)
      .leftJoin(productLicenses, eq(productLicenses.id, userLicenses.productLicenseId))
      .leftJoin(activeInstalls, eq(activeInstalls.licenseId, userLicenses.id))
      .where(condition)
      .orderBy(desc(userLicenses.createdAt))
      .limit(pageSize).offset((page - 1) * pageSize),
    db.select({ n: count() }).from(userLicenses)
      .leftJoin(users, sql`${users.id}::text = ${userLicenses.userId}`)
      .where(condition),
  ])

  return { licenses: rows, total: Number(total?.n ?? 0), page, pageSize }
})
