import { defineEventHandler, getRouterParam } from 'h3'
import { installsFor, integrationId, removeInstalls, requireUser } from '../utils/installs'

/** DELETE {apiBase}/:id/install — uninstall for the signed-in user only. */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = integrationId(getRouterParam(event, 'id'))
  const mine = (await installsFor(event, user.id)).filter((i) => Number(i.integration) === id)
  await removeInstalls(event, mine.map((i) => i.id))
  return { installed: false }
})
