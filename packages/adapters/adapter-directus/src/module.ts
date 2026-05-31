import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { defu } from 'defu'
import { defineNuxtModule, addImportsDir } from '@nuxt/kit'
import { joinURL } from 'ufo'
import type { DirectusQueryParams } from './runtime/types'

export type * from './runtime/types'

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
        const { createDirectusClient } = require('./runtime/composables/useContentRequest')
        return createDirectusClient(config)
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
