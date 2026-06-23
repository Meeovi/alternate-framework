import * as authModule from './src/auth/index.js'
import * as commerceModule from './src/commerce/index.js'
import * as searchModule from './src/search/index.js'
import * as contentModule from './src/content/index.js'
import * as federationModule from './src/federation/index.js'
import * as gatewayModule from './src/gateway/index.js'
import * as contractsModule from './src/contracts/index.js'
import * as notificationsModule from './src/notifications/index.js'
import * as localizationModule from './src/localization/index.js'
import { createGateway, createGatewayRegistry } from './src/gateway/index.js'
import { $fetch } from 'ofetch'

export const sdk: Record<string, any> = {
	auth: {},
	commerce: {},
	search: {},
	content: {},
	federation: {},
	gateway: gatewayModule,
	contracts: contractsModule,
	notifications: notificationsModule,
	localization: localizationModule,
	media: {},
	notify: notificationsModule,
}

function normalizeDirectusParams(params: Record<string, any> = {}): Record<string, any> {
  const query = { ...params }
  if (query.filter && typeof query.filter === 'object') {
    query.filter = JSON.stringify(query.filter)
  }
  if (query.deep && typeof query.deep === 'object') {
    query.deep = JSON.stringify(query.deep)
  }
  return query
}

function createDirectusClient(url: string, staticToken?: string): any {
  return {
    readItems: async (collection: string, params: Record<string, any> = {}) => {
      const response = await $fetch<{ data?: any[] }>(`${url}/items/${collection}`, {
        method: 'GET',
        query: normalizeDirectusParams(params),
        headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
      })
      return Array.isArray(response?.data) ? response.data : []
    },
    getItem: async (collection: string, id: string | number, params: Record<string, any> = {}) => {
      const response = await $fetch<{ data?: any }>(`${url}/items/${collection}/${id}`, {
        method: 'GET',
        query: normalizeDirectusParams(params),
        headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
      })
      return response?.data || null
    },
    readItem: async (collection: string, id: string | number, params: Record<string, any> = {}) => {
      const response = await $fetch<{ data?: any }>(`${url}/items/${collection}/${id}`, {
        method: 'GET',
        query: normalizeDirectusParams(params),
        headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
      })
      return response?.data || null
    },
    readFieldsByCollection: async (collection: string, params: Record<string, any> = {}) => {
      const response = await $fetch<{ data?: any[] }>(`${url}/fields/${collection}`, {
        method: 'GET',
        query: normalizeDirectusParams(params),
        headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
      })
      return Array.isArray(response?.data) ? response.data : []
    },
    createItem: async (collection: string, payload: Record<string, any>) => {
      const response = await $fetch<{ data?: any }>(`${url}/items/${collection}`, {
        method: 'POST',
        body: payload,
        headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
      })
      return response?.data || null
    },
    createItems: async (collection: string, items: Record<string, any>[]) => {
      const response = await $fetch<{ data?: any[] }>(`${url}/items/${collection}`, {
        method: 'POST',
        body: items,
        headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
      })
      return response?.data || []
    },
    updateItem: async (collection: string, id: string | number, payload: Record<string, any> = {}) => {
      const response = await $fetch<{ data?: any }>(`${url}/items/${collection}/${id}`, {
        method: 'PATCH',
        body: payload,
        headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
      })
      return response?.data || null
    },
    updateItems: async (collection: string, keysOrQuery: any, item: Record<string, any> = {}) => {
      let body: any
      if (Array.isArray(keysOrQuery)) {
        body = { keys: keysOrQuery, data: item }
      } else if (typeof keysOrQuery === 'object' && keysOrQuery !== null) {
        body = { query: keysOrQuery, data: item }
      } else {
        body = item
      }
      const response = await $fetch<{ data?: any[] }>(`${url}/items/${collection}`, {
        method: 'PATCH',
        body,
        headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
      })
      return response?.data || []
    },
    deleteItem: async (collection: string, id: string | number) => {
      await $fetch(`${url}/items/${collection}/${id}`, {
        method: 'DELETE',
        headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
      })
      return true
    },
    deleteItems: async (collection: string, keysOrQuery: any) => {
      const body = Array.isArray(keysOrQuery)
        ? { keys: keysOrQuery }
        : keysOrQuery
      await $fetch(`${url}/items/${collection}`, {
        method: 'DELETE',
        body,
        headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
      })
      return true
    },
    uploadFiles: async (formData: FormData) => {
      const response = await $fetch<{ data?: any }>(`${url}/files`, {
        method: 'POST',
        body: formData,
        headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
      })
      return response?.data || null
    },
    readUsers: async (params: Record<string, any> = {}) => {
      const response = await $fetch<{ data?: any[] }>(`${url}/users`, {
        method: 'GET',
        query: normalizeDirectusParams(params),
        headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
      })
      return response?.data || []
    },
    readUser: async (id: string | number, params: Record<string, any> = {}) => {
      const response = await $fetch<{ data?: any }>(`${url}/users/${id}`, {
        method: 'GET',
        query: normalizeDirectusParams(params),
        headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
      })
      return response?.data || null
    },
    readRoles: async (params: Record<string, any> = {}) => {
      const response = await $fetch<{ data?: any[] }>(`${url}/roles`, {
        method: 'GET',
        query: normalizeDirectusParams(params),
        headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
      })
      return response?.data || []
    },
    readRole: async (id: string | number, params: Record<string, any> = {}) => {
      const response = await $fetch<{ data?: any }>(`${url}/roles/${id}`, {
        method: 'GET',
        query: normalizeDirectusParams(params),
        headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
      })
      return response?.data || null
    },
    readFolders: async (params: Record<string, any> = {}) => {
      const response = await $fetch<{ data?: any[] }>(`${url}/folders`, {
        method: 'GET',
        query: normalizeDirectusParams(params),
        headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
      })
      return response?.data || []
    },
    readFolder: async (id: string | number, params: Record<string, any> = {}) => {
      const response = await $fetch<{ data?: any }>(`${url}/folders/${id}`, {
        method: 'GET',
        query: normalizeDirectusParams(params),
        headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
      })
      return response?.data || null
    },
    readFiles: async (params: Record<string, any> = {}) => {
      const response = await $fetch<{ data?: any[] }>(`${url}/files`, {
        method: 'GET',
        query: normalizeDirectusParams(params),
        headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
      })
      return response?.data || []
    },
    readFile: async (id: string | number, params: Record<string, any> = {}) => {
      const response = await $fetch<{ data?: any }>(`${url}/files/${id}`, {
        method: 'GET',
        query: normalizeDirectusParams(params),
        headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
      })
      return response?.data || null
    },
    readFlows: async (params: Record<string, any> = {}) => {
      const response = await $fetch<{ data?: any[] }>(`${url}/flows`, {
        method: 'GET',
        query: normalizeDirectusParams(params),
        headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
      })
      return response?.data || []
    },
    readFlow: async (id: string | number, params: Record<string, any> = {}) => {
      const response = await $fetch<{ data?: any }>(`${url}/flows/${id}`, {
        method: 'GET',
        query: normalizeDirectusParams(params),
        headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
      })
      return response?.data || null
    },
    readShares: async (params: Record<string, any> = {}) => {
      const response = await $fetch<{ data?: any[] }>(`${url}/shares`, {
        method: 'GET',
        query: normalizeDirectusParams(params),
        headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
      })
      return response?.data || []
    },
    readShare: async (id: string | number, params: Record<string, any> = {}) => {
      const response = await $fetch<{ data?: any }>(`${url}/shares/${id}`, {
        method: 'GET',
        query: normalizeDirectusParams(params),
        headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
      })
      return response?.data || null
    },
    readPanels: async (params: Record<string, any> = {}) => {
      const response = await $fetch<{ data?: any[] }>(`${url}/panels`, {
        method: 'GET',
        query: normalizeDirectusParams(params),
        headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
      })
      return response?.data || []
    },
    readPanel: async (id: string | number, params: Record<string, any> = {}) => {
      const response = await $fetch<{ data?: any }>(`${url}/panels/${id}`, {
        method: 'GET',
        query: normalizeDirectusParams(params),
        headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
      })
      return response?.data || null
    },
    getAssetUrl: (file: any) => {
      const fileId = file?.id || file?.directus_files_id?.id || file?.filename_disk || file
      if (!url || !fileId) return ''
      return `${url}/assets/${fileId}`
    },
    request: async (path: string, options: Record<string, any> = {}) => {
      return $fetch(`${url}${path}`, {
        headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
        ...options,
      })
    },
  }
}

