import { computed } from 'vue'
import type { InstalledIntegrationsResponse, MeeoviIntegrationsPublicConfig } from '../types'

const KEY = 'meeovi-integrations:installed'

/**
 * The signed-in user's installed integrations (shared across components;
 * SSR forwards the visitor's cookie), plus install / uninstall.
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
    () => request<InstalledIntegrationsResponse>(`${apiBase}/installed`).catch(() => ({ plugins: [], integrations: [] })),
    { default: () => ({ plugins: [], integrations: [] }) },
  )

  const plugins = computed(() => data.value?.plugins ?? [])
  const isInstalled = (plugin: string) => plugins.value.includes(plugin)

  async function install(id: number) {
    await $fetch(`${apiBase}/${id}/install`, { method: 'POST' })
    await refreshNuxtData(KEY)
  }

  async function uninstall(id: number) {
    await $fetch(`${apiBase}/${id}/install`, { method: 'DELETE' })
    await refreshNuxtData(KEY)
  }

  return {
    apiBase,
    plugins,
    integrations: computed(() => data.value?.integrations ?? []),
    pending: computed(() => status.value === 'pending'),
    isInstalled,
    install,
    uninstall,
    refresh,
  }
}
