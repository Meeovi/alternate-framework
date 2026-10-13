import { useIntegrations } from '../composables/useIntegrations'
import type { MeeoviIntegrationsPublicConfig } from '../types'

/**
 * Named route middleware for plugin pages that only users who installed
 * the plugin may open:
 *
 *   definePageMeta({ middleware: 'integration', integration: '@mframework/my-plugin' })
 *
 * Others are sent to the integrations catalog.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const plugin = to.meta.integration
  if (typeof plugin !== 'string' || !plugin) return
  const { isInstalled, refresh } = useIntegrations()
  await refresh()
  if (!isInstalled(plugin)) {
    const config = useRuntimeConfig().public.meeoviIntegrations as MeeoviIntegrationsPublicConfig | undefined
    return navigateTo({ path: config?.catalogPath || '/workspace/dashboard/integrations', query: { plugin } })
  }
})
