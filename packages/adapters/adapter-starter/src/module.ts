import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit'
import { loadEnv } from './env'
// Module options TypeScript interface definition
export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'my-module',
    configKey: 'myModule',
  },
  // Default configuration options of the Nuxt module
  defaults: {
    enabled: true
  },
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const env = loadEnv(nuxt.options.runtimeConfig)

    // Expose env to Nitro runtime
    nuxt.options.runtimeConfig.mybackend = env
    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolver.resolve('./runtime/plugin'))
  },
})
