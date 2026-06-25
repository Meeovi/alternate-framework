import { defineNuxtModule, addImportsDir, addServerHandler, createResolver } from 'nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'alternate-search',
    configKey: 'alternateSearch'
  },

  setup(_, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Expose composables
    addImportsDir(resolver.resolve('./src/runtime/composables'))

    // Expose utils (optional)
    addImportsDir(resolver.resolve('./src/runtime/utils'))

    addServerHandler({
      route: '/api/search',
      handler: resolver.resolve('./src/runtime/server/api/search.ts')
    })
  }
})
