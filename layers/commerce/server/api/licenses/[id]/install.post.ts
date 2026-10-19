import { defineEventHandler, readBody } from 'h3'
import { INSTALLATION_TARGET_TYPES, LicensingError, type LicenseInstallationTargetType } from '../../../licensing'
import { bodyString, licensingFor, licensingResponse, routeId } from '../../../licensing-host'

/** POST /api/licenses/{id}/install `{ targetType, targetId }` — needs the Idempotency-Key header. */
export default defineEventHandler((event) => licensingResponse(event, 201, async () => {
  const { installations } = await licensingFor(event)
  const body = await readBody(event).catch(() => null)
  const targetType = bodyString(body, 'targetType') as LicenseInstallationTargetType
  if (!INSTALLATION_TARGET_TYPES.includes(targetType)) {
    throw new LicensingError('VALIDATION_ERROR', `targetType must be one of ${INSTALLATION_TARGET_TYPES.join(', ')}`, { field: 'targetType' })
  }
  return installations.install(routeId(event), targetType, bodyString(body, 'targetId'))
}))
