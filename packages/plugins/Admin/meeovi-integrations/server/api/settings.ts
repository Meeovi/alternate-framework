import { createError, defineEventHandler, getMethod, getRouterParam, readBody } from 'h3'
import type { IntegrationSettingsResponse } from '../../runtime/types'
import { pluginOrThrow, requireUser, saveSiteSettings, siteSettings } from '../utils/installs'

/** GET | PUT {apiBase}/:slug/settings — a site plugin's settings, for
 *  admins (404 for everyone else, and for per-user plugins). PUT merges the
 *  submitted keys; each is validated against the plugin's declaration. */
export default defineEventHandler(async (event): Promise<IntegrationSettingsResponse> => {
  const user = await requireUser(event)
  const plugin = pluginOrThrow(event, user, getRouterParam(event, 'slug'))
  const method = getMethod(event)
  if (method === 'GET') return siteSettings(user, plugin)
  if (method === 'PUT') return saveSiteSettings(user, plugin, await readBody(event))
  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
