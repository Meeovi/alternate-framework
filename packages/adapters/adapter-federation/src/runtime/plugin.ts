import { createActivitypubClient } from './client'

export default (nuxtApp: any) => {
  const config: any = typeof useRuntimeConfig === 'function' ? useRuntimeConfig() : (globalThis as any).__meeovi_runtime_config || {}
  const base = config?.public?.activitypub?.server
  const client = createActivitypubClient(base)
  if (nuxtApp && typeof nuxtApp.provide === 'function') {
    nuxtApp.provide('activitypub', client)
  } else {
    ;(globalThis as any).__meeovi_activitypub_client = client
  }
}
