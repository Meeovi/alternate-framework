import { eq, sql } from 'drizzle-orm'
import { createError, defineEventHandler, getRouterParam } from 'h3'
import { requireAdmin } from '#auth/server/utils/sessions'
import { db } from '#auth/server/utils/drizzle'
import { users } from '#auth/server/database/migrations/schema'
import { repository } from '../../../licensing-host'

/**
 * GET /api/workspace/licenses/:id — one license for admins: its owner,
 * offer, terms version, installations (active and past) and how many
 * downloads it has used.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = String(getRouterParam(event, 'id') ?? '')
  if (!/^[\w-]{1,100}$/.test(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid license id' })
  const repo = repository()
  const license = await repo.getUserLicense(id)
  if (!license) throw createError({ statusCode: 404, statusMessage: 'No such license' })
  const [offer, version, installations, downloads, [owner]] = await Promise.all([
    repo.getProductLicense(license.productLicenseId),
    repo.getLicenseTypeVersion(license.versionId),
    repo.listInstallations(license.id),
    repo.countDownloads(license.id),
    db.select({ id: users.id, email: users.email, username: users.username, name: users.name })
      .from(users).where(eq(sql`${users.id}::text`, license.userId)).limit(1),
  ])
  return {
    license,
    owner: owner ?? null,
    offer,
    terms: version ? { id: version.id, title: version.title, version: version.version } : null,
    installations,
    downloads,
  }
})
