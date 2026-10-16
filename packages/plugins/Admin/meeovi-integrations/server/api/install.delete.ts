import { defineEventHandler, getRouterParam } from 'h3'
import { pluginOrThrow, requireUser, uninstall } from '../utils/installs'

/** DELETE {apiBase}/:slug/install — switch a plugin off for the signed-in
 *  user only. Their data is kept for a later reinstall. */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const plugin = pluginOrThrow(event, user, getRouterParam(event, 'slug'))
  await uninstall(event, user, plugin)
  return { installed: false, plugin: plugin.plugin }
})
