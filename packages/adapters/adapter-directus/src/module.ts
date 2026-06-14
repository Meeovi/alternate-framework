import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { defu } from 'defu'
import { defineNuxtModule, addImportsDir } from '@nuxt/kit'
import { joinURL } from 'ufo'
import { $fetch } from 'ofetch'
import type { DirectusQueryParams } from './runtime/types'

export type * from './runtime/types'

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

function createDirectusClient(config: { url?: string, staticToken?: string } = {}): any {
  const { url, staticToken } = config
  const directusUrl = url

  if (!directusUrl) {
    throw new Error('Directus URL is required')
  }

  return {
    readItems: async (collection: string, params: Record<string, any> = {}) => {
      const response = await $fetch<{ data?: any[] }>(`${directusUrl}/items/${collection}`, {
        method: 'GET',
        query: normalizeDirectusParams(params),
        headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
      })
      return Array.isArray(response?.data) ? response.data : []
    },
    readItem: async (collection: string, id: string | number, params: Record<string, any> = {}) => {
      const response = await $fetch<{ data?: any }>(`${directusUrl}/items/${collection}/${id}`, {
        method: 'GET',
        query: normalizeDirectusParams(params),
        headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
      })
      return response?.data || null
    },
    readFieldsByCollection: async (collection: string, params: Record<string, any> = {}) => {
      const response = await $fetch<{ data?: any[] }>(`${directusUrl}/fields/${collection}`, {
        method: 'GET',
        query: normalizeDirectusParams(params),
        headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
      })
      return Array.isArray(response?.data) ? response.data : []
    },
    createItem: async (collection: string, payload: Record<string, any>) => {
      const response = await $fetch<{ data?: any }>(`${directusUrl}/items/${collection}`, {
        method: 'POST',
        body: payload,
        headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
      })
      return response?.data || null
    },
    updateItem: async (collection: string, id: string | number, payload: Record<string, any> = {}) => {
      const response = await $fetch<{ data?: any }>(`${directusUrl}/items/${collection}/${id}`, {
        method: 'PATCH',
        body: payload,
        headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
      })
      return response?.data || null
    },
    deleteItem: async (collection: string, id: string | number) => {
      await $fetch(`${directusUrl}/items/${collection}/${id}`, {
        method: 'DELETE',
        headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
      })
      return true
    },
    uploadFiles: async (formData: FormData) => {
      const response = await $fetch<{ data?: any }>(`${directusUrl}/files`, {
        method: 'POST',
        body: formData,
        headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
      })
      return response?.data || null
    },
    getAssetUrl: (file: any) => {
      const fileId = file?.id || file?.directus_files_id?.id || file?.filename_disk || file
      if (!directusUrl || !fileId) return ''
      return `${directusUrl}/assets/${fileId}`
    },
    request: async (path: string, options: Record<string, any> = {}) => {
      return $fetch(`${directusUrl}${path}`, {
        headers: staticToken ? { Authorization: `Bearer ${staticToken}` } : {},
        ...options,
      })
    },
  }
}

export interface ModuleOptions {
  url?: string
  autoFetch?: boolean
  autoRefresh?: boolean
  onAutoRefreshFailure?: () => Promise<void>
  fetchUserParams?: DirectusQueryParams
  token?: string
  devtools?: boolean
  cookieNameToken?: string
  cookieNameRefreshToken?: string
  cookieMaxAge?: number
  cookieSameSite?: 'strict' | 'lax' | 'none' | undefined
  cookieSecure?: boolean
}

interface AdapterRegistry {
  register: (kind: string, name: string, factory: (config: any) => any) => void
}

interface DevtoolsTab {
  name: string
  title: string
  icon?: string
  view: {
    type: 'iframe' | string
    src: string
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@mframework/adapter-directus',
    configKey: 'adapterDirectus',
    compatibility: { nuxt: '>=4.0.0' },
  },

  defaults: {
    url: process.env.NUXT_PUBLIC_DIRECTUS_URL,
    autoFetch: true,
    autoRefresh: false,
    devtools: false,
    cookieNameToken: 'directus_token',
    cookieNameRefreshToken: 'directus_refresh_token',
    cookieMaxAge: 604800000,
    cookieSameSite: 'lax',
    cookieSecure: false,
  },

  setup(options, nuxt) {
    // -----------------------------
    // 1. Fix runtimeConfig typing
    // -----------------------------
    const publicRuntimeConfig = nuxt.options.runtimeConfig.public as Record<string, unknown>
    const publicConfig = (publicRuntimeConfig.directus ??= {}) as Partial<ModuleOptions>

    publicRuntimeConfig.directus = defu(publicConfig, {
      url: options.url,
      autoFetch: options.autoFetch,
      autoRefresh: options.autoRefresh,
      onAutoRefreshFailure: options.onAutoRefreshFailure,
      fetchUserParams: options.fetchUserParams,
      token: options.token,
      devtools: options.devtools,
      cookieNameToken: options.cookieNameToken,
      cookieNameRefreshToken: options.cookieNameRefreshToken,
      cookieMaxAge: options.cookieMaxAge,
      cookieSameSite: options.cookieSameSite,
      cookieSecure: options.cookieSecure,
    }) as ModuleOptions

    // -----------------------------
    // 2. Transpile runtime
    // -----------------------------
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    nuxt.options.build.transpile.push(runtimeDir)

    // -----------------------------
    // 3. Expose composables
    // -----------------------------
    addImportsDir(resolve(runtimeDir, 'composables'))

// -----------------------------
    // 4. Register adapter dynamically
    // -----------------------------
    ;(nuxt as any).hook('alternate:registerAdapter', (registry: AdapterRegistry) => {
      registry.register('content', 'directus', (config: any) => {
        return createDirectusClient({ url: options.url, staticToken: options.token })
      })
    })

    // -----------------------------
    // 5. Devtools integration
    // -----------------------------
    if (options.devtools) {
      const directusConfig = publicRuntimeConfig.directus as ModuleOptions
      const adminUrl = joinURL(directusConfig.url || '', '/admin/')

      ;(nuxt as any).hook('devtools:customTabs', (tabs: DevtoolsTab[]) => {
        tabs.push({
          name: 'directus',
          title: 'Directus',
          icon: 'simple-icons:directus',
          view: { type: 'iframe', src: adminUrl },
        })
      })
    }
  },
})


// ---------------------------------------------------------
// Nuxt Type Augmentation (fixed, no duplicate declarations)
// ---------------------------------------------------------
declare module '@nuxt/schema' {
  interface NuxtHooks {
    'alternate:registerAdapter': (registry: any) => void
    'devtools:customTabs': (tabs: any[]) => void
  }

  interface PublicRuntimeConfig {
    directus?: ModuleOptions
  }
}
