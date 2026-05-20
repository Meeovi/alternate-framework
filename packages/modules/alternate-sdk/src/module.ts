import { defineNuxtModule, addImports, addImportsDir, createResolver } from '@nuxt/kit'

// Module options TypeScript interface definition
export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'alternate-sdk',
    configKey: 'alternateSdk',
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)

    addImportsDir(resolver.resolve('./runtime/composables'))
    addImports([
      {
        from: resolver.resolve('./runtime/composables/useContentAdapter'),
        name: 'default',
        as: 'useSdkContentAdapter',
      },
      {
        from: resolver.resolve('./runtime/composables/useCommerceAdapter'),
        name: 'default',
        as: 'useSdkCommerceAdapter',
      },
      {
        from: resolver.resolve('./runtime/composables/useAuthAdapter'),
        name: 'default',
        as: 'useSdkAuthAdapter',
      },
      {
        from: resolver.resolve('./runtime/composables/useSearchAdapter'),
        name: 'default',
        as: 'useSdkSearchAdapter',
      },
      {
        from: resolver.resolve('./runtime/composables/useFederationAdapter'),
        name: 'default',
        as: 'useSdkFederationAdapter',
      },
    ])
  },
})
