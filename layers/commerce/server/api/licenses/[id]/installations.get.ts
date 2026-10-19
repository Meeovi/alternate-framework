import { defineEventHandler } from 'h3'
import { licensingFor, licensingResponse, routeId } from '../../../licensing-host'

/** GET /api/licenses/{id}/installations */
export default defineEventHandler((event) => licensingResponse(event, 200, async () => {
  const { installations } = await licensingFor(event)
  return installations.listInstallations(routeId(event))
}))
