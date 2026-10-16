import { computed } from 'vue'
import type { InstalledIntegrationsResponse, MeeoviIntegrationsPublicConfig } from '../types'

const KEY = 'meeovi-integrations:installed'

/** URL slug for a plugin package: '@mframework/list-type-kanban' → 'list-type-kanban'. */
export const integrationSlug = (plugin: string) => plugin.replace(/^@[^/]+\//, '')

/**
 * The signed-in user's installed integrations (shared across components;
 * SSR forwards the visitor's cookie), plus install / uninstall by slug or
 * package name.
 *
 *   const { isInstalled } = useIntegrations()
 *   isInstalled('@mframework/list-type-kanban')
 */
export function useIntegrations() {
  const config = useRuntimeConfig().public.meeoviIntegrations as MeeoviIntegrationsPublicConfig | undefined
  const apiBase = config?.apiBase || '/api/integrations'
  const request = useRequestFetch()

  const { data, status, refresh } = useAsyncData<InstalledIntegrationsResponse>(
    KEY,
    () => request<InstalledIntegrationsResponse>(`${apiBase}/installed`).catch(() => ({ plugins: [] })),
    { default: () => ({ plugins: [] }) },
  )

  const plugins = computed(() => data.value?.plugins ?? [])
  const isInstalled = (plugin: string) => plugins.value.includes(plugin)

  async function install(plugin: string) {
    await $fetch(`${apiBase}/${encodeURIComponent(integrationSlug(plugin))}/install`, { method: 'POST' })
    await refreshNuxtData(KEY)
  }

  async function uninstall(plugin: string) {
    await $fetch(`${apiBase}/${encodeURIComponent(integrationSlug(plugin))}/install`, { method: 'DELETE' })
    await refreshNuxtData(KEY)
  }

  return {
    apiBase,
    catalogPath: config?.catalogPath || '/workspace/integration',
    plugins,
    pending: computed(() => status.value === 'pending'),
    isInstalled,
    install,
    uninstall,
    refresh,
  }
}
