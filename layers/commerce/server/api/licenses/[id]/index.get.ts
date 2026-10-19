import { defineEventHandler } from 'h3'
import { licensingFor, licensingResponse, routeId } from '../../../licensing-host'

/** GET /api/licenses/{id} — one license (its owner, or a platform admin). */
export default defineEventHandler((event) => licensingResponse(event, 200, async () => {
  const { licensing } = await licensingFor(event)
  return licensing.getLicense(routeId(event))
}))
