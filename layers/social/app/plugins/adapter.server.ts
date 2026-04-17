import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'
import { createMeeoviDirectusClient } from '@mframework/adapter-directus'
import { staticToken } from '@directus/sdk'

function createAdapter(url: string, token?: string) {
  const sdk = createMeeoviDirectusClient<any>(url)
  const client = token ? (sdk.client as any).with(staticToken(token)) : sdk.client

  const adapter = {
    request: (query: any) => client.request(query),
    readItems: (collection: string, opts?: any) => client.request(sdk.readItems(collection as any, opts)),
    readItem: (collection: string, id: string | number, opts?: any) => client.request(sdk.readItem(collection as any, id as any, opts)),
    readFieldsByCollection: (collection: string) => client.request(sdk.readFieldsByCollection(collection as any)),
    createItem: (collection: string, payload: any) => client.request(sdk.createItem(collection as any, payload)),
    updateItem: (collection: string, id: string | number, payload?: any) => client.request(sdk.updateItem(collection as any, id as any, payload)),
    deleteItem: (collection: string, id: string | number) => client.request(sdk.deleteItem(collection as any, id as any)),
    uploadFiles: (files: any) => client.request(sdk.uploadFiles(files)),
    getAssetUrl: (file: any) => {
      const fid = file?.id || file?.directus_files_id?.id || file?.filename_disk || file
      if (!fid) return ''
      return `${url.replace(/\/$/, '')}/assets/${fid}`
    },
  }

  return { adapter, sdk }
}

export default defineNuxtPlugin((nuxtApp) => {
  const existing = (nuxtApp as any).$adapter
  if (existing && typeof existing.readItems === 'function') return {}

  const config = useRuntimeConfig()
  const publicConfig = (config.public as any) || {}
  const directusUrl = String(publicConfig?.directus?.url || publicConfig?.directusUrl || publicConfig?.apiBase || '')
  const directusToken = String(publicConfig?.directus?.staticToken || '')
  if (!directusUrl) return {}

  const { adapter, sdk } = createAdapter(directusUrl, directusToken || undefined)

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
      ...sdk,
      url: directusUrl,
      request: adapter.request,
    }
  }

  if (!Object.keys(provide).length) return {}

  return {
    provide,
  }
})
