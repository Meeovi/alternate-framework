import { defineEventHandler } from 'h3'
import type { IntegrationCatalogResponse } from '../../runtime/types'
import { catalogFor, integrationsUser } from '../utils/installs'

/** GET {apiBase} — every integration this user may see (admin plugins for
 *  admins only), each with its state for them. */
export default defineEventHandler(async (event): Promise<IntegrationCatalogResponse> => {
  const user = await integrationsUser(event)
  return {
    signedIn: Boolean(user),
    admin: Boolean(user?.admin),
    items: await catalogFor(event, user),
  }
})
