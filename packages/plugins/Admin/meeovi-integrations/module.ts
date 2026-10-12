import {
  defineNuxtModule,
  createResolver,
  addComponentsDir,
  addImportsDir,
  addRouteMiddleware,
  addServerHandler,
} from '@nuxt/kit'
import type { MeeoviIntegrationsModuleOptions } from './runtime/types'

export type { MeeoviIntegrationsModuleOptions } from './runtime/types'
export * from './runtime/types'

const env = process.env

export default defineNuxtModule<MeeoviIntegrationsModuleOptions>({
  meta: {
    name: 'meeovi-integrations',
    configKey: 'meeoviIntegrations',
    compatibility: {
      nuxt: '^4.0.0',
    },
  },

  defaults: {
    apiBase: '/api/integrations',
    sessionEndpoint: '/api/auth/get-session',
    catalogCollection: 'integrations',
    installsCollection: 'integration_installs',
    catalogPath: '/dashboard/integrations',
    directus: {
      url: env.MEEOVI_INTEGRATIONS_DIRECTUS_URL || env.DIRECTUS_URL,
      token: env.MEEOVI_INTEGRATIONS_DIRECTUS_TOKEN || env.NUXTUS_DIRECTUS_STATIC_TOKEN,
    },
  },

  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const apiBase = (options.apiBase || '/api/integrations').replace(/\/+$/, '')

    nuxt.options.alias['#meeovi-integrations'] = resolver.resolve('runtime')
    nuxt.options.alias['#meeovi-integrations/'] = resolver.resolve('runtime') + '/'

    // <IntegrationGate>, useIntegrations() and the `integration` middleware
    addComponentsDir({ path: resolver.resolve('runtime/components'), pathPrefix: false })
    addImportsDir(resolver.resolve('runtime/composables'))
    addRouteMiddleware({ name: 'integration', path: resolver.resolve('runtime/middleware/integration') })

    addServerHandler({ route: apiBase, method: 'get', handler: resolver.resolve('server/api/catalog.get') })
    addServerHandler({ route: `${apiBase}/installed`, method: 'get', handler: resolver.resolve('server/api/installed.get') })
    addServerHandler({ route: `${apiBase}/:id/install`, method: 'post', handler: resolver.resolve('server/api/install.post') })
    addServerHandler({ route: `${apiBase}/:id/install`, method: 'delete', handler: resolver.resolve('server/api/install.delete') })

    // Private — the Directus token never reaches the client bundle.
    const runtimeConfig = nuxt.options.runtimeConfig as Record<string, any>
    runtimeConfig.meeoviIntegrations = {
      ...(runtimeConfig.meeoviIntegrations as Record<string, unknown> || {}),
      sessionEndpoint: options.sessionEndpoint || '/api/auth/get-session',
      catalogCollection: options.catalogCollection || 'integrations',
      installsCollection: options.installsCollection || 'integration_installs',
      directus: { ...options.directus },
    }

    nuxt.options.runtimeConfig.public.meeoviIntegrations = {
      ...(nuxt.options.runtimeConfig.public.meeoviIntegrations as Record<string, unknown> || {}),
      apiBase,
      catalogPath: options.catalogPath || '/dashboard/integrations',
      catalogUrl: options.catalogUrl || '',
    }
  },
})
