import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import type { IntegrationDataResponse } from '../../runtime/types'
import { getIntegrationData, integrationsUser, pluginOrThrow, setIntegrationData } from '../utils/installs'

/**
 * {apiBase}/:slug/data — the signed-in user's own data for an installed
 * plugin. GET reads it, PUT replaces it, PATCH shallow-merges into it.
 * 401 signed out, 403 not installed, 404 unknown (or admin-only) plugin.
 */
export default defineEventHandler(async (event): Promise<IntegrationDataResponse> => {
  const plugin = pluginOrThrow(event, await integrationsUser(event), getRouterParam(event, 'slug'))
  const method = (event.method || 'GET').toUpperCase()

  if (method === 'GET') return { plugin: plugin.plugin, data: await getIntegrationData(event, plugin.plugin) }

  if (method === 'PUT' || method === 'PATCH') {
    const body = await readBody(event).catch(() => null)
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw createError({ statusCode: 400, statusMessage: 'Send a JSON object' })
    }
    const data = await setIntegrationData(event, plugin.plugin, body as Record<string, unknown>, { merge: method === 'PATCH' })
    return { plugin: plugin.plugin, data }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
