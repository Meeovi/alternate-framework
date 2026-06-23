import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { defu } from 'defu'
import { defineNuxtModule, addImportsDir } from '@nuxt/kit'
import { joinURL } from 'ufo'
import type { DirectusQueryParams } from './runtime/types/index'

export type * from './runtime/types/index'

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
    configKey: 'directus',
    compatibility: { nuxt: '>=4.0.0' },
  },

  defaults: {
    url: process.env.DIRECTUS_URL,
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

    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    nuxt.options.build.transpile.push(runtimeDir)

    addImportsDir(resolve(runtimeDir, 'composables'))

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