import { defineNuxtModule, addPlugin, createResolver, addComponentsDir, addImportsDir, addServerHandler } from '@nuxt/kit'

export interface ExperienceBuilderOptions {
  /** Base path for API routes, e.g. /api/experience-pages */
  apiBase?: string
  /** Enable built-in Nitro repository (can be disabled if you wire your own) */
  enableDefaultRepository?: boolean
}

export default defineNuxtModule<ExperienceBuilderOptions>({
  meta: {
    name: 'experience-builder',
    configKey: 'experienceBuilder'
  },
  defaults: {
    apiBase: '/api/experience-pages',
    enableDefaultRepository: true
  },
  setup (options, nuxt) {
    const resolver = createResolver(import.meta.url)

    nuxt.options.alias['#experience-builder'] = resolver.resolve('runtime')
    nuxt.options.alias['#experience-builder/'] = resolver.resolve('runtime') + '/'

    // GrapesJS plugin
    addPlugin(resolver.resolve('runtime/plugins/grapesjs.client'))

    // Components
    addComponentsDir({
      path: resolver.resolve('runtime/components'),
      pathPrefix: false
    })

    // Composables
    addImportsDir(resolver.resolve('runtime/composables'))

    // Server handlers (API)
    const base = options.apiBase?.replace(/\/+$/, '') || '/api/experience-pages'

    addServerHandler({
      route: `${base}/:entityType/:entityId/:slug`,
      method: 'get',
      handler: resolver.resolve('server/api/experience-pages/[entityType]/[entityId]/[slug].get')
    })

    addServerHandler({
      route: `${base}/:entityType/:entityId/:slug`,
      method: 'post',
      handler: resolver.resolve('server/api/experience-pages/[entityType]/[entityId]/[slug].post')
    })

    addServerHandler({
      route: `${base}/:entityType/:entityId/:slug`,
      method: 'delete',
      handler: resolver.resolve('server/api/experience-pages/[entityType]/[entityId]/[slug].delete')
    })

    // Provide runtime config
    nuxt.options.runtimeConfig.public.experienceBuilder = {
      apiBase: options.apiBase
    }
  }
})