export function initGateway(nuxtApp: any) {
  try {
    const registry = createGatewayRegistry()

    // Register the directus adapter factory directly
    registry.register('content', 'directus', (config: any) => {
      return createDirectusClient(config.url, config.token)
    })

    const publicConfig = (nuxtApp.$config?.public || {}) as Record<string, any>
    const gatewayConfig: Record<string, any> = {}

    const directus = publicConfig.directus
    if (directus?.url) {
      gatewayConfig.content = {
        provider: 'directus',
        url: directus.url,
        token: directus.token || directus.staticToken || directus.auth?.token,
      }
    }

    const gateway = createGateway(gatewayConfig, registry)
    if (gateway.content) sdk.content = gateway.content
    if (gateway.auth) sdk.auth = gateway.auth
    if (gateway.commerce) sdk.commerce = gateway.commerce
    if (gateway.search) sdk.search = gateway.search
    if (gateway.federation) sdk.federation = gateway.federation
    if (gateway.notifications) sdk.notifications = gateway.notifications
    if (gateway.localization) sdk.localization = gateway.localization
    if (gateway.media) sdk.media = gateway.media
  } catch {}
}

export {
	authModule as auth,
	commerceModule as commerce,
	searchModule as search,
	contentModule as content,
	federationModule as federation,
	gatewayModule as gateway,
	contractsModule as contracts,
	notificationsModule as notifications,
	localizationModule as localization,
}

// Re-export server auth utilities
export { getServerAuth } from './src/auth/server.js'