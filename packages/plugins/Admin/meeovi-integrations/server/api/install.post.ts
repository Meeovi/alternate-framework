import { createError, defineEventHandler, getRouterParam } from 'h3'
import { addInstall, catalogRows, installable, installsFor, integrationId, requireUser } from '../utils/installs'

/** POST {apiBase}/:id/install — install a catalog entry for the signed-in
 *  user. Only published, free entries linked to a plugin; idempotent. */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = integrationId(getRouterParam(event, 'id'))

  const row = (await catalogRows(event, true)).find((r) => r.id === id)
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Integration not found' })
  if (!installable(row)) {
    throw createError({ statusCode: 409, statusMessage: `${row.name || 'This integration'} can't be installed yet` })
  }

  const existing = (await installsFor(event, user.id)).some((i) => Number(i.integration) === id)
  if (!existing) await addInstall(event, user.id, row)
  return { installed: true, plugin: row.plugin }
})
