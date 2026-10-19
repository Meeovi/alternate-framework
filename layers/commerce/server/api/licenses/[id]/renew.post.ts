import { defineEventHandler } from 'h3'
import { licensingFor, licensingResponse, routeId } from '../../../licensing-host'

/** POST /api/licenses/{id}/renew — needs the Idempotency-Key header. */
export default defineEventHandler((event) => licensingResponse(event, 200, async () => {
  const { licensing } = await licensingFor(event)
  return licensing.renewLicense(routeId(event))
}))
