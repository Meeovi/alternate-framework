import {
  defineNuxtModule,
  addPlugin,
  createResolver,
  addImportsDir
} from '@nuxt/kit'

export interface MApiClientModuleOptions {
  endpoint?: string
}

export default defineNuxtModule<MApiClientModuleOptions>({
  meta: {
    name: '@mframework/api-client',
    configKey: 'mApi'
  },

  defaults: {
    endpoint: '/api/graphql'
  },

  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    nuxt.options.runtimeConfig.public.mApiEndpoint =
      options.endpoint || '/api/graphql'

    addPlugin(resolver.resolve('./runtime/plugin.server'))
    addPlugin(resolver.resolve('./runtime/plugin.client'))

    addImportsDir(resolver.resolve('./runtime/composables'))
  }
})
