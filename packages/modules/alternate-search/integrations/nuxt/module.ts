import { defineNuxtModule, addServerHandler, createResolver } from '@nuxt/kit'

export interface AlternateSearchNuxtModuleOptions {
  enableStarterRoutes?: boolean
  routePrefix?: string
}

export default defineNuxtModule<AlternateSearchNuxtModuleOptions>({
  meta: {
    name: 'alternate-search-starter-routes-module',
    configKey: 'alternateSearchStarterRoutes',
    compatibility: {
      nuxt: '>=4.0.0',
    },
  },
  defaults: {
    enableStarterRoutes: true,
    routePrefix: '/api/search',
  },
  setup(options) {
    if (!options.enableStarterRoutes) return

    const resolver = createResolver(import.meta.url)
    const prefix = (options.routePrefix || '/api/search').replace(/\/$/, '')

    addServerHandler({
      route: `${prefix}/:index`,
      handler: resolver.resolve('./starter/handlers/search-index'),
    })

    addServerHandler({
      route: `${prefix}/multi/:index`,
      handler: resolver.resolve('./starter/handlers/search-multi-index'),
    })
  },
})
