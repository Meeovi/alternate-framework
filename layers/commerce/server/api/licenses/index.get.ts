import { defineEventHandler } from 'h3'
import { licensingFor, licensingResponse, requireLicensingUser } from '../../licensing-host'

/** GET /api/licenses — the signed-in user's licenses (licensing contract v1.0). */
export default defineEventHandler((event) => licensingResponse(event, 200, async () => {
  const { user, licensing } = await licensingFor(event)
  return licensing.listUserLicenses(requireLicensingUser(user).id)
}))
