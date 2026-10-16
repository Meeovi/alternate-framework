import { computed } from 'vue'
import type { IntegrationDataResponse, MeeoviIntegrationsPublicConfig } from '../types'
import { integrationSlug } from './useIntegrations'

/**
 * The signed-in user's own data for an installed plugin — stored with their
 * install, so it stays theirs and survives uninstall / reinstall.
 *
 *   const { data, save, update } = useIntegrationData('@mframework/my-plugin')
 *   await update({ theme: 'dark' })   // merge
 *   await save({ boards: [] })        // replace
 */
export function useIntegrationData<T extends Record<string, unknown> = Record<string, unknown>>(plugin: string) {
  const config = useRuntimeConfig().public.meeoviIntegrations as MeeoviIntegrationsPublicConfig | undefined
  const url = `${config?.apiBase || '/api/integrations'}/${encodeURIComponent(integrationSlug(plugin))}/data`
  const request = useRequestFetch()

  const { data, status, error, refresh } = useAsyncData<T>(
    `meeovi-integrations:data:${plugin}`,
    async () => (await request<IntegrationDataResponse>(url)).data as T,
    { default: () => ({}) as T },
  )

  async function write(method: 'PUT' | 'PATCH', body: Partial<T>) {
    const res = await $fetch<IntegrationDataResponse>(url, { method, body })
    data.value = res.data as T
    return data.value
  }

  return {
    data,
    pending: computed(() => status.value === 'pending'),
    error,
    refresh,
    /** Replace all of this user's data for the plugin. */
    save: (value: T) => write('PUT', value),
    /** Shallow-merge into this user's data for the plugin. */
    update: (value: Partial<T>) => write('PATCH', value),
  }
}
