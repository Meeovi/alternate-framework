import { defineEventHandler } from 'h3'
import { licensingFor, licensingResponse, routeId } from '../../../licensing-host'

/** POST /api/licenses/{id}/activate — needs the Idempotency-Key header. */
export default defineEventHandler((event) => licensingResponse(event, 200, async () => {
  const { licensing } = await licensingFor(event)
  return licensing.activateLicense(routeId(event))
}))
