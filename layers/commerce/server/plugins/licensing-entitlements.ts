import { createError } from 'h3'
import { grantsAccess, LicensingError, type AuthenticatedUser } from '../licensing'
import { repository, useLicensing } from '../licensing-host'

/**
 * Paid integrations run on licenses: registers licensing as
 * meeovi-integrations' entitlement source
 * (`Symbol.for('mframework.integrations.entitlements')`). A user may use a
 * paid integration while they hold an active license for its product, and
 * switching it on/off records a licensing installation on their account.
 */
export default defineNitroPlugin(() => {
  const owner = (userId: string): AuthenticatedUser => ({ id: userId, roles: ['user'], workspaceIds: [userId] })
  const activeLicense = async (userId: string, ref: string) =>
    (await repository().listUserLicensesForProduct(userId, ref)).find((l) => grantsAccess(l))
  const asHttpError = (error: unknown) => (error instanceof LicensingError
    ? createError({ statusCode: error.status, statusMessage: error.message, data: error.toResponse() })
    : error)

  ;(globalThis as Record<symbol, unknown>)[Symbol.for('mframework.integrations.entitlements')] = {
    async entitledRefs(userId: string, refs: string[]): Promise<string[]> {
      const results = await Promise.all(refs.map(async (ref) => ((await activeLicense(userId, ref)) ? ref : null)))
      return results.filter((ref): ref is string => !!ref)
    },

    async installed(userId: string, ref: string): Promise<void> {
      // No license: the seller using their own plugin — nothing to record.
      const license = await activeLicense(userId, ref)
      if (!license) return
      const { installations } = useLicensing().forRequest({ user: owner(userId), idempotencyKey: `integration-install:${globalThis.crypto.randomUUID()}` })
      try {
        await installations.install(license.id, 'user', userId)
      } catch (error) {
        if (error instanceof LicensingError && error.code === 'LICENSE_ALREADY_INSTALLED') return
        throw asHttpError(error)
      }
    },

    async uninstalled(userId: string, ref: string): Promise<void> {
      const repo = repository()
      for (const license of await repo.listUserLicensesForProduct(userId, ref)) {
        for (const installation of await repo.listInstallations(license.id)) {
          if (!installation.active || installation.targetType !== 'user' || installation.targetId !== userId) continue
          const { installations } = useLicensing().forRequest({ user: owner(userId), idempotencyKey: `integration-uninstall:${installation.id}` })
          await installations.uninstall(installation.id).catch((error) => { throw asHttpError(error) })
        }
      }
    },
  }
})
