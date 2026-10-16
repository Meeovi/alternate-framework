import { defineEventHandler } from 'h3'
import type { InstalledIntegrationsResponse } from '../../runtime/types'
import { installedPlugins, integrationsUser } from '../utils/installs'

/** GET {apiBase}/installed — plugins switched on for the signed-in user
 *  (empty when signed out). */
export default defineEventHandler(async (event): Promise<InstalledIntegrationsResponse> => {
  const user = await integrationsUser(event)
  if (!user) return { plugins: [] }
  return { plugins: await installedPlugins(event, user) }
})
