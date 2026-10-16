import { createError, defineEventHandler, getRouterParam } from 'h3'
import type { IntegrationDetailResponse } from '../../runtime/types'
import { catalogItem, integrationsUser } from '../utils/installs'

/** GET {apiBase}/:slug — one integration (404 for admin plugins unless the
 *  user is an admin). */
export default defineEventHandler(async (event): Promise<IntegrationDetailResponse> => {
  const user = await integrationsUser(event)
  const slug = String(getRouterParam(event, 'slug') || '')
  const item = /^[a-z0-9][a-z0-9._-]{0,99}$/i.test(slug) ? await catalogItem(event, user, slug) : null
  if (!item) throw createError({ statusCode: 404, statusMessage: 'Integration not found' })
  return { signedIn: Boolean(user), item }
})
