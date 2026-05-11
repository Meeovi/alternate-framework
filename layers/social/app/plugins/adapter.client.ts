import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'
import { DirectusAdapter } from '@mframework/adapter-directus'

function createAdapter(url: string, token?: string) {
  const adapter = new DirectusAdapter({ url, staticToken: token })
  return { adapter }
}

export default defineNuxtPlugin((nuxtApp) => {
  const existing = (nuxtApp as any).$adapter
  if (existing && typeof existing.readItems === 'function') return {}

  const config = useRuntimeConfig()
  const publicConfig = (config.public as any) || {}
  const directusUrl = String(publicConfig?.directus?.url || publicConfig?.directusUrl || publicConfig?.apiBase || '')
  const directusToken = String(publicConfig?.directus?.staticToken || '')
  if (!directusUrl) return {}

  const { adapter } = createAdapter(directusUrl, directusToken || undefined)
  ;(globalThis as any).__adapter = adapter
  ;(globalThis as any).__directus = { ...adapter, url: directusUrl }

  const canProvide = (key: string) => !(`$${key}` in (nuxtApp as any))
  const provide: Record<string, any> = {}
  if (canProvide('adapter')) provide.adapter = adapter
  if (canProvide('contentClient')) provide.contentClient = adapter
  if (canProvide('readItems')) provide.readItems = adapter.readItems
  if (canProvide('readItem')) provide.readItem = adapter.readItem
  if (canProvide('readFieldsByCollection')) provide.readFieldsByCollection = adapter.readFieldsByCollection
  if (canProvide('createItem')) provide.createItem = adapter.createItem
  if (canProvide('updateItem')) provide.updateItem = adapter.updateItem
  if (canProvide('deleteItem')) provide.deleteItem = adapter.deleteItem
  if (canProvide('uploadFiles')) provide.uploadFiles = adapter.uploadFiles
  if (canProvide('directus')) {
    provide.directus = {
      ...adapter,
      url: directusUrl,
      request: adapter.request,
    }
  }

  if (!Object.keys(provide).length) return {}

  return {
    provide,
  }
})
