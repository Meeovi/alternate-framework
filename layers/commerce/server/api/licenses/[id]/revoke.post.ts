import { defineEventHandler, readBody } from 'h3'
import { bodyString, licensingFor, licensingResponse, routeId } from '../../../licensing-host'

/** POST /api/licenses/{id}/revoke `{ reason }` — platform admins; needs the Idempotency-Key header. */
export default defineEventHandler((event) => licensingResponse(event, 200, async () => {
  const { licensing } = await licensingFor(event)
  const body = await readBody(event).catch(() => null)
  return licensing.revokeLicense(routeId(event), bodyString(body, 'reason'))
}))
