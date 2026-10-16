import { integrationSlug, useIntegrations } from '../composables/useIntegrations'

/**
 * Named route middleware for plugin pages that only users who installed
 * the plugin may open:
 *
 *   definePageMeta({ middleware: 'integration', integration: '@mframework/my-plugin' })
 *
 * Others are sent to that plugin's integration page, where they can install it.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const plugin = to.meta.integration
  if (typeof plugin !== 'string' || !plugin) return
  const { isInstalled, refresh, catalogPath } = useIntegrations()
  await refresh()
  if (!isInstalled(plugin)) return navigateTo(`${catalogPath.replace(/\/+$/, '')}/${integrationSlug(plugin)}`)
})
