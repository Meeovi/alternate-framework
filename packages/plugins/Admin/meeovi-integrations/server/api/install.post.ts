import { createError, defineEventHandler, getRouterParam } from 'h3'
import { catalogItem, install, pluginOrThrow, requireUser } from '../utils/installs'

/** POST {apiBase}/:slug/install — switch a plugin on for the signed-in user.
 *  Admin plugins: admins only (404 otherwise). Paid plugins: only after the
 *  user bought the product (402). Idempotent; reinstalling brings back the
 *  user's earlier data. */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const plugin = pluginOrThrow(event, user, getRouterParam(event, 'slug'))
  const item = await catalogItem(event, user, plugin.slug)
  if (item?.state === 'paid') {
    throw createError({ statusCode: 402, statusMessage: `Buy ${item.name} in the store to install it` })
  }
  if (!item || (item.state !== 'available' && item.state !== 'installed')) {
    throw createError({ statusCode: 409, statusMessage: `${plugin.name} can't be installed yet` })
  }
  await install(event, user, plugin)
  return { installed: true, plugin: plugin.plugin }
})
