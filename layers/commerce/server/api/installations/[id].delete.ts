import { defineEventHandler } from 'h3'
import { licensingFor, licensingResponse, routeId } from '../../licensing-host'

/** DELETE /api/installations/{id} — deactivates the installation (kept for audit); needs the Idempotency-Key header. */
export default defineEventHandler((event) => licensingResponse(event, 204, async () => {
  const { installations } = await licensingFor(event)
  await installations.uninstall(routeId(event))
}))
